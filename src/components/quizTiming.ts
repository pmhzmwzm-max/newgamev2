export type ShotTier = 'idle' | 'normal' | 'boost' | 'super' | 'final' | 'break';

const POST_SHOT_SETTLE_MS = 120;

export const getShotTier = (combo: number): ShotTier => {
  if (combo >= 10) return 'final';
  if (combo >= 6) return 'super';
  if (combo >= 3) return 'boost';
  if (combo >= 1) return 'normal';
  return 'idle';
};

export const getRemovalCount = (combo: number, remainingBlocks: number) => {
  if (remainingBlocks <= 0) return 0;
  if (combo >= 10) return remainingBlocks;
  if (combo >= 6) return Math.min(4, remainingBlocks);
  if (combo >= 3) return Math.min(3, remainingBlocks);
  return Math.min(1, remainingBlocks);
};

export const getChargeDuration = (tier: ShotTier) => {
  if (tier === 'final') return 2;
  if (tier === 'super') return 1.1;
  if (tier === 'boost') return 0.8;
  return 0.5;
};

export const getExplosionProfile = (tier: ShotTier) => {
  if (tier === 'final') {
    return {
      flashScale: 2.95,
      shardCount: 20,
      sparkCount: 30,
      shockwaveSize: 206,
      shardDistanceBase: 184,
      sparkDistanceBase: 268,
      hasScreenFacingShards: true,
      screenShardCount: 8,
    };
  }

  if (tier === 'super') {
    return {
      flashScale: 2.42,
      shardCount: 16,
      sparkCount: 24,
      shockwaveSize: 170,
      shardDistanceBase: 152,
      sparkDistanceBase: 222,
      hasScreenFacingShards: true,
      screenShardCount: 5,
    };
  }

  if (tier === 'boost') {
    return {
      flashScale: 1.95,
      shardCount: 11,
      sparkCount: 17,
      shockwaveSize: 132,
      shardDistanceBase: 118,
      sparkDistanceBase: 170,
      hasScreenFacingShards: false,
      screenShardCount: 0,
    };
  }

  return {
    flashScale: 1.65,
    shardCount: 8,
    sparkCount: 12,
    shockwaveSize: 112,
    shardDistanceBase: 92,
    sparkDistanceBase: 138,
    hasScreenFacingShards: false,
    screenShardCount: 0,
  };
};

export const getBreakFeedbackProfile = (sourceTier: Exclude<ShotTier, 'idle' | 'break'>) => {
  if (sourceTier === 'final') {
    return {
      shakeAmplitude: 13,
      recoilScaleMin: 0.89,
      recoilScalePeak: 1.06,
      redFlashScale: 1.28,
      overlayInset: 16,
    };
  }

  if (sourceTier === 'super') {
    return {
      shakeAmplitude: 10,
      recoilScaleMin: 0.92,
      recoilScalePeak: 1.05,
      redFlashScale: 1.22,
      overlayInset: 14,
    };
  }

  if (sourceTier === 'boost') {
    return {
      shakeAmplitude: 8,
      recoilScaleMin: 0.94,
      recoilScalePeak: 1.04,
      redFlashScale: 1.18,
      overlayInset: 13,
    };
  }

  return {
    shakeAmplitude: 6,
    recoilScaleMin: 0.96,
    recoilScalePeak: 1.03,
    redFlashScale: 1.14,
    overlayInset: 12,
  };
};

export const getCameraShakeProfile = (tier: ShotTier) => {
  if (tier === 'final') {
    return {
      enabled: true,
      amplitude: 21.6,
      rotation: 2.16,
      duration: 0.72,
    };
  }

  if (tier === 'super') {
    return {
      enabled: true,
      amplitude: 14.4,
      rotation: 1.38,
      duration: 0.56,
    };
  }

  if (tier === 'boost') {
    return {
      enabled: true,
      amplitude: 8.4,
      rotation: 0.84,
      duration: 0.42,
    };
  }

  return {
    enabled: false,
    amplitude: 0,
    rotation: 0,
    duration: 0.2,
  };
};

export const getShotTiming = (tier: ShotTier, combo: number) => {
  const totalMotionDurationMs = Math.round((getChargeDuration(tier) + 0.62) * 1000);
  const shotDelay = Math.round(totalMotionDurationMs * 0.72);

  let baseAdvanceDelay = 1000;
  if (tier === 'final') baseAdvanceDelay = 1500;
  else if ((tier === 'super' && combo === 6) || (tier === 'boost' && combo === 3)) baseAdvanceDelay = 1220;
  else if (tier === 'super') baseAdvanceDelay = 1100;

  return {
    shotDelay,
    totalMotionDurationMs,
    advanceDelay: Math.max(baseAdvanceDelay, totalMotionDurationMs + POST_SHOT_SETTLE_MS),
  };
};
