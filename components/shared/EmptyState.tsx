"use client";

/**
 * EmptyState 元件 - 空狀態顯示
 * 當使用者尚未新增任何餐廳資料時顯示此元件
 */
import { Image as ImageIcon } from "lucide-react";

export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center opacity-60">
      <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-neutral-200">
        <ImageIcon className="h-10 w-10 text-neutral-400" />
      </div>
      <h3 className="text-xl font-bold text-neutral-700">還沒有餐廳資料</h3>
      <p className="mt-2 max-w-sm text-neutral-500">
        點擊右上角的「新增餐廳」來建立你的第一張美食地圖吧！資料將安全地儲存在你的瀏覽器中。
      </p>
    </div>
  );
}
