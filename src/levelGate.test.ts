import test from 'node:test';
import assert from 'node:assert/strict';

import { LOGIN_REQUIRED_LEVEL, shouldRequireLoginForLevel } from './levelGate.ts';

test('requires login from level 18 onward', () => {
  assert.equal(LOGIN_REQUIRED_LEVEL, 18);
  assert.equal(shouldRequireLoginForLevel(17), false);
  assert.equal(shouldRequireLoginForLevel(18), true);
  assert.equal(shouldRequireLoginForLevel(30), true);
});
