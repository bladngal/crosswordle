# NOTES: Crosswordle — Original Intent (2026-06-12)

Laura's founding vision for this game, captured so future iterations keep the
full thinking, not just the artifact.

## The concept

A brand new game called **Crosswordle** — "a combination of crossword and the
game Wordle." Playable on her phone, hosted on her own website / as a web app.

## Her specific design decisions (in her words where it matters)

- **Word length**: "I don't think I want to limit the words to be always
  five-letter words like Wordle is."
- **Grid size**: NOT "a jam-packed, you know, like 20 by 20 grid." She
  hand-drew an example with FIRE / EARTH / AIR crossing each other.
- **Word count**: "maybe it would be kind of fun if there was really only like
  three to five or six words so it's not overwhelming."
- **Themes**: words share a theme, "very wide ranging" — her example was
  earth/air/fire ("the traditional elements"); she suggested tools, colors,
  trees. "Come up with fun and creative ideas" — themes are an open creative
  space, not locked down.
- **Word difficulty**: "The words need to be common enough that most people
  know them."
- **The keyboard is the trick**: "the keyboard would have to change for the
  different words... that keyboard change would be triggered when you clicked
  on the first letter of whatever word it is you're trying to work with."
  (Implemented as: tap ANY cell of a word, not just the first letter.)
- **Feedback colors**: green = correct letter correct place, yellow = in the
  word but wrong spot (standard Wordle semantics).
- **Look & feel**: "mobile friendly and nice to look at, but relatively simple
  so it's not cluttered with a bunch of extra colors." Wanted "slightly
  different colors or shading than the standard Wordle game" — hence the
  teal / amber / warm-paper palette instead of green / yellow / white.
- **Sound**: "Some sound effects might be fun" — just short of a requirement;
  implemented as gentle Web Audio synth tones with a mute toggle.

## Design choices made during the build (and why)

- **Vanilla HTML/CSS/JS, zero dependencies** — easiest possible hosting on her
  own site (any static host; no build step).
- **Green letters lock into the grid permanently** and carry across crossings.
  This is the mechanic that makes it a *crossword*-Wordle rather than several
  parallel Wordles: solving one word seeds its neighbors.
- **No guess limit** — total guess count is the score instead. Friendlier for
  a multi-word puzzle where a 6-guess cap per word would feel punishing.
- **Hint button reveals a clue per word** — themes alone can be a thin hint
  for longer words; the clue is opt-in so the default experience stays pure.
- **Amber letters linger in their slot** (added 2026-06-12 at Laura's request):
  after a guess, right-letter-wrong-spot letters stay visible — amber, dashed
  border — in the exact cell where they were tried, "to help you remember that
  you've already tried it in that slot." They're display-only (never submitted),
  you "type over" them, and backspace reveals them again. Extended same day at
  Laura's request to keep "track of all the wrong places a right letter has
  been tried": residue is now CUMULATIVE per position — the most recent
  attempt shows big and amber, older attempts shrink to tiny pencil marks at
  the bottom edge of the cell (capped at 4, deduped). Marks stay visible while
  typing over them; everything persists in saved state until the cell locks.
- **Locked letters absorb their keystroke** (added 2026-06-12 after Laura's
  playtesting): "because of the way humans type... my fingers just want to type
  ORANGE even though the R is already there," and the old skip-the-locked-cell
  behavior produced misaligned entries (typing ORAN became ORRA). Now typing
  the whole word works: a keystroke that MATCHES a locked letter just before
  the cursor is absorbed (cell pulses, nothing changes); a non-matching letter
  still flows to the next empty cell, so skip-typing works too. Backspace
  replays the exact keystroke history, including absorbed ones. Known
  trade-off: in a word with the same letter locked and unlocked side by side
  (e.g. GREEN with one E locked), a skip-typist's E gets absorbed — full-word
  typing is the primary model, per Laura.
- **Daily rotation** of 12 hand-authored puzzles (epoch June 1 2026), plus a
  "Play another" free-play mode after winning (free play doesn't touch saved
  daily progress or stats).
- **Layout validity is machine-checked** — `scripts/validate-puzzles.cjs`
  verifies crossing letters match, words don't visually merge into gibberish,
  and the grid is connected. Run it after adding any puzzle.

## Open ideas for later

- More puzzles (validator makes adding them safe).
- A proper share grid (emoji pattern) rather than a text summary.
- PWA manifest so it can be "installed" to her home screen.
