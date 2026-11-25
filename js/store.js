/* Progress store — localStorage with safe fallbacks, export/import. */
(function () {
  const KEY = "quant-study-lab-v1";
  const blank = () => ({
    v: 1, lessons: {}, cards: {}, projects: {}, ideas: {}, stars: {}, days: {}, pos: {},
    answers: {},   // questionId -> {text, rating, date, hints}
    teach: {},     // unitId -> text
    mis: {},       // misconceptionId -> {qid, unit, prompt, text, date}
    preds: {},     // labId -> [{params, guess, actual, note, date}]
    hyps: {},      // hypothesisId -> {a, b, hypothesis, why, test, kill, result, status, date}
    matRead: {},   // materialId -> {sectionId: date}
    quiz: {}       // legacy (retired multiple-choice)
  });
  let mem = null;

  function load() {
    if (mem) return mem;
    let s = null;
    try { s = JSON.parse(localStorage.getItem(KEY) || "null"); } catch (e) { s = null; }
    mem = Object.assign(blank(), s && typeof s === "object" ? s : {});
    const b = blank();
    for (const k of Object.keys(b)) if (typeof mem[k] !== "object" || mem[k] === null) mem[k] = b[k];
    return mem;
  }
  let t = null;
  function save() {
    clearTimeout(t);
    t = setTimeout(() => { try { localStorage.setItem(KEY, JSON.stringify(mem)); } catch (e) { /* storage unavailable: keep in memory */ } }, 150);
  }
  const fmt = d => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  const today = () => fmt(new Date());
  function touch() { load().days[today()] = true; save(); }

  // Leitner boxes: interval in days per box (box 0 = new). Used for flashcards ("<unit>#i"),
  // deep questions ("Q:<id>") and misconceptions ("M:<id>").
  const INTERVALS = [0, 1, 3, 7, 16, 35, 90];
  function schedule(key, box) {
    const s = load(); const c = s.cards[key] || { box: 0 };
    c.box = Math.max(0, Math.min(INTERVALS.length - 1, box));
    const d = new Date(); d.setDate(d.getDate() + INTERVALS[c.box]); c.due = fmt(d);
    c.seen = (c.seen || 0) + 1; s.cards[key] = c; touch(); save(); return c;
  }
  const boxOf = key => (load().cards[key] || {}).box || 0;
  function grade(key, ok) { return schedule(key, ok ? boxOf(key) + 1 : 1); }
  // rating: 0 missed, 1 partial, 2 solid
  function gradeQ(key, rating) { const b = boxOf(key); return schedule(key, rating === 2 ? b + 1 : rating === 1 ? Math.max(1, Math.min(b, 2)) : 1); }
  const isDue = key => { const c = load().cards[key]; return !c || c.due <= today(); };
  const isScheduledDue = key => { const c = load().cards[key]; return !!c && c.due <= today(); };
  const mastered = key => boxOf(key) >= 4;

  function streak() {
    const s = load(); let n = 0; const d = new Date();
    if (!s.days[today()]) d.setDate(d.getDate() - 1);
    while (s.days[fmt(d)]) { n++; d.setDate(d.getDate() - 1); }
    return n;
  }
  const uid = p => (p || "x") + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  function exportJSON() { return JSON.stringify(load(), null, 2); }
  function importJSON(text) {
    const o = JSON.parse(text);
    if (!o || typeof o !== "object" || o.v !== 1) throw new Error("Not a Quant Study Lab backup (v1).");
    mem = Object.assign(blank(), o); save(); return true;
  }
  function reset() { mem = blank(); save(); }

  window.Store = { load, save, touch, grade, gradeQ, schedule, isDue, isScheduledDue, mastered, boxOf, streak, today, uid, exportJSON, importJSON, reset, INTERVALS };
})();
