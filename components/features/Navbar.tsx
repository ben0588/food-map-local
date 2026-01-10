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
}

export default function Navbar({
  searchQuery,
  onSearchChange,
  onAddNew,
  isSettingsOpen,
  setIsSettingsOpen,
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
      const dataStr = JSON.stringify(allStores, null, 2);
      const blob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      const date = new Date().toISOString().split("T")[0];
      link.download = `food-map-backup-${date}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setIsSettingsOpen(false);

      await Swal.fire({
        icon: "success",
        title: "備份下載已開始",
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
        <p>⚠️ 匯入操作將會<strong>合併資料</strong>。</p>
        <br>
        <p>強烈建議您在匯入前，先點擊「匯出」備份當前資料。</p>
      `,
      showCancelButton: true,
      confirmButtonText: "繼續匯入",
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
        const importedData: Store[] = JSON.parse(jsonContent);

        if (!Array.isArray(importedData)) {
          throw new Error("格式錯誤");
        }

        // 執行資料庫運作，並將結果 return 出來
        const result = await db.transaction("rw", db.stores, async () => {
          let addedCount = 0;
          let updatedCount = 0;

          for (const store of importedData) {
            // 安全性檢查：清洗圖片欄位
            let safeMenuImage = store.menuImage || "";

            // 驗證 Base64 圖片資料格式
            if (safeMenuImage && !validateBase64Image(safeMenuImage)) {
              safeMenuImage = "";
            }

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
              const { ...newStore } = store;
              await db.stores.add({
                ...newStore,
                menuImage: safeMenuImage,
              });
              addedCount++;
            }
          }

          return { addedCount, updatedCount };
        });

        // 交易成功結束後，才執行 UI 顯示 (Swal)
        // *此時 DB 連線已經安全關閉，不會有 PrematureCommitError
        await Swal.fire({
          icon: "success",
          title: "匯入成功！",
          html: `
            <p>🆕 <strong>新增:</strong> ${result.addedCount} 筆</p>
            <p>🔄 <strong>更新:</strong> ${result.updatedCount} 筆</p>
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
                  <div className="px-3 py-2 text-xs font-semibold tracking-wider text-neutral-400 uppercase">
                    資料管理
                  </div>

                  <Button
                    onClick={handleExport}
                    variant="ghost"
                    className="flex w-full items-center justify-start gap-2 px-4 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-50"
                  >
                    <Download className="h-4 w-4" />
                    匯出備份 (JSON)
                  </Button>

                  <Button
                    onClick={triggerImport}
                    variant="ghost"
                    className="flex w-full items-center justify-start gap-2 px-4 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-50"
                  >
                    <Upload className="h-4 w-4" />
                    匯入資料
                  </Button>

                  <div className="my-1 border-t border-neutral-100" />

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
