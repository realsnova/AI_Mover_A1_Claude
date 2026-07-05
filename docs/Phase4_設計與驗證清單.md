# Phase 4 設計文件：全量內容導入（395 字、10 區域）、劇情與儀表板

> 修改對象：`單字冒險.html`
> 素材：`wordlist.json`（395 字，已完成）、`monsters.json`（80 隻 + 10 館主，已完成）
> 前置：Phase 3 完成並通過驗證

## 1. 目標

從「單區 16 字」擴充為完整遊戲：10 個區域、395 個官方單字、區域解鎖進程、DQ 式開場與結局、給家長看的學習儀表板。

## 2. 資料導入方式（重要）

瀏覽器以 file:// 開啟時 **fetch 讀不到本地 json**，因此資料必須「內嵌」進 HTML：

- 把 `wordlist.json` 的 `words` 陣列內嵌為 `const WORDS_ALL = [...]`（約 110KB，總檔案 ~160KB，可接受）
- 把 `monsters.json` 內嵌為 `const MONSTERS = {...}`
- 建立查表：`const WORD_EMOJI = {}, WORD_ZH = {};  WORDS_ALL.forEach(w => { WORD_EMOJI[w.word]=w.emoji; WORD_ZH[w.word]=w.zh; })` → 取代現有 EMOJI_BANK/ZH_BANK（干擾字都是表內單字，直接查表）

## 3. 區域系統

- `REGIONS` 每區增加欄位：`topic`（對應 wordlist topic）、`monsters`（來自 MONSTERS）、`boss`
- 區域單字：`wordsOf(regionKey) = WORDS_ALL.filter(w => w.topic === region.topic)`
- **解鎖規則**：第 1 區開放；第 N 區需要第 N-1 區徽章；地圖鎖定卡顯示「需要 XX 徽章」
- 收服進度、圖鑑、道館、學習模式全部改為「per region」：
  - `state.caught[i]` 增加 `region` 欄位（migrate：舊資料補 "animals"）
  - 圖鑑頁改為分區顯示（區名標題 + 該區 6-8 格）
  - 道館門檻：該區收服 ≥ 6 隻（7 隻區域為 ≥ 5，時光神殿 7 隻）
- **冠軍之路（mixed，125 字）特別規則**：字量大，內部分 3 章各約 42 字（依 id 順序切），野戰選章出題；道館（超夢）需三章各答對過 30 字才開放

## 4. 題型調整（配合全量單字）

- 拼字題（C）：僅限 `/^[a-z]{3,8}$/`（含空格、斜線、大寫、連字號的字自動排除，如 bus stop、Monday、stomach-ache、o'clock）
- 聽音題（B）：需要正解有 emoji 且至少 2 個干擾字有 emoji，否則不出 B
- 填空題（D）：挖空邏輯已處理大小寫與變形（實測過 "Bats"→"＿＿＿s"）；多字詞（bus stop）直接整詞挖空
- 看圖題（A）：無 emoji 的字用中文字卡（機制已存在）
- 週幾/數字類（time_numbers）：題型 A 顯示中文字卡即可，不強求圖像

## 5. 劇情系統（DQ 風格）

- **開場**（首次遊玩才播）：**DQ11 風格分幕電影開場**（`Game.STORY` 10 幕，自動播放＋可點擊前進/跳過）：
  - 幕別分章：序章（星空傳說）→ 和平王國 → 災厄（黑暗魔王甦醒、打散寶可夢）→ 覺醒（勇者睜眼）→ 使命（集 10 徽章成為冠軍）
  - 每幕含：背景漸層切換（night/dawn/dark/day）、主角 emoji 大圖＋特效（星空 twinkle / 漂浮 float / 震動 shake / 金光 glow）、章節標題（序章/災厄/覺醒/使命）、逐字對話（45ms）
  - 配樂：`playOverture()` Web Audio 合成 DQ 序曲風主題曲（號角上行＋莊嚴行進＋低音，循環至開場結束）；魔王幕低沉音、覺醒幕光之和弦點綴
  - 對話框：黑底白框白字（DQ 經典），底部「▼」閃爍；每幕讀完 2.1 秒自動前進，點擊可加速/整句顯示，「⏩ 跳過開場」一鍵結束
- 對話框樣式：黑底白框白字（DQ 經典樣式），底部「▼」閃爍提示點擊
- **結局**（集滿 10 徽章）：全部館主 sprite 列隊 + 徽章展示 + 「你成為了單字冠軍！」+ 勝利音樂加長版；結局後開放「自由挑戰模式」（全部區域可重複玩）
- `state.storySeen: false` 控制開場只播一次（重置後會再播）

## 6. 學習儀表板（給家長/老師）

地圖頁角落「📊」按鈕進入：

- 每主題一列：主題名、學過字數/總字數、精熟度條（加權：box1=0分, box2=0.5, box3=1，平均後百分比）
- 總覽：總學習字數、總精熟度、連續登入天數、徽章數
- 「匯出學習紀錄」按鈕：把 wordStats 整理成文字（每字：單字/中文/盒別/答對答錯次數）複製到剪貼簿（navigator.clipboard，失敗時顯示可手動全選的 textarea）

## 7. 效能與存檔

- 395 字 wordStats 全滿時存檔約 60KB < 5MB localStorage 上限，安全
- `save()` 增加 `version: 4` 欄位；`load()` 遇到解析失敗 → 備份壞檔到另一個 key 後重置（不讓小朋友卡死）
- 內嵌資料後檔案變大：確認開啟速度（本機檔案無網路延遲，無虞）

## 8. 開發步驟

1. 內嵌 WORDS_ALL + MONSTERS + 查表重構（先確保原新手草原玩法不變）
2. 區域化改造（unlock/caught.region/分區圖鑑/分區道館/分區學習）
3. 冠軍之路三章規則
4. 開場與結局劇情
5. 儀表板
6. 驗證清單全測

### AI 開發 Prompt

> 「請閱讀 開發接手指南.md 與 Phase4_設計與驗證清單.md，把 wordlist.json 與 monsters.json 內嵌進 單字冒險.html，實作 10 區域全量內容、解鎖進程、劇情、儀表板。注意拼字題的單字過濾規則與聽音題的 emoji 條件。完成後依驗證清單瀏覽器實測，全部通過才算完成。」

## 9. 驗證清單

> 測試環境：Chrome（本機 http.server:8099 + 瀏覽器 JS 斷言/真點擊），2026-07-05。**全部通過 ✅**
> 檔案：`單字冒險.html` 內嵌全量資料後約 129KB（54KB→129KB）；全程 0 console error。

### 資料
- [x] W1. WORDS_ALL.length = 395、10 topic 字數與 wordlist.json 一致 ✅
- [x] W2. 每區 wordsOf() 字數正確 ✅（animals16/food22/body36/school29/sports24/home35/weather33/places39/time36/mixed125，總和 395）
- [x] W3. sprite 抽查 gen2/4/5/7 + 各 boss（152/251/447/722/495/150/143/108）8 個全載入成功（naturalWidth=96）✅
- [x] W4. 無 Unicode 13.0+ emoji 殘留 ✅（唯一落在 1FA70 區的 🩱 swimsuit 為 Unicode 12.0，符合「≤12」政策且 Twemoji 可轉圖）

### 區域解鎖
- [x] U1. 初始只開新手草原；取得草原徽章 → 美食村解鎖 ✅
- [x] U2. 未解鎖區顯示「需要 XX 徽章」（顯示前一區名）✅
- [x] U3. 每區道館各自獨立 ✅（bossOf/wordsOf per region：美食村 boss=大舌頭、出美食村字；野戰怪來自該區）
- [x] U4. 圖鑑分區顯示、收服數 per region 正確 ✅（新手草原2/8、美食村1/8、身體迷宮0/7 分區標題）

### 題型過濾
- [x] T1. bus stop / Monday / o'clock / stomach-ache 永不出拼字題 ✅（40 次抽樣皆無 C）
- [x] T2. 無 emoji 字（because）不出聽音題；看圖題顯示中文字卡 ✅（B 需正解+≥2 干擾字有 emoji）
- [x] T3. 多字詞填空正確挖空 ✅（bus stop → 「Wait at the ＿＿＿.」）
- [x] T4. 多區野戰（animals/food/mixed 各章）無 console 錯誤 ✅

### 劇情
- [x] N1. 首次開始 → 開場對話逐字顯示、點擊可跳過、播完進地圖 ✅
- [x] N2. 第二次開啟不再播開場（storySeen）；重置後 defaultState 回 false 會再播 ✅
- [x] N3. 注入 10 徽章 → 結局畫面（10 boss 列隊）+ 勝利音樂 + 自由挑戰模式開啟 ✅（結局不重播）

### 儀表板
- [x] B1. 精熟度計算正確 ✅（box3×2+box2×1+box1×1 → 2.5/4=63%；5×box2=50% 皆吻合）
- [x] B2. 匯出功能：clipboard 寫入；失敗時 textarea 備援有內容 ✅
- [x] B3. 儀表板中文顯示、4 項總覽 + 10 主題列 + 返回按鈕正常 ✅

### 效能與存檔
- [x] P1. 全 395 字 + 77 caught 有紀錄 → localStorage 43KB < 200KB、存讀正常、version=4 ✅
- [x] P2. 壞存檔（非 JSON）→ 自動備份至 _corrupt key 後重置、不白屏 ✅
- [x] P3. Phase 3 舊存檔 migrate 正常 ✅（caught 補 region=animals、補 storySeen/freeChallenge）

### 迴歸
- [x] R1. Phase 3 抽測：SRS 升降盒、進化觸發、每日獎勵 ✅
- [x] R2. Phase 1+2 抽測：四題型真點擊、道館獲勝發徽章+解鎖、商店購買、重置 ✅
