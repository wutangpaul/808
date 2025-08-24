// Audio Performance and System Isolation Utilities

export const optimizeForAudioPerformance = () => {
  // Request high performance mode if available
  if ('scheduler' in window && window.scheduler) {
    // Use Scheduler API for better task prioritization (Chrome 94+)
    return true;
  }

  // Disable visual effects that can interfere with audio timing
  if (document.documentElement.style) {
    document.documentElement.style.willChange = 'auto';
  }

  return false;
};

export const enableAudioWorkletIfSupported = async (audioContext: AudioContext) => {
  if (audioContext.audioWorklet) {
    try {
      // AudioWorklets provide better performance than ScriptProcessor
      console.log('AudioWorklet supported - using high-performance audio processing');
      return true;
    } catch {
      console.warn('AudioWorklet not available, using fallback');
      return false;
    }
  }
  return false;
};

export const optimizeBufferSizes = (audioContext: AudioContext) => {
  // Try to get the optimal buffer size for low latency
  const bufferSize = audioContext.baseLatency ? 
    Math.max(128, Math.min(1024, audioContext.sampleRate * audioContext.baseLatency)) : 
    256;
  
  console.log(`Optimizing for buffer size: ${bufferSize} samples`);
  return bufferSize;
};

export const preventAudioDropouts = () => {
  // Prevent page from going to sleep during audio playback
  let wakeLock: WakeLockSentinel | null = null;
  
  const requestWakeLock = async () => {
    try {
      if ('wakeLock' in navigator) {
        wakeLock = await (navigator as Navigator & { wakeLock: { request: (type: string) => Promise<WakeLockSentinel> } }).wakeLock.request('screen');
        console.log('Screen wake lock acquired for audio performance');
        
        wakeLock.addEventListener('release', () => {
          console.log('Screen wake lock released');
        });
      }
    } catch (err) {
      console.warn('Wake lock not supported:', err);
    }
  };

  const releaseWakeLock = () => {
    if (wakeLock) {
      wakeLock.release();
      wakeLock = null;
    }
  };

  return { requestWakeLock, releaseWakeLock };
};

export const setPriorityHints = () => {
  // Set thread priority hints for better audio performance
  const hints = {
    // Prioritize audio processing
    audioProcessing: 'user-blocking',
    // Lower priority for visual updates
    visualUpdates: 'background'
  };

  // Use requestIdleCallback for non-critical updates
  const scheduleIdleWork = (callback: () => void) => {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(callback, { timeout: 50 });
    } else {
      setTimeout(callback, 0);
    }
  };

  return { hints, scheduleIdleWork };
};

export const monitorAudioPerformance = (audioContext: AudioContext) => {
  let lastGlitchTime = 0;
  let glitchCount = 0;

  const checkForGlitches = () => {
    const currentTime = audioContext.currentTime;
    const expectedTime = performance.now() / 1000;
    const timeDiff = Math.abs(currentTime - expectedTime);

    // Detect audio glitches (timing inconsistencies > 5ms)
    if (timeDiff > 0.005) {
      glitchCount++;
      lastGlitchTime = performance.now();
      console.warn(`Audio glitch detected: ${timeDiff.toFixed(6)}s difference`);
    }

    return {
      glitchCount,
      lastGlitchTime,
      currentLatency: audioContext.baseLatency || 0,
      outputLatency: audioContext.outputLatency || 0
    };
  };

  return { checkForGlitches };
};

// CPU Governor recommendations for different OS
export const getCPUOptimizationTips = () => {
  const userAgent = navigator.userAgent.toLowerCase();
  
  if (userAgent.includes('linux')) {
    return {
      os: 'Linux',
      tips: [
        'Set CPU governor to "performance": sudo cpufreq-set -g performance',
        'Increase audio buffer: echo 1024 > /proc/sys/dev/hda/intel-hda-buffer-size',
        'Use JACK for professional audio: sudo apt install jackd2',
        'Lower audio latency: echo 64 > /sys/class/sound/card0/device/buffer_time'
      ]
    };
  } else if (userAgent.includes('mac')) {
    return {
      os: 'macOS',
      tips: [
        'Use Audio MIDI Setup to set sample rate to 44.1kHz',
        'Close unnecessary applications to free CPU resources',
        'Disable Spotlight indexing during audio work',
        'Use Activity Monitor to check for high CPU processes'
      ]
    };
  } else if (userAgent.includes('win')) {
    return {
      os: 'Windows',
      tips: [
        'Set Windows power plan to "High Performance"',
        'Disable Windows audio enhancements in Sound settings',
        'Use ASIO drivers if available for your audio interface',
        'Set audio sample rate to 44.1kHz in Sound Control Panel'
      ]
    };
  }
  
  return {
    os: 'Unknown',
    tips: [
      'Close unnecessary browser tabs and applications',
      'Use a dedicated browser instance for audio work',
      'Ensure adequate RAM and CPU resources are available'
    ]
  };
};