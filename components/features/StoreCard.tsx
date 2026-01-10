"use client";

/**
 * StoreCard 元件 - 單一店家卡片
 * 顯示店家的詳細資訊，包含圖片、地址、營業時間等
 * 提供編輯、刪除、收藏功能
 */
import {
  Heart,
  MapPin,
  Truck,
  Clock,
  Pencil,
  Trash2,
  Image as ImageIcon,
} from "lucide-react";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";
import Swal from "sweetalert2";

import { Store } from "@/types/store";
import { cn } from "@/lib/utils";
import { db } from "@/lib/db";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";

/**
 * StoreCard Props
 * @param store - 店家資料物件
 * @param onEdit - 點擊編輯按鈕時觸發的回呼函式
 */
interface StoreCardProps {
  store: Store;
  onEdit: (store: Store) => void;
}

export default function StoreCard({ store, onEdit }: StoreCardProps) {
  /**
   * 切換收藏狀態
   * @param id - 店家 ID
   * @param currentStatus - 當前是否已收藏
   */
  const toggleFavorite = (id: number, currentStatus: boolean) => {
    db.stores.update(id, { isFavorite: !currentStatus });
  };

  /**
   * 刪除店家
   * @param id - 店家 ID
   */
  const deleteStore = async (id: number) => {
    const result = await Swal.fire({
      icon: "question",
      title: "確定要刪除這間餐廳嗎？",
      showCancelButton: true,
      confirmButtonText: "刪除",
      cancelButtonText: "取消",
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      db.stores.delete(id);
    }
  };

  return (
    <div
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white transition-all hover:shadow-md",
        store.isFavorite &&
          "border-orange-200 shadow-sm ring-2 ring-orange-200",
      )}
    >
      {/* 圖片區域 */}
      <div className="t relative flex aspect-video w-full items-center justify-center overflow-hidden bg-neutral-100">
        {store.menuImage ? (
          <Zoom>
            {/* 使用原生 img 標籤顯示 Base64 圖片，避免 Next.js Image 的警告 */}
            <img
              src={store.menuImage}
              alt={`${store.name} 的菜單圖片`}
              className="h-full w-full cursor-zoom-in object-cover"
            />
          </Zoom>
        ) : (
          <div className="flex h-full flex-col items-center justify-center text-neutral-300">
            <ImageIcon className="mb-1 h-8 w-8" />
            <span className="text-xs">無菜單圖片</span>
          </div>
        )}

        {/* Pin Button */}
        <button
          onClick={() => store.id && toggleFavorite(store.id, store.isFavorite)}
          className={cn(
            "absolute top-2 right-2 z-10 cursor-pointer rounded-full p-2 backdrop-blur-sm transition-colors",
            store.isFavorite
              ? "bg-orange-500 text-white"
              : "bg-white/70 text-neutral-500 hover:bg-white hover:text-orange-500",
          )}
        >
          <Heart
            className={cn("h-4 w-4", store.isFavorite && "fill-current")}
          />
        </button>
      </div>

      {/* Content Area */}
      <div className="flex flex-1 flex-col p-4">
        <div className="mb-1 flex items-start justify-between">
          <h3 className="line-clamp-1 text-lg font-bold text-neutral-900">
            {store.name}
          </h3>
        </div>

        {/* 地址與 Google Maps 連結 */}
        {store.address && (
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(store.address)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 mb-2 flex w-full items-center gap-1 text-xs text-neutral-400 transition-colors hover:text-orange-600"
            title="點擊開啟 Google Maps"
          >
            <MapPin className="h-3 w-3 shrink-0" />
            <span className="truncate">{store.address}</span>
          </a>
        )}

        <div className="mb-3 flex flex-wrap gap-2">
          <Badge className="gap-1 border-emerald-100 bg-emerald-50 text-emerald-700">
            <Truck className="h-3 w-3" />${store.deliveryThreshold} 起
          </Badge>
          <Badge className="gap-1 bg-neutral-50 text-neutral-600">
            <Clock className="h-3 w-3" />
            {store.openingHours}
          </Badge>
        </div>

        {/* 備註 */}
        <div className="mt-3 mb-4 flex-1 rounded-md bg-neutral-50 p-3">
          <p className="line-clamp-3 text-xs break-all whitespace-pre-wrap text-neutral-500">
            {store.notes || "暫無備註..."}
          </p>
        </div>

        <div className="mt-auto flex items-center justify-between border-t border-neutral-100 pt-3">
          <span className="text-xs text-neutral-400">
            最後更新: {new Date(store.updatedAt).toLocaleDateString()}
          </span>

          <div className="flex items-center gap-1">
            <Button
              onClick={() => onEdit(store)}
              variant="ghost"
              className="rounded-full p-2 text-neutral-400 transition-colors hover:bg-blue-50 hover:text-blue-500"
              title="編輯資料"
            >
              <Pencil className="h-4 w-4" />
            </Button>

            <Button
              onClick={() => store.id && deleteStore(store.id)}
              variant="ghost"
              className="rounded-full p-2 text-neutral-400 transition-colors hover:bg-red-50 hover:text-red-500"
              title="刪除"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
