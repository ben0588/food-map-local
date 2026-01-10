import Button from "@/components/ui/Button";
import Link from "next/link";
import {
  ChevronLeft,
  ShieldCheck,
  Database,
  BarChart3,
  Lock,
} from "lucide-react";

export const metadata = {
  title: "隱私權政策 | Food Map Local",
  description: "了解 Food Map Local 如何保護您的隱私與資料安全。",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-neutral-50 px-4 py-12 font-sans text-neutral-800">
      <div className="mx-auto max-w-3xl">
        {/* Back Button */}
        <Link href="/">
          <Button
            variant="ghost"
            className="mb-8 flex items-center gap-2 text-neutral-600 hover:text-neutral-900"
          >
            <ChevronLeft className="h-4 w-4" />
            返回地圖
          </Button>
        </Link>

        <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
          <div className="bg-orange-500 p-8 text-white">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
              <ShieldCheck className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold">隱私權政策</h1>
            <p className="mt-2 text-orange-50 opacity-90">
              最後更新日期：2026 年 1 月 9 日
            </p>
          </div>

          <div className="space-y-8 p-8">
            {/* Section 1 */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-xl font-bold text-neutral-900">
                <Database className="h-5 w-5 text-orange-500" />
                <h2>1. 在地優先 (Local-First) 與資料儲存</h2>
              </div>
              <p className="leading-relaxed text-neutral-600">
                Food Map Local 是一款採用「在地優先
                (Local-First)」架構設計的應用程式。
                您的所有資料（包括店家名稱、食記、評分及圖片）都
                <strong>僅儲存在您的瀏覽器本地數據庫 (IndexedDB) 中</strong>。
                我們不會將您的個人美食資料上傳至任何伺服器。
              </p>
            </section>

            {/* Section 2 */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-xl font-bold text-neutral-900">
                <BarChart3 className="h-5 w-5 text-orange-500" />
                <h2>2. 第三方分析服務</h2>
              </div>
              <p className="leading-relaxed text-neutral-600">
                為了優化使用者體驗並了解應用程式的使用狀況，我們使用了{" "}
                <strong>Vercel Analytics</strong>。
                此服務會蒐集匿名的流量數據，例如：
              </p>
              <ul className="list-disc space-y-2 pl-6 text-neutral-600">
                <li>造訪頁面的次數與時間</li>
                <li>瀏覽器類型、作業系統與裝置類型</li>
                <li>概略的地理位置資訊（僅至城市等級，不含精確座標）</li>
              </ul>
              <p className="leading-relaxed text-neutral-600 italic">
                * Vercel Analytics 不會蒐集您的 IP
                地址或任何可識別身分的個人資訊，所有分析行為皆為去識別化處理。
              </p>
            </section>

            {/* Section 3 */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-xl font-bold text-neutral-900">
                <Lock className="h-5 w-5 text-orange-500" />
                <h2>3. 資料掌控權</h2>
              </div>
              <p className="leading-relaxed text-neutral-600">
                您對您的資料擁有 100% 的掌控權：
              </p>
              <ul className="list-disc space-y-2 pl-6 text-neutral-600">
                <li>
                  <strong>匯出與備份：</strong>
                  您可以隨時透過「備份」功能將所有資料導出為 JSON 檔案。
                </li>
                <li>
                  <strong>匯入：</strong>
                  您可以將備份檔案重新匯入，這在更換裝置時非常有用。
                </li>
                <li>
                  <strong>刪除：</strong>
                  當您手動刪除店家或清除瀏覽器快取資訊時，該資料將永久從您的裝置中移除。
                </li>
              </ul>
            </section>

            {/* Footer Text */}
            <div className="mt-12 border-t border-neutral-100 pt-8 text-sm text-neutral-400">
              <p>
                本隱私權政策旨在透明化 Food Map Local 的運作方式。
                如有任何疑問，歡迎透過本專案的原始程式碼討論區與我聯繫。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
