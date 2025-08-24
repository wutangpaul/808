import type { Instrument, InstrumentSettings } from '../types';

interface SequencerControlsProps {
  selectedInstrument: Instrument;
  setSelectedInstrument: (instrument: Instrument) => void;
  instrumentSettings: Record<Instrument, InstrumentSettings>;
  setInstrumentSettings: React.Dispatch<React.SetStateAction<Record<Instrument, InstrumentSettings>>>;
  fillMode: boolean;
  setFillMode: (fillMode: boolean) => void;
  toggleInstrumentMute: (instrument: Instrument) => void;
}

export default function SequencerControls({
  selectedInstrument,
  setSelectedInstrument,
  instrumentSettings,
  setInstrumentSettings,
  fillMode,
  setFillMode,
  toggleInstrumentMute,
}: SequencerControlsProps) {
  return (
    <div className="space-y-6">
      {/* Top Row - Instrument Selector and Action Buttons */}
      <div className="flex flex-col lg:flex-row items-center gap-4 justify-between">
        <div className="flex items-center gap-4">
          <label htmlFor="instrument" className="font-bold text-sm tracking-wider" style={{ color: '#DDDA00' }}>
            INSTRUMENT
          </label>
          <select
            id="instrument"
            value={selectedInstrument}
            onChange={(e) =>
              setSelectedInstrument(e.target.value as Instrument)
            }
            className="px-4 py-2 rounded-lg border-2 text-center font-bold text-lg hover:opacity-80 focus:outline-none transition-all shadow-inner"
            style={{ 
              borderColor: '#E6E8BF',
              backgroundColor: '#2F2E3E',
              color: '#DDDA00'
            }}
          >
            <option value="kick" style={{ backgroundColor: '#2F2E3E', color: '#DDDA00' }}>KICK</option>
            <option value="snare" style={{ backgroundColor: '#2F2E3E', color: '#DDDA00' }}>SNARE</option>
            <option value="openhat" style={{ backgroundColor: '#2F2E3E', color: '#DDDA00' }}>OPEN HAT</option>
            <option value="clap" style={{ backgroundColor: '#2F2E3E', color: '#DDDA00' }}>CLAP</option>
            <option value="cowbell" style={{ backgroundColor: '#2F2E3E', color: '#DDDA00' }}>COWBELL</option>
            <option value="rimshot" style={{ backgroundColor: '#2F2E3E', color: '#DDDA00' }}>RIMSHOT</option>
          </select>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setFillMode(!fillMode)}
            className="px-6 py-3 rounded-lg font-bold text-sm tracking-wider transition-all duration-200 transform hover:scale-105 shadow-lg border-2"
            style={{
              backgroundColor: fillMode ? '#F27900' : '#2F2E3E',
              borderColor: '#E6E8BF',
              color: fillMode ? '#E6E8BF' : '#DDDA00',
              boxShadow: fillMode ? '0 10px 25px -3px rgba(242, 121, 0, 0.3)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
          >
            {fillMode ? "FILL ON" : "FILL OFF"}
          </button>
          <button
            onClick={() => toggleInstrumentMute(selectedInstrument)}
            className="px-6 py-3 rounded-lg font-bold text-sm tracking-wider transition-all duration-200 transform hover:scale-105 shadow-lg border-2"
            style={{
              backgroundColor: instrumentSettings[selectedInstrument].muted ? '#DD1D00' : '#DDDA00',
              borderColor: '#E6E8BF',
              color: instrumentSettings[selectedInstrument].muted ? '#E6E8BF' : '#2F2E3E',
              boxShadow: instrumentSettings[selectedInstrument].muted ? '0 10px 25px -3px rgba(221, 29, 0, 0.3)' : '0 10px 25px -3px rgba(221, 218, 0, 0.3)'
            }}
          >
            {instrumentSettings[selectedInstrument].muted ? "MUTED" : "ACTIVE"}
          </button>
        </div>
      </div>

      {/* ADSR and Volume Controls */}
      <div className="flex flex-col xl:flex-row items-center justify-center gap-8 xl:gap-12">
        <div className="grid grid-cols-3 lg:grid-cols-5 gap-8 xl:gap-12">
          {/* Attack */}
          <div className="flex flex-col items-center gap-3 rounded-xl p-6 shadow-lg border-2 min-h-[200px]" style={{ 
            backgroundColor: '#2F2E3E', 
            borderColor: '#E6E8BF' 
          }}>
            <label htmlFor="attack" className="text-orange-300 font-bold text-xs tracking-wider">
              ATTACK
            </label>
            <div className="relative flex items-center justify-center h-32 w-8">
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
                className="w-32 h-6 cursor-pointer"
                style={{
                  accentColor: '#fbbf24',
                  background: 'linear-gradient(to right, #f97316, #ea580c)',
                  transform: 'rotate(-90deg)',
                  transformOrigin: 'center'
                }}
              />
              <div className="absolute -top-2 -left-2 -right-2 -bottom-2 rounded-lg border-2 border-orange-400/30 pointer-events-none"></div>
            </div>
            <span className="text-yellow-300 text-xs font-mono bg-gray-800 px-2 py-1 rounded">
              {(instrumentSettings[selectedInstrument].attack * 1000).toFixed(0)}ms
            </span>
          </div>

          {/* Decay */}
          <div className="flex flex-col items-center gap-3 rounded-xl p-6 shadow-lg border-2 min-h-[200px]" style={{ 
            backgroundColor: '#2F2E3E', 
            borderColor: '#E6E8BF' 
          }}>
            <label htmlFor="decay" className="text-orange-300 font-bold text-xs tracking-wider">
              DECAY
            </label>
            <div className="relative flex items-center justify-center h-32 w-8">
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
                className="w-32 h-6 cursor-pointer"
                style={{
                  accentColor: '#fbbf24',
                  background: 'linear-gradient(to right, #f97316, #ea580c)',
                  transform: 'rotate(-90deg)',
                  transformOrigin: 'center'
                }}
              />
              <div className="absolute -top-2 -left-2 -right-2 -bottom-2 rounded-lg border-2 border-orange-400/30 pointer-events-none"></div>
            </div>
            <span className="text-yellow-300 text-xs font-mono bg-gray-800 px-2 py-1 rounded">
              {(instrumentSettings[selectedInstrument].decay * 1000).toFixed(0)}ms
            </span>
          </div>

          {/* Sustain */}
          <div className="flex flex-col items-center gap-3 rounded-xl p-6 shadow-lg border-2 min-h-[200px]" style={{ 
            backgroundColor: '#2F2E3E', 
            borderColor: '#E6E8BF' 
          }}>
            <label htmlFor="sustain" className="text-orange-300 font-bold text-xs tracking-wider">
              SUSTAIN
            </label>
            <div className="relative flex items-center justify-center h-32 w-8">
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
                className="w-32 h-6 cursor-pointer"
                style={{
                  accentColor: '#fbbf24',
                  background: 'linear-gradient(to right, #f97316, #ea580c)',
                  transform: 'rotate(-90deg)',
                  transformOrigin: 'center'
                }}
              />
              <div className="absolute -top-2 -left-2 -right-2 -bottom-2 rounded-lg border-2 border-orange-400/30 pointer-events-none"></div>
            </div>
            <span className="text-yellow-300 text-xs font-mono bg-gray-800 px-2 py-1 rounded">
              {Math.round(instrumentSettings[selectedInstrument].sustain * 100)}%
            </span>
          </div>

          {/* Release */}
          <div className="flex flex-col items-center gap-3 rounded-xl p-6 shadow-lg border-2 min-h-[200px]" style={{ 
            backgroundColor: '#2F2E3E', 
            borderColor: '#E6E8BF' 
          }}>
            <label htmlFor="release" className="text-orange-300 font-bold text-xs tracking-wider">
              RELEASE
            </label>
            <div className="relative flex items-center justify-center h-32 w-8">
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
                className="w-32 h-6 cursor-pointer"
                style={{
                  accentColor: '#fbbf24',
                  background: 'linear-gradient(to right, #f97316, #ea580c)',
                  transform: 'rotate(-90deg)',
                  transformOrigin: 'center'
                }}
              />
              <div className="absolute -top-2 -left-2 -right-2 -bottom-2 rounded-lg border-2 border-orange-400/30 pointer-events-none"></div>
            </div>
            <span className="text-yellow-300 text-xs font-mono bg-gray-800 px-2 py-1 rounded">
              {(instrumentSettings[selectedInstrument].release * 1000).toFixed(0)}ms
            </span>
          </div>

          {/* Volume */}
          <div className="flex flex-col items-center gap-3 rounded-xl p-6 shadow-lg border-2 min-h-[200px]" style={{ 
            backgroundColor: '#2F2E3E', 
            borderColor: '#E6E8BF' 
          }}>
            <label htmlFor="volume" className="text-red-300 font-bold text-xs tracking-wider">
              VOLUME
            </label>
            <div className="relative flex items-center justify-center h-32 w-8">
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
                className="w-32 h-6 cursor-pointer"
                style={{
                  accentColor: '#ef4444',
                  background: 'linear-gradient(to right, #dc2626, #b91c1c)',
                  transform: 'rotate(-90deg)',
                  transformOrigin: 'center'
                }}
              />
              <div className="absolute -top-2 -left-2 -right-2 -bottom-2 rounded-lg border-2 border-red-400/30 pointer-events-none"></div>
            </div>
            <span className="text-red-300 text-xs font-mono bg-gray-800 px-2 py-1 rounded">
              {Math.round(instrumentSettings[selectedInstrument].volume * 100)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}