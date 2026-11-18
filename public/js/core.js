// Shared constants, helpers and the shared mutable state `G` (2D version).
export const STATUS = {
  busy:     { color: '#ffb020', label: 'Bekerja' },
  idle:     { color: '#3ddc97', label: 'Siaga (sesi terbuka)' },
  recent:   { color: '#4aa8ff', label: 'Aktif < 24 jam' },
  sleeping: { color: '#6b7280', label: 'Tidur' },
};
export const KIND = {
  claude:      { color: '#d97757', label: 'Claude Code' },
  antigravity: { color: '#8b7cf6', label: 'Antigravity (Gemini)' },
  security:    { color: '#f2c200', label: 'Security' },
};
export const CALL = {
  ask:  { label: 'Butuh pendapat Anda', bubble: 'Pendapat Anda ?', bg: '#ffb020', fg: '#1c1300' },
  done: { label: 'Sudah selesai',       bubble: 'Selesai ✓',       bg: '#3ddc97', fg: '#06210f' },
};

// Outfits: every project room dresses its bots for the work they do.
export const ROLES = {
  finance:  { label: 'Finance',     desc: 'jas, dasi & kacamata',    shirt: '#1f2a44', pants: '#171e33', accent: '#d64545' },
  it:       { label: 'IT Support',  desc: 'polo, lanyard & headset', shirt: '#0f8b8d', pants: '#2b3445', accent: '#ffffff' },
  engineer: { label: 'Engineer',    desc: 'hoodie',                  shirt: '#3d4455', pants: '#222836', accent: '#9aa4b8' },
  game:     { label: 'Game Dev',    desc: 'topi & headphone',        shirt: '#7a4bd1', pants: '#2b2f4a', accent: '#e8453c' },
  ai:       { label: 'AI Lab',      desc: 'jas lab & goggles',       shirt: '#f1f4fa', pants: '#3a4258', accent: '#3b82f6' },
  design:   { label: 'Designer',    desc: 'beret & apron',           shirt: '#e6b7c9', pants: '#33384d', accent: '#c2437a' },
  casual:   { label: 'Staf',        desc: 'kaos kasual',             shirt: '#4aa8ff', pants: '#2b3350', accent: '#ffffff' },
  security: { label: 'Security',    desc: 'seragam & rompi',         shirt: '#1b2233', pants: '#141a29', accent: '#ff8a00' },
};
const ROLE_RULES = [
  ['finance', /cash|\bkas\b|finance|keuangan|bayar|payment|invoice|akuntan|bank|ledger/i],
  ['it', /tiket|ticket|helpdesk|support|\bit\b|itsm|service[-_ ]?desk/i],
  ['game', /mario|game|unity|arcade|play/i],
  ['ai', /ai[-_ ]?agent|\bai\b|\bml\b|llm|research/i],
  ['engineer', /bridge|api|backend|server|infra|devops|migrat|engine|service/i],
  ['design', /design|\bui\b|\bux\b|brand|figma/i],
  ['casual', /^~|\bhome\b/i],
];
export function roleOf(name, path = '') {
  const s = name + ' ' + path;
  for (const [id, re] of ROLE_RULES) if (re.test(s)) return id;
  return ['design', 'engineer', 'casual'][hash(name) % 3];
}

export const $ = (id) => document.getElementById(id);
export const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
export function hash(s) { let h = 2166136261; for (const c of String(s)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
export function trunc(s, n) { s = s || ''; return s.length > n ? s.slice(0, n - 1) + '…' : s; }
export const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
export const damp = (k, dt) => 1 - Math.exp(-k * dt);
export const wrapAngle = (a) => Math.atan2(Math.sin(a), Math.cos(a));
export const P = (x, z) => ({ x, z });
export const dist = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
export function ago(ms) {
  if (!Number.isFinite(ms) || ms <= 0) return '—';
  const s = Math.max(0, (Date.now() - ms) / 1000);
  if (s < 60) return 'baru saja'; if (s < 3600) return Math.floor(s / 60) + ' mnt lalu';
  if (s < 86400) return Math.floor(s / 3600) + ' jam lalu'; return Math.floor(s / 86400) + ' hari lalu';
}
export const el = (tag, props = {}, ...kids) => { const e = Object.assign(document.createElement(tag), props); kids.flat().forEach(k => e.append(k)); return e; };

export const G = {
  floor: null, floorNo: 2, floors: [],
  actors: [], guards: [], player: null,
  calledMap: new Map(), callOrder: [],
  security: {},            // project key -> cached security report
  blocked: 0,              // cross-project attempts stopped by security
  firing: new Set(), defending: null,
  lastData: null, frame: 0, follow: false,
  cam: { x: 0, z: -5, zoom: 0.8 },
};
