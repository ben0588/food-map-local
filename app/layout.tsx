import type { Metadata } from "next";
import { ReactNode } from "react";
import { Noto_Sans_TC } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";

import "./globals.css";
import { ToastContainer } from "react-toastify";
import Footer from "@/components/features/Footer";

const NotoSansTC = Noto_Sans_TC({
  display: "swap",
  weight: ["400", "500", "600", "700"],
  variable: "--font-noto-sans-tc",
});

export const metadata: Metadata = {
  // 設定標題範例
  title: {
    default: "Food Map Local - 您的私人美食地圖",
    template: "%s | Food Map Local",
  },
  description:
    "採用 Local-First 技術建立的私人美食地圖。所有資訊皆儲存在您的瀏覽器中，不需註冊，確保絕對隱私且支援離線使用。",
  keywords: [
    "美食地圖",
    "餐廳筆記",
    "在地優先",
    "Local-First",
    "隱私工具",
    "離線使用",
    "IndexedDB",
    "美食筆記",
  ],
  authors: [{ name: "Ben0588" }],
  creator: "Ben0588",

  // 圖示設定
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },

  // 社群分享
  openGraph: {
    type: "website",
    locale: "zh_TW",
    url: "https://food-map-local.vercel.app", // 要換實際部屬網址
    title: "Food Map Local - 您的私人美食地圖",
    description:
      "不需帳號，開啟即用。最隱私的餐廳收藏工具，資料 100% 掌握在您手中。",
    siteName: "Food Map Local",
    images: [
      {
        url: "/1200x630.png", // 要換實際部屬網址
        width: 1200,
        height: 630,
        alt: "Food Map Local Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Food Map Local - 您的私人美食地圖",
    description: "最隱私的餐廳收藏工具，資料 100% 掌握在您手中。",
    images: ["/1200x630.png"], // 要換實際部屬網址
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Food Map Local",
    operatingSystem: "Web",
    applicationCategory: "LifestyleApplication",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "TWD",
    },
    description:
      "一個在地化的個人餐廳管理與美食地圖工具，使用 IndexedDB 儲存資訊。",
  };

  return (
    <html lang="zh-TW" className={`${NotoSansTC.variable} `}>
      <body className="font-sans antialiased">
        <div className="flex min-h-screen max-w-full flex-col">
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />
          <main className="grow">{children}</main>
          <Footer />
        </div>
        <ToastContainer />
        {/* Vercel 分析流量 */}
        <Analytics />
      </body>
    </html>
  );
}
