export type MapLevelPosition = {
  id: number;
  top: number;
};

const MAP_TOP_MIN = -804;
const MAP_TOP_MAX = 240;
const MAP_TOP_RANGE = MAP_TOP_MAX - MAP_TOP_MIN;

export function getLevelProgressRatio(levelTop: number): number {
  return (levelTop - MAP_TOP_MIN) / MAP_TOP_RANGE;
}

export function getScrollTopForLevel(options: {
  levelTop: number;
  scrollHeight: number;
  containerHeight: number;
}) {
  const { levelTop, scrollHeight, containerHeight } = options;
  const maxScrollTop = Math.max(0, scrollHeight - containerHeight);
  const levelOffset = getLevelProgressRatio(levelTop) * scrollHeight;
  const centeredScrollTop = levelOffset - containerHeight / 2;

  return Math.max(0, Math.min(maxScrollTop, centeredScrollTop));
}

export function getHighestUnlockedLevel(
  unlockedLevels: number[],
  levels: MapLevelPosition[],
) {
  if (unlockedLevels.length === 0) {
    return null;
  }

  const highestLevel = Math.max(...unlockedLevels);
  return levels.find((level) => level.id === highestLevel) ?? null;
}
