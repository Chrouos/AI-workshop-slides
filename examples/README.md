# AI 協作課：教材總表

上課時請在自己的筆電打開簡報：**chrouos.github.io/AI-workshop-slides**。投影片上的下載按鈕和提示詞連結都點得到。

提示詞請直接從各堂的 `prompts.md` 整段複製，不用照投影片打字。下面標「下載」的連結，點了就會直接存成 ZIP；下載後先解壓縮再用（Windows 要在 ZIP 上按右鍵選「全部解壓縮」，直接雙擊只是預覽）。

要投影或印給學生掃的 QR code 都在 [qr/](qr/)。

## 第一堂：認識 AI，學會用 Codex

- 簡報：[aw-01](https://chrouos.github.io/AI-workshop-slides/s/aw-01/)
- 提示詞：[aw-01-lab/prompts.md](aw-01-lab/prompts.md)，練習 1（ChatGPT）和練習 2（Codex）
- 下載：[aw-01-lab.zip](https://raw.githubusercontent.com/Chrouos/AI-workshop-slides/main/examples/aw-01-lab.zip)，練習資料夾，裡面有第 1–21 回原文、回目、提示詞
- 卡住時：[aw-01-sample-output/](aw-01-sample-output/) 是講師跑出來的大綱範例。第一堂沒做完的人，第二堂直接用這份

## 第二堂：Obsidian 與 RAG

- 簡報：[aw-02](https://chrouos.github.io/AI-workshop-slides/s/aw-02/)
- 提示詞：[aw-02-lab/prompts.md](aw-02-lab/prompts.md)
- 下載：[三國人物知識庫.zip](https://raw.githubusercontent.com/Chrouos/AI-workshop-slides/main/examples/aw-02-vault/%E4%B8%89%E5%9C%8B%E4%BA%BA%E7%89%A9%E7%9F%A5%E8%AD%98%E5%BA%AB.zip)，講師的三國筆記庫，解壓縮後用 Obsidian 開啟資料夾。第三、四堂都接著用這一個筆記庫
- 卡住時：[aw-02-lab/三國演義大綱.md](aw-02-lab/三國演義大綱.md) 是範例大綱，第一堂沒做完的人練習 2 用這份；[aw-02-check/](aw-02-check/) 是全班一起核對的講師實跑結果

## 第三堂：Skills

- 簡報：[aw-03](https://chrouos.github.io/AI-workshop-slides/s/aw-03/)
- 提示詞：[aw-03-lab/prompts.md](aw-03-lab/prompts.md)，含 git 裝不起來時的備用做法
- 下載：[第三堂範例.zip](https://raw.githubusercontent.com/Chrouos/AI-workshop-slides/main/examples/aw-03-lab/%E7%AC%AC%E4%B8%89%E5%A0%82%E7%AF%84%E4%BE%8B.zip)，講師實跑的成品（關係圖、三張新關係卡、時間軸、修好的 Skill），中途卡住可以直接拿來用。內容和 [aw-03-lab/範例/](aw-03-lab/範例/) 一樣
- 參考：[aw-03-skill/](aw-03-skill/) 是時間軸 Skill 的骨架和說明
- 第二堂缺課：先下載上面第二堂的三國人物知識庫.zip

## 第四堂：發布到網站

- 簡報：[aw-04](https://chrouos.github.io/AI-workshop-slides/s/aw-04/)
- 提示詞：[aw-04-lab/prompts.md](aw-04-lab/prompts.md)，最上面是課前作業，第四堂上課前要先做完
- 下載：[第三堂完成版.zip](https://raw.githubusercontent.com/Chrouos/AI-workshop-slides/main/examples/aw-04-lab/%E7%AC%AC%E4%B8%89%E5%A0%82%E5%AE%8C%E6%88%90%E7%89%88.zip)，第三堂的成品。第三堂缺課或沒做完的人，照 [aw-04-lab/README.md](aw-04-lab/README.md) 放進筆記庫，就能接著做第四堂
- 卡住時：[aw-04-lab/範例/整理/知識庫導覽.md](aw-04-lab/範例/整理/知識庫導覽.md) 是練習 3 導覽頁的講師範例

## 其他

- [aw-02-vault/](aw-02-vault/)：三國筆記庫的說明。

## 給講師：改了教材之後

ZIP 是從資料夾打包出來的，改了 `aw-01-lab/`、`aw-02-vault/三國人物知識庫/`、`aw-03-lab/範例/`、`aw-04-lab/第三堂完成版/` 裡的檔案，記得重新打包再推上 GitHub：

```text
python3 scripts/pack-examples.py          # 只重包內容有變的 ZIP
python3 scripts/pack-examples.py --check  # 只檢查，有過期的 ZIP 會列出來
```
