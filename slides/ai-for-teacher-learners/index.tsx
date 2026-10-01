import type { DesignSystem, Page, SlideMeta } from '@open-slide/core';
import { useSlidePageNumber } from '@open-slide/core';
import toolComparison from './assets/chatgpt-vs-codex.png';
import wrongAnswer from './assets/llm-hallucination-calculation.png';
import learningOutput from './assets/diagram-learning-output.svg';
import agentFlowDiagram from './assets/diagram-agent-flow.svg';
import sessionDiagram from './assets/diagram-session.svg';
import usageTokenDiagram from './assets/diagram-usage-token.svg';
import skillMcpDiagram from './assets/diagram-skill-mcp.svg';
import nodeNpmCheck from './assets/node-npm-check.png';
import codexStart from './assets/codex-cli-start.png';
import codexStatus from './assets/codex-cli-status.png';
import codexFirstTask from './assets/codex-cli-first-task.png';

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
  <div style={{ width: compact ? 485 : 650, height: compact ? 375 : 485, boxSizing: 'border-box', background: '#FFFFFF', border: `1px solid ${rule}`, padding: compact ? 23 : 34, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
    <div style={{ color: 'var(--osd-accent)', fontSize: compact ? 22 : 25, fontWeight: 600, letterSpacing: '0.07em' }}>認知負荷理論 / 關係圖</div>
    <div style={{ minHeight: compact ? 74 : 96, boxSizing: 'border-box', background: '#1C1917', color: '#FAFAF9', padding: compact ? '9px 18px' : '16px 25px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <div style={{ fontSize: compact ? 28 : 36, fontWeight: 600 }}>工作記憶容量有限</div>
    </div>
    <div style={{ textAlign: 'center', color: amber, fontSize: compact ? 20 : 25, lineHeight: 1 }}>↓ 降低干擾</div>
    <div style={{ minHeight: compact ? 74 : 96, boxSizing: 'border-box', background: amberSoft, borderLeft: `5px solid ${amber}`, padding: compact ? '9px 18px' : '16px 25px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <div style={{ fontSize: compact ? 27 : 34, fontWeight: 600 }}>減少不必要的外在負荷</div>
    </div>
    <div style={{ textAlign: 'center', color: faint, fontSize: compact ? 20 : 25, lineHeight: 1 }}>↓ 教學做法</div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: compact ? 11 : 16 }}>
      <div style={{ minHeight: compact ? 64 : 80, background: sage, display: 'grid', placeItems: 'center', fontSize: compact ? 25 : 30, fontWeight: 600 }}>拆開步驟</div>
      <div style={{ minHeight: compact ? 64 : 80, background: surface, display: 'grid', placeItems: 'center', fontSize: compact ? 25 : 30, fontWeight: 600 }}>標出關鍵資訊</div>
    </div>
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

// A page built around one hero asset (a recolored diagram, or a real CLI capture).
// The figure carries the headline; the deck's Eyebrow + Footer keep it part of the story.
const AssetPage = ({ eyebrow, src, alt, width, lead }: { eyebrow: string; src: string; alt: string; width: number; lead?: string }) => (
  <Shell>
    <Eyebrow>{eyebrow}</Eyebrow>
    <div style={{ marginTop: 26, display: 'flex', justifyContent: 'center' }}>
      <img src={src} alt={alt} style={{ display: 'block', width, height: 'auto', border: `1px solid ${rule}`, background: '#FFFFFF' }} />
    </div>
    {lead ? (
      <p style={{ fontSize: 29, color: muted, marginTop: 22, textAlign: 'center', maxWidth: 1400, marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.5 }}>{lead}</p>
    ) : null}
  </Shell>
);

// One stop on the course map; `state` marks where the audience is right now.
const RouteStop = ({ number, label, state }: { number: string; label: string; state: 'done' | 'now' | 'next' }) => (
  <div style={{ background: state === 'now' ? amberSoft : state === 'done' ? surface : '#FFFFFF', borderTop: `3px solid ${state === 'now' ? amber : rule}`, border: state === 'next' ? `1px dashed ${rule}` : undefined, padding: '28px 30px', minHeight: 176, boxSizing: 'border-box' }}>
    <SmallLabel>{number}　{state === 'done' ? '已完成' : state === 'now' ? '你在這裡' : '接下來'}</SmallLabel>
    <div style={{ fontSize: 38, fontWeight: 600, marginTop: 18, color: state === 'next' ? faint : 'var(--osd-text)' }}>{label}</div>
  </div>
);

const SpeakerIntro: Page = () => (
  <Shell>
    <Eyebrow>講者介紹 / ABOUT ME</Eyebrow>
    <Heading>黃懷萱</Heading>
    <p style={{ fontSize: 34, lineHeight: 1.5, color: muted, margin: '22px 0 0', maxWidth: 1500 }}>AI 工程師，喜歡使用 AI 輔助日常生活與工程相關的內容</p>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 220px 1fr', gap: 48, alignItems: 'center', marginTop: 64 }}>
      <div style={{ textAlign: 'center' }}>
        <SmallLabel>Academic</SmallLabel>
        <div style={{ fontFamily: 'var(--osd-font-display)', fontSize: 68, lineHeight: 1.25, marginTop: 25 }}>中央大學碩士</div>
        <div style={{ fontSize: 31, color: muted, marginTop: 18 }}>NLP / LLM / RAG</div>
      </div>
      <div style={{ fontSize: 88, color: faint, textAlign: 'center', lineHeight: 1 }}>→</div>
      <div style={{ textAlign: 'center' }}>
        <SmallLabel>Industry</SmallLabel>
        <div style={{ fontFamily: 'var(--osd-font-display)', fontSize: 68, lineHeight: 1.25, marginTop: 25 }}>關貿網路</div>
        <div style={{ fontSize: 31, color: muted, marginTop: 18 }}>AI Engineer · 智慧客服</div>
        <div style={{ fontSize: 24, color: faint, marginTop: 14 }}>已上線：EZ WAY · eHub · TTLL</div>
      </div>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 26, marginTop: 56 }}>
      <span style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--osd-accent)' }} />
      <span style={{ flex: 1, borderTop: `1px solid ${rule}` }} />
      <span style={{ color: muted, fontSize: 25, letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>Research → Product</span>
      <span style={{ flex: 1, borderTop: `1px solid ${rule}` }} />
      <span style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--osd-accent)' }} />
    </div>
  </Shell>
);

const Agenda: Page = () => (
  <Shell>
    <Eyebrow>今天的路線 / AGENDA</Eyebrow>
    <Heading>從認識 AI，到完成一張知識圖</Heading>
    <div style={{ marginTop: 58, borderTop: `1px solid ${rule}` }}>
      {[
        ['01', '認識 AI', 'ChatGPT、Codex 與 Agent 怎麼協作'],
        ['02', '開始用 Codex', '安裝、啟動，確認工作資料夾'],
        ['03', '整理教育筆記', '讓 AI 讀資料、比較概念、提出草稿'],
        ['04', '核對與視覺化', '回原文檢查，再把概念畫成知識圖'],
      ].map(([number, title, detail]) => (
        <div key={number} style={{ display: 'grid', gridTemplateColumns: '110px 500px 1fr', alignItems: 'center', minHeight: 126, borderBottom: `1px solid ${rule}` }}>
          <span style={{ fontSize: 25, color: 'var(--osd-accent)', fontWeight: 600 }}>{number}</span>
          <span style={{ fontFamily: 'var(--osd-font-display)', fontSize: 47, lineHeight: 1.2 }}>{title}</span>
          <span style={{ fontSize: 29, color: muted, lineHeight: 1.45 }}>{detail}</span>
        </div>
      ))}
    </div>
  </Shell>
);

const Cover: Page = () => (
  <Shell top={171}>
    <Eyebrow>給師培學生的 AI 協作課</Eyebrow>
    <div style={{ marginTop: 70 }}><Title>認識 AI，<br />讓它幫你讀懂教育筆記</Title></div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 30, marginTop: 62, fontSize: 35, color: muted }}>
      <span>一份教育筆記</span><Arrow size={39} /><span>一張能核對的知識圖</span>
    </div>
    <div style={{ position: 'absolute', right: 145, top: 170, width: 300, height: 320, borderLeft: `2px solid ${rule}`, borderTop: `2px solid ${rule}` }} />
  </Shell>
);

const ResultFirst: Page = () => (
  <AssetPage
    eyebrow="先看終點：這堂課會做出什麼？"
    src={learningOutput}
    alt="同一條知識關係，從原始筆記、ASCII 草稿，到最後的知識圖三個階段"
    width={1380}
    lead="今天會把一份筆記整理成三步：先找概念，再確認關係，最後回原文核對。"
  />
);

const CompareCard = ({ tint, tool, role, give, get }: { tint: string; tool: string; role: string; give: string; get: string }) => (
  <div style={{ background: tint, borderTop: `3px solid ${rule}`, padding: '24px 32px 26px' }}>
    <SmallLabel>{tool}</SmallLabel>
    <div style={{ fontSize: 36, fontWeight: 600, lineHeight: 1.3, marginTop: 14 }}>{role}</div>
    <div style={{ display: 'flex', gap: 16, alignItems: 'baseline', marginTop: 18 }}>
      <span style={{ color: faint, fontSize: 24, minWidth: 74, flexShrink: 0 }}>你給它</span>
      <span style={{ fontSize: 26, color: muted, lineHeight: 1.4 }}>{give}</span>
    </div>
    <div style={{ display: 'flex', gap: 16, alignItems: 'baseline', marginTop: 12 }}>
      <span style={{ color: faint, fontSize: 24, minWidth: 74, flexShrink: 0 }}>它給你</span>
      <span style={{ fontSize: 28, color: '#1C1917', fontWeight: 600, lineHeight: 1.4 }}>{get}</span>
    </div>
  </div>
);

const ToolComparison: Page = () => (
  <Shell>
    <Eyebrow>ChatGPT / Codex</Eyebrow>
    <Heading>討論想法用 ChatGPT，動手做事用 Codex</Heading>
    <div style={{ display: 'grid', gridTemplateColumns: '760px 1fr', gap: 56, alignItems: 'start', marginTop: 42 }}>
      <div>
        <img
          src={toolComparison}
          alt="ChatGPT 與 Codex 典型使用情境的插圖"
          style={{ display: 'block', width: 760, height: 440, objectFit: 'contain', border: `1px solid ${rule}`, background: '#FFFFFF' }}
        />
        <p style={{ fontSize: 22, color: faint, marginTop: 17 }}>示意圖呈現使用情境，不是功能的絕對界線。</p>
      </div>
      <div style={{ display: 'grid', gap: 24 }}>
        <CompareCard
          tint={surface}
          tool="ChatGPT"
          role="像可以一起討論的朋友"
          give="上傳筆記、提出問題"
          get="一段可以繼續聊的回答"
        />
        <CompareCard
          tint={sage}
          tool="Codex"
          role="像幫你把事做完的助理"
          give="指定資料夾、交辦任務"
          get="一個能打開、檢查的檔案"
        />
      </div>
    </div>
    <p style={{ fontSize: 31, color: muted, marginTop: 24 }}>ChatGPT 也能處理上傳的檔案；兩者是使用情境不同，不是絕對分工。</p>
  </Shell>
);

const ToolRoles: Page = () => (
  <Shell>
    <Eyebrow>所以今天用 Codex，要做這件事</Eyebrow>
    <Heading>今天的任務，分四步走</Heading>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 56px 1fr 56px 1fr 56px 1fr', alignItems: 'center', marginTop: 96 }}>
      <StepPanel number="① notes/" title="讀資料夾" detail="先讀懂原始筆記" tint={surface} />
      <div style={{ textAlign: 'center' }}><Arrow /></div>
      <StepPanel number="② 草稿" title="先出草稿" detail="用文字排出關係" tint={sage} />
      <div style={{ textAlign: 'center' }}><Arrow /></div>
      <StepPanel number="③ 原文" title="回原文核對" detail="每條關係都有根據" tint={amberSoft} />
      <div style={{ textAlign: 'center' }}><Arrow /></div>
      <StepPanel number="④ outputs/" title="存成檔案" detail="下次還能打開再看" tint={surface} />
    </div>
    <div style={{ marginTop: 84 }}><Lead>這四步都在同一個資料夾裡完成——這正是 Codex 擅長的事。</Lead></div>
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
    <p style={{ fontSize: 30, color: muted, marginTop: 32 }}>遇到數字、引用或教學主張，記得回原文查。</p>
    <p style={{ fontSize: 26, color: muted, marginTop: 18 }}>這是早期模型案例，只用來提醒：語氣肯定，不代表答案正確。<span style={{ color: faint, fontSize: 20 }}>　圖片來源：IT 邦幫忙</span></p>
  </Shell>
);

const TokenPrediction: Page = () => (
  <Shell>
    <Eyebrow>它為什麼能寫出一段話？</Eyebrow>
    <Heading>簡單說，模型會根據前後文，預測接下來的文字</Heading>
    <div style={{ display: 'flex', gap: 20, alignItems: 'center', marginTop: 88 }}>
      <StepPanel number="已給的文字" title="學生需要…" detail="你輸入的問題或資料" tint={surface} />
      <Arrow />
      <StepPanel number="下一段" title="清楚的" detail="模型接出的文字" tint={sage} />
      <Arrow />
      <StepPanel number="再下一段" title="回饋" detail="繼續接續，形成回答" tint={amberSoft} />
    </div>
    <div style={{ marginTop: 83 }}><Lead>說得順，不代表它算過、查過。</Lead></div>
  </Shell>
);

const AgentFlow: Page = () => (
  <AssetPage
    eyebrow="它怎麼從「回答」變成「動手做事」？"
    src={agentFlowDiagram}
    alt="Agent 從你說目標、先看資料、動手做、交回結果，到你再確認的五個步驟"
    width={1600}
  />
);

const RunItNow: Page = () => (
  <Shell>
    <Eyebrow>從觀念到動手</Eyebrow>
    <Heading>接下來，把這個流程實際跑一遍</Heading>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 20, marginTop: 84 }}>
      <RouteStop number="01" label="認識 AI" state="done" />
      <RouteStop number="02" label="開始用 Codex" state="now" />
      <RouteStop number="03" label="整理教育筆記" state="next" />
      <RouteStop number="04" label="核對與視覺化" state="next" />
    </div>
    <div style={{ marginTop: 80 }}><Lead>先讓 Codex 進到正確資料夾，再交辦第一個小任務。</Lead></div>
  </Shell>
);

const InstallRoadmap: Page = () => (
  <Shell>
    <Eyebrow>現在開始動手</Eyebrow>
    <Heading>跟著三步，打開 Codex</Heading>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 34, marginTop: 100 }}>
      <StepPanel number="第 1 站" title="安裝 Node.js" detail="到官方網站選 LTS" tint={surface} />
      <StepPanel number="第 2 站" title="確認安裝完成" detail="node -v、npm -v" tint={sage} />
      <StepPanel number="第 3 站" title="安裝並啟動" detail="進入練習資料夾後登入" tint={amberSoft} />
    </div>
    <p style={{ fontSize: 32, color: muted, marginTop: 82 }}>看到版本號再往下走；沒看到，就先停在這一步。</p>
  </Shell>
);

const CheckNode: Page = () => (
  <AssetPage
    eyebrow="第 1、2 站／先裝 Node.js，再確認"
    src={nodeNpmCheck}
    alt="在終端機執行 node -v 與 npm -v，兩行都顯示版本號"
    width={1180}
    lead="到 nodejs.org 裝好 LTS、重開終端機，再打這兩行——都跑出版本號就代表準備好了。"
  />
);

const InstallCodex: Page = () => (
  <Shell>
    <Eyebrow>第 3 站／安裝</Eyebrow>
    <Heading>先安裝 Codex CLI，也就是在終端機操作的版本</Heading>
    <div style={{ marginTop: 64, maxWidth: 1550 }}>
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
  <AssetPage
    eyebrow="啟動後，先確認兩個欄位"
    src={codexStart}
    alt="Codex CLI 啟動畫面，標出 model 與 directory 兩個欄位"
    width={1180}
    lead="Model（現在用哪個模型）、Directory（正在哪個資料夾工作）——先別急著交辦任務。"
  />
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
  <AssetPage
    eyebrow="同一個 Session 內，AI 可以沿用剛才的脈絡"
    src={sessionDiagram}
    alt="Session 像一張工作桌，保留這次對話的背景、問題、結果與後續追問"
    width={1400}
    lead="重要成果仍要存成檔案——換個 Session，才找得到。"
  />
);

const FirstPrompt: Page = () => (
  <AssetPage
    eyebrow="動手試 1／第一句話：先讀，不要改"
    src={codexFirstTask}
    alt="第一個任務：請 Codex 先閱讀練習資料夾並回報理解，先不要修改檔案"
    width={1180}
    lead="先請它「讀懂、不要動手」——看它讀了哪些檔案、理解對不對，再決定下一步。"
  />
);

const FirstOutput: Page = () => (
  <Shell>
    <Eyebrow>看結果，不只看回答</Eyebrow>
    <Heading>這一步，先檢查三件事</Heading>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 33, marginTop: 91 }}>
      <StepPanel number="看 1" title="有沒有進對資料夾？" detail="對照 Directory 與它讀的檔案" tint={surface} />
      <StepPanel number="看 2" title="能不能說出每個資料夾放什麼？" detail="notes/、outputs/、diagrams/" tint={sage} />
      <StepPanel number="看 3" title="這一步有沒有改檔案？" detail="應該沒有——只讀不改" tint={amberSoft} />
    </div>
    <p style={{ fontSize: 32, color: muted, marginTop: 72 }}>如果它理解錯了，補充背景再追問；不用急著讓它動手。</p>
  </Shell>
);

const StatusScreen: Page = () => (
  <AssetPage
    eyebrow="動手試 2／交辦前，先查環境"
    src={codexStatus}
    alt="Codex /status 的輸出，標出 Directory 與 Permissions 兩行"
    width={1180}
    lead="輸入 /status，先看兩行：Directory（它在哪裡工作）、Permissions（它能做哪些事）。"
  />
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
    <div style={{ marginTop: 92 }}><Lead>模型名稱可能不同；看得懂欄位就好，不用背。</Lead></div>
  </Shell>
);

const UsageToken: Page = () => (
  <AssetPage
    eyebrow="那畫面上的 Usage 和 Token 呢？"
    src={usageTokenDiagram}
    alt="Usage 像看整盒點心還剩多少，Token 像這次拿出的幾口"
    width={1400}
    lead="Token 是模型處理文字的片段，不完全等於字數。"
  />
);

const SaveToFiles: Page = () => (
  <Shell>
    <Eyebrow>從觀念走到實作</Eyebrow>
    <Heading>想讓下次接著用，就把成果寫進檔案</Heading>
    <div style={{ display: 'grid', gridTemplateColumns: '0.9fr 1.1fr', gap: 72, alignItems: 'center', marginTop: 72 }}>
      <div style={{ background: surface, borderLeft: `3px solid ${rule}`, padding: '36px 46px', fontFamily: mono, fontSize: 38, lineHeight: 1.9 }}>
        teacher-learning-lab/<br />
        <span style={{ color: faint }}>├ notes/</span><br />
        <span style={{ color: amber }}>├ outputs/</span><br />
        <span style={{ color: amber }}>└ diagrams/</span>
      </div>
      <div style={{ display: 'grid', gap: 26 }}>
        <div style={{ background: amberSoft, borderTop: `3px solid ${amber}`, padding: '26px 34px' }}>
          <SmallLabel>outputs/</SmallLabel>
          <div style={{ fontSize: 40, fontWeight: 600, marginTop: 12 }}>整理草稿</div>
          <div style={{ fontSize: 27, color: muted, marginTop: 8 }}>練習 2 的 ASCII 草稿存這裡</div>
        </div>
        <div style={{ background: amberSoft, borderTop: `3px solid ${amber}`, padding: '26px 34px' }}>
          <SmallLabel>diagrams/</SmallLabel>
          <div style={{ fontSize: 40, fontWeight: 600, marginTop: 12 }}>知識圖</div>
          <div style={{ fontSize: 27, color: muted, marginTop: 8 }}>練習 3 畫好的圖存這裡</div>
        </div>
      </div>
    </div>
    <p style={{ fontSize: 30, color: muted, marginTop: 52 }}>聊天裡的內容換個 Session 可能就不在了；存進資料夾，下次打開還找得到。</p>
  </Shell>
);

const PromptChoice: Page = () => (
  <Shell>
    <Eyebrow>現場二選一</Eyebrow>
    <Heading>哪句交代比較清楚？</Heading>
    <div style={{ display: 'grid', gridTemplateColumns: '0.82fr 1.18fr', gap: 57, marginTop: 70 }}>
      <div style={{ padding: '34px 39px', borderTop: `3px solid ${rule}`, background: surface, fontSize: 39, minHeight: 360, boxSizing: 'border-box' }}><SmallLabel>A</SmallLabel><p style={{ marginTop: 39 }}>幫我整理這個學習主題。</p></div>
      <div style={{ padding: '34px 39px', borderTop: `3px solid ${amber}`, background: amberSoft, fontSize: 35, lineHeight: 1.65, minHeight: 360, boxSizing: 'border-box' }}><SmallLabel>B</SmallLabel><p style={{ marginTop: 25 }}>只讀認知負荷理論筆記。<br />整理 1 個核心概念、1 個常見誤解、2 個檢查理解的問題。<br />先不要改檔案。</p></div>
    </div>
    <p style={{ fontSize: 30, color: muted, marginTop: 37 }}>B 說清楚了：看哪裡、要做什麼、先別做什麼。</p>
  </Shell>
);

const LabOverview: Page = () => (
  <Shell>
    <Eyebrow>不寫程式的練習場</Eyebrow>
    <Heading>六份教育筆記，挑一份來練習</Heading>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 35, marginTop: 71 }}>
      <StepPanel number="教育心理" title="認知負荷" detail="工作記憶與教學呈現" tint={sage} />
      <StepPanel number="教育心理" title="鷹架" detail="近側發展區與支持" tint={surface} />
      <StepPanel number="教學設計" title="布魯姆" detail="學習目標的層次" tint={amberSoft} />
      <StepPanel number="教育哲學" title="杜威" detail="經驗與學習" tint={surface} />
      <StepPanel number="教育社會" title="隱性課程" detail="沒寫出的學習規則" tint={amberSoft} />
      <StepPanel number="教育社會" title="文化資本" detail="背景與學習機會" tint={sage} />
    </div>
    <p style={{ fontSize: 32, color: muted, marginTop: 48 }}>選一份你熟悉的，或最想弄懂的；接下來的示範會用「認知負荷」。</p>
  </Shell>
);

const ScanTask: Page = () => (
  <Shell>
    <Eyebrow>練習 1 / 掃描</Eyebrow>
    <Heading>先請 Codex 看過六份筆記</Heading>
    <div style={{ display: 'flex', alignItems: 'center', gap: 48, marginTop: 84 }}>
      <div style={{ width: 510, fontSize: 44, lineHeight: 1.55 }}>六份原始筆記<br /><span style={{ color: muted }}>notes/</span></div><Arrow size={70} />
      <div style={{ background: surface, padding: '44px 54px', width: 880, boxSizing: 'border-box', fontSize: 39, lineHeight: 1.65 }}>請整理成一張表：<br />所屬領域、核心問題、教育情境、常見誤解。<br /><span style={{ color: amber }}>先不要修改檔案。</span></div>
    </div>
  </Shell>
);

const ScanOutput: Page = () => (
  <Shell>
    <Eyebrow>練習 1 / 檢查結果</Eyebrow>
    <Heading>看完這張表，你想追問哪一題？</Heading>
    <div style={{ display: 'inline-block', marginTop: 44, background: amberSoft, borderLeft: `5px solid ${amber}`, padding: '14px 26px', fontSize: 30, fontWeight: 600, color: amber }}>以下只有兩列示範，內容仍要回原文核對。</div>
    <div style={{ display: 'grid', gridTemplateColumns: '310px 280px 450px 1fr', borderTop: `3px solid ${rule}`, marginTop: 30, fontSize: 30, lineHeight: 1.35 }}>
      <div style={{ padding: '25px 20px', background: raised }}>筆記</div><div style={{ padding: '25px 20px', background: raised }}>領域</div><div style={{ padding: '25px 20px', background: raised }}>核心問題</div><div style={{ padding: '25px 20px', background: raised }}>追問</div>
      <div style={{ padding: '32px 20px', borderBottom: `1px solid ${rule}` }}>認知負荷理論</div><div style={{ padding: '32px 20px', borderBottom: `1px solid ${rule}` }}>教育心理</div><div style={{ padding: '32px 20px', borderBottom: `1px solid ${rule}` }}>如何減少干擾？</div><div style={{ padding: '32px 20px', borderBottom: `1px solid ${rule}` }}>原文怎麼說？</div>
      <div style={{ padding: '32px 20px', borderBottom: `1px solid ${rule}` }}>文化資本</div><div style={{ padding: '32px 20px', borderBottom: `1px solid ${rule}` }}>教育社會</div><div style={{ padding: '32px 20px', borderBottom: `1px solid ${rule}` }}>背景如何影響機會？</div><div style={{ padding: '32px 20px', borderBottom: `1px solid ${rule}` }}>有哪些例子？</div>
    </div>
  </Shell>
);

const AsciiTask: Page = () => (
  <Shell>
    <Eyebrow>練習 2 / 整理關係</Eyebrow>
    <Heading>先用文字排出關係，確認後再存</Heading>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 0.82fr', gap: 72, marginTop: 67 }}>
      <div>
        <div style={{ background: surface, padding: '37px 49px', fontFamily: mono, fontSize: 34, lineHeight: 1.7 }}>認知負荷理論<br />├ 工作記憶：容量有限<br />├ 外在負荷：呈現可調整<br />└ 教學做法：減少干擾</div>
        <p style={{ fontSize: 26, color: muted, marginTop: 18 }}>這就是 ASCII 草稿，不用先畫漂亮。</p>
      </div>
      <div style={{ paddingTop: 15, fontSize: 36, lineHeight: 1.65 }}>① 看概念有沒有漏<br />② 看箭頭關係對不對<br />③ 確認後才寫入 <span style={{ fontFamily: mono, fontSize: 31 }}>outputs/</span></div>
    </div>
  </Shell>
);

const CheckOriginal: Page = () => (
  <Shell>
    <Eyebrow>練習 2 / 不要跳過這一步</Eyebrow>
    <Heading>草稿看起來合理，也要回頭對照原文</Heading>
    <div style={{ display: 'flex', alignItems: 'center', gap: 65, marginTop: 75 }}><NoteSheet title="原始筆記" /><Arrow size={65} /><div style={{ width: 560, minHeight: 410, boxSizing: 'border-box', background: surface, padding: '36px 46px', fontSize: 34, lineHeight: 1.6 }}><SmallLabel>對照 ASCII 草稿</SmallLabel><div style={{ marginTop: 16 }}>概念對嗎？<br />關係對嗎？<br /><strong style={{ color: amber }}>原文哪一句支持這個關係？</strong><br />有沒有自己加上去的話？</div></div><Arrow size={65} /><div style={{ fontSize: 43, color: amber, lineHeight: 1.55 }}>確認後<br />再保存</div></div>
  </Shell>
);

const SkillSetup: Page = () => (
  <Shell>
    <Eyebrow>練習 3 / 裝上剛才說的 Skill</Eyebrow>
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
      <div style={{ fontSize: 36, lineHeight: 1.67 }}>請使用 <strong>diagram-design</strong>。<br />給 AI 兩份資料：<br /><strong>原始筆記</strong> ＋ <strong>ASCII 草稿</strong><br /><br />請它先選圖的形式、說明設計；<br />確認圖的形式與關係後，<br />再把圖檔存到 <span style={{ fontFamily: mono, fontSize: 32, color: amber }}>diagrams/</span>。</div>
      <ConceptMap />
    </div>
    <p style={{ fontSize: 30, color: muted, marginTop: 22 }}>想想看：第一次接觸這個理論的人，看得懂這張圖嗎？</p>
  </Shell>
);

const SkillMcp: Page = () => (
  <AssetPage
    eyebrow="安裝之前，先懂 Skill 是什麼"
    src={skillMcpDiagram}
    alt="Skill 像一張食譜給方法，MCP 像借書證把外部資料與工具接進來"
    width={1270}
    lead="今天先用 Skill；MCP 是延伸概念，之後需要連 Google Drive 等外部工具時再用。"
  />
);

const TeachingCheck: Page = () => (
  <Shell>
    <Eyebrow>把它帶回教學現場</Eyebrow>
    <Heading>你會把哪一步交給 AI？</Heading>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 32, marginTop: 100 }}>
      <StepPanel number="AI 可以先做" title="整理資料" detail="找共同概念與差異" tint={sage} />
      <StepPanel number="和 AI 一起調整" title="一起設計呈現" detail="讓知識圖更好懂" tint={surface} />
      <StepPanel number="一定要自己確認" title="回原文查證" detail="對照原文、看學生需求" tint={amberSoft} />
    </div>
    <div style={{ marginTop: 81 }}><Lead>和旁邊的人分享一個你想帶回去試的情境。</Lead></div>
  </Shell>
);

const ExitTicket: Page = () => (
  <Shell top={155}>
    <Eyebrow>一分鐘出口票</Eyebrow>
    <div style={{ marginTop: 52 }}><Title>AI 幫你做了什麼？<br />哪裡仍要你判斷？</Title></div>
    <div style={{ marginTop: 48, fontFamily: 'var(--osd-font-display)', fontSize: 56, lineHeight: 1.3, color: amber }}>明天你想先拿哪一份資料試試看？</div>
    <div style={{ display: 'flex', gap: 32, alignItems: 'center', marginTop: 56, fontSize: 33, color: muted }}>說清楚範圍 <Arrow size={35} /> 看草稿 <Arrow size={35} /> 回來源核對</div>
  </Shell>
);

export const meta: SlideMeta = {
  title: '認識 AI：讓它幫你讀懂教育筆記',
  createdAt: '2026-10-01T06:42:21.642Z',
  theme: 'thoughtstream',
};

export const notes: (string | undefined)[] = [
  '先問大家：上次請 AI 幫忙讀資料時，你拿到的是一段回答，還是一份能留下來的整理？今天要試試後者。',
  '（請先說出自己的名字。）我是中央大學碩士畢業，研究興趣在 NLP 和大型語言模型，目前在關貿網路做智慧客服，參與 EZ WAY、eHub、TTLL 等已上線的服務。我平常就把 AI 用在讀資料、整理知識和實際工作上，所以今天想帶大家用教育筆記實際練一次。',
  '先用四段路線帶大家看今天要去哪：認識 AI、開始用 Codex、整理教育筆記、最後核對與視覺化。記住第四段——「核對」是今天最重要的習慣。',
  '先把終點放在眼前：同一條知識關係，會從完整筆記，變成 ASCII 草稿，再變成知識圖。今天就是三步：先找概念、再確認關係、最後回原文核對。知道終點，待會每一步才有方向。',
  '那要用哪個工具來做？一句話：想討論用 ChatGPT，要把事做完用 Codex。你給 ChatGPT 筆記和問題，它回你一段可以繼續聊的回答；你給 Codex 一個資料夾，它整理完留下一個能打開檢查的檔案。兩者是情境不同，不是絕對分工。',
  '所以今天用 Codex，要做的是這四步：讀資料夾、先出草稿、回原文核對、存成檔案。這四步都在同一個資料夾裡完成。在開始之前，先看一個 AI 會出錯的例子。',
  '請大家先猜畫面裡的答案能不能信，再看驗算結果 8484。這是早期模型的案例，只用來提醒：語氣肯定，不代表答案正確——這也是剛才第三步「回原文核對」存在的原因。圖源：https://ithelp.ithome.com.tw/articles/10315994',
  '為什麼它會說得這麼肯定？簡單說，模型會根據前後文，預測接下來的文字，所以很擅長寫出「像答案」的句子。這是簡化說法，不是說它只會機械補字；工具和推理能力也會影響回答。但說得順，不代表它算過、查過。',
  '如果讓 AI 能用工具，它就能從「回答」變成「動手做事」。沿著圖走一次：你說目標、它先看資料、它動手做、它回報結果並等你檢查，最後由你決定下一步。問大家：哪一步最需要你親自把關？',
  '觀念講完了，看一下地圖：第一段「認識 AI」完成，現在進到第二段。接下來要把剛才的流程實際跑一遍——先讓 Codex 進到正確資料夾，再交辦第一個小任務。',
  '要開始動手了。打開 Codex 只要三站，先確認大家都找得到終端機，再一站一站帶著做。',
  '帶學生到 Node.js 官方下載頁選 LTS，安裝後重新開啟終端機，再打 node -v 和 npm -v。兩行都跑出版本號就可以往下走；數字不用跟畫面一樣。',
  'CLI 就是在終端機裡用打字操作的版本，不是另一個產品。這一頁只做安裝，等大家都完成，再一起進入練習資料夾。',
  '從課程專案根目錄執行 cd examples/teacher-learning-lab，再輸入 codex。第一次啟動依畫面登入。',
  '啟動之後先別急著交辦任務，先確認兩個欄位：Model 是現在用哪個模型，名稱不用背；Directory 一定要是 teacher-learning-lab，不是就先停下來調整。',
  '為什麼 Directory 這麼重要？因為 AI 會從這個資料夾看起。今天的原始筆記、文字草稿和知識圖各有位置，記住這三個資料夾，後面會一直用到。',
  '登入之後，你就坐進一個 Session。同一個 Session 內，AI 可以沿用剛才的脈絡，所以可以一題一題追問。但換一個 Session 就像換一張桌子，前面的對話不一定還在——重要成果要存成檔案。',
  '第一個任務：請它先讀、不要改。讓學生照畫面輸入這段指令，巡視時確認大家都在 teacher-learning-lab 資料夾。',
  '它回答之後，別急著看寫得好不好，先檢查三件事：有沒有進對資料夾、能不能說出每個資料夾放什麼、這一步有沒有改檔案。理解錯了就補背景再追問。',
  '交辦更多事之前，再查一次環境：輸入 /status。這張示意只留常用欄位，請學生找 Directory 和 Permissions——它在哪裡工作、能做哪些事。',
  '給大家 30 秒，自己在畫面上找這三個欄位。模型名稱不用背，看得懂欄位就好。',
  '畫面上還有 Usage 和額度。用一盒點心比喻：Usage 是整盒還剩多少，Token 是這次拿了幾口。Token 是模型處理文字的片段，不完全等於字數；讀的檔案越多，通常用得越多。不用講計費細節。',
  '把 Session 和額度的觀念收回到實作：想讓下次接著用，就把成果寫進檔案。接下來練習 2 的草稿存 outputs/，練習 3 的知識圖存 diagrams/。',
  '開始交辦之前，先練習「怎麼說清楚」。請大家選 A 或 B，說說 B 多交代了什麼：看哪份筆記、整理成什麼、先不要做什麼。範圍說清楚，它也比較不會做多餘的事。',
  '六份筆記都只是 Markdown 文件，不用寫程式。請大家選一份你熟悉的，或最想弄懂的；我的示範會用認知負荷理論。',
  '練習 1：先請 Codex 看過六份筆記，整理成一張表，而且先不要改檔案。學生可以追問哪兩份筆記適合比較。',
  '注意上面的標籤：這張表只是兩列示範。請大家挑一列，回原文查查它寫得對不對，再想想你要追問哪一題。',
  '練習 2：先用文字排出關係，這就是 ASCII 草稿，不用畫得漂亮。請學生看概念有沒有漏、關係對不對，確認後才寫入 outputs/。',
  '草稿看起來合理，也可能把關係排錯。請大家對每一條關係問一句：原文哪一句支持它？找不到根據的，就是 AI 自己加上去的。',
  '要把草稿畫成圖，會用到一個 Skill。Skill 像一張食譜，把「怎麼做」交給 AI；MCP 像借書證，讓它連到外部資料。今天只用 Skill，MCP 是延伸概念，等需要連 Google Drive 等外部工具時再用。',
  '練習 3：裝上剛才說的 diagram-design。在終端機依官方說明加入 marketplace 並安裝 plugin，重新開啟 Codex Session 後才進入下一步。官方來源：https://github.com/cathrynlavery/diagram-design',
  '請大家點名使用 diagram-design，提供原始筆記和核對過的 ASCII 草稿。先聽它說要畫哪種圖、為什麼，確認後再把圖檔存到 diagrams/。最後問：第一次接觸這個理論的人看得懂嗎？',
  '回到教學現場：哪些事 AI 可以先做、哪些和 AI 一起調整、哪些一定要自己確認？兩人一組分享一個可交辦的步驟，以及一個必須自己查證的步驟。',
  '最後一分鐘，請大家寫下三句話：AI 幫我做了什麼？哪一步還是要我自己判斷？以及——明天你想先拿哪一份資料試試看？',
];

export default [
  Cover, SpeakerIntro, Agenda, ResultFirst, ToolComparison, ToolRoles, WrongAnswer, TokenPrediction, AgentFlow,
  RunItNow, InstallRoadmap, CheckNode, InstallCodex, OpenProject, StartScreen, DirectoryScope, SessionDesk,
  FirstPrompt, FirstOutput, StatusScreen, StatusChallenge, UsageToken, SaveToFiles,
  PromptChoice, LabOverview, ScanTask, ScanOutput, AsciiTask, CheckOriginal,
  SkillMcp, SkillSetup, DiagramTask, TeachingCheck, ExitTicket,
] satisfies Page[];
