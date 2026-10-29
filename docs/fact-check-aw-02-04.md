# aw-02 至 aw-04 正確性檢查

檢查日期：2026-10-29。範圍：三份 `index.tsx` 的投影片文字、講稿、頁序，並核對教材原文及範例筆記。aw-02 共 49 頁、aw-03 共 49 頁、aw-04 共 45 頁。未修改投影片。個人實測的秒數、模型輸出、版本畫面視為已標日期的觀察，未重新執行，不當作普遍保證。

## 應優先更正

### 1. aw-02 第 21 頁：孫權其實已在第 15 回登場

- 位置：`slides/aw-02/index.tsx:2880`，GrayReal 講稿。
- 原說法：「孫權在第 1 到 21 回還沒出場，所以大綱裡沒有他。」
- 判定：確定的小說內容錯誤。教材 `examples/aw-02-lab/三國人物知識庫/原文/第015回.txt:61` 已寫孫權守宣城；同檔第 85 行有周泰救出孫權的情節。
- 建議：「這份範例大綱省略了孫權，因此沒有他的連結；原文第 15 回其實已經有他。」此例也可說明摘要會遺漏資訊。
- 原文：[《三國演義》第十五回](https://zh.wikisource.org/wiki/三國演義/第015回)。

### 2. aw-03 第 21 頁：Node.js 的前置步驟遺失

- 位置：`slides/aw-03/index.tsx:2595`，InstallEli5 講稿；操作指令位於第 1361 行。
- 原說法：「需要第一堂裝好的 Node.js」。
- 判定：確定的跨堂依賴錯誤。aw-01 第 1973、3660 行已改成 Codex 獨立安裝，不需 Node.js；照主線上課的學生到此可能完全沒有 `npx`。第 20 頁第 2592 行還用 `npm install -g @openai/codex@latest` 排錯，也有同一問題。
- 建議：課前或此頁補裝 Node.js LTS，驗證 `node -v`、`npx --version`；更新 Codex 可沿用第一堂的獨立安裝方式。若採目前 skills 工具，README 要求 Node.js 22.20 以上，不應僅說有任何 Node 就能用。
- 來源：[skills 官方 README](https://github.com/vercel-labs/skills)、[npm npx 文件](https://docs.npmjs.com/cli/v11/commands/npx/)。

### 3. aw-03 第 23 頁：「裝完必須重開」與官方文件、同份教材矛盾

- 位置：`slides/aw-03/index.tsx:2604`；同份第 39 頁第 2683 行已記錄不重開也能偵測、使用新技能。
- 判定：目前版本說法錯誤。官方記載自動偵測技能更新，沒出現才重啟。課堂可以統一重開，但應稱作教學流程，不能說技術上必須。
- 建議：「Codex 會自動偵測新 Skill；若沒出現就重開。課堂統一重開確認一次。」
- 來源：[OpenAI：Build skills](https://learn.chatgpt.com/docs/build-skills)，Create a skill、Install curated skills for local use。

### 4. aw-03 第 14 頁：MCP 不是存取外部系統的必要條件

- 位置：`slides/aw-03/index.tsx:2567`，McpPlug 講稿：「要用外部系統，就要接 MCP。」
- 判定：確定的技術概念錯誤。MCP 是統一的連接協定；具備網路、認證與工具權限時，Agent 也能使用 API、CLI 或其他連接方式。Skill 也能教它使用這些既有工具。
- 建議：「MCP 是把外部工具與資料接進 Agent 的一種標準方式；是否能存取，還取決於工具、認證與權限。」
- 來源：[MCP 架構文件](https://modelcontextprotocol.io/docs/2026-07-28/learn/architecture)，Scope 與 Participants；官方列出本機和遠端 server，MCP 也不僅限外部雲端。

### 5. aw-04 第 31–32 頁：「相對 .md href 必定 404」不能套用目前模板

- 位置：`slides/aw-04/index.tsx:1783`、第 2607–2621 行的 HtmlTest、HtmlLinks 講稿；aw-03 第 42、44 頁第 2677、2701 行也有相同通則。
- 判定：目前上游模板已改變；既有的本機舊版實測可保留，但不能作為當前版本必然行為。
- 證據：目前模板 `src/helpers/linkUtils.js` 的 `convertMdHrefs` 會把相對 `.md`、`.markdown` 的 HTML `<a href>` 解析成網站 permalink；`.eleventy.js` 的 `resolveMdLinks` 使用它；`note.njk` 第 57 行對內容確實套用此 filter。目標須存在、已發布且解析成功。無目標仍會 404。
- 建議：改成「講師當時使用的模板測得 404；不同版本可能支援轉換，發布後應實際點連結」。本課要求純文字可以保留為簡化規則。
- 來源：[linkUtils.js](https://github.com/oleeskild/digitalgarden/blob/main/src/helpers/linkUtils.js)、[.eleventy.js](https://github.com/oleeskild/digitalgarden/blob/main/.eleventy.js)、[note.njk](https://github.com/oleeskild/digitalgarden/blob/main/src/site/_includes/layouts/note.njk)。

## 需要補條件或降低確定性的說法

### 6. aw-02 第 6 頁：「不用上傳到任何地方」易被理解成資料不出電腦

- 位置：`slides/aw-02/index.tsx:883`、2805。
- 正確部分：不用手動把筆記庫上傳到聊天介面，Codex 可用本機工具讀檔。
- 需要補充：用雲端模型時，讀到的相關內容會進入模型請求；CLI 在本機執行不代表模型推論全在本機。第 29 頁講稿第 2928 行自己也描述把句子送進模型。
- 建議：「不用手動上傳整個筆記庫；Codex 會讀相關檔案，使用雲端模型時會把需要的內容送給模型。」
- 來源：[OpenAI Local shell 文件](https://developers.openai.com/api/docs/guides/tools-local-shell)，官方描述本機執行後將輸出傳回模型的流程。此來源用來說明架構，並非將舊 API 等同現行 CLI 的每一項實作。

### 7. aw-03 第 12 頁：技能清單本身仍占上下文

- 位置：`slides/aw-03/index.tsx:1030`、2558–2561。
- 原說法：「裝了很多 Skill，會不會塞爆 Codex 的上下文？不會」「所以多裝幾個沒關係」。
- 判定：漸進載入的方向正確，但結論過度絕對。名稱、description、路徑仍消耗上下文；目前官方設定對初始目錄設預算，技能過多可能縮短描述，甚至略掉部分技能並警告。
- 建議：「不會把全部 Skill 全文一次載入，因此比較省上下文；技能很多時，目錄仍占空間，也可能有技能沒被列入。」
- 來源：[OpenAI：Build skills](https://learn.chatgpt.com/docs/build-skills)，progressive disclosure。

### 8. aw-03 第 21 頁：「Skill 有完整權限」需說清楚權限來源

- 位置：`slides/aw-03/index.tsx:1379`、2597。
- 判定：可保留安裝工具的原始警示，但教學標題容易讓學生以為 Skill 會自動提升至電腦管理員權限、繞過 sandbox。
- 建議：「Skill 會引導 Agent 使用它原本獲准的工具與權限；不會因為是文字檔就自動安全，也不會自動取得額外權限。」
- 來源：[OpenAI Security](https://learn.chatgpt.com/docs/security) 的 sandbox、approval 架構；[Agent Skills 規格](https://agentskills.io/specification) 定義的是指令與資源封裝，不是作業系統提權機制。

### 9. aw-02 第 18 頁：同名卡不是「另一張沒人連得到」

- 位置：`slides/aw-02/index.tsx:2862`。
- 判定：裸檔名 `[[劉備]]` 可能產生歧義，這個提醒有用；但可寫含資料夾的連結明確指向各自的同名卡。
- 建議：「兩張同名卡會讓只寫 `[[劉備]]` 的連結不夠明確；需要用資料夾路徑區分。今天先不放進來。」
- 來源：[Obsidian Internal links](https://obsidian.md/help/links)，含資料夾路徑的連結格式。

### 10. aw-02 第 43–44 頁：證據是否支持關係，應標為討論判斷

- 位置：`slides/aw-02/index.tsx:3010`、3011、3016。
- 原句「劉備已經站在孫權那一邊對抗曹操」已能支持同陣營對抗的解讀；只因語法主詞是劉備，不能斷言「孫權對抗曹操」完全沒有依據。它確實未描述兩人如何聯手，而且超出指定的兩個事件。
- 建議：保留問號，改成「這是間接支持，且超出本題事件範圍；應找〈赤壁之戰〉更直接的原句」，避免教成只能照字面逐字比對才算有證據。這是推論強度與任務邊界的判斷，列為需澄清，不列外部事實錯誤。

## 已核對通過與保留事項

- 頁序與 notes：三份均以 `deck.map(page => NOTES.get(page))` 對齊，49／49／45 個頁面均有對應 notes，未找到 aw-01 那類索引錯位。
- aw-02 第 6、8、20–22 頁的教材數字可由檔案重算：12 張正式卡；11 張卡共 17 處連到劉備；範例大綱 46 個不同連結、19 處劉備，合計 36 處；呂布 29、董卓 19，袁術、袁紹、李傕、孫堅各 6 次。數字正確，已限定範例大綱。
- aw-03 回目／年號：教材第 5 回無「初平」，第 19 回及第 46 回節選無「建安」，本課只依指定原文、不填外部年份合理。也已說明「依回目排」不是精確歷史年代。
- aw-04 fine-grained token 的單一 repo、Contents／Pull requests 讀寫，符合[外掛 README](https://github.com/oleeskild/obsidian-digital-garden)。dg-home、dg-publish、連到的卡不自動發布及兩個發布命令，也符合[官方入門](https://docs.forestry.md/getting-started/01-getting-started/)與[Commands](https://docs.forestry.md/getting-started/02-commands/)。
- aw-04 用 production domain 分享，並以無痕視窗驗收，是合理指引。[Vercel 文件](https://vercel.com/docs/deployment-protection)確認 Standard Protection 保護非 production domain；不應推論任何最短網址都必定公開，教材已要求實測。
- HTML 中 `[[劉備]]` 不解析的敘述保留為指定模板的本機測試結果，不當作 CommonMark 能保證所有外掛處理結果的證據；CommonMark 本身沒有規定 Obsidian wikilink。當前模板還有後處理 filter，因此「HTML 裡所有內容原封不動」不能作為全面原理。
- 逐頁覆蓋：aw-02 第 1–49 頁、aw-03 第 1–49 頁、aw-04 第 1–45 頁的講稿已通讀；重點技術頁另核對 JSX 文字、命令及引用。此為內容正確性審查，未操作 Windows、登入／部署外部帳號、重跑模型或重新產生畫面。沒有列出的頁面表示本次未找到可確證錯誤，不代表所有實測紀錄均已獨立重現。
