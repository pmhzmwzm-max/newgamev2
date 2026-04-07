/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import MapScreen from './components/MapScreen';
import QuizScreen from './components/QuizScreen';
import ResultScreen from './components/ResultScreen';
import PokedexScreen from './components/PokedexScreen';
import {
  getAttackEffectProfileByName,
  buildRewardCardModel,
  getBattleBackgroundForExp,
  getCurrentAttackEffect,
  getGemImage,
  getGemImageForExp,
  getGemNameForExp,
  getGrowthStageByExp,
  getLevelRewardConfig,
  getMapThemeImage,
  getMapThemeNameForExp,
  getTotalExpBeforeLevel,
  getUnlockedAttackEffectOptions,
  getUnlockedGemOptions,
  getUnlockedMapThemeOptions,
  growthStages,
  type RewardCardModel,
} from './data/growthRewards';

type Screen = 'map' | 'quiz' | 'result';
type GradeKey = 'k' | '1' | '2' | '3';

interface GradeData {
  unlockedLevels: number[];
  completedLevels: number[];
  puzzlePieces: number;
}

type GameData = Record<GradeKey, GradeData>;

const MAX_LEVELS = 159; // 每个年级159关
const INITIAL_GRADE3_UNLOCKS = [0, 1];

const defaultData: GameData = {
  k: { unlockedLevels: [1], completedLevels: [], puzzlePieces: 0 },
  '1': { unlockedLevels: [1], completedLevels: [], puzzlePieces: 0 },
  '2': { unlockedLevels: [1], completedLevels: [], puzzlePieces: 0 },
  '3': { unlockedLevels: INITIAL_GRADE3_UNLOCKS, completedLevels: [], puzzlePieces: 0 },
};

function normalizeUnlockedLevelsForGrade(grade: GradeKey, unlockedLevels: number[]): number[] {
  const highestUnlocked = unlockedLevels.reduce((max, value) => {
    if (!Number.isFinite(value)) return max;
    return Math.max(max, Math.floor(value));
  }, grade === '3' ? 1 : 1);

  const contiguousLevels =
    grade === '3'
      ? [0, ...Array.from({ length: highestUnlocked }, (_, index) => index + 1)]
      : Array.from({ length: highestUnlocked }, (_, index) => index + 1);

  return Array.from(new Set(contiguousLevels)).sort((a, b) => a - b);
}

function normalizeGameData(data: GameData): GameData {
  return {
    k: {
      ...defaultData.k,
      ...(data.k ?? {}),
      unlockedLevels: normalizeUnlockedLevelsForGrade('k', data.k?.unlockedLevels ?? defaultData.k.unlockedLevels),
      completedLevels: data.k?.completedLevels ?? [],
    },
    '1': {
      ...defaultData['1'],
      ...(data['1'] ?? {}),
      unlockedLevels: normalizeUnlockedLevelsForGrade('1', data['1']?.unlockedLevels ?? defaultData['1'].unlockedLevels),
      completedLevels: data['1']?.completedLevels ?? [],
    },
    '2': {
      ...defaultData['2'],
      ...(data['2'] ?? {}),
      unlockedLevels: normalizeUnlockedLevelsForGrade('2', data['2']?.unlockedLevels ?? defaultData['2'].unlockedLevels),
      completedLevels: data['2']?.completedLevels ?? [],
    },
    '3': {
      ...defaultData['3'],
      ...(data['3'] ?? {}),
      unlockedLevels: normalizeUnlockedLevelsForGrade('3', data['3']?.unlockedLevels ?? defaultData['3'].unlockedLevels),
      completedLevels: data['3']?.completedLevels ?? [],
    },
  };
}

export default function App() {
  // 直接进入三年级关卡地图
  const [currentScreen, setCurrentScreen] = useState<Screen>('map');
  const [currentGrade, setCurrentGrade] = useState<GradeKey>('3');
  const [stats, setStats] = useState({ accuracy: 0, time: 0, maxCombo: 0 });
  const [currentLevelId, setCurrentLevelId] = useState<number>(1);
  const [selectedBattleStageId, setSelectedBattleStageId] = useState<number>(() => {
    const saved = localStorage.getItem('selectedBattleStageId');
    const parsed = saved ? parseInt(saved, 10) : 1;
    return growthStages.some((stage) => stage.id === parsed) ? parsed : 1;
  });
  const [selectedBattleEffectName, setSelectedBattleEffectName] = useState<string>(() => localStorage.getItem('selectedBattleEffectName') || '晨火I');
  const [selectedBattleGemName, setSelectedBattleGemName] = useState<string>(() => localStorage.getItem('selectedBattleGemName') || '静思石');
  const [selectedBattleMapTheme, setSelectedBattleMapTheme] = useState<string>(() => localStorage.getItem('selectedBattleMapTheme') || '起光原野');
  const [showPokedexModal, setShowPokedexModal] = useState(false);
  const [pokedexDefaultTab, setPokedexDefaultTab] = useState<'stage' | 'effect' | 'gem' | 'map'>('stage');
  const [rewardCard, setRewardCard] = useState<RewardCardModel | null>(null);
  const [showRewardCard, setShowRewardCard] = useState(false);
  const [debugLevel, setDebugLevel] = useState<number>(1);
  const [debugPanelMinimized, setDebugPanelMinimized] = useState(false);

  useEffect(() => {
    localStorage.setItem('selectedBattleStageId', selectedBattleStageId.toString());
  }, [selectedBattleStageId]);

  useEffect(() => {
    localStorage.setItem('selectedBattleEffectName', selectedBattleEffectName);
  }, [selectedBattleEffectName]);

  useEffect(() => {
    localStorage.setItem('selectedBattleGemName', selectedBattleGemName);
  }, [selectedBattleGemName]);

  useEffect(() => {
    localStorage.setItem('selectedBattleMapTheme', selectedBattleMapTheme);
  }, [selectedBattleMapTheme]);

  const [gameData, setGameData] = useState<GameData>(() => {
    const saved = localStorage.getItem('gameDataV3');
    if (saved) {
      try {
        return normalizeGameData(JSON.parse(saved));
      } catch {
        return defaultData;
      }
    }
    return defaultData;
  });

  useEffect(() => {
    localStorage.setItem('gameDataV3', JSON.stringify(gameData));
  }, [gameData]);

  const currentGradeData = gameData[currentGrade];
  const activeGrowthStage = getGrowthStageByExp(currentGradeData.puzzlePieces);
  const defaultEffectName = getCurrentAttackEffect(currentGradeData.puzzlePieces).name;
  const defaultGemName = getGemNameForExp(currentGradeData.puzzlePieces);
  const defaultMapTheme = getMapThemeNameForExp(currentGradeData.puzzlePieces);
  const unlockedEffectOptions = getUnlockedAttackEffectOptions(currentGradeData.puzzlePieces);
  const unlockedGemOptions = getUnlockedGemOptions(currentGradeData.puzzlePieces);
  const unlockedMapOptions = getUnlockedMapThemeOptions(currentGradeData.puzzlePieces);

  const applyBattleLoadoutFromExp = (exp: number) => {
    setSelectedBattleEffectName(getCurrentAttackEffect(exp).name);
    setSelectedBattleGemName(getGemNameForExp(exp));
    setSelectedBattleMapTheme(getMapThemeNameForExp(exp));
  };

  useEffect(() => {
    const selectedStage = growthStages.find((stage) => stage.id === selectedBattleStageId);
    if (!selectedStage || currentGradeData.puzzlePieces < selectedStage.threshold) {
      setSelectedBattleStageId(activeGrowthStage.id);
    }
  }, [activeGrowthStage.id, currentGradeData.puzzlePieces, selectedBattleStageId]);

  useEffect(() => {
    if (!unlockedEffectOptions.some((option) => option.id === selectedBattleEffectName && option.unlocked !== false)) {
      setSelectedBattleEffectName(defaultEffectName);
    }
    if (!unlockedGemOptions.some((option) => option.id === selectedBattleGemName && option.unlocked !== false)) {
      setSelectedBattleGemName(defaultGemName);
    }
    if (!unlockedMapOptions.some((option) => option.id === selectedBattleMapTheme && option.unlocked !== false)) {
      setSelectedBattleMapTheme(defaultMapTheme);
    }
  }, [
    defaultEffectName,
    defaultGemName,
    defaultMapTheme,
    selectedBattleEffectName,
    selectedBattleGemName,
    selectedBattleMapTheme,
    unlockedEffectOptions,
    unlockedGemOptions,
    unlockedMapOptions,
  ]);

  const handleLevelComplete = (levelStats: { accuracy: number; time: number; maxCombo: number }) => {
    const rewardConfig = getLevelRewardConfig(currentLevelId);
    const totalBefore = currentGradeData.puzzlePieces;
    const totalAfter = Math.max(currentGradeData.puzzlePieces, rewardConfig.cumulativeExp);
    const beforeStage = getGrowthStageByExp(totalBefore);
    const afterStage = getGrowthStageByExp(totalAfter);

    setStats({
      ...levelStats,
      expGained: rewardConfig.exp,
    });

    // 使用 completedLevels 判断是否首次通关
    const isFirstTimeClear = !currentGradeData.completedLevels.includes(currentLevelId);

    setGameData(prev => {
      const currentData = prev[currentGrade];
      const newUnlocked = [...currentData.unlockedLevels];
      const newCompleted = [...currentData.completedLevels];

      // 记录已完成
      if (!newCompleted.includes(currentLevelId)) {
        newCompleted.push(currentLevelId);
      }

      // 解锁下一关
      if (!newUnlocked.includes(currentLevelId + 1) && currentLevelId < MAX_LEVELS) {
        newUnlocked.push(currentLevelId + 1);
      }

      return {
        ...prev,
        [currentGrade]: {
          unlockedLevels: normalizeUnlockedLevelsForGrade(currentGrade, newUnlocked),
          completedLevels: newCompleted.sort((a, b) => a - b),
          puzzlePieces: totalAfter,
        }
      };
    });

    // 仅在首次通关时显示奖励卡片
    if (isFirstTimeClear) {
      setRewardCard(buildRewardCardModel(currentLevelId, totalBefore, totalAfter));
      setShowRewardCard(true);
    }
    if (afterStage.id > beforeStage.id) {
      setSelectedBattleStageId(afterStage.id);
    }
    applyBattleLoadoutFromExp(totalAfter);
    setCurrentScreen('result');
  };
  // 当前可玩关卡 = 已完成关卡的最大值 + 1（如果有的话）
  const realHighestUnlockedLevel = Math.max(
    1,
    ...currentGradeData.completedLevels.filter((level) => (currentGrade === '3' ? level >= 1 : level >= 1)).map(l => l + 1),
    1
  );

  // 构建调试用的 unlockedLevels：包含当前可玩关卡
  const buildDebugUnlockedLevels = (level: number) => {
    if (currentGrade === '3') {
      // 三年级包含 0 和 1 到 level
      return [0, ...Array.from({ length: level }, (_, index) => index + 1)];
    }
    // 其他年级：1 到 level
    return Array.from({ length: level }, (_, index) => index + 1);
  };

  // 构建调试用的 completedLevels：已完成 1 到 level-1
  const buildDebugCompletedLevels = (level: number) => {
    if (level <= 1) return [];
    return Array.from({ length: level - 1 }, (_, index) => index + 1);
  };

  const setFormalProgressToLevel = (level: number) => {
    const clampedLevel = Math.max(1, Math.min(MAX_LEVELS, level));
    const targetExp = getTotalExpBeforeLevel(clampedLevel);
    const targetStage = getGrowthStageByExp(targetExp);
    setGameData((prev) => ({
      ...prev,
      [currentGrade]: {
        unlockedLevels: normalizeUnlockedLevelsForGrade(currentGrade, buildDebugUnlockedLevels(clampedLevel)),
        completedLevels: buildDebugCompletedLevels(clampedLevel),
        puzzlePieces: targetExp,
      },
    }));
    setSelectedBattleStageId(targetStage.id);
    applyBattleLoadoutFromExp(targetExp);
    setCurrentLevelId(clampedLevel);
    setDebugLevel(clampedLevel);
    setRewardCard(null);
    setShowRewardCard(false);
    setCurrentScreen('map');
  };
  // 直接使用真实数据
  const effectiveUnlockedLevels = currentGradeData.unlockedLevels;
  const effectiveCompletedLevels = currentGradeData.completedLevels;
  const effectivePuzzlePieces = currentGradeData.puzzlePieces;
  const debugChainExp = getLevelRewardConfig(debugLevel).cumulativeExp;
  const debugChainStage = getGrowthStageByExp(debugChainExp);
  const debugChainGem = getGemNameForExp(debugChainExp);
  const debugChainMapTheme = getMapThemeNameForExp(debugChainExp);
  const debugChainEffect = getCurrentAttackEffect(debugChainExp);
  const debugChainReward = getLevelRewardConfig(debugLevel).reward || '-';

  useEffect(() => {
    setDebugLevel(realHighestUnlockedLevel);
  }, [realHighestUnlockedLevel]);

  // 应用关卡未完成时的默认状态（强制覆盖图鉴选择）
  const applyDebugLevelPreview = (level: number) => {
    const clampedLevel = Math.max(1, Math.min(MAX_LEVELS, level));
    const expBefore = getTotalExpBeforeLevel(clampedLevel); // 关卡未完成时的经验

    // 强制设置到默认态（覆盖图鉴选择）
    const stageBefore = getGrowthStageByExp(expBefore);
    setSelectedBattleStageId(stageBefore.id);
    setSelectedBattleEffectName(getCurrentAttackEffect(expBefore).name);
    setSelectedBattleGemName(getGemNameForExp(expBefore));
    setSelectedBattleMapTheme(getMapThemeNameForExp(expBefore));
    setCurrentLevelId(clampedLevel);
  };

  const applyDebugPreview = (level: number) => {
    const clampedLevel = Math.max(1, Math.min(MAX_LEVELS, level));
    const totalBefore = getTotalExpBeforeLevel(clampedLevel);
    const totalAfter = getLevelRewardConfig(clampedLevel).cumulativeExp;

    setDebugLevel(clampedLevel);
    setCurrentLevelId(clampedLevel);
    setStats({
      accuracy: 100,
      time: 28,
      maxCombo: 10,
      expGained: getLevelRewardConfig(clampedLevel).exp,
    });
    setRewardCard(buildRewardCardModel(clampedLevel, totalBefore, totalAfter));
    setShowRewardCard(true);
    setCurrentScreen('result');
  };

  return (
    <div className="w-full h-screen bg-gray-100 flex justify-center items-center overflow-hidden font-sans p-4">
      <div className="w-[768px] h-[1024px] max-w-full max-h-full bg-white relative shadow-xl overflow-visible rounded-[2rem]">
        {currentScreen === 'map' && (
          <MapScreen
            gradeId={currentGrade}
            unlockedLevels={effectiveUnlockedLevels}
            completedLevels={effectiveCompletedLevels}
            puzzlePieces={effectivePuzzlePieces}
            maxLevels={MAX_LEVELS}
            onStart={(levelId) => {
              setRewardCard(null);
              setShowRewardCard(false);
              setCurrentLevelId(levelId);
              setCurrentScreen('quiz');
            }}
            onOpenPokedex={() => {
              setPokedexDefaultTab('stage');
              setShowPokedexModal(true);
            }}
          />
        )}
        {currentScreen === 'quiz' && (
          <QuizScreen
            gradeId={currentGrade}
            levelId={currentLevelId}
            selectedPet={growthStages.find((stage) => stage.id === selectedBattleStageId) ?? growthStages[1]}
            attackEffect={getAttackEffectProfileByName(selectedBattleEffectName)}
            gemImage={getGemImage(selectedBattleGemName) ?? getGemImageForExp(effectivePuzzlePieces)}
            backgroundImage={getMapThemeImage(selectedBattleMapTheme) ?? getBattleBackgroundForExp(effectivePuzzlePieces)}
            onFinish={handleLevelComplete}
            onBack={() => setCurrentScreen('map')}
            showDebugTools={import.meta.env.DEV}
          />
        )}
        {currentScreen === 'result' && (
          <ResultScreen
            stats={stats}
            onBack={() => setCurrentScreen('map')}
            onNextLevel={() => {
              if (currentLevelId < MAX_LEVELS) {
                setRewardCard(null);
                setShowRewardCard(false);
                setCurrentLevelId(currentLevelId + 1);
                setCurrentScreen('quiz');
              } else {
                setCurrentScreen('map');
              }
            }}
            onOpenPokedex={() => {
              setPokedexDefaultTab('stage');
              setShowPokedexModal(true);
            }}
            hasNextLevel={currentLevelId < MAX_LEVELS && effectiveUnlockedLevels.includes(currentLevelId + 1)}
            rewardCard={rewardCard}
            showRewardCard={showRewardCard}
            onCloseRewardCard={() => setShowRewardCard(false)}
          />
        )}

        <PokedexScreen
          isOpen={showPokedexModal}
          puzzlePieces={effectivePuzzlePieces}
          selectedBattleStageId={selectedBattleStageId}
          onSelectBattleStage={setSelectedBattleStageId}
          selectedBattleEffectName={selectedBattleEffectName}
          selectedBattleGemName={selectedBattleGemName}
          selectedBattleMapTheme={selectedBattleMapTheme}
          effectOptions={unlockedEffectOptions}
          gemOptions={unlockedGemOptions}
          mapOptions={unlockedMapOptions}
          onSelectBattleEffect={setSelectedBattleEffectName}
          onSelectBattleGem={setSelectedBattleGemName}
          onSelectBattleMap={setSelectedBattleMapTheme}
          onClose={() => setShowPokedexModal(false)}
          defaultTab={pokedexDefaultTab}
        />

        {import.meta.env.DEV && (
          debugPanelMinimized ? (
            <button
              onClick={() => setDebugPanelMinimized(false)}
              className="absolute left-4 top-4 z-[120] rounded-full border border-slate-200/80 bg-white/92 px-3 py-2 text-xs font-black tracking-[0.08em] text-slate-600 shadow-[0_16px_32px_rgba(42,64,103,0.16)] backdrop-blur"
            >
              调试
            </button>
          ) : (
            <div className="absolute left-4 top-4 z-[120] w-[236px] rounded-[22px] border border-slate-200/80 bg-white/92 p-3 shadow-[0_16px_32px_rgba(42,64,103,0.16)] backdrop-blur">
              <div className="mb-2 flex items-center justify-between">
                <div className="text-xs font-black tracking-[0.08em] text-slate-500">奖励调试</div>
                <button
                  onClick={() => setDebugPanelMinimized(true)}
                  className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-black text-slate-500"
                >
                  最小化
                </button>
              </div>
              <div className="mb-2 text-sm font-black text-slate-700">设备正式进度：第 {debugLevel} 关</div>
              <div className="mb-2 rounded-[14px] bg-slate-50 px-3 py-2 text-[10px] font-bold leading-5 text-slate-600">
                <div>{`形态：${debugChainStage.name}`}</div>
                <div>{`宝石：${debugChainGem}`}</div>
                <div>{`背景：${debugChainMapTheme}`}</div>
                <div>{`特效：${debugChainEffect.name}`}</div>
                <div>{`获得：${debugChainReward}`}</div>
              </div>
              <input
                type="range"
                min={1}
                max={159}
                value={debugLevel}
                onChange={(event) => {
                  const level = Number(event.target.value);
                  setDebugLevel(level);
                  if (showRewardCard) {
                    // 正在预览奖励卡片时，实时更新卡片内容
                    const totalBefore = getTotalExpBeforeLevel(level);
                    const totalAfter = getLevelRewardConfig(level).cumulativeExp;
                    setRewardCard(buildRewardCardModel(level, totalBefore, totalAfter));
                  } else {
                    // 拖动时直接更新真实进度
                    setFormalProgressToLevel(level);
                  }
                }}
                className="mb-3 w-full accent-orange-500"
              />
              <button
                onClick={() => applyDebugPreview(debugLevel)}
                className="w-full rounded-[14px] bg-orange-400 px-3 py-2 text-xs font-black text-white shadow-[0_6px_0_rgba(194,101,27,0.18)] active:translate-y-[2px]"
              >
                预览奖励
              </button>
            </div>
          )
        )}
      </div>
    </div>
  );
}
