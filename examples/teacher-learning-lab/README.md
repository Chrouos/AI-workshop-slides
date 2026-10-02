# 師培生專業筆記理解練習場

這是一個不需要寫程式的 Codex 練習專案。

你會先讓 Agent 讀懂一組教育專業知識筆記，再比較理論、整理知識點，最後使用 Skill 把其中一份筆記畫成容易理解的知識圖。

這個練習適合正在修習教育心理學、教育社會學、教育哲學等師培課程的學生。你也可以把這六份示範筆記換成自己的專業筆記。

## 練習主線

`閱讀專案 → 比較六份筆記 → 快速理解一份筆記 → ASCII 整理 → 使用 Skill 畫圖`

整個過程不要求你會寫程式。你只需要閱讀檔案、複製 Prompt、觀察 Agent 的工作方式，並判斷產出的內容是否忠於原筆記。

## 資料夾結構

```text
teacher-learning-lab/
├── README.md
├── prompts.md
├── notes/
│   ├── README.md
│   ├── cognitive-load-theory.md
│   ├── zone-of-proximal-development.md
│   ├── blooms-taxonomy.md
│   ├── dewey-experience-education.md
│   ├── hidden-curriculum.md
│   └── cultural-capital.md
├── templates/
│   └── knowledge-note.md
├── diagrams/
│   └── README.md
└── outputs/
    └── README.md
```

- `prompts.md`：投影片上用到的所有 Prompt，依上課順序排列，可以直接複製
- `notes/`：六份教育專業知識筆記
- `templates/knowledge-note.md`：整理其他專業筆記時可以使用的模板
- `diagrams/`：第三個練習產生的 HTML、SVG 或 PNG 圖檔
- `outputs/`：第二個練習產生的 ASCII 知識結構

## 六份示範筆記

### 教育心理學與教學設計

- [認知負荷理論](notes/cognitive-load-theory.md)：工作記憶、基模、內在負荷與外在負荷
- [近側發展區與鷹架](notes/zone-of-proximal-development.md)：支持、提示與逐步撤除
- [布魯姆教育目標分類學](notes/blooms-taxonomy.md)：從記憶到創造的學習目標描述

### 教育哲學與教育社會學

- [杜威的經驗教育](notes/dewey-experience-education.md)：經驗、反思與後續學習
- [隱性課程](notes/hidden-curriculum.md)：正式課程之外的規範與價值
- [文化資本](notes/cultural-capital.md)：文化資源、學校期待與教育機會

這些筆記不是完整的學術教材，而是給 Agent 閱讀與整理的練習材料。正式報告或考試準備仍然要回到課本、原典或教師指定文獻。

## 練習一：讓 Codex 看懂專案

先不要修改任何檔案，請讓 Agent 讀取整個專案：

```markdown
先不要修改任何檔案。

請閱讀這個練習專案，告訴我：
1. 這個專案是做什麼的？
2. notes/ 裡有哪六份專業筆記？
3. 請依照教育心理學、教育哲學、教育社會學或教學設計分類。
4. 哪兩份筆記最適合放在一起比較？為什麼？
5. 三個練習的順序與關係是什麼？
```

接著讓 Agent 快速導讀六份筆記：

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

## 練習二：選一份筆記，畫出 ASCII 知識點

請先選一份自己最想理解的筆記，例如：

```markdown
我想深入理解 notes/cognitive-load-theory.md。

請用沒有修習過教育相關課程的人也能理解的方式，說明：
1. 這份筆記在回答什麼問題？
2. 最重要的專有名詞是什麼？
3. 概念之間有什麼關係？
4. 一個教育現場的例子是什麼？
5. 哪些地方容易被誤解？

先不要修改任何檔案。
```

接著整理 ASCII：

```markdown
請再次閱讀 notes/cognitive-load-theory.md。

請用 ASCII 樹狀結構或箭頭整理：
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

如果選的是其他筆記，只要替換檔案名稱與輸出檔名即可。

## 練習三：使用 Skill 畫出筆記

這個練習使用 [diagram-design](https://github.com/cathrynlavery/diagram-design) skill。它可以把知識關係整理成 HTML、SVG 或 PNG 圖，不需要你自己寫圖表程式。

在命令提示字元中執行：

```bash
# 加入 diagram-design 的 Plugin Marketplace
$ codex plugin marketplace add cathrynlavery/diagram-design

# 安裝 diagram-design plugin
$ codex plugin add diagram-design@diagram-design
```

安裝完成後，重新開啟 Codex Session。接著輸入：

```markdown
請閱讀：
- notes/cognitive-load-theory.md
- outputs/cognitive-load-theory-ascii.md

請使用 diagram-design skill，把這份專業知識筆記畫成一張適合初學者理解的知識圖。

要求：
- 先判斷這份筆記適合使用哪一種圖
- 保留中心問題、主要概念與概念之間的關係
- 可以參考 ASCII 結構，但不要被 ASCII 排版限制
- 不要加入筆記中沒有提到的事實
- 圖上的文字要簡短清楚
- 先提出圖的設計，再開始產生圖
- 將最後的圖檔保存到 diagrams/
```

你不需要編輯 HTML 或 SVG。只要檢查圖是否正確表達原本筆記的內容，並指出需要修改的地方即可。

## 完成標準

完成三個練習後，你應該能回答：

- 我是否真的理解這份專業筆記，而不是只看過一遍？
- 我能不能用自己的話解釋專有名詞？
- ASCII 結構是否保留了原筆記的重點？
- 最後的圖是否讓沒有背景知識的人更容易理解？
- Agent 有沒有自行補上原筆記沒有提到的內容？
- 哪些地方仍然需要回到課本、原典或教師指定文獻確認？
