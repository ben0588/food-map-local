/**
 * 工具函式庫
 * 提供專案中常用的輔助函式
 */
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * cn (classNames 的縮寫)
 * 用於合併與覆蓋 Tailwind CSS 類別名稱
 *
 * @param inputs - 接受多個 className 參數（字串、陣列、物件）
 * @returns 合併後的 className 字串
 *
 * 範例：
 * cn('px-2 py-1', 'px-4') // => 'py-1 px-4' (後者覆蓋前者的 px-2)
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
