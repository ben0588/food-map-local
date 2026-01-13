"use client";

/**
 * Navbar 元件 - 導覽列
 * 包含 Logo、搜尋框、新增按鈕、設定選單
 * 提供匯出與匯入資料功能
 */
import { useRef, useEffect, ChangeEvent } from "react";
import {
  Search,
  Plus,
  Settings,
  Download,
  Upload,
  HardDrive,
} from "lucide-react";
import Swal from "sweetalert2";

import { db } from "@/lib/db";
import { Store } from "@/types/store";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { validateBase64Image } from "@/lib/image-validation";
import {
  checkStorageUsage,
  getStorageWarningMessage,
} from "@/lib/storage-monitor";
import { cn } from "@/lib/utils";

/**
 * Navbar Props
 * @param searchQuery - 當前搜尋關鍵字
 * @param onSearchChange - 搜尋關鍵字變更時的回呼函式
 * @param onAddNew - 點擊新增按鈕時的回呼函式
 * @param isSettingsOpen - 設定選單是否打開
 * @param setIsSettingsOpen - 設定選單開關控制函式
 */
interface NavbarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onAddNew: () => void;
  isSettingsOpen: boolean;
  setIsSettingsOpen: (open: boolean) => void;
  showAnnouncement: boolean;
  onToggleAnnouncement: (value: boolean) => void;
}

export default function Navbar({
  searchQuery,
  onSearchChange,
  onAddNew,
  isSettingsOpen,
  setIsSettingsOpen,
  showAnnouncement,
  onToggleAnnouncement,
}: NavbarProps) {
  // 用於觸發隱藏的檔案輸入框
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 綁定包含「按鈕」與「選單」的容器
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 實作點擊外部關閉的邏輯
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // 如果點擊的目標不在 dropdownRef 內，且選單是開啟的，就關閉選單
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsSettingsOpen(false);
      }
    };

    // 綁定監聽器
    document.addEventListener("mousedown", handleClickOutside);

    // 清除監聽器 (Cleanup function)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [setIsSettingsOpen]); // 相依陣列只放必要的函式

  // 開關公告 UI 按鈕
  const toggleAnnouncement = () => {
    onToggleAnnouncement(!showAnnouncement);
  };

  /**
   * 檢查儲存空間使用情況
   */
  const handleCheckStorage = async () => {
    const storageInfo = await checkStorageUsage();

    if (!storageInfo) {
      await Swal.fire({
        icon: "info",
        title: "無法檢測儲存空間",
        text: "您的瀏覽器不支援 Storage API",
      });
      return;
    }

    const message = getStorageWarningMessage(storageInfo);
    const icon = storageInfo.isCritical
      ? "error"
      : storageInfo.isLow
        ? "warning"
        : "info";

    await Swal.fire({
      icon,
      title: "儲存空間使用情況",
      html: message.replace(/\n/g, "<br>"),
      confirmButtonColor: "#f97316",
    });

    setIsSettingsOpen(false);
  };

  /**
   * 匯出資料為 JSON 檔案
   * 檔名包含當前日期，方便版本管理
   */
  const handleExport = async () => {
    try {
      const allStores = await db.stores.toArray();

      // 取得所有設定值包含公告內容
      const settings = {
        showAnnouncement,
        announcementContent: localStorage.getItem("food-map-notice") || "",
      };

      // 封裝成完整備份格式
      const backupData = {
        version: 1,
        settings,
        stores: allStores,
      };

      const dataStr = JSON.stringify(backupData, null, 2);
      const blob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      const date = new Date().toISOString().split("T")[0];
      link.download = `food-map-total-backup-${date}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setIsSettingsOpen(false);

      await Swal.fire({
        icon: "success",
        title: "備份下載已開始",
        text: "已包含店家資料與系統設定。",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
      });
    } catch (error) {
      console.error("Export failed:", error);
      await Swal.fire({
        icon: "error",
        title: "匯出失敗",
        text: "請稍後再試。",
      });
    }
  };

  /**
   * 觸發匯入功能
   * 在匯入前提醒使用者備份資料
   */
  const triggerImport = async () => {
    const result = await Swal.fire({
      icon: "question",
      title: "匯入資料",
      html: `
        <p>您可以選擇<strong>智慧合併</strong>或<strong>完全覆蓋</strong>現有資料。</p>
        <br>
        <p>建議您在匯入前，先點擊「匯出」備份當前資料。</p>
      `,
      showCancelButton: true,
      confirmButtonText: "繼續",
      cancelButtonText: "取消",
      confirmButtonColor: "#f97316",
      cancelButtonColor: "#6b7280",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      fileInputRef.current?.click();
    }
  };

  /**
   * 處理匯入檔案
   * 使用 transaction 確保資料完整性
   * 根據店名判斷是新增還是更新
   */
  const handleImportFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const jsonContent = event.target?.result as string;
        const parsed = JSON.parse(jsonContent);

        let importedStores: Store[] = [];
        let importedSettings: {
          showAnnouncement?: boolean;
          announcementContent?: string;
        } | null = null;

        // 格式偵測
        if (Array.isArray(parsed)) {
          // 舊格式：直接是陣列
          importedStores = parsed;
        } else if (parsed && parsed.stores && Array.isArray(parsed.stores)) {
          // 新格式：包含 settings 和 stores
          importedStores = parsed.stores;
          importedSettings = parsed.settings;
        } else {
          throw new Error("格式錯誤");
        }

        // 選擇匯入模式
        const { value: importMode } = await Swal.fire({
          title: "選擇匯入模式",
          text: `檔案中包含 ${importedStores.length} 筆店家資料`,
          icon: "question",
          input: "radio",
          inputOptions: {
            merge: `<p>智慧合併</p><p>(保留現有，更新重複)</p>`,
            replace: `<p>完全覆蓋</p><p>(刪除現有，全部替換)</p>`,
          },
          inputValue: "merge",
          showCancelButton: true,
          confirmButtonColor: "#f97316",
          confirmButtonText: "開始匯入",
          cancelButtonText: "取消",
          reverseButtons: true,
        });

        if (!importMode) return; // 使用者點擊取消

        // 執行資料庫運作
        const result = await db.transaction("rw", db.stores, async () => {
          let addedCount = 0;
          let updatedCount = 0;

          // 若為覆蓋模式，先清空資料庫
          if (importMode === "replace") {
            await db.stores.clear();
          }

          for (const store of importedStores) {
            // 安全性檢查：清洗圖片欄位
            let safeMenuImage = store.menuImage || "";

            // 驗證 Base64 圖片資料格式
            if (safeMenuImage && !validateBase64Image(safeMenuImage)) {
              safeMenuImage = "";
            }

            if (importMode === "replace") {
              // 覆蓋模式：直接新增（ID 會重新自動產生以確保一致性）
              const { id: _id, ...newStore } = store;
              void _id; // 避免 unused variable 警告
              await db.stores.add({
                ...newStore,
                menuImage: safeMenuImage,
              });
              addedCount++;
            } else {
              // 合併模式：根據名稱判斷
              const existing = await db.stores
                .where("name")
                .equals(store.name)
                .first();

              if (existing) {
                await db.stores.update(existing.id, {
                  ...store,
                  menuImage: safeMenuImage,
                  id: existing.id,
                });
                updatedCount++;
              } else {
                const { id: _id, ...newStore } = store;
                void _id; // 避免 unused variable 警告
                await db.stores.add({
                  ...newStore,
                  menuImage: safeMenuImage,
                });
                addedCount++;
              }
            }
          }

          return { addedCount, updatedCount };
        });

        // 如果有設定值，套用設定
        if (importedSettings) {
          if (typeof importedSettings.showAnnouncement === "boolean") {
            onToggleAnnouncement(importedSettings.showAnnouncement);
          }
          if (importedSettings.announcementContent) {
            localStorage.setItem(
              "food-map-notice",
              importedSettings.announcementContent,
            );
            // 由於 Announcement 元件監聽的是自己的狀態，
            // 匯入後可能需要重新整理才能看到公告內容更新，
            // 或者這裡我們可以觸發一個 window event 讓 Announcement 知道
            window.dispatchEvent(new Event("storage"));
          }
        }

        // 交易成功結束後，才執行 UI 顯示 (Swal)
        await Swal.fire({
          icon: "success",
          title: importMode === "replace" ? "覆蓋匯入成功！" : "合併匯入成功！",
          html: `
            ${importMode === "replace" ? `<p>📋 <strong>總計匯入:</strong> ${result.addedCount} 筆</p>` : `<p>🆕 <strong>新增:</strong> ${result.addedCount} 筆</p><p>🔄 <strong>更新:</strong> ${result.updatedCount} 筆</p>`}
            ${importedSettings ? "<p>⚙️ <strong>系統設定已套用</strong></p>" : ""}
          `,
          confirmButtonColor: "#f97316",
        });
      } catch (error) {
        console.error(error);
        await Swal.fire({
          icon: "error",
          title: "匯入失敗",
          text: "檔案格式錯誤或損毀，請檢查後重試。",
        });
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = "";
        setIsSettingsOpen(false);
      }
    };
    reader.readAsText(file);
  };

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-neutral-200 bg-white/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-4">
        {/* Logo & Title */}
        <div className="flex items-center gap-2">
          <img
            src="/logo.svg"
            alt="Food Map Logo"
            className="h-8 w-8 rounded-lg shadow-sm"
          />
          <span className="hidden text-lg font-bold tracking-tight sm:block">
            Food Map
          </span>
        </div>

        {/* Search */}
        <div className="relative max-w-md flex-1">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <Input
            placeholder="搜尋店名、備註.."
            className="pl-9"
            value={searchQuery}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              onSearchChange(e.target.value)
            }
          />
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={onAddNew} className="gap-1 shadow-sm">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">新增</span>
          </Button>

          {/* 下拉式選單 */}
          <div className="relative" ref={dropdownRef}>
            <Button
              variant="outline"
              className="px-2"
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            >
              <Settings className="h-5 w-5 text-neutral-600" />
            </Button>

            {isSettingsOpen && (
              <>
                <div className="animate-in fade-in zoom-in-95 absolute top-12 right-0 z-20 w-52 rounded-lg border border-neutral-200 bg-white py-1 shadow-xl duration-100">
                  <div className="px-3 py-1.5 text-[10px] font-bold tracking-wider text-neutral-400 uppercase">
                    介面顯示
                  </div>

                  <div
                    className="flex cursor-pointer items-center justify-between px-4 py-2 transition-colors hover:bg-neutral-50"
                    onClick={toggleAnnouncement}
                  >
                    <span className="text-sm font-medium text-neutral-700">
                      顯示公告欄
                    </span>

                    {/* 切換器 */}
                    <div
                      className={cn(
                        "relative h-5 w-9 rounded-full transition-colors duration-200 ease-in-out",
                        showAnnouncement ? "bg-orange-500" : "bg-neutral-200",
                      )}
                    >
                      <div
                        className={cn(
                          "absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200 ease-in-out",
                          showAnnouncement ? "translate-x-4" : "translate-x-0",
                        )}
                      />
                    </div>
                  </div>
                  <div className="my-1 border-t border-neutral-100" />

                  <div className="px-3 py-2 text-xs font-semibold tracking-wider text-neutral-400 uppercase">
                    資料管理
                  </div>

                  <Button
                    onClick={triggerImport}
                    variant="ghost"
                    className="flex w-full items-center justify-start gap-2 px-4 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-50"
                  >
                    <Download className="h-4 w-4" />
                    匯入資料 (JSON)
                  </Button>

                  <Button
                    onClick={handleExport}
                    variant="ghost"
                    className="flex w-full items-center justify-start gap-2 px-4 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-50"
                  >
                    <Upload className="h-4 w-4" />
                    匯出備份 (JSON)
                  </Button>

                  <Button
                    onClick={handleCheckStorage}
                    variant="ghost"
                    className="flex w-full items-center justify-start gap-2 px-4 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-50"
                  >
                    <HardDrive className="h-4 w-4" />
                    檢查儲存空間
                  </Button>
                </div>
              </>
            )}

            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept=".json"
              onChange={handleImportFile}
            />
          </div>
        </div>
      </div>
    </nav>
  );
}
