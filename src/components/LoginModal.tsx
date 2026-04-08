import type { FormEvent } from 'react';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';

import type { LoginMethod } from '../auth';
import { isValidMainlandChinaPhone } from '../auth';
import { growthStages } from '../data/growthRewards';

interface LoginModalProps {
  isOpen: boolean;
  pendingLevelId: number | null;
  onSubmit: (payload: { method: LoginMethod; phone: string; password?: string; code?: string }) => Promise<void>;
  onSendCode: (payload: { phone: string }) => Promise<void>;
  onCancel: () => void;
}

const SMS_COUNTDOWN_SECONDS = 60;
const guardianImage = growthStages.find((stage) => stage.name === '火纹守望者')?.image ?? '';

const agreementSections = [
  {
    title: '一、服务说明',
    body:
      '当前版本提供登录流程占位能力。你在本页面提交的手机号、密码、验证码仅用于完成当前关卡准入流程，后续可接入正式鉴权服务。',
  },
  {
    title: '二、信息使用',
    body:
      '为了保留登录状态，我们会将登录结果缓存到本地浏览器存储中，用于判断第18关及以后关卡是否需要再次拉起登录弹窗。后续接入正式服务时，可按正式隐私规则替换这里的说明。',
  },
  {
    title: '三、后续升级',
    body:
      '本协议内容为占位文案，后续可以替换为正式的《用户协议》和《隐私政策》全文，并继续沿用当前的勾选、查看、提交拦截流程，无需重做交互结构。',
  },
];

export default function LoginModal({
  isOpen,
  pendingLevelId,
  onSubmit,
  onSendCode,
  onCancel,
}: LoginModalProps) {
  const [mode, setMode] = useState<LoginMethod>('password');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showAgreement, setShowAgreement] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (!isOpen) return;

    setMode('password');
    setPhone('');
    setPassword('');
    setCode('');
    setAgreed(false);
    setToastMessage('');
    setShowAgreement(false);
    setIsSubmitting(false);
    setIsSendingCode(false);
    setCountdown(0);
  }, [isOpen]);

  useEffect(() => {
    if (countdown <= 0) return;

    const timer = window.setTimeout(() => {
      setCountdown((current) => current - 1);
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [countdown]);

  useEffect(() => {
    if (!toastMessage) return;

    const timer = window.setTimeout(() => {
      setToastMessage('');
    }, 2200);

    return () => window.clearTimeout(timer);
  }, [toastMessage]);

  if (!isOpen) return null;

  const sanitizedPhone = phone.replace(/\D/g, '').slice(0, 11);
  const phoneIsValid = isValidMainlandChinaPhone(sanitizedPhone);
  const passwordIsValid = password.trim().length > 0;
  const codeIsValid = code.trim().length > 0;
  const canSendCode = phoneIsValid && countdown === 0 && !isSendingCode;

  const validateForm = () => {
    if (!phoneIsValid) return '请输入正确的 11 位中国大陆手机号';
    if (mode === 'password' && !passwordIsValid) return '请输入密码';
    if (mode === 'code' && !codeIsValid) return '请输入验证码';
    if (!agreed) return '请先阅读并同意用户协议与隐私政策';
    return '';
  };

  const showToast = (message: string) => {
    setToastMessage(message);
  };

  const handleSendCode = async () => {
    if (!phoneIsValid) {
      showToast('请输入正确的 11 位中国大陆手机号');
      return;
    }

    setToastMessage('');
    setIsSendingCode(true);

    try {
      await onSendCode({ phone: sanitizedPhone });
      setCountdown(SMS_COUNTDOWN_SECONDS);
      showToast('验证码已发送');
    } catch (sendError) {
      showToast(sendError instanceof Error ? sendError.message : '验证码发送失败，请稍后再试');
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationMessage = validateForm();
    if (validationMessage) {
      showToast(validationMessage);
      return;
    }

    setToastMessage('');
    setIsSubmitting(true);

    try {
      await onSubmit(
        mode === 'password'
          ? {
              method: 'password',
              phone: sanitizedPhone,
              password,
            }
          : {
              method: 'code',
              phone: sanitizedPhone,
              code,
            },
      );
    } catch (submitError) {
      showToast(submitError instanceof Error ? submitError.message : '登录失败，请稍后重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 z-[140] flex items-center justify-center bg-[radial-gradient(circle_at_top,rgba(255,242,189,0.24),transparent_28%),linear-gradient(135deg,rgba(17,24,39,0.93),rgba(31,41,55,0.96))] px-6 py-10 backdrop-blur-md"
      >
        <motion.div
          initial={{ scale: 0.92, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.96, y: 12, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 22 }}
          className="relative w-full max-w-[430px] overflow-hidden rounded-[34px] border border-white/16 bg-[linear-gradient(180deg,#fffaf0_0%,#fff3d3_44%,#fee6b0_100%)] shadow-[0_30px_80px_rgba(15,23,42,0.45)]"
        >
          <div className="absolute inset-x-0 top-0 h-28 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.88),transparent_72%)]" />

          <div className="relative px-7 pb-7 pt-8">
            <button
              type="button"
              onClick={onCancel}
              className="absolute right-6 top-6 flex h-10 w-10 items-center justify-center rounded-full bg-white/68 text-xl font-black text-[#7a5937] shadow-[0_8px_18px_rgba(148,111,63,0.14)] transition active:scale-[0.96]"
              aria-label="关闭登录弹窗"
            >
              ✕
            </button>

            <div className="mb-6 px-2 pt-1 text-center">
              <div className="mx-auto mb-3 flex h-[148px] w-[148px] items-center justify-center rounded-full bg-[radial-gradient(circle,rgba(69,62,55,0.1),rgba(69,62,55,0.01)_72%)]">
                {guardianImage ? (
                  <img
                    src={guardianImage}
                    alt="火纹守望者剪影"
                    draggable={false}
                    className="h-[154px] w-[154px] select-none object-contain grayscale contrast-[2.4] brightness-0 drop-shadow-[0_14px_20px_rgba(54,44,36,0.18)]"
                  />
                ) : (
                  <div className="h-[128px] w-[128px] rounded-full bg-[#6b625b]/40" />
                )}
              </div>
              <div className="text-[28px] font-black leading-none tracking-[0.08em] text-[#5d534a]">即将进化</div>
            </div>

            <div className="mb-5 grid grid-cols-2 gap-2 rounded-[22px] bg-white/55 p-1.5 shadow-inner">
                <button
                  type="button"
                  onClick={() => {
                    setMode('password');
                    setToastMessage('');
                  }}
                  className={`rounded-[18px] px-4 py-3 text-sm font-black transition ${
                    mode === 'password' ? 'bg-[#ff9f43] text-white shadow-[0_8px_18px_rgba(251,146,60,0.35)]' : 'text-[#8a5a2f]'
                  }`}
              >
                密码登录
              </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('code');
                    setToastMessage('');
                  }}
                  className={`rounded-[18px] px-4 py-3 text-sm font-black transition ${
                    mode === 'code' ? 'bg-[#ff9f43] text-white shadow-[0_8px_18px_rgba(251,146,60,0.35)]' : 'text-[#8a5a2f]'
                  }`}
              >
                验证码登录
              </button>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="flex items-center overflow-hidden rounded-[22px] border border-[#f0c57f] bg-white shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]">
                <div className="flex h-14 items-center border-r border-[#f7d59e] bg-[#fff4d7] px-4 text-base font-black text-[#a46417]">
                  +86
                </div>
                <input
                  value={sanitizedPhone}
                  onChange={(event) => {
                    setPhone(event.target.value);
                    setToastMessage('');
                  }}
                  inputMode="numeric"
                  maxLength={11}
                  placeholder="请输入手机号"
                  className="h-14 w-full bg-transparent px-4 text-base font-semibold text-[#4b2f15] outline-none placeholder:text-[#c3a57a]"
                />
              </div>

              {mode === 'password' ? (
                <input
                  type="password"
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    setToastMessage('');
                  }}
                  placeholder="请输入密码"
                  className="h-14 w-full rounded-[22px] border border-[#f0c57f] bg-white px-4 text-base font-semibold text-[#4b2f15] outline-none placeholder:text-[#c3a57a] shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]"
                />
              ) : (
                <div className="flex gap-3">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={code}
                    onChange={(event) => {
                      setCode(event.target.value.replace(/\D/g, '').slice(0, 6));
                      setToastMessage('');
                    }}
                    placeholder="请输入验证码"
                    className="h-14 min-w-0 flex-1 rounded-[22px] border border-[#f0c57f] bg-white px-4 text-base font-semibold text-[#4b2f15] outline-none placeholder:text-[#c3a57a] shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]"
                  />
                  <button
                    type="button"
                    disabled={!canSendCode}
                    onClick={handleSendCode}
                    className={`h-14 rounded-[22px] px-4 text-sm font-black transition ${
                      canSendCode ? 'bg-[#8b5cf6] text-white shadow-[0_8px_18px_rgba(139,92,246,0.32)]' : 'bg-[#d7dbe3] text-[#8d95a3]'
                    }`}
                  >
                    {isSendingCode ? '发送中...' : countdown > 0 ? `${countdown}s` : '发送验证码'}
                  </button>
                </div>
              )}

              <label className="flex items-start gap-3 px-1 py-1 text-sm leading-6 text-[#7a5937]">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(event) => {
                    setAgreed(event.target.checked);
                    setToastMessage('');
                  }}
                  className="mt-1 h-4 w-4 rounded border-[#d8a24d] text-[#ff9f43]"
                />
                <span>
                  我已阅读并同意
                  <button
                    type="button"
                    onClick={() => setShowAgreement(true)}
                    className="mx-1 font-black text-[#eb7b23] underline decoration-[#f2aa5c] underline-offset-4"
                  >
                    《用户协议》
                  </button>
                  与
                  <button
                    type="button"
                    onClick={() => setShowAgreement(true)}
                    className="ml-1 font-black text-[#eb7b23] underline decoration-[#f2aa5c] underline-offset-4"
                  >
                    《隐私政策》
                  </button>
                </span>
              </label>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-14 w-full rounded-[22px] bg-[#ff9f43] text-base font-black text-white shadow-[0_12px_26px_rgba(251,146,60,0.4)] transition active:scale-[0.98] disabled:opacity-80"
                >
                  {isSubmitting ? '登录中...' : '登录，继续游戏'}
                </button>
              </div>
            </form>
          </div>

          <AnimatePresence>
            {toastMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                className="absolute left-1/2 top-5 z-30 w-[calc(100%-48px)] -translate-x-1/2 rounded-[18px] bg-[rgba(61,42,24,0.9)] px-4 py-3 text-center text-sm font-semibold text-white shadow-[0_12px_28px_rgba(15,23,42,0.28)]"
              >
                {toastMessage}
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {showAgreement && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-20 flex items-center justify-center bg-[linear-gradient(180deg,rgba(69,39,14,0.55),rgba(26,22,18,0.7))] p-5 backdrop-blur-sm"
              >
                <motion.div
                  initial={{ scale: 0.94, y: 12, opacity: 0 }}
                  animate={{ scale: 1, y: 0, opacity: 1 }}
                  exit={{ scale: 0.98, y: 8, opacity: 0 }}
                  className="w-full rounded-[28px] bg-[linear-gradient(180deg,#fffdf7,#fff2d7)] p-6 shadow-[0_18px_40px_rgba(15,23,42,0.26)]"
                >
                  <div>
                    <div className="mb-4">
                      <h3 className="mt-1 text-2xl font-black text-[#5a3411]">用户协议与隐私政策</h3>
                    </div>

                    <div className="max-h-[420px] space-y-4 overflow-y-auto rounded-[22px] bg-white/72 p-4 text-sm leading-7 text-[#6f4a27]">
                      {agreementSections.map((section) => (
                        <section key={section.title}>
                          <h4 className="font-black text-[#5a3411]">{section.title}</h4>
                          <p className="mt-1">{section.body}</p>
                        </section>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowAgreement(false)}
                      className="mt-5 h-14 w-full rounded-[20px] bg-[linear-gradient(180deg,#7b6048_0%,#5d4735_100%)] text-[18px] font-black text-white shadow-[0_12px_22px_rgba(86,63,40,0.22)] transition active:scale-[0.99]"
                    >
                      我知道了
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
