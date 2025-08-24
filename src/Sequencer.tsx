import { useState, useEffect, useRef } from "react";
import type { Instrument, InstrumentSettings } from "./types";
import {
  initializeAudioContext,
  setupMasterBus,
  resumeAudioContext,
} from "./audio/audioUtils";
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
    kick: Array(16).fill(false),
    snare: Array(16).fill(false),
    openhat: Array(16).fill(false),
    clap: Array(16).fill(false),
    cowbell: Array(16).fill(false),
    rimshot: Array(16).fill(false),
  });
  const [fillSequences, setFillSequences] = useState<Record<Instrument, boolean[]>>({
    kick: Array(16).fill(false),
    snare: Array(16).fill(false),
    openhat: Array(16).fill(false),
    clap: Array(16).fill(false),
    cowbell: Array(16).fill(false),
    rimshot: Array(16).fill(false),
  });
  const [fillMode, setFillMode] = useState(false);
  const [instrumentSettings, setInstrumentSettings] = useState<Record<Instrument, InstrumentSettings>>({
    kick: {
      attack: 0.001,
      decay: 0.3,
      sustain: 0.2,
      release: 0.8,
      volume: 0.9,
      muted: false,
    },
    snare: {
      attack: 0.001,
      decay: 0.15,
      sustain: 0.0,
      release: 0.25,
      volume: 0.8,
      muted: false,
    },
    openhat: {
      attack: 0.001,
      decay: 0.05,
      sustain: 0.3,
      release: 0.4,
      volume: 0.6,
      muted: false,
    },
    clap: {
      attack: 0.001,
      decay: 0.08,
      sustain: 0.1,
      release: 0.3,
      volume: 0.7,
      muted: false,
    },
    cowbell: {
      attack: 0.001,
      decay: 0.12,
      sustain: 0.4,
      release: 0.5,
      volume: 0.6,
      muted: false,
    },
    rimshot: {
      attack: 0.001,
      decay: 0.03,
      sustain: 0.0,
      release: 0.15,
      volume: 0.8,
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
  const fillSequencesRef = useRef(fillSequences);
  const fillModeRef = useRef(fillMode);
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

  useEffect(() => {
    fillSequencesRef.current = fillSequences;
  }, [fillSequences]);

  useEffect(() => {
    fillModeRef.current = fillMode;
  }, [fillMode]);

  // Initialize audio context and nodes on component mount
  useEffect(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = initializeAudioContext();
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

  // Initialize audio nodes
  const initializeAudioNodes = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = initializeAudioContext();
    }

    if (!masterGainRef.current) {
      const nodes = setupMasterBus(audioContextRef.current);
      masterGainRef.current = nodes.masterGain;
      reverbNodeRef.current = nodes.reverbNode;
      dryGainRef.current = nodes.dryGain;
      wetGainRef.current = nodes.wetGain;

      // Set initial reverb mix
      dryGainRef.current.gain.value = 1 - reverbAmount;
      wetGainRef.current.gain.value = reverbAmount;
    }
  };


  const playInstrument = async (instrument: Instrument) => {
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
          const currentFillSequences = fillSequencesRef.current;
          const currentFillMode = fillModeRef.current;
          const currentSettings = instrumentSettingsRef.current;

          // Choose which sequence to use based on fill mode
          const activeSequences = currentFillMode ? currentFillSequences : currentSequences;

          // Play sounds for active steps in all sequences (only if instrument not muted)
          if (activeSequences.kick[prev] && !currentSettings.kick.muted) {
            playInstrument("kick");
          }
          if (activeSequences.snare[prev] && !currentSettings.snare.muted) {
            playInstrument("snare");
          }
          if (
            activeSequences.openhat[prev] &&
            !currentSettings.openhat.muted
          ) {
            playInstrument("openhat");
          }
          if (activeSequences.clap[prev] && !currentSettings.clap.muted) {
            playInstrument("clap");
          }
          if (
            activeSequences.cowbell[prev] &&
            !currentSettings.cowbell.muted
          ) {
            playInstrument("cowbell");
          }
          if (
            activeSequences.rimshot[prev] &&
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

  return (
    <div className="min-h-screen p-4 lg:p-8" style={{ background: 'linear-gradient(135deg, #2F2E3E 0%, #1a1924 100%)' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl lg:text-6xl font-bold mb-2" style={{ color: '#E6E8BF' }}>
            ROLAND TR-808
          </h1>
          <div className="text-lg lg:text-xl font-medium mb-4" style={{ color: '#DDDA00' }}>
            RHYTHM COMPOSER
          </div>
          <div className="w-32 h-1 mx-auto rounded-full" style={{ background: 'linear-gradient(to right, #F27900, #DD1D00)' }}></div>
        </div>

        {/* Main Machine Body */}
        <div className="rounded-3xl shadow-2xl p-6 lg:p-8 border-2" style={{ 
          backgroundColor: '#2F2E3E',
          borderColor: '#E6E8BF',
          boxShadow: '0 25px 50px -12px rgba(221, 28, 0, 0.25)'
        }}>
          {/* Top Panel - Instrument Controls */}
          <div className="rounded-xl p-6 mb-6 border shadow-inner" style={{ 
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
          <div className="rounded-xl p-6 mb-6 border shadow-inner" style={{ 
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
          <div className="rounded-xl p-6 border shadow-inner" style={{ 
            backgroundColor: 'rgba(230, 232, 191, 0.1)',
            borderColor: '#E6E8BF'
          }}>
            <MasterControls
              reverbAmount={reverbAmount}
              setReverbAmount={setReverbAmount}
              bpm={bpm}
              setBpm={setBpm}
              loadRockPattern={loadRockPattern}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
