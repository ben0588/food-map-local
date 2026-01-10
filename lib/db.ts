/**
 * 資料庫配置檔案
 * 使用 Dexie.js 作為 IndexedDB 的封裝層
 */
import Dexie, { Table } from "dexie";
import { Store } from "@/types/store";

/**
 * FoodMapDB 類別：定義本地資料庫結構
 */
export class FoodMapDB extends Dexie {
  // 宣告 stores 資料表 (使用 ! 告訴 TypeScript 這會在 constructor 中初始化)
  stores!: Table<Store>;

  constructor() {
    // 設定資料庫名稱
    super("FoodMapLocalDB");

    // 定義資料庫版本與 Schema
    // ++id: 自動遞增的主鍵
    // name, isFavorite, updatedAt: 建立索引以加速查詢
    this.version(1).stores({
      stores: "++id, name, isFavorite, updatedAt",
    });
  }
}

// 匯出資料庫實例 (Singleton 模式，全域共用同一個資料庫連線)
export const db = new FoodMapDB();
