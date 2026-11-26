# Content schema (one file per module)

Each module lives in `data/<subject-id>/<module-id>.js` and contains exactly one call:

```js
LAB.module("finance-ml", {
  "id": "fml-labeling",              // unique, kebab-case, prefixed by subject short id
  "order": 2,                        // position inside the subject
  "title": "Labeling: Triple-Barrier and Meta-Labeling",
  "summary": "1–2 sentences: what this module gives you.",
  "sources": [ { "label": "AFML ch. 3", "url": "" } ],   // primary readings; url optional ("" if none)
  "lessons": [
    { "id": "fml-labeling-1", "title": "…", "minutes": 18, "html": "<h3>…</h3><p>…</p>" }
  ],
  "cheatsheet": [
    { "term": "Triple-barrier label", "formula": "y_i = \\operatorname{sign}(r_{t_{i,0},t_{i,1}})", "note": "short note" }
  ],
  "flashcards": [ { "q": "…", "a": "…" } ],
  "quiz": [ { "q": "…", "choices": ["A","B","C","D"], "answer": 2, "why": "explanation" } ],
  "projects": [
    {
      "id": "fml-labeling-p1", "title": "…", "level": "core",        // "core" | "stretch"
      "hours": "6–10",
      "goal": "one paragraph",
      "data": "where to get free data + caveats",
      "steps": ["…"], "deliverables": ["…"], "acceptance": ["…measurable check…"], "extensions": ["…"]
    }
  ],
  "frontier": {
    "asOf": "2026-11",
    "summary": "one paragraph: where the field is now",
    "threads": [ { "title": "…", "why": "2–4 sentences", "refs": [ { "label": "Author (year) — Title", "url": "https://…" } ] } ],
    "openQuestions": ["…"],
    "brainstorm": ["a prompt that helps the learner pick something to dig into"]
  }
}
);
```

## Rules
- **Lessons follow the source's table of contents**, not a fixed count. One lesson = one coherent idea a learner can finish in one sitting (roughly 6–25 min), in prerequisite order. Merge tiny subsections; split a long chapter at its natural section breaks. Don't write "lesson 2"; say "a later lesson" so lessons can be re-split.
- Valid JSON object literal inside the call (double-quoted keys and strings), so it can be checked with `node tools/validate.js`.
- **Math:** KaTeX syntax, inline `$…$`, display `$$…$$`. Inside JS strings every backslash is doubled: `"$\\frac{a}{b}$"`.
  `formula` fields in the cheatsheet are raw TeX without `$` delimiters (still with doubled backslashes).
- **HTML allowed in lesson `html`, flashcard `a`, quiz `why`:** `h3 h4 p ul ol li strong em code pre blockquote table thead tbody tr th td a br div`.
  Code blocks: `<pre><code class="language-python">…</code></pre>` (escape `<`, `>` and `&` inside code as `&lt; &gt; &amp;`).
  Callouts: `<div class="callout">…</div>`, `<div class="callout warn">…</div>`.
- Quiz: exactly 4 choices, `answer` is the 0-based index; vary the correct position.
- No content copied verbatim from books or other sites; write original explanations. Short quotes of formulas/definitions are fine.
- References in `frontier.refs` and `sources` must be real and checked (prefer DOI, arXiv, SSRN, publisher or author pages). If unsure of a URL, use `""` rather than guessing.

> **Update 2026-11-25:** the multiple-choice `quiz` field is retired. Deep questions live in separate extension files (below). Project `level` may also be `"replication"`.

---

# Extension files: deep questions (+ optional extra projects)

`data/<subject-id>/q/<module-id>.js` contains exactly one call:

```js
LAB.extend("fml-cross-validation", {
  "questions": [
    {
      "id": "fml-cv-q1",
      "type": "critique",          // derive | critique | counterexample | predict | design | connect | debate
      "difficulty": 3,             // 1..3 (3 = research-level)
      "prompt": "<p>HTML with KaTeX …</p>",
      "whyItMatters": "1–2 sentences",
      "hints": ["tier 1 (gentle nudge)", "tier 2 (method)", "tier 3 (almost there)"],
      "keyPoints": ["what a strong answer must contain", "…", "…"],   // >= 3, not a full model answer
      "followUps": ["a deeper question to keep going"],
      "source": { "label": "AFML ch. 12, exercise 3 (adapted)", "url": "", "relation": "adapted from" },  // adapted from | motivated by | original
      "sides": [ { "position": "…", "refs": [ { "label": "…", "url": "…" } ] } ]   // ONLY for type "debate" (>= 2 sides)
    }
  ],
  "projects": [ { …same as module projects…, "level": "replication",
                  "paper": { "label": "Author (year) — Title", "url": "https://doi.org/…" } } ]
});
```

Rules: 6–8 questions per module, at least 4 different types, at least one `debate` where a real published debate exists.
`"original"` sources are allowed only for `connect` and `design`. Exercise-based questions cite the book and exercise number and are paraphrased and extended, never copied.

---

# Personal materials (local only, never committed)

`local/materials/<material-id>.js` contains `LAB.material({...})` and is registered in `local/index.js` (`window.LAB_LOCAL = ["materials/<id>.js", …]`).

```js
LAB.material({
  "id": "mat-…", "title": "…", "authors": "…", "year": 2024,
  "kind": "paper",                       // paper | lecture-notes | chapter | other
  "file": "local/inbox/….pdf", "url": "", "addedOn": "2026-11-25",
  "summary": "…", "contributions": ["…"], "assumptions": ["…"], "limitations": ["…"],
  "readingPlan": ["…"],
  "outline": [ { "id": "s1", "title": "1. Introduction", "gist": "…", "keyIdeas": ["…"], "equations": ["TeX without $"] } ],
  "questions": [ …same schema as deep questions; source.label points into the material, e.g. "Sec. 3.2, eq. (7)"… ],
  "flashcards": [ { "q": "…", "a": "…" } ],
  "connections": [ { "moduleId": "fml-cross-validation", "why": "…" } ],
  "related": [ { "label": "Author (year) — Title", "url": "…", "relation": "builds on" } ],   // builds on | challenges | extends | applies
  "openQuestions": ["…"], "brainstorm": ["…"]
});
```

## Subjects that follow an external course (added 2026-11-26)
When a strong external course exists (e.g. Stanford EE364a, CS285, Karpathy), **do not write lesson prose**. Follow the course's own structure and link out; the site's value is the deep layer around it.
- `subject.js` may set `"course": { "name": "Stanford EE364a", "url": "https://…", "note": "lectures + B&V textbook" }`.
- Lessons follow the course's lecture/chapter order, one lesson per lecture or coherent group:
  `{ "id": "…", "title": "…", "minutes": 80, "links": [ { "label": "EE364a lecture 3 slides", "url": "…" }, { "label": "B&V §3.1–3.2", "url": "" } ], "focus": "<p>HTML, original: what to watch for, 2–3 questions to predict before watching, the one idea to leave with</p>" }`
- Everything else stays mandatory and original: cheatsheet, flashcards, deep questions (q/ file), projects incl. replication, frontier, labs where a simulation teaches something.
