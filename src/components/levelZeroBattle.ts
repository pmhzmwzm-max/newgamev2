import type { ShotTier } from './quizTiming';

export const LEVEL_ZERO_BATTLE_CONFIG = {
  totalBlocks: 12,
  columns: 4,
  rows: 3,
} as const;

export function isLevelZeroTutorial(gradeId: string | undefined, levelId: number): boolean {
  return gradeId === '3' && levelId === 0;
}

export function getLevelZeroShotPlan(questionIndex: number, remainingBlocks: number): {
  tier: Extract<ShotTier, 'super' | 'final'>;
  removal: number;
} {
  const safeRemaining = Math.max(0, remainingBlocks);
  if (questionIndex >= 2) {
    return {
      tier: 'final',
      removal: safeRemaining,
    };
  }

  return {
    tier: 'super',
    removal: Math.min(4, safeRemaining),
  };
}
