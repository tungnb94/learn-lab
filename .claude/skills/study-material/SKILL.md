---
name: study-material
description: Turn a paper, lecture notes or book chapter the user provides (PDF path, arXiv link or pasted text) into a deep-study unit for the Quant Study Lab site — outline, hard sourced deep questions, formula flashcards, connections to existing modules and verified related work. Use when the user runs /study-material or asks to "add this paper/notes to my study lab".
---

# study-material

Build one study unit for `learn-lab` from a document the user brings. The output is a local, never-committed file `local/materials/<id>.js` that the site shows under **Materials**.

The learner is an experienced **equity quantitative researcher**. They do not want recall quizzes. They want questions that force derivation, critique, counterexamples, prediction, design under real constraints, cross-field connections and engagement with published debates.

## Input
`/study-material <path-or-url> [focus notes]`
- A path, usually under `local/inbox/`. Read a PDF with the Read tool, at most 20 pages per call. Read **every** page; do not skim.
  - If the Read tool cannot render the PDF (for example because poppler is missing), run `pdftotext -layout <file> <scratchpad>/<id>.txt` and read the whole text file instead.
  - Figures are lost in that case, so say so in the report.
  - Non-English documents, such as Vietnamese course notes, are fine. Write the unit in English and keep the original terms where they help.
- An arXiv/DOI URL: fetch the abstract page, then the PDF. If the PDF cannot be fetched, ask the user to download it into `local/inbox/`.
- Pasted text.

If the document is longer than ~120 pages, such as a whole book or a long set of notes, ask which chapters to cover first. Make one material per chapter group.

## Steps
1. **Read the whole document.** Record section numbers, the key definitions and theorems, equation numbers and stated assumptions. Note every limitation the authors admit themselves.
2. **Pick an id**: `mat-<firstauthor>-<year>-<shortslug>`, lowercase. For notes without an author use `mat-<course>-<topic>`. Check that `local/materials/<id>.js` does not already exist; if it does, append `-2`.
3. **Map to existing modules.** List module ids with `ls data/*/` (files `*.js` other than `subject.js` and `q/`). Read the titles and summaries of those that might relate. Connections must say concretely *why* they relate, for example the same estimator, a shared assumption, or a contradicting result.
4. **Verify related work with web search.** Find:
   - **builds on**: what the document builds on;
   - **challenges**: later work that criticises or fails to replicate it;
   - **extends**: work that extends it;
   - **applies**: notable applications.

   Check authors, year, title and URL (DOI, arXiv, SSRN or publisher). Never invent a paper. Use `""` for a URL you cannot confirm.
5. **Write the unit** following the `LAB.material` schema in `tools/SCHEMA.md`:
   - `summary`: 1 paragraph. `contributions`, `assumptions`, `limitations`, each 3–6 items. `limitations` includes the authors' own admissions, tagged "(authors)".
   - `readingPlan`: an order of reading for this learner. Say which parts an equity QR can skim and which need pen and paper.
   - `outline`: one entry per section or subsection that matters. `gist` is 2–4 sentences in your own words. Add `keyIdeas` and the key `equations` as TeX without `$`.
   - `questions`: 7–10 deep questions using the same schema as module deep questions.
     - Use at least 4 types and include at least one `connect` and one `predict`.
     - Include a `debate` if the related-work search found a real disagreement. Both sides must cite verified refs.
     - `source.label` points into the document, for example "Sec. 3.2, eq. (7)" with relation "motivated by", or to the verified external reference.
     - 2–3 tiered hints, 3–6 keyPoints and 1–3 followUps per question.
   - `flashcards`: 8–15, **only** definitions, notation and formulas.
   - `connections`, `related`, `openQuestions` (4–6), `brainstorm` (4–6). Brainstorm prompts should help the learner design a test on public data.
   - `file`: the relative path of the source (for example `local/inbox/x.pdf`). `addedOn`: today's date, YYYY-MM-DD.
6. **Write the file** with a small Node script in the session scratchpad, using `JSON.stringify` so that TeX backslashes are escaped correctly:
   `LAB.material(<json>);` → `local/materials/<id>.js`.
7. **Register it**: add `"materials/<id>.js"` to the `window.LAB_LOCAL` array in `local/index.js`. Create the file if it is missing: `window.LAB_LOCAL = [];`.
8. **Validate**: `node tools/validate.js local/` must print ✓. Fix and re-run until it does.
9. **Report** in 3–5 lines:
   - what the unit contains;
   - the link `index.html#/mat/<id>/overview` (open the local copy of the site);
   - any reference you could not verify;
   - a suggestion to start with the hardest question, or to use the "Ask Socratically" button, which works with the `socratic-tutor` skill.

## Rules
- Original wording only. Do not copy long passages from the document. Short quotes of definitions and equations are fine.
- Keep everything under `local/`. Never commit it, and never copy material content into `data/`. `local/` is git-ignored because papers and notes may be copyrighted or private.
- Never put employer data, code or signals into a material. If the document looks like internal or proprietary work material, stop and ask.
- Use doubled backslashes for TeX inside JSON strings (`JSON.stringify` does this for you).
