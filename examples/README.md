# AI 協作課：教材總表

上課時請在自己的筆電打開簡報：**chrouos.github.io/AI-workshop-slides**。投影片上的下載按鈕和提示詞連結都點得到。

提示詞請直接從各堂的 `prompts.md` 整段複製，不用照投影片打字。下面標「下載」的連結，點了就會直接存成 ZIP；下載後先解壓縮再用（Windows 要在 ZIP 上按右鍵選「全部解壓縮」，直接雙擊只是預覽）。

要投影或印給學生掃的 QR code 都在 [qr/](qr/)。

## 第一堂：認識 AI，學會用 Codex

- 簡報：[aw-01](https://chrouos.github.io/AI-workshop-slides/s/aw-01/)
- 提示詞：[aw-01-lab/prompts.md](aw-01-lab/prompts.md)，練習 1（ChatGPT，課後自己練，參考結果在 [aw-01-lab/ChatGPT_練習/](aw-01-lab/ChatGPT_練習/README.md)）和練習 2（Codex，在 `Codex_練習/` 裡做）
- 下載：[aw-01-lab.zip](https://raw.githubusercontent.com/Chrouos/AI-workshop-slides/main/examples/aw-01-lab.zip)，練習資料夾，裡面有第 1–21 回原文、回目、提示詞
- 卡住時：[aw-01-sample-output/](aw-01-sample-output/) 是講師跑出來的大綱範例。第一堂沒做完的人，第二堂直接用這份

## 第二堂：Obsidian 與 RAG

- 簡報：[aw-02](https://chrouos.github.io/AI-workshop-slides/s/aw-02/)
- 下載：[aw-02-lab.zip](https://raw.githubusercontent.com/Chrouos/AI-workshop-slides/main/examples/aw-02-lab.zip)，這堂的東西都在裡面：
  - `三國人物知識庫/`：講師的三國筆記庫，用 Obsidian 開啟這個資料夾，Codex 也開在這裡。第三、四堂都接著用這一個筆記庫
  - `參考結果/`：範例大綱（第一堂沒做完的人練習 2 用）、全班一起核對的講師實跑結果
  - `prompts.md`：[線上看](aw-02-lab/prompts.md)
- 說明：[aw-02-lab/README.md](aw-02-lab/README.md)，含筆記庫裡每張卡的介紹

## 第三堂：Skills

- 簡報：[aw-03](https://chrouos.github.io/AI-workshop-slides/s/aw-03/)
- 下載：[aw-03-lab.zip](https://raw.githubusercontent.com/Chrouos/AI-workshop-slides/main/examples/aw-03-lab.zip)，Codex 一樣開在自己的「三國人物知識庫」，這包只是教材：
  - `prompts.md`：[線上看](aw-03-lab/prompts.md)，含 git 裝不起來時的備用做法
  - `eli5/`：git 裝不起來時的備用 Skill
  - `sanguo-timeline-骨架/`：時間軸 Skill 的骨架和說明
  - `參考結果/`：講師實跑的成品（關係圖、三張新關係卡、時間軸、修好的 Skill），中途卡住可以直接拿來用
- 第二堂缺課：先下載上面第二堂的 aw-02-lab.zip，用裡面的「三國人物知識庫」

## 第四堂：發布到網站

- 簡報：[aw-04](https://chrouos.github.io/AI-workshop-slides/s/aw-04/)
- 下載：[aw-04-lab.zip](https://raw.githubusercontent.com/Chrouos/AI-workshop-slides/main/examples/aw-04-lab.zip)，Codex 一樣開在自己的「三國人物知識庫」：
  - `prompts.md`：[線上看](aw-04-lab/prompts.md)，最上面是課前作業，第四堂上課前要先做完
  - `第三堂完成版/`：第三堂的成品。第三堂缺課或沒做完的人，照 [aw-04-lab/README.md](aw-04-lab/README.md) 放進筆記庫，就能接著做第四堂
  - `參考結果/整理/知識庫導覽.md`：練習 3 導覽頁的講師範例

## 給講師：改了教材之後

每堂一個 ZIP，從同名資料夾打包：`aw-01-lab/`、`aw-02-lab/`、`aw-03-lab/`、`aw-04-lab/`。改了裡面的檔案，記得重新打包再推上 GitHub。學生打開 Codex 的資料夾（`aw-01-lab/Codex_練習/`、`aw-02-lab/三國人物知識庫/`）只放 Codex 要讀的東西，提示詞和參考結果都放在外層；打包時也會略過講師自己試跑留下的 AGENTS.md、三國演義大綱.md 和影片：

```text
python3 scripts/pack-examples.py          # 只重包內容有變的 ZIP
python3 scripts/pack-examples.py --check  # 只檢查，有過期的 ZIP 會列出來
```
