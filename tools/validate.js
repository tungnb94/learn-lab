// Usage: node tools/validate.js [file-or-dir ...]   (default: data/ and local/ if present)
// Checks module files (LAB.module), extension files (LAB.extend: deep questions + extra projects)
// and personal material files (LAB.material).
const fs = require('fs'), path = require('path'), vm = require('vm');
const root = path.join(__dirname, '..');
let targets = process.argv.slice(2);
if (!targets.length) targets = [path.join(root, 'data'), path.join(root, 'local')].filter(p => fs.existsSync(p));
const files = [];
(function walk(list) { for (const p of list) { const st = fs.statSync(p); if (st.isDirectory()) walk(fs.readdirSync(p).map(f => path.join(p, f))); else if (p.endsWith('.js')) files.push(p); } })(targets);

let errors = 0; const counts = { module: 0, extend: 0, material: 0 };
const err = (f, m) => { errors++; console.log('✗', path.relative(root, f), '—', m); };
const isStr = v => typeof v === 'string' && v.trim().length > 0;
const arr = (v, n) => Array.isArray(v) && v.length >= (n || 1);
const ids = new Set();
const QTYPES = ['derive', 'critique', 'counterexample', 'predict', 'design', 'connect', 'debate'];
const RELS = ['adapted from', 'motivated by', 'original'];

function dollarsOdd(s) { return ((String(s).replace(/<pre>[\s\S]*?<\/pre>/g, '').replace(/\\\$/g, '').match(/\$/g) || []).length) % 2 === 1; }
function texBraces(s) {
  const segs = String(s).replace(/<pre>[\s\S]*?<\/pre>/g, '').split('$'); const bad = [];
  for (let i = 1; i < segs.length; i += 2) { let d = 0; const m = segs[i]; for (let j = 0; j < m.length; j++) { if (m[j] === '\\' && (m[j + 1] === '{' || m[j + 1] === '}')) { j++; continue; } if (m[j] === '{') d++; else if (m[j] === '}') d--; } if (d) bad.push(m.slice(0, 60)); }
  return bad;
}
function checkText(E, label, s) {
  if (dollarsOdd(s)) E(`${label}: odd number of $ delimiters`);
  if (/[\x08\x0b\x0c]|\t[a-z]/.test(s)) E(`${label}: control character in text (a TeX backslash was lost: write \\\\ in JS strings)`);
  texBraces(s).forEach(b => E(`${label}: unbalanced braces in TeX "${b}"`));
  if (/<script|onerror=|onclick=|javascript:/i.test(s)) E(`${label}: script/handlers not allowed`);
}
function checkProject(E, p, i) {
  for (const k of ['id', 'title', 'hours', 'goal', 'data']) if (!isStr(p[k])) E(`project ${i}: ${k} required`);
  if (!['core', 'stretch', 'replication'].includes(p.level)) E(`project ${i}: level must be core|stretch|replication`);
  for (const k of ['steps', 'deliverables', 'acceptance']) if (!arr(p[k])) E(`project ${i}: ${k}[] required`);
  if (p.level === 'replication' && !(p.paper && isStr(p.paper.label))) E(`project ${i}: replication needs paper {label,url}`);
  if (ids.has(p.id)) E('duplicate project id ' + p.id); ids.add(p.id);
}
function checkQuestion(E, q, i, needExternal) {
  const L = `question ${i} (${q.id || '?'})`;
  if (!isStr(q.id)) E(`${L}: id required`); else { if (ids.has(q.id)) E('duplicate question id ' + q.id); ids.add(q.id); }
  if (!QTYPES.includes(q.type)) E(`${L}: type must be one of ${QTYPES.join('|')}`);
  if (![1, 2, 3].includes(q.difficulty)) E(`${L}: difficulty 1..3`);
  for (const k of ['prompt', 'whyItMatters']) if (!isStr(q[k])) E(`${L}: ${k} required`);
  if (!arr(q.hints, 2)) E(`${L}: at least 2 tiered hints`);
  if (!arr(q.keyPoints, 3)) E(`${L}: at least 3 keyPoints`);
  if (!arr(q.followUps, 1)) E(`${L}: at least 1 followUp`);
  const s = q.source || {};
  if (!isStr(s.label) || !RELS.includes(s.relation)) E(`${L}: source {label, url, relation: ${RELS.join('|')}}`);
  if (needExternal && s.relation === 'original' && !['connect', 'design'].includes(q.type)) E(`${L}: "original" source only allowed for connect/design`);
  if (q.type === 'debate') {
    if (!arr(q.sides, 2)) E(`${L}: debate needs sides[] (>=2)`);
    (q.sides || []).forEach((sd, j) => { if (!isStr(sd.position) || !arr(sd.refs)) E(`${L}: side ${j} needs position + refs[]`); });
  }
  [q.prompt, q.whyItMatters, ...(q.hints || []), ...(q.keyPoints || []), ...(q.followUps || [])].forEach(t => checkText(E, L, t));
}

for (const f of files) {
  if (['subject.js', 'index.js'].includes(path.basename(f))) continue;
  const calls = [];
  const sandbox = { LAB: { module: (s, m) => calls.push(['module', s, m]), extend: (id, x) => calls.push(['extend', id, x]), material: m => calls.push(['material', null, m]), subject: () => { } }, window: {} };
  try { vm.runInNewContext(fs.readFileSync(f, 'utf8'), sandbox, { filename: f }); }
  catch (e) { err(f, 'syntax/runtime: ' + e.message); continue; }
  if (calls.length !== 1) { err(f, `expected exactly 1 LAB.* call, got ${calls.length}`); continue; }
  const [kind, s, m] = calls[0]; counts[kind]++;
  const E = msg => err(f, msg);

  if (kind === 'module') {
    if (!isStr(s)) E('subject id missing');
    for (const k of ['id', 'title', 'summary']) if (!isStr(m[k])) E(`missing ${k}`);
    if (typeof m.order !== 'number') E('order must be a number');
    if (ids.has(m.id)) E('duplicate module id ' + m.id); ids.add(m.id);
    if (!arr(m.sources)) E('sources[] required');
    if (!arr(m.lessons)) E('lessons[] required');
    (m.lessons || []).forEach((l, i) => {
      if (!isStr(l.id) || !isStr(l.title)) E(`lesson ${i}: id/title required`);
      if (!isStr(l.html) && !(arr(l.links) && isStr(l.focus))) E(`lesson ${i}: needs html (own lesson) or links[] + focus (external-course lesson)`);
      (l.links || []).forEach((x, j) => { if (!isStr(x.label) || typeof x.url !== 'string') E(`lesson ${i} link ${j}: label/url required`); });
      if (typeof l.minutes !== 'number') E(`lesson ${i}: minutes must be number`);
      if (ids.has(l.id)) E('duplicate lesson id ' + l.id); ids.add(l.id);
      checkText(E, `lesson ${i}`, (l.html || '') + ' ' + (l.focus || ''));
    });
    if (!arr(m.cheatsheet, 6)) E('cheatsheet: at least 6 entries');
    (m.cheatsheet || []).forEach((c, i) => { if (!isStr(c.term)) E(`cheatsheet ${i}: term required`); if (c.formula && /\$/.test(c.formula)) E(`cheatsheet ${i}: formula must not contain $`); if (c.formula) texBraces('$' + c.formula + '$').forEach(b => E(`cheatsheet ${i}: unbalanced braces`)); });
    if (!arr(m.flashcards, 8)) E('flashcards: at least 8');
    (m.flashcards || []).forEach((c, i) => { if (!isStr(c.q) || !isStr(c.a)) E(`flashcard ${i}: q/a required`); checkText(E, `flashcard ${i}`, c.q + ' ' + c.a); });
    if (!arr(m.projects)) E('projects[] required');
    (m.projects || []).forEach((p, i) => checkProject(E, p, i));
    const fr = m.frontier || {};
    if (!isStr(fr.asOf) || !isStr(fr.summary)) E('frontier.asOf/summary required');
    if (!arr(fr.threads, 3)) E('frontier.threads: at least 3');
    (fr.threads || []).forEach((t, i) => { if (!isStr(t.title) || !isStr(t.why) || !Array.isArray(t.refs)) E(`thread ${i}: title/why/refs required`); });
    if (!arr(fr.openQuestions, 3)) E('frontier.openQuestions: at least 3');
    if (!arr(fr.brainstorm, 3)) E('frontier.brainstorm: at least 3');
  }

  if (kind === 'extend') {
    if (!isStr(s)) E('module id missing in LAB.extend');
    if (!arr(m.questions, 6)) E('questions: at least 6');
    (m.questions || []).forEach((q, i) => checkQuestion(E, q, i, true));
    const types = new Set((m.questions || []).map(q => q.type));
    if (types.size < 4) E(`questions: use at least 4 different types (have ${[...types].join(',')})`);
    (m.projects || []).forEach((p, i) => checkProject(E, p, i));
  }

  if (kind === 'material') {
    for (const k of ['id', 'title', 'kind', 'summary', 'addedOn']) if (!isStr(m[k])) E(`material: ${k} required`);
    if (!['paper', 'lecture-notes', 'chapter', 'other'].includes(m.kind)) E('material.kind: paper|lecture-notes|chapter|other');
    for (const k of ['contributions', 'assumptions', 'limitations', 'readingPlan', 'openQuestions', 'brainstorm']) if (!arr(m[k])) E(`material: ${k}[] required`);
    if (!arr(m.outline, 2)) E('material.outline: at least 2 sections');
    (m.outline || []).forEach((o, i) => { if (!isStr(o.id) || !isStr(o.title) || !isStr(o.gist)) E(`outline ${i}: id/title/gist required`); checkText(E, `outline ${i}`, [o.gist, ...(o.keyIdeas || []), ...(o.equations || []).map(x => '$' + x + '$')].join(' ')); });
    if (!arr(m.questions, 5)) E('material.questions: at least 5');
    (m.questions || []).forEach((q, i) => checkQuestion(E, q, i, false));
    (m.flashcards || []).forEach((c, i) => { if (!isStr(c.q) || !isStr(c.a)) E(`flashcard ${i}: q/a required`); });
    (m.connections || []).forEach((c, i) => { if (!isStr(c.moduleId) || !isStr(c.why)) E(`connection ${i}: moduleId/why required`); });
    (m.related || []).forEach((r, i) => { if (!isStr(r.label) || !['builds on', 'challenges', 'extends', 'applies'].includes(r.relation)) E(`related ${i}: label + relation builds on|challenges|extends|applies`); });
  }
}
const summary = Object.entries(counts).filter(([, n]) => n).map(([k, n]) => `${n} ${k}`).join(', ') || 'nothing';
console.log(errors ? `\n${errors} problem(s) in ${files.length} file(s)` : `✓ OK: ${summary} in ${files.length} file(s)`);
process.exit(errors ? 1 : 0);
