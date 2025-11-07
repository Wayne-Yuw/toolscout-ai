// Encoding guard (relaxed):
// - Ignore files under docs/
// - Allow UTF-8 BOM (\uFEFF)
// - Fail only when:
//    * JSON is invalid (after stripping BOM)
//    * JSON contains replacement char U+FFFD
// - For code/text files, only warn if U+FFFD is present

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const EXCLUDES = new Set(['.git', 'node_modules', '.next', 'dist', 'build', 'venv', '.venv', '__pycache__', 'docs']);
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

function stripBOM(txt){
  if (txt.charCodeAt(0) === 0xFEFF) return txt.slice(1);
  return txt;
}

function checkFile(p) {
  const buf = fs.readFileSync(p);
  if (buf.includes(0)) return null; // skip binary
  let txt = buf.toString('utf8');
  txt = stripBOM(txt);
  const hasReplacement = txt.includes('\uFFFD') || txt.includes('?');
  const ext = path.extname(p);

  const rel = path.relative(ROOT, p);

  // JSON: strict
  if (ext === '.json') {
    const issues = [];
    if (hasReplacement) issues.push('contains U+FFFD replacement char');
    try { JSON.parse(txt); } catch (e) { issues.push('invalid JSON: ' + e.message); }
    return issues.length ? { file: rel, issues, level: 'error' } : null;
  }

  // Others: warn only
  if (hasReplacement) {
    return { file: rel, issues: ['contains U+FFFD replacement char'], level: 'warn' };
  }

  return null;
}

const files = listFiles(ROOT);
const problems = [];
for (const f of files) {
  const r = checkFile(f);
  if (r) problems.push(r);
}

const errors = problems.filter(p => p.level === 'error');
const warns = problems.filter(p => p.level === 'warn');

if (warns.length) {
  console.warn('\n[encoding-check] Warnings:');
  for (const p of warns) {
    console.warn(' - ' + p.file);
    for (const i of p.issues) console.warn('    * ' + i);
  }
}

if (errors.length) {
  console.error('\n[encoding-check] Errors:');
  for (const p of errors) {
    console.error(' - ' + p.file);
    for (const i of p.issues) console.error('    * ' + i);
  }
  process.exit(1);
}

console.log('[encoding-check] OK: no blocking issues');
