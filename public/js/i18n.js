// Tiny i18n layer: t('key', { param }), language list, persistence and live switching.
// To add a language: create js/lang/<code>.js with the same keys as en.js and add it to LANGS below.
import en from './lang/en.js';
import id from './lang/id.js';
import es from './lang/es.js';
import ja from './lang/ja.js';
import zh from './lang/zh.js';

// `ai` is the language name handed to the AI when it must reply in the chosen language.
export const LANGS = [
  { code: 'en', name: 'English', locale: 'en-US', ai: 'English', dict: en },
  { code: 'id', name: 'Bahasa Indonesia', locale: 'id-ID', ai: 'Indonesian', dict: id },
  { code: 'es', name: 'Español', locale: 'es-ES', ai: 'Spanish', dict: es },
  { code: 'ja', name: '日本語', locale: 'ja-JP', ai: 'Japanese', dict: ja },
  { code: 'zh', name: '简体中文', locale: 'zh-CN', ai: 'Simplified Chinese', dict: zh },
];
const KEY = 'aw-lang';
const byCode = (c) => LANGS.find(l => l.code === c);

function detect() {
  try { const q = new URLSearchParams(location.search).get('lang'); if (q && byCode(q)) return q; } catch { /* ignore */ }
  try { const s = localStorage.getItem(KEY); if (s && byCode(s)) return s; } catch { /* storage blocked */ }
  for (const l of (navigator.languages || [navigator.language || 'en'])) { const c = String(l).toLowerCase().split('-')[0]; if (byCode(c)) return c; }
  return 'en';
}

let cur = byCode(detect());
const listeners = new Set();

export const getLang = () => cur.code;
export const langInfo = () => cur;
export const locale = () => cur.locale;
export function t(key, params) {
  let s = cur.dict[key];
  if (s === undefined) s = en[key];
  if (s === undefined) return key;
  return params ? s.replace(/\{(\w+)\}/g, (m, k) => (params[k] !== undefined ? params[k] : m)) : s;
}
// "does this language have its own text for the key" (used for server-supplied fallbacks)
export const has = (key) => cur.dict[key] !== undefined || en[key] !== undefined;

export function setLang(code) {
  if (!byCode(code) || code === cur.code) return;
  cur = byCode(code);
  try { localStorage.setItem(KEY, code); } catch { /* storage blocked */ }
  applyStatic(); listeners.forEach(fn => fn(code));
}
export const onLang = (fn) => { listeners.add(fn); return () => listeners.delete(fn); };

// Static HTML: [data-i18n] (text), [data-i18n-title], [data-i18n-aria]
export function applyStatic() {
  document.documentElement.lang = cur.code;
  document.querySelectorAll('[data-i18n]').forEach(n => { n.textContent = t(n.dataset.i18n); });
  document.querySelectorAll('[data-i18n-title]').forEach(n => { n.title = t(n.dataset.i18nTitle); });
  document.querySelectorAll('[data-i18n-aria]').forEach(n => { n.setAttribute('aria-label', t(n.dataset.i18nAria)); });
}
