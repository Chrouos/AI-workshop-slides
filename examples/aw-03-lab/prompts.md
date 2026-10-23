# 第三堂練習提示詞

第三堂的四個練習都照這份做。請在筆電打開這一頁，整段複製，貼上再按 Enter，不用照投影片打字。
終端機：Mac 用「終端機」，Windows 用 PowerShell。

## 練習 1-1：先確認有 git

兩個 Skill 的安裝工具都會用 git 下載，先確認電腦裡有沒有：

```text
git --version
```

看結果：

- 看到 `git version 2.xx`：有了，往下做。
- Mac 跳出「要安裝命令列開發者工具嗎？」或顯示 command not found：按「安裝」，或打 `xcode-select --install`，等它裝完，再打一次 `git --version`。
- Windows 顯示「無法辨識」：到 https://git-scm.com/download/win 下載安裝，選項都用預設值。裝完把 PowerShell 關掉重開，再打一次 `git --version`。

10 分鐘內裝不起來，先跳到最後的「備用做法」。

## 練習 1-2：安裝 diagram-design

一次貼一行，等它跑完再貼下一行：

```text
codex plugin marketplace add cathrynlavery/diagram-design
```

```text
codex plugin add diagram-design@diagram-design
```

```text
codex plugin list
```

看結果：先看到 `Added marketplace`，再看到 `Added plugin`。`plugin list` 的清單很長，找 `diagram-design@diagram-design` 這一行，狀態是 `installed, enabled` 就裝好了。版本號跟投影片不一樣沒關係。

出現 command not found，或不認得 plugin 指令，多半是 Codex 太舊，先更新：

```text
npm install -g @openai/codex@latest
```

## 練習 1-3：安裝 eli5

```text
npx -y skills add dreambigou/eli5 -g -a codex -y
```

看結果：看到 `Installed 1 skill` 和 `Done`。eli5 不能用 codex plugin 指令裝，會出現 `does not contain a supported manifest`。

## 練習 1-4：在筆記庫打開 Codex，確認看得到 Skill

1. 打 `cd` 和一個空格，把「三國人物知識庫」資料夾拖進終端機視窗，按 Enter。
2. 打 `ls`，看裡面有什麼：

```text
ls
```

看結果：看得到 `人物`、`關係`、`原文`、`模板`。如果只看到另一個 `三國人物知識庫`，代表解壓縮多包了一層，再打 `cd 三國人物知識庫`，然後再 `ls` 一次。

3. 打 `codex` 打開 Codex。已經開著的，先輸入 `/quit` 關掉，再打 `codex`。Skill 是開 Codex 時才載入的，裝完一定要重開。
4. 貼上：

```text
列出你現在可以使用的 skills 名稱，每個一行，附一句用途。不要讀或修改任何檔案。
```

看結果：清單裡有 `diagram-design:diagram-design`（也可能只寫 `diagram-design`）和 `eli5`。清單比投影片短是正常的。

## 練習 2-1：用 diagram-design 畫關係圖

```text
請使用 diagram-design skill，讀 人物/ 和 關係/ 裡的卡片，把人物和事件之間的關係畫成一張關係圖，存成 圖/三國關係圖.html。只畫卡片裡有寫的關係，每條線標出是哪張卡寫的。不要修改原本的卡片。
```

第一次用 diagram-design，它會先問要哪種樣式。選項的代號每個版本不一樣，找「保留預設樣式」那一項，回答：

```text
保留預設樣式，請直接產生並存檔。
```

寫檔前如果問 `Yes, proceed`，看過再按。

看結果：在 Finder（Windows 是檔案總管）打開筆記庫的 `圖/` 資料夾，雙擊 `三國關係圖.html`，會用瀏覽器打開。Obsidian 的檔案列表看不到 .html 檔，這是正常的。

- 左邊 5 位人物、右邊 3 個事件，每條線旁邊標著來源卡的檔名。
- 線的數量不一定一樣：講師跑過兩次，一次 10 條、一次 12 條。你第二堂自己寫了關係卡的話，會再多一些，這是正常的。

## 練習 2-2：標籤疊在一起，就請它分開

先看自己的圖。標籤疊在一起，或看不出是哪條線的，才做這一步；沒有就跳過。在同一個 Session 接著貼：

```text
圖上線的標籤疊在一起了。請把標籤分開，不要互相蓋住；節點和連線不變，存回同一個檔案。
```

看結果：重新整理瀏覽器再看一次。它說「檢查過了」，還是要自己看；還有字壓在線上，就再說一次哪裡要改，例如「標籤不要壓在線上」。

## 練習 2-3：用 eli5 改寫劉備卡

```text
請使用 eli5 skill，把 人物/劉備.md 用國中生聽得懂的方式重新說一次，存成 整理/劉備-國中生版.md。只用卡片裡有的內容，不要加新的事實；保留 [[連結]]。不要修改原本的卡片。新檔不要加 dg-publish。
```

看結果：在 Obsidian 打開兩張卡左右對照。販屨織蓆、寄身、匙箸這類詞改成白話，`[[連結]]` 還在；新檔最上面沒有 `dg-publish`。

## 練習 2-4：找出 eli5 多加的句子

eli5 這個 Skill 本來就會補比喻和延伸說明（它的 SKILL.md 寫著 Use an analogy），所以改寫版可能多出卡片沒寫的句子。

1. 先一起看講師的實跑結果（投影片上那三句），猜哪一句在 人物/劉備.md 找不到。
2. 再看自己的 整理/劉備-國中生版.md：一句一句問「這件事，原卡有寫嗎？」特別注意「就像……」這種比喻、「從此……」「所以……」這種延伸。
3. 找到可疑的一句，複製下來，貼進下面的問題：

```text
整理/劉備-國中生版.md 裡「（貼上那一句）」，是 人物/劉備.md 的哪一句寫的？引用原句；找不到就說找不到。不要修改檔案。
```

看結果：

- 它引用得出原句，而且原卡真的有這句：留著。
- 它說找不到，或引用的句子原卡沒有：刪掉這句，或請它改。
- 一句都沒找到也可以：挑關係圖上的一條線，打開標籤寫的那張卡，找那條線的依據。

## 練習 3-1：照原文新增三張關係卡

三張都要做，練習 4 的時間軸會用到。原文已經在 原文/ 裡，模板在 模板/關係卡模板.md。

```text
只根據 原文/第005回.txt、原文/第019回.txt、原文/第046回節選.txt，新增三張關係卡：關係/三英戰呂布.md、關係/白門樓.md、關係/草船借箭.md。照 模板/關係卡模板.md 寫：frontmatter 填 回目、年份，年份原文有寫才填，沒寫就留空；最後一行寫「出處：原文/檔名」。人名有卡的才加 [[ ]]。原文找不到的事不要寫；舊卡不改，新卡不加 dg-publish。
```

它可能先列出計畫、問要不要寫入。看過計畫沒問題，再回：

```text
可以
```

看結果：三張新卡都在 關係/ 裡，回目是數字（5、19、46）；最後一行是出處；呂布沒有人物卡，寫純文字，沒加 `[[ ]]`；舊卡沒動。回目寫成「第五回」的話，自己改成數字。

舊的三張關係卡（桃園結義、煮酒論英雄、赤壁之戰）最上面已經有回目。如果你的筆記庫是很早下載的舊版、沒有回目，再貼這段：

```text
在 關係/桃園結義.md、關係/煮酒論英雄.md、關係/赤壁之戰.md 的 frontmatter 補上 回目：桃園結義 1、煮酒論英雄 21、赤壁之戰 49。只在 frontmatter 補上 回目，內文不動，dg-publish 保留。
```

## 練習 3-2：年份有填，就回原文搜

這三件事在史書上都查得到年份，例如白門樓常寫成建安三年，Codex 很可能「知道」。但三份原文都沒寫年份（講師搜過「建安」「初平」，都是 0 筆），照規則應該留空。

1. 打開三張新卡，看最上面的「年份」。
2. 空白：對了。
3. 有填：在 Finder（Windows 是檔案總管）雙擊那一回的原文 .txt，會用「文字編輯」（Windows 是記事本）打開。按 `Cmd+F`（Windows 是 `Ctrl+F`），搜它填的年號，例如「建安」。搜不到，就把年份刪掉。
4. 每人再挑一句，請它附上原句：

```text
關係/白門樓.md 的每一句，後面附上 原文/第019回.txt 裡的原句。找不到原句的句子標出來。不要修改檔案。
```

看結果：挑一句它附的原句，複製下來，在 原文/第019回.txt 裡 `Cmd+F`／`Ctrl+F` 貼上搜尋。搜得到就打勾；搜不到，就請它改那一句，或自己刪掉。

## 練習 4-1：請 Codex 建好 SKILL.md

Skill 要放在筆記庫的 `.agents/skills/sanguo-timeline/SKILL.md`。`.agents` 是點開頭的隱藏資料夾，Finder 不讓你自己建，Obsidian 也看不到，所以請 Codex 建。整段貼上：

```text
在這個筆記庫建立 .agents/skills/sanguo-timeline/SKILL.md，資料夾沒有就建立。內容就是下面這段，一字不改。只建這個檔，不要改其他檔案。

---
name: sanguo-timeline
description: 把三國筆記庫的卡片依回目排成時間軸。使用者說「三國時間軸」「排時間軸」時使用。
---
# 三國時間軸

## 步驟
1. 讀 關係/ 每張卡的 回目、年份、參與人物
2. 依回目由小到大排；沒有回目的卡，最後列出來
3. 寫入 整理/時間軸.md

## 輸出格式
- 一段 HTML，每件事一列：回目、年份、事件、人物
- HTML 裡的人名用純文字，不加 [[ ]]
- 表格下方列出每一列的來源卡
```

看結果：輸入 `/quit`，再打 `codex` 重開，貼上：

```text
列出你現在可以使用的 skills 名稱，每個一行，附一句用途。不要讀或修改任何檔案。
```

清單裡看到 `sanguo-timeline` 就對了。沒看到：先輸入 `/status`，確認 Directory 的結尾是「三國人物知識庫」，不是的話 `/quit`，回練習 1-4 重新 `cd`。

## 練習 4-2：執行三國時間軸

練習 3 的三張卡要先做完。

```text
請使用 sanguo-timeline skill，排出三國時間軸。
```

寫檔前如果問 `Yes, proceed`，看過再按。最後在 Obsidian 打開 `整理/時間軸.md`。

看結果：一張按回目排的表，第 1、5、19、21、46、49 回；人名是純文字，HTML 裡沒有 `[[ ]]`。你第二堂自己寫了關係卡的話，會多幾列，這是正常的。

## 練習 4-3：說明書沒寫清楚，就補一條規則

1. 先看投影片上講師第一次跑的結果，找出兩個問題。
2. 再看自己的 `整理/時間軸.md`：在 Obsidian 按 `Cmd+F`（Windows 是 `Ctrl+F`），分別搜 `未標註`、`—`、`<a href`、`[[`。
3. 搜得到哪一個，就是 SKILL.md 沒寫清楚的地方。請 Codex 改 SKILL.md（不用自己找隱藏資料夾）：

```text
在 .agents/skills/sanguo-timeline/SKILL.md 的「## 輸出格式」最後加兩行，其他內容不動：

- 年份照卡片抄，卡片沒寫就留空白，不要寫「未標註」或「—」
- 來源卡只寫檔名純文字，不做連結，不用 <a href>，也不用 [[ ]]
```

4. `/quit`，再打 `codex` 重開，再貼一次：

```text
請使用 sanguo-timeline skill，排出三國時間軸。
```

看結果：再搜一次 `未標註`、`—`、`<a href`、`[[`，四個都搜不到；卡片寫了年份的才有年份（例如桃園結義的中平元年）。

四個本來就都搜不到：挑一個你不滿意的地方（例如欄位順序、表格標題、想多一欄「出處」），寫成一句規則，用同樣的方式請 Codex 加進「## 輸出格式」，再跑一次。

## 練習 4-4（進階選做）：只排出劉備的事件

```text
在 .agents/skills/sanguo-timeline/SKILL.md 的「## 步驟」最後加第 4 步，其他內容不動：
4. 使用者指定人物時，只留下參與人物有他的事件
```

`/quit`，再打 `codex` 重開，貼上：

```text
請使用 sanguo-timeline skill，只排劉備的事件，存成 整理/時間軸-劉備.md
```

看結果：草船借箭的參與人物是周瑜、諸葛亮、魯肅、曹操，沒有劉備，應該被拿掉，剩第 1、5、19、21、49 回五件。自己打開每張關係卡的「參與人物」那一行核對。

## 備用做法

### git 裝不起來

- eli5：這個資料夾裡有一份 eli5 的 SKILL.md（MIT 授權，作者 DreambigOu，原始碼 https://github.com/dreambigou/eli5 ）。不用 git 也能裝：

Mac（終端機）：

```text
mkdir -p ~/.agents/skills/eli5 && curl -L -o ~/.agents/skills/eli5/SKILL.md https://raw.githubusercontent.com/Chrouos/AI-workshop-slides/main/examples/aw-03-lab/eli5/SKILL.md
```

Windows（PowerShell）：

```text
mkdir -Force $HOME\.agents\skills\eli5; curl.exe -L -o $HOME\.agents\skills\eli5\SKILL.md https://raw.githubusercontent.com/Chrouos/AI-workshop-slides/main/examples/aw-03-lab/eli5/SKILL.md
```

裝完一樣回練習 1-4，重開 Codex 確認清單裡有 eli5。

- diagram-design：沒有 git 就裝不了。練習 2-1 跟旁邊的同學一起看他的圖，或打開講師的成品 [範例/圖/三國關係圖.html](範例/圖/三國關係圖.html)（在下面的第三堂範例.zip 裡，解壓縮後用瀏覽器打開），照樣做練習 2-4 的核對。

### 中途卡住、Codex 沒跑出來

講師 2026-10-24 實跑的成品放在 [範例/](範例/)，可以直接拿來接著做。整包下載：https://raw.githubusercontent.com/Chrouos/AI-workshop-slides/main/examples/aw-03-lab/%E7%AC%AC%E4%B8%89%E5%A0%82%E7%AF%84%E4%BE%8B.zip ，解壓縮後是「第三堂範例」資料夾：

- `範例/關係/` 的三張卡：練習 3 沒做出來，把這三個檔案拖進筆記庫的 `關係/`（拖檔案，不要拖整個資料夾，Mac 會問要不要取代，按下去舊卡就不見了）。
- `範例/整理/劉備-國中生版.md`：練習 2-3 的 eli5 改寫。
- `範例/整理/時間軸.md`、`範例/整理/時間軸-劉備.md`：練習 4 補過規則後的結果。
- `範例/sanguo-timeline-修好版/SKILL.md`：加過兩條規則和第 4 步的 SKILL.md。它要放進 `.agents/` 這個隱藏資料夾，拖不進去，請 Codex 寫。整段貼上：

```text
把 .agents/skills/sanguo-timeline/SKILL.md 的內容整個換成下面這段，一字不改；資料夾沒有就建立。只改這個檔，不要改其他檔案。

---
name: sanguo-timeline
description: 把三國筆記庫的卡片依回目排成時間軸。使用者說「三國時間軸」「排時間軸」時使用。
---
# 三國時間軸

## 步驟
1. 讀 關係/ 每張卡的 回目、年份、參與人物
2. 依回目由小到大排；沒有回目的卡，最後列出來
3. 寫入 整理/時間軸.md
4. 使用者指定人物時，只留下參與人物有他的事件

## 輸出格式
- 一段 HTML，每件事一列：回目、年份、事件、人物
- HTML 裡的人名用純文字，不加 [[ ]]
- 表格下方列出每一列的來源卡。
- 年份照卡片抄，卡片沒寫就留空白，不要寫「未標註」或「—」
- 來源卡只寫檔名純文字，不做連結，不用 <a href>，也不用 [[ ]]
```

寫好後輸入 `/quit`，再打 `codex` 重開，Skill 才會換成新版。

第二堂缺課、沒有筆記庫的人：下載講師的筆記庫 https://raw.githubusercontent.com/Chrouos/AI-workshop-slides/main/examples/aw-02-vault/%E4%B8%89%E5%9C%8B%E4%BA%BA%E7%89%A9%E7%9F%A5%E8%AD%98%E5%BA%AB.zip ，解壓縮後用 Obsidian 打開，就能從練習 1 開始做。
