// Built-in adapters for agent tools other than Claude Code. Each one reads that tool's local session files (read-only)
// and returns plain "session" records. They are written defensively: a missing folder or an unexpected format simply
// yields nothing. NOTE: these formats come from the tools' public behaviour and have not all been verified against every
// version; use `node scripts/discover.js` and the config adapters (agent-world.config.json) to cover differences.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const L = require('./lib');

const { HOME, XDG_DATA, APPDATA, XDG_CONFIG, MAC_SUPPORT, safe, str, listFiles, readHead, readJson, jsonLines, toMs, clip } = L;
const UUID = /([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i;
const mtimeOf = (f) => safe(() => fs.statSync(f), null);
const sha256 = (s) => crypto.createHash('sha256').update(s).digest('hex');

// first value of the first line that has it (searching several JSON lines)
const firstOf = (objs, getter) => { for (const o of objs) { const v = safe(() => getter(o), undefined); if (v !== undefined && v !== null && v !== '') return v; } return undefined; };
const textOf = (content) => (typeof content === 'string' ? content : Array.isArray(content) ? str((content.find(x => x && typeof x.text === 'string') || {}).text) : '');

const BUILTIN = [
  // ---------------------------------------------------------------- OpenAI Codex CLI
  { id: 'codex', name: 'Codex CLI', color: '#10a37f', scan() {
    const root = process.env.CODEX_HOME || path.join(HOME, '.codex');
    return listFiles(path.join(root, 'sessions') + '/**/*.jsonl', { maxFiles: 400 }).map(file => {
      const st = mtimeOf(file); if (!st) return null;
      const objs = jsonLines(readHead(file), 120, 60000), head = safe(() => readHead(file, 96 * 1024), '');
      const m = head.match(/"cwd":"((?:[^"\\]|\\.)*)"/);
      const cwd = firstOf(objs, o => o.payload && o.payload.cwd) || (m ? safe(() => JSON.parse('"' + m[1] + '"'), '') : '');
      const title = firstOf(objs, o => (o.type === 'event_msg' && o.payload && o.payload.type === 'user_message') ? o.payload.message : undefined)
        || firstOf(objs, o => { if (o.type === 'response_item' && o.payload && o.payload.role === 'user') { const t = textOf(o.payload.content); return t && !t.startsWith('<') ? t : undefined; } });
      const id = firstOf(objs, o => o.payload && o.payload.id) || (path.basename(file).match(UUID) || [])[1] || path.basename(file, '.jsonl');
      return { id, cwd, title, lastActive: st.mtimeMs, startedAt: st.birthtimeMs, sizeKB: Math.round(st.size / 1024) };
    }).filter(Boolean);
  } },

  // ---------------------------------------------------------------- OpenCode (JSON storage layout)
  { id: 'opencode', name: 'OpenCode', color: '#e0b400', scan() {
    const roots = [path.join(XDG_DATA, 'opencode'), path.join(HOME, '.local', 'share', 'opencode'), path.join(APPDATA, 'opencode')];
    const seen = new Set(), out = [];
    for (const r of [...new Set(roots)]) for (const file of listFiles(path.join(r, 'storage', 'session') + '/**/*.json', { maxFiles: 400 })) {
      const j = readJson(file, 512 * 1024), st = mtimeOf(file); if (!j || !st || seen.has(file)) continue; seen.add(file);
      out.push({ id: str(j.id) || path.basename(file, '.json'), cwd: str(j.directory), title: str(j.title), lastActive: toMs(j.time && j.time.updated) || st.mtimeMs, startedAt: toMs(j.time && j.time.created) || st.birthtimeMs, sizeKB: 0 });
    }
    return out;
  } },

  // ---------------------------------------------------------------- Goose
  { id: 'goose', name: 'Goose', color: '#7c5cff', scan() {
    const pats = [path.join(XDG_DATA, 'goose', 'sessions') + '/*.jsonl', path.join(APPDATA, 'Block', 'goose', 'data', 'sessions') + '/*.jsonl'];
    const out = [];
    for (const file of [...new Set(pats.flatMap(p => listFiles(p, { maxFiles: 300 })))]) {
      const st = mtimeOf(file); if (!st) continue;
      const objs = jsonLines(readHead(file, 32 * 1024), 20);
      out.push({ id: path.basename(file, '.jsonl'), cwd: str(firstOf(objs, o => o.working_dir)), title: str(firstOf(objs, o => o.description)), lastActive: st.mtimeMs, startedAt: st.birthtimeMs, sizeKB: Math.round(st.size / 1024) });
    }
    return out;
  } },

  // ---------------------------------------------------------------- Continue (VS Code / JetBrains)
  { id: 'continue', name: 'Continue', color: '#e2573a', scan() {
    return listFiles(path.join(HOME, '.continue', 'sessions') + '/*.json', { maxFiles: 300 }).filter(f => path.basename(f) !== 'sessions.json').map(file => {
      const j = readJson(file, 2 * 1024 * 1024), st = mtimeOf(file); if (!j || Array.isArray(j) || !st) return null;
      return { id: str(j.sessionId) || path.basename(file, '.json'), cwd: str(j.workspaceDirectory), title: str(j.title), lastActive: st.mtimeMs, startedAt: st.birthtimeMs, sizeKB: Math.round(st.size / 1024) };
    }).filter(Boolean);
  } },

  // ---------------------------------------------------------------- Google Gemini CLI (the folder name is sha256 of the project path)
  { id: 'gemini', name: 'Gemini CLI', color: '#4285f4', scan(ctx) {
    const cand = new Set([...(ctx.knownCwds || []), ...(ctx.projectRoots || []), HOME, process.cwd()]);
    const byHash = new Map(); for (const c of cand) if (c) { byHash.set(sha256(c), c); byHash.set(sha256(path.normalize(c)), path.normalize(c)); }
    const root = path.join(HOME, '.gemini', 'tmp'), out = [];
    for (const file of listFiles(root + '/*/chats/*.json', { maxFiles: 300 })) {
      const hashDir = path.basename(path.dirname(path.dirname(file))), j = readJson(file, 2 * 1024 * 1024), st = mtimeOf(file); if (!j || !st) continue;
      const msgs = Array.isArray(j.messages) ? j.messages : [], first = msgs.find(m => m && m.type === 'user');
      out.push({ id: str(j.sessionId) || path.basename(file, '.json'), cwd: byHash.get(str(j.projectHash) || hashDir) || '', title: textOf(first && first.content), lastActive: toMs(j.lastUpdated) || st.mtimeMs, startedAt: toMs(j.startTime) || st.birthtimeMs, sizeKB: Math.round(st.size / 1024) });
    }
    return out;
  } },

  // ---------------------------------------------------------------- Aider (a history file inside each project folder)
  { id: 'aider', name: 'Aider', color: '#14b414', scan(ctx) {
    const dirs = new Set([...(ctx.knownCwds || []), ...(ctx.projectRoots || [])]), out = [];
    for (const d of dirs) {
      const f = path.join(d, '.aider.chat.history.md'), st = mtimeOf(f); if (!st || !st.isFile()) continue;
      const head = safe(() => readHead(f, 8 * 1024), ''), m = head.match(/^####\s+(.+)$/m);
      out.push({ id: sha256(d).slice(0, 16), cwd: d, title: m ? m[1] : '', lastActive: st.mtimeMs, startedAt: st.birthtimeMs, sizeKB: Math.round(st.size / 1024) });
    }
    return out;
  } },

  // ---------------------------------------------------------------- Cline / Roo Code (VS Code extensions; the project folder is not stored)
  { id: 'cline', name: 'Cline / Roo Code', color: '#2563eb', scan() {
    const bases = [path.join(APPDATA, 'Code', 'User', 'globalStorage'), path.join(XDG_CONFIG, 'Code', 'User', 'globalStorage'), path.join(MAC_SUPPORT, 'Code', 'User', 'globalStorage')];
    const out = [];
    for (const b of [...new Set(bases)]) for (const ext of ['saoudrizwan.claude-dev', 'rooveterinaryinc.roo-cline']) {
      for (const file of listFiles(path.join(b, ext, 'tasks') + '/*/ui_messages.json', { maxFiles: 200 })) {
        const st = mtimeOf(file); if (!st) continue;
        const arr = readJson(file, 1024 * 1024), first = Array.isArray(arr) ? arr.find(m => m && typeof m.text === 'string' && m.text) : null;
        out.push({ id: path.basename(path.dirname(file)), cwd: '', title: first ? clip(first.text, 120) : '', lastActive: st.mtimeMs, startedAt: st.birthtimeMs, sizeKB: Math.round(st.size / 1024) });
      }
    }
    return out;
  } },
];

module.exports = { BUILTIN };
