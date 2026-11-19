// Chat panel: talk to / give commands to an agent, or talk to a project's Security guard. Replies stream in like a conversation.
import { G, STATUS, KIND, ROLES, $, el, trunc, t, toolLabel } from './core.js';
import { getLang } from './i18n.js';
import * as S from './shapes.js';

let cur = null;          // { id, actor, sec, busy, ctrl, info, mode, msgs, ... }
G.chatSeen = new Map();  // agent id -> time of the last reply (so the "selesai" call doesn't fire again for a chat)
const MAX_SAVED = 60, NL = String.fromCharCode(10), FENCE = String.fromCharCode(96).repeat(3);

const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage blocked */ } },
};
const secQuick = () => [['c.q1.label', 'c.q1.text'], ['c.q2.label', 'c.q2.text'], ['c.q3.label', 'c.q3.text']].map(([l, x]) => [t(l), t(x)]);

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
  cur = { id, actor, sec, skey, busy: false, ctrl: null, info: null, mode: store.get('aw-chatmode:' + id, 'safe'), msgs: store.get('aw-chat:' + skey, []).filter(m => m.r !== 's'), sawFork: false, prefillHint: '' };
  const box = $('chat');
  const msgs = el('div', { className: 'msgs', role: 'log', ariaLive: 'polite' });
  const banner = el('div', { className: 'banner', hidden: true });
  const input = el('textarea', { rows: 2, placeholder: sec ? t('c.phSec') : t('c.phAgent', { name: a.name }), ariaLabel: t('c.msgAria') });
  const sendBtn = el('button', { type: 'button', className: 'primary', textContent: t('c.send') });
  const modeBtn = el('button', { type: 'button', className: 'mode' });
  const cost = el('span', { className: 'cost' });
  const quick = el('div', { className: 'quick' });
  Object.assign(cur, { msgsEl: msgs, bannerEl: banner, input, sendBtn, modeBtn, costEl: cost, total: store.get('aw-chatcost:' + skey, 0) });

  const head = el('div', { className: 'chead' }, avatar(actor),
    el('div', { className: 'who' }, el('b', { textContent: sec ? t('c.secTitle', { name: trunc(sec.name, 24) }) : a.name }), el('small', { textContent: sec ? t('c.secSub') : t('c.agentSub', { role: role.label, status: (STATUS[a.status] || STATUS.idle).label }) })),
    el('button', { className: 'close', textContent: '✕', ariaLabel: t('c.closeAria'), onclick: closeChat }));
  box.replaceChildren(head, banner, el('div', { className: 'modebar' }, modeBtn, cost), msgs, quick, el('div', { className: 'composer' }, input, sendBtn));
  box.hidden = false;

  let greetEl = null;
  if (sec) greetEl = addMsg('s', securityGreeting(sec), false).bub;          // always fresh: it reflects the latest scan
  else addMsg('s', t('c.greetAgent', { name: a.name }), false);
  cur.msgs.forEach(m => addMsg(m.r, m.t, false));
  if (sec) secQuick().forEach(([label, text]) => quick.append(el('button', { type: 'button', className: 'qbtn', textContent: label, onclick: () => { if (!cur.busy) { cur.input.value = text; submit(); } } })));
  quick.hidden = !sec;
  renderMode(); renderCost(); scroll();
  sendBtn.onclick = () => (cur.busy ? stop() : submit());
  input.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); if (!cur.busy) submit(); } e.stopPropagation(); });
  modeBtn.onclick = () => { if (cur.sec) return; cur.mode = cur.mode === 'edit' ? 'safe' : 'edit'; store.set('aw-chatmode:' + id, cur.mode); renderMode(); };
  G.chatWith = id; G.chatTyping = false; G.chatBubble = '';
  if (opts.prefill) { input.value = opts.prefill; cur.prefillHint = t('c.prefillHint'); }
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
  const scan = rep && rep.skipped ? t('c.scanSkipped') : c ? t('c.scanCounts', { h: c.high, m: c.medium, l: c.low }) : t('c.scanPending');
  return t('c.greetSec', { name: sec.name, scan });
}

export function closeChat() {
  if (!cur) return;
  if (cur.busy && cur.ctrl) cur.ctrl.abort();
  $('chat').hidden = true; G.chatWith = null; G.chatTyping = false; G.chatBubble = ''; cur = null;
}
export const chatOpenId = () => (cur ? cur.id : null);

function renderBanner() {
  const b = cur.bannerEl; let txt = '', bad = false;
  if (cur.sec) {
    const rep = G.security[cur.sec.key];
    txt = rep && rep.skipped ? t('sm.skipped') : t('c.secBanner');
    bad = !!(rep && rep.skipped); cur.input.disabled = cur.sendBtn.disabled = bad;
  } else {
    const i = cur.info;
    if (i) {
      if (!i.supported) txt = t('e.not-supported');
      else if (i.tooLarge) txt = t('c.bannerLarge', { mb: i.sizeMB });
      else if (i.forked || i.willFork) txt = t('c.bannerFork');
      else if (i.sizeMB > 20) txt = t('c.bannerSize', { mb: i.sizeMB });
      bad = !i.supported || i.tooLarge; cur.input.disabled = cur.sendBtn.disabled = bad;
    }
  }
  if (cur.prefillHint) txt = (txt ? txt + ' ' : '') + cur.prefillHint;
  b.hidden = !txt; b.textContent = txt; b.className = 'banner' + (bad ? ' bad' : '');
}
function renderMode() {
  if (cur.sec) { cur.modeBtn.textContent = t('c.modeRO'); cur.modeBtn.className = 'mode'; cur.modeBtn.disabled = true; cur.modeBtn.title = t('c.modeROtip'); return; }
  const edit = cur.mode === 'edit';
  cur.modeBtn.textContent = edit ? t('c.modeEdit') : t('c.modeSafe');
  cur.modeBtn.className = 'mode' + (edit ? ' edit' : ''); cur.modeBtn.title = edit ? t('c.modeTipEdit') : t('c.modeTipSafe');
}
function renderCost() { cur.costEl.textContent = cur.total ? t('c.cost', { v: cur.total.toFixed(2) }) : ''; }
const scroll = () => { const m = cur && cur.msgsEl; if (m) m.scrollTop = m.scrollHeight; };

// ---- message rendering: plain text + fenced code blocks (copy / send to a project agent) ----
async function copyText(t) {
  try { await navigator.clipboard.writeText(t); return true; }
  catch { const ta = el('textarea', { value: t }); document.body.append(ta); ta.select(); let ok = false; try { ok = document.execCommand('copy'); } catch { /* ignore */ } ta.remove(); return ok; }
}
function codeBlock(code) {
  const wrap = el('div', { className: 'code' }), pre = el('pre', { textContent: code });
  const copy = el('button', { type: 'button', textContent: t('c.copy'), onclick: async () => { copy.textContent = (await copyText(code)) ? t('c.copied') : t('c.copyFail'); setTimeout(() => { copy.textContent = t('c.copy'); }, 1800); } });
  const bar = el('div', { className: 'codebar' }, copy);
  if (cur && cur.sec) {
    const menu = el('div', { className: 'agentmenu', hidden: true });
    const send = el('button', { type: 'button', className: 'primary', textContent: t('c.sendTo'), onclick: () => { menu.hidden = !menu.hidden; if (!menu.hidden) fillMenu(menu, code); } });
    bar.append(send); wrap.append(pre, bar, menu);
  } else wrap.append(pre, bar);
  return wrap;
}
function fillMenu(menu, code) {
  const key = cur.sec.key, room = (G.lastData ? G.lastData.rooms : []).find(r => r.key === key), list = room ? room.agents.filter(a => a.kind === 'claude') : [];
  list.sort((a, b) => (b.live - a.live) || b.lastActive - a.lastActive);
  menu.replaceChildren(el('small', { textContent: t('c.pickAgent') }),
    ...(list.length ? list.slice(0, 10).map(a => el('button', { type: 'button', textContent: `${trunc(a.name, 26)} · ${(STATUS[a.status] || STATUS.idle).label}`, onclick: () => sendToAgent(a.id, code) })) : [el('small', { textContent: t('c.noClaude') })]));
}
function sendToAgent(agentId, code) {
  const act = G.actors.find(x => x.agent.id === agentId);
  if (!act) { alert(t('c.otherFloor')); return; }
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

function setBusy(b) { cur.busy = b; cur.sendBtn.textContent = b ? t('c.stop') : t('c.send'); cur.sendBtn.className = b ? 'danger' : 'primary'; cur.input.disabled = b; G.chatTyping = b; }
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
    const url = mine.sec ? '/api/chat/security' : '/api/chat', body = mine.sec ? { key: mine.sec.key, message: text, history, lang: getLang() } : { id, message: text, mode: mine.mode };
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
        else if (ev.type === 'tool') chips.append(el('span', { className: 'chip2', textContent: toolLabel(ev.name, ev.target || '') }));
        else if (ev.type === 'result') {
          typing.bub.classList.remove('typing'); const final = answer || ev.text || t('c.noText'); renderRich(typing.bub, final);
          mine.msgs.push({ r: 'a', t: final }); persist();
          for (const d of ev.denials || []) chips.append(el('span', { className: 'chip2 deny', textContent: t('c.denied', { tool: d.tool, target: d.target || '' }).replace(/\s+$/, ''), title: mine.sec ? t('c.deniedTipSec') : t('c.deniedTipSafe') }));
          if (!mine.sec && ev.denials && ev.denials.length && mine.mode !== 'edit') typing.row.append(el('div', { className: 'hint2', textContent: t('c.needPerm') }));
          if (ev.isError) typing.bub.classList.add('bad');
          if (ev.cost) { mine.total += ev.cost; store.set('aw-chatcost:' + mine.skey, mine.total); renderCost(); }
          G.chatSeen.set(id, Date.now()); G.chatBubble = trunc(final.replace(/\s+/g, ' '), 38); setTimeout(() => { if (G.chatBubble) G.chatBubble = ''; }, 9000);
        }
        else if (ev.type === 'error') { typing.bub.classList.remove('typing'); typing.bub.classList.add('bad'); typing.bub.textContent = (ev.code && t('e.' + ev.code, { mb: ev.mb, detail: ev.detail || '' }) !== 'e.' + ev.code) ? t('e.' + ev.code, { mb: ev.mb, detail: ev.detail || '' }) : (ev.message || t('c.genericErr')); if (ev.status === 413) { mine.info = { ...(mine.info || {}), tooLarge: true, supported: true, sizeMB: mine.info ? mine.info.sizeMB : 0 }; renderBanner(); } }
      }
    }
  } catch (e) {
    if (cur === mine) { typing.bub.classList.remove('typing'); if (e.name === 'AbortError') { typing.bub.textContent = answer ? answer + t('c.abortedSuffix') : t('c.aborted'); if (answer) { mine.msgs.push({ r: 'a', t: answer }); persist(); } } else { typing.bub.classList.add('bad'); typing.bub.textContent = t('c.connFail', { msg: e.message }); } }
  } finally {
    if (cur === mine) { setBusy(false); mine.ctrl = null; if (!mine.input.disabled) mine.input.focus(); scroll(); }
  }
}


// Re-render the open chat after a language change (keeps history; skipped while a reply is streaming).
export function relocalizeChat() {
  if (!cur || cur.busy) return;
  const actor = cur.actor, keep = cur.input ? cur.input.value : '';
  closeChat(); openChat(actor); if (keep) $('chat').querySelector('textarea').value = keep;
}
