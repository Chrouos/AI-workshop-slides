# 課前準備｜認識 AI：從三國故事到知識圖

預留 15–20 分鐘。課堂的 60 分鐘留給讀筆記、核對和畫圖。

## 1. 下載練習資料夾

掃投影片第 9 頁的 QR code，或下載 [練習資料夾 ZIP](https://raw.githubusercontent.com/Chrouos/AI-workshop-slides/main/slides/ai-for-teacher-learners/assets/teacher-learning-lab.zip)。

解壓縮後打開，要直接看到 `notes/`。Windows 按右鍵「全部解壓縮」常會多包一層，只看到另一個 `teacher-learning-lab` 就再點進去一層。

```text
teacher-learning-lab/
├─ notes/      劉備、關羽、張飛、曹操、桃園結義、煮酒論英雄
├─ prompts.md  課堂提示詞
├─ outputs/    練習 2 存這裡
└─ diagrams/   練習 3 存這裡
```

## 2. 安裝 Codex

終端機：Windows 用「命令提示字元」或 PowerShell，Mac 用「終端機」。

1. 到 [nodejs.org](https://nodejs.org/) 下載 LTS 版，用預設選項安裝。
2. 重開終端機，確認有版本號：

   ```bash
   node -v
   npm -v
   ```

3. 安裝 Codex：

   ```bash
   npm install -g @openai/codex@latest
   ```

4. 輸入 `codex`，用 ChatGPT 帳號登入。登入畫面寫著 Plus、Pro、Business、Enterprise 方案包含 Codex 用量；其他方案請先確認。

顯示「找不到指令」：先重開終端機；還是不行，重跑一次 Node.js 安裝程式。

## 3. 在練習資料夾打開 Codex

輸入 `cd ` 加一個空格，把 `teacher-learning-lab` 資料夾拖進視窗，按 Enter，再輸入 `codex`。

第一次會看到三個英文畫面：

- Choose how you want to use Codex → **Sign in with ChatGPT**
- Do you trust the contents of this directory? → 確認是 teacher-learning-lab，選 **Yes, continue**
- Would you like to make the following edits?（寫檔前）→ 看過要寫什麼，再選 **Yes, proceed**

試一句：

```text
列出 notes/ 裡的檔案，先不要修改任何檔案。
```

看到六份筆記和一份 README，就準備好了。`.md` 打不開的話，按右鍵選「記事本」（Windows）或「文字編輯」（Mac）。

## 沒有 Plus 方案：三條路

### 1. ChatGPT 網頁版（課堂備案）

先上傳 `notes/` 的六份筆記，再貼 prompts.md 的提示詞。要存檔的地方，改請它「給我一個可下載的檔案」，下載後自己放進 `outputs/` 或 `diagrams/`。

### 2. OpenRouter（未在課前實測）

雲端模型平台，註冊後拿 API key，按用量付費，也有免費模型。步驟照 [OpenRouter 官方教學](https://openrouter.ai/blog/tutorials/codex-cli-openrouter)：

1. 到 openrouter.ai 註冊，在 Keys 頁建立一把 API key。
2. 打開 `~/.codex/config.toml`（使用者家目錄那份；放在練習資料夾裡的不會生效），加入：

   ```toml
   model = "openai/gpt-5.6-luna"   # 換成 OpenRouter 上的完整模型名稱
   model_provider = "openrouter"

   [model_providers.openrouter]
   name = "OpenRouter"
   base_url = "https://openrouter.ai/api/v1"
   wire_api = "responses"

   [model_providers.openrouter.auth]
   command = "sh"
   args = ["-c", "echo $OPENROUTER_API_KEY"]
   ```

   Windows 把最後兩行改成：

   ```toml
   command = "powershell"
   args = ["-NoProfile", "-Command", "$env:OPENROUTER_API_KEY"]
   ```

3. 設定 key，再啟動：

   ```bash
   export OPENROUTER_API_KEY=你的key      # Windows PowerShell：$env:OPENROUTER_API_KEY="你的key"
   codex
   ```

這條路還沒在課前實測。選模型時，請挑支援工具呼叫（tool calling）的模型。

### 3. Ollama 本機模型（實驗性，不建議當課堂備案）

模型跑在自己電腦，資料不出電腦。Ollama 預設 context 只有 4,096 tokens，Codex 或 OpenCode 的說明加上工具定義就超過了，模型會看不到工具和筆記。啟動時一定要開大：

```bash
# 到 ollama.com 下載安裝，再下載模型（約 7GB）
ollama pull gemma4:e2b

# 用 64K context 啟動 Ollama（Windows PowerShell：$env:OLLAMA_CONTEXT_LENGTH=65536; ollama serve）
OLLAMA_CONTEXT_LENGTH=65536 ollama serve

# 另開一個終端機，在練習資料夾裡
codex --oss --local-provider ollama -m gemma4:e2b --disable apps --disable plugins
```

`--disable apps --disable plugins`：Codex 如果登入過 ChatGPT、接了很多連接器（信箱、雲端硬碟等），會把上百個工具一起交給模型，小模型會找不到讀檔工具。

課前實測（2026-10，16GB 記憶體的 M2 Pro Mac，gemma4:e2b，Ollama 開 64K，記憶體約用 3GB）：

| | 練習 1 | 練習 2-2 | 練習 2-3 | 練習 3 |
| --- | --- | --- | --- | --- |
| Codex + Ollama | 做得到：讀完六份筆記，表格正確 | 漏掉「盟友」那行，或要你提供草稿 | 說已存檔，其實沒存 | 沒畫出圖 |
| OpenCode + Ollama | 做得到：表格大致對 | 把整份筆記一行行抄出來 | 存成整份筆記，不是三行 | 只畫曹操和劉備 |

結論：練習 1 做得到，核對和存檔做不到。想自己試可以，課堂上請用 ChatGPT 網頁版。`gpt-oss:20b` 這類較大的模型可能好一些，但要 16GB 以上記憶體，還沒實測。

OpenCode 內建的免費雲端模型（`opencode models` 裡名字帶 free 的），用 `opencode run` 指令會被擋（「free tier can only be used from within OpenCode」），要在 OpenCode 的互動介面裡用，課前沒測到。

## 選做：畫圖 Skill

```bash
codex plugin marketplace add cathrynlavery/diagram-design
codex plugin add diagram-design@diagram-design
```

裝完重開 Codex。沒裝也沒關係，prompts.md 練習 3 一樣能畫出 HTML。

## 課堂資料

今天只用準備好的三國練習筆記。學生個資、未公開試題、敏感文件，請先確認校方規範和工具的資料處理方式。
