import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Lock } from 'lucide-react';
import type { RewardCardModel } from '../data/growthRewards';

interface GrowthRewardModalProps {
  isOpen: boolean;
  reward: RewardCardModel | null;
  onClose: () => void;
  onViewPokedex: () => void;
}

export default function GrowthRewardModal({
  isOpen,
  reward,
  onClose,
  onViewPokedex,
}: GrowthRewardModalProps) {
  if (!reward) return null;

  const handleAcknowledge = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onClose();
  };

  const nextStage = reward.nextStage;
  const showRewardHero = Boolean(reward.newRewardLabel);
  const isPreviewDominant = !showRewardHero;
  const previewText = isPreviewDominant ? reward.teaserText.replace('，', '，\n') : reward.teaserText;
  const isHiddenFinale = reward.focus === 'hidden_finale';
  const isHiddenNextStage = Boolean(nextStage?.hidden) && !isHiddenFinale;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-purple-900/90 via-indigo-900/90 to-blue-900/90 backdrop-blur-md"
          onClick={onClose}
        >
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ x: Math.random() * 1000, y: -20, rotate: 0, opacity: 0 }}
                animate={{ y: 800, rotate: 360, opacity: [0, 1, 1, 0] }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  delay: i * 0.15,
                  repeat: Infinity,
                  ease: 'linear',
                }}
                className="absolute text-2xl"
              >
                {['✨', '⭐', '🌟', '💫'][Math.floor(Math.random() * 4)]}
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ scale: 0, rotate: -720, y: -200, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, y: 0, opacity: 1 }}
            transition={{ type: 'spring', bounce: 0.3, duration: 1.2, delay: 0.3 }}
            onClick={(event) => event.stopPropagation()}
            className="relative"
          >
            <motion.div
              animate={{
                boxShadow: [
                  '0 0 30px rgba(251,191,36,0.5)',
                  '0 0 60px rgba(251,146,60,0.8)',
                  '0 0 30px rgba(251,191,36,0.5)',
                ],
              }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="h-[660px] w-[436px] max-w-[calc(100vw-40px)] rounded-[2.5rem] bg-gradient-to-br from-white/40 via-white/20 to-white/10 p-1"
            >
              <div className="relative flex h-full w-full flex-col overflow-hidden rounded-[2.25rem] bg-gradient-to-br from-orange-300 via-orange-400 to-rose-400">
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute top-4 left-4 text-6xl">✨</div>
                  <div className="absolute top-8 right-6 text-4xl">⭐</div>
                  <div className="absolute bottom-16 left-6 text-3xl">🌟</div>
                  <div className="absolute bottom-8 right-4 text-5xl">💫</div>
                </div>

                <div className="flex flex-1 flex-col px-6 pt-12 pb-4">
                  <div className={`${showRewardHero ? 'mb-5 h-[186px]' : 'mb-4 h-0 min-h-0 overflow-hidden'}`}>
                    {showRewardHero ? (
                      <>
                        <motion.div
                          animate={{ y: [0, -10, 0], scale: [1, 1.03, 1] }}
                          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                          className="mx-auto mb-4 flex h-28 w-28 items-center justify-center rounded-[28px] border-4 border-white/50 bg-white/25 p-3 text-center shadow-2xl backdrop-blur-sm"
                        >
                          {reward.rewardHeroImage ? (
                            <div className="relative flex h-full w-full items-center justify-center">
                              {reward.newRewardKind === 'hidden' ? (
                                <>
                                  <div className="absolute inset-1 rounded-[18px] bg-[radial-gradient(circle,rgba(255,250,205,0.32),rgba(147,51,234,0.08)_58%,transparent_78%)]" />
                                  <img
                                    src={reward.rewardHeroImage}
                                    alt={reward.newRewardLabel}
                                    draggable={false}
                                    className="relative z-10 h-full w-full select-none object-contain drop-shadow-[0_0_18px_rgba(255,230,170,0.45)]"
                                  />
                                </>
                              ) : reward.newRewardKind === 'gem' ? (
                                <img
                                  src={reward.rewardHeroImage}
                                  alt={reward.newRewardLabel}
                                  draggable={false}
                                  className="h-[110%] w-[110%] select-none object-contain drop-shadow-[0_10px_18px_rgba(255,255,255,0.3)]"
                                />
                              ) : reward.newRewardKind === 'bg' ? (
                                <img
                                  src={reward.rewardHeroImage}
                                  alt={reward.newRewardLabel}
                                  draggable={false}
                                  className="h-full w-full rounded-[18px] object-cover shadow-[0_8px_16px_rgba(0,0,0,0.18)]"
                                />
                              ) : reward.newRewardKind === 'sfx' ? (
                                <img
                                  src={reward.rewardHeroImage}
                                  alt={reward.newRewardLabel}
                                  draggable={false}
                                  className="h-[118%] w-[118%] select-none object-contain drop-shadow-[0_14px_22px_rgba(255,245,196,0.32)]"
                                />
                              ) : (
                                <img
                                  src={reward.rewardHeroImage}
                                  alt={reward.newRewardLabel}
                                  draggable={false}
                                  className="h-full w-full select-none object-contain"
                                />
                              )}
                            </div>
                          ) : (
                            <div className="flex h-full w-full items-center justify-center rounded-[18px] border-2 border-dashed border-white/70 bg-black/10 px-2 text-sm font-black leading-5 text-white whitespace-pre-line">
                              {reward.newRewardLabel.replace(/：/g, '：\n')}
                            </div>
                          )}
                        </motion.div>

                        <div className="text-center">
                          <h2 className="mb-2 text-[30px] font-black leading-[1.15] text-white" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                            {reward.newRewardLabel}
                          </h2>
                          <div className="mb-4 flex justify-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <motion.div
                                key={i}
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ delay: 1 + i * 0.1, type: 'spring' }}
                              >
                                <span className="text-yellow-200">✨</span>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      </>
                    ) : (
                      <></>
                    )}
                  </div>

                  <div
                    className={`relative px-4 text-center text-white/92 ${
                      isPreviewDominant
                        ? 'mb-4 flex flex-1 items-center justify-center py-8'
                        : 'mb-4 flex min-h-[96px] items-center justify-center py-4'
                    }`}
                  >
                    <div className={`relative z-10 inline-flex max-w-[92%] items-center justify-center ${isPreviewDominant ? 'px-6 py-5' : 'px-8 py-3'}`}>
                      <div
                        className="absolute left-1/2 top-1/2 rounded-full"
                        style={{
                          width: isPreviewDominant ? '100%' : 'calc(100% + 24px)',
                          height: isPreviewDominant ? '100px' : '42px',
                          transform: 'translate(-50%, -50%)',
                          background: isPreviewDominant
                            ? 'linear-gradient(90deg, rgba(255,216,148,0) 0%, rgba(255,230,182,0.2) 12%, rgba(255,241,214,0.92) 50%, rgba(255,230,182,0.2) 88%, rgba(255,216,148,0) 100%)'
                            : 'linear-gradient(90deg, rgba(255,216,148,0) 0%, rgba(255,226,172,0.08) 12%, rgba(255,238,201,0.72) 50%, rgba(255,226,172,0.08) 88%, rgba(255,216,148,0) 100%)',
                          filter: isPreviewDominant ? 'blur(10px)' : 'blur(4px)',
                        }}
                      />
                      {!isPreviewDominant ? (
                        <div className="absolute -right-3 -top-1 text-[12px] text-[#fff1c7]/85" style={{ textShadow: '0 0 12px rgba(255,228,160,0.28)' }}>
                          ✦
                        </div>
                      ) : null}
                      <div
                        className={`${isPreviewDominant ? 'text-[30px] leading-[1.28] whitespace-pre-line' : 'text-sm leading-6'} relative z-10 font-black`}
                        style={{ textShadow: '0 1px 2px rgba(0,0,0,0.14)' }}
                      >
                        {previewText}
                      </div>
                    </div>
                  </div>

                  <div className="relative mt-auto rounded-2xl bg-white/22 p-4 pt-6 backdrop-blur-sm">
                    <motion.div
                      animate={{ scale: [1, 1.08, 1] }}
                      transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                      className="absolute right-3 top-0 z-20 -translate-y-1/2 rounded-full border-2 border-white bg-yellow-300 px-3.5 py-1.5 text-[13px] font-black text-yellow-900 shadow-md"
                    >
                      经验 +{reward.expGained}
                    </motion.div>

                    <div className="relative mb-3 h-5 overflow-hidden rounded-full bg-white/25">
                      <motion.div
                        initial={{ width: `${Math.round(reward.progressBeforeRatio * 100)}%` }}
                        animate={{ width: `${Math.round(reward.progressAfterRatio * 100)}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-yellow-100 via-yellow-300 to-emerald-200"
                      />
                      <div className="absolute inset-0 flex items-center justify-center text-[11px] font-black text-amber-900">
                        exp {reward.progressCurrent}/{reward.progressTarget}
                      </div>
                    </div>

                    <div className="relative grid grid-cols-[72px_minmax(0,1fr)] gap-3 items-center pt-3">
                      <motion.div
                        className="relative flex h-[72px] w-[72px] items-center justify-center rounded-2xl bg-black/20"
                      >
                        {isHiddenFinale && nextStage?.image ? (
                          <>
                            <div className="absolute inset-1 rounded-2xl bg-[radial-gradient(circle,rgba(255,244,188,0.3),rgba(168,85,247,0.14)_56%,transparent_78%)]" />
                            <img
                              src={nextStage.image}
                              alt={nextStage.name}
                              draggable={false}
                              className="h-[82%] w-[82%] select-none object-contain brightness-0 opacity-90"
                            />
                          </>
                        ) : nextStage?.image ? (
                          <>
                            <img
                              src={nextStage.image}
                              alt={isHiddenNextStage ? '隐藏形态' : nextStage.name}
                              draggable={false}
                              className="h-[82%] w-[82%] select-none object-contain opacity-45 brightness-0"
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Lock className="h-6 w-6 text-white" />
                            </div>
                          </>
                        ) : (
                          <div className="text-4xl brightness-50">{nextStage?.emoji ?? '🥚'}</div>
                        )}
                      </motion.div>
                      <div className="pr-16">
                        <div className="text-sm font-black text-white">
                          {isHiddenFinale
                            ? '隐藏形态已解锁'
                            : nextStage
                            ? `下一形态：${isHiddenNextStage ? '???' : nextStage.name}`
                            : '最终形态已达成'}
                        </div>
                        <div className="mt-1 text-xs leading-5 text-white/90">
                          {isHiddenFinale
                            ? '第159关隐藏终局已完成'
                            : reward.toEvolution > 0
                            ? `还差${reward.toEvolution}经验进化`
                            : '已完成本阶段最终进化'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <motion.div
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 1.6 }}
                  className="relative z-30 px-6 pb-8"
                >
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    type="button"
                    onClick={handleAcknowledge}
                    className="mb-3 w-full rounded-full bg-[#8f6af3] py-4 text-xl font-black text-white shadow-[0_10px_0_#6d4fd1] transition-all active:translate-y-[6px] active:shadow-[0_4px_0_#6d4fd1]"
                  >
                    我知道了
                  </motion.button>
                  <div className="h-[32px]" />
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
