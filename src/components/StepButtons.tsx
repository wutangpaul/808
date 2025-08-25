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
  const getButtonStyle = (index: number, isActive: boolean) => {
    let baseColor, textColor;
    
    if (index < 4 || (index >= 16 && index < 20)) {
      baseColor = '#DD1D00';
      textColor = '#E6E8BF';
    } else if ((index >= 4 && index < 8) || (index >= 20 && index < 24)) {
      baseColor = '#F27900';
      textColor = '#E6E8BF';
    } else if ((index >= 8 && index < 12) || (index >= 24 && index < 28)) {
      baseColor = '#DDDA00';
      textColor = '#2F2E3E';
    } else {
      baseColor = '#E6E8BF';
      textColor = '#2F2E3E';
    }
    
    // Make active steps more visible with much darker background for pressed effect
    if (isActive) {
      if (baseColor === '#DDDA00') {
        // For yellow buttons, use much darker yellow when active
        baseColor = '#999900';
        textColor = '#E6E8BF';
      } else if (baseColor === '#E6E8BF') {
        // For light buttons, use much darker background when active
        baseColor = '#A0A080';
        textColor = '#E6E8BF';
      } else if (baseColor === '#F27900') {
        // For orange buttons, use darker orange when active
        baseColor = '#C25500';
        textColor = '#E6E8BF';
      } else if (baseColor === '#DD1D00') {
        // For red buttons, use darker red when active
        baseColor = '#B01500';
        textColor = '#E6E8BF';
      }
    }
    
    return { backgroundColor: baseColor, color: textColor };
  };


  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Transport Controls */}
      <div className="flex justify-center">
        <button
          onClick={togglePlayback}
          className="h-16 w-32 sm:h-20 sm:w-40 rounded-xl font-bold text-base sm:text-lg tracking-wider transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg border-2"
          style={{
            backgroundColor: isPlaying ? '#DD1D00' : '#DDDA00',
            borderColor: '#E6E8BF',
            color: isPlaying ? '#E6E8BF' : '#2F2E3E',
            boxShadow: isPlaying 
              ? '0 10px 25px -3px rgba(221, 29, 0, 0.5)' 
              : '0 10px 25px -3px rgba(221, 218, 0, 0.5)'
          }}
        >
          <div className="flex items-center justify-center gap-2">
            {isPlaying ? (
              <>
                <div className="w-2 h-6 rounded-sm" style={{ backgroundColor: '#E6E8BF' }}></div>
                <div className="w-2 h-6 rounded-sm" style={{ backgroundColor: '#E6E8BF' }}></div>
                <span>STOP</span>
              </>
            ) : (
              <>
                <div className="w-0 h-0 ml-1" style={{ 
                  borderLeft: '8px solid #2F2E3E',
                  borderTop: '6px solid transparent',
                  borderBottom: '6px solid transparent'
                }}></div>
                <span>START</span>
              </>
            )}
          </div>
        </button>
      </div>

      {/* Step Buttons */}
      <div className="flex flex-col items-center gap-3 sm:gap-4">
        <h3 className="font-bold text-base sm:text-lg tracking-wider" style={{ color: '#E6E8BF' }}>
          STEP SEQUENCER
        </h3>
        
        

        {/* Step buttons - First row (1-16) */}
        <div className="grid grid-cols-8 lg:grid-cols-16 gap-2 mb-4">
          {(fillMode ? fillSequences : sequences)[selectedInstrument].slice(0, 16).map((isActive, index) => (
            <button
              key={index}
              onClick={() => toggleStep(index)}
              className="relative h-10 w-10 sm:h-12 sm:w-12 lg:h-16 lg:w-16 rounded-lg sm:rounded-xl border-2 transition-all duration-150 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl touch-manipulation"
              style={{
                ...getButtonStyle(index, isActive),
                borderColor: currentStep === index && isPlaying ? '#DDDA00' : '#E6E8BF',
                boxShadow: currentStep === index && isPlaying 
                  ? '0 10px 25px -3px rgba(221, 218, 0, 0.5), 0 0 0 2px rgba(221, 218, 0, 0.5)' 
                  : isActive 
                  ? 'inset 0 4px 8px rgba(0, 0, 0, 0.6), inset 0 -2px 4px rgba(0, 0, 0, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.1)' // Deep pressed look
                  : '0 4px 8px rgba(0, 0, 0, 0.3), 0 2px 4px rgba(255, 255, 255, 0.2) inset', // Strong raised look
                transform: currentStep === index && isPlaying 
                  ? 'scale(1.05)' 
                  : isActive 
                  ? 'scale(0.88) translateY(2px)' // Much smaller and pushed down
                  : 'scale(1)',
              }}
            >
              {/* Step number */}
              <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 text-[10px] font-bold opacity-75">
                {index + 1}
              </div>

              {/* Active state glow */}
              {isActive && (
                <div className="absolute inset-0 rounded-xl pointer-events-none" style={{ 
                  background: 'linear-gradient(to top, transparent, rgba(230, 232, 191, 0.15))' 
                }}></div>
              )}
            </button>
          ))}
        </div>

        

        {/* Step buttons - Second row (17-32) */}
        <div className="grid grid-cols-8 lg:grid-cols-16 gap-2">
          {(fillMode ? fillSequences : sequences)[selectedInstrument].slice(16, 32).map((isActive, index) => {
            const actualIndex = index + 16;
            return (
              <button
                key={actualIndex}
                onClick={() => toggleStep(actualIndex)}
                className="relative h-10 w-10 sm:h-12 sm:w-12 lg:h-16 lg:w-16 rounded-lg sm:rounded-xl border-2 transition-all duration-150 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl touch-manipulation"
                style={{
                  ...getButtonStyle(actualIndex, isActive),
                  borderColor: currentStep === actualIndex && isPlaying ? '#DDDA00' : '#E6E8BF',
                  boxShadow: currentStep === actualIndex && isPlaying 
                    ? '0 10px 25px -3px rgba(221, 218, 0, 0.5), 0 0 0 2px rgba(221, 218, 0, 0.5)' 
                    : isActive 
                    ? 'inset 0 4px 8px rgba(0, 0, 0, 0.6), inset 0 -2px 4px rgba(0, 0, 0, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.1)' // Deep pressed look
                    : '0 4px 8px rgba(0, 0, 0, 0.3), 0 2px 4px rgba(255, 255, 255, 0.2) inset', // Strong raised look
                  transform: currentStep === actualIndex && isPlaying 
                    ? 'scale(1.05)' 
                    : isActive 
                    ? 'scale(0.88) translateY(2px)' // Much smaller and pushed down
                    : 'scale(1)'
                }}
              >
                {/* Step number */}
                <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 text-[10px] font-bold opacity-75">
                  {actualIndex + 1}
                </div>

                {/* Active state glow */}
                {isActive && (
                  <div className="absolute inset-0 rounded-xl pointer-events-none" style={{ 
                    background: 'linear-gradient(to top, transparent, rgba(230, 232, 191, 0.15))' 
                  }}></div>
                )}
              </button>
            );
          })}
        </div>

        {/* Pattern indicator */}
        <div className="flex items-center gap-4 text-sm">
          <span style={{ color: '#E6E8BF' }}>Pattern:</span>
          <div className="px-3 py-1 rounded-lg font-bold" style={{
            backgroundColor: fillMode ? '#F27900' : '#2F2E3E',
            color: fillMode ? '#E6E8BF' : '#DDDA00',
            border: `1px solid #E6E8BF`
          }}>
            {fillMode ? 'FILL' : 'MAIN'} - {selectedInstrument.toUpperCase()}
          </div>
        </div>
      </div>
    </div>
  );
}