// 2D drawing primitives. Everything is drawn in world units (1 unit ≈ 22px at zoom 1); z grows downwards.
import { ROLES, KIND, trunc } from './core.js';

export function rr(ctx, x, z, w, d, r = 0.1) {
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(x, z, w, d, r); else ctx.rect(x, z, w, d);
}
export function box(ctx, x, z, w, d, fill, { r = 0.08, stroke = null, lw = 0.05 } = {}) {
  rr(ctx, x, z, w, d, r); ctx.fillStyle = fill; ctx.fill();
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.stroke(); }
}
export function circle(ctx, x, z, r, fill, stroke = null, lw = 0.05) {
  ctx.beginPath(); ctx.arc(x, z, r, 0, Math.PI * 2); ctx.fillStyle = fill; ctx.fill();
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.stroke(); }
}
export function line(ctx, x0, z0, x1, z1, color, w = 0.1, cap = 'round') {
  ctx.beginPath(); ctx.moveTo(x0, z0); ctx.lineTo(x1, z1); ctx.strokeStyle = color; ctx.lineWidth = w; ctx.lineCap = cap; ctx.stroke();
}
// text in world units: `size` is the font height in units
export function text(ctx, s, x, z, size, color = '#fff', align = 'center', weight = 600) {
  ctx.save(); ctx.translate(x, z); const k = size / 10; ctx.scale(k, k);
  ctx.font = `${weight} 10px system-ui, "Segoe UI", sans-serif`; ctx.textAlign = align; ctx.textBaseline = 'middle'; ctx.fillStyle = color; ctx.fillText(s, 0, 0); ctx.restore();
}
export function textWidth(ctx, s, size, weight = 600) {
  ctx.save(); ctx.font = `${weight} 10px system-ui, "Segoe UI", sans-serif`; const w = ctx.measureText(s).width * size / 10; ctx.restore(); return w;
}
export function pill(ctx, s, x, z, size, { bg = 'rgba(8,11,20,.78)', fg = '#fff', sub = null, subFg = '#9aa4c0', weight = 700, pad = 0.35 } = {}) {
  const w1 = textWidth(ctx, s, size, weight), w2 = sub ? textWidth(ctx, sub, size * 0.72, 500) : 0;
  const w = Math.max(w1, w2) + pad * 2, h = size * (sub ? 2.35 : 1.5);
  box(ctx, x - w / 2, z - h / 2, w, h, bg, { r: size * 0.35 });
  text(ctx, s, x, z - (sub ? size * 0.42 : 0), size, fg, 'center', weight);
  if (sub) text(ctx, sub, x, z + size * 0.62, size * 0.72, subFg, 'center', 500);
  return { w, h };
}
export function bubble(ctx, s, x, z, size, bg, fg, sub = null) {   // speech bubble with a tail pointing down at (x, z)
  const w1 = textWidth(ctx, s, size, 700), w2 = sub ? textWidth(ctx, sub, size * 0.7, 500) : 0, w = Math.max(w1, w2) + 0.5, h = size * (sub ? 2.3 : 1.5);
  const top = z - 0.25 - h;
  box(ctx, x - w / 2, top, w, h, bg, { r: size * 0.4 });
  ctx.beginPath(); ctx.moveTo(x - 0.14, top + h - 0.02); ctx.lineTo(x + 0.14, top + h - 0.02); ctx.lineTo(x, z); ctx.closePath(); ctx.fillStyle = bg; ctx.fill();
  text(ctx, s, x, top + (sub ? h * 0.33 : h / 2), size, fg, 'center', 700);
  if (sub) text(ctx, sub, x, top + h * 0.74, size * 0.7, fg, 'center', 500);
}

// ---------------- furniture ----------------
export function plant(ctx, x, z, s = 1) {
  circle(ctx, x, z + 0.1 * s, 0.34 * s, 'rgba(0,0,0,.2)');
  circle(ctx, x, z, 0.3 * s, '#b86f4b'); circle(ctx, x, z, 0.22 * s, '#6e4128');
  for (let i = 0; i < 6; i++) { const a = i * 1.05; circle(ctx, x + Math.cos(a) * 0.28 * s, z - 0.15 * s + Math.sin(a) * 0.2 * s, 0.3 * s, i % 2 ? '#2f9e5f' : '#3bb56f'); }
}
export function desk(ctx, cx, cz, color) {
  box(ctx, cx - 0.85, cz - 0.38, 1.7, 0.8, '#9a7650', { r: 0.06, stroke: '#7a5c3c' });
  box(ctx, cx - 0.85, cz + 0.3, 1.7, 0.12, '#7a5c3c', { r: 0.04 });
  box(ctx, cx - 0.5, cz - 0.34, 1.0, 0.16, '#0d111d', { r: 0.04 });           // monitor (seen from behind)
  box(ctx, cx - 0.44, cz - 0.2, 0.88, 0.1, color, { r: 0.03 }); ctx.globalAlpha = 0.9;
  ctx.globalAlpha = 1;
  box(ctx, cx - 0.27, cz + 0.02, 0.54, 0.15, '#20263a', { r: 0.03 });          // keyboard
  circle(ctx, cx + 0.55, cz + 0.08, 0.06, '#20263a');                          // mouse
  circle(ctx, cx - 0.62, cz + 0.1, 0.06, '#f2f2f2');                           // mug
}
export function chair(ctx, x, z, scale = 1) {
  circle(ctx, x, z, 0.34 * scale, '#2d3550', '#1a2033'); box(ctx, x - 0.3 * scale, z - 0.4 * scale, 0.6 * scale, 0.14 * scale, '#222a42', { r: 0.06 });
}
export function shelf(ctx, x, z, w, d) {
  box(ctx, x, z, w, d, '#7d5a3c', { r: 0.04, stroke: '#5d4129' });
  const cols = ['#d96c6c', '#6c9ed9', '#e0b44c', '#6cc39a', '#a08ad9', '#d9a06c'];
  if (d >= w) for (let i = 0; i < Math.floor(d / 0.3); i++) box(ctx, x + 0.12, z + 0.1 + i * 0.3, w - 0.24, 0.22, cols[i % 6], { r: 0.02 });
  else for (let i = 0; i < Math.floor(w / 0.3); i++) box(ctx, x + 0.1 + i * 0.3, z + 0.12, 0.22, d - 0.24, cols[i % 6], { r: 0.02 });
}
export function sofa(ctx, x, z, len, color, backSide = 'south') {
  const c2 = '#00000033';
  box(ctx, x - len / 2, z - 0.5, len, 1.0, color, { r: 0.18, stroke: c2 });
  const by = backSide === 'south' ? z + 0.28 : z - 0.5;
  box(ctx, x - len / 2, by, len, 0.22, 'rgba(0,0,0,.22)', { r: 0.1 });
  box(ctx, x - len / 2, z - 0.5, 0.22, 1.0, 'rgba(0,0,0,.18)', { r: 0.1 }); box(ctx, x + len / 2 - 0.22, z - 0.5, 0.22, 1.0, 'rgba(0,0,0,.18)', { r: 0.1 });
}
export function pingpong(ctx, x, z, ball) {
  box(ctx, x - 0.75, z - 1.35, 1.5, 2.7, '#1f6f4a', { r: 0.05, stroke: '#ffffff', lw: 0.04 });
  line(ctx, x, z - 1.35, x, z + 1.35, '#ffffff', 0.03); line(ctx, x - 0.8, z, x + 0.8, z, 'rgba(255,255,255,.85)', 0.07, 'butt');
  for (const dx of [-0.65, 0.65]) for (const dz of [-1.2, 1.2]) circle(ctx, x + dx, z + dz, 0.05, '#20263a');
  if (ball) circle(ctx, ball.x, ball.z, 0.07, '#fff3c4');
}
export function coffeeMachine(ctx, x, z) {
  box(ctx, x - 0.4, z - 0.6, 0.8, 1.2, '#6a3b2a', { r: 0.06 }); box(ctx, x - 0.3, z - 0.45, 0.5, 0.5, '#20263a', { r: 0.05 });
  box(ctx, x - 0.25, z + 0.1, 0.4, 0.06, '#ffb020', { r: 0.02 }); circle(ctx, x + 0.1, z + 0.35, 0.09, '#f4f4f4');
}
export function toilet(ctx, x, z) {     // back to the south wall, bowl faces north
  box(ctx, x - 0.26, z + 0.1, 0.52, 0.22, '#e8edf5', { r: 0.05, stroke: '#b9c3d4' });
  ctx.beginPath(); ctx.ellipse(x, z - 0.12, 0.24, 0.3, 0, 0, Math.PI * 2); ctx.fillStyle = '#f3f6fa'; ctx.fill(); ctx.strokeStyle = '#b9c3d4'; ctx.lineWidth = 0.05; ctx.stroke();
  ctx.beginPath(); ctx.ellipse(x, z - 0.12, 0.14, 0.2, 0, 0, Math.PI * 2); ctx.fillStyle = '#cfe6f5'; ctx.fill();
}
export function urinal(ctx, x, z) {      // on the east wall, faces west
  box(ctx, x - 0.2, z - 0.28, 0.4, 0.56, '#f3f6fa', { r: 0.12, stroke: '#b9c3d4' }); box(ctx, x - 0.4, z - 0.1, 0.22, 0.2, '#cfe6f5', { r: 0.05 });
}
export function sink(ctx, x, z) {         // on the west wall, faces east
  box(ctx, x - 0.2, z - 0.45, 0.5, 0.9, '#6e7a93', { r: 0.06 }); circle(ctx, x + 0.1, z, 0.26, '#f3f6fa', '#b9c3d4'); circle(ctx, x + 0.1, z, 0.12, '#cfe6f5');
  box(ctx, x - 0.26, z - 0.4, 0.06, 0.8, '#bfd8f0', { r: 0.02 });
}
export function rug(ctx, x, z, rx, rz, color) {
  ctx.beginPath(); ctx.ellipse(x, z, rx, rz, 0, 0, Math.PI * 2); ctx.fillStyle = color; ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,.18)'; ctx.lineWidth = 0.08; ctx.stroke();
}
export function rack(ctx, x, z, alert) {   // security console
  box(ctx, x - 0.6, z - 0.5, 1.2, 1.0, '#222a3d', { r: 0.06, stroke: '#0f1424' });
  box(ctx, x - 0.5, z - 0.4, 1.0, 0.5, '#0a1220', { r: 0.04 });
  for (let i = 0; i < 4; i++) circle(ctx, x - 0.36 + i * 0.24, z + 0.28, 0.05, i === 0 && alert ? '#ff4d4d' : '#3ddc97');
  text(ctx, '🛡', x, z - 0.15, 0.4, '#fff');
}

// ---------------- characters ----------------
const SKIN = '#e0ac8a';
function hands(c, sw, t) {
  const w = Math.sin(t * 16) * 0.08;
  switch (c.pose) {
    case 'work': case 'inspect': return [[0.22, 0.32 + w], [-0.22, 0.32 - w]];
    case 'sleep': return [[0.05, 0.5], [-0.05, 0.5]];
    case 'wave': return [[-0.1, 0.5], [0.38, -0.55 + Math.sin(t * 7) * 0.12]];
    case 'cheer': return [[-0.4, -0.55 + Math.sin(t * 8) * 0.1], [0.4, -0.55 - Math.sin(t * 8) * 0.1]];
    case 'sofa': case 'drink': return [[-0.08, 0.5], [0.22, -0.12 + Math.sin(t * 0.9) * 0.04]];
    case 'pingpong': return [[-0.1, 0.45], [0.55, 0.05 + Math.sin(t * 5) * 0.3]];
    case 'chat': return [[-0.1, 0.5], [0.45, -0.05 + Math.sin(t * 3) * 0.15]];
    case 'poop': return [[-0.3, 0.55], [0.3, 0.55]];
    case 'pee': return [[-0.15, 0.3], [0.15, 0.3]];
    case 'wash': return [[-0.1, 0.25 + w], [0.1, 0.25 - w]];
    case 'plead': return [[-0.12, -0.05 + Math.sin(t * 6) * 0.05], [0.12, -0.05 - Math.sin(t * 6) * 0.05]];
    case 'sad': return [[-0.16, -0.4], [0.16, -0.4]];
    case 'guard': return [[0.24, 0.28], [-0.24, 0.28]];
    case 'stop': return [[-0.1, 0.5], [0.12, -0.3]];       // hand raised: "stop"
    default: return [[-0.08, 0.55 - sw * 0.18], [0.08, 0.55 + sw * 0.18]];
  }
}

export function drawChar(ctx, c, t) {
  const role = ROLES[c.role] || ROLES.casual, human = c.human, dir = c.facing || 'down', moving = c.moving;
  const sw = moving ? Math.sin(c.walk * 5) : 0, sit = c.sit || 0, bob = moving ? Math.abs(Math.cos(c.walk * 5)) * 0.06 : 0;
  ctx.save(); ctx.translate(c.x, c.z); if (c.scale) ctx.scale(c.scale, c.scale); if (c.alpha != null) ctx.globalAlpha = c.alpha;
  ctx.beginPath(); ctx.ellipse(0, 0.04, 0.46, 0.17, 0, 0, Math.PI * 2); ctx.fillStyle = 'rgba(0,0,0,.28)'; ctx.fill();
  ctx.translate(0, sit * 0.3 - bob);
  const shirt = human ? '#2c5fd0' : role.shirt, pants = human ? '#1d2540' : role.pants;

  // legs
  for (const s of [-1, 1]) {
    const lift = moving ? Math.max(0, sw * s) * 0.14 : 0;
    if (sit > 0.5) box(ctx, s * 0.17 - 0.1, -0.34, 0.2, 0.3, pants, { r: 0.05 });
    else { box(ctx, s * 0.17 - 0.1, -0.56 - lift, 0.2, 0.52, pants, { r: 0.05 }); box(ctx, s * 0.17 - 0.12, -0.1 - lift, 0.24, 0.12, '#141a29', { r: 0.05 }); }
  }
  // hood (behind the head) for hoodies
  if (!human && c.role === 'engineer') box(ctx, -0.34, -1.5, 0.68, 0.3, '#4a5266', { r: 0.12 });
  // torso
  box(ctx, -0.38, -1.3, 0.76, 0.78, shirt, { r: 0.13, stroke: 'rgba(0,0,0,.25)' });
  const front = dir === 'down';
  if (human) { if (front) { ctx.beginPath(); ctx.moveTo(-0.12, -1.3); ctx.lineTo(0.12, -1.3); ctx.lineTo(0, -1.0); ctx.fillStyle = '#fff'; ctx.fill(); } }
  else switch (c.role) {
    case 'finance': if (front) { ctx.beginPath(); ctx.moveTo(-0.15, -1.3); ctx.lineTo(0.15, -1.3); ctx.lineTo(0, -0.98); ctx.fillStyle = '#fff'; ctx.fill();
      ctx.beginPath(); ctx.moveTo(-0.04, -1.2); ctx.lineTo(0.04, -1.2); ctx.lineTo(0.07, -0.78); ctx.lineTo(0, -0.7); ctx.lineTo(-0.07, -0.78); ctx.closePath(); ctx.fillStyle = role.accent; ctx.fill(); } break;
    case 'it': if (front) { line(ctx, 0.12, -1.3, 0.02, -0.98, '#e8f7f7', 0.05); box(ctx, -0.05, -1.0, 0.16, 0.22, '#ffffff', { r: 0.02, stroke: '#0a5f60' }); box(ctx, -0.03, -0.96, 0.12, 0.05, '#0f8b8d', { r: 0.01 }); box(ctx, -0.2, -1.3, 0.4, 0.07, '#e8f7f7', { r: 0.03 }); } break;
    case 'engineer': if (front) { line(ctx, -0.09, -1.28, -0.09, -1.0, '#cfd6e4', 0.04); line(ctx, 0.09, -1.28, 0.09, -1.0, '#cfd6e4', 0.04); box(ctx, -0.22, -0.82, 0.44, 0.2, 'rgba(0,0,0,.25)', { r: 0.05 }); } break;
    case 'game': if (front) { text(ctx, '★', 0, -0.95, 0.5, '#ffd84d'); } break;
    case 'ai': if (front) { line(ctx, 0, -1.3, 0, -0.52, '#c9d1e0', 0.04); box(ctx, 0.12, -1.02, 0.18, 0.2, '#e3e8f2', { r: 0.03 }); line(ctx, 0.17, -1.04, 0.17, -1.12, '#3b82f6', 0.04); } break;
    case 'design': box(ctx, -0.3, -1.12, 0.6, 0.56, '#c9a27a', { r: 0.08 }); line(ctx, -0.28, -1.3, -0.28, -1.1, '#c9a27a', 0.05); line(ctx, 0.28, -1.3, 0.28, -1.1, '#c9a27a', 0.05); break;
    case 'security': box(ctx, -0.38, -1.3, 0.76, 0.78, '#ff8a00', { r: 0.13 }); box(ctx, -0.38, -0.98, 0.76, 0.07, '#e6edf7', { r: 0.02 }); box(ctx, -0.38, -0.78, 0.76, 0.07, '#e6edf7', { r: 0.02 });
      box(ctx, -0.12, -1.3, 0.24, 0.78, '#1b2233', { r: 0.03 }); if (front) { box(ctx, 0.15, -1.2, 0.14, 0.12, '#f2c200', { r: 0.03 }); } box(ctx, 0.38, -0.7, 0.1, 0.34, '#0c0f18', { r: 0.03 }); break;
    default: if (front) box(ctx, 0.1, -1.1, 0.16, 0.14, 'rgba(255,255,255,.35)', { r: 0.03 });
  }
  // arms
  const hs = hands(c, sw, t), sleeve = c.role === 'ai' && !human ? '#e3e8f2' : shirt;
  const hp = [];
  [-1, 1].forEach((s, i) => {
    const sx = s * 0.44, sz = -1.15, hx = sx + hs[i][0] * (s === -1 ? 1 : 1), hz = sz + hs[i][1];
    line(ctx, sx, sz, hx, hz, sleeve, 0.2); circle(ctx, hx, hz, 0.1, human ? SKIN : '#cfd6e4'); hp.push([hx, hz]);
  });
  if (c.pose === 'sofa' || c.pose === 'drink') { box(ctx, hp[1][0] - 0.07, hp[1][1] - 0.18, 0.14, 0.16, '#f2f2f2', { r: 0.03, stroke: '#9aa4b8' }); }
  if (c.pose === 'pingpong') { circle(ctx, hp[1][0] + 0.12, hp[1][1] - 0.05, 0.17, '#d64545', '#7a1f1f'); }
  if (c.pose === 'stop' || c.pose === 'wave') { /* open hand */ }

  // head
  const hy = c.pose === 'sleep' ? -1.74 : -1.88, tilt = c.pose === 'sleep' ? 0.25 : (c.pose === 'wave' ? 0.1 : 0);
  ctx.save(); ctx.translate(0, hy + 0.3); ctx.rotate(tilt); ctx.translate(0, -0.3);
  const look = dir === 'left' ? -1 : dir === 'right' ? 1 : 0;
  if (human) {
    circle(ctx, 0, 0.0, 0.3, SKIN, 'rgba(0,0,0,.2)');
    if (dir === 'up') circle(ctx, 0, 0.0, 0.3, '#1b1410'); else { ctx.beginPath(); ctx.arc(0, -0.04, 0.31, Math.PI, 0); ctx.fillStyle = '#1b1410'; ctx.fill(); }
    if (dir !== 'up') { circle(ctx, look * 0.12 - 0.1, 0.04, 0.035, '#15110e'); circle(ctx, look * 0.12 + 0.1, 0.04, 0.035, '#15110e'); }
  } else {
    box(ctx, -0.33, -0.28, 0.66, 0.56, '#dfe4f2', { r: 0.12, stroke: '#9aa4b8' });
    if (dir === 'up') { box(ctx, -0.2, -0.16, 0.4, 0.3, '#c9d0e0', { r: 0.06 }); }
    else {
      const vx = look * 0.07; box(ctx, -0.26 + vx, -0.14, 0.52, 0.26, '#0a0d16', { r: 0.08 });
      const ec = c.statusColor || '#3ddc97';
      if (c.pose === 'sleep') { line(ctx, -0.14 + vx, -0.01, -0.04 + vx, -0.01, ec, 0.04); line(ctx, 0.04 + vx, -0.01, 0.14 + vx, -0.01, ec, 0.04); }
      else for (const ex of (look ? [look * 0.1 + vx] : [-0.1, 0.1])) { circle(ctx, ex + (look ? 0 : vx), -0.01, 0.06, ec); }
      if (c.role === 'finance') { for (const ex of [-0.1, 0.1]) { ctx.beginPath(); ctx.arc(ex + vx, -0.01, 0.1, 0, Math.PI * 2); ctx.strokeStyle = '#fff'; ctx.lineWidth = 0.03; ctx.stroke(); } }
    }
    line(ctx, 0, -0.28, 0, -0.44, '#9aa4b8', 0.04); circle(ctx, 0, -0.47, 0.07, c.kindColor || '#d97757');
  }
  // headwear / accessories per role
  if (!human) switch (c.role) {
    case 'it': ctx.beginPath(); ctx.arc(0, -0.02, 0.38, Math.PI * 1.02, Math.PI * 1.98); ctx.strokeStyle = '#1a1f2e'; ctx.lineWidth = 0.07; ctx.stroke(); box(ctx, -0.42, -0.06, 0.1, 0.2, '#1a1f2e', { r: 0.04 }); box(ctx, 0.32, -0.06, 0.1, 0.2, '#1a1f2e', { r: 0.04 }); if (dir !== 'up') line(ctx, 0.36, 0.12, 0.18, 0.24, '#1a1f2e', 0.04); break;
    case 'game': ctx.beginPath(); ctx.arc(0, -0.22, 0.34, Math.PI, 0); ctx.fillStyle = role.accent; ctx.fill(); if (dir === 'down') box(ctx, -0.3, -0.24, 0.6, 0.08, '#b32f28', { r: 0.03 }); else if (look) box(ctx, look * 0.2 - 0.1 + (look > 0 ? 0.1 : -0.1), -0.24, 0.3, 0.08, '#b32f28', { r: 0.03 }); box(ctx, -0.4, -0.08, 0.1, 0.24, '#1a1f2e', { r: 0.04 }); box(ctx, 0.3, -0.08, 0.1, 0.24, '#1a1f2e', { r: 0.04 }); break;
    case 'ai': if (dir !== 'up') { circle(ctx, -0.11, -0.3, 0.1, '#9ed0ff', '#3b82f6'); circle(ctx, 0.11, -0.3, 0.1, '#9ed0ff', '#3b82f6'); } line(ctx, -0.33, -0.28, 0.33, -0.28, '#3b82f6', 0.05); break;
    case 'design': ctx.beginPath(); ctx.ellipse(0.04, -0.3, 0.36, 0.14, -0.1, 0, Math.PI * 2); ctx.fillStyle = role.accent; ctx.fill(); line(ctx, 0.04, -0.44, 0.04, -0.5, role.accent, 0.05); break;
    case 'security': box(ctx, -0.34, -0.34, 0.68, 0.16, '#141a29', { r: 0.05 }); if (dir === 'down') { box(ctx, -0.3, -0.22, 0.6, 0.06, '#0a0d16', { r: 0.02 }); circle(ctx, 0, -0.27, 0.07, '#f2c200'); } break;
    case 'finance': break;
    default: break;
  }
  ctx.restore();
  ctx.restore();
}
