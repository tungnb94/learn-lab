# Quant Study Lab

A personal, zero-build study site for quantitative finance, ML and systems. Each module runs one loop:

**lesson → cheatsheet → deep questions → prediction lab → teach it back → project → research frontier**

- **Deep Questions**: hard, open-ended questions. Each one has a type: derive, critique, counterexample, predict, design, connect or debate. Each comes with tiered hints, the key points a strong answer covers, follow-ups and a verified source. You rate yourself Missed / Partial / Solid, and the question comes back on a spaced schedule. "Ask Socratically" copies a prompt for the `socratic-tutor` skill in Claude Code. Debate questions copy a prompt where Claude argues the opposite side.
- **Prediction Lab**: you type a number before the simulation is allowed to run. Your errors are recorded so you can see where your intuition is biased.
- **Teach it**: explain the module in about 300 words. A button copies a reviewer prompt that finds the gaps.
- **Misconception log**: when you rate a question Missed or Partial, the site asks where your reasoning went wrong. The entry comes back in review.
- **Idea Lab**: collides two concepts from different modules, then turns the collision into a hypothesis card. The card has a mechanism, the quickest test and a kill criterion, and exports to the research-ledger format.
- **Projects**: core, stretch and replication. Replication projects reproduce a table or figure from a key paper.
- **Frontier**: active research threads with verified references, open questions and brainstorm prompts.
- **My Materials**: your own papers and lecture notes get the same treatment through `/study-material` in Claude Code. Materials stay on your computer.
- **Mixed review**: flashcards, deep questions and misconceptions from every module, interleaved.

Progress lives in your browser's localStorage. Use **Progress → Export JSON** to back it up or move it to another device.

## Run locally
Double-click `index.html`. No server or build step is needed: content is loaded with plain `<script>` tags, so `file://` works. KaTeX and the fonts come from a CDN.

## Add your own material (local only)
1. Put the PDF in `local/inbox/`.
2. Open Claude Code in this folder and run `/study-material local/inbox/<file>.pdf`. An arXiv link works too.
3. Reload `index.html` and open **Materials**.

`local/` is in `.gitignore`. Papers and notes may be copyrighted or private, so they never reach the public repo. The published site shows instructions in their place.

## Content layout
```
data/index.js                       manifest of content files
data/<subject>/subject.js           LAB.subject({...})
data/<subject>/<module>.js          LAB.module("<subject>", {...})   lessons, cheatsheet, flashcards, projects, frontier
data/<subject>/q/<module>.js        LAB.extend("<module>", {...})    deep questions (+ replication projects)
js/labs/<subject>.js                prediction labs (window.LABS)
local/index.js, local/materials/    personal materials (git-ignored)
tools/SCHEMA.md                     content schema
tools/validate.js                   node tools/validate.js   → schema + TeX checks
tools/check-links.js                node tools/check-links.js → reference URLs
```

## Adding a subject
1. Write `data/<subject>/subject.js`, listing the module ids.
2. Write each module and its `q/` file following `tools/SCHEMA.md`.
3. Add every file to `data/index.js`.
4. Run `node tools/validate.js` and `node tools/check-links.js`.
5. Optionally add labs in `js/labs/<subject>.js` and include that file in `index.html`.

## Rules for content
- Write everything in your own words. Exercise-based questions cite the book and exercise number, and are paraphrased and extended.
- Every reference must be real and verified. When a URL can't be confirmed, leave it empty instead of guessing.
- Projects use public or personally licensed data only, never employer data, code or signals.
