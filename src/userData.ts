/**
 * 统一用户数据模型
 *
 * 将原本分散的 localStorage 数据（gameData、authState、preferences）
 * 整合为一个统一的数据结构，便于管理和API对接
 */

import type { LoginMethod } from './auth';

export type UserType = 'guest' | 'registered';

export type GradeKey = 'k' | '1' | '2' | '3';

/**
 * 用户身份信息
 */
export interface UserIdentity {
  type: UserType;
  guestId: string;           // 游客ID（始终存在）
  registeredId?: string;     // 注册用户ID（登录后存在，暂用手机号）
  phone?: string;            // 手机号（登录后存在）
  loginMethod?: LoginMethod; // 登录方式（登录后存在）
  createdAt: number;         // 首次创建时间
  lastSyncAt?: number;       // 最后同步时间（API对接后使用）
}

/**
 * 年级进度数据
 */
export interface GradeProgress {
  unlockedLevels: number[];
  completedLevels: number[];
  puzzlePieces: number;
  updatedAt: number;         // 更新时间戳
}

/**
 * 用户偏好设置
 */
export interface UserPreferences {
  selectedBattleStageId: number;
  selectedBattleEffectName: string;
  selectedBattleGemName: string;
  selectedBattleMapTheme: string;
  updatedAt: number;
}

/**
 * 闯关记录
 * 记录每次完成关卡的信息
 */
export interface LevelRecord {
  id: string;                // 记录唯一ID
  grade: GradeKey;           // 年级
  levelId: number;           // 关卡号（包括第0关）
  completedAt: number;       // 完成时间戳
  timeTaken: number;         // 通关用时（秒）
  accuracy: number;          // 正确率（0-100）
  totalQuestions: number;    // 总题数
  correctCount: number;      // 正确题数
  wrongCount: number;        // 错误题数
}

/**
 * 错题记录
 * 记录每道错题的详情
 */
export interface WrongAnswer {
  id: string;                // 记录唯一ID
  recordId: string;          // 关联的闯关记录ID
  grade: GradeKey;           // 年级
  levelId: number;           // 关卡号
  questionId: string;        // 题目ID
  questionText: string;      // 题干描述
  correctAnswer: string;     // 正确答案
  userAnswer: string;        // 用户答案
  createdAt: number;         // 创建时间戳
}

/**
 * 用户游戏记录
 */
export interface UserRecords {
  levelRecords: LevelRecord[];      // 闯关记录
  wrongAnswers: WrongAnswer[];       // 错题记录
}

/**
 * 用户完整数据
 */
export interface UserGameData {
  identity: UserIdentity;
  grades: Record<GradeKey, GradeProgress>;
  preferences: UserPreferences;
  records: UserRecords;              // 游戏记录
  version: number;           // 数据版本号，用于迁移
}

/** 数据版本号 */
export const DATA_VERSION = 5;

/** 新数据存储键 */
export const USER_DATA_STORAGE_KEY = 'userDataV4'; // 保持键名不变，便于迁移

/**
 * 创建默认年级进度
 */
export function createDefaultGradeProgress(): GradeProgress {
  return {
    unlockedLevels: [1],
    completedLevels: [],
    puzzlePieces: 0,
    updatedAt: Date.now(),
  };
}

/**
 * 创建三年级默认进度（包含关卡0）
 */
export function createGrade3DefaultProgress(): GradeProgress {
  return {
    unlockedLevels: [0, 1],
    completedLevels: [],
    puzzlePieces: 0,
    updatedAt: Date.now(),
  };
}

/**
 * 创建默认用户数据
 */
export function createDefaultUserData(guestId: string): UserGameData {
  const now = Date.now();
  return {
    identity: {
      type: 'guest',
      guestId,
      createdAt: now,
    },
    grades: {
      k: createDefaultGradeProgress(),
      '1': createDefaultGradeProgress(),
      '2': createDefaultGradeProgress(),
      '3': createGrade3DefaultProgress(),
    },
    preferences: {
      selectedBattleStageId: 1,
      selectedBattleEffectName: '晨火I',
      selectedBattleGemName: '静思石',
      selectedBattleMapTheme: '起光原野',
      updatedAt: now,
    },
    records: {
      levelRecords: [],
      wrongAnswers: [],
    },
    version: DATA_VERSION,
  };
}

/**
 * 验证是否为有效的用户数据对象
 */
export function isValidUserGameData(value: unknown): value is UserGameData {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<UserGameData>;
  return (
    candidate.identity !== undefined &&
    typeof candidate.identity.guestId === 'string' &&
    candidate.grades !== undefined &&
    candidate.preferences !== undefined
  );
}

/**
 * 迁移用户数据到最新版本
 * 确保数据结构完整
 */
export function migrateUserData(data: UserGameData): UserGameData {
  // 如果没有 records 字段，添加默认值
  if (!data.records) {
    data.records = {
      levelRecords: [],
      wrongAnswers: [],
    };
  }

  // 更新版本号
  data.version = DATA_VERSION;

  return data;
}

/**
 * 保存用户数据到 localStorage
 */
export function saveUserData(data: UserGameData): void {
  localStorage.setItem(USER_DATA_STORAGE_KEY, JSON.stringify(data));
}

/**
 * 从 localStorage 加载用户数据
 */
export function loadUserData(): UserGameData | null {
  const saved = localStorage.getItem(USER_DATA_STORAGE_KEY);
  if (!saved) return null;

  try {
    const parsed = JSON.parse(saved);
    if (isValidUserGameData(parsed)) {
      // 迁移到最新版本
      return migrateUserData(parsed);
    }
  } catch {
    // 解析失败
  }

  return null;
}

/**
 * 清除用户数据（用于测试或完全重置）
 */
export function clearUserData(): void {
  localStorage.removeItem(USER_DATA_STORAGE_KEY);
}

/**
 * 生成记录ID
 */
export function generateRecordId(): string {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * 创建闯关记录
 */
export function createLevelRecord(params: {
  grade: GradeKey;
  levelId: number;
  timeTaken: number;
  accuracy: number;
  totalQuestions: number;
  correctCount: number;
}): LevelRecord {
  const wrongCount = params.totalQuestions - params.correctCount;
  return {
    id: generateRecordId(),
    grade: params.grade,
    levelId: params.levelId,
    completedAt: Date.now(),
    timeTaken: params.timeTaken,
    accuracy: params.accuracy,
    totalQuestions: params.totalQuestions,
    correctCount: params.correctCount,
    wrongCount,
  };
}

/**
 * 创建错题记录
 */
export function createWrongAnswer(params: {
  recordId: string;
  grade: GradeKey;
  levelId: number;
  questionId: string;
  questionText: string;
  correctAnswer: string;
  userAnswer: string;
}): WrongAnswer {
  return {
    id: generateRecordId(),
    recordId: params.recordId,
    grade: params.grade,
    levelId: params.levelId,
    questionId: params.questionId,
    questionText: params.questionText,
    correctAnswer: params.correctAnswer,
    userAnswer: params.userAnswer,
    createdAt: Date.now(),
  };
}