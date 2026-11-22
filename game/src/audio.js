// Tiny sound effects for Ember Court, synthesized with WebAudio so the game
// ships no audio files: a short blip per event, pitched by what happened.
// Everything is guarded: if the browser has no AudioContext or the player
// muted the game, play() silently does nothing.

let ctx = null;
let muted = false;

export function setMuted(value) {
  muted = value;
}

export function isMuted() {
  return muted;
}

export function unlockAudio() {
  try {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') void ctx.resume();
  } catch {
    ctx = null;
  }
}

function tone(freq, dur, type, gain) {
  if (muted || !ctx) return;
  try {
    const osc = ctx.createOscillator();
    const amp = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    amp.gain.setValueAtTime(gain, ctx.currentTime);
    amp.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    osc.connect(amp).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + dur);
  } catch {
    // Sound is decoration; a failure never breaks the game.
  }
}

export const sfx = {
  play: () => tone(520, 0.09, 'triangle', 0.12),
  hit: () => { tone(180, 0.16, 'sawtooth', 0.1); tone(120, 0.2, 'square', 0.06); },
  block: () => tone(340, 0.12, 'sine', 0.1),
  heal: () => { tone(660, 0.1, 'sine', 0.09); setTimeout(() => tone(880, 0.14, 'sine', 0.09), 90); },
  draw: () => tone(440, 0.06, 'triangle', 0.07),
  turn: () => tone(392, 0.1, 'triangle', 0.08),
  win: () => { [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => tone(f, 0.22, 'triangle', 0.11), i * 130)); },
  lose: () => { [392, 330, 262, 196].forEach((f, i) => setTimeout(() => tone(f, 0.25, 'sine', 0.1), i * 150)); },
  error: () => tone(140, 0.12, 'square', 0.07),
};
