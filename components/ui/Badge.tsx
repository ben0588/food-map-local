"use client";

/**
 * Badge 元件 - 標籤元件
 * 用於顯示小型標記資訊（如營業時間、外送門檻等）
 */
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

/**
 * Badge 元件
 * @param children - 標籤內容
 * @param className - 額外的 CSS 類別（可選）
 */
const Badge = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  return (
    <span
      className={cn(
        "focus:ring-ring inline-flex items-center rounded-full border border-transparent bg-neutral-100 px-2.5 py-0.5 text-xs font-semibold text-neutral-900 transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none",
        className,
      )}
    >
      {children}
    </span>
  );
};

export default Badge;
