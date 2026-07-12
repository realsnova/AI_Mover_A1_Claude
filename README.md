# 單字冒險 — A1 Movers 英語單字學習遊戲

台灣國小三年級學生的 Cambridge English A1 Movers 單字學習遊戲：單一 HTML 檔、寶可夢收服/進化 + 勇者鬥惡龍式冒險、四種題型、道館考試、純點擊 UI、全繁體中文介面。

> **⚠️ 重要聲明：私人教學專案，不應被搜尋到**
> 
> 本專案為**個人教學用途**，GitHub repo 設為 Public 是因帳號限制（但已設定 `robots.txt` 禁止搜尋引擎索引，不應被 Google / Bing / 百度等搜尋到）。
>
> **使用範圍限制：**
> - ✅ 允許：個人學習、家庭、單一課堂內非商業使用
> - ❌ 禁止：公開部署、上架、收費、放廣告、大量散布
>
> **素材版權聲明：**
> 遊戲使用了寶可夢角色名稱與 [PokeAPI](https://pokeapi.co) sprite 圖檔。寶可夢為 The Pokémon Company / 任天堂之註冊商標與著作物，僅供個人/教室非商業使用。

## 快速開始

- **線上版（建議）**：<https://realsnova.github.io/AI_Mover_A1_Claude/> — 手機可「加入主畫面」安裝成 App（PWA），上線開過一次後**離線也能完整遊玩**。
- **本機版**：直接雙擊 [`單字冒險.html`](./單字冒險.html) 用瀏覽器（建議 Chrome/Edge）開啟。
- 進度自動存於瀏覽器 localStorage，無需帳號；跨裝置用遊戲內的「存檔碼」。
- 發音功能需系統有英文語音（無語音時聽力題型會自動停用，不會卡關）。

**📖 完整的玩法說明、家長/教師使用建議與疑難排解，請見 [`docs/使用說明書.md`](./docs/使用說明書.md)。**

## 專案結構

```
單字冒險.html          主程式（內嵌全部 398 字資料、10 區寶可夢資料、CC0 插畫）
index.html            入口頁（自動導向主程式）
manifest.json / sw.js  PWA：可安裝、離線可玩、版本更新提示
icons/                PWA 圖示（192/512 + maskable）
data/
  wordlist.json        398 字完整資料（meta + words）
  wordlist_檢查用.csv   給人工檢查的表格版
  monsters.json        10 區域寶可夢名冊（進化鏈 + 中文名 + 館主）
  source/              wordlist 的分主題原始檔（保留備查）
assets/
  audio/BGM_no1.mp3     開場配樂（Dean 自製音樂，遊戲進開場劇情時延遲載入）
docs/
  使用說明書.md                            玩法說明、家長/教師使用建議、升級路線圖
  開發接手指南.md                          給下一個開發 session 接手用的完整指南
  Phase6_商業級強化計畫書.md                Phase 6 的完整計畫與驗收標準
  A1-Movers-互動學習網頁-任務規劃.md          最初的整體產品規劃書
  Gemini版本開發用.md                       給 Gemini 等其他 AI 工具的自足開發規格
  Phase3/4/5_設計與驗證清單.md               各階段設計細節與瀏覽器實測紀錄
  驗證清單.md                              Phase 1+2 的 34 項實測紀錄
```

## 開發進度

| Phase | 內容 | 狀態 |
|-------|------|------|
| 0 | 官方單字資料建置 | ✅ 完成 |
| 1 | MVP：地圖/學習模式/看圖+聽音題/收服/圖鑑/存檔 | ✅ 完成 |
| 2 | 拼字題/填空題/道館/金幣商店/8-bit 音效 | ✅ 完成 |
| 3 | SRS 6 階間隔重複學習曲線/寶可夢進化/每日獎勵 | ✅ 完成 |
| 4 | 全量 10 區域、DQ11 風分幕開場劇情、儀表板 | ✅ 完成 |
| 5 | 出廠品管、強固化、家長使用說明 | ✅ 併入 Phase 6 完成 |
| 6 | 商業級強化：詞彙補至官方 100%（398 字）、音樂外部化（首屏 6.6MB→0.22MB）、PWA 離線+可安裝、音訊設定、錯題本、每日任務、口說跟讀、五視口+上線總驗收 | ✅ 完成 |
| 7 | A2 Flyers 進階區、多存檔槽位、無障礙…（候選，見[使用說明書](./docs/使用說明書.md)升級路線） | ⬜ 未排程 |

詳細開發歷程、技術決策與踩坑紀錄請見 [`docs/開發接手指南.md`](./docs/開發接手指南.md)。

## 技術重點

- **單一主程式**：CSS/JS/單字資料/CC0 插畫皆內嵌於 `單字冒險.html`，雙擊即玩；開場配樂改為外部檔延遲載入（首屏從 6.6MB 減至 0.22MB）。
- **PWA**：manifest + Service Worker——可安裝成 App、上線一次後離線可玩（怪獸圖/圖示以快取優先策略儲存）、新版本以橫幅提示玩家自行套用，不強制中斷。
- **學習科學**：SRS 6 階間隔重複曲線（1/2/4/7/15 天遞增），非簡單的答對/答錯二元記錄；錯題本與每日任務直接掛在同一套 SRS 資料上。
- **強韌性**：怪獸圖載入失敗自動以 👾 佔位；裝置無英文語音時聽力題型自動停用，玩家不會卡關。
- **音效**：8-bit 音效為 Web Audio API 程式合成，無版權疑慮；開場配樂 `assets/audio/BGM_no1.mp3` 為 Dean 自製原創音樂。

## 素材credits

- 寶可夢 sprite：[PokeAPI](https://pokeapi.co)（公開開發用途）
- 開場插畫（勇者／史萊姆）：CC0 公共領域素材，取自 [OpenGameArt.org](https://opengameart.org)（"Hero character sprite sheet" by far；"Slime" by Rick Hoppmann / TinyWorlds）
- emoji 圖示：[Twemoji](https://github.com/jdecked/twemoji)
- 開場配樂：Dean 原創音樂
