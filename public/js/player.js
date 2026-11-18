// The human: walks with WASD / arrow keys (top-down), collides with walls and furniture.
import { G, P } from './core.js';

const RADIUS = 0.45, WALK = 4.2, RUN = 7.5;
const keys = new Set();

export function createPlayer() {
  const pl = { pos: P(0, 0), yaw: Math.PI, floorNo: 0, walk: 0, moving: false };
  addEventListener('keydown', e => {
    if (e.target && /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
    const k = e.key.toLowerCase();
    if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'shift'].includes(k)) {
      keys.add(k); if (k.startsWith('arrow')) e.preventDefault();
      if (k !== 'shift' && G.onMoveStart) G.onMoveStart();
    }
  });
  addEventListener('keyup', e => keys.delete(e.key.toLowerCase()));
  addEventListener('blur', () => keys.clear());
  return pl;
}
export function placePlayer(pl, floorNo, pos, yaw) { pl.floorNo = floorNo; pl.pos = P(pos.x, pos.z); if (yaw !== undefined) pl.yaw = yaw; }

export function blocked(x, z, obstacles, radius = RADIUS) {
  for (const o of obstacles) {
    const cx = Math.min(Math.max(x, o.x0), o.x1), cz = Math.min(Math.max(z, o.z0), o.z1);
    if ((x - cx) ** 2 + (z - cz) ** 2 < radius * radius) return true;
  }
  return false;
}

export function updatePlayer(pl, dt, floor, locked) {
  let dx = 0, dz = 0;
  if (!locked) {
    dx = (keys.has('d') || keys.has('arrowright') ? 1 : 0) - (keys.has('a') || keys.has('arrowleft') ? 1 : 0);
    dz = (keys.has('s') || keys.has('arrowdown') ? 1 : 0) - (keys.has('w') || keys.has('arrowup') ? 1 : 0);
  }
  pl.moving = !!(dx || dz);
  if (pl.moving) {
    const len = Math.hypot(dx, dz), sp = (keys.has('shift') ? RUN : WALK) * dt, nx = pl.pos.x + dx / len * sp, nz = pl.pos.z + dz / len * sp;
    if (!blocked(nx, pl.pos.z, floor.obstacles)) pl.pos.x = nx;
    if (!blocked(pl.pos.x, nz, floor.obstacles)) pl.pos.z = nz;
    pl.yaw = Math.atan2(dx, dz); pl.walk += sp;
  }
}
export const inZone = (p, z) => p.x > z.x0 && p.x < z.x1 && p.z > z.z0 && p.z < z.z1;
