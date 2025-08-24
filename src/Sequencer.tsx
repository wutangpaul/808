import { useState, useEffect, useRef } from "react";
import { Howl } from "howler";

type Instrument = "kick" | "snare" | "openhat" | "clap" | "cowbell" | "rimshot";

export default function Sequencer() {
  const [sequences, setSequences] = useState<Record<Instrument, boolean[]>>({
    kick: Array(16).fill(false),
    snare: Array(16).fill(false),
    openhat: Array(16).fill(false),
    clap: Array(16).fill(false),
    cowbell: Array(16).fill(false),
    rimshot: Array(16).fill(false),
  });
  const [instrumentSettings, setInstrumentSettings] = useState<
    Record<
      Instrument,
      {
        attack: number;
        decay: number;
        sustain: number;
        release: number;
        volume: number;
        muted: boolean;
      }
    >
  >({
    kick: {
      attack: 0.01,
      decay: 0.2,
      sustain: 0.7,
      release: 1.0,
      volume: 0.8,
      muted: false,
    },
    snare: {
      attack: 0.005,
      decay: 0.05,
      sustain: 0.3,
      release: 0.1,
      volume: 0.5,
      muted: false,
    },
    openhat: {
      attack: 0.01,
      decay: 0.1,
      sustain: 0.2,
      release: 0.3,
      volume: 0.4,
      muted: false,
    },
    clap: {
      attack: 0.01,
      decay: 0.05,
      sustain: 0.4,
      release: 0.2,
      volume: 0.6,
      muted: false,
    },
    cowbell: {
      attack: 0.005,
      decay: 0.1,
      sustain: 0.5,
      release: 0.2,
      volume: 0.5,
      muted: false,
    },
    rimshot: {
      attack: 0.001,
      decay: 0.02,
      sustain: 0.1,
      release: 0.06,
      volume: 0.7,
      muted: false,
    },
  });
  const [selectedInstrument, setSelectedInstrument] =
    useState<Instrument>("kick");
  const [isPlaying, setIsPlaying] = useState(false);
  const [bpm, setBpm] = useState(120);
  const [currentStep, setCurrentStep] = useState(0);
  const [reverbAmount, setReverbAmount] = useState(0.2);
  const intervalRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const instrumentSettingsRef = useRef(instrumentSettings);
  const sequencesRef = useRef(sequences);
  const masterGainRef = useRef<GainNode | null>(null);
  const reverbNodeRef = useRef<ConvolverNode | null>(null);
  const dryGainRef = useRef<GainNode | null>(null);
  const wetGainRef = useRef<GainNode | null>(null);

  // Update refs whenever settings or sequences change
  useEffect(() => {
    instrumentSettingsRef.current = instrumentSettings;
  }, [instrumentSettings]);

  useEffect(() => {
    sequencesRef.current = sequences;
  }, [sequences]);

  // Initialize audio context and nodes on component mount
  useEffect(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
    }
    initializeAudioNodes();
  }, []);

  // Update reverb amount in real-time
  useEffect(() => {
    if (dryGainRef.current && wetGainRef.current) {
      dryGainRef.current.gain.setValueAtTime(
        1 - reverbAmount,
        audioContextRef.current?.currentTime || 0
      );
      wetGainRef.current.gain.setValueAtTime(
        reverbAmount,
        audioContextRef.current?.currentTime || 0
      );
    }
  }, [reverbAmount]);

  // Create reverb impulse response
  const createReverbImpulse = (duration: number, decay: number) => {
    if (!audioContextRef.current) return null;

    const sampleRate = audioContextRef.current.sampleRate;
    const length = sampleRate * duration;
    const impulse = audioContextRef.current.createBuffer(2, length, sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const channelData = impulse.getChannelData(channel);
      for (let i = 0; i < length; i++) {
        const t = i / sampleRate;
        const envelope = Math.pow(1 - t / duration, decay);
        channelData[i] = (Math.random() * 2 - 1) * envelope;
      }
    }

    return impulse;
  };

  // Initialize audio nodes
  const initializeAudioNodes = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
    }

    if (!masterGainRef.current) {
      // Create master bus
      masterGainRef.current = audioContextRef.current.createGain();
      masterGainRef.current.gain.value = 1;

      // Create reverb chain
      reverbNodeRef.current = audioContextRef.current.createConvolver();
      reverbNodeRef.current.buffer = createReverbImpulse(2, 3);

      dryGainRef.current = audioContextRef.current.createGain();
      wetGainRef.current = audioContextRef.current.createGain();

      // Connect master bus to parallel dry/wet chain
      masterGainRef.current.connect(dryGainRef.current);
      masterGainRef.current.connect(wetGainRef.current);

      // Connect dry path directly to output
      dryGainRef.current.connect(audioContextRef.current.destination);

      // Connect wet path through reverb to output
      wetGainRef.current.connect(reverbNodeRef.current);
      reverbNodeRef.current.connect(audioContextRef.current.destination);

      // Set initial reverb mix
      dryGainRef.current.gain.value = 1 - reverbAmount;
      wetGainRef.current.gain.value = reverbAmount;
    }
  };

  // Create 808 snare sound
  const createSnareSound = (settings: {
    attack: number;
    decay: number;
    sustain: number;
    release: number;
  }) => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
    }

    const audioContext = audioContextRef.current;
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

  // Create 808 kick drum sound
  const createKickSound = (settings: {
    attack: number;
    decay: number;
    sustain: number;
    release: number;
  }) => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
    }

    const audioContext = audioContextRef.current;
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

  // Create 808 open hat sound
  const createOpenHatSound = (settings: {
    attack: number;
    decay: number;
    sustain: number;
    release: number;
  }) => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
    }

    const audioContext = audioContextRef.current;
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

  // Create clap sound
  const createClapSound = (settings: {
    attack: number;
    decay: number;
    sustain: number;
    release: number;
  }) => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
    }

    const audioContext = audioContextRef.current;
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

  // Create cowbell sound
  const createCowbellSound = (settings: {
    attack: number;
    decay: number;
    sustain: number;
    release: number;
  }) => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
    }

    const audioContext = audioContextRef.current;
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

  // Create rimshot sound
  const createRimshotSound = (settings: {
    attack: number;
    decay: number;
    sustain: number;
    release: number;
  }) => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
    }

    const audioContext = audioContextRef.current;
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

  const playInstrument = async (instrument: Instrument) => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
    }

    // Resume context if suspended
    if (audioContextRef.current.state === "suspended") {
      await audioContextRef.current.resume();
    }

    // Initialize audio nodes if not already done
    initializeAudioNodes();

    const source = audioContextRef.current.createBufferSource();
    const gainNode = audioContextRef.current.createGain();

    // Pass current settings to sound generators
    switch (instrument) {
      case "kick":
        source.buffer = createKickSound(instrumentSettingsRef.current.kick);
        gainNode.gain.value = instrumentSettingsRef.current.kick.volume;
        break;
      case "snare":
        source.buffer = createSnareSound(instrumentSettingsRef.current.snare);
        gainNode.gain.value = instrumentSettingsRef.current.snare.volume;
        break;
      case "openhat":
        source.buffer = createOpenHatSound(
          instrumentSettingsRef.current.openhat
        );
        gainNode.gain.value = instrumentSettingsRef.current.openhat.volume;
        break;
      case "clap":
        source.buffer = createClapSound(instrumentSettingsRef.current.clap);
        gainNode.gain.value = instrumentSettingsRef.current.clap.volume;
        break;
      case "cowbell":
        source.buffer = createCowbellSound(
          instrumentSettingsRef.current.cowbell
        );
        gainNode.gain.value = instrumentSettingsRef.current.cowbell.volume;
        break;
      case "rimshot":
        source.buffer = createRimshotSound(
          instrumentSettingsRef.current.rimshot
        );
        gainNode.gain.value = instrumentSettingsRef.current.rimshot.volume;
        break;
    }

    source.connect(gainNode);

    // Connect to master bus (which handles reverb routing)
    if (masterGainRef.current) {
      gainNode.connect(masterGainRef.current);
    } else {
      gainNode.connect(audioContextRef.current.destination);
    }

    source.start();
  };

  const toggleStep = (stepIndex: number) => {
    const newSequences = { ...sequences };
    newSequences[selectedInstrument][stepIndex] =
      !newSequences[selectedInstrument][stepIndex];
    setSequences(newSequences);
  };

  const toggleInstrumentMute = (instrument: Instrument) => {
    setInstrumentSettings((prev) => ({
      ...prev,
      [instrument]: { ...prev[instrument], muted: !prev[instrument].muted },
    }));
  };

  const togglePlayback = async () => {
    // Resume audio context if suspended
    if (audioContextRef.current?.state === "suspended") {
      await audioContextRef.current.resume();
    }
    setIsPlaying(!isPlaying);
  };

  const loadRockPattern = () => {
    setSequences({
      kick: [
        true,
        false,
        false,
        false,
        true,
        false,
        false,
        false,
        true,
        false,
        false,
        false,
        true,
        false,
        false,
        false,
      ],
      snare: [
        false,
        false,
        false,
        false,
        true,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        true,
        false,
        false,
        false,
      ],
      openhat: [
        false,
        false,
        true,
        false,
        false,
        false,
        true,
        false,
        false,
        false,
        true,
        false,
        false,
        false,
        true,
        false,
      ],
      clap: Array(16).fill(false),
      cowbell: Array(16).fill(false),
      rimshot: Array(16).fill(false),
    });
  };

  useEffect(() => {
    if (isPlaying) {
      const stepDuration = (60 / bpm / 4) * 1000; // 16th notes
      intervalRef.current = window.setInterval(() => {
        setCurrentStep((prev) => {
          const nextStep = (prev + 1) % 16;
          // Get current sequences and settings from refs
          const currentSequences = sequencesRef.current;
          const currentSettings = instrumentSettingsRef.current;

          // Play sounds for active steps in all sequences (only if instrument not muted)
          if (currentSequences.kick[prev] && !currentSettings.kick.muted) {
            playInstrument("kick");
          }
          if (currentSequences.snare[prev] && !currentSettings.snare.muted) {
            playInstrument("snare");
          }
          if (
            currentSequences.openhat[prev] &&
            !currentSettings.openhat.muted
          ) {
            playInstrument("openhat");
          }
          if (currentSequences.clap[prev] && !currentSettings.clap.muted) {
            playInstrument("clap");
          }
          if (
            currentSequences.cowbell[prev] &&
            !currentSettings.cowbell.muted
          ) {
            playInstrument("cowbell");
          }
          if (
            currentSequences.rimshot[prev] &&
            !currentSettings.rimshot.muted
          ) {
            playInstrument("rimshot");
          }
          return nextStep;
        });
      }, stepDuration);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setCurrentStep(0);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, bpm]);

  const getButtonColor = (index: number) => {
    if (index < 4) {
      return "bg-red-500";
    } else if (index < 8) {
      return "bg-orange-500";
    } else if (index < 12) {
      return "bg-yellow-500";
    } else {
      return "bg-white";
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <label
            htmlFor="instrument"
            className="text-white font-medium"
          ></label>
          <select
            id="instrument"
            value={selectedInstrument}
            onChange={(e) =>
              setSelectedInstrument(e.target.value as Instrument)
            }
            className="px-2 py-1 rounded border border-gray-400 text-center text-red-500"
          >
            <option value="kick">Kick</option>
            <option value="snare">Snare</option>
            <option value="openhat">Open Hat</option>
            <option value="clap">Clap</option>
            <option value="cowbell">Cowbell</option>
            <option value="rimshot">Rimshot</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="attack" className="text-white font-medium">
            Attack:
          </label>
          <input
            id="attack"
            type="range"
            min="0.001"
            max="0.1"
            step="0.001"
            value={instrumentSettings[selectedInstrument].attack}
            onChange={(e) =>
              setInstrumentSettings((prev) => ({
                ...prev,
                [selectedInstrument]: {
                  ...prev[selectedInstrument],
                  attack: Number(e.target.value),
                },
              }))
            }
            className="w-20"
          />
          <span className="text-white text-xs w-12">
            {(instrumentSettings[selectedInstrument].attack * 1000).toFixed(0)}
            ms
          </span>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="decay" className="text-white font-medium">
            Decay:
          </label>
          <input
            id="decay"
            type="range"
            min="0.01"
            max="0.5"
            step="0.01"
            value={instrumentSettings[selectedInstrument].decay}
            onChange={(e) =>
              setInstrumentSettings((prev) => ({
                ...prev,
                [selectedInstrument]: {
                  ...prev[selectedInstrument],
                  decay: Number(e.target.value),
                },
              }))
            }
            className="w-20"
          />
          <span className="text-white text-xs w-12">
            {(instrumentSettings[selectedInstrument].decay * 1000).toFixed(0)}ms
          </span>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="sustain" className="text-white font-medium">
            Sustain:
          </label>
          <input
            id="sustain"
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={instrumentSettings[selectedInstrument].sustain}
            onChange={(e) =>
              setInstrumentSettings((prev) => ({
                ...prev,
                [selectedInstrument]: {
                  ...prev[selectedInstrument],
                  sustain: Number(e.target.value),
                },
              }))
            }
            className="w-20"
          />
          <span className="text-white text-xs w-12">
            {Math.round(instrumentSettings[selectedInstrument].sustain * 100)}%
          </span>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="release" className="text-white font-medium">
            Release:
          </label>
          <input
            id="release"
            type="range"
            min="0.01"
            max="2"
            step="0.01"
            value={instrumentSettings[selectedInstrument].release}
            onChange={(e) =>
              setInstrumentSettings((prev) => ({
                ...prev,
                [selectedInstrument]: {
                  ...prev[selectedInstrument],
                  release: Number(e.target.value),
                },
              }))
            }
            className="w-20"
          />
          <span className="text-white text-xs w-12">
            {(instrumentSettings[selectedInstrument].release * 1000).toFixed(0)}
            ms
          </span>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="volume" className="text-white font-medium">
            Volume:
          </label>
          <input
            id="volume"
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={instrumentSettings[selectedInstrument].volume}
            onChange={(e) =>
              setInstrumentSettings((prev) => ({
                ...prev,
                [selectedInstrument]: {
                  ...prev[selectedInstrument],
                  volume: Number(e.target.value),
                },
              }))
            }
            className="w-20"
          />
          <span className="text-white text-xs w-8">
            {Math.round(instrumentSettings[selectedInstrument].volume * 100)}%
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => toggleInstrumentMute(selectedInstrument)}
            className={`px-4 py-2 rounded font-semibold transition-colors ${
              instrumentSettings[selectedInstrument].muted
                ? "bg-red-600 hover:bg-red-700 text-white"
                : "bg-green-600 hover:bg-green-700 text-white"
            }`}
          >
            {instrumentSettings[selectedInstrument].muted ? "MUTED" : "ACTIVE"}
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={togglePlayback}
          className="h-16 w-36 rounded-lg font-semibold transition-colors bg-orange-300 hover:bg-orange-400 text-amber-900"
        >
          {isPlaying ? "Stop" : "Start"}
        </button>

        {sequences[selectedInstrument].map((isActive, index) => (
          <button
            key={index}
            onClick={() => toggleStep(index)}
            className={`h-16 w-16 rounded-lg border-2 transition-all relative ${getButtonColor(
              index
            )} ${
              currentStep === index && isPlaying
                ? "border-yellow-400 border-4"
                : "border-gray-400"
            }`}
          >
            <div
              className={`absolute top-1 left-1/2 transform -translate-x-1/2 h-3 w-3 rounded-full shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] ${
                isActive && currentStep === index && isPlaying
                  ? "bg-red-500"
                  : isActive
                  ? "bg-yellow-300"
                  : currentStep === index && isPlaying
                  ? "bg-red-500"
                  : "bg-transparent"
              }`}
            />
          </button>
        ))}
      </div>

      <div className="mb-6 flex items-center gap-6 justify-center">
        <div className="flex items-center gap-2">
          <label htmlFor="reverb" className="text-white font-medium">
            Reverb:
          </label>
          <input
            id="reverb"
            type="range"
            min="0"
            max="0.8"
            step="0.1"
            value={reverbAmount}
            onChange={(e) => setReverbAmount(Number(e.target.value))}
            className="w-20"
          />
          <span className="text-white text-xs w-8">
            {Math.round(reverbAmount * 100)}%
          </span>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="bpm" className="text-white font-medium">
            BPM:
          </label>
          <input
            id="bpm"
            type="number"
            value={bpm}
            onChange={(e) => setBpm(Number(e.target.value))}
            min="60"
            max="200"
            className="w-16 px-2 py-1 rounded border border-gray-400 text-center text-red-500"
          />
        </div>
      </div>

      <div className="flex justify-center">
        <button
          onClick={loadRockPattern}
          className="px-4 py-2 rounded-lg font-semibold transition-colors bg-blue-500 hover:bg-blue-600 text-white"
        >
          Load Rock Pattern
        </button>
      </div>
    </div>
  );
}
