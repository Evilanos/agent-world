// Scans this machine for AI agents and groups them by project (room).
// Sources: Claude Code live sessions + transcripts + subagents, Antigravity (Gemini) history.
const fs = require('fs');
const path = require('path');
const os = require('os');

const HOME = os.homedir();
const CLAUDE = path.join(HOME, '.claude');
const ANTIGRAVITY = path.join(HOME, '.gemini', 'antigravity-cli');

const ACTIVE_MS = 2 * 60 * 1000;      // modified in the last 2 min => working
const RECENT_MS = 24 * 3600 * 1000;
const ATTENTION_MS = 30 * 60 * 1000;  // "just finished" window   // shown "awake" in the last 24h

const safe = (fn, dflt) => { try { return fn(); } catch { return dflt; } };

const str = (v) => (typeof v === 'string' ? v : '');
// 'D--AI-Agent' -> 'D:\AI-Agent' (lossy for dashes, only a last-resort fallback)
const decodeDir = (d) => d.replace(/^([a-zA-Z])--/, '$1:\\').replace(/-/g, '\\');
const STATUSES = new Set(['busy', 'idle']);
let agCache = { key: '', list: [] };
const transcriptPaths = new Map();   // agent id -> transcript file (server side only, never sent to the client)
let FIRED = new Set();               // agents the human has dismissed
const setFired = (ids) => { FIRED = new Set(ids); };
let HIDDEN = new Set();              // chat branches (forks) are conversation copies, not real agents
const setHidden = (ids) => { HIDDEN = new Set(ids); };
const getTranscriptPath = (id) => transcriptPaths.get(id) || null;
const metaCache = new Map(); // file -> { key: size:mtime, meta }

function isAlive(pid) {
  if (!Number.isInteger(pid) || pid <= 0) return false;
  try { process.kill(pid, 0); return true; } catch (e) { return e.code === 'EPERM'; }
}

function readChunk(file, size, fromEnd) {
  const fd = fs.openSync(file, 'r');
  try {
    const st = fs.fstatSync(fd);
    const len = Math.min(size, st.size);
    const buf = Buffer.alloc(len);
    fs.readSync(fd, buf, 0, len, fromEnd ? st.size - len : 0);
    return buf.toString('utf8');
  } finally { fs.closeSync(fd); }
}

function normPath(p) {
  if (!p) return '';
  return path.normalize(p).replace(/[\\/]+$/, '').toLowerCase();
}

function projectName(p) {
  const parts = p.split(/[\\/]/).filter(Boolean);
  return parts[parts.length - 1] || p;
}

// Pull cwd + ai-title out of a transcript without loading the whole file.
function toolTarget(tu) {
  const i = (tu && tu.input) || {};
  const f = str(i.file_path) || str(i.path) || str(i.notebook_path);
  if (f) return path.basename(f);
  return (str(i.command) || str(i.pattern) || str(i.description) || str(i.query) || str(i.url)).replace(/s+/g, ' ').slice(0, 28);
}
const TOOL_VERB = { Edit: 'Editing', Write: 'Writing', MultiEdit: 'Editing', NotebookEdit: 'Editing', Read: 'Reading', Grep: 'Searching', Glob: 'Searching',
  Bash: 'Running', PowerShell: 'Running', Task: 'Delegating', Agent: 'Delegating', WebSearch: 'Web research', WebFetch: 'Reading web', TodoWrite: 'Planning' };   // English fallback; the UI localizes from activityTool / activityTarget
function activityLabel(t) {
  if (!t || !t.name) return '';
  const label = (TOOL_VERB[t.name] || 'Using ' + t.name) + (t.target ? ' ' + t.target : '');
  return label.length > 40 ? label.slice(0, 39) + '…' : label;
}

// Pull cwd + ai-title out of a transcript without loading the whole file.
function readTranscriptMeta(file) {
  const st0 = fs.statSync(file);
  const key = st0.size + ':' + st0.mtimeMs, hit = metaCache.get(file);
  if (hit && hit.key === key) return hit.meta;
  const meta = readTranscriptMetaUncached(file);
  metaCache.set(file, { key, meta });
  return meta;
}

function readTranscriptMetaUncached(file) {
  let cwd = null, title = null, last = null, lastTool = null, lastReply = '';
  const scan = (txt, tail) => {
    for (const line of txt.split('\n')) {
      if (!line.startsWith('{')) continue;
      // last conversational turn: tells us if the agent finished or is waiting on the human
      if (tail && (line.includes('"type":"assistant"') || line.includes('"type":"user"'))) {
        const o = safe(() => JSON.parse(line), null);
        if (o && !o.isSidechain && (o.type === 'assistant' || o.type === 'user')) {
          const ts = Date.parse(o.timestamp) || 0;
          if (o.type === 'user') last = { role: 'user', ts };
          else {
            const parts = Array.isArray(o.message && o.message.content) ? o.message.content : [];
            const ask = parts.find(c => c && c.type === 'tool_use' && (c.name === 'AskUserQuestion' || c.name === 'ExitPlanMode'));
            const text = parts.filter(c => c && c.type === 'text').map(c => str(c.text)).join(' ');
            const q = ask && ask.input && ask.input.questions && ask.input.questions[0];
            const tu = parts.find(c => c && c.type === 'tool_use' && c !== ask);
            if (tu) lastTool = { name: str(tu.name), target: toolTarget(tu) };
            if (text.trim()) lastReply = text.replace(/s+/g, ' ').trim().slice(0, 200);
            last = {
              role: 'assistant', ts, ask: !!ask,
              toolUse: parts.some(c => c && c.type === 'tool_use' && c !== ask),
              text: (str(q && q.question) || text).replace(/\s+/g, ' ').trim().slice(0, 220),
            };
          }
        }
      }
      if (!cwd && line.includes('"cwd"')) {
        const m = line.match(/"cwd":"((?:[^"\\]|\\.)*)"/);
        if (m) cwd = safe(() => JSON.parse('"' + m[1] + '"'), null);
      }
      if (line.includes('"type":"ai-title"')) {
        const o = safe(() => JSON.parse(line), null);
        if (o && (o.aiTitle || o.title)) title = o.aiTitle || o.title;
      }
    }
  };
  const st = fs.statSync(file);
  scan(readChunk(file, 96 * 1024, false), st.size <= 96 * 1024);
  if (st.size > 96 * 1024) scan(readChunk(file, 96 * 1024, true), true);
  return { cwd, title, last, lastTool, lastReply, size: st.size, mtime: st.mtimeMs, birth: st.birthtimeMs };
}

function scanClaude(now) {
  const agents = [];
  const liveByCwdSession = new Map();

  // live sessions registered by running Claude Code processes
  const sdir = path.join(CLAUDE, 'sessions');
  for (const f of safe(() => fs.readdirSync(sdir), [])) {
    if (!f.endsWith('.json')) continue;
    const j = safe(() => JSON.parse(fs.readFileSync(path.join(sdir, f), 'utf8')), null);
    if (!j || !j.sessionId) continue;
    liveByCwdSession.set(j.sessionId, { ...j, alive: isAlive(j.pid) });
  }

  const pdir = path.join(CLAUDE, 'projects');
  const seen = new Set();
  for (const d of safe(() => fs.readdirSync(pdir), [])) {
    const dir = path.join(pdir, d);
    if (!safe(() => fs.statSync(dir).isDirectory(), false)) continue;
    for (const f of safe(() => fs.readdirSync(dir), [])) {
      if (!f.endsWith('.jsonl')) continue;
      const id = f.slice(0, -6);
      const meta = safe(() => readTranscriptMeta(path.join(dir, f)), null);
      if (!meta) continue;
      const live = liveByCwdSession.get(id);
      seen.add(id); transcriptPaths.set(id, path.join(dir, f));
      const cwd = str(live && live.cwd) || str(meta.cwd) || decodeDir(d);

      // subagents spawned by this session
      const subDir = path.join(dir, id, 'subagents');
      const subs = [];
      for (const sf of safe(() => fs.readdirSync(subDir), [])) {
        if (!sf.endsWith('.meta.json')) continue;
        const base = sf.replace('.meta.json', '');
        const m = safe(() => JSON.parse(fs.readFileSync(path.join(subDir, sf), 'utf8')), {});
        const mt = safe(() => fs.statSync(path.join(subDir, base + '.jsonl')).mtimeMs, 0);
        subs.push({
          id: base,
          type: m.agentType || 'agent',
          description: m.description || '',
          working: now - mt < ACTIVE_MS,
          lastActive: mt,
        });
      }
      subs.sort((a, b) => b.lastActive - a.lastActive);

      const lastActive = Math.max(meta.mtime, live && live.updatedAt ? live.updatedAt : 0);
      let status = 'sleeping';
      // busy comes only from a live session; a closed one just written to is merely "recent"
      if (live && live.alive) status = STATUSES.has(live.status) ? live.status : 'idle';
      else if (now - lastActive < RECENT_MS) status = 'recent';

      // "attention": the agent is done, or waiting for the human's opinion (only for live sessions)
      let attention = null, attentionAt = 0, lastText = '';
      const L = meta.last;
      if (live && live.alive && L && L.role === 'assistant') {
        attentionAt = L.ts || meta.mtime; lastText = L.text || '';
        if (L.ask) attention = 'ask';
        else if (!L.toolUse && live.status !== 'busy') attention = /[?？]\s*$/.test(lastText) ? 'ask' : 'done';
        if (attention && now - attentionAt > ATTENTION_MS) attention = null;
      }
      if (live && live.alive && live.status && !['busy', 'idle'].includes(live.status)) attention = attention || 'ask'; // e.g. waiting for permission

      agents.push({
        id,
        attention, attentionAt: attention ? attentionAt : 0, lastText: attention ? lastText : '',
        activity: live && live.alive && live.status === 'busy' ? activityLabel(meta.lastTool) : '',
        activityTool: live && live.alive && live.status === 'busy' && meta.lastTool ? meta.lastTool.name : '',
        activityTarget: live && live.alive && live.status === 'busy' && meta.lastTool ? meta.lastTool.target || '' : '',
        lastReply: meta.lastReply || '',
        kind: 'claude',
        name: (live && live.name) || meta.title || id.slice(0, 8),
        title: meta.title || '',
        cwd,
        status,
        live: !!(live && live.alive),
        entrypoint: live ? live.entrypoint : null,
        pid: live && live.alive ? live.pid : null,
        lastActive,
        startedAt: live ? live.startedAt : meta.birth,
        sizeKB: Math.round(meta.size / 1024),
        subagents: subs.slice(0, 24),
        subagentTotal: subs.length,
      });
    }
  }

  // live sessions that have no transcript yet
  for (const [id, j] of liveByCwdSession) {
    if (seen.has(id) || !j.alive) continue;
    agents.push({
      id, kind: 'claude', name: j.name || id.slice(0, 8), title: '', cwd: j.cwd,
      status: j.status === 'busy' ? 'busy' : 'idle', live: true, entrypoint: j.entrypoint,
      pid: j.pid, lastActive: j.updatedAt || now, startedAt: j.startedAt, sizeKB: 0,
      subagents: [], subagentTotal: 0,
    });
  }
  return agents;
}

function scanAntigravity(now) {
  const file = path.join(ANTIGRAVITY, 'history.jsonl');
  const st = safe(() => fs.statSync(file), null);
  if (!st) return [];
  const ck = st.size + ':' + st.mtimeMs;
  if (agCache.key !== ck) { // history only grows; re-parse only when it changed
    const byWs = new Map();
    for (const line of safe(() => fs.readFileSync(file, 'utf8'), '').split('\n')) {
      const o = safe(() => JSON.parse(line), null);
      if (!o || !str(o.workspace)) continue;
      const key = normPath(o.workspace);
      const e = byWs.get(key) || { key, cwd: o.workspace, count: 0, last: 0 };
      const ts = Number(o.timestamp);
      e.count++; if (Number.isFinite(ts)) e.last = Math.max(e.last, ts);
      byWs.set(key, e);
    }
    agCache = { key: ck, list: [...byWs.values()] };
  }
  return agCache.list.map((e) => ({
    id: 'antigravity-' + e.key.replace(/[^a-z0-9]+/g, '-'),
    kind: 'antigravity',
    name: 'Antigravity',
    title: `${e.count} perintah di riwayat`,
    cwd: e.cwd,
    status: now - e.last < RECENT_MS ? 'recent' : 'sleeping',
    live: false, entrypoint: 'antigravity-cli', pid: null,
    lastActive: e.last, startedAt: e.last, sizeKB: 0, subagents: [], subagentTotal: 0,
  }));
}

function scan() {
  const now = Date.now();
  const byId = new Map();
  const first = [...safe(() => scanClaude(now), []), ...safe(() => scanAntigravity(now), [])];
  // every other tool: built-in adapters, user-configured adapters and running processes (see adapters/)
  const extra = safe(() => require('./adapters').runAdapters(now, { knownCwds: [...new Set(first.map(a => a.cwd).filter(Boolean))] }), []);
  for (const a of [...first, ...extra]) {
    const prev = byId.get(a.id); // resumed/forked copies share an id: keep the newest
    if (!prev || a.lastActive > prev.lastActive) byId.set(a.id, a);
  }
  const agents = [...byId.values()].filter(a => ((typeof a.cwd === 'string' && a.cwd) || a.unknownFolder) && !FIRED.has(a.id) && !HIDDEN.has(a.id));

  const rooms = new Map();
  for (const a of agents) {
    if (!a.cwd) {   // the tool does not tell us the project folder: one room per tool
      const k = 'unknown:' + a.kind;
      if (!rooms.has(k)) rooms.set(k, { key: k, path: '', name: a.kindLabel || a.kind, unknown: true, agents: [] });
      rooms.get(k).agents.push(a); continue;
    }
    // Orca worktrees (...\orca\workspaces\<Project>\<worktree>) belong to their parent project room
    const wt = a.cwd.match(/[\\/]orca[\\/]workspaces[\\/]([^\\/]+)[\\/]([^\\/]+)/i);
    let key, name, p = a.cwd;
    if (wt) { a.worktree = wt[2]; key = 'proj:' + wt[1].toLowerCase(); name = wt[1]; }
    else if (normPath(a.cwd) === normPath(HOME)) { key = 'home'; name = '~ Home'; }
    else { key = normPath(a.cwd); name = projectName(a.cwd); }
    if (!rooms.has(key)) rooms.set(key, { key, path: p, name, agents: [] });
    else if (!wt && rooms.get(key).path !== p && key.startsWith('proj:')) rooms.get(key).path = p;
    rooms.get(key).agents.push(a);
  }
  // fold a worktree room into a real project folder with the same name
  for (const [k, r] of [...rooms]) {
    if (!k.startsWith('proj:')) continue;
    const twin = [...rooms.values()].find(o => o !== r && !o.key.startsWith('proj:') && o.name.toLowerCase() === r.name.toLowerCase());
    if (twin) { twin.agents.push(...r.agents); rooms.delete(k); }
  }
  const list = [...rooms.values()];
  for (const r of list) {
    r.agents.sort((x, y) => (rank(y) - rank(x)) || (y.lastActive - x.lastActive));
    r.activity = Math.max(...r.agents.map(a => a.lastActive));
    r.liveCount = r.agents.filter(a => a.live).length;
    r.busyCount = r.agents.filter(a => a.status === 'busy').length;
  }
  list.sort((a, b) => (b.liveCount - a.liveCount) || (b.activity - a.activity));

  const stats = {
    rooms: list.length,
    agents: agents.length,
    live: agents.filter(a => a.live).length,
    busy: agents.filter(a => a.status === 'busy').length,
    subagents: agents.reduce((n, a) => n + a.subagentTotal, 0),
  };
  return { generatedAt: now, host: os.hostname(), stats, rooms: list };
}

function rank(a) {
  return { busy: 4, idle: 3, recent: 2, sleeping: 1 }[a.status] || 0;
}

// ---- project summary: PRD / README excerpts + what each agent is doing ----
const DOC_GROUPS = [
  ['PRD.md', 'prd.md', 'docs/PRD.md', 'docs/prd.md', 'PRD.txt', 'docs/product-requirements.md', 'docs/requirements.md'],
  ['README.md', 'readme.md', 'Readme.md'],
  ['TODO.md', 'docs/TODO.md', 'PLAN.md', 'docs/plan.md', 'ROADMAP.md'],
  ['CLAUDE.md'],
];
function readDoc(base, rel) {
  try {
    const root = fs.realpathSync(base), full = fs.realpathSync(path.resolve(base, rel));
    if (!full.startsWith(root + path.sep)) return null;      // never leave the project folder (symlinks included)
    const st = fs.statSync(full);
    if (!st.isFile() || st.size > 2 * 1024 * 1024) return null;
    const fd = fs.openSync(full, 'r');
    try { const buf = Buffer.alloc(Math.min(st.size, 6000)); fs.readSync(fd, buf, 0, buf.length, 0); return { name: rel, truncated: st.size > 6000, text: buf.toString('utf8') }; }
    finally { fs.closeSync(fd); }
  } catch { return null; }
}
function projectSummary(world, key) {
  const room = world && world.rooms.find(r => r.key === key);
  if (!room) return null;
  const docs = [];
  for (const group of (room.path ? DOC_GROUPS : [])) {
    for (const rel of group) { const d = readDoc(room.path, rel); if (d) { docs.push(d); break; } }
  }
  if (room.path && !docs.some(d => /prd|requirement/i.test(d.name))) { // any docs/*prd*.md or *spec*.md
    const dd = path.join(room.path, 'docs');
    const hit = safe(() => fs.readdirSync(dd), []).find(f => /(prd|spec|requirement)/i.test(f) && /.(md|txt)$/i.test(f));
    const d = hit && readDoc(room.path, 'docs/' + hit); if (d) docs.unshift(d);
  }
  const rank = { busy: 0, idle: 1, recent: 2, sleeping: 3 };
  const tasks = [...room.agents].sort((a, b) => (rank[a.status] - rank[b.status]) || b.lastActive - a.lastActive).slice(0, 12)
    .map(a => ({ agent: a.name, status: a.status, title: a.title, activity: a.activity || '', tool: a.activityTool || '', target: a.activityTarget || '', reply: a.lastReply || '', lastActive: a.lastActive }));
  return { key: room.key, name: room.name, path: room.path, docs: docs.slice(0, 3).map(d => ({ ...d, text: d.text.slice(0, 3500) })), tasks,
    stats: { agents: room.agents.length, live: room.liveCount, busy: room.busyCount } };
}

const findAgent = (world, id) => { for (const r of (world ? world.rooms : [])) { const a = r.agents.find(x => x.id === id); if (a) return { agent: a, room: r }; } return null; };

module.exports = { scan, projectSummary, setFired, setHidden, getTranscriptPath, findAgent };
if (require.main === module) console.log(JSON.stringify(scan(), null, 1).slice(0, 6000));
