/**
 * API 类型定义
 *
 * 定义所有 API 请求和响应的数据结构
 */

import type { UserGameData } from '../userData';
import type { ConflictDetail } from '../progressMerge';
import type { LoginMethod } from '../auth';

/**
 * API 响应通用结构
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  meta?: {
    timestamp: number;
    serverVersion: number;
  };
}

/**
 * 游客注册请求
 */
export interface GuestRegisterRequest {
  guestId: string;
  createdAt: number;
}

/**
 * 游客注册响应
 */
export interface GuestRegisterResponse {
  guestId: string;
  serverCreatedAt: number;
}

/**
 * 用户登录请求
 */
export interface LoginRequest {
  phone: string;
  guestId: string;          // 用于关联游客数据
  method: LoginMethod;
  password?: string;        // 密码登录时需要
  code?: string;            // 验证码登录时需要
}

/**
 * 用户登录响应
 */
export interface LoginResponse {
  userId: string;
  phone: string;
  token: string;
  refreshToken: string;
  hasExistingProgress: boolean;  // 是否已有服务器进度
  needMerge: boolean;            // 是否需要合并
  serverData?: UserGameData;     // 服务器已有数据（如果有）
}

/**
 * 发送验证码请求
 */
export interface SendSmsCodeRequest {
  phone: string;
}

/**
 * 发送验证码响应
 */
export interface SendSmsCodeResponse {
  sent: boolean;
  expiresIn: number;  // 验证码有效期（秒）
}

/**
 * 数据同步请求
 */
export interface SyncRequest {
  userId: string;
  token: string;
  clientData: UserGameData;
}

/**
 * 数据同步响应
 */
export interface SyncResponse {
  serverData: UserGameData | null;
  mergedData?: UserGameData;
  syncResult: 'uploaded' | 'downloaded' | 'merged' | 'no_change';
  syncTimestamp: number;
}

/**
 * 进度合并请求
 */
export interface MergeProgressRequest {
  userId: string;
  token: string;
  localData: UserGameData;
}

/**
 * 进度合并响应
 */
export interface MergeProgressResponse {
  mergedData: UserGameData;
  conflicts?: ConflictDetail[];
}

/**
 * 获取用户数据请求
 */
export interface GetUserDataRequest {
  userId: string;
  token: string;
}

/**
 * 获取用户数据响应
 */
export interface GetUserDataResponse {
  data: UserGameData;
  lastUpdated: number;
}