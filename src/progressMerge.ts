/**
 * 进度合并策略
 *
 * 当游客登录时，如果服务器已有进度数据，需要合并本地和服务器进度。
 *
 * 合并策略：
 * - 已完成关卡：取合集（两边都算成就）
 * - 解锁关卡：取最大值
 * - 经验值：取最大值
 * - 偏好设置：优先本地（用户习惯）
 */

import { UserGameData, GradeProgress, GradeKey } from './userData';

/**
 * 冲突详情
 */
export interface ConflictDetail {
  field: string;
  localValue: number;
  serverValue: number;
  resolvedValue: number;
  resolution: 'merged' | 'local' | 'server';
}

/**
 * 合并结果
 */
export interface MergeResult {
  grades: Record<GradeKey, GradeProgress>;
  preferences: UserGameData['preferences'];
  mergedFrom: 'local' | 'server' | 'both';
  conflictDetails: ConflictDetail[];
}

/**
 * 构建解锁关卡列表
 * 根据最大解锁关卡生成完整的解锁列表
 */
function buildUnlockedLevels(grade: GradeKey, maxLevel: number): number[] {
  if (maxLevel <= 0) {
    return grade === '3' ? [0, 1] : [1];
  }

  const levels = Array.from({ length: maxLevel }, (_, i) => i + 1);
  return grade === '3' ? [0, ...levels] : levels;
}

/**
 * 合并单个年级的进度数据
 */
function mergeGradeProgress(
  grade: GradeKey,
  localGrade: GradeProgress,
  serverGrade: GradeProgress,
  conflictDetails: ConflictDetail[]
): GradeProgress {
  // 已完成关卡取合集
  const completedSet = new Set([...localGrade.completedLevels, ...serverGrade.completedLevels]);
  const mergedCompleted = Array.from(completedSet).sort((a, b) => a - b);

  // 解锁关卡取最大值
  const maxLocalUnlocked = Math.max(...localGrade.unlockedLevels, 1);
  const maxServerUnlocked = Math.max(...serverGrade.unlockedLevels, 1);
  const mergedMaxUnlocked = Math.max(maxLocalUnlocked, maxServerUnlocked);
  const mergedUnlocked = buildUnlockedLevels(grade, mergedMaxUnlocked);

  // 经验值取最大值
  const mergedPuzzlePieces = Math.max(localGrade.puzzlePieces, serverGrade.puzzlePieces);

  // 记录经验值冲突（如果有差异）
  if (localGrade.puzzlePieces !== serverGrade.puzzlePieces) {
    conflictDetails.push({
      field: `grades.${grade}.puzzlePieces`,
      localValue: localGrade.puzzlePieces,
      serverValue: serverGrade.puzzlePieces,
      resolvedValue: mergedPuzzlePieces,
      resolution: 'merged',
    });
  }

  // 记录完成关卡差异
  if (localGrade.completedLevels.length !== serverGrade.completedLevels.length) {
    conflictDetails.push({
      field: `grades.${grade}.completedLevels`,
      localValue: localGrade.completedLevels.length,
      serverValue: serverGrade.completedLevels.length,
      resolvedValue: mergedCompleted.length,
      resolution: 'merged',
    });
  }

  return {
    unlockedLevels: mergedUnlocked,
    completedLevels: mergedCompleted,
    puzzlePieces: mergedPuzzlePieces,
    updatedAt: Date.now(),
  };
}

/**
 * 合并偏好设置
 * 优先使用本地设置（用户已习惯）
 */
function mergePreferences(
  localPrefs: UserGameData['preferences'],
  serverPrefs: UserGameData['preferences'] | undefined
): UserGameData['preferences'] {
  // 如果没有服务器偏好设置，使用本地
  if (!serverPrefs) {
    return localPrefs;
  }

  // 偏好设置优先本地
  return {
    selectedBattleStageId: localPrefs.selectedBattleStageId,
    selectedBattleEffectName: localPrefs.selectedBattleEffectName,
    selectedBattleGemName: localPrefs.selectedBattleGemName,
    selectedBattleMapTheme: localPrefs.selectedBattleMapTheme,
    updatedAt: Date.now(),
  };
}

/**
 * 合并游客进度和账号进度
 *
 * @param localData 本地数据（游客进度）
 * @param serverData 服务器数据（账号进度），null 表示服务器无数据
 * @returns 合并结果
 */
export function mergeProgressData(
  localData: UserGameData,
  serverData: UserGameData | null
): MergeResult {
  // 如果没有服务器数据，直接返回本地数据
  if (!serverData) {
    return {
      grades: localData.grades,
      preferences: localData.preferences,
      mergedFrom: 'local',
      conflictDetails: [],
    };
  }

  const mergedGrades: Record<GradeKey, GradeProgress> = {} as Record<GradeKey, GradeProgress>;
  const conflictDetails: ConflictDetail[] = [];

  // 合并各年级数据
  const gradeKeys: GradeKey[] = ['k', '1', '2', '3'];
  for (const key of gradeKeys) {
    mergedGrades[key] = mergeGradeProgress(
      key,
      localData.grades[key],
      serverData.grades[key],
      conflictDetails
    );
  }

  // 合并偏好设置
  const mergedPreferences = mergePreferences(localData.preferences, serverData.preferences);

  return {
    grades: mergedGrades,
    preferences: mergedPreferences,
    mergedFrom: 'both',
    conflictDetails,
  };
}

/**
 * 获取进度摘要（用于显示对比）
 */
export interface ProgressSummary {
  grade: GradeKey;
  completedCount: number;
  maxUnlockedLevel: number;
  puzzlePieces: number;
}

export function getProgressSummary(data: UserGameData): ProgressSummary[] {
  const gradeKeys: GradeKey[] = ['k', '1', '2', '3'];

  return gradeKeys.map(grade => {
    const gradeData = data.grades[grade];
    return {
      grade,
      completedCount: gradeData.completedLevels.length,
      maxUnlockedLevel: Math.max(...gradeData.unlockedLevels),
      puzzlePieces: gradeData.puzzlePieces,
    };
  });
}

/**
 * 判断是否需要显示合并确认弹窗
 * 当本地和服务器都有进度且存在差异时需要确认
 */
export function shouldShowMergeConfirm(
  localData: UserGameData,
  serverData: UserGameData | null
): boolean {
  if (!serverData) {
    return false;
  }

  // 检查是否有本地进度（玩了任何关卡）
  const hasLocalProgress = Object.values(localData.grades).some(
    grade => grade.completedLevels.length > 0 || grade.puzzlePieces > 0
  );

  // 检查是否有服务器进度
  const hasServerProgress = Object.values(serverData.grades).some(
    grade => grade.completedLevels.length > 0 || grade.puzzlePieces > 0
  );

  // 两边都有进度才需要确认
  return hasLocalProgress && hasServerProgress;
}