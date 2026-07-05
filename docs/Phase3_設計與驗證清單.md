# Phase 3 設計文件：間隔重複（SRS）、寶可夢進化、每日獎勵

> 修改對象：`單字冒險.html`（單一檔案內修改，不拆檔）
> 前置狀態：Phase 1+2 已完成並通過瀏覽器實測（見 驗證清單.md）

## 1. 目標

把「玩過就忘」變成「科學複習」：答對的字會隔天再考、答錯的字優先重考；複習成果用寶可夢進化視覺化；每日登入獎勵建立使用習慣。

## 2. 資料結構變更

`state.wordStats[id]` 從 `{correct, wrong}` 擴充為：

```js
{ correct: 0, wrong: 0, box: 1, lastSeen: "", correctDays: [] }
// box: 1~6 階間隔曲線（1=生字 2=剛學過 3=再次複習 4=逐漸熟悉 5=快要精熟 6=完全精熟）
// lastSeen: 最後出題日期 "YYYY-MM-DD"
// correctDays: 答對的「不同日期」清單（最多存 3 筆即可）
```

> **後續加強（同一 Phase 3 範圍內）**：3 盒制已升級為 **6 階間隔曲線**，間隔天數 `Game.SRS_INTERVALS = [null,0,1,2,4,7,15]`（索引=box），更貼近真實遺忘曲線的漸增節奏。`Game.SRS_BOX_NAMES` 提供中文階段名稱（生字/剛學過/再次複習/逐漸熟悉/快要精熟/完全精熟），用於圖鑑單字卡（顯示 ●○ 進度點 + 階段名 + 是否到期可複習）與匯出紀錄。`masteryPct()` 改為 6 階平滑漸層（(box-1)/5），進化門檻同步調整為 `box≥3`（進化一階）與 `box≥5 且跨 3 天答對`（進化二階）。舊版 3 盒存檔（box 1~3）數值仍在新範圍內，無需特殊遷移。

`state` 新增：

```js
lastLogin: "",      // 最後登入日期
streak: 0,          // 連續登入天數
shinyCaught: []     // 收服的「稀有(異色)」寶可夢 id
```

`state.caught[i]` 新增 `evoStage: 0`。

相容性：`load()` 時用 migrate 函式補齊舊存檔缺少的欄位（Object.assign 已處理頂層，wordStats 內層需逐筆補 box:1）。

## 3. SRS 出題邏輯（Leitner 3 盒）

- 答對 → `box = Math.min(box+1, 3)`；記錄當天到 `correctDays`（不重複）
- 答錯 → `box = 1`
- 到期規則：box1 隨時可考；box2 需 `lastSeen` ≥ 1 天前；box3 需 ≥ 3 天前
- **野戰組卷（5 題）**：2 題錯題（wrong>correct 且 box1，優先）→ 3 題新字（correct=0）→ 不足時補「到期複習字」→ 再不足補答對次數最少的字
- 道館組卷不變（隨機 10 題），但答題結果同樣更新 SRS

實作：在 Game 內新增 `SRS` 子物件（today()、grade(id, correct)、due(id)、buildQuiz(words, n)），戰鬥的 `answer()` 呼叫 `SRS.grade`，`startBattle` 呼叫 `SRS.buildQuiz`。

## 4. 寶可夢進化

- 每隻收服的寶可夢綁定 5 個單字（`caught[i].words`，已存在）
- 進化條件（以綁定單字的精熟度計算）：
  - `evoStage 0→1`：綁定單字全部 `box ≥ 2`
  - `evoStage 1→2`：綁定單字全部在「3 個不同日期」答對過（`correctDays.length ≥ 3`）→ 設計上自然需要跨 3 天遊玩
- 進化鏈資料：`monsters.json` 中每隻有 `chain: [基本形id, 進化1 id, 進化2 id]`（兩段式只有 2 個）；`evoStage` 超過鏈長取最後一個
- 顯示：圖鑑與戰鬥 sprite 一律 `SPRITE(chain[Math.min(evoStage, chain.length-1)])`
- 進化時機：每次收服畫面結束回地圖時檢查全部 caught；符合者播放進化動畫（overlay：舊 sprite 白光閃爍 3 次 → 換新 sprite → jingleVictory + 「XXX 進化成 YYY！」）；一次多隻就排隊逐一播
- 名稱：進化後圖鑑顯示 `chainNames[evoStage]`

## 5. 每日獎勵

- `showMap()` 時檢查：`lastLogin !== today` → 彈出每日獎勵視窗：
  - 基本：+10 金幣
  - `streak` 計算：昨天有登入 → streak+1，否則重設 1
  - `streak ≥ 3`：當天第一場野戰必定遇到「異色寶可夢」（sprite 改用 `.../sprites/pokemon/shiny/{id}.png`），收服後記入 `shinyCaught`，圖鑑加 ✨ 標記
- 視窗樣式沿用 region-menu 樣式（金框、置中、大按鈕「領取！」）

## 6. 開發步驟（依序）

1. state 結構擴充 + migrate
2. SRS 物件 + 接上 answer/startBattle
3. 進化資料（本 Phase 先只需要新手草原 8 隻的 chain，已在 monsters.json）+ 進化檢查與動畫
4. 每日獎勵視窗 + shiny 遭遇
5. 全部跑一次下方驗證清單

### AI 開發 Prompt（可直接貼用）

> 「請閱讀 開發接手指南.md 與 Phase3_設計與驗證清單.md，在 單字冒險.html 上實作 Phase 3 全部功能（SRS、進化、每日獎勵）。維持單一 HTML 檔、既有 UI 準則（純點擊、繁中介面、按鈕≥64px）。完成後依驗證清單用瀏覽器實測（測試方法見接手指南），全部通過才算完成。」

## 7. 驗證清單（實作後必測）

> 測試環境：Chrome（本機 http.server + 瀏覽器實測），2026-07-05。**全部通過 ✅**
> 測試方式：以 preview JS 斷言驗證 SRS/進化/每日獎勵邏輯，並實跑一場完整野戰（收服）+ 商店/道館/重置迴歸。

### SRS
- [x] S1. 舊存檔載入不壞：Phase2 存檔開啟後 wordStats 自動補 box/lastSeen/correctDays ✅（caught 補 evoStage、頂層補 shinyCaught/streak/lastLogin，coins 等原資料保留）
- [x] S2. 答對後該字 box +1（上限 3）、correctDays 記錄今天且不重複 ✅（連兩次答對 box=3 封頂、correctDays 只 1 筆）
- [x] S3. 答錯後該字 box 降回 1 ✅
- [x] S4. 組卷：有錯題時優先出現錯題（驗證 2 題錯題邏輯）✅（2 個錯題排在卷首）
- [x] S5. 組卷：新字（correct=0）出現於本場 ✅（補入 3 新字，去重、共 5 題）
- [x] S6. box2 的字當天不重複出（模擬 lastSeen=今天 → 不入卷）✅ due()=false
- [x] S7. 模擬 lastSeen=昨天 的 box2 字會入卷 ✅ due()=true；box3 需≥3 天亦驗證正確

### SRS 加強：6 階間隔曲線（2026-07-05 追加驗證，全過 ✅）
- [x] S8. 連續答對 7 次，box 依序 2→3→4→5→6→6→6（第 6 階封頂不再上升）✅
- [x] S9. 答錯後 box 打回 1（不論原本在哪一階）✅
- [x] S10. box2~6 各階間隔天數（1/2/4/7/15）：差 1 天不足 → due()=false；剛好滿足天數 → due()=true，5 階全部驗證通過 ✅
- [x] S11. box1 恆為 due()=true（生字隨時可考）✅
- [x] S12. masteryPct 6 階平滑漸層：5 字分別 box2~6 → (1+2+3+4+5)/5/5=60%，全部 box6→100%，皆與手算相符 ✅
- [x] S13. 進化門檻調整：綁定字全部 box=2（未達新門檻）→ 不進化；全部 box≥3 → 進化一階；全部 box≥5 且跨 3 天答對 → 進化二階，三者皆驗證正確 ✅
- [x] S14. 圖鑑單字卡新增 ●○ 進度點＋階段名稱＋到期狀態顯示（如「●●●●○○ 逐漸熟悉・⏳ 過幾天再來複習」）✅
- [x] S15. 匯出紀錄格式更新為「box/6(階段名稱)」，可讀性佳 ✅
- [x] S16. 舊版 3 盒存檔（box 1~3）載入後數值仍在新範圍內、due()/masteryPct() 皆正確運作，無需特殊遷移 ✅
- [x] S17. 迴歸：野戰組卷、完整戰鬥流程、儀表板顯示皆正常，0 console error ✅

### 進化
- [x] E1. 綁定 5 字全部 box≥2 → 觸發進化、sprite 與名稱變為第二階 ✅ eligibleStage=1（皮卡丘→雷丘）
- [x] E2. 5 字 correctDays≥3 → 進化第三階 ✅（三段式妙蛙種子→妙蛙花 stage2；兩段式皮卡丘 min 封頂於 1）
- [x] E3. 進化動畫：閃爍→換圖→音效→文字「進化成 XX！」✅（evo-blink→換 sprite→jingleVictory→文字）
- [x] E4. 進化後存檔重載，evoStage 保留 ✅（localStorage caught.evoStage=[1,1]）
- [x] E5. 兩隻同時符合 → 排隊逐一播放不重疊 ✅（_evoQueue 依序播放，皆升階完成）

### 每日獎勵
- [x] D1. 模擬 lastLogin=昨天 → 跳獎勵視窗 +10 金幣、streak+1 ✅（streak 2→3、coins+10、lastLogin=今天）
- [x] D2. 同一天第二次進地圖 → 不再跳 ✅（return false、金幣不變）
- [x] D3. 模擬 lastLogin=前天 → streak 重設為 1 ✅（shinyPending 回 false）
- [x] D4. streak≥3 → 下一場野戰為異色 sprite（shiny URL 載入成功）、收服後圖鑑顯示 ✨ ✅（enemy/catch/dex 皆 shiny/4.png、naturalWidth=96、shinyCaught=[4]、圖鑑「小火龍 ✨」）
- [x] D5. shiny sprite 網址失效時 fallback 正常（👾 替代）✅（沿用 Phase 1 全域 img error→👾 機制，未更動）

### 迴歸
- [x] R1. Phase 1+2 抽測：一場野戰四題型收服、道館門檻擋關、商店購買、重置，全部仍正常 ✅
- [x] R2. 無 console 錯誤、Twemoji 正常轉換 ✅（全程 0 error、img.emoji=54）
