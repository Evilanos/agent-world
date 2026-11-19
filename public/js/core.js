// Shared constants, helpers and the shared mutable state `G` (2D version).
import { t } from './i18n.js';
export { t };

// `label` / `desc` are getters, so they always follow the language currently selected.
const tx = (o, props) => { for (const [p, key] of Object.entries(props)) Object.defineProperty(o, p, { get: () => t(key), enumerable: true }); return o; };

export const STATUS = {
  busy:     tx({ color: '#ffb020' }, { label: 'status.busy' }),
  idle:     tx({ color: '#3ddc97' }, { label: 'status.idle' }),
  recent:   tx({ color: '#4aa8ff' }, { label: 'status.recent' }),
  sleeping: tx({ color: '#6b7280' }, { label: 'status.sleeping' }),
};
export const KIND = {
  claude:      tx({ color: '#d97757' }, { label: 'kind.claude' }),
  antigravity: tx({ color: '#8b7cf6' }, { label: 'kind.antigravity' }),
  security:    tx({ color: '#f2c200' }, { label: 'kind.security' }),
};
// Agent tools the server found that this file does not know yet (Codex, OpenCode, custom adapters, ...) get a label and colour from the server
export function registerKind(id, label, color) { if (!KIND[id]) KIND[id] = { color: /^#[0-9a-fA-F]{6}$/.test(color || '') ? color : '#9aa4b8', label: String(label || id).slice(0, 40) }; return id; }
export const CALL = {
  ask:  tx({ bg: '#ffb020', fg: '#1c1300' }, { label: 'call.ask.label', bubble: 'call.ask.bubble' }),
  done: tx({ bg: '#3ddc97', fg: '#06210f' }, { label: 'call.done.label', bubble: 'call.done.bubble' }),
};

// Outfits: every project room dresses its bots for the work they do.
const role = (id, shirt, pants, accent) => tx({ shirt, pants, accent }, { label: `role.${id}.label`, desc: `role.${id}.desc` });
export const ROLES = {
  finance:  role('finance', '#1f2a44', '#171e33', '#d64545'),
  it:       role('it', '#0f8b8d', '#2b3445', '#ffffff'),
  engineer: role('engineer', '#3d4455', '#222836', '#9aa4b8'),
  game:     role('game', '#7a4bd1', '#2b2f4a', '#e8453c'),
  ai:       role('ai', '#f1f4fa', '#3a4258', '#3b82f6'),
  design:   role('design', '#e6b7c9', '#33384d', '#c2437a'),
  casual:   role('casual', '#4aa8ff', '#2b3350', '#ffffff'),
  security: role('security', '#1b2233', '#141a29', '#ff8a00'),
};

// What an agent is doing with a tool, in the current language. `a` is an agent from /api/world.
const TOOL_KEY = { Edit: 'edit', MultiEdit: 'edit', NotebookEdit: 'edit', Write: 'write', Read: 'read', Grep: 'search', Glob: 'search', Bash: 'run', PowerShell: 'run', Task: 'delegate', Agent: 'delegate', WebSearch: 'web', WebFetch: 'fetch', TodoWrite: 'plan' };
export function toolLabel(tool, target = '') {
  if (!tool) return '';
  const k = TOOL_KEY[tool];
  return (k ? t('act.' + k, { target }) : t('act.use', { tool, target })).replace(/\s+$/, '');
}
export const actText = (a) => (a && a.activityTool ? toolLabel(a.activityTool, a.activityTarget || '') : (a && a.activity) || '');
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
  if (!Number.isFinite(ms) || ms <= 0) return t('ago.none');
  const s = Math.max(0, (Date.now() - ms) / 1000);
  if (s < 60) return t('ago.now'); if (s < 3600) return t('ago.min', { n: Math.floor(s / 60) });
  if (s < 86400) return t('ago.hour', { n: Math.floor(s / 3600) }); return t('ago.day', { n: Math.floor(s / 86400) });
}
export const el = (tag, props = {}, ...kids) => { const e = Object.assign(document.createElement(tag), props); kids.flat().forEach(k => e.append(k)); return e; };

export const G = {
  floor: null, floorNo: 2, floors: [],
  actors: [], guards: [], player: null,
  calledMap: new Map(), callOrder: [],
  security: {},            // project key -> cached security report
  blocked: 0,              // cross-project attempts stopped by security
  firing: new Set(), defending: null,
  viewFloor: 2, floorMenu: false,   // the floor the sidebar is browsing (may differ from the floor you stand on)
  travel: new Map(),                // agent id -> { eta } : called from another floor, riding the lift to you
  visitors: new Set(),              // agents from other floors that have arrived on your floor
  summoned: new Set(),     // agents the human called over with the "Call" button
  expanded: new Set(),     // sidebar project cards that are open
  lastData: null, frame: 0, follow: false,
  cam: { x: 0, z: -5, zoom: 0.8 },
};
