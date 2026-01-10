"use client";

/**
 * StoreFormModal 元件 - 店家表單彈窗
 * 用於新增或編輯店家資料
 * 支援圖片上傳（轉換為 Base64 儲存）
 */
import { useState, ChangeEvent, useEffect } from "react";
import {
  X,
  MapPin,
  Clock,
  Truck,
  Upload,
  NotepadText,
  Store as StoreIcon,
  Image as ImageIcon,
} from "lucide-react";
import { Store } from "@/types/store";
import { toast } from "react-toastify";

import { db } from "@/lib/db";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { validateImageFile } from "@/lib/image-validation";
import { compressImage } from "@/lib/image-compression";

/**
 * StoreFormModal Props
 * @param isOpen - 彈窗是否打開
 * @param onClose - 關閉彈窗的回呼函式
 * @param editingStore - 正在編輯的店家 (為 null 則為新增模式)
 */
interface StoreFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingStore: Store | null;
}

// 表單初始預設值
const INITIAL_FORM_DATA = {
  name: "",
  address: "",
  openingHours: "",
  deliveryThreshold: 0,
  notes: "",
  menuImage: "",
};

export default function StoreFormModal({
  isOpen,
  onClose,
  editingStore,
}: StoreFormModalProps) {
  // 圖片載入中狀態
  const [isLoadingImage, setIsLoadingImage] = useState(false);

  // 表單資料狀態
  const [formData, setFormData] = useState<Partial<Store>>(() => {
    if (editingStore) {
      return {
        name: editingStore.name,
        address: editingStore.address || "",
        openingHours: editingStore.openingHours || "",
        deliveryThreshold: editingStore.deliveryThreshold ?? 0,
        notes: editingStore.notes || "",
        menuImage: editingStore.menuImage || "",
      };
    }
    return INITIAL_FORM_DATA;
  });

  /**
   * 處理圖片上傳
   * 1. 驗證檔案格式 (Magic Number 驗證)
   * 2. 使用 browser-image-compression 壓縮圖片
   * 3. 轉換為 Base64 儲存
   */
  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    e.target.value = "";
    setIsLoadingImage(true);

    try {
      // 執行 Magic Number 驗證
      const isValid = await validateImageFile(file);

      if (!isValid) {
        toast("不支援的檔案格式！請上傳 JPG, PNG, WebP 圖片。", {
          type: "error",
        });
        setIsLoadingImage(false);
        return;
      }

      // 使用 browser-image-compression 壓縮圖片並轉為 Base64
      // 自動選擇 WebP（更小）或 JPEG 格式
      const compressedBase64 = await compressImage(file, {
        maxWidth: 800,
        maxHeight: 800,
        quality: 0.75, // 品質 75% 可獲得更好的壓縮率
        // type 留空，讓系統自動選擇 WebP 或 JPEG
      });

      // 計算壓縮後的大小 (估算值)
      const sizeInMB = (compressedBase64.length * 0.75) / (1024 * 1024);
      console.log(`圖片壓縮完成，大小約 ${sizeInMB.toFixed(2)} MB`);

      // 如果壓縮後仍超過 2MB，給予警告
      if (sizeInMB > 2) {
        toast(
          `圖片壓縮後仍有 ${sizeInMB.toFixed(2)}MB，建議使用較小的圖片以節省空間`,
          { type: "warning" },
        );
      }

      setFormData((prev) => ({
        ...prev,
        menuImage: compressedBase64,
      }));
      setIsLoadingImage(false);
    } catch (error) {
      console.error("圖片處理失敗:", error);
      toast(error instanceof Error ? error.message : "圖片處理失敗，請重試", {
        type: "error",
      });
      setIsLoadingImage(false);
    }
  };

  /**
   * 提交表單
   * 根據 editingStore 判斷是更新還是新增
   */
  const handleSubmit = async () => {
    const payload = {
      name: formData.name,
      address: formData.address || "",
      openingHours: formData.openingHours || "全日",
      deliveryThreshold: Number(formData.deliveryThreshold) || 0,
      notes: formData.notes || "",
      menuImage: formData.menuImage || "",
      updatedAt: Date.now(),
    };

    if (editingStore && editingStore.id) {
      await db.stores.update(editingStore.id, payload);
    } else {
      await db.stores.add({ ...payload, isFavorite: false } as Store);
    }

    onClose();
  };

  /**
   * 針對鍵盤 esc 監聽關閉表單
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  // 當 isOpen 為 false 時，元件會回傳 null (Unmount)
  // 這保證了下次打開時，useState 會重新執行初始化邏輯
  if (!isOpen) return null;

  return (
    <div className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm duration-200">
      <div className="animate-in zoom-in-95 max-h-[90vh] w-full max-w-lg overflow-hidden overflow-y-auto rounded-xl bg-white shadow-xl duration-200">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-neutral-100 bg-white px-6 py-4">
          <h2 className="text-lg font-bold text-neutral-800">
            {editingStore ? "編輯餐廳資訊" : "新增餐廳"}
          </h2>
          <button
            onClick={onClose}
            className="cursor-pointer text-neutral-400 transition-colors hover:text-neutral-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-5 p-6">
          <div className="space-y-2">
            <label
              className="flex items-center gap-1 text-sm font-semibold text-neutral-700"
              htmlFor="store-name"
            >
              <StoreIcon className="h-3 w-3" /> 店名{" "}
              <span className="text-red-500">*</span>
            </label>
            <Input
              id="store-name"
              value={formData.name}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="例如：巷口炸雞"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <label
              className="flex items-center gap-1 text-sm font-semibold text-neutral-700"
              htmlFor="address"
            >
              <MapPin className="h-3 w-3" /> 地址
            </label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setFormData({ ...formData, address: e.target.value })
              }
              placeholder="e.g. 台北市信義區市府路45號"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label
                className="flex items-center gap-1 text-sm font-semibold text-neutral-700"
                htmlFor="opening-hours"
              >
                <Clock className="h-3 w-3" /> 營業時間
              </label>
              <Input
                id="opening-hours"
                value={formData.openingHours}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setFormData({ ...formData, openingHours: e.target.value })
                }
                placeholder="e.g. 11:00 - 20:30"
              />
            </div>

            <div className="space-y-2">
              <label
                className="flex items-center gap-1 text-sm font-semibold text-neutral-700"
                htmlFor="delivery-threshold"
              >
                <Truck className="h-3 w-3" /> 外送門檻 ($)
              </label>
              <Input
                id="delivery-threshold"
                type="number"
                value={formData.deliveryThreshold || ""}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setFormData({
                    ...formData,
                    deliveryThreshold: Number(e.target.value),
                  })
                }
                placeholder="e.g. 300"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label
              className="flex items-center gap-1 text-sm font-semibold text-neutral-700"
              htmlFor="notes"
            >
              <NotepadText className="h-3 w-3" /> 備註 / 推薦菜色
            </label>
            <textarea
              id="notes"
              className="flex min-h-25 w-full resize-none rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm placeholder:text-neutral-400 focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:outline-none"
              value={formData.notes}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              placeholder="週一公休。&#10;推薦：雞腿飯、紅茶半糖..."
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-1 text-sm font-semibold text-neutral-700">
              <ImageIcon className="h-3 w-3" /> 菜單圖片 (選填)
            </label>
            <div className="group relative cursor-pointer rounded-lg border-2 border-dashed border-neutral-200 p-4 text-center transition-colors hover:bg-neutral-50">
              <input
                type="file"
                accept="image/png, image/jpeg, image/jpg, image/webp, image/gif"
                onChange={handleImageUpload}
                className="absolute inset-0 z-10 cursor-pointer opacity-0"
              />

              {formData.menuImage ? (
                <div className="relative h-40 w-full transition-opacity group-hover:opacity-90">
                  {/* 使用原生 img 標籤顯示 Base64 圖片，避免 Next.js Image 的警告 */}
                  <img
                    src={formData.menuImage}
                    alt="Preview"
                    className="h-full w-full rounded-md object-contain shadow-sm"
                  />

                  <div className="absolute inset-0 flex items-center justify-center bg-black/10 text-sm font-medium text-white opacity-0 drop-shadow-md transition-opacity group-hover:opacity-100">
                    點擊更換圖片
                  </div>
                </div>
              ) : (
                <div className="py-4 text-neutral-400 transition-colors group-hover:text-orange-500">
                  <Upload className="mx-auto mb-2 h-8 w-8 opacity-50" />
                  <span className="text-sm">點擊上傳或拖曳圖片至此</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 z-20 flex justify-end gap-3 border-t border-neutral-100 bg-neutral-50 px-6 py-4">
          <Button variant="ghost" onClick={onClose}>
            取消
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!formData.name || isLoadingImage}
          >
            {isLoadingImage
              ? "圖片處理中..."
              : editingStore
                ? "儲存變更"
                : "建立店家"}
          </Button>
        </div>
      </div>
    </div>
  );
}
