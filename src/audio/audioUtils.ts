export const initializeAudioContext = (): AudioContext => {
  return new (window.AudioContext || (window as any).webkitAudioContext)();
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