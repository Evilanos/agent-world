// Shared helpers for agent adapters: well-known folders, a tiny glob, safe readers and the standard agent shape.
const fs = require('fs');
const path = require('path');
const os = require('os');

const HOME = os.homedir();
const IS_WIN = process.platform === 'win32';
const APPDATA = process.env.APPDATA || path.join(HOME, 'AppData', 'Roaming');
const LOCALAPPDATA = process.env.LOCALAPPDATA || path.join(HOME, 'AppData', 'Local');
const XDG_DATA = process.env.XDG_DATA_HOME || path.join(HOME, '.local', 'share');
const XDG_CONFIG = process.env.XDG_CONFIG_HOME || path.join(HOME, '.config');
const MAC_SUPPORT = path.join(HOME, 'Library', 'Application Support');
const ACTIVE_MS = 2 * 60 * 1000, RECENT_MS = 24 * 3600 * 1000;

const safe = (fn, d) => { try { return fn(); } catch { return d; } };
const str = (v) => (typeof v === 'string' ? v : '');
const fwd = (p) => String(p).replace(/\\/g, '/');

// ~, %VAR% and $VAR / ${VAR} expansion for user-written patterns
function expand(p) {
  let s = String(p);
  if (s === '~' || s.startsWith('~/') || s.startsWith('~\\')) s = HOME + s.slice(1);
  return s.replace(/%([A-Za-z_][A-Za-z0-9_]*)%/g, (m, k) => (process.env[k] !== undefined ? process.env[k] : m))
          .replace(/\$\{?([A-Za-z_][A-Za-z0-9_]*)\}?/g, (m, k) => (process.env[k] !== undefined ? process.env[k] : m));
}

function globToRegex(glob) {
  let re = '';
  for (let i = 0; i < glob.length; i++) {
    const c = glob[i];
    if (c === '*') {
      if (glob.slice(i, i + 3) === '**/') { re += '(?:.*/)?'; i += 2; }
      else if (glob[i + 1] === '*') { re += '.*'; i += 1; }
      else re += '[^/]*';
    } else if (c === '?') re += '[^/]';
    else re += c.replace(/[.+^${}()|[\]\\]/g, '\\$&');
  }
  return new RegExp('^' + re + '$', IS_WIN ? 'i' : '');
}

// List files matching a glob ("~/.tool/sessions/**/*.jsonl"). Bounded in files, depth and never follows symlinks.
function listFiles(pattern, { maxFiles = 500, maxDepth = 10 } = {}) {
  const norm = fwd(expand(pattern)), wild = norm.search(/[*?]/);
  if (wild < 0) return safe(() => (fs.statSync(norm).isFile() ? [path.normalize(norm)] : []), []);
  const base = norm.slice(0, Math.max(0, norm.lastIndexOf('/', wild)));
  const re = globToRegex(norm), out = [], stack = [[base || '/', 0]];
  while (stack.length && out.length < maxFiles) {
    const [dir, depth] = stack.pop();
    let ents; try { ents = fs.readdirSync(dir, { withFileTypes: true }); } catch { continue; }
    for (const e of ents) {
      const full = dir.replace(/\/$/, '') + '/' + e.name;
      if (e.isSymbolicLink()) continue;
      if (e.isDirectory()) { if (depth < maxDepth) stack.push([full, depth + 1]); }
      else if (e.isFile() && re.test(full)) { out.push(path.normalize(full)); if (out.length >= maxFiles) break; }
    }
  }
  return out;
}

function readChunk(file, size, fromEnd) {
  const fd = fs.openSync(file, 'r');
  try {
    const st = fs.fstatSync(fd), len = Math.min(size, st.size), buf = Buffer.alloc(len);
    fs.readSync(fd, buf, 0, len, fromEnd ? st.size - len : 0);
    return buf.toString('utf8');
  } finally { fs.closeSync(fd); }
}
const readHead = (file, size = 64 * 1024) => readChunk(file, size, false);
const readTail = (file, size = 64 * 1024) => readChunk(file, size, true);
const readJson = (file, maxBytes = 4 * 1024 * 1024) => safe(() => (fs.statSync(file).size > maxBytes ? null : JSON.parse(fs.readFileSync(file, 'utf8'))), null);

// first `max` parseable JSON lines of a text (lines longer than maxLine are skipped, e.g. embedded images)
function jsonLines(text, max = 200, maxLine = 120000) {
  const out = [];
  for (const line of text.split('\n')) {
    if (out.length >= max) break;
    if (line.charCodeAt(0) !== 123 || line.length > maxLine) continue;
    const o = safe(() => JSON.parse(line), null); if (o && typeof o === 'object') out.push(o);
  }
  return out;
}

// dot path lookup: jget(obj, 'payload.cwd'), jget(obj, 'messages.0.content')
function jget(obj, dot) {
  let cur = obj;
  for (const k of String(dot || '').split('.')) { if (cur == null) return undefined; cur = cur[k]; }
  return cur;
}
const toMs = (v) => { if (typeof v === 'number') return v < 1e12 ? v * 1000 : v; const n = Date.parse(v); return Number.isFinite(n) ? n : 0; };
const clip = (s, n) => { s = String(s || '').replace(/\s+/g, ' ').trim(); return s.length > n ? s.slice(0, n - 1) + '…' : s; };
const isAlive = (pid) => { if (!Number.isInteger(pid) || pid <= 0) return false; try { process.kill(pid, 0); return true; } catch (e) { return e.code === 'EPERM'; } };

// The one shape the rest of the app understands (see scan.js). Every adapter ends up producing this.
function makeAgent(o) {
  const now = o.now || Date.now(), lastActive = o.lastActive || 0, cwdClean = str(o.cwd).replace(/^\\\\\?\\/, '');
  let status = 'sleeping';
  if (o.live) status = now - lastActive < ACTIVE_MS ? 'busy' : 'idle';
  else if (lastActive && now - lastActive < RECENT_MS) status = 'recent';
  if (o.status) status = o.status;
  return {
    id: o.tool + ':' + o.id, kind: o.tool, kindLabel: o.toolName || o.tool, kindColor: o.toolColor || '#9aa4b8',
    name: o.name || (o.title ? clip(o.title, 28) : String(o.id).slice(0, 8)), title: clip(o.title || '', 160), cwd: cwdClean, unknownFolder: !cwdClean,
    status, live: !!o.live, entrypoint: o.entrypoint || o.tool, pid: o.pid || null, lastActive, startedAt: o.startedAt || lastActive, sizeKB: o.sizeKB || 0,
    subagents: [], subagentTotal: 0, attention: null, attentionAt: 0, lastText: '', activity: '', activityTool: '', activityTarget: '', lastReply: '',
  };
}

module.exports = { HOME, IS_WIN, APPDATA, LOCALAPPDATA, XDG_DATA, XDG_CONFIG, MAC_SUPPORT, ACTIVE_MS, RECENT_MS, safe, str, fwd, expand, globToRegex, listFiles,
  readHead, readTail, readJson, jsonLines, jget, toMs, clip, isAlive, makeAgent };
