"use client";

/**
 * StoreGrid 元件 - 店家卡片網格容器
 * 使用響應式網格系統排列店家卡片
 */
import { Store } from "@/types/store";
import StoreCard from "@/components/features/StoreCard";

/**
 * StoreGrid Props
 * @param stores - 店家資料陣列
 * @param onEdit - 編輯店家的回呼函式
 */
interface StoreGridProps {
  stores: Store[];
  onEdit: (store: Store) => void;
}

export default function StoreGrid({ stores, onEdit }: StoreGridProps) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {stores.map((store) => (
        <StoreCard key={store.id} store={store} onEdit={onEdit} />
      ))}
    </div>
  );
}
