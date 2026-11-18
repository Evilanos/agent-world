// Lightweight static security review of a project folder (what the "security" agent does).
// Local only, read-only, bounded in files / size / time. Secret values are always masked in the output.
const fs = require('fs');
const path = require('path');

const HOME = require('os').homedir().toLowerCase();
const SKIP_DIRS = new Set(['downloads', 'documents', 'desktop', 'appdata', 'onedrive', 'pictures', 'music', 'videos','node_modules', '.git', 'vendor', 'dist', 'build', '.next', 'coverage', '__pycache__', '.venv', 'venv', 'storage', 'uploads', '.cache', '.idea', '.vscode', 'bower_components', 'public/build']);
const EXTS = new Set(['.js', '.mjs', '.cjs', '.ts', '.tsx', '.jsx', '.php', '.py', '.rb', '.go', '.java', '.cs', '.json', '.yml', '.yaml', '.env', '.sh', '.ps1', '.html', '.htm', '.vue', '.sql', '.ini', '.conf', '.cfg', '.toml', '.xml', '.properties']);
const MAX_FILES = 600, MAX_BYTES = 200 * 1024, MAX_FINDINGS = 60, BUDGET_MS = 6000, PER_RULE_PER_FILE = 3;
const PLACEHOLDER = /your[_-]|xxx|example|changeme|change_me|dummy|sample|<[^>]+>|\$\{|process\.env|getenv|env\(|\*{3,}|placeholder|test|todo/i;

const RULES = [
  { id: 'aws-key', sev: 'high', title: 'AWS access key tertanam di kode', re: /AKIA[0-9A-Z]{16}/, advice: 'Cabut kunci, pindahkan ke environment / secret manager.', secret: true },
  { id: 'private-key', sev: 'high', title: 'Private key tertanam di repo', re: /-----BEGIN [A-Z ]*PRIVATE KEY-----/, advice: 'Hapus dari repo, rotasi key, simpan di vault.', secret: true },
  { id: 'token', sev: 'high', title: 'Token API (GitHub / OpenAI / Slack) tertanam', re: /\b(ghp_[A-Za-z0-9]{30,}|sk-[A-Za-z0-9]{20,}|xox[bp]-[A-Za-z0-9-]{10,})/, advice: 'Revoke token dan pakai environment variable.', secret: true },
  { id: 'hardcoded-secret', sev: 'medium', title: 'Password / secret / token di-hardcode', re: /(?:api[_-]?key|secret|passwd|password|pwd|token|auth)[\w-]*\s*[:=]\s*['"]([^'"\s]{8,})['"]/i, advice: 'Pindahkan ke .env atau secret manager.', secret: true, check: (m) => !PLACEHOLDER.test(m[1]) },
  { id: 'cmd-injection', sev: 'high', title: 'Eksekusi perintah dengan input dinamis (command injection)', re: /\b(?:exec|execSync|spawn|system|shell_exec|passthru|popen|proc_open)\s*\([^)]*(?:\+|\$\{|\$_(?:GET|POST|REQUEST)|`)/, advice: 'Pakai execFile / argumen array dan validasi input.' },
  { id: 'eval', sev: 'medium', title: 'Penggunaan eval / new Function', re: /\beval\s*\(|\bnew Function\s*\(/, advice: 'Hindari eval; parse data dengan JSON.parse atau pustaka aman.' },
  { id: 'xss-innerhtml', sev: 'medium', title: 'Potensi XSS (innerHTML / document.write)', re: /\.innerHTML\s*=(?!\s*['"`]\s*['"`])|dangerouslySetInnerHTML|document\.write\s*\(/, advice: 'Gunakan textContent atau sanitasi (DOMPurify).' },
  { id: 'php-xss', sev: 'high', title: 'PHP mencetak input pengguna tanpa escape (XSS)', re: /\b(?:echo|print)\b[^;\n]*\$_(?:GET|POST|REQUEST|COOKIE)\[/, advice: 'Bungkus dengan htmlspecialchars().' },
  { id: 'sqli-input', sev: 'high', title: 'Query SQL memakai input pengguna langsung (SQL injection)', re: /\b(?:SELECT\s[^;\n]{1,80}?\bFROM|INSERT\s+INTO|UPDATE\s+\S+\s+SET|DELETE\s+FROM)\b[^;\n]{0,160}?\$_(?:GET|POST|REQUEST|COOKIE)/i, advice: 'Pakai prepared statement / parameter binding.' },
  { id: 'sqli-concat', sev: 'medium', title: 'Query SQL disusun dari string (periksa asal nilainya)', re: /\b(?:SELECT\s[^;\n]{1,80}?\bFROM|INSERT\s+INTO|UPDATE\s+\S+\s+SET|DELETE\s+FROM)\b[^;\n]{0,120}?(?:["']\s*\.\s*\$|["']\s*\+\s*[\w$]|\$\{)/i, advice: 'Pastikan nilai berasal dari kode tepercaya; selebihnya pakai parameter binding.' },
  { id: 'php-mysql', sev: 'medium', title: 'Fungsi mysql_* usang (rentan & tidak didukung)', re: /\bmysql_(?:query|connect|fetch_\w+)\s*\(/, advice: 'Migrasi ke PDO / mysqli prepared statement.' },
  { id: 'php-include', sev: 'high', title: 'include/require atau unserialize dari input pengguna', re: /\b(?:include|require)(?:_once)?\b[^;\n]*\$_(?:GET|POST|REQUEST)|\bunserialize\s*\(\s*\$_/, advice: 'Whitelist file yang boleh di-include; jangan unserialize input.' },
  { id: 'weak-hash', sev: 'medium', title: 'Hash lemah (md5 / sha1)', re: /\b(?:md5|sha1)\s*\(|createHash\(\s*['"](?:md5|sha1)['"]/i, advice: 'Gunakan bcrypt / argon2 untuk password, SHA-256+ untuk integritas.' },
  { id: 'cors-wildcard', sev: 'medium', title: 'CORS terbuka untuk semua origin', re: /Access-Control-Allow-Origin['"]?\s*[:,]\s*['"]?\*|origin\s*:\s*['"]\*['"]/, advice: 'Batasi origin ke domain yang dikenal.' },
  { id: 'tls-off', sev: 'high', title: 'Verifikasi TLS dimatikan', re: /rejectUnauthorized\s*:\s*false|verify\s*=\s*False|CURLOPT_SSL_VERIFYPEER\s*,\s*(?:false|0)|NODE_TLS_REJECT_UNAUTHORIZED\s*=\s*['"]?0/, advice: 'Aktifkan verifikasi sertifikat.' },
  { id: 'weak-random', sev: 'low', title: 'Math.random dipakai untuk token / secret', re: /(?:token|secret|password|key|session)[^\n]{0,40}Math\.random\(\)|Math\.random\(\)[^\n]{0,40}(?:token|secret|password|session)/i, advice: 'Gunakan crypto.randomBytes / crypto.randomUUID.' },
  { id: 'chmod-777', sev: 'medium', title: 'Permission 777', re: /chmod\s+(?:-R\s+)?777/, advice: 'Beri izin minimum yang dibutuhkan.' },
];

const mask = (s) => s.replace(/(['"])([^'"\s]{3})[^'"\s]{3,}(['"])/g, '$1$2••••$3').replace(/(AKIA|ghp_|sk-|xox[bp]-)[A-Za-z0-9-]{4,}/g, '$1••••').replace(/(PRIVATE KEY-----).*/, '$1 ••••');

async function scanSecurity(root) {
  const t0 = Date.now(), findings = [], counts = { high: 0, medium: 0, low: 0 };
  let scanned = 0, truncated = false, base;
  try { base = await fs.promises.realpath(root); } catch { return { error: 'folder tidak ditemukan', findings: [], counts, scannedFiles: 0 }; }
  if (base.toLowerCase() === HOME) return { skipped: true, note: 'Folder ini adalah folder Home pengguna, bukan sebuah project, jadi tidak dipindai.', findings: [], counts, scannedFiles: 0, scannedAt: Date.now() };
  const files = [], queue = [base]; let envFile = false, gitignoreHasEnv = null, pkgIssues = [];
  while (queue.length && files.length < MAX_FILES && Date.now() - t0 < BUDGET_MS) {
    const dir = queue.shift();
    let ents; try { ents = await fs.promises.readdir(dir, { withFileTypes: true }); } catch { continue; }
    for (const e of ents) {
      const full = path.join(dir, e.name);
      if (e.isSymbolicLink()) continue;                       // never leave the project folder
      if (e.isDirectory()) { if (!SKIP_DIRS.has(e.name.toLowerCase()) && queue.length < 400) queue.push(full); continue; }
      if (!e.isFile()) continue;
      if (/^\.env(\.|$)/.test(e.name) && !/example|sample|template/i.test(e.name)) envFile = true;
      if (e.name === '.gitignore') { try { gitignoreHasEnv = /(^|\n)\s*(\/?\.env|\*\.env|\*\*\/\.env)/.test(await fs.promises.readFile(full, 'utf8')); } catch { /* ignore */ } }
      const ext = path.extname(e.name).toLowerCase();
      if (EXTS.has(ext) || /^\.env/.test(e.name)) files.push(full);
    }
  }
  if (files.length >= MAX_FILES) truncated = true;

  for (const file of files) {
    if (Date.now() - t0 > BUDGET_MS) { truncated = true; break; }
    let txt; try { const st = await fs.promises.stat(file); if (st.size > MAX_BYTES) continue; txt = await fs.promises.readFile(file, 'utf8'); } catch { continue; }
    scanned++;
    const rel = path.relative(base, file).replace(/\\/g, '/');
    if (/(^|\/)(test|tests|__tests__|fixtures?|mocks?)\//i.test(rel) || /\.(min\.js|lock)$/.test(rel)) continue;
    if (path.basename(file) === 'package.json') {
      try { const pj = JSON.parse(txt); for (const k of ['dependencies', 'devDependencies']) for (const [n, v] of Object.entries(pj[k] || {})) if (/^(\*|latest|x)$/i.test(String(v))) pkgIssues.push(n); } catch { /* ignore */ }
    }
    const lines = txt.split('\n'), perRule = {};
    for (let i = 0; i < lines.length && findings.length < MAX_FINDINGS; i++) {
      const line = lines[i]; if (line.length > 500) continue;
      for (const r of RULES) {
        if ((perRule[r.id] || 0) >= PER_RULE_PER_FILE) continue;
        const m = r.re.exec(line); if (!m) continue;
        if (r.check && !r.check(m)) continue;
        perRule[r.id] = (perRule[r.id] || 0) + 1; counts[r.sev]++;
        findings.push({ sev: r.sev, rule: r.id, title: r.title, file: rel, line: i + 1, snippet: mask(line.trim()).slice(0, 140), advice: r.advice });
      }
    }
    if (findings.length >= MAX_FINDINGS) { truncated = true; break; }
  }
  if (envFile && gitignoreHasEnv === false) { counts.high++; findings.unshift({ sev: 'high', rule: 'env-not-ignored', title: 'File .env ada tetapi .gitignore tidak mengecualikannya', file: '.gitignore', line: 0, snippet: '', advice: 'Tambahkan .env ke .gitignore dan rotasi secret yang mungkin sudah ter-commit.' }); }
  if (pkgIssues.length) { counts.low++; findings.push({ sev: 'low', rule: 'unpinned-deps', title: 'Dependensi tanpa versi terkunci: ' + [...new Set(pkgIssues)].slice(0, 5).join(', '), file: 'package.json', line: 0, snippet: '', advice: 'Kunci versi (semver) agar build bisa direproduksi.' }); }
  const order = { high: 0, medium: 1, low: 2 };
  findings.sort((a, b) => order[a.sev] - order[b.sev]);
  return { scannedFiles: scanned, durationMs: Date.now() - t0, scannedAt: Date.now(), counts, findings, truncated };
}

const cache = new Map(); // dir -> { at, result }
async function securityReport(dir, force = false) {
  const hit = cache.get(dir);
  if (!force && hit && Date.now() - hit.at < 10 * 60 * 1000) return hit.result;
  const result = await scanSecurity(dir);
  cache.set(dir, { at: Date.now(), result });
  return result;
}
const cached = (dir) => (cache.get(dir) || {}).result || null;

module.exports = { securityReport, cached };
