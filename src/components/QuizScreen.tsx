import React, { memo, useEffect, useMemo, useState } from 'react';
import { ChevronLeft, Delete, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { allLevelsData, type Question } from '../data/questions';
import { type AttackEffectFamily, type AttackEffectProfile } from '../data/growthRewards';
import { playCloudPuffBreak, playCloudPuffBurst, playCloudPuffCharge, primeBattleSfx, startBattleBgm, stopBattleBgm, warmupBattleBgm } from './battleSfx';
import { warmupBattleAssets } from './battleAssetWarmup';
import { getBattleGridLayout } from './battleLayoutCache';
import { getLevelZeroShotPlan, isLevelZeroTutorial, LEVEL_ZERO_BATTLE_CONFIG } from './levelZeroBattle';
import { getBreakFeedbackProfile, getCameraShakeProfile, getChargeDuration, getExplosionProfile, getRemovalCount, getShotTier, getShotTiming, type ShotTier } from './quizTiming';

/**
 * 错题详情（用于传递给父组件记录）
 */
export interface WrongAnswerDetail {
  questionId: string;        // 题目ID
  questionText: string;      // 题干描述
  correctAnswer: string;     // 正确答案
  userAnswer: string;        // 用户答案
}

/**
 * 关卡完成统计数据
 */
export interface LevelFinishStats {
  accuracy: number;          // 正确率（0-100）
  time: number;              // 通关用时（秒）
  maxCombo: number;          // 最大连击
  expGained: number;         // 获得经验
  totalQuestions: number;    // 总题数
  correctCount: number;      // 正确题数
  wrongAnswers: WrongAnswerDetail[]; // 错题列表
}

const DEFAULT_BATTLE_BLOCKS = 35;
const DEFAULT_BATTLE_BLOCK_COLUMNS = 5;
const DEFAULT_BATTLE_BLOCK_ROWS = 7;

const BLOCK_WOBBLE_ANIMATE = {
  x: [-1.4, 1.6, -1.2],
  rotate: [-1.2, 1.4, -1],
  y: [0, -0.8, 0.6],
};

const BLOCK_WOBBLE_TRANSITION = {
  duration: 2.2,
  repeat: Infinity,
  repeatType: 'mirror' as const,
  ease: 'easeInOut' as const,
};

type ExplosionShardPreset = {
  x: number;
  y: number;
  rotation: number;
  width: number;
  height: number;
  color: string;
  delayOffset: number;
};

type ExplosionSparkPreset = {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  delayOffset: number;
};

type ExplosionScreenShardPreset = {
  offsetX: number;
  offsetY: number;
  rotationMid: number;
  rotationEnd: number;
  width: number;
  height: number;
  color: string;
  delayOffset: number;
};

type ExplosionPreset = {
  shards: ExplosionShardPreset[];
  sparks: ExplosionSparkPreset[];
  screenShards: ExplosionScreenShardPreset[];
};

const explosionPresetCache = new Map<string, ExplosionPreset>();
const effectRankCache = new Map<string, number>();
const impactTravelProfileCache = new Map<string, ReturnType<typeof buildImpactTravelProfile>>();

const createSeededRandom = (seed: number) => {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };
};

const getEffectRank = (effect: AttackEffectProfile) => {
  const cached = effectRankCache.get(effect.name);
  if (cached !== undefined) return cached;

  let rank = 1;
  if (effect.name.includes('智慧之力')) rank = 4;
  else if (effect.name.includes('III')) rank = 3;
  else if (effect.name.includes('II')) rank = 2;

  effectRankCache.set(effect.name, rank);
  return rank;
};

const getFamilyTempoMultiplier = (family: AttackEffectFamily, rank: number) => {
  switch (family) {
    case 'ember':
      return Math.max(0.64, 0.96 - rank * 0.06);
    case 'gale':
      return Math.max(0.56, 0.82 - rank * 0.08);
    case 'beam':
      return Math.max(0.48, 0.76 - rank * 0.08);
    case 'star':
      return Math.max(0.72, 1.02 - rank * 0.06);
    case 'radiant':
      return 1.06 + rank * 0.06;
    case 'arcane':
      return 0.96 + rank * 0.05;
    default:
      return 1;
  }
};

const buildImpactTravelProfile = (family: AttackEffectFamily, rank: number) => {
  switch (family) {
    case 'gale':
      return {
        width: 104 + rank * 18,
        height: 34 + rank * 7,
        borderRadius: '999px',
        startX: 34 + rank * 10,
        midX: -18 - rank * 6,
        endX: -54 - rank * 14,
        startY: 14,
        midY: -8 - rank,
        endY: -10 - rank,
      };
    case 'beam':
      return {
        width: 136 + rank * 28,
        height: 18 + rank * 3,
        borderRadius: '999px',
        startX: 64 + rank * 18,
        midX: 12 + rank * 4,
        endX: -66 - rank * 18,
        startY: 4,
        midY: 0,
        endY: -2,
      };
    case 'star':
      return {
        width: 74 + rank * 12,
        height: 74 + rank * 12,
        borderRadius: '1.4rem',
        startX: 18,
        midX: -10 - rank * 3,
        endX: -28 - rank * 6,
        startY: 8,
        midY: 0,
        endY: -3,
      };
    case 'radiant':
      return {
        width: 112 + rank * 22,
        height: 112 + rank * 22,
        borderRadius: '999px',
        startX: 14,
        midX: -10,
        endX: -22 - rank * 4,
        startY: 10,
        midY: 2,
        endY: 0,
      };
    case 'arcane':
      return {
        width: 92 + rank * 18,
        height: 92 + rank * 18,
        borderRadius: '1.6rem',
        startX: 16,
        midX: -8 - rank * 3,
        endX: -26 - rank * 6,
        startY: 10,
        midY: 1,
        endY: -2,
      };
    case 'ember':
    default:
      return {
        width: 78 + rank * 12,
        height: 78 + rank * 12,
        borderRadius: '999px',
        startX: 18,
        midX: -12 - rank * 4,
        endX: -34 - rank * 7,
        startY: 8,
        midY: 0,
        endY: -2,
      };
  }
};

const getImpactTravelProfile = (family: AttackEffectFamily, rank: number) => {
  const cacheKey = `${family}:${rank}`;
  const cached = impactTravelProfileCache.get(cacheKey);
  if (cached) return cached;

  const profile = buildImpactTravelProfile(family, rank);
  impactTravelProfileCache.set(cacheKey, profile);
  return profile;
};

const getShardColors = (tier: ShotTier, effect: AttackEffectProfile) =>
  tier === 'final'
    ? [effect.coreColor, effect.glowColor, effect.tailColor, effect.ringColor, 'rgba(255,255,255,0.95)']
    : tier === 'super'
    ? [effect.coreColor, effect.glowColor, effect.tailColor, effect.ringColor]
    : [effect.coreColor, effect.glowColor, effect.tailColor];

const getSparkColors = (tier: ShotTier, effect: AttackEffectProfile) =>
  tier === 'final'
    ? ['#FFFFFF', effect.coreColor, effect.ringColor, effect.glowColor]
    : ['#FFFFFF', effect.coreColor, effect.glowColor];

const getExplosionPreset = (tier: ShotTier, seed: number, profile: ReturnType<typeof getExplosionProfile>, effect: AttackEffectProfile) => {
  const cacheKey = `${tier}:${seed}:${effect.name}:${effect.family}`;
  const cached = explosionPresetCache.get(cacheKey);
  if (cached) return cached;

  const shardColors = getShardColors(tier, effect);
  const sparkColors = getSparkColors(tier, effect);
  const rand = createSeededRandom(seed + 1);
  const family = effect.family;
  const rank = getEffectRank(effect);

  const preset: ExplosionPreset = {
    shards: Array.from({ length: profile.shardCount }, (_, i) => {
      let angle = (i / profile.shardCount) * Math.PI * 2 + (i % 2 === 0 ? -0.12 : 0.18);
      let distance = profile.shardDistanceBase + (i % 4) * (18 + rank * 2);
      let width = (tier === 'final' ? 16 : tier === 'super' ? 14 : 12) + rank;
      let height = i % 3 === 0 ? 8 + Math.floor(rank / 2) : 6 + Math.floor(rank / 3);

      if (family === 'gale') {
        angle -= 0.56;
        distance *= 1.12 + (i % 2) * 0.16;
        width += 8;
        height = 4;
      } else if (family === 'beam') {
        angle = (i % 2 === 0 ? 0 : Math.PI) + (rand() - 0.5) * 0.48;
        distance *= 1.24 + (i % 3) * 0.22 + rank * 0.08;
        width += 12 + rank * 2;
        height = 4;
      } else if (family === 'star') {
        angle = ((i % 4) * Math.PI) / 2 + (Math.floor(i / 4) % 2 === 0 ? 0 : Math.PI / 4);
        distance *= 1.08 + (i % 3) * 0.18 + rank * 0.06;
        width += 4 + rank;
      } else if (family === 'radiant') {
        distance *= 1 + (i % 4) * 0.1 + rank * 0.04;
        width += 6 + rank;
        height += 4 + Math.floor(rank / 2);
      } else if (family === 'arcane') {
        angle = ((i % 4) * Math.PI) / 2 + (i % 2 === 0 ? 0 : Math.PI / 4);
        distance *= 1.14 + (i % 3) * 0.18 + rank * 0.06;
        width = (tier === 'final' ? 18 : 14) + rank;
        height = width;
      }

      let x = Math.cos(angle) * distance;
      let y = Math.sin(angle) * distance;
      if (family === 'gale') {
        x *= 1.28;
        y *= 0.68;
      } else if (family === 'beam') {
        y *= 0.45;
      } else if (family === 'arcane') {
        x *= 0.92;
        y *= 0.92;
      }

      return {
        x,
        y,
        rotation: (rand() - 0.5) * 240,
        width,
        height,
        color: shardColors[i % shardColors.length],
        delayOffset: 0.02 + (i % 3) * 0.012,
      };
    }),
    sparks: Array.from({ length: profile.sparkCount }, (_, i) => {
      let angle = (i / profile.sparkCount) * Math.PI * 2 + Math.sin(i * 1.7) * 0.08;
      let distance = profile.sparkDistanceBase + (i % 5) * (16 + rank * 2);
      let size = (i % 4 === 0 ? 9 : 6) + Math.floor(rank / 2);

      if (family === 'gale') {
        angle -= 0.44;
        distance *= 1.14;
      } else if (family === 'beam') {
        angle = (i % 2 === 0 ? 0 : Math.PI) + (rand() - 0.5) * 0.38;
        distance *= 1.4 + rank * 0.08;
      } else if (family === 'star') {
        angle = ((i % 8) * Math.PI) / 4;
        distance *= i % 2 === 0 ? 1.34 + rank * 0.06 : 0.9 + rank * 0.03;
        size = i % 2 === 0 ? 10 + rank : 5 + Math.floor(rank / 2);
      } else if (family === 'radiant') {
        distance *= 0.96 + (i % 4) * 0.12 + rank * 0.04;
        size += 3 + Math.floor(rank / 2);
      } else if (family === 'arcane') {
        angle = ((i % 4) * Math.PI) / 2 + Math.PI / 4;
        distance *= 1.16 + (i % 3) * 0.2 + rank * 0.05;
      }

      let x = Math.cos(angle) * distance;
      let y = Math.sin(angle) * distance;
      if (family === 'beam') {
        y *= 0.42;
      } else if (family === 'gale') {
        x *= 1.22;
        y *= 0.74;
      }

      return {
        x,
        y,
        width: size,
        height: size,
        color: sparkColors[i % sparkColors.length],
        delayOffset: 0.05 + (i % 6) * 0.01,
      };
    }),
    screenShards: profile.hasScreenFacingShards
      ? Array.from({ length: profile.screenShardCount }, (_, i) => ({
          offsetX:
            family === 'beam'
              ? (i % 2 === 0 ? 1 : -1) * (tier === 'final' ? 112 : 88)
              : family === 'gale'
              ? (rand() - 0.2) * (tier === 'final' ? 118 : 92)
              : (rand() - 0.5) * (tier === 'final' ? 90 : 70),
          offsetY:
            family === 'beam'
              ? (rand() - 0.5) * 26
              : family === 'gale'
              ? (rand() - 0.5) * (tier === 'final' ? 52 : 42)
              : (rand() - 0.5) * (tier === 'final' ? 76 : 58),
          rotationMid: (i % 2 === 0 ? 1 : -1) * 48,
          rotationEnd: (i % 2 === 0 ? 1 : -1) * 112,
          width: family === 'arcane' ? (tier === 'final' ? 20 : 16) : tier === 'final' ? 22 : 18,
          height: family === 'beam' || family === 'gale' ? 8 : tier === 'final' ? 14 : 12,
          color: shardColors[i % shardColors.length],
          delayOffset: 0.03 + i * 0.02,
        }))
      : [],
  };

  explosionPresetCache.set(cacheKey, preset);
  return preset;
};

const BlockExplosion = memo(({ delay = 0, tier = 'normal', seed, effect }: { delay?: number; tier?: ShotTier; seed: number; effect: AttackEffectProfile }) => {
  const profile = useMemo(() => getExplosionProfile(tier), [tier]);
  const preset = useMemo(() => getExplosionPreset(tier, seed, profile, effect), [effect, profile, seed, tier]);
  const burstScale = tier === 'final' ? 3.9 : 3.1;
  const rank = getEffectRank(effect);
  const familyTempo = getFamilyTempoMultiplier(effect.family, rank);
  const flashDuration = (tier === 'final' ? 0.48 : 0.42) * familyTempo;
  const shockwaveDuration = (tier === 'final' ? 0.66 : 0.58) * familyTempo;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-visible">
      <motion.div
        initial={{ scale: 0.2, opacity: 0.98 }}
        animate={{ scale: [0.2, profile.flashScale * (0.7 + rank * 0.04), profile.flashScale * (1 + rank * 0.05)], opacity: [0.98, 0.7, 0] }}
        transition={{ duration: flashDuration, delay, ease: 'easeOut', times: [0, 0.24, 1] }}
        className={`absolute inset-[2%] ${effect.family === 'beam' ? 'rounded-[999px]' : 'rounded-full'}`}
        style={{
          background: `radial-gradient(circle, rgba(255,255,255,1), ${effect.coreColor} 20%, ${effect.glowColor} 42%, ${effect.tailColor} 68%, transparent 100%)`,
          transform: effect.family === 'gale' ? 'rotate(-24deg)' : effect.family === 'beam' ? 'scaleX(1.7)' : undefined,
          willChange: 'transform, opacity',
        }}
      />

      {effect.family === 'gale' && (
        <motion.div
          initial={{ opacity: 0, x: -12, scaleX: 0.3 }}
          animate={{ opacity: [0, 0.98, 0.2, 0], x: [-12, 10 + rank * 4, 30 + rank * 8, 50 + rank * 10], scaleX: [0.3, 1.1, 1.32 + rank * 0.08, 1.42 + rank * 0.08] }}
          transition={{ duration: (0.4 + rank * 0.04) * familyTempo, delay: delay + 0.01, ease: 'easeOut' }}
          className="absolute left-1/2 top-1/2 h-4 w-[190%] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            background: `linear-gradient(90deg, transparent 0%, ${effect.tailColor} 24%, rgba(255,255,255,0.98) 50%, ${effect.glowColor} 76%, transparent 100%)`,
            transform: 'rotate(-24deg)',
            filter: 'blur(3px)',
            willChange: 'transform, opacity',
          }}
        />
      )}

      {effect.family === 'beam' && (
        <motion.div
          initial={{ opacity: 0, x: 22, scaleX: 0.18 }}
          animate={{ opacity: [0, 1, 0.62, 0], x: [22 + rank * 12, -6, -40 - rank * 8, -60 - rank * 12], scaleX: [0.18, 1.18, 1.48 + rank * 0.08, 1.56 + rank * 0.1] }}
          transition={{ duration: (0.34 + rank * 0.03) * familyTempo, delay: delay + 0.01, ease: 'easeOut' }}
          className="absolute left-1/2 top-1/2 h-3 w-[280%] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            background: `linear-gradient(90deg, transparent 0%, ${effect.tailColor} 18%, rgba(255,255,255,0.99) 50%, ${effect.glowColor} 78%, transparent 100%)`,
            boxShadow: `0 0 24px ${effect.glowColor}`,
            willChange: 'transform, opacity',
          }}
        />
      )}

      {effect.family === 'star' && (
        <>
          <motion.div
            initial={{ opacity: 0, scaleX: 0.24 }}
            animate={{ opacity: [0, 0.94, 0], scaleX: [0.24, 1.26 + rank * 0.08, 1.56 + rank * 0.1] }}
            transition={{ duration: 0.46 * familyTempo, delay: delay + 0.02, ease: 'easeOut' }}
            className="absolute left-1/2 top-1/2 h-[3px] w-[220%] -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{ background: `linear-gradient(90deg, transparent, ${effect.ringColor}, transparent)`, willChange: 'transform, opacity' }}
          />
          <motion.div
            initial={{ opacity: 0, scaleY: 0.24 }}
            animate={{ opacity: [0, 0.94, 0], scaleY: [0.24, 1.26 + rank * 0.08, 1.56 + rank * 0.1] }}
            transition={{ duration: 0.46 * familyTempo, delay: delay + 0.02, ease: 'easeOut' }}
            className="absolute left-1/2 top-1/2 h-[220%] w-[3px] -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{ background: `linear-gradient(180deg, transparent, ${effect.ringColor}, transparent)`, willChange: 'transform, opacity' }}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.24, rotate: 45 }}
            animate={{ opacity: [0, 0.88, 0], scale: [0.24, 1.04 + rank * 0.08, 1.22 + rank * 0.1], rotate: 45 }}
            transition={{ duration: 0.48 * familyTempo, delay: delay + 0.04, ease: 'easeOut' }}
            className="absolute left-1/2 top-1/2 h-[180%] w-[180%] -translate-x-1/2 -translate-y-1/2"
            style={{
              background:
                `linear-gradient(90deg, transparent calc(50% - 1.5px), ${effect.ringColor} 50%, transparent calc(50% + 1.5px)),
                 linear-gradient(180deg, transparent calc(50% - 1.5px), ${effect.ringColor} 50%, transparent calc(50% + 1.5px))`,
              willChange: 'transform, opacity',
            }}
          />
        </>
      )}

      {effect.family === 'radiant' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: [0, effect.flashOpacity + 0.42 + rank * 0.04, 0.22, 0], scale: [0.5, 1.3 + rank * 0.08, 1.64 + rank * 0.1, 1.86 + rank * 0.1] }}
          transition={{ duration: (0.62 + rank * 0.06) * familyTempo, delay: delay + 0.01, ease: 'easeOut' }}
          className="absolute inset-[-30%] rounded-full"
          style={{
            background: `radial-gradient(circle, rgba(255,255,255,0.92) 0%, ${effect.haloColor} 36%, rgba(255,255,255,0) 78%)`,
            filter: 'blur(12px)',
            willChange: 'transform, opacity',
          }}
        />
      )}

      {effect.family === 'arcane' && (
        <>
          <motion.div
            initial={{ opacity: 0, scale: 0.34, rotate: 0 }}
            animate={{ opacity: [0, 0.88, 0], scale: [0.34, 1.02 + rank * 0.08, 1.26 + rank * 0.1], rotate: [0, 44, 88] }}
            transition={{ duration: 0.58 * familyTempo, delay: delay + 0.02, ease: 'easeOut' }}
            className="absolute left-1/2 top-1/2 h-[152%] w-[152%] -translate-x-1/2 -translate-y-1/2"
            style={{ willChange: 'transform, opacity' }}
          >
            <svg viewBox="0 0 100 100" className="h-full w-full overflow-visible">
              <polygon
                points="50,8 14,74 86,74"
                fill="none"
                stroke={effect.ringColor}
                strokeWidth="2.4"
                strokeLinejoin="round"
                style={{ filter: `drop-shadow(0 0 8px ${effect.haloColor})` }}
              />
            </svg>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.34, rotate: 0 }}
            animate={{ opacity: [0, 0.84, 0], scale: [0.34, 1 + rank * 0.08, 1.22 + rank * 0.1], rotate: [0, -38, -82] }}
            transition={{ duration: 0.62 * familyTempo, delay: delay + 0.04, ease: 'easeOut' }}
            className="absolute left-1/2 top-1/2 h-[152%] w-[152%] -translate-x-1/2 -translate-y-1/2"
            style={{ willChange: 'transform, opacity' }}
          >
            <svg viewBox="0 0 100 100" className="h-full w-full overflow-visible">
              <polygon
                points="50,92 14,26 86,26"
                fill="none"
                stroke={effect.coreColor}
                strokeWidth="2.4"
                strokeLinejoin="round"
              />
            </svg>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.46, rotate: 0 }}
            animate={{ opacity: [0, 0.58, 0], scale: [0.46, 1.04, 1.18], rotate: [0, 16, 32] }}
            transition={{ duration: 0.7 * familyTempo, delay: delay + 0.06, ease: 'easeOut' }}
            className="absolute left-1/2 top-1/2 h-[172%] w-[172%] -translate-x-1/2 -translate-y-1/2 rounded-full border"
            style={{ borderColor: effect.haloColor, boxShadow: `0 0 20px ${effect.haloColor}`, willChange: 'transform, opacity' }}
          />
        </>
      )}

      <motion.div
        initial={{ scale: 0.2, opacity: 0.9 }}
        animate={{ scale: [0.2, 1, 1.28], opacity: [0.9, 0.34, 0] }}
        transition={{ duration: shockwaveDuration, delay: delay + 0.02, ease: 'easeOut', times: [0, 0.36, 1] }}
        className="absolute left-1/2 top-1/2 rounded-full border border-white/80"
        style={{
          width: profile.shockwaveSize,
          height: profile.shockwaveSize,
          marginLeft: -profile.shockwaveSize / 2,
          marginTop: -profile.shockwaveSize / 2,
          boxShadow: '0 0 38px rgba(255,255,255,0.45)',
          transform: effect.family === 'gale' ? 'rotate(-20deg)' : effect.family === 'beam' ? 'scaleX(1.35)' : undefined,
          willChange: 'transform, opacity',
        }}
      />

      {preset.shards.map((shard, i) => (
        <motion.div
          key={`shard-${i}`}
          initial={{ x: 0, y: 0, scale: 0.4, opacity: 1, rotate: 0 }}
          animate={{ x: shard.x, y: shard.y, scale: [0.4, 1.24, 0.78], opacity: [1, 1, 0], rotate: [0, shard.rotation, shard.rotation * 1.35] }}
          transition={{ duration: tier === 'final' ? 0.72 : 0.62, delay: delay + shard.delayOffset, ease: [0.12, 0.8, 0.2, 1] }}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{
            width: shard.width,
            height: shard.height,
            willChange: 'transform, opacity',
          }}
        >
          {effect.family === 'arcane' ? (
            <svg viewBox="0 0 100 100" className="h-full w-full overflow-visible">
              <circle cx="50" cy="50" r="18" fill={shard.color} opacity="0.3" />
              <path
                d="M50 12 L59 34 L83 34 L64 49 L72 72 L50 58 L28 72 L36 49 L17 34 L41 34 Z"
                fill="none"
                stroke={shard.color}
                strokeWidth="8"
                strokeLinejoin="round"
                style={{ filter: `drop-shadow(0 0 6px ${shard.color})` }}
              />
            </svg>
          ) : (
            <div
              className="h-full w-full rounded-[0.35rem]"
              style={{
                background: `linear-gradient(135deg, ${shard.color} 0%, rgba(255,255,255,0.95) 48%, rgba(251,146,60,0.4) 100%)`,
                boxShadow: `0 0 22px ${shard.color}`,
              }}
            />
          )}
        </motion.div>
      ))}

      {preset.sparks.map((spark, i) => (
        <motion.div
          key={`spark-${i}`}
          initial={{ x: 0, y: 0, scale: 0.2, opacity: 0.95 }}
          animate={{ x: spark.x, y: spark.y, scale: [0.2, 1.06, 0.28], opacity: [0.95, 0.82, 0] }}
          transition={{ duration: tier === 'final' ? 0.84 : 0.72, delay: delay + spark.delayOffset, ease: 'easeOut' }}
          className="absolute left-1/2 top-1/2 rounded-full -translate-x-1/2 -translate-y-1/2"
          style={{
            width: spark.width,
            height: spark.height,
            background: spark.color,
            boxShadow: `0 0 18px ${spark.color}`,
            willChange: 'transform, opacity',
          }}
        />
      ))}

      {preset.screenShards.map((screenShard, i) => (
        <motion.div
          key={`screen-shard-${i}`}
          initial={{ x: 0, y: 0, scale: 0.22, opacity: 0, z: 0, rotate: 0 }}
          animate={{
            x: [0, screenShard.offsetX * 0.35, screenShard.offsetX],
            y: [0, screenShard.offsetY * 0.28, screenShard.offsetY],
            scale: [0.22, burstScale * 0.62, burstScale],
            opacity: [0, 1, 0],
            rotate: [0, screenShard.rotationMid, screenShard.rotationEnd],
          }}
          transition={{ duration: tier === 'final' ? 0.78 : 0.68, delay: delay + screenShard.delayOffset, ease: [0.16, 0.84, 0.2, 1] }}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{
            width: screenShard.width,
            height: screenShard.height,
            willChange: 'transform, opacity',
          }}
        >
          {effect.family === 'arcane' ? (
            <svg viewBox="0 0 100 100" className="h-full w-full overflow-visible">
              <circle cx="50" cy="50" r="34" fill="none" stroke={screenShard.color} strokeWidth="10" opacity="0.7" />
              <circle cx="50" cy="50" r="16" fill={screenShard.color} opacity="0.2" />
            </svg>
          ) : (
            <div
              className="h-full w-full rounded-[0.55rem]"
              style={{
                background: `linear-gradient(135deg, rgba(255,255,255,0.98) 0%, ${screenShard.color} 52%, rgba(251,146,60,0.52) 100%)`,
                boxShadow: `0 0 28px ${screenShard.color}`,
              }}
            />
          )}
        </motion.div>
      ))}
    </div>
  );
});

type BattleBlockProps = {
  index: number;
  cleared: boolean;
  justCleared: boolean;
  shotTier: ShotTier;
  clearDelay: number;
  effect: AttackEffectProfile;
  gemImage: string | undefined;
  isLevelZero: boolean;
};

const BattleBlock: React.FC<BattleBlockProps> = memo(({
  index,
  cleared,
  justCleared,
  shotTier,
  clearDelay,
  effect,
  gemImage,
  isLevelZero,
}) => {
  const wobbleDelay = (index % 5) * 0.12;

  return (
    <div className="relative flex h-full w-full items-center justify-center">
      {!cleared && (
        <motion.div
          animate={BLOCK_WOBBLE_ANIMATE}
          transition={{
            ...BLOCK_WOBBLE_TRANSITION,
            delay: wobbleDelay,
          }}
          className={isLevelZero
            ? "relative overflow-visible will-change-transform w-14 h-14 sm:w-[84px] sm:h-[84px] md:w-[88px] md:h-[88px]"
            : "relative h-full w-full overflow-visible will-change-transform"
          }
        >
          <img
            src={gemImage ?? ''}
            alt=""
            draggable={false}
            className={isLevelZero ? "select-none w-full h-full object-contain" : "h-full w-full object-fill select-none"}
            style={{
              filter: 'drop-shadow(0 8px 14px rgba(49,104,201,0.2))',
              ...(isLevelZero ? {} : { maxWidth: '120%', maxHeight: '110%' }),
            }}
          />
        </motion.div>
      )}

      {justCleared && (
        <>
          <motion.div
            initial={{ scale: 1, opacity: 1, rotate: 0 }}
            animate={{ scale: [1, 1.08, 0.2], opacity: [1, 1, 0], rotate: [0, -6, 8] }}
            transition={{ duration: 0.44, delay: clearDelay, ease: 'easeOut' }}
            className={isLevelZero
              ? "absolute overflow-visible w-14 h-14 sm:w-[84px] sm:h-[84px] md:w-[88px] md:h-[88px]"
              : "absolute h-full w-full overflow-visible"
            }
          >
            <img
              src={gemImage ?? ''}
              alt=""
              draggable={false}
              className={isLevelZero ? "select-none w-full h-full object-contain" : "h-full w-full object-fill select-none"}
              style={{
                filter: 'drop-shadow(0 9px 16px rgba(49,104,201,0.22))',
                ...(isLevelZero ? {} : { maxWidth: '120%', maxHeight: '110%' }),
              }}
            />
          </motion.div>
          <BlockExplosion delay={clearDelay} tier={shotTier} seed={index} effect={effect} />
        </>
      )}
    </div>
  );
}, (prevProps, nextProps) =>
  prevProps.index === nextProps.index &&
  prevProps.cleared === nextProps.cleared &&
  prevProps.justCleared === nextProps.justCleared &&
  prevProps.shotTier === nextProps.shotTier &&
  prevProps.clearDelay === nextProps.clearDelay &&
  prevProps.effect === nextProps.effect &&
  prevProps.gemImage === nextProps.gemImage &&
  prevProps.isLevelZero === nextProps.isLevelZero
);

const BattleBlockGrid = memo(
  ({
    clearedBlocks,
    lastRemoval,
    shotTier,
    effect,
    gemImage,
    totalBlocks,
    columns,
    rows,
    isLevelZero,
  }: {
    clearedBlocks: number;
    lastRemoval: number;
    shotTier: ShotTier;
    effect: AttackEffectProfile;
    gemImage: string | undefined;
    totalBlocks: number;
    columns: number;
    rows: number;
    isLevelZero: boolean;
  }) => {
    const { blockIndexes, blockClearRank } = getBattleGridLayout(totalBlocks, columns);
    const recentClearStart = Math.max(0, clearedBlocks - lastRemoval);

    return (
      <div
        className="grid h-full w-full min-h-0 gap-x-2 sm:gap-x-3 gap-y-1 sm:gap-y-1.5 place-items-stretch"
        style={{
          gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
        }}
      >
        {blockIndexes.map((index) => {
          const clearRank = blockClearRank[index];
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
              effect={effect}
              gemImage={gemImage}
              isLevelZero={isLevelZero}
            />
          );
        })}
      </div>
    );
  },
  (prevProps, nextProps) =>
    prevProps.clearedBlocks === nextProps.clearedBlocks &&
    prevProps.lastRemoval === nextProps.lastRemoval &&
    prevProps.shotTier === nextProps.shotTier &&
    prevProps.effect === nextProps.effect &&
    prevProps.gemImage === nextProps.gemImage &&
    prevProps.totalBlocks === nextProps.totalBlocks &&
    prevProps.columns === nextProps.columns &&
    prevProps.rows === nextProps.rows,
);

const ComboHud = memo(({ displayCombo }: { displayCombo: number }) => {
  const showCombo = displayCombo >= 3;

  return (
    <AnimatePresence>
      {showCombo ? (
        <motion.div
          initial={{ opacity: 0, y: -12, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -12, scale: 0.84 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="relative flex min-h-[88px] w-fit items-end justify-end gap-1.5 overflow-visible px-1 pt-3 pb-2 text-right"
          style={{ willChange: 'transform, opacity' }}
        >
          <span
            className="relative z-10 -skew-x-[10deg] text-[clamp(1.44rem,2.33vw,1.88rem)] font-black italic leading-[1.06] tracking-[-0.05em] text-[#ffd23a]"
            style={{
              textShadow: `
                0 -2px 0 #5a2b16,
                2px -2px 0 #5a2b16,
                -2px -2px 0 #5a2b16,
                0 4px 0 #5a2b16,
                2px 0 0 #5a2b16,
                -2px 0 0 #5a2b16,
                0 2px 0 #5a2b16,
                2px 2px 0 #5a2b16,
                -2px 2px 0 #5a2b16,
                0 0 14px rgba(255,219,95,0.28)
              `,
            }}
          >
            combo
          </span>
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={displayCombo}
              initial={{ opacity: 0, y: -8, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.9 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="relative z-10 min-w-[4.2rem] -skew-x-[10deg] text-left text-[clamp(2.32rem,3.66vw,3rem)] font-black italic leading-[1.04] tracking-[-0.06em] text-[#ffd23a]"
              style={{
                textShadow: `
                  0 -2px 0 #5a2b16,
                  2px -2px 0 #5a2b16,
                  -2px -2px 0 #5a2b16,
                  0 4px 0 #5a2b16,
                  2px 0 0 #5a2b16,
                  -2px 0 0 #5a2b16,
                  0 2px 0 #5a2b16,
                  2px 2px 0 #5a2b16,
                  -2px 2px 0 #5a2b16,
                  0 0 16px rgba(255,219,95,0.32)
                `,
                willChange: 'transform, opacity',
              }}
            >
              {`x${displayCombo}`}
            </motion.span>
          </AnimatePresence>
        </motion.div>
      ) : (
        <div className="h-full w-full rounded-[1.6rem]" />
      )}
    </AnimatePresence>
  );
}, (prevProps, nextProps) => prevProps.displayCombo === nextProps.displayCombo);

const BattleStage = memo(({
  selectedPet,
  combo,
  displayCombo,
  shotTier,
  effect,
  gemImage,
  clearedBlocks,
  lastRemoval,
  shotSequence,
  impactSequence,
  totalBlocks,
  blockColumns,
  blockRows,
  isLevelZero,
}: {
  selectedPet: any;
  combo: number;
  displayCombo: number;
  shotTier: ShotTier;
  effect: AttackEffectProfile;
  gemImage: string | undefined;
  clearedBlocks: number;
  lastRemoval: number;
  shotSequence: number;
  impactSequence: number;
  totalBlocks: number;
  blockColumns: number;
  blockRows: number;
  isLevelZero: boolean;
}) => {
  const [cameraShakePulse, setCameraShakePulse] = useState(0);
  const showImpact = shotTier !== 'idle' && shotTier !== 'break';
  const chargeDuration = getChargeDuration(shotTier);
  const isBreakHit = shotTier === 'break';
  const breakSourceTier = combo >= 10 ? 'final' : combo >= 6 ? 'super' : combo >= 3 ? 'boost' : 'normal';
  const breakFeedback = getBreakFeedbackProfile(breakSourceTier);
  const cameraShake = getCameraShakeProfile(shotTier);
  const petScalePeak = shotTier === 'final' ? 1.34 : shotTier === 'super' ? 1.22 : shotTier === 'boost' ? 1.12 : 1.05;
  const rank = getEffectRank(effect);
  const familyTempo = getFamilyTempoMultiplier(effect.family, rank);
  const impactTravel = getImpactTravelProfile(effect.family, rank);
  const impactDuration = (chargeDuration + 0.62) * familyTempo;
  const petChargeDuration = chargeDuration * familyTempo;
  useEffect(() => {
    if (!cameraShake.enabled || impactSequence === 0) return;

    setCameraShakePulse(impactSequence);
    const timeout = setTimeout(() => setCameraShakePulse(0), cameraShake.duration * 1000);
    return () => clearTimeout(timeout);
  }, [cameraShake.duration, cameraShake.enabled, impactSequence]);

  const petGlowStyle = useMemo(
    () =>
      shotTier === 'final'
        ? { filter: `drop-shadow(0 0 40px ${effect.glowColor}) drop-shadow(0 0 18px ${effect.coreColor})` }
        : shotTier === 'super'
        ? { filter: `drop-shadow(0 0 28px ${effect.glowColor}) drop-shadow(0 0 14px ${effect.coreColor})` }
        : shotTier === 'boost'
        ? { filter: `drop-shadow(0 0 22px ${effect.glowColor})` }
        : { filter: `drop-shadow(0 0 14px ${effect.glowColor})` },
    [effect.coreColor, effect.glowColor, shotTier],
  );

  const impactScalePeak =
    effect.baseImpactScale * (shotTier === 'final' ? 1.3 : shotTier === 'super' ? 1.16 : shotTier === 'boost' ? 1.08 : 1);
  const impactRingPeak =
    effect.baseImpactScale * (shotTier === 'final' ? 1.56 : shotTier === 'super' ? 1.36 : shotTier === 'boost' ? 1.24 : 1.14);
  const particleEnabled = effect.particleOpacity > 0.25;
  const showSecondRing = effect.secondRingOpacity > 0.01;
  const showFinalFlash = shotTier === 'final' && effect.flashOpacity > 0;

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
      <AnimatePresence>
        {showImpact && (
          <motion.div
            key={`impact-${shotSequence}-${shotTier}-${effect.name}`}
            initial={{ opacity: 0, scale: 0.18, x: impactTravel.startX, y: impactTravel.startY }}
            animate={{
              opacity: [0, 0, 0.98, 0.48, 0],
              scale: [0.18, 0.18, impactScalePeak, impactScalePeak * 1.12, impactScalePeak * 1.26],
              x: [impactTravel.startX, impactTravel.startX * 0.66, impactTravel.midX, (impactTravel.midX + impactTravel.endX) / 2, impactTravel.endX],
              y: [impactTravel.startY, impactTravel.startY * 0.7, impactTravel.midY, (impactTravel.midY + impactTravel.endY) / 2, impactTravel.endY],
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: impactDuration, times: [0, 0.62, 0.72, 0.9, 1], ease: 'easeOut' }}
            className="pointer-events-none absolute right-[26%] top-[56%] z-20"
            style={{
              width: impactTravel.width,
              height: impactTravel.height,
              borderRadius: impactTravel.borderRadius,
              background: `radial-gradient(circle, rgba(255,255,255,0.99), ${effect.coreColor} 28%, ${effect.glowColor} 56%, ${effect.tailColor} 76%, transparent 100%)`,
              transform: effect.family === 'gale' ? 'rotate(-24deg)' : effect.family === 'beam' ? `scaleX(${1.34 + rank * 0.08})` : undefined,
              willChange: 'transform, opacity',
            }}
          >
            {effect.family === 'gale' && (
              <motion.div
                initial={{ opacity: 0, x: 18, scaleX: 0.36 }}
                animate={{ opacity: [0, 0.96, 0], x: [18, -10, -42], scaleX: [0.36, 1.06, 1.2] }}
                transition={{ duration: impactDuration * 0.72, ease: 'easeOut' }}
                className="absolute left-1/2 top-1/2 h-3 w-[240%] -translate-x-1/2 -translate-y-1/2 rounded-full"
                style={{
                  background: `linear-gradient(90deg, transparent 0%, ${effect.tailColor} 24%, rgba(255,255,255,0.98) 52%, ${effect.glowColor} 76%, transparent 100%)`,
                  transform: 'rotate(-26deg)',
                  filter: 'blur(2px)',
                  willChange: 'transform, opacity',
                }}
              />
            )}
            {effect.family === 'beam' && (
              <motion.div
                initial={{ opacity: 0, x: 56, scaleX: 0.14 }}
                animate={{ opacity: [0, 1, 0.42, 0], x: [56, 16, -38, -66], scaleX: [0.14, 1, 1.18, 1.24] }}
                transition={{ duration: impactDuration * 0.78, ease: 'easeOut' }}
                className="absolute left-1/2 top-1/2 h-[0.7rem] w-[320%] -translate-x-1/2 -translate-y-1/2 rounded-full"
                style={{
                  background: `linear-gradient(90deg, transparent 0%, ${effect.tailColor} 12%, rgba(255,255,255,1) 52%, ${effect.glowColor} 82%, transparent 100%)`,
                  boxShadow: `0 0 28px ${effect.glowColor}`,
                  willChange: 'transform, opacity',
                }}
              />
            )}
            {effect.family === 'star' && (
              <>
                <motion.div
                  initial={{ opacity: 0, scaleX: 0.18 }}
                  animate={{ opacity: [0, 0.92, 0], scaleX: [0.18, 1.2 + rank * 0.08, 1.52 + rank * 0.1] }}
                  transition={{ duration: impactDuration * 0.66, ease: 'easeOut' }}
                  className="absolute left-1/2 top-1/2 h-[4px] w-[220%] -translate-x-1/2 -translate-y-1/2 rounded-full"
                  style={{ background: `linear-gradient(90deg, transparent, ${effect.ringColor}, transparent)`, willChange: 'transform, opacity' }}
                />
                <motion.div
                  initial={{ opacity: 0, scaleY: 0.18 }}
                  animate={{ opacity: [0, 0.92, 0], scaleY: [0.18, 1.2 + rank * 0.08, 1.52 + rank * 0.1] }}
                  transition={{ duration: impactDuration * 0.66, ease: 'easeOut' }}
                  className="absolute left-1/2 top-1/2 h-[220%] w-[4px] -translate-x-1/2 -translate-y-1/2 rounded-full"
                  style={{ background: `linear-gradient(180deg, transparent, ${effect.ringColor}, transparent)`, willChange: 'transform, opacity' }}
                />
              </>
            )}
            {effect.family === 'radiant' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.56 }}
                animate={{ opacity: [0, effect.flashOpacity + 0.48 + rank * 0.03, 0.22, 0], scale: [0.56, 1.24 + rank * 0.08, 1.54 + rank * 0.1, 1.82 + rank * 0.12] }}
                transition={{ duration: impactDuration * 0.92, ease: 'easeOut' }}
                className="absolute inset-[-52%] rounded-full"
                style={{
                  background: `radial-gradient(circle, rgba(255,255,255,0.94) 0%, ${effect.haloColor} 34%, rgba(255,255,255,0) 78%)`,
                  filter: 'blur(12px)',
                  willChange: 'transform, opacity',
                }}
              />
            )}
            {effect.family === 'arcane' && (
              <>
                <motion.div
                  initial={{ opacity: 0, scale: 0.34, rotate: 0 }}
                  animate={{ opacity: [0, 0.88, 0], scale: [0.34, 1.02 + rank * 0.08, 1.26 + rank * 0.1], rotate: [0, 44, 88] }}
                  transition={{ duration: impactDuration * 0.8, ease: 'easeOut' }}
                  className="absolute left-1/2 top-1/2 h-[176%] w-[176%] -translate-x-1/2 -translate-y-1/2"
                  style={{ willChange: 'transform, opacity' }}
                >
                  <svg viewBox="0 0 100 100" className="h-full w-full overflow-visible">
                    <polygon
                      points="50,8 14,74 86,74"
                      fill="none"
                      stroke={effect.ringColor}
                      strokeWidth="2.6"
                      strokeLinejoin="round"
                      style={{ filter: `drop-shadow(0 0 10px ${effect.haloColor})` }}
                    />
                    <circle cx="50" cy="50" r="26" fill="none" stroke={effect.haloColor} strokeWidth="1.6" opacity="0.7" />
                  </svg>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, scale: 0.34, rotate: 0 }}
                  animate={{ opacity: [0, 0.82, 0], scale: [0.34, 1 + rank * 0.08, 1.2 + rank * 0.1], rotate: [0, -38, -82] }}
                  transition={{ duration: impactDuration * 0.88, delay: 0.04, ease: 'easeOut' }}
                  className="absolute left-1/2 top-1/2 h-[176%] w-[176%] -translate-x-1/2 -translate-y-1/2"
                  style={{ willChange: 'transform, opacity' }}
                >
                  <svg viewBox="0 0 100 100" className="h-full w-full overflow-visible">
                    <polygon
                      points="50,92 14,26 86,26"
                      fill="none"
                      stroke={effect.coreColor}
                      strokeWidth="2.6"
                      strokeLinejoin="round"
                    />
                    <circle cx="50" cy="50" r="18" fill="none" stroke={effect.ringColor} strokeWidth="1.4" opacity="0.82" />
                  </svg>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, scale: 0.44, rotate: 0 }}
                  animate={{ opacity: [0, 0.6, 0], scale: [0.44, 1.04, 1.18], rotate: [0, 18, 36] }}
                  transition={{ duration: impactDuration, delay: 0.06, ease: 'easeOut' }}
                  className="absolute left-1/2 top-1/2 h-[196%] w-[196%] -translate-x-1/2 -translate-y-1/2 rounded-full border"
                  style={{ borderColor: effect.haloColor, boxShadow: `0 0 22px ${effect.haloColor}`, willChange: 'transform, opacity' }}
                />
              </>
            )}
            <motion.div
              initial={{ opacity: 0, scale: 0.2 }}
              animate={{ opacity: [0, 0, 0.92, 0], scale: [0.2, 0.2, impactRingPeak, impactRingPeak * 1.16] }}
              transition={{ duration: impactDuration, times: [0, 0.64, 0.76, 1], ease: 'easeOut' }}
              className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full border-2"
              style={{
                borderColor: effect.ringColor,
                boxShadow: `0 0 28px ${effect.glowColor}`,
                transform: effect.family === 'beam' ? `scaleX(${1.2 + rank * 0.08})` : undefined,
                willChange: 'transform, opacity',
              }}
            />
            {showSecondRing && (
              <motion.div
                initial={{ opacity: 0, scale: 0.22 }}
                animate={{
                  opacity: [0, 0, effect.secondRingOpacity * (shotTier === 'final' ? 1 : 0.9), 0],
                  scale: [0.22, 0.22, impactRingPeak * 1.12, impactRingPeak * 1.34],
                }}
                transition={{ duration: impactDuration + 0.1, times: [0, 0.64, 0.8, 1], ease: 'easeOut' }}
                className="absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full border-2"
                style={{
                  borderColor: effect.ringColor,
                  boxShadow: `0 0 34px ${effect.haloColor}`,
                  transform: effect.family === 'beam' ? `scaleX(${1.28 + rank * 0.08})` : undefined,
                  willChange: 'transform, opacity',
                }}
              />
            )}
            <motion.div
              initial={{ opacity: 0, scale: 0.14 }}
              animate={{ opacity: [0, 1, 0], scale: [0.14, effect.orbScale, effect.orbScale * 1.28] }}
              transition={{ duration: (chargeDuration + 0.44) * familyTempo, times: [0, 0.62, 1], ease: 'easeOut' }}
              className="absolute left-1/2 top-1/2 h-11 w-11 -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{
                background: `radial-gradient(circle, rgba(255,255,255,1) 0%, ${effect.coreColor} 40%, ${effect.glowColor} 72%, rgba(255,255,255,0) 100%)`,
                boxShadow: `0 0 36px ${effect.glowColor}`,
                willChange: 'transform, opacity',
              }}
            />
            {effect.residueOpacity > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.72 }}
                animate={{ opacity: [0, effect.residueOpacity * 0.72, 0], scale: [0.72, 1.02, 1.24] }}
                transition={{ duration: (chargeDuration + 0.92) * familyTempo, times: [0, 0.42, 1], ease: 'easeOut' }}
                className="absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full"
                style={{
                  background: `radial-gradient(circle, rgba(255,255,255,0.92) 0%, ${effect.coreColor} 28%, ${effect.haloColor} 52%, rgba(255,255,255,0) 100%)`,
                  filter: 'blur(10px)',
                  willChange: 'transform, opacity',
                }}
              />
            )}
            {particleEnabled &&
              [
                { x: -52, y: -22, r: -32, delay: 0.02 },
                { x: -24, y: 38, r: 48, delay: 0.05 },
                { x: 22, y: -46, r: 72, delay: 0.04 },
                { x: 58, y: 18, r: -58, delay: 0.08 },
                { x: 46, y: 42, r: 34, delay: 0.1 },
                { x: -12, y: -60, r: -82, delay: 0.05 },
              ].map((shard, i) => (
                <motion.div
                  key={`impact-shard-${i}`}
                  initial={{ opacity: 0, x: 0, y: 0, rotate: 0, scale: 0.24 }}
                  animate={{
                    opacity: [0, effect.particleOpacity, 0],
                    x: [0, shard.x],
                    y: [0, shard.y],
                    rotate: [0, shard.r],
                    scale: [0.24, effect.shardScale],
                  }}
                  transition={{ duration: (chargeDuration + 0.24) * familyTempo, delay: shard.delay, ease: 'easeOut' }}
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                  style={{ width: effect.family === 'arcane' ? 18 : 20, height: effect.family === 'arcane' ? 18 : 10, willChange: 'transform, opacity' }}
                >
                  {effect.family === 'arcane' ? (
                    <svg viewBox="0 0 100 100" className="h-full w-full overflow-visible">
                      <circle cx="50" cy="50" r="24" fill="none" stroke={effect.ringColor} strokeWidth="10" opacity="0.88" />
                      <circle cx="50" cy="50" r="10" fill={effect.coreColor} opacity="0.5" />
                    </svg>
                  ) : (
                    <div
                      className="h-2.5 w-5 rounded-full"
                      style={{
                        background: `linear-gradient(135deg, rgba(255,255,255,0.98), ${effect.coreColor} 55%, ${effect.tailColor} 100%)`,
                        boxShadow: `0 0 24px ${effect.glowColor}`,
                      }}
                    />
                  )}
                </motion.div>
              ))}
            {particleEnabled &&
              [
                { x: -42, y: -36, delay: 0.03 },
                { x: -18, y: 62, delay: 0.06 },
                { x: 44, y: -28, delay: 0.04 },
                { x: 66, y: 22, delay: 0.08 },
              ].map((dot, i) => (
                <motion.div
                  key={`impact-dot-${i}`}
                  initial={{ opacity: 0, x: 0, y: 0, scale: 0.2 }}
                  animate={{
                    opacity: [0, effect.particleOpacity, 0],
                    x: [0, dot.x],
                    y: [0, dot.y],
                    scale: [0.2, 1.08, 0.2],
                  }}
                  transition={{ duration: (chargeDuration + 0.14) * familyTempo, delay: dot.delay, ease: 'easeOut' }}
                  className="absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full"
                  style={{
                    background: `radial-gradient(circle, rgba(255,255,255,1) 0%, ${effect.coreColor} 55%, rgba(255,255,255,0) 100%)`,
                    boxShadow: `0 0 18px ${effect.glowColor}`,
                    willChange: 'transform, opacity',
                  }}
                />
              ))}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showFinalFlash && (
          <motion.div
            key={`final-burst-${shotSequence}-${effect.name}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, effect.flashOpacity, effect.flashOpacity * 0.3, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.95, ease: 'easeOut' }}
            className="pointer-events-none absolute inset-0 z-10"
            style={{
              background: `radial-gradient(circle_at_72%_54%, rgba(255,255,255,0.85), ${effect.coreColor} 22%, ${effect.haloColor} 45%, transparent 72%)`,
              willChange: 'opacity',
            }}
          />
        )}
      </AnimatePresence>

      <div className="relative z-10 grid h-full grid-cols-[minmax(0,1fr)_clamp(120px,22%,200px)] sm:grid-cols-[minmax(0,1fr)_clamp(168px,28%,246px)] gap-1 px-2 pb-1 pt-1 min-h-0">
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
            <BattleBlockGrid
              clearedBlocks={clearedBlocks}
              lastRemoval={lastRemoval}
              shotTier={shotTier}
              effect={effect}
              gemImage={gemImage}
              totalBlocks={totalBlocks}
              columns={blockColumns}
              rows={blockRows}
              isLevelZero={isLevelZero}
            />
          </div>
        </div>

        <div className="relative min-w-0 min-h-0 flex flex-col justify-end gap-1 sm:gap-2 z-20">
            <div className="flex min-h-0 items-stretch shrink-0">
              <div className="flex h-full w-full items-center justify-end rounded-[1.8rem] px-0 py-1">
                <ComboHud displayCombo={displayCombo} />
              </div>
            </div>

            <div className="flex min-h-0 items-end justify-end rounded-[1.8rem] px-0 sm:pb-1">
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
                className="relative flex h-[clamp(8.5rem,23vw,11.7rem)] w-[clamp(8.5rem,23vw,11.7rem)] items-center justify-center self-end"
                style={{ ...petGlowStyle, willChange: 'transform' }}
              >
                <AnimatePresence>
                  {showImpact && (
                    <motion.div
                      key={`pet-charge-${shotSequence}-${shotTier}`}
                      initial={{ opacity: 0, scale: 0.45 }}
                      animate={{
                        opacity: [0, 0.62, 0.2, 0],
                        scale: [0.45, shotTier === 'final' ? 1.62 : shotTier === 'super' ? 1.34 : shotTier === 'boost' ? 1.2 : 1.08, shotTier === 'final' ? 1.92 : shotTier === 'super' ? 1.52 : shotTier === 'boost' ? 1.28 : 1.12, 1.04],
                      }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: petChargeDuration, ease: 'easeOut', times: [0, 0.28, 0.72, 1] }}
                      className="pointer-events-none absolute inset-0 rounded-[2.6rem]"
                      style={{
                        background: `radial-gradient(circle, rgba(255,255,255,0.92), ${effect.haloColor} 44%, rgba(255,255,255,0) 78%)`,
                        willChange: 'transform, opacity',
                      }}
                    />
                  )}
                </AnimatePresence>
                <AnimatePresence>
                  {showImpact && (effect.petAuraOpacity > 0.01 || effect.petRimOpacity > 0.01 || effect.petGroundOpacity > 0.01) && (
                    <>
                      {effect.petGroundOpacity > 0.01 && (
                        <motion.div
                          key={`pet-ground-${shotSequence}-${effect.name}`}
                          initial={{ opacity: 0, scale: 0.7 }}
                          animate={{ opacity: [0, effect.petGroundOpacity, 0], scale: [0.7, 1.08, 1.22] }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: (chargeDuration + 0.42) * familyTempo, ease: 'easeOut' }}
                          className="pointer-events-none absolute -bottom-1 h-12 w-[78%] rounded-full"
                          style={{
                            background: `radial-gradient(circle, rgba(255,255,255,0.9), ${effect.haloColor} 42%, rgba(255,255,255,0) 100%)`,
                            filter: 'blur(8px)',
                            willChange: 'transform, opacity',
                          }}
                        />
                      )}
                      {effect.petAuraOpacity > 0.01 && (
                        <motion.div
                          key={`pet-aura-${shotSequence}-${effect.name}`}
                          initial={{ opacity: 0, scale: 0.64 }}
                          animate={{ opacity: [0, effect.petAuraOpacity, 0], scale: [0.64, 1.08, 1.26] }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: (chargeDuration + 0.5) * familyTempo, ease: 'easeOut' }}
                          className="pointer-events-none absolute inset-0 rounded-[50%]"
                          style={{
                            background: `radial-gradient(circle, rgba(255,255,255,0.7) 0%, ${effect.haloColor} 34%, rgba(255,255,255,0) 78%)`,
                            filter: 'blur(20px)',
                            willChange: 'transform, opacity',
                          }}
                        />
                      )}
                      {effect.petRimOpacity > 0.01 && (
                        <motion.div
                          key={`pet-rim-${shotSequence}-${effect.name}`}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: [0, effect.petRimOpacity, 0], scale: [0.8, 1.04, 1.14] }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: (chargeDuration + 0.46) * familyTempo, ease: 'easeOut' }}
                          className="pointer-events-none absolute inset-[6%] rounded-[50%]"
                          style={{
                            background: `radial-gradient(circle, rgba(255,255,255,0) 44%, rgba(255,252,235,0.92) 62%, ${effect.haloColor} 76%, rgba(255,255,255,0) 92%)`,
                            filter: 'blur(10px)',
                            willChange: 'transform, opacity',
                          }}
                        />
                      )}
                    </>
                  )}
                </AnimatePresence>
                <AnimatePresence>
                  {isBreakHit && (
                    <motion.div
                      key={`pet-break-${shotSequence}`}
                      initial={{ opacity: 0, scale: 0.84 }}
                      animate={{ opacity: [0, 1, 0.72, 0], scale: [0.84, 1.04, breakFeedback.redFlashScale, breakFeedback.redFlashScale + 0.08] }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.5, ease: 'easeOut', times: [0, 0.18, 0.52, 1] }}
                      className="pointer-events-none absolute rounded-[3rem] border-2 border-red-300/80 bg-[radial-gradient(circle,rgba(254,202,202,0.76),rgba(248,113,113,0.42)_40%,rgba(220,38,38,0.16)_68%,transparent_100%)] shadow-[0_0_52px_rgba(248,113,113,0.8)]"
                      style={{ inset: -breakFeedback.overlayInset, willChange: 'transform, opacity' }}
                    />
                  )}
                </AnimatePresence>
                <img
                  src={selectedPet?.image ?? gemImage ?? ''}
                  alt={selectedPet?.name ?? '火尾狐'}
                  draggable={false}
                  className="relative z-10 h-full w-full object-contain select-none"
                  style={{ filter: 'drop-shadow(0 10px 18px rgba(255,255,255,0.18))' }}
                />
              </motion.div>
            </div>
        </div>
      </div>
      </motion.div>
    </div>
  );
}, (prevProps, nextProps) =>
  prevProps.selectedPet === nextProps.selectedPet &&
  prevProps.combo === nextProps.combo &&
  prevProps.displayCombo === nextProps.displayCombo &&
  prevProps.shotTier === nextProps.shotTier &&
  prevProps.effect === nextProps.effect &&
  prevProps.gemImage === nextProps.gemImage &&
  prevProps.clearedBlocks === nextProps.clearedBlocks &&
  prevProps.lastRemoval === nextProps.lastRemoval &&
  prevProps.shotSequence === nextProps.shotSequence &&
  prevProps.impactSequence === nextProps.impactSequence &&
  prevProps.totalBlocks === nextProps.totalBlocks &&
  prevProps.blockColumns === nextProps.blockColumns &&
  prevProps.blockRows === nextProps.blockRows &&
  prevProps.isLevelZero === nextProps.isLevelZero,
);

export default function QuizScreen({
  gradeId = '1',
  levelId,
  selectedPet,
  attackEffect,
  gemImage,
  backgroundImage,
  onFinish,
  onBack,
  showDebugTools = false,
}: {
  gradeId?: string;
  levelId: number;
  selectedPet: any;
  attackEffect: AttackEffectProfile;
  gemImage?: string;
  backgroundImage?: string;
  onFinish: (stats: LevelFinishStats) => void;
  onBack: () => void;
  showDebugTools?: boolean;
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
  const [shotSequence, setShotSequence] = useState(0);
  const [impactSequence, setImpactSequence] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState<WrongAnswerDetail[]>([]);
  const battleGemImage = gemImage;
  const battleBackgroundImage = backgroundImage;
  const isTutorialLevelZero = useMemo(() => isLevelZeroTutorial(gradeId, levelId), [gradeId, levelId]);
  const battleBlockConfig = useMemo(
    () =>
      isTutorialLevelZero
        ? LEVEL_ZERO_BATTLE_CONFIG
        : {
            totalBlocks: DEFAULT_BATTLE_BLOCKS,
            columns: DEFAULT_BATTLE_BLOCK_COLUMNS,
            rows: DEFAULT_BATTLE_BLOCK_ROWS,
          },
    [isTutorialLevelZero],
  );

  // 从新的数据源获取关卡数据
  const gradeLevels = useMemo(() => allLevelsData[gradeId as keyof typeof allLevelsData], [gradeId]);
  const levelInfo = useMemo(() => gradeLevels?.[levelId], [gradeLevels, levelId]);
  const questions = useMemo(() => levelInfo?.questions || [], [levelInfo]);
  const question = questions[currentIndex];

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
    setShotSequence(0);
    setImpactSequence(0);
    setWrongAnswers([]);
  }, [gradeId, levelId]);

  useEffect(() => {
    warmupBattleBgm();
    void startBattleBgm();

    const resumeBattleBgm = () => {
      void primeBattleSfx();
    };

    window.addEventListener('pointerdown', resumeBattleBgm, { passive: true });
    window.addEventListener('keydown', resumeBattleBgm);

    return () => {
      window.removeEventListener('pointerdown', resumeBattleBgm);
      window.removeEventListener('keydown', resumeBattleBgm);
      stopBattleBgm();
    };
  }, []);

  useEffect(() => {
    warmupBattleAssets(selectedPet?.image, gemImage, backgroundImage);
  }, [backgroundImage, gemImage, selectedPet?.image]);

  useEffect(() => {
    if (question && question.answerLength) {
      // 对于竖式计算类型，使用多个输入框
      const isVertical = question.type === 'vertical_addition' || question.type === 'multi_vertical';
      const newAnswers = isVertical
        ? Array(question.answerLength).fill('')
        : [''];
      setAnswers(newAnswers);
      setFeedback(null);
      setSelectedChoice(null);
      setMultiVerticalStep(1); // 重置多重竖式步骤
    }
  }, [currentIndex]);

  /**
   * 生成题干文本描述
   */
  const getQuestionText = (q: Question): string => {
    switch (q.type) {
      case 'vertical_addition':
        return `${q.num1} ${q.operator} ${q.num2} = ?`;
      case 'multi_vertical':
        return `${q.num1} + ${q.num2} + ${q.num3} = ?`;
      case 'number_comparison':
        return `${q.num1} ? ${q.num2}`;
      case 'text_to_number':
        return `${q.text} ${q.label}`;
      case 'counting':
        return `数一数有几个 ${q.emoji}`;
      case 'input':
        return q.question || '';
      case 'choice':
        return q.question || q.text || '';
      default:
        return q.text || q.question || '';
    }
  };

  /**
   * 记录错题
   */
  const recordWrongAnswer = (q: Question, userAnswer: string) => {
    setWrongAnswers((prev: WrongAnswerDetail[]) => [...prev, {
      questionId: q.id,
      questionText: getQuestionText(q),
      correctAnswer: q.answer,
      userAnswer,
    }]);
  };

  const finishLevel = (newCorrectCount: number, newCombo: number) => {
    const timeTaken = Math.floor((Date.now() - startTime) / 1000);
    onFinish({
      accuracy: Math.round((newCorrectCount / questions.length) * 100),
      time: timeTaken,
      maxCombo: Math.max(maxCombo, newCombo),
      expGained: Math.max(1, Math.ceil(newCorrectCount / 4)),
      totalQuestions: questions.length,
      correctCount: newCorrectCount,
      wrongAnswers,
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
    const remainingBlocks = Math.max(0, battleBlockConfig.totalBlocks - clearedBlocks);
    const tutorialPlan = isTutorialLevelZero ? getLevelZeroShotPlan(currentIndex, remainingBlocks) : null;
    const tier = tutorialPlan?.tier ?? getShotTier(newCombo);
    const removal = tutorialPlan?.removal ?? getRemovalCount(newCombo, remainingBlocks);
    const newCorrectCount = correctCount + 1;
    const { shotDelay, advanceDelay } = getShotTiming(tier, newCombo);
    const soundTier = tier === 'final' || tier === 'super' || tier === 'boost' || tier === 'normal' ? tier : 'normal';

    setFeedback('correct');
    setCombo(newCombo);
    setMaxCombo((m: number) => Math.max(m, newCombo));
    setCorrectCount(newCorrectCount);
    setShotTier(tier);
    setLastRemoval(0);
    setShotSequence((prev) => prev + 1);

    void playCloudPuffCharge(soundTier, shotDelay);
    setTimeout(() => {
      void playCloudPuffBurst(soundTier);
      setDisplayCombo(newCombo);
      setLastRemoval(removal);
      setClearedBlocks((prev) => Math.min(battleBlockConfig.totalBlocks, prev + removal));
      setImpactSequence((prev) => prev + 1);
    }, shotDelay);

    scheduleAdvance(newCorrectCount, newCombo, advanceDelay);
  };

  const registerWrongAnswer = (resetAnswers: () => void, userAnswer: string) => {
    const breakSoundTier = combo >= 10 ? 'final' : combo >= 6 ? 'super' : combo >= 3 ? 'boost' : 'normal';
    setFeedback('wrong');
    setCombo(0);
    setDisplayCombo(0);
    setShotTier('break');
    setLastRemoval(0);
    void playCloudPuffBreak(breakSoundTier);

    // 记录错题
    recordWrongAnswer(question, userAnswer);

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

    void primeBattleSfx();
    setSelectedChoice(option);

    if (option === question.answer) {
      const newCombo = combo + 1;
      registerCorrectAnswer(newCombo);
    } else {
      registerWrongAnswer(() => {}, option);
    }
  };

  const handleKeyPress = (key: string) => {
    if (feedback === 'correct' || feedback === 'wrong') return;

    void primeBattleSfx();
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
          }, step1Answer);
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
          }, step2Answer);
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
      }, userAnswerStr);
    }
  };

  const handleDebugSolveCurrent = () => {
    if (!question || feedback === 'correct' || feedback === 'wrong') return;
    void primeBattleSfx();
    setSelectedChoice(question.answer);
    registerCorrectAnswer(combo + 1);
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

  const activeIndex = useMemo(() => getActiveIndex(), [answers, feedback, multiVerticalStep, question]);
  const tutorialHintDigit =
    isTutorialLevelZero &&
    currentIndex <= 2 &&
    feedback === null &&
    question?.type === 'input' &&
    (answers[0]?.length ?? 0) < question.answer.length
      ? question.answer[(answers[0]?.length ?? 0)] ?? null
      : null;
  const tutorialHintLabel = currentIndex === 0 ? '填入正确答案' : '让小火苗苏醒';
  const renderTutorialKeypadButton = (num: number) => {
    const isHintTarget = tutorialHintDigit === num.toString();

    return (
      <div key={num} className="relative">
        {isHintTarget ? (
          <>
            <motion.div
              initial={{ opacity: 0.55, scale: 0.82 }}
              animate={{ opacity: [0.45, 0.95, 0.45], scale: [0.82, 1.36, 1.68] }}
              transition={{ duration: 1.25, repeat: Infinity, ease: 'easeOut' }}
              className="pointer-events-none absolute inset-[-10px] z-10 rounded-[1.9rem] border-[5px] border-[#ff8a1f]/70"
              style={{ boxShadow: '0 0 34px rgba(255,138,31,0.48)' }}
            />
            <motion.div
              initial={{ opacity: 0.3, scale: 0.94 }}
              animate={{ opacity: [0.25, 0.68, 0.25], scale: [0.94, 1.14, 0.94] }}
              transition={{ duration: 0.72, repeat: Infinity, ease: 'easeInOut' }}
              className="pointer-events-none absolute inset-[-8px] z-10 rounded-[1.85rem] bg-[radial-gradient(circle,rgba(255,240,194,0.92)_0%,rgba(255,171,61,0.5)_45%,rgba(255,138,31,0)_72%)]"
            />
            <motion.div
              initial={{ opacity: 0.94, y: 0 }}
              animate={{ opacity: [0.88, 1, 0.88], y: [-6, 4, -6] }}
              transition={{ duration: 0.9, repeat: Infinity, ease: 'easeInOut' }}
              className="pointer-events-none absolute bottom-[calc(100%+10px)] left-1/2 z-20 flex -translate-x-1/2 flex-col items-center"
            >
              <motion.div
                animate={{ scale: [0.98, 1.04, 0.98] }}
                transition={{ duration: 0.95, repeat: Infinity, ease: 'easeInOut' }}
                className="min-w-[196px] whitespace-nowrap rounded-full border-[3px] border-[#fff2cb] bg-[linear-gradient(135deg,#ff9c23_0%,#ff6b2c_100%)] px-4 py-2 text-center text-lg font-black text-white shadow-[0_12px_24px_rgba(255,107,44,0.34)]"
              >
                {tutorialHintLabel}
              </motion.div>
              <motion.div
                animate={{ height: [18, 30, 18], opacity: [0.45, 0.9, 0.45] }}
                transition={{ duration: 0.95, repeat: Infinity, ease: 'easeInOut' }}
                className="mt-2 w-[6px] rounded-full bg-[linear-gradient(180deg,rgba(255,242,203,0.98)_0%,rgba(255,138,31,0.92)_100%)] shadow-[0_0_14px_rgba(255,164,56,0.48)]"
              />
              <motion.div
                animate={{ y: [-3, 3, -3], scale: [0.96, 1.08, 0.96] }}
                transition={{ duration: 0.95, repeat: Infinity, ease: 'easeInOut' }}
                className="mt-[-2px] text-[44px] leading-none text-[#ff7a1a]"
                style={{
                  textShadow: `
                    0 8px 16px rgba(255,122,26,0.34),
                    0 0 18px rgba(255,183,77,0.52),
                    0 0 6px rgba(255,255,255,0.72)
                  `,
                }}
              >
                ↓
              </motion.div>
            </motion.div>
          </>
        ) : null}
        <motion.button
          whileHover={feedback === null ? { scale: 1.02, y: -1 } : {}}
          whileTap={feedback === null ? { scale: 0.98, y: 1 } : {}}
          onClick={() => handleKeyPress(num.toString())}
          className={`relative overflow-visible rounded-2xl h-16 sm:h-14 w-full text-2xl sm:text-3xl font-bold transition-all ${
            isHintTarget
              ? 'bg-[linear-gradient(180deg,#fff7d8_0%,#ffd978_100%)] text-[#7a3a00] shadow-[0_0_0_4px_rgba(255,241,199,0.95),0_0_0_10px_rgba(255,155,39,0.42),0_8px_0_#f08a1c,0_22px_36px_rgba(255,131,28,0.34)]'
              : 'bg-white text-gray-700 shadow-[0_5px_0_#e5e7eb]'
          } active:shadow-none active:translate-y-1`}
        >
          {isHintTarget ? (
            <motion.div
              animate={{ opacity: [0.2, 0.52, 0.2], scale: [0.9, 1.06, 0.9] }}
              transition={{ duration: 0.75, repeat: Infinity, ease: 'easeInOut' }}
              className="pointer-events-none absolute inset-[2px] rounded-[0.95rem] bg-[radial-gradient(circle,rgba(255,255,255,0.9)_0%,rgba(255,236,177,0.72)_42%,rgba(255,189,77,0)_78%)]"
            />
          ) : null}
          <span className="relative z-10">{num}</span>
        </motion.button>
      </div>
    );
  };

  const renderNumberComparison = () => {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full">
        <div className="text-2xl font-bold text-gray-500 mb-4 tracking-wider">比大小</div>
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

  // 解析填空题：检测 ( ) 或 (  ) 并解析为部件
  const parseFillBlankQuestion = (questionText: string): { type: 'text' | 'blank'; value: string }[] => {
    const parts: { type: 'text' | 'blank'; value: string }[] = [];
    // 匹配 ( ) 或 (  ) 格式的填空
    const blankPattern = /\( {0,2}\)/g;
    let lastIndex = 0;
    let match;

    while ((match = blankPattern.exec(questionText)) !== null) {
      // 添加填空前的文本
      if (match.index > lastIndex) {
        parts.push({ type: 'text', value: questionText.slice(lastIndex, match.index) });
      }
      // 添加填空位置
      parts.push({ type: 'blank', value: '' });
      lastIndex = match.index + match[0].length;
    }
    // 添加剩余文本（去除末尾多余的空格和等号）
    if (lastIndex < questionText.length) {
      let remaining = questionText.slice(lastIndex);
      // 去除末尾的 " =" 或 " = " 等格式
      remaining = remaining.replace(/\s*=\s*$/, '');
      if (remaining) {
        parts.push({ type: 'text', value: remaining });
      }
    }
    return parts;
  };

  // 判断是否为填空题
  const isFillBlankQuestion = (questionText: string): boolean => {
    return /\( {0,2}\)/.test(questionText);
  };

  // 输入题渲染（算式 + 答案框）- 遵循 QUIZ_TYPE_DEMO 样式
  const renderInput = () => {
    const questionText = question.question || '';
    const hasFillBlank = isFillBlankQuestion(questionText);

    // 填空题：解析并渲染（响应式字体）
    if (hasFillBlank) {
      const parts = parseFillBlankQuestion(questionText);
      const hasValue = answers[0] && answers[0].length > 0;

      // 决定答案框状态
      let boxState = 'active'; // 默认黄色
      if (feedback === 'correct') boxState = 'correct';
      else if (feedback === 'wrong') boxState = 'wrong';
      else if (hasValue) boxState = 'filled';

      const boxClass = {
        active: 'bg-[#fffbeb] border-[#fbbf24] text-[#f59e0b] shadow-[0_4px_0_#f59e0b,0_0_15px_rgba(251,191,36,0.4)]',
        filled: 'bg-[#eff6ff] border-[#3b82f6] text-[#1d4ed8] shadow-[0_4px_0_#1d4ed8]',
        correct: 'bg-[#dcfce7] border-[#22c55e] text-[#16a34a] shadow-[0_4px_0_#16a34a]',
        wrong: 'bg-[#fee2e2] border-[#ef4444] text-[#dc2626] shadow-[0_4px_0_#dc2626]',
      }[boxState];

      return (
        <div className="flex items-center justify-center flex-wrap gap-1 sm:gap-2" style={{ lineHeight: '48px' }}>
          {parts.map((part, index) => {
            if (part.type === 'blank') {
              return (
                <motion.div
                  key={index}
                  animate={
                    feedback === 'wrong'
                      ? { x: [-5, 5, -5, 5, 0] }
                      : hasValue
                        ? {}
                        : { scale: [1, 1.02, 1] }
                  }
                  transition={
                    feedback === 'wrong'
                      ? { duration: 0.4 }
                      : hasValue
                        ? {}
                        : { repeat: Infinity, duration: 1.5, ease: "easeInOut" }
                  }
                  className={`min-w-[56px] sm:min-w-[72px] h-10 sm:h-14 px-2 sm:px-4 rounded-lg sm:rounded-xl border-[2px] sm:border-[3px] flex items-center justify-center text-xl sm:text-3xl font-black shrink-0 transition-colors ${boxClass}`}
                >
                  {answers[0] || '?'}
                </motion.div>
              );
            } else {
              return (
                <span key={index} className="text-xl sm:text-2xl md:text-4xl font-black text-gray-800 mx-0.5 sm:mx-1 shrink-0">
                  {part.value}
                </span>
              );
            }
          })}
        </div>
      );
    }

    // 普通输入题：算式 + 答案框（响应式字体）
    const hasValue = answers[0] && answers[0].length > 0;

    // 决定答案框状态
    let boxState = 'active'; // 默认黄色
    if (feedback === 'correct') boxState = 'correct';
    else if (feedback === 'wrong') boxState = 'wrong';
    else if (hasValue) boxState = 'filled';

    const boxClass = {
      active: 'bg-[#fffbeb] border-[#fbbf24] text-[#f59e0b] shadow-[0_4px_0_#f59e0b,0_0_15px_rgba(251,191,36,0.4)]',
      filled: 'bg-[#eff6ff] border-[#3b82f6] text-[#1d4ed8] shadow-[0_4px_0_#1d4ed8]',
      correct: 'bg-[#dcfce7] border-[#22c55e] text-[#16a34a] shadow-[0_4px_0_#16a34a]',
      wrong: 'bg-[#fee2e2] border-[#ef4444] text-[#dc2626] shadow-[0_4px_0_#dc2626]',
    }[boxState];

    return (
      <div className="flex items-center justify-center gap-2 sm:gap-4 flex-wrap">
        <span className="text-2xl sm:text-3xl md:text-5xl font-black text-gray-800 shrink-0">{questionText}</span>
        <motion.div
          animate={
            feedback === 'wrong'
              ? { x: [-5, 5, -5, 5, 0] }
              : hasValue
                ? {}
                : { scale: [1, 1.02, 1] }
          }
          transition={
            feedback === 'wrong'
              ? { duration: 0.4 }
              : hasValue
                ? {}
                : { repeat: Infinity, duration: 1.5, ease: "easeInOut" }
          }
          className={`min-w-[64px] sm:min-w-[96px] px-3 sm:px-6 h-12 sm:h-16 rounded-xl sm:rounded-2xl border-[3px] sm:border-[4px] flex items-center justify-center text-2xl sm:text-4xl font-black shrink-0 transition-colors ${boxClass}`}
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

  // 选择题渲染 - 遵循 QUIZ_TYPE_DEMO 样式（响应式字体）
  const renderChoice = () => {
    const hasChoice = selectedChoice !== null;

    // 决定答案框状态（与输入数字题一致）
    let boxState = 'active'; // 默认黄色
    if (feedback === 'correct') boxState = 'correct';
    else if (feedback === 'wrong') boxState = 'wrong';
    else if (hasChoice) boxState = 'filled';

    const boxClass = {
      active: 'bg-[#fffbeb] border-[#fbbf24] text-[#f59e0b] shadow-[0_4px_0_#f59e0b,0_0_15px_rgba(251,191,36,0.4)]',
      filled: 'bg-[#eff6ff] border-[#3b82f6] text-[#1d4ed8] shadow-[0_4px_0_#1d4ed8]',
      correct: 'bg-[#dcfce7] border-[#22c55e] text-[#16a34a] shadow-[0_4px_0_#16a34a]',
      wrong: 'bg-[#fee2e2] border-[#ef4444] text-[#dc2626] shadow-[0_4px_0_#dc2626]',
    }[boxState];

    // 清理题目文本：去掉 ? 和 (  ) 等填空标记
    const cleanQuestion = (question.question || '')
      .replace('?', '')
      .replace(/\( {0,2}\)/g, '');

    return (
      <div className="text-center w-full flex flex-col items-center justify-center h-full">
        <div className="flex items-center justify-center gap-2 sm:gap-4 flex-wrap">
          <span className="text-xl sm:text-2xl md:text-4xl font-black text-gray-800 shrink-0">{cleanQuestion}</span>
          <motion.div
            animate={
              feedback === 'wrong'
                ? { x: [-5, 5, -5, 5, 0] }
                : hasChoice
                  ? {}
                  : { scale: [1, 1.02, 1] }
            }
            transition={
              feedback === 'wrong'
                ? { duration: 0.4 }
                : hasChoice
                  ? {}
                  : { repeat: Infinity, duration: 1.5, ease: "easeInOut" }
            }
            className={`min-w-[64px] sm:min-w-[96px] px-3 sm:px-6 h-12 sm:h-16 rounded-xl sm:rounded-2xl border-[3px] sm:border-[4px] flex items-center justify-center text-2xl sm:text-4xl font-black shrink-0 transition-colors ${boxClass}`}
          >
            {selectedChoice || '?'}
          </motion.div>
        </div>
      </div>
    );
  };

  const renderChoiceButtons = () => {
    const options = question.options || [];
    // 选项按钮始终保持默认样式，不因选择或反馈而变色
    const btnClass = 'bg-white border-[#e5e7eb] text-gray-700 shadow-[0_5px_0_#9ca3af]';

    return (
      <div className="mx-auto h-[200px] w-full max-w-3xl">
        <div className="grid h-full w-full grid-cols-2 grid-rows-2 gap-4">
          {options.slice(0, 4).map((option, i) => (
            <motion.button
              key={i}
              whileHover={feedback === null ? { scale: 1.02, y: -2 } : {}}
              whileTap={feedback === null ? { y: 5, scale: 0.98 } : {}}
              onClick={() => handleChoiceSelect(option)}
              disabled={feedback !== null}
              className={`h-full w-full rounded-2xl border-4 px-4 text-center text-2xl font-black transition-colors ${btnClass}`}
            >
              {option}
            </motion.button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div
      className="relative flex h-full w-full flex-col overflow-visible bg-[#93cdf4]"
      style={{
        backgroundImage: `url(${battleBackgroundImage})`,
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 sm:p-4 text-[#25344d] shrink-0">
        {isTutorialLevelZero ? (
          <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center overflow-hidden rounded-full border-2 border-white/90 bg-[linear-gradient(180deg,#fff7ea_0%,#ffe4ba_100%)] shadow-[0_8px_0_rgba(255,167,62,0.24),0_12px_24px_rgba(121,59,18,0.12)]">
            <img
              src="/images/我的头像.png"
              alt="我的头像"
              draggable={false}
              className="h-full w-full object-cover"
            />
          </div>
        ) : (
          <button onClick={onBack} className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full border-2 border-[#d97d2f] bg-gradient-to-b from-[#ffe487] to-[#ffbf52] text-[#7b3b12] shadow-[0_8px_0_rgba(191,114,37,0.26),0_12px_24px_rgba(121,59,18,0.14)] active:translate-y-[2px] active:shadow-[0_5px_0_rgba(191,114,37,0.24),0_8px_16px_rgba(121,59,18,0.12)]">
            <ChevronLeft size={28} />
          </button>
        )}
        <div className="flex-1 mx-4 sm:mx-6">
          <div className="relative h-3 sm:h-4 overflow-hidden rounded-full border-2 border-[#6ca7d8] bg-[#d8f0ff] shadow-[0_6px_14px_rgba(71,131,188,0.18),inset_0_2px_5px_rgba(255,255,255,0.65)]">
            <motion.div
              className="absolute left-0 top-0 h-full bg-gradient-to-r from-[#4f85db] via-[#4e79c8] to-[#6a67d8]"
              initial={{ width: `${(currentIndex / questions.length) * 100}%` }}
              animate={{ width: `${((currentIndex) / questions.length) * 100}%` }}
            />
          </div>
        </div>
        {showDebugTools ? (
          <button
            onClick={handleDebugSolveCurrent}
            className="rounded-full border-2 border-[#6ca7d8] bg-gradient-to-b from-[#f8fdff] to-[#dff2ff] px-3 sm:px-4 py-1.5 sm:py-2 text-base sm:text-lg font-black text-[#24436a] shadow-[0_8px_0_rgba(108,167,216,0.28),0_12px_22px_rgba(71,131,188,0.12)] active:translate-y-[2px] active:shadow-[0_5px_0_rgba(108,167,216,0.24),0_8px_16px_rgba(71,131,188,0.12)]"
            title="调试：点击直接答对当前题"
          >
            {currentIndex + 1}/{questions.length}
          </button>
        ) : (
          <div className="rounded-full border-2 border-[#6ca7d8] bg-gradient-to-b from-[#f8fdff] to-[#dff2ff] px-3 sm:px-4 py-1.5 sm:py-2 text-base sm:text-lg font-black text-[#24436a] shadow-[0_8px_0_rgba(108,167,216,0.28),0_12px_22px_rgba(71,131,188,0.12)]">
            {currentIndex + 1}/{questions.length}
          </div>
        )}
      </div>

      {/* Main Area */}
      <div className="flex-1 min-h-0 flex flex-col px-4 pb-0 pt-1 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="shrink-0 h-[38%] sm:h-auto sm:flex-1 min-h-0 mb-0"
        >
          <BattleStage
            selectedPet={selectedPet}
            combo={combo}
            displayCombo={displayCombo}
            shotTier={shotTier}
            effect={attackEffect}
            gemImage={battleGemImage}
            clearedBlocks={clearedBlocks}
            lastRemoval={lastRemoval}
            shotSequence={shotSequence}
            impactSequence={impactSequence}
            totalBlocks={battleBlockConfig.totalBlocks}
            blockColumns={battleBlockConfig.columns}
            blockRows={battleBlockConfig.rows}
            isLevelZero={isTutorialLevelZero}
          />

        </motion.div>

        <div className="flex-1 min-h-0 bg-white/20 backdrop-blur-md rounded-t-[2rem] px-4 pt-4 pb-4 flex flex-col">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full max-w-3xl mx-auto bg-white/95 rounded-[1.5rem] sm:rounded-[2rem] px-4 sm:px-6 py-4 sm:py-5 shadow-2xl flex-1 min-h-0 flex flex-col items-center justify-center relative border-4 border-white/50 mb-4"
          >
            {question.type === 'text_to_number' ? (
              <div className="text-center w-full">
                <div className="text-lg sm:text-xl md:text-2xl font-bold text-gray-500 mb-4 sm:mb-6 tracking-wider break-all px-2">{question.text}</div>
                <div className="flex items-center justify-center gap-2 sm:gap-4">
                  <span className="text-base sm:text-lg md:text-xl font-bold text-gray-600 shrink-0">{question.label}</span>
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
                    className={`min-w-[64px] sm:min-w-[80px] px-3 sm:px-4 h-12 sm:h-16 rounded-lg sm:rounded-xl flex items-center justify-center text-xl sm:text-2xl md:text-3xl font-bold shrink-0 transition-colors
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
            <div className="grid grid-cols-3 gap-3 sm:gap-4 px-2 py-1 max-w-md mx-auto shrink-0 mt-auto">
              {['>', '=', '<'].map((sym) => (
                <button
                  key={sym}
                  onClick={() => handleKeyPress(sym)}
                  className="bg-white rounded-[1.5rem] h-[72px] sm:h-20 flex items-center justify-center text-blue-500 shadow-[0_8px_0_#e5e7eb] active:shadow-none active:translate-y-2 transition-all"
                >
                  <span className="text-6xl font-bold">{sym}</span>
                </button>
              ))}
            </div>
          ) : question.type === 'choice' ? (
            <div className="max-w-3xl mx-auto shrink-0 mt-auto">
              {renderChoiceButtons()}
            </div>
          ) : (
            <div className="w-full max-w-3xl mx-auto flex flex-col gap-3 sm:gap-4 items-center shrink-0 mt-auto">
              <div className="grid w-full grid-cols-5 gap-3 sm:gap-4">
                {[1, 2, 3, 4, 5].map((num) => renderTutorialKeypadButton(num))}
              </div>
              <div className="grid w-full grid-cols-5 gap-3 sm:gap-4">
                {[6, 7, 8, 9, 0].map((num) => renderTutorialKeypadButton(num))}
              </div>
              <button
                onClick={() => handleKeyPress('delete')}
                className="bg-white rounded-2xl h-16 sm:h-14 w-full flex items-center justify-center text-red-400 shadow-[0_5px_0_#e5e7eb] active:shadow-none active:translate-y-1 transition-all"
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
