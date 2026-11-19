const http = require('http');
const fs = require('fs');
const path = require('path');
const { startChat, startSecurityChat, info: chatInfo, forkIds } = require('./chat');
const { scan, projectSummary, setFired, setHidden, getTranscriptPath, findAgent } = require('./scan');
const { agentHistory } = require('./history');
const { securityReport, cached: securityCached } = require('./security');

const PORT = Number(process.env.PORT) || 4173;
const ROOT = __dirname;
const PUBLIC = path.join(ROOT, 'public');
const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.ico': 'image/x-icon', '.map': 'application/json', '.wasm': 'application/wasm',
  '.woff2': 'font/woff2', '.txt': 'text/plain; charset=utf-8',
};
const SEC = { 'X-Content-Type-Options': 'nosniff' };
const ALLOWED_HOSTS = new Set([`localhost:${PORT}`, `127.0.0.1:${PORT}`]);

// ---- dismissed ("fired") agents: soft delete. Nothing under ~/.claude is touched; the agent is just hidden from the office. ----
const DATA_DIR = path.join(ROOT, 'data'), FIRED_FILE = path.join(DATA_DIR, 'fired.json');
let fired = {};
try { fired = JSON.parse(fs.readFileSync(FIRED_FILE, 'utf8')); } catch { fired = {}; }
const saveFired = () => { fs.mkdirSync(DATA_DIR, { recursive: true }); fs.writeFileSync(FIRED_FILE, JSON.stringify(fired, null, 1)); setFired(Object.keys(fired)); };
setFired(Object.keys(fired));
setHidden(forkIds());
const achievementsSeen = new Map();   // agent id -> time the human opened its achievements (required before firing)
const ORIGINS = new Set([`http://localhost:${PORT}`, `http://127.0.0.1:${PORT}`]);

// Scan in the background; requests always get the latest finished result (never block on a scan).
let lastWorld = null;
let cache = { json: '{"generatedAt":0,"host":"","stats":{},"rooms":[]}', at: 0, error: null };
function refresh() {
  try { lastWorld = scan(); cache = { json: JSON.stringify(lastWorld), at: Date.now(), error: null }; }
  catch (e) { cache.error = e.message; console.error('scan failed:', e.message); }
}
try { require('./adapters').startWatchers(); } catch (e) { console.error('process watcher:', e.message); }
refresh();
setInterval(refresh, 2000).unref?.();

function send(res, code, body, headers = {}) {
  res.writeHead(code, { ...SEC, ...headers });
  res.end(body);
}

function handle(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD' && req.method !== 'POST') return send(res, 405, 'Method not allowed');
  // DNS-rebinding guard: only answer requests addressed to our own loopback origin
  if (!ALLOWED_HOSTS.has(String(req.headers.host || '').toLowerCase())) return send(res, 403, 'Forbidden host');

  let pathname;
  try { pathname = new URL(req.url, 'http://localhost').pathname; } catch { return send(res, 400, 'Bad request'); }

  if (pathname === '/api/world') {
    return send(res, 200, req.method === 'HEAD' ? undefined : cache.json,
      { 'Content-Type': MIME['.json'], 'Cache-Control': 'no-store', ...(cache.error ? { 'X-Scan-Stale': '1' } : {}) });
  }

  if (pathname === '/api/project') {   // the key must match a room we scanned ourselves; the client never supplies a path
    const key = new URL(req.url, 'http://localhost').searchParams.get('key') || '';
    const sum = projectSummary(lastWorld, key);
    if (!sum) return send(res, 404, '{"error":"unknown project"}', { 'Content-Type': MIME['.json'] });
    return send(res, 200, req.method === 'HEAD' ? undefined : JSON.stringify(sum), { 'Content-Type': MIME['.json'], 'Cache-Control': 'no-store' });
  }

  const q = new URL(req.url, 'http://localhost').searchParams;
  const json = (code, obj) => send(res, code, JSON.stringify(obj), { 'Content-Type': MIME['.json'], 'Cache-Control': 'no-store' });

  if (pathname === '/api/agent') {            // achievements: outline of what the agent has worked on
    const hit = findAgent(lastWorld, q.get('id') || '');
    if (!hit) return json(404, { error: 'agent not found' });
    achievementsSeen.set(hit.agent.id, Date.now());
    const file = getTranscriptPath(hit.agent.id);
    if (!file) return json(200, { id: hit.agent.id, name: hit.agent.name, tasks: [], topics: [], counts: {}, totalPrompts: 0, noTranscript: true });
    agentHistory(file).then(r => json(200, { id: hit.agent.id, name: hit.agent.name, ...r }), e => json(500, { error: e.message }));
    return;
  }
  if (pathname === '/api/security') {         // security review of a project folder
    const room = lastWorld && lastWorld.rooms.find(r => r.key === (q.get('key') || ''));
    if (!room) return json(404, { error: 'project not found' });
    if (q.get('cached') === '1') return json(200, { key: room.key, report: securityCached(room.path) });
    securityReport(room.path, q.get('force') === '1').then(r => json(200, { key: room.key, name: room.name, path: room.path, report: r }), e => json(500, { error: e.message }));
    return;
  }
  if (pathname === '/api/fired' && req.method === 'GET') return json(200, { fired: Object.entries(fired).map(([id, f]) => ({ id, ...f })) });
  if ((pathname === '/api/fire' || pathname === '/api/unfire') && req.method === 'POST') {
    // state-changing: only from our own page (custom header forces a CORS preflight for foreign sites)
    if (req.headers['x-aw'] !== '1' || (req.headers.origin && !ORIGINS.has(req.headers.origin))) return json(403, { error: 'forbidden' });
    let body = ''; req.on('data', d => { body += d; if (body.length > 4096) req.destroy(); });
    req.on('end', () => {
      let id; try { id = String(JSON.parse(body).id || ''); } catch { return json(400, { error: 'bad json' }); }
      if (pathname === '/api/unfire') { delete fired[id]; saveFired(); return json(200, { ok: true }); }
      const hit = findAgent(lastWorld, id);
      if (!hit) return json(404, { error: 'agent not found' });
      if (Date.now() - (achievementsSeen.get(id) || 0) > 15 * 60 * 1000) return json(409, { error: 'achievements-not-viewed', message: 'Look at this agent\'s achievements before firing it.' });
      fired[id] = { name: hit.agent.name, cwd: hit.agent.cwd, project: hit.room.name, firedAt: Date.now() };
      saveFired(); achievementsSeen.delete(id); refresh(); return json(200, { ok: true });
    });
    return;
  }

  if (pathname === '/api/chat/info') {        // can we talk to this agent, and how?
    const hit = findAgent(lastWorld, q.get('id') || '');
    return hit ? json(200, chatInfo(hit.agent)) : json(404, { error: 'agent not found' });
  }
  if (pathname === '/api/chat' && req.method === 'POST') {   // streams the agent's reply as NDJSON
    if (req.headers['x-aw'] !== '1' || (req.headers.origin && !ORIGINS.has(req.headers.origin))) return json(403, { error: 'forbidden' });
    let body = ''; req.on('data', d => { body += d; if (body.length > 40000) req.destroy(); });
    req.on('end', () => {
      let b; try { b = JSON.parse(body); } catch { return json(400, { error: 'bad json' }); }
      const hit = findAgent(lastWorld, String(b.id || ''));
      if (!hit) return json(404, { error: 'agent not found' });
      res.writeHead(200, { ...SEC, 'Content-Type': 'application/x-ndjson; charset=utf-8', 'Cache-Control': 'no-store' });
      const out = (ev) => { try { res.write(JSON.stringify(ev) + String.fromCharCode(10)); } catch { /* client left */ } };
      let handle;
      try { handle = startChat({ agent: hit.agent, message: b.message, mode: b.mode === 'edit' ? 'edit' : 'safe', branch: b.branch === true }, out, () => { setHidden(forkIds()); refresh(); res.end(); }); }
      catch (e) { out({ type: 'error', status: e.status || 500, message: e.message || String(e) }); return res.end(); }
      res.on('close', () => { if (!res.writableEnded) handle.stop(); });   // the browser aborted: stop the process
    });
    return;
  }

  if (pathname === '/api/chat/security' && req.method === 'POST') {   // talk to a project's security guard (read-only, stateless)
    if (req.headers['x-aw'] !== '1' || (req.headers.origin && !ORIGINS.has(req.headers.origin))) return json(403, { error: 'forbidden' });
    let body = ''; req.on('data', d => { body += d; if (body.length > 120000) req.destroy(); });
    req.on('end', async () => {
      let b; try { b = JSON.parse(body); } catch { return json(400, { error: 'bad json' }); }
      const room = lastWorld && lastWorld.rooms.find(r => r.key === String(b.key || ''));
      if (!room) return json(404, { error: 'project not found' });
      let report = null; try { report = await securityReport(room.path, false); } catch { /* chat without a report */ }
      res.writeHead(200, { ...SEC, 'Content-Type': 'application/x-ndjson; charset=utf-8', 'Cache-Control': 'no-store' });
      const out = (ev) => { try { res.write(JSON.stringify(ev) + String.fromCharCode(10)); } catch { /* client left */ } };
      let handle;
      try { handle = startSecurityChat({ room, report, message: b.message, history: b.history, lang: String(b.lang || '') }, out, () => res.end()); }
      catch (e) { out({ type: 'error', status: e.status || 500, message: e.message || String(e) }); return res.end(); }
      res.on('close', () => { if (!res.writableEnded) handle.stop(); });
    });
    return;
  }

  if (req.method === 'POST') return send(res, 405, 'Method not allowed');

  let rel;
  try { rel = decodeURIComponent(pathname); } catch { return send(res, 400, 'Bad request'); }
  if (rel.includes('\0')) return send(res, 400, 'Bad request');
  if (rel === '/') rel = '/index.html';

  // decode first, then resolve, then require the result to sit inside public/
  const file = path.resolve(PUBLIC, '.' + rel);
  const ok = file.startsWith(PUBLIC + path.sep);
  if (!ok || path.basename(file).startsWith('.')) return send(res, 403, 'Forbidden');

  fs.readFile(file, (err, data) => {
    if (err) return send(res, 404, 'Not found');
    send(res, 200, req.method === 'HEAD' ? undefined : data,
      { 'Content-Type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream' });
  });
}

http.createServer((req, res) => {
  try { handle(req, res); }
  catch (e) { console.error('request failed:', e.message); if (!res.headersSent) send(res, 500, 'Server error'); else res.end(); }
}).listen(PORT, '127.0.0.1', () => console.log(`Agent World -> http://localhost:${PORT}`));

process.on('uncaughtException', e => console.error('uncaught:', e));
