"use client";

/**
 * FoodMapLocal 主頁面
 * 本專案的核心頁面，負責組合所有元件與管理高層級狀態
 * 采用 Local-First 理念，所有資料儲存於瀏覽器 IndexedDB
 */
import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { Store } from "@/types/store";
import Navbar from "@/components/features/Navbar";
import StoreGrid from "@/components/features/StoreGrid";
import StoreFormModal from "@/components/features/StoreFormModal";
import EmptyState from "@/components/shared/EmptyState";
import StoreSkeletonGrid from "@/components/features/StoreSkeleton";
import Announcement from "@/components/features/Announcement";
import { useLocalStorage } from "@/hooks/useLocalStorage";

export default function FoodMapLocal() {
  // 搜尋關鍵字狀態
  const [searchQuery, setSearchQuery] = useState<string>("");
  // 表單彈窗開關狀態
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  // 設定選單開關狀態
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  // 正在編輯的店家 (null 表示新增模式)
  const [editingStore, setEditingStore] = useState<Store | null>(null);
  // 設定公告顯示狀態 (從 localStorage 初始化)
  const [showAnnouncement, setShowAnnouncement] = useLocalStorage(
    "food-map-show-notice",
    true,
  );

  // 切換公告狀態並儲存
  const handleToggleAnnouncement = (val: boolean) => {
    setShowAnnouncement(val);
  };

  /**
   * Live Query: 自動監聽 IndexedDB 資料變化
   * 當 searchQuery 改變時會重新執行查詢
   * 注意：初次載入時會回傳 undefined
   */
  const stores = useLiveQuery(() => {
    const collection = db.stores.orderBy("updatedAt").reverse();
    if (searchQuery) {
      return collection
        .filter(
          (store) =>
            store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            store.notes.toLowerCase().includes(searchQuery.toLowerCase()),
        )
        .toArray();
    }
    return collection.toArray();
  }, [searchQuery]);

  /**
   * 排序邏輯：將收藏的店家置頂 (Pin First)
   * isFavorite 為 true 的店家會顯示在最上方
   */
  const sortedStores = stores?.sort(
    (a, b) => Number(b.isFavorite) - Number(a.isFavorite),
  );

  /**
   * 開啟新增/編輯彈窗
   * @param storeToEdit - 要編輯的店家 (無值則為新增模式)
   */
  const handleOpenModal = (storeToEdit?: Store) => {
    if (storeToEdit) {
      setEditingStore(storeToEdit);
    } else {
      setEditingStore(null);
    }
    setIsModalOpen(true);
  };

  return (
    <div className="bg-[#FAFAFA] pb-20 font-sans text-neutral-900">
      <Navbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onAddNew={() => handleOpenModal()}
        isSettingsOpen={isSettingsOpen}
        setIsSettingsOpen={setIsSettingsOpen}
        showAnnouncement={showAnnouncement}
        onToggleAnnouncement={handleToggleAnnouncement}
      />

      {/* 主內容區域 */}
      <main className="container mx-auto px-4 py-8">
        {/* 布告欄 */}
        {showAnnouncement && <Announcement />}

        {/* 根據資料載入狀態顯示不同元件 */}
        {sortedStores === undefined ? (
          // 資料載入中：顯示骨架屏
          <StoreSkeletonGrid />
        ) : sortedStores.length === 0 ? (
          // 無資料：顯示空狀態
          <EmptyState />
        ) : (
          // 有資料：顯示店家列表
          <StoreGrid stores={sortedStores} onEdit={handleOpenModal} />
        )}
      </main>

      {isModalOpen && (
        <StoreFormModal
          key={editingStore ? `edit-${editingStore.id}` : "create-new"} // 使用 key 強制重啟
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          editingStore={editingStore}
        />
      )}
    </div>
  );
}
