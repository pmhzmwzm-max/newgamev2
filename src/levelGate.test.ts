import test from 'node:test';
import assert from 'node:assert/strict';

import { LOGIN_REQUIRED_LEVEL, shouldRequireLoginForLevel } from './levelGate.ts';

test('requires login from level 4 onward', () => {
  assert.equal(LOGIN_REQUIRED_LEVEL, 4);
  assert.equal(shouldRequireLoginForLevel(3), false);
  assert.equal(shouldRequireLoginForLevel(4), true);
  assert.equal(shouldRequireLoginForLevel(30), true);
});
