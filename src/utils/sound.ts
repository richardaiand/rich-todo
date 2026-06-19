// Lego brick click/connect sound using Web Audio API
let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  return audioCtx;
}

export function playClickSound(type: 'check' | 'uncheck' = 'check') {
  try {
    const ctx = getAudioContext();
    const t = ctx.currentTime;

    // Main click - two quick impulses for a plastic "clack"
    const impulse1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    impulse1.type = 'triangle';
    impulse1.frequency.value = type === 'check' ? 800 : 500;
    gain1.gain.setValueAtTime(0.15, t);
    gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
    impulse1.connect(gain1);
    gain1.connect(ctx.destination);
    impulse1.start(t);
    impulse1.stop(t + 0.06);

    const noise = ctx.createBufferSource();
    const bufferSize = ctx.sampleRate * 0.04;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.2));
    }
    noise.buffer = buffer;
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.08, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
    noise.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noise.start(t);

    if (type === 'check') {
      const impulse2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      impulse2.type = 'sine';
      impulse2.frequency.value = 1200;
      gain2.gain.setValueAtTime(0.08, t + 0.02);
      gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
      impulse2.connect(gain2);
      gain2.connect(ctx.destination);
      impulse2.start(t + 0.02);
      impulse2.stop(t + 0.08);
    }
  } catch {
    // Ignore audio errors
  }
}
