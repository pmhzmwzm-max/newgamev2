/**
 * 游客ID生成和管理
 *
 * ID格式: guest_{timestamp36}_{uuid8}
 * 示例: guest_m4q2r8_a1b2c3d4
 */

export interface GuestIdentity {
  guestId: string;
  createdAt: number;
  lastActiveAt: number;
}

export const GUEST_ID_STORAGE_KEY = 'guestIdentityV1';

/**
 * 生成游客唯一ID
 * 使用时间戳(36进制) + UUID前8位组合
 */
export function generateGuestId(): string {
  const timestamp = Date.now().toString(36);
  const uuidPart = crypto.randomUUID().slice(0, 8);
  return `guest_${timestamp}_${uuidPart}`;
}

/**
 * 验证是否为有效的游客身份对象
 */
function isGuestIdentity(value: unknown): value is GuestIdentity {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<GuestIdentity>;
  return (
    typeof candidate.guestId === 'string' &&
    candidate.guestId.startsWith('guest_') &&
    typeof candidate.createdAt === 'number' &&
    typeof candidate.lastActiveAt === 'number'
  );
}

/**
 * 初始化或获取游客身份
 * - 如果已有存储的游客身份，则更新最后活跃时间并返回
 * - 如果没有，则创建新的游客身份
 */
export function getOrCreateGuestIdentity(): GuestIdentity {
  const saved = localStorage.getItem(GUEST_ID_STORAGE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (isGuestIdentity(parsed)) {
        // 更新最后活跃时间
        const updated: GuestIdentity = {
          ...parsed,
          lastActiveAt: Date.now(),
        };
        localStorage.setItem(GUEST_ID_STORAGE_KEY, JSON.stringify(updated));
        return updated;
      }
    } catch {
      // 解析失败，创建新的
    }
  }

  // 创建新的游客身份
  const newIdentity: GuestIdentity = {
    guestId: generateGuestId(),
    createdAt: Date.now(),
    lastActiveAt: Date.now(),
  };
  localStorage.setItem(GUEST_ID_STORAGE_KEY, JSON.stringify(newIdentity));
  return newIdentity;
}

/**
 * 清除游客身份（用于测试或完全重置）
 */
export function clearGuestIdentity(): void {
  localStorage.removeItem(GUEST_ID_STORAGE_KEY);
}