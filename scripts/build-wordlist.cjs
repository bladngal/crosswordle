#!/usr/bin/env node
/* Builds words.js (the valid-guess dictionary) from the ENABLE word list.
 *
 * Usage: node scripts/build-wordlist.cjs <path-to-enable1.txt>
 * Source: https://raw.githubusercontent.com/dolph/dictionary/master/enable1.txt
 *
 * Filters to 3-8 letter words (the lengths Crosswordle puzzles use) and merges
 * in every puzzle answer so an answer can never be rejected as "not a word."
 * Don't hand-edit words.js — rerun this script instead.
 */
const fs = require("fs");
const path = require("path");
const PUZZLES = require("../puzzles.js");

const src = process.argv[2];
if (!src) {
  console.error("Usage: node scripts/build-wordlist.cjs <path-to-enable1.txt>");
  process.exit(1);
}

const words = new Set(
  fs.readFileSync(src, "utf8")
    .split(/\r?\n/)
    .filter((w) => /^[a-z]{3,8}$/.test(w))
);

PUZZLES.forEach((p) => p.words.forEach((w) => words.add(w.answer.toLowerCase())));

const sorted = [...words].sort();
const out =
  "/* Valid-guess dictionary (ENABLE word list, 3-8 letters, plus all puzzle\n" +
  " * answers). GENERATED FILE — rebuild with scripts/build-wordlist.cjs. */\n" +
  `const WORD_SET = new Set(${JSON.stringify(sorted.join(" "))}.split(" "));\n`;

const dest = path.join(__dirname, "..", "words.js");
fs.writeFileSync(dest, out);
console.log(`words.js written: ${sorted.length} words, ${(out.length / 1024).toFixed(0)} KB`);
