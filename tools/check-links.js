// Usage: node tools/check-links.js [dir]   — checks every URL in content files (default: data/)
// Reports: OK (2xx/3xx), BLOCKED (401/403/429/999 — publisher bot walls, usually fine), BROKEN (404/410/5xx/network).
const fs = require('fs'), path = require('path'), vm = require('vm');
const root = path.join(__dirname, '..');
const dir = process.argv[2] ? path.resolve(process.argv[2]) : path.join(root, 'data');
const files = []; (function walk(p) { for (const f of fs.readdirSync(p)) { const q = path.join(p, f); if (fs.statSync(q).isDirectory()) walk(q); else if (q.endsWith('.js')) files.push(q); } })(dir);

const urls = new Map(); // url -> [where]
function collect(o, where) {
  if (Array.isArray(o)) return o.forEach(x => collect(x, where));
  if (o && typeof o === 'object') { for (const [k, v] of Object.entries(o)) { if (k === 'url' && typeof v === 'string' && v) (urls.get(v) || urls.set(v, []).get(v)).push(where); else collect(v, where); } }
  if (typeof o === 'string') for (const m of o.matchAll(/href=\"(https?:[^\"]+)\"/g)) (urls.get(m[1]) || urls.set(m[1], []).get(m[1])).push(where);
}
for (const f of files) {
  const sb = { LAB: { module: (s, m) => collect(m, path.basename(f)), extend: (id, x) => collect(x, 'q/' + path.basename(f)), material: m => collect(m, path.basename(f)), subject: () => { } }, window: {} };
  try { vm.runInNewContext(fs.readFileSync(f, 'utf8'), sb); } catch (e) { console.log('skip', f, e.message); }
}
const UA = { 'user-agent': 'Mozilla/5.0 (link-check for a personal study site)', accept: 'text/html,application/pdf;q=0.9,*/*;q=0.8' };
async function check(u) {
  for (const method of ['HEAD', 'GET']) {
    try {
      const r = await fetch(u, { method, redirect: 'follow', headers: UA, signal: AbortSignal.timeout(20000) });
      if (r.status < 400) return ['OK', r.status];
      if ([401, 403, 429, 999].includes(r.status)) { if (method === 'GET') return ['BLOCKED', r.status]; continue; }
      if (method === 'GET' || ![405, 501].includes(r.status)) { if (method === 'HEAD') continue; return ['BROKEN', r.status]; }
    } catch (e) { if (method === 'GET') return ['BROKEN', e.name === 'TimeoutError' ? 'timeout' : (e.cause && e.cause.code) || e.message]; }
  }
  return ['BROKEN', '?'];
}
(async () => {
  const list = [...urls.keys()], out = { OK: [], BLOCKED: [], BROKEN: [] };
  let i = 0;
  await Promise.all(Array.from({ length: 6 }, async () => { while (i < list.length) { const u = list[i++]; const [s, c] = await check(u); out[s].push([u, c]); } }));
  console.log(`${list.length} unique URLs · OK ${out.OK.length} · BLOCKED ${out.BLOCKED.length} · BROKEN ${out.BROKEN.length}`);
  for (const [u, c] of out.BLOCKED) console.log('  blocked', c, u);
  for (const [u, c] of out.BROKEN) console.log('✗ broken', c, u, '←', [...new Set(urls.get(u))].join(', '));
  process.exit(out.BROKEN.length ? 1 : 0);
})();
