import type { DesignSystem, Page, SlideMeta } from '@open-slide/core';
import { Step, Steps, useIsActivePage, useSlidePageNumber } from '@open-slide/core';
import codexStatus from './assets/codex-cli-status.png';
import repoQr from './assets/repo-qr.svg';
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
    <Eyebrow>三國故事 × AI 協作｜60 分鐘工作坊</Eyebrow>
    <div style={{ marginTop: 64 }}><Title>認識 AI，<br />把筆記整理成知識圖</Title></div>
    <div style={{ marginTop: 56, fontSize: 35, color: muted }}>讀出人物關係，回原文查證，再畫成圖</div>
    <div style={{ marginTop: 42, fontSize: 26, color: quiet }}>黃懷萱｜AI 工程師</div>
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

const Agenda: Page = () => (
  <Shell>
    <Eyebrow>60 分鐘｜安裝已於課前完成</Eyebrow>
    <Heading>讀筆記 → 找關係 → 查證據 → 畫圖</Heading>
    <div style={{ marginTop: 45, borderTop: `1px solid ${rule}` }}>
      {[
        ['00–08', '故事與 AI 概念', '看成果、找錯、理解先找資料再回答'],
        ['08–20', '練習 1｜讀出關係', '確認工作位置 → 六份筆記 → 關係表'],
        ['20–35', '練習 2｜核對推論', '純文字草稿 → 查證 → 存檔'],
        ['35–55', '練習 3｜畫成知識圖', 'Graph 必做、Timeline 加分 → 逐線核對'],
        ['55–60', '帶回教學現場', '換一份教材，說出自己會查證的關係'],
      ].map(([time, title, detail]) => <div key={time} style={{ display: 'grid', gridTemplateColumns: '170px 590px 1fr', alignItems: 'center', minHeight: 106, borderBottom: `1px solid ${rule}` }}><span style={{ fontSize: 28, color: amber }}>{time} 分</span><span style={{ fontSize: 37, fontWeight: 600 }}>{title}</span><span style={{ fontSize: 29, color: muted }}>{detail}</span></div>)}
    </div>
  </Shell>
);

const StoryStart: Page = () => (
  <Shell>
    <Eyebrow>從一段熟悉的故事開始</Eyebrow>
    <Heading>如果有 100 篇三國筆記，你會怎麼找？</Heading>
    <div style={{ display: 'grid', gridTemplateColumns: '940px 1fr', gap: 50, marginTop: 48, alignItems: 'center' }}>
      <div><img src={peachGarden} alt="桃園結義想像插畫：劉備、關羽、張飛在桃樹下舉杯" style={{ width: 940, height: 510, objectFit: 'cover', display: 'block' }} /><div style={{ fontSize: 23, color: quiet, marginTop: 14 }}>《三國演義》桃園結義｜AI 生成的情境插畫</div></div>
      <div style={{ display: 'grid', gap: 34 }}>
        <div style={{ fontSize: 40, lineHeight: 1.5 }}>劉備跟哪些人有關？<br />是在哪一段故事裡？</div>
        <div style={{ borderTop: `2px solid ${amber}`, paddingTop: 28, fontSize: 34, lineHeight: 1.6, color: muted }}>請 AI 讀筆記、整理關係、畫成圖</div>
        <Steps><Step duration={STEP_MS}><div style={{ fontSize: 36, lineHeight: 1.5, color: amber }}>但圖上的每一條線，<br />真的都有根據嗎？</div></Step></Steps>
      </div>
    </div>
  </Shell>
);

const LargeStoryGraph = () => (
  <div style={{ position: 'relative', height: 480, background: '#FFFFFF', border: `1px solid ${rule}` }}>
    <Steps>
      <svg viewBox="0 0 1600 500" style={{ width: '100%', height: 470, position: 'absolute', inset: 0 }} role="img" aria-label="劉備人物節點">
        <circle cx="840" cy="100" r="55" fill={amberSoft} stroke={amber} strokeWidth="2" /><text x="840" y="112" textAnchor="middle" fontSize="35" fill="#1C1917">劉備</text>
      </svg>
      <Step duration={STEP_MS}><svg viewBox="0 0 1600 500" style={{ width: '100%', height: 470, position: 'absolute', inset: 0 }} role="img" aria-label="關羽、張飛、曹操依序出現">
        {[['關羽', 170], ['張飛', 470], ['曹操', 1360]].map(([name, x], i) => <g key={name} className="atl-build" style={buildDelay(i, 0)}><circle cx={Number(x)} cy="100" r="55" fill={surface} stroke={rule} strokeWidth="2" /><text x={Number(x)} y="112" textAnchor="middle" fontSize="35" fill="#1C1917">{name}</text></g>)}
      </svg></Step>
      <Step duration={STEP_MS}><svg viewBox="0 0 1600 500" style={{ width: '100%', height: 470, position: 'absolute', inset: 0 }} role="img" aria-label="桃園結義連到關羽、張飛、劉備">
        <g fill="none" stroke={amber} strokeWidth="4"><path d="M170 155 C170 240 290 260 360 320"/><path d="M470 155 V320"/><path d="M810 147 C790 240 650 280 580 320"/></g>
        <rect x="300" y="320" width="340" height="90" fill={sage} stroke={okGreen} strokeWidth="2"/><text x="470" y="377" textAnchor="middle" fontSize="38" fill="#1C1917">桃園結義</text><text x="470" y="455" textAnchor="middle" fontSize="26" fill={quiet}>三人參與結義｜第 1 回</text>
      </svg></Step>
      <Step duration={STEP_MS}><svg viewBox="0 0 1600 500" style={{ width: '100%', height: 470, position: 'absolute', inset: 0 }} role="img" aria-label="煮酒論英雄連到劉備、曹操">
        <g fill="none" stroke={okGreen} strokeWidth="4"><path d="M870 147 C910 235 1000 270 1050 320"/><path d="M1360 155 C1360 240 1280 275 1220 320"/></g>
        <rect x="970" y="320" width="340" height="90" fill={amberSoft} stroke={amber} strokeWidth="2"/><text x="1140" y="377" textAnchor="middle" fontSize="38" fill="#1C1917">煮酒論英雄</text><text x="1140" y="455" textAnchor="middle" fontSize="26" fill={quiet}>兩人談論英雄｜第 21 回</text>
      </svg></Step>
    </Steps>
  </div>
);

const ResultFirst: Page = () => (
  <Shell>
    <Eyebrow>先看今天的成果</Eyebrow>
    <Heading>人物是節點，關係是線</Heading>
    <div style={{ marginTop: 26 }}><Lead>每個人物各寫一份筆記，透過事件把他們串起來</Lead></div>
    <div style={{ marginTop: 38 }}><LargeStoryGraph /></div>
    <p style={{ fontSize: 28, color: muted, marginTop: 26 }}>這堂課先做可查證的知識圖；下一篇用 Obsidian 保存、連結並擴充這些筆記</p>
  </Shell>
);

// ---------- 01 認識 AI ----------

const WrongAnswer: Page = () => (
  <Shell chapter={1}>
    <Eyebrow>你想知道故事裡有哪些人物</Eyebrow>
    <Heading>你問桃園結義，AI 卻把曹操也算進來</Heading>
    <div style={{ marginTop: 40, display: 'grid', gap: 22 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '165px 1fr', gap: 24, alignItems: 'center', padding: '24px 32px', background: surface }}><SmallLabel>你問</SmallLabel><div style={{ fontSize: 38 }}>「《三國演義》裡，桃園結義有哪些人？」</div></div>
      <Steps>
        <Step duration={STEP_MS}><div style={{ display: 'grid', gridTemplateColumns: '165px 1fr', gap: 24, alignItems: 'start', padding: '24px 32px', background: '#FFFFFF', border: `1px solid ${rule}` }}><SmallLabel>AI 回答</SmallLabel><div><div style={{ fontSize: 37, lineHeight: 1.5 }}>「劉備、關羽、張飛，還有曹操」</div><div style={{ marginTop: 12, fontSize: 24, color: quiet }}>教學用的錯誤回答示意</div></div></div></Step>
        <Step duration={STEP_MS}><div style={{ marginTop: 24, padding: '24px 32px', borderLeft: `4px solid ${amber}`, background: amberSoft }}><div style={{ fontSize: 34 }}>故事裡結義的是劉備、關羽、張飛，沒有曹操</div><div style={{ marginTop: 18, fontSize: 31, color: muted, lineHeight: 1.5 }}><strong style={{ color: amber }}>AI 幻覺（Hallucination）</strong><br />AI 把錯誤或沒有根據的內容，當成事實說出來</div></div></Step>
      </Steps>
    </div>
    <Steps><Step duration={STEP_MS}><div style={{ marginTop: 28, fontSize: 33, color: amber }}>如果先讓它找到故事原文，再回答呢？</div></Step></Steps>
  </Shell>
);

const RagFlow: Page = () => (
  <Shell chapter={1}>
    <Eyebrow>給 AI 可以參考的資料</Eyebrow>
    <Heading>RAG：先找資料，再回答問題</Heading>
    <div style={{ marginTop: 26 }}><Lead>讓 AI 先參考筆記，回答時有資料可依循</Lead></div>
    <div style={{ marginTop: 38, padding: '22px 30px', background: surface, fontSize: 35 }}>問題：桃園結義有哪些人？</div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', columnGap: 52, marginTop: 38 }}>
      <Steps>
        <StepPanel number="1" title="找資料" detail="找到〈桃園結義〉筆記" tint={surface} />
        <Step duration={STEP_MS}><ArrowCell gap={52}><StepPanel number="2" title="交給 AI" detail="問題＋相關筆記" tint={amberSoft} /></ArrowCell></Step>
        <Step duration={STEP_MS}><ArrowCell gap={52}><StepPanel number="3" title="產生回答" detail="劉備、關羽、張飛" tint={sage} /></ArrowCell></Step>
      </Steps>
    </div>
    <p style={{ marginTop: 46, fontSize: 32, color: amber }}>有資料不代表一定正確，仍然需要查證</p>
    <div style={{ marginTop: 28, fontSize: 24, color: quiet }}>RAG = Retrieval-Augmented Generation（檢索增強生成）</div>
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

const Tagged = ({ tag, children }: { tag: string; children: React.ReactNode }) => (
  <div style={{ display: 'grid', gridTemplateColumns: '96px 1fr', gap: 18, alignItems: 'baseline' }}>
    <span style={{ background: amber, color: '#FFFFFF', fontSize: 24, fontWeight: 600, textAlign: 'center', padding: '6px 0' }}>{tag}</span>
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
        <p style={{ fontSize: 36, marginTop: 36 }}>幫我整理三國</p>
        <Steps>
          <Step duration={STEP_MS}><p style={{ fontSize: 26, color: quiet, marginTop: 40 }}>看哪裡？做成什麼？都沒說</p></Step>
        </Steps>
      </div>
      <div style={{ padding: '34px 38px', borderTop: `3px solid ${amber}`, background: amberSoft, boxSizing: 'border-box' }}>
        <SmallLabel>B</SmallLabel>
        <div style={{ display: 'grid', gap: 22, marginTop: 26 }}>
          <Tagged tag="範圍">只讀 <span style={{ fontFamily: mono, fontSize: 28 }}>notes/桃園結義.md</span></Tagged>
          <Tagged tag="產出">列出 3 位人物、1 種關係，附支持的句子</Tagged>
          <Tagged tag="限制">先不要改檔案，也不要加入原筆記沒有的事實</Tagged>
        </div>
      </div>
    </div>
    <Steps>
      <Step duration={STEP_MS}><p style={{ fontSize: 32, color: muted, marginTop: 48 }}>這裡先看單篇示範；下一頁正式練習，再讀六份筆記</p></Step>
    </Steps>
  </Shell>
);

// ---------- 03 整理三國筆記 ----------

const LabOverview: Page = () => (
  <Shell chapter={2}>
    <Eyebrow>同一個故事，分成六份短筆記</Eyebrow>
    <Heading>四個人物、兩件事，先從結義開始</Heading>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24, marginTop: 62 }}>
      <StepPanel number="人物" title="劉備" detail="同時接上兩段故事" tint={amberSoft} />
      <StepPanel number="人物" title="關羽" detail="參與桃園結義" tint={surface} />
      <StepPanel number="人物" title="張飛" detail="參與桃園結義" tint={surface} />
      <StepPanel number="人物" title="曹操" detail="與劉備煮酒論英雄" tint={surface} />
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginTop: 24 }}>
      <StepPanel number="事件｜第 1 回" title="桃園結義" detail="劉備、關羽、張飛" tint={sage} />
      <StepPanel number="事件｜第 21 回" title="煮酒論英雄" detail="曹操、劉備" tint={surface} />
    </div>
    <p style={{ fontSize: 31, color: muted, marginTop: 35 }}>先讀懂桃園結義，再用同一張劉備卡接到另一段故事</p>
  </Shell>
);

const ScanTask: Page = () => (
  <Shell chapter={2}>
    <PracticeEyebrow time="5 分鐘">練習 1｜讀筆記</PracticeEyebrow>
    <Heading>正式練習：從一篇擴大到六份筆記</Heading>
    <div style={{ display: 'grid', gridTemplateColumns: '480px 80px 1fr', alignItems: 'center', marginTop: 64 }}>
      <div style={{ background: surface, padding: '30px 34px' }}>
        <SmallLabel>notes/ 裡的六份筆記</SmallLabel>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 20 }}>
          <Chip size={26}>劉備</Chip><Chip size={26}>關羽</Chip><Chip size={26}>張飛</Chip>
          <Chip size={26}>曹操</Chip><Chip size={26}>桃園結義</Chip><Chip size={26}>煮酒論英雄</Chip>
        </div>
      </div>
      <div style={{ textAlign: 'center' }}><Arrow size={60} /></div>
      <PromptBox>
        <div style={{ fontSize: 32, lineHeight: 1.6, marginTop: 14 }}>請閱讀 notes/ 裡的六份筆記，整理成一張表：</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 18 }}>
          <Chip tint={surface} size={26}>筆記名稱</Chip><Chip tint={surface} size={26}>人物或事件</Chip><Chip tint={surface} size={26}>相關人物</Chip>
          <Chip tint={surface} size={26}>關係說明</Chip><Chip tint={surface} size={26}>依據句子</Chip><Chip tint={surface} size={26}>來源回目</Chip>
        </div>
        <div style={{ fontSize: 30, fontWeight: 600, color: amber, marginTop: 22 }}>先不要修改任何檔案</div>
      </PromptBox>
    </div>
    <p style={{ fontSize: 30, color: muted, marginTop: 52 }}>確認六份筆記皆已列入，且每項關係附有依據</p>
  </Shell>
);

const ScanOutput: Page = () => (
  <Shell chapter={2}>
    <Eyebrow>練習 1｜檢查結果</Eyebrow>
    <Heading>同一個劉備，接在兩段故事裡</Heading>
    <div style={{ marginTop: 44, fontSize: 28, color: amber }}>示範表格節錄：完整表格應列出六份筆記</div>
    <Table marginTop={30}>
      <TRow head cols="280px 160px 400px 1fr" cells={['筆記', '類型', '可核對的關係', '依據']} />
      <TRow cols="280px 160px 400px 1fr" cells={[<strong>桃園結義</strong>, '事件', '劉備、關羽、張飛結義', '桃園結義.md｜第 1 回']} />
      <TRow cols="280px 160px 400px 1fr" cells={[<strong>煮酒論英雄</strong>, '事件', '曹操與劉備談論英雄', '煮酒論英雄.md｜第 21 回']} />
      <TRow cols="280px 160px 400px 1fr" cells={[<strong>劉備</strong>, '人物', '參與上面兩件事', '劉備.md，並回看兩張事件卡']} />
    </Table>
    <p style={{ fontSize: 30, color: muted, marginTop: 42 }}>追問：「為什麼兩件事都有劉備？請列出筆記裡支持的句子。」</p>
  </Shell>
);

const AsciiTask: Page = () => (
  <Shell chapter={3}>
    <PracticeEyebrow time="5 分鐘">練習 2｜出草稿</PracticeEyebrow>
    <Heading>先用文字排出關係，先不要存</Heading>
    <div style={{ maxWidth: 1480, marginTop: 64 }}>
      <PromptBox>
        <div style={{ fontSize: 30, lineHeight: 1.55, marginTop: 14 }}>請只讀 <Path size={26}>notes/煮酒論英雄.md</Path>，用 ASCII（純文字）排出：</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 18 }}>
          <Chip tint={surface} size={26}>事件</Chip><Chip tint={surface} size={26}>參與人物</Chip><Chip tint={surface} size={26}>人物關係</Chip><Chip tint={surface} size={26}>來源回目</Chip>
        </div>
        <div style={{ fontSize: 28, lineHeight: 1.55, marginTop: 18 }}>不要加入原筆記沒有的事實</div>
        <div style={{ fontSize: 30, fontWeight: 600, color: amber, marginTop: 10 }}>先把草稿顯示在畫面上，不要存檔</div>
      </PromptBox>
    </div>
    <div style={{ marginTop: 60 }}><Lead>檢查草稿中的參與人物、關係名稱與來源回目</Lead></div>
  </Shell>
);

const AsciiDraft: Page = () => (
  <Shell chapter={3}>
    <Eyebrow>練習 2｜找出原文沒有說的話</Eyebrow>
    <Heading>一起談論英雄，就能推論是盟友嗎？</Heading>
    <div style={{ marginTop: 48, fontSize: 26, color: quiet }}>教學用草稿：刻意加入一個尚無依據的推論</div>
    <div style={{ background: surface, padding: '34px 42px', fontFamily: mono, fontSize: 33, lineHeight: 1.85, marginTop: 22 }}>{`煮酒論英雄（小說第 21 回）`}<br />├─ 參與人物：劉備、曹操<br />├─ 事件：兩人談論誰是英雄<br /><span style={{ color: amber }}>└─ 推論：兩人是盟友</span></div>
    <Steps><Step duration={STEP_MS}><div style={{ marginTop: 38, fontSize: 36, color: amber }}>「參與同一場對話」和「政治上的盟友」是同一件事嗎？</div></Step></Steps>
  </Shell>
);

// ---------- 04 核對原文與畫圖 ----------

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
  <Shell chapter={3}>
    <PracticeEyebrow time="8 分鐘">練習 2｜自己打開原文核對</PracticeEyebrow>
    <Heading>請它找句子，再由你判斷能否支持</Heading>
    <div style={{ marginTop: 36 }}><PromptBox pad="22px 32px"><div style={{ fontSize: 29, lineHeight: 1.5, marginTop: 10 }}>對照 notes/煮酒論英雄.md，逐條列出支持草稿關係的原句；找不到就寫「找不到」。先不要改檔案。</div></PromptBox></div>
    <Table marginTop={28}>
      <TRow head cols="540px 1fr 160px" cells={['草稿主張', '筆記的依據', '你的決定']} />
      <CheckRow claim="劉備、曹操共同談論英雄" source="「曹操與劉備在煮酒論英雄的情節中談論誰是英雄。」" verdict={<strong style={{ color: okGreen }}>保留</strong>} />
      <CheckRow claim="劉備與曹操是盟友" source="找不到支持盟友關係的句子；對話本身不足以證明" verdict={<strong style={{ color: amber }}>待確認</strong>} tint={amberSoft} />
    </Table>
    <p style={{ fontSize: 30, color: muted, marginTop: 30 }}>修正後存入 outputs/煮酒論英雄-ascii.md；保留原始筆記</p>
  </Shell>
);

const LoadClarification: Page = () => (
  <Shell chapter={3}>
    <Eyebrow>查證後有三種決定</Eyebrow>
    <Heading>沒證據，和有證據說它錯，是兩回事</Heading>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32, marginTop: 64 }}>
      <StepPanel number="原文支持 → 保留" title="兩人談論英雄" detail="來源明寫曹操與劉備在同一段對話中談論英雄" tint={sage} />
      <StepPanel number="原文不足 → 待確認" title="兩人是盟友" detail="不能只從同場對話，推出政治上的合作關係" tint={amberSoft} />
      <StepPanel number="原文明確不符 → 修正" title="曹操參與桃園結義" detail="回查故事，結義人物是劉備、關羽、張飛" tint={surface} />
    </div>
    <p style={{ fontSize: 34, lineHeight: 1.5, marginTop: 52 }}>接下來畫圖：<strong style={{ color: amber }}>已確認的關係才畫實線；待確認的主張另列</strong></p>
  </Shell>
);

const SkillMcp: Page = () => (
  <Shell chapter={4} enterChapter>
    <Eyebrow>畫圖前，只多認識一個詞</Eyebrow>
    <Heading>Skill：事先寫好的工作說明</Heading>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 90px 1fr', gap: 22, alignItems: 'center', marginTop: 72 }}>
      <div style={{ background: surface, padding: '38px 42px', minHeight: 280 }}><SmallLabel>每次重新交代</SmallLabel><div style={{ fontSize: 34, lineHeight: 1.65, marginTop: 24 }}>怎麼排人物、怎麼畫線<br />怎麼標來源、怎麼存成 HTML</div></div>
      <Arrow size={64}/>
      <div style={{ background: sage, padding: '38px 42px', minHeight: 280 }}><SmallLabel>先備好 diagram-design</SmallLabel><div style={{ fontSize: 34, lineHeight: 1.65, marginTop: 24 }}>AI 讀工作說明，再依這次的<br />筆記與要求產生圖檔</div></div>
    </div>
    <p style={{ fontSize: 32, color: muted, marginTop: 48 }}>有 Skill，仍要查證圖上的關係與來源</p>
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

const DiagramTask: Page = () => (
  <Shell chapter={4}>
    <PracticeEyebrow time="12 分鐘製作＋7 分鐘核對">練習 3｜必做 Graph</PracticeEyebrow>
    <Heading>先完成一張每條線都有依據的關係圖</Heading>
    <div style={{ maxWidth: 1530, marginTop: 40 }}>
      <PromptBox pad="26px 36px">
        <div style={{ fontSize: 29, lineHeight: 1.6, marginTop: 12 }}>讀取 notes/ 六份筆記及 outputs/煮酒論英雄-ascii.md，畫人物與事件的 Graph。</div>
        <div style={{ fontSize: 29, lineHeight: 1.6, marginTop: 16 }}>劉備只畫一次，接上兩個事件。每條線附來源檔名與依據句子；待確認的主張另列。</div>
        <div style={{ fontSize: 28, lineHeight: 1.6, marginTop: 16 }}>先提出設計，確認後存成 diagrams/三國故事.html；保留原始筆記。</div>
      </PromptBox>
    </div>
    <div style={{ marginTop: 32, background: sage, padding: '20px 28px', fontSize: 29, lineHeight: 1.5 }}><strong>完成檢查：</strong>能開啟 HTML，四個人物、兩個事件，每條線都找得到依據</div>
    <p style={{ fontSize: 28, color: muted, marginTop: 22 }}>加分：Graph 核對完成後，再依小說回目加入 Timeline</p>
  </Shell>
);

const DiagramCheck: Page = () => (
  <Shell chapter={4}>
    <Eyebrow>練習 3｜打開 HTML，逐線檢查</Eyebrow>
    <Heading>現在回頭看，這張圖的每條線能解釋嗎？</Heading>
    <div style={{ marginTop: 38 }}><LargeStoryGraph /></div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, marginTop: 28, fontSize: 28, lineHeight: 1.5 }}><div>桃園結義只有三人？<br />核對 notes/桃園結義.md</div><div>煮酒連線只表示對話？<br />沒有擅自改成「盟友」</div><div>同一個劉備只畫一次？<br />能接上兩段故事的來源</div></div>
  </Shell>
);

const StoryTimeline: Page = () => (
  <Shell chapter={4}>
    <Eyebrow>練習 3｜加分選做，先完成 Graph</Eyebrow>
    <Heading>Graph 看關係，Timeline 看先後</Heading>
    <div style={{ marginTop: 60, background: '#FFFFFF', border: `1px solid ${rule}`, padding: '36px 48px' }}>
      <SmallLabel>依小說回目排列，不是歷史年份；間距不代表時間長短</SmallLabel>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 130px 1fr', alignItems: 'center', gap: 30, marginTop: 34 }}>
        <div style={{ borderTop: `4px solid ${amber}`, background: amberSoft, padding: '28px 32px' }}>
          <div style={{ fontSize: 27, color: amber }}>先｜第 1 回</div><div style={{ fontSize: 43, fontWeight: 600, marginTop: 13 }}>桃園結義</div><div style={{ fontSize: 30, marginTop: 16 }}>劉備、關羽、張飛</div>
        </div>
        <div style={{ textAlign: 'center', fontSize: 50, color: amber }}>→</div>
        <Steps><Step duration={STEP_MS}><div style={{ borderTop: `4px solid ${okGreen}`, background: sage, padding: '28px 32px' }}>
          <div style={{ fontSize: 27, color: okGreen }}>後｜第 21 回</div><div style={{ fontSize: 43, fontWeight: 600, marginTop: 13 }}>煮酒論英雄</div><div style={{ fontSize: 30, marginTop: 16 }}>曹操、劉備</div>
        </div></Step></Steps>
      </div>
    </div>
    <p style={{ fontSize: 32, color: muted, lineHeight: 1.6, marginTop: 38 }}>同一個劉備出現在兩件事裡；事件先後，要回到各自的來源回目核對</p>
    <Steps><Step duration={STEP_MS}><div style={{ background: surface, borderLeft: `4px solid ${amber}`, padding: '18px 26px', fontSize: 30, marginTop: 24 }}>Graph 已核對完成，再加 Timeline；尚未完成的人繼續核對關係圖</div></Step></Steps>
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
        <OutputFile path="notes/桃園結義.md" title="原始筆記" detail="保留查證依據" />
        <Step duration={STEP_MS}><ArrowCell gap={56}><OutputFile path="outputs/…-ascii.md" title="ASCII 草稿" detail="每條關係都核對過" /></ArrowCell></Step>
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

const TeachingCheck: Page = () => (
  <Shell>
    <PracticeEyebrow time="3 分鐘">把它帶回教學現場</PracticeEyebrow>
    <Heading>你會把哪一步交給 AI？</Heading>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 32, marginTop: 100 }}>
      <Steps>
        <StepPanel number="AI 可以先做" title="整理資料" detail="例：把六份筆記整理成比較表" tint={sage} />
        <Step duration={STEP_MS}><StepPanel number="和 AI 一起調整" title="排知識圖版面" detail="例：調整人物、事件的位置與連線" tint={surface} /></Step>
        <Step duration={STEP_MS}><StepPanel number="一定要自己確認" title="回原文查證" detail="例：核對人物關係與小說回目" tint={amberSoft} /></Step>
      </Steps>
    </div>
    <div style={{ marginTop: 81 }}><Lead>選一份自己的教材，和旁邊的人說：你會請 AI 整理什麼？哪條關係需要查證？</Lead></div>
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
        <TakeItem n="1" label="課前準備"><Path size={29}>examples/teacher-learning-lab/prework.md</Path></TakeItem>
        <TakeItem n="2" label="三次練習的完整提示詞"><Path size={29}>examples/teacher-learning-lab/prompts.md</Path></TakeItem>
        <TakeItem n="3" label="下一篇｜Obsidian"><div style={{ fontSize: 30 }}>把人物、事件保存成互相連結的知識卡</div></TakeItem>
      </div>
      <div style={{ textAlign: 'center' }}><img src={repoQr} alt="課程 GitHub 資料夾 QR code" style={{ width: 340, height: 340, display: 'block' }}/><div style={{ fontSize: 25, color: muted, marginTop: 16 }}>github.com/Chrouos/AI-workshop-slides</div></div>
    </div>
  </Shell>
);


const ExitTicket: Page = () => (
  <Shell top={150}>
    <Eyebrow>最後一分鐘｜寫在自己的筆記</Eyebrow>
    <Heading>圖上的哪一條關係，你親自查證過？</Heading>
    <div style={{ marginTop: 60, display: 'grid', gap: 28, fontSize: 37, lineHeight: 1.5 }}><NumLine n="1" size={37}>我查證的關係是什麼？</NumLine><NumLine n="2" size={37}>哪份筆記、哪一句支持它？</NumLine><NumLine n="3" size={37}>換成自己的教材，我會先查哪條關係？</NumLine></div>
    <div style={{ marginTop: 64, borderTop: `2px solid ${amber}`, paddingTop: 28, fontSize: 42, color: amber }}>AI 畫出的每一條關係，都要回原文找證據</div>
  </Shell>
);

const TeacherTransfer: Page = () => (
  <Shell>
    <Eyebrow>換成你的教材，也能這樣讀</Eyebrow>
    <Heading>今天找人物關係，明天找課本概念</Heading>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 36, marginTop: 70 }}>
      <StepPanel number="國文｜三國故事" title="人物 × 事件" detail="劉備 → 桃園結義 → 關羽" tint={amberSoft} />
      <StepPanel number="歷史｜一個單元" title="事件 × 先後" detail="從課文整理事件的前因後果" tint={surface} />
      <StepPanel number="自然｜課本概念" title="概念 × 關係" detail="從課文整理食物鏈與能量流動" tint={sage} />
    </div>
    <div style={{ marginTop: 60, fontSize: 38, lineHeight: 1.6 }}>換一份教材，保留同一個問題：<br /><strong style={{ color: amber }}>圖上的這條關係，課文哪一句有寫？</strong></div>
  </Shell>
);

const DataSafety: Page = () => (
  <Shell chapter={1}>
    <Eyebrow>交出資料之前</Eyebrow>
    <Heading>先確認這份資料能交給這個工具</Heading>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32, marginTop: 64 }}>
      <StepPanel number="學生個資" title="先去識別" detail="移除姓名、學號、聯絡資料；內容仍可能讓人辨識身分" tint={amberSoft} />
      <StepPanel number="未公開試題" title="先確認授權" detail="確認是否允許上傳，以及工具的資料處理方式" tint={surface} />
      <StepPanel number="敏感文件" title="依校方規範" detail="確認保密要求、使用權限與可使用的工具" tint={sage} />
    </div>
    <div style={{ marginTop: 56, padding: '26px 34px', borderLeft: `4px solid ${amber}`, background: '#FFFFFF', fontSize: 33, lineHeight: 1.5 }}>今天使用已備好的三國練習筆記<br />允許 Agent 讀取資料夾，不等於取得資料的上傳或使用授權</div>
  </Shell>
);

const ReadyDesk: Page = () => (
  <Shell chapter={1}>
    <Eyebrow>準備開始操作</Eyebrow>
    <Heading>先確認工作位置，以及允許它做的事</Heading>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 42, marginTop: 64 }}>
      <StepPanel number="Directory｜工作位置" title="teacher-learning-lab" detail="確認 notes/ 有六份故事筆記，打開 prompts.md 準備複製提示詞" tint={amberSoft} />
      <StepPanel number="Permissions｜操作權限" title="看清楚再同意" detail="確認要讀、寫或執行什麼；第一次練習只讀筆記，不修改檔案" tint={sage} />
    </div>
    <div style={{ background: '#FFFFFF', border: `1px solid ${rule}`, padding: '24px 32px', marginTop: 38, fontSize: 29, lineHeight: 1.6 }}><strong>查看工作位置：</strong>輸入 /status<br /><strong>尚未裝好：</strong>使用 ChatGPT 上傳六份筆記，成果自行下載或存檔</div>
  </Shell>
);

const Appendix: Page = () => (
  <Shell top={170}>
    <Eyebrow>附錄｜課前準備與操作查詢</Eyebrow>
    <div style={{ marginTop: 60 }}><Title>安裝、設定與延伸</Title></div>
    <div style={{ marginTop: 65, fontSize: 36, lineHeight: 1.9, color: muted }}>講者介紹<br />課前安裝與開啟練習資料夾<br />Status、Skill 安裝與 MCP 補充</div>
    <p style={{ marginTop: 40, color: amber, fontSize: 29 }}>以下頁面供課前閱讀與課後查詢</p>
  </Shell>
);

const Prework: Page = () => (
  <Shell>
    <Eyebrow>課前完成｜預留 15–20 分鐘</Eyebrow>
    <Heading>先裝好工具，課堂留給練習</Heading>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32, marginTop: 60 }}>
      <StepPanel number="1｜下載教材" title="解壓縮 ZIP" detail="GitHub → Code → Download ZIP，打開 examples/teacher-learning-lab" tint={surface} />
      <StepPanel number="2｜安裝 Codex" title="安裝並登入" detail="Node.js 選 LTS，依 prework.md 安裝 Codex，確認帳號可使用" tint={amberSoft} />
      <StepPanel number="3｜開啟練習" title="看得到六份筆記" detail="完成 Skill 安裝；開啟正確資料夾，試讀一份筆記" tint={sage} />
    </div>
    <div style={{ marginTop: 45, fontSize: 29, lineHeight: 1.7 }}>完整指令：examples/teacher-learning-lab/prework.md<br />備用方式：ChatGPT 上傳 notes/ 六份筆記，成果自行下載或存檔</div>
  </Shell>
);

const McpAppendix: Page = () => (
  <Shell>
    <Eyebrow>延伸名詞｜本課未使用</Eyebrow>
    <Heading>MCP：讓 AI 連接外部工具與資料</Heading>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'center', marginTop: 90 }}><StepPanel number="Skill" title="工作說明" detail="告訴 AI 這種工作應該怎麼做" tint={sage} /><StepPanel number="MCP" title="連接方式" detail="讓 AI 透過介面取得外部資料或使用工具" tint={surface} /></div>
    <p style={{ fontSize: 34, color: muted, lineHeight: 1.6, marginTop: 60 }}>例如連接雲端文件或其他系統<br />今天的來源都在本機 notes/，不需要新增連接</p>
  </Shell>
);

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
  "3:10–4:10。只講核心：同樣問桃園有哪些人，先找到筆記，再把問題和相關筆記交給AI，產生回答。分兩次揭示，不逐字解釋英文。像拿著課文作答，可能降低無根據回答，但仍要核對來源。本課Codex讀本機筆記，是示範類似RAG的先取得資料再回答概念，不是建置完整RAG系統。全名供課後查閱，不考術語。來源：https://arxiv.org/abs/2005.11401 、https://arxiv.org/abs/2312.10997",
  "4:10–4:40。把剛才先找資料再回答的方法帶回課堂：歷史可整理事件，國文可整理人物，自然可整理概念。來源換成授權教材，仍問圖上的關係課文哪句有寫。先想一份自己的教材，最後再分享。",
  "4:40–5:00。只說大方向：前8分鐘看故事與概念，8到20分讀筆記，20到35分查證，35到55分完成知識圖，最後5分鐘教學轉用。接著用30秒口頭說明：ChatGPT可上傳筆記討論，今天用Codex直接讀練習資料夾並交出圖檔；不再展示比較表。",
  "5:30–6:00。30秒提醒：今天只用已備好的三國筆記。換成自己的教材前，學生個資、未公開試題、敏感文件須依校方規範確認能否給這個工具；刪姓名不一定無法識別。UNESCO指引：https://www.unesco.org/en/articles/guidance-generative-ai-education-and-research?hub=387",
  "6:00–8:00。只示範Directory工作位置和Permissions操作權限，不講Session。請大家立刻打開練習資料夾與prompts.md，8分鐘時開始第一個練習區段。需要時/status查看工作位置。課前未完成設定，直接用ChatGPT上傳六份筆記或與同伴共用，避免等待安裝。",
  "8:00–9:00。正式進入練習一區段。確認notes/有四人物兩事件的六份筆記，不含README。打開一份看內容，接下來先看單篇提示詞範例，再擴到六篇。",
  "9:00–10:00。讓大家先選A或B，用一個理由說明。這一頁只讀桃園結義，是單篇示範；下一頁正式練習才擴大讀六份，範圍改變但仍要列依據、先不改檔。",
  "10:00–15:00。練習5分鐘。打開prompts.md練習1，正式讀六份故事筆記，不含README，列人物/事件、關係、原句與來源。先不要改檔。確認它真的讀六份，再自己開一份對照。",
  "15:00–20:00。留5分鐘讓較慢者完成，並挑一列分享來源。這是完整表的三列節錄，每人至少指出一條原句。劉備參與兩事件，不代表所有參與者都是同一種關係。接著精讀煮酒論英雄。",
  "20:00–25:00。練習5分鐘，只讀煮酒論英雄.md，用ASCII純文字排參與人物、事件、關係與回目。先顯示草稿，不存檔。即使AI沒出錯，下一頁的教學草稿也能練習區分原文和推論。",
  "25:00–26:00。先請學員說出自己的草稿，再展示這份教學示意。人物對、事件對，但盟友是新推論。不要把缺乏支持直接說成歷史上的反命題；我們現在只問這份筆記能否支持這條線。AI實際輸出不一定相同；沒有錯誤時也用這個示例練習。",
  "26:00–34:00。練習8分鐘：開自己的筆記，逐條對照，不只請AI自我檢查。兩人談論英雄有原句支持；盟友沒有。可保留在待確認區，但不能當成已確認連線。每人指出一條支持句與一個不能從句子推得的結論。確認後存outputs/煮酒論英雄-ascii.md，notes來源保留。",
  "34:00–35:00。一分鐘收束：支持就保留，資料不足標待確認，原文明確不符就修正。盟友不是被這份筆記證明錯誤，而是沒有足夠依據。這個區分比只找明顯錯字更接近日常AI使用。下一步只把已支持關係畫成實線。",
  "35:00–36:00。Skill就是事先寫好的工作說明。今天用課前已備好的diagram-design；不用現場逐條重新教AI排版。沒有此Skill時，照prompts.md的標準HTML指示也能練習，教師不要花課堂時間排除安裝問題。MCP留附錄，不在本段引入。",
  "36:00–48:00。12分鐘只做必做Graph：四人物兩事件、每條線有來源，存單檔HTML並開啟。使用prompts.md練習3必做段，課前已有diagram-design可用；沒有則沿用一般HTML指示。先提出設計，確認後寫入。不要同時要求Timeline，先確保每個人完成最重要的關係圖。",
  "48:00–55:00。留7分鐘開啟、查證與修圖。對每條線問：表示什麼、哪句支持？每人至少展示一條來源。劉備只出現一次，不能多連曹操到桃園，也不能把共同對話改成盟友。已完成核對者才看下一頁加分；其他人繼續Graph。這7分鐘不因展示加分頁而提早結束。",
  "48:00–55:00同時段的加分選做，不另占時間。只對已完成Graph查證的學員說明：時間線依小說第1回與第21回排先後，不是歷史年份，間距不代表時間長短。用prompts.md加分提示詞，不要求全班完成。其餘學員繼續核對Graph，55分鐘一同收尾。",
  "55:00–55:30。快速回看三種檔案：來源、核對後草稿、HTML圖。來源與整理分開保存，以便之後修正。不要逐題再討論，留時間給下一頁的教學轉用。",
  "55:30–58:30。3分鐘兩人分享。各選一份自己能使用的教材，說出要整理的關係及查證來源。AI先列關係與排圖，教師確認內容和教學適用性。",
  "58:30–59:00。掃描是課程repo，完整提示詞、課前設定都在examples/teacher-learning-lab，不用照著投影片打字。下一篇Obsidian才練長期保存與擴充知識卡。",
  "59:00–60:00。請每人用自己的成果寫一句完整例子：某個人物參與某事件，哪份筆記哪句支持。再想自己教材的一條關係如何查。這一分鐘不再介紹工具，以回原文找證據收尾。",
  "主線已在前一頁60分鐘結束。以下附錄不逐頁講解。課前把prework.md寄給學員，現場僅用必要頁排除問題。",
  "我是黃懷萱，中央大學碩士，研究 NLP、LLM 和 RAG；現在在關貿網路做智慧客服，參與 EZ WAY、eHub、TTLL 等服務。今天用大家聽過的三國人物，實際試一次 Agent 如何讀筆記、核對並畫圖。",
  "課前預留15–20分鐘，不含帳號或網路問題排除。教學單位先確認帳號、網路和資料使用規範。當天若尚未完成就用備用方式或與同伴共用已準備環境。技術指令以課前文件及工具官方說明為準。",
  '事前準備已經讓終端機停在課程資料夾的最上層，也就是 AI-workshop-slides（ZIP 版叫 AI-workshop-slides-main）。在這裡輸入 cd examples/teacher-learning-lab，走進練習資料夾，再輸入 codex 叫醒它。第一次啟動依畫面登入 ChatGPT 帳號。',
  '暖身 2：交辦更多事之前，輸入 /status 查環境。框起來的兩行最重要：Directory 是它在哪工作，Permissions 是它能做哪些事、要不要先問你。右邊表格是每個欄位的白話；最下面的額度，等練習 1 做完再一起看。',
  '練習 3：裝上 diagram-design 這張食譜。依官方說明加入 marketplace 並安裝 plugin，再開一個新的 Codex Session，新的 Session 才讀得到它。官方來源：https://github.com/cathrynlavery/diagram-design',
  "課後延伸，60分鐘主線不講。MCP是一種連接AI應用與外部工具、資料的協定；Skill是工作說明，兩者功能不同並非步驟先後。"
];

export default [
  Cover, StoryStart, ResultFirst, WrongAnswer, RagFlow, TeacherTransfer, Agenda, DataSafety, ReadyDesk, LabOverview, PromptChoice, ScanTask, ScanOutput, AsciiTask, AsciiDraft, CheckOriginal, LoadClarification, SkillMcp, DiagramTask, DiagramCheck, StoryTimeline, Reflection, TeachingCheck, Takeaway, ExitTicket,
  // Appendix: outside the 60-minute teaching route
  Appendix, SpeakerIntro, Prework, OpenProject, StatusScreen, SkillSetup, McpAppendix,
] satisfies Page[];
