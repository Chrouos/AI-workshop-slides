import type { DesignSystem, Page, SlideMeta } from '@open-slide/core';
import { Step, Steps, useIsActivePage, useSlidePageNumber } from '@open-slide/core';
import toolComparison from './assets/chatgpt-vs-codex.png';
import wrongAnswer from './assets/llm-hallucination-calculation.png';
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

// ---------- Motion ----------
// One small vocabulary for the whole deck. Every reveal is click-driven through the
// framework's <Steps>/<Step>; the CSS below only adds a short rise to whatever a
// <Step> reveals, plus a few "build" details keyed off the framework's own
// data-osd-step attribute. Hostless renders (thumbnails, overview, presenter
// previews, PDF/HTML/PPTX export) show every step revealed, so nothing here can
// leave a page half-drawn. The only un-clicked motion is the chapter fill, and it
// runs only on the page the audience is watching (useIsActivePage).
const EASE_OUT = 'cubic-bezier(0.23, 1, 0.32, 1)';
const STEP_MS = 280; // a <Step> fading in (framework fade) + an 8px rise
const BUILD_MS = 320; // pieces inside a revealed step settling in order
const BUILD_GAP = 90; // stagger between those pieces
const BAR_MS = 600; // probability bars growing from zero
const FILL_MS = 480; // chapter marker filling left to right

const MOTION_CSS = `
.atl-deck [data-osd-step] > * { transition: transform ${STEP_MS}ms ${EASE_OUT}; }
.atl-deck [data-osd-step="pending"] > * { transform: translateY(8px); }
.atl-deck .atl-build { transition-property: opacity, transform; transition-duration: ${BUILD_MS}ms; transition-timing-function: ${EASE_OUT}; }
.atl-deck [data-osd-step="pending"] .atl-build { opacity: 0; transform: translateY(10px); }
.atl-deck .atl-bar { transform-origin: left center; transition: transform ${BAR_MS}ms ${EASE_OUT}; }
.atl-deck [data-osd-step="pending"] .atl-bar { transform: scaleX(0); }
@keyframes atl-fill { from { transform: scaleX(0); } to { transform: scaleX(1); } }
.atl-deck .atl-fill { transform-origin: left center; animation: atl-fill ${FILL_MS}ms ${EASE_OUT} 160ms both; }
@media (prefers-reduced-motion: reduce) {
  .atl-deck [data-osd-step] > *, .atl-deck [data-osd-step="pending"] > * { transform: none; transition: none; }
  .atl-deck .atl-build { transition: opacity 150ms ease; transition-delay: 0s !important; }
  .atl-deck [data-osd-step="pending"] .atl-build { transform: none; }
  .atl-deck .atl-bar, .atl-deck [data-osd-step="pending"] .atl-bar { transform: none; transition: none; }
  .atl-deck .atl-fill { animation: none; }
}
`;
const MOTION_STYLE_ID = 'osd-motion-ai-for-teacher-learners';
if (typeof document !== 'undefined') {
  let style = document.getElementById(MOTION_STYLE_ID) as HTMLStyleElement | null;
  if (!style) {
    style = document.createElement('style');
    style.id = MOTION_STYLE_ID;
    document.head.appendChild(style);
  }
  if (style.textContent !== MOTION_CSS) style.textContent = MOTION_CSS;
}

// Delay for the i-th piece of a build (0-based), after the step itself has started fading in.
const buildDelay = (i: number, base = 120) => ({ transitionDelay: `${base + i * BUILD_GAP}ms` });

const muted = '#57534E';
const faint = '#A8A29E';
const rule = '#D6D3D1';
const surface = '#F5F5F4';
const raised = '#EFEDEB';
const amber = '#9A6846';
const amberSoft = '#EFE2D4';
const sage = '#DCE5DC';
const okGreen = '#4F7A55';
const mono = '"Source Code Pro", Consolas, Menlo, monospace';
const display = 'var(--osd-font-display)';

// ---------- Frame ----------

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
      <span>AI 協作課｜教育筆記</span>
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

// The four legs of today's route (same as the Agenda). Pages inside a leg show where we are.
const CHAPTERS = ['認識 AI', '開始用 Codex', '整理教育筆記', '核對與視覺化'];
type Chapter = 1 | 2 | 3 | 4;

// One segment of the route bar. The current chapter's segment is amber; on the first
// page of a chapter it fills in left to right, once, on the live page only.
const RouteSeg = ({ color, fill = false }: { color: string; fill?: boolean }) => (
  <span style={{ width: 34, height: 6, background: fill ? rule : color, display: 'block' }}>
    {fill ? <span className="atl-fill" style={{ display: 'block', width: '100%', height: '100%', background: color }} /> : null}
  </span>
);

const RouteBar = ({ chapter, enter = false }: { chapter: Chapter; enter?: boolean }) => {
  const live = useIsActivePage();
  const fill = enter && live;
  return (
    <div style={{ position: 'absolute', top: 114, right: 144, display: 'flex', alignItems: 'center', gap: 8 }}>
      <RouteSeg color={chapter === 1 ? amber : faint} fill={fill && chapter === 1} />
      <RouteSeg color={chapter === 2 ? amber : chapter > 2 ? faint : rule} fill={fill && chapter === 2} />
      <RouteSeg color={chapter === 3 ? amber : chapter > 3 ? faint : rule} fill={fill && chapter === 3} />
      <RouteSeg color={chapter === 4 ? amber : rule} fill={fill && chapter === 4} />
      <span style={{ marginLeft: 12, fontSize: 22, fontWeight: 600, color: amber, letterSpacing: '0.04em' }}>
        {String(chapter).padStart(2, '0')}｜{CHAPTERS[chapter - 1]}
      </span>
    </div>
  );
};

const Shell = ({ children, top = 112, chapter, enterChapter = false }: { children: React.ReactNode; top?: number; chapter?: Chapter; enterChapter?: boolean }) => (
  <div className="atl-deck" style={{ width: '100%', height: '100%', boxSizing: 'border-box', position: 'relative', background: 'var(--osd-bg)', color: 'var(--osd-text)', fontFamily: 'var(--osd-font-body)', padding: `${top}px 144px 126px` }}>
    {chapter ? <RouteBar chapter={chapter} enter={enterChapter} /> : null}
    {children}
    <Footer />
  </div>
);

// A grid cell that carries the "→" in the gap to its left, so an arrow and the item it
// points to can be revealed together by one <Step>.
const ArrowCell = ({ gap, size = 48, children }: { gap: number; size?: number; children: React.ReactNode }) => (
  <div style={{ position: 'relative' }}>
    <div style={{ position: 'absolute', left: -gap, top: 0, bottom: 0, width: gap, display: 'grid', placeItems: 'center' }}><Arrow size={size} /></div>
    {children}
  </div>
);

const Heading = ({ children }: { children: React.ReactNode }) => (
  <h2 style={{ fontFamily: 'var(--osd-font-display)', fontSize: 76, fontWeight: 400, lineHeight: 1.2, letterSpacing: '-0.025em', margin: '40px 0 0', maxWidth: 1620 }}>
    {children}
  </h2>
);

const Lead = ({ children }: { children: React.ReactNode }) => (
  <p style={{ fontSize: 36, lineHeight: 1.5, color: muted, maxWidth: 1500, margin: 0 }}>{children}</p>
);

const Arrow = ({ size = 48 }: { size?: number }) => <span style={{ color: faint, fontSize: size, lineHeight: 1 }}>→</span>;

const SmallLabel = ({ children }: { children: React.ReactNode }) => (
  <span style={{ color: 'var(--osd-accent)', fontSize: 25, fontWeight: 600, letterSpacing: '0.07em' }}>{children}</span>
);

// ---------- Building blocks ----------

const StepPanel = ({ number, title, detail, tint = surface }: { number: string; title: string; detail: string; tint?: string }) => (
  <div style={{ background: tint, borderTop: `3px solid ${rule}`, padding: '32px 34px', minHeight: 192, boxSizing: 'border-box' }}>
    <SmallLabel>{number}</SmallLabel>
    <div style={{ fontSize: 40, fontWeight: 600, marginTop: 18, lineHeight: 1.3 }}>{title}</div>
    <div style={{ fontSize: 27, color: muted, lineHeight: 1.45, marginTop: 13 }}>{detail}</div>
  </div>
);

const ConceptMap = ({ compact = false }: { compact?: boolean }) => (
  <div style={{ width: compact ? 446 : 650, height: compact ? 380 : 485, boxSizing: 'border-box', background: '#FFFFFF', border: `1px solid ${rule}`, padding: compact ? 22 : 34, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
    <div style={{ color: 'var(--osd-accent)', fontSize: compact ? 22 : 25, fontWeight: 600, letterSpacing: '0.07em' }}>認知負荷理論 / 關係圖</div>
    <div className="atl-build" style={{ ...buildDelay(0), minHeight: compact ? 70 : 96, boxSizing: 'border-box', background: '#1C1917', color: '#FAFAF9', padding: compact ? '9px 18px' : '16px 25px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <div style={{ fontSize: compact ? 27 : 36, fontWeight: 600 }}>工作記憶容量有限</div>
    </div>
    <div className="atl-build" style={{ ...buildDelay(1), textAlign: 'center', color: amber, fontSize: compact ? 20 : 25, lineHeight: 1 }}>↓ 降低干擾</div>
    <div className="atl-build" style={{ ...buildDelay(2), minHeight: compact ? 70 : 96, boxSizing: 'border-box', background: amberSoft, borderLeft: `5px solid ${amber}`, padding: compact ? '9px 18px' : '16px 25px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <div style={{ fontSize: compact ? 26 : 34, fontWeight: 600 }}>減少不必要的外在負荷</div>
    </div>
    <div className="atl-build" style={{ ...buildDelay(3), textAlign: 'center', color: faint, fontSize: compact ? 20 : 25, lineHeight: 1 }}>↓ 教學做法</div>
    <div className="atl-build" style={{ ...buildDelay(4), display: 'grid', gridTemplateColumns: '1fr 1fr', gap: compact ? 11 : 16 }}>
      <div style={{ minHeight: compact ? 60 : 80, background: sage, display: 'grid', placeItems: 'center', fontSize: compact ? 24 : 30, fontWeight: 600 }}>拆開步驟</div>
      <div style={{ minHeight: compact ? 60 : 80, background: surface, display: 'grid', placeItems: 'center', fontSize: compact ? 24 : 30, fontWeight: 600 }}>標出關鍵資訊</div>
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

// A numbered dot. Used both on top of screenshots and beside the matching explanation.
const NumDot = ({ n, left, top }: { n: string; left?: number; top?: number }) => (
  <div style={{ position: left === undefined ? 'static' : 'absolute', left, top, width: 44, height: 44, borderRadius: 22, background: amber, color: '#FFFFFF', fontSize: 25, fontWeight: 600, display: 'grid', placeItems: 'center', flexShrink: 0, boxShadow: left === undefined ? 'none' : '0 0 0 4px rgba(250,250,249,0.9)' }}>{n}</div>
);

const Callout = ({ n, title, detail }: { n: string; title: string; detail: string }) => (
  <div style={{ display: 'grid', gridTemplateColumns: '44px 1fr', gap: 20, alignItems: 'start' }}>
    <NumDot n={n} />
    <div>
      <div style={{ fontSize: 32, fontWeight: 600, lineHeight: 1.3 }}>{title}</div>
      <div style={{ fontSize: 26, color: muted, marginTop: 6, lineHeight: 1.45 }}>{detail}</div>
    </div>
  </div>
);

const NumLine = ({ n, children, size = 34 }: { n: string; children: React.ReactNode; size?: number }) => (
  <div style={{ display: 'flex', gap: 18, alignItems: 'center', fontSize: size, lineHeight: 1.45 }}>
    <NumDot n={n} />
    <span>{children}</span>
  </div>
);

// Shows only the useful region of a 1800×1080 CLI capture, enlarged, so the text stays readable on a projector.
const Shot = ({ src, alt, crop, width, children }: { src: string; alt: string; crop: [number, number, number, number]; width: number; children?: React.ReactNode }) => {
  const [x, y, w, h] = crop;
  const s = width / w;
  return (
    <div style={{ position: 'relative', width, height: Math.round(h * s), overflow: 'hidden', background: '#1F2228', border: `1px solid ${rule}`, flexShrink: 0 }}>
      <img src={src} alt={alt} style={{ position: 'absolute', left: -x * s, top: -y * s, width: 1800 * s, height: 1080 * s, maxWidth: 'none' }} />
      {children}
    </div>
  );
};

// An outline drawn over one row of a screenshot.
const RowMark = ({ top, height = 32, width }: { top: number; height?: number; width: number }) => (
  <div style={{ position: 'absolute', left: 6, top, width, height, border: `3px solid #E9B650`, boxSizing: 'border-box' }} />
);

const Table = ({ children, marginTop = 0 }: { children: React.ReactNode; marginTop?: number }) => (
  <div style={{ borderTop: `3px solid ${rule}`, marginTop }}>{children}</div>
);

const TRow = ({ cells, cols, head = false, tint, size = 28 }: { cells: React.ReactNode[]; cols: string; head?: boolean; tint?: string; size?: number }) => (
  <div style={{ display: 'grid', gridTemplateColumns: cols, background: head ? raised : tint ?? 'transparent', borderBottom: `1px solid ${rule}`, fontSize: head ? 24 : size, fontWeight: head ? 600 : 400, color: head ? muted : 'var(--osd-text)', lineHeight: 1.45 }}>
    {cells.map((c, i) => (
      <div key={i} style={{ padding: head ? '16px 22px' : '18px 22px' }}>{c}</div>
    ))}
  </div>
);

const Chip = ({ children, tint = '#FFFFFF', size = 28 }: { children: React.ReactNode; tint?: string; size?: number }) => (
  <span style={{ display: 'inline-block', background: tint, border: `1px solid ${rule}`, padding: '10px 20px', fontSize: size, lineHeight: 1.3 }}>{children}</span>
);

// ---------- Opening: who, where, and whose story ----------

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

const SpeakerIntro: Page = () => (
  <Shell>
    <Eyebrow>講者介紹 / ABOUT ME</Eyebrow>
    <Heading>黃懷萱</Heading>
    <p style={{ fontSize: 34, lineHeight: 1.5, color: muted, margin: '22px 0 0', maxWidth: 1500 }}>AI 工程師，工作和日常生活都常找 AI 幫忙</p>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 220px 1fr', gap: 48, alignItems: 'start', marginTop: 64 }}>
      <div style={{ textAlign: 'center' }}>
        <SmallLabel>求學</SmallLabel>
        <div style={{ fontFamily: 'var(--osd-font-display)', fontSize: 68, lineHeight: 1.25, marginTop: 25 }}>中央大學碩士</div>
        <div style={{ fontSize: 31, color: muted, marginTop: 18 }}>NLP / LLM / RAG</div>
      </div>
      <div style={{ fontSize: 88, color: faint, textAlign: 'center', lineHeight: 1, marginTop: 60 }}>→</div>
      <div style={{ textAlign: 'center' }}>
        <SmallLabel>工作</SmallLabel>
        <div style={{ fontFamily: 'var(--osd-font-display)', fontSize: 68, lineHeight: 1.25, marginTop: 25 }}>關貿網路</div>
        <div style={{ fontSize: 31, color: muted, marginTop: 18 }}>AI Engineer · 智慧客服</div>
        <div style={{ fontSize: 24, color: faint, marginTop: 14 }}>已上線：EZ WAY · eHub · TTLL</div>
      </div>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 26, marginTop: 56 }}>
      <span style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--osd-accent)' }} />
      <span style={{ flex: 1, borderTop: `1px solid ${rule}` }} />
      <span style={{ color: muted, fontSize: 25, letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>從研究走到產品</span>
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
        ['01', '認識 AI', 'ChatGPT 和 Codex 差在哪、Agent 怎麼做事'],
        ['02', '開始用 Codex', '安裝、啟動，確認工作資料夾'],
        ['03', '整理教育筆記', '讓 AI 讀筆記、比較概念、出草稿'],
        ['04', '核對與視覺化', '回原文核對，再畫成知識圖'],
      ].map(([number, title, detail]) => (
        <div key={number} style={{ display: 'grid', gridTemplateColumns: '110px 500px 1fr', alignItems: 'center', minHeight: 126, borderBottom: `1px solid ${rule}` }}>
          <span style={{ fontSize: 25, color: 'var(--osd-accent)', fontWeight: 600 }}>{number}</span>
          <span style={{ fontFamily: 'var(--osd-font-display)', fontSize: 47, lineHeight: 1.2 }}>{title}</span>
          <span style={{ fontSize: 29, color: muted, lineHeight: 1.45 }}>{detail}</span>
        </div>
      ))}
    </div>
    <p style={{ fontSize: 26, color: faint, marginTop: 30 }}>右上角的進度條，會一直告訴你現在走到哪一段。</p>
  </Shell>
);

const Wonder = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: 'flex', gap: 22, alignItems: 'baseline', fontSize: 36, lineHeight: 1.45 }}>
    <span style={{ color: amber, fontFamily: display, fontSize: 46 }}>?</span>{children}
  </div>
);

const StoryStart: Page = () => (
  <Shell>
    <Eyebrow>故事從一份筆記開始</Eyebrow>
    <Heading>小安讀了三遍，還是串不起來</Heading>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center', marginTop: 64 }}>
      <div style={{ background: '#FFFFFF', border: `1px solid ${rule}`, padding: '34px 40px', transform: 'rotate(-1deg)' }}>
        <div style={{ fontFamily: mono, fontSize: 22, color: faint }}>notes/cognitive-load-theory.md</div>
        <div style={{ fontSize: 42, fontWeight: 600, marginTop: 14 }}>認知負荷理論</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginTop: 28 }}>
          <Chip tint={surface}>工作記憶</Chip>
          <Chip tint={surface}>長期記憶</Chip>
          <Chip tint={surface}>基模</Chip>
          <Chip tint={surface}>內在負荷</Chip>
          <Chip tint={surface}>外在負荷</Chip>
          <Chip tint={surface}>專家反轉效應</Chip>
        </div>
      </div>
      <div style={{ display: 'grid', gap: 26 }}>
        <SmallLabel>小安心裡的問題</SmallLabel>
        <Steps>
          <Wonder>這些名詞之間，是什麼關係？</Wonder>
          <Step duration={STEP_MS}><Wonder>哪些是重點，哪些只是例子？</Wonder></Step>
          <Step duration={STEP_MS}><Wonder>我整理的，到底對不對？</Wonder></Step>
        </Steps>
      </div>
    </div>
    <Steps>
      <Step duration={STEP_MS}><div style={{ marginTop: 64 }}><Lead>今天，我們陪小安用 AI，把這份筆記整理成一張能核對的知識圖。</Lead></div></Step>
    </Steps>
  </Shell>
);

const StageCard = ({ label, tint, accent = rule, children }: { label: string; tint: string; accent?: string; children: React.ReactNode }) => (
  <div style={{ background: tint, border: `1px solid ${rule}`, borderTop: `3px solid ${accent}`, padding: '26px 29px', height: 500, boxSizing: 'border-box' }}>
    <SmallLabel>{label}</SmallLabel>
    <div style={{ marginTop: 22 }}>{children}</div>
  </div>
);

const ResultFirst: Page = () => (
  <Shell>
    <Eyebrow>先看終點：小安最後會拿到什麼？</Eyebrow>
    <Heading>同一條關係，從筆記變成知識圖</Heading>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', columnGap: 56, alignItems: 'center', marginTop: 52 }}>
      <Steps>
        <StageCard label="1 · 原始筆記" tint="#FFFFFF">
          <div style={{ fontSize: 28, lineHeight: 1.6, color: muted }}>工作記憶容量有限。<br /><br />教材的呈現方式，<br />可能造成不必要的負擔。<br /><br />可以拆開步驟、標出關鍵資訊。</div>
        </StageCard>
        <Step duration={STEP_MS}>
          <ArrowCell gap={56}>
            <StageCard label="2 · ASCII 草稿" tint={amberSoft} accent={amber}>
              <div style={{ fontFamily: mono, fontSize: 27, lineHeight: 1.75 }}>
                <div className="atl-build" style={buildDelay(0)}>工作記憶：容量有限</div>
                <div className="atl-build" style={{ ...buildDelay(1), color: amber }}>　↓ 所以</div>
                <div className="atl-build" style={buildDelay(2)}>減少外在負荷</div>
                <div className="atl-build" style={{ ...buildDelay(3), color: amber }}>　↓ 例如</div>
                <div className="atl-build" style={buildDelay(4)}>拆開步驟<br />標出關鍵資訊</div>
              </div>
            </StageCard>
          </ArrowCell>
        </Step>
        <Step duration={STEP_MS}>
          <ArrowCell gap={56}>
            <StageCard label="3 · 知識圖" tint={surface}>
              <ConceptMap compact />
            </StageCard>
          </ArrowCell>
        </Step>
      </Steps>
    </div>
    <Steps>
      <Step duration={STEP_MS}><p style={{ fontSize: 32, color: muted, marginTop: 36 }}>今天的主線：讀筆記 → 出草稿 → 回原文核對 → 畫成知識圖。</p></Step>
    </Steps>
  </Shell>
);

// ---------- 01 認識 AI ----------

const ToolComparison: Page = () => (
  <Shell chapter={1} enterChapter>
    <Eyebrow>先選工具</Eyebrow>
    <Heading>討論想法用 ChatGPT，動手做事用 Codex</Heading>
    <div style={{ display: 'grid', gridTemplateColumns: '700px 1fr', gap: 56, alignItems: 'center', marginTop: 52 }}>
      <img
        src={toolComparison}
        alt="ChatGPT 與 Codex 典型使用情境的插圖"
        style={{ display: 'block', width: 700, height: 466, objectFit: 'contain', border: `1px solid ${rule}`, background: '#FFFFFF' }}
      />
      <Table>
        <TRow head cols="150px 1fr 1fr" cells={['', 'ChatGPT', 'Codex']} />
        <TRow cols="150px 1fr 1fr" cells={[<SmallLabel>像</SmallLabel>, '一起討論的朋友', '幫你把事做完的助理']} />
        <TRow cols="150px 1fr 1fr" cells={[<SmallLabel>你給它</SmallLabel>, '筆記、問題', '一個資料夾＋任務']} />
        <TRow cols="150px 1fr 1fr" tint={amberSoft} cells={[<SmallLabel>它給你</SmallLabel>, '一段能繼續聊的回答', <strong>能打開檢查的檔案</strong>]} />
        <TRow cols="150px 1fr 1fr" cells={[<SmallLabel>適合</SmallLabel>, '發想、解釋、問答', '讀檔、用工具、交成果']} />
      </Table>
    </div>
    <p style={{ fontSize: 30, color: muted, marginTop: 40 }}>ChatGPT 也能讀上傳的檔案；兩者差在使用情境，分工沒有那麼絕對。</p>
  </Shell>
);

const ToolRoles: Page = () => (
  <Shell chapter={1}>
    <Eyebrow>所以今天用 Codex，要做這件事</Eyebrow>
    <Heading>今天的主線，分四步走</Heading>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', columnGap: 56, alignItems: 'center', marginTop: 88 }}>
      <Steps>
        <StepPanel number="1 · notes/" title="讀筆記" detail="先讀懂原始筆記" tint={surface} />
        <Step duration={STEP_MS}><ArrowCell gap={56}><StepPanel number="2 · outputs/" title="出草稿" detail="用文字排出關係" tint={sage} /></ArrowCell></Step>
        <Step duration={STEP_MS}><ArrowCell gap={56}><StepPanel number="3 · notes/" title="回原文核對" detail="每條關係都有根據" tint={amberSoft} /></ArrowCell></Step>
        <Step duration={STEP_MS}><ArrowCell gap={56}><StepPanel number="4 · diagrams/" title="畫成知識圖" detail="存成能打開的檔案" tint={surface} /></ArrowCell></Step>
      </Steps>
    </div>
    <Steps>
      <Step duration={STEP_MS}>
        <div style={{ marginTop: 22, height: 30, borderLeft: `3px solid ${amber}`, borderRight: `3px solid ${amber}`, borderBottom: `3px solid ${amber}` }} />
        <div style={{ textAlign: 'center', marginTop: 16, fontSize: 30, color: amber }}><span style={{ fontFamily: mono }}>teacher-learning-lab/</span>　四步都在這個資料夾裡完成</div>
        <div style={{ marginTop: 64 }}><Lead>不過在動手之前，先看一個問題：AI 說的話，一定對嗎？</Lead></div>
      </Step>
    </Steps>
  </Shell>
);

const WrongAnswer: Page = () => (
  <Shell chapter={1}>
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

const NextWord = ({ word, pct, top = false, order = 0 }: { word: string; pct: number; top?: boolean; order?: number }) => (
  <div style={{ display: 'grid', gridTemplateColumns: '170px 1fr 90px', alignItems: 'center', gap: 20 }}>
    <span style={{ fontSize: 34, fontWeight: top ? 600 : 400, color: top ? 'var(--osd-text)' : muted }}>{word}</span>
    <div style={{ height: 30, background: surface }}><div className="atl-bar" style={{ ...buildDelay(order), width: `${pct}%`, height: '100%', background: top ? amber : rule }} /></div>
    <span style={{ fontSize: 26, color: top ? amber : faint, textAlign: 'right' }}>{pct}%</span>
  </div>
);

const TokenPrediction: Page = () => (
  <Shell chapter={1}>
    <Eyebrow>它為什麼能說得這麼肯定？</Eyebrow>
    <Heading>簡單說，模型會根據前後文，預測接下來的文字</Heading>
    <div style={{ display: 'grid', gridTemplateColumns: '600px 1fr', columnGap: 90, alignItems: 'center', marginTop: 64 }}>
      <Steps>
        <div style={{ background: surface, borderTop: `3px solid ${rule}`, padding: '34px 40px' }}>
          <SmallLabel>已經寫出的文字</SmallLabel>
          <div style={{ fontFamily: display, fontSize: 54, marginTop: 24, lineHeight: 1.3 }}>學生需要更<span style={{ display: 'inline-block', width: 130, borderBottom: `4px solid ${amber}`, marginLeft: 12 }}>&nbsp;</span></div>
        </div>
        <Step duration={STEP_MS}>
          <ArrowCell gap={90} size={56}>
            <div style={{ display: 'grid', gap: 18 }}>
              <SmallLabel>下一個詞的候選（示意）</SmallLabel>
              <NextWord word="清楚的" pct={62} top order={0} />
              <NextWord word="及時的" pct={21} order={1} />
              <NextWord word="多的" pct={9} order={2} />
              <NextWord word="有趣的" pct={4} order={3} />
            </div>
          </ArrowCell>
        </Step>
      </Steps>
    </div>
    <Steps>
      <Step duration={STEP_MS}>
        <div style={{ marginTop: 64, fontFamily: display, fontSize: 52 }}>很像正確答案 <span style={{ color: amber }}>≠</span> 真正知道答案</div>
        <p style={{ fontSize: 30, color: muted, marginTop: 16 }}>它挑最可能的詞，一個接一個寫下去，所以說得很順，卻不一定算過、查過。</p>
      </Step>
    </Steps>
  </Shell>
);

const Era = ({ step, title, detail, now = false }: { step: string; title: string; detail: string; now?: boolean }) => (
  <div>
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <span style={{ width: 22, height: 22, borderRadius: 11, background: now ? amber : '#FFFFFF', border: `3px solid ${now ? amber : faint}`, flexShrink: 0 }} />
      <span style={{ flex: 1, height: 3, background: rule, marginLeft: 8 }} />
    </div>
    <div style={{ marginTop: 28, paddingRight: 28 }}>
      <SmallLabel>{step}</SmallLabel>
      <div style={{ fontSize: 44, fontWeight: 600, marginTop: 12, color: now ? amber : 'var(--osd-text)' }}>{title}</div>
      <div style={{ fontSize: 28, color: muted, lineHeight: 1.5, marginTop: 12 }}>{detail}</div>
    </div>
  </div>
);

const LlmEvolution: Page = () => (
  <Shell chapter={1}>
    <Eyebrow>從「接話」到「做事」</Eyebrow>
    <Heading>AI 這幾年，一步一步學會做更多事</Heading>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', marginTop: 100 }}>
      <Steps>
        <Era step="01 · 2022 起" title="文字生成" detail="說得很流暢，但可能出現幻覺" />
        <Step duration={STEP_MS}><Era step="02" title="推理" detail="先把問題拆成步驟，再回答" /></Step>
        <Step duration={STEP_MS}><Era step="03" title="使用工具" detail="會搜尋、讀檔、計算，不靠猜" /></Step>
        <Step duration={STEP_MS}><Era step="04 · 今天的 Codex" title="執行任務" detail="理解目標、動手做、回報結果" now /></Step>
      </Steps>
    </div>
    <Steps>
      <Step duration={STEP_MS}><div style={{ marginTop: 84 }}><Lead>能用工具之後，AI 從「回答問題」走到「完成任務」，這就是 Agent。</Lead></div></Step>
    </Steps>
  </Shell>
);

const AgentStep = ({ n, who, title, detail, you = false }: { n: string; who: string; title: string; detail: React.ReactNode; you?: boolean }) => (
  <div style={{ background: you ? amberSoft : '#FFFFFF', border: `1px solid ${you ? amber : rule}`, borderTop: `3px solid ${you ? amber : rule}`, padding: '26px 24px', height: 250, boxSizing: 'border-box' }}>
    <SmallLabel>{n}　{who}</SmallLabel>
    <div style={{ fontSize: 34, fontWeight: 600, marginTop: 16 }}>{title}</div>
    <div style={{ fontSize: 25, color: muted, lineHeight: 1.5, marginTop: 12 }}>{detail}</div>
  </div>
);

const AgentFlow: Page = () => (
  <Shell chapter={1}>
    <Eyebrow>Agent 怎麼做事？</Eyebrow>
    <Heading>Agent 做事，像一個會回報的小幫手</Heading>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr', columnGap: 40, alignItems: 'center', marginTop: 72 }}>
      <Steps>
        <AgentStep n="01" who="你" title="說目標" detail="「整理這份筆記」" you />
        <Step duration={STEP_MS}><ArrowCell gap={40} size={36}><AgentStep n="02" who="AI" title="先看資料" detail="讀筆記與工作規則" /></ArrowCell></Step>
        <Step duration={STEP_MS}><ArrowCell gap={40} size={36}><AgentStep n="03" who="AI" title="動手做" detail="用搜尋、整理等工具" /></ArrowCell></Step>
        <Step duration={STEP_MS}><ArrowCell gap={40} size={36}><AgentStep n="04" who="AI" title="回報結果" detail={<>說明做了什麼，<br />等你檢查</>} /></ArrowCell></Step>
        <Step duration={STEP_MS}><ArrowCell gap={40} size={36}><AgentStep n="05" who="你" title="決定下一步" detail="繼續、修改或追問" you /></ArrowCell></Step>
      </Steps>
    </div>
    <Steps>
      <Step duration={STEP_MS}>
        <div style={{ margin: '0 147px', height: 44, borderLeft: `3px solid ${amber}`, borderRight: `3px solid ${amber}`, borderBottom: `3px solid ${amber}` }} />
        <div style={{ textAlign: 'center', marginTop: 14, fontSize: 28, color: amber }}>↺ 不滿意？回到第一步，把目標說得更清楚</div>
        <div style={{ marginTop: 52 }}><Lead>它先看資料再動手，做完停下來回報；下一步由你決定。</Lead></div>
      </Step>
    </Steps>
  </Shell>
);

// ---------- 02 開始用 Codex ----------

const RouteStop = ({ number, label, detail, state }: { number: string; label: string; detail: string; state: 'done' | 'now' | 'next' }) => {
  const live = useIsActivePage();
  return (
  <div style={{ position: 'relative', background: state === 'now' ? amberSoft : state === 'done' ? surface : '#FFFFFF', border: state === 'next' ? `1px dashed ${rule}` : 'none', borderTop: `3px solid ${rule}`, padding: '30px 30px', minHeight: 250, boxSizing: 'border-box' }}>
    {state === 'now' ? <span className={live ? 'atl-fill' : undefined} style={{ position: 'absolute', left: 0, right: 0, top: -3, height: 3, background: amber }} /> : null}
    <SmallLabel>{number}　{state === 'done' ? '已完成 ✓' : state === 'now' ? '你在這裡' : '接下來'}</SmallLabel>
    <div style={{ fontSize: 40, fontWeight: 600, marginTop: 18, color: state === 'next' ? faint : 'var(--osd-text)' }}>{label}</div>
    <div style={{ fontSize: 26, color: state === 'next' ? faint : muted, lineHeight: 1.5, marginTop: 14 }}>{detail}</div>
  </div>
  );
};

const RunItNow: Page = () => (
  <Shell>
    <Eyebrow>從觀念到動手</Eyebrow>
    <Heading>接下來，把這個流程實際跑一遍</Heading>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 20, marginTop: 96 }}>
      <RouteStop number="01" label="認識 AI" detail="工具差異、幻覺、Agent" state="done" />
      <RouteStop number="02" label="開始用 Codex" detail="安裝、啟動、暖身練習" state="now" />
      <RouteStop number="03" label="整理教育筆記" detail="讀六份筆記、出草稿" state="next" />
      <RouteStop number="04" label="核對與視覺化" detail="回原文核對、畫成知識圖" state="next" />
    </div>
    <div style={{ marginTop: 88 }}><Lead>先讓 Codex 進到正確資料夾，再交辦第一個小任務。</Lead></div>
  </Shell>
);

const InstallRoadmap: Page = () => (
  <Shell chapter={2} enterChapter>
    <Eyebrow>現在開始動手</Eyebrow>
    <Heading>跟著三站，打開 Codex</Heading>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 34, marginTop: 80 }}>
      <StepPanel number="第 1 站" title="安裝 Node.js" detail="到官方網站選 LTS" tint={surface} />
      <StepPanel number="第 2 站" title="確認安裝完成" detail="node -v、npm -v" tint={sage} />
      <StepPanel number="第 3 站" title="安裝並啟動" detail="進入練習資料夾後登入" tint={amberSoft} />
    </div>
    <div style={{ marginTop: 56, background: '#FFFFFF', border: `1px solid ${rule}`, borderLeft: `5px solid ${amber}`, padding: '30px 40px' }}>
      <SmallLabel>為什麼要先裝 Node.js？</SmallLabel>
      <div style={{ fontSize: 32, lineHeight: 1.55, marginTop: 14 }}>Codex CLI 要用 <strong>npm</strong> 安裝，而 npm 是跟著 <strong>Node.js</strong> 一起來的安裝工具。<br />先打好地基，才裝得上 Codex。</div>
    </div>
  </Shell>
);

const CheckNode: Page = () => (
  <Shell chapter={2}>
    <Eyebrow>第 1、2 站｜安裝 Node.js，再確認</Eyebrow>
    <Heading>兩行都跑出版本號，就能往下走</Heading>
    <div style={{ display: 'grid', gridTemplateColumns: '900px 1fr', gap: 56, alignItems: 'start', marginTop: 48 }}>
      <Shot src={nodeNpmCheck} alt="在終端機執行 node -v 與 npm -v，兩行都顯示版本號" crop={[110, 160, 1140, 720]} width={900}>
        <NumDot n="1" left={176} top={112} />
        <NumDot n="2" left={150} top={303} />
      </Shot>
      <div>
        <SmallLabel>看到什麼，就這樣做</SmallLabel>
        <Table marginTop={18}>
          <TRow head cols="1fr 1fr" cells={['畫面出現', '下一步']} />
          <TRow cols="1fr 1fr" tint={sage} cells={['1、2 都有版本號', '✓ 往下一站']} />
          <TRow cols="1fr 1fr" cells={['找不到指令', '重開終端機，再打一次']} />
          <TRow cols="1fr 1fr" cells={['重開後還是不行', '重裝一次 Node.js']} />
        </Table>
        <p style={{ fontSize: 26, color: muted, marginTop: 26 }}>版本號的數字不用跟畫面一樣。</p>
      </div>
    </div>
  </Shell>
);

const CmdSeg = ({ n, color, children }: { n: string; color: string; children: React.ReactNode }) => (
  <span style={{ position: 'relative', color, borderBottom: `4px solid ${color}`, paddingBottom: 6 }}>
    {children}
    <span style={{ position: 'absolute', left: 0, right: 0, top: '100%', marginTop: 14, textAlign: 'center', fontFamily: 'var(--osd-font-body)', fontSize: 26, fontWeight: 600, color }}>{n}</span>
  </span>
);

const CmdNote = ({ n, title, detail }: { n: string; title: string; detail: string }) => (
  <div style={{ borderTop: `3px solid ${rule}`, paddingTop: 18 }}>
    <NumDot n={n} />
    <div style={{ fontSize: 34, fontWeight: 600, marginTop: 14 }}>{title}</div>
    <div style={{ fontSize: 26, color: muted, marginTop: 8 }}>{detail}</div>
  </div>
);

const InstallCodex: Page = () => (
  <Shell chapter={2}>
    <Eyebrow>第 3 站｜安裝</Eyebrow>
    <Heading>安裝 Codex CLI：終端機版的 Codex</Heading>
    <div style={{ marginTop: 56, background: '#1F2226', padding: '36px 48px 76px', fontFamily: mono, fontSize: 50, color: '#F5F5F4', whiteSpace: 'pre' }}>
      <span style={{ color: '#8DD4A0' }}>$ </span><CmdSeg n="1" color="#F5F5F4">npm install</CmdSeg> <CmdSeg n="2" color="#E9B650">-g</CmdSeg> <CmdSeg n="3" color="#9CC3F0">@openai/codex</CmdSeg><CmdSeg n="4" color="#AFC7B1">@latest</CmdSeg>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 28, marginTop: 44 }}>
      <CmdNote n="1" title="安裝" detail="用 npm 來裝東西" />
      <CmdNote n="2" title="裝在整台電腦" detail="哪個資料夾都能用" />
      <CmdNote n="3" title="要裝的東西" detail="OpenAI 的 Codex" />
      <CmdNote n="4" title="最新版" detail="裝目前最新的版本" />
    </div>
  </Shell>
);

const OpenProject: Page = () => (
  <Shell chapter={2}>
    <Eyebrow>第 3 站｜啟動</Eyebrow>
    <Heading>進入練習資料夾，再啟動 Codex</Heading>
    <div style={{ display: 'grid', gridTemplateColumns: '600px 1fr', gap: 56, alignItems: 'start', marginTop: 64 }}>
      <div style={{ background: surface, padding: '36px 40px', fontSize: 31, lineHeight: 1.75, whiteSpace: 'nowrap' }}>
        <SmallLabel>先找到課程專案</SmallLabel>
        <div style={{ marginTop: 28 }}>AI-workshop-slides/<br />└─ examples/<br />　 └─ <strong>teacher-learning-lab/</strong></div>
      </div>
      <div>
        <Terminal title="在專案根目錄的終端機輸入" width={976}>
          <div style={{ fontFamily: mono, fontSize: 34, lineHeight: 1.75 }}><span style={{ color: '#8DD4A0' }}>$</span> cd examples/teacher-learning-lab <span style={{ color: '#E9B650', fontFamily: 'var(--osd-font-body)', fontSize: 26 }}>← 1</span><br /><span style={{ color: '#8DD4A0' }}>$</span> codex <span style={{ color: '#E9B650', fontFamily: 'var(--osd-font-body)', fontSize: 26 }}>← 2</span></div>
        </Terminal>
        <div style={{ display: 'grid', gap: 24, marginTop: 36 }}>
          <Callout n="1" title="cd ＝ 走進這個資料夾" detail="Codex 會從你所在的資料夾開始工作" />
          <Callout n="2" title="codex ＝ 叫醒 Codex" detail="第一次啟動，依畫面登入 ChatGPT 帳號" />
        </div>
      </div>
    </div>
  </Shell>
);

const StartScreen: Page = () => (
  <Shell chapter={2}>
    <Eyebrow>看懂啟動畫面</Eyebrow>
    <Heading>啟動後，先確認兩個欄位</Heading>
    <div style={{ display: 'grid', gridTemplateColumns: '900px 1fr', gap: 56, alignItems: 'start', marginTop: 48 }}>
      <Shot src={codexStart} alt="Codex CLI 啟動畫面，標出 model 與 directory 兩個欄位" crop={[110, 160, 960, 610]} width={900}>
        <NumDot n="1" left={800} top={292} />
        <NumDot n="2" left={800} top={340} />
      </Shot>
      <div style={{ display: 'grid', gap: 36, paddingTop: 40 }}>
        <Callout n="1" title="Model：現在用哪個模型" detail="名稱會隨版本改變，看得懂就好，不用背" />
        <Callout n="2" title="Directory：在哪個資料夾工作" detail="要是 teacher-learning-lab；不是就先停下來" />
        <div style={{ background: amberSoft, borderLeft: `5px solid ${amber}`, padding: '20px 26px', fontSize: 30, fontWeight: 600, color: amber }}>先別急著交辦任務。</div>
      </div>
    </div>
  </Shell>
);

const DirectoryScope: Page = () => (
  <Shell chapter={2}>
    <Eyebrow>Directory 為什麼重要？</Eyebrow>
    <Heading>AI 從這個資料夾開始工作</Heading>
    <div style={{ display: 'grid', gridTemplateColumns: '0.95fr 1.05fr', gap: 80, marginTop: 56 }}>
      <div style={{ background: surface, borderLeft: `3px solid ${rule}`, padding: '33px 44px', fontFamily: mono, fontSize: 36, lineHeight: 1.9 }}>
        teacher-learning-lab/<br />
        ├ notes/<br />
        ├ outputs/<br />
        └ diagrams/
      </div>
      <div style={{ paddingTop: 37 }}><div style={{ fontSize: 46 }}>notes/ <Arrow size={40} /> 原始筆記</div><div style={{ fontSize: 46, marginTop: 40 }}>outputs/ <Arrow size={40} /> 整理草稿</div><div style={{ fontSize: 46, marginTop: 40 }}>diagrams/ <Arrow size={40} /> 知識圖</div></div>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28, marginTop: 52 }}>
      <div style={{ background: sage, padding: '24px 32px' }}><div style={{ fontSize: 32, fontWeight: 600 }}>✓ 走對資料夾</div><div style={{ fontSize: 27, color: muted, marginTop: 8 }}>讀得到筆記，草稿和圖也會存在這裡</div></div>
      <div style={{ background: amberSoft, padding: '24px 32px' }}><div style={{ fontSize: 32, fontWeight: 600 }}>✗ 走錯資料夾</div><div style={{ fontSize: 27, color: muted, marginTop: 8 }}>可能讀到不相關的檔案，也可能存錯地方</div></div>
    </div>
  </Shell>
);

const DeskNote = ({ children }: { children: React.ReactNode }) => (
  <div style={{ background: '#FFFFFF', border: `1px solid ${rule}`, padding: '18px 22px', fontSize: 30, fontWeight: 600 }}>{children}</div>
);

const SessionDesk: Page = () => (
  <Shell chapter={2}>
    <Eyebrow>Session 是什麼？</Eyebrow>
    <Heading>同一個 Session 內，AI 可以沿用剛才的脈絡</Heading>
    <div style={{ display: 'grid', gridTemplateColumns: 'calc((100% - 150px) * 1.3 / 2.3) 1fr', alignItems: 'stretch', marginTop: 64 }}>
      <Steps>
      <div style={{ background: amberSoft, border: `1px solid ${amber}`, padding: '30px 36px' }}>
        <SmallLabel>這個 Session ＝ 這次的工作桌</SmallLabel>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 24 }}>
          <DeskNote>你的背景</DeskNote>
          <DeskNote>你的問題</DeskNote>
          <DeskNote>AI 的回答</DeskNote>
          <DeskNote>你的追問</DeskNote>
        </div>
        <div style={{ fontSize: 26, color: muted, marginTop: 22 }}>都在同一張桌上，所以可以一題接一題問</div>
      </div>
      <Step duration={STEP_MS}>
        <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', height: '100%' }}>
          <div style={{ display: 'grid', placeItems: 'center', textAlign: 'center' }}><div><div style={{ fontSize: 24, color: muted, marginBottom: 8 }}>換 Session</div><Arrow size={60} /></div></div>
          <div style={{ border: `2px dashed ${rule}`, padding: '30px 36px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <SmallLabel>新的 Session ＝ 換一張桌子</SmallLabel>
            <div style={{ fontSize: 34, marginTop: 20, lineHeight: 1.5 }}>桌上空空的，<br />前面的對話不一定還在</div>
          </div>
        </div>
      </Step>
      </Steps>
    </div>
    <Steps>
      <Step duration={STEP_MS}><div style={{ marginTop: 56 }}><Lead>所以重要的成果要存成檔案，換了 Session 也找得到。</Lead></div></Step>
    </Steps>
  </Shell>
);

const FirstPrompt: Page = () => (
  <Shell chapter={2}>
    <Eyebrow>暖身 1｜第一個任務</Eyebrow>
    <Heading>第一句話：請它先讀，不要改</Heading>
    <div style={{ display: 'grid', gridTemplateColumns: '780px 1fr', gap: 64, alignItems: 'start', marginTop: 48 }}>
      <Shot src={codexFirstTask} alt="第一個任務：請 Codex 先閱讀練習資料夾並回報理解，先不要修改檔案" crop={[110, 230, 780, 590]} width={780}>
        <NumDot n="1" left={700} top={61} />
        <NumDot n="2" left={700} top={155} />
        <NumDot n="3" left={700} top={314} />
        <NumDot n="4" left={700} top={531} />
      </Shot>
      <div>
        <div style={{ display: 'grid', gap: 26 }}>
          <Callout n="1" title="先說「不要修改」" detail="這一步只觀察，不讓它動檔案" />
          <Callout n="2" title="問三個具體問題" detail="用途、每個檔案放什麼、從哪開始" />
          <Callout n="3" title="看它讀了哪些檔案" detail="Reading… 就是它正在讀的檔案" />
          <Callout n="4" title="請它先給草稿" detail="確認之後，才讓它寫入" />
        </div>
        <div style={{ marginTop: 32, background: surface, padding: '20px 26px', fontSize: 28 }}>它的順序：<strong>讀取 → 理解 → 回報 → 等你</strong></div>
      </div>
    </div>
  </Shell>
);

const PromptChip = ({ children }: { children: React.ReactNode }) => (
  <div style={{ background: surface, borderLeft: `5px solid ${amber}`, padding: '22px 28px', fontSize: 30 }}>{children}</div>
);

const FirstOutput: Page = () => (
  <Shell chapter={2}>
    <Eyebrow>暖身 1｜看結果，不只看回答</Eyebrow>
    <Heading>它回答之後，先檢查三件事</Heading>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 33, marginTop: 72 }}>
      <Steps>
        <StepPanel number="看 1" title="有沒有進對資料夾？" detail="對照 Directory 與它讀的檔案" tint={surface} />
        <Step duration={STEP_MS}><StepPanel number="看 2" title="檔案用途說對了嗎？" detail="notes/、outputs/、diagrams/" tint={sage} /></Step>
        <Step duration={STEP_MS}><StepPanel number="看 3" title="這一步有沒有改檔案？" detail="應該沒有，這步只讀不改" tint={amberSoft} /></Step>
      </Steps>
    </div>
    <Steps>
      <Step duration={STEP_MS}>
        <div style={{ marginTop: 56 }}>
          <SmallLabel>答錯了？這樣追問</SmallLabel>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginTop: 18 }}>
            <PromptChip>「你剛才讀了哪些檔案？請列出檔名。」</PromptChip>
            <PromptChip>「notes/ 裡有幾份筆記？各是什麼主題？」</PromptChip>
          </div>
        </div>
      </Step>
    </Steps>
  </Shell>
);

const StatusScreen: Page = () => (
  <Shell chapter={2}>
    <Eyebrow>暖身 2｜交辦前，先查環境</Eyebrow>
    <Heading>輸入 /status，看懂它的工作環境</Heading>
    <div style={{ display: 'grid', gridTemplateColumns: '760px 1fr', gap: 56, alignItems: 'start', marginTop: 48 }}>
      <div>
        <Shot src={codexStatus} alt="Codex /status 的輸出，標出 Directory 與 Permissions 兩行" crop={[130, 330, 905, 480]} width={760}>
          <RowMark top={88} width={748} />
          <RowMark top={121} width={748} />
        </Shot>
        <p style={{ fontSize: 22, color: faint, marginTop: 14 }}>教材範例｜帳號與即時額度已隱藏</p>
      </div>
      <Table>
        <TRow head cols="240px 1fr" cells={['欄位', '白話來說']} />
        <TRow cols="240px 1fr" cells={[<span style={{ fontFamily: mono, fontSize: 25 }}>Model</span>, '現在用哪個模型']} />
        <TRow cols="240px 1fr" tint={amberSoft} cells={[<span style={{ fontFamily: mono, fontSize: 25 }}>Directory</span>, <strong>它在哪個資料夾工作</strong>]} />
        <TRow cols="240px 1fr" tint={amberSoft} cells={[<span style={{ fontFamily: mono, fontSize: 25 }}>Permissions</span>, <strong>它能做哪些事、要不要先問你</strong>]} />
        <TRow cols="240px 1fr" cells={[<span style={{ fontFamily: mono, fontSize: 25 }}>Agents.md</span>, '專案有沒有額外的工作規則']} />
        <TRow cols="240px 1fr" cells={[<span style={{ fontFamily: mono, fontSize: 25 }}>Session</span>, '這次協作的編號']} />
        <TRow cols="240px 1fr" cells={[<span style={{ fontFamily: mono, fontSize: 25 }}>5h · Weekly</span>, '還剩多少額度（等一下說明）']} />
      </Table>
    </div>
  </Shell>
);

const StatusChallenge: Page = () => (
  <Shell chapter={2}>
    <Eyebrow>暖身 2｜換你找找看</Eyebrow>
    <Heading>30 秒，在畫面上找到這三格</Heading>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 30, marginTop: 105 }}>
      <StepPanel number="?" title="它在哪裡？" detail="找 Directory" tint={surface} />
      <StepPanel number="?" title="它能做什麼？" detail="找 Permissions" tint={sage} />
      <StepPanel number="?" title="用哪個模型？" detail="找 Model" tint={amberSoft} />
    </div>
    <div style={{ marginTop: 92 }}><Lead>之後每次交辦任務前，都先看一眼 Directory 和 Permissions。</Lead></div>
  </Shell>
);

const TokenBlock = ({ w, dark = false }: { w: number; dark?: boolean }) => (
  <span style={{ display: 'inline-block', width: w, height: 36, background: dark ? muted : faint }} />
);

const UsageToken: Page = () => (
  <Shell chapter={2}>
    <Eyebrow>那畫面最下面的額度呢？</Eyebrow>
    <Heading>Usage 是總額度，Token 是這次用量</Heading>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 56, marginTop: 60 }}>
      <div style={{ background: amberSoft, borderTop: `3px solid ${amber}`, padding: '34px 40px' }}>
        <SmallLabel>像：一整盒點心</SmallLabel>
        <div style={{ fontSize: 44, fontWeight: 600, marginTop: 14 }}>Usage：整盒還剩多少？</div>
        <div style={{ height: 36, background: '#FFFFFF', border: `1px solid ${rule}`, marginTop: 36 }}><div style={{ width: '63%', height: '100%', background: amber }} /></div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, fontSize: 24 }}><span style={{ color: amber }}>已使用</span><span style={{ color: faint }}>還剩下</span></div>
        <p style={{ fontSize: 28, color: muted, margin: '26px 0 0' }}>看的範圍：整個帳號／方案</p>
      </div>
      <div style={{ background: '#FFFFFF', border: `1px solid ${rule}`, borderTop: `3px solid ${rule}`, padding: '34px 40px' }}>
        <SmallLabel>像：這次拿出的幾口</SmallLabel>
        <div style={{ fontSize: 44, fontWeight: 600, marginTop: 14 }}>Token：這次用了多少？</div>
        <div style={{ display: 'flex', gap: 10, marginTop: 36 }}>
          <TokenBlock w={70} dark /><TokenBlock w={44} /><TokenBlock w={96} dark /><TokenBlock w={52} /><TokenBlock w={80} dark /><TokenBlock w={40} /><TokenBlock w={66} dark />
        </div>
        <div style={{ marginTop: 12, fontSize: 24, color: faint }}>一小塊 ＝ 文字的一小段，不完全等於字數</div>
        <p style={{ fontSize: 28, color: muted, margin: '26px 0 0' }}>看的範圍：這一次工作</p>
      </div>
    </div>
    <div style={{ marginTop: 52 }}><Lead>讀的檔案越多、對話越長，Token 通常用得越多。</Lead></div>
  </Shell>
);

const TokenTips: Page = () => (
  <Shell chapter={2}>
    <Eyebrow>怎麼讓 Token 花在刀口上？</Eyebrow>
    <Heading>說清楚範圍，就能少用 Token</Heading>
    <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginTop: 52, fontSize: 30 }}>
      <Chip tint={surface}>你的 Prompt</Chip><span style={{ color: faint }}>＋</span><Chip tint={surface}>讀到的檔案</Chip><span style={{ color: faint }}>＋</span><Chip tint={surface}>前面的對話</Chip><Arrow size={40} /><strong>都會變成 Token</strong>
    </div>
    <Table marginTop={44}>
      <TRow head cols="1fr 1fr" cells={['這樣做', '為什麼能省']} />
      <TRow cols="1fr 1fr" tint={amberSoft} cells={[<strong>說清楚要看哪一份檔案</strong>, '不用把整個資料夾讀一遍']} />
      <TRow cols="1fr 1fr" cells={['一次只做一件事', '對話不會越拉越長']} />
      <TRow cols="1fr 1fr" cells={['重複的流程交給 Skill', '不用每次重新說明方法']} />
      <TRow cols="1fr 1fr" cells={['任務太長，整理後換 Session', '不必帶著一大串舊對話']} />
    </Table>
    <p style={{ fontSize: 30, color: muted, marginTop: 36 }}>第一條最重要，下一頁就來練習。</p>
  </Shell>
);

const Tagged = ({ tag, children }: { tag: string; children: React.ReactNode }) => (
  <div style={{ display: 'grid', gridTemplateColumns: '96px 1fr', gap: 18, alignItems: 'baseline' }}>
    <span style={{ background: amber, color: '#FFFFFF', fontSize: 22, fontWeight: 600, textAlign: 'center', padding: '6px 0' }}>{tag}</span>
    <span style={{ fontSize: 32, lineHeight: 1.5 }}>{children}</span>
  </div>
);

const PromptChoice: Page = () => (
  <Shell chapter={2}>
    <Eyebrow>現場二選一</Eyebrow>
    <Heading>哪句交代比較清楚？</Heading>
    <div style={{ display: 'grid', gridTemplateColumns: '0.62fr 1.38fr', gap: 48, marginTop: 64 }}>
      <div style={{ padding: '34px 38px', borderTop: `3px solid ${rule}`, background: surface, minHeight: 360, boxSizing: 'border-box' }}>
        <SmallLabel>A</SmallLabel>
        <p style={{ fontSize: 36, marginTop: 36 }}>幫我整理這個學習主題。</p>
        <Steps>
          <Step duration={STEP_MS}><p style={{ fontSize: 26, color: faint, marginTop: 40 }}>看哪裡？做成什麼？都沒說。</p></Step>
        </Steps>
      </div>
      <div style={{ padding: '34px 38px', borderTop: `3px solid ${amber}`, background: amberSoft, boxSizing: 'border-box' }}>
        <SmallLabel>B</SmallLabel>
        <div style={{ display: 'grid', gap: 22, marginTop: 26 }}>
          <Tagged tag="範圍">只讀 <span style={{ fontFamily: mono, fontSize: 28 }}>notes/cognitive-load-theory.md</span></Tagged>
          <Tagged tag="產出">整理 1 個核心概念、1 個常見誤解、2 個檢查理解的問題</Tagged>
          <Tagged tag="限制">先不要改檔案，也不要加入原筆記沒有的事實</Tagged>
        </div>
      </div>
    </div>
    <Steps>
      <Step duration={STEP_MS}><p style={{ fontSize: 32, color: muted, marginTop: 48 }}>B 把範圍、產出、限制都講清楚了。</p></Step>
    </Steps>
  </Shell>
);

const Glossary: Page = () => (
  <Shell chapter={2}>
    <Eyebrow>第二段整理</Eyebrow>
    <Heading>五個名詞，一張表記住</Heading>
    <Table marginTop={56}>
      <TRow head cols="240px 1fr 1fr" cells={['名詞', '白話', '比喻']} />
      <TRow cols="240px 1fr 1fr" cells={[<strong>Directory</strong>, 'AI 從哪個資料夾開始工作', '工作桌擺在哪個房間']} />
      <TRow cols="240px 1fr 1fr" cells={[<strong>Session</strong>, '這次一起工作的過程', '一張工作桌']} />
      <TRow cols="240px 1fr 1fr" cells={[<strong>Status</strong>, '現在的環境設定', '系統資訊頁']} />
      <TRow cols="240px 1fr 1fr" cells={[<strong>Usage</strong>, '帳號還能用多少', '整盒點心還剩多少']} />
      <TRow cols="240px 1fr 1fr" cells={[<strong>Token</strong>, '模型處理文字的片段', '這次拿了幾口']} />
    </Table>
    <p style={{ fontSize: 32, color: muted, marginTop: 44 }}>環境準備好了。接下來，把這些用在小安真正的筆記上。</p>
  </Shell>
);

// ---------- 03 整理教育筆記 ----------

const SaveToFiles: Page = () => (
  <Shell chapter={3} enterChapter>
    <Eyebrow>開始整理之前</Eyebrow>
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
          <div style={{ fontSize: 40, fontWeight: 600, marginTop: 12 }}>草稿</div>
          <div style={{ fontSize: 27, color: muted, marginTop: 8 }}>練習 2 的 ASCII 草稿存這裡</div>
        </div>
        <div style={{ background: amberSoft, borderTop: `3px solid ${amber}`, padding: '26px 34px' }}>
          <SmallLabel>diagrams/</SmallLabel>
          <div style={{ fontSize: 40, fontWeight: 600, marginTop: 12 }}>知識圖</div>
          <div style={{ fontSize: 27, color: muted, marginTop: 8 }}>練習 3 畫好的圖存這裡</div>
        </div>
      </div>
    </div>
    <p style={{ fontSize: 30, color: muted, marginTop: 52 }}>小安的草稿和知識圖都存在這兩個資料夾，換了 Session 也找得到。</p>
  </Shell>
);

const LabOverview: Page = () => (
  <Shell chapter={3}>
    <Eyebrow>不寫程式的練習場</Eyebrow>
    <Heading>六份教育筆記，挑一份來練習</Heading>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 35, marginTop: 71 }}>
      <StepPanel number="教育心理" title="認知負荷" detail="工作記憶與教學呈現" tint={amberSoft} />
      <StepPanel number="教育心理" title="鷹架" detail="近側發展區與支持" tint={surface} />
      <StepPanel number="教學設計" title="布魯姆" detail="學習目標的層次" tint={surface} />
      <StepPanel number="教育哲學" title="杜威" detail="經驗與學習" tint={surface} />
      <StepPanel number="教育社會" title="隱性課程" detail="沒寫出的學習規則" tint={surface} />
      <StepPanel number="教育社會" title="文化資本" detail="背景與學習機會" tint={surface} />
    </div>
    <p style={{ fontSize: 32, color: muted, marginTop: 48 }}>選一份你熟悉的，或最想弄懂的；示範跟著小安用「認知負荷」。</p>
  </Shell>
);

const ScanTask: Page = () => (
  <Shell chapter={3}>
    <Eyebrow>練習 1｜讀筆記</Eyebrow>
    <Heading>先請 Codex 看過六份筆記</Heading>
    <div style={{ display: 'grid', gridTemplateColumns: '400px 96px 1fr', alignItems: 'center', marginTop: 64 }}>
      <div style={{ background: surface, padding: '30px 34px' }}>
        <SmallLabel>notes/ 裡的六份筆記</SmallLabel>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 20 }}>
          <Chip size={26}>認知負荷</Chip><Chip size={26}>鷹架</Chip><Chip size={26}>布魯姆</Chip>
          <Chip size={26}>杜威</Chip><Chip size={26}>隱性課程</Chip><Chip size={26}>文化資本</Chip>
        </div>
      </div>
      <div style={{ textAlign: 'center' }}><Arrow size={60} /></div>
      <div style={{ background: '#FFFFFF', border: `1px solid ${rule}`, borderLeft: `5px solid ${amber}`, padding: '32px 40px' }}>
        <SmallLabel>你輸入的 Prompt</SmallLabel>
        <div style={{ fontSize: 32, lineHeight: 1.6, marginTop: 14 }}>請閱讀 notes/ 裡的六份筆記，整理成一張表：</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 18 }}>
          <Chip tint={surface} size={26}>筆記名稱</Chip><Chip tint={surface} size={26}>所屬領域</Chip><Chip tint={surface} size={26}>核心問題</Chip>
          <Chip tint={surface} size={26}>3 個專有名詞</Chip><Chip tint={surface} size={26}>教育情境</Chip><Chip tint={surface} size={26}>常見誤解</Chip>
        </div>
        <div style={{ fontSize: 30, fontWeight: 600, color: amber, marginTop: 22 }}>先不要修改任何檔案。</div>
      </div>
    </div>
    <p style={{ fontSize: 30, color: muted, marginTop: 52 }}>它會交回一張表，下一頁來看長什麼樣子。</p>
  </Shell>
);

const ScanOutput: Page = () => (
  <Shell chapter={3}>
    <Eyebrow>練習 1｜檢查結果</Eyebrow>
    <Heading>看完這張表，你想追問哪一題？</Heading>
    <div style={{ display: 'inline-block', marginTop: 44, background: amberSoft, borderLeft: `5px solid ${amber}`, padding: '14px 26px', fontSize: 30, fontWeight: 600, color: amber }}>以下只有兩列示範，內容仍要回原文核對。</div>
    <Table marginTop={30}>
      <TRow head cols="230px 460px 430px 1fr" cells={['筆記', '核心問題', '3 個專有名詞', '常見誤解']} />
      <TRow cols="230px 460px 430px 1fr" cells={[<strong>認知負荷理論</strong>, '工作記憶能承受多少複雜度？', '工作記憶、外在負荷、基模', '「教材越簡單越好」']} />
      <TRow cols="230px 460px 430px 1fr" cells={[<strong>文化資本</strong>, '學校獎勵哪些文化形式？', '慣習、具身化狀態、文化再製', '「只有昂貴物品才算」']} />
    </Table>
    <p style={{ fontSize: 30, color: muted, marginTop: 44 }}>挑一列回原文查，再追問，例如：「原文怎麼定義外在負荷？」</p>
  </Shell>
);

const AsciiTask: Page = () => (
  <Shell chapter={3}>
    <Eyebrow>練習 2｜出草稿</Eyebrow>
    <Heading>先用文字排出關係，確認後再存</Heading>
    <div style={{ display: 'grid', gridTemplateColumns: '1.15fr 0.85fr', gap: 64, marginTop: 60 }}>
      <div>
        <div style={{ background: surface, padding: '34px 46px', fontFamily: mono, fontSize: 29, lineHeight: 1.75, whiteSpace: 'pre' }}>{`認知負荷理論
├─ 中心問題：工作記憶能承受多少？
├─ 外在負荷：教材呈現造成的多餘負擔
│   └─ 做法：拆開步驟、標出關鍵資訊
└─ 常見誤解：「教材越簡單越好」`}</div>
        <p style={{ fontSize: 26, color: muted, marginTop: 18 }}>這就是 ASCII 草稿：用純文字排關係，不用先畫漂亮。</p>
      </div>
      <div style={{ paddingTop: 15 }}>
        <SmallLabel>存之前先看</SmallLabel>
        <div style={{ display: 'grid', gap: 22, marginTop: 22 }}>
          <NumLine n="1">概念有沒有漏</NumLine>
          <NumLine n="2">箭頭關係對不對</NumLine>
          <NumLine n="3">核對完才寫入 <span style={{ fontFamily: mono, fontSize: 30 }}>outputs/</span></NumLine>
        </div>
      </div>
    </div>
    <div style={{ marginTop: 52 }}><Lead>存檔之前，先做最重要的一步：回原文核對。</Lead></div>
  </Shell>
);

// ---------- 04 核對與視覺化 ----------

// A row of the verification table: the draft's claim stays up; the source sentence and
// the verdict arrive together on one click, the verdict landing a beat later.
const CheckRow = ({ claim, source, verdict, tint }: { claim: React.ReactNode; source: React.ReactNode; verdict: React.ReactNode; tint?: string }) => (
  <div style={{ display: 'grid', gridTemplateColumns: '540px 1fr', background: tint ?? 'transparent', borderBottom: `1px solid ${rule}`, fontSize: 28, lineHeight: 1.45 }}>
    <Steps>
      <div style={{ padding: '18px 22px' }}>{claim}</div>
      <Step duration={STEP_MS}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 160px', height: '100%' }}>
          <div style={{ padding: '18px 22px' }}>{source}</div>
          <div className="atl-build" style={{ ...buildDelay(2), padding: '18px 22px' }}>{verdict}</div>
        </div>
      </Step>
    </Steps>
  </div>
);

const CheckOriginal: Page = () => (
  <Shell chapter={4} enterChapter>
    <Eyebrow>練習 2｜回原文核對</Eyebrow>
    <Heading>草稿看起來合理，也要回頭對照原文</Heading>
    <Table marginTop={72}>
      <TRow head cols="540px 1fr 160px" cells={['草稿裡的關係', '原文哪一句支持它？', '結果']} />
      <CheckRow claim="外在負荷 → 拆開步驟、標出關鍵資訊" source="「教學時可以先降低不必要的外在負荷，例如拆開步驟、標出關鍵資訊」" verdict={<strong style={{ color: okGreen }}>✓ 保留</strong>} />
      <CheckRow claim="降低負荷 → 所以教材越簡單越好" source="原文反而寫：「認知負荷理論不是『教材越簡單越好』」" verdict={<strong style={{ color: amber }}>✗ 刪掉</strong>} tint={amberSoft} />
    </Table>
    <Steps>
      <Step duration={STEP_MS}><div style={{ marginTop: 64 }}><Lead>每條關係都問一句：原文哪一句支持它？找不到，就是 AI 自己加的。</Lead></div></Step>
    </Steps>
  </Shell>
);

const SkillMcp: Page = () => (
  <Shell chapter={4}>
    <Eyebrow>要畫圖之前，先認識 Skill</Eyebrow>
    <Heading>Skill 像一張食譜：把「怎麼做」交給 AI</Heading>
    <div style={{ display: 'grid', gridTemplateColumns: '1.45fr 1fr', gap: 48, marginTop: 60 }}>
      <div style={{ background: amberSoft, borderTop: `3px solid ${amber}`, padding: '34px 40px' }}>
        <SmallLabel>今天會用｜Skill ＝ 食譜</SmallLabel>
        <div style={{ display: 'grid', gap: 16, marginTop: 22 }}>
          <NumLine n="1" size={31}>把做法寫成 SKILL.md，放進工具裡</NumLine>
          <NumLine n="2" size={31}>AI 先讀這份做法</NumLine>
          <NumLine n="3" size={31}>照著做，每次的結果比較一致</NumLine>
        </div>
        <div style={{ borderTop: `1px solid ${rule}`, marginTop: 26, paddingTop: 22, fontSize: 28 }}><strong>本課例：</strong>用 diagram-design 把筆記畫成知識圖</div>
      </div>
      <div style={{ border: `2px dashed ${rule}`, padding: '34px 40px' }}>
        <SmallLabel>延伸｜MCP ＝ 借書證</SmallLabel>
        <div style={{ fontSize: 32, lineHeight: 1.5, marginTop: 22 }}>讓 AI 連到外部資料，<br />例如 Google Drive、GitHub</div>
        <p style={{ fontSize: 28, color: muted, marginTop: 28 }}>今天不需要：筆記已經在資料夾裡。</p>
      </div>
    </div>
    <div style={{ marginTop: 52 }}><Lead>接下來，就把 diagram-design 這張食譜裝起來。</Lead></div>
  </Shell>
);

const SkillSetup: Page = () => (
  <Shell chapter={4}>
    <Eyebrow>練習 3｜裝上剛才說的 Skill</Eyebrow>
    <Heading>安裝 diagram-design，再開一個新 Session</Heading>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 480px', gap: 56, alignItems: 'center', marginTop: 64 }}>
      <Terminal title="在終端機依序輸入" width={1096}>
        <div style={{ fontFamily: mono, fontSize: 25, lineHeight: 2.2, whiteSpace: 'nowrap' }}><span style={{ color: '#8DD4A0' }}>$</span> codex plugin marketplace add cathrynlavery/diagram-design<br /><span style={{ color: '#8DD4A0' }}>$</span> codex plugin add diagram-design@diagram-design</div>
      </Terminal>
      <div style={{ background: sage, padding: '34px 40px', fontSize: 31, lineHeight: 1.7 }}>1. 加入 Skill 來源<br />2. 安裝 diagram-design<br />3. 開一個新 Session</div>
    </div>
    <div style={{ marginTop: 56 }}><Lead>為什麼要開新的？新的 Session 才讀得到剛裝好的食譜。</Lead></div>
    <p style={{ fontSize: 24, color: faint, marginTop: 24 }}>來源：diagram-design 官方安裝說明（github.com/cathrynlavery/diagram-design）</p>
  </Shell>
);

const DiagramTask: Page = () => (
  <Shell chapter={4}>
    <Eyebrow>練習 3｜畫成知識圖</Eyebrow>
    <Heading>把核對過的關係，畫成知識圖</Heading>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 650px', gap: 67, alignItems: 'center', marginTop: 51 }}>
      <div style={{ fontSize: 36, lineHeight: 1.67 }}>請使用 <strong>diagram-design</strong>。<br />給 AI 兩份資料：<br /><strong>原始筆記</strong> ＋ <strong>核對過的 ASCII 草稿</strong><br /><br />請它先選圖的形式、說明設計；<br />確認圖的形式與關係後，<br />再把圖檔存到 <span style={{ fontFamily: mono, fontSize: 32, color: amber }}>diagrams/</span>。</div>
      <Steps>
        <Step duration={STEP_MS}><ConceptMap /></Step>
      </Steps>
    </div>
    <Steps>
      <Step duration={STEP_MS}><p style={{ fontSize: 30, color: muted, marginTop: 22 }}>想想看：第一次接觸這個理論的人，看得懂這張圖嗎？</p></Step>
    </Steps>
  </Shell>
);

// ---------- Closing: back to the story, then to the classroom ----------

const OutputFile = ({ path, title, detail }: { path: string; title: string; detail: string }) => (
  <div style={{ background: '#FFFFFF', border: `1px solid ${rule}`, borderTop: `3px solid ${amber}`, padding: '32px 32px' }}>
    <div style={{ fontFamily: mono, fontSize: 22, color: faint }}>{path}</div>
    <div style={{ fontSize: 44, fontWeight: 600, marginTop: 14 }}>{title}</div>
    <div style={{ fontSize: 28, color: muted, marginTop: 10 }}>{detail}</div>
  </div>
);

const Reflect = ({ children }: { children: React.ReactNode }) => (
  <div style={{ background: surface, padding: '26px 32px', fontSize: 32 }}>{children}</div>
);

const Reflection: Page = () => (
  <Shell>
    <Eyebrow>回到小安</Eyebrow>
    <Heading>小安的筆記，變成了三份成果</Heading>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', columnGap: 56, alignItems: 'center', marginTop: 72 }}>
      <Steps>
        <OutputFile path="notes/cognitive-load-theory.md" title="原始筆記" detail="一個字都沒被改" />
        <Step duration={STEP_MS}><ArrowCell gap={56}><OutputFile path="outputs/…-ascii.md" title="ASCII 草稿" detail="每條關係都核對過" /></ArrowCell></Step>
        <Step duration={STEP_MS}><ArrowCell gap={56}><OutputFile path="diagrams/" title="知識圖" detail="沒背景的人也看得懂" /></ArrowCell></Step>
      </Steps>
    </div>
    <Steps>
      <Step duration={STEP_MS}>
        <div style={{ marginTop: 72 }}><SmallLabel>交出去之前，問自己四個問題</SmallLabel></div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 18 }}>
          <div className="atl-build" style={buildDelay(0)}><Reflect>我真的懂了，還是只是看過？</Reflect></div>
          <div className="atl-build" style={buildDelay(1)}><Reflect>草稿有沒有保留原文的重點？</Reflect></div>
          <div className="atl-build" style={buildDelay(2)}><Reflect>沒有背景的人，看得懂這張圖嗎？</Reflect></div>
          <div className="atl-build" style={buildDelay(3)}><Reflect>哪裡還要回課本或問老師確認？</Reflect></div>
        </div>
      </Step>
    </Steps>
  </Shell>
);

const TeachingCheck: Page = () => (
  <Shell>
    <Eyebrow>把它帶回教學現場</Eyebrow>
    <Heading>你會把哪一步交給 AI？</Heading>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 32, marginTop: 100 }}>
      <Steps>
        <StepPanel number="AI 可以先做" title="整理資料" detail="例：把六份筆記整理成比較表" tint={sage} />
        <Step duration={STEP_MS}><StepPanel number="和 AI 一起調整" title="設計呈現方式" detail="例：調整知識圖的版面" tint={surface} /></Step>
        <Step duration={STEP_MS}><StepPanel number="一定要自己確認" title="回原文查證" detail="例：核對引用、判斷學生程度" tint={amberSoft} /></Step>
      </Steps>
    </div>
    <div style={{ marginTop: 81 }}><Lead>和旁邊的人分享一個你想帶回去試的情境。</Lead></div>
  </Shell>
);

const ExitTicket: Page = () => (
  <Shell top={155}>
    <Eyebrow>一分鐘出口票</Eyebrow>
    <div style={{ marginTop: 52 }}><Title>AI 幫你做了什麼？<br />哪裡仍要你判斷？</Title></div>
    <Steps>
      <Step duration={STEP_MS}><div style={{ marginTop: 48, fontFamily: 'var(--osd-font-display)', fontSize: 56, lineHeight: 1.3, color: amber }}>明天你想先拿哪一份資料試試看？</div></Step>
      <Step duration={STEP_MS}>
        <div style={{ display: 'flex', gap: 32, alignItems: 'center', marginTop: 56, fontSize: 33, color: muted }}>
          <span className="atl-build" style={buildDelay(0)}>讀筆記</span>
          <span className="atl-build" style={{ ...buildDelay(1), display: 'flex' }}><Arrow size={35} /></span>
          <span className="atl-build" style={buildDelay(2)}>出草稿</span>
          <span className="atl-build" style={{ ...buildDelay(3), display: 'flex' }}><Arrow size={35} /></span>
          <span className="atl-build" style={buildDelay(4)}>回原文核對</span>
          <span className="atl-build" style={{ ...buildDelay(5), display: 'flex' }}><Arrow size={35} /></span>
          <span className="atl-build" style={buildDelay(6)}>畫成知識圖</span>
        </div>
      </Step>
    </Steps>
  </Shell>
);

export const meta: SlideMeta = {
  title: '認識 AI：讓它幫你讀懂教育筆記',
  createdAt: '2026-10-01T06:42:21.642Z',
  theme: 'thoughtstream',
};

export const notes: (string | undefined)[] = [
  '先問大家：上次請 AI 幫忙讀資料，你拿到的是一段回答，還是一份能留下來的整理？今天要試試後者。',
  '我是黃懷萱，中央大學碩士，研究 NLP、LLM 和 RAG；現在在關貿網路做智慧客服，參與 EZ WAY、eHub、TTLL 等已上線服務。平常工作和生活都常找 AI 幫忙，今天就帶大家拿教育筆記實際練一次。',
  '今天分四段走：認識 AI、開始用 Codex、整理教育筆記、核對與視覺化。右上角的小進度條會一直提醒大家現在在哪一段。',
  '先認識今天的主角：小安是師培生，手上有一份認知負荷理論的筆記。名詞一大堆，讀了三遍還是說不出它們的關係，（點兩下：另外兩個問題）也不知道自己整理得對不對。可以問問台下：有沒有人也有這種經驗？（點一下：今天要陪小安做的事）',
  '先看終點。同一條關係：工作記憶容量有限，所以要減少外在負荷，例如拆開步驟。這條關係會從原始筆記（點一下）變成 ASCII 草稿，（點一下）再變成知識圖。（點一下）今天的主線就是：讀筆記、出草稿、回原文核對、畫成知識圖。',
  '要做這件事，用哪個工具？一句話：想討論用 ChatGPT，要把事做完用 Codex。重點看黃色那一列：ChatGPT 給你一段回答，Codex 給你一個能打開檢查的檔案。兩者差在使用情境，分工沒有那麼絕對。',
  '所以今天用 Codex 走這條主線：讀筆記、（點一下）出草稿、（點一下）回原文核對、（點一下）畫成知識圖，（點一下）四步都在 teacher-learning-lab 這個資料夾裡完成。不過動手之前，先看一個問題。',
  '請大家先猜畫面裡的答案能不能信，再看驗算結果 8484。這是早期模型的案例，只用來提醒：語氣肯定，不代表答案正確。這也是主線裡要「回原文核對」的原因。圖源：https://ithelp.ithome.com.tw/articles/10315994',
  '為什麼會這樣？模型會根據前後文預測下一個詞。「學生需要更___」，（點一下）它看「清楚的」機率最高就選它，再接著預測下一個。數字只是示意。這是簡化的說法，模型不只是機械地補字；（點一下）但要記住：很像正確答案，不等於真的知道答案。',
  '不過 AI 這幾年進步很多：從只會生成文字，（點一下）到會先推理、（點一下）會用工具，（點一下）現在能自己執行任務。（點一下）能用工具，就是從一般的 LLM 走到 Agent 的關鍵。',
  '那 Agent 怎麼做事？沿著圖走一次：你說目標，（點一下）它先讀筆記和工作規則、（點一下）動手做、（點一下）回報結果，（點一下）最後由你決定下一步。（點一下）不滿意就回到第一步，把目標說清楚。問大家：這五步裡，哪一步最需要你親自把關？',
  '看一下地圖：第一段「認識 AI」完成了，現在進入第二段。接下來要把剛才的流程實際跑一遍：先讓 Codex 進到正確資料夾，再交辦第一個小任務。',
  '打開 Codex 只要三站。先說為什麼要裝 Node.js：Codex 要用 npm 安裝，npm 是跟著 Node.js 一起來的，所以要先打好地基。先確認大家都找得到終端機。',
  '到 Node.js 官網選 LTS 安裝，重開終端機，打 node -v 和 npm -v。圖上 ① ② 兩個位置都有版本號就往下走；找不到指令，先重開終端機；還不行，就重裝一次 Node.js。',
  '這行指令拆開來看：① npm install 是安裝；② -g 是裝在整台電腦；③ @openai/codex 是要裝的東西；④ @latest 是最新版。CLI 是在終端機裡打字操作的版本，跟 Codex 是同一個工具。',
  '從課程專案根目錄執行 cd examples/teacher-learning-lab，走進練習資料夾，再輸入 codex 叫醒它。第一次啟動依畫面登入。',
  '啟動之後先別急著交辦，看兩個欄位：① Model 是現在用的模型，名稱會變，不用背；② Directory 一定要是 teacher-learning-lab，不是就先停下來調整。',
  '為什麼 Directory 這麼重要？因為 Codex 從這個資料夾開始工作。走對資料夾，讀得到筆記、成果也存在對的地方；走錯了，可能讀到不相關的檔案。',
  '登入之後就坐進一個 Session。同一個 Session 內，背景、問題、回答、追問都在同一張桌上，所以可以一題接一題問。（點一下）換一個 Session 就像換一張桌子，前面的對話不一定還在，（點一下）所以重要成果要存成檔案。',
  '暖身 1：第一句話請它先讀、不要改。看圖上四個編號：先說不要修改、問三個具體問題、看它讀了哪些檔案、請它先給草稿。它的順序是讀取、理解、回報、等你。巡視時確認大家都在 teacher-learning-lab。',
  '它回答之後，別急著看寫得好不好，先檢查三件事：有沒有進對資料夾、（點一下）每個檔案放什麼有沒有說對、（點一下）這一步有沒有改檔案。（點一下）答錯了就用下面這兩句追問。',
  '暖身 2：交辦更多事之前，輸入 /status 查環境。框起來的兩行最重要：Directory 是它在哪工作，Permissions 是它能做哪些事、要不要先問你。右邊表格是每個欄位的白話。',
  '給大家 30 秒，自己在畫面上找這三格：它在哪裡、能做什麼、用哪個模型。模型名稱不用背，看得懂就好。之後每次交辦任務前，都先看一眼 Directory 和 Permissions。',
  '畫面最下面還有額度。用一盒點心比喻：Usage 是整盒還剩多少，Token 是這次拿了幾口。Token 是模型處理文字的片段，不完全等於字數；讀的檔案越多、對話越長，用得越多。不用講計費細節。',
  '怎麼省？你的 Prompt、它讀到的檔案、前面的對話，全部都會變成 Token。最有效的是第一條：說清楚要看哪一份檔案，它就不用把整個資料夾讀一遍。',
  '請大家選 A 或 B。（大家選完再點一下：A 少了什麼）B 多交代了範圍、產出和限制：只看哪個檔案、要交出什麼、什麼不能做。（點一下）範圍說清楚，它比較不會做多餘的事，也比較省 Token。',
  '第二段收尾，用一張表記住五個名詞。Directory 是工作桌擺在哪個房間、Session 是工作桌、Status 是系統資訊、Usage 是整盒點心、Token 是這次的幾口。環境準備好了，接下來回到小安的筆記。',
  '進入第三段，開始整理小安的筆記。先把剛才的 Session 觀念收回來：聊天內容換了 Session 可能就不在，想讓下次接著用，就把成果寫進檔案。練習 2 的草稿存 outputs/，練習 3 的知識圖存 diagrams/。',
  '六份筆記都只是 Markdown 文件，不用寫程式。請大家選一份你熟悉的，或最想弄懂的；示範會跟著小安用認知負荷理論。',
  '練習 1：先請 Codex 看過六份筆記，整理成一張表，欄位就是右邊這六個，而且先不要改檔案。',
  '它交回的表大概長這樣，注意上面的標籤：這只是兩列示範。請大家挑一列回原文查，再追問一題，例如「原文怎麼定義外在負荷？」',
  '練習 2：小安只挑認知負荷這一份，請 Codex 用 ASCII，也就是純文字的樹狀結構，排出中心問題、概念、做法和常見誤解。檢查概念有沒有漏、關係對不對。存進 outputs/ 之前，還要先回原文核對。',
  '進入第四段，這是今天最重要的一步。（點一下：第一列有原文支持，保留）看第二列：草稿寫「降低負荷，所以教材越簡單越好」，聽起來很合理，（點一下）但原文明白寫著「不是教材越簡單越好」，所以要刪掉。（點一下）每條關係都問一句：原文哪一句支持它？核對完，再把草稿存進 outputs/。',
  '要把核對過的草稿畫成圖，會用到 Skill。Skill 像一張食譜，把「怎麼做」交給 AI；MCP 像借書證，讓它連到外部資料。今天只用 Skill，MCP 是延伸概念，等需要連 Google Drive 等外部工具時再用。',
  '練習 3：裝上 diagram-design 這張食譜。依官方說明加入 marketplace 並安裝 plugin，再開一個新的 Codex Session，新的 Session 才讀得到它。官方來源：https://github.com/cathrynlavery/diagram-design',
  '請大家點名使用 diagram-design，給它原始筆記和核對過的 ASCII 草稿。先聽它說要畫哪種圖、為什麼，確認後再把圖檔存到 diagrams/。（點一下：知識圖）最後問自己：（點一下）第一次接觸這個理論的人看得懂嗎？',
  '回到小安：一開始讀三遍還串不起來的筆記，現在變成三份成果，原始筆記沒被改、（點一下）草稿核對過、（點一下）知識圖別人也看得懂。（點一下）交出去之前，再問自己這四個問題。',
  '把它帶回教學現場：哪些事 AI 可以先做、（點一下）哪些和 AI 一起調整、（點一下）哪些一定要自己確認？兩人一組分享一個可交辦的步驟，以及一個必須自己查證的步驟。',
  '最後一分鐘，請大家寫下三句話：AI 幫我做了什麼？哪一步還是要我自己判斷？（點一下）明天你想先拿哪一份資料試試看？（點一下）下面這條主線，就是你可以帶走的做法。',
];

export default [
  Cover, SpeakerIntro, Agenda, StoryStart, ResultFirst,
  ToolComparison, ToolRoles, WrongAnswer, TokenPrediction, LlmEvolution, AgentFlow,
  RunItNow, InstallRoadmap, CheckNode, InstallCodex, OpenProject, StartScreen, DirectoryScope, SessionDesk,
  FirstPrompt, FirstOutput, StatusScreen, StatusChallenge, UsageToken, TokenTips, PromptChoice, Glossary,
  SaveToFiles, LabOverview, ScanTask, ScanOutput, AsciiTask,
  CheckOriginal, SkillMcp, SkillSetup, DiagramTask,
  Reflection, TeachingCheck, ExitTicket,
] satisfies Page[];
