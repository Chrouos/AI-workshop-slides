# 第四堂：發布成網站

這頁在筆電打開，網址和提示詞整段複製，不用照投影片打字。簡報網址：https://chrouos.github.io/AI-workshop-slides
這堂的檔案都在 [aw-04-lab.zip](https://raw.githubusercontent.com/Chrouos/AI-workshop-slides/main/examples/aw-04-lab.zip) 裡：這份 prompts.md、`第三堂完成版/`（缺課補上用）、`參考結果/`（講師的導覽頁範例）。

框上面那行「定位｜期望輸出｜限制」是簡報上的三格重點，不用貼。

## 課前作業（第四堂上課前做完，約 20 分鐘）

上課不再全班一起部署，請在家先做好。每一步都在瀏覽器裡完成，不用裝任何程式。

1. 註冊 GitHub：到 https://github.com/signup 註冊，點 email 裡的驗證連結。信有時要等幾分鐘，也看一下垃圾郵件匣。
2. 註冊 Vercel：到 https://vercel.com/signup ，選 Continue with GitHub。Vercel 要你驗證手機或 email，就照畫面做完（講師沒遇到，未實測）。
3. 部署網站：打開 Digital Garden 官方入門頁，按 Deploy to Vercel：https://docs.forestry.md/getting-started/01-getting-started/
   - Git Scope 選你的 GitHub 帳號，Repository Name 填 my-garden，按 Create。名稱重複就改成 my-garden-2。
   - GitHub 問要不要讓 Vercel 存取 repo，選允許。
   - 等一兩分鐘，看到 Congratulations 和一個網址。
4. 打開網址：點那個網址，要看到 Digital Garden 模板的首頁。把網址和 repo 名稱抄下來，上課要用。
5. 打開一次 token 頁：登入 GitHub，打開 https://github.com/settings/personal-access-tokens/new 。看得到建立 token 的表單就好，先不用建。GitHub 要你再輸入一次密碼、驗證碼，或要你設定雙重驗證（2FA），照畫面做完；上課建 token 時還會再問一次，忘了密碼的人現在就重設。
6. 用 Obsidian 打開三國人物知識庫，確認 `整理/時間軸.md` 和 `關係/三英戰呂布.md` 都在。少了的話，下載 [aw-04-lab.zip](https://raw.githubusercontent.com/Chrouos/AI-workshop-slides/main/examples/aw-04-lab.zip)，照 [README](README.md) 把裡面「第三堂完成版」的檔案放進去。

做完的樣子：手上有一個 `….vercel.app` 網址，打開是 Digital Garden 模板的首頁（不是錯誤頁）；記得 repo 名稱；token 頁打得開。只拿到網址、沒打開看過，不算做完。

卡住怎麼辦：停在哪一步、看到什麼畫面，截圖帶來上課（截圖裡不要有 token）。上課第一個練習就是驗收這份作業，沒做完的人會和做好的同學兩人一組，現場補做；補不完就先用同學的帳號做後面的練習，自己的網站課後再補。部署出現 Error、或等超過 5 分鐘還在跑，到 Vercel 專案的 Deployments 點最上面那一筆，把錯誤訊息截圖帶來。

## 練習 1（驗收）：打開自己的網站

定位：課前部署的網站｜期望輸出：打得開模板首頁｜限制：沒做就兩人一組

1. 打開你課前抄下的網址，就是那個 `….vercel.app`。
2. 看到 Digital Garden 模板的首頁才算過關。
3. 記下 repo 名稱，例如 my-garden，練習 2 填外掛要用。忘了的話，到 github.com 你的帳號底下看 Repositories。

沒做、或打不開：和已經過關的鄰座兩人一組，照上面的「課前作業」第 1 到 4 步在自己的筆電補部署，建置時先跟鄰座一起往下聽。練習 2 開始時自己的網站還沒好，就用鄰座的帳號和電腦做完練習 2 到 4，自己的網站課後再補。

## 練習 2（token）：連上 GitHub

定位：今天的儲存庫｜期望輸出：首頁變三國演義｜限制：token 不外流

1. 在三國人物知識庫裡裝外掛：設定 →「第三方外掛程式」→ 看到受限模式就按「關閉」→ 社群外掛程式按「瀏覽」→ 搜尋 Digital Garden，作者是 Ole Eskild Steensen → 安裝 → 啟用。
2. 打開 https://github.com/settings/personal-access-tokens/new 建 fine-grained token。GitHub 要你再輸入密碼或驗證碼，是正常的。
   - Token name：digital-garden
   - Expiration：90 days
   - Repository access：Only select repositories，只勾 my-garden
   - Permissions：Contents 和 Pull requests 都改成 Read and write
   - 按 Generate token，馬上複製。這串字只顯示這一次。
3. Obsidian → 設定 → Digital Garden，填三格：GitHub repo name 只填 my-garden，GitHub Username 填 github.com/ 後面那段，GitHub token 貼剛才複製的那串。
4. 試發布一張：打開〈三國演義〉，按 Ctrl／Cmd + P，搜尋 garden publish，選 Publish Active Note。

看結果：等一兩分鐘，打開你的網址。首頁從模板的預設頁變成〈三國演義〉，就代表連上了。上面的人名連結現在點不開是正常的，那些卡還沒發布。

沒變的話：先等兩分鐘；再回頭查三格，最常見的是 repo name 多打了帳號，或 token 少開了 Contents。

token 只放在外掛裡，不貼進筆記、截圖或群組。

## 練習 3（dg-publish）：發布時間軸卡

定位：時間軸＋導覽頁｜期望輸出：導覽頁走得通｜限制：先查開頭三行

1. 做導覽頁。在三國人物知識庫資料夾打開 Codex，貼上：

```text
請在 整理/ 新增 知識庫導覽.md。分成時間、人物、事件三段：時間那段只放 [[時間軸]]；人物那段用 [[連結]] 列出 人物/ 裡的每張卡；事件那段用 [[連結]] 列出 關係/ 裡的每張卡，但先不要放〈三英戰呂布〉，練習 4 再加。只連到已有的卡，不要新增卡片，也不要改別的檔案。開頭加上 dg-publish: true。寫入前先給我看。
```

   看過預覽：事件那段沒有三英戰呂布，也沒有筆記庫裡找不到的卡，再回「可以」。Codex 做不出來，就用講師的 [參考結果/整理/知識庫導覽.md](參考結果/整理/知識庫導覽.md)。

2. 打開〈三國演義〉，在最後一行加 `[[知識庫導覽]]`。
3. 找出還沒勾的卡。在同一個 Codex 貼上：

```text
列出 整理/知識庫導覽.md 連到的每張卡，每張一行，寫出它開頭有沒有 dg-publish: true。只列清單，不要修改任何檔案。
```

   拿清單去核對：打開標「沒有」的卡，看開頭三行，確定 Codex 沒看錯。要公開的，打開那張卡按 Ctrl／Cmd + P，執行 Digital Garden: Add publish flag；不想公開的，回導覽頁把那個連結刪掉。

4. Ctrl／Cmd + P，執行 Publish All Notes Marked for Publish，等兩分鐘再打開網址。

看結果：從首頁點〈知識庫導覽〉，再點〈時間軸〉，一路走得通；導覽頁上每個連結都點得開，包括你剛補勾的卡。講師實跑時，清單標出〈白門樓〉〈草船借箭〉沒有 dg-publish；你的清單可能不一樣，例如第二堂自己寫的卡、還沒加開頭三行的時間軸。

點了出現 404，就是那張還沒勾、或勾了還沒發布。時間軸裡的人名是純文字、點不了，這是對的；時間軸裡出現 `[[ ]]`，或點了會 404 的來源卡連結，回第三堂的 SKILL.md 補規則，再產生一次。

## 練習 4（驗收）：同學從首頁找到新卡

定位：一張新卡｜期望輸出：同學走得到｜限制：無痕視窗、從首頁

1. 公開〈三英戰呂布〉：打開它，執行 Digital Garden: Add publish flag；在導覽頁的事件那段加上 `[[三英戰呂布]]`；再執行 Publish All Notes Marked for Publish。
2. 找網址：Vercel → 你的 my-garden 專案 → Domains，複製最短的那個 `….vercel.app`。不要拿 Deployments 清單裡那串比較長的網址；照 Vercel 文件，Standard Protection 會讓那種網址要先登入 Vercel（講師沒在教室實測過）。
3. 自己先開無痕視窗（Chrome、Edge：Ctrl＋Shift＋N；Mac：Cmd＋Shift＋N），貼上網址，從首頁點到〈三英戰呂布〉。
4. 把網址傳給同學，用 LINE 或寫在紙上都可以。同學在自己的電腦開無痕視窗，只能從首頁開始點：首頁 → 知識庫導覽 → 三英戰呂布，不能直接打卡片的網址。
5. 回報：走到了就打勾；走不到，說卡在哪一頁、看到什麼（404、連結不見、要求登入）。你回去查那一頁的 dg-publish 和連結，修好再發布，請同學再走一次。做完交換角色。

看結果：走不到常見三種：〈三英戰呂布〉沒勾 dg-publish，點了是 404；導覽頁改了沒重新發布，連結不在；傳到要登入的網址，看到 Vercel 登入頁。

## 網址

- 簡報：https://chrouos.github.io/AI-workshop-slides
- Digital Garden 官方入門頁（Deploy to Vercel）：https://docs.forestry.md/getting-started/01-getting-started/
- 建 GitHub token：https://github.com/settings/personal-access-tokens/new
- GitHub 註冊：https://github.com/signup
- Vercel 註冊：https://vercel.com/signup
- 第三堂完成版：https://github.com/Chrouos/AI-workshop-slides/blob/main/examples/aw-04-lab/README.md
- 講師的三國筆記庫（第二堂的 aw-02-lab.zip，點了直接下載）：https://raw.githubusercontent.com/Chrouos/AI-workshop-slides/main/examples/aw-02-lab.zip
- 所有教材總表：https://github.com/Chrouos/AI-workshop-slides/tree/main/examples
