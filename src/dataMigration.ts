/**
 * 数据迁移逻辑
 *
 * 从旧版本数据（gameDataV3、authStateV1、分散的preferences）
 * 迁移到新版本统一数据结构（userDataV4）
 */

import { getOrCreateGuestIdentity, GUEST_ID_STORAGE_KEY } from './guestId';
import {
  UserGameData,
  GradeProgress,
  GradeKey,
  DATA_VERSION,
  USER_DATA_STORAGE_KEY,
  createDefaultGradeProgress,
  createGrade3DefaultProgress,
} from './userData';
import { AUTH_STORAGE_KEY } from './auth';

/** 旧版本数据存储键 */
const OLD_GAME_DATA_KEY = 'gameDataV3';
const OLD_BATTLE_STAGE_KEY = 'selectedBattleStageId';
const OLD_BATTLE_EFFECT_KEY = 'selectedBattleEffectName';
const OLD_BATTLE_GEM_KEY = 'selectedBattleGemName';
const OLD_BATTLE_THEME_KEY = 'selectedBattleMapTheme';

/**
 * 旧版本年级数据结构（无 updatedAt 字段）
 */
interface OldGradeData {
  unlockedLevels: number[];
  completedLevels: number[];
  puzzlePieces: number;
}

interface OldGameData {
  k?: OldGradeData;
  '1'?: OldGradeData;
  '2'?: OldGradeData;
  '3'?: OldGradeData;
}

interface OldAuthState {
  isLoggedIn: boolean;
  loginMethod: 'password' | 'code' | null;
  phone: string;
}

/**
 * 转换旧年级数据到新格式
 */
function convertOldGradeData(oldData: OldGradeData | undefined, grade: GradeKey): GradeProgress {
  const defaultProgress = grade === '3' ? createGrade3DefaultProgress() : createDefaultGradeProgress();

  if (!oldData) {
    return defaultProgress;
  }

  return {
    unlockedLevels: oldData.unlockedLevels ?? defaultProgress.unlockedLevels,
    completedLevels: oldData.completedLevels ?? defaultProgress.completedLevels,
    puzzlePieces: oldData.puzzlePieces ?? defaultProgress.puzzlePieces,
    updatedAt: Date.now(),
  };
}

/**
 * 归一化解锁关卡列表
 * 确保关卡列表格式正确
 */
function normalizeUnlockedLevelsForGrade(grade: GradeKey, levels: number[]): number[] {
  if (grade === '3') {
    // 三年级包含关卡 0
    const hasZero = levels.includes(0);
    const positiveLevels = levels.filter(l => l > 0);
    const sorted = [...new Set(positiveLevels)].sort((a, b) => a - b);
    return hasZero ? [0, ...sorted] : sorted;
  } else {
    // 其他年级只有正数关卡
    const sorted = [...new Set(levels.filter(l => l > 0))].sort((a, b) => a - b);
    return sorted.length > 0 ? sorted : [1];
  }
}

/**
 * 迁移偏好设置
 */
function migratePreferences(): UserGameData['preferences'] {
  const now = Date.now();

  const selectedBattleStageId = (() => {
    const saved = localStorage.getItem(OLD_BATTLE_STAGE_KEY);
    const parsed = saved ? parseInt(saved, 10) : 1;
    return parsed >= 1 && parsed <= 8 ? parsed : 1;
  })();

  const selectedBattleEffectName = localStorage.getItem(OLD_BATTLE_EFFECT_KEY) || '晨火I';
  const selectedBattleGemName = localStorage.getItem(OLD_BATTLE_GEM_KEY) || '静思石';
  const selectedBattleMapTheme = localStorage.getItem(OLD_BATTLE_THEME_KEY) || '起光原野';

  return {
    selectedBattleStageId,
    selectedBattleEffectName,
    selectedBattleGemName,
    selectedBattleMapTheme,
    updatedAt: now,
  };
}

/**
 * 从旧版本数据迁移到新版本
 *
 * 迁移流程：
 * 1. 获取或创建游客身份
 * 2. 读取旧游戏数据并转换
 * 3. 读取旧认证状态并转换身份
 * 4. 清理旧数据
 * 5. 保存新数据
 */
export function migrateToV4(): UserGameData {
  // 1. 获取或创建游客身份
  const guestIdentity = getOrCreateGuestIdentity();

  // 2. 读取旧游戏数据
  let grades: Record<GradeKey, GradeProgress>;
  const oldGameDataStr = localStorage.getItem(OLD_GAME_DATA_KEY);

  if (oldGameDataStr) {
    try {
      const oldGameData: OldGameData = JSON.parse(oldGameDataStr);
      grades = {
        k: convertOldGradeData(oldGameData.k, 'k'),
        '1': convertOldGradeData(oldGameData['1'], '1'),
        '2': convertOldGradeData(oldGameData['2'], '2'),
        '3': convertOldGradeData(oldGameData['3'], '3'),
      };

      // 归一化解锁关卡
      for (const grade of ['k', '1', '2', '3'] as GradeKey[]) {
        grades[grade].unlockedLevels = normalizeUnlockedLevelsForGrade(grade, grades[grade].unlockedLevels);
      }
    } catch {
      grades = {
        k: createDefaultGradeProgress(),
        '1': createDefaultGradeProgress(),
        '2': createDefaultGradeProgress(),
        '3': createGrade3DefaultProgress(),
      };
    }
  } else {
    grades = {
      k: createDefaultGradeProgress(),
      '1': createDefaultGradeProgress(),
      '2': createDefaultGradeProgress(),
      '3': createGrade3DefaultProgress(),
    };
  }

  // 3. 读取旧认证状态
  let identity: UserGameData['identity'] = {
    type: 'guest',
    guestId: guestIdentity.guestId,
    createdAt: guestIdentity.createdAt,
  };

  const oldAuthStateStr = localStorage.getItem(AUTH_STORAGE_KEY);
  if (oldAuthStateStr) {
    try {
      const oldAuthState: OldAuthState = JSON.parse(oldAuthStateStr);
      if (oldAuthState.isLoggedIn && oldAuthState.phone) {
        identity = {
          type: 'registered',
          guestId: guestIdentity.guestId,
          registeredId: oldAuthState.phone, // 暂用手机号作为注册ID
          phone: oldAuthState.phone,
          loginMethod: oldAuthState.loginMethod,
          createdAt: guestIdentity.createdAt,
        };
      }
    } catch {
      // 保持游客身份
    }
  }

  // 4. 迁移偏好设置
  const preferences = migratePreferences();

  // 5. 构建新数据
  const userData: UserGameData = {
    identity,
    grades,
    preferences,
    records: {
      levelRecords: [],
      wrongAnswers: [],
    },
    version: DATA_VERSION,
  };

  // 6. 清理旧数据
  localStorage.removeItem(OLD_GAME_DATA_KEY);
  localStorage.removeItem(AUTH_STORAGE_KEY);
  localStorage.removeItem(OLD_BATTLE_STAGE_KEY);
  localStorage.removeItem(OLD_BATTLE_EFFECT_KEY);
  localStorage.removeItem(OLD_BATTLE_GEM_KEY);
  localStorage.removeItem(OLD_BATTLE_THEME_KEY);

  // 7. 保存新数据
  localStorage.setItem(USER_DATA_STORAGE_KEY, JSON.stringify(userData));

  return userData;
}

/**
 * 检查是否需要迁移
 */
export function needsMigration(): boolean {
  // 如果已有新版本数据，不需要迁移
  if (localStorage.getItem(USER_DATA_STORAGE_KEY)) {
    return false;
  }

  // 如果有旧版本数据，需要迁移
  return Boolean(
    localStorage.getItem(OLD_GAME_DATA_KEY) ||
    localStorage.getItem(AUTH_STORAGE_KEY) ||
    localStorage.getItem(OLD_BATTLE_STAGE_KEY) ||
    localStorage.getItem(GUEST_ID_STORAGE_KEY) // 已有游客身份也需要迁移
  );
}