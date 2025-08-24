interface MasterControlsProps {
  reverbAmount: number;
  setReverbAmount: (amount: number) => void;
  bpm: number;
  setBpm: (bpm: number) => void;
  loadRockPattern: () => void;
}

export default function MasterControls({
  reverbAmount,
  setReverbAmount,
  bpm,
  setBpm,
  loadRockPattern,
}: MasterControlsProps) {
  return (
    <div className="space-y-8">
      {/* Master Section Header */}
      <div className="text-center">
        <h3 className="text-orange-300 font-bold text-xl tracking-wider mb-2">
          MASTER SECTION
        </h3>
        <div className="w-24 h-0.5 bg-gradient-to-r from-orange-400 to-red-400 mx-auto rounded-full"></div>
      </div>

      {/* Master Controls */}
      <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16">
        {/* Reverb Control */}
        <div className="flex flex-col items-center gap-4 bg-gradient-to-b from-gray-600 to-gray-700 rounded-xl p-6 shadow-lg border border-gray-500 min-w-[180px]">
          <label htmlFor="reverb" className="text-blue-300 font-bold text-sm tracking-wider">
            REVERB
          </label>
          <div className="flex items-center gap-4">
            <span className="text-xs text-gray-400 font-mono">0%</span>
            <div className="relative">
              <input
                id="reverb"
                type="range"
                min="0"
                max="0.8"
                step="0.1"
                value={reverbAmount}
                onChange={(e) => setReverbAmount(Number(e.target.value))}
                className="w-32 h-2 cursor-pointer"
                style={{
                  accentColor: '#3b82f6',
                  background: 'linear-gradient(to right, #1e40af, #3b82f6)'
                }}
              />
              <div className="absolute -top-1 -left-1 -right-1 -bottom-1 rounded-lg border border-blue-400/30 pointer-events-none"></div>
            </div>
            <span className="text-xs text-gray-400 font-mono">80%</span>
          </div>
          <div className="text-blue-300 text-lg font-mono bg-gray-800 px-4 py-2 rounded-lg min-w-[60px] text-center">
            {Math.round(reverbAmount * 100)}%
          </div>
        </div>

        {/* BPM Control */}
        <div className="flex flex-col items-center gap-4 bg-gradient-to-b from-gray-600 to-gray-700 rounded-xl p-6 shadow-lg border border-gray-500 min-w-[180px]">
          <label htmlFor="bpm" className="text-green-300 font-bold text-sm tracking-wider">
            TEMPO (BPM)
          </label>
          <div className="flex items-center gap-4">
            <span className="text-xs text-gray-400 font-mono">60</span>
            <div className="relative">
              <input
                id="bpm"
                type="range"
                value={bpm}
                onChange={(e) => setBpm(Number(e.target.value))}
                min="60"
                max="200"
                className="w-32 h-2 cursor-pointer"
                style={{
                  accentColor: '#10b981',
                  background: 'linear-gradient(to right, #047857, #10b981)'
                }}
              />
              <div className="absolute -top-1 -left-1 -right-1 -bottom-1 rounded-lg border border-green-400/30 pointer-events-none"></div>
            </div>
            <span className="text-xs text-gray-400 font-mono">200</span>
          </div>
          <div className="text-green-300 text-lg font-mono bg-gray-800 px-4 py-2 rounded-lg min-w-[60px] text-center">
            {bpm}
          </div>
        </div>
      </div>

      {/* Pattern Loader */}
      <div className="flex flex-col items-center gap-4">
        <h4 className="text-gray-300 font-bold text-sm tracking-wider">
          PRESET PATTERNS
        </h4>
        <div className="flex flex-wrap gap-4 justify-center">
          <button
            onClick={loadRockPattern}
            className="px-8 py-4 rounded-xl font-bold text-sm tracking-wider transition-all duration-200 transform hover:scale-105 active:scale-95 bg-gradient-to-b from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white shadow-lg shadow-blue-500/30 border border-blue-400"
          >
            LOAD ROCK PATTERN
          </button>
          
          {/* Placeholder for more patterns */}
          <button
            className="px-8 py-4 rounded-xl font-bold text-sm tracking-wider transition-all duration-200 transform hover:scale-105 active:scale-95 bg-gradient-to-b from-gray-500 to-gray-600 hover:from-gray-400 hover:to-gray-500 text-white shadow-lg shadow-gray-500/30 border border-gray-400 opacity-50 cursor-not-allowed"
            disabled
          >
            MORE PATTERNS
          </button>
        </div>
      </div>
    </div>
  );
}