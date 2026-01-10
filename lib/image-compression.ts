import imageCompression from "browser-image-compression";

/**
 * 圖片壓縮設定選項
 */
interface CompressOptions {
  maxWidth?: number; // 最大寬度 (預設 800px)
  maxHeight?: number; // 最大高度 (預設 800px)
  quality?: number; // 圖片品質 0.1 ~ 1.0 (預設 0.75)
  type?: string; // 輸出格式 (自動選擇 WebP 或 JPEG)
}

/**
 * 檢測瀏覽器是否支援 WebP 格式
 * @returns Promise<boolean>
 */
const supportsWebP = (() => {
  let cached: boolean | null = null;

  return async (): Promise<boolean> => {
    if (cached !== null) return cached;

    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        cached = img.width === 1 && img.height === 1;
        resolve(cached);
      };
      img.onerror = () => {
        cached = false;
        resolve(false);
      };
      // 1x1 的 WebP 測試圖片
      img.src =
        "data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAwA0JaQAA3AA/vuUAAA=";
    });
  };
})();

/**
 * 使用 browser-image-compression 壓縮圖片
 * 優先使用 WebP 格式（檔案更小），不支援則降級到 JPEG
 * @param file - 原始 File 物件 (來自 input type="file")
 * @param options - 壓縮選項
 * @returns Promise<string> - 回傳壓縮後的 Base64 字串
 */
export const compressImage = async (
  file: File,
  options: CompressOptions = {},
): Promise<string> => {
  // 設定預設值
  const {
    maxWidth = 800,
    maxHeight = 800,
    quality = 0.75, // 降低到 0.75 以獲得更好的壓縮率
    type,
  } = options;

  try {
    // 1. 檢查是否為圖片
    if (!file.type.startsWith("image/")) {
      throw new Error("請上傳圖片格式檔案");
    }

    // 2. 自動選擇最佳格式：優先 WebP，不支援則用 JPEG
    const isWebPSupported = await supportsWebP();
    const outputType = type || (isWebPSupported ? "image/webp" : "image/jpeg");

    // 3. 使用 browser-image-compression 壓縮
    const compressedFile = await imageCompression(file, {
      maxWidthOrHeight: Math.max(maxWidth, maxHeight), // 最大寬度或高度
      useWebWorker: true, // 使用 Web Worker 提升效能（不阻塞 UI）
      fileType: outputType, // 輸出格式
      initialQuality: quality, // 初始品質
      alwaysKeepResolution: false, // 允許縮小尺寸
    });

    // 4. 將壓縮後的 File 轉為 Base64
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onloadend = () => {
        resolve(reader.result as string);
      };

      reader.onerror = () => {
        reject(new Error("檔案讀取失敗"));
      };

      reader.readAsDataURL(compressedFile);
    });
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("圖片壓縮失敗");
  }
};
