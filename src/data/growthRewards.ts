import stage1Image from '../../UI v2.0/状态1.png';
import stage2Image from '../../UI v2.0/状态2.png';
import stage3Image from '../../UI v2.0/状态3.png';
import stage4Image from '../../UI v2.0/状态4.png';
import stage5Image from '../../UI v2.0/状态5.png';
import stage6Image from '../../UI v2.0/状态6.png';
import stage7Image from '../../UI v2.0/状态7.png';
import stage8Image from '../../UI v2.0/状态8.png';
import stage9Image from '../../UI v2.0/状态9.png';
import blueGemImage from '../../UI v2.0/蓝晶.png';
import cyanGemImage from '../../UI v2.0/青晶.png';
import purpleGemImage from '../../UI v2.0/紫晶.png';
import redGemImage from '../../UI v2.0/赤晶.png';
import goldGemImage from '../../UI v2.0/金晶.png';
import rainbowGemImage from '../../UI v2.0/虹晶.png';
import starGemImage from '../../UI v2.0/星晶.png';
import forestThemeImage from '../../UI v2.0/幽叶之森.png';
import lakeThemeImage from '../../UI v2.0/灵辉湖.png';
import foothillThemeImage from '../../UI v2.0/群岩山麓.png';
import summitThemeImage from '../../UI v2.0/苍穹峰.png';
import altarThemeImage from '../../UI v2.0/远古祭坛.png';
import defaultBattleBackground from '../../UI v2.0/关卡内背景v2.jpg';
import { isRewardLevelUnlockedAtExp } from '../progression';
import { buildLevelZeroRewardCardModelData } from './levelZeroReward';

export type RewardType = 'evolution' | 'sfx' | 'gem' | 'bg' | 'hidden' | 'none';
export type RewardFocus = 'new_reward' | 'next_reward' | 'next_evolution' | 'finale' | 'hidden_finale';

export interface GrowthStage {
  id: number;
  name: string;
  description: string;
  unlockLevel: number;
  threshold: number;
  image?: string;
  emoji?: string;
  cardGradient: string;
  chipLabel: string;
  hidden?: boolean;
}

export interface LevelRewardConfig {
  level: number;
  gemName: string;
  exp: number;
  cumulativeExp: number;
  progressLabel: string;
  toEvolution: number;
  reward: string;
  rewardType: RewardType;
  nextRewardHint: string;
  focus: RewardFocus;
}

export interface RewardCardModel {
  level: number;
  focus: RewardFocus;
  title: string;
  description: string;
  newReward: string;
  newRewardLabel: string;
  newRewardKind: RewardType;
  expGained: number;
  progressLabel: string;
  progressCurrent: number;
  progressTarget: number;
  toEvolution: number;
  progressBeforeRatio: number;
  progressAfterRatio: number;
  nextStage: GrowthStage | null;
  mysteryHint: string;
  mysteryHintLabel: string;
  teaserText: string;
  rewardHeroImage?: string;
  evolutionCinematic?: {
    fromName: string;
    toName: string;
    fromImage?: string;
    toImage?: string;
  };
}

export interface AttackEffectProfile {
  name: string;
  coreColor: string;
  glowColor: string;
  tailColor: string;
  ringColor: string;
  haloColor: string;
  particleOpacity: number;
  secondRingOpacity: number;
  residueOpacity: number;
  flashOpacity: number;
  petRimOpacity: number;
  petAuraOpacity: number;
  petGroundOpacity: number;
  baseImpactScale: number;
  orbScale: number;
  shardScale: number;
}

function svgDataUrl(svg: string): string {
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

// 核心常量
const HIDDEN_FINAL_LEVEL = 159;
const HIDDEN_FINAL_EXP = 1500;

// 形态进化经验阈值（与关卡累积经验匹配）
const STAGE_THRESHOLDS = {
  橙尾幼灵: 0,
  跃焰灵狐: 50,
  炎步行者: 120,
  火纹守望者: 220,
  焰语旅者: 350,
  裂焰斗者: 510,
  炽界主灵: 700,
  寂焰王座: 1500,
};

// 能力顺序：晨火 -> 风火 -> 流光 -> 星焰 -> 曦辉 -> 智慧之力
const ABILITY_ORDER = [
  '晨火I', '晨火II', '晨火III',
  '风火I', '风火II',
  '流光I', '流光II',
  '星焰I', '星焰II',
  '曦辉I', '曦辉II',
  '智慧之力',
];

export const attackEffectProfiles: Record<string, AttackEffectProfile> = {
  晨火I: {
    name: '晨火I',
    coreColor: '#fff3b5',
    glowColor: 'rgba(255,163,52,0.96)',
    tailColor: 'rgba(255,103,31,0.54)',
    ringColor: 'rgba(255,244,190,0.98)',
    haloColor: 'rgba(255,177,68,0.40)',
    particleOpacity: 0.12,
    secondRingOpacity: 0,
    residueOpacity: 0.1,
    flashOpacity: 0,
    petRimOpacity: 0.16,
    petAuraOpacity: 0.2,
    petGroundOpacity: 0.14,
    baseImpactScale: 1.22,
    orbScale: 1.02,
    shardScale: 1.08,
  },
  晨火II: {
    name: '晨火II',
    coreColor: '#fff7c8',
    glowColor: 'rgba(255,173,62,0.98)',
    tailColor: 'rgba(255,122,33,0.58)',
    ringColor: 'rgba(255,245,202,1)',
    haloColor: 'rgba(255,179,72,0.44)',
    particleOpacity: 0.82,
    secondRingOpacity: 0.18,
    residueOpacity: 0.16,
    flashOpacity: 0,
    petRimOpacity: 0.18,
    petAuraOpacity: 0.22,
    petGroundOpacity: 0.16,
    baseImpactScale: 1.34,
    orbScale: 1.1,
    shardScale: 1.2,
  },
  晨火III: {
    name: '晨火III',
    coreColor: '#fff9d8',
    glowColor: 'rgba(255,185,73,1)',
    tailColor: 'rgba(255,127,36,0.62)',
    ringColor: 'rgba(255,249,221,1)',
    haloColor: 'rgba(255,184,82,0.5)',
    particleOpacity: 0.94,
    secondRingOpacity: 0.24,
    residueOpacity: 0.22,
    flashOpacity: 0.04,
    petRimOpacity: 0.2,
    petAuraOpacity: 0.24,
    petGroundOpacity: 0.18,
    baseImpactScale: 1.48,
    orbScale: 1.18,
    shardScale: 1.28,
  },
  风火I: {
    name: '风火I',
    coreColor: '#f1ffd8',
    glowColor: 'rgba(109,232,101,0.96)',
    tailColor: 'rgba(38,186,122,0.56)',
    ringColor: 'rgba(231,255,214,1)',
    haloColor: 'rgba(110,230,136,0.46)',
    particleOpacity: 0.18,
    secondRingOpacity: 0,
    residueOpacity: 0.12,
    flashOpacity: 0,
    petRimOpacity: 0.2,
    petAuraOpacity: 0.24,
    petGroundOpacity: 0.18,
    baseImpactScale: 1.56,
    orbScale: 1.24,
    shardScale: 1.36,
  },
  风火II: {
    name: '风火II',
    coreColor: '#f7ffe7',
    glowColor: 'rgba(127,245,124,1)',
    tailColor: 'rgba(31,189,132,0.64)',
    ringColor: 'rgba(239,255,228,1)',
    haloColor: 'rgba(111,236,158,0.5)',
    particleOpacity: 0.9,
    secondRingOpacity: 0.2,
    residueOpacity: 0.2,
    flashOpacity: 0.04,
    petRimOpacity: 0.22,
    petAuraOpacity: 0.28,
    petGroundOpacity: 0.2,
    baseImpactScale: 1.7,
    orbScale: 1.32,
    shardScale: 1.48,
  },
  流光I: {
    name: '流光I',
    coreColor: '#f4fcff',
    glowColor: 'rgba(110,204,255,0.96)',
    tailColor: 'rgba(63,128,255,0.58)',
    ringColor: 'rgba(232,251,255,1)',
    haloColor: 'rgba(94,189,255,0.38)',
    particleOpacity: 0.16,
    secondRingOpacity: 0,
    residueOpacity: 0.14,
    flashOpacity: 0,
    petRimOpacity: 0.2,
    petAuraOpacity: 0.24,
    petGroundOpacity: 0.18,
    baseImpactScale: 1.72,
    orbScale: 1.36,
    shardScale: 1.52,
  },
  流光II: {
    name: '流光II',
    coreColor: '#ffffff',
    glowColor: 'rgba(132,222,255,1)',
    tailColor: 'rgba(54,136,255,0.62)',
    ringColor: 'rgba(238,253,255,1)',
    haloColor: 'rgba(96,201,255,0.44)',
    particleOpacity: 0.9,
    secondRingOpacity: 0.22,
    residueOpacity: 0.22,
    flashOpacity: 0.04,
    petRimOpacity: 0.22,
    petAuraOpacity: 0.28,
    petGroundOpacity: 0.2,
    baseImpactScale: 1.84,
    orbScale: 1.42,
    shardScale: 1.6,
  },
  星焰I: {
    name: '星焰I',
    coreColor: '#f7e8ff',
    glowColor: 'rgba(181,122,255,0.98)',
    tailColor: 'rgba(112,72,232,0.58)',
    ringColor: 'rgba(245,227,255,0.98)',
    haloColor: 'rgba(158,111,255,0.42)',
    particleOpacity: 0.14,
    secondRingOpacity: 0,
    residueOpacity: 0.14,
    flashOpacity: 0,
    petRimOpacity: 0.22,
    petAuraOpacity: 0.26,
    petGroundOpacity: 0.2,
    baseImpactScale: 1.68,
    orbScale: 1.32,
    shardScale: 1.46,
  },
  星焰II: {
    name: '星焰II',
    coreColor: '#fbf0ff',
    glowColor: 'rgba(171,102,255,1)',
    tailColor: 'rgba(93,55,220,0.62)',
    ringColor: 'rgba(245,229,255,1)',
    haloColor: 'rgba(154,103,255,0.48)',
    particleOpacity: 0.92,
    secondRingOpacity: 0.24,
    residueOpacity: 0.24,
    flashOpacity: 0.05,
    petRimOpacity: 0.24,
    petAuraOpacity: 0.3,
    petGroundOpacity: 0.22,
    baseImpactScale: 1.82,
    orbScale: 1.38,
    shardScale: 1.58,
  },
  曦辉I: {
    name: '曦辉I',
    coreColor: '#fffdf4',
    glowColor: 'rgba(255,219,101,0.98)',
    tailColor: 'rgba(255,178,57,0.58)',
    ringColor: 'rgba(255,250,230,1)',
    haloColor: 'rgba(255,205,90,0.46)',
    particleOpacity: 0.12,
    secondRingOpacity: 0,
    residueOpacity: 0.16,
    flashOpacity: 0.02,
    petRimOpacity: 0.52,
    petAuraOpacity: 0.62,
    petGroundOpacity: 0.4,
    baseImpactScale: 1.9,
    orbScale: 1.46,
    shardScale: 1.62,
  },
  曦辉II: {
    name: '曦辉II',
    coreColor: '#ffffff',
    glowColor: 'rgba(255,229,122,1)',
    tailColor: 'rgba(255,192,72,0.62)',
    ringColor: 'rgba(255,252,235,1)',
    haloColor: 'rgba(255,215,112,0.5)',
    particleOpacity: 0.98,
    secondRingOpacity: 0.34,
    residueOpacity: 0.32,
    flashOpacity: 0.08,
    petRimOpacity: 0.74,
    petAuraOpacity: 0.78,
    petGroundOpacity: 0.54,
    baseImpactScale: 2.02,
    orbScale: 1.56,
    shardScale: 1.76,
  },
  智慧之力: {
    name: '智慧之力',
    coreColor: '#ffffff',
    glowColor: 'rgba(255,244,186,1)',
    tailColor: 'rgba(255,214,125,0.68)',
    ringColor: 'rgba(255,255,246,1)',
    haloColor: 'rgba(255,230,160,0.58)',
    particleOpacity: 1,
    secondRingOpacity: 0.64,
    residueOpacity: 0.52,
    flashOpacity: 0.22,
    petRimOpacity: 0.96,
    petAuraOpacity: 1,
    petGroundOpacity: 0.72,
    baseImpactScale: 2.34,
    orbScale: 1.78,
    shardScale: 2.06,
  },
};

const attackEffectNamePattern = new RegExp(
  Object.keys(attackEffectProfiles)
    .sort((a, b) => b.length - a.length)
    .join('|'),
);

export const gemImages: Record<string, string> = {
  静思石: blueGemImage,
  生长石: cyanGemImage,
  灵感石: purpleGemImage,
  勇气石: redGemImage,
  恒心石: goldGemImage,
  跃动石: rainbowGemImage,
  愿望石: starGemImage,
};

export const mapThemeImages: Record<string, string> = {
  起光原野: defaultBattleBackground,
  低语林地: forestThemeImage,
  映光之湖: lakeThemeImage,
  踏火山径: foothillThemeImage,
  云行之巅: summitThemeImage,
  星火遗坛: altarThemeImage,
};

export interface BattleVisualOption {
  id: string;
  name: string;
  image?: string;
  previewStyle?: string;
  unlockLevel?: number;
  unlocked?: boolean;
  description?: string;
}

export function getGemImage(gemName: string): string | undefined {
  return gemImages[gemName];
}

export function getMapThemeImage(themeName: string): string | undefined {
  return mapThemeImages[themeName];
}

// 攻击特效描述
export const attackEffectDescriptions: Record<string, string> = {
  晨火I: '当答案刚刚正确，小小火点亮起，像清晨第一缕光，轻轻回应你的努力。',
  晨火II: '火光变得更稳定，会轻轻旋转，好像在说你已经开始掌握节奏。',
  晨火III: '火焰出现跳动的波纹，每一次正确都会让它更加活跃。',
  风火I: '火焰开始带着风流动，不再只是亮起，而是顺着你的思路延展。',
  风火II: '火焰形成环状回旋，像在帮你整理思考路径，越来越清晰。',
  流光I: '火焰变得冷静而纯净，每次触发都干净利落，没有多余波动。',
  流光II: '光圈连续展开，说明你已经进入熟练区，节奏稳定而自信。',
  星焰I: '火焰带着微微星光，每次出现都像一次小小的爆发与突破。',
  星焰II: '光焰像心跳般扩散，有节奏地回应你每一次正确。',
  曦辉I: '温暖的金光缓缓铺开，不再跳跃，而是安静地照亮四周。',
  曦辉II: '光环层层叠加，像在记录你的坚持与每一步成长。',
  智慧之力: '当你真正熟练，光汇聚成完整星环，安静而强大，仿佛世界在回应你。',
};

// 宝石描述
export const gemDescriptions: Record<string, string> = {
  静思石: '在安静思考时凝结的宝石，它会在你专注时悄悄出现。',
  生长石: '每一次理解新知识，它都会变得更亮一点，记录你的进步。',
  灵感石: '当你突然想明白问题，它会闪一下，记住那个灵光一刻。',
  勇气石: '在不确定却仍然尝试时诞生，是属于勇敢的奖励。',
  恒心石: '在持续完成挑战时累积，代表你的坚持与不放弃。',
  跃动石: '最活跃的宝石，会随着每一次正确轻轻跳动回应你。',
  愿望石: '汇聚所有颜色后诞生，据说能回应火灵最深的心愿。',
};

// 地图描述
export const mapThemeDescriptions: Record<string, string> = {
  起光原野: '一切开始的地方，风很轻，光很柔，火灵在这里第一次学会回应世界。',
  低语林地: '树叶会轻声说话，问题藏在细节中，需要慢慢观察与理解。',
  映光之湖: '湖水会映出答案的影子，只有安静下来，才能看清真正结果。',
  踏火山径: '地形变得复杂，需要一步一步前行，耐心比速度更重要。',
  云行之巅: '站在高处看世界，问题更难了，但你已经足够勇敢。',
  星火遗坛: '古老遗迹记录成长轨迹，每一次成功都会点亮一块沉睡的石纹。',
};

// 宝石顺序
const GEM_ORDER = ['静思石', '生长石', '灵感石', '勇气石', '恒心石', '跃动石', '愿望石'];

// 地图顺序
const MAP_ORDER = ['起光原野', '低语林地', '映光之湖', '踏火山径', '云行之巅', '星火遗坛'];

export function getGemNameForLevel(level: number): string {
  return getLevelRewardConfig(level).gemName;
}

export function getGemImageForLevel(level: number): string | undefined {
  return getGemImage(getGemNameForLevel(level));
}

export function getGemNameForExp(exp: number): string {
  const latestGemReward = [...levelRewardConfigs]
    .reverse()
    .find((config) => config.rewardType === 'gem' && config.cumulativeExp <= exp);

  if (!latestGemReward) return '静思石';
  return latestGemReward.reward.replace('发现新宝石：', '').trim();
}

export function getGemImageForExp(exp: number): string | undefined {
  return getGemImage(getGemNameForExp(exp));
}

export function getMapThemeNameForLevel(level: number): string {
  const clampedLevel = Math.max(1, Math.min(HIDDEN_FINAL_LEVEL, level));
  const latestThemeReward = [...levelRewardConfigs]
    .filter((config) => config.level <= clampedLevel && config.rewardType === 'bg')
    .at(-1);

  if (!latestThemeReward) return '起光原野';

  return latestThemeReward.reward
    .replace('发现新地图：', '')
    .trim();
}

export function getBattleBackgroundForLevel(level: number): string {
  const themeName = getMapThemeNameForLevel(level);
  return getMapThemeImage(themeName) ?? defaultBattleBackground;
}

export function getMapThemeNameForExp(exp: number): string {
  const latestThemeReward = [...levelRewardConfigs]
    .reverse()
    .find((config) => config.rewardType === 'bg' && config.cumulativeExp <= exp);

  if (!latestThemeReward) return '起光原野';
  return latestThemeReward.reward
    .replace('发现新地图：', '')
    .trim();
}

export function getBattleBackgroundForExp(exp: number): string {
  const themeName = getMapThemeNameForExp(exp);
  return getMapThemeImage(themeName) ?? defaultBattleBackground;
}

export function getUnlockedAttackEffectOptions(exp: number): BattleVisualOption[] {
  const order = ABILITY_ORDER;
  const unlockLevels = order.reduce<Record<string, number>>((acc, name) => {
    if (name === '晨火I') {
      acc[name] = 0;
      return acc;
    }
    const config = levelRewardConfigs.find(
      (item) => item.rewardType === 'sfx' && (item.reward.match(attackEffectNamePattern)?.[0] ?? '') === name
    );
    acc[name] = config?.level ?? 1;
    return acc;
  }, {});

  return order.map((name) => ({
    id: name,
    name,
    image: getAttackEffectRewardImage(name),
    unlockLevel: unlockLevels[name],
    unlocked: isRewardLevelUnlockedAtExp(unlockLevels[name], exp, (level) => getLevelRewardConfig(level).cumulativeExp),
    description: attackEffectDescriptions[name],
  }));
}

export function getUnlockedGemOptions(exp: number): BattleVisualOption[] {
  const order = GEM_ORDER;
  const unlockLevels: Record<string, number> = {
    静思石: 0,
    生长石: 2,
    灵感石: 6,
    勇气石: 12,
    恒心石: 22,
    跃动石: 33,
    愿望石: 60,
  };
  return order.map((name) => ({
    id: name,
    name,
    image: getGemImage(name),
    unlockLevel: unlockLevels[name],
    unlocked: isRewardLevelUnlockedAtExp(unlockLevels[name], exp, (level) => getLevelRewardConfig(level).cumulativeExp),
    description: gemDescriptions[name],
  }));
}

export function getUnlockedMapThemeOptions(exp: number): BattleVisualOption[] {
  const order = MAP_ORDER;
  const unlockLevels: Record<string, number> = {
    起光原野: 0,
    低语林地: 3,
    映光之湖: 8,
    踏火山径: 16,
    云行之巅: 26,
    星火遗坛: 39,
  };
  return order.map((name) => ({
    id: name,
    name,
    image: getMapThemeImage(name),
    unlockLevel: unlockLevels[name],
    unlocked: isRewardLevelUnlockedAtExp(unlockLevels[name], exp, (level) => getLevelRewardConfig(level).cumulativeExp),
    description: mapThemeDescriptions[name],
  }));
}

export function getAttackEffectProfileByName(name: string): AttackEffectProfile {
  return attackEffectProfiles[name] ?? attackEffectProfiles['晨火I'];
}

export function getCurrentAttackEffect(exp: number): AttackEffectProfile {
  const unlockedSfxReward = [...levelRewardConfigs]
    .reverse()
    .find((config) => config.rewardType === 'sfx' && config.cumulativeExp <= exp);

  const match = unlockedSfxReward?.reward.match(attackEffectNamePattern);
  return getAttackEffectProfileByName(match?.[0] ?? '晨火I');
}

export function getAttackEffectRewardImage(effectName: string): string {
  const effect = getAttackEffectProfileByName(effectName);
  const isFinal = effectName.includes('智慧之力');
  const isTierTwo = effectName.includes('II');
  const isTierThree = effectName.includes('III');
  const accentBurst = isFinal
    ? Array.from({ length: 10 }, (_, index) => {
        const angle = 36 * index;
        return `
          <g transform="translate(64 56) rotate(${angle})">
            <path d="M0 26 L8 8 L0 -6 L-8 8 Z" fill="${effect.ringColor}" opacity="0.96" />
          </g>
        `;
      }).join('')
    : isTierThree
    ? Array.from({ length: 8 }, (_, index) => {
        const angle = 45 * index;
        return `
          <g transform="translate(64 56) rotate(${angle})">
            <path d="M0 24 L6 10 L0 -2 L-6 10 Z" fill="${effect.ringColor}" opacity="0.82" />
          </g>
        `;
      }).join('')
    : isTierTwo
    ? Array.from({ length: 6 }, (_, index) => {
        const angle = 60 * index;
        return `
          <g transform="translate(64 56) rotate(${angle})">
            <circle cx="0" cy="24" r="4" fill="${effect.ringColor}" opacity="0.88" />
          </g>
        `;
      }).join('')
    : '';

  const centerGlyph = isFinal
    ? `<path d="M64 20 L70 32 L84 34 L74 44 L77 58 L64 51 L51 58 L54 44 L44 34 L58 32 Z" fill="${effect.coreColor}" opacity="0.98"/>`
    : isTierThree
    ? `<path d="M64 26 L70 38 L84 40 L73 48 L76 62 L64 55 L52 62 L55 48 L44 40 L58 38 Z" fill="${effect.coreColor}" opacity="0.94"/>`
    : isTierTwo
    ? `<circle cx="64" cy="56" r="10" fill="${effect.coreColor}" opacity="0.94"/><circle cx="64" cy="56" r="17" fill="none" stroke="${effect.ringColor}" stroke-width="3" opacity="0.84"/>`
    : `<circle cx="64" cy="56" r="12" fill="${effect.coreColor}" opacity="0.96"/>`;

  const outerRing = isFinal
    ? `<circle cx="64" cy="56" r="46" fill="none" stroke="url(#ringStroke)" stroke-width="7" opacity="0.86"/><circle cx="64" cy="56" r="32" fill="none" stroke="${effect.coreColor}" stroke-width="3" opacity="0.94"/>`
    : isTierThree
    ? `<circle cx="64" cy="56" r="42" fill="none" stroke="url(#ringStroke)" stroke-width="6" opacity="0.58"/><circle cx="64" cy="56" r="28" fill="none" stroke="${effect.ringColor}" stroke-width="3" opacity="0.78"/>`
    : isTierTwo
    ? `<circle cx="64" cy="56" r="36" fill="none" stroke="url(#ringStroke)" stroke-width="5" opacity="0.48"/>`
    : `<circle cx="64" cy="56" r="28" fill="none" stroke="${effect.ringColor}" stroke-width="3" opacity="0.42"/>`;

  const sideTrails = isFinal
    ? `
      <path d="M70 18 C94 28 104 48 96 76" stroke="${effect.glowColor}" stroke-width="8" stroke-linecap="round" fill="none" opacity="0.84"/>
      <path d="M58 18 C34 28 24 48 32 76" stroke="${effect.tailColor}" stroke-width="7" stroke-linecap="round" fill="none" opacity="0.78"/>
    `
    : isTierThree
    ? `
      <path d="M69 22 C90 31 98 48 92 70" stroke="${effect.glowColor}" stroke-width="7" stroke-linecap="round" fill="none" opacity="0.74"/>
      <path d="M59 22 C38 31 30 48 36 70" stroke="${effect.tailColor}" stroke-width="6" stroke-linecap="round" fill="none" opacity="0.68"/>
    `
    : isTierTwo
    ? `
      <path d="M68 26 C86 34 92 48 88 64" stroke="${effect.glowColor}" stroke-width="6" stroke-linecap="round" fill="none" opacity="0.62"/>
    `
    : `
      <path d="M66 30 C79 36 84 46 82 58" stroke="${effect.glowColor}" stroke-width="4.5" stroke-linecap="round" fill="none" opacity="0.54"/>
    `;

  const cornerParticles = isFinal
    ? `
      <circle cx="94" cy="24" r="5" fill="${effect.coreColor}" opacity="0.98"/>
      <circle cx="104" cy="39" r="4" fill="${effect.ringColor}" opacity="0.9"/>
      <circle cx="33" cy="30" r="5" fill="${effect.coreColor}" opacity="0.94"/>
      <circle cx="23" cy="48" r="4" fill="${effect.ringColor}" opacity="0.88"/>
      <circle cx="90" cy="91" r="5" fill="${effect.glowColor}" opacity="0.86"/>
      <circle cx="39" cy="92" r="4" fill="${effect.glowColor}" opacity="0.78"/>
    `
    : isTierThree
    ? `
      <circle cx="95" cy="30" r="4" fill="${effect.coreColor}" opacity="0.88"/>
      <circle cx="31" cy="38" r="4" fill="${effect.coreColor}" opacity="0.84"/>
      <circle cx="88" cy="88" r="4" fill="${effect.glowColor}" opacity="0.76"/>
    `
    : isTierTwo
    ? `
      <circle cx="94" cy="33" r="4" fill="${effect.coreColor}" opacity="0.82"/>
      <circle cx="34" cy="40" r="4" fill="${effect.coreColor}" opacity="0.78"/>
    `
    : `
      <circle cx="88" cy="36" r="3.5" fill="${effect.coreColor}" opacity="0.78"/>
      <circle cx="40" cy="74" r="3" fill="${effect.glowColor}" opacity="0.64"/>
    `;

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
      <defs>
        <radialGradient id="burstGlow" cx="50%" cy="44%" r="62%">
          <stop offset="0%" stop-color="${effect.coreColor}" stop-opacity="1" />
          <stop offset="45%" stop-color="${effect.glowColor}" stop-opacity="0.96" />
          <stop offset="100%" stop-color="${effect.tailColor}" stop-opacity="0.18" />
        </radialGradient>
        <linearGradient id="ringStroke" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${effect.ringColor}" />
          <stop offset="100%" stop-color="${effect.glowColor}" />
        </linearGradient>
        <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="blur"/>
          <feMerge>
            <feMergeNode in="blur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <ellipse cx="64" cy="92" rx="30" ry="12" fill="${effect.haloColor}" opacity="0.55"/>
      ${accentBurst}
      <circle cx="64" cy="56" r="${isFinal ? 34 : isTierThree ? 30 : isTierTwo ? 24 : 18}" fill="url(#burstGlow)" filter="url(#softGlow)"/>
      ${outerRing}
      ${centerGlyph}
      ${sideTrails}
      ${cornerParticles}
    </svg>
  `;
  return svgDataUrl(svg);
}

export const growthStages: GrowthStage[] = [
  {
    id: 0,
    name: '熔心之种',
    description: '它沉睡在温暖的土壤里，像一颗安静跳动的小心脏。外界的一点点光与声音，都会让它微微发热，仿佛在练习如何回应这个世界。',
    unlockLevel: 0,
    threshold: 0,
    image: stage1Image,
    emoji: '🥚',
    cardGradient: 'from-amber-300 via-orange-300 to-orange-400',
    chipLabel: '初始阶段',
  },
  {
    id: 1,
    name: '橙尾幼灵',
    description: '刚醒来的它对一切都充满不确定，小心翼翼地迈步，却忍不住用亮晶晶的眼睛打量世界。它会跟着温暖的气息走，把你当成第一个可以依靠的人。',
    unlockLevel: 0,
    threshold: STAGE_THRESHOLDS.橙尾幼灵,
    image: stage2Image,
    cardGradient: 'from-orange-300 via-orange-400 to-red-400',
    chipLabel: '形态1',
  },
  {
    id: 2,
    name: '跃焰灵狐',
    description: '它开始学会跳跃与奔跑，喜欢在草地间来回试探自己的速度。尾巴燃起轻快的火光，像是在炫耀，也像是在记录每一次小小的成长。',
    unlockLevel: 4,
    threshold: STAGE_THRESHOLDS.跃焰灵狐,
    image: stage3Image,
    cardGradient: 'from-orange-300 via-amber-300 to-yellow-300',
    chipLabel: '形态2',
  },
  {
    id: 3,
    name: '炎步行者',
    description: '身体逐渐挺直的它，开始意识到"方向"的意义。它不再乱跑，而是有意识地前行，偶尔回头确认你是否跟上，是个有点倔强的小领路者。',
    unlockLevel: 10,
    threshold: STAGE_THRESHOLDS.炎步行者,
    image: stage4Image,
    cardGradient: 'from-rose-300 via-orange-300 to-amber-300',
    chipLabel: '形态3',
  },
  {
    id: 4,
    name: '火纹守望者',
    description: '它学会了使用工具，也学会了停下来观察世界。围巾会随风晃动，它喜欢站在高处看远方，把看到的一切默默记在心里，变得可靠起来。',
    unlockLevel: 18,
    threshold: STAGE_THRESHOLDS.火纹守望者,
    image: stage5Image,
    cardGradient: 'from-red-300 via-orange-300 to-yellow-300',
    chipLabel: '形态4',
  },
  {
    id: 5,
    name: '焰语旅者',
    description: '握住火焰法杖后，它开始理解"火"的另一种意义——不只是力量，也是沟通。它会用火光指路、取暖，也会在夜里为同伴讲故事。',
    unlockLevel: 30,
    threshold: STAGE_THRESHOLDS.焰语旅者,
    image: stage6Image,
    cardGradient: 'from-sky-300 via-cyan-300 to-blue-400',
    chipLabel: '形态5',
  },
  {
    id: 6,
    name: '裂焰斗者',
    description: '它进入真正的战斗状态，动作果断，眼神坚定。火焰在武器上流动，不再张扬，而是精准克制——它已经知道力量该在何时使用。',
    unlockLevel: 50,
    threshold: STAGE_THRESHOLDS.裂焰斗者,
    image: stage7Image,
    cardGradient: 'from-yellow-300 via-amber-300 to-orange-400',
    chipLabel: '形态6',
  },
  {
    id: 7,
    name: '炽界主灵',
    description: '火焰不再只是附着，而是围绕它本身流转。它站在那里，就像一个稳定的能量中心，情绪平静却极具压迫感，开始真正影响周围的世界。',
    unlockLevel: 80,
    threshold: STAGE_THRESHOLDS.炽界主灵,
    image: stage8Image,
    cardGradient: 'from-fuchsia-300 via-violet-300 to-sky-300',
    chipLabel: '最终形态',
  },
  {
    id: 8,
    name: '寂焰王座',
    description: '当所有火焰归于掌控，它反而变得异常安静。烈焰在身后如星河般流动，它不再需要证明什么，只是在关键时刻，决定让世界重新被点亮。',
    unlockLevel: HIDDEN_FINAL_LEVEL,
    threshold: HIDDEN_FINAL_EXP,
    image: stage9Image,
    cardGradient: 'from-slate-800 via-violet-700 to-amber-200',
    chipLabel: '隐藏形态',
    hidden: true,
  },
];

// 关卡经验配置（按新规则）
function buildLevelExpMap(): Map<number, number> {
  const expMap = new Map<number, number>();

  // 关键节点的累积经验目标
  const targets = [
    { level: 4, cumulative: 50 },
    { level: 10, cumulative: 120 },
    { level: 18, cumulative: 220 },
    { level: 30, cumulative: 350 },
    { level: 50, cumulative: 510 },
    { level: 80, cumulative: 700 },
    { level: 159, cumulative: 1500 },
  ];

  let prevLevel = 0;

  targets.forEach(target => {
    for (let l = prevLevel + 1; l <= target.level; l++) {
      // 计算前面关卡已分配的累积经验（不包含当前关卡）
      const currentCumulative = Array.from({ length: l - 1 }, (_, i) => expMap.get(i + 1) || 10)
        .reduce((sum, e) => sum + e, 0);
      const remaining = target.cumulative - currentCumulative;
      const remainingLevels = target.level - l + 1;
      expMap.set(l, Math.max(6, Math.round(remaining / remainingLevels)));
    }
    prevLevel = target.level;
  });

  return expMap;
}

const levelExpMap = buildLevelExpMap();

// 关卡奖励配置（按新规则）
function buildLevelRewardConfigs(): LevelRewardConfig[] {
  const configs: LevelRewardConfig[] = [];
  let cumulativeExp = 0;
  let currentGem = '静思石';
  let currentMap = '起光原野';

  // 奖励定义（按新规则）
  const rewards: Array<{ level: number; type: RewardType; name: string }> = [
    // 前10关：每关有奖励
    { level: 1, type: 'sfx', name: '晨火I' },
    { level: 2, type: 'gem', name: '生长石' },
    { level: 3, type: 'bg', name: '低语林地' },
    { level: 4, type: 'evolution', name: '跃焰灵狐' },
    { level: 5, type: 'sfx', name: '晨火II' },
    { level: 6, type: 'gem', name: '灵感石' },
    { level: 7, type: 'sfx', name: '晨火III' },
    { level: 8, type: 'bg', name: '映光之湖' },
    { level: 9, type: 'sfx', name: '风火I' },
    { level: 10, type: 'evolution', name: '炎步行者' },
    // 10-30关：隔关有奖励
    { level: 12, type: 'gem', name: '勇气石' },
    { level: 14, type: 'sfx', name: '风火II' },
    { level: 16, type: 'bg', name: '踏火山径' },
    { level: 18, type: 'evolution', name: '火纹守望者' },
    { level: 20, type: 'sfx', name: '流光I' },
    { level: 22, type: 'gem', name: '恒心石' },
    { level: 24, type: 'sfx', name: '流光II' },
    { level: 26, type: 'bg', name: '云行之巅' },
    { level: 28, type: 'sfx', name: '星焰I' },
    { level: 30, type: 'evolution', name: '焰语旅者' },
    // 30-50关：隔2关有奖励
    { level: 33, type: 'gem', name: '跃动石' },
    { level: 36, type: 'sfx', name: '星焰II' },
    { level: 39, type: 'bg', name: '星火遗坛' },
    { level: 42, type: 'sfx', name: '曦辉I' },
    { level: 45, type: 'sfx', name: '曦辉II' },
    { level: 48, type: 'sfx', name: '智慧之力' },
    { level: 50, type: 'evolution', name: '裂焰斗者' },
    // 50关后
    { level: 60, type: 'gem', name: '愿望石' },
    { level: 80, type: 'evolution', name: '炽界主灵' },
    // 最终
    { level: 159, type: 'hidden', name: '寂焰王座' },
  ];

  const rewardMap = new Map(rewards.map(r => [r.level, r]));

  for (let level = 1; level <= HIDDEN_FINAL_LEVEL; level++) {
    const exp = levelExpMap.get(level) || 10;
    cumulativeExp += exp;

    const reward = rewardMap.get(level);
    let rewardStr = '';
    let rewardType: RewardType = 'none';
    let nextRewardHint = '';
    let focus: RewardFocus = 'next_reward';

    // 更新当前宝石（获取最新的，即最后一个匹配项）
    const gemReward = [...rewards].reverse().find(r => r.type === 'gem' && r.level < level);
    if (gemReward) currentGem = gemReward.name;

    // 更新当前地图（获取最新的，即最后一个匹配项）
    const mapReward = [...rewards].reverse().find(r => r.type === 'bg' && r.level < level);
    if (mapReward) currentMap = mapReward.name;

    if (reward) {
      rewardType = reward.type;

      switch (reward.type) {
        case 'evolution':
          rewardStr = `进化！${reward.name}`;
          break;
        case 'sfx':
          rewardStr = `能力升级：${reward.name}`;
          break;
        case 'gem':
          rewardStr = `发现新宝石：${reward.name}`;
          break;
        case 'bg':
          rewardStr = `发现新地图：${reward.name}`;
          break;
        case 'hidden':
          rewardStr = '隐藏形态解锁！';
          break;
      }
    }

    // 计算下一形态需求
    const currentStage = getGrowthStageByExp(cumulativeExp);
    const nextStage = getNextGrowthStage(cumulativeExp);
    const toEvolution = nextStage ? nextStage.threshold - cumulativeExp : 0;

    // 计算下一奖励提示
    const nextReward = rewards.find(r => r.level > level);
    if (nextReward) {
      const distance = nextReward.level - level;
      if (nextReward.type === 'evolution') {
        nextRewardHint = `${distance}关后，进化！${nextReward.name}`;
      } else if (nextReward.type === 'sfx') {
        nextRewardHint = `${distance}关后，能力升级：${nextReward.name}`;
      } else if (nextReward.type === 'gem') {
        nextRewardHint = `${distance}关后，发现新宝石：${nextReward.name}`;
      } else if (nextReward.type === 'bg') {
        nextRewardHint = `${distance}关后，发现新地图：${nextReward.name}`;
      } else if (nextReward.type === 'hidden') {
        nextRewardHint = `${distance}关后，隐藏形态解锁！`;
      }
    } else if (level >= 80) {
      nextRewardHint = '成长链完成';
    }

    // 确定focus
    if (rewardType === 'hidden' && level === HIDDEN_FINAL_LEVEL) {
      // 159关隐藏形态解锁，是隐藏终局
      focus = 'hidden_finale';
    } else if (rewardType === 'evolution') {
      focus = 'new_reward';
    } else if (rewardType === 'sfx' || rewardType === 'gem' || rewardType === 'bg') {
      focus = 'new_reward';
    } else if (level === 80) {
      // 80关是炽界主灵解锁，是真正的 finale
      focus = 'finale';
    } else if (level >= 81 && level < HIDDEN_FINAL_LEVEL) {
      // 81-158关：指向159关隐藏形态
      focus = 'next_evolution';
    } else if (toEvolution > 0 && toEvolution <= 20) {
      focus = 'next_evolution';
    } else {
      focus = 'next_reward';
    }

    const progressLabel = `${cumulativeExp}/${nextStage?.threshold ?? cumulativeExp}`;

    configs.push({
      level,
      gemName: currentGem,
      exp,
      cumulativeExp,
      progressLabel,
      toEvolution,
      reward: rewardStr,
      rewardType,
      nextRewardHint,
      focus,
    });
  }

  return configs;
}

export const levelRewardConfigs: LevelRewardConfig[] = buildLevelRewardConfigs();

export function getLevelRewardConfig(level: number): LevelRewardConfig {
  if (level <= 1) return levelRewardConfigs[0];
  if (level >= HIDDEN_FINAL_LEVEL) return levelRewardConfigs[levelRewardConfigs.length - 1];
  return levelRewardConfigs.find((item) => item.level === level) ?? levelRewardConfigs[levelRewardConfigs.length - 1];
}

export function getGrowthStageByExp(exp: number): GrowthStage {
  return [...growthStages].reverse().find((stage) => exp >= stage.threshold) ?? growthStages[0];
}

export function getNextGrowthStage(exp: number): GrowthStage | null {
  const current = getGrowthStageByExp(exp);
  const idx = growthStages.findIndex(s => s.id === current.id);
  if (idx < growthStages.length - 1) {
    return growthStages[idx + 1];
  }
  return null;
}

export function getTotalExpBeforeLevel(level: number): number {
  if (level <= 1) return 0;
  return getLevelRewardConfig(level - 1).cumulativeExp;
}

export function getProgressRatio(exp: number, target: number): number {
  if (target <= 0) return 1;
  return Math.max(0, Math.min(1, exp / target));
}

export function buildRewardCardModel(level: number, totalBefore: number, totalAfter: number): RewardCardModel {
  const config = getLevelRewardConfig(level);
  const previousStage = getGrowthStageByExp(totalBefore);
  const currentStage = getGrowthStageByExp(totalAfter);
  const nextStage = getNextGrowthStage(totalAfter);
  const isHiddenArc = level > 80;
  const rewardGemName =
    config.rewardType === 'gem'
      ? config.reward.replace('发现新宝石：', '').trim()
      : config.rewardType === 'hidden'
      ? '愿望石'
      : config.gemName;
  const rewardMapName =
    config.rewardType === 'bg'
      ? config.reward.replace('发现新地图：', '').trim()
      : undefined;
  const rewardHeroImage =
    config.rewardType === 'evolution' || config.rewardType === 'hidden'
      ? currentStage.image
      : config.rewardType === 'gem'
      ? getGemImage(rewardGemName)
      : config.rewardType === 'sfx'
      ? getAttackEffectRewardImage(config.reward.match(attackEffectNamePattern)?.[0] ?? '晨火I')
      : config.rewardType === 'bg' && rewardMapName
      ? getMapThemeImage(rewardMapName)
      : undefined;
  const progressTarget = nextStage?.threshold ?? totalAfter;
  const progressLabel = nextStage
    ? nextStage.hidden
      ? `隐藏形态 · ${config.progressLabel}`
      : `下一形态：??? · ${config.progressLabel} · 还差 ${Math.max(0, nextStage.threshold - totalAfter)} 经验`
    : `${totalAfter} / ${totalAfter}`;

  const newRewardLabel =
    config.rewardType === 'evolution'
      ? config.reward.replace('宠物', '火尾狐')
      : config.rewardType === 'sfx'
      ? config.reward.replace('能力：', '能力升级：')
      : config.rewardType === 'gem'
      ? config.reward.replace('发现新宝石：', '发现新宝石：')
      : config.rewardType === 'bg'
      ? config.reward.replace('发现新地图：', '发现新地图：')
      : config.rewardType === 'hidden'
      ? '隐藏形态解锁！'
      : '';

  const mysteryHintLabel =
    config.nextRewardHint.includes('能力') ? '能力升级' :
    config.nextRewardHint.includes('宝石') ? '发现新宝石' :
    config.nextRewardHint.includes('地图') ? '发现新地图' :
    config.nextRewardHint.includes('隐藏形态') ? '隐藏形态' :
    config.nextRewardHint.includes('进化') ? '即将进化' :
    '新的变化';

  const teaserMatch = config.nextRewardHint.match(/(\d+)关后/);
  const teaserDistance = teaserMatch ? Number(teaserMatch[1]) : 1;
  const teaserText =
    config.focus === 'hidden_finale'
      ? '小勇士！\n回到起点继续冒险吧！'
      : config.focus === 'finale'
      ? '新的变化正在靠近！'
      : config.nextRewardHint.includes('能力')
      ? `还差${teaserDistance}关，能力将升级！`
      : config.nextRewardHint.includes('宝石')
      ? `还差${teaserDistance}关，将发现新宝石！`
      : config.nextRewardHint.includes('地图')
      ? `还差${teaserDistance}关，发现新地图！`
      : config.nextRewardHint.includes('隐藏形态')
      ? `还差${teaserDistance}关，隐藏形态将现身！`
      : config.nextRewardHint.includes('进化')
      ? `还差${teaserDistance}关，${currentStage.name}将进化！`
      : '新的变化正在靠近！';

  if (config.focus === 'hidden_finale') {
    return {
      level,
      focus: 'hidden_finale',
      title: config.reward,
      description: '159关完成后进入隐藏终局奖励卡。',
      newReward: config.reward,
      newRewardLabel: '最终形态！寂焰王座',
      newRewardKind: 'hidden',
      expGained: config.exp,
      progressLabel: `${HIDDEN_FINAL_EXP}/${HIDDEN_FINAL_EXP}`,
      progressCurrent: totalAfter,
      progressTarget: totalAfter,
      toEvolution: 0,
      progressBeforeRatio: getProgressRatio(totalBefore, totalAfter),
      progressAfterRatio: 1,
      nextStage: currentStage,
      mysteryHint: '159关隐藏成长链完成。',
      mysteryHintLabel: '隐藏终局',
      teaserText,
      rewardHeroImage,
      evolutionCinematic: {
        fromName: previousStage.name,
        toName: currentStage.name,
        fromImage: previousStage.image,
        toImage: currentStage.image,
      },
    };
  }

  if (config.focus === 'finale') {
    // 80关炽界主灵解锁，下一形态是隐藏形态寂焰王座
    const hiddenNextStage = getNextGrowthStage(totalAfter);
    return {
      level,
      focus: 'finale',
      title: config.reward,
      description: '第80关完成后的终局奖励卡。',
      newReward: config.reward,
      newRewardLabel: '进化！炽界主灵',
      newRewardKind: 'evolution',
      expGained: config.exp,
      progressLabel,
      progressCurrent: totalAfter,
      progressTarget: hiddenNextStage?.threshold ?? totalAfter,
      toEvolution: Math.max(0, hiddenNextStage ? hiddenNextStage.threshold - totalAfter : 0),
      progressBeforeRatio: 1,
      progressAfterRatio: 1,
      nextStage: hiddenNextStage,
      mysteryHint: '成长链完成，后续仍可继续挑战更高关卡。',
      mysteryHintLabel: '成长链完成',
      teaserText,
      rewardHeroImage,
    };
  }

  if (config.focus === 'next_reward') {
    return {
      level,
      focus: 'next_reward',
      title: '很快又有新东西！',
      description: '进化还远时，不硬推遥远目标，优先用更近的新资源把人往前拖。',
      newReward: '',
      newRewardLabel: '',
      newRewardKind: 'none',
      expGained: config.exp,
      progressLabel,
      progressCurrent: totalAfter,
      progressTarget,
      toEvolution: Math.max(0, nextStage ? nextStage.threshold - totalAfter : 0),
      progressBeforeRatio: getProgressRatio(totalBefore, progressTarget),
      progressAfterRatio: getProgressRatio(totalAfter, progressTarget),
      nextStage,
      mysteryHint: config.nextRewardHint,
      mysteryHintLabel,
      teaserText,
      rewardHeroImage: undefined,
    };
  }

  if (config.focus === 'next_evolution') {
    return {
      level,
      focus: 'next_evolution',
      title: isHiddenArc ? '隐藏能量继续积累' : '再来一关，宠物就会进化',
      description: isHiddenArc
        ? '80关后的长线积累只服务于159关隐藏形态。'
        : '无奖励关卡把"距离下一次进化"作为主抓手，继续往下一关推进。',
      newReward: '',
      newRewardLabel: '',
      newRewardKind: 'none',
      expGained: config.exp,
      progressLabel,
      progressCurrent: totalAfter,
      progressTarget,
      toEvolution: Math.max(0, nextStage ? nextStage.threshold - totalAfter : 0),
      progressBeforeRatio: getProgressRatio(totalBefore, progressTarget),
      progressAfterRatio: getProgressRatio(totalAfter, progressTarget),
      nextStage,
      mysteryHint: config.nextRewardHint,
      mysteryHintLabel,
      teaserText,
      rewardHeroImage: undefined,
    };
  }

  return {
    level,
    focus: 'new_reward',
    title: config.reward || '获得新奖励！',
    description: '新奖励有则显示，无则隐藏；成长模块继续推动下一形态。',
    newReward: config.reward,
    newRewardLabel:
      config.rewardType === 'evolution'
        ? `进化！${currentStage.name}`
        : newRewardLabel,
    newRewardKind: config.rewardType,
    expGained: config.exp,
    progressLabel,
    progressCurrent: totalAfter,
    progressTarget,
    toEvolution: Math.max(0, nextStage ? nextStage.threshold - totalAfter : 0),
    progressBeforeRatio: getProgressRatio(totalBefore, progressTarget),
    progressAfterRatio: getProgressRatio(totalAfter, progressTarget),
    nextStage,
    mysteryHint: config.nextRewardHint,
    mysteryHintLabel,
    teaserText,
    rewardHeroImage,
    evolutionCinematic:
      config.rewardType === 'evolution'
        ? {
            fromName: previousStage.name,
            toName: currentStage.name,
            fromImage: previousStage.image,
            toImage: currentStage.image,
          }
        : undefined,
  };
}

export function buildLevelZeroRewardCardModel(totalBefore: number, totalAfter: number): RewardCardModel {
  const previousStage = growthStages.find((stage) => stage.name === '熔心之种') ?? null;
  const rewardStage = growthStages.find((stage) => stage.name === '橙尾幼灵') ?? growthStages[1];
  const nextStage = growthStages.find((stage) => stage.name === '跃焰灵狐') ?? null;

  return buildLevelZeroRewardCardModelData({
    totalBefore,
    totalAfter,
    previousStage,
    rewardHeroImage: rewardStage.image,
    nextStage,
  });
}
