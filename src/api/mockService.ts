/**
 * Mock API 服务实现
 *
 * 开发阶段使用的模拟 API 服务
 * 后端对接后替换为真实实现
 */

import type { UserApiService } from './userApi';
import type {
  ApiResponse,
  GuestRegisterRequest,
  GuestRegisterResponse,
  LoginRequest,
  LoginResponse,
  SendSmsCodeRequest,
  SendSmsCodeResponse,
  SyncRequest,
  SyncResponse,
  MergeProgressRequest,
  MergeProgressResponse,
  GetUserDataRequest,
  GetUserDataResponse,
} from './types';
import type { UserGameData } from '../userData';
import { mergeProgressData } from '../progressMerge';

/**
 * 模拟延迟
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 创建 Mock API 服务
 *
 * 使用内存 Map 存储数据，模拟服务器行为
 */
export function createMockUserApiService(): UserApiService {
  // 内存数据存储（模拟服务器数据库）
  const userDataStore = new Map<string, UserGameData>();
  const guestDataStore = new Map<string, { guestId: string; createdAt: number }>();

  return {
    /**
     * 游客注册
     */
    async registerGuest(request: GuestRegisterRequest): Promise<ApiResponse<GuestRegisterResponse>> {
      await delay(300);

      // 检查是否已注册
      if (guestDataStore.has(request.guestId)) {
        const existing = guestDataStore.get(request.guestId)!;
        return {
          success: true,
          data: {
            guestId: existing.guestId,
            serverCreatedAt: existing.createdAt,
          },
        };
      }

      // 新注册
      guestDataStore.set(request.guestId, {
        guestId: request.guestId,
        createdAt: request.createdAt,
      });

      return {
        success: true,
        data: {
          guestId: request.guestId,
          serverCreatedAt: Date.now(),
        },
      };
    },

    /**
     * 用户登录
     */
    async login(request: LoginRequest): Promise<ApiResponse<LoginResponse>> {
      await delay(400);

      const userId = `user_${request.phone}`;
      const hasExisting = userDataStore.has(userId);
      const existingData = userDataStore.get(userId);

      return {
        success: true,
        data: {
          userId,
          phone: request.phone,
          token: `mock_token_${userId}_${Date.now()}`,
          refreshToken: `mock_refresh_${userId}`,
          hasExistingProgress: hasExisting,
          needMerge: hasExisting,
          serverData: existingData,
        },
      };
    },

    /**
     * 发送短信验证码
     */
    async sendSmsCode(request: SendSmsCodeRequest): Promise<ApiResponse<SendSmsCodeResponse>> {
      await delay(250);

      // 模拟发送成功
      console.log(`[Mock API] 验证码已发送到 ${request.phone}: 123456`);

      return {
        success: true,
        data: {
          sent: true,
          expiresIn: 300, // 5分钟有效期
        },
      };
    },

    /**
     * 数据同步
     */
    async sync(request: SyncRequest): Promise<ApiResponse<SyncResponse>> {
      await delay(500);

      const existing = userDataStore.get(request.userId);

      if (!existing) {
        // 首次同步，上传数据
        userDataStore.set(request.userId, request.clientData);
        return {
          success: true,
          data: {
            serverData: null,
            syncResult: 'uploaded',
            syncTimestamp: Date.now(),
          },
        };
      }

      // 已有数据，返回服务器数据供客户端合并
      return {
        success: true,
        data: {
          serverData: existing,
          syncResult: 'downloaded',
          syncTimestamp: Date.now(),
        },
      };
    },

    /**
     * 进度合并
     */
    async mergeProgress(request: MergeProgressRequest): Promise<ApiResponse<MergeProgressResponse>> {
      await delay(600);

      const existing = userDataStore.get(request.userId);

      if (!existing) {
        // 服务器无数据，直接存储客户端数据
        userDataStore.set(request.userId, request.localData);
        return {
          success: true,
          data: {
            mergedData: request.localData,
            conflicts: [],
          },
        };
      }

      // 执行合并
      const result = mergeProgressData(request.localData, existing);

      // 更新身份为已注册
      const mergedData: UserGameData = {
        ...request.localData,
        identity: {
          ...request.localData.identity,
          type: 'registered',
        },
        grades: result.grades,
        preferences: result.preferences,
        version: request.localData.version,
      };

      // 存储合并后的数据
      userDataStore.set(request.userId, mergedData);

      return {
        success: true,
        data: {
          mergedData,
          conflicts: result.conflictDetails,
        },
      };
    },

    /**
     * 获取用户数据
     */
    async getUserData(request: GetUserDataRequest): Promise<ApiResponse<GetUserDataResponse>> {
      await delay(300);

      const data = userDataStore.get(request.userId);

      if (!data) {
        return {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: '用户数据不存在',
          },
        };
      }

      return {
        success: true,
        data: {
          data,
          lastUpdated: Date.now(),
        },
      };
    },
  };
}

/**
 * 创建空 API 服务（无后端时的降级方案）
 *
 * 所有操作都返回本地成功，不实际调用服务器
 */
export function createNullUserApiService(): UserApiService {
  return {
    async registerGuest(request) {
      return {
        success: true,
        data: {
          guestId: request.guestId,
          serverCreatedAt: Date.now(),
        },
      };
    },

    async login(request) {
      return {
        success: true,
        data: {
          userId: `user_${request.phone}`,
          phone: request.phone,
          token: '',
          refreshToken: '',
          hasExistingProgress: false,
          needMerge: false,
        },
      };
    },

    async sendSmsCode() {
      return {
        success: true,
        data: {
          sent: true,
          expiresIn: 300,
        },
      };
    },

    async sync() {
      return {
        success: true,
        data: {
          serverData: null,
          syncResult: 'no_change',
          syncTimestamp: Date.now(),
        },
      };
    },

    async mergeProgress(request) {
      return {
        success: true,
        data: {
          mergedData: request.localData,
          conflicts: [],
        },
      };
    },

    async getUserData() {
      return {
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: '用户数据不存在',
        },
      };
    },
  };
}