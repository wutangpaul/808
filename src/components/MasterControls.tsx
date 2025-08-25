interface MasterControlsProps {
  reverbAmount: number;
  setReverbAmount: (amount: number) => void;
  bpm: number;
  setBpm: (bpm: number) => void;
  loadRockPattern: () => void;
  loadHipHopPattern: () => void;
  loadElectroPattern: () => void;
  delayTime: number;
  setDelayTime: (time: number) => void;
  delayFeedback: number;
  setDelayFeedback: (feedback: number) => void;
  delayMix: number;
  setDelayMix: (mix: number) => void;
  phaserRate: number;
  setPhaserRate: (rate: number) => void;
  phaserDepth: number;
  setPhaserDepth: (depth: number) => void;
  phaserMix: number;
  setPhaserMix: (mix: number) => void;
}

export default function MasterControls({
  reverbAmount,
  setReverbAmount,
  bpm,
  setBpm,
  loadRockPattern,
  loadHipHopPattern,
  loadElectroPattern,
  delayTime,
  setDelayTime,
  delayFeedback,
  setDelayFeedback,
  delayMix,
  setDelayMix,
  phaserRate,
  setPhaserRate,
  phaserDepth,
  setPhaserDepth,
  phaserMix,
  setPhaserMix,
}: MasterControlsProps) {
  return (
    <div className="space-y-8">
      {/* Master Section Header */}
      <div className="text-center">
        <h3 className="font-bold text-xl tracking-wider mb-2" style={{ color: '#E6E8BF' }}>
          MASTER SECTION
        </h3>
        <div className="w-24 h-0.5 mx-auto rounded-full" style={{ 
          background: 'linear-gradient(to right, #F27900, #DD1D00)' 
        }}></div>
      </div>

      {/* Master Controls - Row 1 */}
      <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16 mb-8">
        {/* Reverb Control */}
        <div className="flex flex-col items-center gap-4 rounded-xl p-6 shadow-lg border-2 min-w-[180px]" style={{ 
          backgroundColor: '#2F2E3E', 
          borderColor: '#E6E8BF' 
        }}>
          <label htmlFor="reverb" className="font-bold text-sm tracking-wider" style={{ color: '#DDDA00' }}>
            REVERB
          </label>
          <div className="flex items-center gap-4">
            <span className="text-xs font-mono" style={{ color: '#E6E8BF' }}>0%</span>
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
                  accentColor: '#F27900',
                  background: 'linear-gradient(to right, #DDDA00, #F27900)'
                }}
              />
              <div className="absolute -top-1 -left-1 -right-1 -bottom-1 rounded-lg border pointer-events-none" style={{ 
                borderColor: 'rgba(230, 232, 191, 0.3)' 
              }}></div>
            </div>
            <span className="text-xs font-mono" style={{ color: '#E6E8BF' }}>80%</span>
          </div>
          <div className="text-lg font-mono px-4 py-2 rounded-lg min-w-[60px] text-center" style={{ 
            color: '#DDDA00', 
            backgroundColor: '#2F2E3E',
            border: `1px solid #E6E8BF`
          }}>
            {Math.round(reverbAmount * 100)}%
          </div>
        </div>

        {/* BPM Control */}
        <div className="flex flex-col items-center gap-4 rounded-xl p-6 shadow-lg border-2 min-w-[180px]" style={{ 
          backgroundColor: '#2F2E3E', 
          borderColor: '#E6E8BF' 
        }}>
          <label htmlFor="bpm" className="font-bold text-sm tracking-wider" style={{ color: '#DDDA00' }}>
            TEMPO (BPM)
          </label>
          <div className="flex items-center gap-4">
            <span className="text-xs font-mono" style={{ color: '#E6E8BF' }}>60</span>
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
                  accentColor: '#DD1D00',
                  background: 'linear-gradient(to right, #F27900, #DD1D00)'
                }}
              />
              <div className="absolute -top-1 -left-1 -right-1 -bottom-1 rounded-lg border pointer-events-none" style={{ 
                borderColor: 'rgba(230, 232, 191, 0.3)' 
              }}></div>
            </div>
            <span className="text-xs font-mono" style={{ color: '#E6E8BF' }}>200</span>
          </div>
          <div className="text-lg font-mono px-4 py-2 rounded-lg min-w-[60px] text-center" style={{ 
            color: '#DD1D00', 
            backgroundColor: '#2F2E3E',
            border: `1px solid #E6E8BF`
          }}>
            {bpm}
          </div>
        </div>
      </div>

      {/* Effects Controls - Row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
        {/* Delay Time */}
        <div className="flex flex-col items-center gap-4 rounded-xl p-6 shadow-lg border-2 min-w-[140px]" style={{ 
          backgroundColor: '#2F2E3E', 
          borderColor: '#E6E8BF' 
        }}>
          <label htmlFor="delayTime" className="font-bold text-xs tracking-wider" style={{ color: '#F27900' }}>
            DELAY TIME
          </label>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono" style={{ color: '#E6E8BF' }}>62ms</span>
            <div className="relative">
              <input
                id="delayTime"
                type="range"
                min="0.0625"
                max="0.5"
                step="0.0625"
                value={delayTime}
                onChange={(e) => setDelayTime(Number(e.target.value))}
                className="w-24 h-2 cursor-pointer"
                style={{
                  accentColor: '#F27900',
                  background: 'linear-gradient(to right, #DDDA00, #F27900)'
                }}
              />
            </div>
            <span className="text-xs font-mono" style={{ color: '#E6E8BF' }}>500ms</span>
          </div>
          <div className="text-sm font-mono px-2 py-1 rounded min-w-[50px] text-center" style={{ 
            color: '#F27900', 
            backgroundColor: '#2F2E3E',
            border: `1px solid #E6E8BF`
          }}>
            {(delayTime * 1000).toFixed(0)}ms
          </div>
        </div>

        {/* Delay Feedback */}
        <div className="flex flex-col items-center gap-4 rounded-xl p-6 shadow-lg border-2 min-w-[140px]" style={{ 
          backgroundColor: '#2F2E3E', 
          borderColor: '#E6E8BF' 
        }}>
          <label htmlFor="delayFeedback" className="font-bold text-xs tracking-wider" style={{ color: '#F27900' }}>
            FEEDBACK
          </label>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono" style={{ color: '#E6E8BF' }}>0%</span>
            <div className="relative">
              <input
                id="delayFeedback"
                type="range"
                min="0"
                max="0.95"
                step="0.05"
                value={delayFeedback}
                onChange={(e) => setDelayFeedback(Number(e.target.value))}
                className="w-24 h-2 cursor-pointer"
                style={{
                  accentColor: '#F27900',
                  background: 'linear-gradient(to right, #DDDA00, #F27900)'
                }}
              />
            </div>
            <span className="text-xs font-mono" style={{ color: '#E6E8BF' }}>95%</span>
          </div>
          <div className="text-sm font-mono px-2 py-1 rounded min-w-[50px] text-center" style={{ 
            color: '#F27900', 
            backgroundColor: '#2F2E3E',
            border: `1px solid #E6E8BF`
          }}>
            {Math.round(delayFeedback * 100)}%
          </div>
        </div>

        {/* Delay Mix */}
        <div className="flex flex-col items-center gap-4 rounded-xl p-6 shadow-lg border-2 min-w-[140px]" style={{ 
          backgroundColor: '#2F2E3E', 
          borderColor: '#E6E8BF' 
        }}>
          <label htmlFor="delayMix" className="font-bold text-xs tracking-wider" style={{ color: '#F27900' }}>
            DELAY MIX
          </label>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono" style={{ color: '#E6E8BF' }}>0%</span>
            <div className="relative">
              <input
                id="delayMix"
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={delayMix}
                onChange={(e) => setDelayMix(Number(e.target.value))}
                className="w-24 h-2 cursor-pointer"
                style={{
                  accentColor: '#F27900',
                  background: 'linear-gradient(to right, #DDDA00, #F27900)'
                }}
              />
            </div>
            <span className="text-xs font-mono" style={{ color: '#E6E8BF' }}>100%</span>
          </div>
          <div className="text-sm font-mono px-2 py-1 rounded min-w-[50px] text-center" style={{ 
            color: '#F27900', 
            backgroundColor: '#2F2E3E',
            border: `1px solid #E6E8BF`
          }}>
            {Math.round(delayMix * 100)}%
          </div>
        </div>

        {/* Phaser Rate */}
        <div className="flex flex-col items-center gap-4 rounded-xl p-6 shadow-lg border-2 min-w-[140px]" style={{ 
          backgroundColor: '#2F2E3E', 
          borderColor: '#E6E8BF' 
        }}>
          <label htmlFor="phaserRate" className="font-bold text-xs tracking-wider" style={{ color: '#DDDA00' }}>
            PHASER RATE
          </label>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono" style={{ color: '#E6E8BF' }}>0.1Hz</span>
            <div className="relative">
              <input
                id="phaserRate"
                type="range"
                min="0.1"
                max="5"
                step="0.1"
                value={phaserRate}
                onChange={(e) => setPhaserRate(Number(e.target.value))}
                className="w-24 h-2 cursor-pointer"
                style={{
                  accentColor: '#DDDA00',
                  background: 'linear-gradient(to right, #DDDA00, #F27900)'
                }}
              />
            </div>
            <span className="text-xs font-mono" style={{ color: '#E6E8BF' }}>5Hz</span>
          </div>
          <div className="text-sm font-mono px-2 py-1 rounded min-w-[50px] text-center" style={{ 
            color: '#DDDA00', 
            backgroundColor: '#2F2E3E',
            border: `1px solid #E6E8BF`
          }}>
            {phaserRate.toFixed(1)}Hz
          </div>
        </div>

        {/* Phaser Depth */}
        <div className="flex flex-col items-center gap-4 rounded-xl p-6 shadow-lg border-2 min-w-[140px]" style={{ 
          backgroundColor: '#2F2E3E', 
          borderColor: '#E6E8BF' 
        }}>
          <label htmlFor="phaserDepth" className="font-bold text-xs tracking-wider" style={{ color: '#DDDA00' }}>
            PHASER DEPTH
          </label>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono" style={{ color: '#E6E8BF' }}>0%</span>
            <div className="relative">
              <input
                id="phaserDepth"
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={phaserDepth}
                onChange={(e) => setPhaserDepth(Number(e.target.value))}
                className="w-24 h-2 cursor-pointer"
                style={{
                  accentColor: '#DDDA00',
                  background: 'linear-gradient(to right, #DDDA00, #F27900)'
                }}
              />
            </div>
            <span className="text-xs font-mono" style={{ color: '#E6E8BF' }}>100%</span>
          </div>
          <div className="text-sm font-mono px-2 py-1 rounded min-w-[50px] text-center" style={{ 
            color: '#DDDA00', 
            backgroundColor: '#2F2E3E',
            border: `1px solid #E6E8BF`
          }}>
            {Math.round(phaserDepth * 100)}%
          </div>
        </div>

        {/* Phaser Mix */}
        <div className="flex flex-col items-center gap-4 rounded-xl p-6 shadow-lg border-2 min-w-[140px]" style={{ 
          backgroundColor: '#2F2E3E', 
          borderColor: '#E6E8BF' 
        }}>
          <label htmlFor="phaserMix" className="font-bold text-xs tracking-wider" style={{ color: '#DDDA00' }}>
            PHASER MIX
          </label>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono" style={{ color: '#E6E8BF' }}>0%</span>
            <div className="relative">
              <input
                id="phaserMix"
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={phaserMix}
                onChange={(e) => setPhaserMix(Number(e.target.value))}
                className="w-24 h-2 cursor-pointer"
                style={{
                  accentColor: '#DDDA00',
                  background: 'linear-gradient(to right, #DDDA00, #F27900)'
                }}
              />
            </div>
            <span className="text-xs font-mono" style={{ color: '#E6E8BF' }}>100%</span>
          </div>
          <div className="text-sm font-mono px-2 py-1 rounded min-w-[50px] text-center" style={{ 
            color: '#DDDA00', 
            backgroundColor: '#2F2E3E',
            border: `1px solid #E6E8BF`
          }}>
            {Math.round(phaserMix * 100)}%
          </div>
        </div>
      </div>

      {/* Pattern Loader */}
      <div className="flex flex-col items-center gap-4">
        <h4 className="font-bold text-sm tracking-wider" style={{ color: '#E6E8BF' }}>
          PRESET PATTERNS
        </h4>
        <div className="flex flex-wrap gap-4 justify-center">
          <button
            onClick={loadRockPattern}
            className="px-8 py-4 rounded-xl font-bold text-sm tracking-wider transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg border-2"
            style={{
              backgroundColor: '#DDDA00',
              borderColor: '#E6E8BF',
              color: '#2F2E3E',
              boxShadow: '0 10px 25px -3px rgba(221, 218, 0, 0.3)'
            }}
          >
            LOAD ROCK PATTERN
          </button>
          
          <button
            onClick={loadHipHopPattern}
            className="px-8 py-4 rounded-xl font-bold text-sm tracking-wider transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg border-2"
            style={{
              backgroundColor: '#F27900',
              borderColor: '#E6E8BF',
              color: '#E6E8BF',
              boxShadow: '0 10px 25px -3px rgba(242, 121, 0, 0.3)'
            }}
          >
            LOAD HIP-HOP PATTERN
          </button>
          
          <button
            onClick={loadElectroPattern}
            className="px-8 py-4 rounded-xl font-bold text-sm tracking-wider transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg border-2"
            style={{
              backgroundColor: '#DD1D00',
              borderColor: '#E6E8BF',
              color: '#E6E8BF',
              boxShadow: '0 10px 25px -3px rgba(221, 29, 0, 0.3)'
            }}
          >
            LOAD ELECTRO PATTERN
          </button>
        </div>
      </div>
    </div>
  );
}