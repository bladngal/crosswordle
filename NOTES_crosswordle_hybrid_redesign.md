# NOTES: Crosswordle — Hybrid Redesign Intent (2026-06-18)

A major new design direction for Crosswordle, captured from a long conversation
with Laura. This is **exploratory and not fully settled** — lots of "maybe" and
"I guess" — so it's recorded as intent to revisit, not a finished spec. Where
Laura's exact phrasing carries meaning, it's quoted. Confidence is tagged per
item: **[DECIDED]**, **[LEANING]**, **[OPEN]**.

> Read `NOTES_crosswordle_intent.md` first — that's the original founding
> vision. This file is a candidate *evolution* of it, not a replacement. The
> two disagree in places (e.g. guess limits, hint availability); those tensions
> are called out below.

---

## The starting frustration (why revisit at all)

Laura doesn't love the current game and hasn't gone back to it much. Two
concrete complaints drove the whole conversation:

1. **Category words don't always feel like they belong.** Her example: a "body
   parts" theme that included **face** — *"which is technically a body part,
   but I feel like it's not a part we think of. And I feel like there's a lot
   of those."* (She's fine with *obscure-but-fair* — e.g. **parrot** in a zoo
   theme: *"I'm pretty sure I've seen parrots at the zoo, so I don't mind that
   they're obscure."* The problem is words that are *technically* on-theme but
   not what the theme evokes.)

2. **She goes to the hint way too quickly.** *"I just don't have ideas of,
   well, it's a 4-letter word animal, I don't know."* The hint is **too
   available**, so it short-circuits the puzzle.

These two complaints are the seed of everything below.

---

## The central reframe: is this a Wordle or a crossword?

The biggest realization of the conversation. Laura's preference is Wordle (she
*"doesn't really love crossword"*), but what she's actually built — themed words
that must all fit, no Wordle-style history board — behaves more like a
crossword. *"It's not a great Wordle clone, because of the long words."*

**[LEANING → DECIDED direction]** Lean **into a crossword game, but give it the
Wordle boost** — the satisfaction of *"knowing you got some letters right, even
if you couldn't figure out the hint."*

> *"Maybe I need to lean into more of a crossword type game, but give it the
> Wordle boost of knowing you got some letters right. ... Like, maybe that
> really is what I'm looking for."*

What that means concretely:

- It's **a crossword game with a Wordle help system.** *"So an easy crossword...
  with a Wordle help system."*
- **Per-word clues** (crossword-style), which are *"harder, because that's what
  crossword is."* This is the hint mechanic getting richer, not just a theme.
- The **theme becomes optional**, not load-bearing. *"The theme wouldn't even
  need to have a theme because crossword puzzles have hints per word."* BUT —
  *"keeping them themed is nice,"* and a good theme *"can be much broader."*
  So: **themes stay, but become a flavour/extra-hint layer rather than the only
  information you get.**

⚠️ This is a real pivot away from the original intent, where the **theme was the
entire hint** (*"that's all you have is what theme is it"*). Revisit deliberately.

---

## Per-word Wordle board (the marquee UX idea)

**[LEANING, strong]** When you tap into a word, it should open into an actual
**Wordle-style board** for that word — a horizontal guess board — instead of
typing into the crossword grid in place.

> *"It might be nice if when you go into a word... it creates a horizontal
> version of the word that you're trying to solve for, so it looks more like a
> Wordle board. ... it pulls up a puzzle board, because it's difficult with
> scrolling and everything else to look through the word you're trying to
> solve."*

- Mental model: **"3 crossing Wordle boards"** — one Wordle board per word in
  the puzzle, and they share letters where the words cross.
- This is explicitly Laura's answer to *"the Wordle problem"* — the current game
  has *no Wordle history board*, and that's the part Wordle players already
  like. *"You may as well lean into the part that people already like when they
  come to it."*
- Real-estate note: hints (and possibly other UI) need somewhere to live, so
  *"our real estate is going to change a little bit, but the engine can make
  decisions as needed there."*

---

## Hints — tiered, earned, two axes

The "hint too available" complaint produces the richest design thinking here.

**[LEANING]** Move from one always-available clue to a **graduated hint system**:

- **Escalating specificity** — *"3 hints per word with level of help. The first
  hint is very vague, the next gets a little more obvious, and the third is like
  you're completely stuck — it's a giveaway."* Laura *"kind of likes those
  games."*
- **Earn / delay the first hint** — *"How about three guesses before you get
  your first hint?"* → *"that'd be probably even better."* Possibly
  **compounding / earnable**: *"you can earn hints, there's lots of"* games that
  do this.

**Two axes of hint** (this distinction matters):

1. **Board / theme-level hints** that apply across *all* words, escalating from
   broad category to specific:
   > *"The first hint can give you the genus of the theme — like animal,
   > vegetable, mineral — and the second can be 'found in a home,' and
   > eventually 'electronic goods' / 'appliances.'"*
2. **Per-word hints** — the crossword clue for a single word. Harder, more
   crossword-like.

**[OPEN]** Should hints count against score / be shared? *"I guess I would say
no"* on penalizing hints — **but** the puzzle *"should be built with not a very
hard level of difficulty"* if hints are free. (Tension to resolve: free hints
only work if the baseline difficulty is gentle.)

---

## Word length & word count

- **[DECIDED]** Word lengths should be **configurable as a min/max range**, not
  fixed at 5. *"Not all just five-letter words... but no three-letter words or
  twelve-letter words."* Configurable so *"you can easily alter the game as
  needed."*
- **[LEANING]** Laura finds **longer words more interesting** — *"there's more
  opportunity for letters,"* i.e. more Wordle feedback to work with.
- **[DECIDED]** **3 words per board** as the default. She considered 4–5, asked
  *"five, too much?"*, landed on *"three. I like three. Three is a good."*
  Reason: predictable session length — *"every game you play is roughly the same
  duration"* — and 5 Wordles in a row is too much *"but you'd have hints coming
  in."*
- **[DECIDED]** Word count should be **configurable**, and *"maybe later can be
  game difficulty or game length that can be set by a user."*

---

## Losability & attempts (the gamification Laura wants to keep)

Key insight: **a crossword has only "quit-ability," Wordle has "lose-ability,"**
and the lose-ability is part of what Laura likes.

> *"A crossword does not have lose-ability. They just have quit-ability. ...
> Maybe the gamification of Wordle is one of the things you like. ... I do like
> the somewhat limited attempt... a lose point."*

Today Crosswordle has *effectively unlimited* attempts per word (*"I have
unlimited attempts, basically"*). She notes she'll pause a Wordle rather than
lose it — *"I literally can't think of any more words that would fit"* — and
that tension is good; she could brute-force letters with off-theme words but
chooses not to.

**[LEANING]** Add a **per-word guess cap, Wordle-style: ~5 or 6 guesses per
word.** *"You can fail each word... you only get 5 or 6 attempts per word."*

⚠️ Directly contradicts the original/current decision (*"no guess limit — total
guess count is the score"* in `NOTES_crosswordle_intent.md`). This is the change
that introduces lose-ability. Revisit deliberately.

---

## What happens when you fail a word

**[OPEN, leaning toward opt-in reveal]** If you run out of guesses on a word:

- Do you keep playing the rest of the puzzle? **Likely yes.**
- Do you get the failed word *for free* so you can continue? Tension: giving it
  away *"could accidentally give away something when you weren't ready"* (it
  feeds crossing letters into the other words).
- **Proposed solution:** a **failed word is NOT auto-revealed** — *"you would
  have to tap it again to reveal it,"* opt-in, *"in case you want to challenge
  yourself for the other words it's attached to."* Even revealed, it only hands
  you **one letter per crossing word**, so you're still challenged.

---

## Scoring & sharing

Scoring is *"a major part of Wordle"* and a core thing to preserve.

- **[DECIDED]** Score is **relative to attempts per word**, *"not just
  completion."* Track at least guesses-per-word and fails.
- **[LEANING]** A **shareable result graphic** (Wordle-style), showing:
  - the **shape of the board** (the crossing layout),
  - **green squares** for solved words,
  - **X's / red squares** for failed words that were auto-filled,
  - **number of guesses**, number of **fails**,
  - **number of hints spent** *"if this one has hints."*
  - It *"doesn't need to show every move"* — enough to convey how you did
    (e.g. *"solved in five guesses and two fails"*).

---

## Procedural generation + shareable puzzle codes (big architectural idea)

Laura's worry: puzzles are **pre-built** (currently 19, was *"16 or 30"* in her
memory), hand-authored, and *"Alex is gonna run out"* — the game has no legs if
it ships a fixed month of puzzles. (*"I didn't know if the game had legs."*)

**[LEANING, this is the engine vision]**

- **Generate puzzles algorithmically, on demand,** from a large word set
  (*"50,000 words or something"*) so each new game is *"relatively unique...
  very, very likely a unique puzzle every single time."* With ≥3 words drawn
  from tens of thousands, collisions are negligible, so **you don't have to
  track/catalog generated puzzles.**
- **Requires a categorized/tagged word list.** *"It'd be great if the Wordle
  list was just categorized, or each one of the words had several families it
  could be in, or tokens, that they could be organized by — then it could
  construct its own"* themed puzzles. **Tagging the word list with theme
  families/tokens is the enabling piece.**

### Codifying a puzzle so it can be shared as a link

Because puzzles are generated, sharing *"the same puzzle"* requires encoding it
compactly. Laura's proposed approach:

- **Every client ships the same catalog of words + clues.** A shared puzzle
  doesn't transmit the words — it transmits **references** into that catalog.
- A puzzle code specifies: **which catalog items**, and **how they cross**.
  Her words: *"Use item 73, cross it at letter 4 with item 62; cross it at
  letter 7 and 9 with..."* — i.e. ordinal IDs per word plus crossing positions
  (and the clue is implied by the catalog item).
- Encode that data structure as a compact code (**hex or similar**) embedded in
  a share link; clicking the link reconstructs and plays the identical puzzle.

> Laura's framing: *"That's not something I have to figure out"* — the engine
> defines the data structure and hands it off in a code. Treat the exact
> encoding as an implementation detail to design later; the **requirement** is:
> shareable, self-contained puzzle codes referencing a shipped catalog.

**[OPEN]** Alternative she floated and set aside: keep a growing **hand-authored
catalog** (*"puzzle 13... add a little more"*) instead of full procedural
generation. Generation is the more ambitious path; the catalog is the safe one.
Not finally decided which — but the lean is toward generation.

---

## Things to keep the same

- **[DECIDED]** **Sound effects: yes**, *"why not"* — keep the current
  synthesized sounds.
- **[DECIDED]** Overall **look/feel and experience: similar to current.**
  *"Same. Relative. Similar."* This is an evolution, not a from-scratch redesign.
- **[DECIDED]** Difficulty baseline: build it at a **not-very-hard** level,
  especially if hints are free.

---

## Open questions to resolve before/while building

- Do free hints really stay free, or do they cost score? (Lean: free, but only
  if base difficulty is gentle.)
- Procedural generation vs. growing hand-authored catalog — commit to one.
- Exact failed-word reveal rules (opt-in tap confirmed; per-crossing letter
  payout to confirm).
- Per-word guess cap number (5 vs 6) and what "losing the puzzle" vs "losing a
  word" means.
- How tiered hints interact with the per-word guess cap (e.g. does hint #1
  unlock after 3 guesses, leaving fewer guesses to win?).
- Share-graphic exact format.
- How much the theme still matters once per-word clues exist.

---

## How this maps onto the current codebase (orientation for the build)

Current stack (do not change without asking — see `INSTRUCTIONS.md`): vanilla
HTML/CSS/JS, zero deps, no build step, static-hostable. Relevant files:

- `game.js` — core game loop, grid, per-word keyboard state, locking, hints.
  The per-word Wordle board, guess caps, tiered hints, and failed-word reveal
  all land here.
- `puzzles.js` — 19 hand-authored puzzles + daily rotation. A generator and/or
  a shipped catalog + share-code decoder would live near here.
- `words.js` — generated ~80k-word dictionary for guess validation. The
  **theme-family/token tagging** would extend this (or a sibling data file).
- `scripts/validate-puzzles.cjs`, `scripts/build-wordlist.cjs` — generation
  would need analogous validation (crossing-letter conflicts, no visual word
  merges, connected grid).
- `audio.js` — keep; sounds stay.

Suggested build order if/when greenlit (smallest reviewable steps first):
1. Per-word Wordle board UI (highest-value, mostly front-end).
2. Per-word guess cap + lose-ability + failed-word opt-in reveal.
3. Tiered/earned hints (per-word clue + escalating theme hints).
4. Configurable word-length range and word count.
5. Score model + shareable result graphic.
6. Word-list theme tagging → procedural generation → shareable puzzle codes
   (the largest piece; design the catalog + encoding first).

---

*Captured 2026-06-18 from conversation. Nothing here is built yet — this is the
intent to revisit before implementation begins.*
