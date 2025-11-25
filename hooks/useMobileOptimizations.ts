import { useCallback, useRef, useEffect } from 'react';

/**
 * 节流Hook - 限制函数执行频率
 * @param callback 要节流的函数
 * @param delay 延迟时间（毫秒）
 * @returns 节流后的函数
 */
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  const lastRun = useRef(Date.now());
  const timeoutRef = useRef<NodeJS.Timeout>();

  return useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();

      if (now - lastRun.current >= delay) {
        callback(...args);
        lastRun.current = now;
      } else {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
          callback(...args);
          lastRun.current = Date.now();
        }, delay - (now - lastRun.current));
      }
    },
    [callback, delay]
  );
}

/**
 * 防抖Hook - 延迟执行函数直到停止调用
 * @param callback 要防抖的函数
 * @param delay 延迟时间（毫秒）
 * @returns 防抖后的函数
 */
export function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  );
}

/**
 * 长按Hook - 检测长按手势
 * @param onLongPress 长按回调
 * @param duration 长按持续时间（毫秒）
 * @returns 事件处理器对象
 */
export function useLongPress(
  onLongPress: () => void,
  duration: number = 500
) {
  const timeoutRef = useRef<NodeJS.Timeout>();
  const isLongPress = useRef(false);

  const start = useCallback(() => {
    isLongPress.current = false;
    timeoutRef.current = setTimeout(() => {
      isLongPress.current = true;
      onLongPress();
      // 触发震动反馈
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
    }, duration);
  }, [onLongPress, duration]);

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  const end = useCallback(() => {
    cancel();
    return isLongPress.current;
  }, [cancel]);

  useEffect(() => {
    return cancel;
  }, [cancel]);

  return {
    onMouseDown: start,
    onMouseUp: end,
    onMouseLeave: cancel,
    onTouchStart: start,
    onTouchEnd: end,
    onTouchMove: cancel,
  };
}

/**
 * 震动反馈工具函数
 */
export const hapticFeedback = {
  /** 轻触反馈 (10ms) */
  light: () => navigator.vibrate?.(10),

  /** 中等反馈 (20ms) */
  medium: () => navigator.vibrate?.(20),

  /** 重度反馈 (50ms) */
  heavy: () => navigator.vibrate?.(50),

  /** 成功反馈 (两次短震) */
  success: () => navigator.vibrate?.([10, 50, 10]),

  /** 错误反馈 (三次震动) */
  error: () => navigator.vibrate?.([50, 100, 50, 100, 50]),

  /** 选择反馈 (单次短震) */
  selection: () => navigator.vibrate?.(10),

  /** 警告反馈 (长震) */
  warning: () => navigator.vibrate?.(200),
};

/**
 * 检测设备能力
 */
export const deviceCapabilities = {
  /** 是否为触摸设备 */
  isTouchDevice: () => window.matchMedia("(pointer: coarse)").matches,

  /** 是否支持震动 */
  hasVibration: () => 'vibrate' in navigator,

  /** 是否为移动设备 */
  isMobile: () => /iPhone|iPad|iPod|Android/i.test(navigator.userAgent),

  /** 是否为iOS */
  isIOS: () => /iPhone|iPad|iPod/i.test(navigator.userAgent),

  /** 是否为Android */
  isAndroid: () => /Android/i.test(navigator.userAgent),

  /** 获取屏幕方向 */
  getOrientation: () => {
    if (window.screen?.orientation) {
      return window.screen.orientation.type;
    }
    return window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
  },
};

/**
 * 被动事件监听器选项
 */
export const passiveEventOptions: AddEventListenerOptions = {
  passive: true,
  capture: false,
};

export const nonPassiveEventOptions: AddEventListenerOptions = {
  passive: false,
  capture: false,
};
