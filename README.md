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

直接雙擊 [`單字冒險.html`](./單字冒險.html) 用瀏覽器（建議 Chrome/Edge）開啟即可遊玩。

- 需要網路：載入寶可夢 sprite（PokeAPI）與 emoji 圖示（Twemoji CDN）；離線時會自動 fallback 顯示 👾 或原生 emoji，遊戲仍可玩。
- 進度自動存於瀏覽器 localStorage，無需帳號、無需安裝。
- 發音功能需系統有安裝英文語音（Web Speech API）。

## 專案結構

```
單字冒險.html          主程式（單一檔案，內嵌全部 395 字資料、10 區寶可夢資料、
                       CC0 插畫、開場配樂 data URI，離線可玩）
data/
  wordlist.json        395 字完整資料（meta + words）
  wordlist_檢查用.csv   給人工檢查的表格版
  monsters.json        10 區域寶可夢名冊（進化鏈 + 中文名 + 館主）
  source/              wordlist 的分主題原始檔（保留備查）
assets/
  audio/BGM_no1.mp3     開場配樂原始檔（Dean 自製音樂，已內嵌進主程式，此為可編輯母檔）
docs/
  開發接手指南.md                          給下一個開發 session 接手用的完整指南
  A1-Movers-互動學習網頁-任務規劃.md          最初的整體產品規劃書
  Gemini版本開發用.md                       給 Gemini 等其他 AI 工具的自足開發規格
  Phase3/4/5_設計與驗證清單.md               各階段設計細節與瀏覽器實測紀錄
  驗證清單.md                              Phase 1+2 的 34 項實測紀錄
```

## 開發進度

| Phase | 內容 | 狀態 |
|-------|------|------|
| 0 | 395 字官方單字資料 | ✅ 完成 |
| 1 | MVP：地圖/學習模式/看圖+聽音題/收服/圖鑑/存檔 | ✅ 完成 |
| 2 | 拼字題/填空題/道館/金幣商店/8-bit 音效 | ✅ 完成 |
| 3 | SRS 6 階間隔重複學習曲線/寶可夢進化/每日獎勵 | ✅ 完成 |
| 4 | 全量 395 字、10 區域、DQ11 風分幕開場劇情、儀表板 | ✅ 完成 |
| 5 | 出廠品管、強固化、家長使用說明 | ⬜ 待做 |

詳細開發歷程、技術決策與踩坑紀錄請見 [`docs/開發接手指南.md`](./docs/開發接手指南.md)。

## 技術重點

- **單一檔案原則**：所有 CSS/JS/資料/CC0 插畫/開場配樂皆內嵌於 `單字冒險.html`（data URI），雙擊即玩，不需伺服器。
- **學習科學**：SRS 6 階間隔重複曲線（1/2/4/7/15 天遞增），非簡單的答對/答錯二元記錄。
- **音效**：8-bit 音效與部分配樂為 Web Audio API 程式合成，無版權疑慮。
- **開場配樂**：`assets/audio/BGM_no1.mp3` 為 Dean 自製原創音樂。

## 素材credits

- 寶可夢 sprite：[PokeAPI](https://pokeapi.co)（公開開發用途）
- 開場插畫（勇者／史萊姆）：CC0 公共領域素材，取自 [OpenGameArt.org](https://opengameart.org)（"Hero character sprite sheet" by far；"Slime" by Rick Hoppmann / TinyWorlds）
- emoji 圖示：[Twemoji](https://github.com/jdecked/twemoji)
- 開場配樂：Dean 原創音樂
