"use client";

/**
 * Input 元件 - 通用輸入框元件
 * 使用 forwardRef 以支援 ref 傳遞
 */
import { forwardRef, InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

/**
 * Input 元件
 * 繼承原生 input 的所有屬性 (onChange, value, placeholder...)
 * 使用 forwardRef 讓父層可以直接操作 input DOM 元素
 */
const Input = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "flex h-10 w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-neutral-500 focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:outline-none",
      className,
    )}
    {...props}
  />
));

/* 使用範例：
    <Input 
        // TS 自動知道這裡可以放 placeholder (來自 InputHTMLAttributes)
        placeholder="請輸入內容" 
        
        // TS 自動知道這裡可以放 onChange (來自 InputHTMLAttributes)
        onChange={(e) => console.log(e.target.value)} 
        
        // 自訂樣式 (透過 className 合併)
        className="bg-gray-100" 
    />
*/

Input.displayName = "Input";

export default Input;
