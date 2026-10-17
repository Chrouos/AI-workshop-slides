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

## 沒有 Codex

改用 ChatGPT：先上傳 `notes/` 的六份筆記，再貼 prompts.md 的提示詞。要存檔的地方，改請它「給我一個可下載的檔案」，下載後自己放進 `outputs/` 或 `diagrams/`。

## 選做：畫圖 Skill

```bash
codex plugin marketplace add cathrynlavery/diagram-design
codex plugin add diagram-design@diagram-design
```

裝完重開 Codex。沒裝也沒關係，prompts.md 練習 3 一樣能畫出 HTML。

## 課堂資料

今天只用準備好的三國練習筆記。學生個資、未公開試題、敏感文件，請先確認校方規範和工具的資料處理方式。
