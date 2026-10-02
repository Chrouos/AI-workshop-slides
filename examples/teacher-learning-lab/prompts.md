# 課堂 Prompt 一覽

投影片上用到的每一句 Prompt 都在這裡，照上課順序排好，複製貼進 Codex 就能用。

用 ChatGPT 網頁版（Plan B）的人：先上傳要用的筆記，再貼同一段 Prompt。要它「寫入檔案」的那幾句，改成把結果複製下來，自己存檔。

示範用的是 `notes/cognitive-load-theory.md`。如果你選了別份筆記，把檔名換掉就好。

---

## 暖身 1｜第一個任務：先讀，不要改

```markdown
先不要修改檔案，請閱讀這個資料夾，告訴我：
1. 這個練習專案的用途
2. 每個檔案適合放什麼內容
3. 我可以如何開始一篇學習筆記
```

它回答之後，如果想讓它整理內容：

```markdown
請先提出草稿，不要直接寫入檔案。
```

### 答錯了？這樣追問

```markdown
你剛才讀了哪些檔案？請列出檔名。
```

```markdown
notes/ 裡有幾份筆記？各是什麼主題？
```

## 現場二選一｜交代清楚的 B

```markdown
只讀 notes/cognitive-load-theory.md。
整理 1 個核心概念、1 個常見誤解、2 個檢查理解的問題。
先不要改檔案，也不要加入原筆記沒有的事實。
```

## 遇到 Codex 請你同意時｜看不懂就先拒絕，再問

```markdown
你為什麼要做這一步？這一步會改到哪些檔案？
```

## 練習 1｜讀筆記

```markdown
請閱讀 notes/ 裡的六份筆記，整理成一張表：
- 筆記名稱
- 所屬領域
- 核心問題
- 3 個專有名詞
- 教育情境
- 常見誤解

先不要修改任何檔案。
```

### 看完表，挑一列追問

```markdown
原文怎麼定義外在負荷？
```

## 練習 2｜出草稿 → 回原文核對 → 對了才存

### 第 1 步：出草稿（先不要存）

```markdown
請只讀 notes/cognitive-load-theory.md，用 ASCII 樹狀結構排出：
- 中心問題
- 核心概念
- 概念關係
- 常見誤解

不要加入原筆記沒有的事實。
先把草稿顯示在畫面上，不要存檔。
```

### 第 2 步：回原文核對

```markdown
請對照 notes/cognitive-load-theory.md，把草稿裡每一條關係，各自列出原文哪一句支持它；找不到就寫「找不到」。
先不要修改任何檔案。
```

Codex 只負責幫你找句子。哪一條保留、哪一條刪掉，由你自己判斷。

### 第 3 步：確認後才存檔

```markdown
請刪掉找不到原文支持的關係，再把修正後的草稿寫入：
outputs/cognitive-load-theory-ascii.md
```

## 練習 3｜畫成知識圖

先在終端機安裝 diagram-design，再開一個新的 Codex Session：

```bash
codex plugin marketplace add cathrynlavery/diagram-design
codex plugin add diagram-design@diagram-design
```

在新的 Session 輸入：

```markdown
請使用 diagram-design skill，閱讀 notes/cognitive-load-theory.md 和 outputs/cognitive-load-theory-ascii.md，畫一張給初學者看的知識圖。
不要加入原筆記沒有的事實。
先說明要用哪種圖、為什麼；等我確認後，再存到 diagrams/。
```
