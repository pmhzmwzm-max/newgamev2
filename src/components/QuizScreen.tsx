import React, { useState, useEffect } from 'react';
import { ChevronLeft, Delete, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { allLevelsData } from '../data/questions';
import { getBreakFeedbackProfile, getCameraShakeProfile, getChargeDuration, getExplosionProfile, getRemovalCount, getShotTier, getShotTiming, type ShotTier } from './quizTiming';
import fireFoxImage from '../../UI v2.0/火尾狐.png';
import blockGemImage from '../../UI v2.0/方块宝石.png';
import quizBattleBackground from '../../UI v2.0/关卡内背景.png';

const TOTAL_BATTLE_BLOCKS = 35;
const BATTLE_BLOCK_COLUMNS = 5;
const BATTLE_BLOCK_ROWS = 7;

const BLOCK_CLEAR_ORDER = Array.from({ length: TOTAL_BATTLE_BLOCKS }, (_, index) => index).sort((a, b) => {
  const rowA = Math.floor(a / BATTLE_BLOCK_COLUMNS);
  const rowB = Math.floor(b / BATTLE_BLOCK_COLUMNS);
  const colA = a % BATTLE_BLOCK_COLUMNS;
  const colB = b % BATTLE_BLOCK_COLUMNS;

  if (rowA !== rowB) return rowB - rowA;
  return colB - colA;
});

const BLOCK_CLEAR_RANK = BLOCK_CLEAR_ORDER.reduce<Record<number, number>>((acc, index, rank) => {
  acc[index] = rank;
  return acc;
}, {});

const BlockExplosion = ({ delay = 0, tier = 'normal' }: { delay?: number; tier?: ShotTier }) => {
  const {
    flashScale,
    shardCount,
    sparkCount,
    shockwaveSize,
    shardDistanceBase,
    sparkDistanceBase,
    hasScreenFacingShards,
    screenShardCount,
  } = getExplosionProfile(tier);
  const shardColors =
    tier === 'final'
      ? ['#FFF7AE', '#FDE047', '#FB923C', '#F87171', '#FB7185']
      : tier === 'super'
      ? ['#FFF7AE', '#FDE047', '#FB923C', '#F87171']
      : ['#FFF7AE', '#FDE047', '#FB923C'];
  const sparkColors =
    tier === 'final'
      ? ['#FFFFFF', '#FEF3C7', '#FDE68A', '#FDBA74']
      : ['#FFFFFF', '#FEF3C7', '#FDE68A'];

  return (
    <div className="pointer-events-none absolute inset-0 overflow-visible">
      <motion.div
        initial={{ scale: 0.2, opacity: 0.98 }}
        animate={{ scale: [0.2, flashScale * 0.72, flashScale], opacity: [0.98, 0.62, 0] }}
        transition={{ duration: 0.42, delay, ease: 'easeOut', times: [0, 0.24, 1] }}
        className="absolute inset-[2%] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,1),rgba(255,251,235,0.96)_16%,rgba(253,224,71,0.9)_34%,rgba(251,146,60,0.7)_56%,rgba(239,68,68,0.34)_74%,transparent_100%)]"
      />

      <motion.div
        initial={{ scale: 0.2, opacity: 0.9 }}
        animate={{ scale: [0.2, 1, 1.28], opacity: [0.9, 0.34, 0] }}
        transition={{ duration: 0.58, delay: delay + 0.02, ease: 'easeOut', times: [0, 0.36, 1] }}
        className="absolute left-1/2 top-1/2 rounded-full border border-white/80"
        style={{
          width: shockwaveSize,
          height: shockwaveSize,
          marginLeft: -shockwaveSize / 2,
          marginTop: -shockwaveSize / 2,
          boxShadow: '0 0 38px rgba(255,255,255,0.45)',
        }}
      />

      {Array.from({ length: shardCount }).map((_, i) => {
        const angle = (i / shardCount) * Math.PI * 2 + (i % 2 === 0 ? -0.12 : 0.18);
        const distance = shardDistanceBase + (i % 4) * 18;
        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance;
        const rotation = (Math.random() - 0.5) * 240;
        return (
          <motion.div
            key={`shard-${i}`}
            initial={{ x: 0, y: 0, scale: 0.4, opacity: 1, rotate: 0 }}
            animate={{ x, y, scale: [0.4, 1.24, 0.78], opacity: [1, 1, 0], rotate: [0, rotation, rotation * 1.35] }}
            transition={{ duration: tier === 'final' ? 0.72 : 0.62, delay: delay + 0.02 + (i % 3) * 0.012, ease: [0.12, 0.8, 0.2, 1] }}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-[0.35rem]"
            style={{
              width: tier === 'final' ? 16 : tier === 'super' ? 14 : 12,
              height: i % 3 === 0 ? 8 : 6,
              background: `linear-gradient(135deg, ${shardColors[i % shardColors.length]} 0%, rgba(255,255,255,0.95) 48%, rgba(251,146,60,0.4) 100%)`,
              boxShadow: `0 0 22px ${shardColors[i % shardColors.length]}`,
              filter: 'blur(0.2px)',
            }}
          />
        );
      })}

      {Array.from({ length: sparkCount }).map((_, i) => {
        const angle = (i / sparkCount) * Math.PI * 2 + Math.sin(i * 1.7) * 0.08;
        const distance = sparkDistanceBase + (i % 5) * 16;
        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance;
        return (
          <motion.div
            key={`spark-${i}`}
            initial={{ x: 0, y: 0, scale: 0.2, opacity: 0.95 }}
            animate={{ x, y, scale: [0.2, 1.06, 0.28], opacity: [0.95, 0.82, 0] }}
            transition={{ duration: tier === 'final' ? 0.84 : 0.72, delay: delay + 0.05 + (i % 6) * 0.01, ease: 'easeOut' }}
            className="absolute left-1/2 top-1/2 rounded-full -translate-x-1/2 -translate-y-1/2"
            style={{
              width: i % 4 === 0 ? 9 : 6,
              height: i % 4 === 0 ? 9 : 6,
              background: sparkColors[i % sparkColors.length],
              boxShadow: `0 0 18px ${sparkColors[i % sparkColors.length]}`,
            }}
          />
        );
      })}

      {hasScreenFacingShards &&
        Array.from({ length: screenShardCount }).map((_, i) => {
          const offsetX = (Math.random() - 0.5) * (tier === 'final' ? 90 : 70);
          const offsetY = (Math.random() - 0.5) * (tier === 'final' ? 76 : 58);
          const burstScale = tier === 'final' ? 3.9 : 3.1;
          const shardColor = shardColors[i % shardColors.length];

          return (
            <motion.div
              key={`screen-shard-${i}`}
              initial={{ x: 0, y: 0, scale: 0.22, opacity: 0, z: 0, rotate: 0 }}
              animate={{
                x: [0, offsetX * 0.35, offsetX],
                y: [0, offsetY * 0.28, offsetY],
                scale: [0.22, burstScale * 0.62, burstScale],
                opacity: [0, 1, 0],
                rotate: [0, (i % 2 === 0 ? 1 : -1) * 48, (i % 2 === 0 ? 1 : -1) * 112],
              }}
              transition={{ duration: tier === 'final' ? 0.78 : 0.68, delay: delay + 0.03 + i * 0.02, ease: [0.16, 0.84, 0.2, 1] }}
              className="absolute left-1/2 top-1/2 rounded-[0.55rem] -translate-x-1/2 -translate-y-1/2"
              style={{
                width: tier === 'final' ? 22 : 18,
                height: tier === 'final' ? 14 : 12,
                background: `linear-gradient(135deg, rgba(255,255,255,0.98) 0%, ${shardColor} 52%, rgba(251,146,60,0.52) 100%)`,
                boxShadow: `0 0 28px ${shardColor}`,
                filter: 'blur(0.35px)',
              }}
            />
          );
        })}
    </div>
  );
};

type BattleBlockProps = {
  index: number;
  cleared: boolean;
  justCleared: boolean;
  shotTier: ShotTier;
  clearDelay: number;
};

const BattleBlock: React.FC<BattleBlockProps> = ({
  index,
  cleared,
  justCleared,
  shotTier,
  clearDelay,
}) => {
  const wobbleDelay = (index % 5) * 0.12;

  return (
    <div className="relative flex h-full w-full items-center justify-center">
      {!cleared && (
        <motion.div
          animate={{
            x: [-1.4, 1.6, -1.2],
            rotate: [-1.2, 1.4, -1],
            y: [0, -0.8, 0.6],
          }}
          transition={{
            duration: 2.2,
            delay: wobbleDelay,
            repeat: Infinity,
            repeatType: 'mirror',
            ease: 'easeInOut',
          }}
          className="relative h-[98%] w-[122%] max-h-full max-w-none overflow-visible"
        >
          <img
            src={blockGemImage}
            alt=""
            draggable={false}
            className="h-full w-full scale-x-[1.04] scale-y-[1.36] object-fill select-none drop-shadow-[0_10px_18px_rgba(49,104,201,0.22)]"
          />
        </motion.div>
      )}

      {justCleared && (
        <>
          <motion.div
            initial={{ scale: 1, opacity: 1, rotate: 0 }}
            animate={{ scale: [1, 1.08, 0.2], opacity: [1, 1, 0], rotate: [0, -6, 8] }}
            transition={{ duration: 0.44, delay: clearDelay, ease: 'easeOut' }}
            className="absolute h-[98%] w-[122%] max-h-full max-w-none overflow-visible"
          >
            <img
              src={blockGemImage}
              alt=""
              draggable={false}
              className="h-full w-full scale-x-[1.04] scale-y-[1.36] object-fill select-none drop-shadow-[0_12px_20px_rgba(49,104,201,0.24)]"
            />
          </motion.div>
          <BlockExplosion delay={clearDelay} tier={shotTier} />
        </>
      )}
    </div>
  );
};

const BattleStage = ({
  selectedPet,
  combo,
  displayCombo,
  shotTier,
  clearedBlocks,
  lastRemoval,
  shotSequence,
  impactSequence,
  bannerText,
  feedback,
}: {
  selectedPet: any;
  combo: number;
  displayCombo: number;
  shotTier: ShotTier;
  clearedBlocks: number;
  lastRemoval: number;
  shotSequence: number;
  impactSequence: number;
  bannerText: string | null;
  feedback: 'correct' | 'wrong' | null;
}) => {
  const [cameraShakePulse, setCameraShakePulse] = useState(0);
  const showCombo = displayCombo >= 3;
  const recentClearStart = Math.max(0, clearedBlocks - lastRemoval);
  const showImpact = shotTier !== 'idle' && shotTier !== 'break';
  const chargeDuration = getChargeDuration(shotTier);
  const isBreakHit = shotTier === 'break';
  const breakSourceTier = combo >= 10 ? 'final' : combo >= 6 ? 'super' : combo >= 3 ? 'boost' : 'normal';
  const breakFeedback = getBreakFeedbackProfile(breakSourceTier);
  const cameraShake = getCameraShakeProfile(shotTier);
  const petScalePeak = shotTier === 'final' ? 1.3 : shotTier === 'super' ? 1.2 : shotTier === 'boost' ? 1.12 : 1.05;
  const petGlow =
    shotTier === 'final'
      ? 'drop-shadow-[0_0_36px_rgba(251,146,60,1)]'
      : shotTier === 'super'
      ? 'drop-shadow-[0_0_26px_rgba(250,204,21,0.92)]'
      : shotTier === 'boost'
      ? 'drop-shadow-[0_0_20px_rgba(251,146,60,0.82)]'
      : 'drop-shadow-[0_0_12px_rgba(251,191,36,0.5)]';

  useEffect(() => {
    if (!cameraShake.enabled || impactSequence === 0) return;

    setCameraShakePulse(impactSequence);
    const timeout = setTimeout(() => setCameraShakePulse(0), cameraShake.duration * 1000);
    return () => clearTimeout(timeout);
  }, [cameraShake.duration, cameraShake.enabled, impactSequence]);

  return (
    <div className="relative w-full h-full overflow-visible transition-all">
      <motion.div
        className="relative h-full w-full"
        animate={
          cameraShake.enabled && cameraShakePulse === impactSequence && impactSequence > 0
            ? {
                x: [0, -cameraShake.amplitude, cameraShake.amplitude * 0.9, -cameraShake.amplitude * 0.58, 0],
                y: [0, cameraShake.amplitude * 0.18, -cameraShake.amplitude * 0.14, cameraShake.amplitude * 0.1, 0],
                rotate: [0, -cameraShake.rotation, cameraShake.rotation * 0.82, -cameraShake.rotation * 0.48, 0],
              }
            : { x: 0, y: 0, rotate: 0 }
        }
        transition={
          cameraShake.enabled && cameraShakePulse === impactSequence && impactSequence > 0
            ? { duration: cameraShake.duration, times: [0, 0.18, 0.42, 0.72, 1], ease: 'easeOut' }
            : { duration: 0.2 }
        }
      >
      <AnimatePresence mode="wait">
        {showImpact && (
          <motion.div
            key={`impact-${shotSequence}-${shotTier}`}
            initial={{ opacity: 0, scale: 0.2, x: 18, y: 8 }}
            animate={{
              opacity: [0, 0, 0.96, 0.38, 0],
              scale:
                shotTier === 'final'
                  ? [0.2, 0.2, 1.54, 1.98, 2.18]
                  : shotTier === 'super'
                  ? [0.2, 0.2, 1.26, 1.62, 1.82]
                  : [0.2, 0.2, 1.08, 1.3, 1.48],
              x: [18, 12, -12, -26, -34],
              y: [8, 6, 0, -1, -2],
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: chargeDuration + 0.62, times: [0, 0.62, 0.72, 0.9, 1], ease: 'easeOut' }}
            className="pointer-events-none absolute right-[26%] top-[56%] z-20 h-20 w-20 rounded-full bg-[radial-gradient(circle,rgba(255,251,235,0.98),rgba(254,240,138,0.9)_34%,rgba(251,146,60,0.52)_62%,transparent_100%)]"
          >
            <motion.div
              initial={{ opacity: 0, scaleX: 0.2 }}
              animate={{
                opacity: [0, 0, 0.7, 0],
                scaleX: shotTier === 'final' ? [0.2, 0.2, 1.42, 1.9] : shotTier === 'super' ? [0.2, 0.2, 1.18, 1.55] : [0.2, 0.2, 1.02, 1.28],
              }}
              transition={{ duration: chargeDuration + 0.62, times: [0, 0.64, 0.76, 1], ease: 'easeOut' }}
              className="absolute left-1/2 top-1/2 h-5 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[linear-gradient(90deg,rgba(251,146,60,0)_0%,rgba(251,191,36,0.75)_42%,rgba(255,251,235,0.96)_100%)]"
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {shotTier === 'final' && (
          <motion.div
            key={`final-burst-${shotSequence}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.34, 0.08, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.95, ease: 'easeOut' }}
            className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(circle_at_72%_54%,rgba(255,251,235,0.85),rgba(254,240,138,0.42)_22%,rgba(251,146,60,0.18)_45%,transparent_72%)]"
          />
        )}
      </AnimatePresence>

      <div className="relative z-10 grid h-full grid-cols-[minmax(0,1fr)_clamp(168px,28%,246px)] gap-1 px-2 pb-1 pt-1 min-h-0">
        <div className="relative flex min-w-0 min-h-0 items-stretch justify-stretch rounded-[1.8rem] px-0 py-1">
          <motion.div
            animate={
              shotTier === 'idle' || shotTier === 'break'
                ? { opacity: 0, scale: 0.7 }
                : shotTier === 'final'
                ? { opacity: [0.4, 1, 0.75], scale: [0.8, 1.2, 1] }
                : { opacity: [0.3, 0.8, 0.55], scale: [0.8, 1.05, 1] }
            }
            transition={{ duration: 0.35 }}
            className="absolute right-2 top-1/2 z-0 h-16 w-16 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,236,153,0.95),rgba(251,146,60,0.22)_42%,transparent_72%)] pointer-events-none"
          />

          <div className="relative z-10 flex h-full w-full min-h-0 items-stretch justify-stretch pr-1">
            <div className="grid h-full w-full min-h-0 grid-cols-5 grid-rows-7 gap-x-0 gap-y-0 place-items-stretch">
              {Array.from({ length: TOTAL_BATTLE_BLOCKS }).map((_, index) => {
                const clearRank = BLOCK_CLEAR_RANK[index];
                const cleared = clearRank < clearedBlocks;
                const justCleared = cleared && clearRank >= recentClearStart;
                const clearDelay = justCleared ? (clearRank - recentClearStart) * 0.055 : 0;

                return (
                  <BattleBlock
                    key={index}
                    index={index}
                    cleared={cleared}
                    justCleared={justCleared}
                    shotTier={shotTier}
                    clearDelay={clearDelay}
                  />
                );
              })}
            </div>
          </div>
        </div>

        <div className="relative min-w-0 min-h-0">
          <div className="grid h-full min-h-0 grid-rows-[minmax(84px,0.34fr)_minmax(132px,0.66fr)] gap-2">
            <div className="flex min-h-0 items-stretch">
              <div className="flex h-full w-full items-center justify-end rounded-[1.8rem] px-0 py-1">
                <AnimatePresence mode="wait">
                  {showCombo ? (
                    <motion.div
                      initial={{ opacity: 0, y: -12, scale: 0.92, filter: 'blur(8px)' }}
                      animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                      exit={{ opacity: 0, y: -12, scale: 0.84, filter: 'blur(10px)' }}
                      transition={{ duration: 0.2, ease: 'easeOut' }}
                      className="relative flex min-h-[88px] w-fit items-center justify-end gap-2 px-1 py-2 text-right"
                    >
                      <span className="relative z-10 text-[clamp(1.32rem,2.2vw,1.72rem)] font-black italic leading-none tracking-tight text-[#ff7a18] drop-shadow-[0_3px_0_rgba(255,242,184,0.95)]">
                        combo
                      </span>
                      <AnimatePresence mode="popLayout" initial={false}>
                        <motion.span
                          key={displayCombo}
                          initial={{ opacity: 0, y: -8, scale: 0.94, filter: 'blur(6px)' }}
                          animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                          exit={{ opacity: 0, y: 8, scale: 0.9, filter: 'blur(6px)' }}
                          transition={{ duration: 0.18, ease: 'easeOut' }}
                          className="relative z-10 min-w-[3.4rem] text-left text-[clamp(1.5rem,2.42vw,1.98rem)] font-black italic leading-none tracking-tight text-[#ff4f7a] drop-shadow-[0_3px_0_rgba(255,243,176,0.98)]"
                        >
                          {`x${displayCombo}`}
                        </motion.span>
                      </AnimatePresence>
                    </motion.div>
                  ) : (
                    <div className="h-full w-full rounded-[1.6rem]" />
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="flex min-h-0 items-end justify-end rounded-[1.8rem] px-0 pb-1">
              <motion.div
                key={`pet-hit-${shotSequence}-${shotTier}`}
                animate={
                  shotTier === 'final'
                    ? {
                        rotate: [0, 30, 20, -36, -14, 5, 0],
                        scale: [1, 1.03, 1.08, petScalePeak + 0.05, 1.12, 1.04, 1],
                        y: [0, 4, 1, -10, -2, 1, 0],
                      }
                    : shotTier === 'super'
                    ? {
                        rotate: [0, 30, 18, -34, -13, 4, 0],
                        scale: [1, 1.02, 1.06, petScalePeak + 0.04, 1.09, 1.03, 1],
                        y: [0, 3, 1, -8, -2, 1, 0],
                      }
                    : shotTier === 'boost'
                    ? {
                        rotate: [0, 30, 16, -32, -12, 4, 0],
                        scale: [1, 1.02, 1.05, petScalePeak + 0.03, 1.07, 1.02, 1],
                        y: [0, 2, 1, -6, -1, 1, 0],
                      }
                    : shotTier === 'normal'
                    ? {
                        rotate: [0, 30, 15, -30, -10, 3, 0],
                        scale: [1, 1.01, 1.03, petScalePeak + 0.02, 1.05, 1.02, 1],
                        y: [0, 2, 1, -4, -1, 0, 0],
                      }
                    : shotTier === 'break'
                    ? {
                        x: [
                          0,
                          -breakFeedback.shakeAmplitude,
                          breakFeedback.shakeAmplitude + 2,
                          -Math.max(2, Math.round(breakFeedback.shakeAmplitude * 0.6)),
                          0,
                        ],
                        scale: [1, breakFeedback.recoilScaleMin, breakFeedback.recoilScalePeak, 1],
                        rotate: [0, -4, 3, 0],
                      }
                    : { scale: 1, y: 0, x: 0, rotate: 0 }
                }
                transition={
                  shotTier === 'break'
                    ? { duration: 0.5, times: [0, 0.22, 0.52, 0.78, 1] }
                    : shotTier === 'idle'
                    ? { duration: 0.2 }
                    : {
                        duration: chargeDuration + 0.62,
                        times: [0, 0.46, 0.54, 0.68, 0.82, 0.92, 1],
                        ease: ['easeOut', 'easeInOut', 'easeIn', 'easeOut', 'easeInOut', 'easeOut'],
                      }
                }
                className={`relative flex h-[clamp(8.5rem,23vw,11.7rem)] w-[clamp(8.5rem,23vw,11.7rem)] items-center justify-center self-end ${petGlow}`}
              >
                <AnimatePresence mode="wait">
                  {showImpact && (
                    <motion.div
                      key={`pet-charge-${shotSequence}-${shotTier}`}
                      initial={{ opacity: 0, scale: 0.45 }}
                      animate={{
                        opacity: [0, 0.62, 0.2, 0],
                        scale: [0.45, shotTier === 'final' ? 1.62 : shotTier === 'super' ? 1.34 : shotTier === 'boost' ? 1.2 : 1.08, shotTier === 'final' ? 1.92 : shotTier === 'super' ? 1.52 : shotTier === 'boost' ? 1.28 : 1.12, 1.04],
                      }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: chargeDuration, ease: 'easeOut', times: [0, 0.28, 0.72, 1] }}
                      className="pointer-events-none absolute inset-0 rounded-[2.6rem] bg-[radial-gradient(circle,rgba(255,250,205,0.96),rgba(254,240,138,0.42)_44%,rgba(251,146,60,0)_78%)]"
                    />
                  )}
                </AnimatePresence>
                <AnimatePresence mode="wait">
                  {isBreakHit && (
                    <motion.div
                      key={`pet-break-${shotSequence}`}
                      initial={{ opacity: 0, scale: 0.84 }}
                      animate={{ opacity: [0, 1, 0.72, 0], scale: [0.84, 1.04, breakFeedback.redFlashScale, breakFeedback.redFlashScale + 0.08] }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.5, ease: 'easeOut', times: [0, 0.18, 0.52, 1] }}
                      className="pointer-events-none absolute rounded-[3rem] border-2 border-red-300/80 bg-[radial-gradient(circle,rgba(254,202,202,0.76),rgba(248,113,113,0.42)_40%,rgba(220,38,38,0.16)_68%,transparent_100%)] shadow-[0_0_52px_rgba(248,113,113,0.8)]"
                      style={{ inset: -breakFeedback.overlayInset }}
                    />
                  )}
                </AnimatePresence>
                <img
                  src={selectedPet?.image ?? fireFoxImage}
                  alt={selectedPet?.name ?? '火尾狐'}
                  draggable={false}
                  className="relative z-10 h-full w-full object-contain select-none drop-shadow-[0_10px_18px_rgba(255,255,255,0.18)]"
                />
              </motion.div>
            </div>
          </div>
        </div>
      </div>
      </motion.div>
    </div>
  );
};

export default function QuizScreen({
  gradeId = '1',
  levelId,
  selectedPet,
  onFinish,
  onBack
}: {
  gradeId?: string;
  levelId: number;
  selectedPet: any;
  onFinish: (stats: any) => void;
  onBack: () => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [combo, setCombo] = useState(0);
  const [displayCombo, setDisplayCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [startTime] = useState(Date.now());
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [multiVerticalStep, setMultiVerticalStep] = useState(1); // 多重竖式当前步骤
  const [clearedBlocks, setClearedBlocks] = useState(0);
  const [lastRemoval, setLastRemoval] = useState(0);
  const [shotTier, setShotTier] = useState<ShotTier>('idle');
  const [battleBanner, setBattleBanner] = useState<string | null>(null);
  const [shotSequence, setShotSequence] = useState(0);
  const [impactSequence, setImpactSequence] = useState(0);

  // 从新的数据源获取关卡数据
  const gradeLevels = allLevelsData[gradeId as keyof typeof allLevelsData];
  const levelInfo = gradeLevels?.[levelId];
  const questions = levelInfo?.questions || [];
  const question = questions[currentIndex];

  // 添加日志
  console.log('Current question:', currentIndex, question);

  useEffect(() => {
    setCurrentIndex(0);
    setAnswers([]);
    setFeedback(null);
    setCombo(0);
    setDisplayCombo(0);
    setMaxCombo(0);
    setCorrectCount(0);
    setSelectedChoice(null);
    setMultiVerticalStep(1);
    setClearedBlocks(0);
    setLastRemoval(0);
    setShotTier('idle');
    setBattleBanner(null);
    setShotSequence(0);
    setImpactSequence(0);
  }, [gradeId, levelId]);

  useEffect(() => {
    if (question && question.answerLength) {
      // 对于竖式计算类型，使用多个输入框
      const isVertical = question.type === 'vertical_addition' || question.type === 'multi_vertical';
      const newAnswers = isVertical
        ? Array(question.answerLength).fill('')
        : [''];
      console.log('Initializing answers:', newAnswers);
      setAnswers(newAnswers);
      setFeedback(null);
      setSelectedChoice(null);
      setMultiVerticalStep(1); // 重置多重竖式步骤
    }
  }, [currentIndex]);

  useEffect(() => {
    if (!battleBanner) return;
    const timeout = setTimeout(() => setBattleBanner(null), 1200);
    return () => clearTimeout(timeout);
  }, [battleBanner]);

  const finishLevel = (newCorrectCount: number, newCombo: number) => {
    const timeTaken = Math.floor((Date.now() - startTime) / 1000);
    onFinish({
      accuracy: Math.round((newCorrectCount / questions.length) * 100),
      time: timeTaken,
      maxCombo: Math.max(maxCombo, newCombo),
      expGained: Math.max(1, Math.ceil(newCorrectCount / 4)),
    });
  };

  const scheduleAdvance = (newCorrectCount: number, newCombo: number, delay = 1000) => {
    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex((i: number) => i + 1);
      } else {
        finishLevel(newCorrectCount, newCombo);
      }
    }, delay);
  };

  const registerCorrectAnswer = (newCombo: number) => {
    const tier = getShotTier(newCombo);
    const remainingBlocks = Math.max(0, TOTAL_BATTLE_BLOCKS - clearedBlocks);
    const removal = getRemovalCount(newCombo, remainingBlocks);
    const newCorrectCount = correctCount + 1;
    const { shotDelay, advanceDelay } = getShotTiming(tier, newCombo);

    setFeedback('correct');
    setCombo(newCombo);
    setMaxCombo((m: number) => Math.max(m, newCombo));
    setCorrectCount(newCorrectCount);
    setShotTier(tier);
    setBattleBanner(null);
    setLastRemoval(0);
    setShotSequence((prev) => prev + 1);

    setTimeout(() => {
      setDisplayCombo(newCombo);
      setLastRemoval(removal);
      setClearedBlocks((prev) => Math.min(TOTAL_BATTLE_BLOCKS, prev + removal));
      setImpactSequence((prev) => prev + 1);
    }, shotDelay);

    scheduleAdvance(newCorrectCount, newCombo, advanceDelay);
  };

  const registerWrongAnswer = (resetAnswers: () => void) => {
    setFeedback('wrong');
    setCombo(0);
    setDisplayCombo(0);
    setShotTier('break');
    setLastRemoval(0);
    setBattleBanner(null);

    setTimeout(() => {
      resetAnswers();
      setSelectedChoice(null);
      setFeedback(null);
      setShotTier('idle');
    }, 500);
  };

  // 选择题答案处理
  const handleChoiceSelect = (option: string) => {
    if (feedback === 'correct' || feedback === 'wrong') return;

    setSelectedChoice(option);

    if (option === question.answer) {
      const newCombo = combo + 1;
      registerCorrectAnswer(newCombo);
    } else {
      registerWrongAnswer(() => {});
    }
  };

  const handleKeyPress = (key: string) => {
    if (feedback === 'correct' || feedback === 'wrong') return;

    if (key === 'delete') {
      setAnswers(prev => {
        const next = [...prev];
        if (question.type === 'multi_vertical') {
          // 多重竖式：按填写顺序的逆序删除
          if (multiVerticalStep === 1) {
            if (next[1] !== '') { next[1] = ''; }
            else if (next[0] !== '') { next[0] = ''; }
          } else {
            if (next[3] !== '') { next[3] = ''; }
            else if (next[2] !== '') { next[2] = ''; }
          }
        } else if (question.type === 'vertical_addition') {
          // 竖式计算：从右到左删除
          const filledIdx = next.findIndex(val => val !== '');
          if (filledIdx !== -1) {
            next[filledIdx] = '';
          }
        } else {
          // 其他类型：删除最后一个字符
          if (next[0] && next[0].length > 0) {
            next[0] = next[0].slice(0, -1);
          }
        }
        return next;
      });
      setFeedback(null);
    } else {
      setAnswers(prev => {
        const next = [...prev];
        if (question.type === 'multi_vertical') {
          // 多重竖式：从右到左，每个格子一个数字
          if (multiVerticalStep === 1) {
            if (next[0] === '') { next[0] = key; }
            else if (next[1] === '') { next[1] = key; }
          } else {
            if (next[2] === '') { next[2] = key; }
            else if (next[3] === '') { next[3] = key; }
          }
        } else if (question.type === 'vertical_addition') {
          // 竖式计算：从右到左填写，每个格子一个数字
          for (let i = next.length - 1; i >= 0; i--) {
            if (next[i] === '') {
              next[i] = key;
              break;
            }
          }
        } else {
          // 其他类型：支持多位数输入
          const currentAnswer = next[0] || '';
          // 限制最大长度为答案长度
          if (currentAnswer.length < question.answer.length) {
            next[0] = currentAnswer + key;
          }
        }
        return next;
      });
      setFeedback(null);
    }
  };

  const checkAnswer = () => {
    const userAnswerStr = answers.join('');

    // 多重竖式计算：两步验证
    if (question.type === 'multi_vertical') {
      const firstResult = (question.num1! + question.num2!).toString();
      const finalResult = question.answer;

      if (multiVerticalStep === 1) {
        // 检查第一层：answers[1]是十位，answers[0]是个位
        const step1Answer = (answers[1] || '') + (answers[0] || '');
        if (answers[0] === '' || answers[1] === '') return; // 未填完

        if (step1Answer === firstResult) {
          setFeedback('correct');
          setTimeout(() => {
            setMultiVerticalStep(2);
            setFeedback(null);
            // 清空第二层答案位置
            setAnswers(['', '', '', '']);
          }, 600);
        } else {
          registerWrongAnswer(() => {
            setAnswers(['', '', '', '']);
          });
        }
        return;
      } else {
        // 检查第二层：answers[3]是十位，answers[2]是个位
        const step2Answer = (answers[3] || '') + (answers[2] || '');
        if (answers[2] === '' || answers[3] === '') return; // 未填完

        if (step2Answer === finalResult) {
          const newCombo = combo + 1;
          registerCorrectAnswer(newCombo);
        } else {
          registerWrongAnswer(() => {
            setAnswers((prev: string[]) => {
              const next = [...prev];
              next[2] = '';
              next[3] = '';
              return next;
            });
          });
        }
        return;
      }
    }

    // 对于非竖式计算：输入位数必须等于答案位数才判断
    // 对于竖式计算：需要填满所有格子才判断
    if (question.type === 'vertical_addition') {
      if (answers.some(a => a === '')) return;
    } else {
      // 非竖式：输入位数必须等于答案位数
      if (userAnswerStr.length !== question.answer.length) return;
    }

    if (userAnswerStr === question.answer) {
      const newCombo = combo + 1;
      registerCorrectAnswer(newCombo);
    } else {
      registerWrongAnswer(() => {
        setAnswers(Array(question.answerLength).fill(''));
      });
    }
  };

  useEffect(() => {
    // 当输入内容长度等于答案长度时自动验证
    const userAnswerStr = answers.join('');
    if (userAnswerStr.length === question.answer.length && feedback === null) {
      checkAnswer();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answers, feedback]);

  const getActiveIndex = () => {
    if (feedback !== null) return -1;
    if (question.type === 'multi_vertical') {
      // 多重竖式：从右到左填写
      // 第一步：B(0) -> A(1)，第二步：D(2) -> C(3)
      if (multiVerticalStep === 1) {
        if (answers[0] === '') return 0; // B (个位)
        if (answers[1] === '') return 1; // A (十位)
      } else {
        if (answers[2] === '') return 2; // D (个位)
        if (answers[3] === '') return 3; // C (十位)
      }
      return -1;
    }
    if (question.type === 'vertical_addition') {
      // 竖式计算：从右到左找空位
      for (let i = answers.length - 1; i >= 0; i--) {
        if (answers[i] === '') return i;
      }
    } else {
      // 其他类型：只有一个输入框，始终返回0
      return 0;
    }
    return -1;
  };

  const activeIndex = getActiveIndex();

  const renderNumberComparison = () => {
    return (
      <div className="flex flex-col items-center justify-center w-full">
        <div className="text-2xl font-bold text-gray-500 mb-6 tracking-wider">比大小</div>
        <div className="flex items-center justify-center gap-6 w-full px-4">
          <div className="flex-1 text-right text-5xl font-bold text-gray-700">{question.num1}</div>
          <motion.div
            animate={
              feedback === 'wrong' && answers[0] !== question.answer
                ? { x: [-5, 5, -5, 5, 0] }
                : { x: 0 }
            }
            transition={
              feedback === 'wrong' && answers[0] !== question.answer
                ? { duration: 0.4 }
                : { duration: 0.2 }
            }
            className={`w-20 h-20 shrink-0 rounded-2xl flex items-center justify-center text-5xl font-bold transition-colors
              ${answers[0] ? 'bg-blue-100 text-blue-500' : 'bg-gray-100 text-gray-400'}
              ${feedback === 'wrong' && answers[0] !== question.answer && answers[0] !== '' ? 'bg-red-100 text-red-500' : ''}
              ${0 === activeIndex ? 'ring-4 ring-yellow-300 bg-yellow-50 shadow-[0_0_25px_rgba(253,224,71,0.8)]' : 'shadow-lg'}
            `}
            style={{
              animation: 0 === activeIndex && feedback !== 'wrong' ? 'pulse-glow 1.2s ease-in-out infinite' : 'none'
            }}
          >
            {answers[0] || '?'}
          </motion.div>
          <div className="flex-1 text-left text-5xl font-bold text-gray-700">{question.num2}</div>
        </div>
      </div>
    );
  };

  const renderVerticalMath = () => {
    if (!question || !question.num1 || !question.num2) {
      console.error('Invalid question data:', question);
      return <div className="text-white text-2xl">题目数据错误</div>;
    }
    const maxLen = Math.max(question.num1.toString().length, question.num2.toString().length);
    const str1 = question.num1.toString().padStart(maxLen, ' ');
    const str2 = question.num2.toString().padStart(maxLen, ' ');

    // 确保 answers 数组正确初始化
    if (!answers || answers.length === 0) {
      return <div className="text-white text-2xl">加载中...</div>;
    }

    return (
      <div className="text-center flex flex-col items-end">
        <div className="flex justify-end gap-4 text-5xl font-bold text-gray-700 tracking-widest font-mono">
          {str1.split('').map((char, i) => <span key={i} className="w-8 text-center">{char}</span>)}
        </div>
        <div className="flex justify-end gap-4 text-5xl font-bold text-gray-700 mt-4 relative tracking-widest font-mono">
          <span className="absolute -left-12">{question.operator || '+'}</span>
          {str2.split('').map((char, i) => <span key={i} className="w-8 text-center">{char}</span>)}
        </div>
        <div className="w-full h-1 bg-gray-300 my-6"></div>
        <div className="flex gap-2 justify-end">
          {answers.map((ans, i) => {
            const isActive = i === activeIndex;
            return (
              <motion.div
                key={i}
                animate={
                  feedback === 'wrong' && ans !== question.answer[i]
                    ? { x: [-5, 5, -5, 5, 0] }
                    : { x: 0 }
                }
                transition={
                  feedback === 'wrong' && ans !== question.answer[i]
                    ? { duration: 0.4 }
                    : { duration: 0.2 }
                }
                className={`w-14 h-16 rounded-xl flex items-center justify-center text-3xl font-bold transition-all
                  ${ans ? 'bg-blue-100 text-blue-500' : 'bg-gray-100 text-gray-400'}
                  ${feedback === 'wrong' && ans !== question.answer[i] && ans !== '' ? 'bg-red-100 text-red-500' : ''}
                  ${isActive ? 'ring-4 ring-yellow-300 bg-yellow-50 shadow-[0_0_25px_rgba(253,224,71,0.8)]' : 'shadow-inner'}
                `}
                style={{
                  animation: isActive && feedback !== 'wrong' ? 'pulse-glow 1.2s ease-in-out infinite' : 'none'
                }}
              >
                {ans || '?'}
              </motion.div>
            );
          })}
        </div>
      </div>
    );
  };

  // 多重竖式计算渲染（三数连加，如 23+45+12）
  const renderMultiVertical = () => {
    if (!question || !question.num1 || !question.num2 || !question.num3) {
      console.error('Invalid multi_vertical question data:', question);
      return <div className="text-white text-2xl">题目数据错误</div>;
    }

    const step = multiVerticalStep;
    const firstResult = question.num1 + question.num2;
    const finalResult = parseInt(question.answer);
    const maxLen = 2; // 两位数

    return (
      <div className="text-center flex flex-col items-end">
        {/* 第一行：num1 */}
        <div className="flex justify-end gap-3 text-4xl font-bold text-gray-700 tracking-widest font-mono">
          {question.num1.toString().padStart(maxLen, ' ').split('').map((char, i) => (
            <span key={i} className="w-7 text-center">{char === ' ' ? '' : char}</span>
          ))}
        </div>
        {/* 第二行：+ num2 */}
        <div className="flex justify-end gap-3 text-4xl font-bold text-gray-700 mt-2 relative tracking-widest font-mono">
          <span className="absolute -left-10 text-blue-500">+</span>
          {question.num2.toString().padStart(maxLen, ' ').split('').map((char, i) => (
            <span key={i} className="w-7 text-center">{char === ' ' ? '' : char}</span>
          ))}
        </div>
        {/* 第一条横线 */}
        <div className="w-full h-1 bg-gray-300 my-4"></div>
        {/* 第三行：第一层结果 AB */}
        <div className="flex gap-2 justify-end">
          {step === 1 ? (
            // 第一步：填写第一层结果
            <>
              <motion.div
                animate={feedback === 'wrong' ? { x: [-5, 5, -5, 5, 0] } : { x: 0 }}
                className={`w-12 h-14 rounded-xl flex items-center justify-center text-2xl font-bold transition-all
                  ${answers[1] ? 'bg-blue-100 text-blue-500' : 'bg-gray-100 text-gray-400'}
                  ${1 === activeIndex ? 'ring-4 ring-yellow-300 bg-yellow-50 shadow-[0_0_25px_rgba(253,224,71,0.8)]' : 'shadow-inner'}
                `}
              >
                {answers[1] || '?'}
              </motion.div>
              <motion.div
                animate={feedback === 'wrong' ? { x: [-5, 5, -5, 5, 0] } : { x: 0 }}
                className={`w-12 h-14 rounded-xl flex items-center justify-center text-2xl font-bold transition-all
                  ${answers[0] ? 'bg-blue-100 text-blue-500' : 'bg-gray-100 text-gray-400'}
                  ${0 === activeIndex ? 'ring-4 ring-yellow-300 bg-yellow-50 shadow-[0_0_25px_rgba(253,224,71,0.8)]' : 'shadow-inner'}
                `}
              >
                {answers[0] || '?'}
              </motion.div>
            </>
          ) : (
            // 第二步：显示已完成的第层结果
            <>
              <div className="w-12 h-14 rounded-xl flex items-center justify-center text-2xl font-bold bg-green-100 text-green-500 shadow-inner">
                {firstResult.toString()[0]}
              </div>
              <div className="w-12 h-14 rounded-xl flex items-center justify-center text-2xl font-bold bg-green-100 text-green-500 shadow-inner">
                {firstResult.toString()[1]}
              </div>
            </>
          )}
        </div>
        {/* 第四行：+ num3 */}
        <div className="flex justify-end gap-3 text-4xl font-bold text-gray-700 mt-3 relative tracking-widest font-mono">
          <span className="absolute -left-10 text-blue-500">+</span>
          {question.num3.toString().padStart(maxLen, ' ').split('').map((char, i) => (
            <span key={i} className="w-7 text-center">{char === ' ' ? '' : char}</span>
          ))}
        </div>
        {/* 第二条横线 */}
        <div className="w-full h-1 bg-gray-300 my-4"></div>
        {/* 第五行：第二层结果 CD */}
        <div className="flex gap-2 justify-end">
          {step === 2 ? (
            <>
              <motion.div
                animate={feedback === 'wrong' ? { x: [-5, 5, -5, 5, 0] } : { x: 0 }}
                className={`w-12 h-14 rounded-xl flex items-center justify-center text-2xl font-bold transition-all
                  ${answers[3] ? 'bg-blue-100 text-blue-500' : 'bg-gray-100 text-gray-400'}
                  ${3 === activeIndex ? 'ring-4 ring-yellow-300 bg-yellow-50 shadow-[0_0_25px_rgba(253,224,71,0.8)]' : 'shadow-inner'}
                `}
              >
                {answers[3] || '?'}
              </motion.div>
              <motion.div
                animate={feedback === 'wrong' ? { x: [-5, 5, -5, 5, 0] } : { x: 0 }}
                className={`w-12 h-14 rounded-xl flex items-center justify-center text-2xl font-bold transition-all
                  ${answers[2] ? 'bg-blue-100 text-blue-500' : 'bg-gray-100 text-gray-400'}
                  ${2 === activeIndex ? 'ring-4 ring-yellow-300 bg-yellow-50 shadow-[0_0_25px_rgba(253,224,71,0.8)]' : 'shadow-inner'}
                `}
              >
                {answers[2] || '?'}
              </motion.div>
            </>
          ) : (
            // 第一步时，第二层显示为禁用状态
            <>
              <div className="w-12 h-14 rounded-xl flex items-center justify-center text-2xl font-bold bg-gray-50 text-gray-300 opacity-40 shadow-inner">
                ?
              </div>
              <div className="w-12 h-14 rounded-xl flex items-center justify-center text-2xl font-bold bg-gray-50 text-gray-300 opacity-40 shadow-inner">
                ?
              </div>
            </>
          )}
        </div>
        {/* 提示文字 */}
        <div className="mt-4 text-center text-sm text-gray-400 w-full">
          {step === 1 ? `先计算 ${question.num1} + ${question.num2}` : `再计算 ${firstResult} + ${question.num3}`}
        </div>
      </div>
    );
  };

  // 输入题渲染（算式 + 答案框）
  const renderInput = () => {
    return (
      <div className="flex items-center justify-center gap-4">
        <span className="text-5xl font-black text-gray-800">{question.question}</span>
        <motion.div
          animate={
            feedback === 'wrong' && answers[0] !== question.answer
              ? { x: [-5, 5, -5, 5, 0] }
              : answers[0] && answers[0].length > 0
                ? { scale: 1, boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)" }
                : { scale: 1.1, boxShadow: "0 0 30px rgba(253,224,71,0.8)" }
          }
          transition={
            feedback === 'wrong' && answers[0] !== question.answer
              ? { duration: 0.4 }
              : answers[0] && answers[0].length > 0
                ? { duration: 0.2 }
                : { repeat: Infinity, duration: 1.2, ease: "easeInOut", repeatType: "reverse" }
          }
          className={`min-w-[80px] px-6 h-16 rounded-xl flex items-center justify-center text-3xl font-bold transition-colors
            ${answers[0] ? 'bg-blue-100 text-blue-500' : 'bg-gray-100 text-gray-400'}
            ${feedback === 'wrong' && answers[0] !== question.answer ? 'bg-red-100 text-red-500' : ''}
            ${!answers[0] || answers[0].length === 0 ? 'ring-4 ring-yellow-300 bg-yellow-50' : ''}
          `}
        >
          {answers[0] || '?'}
        </motion.div>
      </div>
    );
  };

  // 数物对应渲染
  const renderCounting = () => {
    const emojis = Array(question.count).fill(question.emoji);
    return (
      <div className="text-center w-full">
        <div className="text-2xl font-bold text-gray-500 mb-6 tracking-wider">数一数有几个？</div>
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {emojis.map((emoji, i) => (
            <motion.span
              key={i}
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.1 }}
              className="text-5xl"
            >
              {emoji}
            </motion.span>
          ))}
        </div>
        <div className="flex items-center justify-center gap-4">
          <span className="text-2xl font-bold text-gray-600">数量：</span>
          <motion.div
            animate={
              feedback === 'wrong' && answers[0] !== question.answer
                ? { x: [-5, 5, -5, 5, 0] }
                : answers[0] && answers[0].length > 0
                  ? { scale: 1, boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)" }
                  : { scale: 1.1, boxShadow: "0 0 30px rgba(253,224,71,0.8)" }
            }
            transition={
              feedback === 'wrong' && answers[0] !== question.answer
                ? { duration: 0.4 }
                : answers[0] && answers[0].length > 0
                  ? { duration: 0.2 }
                  : { repeat: Infinity, duration: 1.2, ease: "easeInOut", repeatType: "reverse" }
            }
            className={`min-w-[80px] px-6 h-16 rounded-xl flex items-center justify-center text-3xl font-bold transition-colors
              ${answers[0] ? 'bg-blue-100 text-blue-500' : 'bg-gray-100 text-gray-400'}
              ${feedback === 'wrong' && answers[0] !== question.answer ? 'bg-red-100 text-red-500' : ''}
              ${!answers[0] || answers[0].length === 0 ? 'ring-4 ring-yellow-300 bg-yellow-50' : ''}
            `}
          >
            {answers[0] || '?'}
          </motion.div>
        </div>
      </div>
    );
  };

  // 选择题渲染
  const renderChoice = () => {
    return (
      <div className="text-center w-full">
        <div className="text-2xl font-bold text-gray-500 mb-6 tracking-wider">选择正确答案</div>
        <div className="flex items-center justify-center gap-4 mb-8">
          <span className="text-4xl font-black text-gray-800">{question.question.replace('?', '')}</span>
          <motion.div
            animate={
              feedback === 'wrong' && selectedChoice !== question.answer
                ? { x: [-5, 5, -5, 5, 0] }
                : selectedChoice
                  ? { scale: 1 }
                  : { scale: 1.1, boxShadow: "0 0 30px rgba(253,224,71,0.8)" }
            }
            transition={
              feedback === 'wrong'
                ? { duration: 0.4 }
                : selectedChoice
                ? { duration: 0.2 }
                : { repeat: Infinity, duration: 1.2, ease: "easeInOut", repeatType: "reverse" }
            }
            className={`min-w-[96px] px-6 h-20 rounded-2xl flex items-center justify-center text-4xl font-black transition-colors border-4 shadow-[0_4px_0_#9ca3af]
              ${selectedChoice ? 'bg-blue-100 text-blue-700 border-blue-500' : 'bg-gray-100 text-gray-400 border-gray-300'}
              ${feedback === 'correct' ? '!bg-green-100 !text-green-600 !border-green-500 shadow-[0_4px_0_#16a34a]' : ''}
              ${feedback === 'wrong' ? '!bg-red-100 !text-red-600 !border-red-500 shadow-[0_4px_0_#dc2626]' : ''}
              ${!selectedChoice ? 'ring-4 ring-yellow-300 bg-yellow-50' : ''}
            `}
          >
            {selectedChoice || '?'}
          </motion.div>
        </div>
      </div>
    );
  };

  const renderChoiceButtons = () => {
    const options = question.options || [];
    return (
      <div className="grid grid-cols-4 gap-4">
        {options.map((option, i) => (
          <motion.button
            key={i}
            whileHover={feedback === null ? { scale: 1.02, y: -2 } : {}}
            whileTap={feedback === null ? { y: 6, scale: 0.98 } : {}}
            onClick={() => handleChoiceSelect(option)}
            disabled={feedback !== null}
            className={`h-24 rounded-2xl border-4 text-3xl font-black transition-all ${
              feedback === 'correct' && option === question.answer
                ? 'bg-green-500 text-white border-green-600 shadow-[0_6px_0_#15803d]'
                : feedback === 'wrong' && option === question.answer
                ? 'bg-green-500 text-white border-green-600 shadow-[0_6px_0_#15803d]'
                : feedback === 'wrong' && selectedChoice === option
                ? 'bg-red-500 text-white border-red-600 shadow-[0_6px_0_#b91c1c]'
                : selectedChoice === option
                ? 'bg-white text-gray-700 border-blue-500 shadow-[0_0_0_#9ca3af]'
                : 'bg-white text-gray-700 border-gray-200 shadow-[0_6px_0_#9ca3af]'
            }`}
          >
            {option}
          </motion.button>
        ))}
      </div>
    );
  };

  return (
    <div
      className="relative flex h-full w-full flex-col overflow-visible bg-[#93cdf4]"
      style={{
        backgroundImage: `url(${quizBattleBackground})`,
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 text-[#25344d] shrink-0">
        <button onClick={onBack} className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-[#d97d2f] bg-gradient-to-b from-[#ffe487] to-[#ffbf52] text-[#7b3b12] shadow-[0_8px_0_rgba(191,114,37,0.26),0_12px_24px_rgba(121,59,18,0.14)] active:translate-y-[2px] active:shadow-[0_5px_0_rgba(191,114,37,0.24),0_8px_16px_rgba(121,59,18,0.12)]">
          <ChevronLeft size={28} />
        </button>
        <div className="flex-1 mx-6">
          <div className="relative h-4 overflow-hidden rounded-full border-2 border-[#6ca7d8] bg-[#d8f0ff] shadow-[0_6px_14px_rgba(71,131,188,0.18),inset_0_2px_5px_rgba(255,255,255,0.65)]">
            <motion.div
              className="absolute left-0 top-0 h-full bg-gradient-to-r from-[#4f85db] via-[#4e79c8] to-[#6a67d8]"
              initial={{ width: `${(currentIndex / questions.length) * 100}%` }}
              animate={{ width: `${((currentIndex) / questions.length) * 100}%` }}
            />
          </div>
        </div>
        <div className="rounded-full border-2 border-[#6ca7d8] bg-gradient-to-b from-[#f8fdff] to-[#dff2ff] px-4 py-2 text-lg font-black text-[#24436a] shadow-[0_8px_0_rgba(108,167,216,0.28),0_12px_22px_rgba(71,131,188,0.12)]">
          {currentIndex + 1}/{questions.length}
        </div>
      </div>

      {/* Main Area */}
      <div className="flex-1 min-h-0 flex flex-col px-4 pb-0 pt-1 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1 min-h-0 mb-0"
        >
          <BattleStage
            selectedPet={selectedPet}
            combo={combo}
            displayCombo={displayCombo}
            shotTier={shotTier}
            clearedBlocks={clearedBlocks}
            lastRemoval={lastRemoval}
            shotSequence={shotSequence}
            impactSequence={impactSequence}
            bannerText={battleBanner}
            feedback={feedback}
          />
        </motion.div>

        <div className="shrink-0 bg-white/20 backdrop-blur-md rounded-t-[2rem] px-4 pt-4 pb-4">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full max-w-3xl mx-auto bg-white/95 rounded-[2rem] px-6 py-5 shadow-2xl h-[170px] flex flex-col items-center justify-center relative border-4 border-white/50 mb-4"
          >
            {question.type === 'text_to_number' ? (
              <div className="text-center w-full">
                <div className="text-2xl font-bold text-gray-500 mb-6 tracking-wider">{question.text}</div>
                <div className="flex items-center justify-center gap-4">
                  <span className="text-xl font-bold text-gray-600">{question.label}</span>
                  <motion.div
                    animate={
                      feedback === 'wrong' && answers[0] !== question.answer
                        ? { x: [-5, 5, -5, 5, 0] }
                        : answers[0] && answers[0].length > 0
                          ? { scale: 1, boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)" }
                          : { scale: 1.15, boxShadow: "0 0 35px rgba(253,224,71,1)" }
                    }
                    transition={
                      feedback === 'wrong' && answers[0] !== question.answer
                        ? { duration: 0.4 }
                        : answers[0] && answers[0].length > 0
                          ? { duration: 0.2 }
                          : { repeat: Infinity, duration: 1.2, ease: "easeInOut", repeatType: "reverse" }
                    }
                    className={`min-w-[80px] px-4 h-16 rounded-xl flex items-center justify-center text-3xl font-bold transition-colors
                      ${answers[0] ? 'bg-blue-100 text-blue-500' : 'bg-gray-100 text-gray-400'}
                      ${feedback === 'wrong' && answers[0] !== question.answer ? 'bg-red-100 text-red-500' : ''}
                      ${!answers[0] || answers[0].length === 0 ? 'ring-4 ring-yellow-300 bg-yellow-50' : ''}
                    `}
                  >
                    {answers[0] || '?'}
                  </motion.div>
                </div>
              </div>
              ) : question.type === 'number_comparison' ? (
                renderNumberComparison()
              ) : question.type === 'input' ? (
                renderInput()
              ) : question.type === 'counting' ? (
                renderCounting()
              ) : question.type === 'choice' ? (
                renderChoice()
              ) : question.type === 'multi_vertical' ? (
                renderMultiVertical()
              ) : (
                renderVerticalMath()
              )}

              {/* Correct Checkmark */}
              {feedback === 'correct' && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="absolute bottom-4"
                >
                  <div className="bg-white rounded-full w-12 h-12 flex items-center justify-center shadow-sm">
                    <Check className="w-8 h-8 text-green-500" strokeWidth={4} />
                  </div>
                </motion.div>
              )}
            </motion.div>

          {question.type === 'number_comparison' ? (
            <div className="grid grid-cols-3 gap-4 px-2 py-1 max-w-md mx-auto">
              {['>', '=', '<'].map((sym) => (
                <button
                  key={sym}
                  onClick={() => handleKeyPress(sym)}
                  className="bg-white rounded-[1.5rem] h-20 flex items-center justify-center text-blue-500 shadow-[0_8px_0_#e5e7eb] active:shadow-none active:translate-y-2 transition-all"
                >
                  <span className="text-6xl font-bold">{sym}</span>
                </button>
              ))}
            </div>
          ) : question.type === 'choice' ? (
            <div className="max-w-3xl mx-auto">
              {renderChoiceButtons()}
            </div>
          ) : (
            <div className="w-full max-w-3xl mx-auto flex flex-col gap-4 items-center">
              <div className="grid w-full grid-cols-5 gap-4">
                {[1, 2, 3, 4, 5].map(num => (
                  <button
                    key={num}
                    onClick={() => handleKeyPress(num.toString())}
                    className="bg-white rounded-2xl h-14 w-full text-3xl font-bold text-gray-700 shadow-[0_5px_0_#e5e7eb] active:shadow-none active:translate-y-1 transition-all"
                  >
                    {num}
                  </button>
                ))}
              </div>
              <div className="grid w-full grid-cols-5 gap-4">
                {[6, 7, 8, 9, 0].map(num => (
                  <button
                    key={num}
                    onClick={() => handleKeyPress(num.toString())}
                    className="bg-white rounded-2xl h-14 w-full text-3xl font-bold text-gray-700 shadow-[0_5px_0_#e5e7eb] active:shadow-none active:translate-y-1 transition-all"
                  >
                    {num}
                  </button>
                ))}
              </div>
              <button
                onClick={() => handleKeyPress('delete')}
                className="bg-white rounded-2xl h-14 w-full flex items-center justify-center text-red-400 shadow-[0_5px_0_#e5e7eb] active:shadow-none active:translate-y-1 transition-all"
              >
                <Delete size={32} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
