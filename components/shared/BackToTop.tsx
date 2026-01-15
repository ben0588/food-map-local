"use client";

/**
 * BackToTop 元件 - 回到頂端按鈕
 * 當使用者向下滾動超過 300px 時顯示
 * 點擊後平滑滾動回到頂部
 */
import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

export default function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);

  /**
   * 監聽滾動事件，判斷是否顯示按鈕
   */
  useEffect(() => {
    const handleScroll = () => {
      // 當滾動超過 300px 時顯示按鈕
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    // 監聽滾動事件
    window.addEventListener("scroll", handleScroll);

    // 清除監聽器
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  /**
   * 回到頂端函式
   * 使用 smooth 平滑滾動效果
   */
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // 當不可見時不渲染
  if (!isVisible) {
    return null;
  }

  return (
    <button
      onClick={scrollToTop}
      aria-label="回到頂端"
      className={cn(
        // 基礎樣式
        "fixed right-6 bottom-6 z-40 flex h-12 w-12 cursor-pointer items-center justify-center rounded-full shadow-lg transition-all duration-300 ease-in-out md:right-8 md:bottom-8",
        // 色彩與質感 (符合專案橘色系)
        "bg-orange-500/90 text-white backdrop-blur-sm hover:bg-orange-600 hover:shadow-xl hover:shadow-orange-500/30 active:scale-90",
        // 顯示/隱藏動畫邏輯
        isVisible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-12 opacity-0",
      )}
    >
      <ArrowUp className="h-6 w-6" strokeWidth={2.5} />
    </button>
  );
}
