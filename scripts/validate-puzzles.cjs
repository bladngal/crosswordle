#!/usr/bin/env node
/* Validates every puzzle layout in puzzles.js:
 *  - crossing cells must agree on their letter
 *  - words must not run into each other end-to-start
 *  - adjacent occupied cells must belong to a shared word (no accidental
 *    side-by-side words that visually merge, e.g. T above RAIN reading TRAIN)
 *  - all words must form one connected grid
 * Exits non-zero on any error. Run: node scripts/validate-puzzles.cjs
 */
const PUZZLES = require("../puzzles.js");

let failures = 0;

function cellsOf(word) {
  const cells = [];
  for (let i = 0; i < word.answer.length; i++) {
    const r = word.dir === "down" ? word.row + i : word.row;
    const c = word.dir === "across" ? word.col + i : word.col;
    cells.push({ r, c, letter: word.answer[i] });
  }
  return cells;
}

PUZZLES.forEach((puzzle, pi) => {
  const errors = [];
  const grid = new Map(); // "r,c" -> { letter, words: [wi] }

  puzzle.words.forEach((w, wi) => {
    if (!/^[A-Z]{3,}$/.test(w.answer)) errors.push(`word ${wi} "${w.answer}" must be A-Z, length >= 3`);
    if (w.row < 0 || w.col < 0) errors.push(`word ${wi} "${w.answer}" has negative coords`);
    cellsOf(w).forEach(({ r, c, letter }) => {
      const key = `${r},${c}`;
      const existing = grid.get(key);
      if (existing) {
        if (existing.letter !== letter)
          errors.push(`conflict at (${r},${c}): "${existing.letter}" vs "${letter}" from "${w.answer}"`);
        existing.words.push(wi);
      } else {
        grid.set(key, { letter, words: [wi] });
      }
    });
  });

  // Run-on check: the cell just before a word's start / after its end must be empty.
  puzzle.words.forEach((w, wi) => {
    const len = w.answer.length;
    const before = w.dir === "across" ? `${w.row},${w.col - 1}` : `${w.row - 1},${w.col}`;
    const after = w.dir === "across" ? `${w.row},${w.col + len}` : `${w.row + len},${w.col}`;
    if (grid.has(before)) errors.push(`"${w.answer}" runs on: occupied cell just before its start`);
    if (grid.has(after)) errors.push(`"${w.answer}" runs on: occupied cell just after its end`);
  });

  // Adjacency check: two horizontally adjacent cells must share an across word;
  // vertically adjacent cells must share a down word.
  for (const [key, cell] of grid) {
    const [r, c] = key.split(",").map(Number);
    const checks = [
      { nkey: `${r},${c + 1}`, dir: "across" },
      { nkey: `${r + 1},${c}`, dir: "down" },
    ];
    for (const { nkey, dir } of checks) {
      const n = grid.get(nkey);
      if (!n) continue;
      const shared = cell.words.some(
        (wi) => n.words.includes(wi) && puzzle.words[wi].dir === dir
      );
      if (!shared)
        errors.push(`cells (${key}) and (${nkey}) touch ${dir === "across" ? "horizontally" : "vertically"} without sharing a ${dir} word`);
    }
  }

  // Connectivity: every word reachable from word 0 through shared cells.
  const adj = puzzle.words.map(() => new Set());
  for (const cell of grid.values()) {
    for (const a of cell.words) for (const b of cell.words) if (a !== b) adj[a].add(b);
  }
  const seen = new Set([0]);
  const queue = [0];
  while (queue.length) for (const n of adj[queue.shift()]) if (!seen.has(n)) { seen.add(n); queue.push(n); }
  if (seen.size !== puzzle.words.length) errors.push(`grid is disconnected (${seen.size}/${puzzle.words.length} words reachable)`);

  // Render the grid for eyeballing.
  let maxR = 0, maxC = 0;
  for (const key of grid.keys()) {
    const [r, c] = key.split(",").map(Number);
    maxR = Math.max(maxR, r); maxC = Math.max(maxC, c);
  }
  const lines = [];
  for (let r = 0; r <= maxR; r++) {
    let line = "";
    for (let c = 0; c <= maxC; c++) line += (grid.get(`${r},${c}`)?.letter ?? "·") + " ";
    lines.push("   " + line);
  }

  const label = `#${pi + 1} "${puzzle.theme}" (${puzzle.words.map((w) => w.answer).join(", ")})`;
  if (errors.length) {
    failures++;
    console.error(`✗ ${label}`);
    errors.forEach((e) => console.error(`   ERROR: ${e}`));
  } else {
    console.log(`✓ ${label}  [${maxR + 1}x${maxC + 1}]`);
  }
  console.log(lines.join("\n") + "\n");
});

if (failures) {
  console.error(`${failures} puzzle(s) failed validation`);
  process.exit(1);
}
console.log(`All ${PUZZLES.length} puzzles valid.`);
