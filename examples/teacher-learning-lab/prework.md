# 課前準備｜認識 AI：從三國故事到知識圖

請預留 15–20 分鐘完成工具安裝與登入。課堂的 60 分鐘用來讀筆記、核對關係與畫圖。

## 1. 下載教材

打開 [課程 GitHub](https://github.com/Chrouos/AI-workshop-slides)，按 **Code → Download ZIP**，解壓縮後找到 `examples/teacher-learning-lab`。

確認 `notes/` 有六份故事筆記，另有 README；`prompts.md` 可直接複製課堂提示詞。

## 2. 安裝與登入 Codex

先依學校與課程規範確認可用的帳號及工具。帳號可用方案依官方當時的說明為準。

到 [Node.js 官網](https://nodejs.org/) 安裝 LTS 版本，完成後重新打開終端機。macOS 搜尋 Terminal；Windows 搜尋 PowerShell。

```bash
node -v
npm -v
npm install -g @openai/codex@latest
```

前兩行應顯示版本號。安裝遇到問題，可請課程協助人員確認或使用下方備用方式。

在終端機輸入 `cd `（尾端有空格），把 `teacher-learning-lab` 資料夾拖進視窗，按 Enter。再輸入：

```bash
codex
```

依畫面登入。確認工作位置 Directory 是 `teacher-learning-lab`。需要時用 `/status` 查看。

## 3. 課前備好畫圖 Skill

課程採用 [diagram-design 的官方安裝方式](https://github.com/cathrynlavery/diagram-design)：

```bash
codex plugin marketplace add cathrynlavery/diagram-design
codex plugin add diagram-design@diagram-design
```

安裝後重新開啟 Codex Session，確認仍在練習資料夾。若沒有這個 Skill，也可使用 prompts.md 的一般 HTML 模式，不影響核對關係的練習。

## 4. 確認可以開始

在 Codex 輸入：

```text
只讀 notes/桃園結義.md，列出參與人物與依據句子。
先不要修改任何檔案。
```

自己打開同一份筆記，確認回覆有根據。出現操作授權時，先看清楚它要讀取、寫入或執行什麼。

## 備用方式

Codex 無法使用時，可在 ChatGPT 上傳這六份筆記，沿用 prompts.md 的提示詞。成果需要自行下載或複製存檔；若帳號不支援所需功能，可與已準備好的同伴共用練習環境。

## 課堂資料

今天只用已備好的三國練習筆記。學生個資、未公開試題、敏感文件，先確認校方規範、授權與工具的資料處理方式。去掉姓名不代表一定無法辨識個人。
