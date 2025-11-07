// Simple encoding guard: fail if files contain replacement char (U+FFFD) or common mojibake patterns.
// Scans typical text files, excluding heavy/build/vendor dirs.
const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const EXCLUDES = new Set(['.git', 'node_modules', '.next', 'dist', 'build', 'venv', '.venv', '__pycache__']);
const EXT = new Set(['.ts', '.tsx', '.js', '.jsx', '.json', '.md', '.css', '.scss', '.html', '.yml', '.yaml']);

function isExcluded(p) {
  return [...EXCLUDES].some((name) => p.split(path.sep).includes(name));
}

function listFiles(dir) {
  const out = [];
  (function walk(d){
    const entries = fs.readdirSync(d, { withFileTypes: true });
    for (const e of entries) {
      const full = path.join(d, e.name);
      if (isExcluded(full)) continue;
      if (e.isDirectory()) walk(full);
      else if (EXT.has(path.extname(e.name))) out.push(full);
    }
  })(dir);
  return out;
}

function checkFile(p) {
  let buf = fs.readFileSync(p);
  // skip binary (contains NUL)
  if (buf.includes(0)) return null;
  const txt = buf.toString('utf8');
  const issues = [];
  if (txt.includes('\uFFFD') || txt.includes('?')) issues.push('contains U+FFFD replacement char');
  if (txt.includes('??')) issues.push('contains mojibake sequence "??"');
  // quick JSON validation
  if (p.endsWith('.json')) {
    try { JSON.parse(txt); } catch (e) { issues.push('invalid JSON: ' + e.message); }
  }
  return issues.length ? { file: p, issues } : null;
}

const files = listFiles(ROOT);
const problems = [];
for (const f of files) {
  const r = checkFile(f);
  if (r) problems.push(r);
}

if (problems.length) {
  console.error('\n[encoding-check] Found potential encoding issues:');
  for (const p of problems) {
    console.error(' - ' + path.relative(ROOT, p.file));
    for (const i of p.issues) console.error('    * ' + i);
  }
  console.error('\nFailing commit/CI. Fix the files or ensure they are saved as UTF-8.');
  process.exit(1);
}
console.log('[encoding-check] OK: no issues');
