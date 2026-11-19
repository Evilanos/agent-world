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
  { id: 'aws-key', sev: 'high', title: 'AWS access key embedded in code', re: /AKIA[0-9A-Z]{16}/, advice: 'Revoke the key and move it to environment variables or a secret manager.', secret: true },
  { id: 'private-key', sev: 'high', title: 'Private key committed to the repo', re: /-----BEGIN [A-Z ]*PRIVATE KEY-----/, advice: 'Remove it from the repo, rotate the key and store it in a vault.', secret: true },
  { id: 'token', sev: 'high', title: 'API token (GitHub / OpenAI / Slack) embedded', re: /\b(ghp_[A-Za-z0-9]{30,}|sk-[A-Za-z0-9]{20,}|xox[bp]-[A-Za-z0-9-]{10,})/, advice: 'Revoke the token and use an environment variable.', secret: true },
  { id: 'hardcoded-secret', sev: 'medium', title: 'Password / secret / token hard-coded', re: /(?:api[_-]?key|secret|passwd|password|pwd|token|auth)[\w-]*\s*[:=]\s*['"]([^'"\s]{8,})['"]/i, advice: 'Move it to .env or a secret manager.', secret: true, check: (m) => !PLACEHOLDER.test(m[1]) },
  { id: 'cmd-injection', sev: 'high', title: 'Command execution with dynamic input (command injection)', re: /\b(?:exec|execSync|spawn|system|shell_exec|passthru|popen|proc_open)\s*\([^)]*(?:\+|\$\{|\$_(?:GET|POST|REQUEST)|`)/, advice: 'Use execFile / argument arrays and validate the input.' },
  { id: 'eval', sev: 'medium', title: 'Use of eval / new Function', re: /\beval\s*\(|\bnew Function\s*\(/, advice: 'Avoid eval; parse data with JSON.parse or a safe library.' },
  { id: 'xss-innerhtml', sev: 'medium', title: 'Possible XSS (innerHTML / document.write)', re: /\.innerHTML\s*=(?!\s*['"`]\s*['"`])|dangerouslySetInnerHTML|document\.write\s*\(/, advice: 'Use textContent or sanitize (DOMPurify).' },
  { id: 'php-xss', sev: 'high', title: 'PHP prints user input without escaping (XSS)', re: /\b(?:echo|print)\b[^;\n]*\$_(?:GET|POST|REQUEST|COOKIE)\[/, advice: 'Wrap it in htmlspecialchars().' },
  { id: 'sqli-input', sev: 'high', title: 'SQL query uses user input directly (SQL injection)', re: /\b(?:SELECT\s[^;\n]{1,80}?\bFROM|INSERT\s+INTO|UPDATE\s+\S+\s+SET|DELETE\s+FROM)\b[^;\n]{0,160}?\$_(?:GET|POST|REQUEST|COOKIE)/i, advice: 'Use prepared statements / parameter binding.' },
  { id: 'sqli-concat', sev: 'medium', title: 'SQL query built from strings (check where the values come from)', re: /\b(?:SELECT\s[^;\n]{1,80}?\bFROM|INSERT\s+INTO|UPDATE\s+\S+\s+SET|DELETE\s+FROM)\b[^;\n]{0,120}?(?:["']\s*\.\s*\$|["']\s*\+\s*[\w$]|\$\{)/i, advice: 'Make sure values come from trusted code; otherwise use parameter binding.' },
  { id: 'php-mysql', sev: 'medium', title: 'Deprecated mysql_* functions (vulnerable and unsupported)', re: /\bmysql_(?:query|connect|fetch_\w+)\s*\(/, advice: 'Migrate to PDO / mysqli prepared statements.' },
  { id: 'php-include', sev: 'high', title: 'include/require or unserialize on user input', re: /\b(?:include|require)(?:_once)?\b[^;\n]*\$_(?:GET|POST|REQUEST)|\bunserialize\s*\(\s*\$_/, advice: 'Whitelist includable files; never unserialize user input.' },
  { id: 'weak-hash', sev: 'medium', title: 'Weak hash (md5 / sha1)', re: /\b(?:md5|sha1)\s*\(|createHash\(\s*['"](?:md5|sha1)['"]/i, advice: 'Use bcrypt / argon2 for passwords and SHA-256+ for integrity.' },
  { id: 'cors-wildcard', sev: 'medium', title: 'CORS open to every origin', re: /Access-Control-Allow-Origin['"]?\s*[:,]\s*['"]?\*|origin\s*:\s*['"]\*['"]/, advice: 'Restrict origins to known domains.' },
  { id: 'tls-off', sev: 'high', title: 'TLS verification disabled', re: /rejectUnauthorized\s*:\s*false|verify\s*=\s*False|CURLOPT_SSL_VERIFYPEER\s*,\s*(?:false|0)|NODE_TLS_REJECT_UNAUTHORIZED\s*=\s*['"]?0/, advice: 'Enable certificate verification.' },
  { id: 'weak-random', sev: 'low', title: 'Math.random used for tokens / secrets', re: /(?:token|secret|password|key|session)[^\n]{0,40}Math\.random\(\)|Math\.random\(\)[^\n]{0,40}(?:token|secret|password|session)/i, advice: 'Use crypto.randomBytes / crypto.randomUUID.' },
  { id: 'chmod-777', sev: 'medium', title: 'Permission 777', re: /chmod\s+(?:-R\s+)?777/, advice: 'Grant only the minimum permissions needed.' },
];

const mask = (s) => s.replace(/(['"])([^'"\s]{3})[^'"\s]{3,}(['"])/g, '$1$2••••$3').replace(/(AKIA|ghp_|sk-|xox[bp]-)[A-Za-z0-9-]{4,}/g, '$1••••').replace(/(PRIVATE KEY-----).*/, '$1 ••••');

async function scanSecurity(root) {
  const t0 = Date.now(), findings = [], counts = { high: 0, medium: 0, low: 0 };
  let scanned = 0, truncated = false, base;
  if (!root) return { skipped: true, note: 'This agent tool does not report a project folder, so there is nothing to scan.', findings: [], counts, scannedFiles: 0, scannedAt: Date.now() };
  try { base = await fs.promises.realpath(root); } catch { return { error: 'folder-not-found', findings: [], counts, scannedFiles: 0 }; }
  if (base.toLowerCase() === HOME) return { skipped: true, note: "This folder is the user's Home folder, not a project, so it was not scanned.", findings: [], counts, scannedFiles: 0, scannedAt: Date.now() };
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
  if (envFile && gitignoreHasEnv === false) { counts.high++; findings.unshift({ sev: 'high', rule: 'env-not-ignored', title: 'A .env file exists but .gitignore does not exclude it', file: '.gitignore', line: 0, snippet: '', advice: 'Add .env to .gitignore and rotate any secret that may already be committed.' }); }
  if (pkgIssues.length) { counts.low++; findings.push({ sev: 'low', rule: 'unpinned-deps', title: 'Dependencies without a pinned version', extra: [...new Set(pkgIssues)].slice(0, 5).join(', '), file: 'package.json', line: 0, snippet: '', advice: 'Pin versions (semver) so builds are reproducible.' }); }
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
