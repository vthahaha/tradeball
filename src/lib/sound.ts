// Pack-opening sound, synthesised with Web Audio: no files to download. Every sound starts from a
// tap, so browsers allow it. Muting is remembered per device.
import type { Rarity } from "./catalog/types";

const KEY = "g7-sound";
let ctx: AudioContext | null = null;

export function soundOn() {
  try {
    return localStorage.getItem(KEY) !== "off";
  } catch {
    return true;
  }
}
export function setSoundOn(on: boolean) {
  try {
    localStorage.setItem(KEY, on ? "on" : "off");
  } catch {
    // private mode: the toggle still works for this visit
  }
}

function audio() {
  if (!soundOn() || typeof window === "undefined") return null;
  const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  ctx ??= new AC();
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function tone(a: AudioContext, freq: number, start: number, dur: number, gain: number, type: OscillatorType = "sine") {
  const o = a.createOscillator();
  const g = a.createGain();
  o.type = type;
  o.frequency.value = freq;
  g.gain.setValueAtTime(0, a.currentTime + start);
  g.gain.linearRampToValueAtTime(gain, a.currentTime + start + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + start + dur);
  o.connect(g).connect(a.destination);
  o.start(a.currentTime + start);
  o.stop(a.currentTime + start + dur + 0.05);
}

/** The card flicking over: a short band of filtered noise. */
export function playFlip() {
  const a = audio();
  if (!a) return;
  const len = Math.floor(a.sampleRate * 0.07);
  const buf = a.createBuffer(1, len, a.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len) ** 2;
  const src = a.createBufferSource();
  src.buffer = buf;
  const f = a.createBiquadFilter();
  f.type = "bandpass";
  f.frequency.value = 2400;
  f.Q.value = 0.8;
  const g = a.createGain();
  g.gain.value = 0.35;
  src.connect(f).connect(g).connect(a.destination);
  src.start();
}

/** The build-up before a big card turns: a rising hum, longer the rarer the card. */
export function playCharge(seconds: number) {
  const a = audio();
  if (!a) return;
  const o = a.createOscillator();
  const g = a.createGain();
  o.type = "triangle";
  o.frequency.setValueAtTime(110, a.currentTime);
  o.frequency.exponentialRampToValueAtTime(440, a.currentTime + seconds);
  g.gain.setValueAtTime(0.0001, a.currentTime);
  g.gain.exponentialRampToValueAtTime(0.08, a.currentTime + seconds * 0.9);
  g.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + seconds + 0.08);
  o.connect(g).connect(a.destination);
  o.start();
  o.stop(a.currentTime + seconds + 0.1);
}

const CHIMES: Partial<Record<Rarity, number[]>> = {
  rare: [659],
  epic: [523, 784],
  legendary: [523, 659, 784, 1047],
  mythic: [523, 659, 784, 1047, 1319],
  grail: [392, 523, 659, 784, 1047, 1319, 1568],
};

/** The reveal: nothing for commons, a chime that grows with the rarity, numbered cards ring longer. */
export function playReveal(rarity: Rarity, numbered = false) {
  const a = audio();
  if (!a) return;
  const notes = CHIMES[rarity] ?? (numbered ? [784] : []);
  notes.forEach((f, i) => tone(a, f, i * 0.07, numbered || rarity === "grail" ? 1.4 : 0.7, 0.12));
  if (rarity === "grail" || rarity === "mythic") tone(a, notes[0] / 2, 0, 1.8, 0.08, "triangle");
}

/** A short buzz on phones that support it (Android; iOS ignores it). */
export function buzz(pattern: number | number[]) {
  try {
    navigator.vibrate?.(pattern);
  } catch {
    // not supported
  }
}
