# 第四堂：發布成網站

這是第四堂的步驟手冊：課前作業和每個練習的步驟、網址都在這裡，練習 3-2 另有兩段要貼給 Codex 的提示詞。上課時在筆電打開、整堂開著，整段複製，不用照投影片打字。簡報網址：https://chrouos.github.io/AI-workshop-slides
這堂只用這份 prompts.md，筆記庫就是你前三堂一路做下來的「三國人物知識庫」。

框上面那行「定位｜期望輸出｜限制」是簡報上的三格重點，不用貼。

## 課前作業（第四堂上課前做完）

請在家先註冊好 Forestry.md。它是 Digital Garden 外掛作者推出的代管服務：幫你把筆記建置成網站、給你一個網址，不用另外申請 GitHub、Vercel，也不用建 token。

1. 打開 https://forestry.md ，按 Sign up 註冊。用 email 和密碼，或按 GitHub 用 GitHub 帳號登入，都可以。
2. 登入後看到 Plant new garden：Garden name 會先幫你取一個名字（例如 green-elm），下面會顯示網址 `名字.forestry.md`。想換名字就改，再按 Plant。
3. 等它種好，畫面出現 Your garden is live 和你的網址。點網址打開看看，把網址抄下來，上課要用。
4. 用 Obsidian 打開三國人物知識庫，確認第三堂做的 `整理/時間軸.md` 和 `關係/三英戰呂布.md` 都在。

做完的樣子：手上有一個 `名字.forestry.md` 網址，打得開。

免費方案：一個網站、每月 30 次發布、100 MB 空間，上課和平常寫卡都夠用。

卡住怎麼辦：停在哪一步、看到什麼畫面，截圖帶來上課。上課第一個練習就是驗收這份作業，沒做完的人現場補，註冊和 Plant 都在瀏覽器裡完成。

## 練習 1（驗收）：打開自己的網址

定位：自己的花園｜期望輸出：打得開網址｜限制：一人一座

1. 登入 Forestry.md。還沒註冊的人，照上面「課前作業」第 1 步現場註冊。
2. 確認你有一座花園。沒有的話，照「課前作業」第 2、3 步按 Plant。
3. 打開你的網址 `名字.forestry.md`，看得到網頁就過關。網址忘了：Forestry 儀表板最上面 Your garden is live 下面那行就是，按 Copy address 可以複製。

## 練習 2（連接）：連上並發布第一次

定位：今天的知識庫｜期望輸出：首頁是三國演義｜限制：Garden Key 不外流

照真的發布會遇到的順序做。卡名是中文，**第一次發布出現 Failed 是正常的**，照第 5 步關掉一個開關，再發布就好。

1. **裝外掛、連線**：
   - 在三國人物知識庫裡，設定 →「第三方外掛程式」→ 按「離開受限模式」（才能裝外掛）→ 社群外掛程式按「瀏覽」→ 搜尋 Digital Garden，作者是 oleeskild → 安裝 → 啟用。
   - 設定 → 左下的 Digital Garden → Publish to 選 **Forestry.md**。
   - 到 Forestry 儀表板右邊的 Garden Key，按 Reveal Garden Key，複製那串字；回 Obsidian 貼進 Garden Key 欄位，按 Connect。看到 Connected to 你的花園名稱，就連上了。
   - 連上後外掛會請你選網站首頁，選〈三國演義〉。
2. **看屬性**：打開〈三國演義〉，最上面的屬性（Frontmatter）有兩行：
   - `dg-publish: true`：「要公開」的勾。勾了、再按發布，這張卡才會上網站；在屬性面板打勾，等於寫這一行。
   - `dg-home: true`：網站首頁。整個網站只放一張。
3. **發布**：按 Ctrl／Cmd + P，搜尋 garden publish，選 Publish All Notes Marked for Publish（下面簡稱 Publish All）。
4. **看狀態**：回 Forestry 儀表板看 Publish history，最上面那一筆就是你剛按的發布。Building＝還在把筆記做成網頁（大約半分鐘）；Published＝上線了；Failed＝這次沒有上線。
5. **Failed 就關掉 Simple note URLs**：點 Failed 右邊箭頭，多半會看到 DuplicatePermalink（網址重複）。原因是 Simple note URLs 預設開著，會把中文卡名拿掉，每張卡的網址變成一樣。到設定 → 第三方外掛 → Digital Garden，往下捲到 Publishing，把 Simple note URLs 關掉。
6. **再發布一次**：Publish All，等最上面那一筆變成 Published，打開你的網址。

看結果：首頁是〈三國演義〉就過關。第一次就已經是 Published（例如你先關了開關），直接做第 6 步打開網址。

關掉之後還是 Failed：先確認開關真的關了；外掛設定沒有顯示 Connected，回第 1 步重新貼 Garden Key。

Garden Key 像連線用的密碼：有了它就能發布到你的網站。只貼在外掛設定，不貼進筆記、截圖或群組；不小心外流，到 Forestry 儀表板按 Regenerate Garden Key，再把新的 Key 貼回外掛設定。

## 小練習：改一句，再發布一次（也是休息時間）

定位：〈三國演義〉｜期望輸出：網站上看到那句｜限制：只改一句

1. 打開〈三國演義〉，在最後加一句你自己的話，例如「這是我的三國筆記」。
2. Ctrl／Cmd + P，執行 Publish All。
3. 回 Forestry 儀表板看 Publish history，等最上面那一筆變成 Published。
4. 重新整理你的網址，看那句有沒有出現。沒變的話，先等半分鐘再整理，可能還在 Building。

## 練習 3-1（dg-publish）：讓時間軸卡上線

定位：整理/時間軸.md｜期望輸出：網站看得到時間軸｜限制：先看屬性

1. 打開 `整理/時間軸.md`，看屬性。第三堂 Skill 產出的時間軸，開頭沒有屬性，直接就是一段 HTML，所以還不會被發布。
2. 沒有 `dg-publish: true` 的話，Ctrl／Cmd + P，執行 Digital Garden: Add publish flag。
3. Publish All，等 Publish history 變成 Published。
4. 打開你的網址，後面接 `/整理/時間軸/`。

看結果：看到橫向時間軸就過關。網站的內文欄比較窄，一開始只看得到前面幾件，用觸控板往右滑，或拖動時間軸下方的捲軸，就看得到其他事件。出現 404，意思是「找不到頁面」：網站上沒有這一頁。點了 404，多半是那張卡還沒勾，或勾了還沒發布、還沒等到 Published。

## 練習 3-2（導覽頁）：讓讀者點到每張卡

定位：知識庫導覽｜期望輸出：導覽頁連結點得開｜限制：先看屬性

1. 做導覽頁。在三國人物知識庫資料夾打開 Codex，貼上：

```text
請在 整理/ 新增 知識庫導覽.md。分成時間、人物、事件三段：時間那段只放 [[時間軸]]；人物那段用 [[連結]] 列出 人物/ 裡的每張卡；事件那段用 [[連結]] 列出 關係/ 裡的每張卡，但先不要放〈三英戰呂布〉，練習 4 再加。只連到已有的卡，不要新增卡片，也不要改別的檔案。開頭加上 dg-publish: true。寫入前先給我看。
```

   看過預覽：事件那段沒有三英戰呂布，也沒有筆記庫裡找不到的卡，再回「可以」。範例導覽頁放在線上，可以對照：[aw-04-sample-output/知識庫導覽.md](https://github.com/Chrouos/AI-workshop-slides/blob/main/examples/aw-04-sample-output/%E7%9F%A5%E8%AD%98%E5%BA%AB%E5%B0%8E%E8%A6%BD.md)。

2. 打開〈三國演義〉，在最後一行加 `[[知識庫導覽]]`。
3. 找出還沒勾的卡。在同一個 Codex 貼上：

```text
列出 整理/知識庫導覽.md 連到的每張卡，每張一行，寫出它開頭有沒有 dg-publish: true。只列清單，不要修改任何檔案。
```

   拿清單去核對：打開標「沒有」的卡，看屬性，確定 Codex 沒看錯。連到的卡不會自動一起發布，每張都要自己勾。要公開的，打開那張卡按 Ctrl／Cmd + P，執行 Digital Garden: Add publish flag；不想公開的，回導覽頁把那個連結刪掉。

4. Publish All，等 Publish history 變成 Published 再打開網址。

看結果：從首頁點〈知識庫導覽〉，再點〈時間軸〉和每張卡，一路走得通；導覽頁上每個連結都點得開，包括你剛補勾的卡。範例裡，清單標出〈白門樓〉〈草船借箭〉沒有 dg-publish；你的清單可能不一樣，例如第二堂自己寫的卡。

點了出現 404，就是那張還沒勾、或勾了還沒發布。時間軸裡的事件名稱是純文字、點不了，這是對的；時間軸裡出現 `[[ ]]`，或點了會 404 的來源卡連結，回第三堂的 SKILL.md 補規則，再產生一次。

## 練習 4（檢查）：從首頁點到新卡

定位：一張新卡｜期望輸出：首頁點得到新卡｜限制：只從首頁點

1. 公開〈三英戰呂布〉：打開它，執行 Digital Garden: Add publish flag；在導覽頁的事件那段加上 `[[三英戰呂布]]`；再執行 Publish All。
2. 等到 Published：Forestry 儀表板的 Publish history，最上面那一筆變成 Published 再往下。
3. 打開自己的網址（Forestry 儀表板最上面 Your garden is live 下面那行），只從首頁開始點：首頁 → 知識庫導覽 → 三英戰呂布，不直接打卡片的網址。

看結果：點到新卡就完成。打不開常見兩種：〈三英戰呂布〉沒勾 dg-publish，點了是 404；導覽頁改了沒重新發布，連結不在。照簡報上「部署疑難排解：四個檢查」一步一步查：有沒有按發布 → Publish history 有沒有新的一筆 → 狀態是 Building、Published 還是 Failed → Ctrl／Cmd + Shift + R 略過快取重新載入。

## 網址

- 簡報：https://chrouos.github.io/AI-workshop-slides
- Forestry.md（註冊、Plant 花園、Garden Key、Publish history）：https://forestry.md
- Digital Garden 外掛：https://github.com/oleeskild/obsidian-digital-garden
- 範例網站（三國筆記庫）：https://glowing-clearing.forestry.md/
- 練習 3-2 導覽頁的範例：https://github.com/Chrouos/AI-workshop-slides/blob/main/examples/aw-04-sample-output/%E7%9F%A5%E8%AD%98%E5%BA%AB%E5%B0%8E%E8%A6%BD.md
- 所有教材總表：https://github.com/Chrouos/AI-workshop-slides/tree/main/examples
