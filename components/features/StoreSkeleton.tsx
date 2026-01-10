"use client";

/**
 * StoreSkeleton 元件 - 店家卡片骨架屏
 * 在資料載入時顯示，提升使用者體驗、減少佈局抖動
 * 使用 Tailwind 的 animate-pulse 建立呼吸燈效果
 */

/**
 * 單一店家卡片骨架
 * 模擬真實卡片的結構與尺寸
 */
export function StoreSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-neutral-100 bg-white">
      {/* 圖片區域骨架 */}
      <div className="aspect-video w-full animate-pulse bg-neutral-200" />

      {/* 內容區域骨架 */}
      <div className="space-y-3 p-4">
        {/* 標題 */}
        <div className="h-6 w-3/4 animate-pulse rounded bg-neutral-200" />

        {/* 標籤 */}
        <div className="flex gap-2">
          <div className="h-5 w-16 animate-pulse rounded-full bg-neutral-100" />
          <div className="h-5 w-16 animate-pulse rounded-full bg-neutral-100" />
        </div>

        {/* 備註區域 */}
        <div className="mt-3 h-20 w-full animate-pulse rounded-md bg-neutral-50" />

        {/* 底部按鈕 */}
        <div className="mt-auto flex justify-between border-t border-neutral-50 pt-3">
          <div className="h-4 w-24 animate-pulse rounded bg-neutral-100" />
          <div className="flex gap-2">
            <div className="h-8 w-8 animate-pulse rounded-full bg-neutral-100" />
            <div className="h-8 w-8 animate-pulse rounded-full bg-neutral-100" />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * 骨架屏網格容器
 * 預設顯示 4 個骨架卡片，配合響應式網格
 */
export default function StoreSkeletonGrid() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {/* 預設顯示 4 個骨架卡片 */}
      {[...Array(4)].map((_, i) => (
        <StoreSkeleton key={i} />
      ))}
    </div>
  );
}
