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
    <div className="space-y-4 sm:space-y-6">
      {/* Top Row - Instrument Selector and Action Buttons */}
      <div className="flex flex-col sm:flex-row lg:flex-row items-center gap-3 sm:gap-4 justify-between">
        <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto justify-center sm:justify-start">
          <label htmlFor="instrument" className="font-bold text-xs sm:text-sm tracking-wider" style={{ color: '#DDDA00' }}>
            INSTRUMENT
          </label>
          <select
            id="instrument"
            value={selectedInstrument}
            onChange={(e) =>
              setSelectedInstrument(e.target.value as Instrument)
            }
            className="px-3 sm:px-4 py-2 rounded-lg border-2 text-center font-bold text-sm sm:text-lg hover:opacity-80 focus:outline-none transition-all shadow-inner w-32 sm:w-auto"
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

        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-center">
          <button
            onClick={() => setFillMode(!fillMode)}
            className="px-3 sm:px-6 py-2 sm:py-3 rounded-lg font-bold text-xs sm:text-sm tracking-wider transition-all duration-200 transform hover:scale-105 shadow-lg border-2 flex-1 sm:flex-none"
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
            className="px-3 sm:px-6 py-2 sm:py-3 rounded-lg font-bold text-xs sm:text-sm tracking-wider transition-all duration-200 transform hover:scale-105 shadow-lg border-2 flex-1 sm:flex-none"
            style={{
              backgroundColor: instrumentSettings[selectedInstrument].muted ? '#DDDA00' : '#DD1D00',
              borderColor: '#E6E8BF',
              color: instrumentSettings[selectedInstrument].muted ? '#2F2E3E' : '#E6E8BF',
              boxShadow: instrumentSettings[selectedInstrument].muted ? '0 10px 25px -3px rgba(221, 218, 0, 0.3)' : '0 10px 25px -3px rgba(221, 29, 0, 0.3)'
            }}
          >
            {instrumentSettings[selectedInstrument].muted ? "UNMUTE" : "MUTE"}
          </button>
        </div>
      </div>

      {/* ADSR and Volume Controls */}
      <div className="flex flex-col xl:flex-row items-center justify-center gap-4 sm:gap-8 xl:gap-12">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-6 lg:gap-8 xl:gap-12 w-full">
          {/* Attack */}
          <div className="flex flex-col items-center gap-2 sm:gap-3 rounded-lg sm:rounded-xl p-3 sm:p-6 shadow-lg border-2 min-h-[140px] sm:min-h-[180px] lg:min-h-[200px]" style={{ 
            backgroundColor: '#2F2E3E', 
            borderColor: '#E6E8BF' 
          }}>
            <label htmlFor="attack" className="font-bold text-xs tracking-wider text-center" style={{ color: '#E6E8BF' }}>
              ATTACK
            </label>
            <div className="relative flex items-center justify-center h-16 w-6 sm:h-24 sm:w-8 lg:h-32">
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
                className="w-16 h-4 sm:w-24 sm:h-6 lg:w-32 cursor-pointer"
                style={{
                  accentColor: '#F27900',
                  background: 'linear-gradient(to right, #DDDA00, #F27900)',
                  transform: 'rotate(-90deg)',
                  transformOrigin: 'center'
                }}
              />
              <div className="absolute -top-2 -left-2 -right-2 -bottom-2 rounded-lg border-2 pointer-events-none" style={{ borderColor: 'rgba(230, 232, 191, 0.3)' }}></div>
            </div>
            <span className="text-xs font-mono px-2 py-1 rounded" style={{ color: '#DDDA00', backgroundColor: '#2F2E3E' }}>
              {(instrumentSettings[selectedInstrument].attack * 1000).toFixed(0)}ms
            </span>
          </div>

          {/* Decay */}
          <div className="flex flex-col items-center gap-2 sm:gap-3 rounded-lg sm:rounded-xl p-3 sm:p-6 shadow-lg border-2 min-h-[140px] sm:min-h-[180px] lg:min-h-[200px]" style={{ 
            backgroundColor: '#2F2E3E', 
            borderColor: '#E6E8BF' 
          }}>
            <label htmlFor="decay" className="text-orange-300 font-bold text-xs tracking-wider text-center">
              DECAY
            </label>
            <div className="relative flex items-center justify-center h-16 w-6 sm:h-24 sm:w-8 lg:h-32">
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
                className="w-16 h-4 sm:w-24 sm:h-6 lg:w-32 cursor-pointer"
                style={{
                  accentColor: '#F27900',
                  background: 'linear-gradient(to right, #DDDA00, #F27900)',
                  transform: 'rotate(-90deg)',
                  transformOrigin: 'center'
                }}
              />
              <div className="absolute -top-2 -left-2 -right-2 -bottom-2 rounded-lg border-2 pointer-events-none" style={{ borderColor: 'rgba(230, 232, 191, 0.3)' }}></div>
            </div>
            <span className="text-xs font-mono px-2 py-1 rounded" style={{ color: '#DDDA00', backgroundColor: '#2F2E3E' }}>
              {(instrumentSettings[selectedInstrument].decay * 1000).toFixed(0)}ms
            </span>
          </div>

          {/* Sustain */}
          <div className="flex flex-col items-center gap-2 sm:gap-3 rounded-lg sm:rounded-xl p-3 sm:p-6 shadow-lg border-2 min-h-[140px] sm:min-h-[180px] lg:min-h-[200px]" style={{ 
            backgroundColor: '#2F2E3E', 
            borderColor: '#E6E8BF' 
          }}>
            <label htmlFor="sustain" className="text-orange-300 font-bold text-xs tracking-wider text-center">
              SUSTAIN
            </label>
            <div className="relative flex items-center justify-center h-16 w-6 sm:h-24 sm:w-8 lg:h-32">
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
                className="w-16 h-4 sm:w-24 sm:h-6 lg:w-32 cursor-pointer"
                style={{
                  accentColor: '#F27900',
                  background: 'linear-gradient(to right, #DDDA00, #F27900)',
                  transform: 'rotate(-90deg)',
                  transformOrigin: 'center'
                }}
              />
              <div className="absolute -top-2 -left-2 -right-2 -bottom-2 rounded-lg border-2 pointer-events-none" style={{ borderColor: 'rgba(230, 232, 191, 0.3)' }}></div>
            </div>
            <span className="text-xs font-mono px-2 py-1 rounded" style={{ color: '#DDDA00', backgroundColor: '#2F2E3E' }}>
              {Math.round(instrumentSettings[selectedInstrument].sustain * 100)}%
            </span>
          </div>

          {/* Release */}
          <div className="flex flex-col items-center gap-2 sm:gap-3 rounded-lg sm:rounded-xl p-3 sm:p-6 shadow-lg border-2 min-h-[140px] sm:min-h-[180px] lg:min-h-[200px]" style={{ 
            backgroundColor: '#2F2E3E', 
            borderColor: '#E6E8BF' 
          }}>
            <label htmlFor="release" className="text-orange-300 font-bold text-xs tracking-wider">
              RELEASE
            </label>
            <div className="relative flex items-center justify-center h-16 w-6 sm:h-24 sm:w-8 lg:h-32">
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
                className="w-16 h-4 sm:w-24 sm:h-6 lg:w-32 cursor-pointer"
                style={{
                  accentColor: '#F27900',
                  background: 'linear-gradient(to right, #DDDA00, #F27900)',
                  transform: 'rotate(-90deg)',
                  transformOrigin: 'center'
                }}
              />
              <div className="absolute -top-2 -left-2 -right-2 -bottom-2 rounded-lg border-2 pointer-events-none" style={{ borderColor: 'rgba(230, 232, 191, 0.3)' }}></div>
            </div>
            <span className="text-xs font-mono px-2 py-1 rounded" style={{ color: '#DDDA00', backgroundColor: '#2F2E3E' }}>
              {(instrumentSettings[selectedInstrument].release * 1000).toFixed(0)}ms
            </span>
          </div>

          {/* Volume */}
          <div className="flex flex-col items-center gap-2 sm:gap-3 rounded-lg sm:rounded-xl p-3 sm:p-6 shadow-lg border-2 min-h-[140px] sm:min-h-[180px] lg:min-h-[200px]" style={{ 
            backgroundColor: '#2F2E3E', 
            borderColor: '#E6E8BF' 
          }}>
            <label htmlFor="volume" className="font-bold text-xs tracking-wider" style={{ color: '#DD1D00' }}>
              VOLUME
            </label>
            <div className="relative flex items-center justify-center h-16 w-6 sm:h-24 sm:w-8 lg:h-32">
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
                className="w-16 h-4 sm:w-24 sm:h-6 lg:w-32 cursor-pointer"
                style={{
                  accentColor: '#DD1D00',
                  background: 'linear-gradient(to right, #F27900, #DD1D00)',
                  transform: 'rotate(-90deg)',
                  transformOrigin: 'center'
                }}
              />
              <div className="absolute -top-2 -left-2 -right-2 -bottom-2 rounded-lg border-2 pointer-events-none" style={{ borderColor: 'rgba(221, 29, 0, 0.3)' }}></div>
            </div>
            <span className="text-xs font-mono px-2 py-1 rounded" style={{ color: '#DD1D00', backgroundColor: '#2F2E3E' }}>
              {Math.round(instrumentSettings[selectedInstrument].volume * 100)}%
            </span>
          </div>

          {/* Tone */}
          <div className="flex flex-col items-center gap-2 sm:gap-3 rounded-lg sm:rounded-xl p-3 sm:p-6 shadow-lg border-2 min-h-[140px] sm:min-h-[180px] lg:min-h-[200px]" style={{ 
            backgroundColor: '#2F2E3E', 
            borderColor: '#E6E8BF' 
          }}>
            <label htmlFor="tone" className="font-bold text-xs tracking-wider text-center" style={{ color: '#F27900' }}>
              TONE
            </label>
            <div className="relative flex items-center justify-center h-16 w-6 sm:h-24 sm:w-8 lg:h-32">
              <input
                id="tone"
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={instrumentSettings[selectedInstrument].tone}
                onChange={(e) =>
                  setInstrumentSettings((prev) => ({
                    ...prev,
                    [selectedInstrument]: {
                      ...prev[selectedInstrument],
                      tone: Number(e.target.value),
                    },
                  }))
                }
                className="w-16 h-4 sm:w-24 sm:h-6 lg:w-32 cursor-pointer"
                style={{
                  accentColor: '#F27900',
                  background: 'linear-gradient(to right, #F27900, #DDDA00)',
                  transform: 'rotate(-90deg)',
                  transformOrigin: 'center'
                }}
              />
              <div className="absolute -top-2 -left-2 -right-2 -bottom-2 rounded-lg border-2 pointer-events-none" style={{ borderColor: 'rgba(242, 121, 0, 0.3)' }}></div>
            </div>
            <span className="text-xs font-mono px-2 py-1 rounded" style={{ color: '#F27900', backgroundColor: '#2F2E3E' }}>
              {Math.round(instrumentSettings[selectedInstrument].tone * 100)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}