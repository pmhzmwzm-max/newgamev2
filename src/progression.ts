export function isRewardLevelUnlockedAtExp(
  unlockLevel: number,
  exp: number,
  getCumulativeExpForLevel: (level: number) => number,
): boolean {
  if (unlockLevel <= 0) return true;
  return exp >= getCumulativeExpForLevel(unlockLevel);
}

type AutoEquipResolvers = {
  getStageIdForExp: (exp: number) => number;
  getEffectNameForExp: (exp: number) => string;
  getGemNameForExp: (exp: number) => string;
  getMapThemeNameForExp: (exp: number) => string;
};

type AutoEquipUpdates = {
  stageId?: number;
  effectName?: string;
  gemName?: string;
  mapThemeName?: string;
};

export function getAutoEquipUpdatesForExpChange(
  beforeExp: number,
  afterExp: number,
  resolvers: AutoEquipResolvers,
): AutoEquipUpdates {
  const beforeStageId = resolvers.getStageIdForExp(beforeExp);
  const afterStageId = resolvers.getStageIdForExp(afterExp);
  const beforeEffectName = resolvers.getEffectNameForExp(beforeExp);
  const afterEffectName = resolvers.getEffectNameForExp(afterExp);
  const beforeGemName = resolvers.getGemNameForExp(beforeExp);
  const afterGemName = resolvers.getGemNameForExp(afterExp);
  const beforeMapThemeName = resolvers.getMapThemeNameForExp(beforeExp);
  const afterMapThemeName = resolvers.getMapThemeNameForExp(afterExp);

  return {
    ...(afterStageId !== beforeStageId ? { stageId: afterStageId } : {}),
    ...(afterEffectName !== beforeEffectName ? { effectName: afterEffectName } : {}),
    ...(afterGemName !== beforeGemName ? { gemName: afterGemName } : {}),
    ...(afterMapThemeName !== beforeMapThemeName ? { mapThemeName: afterMapThemeName } : {}),
  };
}
