export interface ADSRSettings {
  attack: number;
  decay: number;
  sustain: number;
  release: number;
}

export const createKickSound = (
  audioContext: AudioContext,
  settings: ADSRSettings
): AudioBuffer => {
  const sampleRate = audioContext.sampleRate;
  const duration = settings.attack + settings.decay + settings.release;
  const bufferSize = sampleRate * duration;

  const buffer = audioContext.createBuffer(1, bufferSize, sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < bufferSize; i++) {
    const t = i / sampleRate;

    // 808-style frequency sweep: starts at ~65Hz, drops to ~35Hz
    const frequency = 65 * Math.exp(-t * 2.5) + 35 * (1 - Math.exp(-t * 2.5));

    let envelope = 0;

    // ADSR envelope
    if (t < settings.attack) {
      // Attack
      envelope = t / settings.attack;
    } else if (t < settings.attack + settings.decay) {
      // Decay
      const decayTime = t - settings.attack;
      envelope = 1 - (1 - settings.sustain) * (decayTime / settings.decay);
    } else {
      // Release
      const releaseTime = t - settings.attack - settings.decay;
      envelope =
        settings.sustain * Math.exp(-releaseTime * (3 / settings.release));
    }

    // Add some harmonic content and slight distortion
    const fundamental = Math.sin(2 * Math.PI * frequency * t);
    const harmonic2 = Math.sin(2 * Math.PI * frequency * 2 * t) * 0.3;
    const distortion = Math.tanh(fundamental * 2) * 0.4;

    data[i] = (fundamental + harmonic2 + distortion) * envelope * 0.9;
  }

  return buffer;
};

export const createSnareSound = (
  audioContext: AudioContext,
  settings: ADSRSettings
): AudioBuffer => {
  const sampleRate = audioContext.sampleRate;
  const duration = settings.attack + settings.decay + settings.release;
  const bufferSize = sampleRate * duration;

  const buffer = audioContext.createBuffer(1, bufferSize, sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < bufferSize; i++) {
    const t = i / sampleRate;
    let envelope = 0;

    // ADSR envelope
    if (t < settings.attack) {
      // Attack
      envelope = t / settings.attack;
    } else if (t < settings.attack + settings.decay) {
      // Decay
      const decayTime = t - settings.attack;
      envelope = 1 - (1 - settings.sustain) * (decayTime / settings.decay);
    } else {
      // Release
      const releaseTime = t - settings.attack - settings.decay;
      envelope =
        settings.sustain * Math.exp(-releaseTime * (5 / settings.release));
    }

    // Mix of filtered noise and tonal elements (typical 808 snare)
    const noise = Math.random() * 2 - 1;
    const tone1 = Math.sin(2 * Math.PI * 220 * t) * 0.4;
    const tone2 = Math.sin(2 * Math.PI * 150 * t) * 0.3;
    const snap = Math.sin(2 * Math.PI * 1000 * t) * 0.2; // high freq snap

    data[i] = (noise * 0.7 + tone1 + tone2 + snap) * envelope * 0.6;
  }

  return buffer;
};

export const createOpenHatSound = (
  audioContext: AudioContext,
  settings: ADSRSettings
): AudioBuffer => {
  const sampleRate = audioContext.sampleRate;
  const duration = settings.attack + settings.decay + settings.release;
  const bufferSize = sampleRate * duration;

  const buffer = audioContext.createBuffer(1, bufferSize, sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < bufferSize; i++) {
    const t = i / sampleRate;
    let envelope = 0;

    // ADSR envelope
    if (t < settings.attack) {
      // Attack
      envelope = t / settings.attack;
    } else if (t < settings.attack + settings.decay) {
      // Decay
      const decayTime = t - settings.attack;
      envelope = 1 - (1 - settings.sustain) * (decayTime / settings.decay);
    } else {
      // Release
      const releaseTime = t - settings.attack - settings.decay;
      envelope =
        settings.sustain * Math.exp(-releaseTime * (8 / settings.release));
    }

    // Mix of high-frequency noise and metallic resonances
    const noise = Math.random() * 2 - 1;
    const metallic1 = Math.sin(2 * Math.PI * 3500 * t) * 0.3;
    const metallic2 = Math.sin(2 * Math.PI * 7000 * t) * 0.2;
    const metallic3 = Math.sin(2 * Math.PI * 12000 * t) * 0.15;
    const sizzle = (Math.random() * 2 - 1) * 0.4;

    // High-pass filter effect (emphasize high frequencies)
    const highPassed =
      noise * 0.6 + metallic1 + metallic2 + metallic3 + sizzle;

    data[i] = highPassed * envelope * 0.4;
  }

  return buffer;
};

export const createClapSound = (
  audioContext: AudioContext,
  settings: ADSRSettings
): AudioBuffer => {
  const sampleRate = audioContext.sampleRate;
  const duration = settings.attack + settings.decay + settings.release;
  const bufferSize = sampleRate * duration;

  const buffer = audioContext.createBuffer(1, bufferSize, sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < bufferSize; i++) {
    const t = i / sampleRate;

    // Multiple quick bursts to simulate hand clap
    const burst1 = t < 0.01 ? 1 : 0;
    const burst2 = t > 0.01 && t < 0.025 ? 1 : 0;
    const burst3 = t > 0.025 && t < 0.04 ? 1 : 0;
    const burstEnv = burst1 + burst2 * 0.7 + burst3 * 0.5;

    let envelope = 0;

    // ADSR envelope
    if (t < settings.attack) {
      // Attack
      envelope = t / settings.attack;
    } else if (t < settings.attack + settings.decay) {
      // Decay
      const decayTime = t - settings.attack;
      envelope = 1 - (1 - settings.sustain) * (decayTime / settings.decay);
    } else {
      // Release
      const releaseTime = t - settings.attack - settings.decay;
      envelope =
        settings.sustain * Math.exp(-releaseTime * (8 / settings.release));
    }

    // Filtered noise with emphasis on mid-high frequencies
    const noise = Math.random() * 2 - 1;
    const filtered = noise * 0.8;

    data[i] = filtered * envelope * burstEnv * 0.6;
  }

  return buffer;
};

export const createCowbellSound = (
  audioContext: AudioContext,
  settings: ADSRSettings
): AudioBuffer => {
  const sampleRate = audioContext.sampleRate;
  const duration = settings.attack + settings.decay + settings.release;
  const bufferSize = sampleRate * duration;

  const buffer = audioContext.createBuffer(1, bufferSize, sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < bufferSize; i++) {
    const t = i / sampleRate;
    let envelope = 0;

    // ADSR envelope
    if (t < settings.attack) {
      // Attack
      envelope = t / settings.attack;
    } else if (t < settings.attack + settings.decay) {
      // Decay
      const decayTime = t - settings.attack;
      envelope = 1 - (1 - settings.sustain) * (decayTime / settings.decay);
    } else {
      // Release
      const releaseTime = t - settings.attack - settings.decay;
      envelope =
        settings.sustain * Math.exp(-releaseTime * (6 / settings.release));
    }

    // Metallic tones characteristic of cowbell
    const fundamental = Math.sin(2 * Math.PI * 560 * t); // Around 560Hz
    const harmonic2 = Math.sin(2 * Math.PI * 845 * t) * 0.8;
    const harmonic3 = Math.sin(2 * Math.PI * 1300 * t) * 0.6;
    const noise = (Math.random() * 2 - 1) * 0.1;

    data[i] = (fundamental + harmonic2 + harmonic3 + noise) * envelope * 0.5;
  }

  return buffer;
};

export const createRimshotSound = (
  audioContext: AudioContext,
  settings: ADSRSettings
): AudioBuffer => {
  const sampleRate = audioContext.sampleRate;
  const duration = settings.attack + settings.decay + settings.release;
  const bufferSize = sampleRate * duration;

  const buffer = audioContext.createBuffer(1, bufferSize, sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < bufferSize; i++) {
    const t = i / sampleRate;
    let envelope = 0;

    // ADSR envelope
    if (t < settings.attack) {
      // Attack
      envelope = t / settings.attack;
    } else if (t < settings.attack + settings.decay) {
      // Decay
      const decayTime = t - settings.attack;
      envelope = 1 - (1 - settings.sustain) * (decayTime / settings.decay);
    } else {
      // Release
      const releaseTime = t - settings.attack - settings.decay;
      envelope =
        settings.sustain * Math.exp(-releaseTime * (15 / settings.release));
    }

    // High frequency click with some body
    const click = Math.sin(2 * Math.PI * 2000 * t) * 0.6;
    const body = Math.sin(2 * Math.PI * 400 * t) * 0.3;
    const noise = (Math.random() * 2 - 1) * 0.4;

    data[i] = (click + body + noise) * envelope * 0.7;
  }

  return buffer;
};