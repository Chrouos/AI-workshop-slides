# Agentic AI 實戰：從 Chat 到 Codex 協作工作流

## 這堂課會學到什麼？

這堂課會帶大家認識 Agentic AI 工具，並實際理解 ChatGPT 與 Codex 的使用情境。

這堂課以實際操作 Codex 為主，跟著以下流程進行：

`安裝 → 啟動 → 開始 Session → 查看 Status／Usage → 完成第一個 Codex 任務`

1. ChatGPT 和 Codex 的差異
2. 如何開始安裝與使用 Codex
3. 認識 Session、Status、Usage、Token 與 Memory
4. 如何更有效率地使用 Token
5. Skills 與 MCP 是什麼
6. 用一個不需要寫程式的專案，讓 AI 協助學習與備課

---

# ChatGPT、Codex 差在哪？

- **ChatGPT**：適合對話、發想、整理與問答
- **Codex**：適合把任務交給 AI，讓它閱讀檔案、使用工具並協助完成工作

![ChatGPT 與 Codex 的使用情境對照](assets/course-1-ai-basics/chatgpt-vs-codex.png)

Claude 也有類似分工：
Claude Chat 偏對話；Claude Code 與 CoWork 則更接近「可以協作執行任務」的工具。

要理解這些工具的差異，可以先看 LLM 的演進：`文字生成 → 推理 → 使用工具 → 自主執行任務`

## LLM 的開始：看起來合理，不一定正確

2022 年 ChatGPT 出現後，LLM 正式走進大眾生活。

它很會生成流暢、看起來有道理的回答；但不一定真的理解內容，也可能答錯或編造資訊。這種現象常被稱為 **AI 幻覺（Hallucination）**。

例如，請它回答一個看似簡單的算術問題：

`2 + 4 + 7 + 9 + 23 + 1 + 5 + 7 + 2 + 5 + 74 + 2 + 7953 + 34 + 356 = ?`

![ChatGPT 對算術問題給出錯誤答案的示意](assets/course-1-ai-basics/llm-hallucination-calculation.png)

實際答案是 8484。這個例子用來說明：語氣很肯定的回答，不一定代表模型真的完成了驗算。

圖片來源：[IT 邦幫忙：向 ChatGPT 對話的提問技巧與問題限制](https://ithelp.ithome.com.tw/articles/10315994)

早期模型也常出現回答中斷或失去上下文的情況：

![早期 ChatGPT 回答中斷的示意](assets/course-1-ai-basics/llm-incomplete-response.png)

圖片來源：[Cheers 快樂工作人](https://www.cheers.com.tw/article/article.action?id=5101461)

## 為什麼會有幻覺？

可以先把 LLM 簡單理解為：

`前面的文字 → 預測下一個 Token → 持續預測下一個 Token`

它會根據訓練時看過的大量文字，從相似的語言模式中預測下一個最可能出現的 Token。

所以它很擅長產生「像答案」的文字；至於是否驗算，則取決於模型能力、目前模式，以及它是否使用計算器或程式碼等工具。

`很像正確答案 ≠ 真正知道答案`

## LLM 的進化：從回答到推理

後來模型開始加入「Thinking」或推理能力

![Thinking 模式先搜尋資料來源](assets/course-1-ai-basics/thinking-web-search.png)

簡單來說，模型不只直接回答，而是先把問題拆成幾個步驟，再整理出答案
像 CoT（Chain of Thought）就是讓模型逐步處理複雜問題的方法

![Thinking 模式整理資料後產生回答](assets/course-1-ai-basics/thinking-research-answer.png)

## LLM 轉變成 Agentic AI 的關鍵

當模型可以使用工具，AI 就不只是「回答問題」，而是能開始「完成任務」。

例如它可以：

- 讀取專案檔案與文件
- 搜尋資料或查詢系統
- 撰寫、修改與測試程式
- 根據結果調整下一步

這類具備目標、工具與執行能力的 AI，我們通常稱為 **Agentic AI**。

---

# ChatGPT 與 Codex：使用情境對照

| 工具    | 最適合做什麼                     | 典型例子                             |
| ------- | -------------------------------- | ------------------------------------ |
| ChatGPT | 對話、構思、解釋、整理           | 幫我整理會議重點、寫一份大綱         |
| Codex   | 讀取工作環境、使用工具、執行任務 | 幫我修改這個專案、檢查錯誤、更新文件 |

兩者不是誰取代誰，而是不同的工作方式：

`ChatGPT 幫你想清楚 → Codex 幫你在工作環境中完成`

## 開始使用 Codex

這堂課主要使用 **Codex CLI**。

先確認電腦已經有 Node.js 與 npm：

```bash
node -v
npm -v
```

接著安裝 Codex：

```bash
npm install -g @openai/codex
```

安裝完成後輸入：

```bash
codex
```

第一次啟動時，依照畫面指示登入 ChatGPT 帳號即可。

可以把流程簡單理解成：

`安裝 Node.js → 安裝 Codex → codex → 登入 → 開始 Session`

![Codex CLI 啟動畫面範例](assets/course-1-ai-basics/codex-cli-start.png)

圖片說明：這個畫面先看兩件事——目前使用哪個 **Model**，以及 Codex 正在工作的 **Directory**。本課的 CLI 圖片以實際輸出為基礎，帳號、Session ID 與即時額度已隱藏。

畫面中的 Model 名稱會隨版本與帳號而變；課堂重點是會讀懂欄位，不需要背住特定模型名稱。

官方參考：[OpenAI Codex](https://openai.com/codex/)、[Using Codex with your ChatGPT plan](https://help.openai.com/en/articles/11369540-using-codex-with-your-chatgpt-plan)

### 動手試試看：讓 Codex 看懂專案

進入一個自己的專案資料夾：

```bash
cd my-project
codex
```

接著輸入：

```markdown
先不要修改任何檔案

請閱讀這個專案，告訴我：
1. 這個專案是做什麼的
2. 使用哪些主要技術
3. 程式進入點在哪裡
```

請觀察 Codex 如何：

`理解任務 → 查看檔案 → 搜尋程式碼 → 整理結果`

這是最基本的 Agentic 工作方式。ChatGPT 通常需要你先把資料貼進對話；Codex 則可以自己進入工作環境找資訊。

---

## Session、Status、Usage、Token 與 Memory

### Session

一次 Codex 工作對話的「工作階段」

你在這個 Session 裡下指令、讀檔案、修改程式、執行測試
Codex 會保留這段對話中的上下文，方便持續處理同一件事情

`開啟 Session → 描述任務 → Codex 修改 / 測試 → 持續追問`

Session 可以先理解成「這一次協作的工作桌」：你在同一個 Session 裡逐步補充背景、提出問題、看結果，再決定下一步。

對非工程背景的使用者來說，Session 最重要的不是記住指令，而是保留學習脈絡：

- 我現在想學什麼
- 我已經知道什麼
- 哪些地方還不懂
- Agent 已經整理出什麼
- 下一步要練習或查證什麼

### 動手試試看：先讓 Agent 讀懂工作區

在課程提供的練習專案中啟動 Codex：

```bash
cd examples/teacher-learning-lab
codex
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

這個任務的重點是觀察 Agent 的工作順序：**先讀取 → 形成理解 → 回報 → 等待下一步**。先不要修改檔案，可以讓初學者清楚分辨「我要求 AI 做什麼」與「AI 實際做了什麼」。

---

### Status

查看目前 Codex 的執行環境資訊

通常可以看到：

- 使用中的 Model
- Reasoning 等級
- 目前工作目錄
- 權限模式
- Session ID
- 帳號方案與使用狀態

可以把它理解成 Codex 的「系統資訊頁」

![Codex CLI `/status` 輸出範例](assets/course-1-ai-basics/codex-cli-status.png)

可以用下面這張表讀 `/status`：

| 欄位 | 可以怎麼理解 |
| --- | --- |
| Model | 目前使用哪個模型，以及推理設定 |
| Directory | Agent 目前工作的資料夾；這會影響它能讀到哪些檔案 |
| Permissions | Agent 可以做哪些操作，是否需要你核准 |
| Agents.md | 專案是否有額外的工作規則 |
| Session | 這次協作的識別資訊 |
| Usage | 目前可用的時間／額度摘要；不是單一問題的分數 |

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

這裡的學習目標不是背欄位名稱，而是養成一個習慣：**在要求 Agent 做事前，先確認它在哪裡、看得到什麼、能不能修改。**

---

### Usage

查看目前 Codex 的使用額度

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
- 使用很多 Token 不一定等於立刻用完所有 Usage；兩者是不同層次的概念

教學時建議不要要求學生記住精確計算方式，而是讓他們在任務前後觀察：讀很多檔案、來回很多次、輸出很長內容，通常都會讓工作量增加。

---

### Token

LLM 處理文字時使用的基本單位

你的 Prompt、程式碼、Codex 讀到的檔案，以及 Codex 的回答
都會被轉換成 Token

```text
Prompt + Code + Files + History
              ↓
            Token
              ↓
             LLM
```

Session 越長、讀取的檔案越多
需要處理的 Token 通常也會越多

### 動手試試看：讓 Prompt 限制範圍

比較下面兩個 Prompt：

#### Prompt A

```markdown
幫我整理這個學習主題
```

#### Prompt B

```markdown
只根據 notes/example-ai-learning.md
整理成：
- 3 個核心概念
- 1 個生活化例子
- 2 個自我檢查問題
不要新增檔案，也不要加入原筆記沒有提到的事實
```

請問大家：哪一個比較容易讓 Agent 少走冤枉路？

通常範圍越清楚，Agent 就越不需要搜尋無關檔案、做額外推理或呼叫多餘工具，也就能減少 Token 與 Tool Calls。對教職人員而言，這就像備課時說清楚「只看這一篇教材、整理成這三種結果」，比「幫我處理一下」更容易得到可用的內容。

---

### Memory

Codex 在工作過程中保留的「上下文資訊」

例如：

- 前面討論過什麼
- 專案有哪些限制
- 已經做過哪些修改
- 接下來正在處理什麼

讓你不用每次都重新解釋整個專案

在這堂課可以把 Memory 分成兩層：

1. **Session 內的記憶**：目前這次對話中已經談過的內容、限制與決定。
2. **專案裡的記憶**：寫在 `README.md`、`AGENTS.md`、模板與筆記中的背景資料。換一個 Session 後，這些檔案仍然可以被重新讀取。

因此，Memory 不代表 AI 永遠記得所有事情。對初學者最實用的做法，是把重要規則與學習成果寫成檔案，而不是只留在聊天裡。

簡單區分：

`Session = 這次工作的容器``Memory = 容器裡保留下來的上下文``Token = 模型實際拿來理解這些資訊的單位`

- **Session**：一次持續進行的協作工作。AI 會保留這次工作需要的上下文。
- **Status**：目前 Codex 的執行環境資訊，例如 Model、Reasoning、Directory、Permissions 與 Session。
- **Usage**：這次工作使用了多少模型資源與額度。
- **Token**：模型讀取與產生文字的基本單位，不完全等於中文字數或英文單字數。
- **Memory**：可延續的偏好或背景資訊，讓 AI 不需要每次都從零開始理解你。

## 給教職人員的練習專案：用 AI 學習，而不只是請 AI 給答案

本課提供一個純 Markdown 的練習專案：[teacher-learning-lab](../examples/teacher-learning-lab/)。它不需要寫程式，只有三種東西：

- `README.md`：說明這個學習工作區的目的與使用規則
- `templates/learning-note.md`：固定的學習筆記模板
- `notes/`：放自己的主題、問題與整理結果

### 四個簡單任務

#### 任務 1：請 Agent 說明工作區

```markdown
先不要修改檔案，請閱讀這個資料夾，告訴我它適合拿來做什麼。
請列出每個檔案的用途，並建議我第一步可以做什麼。
```

#### 任務 2：用模板新增自己的學習筆記

```markdown
我想學習「<主題>」。
請先讀 templates/learning-note.md，根據模板提出一份草稿。
先不要寫入檔案，等我確認後再新增到 notes/。
```

可以選的主題包括：如何設計一堂課、如何閱讀一篇研究、如何規劃一個學習目標、如何向學生解釋抽象概念。

#### 任務 3：把筆記變成教學活動

```markdown
請只根據我確認過的學習筆記，設計一個 15 分鐘的教學活動，包含：
1. 學習目標
2. 開場問題
3. 一個簡單練習
4. 檢查理解的問題
不要新增筆記中沒有根據的事實。
```

#### 任務 4：請 Agent 反過來考你

```markdown
請不要直接解釋答案。
請根據這篇學習筆記問我 3 個問題，一次問一題。
等我回答後，再指出我理解正確的地方與還需要補強的地方。
```

這四個任務的核心，是讓 AI 從「答案機器」變成學習夥伴：**先說明、再提問、再整理、再檢查理解**。

### 一個適合教職人員的 AI 學習循環

`提出目標 → 讓 AI 先問問題 → 用自己的話回答 → 找出理解缺口 → 整理成筆記 → 轉成可以教人的活動`

最後請學生反思三件事：

- 哪些內容是我原本就知道的？
- 哪些內容是 Agent 幫我整理的？
- 哪些說法我還需要查資料或請教專業人士？

## 如何更有效率地使用 Token

重點不是一味省 Token，而是讓 AI 少走冤枉路。

- 先說清楚目標、檔案範圍與完成標準
- 一次聚焦一個任務，避免在同一個 Session 混入太多主題
- 技術需求可優先使用英文，通常更容易對齊工具與程式語境
- 善用 **Skills**，讓 AI 依既定流程完成特定工作
- 善用工具先讀檔、查資料或執行檢查，不要要求模型憑空猜測
- 注意上下文空間（headroom），長任務可適時整理或切換 Session

## Skills 與 MCP 是什麼？

- **Skills**：AI 的工作指南或標準流程。例如建立簡報、修改文件、檢查程式時，告訴 AI 該怎麼做。
- **MCP**：讓 AI 連接外部工具與資料來源的標準方式。例如連接 Google Drive、GitHub、資料庫或公司內部系統。

可以把它們想成：

`Skills = 工作方法`

`MCP = 可使用的外部工具`

有了 Skills 與 MCP，AI 才能從「會聊天」進一步變成「能一起做事的協作者」。

### 動手試試看：Skill 還是 MCP？

想像以下兩個情境，判斷應該使用 Skill 還是 MCP：

1. 每次 Review PR，都希望 AI 按照公司的 10 條規範檢查。
2. 希望 AI 可以查詢公司的 Jira 或資料庫。

答案：

- 固定的工作方法與檢查流程 → **Skill**
- 連接外部系統、取得資料或執行外部操作 → **MCP**

因此可以記成：

`Skill = 方法；MCP = 工具`
