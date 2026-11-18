// Chat panel: talk to / give commands to an agent from the UI. Replies stream in like a conversation.
import { G, STATUS, KIND, ROLES, $, el, trunc } from './core.js';
import * as S from './shapes.js';

let cur = null;          // { id, actor, busy, ctrl, info, mode, msgs, bubbleEl, ... }
G.chatSeen = new Map();  // agent id -> time of the last reply (so the "selesai" call doesn't fire again for a chat)
const MAX_SAVED = 60;

const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage blocked */ } },
};
const TOOL_LABEL = { Edit: 'Mengedit', Write: 'Menulis', MultiEdit: 'Mengedit', Read: 'Membaca', Grep: 'Mencari', Glob: 'Mencari', Bash: 'Menjalankan', PowerShell: 'Menjalankan', Task: 'Mendelegasikan', WebSearch: 'Riset web', WebFetch: 'Membaca web' };

function avatar(actor) {
  const c = el('canvas', { width: 64, height: 64, className: 'avatar' }), ctx = c.getContext('2d');
  ctx.setTransform(22, 0, 0, 22, 32, 60);
  S.drawChar(ctx, { x: 0, z: 0, facing: 'down', pose: 'stand', role: actor.role, statusColor: (STATUS[actor.agent.status] || STATUS.idle).color, kindColor: (KIND[actor.agent.kind] || KIND.claude).color }, 0);
  return c;
}

export function openChat(actor) {
  if (cur && cur.id === actor.agent.id) { $('chat').hidden = false; cur.input.focus(); return; }
  closeChat();
  const id = actor.agent.id, a = actor.agent, role = ROLES[actor.role] || ROLES.casual;
  cur = { id, actor, busy: false, ctrl: null, info: null, mode: store.get('aw-chatmode:' + id, 'safe'), msgs: store.get('aw-chat:' + id, []), reply: null, sawFork: false };
  const box = $('chat');
  const msgs = el('div', { className: 'msgs', role: 'log', ariaLive: 'polite' });
  const banner = el('div', { className: 'banner', hidden: true });
  const input = el('textarea', { rows: 2, placeholder: `Tulis pesan atau perintah untuk ${a.name}…  (Enter kirim, Shift+Enter baris baru)`, ariaLabel: 'Pesan untuk agent' });
  const sendBtn = el('button', { type: 'button', className: 'primary', textContent: 'Kirim' });
  const modeBtn = el('button', { type: 'button', className: 'mode' });
  const cost = el('span', { className: 'cost' });
  Object.assign(cur, { msgsEl: msgs, bannerEl: banner, input, sendBtn, modeBtn, costEl: cost, total: store.get('aw-chatcost:' + id, 0) });

  const head = el('div', { className: 'chead' }, avatar(actor),
    el('div', { className: 'who' }, el('b', { textContent: a.name }), el('small', { textContent: `${role.label} · ${(STATUS[a.status] || STATUS.idle).label}` })),
    el('button', { className: 'close', textContent: '✕', ariaLabel: 'Tutup chat', onclick: closeChat }));
  box.replaceChildren(head, banner, el('div', { className: 'modebar' }, modeBtn, cost), msgs, el('div', { className: 'composer' }, input, sendBtn));
  box.hidden = false;

  if (!cur.msgs.length) cur.msgs.push({ r: 's', t: `Halo! Saya ${a.name}. Mau tanya sesuatu atau beri saya perintah?` });
  cur.msgs.forEach(m => addMsg(m.r, m.t, false));
  renderMode(); renderCost(); scroll();
  sendBtn.onclick = () => (cur.busy ? stop() : submit());
  input.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); if (!cur.busy) submit(); } e.stopPropagation(); });
  modeBtn.onclick = () => { cur.mode = cur.mode === 'edit' ? 'safe' : 'edit'; store.set('aw-chatmode:' + id, cur.mode); renderMode(); };
  G.chatWith = id; G.chatTyping = false; G.chatBubble = '';
  input.focus();

  fetch('/api/chat/info?id=' + encodeURIComponent(id)).then(r => r.json()).then(info => { if (cur && cur.id === id) { cur.info = info; renderBanner(); } }).catch(() => {});
}

export function closeChat() {
  if (!cur) return;
  if (cur.busy && cur.ctrl) cur.ctrl.abort();
  $('chat').hidden = true; G.chatWith = null; G.chatTyping = false; G.chatBubble = ''; cur = null;
}
export const chatOpenId = () => (cur ? cur.id : null);

function renderBanner() {
  const i = cur.info, b = cur.bannerEl; let t = '';
  if (!i) return;
  if (!i.supported) t = i.reason;
  else if (i.tooLarge) t = `Riwayat sesi ini sangat besar (${i.sizeMB} MB), jadi tidak bisa dilanjutkan dari sini (terlalu lambat dan mahal).`;
  else if (i.forked || i.willFork) t = 'Agent ini sedang berjalan di tempat lain, jadi percakapan di sini memakai salinan (cabang) dari sesinya. Sesi aslinya tidak ikut mendengar pesan Anda.';
  else if (i.sizeMB > 20) t = `Riwayat sesi ${i.sizeMB} MB: balasan pertama bisa lambat dan memakai banyak token.`;
  b.hidden = !t; b.textContent = t; b.className = 'banner' + (!i.supported || i.tooLarge ? ' bad' : '');
  cur.input.disabled = cur.sendBtn.disabled = !i.supported || i.tooLarge;
}
function renderMode() {
  const edit = cur.mode === 'edit';
  cur.modeBtn.textContent = edit ? '✎ Boleh mengedit file' : '🔒 Mode aman (tanya & baca saja)';
  cur.modeBtn.className = 'mode' + (edit ? ' edit' : ''); cur.modeBtn.title = edit ? 'Agent boleh mengubah file di folder project. Klik untuk kembali ke mode aman.' : 'Agent hanya boleh membaca dan menjawab. Klik untuk mengizinkan edit file.';
}
function renderCost() { cur.costEl.textContent = cur.total ? `biaya percakapan ≈ $${cur.total.toFixed(2)}` : ''; }
const scroll = () => { const m = cur && cur.msgsEl; if (m) m.scrollTop = m.scrollHeight; };

function addMsg(role, text, save = true) {
  const row = el('div', { className: 'msg ' + role });
  const bub = el('div', { className: 'bub' }); if (text) bub.textContent = text;
  row.append(bub); cur.msgsEl.append(row);
  if (save && role !== 'x') { cur.msgs.push({ r: role, t: text }); persist(); }
  scroll(); return { row, bub };
}
function persist() { cur.msgs = cur.msgs.slice(-MAX_SAVED); store.set('aw-chat:' + cur.id, cur.msgs); }

function setBusy(b) { cur.busy = b; cur.sendBtn.textContent = b ? 'Stop' : 'Kirim'; cur.sendBtn.className = b ? 'danger' : 'primary'; cur.input.disabled = b; G.chatTyping = b; }
function stop() { if (cur && cur.ctrl) cur.ctrl.abort(); }

async function submit() {
  const text = cur.input.value.trim(); if (!text || cur.busy) return;
  const mine = cur, id = cur.id;
  cur.input.value = ''; addMsg('u', text); setBusy(true);
  const typing = addMsg('a', '', false); typing.bub.classList.add('typing'); typing.bub.append(el('i'), el('i'), el('i'));
  let answer = '', started = false; const chips = el('div', { className: 'chips2' }); typing.row.append(chips);
  mine.ctrl = new AbortController();
  try {
    const res = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-AW': '1' }, body: JSON.stringify({ id, message: text, mode: mine.mode }), signal: mine.ctrl.signal });
    const rd = res.body.getReader(), dec = new TextDecoder(); let buf = '';
    for (;;) {
      const { done, value } = await rd.read(); if (done) break; buf += dec.decode(value, { stream: true });
      let i; while ((i = buf.indexOf('\n')) >= 0) {
        const line = buf.slice(0, i).trim(); buf = buf.slice(i + 1); if (!line) continue;
        let ev; try { ev = JSON.parse(line); } catch { continue; }
        if (cur !== mine) continue;
        if (ev.type === 'init') { if (ev.forked && !mine.sawFork) { mine.sawFork = true; mine.info = { ...(mine.info || {}), forked: true, supported: true }; renderBanner(); } }
        else if (ev.type === 'delta') { if (!started) { started = true; typing.bub.classList.remove('typing'); typing.bub.textContent = ''; } answer += ev.text; typing.bub.textContent = answer; G.chatTyping = false; scroll(); }
        else if (ev.type === 'tool') chips.append(el('span', { className: 'chip2', textContent: `${TOOL_LABEL[ev.name] || ev.name} ${ev.target || ''}`.trim() }));
        else if (ev.type === 'result') {
          typing.bub.classList.remove('typing'); const final = answer || ev.text || '(tidak ada balasan teks)'; typing.bub.textContent = final;
          mine.msgs.push({ r: 'a', t: final }); persist();
          for (const d of ev.denials || []) chips.append(el('span', { className: 'chip2 deny', textContent: `⛔ ${d.tool} ${d.target || ''} ditolak`.trim(), title: 'Mode aman tidak mengizinkan tindakan ini. Aktifkan "Boleh mengedit file" lalu minta lagi.' }));
          if (ev.denials && ev.denials.length && mine.mode !== 'edit') typing.row.append(el('div', { className: 'hint2', textContent: 'Agent butuh izin untuk melakukan itu. Aktifkan “Boleh mengedit file” di atas lalu ulangi perintahnya.' }));
          if (ev.isError) typing.bub.classList.add('bad');
          if (ev.cost) { mine.total += ev.cost; store.set('aw-chatcost:' + id, mine.total); renderCost(); }
          G.chatSeen.set(id, Date.now()); G.chatBubble = trunc(final.replace(/\s+/g, ' '), 38); setTimeout(() => { if (G.chatBubble) G.chatBubble = ''; }, 9000);
        }
        else if (ev.type === 'error') { typing.bub.classList.remove('typing'); typing.bub.classList.add('bad'); typing.bub.textContent = ev.message || 'Terjadi kesalahan.'; if (ev.status === 413) { mine.info = { ...(mine.info || {}), tooLarge: true, supported: true, sizeMB: mine.info ? mine.info.sizeMB : 0 }; renderBanner(); } }
      }
    }
  } catch (e) {
    if (cur === mine) { typing.bub.classList.remove('typing'); if (e.name === 'AbortError') { typing.bub.textContent = answer ? answer + ' …(dihentikan)' : '(dihentikan)'; if (answer) { mine.msgs.push({ r: 'a', t: answer }); persist(); } } else { typing.bub.classList.add('bad'); typing.bub.textContent = 'Gagal terhubung: ' + e.message; } }
  } finally {
    if (cur === mine) { setBusy(false); mine.ctrl = null; if (!mine.input.disabled) mine.input.focus(); scroll(); }
  }
}

