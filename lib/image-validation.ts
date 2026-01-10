/**
 * 統一處理圖片安全性驗證 (File Object 與 Base64 String)
 */

// 共用的簽章 (Magic Numbers)
const SIGNATURES = {
  png: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
  jpg: [0xff, 0xd8, 0xff],
  gif: [0x47, 0x49, 0x46, 0x38], // GIF8
  webp: {
    riff: [0x52, 0x49, 0x46, 0x46], // "RIFF"
    webp: [0x57, 0x45, 0x42, 0x50], // "WEBP"
  },
};

// 內部共用邏輯：檢查一般簽章
const checkSignature = (bytes: Uint8Array, signature: number[]) => {
  if (bytes.length < signature.length) return false;
  for (let i = 0; i < signature.length; i++) {
    if (bytes[i] !== signature[i]) return false;
  }
  return true;
};

// 內部共用邏輯：檢查 WebP 簽章
const checkWebP = (bytes: Uint8Array) => {
  if (bytes.length < 12) return false;
  const { riff, webp } = SIGNATURES.webp;
  // 檢查 "RIFF" (0-3)
  for (let i = 0; i < 4; i++) {
    if (bytes[i] !== riff[i]) return false;
  }
  // 檢查 "WEBP" (8-11)
  for (let i = 0; i < 4; i++) {
    if (bytes[i + 8] !== webp[i]) return false;
  }
  return true;
};

// 內部共用邏輯：統一判斷二進位資料是否有效
// 這裡接收 Uint8Array，不管是從 File 還是 Base64 來的都轉成這個格式再判斷
const validateBuffer = (bytes: Uint8Array): boolean => {
  if (checkSignature(bytes, SIGNATURES.png)) return true;
  if (checkSignature(bytes, SIGNATURES.jpg)) return true;
  if (checkSignature(bytes, SIGNATURES.gif)) return true;
  if (checkWebP(bytes)) return true;
  return false;
};

// ==========================================
// 公開匯出函式
// ==========================================

/**
 * 驗證上傳的 File 物件 (用於 StoreFormModal)
 */
export const validateImageFile = async (file: File): Promise<boolean> => {
  const MAX_SIZE = 5 * 1024 * 1024; // 5MB
  if (file.size > MAX_SIZE) return false;

  // 讀取前 16 bytes
  const buffer = await file.slice(0, 16).arrayBuffer();
  const bytes = new Uint8Array(buffer);

  return validateBuffer(bytes);
};

/**
 * 驗證 Base64 字串 (用於 JSON 匯入)
 */
export const validateBase64Image = (base64String: string): boolean => {
  if (!base64String || typeof base64String !== "string") return false;

  // 如果是空字串，視為安全 (代表沒圖片)
  if (base64String.trim() === "") return true;

  try {
    // 取得逗號後的內容
    const parts = base64String.split(",");
    const content = parts.length > 1 ? parts[1] : parts[0];

    // 解碼前 20 個字元 (足夠判斷 header)
    const headerContent = atob(content.slice(0, 20));

    // 轉為 Uint8Array
    const bytes = new Uint8Array(headerContent.length);
    for (let i = 0; i < headerContent.length; i++) {
      bytes[i] = headerContent.charCodeAt(i);
    }

    return validateBuffer(bytes);
  } catch (error) {
    console.error(error);
    return false; // 解碼失敗視為不安全
  }
};
