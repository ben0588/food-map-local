"use client";

import { useState } from "react";
import { Megaphone, Edit2, Check, X } from "lucide-react";

export default function Announcement() {
  const [content, setContent] = useState<string>("");
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [tempContent, setTempContent] = useState<string>("");

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
                className="flex cursor-pointer items-center gap-1 rounded-md p-1.5 text-xs text-amber-600 transition-colors hover:bg-amber-100 hover:text-amber-800"
              >
                <Edit2 className="h-3 w-3" />
                <span className="hidden sm:inline">編輯</span>
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleCancel}
                  className="cursor-pointer rounded-md p-1 text-neutral-500 hover:bg-neutral-100"
                  title="取消"
                >
                  <X className="h-4 w-4" />
                </button>
                <button
                  onClick={handleSave}
                  className="cursor-pointer rounded-md bg-amber-500 p-1 text-white shadow-sm hover:bg-amber-600"
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
