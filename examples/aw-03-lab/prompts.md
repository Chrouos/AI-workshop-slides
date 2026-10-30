# 第三堂練習提示詞

第三堂的四個練習都照這份做。請在筆電打開這一頁，整段複製，貼上再按 Enter，不用照投影片打字。
這堂的檔案都在 [aw-03-lab.zip](https://raw.githubusercontent.com/Chrouos/AI-workshop-slides/main/examples/aw-03-lab.zip) 裡：這份 prompts.md 和 `sanguo-timeline/`（練習 4 的時間軸 Skill 骨架）。Codex 一樣開在你自己的「三國人物知識庫」。
終端機：Mac 用「終端機」，Windows 用 PowerShell。

## 練習 1-1：先確認有 git 和 Node.js

上課一開始就做。第二章要用 `npx skills add` 安裝 Skill：skills 從 GitHub 下載 Skill 時要用 git，`npx` 是 Node.js 附的工具。沒有的人邊聽第一章邊裝，先裝 git，再裝 Node.js。打開終端機，一次貼一行：

```text
git --version
```

```text
node -v
```

```text
npx -v
```

看結果：

- `git --version` 看到 `git version 2.xx`，`node -v` 看到 `v22.20` 以上的版本號（例如 `v24.12.0`），`npx -v` 看到一串數字（例如 `11.6.2`）：三個都有，就先放著，第二章再接著做練習 1-2。
- 版本號不同沒關係。`node -v` 開頭的數字比 22 小，要照下面重裝新版。

第 1 步，沒有 git：

- Mac：照 git 官網（https://git-scm.com/install/mac ）建議，先裝 Homebrew 再裝 git。
  1. 打開 https://brew.sh ，複製首頁那一行，或直接複製下面這行，貼進終端機按 Enter。問密碼就打電腦的登入密碼，打字時畫面不會顯示。它會順便裝好 Apple 的命令列工具，要等幾分鐘。

     ```text
     /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
     ```

  2. 裝完畫面最後有「Next steps」，照它列的指令一行一行貼上，終端機才找得到 `brew`。
  3. 貼上 `brew install git`，裝完再打一次 `git --version`。
- Windows 顯示「無法辨識」：打開 https://git-scm.com/install/windows ，按 Click here to download，下載 x64 的安裝檔，雙擊安裝，選項都用預設值。裝完把 PowerShell 關掉重開，再打一次 `git --version`。

第 2 步，沒有 Node.js（出現 `command not found`，或 Windows 寫「無法辨識」）：

1. 打開 https://nodejs.org/en/download ，下載標著 LTS（長期支援版）的安裝檔。Mac 是 .pkg，Windows 是 .msi。
2. 雙擊安裝檔，選項都用預設，一路按「繼續」或 Next。Mac 最後會要你輸入電腦的登入密碼。
3. 把終端機整個關掉再打開，新的視窗才找得到 node。再打一次 `node -v` 和 `npx -v`。

第二章開始前還裝不起來，先跳到最後的「備用做法」，用下載 ZIP 的方式裝。

## 練習 1-2：先走進筆記庫

`npx skills add` 選 Project 時，Skill 會裝進終端機「現在所在的資料夾」。所以先讓終端機走進筆記庫。

1. 打 `cd` 和一個空格，把「三國人物知識庫」資料夾從 Finder（Windows 是檔案總管）拖進終端機視窗，按 Enter。
2. 打 `ls`，看裡面有什麼：

```text
ls
```

看結果：看得到 `人物`、`關係`、`原文`、`模板`。如果只看到另一個 `三國人物知識庫`，代表解壓縮多包了一層，再打 `cd 三國人物知識庫`，然後再 `ls` 一次。這一步沒進對資料夾，Skill 會裝到別的地方，Codex 開在筆記庫時找不到。

## 練習 1-3：用 npx skills add 裝 eli5

裝別人寫的 Skill 之前，先到它的 GitHub 頁面打開 SKILL.md，看它要 Codex 做什麼：Skill 執行時有 Codex 的完整權限。

eli5 的 GitHub 網址是 https://github.com/dreambigou/eli5 。`github.com/` 後面的兩段 `dreambigou/eli5`（帳號/專案），就是接在 `npx skills add` 後面的名稱。終端機還在筆記庫裡，貼上：

```text
npx skills add dreambigou/eli5
```

Windows 出現 `npx.ps1` 和「已停用指令碼執行」：PowerShell 擋住了 .ps1 指令檔，改貼這行（後面一樣）：

```text
npx.cmd skills add dreambigou/eli5
```

接下來它會連續問幾題，照這樣答：

1. `Need to install the following packages: skills@…` `Ok to proceed? (y)`：第一次用才會問，問要不要先下載 skills 這個程式。直接按 Enter（等於 y）。
2. `Which agents do you want to install to?`：要裝給哪些 Agent。第一區 `Universal (.agents/skills)` 標著 `always included`，Codex 在裡面，一定會裝。只用 Codex 的話，什麼都不用勾，直接按 Enter。
   - 也有用 Claude Code：按 ↓ 移到 `Claude Code (.claude/skills)`，按空白鍵打勾，再按 Enter。
3. `Installation scope`：裝在哪裡。停在 `Project`（裝進現在的資料夾，也就是筆記庫），按 Enter。不要選 Global。
4. `Installation method`：停在 `Symlink (Recommended)`，按 Enter。
5. `Proceed with installation?`：停在 `Yes`，按 Enter。

看結果：最後出現 `Installed 1 skill` 和 `✓ ./.agents/skills/eli5`，就裝好了。筆記庫裡多一個 `skills-lock.json`，記錄裝了哪些 Skill，不用動它。


## 練習 1-4：用同樣的方法裝 diagram-design

diagram-design 的網址是 https://github.com/cathrynlavery/diagram-design ，所以名稱是 `cathrynlavery/diagram-design`：

```text
npx skills add cathrynlavery/diagram-design
```

後面四題跟練習 1-3 一樣：Agent 不用選、`Project`、`Symlink`、`Yes`，都按 Enter。這個專案比較大，下載要等十幾秒。

裝完確認兩個都在：

```text
ls .agents/skills
```

看結果：看到 `diagram-design` 和 `eli5`。Windows 的 PowerShell 會一行一個列出來，也是對的。

## 練習 1-5：在筆記庫打開 Codex，確認看得到 Skill

1. 終端機還在筆記庫裡，打 `codex` 打開 Codex。已經開著的，先輸入 `/quit` 關掉，再打 `codex`。第一次在筆記庫打開，會先問要不要信任這個資料夾，選 `Yes, continue`。
2. 貼上：

```text
列出你現在可以使用的 skills 名稱，每個一行，附一句用途。不要讀或修改任何檔案。
```

看結果：清單裡有 `diagram-design` 和 `eli5`。清單比投影片短是正常的。沒看到，先輸入 `/status`，確認 Directory 的結尾是「三國人物知識庫」；不是的話 `/quit`，回練習 1-2 重新 `cd`。

## 練習 2-1：用 diagram-design 畫關係圖

```text
請使用 diagram-design skill，讀 人物/、勢力/、關係/ 裡的卡片，畫一張三國關係圖，存成 圖/三國關係圖.html。人物放進所屬勢力的框裡，事件依回目由上到下放在中間；人物和事件之間用平滑曲線連起來，不要直角轉折，線上標兩三個字的關係，例如結義、論英雄、交戰。只畫卡片裡有寫的關係。線上不要寫檔名，改在圖下方列一張表，每條線一列，寫出是哪張卡寫的。不要修改原本的卡片。
```

第一次用 diagram-design，Codex 會先問要哪種樣式或配色。選項的寫法每個版本不一樣，找「預設」那一項，回答：

```text
保留預設樣式，請直接產生並存檔。
```

寫檔前如果問 `Yes, proceed`，看過再按。

看結果：在 Finder（Windows 是檔案總管）打開筆記庫的 `圖/` 資料夾，雙擊 `三國關係圖.html`，會用瀏覽器打開。Obsidian 的檔案列表看不到 .html 檔，這是正常的。

- 人物在勢力的框裡，事件依回目由上到下排在中間，線上只寫兩三個字的關係。
- 往下捲有一張來源表：每條線一列，寫出是哪張卡寫的。
- 線的數量不一定一樣：講師 2026-10-30 實跑是 12 條。你第二堂自己寫了關係卡的話，會再多一些，這是正常的。

## 練習 2-2：線太亂，就請 Codex 重排

先看自己的圖。線疊在一起、看不出是誰的，或還是直角轉來轉去，才做這一步；圖很清楚就跳過。在同一個 Session 接著貼：

```text
圖上的線太亂，看不出哪條是誰的。請改用平滑曲線，不要直角轉折；標籤不要互相蓋住。人物、事件、關係和來源表不變，存回同一個檔案。
```

看結果：重新整理瀏覽器再看一次。Codex 會說「確認標籤互不重疊」，還是要自己看；還有地方不清楚，就再說一次哪裡要改，例如「劉備的三條線不要交叉」。

## 練習 2-3：用 eli5 改寫劉備卡

```text
請使用 eli5 skill，把 人物/劉備.md 用國中生聽得懂的方式重新說一次，存成 整理/劉備-國中生版.md。只用卡片裡有的內容，不要加新的事實；保留 [[連結]]。不要修改原本的卡片。新檔不要加 dg-publish。
```

看結果：在 Obsidian 打開兩張卡左右對照。販屨織蓆、寄身這類古文詞改成白話（有些詞會照抄，例如匙箸，不算錯），`[[連結]]` 還在；新檔最上面沒有 `dg-publish`。

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
- 一句都沒找到也可以：挑關係圖上的一條線，到圖下方的來源表找出那張卡，打開來找那條線的依據。

## 練習 3-1：照原文新增三張關係卡

三張都要做，練習 4 的時間軸會用到。第 5、19、46 回都在 原文/ 裡，模板在 模板/關係卡模板.md。

```text
只根據 原文/第005回.md、原文/第019回.md、原文/第046回.md，新增三張關係卡：關係/三英戰呂布.md、關係/白門樓.md、關係/草船借箭.md。照 模板/關係卡模板.md 寫：frontmatter 填 回目、年份，年份原文有寫才填，沒寫就留空；最後一行寫「出處：資料夾/檔名」，例如「出處：原文/第005回.md」。人名有卡的才加 [[ ]]。原文找不到的事不要寫；舊卡不改，新卡不加 dg-publish。
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
3. 有填：在 Obsidian 左邊打開那一回的原文（第 5、19、46 回都在 `原文/`）。按 `Cmd+F`（Windows 是 `Ctrl+F`），搜它填的年號，例如「建安」。搜不到，就把年份刪掉。
4. 每人再挑一句，請它附上原句：

```text
關係/白門樓.md 的每一句，後面附上 原文/第019回.md 裡的原句。找不到原句的句子標出來。不要修改檔案。
```

看結果：挑一句它附的原句，複製下來，在 Obsidian 打開 原文/第019回.md，按 `Cmd+F`／`Ctrl+F` 貼上搜尋。搜得到就打勾；搜不到，就請它改那一句，或自己刪掉。

## 練習 4-1：用 npx skills add 安裝時間軸 Skill 骨架

骨架就是 aw-03-lab.zip 裡的 `sanguo-timeline/` 資料夾，裡面只有一個 SKILL.md。安裝方法跟練習 1-3 一樣，只是這次不從 GitHub 下載，名稱那一段換成這個資料夾在你電腦上的路徑。還沒解壓縮 aw-03-lab.zip 的話，先解壓縮。

1. 在 Codex 輸入 `/quit` 離開，回到終端機。終端機還在筆記庫裡，不用再 `cd`。
2. 打 `npx skills add` 和一個空格，把 aw-03-lab 裡的 `sanguo-timeline` 資料夾從 Finder（Windows 是檔案總管）拖進終端機視窗，路徑會自動填好，按 Enter。整行看起來像這樣（路徑每台不同）：

```text
npx skills add ~/Downloads/aw-03-lab/sanguo-timeline
```

3. 出現 `Local path validated` 和 `Skill: sanguo-timeline`，後面四題跟練習 1-3 一樣：Agent 不用選、`Project`、`Symlink`、`Yes`，都按 Enter。Windows 被擋的話改打 `npx.cmd`。
4. 看到 `✓ ./.agents/skills/sanguo-timeline` 就裝好了。裝進筆記庫的是一份複本，之後改 SKILL.md，改的是筆記庫裡這一份。

npx 裝不起來的備用做法：自己把資料夾放進去。終端機還在筆記庫裡，依作業系統貼一行，會建好 `.agents/skills` 並打開它（`.agents` 是隱藏資料夾，Finder 平常看不到）：

Mac（終端機）：

```text
mkdir -p .agents/skills && open .agents/skills
```

Windows（PowerShell，講師沒有實測）：

```text
mkdir -Force .agents\skills; explorer .agents\skills
```

把 aw-03-lab 裡的 `sanguo-timeline` 資料夾整個拖進打開的視窗。放好後打開它，要直接看到 SKILL.md。

看結果：終端機還在筆記庫裡，打 `codex` 打開，貼上：

```text
列出你現在可以使用的 skills 名稱，每個一行，附一句用途。不要讀或修改任何檔案。
```

清單裡看到 `sanguo-timeline` 就對了。沒看到：先輸入 `/status`，確認 Directory 的結尾是「三國人物知識庫」，不是的話 `/quit`，回練習 1-2 重新 `cd`。

## 練習 4-2：執行三國時間軸

練習 3 的三張卡要先做完。

```text
請使用 sanguo-timeline skill，排出三國時間軸。
```

寫檔前如果問 `Yes, proceed`，看過再按。最後在 Obsidian 打開 `整理/時間軸.md`。

看結果：一條橫向的時間軸，線上是事件名稱，線下是第 1、5、19、21、46、49 回；事件名稱是純文字，沒有 `[[ ]]`。視窗太窄看不完，就用觸控板左右滑，或拖下面的捲軸。你第二堂自己寫了關係卡的話，線上會多幾件事，這是正常的。

## 練習 4-3：說明書沒寫清楚，就補一條規則

1. 先看投影片上講師第一次跑的結果，找出兩個問題。
2. 再看自己的 `整理/時間軸.md`：在 Obsidian 切到編輯模式（右上角的筆圖示；閱讀模式會把 HTML 畫成圖，搜不到 `<a href`），按 `Cmd+F`（Windows 是 `Ctrl+F`），分別搜 `未標註`、`未記載`、`—`、`<a href`、`[[`。
3. 搜得到哪一個，就是 SKILL.md 沒寫清楚的地方，自己打開 SKILL.md 補規則。在 Codex 輸入 `/quit` 回到終端機（還在筆記庫裡），依作業系統貼一行，用文字編輯器打開它：

Mac（用「文字編輯」打開）：

```text
open -e .agents/skills/sanguo-timeline/SKILL.md
```

Windows（用記事本打開）：

```text
notepad .agents\skills\sanguo-timeline\SKILL.md
```

按 `Cmd+↓`（Windows 是 `Ctrl+End`）跳到檔案最後一行，也就是「## 輸出格式」那一段的最後；按 Enter 換一行，貼上下面兩行，按 `Cmd+S`（Windows 是 `Ctrl+S`）存檔，再關掉視窗：

```text
- 年份照卡片抄，卡片沒寫就不寫，不要寫「未標註」「未記載」或「—」
- 來源卡只寫檔名純文字，不做連結，不用 <a href>，也不用 [[ ]]
```

為什麼不請 Codex 改：Codex 為了安全，預設不讓自己改 `.agents/` 裡的檔案，會回你「.agents 設為唯讀」（講師 2026-10-30 用 Codex 0.165.0 實測）。說明書由你來改，Codex 照著做。

4. 打 `codex` 重開，再貼一次：

```text
請使用 sanguo-timeline skill，排出三國時間軸。
```

看結果：再搜一次 `未標註`、`未記載`、`—`、`<a href`、`[[`，五個都搜不到；卡片寫了年份的才有年份（例如桃園結義的中平元年）。

五個本來就都搜不到：挑一個你不滿意的地方（例如顏色、事件名稱的字太小、想在線下多寫參與人物），寫成一句規則，用同樣的方式加在「## 輸出格式」最後，存檔，再跑一次。

## 練習 4-4（進階選做）：只排出劉備的事件

照練習 4-3 第 3 步的方法打開 SKILL.md，點在「3. 寫入 整理/時間軸.md」這一行的最後面，按 Enter 換一行，貼上下面這行，存檔：

```text
4. 使用者指定人物時，只留下參與人物有他的事件
```

打 `codex` 重開，貼上：

```text
請使用 sanguo-timeline skill，只排劉備的事件，存成 整理/時間軸-劉備.md
```

看結果：草船借箭的參與人物是周瑜、諸葛亮、魯肅、曹操，沒有劉備，應該被拿掉，線上剩第 1、5、19、21、49 回五件。你第二堂自己寫的卡如果有劉備（例如轅門射戟、許田打圍），會多一件，這是對的。自己打開每張關係卡的「參與人物」那一行核對。

## 練習 4-5（進階選做）：換一個畫圖 Skill，畫同一條時間軸

同一份 `整理/時間軸.md`，交給不同的 Skill 畫，畫出來的樣子都不一樣。挑一個你喜歡的：

- diagram-design：練習 1-4 已經裝好，直接用。
- archify（https://github.com/tt-a1i/archify ）：先在 Codex 輸入 `/quit` 離開，回到終端機（還在筆記庫裡），用練習 1-3 的方法裝，後面幾題的答法一樣。這行講師沒有實測，裝不起來就改用 diagram-design。

```text
npx skills add tt-a1i/archify
```

裝好 archify 後，打 `codex` 打開；用 diagram-design 不用裝，Codex 還開著就直接貼。貼上（用 archify 的話，把開頭的 diagram-design 換成 archify）：

```text
請使用 diagram-design skill，讀 整理/時間軸.md，把裡面的事件畫成一條橫向時間軸，存成 圖/三國時間軸.html。事件依回目由左到右排；線上只寫事件名稱，線下寫回目和年份；比畫面寬的時候可以按住左右拖曳，看得到完整時間軸。只用檔案裡有的資料，沒寫年份的事件就不寫年份，不要自己補。不要修改其他檔案。
```

diagram-design 如果先問要用哪種樣式，回答：

```text
保留預設樣式，請直接產生並存檔。
```

看結果：在 Finder（Windows 是檔案總管）雙擊 `圖/三國時間軸.html`，用瀏覽器打開。按住時間軸往左拉，要拉得到第 49 回赤壁之戰。只有桃園結義有年份（中平元年）；別的事件也出現年份，就是它自己補的，請它拿掉。

講師 2026-10-30 實測（Codex 0.165.0），兩個 Skill 都畫出來了，也都沒有自己補年份。成品和講師自己做的一份放在線上的 [aw-03-sample-output/練習4/](https://github.com/Chrouos/AI-workshop-slides/tree/main/examples/aw-03-sample-output/%E7%B7%B4%E7%BF%924)，下載回去用瀏覽器打開比一比：

- `三國時間軸-diagram-design.html`
- `三國時間軸-archify.html`：archify 畫時間軸要每件事都有完整日期，三國卡片只有回目，所以 Codex 沒有硬套 archify 的格式，改寫一份自己的 HTML。
- `三國時間軸-講師版.html`：把第 1 到第 120 回整條畫出來，可以切換「只看劉備」。

## 備用做法

### 裝不起來

先看錯誤訊息：

- `command not found: npx`，或 Windows 寫「無法辨識 'npx'」：沒裝 Node.js，或裝完沒把終端機關掉重開。回練習 1-1 裝 Node.js。
- `Failed to clone`，後面有 `spawn git ENOENT`：找不到 git。回練習 1-1 裝 git。
- Windows 訊息裡有 `npx.ps1` 和「已停用指令碼執行」：把 `npx` 改成 `npx.cmd` 再貼一次，例如 `npx.cmd skills add dreambigou/eli5`。

指令怎麼試都不行，就自己下載 ZIP、自己放。Skill 就是一個資料夾，裡面有 SKILL.md：

1. 打開 Skill 的 GitHub 頁面（eli5 是 https://github.com/dreambigou/eli5 ，diagram-design 是 https://github.com/cathrynlavery/diagram-design ），按綠色的 `Code` 按鈕，選 `Download ZIP`。
2. 解壓縮，找到「裡面直接就是 SKILL.md」的那一層資料夾：
   - eli5：`ELI5-main/skills/eli5/`
   - diagram-design：`diagram-design-main/skills/diagram-design/`（裡面除了 SKILL.md，還有 `assets`、`references`、`scripts`，整個資料夾一起拿）
3. 打開筆記庫的 skills 資料夾。`.agents` 是點開頭的隱藏資料夾，Finder 不能自己建，用指令建好再打開。終端機要先在筆記庫裡（練習 1-2），依作業系統貼一行：

Mac（終端機）：

```text
mkdir -p .agents/skills && open .agents/skills
```

Windows（PowerShell，講師沒有實測）：

```text
mkdir -Force .agents\skills; explorer .agents\skills
```

4. 把第 2 步找到的 `eli5` 資料夾（或 `diagram-design` 資料夾）拖進剛打開的視窗。放好後打開它，要直接看到 SKILL.md。

放哪裡看你用哪個 Agent：Codex 讀筆記庫的 `.agents/skills/`；Claude Code 讀 `.claude/skills/`（把上面指令裡的 `.agents` 換成 `.claude`）。網路上舊的教學會寫家目錄的 `~/.codex/skills`，現在 Codex 統一讀 `.agents/skills`。

裝完一樣回練習 1-5，重開 Codex 確認清單裡有 eli5、diagram-design。

diagram-design 還是裝不起來：練習 2-1 跟旁邊的同學一起看他的圖，或下載講師的成品 [aw-03-sample-output/練習2/三國關係圖.html](https://github.com/Chrouos/AI-workshop-slides/tree/main/examples/aw-03-sample-output/%E7%B7%B4%E7%BF%922)，用瀏覽器打開，照樣做練習 2-4 的核對。

### SKILL.md 沒改好

講師每個練習的實跑成品都放在線上 [aw-03-sample-output/](https://github.com/Chrouos/AI-workshop-slides/tree/main/examples/aw-03-sample-output)，想對照自己的結果再打開。

- 練習 4-3、4-4 的 SKILL.md 沒改好：照練習 4-3 第 3 步的方法打開 SKILL.md，全選刪掉，貼上下面這份加過兩條規則和第 4 步的版本，存檔：

```text
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
- 一段 HTML，畫成橫向時間軸：事件依回目由左到右排在一條線上
- 線上只寫事件名稱，線下寫回目和年份
- 比畫面寬的時候可以左右拖曳，看得到完整時間軸
- HTML 裡的名字用純文字，不加 [[ ]]
- 時間軸下方列出每個事件的來源卡
- 年份照卡片抄，卡片沒寫就不寫，不要寫「未標註」「未記載」或「—」
- 來源卡只寫檔名純文字，不做連結，不用 <a href>，也不用 [[ ]]
```

存好後再打 `codex` 重開，新的 Session 一定讀到新版。
