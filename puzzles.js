/* Crosswordle puzzle data.
 *
 * Each puzzle: a small themed set of 3-5 common words laid out crossword-style.
 * Word coords: row/col of first letter; dir is "across" or "down".
 * Layouts are machine-checked by scripts/validate-puzzles.cjs — run it after
 * adding or editing any puzzle.
 */
const PUZZLES = [
  {
    theme: "Classic Elements",
    words: [
      { answer: "FIRE",  row: 0, col: 0, dir: "across", clue: "Keep marshmallows handy" },
      { answer: "EARTH", row: 0, col: 3, dir: "down",   clue: "The ground beneath your feet" },
      { answer: "AIR",   row: 1, col: 3, dir: "across", clue: "You're breathing it right now" },
      { answer: "WATER", row: 3, col: 1, dir: "across", clue: "Fills the oceans" },
    ],
  },
  {
    theme: "True Colors",
    words: [
      { answer: "ORANGE", row: 2, col: 0, dir: "across", clue: "A fruit and a color" },
      { answer: "PURPLE", row: 0, col: 1, dir: "down",   clue: "The royal hue" },
      { answer: "GREEN",  row: 0, col: 5, dir: "down",   clue: "Fresh-cut grass" },
      { answer: "RED",    row: 5, col: 0, dir: "across", clue: "Stop sign shade" },
    ],
  },
  {
    theme: "In the Kitchen",
    words: [
      { answer: "WHISK", row: 0, col: 0, dir: "across", clue: "Beats eggs in a hurry" },
      { answer: "SPOON", row: 0, col: 3, dir: "down",   clue: "Best tool for soup" },
      { answer: "KNIFE", row: 4, col: 2, dir: "across", clue: "Sharpest thing in the drawer" },
      { answer: "STOVE", row: 0, col: 6, dir: "down",   clue: "Where pots get hot" },
    ],
  },
  {
    theme: "Wild Weather",
    words: [
      { answer: "STORM", row: 0, col: 0, dir: "across", clue: "Thunder's big event" },
      { answer: "RAIN",  row: 0, col: 3, dir: "down",   clue: "April showers" },
      { answer: "WIND",  row: 3, col: 1, dir: "across", clue: "Felt but never seen" },
      { answer: "DEW",   row: 3, col: 4, dir: "down",   clue: "Morning droplets on the grass" },
    ],
  },
  {
    theme: "Fruit Stand",
    words: [
      { answer: "GRAPE",  row: 0, col: 0, dir: "across", clue: "Grows in bunches" },
      { answer: "PEACH",  row: 0, col: 3, dir: "down",   clue: "Fuzzy and sweet" },
      { answer: "CHERRY", row: 3, col: 3, dir: "across", clue: "Tops a sundae" },
      { answer: "LEMON",  row: 2, col: 5, dir: "down",   clue: "Puckeringly sour" },
    ],
  },
  {
    theme: "Strike Up the Band",
    words: [
      { answer: "GUITAR", row: 0, col: 0, dir: "across", clue: "Six strings, big strums" },
      { answer: "TUBA",   row: 0, col: 3, dir: "down",   clue: "The big brass bottom" },
      { answer: "PIANO",  row: 3, col: 1, dir: "across", clue: "Eighty-eight keys" },
      { answer: "ORGAN",  row: 3, col: 5, dir: "down",   clue: "Pipes up in church" },
    ],
  },
  {
    theme: "Night Sky",
    words: [
      { answer: "COMET", row: 0, col: 0, dir: "across", clue: "Icy visitor with a tail" },
      { answer: "MOON",  row: 0, col: 2, dir: "down",   clue: "Earth's nightlight" },
      { answer: "SUN",   row: 3, col: 0, dir: "across", clue: "Center of attention" },
      { answer: "STAR",  row: 3, col: 0, dir: "down",   clue: "Twinkle, twinkle" },
    ],
  },
  {
    theme: "On the Farm",
    words: [
      { answer: "HORSE", row: 0, col: 0, dir: "across", clue: "The neigh-sayer" },
      { answer: "SHEEP", row: 0, col: 3, dir: "down",   clue: "Wool provider" },
      { answer: "PIG",   row: 4, col: 3, dir: "across", clue: "Loves a good mud bath" },
      { answer: "GOAT",  row: 4, col: 5, dir: "down",   clue: "Will eat almost anything" },
    ],
  },
  {
    theme: "In the Forest",
    words: [
      { answer: "BIRCH", row: 0, col: 0, dir: "across", clue: "Papery white bark" },
      { answer: "CEDAR", row: 0, col: 3, dir: "down",   clue: "Closet-scenting wood" },
      { answer: "MAPLE", row: 3, col: 2, dir: "across", clue: "Syrup source" },
      { answer: "PINE",  row: 0, col: 6, dir: "down",   clue: "Stays green all winter" },
    ],
  },
  {
    theme: "Breakfast Time",
    words: [
      { answer: "TOAST",   row: 0, col: 0, dir: "across", clue: "Bread, upgraded" },
      { answer: "SYRUP",   row: 0, col: 3, dir: "down",   clue: "Sticky pancake topper" },
      { answer: "PANCAKE", row: 4, col: 3, dir: "across", clue: "Flat and flippable" },
      { answer: "BACON",   row: 3, col: 7, dir: "down",   clue: "Sizzles in the pan" },
      { answer: "EGGS",    row: 4, col: 9, dir: "down",   clue: "Scrambled or sunny-side up" },
    ],
  },
  {
    theme: "Under the Sea",
    words: [
      { answer: "SHARK", row: 0, col: 0, dir: "across", clue: "Fin above the water" },
      { answer: "KELP",  row: 0, col: 4, dir: "down",   clue: "An underwater forest" },
      { answer: "PEARL", row: 3, col: 4, dir: "across", clue: "Oyster's treasure" },
      { answer: "REEF",  row: 3, col: 7, dir: "down",   clue: "Colorful coral city" },
      { answer: "WHALE", row: 5, col: 3, dir: "across", clue: "Biggest animal on Earth" },
    ],
  },
  {
    theme: "Game On",
    words: [
      { answer: "TENNIS", row: 0, col: 0, dir: "across", clue: "Love means zero here" },
      { answer: "SOCCER", row: 0, col: 5, dir: "down",   clue: "The world's football" },
      { answer: "RUGBY",  row: 5, col: 5, dir: "across", clue: "Tackles without pads" },
      { answer: "GOLF",   row: 5, col: 7, dir: "down",   clue: "Fore!" },
    ],
  },
  {
    theme: "In the Garden",
    words: [
      { answer: "FLOWER", row: 0, col: 0, dir: "down",   clue: "A bloom on a stem" },
      { answer: "FENCE",  row: 0, col: 0, dir: "across", clue: "Marks the yard's edge" },
      { answer: "ONION",  row: 2, col: 0, dir: "across", clue: "Layered bulb that brings tears" },
      { answer: "EARTH",  row: 4, col: 0, dir: "across", clue: "Soil you dig in" },
    ],
  },
  {
    theme: "Outer Space",
    words: [
      { answer: "PLANET", row: 0, col: 0, dir: "down",   clue: "Earth is one" },
      { answer: "PLUTO",  row: 0, col: 0, dir: "across", clue: "The demoted dwarf planet" },
      { answer: "ALIEN",  row: 2, col: 0, dir: "across", clue: "Little green visitor" },
      { answer: "TITAN",  row: 5, col: 0, dir: "across", clue: "Saturn's biggest moon" },
    ],
  },
  {
    theme: "Body Parts",
    words: [
      { answer: "FINGER", row: 0, col: 0, dir: "down",   clue: "Ten of these on two hands" },
      { answer: "FACE",   row: 0, col: 0, dir: "across", clue: "Where your smile lives" },
      { answer: "NOSE",   row: 2, col: 0, dir: "across", clue: "It knows a good smell" },
      { answer: "ELBOW",  row: 4, col: 0, dir: "across", clue: "The arm's hinge" },
    ],
  },
  {
    theme: "At the Zoo",
    words: [
      { answer: "PARROT", row: 0, col: 0, dir: "down",   clue: "Bird that repeats you" },
      { answer: "PANDA",  row: 0, col: 0, dir: "across", clue: "Black-and-white bamboo lover" },
      { answer: "RHINO",  row: 2, col: 0, dir: "across", clue: "Horned heavyweight" },
      { answer: "OTTER",  row: 4, col: 0, dir: "across", clue: "Playful river swimmer" },
    ],
  },
  {
    theme: "In the Veggie Patch",
    words: [
      { answer: "CARROT", row: 0, col: 0, dir: "down",   clue: "Orange root a rabbit loves" },
      { answer: "CELERY", row: 0, col: 0, dir: "across", clue: "Crunchy green stalk" },
      { answer: "RADISH", row: 2, col: 0, dir: "across", clue: "Small peppery red root" },
      { answer: "ONION",  row: 4, col: 0, dir: "across", clue: "Layered bulb that brings tears" },
    ],
  },
  {
    theme: "Sweet Treats",
    words: [
      { answer: "CANDY", row: 0, col: 0, dir: "across", clue: "Halloween bag filler" },
      { answer: "DONUT", row: 0, col: 3, dir: "down",   clue: "Ring with a hole" },
      { answer: "TARTS", row: 4, col: 3, dir: "across", clue: "Little open-faced pies" },
      { answer: "SUGAR", row: 4, col: 7, dir: "down",   clue: "Makes it all sweet" },
    ],
  },
  {
    theme: "Camping Trip",
    words: [
      { answer: "FOREST", row: 0, col: 0, dir: "down",   clue: "Where the trees crowd in" },
      { answer: "FIRE",   row: 0, col: 0, dir: "across", clue: "Roast marshmallows over it" },
      { answer: "RIVER",  row: 2, col: 0, dir: "across", clue: "Flowing water you might paddle" },
      { answer: "SCOUT",  row: 4, col: 0, dir: "across", clue: "Merit-badge earner" },
    ],
  },
];

if (typeof module !== "undefined") module.exports = PUZZLES;
