import type { ShotTier } from './quizTiming';

type ManagedAudioNode = AudioNode & { dataset?: string; stop?: (when?: number) => void };

type ChargeProfile = {
  start: number;
  end: number;
  wobble: number;
  attack: number;
  release: number;
  wave: OscillatorType;
};

type BurstProfile = {
  base: number;
  snap: number;
  drop: number;
  noise: number;
  decay: number;
  punch: number;
  tail: number;
  sparkle: number;
};

type TierProfile = {
  gain: number;
  burstGain: number;
  sparkleGain: number;
  chargeLift: number;
  filterPeak: number;
  wobbleBoost: number;
  subBoost: number;
  tailHold: number;
  extraSparkle: number;
};

const CLOUD_PUFF_CHARGE: ChargeProfile = {
  start: 170,
  end: 480,
  wobble: 10,
  attack: 0.02,
  release: 0.13,
  wave: 'triangle',
};

const CLOUD_PUFF_BURST: BurstProfile = {
  base: 130,
  snap: 560,
  drop: 90,
  noise: 0.34,
  decay: 0.38,
  punch: 1.22,
  tail: 0.15,
  sparkle: 860,
};

const TIER_PROFILES: Record<Exclude<ShotTier, 'idle' | 'break'>, TierProfile> = {
  normal: {
    gain: 0.72,
    burstGain: 0.76,
    sparkleGain: 0.08,
    chargeLift: 0.92,
    filterPeak: 1800,
    wobbleBoost: 0.82,
    subBoost: 0,
    tailHold: 0.06,
    extraSparkle: 0,
  },
  boost: {
    gain: 0.9,
    burstGain: 0.96,
    sparkleGain: 0.14,
    chargeLift: 1.04,
    filterPeak: 2300,
    wobbleBoost: 1,
    subBoost: 0.08,
    tailHold: 0.1,
    extraSparkle: 0.04,
  },
  super: {
    gain: 1.08,
    burstGain: 1.2,
    sparkleGain: 0.24,
    chargeLift: 1.2,
    filterPeak: 3100,
    wobbleBoost: 1.24,
    subBoost: 0.18,
    tailHold: 0.16,
    extraSparkle: 0.12,
  },
  final: {
    gain: 1.24,
    burstGain: 1.42,
    sparkleGain: 0.34,
    chargeLift: 1.34,
    filterPeak: 3800,
    wobbleBoost: 1.42,
    subBoost: 0.28,
    tailHold: 0.22,
    extraSparkle: 0.22,
  },
};

let audioContext: AudioContext | null = null;
let masterGain: GainNode | null = null;
let activeNodes = new Set<ManagedAudioNode>();
let chargeToken = 0;

const noiseBufferCache = new Map<string, AudioBuffer>();

const getAudioContext = () => {
  if (typeof window === 'undefined') return null;
  if (!audioContext) {
    const Ctor = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    audioContext = new Ctor();
    masterGain = audioContext.createGain();
    masterGain.gain.value = 0.88;
    masterGain.connect(audioContext.destination);
  }
  return audioContext;
};

const cleanupNode = (node: ManagedAudioNode | null) => {
  if (!node) return;
  try {
    node.disconnect();
  } catch {
    // ignore disconnect errors during audio cleanup
  }
  activeNodes.delete(node);
};

const trackNode = <T extends ManagedAudioNode>(node: T) => {
  activeNodes.add(node);
  return node;
};

const getNoiseBuffer = (ctx: AudioContext, amount: number) => {
  const key = `${ctx.sampleRate}:${amount.toFixed(2)}`;
  const cached = noiseBufferCache.get(key);
  if (cached) return cached;

  const size = ctx.sampleRate * 0.6;
  const buffer = ctx.createBuffer(1, size, ctx.sampleRate);
  const channel = buffer.getChannelData(0);
  for (let i = 0; i < size; i += 1) {
    channel[i] = (Math.random() * 2 - 1) * amount;
  }
  noiseBufferCache.set(key, buffer);
  return buffer;
};

const stopActiveChargeNodes = () => {
  activeNodes.forEach((node) => {
    if (!node.dataset?.startsWith?.('charge')) return;
    try {
      node.stop?.();
    } catch {
      cleanupNode(node);
    }
  });
};

const markNode = <T extends ManagedAudioNode>(node: T, dataset: string) => {
  node.dataset = dataset;
  return node;
};

export const primeBattleSfx = async () => {
  const ctx = getAudioContext();
  if (!ctx) return;
  if (ctx.state === 'suspended') {
    await ctx.resume();
  }
};

export const playCloudPuffCharge = async (tier: Exclude<ShotTier, 'idle' | 'break'>, targetDurationMs: number) => {
  const ctx = getAudioContext();
  if (!ctx || !masterGain) return;
  if (ctx.state === 'suspended') {
    await ctx.resume();
  }

  chargeToken += 1;
  const token = chargeToken;
  stopActiveChargeNodes();

  const profile = TIER_PROFILES[tier];
  const now = ctx.currentTime;
  const duration = Math.max(0.18, targetDurationMs / 1000);
  const oscillator = markNode(trackNode(ctx.createOscillator() as OscillatorNode & ManagedAudioNode), 'charge-osc');
  const mod = markNode(trackNode(ctx.createOscillator() as OscillatorNode & ManagedAudioNode), 'charge-mod');
  const modGain = markNode(trackNode(ctx.createGain() as GainNode & ManagedAudioNode), 'charge-modgain');
  const gain = markNode(trackNode(ctx.createGain() as GainNode & ManagedAudioNode), 'charge-gain');
  const filter = markNode(trackNode(ctx.createBiquadFilter() as BiquadFilterNode & ManagedAudioNode), 'charge-filter');
  const air = markNode(trackNode(ctx.createOscillator() as OscillatorNode & ManagedAudioNode), 'charge-air');
  const airGain = markNode(trackNode(ctx.createGain() as GainNode & ManagedAudioNode), 'charge-airgain');

  oscillator.type = CLOUD_PUFF_CHARGE.wave;
  oscillator.frequency.setValueAtTime(CLOUD_PUFF_CHARGE.start, now);
  oscillator.frequency.exponentialRampToValueAtTime(CLOUD_PUFF_CHARGE.end * profile.chargeLift, now + duration);

  mod.type = 'sine';
  mod.frequency.setValueAtTime(CLOUD_PUFF_CHARGE.wobble, now);
  mod.frequency.linearRampToValueAtTime(CLOUD_PUFF_CHARGE.wobble * 1.6 * profile.wobbleBoost, now + duration);

  modGain.gain.setValueAtTime(10, now);
  modGain.gain.linearRampToValueAtTime(28 * profile.wobbleBoost, now + duration);

  filter.type = 'lowpass';
  filter.Q.value = 2.4;
  filter.frequency.setValueAtTime(900, now);
  filter.frequency.linearRampToValueAtTime(profile.filterPeak, now + duration);

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.linearRampToValueAtTime(0.18 * profile.gain, now + CLOUD_PUFF_CHARGE.attack);
  gain.gain.exponentialRampToValueAtTime(0.28 * profile.gain, now + duration * 0.82);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration + CLOUD_PUFF_CHARGE.release);

  air.type = 'sine';
  air.frequency.setValueAtTime(CLOUD_PUFF_CHARGE.end * 0.8, now + duration * 0.3);
  air.frequency.exponentialRampToValueAtTime(CLOUD_PUFF_CHARGE.end * (1.05 + profile.extraSparkle), now + duration);
  airGain.gain.setValueAtTime(0.0001, now);
  airGain.gain.linearRampToValueAtTime(0.015 + profile.extraSparkle * 0.05, now + duration * 0.35);
  airGain.gain.exponentialRampToValueAtTime(0.0001, now + duration + 0.04);

  mod.connect(modGain);
  modGain.connect(oscillator.frequency);
  oscillator.connect(filter);
  filter.connect(gain);
  gain.connect(masterGain);
  air.connect(airGain);
  airGain.connect(masterGain);

  oscillator.start(now);
  mod.start(now);
  air.start(now + duration * 0.18);
  oscillator.stop(now + duration + CLOUD_PUFF_CHARGE.release + 0.02);
  mod.stop(now + duration + CLOUD_PUFF_CHARGE.release + 0.02);
  air.stop(now + duration + 0.06);

  oscillator.onended = () => {
    if (token === chargeToken) {
      cleanupNode(oscillator);
      cleanupNode(mod);
      cleanupNode(modGain);
      cleanupNode(gain);
      cleanupNode(filter);
      cleanupNode(air);
      cleanupNode(airGain);
    }
  };
};

export const playCloudPuffBurst = async (tier: Exclude<ShotTier, 'idle' | 'break'>) => {
  const ctx = getAudioContext();
  if (!ctx || !masterGain) return;
  if (ctx.state === 'suspended') {
    await ctx.resume();
  }

  chargeToken += 1;
  stopActiveChargeNodes();

  const profile = TIER_PROFILES[tier];
  const now = ctx.currentTime;
  const thump = trackNode(ctx.createOscillator() as OscillatorNode & ManagedAudioNode);
  const snap = trackNode(ctx.createOscillator() as OscillatorNode & ManagedAudioNode);
  const sparkle = trackNode(ctx.createOscillator() as OscillatorNode & ManagedAudioNode);
  const thumpGain = trackNode(ctx.createGain() as GainNode & ManagedAudioNode);
  const snapGain = trackNode(ctx.createGain() as GainNode & ManagedAudioNode);
  const sparkleGain = trackNode(ctx.createGain() as GainNode & ManagedAudioNode);
  const thumpFilter = trackNode(ctx.createBiquadFilter() as BiquadFilterNode & ManagedAudioNode);
  const noiseSource = trackNode(ctx.createBufferSource() as AudioBufferSourceNode & ManagedAudioNode);
  const noiseGain = trackNode(ctx.createGain() as GainNode & ManagedAudioNode);
  const noiseFilter = trackNode(ctx.createBiquadFilter() as BiquadFilterNode & ManagedAudioNode);
  const sub = trackNode(ctx.createOscillator() as OscillatorNode & ManagedAudioNode);
  const subGain = trackNode(ctx.createGain() as GainNode & ManagedAudioNode);
  const tail = trackNode(ctx.createOscillator() as OscillatorNode & ManagedAudioNode);
  const tailGain = trackNode(ctx.createGain() as GainNode & ManagedAudioNode);
  const finalShine = trackNode(ctx.createOscillator() as OscillatorNode & ManagedAudioNode);
  const finalShineGain = trackNode(ctx.createGain() as GainNode & ManagedAudioNode);

  thump.type = 'sine';
  thump.frequency.setValueAtTime(CLOUD_PUFF_BURST.base, now);
  thump.frequency.exponentialRampToValueAtTime(CLOUD_PUFF_BURST.drop, now + CLOUD_PUFF_BURST.decay);

  snap.type = 'triangle';
  snap.frequency.setValueAtTime(CLOUD_PUFF_BURST.snap * profile.burstGain, now);
  snap.frequency.exponentialRampToValueAtTime(CLOUD_PUFF_BURST.drop * 2 * profile.burstGain, now + CLOUD_PUFF_BURST.tail);

  sparkle.type = 'square';
  sparkle.frequency.setValueAtTime(CLOUD_PUFF_BURST.sparkle, now + 0.01);
  sparkle.frequency.exponentialRampToValueAtTime(CLOUD_PUFF_BURST.sparkle * 0.62, now + CLOUD_PUFF_BURST.tail + 0.08 + profile.tailHold);

  sub.type = 'sine';
  sub.frequency.setValueAtTime(Math.max(58, CLOUD_PUFF_BURST.base * 0.48), now);
  sub.frequency.exponentialRampToValueAtTime(Math.max(38, CLOUD_PUFF_BURST.drop * 0.42), now + CLOUD_PUFF_BURST.decay + profile.tailHold);

  tail.type = 'triangle';
  tail.frequency.setValueAtTime(CLOUD_PUFF_BURST.snap * 0.48, now + 0.03);
  tail.frequency.exponentialRampToValueAtTime(CLOUD_PUFF_BURST.drop * 1.4, now + CLOUD_PUFF_BURST.tail + profile.tailHold);

  finalShine.type = 'sine';
  finalShine.frequency.setValueAtTime(CLOUD_PUFF_BURST.sparkle * 1.18, now + 0.05);
  finalShine.frequency.exponentialRampToValueAtTime(CLOUD_PUFF_BURST.sparkle * 0.74, now + 0.22 + profile.tailHold);

  thumpFilter.type = 'lowpass';
  thumpFilter.frequency.value = 560;
  thumpFilter.Q.value = 1.2;

  noiseFilter.type = 'bandpass';
  noiseFilter.frequency.value = 1280;
  noiseFilter.Q.value = 0.8;

  thumpGain.gain.setValueAtTime(0.0001, now);
  thumpGain.gain.linearRampToValueAtTime(0.28 * CLOUD_PUFF_BURST.punch * profile.burstGain, now + 0.012);
  thumpGain.gain.exponentialRampToValueAtTime(0.0001, now + CLOUD_PUFF_BURST.decay + 0.02);

  snapGain.gain.setValueAtTime(0.0001, now);
  snapGain.gain.linearRampToValueAtTime(0.22 * profile.burstGain, now + 0.006);
  snapGain.gain.exponentialRampToValueAtTime(0.0001, now + CLOUD_PUFF_BURST.tail + 0.07 + profile.tailHold);

  sparkleGain.gain.setValueAtTime(0.0001, now + 0.01);
  sparkleGain.gain.linearRampToValueAtTime(profile.sparkleGain, now + 0.02);
  sparkleGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18 + profile.tailHold);

  noiseGain.gain.setValueAtTime(0.0001, now);
  noiseGain.gain.linearRampToValueAtTime(CLOUD_PUFF_BURST.noise * profile.burstGain, now + 0.008);
  noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + CLOUD_PUFF_BURST.decay + 0.08 + profile.tailHold);

  subGain.gain.setValueAtTime(0.0001, now);
  subGain.gain.linearRampToValueAtTime(profile.subBoost, now + 0.012);
  subGain.gain.exponentialRampToValueAtTime(0.0001, now + CLOUD_PUFF_BURST.decay + profile.tailHold + 0.04);

  tailGain.gain.setValueAtTime(0.0001, now + 0.03);
  tailGain.gain.linearRampToValueAtTime(0.06 + profile.extraSparkle * 0.12, now + 0.05);
  tailGain.gain.exponentialRampToValueAtTime(0.0001, now + CLOUD_PUFF_BURST.tail + profile.tailHold + 0.1);

  finalShineGain.gain.setValueAtTime(0.0001, now + 0.05);
  finalShineGain.gain.linearRampToValueAtTime(tier === 'final' ? 0.14 : 0.0001, now + 0.08);
  finalShineGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.26 + profile.tailHold);

  noiseSource.buffer = getNoiseBuffer(ctx, 0.7);

  thump.connect(thumpFilter);
  thumpFilter.connect(thumpGain);
  thumpGain.connect(masterGain);
  snap.connect(snapGain);
  snapGain.connect(masterGain);
  sparkle.connect(sparkleGain);
  sparkleGain.connect(masterGain);
  noiseSource.connect(noiseFilter);
  noiseFilter.connect(noiseGain);
  noiseGain.connect(masterGain);
  sub.connect(subGain);
  subGain.connect(masterGain);
  tail.connect(tailGain);
  tailGain.connect(masterGain);
  finalShine.connect(finalShineGain);
  finalShineGain.connect(masterGain);

  thump.start(now);
  snap.start(now);
  sparkle.start(now + 0.01);
  noiseSource.start(now);
  sub.start(now);
  tail.start(now + 0.03);
  if (tier === 'final') {
    finalShine.start(now + 0.05);
  }

  thump.stop(now + CLOUD_PUFF_BURST.decay + 0.04);
  snap.stop(now + CLOUD_PUFF_BURST.tail + 0.08 + profile.tailHold);
  sparkle.stop(now + 0.22 + profile.tailHold);
  noiseSource.stop(now + CLOUD_PUFF_BURST.decay + 0.1 + profile.tailHold);
  sub.stop(now + CLOUD_PUFF_BURST.decay + profile.tailHold + 0.08);
  tail.stop(now + CLOUD_PUFF_BURST.tail + profile.tailHold + 0.12);
  if (tier === 'final') {
    finalShine.stop(now + 0.3 + profile.tailHold);
  }

  thump.onended = () => {
    cleanupNode(thump);
    cleanupNode(thumpGain);
    cleanupNode(thumpFilter);
  };
  snap.onended = () => {
    cleanupNode(snap);
    cleanupNode(snapGain);
  };
  sparkle.onended = () => {
    cleanupNode(sparkle);
    cleanupNode(sparkleGain);
  };
  noiseSource.onended = () => {
    cleanupNode(noiseSource);
    cleanupNode(noiseGain);
    cleanupNode(noiseFilter);
  };
  sub.onended = () => {
    cleanupNode(sub);
    cleanupNode(subGain);
  };
  tail.onended = () => {
    cleanupNode(tail);
    cleanupNode(tailGain);
  };
  finalShine.onended = () => {
    cleanupNode(finalShine);
    cleanupNode(finalShineGain);
  };
};

export const playCloudPuffBreak = async (sourceTier: Exclude<ShotTier, 'idle' | 'break'>) => {
  const ctx = getAudioContext();
  if (!ctx || !masterGain) return;
  if (ctx.state === 'suspended') {
    await ctx.resume();
  }

  chargeToken += 1;
  stopActiveChargeNodes();

  const profile = TIER_PROFILES[sourceTier];
  const now = ctx.currentTime;
  const puff = trackNode(ctx.createOscillator() as OscillatorNode & ManagedAudioNode);
  const puffGain = trackNode(ctx.createGain() as GainNode & ManagedAudioNode);
  const puffFilter = trackNode(ctx.createBiquadFilter() as BiquadFilterNode & ManagedAudioNode);
  const hiss = trackNode(ctx.createBufferSource() as AudioBufferSourceNode & ManagedAudioNode);
  const hissGain = trackNode(ctx.createGain() as GainNode & ManagedAudioNode);
  const hissFilter = trackNode(ctx.createBiquadFilter() as BiquadFilterNode & ManagedAudioNode);

  puff.type = 'triangle';
  puff.frequency.setValueAtTime(220 + profile.burstGain * 24, now);
  puff.frequency.exponentialRampToValueAtTime(92, now + 0.16);

  puffFilter.type = 'lowpass';
  puffFilter.frequency.value = 780;
  puffFilter.Q.value = 0.7;

  puffGain.gain.setValueAtTime(0.0001, now);
  puffGain.gain.linearRampToValueAtTime(0.14 + profile.subBoost * 0.18, now + 0.012);
  puffGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);

  hiss.buffer = getNoiseBuffer(ctx, 0.44);
  hissFilter.type = 'bandpass';
  hissFilter.frequency.value = 920;
  hissFilter.Q.value = 0.6;
  hissGain.gain.setValueAtTime(0.0001, now);
  hissGain.gain.linearRampToValueAtTime(0.08 + profile.extraSparkle * 0.08, now + 0.008);
  hissGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);

  puff.connect(puffFilter);
  puffFilter.connect(puffGain);
  puffGain.connect(masterGain);
  hiss.connect(hissFilter);
  hissFilter.connect(hissGain);
  hissGain.connect(masterGain);

  puff.start(now);
  hiss.start(now);
  puff.stop(now + 0.2);
  hiss.stop(now + 0.18);

  puff.onended = () => {
    cleanupNode(puff);
    cleanupNode(puffGain);
    cleanupNode(puffFilter);
  };
  hiss.onended = () => {
    cleanupNode(hiss);
    cleanupNode(hissGain);
    cleanupNode(hissFilter);
  };
};
