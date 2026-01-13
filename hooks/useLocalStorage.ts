import { useSyncExternalStore } from "react";

/**
 * 安全讀取 localStorage 的 Hook
 * @param key localStorage 的鍵名
 * @param initialValue 預設值 (若沒讀到或在 Server 端時使用)
 * @returns [當前值, 更新函式]
 */
export function useLocalStorage(
  key: string,
  defaultValue: boolean,
): [boolean, (value: boolean) => void] {
  // 訂閱函式：監聽 storage 事件
  const subscribe = (callback: () => void) => {
    window.addEventListener("storage", callback);
    return () => window.removeEventListener("storage", callback);
  };

  // 取得快照：從 localStorage 讀取當前值
  const getSnapshot = () => {
    const saved = localStorage.getItem(key);
    return saved !== null ? saved === "true" : defaultValue;
  };

  // 伺服器端渲染時的初始值
  const getServerSnapshot = () => defaultValue;

  // 使用 useSyncExternalStore 同步外部狀態
  const value = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  // 更新函式
  const setValue = (newValue: boolean) => {
    localStorage.setItem(key, String(newValue));
    // 手動觸發 storage 事件（同頁面更新）
    window.dispatchEvent(new Event("storage"));
  };

  return [value, setValue];
}
