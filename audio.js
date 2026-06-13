/* Tiny synthesized sound effects via Web Audio — no audio files needed.
 * Everything is short sine/triangle tones so it stays gentle and un-annoying. */
const Sound = (() => {
  let ctx = null;
  let muted = localStorage.getItem("cw-muted") === "1";

  function ensure() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }

  function tone({ f = 440, d = 0.12, type = "sine", g = 0.07, t = 0, slide = 0 }) {
    if (muted) return;
    let c;
    try { c = ensure(); } catch { return; }
    const osc = c.createOscillator();
    const gain = c.createGain();
    const start = c.currentTime + t;
    osc.type = type;
    osc.frequency.setValueAtTime(f, start);
    if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(40, f + slide), start + d);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(g, start + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + d);
    osc.connect(gain).connect(c.destination);
    osc.start(start);
    osc.stop(start + d + 0.05);
  }

  return {
    get muted() { return muted; },
    toggle() {
      muted = !muted;
      localStorage.setItem("cw-muted", muted ? "1" : "0");
      return muted;
    },
    unlock() { try { ensure(); } catch {} },
    tick()  { tone({ f: 620, d: 0.05, type: "triangle", g: 0.045 }); },
    del()   { tone({ f: 300, d: 0.05, type: "triangle", g: 0.04 }); },
    error() {
      tone({ f: 165, d: 0.16, type: "sawtooth", g: 0.05 });
      tone({ f: 124, d: 0.16, type: "sawtooth", g: 0.05, t: 0.08 });
    },
    reveal(i, result) {
      const base = result === "correct" ? 660 : result === "present" ? 520 : 330;
      tone({ f: base + i * 28, d: 0.07, g: 0.04 });
    },
    solved() {
      [523, 659, 784, 1047].forEach((f, i) =>
        tone({ f, d: 0.16, type: "triangle", g: 0.07, t: i * 0.09 }));
    },
    win() {
      [392, 523, 659, 784, 1047, 1319].forEach((f, i) =>
        tone({ f, d: 0.22, type: "triangle", g: 0.08, t: i * 0.11 }));
      tone({ f: 262, d: 0.9, type: "sine", g: 0.05, t: 0.45 });
      tone({ f: 330, d: 0.9, type: "sine", g: 0.04, t: 0.45 });
    },
  };
})();
