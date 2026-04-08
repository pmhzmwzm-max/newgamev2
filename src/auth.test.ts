import test from 'node:test';
import assert from 'node:assert/strict';

import { createMockAuthService } from './auth.ts';

test('mock auth service resolves password login without validating credentials', async () => {
  const service = createMockAuthService();

  const result = await service.loginWithPassword({
    phone: '13800138000',
    password: 'anything',
  });

  assert.equal(result.isLoggedIn, true);
  assert.equal(result.loginMethod, 'password');
  assert.equal(result.phone, '13800138000');
});

test('mock auth service resolves code login and sms send', async () => {
  const service = createMockAuthService();

  const smsResult = await service.sendSmsCode({
    phone: '13800138000',
  });
  const loginResult = await service.loginWithCode({
    phone: '13800138000',
    code: '123456',
  });

  assert.equal(smsResult.success, true);
  assert.equal(loginResult.isLoggedIn, true);
  assert.equal(loginResult.loginMethod, 'code');
  assert.equal(loginResult.phone, '13800138000');
});
