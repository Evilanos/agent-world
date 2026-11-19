// Fallback detector: running agent CLIs found in the process list. It catches tools whose session files we cannot read
// (or do not know), and tells us which tool sessions are live. The process list is refreshed in the background.
const { execFile } = require('child_process');
const fs = require('fs');
const path = require('path');

// exe: executable base names (without .exe/.cmd); args: a regex for node/python launched CLIs
const TOOLS = [
  { id: 'codex', name: 'Codex CLI', color: '#10a37f', exe: ['codex'], args: /@openai[\\/]codex|codex-cli/i },
  { id: 'gemini', name: 'Gemini CLI', color: '#4285f4', exe: ['gemini'], args: /@google[\\/]gemini-cli/i },
  { id: 'opencode', name: 'OpenCode', color: '#e0b400', exe: ['opencode'], args: /opencode-ai|[\\/]opencode[\\/]/i },
  { id: 'aider', name: 'Aider', color: '#14b414', exe: ['aider'], args: /(^|[\\/ ])aider(\.exe)?( |$)|-m aider/i },
  { id: 'goose', name: 'Goose', color: '#7c5cff', exe: ['goose'], args: null },
  { id: 'cursor-agent', name: 'Cursor Agent', color: '#555555', exe: ['cursor-agent'], args: /cursor-agent/i },
  { id: 'copilot-cli', name: 'Copilot CLI', color: '#6e7681', exe: ['copilot'], args: /@github[\\/]copilot/i },
  { id: 'amp', name: 'Amp', color: '#f34e3f', exe: [], args: /@sourcegraph[\\/]amp/i },
  { id: 'qwen', name: 'Qwen Code', color: '#615ced', exe: ['qwen'], args: /@qwen-code/i },
  { id: 'crush', name: 'Crush', color: '#ff5fa2', exe: ['crush'], args: null },
  { id: 'droid', name: 'Droid', color: '#ee6018', exe: ['droid'], args: null },
  { id: 'kimi', name: 'Kimi CLI', color: '#1783ff', exe: ['kimi'], args: /kimi[-_]cli/i },
  { id: 'glm', name: 'GLM CLI', color: '#3b5bdb', exe: [], args: /zai-?cli|glm-cli|chatglm/i },
];
// session tools that also exist as file adapters share the id: processes mark their sessions live
const ALIAS = { 'copilot-cli': 'copilot' };

let cache = { at: 0, list: [] };

function parsePosix(text) {
  return text.split('\n').map(l => l.match(/^\s*(\d+)\s+(\S+)\s+(.*)$/)).filter(Boolean).map(m => ({ pid: Number(m[1]), name: path.basename(m[2]), cmd: m[3] }));
}
function listProcesses(cb) {
  if (process.platform === 'win32') {
    const ps = 'Get-CimInstance Win32_Process | Select-Object ProcessId,Name,CommandLine | ConvertTo-Json -Compress';
    execFile('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', ps], { windowsHide: true, maxBuffer: 32 * 1024 * 1024, timeout: 15000 }, (err, out) => {
      if (err) return cb([]);
      try { const j = JSON.parse(out); cb((Array.isArray(j) ? j : [j]).map(p => ({ pid: p.ProcessId, name: String(p.Name || ''), cmd: String(p.CommandLine || '') }))); } catch { cb([]); }
    });
  } else {
    execFile('ps', ['-eo', 'pid=,comm=,args='], { maxBuffer: 32 * 1024 * 1024, timeout: 10000 }, (err, out) => cb(err ? [] : parsePosix(out)));
  }
}

function match(p) {
  const base = p.name.toLowerCase().replace(/\.(exe|cmd|bat|js)$/, '');
  if (/agent-world/i.test(p.cmd) || /claude/i.test(base)) return null;
  if (/--headless|--stdio|copilot-sdk|copilot-runtime|language-server|--type=/i.test(p.cmd) || /runtime|server|helper/i.test(base)) return null;   // editor helper processes, not an agent session           // ourselves and Claude Code (handled elsewhere)
  for (const t of TOOLS) if (t.exe.includes(base) || (t.args && t.args.test(p.cmd))) return t;
  return null;
}
function cwdOf(pid) { try { return fs.readlinkSync('/proc/' + pid + '/cwd'); } catch { return ''; } }   // Linux only

function refresh() {
  listProcesses((procs) => {
    const list = [];
    for (const p of procs) { const t = match(p); if (t) list.push({ tool: ALIAS[t.id] || t.id, toolName: t.name, color: t.color, pid: p.pid, cwd: cwdOf(p.pid), cmd: p.cmd.slice(0, 160) }); }
    cache = { at: Date.now(), list };
  });
}
let timer = null;
function startWatcher(intervalMs = 15000) {
  if (timer) return; refresh(); timer = setInterval(refresh, intervalMs); if (timer.unref) timer.unref();
}
const getProcesses = (tool) => cache.list.filter(p => !tool || p.tool === tool);
const knownTools = () => TOOLS;

module.exports = { startWatcher, getProcesses, knownTools, match, parsePosix };
