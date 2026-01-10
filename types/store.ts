/**
 * 店家資料型別定義
 * 定義應用程式中店家物件的結構
 */
export interface Store {
  id?: number; // 資料庫自動生成的唯一 ID (新增時可省略)
  name: string; // 店家名稱 (必填)
  address?: string; // 店家地址 (選填)
  openingHours: string; // 營業時間 (例如: "11:00 - 20:30")
  deliveryThreshold: number; // 外送門檻金額
  notes: string; // 備註與推薦菜色
  menuImage: string; // 菜單圖片 (Base64 格式)
  isFavorite: boolean; // 是否標記為我的最愛 (用於置頂)
  updatedAt: number; // 最後更新時間戳記 (毫秒)
}
