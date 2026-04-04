/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import MapScreen from './components/MapScreen';
import QuizScreen from './components/QuizScreen';
import ResultScreen from './components/ResultScreen';
import PokedexScreen from './components/PokedexScreen';
import { INITIAL_PET_ID, petsData } from './data/pets';
import {
  buildRewardCardModel,
  getLevelRewardConfig,
  getTotalExpBeforeLevel,
  type RewardCardModel,
} from './data/growthRewards';

type Screen = 'map' | 'quiz' | 'result';
type GradeKey = 'k' | '1' | '2' | '3';

interface GradeData {
  unlockedLevels: number[];
  puzzlePieces: number;
}

type GameData = Record<GradeKey, GradeData>;

const MAX_LEVELS = 50; // 每个年级50关
const INITIAL_GRADE3_UNLOCKS = [0, 1];

const defaultData: GameData = {
  k: { unlockedLevels: [1], puzzlePieces: 0 },
  '1': { unlockedLevels: [1], puzzlePieces: 0 },
  '2': { unlockedLevels: [1], puzzlePieces: 0 },
  '3': { unlockedLevels: INITIAL_GRADE3_UNLOCKS, puzzlePieces: 0 },
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
    },
    '1': {
      ...defaultData['1'],
      ...(data['1'] ?? {}),
      unlockedLevels: normalizeUnlockedLevelsForGrade('1', data['1']?.unlockedLevels ?? defaultData['1'].unlockedLevels),
    },
    '2': {
      ...defaultData['2'],
      ...(data['2'] ?? {}),
      unlockedLevels: normalizeUnlockedLevelsForGrade('2', data['2']?.unlockedLevels ?? defaultData['2'].unlockedLevels),
    },
    '3': {
      ...defaultData['3'],
      ...(data['3'] ?? {}),
      unlockedLevels: normalizeUnlockedLevelsForGrade('3', data['3']?.unlockedLevels ?? defaultData['3'].unlockedLevels),
    },
  };
}

export default function App() {
  // 直接进入三年级关卡地图
  const [currentScreen, setCurrentScreen] = useState<Screen>('map');
  const [currentGrade, setCurrentGrade] = useState<GradeKey>('3');
  const [stats, setStats] = useState({ accuracy: 0, time: 0, maxCombo: 0 });
  const [currentLevelId, setCurrentLevelId] = useState<number>(1);
  const [selectedPetId, setSelectedPetId] = useState<number>(() => {
    const saved = localStorage.getItem('selectedPetId');
    const parsed = saved ? parseInt(saved, 10) : INITIAL_PET_ID;
    return petsData.some((pet) => pet.id === parsed) ? parsed : INITIAL_PET_ID;
  });
  const [showPokedexModal, setShowPokedexModal] = useState(false);
  const [rewardCard, setRewardCard] = useState<RewardCardModel | null>(null);
  const [showRewardCard, setShowRewardCard] = useState(false);
  const [debugLevel, setDebugLevel] = useState<number>(1);
  const [debugPreviewExp, setDebugPreviewExp] = useState<number | null>(null);
  const [debugProgressLevel, setDebugProgressLevel] = useState<number | null>(null);
  const [debugPanelMinimized, setDebugPanelMinimized] = useState(false);

  useEffect(() => {
    localStorage.setItem('selectedPetId', selectedPetId.toString());
  }, [selectedPetId]);

  useEffect(() => {
    if (!petsData.some((pet) => pet.id === selectedPetId)) {
      setSelectedPetId(INITIAL_PET_ID);
    }
  }, [selectedPetId]);

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

  const handleLevelComplete = (levelStats: { accuracy: number; time: number; maxCombo: number }) => {
    const rewardConfig = getLevelRewardConfig(currentLevelId);
    const totalBefore = getTotalExpBeforeLevel(currentLevelId);
    const totalAfter = rewardConfig.cumulativeExp;

    setStats({
      ...levelStats,
      expGained: rewardConfig.exp,
    });

    setGameData(prev => {
      const currentData = prev[currentGrade];
      const newUnlocked = [...currentData.unlockedLevels];

      if (!newUnlocked.includes(currentLevelId)) {
        newUnlocked.push(currentLevelId);
      }

      // 解锁下一关（最多50关）
      if (!newUnlocked.includes(currentLevelId + 1) && currentLevelId < MAX_LEVELS) {
        newUnlocked.push(currentLevelId + 1);
      }

      return {
        ...prev,
        [currentGrade]: {
          unlockedLevels: normalizeUnlockedLevelsForGrade(currentGrade, newUnlocked),
          puzzlePieces: totalAfter
        }
      };
    });

    setRewardCard(buildRewardCardModel(currentLevelId, totalBefore, totalAfter));
    setShowRewardCard(true);
    setDebugPreviewExp(null);
    setDebugProgressLevel(null);
    setCurrentScreen('result');
  };

  const currentGradeData = gameData[currentGrade];
  const realHighestUnlockedLevel = Math.max(
    ...currentGradeData.unlockedLevels.filter((level) => (currentGrade === '3' ? level >= 1 : level >= 1)),
    1
  );
  const buildDebugUnlockedLevels = (level: number) =>
    Array.from({ length: Math.max(0, level) + 1 }, (_, index) => index).filter((value) =>
      currentGrade === '3' ? value <= level : value >= 1 && value <= level
    );

  const setFormalProgressToLevel = (level: number) => {
    const clampedLevel = Math.max(1, Math.min(MAX_LEVELS, level));
    setGameData((prev) => ({
      ...prev,
      [currentGrade]: {
        unlockedLevels: normalizeUnlockedLevelsForGrade(currentGrade, buildDebugUnlockedLevels(clampedLevel)),
        puzzlePieces: getLevelRewardConfig(clampedLevel).cumulativeExp,
      },
    }));
    setCurrentLevelId(clampedLevel);
    setDebugLevel(clampedLevel);
    setDebugProgressLevel(null);
    setDebugPreviewExp(null);
    setRewardCard(null);
    setShowRewardCard(false);
    setCurrentScreen('map');
  };

  const effectiveUnlockedLevels =
    debugProgressLevel !== null
      ? buildDebugUnlockedLevels(debugProgressLevel)
      : currentGradeData.unlockedLevels;

  const effectivePuzzlePieces =
    debugPreviewExp ??
    (debugProgressLevel !== null && debugProgressLevel >= 1
      ? getLevelRewardConfig(debugProgressLevel).cumulativeExp
      : currentGradeData.puzzlePieces);

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
    setDebugPreviewExp(totalAfter);
    setCurrentScreen('result');
  };

  const previewDebugPokedex = () => {
    const clampedLevel = Math.max(1, Math.min(MAX_LEVELS, debugLevel));
    setCurrentLevelId(clampedLevel);
    setDebugPreviewExp(getLevelRewardConfig(clampedLevel).cumulativeExp);
    setShowPokedexModal(true);
  };

  const clearDebugPreview = () => {
    setDebugPreviewExp(null);
    setRewardCard(null);
    setShowRewardCard(false);
    setDebugProgressLevel(null);
  };

  return (
    <div className="w-full h-screen bg-gray-100 flex justify-center items-center overflow-hidden font-sans p-4">
      <div className="w-[768px] h-[1024px] max-w-full max-h-full bg-white relative shadow-xl overflow-visible rounded-[2rem]">
        {currentScreen === 'map' && (
          <MapScreen
            gradeId={currentGrade}
            unlockedLevels={effectiveUnlockedLevels}
            puzzlePieces={effectivePuzzlePieces}
            maxLevels={MAX_LEVELS}
            onStart={(levelId) => {
              setRewardCard(null);
              setShowRewardCard(false);
              setDebugProgressLevel(null);
              setDebugPreviewExp(null);
              setCurrentLevelId(levelId);
              setCurrentScreen('quiz');
            }}
            onOpenPokedex={() => setShowPokedexModal(true)}
          />
        )}
        {currentScreen === 'quiz' && (
          <QuizScreen
            gradeId={currentGrade}
            levelId={currentLevelId}
            selectedPet={petsData.find(p => p.id === selectedPetId) || petsData[0]}
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
                setDebugPreviewExp(null);
                setCurrentLevelId(currentLevelId + 1);
                setCurrentScreen('quiz');
              } else {
                setCurrentScreen('map');
              }
            }}
            onOpenPokedex={() => setShowPokedexModal(true)}
            hasNextLevel={currentLevelId < MAX_LEVELS && effectiveUnlockedLevels.includes(currentLevelId + 1)}
            rewardCard={rewardCard}
            showRewardCard={showRewardCard}
            onCloseRewardCard={() => setShowRewardCard(false)}
          />
        )}

        <PokedexScreen
          isOpen={showPokedexModal}
          puzzlePieces={effectivePuzzlePieces}
          onClose={() => setShowPokedexModal(false)}
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
              <div className="mb-2 text-sm font-black text-slate-700">第 {debugLevel} 关</div>
              <div className="mb-2 text-[11px] font-bold text-slate-500">真实进度：第 {realHighestUnlockedLevel} 关</div>
              <input
                type="range"
                min={1}
                max={50}
                value={debugLevel}
                onChange={(event) => setDebugLevel(Number(event.target.value))}
                className="mb-3 w-full accent-orange-500"
              />
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setDebugProgressLevel(debugLevel);
                    setDebugPreviewExp(null);
                    setCurrentLevelId(debugLevel);
                    setCurrentScreen('map');
                  }}
                  className="rounded-[14px] bg-violet-400 px-3 py-2 text-xs font-black text-white shadow-[0_6px_0_rgba(109,40,217,0.18)] active:translate-y-[2px]"
                >
                  预览进度
                </button>
                <button
                  onClick={() => applyDebugPreview(debugLevel)}
                  className="rounded-[14px] bg-orange-400 px-3 py-2 text-xs font-black text-white shadow-[0_6px_0_rgba(194,101,27,0.18)] active:translate-y-[2px]"
                >
                  预览奖励
                </button>
                <button
                  onClick={previewDebugPokedex}
                  className="rounded-[14px] bg-sky-400 px-3 py-2 text-xs font-black text-white shadow-[0_6px_0_rgba(41,128,182,0.18)] active:translate-y-[2px]"
                >
                  预览图鉴
                </button>
                <button
                  onClick={() => {
                    setDebugProgressLevel(50);
                    setDebugPreviewExp(null);
                    setDebugLevel(50);
                    setCurrentLevelId(50);
                    setCurrentScreen('map');
                  }}
                  className="rounded-[14px] bg-emerald-400 px-3 py-2 text-xs font-black text-white shadow-[0_6px_0_rgba(5,150,105,0.18)] active:translate-y-[2px]"
                >
                  直达50关
                </button>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <button
                  onClick={() => setFormalProgressToLevel(debugLevel)}
                  className="rounded-[14px] bg-fuchsia-400 px-3 py-2 text-xs font-black text-white shadow-[0_6px_0_rgba(192,38,211,0.18)] active:translate-y-[2px]"
                >
                  设为正式进度
                </button>
                <button
                  onClick={() => setFormalProgressToLevel(1)}
                  className="rounded-[14px] bg-rose-400 px-3 py-2 text-xs font-black text-white shadow-[0_6px_0_rgba(225,29,72,0.18)] active:translate-y-[2px]"
                >
                  重置到1关
                </button>
              </div>
              <button
                onClick={clearDebugPreview}
                className="mt-2 w-full rounded-[14px] bg-slate-100 px-3 py-2 text-xs font-black text-slate-600"
              >
                清除预览
              </button>
            </div>
          )
        )}
      </div>
    </div>
  );
}
