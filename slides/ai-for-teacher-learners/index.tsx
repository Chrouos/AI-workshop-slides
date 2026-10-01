import type { DesignSystem, Page, SlideMeta } from '@open-slide/core';
import { useSlidePageNumber } from '@open-slide/core';
import wrongAnswer from './assets/llm-hallucination-calculation.png';

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
const rule = '#D6D3D1';
const surface = '#F5F5F4';
const raised = '#EFEDEB';
const amber = '#9A6846';
const amberSoft = '#EFE2D4';
const sage = '#DCE5DC';
const mono = '"Source Code Pro", Consolas, monospace';

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

const Shell = ({ children, top = 112 }: { children: React.ReactNode; top?: number }) => (
  <div style={{ width: '100%', height: '100%', boxSizing: 'border-box', position: 'relative', background: 'var(--osd-bg)', color: 'var(--osd-text)', fontFamily: 'var(--osd-font-body)', padding: `${top}px 144px 126px` }}>
    {children}
    <Footer />
  </div>
);

const Heading = ({ children }: { children: React.ReactNode }) => (
  <h2 style={{ fontFamily: 'var(--osd-font-display)', fontSize: 76, fontWeight: 400, lineHeight: 1.2, letterSpacing: '-0.025em', margin: '40px 0 0', maxWidth: 1620 }}>
    {children}
  </h2>
);

const Lead = ({ children }: { children: React.ReactNode }) => (
  <p style={{ fontSize: 36, lineHeight: 1.5, color: muted, maxWidth: 1460, margin: 0 }}>{children}</p>
);

const Arrow = ({ size = 48 }: { size?: number }) => <span style={{ color: faint, fontSize: size, lineHeight: 1 }}>→</span>;

const SmallLabel = ({ children }: { children: React.ReactNode }) => (
  <span style={{ color: 'var(--osd-accent)', fontSize: 25, fontWeight: 600, letterSpacing: '0.07em' }}>{children}</span>
);

const StepPanel = ({ number, title, detail, tint = surface }: { number: string; title: string; detail: string; tint?: string }) => (
  <div style={{ background: tint, borderTop: `3px solid ${rule}`, padding: '32px 34px', minHeight: 192, boxSizing: 'border-box' }}>
    <SmallLabel>{number}</SmallLabel>
    <div style={{ fontSize: 40, fontWeight: 600, marginTop: 18 }}>{title}</div>
    <div style={{ fontSize: 27, color: muted, lineHeight: 1.45, marginTop: 13 }}>{detail}</div>
  </div>
);

const NoteSheet = ({ title, lines = true }: { title: string; lines?: boolean }) => (
  <div style={{ background: '#FFFFFF', border: `1px solid ${rule}`, width: 390, height: 410, boxSizing: 'border-box', padding: '32px 37px', transform: 'rotate(-2deg)' }}>
    <SmallLabel>notes/</SmallLabel>
    <div style={{ fontSize: 39, fontWeight: 600, lineHeight: 1.3, marginTop: 24 }}>{title}</div>
    {lines && <div style={{ marginTop: 40, display: 'grid', gap: 28 }}>
      <div style={{ height: 3, background: rule, width: '100%' }} />
      <div style={{ height: 3, background: rule, width: '82%' }} />
      <div style={{ height: 3, background: rule, width: '93%' }} />
      <div style={{ height: 3, background: rule, width: '66%' }} />
    </div>}
  </div>
);

const ConceptMap = ({ compact = false }: { compact?: boolean }) => (
  <div style={{ width: compact ? 485 : 650, height: compact ? 375 : 485, position: 'relative', boxSizing: 'border-box', background: surface, border: `1px solid ${rule}`, padding: compact ? 30 : 43 }}>
    <SmallLabel>diagrams/</SmallLabel>
    <div style={{ position: 'absolute', left: '27%', top: '26%', width: '48%', background: '#1C1917', color: '#FAFAF9', fontSize: compact ? 30 : 35, padding: '21px 15px', textAlign: 'center', boxSizing: 'border-box' }}>認知負荷理論</div>
    <div style={{ position: 'absolute', left: '16%', top: '58%', width: '31%', background: sage, fontSize: compact ? 25 : 29, padding: '19px 8px', textAlign: 'center', boxSizing: 'border-box' }}>工作記憶</div>
    <div style={{ position: 'absolute', left: '54%', top: '58%', width: '31%', background: amberSoft, fontSize: compact ? 25 : 29, padding: '19px 8px', textAlign: 'center', boxSizing: 'border-box' }}>外在負荷</div>
    <div style={{ position: 'absolute', left: '50%', top: '44%', width: 2, height: '5%', background: faint }} />
    <div style={{ position: 'absolute', left: '31%', top: '49%', width: '39%', height: 2, background: faint }} />
    <div style={{ position: 'absolute', left: '31%', top: '49%', width: 2, height: '10%', background: faint }} />
    <div style={{ position: 'absolute', left: '69%', top: '49%', width: 2, height: '10%', background: faint }} />
  </div>
);

const Terminal = ({ title, children, width = 1000 }: { title: string; children: React.ReactNode; width?: number }) => (
  <div style={{ width, boxSizing: 'border-box', background: '#1F2226', color: '#F5F5F4', border: '1px solid #555B60' }}>
    <div style={{ height: 56, display: 'flex', alignItems: 'center', gap: 13, background: '#30343A', padding: '0 28px', boxSizing: 'border-box' }}>
      <span style={{ width: 13, height: 13, borderRadius: 20, background: '#DF6A63' }} />
      <span style={{ width: 13, height: 13, borderRadius: 20, background: '#E9B650' }} />
      <span style={{ width: 13, height: 13, borderRadius: 20, background: '#73BB78' }} />
      <span style={{ fontFamily: mono, color: '#BCC3CC', fontSize: 22, marginLeft: 18 }}>{title}</span>
    </div>
    <div style={{ padding: '35px 42px 42px', boxSizing: 'border-box' }}>{children}</div>
  </div>
);

const TerminalRow = ({ label, value, focus = false }: { label: string; value: string; focus?: boolean }) => (
  <div style={{ display: 'grid', gridTemplateColumns: '265px 1fr', gap: 20, alignItems: 'baseline', padding: '18px 20px', margin: '4px -20px', background: focus ? '#3C433F' : 'transparent', borderLeft: focus ? '4px solid #AFC7B1' : '4px solid transparent', fontFamily: mono, fontSize: 30, lineHeight: 1.35 }}>
    <span style={{ color: focus ? '#BCE3BF' : '#98A7BA' }}>{label}</span>
    <span>{value}</span>
  </div>
);

const Cover: Page = () => (
  <Shell top={171}>
    <Eyebrow>給師培學生的 AI 協作課</Eyebrow>
    <div style={{ marginTop: 70 }}><Title>認識 AI，<br />開始與 Agent 協作</Title></div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 30, marginTop: 62, fontSize: 35, color: muted }}>
      <span>一份教育筆記</span><Arrow size={39} /><span>可檢查的知識圖</span>
    </div>
    <div style={{ position: 'absolute', right: 145, top: 170, width: 300, height: 320, borderLeft: `2px solid ${rule}`, borderTop: `2px solid ${rule}` }} />
  </Shell>
);

const ResultFirst: Page = () => (
  <Shell>
    <Eyebrow>先看今天要做出的成果</Eyebrow>
    <Heading>同一份筆記，可以變成三種成果</Heading>
    <div style={{ display: 'flex', alignItems: 'center', gap: 30, marginTop: 78 }}>
      <NoteSheet title="認知負荷理論" />
      <Arrow />
      <div style={{ background: '#FFFFFF', border: `1px solid ${rule}`, padding: '35px 40px', width: 390, height: 410, boxSizing: 'border-box', fontFamily: mono, fontSize: 27, lineHeight: 1.8 }}>
        <SmallLabel>outputs/</SmallLabel><br /><br />中心問題<br />├ 工作記憶<br />├ 外在負荷<br />└ 教學做法
      </div>
      <Arrow />
      <ConceptMap compact />
    </div>
    <p style={{ fontSize: 30, color: muted, marginTop: 34 }}>今天不寫程式；你要練習的是判斷：AI 整理得對不對？</p>
  </Shell>
);

const GuessTool: Page = () => (
  <Shell>
    <Eyebrow>舉手選一個</Eyebrow>
    <Heading>這個任務，你會交給誰？</Heading>
    <div style={{ background: surface, padding: '37px 48px', marginTop: 56, fontSize: 37, lineHeight: 1.45 }}>
      「請讀取這六份教育筆記，整理共同概念，再存成一份檔案。」
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 45, marginTop: 57 }}>
      <div style={{ border: `2px solid ${rule}`, padding: '32px 45px', fontSize: 63, fontFamily: 'var(--osd-font-display)' }}>A. ChatGPT</div>
      <div style={{ border: `2px solid ${rule}`, padding: '32px 45px', fontSize: 63, fontFamily: 'var(--osd-font-display)' }}>B. Codex</div>
    </div>
    <p style={{ color: muted, fontSize: 30, marginTop: 49 }}>先選，再說出你判斷的理由。</p>
  </Shell>
);

const ToolRoles: Page = () => (
  <Shell>
    <Eyebrow>答案與理由</Eyebrow>
    <Heading>這堂課用 Codex 操作練習資料夾</Heading>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 58, marginTop: 73 }}>
      <div style={{ height: 420, borderTop: `3px solid ${rule}`, padding: '31px 34px', background: surface, boxSizing: 'border-box' }}>
        <SmallLabel>ChatGPT</SmallLabel>
        <div style={{ marginTop: 38, fontSize: 68, fontFamily: 'var(--osd-font-display)' }}>你 ↔ AI</div>
        <p style={{ fontSize: 33, color: muted, marginTop: 54 }}>提問、討論、發想教案</p>
      </div>
      <div style={{ height: 420, borderTop: `3px solid ${rule}`, padding: '31px 34px', background: sage, boxSizing: 'border-box' }}>
        <SmallLabel>Codex</SmallLabel>
        <div style={{ marginTop: 38, fontSize: 58, fontFamily: 'var(--osd-font-display)' }}>檔案 → AI → 成果</div>
        <p style={{ fontSize: 33, color: muted, marginTop: 54 }}>讀取資料、使用工具、交付結果</p>
      </div>
    </div>
    <p style={{ fontSize: 28, color: muted, marginTop: 30 }}>ChatGPT 也能處理上傳的檔案；這裡聚焦在本機資料夾的練習。</p>
  </Shell>
);

const WrongAnswer: Page = () => (
  <Shell>
    <Eyebrow>先不要相信語氣</Eyebrow>
    <Heading>AI 說得很肯定，答案卻可能錯</Heading>
    <div style={{ display: 'grid', gridTemplateColumns: '1020px 1fr', gap: 75, alignItems: 'center', marginTop: 69 }}>
      <div style={{ border: `1px solid ${rule}`, background: '#FFFFFF', padding: 23 }}>
        <img src={wrongAnswer} alt="早期 ChatGPT 對算式回答 8402 的教材截圖" style={{ display: 'block', width: '100%', height: 385, objectFit: 'contain' }} />
      </div>
      <div>
        <SmallLabel>畫面回答</SmallLabel><div style={{ fontSize: 95, color: muted, marginTop: 10 }}>8402</div>
        <SmallLabel>驗算結果</SmallLabel><div style={{ fontSize: 95, color: amber, marginTop: 10 }}>8484</div>
      </div>
    </div>
    <p style={{ fontSize: 30, color: muted, marginTop: 32 }}>數字、引文、教學主張，都要回到來源核對。</p>
    <p style={{ fontSize: 22, color: faint, marginTop: 18 }}>早期模型示例；圖片來源：IT 邦幫忙（原課程文件附連結）</p>
  </Shell>
);

const TokenPrediction: Page = () => (
  <Shell>
    <Eyebrow>它為什麼能寫出一段話？</Eyebrow>
    <Heading>模型一小段一小段地接續文字</Heading>
    <div style={{ display: 'flex', gap: 20, alignItems: 'center', marginTop: 128 }}>
      <StepPanel number="已給的文字" title="學生需要…" detail="你輸入的問題或資料" tint={surface} />
      <Arrow />
      <StepPanel number="下一段" title="清楚的" detail="模型接出的文字" tint={sage} />
      <Arrow />
      <StepPanel number="再下一段" title="回饋" detail="繼續接續，形成回答" tint={amberSoft} />
    </div>
    <div style={{ marginTop: 83 }}><Lead>接得像答案，不等於已驗算或查證。</Lead></div>
  </Shell>
);

const AgentFlow: Page = () => (
  <Shell>
    <Eyebrow>從聊天走向做事</Eyebrow>
    <Heading>Agent 做事的四個動作</Heading>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 21, marginTop: 97 }}>
      <StepPanel number="01" title="理解目標" detail="你要它完成什麼" tint={surface} />
      <StepPanel number="02" title="讀取資料" detail="只看指定的檔案" tint={sage} />
      <StepPanel number="03" title="使用工具" detail="搜尋、整理、產出" tint={surface} />
      <StepPanel number="04" title="回報結果" detail="交給你檢查" tint={amberSoft} />
    </div>
    <div style={{ marginTop: 80, borderTop: `1px solid ${rule}`, paddingTop: 35, fontSize: 37 }}>人負責：<span style={{ color: muted }}>設定範圍、確認成果、決定是否採用。</span></div>
  </Shell>
);

const InstallRoadmap: Page = () => (
  <Shell>
    <Eyebrow>現在開始動手</Eyebrow>
    <Heading>從零到 Codex，走三站</Heading>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 34, marginTop: 100 }}>
      <StepPanel number="第 1 站" title="安裝 Node.js" detail="到官方網站選 LTS" tint={surface} />
      <StepPanel number="第 2 站" title="確認指令" detail="node -v、npm -v" tint={sage} />
      <StepPanel number="第 3 站" title="安裝並啟動" detail="進入練習資料夾後登入" tint={amberSoft} />
    </div>
    <p style={{ fontSize: 32, color: muted, marginTop: 82 }}>完成每一站，再往下一站；卡住時先看指令有沒有回傳版本號。</p>
  </Shell>
);

const CheckNode: Page = () => (
  <Shell>
    <Eyebrow>第 1、2 站</Eyebrow>
    <Heading>安裝 Node.js LTS，確認兩個版本號</Heading>
    <div style={{ display: 'flex', alignItems: 'center', gap: 71, marginTop: 72 }}>
      <div style={{ fontSize: 42, lineHeight: 1.65, width: 520 }}>① 前往 <strong>nodejs.org</strong><br />② 選擇 <strong>LTS</strong><br />③ 安裝後重開終端機</div>
      <Terminal title="版本檢查" width={900}>
        <div style={{ fontFamily: mono, fontSize: 38, lineHeight: 1.7 }}><span style={{ color: '#8DD4A0' }}>$</span> node -v<br /><span style={{ color: '#AFC7B1' }}>v…</span><br /><span style={{ color: '#8DD4A0' }}>$</span> npm -v<br /><span style={{ color: '#AFC7B1' }}>…</span></div>
      </Terminal>
    </div>
    <p style={{ fontSize: 30, color: muted, marginTop: 57 }}>兩行都有版本號，才能繼續。版本數字每台電腦可能不同。</p>
  </Shell>
);

const InstallCodex: Page = () => (
  <Shell>
    <Eyebrow>第 3 站／安裝</Eyebrow>
    <Heading>先安裝 Codex CLI</Heading>
    <div style={{ marginTop: 85, maxWidth: 1550 }}>
      <Terminal title="在終端機輸入" width={1450}>
        <div style={{ fontFamily: mono, fontSize: 39, lineHeight: 2.05 }}><span style={{ color: '#8DD4A0' }}>$</span> npm install -g @openai/codex@latest</div>
      </Terminal>
    </div>
    <p style={{ fontSize: 35, marginTop: 65, color: muted }}>安裝完成後，先進入練習資料夾，再啟動 Codex。</p>
  </Shell>
);

const OpenProject: Page = () => (
  <Shell>
    <Eyebrow>第 3 站／啟動</Eyebrow>
    <Heading>進入練習資料夾，再啟動 Codex</Heading>
    <div style={{ display: 'grid', gridTemplateColumns: '620px 1fr', gap: 70, alignItems: 'center', marginTop: 67 }}>
      <div style={{ background: surface, padding: '36px 45px', fontSize: 35, lineHeight: 1.65 }}>
        <SmallLabel>先找到課程專案</SmallLabel>
        <div style={{ marginTop: 28 }}>AI-workshop-slides/<br />└─ examples/<br />　 └─ <strong>teacher-learning-lab/</strong></div>
      </div>
      <Terminal title="在專案根目錄的終端機輸入" width={920}>
        <div style={{ fontFamily: mono, fontSize: 34, lineHeight: 1.75 }}><span style={{ color: '#8DD4A0' }}>$</span> cd examples/teacher-learning-lab<br /><span style={{ color: '#8DD4A0' }}>$</span> codex</div>
      </Terminal>
    </div>
    <p style={{ fontSize: 31, color: muted, marginTop: 50 }}>依畫面登入後，確認首頁的 Directory 顯示 teacher-learning-lab。</p>
  </Shell>
);

const StartScreen: Page = () => (
  <Shell>
    <Eyebrow>看懂啟動畫面</Eyebrow>
    <Heading>只要先找兩個欄位</Heading>
    <div style={{ display: 'grid', gridTemplateColumns: '1040px 1fr', gap: 70, alignItems: 'center', marginTop: 65 }}>
      <Terminal title="Codex CLI · 教材示意" width={1040}>
        <div style={{ fontFamily: mono, fontSize: 34, color: '#DDE2E8', marginBottom: 29 }}>&gt;_ OpenAI Codex</div>
        <TerminalRow label="Model" value="依帳號與版本而異" focus />
        <TerminalRow label="Directory" value="teacher-learning-lab" focus />
        <div style={{ fontFamily: mono, fontSize: 28, color: '#A4ADB9', marginTop: 30 }}>&gt; 請描述你的任務…</div>
      </Terminal>
      <div style={{ fontSize: 34, lineHeight: 1.55 }}><div><strong>Model</strong><br /><span style={{ color: muted }}>現在使用的模型</span></div><div style={{ marginTop: 64 }}><strong>Directory</strong><br /><span style={{ color: muted }}>正在工作的資料夾</span></div></div>
    </div>
  </Shell>
);

const DirectoryScope: Page = () => (
  <Shell>
    <Eyebrow>Directory 為什麼重要？</Eyebrow>
    <Heading>AI 先從這個資料夾看起</Heading>
    <div style={{ display: 'grid', gridTemplateColumns: '0.95fr 1.05fr', gap: 80, marginTop: 75 }}>
      <div style={{ background: surface, borderLeft: `3px solid ${rule}`, padding: '33px 44px', fontFamily: mono, fontSize: 36, lineHeight: 1.9 }}>
        teacher-learning-lab/<br />
        ├ notes/<br />
        ├ outputs/<br />
        └ diagrams/
      </div>
      <div style={{ paddingTop: 37 }}><div style={{ fontSize: 46 }}>notes/ <Arrow size={40} /> 原始筆記</div><div style={{ fontSize: 46, marginTop: 40 }}>outputs/ <Arrow size={40} /> 整理草稿</div><div style={{ fontSize: 46, marginTop: 40 }}>diagrams/ <Arrow size={40} /> 知識圖</div></div>
    </div>
  </Shell>
);

const SessionDesk: Page = () => (
  <Shell>
    <Eyebrow>Session 是什麼？</Eyebrow>
    <Heading>同一張工作桌，保留這次討論</Heading>
    <div style={{ background: raised, borderTop: `3px solid ${rule}`, padding: '55px 60px', marginTop: 70 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 35 }}>
        <StepPanel number="你放上桌" title="問題" detail="想學什麼？" tint="#FFFFFF" />
        <Arrow />
        <StepPanel number="AI 參考" title="筆記" detail="讀過哪些檔案？" tint="#FFFFFF" />
        <Arrow />
        <StepPanel number="一起留下" title="結果" detail="已決定什麼？" tint="#FFFFFF" />
      </div>
    </div>
    <p style={{ fontSize: 31, color: muted, marginTop: 49 }}>接著追問，AI 可以沿用這次 Session 的脈絡。</p>
  </Shell>
);

const FirstPrompt: Page = () => (
  <Shell>
    <Eyebrow>動手試 1 / 先觀察</Eyebrow>
    <Heading>第一句：請它先讀，不要改</Heading>
    <div style={{ background: surface, borderLeft: `5px solid ${amber}`, padding: '48px 59px', marginTop: 73, maxWidth: 1450, fontSize: 41, lineHeight: 1.63 }}>
      先不要修改檔案。<br />請閱讀這個練習專案，告訴我：<br />① 專案要做什麼？<br />② 每個資料夾放什麼？<br />③ 我可以從哪份筆記開始？
    </div>
  </Shell>
);

const FirstOutput: Page = () => (
  <Shell>
    <Eyebrow>看結果，不只看回答</Eyebrow>
    <Heading>這次應該看到什麼？</Heading>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 33, marginTop: 91 }}>
      <StepPanel number="看 1" title="它讀了什麼" detail="有沒有進對資料夾？" tint={surface} />
      <StepPanel number="看 2" title="它理解什麼" detail="用途、資料夾、起點" tint={sage} />
      <StepPanel number="看 3" title="它有沒有改檔" detail="這一步應該沒有" tint={amberSoft} />
    </div>
    <p style={{ fontSize: 32, color: muted, marginTop: 89 }}>如果它理解錯了，補充背景再追問；不用急著讓它動手。</p>
  </Shell>
);

const StatusScreen: Page = () => (
  <Shell>
    <Eyebrow>動手試 2 / 查環境</Eyebrow>
    <Heading>輸入 /status，先看這三行</Heading>
    <div style={{ display: 'grid', gridTemplateColumns: '1080px 1fr', gap: 72, alignItems: 'center', marginTop: 60 }}>
      <Terminal title="Codex CLI · /status 教材示意" width={1080}>
        <TerminalRow label="Model" value="目前模型" />
        <TerminalRow label="Directory" value="teacher-learning-lab" focus />
        <TerminalRow label="Permissions" value="Workspace" focus />
        <TerminalRow label="Usage" value="可用額度摘要" />
      </Terminal>
      <div style={{ fontSize: 33, lineHeight: 1.55 }}><strong>Directory</strong><br /><span style={{ color: muted }}>它在哪裡工作？</span><br /><br /><strong>Permissions</strong><br /><span style={{ color: muted }}>它能做哪些操作？</span></div>
    </div>
  </Shell>
);

const StatusChallenge: Page = () => (
  <Shell>
    <Eyebrow>30 秒找一找</Eyebrow>
    <Heading>開始交辦前，先回答三件事</Heading>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 30, marginTop: 105 }}>
      <StepPanel number="?" title="它在哪裡？" detail="找 Directory" tint={surface} />
      <StepPanel number="?" title="它能做什麼？" detail="找 Permissions" tint={sage} />
      <StepPanel number="?" title="現在用哪個？" detail="找 Model" tint={amberSoft} />
    </div>
    <div style={{ marginTop: 92 }}><Lead>模型名稱會變；辨認欄位比背名字有用。</Lead></div>
  </Shell>
);

const UsageToken: Page = () => (
  <Shell>
    <Eyebrow>兩個容易混淆的詞</Eyebrow>
    <Heading>Usage 看額度；Token 看處理量</Heading>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 74, marginTop: 75 }}>
      <div style={{ borderTop: `3px solid ${rule}`, paddingTop: 33 }}><SmallLabel>Usage</SmallLabel><div style={{ fontSize: 49, marginTop: 18 }}>像手機剩餘電量</div><div style={{ display: 'flex', marginTop: 64, height: 80, border: `3px solid ${rule}` }}><div style={{ width: '63%', background: sage }} /></div><p style={{ fontSize: 31, color: muted, marginTop: 31 }}>帳號或方案還能使用多少</p></div>
      <div style={{ borderTop: `3px solid ${rule}`, paddingTop: 33 }}><SmallLabel>Token</SmallLabel><div style={{ fontSize: 49, marginTop: 18 }}>像處理文字的單位</div><div style={{ display: 'flex', gap: 7, marginTop: 64, height: 80 }}><div style={{ flex: 2, background: amberSoft }} /><div style={{ flex: 1, background: sage }} /><div style={{ flex: 3, background: surface }} /><div style={{ flex: 1, background: amberSoft }} /></div><p style={{ fontSize: 31, color: muted, marginTop: 31 }}>輸入、檔案與回答都會算入</p></div>
    </div>
  </Shell>
);

const MemoryLayers: Page = () => (
  <Shell>
    <Eyebrow>Memory 不等於永遠記得</Eyebrow>
    <Heading>重要脈絡，分成兩個地方保存</Heading>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 70, marginTop: 76 }}>
      <div style={{ background: sage, minHeight: 340, padding: '40px 46px', boxSizing: 'border-box' }}><SmallLabel>這次 Session</SmallLabel><div style={{ fontSize: 53, marginTop: 36 }}>桌上的便條</div><p style={{ fontSize: 33, lineHeight: 1.5, color: muted }}>問題、決定、剛才的追問</p></div>
      <div style={{ background: surface, minHeight: 340, padding: '40px 46px', boxSizing: 'border-box' }}><SmallLabel>專案檔案</SmallLabel><div style={{ fontSize: 53, marginTop: 36 }}>放進資料夾</div><p style={{ fontSize: 33, lineHeight: 1.5, color: muted }}>筆記、規則、整理成果</p></div>
    </div>
    <p style={{ fontSize: 31, color: muted, marginTop: 54 }}>下次要用的內容，記得存成可以重讀、檢查的檔案。</p>
  </Shell>
);

const PromptChoice: Page = () => (
  <Shell>
    <Eyebrow>現場二選一</Eyebrow>
    <Heading>哪句話比較容易得到可用成果？</Heading>
    <div style={{ display: 'grid', gridTemplateColumns: '0.82fr 1.18fr', gap: 57, marginTop: 70 }}>
      <div style={{ padding: '34px 39px', borderTop: `3px solid ${rule}`, background: surface, fontSize: 39, minHeight: 360, boxSizing: 'border-box' }}><SmallLabel>A</SmallLabel><p style={{ marginTop: 39 }}>幫我整理這個學習主題。</p></div>
      <div style={{ padding: '34px 39px', borderTop: `3px solid ${amber}`, background: amberSoft, fontSize: 35, lineHeight: 1.65, minHeight: 360, boxSizing: 'border-box' }}><SmallLabel>B</SmallLabel><p style={{ marginTop: 25 }}>只讀認知負荷理論筆記。<br />整理 1 個核心概念、1 個常見誤解、2 個檢查理解的問題。<br />先不要改檔案。</p></div>
    </div>
    <p style={{ fontSize: 30, color: muted, marginTop: 37 }}>找出 B 多說清楚的三件事：範圍、成果、界線。</p>
  </Shell>
);

const LabOverview: Page = () => (
  <Shell>
    <Eyebrow>不寫程式的練習場</Eyebrow>
    <Heading>六份教育筆記，選一份深入看</Heading>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 35, marginTop: 71 }}>
      <StepPanel number="教育心理" title="認知負荷" detail="工作記憶與教學呈現" tint={sage} />
      <StepPanel number="教育心理" title="鷹架" detail="近側發展區與支持" tint={surface} />
      <StepPanel number="教學設計" title="布魯姆" detail="學習目標的層次" tint={amberSoft} />
      <StepPanel number="教育哲學" title="杜威" detail="經驗與學習" tint={surface} />
      <StepPanel number="教育社會" title="隱性課程" detail="沒寫出的學習規則" tint={amberSoft} />
      <StepPanel number="教育社會" title="文化資本" detail="背景與學習機會" tint={sage} />
    </div>
  </Shell>
);

const ScanTask: Page = () => (
  <Shell>
    <Eyebrow>練習 1 / 掃描</Eyebrow>
    <Heading>先讓 Codex 幫你看全貌</Heading>
    <div style={{ display: 'flex', alignItems: 'center', gap: 48, marginTop: 84 }}>
      <div style={{ width: 510, fontSize: 44, lineHeight: 1.55 }}>六份原始筆記<br /><span style={{ color: muted }}>notes/</span></div><Arrow size={70} />
      <div style={{ background: surface, padding: '44px 54px', width: 880, boxSizing: 'border-box', fontSize: 39, lineHeight: 1.65 }}>請整理成一張表：<br />所屬領域、核心問題、教育情境、常見誤解。<br /><span style={{ color: amber }}>先不要修改檔案。</span></div>
    </div>
  </Shell>
);

const ScanOutput: Page = () => (
  <Shell>
    <Eyebrow>練習 1 / 檢查結果</Eyebrow>
    <Heading>一張表，讓你知道該追問哪裡</Heading>
    <div style={{ display: 'grid', gridTemplateColumns: '310px 280px 450px 1fr', borderTop: `3px solid ${rule}`, marginTop: 75, fontSize: 30, lineHeight: 1.35 }}>
      <div style={{ padding: '25px 20px', background: raised }}>筆記</div><div style={{ padding: '25px 20px', background: raised }}>領域</div><div style={{ padding: '25px 20px', background: raised }}>核心問題</div><div style={{ padding: '25px 20px', background: raised }}>追問</div>
      <div style={{ padding: '32px 20px', borderBottom: `1px solid ${rule}` }}>認知負荷理論</div><div style={{ padding: '32px 20px', borderBottom: `1px solid ${rule}` }}>教育心理</div><div style={{ padding: '32px 20px', borderBottom: `1px solid ${rule}` }}>如何減少干擾？</div><div style={{ padding: '32px 20px', borderBottom: `1px solid ${rule}` }}>原文怎麼說？</div>
      <div style={{ padding: '32px 20px', borderBottom: `1px solid ${rule}` }}>文化資本</div><div style={{ padding: '32px 20px', borderBottom: `1px solid ${rule}` }}>教育社會</div><div style={{ padding: '32px 20px', borderBottom: `1px solid ${rule}` }}>背景如何影響機會？</div><div style={{ padding: '32px 20px', borderBottom: `1px solid ${rule}` }}>有哪些例子？</div>
    </div>
    <p style={{ color: muted, fontSize: 30, marginTop: 51 }}>這是示範格式；真正內容要以原始筆記為準。</p>
  </Shell>
);

const AsciiTask: Page = () => (
  <Shell>
    <Eyebrow>練習 2 / 整理關係</Eyebrow>
    <Heading>先畫文字草稿，再決定要不要存檔</Heading>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 0.82fr', gap: 72, marginTop: 67 }}>
      <div style={{ background: surface, padding: '37px 49px', fontFamily: mono, fontSize: 34, lineHeight: 1.7 }}>認知負荷理論<br />├ 工作記憶：容量有限<br />├ 外在負荷：呈現可調整<br />└ 教學做法：減少干擾</div>
      <div style={{ paddingTop: 15, fontSize: 36, lineHeight: 1.65 }}>① 看概念有沒有漏<br />② 看箭頭關係對不對<br />③ 確認後才寫入 <span style={{ fontFamily: mono, fontSize: 31 }}>outputs/</span></div>
    </div>
  </Shell>
);

const CheckOriginal: Page = () => (
  <Shell>
    <Eyebrow>練習 2 / 不要跳過這一步</Eyebrow>
    <Heading>草稿很好看，也要回原文核對</Heading>
    <div style={{ display: 'flex', alignItems: 'center', gap: 65, marginTop: 75 }}><NoteSheet title="原始筆記" /><Arrow size={65} /><div style={{ width: 510, height: 400, boxSizing: 'border-box', background: surface, padding: '41px 49px', fontSize: 35, lineHeight: 1.65 }}>ASCII 草稿<br /><br />概念對嗎？<br />關係對嗎？<br />有沒有自己加上去的話？</div><Arrow size={65} /><div style={{ fontSize: 43, color: amber, lineHeight: 1.55 }}>確認後<br />再保存</div></div>
  </Shell>
);

const SkillSetup: Page = () => (
  <Shell>
    <Eyebrow>練習 3 / 準備圖表 Skill</Eyebrow>
    <Heading>安裝 diagram-design，再開新對話</Heading>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 440px', gap: 60, alignItems: 'center', marginTop: 58 }}>
      <Terminal title="在終端機依序輸入" width={1080}>
        <div style={{ fontFamily: mono, fontSize: 24, lineHeight: 2.25, whiteSpace: 'nowrap' }}><span style={{ color: '#8DD4A0' }}>$</span> codex plugin marketplace add cathrynlavery/diagram-design<br /><span style={{ color: '#8DD4A0' }}>$</span> codex plugin add diagram-design@diagram-design</div>
      </Terminal>
      <div style={{ background: sage, padding: '38px 41px', fontSize: 32, lineHeight: 1.58 }}>1. 加入 Skill 來源<br />2. 安裝 diagram-design<br />3. 重新開啟 Codex Session</div>
    </div>
    <p style={{ fontSize: 28, color: muted, marginTop: 47 }}>來源：diagram-design 官方安裝說明（github.com/cathrynlavery/diagram-design）</p>
  </Shell>
);

const DiagramTask: Page = () => (
  <Shell>
    <Eyebrow>練習 3 / 視覺化</Eyebrow>
    <Heading>把確認過的關係，畫成知識圖</Heading>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 650px', gap: 67, alignItems: 'center', marginTop: 51 }}>
      <div style={{ fontSize: 36, lineHeight: 1.67 }}>請使用 <strong>diagram-design</strong>。<br />給 AI 兩份資料：<br /><strong>原始筆記</strong> ＋ <strong>ASCII 草稿</strong><br /><br />請它先選圖的形式、說明設計，<br />確認後再產生圖檔。</div>
      <ConceptMap />
    </div>
    <p style={{ fontSize: 30, color: muted, marginTop: 22 }}>最後問自己：這張圖是否讓不懂理論的人更容易理解？</p>
  </Shell>
);

const SkillMcp: Page = () => (
  <Shell>
    <Eyebrow>兩種讓 AI 更能做事的方式</Eyebrow>
    <Heading>Skill 給方法；MCP 連外部工具</Heading>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 75, marginTop: 78 }}>
      <div style={{ background: sage, padding: '41px 53px', minHeight: 370, boxSizing: 'border-box' }}><SmallLabel>Skill</SmallLabel><div style={{ fontSize: 59, marginTop: 30 }}>像一張工作流程卡</div><p style={{ fontSize: 33, lineHeight: 1.55, color: muted }}>先讀筆記 → 選圖 → 核對關係 → 輸出</p></div>
      <div style={{ background: surface, padding: '41px 53px', minHeight: 370, boxSizing: 'border-box' }}><SmallLabel>MCP</SmallLabel><div style={{ fontSize: 59, marginTop: 30 }}>像一條連接線</div><p style={{ fontSize: 33, lineHeight: 1.55, color: muted }}>讓 AI 存取 Google Drive 等外部資料與工具</p></div>
    </div>
  </Shell>
);

const TeachingCheck: Page = () => (
  <Shell>
    <Eyebrow>把它帶回教學現場</Eyebrow>
    <Heading>你會把哪一步交給 AI？</Heading>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 32, marginTop: 100 }}>
      <StepPanel number="可交辦" title="整理資料" detail="找共同概念與差異" tint={sage} />
      <StepPanel number="一起做" title="設計呈現" detail="讓知識圖更好懂" tint={surface} />
      <StepPanel number="人來判斷" title="查證與採用" detail="回原文、看學生需求" tint={amberSoft} />
    </div>
    <div style={{ marginTop: 81 }}><Lead>和旁邊的人分享一個你想帶回去試的情境。</Lead></div>
  </Shell>
);

const ExitTicket: Page = () => (
  <Shell top={155}>
    <Eyebrow>一分鐘出口票</Eyebrow>
    <div style={{ marginTop: 52 }}><Title>AI 幫你做了什麼？<br />哪裡仍要你判斷？</Title></div>
    <div style={{ display: 'flex', gap: 32, alignItems: 'center', marginTop: 76, fontSize: 33, color: muted }}>說清楚範圍 <Arrow size={35} /> 看草稿 <Arrow size={35} /> 回來源核對</div>
  </Shell>
);

export const meta: SlideMeta = {
  title: '認識 AI：給師培學生的 Agent 協作課',
  createdAt: '2026-10-01T06:42:21.642Z',
  theme: 'thoughtstream',
};

export const notes: (string | undefined)[] = [
  '先問大家：你上次請 AI 幫忙學習，得到的是一段回答，還是一份可以帶走的成果？今天要練習後者。',
  '先讓學生看見今天的目標。指著筆記、ASCII、知識圖，問哪一份最方便拿去向同學解釋。提醒三者都要忠於原文。',
  '請學生舉手選 A 或 B，再請兩位同學說理由。先不要急著揭曉。',
  '揭曉 Codex 更適合讀取資料夾並寫出檔案；ChatGPT 適合對話與發想。這是用法對照，不是能力絕對界線。',
  '請學生先猜畫面答案是否可信，再亮出驗算結果 8484。這是原教材引用的早期模型例子，圖源：https://ithelp.ithome.com.tw/articles/10315994。重點是建立查證習慣。',
  '用接續文字的例子說明 Token 的概念。這是簡化示意，不把語言模型說成只會機械補字；工具和推理能力也會影響回答。',
  '逐一指向四個動作。問大家哪一步需要人介入最多，帶到設定範圍和驗收成果。',
  '現在轉進操作。確認大家有終端機，讓安裝流程分三站，不在一頁塞滿指令。',
  '帶學生到 Node.js 官方下載頁選 LTS。重新開啟終端機後，用 node -v 和 npm -v 確認。版本號不用相同。',
  '先安裝 Codex CLI。這一頁只輸入安裝指令；先等學生完成，再切到練習資料夾。',
  '從課程專案根目錄執行 cd examples/teacher-learning-lab，再輸入 codex。第一次啟動依畫面登入，確認 Directory 是 teacher-learning-lab；若不是，先停下來調整。',
  '這是放大重畫的教材示意，不要求畫面一模一樣。先找 Model 和 Directory，模型名字隨版本與帳號改變。',
  '用資料夾樹說明 Directory 是目前工作的起點。今天的原始筆記、文字草稿和圖檔各有位置。',
  '把 Session 比成工作桌：同一次討論的問題、資料和結果可以連起來追問。換 Session 前，重要成果記得存檔。',
  '讓學生輸入這段指令，先讀不改。巡視時幫忙確認大家在 teacher-learning-lab 資料夾。',
  '不要只看回答是否流暢。讓學生對照三個檢查點，確認 AI 讀到正確範圍，而且沒有提前改檔。',
  '在 Codex 裡輸入 /status。這張示意刻意只留常用欄位，請學生找 Directory 和 Permissions。',
  '給 30 秒讓學生在自己的畫面找三個欄位。模型名稱不需要背，能辨認欄位才重要。',
  '說明 Usage 是可用額度摘要，Token 是模型處理內容的基本單位。用電量和文字段落作比喻，避免講計費細節。',
  '比較 Session 內的脈絡與寫進檔案的資料。問大家：哪一條學習規則值得留下來供下次使用？',
  '讓學生選 A 或 B，指出 B 的範圍、成果與界線。補充：清楚範圍也可減少不必要的工具使用。',
  '請學生快速掃視六個筆記題目，挑一個熟悉或想學的。整個練習只處理 Markdown 文件，不要求寫程式。',
  '示範掃描指令。先請 AI 整理全貌，不修改檔案。學生可追問哪兩份筆記適合比較。',
  '這是輸出格式示範，不代表原始筆記的完整內容。要求學生挑一列回原文檢查。',
  '選認知負荷理論示範 ASCII 草稿。請學生看概念、關係、是否加入原文沒有的事，再決定能否保存。',
  '強調核對原文是一個必要動作。草稿畫得漂亮不代表正確，關係箭頭尤其要檢查。',
  '在終端機依官方說明加入 diagram-design marketplace 並安裝 plugin。重新開啟 Codex Session 後才進入下一步。官方來源：https://github.com/cathrynlavery/diagram-design。',
  '明確請 Codex 使用 diagram-design，把原始筆記和確認過的 ASCII 草稿一起交給 Skill。請 AI 先說明選什麼圖、為什麼，再產圖。',
  '用知識圖流程卡說明 Skill；用外部資料連接說明 MCP。讓學生各舉一個教育情境。',
  '兩人一組分享一個可交辦的步驟，以及一個必須由自己查證的步驟。',
  '最後請學生寫下兩句話：AI 幫我做了什麼？哪裡仍要我自己判斷？作為一分鐘出口票。',
];

export default [
  Cover, ResultFirst, GuessTool, ToolRoles, WrongAnswer, TokenPrediction, AgentFlow,
  InstallRoadmap, CheckNode, InstallCodex, OpenProject, StartScreen, DirectoryScope, SessionDesk,
  FirstPrompt, FirstOutput, StatusScreen, StatusChallenge, UsageToken, MemoryLayers,
  PromptChoice, LabOverview, ScanTask, ScanOutput, AsciiTask, CheckOriginal,
  SkillSetup, DiagramTask, SkillMcp, TeachingCheck, ExitTicket,
] satisfies Page[];
