/* Quant Study Lab — app shell (no build step). */
(function () {
  "use strict";
  const S = { subjects: [], mods: {}, ext: {}, mats: {} };
  window.LAB = {
    subject(o) { S.subjects.push(o); },
    module(sid, m) { m.subject = sid; S.mods[m.id] = m; },
    extend(id, x) { S.ext[id] = x; },
    material(m) { m.isMaterial = true; S.mats[m.id] = m; }
  };

  /* ---------- helpers ---------- */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const main = () => $("#main");
  const pct = x => Math.round(x * 100);
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const subjOf = id => S.subjects.find(s => s.id === id);
  const modsOf = s => s.modules.map(id => S.mods[id]).filter(Boolean);
  const allMods = () => S.subjects.flatMap(modsOf);
  const allMats = () => Object.values(S.mats).sort((a, b) => String(b.addedOn).localeCompare(String(a.addedOn)));
  const allUnits = () => allMods().concat(allMats());
  const unitOf = id => S.mods[id] || S.mats[id];
  const unitHref = (u, tab) => u.isMaterial ? `#/mat/${u.id}/${tab || "overview"}` : `#/m/${u.id}/${tab || "learn"}`;
  const cardKey = (u, i) => u.id + "#" + i;
  const strip = html => { const d = document.createElement("div"); d.innerHTML = html; return (d.textContent || "").replace(/\s+/g, " ").trim(); };
  const TYPE_LABEL = { derive: "Derive", critique: "Critique", counterexample: "Counterexample", predict: "Predict", design: "Design", connect: "Connect", debate: "Debate" };

  function renderMath(node) {
    if (!window.renderMathInElement) return;
    try {
      window.renderMathInElement(node, {
        delimiters: [{ left: "$$", right: "$$", display: true }, { left: "$", right: "$", display: false }],
        throwOnError: false, ignoredTags: ["script", "noscript", "style", "textarea", "pre", "code", "option"]
      });
    } catch (e) { /* leave raw TeX */ }
  }
  function tex(src, display) {
    if (window.katex) { try { return window.katex.renderToString(src, { throwOnError: false, displayMode: !!display }); } catch (e) { } }
    return "<code>" + esc(src) + "</code>";
  }
  function download(name, text, type) {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([text], { type: type || "text/plain" }));
    a.download = name; document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }
  async function copyText(text, btn) {
    let ok = false;
    try { await navigator.clipboard.writeText(text); ok = true; } catch (e) {
      const ta = document.createElement("textarea"); ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0"; document.body.appendChild(ta); ta.select();
      try { ok = document.execCommand("copy"); } catch (e2) { ok = false; } ta.remove();
    }
    if (btn) { const t = btn.textContent; btn.textContent = ok ? "Copied ✓" : "Copy failed — select manually"; setTimeout(() => { btn.textContent = t; }, 1800); }
    return ok;
  }
  const bar = (x, label) => `<div class="bar-track" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct(x)}" aria-label="${esc(label || "progress")}"><span style="width:${pct(x)}%"></span></div>`;
  const srcLine = s => !s ? "" : `<span class="src">${esc(s.relation === "original" ? "Original question" : s.relation)}${s.relation === "original" ? "" : ": "}${s.relation === "original" ? "" : (s.url ? `<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.label)}</a>` : esc(s.label))}</span>`;

  /* ---------- progress ---------- */
  function unitProgress(u) {
    const st = Store.load();
    const Q = (u.questions || []).length, qs = (u.questions || []).filter(q => (st.answers[q.id] || {}).rating === 2).length;
    const C = (u.flashcards || []).length, cm = (u.flashcards || []).filter((_, i) => Store.mastered(cardKey(u, i))).length;
    if (u.isMaterial) {
      const O = u.outline.length, orr = u.outline.filter(o => (st.matRead[u.id] || {})[o.id]).length;
      return { O, orr, Q, qs, C, cm, total: 0.4 * (O ? orr / O : 0) + 0.45 * (Q ? qs / Q : 0) + 0.15 * (C ? cm / C : 0) };
    }
    const L = u.lessons.length, lr = u.lessons.filter(l => st.lessons[l.id]).length;
    const P = u.projects.length, pd = u.projects.filter(p => (st.projects[p.id] || {}).status === "done").length;
    const total = 0.25 * (lr / L) + 0.3 * (Q ? qs / Q : 0) + 0.15 * (C ? cm / C : 0) + 0.3 * (P ? pd / P : 0);
    return { L, lr, Q, qs, C, cm, P, pd, total };
  }
  function dueItems() {
    const st = Store.load(), out = [];
    // unseen flashcards enter review only once the unit has been started (a lesson/section read or a question answered)
    const started = u => u.isMaterial ? Object.keys(st.matRead[u.id] || {}).length > 0 : u.lessons.some(l => st.lessons[l.id]) || (u.questions || []).some(q => st.answers[q.id]);
    allUnits().forEach(u => {
      const on = started(u);
      (u.flashcards || []).forEach((_, i) => { const k = cardKey(u, i); if (on ? Store.isDue(k) : Store.isScheduledDue(k)) out.push({ kind: "card", u, i }); });
      (u.questions || []).forEach(q => { if (Store.isScheduledDue("Q:" + q.id)) out.push({ kind: "q", u, q }); });
    });
    Object.entries(st.mis).forEach(([id, m]) => { if (Store.isScheduledDue("M:" + id)) out.push({ kind: "mis", id, m }); });
    return out;
  }
  function updateDue() { const n = dueItems().length, el = $("#dueCount"); if (el) { el.hidden = !n; el.textContent = n; } }

  /* ---------- home ---------- */
  function viewHome() {
    const st = Store.load(), due = dueItems().length, streak = Store.streak();
    const last = st.pos.last && unitOf(st.pos.last);
    const nMis = Object.keys(st.mis).length, nHyp = Object.keys(st.hyps).length;
    main().innerHTML = `
      <section class="hero">
        <div>
          <p class="eyebrow">Personal study lab</p>
          <h1>Learn it, argue with it,<br>then find the frontier.</h1>
          <p class="lede">Each module runs one loop: <b>lesson → deep questions → prediction lab → teach it back → project → frontier</b>. Your own papers and lecture notes get the same treatment under <a href="#/materials">Materials</a>.</p>
        </div>
        <div class="hero-stats">
          <div class="stat"><span class="num">${streak}</span><span>day streak</span></div>
          <div class="stat"><span class="num">${due}</span><span>due for review</span></div>
          <div class="stat"><span class="num">${nHyp}</span><span>hypotheses</span></div>
          ${due ? `<a class="btn primary" href="#/review">Review ${due} item${due > 1 ? "s" : ""}</a>` : ""}
          ${last ? `<a class="btn" href="${unitHref(last, st.pos.tab)}">Continue: ${esc(last.title)}</a>` : ""}
        </div>
      </section>
      <h2 class="section-h">Subjects</h2>
      <div class="grid subjects">
        ${S.subjects.map(s => {
          const ms = modsOf(s), p = ms.length ? ms.reduce((a, m) => a + unitProgress(m).total, 0) / s.modules.length : 0;
          return `<a class="card subject" href="#/s/${s.id}" style="--sc:${esc(s.color || "var(--accent)")}">
            <span class="glyph" aria-hidden="true">${esc(s.glyph || "•")}</span><h3>${esc(s.title)}</h3><p>${esc(s.blurb)}</p>
            <p class="meta">${ms.length}/${s.modules.length} modules ready · ${pct(p)}% complete</p>${bar(p, s.title + " progress")}</a>`;
        }).join("")}
        <a class="card subject" href="#/materials" style="--sc:var(--hi)"><span class="glyph" aria-hidden="true">✎</span><h3>My Materials</h3>
          <p>Papers and lecture notes you bring yourself, turned into outlines, deep questions and connections by <code>/study-material</code> in Claude Code.</p>
          <p class="meta">${allMats().length} material(s) on this device</p></a>
        <div class="card subject planned"><span class="glyph" aria-hidden="true">+</span><h3>Next subjects</h3>
          <p>Reinforcement learning, convex optimization, GPU / CUDA performance, AI systems &amp; agents — added one at a time in the same format.</p></div>
      </div>
      <div class="grid two">
        <a class="card linkcard" href="#/lab"><h3>Prediction Lab</h3><p>Commit to a number, then run the simulation. Being wrong on record is the point.</p></a>
        <a class="card linkcard" href="#/ideas"><h3>Idea Lab</h3><p>Collide concepts from different modules and turn the good collisions into falsifiable hypotheses.</p></a>
        <a class="card linkcard" href="#/mistakes"><h3>Misconception log</h3><p>${nMis} recorded. Knowing how you go wrong is worth more than knowing what you got right.</p></a>
      </div>`;
  }

  function viewSubject(sid) {
    const s = subjOf(sid); if (!s) return notFound();
    main().innerHTML = `
      <nav class="crumbs"><a href="#/">Home</a><span>›</span><span>${esc(s.title)}</span></nav>
      <header class="page-h" style="--sc:${esc(s.color)}"><span class="glyph big" aria-hidden="true">${esc(s.glyph)}</span>
        <div><h1>${esc(s.title)}</h1><p class="lede">${esc(s.blurb)}</p>${s.roadmap ? `<p class="meta">Roadmap: ${esc(s.roadmap)}</p>` : ""}</div></header>
      <ol class="modules">
        ${s.modules.map((id, i) => {
          const m = S.mods[id];
          if (!m) return `<li class="mod planned"><span class="no">${String(i + 1).padStart(2, "0")}</span><div><h3>${esc((s.planned || {})[id] || id)}</h3><p class="meta">In preparation</p></div></li>`;
          const p = unitProgress(m);
          return `<li class="mod"><span class="no">${String(i + 1).padStart(2, "0")}</span>
            <div class="mod-body"><h3><a href="#/m/${m.id}/learn">${esc(m.title)}</a></h3><p>${esc(m.summary)}</p>
              <div class="chips"><span class="chip">Lessons ${p.lr}/${p.L}</span><span class="chip">Deep Qs solid ${p.qs}/${p.Q}</span><span class="chip">Cards ${p.cm}/${p.C}</span><span class="chip">Projects ${p.pd}/${p.P}</span>${labsFor(m.id).length ? `<span class="chip">Lab ✦</span>` : ""}</div>
              ${bar(p.total, m.title)}</div></li>`;
        }).join("")}
      </ol>`;
  }

  /* ---------- module ---------- */
  const labsFor = id => (window.LABS || []).filter(l => l.module === id);
  function modTabs(m) {
    return [["learn", "Lessons"], ["cheatsheet", "Cheatsheet"], ["questions", "Deep Questions"]]
      .concat(labsFor(m.id).length ? [["lab", "Lab"]] : [])
      .concat([["teach", "Teach it"], ["cards", "Flashcards"], ["projects", "Projects"], ["frontier", "Frontier"]]);
  }
  function viewModule(mid, tab, arg) {
    const m = S.mods[mid]; if (!m) return notFound();
    const s = subjOf(m.subject), TABS = modTabs(m); tab = TABS.some(t => t[0] === tab) ? tab : "learn";
    const st = Store.load(); st.pos.last = mid; st.pos.tab = tab; Store.save();
    const idx = s.modules.indexOf(mid), prev = S.mods[s.modules[idx - 1]], next = S.mods[s.modules[idx + 1]];
    main().innerHTML = `
      <nav class="crumbs"><a href="#/">Home</a><span>›</span><a href="#/s/${s.id}">${esc(s.title)}</a><span>›</span><span>Module ${idx + 1}</span></nav>
      <header class="mod-h"><h1>${esc(m.title)}</h1><p class="lede">${esc(m.summary)}</p>
        <p class="sources"><span class="meta">Read:</span> ${m.sources.map(x => x.url ? `<a href="${esc(x.url)}" target="_blank" rel="noopener">${esc(x.label)}</a>` : `<span>${esc(x.label)}</span>`).join(" · ")}</p></header>
      <nav class="tabs" aria-label="Module sections">${TABS.map(([k, l]) => `<a href="#/m/${mid}/${k}" class="${k === tab ? "on" : ""}"${k === tab ? ' aria-current="page"' : ""}>${l}</a>`).join("")}</nav>
      <section id="pane" class="pane"></section>
      <nav class="pager">${prev ? `<a href="#/m/${prev.id}/learn">← ${esc(prev.title)}</a>` : "<span></span>"}${next ? `<a href="#/m/${next.id}/learn">${esc(next.title)} →</a>` : "<span></span>"}</nav>`;
    const pane = $("#pane");
    ({ learn: paneLearn, cheatsheet: paneCheat, questions: paneQuestions, lab: paneModuleLab, teach: paneTeach, cards: paneCards, projects: paneProjects, frontier: paneFrontier })[tab](pane, m, arg);
  }

  function paneLearn(pane, m, arg) {
    const st = Store.load();
    const i = Math.max(0, Math.min(m.lessons.length - 1, parseInt(arg, 10) || 0)), l = m.lessons[i];
    pane.innerHTML = `
      ${m.lessons.length > 1 ? `<div class="seg" role="group" aria-label="Lessons">${m.lessons.map((x, k) => `<a href="#/m/${m.id}/learn/${k}" class="${k === i ? "on" : ""}">${st.lessons[x.id] ? "✓ " : ""}${k + 1}. ${esc(x.title)}</a>`).join("")}</div>` : ""}
      <div class="lesson-wrap">
        <aside class="toc" aria-label="On this page"><p class="eyebrow">On this page</p><ol id="toc"></ol></aside>
        <article class="prose" id="lesson"><p class="meta">${l.minutes} min read</p><h2>${esc(l.title)}</h2>${l.html}</article>
      </div>
      <div class="lesson-foot">
        <button class="btn ${st.lessons[l.id] ? "" : "primary"}" id="markRead" type="button">${st.lessons[l.id] ? "✓ Read — mark unread" : "Mark as read"}</button>
        ${i < m.lessons.length - 1 ? `<a class="btn" href="#/m/${m.id}/learn/${i + 1}">Next lesson →</a>` : `<a class="btn" href="#/m/${m.id}/questions">Deep questions →</a>`}
      </div>`;
    const art = $("#lesson"), hs = $$("h3", art);
    $("#toc").innerHTML = hs.map((h, k) => { h.id = "s" + k; return `<li><a href="#s${k}" data-anchor="s${k}">${esc(h.textContent)}</a></li>`; }).join("");
    if (!hs.length) $(".toc").hidden = true;
    $("#toc").addEventListener("click", e => { const a = e.target.closest("a[data-anchor]"); if (!a) return; e.preventDefault(); document.getElementById(a.dataset.anchor).scrollIntoView({ behavior: "smooth", block: "start" }); });
    renderMath(art); renderMath($("#toc"));
    $("#markRead").addEventListener("click", () => { const s = Store.load(); if (s.lessons[l.id]) delete s.lessons[l.id]; else { s.lessons[l.id] = Store.today(); Store.touch(); } Store.save(); paneLearn(pane, m, i); });
  }

  function paneCheat(pane, m) {
    pane.innerHTML = `<div class="pane-h"><p class="meta">${m.cheatsheet.length} entries</p><button class="btn small" type="button" id="print">Print</button></div>
      <div class="cheat">${m.cheatsheet.map(c => `<div class="cheat-item"><h4>${esc(c.term)}</h4>${c.formula ? `<div class="formula">${tex(c.formula, true)}</div>` : ""}${c.note ? `<p>${esc(c.note)}</p>` : ""}</div>`).join("")}</div>`;
    renderMath(pane);
    $("#print").addEventListener("click", () => window.print());
  }

  /* ---------- deep questions (modules and materials) ---------- */
  function socraticPrompt(u, q) {
    const base = `${strip(q.prompt)}`;
    if (q.type === "debate") {
      const sides = (q.sides || []).map((s, i) => `Side ${String.fromCharCode(65 + i)}: ${s.position}`).join("\n");
      return `Context: I am an equity quant researcher studying "${u.title}". Here is a published debate:\n${base}\n${sides}\n\nTake whichever side I do NOT pick and argue it as strongly as the literature allows. I will state my side first. Push back on weak arguments, cite the strongest evidence for your side, and never concede just to be agreeable. After 6 exchanges, summarise where each side is strongest.`;
    }
    return `/socratic-tutor quiz me on this question from "${u.title}" — do not give me the answer; ask one probing question at a time and make me derive it:\n\n${base}${u.file ? `\n\n(Source material on my disk: ${u.file})` : ""}`;
  }
  function paneQuestions(pane, u, arg) {
    const all = u.questions || [];
    if (!all.length) { pane.innerHTML = `<div class="done-box"><h3>Deep questions are being written</h3><p>This module's question set is not available yet.</p></div>`; return; }
    const st = Store.load(), f = paneQuestions.filter = paneQuestions.filter || { type: "", diff: 0 };
    const list = all.filter(q => (!f.type || q.type === f.type) && (!f.diff || q.difficulty === f.diff));
    let i = Math.max(0, Math.min(list.length - 1, parseInt(arg, 10) || 0));
    const types = [...new Set(all.map(q => q.type))];
    const draw = () => {
      const q = list[i], a = st.answers[q.id] || {}, shown = a.hints || 0;
      const rate = ["Missed", "Partial", "Solid"];
      pane.innerHTML = `
        <div class="pane-h qfilter">
          <div class="seg small">${["", ...types].map(t => `<button type="button" data-ft="${t}" class="${f.type === t ? "on" : ""}">${t ? TYPE_LABEL[t] : "All types"}</button>`).join("")}</div>
          <div class="seg small">${[0, 1, 2, 3].map(d => `<button type="button" data-fd="${d}" class="${f.diff === d ? "on" : ""}">${d ? "●".repeat(d) : "Any level"}</button>`).join("")}</div>
        </div>
        ${!list.length ? `<p class="meta">No question matches this filter.</p>` : `
        <div class="qnav">${list.map((x, k) => { const r = (st.answers[x.id] || {}).rating; return `<button type="button" data-go="${k}" class="dot${k === i ? " on" : ""}${r === 2 ? " solid" : r === 1 ? " partial" : r === 0 ? " missed" : ""}" aria-label="Question ${k + 1}">${k + 1}</button>`; }).join("")}</div>
        <article class="dq">
          <header><span class="badge t-${q.type}">${TYPE_LABEL[q.type]}</span><span class="diff" title="Difficulty">${"●".repeat(q.difficulty)}${"○".repeat(3 - q.difficulty)}</span>${srcLine(q.source)}</header>
          <div class="dq-prompt">${q.prompt}</div>
          ${q.type === "debate" ? `<div class="sides">${(q.sides || []).map((s, k) => `<div class="side"><h4>Side ${String.fromCharCode(65 + k)}</h4><p>${s.position}</p><ul class="refs">${s.refs.map(r => `<li>${r.url ? `<a href="${esc(r.url)}" target="_blank" rel="noopener">${esc(r.label)}</a>` : esc(r.label)}</li>`).join("")}</ul></div>`).join("")}</div>` : ""}
          <p class="why-m"><b>Why it matters.</b> ${q.whyItMatters}</p>
          <label class="notes">Your answer (saved on this device)<textarea id="ans" rows="7" placeholder="Think first. Write the argument, derivation or design before opening hints.">${esc(a.text || "")}</textarea></label>
          <div class="hints">${q.hints.slice(0, shown).map((h, k) => `<div class="hint"><b>Hint ${k + 1}.</b> ${h}</div>`).join("")}</div>
          <div class="row">
            ${shown < q.hints.length ? `<button class="btn" type="button" id="hint">Hint ${shown + 1} of ${q.hints.length}</button>` : ""}
            <button class="btn primary" type="button" id="reveal">Compare with key points</button>
            <button class="btn" type="button" id="socratic">${q.type === "debate" ? "Debate it with Claude" : "Ask Socratically"} (copy prompt)</button>
          </div>
          <div id="kp" ${a.revealed ? "" : "hidden"}>
            <h4>A strong answer covers</h4><ul class="kp">${q.keyPoints.map(x => `<li>${x}</li>`).join("")}</ul>
            <h4>Keep going</h4><ul>${q.followUps.map(x => `<li>${x}</li>`).join("")}</ul>
            <div class="rate"><span class="meta">How did you do?</span>${rate.map((r, k) => `<button type="button" class="btn ${k === 2 ? "good" : k === 0 ? "bad" : ""}${a.rating === k ? " picked" : ""}" data-rate="${k}">${r}</button>`).join("")}</div>
            <div id="misBox" hidden><label class="notes">Where did my thinking go wrong? (goes to the misconception log)<textarea id="misText" rows="3" placeholder="e.g. I assumed the paths were independent, but they share training folds…"></textarea></label><button class="btn" type="button" id="misSave">Save to misconception log</button></div>
          </div>
        </article>
        <div class="pager inner">${i > 0 ? `<button class="btn small" data-go="${i - 1}" type="button">← Previous</button>` : "<span></span>"}${i < list.length - 1 ? `<button class="btn small" data-go="${i + 1}" type="button">Next →</button>` : "<span></span>"}</div>`}`;
      renderMath(pane);
      if (!list.length) return;
      const save = () => { st.answers[q.id] = a; Store.save(); };
      $("#ans").addEventListener("input", e => { a.text = e.target.value; a.date = Store.today(); save(); });
      const hb = $("#hint"); if (hb) hb.addEventListener("click", () => { a.hints = shown + 1; save(); draw(); });
      $("#reveal").addEventListener("click", () => { a.revealed = true; save(); $("#kp").hidden = false; renderMath($("#kp")); $("#kp").scrollIntoView({ behavior: "smooth", block: "nearest" }); });
      $("#socratic").addEventListener("click", e => copyText(socraticPrompt(u, q), e.currentTarget));
      $$("[data-rate]", pane).forEach(b => b.addEventListener("click", () => {
        const r = +b.dataset.rate; a.rating = r; a.ratedOn = Store.today(); save(); Store.gradeQ("Q:" + q.id, r); updateDue();
        $$("[data-rate]", pane).forEach(x => x.classList.toggle("picked", x === b));
        $("#misBox").hidden = r === 2; if (r < 2) $("#misText").focus();
        $$(".dot", pane)[i].className = "dot on " + ["missed", "partial", "solid"][r];
      }));
      $("#misSave").addEventListener("click", () => {
        const t = $("#misText").value.trim(); if (!t) { $("#misText").focus(); return; }
        const id = Store.uid("m"); st.mis[id] = { qid: q.id, unit: u.id, prompt: strip(q.prompt).slice(0, 300), text: t, date: Store.today() }; Store.save(); Store.schedule("M:" + id, 1);
        $("#misBox").innerHTML = `<p class="meta">Saved to the <a href="#/mistakes">misconception log</a> — it will come back in review.</p>`;
      });
    };
    pane.onclick = e => {
      const ft = e.target.closest("[data-ft]"), fd = e.target.closest("[data-fd]"), go = e.target.closest("[data-go]");
      if (ft) { f.type = ft.dataset.ft; paneQuestions(pane, u, 0); }
      else if (fd) { f.diff = +fd.dataset.fd; paneQuestions(pane, u, 0); }
      else if (go) { i = +go.dataset.go; draw(); pane.scrollIntoView({ behavior: "smooth", block: "start" }); }
    };
    draw();
  }

  /* ---------- teach it back ---------- */
  function paneTeach(pane, u) {
    const st = Store.load(), text = st.teach[u.id] || "";
    const ideas = u.isMaterial ? u.outline.map(o => o.title) : (u.lessons.flatMap(l => (l.html.match(/<h3[^>]*>(.*?)<\/h3>/g) || []).map(h => strip(h))).concat(u.cheatsheet.map(c => c.term)));
    pane.innerHTML = `
      <p class="lede">Explain <b>${esc(u.title)}</b> to a junior quant researcher in about 300 words, without looking at the lesson. Gaps you cannot explain are gaps you do not understand yet.</p>
      <label class="notes big">Your explanation<textarea id="teach" rows="12" placeholder="Start from the problem it solves, then the mechanism, then when it breaks.">${esc(text)}</textarea></label>
      <p class="meta" id="wc"></p>
      <div class="row"><button class="btn primary" type="button" id="review">Ask Claude to find the gaps (copy prompt)</button><button class="btn" type="button" id="check">Show the idea checklist</button></div>
      <div id="checklist" hidden><h4>Did you cover…</h4><ul class="checks">${ideas.map(x => `<li>${esc(x)}</li>`).join("")}</ul></div>`;
    const wc = () => { const n = ($("#teach").value.trim().match(/\S+/g) || []).length; $("#wc").textContent = n + " words"; };
    wc();
    $("#teach").addEventListener("input", e => { st.teach[u.id] = e.target.value; Store.save(); wc(); });
    $("#check").addEventListener("click", () => { $("#checklist").hidden = false; });
    $("#review").addEventListener("click", e => copyText(`You are a demanding senior quant researcher reviewing a junior colleague's understanding.\nTopic: "${u.title}".\nKey ideas the explanation should cover: ${ideas.join("; ")}.\n\nHere is my explanation:\n"""\n${$("#teach").value}\n"""\n\n1) List every statement that is wrong or imprecise, and why.\n2) List important ideas that are missing.\n3) Ask me three probing questions that would expose whether I really understand it. Do not give the answers.`, e.currentTarget));
  }

  /* ---------- flashcards and review sessions ---------- */
  function session(pane, items, opts) {
    let k = 0, right = 0;
    const draw = () => {
      if (k >= items.length) {
        pane.innerHTML = `<div class="done-box"><h3>${items.length ? "Session complete" : "Nothing due"}</h3><p>${items.length ? `${right}/${items.length} recalled or solid.` : "Everything here is scheduled for later."} Intervals grow 1 → 3 → 7 → 16 → 35 → 90 days.</p>${opts.after || ""}</div>`;
        updateDue(); return;
      }
      const it = items[k], head = `<p class="meta">${k + 1} / ${items.length}${opts.label && it.u ? " · " + esc(it.u.title) : ""}</p>`;
      if (it.kind === "card") {
        const c = it.u.flashcards[it.i];
        pane.innerHTML = `<div class="flash">${head}<div class="fcard"><div class="fq">${c.q}</div><div class="fa" hidden>${c.a}</div></div>
          <div class="fbtns"><button class="btn primary" data-act="show" type="button">Show answer <kbd>Space</kbd></button>
          <button class="btn bad" data-act="no" type="button" hidden>Forgot <kbd>1</kbd></button><button class="btn good" data-act="yes" type="button" hidden>Knew it <kbd>2</kbd></button></div></div>`;
      } else if (it.kind === "q") {
        const a = Store.load().answers[it.q.id] || {};
        pane.innerHTML = `<div class="flash">${head}<div class="fcard"><span class="badge t-${it.q.type}">${TYPE_LABEL[it.q.type]}</span><div class="fq">${it.q.prompt}</div>
          <div class="fa" hidden><h4>Key points</h4><ul class="kp">${it.q.keyPoints.map(x => `<li>${x}</li>`).join("")}</ul>${a.text ? `<h4>Your earlier answer</h4><div class="idea-note">${esc(a.text).replace(/\n/g, "<br>")}</div>` : ""}</div></div>
          <div class="fbtns"><button class="btn primary" data-act="show" type="button">Think, then show key points <kbd>Space</kbd></button>
          <button class="btn bad" data-act="no" type="button" hidden>Missed <kbd>1</kbd></button><button class="btn" data-act="mid" type="button" hidden>Partial</button><button class="btn good" data-act="yes" type="button" hidden>Solid <kbd>2</kbd></button></div></div>`;
      } else {
        pane.innerHTML = `<div class="flash">${head}<div class="fcard"><span class="badge stretch">Misconception</span><div class="fq">${esc(it.m.prompt)}</div>
          <div class="fa" hidden><h4>What I got wrong before</h4><p>${esc(it.m.text)}</p></div></div>
          <div class="fbtns"><button class="btn primary" data-act="show" type="button">Recall the trap, then show <kbd>Space</kbd></button>
          <button class="btn bad" data-act="no" type="button" hidden>Still shaky <kbd>1</kbd></button><button class="btn good" data-act="yes" type="button" hidden>Clear now <kbd>2</kbd></button></div></div>`;
      }
      renderMath(pane);
      const show = () => { $(".fa", pane).hidden = false; $$("[data-act]", pane).forEach(b => { b.hidden = b.dataset.act === "show"; }); const y = $('[data-act="yes"]', pane); if (y) y.focus(); };
      const grade = act => {
        const ok = act === "yes";
        if (it.kind === "card") Store.grade(cardKey(it.u, it.i), ok);
        else if (it.kind === "q") { const r = act === "yes" ? 2 : act === "mid" ? 1 : 0; Store.gradeQ("Q:" + it.q.id, r); const s = Store.load(); s.answers[it.q.id] = Object.assign(s.answers[it.q.id] || {}, { rating: r, ratedOn: Store.today() }); Store.save(); }
        else Store.grade("M:" + it.id, ok);
        if (ok) right++; k++; draw();
      };
      $$("[data-act]", pane).forEach(b => b.addEventListener("click", () => b.dataset.act === "show" ? show() : grade(b.dataset.act)));
      const sb = $('[data-act="show"]', pane); if (sb) sb.focus();
    };
    session.key = e => {
      if (!document.body.contains(pane) || /INPUT|TEXTAREA|SELECT/.test((e.target || {}).tagName || "")) return;
      const btn = a => { const b = $(`[data-act="${a}"]`, pane); return b && !b.hidden ? b : null; };
      if ((e.key === " " || e.key === "Enter") && btn("show")) { e.preventDefault(); btn("show").click(); }
      else if (e.key === "1" && btn("no")) btn("no").click();
      else if (e.key === "2" && btn("yes")) btn("yes").click();
    };
    draw();
  }
  function paneCards(pane, u, arg) {
    const all = (u.flashcards || []).map((_, i) => ({ kind: "card", u, i }));
    const due = all.filter(it => Store.isDue(cardKey(u, it.i)));
    pane.innerHTML = `<div class="pane-h"><p class="meta">Flashcards are for definitions and formulas only — understanding lives in Deep Questions. ${due.length} due · ${all.length} total.</p>
      ${arg === "all" ? `<a class="btn small" href="${unitHref(u, "cards")}">Due only</a>` : `<a class="btn small" href="${unitHref(u, "cards")}/all">Practise all ${all.length}</a>`}</div><div id="sess"></div>`;
    session($("#sess"), shuffle(arg === "all" ? all : due), { after: `<a class="btn" href="${unitHref(u, "questions")}">Deep questions →</a>` });
  }
  function viewReview() {
    const items = shuffle(dueItems()).slice(0, 40), n = { card: 0, q: 0, mis: 0 }; items.forEach(x => n[x.kind]++);
    main().innerHTML = `<header class="mod-h"><h1>Mixed review</h1><p class="lede">Interleaved across every module and material: ${n.q} deep question(s), ${n.mis} misconception(s), ${n.card} flashcard(s). Mixing topics forces you to recognise which idea applies, not just recall it.</p></header><section class="pane" id="pane"></section>`;
    session($("#pane"), items, { label: true, after: `<a class="btn" href="#/mistakes">Misconception log</a> <a class="btn" href="#/">Home</a>` });
  }

  /* ---------- prediction lab ---------- */
  function labCard(host, lab) {
    const st = Store.load(), hist = st.preds[lab.id] = st.preds[lab.id] || [];
    const p = {}; lab.params.forEach(x => { p[x.k] = x.value; });
    host.innerHTML = `<article class="lab">
      <h3>${esc(lab.title)}</h3><p>${lab.question}</p>
      <div class="params">${lab.params.map(x => `<label><span>${esc(x.label)}: <b data-v="${x.k}">${x.value}</b></span><input type="range" min="${x.min}" max="${x.max}" step="${x.step}" value="${x.value}" data-p="${x.k}"></label>`).join("")}</div>
      <div class="row guess"><label class="notes">${esc(lab.guessLabel)}<input type="number" step="any" id="guess" inputmode="decimal" required></label>
        <button class="btn primary" type="button" id="run" disabled>Run simulation</button></div>
      <p class="meta" id="gate">Commit to a prediction first — the run button unlocks once you do.</p>
      <div id="out" hidden><div id="chart"></div><p id="verdict" class="verdict"></p><p class="meta" id="detail"></p>
        <label class="notes">Why was my prediction off (or right)?<textarea id="why" rows="2"></textarea></label></div>
      ${hist.length ? `<details class="hist"><summary>Your past predictions (${hist.length})</summary><div class="tbl"><table><thead><tr><th>Date</th><th>Params</th><th>Guess</th><th>Actual</th><th>Note</th></tr></thead><tbody>${hist.slice(-12).reverse().map(h => `<tr><td>${h.date}</td><td>${esc(Object.entries(h.params).map(([k, v]) => k + "=" + v).join(", "))}</td><td>${(+h.guess).toFixed(2)}</td><td>${(+h.actual).toFixed(2)}</td><td>${esc(h.note || "")}</td></tr>`).join("")}</tbody></table></div></details>` : ""}
    </article>`;
    const g = $("#guess", host), run = $("#run", host);
    const lock = () => { run.disabled = !(g.value !== "" && isFinite(+g.value)); $("#gate", host).hidden = !run.disabled; };
    g.addEventListener("input", lock);
    $$("[data-p]", host).forEach(r => r.addEventListener("input", () => { p[r.dataset.p] = +r.value; $(`[data-v="${r.dataset.p}"]`, host).textContent = r.value; g.value = ""; lock(); $("#out", host).hidden = true; }));
    let rec = null;
    run.addEventListener("click", () => {
      run.disabled = true; run.textContent = "Running…";
      setTimeout(() => {
        const res = lab.run(Object.assign({}, p)), guess = +g.value, err = res.actual ? (guess - res.actual) / Math.abs(res.actual) : 0;
        $("#out", host).hidden = false; $("#chart", host).innerHTML = res.chart; $("#detail", host).textContent = res.detail;
        $("#verdict", host).innerHTML = `You predicted <b>${guess.toFixed(2)}</b>; the simulation gave <b>${res.actual.toFixed(2)}</b> (${err >= 0 ? "+" : ""}${(100 * err).toFixed(0)}%). ${Math.abs(err) < 0.1 ? "Well calibrated." : Math.abs(err) < 0.3 ? "In the neighbourhood — what did you under- or over-weight?" : "Far off — this is exactly where intuition needs repair."}`;
        rec = { params: Object.assign({}, p), guess, actual: res.actual, note: "", date: Store.today() }; hist.push(rec); Store.touch(); Store.save();
        run.textContent = "Run simulation"; g.value = ""; lock();
      }, 30);
    });
    $("#why", host).addEventListener("input", e => { if (rec) { rec.note = e.target.value; Store.save(); } });
  }
  function paneModuleLab(pane, m) { pane.innerHTML = labsFor(m.id).map((_, i) => `<div data-lab="${i}"></div>`).join(""); labsFor(m.id).forEach((lab, i) => labCard($(`[data-lab="${i}"]`, pane), lab)); }
  function viewLab(id) {
    const labs = window.LABS || [], lab = labs.find(l => l.id === id);
    if (lab) {
      const m = S.mods[lab.module];
      main().innerHTML = `<nav class="crumbs"><a href="#/">Home</a><span>›</span><a href="#/lab">Prediction Lab</a></nav>${m ? `<p class="meta">From module: <a href="#/m/${m.id}/learn">${esc(m.title)}</a></p>` : ""}<div id="labhost"></div>`;
      labCard($("#labhost"), lab); return;
    }
    const st = Store.load();
    main().innerHTML = `<header class="mod-h"><h1>Prediction Lab</h1><p class="lede">Each experiment asks for your number before it runs. Errors are recorded so you can see where your intuition is systematically biased.</p></header>
      <div class="grid">${labs.map(l => { const h = st.preds[l.id] || [], m = S.mods[l.module]; const mae = h.length ? h.reduce((a, x) => a + Math.abs(x.guess - x.actual) / Math.max(1e-9, Math.abs(x.actual)), 0) / h.length : null;
        return `<a class="card linkcard" href="#/lab/${l.id}"><h3>${esc(l.title)}</h3><p class="meta">${m ? esc(m.title) : ""}</p><p class="meta">${h.length} prediction(s)${mae != null ? ` · mean error ${(100 * mae).toFixed(0)}%` : ""}</p></a>`; }).join("")}</div>`;
  }

  /* ---------- projects ---------- */
  function paneProjects(pane, m) {
    const st = Store.load(), order = { core: 0, stretch: 1, replication: 2 };
    const ps = m.projects.slice().sort((a, b) => order[a.level] - order[b.level]);
    pane.innerHTML = `<p class="note">Use public or personally licensed data and your own code only — never employer data, code or signals.</p>` + ps.map(p => {
      const s = st.projects[p.id] || {}, checks = s.checks || {};
      return `<article class="project" data-p="${esc(p.id)}">
        <header><span class="badge ${p.level}">${p.level}</span><h3>${esc(p.title)}</h3><span class="meta">${esc(p.hours)} h</span>
          <label class="status">Status <select data-k="status">${[["todo", "Not started"], ["doing", "In progress"], ["done", "Done"]].map(([v, l]) => `<option value="${v}"${(s.status || "todo") === v ? " selected" : ""}>${l}</option>`).join("")}</select></label></header>
        ${p.paper ? `<p class="meta">Replicates: ${p.paper.url ? `<a href="${esc(p.paper.url)}" target="_blank" rel="noopener">${esc(p.paper.label)}</a>` : esc(p.paper.label)}</p>` : ""}
        <p>${p.goal}</p>
        <h4>Data</h4><p>${p.data}</p>
        <h4>Steps</h4><ol>${p.steps.map(x => `<li>${x}</li>`).join("")}</ol>
        <h4>Deliverables</h4><ul>${p.deliverables.map(x => `<li>${x}</li>`).join("")}</ul>
        <h4>Acceptance checks</h4><ul class="checks">${p.acceptance.map((x, i) => `<li><label><input type="checkbox" data-c="${i}"${checks[i] ? " checked" : ""}> <span>${x}</span></label></li>`).join("")}</ul>
        ${p.extensions && p.extensions.length ? `<h4>Extensions</h4><ul>${p.extensions.map(x => `<li>${x}</li>`).join("")}</ul>` : ""}
        <label class="notes">Notes, links to your repo, results<textarea data-k="notes" rows="4">${esc(s.notes || "")}</textarea></label>
      </article>`;
    }).join("");
    renderMath(pane);
    const get = el => { const id = el.closest(".project").dataset.p, s = Store.load(); return (s.projects[id] = s.projects[id] || {}); };
    pane.addEventListener("change", e => { const t = e.target, p = get(t); if (t.dataset.k === "status") { p.status = t.value; Store.touch(); } if (t.dataset.c != null) { p.checks = p.checks || {}; p.checks[t.dataset.c] = t.checked; } Store.save(); });
    pane.addEventListener("input", e => { const t = e.target; if (t.dataset.k === "notes") { get(t).notes = t.value; Store.save(); } });
  }

  /* ---------- frontier ---------- */
  function monthsSince(asOf) { const [y, mo] = String(asOf).split("-").map(Number); if (!y) return 0; const d = new Date(); return (d.getFullYear() - y) * 12 + (d.getMonth() + 1 - (mo || 1)); }
  function paneFrontier(pane, m) {
    const f = m.frontier, st = Store.load(), age = monthsSince(f.asOf);
    pane.innerHTML = `
      <div class="pane-h"><p class="meta">Snapshot as of ${esc(f.asOf)}</p>${age >= 6 ? `<span class="warn-pill">${age} months old — check new work in your weekly feed</span>` : ""}</div>
      <p class="lede">${f.summary}</p>
      <h3 class="section-h">Active threads</h3>
      <div class="threads">${f.threads.map((t, i) => { const key = m.id + "#" + i; return `<article class="thread">
        <button type="button" class="star${st.stars[key] ? " on" : ""}" data-star="${esc(key)}" aria-pressed="${!!st.stars[key]}" title="Star to collect in the Idea Lab">${st.stars[key] ? "★" : "☆"}</button>
        <h4>${esc(t.title)}</h4><p>${t.why}</p>
        ${t.refs.length ? `<ul class="refs">${t.refs.map(r => `<li>${r.url ? `<a href="${esc(r.url)}" target="_blank" rel="noopener">${esc(r.label)}</a>` : esc(r.label)}</li>`).join("")}</ul>` : ""}</article>`; }).join("")}</div>
      <div class="grid two">
        <div class="card"><h3>Open questions</h3><ul>${f.openQuestions.map(x => `<li>${x}</li>`).join("")}</ul></div>
        <div class="card"><h3>Brainstorm prompts</h3><ul>${f.brainstorm.map(x => `<li>${x}</li>`).join("")}</ul></div>
      </div>
      <label class="notes big">My deep-dive notes for this module (collected in the Idea Lab)<textarea id="ideaBox" rows="6" placeholder="Which thread would you test on your own data? What would falsify it?">${esc(st.ideas[m.id] || "")}</textarea></label>
      <div class="row"><a class="btn" href="#/ideas">Turn an idea into a hypothesis →</a></div>`;
    renderMath(pane);
    pane.addEventListener("click", e => {
      const b = e.target.closest("[data-star]"); if (!b) return;
      const s = Store.load(), k = b.dataset.star; if (s.stars[k]) delete s.stars[k]; else s.stars[k] = Store.today(); Store.save();
      b.classList.toggle("on", !!s.stars[k]); b.textContent = s.stars[k] ? "★" : "☆"; b.setAttribute("aria-pressed", !!s.stars[k]);
    });
    $("#ideaBox").addEventListener("input", e => { const s = Store.load(); s.ideas[m.id] = e.target.value; Store.save(); });
  }

  /* ---------- idea lab ---------- */
  function conceptPool() {
    const pool = [];
    allMods().forEach(m => { m.cheatsheet.forEach(c => pool.push({ t: c.term, u: m })); m.frontier.threads.forEach(t => pool.push({ t: t.title, u: m })); });
    allMats().forEach(m => { m.outline.forEach(o => (o.keyIdeas || []).slice(0, 2).forEach(k => pool.push({ t: strip(k).slice(0, 90), u: m }))); });
    return pool;
  }
  const COLLIDE = [
    "What if the method behind A were applied to the problem behind B?",
    "Does B break an assumption that A silently relies on? How would you test it?",
    "Is there a quantity that both A and B are secretly estimating?",
    "If A were the solution, what would B's failure mode look like in a backtest?",
    "Which one would an equity book feel first in live P&L — and why?"
  ];
  const HFIELDS = [["hypothesis", "Hypothesis (one falsifiable sentence)"], ["why", "Why it might be true (mechanism)"], ["dataset", "Dataset (public / personal only)"], ["test", "Quickest test that could kill it"], ["kill", "Kill criterion (decided before testing)"], ["result", "Result"]];
  function viewIdeas() {
    const st = Store.load(), pool = conceptPool();
    const starred = allMods().flatMap(m => m.frontier.threads.map((t, i) => ({ m, t, i })).filter(x => st.stars[x.m.id + "#" + x.i]));
    const notes = allUnits().filter(u => (st.ideas[u.id] || "").trim());
    const solid = allUnits().flatMap(u => (u.questions || []).filter(q => (st.answers[q.id] || {}).rating === 2).map(q => ({ u, q })));
    const hyps = Object.entries(st.hyps).sort((a, b) => String(b[1].date).localeCompare(String(a[1].date)));
    main().innerHTML = `<header class="mod-h"><h1>Idea Lab</h1><p class="lede">Creativity is mostly recombination. Collide two concepts from different modules, keep the collisions that survive a minute of thought, and write them as hypotheses with a kill criterion.</p></header>
      <section class="card collide"><div class="pane-h"><h3>Concept collision</h3><button class="btn primary" type="button" id="spin">Collide two concepts</button></div><div id="pair"><p class="meta">${pool.length} concepts available from ${allUnits().length} modules/materials.</p></div></section>
      <h2 class="section-h">Hypothesis cards <span class="meta">(${hyps.length})</span></h2>
      <div class="row"><button class="btn" type="button" id="newH">+ New hypothesis</button>${hyps.length ? `<button class="btn" type="button" id="mdH">Export for research ledger (Markdown)</button>` : ""}</div>
      <div id="hyps">${hyps.map(([id, h]) => hypCard(id, h)).join("") || `<p class="meta">None yet.</p>`}</div>
      <h2 class="section-h">Collected from modules</h2>
      <div class="grid two">
        <div class="card"><h3>Starred frontier threads</h3>${starred.length ? `<ul>${starred.map(x => `<li><a href="#/m/${x.m.id}/frontier">${esc(x.t.title)}</a> <span class="meta">· ${esc(x.m.title)}</span></li>`).join("")}</ul>` : `<p class="meta">Star threads in any Frontier tab.</p>`}</div>
        <div class="card"><h3>Follow-ups from questions you answered solidly</h3>${solid.length ? `<ul>${solid.flatMap(x => x.q.followUps.slice(0, 1).map(f => `<li>${f} <span class="meta">· ${esc(x.u.title)}</span></li>`)).join("")}</ul>` : `<p class="meta">Rate a deep question "Solid" and its follow-up appears here.</p>`}</div>
      </div>
      ${notes.length ? `<h2 class="section-h">Deep-dive notes</h2>${notes.map(u => `<article class="card idea"><h3><a href="${unitHref(u, u.isMaterial ? "notes" : "frontier")}">${esc(u.title)}</a></h3><div class="idea-note">${esc(st.ideas[u.id]).replace(/\n/g, "<br>")}</div></article>`).join("")}` : ""}
      <div class="row"><button class="btn small" type="button" id="mdAll">Export everything as Markdown</button></div>`;
    renderMath(main());
    $("#spin").addEventListener("click", () => {
      if (pool.length < 2) return;
      let a, b, guard = 0; do { a = pool[Math.floor(Math.random() * pool.length)]; b = pool[Math.floor(Math.random() * pool.length)]; } while ((a.u === b.u) && guard++ < 50);
      const prompts = shuffle(COLLIDE).slice(0, 3);
      $("#pair").innerHTML = `<div class="pair"><div class="pc"><span class="meta">${esc(a.u.title)}</span><b>A · ${esc(a.t)}</b></div><span class="x" aria-hidden="true">×</span><div class="pc"><span class="meta">${esc(b.u.title)}</span><b>B · ${esc(b.t)}</b></div></div>
        <ul>${prompts.map(p => `<li>${p}</li>`).join("")}</ul><button class="btn" type="button" id="toH">Make this a hypothesis card</button>`;
      $("#toH").addEventListener("click", () => { const id = Store.uid("h"); st.hyps[id] = { a: a.t, b: b.t, status: "idea", date: Store.today() }; Store.save(); viewIdeas(); setTimeout(() => { const el = document.querySelector(`[data-h="${id}"] textarea`); if (el) el.focus(); }, 50); });
    });
    $("#newH").addEventListener("click", () => { const id = Store.uid("h"); st.hyps[id] = { status: "idea", date: Store.today() }; Store.save(); viewIdeas(); });
    const hostH = $("#hyps");
    hostH.addEventListener("input", e => { const c = e.target.closest("[data-h]"); if (!c) return; const h = st.hyps[c.dataset.h]; h[e.target.dataset.f] = e.target.value; Store.save(); });
    hostH.addEventListener("change", e => { const c = e.target.closest("[data-h]"); if (!c || e.target.dataset.f !== "status") return; st.hyps[c.dataset.h].status = e.target.value; Store.save(); c.dataset.status = e.target.value; });
    hostH.addEventListener("click", e => { const d = e.target.closest("[data-del]"); if (!d) return; if (confirm("Delete this hypothesis card?")) { delete st.hyps[d.dataset.del]; Store.save(); viewIdeas(); } });
    const mdH = () => "| Date | Hypothesis | Dataset | Quick test | Kill criterion | Result | Status |\n|---|---|---|---|---|---|---|\n" + Object.values(st.hyps).map(h => `| ${h.date || ""} | ${[h.hypothesis, h.a && h.b ? `(${h.a} × ${h.b})` : ""].filter(Boolean).join(" ").replace(/\|/g, "/").replace(/\n/g, " ")} | ${(h.dataset || "").replace(/\n/g, " ")} | ${(h.test || "").replace(/\n/g, " ")} | ${(h.kill || "").replace(/\n/g, " ")} | ${(h.result || "").replace(/\n/g, " ")} | ${h.status} |`).join("\n") + "\n";
    const b1 = $("#mdH"); if (b1) b1.addEventListener("click", () => download("hypotheses-" + Store.today() + ".md", "# Hypotheses — " + Store.today() + "\n\n" + mdH(), "text/markdown"));
    $("#mdAll").addEventListener("click", () => {
      const md = `# Idea Lab — ${Store.today()}\n\n## Hypotheses\n\n${mdH()}\n## Starred threads\n\n${starred.map(x => `- ${x.t.title} (${x.m.title})`).join("\n")}\n\n## Notes\n\n${notes.map(u => `### ${u.title}\n\n${st.ideas[u.id]}\n`).join("\n")}`;
      download("ideas-" + Store.today() + ".md", md, "text/markdown");
    });
  }
  function hypCard(id, h) {
    return `<article class="hyp" data-h="${id}" data-status="${h.status}">
      <header>${h.a ? `<span class="meta">${esc(h.a)} × ${esc(h.b)}</span>` : `<span class="meta">Created ${h.date}</span>`}
        <select data-f="status" aria-label="Status">${["idea", "testing", "killed", "promoted"].map(s => `<option${h.status === s ? " selected" : ""}>${s}</option>`).join("")}</select>
        <button type="button" class="icon-btn small" data-del="${id}" aria-label="Delete">✕</button></header>
      <div class="hgrid">${HFIELDS.map(([k, l]) => `<label class="notes">${l}<textarea data-f="${k}" rows="2">${esc(h[k] || "")}</textarea></label>`).join("")}</div></article>`;
  }

  /* ---------- misconception log ---------- */
  function viewMistakes() {
    const st = Store.load(), items = Object.entries(st.mis).sort((a, b) => String(b[1].date).localeCompare(String(a[1].date)));
    main().innerHTML = `<div id="misList"><header class="mod-h"><h1>Misconception log</h1><p class="lede">Every "Missed" or "Partial" deep question asks what went wrong in your thinking. These entries come back in mixed review until they are clear.</p></header>
      ${items.length ? items.map(([id, m]) => { const u = unitOf(m.unit), c = st.cards["M:" + id] || {}; return `<article class="card idea"><div class="pane-h"><span class="meta">${m.date}${u ? ` · <a href="${unitHref(u, "questions")}">${esc(u.title)}</a>` : ""} · next review ${c.due || "—"} (box ${c.box || 0})</span><button class="btn small bad" type="button" data-del="${id}">Delete</button></div>
        <p class="meta">${esc(m.prompt)}</p><p><b>Trap:</b> ${esc(m.text)}</p></article>`; }).join("")
        : `<div class="done-box"><h3>Empty — for now</h3><p>Rate a deep question "Missed" or "Partial" and write down where your reasoning slipped.</p></div>`}</div>`;
    $("#misList").addEventListener("click", e => { const d = e.target.closest("[data-del]"); if (!d) return; delete st.mis[d.dataset.del]; delete st.cards["M:" + d.dataset.del]; Store.save(); viewMistakes(); updateDue(); });
  }

  /* ---------- materials ---------- */
  const MAT_TABS = [["overview", "Overview"], ["outline", "Outline"], ["questions", "Deep Questions"], ["teach", "Teach it"], ["cards", "Flashcards"], ["connections", "Connections"], ["notes", "Notes & ideas"]];
  function viewMaterials() {
    const mats = allMats(), st = Store.load(), localMode = location.protocol === "file:" || /^(localhost|127\.)/.test(location.hostname);
    main().innerHTML = `<header class="mod-h"><h1>My Materials</h1><p class="lede">Papers, lecture notes and chapters you bring yourself. They stay on your computer (the <code>local/</code> folder is never committed) and get the same deep-question treatment as the built-in modules.</p></header>
      ${mats.length ? `<ol class="modules">${mats.map(m => { const p = unitProgress(m); return `<li class="mod"><span class="no">${esc(m.kind === "paper" ? "P" : m.kind === "lecture-notes" ? "L" : "C")}</span><div class="mod-body"><h3><a href="#/mat/${m.id}/overview">${esc(m.title)}</a></h3><p class="meta">${esc(m.authors || "")}${m.year ? " · " + m.year : ""} · added ${esc(m.addedOn)}</p><p>${esc(m.summary).slice(0, 260)}${m.summary.length > 260 ? "…" : ""}</p>
        <div class="chips"><span class="chip">Sections read ${p.orr}/${p.O}</span><span class="chip">Deep Qs solid ${p.qs}/${p.Q}</span><span class="chip">Cards ${p.cm}/${p.C}</span></div>${bar(p.total, m.title)}</div></li>`; }).join("")}</ol>`
        : `<div class="done-box"><h3>${localMode ? "No materials yet" : "Materials live on your computer"}</h3><p>${localMode ? "" : "This public site never contains your papers. Open the site from your local copy to see them.<br><br>"}To add one: put the PDF in <code>learn-lab/local/inbox/</code>, open Claude Code in <code>learn-lab</code> and run <code>/study-material local/inbox/&lt;file&gt;.pdf</code> (an arXiv link works too). Then reload this page.</p></div>`}
      <div class="card"><h3>How it works</h3><ol><li>Claude reads the whole document section by section.</li><li>It writes an outline, deep questions anchored to sections and equations, formula flashcards, connections to modules, and related work it has verified (what this builds on, what challenges it).</li><li>You study it here; use "Ask Socratically" on any question to argue it out in Claude Code.</li></ol></div>`;
  }
  function viewMaterial(id, tab, arg) {
    const m = S.mats[id]; if (!m) return notFound();
    tab = MAT_TABS.some(t => t[0] === tab) ? tab : "overview";
    const st = Store.load(); st.pos.last = id; st.pos.tab = tab; Store.save();
    main().innerHTML = `<nav class="crumbs"><a href="#/">Home</a><span>›</span><a href="#/materials">Materials</a></nav>
      <header class="mod-h"><h1>${esc(m.title)}</h1><p class="meta">${esc(m.authors || "")}${m.year ? " · " + m.year : ""} · ${esc(m.kind)}${m.url ? ` · <a href="${esc(m.url)}" target="_blank" rel="noopener">source</a>` : ""}${m.file ? ` · file: <code>${esc(m.file)}</code>` : ""}</p></header>
      <nav class="tabs" aria-label="Material sections">${MAT_TABS.map(([k, l]) => `<a href="#/mat/${id}/${k}" class="${k === tab ? "on" : ""}"${k === tab ? ' aria-current="page"' : ""}>${l}</a>`).join("")}</nav>
      <section id="pane" class="pane"></section>`;
    const pane = $("#pane");
    if (tab === "overview") {
      pane.innerHTML = `<p class="lede">${m.summary}</p><div class="grid two">
        <div class="card"><h3>Contributions</h3><ul>${m.contributions.map(x => `<li>${x}</li>`).join("")}</ul></div>
        <div class="card"><h3>Assumptions</h3><ul>${m.assumptions.map(x => `<li>${x}</li>`).join("")}</ul></div>
        <div class="card"><h3>Limitations (incl. the authors' own)</h3><ul>${m.limitations.map(x => `<li>${x}</li>`).join("")}</ul></div>
        <div class="card"><h3>Reading plan</h3><ol>${m.readingPlan.map(x => `<li>${x}</li>`).join("")}</ol></div></div>`;
      renderMath(pane);
    } else if (tab === "outline") {
      const rd = st.matRead[id] = st.matRead[id] || {};
      pane.innerHTML = m.outline.map(o => `<article class="card sec"><label class="secread"><input type="checkbox" data-sec="${esc(o.id)}"${rd[o.id] ? " checked" : ""}> <h3>${esc(o.title)}</h3></label><p>${o.gist}</p>
        ${(o.keyIdeas || []).length ? `<ul>${o.keyIdeas.map(k => `<li>${k}</li>`).join("")}</ul>` : ""}${(o.equations || []).map(e => `<div class="formula">${tex(e, true)}</div>`).join("")}</article>`).join("");
      renderMath(pane);
      pane.addEventListener("change", e => { const s = e.target.dataset.sec; if (!s) return; if (e.target.checked) rd[s] = Store.today(); else delete rd[s]; Store.touch(); Store.save(); });
    } else if (tab === "questions") paneQuestions(pane, m, arg);
    else if (tab === "teach") paneTeach(pane, m);
    else if (tab === "cards") paneCards(pane, m, arg);
    else if (tab === "connections") {
      pane.innerHTML = `<h3 class="section-h">Connections to your modules</h3>${(m.connections || []).length ? `<ul class="conn">${m.connections.map(c => { const u = S.mods[c.moduleId]; return `<li>${u ? `<a href="#/m/${u.id}/learn">${esc(u.title)}</a>` : `<b>${esc(c.moduleId)}</b>`} — ${c.why}</li>`; }).join("")}</ul>` : `<p class="meta">None recorded.</p>`}
        <h3 class="section-h">Related work</h3>${["builds on", "challenges", "extends", "applies"].map(rel => { const rs = (m.related || []).filter(r => r.relation === rel); return rs.length ? `<h4>${rel}</h4><ul class="refs">${rs.map(r => `<li>${r.url ? `<a href="${esc(r.url)}" target="_blank" rel="noopener">${esc(r.label)}</a>` : esc(r.label)}</li>`).join("")}</ul>` : ""; }).join("")}`;
      renderMath(pane);
    } else {
      pane.innerHTML = `<div class="grid two"><div class="card"><h3>Open questions</h3><ul>${m.openQuestions.map(x => `<li>${x}</li>`).join("")}</ul></div><div class="card"><h3>Brainstorm prompts</h3><ul>${m.brainstorm.map(x => `<li>${x}</li>`).join("")}</ul></div></div>
        <label class="notes big">My notes and ideas (collected in the Idea Lab)<textarea id="ideaBox" rows="8">${esc(st.ideas[id] || "")}</textarea></label>`;
      renderMath(pane);
      $("#ideaBox").addEventListener("input", e => { st.ideas[id] = e.target.value; Store.save(); });
    }
  }

  /* ---------- progress ---------- */
  function viewProgress() {
    const st = Store.load(), boxes = [0, 0, 0, 0, 0, 0, 0];
    Object.values(st.cards).forEach(c => boxes[c.box || 0]++);
    const answered = Object.values(st.answers).filter(a => a.rating != null).length;
    main().innerHTML = `<header class="mod-h"><h1>Progress</h1><p class="lede">Streak ${Store.streak()} day(s) · ${Object.keys(st.days).length} day(s) studied · ${answered} deep question(s) rated · ${Object.keys(st.mis).length} misconception(s) · ${Object.values(st.preds).reduce((a, h) => a + h.length, 0)} prediction(s) · ${Object.keys(st.hyps).length} hypothesis card(s).</p></header>
      ${S.subjects.map(s => `<h2 class="section-h">${esc(s.title)}</h2><div class="tbl"><table><thead><tr><th>Module</th><th>Lessons</th><th>Deep Qs solid</th><th>Cards mastered</th><th>Projects done</th><th>Overall</th></tr></thead><tbody>
        ${modsOf(s).map(m => { const p = unitProgress(m); return `<tr><td><a href="#/m/${m.id}/learn">${esc(m.title)}</a></td><td>${p.lr}/${p.L}</td><td>${p.qs}/${p.Q}</td><td>${p.cm}/${p.C}</td><td>${p.pd}/${p.P}</td><td>${pct(p.total)}%</td></tr>`; }).join("")}
      </tbody></table></div>`).join("")}
      <h2 class="section-h">Backup</h2>
      <div class="card backup"><p>Everything you write — answers, explanations, hypotheses — lives in this browser. Export regularly; import on another device.</p>
        <div class="row"><button class="btn primary" id="exp" type="button">Export JSON</button>
        <label class="btn">Import JSON<input type="file" id="imp" accept="application/json,.json" hidden></label>
        <button class="btn bad" id="rst" type="button">Reset all progress</button></div><p class="meta" id="bkMsg" aria-live="polite"></p></div>`;
    $("#exp").addEventListener("click", () => download("quant-study-lab-" + Store.today() + ".json", Store.exportJSON(), "application/json"));
    $("#imp").addEventListener("change", e => {
      const f = e.target.files[0]; if (!f) return; const r = new FileReader();
      r.onload = () => { try { Store.importJSON(r.result); $("#bkMsg").textContent = "Imported."; updateDue(); setTimeout(viewProgress, 400); } catch (err) { $("#bkMsg").textContent = "Import failed: " + err.message; } };
      r.readAsText(f);
    });
    $("#rst").addEventListener("click", () => { if (confirm("Delete all progress in this browser? Export first if unsure.")) { Store.reset(); updateDue(); viewProgress(); } });
  }
  function notFound() { main().innerHTML = `<div class="done-box"><h3>Not found</h3><p><a href="#/">Back home</a></p></div>`; }

  /* ---------- search ---------- */
  let index = null;
  function buildIndex() {
    index = [];
    allMods().forEach(m => {
      index.push({ t: m.title, k: "Module", h: `#/m/${m.id}/learn`, x: m.title + " " + m.summary });
      m.lessons.forEach((l, i) => index.push({ t: l.title, k: "Lesson · " + m.title, h: `#/m/${m.id}/learn/${i}`, x: l.title + " " + strip(l.html) }));
      m.cheatsheet.forEach(c => index.push({ t: c.term, k: "Cheatsheet · " + m.title, h: `#/m/${m.id}/cheatsheet`, x: c.term + " " + (c.note || "") }));
      (m.questions || []).forEach((q, i) => index.push({ t: strip(q.prompt).slice(0, 90), k: TYPE_LABEL[q.type] + " question · " + m.title, h: `#/m/${m.id}/questions/${i}`, x: strip(q.prompt) }));
      m.frontier.threads.forEach(t => index.push({ t: t.title, k: "Frontier · " + m.title, h: `#/m/${m.id}/frontier`, x: t.title + " " + strip(t.why) }));
    });
    allMats().forEach(m => {
      index.push({ t: m.title, k: "Material", h: `#/mat/${m.id}/overview`, x: m.title + " " + (m.authors || "") + " " + strip(m.summary) });
      m.outline.forEach(o => index.push({ t: o.title, k: "Section · " + m.title, h: `#/mat/${m.id}/outline`, x: o.title + " " + strip(o.gist) }));
    });
    (window.LABS || []).forEach(l => index.push({ t: l.title, k: "Prediction lab", h: `#/lab/${l.id}`, x: l.title + " " + strip(l.question) }));
  }
  function search(q) {
    const box = $("#results"); q = q.trim().toLowerCase();
    if (q.length < 2) { box.hidden = true; return; }
    if (!index) buildIndex();
    const terms = q.split(/\s+/);
    const hits = index.map(r => { const t = r.t.toLowerCase(), x = r.x.toLowerCase(); if (!terms.every(w => x.includes(w) || t.includes(w))) return null; return [r, terms.every(w => t.includes(w)) ? 2 : 1]; })
      .filter(Boolean).sort((a, b) => b[1] - a[1]).slice(0, 12);
    box.innerHTML = hits.length ? hits.map(([r]) => `<a href="${r.h}"><b>${esc(r.t)}</b><span>${esc(r.k)}</span></a>`).join("") : `<p class="meta">No matches</p>`;
    box.hidden = false;
  }

  /* ---------- router ---------- */
  function route() {
    const parts = (location.hash || "#/").slice(2).split("/").map(decodeURIComponent);
    const [a, b, c, d] = parts;
    $("#results").hidden = true;
    const navKey = !a ? "home" : a === "s" || a === "m" ? "home" : a === "mat" ? "materials" : a;
    $$(".nav a").forEach(x => x.classList.toggle("on", x.dataset.nav === navKey));
    session.key = null;
    if (!a) viewHome();
    else if (a === "s") viewSubject(b);
    else if (a === "m") viewModule(b, c, d);
    else if (a === "review") viewReview();
    else if (a === "ideas") viewIdeas();
    else if (a === "mistakes") viewMistakes();
    else if (a === "lab") viewLab(b);
    else if (a === "materials") viewMaterials();
    else if (a === "mat") viewMaterial(b, c, d);
    else if (a === "progress") viewProgress();
    else notFound();
    updateDue();
    window.scrollTo(0, 0);
    main().focus({ preventScroll: true });
  }

  /* ---------- theme ---------- */
  function applyTheme(t) { if (t) document.documentElement.setAttribute("data-theme", t); else document.documentElement.removeAttribute("data-theme"); }
  function initTheme() {
    let t = null; try { t = localStorage.getItem("lab-theme"); } catch (e) { }
    applyTheme(t);
    $("#theme").addEventListener("click", () => {
      const cur = document.documentElement.getAttribute("data-theme") || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
      const nx = cur === "dark" ? "light" : "dark"; applyTheme(nx); try { localStorage.setItem("lab-theme", nx); } catch (e) { }
    });
  }

  /* ---------- boot ---------- */
  function loadScript(src, quiet) { return new Promise(res => { const s = document.createElement("script"); s.src = src; s.onload = () => res(true); s.onerror = () => { if (!quiet) console.info("Content file not available yet:", src); s.remove(); res(false); }; document.head.appendChild(s); }); }
  async function boot() {
    initTheme();
    await loadScript("data/index.js");
    for (const f of (window.LAB_FILES || [])) await loadScript("data/" + f, true);
    if (await loadScript("local/index.js", true)) for (const f of (window.LAB_LOCAL || [])) await loadScript("local/" + f, true);
    Object.entries(S.ext).forEach(([id, x]) => { const u = S.mods[id]; if (!u) return; u.questions = x.questions || []; if (x.projects) u.projects = u.projects.concat(x.projects); });
    S.subjects.forEach(s => s.modules.sort((x, y) => ((S.mods[x] || {}).order || 99) - ((S.mods[y] || {}).order || 99)));
    window.addEventListener("hashchange", route);
    document.addEventListener("keydown", e => {
      if (e.key === "/" && !/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) { e.preventDefault(); $("#q").focus(); }
      else if (e.key === "Escape") { $("#results").hidden = true; }
      else if (session.key) session.key(e);
    });
    $("#q").addEventListener("input", e => search(e.target.value));
    $("#results").addEventListener("click", () => { $("#results").hidden = true; $("#q").value = ""; });
    route();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();
