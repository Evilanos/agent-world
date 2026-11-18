import { G, STATUS, KIND, CALL, ROLES, roleOf, $, el, ago, hash, trunc, clamp, damp, P, dist, reduceMotion } from './js/core.js';
import { buildFloor, USER_FLOOR, route } from './js/floor.js';
import { createActors, updateActors, syncActors } from './js/actors.js';
import { createPlayer, placePlayer, updatePlayer, inZone, blocked } from './js/player.js';
import { openChat, closeChat } from './js/chat.js';
import { draw, view, UNIT, screenToWorld, pick } from './js/render.js';

const canvas = $('stage'), ctx = canvas.getContext('2d');
G.player = createPlayer();
let riding = false, liftLock = false, liftShown = false, liftOverride = null, firstDone = false, panel = null;
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const P_ = new URLSearchParams(location.search);
const TIME_SCALE = Math.min(12, Number(P_.get('speed')) || 1);

// ---------- canvas / camera ----------
function resize() {
  view.dpr = Math.min(devicePixelRatio || 1, 2); view.W = innerWidth; view.H = innerHeight;
  canvas.width = Math.round(view.W * view.dpr); canvas.height = Math.round(view.H * view.dpr);
}
let userMovedCam = false, camGoal = null;
addEventListener('resize', () => { resize(); if (!G.follow && !userMovedCam) overview(true); }); resize();
const sidebarPx = () => (innerWidth > 760 ? 250 : 0);
function overview(snap = false) {
  const zoom = Math.min((view.W - sidebarPx() - 20) / (76.6 * UNIT), (view.H - 90) / (46.6 * UNIT)), sc = UNIT * zoom;
  camGoal = { x: -(sidebarPx() / 2) / sc, z: -5 + 26 / sc, zoom }; G.follow = false; $('follow').classList.remove('on'); userMovedCam = false;
  if (snap) { Object.assign(G.cam, camGoal); camGoal = null; }
}
function flyTo(x, z, zoom) { camGoal = { x, z, zoom: clamp(zoom, 0.4, 3.2) }; userMovedCam = true; }
function followPlayer(on, snap = false) {
  G.follow = on; $('follow').classList.toggle('on', on);
  if (on) { camGoal = null; if (snap) { G.cam.x = G.player.pos.x; G.cam.z = G.player.pos.z; G.cam.zoom = Math.max(G.cam.zoom, 1.4); } }
}
G.onMoveStart = () => { if (!G.follow && !riding) { followPlayer(true); if (G.cam.zoom < 1.3) camGoal = { x: G.player.pos.x, z: G.player.pos.z, zoom: 1.5 }; } };
function focusRoom(rd) {
  G.follow = false; $('follow').classList.remove('on');
  const z = Math.min((view.W - sidebarPx() - 40) / ((rd.W + 4) * UNIT), (view.H - 120) / ((rd.D + 5) * UNIT));
  flyTo(rd.cx - (sidebarPx() / 2) / (UNIT * z), rd.cz - 0.5, z);
}

let drag = null;
canvas.addEventListener('pointerdown', e => { if (e.button !== 0 && e.button !== 1) return; drag = { x: e.clientX, y: e.clientY, cx: G.cam.x, cz: G.cam.z, moved: false }; canvas.setPointerCapture(e.pointerId); });
canvas.addEventListener('pointermove', e => {
  if (drag) {
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    if (Math.hypot(dx, dy) > 5) { drag.moved = true; if (G.follow) { G.follow = false; $('follow').classList.remove('on'); } camGoal = null; userMovedCam = true; canvas.style.cursor = 'grabbing'; }
    if (drag.moved) { const sc = UNIT * G.cam.zoom; G.cam.x = drag.cx - dx / sc; G.cam.z = drag.cz - dy / sc; }
  } else { const w = screenToWorld(e.clientX, e.clientY); canvas.style.cursor = pick(w.x, w.z) ? 'pointer' : 'grab'; }
});
canvas.addEventListener('pointerup', e => {
  const d = drag; drag = null; canvas.style.cursor = 'grab';
  if (!d || d.moved || !G.floor) return;
  const w = screenToWorld(e.clientX, e.clientY), h = pick(w.x, w.z);
  if (!h) return selectAgent(null);
  if (h.type === 'agent') selectAgent(h.ref.agent.id);
  else if (h.type === 'guard') selectGuard(h.ref);
  else if (h.type === 'board') openProject(h.key);
  else if (h.type === 'rack') openSecurity(h.key);
  else if (h.type === 'sign') focusRoom(h.ref);
});
canvas.addEventListener('wheel', e => {
  e.preventDefault();
  const before = screenToWorld(e.clientX, e.clientY);
  G.cam.zoom = clamp(G.cam.zoom * Math.exp(-e.deltaY * 0.0015), 0.35, 3.2); camGoal = null; userMovedCam = true;
  if (!G.follow) { const after = screenToWorld(e.clientX, e.clientY); G.cam.x += before.x - after.x; G.cam.z += before.z - after.z; }
}, { passive: false });
$('overview').onclick = () => { selectAgent(null); overview(); };
$('follow').onclick = () => followPlayer(!G.follow);

// ---------- floors: 3 project rooms per floor, floor 2 holds your office ----------
const floorOfAgent = new Map();
function computeFloors(v) {
  const rooms = v.rooms, nChunks = Math.max(1, Math.ceil(rooms.length / 3)), numFloors = Math.max(USER_FLOOR, nChunks);
  const floors = Array.from({ length: numFloors }, (_, i) => ({ no: i + 1, rooms: [] }));
  floorOfAgent.clear();
  rooms.forEach((r, i) => {
    const c = Math.floor(i / 3), no = Math.min(c === 0 ? 2 : c === 1 ? 1 : c + 1, numFloors);
    floors[no - 1].rooms.push(r); r.agents.forEach(a => floorOfAgent.set(a.id, no));
  });
  G.floors = floors; if (G.floorNo > numFloors) G.floorNo = USER_FLOOR;
}

// ---------- calls ----------
const acked = (() => { try { return new Set(JSON.parse(localStorage.getItem('aw-acked') || '[]')); } catch { return new Set(); } })();
const saveAcked = () => { try { localStorage.setItem('aw-acked', JSON.stringify([...acked].slice(-300))); } catch { /* storage blocked */ } };
const demo = new Map();
function computeCalled(v) {
  const list = [];
  for (const r of v.rooms) for (const a of r.agents) {
    if (demo.has(a.id)) list.push({ id: a.id, kind: demo.get(a.id), at: Date.now(), text: demo.get(a.id) === 'ask' ? '[Demo] Pakai pendekatan A atau B?' : '[Demo] Tugas selesai, semua lulus' });
    else if (a.attention && a.live && G.chatWith !== a.id && a.attentionAt > (G.chatSeen.get(a.id) || 0) + 60000 && !acked.has(a.id + ':' + a.attentionAt)) list.push({ id: a.id, kind: a.attention, at: a.attentionAt, text: a.lastText });
  }
  list.sort((x, y) => (x.kind === 'ask' ? 0 : 1) - (y.kind === 'ask' ? 0 : 1) || x.at - y.at);
  G.calledMap = new Map(list.map(c => [c.id, c])); G.callOrder = list.map(c => c.id);
}
function ackAgent(a) { if (demo.has(a.id)) demo.delete(a.id); else { acked.add(a.id + ':' + a.attentionAt); saveAcked(); } forceRefresh(); }
$('demo').onclick = () => {
  if (demo.size) demo.clear();
  else { const pool = G.actors.map(a => a.agent).filter(a => !G.calledMap.has(a.id)); pool.sort((a, b) => (b.live - a.live) || b.lastActive - a.lastActive); pool.slice(0, 4).forEach((a, i) => demo.set(a.id, i % 2 ? 'done' : 'ask')); }
  $('demo').textContent = demo.size ? 'Hentikan demo' : 'Demo panggilan'; forceRefresh();
};

// ---------- building the current floor ----------
const agentById = (id) => { for (const f of G.floors) for (const r of f.rooms) for (const a of r.agents) if (a.id === id) return a; return null; };
function loadSecurity(key) {
  const cur = G.security[key]; if (cur && Date.now() - cur._at < 5 * 60 * 1000) return;
  G.security[key] = cur || { _at: Date.now(), pending: true };
  fetch('/api/security?key=' + encodeURIComponent(key)).then(r => r.json()).then(j => { if (j.report) G.security[key] = { ...j.report, _at: Date.now() }; }).catch(() => { delete G.security[key]; });
}
function buildCurrentFloor() {
  const fl = G.floors.find(f => f.no === G.floorNo);
  const waiting = G.callOrder.map(id => ({ name: (agentById(id) || {}).name || '?', kind: G.calledMap.get(id).kind, floor: floorOfAgent.get(id) || '?' }));
  const next = buildFloor(G.floorNo, fl ? fl.rooms : [], { waiting });
  const { agents, guards } = createActors(next);
  G.floor = next; G.actors = agents; G.guards = guards;
  next.projectRooms.forEach(r => loadSecurity(r.key));
}
const floorSig = () => {
  const fl = G.floors.find(f => f.no === G.floorNo);
  return JSON.stringify([G.floorNo, fl ? fl.rooms.map(r => [r.key, r.name, r.role, r.liveCount, r.agents.map(a => [a.id, a.status, a.live, a.name, a.title, a.cwd, a.kind, a.worktree, a.subagentTotal, a.subagents.map(x => x.working ? 1 : 0)])]) : [],
    G.callOrder.map(id => [id, G.calledMap.get(id).kind, floorOfAgent.get(id)]), $('showSleep').checked]);
};

// ---------- lift ----------
function floorStats() {
  return G.floors.map(f => { const ags = f.rooms.flatMap(r => r.agents); return { no: f.no, projects: f.rooms.length, agents: ags.length, waiting: ags.filter(a => G.calledMap.has(a.id)).length }; });
}
function renderLift() {
  $('lift').replaceChildren(
    el('h2', { textContent: 'Lift' }), el('p', { className: 'sub', textContent: `Anda di lantai ${G.floorNo}. Pilih lantai tujuan:` }),
    el('div', { className: 'floorbtns' }, floorStats().reverse().map(s => {
      const b = el('button', { type: 'button', className: 'fbtn' + (s.no === G.floorNo ? ' here' : '') + (s.waiting ? ' hot' : '') });
      b.append(el('b', { textContent: s.no }), el('span', { textContent: `${s.projects} project · ${s.agents} agent` }), el('i', { textContent: s.waiting ? `${s.waiting} menunggu Anda` : (s.no === USER_FLOOR ? 'lantai Anda' : '') }));
      b.disabled = s.no === G.floorNo || riding; b.onclick = () => rideTo(s.no); return b;
    })), el('p', { className: 'sub', textContent: 'Tekan angka di keyboard, atau keluar dari lift untuk menutup.' }));
}
const showLift = () => { liftShown = true; renderLift(); $('lift').hidden = false; };
const hideLift = () => { liftShown = false; $('lift').hidden = true; };
async function rideTo(n) {
  if (riding || n === G.floorNo) return;
  riding = true; renderLift(); liftOverride = 0;
  $('fade').textContent = `Menuju lantai ${n}…`; $('fade').classList.add('on'); await sleep(900);
  G.floorNo = n; buildCurrentFloor(); sig = floorSig();
  placePlayer(G.player, n, G.floor.lift.center, Math.PI); selectAgent(null);
  if (G.follow) followPlayer(true, true); else overview(true);
  hudSig = ''; await sleep(350); $('fade').classList.remove('on'); liftOverride = 1; await sleep(500);
  liftOverride = null; riding = false; liftLock = true; hideLift(); forceRefresh();
}

// ---------- panels ----------
function modal(...kids) {
  const m = $('proj'); m.hidden = false;
  m.replaceChildren(el('button', { className: 'close', textContent: '✕', ariaLabel: 'Tutup', onclick: closeModal }), ...kids); m.scrollTop = 0; return m;
}
function closeModal() { $('proj').hidden = true; }
const chip = (k, v) => el('span', { className: 'chip' }, el('b', { textContent: v }), k);
const post = (url, body) => fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-AW': '1' }, body: JSON.stringify(body) });

async function openProject(key) {
  modal(el('p', { className: 'sub', textContent: 'Memuat ringkasan project…' }));
  try {
    const res = await fetch('/api/project?key=' + encodeURIComponent(key), { cache: 'no-store' }); if (!res.ok) throw new Error('HTTP ' + res.status);
    const d = await res.json(), st = (s) => STATUS[s] || STATUS.sleeping;
    modal(el('h2', { textContent: d.name }), el('div', { className: 'ttl', textContent: d.path }), el('div', { className: 'chips' }, [chip('agent', d.stats.agents), chip('online', d.stats.live), chip('bekerja', d.stats.busy)]),
      el('h3', { textContent: 'Task saat ini' }),
      d.tasks.length ? el('ul', { className: 'tasks' }, d.tasks.map(t => {
        const li = el('li', {}), dot = el('i', { className: 'dot' }); dot.style.background = st(t.status).color;
        li.append(dot, el('b', { textContent: t.title || t.agent }), el('small', { textContent: `${t.agent} · ${st(t.status).label} · ${ago(t.lastActive)}` }));
        if (t.activity) li.append(el('small', { className: 'act', textContent: '✎ ' + t.activity })); if (t.reply) li.append(el('p', { textContent: trunc(t.reply, 200) })); return li;
      })) : el('p', { className: 'sub', textContent: 'Belum ada task tercatat.' }),
      el('h3', { textContent: 'PRD / dokumen project' }),
      ...(d.docs.length ? d.docs.flatMap(doc => [el('div', { className: 'docname', textContent: doc.name + (doc.truncated ? ' (potongan awal)' : '') }), el('pre', { textContent: doc.text })])
        : [el('p', { className: 'sub', textContent: 'Tidak ada PRD.md / README.md di folder project ini.' })]));
  } catch (e) { modal(el('p', { className: 'sub', textContent: 'Gagal memuat ringkasan: ' + e.message })); }
}

async function openSecurity(key, force = false) {
  modal(el('p', { className: 'sub', textContent: 'Security sedang memindai kode project…' }));
  try {
    const j = await (await fetch('/api/security?key=' + encodeURIComponent(key) + (force ? '&force=1' : ''))).json();
    if (j.error) throw new Error(j.error);
    const r = j.report; G.security[key] = { ...r, _at: Date.now() };
    const sev = { high: ['Tinggi', '#ff5d5d'], medium: ['Sedang', '#ffb020'], low: ['Rendah', '#4aa8ff'] };
    modal(el('h2', { textContent: '🛡 Laporan Security · ' + j.name }), el('div', { className: 'ttl', textContent: j.path }),
      r.skipped ? el('p', { className: 'sub', textContent: r.note }) : el('div', { className: 'chips' }, [chip('tinggi', r.counts.high), chip('sedang', r.counts.medium), chip('rendah', r.counts.low), chip('file dipindai', r.scannedFiles), chip('ms', r.durationMs || 0)]),
      el('p', { className: 'sub', textContent: 'Pemindaian statis lokal (pola berisiko di kode & konfigurasi). Nilai rahasia selalu disamarkan. Ini bukan pengganti audit penuh.' + (r.truncated ? ' Hasil dipotong (batas file/waktu).' : '') }),
      el('button', { type: 'button', textContent: 'Pindai ulang', onclick: () => openSecurity(key, true) }),
      !r.findings.length && !r.skipped ? el('p', { className: 'sub', textContent: 'Tidak ada temuan dari aturan yang dipakai. 👍' }) : el('ul', { className: 'tasks' }, r.findings.map(f => {
        const li = el('li', {}), dot = el('i', { className: 'dot' }); dot.style.background = sev[f.sev][1];
        li.append(dot, el('b', { textContent: f.title }), el('small', { textContent: `${sev[f.sev][0]} · ${f.file}${f.line ? ':' + f.line : ''}` }));
        if (f.snippet) li.append(el('pre', { textContent: f.snippet })); li.append(el('p', { textContent: '→ ' + f.advice })); return li;
      })));
  } catch (e) { modal(el('p', { className: 'sub', textContent: 'Gagal memuat laporan: ' + e.message })); }
}

async function openFired() {
  const j = await (await fetch('/api/fired')).json();
  modal(el('h2', { textContent: 'Agent yang dipecat' }), el('p', { className: 'sub', textContent: 'Pemecatan hanya menyembunyikan agent dari kantor. File sesi di ~/.claude tidak dihapus, jadi bisa dipulihkan.' }),
    j.fired.length ? el('ul', { className: 'tasks' }, j.fired.map(f => { const li = el('li', {}); li.append(el('b', { textContent: f.name }), el('small', { textContent: `${f.project || ''} · dipecat ${ago(f.firedAt)}` }), el('button', { type: 'button', textContent: 'Pulihkan', onclick: async () => { await post('/api/unfire', { id: f.id }); await sleep(2300); forceRefresh(); openFired(); } })); return li; }))
      : el('p', { className: 'sub', textContent: 'Belum ada agent yang dipecat.' }));
}
$('fired').onclick = openFired;

// ---- agent panel: info / achievements / "pecat" with the agent defending itself ----
const ACH = { edit: 'file diedit/ditulis', bash: 'perintah dijalankan', read: 'pencarian & bacaan', web: 'riset web', agent: 'subagent didelegasikan' };
async function fetchAchv(id) { const r = await fetch('/api/agent?id=' + encodeURIComponent(id)); if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); }
function achvView(h) {
  const nodes = [], counts = Object.entries(h.counts || {}).filter(([k, v]) => v && ACH[k]).map(([k, v]) => chip(ACH[k], v.toLocaleString('id-ID')));
  nodes.push(el('div', { className: 'chips' }, [chip('tugas dari Anda', h.totalPrompts || 0), ...counts]));
  if (h.first) nodes.push(el('p', { className: 'sub', textContent: `Bekerja sejak ${new Date(h.first).toLocaleDateString('id-ID')} · terakhir ${ago(h.last)}${h.partial ? ' · (riwayat sangat panjang, sebagian dipindai)' : ''}` }));
  if (h.topics && h.topics.length) nodes.push(el('h3', { textContent: 'Topik yang dikerjakan' }), el('ul', { className: 'plain' }, h.topics.map(t => el('li', { textContent: t }))));
  nodes.push(el('h3', { textContent: 'Garis besar tugas' }));
  nodes.push(h.tasks && h.tasks.length ? el('ol', { className: 'plain' }, h.tasks.map(t => el('li', {}, el('span', { textContent: t.text }), t.ts ? el('small', { textContent: new Date(t.ts).toLocaleDateString('id-ID') }) : ''))) : el('p', { className: 'sub', textContent: h.note || 'Belum ada tugas tercatat.' }));
  return nodes;
}
function selectAgent(id) {
  G.selectedId = id; panel = null; if (G.defending && G.defending !== id) G.defending = null;
  const box = $('detail');
  if (!id) { box.hidden = true; return; }
  if (!G.actors.find(x => x.agent.id === id)) { box.hidden = true; return; }
  panel = { id, mode: 'info', achv: null, loading: false, error: '' };
  renderAgentPanel(); box.hidden = false; loadAchv(id, false);
}
async function loadAchv(id, forDefense) {
  if (!panel || panel.id !== id) return;
  panel.loading = true; renderAgentPanel();
  try { const h = await fetchAchv(id); if (panel && panel.id === id) { panel.achv = h; panel.loading = false; if (forDefense) panel.mode = 'decide'; renderAgentPanel(); } }
  catch (e) { if (panel && panel.id === id) { panel.loading = false; panel.error = e.message; renderAgentPanel(); } }
}
function renderAgentPanel() {
  if (!panel) return;
  const act = G.actors.find(x => x.agent.id === panel.id), box = $('detail'); if (!act) { box.hidden = true; return; }
  const a = act.agent, st = STATUS[a.status], role = ROLES[act.role] || ROLES.casual, call = G.calledMap.get(a.id);
  const row = (k, v) => [el('dt', { textContent: k }), el('dd', { textContent: v })];
  const badge = el('span', { className: 'badge', textContent: st.label }); badge.style.background = st.color;
  const doing = ({ work: 'Bekerja di meja', sleep: 'Tertidur di meja', sofa: 'Santai di sofa', drink: 'Ngopi', pingpong: 'Main pingpong', chat: 'Ngobrol', pee: 'Buang air kecil', poop: 'Buang air besar', wash: 'Cuci tangan', stand: 'Bersantai', wave: 'Melambai ke Anda', cheer: 'Melapor: selesai!', plead: 'Memohon agar tidak dipecat', sad: 'Sedih' })[act.goal ? act.goal.pose : ''] || '';
  const kids = [el('button', { className: 'close', textContent: '✕', title: 'Tutup', ariaLabel: 'Tutup detail', onclick: () => selectAgent(null) }), el('h2', { textContent: a.name }), el('div', { className: 'ttl', textContent: a.title || KIND[a.kind].label }), badge];
  const achSection = () => [el('h3', { textContent: 'Pencapaian' }), panel.loading ? el('p', { className: 'sub', textContent: 'Membaca riwayat kerja… (transkrip besar bisa memakan beberapa detik)' }) : panel.error ? el('p', { className: 'sub', textContent: 'Gagal: ' + panel.error }) : panel.achv ? el('div', {}, achvView(panel.achv)) : ''];

  if (panel.mode === 'defend' || panel.mode === 'decide') {
    const h = panel.achv, lines = h ? `Saya sudah menerima ${h.totalPrompts} tugas dari Anda, mengedit ${((h.counts || {}).edit || 0).toLocaleString('id-ID')} file dan menjalankan ${((h.counts || {}).bash || 0).toLocaleString('id-ID')} perintah.` : '';
    kids.push(el('div', { className: 'defense' }, el('b', { textContent: '🙏 ' + a.name + ' membela diri' }),
      el('p', { textContent: panel.mode === 'defend' ? '“Tunggu dulu, Bos! Sebelum Anda memecat saya, tolong lihat dulu apa saja yang sudah saya kerjakan.”' : `“${lines || 'Itu semua yang sudah saya kerjakan.'} Mohon pertimbangkan kembali.”` })));
    if (panel.mode === 'defend') kids.push(el('div', { className: 'row' }, el('button', { type: 'button', className: 'primary', textContent: 'Lihat pencapaian saya', disabled: panel.loading, onclick: () => loadAchv(a.id, true) }), el('button', { type: 'button', textContent: 'Batal', onclick: cancelFire })), ...(panel.loading || panel.error ? achSection() : []), ...(panel.error && !panel.loading ? [] : []));
    else kids.push(...achSection(), el('div', { className: 'row' }, el('button', { type: 'button', className: 'danger', textContent: 'Tetap pecat', onclick: () => confirmFire(a) }), el('button', { type: 'button', className: 'primary', textContent: 'Beri kesempatan lagi', onclick: cancelFire })), el('p', { className: 'sub', textContent: panel.error || 'Pemecatan hanya menyembunyikan agent dari kantor (bisa dipulihkan lewat tombol “Dipecat”).' }));
    box.replaceChildren(...kids); return;
  }
  if (a.kind === 'claude') kids.push(el('div', { className: 'row' }, el('button', { type: 'button', className: 'primary', textContent: '💬 Ngobrol / beri perintah', onclick: () => openChat(act) })));
  if (call) kids.push(el('div', { className: 'callbox ' + call.kind }, el('b', { textContent: CALL[call.kind].label }), el('p', { textContent: call.text || '(tidak ada ringkasan)' }), el('button', { type: 'button', textContent: 'Sudah saya lihat — kembali ke ruangan', onclick: () => ackAgent(a) })));
  kids.push(el('h3', { textContent: 'Seragam' }), el('p', { className: 'sub', textContent: `${role.label} (${role.desc}), sesuai project ${act.roleProject || ''}`.replace(/, sesuai project $/, '') }),
    el('h3', { textContent: 'Sedang' }), el('dl', {}, ...row('Aktivitas', doing || '—'), ...(a.activity ? row('Tool', a.activity) : [])),
    ...achSection(),
    ...(a.lastReply ? [el('h3', { textContent: 'Balasan terakhir' }), el('p', { className: 'reply', textContent: a.lastReply })] : []),
    el('h3', { textContent: 'Info' }), el('dl', {}, ...row('Jenis', KIND[a.kind].label), ...row('Folder', a.cwd), ...(a.worktree ? row('Worktree', a.worktree) : []), ...row('Sumber', a.entrypoint || '—'), ...(a.pid ? row('PID', String(a.pid)) : []), ...row('Aktivitas terakhir', ago(a.lastActive)), ...row('ID', a.id)),
    el('h3', { textContent: `Subagent (${a.subagentTotal})` }),
    a.subagents.length ? el('ul', {}, a.subagents.map(s => el('li', {}, `${s.working ? '● ' : ''}${s.type}`, el('small', { textContent: trunc(s.description, 90) + ' · ' + ago(s.lastActive) })))) : el('div', { className: 'ttl', textContent: 'Tidak ada subagent tercatat.' }),
    el('div', { className: 'dangerzone' }, el('button', { type: 'button', className: 'danger', textContent: 'Pecat agent…', onclick: startFire })));
  box.replaceChildren(...kids);
}
function startFire() { if (!panel) return; panel.mode = 'defend'; G.defending = panel.id; renderAgentPanel(); }
function cancelFire() { if (!panel) return; panel.mode = 'info'; G.defending = null; renderAgentPanel(); }
async function confirmFire(a) {
  panel.error = '';
  const r = await post('/api/fire', { id: a.id });
  if (r.status === 409) { panel.mode = 'defend'; panel.error = 'Server menolak: lihat pencapaian agent ini dulu sebelum memecatnya.'; renderAgentPanel(); return; }
  if (!r.ok) { panel.error = 'Gagal memecat (HTTP ' + r.status + ')'; renderAgentPanel(); return; }
  const act = G.actors.find(x => x.agent.id === a.id);
  ghosts.set(a.id, { agent: a, roomKey: act ? act.roomKey : null });
  G.defending = null; G.firing.add(a.id); selectAgent(null);       // the agent packs up and walks to the lift
  setTimeout(() => { G.firing.delete(a.id); ghosts.delete(a.id); forceRefresh(); }, 22000);
}
function selectGuard(g) {
  G.selectedId = g.agent.id; panel = null; const box = $('detail'); box.hidden = false;
  const key = g.agent.projectKey, rep = key ? G.security[key] : null, n = rep && rep.counts ? rep.counts : null;
  const bd = el('span', { className: 'badge', textContent: 'Penjaga ruangan' }); bd.style.background = '#f2c200';
  box.replaceChildren(el('button', { className: 'close', textContent: '✕', ariaLabel: 'Tutup detail', onclick: () => selectAgent(null) }), el('h2', { textContent: '🛡 Security' }), el('div', { className: 'ttl', textContent: g.agent.title }), bd,
    el('h3', { textContent: 'Tugas' }), el('ol', { className: 'plain' }, el('li', { textContent: 'Mencegah agent dari project yang berbeda mengobrol atau bekerja bersamaan.' }), el('li', { textContent: 'Memeriksa celah keamanan pada sistem yang dibangun di project ini.' })),
    el('h3', { textContent: 'Status' }), el('dl', {}, ...(key ? [el('dt', { textContent: 'Celah sistem' }), el('dd', { textContent: n ? `${n.high} tinggi · ${n.medium} sedang · ${n.low} rendah` : (rep && rep.skipped ? 'bukan project' : 'memindai…') })] : []),
      el('dt', { textContent: 'Lintas project dicegah' }), el('dd', { textContent: `${G.blocked}× (sesi ini)` })),
    ...(key ? [el('div', { className: 'dangerzone' }, el('button', { type: 'button', className: 'primary', textContent: 'Buka laporan celah sistem', onclick: () => openSecurity(key) }))] : []));
}

// ---------- HUD ----------
function renderHud(data) {
  $('host').textContent = data.host; const s = data.stats || {};
  $('chips').replaceChildren(...[['lantai', G.floors.length], ['ruangan', s.rooms], ['agent', s.agents], ['online', s.live], ['bekerja', s.busy], ['menunggu Anda', G.callOrder.length], ['lintas project dicegah', G.blocked]]
    .map(([k, v]) => el('span', { className: 'chip' + (k === 'menunggu Anda' && v ? ' hot' : '') }, el('b', { textContent: v ?? 0 }), k)));
  $('floorBadge').textContent = `Lantai ${G.floorNo}` + (G.floorNo === USER_FLOOR ? ' · lantai Anda' : '');
  const f = G.floor, gc = (p) => G.actors.filter(a => a.goal && a.goal.key.startsWith(p)).length, items = [];
  if (f) {
    f.projectRooms.forEach(r => items.push({ name: r.name, sub: `${(ROLES[r.role] || ROLES.casual).label} · ${r.agents.length} agent · ${r.liveCount} online`, hue: hash(r.name) % 360, rd: r.rd, dots: r.agents }));
    items.push({ name: 'Fun Area', sub: `${gc('fun:')} agent bersantai`, hue: 100, rd: f.plan.fun }, { name: 'Toilet', sub: `${gc('wc:')} agent di toilet`, hue: 195, rd: f.plan.toilet }, { name: 'Lift', sub: 'pindah lantai', hue: 220, rd: f.plan.lift });
    if (f.plan.office) items.push({ name: 'Ruang Anda', sub: 'kantor pribadi', hue: 42, rd: f.plan.office });
  }
  $('roomList').replaceChildren(...items.map(it => {
    const b = el('button', { type: 'button' }); b.style.setProperty('--c', `hsl(${it.hue} 60% 55%)`);
    b.append(el('div', { className: 'nm' }, el('span', { textContent: it.name })), el('div', { className: 'sub', textContent: it.sub }));
    if (it.dots) b.append(el('div', { className: 'dots' }, it.dots.map(a => { const d = el('i'); d.style.background = STATUS[a.status].color; d.title = `${a.name}: ${STATUS[a.status].label}`; return d; })));
    b.onclick = () => focusRoom(it.rd); return b;
  }));
}

// ---------- data loop ----------
function normalize(data) {
  const num = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);
  data.rooms = (Array.isArray(data.rooms) ? data.rooms : []).map(r => ({
    ...r, key: String(r.key ?? r.name), name: String(r.name ?? '?'), path: String(r.path ?? ''), liveCount: num(r.liveCount), activity: num(r.activity), role: roleOf(String(r.name ?? ''), String(r.path ?? '')),
    agents: (Array.isArray(r.agents) ? r.agents : []).map(a => ({
      ...a, id: String(a.id), name: String(a.name ?? a.id), title: String(a.title ?? ''), cwd: String(a.cwd ?? ''), status: a.status in STATUS ? a.status : 'sleeping', kind: a.kind in KIND ? a.kind : 'claude',
      attention: a.attention === 'ask' || a.attention === 'done' ? a.attention : null, attentionAt: num(a.attentionAt), lastText: String(a.lastText ?? ''), activity: String(a.activity ?? ''), lastReply: String(a.lastReply ?? ''),
      lastActive: num(a.lastActive), subagentTotal: num(a.subagentTotal), subagents: Array.isArray(a.subagents) ? a.subagents : [],
    })),
  }));
  return data;
}
const viewOf = (data) => { const s = $('showSleep').checked; return { ...data, rooms: data.rooms.map(r => ({ ...r, agents: r.agents.filter(a => s || a.status !== 'sleeping') })).filter(r => r.agents.length) }; };

let sig = '', hudSig = '', busy = false, tAcc = 0;
const ghosts = new Map();
async function refresh() {
  if (busy || document.hidden) return; busy = true;
  try {
    const res = await fetch('/api/world', { cache: 'no-store' }); if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = normalize(await res.json()), v = viewOf(data);
    for (const gh of ghosts.values()) { const r = v.rooms.find(x => x.key === gh.roomKey); if (r && !r.agents.some(x => x.id === gh.agent.id)) r.agents.push(gh.agent); }   // a dismissed agent stays visible while it walks to the lift
    G.lastData = v; computeFloors(v); computeCalled(v); $('err').hidden = true;
    if (!riding) {
      const s = floorSig();
      if (s !== sig) { buildCurrentFloor(); sig = s; } else syncActors(v);
      for (const a of G.actors) { const r = G.floor.projectRooms.find(x => x.key === a.roomKey); if (r) a.roomProject = r.name; }
      if (!firstDone) {
        firstDone = true;
        const fno = Number(P_.get('floor')); if (fno && G.floors.some(f => f.no === fno) && fno !== G.floorNo) { G.floorNo = fno; buildCurrentFloor(); sig = floorSig(); }
        placePlayer(G.player, G.floorNo, G.floor.office ? G.floor.office.spawn : G.floor.lift.center, Math.PI);
        overview(true);
        if (P_.has('demo')) $('demo').click();
        const sim = Number(P_.get('sim')) || 0; for (let i = 0; i < sim * 30; i++) { tAcc += 1 / 30; updateActors(G.floor, 1 / 30, tAcc); }
        const q = P_.get('room'), rd = q && ({ fun: G.floor.plan.fun, toilet: G.floor.plan.toilet, lift: G.floor.plan.lift, office: G.floor.plan.office, p0: G.floor.plan.projects[0], p1: G.floor.plan.projects[1], p2: G.floor.plan.projects[2] })[q];
        if (q === 'me') followPlayer(true, true); else if (rd) { focusRoom(rd); Object.assign(G.cam, camGoal); camGoal = null; }
        const wt = Number(P_.get('walktest')) || 0;
        if (wt) { for (let i = 0; i < 120; i++) { tAcc += 1 / 30; updateActors(G.floor, 1 / 30, tAcc); } G.actors.slice().sort((x, y) => y.agent.live - x.agent.live).slice(0, 4).forEach((a, i) => demo.set(a.agent.id, i % 2 ? 'done' : 'ask')); computeCalled(G.lastData); buildCurrentFloor(); sig = floorSig(); for (let i = 0; i < wt * 30; i++) { tAcc += 1 / 30; updateActors(G.floor, 1 / 30, tAcc); } }
        if (P_.has('selftest')) runSelfTest();
        const ch = P_.get('chat'); if (ch) { const a = G.actors.find(x => x.agent.name.includes(ch)); if (a) openChat(a); }   // opens the panel only; never sends anything
        if (P_.get('ride')) rideTo(Number(P_.get('ride')));
        const sel = P_.get('select'); if (sel) { const a = G.actors.find(x => x.agent.name.includes(sel)) || G.actors[0]; if (a) { selectAgent(a.agent.id); if (P_.has('fire')) { startFire(); if (P_.get('fire') === '2') loadAchv(a.agent.id, true); } } }
        const gd = P_.get('guard'); if (gd !== null && G.guards[0]) selectGuard(G.guards[Number(gd) || 0]);
        if (P_.get('modal') === 'security' && G.floor.projectRooms[0]) openSecurity(G.floor.projectRooms[0].key);
      }
    }
    const h = JSON.stringify([v.stats, G.floorNo, G.callOrder, G.blocked, v.rooms.map(r => [r.key, r.liveCount, r.agents.map(a => [a.id, a.status, a.name])])]) + Math.floor(Date.now() / 8000) + G.selectedId;
    if (h !== hudSig && G.floor) { hudSig = h; renderHud(data); if (panel && panel.mode === 'info' && !panel.loading) renderAgentPanel(); if (liftShown) renderLift(); }
    $('upd').textContent = 'Diperbarui ' + new Date(data.generatedAt || Date.now()).toLocaleTimeString('id-ID');
  } catch (e) { console.error(e); $('err').textContent = 'Gagal memuat data agent: ' + e.message; $('err').hidden = false; }
  finally { busy = false; }
}
function forceRefresh() { sig = ''; hudSig = ''; refresh(); }
$('showSleep').onchange = forceRefresh;
document.addEventListener('visibilitychange', () => { if (!document.hidden) refresh(); });
(function loopPoll() { refresh().finally(() => setTimeout(loopPoll, 3000)); })();

addEventListener('keydown', e => {
  if (e.key === 'Escape') { selectAgent(null); closeModal(); }
  if (e.key.toLowerCase() === 'c' && !e.ctrlKey && !e.metaKey && !(e.target && /INPUT|TEXTAREA/.test(e.target.tagName))) followPlayer(!G.follow);
  if (liftShown && !riding && /^[1-9]$/.test(e.key)) { const n = Number(e.key); if (G.floors.some(f => f.no === n)) rideTo(n); }
});
$('proj').addEventListener('click', e => { if (e.target === $('proj')) closeModal(); });

// ?selftest=1 : check that agent routes between key places don't cut through walls or furniture
function runSelfTest() {
  const f = G.floor, S = f.slots, out = [], gp0 = Object.values(f.guardPosts)[0];
  const T = { fun: S.fun.byKey.sofaA2.pos, pp: S.fun.byKey.pp0.pos, pp1: S.fun.byKey.pp1.pos, coffee: S.fun.byKey.coffee.pos, stall: S.toilet.stalls[2].pos, urinal: S.toilet.urinals[0].pos, lift: f.lift.center, office: f.office ? f.office.spawn : null, hall: P(10, -1), guardConsole: gp0 ? gp0.console.pos : null, guardBlock: gp0 ? gp0.block.pos : null, guardPost: gp0 ? gp0.post.pos : null };
  const from = [...f.desks.values()].filter((d, i, a) => i % Math.ceil(a.length / 6) === 0).map(d => d.stand), pairs = [];
  for (const d of from) for (const [k, v] of Object.entries(T)) if (v) pairs.push(['desk@' + d.x.toFixed(0) + ',' + d.z.toFixed(0), d, k, v]);
  for (const [k1, v1] of Object.entries(T)) for (const [k2, v2] of Object.entries(T)) if (v1 && v2 && k1 !== k2) pairs.push([k1, v1, k2, v2]);
  let bad = 0;
  for (const [n1, a, n2, b] of pairs) {
    const r = [a, ...route(f, a, b)]; let hit = null;
    for (let i = 1; i < r.length && !hit; i++) {
      const len = dist(r[i], r[i - 1]);
      for (let s = 0; s <= len; s += 0.2) {
        const k = len ? s / len : 0, q = P(r[i - 1].x + (r[i].x - r[i - 1].x) * k, r[i - 1].z + (r[i].z - r[i - 1].z) * k);
        if (dist(q, a) < 1.6 || dist(q, b) < 1.6 || (q.z > S.toilet.room.cz + 2.0 && q.x > S.toilet.room.x0 && q.x < S.toilet.room.x1)) continue;
        if (blocked(q.x, q.z, f.obstacles, 0.35)) { hit = q; break; }
      }
    }
    if (hit) { bad++; out.push(n1 + ' -> ' + n2 + ' blocked at ' + hit.x.toFixed(1) + ',' + hit.z.toFixed(1)); }
  }
  const NL = String.fromCharCode(10);
  document.body.insertAdjacentHTML('beforeend', '<pre id="selftest" style="position:fixed;left:0;top:0;z-index:99;background:#000;color:#0f0;font-size:11px">SELFTEST routes=' + pairs.length + ' blocked=' + bad + ' spawnBlocked=' + (f.office ? blocked(f.office.spawn.x, f.office.spawn.z, f.obstacles, 0.45) : 'n/a') + NL + out.slice(0, 25).join(NL) + '</pre>');
}

// ---------- main loop ----------
let last = performance.now();
function frame(now) {
  const dt = Math.min((now - last) / 1000, 0.1) * TIME_SCALE; last = now; const t = reduceMotion ? 0 : (tAcc += dt);
  const f = G.floor, pl = G.player;
  if (f) {
    updateActors(f, dt, t); updatePlayer(pl, dt, f, riding);
    const lift = f.lift, near = pl.floorNo === f.no && dist(pl.pos, lift.center) < 6.5;
    lift.open += ((liftOverride ?? (near ? 1 : 0)) - lift.open) * damp(5, dt);
    if (!riding) { const inLift = inZone(pl.pos, lift.zone); if (!inLift) liftLock = false; if (inLift && !liftLock && !liftShown) showLift(); else if (liftShown && (!inLift || liftLock)) hideLift(); }
  }
  if (camGoal) { const k = reduceMotion ? 1 : damp(6, dt); G.cam.x += (camGoal.x - G.cam.x) * k; G.cam.z += (camGoal.z - G.cam.z) * k; G.cam.zoom += (camGoal.zoom - G.cam.zoom) * k; if (Math.abs(camGoal.x - G.cam.x) + Math.abs(camGoal.z - G.cam.z) + Math.abs(camGoal.zoom - G.cam.zoom) < 0.01) camGoal = null; }
  else if (G.follow) { const k = damp(8, dt); G.cam.x += (pl.pos.x - G.cam.x - (sidebarPx() / 2) / (UNIT * G.cam.zoom)) * k; G.cam.z += (pl.pos.z - 1 - G.cam.z) * k; }
  draw(ctx, t); requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
