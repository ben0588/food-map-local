"use client";

import Link from "next/link";
import { Heart } from "lucide-react";

/**
 * Footer 元件 - 頁腳
 * 顯示版權資訊、作者宣告與隱私權連結
 */
export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-neutral-100 bg-white py-8 text-neutral-500">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          {/* 左側：品牌與作者 */}
          <div className="flex flex-col items-center gap-1 md:items-start">
            <p className="text-sm font-medium text-neutral-800">
              Food Map Local
            </p>
            <p className="flex items-center gap-1 text-xs">
              © {currentYear} Created with{" "}
              <Heart className="h-3 w-3 fill-rose-500 text-rose-500" /> by{" "}
              <span className="font-semibold text-neutral-700">Ben0588</span>
            </p>
          </div>

          {/* 右側：連結 */}
          <div className="flex items-center gap-6 text-xs">
            <Link
              href="/privacy"
              className="transition-colors hover:text-orange-500 hover:underline"
            >
              隱私權政策
            </Link>
            <a
              href="https://github.com/Ben0588"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-orange-500 hover:underline"
            >
              GitHub
            </a>
            <span className="cursor-default text-neutral-300 select-none">
              |
            </span>
            <span className="text-neutral-400">Local-First PWA</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
