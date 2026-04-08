/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';

/**
 * 通过 URL 参数控制调试模式
 * 正式环境：无参数 → isDebugMode = false
 * 调试模式：?debug=1 → isDebugMode = true
 */
export function useDebugMode(): boolean {
  const [isDebugMode, setIsDebugMode] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('debug') === '1';
  });

  useEffect(() => {
    const checkDebugParam = () => {
      const params = new URLSearchParams(window.location.search);
      setIsDebugMode(params.get('debug') === '1');
    };

    // 监听 URL 变化（支持动态切换）
    window.addEventListener('popstate', checkDebugParam);
    return () => window.removeEventListener('popstate', checkDebugParam);
  }, []);

  return isDebugMode;
}

/**
 * 通过 URL 参数检测全新用户启动模式
 * ?start → isStartMode = true（全新用户，清除数据，进入第0关）
 */
export function useStartMode(): boolean {
  const [isStartMode, setIsStartMode] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.has('start');
  });

  useEffect(() => {
    const checkStartParam = () => {
      const params = new URLSearchParams(window.location.search);
      setIsStartMode(params.has('start'));
    };

    window.addEventListener('popstate', checkStartParam);
    return () => window.removeEventListener('popstate', checkStartParam);
  }, []);

  return isStartMode;
}