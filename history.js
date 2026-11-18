// "Achievements" of an agent: a high-level outline of what it has worked on, read from its session transcript.
// Streams the file (transcripts can be hundreds of MB) and keeps only short outlines, never full content.
const fs = require('fs');
const readline = require('readline');

const cache = new Map(); // file -> { key, result }
const TOOL_RE = /"type":"tool_use","id":"[^"]*","name":"([A-Za-z_]+)"/g;
const TOOL_GROUP = { Edit: 'edit', Write: 'edit', MultiEdit: 'edit', NotebookEdit: 'edit', Bash: 'bash', PowerShell: 'bash',
  Read: 'read', Grep: 'read', Glob: 'read', WebSearch: 'web', WebFetch: 'web', Task: 'agent', Agent: 'agent' };

const clip = (s, n) => (s.length > n ? s.slice(0, n - 1) + '…' : s);

function sample(list, max) {
  if (list.length <= max) return list;
  const out = [], head = 3, tail = 3, mid = max - head - tail;
  out.push(...list.slice(0, head));
  const span = list.length - head - tail;
  for (let i = 0; i < mid; i++) out.push(list[head + Math.floor((i + 0.5) * span / mid)]);
  out.push(...list.slice(-tail));
  return out;
}

async function agentHistory(file, { deadlineMs = 9000 } = {}) {
  const st = await fs.promises.stat(file);
  const key = st.size + ':' + st.mtimeMs, hit = cache.get(file);
  if (hit && hit.key === key) return hit.result;

  const rl = readline.createInterface({ input: fs.createReadStream(file, { encoding: 'utf8' }), crlfDelay: Infinity });
  const t0 = Date.now(), prompts = [], titles = [], counts = { edit: 0, bash: 0, read: 0, web: 0, agent: 0, other: 0 };
  let first = 0, last = 0, n = 0, partial = false, assistantTurns = 0;
  for await (const line of rl) {
    if (!line || line.charCodeAt(0) !== 123) continue;
    if ((++n & 1023) === 0 && Date.now() - t0 > deadlineMs) { partial = true; rl.close(); break; }
    const isAssistant = line.includes('"type":"assistant"');
    const isUser = !isAssistant && line.includes('"type":"user"');
    if (isAssistant || isUser) {
      const m = line.match(/"timestamp":"([^"]+)"/); const ts = m ? Date.parse(m[1]) : 0;
      if (ts) { if (!first) first = ts; last = ts; }
    }
    if (isAssistant) {
      assistantTurns++;
      TOOL_RE.lastIndex = 0; let mm;
      while ((mm = TOOL_RE.exec(line))) counts[TOOL_GROUP[mm[1]] || 'other']++;
    } else if (isUser && line.length < 400000) {
      let o; try { o = JSON.parse(line); } catch { continue; }
      if (!o || o.isSidechain || o.isMeta) continue;
      const c = o.message && o.message.content;
      const text = typeof c === 'string' ? c : Array.isArray(c) ? (c.find(p => p && p.type === 'text') || {}).text : '';
      if (typeof text !== 'string') continue;
      const t = text.trim();
      if (t.length < 5 || t[0] === '<' || t.startsWith('[Request interrupted') || t.startsWith('Caveat:')) continue;
      const one = clip(t.split('\n')[0].replace(/\s+/g, ' '), 110);
      if (prompts.length && prompts[prompts.length - 1].text === one) continue;
      prompts.push({ ts: Date.parse(o.timestamp) || 0, text: one });
    } else if (line.includes('"type":"ai-title"')) {
      try { const o = JSON.parse(line); const t = o.aiTitle || o.title; if (t && !titles.includes(t)) titles.push(String(t)); } catch { /* skip */ }
    }
  }
  const result = {
    tasks: sample(prompts, 12), totalPrompts: prompts.length, topics: titles.slice(0, 8),
    counts, assistantTurns, first, last, partial, scannedMs: Date.now() - t0,
  };
  cache.set(file, { key, result });
  return result;
}

module.exports = { agentHistory };
