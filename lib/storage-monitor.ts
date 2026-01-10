/**
 * 儲存空間監控工具
 * 使用 StorageManager API 檢測 IndexedDB 使用量
 */

export interface StorageInfo {
  usage: number; // 已使用空間（bytes）
  quota: number; // 總配額（bytes）
  usageInMB: number; // 已使用空間（MB）
  quotaInMB: number; // 總配額（MB）
  percentage: number; // 使用百分比
  isLow: boolean; // 是否空間不足 (>80%)
  isCritical: boolean; // 是否嚴重不足 (>95%)
}

/**
 * 檢查瀏覽器儲存空間使用情況
 * @returns Promise<StorageInfo | null> - 回傳儲存空間資訊，不支援則回傳 null
 */
export async function checkStorageUsage(): Promise<StorageInfo | null> {
  // 檢查瀏覽器是否支援 Storage API
  if (!navigator.storage || !navigator.storage.estimate) {
    console.warn("瀏覽器不支援 Storage API");
    return null;
  }

  try {
    const estimate = await navigator.storage.estimate();
    const usage = estimate.usage || 0;
    const quota = estimate.quota || 0;

    const usageInMB = usage / (1024 * 1024);
    const quotaInMB = quota / (1024 * 1024);
    const percentage = quota > 0 ? (usage / quota) * 100 : 0;

    return {
      usage,
      quota,
      usageInMB,
      quotaInMB,
      percentage,
      isLow: percentage > 80,
      isCritical: percentage > 95,
    };
  } catch (error) {
    console.error("檢查儲存空間失敗:", error);
    return null;
  }
}

/**
 * 格式化儲存空間大小
 * @param bytes - 位元組數
 * @returns 格式化後的字串（例如：1.5 GB, 250 MB）
 */
export function formatStorageSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

/**
 * 取得儲存空間警告訊息
 * @param info - 儲存空間資訊
 * @returns 警告訊息文字
 */
export function getStorageWarningMessage(info: StorageInfo): string {
  if (info.isCritical) {
    return `⚠️ 儲存空間嚴重不足！已使用 ${info.percentage.toFixed(1)}%（${formatStorageSize(info.usage)} / ${formatStorageSize(info.quota)}）\n\n建議：\n1. 匯出備份後刪除不需要的店家\n2. 刪除不必要的菜單圖片`;
  }

  if (info.isLow) {
    return `⚠️ 儲存空間偏低，已使用 ${info.percentage.toFixed(1)}%（${formatStorageSize(info.usage)} / ${formatStorageSize(info.quota)}）\n\n建議定期清理不需要的資料。`;
  }

  return `儲存空間充足：已使用 ${info.percentage.toFixed(1)}%（${formatStorageSize(info.usage)} / ${formatStorageSize(info.quota)}）`;
}
