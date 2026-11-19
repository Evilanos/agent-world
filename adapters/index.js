// Runs every adapter (built-in + user config) and merges process-based detection into one list of agents.
const fs = require('fs');
const path = require('path');
const L = require('./lib');
const { BUILTIN } = require('./builtin');
const config = require('./config');
const proc = require('./processes');

const SIX_HOURS = 6 * 3600 * 1000;

// ~/code style roots: the folders themselves plus their direct sub-folders (used to find per-project history files)
function expandRoots(roots) {
  const out = new Set();
  for (const r of roots || []) {
    const base = path.normalize(L.expand(r)); if (!L.safe(() => fs.statSync(base).isDirectory(), false)) continue;
    out.add(base);
    for (const e of L.safe(() => fs.readdirSync(base, { withFileTypes: true }), []).slice(0, 300)) if (e.isDirectory() && !e.name.startsWith('.')) out.add(path.join(base, e.name));
  }
  return [...out];
}

function runAdapters(now, ctx0 = {}) {
  const cfg = config.load(), disabled = new Set(cfg.disable || []);
  const ctx = { ...ctx0, now, projectRoots: expandRoots(cfg.projectRoots) };
  const agents = [];
  for (const ad of [...BUILTIN, ...config.adapters(cfg)]) {
    if (disabled.has(ad.id)) continue;
    for (const s of L.safe(() => ad.scan(ctx), []) || []) agents.push(L.makeAgent({ ...s, tool: ad.id, toolName: ad.name, toolColor: ad.color, now }));
  }
  // running processes: mark the matching tool's recent sessions as live, and show processes we have no session for
  const byTool = new Map();
  for (const p of proc.getProcesses()) { if (disabled.has(p.tool)) continue; if (!byTool.has(p.tool)) byTool.set(p.tool, []); byTool.get(p.tool).push(p); }
  for (const [tool, procs] of byTool) {
    const mine = agents.filter(a => a.kind === tool).sort((a, b) => b.lastActive - a.lastActive), used = new Set();
    for (const p of procs) {
      const s = mine.find(x => !used.has(x) && !x.live && now - x.lastActive < SIX_HOURS && (!p.cwd || !x.cwd || path.normalize(p.cwd).toLowerCase() === path.normalize(x.cwd).toLowerCase()));
      if (s) { used.add(s); s.live = true; s.pid = p.pid; s.status = now - s.lastActive < L.ACTIVE_MS ? 'busy' : 'idle'; }
      else agents.push(L.makeAgent({ tool, toolName: p.toolName, toolColor: p.color, id: 'proc-' + p.pid, name: p.toolName, title: p.cmd, cwd: p.cwd, live: true, pid: p.pid, lastActive: now - 10 * 60 * 1000, startedAt: now, status: 'idle', entrypoint: 'process', now }));
    }
  }
  return agents;
}

module.exports = { runAdapters, startWatchers: () => proc.startWatcher(), config, BUILTIN };
