import type { DesignSystem, Page, SlideMeta } from '@open-slide/core';
import { useSlidePageNumber } from '@open-slide/core';

import codexStart from './assets/codex-cli-start.png';
import codexStatus from './assets/codex-cli-status.png';
import outputPreview from './assets/learning-output-preview.svg';

export const design: DesignSystem = {
  palette: { bg: '#FAFAF9', text: '#1C1917', accent: '#78716C' },
  fonts: {
    display: '"Libre Baskerville", Georgia, "Times New Roman", serif',
    body: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  typeScale: { hero: 132, body: 38 },
  radius: 0,
};

const FONT_HREF = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;600&family=Libre+Baskerville:wght@400;700&display=swap';
const FONT_LINK_ID = 'osd-webfont-ai-for-teacher-learners';
if (typeof document !== 'undefined') {
  let link = document.getElementById(FONT_LINK_ID) as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement('link');
    link.id = FONT_LINK_ID;
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }
  if (link.href !== FONT_HREF) link.href = FONT_HREF;
}

const muted = '#57534E';
const faint = '#A8A29E';
const rule = '#E7E5E4';
const surface = '#F5F5F4';
const mono = '"Source Code Pro", Consolas, monospace';

const page = {
  width: '100%',
  height: '100%',
  boxSizing: 'border-box' as const,
  position: 'relative' as const,
  background: 'var(--osd-bg)',
  color: 'var(--osd-text)',
  fontFamily: 'var(--osd-font-body)',
  padding: '112px 144px 126px',
};

const Title = ({ children }: { children: React.ReactNode }) => (
  <h1
    style={{
      fontFamily: '"Libre Baskerville", Georgia, "Times New Roman", serif',
      fontSize: 132,
      fontWeight: 400,
      lineHeight: 1.17,
      letterSpacing: '-0.035em',
      maxWidth: 1450,
      margin: 0,
      color: '#1C1917',
    }}
  >
    {children}
  </h1>
);

const Footer = () => {
  const { current, total } = useSlidePageNumber();
  return (
    <div
      style={{
        position: 'absolute',
        left: 144,
        right: 144,
        bottom: 56,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTop: '1px solid #E7E5E4',
        paddingTop: 22,
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        fontSize: 22,
        fontWeight: 400,
        color: '#A8A29E',
      }}
    >
      <span>THOUGHTSTREAM</span>
      <span>{String(current).padStart(2, '0')} / {String(total).padStart(2, '0')}</span>
    </div>
  );
};

const Eyebrow = ({ children }: { children: React.ReactNode }) => (
  <div
    style={{
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      fontSize: 24,
      fontWeight: 600,
      letterSpacing: '0.14em',
      textTransform: 'uppercase',
      color: '#78716C',
    }}
  >
    {children}
  </div>
);

const Heading = ({ children }: { children: React.ReactNode }) => (
  <h2 style={{ fontFamily: 'var(--osd-font-display)', fontSize: 76, fontWeight: 400, lineHeight: 1.2, letterSpacing: '-0.025em', margin: '44px 0 0', maxWidth: 1600 }}>
    {children}
  </h2>
);

const Body = ({ children, width = 1400 }: { children: React.ReactNode; width?: number }) => (
  <p style={{ fontSize: 'var(--osd-size-body)', lineHeight: 1.55, color: muted, maxWidth: width, margin: 0 }}>{children}</p>
);

const Rule = () => <div style={{ height: 1, background: rule, width: '100%' }} />;

const Point = ({ index, title, detail }: { index: string; title: string; detail: string }) => (
  <div style={{ display: 'grid', gridTemplateColumns: '105px 1fr', alignItems: 'baseline', padding: '27px 0', borderTop: `1px solid ${rule}` }}>
    <span style={{ color: faint, fontSize: 26, fontFamily: mono }}>{index}</span>
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 35 }}>
      <strong style={{ fontSize: 38, fontWeight: 600, minWidth: 330 }}>{title}</strong>
      <span style={{ fontSize: 32, lineHeight: 1.45, color: muted }}>{detail}</span>
    </div>
  </div>
);

const CodeLine = ({ children }: { children: React.ReactNode }) => (
  <div style={{ background: surface, borderLeft: '3px solid var(--osd-accent)', padding: '25px 34px', fontFamily: mono, fontSize: 34, lineHeight: 1.4, color: '#1C1917' }}>
    {children}
  </div>
);

const Cover: Page = () => (
  <div style={{ ...page, paddingTop: 177 }}>
    <Eyebrow>給師培學生的第一堂 AI 協作課</Eyebrow>
    <div style={{ marginTop: 72 }}><Title>認識 AI，<br />開始與 Agent 協作</Title></div>
    <div style={{ marginTop: 54 }}><Body>從看懂工具，到用 Codex 整理一份教育專業筆記。</Body></div>
    <Footer />
  </div>
);

const Outcomes: Page = () => (
  <div style={page}>
    <Eyebrow>今天的路線</Eyebrow>
    <Heading>從「會問」走到「會合作」</Heading>
    <div style={{ marginTop: 74, maxWidth: 1510 }}>
      <Point index="01" title="看懂" detail="ChatGPT、Codex 與 Agent 的差異" />
      <Point index="02" title="開始" detail="啟動 Session，讀懂目前環境" />
      <Point index="03" title="練習" detail="把教育筆記整理成可檢查的知識圖" />
    </div>
    <Footer />
  </div>
);

const TwoTools: Page = () => (
  <div style={page}>
    <Eyebrow>先分清楚工具</Eyebrow>
    <Heading>對話，或交辦一項任務？</Heading>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 86, marginTop: 87 }}>
      <div style={{ borderTop: `2px solid ${rule}`, paddingTop: 30 }}>
        <div style={{ fontFamily: 'var(--osd-font-display)', fontSize: 60 }}>ChatGPT</div>
        <p style={{ fontSize: 38, lineHeight: 1.55, color: muted, maxWidth: 640 }}>陪你討論、解釋概念、發想教案。</p>
      </div>
      <div style={{ borderTop: `2px solid ${rule}`, paddingTop: 30 }}>
        <div style={{ fontFamily: 'var(--osd-font-display)', fontSize: 60 }}>Codex</div>
        <p style={{ fontSize: 38, lineHeight: 1.55, color: muted, maxWidth: 640 }}>讀取工作資料夾，使用工具，完成可檢查的成果。</p>
      </div>
    </div>
    <Footer />
  </div>
);

const Evolution: Page = () => (
  <div style={page}>
    <Eyebrow>一條簡單的演進線</Eyebrow>
    <Heading>AI 從回答，走向完成任務</Heading>
    <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginTop: 123, fontSize: 44, lineHeight: 1.35 }}>
      <span>產生文字</span><span style={{ color: faint }}>→</span>
      <span>分步思考</span><span style={{ color: faint }}>→</span>
      <span>使用工具</span><span style={{ color: faint }}>→</span>
      <span>回報成果</span>
    </div>
    <div style={{ marginTop: 116, maxWidth: 1200 }}><Body>關鍵改變：AI 不只回話，也能在你指定的範圍內做事。</Body></div>
    <Footer />
  </div>
);

const Verify: Page = () => (
  <div style={page}>
    <Eyebrow>先建立一個重要習慣</Eyebrow>
    <Heading>語氣肯定，不等於內容正確</Heading>
    <div style={{ marginTop: 83, maxWidth: 1350 }}>
      <Body>AI 可能給出看似合理、卻沒有核對過的答案。</Body>
      <div style={{ marginTop: 62 }}><Rule /></div>
      <p style={{ fontSize: 48, lineHeight: 1.4, marginTop: 54 }}>遇到數字、引文、教學主張：<br /><span style={{ color: 'var(--osd-accent)' }}>回到資料來源再確認。</span></p>
    </div>
    <Footer />
  </div>
);

const AgentLoop: Page = () => (
  <div style={page}>
    <Eyebrow>Agent 如何協作</Eyebrow>
    <Heading>看它做了什麼，再決定下一步</Heading>
    <div style={{ display: 'flex', alignItems: 'stretch', gap: 25, marginTop: 99 }}>
      <div style={{ flex: 1, borderTop: `2px solid ${rule}`, paddingTop: 30, fontSize: 38 }}>理解任務</div>
      <div style={{ color: faint, fontSize: 38, paddingTop: 30 }}>→</div>
      <div style={{ flex: 1, borderTop: `2px solid ${rule}`, paddingTop: 30, fontSize: 38 }}>讀取資料</div>
      <div style={{ color: faint, fontSize: 38, paddingTop: 30 }}>→</div>
      <div style={{ flex: 1, borderTop: `2px solid ${rule}`, paddingTop: 30, fontSize: 38 }}>使用工具</div>
      <div style={{ color: faint, fontSize: 38, paddingTop: 30 }}>→</div>
      <div style={{ flex: 1, borderTop: `2px solid ${rule}`, paddingTop: 30, fontSize: 38 }}>回報結果</div>
    </div>
    <div style={{ marginTop: 130 }}><Body>你仍然負責設定目標、檢查內容與決定是否採用。</Body></div>
    <Footer />
  </div>
);

const Install: Page = () => (
  <div style={page}>
    <Eyebrow>開始使用 Codex CLI</Eyebrow>
    <Heading>照著三步，進入第一個 Session</Heading>
    <div style={{ marginTop: 61, display: 'grid', gridTemplateColumns: '1fr 1.1fr', gap: 72 }}>
      <div style={{ fontSize: 35, lineHeight: 1.65 }}>
        <div>① 安裝 Node.js LTS</div>
        <div style={{ color: muted, fontSize: 28, marginBottom: 20 }}>nodejs.org/en/download</div>
        <div>② 安裝 Codex CLI</div>
        <div style={{ marginTop: 24 }}>③ 輸入 <span style={{ fontFamily: mono }}>codex</span> 並登入</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 25 }}>
        <CodeLine>node -v<br />npm -v</CodeLine>
        <CodeLine>npm install -g @openai/codex@latest</CodeLine>
        <CodeLine>codex</CodeLine>
      </div>
    </div>
    <Footer />
  </div>
);

const StartScreen: Page = () => (
  <div style={page}>
    <Eyebrow>啟動畫面</Eyebrow>
    <Heading>先找 Model 和 Directory</Heading>
    <div style={{ display: 'grid', gridTemplateColumns: '1000px 1fr', gap: 76, alignItems: 'center', marginTop: 46 }}>
      <img src={codexStart} alt="Codex CLI 啟動畫面：Model 與 Directory 欄位" style={{ width: 1000, height: 600, objectFit: 'contain' }} />
      <div style={{ fontSize: 34, lineHeight: 1.55 }}>
        <p><strong>Model</strong><br /><span style={{ color: muted }}>這次使用哪個模型</span></p>
        <p style={{ marginTop: 50 }}><strong>Directory</strong><br /><span style={{ color: muted }}>目前在哪個資料夾工作</span></p>
      </div>
    </div>
    <Footer />
  </div>
);

const Session: Page = () => (
  <div style={page}>
    <Eyebrow>理解 Session</Eyebrow>
    <Heading>把它想成一張工作桌</Heading>
    <div style={{ marginTop: 75, maxWidth: 1450 }}>
      <Point index="01" title="放上背景" detail="我正在讀哪一門課、哪份筆記" />
      <Point index="02" title="一起處理" detail="提問、讀檔、整理與修正" />
      <Point index="03" title="留下脈絡" detail="接著追問，不必每次重頭說明" />
    </div>
    <Footer />
  </div>
);

const FirstTask: Page = () => (
  <div style={page}>
    <Eyebrow>動手試 1</Eyebrow>
    <Heading>第一句指令：先讀，不改</Heading>
    <div style={{ background: surface, borderLeft: '3px solid var(--osd-accent)', padding: '45px 53px', marginTop: 63, maxWidth: 1410, fontSize: 39, lineHeight: 1.7 }}>
      請先閱讀這個資料夾，不要修改檔案。<br />
      告訴我：這個專案要做什麼？<br />
      每個檔案適合放什麼？我可以從哪裡開始？
    </div>
    <p style={{ color: muted, fontSize: 30, marginTop: 42 }}>觀察順序：讀取 → 理解 → 回報 → 由你決定下一步</p>
    <Footer />
  </div>
);

const Status: Page = () => (
  <div style={page}>
    <Eyebrow>動手試 2</Eyebrow>
    <Heading>輸入 /status，確認工作環境</Heading>
    <div style={{ display: 'grid', gridTemplateColumns: '1000px 1fr', gap: 76, alignItems: 'center', marginTop: 42 }}>
      <img src={codexStatus} alt="Codex CLI 的 /status 畫面" style={{ width: 1000, height: 606, objectFit: 'contain' }} />
      <div style={{ fontSize: 33, lineHeight: 1.5 }}>
        <p>它在哪個 <strong>Directory</strong>？</p>
        <p>使用哪個 <strong>Model</strong>？</p>
        <p>有哪些 <strong>Permissions</strong>？</p>
      </div>
    </div>
    <Footer />
  </div>
);

const UsageToken: Page = () => (
  <div style={page}>
    <Eyebrow>兩個容易混淆的詞</Eyebrow>
    <Heading>Usage 是額度，Token 是單位</Heading>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 83, marginTop: 88 }}>
      <div style={{ borderTop: `2px solid ${rule}`, paddingTop: 38 }}>
        <div style={{ fontFamily: 'var(--osd-font-display)', fontSize: 63 }}>Usage</div>
        <p style={{ fontSize: 37, lineHeight: 1.55, color: muted }}>帳號或方案目前還能使用多少。</p>
      </div>
      <div style={{ borderTop: `2px solid ${rule}`, paddingTop: 38 }}>
        <div style={{ fontFamily: 'var(--osd-font-display)', fontSize: 63 }}>Token</div>
        <p style={{ fontSize: 37, lineHeight: 1.55, color: muted }}>模型處理輸入、檔案與回答的基本單位。</p>
      </div>
    </div>
    <Footer />
  </div>
);

const Memory: Page = () => (
  <div style={page}>
    <Eyebrow>理解 Memory</Eyebrow>
    <Heading>重要背景，最好寫得下來</Heading>
    <div style={{ marginTop: 80, maxWidth: 1460 }}>
      <Point index="01" title="本次對話" detail="保留這次 Session 的問題與決定" />
      <Point index="02" title="專案檔案" detail="筆記、規則與成果可供下次再讀" />
    </div>
    <p style={{ color: muted, fontSize: 34, lineHeight: 1.5, marginTop: 67 }}>AI 不會永遠記得全部；重要知識要存成你能檢查的檔案。</p>
    <Footer />
  </div>
);

const BetterPrompt: Page = () => (
  <div style={page}>
    <Eyebrow>把需求說具體</Eyebrow>
    <Heading>給範圍、成果與界線</Heading>
    <div style={{ display: 'grid', gridTemplateColumns: '0.8fr 1.2fr', gap: 72, marginTop: 68, fontSize: 34, lineHeight: 1.55 }}>
      <div style={{ borderTop: `2px solid ${rule}`, paddingTop: 31 }}>
        <div style={{ color: faint, fontSize: 25, marginBottom: 24 }}>比較模糊</div>
        幫我整理這個學習主題。
      </div>
      <div style={{ borderTop: '2px solid var(--osd-accent)', paddingTop: 31 }}>
        <div style={{ color: 'var(--osd-accent)', fontSize: 25, marginBottom: 24 }}>比較清楚</div>
        只讀認知負荷理論筆記。<br />
        整理 1 個核心概念、1 個常見誤解、<br />
        2 個檢查理解的問題。先不要改檔案。
      </div>
    </div>
    <Footer />
  </div>
);

const Lab: Page = () => (
  <div style={page}>
    <Eyebrow>不寫程式的練習專案</Eyebrow>
    <Heading>六份筆記，一個學習任務</Heading>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, marginTop: 64, fontSize: 34, lineHeight: 1.75 }}>
      <div style={{ borderTop: `1px solid ${rule}`, paddingTop: 23 }}>認知負荷理論<br />近側發展區與鷹架<br />布魯姆教育目標分類學</div>
      <div style={{ borderTop: `1px solid ${rule}`, paddingTop: 23 }}>杜威的經驗教育<br />隱性課程<br />文化資本</div>
    </div>
    <p style={{ color: muted, fontSize: 34, marginTop: 67 }}>目標：讀懂關係、找出誤解，再畫成可討論的知識圖。</p>
    <Footer />
  </div>
);

const ScanNotes: Page = () => (
  <div style={page}>
    <Eyebrow>練習 1 / 掃描</Eyebrow>
    <Heading>先看懂資料夾與六份筆記</Heading>
    <div style={{ marginTop: 74, maxWidth: 1490 }}>
      <Point index="01" title="辨認" detail="每份筆記的核心問題與所屬領域" />
      <Point index="02" title="比較" detail="哪兩份理論適合放在一起討論？" />
      <Point index="03" title="標記" detail="哪些地方還需要回原文查證？" />
    </div>
    <Footer />
  </div>
);

const Ascii: Page = () => (
  <div style={page}>
    <Eyebrow>練習 2 / 整理</Eyebrow>
    <Heading>先用文字，畫出知識關係</Heading>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 0.87fr', gap: 76, marginTop: 69 }}>
      <div style={{ background: surface, padding: '38px 47px', fontFamily: mono, fontSize: 32, lineHeight: 1.7, whiteSpace: 'pre-line' }}>{'認知負荷理論\n├─ 工作記憶：容量有限\n├─ 外在負荷：呈現方式可調整\n└─ 教學：減少不必要干擾'}</div>
      <div style={{ fontSize: 35, lineHeight: 1.6, color: muted, paddingTop: 34 }}>請 AI 先顯示草稿。<br /><br />你確認概念與關係後，再讓它寫入檔案。</div>
    </div>
    <Footer />
  </div>
);

const Diagram: Page = () => (
  <div style={page}>
    <Eyebrow>練習 3 / 視覺化</Eyebrow>
    <Heading>從原始筆記，走到知識圖</Heading>
    <img src={outputPreview} alt="原始筆記、ASCII 結構與知識圖三種成果的對照" style={{ display: 'block', width: 1450, height: 650, objectFit: 'contain', marginTop: 13 }} />
    <Footer />
  </div>
);

const SkillMcp: Page = () => (
  <div style={page}>
    <Eyebrow>兩種協助 AI 的方式</Eyebrow>
    <Heading>Skill 給方法，MCP 連工具</Heading>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 84, marginTop: 90 }}>
      <div style={{ borderTop: `2px solid ${rule}`, paddingTop: 34 }}>
        <div style={{ fontFamily: 'var(--osd-font-display)', fontSize: 65 }}>Skill</div>
        <p style={{ fontSize: 37, lineHeight: 1.55, color: muted }}>像工作指南：指定步驟與品質要求。</p>
      </div>
      <div style={{ borderTop: `2px solid ${rule}`, paddingTop: 34 }}>
        <div style={{ fontFamily: 'var(--osd-font-display)', fontSize: 65 }}>MCP</div>
        <p style={{ fontSize: 37, lineHeight: 1.55, color: muted }}>像連接線：讓 AI 使用外部資料與工具。</p>
      </div>
    </div>
    <Footer />
  </div>
);

const Closing: Page = () => (
  <div style={{ ...page, paddingTop: 158 }}>
    <Eyebrow>帶走三個習慣</Eyebrow>
    <div style={{ marginTop: 54 }}><Title>讓 AI 幫你學，<br />也讓自己保持判斷。</Title></div>
    <div style={{ display: 'flex', gap: 46, marginTop: 66, fontSize: 32, color: muted }}>
      <span>說清楚範圍</span><span style={{ color: faint }}>／</span>
      <span>先看草稿</span><span style={{ color: faint }}>／</span>
      <span>回到來源查證</span>
    </div>
    <Footer />
  </div>
);

export const meta: SlideMeta = {
  title: '認識 AI：給師培學生的 Agent 協作課',
  createdAt: '2026-10-01T06:42:21.642Z',
  theme: 'thoughtstream',
};

export const notes: (string | undefined)[] = [
  '開場先問：你最近一次請 AI 幫忙學習，是請它回答問題，還是請它完成一件事？今天會用教育專業筆記練習第二種方式。',
  '說明今天的三段路線。先理解工具，再確認工作環境，最後完成筆記練習。這堂課不需要寫程式。',
  '請學生各舉一個例子：什麼時候適合對話？什麼時候想交辦一個可以檢查成果的任務？',
  '這是理解工具能力的簡化路線，不要求記住模型發展史。重點是工具使用讓 AI 可以讀取資料並回報結果。',
  '可用原文件中的算術例子或假引文說明：文字流暢不能替代驗算。請學生想想教育現場有哪些主張尤其需要查證。',
  '逐步讀出四個動作。提醒學生觀察 AI 實際讀了什麼、改了什麼，以及最後交付了什麼。',
  '帶學生依序完成安裝。Node.js 請選官方 LTS；安裝後重新開啟終端機，再用版本指令確認。依畫面完成 Codex 登入。',
  '請大家先只找兩個欄位。模型名稱可能隨版本變動，不需要背；Directory 決定目前工作的資料夾。',
  '用備課桌比喻 Session：這次討論所需資料和追問都放在同一張桌上。換一張桌時，重要資料最好已寫成檔案。',
  '讓學生在練習專案輸入這句話，先觀察 Codex 的理解。這一步不改檔案，方便對照自己的要求和 AI 的行動。',
  '請學生輸入 /status，指出 Model、Directory 與 Permissions。聚焦在環境判讀，不需要逐欄介紹。',
  '用「帳戶還能用多少」對照「這次處理了多少文字與檔案」。避免把 Usage 當成單一提問的成績。',
  '說明兩層記憶：對話中的脈絡，以及存成檔案的長期資料。請學生想一件值得寫下來的學習規則。',
  '請學生比較左右兩句，說出右邊多了哪些資訊：範圍、輸出格式、限制。這也能減少無關的搜尋。',
  '介紹 teacher-learning-lab 的六份筆記。讓學生挑一個熟悉或好奇的主題，這個練習只處理 Markdown 文件。',
  '第一輪請 AI 掃描全部筆記，整理領域、核心問題、情境與常見誤解。追問哪兩份適合比較，以及理由。',
  '選認知負荷理論示範 ASCII 草稿。提醒學生：先核對原始筆記，再同意寫入 outputs/。畫出的箭頭也必須忠於原文。',
  '說明三種成果的關係：原始筆記是來源，ASCII 是可修改的結構草稿，知識圖是方便討論的視覺成果。最後仍要回到原文核對。',
  '舉例：固定的知識圖製作流程可以寫成 Skill；如果要連 Google Drive 讀取檔案，則需要連接外部工具的方式。',
  '請學生分享今天最想帶回去用的一個習慣。結束時重申：AI 可以加快整理，但教學判斷與查證仍由人負責。',
];

export default [
  Cover, Outcomes, TwoTools, Evolution, Verify, AgentLoop, Install, StartScreen,
  Session, FirstTask, Status, UsageToken, Memory, BetterPrompt, Lab, ScanNotes,
  Ascii, Diagram, SkillMcp, Closing,
] satisfies Page[];
