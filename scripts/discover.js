#!/usr/bin/env node
// Finds AI agent tools on this computer and tells you which ones Agent World can already see.
//   node scripts/discover.js
// Read-only: it only lists folder names and looks at the first few KB of recently changed JSON/JSONL files.
const fs = require('fs');
const path = require('path');
const L = require('../adapters/lib');
const { BUILTIN } = require('../adapters');
const proc = require('../adapters/processes');

const DAY = 24 * 3600 * 1000, now = Date.now();
const SUPPORTED = new Set(['claude', 'antigravity', ...BUILTIN.map(a => a.id)]);

// Known tools and where they keep data (name of a folder/command). supported => a built-in adapter exists.
const KNOWN = [
  ['claude', 'Claude Code', ['.claude']], ['antigravity', 'Antigravity', ['.gemini/antigravity-cli']],
  ['codex', 'OpenAI Codex CLI', ['.codex']], ['gemini', 'Gemini CLI', ['.gemini/tmp']], ['opencode', 'OpenCode', ['.local/share/opencode', 'AppData/Roaming/opencode']],
  ['goose', 'Goose', ['.local/share/goose', 'AppData/Roaming/Block/goose']], ['continue', 'Continue', ['.continue']], ['aider', 'Aider', ['.aider']],
  ['', 'GitHub Copilot CLI', ['.copilot']], ['cline', 'Cline / Roo Code', ['AppData/Roaming/Code/User/globalStorage/saoudrizwan.claude-dev', 'AppData/Roaming/Code/User/globalStorage/rooveterinaryinc.roo-cline']],
  ['', 'Cursor', ['.cursor', 'AppData/Roaming/Cursor']], ['', 'Windsurf / Codeium', ['.codeium', '.windsurf']], ['', 'Amp', ['.amp', '.config/amp']], ['', 'Qwen Code', ['.qwen']],
  ['', 'Crush', ['.config/crush', '.local/share/crush']], ['', 'Droid (Factory)', ['.factory']], ['', 'Kimi CLI', ['.kimi']], ['', 'Zed agent', ['AppData/Local/Zed', '.config/zed']],
  ['', 'Z.ai / GLM tools', ['.zai', '.glm', '.chatglm']], ['', 'Cursor Agent CLI', ['.cursor-agent']], ['', 'Warp', ['.warp']],
];

const exists = (p) => L.safe(() => fs.existsSync(p), false);
const section = (t) => console.log('\n' + t + '\n' + '-'.repeat(t.length));

console.log('Agent World — local agent discovery');
console.log('Home folder: ' + L.HOME);

section('Known tools');
for (const [id, name, rels] of KNOWN) {
  const hit = rels.map(r => path.join(L.HOME, r)).find(exists);
  if (!hit) continue;
  const state = id && SUPPORTED.has(id) ? (id === 'claude' || id === 'antigravity' ? 'supported' : 'built-in adapter (experimental)') : 'found, but no built-in adapter yet';
  console.log(`  ${name.padEnd(20)} ${state}\n      data: ${hit}`);
}

section('Agents Agent World sees right now');
let seen = 0;
try {
  const { scan } = require('../scan');
  const w = scan(), per = {};
  for (const r of w.rooms) for (const a of r.agents) per[a.kindLabel || a.kind] = (per[a.kindLabel || a.kind] || 0) + 1;
  for (const [k, n] of Object.entries(per)) { console.log(`  ${k}: ${n}`); seen += n; }
} catch (e) { console.log('  scan failed: ' + e.message); }
if (!seen) console.log('  (none)');

// Unknown candidates: recently changed .json/.jsonl files in hidden tool folders that look like chat/agent sessions
section('Possible unknown agent tools (recently changed session-like files)');
const SKIP = new Set(['.git', '.npm', '.cache', '.vscode', '.ssh', '.gnupg', '.docker', '.m2', '.gradle', '.nuget', '.cargo', '.rustup', '.node-gyp', '.config', '.local', '.claude', '.codex', '.continue', '.gemini']);
const SIGNS = /"(sessionId|session_id|conversation_id|workspaceDirectory|working_dir|cwd|projectPath|workspace)"\s*:/;
const roots = [L.HOME, L.APPDATA, L.LOCALAPPDATA, L.XDG_DATA, L.XDG_CONFIG, L.MAC_SUPPORT].filter((v, i, a) => v && exists(v) && a.indexOf(v) === i);
const candidates = new Map();
function walk(dir, depth, top) {
  let ents; try { ents = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
  for (const e of ents) {
    if (e.isSymbolicLink()) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) { if (depth < 5 && !/^(node_modules|Cache|Code Cache|GPUCache|logs)$/i.test(e.name)) walk(full, depth + 1, top); continue; }
    if (!/\.(jsonl?|ndjson)$/i.test(e.name)) continue;
    const st = L.safe(() => fs.statSync(full), null); if (!st || now - st.mtimeMs > 14 * DAY || st.size < 50 || st.size > 200 * 1024 * 1024) continue;
    const head = L.safe(() => L.readHead(full, 8192), ''); if (!SIGNS.test(head)) continue;
    const c = candidates.get(top) || { count: 0, sample: full, key: (head.match(SIGNS) || [])[1] }; c.count++; candidates.set(top, c);
  }
}
for (const root of roots) {
  for (const e of L.safe(() => fs.readdirSync(root, { withFileTypes: true }), [])) {
    if (!e.isDirectory() || e.isSymbolicLink()) continue;
    const hidden = root === L.HOME ? e.name.startsWith('.') : true;
    if (!hidden || (root === L.HOME && SKIP.has(e.name))) continue;
    if (/^(Microsoft|Google|Mozilla|Packages|Temp|NVIDIA|Adobe|Programs|Code|Cursor|npm|pip|Python|JetBrains|discord|Slack|Spotify)/i.test(e.name) && root !== L.HOME) continue;
    walk(path.join(root, e.name), 0, path.join(root, e.name));
  }
}
if (!candidates.size) console.log('  (nothing suspicious)');
for (const [top, c] of [...candidates].sort((a, b) => b[1].count - a[1].count).slice(0, 12)) {
  console.log(`  ${top}\n      ${c.count} recent file(s), e.g. ${c.sample}\n      suggested config (check "fields" against the file):`);
  const id = path.basename(top).replace(/^\./, '').toLowerCase().replace(/[^a-z0-9_-]/g, '-').slice(0, 24) || 'mytool';
  const ext = path.extname(c.sample).toLowerCase() === '.json' ? 'json' : 'jsonl';
  console.log('      ' + JSON.stringify({ id, name: id, color: '#9aa4b8', files: path.dirname(c.sample).replace(L.HOME, '~').replace(/\\/g, '/') + '/**/*.' + (ext === 'json' ? 'json' : 'jsonl'), format: ext, fields: { id: /session|conversation/i.test(c.key) ? c.key : '', cwd: /cwd|working_dir|workspace|projectPath/i.test(c.key) ? c.key : '', title: '', time: '' } }));
}

section('Running agent processes');
proc.startWatcher(60000);
setTimeout(() => {
  const list = proc.getProcesses();
  if (!list.length) console.log('  (none of the known agent CLIs is running)');
  for (const p of list) console.log(`  ${p.toolName.padEnd(16)} pid ${p.pid}  ${p.cmd.slice(0, 90)}`);
  console.log('\nTo add a tool, put an entry in agent-world.config.json (see agent-world.config.example.json) and reload the page.');
  process.exit(0);
}, 3500);
