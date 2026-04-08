import test from 'node:test';
import assert from 'node:assert/strict';

import { getAutoEquipUpdatesForExpChange, isRewardLevelUnlockedAtExp } from './progression.ts';

test('reward assets stay locked until the reward level is actually completed', () => {
  const cumulativeExpByLevel = new Map([
    [3, 30],
    [5, 50],
    [6, 60],
  ]);
  const getCumulativeExpForLevel = (level: number) => cumulativeExpByLevel.get(level) ?? 0;

  assert.equal(isRewardLevelUnlockedAtExp(6, 50, getCumulativeExpForLevel), false);
  assert.equal(isRewardLevelUnlockedAtExp(6, 60, getCumulativeExpForLevel), true);
  assert.equal(isRewardLevelUnlockedAtExp(3, 20, getCumulativeExpForLevel), false);
  assert.equal(isRewardLevelUnlockedAtExp(3, 30, getCumulativeExpForLevel), true);
  assert.equal(isRewardLevelUnlockedAtExp(5, 40, getCumulativeExpForLevel), false);
  assert.equal(isRewardLevelUnlockedAtExp(5, 50, getCumulativeExpForLevel), true);
});

test('auto equip updates only the loadout parts newly unlocked by the exp increase', () => {
  const updates = getAutoEquipUpdatesForExpChange(50, 60, {
    getStageIdForExp: (exp) => (exp >= 100 ? 3 : 2),
    getEffectNameForExp: (exp) => (exp >= 70 ? '晨火III' : '晨火II'),
    getGemNameForExp: (exp) => (exp >= 60 ? '灵感石' : '生长石'),
    getMapThemeNameForExp: (exp) => (exp >= 80 ? '映光之湖' : '低语林地'),
  });

  assert.deepEqual(updates, {
    gemName: '灵感石',
  });
});
