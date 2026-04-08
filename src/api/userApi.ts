/**
 * 用户 API 服务接口
 *
 * 定义用户相关的 API 操作接口
 */

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

/**
 * 用户 API 服务接口
 */
export interface UserApiService {
  /**
   * 游客注册（首次访问时调用）
   */
  registerGuest(request: GuestRegisterRequest): Promise<ApiResponse<GuestRegisterResponse>>;

  /**
   * 用户登录
   */
  login(request: LoginRequest): Promise<ApiResponse<LoginResponse>>;

  /**
   * 发送短信验证码
   */
  sendSmsCode(request: SendSmsCodeRequest): Promise<ApiResponse<SendSmsCodeResponse>>;

  /**
   * 数据同步（上传/下载用户数据）
   */
  sync(request: SyncRequest): Promise<ApiResponse<SyncResponse>>;

  /**
   * 进度合并（游客登录后合并数据）
   */
  mergeProgress(request: MergeProgressRequest): Promise<ApiResponse<MergeProgressResponse>>;

  /**
   * 获取用户数据
   */
  getUserData(request: GetUserDataRequest): Promise<ApiResponse<GetUserDataResponse>>;
}