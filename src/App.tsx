/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import ErrorBoundary from './components/ErrorBoundary';
import MapScreen from './components/MapScreen';
import QuizScreen from './components/QuizScreen';
import ResultScreen from './components/ResultScreen';
import PokedexScreen from './components/PokedexScreen';
import LoginModal from './components/LoginModal';
import { isLevelZeroTutorial } from './components/levelZeroBattle';
import {
  getAttackEffectProfileByName,
  buildLevelZeroRewardCardModel,
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
import { getAutoEquipUpdatesForExpChange } from './progression';
import {
  AUTH_STORAGE_KEY,
  createMockAuthService,
  type AuthState,
  type LoginMethod,
} from './auth';
import { shouldRequireLoginForLevel } from './levelGate';
import { useDebugMode, useStartMode } from './hooks/useDebugMode';
import { needsMigration, migrateToV4 } from './dataMigration';
import {
  UserGameData,
  USER_DATA_STORAGE_KEY,
  createDefaultUserData,
  loadUserData,
  saveUserData,
  createLevelRecord,
  createWrongAnswer,
} from './userData';
import { getOrCreateGuestIdentity } from './guestId';
import { type LevelFinishStats, type WrongAnswerDetail } from './components/QuizScreen';

type Screen = 'map' | 'quiz' | 'result';
type GradeKey = 'k' | '1' | '2' | '3';

interface GradeData {
  unlockedLevels: number[];
  completedLevels: number[];
  puzzlePieces: number;
}

type GameData = Record<GradeKey, GradeData>;

const MAX_LEVELS = 159; // 每个年级159关
const authService = createMockAuthService();

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

export default function App() {
  const isDebugMode = useDebugMode();
  const isStartMode = useStartMode();

  // 直接进入三年级关卡地图
  const [currentScreen, setCurrentScreen] = useState<Screen>('map');
  const [currentGrade, setCurrentGrade] = useState<GradeKey>('3');
  const [stats, setStats] = useState({ accuracy: 0, time: 0, maxCombo: 0 });
  const [currentLevelId, setCurrentLevelId] = useState<number>(1);
  const [showPokedexModal, setShowPokedexModal] = useState(false);
  const [pokedexDefaultTab, setPokedexDefaultTab] = useState<'stage' | 'effect' | 'gem' | 'map'>('stage');
  const [rewardCard, setRewardCard] = useState<RewardCardModel | null>(null);
  const [showRewardCard, setShowRewardCard] = useState(false);
  const [pendingLevelZeroRouteIntro, setPendingLevelZeroRouteIntro] = useState(false);
  const [debugLevel, setDebugLevel] = useState<number>(1);
  const [debugPanelMinimized, setDebugPanelMinimized] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [pendingLevelStart, setPendingLevelStart] = useState<number | null>(null);

  // 使用新的统一数据模型
  const [userData, setUserData] = useState<UserGameData>(() => {
    // ?start 模式：无痕模式，不读取 localStorage，直接使用默认数据
    const params = new URLSearchParams(window.location.search);
    if (params.has('start')) {
      return createDefaultUserData('start-mode-guest');
    }

    // 检查是否需要迁移旧数据
    if (needsMigration()) {
      return migrateToV4();
    }

    // 加载已有数据或创建新数据
    const existing = loadUserData();
    if (existing) {
      return existing;
    }

    // 创建新的游客数据
    const guestIdentity = getOrCreateGuestIdentity();
    return createDefaultUserData(guestIdentity.guestId);
  });

  // 保存 userData 到 localStorage（无痕模式下跳过）
  useEffect(() => {
    if (isStartMode) return; // ?start 模式下不保存到 localStorage
    saveUserData(userData);
  }, [userData, isStartMode]);

  // ?start 参数：直接进入第0关
  useEffect(() => {
    if (!isStartMode) return;
    setCurrentLevelId(0);
    setCurrentScreen('quiz');
  }, [isStartMode]);

  // 从 userData 提取旧格式兼容的数据（渐进式迁移）
  const gameData: GameData = {
    k: userData.grades.k,
    '1': userData.grades['1'],
    '2': userData.grades['2'],
    '3': userData.grades['3'],
  };

  const authState: AuthState = {
    isLoggedIn: userData.identity.type === 'registered',
    loginMethod: userData.identity.loginMethod || null,
    phone: userData.identity.phone || '',
  };

  const selectedBattleStageId = userData.preferences.selectedBattleStageId;
  const selectedBattleEffectName = userData.preferences.selectedBattleEffectName;
  const selectedBattleGemName = userData.preferences.selectedBattleGemName;
  const selectedBattleMapTheme = userData.preferences.selectedBattleMapTheme;

  // 辅助函数：更新偏好设置
  const setSelectedBattleStageId = (id: number) => {
    setUserData((prev: UserGameData) => ({
      ...prev,
      preferences: { ...prev.preferences, selectedBattleStageId: id, updatedAt: Date.now() }
    }));
  };
  const setSelectedBattleEffectName = (name: string) => {
    setUserData((prev: UserGameData) => ({
      ...prev,
      preferences: { ...prev.preferences, selectedBattleEffectName: name, updatedAt: Date.now() }
    }));
  };
  const setSelectedBattleGemName = (name: string) => {
    setUserData((prev: UserGameData) => ({
      ...prev,
      preferences: { ...prev.preferences, selectedBattleGemName: name, updatedAt: Date.now() }
    }));
  };
  const setSelectedBattleMapTheme = (theme: string) => {
    setUserData((prev: UserGameData) => ({
      ...prev,
      preferences: { ...prev.preferences, selectedBattleMapTheme: theme, updatedAt: Date.now() }
    }));
  };

  // 辅助函数：更新年级数据
  const setGameData = (updater: (prev: GameData) => GameData) => {
    setUserData((prev: UserGameData) => {
      const newGameData = updater(gameData);
      return {
        ...prev,
        grades: {
          k: { ...newGameData.k, updatedAt: Date.now() },
          '1': { ...newGameData['1'], updatedAt: Date.now() },
          '2': { ...newGameData['2'], updatedAt: Date.now() },
          '3': { ...newGameData['3'], updatedAt: Date.now() },
        },
      };
    });
  };

  // 辅助函数：更新身份状态
  const setAuthState = (newAuthState: AuthState) => {
    setUserData((prev: UserGameData) => ({
      ...prev,
      identity: {
        ...prev.identity,
        type: newAuthState.isLoggedIn ? 'registered' : 'guest',
        phone: newAuthState.phone,
        loginMethod: newAuthState.loginMethod,
      },
    }));
  };

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

  const handleLevelComplete = (levelStats: LevelFinishStats) => {
    const isLevelZero = isLevelZeroTutorial(currentGrade, currentLevelId);
    const rewardConfig = isLevelZero ? null : getLevelRewardConfig(currentLevelId);
    const totalBefore = currentGradeData.puzzlePieces;
    const totalAfter = rewardConfig ? Math.max(currentGradeData.puzzlePieces, rewardConfig.cumulativeExp) : totalBefore;
    const beforeStage = getGrowthStageByExp(totalBefore);
    const afterStage = getGrowthStageByExp(totalAfter);

    setStats({
      ...levelStats,
      expGained: rewardConfig?.exp ?? 0,
    });

    // 使用 completedLevels 判断是否首次通关
    const isFirstTimeClear = !currentGradeData.completedLevels.includes(currentLevelId);

    // 创建闯关记录
    const levelRecord = createLevelRecord({
      grade: currentGrade,
      levelId: currentLevelId,
      timeTaken: levelStats.time,
      accuracy: levelStats.accuracy,
      totalQuestions: levelStats.totalQuestions,
      correctCount: levelStats.correctCount,
    });

    // 保存闯关记录和错题记录
    setUserData((prev: UserGameData) => {
      const wrongAnswerRecords = levelStats.wrongAnswers.map((wrong: WrongAnswerDetail) =>
        createWrongAnswer({
          recordId: levelRecord.id,
          grade: currentGrade,
          levelId: currentLevelId,
          questionId: wrong.questionId,
          questionText: wrong.questionText,
          correctAnswer: wrong.correctAnswer,
          userAnswer: wrong.userAnswer,
        })
      );

      return {
        ...prev,
        records: {
          levelRecords: [...prev.records.levelRecords, levelRecord],
          wrongAnswers: [...prev.records.wrongAnswers, ...wrongAnswerRecords],
        },
      };
    });

    setGameData((prev: GameData) => {
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
      setRewardCard(
        isLevelZero
          ? buildLevelZeroRewardCardModel(totalBefore, totalAfter)
          : buildRewardCardModel(currentLevelId, totalBefore, totalAfter)
      );
      setShowRewardCard(true);
      if (isLevelZero) {
        setPendingLevelZeroRouteIntro(true);
      }
    }
    const autoEquipUpdates = rewardConfig
      ? getAutoEquipUpdatesForExpChange(totalBefore, totalAfter, {
          getStageIdForExp: (exp) => getGrowthStageByExp(exp).id,
          getEffectNameForExp: (exp) => getCurrentAttackEffect(exp).name,
          getGemNameForExp,
          getMapThemeNameForExp,
        })
      : {};

    if (autoEquipUpdates.stageId !== undefined) {
      setSelectedBattleStageId(autoEquipUpdates.stageId);
    } else if (afterStage.id > beforeStage.id) {
      setSelectedBattleStageId(afterStage.id);
    }
    if (autoEquipUpdates.effectName !== undefined) {
      setSelectedBattleEffectName(autoEquipUpdates.effectName);
    }
    if (autoEquipUpdates.gemName !== undefined) {
      setSelectedBattleGemName(autoEquipUpdates.gemName);
    }
    if (autoEquipUpdates.mapThemeName !== undefined) {
      setSelectedBattleMapTheme(autoEquipUpdates.mapThemeName);
    }
    setCurrentScreen('result');
  };

  const startLevel = (levelId: number) => {
    setRewardCard(null);
    setShowRewardCard(false);
    setCurrentLevelId(levelId);
    setCurrentScreen('quiz');
  };

  const requestStartLevel = (levelId: number) => {
    if (!shouldRequireLoginForLevel(levelId) || authState.isLoggedIn) {
      startLevel(levelId);
      return;
    }

    setPendingLevelStart(levelId);
    setShowLoginModal(true);
  };

  const handleLoginSubmit = async (payload: {
    method: LoginMethod;
    phone: string;
    password?: string;
    code?: string;
  }) => {
    const nextAuthState =
      payload.method === 'password'
        ? await authService.loginWithPassword({
            phone: payload.phone,
            password: payload.password ?? '',
          })
        : await authService.loginWithCode({
            phone: payload.phone,
            code: payload.code ?? '',
          });

    setAuthState(nextAuthState);
    setShowLoginModal(false);

    if (pendingLevelStart !== null) {
      const nextLevel = pendingLevelStart;
      setPendingLevelStart(null);
      startLevel(nextLevel);
    }
  };

  const handleSendCode = async ({ phone }: { phone: string }) => {
    await authService.sendSmsCode({ phone });
  };

  const handleLoginCancel = () => {
    setShowLoginModal(false);
    setPendingLevelStart(null);
  };

  const handleClearLogin = () => {
    // 重置身份为游客
    const guestIdentity = getOrCreateGuestIdentity();
    setUserData((prev: UserGameData) => ({
      ...prev,
      identity: {
        type: 'guest',
        guestId: guestIdentity.guestId,
        createdAt: guestIdentity.createdAt,
      },
    }));
    setShowLoginModal(false);
    setPendingLevelStart(null);
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
  // 直接使用真实数据，正式模式下隐藏第0关
  const effectiveUnlockedLevels = isDebugMode
    ? currentGradeData.unlockedLevels
    : currentGradeData.unlockedLevels.filter((level: number) => level !== 0);
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
    <ErrorBoundary>
    <div className="w-full h-screen bg-white relative overflow-hidden font-sans flex justify-center">
      <div className="w-full h-full relative overflow-hidden xl:max-w-[768px]">
        {currentScreen === 'map' && (
          <MapScreen
            gradeId={currentGrade}
            unlockedLevels={effectiveUnlockedLevels}
            completedLevels={effectiveCompletedLevels}
            puzzlePieces={effectivePuzzlePieces}
            maxLevels={MAX_LEVELS}
            onStart={requestStartLevel}
            onOpenPokedex={() => {
              setPokedexDefaultTab('stage');
              setShowPokedexModal(true);
            }}
            onClearLogin={handleClearLogin}
            showLevelZero={isDebugMode}
            showClearLoginButton={isDebugMode}
            playLevelZeroRouteIntro={pendingLevelZeroRouteIntro}
            onLevelZeroRouteIntroComplete={() => setPendingLevelZeroRouteIntro(false)}
          />
        )}
        {currentScreen === 'quiz' && (
          <QuizScreen
            gradeId={currentGrade}
            levelId={currentLevelId}
            selectedPet={
              isLevelZeroTutorial(currentGrade, currentLevelId)
                ? growthStages.find((stage) => stage.id === 0) ?? growthStages[0]
                : growthStages.find((stage) => stage.id === selectedBattleStageId) ?? growthStages[1]
            }
            attackEffect={getAttackEffectProfileByName(selectedBattleEffectName)}
            gemImage={getGemImage(selectedBattleGemName) ?? getGemImageForExp(effectivePuzzlePieces)}
            backgroundImage={getMapThemeImage(selectedBattleMapTheme) ?? getBattleBackgroundForExp(effectivePuzzlePieces)}
            onFinish={handleLevelComplete}
            onBack={() => setCurrentScreen('map')}
            showDebugTools={isDebugMode}
          />
        )}
        {currentScreen === 'result' && (
          <ResultScreen
            stats={stats}
            onBack={() => setCurrentScreen('map')}
            onNextLevel={() => {
              setPendingLevelZeroRouteIntro(false);
              if (currentLevelId < MAX_LEVELS) {
                requestStartLevel(currentLevelId + 1);
              } else {
                setCurrentScreen('map');
              }
            }}
            onBeginAdventure={() => {
              setCurrentScreen('map');
            }}
            onOpenPokedex={() => {
              setPokedexDefaultTab('stage');
              setShowPokedexModal(true);
            }}
            hasNextLevel={currentLevelId < MAX_LEVELS && effectiveUnlockedLevels.includes(currentLevelId + 1)}
            rewardCard={rewardCard}
            showRewardCard={showRewardCard}
            onCloseRewardCard={() => setShowRewardCard(false)}
            isLevelZeroIntroResult={currentGrade === '3' && currentLevelId === 0}
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

        <LoginModal
          isOpen={showLoginModal}
          pendingLevelId={pendingLevelStart}
          onSubmit={handleLoginSubmit}
          onSendCode={handleSendCode}
          onCancel={handleLoginCancel}
        />

        {isDebugMode && (
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
    </ErrorBoundary>
  );
}
