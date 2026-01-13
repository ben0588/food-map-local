"use client";

import React, { useState, useEffect } from "react";
import { Megaphone, Edit2, Check, X } from "lucide-react";

export default function Announcement() {
  const [content, setContent] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [tempContent, setTempContent] = useState("");
  const [isMounted, setIsMounted] = useState(false);

  // 初始化：從 LocalStorage 讀取
  useEffect(() => {
    // 使用微任務順延更新，避免級聯重繪警告
    queueMicrotask(() => {
      setIsMounted(true);
    });

    const loadContent = () => {
      const saved = localStorage.getItem("food-map-notice");
      if (saved) {
        setContent(saved);
      } else {
        // 預設歡迎詞
        setContent(
          "歡迎使用訂餐系統！\n請記得在 10:30 前完成點餐。\n外送抵達請通知分機 #1234。",
        );
      }
    };

    loadContent();

    // 監聽儲存事件 (用於匯入功能同步內容)
    window.addEventListener("storage", loadContent);
    return () => window.removeEventListener("storage", loadContent);
  }, []);

  // 開始編輯
  const handleEdit = () => {
    setTempContent(content);
    setIsEditing(true);
  };

  // 儲存
  const handleSave = () => {
    setContent(tempContent);
    localStorage.setItem("food-map-notice", tempContent);
    setIsEditing(false);
  };

  // 取消
  const handleCancel = () => {
    setIsEditing(false);
  };

  if (!isMounted) return null; // 避免 Hydration Mismatch

  return (
    <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50/60 p-4 transition-all">
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600">
          <Megaphone className="h-4 w-4" />
        </div>

        {/* Content Area */}
        <div className="flex-1">
          <div className="mb-1 flex items-center justify-between">
            <h3 className="text-sm font-bold text-amber-800">
              訂餐注意事項 / 公告
            </h3>

            {/* 操作按鈕 */}
            {!isEditing ? (
              <button
                onClick={handleEdit}
                className="flex items-center gap-1 rounded-md p-1.5 text-xs text-amber-600 transition-colors hover:bg-amber-100 hover:text-amber-800"
              >
                <Edit2 className="h-3 w-3" />
                <span className="hidden sm:inline">編輯</span>
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleCancel}
                  className="rounded-md p-1 text-neutral-500 hover:bg-neutral-100"
                  title="取消"
                >
                  <X className="h-4 w-4" />
                </button>
                <button
                  onClick={handleSave}
                  className="rounded-md bg-amber-500 p-1 text-white shadow-sm hover:bg-amber-600"
                  title="儲存"
                >
                  <Check className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          {/* 顯示與編輯切換 */}
          {isEditing ? (
            <textarea
              className="min-h-20 w-full rounded-md border border-amber-300 bg-white p-2 text-sm text-neutral-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
              value={tempContent}
              onChange={(e) => setTempContent(e.target.value)}
              placeholder="輸入公告事項..."
              autoFocus
            />
          ) : (
            <div className="prose prose-sm max-w-none text-sm leading-relaxed whitespace-pre-wrap text-neutral-700">
              {content || (
                <span className="text-neutral-400 italic">
                  暫無公告，點擊編輯新增...
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
