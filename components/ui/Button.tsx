"use client";

/**
 * Button 元件 - 通用按鈕元件
 * 提供多種視覺樣式變體 (primary, outline, ghost, danger)
 */
import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes } from "react";

// 定義可用的按鈕樣式變體
type Variant = "primary" | "outline" | "ghost" | "danger";

/**
 * Button Props 介面
 * 繼承原生 HTML button 的所有屬性 (onClick, disabled, type...)
 */
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant; // 按鈕樣式變體 (預設為 primary)
}

const Button = ({
  className,
  variant = "primary",
  ...props // 這裡的 props 自動包含了 onClick, children, type 等等
}: ButtonProps) => {
  const baseStyle =
    "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 cursor-pointer";

  const variants: Record<Variant, string> = {
    primary: "bg-orange-500 text-white hover:bg-orange-600 shadow-sm", // 主色調：激發食慾的橘
    outline:
      "border border-neutral-200 bg-white hover:bg-neutral-100 text-neutral-900",
    ghost: "hover:bg-neutral-100 text-neutral-500 hover:text-neutral-900",
    danger: "bg-red-50 text-red-600 hover:bg-red-100",
  };

  return (
    <button
      className={cn(
        baseStyle,
        variants[variant], // 因為有定義型別，這裡不再需要 'as keyof...' 強制轉型
        className,
      )}
      {...props}
    />
  );
};

export default Button;
