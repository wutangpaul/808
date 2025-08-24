import type { Instrument } from '../types';

interface StepButtonsProps {
  sequences: Record<Instrument, boolean[]>;
  fillSequences: Record<Instrument, boolean[]>;
  selectedInstrument: Instrument;
  fillMode: boolean;
  currentStep: number;
  isPlaying: boolean;
  toggleStep: (stepIndex: number) => void;
  togglePlayback: () => Promise<void>;
}

export default function StepButtons({
  sequences,
  fillSequences,
  selectedInstrument,
  fillMode,
  currentStep,
  isPlaying,
  toggleStep,
  togglePlayback,
}: StepButtonsProps) {
  const getButtonColor = (index: number) => {
    if (index < 4) {
      return "from-red-500 to-red-600";
    } else if (index < 8) {
      return "from-orange-500 to-orange-600";
    } else if (index < 12) {
      return "from-yellow-500 to-yellow-600";
    } else {
      return "from-gray-200 to-gray-300";
    }
  };

  const getButtonTextColor = (index: number) => {
    return index >= 12 ? "text-gray-800" : "text-white";
  };

  return (
    <div className="space-y-6">
      {/* Transport Controls */}
      <div className="flex justify-center">
        <button
          onClick={togglePlayback}
          className={`
            h-20 w-40 rounded-xl font-bold text-lg tracking-wider
            transition-all duration-200 transform hover:scale-105 active:scale-95
            shadow-lg border-2
            ${isPlaying 
              ? "bg-gradient-to-b from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 border-red-400 shadow-red-500/50 text-white" 
              : "bg-gradient-to-b from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 border-green-400 shadow-green-500/50 text-white"
            }
          `}
        >
          <div className="flex items-center justify-center gap-2">
            {isPlaying ? (
              <>
                <div className="w-2 h-6 bg-white rounded-sm"></div>
                <div className="w-2 h-6 bg-white rounded-sm"></div>
                <span>STOP</span>
              </>
            ) : (
              <>
                <div className="w-0 h-0 border-l-[8px] border-l-white border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent ml-1"></div>
                <span>START</span>
              </>
            )}
          </div>
        </button>
      </div>

      {/* Step Buttons */}
      <div className="flex flex-col items-center gap-4">
        <h3 className="text-orange-300 font-bold text-lg tracking-wider">
          STEP SEQUENCER
        </h3>
        
        {/* Step numbers */}
        <div className="grid grid-cols-8 lg:grid-cols-16 gap-2 mb-2">
          {Array.from({ length: 16 }, (_, i) => (
            <div key={i} className="text-center text-xs text-gray-400 font-mono w-12 lg:w-16">
              {String(i + 1).padStart(2, '0')}
            </div>
          ))}
        </div>

        {/* Step buttons - responsive grid */}
        <div className="grid grid-cols-8 lg:grid-cols-16 gap-2">
          {(fillMode ? fillSequences : sequences)[selectedInstrument].map((isActive, index) => (
            <button
              key={index}
              onClick={() => toggleStep(index)}
              className={`
                relative h-12 w-12 lg:h-16 lg:w-16 rounded-xl 
                bg-gradient-to-b ${getButtonColor(index)}
                border-2 transition-all duration-150
                transform hover:scale-105 active:scale-95
                shadow-lg hover:shadow-xl
                ${getButtonTextColor(index)}
                ${currentStep === index && isPlaying
                  ? "border-yellow-300 shadow-yellow-300/50 ring-2 ring-yellow-300/50"
                  : "border-gray-500 hover:border-gray-400"
                }
              `}
            >
              {/* Step indicator dot */}
              <div
                className={`
                  absolute top-1 left-1/2 transform -translate-x-1/2 
                  h-2 w-2 lg:h-3 lg:w-3 rounded-full transition-all duration-200
                  ${isActive && currentStep === index && isPlaying
                    ? "bg-red-400 shadow-lg shadow-red-400/50 scale-110"
                    : isActive
                    ? "bg-yellow-300 shadow-md shadow-yellow-300/50"
                    : currentStep === index && isPlaying
                    ? "bg-red-400 shadow-lg shadow-red-400/50 scale-110"
                    : "bg-transparent"
                  }
                `}
              />
              
              {/* Step number */}
              <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 text-[10px] font-bold opacity-75">
                {index + 1}
              </div>

              {/* Active state glow */}
              {isActive && (
                <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-transparent to-white/20 pointer-events-none"></div>
              )}
            </button>
          ))}
        </div>

        {/* Pattern indicator */}
        <div className="flex items-center gap-4 text-sm">
          <span className="text-gray-400">Pattern:</span>
          <div className={`px-3 py-1 rounded-lg font-bold ${fillMode ? 'bg-purple-600 text-white' : 'bg-gray-600 text-gray-300'}`}>
            {fillMode ? 'FILL' : 'MAIN'} - {selectedInstrument.toUpperCase()}
          </div>
        </div>
      </div>
    </div>
  );
}