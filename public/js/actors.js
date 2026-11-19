// Agents and security guards: where they sit, what they do, and how they walk between rooms.
import { G, P, dist, hash, STATUS, KIND, trunc, damp, wrapAngle, reduceMotion } from './core.js';
import { route } from './floor.js';

export const actorStates = new Map();   // id -> { pos, route, ri, goalKey, floorNo, target }  (survives scene rebuilds)
const SPEED = 3.0, CYCLE = 150, TRIP = 48, VISIT_WIN = 45;
const SIT_POSES = new Set(['work', 'sleep', 'sofa', 'poop']);
const facingOf = (yaw) => { const dx = Math.sin(yaw), dz = Math.cos(yaw); return Math.abs(dx) > Math.abs(dz) ? (dx > 0 ? 'right' : 'left') : (dz >= 0 ? 'down' : 'up'); };

function makeActor(floor, agent, o) {
  let st = actorStates.get(agent.id); const fresh = !st || st.floorNo !== floor.no;
  if (fresh) { st = { pos: P(o.home.x, o.home.z), route: [], ri: 0, goalKey: '', floorNo: floor.no, target: null }; actorStates.set(agent.id, st); }
  return { agent, guard: !!o.guard, roomKey: o.roomKey, role: o.role, home: o.home, desk: o.desk || null, st, fresh, sit: 0, walk: 0, yaw: 0, facing: 'down', moving: false,
    phase: (hash(agent.id) % 628) / 100, goal: null, pose: 'stand', bubbleTxt: '', alpha: 1, gone: false, helpers: o.helpers || [] };
}

export function createActors(floor) {
  const agents = [], guards = [];
  for (const room of floor.projectRooms) {
    for (const a of room.agents) {
      const desk = floor.desks.get(a.id); if (!desk) continue;
      const helpers = a.status === 'busy' ? a.subagents.filter(s => s.working).slice(0, 3).map((s, k) => ({ x: desk.stand.x + (k % 2 ? 1.2 : -1.2), z: desk.stand.z + 0.45 - Math.floor(k / 2) * 0.9, phase: k * 1.7 })) : [];
      agents.push(makeActor(floor, a, { home: desk.stand, desk, roomKey: room.key, role: room.role, helpers }));
    }
    const gp = floor.guardPosts[room.key];
    if (gp) {
      const g = { id: 'guard:' + room.key, name: 'Security', status: 'idle', kind: 'security', title: 'Security · ' + room.name, cwd: room.path, activity: '', subagents: [], subagentTotal: 0, subagentWorking: 0, lastActive: Date.now(), guard: true, projectKey: room.key, projectName: room.name };
      guards.push(makeActor(floor, g, { home: gp.post.pos, roomKey: room.key, role: 'security', guard: true }));
    }
  }
  const fun = floor.slots.fun;
  const fg = { id: 'guard:fun', name: 'Security', status: 'idle', kind: 'security', title: 'Security · Fun Area', cwd: '', activity: '', subagents: [], subagentTotal: 0, lastActive: Date.now(), guard: true, projectKey: null, projectName: 'Fun Area' };
  guards.push(makeActor(floor, fg, { home: fun.patrol[0], roomKey: 'fun', role: 'security', guard: true }));
  return { agents, guards };
}

export function syncActors(view) {
  const byId = new Map(view.rooms.flatMap(r => r.agents).map(a => [a.id, a]));
  for (const a of G.actors) { const na = byId.get(a.agent.id); if (na) a.agent = na; }
}

// ---------------------------------------------------------------- goals
function planFrame(floor) {
  const actors = G.actors, guards = G.guards, T = Date.now() / 1000, goals = new Map(), pl = G.player;
  const userHere = pl && pl.floorNo === floor.no, slots = floor.slots;
  const byId = new Map(actors.map(a => [a.agent.id, a]));

  // 0) dismissed agents walk out through the lift; the one being judged pleads for mercy
  for (const id of G.firing) if (byId.has(id)) goals.set(id, { key: 'fired', pos: floor.lift.center, yaw: Math.PI, pose: 'sad', bubble: '😢' });
  if (G.defending && byId.has(G.defending) && !goals.has(G.defending)) { const a = byId.get(G.defending); goals.set(a.agent.id, { key: 'defend', pos: P(a.st.pos.x, a.st.pos.z), yaw: 0, pose: 'plead', bubble: '🙏' }); }

  // 0.5) the agent you are chatting with comes over and talks to you
  if (G.chatWith && userHere && byId.has(G.chatWith) && !goals.has(G.chatWith)) {
    const fx = Math.sin(pl.yaw), fz = Math.cos(pl.yaw);
    goals.set(G.chatWith, { key: 'user', follow: true, pos: P(pl.pos.x + fx * 1.9, pl.pos.z + fz * 1.9), yaw: pl.yaw + Math.PI, pose: 'chat', bubble: G.chatTyping ? '💭' : (G.chatBubble || '💬') });
  }
  // 1) called by the human, who is on this floor: walk over and stand in front of them
  if (userHere) {
    const here = G.callOrder.filter(id => byId.has(id) && !goals.has(id));
    const fx = Math.sin(pl.yaw), fz = Math.cos(pl.yaw), rx = fz, rz = -fx;
    here.forEach((id, i) => {
      const call = G.calledMap.get(id), o = (i - (here.length - 1) / 2) * 1.9;
      goals.set(id, { key: 'user', follow: true, pos: P(pl.pos.x + fx * 2.4 + rx * o, pl.pos.z + fz * 2.4 + rz * o), yaw: pl.yaw + Math.PI, pose: call.kind === 'ask' ? 'wave' : 'cheer' });
    });
  }
  // 2) busy / dozing agents stay at their desks
  const free = actors.filter(a => !goals.has(a.agent.id));
  const atDesk = free.filter(a => a.agent.status === 'busy' || a.agent.status === 'sleeping');
  atDesk.forEach(a => goals.set(a.agent.id, { key: 'desk', pos: a.home, yaw: 0, pose: a.agent.status === 'busy' ? 'work' : 'sleep' }));
  const tw = T % 30, win = Math.floor(T / 30);
  if (tw < 14) for (const r of floor.projectRooms) {   // neighbours who both work (same project only) discuss for a moment
    const busy = atDesk.filter(a => a.desk.room === r.rd && a.agent.status === 'busy' && goals.get(a.agent.id).key === 'desk').sort((x, y) => x.desk.slotIdx - y.desk.slotIdx);
    const pairs = []; busy.forEach(a => { const b = busy.find(o => o.desk.row === a.desk.row && o.desk.col === a.desk.col + 1); if (b) pairs.push([a, b]); });
    if (pairs.length) { const [A, B] = pairs[hash(r.rd.cx + ':' + win) % pairs.length]; goals.set(A.agent.id, { key: 'chatv:' + B.agent.id, pos: P((A.home.x + B.home.x) / 2, A.home.z), yaw: Math.PI / 2, pose: 'chat', bubble: '💬' }); }
  }
  // 3) everyone else relaxes in the fun area. Only colleagues of the SAME project pair up; security keeps projects apart.
  const relax = free.filter(a => !goals.has(a.agent.id)).sort((x, y) => (x.agent.id < y.agent.id ? -1 : 1));
  const fun = slots.fun, groups = new Map();
  relax.forEach(a => { if (!groups.has(a.roomKey)) groups.set(a.roomKey, []); groups.get(a.roomKey).push(a); });
  const pairs = [], singles = [];
  for (const g of groups.values()) { for (let i = 0; i + 1 < g.length; i += 2) pairs.push([g[i], g[i + 1]]); if (g.length % 2) singles.push(g[g.length - 1]); }
  const pairSlots = [['pp0', 'pp1'], ['chatL', 'chatR']], assign = new Map();
  pairs.forEach((pr, i) => { if (i < pairSlots.length) { assign.set(pr[0].agent.id, pairSlots[i][0]); assign.set(pr[1].agent.id, pairSlots[i][1]); } else singles.push(...pr); });
  const singleKeys = ['coffee', 'sofaA0', 'sofaB0', 'sofaA1', 'sofaB1', 'sofaA2', 'sofaB2']; let oi = 0;
  singles.sort((x, y) => (x.roomKey < y.roomKey ? -1 : x.roomKey > y.roomKey ? 1 : x.agent.id < y.agent.id ? -1 : 1)).forEach((a, i) => assign.set(a.agent.id, i < singleKeys.length ? singleKeys[i] : 'o' + (oi++)));
  const trips = [], wc = slots.toilet;
  for (const a of relax) {
    const key = assign.get(a.agent.id), slot = key.startsWith('o') ? fun.overflow[Number(key.slice(1)) % fun.overflow.length] : fun.byKey[key];
    a.funGoal = { key: 'fun:' + key, pos: slot.pos, yaw: slot.yaw, pose: slot.pose, bubble: slot.pose === 'pingpong' ? '🏓' : slot.pose === 'chat' ? '💬' : (slot.pose === 'drink' || slot.pose === 'sofa') ? '☕' : '' };
    const ph = hash(a.agent.id) % CYCLE, tm = (T + ph) % CYCLE;
    if (tm < TRIP) trips.push({ a, kind: hash(a.agent.id + Math.floor((T + ph) / CYCLE)) % 5 < 3 ? 'pee' : 'poop' }); else goals.set(a.agent.id, a.funGoal);
  }
  const freeU = [...wc.urinals], freeS = [...wc.stalls], freeW = [...wc.sinks, ...wc.wait];
  for (const t of trips) {
    let slot = t.kind === 'pee' ? (freeU.shift() || freeS.shift()) : (freeS.shift() || freeU.shift());
    slot = slot || freeW.shift() || wc.wait[0];
    goals.set(t.a.agent.id, { key: 'wc:' + slot.pose + ':' + slot.pos.x.toFixed(1) + ':' + slot.pos.z.toFixed(1), pos: slot.pos, yaw: slot.yaw, pose: slot.pose, bubble: slot.pose === 'poop' ? '💩' : slot.pose === 'pee' ? '💧' : slot.pose === 'wash' ? '🧼' : '' });
  }
  // 4) a relaxing agent from another project tries to visit a project room to chat: that room's security stops them at the door
  const vw = Math.floor(T / VISIT_WIN), vt = T % VISIT_WIN, blockers = new Map();
  if (vt < 22 && floor.projectRooms.length >= 2) {
    const cands = relax.filter(a => goals.get(a.agent.id) === a.funGoal);
    if (cands.length) {
      const v = cands[hash('visit' + vw) % cands.length], targets = floor.projectRooms.filter(r => r.key !== v.roomKey);
      if (targets.length) {
        const tr = targets[hash('room' + vw) % targets.length], rd = tr.rd, door = P(rd.doorX, rd.outZ + 0.5), arrived = dist(v.st.pos, door) < 1.3;
        goals.set(v.agent.id, { key: 'visit:' + tr.key, pos: door, yaw: Math.PI, pose: arrived ? 'sad' : 'stand', bubble: arrived ? '😞' : '💬' });
        if (arrived && floor.guardPosts[tr.key]) { blockers.set(tr.key, true); if (floor.countedVisit !== vw) { floor.countedVisit = vw; G.blocked++; } }
      }
    }
  }
  // 5) security guards: stand guard, inspect the system console, block visitors, patrol the fun area
  for (const g of guards) {
    if (G.chatWith === g.agent.id && userHere) {   // you are talking to this guard: it comes over
      const fx = Math.sin(pl.yaw), fz = Math.cos(pl.yaw);
      goals.set(g.agent.id, { key: 'user', follow: true, pos: P(pl.pos.x + fx * 1.9, pl.pos.z + fz * 1.9), yaw: pl.yaw + Math.PI, pose: 'chat', bubble: G.chatTyping ? '💭' : (G.chatBubble || '🛡') });
      continue;
    }
    if (g.roomKey === 'fun') {
      const mixed = groups.size >= 2, pts = fun.patrol, i = Math.floor(T / 9) % pts.length;
      goals.set(g.agent.id, { key: 'patrol' + i, pos: pts[i], yaw: i ? Math.PI : 0, pose: 'guard', bubble: mixed ? '👀 awasi lintas project' : '' });
      continue;
    }
    const gp = floor.guardPosts[g.roomKey]; if (!gp) continue;
    const rep = G.security[g.roomKey], tm = (T + hash(g.roomKey)) % 70, n = rep && rep.counts ? rep.counts.high + rep.counts.medium + rep.counts.low : null;
    if (blockers.get(g.roomKey)) goals.set(g.agent.id, { key: 'block', pos: gp.block.pos, yaw: 0, pose: 'stop', bubble: '🚫 Beda project!' });
    else if (tm < 26) goals.set(g.agent.id, { key: 'inspect', pos: gp.console.pos, yaw: gp.console.yaw, pose: 'inspect', bubble: rep ? (rep.skipped ? '🔍 bukan project' : `🔍 ${n} temuan`) : '🔍 memindai…' });
    else goals.set(g.agent.id, { key: 'post', pos: gp.post.pos, yaw: gp.post.yaw, pose: 'guard', bubble: '' });
  }
  return goals;
}

// ---------------------------------------------------------------- per-actor update
function stepRoute(a, dt) {
  const S = a.st, tgt = S.route[S.ri];
  if (!tgt) return false;
  const dx = tgt.x - S.pos.x, dz = tgt.z - S.pos.z, d = Math.hypot(dx, dz), step = SPEED * dt;
  if (d > 0.01) a.yaw = Math.atan2(dx, dz);
  if (d <= step) { S.pos.x = tgt.x; S.pos.z = tgt.z; S.ri++; } else { S.pos.x += dx / d * step; S.pos.z += dz / d * step; }
  a.walk += step; return S.ri < S.route.length || d > step;
}

function updateActor(a, goal, t, dt, floor) {
  const S = a.st;
  a.goal = goal;
  if (S.goalKey !== goal.key || (goal.follow && S.target && dist(S.target, goal.pos) > 1.0)) {
    S.goalKey = goal.key; S.target = P(goal.pos.x, goal.pos.z);
    if (a.fresh) { S.pos = P(goal.pos.x, goal.pos.z); S.route = []; S.ri = 0; a.yaw = goal.yaw; }     // first frame: appear where they belong
    else { S.route = route(floor, S.pos, goal.pos); S.ri = 0; }
  }
  a.fresh = false;
  let moving = false;
  if (S.ri < S.route.length) { if (reduceMotion) { const l = S.route[S.route.length - 1]; S.pos = P(l.x, l.z); S.ri = S.route.length; } else moving = stepRoute(a, dt); }
  a.moving = moving;
  const sitT = !moving && SIT_POSES.has(goal.pose) ? 1 : 0;
  a.sit += (sitT - a.sit) * damp(9, dt);
  if (a.desk) a.desk.chairT += (((!moving && goal.key === 'desk') ? 1 : 0) - a.desk.chairT) * damp(7, dt);
  if (!moving) a.yaw = goal.yaw;
  a.facing = facingOf(a.yaw);
  a.pose = moving ? 'walk' : goal.pose;
  a.bubbleTxt = moving ? '' : (goal.bubble || '');
  if (goal.key === 'fired' && !moving) { a.alpha = Math.max(0, a.alpha - dt * 0.8); if (a.alpha <= 0) a.gone = true; } else a.alpha = Math.min(1, a.alpha + dt * 2);
}

export function updateActors(floor, dt, t) {
  G.frame++;
  const goals = planFrame(floor), all = [...G.actors, ...G.guards];
  for (const a of all) updateActor(a, goals.get(a.agent.id) || { key: 'desk', pos: a.home, yaw: 0, pose: 'sleep' }, t, dt, floor);
  const ready = ['fun:pp0', 'fun:pp1'].every(k => G.actors.some(a => a.goal && a.goal.key === k && a.st.ri >= a.st.route.length));
  const pp = floor.pingpong;
  if (pp) { if (ready) { const u = (t * 1.6) % 2, k = u < 1 ? u : 2 - u; pp.ball = { x: pp.x + Math.sin(t * 2) * 0.1, z: pp.z - 1.2 + k * 2.4 }; } else pp.ball = null; }
}
