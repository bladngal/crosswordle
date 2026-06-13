# Code Project

This folder is a software repository. Treat it like a normal coding project: read existing code and docs first, follow established conventions, and make changes that are minimal and reviewable.

## Defaults

- Prefer working with the project's existing tools and scripts (build, test, lint, format).
- Avoid broad rewrites unless explicitly asked; incremental changes are preferred.
- Ask before adding new dependencies or changing the project's architecture.
- Keep secrets out of the repo. Use `.env.example` for example environment variables.

## Layout (Suggested, Not Required)

Common folders you may see (or choose to create if asked) include:

- `src/` — Application/library code
- `tests/` — Tests
- `scripts/` — Automation scripts
- `docs/` — Design docs and notes
- `examples/` — Usage examples and demos

---

## Capture Intent, Not Just Deliverables

When the user asks for something, two things are happening:

1. **The deliverable** — the artifact being requested
2. **The intent** — the concerns, constraints, tensions, and reasoning that shape *how* and *why* it should be built

**Do not let intent evaporate.** Intent is metadata that must be stored alongside the work, not consumed once and discarded.

- Future iterations need access to the full thinking
- Related work shares the same concerns and constraints
- The nuance IS the value — without it, future work loses critical context

When the user shares intent while requesting work, capture it in a context or notes file alongside the artifact. If you sense you're missing intent, ask — or note the gap.

---

## Preserve Nuance

**Do not over-summarize.** When capturing information:

- Keep the user's exact phrasing where it carries meaning
- Do not round nuanced positions into clean categories
- When in doubt, quote directly rather than paraphrase
- If something is "just short of a hard requirement" — say that, don't simplify to "requirement" or "preference"

---

## File Naming Conventions

Use a **TYPE prefix** in uppercase at the start of filenames so files of the same kind sort together:

```
PROMPT_campaign_brief.md
SCRIPT_intro_sequence.md
NOTES_stakeholder_feedback.md
OUTLINE_video_structure.md
DRAFT_announcement_letter.md
```

The prefix describes what the file *is*, not its topic. Choose a clear, short type name that fits the content.

### Versioning

For **minor edits** (typos, small tweaks, additions), edit the file in place.

For **major revisions** (rewrites, new direction, structural changes), create a new version:

```
SCRIPT_intro_sequence_v01.md
SCRIPT_intro_sequence_v02.md
```

This preserves the ability to compare or revert without relying on git history alone.

---

## Long-Term Memory

Keep durable project memory in this file, not in `CLAUDE.md`, `AGENTS.md`, or `GEMINI.md`.

- Use this section for decisions, non-obvious constraints, stable preferences, and important context worth carrying forward.
- Prefer appending dated bullets so future runs can track why decisions were made.
- Keep temporary task notes in normal working docs; only keep long-lived context here.

- 2026-06-12: Project is **Crosswordle**, a mobile-first web game mixing crossword + Wordle. Full founding intent (with Laura's phrasing) is in `NOTES_crosswordle_intent.md` — read it before changing game design.
- 2026-06-12: Stack decision: vanilla HTML/CSS/JS, zero dependencies, no build step — so it can be hosted as static files on Laura's own website. Don't add frameworks or npm packages without asking.
- 2026-06-12: Core mechanic decisions: per-word keyboard state (keyboard swaps when the active word changes); green letters lock into the grid and carry across crossings; no per-word guess limit (total guesses = score); themes of 3-5 common words; opt-in Hint button shows a clue.
- 2026-06-12: Visual identity: deliberately NOT Wordle's palette — teal (`--correct: #2e9e8f`) and amber (`--present: #e3a84e`) on warm paper (`#f7f4ee`), rounded cells. Sounds are synthesized in `audio.js` via Web Audio (no audio files), with persisted mute toggle.
- 2026-06-12: Puzzles live in `puzzles.js` (12 hand-authored, daily rotation, epoch 2026-06-01). ALWAYS run `node scripts/validate-puzzles.cjs` after adding/editing puzzles — it catches crossing-letter conflicts and words that visually merge (e.g. a stray T above RAIN reading TRAIN).
- 2026-06-12: Local preview: `python3 -m http.server 4173` (configured in `.claude/launch.json`).
- 2026-06-13: DEPLOYED. GitHub repo `bladngal/crosswordle` (public), live at https://bladngal.github.io/crosswordle/ via GitHub Pages serving `main` branch root (no build step). GitHub account: `bladngal`. To publish updates, just `git push` to `main` — Pages rebuilds within ~1 min. HTTPS is automatic, so the PWA (install/offline) is fully active in production.
- 2026-06-12: PWA support added: `manifest.webmanifest` (standalone display, portrait), `sw.js` (stale-while-revalidate caching — players get deployed changes on their SECOND visit; bump the `CACHE` constant in sw.js only to force a clean slate), and `icons/` (PNGs generated from `icons/icon.svg` via `qlmanage -t -s 1024` + `sips`; regenerate from the SVG if the icon changes). Service worker + install prompts require HTTPS hosting (localhost works for dev); plain-HTTP LAN testing silently skips the SW. New files added to sw.js's SHELL list must be listed there to be precached.
- 2026-06-12: Guesses are dictionary-checked against `words.js` (~80k words: ENABLE list filtered to 3-8 letters + all puzzle answers). `words.js` is GENERATED — never hand-edit; rebuild with `node scripts/build-wordlist.cjs <enable1.txt>` (source URL in the script header). Rebuild after adding puzzles with new answers, though answers are auto-merged so most additions need nothing. If `words.js` fails to load in the browser, the game degrades gracefully to no dictionary check.
