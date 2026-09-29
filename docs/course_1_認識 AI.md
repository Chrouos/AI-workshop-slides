# Agentic AI 實戰：從 Chat 到 Codex 協作工作流

## 這堂課會學到什麼？

這堂課會帶大家認識 Agentic AI 工具，並實際理解 ChatGPT 與 Codex 的使用情境。

1. ChatGPT 和 Codex 的差異
2. 如何開始安裝與使用 Codex
3. 認識 Session、Status、Usage、Token 與 Memory
4. 如何更有效率地使用 Token
5. Skills 與 MCP 是什麼

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

實際答案是 8484，它可能給出一個語氣很肯定的答案，但不代表答案一定正確。

圖片來源：[IT 邦幫忙：向 ChatGPT 對話的提問技巧與問題限制](https://ithelp.ithome.com.tw/articles/10315994)

早期模型也常出現回答中斷或失去上下文的情況：

![早期 ChatGPT 回答中斷的示意](assets/course-1-ai-basics/llm-incomplete-response.png)

圖片來源：[Cheers 快樂工作人](https://www.cheers.com.tw/article/article.action?id=5101461)

## 為什麼會有幻覺？

可以先把 LLM 簡單理解為：

`前面的文字 → 預測下一個 Token → 持續預測下一個 Token`

它會根據訓練時看過的大量文字，從相似的語言模式中預測下一個最可能出現的 Token。

所以它很擅長產生「像答案」的文字，但不代表它真的知道答案、理解事實，或已經完成驗算。

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

## 開始使用 Codex：先看懂幾個名詞

### Session

一次 Codex 工作對話的「工作階段」

你在這個 Session 裡下指令、讀檔案、修改程式、執行測試
Codex 會保留這段對話中的上下文，方便持續處理同一件事情

`開啟 Session → 描述任務 → Codex 修改 / 測試 → 持續追問`

---

### Status

查看目前 Codex 的執行環境與工作狀態

通常可以看到：

- 使用中的 Model
- Reasoning 等級
- 目前工作目錄
- 權限模式
- Session ID
- 帳號方案與使用狀態

可以把它理解成 Codex 的「系統資訊頁」

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

---

### Memory

Codex 在工作過程中保留的「上下文資訊」

例如：

- 前面討論過什麼
- 專案有哪些限制
- 已經做過哪些修改
- 接下來正在處理什麼

讓你不用每次都重新解釋整個專案

簡單區分：

`Session = 這次工作的容器``Memory = 容器裡保留下來的上下文``Token = 模型實際拿來理解這些資訊的單位`

- **Session**：一次持續進行的協作工作。AI 會保留這次工作需要的上下文。
- **Status**：目前任務的執行狀態，例如進行中、等待回覆或已完成。
- **Usage**：這次工作使用了多少模型資源與額度。
- **Token**：模型讀取與產生文字的基本單位，不完全等於中文字數或英文單字數。
- **Memory**：可延續的偏好或背景資訊，讓 AI 不需要每次都從零開始理解你。

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
