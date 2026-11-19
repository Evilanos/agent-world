// One building floor in 2D: 3 project rooms + fun area + toilet (+ lift lobby, and the human's office on floor 2).
// Builds the layout, the things to draw, collision boxes, and the walking routes.
import { G, P, dist, hash, ROLES, STATUS, trunc, t, actText } from './core.js';
import * as S from './shapes.js';

export const USER_FLOOR = 2;
export const PLAN = { x0: -38, x1: 38, z0: -28, z1: 18, hallZ: -1 };
export const SLOT_DX = 3.4, SLOT_DZ = 3.6, COLS = 5, MAX_DESKS = 20;
const DOOR_W = 3, WALL = 0.3;
const LANE_OFFSETS = [-8.5, -5.1, -1.7, 1.7, 5.1, 8.5];

function mkRoom(type, cx, cz, W, D, side) {
  const r = { type, cx, cz, W, D, side, x0: cx - W / 2, x1: cx + W / 2, z0: cz - D / 2, z1: cz + D / 2, doorX: cx };
  r.doorZ = side === 'north' ? r.z1 : r.z0;
  r.frontZ = side === 'north' ? r.z1 - 1.2 : r.z0 + 1.2;
  r.outZ = side === 'north' ? r.z1 + 1.4 : r.z0 - 1.4;
  return r;
}
export const planRooms = (floorNo) => ({
  projects: [-24, 0, 24].map(cx => mkRoom('project', cx, -15, 20, 18, 'north')),
  fun: mkRoom('fun', -27, 10, 18, 12, 'south'),
  toilet: mkRoom('toilet', -10, 9, 10, 10, 'south'),
  lift: mkRoom('lift', 2, 6.5, 5, 5, 'south'),
  office: floorNo === USER_FLOOR ? mkRoom('office', 23, 10, 22, 12, 'south') : null,
});
export const regionOf = (floor, p) => floor.allRooms.find(r => p.x > r.x0 + 0.1 && p.x < r.x1 - 0.1 && p.z > r.z0 + 0.1 && p.z < r.z1 - 0.1) || null;

// ---------------- navigation: chair -> aisle -> door -> hall -> door -> target ----------------
const nearest = (arr, x) => arr.reduce((b, v) => Math.abs(v - x) < Math.abs(b - x) ? v : b, arr[0]);
function innerVia(r, p) {   // waypoints from just inside the door towards p that steer around furniture
  const lx = p.x - r.cx, lz = p.z - r.cz;
  if (r.type === 'office') return p.z > r.cz - 2.4 ? [P(r.cx + 3.2, r.frontZ), P(r.cx + 3.2, r.cz + 0.2)] : [];
  if (r.type === 'toilet') return lz > 2.8 ? [P(p.x, r.cz + 2.0)] : [];
  if (r.type === 'fun') {
    if (lx > 3 && lz > 3.9) return [P(r.cx, r.cz + 3.3), P(p.x, r.cz + 3.3)];
    if (lx > 3 && lz > -0.5 && lz < 0.9) return [P(r.cx, r.cz + 1.3), P(p.x, r.cz + 1.3)];
    if (Math.abs(lx + 4) < 0.5 && lz > 2.4) return [P(r.cx - 2.2, r.cz + 3.0)];
    if (lz > 4.5) return [P(r.cx, p.z)];
  }
  return [];
}
const inDoor = (r, p) => r.type === 'project' && Math.abs(p.z - r.doorZ) < 1.6 && Math.abs(p.x - r.doorX) < 1.8;   // standing in the doorway
function exitPath(r, p) {
  if (inDoor(r, p)) return [P(r.doorX, r.outZ)];
  if (r.type === 'project') { const l = nearest(r.lanes, p.x); return [P(l, p.z), P(l, r.frontZ), P(r.doorX, r.frontZ), P(r.doorX, r.outZ)]; }
  return [...innerVia(r, p).reverse(), P(r.doorX, r.frontZ), P(r.doorX, r.outZ)];
}
function enterPath(r, p) {
  if (inDoor(r, p)) return [P(r.doorX, r.outZ), p];
  if (r.type === 'project') { const l = nearest(r.lanes, p.x); return [P(r.doorX, r.outZ), P(r.doorX, r.frontZ), P(l, r.frontZ), P(l, p.z), p]; }
  return [P(r.doorX, r.outZ), P(r.doorX, r.frontZ), ...innerVia(r, p), p];
}
export function route(floor, from, to) {
  const rf = regionOf(floor, from), rt = regionOf(floor, to), H = PLAN.hallZ, pts = [];
  if (rf && rf === rt) {
    if (rf.type === 'project') {
      const lf = nearest(rf.lanes, from.x), lt = nearest(rf.lanes, to.x);
      if (inDoor(rf, to)) { pts.push(P(lf, from.z), P(lf, rf.frontZ), P(rf.doorX, rf.frontZ)); }
      else if (inDoor(rf, from)) { pts.push(P(rf.doorX, rf.frontZ), P(lt, rf.frontZ), P(lt, to.z)); }
      else {
      pts.push(P(lf, from.z));
      if (lf === lt) pts.push(P(lf, to.z)); else pts.push(P(lf, rf.frontZ), P(lt, rf.frontZ), P(lt, to.z));
      }
    } else pts.push(...innerVia(rf, from).reverse(), P(rf.doorX, rf.frontZ), ...innerVia(rf, to));
    pts.push(P(to.x, to.z));
  } else {
    if (rf) { pts.push(...exitPath(rf, from), P(rf.doorX, H)); } else pts.push(P(from.x, H));
    if (rt) pts.push(P(rt.doorX, H), ...enterPath(rt, P(to.x, to.z))); else pts.push(P(to.x, H), P(to.x, to.z));
  }
  return pts.filter((p, i) => i === 0 || dist(p, pts[i - 1]) > 0.05);
}

// ====================================================================
export function buildFloor(floorNo, projectRooms, ctx) {
  const Pl = planRooms(floorNo);
  const floor = { no: floorNo, plan: Pl, obstacles: [], ground: [], walls: [], deco: [], clicks: [], desks: new Map(), slots: {}, lift: null, office: null, projectRooms: [], guardPosts: {} };
  const obstacles = floor.obstacles, add = (sortZ, draw) => floor.deco.push({ z: sortZ, draw }), ground = (draw) => floor.ground.push(draw);
  const obs = (x0, z0, x1, z1) => obstacles.push({ x0, z0, x1, z1 });

  const walls = (r, color, { doorW = DOOR_W } = {}) => {
    const north = r.side === 'north', backZ = north ? r.z0 : r.z1;
    const w = (x0, z0, x1, z1) => { floor.walls.push({ x0, z0, x1, z1, color }); obs(x0 - 0.12, z0 - 0.12, x1 + 0.12, z1 + 0.12); };
    w(r.x0 - WALL / 2, backZ - WALL / 2, r.x1 + WALL / 2, backZ + WALL / 2);
    w(r.x0 - WALL / 2, r.z0, r.x0 + WALL / 2, r.z1); w(r.x1 - WALL / 2, r.z0, r.x1 + WALL / 2, r.z1);
    const sw = (r.W - doorW) / 2;
    w(r.x0 - WALL / 2, r.doorZ - WALL / 2, r.x0 + sw, r.doorZ + WALL / 2); w(r.x1 - sw, r.doorZ - WALL / 2, r.x1 + WALL / 2, r.doorZ + WALL / 2);
  };
  const roomFloor = (r, color, pattern) => ground(c => {
    c.fillStyle = color; c.fillRect(r.x0, r.z0, r.W, r.D);
    c.strokeStyle = pattern === 'tile' ? 'rgba(0,0,0,.22)' : pattern === 'wood' ? 'rgba(0,0,0,.12)' : 'rgba(0,0,0,.06)'; c.lineWidth = pattern === 'tile' ? 0.04 : 0.03;
    const step = pattern === 'tile' ? 1 : pattern === 'wood' ? 0.7 : 2; c.beginPath();
    if (pattern !== 'wood') for (let x = r.x0 + step; x < r.x1; x += step) { c.moveTo(x, r.z0); c.lineTo(x, r.z1); }
    for (let z = r.z0 + step; z < r.z1; z += step) { c.moveTo(r.x0, z); c.lineTo(r.x1, z); }
    c.stroke();
  });
  const sign = (r, title, sub, color) => {
    const zz = r.z0 - 0.95;
    add(1000 + zz, c => S.pill(c, title, r.cx, zz, 0.62, { fg: color, sub, bg: 'rgba(8,11,20,.82)' }));
    floor.clicks.push({ type: 'sign', x0: r.cx - 3, z0: zz - 0.9, x1: r.cx + 3, z1: zz + 0.9, ref: r });
  };

  // ---------- hall ----------
  ground(c => {
    c.fillStyle = '#aab3c8'; c.fillRect(PLAN.x0, PLAN.z0, PLAN.x1 - PLAN.x0, PLAN.z1 - PLAN.z0);
    c.strokeStyle = 'rgba(0,0,0,.1)'; c.lineWidth = 0.05; c.beginPath();
    for (let x = PLAN.x0; x <= PLAN.x1; x += 4) { c.moveTo(x, PLAN.z0); c.lineTo(x, PLAN.z1); }
    for (let z = PLAN.z0; z <= PLAN.z1; z += 4) { c.moveTo(PLAN.x0, z); c.lineTo(PLAN.x1, z); }
    c.stroke();
    c.fillStyle = 'rgba(255,255,255,.12)'; c.fillRect(PLAN.x0, PLAN.hallZ - 1.4, PLAN.x1 - PLAN.x0, 2.8);
  });
  const outer = '#56627f';
  for (const [x0, z0, x1, z1] of [[PLAN.x0 - 0.3, PLAN.z0 - 0.3, PLAN.x1 + 0.3, PLAN.z0 + 0.3], [PLAN.x0 - 0.3, PLAN.z1 - 0.3, PLAN.x1 + 0.3, PLAN.z1 + 0.3], [PLAN.x0 - 0.3, PLAN.z0, PLAN.x0 + 0.3, PLAN.z1], [PLAN.x1 - 0.3, PLAN.z0, PLAN.x1 + 0.3, PLAN.z1]]) { floor.walls.push({ x0, z0, x1, z1, color: outer }); obs(x0 - 0.3, z0 - 0.3, x1 + 0.3, z1 + 0.3); }
  for (const [x, z] of [[-35, -3.5], [35, -3.5], [-17, 3], [12, -3.5], [-12, -3.5], [35, 16], [-35, 16]]) add(z + 0.3, c => S.plant(c, x, z, 1.2));

  // ---------- project rooms ----------
  Pl.projects.forEach((r, ri) => {
    const room = projectRooms[ri];
    r.lanes = LANE_OFFSETS.map(o => r.cx + o);
    if (!room) {
      roomFloor(r, '#6d7690', 'carpet'); walls(r, '#5b6580');
      add(r.cz, c => S.pill(c, t('room.empty'), r.cx, r.cz, 0.7, { sub: t('room.empty.sub'), fg: '#8b95b0' }));
      return;
    }
    floor.projectRooms.push(room); r.data = room; room.rd = r;
    const hue = hash(room.name) % 360, role = ROLES[room.role] || ROLES.casual, wallCol = `hsl(${hue} 45% 42%)`;
    roomFloor(r, `hsl(${hue} 22% 62%)`, 'carpet'); walls(r, wallCol);
    sign(r, room.name, t('room.projsub', { role: role.label, agents: room.agents.length, live: room.liveCount }), `hsl(${hue} 80% 75%)`);

    // wall monitor: click => task / PRD summary
    const ordered = [...room.agents].sort((a, b) => (a.status === 'busy' ? 0 : 1) - (b.status === 'busy' ? 0 : 1));
    const bx = r.cx - 4, bz = r.z0 + 0.4, bw = 8, bh = 2.0;
    add(bz + bh, c => {
      S.box(c, bx - 0.12, bz - 0.12, bw + 0.24, bh + 0.24, '#0a0d16', { r: 0.12, stroke: '#2a3350', lw: 0.08 });
      S.box(c, bx, bz, bw, bh, '#0b1220', { r: 0.06 }); S.box(c, bx, bz, bw, 0.5, '#16213a', { r: 0.06 });
      S.text(c, trunc(room.name, 30), bx + 0.25, bz + 0.26, 0.38, '#e8ecf8', 'left', 700);
      S.text(c, trunc(`${role.label} · ${role.desc}`, 40), bx + bw - 0.2, bz + 0.26, 0.26, '#8b95b0', 'right', 500);
      ordered.slice(0, 3).forEach((a, i) => { c.fillStyle = STATUS[a.status].color; c.beginPath(); c.arc(bx + 0.3, bz + 0.85 + i * 0.36, 0.09, 0, 7); c.fill(); S.text(c, trunc(a.title || a.name, 52), bx + 0.55, bz + 0.85 + i * 0.36, 0.28, '#dfe6f7', 'left', 600); });
      if (!ordered.length) S.text(c, t('board.none'), bx + 0.3, bz + 0.9, 0.3, '#6b7590', 'left');
      S.box(c, bx, bz + bh - 0.36, bw, 0.36, '#ffb020', { r: 0.06 }); S.text(c, t('board.click'), bx + bw / 2, bz + bh - 0.18, 0.26, '#1c1300', 'center', 700);
    });
    floor.clicks.push({ type: 'board', x0: bx, z0: bz, x1: bx + bw, z1: bz + bh, key: room.key });
    obs(bx, r.z0, bx + bw, bz + bh + 0.2);

    add(r.z0 + 3.4, c => S.shelf(c, r.x0 + 0.3, r.z0 + 2.6, 0.7, 3));
    obs(r.x0, r.z0 + 2.4, r.x0 + 1.1, r.z0 + 5.8);
    add(r.z0 + 1, c => S.plant(c, r.x1 - 0.8, r.z0 + 0.9, 1.2)); add(r.z1 - 0.5, c => S.plant(c, r.x0 + 0.8, r.z1 - 0.8, 1));
    add(r.z1, c => { c.fillStyle = 'rgba(0,0,0,.35)'; c.fillRect(r.doorX - 1.3, r.z1 + 0.4, 2.6, 0.7); });

    // security console + guard posts
    const rackX = r.cx + 9.3, rackZ = r.z1 - 3.0;
    add(rackZ + 0.5, c => S.rack(c, rackX, rackZ, ((G.security[room.key] || {}).counts || {}).high > 0));
    obs(rackX - 0.6, rackZ - 0.5, rackX + 0.6, rackZ + 0.5);
    floor.clicks.push({ type: 'rack', x0: rackX - 0.7, z0: rackZ - 0.6, x1: rackX + 0.7, z1: rackZ + 0.6, key: room.key });
    floor.guardPosts[room.key] = { room, post: { pos: P(r.doorX - 2.3, r.frontZ), yaw: 0 }, console: { pos: P(rackX - 1.1, rackZ), yaw: Math.PI / 2 }, block: { pos: P(r.doorX, r.z1 - 0.2), yaw: 0 } };

    const list = [...room.agents].sort((a, b) => (a.id < b.id ? -1 : 1)).slice(0, MAX_DESKS);
    room.hidden = room.agents.length - list.length;
    list.forEach((a, k) => {
      const col = k % COLS, row = Math.floor(k / COLS);
      const wx = r.cx + (col - (COLS - 1) / 2) * SLOT_DX, wz = r.z0 + 4.2 + row * SLOT_DZ;
      const info = { stand: P(wx, wz - 0.1), chairT: 1, room: r, col, row, slotIdx: k };
      const c2 = STATUS[a.status].color;
      add(wz + 0.9, c => S.desk(c, wx, wz + 0.45, c2));
      add(wz - 0.6, c => S.chair(c, wx, wz - 0.3 - 0.55 * (1 - info.chairT)));
      obs(wx - 0.9, wz + 0.02, wx + 0.9, wz + 0.88);
      floor.desks.set(a.id, info);
    });
  });

  // ---------- fun area ----------
  {
    const r = Pl.fun, L = (lx, lz) => P(r.cx + lx, r.cz + lz);
    roomFloor(r, '#8fb86a', 'carpet'); walls(r, '#5f8f46'); sign(r, t('room.fun'), t('room.fun.sub'), '#b6f09f');
    const ppx = r.cx - 4, ppz = r.cz + 1; floor.pingpong = { x: ppx, z: ppz, ball: null };
    add(ppz + 1.4, c => S.pingpong(c, ppx, ppz, floor.pingpong.ball)); obs(ppx - 0.95, ppz - 1.4, ppx + 0.95, ppz + 1.4);
    add(r.cz + 0.7, c => S.sofa(c, r.cx + 6, r.cz + 0.2, 3.0, '#8c5b4a', 'north')); add(r.cz + 4.9, c => S.sofa(c, r.cx + 6, r.cz + 4.4, 3.0, '#4a5b8c', 'south'));
    add(r.cz + 2.7, c => S.box(c, r.cx + 5.2, r.cz + 1.9, 1.6, 0.8, '#9a7650', { r: 0.08 }));
    obs(r.cx + 4.4, r.cz - 0.4, r.cx + 7.6, r.cz + 0.8); obs(r.cx + 4.4, r.cz + 3.8, r.cx + 7.6, r.cz + 5.0); obs(r.cx + 5.1, r.cz + 1.9, r.cx + 6.9, r.cz + 2.7);
    add(r.cz - 3.0, c => S.coffeeMachine(c, r.cx - 8.3, r.cz - 3.5)); obs(r.cx - 9, r.cz - 4.1, r.cx - 7.7, r.cz - 2.9);
    for (const [x, z] of [[-8.2, 5.2], [8.2, -5.2], [0, 5.3]]) add(r.cz + z + 0.3, c => S.plant(c, r.cx + x, r.cz + z, 1.1));
    add(r.z0 + 0.1, c => { S.box(c, r.cx + 1, r.z0 + 0.3, 5, 0.5, '#2a86c9', { r: 0.06 }); S.text(c, t('room.fun.tv'), r.cx + 3.5, r.z0 + 0.55, 0.3, '#fff', 'center', 700); });
    const mk = (lx, lz, yaw, pose) => ({ pos: L(lx, lz), yaw, pose });
    floor.slots.fun = {
      room: r, order: ['pp0', 'pp1', 'chatL', 'chatR', 'coffee', 'sofaA0', 'sofaB0', 'sofaA1', 'sofaB1', 'sofaA2', 'sofaB2'],
      byKey: {
        pp0: mk(-4, -1.0, 0, 'pingpong'), pp1: mk(-4, 3.0, Math.PI, 'pingpong'),
        chatL: mk(-1.3, 3.6, Math.PI / 2, 'chat'), chatR: mk(1.3, 3.6, -Math.PI / 2, 'chat'), coffee: mk(-6.9, -3.5, -Math.PI / 2, 'drink'),
        sofaA0: mk(4.8, 4.2, Math.PI, 'sofa'), sofaA1: mk(6.0, 4.2, Math.PI, 'sofa'), sofaA2: mk(7.2, 4.2, Math.PI, 'sofa'),
        sofaB0: mk(4.8, 0.4, 0, 'sofa'), sofaB1: mk(6.0, 0.4, 0, 'sofa'), sofaB2: mk(7.2, 0.4, 0, 'sofa'),
      },
      overflow: Array.from({ length: 14 }, (_, k) => k < 6 ? mk(-6 + k * 1.6, 5.4, Math.PI, 'stand') : mk(-5 + (k - 6) * 1.6, -3.0, 0, 'stand')),
      patrol: [L(-2, -3.3), L(1.5, 5.4)],
    };
  }

  // ---------- toilet ----------
  {
    const r = Pl.toilet, L = (lx, lz) => P(r.cx + lx, r.cz + lz);
    roomFloor(r, '#cfe0ea', 'tile'); walls(r, '#4f8fae'); sign(r, t('room.toilet'), t('room.toilet.sub'), '#9fd8ff');
    const stallX = [-3.4, -0.9, 1.6];
    for (const x of [-4.6, -2.15, 0.35, 2.8]) add(r.cz + 4.9, c => S.box(c, r.cx + x - 0.05, r.cz + 2.4, 0.1, 2.6, '#7aa6bd', { r: 0.02 }));
    stallX.forEach(x => { add(r.cz + 4.6, c => S.toilet(c, r.cx + x, r.cz + 4.55)); add(r.cz + 2.65, c => { S.box(c, r.cx + x - 1.0, r.cz + 2.55, 0.5, 0.1, '#9bc3d6', { r: 0.02 }); S.box(c, r.cx + x + 0.5, r.cz + 2.55, 0.5, 0.1, '#9bc3d6', { r: 0.02 }); }); });
    [-1.5, 1.0].forEach(z => add(r.cz + z + 0.3, c => S.urinal(c, r.cx + 4.85, r.cz + z)));
    [-2.5, 0].forEach(z => add(r.cz + z + 0.5, c => S.sink(c, r.cx - 4.7, r.cz + z)));
    obs(r.cx - 4.8, r.cz + 2.4, r.cx + 3.0, r.cz + 5.0); obs(r.cx - 5.1, r.cz - 3.1, r.cx - 4.2, r.cz + 0.6);
    const mk = (lx, lz, yaw, pose) => ({ pos: L(lx, lz), yaw, pose });
    floor.slots.toilet = { room: r, stalls: stallX.map(x => mk(x, 4.0, Math.PI, 'poop')), urinals: [-1.5, 1.0].map(z => mk(3.9, z, Math.PI / 2, 'pee')),
      sinks: [-2.5, 0].map(z => mk(-3.8, z, -Math.PI / 2, 'wash')), wait: [mk(-1, -3, 0, 'stand'), mk(1, -3, 0, 'stand'), mk(3, -3, 0, 'stand')] };
  }

  // ---------- lift ----------
  {
    const r = Pl.lift; roomFloor(r, '#9aa5b8', 'tile'); walls(r, '#7f8aa0');
    floor.lift = { room: r, open: 1, target: null, zone: { x0: r.x0 + 0.5, x1: r.x1 - 0.5, z0: r.z0 + 0.8, z1: r.z1 - 0.4 }, center: P(r.cx, r.cz + 0.4) };
    add(r.z0 + 0.4, c => {
      const o = floor.lift.open, dw = 1.5;
      S.box(c, r.cx - dw - o * 1.05, r.z0 - 0.15, dw, 0.3, '#aab6cc', { r: 0.03, stroke: '#6e7a93' }); S.box(c, r.cx + o * 1.05, r.z0 - 0.15, dw, 0.3, '#aab6cc', { r: 0.03, stroke: '#6e7a93' });
      S.box(c, r.x1 - 0.8, r.cz - 0.5, 0.35, 1.0, '#20263a', { r: 0.05 }); for (let i = 0; i < 4; i++) S.circle(c, r.x1 - 0.62, r.cz - 0.35 + i * 0.23, 0.06, i === 1 ? '#4aa8ff' : '#6e7a93');
      S.text(c, t('room.lift.label'), r.cx, r.cz + 0.1, 0.5, 'rgba(255,255,255,.45)', 'center', 700);
    });
    sign(r, t('room.floor', { n: floorNo }), t('room.lift.sub'), '#ffe08a');
  }

  // ---------- the human's office (floor 2) or a lounge ----------
  if (Pl.office) {
    const r = Pl.office, waiting = ctx.waiting || [];
    roomFloor(r, '#8b6a47', 'wood'); walls(r, '#a8864f'); sign(r, t('room.office'), t('room.office.sub', { n: USER_FLOOR }), '#f1cf7a');
    ground(c => S.rug(c, r.cx, r.cz + 0.6, 4.2, 2.8, '#1f4f5c'));
    const dx = r.cx, dz = r.cz - 1.2;
    add(dz + 0.7, c => {
      S.box(c, dx - 1.8, dz - 0.6, 3.6, 1.2, '#5b3f2b', { r: 0.08, stroke: '#3c281b' });
      S.box(c, dx - 1.55, dz - 0.5, 1.2, 0.18, '#0a0d16', { r: 0.04 }); S.box(c, dx + 0.35, dz - 0.5, 1.2, 0.18, '#0a0d16', { r: 0.04 });
      S.text(c, t('desk.inbox', { n: waiting.length }), dx - 0.95, dz - 0.02, 0.3, waiting.length ? '#ffb020' : '#6b7590', 'center', 700); S.text(c, t('desk.you'), dx + 0.95, dz - 0.02, 0.3, '#d8b25a', 'center', 700);
    });
    obs(dx - 1.9, dz - 0.7, dx + 1.9, dz + 0.7);
    add(dz + 0.5, c => S.chair(c, dx, dz + 1.4, 1.25));
    add(r.cz + 4.4, c => S.sofa(c, r.cx - 6.5, r.cz + 3.8, 3, '#4a5b8c', 'south')); obs(r.cx - 8.2, r.cz + 3.2, r.cx - 4.8, r.cz + 4.6);
    add(r.cz - 1, c => S.shelf(c, r.x1 - 0.9, r.cz - 3.2, 0.7, 3.4)); obs(r.x1 - 0.9, r.cz - 3.2, r.x1, r.cz + 0.2);
    for (const [x, z] of [[-9.5, -4.8], [9.5, 4.8], [9.5, -4.8], [-9.5, 4.8]]) add(r.cz + z + 0.3, c => S.plant(c, r.cx + x, r.cz + z, 1.3));
    floor.office = { room: r, spawn: P(r.cx, r.cz + 2.4) };
  } else {
    const r = mkRoom('lounge', 23, 10, 22, 12, 'south');
    for (const x of [18, 28]) { add(12.5, c => S.sofa(c, x, 12, 3, '#5a6a99', 'south')); obs(x - 1.6, 11.4, x + 1.6, 12.8); }
    for (const [x, z] of [[12, 6], [34, 6], [34, 15], [12, 15]]) add(z + 0.3, c => S.plant(c, x, z, 1.3));
    add(r.cz, c => S.pill(c, t('room.lobby', { n: floorNo }), r.cx, r.cz, 0.7, { fg: '#cfd8ee' }));
  }

  floor.allRooms = [...Pl.projects.filter(r => r.data), Pl.fun, Pl.toilet, Pl.lift, ...(Pl.office ? [Pl.office] : []), ...Pl.projects.filter(r => !r.data)];
  return floor;
}
