// Draws one frame of the floor onto the 2D canvas, and answers "what is under the mouse?".
import { G, STATUS, KIND, ROLES, CALL, trunc } from './core.js';
import * as S from './shapes.js';

export const UNIT = 22;
export const view = { W: 0, H: 0, dpr: 1 };
const scale = () => UNIT * G.cam.zoom;
export const screenToWorld = (sx, sy) => ({ x: G.cam.x + (sx - view.W / 2) / scale(), z: G.cam.z + (sy - view.H / 2) / scale() });

function charOf(a) {
  return { x: a.st.pos.x, z: a.st.pos.z, facing: a.facing, moving: a.moving, walk: a.walk, pose: a.pose === 'walk' ? 'stand' : a.pose, sit: a.sit, role: a.role,
    statusColor: STATUS[a.agent.status] ? STATUS[a.agent.status].color : '#3ddc97', kindColor: (KIND[a.agent.kind] || KIND.claude).color, alpha: a.alpha };
}
const playerChar = (p) => {
  const dx = Math.sin(p.yaw), dz = Math.cos(p.yaw);
  return { x: p.pos.x, z: p.pos.z, facing: Math.abs(dx) > Math.abs(dz) ? (dx > 0 ? 'right' : 'left') : (dz >= 0 ? 'down' : 'up'), moving: p.moving, walk: p.walk, pose: 'stand', sit: 0, role: 'casual', human: true };
};

export function draw(ctx, t) {
  const { W, H, dpr } = view, f = G.floor, sc = scale() * dpr;
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#0b0f1a'; ctx.fillRect(0, 0, W * dpr, H * dpr);
  if (!f) return;
  ctx.setTransform(sc, 0, 0, sc, dpr * W / 2 - G.cam.x * sc, dpr * H / 2 - G.cam.z * sc);

  for (const g of f.ground) g(ctx);
  // walls: soft shadow, body, lighter top edge
  for (const w of f.walls) { ctx.fillStyle = 'rgba(0,0,0,.18)'; ctx.fillRect(w.x0, w.z0 + 0.22, w.x1 - w.x0, w.z1 - w.z0); }
  for (const w of f.walls) { ctx.fillStyle = w.color; ctx.fillRect(w.x0, w.z0, w.x1 - w.x0, w.z1 - w.z0); ctx.fillStyle = 'rgba(255,255,255,.22)'; ctx.fillRect(w.x0, w.z0, w.x1 - w.x0, Math.min(0.08, w.z1 - w.z0)); }

  const items = f.deco.map(d => ({ z: d.z, draw: d.draw }));
  const people = [...G.actors, ...G.guards].filter(a => !a.gone);
  for (const a of people) {
    items.push({ z: a.st.pos.z, draw: c => S.drawChar(c, charOf(a), t) });
    for (const h of a.helpers) items.push({ z: h.z, draw: c => { S.drawChar(c, { x: h.x, z: h.z, facing: 'down', pose: 'work', role: 'engineer', scale: 0.5, statusColor: '#ffb020', kindColor: '#8b7cf6' }, t + h.phase); } });
  }
  if (G.player && G.player.floorNo === f.no) items.push({ z: G.player.pos.z, draw: c => S.drawChar(c, playerChar(G.player), t) });
  items.sort((a, b) => a.z - b.z);
  for (const it of items) it.draw(ctx, t);

  // markers under feet
  for (const a of people) {
    const call = G.calledMap.get(a.agent.id), x = a.st.pos.x, z = a.st.pos.z;
    if (a.guard) continue;
    ctx.beginPath(); ctx.ellipse(x, z + 0.05, call ? 0.8 + Math.sin(t * 4) * 0.06 : 0.62, call ? 0.34 : 0.26, 0, 0, Math.PI * 2);
    ctx.strokeStyle = call ? CALL[call.kind].bg : (STATUS[a.agent.status] || STATUS.sleeping).color; ctx.globalAlpha = (a.alpha || 1) * (a.agent.live || call ? 0.9 : 0.3); ctx.lineWidth = call ? 0.1 : 0.07; ctx.stroke(); ctx.globalAlpha = 1;
  }
  if (G.selectedId) { const a = people.find(p => p.agent.id === G.selectedId); if (a) { ctx.beginPath(); ctx.ellipse(a.st.pos.x, a.st.pos.z + 0.05, 0.95, 0.42, 0, 0, Math.PI * 2); ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 0.09; ctx.setLineDash([0.25, 0.2]); ctx.stroke(); ctx.setLineDash([]); } }
  if (G.player && G.player.floorNo === f.no) { const p = G.player.pos; ctx.beginPath(); ctx.ellipse(p.x, p.z + 0.05, 0.7, 0.3, 0, 0, Math.PI * 2); ctx.strokeStyle = '#d8b25a'; ctx.lineWidth = 0.1; ctx.stroke(); }

  // overlays: name tags, speech bubbles, helper beams
  const zoom = G.cam.zoom, showNames = zoom > 0.55;
  for (const a of people) {
    if (a.alpha <= 0.05) continue;
    const x = a.st.pos.x, z = a.st.pos.z, top = z - (a.sit > 0.5 ? 1.9 : 2.3);
    for (const h of a.helpers) { ctx.globalAlpha = 0.35 + 0.45 * Math.abs(Math.sin(t * 3 + h.phase)); S.line(ctx, h.x, h.z - 0.9, a.st.pos.x, a.st.pos.z + 0.5, '#ffb020', 0.06, 'round'); ctx.globalAlpha = 1; }
    const call = G.calledMap.get(a.agent.id);
    let bz = top - 0.15;
    if (showNames) { const sub = a.agent.activity ? '✎ ' + a.agent.activity : (a.guard ? 'Security' : (ROLES[a.role] || ROLES.casual).label); S.pill(ctx, trunc(a.guard ? (a.agent.projectName || 'Security') : a.agent.name, 18), x, top - 0.45, 0.42, { sub: trunc(sub, 28), subFg: a.guard ? '#f2c200' : '#9aa4c0' }); bz = top - 1.5; }
    if (call && !a.moving) S.bubble(ctx, CALL[call.kind].bubble, x, bz - 0.1 + Math.sin(t * 3) * 0.05, 0.42, CALL[call.kind].bg, CALL[call.kind].fg, trunc(call.text || '', 26));
    else if (call) S.bubble(ctx, '!', x, bz, 0.5, CALL[call.kind].bg, CALL[call.kind].fg);
    else if (a.bubbleTxt) S.bubble(ctx, a.bubbleTxt, x, bz + Math.sin(t * 3 + a.phase) * 0.04, 0.5, 'rgba(255,255,255,.95)', '#10131c');
    if (a.pose === 'sleep' && !a.moving) { const k = (t * 0.4 + a.phase) % 1; ctx.globalAlpha = 1 - k; S.text(ctx, 'Z z', x + 0.6, top + 0.4 - k * 0.6, 0.5, '#cfd8ee', 'center', 800); ctx.globalAlpha = 1; }
  }
  if (G.player && G.player.floorNo === f.no) { const p = G.player.pos; S.pill(ctx, 'Anda', p.x, p.z - 2.6, 0.44, { bg: '#d8b25a', fg: '#0b0f1a' }); }
}

// what is at world position (wx, wz)?
export function pick(wx, wz) {
  const f = G.floor; if (!f) return null;
  let best = null, bd = 1e9;
  for (const a of [...G.actors, ...G.guards]) {
    if (a.gone) continue;
    const dx = Math.abs(wx - a.st.pos.x); if (dx > 0.7 || wz < a.st.pos.z - 2.2 || wz > a.st.pos.z + 0.3) continue;
    const d = dx + Math.abs(wz - (a.st.pos.z - 0.9)); if (d < bd) { bd = d; best = { type: a.guard ? 'guard' : 'agent', ref: a }; }
  }
  if (best) return best;
  for (const c of f.clicks) if (wx >= c.x0 && wx <= c.x1 && wz >= c.z0 && wz <= c.z1) return c;
  return null;
}
