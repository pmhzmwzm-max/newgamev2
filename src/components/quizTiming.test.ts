import { test } from 'node:test';
import * as assert from 'node:assert/strict';

import { getBreakFeedbackProfile, getCameraShakeProfile, getExplosionProfile, getShotTiming, getShotTier } from './quizTiming';

test('super combo waits for the full shot animation before advancing', () => {
  const combo = 6;
  const tier = getShotTier(combo);
  const timing = getShotTiming(tier, combo);

  assert.equal(tier, 'super');
  assert.ok(
    timing.advanceDelay >= timing.totalMotionDurationMs,
    `advanceDelay ${timing.advanceDelay} should be >= totalMotionDurationMs ${timing.totalMotionDurationMs}`
  );
});

test('final combo also waits for the full shot animation before advancing', () => {
  const combo = 10;
  const tier = getShotTier(combo);
  const timing = getShotTiming(tier, combo);

  assert.equal(tier, 'final');
  assert.ok(
    timing.advanceDelay >= timing.totalMotionDurationMs,
    `advanceDelay ${timing.advanceDelay} should be >= totalMotionDurationMs ${timing.totalMotionDurationMs}`
  );
});

test('break feedback intensity escalates from normal to final', () => {
  const normal = getBreakFeedbackProfile('normal');
  const boost = getBreakFeedbackProfile('boost');
  const superTier = getBreakFeedbackProfile('super');
  const final = getBreakFeedbackProfile('final');

  assert.ok(normal.shakeAmplitude < boost.shakeAmplitude);
  assert.ok(boost.shakeAmplitude < superTier.shakeAmplitude);
  assert.ok(superTier.shakeAmplitude < final.shakeAmplitude);
});

test('super and final explosions enable screen-facing shards', () => {
  const boost = getExplosionProfile('boost');
  const superTier = getExplosionProfile('super');
  const final = getExplosionProfile('final');

  assert.equal(boost.hasScreenFacingShards, false);
  assert.equal(superTier.hasScreenFacingShards, true);
  assert.equal(final.hasScreenFacingShards, true);
  assert.ok(superTier.screenShardCount > 0);
  assert.ok(final.screenShardCount > superTier.screenShardCount);
});

test('camera shake escalates by shot tier and stays off for normal hits', () => {
  const normal = getCameraShakeProfile('normal');
  const boost = getCameraShakeProfile('boost');
  const superTier = getCameraShakeProfile('super');
  const final = getCameraShakeProfile('final');

  assert.equal(normal.enabled, false);
  assert.equal(boost.enabled, true);
  assert.equal(superTier.enabled, true);
  assert.equal(final.enabled, true);
  assert.equal(boost.amplitude, 8.4);
  assert.equal(superTier.amplitude, 14.4);
  assert.equal(final.amplitude, 21.6);
  assert.ok(boost.amplitude < superTier.amplitude);
  assert.ok(superTier.amplitude < final.amplitude);
});
