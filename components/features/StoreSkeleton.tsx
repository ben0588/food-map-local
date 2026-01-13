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
    <div className="flex flex-col overflow-hidden rounded-xl border border-neutral-100 bg-white shadow-sm">
      {/* 圖片區域骨架 */}
      <div className="aspect-video w-full animate-pulse bg-neutral-200" />

      {/* 內容區域骨架 */}
      <div className="flex flex-1 flex-col p-4">
        {/* 標題與官網連結骨架 */}
        <div className="mb-2 flex items-center justify-between">
          <div className="h-6 w-1/2 animate-pulse rounded bg-neutral-200" />
          <div className="h-6 w-6 animate-pulse rounded-full bg-neutral-200" />
        </div>

        {/* 地址骨架 */}
        <div className="mb-3 h-4 w-3/4 animate-pulse rounded bg-neutral-100" />

        {/* 標籤顯示區 (門檻與營業時間) */}
        <div className="mb-3 flex gap-2">
          <div className="h-6 w-20 animate-pulse rounded-full bg-neutral-100" />
          <div className="h-6 w-24 animate-pulse rounded-full bg-neutral-100" />
        </div>

        {/* 備註區域骨架 */}
        <div className="mt-3 mb-4 h-24 w-full animate-pulse rounded-md bg-neutral-50" />

        {/* 底部日期與按鈕骨架 */}
        <div className="mt-auto flex items-center justify-between border-t border-neutral-50 pt-3">
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
