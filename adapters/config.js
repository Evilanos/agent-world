// User configuration: add ANY agent tool without writing code, hide built-in ones, and tell us where your projects live.
// Looked up in: ./agent-world.config.json (next to server.js) and ~/.agent-world.json  (see agent-world.config.example.json)
const fs = require('fs');
const path = require('path');
const L = require('./lib');

const FILES = [path.join(__dirname, '..', 'agent-world.config.json'), path.join(L.HOME, '.agent-world.json')];
let cache = { key: '', cfg: { adapters: [], disable: [], projectRoots: [] } };

function load() {
  const stats = FILES.map(f => L.safe(() => { const s = fs.statSync(f); return f + ':' + s.mtimeMs + ':' + s.size; }, ''));
  const key = stats.join('|');
  if (key === cache.key) return cache.cfg;
  const cfg = { adapters: [], disable: [], projectRoots: [], errors: [] };
  for (const f of FILES) {
    if (!fs.existsSync(f)) continue;
    let j; try { j = JSON.parse(fs.readFileSync(f, 'utf8')); } catch (e) { cfg.errors.push(f + ': ' + e.message); continue; }
    if (Array.isArray(j.adapters)) cfg.adapters.push(...j.adapters);
    if (Array.isArray(j.disable)) cfg.disable.push(...j.disable.map(String));
    if (Array.isArray(j.projectRoots)) cfg.projectRoots.push(...j.projectRoots.map(String));
  }
  cache = { key, cfg }; return cfg;
}

const HEX = /^#[0-9a-fA-F]{6}$/;
// One adapter entry: { id, name, color, files: glob, format: "jsonl"|"json", fields: { id, cwd, title, time }, staticCwd?, maxFiles? }
function adapters(cfg) {
  const out = [];
  for (const e of cfg.adapters || []) {
    if (!e || typeof e.id !== 'string' || !/^[a-z0-9][a-z0-9_-]{0,30}$/i.test(e.id) || typeof e.files !== 'string') continue;
    const f = e.fields || {}, format = e.format === 'json' ? 'json' : 'jsonl';
    out.push({
      id: e.id.toLowerCase(), name: String(e.name || e.id), color: HEX.test(e.color || '') ? e.color : '#9aa4b8',
      scan() {
        return L.listFiles(e.files, { maxFiles: Math.min(Number(e.maxFiles) || 300, 2000) }).map(file => {
          const st = L.safe(() => fs.statSync(file), null); if (!st) return null;
          const objs = format === 'json' ? [L.readJson(file, 4 * 1024 * 1024)].filter(Boolean) : L.jsonLines(L.readHead(file, 128 * 1024), 200);
          const pick = (dot) => { if (!dot) return undefined; for (const o of objs) { const v = L.jget(o, dot); if (v !== undefined && v !== null && v !== '') return v; } return undefined; };
          return {
            id: String(pick(f.id) || path.basename(file).replace(/\.[^.]+$/, '')), cwd: String(pick(f.cwd) || e.staticCwd || ''), title: String(pick(f.title) || ''),
            lastActive: (f.time && L.toMs(pick(f.time))) || st.mtimeMs, startedAt: st.birthtimeMs, sizeKB: Math.round(st.size / 1024),
          };
        }).filter(Boolean);
      },
    });
  }
  return out;
}

module.exports = { load, adapters, FILES };
