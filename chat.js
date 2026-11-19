// Talk to an agent from the UI by resuming its Claude Code session headlessly (`claude -p --resume <id>`).
// - Closed sessions are resumed in place (the reply is appended to the real session).
// - Sessions that are running somewhere else (VS Code / Orca) are forked, so we never write into a live transcript.
// - The folder (cwd) always comes from our own scan; the client only sends the agent id, the message and a mode.
const { spawn } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const MAX_MESSAGE = 8000, MAX_BUDGET_USD = '2', TIMEOUT_MS = 10 * 60 * 1000, MAX_RESUME_MB = 100;
const DATA_DIR = path.join(__dirname, 'data'), CHATS_FILE = path.join(DATA_DIR, 'chats.json');

let chats = {};          // agent id -> { sessionId, forked, updatedAt }
try { chats = JSON.parse(fs.readFileSync(CHATS_FILE, 'utf8')); } catch { chats = {}; }
const save = () => { fs.mkdirSync(DATA_DIR, { recursive: true }); fs.writeFileSync(CHATS_FILE, JSON.stringify(chats, null, 1)); };
const forkIds = () => Object.values(chats).filter(c => c.forked && c.sessionId).map(c => c.sessionId);

function claudeBin() {
  const cands = [process.env.CLAUDE_BIN, path.join(os.homedir(), '.local', 'bin', 'claude.exe'), path.join(os.homedir(), '.local', 'bin', 'claude')].filter(Boolean);
  return cands.find(p => { try { return fs.statSync(p).isFile(); } catch { return false; } }) || 'claude';
}

const active = new Map();   // agent id -> child process (one conversation turn at a time per agent)

function killTree(child) {
  try {
    if (process.platform === 'win32') spawn('taskkill', ['/pid', String(child.pid), '/T', '/F'], { windowsHide: true });
    else child.kill('SIGTERM');
  } catch { /* already gone */ }
}

const brief = (input) => {
  const i = input || {};
  const f = i.file_path || i.path || i.notebook_path;
  if (f) return path.basename(String(f));
  return String(i.command || i.pattern || i.description || i.query || i.url || '').replace(/\s+/g, ' ').slice(0, 60);
};

function info(agent) {
  const c = chats[agent.id];
  const supported = agent.kind === 'claude' && !agent.guard;
  const mb = (agent.sizeKB || 0) / 1024;
  return {
    supported, reason: supported ? null : 'Hanya agent Claude Code yang bisa diajak ngobrol dari sini.',
    live: !!agent.live, forked: !!(c && c.forked), willFork: !!agent.live && !(c && c.forked), sizeMB: Math.round(mb), tooLarge: mb > MAX_RESUME_MB && !(c && c.forked),
    busy: active.has(agent.id), sessionId: c ? c.sessionId : agent.id,
  };
}

// onEvent receives plain objects; returns { stop() } or throws { status, message }
function startChat({ agent, message, mode = 'safe', branch = false }, onEvent, onDone) {
  const inf = info(agent);
  if (!inf.supported) throw { status: 400, message: inf.reason };
  if (active.has(agent.id)) throw { status: 409, message: 'Agent ini sedang membalas, tunggu sebentar.' };
  if (active.size >= 2) throw { status: 429, message: 'Terlalu banyak percakapan berjalan bersamaan.' };
  if (inf.tooLarge) throw { status: 413, message: `Riwayat sesi ini sangat besar (${inf.sizeMB} MB), melanjutkannya akan sangat lambat dan mahal.` };
  const text = String(message || '').trim().slice(0, MAX_MESSAGE);
  if (!text) throw { status: 400, message: 'Pesan kosong.' };
  let cwd = agent.cwd; try { if (!fs.statSync(cwd).isDirectory()) throw 0; } catch { throw { status: 400, message: 'Folder kerja agent tidak ditemukan.' }; }

  const c = chats[agent.id], target = c && c.sessionId ? c.sessionId : agent.id;
  const fork = !(c && c.forked) && (agent.live || branch);
  const args = ['-p', '--output-format', 'stream-json', '--verbose', '--include-partial-messages',
    '--permission-mode', mode === 'edit' ? 'acceptEdits' : 'default', '--max-budget-usd', MAX_BUDGET_USD,
    '--resume', target, ...(fork ? ['--fork-session'] : []),
    '--append-system-prompt', 'Kamu sedang diajak mengobrol lewat antarmuka kantor "Agent World". Jawab singkat dan jelas dalam bahasa pengguna. Jika tindakan butuh izin yang belum diberikan, katakan apa yang kamu butuhkan.'];
  const child = spawn(claudeBin(), args, { cwd, windowsHide: true, stdio: ['pipe', 'pipe', 'pipe'] });
  active.set(agent.id, child);
  child.stdin.on('error', () => {}); child.stdin.end(text);

  let buf = '', err = '', finished = false, sessionId = target, seenTools = new Set(), gotResult = false;
  const finish = (ev) => { if (finished) return; finished = true; clearTimeout(timer); active.delete(agent.id); if (ev) onEvent(ev); onDone && onDone(); };
  const timer = setTimeout(() => { killTree(child); finish({ type: 'error', message: 'Waktu habis (10 menit).' }); }, TIMEOUT_MS);

  const handle = (o) => {
    if (o.session_id && o.session_id !== sessionId) sessionId = o.session_id;
    if (o.type === 'system' && o.subtype === 'init') {
      chats[agent.id] = { sessionId, forked: !!(fork || (c && c.forked)), updatedAt: Date.now() }; save();
      onEvent({ type: 'init', sessionId, forked: chats[agent.id].forked, resumedInPlace: !chats[agent.id].forked });
    } else if (o.type === 'stream_event' && o.event && o.event.type === 'content_block_delta' && o.event.delta && o.event.delta.type === 'text_delta') {
      onEvent({ type: 'delta', text: o.event.delta.text });
    } else if (o.type === 'assistant' && o.message && Array.isArray(o.message.content)) {
      for (const b of o.message.content) if (b && b.type === 'tool_use' && !seenTools.has(b.id)) { seenTools.add(b.id); onEvent({ type: 'tool', name: String(b.name), target: brief(b.input) }); }
    } else if (o.type === 'result') {
      gotResult = true;
      chats[agent.id] = { sessionId: o.session_id || sessionId, forked: !!(fork || (c && c.forked)), updatedAt: Date.now() }; save();
      finish({ type: 'result', text: String(o.result || ''), isError: !!o.is_error, cost: o.total_cost_usd || 0, turns: o.num_turns || 0,
        denials: (o.permission_denials || []).map(d => ({ tool: String(d.tool_name || ''), target: brief(d.tool_input) })) });
    }
  };
  child.stdout.on('data', d => { buf += d; let i; while ((i = buf.indexOf('\n')) >= 0) { const line = buf.slice(0, i).trim(); buf = buf.slice(i + 1); if (line) { try { handle(JSON.parse(line)); } catch { /* non-JSON noise */ } } } });
  child.stderr.on('data', d => { err = (err + d).slice(-800); });
  child.on('error', e => finish({ type: 'error', message: 'Gagal menjalankan claude: ' + e.message }));
  child.on('close', code => { if (!gotResult) finish({ type: 'error', message: err.trim() || `claude berhenti (kode ${code}).` }); });
  return { stop() { killTree(child); finish({ type: 'error', message: 'Dihentikan.' }); } };
}

// ---------------------------------------------------------------------------
// Security guard chat: stateless (no session is written to disk, so no phantom agent appears in the office).
// The guard sees the project's static scan report, may READ the code (Read/Grep/Glob only, secret files denied)
// and writes ready-to-paste fix prompts for the project's coding agent.
const SEC_TOOLS = 'Read,Grep,Glob';
const SEC_DENY = ['Read(**/.env*)', 'Read(**/*.pem)', 'Read(**/*.key)', 'Read(**/id_rsa*)', 'Read(**/credentials*)', 'Grep(**/.env*)'];
const NL = String.fromCharCode(10);

function securityBrief(room, report) {
  if (!report || report.skipped) return 'Belum ada laporan pemindaian untuk project ini.';
  const c = report.counts || {};
  const lines = (report.findings || []).slice(0, 40).map((f, i) => (i + 1) + '. [' + String(f.sev).toUpperCase() + '] ' + f.title + ' — ' + f.file + (f.line ? ':' + f.line : '') + (f.snippet ? ' — ' + String.fromCharCode(96) + String(f.snippet).slice(0, 110) + String.fromCharCode(96) : '') + ' — saran: ' + f.advice);
  return 'Ringkasan: ' + (c.high || 0) + ' tinggi, ' + (c.medium || 0) + ' sedang, ' + (c.low || 0) + ' rendah (' + (report.scannedFiles || 0) + ' file dipindai' + (report.truncated ? ', hasil dipotong' : '') + ').' + NL + (lines.join(NL) || 'Tidak ada temuan dari aturan pemindai.');
}

function startSecurityChat({ room, report, message, history = [] }, onEvent, onDone) {
  const key = 'sec:' + room.key;
  if (active.has(key)) throw { status: 409, message: 'Security sedang menjawab, tunggu sebentar.' };
  if (active.size >= 2) throw { status: 429, message: 'Terlalu banyak percakapan berjalan bersamaan.' };
  const text = String(message || '').trim().slice(0, MAX_MESSAGE);
  if (!text) throw { status: 400, message: 'Pesan kosong.' };
  if (report && report.skipped) throw { status: 400, message: report.note || 'Folder ini bukan project.' };
  let cwd = room.path; try { if (!fs.statSync(cwd).isDirectory()) throw 0; } catch { throw { status: 400, message: 'Folder project tidak ditemukan.' }; }

  const sys = [
    'Kamu adalah "Security", penjaga keamanan untuk project "' + room.name + '" (folder kerja: ' + cwd + ') di kantor virtual Agent World.',
    'Tugasmu: (1) menjelaskan dan memprioritaskan temuan celah keamanan, (2) memverifikasi temuan dengan MEMBACA kode jika perlu, (3) menulis PROMPT PERBAIKAN yang siap dilempar ke agent coding project ini.',
    'Aturan: kamu hanya bisa membaca. Jangan mencoba mengubah file. Jangan membaca atau menampilkan file rahasia (.env, kunci privat, kredensial) dan jangan menuliskan nilai rahasia di jawaban. Temuan pemindai adalah heuristik (bisa salah), jadi verifikasi dulu bila ragu atau diminta. Tetap di folder project ini. Jawab ringkas dalam bahasa yang dipakai pengguna.',
    'Format prompt perbaikan: tulis SATU blok kode (tiga backtick) yang mandiri, berisi: konteks singkat project, setiap masalah (file:baris, apa yang salah, perbaikan yang diharapkan), batasan (jangan ubah hal lain, jaga perilaku yang ada, jangan commit), cara memverifikasi (tes atau perintah), dan kriteria selesai. Jangan menaruh nilai rahasia di dalamnya. Setelah blok kode, beri satu kalimat penjelasan singkat.',
    '', 'Laporan pemindaian statis terbaru (nilai rahasia sudah disamarkan):', securityBrief(room, report),
  ].join(NL);

  const past = (Array.isArray(history) ? history : []).slice(-12).map(h => (h && h.r === 'u' ? 'Pengguna: ' : 'Security: ') + String((h && h.t) || '').slice(0, 4000)).join(NL + NL);
  const stdin = (past ? 'Percakapan sebelumnya:' + NL + past + NL + NL : '') + 'Pesan baru dari pengguna:' + NL + text;
  const args = ['-p', '--output-format', 'stream-json', '--verbose', '--include-partial-messages', '--no-session-persistence', '--permission-mode', 'default',
    '--max-budget-usd', '1', '--tools', SEC_TOOLS, '--disallowedTools', ...SEC_DENY, '--append-system-prompt', sys];
  const child = spawn(claudeBin(), args, { cwd, windowsHide: true, stdio: ['pipe', 'pipe', 'pipe'] });
  active.set(key, child); child.stdin.on('error', () => {}); child.stdin.end(stdin);

  let buf = '', err = '', finished = false, gotResult = false; const seen = new Set();
  const finish = (ev) => { if (finished) return; finished = true; clearTimeout(timer); active.delete(key); if (ev) onEvent(ev); onDone && onDone(); };
  const timer = setTimeout(() => { killTree(child); finish({ type: 'error', message: 'Waktu habis (10 menit).' }); }, TIMEOUT_MS);
  const handle = (o) => {
    if (o.type === 'system' && o.subtype === 'init') onEvent({ type: 'init', forked: false, security: true });
    else if (o.type === 'stream_event' && o.event && o.event.type === 'content_block_delta' && o.event.delta && o.event.delta.type === 'text_delta') onEvent({ type: 'delta', text: o.event.delta.text });
    else if (o.type === 'assistant' && o.message && Array.isArray(o.message.content)) { for (const b of o.message.content) if (b && b.type === 'tool_use' && !seen.has(b.id)) { seen.add(b.id); onEvent({ type: 'tool', name: String(b.name), target: brief(b.input) }); } }
    else if (o.type === 'result') { gotResult = true; finish({ type: 'result', text: String(o.result || ''), isError: !!o.is_error, cost: o.total_cost_usd || 0, turns: o.num_turns || 0, denials: (o.permission_denials || []).map(d => ({ tool: String(d.tool_name || ''), target: brief(d.tool_input) })) }); }
  };
  child.stdout.on('data', d => { buf += d; let i; while ((i = buf.indexOf(NL)) >= 0) { const line = buf.slice(0, i).trim(); buf = buf.slice(i + 1); if (line) { try { handle(JSON.parse(line)); } catch { /* noise */ } } } });
  child.stderr.on('data', d => { err = (err + d).slice(-800); });
  child.on('error', e => finish({ type: 'error', message: 'Gagal menjalankan claude: ' + e.message }));
  child.on('close', code => { if (!gotResult) finish({ type: 'error', message: err.trim() || 'claude berhenti (kode ' + code + ').' }); });
  return { stop() { killTree(child); finish({ type: 'error', message: 'Dihentikan.' }); } };
}

module.exports = { startChat, startSecurityChat, info, forkIds };
