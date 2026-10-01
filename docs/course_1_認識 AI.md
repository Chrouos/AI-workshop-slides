# Agentic AI 實戰：從 Chat 到 Codex 協作工作流

## 這堂課會學到什麼？

這堂課會介紹 Agentic AI 工具，帶大家認識 ChatGPT 與 Codex 適合的使用情境。

課程以 Codex 實作為主，流程如下：

`安裝 → 啟動 → 開始 Session → 查看 Status／Usage → 完成第一個 Codex 任務`

1. ChatGPT 和 Codex 的差異
2. 如何開始安裝與使用 Codex
3. 認識 Session、Status、Usage、Token 與 Memory
4. 如何更有效率地使用 Token
5. Skills 與 MCP 是什麼
6. 用一個不需要寫程式的專案，請 AI 讀懂專業筆記，再畫出知識圖

---

# ChatGPT、Codex 差在哪？

- **ChatGPT**：適合對話、發想、整理與問答
- **Codex**：適合把任務交給 AI，讓它閱讀檔案、使用工具並協助完成工作

![ChatGPT 與 Codex 的使用情境對照](assets/course-1-ai-basics/chatgpt-vs-codex.png)

Claude 也有類似的產品分工：Claude Chat 偏向對話，Claude Code 與 CoWork 則可以協作執行任務。

要理解這些工具的差異，可以先看 LLM 的演進：`文字生成 → 推理 → 使用工具 → 自主執行任務`

## LLM 的開始：看起來合理，不一定正確

2022 年 ChatGPT 出現後，LLM 開始被大量使用。

它能產生流暢、看似合理的回答，但回答仍可能出錯或編造資訊。這種現象常被稱為 **AI 幻覺（Hallucination）**。

例如，請它回答一個看似簡單的算術問題：

`2 + 4 + 7 + 9 + 23 + 1 + 5 + 7 + 2 + 5 + 74 + 2 + 7953 + 34 + 356 = ?`

![ChatGPT 對算術問題給出錯誤答案的示意](assets/course-1-ai-basics/llm-hallucination-calculation.png)

實際答案是 8484。回答的語氣很肯定，不代表模型真的完成了驗算。

圖片來源：[IT 邦幫忙：向 ChatGPT 對話的提問技巧與問題限制](https://ithelp.ithome.com.tw/articles/10315994)

早期模型也常出現回答中斷或失去上下文的情況：

![早期 ChatGPT 回答中斷的示意](assets/course-1-ai-basics/llm-incomplete-response.png)

圖片來源：[Cheers 快樂工作人](https://www.cheers.com.tw/article/article.action?id=5101461)

## 為什麼會有幻覺？

可以先把 LLM 簡單理解為：

`前面的文字 → 預測下一個 Token → 持續預測下一個 Token`

它會根據訓練資料中的語言模式，預測下一個最可能出現的 Token。因此，它很擅長產生「像答案」的文字。回答是否經過驗算，則要看模型本身、目前使用的模式，以及它是否使用計算器或程式碼等工具。

`很像正確答案 ≠ 真正知道答案`

## LLM 的進化：從回答到推理

後來，部分模型開始提供「Thinking」或推理模式。

![Thinking 模式先搜尋資料來源](assets/course-1-ai-basics/thinking-web-search.png)

這些模式會先把問題拆成幾個步驟，再整理答案。
像 CoT（Chain of Thought）就是讓模型逐步處理複雜問題的方法。

![Thinking 模式整理資料後產生回答](assets/course-1-ai-basics/thinking-research-answer.png)

## LLM 轉變成 Agentic AI 的關鍵

當模型可以使用工具，AI 除了回答問題，也能開始完成任務。

![Agent 完成任務的工作流程](assets/course-1-ai-basics/agent-task-flow.svg)

圖片說明：Agent 會先理解任務，再讀取工作區、使用工具，最後回報結果並等待下一步。

例如它可以：

- 讀取專案檔案與文件
- 搜尋資料或查詢系統
- 撰寫、修改與測試程式
- 根據結果調整下一步

具備目標、工具與執行能力的 AI，通常稱為 **Agentic AI**。

---

# ChatGPT 與 Codex：使用情境對照

| 工具    | 最適合做什麼                     | 典型例子                             |
| ------- | -------------------------------- | ------------------------------------ |
| ChatGPT | 對話、構思、解釋、整理           | 幫我整理會議重點、寫一份大綱         |
| Codex   | 讀取工作環境、使用工具、執行任務 | 幫我修改這個專案、檢查錯誤、更新文件 |

兩者的工作方式不同，可以這樣理解：

`ChatGPT 幫你想清楚 → Codex 幫你在工作環境中完成`

## 開始使用 Codex

這堂課主要使用 **Codex CLI**。

### 先安裝 Node.js

安裝 Codex CLI 前，需要先準備 Node.js 與 npm。請先到官方下載頁安裝 **LTS（長期支援版）**：

[下載 Node.js LTS](https://nodejs.org/en/download/)

安裝時使用預設選項即可。
安裝完成後，重新開啟終端機，讓新的指令路徑生效。

接著確認 Node.js 與 npm 是否可以使用。

```bash
# 確認 Node.js 已經安裝
$ node -v

# 確認 npm 已經可以使用
$ npm -v
```

![在命令提示字元確認 Node.js 與 npm](assets/course-1-ai-basics/node-npm-check.png)

如果兩個指令都有顯示版本號，就可以繼續安裝 Codex。如果出現「找不到指令」，先重新開啟終端機。仍然無法使用時，再執行一次 Node.js 安裝程式。

### 安裝並啟動 Codex

在命令提示字元中輸入：

```bash
# 安裝最新版 Codex CLI
$ npm install -g @openai/codex@latest
```

安裝完成後輸入：

```bash
# 啟動 Codex CLI
$ codex
```

第一次啟動時，依照畫面指示登入 ChatGPT 帳號。

可以把流程簡單理解成：

`下載 Node.js LTS → 確認 node/npm → 安裝 Codex → codex → 登入 → 開始 Session`

![Codex CLI 啟動畫面範例](assets/course-1-ai-basics/codex-cli-start.png)

圖片說明：先看兩個欄位：目前使用的 **Model**，以及 Codex 正在工作的 **Directory**。本課使用的 CLI 圖片來自實際輸出，帳號、Session ID 與即時額度已隱藏。

畫面中的 Model 名稱會隨版本與帳號改變。課堂重點是讀懂這些欄位，不用背特定模型名稱。

官方參考：[OpenAI Codex](https://openai.com/codex/)、[Using Codex with your ChatGPT plan](https://help.openai.com/en/articles/11369540-using-codex-with-your-chatgpt-plan)

## Session

Session 是一次 Codex 工作對話的「工作階段」。你可以在裡面下指令、讀檔案、修改程式與執行測試。Codex 也會保留這段對話的上下文，方便你繼續處理同一件事。

`開啟 Session → 描述任務 → Codex 修改 / 測試 → 持續追問`

Session 就像這一次協作的工作桌：你可以在裡面補充背景、提出問題、查看結果，再決定下一步。

![Session 工作桌與協作脈絡](assets/course-1-ai-basics/session-workspace.svg)

圖片說明：Session 會把這次協作中的背景、問題、結果與後續追問放在同一段工作脈絡裡。

對非工程背景的使用者來說，Session 的價值在於保留學習脈絡：

- 我現在想學什麼
- 我已經知道什麼
- 哪些地方還不懂
- Agent 已經整理出什麼
- 下一步要練習或查證什麼

### 動手試試看：讓 Codex 看懂專案

在課程提供的練習專案中啟動 Codex：

```bash
# 進入課程提供的練習專案
$ cd examples/teacher-learning-lab

# 啟動 Codex
$ codex
```

輸入：

```markdown
先不要修改檔案，請閱讀這個資料夾，告訴我：
1. 這個練習專案的用途
2. 每個檔案適合放什麼內容
3. 我可以如何開始一篇學習筆記
請先提出理解與建議，不要直接寫入檔案。
```

![教師學習練習場的第一個任務範例](assets/course-1-ai-basics/codex-cli-learning-task.png)

這個任務要觀察 Agent 的工作順序：**先讀取 → 形成理解 → 回報 → 等待下一步**。先不要修改檔案，才能看清楚「我要求 AI 做什麼」以及「AI 實際做了什麼」。

## Status

Status 用來查看 Codex 目前的執行環境資訊。

通常會顯示以下內容：

- 使用中的 Model
- Reasoning 等級
- 目前工作目錄
- 權限模式
- Session ID
- 帳號方案與使用狀態

你可以把它想成 Codex 的「系統資訊頁」。

![Codex CLI `/status` 輸出範例](assets/course-1-ai-basics/codex-cli-status.png)

下面這張表可以協助你讀懂 `/status` 的內容：

| 欄位        | 可以怎麼理解                                     |
| ----------- | ------------------------------------------------ |
| Model       | 目前使用哪個模型，以及推理設定                   |
| Directory   | Agent 目前工作的資料夾；這會影響它能讀到哪些檔案 |
| Permissions | Agent 可以做哪些操作，是否需要你核准             |
| Agents.md   | 專案是否有額外的工作規則                         |
| Session     | 這次協作的識別資訊                               |
| Usage       | 目前可用的時間／額度摘要；不是單一問題的分數     |

### 動手試試看：查看目前環境

在 Codex 中執行：

```text
/status
```

找出並記下：

- Model
- Directory
- Permission

想一想：Codex 現在使用哪個模型？正在看哪個資料夾？可以做哪些事情？

這個練習要養成的習慣是：**要求 Agent 做事前，先確認它在哪裡、看得到什麼，以及能不能修改檔案。**

## Usage

Usage 用來查看 Codex 目前的使用額度。

通常包含：

- 已使用多少額度
- 剩餘多少額度
- 額度何時 Reset
- 是否還有額外的 Usage Reset

它回答的是：

> 「我現在還能用多少 Codex？」

在目前的 CLI 畫面中，Usage 會和 `/status` 一起呈現時間範圍與剩餘量。課堂上只要先分清楚：

- **Usage** 是帳號／方案的使用額度
- **Token** 是模型處理文字與檔案的單位

使用 AI 工具時，也要留意自己的使用額度與成本。

![Usage 與 Token 的差異](assets/course-1-ai-basics/usage-vs-token.svg)

圖片說明：Usage 看帳號或方案還能使用多少；Token 看這次工作處理了多少文字與檔案。

---

## Token

Token 是 LLM 處理文字時使用的基本單位。你的 Prompt、程式碼、Codex 讀到的檔案，以及 Codex 的回答，都會被轉換成 Token。

```text
Prompt + Code + Files + History
              ↓
            Token
              ↓
             LLM
```

Session 越長、讀取的檔案越多，通常需要處理的 Token 也越多。

### 動手試試看：讓 Prompt 限制範圍

比較下面兩個 Prompt：

#### Prompt A

```markdown
幫我整理這個學習主題
```

#### Prompt B

```markdown
只根據 notes/cognitive-load-theory.md
整理成：
- 1 個核心概念
- 1 個學生可能的錯誤理解
- 2 個檢查理解的問題
不要新增檔案，也不要加入原筆記沒有提到的事實
```

想一想：哪一個 Prompt 比較容易讓 Agent 找到正確方向？

Prompt 的範圍越清楚，Agent 越不需要搜尋無關檔案、進行額外推理或呼叫多餘工具，也能減少 Token 與 Tool Calls。對師培生而言，這就像備課時說清楚「只看這一份草稿、整理成這三種結果」，比「幫我處理一下」更容易得到可用的內容。

---

## Memory

Memory 是 Codex 在工作過程中保留的「上下文資訊」。

例如：

- 前面討論過什麼
- 專案有哪些限制
- 已經做過哪些修改
- 接下來正在處理什麼

這些資訊讓你不必每次都重新解釋整個專案。

在這堂課，我們把 Memory 分成兩層：

1. **Session 內的記憶**：目前這次對話中已經談過的內容、限制與決定。
2. **專案裡的記憶**：寫在 `README.md`、`AGENTS.md`、模板與筆記中的背景資料。換到另一個 Session 後，這些檔案仍然可以被重新讀取。

![Memory 的兩層結構](assets/course-1-ai-basics/memory-layers.svg)

圖片說明：Session 記憶保留這次對話的脈絡；專案檔案則保存換到其他 Session 後仍可重新讀取的背景資料。

因此，Memory 不代表 AI 永遠記得所有事情。對初學者最實用的做法，是把重要規則與學習成果寫成檔案，而不是只留在聊天裡。

可以這樣區分：

`Session = 這次工作的容器；Memory = 容器裡保留下來的上下文；Token = 模型用來理解這些資訊的單位`

- **Session**：一次持續進行的協作工作。AI 會保留這次工作需要的上下文。
- **Status**：目前 Codex 的執行環境資訊，例如 Model、Reasoning、Directory、Permissions 與 Session。
- **Usage**：這次工作使用了多少模型資源與額度。
- **Token**：模型讀取與產生文字的基本單位，不完全等於中文字數或英文單字數。
- **Memory**：可延續的偏好或背景資訊，讓 AI 不需要每次都從零開始理解你。

## 給師培生的練習專案：讓 Agent 讀懂專業筆記

本課提供一個只含 Markdown 檔案的練習專案：[teacher-learning-lab](../examples/teacher-learning-lab/)。整個練習不需要寫程式，適合正在修習教育心理學、教育社會學與教育哲學等課程的師培生。

這次練習會用六份教育專業筆記，帶你掌握不同理論的核心概念、概念之間的關係，以及需要進一步查證的地方。請讓 Agent 先掃描全部筆記，再選一份用 ASCII 整理，最後用 Skill 畫成知識圖。

六份筆記包括：

- 認知負荷理論
- 近側發展區與鷹架
- 布魯姆教育目標分類學
- 杜威的經驗教育
- 隱性課程
- 文化資本

這次練習會產生三類成果，分別放在：

- `notes/`：六份原始專業筆記
- `outputs/`：第二個練習產生的 ASCII 知識結構
- `diagrams/`：第三個練習產生的 HTML、SVG 或 PNG 圖檔

### 三個任務

#### 任務 1：讓 Codex 看懂專案

```markdown
先不要修改任何檔案。

請閱讀這個練習專案，告訴我：
1. 這個專案是做什麼的？
2. notes/ 裡有哪六份專業筆記？
3. 請依照教育心理學、教育哲學、教育社會學或教學設計分類。
4. 哪兩份筆記最適合放在一起比較？為什麼？
5. 三個練習的順序與關係是什麼？
```

接著輸入：

```markdown
請閱讀 notes/ 裡的六份專業筆記。

請整理成一張表：
- 筆記名稱
- 所屬領域
- 核心問題
- 3 個專有名詞
- 一個教育情境
- 一個常見誤解

先不要修改任何檔案。
```

#### 任務 2：嘗試畫出 ASCII 知識點

```markdown
請再次閱讀 notes/cognitive-load-theory.md。

請用 ASCII 樹狀結構或箭頭，整理這份筆記的知識點，包含：
1. 中心問題
2. 核心概念
3. 專有名詞
4. 概念之間的關係
5. 教育情境
6. 常見誤解

不要加入原筆記沒有提到的事實。
先把 ASCII 草稿顯示給我，等我確認後再寫入：
outputs/cognitive-load-theory-ascii.md
```

確認內容後：

```markdown
請把剛才確認過的 ASCII 知識結構寫入：
outputs/cognitive-load-theory-ascii.md

只保存 ASCII 結構與必要的簡短說明，不要改寫原本的專業筆記。
```

#### 任務 3：使用 Skill 畫出筆記

先安裝 [diagram-design](https://github.com/cathrynlavery/diagram-design) skill：

```bash
# 加入 diagram-design 的 Plugin Marketplace
$ codex plugin marketplace add cathrynlavery/diagram-design

# 安裝 diagram-design plugin
$ codex plugin add diagram-design@diagram-design
```

重新開啟 Codex Session 後輸入：

```markdown
請閱讀：
- notes/cognitive-load-theory.md
- outputs/cognitive-load-theory-ascii.md

請使用 diagram-design skill，把這份專業知識筆記畫成一張適合初學者理解的知識圖。

要求：
- 先判斷這份筆記適合使用哪一種圖
- 保留中心問題、主要概念與概念之間的關係
- 不要加入筆記中沒有提到的事實
- 先提出圖的設計，再開始產生圖
- 將最後的圖檔保存到 diagrams/
```

這三個任務會讓 AI 依序掃描、比較與整理筆記，最後畫出概念之間的關係：**先掃描、再比較、再整理，最後視覺化**。

![同一份筆記的三種成果](assets/course-1-ai-basics/learning-output-preview.svg)

圖片說明：同一份專業筆記會先保留原始內容，再整理成 ASCII 知識結構，最後產生視覺化知識圖。

### 師培生的專業筆記理解流程

`閱讀專業筆記 → 用自己的話理解 → ASCII 整理知識點 → 使用 Skill 產生知識圖 → 回頭檢查是否忠於原文`

最後，請你反思四件事：

- 我是否真的理解這份專業筆記，而不是只看過一遍？
- ASCII 結構是否保留了原筆記的重點？
- 最後的圖是否讓沒有背景知識的人更容易理解？
- 哪些地方仍然需要回到課本、論文或教師說明確認？

## 如何更有效率地使用 Token

重點是讓 AI 更快找到正確範圍，減少不必要的工作與 Token 消耗。

- 先說清楚目標、檔案範圍與完成標準
- 一次聚焦一個任務，避免在同一個 Session 混入太多主題
- 需要提供給工具的技術名稱與指令，盡量保留英文，較不容易產生誤解
- 善用 **Skills**，讓 AI 依既定流程完成特定工作
- 可以先用工具讀檔、查資料或執行檢查，不要要求模型憑空猜測
- 留意上下文空間（headroom）。任務太長時，適時整理內容或切換 Session

## Skills 與 MCP 是什麼？

- **Skills**：AI 的工作指南或標準流程，用來告訴 AI 如何建立簡報、修改文件或檢查程式。
- **MCP**：讓 AI 連接到外部工具與資料來源的標準方式，例如 Google Drive、GitHub、資料庫或公司內部系統。

![Skill 與 MCP 的差異](assets/course-1-ai-basics/skill-vs-mcp.svg)

圖片說明：Skill 提供工作方法；MCP 讓 AI 連接外部工具與資料。

可以把它們想成：

`Skills = 工作方法`

`MCP = 可使用的外部工具`

Skills 讓 AI 遵循特定工作方法，MCP 讓它連接外部工具與資料。兩者搭配後，AI 就能在更多工作情境中協作。

### 動手試試看：Skill 還是 MCP？

看看下面兩個情境，判斷各自適合用 Skill 還是 MCP：

1. 每次 Review PR，都希望 AI 按照公司的 10 條規範檢查。
2. 希望 AI 可以查詢公司的 Jira 或資料庫。

判斷結果：

- 固定的工作方法與檢查流程 → **Skill**
- 連接外部系統、取得資料或執行外部操作 → **MCP**

可以記成：

`Skill = 方法；MCP = 工具`
