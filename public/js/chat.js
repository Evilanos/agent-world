// Chat panel: talk to / give commands to an agent, or talk to a project's Security guard. Replies stream in like a conversation.
import { G, STATUS, KIND, ROLES, $, el, trunc } from './core.js';
import * as S from './shapes.js';

let cur = null;          // { id, actor, sec, busy, ctrl, info, mode, msgs, ... }
G.chatSeen = new Map();  // agent id -> time of the last reply (so the "selesai" call doesn't fire again for a chat)
const MAX_SAVED = 60, NL = String.fromCharCode(10), FENCE = String.fromCharCode(96).repeat(3);

const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage blocked */ } },
};
const TOOL_LABEL = { Edit: 'Mengedit', Write: 'Menulis', MultiEdit: 'Mengedit', Read: 'Membaca', Grep: 'Mencari', Glob: 'Mencari', Bash: 'Menjalankan', PowerShell: 'Menjalankan', Task: 'Mendelegasikan', WebSearch: 'Riset web', WebFetch: 'Membaca web' };
const SEC_QUICK = [
  ['Rangkum risiko terbesar', 'Rangkum risiko terbesar di project ini dan urutkan berdasarkan prioritas.'],
  ['Verifikasi + prompt perbaikan', 'Verifikasi temuan yang tinggi/sedang dengan membaca kodenya, lalu buatkan satu prompt perbaikan yang bisa saya lempar ke agent project ini.'],
  ['Prompt untuk semua temuan nyata', 'Buatkan prompt perbaikan untuk semua temuan yang benar-benar celah (abaikan false positive) agar bisa saya lempar ke agent project ini.'],
];

function avatar(actor) {
  const c = el('canvas', { width: 64, height: 64, className: 'avatar' }), ctx = c.getContext('2d');
  ctx.setTransform(22, 0, 0, 22, 32, 60);
  S.drawChar(ctx, { x: 0, z: 0, facing: 'down', pose: 'stand', role: actor.role, statusColor: (STATUS[actor.agent.status] || STATUS.idle).color, kindColor: (KIND[actor.agent.kind] || KIND.claude).color }, 0);
  return c;
}

// opts: { prefill } fills the input without sending
export function openChat(actor, opts = {}) {
  const sec = actor.guard && actor.agent.projectKey ? { key: actor.agent.projectKey, name: actor.agent.projectName } : null;
  if (actor.guard && !sec) return;
  if (cur && cur.id === actor.agent.id) { $('chat').hidden = false; if (opts.prefill) { cur.input.value = opts.prefill; } cur.input.focus(); return; }
  closeChat();
  const id = actor.agent.id, a = actor.agent, role = ROLES[actor.role] || ROLES.casual, skey = sec ? 'sec:' + sec.key : id;
  cur = { id, actor, sec, skey, busy: false, ctrl: null, info: null, mode: store.get('aw-chatmode:' + id, 'safe'), msgs: store.get('aw-chat:' + skey, []), sawFork: false, prefillHint: '' };
  const box = $('chat');
  const msgs = el('div', { className: 'msgs', role: 'log', ariaLive: 'polite' });
  const banner = el('div', { className: 'banner', hidden: true });
  const who = sec ? 'Security' : a.name;
  const input = el('textarea', { rows: 2, placeholder: sec ? 'Tanya Security, atau minta dibuatkan prompt perbaikan…  (Enter kirim, Shift+Enter baris baru)' : `Tulis pesan atau perintah untuk ${a.name}…  (Enter kirim, Shift+Enter baris baru)`, ariaLabel: 'Pesan' });
  const sendBtn = el('button', { type: 'button', className: 'primary', textContent: 'Kirim' });
  const modeBtn = el('button', { type: 'button', className: 'mode' });
  const cost = el('span', { className: 'cost' });
  const quick = el('div', { className: 'quick' });
  Object.assign(cur, { msgsEl: msgs, bannerEl: banner, input, sendBtn, modeBtn, costEl: cost, total: store.get('aw-chatcost:' + skey, 0) });

  const head = el('div', { className: 'chead' }, avatar(actor),
    el('div', { className: 'who' }, el('b', { textContent: sec ? '🛡 Security · ' + trunc(sec.name, 24) : a.name }), el('small', { textContent: sec ? 'Penjaga ruangan · hanya baca' : `${role.label} · ${(STATUS[a.status] || STATUS.idle).label}` })),
    el('button', { className: 'close', textContent: '✕', ariaLabel: 'Tutup chat', onclick: closeChat }));
  box.replaceChildren(head, banner, el('div', { className: 'modebar' }, modeBtn, cost), msgs, quick, el('div', { className: 'composer' }, input, sendBtn));
  box.hidden = false;

  let greetEl = null;
  if (sec) greetEl = addMsg('s', securityGreeting(sec), false).bub;          // always fresh: it reflects the latest scan
  else if (!cur.msgs.length) cur.msgs.push({ r: 's', t: `Halo! Saya ${a.name}. Mau tanya sesuatu atau beri saya perintah?` });
  cur.msgs.forEach(m => addMsg(m.r, m.t, false));
  if (sec) SEC_QUICK.forEach(([label, text]) => quick.append(el('button', { type: 'button', className: 'qbtn', textContent: label, onclick: () => { if (!cur.busy) { cur.input.value = text; submit(); } } })));
  quick.hidden = !sec;
  renderMode(); renderCost(); scroll();
  sendBtn.onclick = () => (cur.busy ? stop() : submit());
  input.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); if (!cur.busy) submit(); } e.stopPropagation(); });
  modeBtn.onclick = () => { if (cur.sec) return; cur.mode = cur.mode === 'edit' ? 'safe' : 'edit'; store.set('aw-chatmode:' + id, cur.mode); renderMode(); };
  G.chatWith = id; G.chatTyping = false; G.chatBubble = '';
  if (opts.prefill) { input.value = opts.prefill; cur.prefillHint = 'Prompt dari Security sudah diisi di kolom pesan. Periksa dulu, aktifkan “Boleh mengedit file” agar agent boleh memperbaiki, lalu kirim.'; }
  input.focus();
  if (sec) {
    renderBanner();
    const rep = G.security[sec.key];
    if (!rep || rep.pending) fetch('/api/security?key=' + encodeURIComponent(sec.key)).then(x => x.json()).then(j => { if (j.report) { G.security[sec.key] = { ...j.report, _at: Date.now() }; if (cur && cur.sec && cur.sec.key === sec.key) { greetEl.textContent = securityGreeting(sec); renderBanner(); } } }).catch(() => {});
    return;
  }
  fetch('/api/chat/info?id=' + encodeURIComponent(id)).then(r => r.json()).then(info => { if (cur && cur.id === id) { cur.info = info; renderBanner(); } }).catch(() => {});
}

function securityGreeting(sec) {
  const rep = G.security[sec.key], c = rep && rep.counts;
  const s = rep && rep.skipped ? 'Folder ini bukan project, jadi saya tidak memindainya.' : c ? `Pemindaian terakhir: ${c.high} tinggi, ${c.medium} sedang, ${c.low} rendah.` : 'Laporan pemindaian sedang disiapkan…';
  return `Halo, saya Security untuk project ${sec.name}. ${s} Saya bisa menjelaskan temuan, memeriksa kodenya (hanya baca), dan membuatkan prompt perbaikan yang bisa Anda lempar ke agent project ini.`;
}

export function closeChat() {
  if (!cur) return;
  if (cur.busy && cur.ctrl) cur.ctrl.abort();
  $('chat').hidden = true; G.chatWith = null; G.chatTyping = false; G.chatBubble = ''; cur = null;
}
export const chatOpenId = () => (cur ? cur.id : null);

function renderBanner() {
  const b = cur.bannerEl; let t = '', bad = false;
  if (cur.sec) {
    const rep = G.security[cur.sec.key];
    t = rep && rep.skipped ? rep.note : 'Security hanya bisa membaca kode project (file rahasia seperti .env tidak dibaca). Ia tidak mengubah apa pun; prompt perbaikan dilempar sendiri oleh Anda ke agent project.';
    bad = !!(rep && rep.skipped); cur.input.disabled = cur.sendBtn.disabled = bad;
  } else {
    const i = cur.info;
    if (i) {
      if (!i.supported) t = i.reason;
      else if (i.tooLarge) t = `Riwayat sesi ini sangat besar (${i.sizeMB} MB), jadi tidak bisa dilanjutkan dari sini (terlalu lambat dan mahal).`;
      else if (i.forked || i.willFork) t = 'Agent ini sedang berjalan di tempat lain, jadi percakapan di sini memakai salinan (cabang) dari sesinya. Sesi aslinya tidak ikut mendengar pesan Anda.';
      else if (i.sizeMB > 20) t = `Riwayat sesi ${i.sizeMB} MB: balasan pertama bisa lambat dan memakai banyak token.`;
      bad = !i.supported || i.tooLarge; cur.input.disabled = cur.sendBtn.disabled = bad;
    }
  }
  if (cur.prefillHint) t = (t ? t + ' ' : '') + cur.prefillHint;
  b.hidden = !t; b.textContent = t; b.className = 'banner' + (bad ? ' bad' : '');
}
function renderMode() {
  if (cur.sec) { cur.modeBtn.textContent = '🔒 Hanya baca'; cur.modeBtn.className = 'mode'; cur.modeBtn.disabled = true; cur.modeBtn.title = 'Security tidak dapat mengubah file.'; return; }
  const edit = cur.mode === 'edit';
  cur.modeBtn.textContent = edit ? '✎ Boleh mengedit file' : '🔒 Mode aman (tanya & baca saja)';
  cur.modeBtn.className = 'mode' + (edit ? ' edit' : ''); cur.modeBtn.title = edit ? 'Agent boleh mengubah file di folder project. Klik untuk kembali ke mode aman.' : 'Agent hanya boleh membaca dan menjawab. Klik untuk mengizinkan edit file.';
}
function renderCost() { cur.costEl.textContent = cur.total ? `biaya percakapan ≈ $${cur.total.toFixed(2)}` : ''; }
const scroll = () => { const m = cur && cur.msgsEl; if (m) m.scrollTop = m.scrollHeight; };

// ---- message rendering: plain text + fenced code blocks (copy / send to a project agent) ----
async function copyText(t) {
  try { await navigator.clipboard.writeText(t); return true; }
  catch { const ta = el('textarea', { value: t }); document.body.append(ta); ta.select(); let ok = false; try { ok = document.execCommand('copy'); } catch { /* ignore */ } ta.remove(); return ok; }
}
function codeBlock(code) {
  const wrap = el('div', { className: 'code' }), pre = el('pre', { textContent: code });
  const copy = el('button', { type: 'button', textContent: 'Salin', onclick: async () => { copy.textContent = (await copyText(code)) ? 'Tersalin ✓' : 'Gagal menyalin'; setTimeout(() => { copy.textContent = 'Salin'; }, 1800); } });
  const bar = el('div', { className: 'codebar' }, copy);
  if (cur && cur.sec) {
    const menu = el('div', { className: 'agentmenu', hidden: true });
    const send = el('button', { type: 'button', className: 'primary', textContent: 'Kirim ke agent…', onclick: () => { menu.hidden = !menu.hidden; if (!menu.hidden) fillMenu(menu, code); } });
    bar.append(send); wrap.append(pre, bar, menu);
  } else wrap.append(pre, bar);
  return wrap;
}
function fillMenu(menu, code) {
  const key = cur.sec.key, room = (G.lastData ? G.lastData.rooms : []).find(r => r.key === key), list = room ? room.agents.filter(a => a.kind === 'claude') : [];
  list.sort((a, b) => (b.live - a.live) || b.lastActive - a.lastActive);
  menu.replaceChildren(el('small', { textContent: 'Pilih agent penerima. Prompt akan diisi di chat-nya (belum dikirim).' }),
    ...(list.length ? list.slice(0, 10).map(a => el('button', { type: 'button', textContent: `${trunc(a.name, 26)} · ${(STATUS[a.status] || STATUS.idle).label}`, onclick: () => sendToAgent(a.id, code) })) : [el('small', { textContent: 'Tidak ada agent Claude di project ini.' })]));
}
function sendToAgent(agentId, code) {
  const act = G.actors.find(x => x.agent.id === agentId);
  if (!act) { alert('Agent ini ada di lantai lain. Naik lift ke lantainya, lalu buka chat agent tersebut dan tempel prompt (gunakan tombol Salin).'); return; }
  openChat(act, { prefill: code });
}
function renderRich(bub, text) {
  bub.textContent = '';
  const re = new RegExp(FENCE + '[^\\n]*\\n([\\s\\S]*?)' + FENCE, 'g'); let last = 0, m;
  while ((m = re.exec(text))) { if (m.index > last) bub.append(document.createTextNode(text.slice(last, m.index).replace(/\n+$/, ''))); bub.append(codeBlock(m[1].replace(/\n+$/, ''))); last = re.lastIndex; }
  if (last < text.length) bub.append(document.createTextNode(text.slice(last).replace(/^\n+/, '')));
}

function addMsg(role, text, save = true) {
  const row = el('div', { className: 'msg ' + role });
  const bub = el('div', { className: 'bub' }); if (text) { if (role === 'a') renderRich(bub, text); else bub.textContent = text; }
  row.append(bub); cur.msgsEl.append(row);
  if (save && role !== 'x') { cur.msgs.push({ r: role, t: text }); persist(); }
  scroll(); return { row, bub };
}
function persist() { cur.msgs = cur.msgs.slice(-MAX_SAVED); store.set('aw-chat:' + cur.skey, cur.msgs); }

function setBusy(b) { cur.busy = b; cur.sendBtn.textContent = b ? 'Stop' : 'Kirim'; cur.sendBtn.className = b ? 'danger' : 'primary'; cur.input.disabled = b; G.chatTyping = b; }
function stop() { if (cur && cur.ctrl) cur.ctrl.abort(); }

async function submit() {
  const text = cur.input.value.trim(); if (!text || cur.busy) return;
  const mine = cur, id = cur.id;
  const history = mine.sec ? mine.msgs.filter(m => m.r === 'u' || m.r === 'a').slice(-12) : null;   // Security is stateless: we send the recent conversation
  cur.input.value = ''; mine.prefillHint = ''; if (mine.bannerEl) renderBanner(); addMsg('u', text); setBusy(true);
  const typing = addMsg('a', '', false); typing.bub.classList.add('typing'); typing.bub.append(el('i'), el('i'), el('i'));
  let answer = '', started = false; const chips = el('div', { className: 'chips2' }); typing.row.append(chips);
  mine.ctrl = new AbortController();
  try {
    const url = mine.sec ? '/api/chat/security' : '/api/chat', body = mine.sec ? { key: mine.sec.key, message: text, history } : { id, message: text, mode: mine.mode };
    const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-AW': '1' }, body: JSON.stringify(body), signal: mine.ctrl.signal });
    const rd = res.body.getReader(), dec = new TextDecoder(); let buf = '';
    for (;;) {
      const { done, value } = await rd.read(); if (done) break; buf += dec.decode(value, { stream: true });
      let i; while ((i = buf.indexOf(NL)) >= 0) {
        const line = buf.slice(0, i).trim(); buf = buf.slice(i + 1); if (!line) continue;
        let ev; try { ev = JSON.parse(line); } catch { continue; }
        if (cur !== mine) continue;
        if (ev.type === 'init') { if (ev.forked && !mine.sawFork && !mine.sec) { mine.sawFork = true; mine.info = { ...(mine.info || {}), forked: true, supported: true }; renderBanner(); } }
        else if (ev.type === 'delta') { if (!started) { started = true; typing.bub.classList.remove('typing'); } answer += ev.text; renderRich(typing.bub, answer); G.chatTyping = false; scroll(); }
        else if (ev.type === 'tool') chips.append(el('span', { className: 'chip2', textContent: `${TOOL_LABEL[ev.name] || ev.name} ${ev.target || ''}`.trim() }));
        else if (ev.type === 'result') {
          typing.bub.classList.remove('typing'); const final = answer || ev.text || '(tidak ada balasan teks)'; renderRich(typing.bub, final);
          mine.msgs.push({ r: 'a', t: final }); persist();
          for (const d of ev.denials || []) chips.append(el('span', { className: 'chip2 deny', textContent: `⛔ ${d.tool} ${d.target || ''} ditolak`.trim(), title: mine.sec ? 'Security hanya boleh membaca file non-rahasia.' : 'Mode aman tidak mengizinkan tindakan ini. Aktifkan "Boleh mengedit file" lalu minta lagi.' }));
          if (!mine.sec && ev.denials && ev.denials.length && mine.mode !== 'edit') typing.row.append(el('div', { className: 'hint2', textContent: 'Agent butuh izin untuk melakukan itu. Aktifkan “Boleh mengedit file” di atas lalu ulangi perintahnya.' }));
          if (ev.isError) typing.bub.classList.add('bad');
          if (ev.cost) { mine.total += ev.cost; store.set('aw-chatcost:' + mine.skey, mine.total); renderCost(); }
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

