export type LoginMethod = 'password' | 'code';

export interface AuthState {
  isLoggedIn: boolean;
  loginMethod: LoginMethod | null;
  phone: string;
}

export interface PasswordLoginPayload {
  phone: string;
  password: string;
}

export interface CodeLoginPayload {
  phone: string;
  code: string;
}

export interface SendSmsCodePayload {
  phone: string;
}

export interface SmsSendResult {
  success: true;
}

export interface AuthService {
  loginWithPassword(payload: PasswordLoginPayload): Promise<AuthState>;
  loginWithCode(payload: CodeLoginPayload): Promise<AuthState>;
  sendSmsCode(payload: SendSmsCodePayload): Promise<SmsSendResult>;
}

export const AUTH_STORAGE_KEY = 'authStateV1';

export const emptyAuthState: AuthState = {
  isLoggedIn: false,
  loginMethod: null,
  phone: '',
};

const MAINLAND_CHINA_PHONE_REGEX = /^1\d{10}$/;

function wait(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export function isValidMainlandChinaPhone(phone: string): boolean {
  return MAINLAND_CHINA_PHONE_REGEX.test(phone);
}

export function isAuthState(value: unknown): value is AuthState {
  if (!value || typeof value !== 'object') return false;

  const candidate = value as Partial<AuthState>;
  return (
    typeof candidate.isLoggedIn === 'boolean' &&
    typeof candidate.phone === 'string' &&
    (candidate.loginMethod === null || candidate.loginMethod === 'password' || candidate.loginMethod === 'code')
  );
}

export function createMockAuthService(): AuthService {
  return {
    async loginWithPassword({ phone }) {
      await wait(400);
      return {
        isLoggedIn: true,
        loginMethod: 'password',
        phone,
      };
    },
    async loginWithCode({ phone }) {
      await wait(400);
      return {
        isLoggedIn: true,
        loginMethod: 'code',
        phone,
      };
    },
    async sendSmsCode() {
      await wait(250);
      return { success: true };
    },
  };
}
