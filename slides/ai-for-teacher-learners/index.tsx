import type { DesignSystem, Page, SlideMeta, SlideTransition } from '@open-slide/core';
import { Step, Steps, useIsActivePage, useSlidePageNumber } from '@open-slide/core';
import codexStatus from './assets/codex-cli-status.png';
import repoQr from './assets/repo-qr.svg';
import labQr from './assets/lab-zip-qr.svg';
import labZip from './assets/teacher-learning-lab.zip?url';
import peachGarden from './assets/peach-garden-oath.png';

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
// leave a page half-drawn. Un-clicked motion (the chapter fill, and the entrance
// below: a page's pieces settling in order, connecting lines drawing on) runs only
// on the page the audience is watching (useIsActivePage), so it never adds a click.
const EASE_OUT = 'cubic-bezier(0.23, 1, 0.32, 1)';
const STEP_MS = 280; // a <Step> fading in (framework fade) + an 8px rise
const BUILD_MS = 320; // pieces inside a revealed step settling in order
const BUILD_GAP = 90; // stagger between those pieces
const BAR_MS = 600; // probability bars growing from zero
const FILL_MS = 480; // chapter marker filling left to right
const ENTER_MS = 420; // a piece of a page settling in when the page arrives
const ENTER_GAP = 110; // stagger between those pieces
const DRAW_MS = 520; // a connecting line drawing from one end to the other

const MOTION_CSS = `
.atl-deck [data-osd-step] > * { transition: transform ${STEP_MS}ms ${EASE_OUT}; }
.atl-deck [data-osd-step="pending"] > * { transform: translateY(8px); }
.atl-deck .atl-build { transition-property: opacity, transform; transition-duration: ${BUILD_MS}ms; transition-timing-function: ${EASE_OUT}; }
.atl-deck [data-osd-step="pending"] .atl-build { opacity: 0; transform: translateY(10px); }
.atl-deck .atl-bar { transform-origin: left center; transition: transform ${BAR_MS}ms ${EASE_OUT}; }
.atl-deck [data-osd-step="pending"] .atl-bar { transform: scaleX(0); }
@keyframes atl-fill { from { transform: scaleX(0); } to { transform: scaleX(1); } }
.atl-deck .atl-fill { transform-origin: left center; animation: atl-fill ${FILL_MS}ms ${EASE_OUT} 160ms both; }
@keyframes atl-in { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: none; } }
.atl-deck .atl-in { animation: atl-in ${ENTER_MS}ms ${EASE_OUT} both; }
@keyframes atl-draw { from { stroke-dashoffset: 1; } to { stroke-dashoffset: 0; } }
.atl-deck .atl-draw { stroke-dasharray: 1; animation: atl-draw ${DRAW_MS}ms ${EASE_OUT} both; }
@media (prefers-reduced-motion: reduce) {
  .atl-deck .atl-in { animation: atl-in-fade 150ms ease both; }
  .atl-deck .atl-draw { animation: none; stroke-dasharray: none; }
  .atl-deck [data-osd-step] > *, .atl-deck [data-osd-step="pending"] > * { transform: none; transition: none; }
  .atl-deck .atl-build { transition: opacity 150ms ease; transition-delay: 0s !important; }
  .atl-deck [data-osd-step="pending"] .atl-build { transform: none; }
  .atl-deck .atl-bar, .atl-deck [data-osd-step="pending"] .atl-bar { transform: none; transition: none; }
  .atl-deck .atl-fill { animation: none; }
}
@keyframes atl-in-fade { from { opacity: 0; } to { opacity: 1; } }
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

// The i-th piece (0-based) of a page's entrance. Off the live page it renders as a
// plain, fully visible wrapper, so thumbnails and exports never catch it mid-motion.
const enterDelay = (i: number, base = 160) => `${base + i * ENTER_GAP}ms`;

const In = ({ i, style, children }: { i: number; style?: React.CSSProperties; children: React.ReactNode }) => {
  const live = useIsActivePage();
  return <div className={live ? 'atl-in' : undefined} style={live ? { ...style, animationDelay: enterDelay(i) } : style}>{children}</div>;
};

// The same, for a group inside an SVG picture.
const InG = ({ i, children }: { i: number; children: React.ReactNode }) => {
  const live = useIsActivePage();
  return <g className={live ? 'atl-in' : undefined} style={live ? { animationDelay: enterDelay(i) } : undefined}>{children}</g>;
};

// A solid connecting line that draws itself on, after the things it connects have landed.
const DrawPath = ({ i, d }: { i: number; d: string }) => {
  const live = useIsActivePage();
  return <path d={d} pathLength={1} className={live ? 'atl-draw' : undefined} style={live ? { animationDelay: enterDelay(i) } : undefined} />;
};

const muted = '#57534E';
const faint = '#948D88'; // strokes and arrows only
const quiet = '#736D68'; // secondary text that must still read on a projector (≈4.9:1 on bg)
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
        color: quiet,
      }}
    >
      <span>協作課｜建立知識筆記</span>
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

// Hands-on pages share the exercise label and time estimate.
const PracticeEyebrow = ({ children, time }: { children: React.ReactNode; time: string }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
    <Eyebrow>{children}</Eyebrow>
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 14, background: '#FFFFFF', border: `1px solid ${rule}`, padding: '6px 18px', fontSize: 24, color: muted, whiteSpace: 'nowrap' }}>
      <strong style={{ color: amber }}>⏱ {time}</strong>
    </span>
  </div>
);

// The four legs of today's route (same as the Agenda). Pages inside a leg show where we are.
const CHAPTERS = ['理解任務', '讀取筆記', '查證關係', '畫圖與應用'];
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
      <span style={{ marginLeft: 12, fontSize: 24, fontWeight: 600, color: amber, letterSpacing: '0.04em' }}>
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
  <p style={{ fontSize: 36, lineHeight: 1.5, color: muted, maxWidth: 1500, margin: 0 }}>
    {children}
  </p>
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

// People are circles; event cards are boxes. The same Liu Bei node connects both stories.
const PromptBox = ({ children, pad = '32px 40px' }: { children: React.ReactNode; pad?: string }) => (
  <div style={{ background: '#FFFFFF', border: `1px solid ${rule}`, borderLeft: `5px solid ${amber}`, padding: pad }}>
    <SmallLabel>你輸入的 Prompt</SmallLabel>
    {children}
  </div>
);

const Path = ({ children, size = 26 }: { children: React.ReactNode; size?: number }) => (
  <span style={{ fontFamily: mono, fontSize: size, whiteSpace: 'nowrap' }}>{children}</span>
);

const Terminal = ({ title, children, width = 1000 }: { title: string; children: React.ReactNode; width?: number }) => (
  <div style={{ width, boxSizing: 'border-box', background: '#1F2226', color: '#F5F5F4', border: '1px solid #555B60' }}>
    <div style={{ height: 56, display: 'flex', alignItems: 'center', gap: 13, background: '#30343A', padding: '0 28px', boxSizing: 'border-box' }}>
      <span style={{ width: 13, height: 13, borderRadius: 20, background: '#DF6A63' }} />
      <span style={{ width: 13, height: 13, borderRadius: 20, background: '#E9B650' }} />
      <span style={{ width: 13, height: 13, borderRadius: 20, background: '#73BB78' }} />
      <span style={{ fontFamily: mono, color: '#BCC3CC', fontSize: 24, marginLeft: 18 }}>{title}</span>
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
    <In i={0}><Eyebrow>三國故事 × AI 協作｜60 分鐘工作坊</Eyebrow></In>
    <In i={1} style={{ marginTop: 64 }}><Title>認識 AI，<br />把筆記整理成知識圖</Title></In>
    <In i={2} style={{ marginTop: 56, fontSize: 35, color: muted }}>讀出人物關係，回原文查證，再畫成圖</In>
    <In i={3} style={{ marginTop: 42, fontSize: 26, color: quiet }}>黃懷萱｜AI 工程師</In>
  </Shell>
);

const SpeakerIntro: Page = () => (
  <Shell>
    <Eyebrow>講者介紹 / ABOUT ME</Eyebrow>
    <Heading>黃懷萱</Heading>
    <p style={{ fontSize: 34, lineHeight: 1.5, color: muted, margin: '22px 0 0', maxWidth: 1500 }}>AI 工程師，主要研究領域在 NLP, LLMs, RAG 等等</p>
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
        <div style={{ fontSize: 24, color: quiet, marginTop: 14 }}>已上線：EZ WAY · eHub · TTLL</div>
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

// A table-of-contents row: chapter, what you do, and the thing you walk away with.
const AGENDA_COLS = '86px 250px 1fr 330px 150px';

const AgendaRow = ({ i, n, name, doing, result, time, page, children }: { i: number; n: string; name: string; doing: string; result: string; time: string; page: string; children: React.ReactNode }) => (
  <In i={i} style={{ display: 'grid', gridTemplateColumns: AGENDA_COLS, alignItems: 'center', minHeight: 116, borderBottom: `1px solid ${rule}` }}>
    <span style={{ fontFamily: display, fontSize: 40, color: amber }}>{n}</span>
    <span style={{ fontSize: 36, fontWeight: 600 }}>{name}</span>
    <span style={{ fontSize: 28, color: muted, lineHeight: 1.45, paddingRight: 28 }}>{doing}</span>
    <span style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
      <svg viewBox="0 0 110 70" style={{ width: 110, height: 70, flexShrink: 0 }} aria-hidden="true">{children}</svg>
      <span style={{ fontSize: 28 }}>{result}</span>
    </span>
    <span style={{ textAlign: 'right' }}><span style={{ display: 'block', fontSize: 26, color: amber }}>{time}</span><span style={{ display: 'block', fontSize: 24, color: quiet, marginTop: 4 }}>{page}</span></span>
  </In>
);

const Agenda: Page = () => (
  <Shell>
    <Eyebrow>60 分鐘｜安裝已於課前完成</Eyebrow>
    <Heading>今天的課程大綱</Heading>
    <div style={{ marginTop: 20 }}><Lead>四段，每段結束時，手上會多一樣東西</Lead></div>
    <div style={{ display: 'grid', gridTemplateColumns: AGENDA_COLS, marginTop: 30, paddingBottom: 12, borderBottom: `1px solid ${rule}` }}>
      <span /><SmallLabel>章節</SmallLabel><SmallLabel>你會做的事</SmallLabel><SmallLabel>結束時手上有</SmallLabel><span style={{ textAlign: 'right' }}><SmallLabel>時間｜頁</SmallLabel></span>
    </div>
    <AgendaRow i={0} n="01" name="理解任務" doing="看一張三國關係圖，知道 AI 會說錯，所以要先給它資料" result="一個要查的問題" time="00–08 分" page="第 2 頁">
      <line x1="22" y1="35" x2="88" y2="35" stroke={amber} strokeWidth="3" strokeDasharray="6 5" />
      <circle cx="14" cy="35" r="11" fill={amberSoft} stroke={amber} strokeWidth="2" /><circle cx="96" cy="35" r="11" fill={amberSoft} stroke={amber} strokeWidth="2" />
      <circle cx="55" cy="35" r="13" fill={amber} /><text x="55" y="42" textAnchor="middle" fontSize="19" fontWeight="700" fill="#FFFFFF">?</text>
    </AgendaRow>
    <AgendaRow i={1} n="02" name="讀取筆記" doing="練習 1：請 AI 讀六份筆記，整理成一張表" result="一張關係表" time="08–20 分" page="第 9 頁">
      <rect x="6" y="6" width="98" height="58" fill="#FFFFFF" stroke={faint} strokeWidth="2" /><rect x="6" y="6" width="98" height="14" fill={raised} />
      <line x1="6" y1="34" x2="104" y2="34" stroke={rule} strokeWidth="2" /><line x1="6" y1="49" x2="104" y2="49" stroke={rule} strokeWidth="2" /><line x1="40" y1="6" x2="40" y2="64" stroke={rule} strokeWidth="2" /><line x1="72" y1="6" x2="72" y2="64" stroke={rule} strokeWidth="2" />
    </AgendaRow>
    <AgendaRow i={2} n="03" name="查證關係" doing="練習 2：AI 先打草稿，你回原文一條一條核對" result="核對過的草稿" time="20–35 分" page="第 13 頁">
      <DocShape x={6} y={4} w={78} h={62} /><g stroke={faint} strokeWidth="3"><path d="M18 22 H58" /><path d="M18 34 H50" /><path d="M18 46 H54" /></g>
      <circle cx="88" cy="50" r="16" fill={okGreen} /><TickMark x={88} y={51} size={16} color="#FFFFFF" />
    </AgendaRow>
    <AgendaRow i={3} n="04" name="畫圖與應用" doing="練習 3：畫成知識圖；最後換成自己的教材想一想" result="一張知識圖" time="35–60 分" page="第 17 頁">
      <g stroke={amber} strokeWidth="2.5" fill="none"><path d="M18 16 L48 52" /><path d="M55 16 L48 52" /><path d="M55 16 L86 52" /><path d="M92 16 L86 52" /></g>
      <circle cx="18" cy="14" r="9" fill={surface} stroke={faint} strokeWidth="2" /><circle cx="55" cy="14" r="9" fill={amberSoft} stroke={amber} strokeWidth="2" /><circle cx="92" cy="14" r="9" fill={surface} stroke={faint} strokeWidth="2" />
      <rect x="32" y="50" width="32" height="16" fill={sage} stroke={okGreen} strokeWidth="2" /><rect x="70" y="50" width="32" height="16" fill={amberSoft} stroke={amber} strokeWidth="2" />
    </AgendaRow>
  </Shell>
);

const StoryStart: Page = () => (
  <Shell>
    <Eyebrow>{'前導\n'}</Eyebrow>
    <Heading>如果有 100 篇三國筆記，你會怎麼找？</Heading>
    <div style={{ display: 'grid', gridTemplateColumns: '940px 1fr', gap: 50, marginTop: 48, alignItems: 'center' }}>
      <In i={0}><img src={peachGarden} alt="桃園結義想像插畫：劉備、關羽、張飛在桃樹下舉杯" style={{ width: 940, height: 510, objectFit: 'cover', display: 'block' }} /><div style={{ fontSize: 23, color: quiet, marginTop: 14 }}>《三國演義》桃園結義｜AI 生成的情境插畫</div></In>
      <div style={{ display: 'grid', gap: 34 }}>
        <In i={1} style={{ fontSize: 40, lineHeight: 1.5 }}>劉備跟哪些人有關？<br />劉備參與哪些戰役？</In>
        <In i={2} style={{ borderTop: `2px solid ${amber}`, paddingTop: 28, fontSize: 34, lineHeight: 1.6, color: muted }}>我們人類背書、記憶的方式
和 AI 其實很像</In>
        <Steps><Step duration={STEP_MS}><div style={{ fontSize: 36, lineHeight: 1.5, color: amber }}>那該怎麼利用 AI 幫助我們讀書？{''}{''}{''}</div></Step></Steps>
      </div>
    </div>
  </Shell>
);

const LargeStoryGraph = ({ height = 480 }: { height?: number }) => (
  <div style={{ position: 'relative', height, background: '#FFFFFF', border: `1px solid ${rule}` }}>
    <Steps>
      <svg viewBox="0 0 1600 500" style={{ width: '100%', height: height - 10, position: 'absolute', inset: 0 }} role="img" aria-label="劉備人物節點">
        <circle cx="840" cy="100" r="55" fill={amberSoft} stroke={amber} strokeWidth="2" /><text x="840" y="112" textAnchor="middle" fontSize="35" fill="#1C1917">劉備</text>
      </svg>
      <Step duration={STEP_MS}><svg viewBox="0 0 1600 500" style={{ width: '100%', height: height - 10, position: 'absolute', inset: 0 }} role="img" aria-label="關羽、張飛、曹操依序出現">
        {[['關羽', 170], ['張飛', 470], ['曹操', 1360]].map(([name, x], i) => <g key={name} className="atl-build" style={buildDelay(i, 0)}><circle cx={Number(x)} cy="100" r="55" fill={surface} stroke={rule} strokeWidth="2" /><text x={Number(x)} y="112" textAnchor="middle" fontSize="35" fill="#1C1917">{name}</text></g>)}
      </svg></Step>
      <Step duration={STEP_MS}><svg viewBox="0 0 1600 500" style={{ width: '100%', height: height - 10, position: 'absolute', inset: 0 }} role="img" aria-label="桃園結義連到關羽、張飛、劉備">
        <g fill="none" stroke={amber} strokeWidth="4"><path d="M170 155 C170 240 290 260 360 320"/><path d="M470 155 V320"/><path d="M810 147 C790 240 650 280 580 320"/></g>
        <rect x="300" y="320" width="340" height="90" fill={sage} stroke={okGreen} strokeWidth="2"/><text x="470" y="377" textAnchor="middle" fontSize="38" fill="#1C1917">桃園結義</text><text x="470" y="455" textAnchor="middle" fontSize="26" fill={quiet}>三人參與結義｜第 1 回</text>
      </svg></Step>
      <Step duration={STEP_MS}><svg viewBox="0 0 1600 500" style={{ width: '100%', height: height - 10, position: 'absolute', inset: 0 }} role="img" aria-label="煮酒論英雄連到劉備、曹操">
        <g fill="none" stroke={okGreen} strokeWidth="4"><path d="M870 147 C910 235 1000 270 1050 320"/><path d="M1360 155 C1360 240 1280 275 1220 320"/></g>
        <rect x="970" y="320" width="340" height="90" fill={amberSoft} stroke={amber} strokeWidth="2"/><text x="1140" y="377" textAnchor="middle" fontSize="38" fill="#1C1917">煮酒論英雄</text><text x="1140" y="455" textAnchor="middle" fontSize="26" fill={quiet}>兩人談論英雄｜第 21 回</text>
      </svg></Step>
    </Steps>
  </div>
);

const ResultFirst: Page = () => (
  <Shell>
    <Eyebrow>先看今天的成果</Eyebrow>
    <Heading>知識圖</Heading>
    <div style={{ marginTop: 26 }}><Lead>人物是節點，用線連接起來</Lead></div>
    <div style={{ marginTop: 38 }}><LargeStoryGraph /></div>
    <p style={{ fontSize: 28, color: muted, marginTop: 26 }}>每條線都能回到一份筆記查證</p>
  </Shell>
);

// ---------- 01 認識 AI ----------

const WrongAnswer: Page = () => (
  <Shell chapter={1}>
    <Eyebrow>使用 AI 工具可能遇到的難題</Eyebrow>
    <Heading>AI 幻覺（Hallucination）</Heading>
    <div style={{ marginTop: 40, display: 'grid', gap: 22 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '165px 1fr', gap: 24, alignItems: 'center', padding: '24px 32px', background: surface }}><SmallLabel>你問</SmallLabel><div style={{ fontSize: 38 }}>「《三國演義》裡，桃園結義有哪些人？」</div></div>
      <Steps>
        <Step duration={STEP_MS}><div style={{ display: 'grid', gridTemplateColumns: '165px 1fr', gap: 24, alignItems: 'start', padding: '24px 32px', background: '#FFFFFF', border: `1px solid ${rule}` }}><SmallLabel>AI 回答</SmallLabel><div><div style={{ fontSize: 37, lineHeight: 1.5 }}>「劉備、關羽、張飛，還有曹操」</div><div style={{ marginTop: 12, fontSize: 24, color: quiet }}>教學示範用，錯誤的</div></div></div></Step>
        <Step duration={STEP_MS}><div style={{ marginTop: 24, padding: '24px 32px', borderLeft: `4px solid ${amber}`, background: amberSoft }}><div style={{ fontSize: 34 }}>故事裡結義的是劉備、關羽、張飛，沒有曹操</div><div style={{ marginTop: 18, fontSize: 31, color: muted, lineHeight: 1.5 }}><strong style={{ color: amber, fontWeight: '700' }}>如果沒有參考資料呢？</strong><br />AI 把錯誤或沒有根據的內容，當成事實說出來</div></div></Step>
      </Steps>
    </div>
    <Steps><Step duration={STEP_MS}><div style={{ marginTop: 28, fontSize: 33, color: amber }}>如果先讓它找到故事內容後，用這個當作參考資料，再回答呢？</div></Step></Steps>
  </Shell>
);

// Open-book picture of RAG: six notes on the desk, one gets picked, the AI answers from it.
const NoteCard = ({ x, y, label, hot = false }: { x: number; y: number; label: string; hot?: boolean }) => (
  <g><rect x={x} y={y} width="134" height="70" fill={hot ? amberSoft : surface} stroke={hot ? amber : rule} strokeWidth={hot ? 3 : 2} /><text x={x + 67} y={y + 44} textAnchor="middle" fontSize="24" fontWeight={hot ? 600 : 400} fill={hot ? '#1C1917' : quiet}>{label}</text></g>
);

const RagStepLabel = ({ x, n, label }: { x: number; n: string; label: string }) => (
  <g><circle cx={x + 22} cy="30" r="22" fill={amber} /><text x={x + 22} y="39" textAnchor="middle" fontSize="25" fontWeight="600" fill="#FFFFFF">{n}</text><text x={x + 56} y="41" fontSize="30" fontWeight="600" fill="#1C1917">{label}</text></g>
);

const RAG_BOX = { width: '100%', height: 320, position: 'absolute', inset: 0 } as const;

const RagFlow: Page = () => (
  <Shell chapter={1}>
    <Eyebrow>給 AI 可以參考的資料</Eyebrow>
    <Heading>RAG：先找資料，再回答問題</Heading>
    <div style={{ marginTop: 10, fontSize: 24, color: quiet }}>RAG = Retrieval-Augmented Generation（檢索增強生成）</div>
    <div style={{ marginTop: 20 }}><Lead>像開書考：先翻到那一頁，再作答</Lead></div>
    <div style={{ position: 'relative', height: 320, marginTop: 40 }}>
      <Steps>
        <svg viewBox="0 0 1632 320" style={RAG_BOX} role="img" aria-label="問題「桃園結義有哪些人？」，從六份筆記挑出〈桃園結義〉">
          <text x="0" y="41" fontSize="25" fontWeight="600" fill={quiet} letterSpacing="2">問題</text>
          <rect x="0" y="80" width="250" height="160" fill="#FFFFFF" stroke={rule} strokeWidth="2" />
          <text x="125" y="150" textAnchor="middle" fontSize="34" fill="#1C1917">桃園結義</text>
          <text x="125" y="196" textAnchor="middle" fontSize="34" fill="#1C1917">有哪些人？</text>
          <MapArrow x1={262} x2={322} y={160} />
          <RagStepLabel x={334} n="1" label="找資料" />
          <NoteCard x={334} y={80} label="劉備" />
          <NoteCard x={474} y={80} label="張飛" />
          <NoteCard x={614} y={80} label="關羽" />
          <NoteCard x={334} y={170} label="曹操" />
          <NoteCard x={474} y={170} label="桃園結義" hot />
          <NoteCard x={614} y={170} label="煮酒論英雄" />
          <text x="541" y="296" textAnchor="middle" fontSize="26" fill={quiet}>六份筆記挑出相關的一份</text>
        </svg>
        <Step duration={STEP_MS}><svg viewBox="0 0 1632 320" style={RAG_BOX} role="img" aria-label="把問題和〈桃園結義〉筆記一起交給 AI">
          <MapArrow x1={760} x2={830} y={160} hot />
          <RagStepLabel x={842} n="2" label="交給 AI" />
          <rect x="842" y="80" width="270" height="160" fill={amberSoft} stroke={amber} strokeWidth="2" />
          <text x="977" y="152" textAnchor="middle" fontSize="48" fontWeight="600" fill="#1C1917">AI</text>
          <text x="977" y="205" textAnchor="middle" fontSize="26" fill={muted}>問題＋這份筆記</text>
          <text x="977" y="296" textAnchor="middle" fontSize="26" fill={quiet}>連同筆記一起問</text>
        </svg></Step>
        <Step duration={STEP_MS}><svg viewBox="0 0 1632 320" style={RAG_BOX} role="img" aria-label="AI 根據〈桃園結義〉回答：劉備、關羽、張飛">
          <MapArrow x1={1124} x2={1194} y={160} hot />
          <RagStepLabel x={1206} n="3" label="產生回答" />
          <rect x="1206" y="80" width="426" height="160" fill={sage} stroke={okGreen} strokeWidth="2" />
          <text x="1419" y="160" textAnchor="middle" fontSize="36" fill="#1C1917">劉備、關羽、張飛</text>
          <text x="1419" y="205" textAnchor="middle" fontSize="25" fill={quiet}>根據〈桃園結義〉</text>
          <text x="1419" y="296" textAnchor="middle" fontSize="26" fill={quiet}>照著筆記回答</text>
        </svg></Step>
      </Steps>
    </div>
    <Steps><Step duration={STEP_MS}><p style={{ marginTop: 36, fontSize: 32, lineHeight: 1.5, color: amber }}>有資料可以參考，答案通常準很多<br />但資料一多，AI 也可能看漏，還是要回原文查證</p></Step></Steps>
  </Shell>
);

const OpenProject: Page = () => (
  <Shell>
    <Eyebrow>課前操作｜啟動</Eyebrow>
    <Heading>進入練習資料夾，再啟動 Codex</Heading>
    <div style={{ display: 'grid', gridTemplateColumns: '600px 1fr', gap: 56, alignItems: 'start', marginTop: 64 }}>
      <div style={{ background: surface, padding: '36px 40px', fontSize: 31, lineHeight: 1.75, whiteSpace: 'nowrap' }}>
        <SmallLabel>終端機現在停在最上層</SmallLabel>
        <div style={{ marginTop: 28 }}>AI-workshop-slides/<span style={{ color: amber, fontSize: 24 }}>　← 你在這裡</span><br />└─ examples/<br />　 └─ <strong>teacher-learning-lab/</strong></div>
      </div>
      <div>
        <Terminal title="從課程根目錄輸入以下指令" width={976}>
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

// If Codex won't install or log in, the same practices still work in the ChatGPT web app.
const StatusScreen: Page = () => (
  <Shell>
    <Eyebrow>操作查詢｜/status</Eyebrow>
    <Heading>輸入 /status，看懂它的工作環境</Heading>
    <div style={{ display: 'grid', gridTemplateColumns: '760px 1fr', gap: 56, alignItems: 'start', marginTop: 48 }}>
      <div>
        <Shot src={codexStatus} alt="Codex /status 的輸出，標出 Directory 與 Permissions 兩行" crop={[130, 330, 905, 480]} width={760}>
          <RowMark top={88} width={748} />
          <RowMark top={121} width={748} />
        </Shot>
        <p style={{ fontSize: 24, color: quiet, marginTop: 14 }}>教材範例｜帳號與即時額度已隱藏</p>
      </div>
      <Table>
        <TRow head cols="240px 1fr" cells={['欄位', '白話來說']} />
        <TRow cols="240px 1fr" cells={[<span style={{ fontFamily: mono, fontSize: 25 }}>Model</span>, '現在用哪個模型']} />
        <TRow cols="240px 1fr" tint={amberSoft} cells={[<span style={{ fontFamily: mono, fontSize: 25 }}>Directory</span>, <strong>它在哪個資料夾工作</strong>]} />
        <TRow cols="240px 1fr" tint={amberSoft} cells={[<span style={{ fontFamily: mono, fontSize: 25 }}>Permissions</span>, <strong>它能做哪些事、要不要先問你</strong>]} />
        <TRow cols="240px 1fr" cells={[<span style={{ fontFamily: mono, fontSize: 25 }}>Agents.md</span>, '專案有沒有額外的工作規則']} />
        <TRow cols="240px 1fr" cells={[<span style={{ fontFamily: mono, fontSize: 25 }}>Session</span>, '這次協作的編號']} />
        <TRow cols="240px 1fr" cells={[<span style={{ fontFamily: mono, fontSize: 25 }}>5h · Weekly</span>, '帳號額度資訊（依版本顯示）']} />
      </Table>
    </div>
  </Shell>
);


// Prompt A leaves a blank where prompt B fills one in.
const SlotTag = ({ children }: { children: React.ReactNode }) => (
  <div style={{ background: amber, color: '#FFFFFF', fontSize: 28, fontWeight: 600, display: 'grid', placeItems: 'center' }}>{children}</div>
);

const EmptySlot = ({ children }: { children: React.ReactNode }) => (
  <div style={{ border: `2px dashed ${faint}`, display: 'flex', alignItems: 'center', gap: 16, padding: '0 24px', fontSize: 28, color: quiet }}>
    <span style={{ width: 36, height: 36, borderRadius: 18, background: amber, color: '#FFFFFF', fontSize: 24, fontWeight: 700, display: 'grid', placeItems: 'center', flexShrink: 0 }}>?</span>
    {children}
  </div>
);

const FilledSlot = ({ children }: { children: React.ReactNode }) => (
  <div style={{ background: amberSoft, borderLeft: `4px solid ${amber}`, display: 'flex', alignItems: 'center', padding: '0 28px', fontSize: 30 }}>{children}</div>
);

// B's filled slots fill in one by one; the wrapper stays a stretched grid cell.
const SLOT_CELL = { display: 'grid' } as const;

const PromptChoice: Page = () => (
  <Shell chapter={2}>
    <Eyebrow>現場二選一</Eyebrow>
    <Heading>哪句交代比較清楚？</Heading>
    <div style={{ marginTop: 20 }}><Lead>像出學習單：看哪裡、交什麼、什麼不能做，三格都要寫</Lead></div>
    <div style={{ display: 'grid', gridTemplateColumns: '130px 400px 1fr', gridAutoRows: 'minmax(88px, auto)', columnGap: 24, rowGap: 14, marginTop: 40 }}>
      <div />
      <div style={{ alignSelf: 'end' }}><SmallLabel>A</SmallLabel><div style={{ fontSize: 32, marginTop: 6 }}>「幫我整理三國」</div></div>
      <div style={{ alignSelf: 'end' }}><SmallLabel>B</SmallLabel><div style={{ fontSize: 32, marginTop: 6 }}>三格都寫清楚</div></div>
      <SlotTag>範圍</SlotTag>
      <EmptySlot>看哪裡？</EmptySlot>
      <In i={0} style={SLOT_CELL}><FilledSlot>只讀&nbsp;<span style={{ fontFamily: mono, fontSize: 28 }}>notes/桃園結義.md</span></FilledSlot></In>
      <SlotTag>產出</SlotTag>
      <EmptySlot>做成什麼？</EmptySlot>
      <In i={1} style={SLOT_CELL}><FilledSlot>列出 3 位人物、1 種關係，附支持的句子</FilledSlot></In>
      <SlotTag>限制</SlotTag>
      <EmptySlot>什麼不能做？</EmptySlot>
      <In i={2} style={SLOT_CELL}><FilledSlot>先不要改檔案，也不要加入原筆記沒有的事實</FilledSlot></In>
    </div>
    <Steps>
      <Step duration={STEP_MS}><p style={{ fontSize: 32, color: muted, marginTop: 40 }}>這裡先看單篇示範；下一頁正式練習，再讀六份筆記</p></Step>
    </Steps>
  </Shell>
);

// ---------- 03 整理三國筆記 ----------

// One of the six note files, drawn as a sheet of paper.
const NoteFile = ({ x, y, w, kind, name, tint = '#FFFFFF', stroke = rule }: { x: number; y: number; w: number; kind: string; name: string; tint?: string; stroke?: string }) => (
  <g>
    <DocShape x={x} y={y} w={w} h={120} fill={tint} stroke={stroke} sw={stroke === rule ? 2 : 3} />
    <text x={x + 24} y={y + 38} fontSize="24" fill={quiet}>{kind}</text>
    <text x={x + w / 2} y={y + 92} textAnchor="middle" fontSize="38" fontWeight="600" fill="#1C1917">{name}</text>
  </g>
);

const LabOverview: Page = () => (
  <Shell chapter={2}>
    <Eyebrow>同一個故事，分成六份短筆記</Eyebrow>
    <Heading>四個人物、兩件事，先從結義開始</Heading>
    <div style={{ marginTop: 20 }}><Lead>六張資料卡；連線表示「這個人出現在這件事裡」</Lead></div>
    <div style={{ marginTop: 32 }}>
      <Figure h={400} label="關羽、張飛、劉備連到桃園結義；劉備、曹操連到煮酒論英雄；劉備同時連到兩件事">
        <g fill="none" stroke={faint} strokeWidth="3">
          <DrawPath i={6} d="M190 130 L400 270" />
          <DrawPath i={6} d="M600 130 L480 270" />
          <DrawPath i={6} d="M1420 130 L1250 270" />
        </g>
        <g fill="none" stroke={amber} strokeWidth="4">
          <DrawPath i={8} d="M1010 130 L560 270" />
          <DrawPath i={8} d="M1010 130 L1150 270" />
        </g>
        <InG i={0}><NoteFile x={60} y={10} w={260} kind="人物" name="關羽" /></InG>
        <InG i={1}><NoteFile x={470} y={10} w={260} kind="人物" name="張飛" /></InG>
        <InG i={2}><NoteFile x={880} y={10} w={260} kind="人物" name="劉備" tint={amberSoft} stroke={amber} /></InG>
        <InG i={3}><NoteFile x={1290} y={10} w={260} kind="人物" name="曹操" /></InG>
        <InG i={4}><NoteFile x={260} y={270} w={440} kind="事件｜第 1 回" name="桃園結義" tint={sage} stroke={okGreen} /></InG>
        <InG i={5}><NoteFile x={980} y={270} w={440} kind="事件｜第 21 回" name="煮酒論英雄" /></InG>
      </Figure>
    </div>
    <p style={{ fontSize: 31, color: muted, marginTop: 30 }}>先讀懂桃園結義，再用同一張劉備卡接到另一段故事</p>
  </Shell>
);

// A note file in the left-hand list.
const FileRow = ({ name }: { name: string }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 16, height: 48 }}>
    <svg viewBox="0 0 32 40" style={{ width: 28, height: 36, flexShrink: 0 }} aria-hidden="true"><DocShape x={1} y={1} w={30} h={38} /></svg>
    <span style={{ fontSize: 28 }}>{name}</span>
  </div>
);

const SKETCH_COLS = '200px repeat(3, 1fr)';

// One row of the table the AI hands back: the note name, then cells still to be filled.
const SketchRow = ({ i, name }: { i: number; name: string }) => (
  <In i={i} style={{ display: 'grid', gridTemplateColumns: SKETCH_COLS, alignItems: 'center', height: 42, borderBottom: `1px solid ${rule}` }}>
    <span style={{ fontSize: 24, paddingLeft: 14 }}>{name}</span>
    <span style={{ height: 10, width: '60%', marginLeft: 14, background: rule }} />
    <span style={{ height: 10, width: '70%', marginLeft: 14, background: rule }} />
    <span style={{ height: 10, width: '80%', marginLeft: 14, background: amberSoft, outline: `1px solid ${amber}` }} />
  </In>
);

const ScanTask: Page = () => (
  <Shell chapter={2}>
    <PracticeEyebrow time="5 分鐘">練習 1｜讀筆記</PracticeEyebrow>
    <Heading>正式練習：從一篇擴大到六份筆記</Heading>
    <div style={{ marginTop: 32 }}>
      <PromptBox pad="20px 32px"><div style={{ fontSize: 30, lineHeight: 1.5, marginTop: 8 }}>請閱讀 notes/ 裡的六份筆記，整理成一張表（欄位如右下）。<strong style={{ color: amber }}>先不要修改任何檔案。</strong></div></PromptBox>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: '260px 90px 1fr', alignItems: 'center', marginTop: 28 }}>
      <div>
        <SmallLabel>notes/</SmallLabel>
        <div style={{ marginTop: 8 }}>
          <FileRow name="劉備" />
          <FileRow name="關羽" />
          <FileRow name="張飛" />
          <FileRow name="曹操" />
          <FileRow name="桃園結義" />
          <FileRow name="煮酒論英雄" />
        </div>
      </div>
      <div style={{ textAlign: 'center' }}><Arrow size={60} /></div>
      <div>
        <SmallLabel>像請助教把六份資料填進同一張表：一份筆記一列</SmallLabel>
        <div style={{ background: '#FFFFFF', border: `1px solid ${rule}`, marginTop: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: SKETCH_COLS, background: raised, fontSize: 24, fontWeight: 600, color: muted, height: 50, alignItems: 'center' }}>
            <span style={{ paddingLeft: 14 }}>筆記名稱</span><span style={{ paddingLeft: 14 }}>相關人物</span><span style={{ paddingLeft: 14 }}>關係說明</span><span style={{ paddingLeft: 14, color: amber }}>依據句子</span>
          </div>
          <SketchRow i={0} name="劉備" />
          <SketchRow i={1} name="關羽" />
          <SketchRow i={2} name="張飛" />
          <SketchRow i={3} name="曹操" />
          <SketchRow i={4} name="桃園結義" />
          <SketchRow i={5} name="煮酒論英雄" />
        </div>
      </div>
    </div>
    <p style={{ fontSize: 30, color: muted, marginTop: 28 }}>確認六份筆記都在表上，每條關係都附上依據句子</p>
  </Shell>
);

// Evidence chain, read left to right: the file you can open, the sentence in it, the relation it supports.
const EVIDENCE_COLS = '280px 1fr 420px';

const EvidenceRow = ({ i, file, chapter, quote, claim }: { i: number; file: string; chapter: string; quote: string; claim: string }) => (
  <In i={i} style={{ display: 'grid', gridTemplateColumns: EVIDENCE_COLS, columnGap: 64, alignItems: 'center' }}>
    <div style={{ background: surface, border: `1px solid ${rule}`, padding: '16px 20px' }}>
      <div style={{ fontFamily: mono, fontSize: 25 }}>{file}</div>
      <div style={{ fontSize: 24, color: quiet, marginTop: 6 }}>{chapter}</div>
    </div>
    <ArrowCell gap={64}><div style={{ background: '#FFFFFF', border: `1px solid ${rule}`, borderLeft: `4px solid ${amber}`, padding: '20px 24px', fontSize: 28, lineHeight: 1.45 }}>{quote}</div></ArrowCell>
    <ArrowCell gap={64}><div style={{ background: sage, border: `2px solid ${okGreen}`, padding: '18px 24px', fontSize: 29, fontWeight: 600, lineHeight: 1.4 }}>{claim}</div></ArrowCell>
  </In>
);

const ScanOutput: Page = () => (
  <Shell chapter={2}>
    <Eyebrow>練習 1｜檢查結果</Eyebrow>
    <Heading>關係、原句和來源，要一起留下來</Heading>
    <div style={{ marginTop: 20 }}><Lead>像寫報告附出處：只寫結論不夠，還要附引文和頁碼</Lead></div>
    <div style={{ display: 'grid', gridTemplateColumns: EVIDENCE_COLS, columnGap: 64, marginTop: 36 }}>
      <SmallLabel>來源：讓你找得到</SmallLabel>
      <SmallLabel>原句：讓你核對得了</SmallLabel>
      <SmallLabel>整理出的關係</SmallLabel>
    </div>
    <div style={{ display: 'grid', gap: 22, marginTop: 14 }}>
      <EvidenceRow i={0} file="桃園結義.md" chapter="第 1 回" quote="「劉備、關羽、張飛在桃園結為兄弟」" claim="劉備、關羽、張飛參與結義" />
      <EvidenceRow i={1} file="煮酒論英雄.md" chapter="第 21 回" quote="「曹操與劉備在煮酒論英雄的情節中談論誰是英雄」" claim="曹操與劉備共同談論英雄" />
    </div>
    <p style={{ fontSize: 32, color: muted, lineHeight: 1.6, marginTop: 36 }}>同一個劉備出現在兩件事裡<br />選一列，自己打開筆記，確認原句真的支持這個關係</p>
  </Shell>
);

const AsciiTask: Page = () => (
  <Shell chapter={3}>
    <PracticeEyebrow time="5 分鐘">練習 2｜出草稿</PracticeEyebrow>
    <Heading>先用文字排出關係，先不要存</Heading>
    <div style={{ marginTop: 20 }}><Lead>像先在黑板上打草稿，還沒抄進作業本</Lead></div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 560px', gap: 48, alignItems: 'start', marginTop: 32 }}>
      <In i={0}><PromptBox pad="26px 34px">
        <div style={{ fontSize: 30, lineHeight: 1.55, marginTop: 14 }}>請只讀 <Path size={26}>notes/煮酒論英雄.md</Path>，用純文字排出：</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 18 }}>
          <Chip tint={surface} size={26}>事件</Chip><Chip tint={surface} size={26}>參與人物</Chip><Chip tint={surface} size={26}>人物關係</Chip><Chip tint={surface} size={26}>來源回目</Chip>
        </div>
        <div style={{ fontSize: 28, lineHeight: 1.55, marginTop: 18 }}>不要加入原筆記沒有的事實</div>
        <div style={{ fontSize: 30, fontWeight: 600, color: amber, marginTop: 10 }}>先把草稿顯示在畫面上，不要存檔</div>
      </PromptBox></In>
      <div>
        <In i={1}><Terminal title="畫面上的草稿" width={560}>
          <div style={{ fontFamily: mono, fontSize: 26, lineHeight: 1.5, whiteSpace: 'pre' }}>{'煮酒論英雄（第 21 回）\n├─ 參與人物\n├─ 人物關係\n└─ 來源回目'}</div>
        </Terminal></In>
        <div style={{ display: 'grid', gap: 10, marginTop: 18 }}>
          <In i={2}><StatusLine ok>先顯示在畫面上</StatusLine></In>
          <In i={3}><StatusLine ok={false}>存檔：等核對完再存</StatusLine></In>
        </div>
      </div>
    </div>
    <div style={{ marginTop: 28 }}><Lead>檢查草稿中的參與人物、關係名稱與來源回目</Lead></div>
  </Shell>
);

const AsciiDraft: Page = () => (
  <Shell chapter={3}>
    <Eyebrow>練習 2｜找出原文沒有說的話</Eyebrow>
    <Heading>一起談論英雄，就能推論是盟友嗎？</Heading>
    <div style={{ marginTop: 20 }}><Lead>坐同一桌吃飯，不代表是同一隊</Lead></div>
    <div style={{ display: 'grid', gridTemplateColumns: '720px 1fr', gap: 40, marginTop: 36 }}>
      <div style={{ background: surface, padding: '28px 36px' }}>
        <div style={{ fontSize: 24, color: quiet }}>教學用草稿：刻意加入一個尚無依據的推論</div>
        <div style={{ fontFamily: mono, fontSize: 30, lineHeight: 1.85, marginTop: 14 }}>{'煮酒論英雄（小說第 21 回）'}<br />├─ 參與人物：劉備、曹操<br />├─ 事件：兩人談論誰是英雄<br /><span style={{ color: amber }}>└─ 推論：兩人是盟友</span></div>
      </div>
      <div style={{ background: '#FFFFFF', border: `1px solid ${rule}` }}>
        <Figure w={870} h={370} label="劉備和曹操都用實線連到煮酒論英雄；兩人之間的「盟友」是虛線推論，打上問號">
          <g fill="none" stroke={okGreen} strokeWidth="4"><path d="M216 182 L350 250" /><path d="M654 182 L520 250" /></g>
          <path d="M225 125 Q435 0 645 125" fill="none" stroke={amber} strokeWidth="4" strokeDasharray="12 10" />
          <MapPerson x={180} y={150} name="劉備" />
          <MapPerson x={690} y={150} name="曹操" />
          <MapBox x={315} y={250} w={240} label="煮酒論英雄" />
          <AskMark x={435} y={62} />
          <text x="435" y="34" textAnchor="middle" fontSize="28" fill={amber}>盟友</text>
          <line x1="40" y1="352" x2="90" y2="352" stroke={okGreen} strokeWidth="4" />
          <text x="102" y="361" fontSize="24" fill={muted}>原文有寫</text>
          <line x1="300" y1="352" x2="350" y2="352" stroke={amber} strokeWidth="4" strokeDasharray="12 10" />
          <text x="362" y="361" fontSize="24" fill={muted}>推論，原文沒寫</text>
        </Figure>
      </div>
    </div>
    <Steps><Step duration={STEP_MS}><div style={{ marginTop: 32, fontSize: 36, color: amber }}>「參與同一場對話」和「政治上的盟友」是同一件事嗎？</div></Step></Steps>
  </Shell>
);

// ---------- 04 核對原文與畫圖 ----------


// A row of the check: the draft's claim stays up; the line to the note, the sentence
// and the verdict arrive together on one click, the verdict landing a beat later.
const CHECK_COLS = '420px 90px 1fr 194px';

const CheckLink = ({ ok }: { ok: boolean }) => (
  <svg viewBox="0 0 90 60" style={{ display: 'block', width: 90, height: 60 }} aria-hidden="true">
    <line x1="0" y1="30" x2="90" y2="30" stroke={ok ? okGreen : amber} strokeWidth="4" strokeDasharray={ok ? undefined : '10 8'} />
    {ok ? <g><circle cx="45" cy="30" r="18" fill={okGreen} /><TickMark x={45} y={31} size={18} color="#FFFFFF" /></g> : <AskMark x={45} y={30} />}
  </svg>
);

const CheckRow = ({ claim, source, verdict, ok }: { claim: React.ReactNode; source: React.ReactNode; verdict: string; ok: boolean }) => (
  <div style={{ display: 'grid', gridTemplateColumns: '420px 1fr', alignItems: 'center' }}>
    <Steps>
      <div style={{ background: surface, padding: '20px 24px', fontSize: 29, lineHeight: 1.45 }}>{claim}</div>
      <Step duration={STEP_MS}>
        <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr 194px', alignItems: 'center' }}>
          <CheckLink ok={ok} />
          <div style={{ background: ok ? '#FFFFFF' : 'transparent', border: ok ? `1px solid ${rule}` : `2px dashed ${faint}`, padding: '20px 24px', fontSize: 28, lineHeight: 1.45, color: ok ? 'var(--osd-text)' : quiet }}>{source}</div>
          <div className="atl-build" style={{ ...buildDelay(2), paddingLeft: 24 }}>
            <div style={{ border: `3px solid ${ok ? okGreen : amber}`, color: ok ? okGreen : amber, fontSize: 30, fontWeight: 700, textAlign: 'center', padding: '10px 0' }}>{verdict}</div>
          </div>
        </div>
      </Step>
    </Steps>
  </div>
);

const CheckOriginal: Page = () => (
  <Shell chapter={3}>
    <PracticeEyebrow time="8 分鐘">練習 2｜自己打開原文核對</PracticeEyebrow>
    <Heading>請它找句子，再由你判斷能否支持</Heading>
    <div style={{ marginTop: 20 }}><Lead>像改作業：每個說法，都要對到筆記裡的一句</Lead></div>
    <div style={{ marginTop: 28 }}><PromptBox pad="22px 32px"><div style={{ fontSize: 29, lineHeight: 1.5, marginTop: 10 }}>對照 notes/煮酒論英雄.md，逐條列出支持草稿關係的原句；找不到就寫「找不到」。先不要改檔案。</div></PromptBox></div>
    <div style={{ display: 'grid', gridTemplateColumns: CHECK_COLS, marginTop: 30 }}>
      <SmallLabel>草稿主張</SmallLabel>
      <span />
      <SmallLabel>筆記的依據</SmallLabel>
      <span style={{ paddingLeft: 24 }}><SmallLabel>你的決定</SmallLabel></span>
    </div>
    <div style={{ display: 'grid', gap: 16, marginTop: 12 }}>
      <CheckRow ok claim="劉備、曹操共同談論英雄" source="「曹操與劉備在煮酒論英雄的情節中談論誰是英雄。」" verdict="保留" />
      <CheckRow ok={false} claim="劉備與曹操是盟友" source="找不到支持盟友關係的句子；對話本身不足以證明" verdict="待確認" />
    </div>
    <p style={{ fontSize: 30, color: muted, marginTop: 30 }}>修正後存入 outputs/煮酒論英雄-草稿.md；保留原始筆記</p>
  </Shell>
);

// The mark a teacher would put on the answer: ✓, ?, or ✗.
const GradeMark = ({ kind }: { kind: 'ok' | 'ask' | 'fix' }) => (
  <g>
    <circle cx="232" cy="158" r="26" fill={kind === 'ok' ? okGreen : kind === 'ask' ? amber : muted} />
    {kind === 'ok' ? <TickMark x={232} y={159} size={24} color="#FFFFFF" /> : kind === 'ask' ? <text x="232" y="168" textAnchor="middle" fontSize="28" fontWeight="700" fill="#FFFFFF">?</text> : <CrossMark x={232} y={158} size={18} color="#FFFFFF" />}
  </g>
);

const LoadClarification: Page = () => (
  <Shell chapter={3}>
    <Eyebrow>查證後有三種決定</Eyebrow>
    <Heading>沒證據，和有證據說它錯，是兩回事</Heading>
    <div style={{ marginTop: 20 }}><Lead>像改考卷：對的打勾、看不出來的打問號、錯的訂正</Lead></div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 36, marginTop: 36 }}>
      <In i={0} style={{ display: 'grid' }}><MiniMap label="原文支持" caption="保留：畫成實線" alt="劉備和曹操之間是實線「談論英雄」，打勾">
        <line x1="118" y1="70" x2="346" y2="70" stroke={okGreen} strokeWidth="4" />
        <MapPerson x={70} y={70} name="劉備" />
        <MapPerson x={394} y={70} name="曹操" />
        <text x="232" y="52" textAnchor="middle" fontSize="26" fill={muted}>談論英雄</text>
        <GradeMark kind="ok" />
      </MiniMap></In>
      <In i={1} style={{ display: 'grid' }}><MiniMap label="原文不足" caption="待確認：先不畫，另外列出" alt="劉備和曹操之間是虛線「盟友」，打問號">
        <line x1="118" y1="70" x2="346" y2="70" stroke={amber} strokeWidth="4" strokeDasharray="12 10" />
        <MapPerson x={70} y={70} name="劉備" />
        <MapPerson x={394} y={70} name="曹操" />
        <text x="232" y="52" textAnchor="middle" fontSize="26" fill={amber}>盟友</text>
        <GradeMark kind="ask" />
      </MiniMap></In>
      <In i={2} style={{ display: 'grid' }}><MiniMap label="原文明確不符" caption="修正：改回劉備、關羽、張飛" alt="曹操連到桃園結義的線被打叉">
        <line x1="118" y1="70" x2="264" y2="70" stroke={faint} strokeWidth="3" />
        <MapPerson x={70} y={70} name="曹操" />
        <MapBox x={264} y={40} w={180} label="桃園結義" />
        <CrossMark x={191} y={70} size={24} color="#1C1917" />
        <GradeMark kind="fix" />
      </MiniMap></In>
    </div>
    <p style={{ fontSize: 34, lineHeight: 1.5, marginTop: 40 }}>接下來畫圖：<strong style={{ color: amber }}>已確認的關係才畫實線；待確認的主張另列</strong></p>
  </Shell>
);

const SkillSetup: Page = () => (
  <Shell>
    <Eyebrow>課前安裝｜diagram-design</Eyebrow>
    <Heading>安裝 diagram-design，再開一個新 Session</Heading>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 480px', gap: 56, alignItems: 'center', marginTop: 64 }}>
      <Terminal title="在終端機依序輸入" width={1096}>
        <div style={{ fontFamily: mono, fontSize: 25, lineHeight: 2.2, whiteSpace: 'nowrap' }}><span style={{ color: '#8DD4A0' }}>$</span> codex plugin marketplace add cathrynlavery/diagram-design<br /><span style={{ color: '#8DD4A0' }}>$</span> codex plugin add diagram-design@diagram-design</div>
      </Terminal>
      <div style={{ background: sage, padding: '34px 40px', fontSize: 31, lineHeight: 1.7 }}>1. 加入 Skill 來源<br />2. 安裝 diagram-design<br />3. 開一個新 Session</div>
    </div>
    <div style={{ marginTop: 56 }}><Lead>安裝後重新啟動 Session，以載入新增的 Skill</Lead></div>
    <p style={{ fontSize: 24, color: quiet, marginTop: 24 }}>來源：diagram-design 官方安裝說明（github.com/cathrynlavery/diagram-design）</p>
  </Shell>
);

// One step of the Graph exercise, from reading the notes to opening the file.
const FlowNode = ({ x, title, sub, fill = '#FFFFFF', stroke = rule }: { x: number; title: string; sub: string; fill?: string; stroke?: string }) => (
  <g>
    <rect x={x} y="10" width="276" height="120" fill={fill} stroke={stroke} strokeWidth="2" />
    <text x={x + 138} y="62" textAnchor="middle" fontSize="32" fontWeight="600" fill="#1C1917">{title}</text>
    <text x={x + 138} y="104" textAnchor="middle" fontSize="24" fill={quiet}>{sub}</text>
  </g>
);

const DiagramTask: Page = () => (
  <Shell chapter={4} enterChapter>
    <PracticeEyebrow time="12 分鐘製作＋7 分鐘核對">練習 3｜必做關係圖</PracticeEyebrow>
    <Heading>先完成一張每條線都有依據的關係圖</Heading>
    <div style={{ marginTop: 20 }}><Lead>像請人代畫海報：先看草稿，你點頭才印出來</Lead></div>
    <div style={{ marginTop: 56 }}><SmallLabel>它先提設計，你點頭才存檔</SmallLabel></div>
    <div style={{ marginTop: 12 }}>
      <Figure h={140} label="流程：讀筆記、提出設計、你確認、存成 HTML、拖進瀏覽器">
        <InG i={0}><FlowNode x={0} title="讀筆記" sub="六份筆記＋草稿" /></InG>
        <InG i={1}><MapArrow x1={282} x2={333} y={70} /><FlowNode x={339} title="提出設計" sub="先給你看" /></InG>
        <InG i={2}><MapArrow x1={621} x2={672} y={70} /><FlowNode x={678} title="你確認" sub="沒問題再寫入" fill={amberSoft} stroke={amber} /></InG>
        <InG i={3}><MapArrow x1={960} x2={1011} y={70} /><FlowNode x={1017} title="存成 HTML" sub="三國故事.html" /></InG>
        <InG i={4}><MapArrow x1={1299} x2={1350} y={70} /><FlowNode x={1356} title="拖進瀏覽器" sub="從 Finder／檔案總管" fill={sage} stroke={okGreen} /></InG>
      </Figure>
    </div>
    <In i={5} style={{ background: '#FFFFFF', border: `1px solid ${rule}`, borderLeft: `5px solid ${amber}`, padding: '24px 34px', marginTop: 48, fontSize: 32 }}>提示詞：打開 <Path size={30}>prompts.md</Path> 的「練習 3」，整段複製貼上</In>
    <In i={6} style={{ fontSize: 30, color: muted, marginTop: 24 }}>檢查重點：劉備只畫一次、每條線附來源、待確認的另外列</In>
  </Shell>
);

const DiagramCheck: Page = () => (
  <Shell chapter={4}>
    <Eyebrow>練習 3｜打開 HTML，逐線檢查</Eyebrow>
    <Heading>選一條線，說清楚它的意思和證據</Heading>
    <div style={{ marginTop: 26 }}><LargeStoryGraph height={390} /></div>
    <div style={{ display: 'grid', gridTemplateColumns: '440px 1fr', gap: 30, marginTop: 22, background: sage, padding: '20px 28px' }}>
      <div><div style={{ fontSize: 31, fontWeight: 600 }}>劉備 → 煮酒論英雄</div><div style={{ fontSize: 27, marginTop: 12 }}>線的意思：參與對話</div></div>
      <div><div style={{ fontSize: 25, color: muted }}>來源：notes/煮酒論英雄.md｜第 21 回</div><div style={{ fontSize: 28, lineHeight: 1.5, marginTop: 10 }}>「曹操與劉備在煮酒論英雄的情節中談論誰是英雄」</div></div>
    </div>
    <p style={{ fontSize: 27, color: muted, marginTop: 18 }}>開圖：HTML 拖進瀏覽器｜查證：用文字編輯器打開來源 .md，每條線都照此核對</p>
  </Shell>
);

// An event card standing on the chapter axis.
const TimelineCard = ({ x, chapter, title, color, tint, children }: { x: number; chapter: string; title: string; color: string; tint: string; children: React.ReactNode }) => (
  <g>
    <rect x={x} y="20" width="400" height="150" fill={tint} />
    <rect x={x} y="20" width="400" height="4" fill={color} />
    <text x={x + 30} y="64" fontSize="26" fill={color}>{chapter}</text>
    <text x={x + 30} y="114" fontSize="40" fontWeight="600" fill="#1C1917">{title}</text>
    <text x={x + 30} y="154" fontSize="28" fill="#1C1917">{children}</text>
    <line x1={x + 200} y1="170" x2={x + 200} y2="226" stroke={color} strokeWidth="3" />
    <circle cx={x + 200} cy="232" r="11" fill={color} />
  </g>
);

const TIMELINE_BOX = { width: '100%', height: 290, position: 'absolute', inset: 0 } as const;

const StoryTimeline: Page = () => (
  <Shell>
    <Eyebrow>附錄｜加分練習，先完成關係圖</Eyebrow>
    <Heading>關係圖看關係，時間軸看先後</Heading>
    <div style={{ marginTop: 48, background: '#FFFFFF', border: `1px solid ${rule}`, padding: '30px 44px' }}>
      <SmallLabel>依小說回目排列，不是歷史年份；間距不代表時間長短</SmallLabel>
      <div style={{ position: 'relative', height: 290, marginTop: 16 }}>
        <Steps>
          <svg viewBox="0 0 1542 290" style={TIMELINE_BOX} role="img" aria-label="回目時間軸：第 1 回桃園結義，劉備、關羽、張飛">
            <line x1="20" y1="232" x2="1500" y2="232" stroke={faint} strokeWidth="3" />
            <polygon points="1520,232 1504,224 1504,240" fill={faint} />
            <text x="1520" y="280" textAnchor="end" fontSize="24" fill={quiet}>小說回目 →</text>
            <TimelineCard x={160} chapter="先｜第 1 回" title="桃園結義" color={amber} tint={amberSoft}><tspan fill={amber} fontWeight="700">劉備</tspan>、關羽、張飛</TimelineCard>
          </svg>
          <Step duration={STEP_MS}><svg viewBox="0 0 1542 290" style={TIMELINE_BOX} role="img" aria-label="第 21 回煮酒論英雄，曹操、劉備">
            <TimelineCard x={980} chapter="後｜第 21 回" title="煮酒論英雄" color={okGreen} tint={sage}>曹操、<tspan fill={amber} fontWeight="700">劉備</tspan></TimelineCard>
          </svg></Step>
        </Steps>
      </div>
    </div>
    <p style={{ fontSize: 32, color: muted, lineHeight: 1.6, marginTop: 30 }}>同一個劉備出現在兩件事裡；事件先後，要回到各自的來源回目核對</p>
    <Steps><Step duration={STEP_MS}><div style={{ background: surface, borderLeft: `4px solid ${amber}`, padding: '18px 26px', fontSize: 30, marginTop: 20 }}>關係圖核對完成後，用 prompts.md 的加分提示詞加上時間軸</div></Step></Steps>
  </Shell>
);

// ---------- Closing: back to the story, then to the classroom ----------

const OutputFile = ({ path, title, detail }: { path: string; title: string; detail: string }) => (
  <div style={{ background: '#FFFFFF', border: `1px solid ${rule}`, borderTop: `3px solid ${amber}`, padding: '32px 32px' }}>
    <div style={{ fontFamily: mono, fontSize: 24, color: quiet }}>{path}</div>
    <div style={{ fontSize: 44, fontWeight: 600, marginTop: 14 }}>{title}</div>
    <div style={{ fontSize: 28, color: muted, marginTop: 10 }}>{detail}</div>
  </div>
);

const Reflect = ({ children }: { children: React.ReactNode }) => (
  <div style={{ background: surface, padding: '26px 32px', fontSize: 32 }}>{children}</div>
);

const Reflection: Page = () => (
  <Shell>
    <Eyebrow>回顧今天的成果</Eyebrow>
    <Heading>保留原始筆記，再做出草稿和知識圖</Heading>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', columnGap: 56, alignItems: 'center', marginTop: 72 }}>
      <Steps>
        <OutputFile path="notes/煮酒論英雄.md" title="原始筆記" detail="保留查證依據" />
        <Step duration={STEP_MS}><ArrowCell gap={56}><OutputFile path="outputs/…-草稿.md" title="文字草稿" detail="每條關係都核對過" /></ArrowCell></Step>
        <Step duration={STEP_MS}><ArrowCell gap={56}><OutputFile path="diagrams/" title="知識圖" detail="人物、事件與來源一起看" /></ArrowCell></Step>
      </Steps>
    </div>
    <Steps>
      <Step duration={STEP_MS}>
        <div style={{ marginTop: 72 }}><SmallLabel>交出去之前，問自己四個問題</SmallLabel></div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 18 }}>
          <div className="atl-build" style={buildDelay(0)}><Reflect>我真的懂了，還是只是看過？</Reflect></div>
          <div className="atl-build" style={buildDelay(1)}><Reflect>草稿有沒有保留原文的重點？</Reflect></div>
          <div className="atl-build" style={buildDelay(2)}><Reflect>沒有背景的人，看得懂這張圖嗎？</Reflect></div>
          <div className="atl-build" style={buildDelay(3)}><Reflect>哪條關係還要回筆記或小說確認？</Reflect></div>
        </div>
      </Step>
    </Steps>
  </Shell>
);

// One stop on the "who does it" scale, from AI-first to you-first.
const ShareStop = ({ cx, who, label, title, example, color, tint, round = false }: { cx: number; who: string; label: string; title: string; example: string; color: string; tint: string; round?: boolean }) => (
  <g>
    <text x={cx} y="30" textAnchor="middle" fontSize="25" fontWeight="600" fill={quiet}>{label}</text>
    {round
      ? <circle cx={cx} cy="82" r="34" fill={tint} stroke={color} strokeWidth="2" />
      : <rect x={cx - 80} y="50" width="160" height="64" fill={tint} stroke={color} strokeWidth="2" />}
    <text x={cx} y="93" textAnchor="middle" fontSize="30" fontWeight="600" fill="#1C1917">{who}</text>
    <line x1={cx} y1="116" x2={cx} y2="146" stroke={color} strokeWidth="3" />
    <circle cx={cx} cy="160" r="15" fill={color} stroke="#FFFFFF" strokeWidth="4" />
    <text x={cx} y="245" textAnchor="middle" fontSize="38" fontWeight="600" fill="#1C1917">{title}</text>
    <text x={cx} y="292" textAnchor="middle" fontSize="26" fill={muted}>{example}</text>
  </g>
);

const SHARE_BOX = { width: '100%', height: 320, position: 'absolute', inset: 0 } as const;

const TeachingCheck: Page = () => (
  <Shell>
    <PracticeEyebrow time="3 分鐘">把它帶回教學現場</PracticeEyebrow>
    <Heading>你會把哪一步交給 AI？</Heading>
    <div style={{ position: 'relative', height: 320, marginTop: 70 }}>
      <Steps>
        <svg viewBox="0 0 1632 320" style={SHARE_BOX} role="img" aria-label="由 AI 先做到自己確認的分工軸：整理資料交給 AI 先做">
          <defs><linearGradient id="atl-share-bar" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stopColor={okGreen} /><stop offset="1" stopColor={amber} /></linearGradient></defs>
          <rect x="60" y="156" width="1512" height="8" fill="url(#atl-share-bar)" opacity="0.55" />
          <text x="60" y="200" fontSize="24" fill={quiet}>AI 做得多</text>
          <text x="1572" y="200" textAnchor="end" fontSize="24" fill={quiet}>你把關得多</text>
          <ShareStop cx={272} who="AI" label="AI 可以先做" title="整理資料" example="例：把六份筆記整理成比較表" color={okGreen} tint={sage} />
        </svg>
        <Step duration={STEP_MS}><svg viewBox="0 0 1632 320" style={SHARE_BOX} role="img" aria-label="和 AI 一起調整：排知識圖版面">
          <ShareStop cx={816} who="AI＋你" label="和 AI 一起調整" title="排知識圖版面" example="例：調整人物、事件的位置與連線" color={faint} tint={surface} />
        </svg></Step>
        <Step duration={STEP_MS}><svg viewBox="0 0 1632 320" style={SHARE_BOX} role="img" aria-label="一定要自己確認：回原文查證">
          <ShareStop cx={1360} who="你" label="一定要自己確認" title="回原文查證" example="例：核對人物關係與小說回目" color={amber} tint={amberSoft} round />
        </svg></Step>
      </Steps>
    </div>
    <div style={{ marginTop: 60 }}><Lead>選一份自己的教材，和旁邊的人說：你會請 AI 整理什麼？哪條關係需要查證？</Lead></div>
  </Shell>
);

const TakeItem = ({ n, label, children }: { n: string; label: string; children: React.ReactNode }) => (
  <div style={{ display: 'grid', gridTemplateColumns: '44px 1fr', gap: 22, alignItems: 'start', borderTop: `1px solid ${rule}`, paddingTop: 20 }}>
    <NumDot n={n} />
    <div>
      <SmallLabel>{label}</SmallLabel>
      <div style={{ marginTop: 8 }}>{children}</div>
    </div>
  </div>
);

const Takeaway: Page = () => (
  <Shell>
    <Eyebrow>教材與下一步</Eyebrow>
    <Heading>把今天的做法帶回自己的教材</Heading>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 72, alignItems: 'center', marginTop: 58 }}>
      <div style={{ display: 'grid', gap: 30 }}>
        <In i={0}><TakeItem n="1" label="課前準備"><Path size={29}>examples/teacher-learning-lab/prework.md</Path></TakeItem></In>
        <In i={1}><TakeItem n="2" label="三次練習的完整提示詞"><Path size={29}>examples/teacher-learning-lab/prompts.md</Path></TakeItem></In>
        <In i={2}><TakeItem n="3" label="下一篇｜Obsidian"><div style={{ fontSize: 30 }}>把人物、事件保存成互相連結的知識卡</div></TakeItem></In>
      </div>
      <In i={3} style={{ textAlign: 'center' }}><img src={repoQr} alt="課程 GitHub 資料夾 QR code" style={{ width: 340, height: 340, display: 'block' }}/><div style={{ fontSize: 25, color: muted, marginTop: 16 }}>github.com/Chrouos/AI-workshop-slides</div></In>
    </div>
  </Shell>
);


const ExitTicket: Page = () => (
  <Shell top={150}>
    <Eyebrow>最後一分鐘｜寫在自己的筆記</Eyebrow>
    <Heading>圖上的哪一條關係，你親自查證過？</Heading>
    <div style={{ marginTop: 60, display: 'grid', gap: 28, fontSize: 37, lineHeight: 1.5 }}><In i={0}><NumLine n="1" size={37}>我查證的關係是什麼？</NumLine></In><In i={1}><NumLine n="2" size={37}>哪份筆記、哪一句支持它？</NumLine></In><In i={2}><NumLine n="3" size={37}>換成自己的教材，我會先查哪條關係？</NumLine></In></div>
    <In i={4} style={{ marginTop: 64, borderTop: `2px solid ${amber}`, paddingTop: 28, fontSize: 42, color: amber }}>AI 畫出的每一條關係，都要回原文找證據</In>
  </Shell>
);

// ---------- Picture helpers ----------
// Pictures are drawn 1:1 on the 1920×1080 canvas, so SVG font sizes are real pixel sizes.
const Figure = ({ w = 1632, h, label, children }: { w?: number; h: number; label: string; children: React.ReactNode }) => (
  <svg viewBox={`0 0 ${w} ${h}`} style={{ display: 'block', width: w, height: h }} role="img" aria-label={label}>{children}</svg>
);

// A sheet of paper with a folded corner: a note, a file, an output.
const DocShape = ({ x, y, w, h, fill = '#FFFFFF', stroke = rule, sw = 2 }: { x: number; y: number; w: number; h: number; fill?: string; stroke?: string; sw?: number }) => (
  <g>
    <path d={`M${x} ${y} H${x + w - 24} L${x + w} ${y + 24} V${y + h} H${x} Z`} fill={fill} stroke={stroke} strokeWidth={sw} />
    <path d={`M${x + w - 24} ${y} V${y + 24} H${x + w}`} fill="none" stroke={stroke} strokeWidth={sw} />
  </g>
);

const TickMark = ({ x, y, size = 30, color = okGreen }: { x: number; y: number; size?: number; color?: string }) => (
  <path d={`M${x - size / 2} ${y} l${size * 0.35} ${size * 0.35} l${size * 0.65} ${-size * 0.7}`} fill="none" stroke={color} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
);

const CrossMark = ({ x, y, size = 26, color = muted }: { x: number; y: number; size?: number; color?: string }) => (
  <path d={`M${x - size / 2} ${y - size / 2} L${x + size / 2} ${y + size / 2} M${x + size / 2} ${y - size / 2} L${x - size / 2} ${y + size / 2}`} stroke={color} strokeWidth="5" strokeLinecap="round" />
);

// Multi-line SVG text.
const SvgLines = ({ x, y, lines, size = 26, fill = muted, anchor = 'middle' }: { x: number; y: number; lines: string[]; size?: number; fill?: string; anchor?: 'start' | 'middle' | 'end' }) => (
  <text x={x} y={y} fontSize={size} fill={fill} textAnchor={anchor}>
    {lines.map((line, i) => <tspan key={i} x={x} dy={i === 0 ? 0 : size * 1.45}>{line}</tspan>)}
  </text>
);

// Small inline status line: a tick or a cross, then the words.
const StatusLine = ({ ok, children }: { ok: boolean; children: React.ReactNode }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 28, color: ok ? 'var(--osd-text)' : muted }}>
    <svg viewBox="0 0 36 36" style={{ width: 36, height: 36, flexShrink: 0 }} aria-hidden="true">{ok ? <TickMark x={18} y={20} size={24} /> : <CrossMark x={18} y={18} size={18} />}</svg>
    <span>{children}</span>
  </div>
);

// Three small maps, one per subject. Each marks one line with "?" — the line the
// audience would check against the textbook.
const MiniMap = ({ label, caption, alt, children }: { label: string; caption: string; alt: string; children: React.ReactNode }) => (
  <div style={{ background: '#FFFFFF', border: `1px solid ${rule}`, padding: '26px 28px 24px', boxSizing: 'border-box' }}>
    <SmallLabel>{label}</SmallLabel>
    <svg viewBox="0 0 464 200" style={{ display: 'block', width: '100%', height: 'auto', marginTop: 14 }} role="img" aria-label={alt}>{children}</svg>
    <div style={{ fontSize: 29, lineHeight: 1.4, marginTop: 10 }}>{caption}</div>
  </div>
);

const MapPerson = ({ x, y, name }: { x: number; y: number; name: string }) => (
  <g><circle cx={x} cy={y} r="48" fill={amberSoft} stroke={amber} strokeWidth="2" /><text x={x} y={y + 11} textAnchor="middle" fontSize="30" fill="#1C1917">{name}</text></g>
);

const MapBox = ({ x, y, w = 120, label, fill = surface, stroke = rule }: { x: number; y: number; w?: number; label: string; fill?: string; stroke?: string }) => (
  <g><rect x={x} y={y} width={w} height="60" fill={fill} stroke={stroke} strokeWidth="2" /><text x={x + w / 2} y={y + 41} textAnchor="middle" fontSize="30" fill="#1C1917">{label}</text></g>
);

const MapArrow = ({ x1, x2, y, hot = false }: { x1: number; x2: number; y: number; hot?: boolean }) => (
  <g fill={hot ? amber : faint} stroke={hot ? amber : faint}><line x1={x1} y1={y} x2={x2 - 12} y2={y} strokeWidth={hot ? 4 : 3} /><polygon points={`${x2},${y} ${x2 - 14},${y - 8} ${x2 - 14},${y + 8}`} strokeWidth="0" /></g>
);

const AskMark = ({ x, y }: { x: number; y: number }) => (
  <g><circle cx={x} cy={y} r="18" fill={amber} /><text x={x} y={y + 9} textAnchor="middle" fontSize="26" fontWeight="700" fill="#FFFFFF">?</text></g>
);

const TeacherTransfer: Page = () => (
  <Shell>
    <Eyebrow>知識概念的基本觀念，就是點與線</Eyebrow>
    <Heading>知識圖 ( Knowledge Graph)</Heading>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 36, marginTop: 52 }}>
      <Steps>
        <MiniMap label="國文｜三國故事" caption="人物和事件怎麼連起來" alt="劉備和關羽都連到桃園結義，關羽那條線打上問號">
          <path d="M100 86 L196 136" stroke={faint} strokeWidth="3" />
          <path d="M364 86 L268 136" stroke={amber} strokeWidth="4" />
          <MapPerson x={70} y={52} name="劉備" />
          <MapPerson x={394} y={52} name="關羽" />
          <MapBox x={152} y={136} w={160} label="桃園結義" fill={sage} stroke={okGreen} />
          <AskMark x={316} y={111} />
        </MiniMap>
        <Step duration={STEP_MS}>
          <MiniMap label="歷史｜一個單元" caption="事件的前因後果" alt="原因、事件、結果三格相連，事件到結果的箭頭打上問號">
            <MapBox x={0} y={96} label="原因" />
            <MapBox x={172} y={96} label="事件" fill={amberSoft} stroke={amber} />
            <MapBox x={344} y={96} label="結果" />
            <MapArrow x1={124} x2={168} y={126} />
            <MapArrow x1={296} x2={340} y={126} hot />
            <AskMark x={318} y={70} />
          </MiniMap>
        </Step>
        <Step duration={STEP_MS}>
          <MiniMap label="自然｜課本概念" caption="誰吃誰，能量往哪裡走" alt="草、兔子、老鷹的食物鏈，兔子到老鷹的箭頭打上問號">
            <MapBox x={0} y={96} label="草" fill={sage} stroke={okGreen} />
            <MapBox x={172} y={96} label="兔子" fill={sage} stroke={okGreen} />
            <MapBox x={344} y={96} label="老鷹" fill={sage} stroke={okGreen} />
            <MapArrow x1={124} x2={168} y={126} />
            <MapArrow x1={296} x2={340} y={126} hot />
            <AskMark x={318} y={70} />
          </MiniMap>
        </Step>
      </Steps>
    </div>
    <Steps>
      <Step duration={STEP_MS}>
        <div>
          <svg viewBox="0 0 1632 64" style={{ display: 'block', width: 1632, height: 64 }} aria-hidden="true">
            <g fill="none" stroke={amber} strokeWidth="3" strokeDasharray="8 8"><path d="M260 0 C260 40 700 30 760 64" /><path d="M816 0 V64" /><path d="M1372 0 C1372 40 932 30 872 64" /></g>
          </svg>
          <div style={{ width: 1040, margin: '0 auto', boxSizing: 'border-box', border: `2px solid ${amber}`, background: amberSoft, padding: '22px 40px', textAlign: 'center', translate: '0px 13.12px' }}>
            <div style={{ fontSize: 28, color: muted }}>圖看起來不一樣，但是道理是一樣的</div>
            <div style={{ fontSize: 44, lineHeight: 1.35, color: amber, fontWeight: 600, marginTop: 6 }}>其實重點是能夠快速掌握點跟點之間的關聯性</div>
          </div>
        </div>
      </Step>
    </Steps>
  </Shell>
);

// The QR code opens the same ZIP on GitHub; the button downloads the copy bundled with the slides.
const LAB_ZIP_URL = 'https://raw.githubusercontent.com/Chrouos/AI-workshop-slides/main/slides/ai-for-teacher-learners/assets/teacher-learning-lab.zip';

// One note file in the practice folder.
const FolderNote = ({ x, name }: { x: number; name: string }) => (
  <g>
    <DocShape x={x} y={72} w={120} h={120} />
    <text x={x + 60} y={141} textAnchor="middle" fontSize="23" fill="#1C1917">{name}</text>
  </g>
);

const ReadyDesk: Page = () => (
  <Shell chapter={1}>
    <Eyebrow>準備開始操作</Eyebrow>
    <Heading>下載並打開練習資料夾</Heading>
    <div style={{ marginTop: 20 }}><Lead>像上課前，大家先把課本翻到同一頁</Lead></div>
    <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 48, marginTop: 36 }}>
      <In i={0} style={{ background: amberSoft, borderTop: `5px solid ${amber}`, padding: '20px 24px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: 30, fontWeight: 600 }}>掃碼下載練習資料夾</div>
        <a href={LAB_ZIP_URL} target="_blank" rel="noreferrer" aria-label="開啟 GitHub 上的練習資料夾 ZIP">
          <img src={labQr} alt="練習資料夾 ZIP 的 GitHub 下載 QR code" style={{ width: 260, height: 260, display: 'block', margin: '14px auto 0' }} />
        </a>
        <a href={labZip} download="teacher-learning-lab.zip" style={{ display: 'inline-block', marginTop: 16, padding: '8px 20px', background: amber, color: '#FFFFFF', fontSize: 25, fontWeight: 600, textDecoration: 'none' }}>或按這裡下載 ZIP ↓</a>
      </In>
      <div>
        <div style={{ display: 'grid', gap: 14 }}>
          <In i={1}><NumLine n="1" size={32}>掃 QR code，或按下載按鈕</NumLine></In>
          <In i={2}><NumLine n="2" size={32}>解壓縮，得到 <Path size={30}>teacher-learning-lab</Path> 資料夾</NumLine></In>
          <In i={3}><NumLine n="3" size={32}>打開它，確認看得到下面這些檔案</NumLine></In>
        </div>
        <div style={{ marginTop: 28 }}>
          <Figure w={1204} h={246} label="teacher-learning-lab 資料夾裡有 notes/ 六份筆記，和三次練習用的 prompts.md">
            <path d="M0 50 V12 H400 L430 50 H1204 V240 H0 Z" fill="#FFFFFF" stroke={amber} strokeWidth="2" strokeDasharray="10 8" />
            <text x="22" y="40" fontSize="26" fontWeight="600" fontFamily={mono} fill="#1C1917">teacher-learning-lab/</text>
            <InG i={4}><FolderNote x={30} name="劉備" /></InG>
            <InG i={4}><FolderNote x={168} name="關羽" /></InG>
            <InG i={4}><FolderNote x={306} name="張飛" /></InG>
            <InG i={5}><FolderNote x={444} name="曹操" /></InG>
            <InG i={5}><FolderNote x={582} name="桃園結義" /></InG>
            <InG i={5}><FolderNote x={720} name="煮酒論英雄" /></InG>
            <text x="435" y="226" textAnchor="middle" fontSize="25" fill={muted}><tspan fontFamily={mono}>notes/</tspan>　六份筆記</text>
            <line x1="890" y1="72" x2="890" y2="200" stroke={rule} strokeWidth="2" strokeDasharray="8 8" />
            <InG i={6}>
              <DocShape x={940} y={72} w={200} h={120} fill={amberSoft} stroke={amber} />
              <text x="1040" y="141" textAnchor="middle" fontSize="25" fill="#1C1917">練習提示詞</text>
              <text x="1040" y="226" textAnchor="middle" fontSize="25" fontFamily={mono} fill={muted}>prompts.md</text>
            </InG>
          </Figure>
        </div>
      </div>
    </div>
    <In i={7} style={{ background: surface, padding: '20px 32px', marginTop: 28, fontSize: 30 }}><strong>還沒裝好 Codex？</strong>改用 ChatGPT 上傳 notes/ 的六份筆記，一樣可以練習</In>
  </Shell>
);

const Appendix: Page = () => (
  <Shell top={170}>
    <Eyebrow>附錄｜課前準備與操作查詢</Eyebrow>
    <div style={{ marginTop: 60 }}><Title>安裝、設定與延伸</Title></div>
    <div style={{ marginTop: 65, fontSize: 36, lineHeight: 1.9, color: muted }}>講者介紹<br />課前安裝與開啟練習資料夾<br />Status、Skill 安裝與 MCP 補充<br />加分練習：時間軸</div>
    <p style={{ marginTop: 40, color: amber, fontSize: 29 }}>以下頁面供課前閱讀與課後查詢</p>
  </Shell>
);

// One leg of the pre-class route, ending in what you should see when it is done.
const PrepStep = ({ label, title, detail, done }: { label: string; title: string; detail: string; done: string }) => (
  <div>
    <SmallLabel>{label}</SmallLabel>
    <div style={{ fontSize: 38, fontWeight: 600, marginTop: 12 }}>{title}</div>
    <div style={{ fontSize: 26, color: muted, lineHeight: 1.45, marginTop: 10, minHeight: 76 }}>{detail}</div>
    <div style={{ background: sage, padding: '12px 18px', marginTop: 18 }}><StatusLine ok>{done}</StatusLine></div>
  </div>
);

const PrepDot = ({ x, n }: { x: number; n: string }) => (
  <g>
    <circle cx={x} cy="30" r="22" fill={amber} stroke="var(--osd-bg)" strokeWidth="6" />
    <text x={x} y="39" textAnchor="middle" fontSize="25" fontWeight="600" fill="#FFFFFF">{n}</text>
  </g>
);

const Prework: Page = () => (
  <Shell>
    <Eyebrow>課前完成｜預留 15–20 分鐘</Eyebrow>
    <Heading>先裝好工具，課堂留給練習</Heading>
    <div style={{ marginTop: 52 }}>
      <Figure h={60} label="三個步驟依序完成，最後準備好上課">
        <line x1="22" y1="30" x2="1490" y2="30" stroke={rule} strokeWidth="4" />
        <polygon points="1506,30 1490,21 1490,39" fill={rule} />
        <PrepDot x={22} n="1" />
        <PrepDot x={582} n="2" />
        <PrepDot x={1142} n="3" />
        <text x="1632" y="40" textAnchor="end" fontSize="26" fontWeight="600" fill={amber}>準備好了</text>
      </Figure>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 48, marginTop: 18 }}>
      <PrepStep label="下載教材" title="解壓縮 ZIP" detail="GitHub → Code → Download ZIP，打開 examples/teacher-learning-lab" done="資料夾打得開" />
      <PrepStep label="安裝 Codex" title="安裝並登入" detail="Node.js 選 LTS，依 prework.md 安裝 Codex" done="帳號可以使用" />
      <PrepStep label="開啟練習" title="看得到六份筆記" detail="完成 Skill 安裝，開啟正確的資料夾" done="試讀一份筆記成功" />
    </div>
    <div style={{ marginTop: 44, fontSize: 29, lineHeight: 1.7 }}>完整指令：examples/teacher-learning-lab/prework.md<br />備用方式：ChatGPT 上傳 notes/ 六份筆記，成果自行下載或存檔</div>
  </Shell>
);

const McpAppendix: Page = () => (
  <Shell>
    <Eyebrow>延伸名詞｜本課未使用</Eyebrow>
    <Heading>MCP：讓 AI 連接外部工具與資料</Heading>
    <div style={{ marginTop: 20 }}><Lead>Skill 像食譜，告訴 AI 怎麼做；MCP 像插座，讓 AI 接到外面</Lead></div>
    <div style={{ marginTop: 44 }}>
      <Figure h={340} label="左邊 Skill 工作說明交給 AI；右邊 AI 透過 MCP 連到雲端文件和其他系統">
        <rect x="40" y="90" width="300" height="170" fill={sage} stroke={okGreen} strokeWidth="2" />
        <line x1="66" y1="90" x2="66" y2="260" stroke={okGreen} strokeWidth="2" />
        <text x="203" y="160" textAnchor="middle" fontSize="32" fontWeight="600" fill="#1C1917">Skill</text>
        <text x="203" y="208" textAnchor="middle" fontSize="30" fill="#1C1917">工作說明</text>
        <text x="190" y="315" textAnchor="middle" fontSize="26" fill={muted}>告訴 AI 怎麼做</text>
        <MapArrow x1={350} x2={500} y={175} />
        <rect x="512" y="115" width="220" height="120" fill={amberSoft} stroke={amber} strokeWidth="2" />
        <text x="622" y="190" textAnchor="middle" fontSize="44" fontWeight="600" fill="#1C1917">AI</text>
        <g fill="none" stroke={amber} strokeWidth="4">
          <path d="M732 175 H1000" />
          <path d="M1076 175 H1180 V80 H1300" />
          <path d="M1180 175 V260 H1300" />
        </g>
        <rect x="1000" y="157" width="48" height="36" fill={amber} />
        <line x1="1048" y1="166" x2="1072" y2="166" stroke={amber} strokeWidth="5" />
        <line x1="1048" y1="184" x2="1072" y2="184" stroke={amber} strokeWidth="5" />
        <text x="866" y="150" textAnchor="middle" fontSize="30" fontWeight="600" fill={amber}>MCP</text>
        <text x="866" y="218" textAnchor="middle" fontSize="26" fill={muted}>連接方式</text>
        <rect x="1300" y="40" width="300" height="80" fill={surface} stroke={rule} strokeWidth="2" />
        <text x="1450" y="91" textAnchor="middle" fontSize="30" fill="#1C1917">雲端文件</text>
        <rect x="1300" y="220" width="300" height="80" fill={surface} stroke={rule} strokeWidth="2" />
        <text x="1450" y="271" textAnchor="middle" fontSize="30" fill="#1C1917">其他系統</text>
      </Figure>
    </div>
    <p style={{ fontSize: 32, color: muted, marginTop: 40 }}>今天的來源都在本機 notes/，不需要新增連接</p>
  </Shell>
);

// Page changes: the outgoing page holds, the incoming one rises 6px as it fades in.
// The cover settles in a touch more slowly, with a hair of blur.
const HOLD: Keyframe[] = [{ opacity: 1 }, { opacity: 1 }];

export const transition: SlideTransition = {
  duration: 260,
  exit: { duration: 260, easing: 'cubic-bezier(0.4, 0, 1, 1)', keyframes: HOLD },
  enter: { duration: 260, easing: EASE_OUT, keyframes: [{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'translateY(0)' }] },
};

Cover.transition = {
  duration: 280,
  exit: { duration: 280, easing: 'cubic-bezier(0.4, 0, 1, 1)', keyframes: HOLD },
  enter: { duration: 280, easing: EASE_OUT, keyframes: [{ opacity: 0, transform: 'translateY(12px)', filter: 'blur(4px)' }, { opacity: 1, transform: 'translateY(0)', filter: 'blur(0)' }] },
};

export const meta: SlideMeta = {
  title: '01 認識 AI：從三國故事到知識圖',
  createdAt: '2026-10-01T06:42:21.642Z',
  theme: 'thoughtstream',
};

export const notes: (string | undefined)[] = [
  "0:00–0:20。今天只做一件事：把幾份筆記整理成每條關係都能核對的知識圖。完整講者介紹移到附錄，開場直接進故事。",
  "0:20–1:20。假設你有100篇三國筆記，想找劉備跟誰有關，你會逐篇翻嗎？今天先用六份短筆記練習，請AI讀、整理、畫圖。問題是畫出來的線真的都對嗎？插畫只是小說情境，不能當作關係的證據；證據在筆記及其小說來源。",
  "1:20–2:00。先出現劉備；點一下依序出現其他人物，再點一下接到桃園結義，最後接上煮酒論英雄。每個人物都可以寫成獨立筆記；線要寫清楚是什麼關係。劉備只畫一次，兩段故事接在同一個節點。這堂課成果是可核對的圖，不是已經建好完整知識庫。採用使用者註解中的節點與線說法。",
  "2:00–3:10。延續上一頁的圖，先問一個具體問題：桃園結義有哪些人？點一下出現教學用錯答，先請大家找出多了誰。下一次點擊才指出故事沒有曹操，再命名：AI把錯誤或無根據內容當成事實說出來，這叫幻覺。這是示意，不是實際模型測試。最後問：如果先找到原文再回答呢？轉到下一頁RAG。小說來源：https://zh.wikisource.org/wiki/三國演義/第001回",
  "3:10–4:10。只講核心：同樣問桃園有哪些人，先找到筆記，再把問題和相關筆記交給AI，產生回答。先出現問題和六份筆記；按一下交給AI，再按一下產生回答，最後一下出現提醒。不逐字解釋英文。就像開書考，先翻到那一頁再作答，可能降低無根據回答，但仍要核對來源。本課Codex讀本機筆記，是示範類似RAG的先取得資料再回答概念，不是建置完整RAG系統。全名供課後查閱，不考術語。來源：https://arxiv.org/abs/2005.11401 、https://arxiv.org/abs/2312.10997",
  "4:10–4:40。把剛才先找資料再回答的方法帶回課堂。國文畫人物和事件；按一下，歷史畫前因後果；再按一下，自然畫草、兔子、老鷹的食物鏈。三張圖長得不一樣，再按一下，問的是同一件事：打問號的這條線，課文哪一句有寫？來源換成有授權的教材。先想一份自己的教材，最後再分享。",
  "4:40–5:00。只說大方向：今天分四段，每段結束手上多一樣東西。理解任務，帶走一個要查的問題；8到20分讀筆記，做出一張關係表；20到35分查證，留下核對過的草稿；35分以後畫成知識圖，最後5分鐘換成自己的教材想一想。接著用30秒口頭說明：ChatGPT可上傳筆記討論，今天用Codex直接讀練習資料夾並交出圖檔；不再展示比較表。",
  "5:00–8:00。像上課前大家先把課本翻到同一頁。請大家掃QR code，或在簡報上按下載按鈕，取得練習資料夾的ZIP；解壓縮後打開teacher-learning-lab，確認看得到notes/裡的六份筆記和prompts.md。QR code連到GitHub上的同一份ZIP。用Codex的人，在這個資料夾裡啟動codex，AI會從這裡開始讀。課前還沒裝好的人，直接用ChatGPT上傳六份筆記，或跟旁邊的人一起看，現場不處理安裝問題。8分鐘開始第一個練習。",
  "8:00–9:00。正式進入練習一區段。確認notes/有四人物兩事件的六份筆記，不含README。打開一份看內容，接下來先看單篇提示詞範例，再擴到六篇。",
  "9:00–10:00。讓大家先選A或B，用一個理由說明。B像一張學習單，看哪裡、交什麼、什麼不能做三格都寫了；A三格都空著。這一頁只讀桃園結義，是單篇示範；下一頁正式練習才擴大讀六份，範圍改變但仍要列依據、先不改檔。",
  "10:00–15:00。練習5分鐘。打開prompts.md練習1，正式讀六份故事筆記，不含README，表格只有四欄：筆記名稱、相關人物、關係說明、依據句子。先不要改檔。確認它真的讀了六份，再自己開一份對照。",
  "15:00–20:00。留5分鐘讓較慢者完成，並挑一列分享來源。像寫報告附出處：檔名讓人找得到，原句讓人核對得了。這是完整表的兩列節錄，包含原句與來源，每人至少指出一條原句。劉備參與兩事件，不代表所有參與者都是同一種關係。接著精讀煮酒論英雄。",
  "20:00–25:00。練習5分鐘，像先在黑板上打草稿。只讀煮酒論英雄.md，用純文字排出參與人物、事件、關係與回目。先顯示草稿，不存檔。即使AI沒出錯，下一頁的教學草稿也能練習區分原文和推論。",
  "25:00–26:00。先請學員說出自己的草稿，再展示這份教學示意。坐同一桌吃飯，不代表是同一隊。人物對、事件對，但盟友是新推論。不要把缺乏支持直接說成歷史上的反命題；我們現在只問這份筆記能否支持這條線。AI實際輸出不一定相同；沒有錯誤時也用這個示例練習。",
  "26:00–34:00。練習8分鐘：開自己的筆記，逐條對照，不只請AI自我檢查。兩人談論英雄有原句支持；盟友沒有。可保留在待確認區，但不能當成已確認連線。每人指出一條支持句與一個不能從句子推得的結論。確認後存outputs/煮酒論英雄-草稿.md，notes來源保留。",
  "34:00–35:00。一分鐘收束：像改考卷，對的打勾、看不出來的打問號、錯的訂正。支持就保留，資料不足標待確認，原文明確不符就修正。盟友不是被這份筆記證明錯誤，而是沒有足夠依據。這個區分比只找明顯錯字更接近日常AI使用。下一步只把已支持關係畫成實線。",
  "35:00–48:00。像請人代畫海報：先看草稿，你點頭才印出來。13分鐘只做必做的關係圖：四人物兩事件、每條線有來源，存成單檔HTML。提示詞請大家直接從prompts.md練習3整段複製，不用照投影片打字。課前裝好的diagram-design會幫忙排版；沒有它，照提示詞一樣做得出來，不必現場解釋它是什麼。先讓它提出設計，確認後才寫入。確認已寫入後，在Finder／檔案總管找到diagrams/三國故事.html，拖進瀏覽器開啟。",
  "48:00–55:00。留7分鐘開啟、查證與修圖。用文字編輯器打開notes/對應來源筆記，再對每條線問：表示什麼、哪句支持？若瀏覽器點來源後只下載檔案，直接開原本的本機筆記核對。每人至少展示一條來源，依綠色查證卡示範完整說出人物、事件、線的意思、檔名和原句。劉備只出現一次，不能多連曹操到桃園，也不能把共同對話改成盟友。已經核對完的人，可以做附錄的時間軸加分練習；其他人繼續核對關係圖。這7分鐘不提早結束。",
  "55:00–55:30。快速回看三種檔案：來源、核對後草稿、HTML圖。來源與整理分開保存，以便之後修正。不要逐題再討論，留時間給下一頁的教學轉用。",
  "55:30–58:30。3分鐘兩人分享。各選一份自己能使用的教材，說出要整理的關係及查證來源。AI先列關係與排圖，教師確認內容和教學適用性。",
  "58:30–59:00。掃描是課程repo，完整提示詞、課前設定都在examples/teacher-learning-lab，不用照著投影片打字。下一篇Obsidian才練長期保存與擴充知識卡。",
  "59:00–60:00。請每人用自己的成果寫一句完整例子：某個人物參與某事件，哪份筆記哪句支持。再想自己教材的一條關係如何查。這一分鐘不再介紹工具，以回原文找證據收尾。",
  "主線已在前一頁60分鐘結束。以下附錄不逐頁講解。課前把prework.md寄給學員，現場僅用必要頁排除問題。",
  "我是黃懷萱，中央大學碩士，研究 NLP、LLM 和 RAG；現在在關貿網路做智慧客服，參與 EZ WAY、eHub、TTLL 等服務。今天用大家聽過的三國人物，實際試一次 Agent 如何讀筆記、核對並畫圖。",
  "課前預留15–20分鐘，不含帳號或網路問題排除。教學單位先確認帳號、網路和資料使用規範。當天若尚未完成就用備用方式或與同伴共用已準備環境。技術指令以課前文件及工具官方說明為準。",
  '事前準備已經讓終端機停在課程資料夾的最上層，也就是 AI-workshop-slides（ZIP 版叫 AI-workshop-slides-main）。在這裡輸入 cd examples/teacher-learning-lab，走進練習資料夾，再輸入 codex 叫醒它。第一次啟動依畫面登入 ChatGPT 帳號。',
  '暖身 2：交辦更多事之前，輸入 /status 查環境。框起來的兩行最重要：Directory 是它在哪工作，Permissions 是它能做哪些事、要不要先問你。右邊表格供課前及課後查詢，主線只確認工作位置與操作權限。',
  '練習 3：裝上 diagram-design 這張食譜。依官方說明加入 marketplace 並安裝 plugin，再開一個新的 Codex Session，新的 Session 才讀得到它。官方來源：https://github.com/cathrynlavery/diagram-design',
  "課後延伸，60分鐘主線不講。Skill像食譜，MCP像插座。MCP是一種連接AI應用與外部工具、資料的協定；Skill是工作說明，兩者功能不同並非步驟先後。",
  "附錄的加分練習，主線不講。給已經核對完關係圖的人做：時間軸依小說第1回、第21回排先後，不是歷史年份，間距也不代表經過多久。提示詞在prompts.md的加分段落，不要求全班完成。"
];

export default [
  Cover, StoryStart, ResultFirst, WrongAnswer, RagFlow, TeacherTransfer, Agenda, ReadyDesk, LabOverview, PromptChoice, ScanTask, ScanOutput, AsciiTask, AsciiDraft, CheckOriginal, LoadClarification, DiagramTask, DiagramCheck, Reflection, TeachingCheck, Takeaway, ExitTicket,
  // Appendix: outside the 60-minute teaching route
  Appendix, SpeakerIntro, Prework, OpenProject, StatusScreen, SkillSetup, McpAppendix, StoryTimeline,
] satisfies Page[];
