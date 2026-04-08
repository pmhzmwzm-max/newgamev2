import test from 'node:test';
import assert from 'node:assert/strict';

import { shouldPlayRewardCinematic } from './GrowthRewardModal';

test('hidden finale rewards with cinematic data still trigger the full-screen cinematic', () => {
  const reward = {
    newRewardKind: 'hidden',
    evolutionCinematic: {
      fromName: '炽界主灵',
      toName: '寂焰王座',
      fromImage: '/mock/from.png',
      toImage: '/mock/to.png',
    },
  };

  assert.equal(shouldPlayRewardCinematic(reward as Parameters<typeof shouldPlayRewardCinematic>[0]), true);
});

test('rewards without cinematic data do not trigger the full-screen cinematic', () => {
  assert.equal(shouldPlayRewardCinematic(null), false);
  assert.equal(
    shouldPlayRewardCinematic({
      newRewardKind: 'hidden',
      evolutionCinematic: {
        fromName: '炽界主灵',
        toName: '寂焰王座',
        fromImage: '/mock/from.png',
      },
    } as Parameters<typeof shouldPlayRewardCinematic>[0]),
    false
  );
});
