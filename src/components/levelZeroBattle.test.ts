import test from 'node:test';
import assert from 'node:assert/strict';

import { LEVEL_ZERO_BATTLE_CONFIG, getLevelZeroShotPlan, isLevelZeroTutorial } from './levelZeroBattle';

test('level zero tutorial detection only matches grade 3 level 0', () => {
  assert.equal(isLevelZeroTutorial('3', 0), true);
  assert.equal(isLevelZeroTutorial('3', 1), false);
  assert.equal(isLevelZeroTutorial('2', 0), false);
});

test('level zero tutorial uses super, super, final pacing and clears all remaining gems on the last hit', () => {
  const first = getLevelZeroShotPlan(0, LEVEL_ZERO_BATTLE_CONFIG.totalBlocks);
  const second = getLevelZeroShotPlan(1, LEVEL_ZERO_BATTLE_CONFIG.totalBlocks - first.removal);
  const third = getLevelZeroShotPlan(2, LEVEL_ZERO_BATTLE_CONFIG.totalBlocks - first.removal - second.removal);

  assert.deepEqual(first, { tier: 'super', removal: 4 });
  assert.deepEqual(second, { tier: 'super', removal: 4 });
  assert.deepEqual(third, { tier: 'final', removal: 4 });
});
