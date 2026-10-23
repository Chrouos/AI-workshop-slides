import type { DesignSystem, Page, SlideMeta, SlideTransition } from '@open-slide/core';
import { Step, Steps, useIsActivePage, useSlidePageNumber } from '@open-slide/core';
import type { CSSProperties, ReactNode } from 'react';
import ddResult from './assets/diagram-design-result.png';
import dgHtmlTest from './assets/digital-garden-html-test.png';
import ddFixed from './assets/diagram-design-fixed.png';
import timelineSite from './assets/timeline-on-site.png';
import promptsQr from './assets/prompts-qr.svg';

// Where students copy every prompt from (opened on their laptop, not typed off the projector).
const PROMPTS_URL = 'https://github.com/Chrouos/AI-workshop-slides/blob/main/examples/aw-03-lab/prompts.md';
const LAB_URL = 'https://github.com/Chrouos/AI-workshop-slides/tree/main/examples/aw-03-lab';
const VAULT_ZIP_URL = 'https://raw.githubusercontent.com/Chrouos/AI-workshop-slides/main/examples/aw-02-vault/%E4%B8%89%E5%9C%8B%E4%BA%BA%E7%89%A9%E7%9F%A5%E8%AD%98%E5%BA%AB.zip';
const DECK_SITE = 'chrouos.github.io/AI-workshop-slides';

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
const FONT_LINK_ID = 'osd-webfont-aw-03';
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
// Same vocabulary as decks 01 and 02. Clicks go through the framework's <Steps>/<Step>;
// the CSS only adds a short rise to whatever a <Step> reveals, lines that draw themselves
// when their step is revealed, bars that grow, and pieces that settle in order. Un-clicked
// motion (a page's pieces settling in, the chapter bar filling) runs only on the page the
// audience is watching (useIsActivePage). Thumbnails, overview and exports render every
// step revealed and skip the entrance, so nothing is caught half-drawn.
const EASE_OUT = 'cubic-bezier(0.23, 1, 0.32, 1)';
const STEP_MS = 280; // a <Step> fading in + an 8px rise
const BUILD_MS = 320; // pieces inside a revealed step settling in order
const BUILD_GAP = 90; // stagger between those pieces
const BAR_MS = 600; // probability bars growing from zero
const FILL_MS = 480; // chapter bar filling left to right
const ENTER_MS = 420; // a piece of a page settling in when the page arrives
const ENTER_GAP = 90; // stagger between those pieces
const DRAW_MS = 520; // a connecting line drawing from one end to the other

const MOTION_CSS = `
.aw3-deck [data-osd-step] > * { transition: transform ${STEP_MS}ms ${EASE_OUT}; }
.aw3-deck [data-osd-step="pending"] > * { transform: translateY(8px); }
.aw3-deck .aw3-build { transition-property: opacity, transform; transition-duration: ${BUILD_MS}ms; transition-timing-function: ${EASE_OUT}; }
.aw3-deck [data-osd-step="pending"] .aw3-build { opacity: 0; transform: translateY(10px); }
.aw3-deck .aw3-bar { transform-origin: left center; transition: transform ${BAR_MS}ms ${EASE_OUT}; }
.aw3-deck [data-osd-step="pending"] .aw3-bar { transform: scaleX(0); }
.aw3-deck .aw3-stepdraw { stroke-dasharray: 1; stroke-dashoffset: 0; transition: stroke-dashoffset ${DRAW_MS}ms ${EASE_OUT}; }
.aw3-deck [data-osd-step="pending"] .aw3-stepdraw { stroke-dashoffset: 1; }
@keyframes aw3-fill { from { transform: scaleX(0); } to { transform: scaleX(1); } }
.aw3-deck .aw3-fill { transform-origin: left center; animation: aw3-fill ${FILL_MS}ms ${EASE_OUT} 160ms both; }
@keyframes aw3-in { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: none; } }
.aw3-deck .aw3-in { animation: aw3-in ${ENTER_MS}ms ${EASE_OUT} both; }
@keyframes aw3-draw { from { stroke-dashoffset: 1; } to { stroke-dashoffset: 0; } }
.aw3-deck .aw3-draw { stroke-dasharray: 1; animation: aw3-draw ${DRAW_MS}ms ${EASE_OUT} both; }
@keyframes aw3-pop { from { opacity: 0; transform: scale(0.75); } to { opacity: 1; transform: scale(1); } }
.aw3-deck .aw3-pop { transform-box: fill-box; transform-origin: center; animation: aw3-pop 300ms ${EASE_OUT} both; }
@keyframes aw3-in-fade { from { opacity: 0; } to { opacity: 1; } }
@media (prefers-reduced-motion: reduce) {
  .aw3-deck .aw3-in, .aw3-deck .aw3-pop { animation: aw3-in-fade 150ms ease both; }
  .aw3-deck .aw3-draw { animation: none; stroke-dasharray: none; }
  .aw3-deck .aw3-stepdraw, .aw3-deck [data-osd-step="pending"] .aw3-stepdraw { transition: none; stroke-dasharray: none; stroke-dashoffset: 0; }
  .aw3-deck [data-osd-step] > *, .aw3-deck [data-osd-step="pending"] > * { transform: none; transition: none; }
  .aw3-deck .aw3-build { transition: opacity 150ms ease; transition-delay: 0s !important; }
  .aw3-deck [data-osd-step="pending"] .aw3-build { transform: none; }
  .aw3-deck .aw3-bar, .aw3-deck [data-osd-step="pending"] .aw3-bar { transform: none; transition: none; }
  .aw3-deck .aw3-fill { animation: none; }
}
`;
const MOTION_STYLE_ID = 'osd-motion-aw-03';
if (typeof document !== 'undefined') {
  let style = document.getElementById(MOTION_STYLE_ID) as HTMLStyleElement | null;
  if (!style) {
    style = document.createElement('style');
    style.id = MOTION_STYLE_ID;
    document.head.appendChild(style);
  }
  if (style.textContent !== MOTION_CSS) style.textContent = MOTION_CSS;
}

// Delay for the i-th piece of a build (0-based), after its step has started fading in.
const buildDelay = (i: number, base = 120) => ({ transitionDelay: `${base + i * BUILD_GAP}ms` });

// The i-th piece (0-based) of a page's entrance.
const enterDelay = (i: number, base = 160) => `${base + i * ENTER_GAP}ms`;

const In = ({ i, style, children }: { i: number; style?: CSSProperties; children: ReactNode }) => {
  const live = useIsActivePage();
  return <div className={live ? 'aw3-in' : undefined} style={live ? { ...style, animationDelay: enterDelay(i) } : style}>{children}</div>;
};

// The same, for a group inside an SVG picture.
const InG = ({ i, children }: { i: number; children: ReactNode }) => {
  const live = useIsActivePage();
  return <g className={live ? 'aw3-in' : undefined} style={live ? { animationDelay: enterDelay(i) } : undefined}>{children}</g>;
};

// A mark (tick, cross, badge) that pops in after the thing it marks has landed.
const PopG = ({ i, children }: { i: number; children: ReactNode }) => {
  const live = useIsActivePage();
  return <g className={live ? 'aw3-pop' : undefined} style={live ? { animationDelay: enterDelay(i) } : undefined}>{children}</g>;
};

// A solid connecting line that draws itself on when the page arrives.
const DrawPath = ({ i, d }: { i: number; d: string }) => {
  const live = useIsActivePage();
  return <path d={d} pathLength={1} className={live ? 'aw3-draw' : undefined} style={live ? { animationDelay: enterDelay(i) } : undefined} />;
};

// A solid line inside a <Step>: it draws itself when that step is revealed.
const StepPath = ({ d, i = 0 }: { d: string; i?: number }) => (
  <path d={d} pathLength={1} className="aw3-stepdraw" style={buildDelay(i, 60)} />
);

const ink = '#1C1917';
const muted = '#57534E';
const faint = '#948D88'; // strokes and arrows only
const quiet = '#736D68'; // secondary text that must still read on a projector
const rule = '#D6D3D1';
const surface = '#F5F5F4';
const raised = '#EFEDEB';
const amber = '#9A6846';
const amberSoft = '#EFE2D4';
const sage = '#DCE5DC';
const okGreen = '#4F7A55';
const blue = '#4A6A8C'; // the "thinking / tools" stage
const blueSoft = '#E3EAF1';
const warn = '#9B4A3C';
const term = '#1F2226';
const mono = '"Source Code Pro", Consolas, Menlo, monospace';
const display = 'var(--osd-font-display)';

// ---------- Frame ----------

const Title = ({ children }: { children: ReactNode }) => (
  <h1 style={{ fontFamily: '"Libre Baskerville", Georgia, "Times New Roman", serif', fontSize: 132, fontWeight: 400, lineHeight: 1.17, letterSpacing: '-0.035em', maxWidth: 1500, margin: 0, color: ink, whiteSpace: 'pre-line' }}>{children}</h1>
);

// With a source, the footer's left side names where the page's idea comes from.
const Footer = ({ source }: { source?: ReactNode }) => {
  const { current, total } = useSlidePageNumber();
  return (
    <div style={{ position: 'absolute', left: 144, right: 144, bottom: 56, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 32, borderTop: '1px solid #E7E5E4', paddingTop: 22, fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', fontSize: 22, fontWeight: 400, color: quiet }}>
      {source ? <span style={{ whiteSpace: 'nowrap' }}><strong style={{ fontWeight: 600, color: muted }}>參考</strong>｜{source}</span> : <span>AI 協作課｜第 3 堂 Skills</span>}
      <span style={{ flexShrink: 0, whiteSpace: 'nowrap' }}>{String(current).padStart(2, '0')} / {String(total).padStart(2, '0')}</span>
    </div>
  );
};

const Eyebrow = ({ children }: { children: ReactNode }) => (
  <div style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', fontSize: 24, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#78716C' }}>{children}</div>
);

// Hands-on pages share the exercise label and time estimate.
const PracticeEyebrow = ({ children, time }: { children: ReactNode; time: string }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
    <Eyebrow>{children}</Eyebrow>
    <span style={{ display: 'inline-flex', alignItems: 'center', background: '#FFFFFF', border: `1px solid ${rule}`, padding: '6px 18px', fontSize: 24, whiteSpace: 'nowrap' }}>
      <strong style={{ color: amber }}>⏱ {time}</strong>
    </span>
  </div>
);

// Top-right corner of a practice page: QR + link to the prompts file, pointing at one section.
const PromptsCopy = ({ step }: { step: string }) => (
  <a href={PROMPTS_URL} target="_blank" rel="noreferrer" style={{ position: 'absolute', top: 176, right: 144, display: 'flex', alignItems: 'center', gap: 18, color: muted, textDecoration: 'none' }}>
    <span style={{ textAlign: 'right', fontSize: 24, lineHeight: 1.4 }}>複製提示詞<br /><strong style={{ color: amber, fontFamily: mono }}>prompts.md</strong> 練習 {step}</span>
    <img src={promptsQr} alt="prompts.md 的 QR code" style={{ width: 120, height: 120, display: 'block', background: '#FFFFFF', border: `1px solid ${rule}`, padding: 5 }} />
  </a>
);

// The five chapters of the lesson. Pages inside a chapter show where we are.
const CHAPTERS = ['什麼是 Skill', '安裝熱門 Skill', '用 Skill 做好讀的筆記', '擴充筆記庫', '寫自己的 Skill'];
type Chapter = 1 | 2 | 3 | 4 | 5;

// One segment of the route bar. The current chapter is amber; on a chapter's opening
// page it fills in left to right, once, on the live page only.
const RouteSeg = ({ color, fill = false }: { color: string; fill?: boolean }) => (
  <span style={{ width: 34, height: 6, background: fill ? rule : color, display: 'block' }}>
    {fill ? <span className="aw3-fill" style={{ display: 'block', width: '100%', height: '100%', background: color }} /> : null}
  </span>
);

const RouteBar = ({ chapter, enter = false }: { chapter: Chapter; enter?: boolean }) => {
  const live = useIsActivePage();
  const fill = enter && live;
  const tone = (n: number) => (n === chapter ? amber : n < chapter ? faint : rule);
  return (
    <div style={{ position: 'absolute', top: 114, right: 144, display: 'flex', alignItems: 'center', gap: 8 }}>
      <RouteSeg color={tone(1)} fill={fill && chapter === 1} />
      <RouteSeg color={tone(2)} fill={fill && chapter === 2} />
      <RouteSeg color={tone(3)} fill={fill && chapter === 3} />
      <RouteSeg color={tone(4)} fill={fill && chapter === 4} />
      <RouteSeg color={tone(5)} fill={fill && chapter === 5} />
      <span style={{ marginLeft: 12, fontSize: 24, fontWeight: 600, color: amber, letterSpacing: '0.04em' }}>
        {String(chapter).padStart(2, '0')}｜{CHAPTERS[chapter - 1]}
      </span>
    </div>
  );
};

const Shell = ({ children, top = 112, chapter, enterChapter = false, source }: { children: ReactNode; top?: number; chapter?: Chapter; enterChapter?: boolean; source?: ReactNode }) => (
  <div className="aw3-deck" style={{ width: '100%', height: '100%', boxSizing: 'border-box', position: 'relative', display: 'flex', flexDirection: 'column', background: 'var(--osd-bg)', color: 'var(--osd-text)', fontFamily: 'var(--osd-font-body)', padding: `${top}px 144px 126px` }}>
    {chapter ? <RouteBar chapter={chapter} enter={enterChapter} /> : null}
    {children}
    <Footer source={source} />
  </div>
);

// The page's main picture: fills the space between the heading and the footer, centred
// vertically, and enlarged by `z` when a page has room to spare.
const Fit = ({ z = 1, children }: { z?: number; children: ReactNode }) => (
  <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingTop: 24 }}>
    <div style={{ zoom: z }}>{children}</div>
  </div>
);

// The one line the audience should leave the page with, set large under the picture.
const Takeaway = ({ children, color = amber, marginTop = 48 }: { children: ReactNode; color?: string; marginTop?: number }) => (
  <div style={{ fontFamily: display, fontSize: 44, lineHeight: 1.35, color, marginTop, textAlign: 'center' }}>{children}</div>
);

const Heading = ({ children }: { children: ReactNode }) => (
  <h2 style={{ fontFamily: display, fontSize: 66, fontWeight: 400, lineHeight: 1.2, letterSpacing: '-0.025em', margin: '40px 0 0', maxWidth: 1620 }}>{children}</h2>
);

// The one-line everyday picture under a heading (abstract concept pages only).
const Lead = ({ children }: { children: ReactNode }) => (
  <p style={{ fontSize: 34, lineHeight: 1.5, color: muted, maxWidth: 1560, margin: '18px 0 0' }}>{children}</p>
);

const SmallLabel = ({ children, color = 'var(--osd-accent)' }: { children: ReactNode; color?: string }) => (
  <span style={{ color, fontSize: 25, fontWeight: 600, letterSpacing: '0.07em' }}>{children}</span>
);

const Path = ({ children, size = 26 }: { children: ReactNode; size?: number }) => (
  <span style={{ fontFamily: mono, fontSize: size, whiteSpace: 'nowrap' }}>{children}</span>
);

const NumDot = ({ n, size = 44 }: { n: number; size?: number }) => (
  <span style={{ flex: '0 0 auto', width: size, height: size, borderRadius: size / 2, background: amber, color: '#FFFFFF', display: 'grid', placeItems: 'center', fontSize: Math.round(size * 0.57), fontWeight: 600 }}>{n}</span>
);

const NumLine = ({ n, children, size = 34 }: { n: number; children: ReactNode; size?: number }) => (
  <div style={{ display: 'flex', gap: 18, alignItems: 'center', fontSize: size, lineHeight: 1.45 }}>
    <NumDot n={n} />
    <span>{children}</span>
  </div>
);

const Callout = ({ n, title, detail }: { n: number; title: ReactNode; detail?: ReactNode }) => (
  <div style={{ display: 'grid', gridTemplateColumns: '44px 1fr', gap: 20, alignItems: 'start' }}>
    <NumDot n={n} />
    <div>
      <div style={{ fontSize: 31, fontWeight: 600, lineHeight: 1.35 }}>{title}</div>
      {detail ? <div style={{ fontSize: 26, color: muted, marginTop: 6, lineHeight: 1.45 }}>{detail}</div> : null}
    </div>
  </div>
);

// A terminal window. Lines are plain text; "$" lines are what the learner types.
const Terminal = ({ title, children, width }: { title: string; children: ReactNode; width?: number }) => (
  <div style={{ width, boxSizing: 'border-box', background: term, color: '#F5F5F4', border: '1px solid #555B60' }}>
    <div style={{ height: 52, display: 'flex', alignItems: 'center', gap: 12, background: '#30343A', padding: '0 26px', boxSizing: 'border-box' }}>
      <span style={{ width: 13, height: 13, borderRadius: 20, background: '#DF6A63' }} />
      <span style={{ width: 13, height: 13, borderRadius: 20, background: '#E9B650' }} />
      <span style={{ width: 13, height: 13, borderRadius: 20, background: '#73BB78' }} />
      <span style={{ fontFamily: mono, color: '#BCC3CC', fontSize: 23, marginLeft: 16 }}>{title}</span>
    </div>
    <div style={{ padding: '28px 38px 34px', fontFamily: mono, fontSize: 29, lineHeight: 1.6, whiteSpace: 'pre' }}>{children}</div>
  </div>
);
const Typed = ({ children }: { children: ReactNode }) => <span style={{ color: '#8DD4A0' }}>{children}</span>;
const AskLine = ({ children }: { children: ReactNode }) => <span style={{ color: '#E9B650' }}>{children}</span>;
const Dim = ({ children }: { children: ReactNode }) => <span style={{ color: '#BCC3CC' }}>{children}</span>;

const Caption = ({ children }: { children: ReactNode }) => (
  <div style={{ fontSize: 22, lineHeight: 1.4, color: quiet, marginTop: 12 }}>{children}</div>
);

// A real screenshot at its own aspect ratio. Marks are given in % of the image.
const Screenshot = ({ src, aspect, width, caption, alt, children }: { src: string; aspect: number; width: number; caption?: string; alt: string; children?: ReactNode }) => (
  <div style={{ width }}>
    <div style={{ width, height: Math.round(width / aspect), boxSizing: 'border-box', border: `1px solid ${rule}`, background: '#FFFFFF', boxShadow: '0 10px 30px rgba(28,25,23,0.08)', position: 'relative' }}>
      <img src={src} alt={alt} style={{ width: '100%', height: '100%', display: 'block' }} />
      {children}
    </div>
    {caption ? <Caption>{caption}</Caption> : null}
  </div>
);

// An outline drawn over one region of a screenshot (in % of the image), with its number.
// With `step`, the mark sits inside a <Step> (via MarkLayer) and settles in just after
// its callout is revealed, instead of arriving with the page.
const RegionMark = ({ x, y, w, h, n, i = 0, badge = 'left', step }: { x: number; y: number; w: number; h: number; n?: number; i?: number; badge?: 'left' | 'right'; step?: boolean }) => {
  const live = useIsActivePage();
  const enter = !step && live;
  return (
    <div className={step ? 'aw3-build' : enter ? 'aw3-in' : undefined} style={{ position: 'absolute', left: `${x}%`, top: `${y}%`, width: `${w}%`, height: `${h}%`, border: '4px solid #E9B650', boxSizing: 'border-box', ...(step ? buildDelay(1) : {}), animationDelay: enter ? enterDelay(i) : undefined }}>
      {n ? <span style={{ position: 'absolute', ...(badge === 'left' ? { left: -26, top: -26 } : { right: -56, top: '50%', marginTop: -24 }), width: 48, height: 48, borderRadius: 24, background: amber, color: '#FFFFFF', display: 'grid', placeItems: 'center', fontSize: 26, fontWeight: 600, boxShadow: '0 0 0 4px #FFFFFF' }}>{n}</span> : null}
    </div>
  );
};

// A box laid exactly over a screenshot (its px size, inside the Crop's 1px border, from the
// top-left of the nearest positioned ancestor), so a callout's <Step> can carry the mark that points at the picture.
const MarkLayer = ({ width, height, children }: { width: number; height: number; children: ReactNode }) => (
  <div style={{ position: 'absolute', left: 1, top: 1, width, height, pointerEvents: 'none' }}>{children}</div>
);

// Shows only the useful region of a 1800×1080 CLI capture, enlarged.
const Shot = ({ src, alt, crop, width, children }: { src: string; alt: string; crop: [number, number, number, number]; width: number; children?: ReactNode }) => {
  const [x, y, w, h] = crop;
  const s = width / w;
  return (
    <div style={{ position: 'relative', width, height: Math.round(h * s), overflow: 'hidden', background: '#1F2228', border: `1px solid ${rule}`, flexShrink: 0 }}>
      <img src={src} alt={alt} style={{ position: 'absolute', left: -x * s, top: -y * s, width: 1800 * s, height: 1080 * s, maxWidth: 'none' }} />
      {children}
    </div>
  );
};

// An outline drawn over one row of a cropped screenshot.
const RowMark = ({ top, height = 32, width }: { top: number; height?: number; width: number }) => (
  <div style={{ position: 'absolute', left: 6, top, width, height, border: '3px solid #E9B650', boxSizing: 'border-box' }} />
);

const TRow = ({ cells, cols, head = false, tint, size = 30 }: { cells: ReactNode[]; cols: string; head?: boolean; tint?: string; size?: number }) => (
  <div style={{ display: 'grid', gridTemplateColumns: cols, background: head ? raised : tint ?? 'transparent', borderBottom: `1px solid ${rule}`, fontSize: head ? 24 : size, fontWeight: head ? 600 : 400, color: head ? muted : 'var(--osd-text)', lineHeight: 1.45 }}>
    {cells.map((c, i) => (
      <div key={i} style={{ padding: head ? '14px 22px' : '20px 22px' }}>{c}</div>
    ))}
  </div>
);

// One line of a prompt squeezed to three labelled pills, ≤10 字 each.
const Pill = ({ tag, children }: { tag: string; children: ReactNode }) => (
  <span style={{ display: 'inline-flex', alignItems: 'stretch', border: `2px solid ${amber}`, borderRadius: 32, overflow: 'hidden', fontSize: 28, whiteSpace: 'nowrap' }}>
    <span style={{ background: amber, color: '#FFFFFF', fontWeight: 600, padding: '8px 18px' }}>{tag}</span>
    <span style={{ background: '#FFFFFF', padding: '8px 22px' }}>{children}</span>
  </span>
);

const PillRow = ({ i = 0, children }: { i?: number; children: ReactNode }) => (
  <In i={i} style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 30 }}>{children}</In>
);

// Small inline status line: a tick or a cross, then the words.
const StatusLine = ({ ok, children, size = 28 }: { ok: boolean; children: ReactNode; size?: number }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: size, color: ok ? okGreen : amber, fontWeight: 600 }}>
    <svg viewBox="0 0 36 36" style={{ width: 36, height: 36, flexShrink: 0 }} aria-hidden="true">{ok ? <TickMark x={18} y={20} size={24} /> : <CrossMark x={18} y={18} size={18} color={amber} />}</svg>
    <span>{children}</span>
  </div>
);

// ---------- Icons ----------
// Simple line icons on a 64×64 grid, used in flows and pictures instead of emoji.
type IconKind = 'doc' | 'chat' | 'ok' | 'save' | 'browser' | 'search' | 'think' | 'terminal' | 'folder' | 'globe' | 'down' | 'book' | 'plug' | 'db' | 'sort' | 'edit';

const IconPaths = ({ kind, color }: { kind: IconKind; color: string }) => (
  <g fill="none" stroke={color} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
    {kind === 'doc' && <><path d="M16 6 H40 L50 16 V58 H16 Z" /><path d="M40 6 V16 H50" /><path d="M23 30 H43 M23 39 H43 M23 48 H36" /></>}
    {kind === 'chat' && <><path d="M8 12 H56 V42 H30 L18 53 V42 H8 Z" /><path d="M19 24 H45 M19 32 H37" /></>}
    {kind === 'ok' && <><circle cx="32" cy="32" r="25" /><path d="M20 33 L28 41 L45 23" /></>}
    {kind === 'save' && <><path d="M10 8 H46 L56 18 V56 H10 Z" /><path d="M20 8 V22 H42 V8" /><path d="M19 56 V38 H45 V56" /></>}
    {kind === 'browser' && <><rect x="6" y="10" width="52" height="44" rx="4" /><path d="M6 22 H58" /><path d="M16 34 H48 M16 43 H38" /></>}
    {kind === 'search' && <><circle cx="27" cy="27" r="16" /><path d="M39 39 L54 54" /></>}
    {kind === 'think' && <><path d="M32 7 C20 7 13 16 13 26 C13 34 18 39 22 43 V49 H42 V43 C46 39 51 34 51 26 C51 16 44 7 32 7 Z" /><path d="M24 56 H40" /><path d="M28 61 H36" /></>}
    {kind === 'terminal' && <><rect x="6" y="10" width="52" height="44" rx="4" /><path d="M16 25 L25 32 L16 39" /><path d="M30 41 H45" /></>}
    {kind === 'folder' && <><path d="M6 16 V52 H58 V22 H30 L25 16 Z" /></>}
    {kind === 'globe' && <><circle cx="32" cy="32" r="24" /><path d="M8 32 H56" /><path d="M32 8 C21 18 21 46 32 56 C43 46 43 18 32 8" /></>}
    {kind === 'down' && <><path d="M32 8 V40 M20 28 L32 40 L44 28" /><path d="M10 42 V54 H54 V42" /></>}
    {kind === 'book' && <><path d="M10 12 H28 C31 12 32 14 32 17 V56 C32 53 30 51 27 51 H10 Z" /><path d="M54 12 H36 C33 12 32 14 32 17 V56 C32 53 34 51 37 51 H54 Z" /><path d="M16 24 H26 M16 33 H26 M38 24 H48 M38 33 H48" /></>}
    {kind === 'plug' && <><path d="M22 6 V20 M42 6 V20" /><path d="M14 20 H50 V32 C50 42 42 48 32 48 C22 48 14 42 14 32 Z" /><path d="M32 48 V58" /></>}
    {kind === 'db' && <><ellipse cx="32" cy="14" rx="20" ry="7" /><path d="M12 14 V50 C12 54 21 57 32 57 C43 57 52 54 52 50 V14" /><path d="M12 32 C12 36 21 39 32 39 C43 39 52 36 52 32" /></>}
    {kind === 'sort' && <><path d="M18 10 V54 M8 44 L18 54 L28 44" /><path d="M36 16 H56 M36 30 H52 M36 44 H46" /></>}
    {kind === 'edit' && <><path d="M12 52 L16 38 L44 10 L54 20 L26 48 Z" /><path d="M38 16 L48 26" /><path d="M12 56 H52" /></>}
  </g>
);

const Icon = ({ kind, size = 64, color = ink }: { kind: IconKind; size?: number; color?: string }) => (
  <svg viewBox="0 0 64 64" style={{ width: size, height: size, display: 'block', flexShrink: 0 }} aria-hidden="true"><IconPaths kind={kind} color={color} /></svg>
);

// The same icon placed inside an SVG picture, centred on (x, y).
const SvgIcon = ({ kind, x, y, size = 64, color = ink }: { kind: IconKind; x: number; y: number; size?: number; color?: string }) => (
  <g transform={`translate(${x - size / 2} ${y - size / 2}) scale(${size / 64})`}><IconPaths kind={kind} color={color} /></g>
);

// ---------- Picture helpers ----------
// Pictures are drawn 1:1 on the 1920×1080 canvas, so SVG font sizes are real pixel sizes.
const Figure = ({ w = 1632, h, label, children }: { w?: number; h: number; label: string; children: ReactNode }) => (
  <svg viewBox={`0 0 ${w} ${h}`} style={{ display: 'block', width: w, height: h, overflow: 'visible' }} role="img" aria-label={label}>{children}</svg>
);

// A box that stacks SVG layers on one another, so each <Step> can add one layer.
const Stage = ({ w = 1632, h, children }: { w?: number; h: number; children: ReactNode }) => (
  <div style={{ position: 'relative', width: w, height: h }}>{children}</div>
);

const Layer = ({ w = 1632, h, label, children }: { w?: number; h: number; label?: string; children: ReactNode }) => (
  <svg viewBox={`0 0 ${w} ${h}`} style={{ position: 'absolute', inset: 0, width: w, height: h, overflow: 'visible' }} role={label ? 'img' : undefined} aria-label={label} aria-hidden={label ? undefined : true}>{children}</svg>
);

const DocShape = ({ x, y, w, h, fill = '#FFFFFF', stroke = rule, sw = 2 }: { x: number; y: number; w: number; h: number; fill?: string; stroke?: string; sw?: number }) => (
  <g>
    <path d={`M${x} ${y} H${x + w - 22} L${x + w} ${y + 22} V${y + h} H${x} Z`} fill={fill} stroke={stroke} strokeWidth={sw} />
    <path d={`M${x + w - 22} ${y} V${y + 22} H${x + w}`} fill="none" stroke={stroke} strokeWidth={sw} />
  </g>
);

const TickMark = ({ x, y, size = 30, color = okGreen }: { x: number; y: number; size?: number; color?: string }) => (
  <path d={`M${x - size / 2} ${y} l${size * 0.35} ${size * 0.35} l${size * 0.65} ${-size * 0.7}`} fill="none" stroke={color} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
);

const CrossMark = ({ x, y, size = 26, color = muted }: { x: number; y: number; size?: number; color?: string }) => (
  <path d={`M${x - size / 2} ${y - size / 2} L${x + size / 2} ${y + size / 2} M${x + size / 2} ${y - size / 2} L${x - size / 2} ${y + size / 2}`} stroke={color} strokeWidth="5" strokeLinecap="round" />
);

const OkDot = ({ x, y, r = 22 }: { x: number; y: number; r?: number }) => (
  <g><circle cx={x} cy={y} r={r} fill={okGreen} /><TickMark x={x} y={y + 1} size={r * 0.95} color="#FFFFFF" /></g>
);

const AskMark = ({ x, y, r = 22 }: { x: number; y: number; r?: number }) => (
  <g><circle cx={x} cy={y} r={r} fill={amber} /><text x={x} y={y + r * 0.45} textAnchor="middle" fontSize={r * 1.3} fontWeight="700" fill="#FFFFFF">?</text></g>
);

const MapArrow = ({ x1, x2, y, hot = false }: { x1: number; x2: number; y: number; hot?: boolean }) => (
  <g fill={hot ? amber : faint} stroke={hot ? amber : faint}><line x1={x1} y1={y} x2={x2 - 12} y2={y} strokeWidth={hot ? 4 : 3} /><polygon points={`${x2},${y} ${x2 - 16},${y - 9} ${x2 - 16},${y + 9}`} strokeWidth="0" /></g>
);

const DownArrowSvg = ({ x, y1, y2, color = faint }: { x: number; y1: number; y2: number; color?: string }) => (
  <g fill={color} stroke={color}><line x1={x} y1={y1} x2={x} y2={y2 - 12} strokeWidth="3" /><polygon points={`${x},${y2} ${x - 9},${y2 - 16} ${x + 9},${y2 - 16}`} strokeWidth="0" /></g>
);

// A small chip with text, e.g. a source the answer cites.
const SvgChip = ({ x, y, w, label, fill = '#FFFFFF', stroke = rule, color = ink, size = 24, h = 44 }: { x: number; y: number; w: number; label: string; fill?: string; stroke?: string; color?: string; size?: number; h?: number }) => (
  <g><rect x={x} y={y} width={w} height={h} rx="4" fill={fill} stroke={stroke} strokeWidth="2" /><text x={x + w / 2} y={y + h / 2 + size * 0.36} textAnchor="middle" fontSize={size} fill={color}>{label}</text></g>
);

const Bubble = ({ x, y, w, h, fill = '#FFFFFF', stroke = rule }: { x: number; y: number; w: number; h: number; fill?: string; stroke?: string }) => (
  <path d={`M${x + 12} ${y} H${x + w - 12} Q${x + w} ${y} ${x + w} ${y + 12} V${y + h - 12} Q${x + w} ${y + h} ${x + w - 12} ${y + h} H${x + 60} L${x + 36} ${y + h + 22} L${x + 40} ${y + h} H${x + 12} Q${x} ${y + h} ${x} ${y + h - 12} V${y + 12} Q${x} ${y} ${x + 12} ${y} Z`} fill={fill} stroke={stroke} strokeWidth="2" />
);


// Multi-line SVG text, one tspan per line.
const SvgLines = ({ x, y, lines, size = 26, fill = muted, anchor = 'middle', weight, family }: { x: number; y: number; lines: string[]; size?: number; fill?: string; anchor?: 'start' | 'middle' | 'end'; weight?: number; family?: string }) => (
  <text x={x} y={y} fontSize={size} fill={fill} textAnchor={anchor} fontWeight={weight} fontFamily={family}>
    {lines.map((line, i) => <tspan key={i} x={x} dy={i === 0 ? 0 : size * 1.45}>{line}</tspan>)}
  </text>
);

// A folder tab shape (deck 02 uses the same one).
const Folder = ({ x, y, w, h, fill = amberSoft, stroke = amber, sw = 2 }: { x: number; y: number; w: number; h: number; fill?: string; stroke?: string; sw?: number }) => (
  <path d={`M${x} ${y + 14} V${y + h} H${x + w} V${y + 14} H${x + w * 0.42} L${x + w * 0.36} ${y} H${x} Z`} fill={fill} stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />
);

// People are circles; relation cards are boxes (decks 01 and 02 use the same grammar).
const Person = ({ x, y, name, r = 46, fill = amberSoft, stroke = amber, size = 30 }: { x: number; y: number; name: string; r?: number; fill?: string; stroke?: string; size?: number }) => (
  <g>
    <circle cx={x} cy={y} r={r} fill={fill} stroke={stroke} strokeWidth="2" />
    <text x={x} y={y + size * 0.36} textAnchor="middle" fontSize={size} fill={ink}>{name}</text>
  </g>
);

const RelBox = ({ cx, y, w = 220, label, fill = sage, stroke = okGreen, size = 30 }: { cx: number; y: number; w?: number; label: string; fill?: string; stroke?: string; size?: number }) => (
  <g>
    <rect x={cx - w / 2} y={y} width={w} height="64" fill={fill} stroke={stroke} strokeWidth="2" />
    <text x={cx} y={y + 43} textAnchor="middle" fontSize={size} fill={ink}>{label}</text>
  </g>
);

// A terminal whose lines can be revealed one <Step> at a time.
const TermBox = ({ title, width, size = 26, children }: { title: string; width?: number; size?: number; children: ReactNode }) => (
  <div style={{ width, boxSizing: 'border-box', background: term, color: '#F5F5F4', border: '1px solid #555B60' }}>
    <div style={{ height: 52, display: 'flex', alignItems: 'center', gap: 12, background: '#30343A', padding: '0 26px', boxSizing: 'border-box' }}>
      <span style={{ width: 13, height: 13, borderRadius: 20, background: '#DF6A63' }} />
      <span style={{ width: 13, height: 13, borderRadius: 20, background: '#E9B650' }} />
      <span style={{ width: 13, height: 13, borderRadius: 20, background: '#73BB78' }} />
      <span style={{ fontFamily: mono, color: '#BCC3CC', fontSize: 23, marginLeft: 16 }}>{title}</span>
    </div>
    <div style={{ padding: '24px 34px 30px', fontFamily: mono, fontSize: size, lineHeight: 1.55 }}>{children}</div>
  </div>
);

// One terminal line. `hot` outlines it; `tone` colours it.
const TL = ({ children, tone = 'out', hot = false }: { children?: ReactNode; tone?: 'out' | 'dim' | 'ask' | 'type' | 'bad' | 'note'; hot?: boolean }) => {
  const color = tone === 'dim' ? '#BCC3CC' : tone === 'ask' ? '#E9B650' : tone === 'type' ? '#8DD4A0' : tone === 'bad' ? '#F2A097' : tone === 'note' ? '#E9B650' : '#F5F5F4';
  return (
    <div style={{ whiteSpace: 'pre', color, minHeight: '1.55em', boxSizing: 'border-box', ...(hot ? { outline: '3px solid #E9B650', background: 'rgba(233,182,80,0.16)', margin: '4px -10px', padding: '0 10px' } : {}) }}>{children}</div>
  );
};

// A file shown as a light editor panel (SKILL.md, a note card).
const CodeDoc = ({ title, width, size = 27, children }: { title: string; width?: number; size?: number; children: ReactNode }) => (
  <div style={{ width, boxSizing: 'border-box', background: '#FFFFFF', border: `1px solid ${rule}`, boxShadow: '0 10px 30px rgba(28,25,23,0.08)' }}>
    <div style={{ height: 52, display: 'flex', alignItems: 'center', gap: 12, padding: '0 26px', background: surface, borderBottom: `1px solid ${rule}` }}>
      <Icon kind="doc" size={30} color={muted} />
      <span style={{ fontFamily: mono, fontSize: 24, color: muted }}>{title}</span>
    </div>
    <div style={{ padding: '18px 30px 22px', fontFamily: mono, fontSize: size, lineHeight: 1.5 }}>{children}</div>
  </div>
);

// One line of a CodeDoc. `band` tints it; `n` puts a numbered badge on its right.
const CL = ({ children, band, color = ink, n }: { children?: ReactNode; band?: string; color?: string; n?: number }) => (
  <div style={{ whiteSpace: 'pre', color, background: band, margin: '0 -30px', padding: '0 30px', minHeight: '1.5em', position: 'relative' }}>
    {children}
    {n ? <span style={{ position: 'absolute', right: 14, top: '50%', marginTop: -22 }}><NumDot n={n} /></span> : null}
  </div>
);

// Highlighted words inside a paragraph (before/after rewrites).
const Mk = ({ children, ok = false }: { children: ReactNode; ok?: boolean }) => (
  <span style={{ background: ok ? sage : amberSoft, borderBottom: `3px solid ${ok ? okGreen : amber}`, padding: '0 4px' }}>{children}</span>
);

// A crop of a large real screenshot, enlarged. Crop is in the image's own pixels.
const Crop = ({ src, alt, iw, ih, crop, width, children }: { src: string; alt: string; iw: number; ih: number; crop: [number, number, number, number]; width: number; children?: ReactNode }) => {
  const [x, y, w, h] = crop;
  const s = width / w;
  return (
    <div style={{ position: 'relative', width, height: Math.round(h * s), overflow: 'hidden', background: '#FFFFFF', border: `1px solid ${rule}`, boxShadow: '0 10px 30px rgba(28,25,23,0.08)', flexShrink: 0 }}>
      <img src={src} alt={alt} style={{ position: 'absolute', left: -x * s, top: -y * s, width: iw * s, height: ih * s, maxWidth: 'none' }} />
      {children}
    </div>
  );
};

// The exact sentence learners type, shown once in a quiet box.
const PromptBox = ({ children, size = 34 }: { children: ReactNode; size?: number }) => (
  <div style={{ background: '#FFFFFF', border: `1px solid ${rule}`, borderLeft: `6px solid ${amber}`, padding: '18px 32px', display: 'flex', alignItems: 'center', gap: 22 }}>
    <span style={{ whiteSpace: 'nowrap' }}><SmallLabel>你輸入</SmallLabel></span>
    <span style={{ fontSize: size }}>{children}</span>
  </div>
);

// One stop in a practice flow: a numbered icon, then what to do.
const FlowStep = ({ i, n, kind, label, sub, w = 340 }: { i: number; n: number; kind: IconKind; label: string; sub?: ReactNode; w?: number }) => (
  <In i={i} style={{ width: w, textAlign: 'center', display: 'grid', justifyItems: 'center' }}>
    <div style={{ position: 'relative', width: 140, height: 140, borderRadius: 70, background: '#FFFFFF', border: `2px solid ${rule}`, display: 'grid', placeItems: 'center' }}>
      <Icon kind={kind} size={80} color={ink} />
      <span style={{ position: 'absolute', left: -6, top: -6 }}><NumDot n={n} size={48} /></span>
    </div>
    <div style={{ fontSize: 33, fontWeight: 600, marginTop: 22, lineHeight: 1.35 }}>{label}</div>
    {sub ? <div style={{ fontSize: 25, color: muted, marginTop: 8 }}>{sub}</div> : null}
  </In>
);

const FlowArrow = ({ i }: { i: number }) => <In i={i} style={{ color: faint, fontSize: 60, lineHeight: 1, marginTop: 40 }}>→</In>;

// ---------- Chapter openers ----------

// The lesson's route on a chapter's opening page: five stops, this one in amber.
const TRACK_XS = [150, 483, 816, 1149, 1482];

const TrackStop = ({ x, n, chapter }: { x: number; n: Chapter; chapter: Chapter }) => {
  const now = n === chapter;
  const done = n < chapter;
  return (
    <g>
      {now ? <PopG i={4}><circle cx={x} cy="50" r="34" fill={amber} /><text x={x} y="60" textAnchor="middle" fontSize="28" fontWeight="600" fill="#FFFFFF">{n}</text></PopG>
        : <g><circle cx={x} cy="50" r="22" fill={done ? faint : '#FFFFFF'} stroke={done ? faint : rule} strokeWidth="3" /><text x={x} y="59" textAnchor="middle" fontSize="24" fontWeight="600" fill={done ? '#FFFFFF' : quiet}>{n}</text></g>}
      <text x={x} y="130" textAnchor="middle" fontSize="26" fontWeight={now ? 600 : 400} fill={now ? amber : quiet}>{CHAPTERS[n - 1]}</text>
    </g>
  );
};

const ChapterTrack = ({ chapter }: { chapter: Chapter }) => {
  const cur = TRACK_XS[chapter - 1];
  return (
    <Figure h={170} label={`今天的五章，現在在第 ${chapter} 章：${CHAPTERS[chapter - 1]}`}>
      <line x1={TRACK_XS[0]} y1="50" x2={TRACK_XS[4]} y2="50" stroke={rule} strokeWidth="4" />
      {chapter > 1 ? <g stroke={amber} strokeWidth="5" fill="none"><DrawPath i={1} d={`M${TRACK_XS[0]} 50 H${cur}`} /></g> : null}
      <TrackStop x={TRACK_XS[0]} n={1} chapter={chapter} />
      <TrackStop x={TRACK_XS[1]} n={2} chapter={chapter} />
      <TrackStop x={TRACK_XS[2]} n={3} chapter={chapter} />
      <TrackStop x={TRACK_XS[3]} n={4} chapter={chapter} />
      <TrackStop x={TRACK_XS[4]} n={5} chapter={chapter} />
    </Figure>
  );
};

const SectionPage = ({ chapter, label, lead }: { chapter: Chapter; label: string; lead: string }) => (
  <Shell top={192} chapter={chapter} enterChapter>
    <In i={0}><Eyebrow>{label}</Eyebrow></In>
    <In i={1} style={{ marginTop: 63 }}><Title>{CHAPTERS[chapter - 1]}</Title></In>
    <In i={2} style={{ fontSize: 36, lineHeight: 1.5, color: muted, marginTop: 30, maxWidth: 1500 }}>{lead}</In>
    <div style={{ marginTop: 96 }}><ChapterTrack chapter={chapter} /></div>
  </Shell>
);

// ---------- Opening ----------

const Cover: Page = () => (
  <Shell top={174}>
    <In i={0}><Eyebrow>AI WORKSHOP 03｜第三堂</Eyebrow></In>
    <In i={1} style={{ marginTop: 62 }}><Title>{'Skills\n給 Agent 的做事說明書'}</Title></In>
    <In i={2} style={{ marginTop: 40, fontSize: 35, color: muted }}>安裝、使用，再自己寫一個</In>
    <In i={3} style={{ width: 160, height: 5, background: amber, marginTop: 72 }}><span /></In>
    <In i={4} style={{ marginTop: 40, fontSize: 28, color: muted }}>筆電打開簡報：<strong style={{ fontFamily: mono, fontWeight: 600, color: ink }}>{DECK_SITE}</strong></In>
    <div style={{ position: 'absolute', right: 144, bottom: 170 }}>
      <Figure w={720} h={200} label="說明書交給 Codex，Codex 做出筆記">
        <InG i={3}><circle cx="80" cy="100" r="72" fill={amberSoft} stroke={amber} strokeWidth="2" /><SvgIcon kind="book" x={80} y={100} size={70} color={amber} /></InG>
        <InG i={4}><MapArrow x1={168} x2={232} y={100} /></InG>
        <InG i={5}><circle cx="320" cy="100" r="72" fill="#FFFFFF" stroke={rule} strokeWidth="2" /><SvgIcon kind="terminal" x={320} y={100} size={70} color={muted} /></InG>
        <InG i={6}><MapArrow x1={408} x2={472} y={100} /></InG>
        <InG i={7}><circle cx="560" cy="100" r="72" fill={sage} stroke={okGreen} strokeWidth="2" /><SvgIcon kind="doc" x={560} y={100} size={70} color={okGreen} /></InG>
      </Figure>
    </div>
  </Shell>
);

// One folder row of the vault, drawn inside an SVG picture.
const VaultRow = ({ y, x = 60, name, count, root = false }: { y: number; x?: number; name: string; count?: string; root?: boolean }) => (
  <g>
    <Folder x={x} y={y - 30} w={56} h={42} fill={root ? amber : amberSoft} />
    <text x={x + 76} y={y + 4} fontSize={root ? 36 : 33} fontWeight={root ? 600 : 400} fill={ink}>{name}</text>
    {count ? <text x={x + 220} y={y + 4} fontSize="28" fill={muted}>{count}</text> : null}
  </g>
);

// Catch-up route for anyone without the vault from lesson 2: a link they can click on the laptop.
const VaultDownload = () => (
  <a href={VAULT_ZIP_URL} download="三國人物知識庫.zip" style={{ position: 'absolute', top: 176, right: 144, display: 'flex', alignItems: 'center', gap: 16, textDecoration: 'none', color: muted, fontSize: 24, lineHeight: 1.4, textAlign: 'right' }}>
    <span>沒有筆記庫？<br /><strong style={{ color: amber }}>下載 三國人物知識庫.zip</strong></span>
    <span style={{ width: 64, height: 64, display: 'grid', placeItems: 'center', background: amber }}><Icon kind="save" size={38} color="#FFFFFF" /></span>
  </a>
);

const Review: Page = () => (
  <Shell>
    <Eyebrow>回顧｜第二堂</Eyebrow>
    <Heading>回顧：第二堂的三國筆記庫</Heading>
    <Fit>
      <Stage h={470}>
        <Steps>
          <Layer h={470} label="筆記庫的資料夾：人物 5 張、勢力 3 張、關係 3 張、原文有第 1–21 回和三份節選、整理裡有大綱；右邊是五位人物和三張關係卡">
            <InG i={0}>
              <VaultRow y={50} x={0} name="三國人物知識庫" root />
              <VaultRow y={130} name="人物" count="5 張人物卡" />
              <VaultRow y={200} name="勢力" count="3 張" />
              <VaultRow y={270} name="關係" count="3 張關係卡" />
              <VaultRow y={340} name="原文" count="第 1–21 回＋節選" />
              <VaultRow y={410} name="整理" count="大綱" />
            </InG>
            <InG i={1}>
              <Person x={880} y={100} name="劉備" />
              <Person x={880} y={232} name="關羽" />
              <Person x={880} y={372} name="張飛" />
              <Person x={1520} y={162} name="曹操" />
              <Person x={1520} y={342} name="孫權" />
              <RelBox cx={1200} y={60} label="桃園結義" />
              <RelBox cx={1200} y={200} label="煮酒論英雄" />
              <RelBox cx={1200} y={340} label="赤壁之戰" />
            </InG>
          </Layer>
          <Step duration={STEP_MS}><Layer h={470} label="十條線把人物連到關係卡">
            <g fill="none" stroke={okGreen} strokeWidth="3">
              <StepPath d="M926 100 L1090 92" i={0} />
              <StepPath d="M926 100 L1090 232" i={0} />
              <StepPath d="M926 100 L1090 372" i={0} />
              <StepPath d="M926 232 L1090 92" i={1} />
              <StepPath d="M926 232 L1090 372" i={1} />
              <StepPath d="M926 372 L1090 92" i={2} />
              <StepPath d="M926 372 L1090 372" i={2} />
              <StepPath d="M1474 162 L1310 232" i={3} />
              <StepPath d="M1474 162 L1310 372" i={3} />
              <StepPath d="M1474 342 L1310 372" i={4} />
            </g>
            <g className="aw3-build" style={buildDelay(5)}><circle cx="880" cy="448" r="13" fill={amberSoft} stroke={amber} strokeWidth="2" /><text x="902" y="457" fontSize="26" fill={muted}>人物卡</text>
              <rect x="1010" y="436" width="34" height="24" fill={sage} stroke={okGreen} strokeWidth="2" /><text x="1056" y="457" fontSize="26" fill={muted}>關係卡</text>
              <line x1="1160" y1="448" x2="1210" y2="448" stroke={okGreen} strokeWidth="3" /><text x="1222" y="457" fontSize="26" fill={muted}>卡片寫了他參與（共 10 條）</text></g>
          </Layer></Step>
        </Steps>
      </Stage>
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={28}>今天用 Skill 擴充它，再排出時間軸</Takeaway></Step></Steps>
    </Fit>
    <VaultDownload />
  </Shell>
);

// A table-of-contents row: chapter, what everyone finishes, what's optional, time and page.
const AGENDA_COLS = '80px 360px 1fr 380px 150px';

const AgendaRow = ({ i, n, must, opt, time, page }: { i: number; n: Chapter; must: string; opt?: string; time: string; page: Page }) => (
  <In i={i} style={{ display: 'grid', gridTemplateColumns: AGENDA_COLS, alignItems: 'center', minHeight: 100, borderBottom: `1px solid ${rule}` }}>
    <span style={{ fontFamily: display, fontSize: 38, color: amber }}>{String(n).padStart(2, '0')}</span>
    <span style={{ fontSize: 30, fontWeight: 600 }}>{CHAPTERS[n - 1]}</span>
    <span style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 30 }}><Icon kind="ok" size={38} color={okGreen} />{must}</span>
    <span style={{ fontSize: 28, color: opt ? muted : faint }}>{opt ?? '—'}</span>
    <span style={{ textAlign: 'right' }}><span style={{ display: 'block', fontSize: 26, color: amber }}>{time}</span><span style={{ display: 'block', fontSize: 24, color: quiet, marginTop: 4 }}>第 {pageOf(page)} 頁</span></span>
  </In>
);

const Agenda: Page = () => (
  <Shell>
    <Eyebrow>AGENDA｜120 分鐘，四個練習</Eyebrow>
    <Heading>課程大綱</Heading>
    <Fit>
      <div style={{ display: 'grid', gridTemplateColumns: AGENDA_COLS, paddingBottom: 12, borderBottom: `1px solid ${rule}` }}>
        <span /><SmallLabel>章節</SmallLabel><SmallLabel color={okGreen}>必做（全員完成）</SmallLabel><SmallLabel color={quiet}>選做</SmallLabel><span style={{ textAlign: 'right' }}><SmallLabel>時間｜頁</SmallLabel></span>
      </div>
      <AgendaRow i={0} n={1} must="看懂一份 SKILL.md" time="10–35 分" page={Section1} />
      <AgendaRow i={1} n={2} must="裝好兩個 Skill" time="35–50 分" page={Section2} />
      <AgendaRow i={2} n={3} must="畫一張圖、改寫一張卡" opt="標籤疊到就修" time="50–70 分" page={Section3} />
      <AgendaRow i={3} n={4} must="照原文新增三張卡" time="70–85 分" page={Section4} />
      <AgendaRow i={4} n={5} must="sanguo-timeline 跑出一次結果" opt="只排劉備的事件" time="85–112 分" page={Section5} />
    </Fit>
  </Shell>
);

// ---------- 01 什麼是 Skill ----------

const Section1: Page = () => <SectionPage chapter={1} label="01 / SKILL" lead="交給 Agent 的一份做事說明" />;

// One Session where the same four-line request is typed again.
const PromptSession = ({ x, n, who }: { x: number; n: number; who: string }) => (
  <g>
    <rect x={x} y="10" width="500" height="410" fill="#FFFFFF" stroke={ink} strokeWidth="2" />
    <text x={x + 28} y="58" fontSize="30" fontWeight="600" fill={ink}>Session {n}</text>
    <Bubble x={x + 24} y={84} w={452} h={226} fill={amberSoft} stroke={amber} />
    <SvgLines x={x + 52} y={132} anchor="start" size={28} fill={ink} lines={[`把〈${who}〉改寫成國中生版`, '只用卡片裡的內容', '保留 [[連結]]', '存到 整理/']} />
    <text x={x + 250} y="392" textAnchor="middle" fontSize="28" fontWeight="600" fill={amber}>第 {n} 次打這四行</text>
  </g>
);

const RepeatPrompt: Page = () => (
  <Shell chapter={1} source={'Anthropic 2025, Equipping Agents for the Real World with Agent Skills'}>
    <Eyebrow>為什麼需要 Skill</Eyebrow>
    <Heading>同一類工作，提示詞要一直重打</Heading>
    <Fit>
      <Stage h={430}>
        <Steps>
          <Layer h={430} label="Session 1：打四行要求，改寫劉備卡">
            <InG i={0}><PromptSession x={0} n={1} who="劉備" /></InG>
          </Layer>
          <Step duration={STEP_MS}><Layer h={430} label="Session 2：同樣四行，只換成關羽">
            <g className="aw3-build" style={buildDelay(0, 0)}><PromptSession x={566} n={2} who="關羽" /></g>
          </Layer></Step>
          <Step duration={STEP_MS}><Layer h={430} label="Session 3：同樣四行，只換成張飛">
            <g className="aw3-build" style={buildDelay(0, 0)}><PromptSession x={1132} n={3} who="張飛" /></g>
          </Layer></Step>
        </Steps>
      </Stage>
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={40}>做法都一樣，只換了卡片</Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

// The three parts of a recipe card, matched to the three parts of SKILL.md.
const SkillIsSop: Page = () => (
  <Shell chapter={1} source={'Agent Skills 說明 agentskills.io/what-are-skills；Codex Skills developers.openai.com/codex/skills'}>
    <Eyebrow>Skill＝寫好的做事方法</Eyebrow>
    <Heading>Agent Skill（代理人技能）</Heading>
    <Lead>像食譜：菜名、做法、成品長怎樣</Lead>
    <Fit>
      <Stage h={450}>
        <Steps>
          <Layer h={450} label="一張食譜：番茄炒蛋，想吃下飯菜時；做法三步；成品一盤炒蛋">
            <InG i={0}>
              <rect x="60" y="0" width="560" height="440" fill="#FFFFFF" stroke={rule} strokeWidth="2" />
              <text x="92" y="44" fontSize="24" fontWeight="600" fill={amber} letterSpacing="2">食譜</text>
              <text x="92" y="98" fontSize="42" fontWeight="600" fill={ink}>番茄炒蛋</text>
              <text x="92" y="138" fontSize="27" fill={muted}>想吃下飯菜的時候</text>
              <line x1="60" y1="160" x2="620" y2="160" stroke={rule} strokeWidth="2" />
              <text x="92" y="200" fontSize="24" fontWeight="600" fill={amber} letterSpacing="2">做法</text>
              <SvgLines x={92} y={236} anchor="start" size={28} fill={ink} lines={['1　打蛋', '2　炒番茄', '3　倒在一起']} />
              <line x1="60" y1="340" x2="620" y2="340" stroke={rule} strokeWidth="2" />
              <text x="92" y="380" fontSize="24" fontWeight="600" fill={amber} letterSpacing="2">成品</text>
              <text x="92" y="420" fontSize="30" fill={ink}>一盤炒蛋</text>
              <ellipse cx="520" cy="392" rx="62" ry="30" fill={amberSoft} stroke={amber} strokeWidth="2" />
            </InG>
          </Layer>
          <Step duration={STEP_MS}><Layer h={450} label="SKILL.md 也有三塊：name 和 description、步驟、輸出格式">
            <g className="aw3-build" style={buildDelay(0)}>
              <MapArrow x1={640} x2={990} y={96} hot />
              <text x="815" y="78" textAnchor="middle" fontSize="26" fill={muted}>叫什麼、何時用</text>
              <MapArrow x1={640} x2={990} y={256} hot />
              <text x="815" y="238" textAnchor="middle" fontSize="26" fill={muted}>怎麼做</text>
              <MapArrow x1={640} x2={990} y={396} hot />
              <text x="815" y="378" textAnchor="middle" fontSize="26" fill={muted}>做成什麼樣</text>
            </g>
            <g className="aw3-build" style={buildDelay(1)}>
              <DocShape x={1012} y={0} w={560} h={440} fill={amberSoft} stroke={amber} sw={3} />
              <text x="1044" y="44" fontSize="24" fontWeight="600" fontFamily={mono} fill={amber}>SKILL.md</text>
              <text x="1044" y="98" fontSize="34" fontFamily={mono} fill={ink}>name: eli5</text>
              <text x="1044" y="138" fontSize="27" fontFamily={mono} fill={muted}>description: 何時用</text>
              <line x1="1012" y1="160" x2="1572" y2="160" stroke={amber} strokeWidth="2" />
              <text x="1044" y="200" fontSize="24" fontWeight="600" fill={amber} letterSpacing="2">步驟</text>
              <SvgLines x={1044} y={236} anchor="start" size={28} fill={ink} lines={['1　讀資料', '2　照規則改寫', '3　存成新檔']} />
              <line x1="1012" y1="340" x2="1572" y2="340" stroke={amber} strokeWidth="2" />
              <text x="1044" y="380" fontSize="24" fontWeight="600" fill={amber} letterSpacing="2">輸出格式</text>
              <text x="1044" y="420" fontSize="30" fill={ink}>存在哪、長怎樣</text>
            </g>
          </Layer></Step>
        </Steps>
      </Stage>
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={32}>寫一次，Agent 每次照著做</Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

const SkillFolder: Page = () => (
  <Shell chapter={1} source={'Agent Skills 規格 agentskills.io/specification；範例 github.com/cathrynlavery/diagram-design'}>
    <Eyebrow>Skill 長什麼樣子</Eyebrow>
    <Heading>Skill 的資料夾結構</Heading>
    <Fit>
      <Stage h={450}>
        <Steps>
          <Layer h={450} label="eli5 資料夾裡只有一個 SKILL.md">
            <InG i={0}>
              <Folder x={80} y={30} w={560} h={330} />
              <text x="120" y="110" fontSize="38" fontFamily={mono} fontWeight="600" fill={ink}>eli5/</text>
              <DocShape x={150} y={140} w={190} h={190} fill="#FFFFFF" stroke={amber} sw={3} />
              <text x="245" y="248" textAnchor="middle" fontSize="28" fontFamily={mono} fill={ink}>SKILL.md</text>
              <text x="360" y="420" textAnchor="middle" fontSize="30" fill={muted}>只有一個檔</text>
            </InG>
          </Layer>
          <Step duration={STEP_MS}><Layer h={450} label="diagram-design 資料夾：SKILL.md 加上 references、scripts、assets 附件">
            <g className="aw3-build" style={buildDelay(0)}>
              <Folder x={880} y={30} w={720} h={330} fill={blueSoft} stroke={blue} />
              <text x="920" y="110" fontSize="38" fontFamily={mono} fontWeight="600" fill={ink}>diagram-design/</text>
              <DocShape x={950} y={140} w={190} h={190} fill="#FFFFFF" stroke={amber} sw={3} />
              <text x="1045" y="248" textAnchor="middle" fontSize="28" fontFamily={mono} fill={ink}>SKILL.md</text>
            </g>
            <g className="aw3-build" style={buildDelay(1)}>
              <Folder x={1200} y={150} w={52} h={40} fill="#FFFFFF" stroke={blue} />
              <text x="1270" y="182" fontSize="28" fontFamily={mono} fill={ink}>references/</text>
              <Folder x={1200} y={215} w={52} h={40} fill="#FFFFFF" stroke={blue} />
              <text x="1270" y="247" fontSize="28" fontFamily={mono} fill={ink}>scripts/</text>
              <Folder x={1200} y={280} w={52} h={40} fill="#FFFFFF" stroke={blue} />
              <text x="1270" y="312" fontSize="28" fontFamily={mono} fill={ink}>assets/</text>
              <text x="1240" y="420" textAnchor="middle" fontSize="30" fill={muted}>SKILL.md 加上附件</text>
            </g>
          </Layer></Step>
        </Steps>
      </Stage>
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={32}>一定有 SKILL.md，其他都是附件</Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

const SkillAnatomy: Page = () => (
  <Shell chapter={1} source={'Agent Skills 規格（frontmatter、name、description）agentskills.io/specification'}>
    <Eyebrow>SKILL.md 的結構</Eyebrow>
    <Heading>SKILL.md 檔案結構</Heading>
    <Fit>
      <div style={{ display: 'grid', gridTemplateColumns: '980px 1fr', gap: 64, alignItems: 'center' }}>
        <In i={0}>
          <CodeDoc title="SKILL.md" size={34}>
            <CL band={amberSoft}>---</CL>
            <CL band={amberSoft} n={1}>name: 技能名稱</CL>
            <CL band={amberSoft}>description: 做什麼、何時用</CL>
            <CL band={amberSoft}>---</CL>
            <CL band={blueSoft} n={2}>## 步驟</CL>
            <CL band={blueSoft}>1. 先讀……</CL>
            <CL band={sage} n={3}>## 輸出格式</CL>
            <CL band={sage}>- 存在哪、長怎樣</CL>
          </CodeDoc>
        </In>
        <div style={{ display: 'grid', gap: 44 }}>
          <Steps>
            <Step duration={STEP_MS}><Callout n={1} title="name、description" detail="叫什麼、什麼時候用" /></Step>
            <Step duration={STEP_MS}><Callout n={2} title="步驟" detail="一步一步怎麼做" /></Step>
            <Step duration={STEP_MS}><Callout n={3} title="輸出格式" detail="做完長什麼樣子" /></Step>
          </Steps>
        </div>
      </div>
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={36}>何時用、怎麼做、做成什麼樣</Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

const Eli5Skill: Page = () => (
  <Shell chapter={1} source={'eli5 原始檔 github.com/dreambigou/eli5'}>
    <Eyebrow>真實範例｜eli5</Eyebrow>
    <Heading>打開 eli5 的 SKILL.md</Heading>
    <Fit>
      <div style={{ display: 'grid', gridTemplateColumns: '1060px 1fr', gap: 56, alignItems: 'center' }}>
        <In i={0}>
          <CodeDoc title="~/.agents/skills/eli5/SKILL.md（節錄）" size={31}>
            <CL band={amberSoft}>---</CL>
            <CL band={amberSoft} n={1}>name: eli5</CL>
            <CL band={amberSoft} n={2}>description: "Explain any topic, code,</CL>
            <CL band={amberSoft}>  concept, or error tailored to a specific</CL>
            <CL band={amberSoft}>  audience's level of understanding.</CL>
            <CL band={amberSoft}>  Use this skill whenever the user says</CL>
            <CL band={amberSoft}>  … 'ELI5', 'dumb it down', …"</CL>
            <CL band={amberSoft}>---</CL>
            <CL band={blueSoft} n={3}>## Step 1: Identify the Audience</CL>
            <CL color={quiet}>……</CL>
          </CodeDoc>
        </In>
        <div style={{ display: 'grid', gap: 40 }}>
          <Steps>
            <Step duration={STEP_MS}><Callout n={1} title="name" detail="它叫 eli5" /></Step>
            <Step duration={STEP_MS}><Callout n={2} title="description" detail="寫滿了何時該用它" /></Step>
            <Step duration={STEP_MS}><Callout n={3} title="Step 1" detail="先認出聽眾是誰" /></Step>
            <Step duration={STEP_MS}><div style={{ fontFamily: display, fontSize: 40, lineHeight: 1.35, color: amber }}>就是一份普通的文字檔</div></Step>
          </Steps>
        </div>
      </div>
    </Fit>
  </Shell>
);

// One installed Skill on the shelf: its name and the gist of its description.
const SkillSpine = ({ x, name, lines, hot = false }: { x: number; name: string; lines: string[]; hot?: boolean }) => (
  <g>
    <rect x={x} y="170" width="360" height="210" fill={hot ? amberSoft : '#FFFFFF'} stroke={hot ? amber : rule} strokeWidth={hot ? 5 : 2} />
    <text x={x + 28} y="222" fontSize="30" fontWeight="600" fontFamily={mono} fill={hot ? amber : ink}>{name}</text>
    <SvgLines x={x + 28} y={278} anchor="start" size={27} fill={muted} lines={lines} />
  </g>
);

const DescriptionTrigger: Page = () => (
  <Shell chapter={1} source={'Codex Skills 文件（依 description 自動挑選）developers.openai.com/codex/skills'}>
    <Eyebrow>description＝什麼時候用</Eyebrow>
    <Heading>隱式啟用（Implicit Invocation）</Heading>
    <Lead>Codex 依 description 判斷該用哪個 Skill</Lead>
    <Fit>
      <Stage h={420}>
        <Steps>
          <Layer h={420} label="你說：把劉備卡用國中生聽得懂的方式重新說一次。架上有四個 Skill：diagram-design、eli5、speak-human-tw、pdf">
            <InG i={0}>
              <rect x="316" y="0" width="1000" height="74" rx="37" fill={amberSoft} stroke={amber} strokeWidth="2" />
              <text x="816" y="48" textAnchor="middle" fontSize="31" fill={ink}>把劉備卡用國中生聽得懂的方式重新說一次</text>
            </InG>
            <InG i={1}>
              <SkillSpine x={0} name="diagram-design" lines={['畫架構圖、流程圖', '各類圖表']} />
              <SkillSpine x={424} name="eli5" lines={['依對象用白話', '解釋複雜概念']} />
              <SkillSpine x={848} name="speak-human-tw" lines={['中文去 AI 味', '改得像真人寫的']} />
              <SkillSpine x={1272} name="pdf" lines={['讀取、建立', '檢查 PDF']} />
              <line x1="0" y1="398" x2="1632" y2="398" stroke={faint} strokeWidth="6" />
            </InG>
          </Layer>
          <Step duration={STEP_MS}><Layer h={420} label="Codex 比對 description，挑中 eli5">
            <g fill="none" stroke={amber} strokeWidth="4"><StepPath d="M760 78 C700 110 640 130 604 164" /></g>
            <g className="aw3-build" style={buildDelay(1)}>
              <SkillSpine x={424} name="eli5" lines={['依對象用白話', '解釋複雜概念']} hot />
              <OkDot x={760} y={190} r={24} />
              <text x="790" y="132" fontSize="27" fontWeight="600" fill={amber}>對上了</text>
            </g>
          </Layer></Step>
        </Steps>
      </Stage>
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={36}>寫清楚何時用，比較容易被挑中</Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

const CallByName: Page = () => (
  <Shell chapter={1} source={'Codex Skills 文件（點名與自動挑選）developers.openai.com/codex/skills'}>
    <Eyebrow>兩種叫法</Eyebrow>
    <Heading>顯式啟用（Explicit Invocation）</Heading>
    <Fit>
      <Stage h={430}>
        <Steps>
          <Layer h={430} label="自動挑：沒寫名稱，Codex 比對 description，可能挑中 eli5">
            <InG i={0}>
              <text x="0" y="36" fontSize="28" fontWeight="600" fill={quiet} letterSpacing="2">自動挑</text>
              <rect x="0" y="62" width="760" height="96" fill="#FFFFFF" stroke={rule} strokeWidth="2" />
              <text x="34" y="122" fontSize="31" fill={ink}>把劉備卡改成國中生看得懂的版本</text>
            </InG>
            <InG i={1}>
              <MapArrow x1={772} x2={852} y={110} />
              <rect x="864" y="62" width="320" height="96" fill={term} />
              <text x="1024" y="102" textAnchor="middle" fontSize="27" fontFamily={mono} fill="#F5F5F4">Codex</text>
              <text x="1024" y="140" textAnchor="middle" fontSize="24" fill="#BCC3CC">比對 description</text>
              <MapArrow x1={1196} x2={1276} y={110} />
              <rect x="1288" y="62" width="344" height="96" fill="#FFFFFF" stroke={faint} strokeWidth="2" strokeDasharray="10 8" />
              <AskMark x={1336} y={110} r={24} />
              <text x="1376" y="120" fontSize="30" fill={muted}>可能挑中</text>
            </InG>
          </Layer>
          <Step duration={STEP_MS}><Layer h={430} label="點名：提示詞直接寫「請使用 eli5 skill」，一定用 eli5">
            <g className="aw3-build" style={buildDelay(0)}>
              <text x="0" y="266" fontSize="28" fontWeight="600" fill={amber} letterSpacing="2">點名</text>
              <rect x="0" y="292" width="1184" height="96" fill={amberSoft} stroke={amber} strokeWidth="2" />
              <text x="34" y="352" fontSize="31" fill={ink}>請使用 <tspan fontWeight="700" fill={amber} fontFamily={mono}>eli5 skill</tspan>，把 人物/劉備.md 用國中生聽得懂……</text>
            </g>
            <g className="aw3-build" style={buildDelay(1)}>
              <MapArrow x1={1196} x2={1276} y={340} hot />
              <rect x="1288" y="292" width="344" height="96" fill={sage} stroke={okGreen} strokeWidth="2" />
              <OkDot x={1336} y={340} r={24} />
              <text x="1376" y="350" fontSize="30" fontWeight="600" fill={okGreen}>一定用 eli5</text>
            </g>
          </Layer></Step>
        </Steps>
      </Stage>
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={36}>自動挑可能漏掉，點名最可靠</Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

// One line of the skill index Codex keeps at the start of a Session.
const IndexRow = ({ y, name, gist }: { y: number; name: string; gist: string }) => (
  <g>
    <SvgIcon kind="book" x={52} y={y - 10} size={36} color={amber} />
    <text x="88" y={y} fontSize="28" fontFamily={mono} fontWeight="600" fill={ink}>{name}</text>
    <text x="88" y={y + 38} fontSize="25" fill={muted}>{gist}</text>
  </g>
);

const LoadOnUse: Page = () => (
  <Shell chapter={1} source={'Codex Skills 文件（progressive disclosure）developers.openai.com/codex/skills'}>
    <Eyebrow>Codex 怎麼讀 Skill</Eyebrow>
    <Heading>漸進式揭露（Progressive Disclosure）</Heading>
    <Fit>
      <div style={{ display: 'grid', gridTemplateColumns: '600px 1fr', gap: 56, alignItems: 'center' }}>
        <In i={0}>
          <Figure w={600} h={470} label="開 Session 時，Codex 只先記下每個 Skill 的名稱和一句說明">
            <rect x="0" y="0" width="600" height="470" fill="#FFFFFF" stroke={rule} strokeWidth="2" />
            <text x="32" y="52" fontSize="27" fontWeight="600" fill={quiet} letterSpacing="2">開 Session 時先記下</text>
            <IndexRow y={124} name="eli5" gist="依對象用白話解釋" />
            <IndexRow y={222} name="diagram-design" gist="畫各類圖表" />
            <IndexRow y={320} name="speak-human-tw" gist="中文去 AI 味" />
            <text x="300" y="430" textAnchor="middle" fontSize="27" fill={amber}>只有名稱和 description</text>
          </Figure>
        </In>
        <div>
          <Steps>
            <Step duration={STEP_MS}>
              <TermBox title="Codex 實際紀錄（節錄）" size={25}>
                <TL tone="ask">› 請使用 eli5 skill，把 人物/劉備.md ……</TL>
                <TL tone="dim">• 我會使用 eli5 skill，把原卡片改寫成……</TL>
                <TL hot><Typed>$</Typed> sed -n '1,240p' ~/.agents/skills/eli5/SKILL.md</TL>
                <TL><Typed>$</Typed> sed -n '1,260p' 人物/劉備.md</TL>
              </TermBox>
            </Step>
            <Step duration={STEP_MS}><div style={{ display: 'flex', alignItems: 'center', gap: 18, marginTop: 30, fontSize: 32 }}><NumDot n={1} /><span>黃框這行：要做事了，才讀整份 SKILL.md</span></div></Step>
          </Steps>
        </div>
      </div>
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={40}>平常只看 description，用到才讀全文</Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

// One cell of the "which Session uses what" grid.
const UseCell = ({ on, label = '拿出來用' }: { on: boolean; label?: string }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, height: 100, background: on ? amberSoft : 'transparent', borderLeft: `1px solid ${rule}`, fontSize: 30, fontWeight: on ? 600 : 400, color: on ? amber : faint }}>
    {on ? <Icon kind="ok" size={40} color={amber} /> : null}
    <span>{on ? label : '—'}</span>
  </div>
);

const USE_COLS = '330px 1fr 1fr 1fr';

const UseRow = ({ name, sub, children }: { name: string; sub: string; children: ReactNode }) => (
  <div style={{ display: 'grid', gridTemplateColumns: USE_COLS, alignItems: 'center', borderBottom: `1px solid ${rule}` }}>
    <div style={{ padding: '0 20px' }}>
      <div style={{ fontFamily: mono, fontSize: 30, fontWeight: 600 }}>{name}</div>
      <div style={{ fontSize: 24, color: quiet, marginTop: 2 }}>{sub}</div>
    </div>
    {children}
  </div>
);

const PromptAgentsSkill: Page = () => (
  <Shell chapter={1} source={'Codex 文件 developers.openai.com/codex/guides/agents-md；developers.openai.com/codex/skills'}>
    <Eyebrow>比較 1｜三種交代方式</Eyebrow>
    <Heading>Prompt、AGENTS.md、Skill 差在哪</Heading>
    <Lead>便條紙、教室公約、食譜</Lead>
    <Fit>
      <div style={{ borderTop: `3px solid ${rule}` }}>
        <div style={{ display: 'grid', gridTemplateColumns: USE_COLS, background: raised, fontSize: 26, fontWeight: 600, color: muted }}>
          <div style={{ padding: '14px 20px' }}>三個 Session</div>
          <div style={{ padding: '14px 20px', textAlign: 'center' }}>1｜問劉備是誰</div>
          <div style={{ padding: '14px 20px', textAlign: 'center' }}>2｜改寫劉備卡</div>
          <div style={{ padding: '14px 20px', textAlign: 'center' }}>3｜畫關係圖</div>
        </div>
        <Steps>
          <UseRow name="Prompt" sub="例：這次回答短一點">
            <UseCell on label="只管這次" /><UseCell on={false} /><UseCell on={false} />
          </UseRow>
          <Step duration={STEP_MS}><UseRow name="AGENTS.md" sub="專案規則">
            <UseCell on label="讀了" /><UseCell on label="讀了" /><UseCell on label="讀了" />
          </UseRow></Step>
          <Step duration={STEP_MS}><div>
            <UseRow name="eli5" sub="Skill">
              <UseCell on={false} /><UseCell on /><UseCell on={false} />
            </UseRow>
            <UseRow name="diagram-design" sub="Skill">
              <UseCell on={false} /><UseCell on={false} /><UseCell on />
            </UseRow>
          </div></Step>
        </Steps>
      </div>
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={30}>說一次、每次讀、用到才拿</Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

// One outside tool MCP can plug Codex into.
const ToolChip = ({ y, kind, label }: { y: number; kind: IconKind; label: string }) => (
  <g>
    <rect x="1232" y={y} width="400" height="72" fill="#FFFFFF" stroke={blue} strokeWidth="2" />
    <SvgIcon kind={kind} x={1274} y={y + 36} size={40} color={blue} />
    <text x="1314" y={y + 46} fontSize="30" fill={ink}>{label}</text>
  </g>
);

const SkillChip = ({ y, label }: { y: number; label: string }) => (
  <g>
    <rect x="0" y={y} width="400" height="72" fill={amberSoft} stroke={amber} strokeWidth="2" />
    <SvgIcon kind="book" x={42} y={y + 36} size={40} color={amber} />
    <text x="82" y={y + 46} fontSize="29" fontFamily={mono} fill={ink}>{label}</text>
  </g>
);

const McpPlug: Page = () => (
  <Shell chapter={1} source={'Anthropic 2024, Introducing the Model Context Protocol；modelcontextprotocol.io'}>
    <Eyebrow>比較 2｜MCP</Eyebrow>
    <Heading>模型上下文協定（MCP）</Heading>
    <Lead>讓 Codex 連接外部工具與資料</Lead>
    <Fit>
      <Stage h={420}>
        <Steps>
          <Layer h={420} label="左邊是 Skill：教 Codex 怎麼做，例如 eli5、diagram-design">
            <InG i={0}>
              <text x="0" y="44" fontSize="30" fontWeight="600" fill={amber}>Skill：做法</text>
              <SkillChip y={100} label="eli5" />
              <SkillChip y={200} label="diagram-design" />
              <SkillChip y={300} label="sanguo-timeline" />
            </InG>
            <InG i={1}>
              <MapArrow x1={412} x2={630} y={236} hot />
              <text x="521" y="216" textAnchor="middle" fontSize="26" fill={muted}>教它怎麼做</text>
              <rect x="642" y="150" width="348" height="172" fill={term} />
              <text x="816" y="248" textAnchor="middle" fontSize="38" fontFamily={mono} fill="#F5F5F4">&gt;_ Codex</text>
            </InG>
          </Layer>
          <Step duration={STEP_MS}><Layer h={420} label="右邊是 MCP：把 Codex 接到 GitHub、Google Drive、資料庫">
            <g className="aw3-build" style={buildDelay(0)}>
              <text x="1232" y="44" fontSize="30" fontWeight="600" fill={blue}>MCP：接上工具</text>
              <SvgIcon kind="plug" x={1060} y={236} size={64} color={blue} />
            </g>
            <g fill="none" stroke={blue} strokeWidth="3">
              <StepPath d="M1000 236 H1030" i={0} />
              <StepPath d="M1092 236 C1160 236 1160 136 1232 136" i={1} />
              <StepPath d="M1092 236 H1232" i={2} />
              <StepPath d="M1092 236 C1160 236 1160 336 1232 336" i={3} />
            </g>
            <g className="aw3-build" style={buildDelay(3)}>
              <ToolChip y={100} kind="globe" label="GitHub" />
              <ToolChip y={200} kind="folder" label="Google Drive" />
              <ToolChip y={300} kind="db" label="公司資料庫" />
            </g>
          </Layer></Step>
        </Steps>
      </Stage>
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={40}>Skill 教做法，MCP 接工具</Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

const CMP_COLS = '240px 1fr 1fr 1.25fr';

const CompareTable: Page = () => (
  <Shell chapter={1} source={'Codex 文件 developers.openai.com/codex（guides/agents-md、skills、mcp）'}>
    <Eyebrow>比較 3｜放在一起</Eyebrow>
    <Heading>四種東西放在一起比</Heading>
    <Fit>
      <div style={{ borderTop: `3px solid ${rule}` }}>
        <TRow head cols={CMP_COLS} cells={['名稱', '是什麼', '什麼時候用', '三國例子']} />
        <Steps>
          <Step duration={STEP_MS}><TRow cols={CMP_COLS} size={31} cells={[<strong>Prompt</strong>, '這一次的要求', '只做一次的事', '把劉備卡改短一點']} /></Step>
          <Step duration={STEP_MS}><TRow cols={CMP_COLS} size={31} cells={[<strong style={{ fontFamily: mono }}>AGENTS.md</strong>, '這個專案的規則', '每次都要遵守', '回答都附檔名']} /></Step>
          <Step duration={STEP_MS}><TRow cols={CMP_COLS} size={31} tint={amberSoft} cells={[<strong>Skill</strong>, '一類工作的做法', '常常重複做', 'eli5 改成國中生版']} /></Step>
          <Step duration={STEP_MS}><TRow cols={CMP_COLS} size={31} tint={blueSoft} cells={[<strong>MCP</strong>, '連到外部工具', '要查外部系統', '讀 GitHub 上的檔案']} /></Step>
        </Steps>
      </div>
      <Steps>
        <Step duration={STEP_MS}><Takeaway marginTop={36}>先問：會重複嗎？要接外面嗎？</Takeaway></Step>
        <Step duration={STEP_MS}><div style={{ display: 'flex', justifyContent: 'center', marginTop: 22 }}><div style={{ background: '#FFFFFF', border: `2px dashed ${amber}`, padding: '12px 30px', fontSize: 32 }}>換你：想一個自己的需求，它是哪一種？</div></div></Step>
      </Steps>
    </Fit>
  </Shell>
);

// One quiz scenario; its answer arrives on a click.
const QuizCard = ({ n, scene, answer, why, tone }: { n: number; scene: string; answer: string; why: string; tone: 'skill' | 'mcp' }) => {
  const c = tone === 'skill' ? amber : blue;
  const soft = tone === 'skill' ? amberSoft : blueSoft;
  return (
    <div style={{ background: '#FFFFFF', border: `1px solid ${rule}`, borderTop: `5px solid ${c}`, padding: '30px 38px 34px', height: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' }}>
      <SmallLabel color={quiet}>情境 {n}</SmallLabel>
      <div style={{ fontSize: 38, lineHeight: 1.45, marginTop: 16, minHeight: 166 }}>{scene}</div>
      <div style={{ borderTop: `1px dashed ${rule}`, marginTop: 20, paddingTop: 26, minHeight: 170 }}>
        <Steps>
          <Step duration={STEP_MS}>
            <div>
              <span style={{ display: 'inline-block', background: soft, border: `3px solid ${c}`, color: c, fontSize: 52, fontWeight: 700, padding: '4px 34px' }}>{answer}</span>
              <div style={{ fontSize: 31, color: muted, marginTop: 18 }}>{why}</div>
            </div>
          </Step>
        </Steps>
      </div>
    </div>
  );
};

const SkillOrMcp: Page = () => (
  <Shell chapter={1} source={'Codex 文件：Skills developers.openai.com/codex/skills；MCP developers.openai.com/codex/mcp'}>
    <Eyebrow>小測驗</Eyebrow>
    <Heading>判斷題：Skill 還是 MCP？</Heading>
    <Fit>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48 }}>
        <In i={0}><QuizCard n={1} scene="每次 Review PR，都要照公司的 10 條規範檢查" answer="Skill" why="固定的做法和檢查流程" tone="skill" /></In>
        <In i={1}><QuizCard n={2} scene="希望 AI 能查公司的 Jira 或資料庫" answer="MCP" why="要連到外部系統拿資料" tone="mcp" /></In>
      </div>
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={44}>Skill＝方法，MCP＝工具</Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

// ---------- 02 安裝熱門 Skill ----------

const Section2: Page = () => <SectionPage chapter={2} label="02 / 安裝" lead="裝兩個別人寫好的 Skill" />;

// One line of a package's file list.
const PkgRow = ({ x, y, name, hot = false, missing = false, w = 560 }: { x: number; y: number; name: string; hot?: boolean; missing?: boolean; w?: number }) => (
  <g>
    {hot ? <rect x={x - 14} y={y - 34} width={w} height="48" fill={amberSoft} stroke={amber} strokeWidth="2" /> : null}
    {missing ? <rect x={x - 14} y={y - 34} width="560" height="48" fill="none" stroke={faint} strokeWidth="2" strokeDasharray="10 8" /> : null}
    <text x={x} y={y} fontSize="28" fontFamily={mono} fill={missing ? quiet : ink}>{name}</text>
  </g>
);

const TwoWays: Page = () => (
  <Shell chapter={2} source={'Codex 外掛 developers.openai.com/codex/plugins；Skill 安裝工具 github.com/vercel-labs/skills'}>
    <Eyebrow>外掛（Plugin）與一般 Skill</Eyebrow>
    <Heading>兩種安裝方式：外掛和一般 Skill</Heading>
    <Fit>
      <Stage h={500}>
        <Steps>
          <Layer h={500} label="diagram-design 是外掛：有 .codex-plugin/plugin.json，裡面包著 skills/diagram-design/SKILL.md；用 codex plugin 指令安裝">
            <InG i={0}>
              <rect x="0" y="0" width="760" height="330" fill={blueSoft} stroke={blue} strokeWidth="2" />
              <text x="30" y="54" fontSize="32" fontWeight="600" fill={ink}>diagram-design｜外掛</text>
              <PkgRow x={44} y={124} name=".codex-plugin/plugin.json" hot w={456} />
              <text x="500" y="124" fontSize="26" fontWeight="600" fill={amber}>← 外掛說明牌</text>
              <PkgRow x={44} y={190} name="skills/diagram-design/SKILL.md" />
              <PkgRow x={44} y={256} name="assets/  scripts/  …" />
            </InG>
            <InG i={1}>
              <rect x="0" y="360" width="760" height="76" fill={term} />
              <text x="30" y="410" fontSize="29" fontFamily={mono} fill="#F5F5F4"><tspan fill="#8DD4A0">$</tspan> codex plugin add …</text>
              <text x="0" y="484" fontSize="26" fill={okGreen}>確認：codex plugin list → installed, enabled</text>
            </InG>
          </Layer>
          <Step duration={STEP_MS}><Layer h={500} label="eli5 是一般 Skill：只有 SKILL.md，沒有 plugin.json；用 npx skills add 安裝">
            <g className="aw3-build" style={buildDelay(0)}>
              <rect x="872" y="0" width="760" height="330" fill={amberSoft} stroke={amber} strokeWidth="2" />
              <text x="902" y="54" fontSize="32" fontWeight="600" fill={ink}>eli5｜一般 Skill</text>
              <PkgRow x={916} y={124} name="（沒有 plugin.json）" missing />
              <PkgRow x={916} y={190} name="SKILL.md" />
            </g>
            <g className="aw3-build" style={buildDelay(1)}>
              <rect x="872" y="360" width="760" height="76" fill={term} />
              <text x="902" y="410" fontSize="29" fontFamily={mono} fill="#F5F5F4"><tspan fill="#8DD4A0">$</tspan> npx skills add …</text>
              <text x="872" y="484" fontSize="26" fill={okGreen}>確認：重開後的 skills 清單有 eli5</text>
            </g>
          </Layer></Step>
        </Steps>
      </Stage>
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={36}>有 plugin.json 的，才用 plugin 指令</Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

// What to do when a check fails, one box per operating system.
const OsFix = ({ os, children }: { os: string; children: ReactNode }) => (
  <div style={{ background: '#FFFFFF', border: `1px solid ${rule}`, borderTop: `5px solid ${amber}`, padding: '20px 30px 24px' }}>
    <SmallLabel color={amber}>{os}</SmallLabel>
    <div style={{ marginTop: 10, fontSize: 30, lineHeight: 1.6 }}>{children}</div>
  </div>
);

const GitCheck: Page = () => (
  <Shell chapter={2} source={'Git 下載 git-scm.com/downloads；skills 安裝工具用 git 下載 github.com/vercel-labs/skills'}>
    <PracticeEyebrow time="13 分鐘（四步）">練習 1｜先確認</PracticeEyebrow>
    <Heading>練習（安裝）：先確認有 git</Heading>
    <PromptsCopy step="1-1" />
    <Lead>兩個安裝指令，都靠 git 下載</Lead>
    <Fit>
      <TermBox title="終端機｜講師 Mac 實際輸出" size={30}>
        <Steps>
          <TL><Typed>$</Typed> git --version</TL>
          <Step duration={STEP_MS}><TL hot>git version 2.54.0 (Apple Git-157)</TL></Step>
        </Steps>
      </TermBox>
      <Steps>
        <Step duration={STEP_MS}><div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 36, marginTop: 36 }}>
          <OsFix os="MAC 沒有 GIT">跳出安裝視窗就按「安裝」<br />或打 <Path size={30}>xcode-select --install</Path></OsFix>
          <OsFix os="WINDOWS 沒有 GIT">到 <Path size={30}>git-scm.com</Path> 下載，選項用預設<br />裝完關掉 PowerShell 再開</OsFix>
        </div></Step>
        <Step duration={STEP_MS}><Takeaway marginTop={36}>裝不起來，就用 prompts.md 的備用做法</Takeaway></Step>
      </Steps>
    </Fit>
  </Shell>
);

const InstallDiagram: Page = () => (
  <Shell chapter={2} source={'diagram-design 安裝說明 github.com/cathrynlavery/diagram-design'}>
    <PracticeEyebrow time="練習 1 第 2 步">練習 1｜安裝</PracticeEyebrow>
    <Heading>練習（Skill）：安裝 diagram-design</Heading>
    <PromptsCopy step="1-2" />
    <Fit>
      <TermBox title="終端機｜實際輸出（Codex 0.154.0）" size={24}>
        <Steps>
          <TL tone="note"># 1 加入外掛商店（marketplace）</TL>
          <TL><Typed>$</Typed> codex plugin marketplace add cathrynlavery/diagram-design</TL>
          <Step duration={STEP_MS}><div>
            <TL tone="dim">Added marketplace `diagram-design` from https://github.com/cathrynlavery/diagram-design.git.</TL>
            <TL tone="dim">Installed marketplace root: ~/.codex/.tmp/marketplaces/diagram-design</TL>
          </div></Step>
          <Step duration={STEP_MS}><div>
            <TL tone="note"># 2 從商店安裝外掛</TL>
            <TL><Typed>$</Typed> codex plugin add diagram-design@diagram-design</TL>
          </div></Step>
          <Step duration={STEP_MS}><div>
            <TL tone="dim">Added plugin `diagram-design` from marketplace `diagram-design`.</TL>
            <TL tone="dim">Installed plugin root: ~/.codex/plugins/cache/diagram-design/diagram-design/2.6.110</TL>
          </div></Step>
          <Step duration={STEP_MS}><div>
            <TL tone="note"># 3 確認裝好了</TL>
            <TL><Typed>$</Typed> codex plugin list</TL>
          </div></Step>
          <Step duration={STEP_MS}><div>
            <TL tone="dim">PLUGIN                         STATUS              VERSION</TL>
            <TL hot>diagram-design@diagram-design  installed, enabled  2.6.110</TL>
          </div></Step>
        </Steps>
      </TermBox>
      <Caption>講師 2026-10-17 實際輸出｜家目錄縮寫成 ~；10-24 已更新到 2.6.115，版本號不同沒關係</Caption>
    </Fit>
  </Shell>
);

const InstallEli5: Page = () => (
  <Shell chapter={2} source={'eli5 skills.sh/dreambigou/eli5；安裝工具 github.com/vercel-labs/skills'}>
    <PracticeEyebrow time="練習 1 第 3 步">練習 1｜安裝</PracticeEyebrow>
    <Heading>練習（Skill）：用 npx 安裝 eli5</Heading>
    <PromptsCopy step="1-3" />
    <Fit>
      <div style={{ display: 'grid', gridTemplateColumns: '1080px 1fr', gap: 52, alignItems: 'center' }}>
        <div>
          <TermBox title="終端機｜實際輸出（節錄）" size={25}>
            <Steps>
              <TL><Typed>$</Typed> npx -y skills add dreambigou/eli5 -g -a codex -y</TL>
              <Step duration={STEP_MS}><div>
                <TL tone="dim">◇  Source: https://github.com/dreambigou/eli5.git</TL>
                <TL tone="dim">◇  Repository cloned</TL>
                <TL tone="dim">◇  Found 1 skill</TL>
                <TL tone="dim">●  Skill: eli5</TL>
                <TL tone="dim">◇  Installed 1 skill</TL>
                <TL hot>│    ✓ eli5 (copied) → ~/.agents/skills/eli5</TL>
                <TL tone="ask">└  Done!  Review skills before use;</TL>
                <TL tone="ask">   they run with full agent permissions.</TL>
              </div></Step>
            </Steps>
          </TermBox>
        </div>
        <div style={{ display: 'grid', gap: 34 }}>
          <In i={1}><Callout n={1} title={<Path size={31}>-g</Path>} detail="裝給所有專案" /></In>
          <In i={2}><Callout n={2} title={<Path size={31}>-a codex</Path>} detail="裝給 Codex 用" /></In>
          <In i={3}><Callout n={3} title={<Path size={31}>-y</Path>} detail="自動確認，不用一直按" /></In>
          <Steps><Step duration={STEP_MS}><Callout n={4} title="Skill 有完整權限" detail="裝之前先看過 SKILL.md" /></Step></Steps>
        </div>
      </div>
    </Fit>
  </Shell>
);

// A GitHub repo drawn as a box with its top-level files.
const RepoBox = ({ x, name, tone, children }: { x: number; name: string; tone: 'ok' | 'bad'; children: ReactNode }) => (
  <g>
    <rect x={x} y="0" width="760" height="230" fill="#FFFFFF" stroke={tone === 'ok' ? okGreen : amber} strokeWidth="2" />
    <SvgIcon kind="folder" x={x + 46} y={46} size={44} color={muted} />
    <text x={x + 84} y="58" fontSize="29" fontFamily={mono} fontWeight="600" fill={ink}>{name}</text>
    {children}
  </g>
);

const PluginFails: Page = () => (
  <Shell chapter={2} source={'Codex 外掛的 .codex-plugin/plugin.json developers.openai.com/plugins/build/plugins'}>
    <Eyebrow>常見錯誤</Eyebrow>
    <Heading>eli5 用外掛指令會失敗</Heading>
    <Fit>
      <TermBox title="終端機" size={27}>
        <Steps>
          <TL><Typed>$</Typed> codex plugin marketplace add dreambigou/eli5</TL>
          <Step duration={STEP_MS}><TL tone="bad">… marketplace root does not contain a supported manifest</TL></Step>
        </Steps>
      </TermBox>
      <Steps>
        <Step duration={STEP_MS}><div style={{ marginTop: 40 }}>
          <Figure h={230} label="diagram-design 的 repo 有 .codex-plugin/plugin.json；eli5 的 repo 只有 SKILL.md，缺 plugin.json">
            <RepoBox x={0} name="cathrynlavery/diagram-design" tone="ok">
              <rect x="30" y="98" width="560" height="56" fill={sage} stroke={okGreen} strokeWidth="2" />
              <text x="52" y="136" fontSize="28" fontFamily={mono} fill={ink}>.codex-plugin/plugin.json</text>
              <OkDot x={640} y={126} r={24} />
              <text x="52" y="200" fontSize="27" fill={muted}>外掛的說明牌：有</text>
            </RepoBox>
            <RepoBox x={872} name="dreambigou/eli5" tone="bad">
              <rect x="902" y="98" width="560" height="56" fill="none" stroke={faint} strokeWidth="2" strokeDasharray="10 8" />
              <text x="924" y="136" fontSize="28" fontFamily={mono} fill={quiet}>plugin.json</text>
              <g><circle cx="1512" cy="126" r="24" fill={amber} /><CrossMark x={1512} y={126} size={18} color="#FFFFFF" /></g>
              <text x="924" y="200" fontSize="27" fill={muted}>只有 SKILL.md</text>
            </RepoBox>
          </Figure>
        </div></Step>
        <Step duration={STEP_MS}><Takeaway marginTop={44}>沒有 plugin.json，就改用 npx skills add</Takeaway></Step>
      </Steps>
    </Fit>
  </Shell>
);

// A pill in a short "do this, then this" row.
const ChipStep = ({ n, children }: { n: number; children: ReactNode }) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 14, background: '#FFFFFF', border: `1px solid ${rule}`, padding: '10px 22px 10px 12px', fontSize: 30 }}>
    <NumDot n={n} size={40} />{children}
  </span>
);

const ChipArrow = () => <span style={{ color: faint, fontSize: 40, lineHeight: 1 }}>→</span>;

const SkillsList: Page = () => (
  <Shell chapter={2} source={'Codex 外掛文件（裝完要開新 Session）developers.openai.com/codex/plugins'}>
    <PracticeEyebrow time="練習 1 第 4 步">練習 1｜確認</PracticeEyebrow>
    <Heading>在筆記庫開 Codex，確認 Skill</Heading>
    <PromptsCopy step="1-4" />
    <In i={0} style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 44 }}>
      <ChipStep n={1}><Path size={28}>cd</Path> 到三國人物知識庫</ChipStep><ChipArrow />
      <ChipStep n={2}><Path size={28}>ls</Path> 看到 人物、關係</ChipStep><ChipArrow />
      <ChipStep n={3}><Path size={28}>codex</Path></ChipStep><ChipArrow />
      <ChipStep n={4}>問它有哪些 Skill</ChipStep>
    </In>
    <In i={1} style={{ marginTop: 14, fontSize: 26, color: muted }}><Path size={26}>ls</Path> 只看到另一個 三國人物知識庫：多包了一層，再 <Path size={26}>cd</Path> 進去</In>
    <Fit>
      <TermBox title="Codex 實際輸出（節錄）" size={25}>
        <Steps>
          <TL tone="ask">› 列出你現在可以使用的 skills 名稱，每個一行，附一句用途。不要讀或修改任何檔案。</TL>
          <Step duration={STEP_MS}><div>
            <TL tone="dim">  ……</TL>
            <TL hot>- `diagram-design:diagram-design`：建立架構圖、流程圖、資料模型圖及各類視覺化圖表。</TL>
            <TL tone="dim">  ……</TL>
            <TL hot>- `eli5`：用適合初學者或指定對象的方式解釋複雜概念。</TL>
          </div></Step>
        </Steps>
      </TermBox>
      <Steps>
        <Step duration={STEP_MS}><div style={{ display: 'flex', justifyContent: 'center', marginTop: 20 }}>
          <div style={{ background: sage, padding: '12px 28px' }}><StatusLine ok size={30}>兩個都在：裝好了</StatusLine></div>
        </div></Step>
        <Step duration={STEP_MS}><Takeaway marginTop={16}>清單只證明裝好；下一章跑一次，才算能用</Takeaway></Step>
      </Steps>
    </Fit>
  </Shell>
);

// ---------- 03 用 Skill 做好讀的筆記 ----------

const Section3: Page = () => <SectionPage chapter={3} label="03 / 使用" lead="畫成關係圖、改成白話，再回卡片核對" />;

const DiagramRun: Page = () => (
  <Shell chapter={3} source={'diagram-design github.com/cathrynlavery/diagram-design'}>
    <PracticeEyebrow time="20 分鐘（三步）">練習 2｜diagram-design</PracticeEyebrow>
    <Heading>練習（Skill）：畫人物關係圖</Heading>
    <PromptsCopy step="2-1" />
    <In i={0} style={{ marginTop: 40 }}><PromptBox size={28}>請使用 diagram-design skill，讀 人物/ 和 關係/ 裡的卡片，把人物和事件之間的關係畫成一張關係圖，存成 圖/三國關係圖.html。只畫卡片裡有寫的關係，每條線標出是哪張卡寫的。不要修改原本的卡片。</PromptBox></In>
    <Fit>
      <TermBox title="Codex 實際紀錄（2026-10-24，節錄）" size={23}>
        <Steps>
          <Step duration={STEP_MS}><div>
            <TL>• 這是此專案第一次使用 `diagram-design`，請選擇關係圖風格：</TL>
            <TL tone="dim">  (a) 提供網站 URL</TL>
            <TL tone="dim">  (b) 使用已安裝的樣式 skill</TL>
            <TL tone="dim">  (c) 指定本機資料夾／設計系統</TL>
            <TL tone="dim">  (d) 貼上樣式 token</TL>
            <TL hot>  (e) 保留預設樣式                       <span style={{ color: '#E9B650' }}>← 代號會變，找這一項</span></TL>
            <TL tone="dim">  (f) 載入已儲存的樣式 profile</TL>
          </div></Step>
          <Step duration={STEP_MS}><TL tone="type">› 保留預設樣式，請直接產生並存檔。</TL></Step>
          <Step duration={STEP_MS}><div>
            <TL>• 已完成關係圖：三國關係圖.html</TL>
            <TL tone="dim">  包含 5 位人物、3 個事件、12 條卡片明載的關係</TL>
          </div></Step>
        </Steps>
      </TermBox>
    </Fit>
  </Shell>
);

const DiagramResult: Page = () => (
  <Shell chapter={3} source={'diagram-design github.com/cathrynlavery/diagram-design'}>
    <Eyebrow>練習 2｜看結果</Eyebrow>
    <Heading>diagram-design 畫出的關係圖</Heading>
    <Fit>
      <div style={{ display: 'grid', gridTemplateColumns: '1080px 1fr', gap: 64, alignItems: 'center', position: 'relative' }}>
        <In i={0}>
          <Crop src={ddResult} alt="diagram-design 產生的三國關係圖：左邊五張人物卡，右邊三張事件卡，十條線各標來源卡，赤壁之戰附近幾條線的標籤疊在一起" iw={2400} ih={1770} crop={[220, 340, 1960, 1150]} width={1080} />
          <Caption>講師 2026-10-17 實際產出（節錄）｜在 Finder／檔案總管雙擊 圖/三國關係圖.html 打開</Caption>
        </In>
        <div style={{ display: 'grid', gap: 40 }}>
          <Steps>
            <Step duration={STEP_MS}><Callout n={1} title="左邊：人物卡" detail="5 張" /><MarkLayer width={1080} height={634}><RegionMark step n={1} x={4.5} y={6.5} w={23.5} h={89} /></MarkLayer></Step>
            <Step duration={STEP_MS}><Callout n={2} title="右邊：事件卡" detail="3 張；線數會不同，這次 10 條" /><MarkLayer width={1080} height={634}><RegionMark step n={2} x={68} y={11.5} w={26.5} h={62} /></MarkLayer></Step>
            <Step duration={STEP_MS}><Callout n={3} title="線上的標籤疊在一起" detail="它卻回報「幾何檢查已通過」" /><MarkLayer width={1080} height={634}><RegionMark step n={3} x={52.5} y={69} w={27.5} h={13} badge="right" /></MarkLayer></Step>
          </Steps>
        </div>
      </div>
    </Fit>
  </Shell>
);

// The same corner of the relation diagram, before or after the follow-up prompt.
const CropPanel = ({ label, tone, children }: { label: string; tone: 'plain' | 'ok'; children: ReactNode }) => (
  <div>
    <div style={{ marginBottom: 10 }}><SmallLabel color={tone === 'ok' ? okGreen : quiet}>{label}</SmallLabel></div>
    {children}
  </div>
);

const LabelFix: Page = () => (
  <Shell chapter={3}>
    <Eyebrow>練習 2｜你的圖有疊到才做</Eyebrow>
    <Heading>標籤疊在一起：請它分開</Heading>
    <PromptsCopy step="2-2" />
    <Fit>
      <Steps><Step duration={STEP_MS}><PromptBox size={28}>圖上線的標籤疊在一起了。請把標籤分開，不要互相蓋住；節點和連線不變，存回同一個檔案。</PromptBox></Step></Steps>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 44, marginTop: 24 }}>
        <In i={0}>
          <CropPanel label="改之前｜同一個角落，放大" tone="plain">
            <Crop src={ddResult} alt="改之前：赤壁之戰附近，四條線的來源標籤互相重疊" iw={2400} ih={1770} crop={[1180, 1085, 620, 245]} width={794}>
              <div style={{ position: 'absolute', left: '13%', top: '19%', width: '77%', height: '60%', border: '4px solid #E9B650', boxSizing: 'border-box' }} />
            </Crop>
          </CropPanel>
        </In>
        <div>
          <Steps>
            <Step duration={STEP_MS}>
              <CropPanel label="改之後｜實際產出" tone="ok">
                <Crop src={ddFixed} alt="改之後：標籤只剩人物卡檔名，疊得少了，但赤壁之戰附近仍有幾個標籤壓在線上" iw={2400} ih={1770} crop={[1180, 1085, 620, 245]} width={794}>
                  <div style={{ position: 'absolute', left: '13%', top: '9%', width: '33%', height: '34%', border: '4px dashed #E9B650', boxSizing: 'border-box' }} />
                </Crop>
              </CropPanel>
            </Step>
          </Steps>
        </div>
      </div>
      <Steps>
        <Step duration={STEP_MS}><div style={{ display: 'flex', alignItems: 'center', gap: 48, marginTop: 22 }}>
          <StatusLine ok size={31}>標籤變短，疊得少了</StatusLine>
          <StatusLine ok={false} size={31}>赤壁附近，還有字壓在線上</StatusLine>
        </div></Step>
        <Step duration={STEP_MS}><div style={{ marginTop: 12, fontSize: 25, color: muted }}>Codex 自己的回報：「已重新排開來源標籤，避免互相覆蓋；節點與連線均未修改，並已通過幾何檢查。」</div></Step>
        <Step duration={STEP_MS}><Takeaway marginTop={16}>它說檢查過了，還是要自己打開來看</Takeaway></Step>
      </Steps>
    </Fit>
  </Shell>
);

// One paragraph of a card, before or after the rewrite.
const RewritePanel = ({ label, file, tone, children }: { label: string; file: string; tone: 'plain' | 'ok'; children: ReactNode }) => (
  <div style={{ background: tone === 'ok' ? '#FFFFFF' : surface, border: `1px solid ${rule}`, borderTop: `5px solid ${tone === 'ok' ? okGreen : faint}`, padding: '22px 32px 28px', height: '100%', boxSizing: 'border-box' }}>
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 16 }}>
      <SmallLabel color={tone === 'ok' ? okGreen : quiet}>{label}</SmallLabel>
      <Path size={24}>{file}</Path>
    </div>
    <div style={{ fontSize: 36, lineHeight: 1.75, marginTop: 14 }}>{children}</div>
  </div>
);

const Eli5Rewrite: Page = () => (
  <Shell chapter={3} source={'eli5 github.com/dreambigou/eli5；卡片原文：維基文庫《三國演義》第 1 回'}>
    <PracticeEyebrow time="練習 2 第 2 步">練習 2｜eli5</PracticeEyebrow>
    <Heading>練習（Skill）：用 eli5 改寫劉備卡</Heading>
    <PromptsCopy step="2-3" />
    <PillRow>
      <Pill tag="定位">人物/劉備.md</Pill>
      <Pill tag="期望輸出">國中生版</Pill>
      <Pill tag="限制">不加新事實</Pill>
    </PillRow>
    <Fit>
      <In i={1} style={{ display: 'flex', gap: 40, fontSize: 28, marginBottom: 20 }}>
        <span><Mk ok>綠底</Mk>＝保留下來的事實</span>
        <span><Mk>橘底</Mk>＝換成白話的說法</span>
      </In>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40 }}>
        <Steps>
          <RewritePanel label="原卡" file="人物/劉備.md" tone="plain">
            三人<Mk>越談越投合</Mk>，<Mk ok>隔天</Mk>就在<Mk ok>張飛莊後的桃園</Mk><Mk>立誓</Mk>，留下著名的 <Mk ok>[[桃園結義]]</Mk>；<Mk>誓畢</Mk>拜<Mk ok>劉備為兄</Mk>，從此他成了關、張的大哥
          </RewritePanel>
          <Step duration={STEP_MS}>
            <RewritePanel label="eli5 版（實際產出）" file="整理/劉備-國中生版.md" tone="ok">
              三人<Mk>越聊越合得來</Mk>。<Mk ok>第二天</Mk>，他們在<Mk ok>張飛莊園後面的桃園</Mk><Mk>立下誓言</Mk>，這就是有名的 <Mk ok>[[桃園結義]]</Mk>。<Mk>結義後</Mk>，關羽和張飛認<Mk ok>劉備做大哥</Mk>。
            </RewritePanel>
          </Step>
        </Steps>
      </div>
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={30}>事實沒變，只是說法變白了</Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

// A note card shown with its frontmatter.
const FrontCard = ({ x, file, hot = false }: { x: number; file: string; hot?: boolean }) => (
  <g>
    <DocShape x={x} y={20} w={430} h={270} fill="#FFFFFF" stroke={hot ? amber : rule} sw={hot ? 3 : 2} />
    <text x={x + 30} y="76" fontSize="27" fontFamily={mono} fill={quiet}>---</text>
    {hot ? <rect x={x + 18} y="90" width="340" height="50" fill={amberSoft} stroke={amber} strokeWidth="2" /> : null}
    <text x={x + 30} y="126" fontSize="28" fontFamily={mono} fontWeight="600" fill={ink}>dg-publish: true</text>
    <text x={x + 30} y="176" fontSize="27" fontFamily={mono} fill={quiet}>---</text>
    <text x={x + 30} y="236" fontSize="27" fill={muted}>劉備，字玄德……</text>
    <text x={x + 215} y="336" textAnchor="middle" fontSize="25" fontFamily={mono} fill={hot ? amber : muted}>{file}</text>
  </g>
);

const DgPublishCopied: Page = () => (
  <Shell chapter={3} source={'Digital Garden 文件 docs.forestry.md/getting-started/01-getting-started'}>
    <Eyebrow>練習 2｜發布前的檢查</Eyebrow>
    <Heading>改寫版也帶著 dg-publish: true</Heading>
    <In i={0} style={{ marginTop: 18, fontSize: 32, color: muted }}>dg-publish 是第四堂的公開開關：<strong style={{ color: ink }}>true＝會放上網站</strong></In>
    <Fit>
      <Stage h={360}>
        <Steps>
          <Layer h={360} label="原卡人物/劉備.md 有 dg-publish: true；eli5 改寫後的整理/劉備-國中生版.md 也照抄了 dg-publish: true">
            <InG i={1}><FrontCard x={0} file="人物/劉備.md" /></InG>
            <InG i={2}>
              <MapArrow x1={446} x2={556} y={150} hot />
              <text x="501" y="130" textAnchor="middle" fontSize="26" fontFamily={mono} fill={amber}>eli5</text>
            </InG>
            <InG i={3}><FrontCard x={572} file="整理/劉備-國中生版.md" hot /></InG>
          </Layer>
          <Step duration={STEP_MS}><Layer h={360} label="第四堂發布時，兩張劉備卡都會公開">
            <g className="aw3-build" style={buildDelay(0)}><MapArrow x1={1018} x2={1120} y={150} /></g>
            <g className="aw3-build" style={buildDelay(1)}>
              <rect x="1136" y="20" width="496" height="270" fill="#FFFFFF" stroke={rule} strokeWidth="2" />
              <rect x="1136" y="20" width="496" height="52" fill="#ECEAE8" />
              <SvgIcon kind="globe" x={1170} y={46} size={32} color={muted} />
              <text x="1200" y="56" fontSize="25" fill={muted}>第四堂的網站</text>
              <text x="1170" y="140" fontSize="30" fill={ink}>劉備</text>
              <text x="1170" y="200" fontSize="30" fill={ink}>劉備-國中生版</text>
              <AskMark x={1580} y={190} r={24} />
              <text x="1384" y="336" textAnchor="middle" fontSize="26" fill={amber}>兩張都會公開</text>
            </g>
          </Layer></Step>
        </Steps>
      </Stage>
      <Steps>
        <Step duration={STEP_MS}><div style={{ display: 'flex', justifyContent: 'center', gap: 28, marginTop: 20 }}>
          <div style={{ background: sage, padding: '12px 26px' }}><StatusLine ok size={29}>這份不用公開：刪掉 dg-publish 那行</StatusLine></div>
          <div style={{ background: '#FFFFFF', border: `1px solid ${rule}`, padding: '12px 26px' }}><StatusLine ok size={29}>下次提示詞加「新檔不要加 dg-publish」</StatusLine></div>
        </div></Step>
        <Step duration={STEP_MS}><Takeaway marginTop={28}>發布前，先看最上面的 frontmatter</Takeaway></Step>
      </Steps>
    </Fit>
  </Shell>
);

// One check: what the Skill produced shows first; on a click, the card sentence that backs
// it arrives, then the verdict settles in after it.
const CheckRow = ({ made, quote, file, ok }: { made: string; quote: string; file: string; ok: boolean }) => (
  <div style={{ display: 'grid', gridTemplateColumns: '560px 70px 1fr', alignItems: 'center', background: '#FFFFFF', border: `1px solid ${rule}`, padding: '18px 26px', minHeight: 110, boxSizing: 'border-box' }}>
    <span style={{ fontSize: 31, fontWeight: 600 }}>{made}</span>
    <span style={{ color: faint, fontSize: 44 }}>→</span>
    <Steps>
      <Step duration={STEP_MS}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, ...(ok ? {} : { background: amberSoft, borderLeft: `5px solid ${amber}`, margin: '-8px 0', padding: '8px 0 8px 18px' }) }}>
          <span>
            <span style={{ display: 'block', fontFamily: display, fontSize: 30 }}>{quote}</span>
            <span style={{ display: 'block', marginTop: 4 }}><Path size={24}>{file}</Path></span>
          </span>
          <span className="aw3-build" style={{ ...buildDelay(1), flexShrink: 0 }}>{ok ? <Icon kind="ok" size={56} color={okGreen} /> : <svg viewBox="0 0 56 56" style={{ width: 56, height: 56, display: 'block' }} aria-hidden="true"><circle cx="28" cy="28" r="26" fill={amber} /><CrossMark x={28} y={28} size={20} color="#FFFFFF" /></svg>}</span>
        </div>
      </Step>
    </Steps>
  </div>
);

const VerifyOutputs: Page = () => (
  <Shell chapter={3} source={'eli5 的 SKILL.md：Use an analogy… github.com/dreambigou/eli5；講師 2026-10-24 實跑'}>
    <PracticeEyebrow time="練習 2 第 3 步">練習 2｜核對</PracticeEyebrow>
    <Heading>練習（幻覺）：找 eli5 多加的句子</Heading>
    <PromptsCopy step="2-4" />
    <In i={0} style={{ marginTop: 18, fontSize: 30, color: muted }}>eli5 改寫的三句，哪一句原卡沒寫？</In>
    <Fit>
      <div style={{ display: 'grid', gap: 24 }}>
        <CheckRow made="「靠賣鞋和織草蓆生活」" quote="「靠販屨織蓆過日子」" file="人物/劉備.md" ok />
        <CheckRow made="「從此三人一起行動」" quote="找不到：原卡寫「從此他成了關、張的大哥」" file="問它：原卡哪一句寫的？" ok={false} />
        <CheckRow made="「手上的匙箸都掉到了地上」" quote="「嚇得劉備手上的匙箸都掉到地上」" file="人物/劉備.md" ok />
      </div>
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={44}>原卡找不到的句子，就刪掉或請它改</Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

// ---------- 04 擴充筆記庫 ----------

const Section4: Page = () => <SectionPage chapter={4} label="04 / 擴充" lead="照原文多寫幾張卡，時間軸才有資料" />;

const CardTemplate: Page = () => (
  <Shell chapter={4} source={'Obsidian 屬性 help.obsidian.md/properties；原文：維基文庫《三國演義》第 1 回'}>
    <Eyebrow>新卡都照這個格式</Eyebrow>
    <Heading>卡片模板：回目、年份、出處</Heading>
    <Fit>
      <div style={{ display: 'grid', gridTemplateColumns: '940px 1fr', gap: 64, alignItems: 'center' }}>
        <In i={0}>
          <CodeDoc title="模板/關係卡模板.md" size={25}>
            <CL band={amberSoft}>---</CL>
            <CL band={amberSoft} n={1}>回目: </CL>
            <CL band={amberSoft} n={2}>年份: </CL>
            <CL band={amberSoft}>---</CL>
            <CL>關係卡｜（類型，例如：結義、對戰、計策）</CL>
            <CL />
            <CL color={muted}>（用完整的句子講這件事，人名有卡的才寫成 `[[連結]]`。）</CL>
            <CL />
            <CL>參與人物：（有卡的人名寫成 `[[劉備]]` 這樣的連結，沒卡的寫純文字）</CL>
            <CL />
            <CL band={sage} n={3}>出處：原文/檔名</CL>
          </CodeDoc>
        </In>
        <div style={{ display: 'grid', gap: 44 }}>
          <Steps>
            <Step duration={STEP_MS}><Callout n={1} title="回目" detail="第幾回，時間軸靠它排" /></Step>
            <Step duration={STEP_MS}><Callout n={2} title="年份" detail="原文有寫才填，沒寫留空" /></Step>
            <Step duration={STEP_MS}><Callout n={3} title="出處" detail="哪一回的原文檔" /></Step>
          </Steps>
        </div>
      </div>
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={32}>每張新卡都照這個格式寫</Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

const RagStageLabel = ({ x, letter, text, color }: { x: number; letter: string; text: string; color: string }) => (
  <g>
    <text x={x} y="30" fontSize="44" fontFamily={display} fill={color}>{letter}</text>
    <text x={x + 46} y="28" fontSize="28" fontWeight="600" fill={ink}>{text}</text>
  </g>
);

const RagAgain: Page = () => (
  <Shell chapter={4} source={'Lewis et al. 2020, arXiv:2005.11401；原文：維基文庫《三國演義》第 5 回'}>
    <Eyebrow>用的是 RAG 的做法</Eyebrow>
    <Heading>檢索增強生成（RAG）</Heading>
    <Lead>先找原文，再依據原文寫卡片</Lead>
    <Fit>
      <Stage h={440}>
        <Steps>
          <Layer h={440} label="R 找原文：第 5 回寫「這三個圍住呂布，轉燈兒般廝殺」">
            <InG i={0}><RagStageLabel x={0} letter="R" text="找原文" color={amber} /></InG>
            <InG i={1}>
              <DocShape x={0} y={56} w={420} h={290} fill="#FFFFFF" stroke={rule} />
              <text x="28" y="104" fontSize="25" fontFamily={mono} fill={muted}>原文/第005回.txt</text>
              <rect x="20" y="148" width="380" height="120" fill={amberSoft} />
              <text x="38" y="196" fontSize="33" fontFamily={display} fill={ink}>這三個圍住呂布，</text>
              <text x="38" y="248" fontSize="33" fontFamily={display} fill={ink}>轉燈兒般廝殺。</text>
              <text x="28" y="316" fontSize="25" fill={quiet}>……</text>
            </InG>
          </Layer>
          <Step duration={STEP_MS}><Layer h={440} label="A 帶著原文、卡片模板和你的要求一起交給 Codex">
            <g className="aw3-build" style={buildDelay(0)}><MapArrow x1={432} x2={540} y={200} hot /></g>
            <g className="aw3-build" style={buildDelay(1)}>
              <RagStageLabel x={552} letter="A" text="帶著原文寫" color={blue} />
              <rect x="552" y="56" width="420" height="290" fill={blueSoft} stroke={blue} strokeWidth="2" />
              <text x="762" y="136" textAnchor="middle" fontSize="36" fontFamily={mono} fontWeight="600" fill={ink}>Codex</text>
              <text x="762" y="206" textAnchor="middle" fontSize="30" fill={ink}>＋ 原文這一段</text>
              <text x="762" y="256" textAnchor="middle" fontSize="30" fill={ink}>＋ 卡片模板</text>
              <text x="762" y="306" textAnchor="middle" fontSize="30" fill={ink}>＋ 你的要求</text>
            </g>
          </Layer></Step>
          <Step duration={STEP_MS}><Layer h={440} label="G 寫成新卡：三英戰呂布，附上出處">
            <g className="aw3-build" style={buildDelay(0)}><MapArrow x1={984} x2={1092} y={200} hot /></g>
            <g className="aw3-build" style={buildDelay(1)}>
              <RagStageLabel x={1104} letter="G" text="寫成新卡" color={okGreen} />
              <DocShape x={1104} y={56} w={528} h={290} fill={sage} stroke={okGreen} sw={3} />
              <text x="1132" y="106" fontSize="26" fontFamily={mono} fill={ink}>關係/三英戰呂布.md</text>
              <text x="1132" y="156" fontSize="26" fontFamily={mono} fill={muted}>回目: 5</text>
              <text x="1132" y="212" fontSize="29" fill={ink}>……三人圍住呂布廝殺。</text>
              <rect x="1124" y="250" width="488" height="56" fill="#FFFFFF" stroke={okGreen} strokeWidth="2" />
              <text x="1144" y="288" fontSize="25" fontFamily={mono} fill={okGreen}>出處：原文/第005回.txt</text>
            </g>
          </Layer></Step>
          <Step duration={STEP_MS}><Layer h={440} label="原文沒寫的事，就不寫">
            <g className="aw3-build" style={buildDelay(0)}><DownArrowSvg x={762} y1={348} y2={378} color={amber} /></g>
            <g className="aw3-build" style={buildDelay(1)}>
              <rect x="552" y="382" width="420" height="56" fill={amberSoft} stroke={amber} strokeWidth="2" />
              <CrossMark x={590} y={410} size={20} color={amber} />
              <text x="620" y="420" fontSize="28" fill={ink}>原文沒寫的事 → 不寫</text>
            </g>
          </Layer></Step>
        </Steps>
      </Stage>
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={24}>每句都要指得出原文在哪</Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

const EnrichPractice: Page = () => (
  <Shell chapter={4} source={'維基文庫《三國演義》第 5、19、46 回 zh.wikisource.org/wiki/三國演義'}>
    <PracticeEyebrow time="10 分鐘（兩步）">練習 3｜擴充</PracticeEyebrow>
    <Heading>練習（RAG）：照原文新增三張卡</Heading>
    <PromptsCopy step="3-1" />
    <PillRow>
      <Pill tag="定位">三回原文</Pill>
      <Pill tag="期望輸出">三張新卡</Pill>
      <Pill tag="限制">找不到就不寫</Pill>
    </PillRow>
    <In i={1} style={{ display: 'flex', alignItems: 'center', gap: 20, marginTop: 20 }}>
      <span style={{ background: sage, border: `2px solid ${okGreen}`, padding: '8px 22px', fontSize: 29 }}><strong>三張都要做：</strong>練習 4 的時間軸會用到</span>
    </In>
    <Fit>
      <div style={{ display: 'grid', gridTemplateColumns: '830px 1fr', gap: 44, alignItems: 'start' }}>
        <TermBox title="Codex 實際紀錄（節錄）" size={24}>
          <Steps>
            <TL tone="ask">› 只根據 原文/第005回.txt、……，新增三張關係卡……</TL>
            <Step duration={STEP_MS}><div>
              <TL tone="dim">• 依模板新增三檔：關係/三英戰呂布.md、……</TL>
              <TL tone="dim">• 年份僅在原文明示時填寫，否則留空</TL>
              <TL tone="dim">• 只把已有的人名卡寫成 [[連結]]</TL>
              <TL hot>  請回覆「可以」，我就開始寫入。</TL>
            </div></Step>
            <Step duration={STEP_MS}><div>
              <TL tone="type">› 可以</TL>
              <TL>• 已新增並驗證三張關係卡</TL>
              <TL tone="dim">  年份均留空，未加入 dg-publish，未修改舊卡。</TL>
            </div></Step>
          </Steps>
        </TermBox>
        <div>
          <Steps>
            <Step duration={STEP_MS}>
              <CodeDoc title="關係/三英戰呂布.md（實際產出，節錄）" size={24}>
                <CL band={amberSoft}>---</CL>
                <CL band={amberSoft}>回目: 5</CL>
                <CL band={amberSoft}>年份:</CL>
                <CL band={amberSoft}>---</CL>
                <CL>關係卡｜對戰</CL>
                <CL color={muted}>……劉備也持雙股劍加入，</CL>
                <CL color={muted}>三人圍住呂布廝殺。……</CL>
                <CL band={blueSoft}>參與人物：[[劉備]]、[[關羽]]、[[張飛]]、呂布</CL>
                <CL band={sage}>出處：原文/第005回.txt</CL>
              </CodeDoc>
            </Step>
            <Step duration={STEP_MS}><div style={{ fontSize: 30, marginTop: 22 }}><Mk>呂布</Mk> 沒有人物卡，就不加 [[ ]]</div></Step>
          </Steps>
        </div>
      </div>
    </Fit>
  </Shell>
);

// One search inside an original text file: the year word, and how many hits came back.
const SearchHit = ({ file, term, hits }: { file: string; term: string; hits: number }) => (
  <div style={{ display: 'grid', gridTemplateColumns: '440px 1fr 160px', alignItems: 'center', background: '#FFFFFF', border: `1px solid ${rule}`, padding: '14px 28px', minHeight: 84, boxSizing: 'border-box' }}>
    <Path size={27}>{file}</Path>
    <span style={{ fontSize: 29 }}><span style={{ color: quiet, fontFamily: mono, fontSize: 25 }}>Cmd／Ctrl+F</span>　搜「{term}」</span>
    <span style={{ fontSize: 32, fontWeight: 600, color: hits === 0 ? amber : ink, textAlign: 'right' }}>{hits} 筆</span>
  </div>
);

const YearCheck: Page = () => (
  <Shell chapter={4} source={'原文/第005回.txt、第019回.txt、第046回節選.txt（維基文庫）；講師 2026-10-24 搜尋'}>
    <PracticeEyebrow time="練習 3 第 2 步">練習 3｜核對</PracticeEyebrow>
    <Heading>練習（幻覺）：年份要有原文</Heading>
    <PromptsCopy step="3-2" />
    <In i={0} style={{ marginTop: 18, fontSize: 30, color: muted }}>白門樓常被寫成建安三年，原文有寫嗎？</In>
    <Fit>
      <Steps>
        <Step duration={STEP_MS}><div style={{ display: 'grid', gap: 16 }}>
          <SearchHit file="原文/第005回.txt" term="初平" hits={0} />
          <SearchHit file="原文/第019回.txt" term="建安" hits={0} />
          <SearchHit file="原文/第046回節選.txt" term="建安" hits={0} />
        </div></Step>
        <Step duration={STEP_MS}><div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 36, marginTop: 32 }}>
          <OsFix os="你的卡：年份空白">原文沒寫，留空就對了</OsFix>
          <OsFix os="你的卡：年份有填">搜它填的年號，搜不到就刪</OsFix>
        </div></Step>
        <Step duration={STEP_MS}><Takeaway marginTop={36}>再挑一句，請它附原句，自己搜一次</Takeaway></Step>
      </Steps>
    </Fit>
  </Shell>
);

// ---------- 05 寫自己的 Skill ----------

const Section5: Page = () => <SectionPage chapter={5} label="05 / 自己寫" lead="把排時間軸的做法，寫成 SKILL.md" />;

// A card in the unsorted pile, with its 回目 in a badge.
const PileCard = ({ x, y, name, n }: { x: number; y: number; name: string; n: number }) => (
  <g>
    <rect x={x} y={y} width="220" height="92" fill="#FFFFFF" stroke={rule} strokeWidth="2" />
    <circle cx={x} cy={y} r="26" fill={amber} />
    <text x={x} y={y + 9} textAnchor="middle" fontSize="24" fontWeight="600" fill="#FFFFFF">{n}</text>
    <text x={x + 120} y={y + 58} textAnchor="middle" fontSize="28" fill={ink}>{name}</text>
  </g>
);

// One event on a horizontal timeline.
const TimeDot = ({ x, n, name, y = 150 }: { x: number; n: string; name: string; y?: number }) => (
  <g>
    <circle cx={x} cy={y} r="14" fill={amber} />
    <text x={x} y={y - 32} textAnchor="middle" fontSize="25" fontWeight="600" fill={amber}>{n}</text>
    <text x={x} y={y + 52} textAnchor="middle" fontSize="27" fill={ink}>{name}</text>
  </g>
);

const TimelineGoal: Page = () => (
  <Shell chapter={5} source={'回目順序：維基文庫《三國演義》zh.wikisource.org/wiki/三國演義'}>
    <Eyebrow>按小說回目排的事件表</Eyebrow>
    <Heading>三國時間軸 Skill 要做的事</Heading>
    <Lead>像整理相簿：照拍攝日期排好</Lead>
    <Fit>
      <Stage h={470}>
        <Steps>
          <Layer h={470} label="筆記庫裡的關係卡，回目順序是亂的：21、1、46、5、49、19">
            <InG i={0}>
              <circle cx="16" cy="14" r="14" fill={amber} /><text x="40" y="23" fontSize="26" fill={muted}>數字＝回目（第幾回）</text>
              <PileCard x={30} y={70} name="煮酒論英雄" n={21} />
              <PileCard x={290} y={100} name="桃園結義" n={1} />
              <PileCard x={50} y={200} name="草船借箭" n={46} />
              <PileCard x={300} y={230} name="三英戰呂布" n={5} />
              <PileCard x={40} y={340} name="赤壁之戰" n={49} />
              <PileCard x={290} y={360} name="白門樓" n={19} />
            </InG>
          </Layer>
          <Step duration={STEP_MS}><Layer h={470} label="依回目由小到大排好：1 桃園結義、5 三英戰呂布、19 白門樓、21 煮酒論英雄、46 草船借箭、49 赤壁之戰">
            <g className="aw3-build" style={buildDelay(0)}>
              <MapArrow x1={540} x2={640} y={150} hot />
              <text x="590" y="126" textAnchor="middle" fontSize="25" fill={amber}>依回目</text>
            </g>
            <g className="aw3-build" style={buildDelay(0)}><text x="1145" y="56" textAnchor="middle" fontSize="25" fill={muted}>回目是小說的順序，不是精確年代；年份只是附加欄</text></g>
            <g fill="none" stroke={amber} strokeWidth="4"><StepPath d="M680 150 H1610" i={1} /></g>
            <g className="aw3-build" style={buildDelay(2)}>
              <TimeDot x={700} n="第 1 回" name="桃園結義" />
              <TimeDot x={880} n="第 5 回" name="三英戰呂布" />
              <TimeDot x={1060} n="第 19 回" name="白門樓" />
              <TimeDot x={1240} n="第 21 回" name="煮酒論英雄" />
              <TimeDot x={1420} n="第 46 回" name="草船借箭" />
              <TimeDot x={1590} n="第 49 回" name="赤壁之戰" />
            </g>
          </Layer></Step>
          <Step duration={STEP_MS}><Layer h={470} label="寫成一頁 整理/時間軸.md，內容是一段 HTML">
            <g className="aw3-build" style={buildDelay(0)}><DownArrowSvg x={1150} y1={232} y2={292} color={amber} /></g>
            <g className="aw3-build" style={buildDelay(1)}>
              <DocShape x={930} y={300} w={440} h={120} fill={amberSoft} stroke={amber} sw={3} />
              <text x="1150" y="352" textAnchor="middle" fontSize="29" fontFamily={mono} fontWeight="600" fill={ink}>整理/時間軸.md</text>
              <text x="1150" y="398" textAnchor="middle" fontSize="26" fill={muted}>內容是一段 HTML</text>
            </g>
          </Layer></Step>
        </Steps>
      </Stage>
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={24}>讀欄位、排順序、寫成一頁</Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

const SkillSkeleton: Page = () => (
  <Shell chapter={5} source={'Agent Skills 規格 agentskills.io/specification；Codex Skills developers.openai.com/codex/skills'}>
    <Eyebrow>練習 4｜講師給的起點</Eyebrow>
    <Heading>講師給的 SKILL.md 骨架</Heading>
    <Fit>
      <div style={{ display: 'grid', gridTemplateColumns: '1080px 1fr', gap: 52, alignItems: 'center' }}>
        <In i={0}>
          <CodeDoc title="sanguo-timeline/SKILL.md" size={25}>
            <CL band={amberSoft}>---</CL>
            <CL band={amberSoft}>name: sanguo-timeline</CL>
            <CL band={amberSoft} n={1}>description: 把三國筆記庫的卡片依回目排成時間軸。</CL>
            <CL band={amberSoft}>  使用者說「三國時間軸」「排時間軸」時使用。</CL>
            <CL band={amberSoft}>---</CL>
            <CL># 三國時間軸</CL>
            <CL band={blueSoft} n={2}>## 步驟</CL>
            <CL band={blueSoft}>1. 讀 關係/ 每張卡的 回目、年份、參與人物</CL>
            <CL band={blueSoft}>2. 依回目由小到大排；沒有回目的卡，最後列出來</CL>
            <CL band={blueSoft}>3. 寫入 整理/時間軸.md</CL>
            <CL band={sage} n={3}>## 輸出格式</CL>
            <CL band={sage}>- 一段 HTML，每件事一列：回目、年份、事件、人物</CL>
            <CL band={sage}>- HTML 裡的人名用純文字，不加 [[ ]]</CL>
            <CL band={sage}>- 表格下方列出每一列的來源卡</CL>
          </CodeDoc>
        </In>
        <div style={{ display: 'grid', gap: 40 }}>
          <Steps>
            <Step duration={STEP_MS}><Callout n={1} title="description" detail="把會說的話寫進去" /></Step>
            <Step duration={STEP_MS}><Callout n={2} title="步驟：讀、排、寫" detail="可以照自己的話改" /></Step>
            <Step duration={STEP_MS}><Callout n={3} title="人名不加 [[ ]]" detail="第四堂才能直接發布" /></Step>
          </Steps>
        </div>
      </div>
    </Fit>
  </Shell>
);

const HtmlLinkTest: Page = () => (
  <Shell chapter={5} source={'Digital Garden 文件 docs.forestry.md；github.com/oleeskild/obsidian-digital-garden'}>
    <Eyebrow>實測｜Digital Garden 網站</Eyebrow>
    <Heading>HTML 裡的 [[連結]] 不會轉換</Heading>
    <Fit>
      <div style={{ display: 'grid', gridTemplateColumns: '660px 1fr', gap: 72, alignItems: 'center', position: 'relative' }}>
        <In i={0}>
          <Crop src={dgHtmlTest} alt="Digital Garden 網站的測試頁：HTML 區塊裡的 [[劉備]]、[[關羽]]、[[張飛]] 原樣顯示成文字；下方顯示 script 有執行" iw={1400} ih={900} crop={[400, 180, 640, 580]} width={660} />
          <Caption>講師網站模板本機建置｜2026-10-17</Caption>
        </In>
        <div style={{ display: 'grid', gap: 40 }}>
          <Steps>
            <Step duration={STEP_MS}><Callout n={1} title="[[劉備]] 原樣顯示" detail="HTML 裡的連結不會轉換" /><MarkLayer width={660} height={598}><RegionMark step n={1} x={6.5} y={27} w={64} h={7.5} badge="right" /></MarkLayer></Step>
            <Step duration={STEP_MS}><Callout n={2} title="HTML、script 都能跑" detail="顏色、版面照樣出現" /><MarkLayer width={660} height={598}><RegionMark step n={2} x={2.5} y={54.5} w={21} h={7.5} badge="right" /></MarkLayer></Step>
            <Step duration={STEP_MS}><div style={{ fontFamily: display, fontSize: 42, lineHeight: 1.35, color: amber }}>所以人名用純文字</div></Step>
          </Steps>
        </div>
      </div>
    </Fit>
  </Shell>
);

// One line of a folder tree.
const TreeLine = ({ depth, name, file = false }: { depth: number; name: string; file?: boolean }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 14, height: 62, paddingLeft: depth * 46 + 12, fontFamily: mono, fontSize: 30, background: file ? sage : undefined, border: file ? `2px solid ${okGreen}` : '2px solid transparent', fontWeight: file ? 600 : 400 }}>
    <Icon kind={file ? 'doc' : 'folder'} size={36} color={file ? okGreen : amber} />
    <span>{name}</span>
  </div>
);

const TreePanel = ({ title, sub, children }: { title: string; sub: string; children: ReactNode }) => (
  <div style={{ background: '#FFFFFF', border: `1px solid ${rule}`, borderTop: `5px solid ${amber}`, padding: '24px 32px 28px', height: '100%', boxSizing: 'border-box' }}>
    <div style={{ fontSize: 34, fontWeight: 600 }}>{title}</div>
    <div style={{ fontSize: 26, color: muted, marginTop: 4 }}>{sub}</div>
    <div style={{ marginTop: 20 }}>{children}</div>
  </div>
);

const SaveSkill: Page = () => (
  <Shell chapter={5} source={'Codex Skills 文件（.agents/skills 位置）developers.openai.com/codex/skills'}>
    <Eyebrow>練習 4｜建檔、重開、確認</Eyebrow>
    <Heading>請 Codex 建好 SKILL.md</Heading>
    <PromptsCopy step="4-1" />
    <Fit>
      <div style={{ display: 'grid', gridTemplateColumns: '580px 1fr', alignItems: 'stretch' }}>
        <In i={0}>
          <TreePanel title="1｜貼給 Codex" sub="提示詞後面附骨架全文">
            <div style={{ borderLeft: `6px solid ${amber}`, paddingLeft: 22, fontSize: 28, lineHeight: 1.6 }}>
              <div>在這個筆記庫建立</div>
              <div><Path size={26}>.agents/skills/</Path></div>
              <div><Path size={26}>sanguo-timeline/SKILL.md</Path></div>
              <div>內容就是下面這段，一字不改。</div>
              <div style={{ color: quiet }}>（骨架全文）</div>
            </div>
          </TreePanel>
        </In>
        <div>
          <Steps>
            <Step duration={STEP_MS}>
              <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr', alignItems: 'center', height: '100%' }}>
                <div style={{ textAlign: 'center', color: amber }}>
                  <div style={{ fontSize: 64, lineHeight: 1 }}>→</div>
                  <div style={{ fontSize: 25, fontWeight: 600, marginTop: 6, lineHeight: 1.3 }}>Codex<br />建檔</div>
                </div>
                <TreePanel title="2｜放進筆記庫" sub="這個筆記庫的 skills 資料夾">
                  <TreeLine depth={0} name="三國人物知識庫/" />
                  <TreeLine depth={1} name=".agents/skills/" />
                  <TreeLine depth={2} name="sanguo-timeline/" />
                  <TreeLine depth={3} name="SKILL.md" file />
                </TreePanel>
              </div>
            </Step>
          </Steps>
        </div>
      </div>
      <Steps>
        <Step duration={STEP_MS}><div style={{ marginTop: 26 }}>
          <SmallLabel>3｜重開後確認</SmallLabel>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginTop: 10 }}>
            <ChipStep n={1}><Path size={30}>/quit</Path> 再打 <Path size={30}>codex</Path></ChipStep><ChipArrow />
            <ChipStep n={2}>問「列出你能用的 skills」</ChipStep><ChipArrow />
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 12, background: sage, border: `2px solid ${okGreen}`, padding: '10px 22px', fontSize: 30 }}><Icon kind="ok" size={36} color={okGreen} />看到 <Path size={30}>sanguo-timeline</Path></span>
          </div>
        </div></Step>
        <Step duration={STEP_MS}><Takeaway marginTop={26}>放好後重開 Codex，它才看得到</Takeaway></Step>
      </Steps>
    </Fit>
  </Shell>
);

const RunTimeline: Page = () => (
  <Shell chapter={5} source={'Codex Skills 文件 developers.openai.com/codex/skills'}>
    <PracticeEyebrow time="20 分鐘（三步）">練習 4｜寫 Skill</PracticeEyebrow>
    <Heading>練習（Skill）：執行三國時間軸</Heading>
    <PromptsCopy step="4-2" />
    <In i={0} style={{ marginTop: 40 }}><PromptBox>請使用 sanguo-timeline skill，排出三國時間軸。</PromptBox></In>
    <Fit>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', gap: 24 }}>
        <FlowStep i={1} n={1} kind="save" label="存好 SKILL.md" w={320} />
        <FlowArrow i={2} />
        <FlowStep i={3} n={2} kind="terminal" label="重開 Codex" w={320} />
        <FlowArrow i={4} />
        <FlowStep i={5} n={3} kind="chat" label="點名執行" w={320} />
        <FlowArrow i={6} />
        <FlowStep i={7} n={4} kind="doc" label="打開時間軸.md" w={320} />
      </div>
      <Steps><Step duration={STEP_MS}><div style={{ marginTop: 36 }}>
        <TermBox title="Codex 實際紀錄（節錄）" size={25}>
          <TL tone="ask">› 請使用 sanguo-timeline skill，排出三國時間軸。</TL>
          <TL tone="dim">• 我會使用 `sanguo-timeline` skill，先讀取其規則……</TL>
          <TL hot><Typed>$</Typed> sed -n '1,240p' .agents/skills/sanguo-timeline/SKILL.md</TL>
          <TL>• 已完成三國時間軸，依回目由小到大排列，共 6 張關係卡；……</TL>
        </TermBox>
      </div></Step></Steps>
    </Fit>
  </Shell>
);

const TimelineResult: Page = () => (
  <Shell chapter={5}>
    <Eyebrow>練習 4｜先看講師第一次跑的結果</Eyebrow>
    <Heading>按回目排出的事件表</Heading>
    <Fit>
      <div style={{ display: 'grid', gridTemplateColumns: '720px 1fr', gap: 64, alignItems: 'center', position: 'relative' }}>
        <In i={0}>
          <Crop src={timelineSite} alt="實際產出的時間軸放上網站：六列，第 1、5、19、21、46、49 回；年份欄都寫未標註；人名是純文字" iw={1400} ih={1000} crop={[418, 300, 600, 515]} width={720} />
          <Caption>講師 2026-10-17 實際產出｜講師網站模板本機建置</Caption>
        </In>
        <div style={{ display: 'grid', gap: 40 }}>
          <Steps>
            <Step duration={STEP_MS}><Callout n={1} title="6 列，依回目排好" detail="小說順序，不是精確年代" /></Step>
            <Step duration={STEP_MS}><Callout n={2} title="人名是純文字" detail="照 SKILL.md 的規則" /></Step>
            <Step duration={STEP_MS}><Callout n={3} title="年份欄寫「未標註」" detail="SKILL.md 沒說沒年份要怎麼寫" /><MarkLayer width={720} height={618}><RegionMark step x={11.5} y={1.5} w={8.5} h={97} /></MarkLayer></Step>
          </Steps>
        </div>
      </div>
    </Fit>
  </Shell>
);

// A node in the run → look → edit → run-again cycle.
const LoopNode = ({ cx, cy, n, label, hot = false }: { cx: number; cy: number; n: number; label: string; hot?: boolean }) => (
  <g>
    <rect x={cx - 170} y={cy - 48} width="340" height="96" fill={hot ? amberSoft : '#FFFFFF'} stroke={hot ? amber : ink} strokeWidth={hot ? 3 : 2} />
    <circle cx={cx - 128} cy={cy} r="24" fill={amber} />
    <text x={cx - 128} y={cy + 9} textAnchor="middle" fontSize="26" fontWeight="600" fill="#FFFFFF">{n}</text>
    <text x={cx + 20} y={cy + 11} textAnchor="middle" fontSize="31" fontWeight="600" fill={ink}>{label}</text>
  </g>
);

const EditLoop: Page = () => (
  <Shell chapter={5} source={'Anthropic 2025, Equipping Agents for the Real World with Agent Skills（開發與評估 Skill）'}>
    <Eyebrow>練習 4｜調整</Eyebrow>
    <Heading>Skill 迭代（Iteration）</Heading>
    <Lead>檢查結果、修改 SKILL.md，再執行一次</Lead>
    <Fit>
      <Stage h={450}>
        <Steps>
          <Layer h={450} label="第一步：執行 Skill">
            <InG i={0}><LoopNode cx={816} cy={56} n={1} label="執行 Skill" /></InG>
          </Layer>
          <Step duration={STEP_MS}><Layer h={450} label="第二步：看結果">
            <g fill="none" stroke={faint} strokeWidth="4"><StepPath d="M986 56 Q1300 56 1300 156" /></g>
            <g className="aw3-build" style={buildDelay(2)}><polygon points="1300,170 1290,152 1310,152" fill={faint} /><LoopNode cx={1300} cy={220} n={2} label="看結果" /></g>
          </Layer></Step>
          <Step duration={STEP_MS}><Layer h={450} label="第三步：改 SKILL.md">
            <g fill="none" stroke={faint} strokeWidth="4"><StepPath d="M1300 268 Q1300 390 1000 390" /></g>
            <g className="aw3-build" style={buildDelay(2)}><polygon points="986,390 1004,380 1004,400" fill={faint} /><LoopNode cx={816} cy={390} n={3} label="改 SKILL.md" hot /></g>
          </Layer></Step>
          <Step duration={STEP_MS}><Layer h={450} label="第四步：再跑一次，回到第一步">
            <g fill="none" stroke={faint} strokeWidth="4"><StepPath d="M646 390 Q332 390 332 284" /><StepPath d="M332 172 Q332 56 632 56" i={2} /></g>
            <g className="aw3-build" style={buildDelay(1)}><polygon points="332,270 322,288 342,288" fill={faint} /><LoopNode cx={332} cy={220} n={4} label="再跑一次" /></g>
            <g className="aw3-build" style={buildDelay(3)}><polygon points="646,56 628,46 628,66" fill={faint} /></g>
          </Layer></Step>
          <Step duration={STEP_MS}><Layer h={450} label="不做的事：重打一長串提示詞">
            <g className="aw3-build" style={buildDelay(0)}>
              <rect x="636" y="186" width="360" height="72" fill="#FFFFFF" stroke={faint} strokeWidth="2" strokeDasharray="10 8" />
              <text x="840" y="232" textAnchor="middle" fontSize="29" fill={quiet}>重打長提示詞</text>
              <line x1="700" y1="222" x2="980" y2="222" stroke={warn} strokeWidth="3" />
              <CrossMark x={668} y={222} size={22} color={warn} />
            </g>
          </Layer></Step>
        </Steps>
      </Stage>
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={16}>改一次說明書，之後每次照新的做</Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

// One real flaw from the first run (left) and, on a click, the rule that fixed it and the re-run output (right).
const FixRow = ({ n, bad, badNote, fixRule, good }: { n: number; bad: string; badNote: string; fixRule: ReactNode; good: string }) => (
  <div style={{ display: 'grid', gridTemplateColumns: '600px 1fr', gap: 24, alignItems: 'stretch' }}>
    <div style={{ background: '#FFFFFF', border: `1px solid ${rule}`, borderLeft: `6px solid ${amber}`, padding: '18px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}><NumDot n={n} size={36} /><SmallLabel color={quiet}>第一次跑</SmallLabel></div>
      <div style={{ fontFamily: mono, fontSize: 28, background: term, color: '#F5F5F4', padding: '6px 14px', whiteSpace: 'pre', marginTop: 10, display: 'inline-block' }}>{bad}</div>
      <div style={{ marginTop: 10 }}><StatusLine ok={false} size={29}>{badNote}</StatusLine></div>
    </div>
    <div>
      <Steps>
        <Step duration={STEP_MS}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 56px 1fr', alignItems: 'center', height: '100%' }}>
            <div style={{ background: sage, borderLeft: `6px solid ${okGreen}`, padding: '14px 18px', height: '100%', boxSizing: 'border-box' }}>
              <SmallLabel color={okGreen}>SKILL.md 加一行</SmallLabel>
              <div style={{ fontFamily: mono, fontSize: 27, color: okGreen, marginTop: 8, lineHeight: 1.45 }}>+ {fixRule}</div>
            </div>
            <div style={{ textAlign: 'center', color: faint, fontSize: 44 }}>→</div>
            <div style={{ background: '#FFFFFF', border: `2px solid ${okGreen}`, padding: '14px 18px', height: '100%', boxSizing: 'border-box' }}>
              <SmallLabel color={okGreen}>再跑一次（10-24 實測）</SmallLabel>
              <div style={{ fontFamily: mono, fontSize: 29, marginTop: 10, whiteSpace: 'pre' }}>{good}</div>
            </div>
          </div>
        </Step>
      </Steps>
    </div>
  </div>
);

const EditExample: Page = () => (
  <Shell chapter={5}>
    <PracticeEyebrow time="練習 4 第 2 步">練習 4｜補規則</PracticeEyebrow>
    <Heading>說明書沒寫清楚：補一條規則</Heading>
    <PromptsCopy step="4-3" />
    <Fit>
      <div style={{ display: 'grid', gap: 32 }}>
        <In i={0}><FixRow n={1} bad="<td>未標註</td>" badNote="沒說沒有年份要寫什麼" fixRule={<>年份照卡片抄，<br />卡片沒寫就留空白，<br />不要寫「未標註」或「—」</>} good="<td></td>（留空）" /></In>
        <In i={1}><FixRow n={2} bad={'<a href="../關係/桃園結義.md">'} badNote="沒說要不要連結；上網站會 404" fixRule={<>來源卡只寫檔名純文字，<br />不做連結，<br />{'不用 <a href>，也不用 [[ ]]'}</>} good="桃園結義.md" /></In>
      </div>
      <Steps>
        <Step duration={STEP_MS}><div style={{ marginTop: 28, fontSize: 30, display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <span>你的時間軸：<Path size={28}>Cmd／Ctrl+F</Path> 搜</span>
          <Path size={28}>未標註</Path><span style={{ color: faint }}>、</span><Path size={28}>—</Path><span style={{ color: faint }}>、</span><Path size={28}>{'<a href'}</Path><span style={{ color: faint }}>、</span><Path size={28}>[[</Path>
        </div></Step>
        <Step duration={STEP_MS}><Takeaway marginTop={28}>都搜不到？挑一個不滿意的地方，寫成規則</Takeaway></Step>
      </Steps>
    </Fit>
  </Shell>
);

// One event on the person-filter timeline.
const FilterDot = ({ x, n, name }: { x: number; n: string; name: string }) => (
  <g>
    <circle cx={x} cy="110" r="14" fill={amber} />
    <text x={x} y="72" textAnchor="middle" fontSize="25" fontWeight="600" fill={amber}>{n}</text>
    <text x={x} y="166" textAnchor="middle" fontSize="28" fill={ink}>{name}</text>
  </g>
);

const LiuChip = ({ x }: { x: number }) => (
  <g>
    <rect x={x - 62} y="190" width="124" height="48" fill={sage} stroke={okGreen} strokeWidth="2" />
    <text x={x} y="223" textAnchor="middle" fontSize="26" fill={okGreen}>劉備</text>
  </g>
);

const PersonFilter: Page = () => (
  <Shell chapter={5}>
    <PracticeEyebrow time="練習 4 第 3 步">練習 4｜進階選做</PracticeEyebrow>
    <Heading>進階：只排出劉備的事件</Heading>
    <PromptsCopy step="4-4" />
    <In i={0} style={{ marginTop: 40 }}>
      <CodeDoc title="請 Codex 在 SKILL.md 的步驟加第 4 步" size={28}>
        <CL band={sage} color={okGreen}>+ 4. 使用者指定人物時，只留下參與人物有他的事件</CL>
      </CodeDoc>
    </In>
    <Steps><Step duration={STEP_MS}><div style={{ marginTop: 20 }}><PromptBox size={29}>請使用 sanguo-timeline skill，只排劉備的事件，存成 整理/時間軸-劉備.md</PromptBox></div></Step></Steps>
    <Fit>
      <Stage h={260}>
        <Steps>
          <Layer h={260} label="加第 4 步之前，全部六件事：桃園結義、三英戰呂布、白門樓、煮酒論英雄、草船借箭、赤壁之戰">
            <InG i={1}>
              <line x1="60" y1="110" x2="1572" y2="110" stroke={amber} strokeWidth="4" />
              <FilterDot x={110} n="第 1 回" name="桃園結義" />
              <FilterDot x={392} n="第 5 回" name="三英戰呂布" />
              <FilterDot x={674} n="第 19 回" name="白門樓" />
              <FilterDot x={956} n="第 21 回" name="煮酒論英雄" />
              <FilterDot x={1238} n="第 46 回" name="草船借箭" />
              <FilterDot x={1520} n="第 49 回" name="赤壁之戰" />
            </InG>
          </Layer>
          <Step duration={STEP_MS}><Layer h={260} label="實測結果：草船借箭的參與人物沒有劉備，被拿掉；其他五件留下">
            <g className="aw3-build" style={buildDelay(0)}>
              <rect x="1150" y="40" width="176" height="150" fill="#FAFAF9" opacity="0.82" />
              <CrossMark x={1238} y={110} size={40} color={warn} />
              <text x="1238" y="228" textAnchor="middle" fontSize="25" fill={warn}>沒有劉備</text>
            </g>
            <g className="aw3-build" style={buildDelay(1)}>
              <LiuChip x={110} />
              <LiuChip x={392} />
              <LiuChip x={674} />
              <LiuChip x={956} />
              <LiuChip x={1520} />
            </g>
          </Layer></Step>
        </Steps>
      </Stage>
      <Steps><Step duration={STEP_MS}><div style={{ display: 'flex', justifyContent: 'center', marginTop: 18 }}>
        <div style={{ background: sage, padding: '12px 28px' }}><StatusLine ok size={29}>10-24 實測：5 件，只有第 1 回有年份，來源卡是純文字</StatusLine></div>
      </div></Step></Steps>
    </Fit>
  </Shell>
);

// ---------- Close ----------

const RecapStop = ({ x, n, verb }: { x: number; n: Chapter; verb: string }) => (
  <g>
    <circle cx={x} cy="80" r="52" fill={amberSoft} stroke={amber} strokeWidth="3" />
    <text x={x} y="96" textAnchor="middle" fontSize="42" fontFamily={display} fill={amber}>{n}</text>
    <text x={x} y="186" textAnchor="middle" fontSize="28" fontWeight="600" fill={ink}>{CHAPTERS[n - 1]}</text>
    <text x={x} y="234" textAnchor="middle" fontSize="26" fill={muted}>{verb}</text>
  </g>
);

const Recap: Page = () => (
  <Shell>
    <Eyebrow>總結</Eyebrow>
    <Heading>今天學的五件事</Heading>
    <Fit>
      <Figure h={260} label="五章：Skill 是做事說明、兩種裝法、用完要核對、照原文補卡、改 SKILL.md 再跑">
        <g fill="none" stroke={amber} strokeWidth="4"><DrawPath i={5} d="M202 80 H1430" /></g>
        <InG i={0}><RecapStop x={150} n={1} verb="description 決定何時用" /></InG>
        <InG i={1}><RecapStop x={483} n={2} verb="plugin 和 npx 兩種裝法" /></InG>
        <InG i={2}><RecapStop x={816} n={3} verb="用完回卡片核對" /></InG>
        <InG i={3}><RecapStop x={1149} n={4} verb="照原文補卡" /></InG>
        <InG i={4}><RecapStop x={1482} n={5} verb="改 SKILL.md 再跑" /></InG>
      </Figure>
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={72}>下一堂：把筆記庫發布成網站</Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

const SiteStop = ({ x, kind, label, sub, hot = false }: { x: number; kind: IconKind; label: string; sub: string; hot?: boolean }) => (
  <g>
    <circle cx={x} cy="100" r="80" fill={hot ? amberSoft : '#FFFFFF'} stroke={hot ? amber : rule} strokeWidth="3" />
    <SvgIcon kind={kind} x={x} y={100} size={80} color={hot ? amber : ink} />
    <text x={x} y="232" textAnchor="middle" fontSize="34" fontWeight="600" fill={ink}>{label}</text>
    <text x={x} y="276" textAnchor="middle" fontSize="26" fill={muted}>{sub}</text>
  </g>
);

const NextLesson: Page = () => (
  <Shell source={'GitHub 說明 docs.github.com；Vercel 入門 vercel.com/docs/getting-started-with-vercel'}>
    <Eyebrow>下一堂預告</Eyebrow>
    <Heading>第四堂：發布成網站</Heading>
    <Fit>
      <Figure h={300} label="筆記庫推到 GitHub，Vercel 自動建置，得到一個網址">
        <InG i={0}><SiteStop x={180} kind="folder" label="筆記庫" sub="含 時間軸.md" /></InG>
        <InG i={1}><MapArrow x1={280} x2={500} y={100} /></InG>
        <InG i={2}><SiteStop x={600} kind="save" label="GitHub" sub="存一份在雲端" /></InG>
        <InG i={3}><MapArrow x1={700} x2={920} y={100} /></InG>
        <InG i={4}><SiteStop x={1020} kind="terminal" label="Vercel" sub="自動建置" /></InG>
        <InG i={5}><MapArrow x1={1120} x2={1340} y={100} hot /></InG>
        <InG i={6}><SiteStop x={1440} kind="globe" label="網址" sub="同學點得到" hot /></InG>
      </Figure>
      <Steps><Step duration={STEP_MS}><div style={{ display: 'flex', justifyContent: 'center', gap: 40, marginTop: 64 }}>
        <div style={{ background: sage, padding: '16px 32px' }}><StatusLine ok size={32}>課前註冊 GitHub</StatusLine></div>
        <div style={{ background: sage, padding: '16px 32px' }}><StatusLine ok size={32}>課前註冊 Vercel</StatusLine></div>
      </div></Step></Steps>
    </Fit>
  </Shell>
);

// ---------- Deck ----------

// ---------- References ----------

// One cited work: who and where on the first line, the title under it.
const RefItem = ({ who, where, title }: { who: string; where: string; title: string }) => (
  <div>
    <div style={{ fontSize: 27, fontWeight: 600, lineHeight: 1.3 }}>{who}<span style={{ fontFamily: mono, fontSize: 24, fontWeight: 400, color: amber, marginLeft: 18 }}>{where}</span></div>
    <div style={{ fontSize: 24, color: muted, lineHeight: 1.35, marginTop: 4 }}>{title}</div>
  </div>
);

const RefGroup = ({ label, children }: { label: string; children: ReactNode }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
    <div style={{ borderBottom: `2px solid ${amber}`, paddingBottom: 8 }}><SmallLabel>{label}</SmallLabel></div>
    {children}
  </div>
);

const RefHint = ({ children }: { children: ReactNode }) => (
  <div style={{ fontSize: 25, color: quiet, marginTop: 14 }}>{children}</div>
);

const ReferencesSkills: Page = () => (
  <Shell>
    <Eyebrow>延伸閱讀｜第 1 章用到的文件</Eyebrow>
    <Heading>參考資料（一）：Skill、AGENTS.md 與 MCP</Heading>
    <RefHint>完整網址寫在這頁的講者備忘稿</RefHint>
    <Fit>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'start' }}>
        <In i={0}>
          <RefGroup label="Agent Skills">
            <RefItem who="Anthropic 2025" where="anthropic.com" title="Equipping Agents for the Real World with Agent Skills" />
            <RefItem who="Agent Skills 規格" where="agentskills.io" title="Specification：name、description、資料夾結構" />
            <RefItem who="OpenAI Codex 文件" where="developers.openai.com" title="Skills：用到才讀全文、.agents/skills 位置" />
            <RefItem who="OpenAI Codex 文件" where="developers.openai.com" title="Plugins：外掛、marketplace、plugin.json" />
          </RefGroup>
        </In>
        <In i={1}>
          <RefGroup label="AGENTS.md、MCP">
            <RefItem who="OpenAI Codex 文件" where="developers.openai.com" title="AGENTS.md：每個 Session 都會讀的專案規則" />
            <RefItem who="AGENTS.md" where="agents.md" title="A simple, open format for guiding coding agents" />
            <RefItem who="Anthropic 2024" where="anthropic.com" title="Introducing the Model Context Protocol" />
            <RefItem who="Model Context Protocol" where="modelcontextprotocol.io" title="MCP 官方文件；Codex 接 MCP：developers.openai.com" />
          </RefGroup>
        </In>
      </div>
    </Fit>
  </Shell>
);

const ReferencesTools: Page = () => (
  <Shell>
    <Eyebrow>延伸閱讀｜第 2–5 章用到的工具與原文</Eyebrow>
    <Heading>參考資料（二）：兩個 Skill、RAG 與原文</Heading>
    <RefHint>arXiv 編號：到 arxiv.org/abs/ 後面接編號，就能打開論文</RefHint>
    <Fit>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'start' }}>
        <In i={0}>
          <RefGroup label="今天裝的 Skill">
            <RefItem who="Cathryn Lavery" where="github.com" title="diagram-design：把資料畫成圖的 Codex 外掛" />
            <RefItem who="DreambigOu" where="github.com" title="ELI5：依對象用白話解釋的 Skill" />
            <RefItem who="Vercel Labs" where="github.com" title="skills：npx skills add 安裝工具（skills.sh）" />
          </RefGroup>
        </In>
        <In i={1}>
          <RefGroup label="RAG、原文、發布">
            <RefItem who="Lewis et al. 2020" where="2005.11401" title="Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks" />
            <RefItem who="維基文庫" where="zh.wikisource.org" title="《三國演義》第 1、5、19、21、46、49 回" />
            <RefItem who="Obsidian Help" where="help.obsidian.md" title="Properties：卡片最上面的屬性欄位" />
            <RefItem who="Digital Garden" where="docs.forestry.md" title="Getting Started：dg-publish 發布開關" />
          </RefGroup>
        </In>
      </div>
    </Fit>
  </Shell>
);

// Page changes: the outgoing page holds, the incoming one rises 6px as it fades in.
// Chapter openers and the cover settle in a touch more slowly.
const HOLD: Keyframe[] = [{ opacity: 1 }, { opacity: 1 }];

export const transition: SlideTransition = {
  duration: 260,
  exit: { duration: 260, easing: 'cubic-bezier(0.4, 0, 1, 1)', keyframes: HOLD },
  enter: { duration: 260, easing: EASE_OUT, keyframes: [{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'translateY(0)' }] },
};

const OPENER: SlideTransition = {
  duration: 280,
  exit: { duration: 280, easing: 'cubic-bezier(0.4, 0, 1, 1)', keyframes: HOLD },
  enter: { duration: 280, easing: EASE_OUT, keyframes: [{ opacity: 0, transform: 'translateY(10px)', filter: 'blur(4px)' }, { opacity: 1, transform: 'translateY(0)', filter: 'blur(0)' }] },
};
Cover.transition = OPENER;
Section1.transition = OPENER;
Section2.transition = OPENER;
Section3.transition = OPENER;
Section4.transition = OPENER;
Section5.transition = OPENER;

export const meta: SlideMeta = {
  title: 'aw-03 Skills',
  createdAt: '2026-10-17T02:58:51.682Z',
  theme: 'thoughtstream',
};

const deck: Page[] = [
  Cover, Review, Agenda,
  Section1, RepeatPrompt, SkillIsSop, SkillFolder, SkillAnatomy, Eli5Skill, DescriptionTrigger, CallByName, LoadOnUse, PromptAgentsSkill, McpPlug, CompareTable, SkillOrMcp,
  Section2, TwoWays, GitCheck, InstallDiagram, InstallEli5, PluginFails, SkillsList,
  Section3, DiagramRun, DiagramResult, LabelFix, Eli5Rewrite, DgPublishCopied, VerifyOutputs,
  Section4, CardTemplate, RagAgain, EnrichPractice, YearCheck,
  Section5, TimelineGoal, SkillSkeleton, SaveSkill, RunTimeline, TimelineResult, HtmlLinkTest, EditLoop, EditExample, PersonFilter,
  Recap, NextLesson, ReferencesSkills, ReferencesTools,
];

// 1-based page number of a page in this deck (for the agenda).
function pageOf(page: Page) {
  return deck.indexOf(page) + 1;
}

// The SKILL.md skeleton handed out in practice 4 (also quoted in the notes).
const SKELETON = `---
name: sanguo-timeline
description: 把三國筆記庫的卡片依回目排成時間軸。使用者說「三國時間軸」「排時間軸」時使用。
---
# 三國時間軸

## 步驟
1. 讀 關係/ 每張卡的 回目、年份、參與人物
2. 依回目由小到大排；沒有回目的卡，最後列出來
3. 寫入 整理/時間軸.md

## 輸出格式
- 一段 HTML，每件事一列：回目、年份、事件、人物
- HTML 裡的人名用純文字，不加 [[ ]]
- 表格下方列出每一列的來源卡`;

// Speaker notes, keyed by page so they stay aligned with the deck order.
const NOTES = new Map<Page, string>([
  [Cover, `00:00–01:00。第三堂講 Skills。前兩堂用 Codex 寫了大綱，做出三國筆記庫；今天把常做的事寫成說明書，交給 Codex 照著做。先裝兩個別人寫好的 Skill 來用，最後自己寫一個「三國時間軸」。
請大家先在自己的筆電打開這份簡報：${DECK_SITE}。今天的提示詞都在 prompts.md，練習頁右上角的連結點下去就是，整段複製貼上，不用照投影片打字。所有教材的總表：https://github.com/Chrouos/AI-workshop-slides/tree/main/examples`],
  [Review, `01:00–07:00。先回顧上一堂。左邊是筆記庫的資料夾：人物 5 張、勢力 3 張、關係 3 張；原文資料夾有第 1 到 21 回全文，加上第 37、38、46 回節選；整理資料夾裡放著第一堂寫的大綱。右邊是五位人物和三張關係卡。
按一下：這 10 條線，都是關係卡最後一行「參與人物」寫出來的，上一堂我們請 Codex 照這個規則畫過 ASCII 關係圖。
請大家打開自己的筆記庫，確認卡片都還在。沒帶到、或第二堂缺課的同學，在筆電上點右上角「下載 三國人物知識庫.zip」，解壓縮後用 Obsidian 打開，就能跟著做今天的練習。Windows 要在 ZIP 上按右鍵選「全部解壓縮」。下載網址：${VAULT_ZIP_URL}
最後一下：今天用 Skill 擴充這座筆記庫、畫圖，最後排出時間軸。`],
  [Agenda, `07:00–10:00。今天五章、四個練習。中間那欄是必做，每個人都要完成：看懂一份 SKILL.md、裝好兩個 Skill、畫一張關係圖並改寫一張卡、照原文新增三張卡、自己的 sanguo-timeline 跑出一次結果。第四章的三張卡都要做，第五章的時間軸會用到。右邊是選做，時間夠再做：標籤疊到就請它修、只排劉備的事件。進度落後的同學，先顧必做那一欄。第一章講 Skill 是什麼，花的時間最多，後面都靠它。最後 8 分鐘預告第四堂；第四堂前請先註冊 GitHub 和 Vercel。`],
  [Section1, `10:00–10:30。第一章：什麼是 Skill。先講為什麼需要它，再打開一份真的 SKILL.md，最後和 Prompt、AGENTS.md、MCP 比一比。`],
  [RepeatPrompt, `10:30–12:00。假設你要把每張人物卡改成國中生看得懂的版本。Session 1 打了四行要求：改寫成國中生版、只用卡片裡的內容、保留連結、存到整理資料夾。
按一下：換關羽，同樣四行再打一次。
按一下：張飛，又一次。哪一次漏打一行，結果就不一樣。
最後一下：做法都一樣，只換了卡片。這種常常重複的做法，就可以寫成 Skill。`],
  [SkillIsSop, `12:00–14:00。Skill 是交給 Agent 的一份 SOP，標準作業程序。拿食譜來比：食譜有菜名和適合的時機，有做法步驟，還有成品照，讓你知道做完長怎樣。
按一下：SKILL.md 也有這三塊：name 和 description 說它叫什麼、什麼時候用；步驟說怎麼做；輸出格式說做完長怎樣。
最後一下：寫一次，之後 Agent 每次照著做，不用你每次重新交代。`],
  [SkillFolder, `14:00–15:30。Skill 在電腦裡就是一個資料夾。eli5 的資料夾裡只有一個 SKILL.md。
按一下：diagram-design 比較大，除了 SKILL.md，還有 references、scripts、assets，放參考資料、小程式和圖檔。
最後一下：一定要有 SKILL.md，其他都是附件；Agent 讀 SKILL.md 時，會照裡面的指示再去翻附件。`],
  [SkillAnatomy, `15:30–17:30。打開 SKILL.md，最上面兩條 --- 中間叫 frontmatter，是檔案的基本資料。
按一下：第一塊 name 和 description，說它叫什麼、什麼時候用。
按一下：第二塊是步驟，一步一步怎麼做。
按一下：第三塊是輸出格式，做完要存在哪、長什麼樣子。
最後一下：何時用、怎麼做、做成什麼樣，三件事寫清楚，就是一份能用的 Skill。`],
  [Eli5Skill, `17:30–19:30。這是 eli5 的真實檔案，只放大最重要的幾行。
按一下：name 是它的名字，eli5。
按一下：description 是整份最長的一段，寫滿了「使用者說哪些話時就用我」：ELI5、dumb it down、simplify this for……
按一下：步驟從 Step 1 開始：先認出聽眾是誰。畫面省略的部分：Step 2 讀資料、Step 3 寫解釋，還有一段 Structure，規定解釋的順序：先說是什麼、打個比方、補細節，最後說跟聽的人有什麼關係。
最後一下：它就是一份普通的文字檔，你看得懂，也改得動。
檔案位置：~/.agents/skills/eli5/SKILL.md。來源：https://github.com/dreambigou/eli5`],
  [DescriptionTrigger, `19:30–21:30。Codex 怎麼知道該用哪個 Skill？它會看 description。像在書架前找書，看書背就大概知道該拿哪本。你說「把劉備卡用國中生聽得懂的方式重新說一次」，架上有四個 Skill，各自的 description 寫著它管什麼。
按一下：Codex 比對之後，eli5 寫著「依對象用白話解釋」，對上了，就拿 eli5 來用。這是 Codex 自己判斷的，不是一個開關：你的說法跟 description 差太多，它可能沒挑到，或挑錯。
最後一下：description 寫清楚什麼時候用，比較容易被挑中。等一下自己寫 Skill，這一行最重要。`],
  [CallByName, `21:30–23:00。叫出 Skill 有兩種方式。第一種是自動挑：沒寫名稱，Codex 比對 description，可能挑中，也可能漏掉。
按一下：第二種是點名，提示詞直接寫「請使用 eli5 skill」，它就會去用 eli5。這是我們實測時用的提示詞開頭。
最後一下：自動挑可能漏掉，點名最可靠。今天的練習提示詞，全部都有點名。`],
  [LoadOnUse, `23:00–24:30。裝了很多 Skill，會不會塞爆 Codex 的上下文？不會。開 Session 時，它只先記下每個 Skill 的名稱和 description，像左邊這張清單。
按一下：這是實測紀錄。我們叫它用 eli5，它先回一句「我會使用 eli5 skill」，接著用 sed 指令把 SKILL.md 整份讀進來，再讀劉備卡。
按一下：要做事了，才打開全文。
最後一下：平常只看 description，用到才讀全文。所以多裝幾個沒關係，description 一定要寫好。`],
  [PromptAgentsSkill, `24:30–27:00。接下來比一比：Prompt、AGENTS.md、Skill，等一下再加上 MCP。看三個 Session：問劉備是誰、改寫劉備卡、畫關係圖。Prompt 像便條紙：在 Session 1 說「這次回答短一點」，只管這一次，開新 Session 就沒了。
按一下：AGENTS.md 像教室公約，第一堂練習過，每個 Session 開始都會讀，三次都讀了。
按一下：Skill 像食譜，要做那道菜才翻：eli5 只在改寫劉備卡時拿出來，diagram-design 只在畫圖時用。
最後一下：Prompt 說一次、AGENTS.md 每次讀、Skill 用到才拿。`],
  [McpPlug, `27:00–28:30。第四種是 MCP，全名 Model Context Protocol。左邊是 Skill，教 Codex 怎麼做事。
按一下：右邊是 MCP，像插座，把外面的工具接進來：GitHub、Google Drive、公司資料庫。Skill 寫得再好，Codex 也碰不到它連不上的系統；要用外部系統，就要接 MCP。
最後一下：Skill 教做法，MCP 接工具。今天的練習只用 Skill，MCP 知道是什麼就好。`],
  [CompareTable, `28:30–32:30。四個放在一起，一列一列看。
按一下：Prompt，這一次的要求，例如把劉備卡改短一點。
按一下：AGENTS.md，這個專案的規則，每次都要遵守，例如回答都附檔名。
按一下：Skill，一類工作的做法，常常重複做的事，例如用 eli5 改成國中生版。
按一下：MCP，連到外部工具或資料，例如讀 GitHub 上的檔案。
按一下：遇到新需求，先問兩件事：會重複嗎？要接外面的系統嗎？
最後一下：小活動，2 分鐘。請每個人想一個自己工作或讀書上的需求，寫在紙上或聊天室，判斷它是 Prompt、AGENTS.md、Skill 還是 MCP。例如「每週把會議紀錄整理成同一個格式」是 Skill；「讓 AI 讀公司 Google Drive 上的檔案」是 MCP；「這份報告我要三段就好」是 Prompt。請兩三位分享，大家一起判斷。`],
  [SkillOrMcp, `32:30–35:00。判斷題，請大家先舉手猜。情境 1：每次 Review PR，都要照公司的 10 條規範檢查。
按一下：Skill，因為這是固定的做法和檢查流程。
情境 2：希望 AI 能查公司的 Jira 或資料庫。
按一下：MCP，因為要連到外部系統拿資料。
最後一下：Skill 是方法，MCP 是工具，兩個可以一起用：用 MCP 拿資料，再照 Skill 的做法整理。題目出自 docs/course_1_認識 AI.md。`],
  [Section2, `35:00–35:15。第二章：安裝熱門 Skill。裝兩個：diagram-design 畫圖，eli5 改寫成白話。兩個的裝法不一樣。`],
  [TwoWays, `35:15–37:00。左邊 diagram-design 是外掛，英文叫 plugin。外掛裡有一個 .codex-plugin/plugin.json，像外盒上的說明牌，告訴 Codex 這是外掛、裡面包了哪些 Skill；Skill 本身在 skills/diagram-design/SKILL.md。所以用 codex plugin 指令安裝，裝完跑 codex plugin list，看到 installed, enabled 就對了。
按一下：右邊 eli5 是一般 Skill，只有 SKILL.md，沒有 plugin.json，要用 npx skills add 安裝。它不會出現在 plugin list 裡；確認方法是重開 Codex，請它列出 skills，清單裡有 eli5。
最後一下：有 plugin.json 的，才用 plugin 指令。`],
  [GitCheck, `37:00–39:00。練習 1 共 13 分鐘，先確認有 git。等一下兩個安裝指令，背後都靠 git 從 GitHub 下載：codex plugin marketplace add 會把作者的 repo 整份抓下來，npx skills add 也一樣。打開終端機（Mac 是「終端機」，Windows 是 PowerShell），輸入 git --version，prompts.md 練習 1-1 有這行。
按一下：看到 git version 加一串數字就有了。這是講師 Mac 的輸出，版本號不同沒關係。
按一下：沒有的話，Mac 通常會直接跳出「要安裝命令列開發者工具嗎？」，按安裝；沒跳出來就打 xcode-select --install。這要下載一陣子，所以課前通知已經請大家先裝。Windows 到 git-scm.com 下載安裝，選項都用預設，裝完要把 PowerShell 關掉重開，新的視窗才找得到 git。Windows 這段講師沒有實測。
最後一下：10 分鐘內還裝不起來，就不要卡在這裡。prompts.md 最後有「備用做法」：eli5 可以不用 git，直接下載一份 SKILL.md；diagram-design 就跟旁邊的同學一起看他的圖。`],
  [InstallDiagram, `39:00–42:00。接著裝 diagram-design。這一步還不用開 Codex，直接在終端機打。一次貼一行，等跑完再貼下一行，三行都在 prompts.md 練習 1-2。
第一行：codex plugin marketplace add cathrynlavery/diagram-design，把作者的外掛商店加進來。
按一下：看到 Added marketplace 就成功了。
按一下：第二行：codex plugin add diagram-design@diagram-design，從這個商店安裝外掛。
按一下：看到 Added plugin 就裝好了。
按一下：第三行確認：codex plugin list。
按一下：清單很長，找 diagram-design 這一行，狀態寫 installed, enabled，就是裝好、也啟用了。
這是講師 2026-10-17 用 Codex 0.154.0 的實際輸出，plugin list 只節錄這一行，路徑每台電腦不同。10-24 再看，已經更新到 2.6.115；你們看到的版本號可能又不一樣，看 installed, enabled 就好。出現 command not found 或不認得 plugin 指令，多半是 Codex 太舊，先跑 npm install -g @openai/codex@latest。
來源：https://github.com/cathrynlavery/diagram-design`],
  [InstallEli5, `42:00–44:00。接著裝 eli5，貼上 prompts.md 練習 1-3：npx -y skills add dreambigou/eli5 -g -a codex -y
npx 會自動下載 skills 這個安裝工具，需要第一堂裝好的 Node.js。右邊三個參數：-g 裝給所有專案；-a codex 指定裝給 Codex；最後的 -y 自動確認，不用一直按 Enter。
按一下：看到 Found 1 skill、Installed 1 skill，eli5 被複製到 ~/.agents/skills/eli5，最後是 Done。
按一下：注意最後一句：Skill 會用 Agent 的完整權限執行，裝之前先看過 SKILL.md。這個工具也會顯示安全評估，eli5 是 Safe、0 alerts、Low Risk。不認識的 Skill，先打開 SKILL.md 看它要做什麼，再決定裝不裝。
git 裝不起來的同學：eli5 是 MIT 授權，講師在 examples/aw-03-lab/eli5/ 放了一份 SKILL.md，prompts.md 的「備用做法」有一行指令，直接下載到 ~/.agents/skills/eli5/，不用 git。Mac 的指令講師測過，Windows 那行沒測過。
來源：https://skills.sh/dreambigou/eli5`],
  [PluginFails, `44:00–45:30。有人會想：diagram-design 用 plugin 指令，那 eli5 也這樣裝吧。我們試過：codex plugin marketplace add dreambigou/eli5
按一下：會失敗，訊息最後是 marketplace root does not contain a supported manifest，意思是找不到外掛的說明牌。
按一下：diagram-design 的 repo 有 .codex-plugin/plugin.json；eli5 的 repo 只有 SKILL.md。
最後一下：沒有 plugin.json，就改用 npx skills add。看到這個錯誤不用緊張，換指令就好。`],
  [SkillsList, `45:30–50:00。Skill 在開 Codex 時載入，所以裝完要重開。而且 Codex 一定要開在筆記庫資料夾裡，後面的練習才找得到卡片，練習 4 的 Skill 也放在筆記庫裡。剛剛是在家目錄裝的，現在換位置：打 cd 和一個空格，把「三國人物知識庫」資料夾拖進終端機，按 Enter。
再打 ls，要看得到 人物、關係、原文、模板。只看到另一個「三國人物知識庫」，是解壓縮多包了一層，Windows 很常見，再 cd 三國人物知識庫 進去一層。已經開著 Codex 的同學，先輸入 /quit 關掉。
然後打 codex，貼上 prompts.md 練習 1-4 這句：列出你現在可以使用的 skills 名稱，每個一行，附一句用途。不要讀或修改任何檔案。
按一下：這是講師電腦的實際輸出，中間省略了一些。找兩行：diagram-design:diagram-design 和 eli5。外掛裡的 Skill，名稱前面會多一段外掛名，冒號前是外掛、冒號後是 Skill。
按一下：兩個都在，就裝好了。講師電腦裝了比較多 Skill，你的清單會短一點，這是正常的。
最後一下：清單只證明裝好了；能不能真的用，下一章實際跑一次才知道。剩下的時間，幫旁邊的同學確認。`],
  [Section3, `50:00–50:15。第三章：用 Skill 做好讀的筆記。兩個練習：用 diagram-design 把關係卡畫成圖，用 eli5 把劉備卡改成國中生版。做完都要回卡片核對。`],
  [DiagramRun, `50:15–55:00。練習 2 共 20 分鐘。Codex 還開在筆記庫裡，直接貼上 prompts.md 練習 2-1，跟畫面上這段一樣。
按一下：它讀完卡片，第一次用 diagram-design 會停下來問樣式。這是講師 2026-10-24 重跑的畫面：選項是 a 到 f，預設樣式是 e。10-17 跑的時候還是 1 到 5、預設是 1。代號會跟著版本變，不用背代號，找「保留預設樣式」那一項。
按一下：回答「保留預設樣式，請直接產生並存檔。」
按一下：存好了，這次它說畫了 12 條線。實測這一步要一兩分鐘；寫檔前如果問 Yes, proceed，看過再按。`],
  [DiagramResult, `55:00–57:00。這是講師 10-17 那次畫出來的圖。打開的方法：在 Finder（Windows 是檔案總管）進到筆記庫的 圖/ 資料夾，雙擊 三國關係圖.html，會用瀏覽器打開。Obsidian 的檔案列表看不到 .html，這是正常的。
按一下：左邊是 5 張人物卡。
按一下：右邊是 3 張事件卡，這次連出 10 條線，每條線旁邊標了「人物卡＋關係卡」的檔名。線的數量每次會不一樣：10-24 重跑是 12 條，它把〈煮酒論英雄〉內文提到的關羽、張飛也連上了。你第二堂自己寫過關係卡的話，還會再多。多出來的是你自己寫的卡，正常。等一下核對時，挑一條多出來的線，打開那張卡找依據。
按一下：赤壁之戰附近，幾條線的標籤疊在一起，看不清楚。它在回報裡還寫著「幾何檢查已通過」。`],
  [LabelFix, `57:00–60:00。這一步先看你自己的圖：標籤有疊到、或看不出是哪條線的，才做；沒疊到就跳過，直接做 eli5。10-24 重跑那張就沒疊得這麼嚴重。左邊是 10-17 那次改之前的放大圖：赤壁之戰附近，四條線的標籤疊在一起。第一次畫出來不完美很正常。
按一下：在同一個 Session 接著貼 prompts.md 練習 2-2：「圖上線的標籤疊在一起了。請把標籤分開，不要互相蓋住；節點和連線不變，存回同一個檔案。」同一個 Session 記得剛剛畫了什麼，不用重講。
按一下：右邊是改完的實際畫面，同一個角落、同樣放大。請大家左右比一比，自己判斷有沒有變好。
按一下：標籤變短了，只留人物卡檔名，疊得少很多；但赤壁附近還有幾個字壓在線上。
按一下：Codex 自己的回報是「已重新排開來源標籤，避免互相覆蓋；節點與連線均未修改，並已通過幾何檢查」。
最後一下：它說檢查過了，還是要自己打開來看，瀏覽器重新整理一下再看。不滿意就再說一次哪裡要改，例如「標籤不要壓在線上」。`],
  [Eli5Rewrite, `60:00–64:00。接著用 eli5，貼上 prompts.md 練習 2-3 的提示詞：
請使用 eli5 skill，把 人物/劉備.md 用國中生聽得懂的方式重新說一次，存成 整理/劉備-國中生版.md。只用卡片裡有的內容，不要加新的事實；保留 [[連結]]。不要修改原本的卡片。新檔不要加 dg-publish。
最後一句是後來補的，原因在下一頁。
我們只看一段：桃園結義那段。綠底是保留下來的事實：隔天、張飛莊後的桃園、[[桃園結義]] 這個連結、劉備是大哥。橘底是要換成白話的說法：越談越投合、立誓、誓畢。
按一下：右邊是 eli5 的實際產出。綠底的事實都還在，隔天變成第二天；橘底的變成越聊越合得來、立下誓言、結義後。
最後一下：事實沒變，只是說法變白了。其他段落請大家打開兩張卡自己對照，例如販屨織蓆變成賣鞋子和編織蓆子、匙箸變成湯匙和筷子。`],
  [DgPublishCopied, `64:00–66:00。實測時發現一件事。原卡最上面有 dg-publish: true，這是第四堂發布用的開關。eli5 改寫時，把這一行也照抄過去了。
按一下：第四堂發布時，兩張劉備卡都會公開，網站上會出現兩個劉備。
按一下：不想公開國中生版，就刪掉 dg-publish 那一行（改成 dg-publish: false，或在 Obsidian 的屬性欄取消勾選也可以）。下次請它改寫時，提示詞最後多加一句：「新檔不要加 dg-publish」，就不會帶著公開設定跑出來。
最後一下：發布前，先看最上面的 frontmatter。`],
  [VerifyOutputs, `66:00–70:00。最後核對幻覺：Skill 改寫時，有沒有偷偷多加卡片沒寫的事。eli5 本來就會這樣做。它的 SKILL.md 寫著 Use an analogy，要它打比方；還說 80% 的準確度也可以接受。這跟我們「不要加新的事實」的要求衝突。
畫面上是講師 2026-10-24 實跑的 eli5 改寫版，挑了三句。先不要翻，大家猜：哪一句在 人物/劉備.md 找不到？
按一下：「靠賣鞋和織草蓆生活」，原卡是「靠販屨織蓆過日子」，只是換成白話，打勾。
按一下：「從此三人一起行動」，原卡這裡寫的是「從此他成了關、張的大哥」，沒寫一起行動。〈桃園結義〉卡有寫三兄弟一起起兵，但這次只給它劉備卡，這句是它自己補的。下一步：把這句貼回去問它「原卡哪一句寫的？」，它找不到，就刪掉或請它改。
按一下：「手上的匙箸都掉到了地上」，原卡是「嚇得劉備手上的匙箸都掉到地上」，打勾。
最後一下：原卡找不到的句子，就刪掉或請它改。現在換你們自己的國中生版：一句一句看，特別注意「就像……」的比喻、「從此……」「所以……」的延伸。你的版本可能一句都沒多，也可能多好幾句，每個人不一樣。找到可疑的一句，用 prompts.md 練習 2-4 的問法追問。一句都沒找到的人，改挑關係圖上一條線，打開標籤寫的那張卡找依據。`],
  [Section4, `70:00–70:15。第四章：擴充筆記庫。第五章要排時間軸，現在只有三張關係卡，太少了；先照原文多寫幾張。`],
  [CardTemplate, `70:15–72:30。新卡都套同一個模板，筆記庫裡已經有：模板/關係卡模板.md，練習時請 Codex 照它寫。
按一下：回目，第幾回，時間軸就靠它排。
按一下：年份，原文有寫才填，沒寫就留空。例如第 1 回原文寫了「中平元年」，所以〈桃園結義〉填了年份；實測新增的三張卡，原文都沒寫年份，就是空的。
按一下：出處，寫是哪一回的原文檔。參與人物那一行也要看：有卡的人名寫成 [[劉備]] 這樣的連結，沒卡的寫純文字，這樣才不會冒出一堆空的連結。模板裡的 [[劉備]] 外面包了反引號（\`），是為了讓模板本身不算一個連結，不會在 Obsidian 裡多出反向連結。
最後一下：每張新卡都照這個格式寫。回目和年份放在最上面的 frontmatter，Obsidian 會顯示成屬性欄位。`],
  [RagAgain, `72:30–74:30。新增卡片，用的是 RAG 的做法：先找原文，再照著寫。像開書考，書上沒有就不寫。R，先找原文，例如第 5 回寫「這三個圍住呂布，轉燈兒般廝殺」。
按一下，A：Codex 帶著這段原文、卡片模板和你的要求一起寫。
按一下，G：寫成新卡，最後附上出處。
按一下：原文沒寫的事就不寫；年份也一樣，不要讓它自己換算西元年。
最後一下：每句都要指得出原文在哪。`],
  [EnrichPractice, `74:30–81:00。練習 3，三張卡都要做，第五章的時間軸會用到。筆記庫裡已經準備好原文：原文/ 有第 1 到 21 回全文和第 37、38、46 回節選；模板也在 模板/關係卡模板.md。直接貼上 prompts.md 練習 3-1：
只根據 原文/第005回.txt、原文/第019回.txt、原文/第046回節選.txt，新增三張關係卡：關係/三英戰呂布.md、關係/白門樓.md、關係/草船借箭.md。照 模板/關係卡模板.md 寫：frontmatter 填 回目、年份，年份原文有寫才填，沒寫就留空；最後一行寫「出處：原文/檔名」。人名有卡的才加 [[ ]]。原文找不到的事不要寫；舊卡不改，新卡不加 dg-publish。
按一下：講師 10-17 實測時，它先列出要怎麼做，然後停下來問：「請回覆「可以」，我就開始寫入。」我們沒要求，它也會先問。先看它的計畫對不對，再回答。也可能不問就直接寫，10-24 重跑那次就直接寫好了。
按一下：回「可以」，它寫好三張卡：年份都留空，沒加 dg-publish，舊卡沒動。
按一下：這是實際寫出來的三英戰呂布，回目 5、年份空白，最後一行是出處。回目要是數字；講師另一次重跑寫成「第五回」，遇到就自己改成 5。
按一下：注意參與人物那行：劉備、關羽、張飛有卡，所以加了連結；呂布沒有卡，就寫純文字，照我們的規則做了。
舊的三張關係卡已經有回目了。如果你用的是更早下載的筆記庫，舊卡沒有回目，prompts.md 練習 3-1 下面有補回目的提示詞，實測可行。真的跑不出來的同學，examples/aw-03-lab/範例/關係/ 有講師跑好的三張卡，把三個檔案拖進筆記庫的 關係/。想加官渡之戰的同學，要先下載第 30 回原文：https://zh.wikisource.org/wiki/三國演義/第030回`],
  [YearCheck, `81:00–85:00。剛剛的卡，年份照規則應該是空的。可是這三件事，Codex 很可能「知道」年份：白門樓在很多資料裡寫成建安三年，三英戰呂布常放在初平元年。它要是憑記憶填進去，就是幻覺：原文沒有，它卻寫了。
按一下：講師在三份原文裡搜過：第 5 回搜「初平」、第 19 回和第 46 回節選搜「建安」，都是 0 筆。所以照規則，年份留空才對。
按一下：打開你的三張卡看年份。空白，就對了。有填，就在 Finder（Windows 是檔案總管）雙擊那一回的 .txt，會用「文字編輯」或記事本打開，按 Cmd+F 或 Ctrl+F，搜它填的年號。搜不到，就把年份刪掉。講師 10-24 重跑，三張都留空；你們的不一定。
最後一下：年份之外，每人再挑一句，用 prompts.md 練習 3-2 的提示詞，請它在白門樓每一句後面附上原句。挑一句它附的原句，複製下來，到 原文/第019回.txt 裡搜。搜得到打勾；搜不到，就請它改那一句或刪掉。原句是複製貼上的，不用自己打古文。`],
  [Section5, `85:00–85:15。第五章：寫自己的 Skill。把排時間軸的做法寫成 SKILL.md，以後一句話就能重排。`],
  [TimelineGoal, `85:15–87:00。先想清楚這個 Skill 要做什麼：按小說回目排一張事件表。名字叫時間軸，但回目是小說的章回順序，大致跟著故事走，不是精確的年代；年份只是多一個欄位，卡片有寫才填。像整理相簿，把照片照順序排好。左邊是筆記庫裡的關係卡，回目順序是亂的。
按一下：依回目由小到大排好。
按一下：寫成一頁 整理/時間軸.md，內容是一段 HTML，第四堂可以直接放上網站。
最後一下：讀欄位、排順序、寫成一頁，就是這個 Skill 的三個步驟。`],
  [SkillSkeleton, `87:00–90:00。這是講師給的骨架。完整內容如下；下一頁請 Codex 照抄建檔，不用自己複製存檔：
${SKELETON}
按一下：description 寫何時用，把同學可能會說的話寫進去，例如「三國時間軸」「排時間軸」。
按一下：步驟三步：讀、排、寫，可以照自己的話改，但不要少步驟。
按一下：輸出格式最重要的一條：HTML 裡的人名用純文字，不加 [[ ]]，原因等跑完看結果再講。
name 只能用小寫英文、數字和連字號，所以叫 sanguo-timeline，資料夾也要叫這個名字。這份骨架講師原封不動實測過，能跑出時間軸。`],
  [HtmlLinkTest, `100:00–102:00。剛剛的事件表，人名都是純文字，沒有 [[ ]]。為什麼要這樣規定？講師用自己網站的 Digital Garden 模板在本機建置測試，這是畫面。
按一下：HTML 區塊裡的 [[劉備]]、[[關羽]]、[[張飛]]，原封不動顯示成文字，沒有變成連結。
按一下：HTML、style、script 都能正常顯示和執行，所以時間軸用 HTML 沒問題。
最後一下：所以人名用純文字。真的想要點得到，<a href> 裡要放網站上的網址；直接連 ../關係/*.md 這種筆記庫裡的路徑，放上網站會 404，等一下就會看到。
另外，獨立的 .html 檔不會被 Obsidian 外掛上傳，要放進網站 repo 的 extra/ 資料夾再用 iframe 嵌入，所以我們把 HTML 直接寫在筆記裡。這次測試還沒透過 Obsidian 外掛實際發布到線上，第四堂會實際驗證。`],
  [SaveSkill, `90:00–92:00。一張圖三步。第一步，貼給 Codex：prompts.md 練習 4-1，提示詞後面已經附上整份骨架，整段複製貼上。
為什麼不自己存檔？Skill 要放在筆記庫的 .agents/skills/ 裡。.agents 開頭有一個點，是隱藏資料夾：Mac 的 Finder 不讓你建點開頭的資料夾，Obsidian 也看不到它。交給 Codex 建，最不容易出錯。
按一下：第二步，它會建出 三國人物知識庫/.agents/skills/sanguo-timeline/SKILL.md。資料夾名稱要和 SKILL.md 裡的 name 一樣，都叫 sanguo-timeline。講師 10-24 實測，Codex 照抄建好了，只在最後一行多加了一個句號，不影響。
按一下：第三步，重開後確認：在 Codex 裡打 /quit，再打 codex，問「列出你現在可以使用的 skills…」，清單裡看到 sanguo-timeline 就對了。沒看到，先輸入 /status，確認 Directory 的結尾是三國人物知識庫。另外也可以放在個人的 ~/.agents/skills/，所有專案都能用，eli5 就裝在那裡；今天用筆記庫的位置。
最後一下：放好後重開 Codex，它才看得到。`],
  [RunTimeline, `92:00–95:00。練習 4 共 20 分鐘，先跑第一次。步驟：Codex 剛建好 SKILL.md；輸入 /quit，再打 codex 重開；貼上 prompts.md 練習 4-2：「請使用 sanguo-timeline skill，排出三國時間軸。」；寫檔前如果問 Yes，看過再按；最後在 Obsidian 打開 整理/時間軸.md。
按一下：這是講師實測的紀錄。Codex 說「我會使用 sanguo-timeline skill」，接著用 sed 讀進我們寫的 SKILL.md，這次讀的是筆記庫裡的 .agents/skills；最後回報「依回目由小到大排列，共 6 張關係卡」。你第二堂自己寫過關係卡的話，會多幾列，正常。
提醒：講師第一次是在補卡之前跑的，只排出 3 列；所以練習 3 要先做完。`],
  [TimelineResult, `95:00–100:00。這是講師 10-17 第一次跑出的 整理/時間軸.md，放到講師網站模板上的樣子：一張按小說回目排的事件表。全班先一起看這一份，等一下再看自己的。
按一下：6 列，第 1、5、19、21、46、49 回，照小說的順序，不是精確年代。
按一下：人名都是純文字，HTML 裡沒有 [[ ]]，照規則做了；呂布、陳宮、孔明這些沒有卡的人也列出來，因為卡片的參與人物有寫。為什麼要純文字，下一頁講。
按一下：再看黃框的年份欄，六列都寫「未標註」。回頭看 SKILL.md：它只說每一列要有年份，沒說卡片沒寫年份時要填什麼，所以 Codex 自己決定寫「未標註」。這不是它不聽話，是說明書沒寫清楚。表格下面的來源卡也有一樣的問題，等一下一起修。
當時用的是較早的卡片，〈桃園結義〉還沒有年份；你們的筆記庫裡已經填了中平元年，第一列可能直接顯示中平元年。`],
  [EditLoop, `102:00–104:00。結果不滿意怎麼辦？像改食譜：菜不好吃，就改食譜，不用每次站在廚師旁邊重新口述。
第一步執行。按一下：第二步看結果。
按一下：第三步改 SKILL.md。
按一下：第四步再跑一次，回到第一步。
按一下：中間這個劃掉的，是我們不做的事：重打一長串提示詞。
最後一下：改一次說明書，之後每次都照新的做。下一頁就是講師實際跑出來的兩個問題，我們照這個循環修。`],
  [EditExample, `104:00–106:00。說明書沒寫清楚，就補一條規則。左邊是講師 10-17 第一次跑出的兩個問題。第一，卡片沒寫年份的那幾列，年份欄寫成「未標註」，因為 SKILL.md 沒說沒有年份要寫什麼。第二，來源卡做成 <a href="../關係/桃園結義.md"> 這種連結，SKILL.md 也沒說要不要連結；放上網站會變成 …/關係/桃園結義.md，點下去是 404。這是講師在網站模板本機建置時點過的，今天在 Obsidian 裡看不出來。
按一下：第一個的修法：在 SKILL.md 的輸出格式加一行「年份照卡片抄，卡片沒寫就留空白，不要寫「未標註」或「—」」，重開、再跑一次，年份欄變成空白。
按一下：第二個：加一行「來源卡只寫檔名純文字，不做連結，不用 <a href>，也不用 [[ ]]」，再跑一次，來源卡變成「桃園結義.md」這樣的純文字。
這兩行不用自己打開隱藏資料夾改：貼 prompts.md 練習 4-3，請 Codex 加進 SKILL.md。
同一份骨架，每次錯法不一樣：講師 10-24 重跑，年份欄變成「—」，來源卡變成 [[關係/桃園結義]]。所以規則裡把「—」和 [[ ]] 也寫進去了。右邊兩格是 10-24 加了這兩行之後重跑的實際輸出，四個字串都搜不到。
按一下：現在看你們自己的時間軸。在 Obsidian 打開 整理/時間軸.md，按 Cmd+F 或 Ctrl+F，分別搜「未標註」「—」「<a href」「[[」。搜得到哪一個，就是說明書沒寫清楚的地方：貼練習 4-3 補規則，/quit、重開、再跑一次，再搜一次。
最後一下：四個都搜不到的同學，一樣有事做：挑一個你不滿意的地方，例如欄位順序、表格標題、想多一欄出處，寫成一句規則，用同樣的方式請 Codex 加進輸出格式，再跑一次。規則寫進 SKILL.md，下次自動照做。`],
  [PersonFilter, `106:00–112:00。做完的人挑戰進階選做：只排出劉備的事件。貼 prompts.md 練習 4-4，請 Codex 在 SKILL.md 的步驟加第 4 步：「使用者指定人物時，只留下參與人物有他的事件」。下面是加這一步之前的六件事。
按一下：/quit、重開 Codex 後輸入：「請使用 sanguo-timeline skill，只排劉備的事件，存成 整理/時間軸-劉備.md」。
按一下：這是講師實測的結果，2026-10-18 和 10-24 各跑一次，都是第 1、5、19、21、49 回，五件事。草船借箭被拿掉了，因為它的參與人物是周瑜、諸葛亮、魯肅、[[曹操]]，沒有劉備。
按一下：10-24 那次，只有第 1 回有年份（中平元年），來源卡是純文字，前一頁加的兩條規則照樣有效。核對方法一樣：打開每張卡看「參與人物」那一行。
最後 2 分鐘，請一兩位同學分享自己改了 SKILL.md 哪一行。`],
  [Recap, `112:00–116:00。回顧五件事。一、Skill 是交給 Agent 的做事說明，description 決定什麼時候用。二、有 plugin.json 的用 codex plugin 裝，一般 Skill 用 npx skills add。三、用 Skill 做出來的圖和改寫，都要回卡片核對；發布前看 frontmatter。四、照原文補卡就是 RAG，找不到就不寫。五、結果不滿意，改 SKILL.md 再跑。
按一下：下一堂把筆記庫發布成網站。`],
  [NextLesson, `116:00–120:00。第四堂：把筆記庫發布成網站。筆記庫推到 GitHub，Vercel 自動建置，最後得到一個網址；今天做的 時間軸.md 也會放上去。
按一下：課前請先註冊 GitHub（https://github.com/signup）和 Vercel（https://vercel.com/signup），Vercel 可以直接用 GitHub 帳號登入。現場註冊常卡在 email 驗證，請一定先做。今天寫的 SKILL.md 留著，第四堂還會用到。`],
  [ReferencesSkills, `（課後自讀，上課不講。）
第 1 章講 Skill、AGENTS.md、MCP 時用到的文件。
Agent Skills：
- Anthropic 2025, Equipping Agents for the Real World with Agent Skills（Skill 的設計、progressive disclosure、怎麼開發與評估）. https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills
- Agent Skills 規格（name、description 的寫法，scripts、references、assets 資料夾）：https://agentskills.io/specification ；入門說明：https://agentskills.io/what-are-skills
- Codex Skills 文件（先看 name 和 description，用到才讀全文；.agents/skills 的位置；點名 $skill）：https://developers.openai.com/codex/skills
- Codex Plugins 文件（外掛、marketplace）：https://developers.openai.com/codex/plugins ；自己做外掛（.codex-plugin/plugin.json）：https://developers.openai.com/plugins/build/plugins
AGENTS.md、MCP：
- Codex 文件：AGENTS.md. https://developers.openai.com/codex/guides/agents-md
- AGENTS.md 格式說明：https://agents.md
- Anthropic 2024, Introducing the Model Context Protocol. https://www.anthropic.com/news/model-context-protocol
- MCP 官方文件：https://modelcontextprotocol.io ；Codex 接 MCP：https://developers.openai.com/codex/mcp`],
  [ReferencesTools, `（課後自讀，上課不講。）
今天裝的 Skill：
- diagram-design（Cathryn Lavery）：https://github.com/cathrynlavery/diagram-design
- eli5（DreambigOu）：https://github.com/dreambigou/eli5 ；skills.sh 頁面與安全評估：https://skills.sh/dreambigou/eli5
- skills 安裝工具（npx skills add，Vercel Labs）：https://github.com/vercel-labs/skills ；Skill 目錄：https://skills.sh
RAG、原文、發布：
- Lewis et al. 2020, Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks（RAG 這個名字的出處；照原文補卡就是這個做法）. https://arxiv.org/abs/2005.11401
- 《三國演義》原文（維基文庫）：https://zh.wikisource.org/wiki/三國演義 ；練習 3 用的回目：https://zh.wikisource.org/wiki/三國演義/第005回 、https://zh.wikisource.org/wiki/三國演義/第019回 、https://zh.wikisource.org/wiki/三國演義/第046回
- Obsidian Properties（frontmatter 屬性）：https://help.obsidian.md/properties
- Digital Garden 文件（dg-publish）：https://docs.forestry.md/getting-started/01-getting-started/ ；外掛原始碼：https://github.com/oleeskild/obsidian-digital-garden
- 第四堂要用：GitHub 建立帳號 https://docs.github.com/en/get-started/start-your-journey/creating-an-account-on-github 、Vercel 入門 https://vercel.com/docs/getting-started-with-vercel`],
]);

export const notes: (string | undefined)[] = deck.map(page => NOTES.get(page));

export default deck satisfies Page[];
