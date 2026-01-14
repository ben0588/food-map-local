import { useSyncExternalStore, useCallback } from "react";

/**
 * 通用的 localStorage Hook (支援 SSR 與跨分頁同步)
 * @param key localStorage 的鍵名
 * @param initialValue 預設值
 * @returns [當前值, 更新函式]
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
): [T, (value: T) => void] {
  // 訂閱函式：監聽 storage 事件
  const subscribe = useCallback((callback: () => void) => {
    window.addEventListener("storage", callback);
    return () => window.removeEventListener("storage", callback);
  }, []);

  // 取得快照：從 localStorage 讀取當前值
  const getSnapshot = useCallback(() => {
    const saved = localStorage.getItem(key);
    if (saved === null) return initialValue;

    try {
      // 1. 布林值：直接比較字串
      if (typeof initialValue === "boolean") {
        return (saved === "true") as unknown as T;
      }

      // 2. 字串：檢查是否為 JSON 格式的字串（帶引號）
      if (typeof initialValue === "string") {
        // 如果存的是 JSON 字串格式（"內容"），需要解析
        if (saved.startsWith('"') && saved.endsWith('"')) {
          return JSON.parse(saved);
        }
        // 否則直接回傳原始字串
        return saved as unknown as T;
      }

      // 3. 其他型別（物件/陣列/數字）：嘗試 JSON 解析
      return JSON.parse(saved);
    } catch {
      return saved as unknown as T;
    }
  }, [key, initialValue]);

  // 伺服器端渲染時的初始值
  const getServerSnapshot = useCallback(() => initialValue, [initialValue]);

  // 使用 useSyncExternalStore 同步外部狀態
  const value = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  // 更新函式
  const setValue = useCallback(
    (newValue: T) => {
      // 字串直接存，其他型別 JSON 序列化
      const stringValue =
        typeof newValue === "string" ? newValue : JSON.stringify(newValue);

      localStorage.setItem(key, stringValue);
      // 手動觸發 storage 事件（同頁面更新）
      window.dispatchEvent(new Event("storage"));
    },
    [key],
  );

  return [value, setValue];
}
