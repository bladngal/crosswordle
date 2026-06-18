/* Crosswordle game engine.
 *
 * Core ideas:
 *  - Every word keeps its OWN keyboard knowledge (state.kb[wordIndex]),
 *    so the on-screen keyboard swaps when the active word changes.
 *  - Green letters lock into the grid permanently (state.locked), and a
 *    locked cell counts as solved progress for BOTH words that share it.
 *  - Daily puzzle = days since epoch, rotating through PUZZLES.
 */
(() => {
  "use strict";

  const EPOCH = new Date(2026, 5, 1); // June 1 2026 = puzzle #1
  const REVEAL_STEP = 280;            // ms between cell flips
  const KB_ROWS = ["QWERTYUIOP", "ASDFGHJKL", "⏎ZXCVBNM⌫"];
  const RANK = { absent: 0, present: 1, correct: 2 };

  // ---------- daily puzzle selection ----------
  const now = new Date();
  const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dayIndex = Math.max(0, Math.round((dayStart - EPOCH) / 86400000));
  const dayKey = `${dayStart.getFullYear()}-${dayStart.getMonth() + 1}-${dayStart.getDate()}`;

  let puzzleNumber = dayIndex + 1;
  let puzzle = PUZZLES[dayIndex % PUZZLES.length];
  let freePlay = false;

  // ---------- state ----------
  let state, cells, rows, cols, numbers;

  function freshState() {
    return {
      locked: {},                                  // "r,c" -> letter
      kb: puzzle.words.map(() => ({})),            // per-word letter -> status
      residue: puzzle.words.map(() => ({})),       // per-word pos -> amber letter from last guess
      attempts: puzzle.words.map(() => []),        // per-word guess history: [{ guess[], results[] }]
      guesses: puzzle.words.map(() => 0),
      solved: puzzle.words.map(() => false),
      totalGuesses: 0,
      won: false,
    };
  }

  // Transient (not saved)
  let active = null;      // word index
  let pending = [];       // typed letters for the active word's unlocked cells
  let history = [];       // keystroke log: {letter} or {lock: pos}, for exact backspace
  let consumed = new Set(); // locked positions whose keystroke was absorbed this turn
  let revealing = false;

  function buildGrid() {
    cells = new Map(); // "r,c" -> { r, c, words: [{wi, pos}], el }
    rows = 0; cols = 0;
    puzzle.words.forEach((w, wi) => {
      for (let pos = 0; pos < w.answer.length; pos++) {
        const r = w.dir === "down" ? w.row + pos : w.row;
        const c = w.dir === "across" ? w.col + pos : w.col;
        const key = `${r},${c}`;
        if (!cells.has(key)) cells.set(key, { r, c, words: [] });
        cells.get(key).words.push({ wi, pos });
        rows = Math.max(rows, r + 1);
        cols = Math.max(cols, c + 1);
      }
    });
    // Crossword-style numbering: scan row-major, number every word-start cell.
    numbers = new Map(); // wi -> number
    let n = 0;
    const starts = new Map(); // "r,c" -> number
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const cell = cells.get(`${r},${c}`);
      if (!cell) continue;
      const starting = cell.words.filter(({ wi, pos }) => pos === 0);
      if (starting.length) {
        n++;
        starts.set(`${r},${c}`, n);
        starting.forEach(({ wi }) => numbers.set(wi, n));
      }
    }
    cells.starts = starts;
  }

  function wordCells(wi) {
    const w = puzzle.words[wi];
    const out = [];
    for (let pos = 0; pos < w.answer.length; pos++) {
      const r = w.dir === "down" ? w.row + pos : w.row;
      const c = w.dir === "across" ? w.col + pos : w.col;
      out.push(cells.get(`${r},${c}`));
    }
    return out;
  }

  function unlockedPositions(wi) {
    return wordCells(wi)
      .map((cell, pos) => (state.locked[`${cell.r},${cell.c}`] ? -1 : pos))
      .filter((p) => p >= 0);
  }

  // ---------- rendering ----------
  const $ = (id) => document.getElementById(id);
  const gridEl = $("grid");
  const wbEl = $("word-board");

  function sizeCells() {
    const availW = Math.min(window.innerWidth, 560) - 28;
    const availH = window.innerHeight * 0.40; // leave room for the per-word board below
    const gap = 5;
    const size = Math.max(26, Math.min(
      54,
      Math.floor((availW - (cols - 1) * gap) / cols),
      Math.floor((availH - (rows - 1) * gap) / rows)
    ));
    document.documentElement.style.setProperty("--cell", size + "px");

    // Per-word board cells: sized so the longest word fits on one row.
    const maxLen = Math.max(...puzzle.words.map((w) => w.answer.length));
    const wb = Math.max(22, Math.min(34, Math.floor((availW - (maxLen - 1) * gap) / maxLen)));
    document.documentElement.style.setProperty("--wb", wb + "px");
  }

  function renderGrid() {
    gridEl.innerHTML = "";
    gridEl.style.gridTemplateRows = `repeat(${rows}, var(--cell))`;
    gridEl.style.gridTemplateColumns = `repeat(${cols}, var(--cell))`;
    for (const cell of cells.values()) {
      const el = document.createElement("div");
      el.className = "cell";
      el.style.gridArea = `${cell.r + 1} / ${cell.c + 1}`;
      const num = cells.starts.get(`${cell.r},${cell.c}`);
      if (num) {
        const span = document.createElement("span");
        span.className = "num";
        span.textContent = num;
        el.appendChild(span);
      }
      const letter = document.createElement("span");
      letter.className = "letter";
      el.appendChild(letter);
      const marks = document.createElement("span");
      marks.className = "marks";
      el.appendChild(marks);
      el.addEventListener("click", () => onCellTap(cell));
      cell.el = el;
      gridEl.appendChild(el);
    }
    refreshCells();
  }

  function refreshCells() {
    const activeSet = new Set();
    let cursorKey = null;
    if (active !== null && !state.won) {
      const wc = wordCells(active);
      wc.forEach((cell) => activeSet.add(`${cell.r},${cell.c}`));
      const un = unlockedPositions(active);
      if (pending.length < un.length) {
        const cell = wc[un[pending.length]];
        cursorKey = `${cell.r},${cell.c}`;
      }
    }
    for (const cell of cells.values()) {
      const key = `${cell.r},${cell.c}`;
      const lockedLetter = state.locked[key];
      let shown = lockedLetter || "";
      let residue = false;
      let marks = "";
      if (!lockedLetter && active !== null && activeSet.has(key)) {
        const { pos } = cell.words.find((w) => w.wi === active) ?? {};
        const tried = state.residue[active][pos] || ""; // every amber letter tried here, in order
        const un = unlockedPositions(active);
        const slot = un.indexOf(pos);
        if (slot >= 0 && slot < pending.length) {
          shown = pending[slot];
          marks = tried; // keep the warnings visible while typing over them
        } else if (tried) {
          // Most recent attempt stays big and type-over-able; older attempts
          // shrink to pencil marks along the bottom of the cell.
          shown = tried[tried.length - 1];
          residue = true;
          marks = tried.slice(0, -1);
        }
      }
      cell.el.querySelector(".letter").textContent = shown;
      cell.el.querySelector(".marks").textContent = marks.slice(-4); // cap so tiny cells don't overflow
      cell.el.classList.toggle("locked", !!lockedLetter);
      cell.el.classList.toggle("residue", residue);
      cell.el.classList.toggle("active", activeSet.has(key) && !lockedLetter && !residue);
      cell.el.classList.toggle("cursor", key === cursorKey);
    }
    renderWordBoard();
  }

  // ---------- per-word Wordle board ----------
  // A clean horizontal view of the active word: one row per past guess (colored
  // like Wordle) plus a live input row. The crossword grid stays the spatial
  // map; this board is the easy-to-read single-word view Laura asked for.
  function boardRow(len, cellFn) {
    let html = "";
    for (let pos = 0; pos < len; pos++) {
      const { ch, cls } = cellFn(pos);
      html += `<div class="wb-cell ${cls}">${ch}</div>`;
    }
    return `<div class="wb-row">${html}</div>`;
  }

  function renderWordBoard() {
    if (active === null || state.won) { wbEl.hidden = true; wbEl.innerHTML = ""; return; }
    const wi = active;
    const len = puzzle.words[wi].answer.length;
    const attempts = state.attempts[wi];
    const un = unlockedPositions(wi);
    const wc = wordCells(wi);
    const rows = [];

    // Past guesses, colored by their stored result.
    attempts.forEach((a) => {
      rows.push(boardRow(len, (pos) => ({ ch: a.guess[pos], cls: "wb-" + a.results[pos] })));
    });

    // Live input row (skip once the word is solved — its last guess is the win).
    if (!state.solved[wi]) {
      const cursorPos = pending.length < un.length ? un[pending.length] : -1;
      rows.push(boardRow(len, (pos) => {
        const lockedLetter = state.locked[`${wc[pos].r},${wc[pos].c}`];
        if (lockedLetter) return { ch: lockedLetter, cls: "wb-locked" };       // known from a crossing
        const slot = un.indexOf(pos);
        if (slot >= 0 && slot < pending.length) return { ch: pending[slot], cls: "wb-filled" };
        return { ch: "", cls: pos === cursorPos ? "wb-empty wb-cursor" : "wb-empty" };
      }));
    }

    if (!rows.length) { wbEl.hidden = true; wbEl.innerHTML = ""; return; } // solved purely by crossings
    wbEl.hidden = false;
    wbEl.innerHTML = rows.join("");
  }

  // ---------- keyboard ----------
  const kbEl = $("keyboard");

  function renderKeyboard() {
    kbEl.innerHTML = "";
    const kb = active !== null ? state.kb[active] : {};
    KB_ROWS.forEach((rowStr) => {
      const row = document.createElement("div");
      row.className = "krow";
      for (const ch of rowStr) {
        const key = document.createElement("button");
        key.className = "key";
        if (ch === "⏎") {
          key.classList.add("wide");
          key.textContent = "ENTER";
          key.dataset.key = "Enter";
        } else if (ch === "⌫") {
          key.classList.add("wide");
          key.textContent = "⌫";
          key.dataset.key = "Backspace";
        } else {
          key.textContent = ch;
          key.dataset.key = ch;
          if (kb[ch]) key.classList.add("kb-" + kb[ch]);
        }
        key.addEventListener("click", () => handleKey(key.dataset.key));
        row.appendChild(key);
      }
      kbEl.appendChild(row);
    });
  }

  function kbUpgrade(wi, letter, status) {
    const cur = state.kb[wi][letter];
    if (!cur || RANK[status] > RANK[cur]) state.kb[wi][letter] = status;
  }

  // ---------- word info bar ----------
  function renderWordBar() {
    const label = $("word-label");
    const hintBtn = $("btn-hint");
    const clueEl = $("clue");
    clueEl.hidden = true;
    if (active === null) {
      label.innerHTML = state.won ? "🎉 Puzzle complete!" : "Tap a word to begin";
      hintBtn.hidden = true;
      return;
    }
    const w = puzzle.words[active];
    const num = numbers.get(active);
    const dir = w.dir === "across" ? "Across" : "Down";
    const status = state.solved[active]
      ? ` · <strong style="color:var(--correct)">✓ solved</strong>`
      : state.guesses[active] ? ` · ${state.guesses[active]} ${state.guesses[active] === 1 ? "guess" : "guesses"}` : "";
    label.innerHTML = `<strong>${num} ${dir}</strong> · ${w.answer.length} letters${status}`;
    hintBtn.hidden = state.solved[active];
  }

  // ---------- interactions ----------
  function onCellTap(cell) {
    if (revealing) return;
    Sound.unlock();
    const wis = cell.words.map((w) => w.wi);
    let next;
    if (wis.length > 1 && wis.includes(active)) {
      next = wis[(wis.indexOf(active) + 1) % wis.length]; // toggle direction on crossings
    } else {
      next = wis.includes(active) ? active : wis[0];
    }
    selectWord(next);
  }

  function selectWord(wi) {
    active = wi;
    pending = [];
    history = [];
    consumed = new Set();
    refreshCells();
    renderKeyboard();
    renderWordBar();
  }

  function popCell(el) {
    el.classList.add("pop");
    setTimeout(() => el.classList.remove("pop"), 140);
  }

  function handleKey(k) {
    if (revealing || state.won) return;
    Sound.unlock();
    if (k === "Enter") return submitGuess();
    if (k === "Backspace") {
      if (active === null || !history.length) return;
      const last = history.pop();
      if (last.lock !== undefined) consumed.delete(last.lock);
      else pending.pop();
      Sound.del();
      refreshCells();
      return;
    }
    if (!/^[A-Z]$/.test(k)) return;
    if (active === null || state.solved[active]) {
      const firstUnsolved = state.solved.indexOf(false);
      if (firstUnsolved === -1) return;
      if (active === null || state.solved[active]) selectWord(firstUnsolved);
    }
    const un = unlockedPositions(active);
    if (pending.length >= un.length) return;
    const wc = wordCells(active);

    // Full-word typing support: fingers want to type the WHOLE word, locked
    // letters included. If this keystroke matches a not-yet-consumed locked
    // letter sitting between the last filled cell and the next empty one,
    // absorb it — the locked letter never changes, the cell just pulses.
    const prevUn = pending.length ? un[pending.length - 1] : -1;
    const nextUn = un[pending.length];
    for (let pos = prevUn + 1; pos < nextUn; pos++) {
      if (!consumed.has(pos) && state.locked[`${wc[pos].r},${wc[pos].c}`] === k) {
        consumed.add(pos);
        history.push({ lock: pos });
        Sound.tick();
        popCell(wc[pos].el);
        return;
      }
    }

    pending.push(k);
    history.push({ letter: k });
    Sound.tick();
    refreshCells();
    popCell(wc[nextUn].el);
  }

  let toastTimer;
  function showToast(msg) {
    const t = $("toast");
    t.textContent = msg;
    t.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => (t.hidden = true), 1400);
  }

  function shakeActiveWord() {
    if (active === null) return;
    Sound.error();
    wordCells(active).forEach((cell) => {
      cell.el.classList.add("shake");
      setTimeout(() => cell.el.classList.remove("shake"), 450);
    });
  }

  // Standard Wordle scoring with duplicate-letter handling.
  function evaluateGuess(guess, answer) {
    const n = answer.length;
    const res = new Array(n).fill("absent");
    const remaining = {};
    for (let i = 0; i < n; i++) {
      if (guess[i] === answer[i]) res[i] = "correct";
      else remaining[answer[i]] = (remaining[answer[i]] || 0) + 1;
    }
    for (let i = 0; i < n; i++) {
      if (res[i] === "correct") continue;
      if (remaining[guess[i]] > 0) { res[i] = "present"; remaining[guess[i]]--; }
    }
    return res;
  }

  function submitGuess() {
    if (active === null || state.solved[active]) return;
    const wi = active;
    const w = puzzle.words[wi];
    const un = unlockedPositions(wi);
    if (pending.length < un.length) {
      showToast("Not enough letters");
      return shakeActiveWord();
    }

    const wc = wordCells(wi);
    const guess = wc.map((cell, pos) => {
      const lockedLetter = state.locked[`${cell.r},${cell.c}`];
      return lockedLetter || pending[un.indexOf(pos)];
    });

    // Guesses must be real words (WORD_SET ships in words.js; if it ever
    // fails to load, play degrades gracefully to no dictionary check).
    if (typeof WORD_SET !== "undefined" && !WORD_SET.has(guess.join("").toLowerCase())) {
      showToast("Not in word list");
      return shakeActiveWord();
    }

    const results = evaluateGuess(guess, w.answer);

    state.guesses[wi]++;
    state.totalGuesses++;
    revealing = true;

    // Flip cells one at a time, color at the midpoint of each flip.
    results.forEach((res, pos) => {
      const el = wc[pos].el;
      setTimeout(() => {
        el.classList.add("flip");
        Sound.reveal(pos, res);
      }, pos * REVEAL_STEP);
      setTimeout(() => {
        el.querySelector(".letter").textContent = guess[pos];
        el.classList.add("flash-" + res);
      }, pos * REVEAL_STEP + 200);
    });

    setTimeout(() => finalizeGuess(wi, guess, results), results.length * REVEAL_STEP + 650);
  }

  function finalizeGuess(wi, guess, results) {
    const wc = wordCells(wi);
    state.attempts[wi].push({ guess: guess.slice(), results: results.slice() });
    results.forEach((res, pos) => {
      const cell = wc[pos];
      cell.el.classList.remove("flip", "flash-correct", "flash-present", "flash-absent");
      if (res === "correct") lockCell(cell, guess[pos]);
      else if (res === "present") {
        // Accumulate every right-letter-wrong-spot attempt at this position
        // (a string in tried order, most recent last; no repeats).
        const tried = state.residue[wi][pos] || "";
        if (!tried.includes(guess[pos])) state.residue[wi][pos] = tried + guess[pos];
      }
      kbUpgrade(wi, guess[pos], res);
    });
    pending = [];
    history = [];
    consumed = new Set();
    revealing = false;

    const newlySolved = checkSolvedWords();
    refreshCells();
    renderKeyboard();
    renderWordBar();
    saveState();

    if (state.solved.every(Boolean)) return onWin();
    if (newlySolved.includes(wi)) {
      // Auto-advance to the next unsolved word after a beat.
      setTimeout(() => {
        if (revealing || state.won) return;
        for (let i = 1; i <= puzzle.words.length; i++) {
          const next = (wi + i) % puzzle.words.length;
          if (!state.solved[next]) return selectWord(next);
        }
      }, 700);
    }
  }

  function lockCell(cell, letter) {
    state.locked[`${cell.r},${cell.c}`] = letter;
    // A locked letter is confirmed knowledge for every word crossing this cell.
    cell.words.forEach(({ wi }) => kbUpgrade(wi, letter, "correct"));
  }

  function checkSolvedWords() {
    const newly = [];
    puzzle.words.forEach((w, wi) => {
      if (state.solved[wi]) return;
      const done = wordCells(wi).every((cell) => state.locked[`${cell.r},${cell.c}`]);
      if (done) { state.solved[wi] = true; newly.push(wi); }
    });
    if (newly.length && !state.solved.every(Boolean)) Sound.solved();
    return newly;
  }

  // ---------- win / stats / share ----------
  function onWin() {
    state.won = true;
    active = null;
    refreshCells();
    renderKeyboard();
    renderWordBar();
    saveState();
    if (!freePlay) recordWin();
    Sound.win();
    setTimeout(showWinModal, 600);
  }

  function loadStats() {
    try { return JSON.parse(localStorage.getItem("cw-stats")) || {}; } catch { return {}; }
  }

  function recordWin() {
    const stats = loadStats();
    if (stats.lastWinKey === dayKey) return; // already counted today
    const yesterday = new Date(dayStart - 86400000);
    const yKey = `${yesterday.getFullYear()}-${yesterday.getMonth() + 1}-${yesterday.getDate()}`;
    stats.wins = (stats.wins || 0) + 1;
    stats.streak = stats.lastWinKey === yKey ? (stats.streak || 0) + 1 : 1;
    stats.best = Math.min(stats.best || Infinity, state.totalGuesses);
    stats.lastWinKey = dayKey;
    localStorage.setItem("cw-stats", JSON.stringify(stats));
  }

  function showWinModal() {
    const g = state.totalGuesses;
    $("win-summary").textContent =
      `${freePlay ? puzzle.theme : `Crosswordle #${puzzleNumber} — ${puzzle.theme}`} · solved in ${g} ${g === 1 ? "guess" : "guesses"}`;
    const list = $("win-words");
    list.innerHTML = "";
    puzzle.words.forEach((w, wi) => {
      const row = document.createElement("div");
      const gc = state.guesses[wi];
      row.innerHTML = `<strong>${w.answer}</strong><span>${gc ? `${gc} ${gc === 1 ? "guess" : "guesses"}` : "solved by crossings ✨"}</span>`;
      list.appendChild(row);
    });
    $("overlay-win").hidden = false;
  }

  function shareResult() {
    const text = `🧩 Crosswordle #${puzzleNumber} — ${puzzle.theme}\n✅ Solved in ${state.totalGuesses} guesses!`;
    if (navigator.share) {
      navigator.share({ text }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(text);
      const btn = $("btn-share");
      const old = btn.textContent;
      btn.textContent = "Copied!";
      setTimeout(() => (btn.textContent = old), 1500);
    }
  }

  // ---------- persistence ----------
  const saveKey = () => `cw-state-${dayKey}`;

  function saveState() {
    if (freePlay) return;
    localStorage.setItem(saveKey(), JSON.stringify(state));
  }

  function loadState() {
    try {
      const saved = JSON.parse(localStorage.getItem(saveKey()));
      if (saved && saved.kb?.length === puzzle.words.length) {
        saved.residue ??= puzzle.words.map(() => ({}));  // states saved before this field existed
        saved.attempts ??= puzzle.words.map(() => []);   // guess history added in the board redesign
        return saved;
      }
    } catch {}
    return null;
  }

  // ---------- free play ----------
  function playAnother() {
    const others = PUZZLES.filter((p) => p !== puzzle);
    puzzle = others[Math.floor(Math.random() * others.length)];
    freePlay = true;
    state = freshState();
    active = null;
    pending = [];
    $("overlay-win").hidden = true;
    setupBoard();
  }

  // ---------- setup ----------
  function setupBoard() {
    buildGrid();
    sizeCells();
    renderGrid();
    renderKeyboard();
    renderWordBar();
    $("theme-name").textContent = puzzle.theme;
    $("puzzle-no").textContent = freePlay ? "Free play" : `#${puzzleNumber}`;
    if (!state.won) selectWord(0);
    if (state.won && !freePlay) setTimeout(showWinModal, 400);
  }

  function init() {
    state = loadState() || freshState();

    $("btn-hint").addEventListener("click", () => {
      if (active === null) return;
      const clueEl = $("clue");
      clueEl.textContent = `“${puzzle.words[active].clue}”`;
      clueEl.hidden = !clueEl.hidden;
    });

    $("btn-help").addEventListener("click", () => ($("overlay-help").hidden = false));
    $("btn-stats").addEventListener("click", () => {
      const s = loadStats();
      $("stat-wins").textContent = s.wins || 0;
      $("stat-streak").textContent = s.streak || 0;
      $("stat-best").textContent = s.best || "–";
      $("overlay-stats").hidden = false;
    });

    const soundBtn = $("btn-sound");
    soundBtn.classList.toggle("muted", Sound.muted);
    soundBtn.addEventListener("click", () => soundBtn.classList.toggle("muted", Sound.toggle()));

    $("btn-share").addEventListener("click", shareResult);
    $("btn-another").addEventListener("click", playAnother);

    document.querySelectorAll(".overlay").forEach((ov) => {
      ov.addEventListener("click", (e) => {
        if (e.target === ov || e.target.hasAttribute("data-close")) ov.hidden = true;
      });
    });

    document.addEventListener("keydown", (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "Enter" || e.key === "Backspace") { e.preventDefault(); handleKey(e.key); }
      else if (/^[a-zA-Z]$/.test(e.key)) handleKey(e.key.toUpperCase());
    });

    window.addEventListener("resize", () => { sizeCells(); });

    setupBoard();

    if (!localStorage.getItem("cw-seen-help")) {
      $("overlay-help").hidden = false;
      localStorage.setItem("cw-seen-help", "1");
    }
  }

  init();
})();
