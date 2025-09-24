// src/audio/sfx.js
// Web Audio SFX — sintetizados via Web Audio API (sem assets).
// Uso: import SFX from "../audio/sfx";  SFX.play("attack"); SFX.setEnabled(true); SFX.setVolume(0.7);

const isBrowser = typeof window !== "undefined";
const hasAudio = isBrowser && (window.AudioContext || window.webkitAudioContext);
// Vite/ESM: use import.meta.env para detectar ambiente
const isDev = !!(
  typeof import.meta !== "undefined" &&
  import.meta.env &&
  (import.meta.env.DEV || import.meta.env.MODE !== "production")
);

// Stub para SSR/ambientes sem Web Audio
let SFX = {
  enabled: true,
  volume: 0.9,
  play: () => {},
  setEnabled: () => {},
  setVolume: () => {},
};

// Se houver Web Audio, sobrescreve o stub pela implementação real
if (hasAudio) {
  SFX = (() => {
    let ctx = null;
    let masterGain = null;
    let enabled = true;
    let volume = 0.9;

    const ensureCtx = () => {
      if (ctx) return ctx;
      const AC = window.AudioContext || window.webkitAudioContext;
      ctx = new AC();
      masterGain = ctx.createGain();
      masterGain.gain.value = enabled ? volume : 0;
      masterGain.connect(ctx.destination);
      return ctx;
    };

    const resume = async () => {
      const c = ensureCtx();
      if (c.state === "suspended") {
        try {
          await c.resume();
        } catch (e) {
          if (isDev) console.debug("[SFX] resume falhou:", e);
        }
      }
    };

    const now = () => ensureCtx().currentTime;

    const env = (node, a = 0.001, d = 0.12, s = 0.0, r = 0.08, peak = 1.0) => {
      const t = now();
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(peak, t + a);
      g.gain.linearRampToValueAtTime(s * peak, t + a + d);
      g.gain.exponentialRampToValueAtTime(0.0001, t + a + d + r);
      node.connect(g);
      g.connect(masterGain);
      return g;
    };

    // white noise buffer
    let _noiseBuffer = null;
    const noiseBuffer = () => {
      if (_noiseBuffer) return _noiseBuffer;
      const length = 44100;
      const buffer = ensureCtx().createBuffer(1, length, 44100);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * 0.65;
      _noiseBuffer = buffer;
      return _noiseBuffer;
    };

    const playNoise = (duration = 0.15, filterType = "lowpass", freqFrom = 800, freqTo = 2200) => {
      const t = now();
      const src = ctx.createBufferSource();
      src.buffer = noiseBuffer();

      const filter = ctx.createBiquadFilter();
      filter.type = filterType;
      filter.frequency.setValueAtTime(freqFrom, t);
      filter.frequency.exponentialRampToValueAtTime(freqTo, t + duration);

      src.connect(filter);
      env(filter, 0.002, duration * 0.6, 0.0, duration * 0.4, 0.9);
      src.start(t);
      src.stop(t + duration + 0.02);
    };

    const tone = (freq = 440, type = "sine", duration = 0.12, adsr = { a: 0.003, d: 0.08, s: 0.0, r: 0.06 }, gainMul = 0.9) => {
      const t = now();
      const osc = ctx.createOscillator();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, t);
      env(osc, adsr.a, adsr.d, adsr.s, adsr.r, gainMul);
      osc.start(t);
      osc.stop(t + adsr.a + adsr.d + adsr.r + duration);
    };

    const chirp = (f0, f1, duration = 0.2, type = "sine", gainMul = 0.9) => {
      const t = now();
      const o = ctx.createOscillator();
      o.type = type;
      o.frequency.setValueAtTime(f0, t);
      o.frequency.exponentialRampToValueAtTime(Math.max(50, f1), t + duration);
      env(o, 0.005, duration * 0.6, 0.0, duration * 0.4, gainMul);
      o.start(t);
      o.stop(t + duration + 0.05);
    };

    const click = () => tone(220, "square", 0.05, { a: 0.001, d: 0.05, s: 0, r: 0.04 }, 0.5);

    const PRESETS = {
      ui: () => click(),
      attack: () => { playNoise(0.12, "bandpass", 400, 2400); tone(120, "triangle", 0.08, { a: 0.002, d: 0.09, s: 0, r: 0.07 }, 0.6); },
      crit: () => { chirp(420, 900, 0.18, "sawtooth", 0.6); playNoise(0.08, "highpass", 800, 3200); },
      hit: () => tone(90, "sine", 0.06, { a: 0.001, d: 0.07, s: 0, r: 0.06 }, 0.7),
      charge: () => { chirp(240, 720, 0.35, "sine", 0.55); tone(720, "sine", 0.18, { a: 0.02, d: 0.18, s: 0, r: 0.1 }, 0.25); },
      heal: () => { tone(523.25, "sine", 0.14, { a: 0.003, d: 0.12, s: 0, r: 0.1 }, 0.38); setTimeout(() => tone(659.25, "sine", 0.12, { a: 0.003, d: 0.1, s: 0, r: 0.1 }, 0.34), 70); },
      shield: () => { playNoise(0.18, "lowpass", 3000, 700); tone(330, "triangle", 0.1, { a: 0.005, d: 0.1, s: 0, r: 0.08 }, 0.4); },
      cleanse: () => { tone(392, "sine", 0.1); setTimeout(() => tone(523, "sine", 0.1), 80); setTimeout(() => tone(659, "sine", 0.1), 160); },
      poison_tick: () => { tone(170, "sine", 0.06, { a: 0.001, d: 0.07, s: 0, r: 0.05 }, 0.45); },
      burn_tick: () => { playNoise(0.09, "bandpass", 1800, 900); },
      regen_tick: () => { tone(520, "sine", 0.08, { a: 0.002, d: 0.1, s: 0, r: 0.08 }, 0.28); },
      paralysis_skip: () => { chirp(900, 160, 0.22, "square", 0.5); },
      ko: () => { tone(98, "sine", 0.2, { a: 0.01, d: 0.3, s: 0, r: 0.2 }, 0.7); },
    };

    const play = (name) => {
      if (!enabled) return;
      resume();
      (PRESETS[name] || PRESETS.ui)();
    };

    const setEnabled = (v) => {
      enabled = !!v;
      ensureCtx();
      masterGain.gain.setValueAtTime(enabled ? volume : 0, now());
      try { localStorage.setItem("sfx_enabled", JSON.stringify(enabled)); }
      catch (e) { if (isDev) console.debug("[SFX] ls setEnabled:", e); }
    };

    const setVolume = (v) => {
      volume = Math.max(0, Math.min(1, v));
      ensureCtx();
      masterGain.gain.setValueAtTime(enabled ? volume : 0, now());
      try { localStorage.setItem("sfx_volume", JSON.stringify(volume)); }
      catch (e) { if (isDev) console.debug("[SFX] ls setVolume:", e); }
    };

    // restore prefs
    try {
      const e = JSON.parse(localStorage.getItem("sfx_enabled") || "true");
      const vol = JSON.parse(localStorage.getItem("sfx_volume") || "0.9");
      enabled = e; volume = vol;
    } catch (e) {
      if (isDev) console.debug("[SFX] ls restore:", e);
    }

    // user-gesture unlock
    const _unlock = () => { resume(); };
    window.addEventListener("pointerdown", _unlock, { once: true, passive: true });
    window.addEventListener("keydown", _unlock, { once: true });

    return {
      play,
      setEnabled,
      setVolume,
      get enabled() { return enabled; },
      get volume() { return volume; },
    };
  })();
}

export default SFX;
