export const initializeAudioContext = (): AudioContext => {
  const AudioContextConstructor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  
  // Request optimal audio context settings
  const audioContext = new AudioContextConstructor({
    latencyHint: 'interactive', // Prioritize low latency over power consumption
    sampleRate: 44100, // Standard sample rate for consistency
  });
  
  // Set destination to use hardware acceleration if available
  if (audioContext.destination.channelCount) {
    audioContext.destination.channelCount = 2; // Stereo output
  }
  
  return audioContext;
};

export const createReverbImpulse = (
  audioContext: AudioContext,
  duration: number,
  decay: number
): AudioBuffer => {
  const sampleRate = audioContext.sampleRate;
  const length = sampleRate * duration;
  const impulse = audioContext.createBuffer(2, length, sampleRate);

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

export const createDelayEffect = (
  audioContext: AudioContext,
  delayTime: number,
  feedback: number,
  mix: number
) => {
  const inputGain = audioContext.createGain();
  const outputGain = audioContext.createGain();
  const dryGain = audioContext.createGain();
  const wetGain = audioContext.createGain();
  const delayNode = audioContext.createDelay(1.0);
  const feedbackGain = audioContext.createGain();

  // Set initial values
  delayNode.delayTime.value = delayTime;
  feedbackGain.gain.value = feedback;
  dryGain.gain.value = 1 - mix;
  wetGain.gain.value = mix;

  // Connect the delay network
  inputGain.connect(dryGain);
  inputGain.connect(delayNode);
  delayNode.connect(wetGain);
  delayNode.connect(feedbackGain);
  feedbackGain.connect(delayNode);

  // Mix dry and wet signals
  dryGain.connect(outputGain);
  wetGain.connect(outputGain);

  return {
    inputGain,
    outputGain,
    delayNode,
    feedbackGain,
    dryGain,
    wetGain,
  };
};

export const createPhaserEffect = (
  audioContext: AudioContext,
  rate: number,
  depth: number,
  mix: number
) => {
  const inputGain = audioContext.createGain();
  const outputGain = audioContext.createGain();
  const dryGain = audioContext.createGain();
  const wetGain = audioContext.createGain();
  const feedbackGain = audioContext.createGain();
  
  // Create allpass filters for phasing effect
  const allpass1 = audioContext.createBiquadFilter();
  const allpass2 = audioContext.createBiquadFilter();
  const allpass3 = audioContext.createBiquadFilter();
  const allpass4 = audioContext.createBiquadFilter();
  const allpass5 = audioContext.createBiquadFilter();
  const allpass6 = audioContext.createBiquadFilter();
  
  // Configure allpass filters
  [allpass1, allpass2, allpass3, allpass4, allpass5, allpass6].forEach(filter => {
    filter.type = 'allpass';
    filter.Q.value = 1.0; // Higher Q for more pronounced effect
  });
  
  // Create LFO for modulation
  const lfo = audioContext.createOscillator();
  const lfoGain = audioContext.createGain();
  
  lfo.type = 'sine';
  lfo.frequency.value = rate;
  lfoGain.gain.value = depth * 800; // Much larger frequency modulation range
  
  // Connect LFO to filter frequencies
  lfo.connect(lfoGain);
  lfoGain.connect(allpass1.frequency);
  lfoGain.connect(allpass2.frequency);
  lfoGain.connect(allpass3.frequency);
  lfoGain.connect(allpass4.frequency);
  lfoGain.connect(allpass5.frequency);
  lfoGain.connect(allpass6.frequency);
  
  // Set base frequencies for better sweep range
  allpass1.frequency.value = 440;
  allpass2.frequency.value = 880;
  allpass3.frequency.value = 1320;
  allpass4.frequency.value = 1760;
  allpass5.frequency.value = 2200;
  allpass6.frequency.value = 2640;
  
  // Add feedback for more pronounced phasing
  feedbackGain.gain.value = 0.7;
  
  // Set mix levels
  dryGain.gain.value = Math.sqrt(1 - mix); // Equal power mixing
  wetGain.gain.value = Math.sqrt(mix);
  
  // Connect the phaser network with feedback
  inputGain.connect(dryGain);
  inputGain.connect(allpass1);
  allpass1.connect(allpass2);
  allpass2.connect(allpass3);
  allpass3.connect(allpass4);
  allpass4.connect(allpass5);
  allpass5.connect(allpass6);
  
  // Add feedback loop
  allpass6.connect(feedbackGain);
  feedbackGain.connect(allpass1);
  
  // Wet signal gets phase-inverted signal for classic phaser sound
  allpass6.connect(wetGain);
  
  // Mix dry and wet signals
  dryGain.connect(outputGain);
  wetGain.connect(outputGain);
  
  // Start the LFO
  lfo.start();
  
  return {
    inputGain,
    outputGain,
    lfo,
    lfoGain,
    allpass1,
    allpass2,
    allpass3,
    allpass4,
    allpass5,
    allpass6,
    feedbackGain,
    dryGain,
    wetGain,
  };
};

export const setupMasterBus = (audioContext: AudioContext) => {
  const masterGain = audioContext.createGain();
  const reverbNode = audioContext.createConvolver();
  const dryGain = audioContext.createGain();
  const wetGain = audioContext.createGain();

  masterGain.gain.value = 1;
  reverbNode.buffer = createReverbImpulse(audioContext, 2, 3);

  // Connect master bus to parallel dry/wet chain
  masterGain.connect(dryGain);
  masterGain.connect(wetGain);

  // Connect dry path directly to output
  dryGain.connect(audioContext.destination);

  // Connect wet path through reverb to output
  wetGain.connect(reverbNode);
  reverbNode.connect(audioContext.destination);

  return {
    masterGain,
    reverbNode,
    dryGain,
    wetGain,
  };
};

export const resumeAudioContext = async (audioContext: AudioContext) => {
  if (audioContext.state === "suspended") {
    await audioContext.resume();
  }
};