import { useState, useEffect, useRef, useCallback } from "react";
import type { Instrument, InstrumentSettings } from "./types";
import {
  initializeAudioContext,
  setupMasterBus,
  resumeAudioContext,
  createDelayEffect,
  createPhaserEffect,
} from "./audio/audioUtils";
import {
  optimizeForAudioPerformance,
  preventAudioDropouts,
  setPriorityHints,
  getCPUOptimizationTips,
} from "./audio/performanceUtils";
import {
  createKickSound,
  createSnareSound,
  createOpenHatSound,
  createClapSound,
  createCowbellSound,
  createRimshotSound,
} from "./audio/drumSounds";
import SequencerControls from "./components/SequencerControls";
import StepButtons from "./components/StepButtons";
import MasterControls from "./components/MasterControls";

export default function Sequencer() {
  const [sequences, setSequences] = useState<Record<Instrument, boolean[]>>({
    kick: Array(32).fill(false),
    snare: Array(32).fill(false),
    openhat: Array(32).fill(false),
    clap: Array(32).fill(false),
    cowbell: Array(32).fill(false),
    rimshot: Array(32).fill(false),
  });
  const [fillSequences, setFillSequences] = useState<Record<Instrument, boolean[]>>({
    kick: Array(32).fill(false),
    snare: Array(32).fill(false),
    openhat: Array(32).fill(false),
    clap: Array(32).fill(false),
    cowbell: Array(32).fill(false),
    rimshot: Array(32).fill(false),
  });
  const [fillMode, setFillMode] = useState(false);
  const [instrumentSettings, setInstrumentSettings] = useState<Record<Instrument, InstrumentSettings>>({
    kick: {
      attack: 0.001,
      decay: 0.3,
      sustain: 0.2,
      release: 0.8,
      volume: 1.2,
      muted: false,
      tone: 0.7, // Slightly warm kick
    },
    snare: {
      attack: 0.001,
      decay: 0.15,
      sustain: 0.0,
      release: 0.25,
      volume: 0.8,
      muted: false,
      tone: 0.6, // Balanced snare
    },
    openhat: {
      attack: 0.001,
      decay: 0.05,
      sustain: 0.3,
      release: 0.4,
      volume: 0.6,
      muted: false,
      tone: 0.8, // Bright hi-hat
    },
    clap: {
      attack: 0.001,
      decay: 0.08,
      sustain: 0.1,
      release: 0.3,
      volume: 0.7,
      muted: false,
      tone: 0.5, // Mid-range clap
    },
    cowbell: {
      attack: 0.001,
      decay: 0.06,
      sustain: 0.4,
      release: 0.5,
      volume: 0.15,
      muted: false,
      tone: 0.9, // Very bright cowbell
    },
    rimshot: {
      attack: 0.001,
      decay: 0.03,
      sustain: 0.0,
      release: 0.15,
      volume: 0.4,
      muted: false,
      tone: 0.4, // Darker rimshot
    },
  });
  const [selectedInstrument, setSelectedInstrument] =
    useState<Instrument>("kick");
  const [isPlaying, setIsPlaying] = useState(false);
  const [bpm, setBpm] = useState(120);
  const [currentStep, setCurrentStep] = useState(0);
  const [reverbAmount, setReverbAmount] = useState(0.2);
  const [delayTime, setDelayTime] = useState(0.25);
  const [delayFeedback, setDelayFeedback] = useState(0.3);
  const [delayMix, setDelayMix] = useState(0.0);
  const [phaserRate, setPhaserRate] = useState(0.5);
  const [phaserDepth, setPhaserDepth] = useState(0.8);
  const [phaserMix, setPhaserMix] = useState(0.3);
  const intervalRef = useRef<number | null>(null);
  const nextStepTimeRef = useRef<number>(0);
  const lookahead = 25.0; // How frequently to call scheduling function (ms)
  const scheduleAheadTime = 0.1; // How far ahead to schedule audio (sec)
  const audioContextRef = useRef<AudioContext | null>(null);
  const instrumentSettingsRef = useRef(instrumentSettings);
  const sequencesRef = useRef(sequences);
  const fillSequencesRef = useRef(fillSequences);
  const fillModeRef = useRef(fillMode);
  const masterGainRef = useRef<GainNode | null>(null);
  const reverbNodeRef = useRef<ConvolverNode | null>(null);
  const dryGainRef = useRef<GainNode | null>(null);
  const wetGainRef = useRef<GainNode | null>(null);
  const masterDelayRef = useRef<ReturnType<typeof createDelayEffect> | null>(null);
  const masterPhaserRef = useRef<ReturnType<typeof createPhaserEffect> | null>(null);
  const wakeLockRef = useRef<{ requestWakeLock: () => Promise<void>; releaseWakeLock: () => void } | null>(null);
  const [performanceMode, setPerformanceMode] = useState(false);

  // Update refs whenever settings or sequences change
  useEffect(() => {
    instrumentSettingsRef.current = instrumentSettings;
  }, [instrumentSettings]);

  useEffect(() => {
    sequencesRef.current = sequences;
  }, [sequences]);

  useEffect(() => {
    fillSequencesRef.current = fillSequences;
  }, [fillSequences]);

  useEffect(() => {
    fillModeRef.current = fillMode;
  }, [fillMode]);

  // Update master delay settings
  useEffect(() => {
    if (masterDelayRef.current && audioContextRef.current) {
      const currentTime = audioContextRef.current.currentTime;
      masterDelayRef.current.delayNode.delayTime.setValueAtTime(delayTime, currentTime);
      masterDelayRef.current.feedbackGain.gain.setValueAtTime(delayFeedback, currentTime);
      masterDelayRef.current.dryGain.gain.setValueAtTime(1 - delayMix, currentTime);
      masterDelayRef.current.wetGain.gain.setValueAtTime(delayMix, currentTime);
    }
  }, [delayTime, delayFeedback, delayMix]);

  // Update master phaser settings
  useEffect(() => {
    if (masterPhaserRef.current && audioContextRef.current) {
      const currentTime = audioContextRef.current.currentTime;
      masterPhaserRef.current.lfo.frequency.setValueAtTime(phaserRate, currentTime);
      masterPhaserRef.current.lfoGain.gain.setValueAtTime(phaserDepth * 800, currentTime);
      masterPhaserRef.current.dryGain.gain.setValueAtTime(Math.sqrt(1 - phaserMix), currentTime);
      masterPhaserRef.current.wetGain.gain.setValueAtTime(Math.sqrt(phaserMix), currentTime);
    }
  }, [phaserRate, phaserDepth, phaserMix]);


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

  // Initialize audio nodes
  const initializeAudioNodes = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = initializeAudioContext();
    }

    if (!masterGainRef.current) {
      // Initialize master delay effect
      masterDelayRef.current = createDelayEffect(
        audioContextRef.current,
        delayTime,
        delayFeedback,
        delayMix
      );

      // Initialize master phaser effect  
      masterPhaserRef.current = createPhaserEffect(
        audioContextRef.current,
        phaserRate,
        phaserDepth,
        phaserMix
      );

      // Setup master bus (reverb)
      const nodes = setupMasterBus(audioContextRef.current);
      masterGainRef.current = nodes.masterGain;
      reverbNodeRef.current = nodes.reverbNode;
      dryGainRef.current = nodes.dryGain;
      wetGainRef.current = nodes.wetGain;

      // Chain effects: masterGain -> delay -> phaser -> reverb bus
      masterGainRef.current.disconnect();
      masterGainRef.current.connect(masterDelayRef.current.inputGain);
      masterDelayRef.current.outputGain.connect(masterPhaserRef.current.inputGain);
      masterPhaserRef.current.outputGain.connect(dryGainRef.current);
      masterPhaserRef.current.outputGain.connect(wetGainRef.current);

      // Set initial reverb mix
      dryGainRef.current.gain.value = 1 - reverbAmount;
      wetGainRef.current.gain.value = reverbAmount;
    }
  }, [delayTime, delayFeedback, delayMix, phaserRate, phaserDepth, phaserMix, reverbAmount]);

  // Initialize audio context and nodes on component mount
  useEffect(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = initializeAudioContext();
      
      // Initialize performance optimizations
      optimizeForAudioPerformance();
      wakeLockRef.current = preventAudioDropouts();
      setPriorityHints();
      
      // Log CPU optimization tips for user
      const cpuTips = getCPUOptimizationTips();
      console.log(`🎵 Audio Performance Tips for ${cpuTips.os}:`, cpuTips.tips);
    }
    initializeAudioNodes();
  }, [initializeAudioNodes]);

  // Schedule instrument to play at specific time
  const scheduleInstrument = useCallback(async (instrument: Instrument, time: number) => {
    if (!audioContextRef.current) {
      audioContextRef.current = initializeAudioContext();
    }

    // Resume context if suspended
    await resumeAudioContext(audioContextRef.current);

    // Initialize audio nodes if not already done
    initializeAudioNodes();

    const source = audioContextRef.current.createBufferSource();
    const gainNode = audioContextRef.current.createGain();

    // Pass current settings to sound generators
    switch (instrument) {
      case "kick":
        source.buffer = createKickSound(audioContextRef.current, instrumentSettingsRef.current.kick);
        gainNode.gain.value = instrumentSettingsRef.current.kick.volume;
        break;
      case "snare":
        source.buffer = createSnareSound(audioContextRef.current, instrumentSettingsRef.current.snare);
        gainNode.gain.value = instrumentSettingsRef.current.snare.volume;
        break;
      case "openhat":
        source.buffer = createOpenHatSound(audioContextRef.current, instrumentSettingsRef.current.openhat);
        gainNode.gain.value = instrumentSettingsRef.current.openhat.volume;
        break;
      case "clap":
        source.buffer = createClapSound(audioContextRef.current, instrumentSettingsRef.current.clap);
        gainNode.gain.value = instrumentSettingsRef.current.clap.volume;
        break;
      case "cowbell":
        source.buffer = createCowbellSound(audioContextRef.current, instrumentSettingsRef.current.cowbell);
        gainNode.gain.value = instrumentSettingsRef.current.cowbell.volume;
        break;
      case "rimshot":
        source.buffer = createRimshotSound(audioContextRef.current, instrumentSettingsRef.current.rimshot);
        gainNode.gain.value = instrumentSettingsRef.current.rimshot.volume;
        break;
    }

    // Connect audio chain
    source.connect(gainNode);

    // Apply tone filter based on instrument settings
    const currentSettings = instrumentSettingsRef.current[instrument];
    const toneFilter = audioContextRef.current.createBiquadFilter();
    
    // Configure tone filter based on instrument type
    let baseFreq: number;
    let filterType: BiquadFilterType;
    
    switch (instrument) {
      case "kick":
        baseFreq = 80; // Low frequency base for kick
        filterType = 'lowpass' as BiquadFilterType;
        break;
      case "snare":
      case "clap":
      case "cowbell":
      case "rimshot":
        baseFreq = 1000; // Mid frequency for snare-type sounds
        filterType = 'peaking' as BiquadFilterType;
        break;
      case "openhat":
        baseFreq = 5000; // High frequency for hi-hat
        filterType = 'highpass' as BiquadFilterType;
        break;
      default:
        baseFreq = 1000;
        filterType = 'peaking' as BiquadFilterType;
    }
    
    // Set filter parameters based on tone control (0-1 range)
    const cutoffFreq = baseFreq * (0.5 + currentSettings.tone * 1.5); // 0.5x to 2x base frequency
    
    toneFilter.type = filterType;
    toneFilter.frequency.value = cutoffFreq;
    toneFilter.Q.value = 1.0; // Moderate resonance
    
    if (filterType === 'peaking') {
      // For peaking filters, tone controls the gain boost/cut
      toneFilter.gain.value = (currentSettings.tone - 0.5) * 12; // ±6dB range
    }

    gainNode.connect(toneFilter);
    
    // Route to master gain (effects are chained after master)
    if (masterGainRef.current) {
      toneFilter.connect(masterGainRef.current);
    } else {
      toneFilter.connect(audioContextRef.current.destination);
    }

    // Start at the scheduled time
    source.start(time);
  }, [initializeAudioNodes]);


  const toggleStep = (stepIndex: number) => {
    if (fillMode) {
      const newFillSequences = { ...fillSequences };
      newFillSequences[selectedInstrument][stepIndex] =
        !newFillSequences[selectedInstrument][stepIndex];
      setFillSequences(newFillSequences);
    } else {
      const newSequences = { ...sequences };
      newSequences[selectedInstrument][stepIndex] =
        !newSequences[selectedInstrument][stepIndex];
      setSequences(newSequences);
    }
  };

  const toggleInstrumentMute = (instrument: Instrument) => {
    setInstrumentSettings((prev) => ({
      ...prev,
      [instrument]: { ...prev[instrument], muted: !prev[instrument].muted },
    }));
  };

  const togglePlayback = async () => {
    // Resume audio context if suspended
    if (audioContextRef.current) {
      await resumeAudioContext(audioContextRef.current);
    }
    
    // Enable performance mode when playing
    if (!isPlaying && wakeLockRef.current) {
      await wakeLockRef.current.requestWakeLock();
      setPerformanceMode(true);
    } else if (isPlaying && wakeLockRef.current) {
      wakeLockRef.current.releaseWakeLock();
      setPerformanceMode(false);
    }
    
    setIsPlaying(!isPlaying);
  };

  const loadRockPattern = () => {
    setSequences({
      kick: [
        // First 16 steps
        true, false, false, false, true, false, false, false,
        true, false, false, false, true, false, false, false,
        // Second 16 steps (repeat pattern)
        true, false, false, false, true, false, false, false,
        true, false, false, false, true, false, false, false,
      ],
      snare: [
        // First 16 steps
        false, false, false, false, true, false, false, false,
        false, false, false, false, true, false, false, false,
        // Second 16 steps (repeat pattern)
        false, false, false, false, true, false, false, false,
        false, false, false, false, true, false, false, false,
      ],
      openhat: [
        // First 16 steps
        false, false, true, false, false, false, true, false,
        false, false, true, false, false, false, true, false,
        // Second 16 steps (repeat pattern)
        false, false, true, false, false, false, true, false,
        false, false, true, false, false, false, true, false,
      ],
      clap: Array(32).fill(false),
      cowbell: Array(32).fill(false),
      rimshot: Array(32).fill(false),
    });
  };

  const loadHipHopPattern = () => {
    setBpm(90);
    setSequences({
      kick: [
        // First 16 steps - classic boom-bap pattern
        true, false, false, false, false, false, false, false,
        false, false, true, false, false, false, false, false,
        // Second 16 steps - variation
        true, false, false, false, false, false, true, false,
        false, false, true, false, false, false, false, false,
      ],
      snare: [
        // First 16 steps - snare on 2 and 4
        false, false, false, false, true, false, false, false,
        false, false, false, false, true, false, false, false,
        // Second 16 steps - with ghost notes
        false, false, false, false, true, false, true, false,
        false, false, false, false, true, false, false, false,
      ],
      openhat: [
        // First 16 steps - steady 8th notes with some gaps
        true, false, true, false, false, false, true, false,
        true, false, true, false, false, false, true, false,
        // Second 16 steps - more syncopated
        true, false, false, true, false, false, true, false,
        true, false, true, false, false, false, true, false,
      ],
      clap: [
        // First 16 steps - reinforcing snare hits
        false, false, false, false, false, false, false, false,
        false, false, false, false, true, false, false, false,
        // Second 16 steps
        false, false, false, false, false, false, false, false,
        false, false, false, false, true, false, false, false,
      ],
      cowbell: Array(32).fill(false),
      rimshot: [
        // First 16 steps - subtle percussion
        false, false, false, true, false, false, false, false,
        false, false, false, false, false, false, false, true,
        // Second 16 steps
        false, false, false, true, false, false, false, false,
        false, false, false, false, false, false, false, true,
      ],
    });
  };

  const loadElectroPattern = () => {
    setBpm(130); // Faster tempo for electro
    setSequences({
      kick: [
        true, false, false, false, false, false, true, false,
        false, false, false, false, false, false, true, false,
        true, false, false, false, false, false, true, false,
        false, false, false, false, false, false, true, false,
      ],
      snare: [
        false, false, false, false, true, false, false, false,
        false, false, false, false, true, false, false, false,
        false, false, false, false, true, false, false, false,
        false, false, false, false, true, false, false, false,
      ],
      openhat: [
        false, true, false, true, false, true, false, true,
        false, true, false, true, false, true, false, true,
        false, true, false, true, false, true, false, true,
        false, true, false, true, false, true, false, true,
      ],
      clap: [
        false, false, false, false, true, false, true, false,
        false, false, false, false, true, false, false, false,
        false, false, false, false, true, false, true, false,
        false, false, true, false, true, true, true, true,
      ],
      cowbell: [
        false, false, true, false, false, false, false, true,
        false, false, true, false, false, false, false, true,
        false, false, true, false, false, false, false, true,
        false, false, true, false, false, false, false, true,
      ],
      rimshot: [
        false, false, false, false, false, false, false, false,
        false, true, false, false, false, false, false, false,
        false, false, false, false, false, false, false, false,
        false, true, false, false, false, false, false, false,
      ],
    });
  };

  // Precise audio scheduling function
  const scheduler = useCallback(() => {
    if (!audioContextRef.current || !isPlaying) return;

    const stepDuration = (60 / bpm / 4); // 16th notes in seconds
    
    // While there are notes that will need to play before the next interval,
    // schedule them and advance the pointer.
    while (nextStepTimeRef.current < audioContextRef.current.currentTime + scheduleAheadTime) {
      const currentStep = Math.floor((nextStepTimeRef.current / stepDuration) % 32);
      
      // Get current sequences and settings from refs
      const currentSequences = sequencesRef.current;
      const currentFillSequences = fillSequencesRef.current;
      const currentFillMode = fillModeRef.current;
      const currentSettings = instrumentSettingsRef.current;

      // Choose which sequence to use based on fill mode
      const activeSequences = currentFillMode ? currentFillSequences : currentSequences;

      // Schedule sounds for active steps in all sequences (only if instrument not muted)
      if (activeSequences.kick[currentStep] && !currentSettings.kick.muted) {
        scheduleInstrument("kick", nextStepTimeRef.current);
      }
      if (activeSequences.snare[currentStep] && !currentSettings.snare.muted) {
        scheduleInstrument("snare", nextStepTimeRef.current);
      }
      if (activeSequences.openhat[currentStep] && !currentSettings.openhat.muted) {
        scheduleInstrument("openhat", nextStepTimeRef.current);
      }
      if (activeSequences.clap[currentStep] && !currentSettings.clap.muted) {
        scheduleInstrument("clap", nextStepTimeRef.current);
      }
      if (activeSequences.cowbell[currentStep] && !currentSettings.cowbell.muted) {
        scheduleInstrument("cowbell", nextStepTimeRef.current);
      }
      if (activeSequences.rimshot[currentStep] && !currentSettings.rimshot.muted) {
        scheduleInstrument("rimshot", nextStepTimeRef.current);
      }

      // Update visual step indicator
      setCurrentStep(currentStep);
      
      // Advance to next step
      nextStepTimeRef.current += stepDuration;
    }
  }, [isPlaying, bpm, scheduleAheadTime, scheduleInstrument]);

  // Main playback loop with precise timing
  useEffect(() => {
    if (isPlaying) {
      // Initialize the step time
      if (audioContextRef.current) {
        nextStepTimeRef.current = audioContextRef.current.currentTime;
      }
      
      // Start the scheduler
      intervalRef.current = window.setInterval(scheduler, lookahead);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setCurrentStep(0);
      nextStepTimeRef.current = 0;
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, scheduler]);

  // Load Electro pattern on initial mount
  useEffect(() => {
    loadElectroPattern();
  }, []);

  return (
    <div className="min-h-screen p-2 sm:p-4 lg:p-8" style={{ background: 'linear-gradient(135deg, #2F2E3E 0%, #1a1924 100%)' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-4 sm:mb-6 lg:mb-8">
          <h1 className="text-2xl sm:text-4xl lg:text-6xl font-bold mb-1 sm:mb-2" style={{ color: '#E6E8BF' }}>
            Bassy McBassface
          </h1>
          <div className="text-sm sm:text-lg lg:text-xl font-medium mb-1 sm:mb-2" style={{ color: '#DDDA00' }}>
            RHYTHM COMPOSER
          </div>
          {performanceMode && (
            <div className="text-xs sm:text-sm mb-1 sm:mb-2 flex items-center justify-center gap-1 sm:gap-2" style={{ color: '#F27900' }}>
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-400 animate-pulse"></div>
              <span className="hidden sm:inline">HIGH PERFORMANCE MODE ACTIVE</span>
              <span className="sm:hidden">PERF MODE</span>
            </div>
          )}
          <div className="w-24 sm:w-32 h-0.5 sm:h-1 mx-auto rounded-full" style={{ background: 'linear-gradient(to right, #F27900, #DD1D00)' }}></div>
        </div>

        {/* Main Machine Body */}
        <div className="rounded-xl sm:rounded-3xl shadow-2xl p-3 sm:p-6 lg:p-8 border border-2" style={{ 
          backgroundColor: '#2F2E3E',
          borderColor: '#E6E8BF',
          boxShadow: '0 25px 50px -12px rgba(221, 28, 0, 0.25)'
        }}>
          {/* Top Panel - Instrument Controls */}
          <div className="rounded-lg sm:rounded-xl p-3 sm:p-6 mb-3 sm:mb-6 border shadow-inner" style={{ 
            backgroundColor: 'rgba(230, 232, 191, 0.1)',
            borderColor: '#E6E8BF'
          }}>
            <SequencerControls
              selectedInstrument={selectedInstrument}
              setSelectedInstrument={setSelectedInstrument}
              instrumentSettings={instrumentSettings}
              setInstrumentSettings={setInstrumentSettings}
              fillMode={fillMode}
              setFillMode={setFillMode}
              toggleInstrumentMute={toggleInstrumentMute}
            />
          </div>
          
          {/* Middle Panel - Step Sequencer */}
          <div className="rounded-lg sm:rounded-xl p-3 sm:p-6 mb-3 sm:mb-6 border shadow-inner" style={{ 
            backgroundColor: 'rgba(230, 232, 191, 0.1)',
            borderColor: '#E6E8BF'
          }}>
            <StepButtons
              sequences={sequences}
              fillSequences={fillSequences}
              selectedInstrument={selectedInstrument}
              fillMode={fillMode}
              currentStep={currentStep}
              isPlaying={isPlaying}
              toggleStep={toggleStep}
              togglePlayback={togglePlayback}
            />
          </div>

          {/* Bottom Panel - Master Controls */}
          <div className="rounded-lg sm:rounded-xl p-3 sm:p-6 border shadow-inner" style={{ 
            backgroundColor: 'rgba(230, 232, 191, 0.1)',
            borderColor: '#E6E8BF'
          }}>
            <MasterControls
              reverbAmount={reverbAmount}
              setReverbAmount={setReverbAmount}
              bpm={bpm}
              setBpm={setBpm}
              loadRockPattern={loadRockPattern}
              loadHipHopPattern={loadHipHopPattern}
              loadElectroPattern={loadElectroPattern}
              delayTime={delayTime}
              setDelayTime={setDelayTime}
              delayFeedback={delayFeedback}
              setDelayFeedback={setDelayFeedback}
              delayMix={delayMix}
              setDelayMix={setDelayMix}
              phaserRate={phaserRate}
              setPhaserRate={setPhaserRate}
              phaserDepth={phaserDepth}
              setPhaserDepth={setPhaserDepth}
              phaserMix={phaserMix}
              setPhaserMix={setPhaserMix}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
