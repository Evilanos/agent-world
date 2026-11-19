#!/usr/bin/env node
// Checks the translation dictionaries: every language must define exactly the keys of en.js with the same
// {placeholders}, and every t('key') used in the front-end code must exist. Usage: node scripts/check-i18n.js
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const PUB = path.join(__dirname, '..', 'public'), LANG_DIR = path.join(PUB, 'js', 'lang');
const load = (file) => { const ctx = { module: { exports: {} } }; vm.runInNewContext(fs.readFileSync(file, 'utf8').replace(/export default/, 'module.exports ='), ctx, { filename: file }); return ctx.module.exports; };
const ph = (s) => (String(s).match(/\{\w+\}/g) || []).sort().join(',');

const en = load(path.join(LANG_DIR, 'en.js')), enKeys = Object.keys(en);
let problems = 0;
const bad = (msg) => { problems++; console.log('  ✗ ' + msg); };

for (const f of fs.readdirSync(LANG_DIR).filter(f => f.endsWith('.js') && f !== 'en.js')) {
  let d; try { d = load(path.join(LANG_DIR, f)); } catch (e) { console.log(f + ':'); bad('cannot load: ' + e.message); continue; }
  console.log(`${f}: ${Object.keys(d).length} keys`);
  for (const k of enKeys) { if (!(k in d)) bad('missing ' + k); else if (typeof d[k] !== 'string' || !d[k].trim()) bad('empty ' + k); else if (ph(d[k]) !== ph(en[k])) bad(`placeholders differ in ${k}: ${ph(en[k])} vs ${ph(d[k])}`); }
  for (const k of Object.keys(d)) if (!(k in en)) bad('extra key ' + k);
}

// keys used by the code
const used = new Set(), files = [];
(function walk(dir) { for (const e of fs.readdirSync(dir, { withFileTypes: true })) { const p = path.join(dir, e.name); if (e.isDirectory()) { if (p !== LANG_DIR) walk(p); } else if (/\.(js|html)$/.test(e.name)) files.push(p); } })(PUB);
for (const f of files) {
  const src = fs.readFileSync(f, 'utf8');
  for (const m of src.matchAll(/\bt\(\s*'([\w.\-]+)'/g)) used.add(m[1]);
  for (const m of src.matchAll(/data-i18n(?:-title|-aria)?="([\w.\-]+)"/g)) used.add(m[1]);
}
console.log(`code uses ${used.size} static keys`);
// (keys built dynamically, e.g. 'act.' + name, end with a dot and are checked through the dictionaries above)
for (const k of used) if (!k.endsWith('.') && k !== 'key' && !(k in en)) bad('key used in code but not defined: ' + k);

console.log(problems ? `\n${problems} problem(s)` : '\nAll dictionaries are consistent.');
process.exit(problems ? 1 : 0);
