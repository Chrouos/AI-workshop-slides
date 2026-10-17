import type { DesignSystem, Page, SlideMeta, SlideTransition } from '@open-slide/core';
import { Step, Steps, useIsActivePage, useSlidePageNumber } from '@open-slide/core';
import type { CSSProperties, ReactNode } from 'react';
import wrongSum from './assets/llm-hallucination-calculation.png';
import webSearch from './assets/thinking-web-search.png';
import codexStatus from './assets/codex-cli-status.png';
import labQr from './assets/lab-zip-qr.svg';

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
const FONT_LINK_ID = 'osd-webfont-ai-basics-01a';
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
.aib-deck [data-osd-step] > * { transition: transform ${STEP_MS}ms ${EASE_OUT}; }
.aib-deck [data-osd-step="pending"] > * { transform: translateY(8px); }
.aib-deck .aib-build { transition-property: opacity, transform; transition-duration: ${BUILD_MS}ms; transition-timing-function: ${EASE_OUT}; }
.aib-deck [data-osd-step="pending"] .aib-build { opacity: 0; transform: translateY(10px); }
.aib-deck .aib-bar { transform-origin: left center; transition: transform ${BAR_MS}ms ${EASE_OUT}; }
.aib-deck [data-osd-step="pending"] .aib-bar { transform: scaleX(0); }
.aib-deck .aib-stepdraw { stroke-dasharray: 1; stroke-dashoffset: 0; transition: stroke-dashoffset ${DRAW_MS}ms ${EASE_OUT}; }
.aib-deck [data-osd-step="pending"] .aib-stepdraw { stroke-dashoffset: 1; }
@keyframes aib-fill { from { transform: scaleX(0); } to { transform: scaleX(1); } }
.aib-deck .aib-fill { transform-origin: left center; animation: aib-fill ${FILL_MS}ms ${EASE_OUT} 160ms both; }
@keyframes aib-in { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: none; } }
.aib-deck .aib-in { animation: aib-in ${ENTER_MS}ms ${EASE_OUT} both; }
@keyframes aib-draw { from { stroke-dashoffset: 1; } to { stroke-dashoffset: 0; } }
.aib-deck .aib-draw { stroke-dasharray: 1; animation: aib-draw ${DRAW_MS}ms ${EASE_OUT} both; }
@keyframes aib-pop { from { opacity: 0; transform: scale(0.75); } to { opacity: 1; transform: scale(1); } }
.aib-deck .aib-pop { transform-box: fill-box; transform-origin: center; animation: aib-pop 300ms ${EASE_OUT} both; }
@keyframes aib-in-fade { from { opacity: 0; } to { opacity: 1; } }
@media (prefers-reduced-motion: reduce) {
  .aib-deck .aib-in, .aib-deck .aib-pop { animation: aib-in-fade 150ms ease both; }
  .aib-deck .aib-draw { animation: none; stroke-dasharray: none; }
  .aib-deck .aib-stepdraw, .aib-deck [data-osd-step="pending"] .aib-stepdraw { transition: none; stroke-dasharray: none; stroke-dashoffset: 0; }
  .aib-deck [data-osd-step] > *, .aib-deck [data-osd-step="pending"] > * { transform: none; transition: none; }
  .aib-deck .aib-build { transition: opacity 150ms ease; transition-delay: 0s !important; }
  .aib-deck [data-osd-step="pending"] .aib-build { transform: none; }
  .aib-deck .aib-bar, .aib-deck [data-osd-step="pending"] .aib-bar { transform: none; transition: none; }
  .aib-deck .aib-fill { animation: none; }
}
`;
const MOTION_STYLE_ID = 'osd-motion-ai-basics-01a';
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
  return <div className={live ? 'aib-in' : undefined} style={live ? { ...style, animationDelay: enterDelay(i) } : style}>{children}</div>;
};

// The same, for a group inside an SVG picture.
const InG = ({ i, children }: { i: number; children: ReactNode }) => {
  const live = useIsActivePage();
  return <g className={live ? 'aib-in' : undefined} style={live ? { animationDelay: enterDelay(i) } : undefined}>{children}</g>;
};

// A mark (tick, cross, badge) that pops in after the thing it marks has landed.
const PopG = ({ i, children }: { i: number; children: ReactNode }) => {
  const live = useIsActivePage();
  return <g className={live ? 'aib-pop' : undefined} style={live ? { animationDelay: enterDelay(i) } : undefined}>{children}</g>;
};

// A solid connecting line that draws itself on when the page arrives.
const DrawPath = ({ i, d }: { i: number; d: string }) => {
  const live = useIsActivePage();
  return <path d={d} pathLength={1} className={live ? 'aib-draw' : undefined} style={live ? { animationDelay: enterDelay(i) } : undefined} />;
};

// A solid line inside a <Step>: it draws itself when that step is revealed.
const StepPath = ({ d, i = 0 }: { d: string; i?: number }) => (
  <path d={d} pathLength={1} className="aib-stepdraw" style={buildDelay(i, 60)} />
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
const LAB_ZIP_URL = 'https://raw.githubusercontent.com/Chrouos/AI-workshop-slides/main/slides/ai-for-teacher-learners/assets/teacher-learning-lab.zip';

// ---------- Frame ----------

const Title = ({ children }: { children: ReactNode }) => (
  <h1 style={{ fontFamily: '"Libre Baskerville", Georgia, "Times New Roman", serif', fontSize: 132, fontWeight: 400, lineHeight: 1.17, letterSpacing: '-0.035em', maxWidth: 1500, margin: 0, color: ink, whiteSpace: 'pre-line' }}>{children}</h1>
);

const Footer = () => {
  const { current, total } = useSlidePageNumber();
  return (
    <div style={{ position: 'absolute', left: 144, right: 144, bottom: 56, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #E7E5E4', paddingTop: 22, fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', fontSize: 22, fontWeight: 400, color: quiet }}>
      <span>AI 協作課｜第一篇 入門</span>
      <span>{String(current).padStart(2, '0')} / {String(total).padStart(2, '0')}</span>
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

// The four chapters of the day. Pages inside a chapter show where we are.
const CHAPTERS = ['GPT 是什麼', '用 GPT 找資料', '安裝 Codex', '用 Codex 做事'];
type Chapter = 1 | 2 | 3 | 4;

// One segment of the route bar. The current chapter is amber; on a chapter's opening
// page it fills in left to right, once, on the live page only.
const RouteSeg = ({ color, fill = false }: { color: string; fill?: boolean }) => (
  <span style={{ width: 34, height: 6, background: fill ? rule : color, display: 'block' }}>
    {fill ? <span className="aib-fill" style={{ display: 'block', width: '100%', height: '100%', background: color }} /> : null}
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
      <span style={{ marginLeft: 12, fontSize: 24, fontWeight: 600, color: amber, letterSpacing: '0.04em' }}>
        {String(chapter).padStart(2, '0')}｜{CHAPTERS[chapter - 1]}
      </span>
    </div>
  );
};

const Shell = ({ children, top = 112, chapter, enterChapter = false }: { children: ReactNode; top?: number; chapter?: Chapter; enterChapter?: boolean }) => (
  <div className="aib-deck" style={{ width: '100%', height: '100%', boxSizing: 'border-box', position: 'relative', display: 'flex', flexDirection: 'column', background: 'var(--osd-bg)', color: 'var(--osd-text)', fontFamily: 'var(--osd-font-body)', padding: `${top}px 144px 126px` }}>
    {chapter ? <RouteBar chapter={chapter} enter={enterChapter} /> : null}
    {children}
    <Footer />
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
const RegionMark = ({ x, y, w, h, n, i, badge = 'left' }: { x: number; y: number; w: number; h: number; n: number; i: number; badge?: 'left' | 'right' }) => {
  const live = useIsActivePage();
  return (
    <div className={live ? 'aib-in' : undefined} style={{ position: 'absolute', left: `${x}%`, top: `${y}%`, width: `${w}%`, height: `${h}%`, border: '4px solid #E9B650', boxSizing: 'border-box', animationDelay: live ? enterDelay(i) : undefined }}>
      <span style={{ position: 'absolute', ...(badge === 'left' ? { left: -26, top: -26 } : { right: -56, top: '50%', marginTop: -24 }), width: 48, height: 48, borderRadius: 24, background: amber, color: '#FFFFFF', display: 'grid', placeItems: 'center', fontSize: 26, fontWeight: 600, boxShadow: '0 0 0 4px #FFFFFF' }}>{n}</span>
    </div>
  );
};

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
type IconKind = 'doc' | 'chat' | 'ok' | 'save' | 'browser' | 'search' | 'think' | 'terminal' | 'folder' | 'globe' | 'down';

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

// ---------- Opening ----------

const Cover: Page = () => (
  <Shell top={174}>
    <In i={0}><Eyebrow>AI WORKSHOP 01-a｜入門</Eyebrow></In>
    <In i={1} style={{ marginTop: 62 }}><Title>{'認識 AI\n從 ChatGPT 到 Codex'}</Title></In>
    <In i={2} style={{ marginTop: 40, fontSize: 35, color: muted }}>先懂原理，再把工具裝好</In>
    <In i={3} style={{ width: 160, height: 5, background: amber, marginTop: 72 }}><span /></In>
    <div style={{ position: 'absolute', right: 144, bottom: 170 }}>
      <Figure w={720} h={200} label="對話、搜尋、在資料夾裡做事：AI 的三種用法">
        <InG i={3}><circle cx="80" cy="100" r="72" fill="#FFFFFF" stroke={rule} strokeWidth="2" /><SvgIcon kind="chat" x={80} y={100} size={70} color={muted} /></InG>
        <InG i={4}><MapArrow x1={168} x2={232} y={100} /></InG>
        <InG i={5}><circle cx="320" cy="100" r="72" fill={blueSoft} stroke={blue} strokeWidth="2" /><SvgIcon kind="search" x={320} y={100} size={70} color={blue} /></InG>
        <InG i={6}><MapArrow x1={408} x2={472} y={100} /></InG>
        <InG i={7}><circle cx="560" cy="100" r="72" fill={amberSoft} stroke={amber} strokeWidth="2" /><SvgIcon kind="terminal" x={560} y={100} size={70} color={amber} /></InG>
      </Figure>
    </div>
  </Shell>
);

const SpeakerIntro: Page = () => (
  <Shell>
    <Eyebrow>講者介紹 / ABOUT ME</Eyebrow>
    <Heading>黃懷萱</Heading>
    <Lead>AI 工程師，研究 NLP、LLM、RAG</Lead>
    <Fit>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 220px 1fr', gap: 48, alignItems: 'start' }}>
        <In i={0} style={{ textAlign: 'center' }}>
          <SmallLabel>求學</SmallLabel>
          <div style={{ fontFamily: display, fontSize: 68, lineHeight: 1.25, marginTop: 25 }}>中央大學碩士</div>
          <div style={{ fontSize: 31, color: muted, marginTop: 18 }}>NLP / LLM / RAG</div>
        </In>
        <In i={1} style={{ fontSize: 88, color: faint, textAlign: 'center', lineHeight: 1, marginTop: 60 }}>→</In>
        <In i={2} style={{ textAlign: 'center' }}>
          <SmallLabel>工作</SmallLabel>
          <div style={{ fontFamily: display, fontSize: 68, lineHeight: 1.25, marginTop: 25 }}>關貿網路</div>
          <div style={{ fontSize: 31, color: muted, marginTop: 18 }}>AI Engineer · 智慧客服</div>
          <div style={{ fontSize: 24, color: quiet, marginTop: 14 }}>已上線：EZ WAY · eHub · TTLL</div>
        </In>
      </div>
      <In i={3} style={{ display: 'flex', alignItems: 'center', gap: 26, marginTop: 72 }}>
        <span style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--osd-accent)' }} />
        <span style={{ flex: 1, borderTop: `1px solid ${rule}` }} />
        <span style={{ color: muted, fontSize: 25, letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>從研究走到產品</span>
        <span style={{ flex: 1, borderTop: `1px solid ${rule}` }} />
        <span style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--osd-accent)' }} />
      </In>
    </Fit>
  </Shell>
);

// A table-of-contents row: chapter, the thing you walk away with, time and page.
const AGENDA_COLS = '90px 1fr 560px 180px';

const AgendaRow = ({ i, n, kind, result, time, page }: { i: number; n: Chapter; kind: IconKind; result: string; time: string; page: Page }) => (
  <In i={i} style={{ display: 'grid', gridTemplateColumns: AGENDA_COLS, alignItems: 'center', minHeight: 116, borderBottom: `1px solid ${rule}` }}>
    <span style={{ fontFamily: display, fontSize: 40, color: amber }}>{String(n).padStart(2, '0')}</span>
    <span style={{ fontSize: 38, fontWeight: 600 }}>{CHAPTERS[n - 1]}</span>
    <span style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
      <Icon kind={kind} size={56} color={amber} />
      <span style={{ fontSize: 30 }}>{result}</span>
    </span>
    <span style={{ textAlign: 'right' }}><span style={{ display: 'block', fontSize: 26, color: amber }}>{time}</span><span style={{ display: 'block', fontSize: 24, color: quiet, marginTop: 4 }}>第 {pageOf(page)} 頁</span></span>
  </In>
);

const Agenda: Page = () => (
  <Shell>
    <Eyebrow>AGENDA｜約 60 分鐘，每章一個小練習</Eyebrow>
    <Heading>課程大綱</Heading>
    <Fit>
      <div style={{ display: 'grid', gridTemplateColumns: AGENDA_COLS, paddingBottom: 12, borderBottom: `1px solid ${rule}` }}>
        <span /><SmallLabel>章節</SmallLabel><SmallLabel>結束時你會</SmallLabel><span style={{ textAlign: 'right' }}><SmallLabel>時間｜頁</SmallLabel></span>
      </div>
      <AgendaRow i={0} n={1} kind="chat" result="知道 AI 為什麼會說錯" time="03–15 分" page={Section1} />
      <AgendaRow i={1} n={2} kind="search" result="拿到附來源的答案" time="15–28 分" page={Section2} />
      <AgendaRow i={2} n={3} kind="terminal" result="電腦裡有 Codex" time="28–40 分" page={Section3} />
      <AgendaRow i={3} n={4} kind="doc" result="寫好一份 AGENTS.md" time="40–58 分" page={Section4} />
    </Fit>
  </Shell>
);

// One stage of how LLM tools grew up: an icon in a circle, a name, an example, a chapter tag.
const EvoStop = ({ x, kind, label, example, chapter, tone }: { x: number; kind: IconKind; label: string; example: string; chapter: string; tone: 'plain' | 'blue' | 'amber' }) => {
  const stroke = tone === 'amber' ? amber : tone === 'blue' ? blue : faint;
  const fill = tone === 'amber' ? amberSoft : tone === 'blue' ? blueSoft : '#FFFFFF';
  return (
    <g>
      <circle cx={x} cy="100" r="84" fill={fill} stroke={stroke} strokeWidth="3" />
      <SvgIcon kind={kind} x={x} y={100} size={92} color={tone === 'plain' ? ink : stroke} />
      <text x={x} y="250" textAnchor="middle" fontSize="42" fontWeight="600" fill={ink}>{label}</text>
      <text x={x} y="302" textAnchor="middle" fontSize="29" fill={muted}>{example}</text>
      <SvgChip x={x - 90} y={330} w={180} h={46} label={chapter} size={25} fill={fill} stroke={stroke} color={stroke} />
    </g>
  );
};

const Evolution: Page = () => (
  <Shell>
    <Eyebrow>先看全貌</Eyebrow>
    <Heading>LLM 從聊天走到做事</Heading>
    <Fit>
      <Stage h={390}>
        <Steps>
          <Layer h={390} label="第一階段：文字生成，例如 ChatGPT 問答">
            <EvoStop x={204} kind="chat" label="文字生成" example="ChatGPT 問答" chapter="第 1 章" tone="plain" />
          </Layer>
          <Step duration={STEP_MS}><Layer h={390} label="第二階段：推理，例如 Thinking 模式">
            <g className="aib-build" style={buildDelay(0, 0)}><MapArrow x1={300} x2={396} y={100} /></g>
            <g className="aib-build" style={buildDelay(1, 0)}><EvoStop x={612} kind="think" label="推理" example="Thinking 模式" chapter="第 2 章" tone="blue" /></g>
          </Layer></Step>
          <Step duration={STEP_MS}><Layer h={390} label="第三階段：使用工具，例如 Web Search">
            <g className="aib-build" style={buildDelay(0, 0)}><MapArrow x1={708} x2={804} y={100} /></g>
            <g className="aib-build" style={buildDelay(1, 0)}><EvoStop x={1020} kind="search" label="使用工具" example="Web Search" chapter="第 2 章" tone="blue" /></g>
          </Layer></Step>
          <Step duration={STEP_MS}><Layer h={390} label="第四階段：執行任務，例如 Codex 讀檔、存檔">
            <g className="aib-build" style={buildDelay(0, 0)}><MapArrow x1={1116} x2={1212} y={100} hot /></g>
            <g className="aib-build" style={buildDelay(1, 0)}><EvoStop x={1428} kind="terminal" label="執行任務" example="Codex 讀檔、存檔" chapter="第 3–4 章" tone="amber" /></g>
          </Layer></Step>
        </Steps>
      </Stage>
      <Steps><Step duration={STEP_MS}><Takeaway>會做事的 AI，核心還是猜下一個字</Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

// The day's route on a chapter's opening page: four stops, this one in amber.
const TRACK_XS = [150, 594, 1038, 1482];

const TrackStop = ({ x, n, chapter }: { x: number; n: Chapter; chapter: Chapter }) => {
  const now = n === chapter;
  const done = n < chapter;
  return (
    <g>
      {now ? <PopG i={4}><circle cx={x} cy="50" r="34" fill={amber} /><text x={x} y="60" textAnchor="middle" fontSize="28" fontWeight="600" fill="#FFFFFF">{n}</text></PopG>
        : <g><circle cx={x} cy="50" r="22" fill={done ? faint : '#FFFFFF'} stroke={done ? faint : rule} strokeWidth="3" /><text x={x} y="59" textAnchor="middle" fontSize="24" fontWeight="600" fill={done ? '#FFFFFF' : quiet}>{n}</text></g>}
      <text x={x} y="130" textAnchor="middle" fontSize="30" fontWeight={now ? 600 : 400} fill={now ? amber : quiet}>{CHAPTERS[n - 1]}</text>
    </g>
  );
};

const ChapterTrack = ({ chapter }: { chapter: Chapter }) => {
  const cur = TRACK_XS[chapter - 1];
  return (
    <Figure h={170} label={`今天的四章，現在在第 ${chapter} 章：${CHAPTERS[chapter - 1]}`}>
      <line x1={TRACK_XS[0]} y1="50" x2={TRACK_XS[3]} y2="50" stroke={rule} strokeWidth="4" />
      {chapter > 1 ? <g stroke={amber} strokeWidth="5" fill="none"><DrawPath i={1} d={`M${TRACK_XS[0]} 50 H${cur}`} /></g> : null}
      <TrackStop x={TRACK_XS[0]} n={1} chapter={chapter} />
      <TrackStop x={TRACK_XS[1]} n={2} chapter={chapter} />
      <TrackStop x={TRACK_XS[2]} n={3} chapter={chapter} />
      <TrackStop x={TRACK_XS[3]} n={4} chapter={chapter} />
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

// ---------- 01 GPT 是什麼 ----------

const Section1: Page = () => <SectionPage chapter={1} label="01 / GPT" lead="它怎麼寫出一段話，又為什麼會寫錯" />;

const NextWord = ({ word, pct, top = false, order = 0 }: { word: string; pct: number; top?: boolean; order?: number }) => (
  <div style={{ display: 'grid', gridTemplateColumns: '170px 1fr 100px', alignItems: 'center', gap: 22 }}>
    <span style={{ fontSize: 36, fontWeight: top ? 600 : 400, color: top ? 'var(--osd-text)' : muted }}>{word}</span>
    <div style={{ height: 34, background: surface }}><div className="aib-bar" style={{ ...buildDelay(order), width: `${pct}%`, height: '100%', background: top ? amber : rule }} /></div>
    <span style={{ fontSize: 28, color: top ? amber : quiet, textAlign: 'right' }}>{pct}%</span>
  </div>
);

const NextToken: Page = () => (
  <Shell chapter={1}>
    <Eyebrow>GPT＝生成式預訓練模型</Eyebrow>
    <Heading>GPT 的原理是猜下一個字</Heading>
    <Lead>像文字接龍：看前文，挑最常接的字</Lead>
    <Fit>
      <div style={{ display: 'grid', gridTemplateColumns: '640px 1fr', columnGap: 96, alignItems: 'center' }}>
        <In i={0} style={{ background: surface, borderTop: `4px solid ${rule}`, padding: '40px 44px' }}>
          <SmallLabel>已經寫出的文字</SmallLabel>
          <div style={{ fontFamily: display, fontSize: 60, marginTop: 26, lineHeight: 1.3 }}>學生需要更<span style={{ display: 'inline-block', width: 140, borderBottom: `5px solid ${amber}`, marginLeft: 14 }}>&nbsp;</span></div>
        </In>
        <div>
          <Steps>
            <Step duration={STEP_MS}>
              <div style={{ display: 'grid', gap: 22 }}>
                <SmallLabel>下一個詞的機率（示意）</SmallLabel>
                <NextWord word="清楚的" pct={62} top order={0} />
                <NextWord word="及時的" pct={21} order={1} />
                <NextWord word="多的" pct={9} order={2} />
                <NextWord word="有趣的" pct={4} order={3} />
              </div>
            </Step>
          </Steps>
        </div>
      </div>
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={64}>挑的是「最常見」，不是「查證過」</Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

const Hallucination: Page = () => (
  <Shell chapter={1}>
    <Eyebrow>猜出來的字，可能是錯的</Eyebrow>
    <Heading>AI 幻覺（Hallucination）</Heading>
    <Lead>沒有根據，卻說得很肯定</Lead>
    <Fit>
      <div style={{ display: 'grid', gridTemplateColumns: '1000px 1fr', gap: 80, alignItems: 'center' }}>
        <In i={0}>
          <div style={{ border: `1px solid ${rule}`, background: '#FFFFFF', padding: 20 }}>
            <img src={wrongSum} alt="早期 ChatGPT（GPT-3.5）把一長串加法算成 8402" style={{ display: 'block', width: 958, height: 395 }} />
          </div>
          <Caption>早期模型（GPT-3.5）案例｜圖片來源：IT 邦幫忙</Caption>
        </In>
        <div>
          <Steps>
            <div><SmallLabel>AI 回答</SmallLabel><div style={{ fontSize: 100, lineHeight: 1.1, color: muted, marginTop: 8 }}>8402</div></div>
            <Step duration={STEP_MS}><div style={{ marginTop: 36 }}><SmallLabel color={amber}>自己驗算</SmallLabel><div style={{ fontSize: 100, lineHeight: 1.1, color: amber, marginTop: 8 }}>8484</div></div></Step>
          </Steps>
        </div>
      </div>
      <Steps><Step duration={STEP_MS}><Takeaway>語氣肯定，不等於答案正確</Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

// One tool, drawn as a panel: what it is, a small picture of how you use it, what it suits.
const ToolPanel = ({ kind, name, tagline, fit, tint, stroke, children }: { kind: IconKind; name: string; tagline: string; fit: string; tint: string; stroke: string; children: ReactNode }) => (
  <div style={{ background: tint, borderTop: `5px solid ${stroke}`, padding: '26px 34px 30px' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
      <Icon kind={kind} size={58} color={stroke} />
      <span style={{ fontSize: 44, fontWeight: 600 }}>{name}</span>
      <span style={{ fontSize: 30, color: muted, marginLeft: 8 }}>{tagline}</span>
    </div>
    <div style={{ marginTop: 22 }}>{children}</div>
    <div style={{ marginTop: 18, fontSize: 31 }}><SmallLabel color={stroke}>適合</SmallLabel>　{fit}</div>
  </div>
);

const ChatVsCodex: Page = () => (
  <Shell chapter={1}>
    <Eyebrow>兩個工具，兩種用法</Eyebrow>
    <Heading>ChatGPT 和 Codex 差在哪</Heading>
    <Fit>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48 }}>
        <Steps>
          <ToolPanel kind="chat" name="ChatGPT" tagline="在對話框裡聊" fit="發想、解釋、找資料" tint="#FFFFFF" stroke={faint}>
            <Figure w={722} h={250} label="你問一句，ChatGPT 回一段話">
              <rect x="330" y="14" width="380" height="64" rx="32" fill={amberSoft} />
              <text x="520" y="56" textAnchor="middle" fontSize="29" fill={ink}>RAG 是什麼？</text>
              <Bubble x={12} y={108} w={540} h={112} />
              <text x="40" y="154" fontSize="28" fill={ink}>RAG 就是先找資料，</text>
              <text x="40" y="196" fontSize="28" fill={ink}>再回答的方法……</text>
            </Figure>
          </ToolPanel>
          <Step duration={STEP_MS}>
            <ToolPanel kind="terminal" name="Codex" tagline="在你的資料夾裡做" fit="讀檔、整理、存成檔案" tint={amberSoft} stroke={amber}>
              <Figure w={722} h={250} label="你交代任務，Codex 讀資料夾裡的檔案，再存成新檔">
                <rect x="0" y="92" width="150" height="70" fill="#FFFFFF" stroke={rule} strokeWidth="2" />
                <text x="75" y="137" textAnchor="middle" fontSize="28" fill={ink}>你交代</text>
                <MapArrow x1={158} x2={206} y={127} />
                <rect x="214" y="62" width="168" height="130" fill={term} />
                <text x="298" y="138" textAnchor="middle" fontSize="30" fontFamily={mono} fill="#F5F5F4">&gt;_ Codex</text>
                <MapArrow x1={390} x2={438} y={127} hot />
                <path d="M446 40 V216 H722 V58 H566 L552 40 Z" fill="#FFFFFF" stroke={amber} strokeWidth="2" strokeLinejoin="round" />
                <DocShape x={470} y={86} w={64} h={82} />
                <DocShape x={552} y={86} w={64} h={82} />
                <DocShape x={634} y={86} w={64} h={82} fill={sage} stroke={okGreen} />
                <text x="584" y="202" textAnchor="middle" fontSize="24" fill={muted}>讀檔　　　　存檔</text>
              </Figure>
            </ToolPanel>
          </Step>
        </Steps>
      </div>
      <Steps><Step duration={STEP_MS}><Takeaway>ChatGPT 幫你想清楚，Codex 幫你做完</Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

// One stop in a practice flow: a numbered icon, then what to do.
const FlowStep = ({ i, n, kind, label, sub }: { i: number; n: number; kind: IconKind; label: string; sub?: ReactNode }) => (
  <In i={i} style={{ width: 400, textAlign: 'center', display: 'grid', justifyItems: 'center' }}>
    <div style={{ position: 'relative', width: 160, height: 160, borderRadius: 80, background: '#FFFFFF', border: `2px solid ${rule}`, display: 'grid', placeItems: 'center' }}>
      <Icon kind={kind} size={92} color={ink} />
      <span style={{ position: 'absolute', left: -6, top: -6 }}><NumDot n={n} size={52} /></span>
    </div>
    <div style={{ fontSize: 36, fontWeight: 600, marginTop: 26, lineHeight: 1.35 }}>{label}</div>
    {sub ? <div style={{ fontSize: 25, color: muted, marginTop: 10 }}>{sub}</div> : null}
  </In>
);

const FlowArrow = ({ i }: { i: number }) => <In i={i} style={{ color: faint, fontSize: 64, lineHeight: 1, marginTop: 44 }}>→</In>;

// The exact sentence learners type, shown once in a quiet box.
const PromptBox = ({ children }: { children: ReactNode }) => (
  <div style={{ background: '#FFFFFF', border: `1px solid ${rule}`, borderLeft: `6px solid ${amber}`, padding: '20px 32px', display: 'flex', alignItems: 'center', gap: 22 }}>
    <SmallLabel>你輸入</SmallLabel>
    <span style={{ fontSize: 34 }}>{children}</span>
  </div>
);

const Practice1: Page = () => (
  <Shell chapter={1}>
    <PracticeEyebrow time="5 分鐘">練習 1｜ChatGPT</PracticeEyebrow>
    <Heading>練習（幻覺）：請 ChatGPT 引用原文</Heading>
    <In i={0} style={{ marginTop: 30 }}><PromptBox>「逐字引用《三國演義》第 21 回，曹操說『天下英雄』那一句」</PromptBox></In>
    <Fit>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', gap: 28 }}>
        <FlowStep i={1} n={1} kind="chat" label="先不開搜尋，問它" />
        <FlowArrow i={2} />
        <FlowStep i={3} n={2} kind="browser" label="打開維基文庫" sub={<Path size={24}>三國演義/第021回</Path>} />
        <FlowArrow i={4} />
        <FlowStep i={5} n={3} kind="search" label="一個字一個字比" />
      </div>
      <Steps>
        <Step duration={STEP_MS}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 40, marginTop: 52 }}>
            <div style={{ background: sage, padding: '16px 30px' }}><StatusLine ok size={32}>一模一樣：有根據</StatusLine></div>
            <div style={{ background: amberSoft, padding: '16px 30px' }}><StatusLine ok={false} size={32}>對不上：這就是幻覺</StatusLine></div>
          </div>
        </Step>
      </Steps>
    </Fit>
  </Shell>
);

// ---------- 02 用 GPT 找資料 ----------

const Section2: Page = () => <SectionPage chapter={2} label="02 / 找資料" lead="新的 AI 會先想、先查，再回答" />;

const ThinkLine = ({ y, n, text }: { y: number; n: number; text: string }) => (
  <g>
    <circle cx="560" cy={y} r="22" fill={blue} />
    <text x="560" y={y + 9} textAnchor="middle" fontSize="25" fontWeight="600" fill="#FFFFFF">{n}</text>
    <text x="600" y={y + 11} fontSize="32" fill={ink}>{text}</text>
  </g>
);

const Thinking: Page = () => (
  <Shell chapter={2}>
    <Eyebrow>Thinking 模式＝推理</Eyebrow>
    <Heading>Thinking 會先拆步驟</Heading>
    <Lead>像算數學先列算式，不直接寫答案</Lead>
    <Fit>
      <Stage h={400}>
        <Steps>
          <Layer h={400} label="問題：一長串加法等於多少">
            <text x="0" y="56" fontSize="26" fontWeight="600" fill={quiet} letterSpacing="2">問題</text>
            <rect x="0" y="90" width="430" height="230" fill="#FFFFFF" stroke={rule} strokeWidth="2" />
            <text x="215" y="170" textAnchor="middle" fontSize="30" fontFamily={mono} fill={ink}>2+4+7+…</text>
            <text x="215" y="216" textAnchor="middle" fontSize="30" fontFamily={mono} fill={ink}>+7953+34+356</text>
            <text x="215" y="280" textAnchor="middle" fontSize="40" fontWeight="600" fill={amber}>＝？</text>
          </Layer>
          <Step duration={STEP_MS}><Layer h={400} label="Thinking：拆成幾小段、一段一段加、再驗算一次">
            <MapArrow x1={442} x2={500} y={205} />
            <text x="512" y="56" fontSize="26" fontWeight="600" fill={blue} letterSpacing="2">先想一下</text>
            <rect x="512" y="90" width="640" height="230" fill={blueSoft} stroke={blue} strokeWidth="2" />
            <g className="aib-build" style={buildDelay(0)}><ThinkLine y={146} n={1} text="拆成幾小段" /></g>
            <g className="aib-build" style={buildDelay(1)}><ThinkLine y={206} n={2} text="一段一段加" /></g>
            <g className="aib-build" style={buildDelay(2)}><ThinkLine y={266} n={3} text="再驗算一次" /></g>
          </Layer></Step>
          <Step duration={STEP_MS}><Layer h={400} label="回答 8484，驗算正確">
            <MapArrow x1={1164} x2={1222} y={205} hot />
            <text x="1234" y="56" fontSize="26" fontWeight="600" fill={okGreen} letterSpacing="2">回答</text>
            <rect x="1234" y="90" width="398" height="230" fill={sage} stroke={okGreen} strokeWidth="2" />
            <text x="1400" y="232" textAnchor="middle" fontSize="80" fontFamily={display} fill={ink}>8484</text>
            <g className="aib-build" style={buildDelay(1)}><OkDot x={1580} y={140} r={26} /></g>
          </Layer></Step>
        </Steps>
      </Stage>
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={24}>多想幾步，比較不會亂猜</Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

const WebSearch: Page = () => (
  <Shell chapter={2}>
    <Eyebrow>Web Search＝使用工具</Eyebrow>
    <Heading>Web Search 會先上網找資料</Heading>
    <Fit>
      <div style={{ display: 'grid', gridTemplateColumns: '1160px 1fr', gap: 56, alignItems: 'center' }}>
        <In i={0}>
          <Screenshot src={webSearch} aspect={1586 / 484} width={1160} alt="ChatGPT 回答台灣新聞前，先搜尋中央社和路透社兩個網站" caption="ChatGPT 實際畫面｜2026 年 9 月">
            <RegionMark n={1} i={2} x={7.5} y={51} w={23} h={13} />
            <RegionMark n={2} i={4} x={11.2} y={64.5} w={32.6} h={13.5} badge="right" />
          </Screenshot>
        </In>
        <div style={{ display: 'grid', gap: 40 }}>
          <Steps>
            <Callout n={1} title="先搜尋網站" detail="中央社、路透社" />
            <Step duration={STEP_MS}><Callout n={2} title="回答附上來源" detail="點得開，查得到" /></Step>
          </Steps>
        </div>
      </div>
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={64}>今天的新聞，要靠搜尋才知道</Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

const RagHead = ({ x, letter, term: word, english }: { x: number; letter: string; term: string; english: string }) => (
  <g>
    <text x={x} y="56" fontSize="62" fontFamily={display} fill={amber}>{letter}</text>
    <text x={x + 56} y="52" fontSize="36" fontWeight="600" fill={ink}>{word}</text>
    <text x={x + 140} y="52" fontSize="23" fill={quiet}>{english}</text>
  </g>
);

// One place the AI can look things up, inside the Retrieval panel.
const SourceChip = ({ y, kind, label }: { y: number; kind: IconKind; label: string }) => (
  <g>
    <rect x="24" y={y} width="230" height="54" fill="#FFFFFF" stroke={rule} strokeWidth="2" />
    <SvgIcon kind={kind} x={52} y={y + 27} size={32} color={muted} />
    <text x="80" y={y + 37} fontSize="26" fill={ink}>{label}</text>
  </g>
);

const RagSteps: Page = () => (
  <Shell chapter={2}>
    <Eyebrow>RAG＝檢索增強生成</Eyebrow>
    <Heading>RAG：先找資料，再回答</Heading>
    <Lead>像開書考：先翻到那一頁，再作答</Lead>
    <Fit>
      <Stage h={450}>
        <Steps>
          <Layer h={450} label="R 檢索：從網路、上傳的檔案或資料夾，找出〈桃園結義〉">
            <InG i={0}><RagHead x={0} letter="R" term="檢索" english="Retrieval" /></InG>
            <InG i={1}>
              <rect x="0" y="86" width="500" height="320" fill={surface} />
              <rect x="24" y="104" width="452" height="56" rx="28" fill="#FFFFFF" stroke={ink} strokeWidth="2" />
              <text x="250" y="142" textAnchor="middle" fontSize="27" fill={ink}>桃園結義有哪些人？</text>
            </InG>
            <InG i={2}>
              <SourceChip y={180} kind="globe" label="網路" />
              <SourceChip y={250} kind="doc" label="上傳的檔案" />
              <SourceChip y={320} kind="folder" label="你的資料夾" />
            </InG>
            <InG i={3}><MapArrow x1={262} x2={300} y={280} hot /></InG>
            <PopG i={5}>
              <DocShape x={308} y={196} w={170} h={170} fill={amberSoft} stroke={amber} sw={3} />
              <text x="393" y="272" textAnchor="middle" fontSize="28" fontWeight="600" fill={ink}>桃園結義</text>
              <text x="393" y="314" textAnchor="middle" fontSize="23" fill={muted}>第 1 回</text>
            </PopG>
            <InG i={6}><text x="250" y="444" textAnchor="middle" fontSize="26" fill={muted}>找出相關的那一段</text></InG>
          </Layer>
          <Step duration={STEP_MS}><Layer h={450} label="A 增強：把問題和找到的資料一起交給 AI">
            <MapArrow x1={512} x2={560} y={246} hot />
            <RagHead x={566} letter="A" term="增強" english="Augmented" />
            <rect x="566" y="86" width="500" height="320" fill={blueSoft} />
            <g className="aib-build" style={buildDelay(0)}>
              <rect x="596" y="106" width="440" height="150" fill="#FFFFFF" stroke={blue} strokeWidth="2" strokeDasharray="10 8" />
              <text x="616" y="142" fontSize="24" fill={blue}>一起交出去</text>
              <SvgChip x={616} y={160} w={400} label="問題：桃園結義有哪些人？" size={23} />
              <SvgChip x={616} y={204} w={400} label="資料：〈桃園結義〉第 1 回" fill={amberSoft} stroke={amber} size={23} />
            </g>
            <g className="aib-build" style={buildDelay(1)}>
              <DownArrowSvg x={816} y1={262} y2={296} color={blue} />
              <rect x="736" y="300" width="160" height="58" fill={blue} />
              <text x="816" y="339" textAnchor="middle" fontSize="30" fontWeight="600" fill="#FFFFFF">AI</text>
              <text x="816" y="444" textAnchor="middle" fontSize="26" fill={muted}>題目多了依據</text>
            </g>
          </Layer></Step>
          <Step duration={STEP_MS}><Layer h={450} label="G 生成：AI 回答劉備、關羽、張飛，並附上來源">
            <MapArrow x1={1078} x2={1126} y={246} hot />
            <RagHead x={1132} letter="G" term="生成" english="Generation" />
            <rect x="1132" y="86" width="500" height="320" fill={sage} />
            <g className="aib-build" style={buildDelay(0)}>
              <Bubble x={1160} y={110} w={444} h={120} />
              <text x="1186" y="160" fontSize="31" fontWeight="600" fill={ink}>劉備、關羽、張飛</text>
              <text x="1186" y="204" fontSize="24" fill={muted}>照資料回答，不靠印象</text>
            </g>
            <g className="aib-build" style={buildDelay(1)}>
              <text x="1160" y="300" fontSize="24" fill={okGreen} fontWeight="600">來源</text>
              <SvgChip x={1222} y={272} w={382} label="〈桃園結義〉第 1 回" fill="#FFFFFF" stroke={okGreen} />
              <text x="1382" y="444" textAnchor="middle" fontSize="26" fill={muted}>回答附上出處</text>
            </g>
          </Layer></Step>
        </Steps>
      </Stage>
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={36}>Web Search 也是 RAG，資料從網路來</Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

// One answer to the same question, with or without search.
const AnswerCard = ({ title, tone, quote, children }: { title: string; tone: 'plain' | 'ok'; quote: string; children: ReactNode }) => (
  <div style={{ background: tone === 'ok' ? sage : surface, borderTop: `5px solid ${tone === 'ok' ? okGreen : faint}`, padding: '24px 34px 28px', height: '100%', boxSizing: 'border-box' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <Icon kind={tone === 'ok' ? 'search' : 'chat'} size={48} color={tone === 'ok' ? okGreen : muted} />
      <span style={{ fontSize: 36, fontWeight: 600 }}>{title}</span>
    </div>
    <div style={{ marginTop: 22, background: '#FFFFFF', border: `1px solid ${rule}`, padding: '20px 26px', fontSize: 32, lineHeight: 1.5 }}>{quote}</div>
    <div style={{ marginTop: 22 }}>{children}</div>
  </div>
);

const Practice2: Page = () => (
  <Shell chapter={2}>
    <PracticeEyebrow time="5 分鐘">練習 2｜ChatGPT</PracticeEyebrow>
    <Heading>練習（RAG）：開搜尋，再問一次</Heading>
    <PillRow>
      <Pill tag="定位">第 21 回原文</Pill>
      <Pill tag="期望輸出">原句＋來源連結</Pill>
      <Pill tag="限制">找不到就說</Pill>
    </PillRow>
    <Fit>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48 }}>
        <Steps>
          <AnswerCard title="練習 1：沒開搜尋" tone="plain" quote="「……」一句原文">
            <StatusLine ok={false}>沒有來源，只能自己找</StatusLine>
          </AnswerCard>
          <Step duration={STEP_MS}>
            <AnswerCard title="這次：開搜尋" tone="ok" quote="「……」一句原文">
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: '#FFFFFF', border: `2px solid ${okGreen}`, padding: '6px 16px', fontFamily: mono, fontSize: 25 }}><Icon kind="globe" size={30} color={okGreen} />zh.wikisource.org</span>
                <StatusLine ok>點開比對</StatusLine>
              </div>
            </AnswerCard>
          </Step>
        </Steps>
      </div>
      <Steps><Step duration={STEP_MS}><Takeaway>有來源連結，才查得回去</Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

// ---------- 03 安裝 Codex ----------

const Section3: Page = () => <SectionPage chapter={3} label="03 / 安裝" lead="讓 AI 進到你電腦裡的資料夾" />;

// One install step: what to do, and what to type (or what you should see).
const InstallStep = ({ n, title, lines, note }: { n: number; title: string; lines: string; note?: string }) => (
  <div style={{ background: '#FFFFFF', border: `1px solid ${rule}`, padding: '24px 28px', display: 'grid', alignContent: 'start', gap: 16, height: '100%', boxSizing: 'border-box' }}>
    <NumLine n={n} size={34}><strong>{title}</strong></NumLine>
    <div style={{ background: term, color: '#F5F5F4', fontFamily: mono, fontSize: 30, lineHeight: 1.5, padding: '16px 24px', whiteSpace: 'pre' }}>{lines}</div>
    {note ? <div style={{ fontSize: 25, color: muted }}>{note}</div> : null}
  </div>
);

const Install: Page = () => (
  <Shell chapter={3}>
    <Eyebrow>Mac：終端機｜Windows：PowerShell</Eyebrow>
    <Heading>安裝 Codex 的四個步驟</Heading>
    <Fit>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28 }}>
        <Steps>
          <InstallStep n={1} title="下載 Node.js LTS" lines={'nodejs.org → LTS → 預設安裝'} />
          <Step duration={STEP_MS}><InstallStep n={2} title="重開終端機，看版本號" lines={'$ node -v   v24.21.0\n$ npm -v    11.6.2'} /></Step>
          <Step duration={STEP_MS}><InstallStep n={3} title="安裝 Codex" lines={'$ npm install -g @openai/codex@latest'} note="出現「找不到指令」：先重開終端機" /></Step>
          <Step duration={STEP_MS}><InstallStep n={4} title="啟動、登入" lines={'$ codex\n› Sign in with ChatGPT'} note="Plus、Pro、Business、Enterprise 方案含 Codex" /></Step>
        </Steps>
      </div>
    </Fit>
  </Shell>
);

// One first-run screen of Codex: when it shows up, what it says, what to pick. Text from Codex 0.154.
const FirstRunCard = ({ when, screen, pick }: { when: string; screen: string; pick: string }) => (
  <div style={{ background: '#FFFFFF', border: `1px solid ${rule}`, height: '100%', boxSizing: 'border-box', padding: '26px 26px 30px' }}>
    <div style={{ fontSize: 32, fontWeight: 600, color: 'var(--osd-accent)' }}>{when}</div>
    <div style={{ marginTop: 18, background: term, color: '#F5F5F4', padding: '26px 26px', fontFamily: mono, fontSize: 32, lineHeight: 1.45, minHeight: 250, boxSizing: 'border-box' }}>{screen}</div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 24, background: sage, border: `2px solid ${okGreen}`, padding: '14px 18px' }}><Icon kind="ok" size={44} color={okGreen} /><span style={{ fontFamily: mono, fontSize: 30, fontWeight: 700 }}>{pick}</span></div>
  </div>
);

const FirstRun: Page = () => (
  <Shell chapter={3}>
    <Eyebrow>第一次啟動｜畫面為示意</Eyebrow>
    <Heading>第一次開 Codex 的三個畫面</Heading>
    <Fit>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32, alignItems: 'stretch' }}>
        <Steps>
          <FirstRunCard when="1｜登入" screen="Choose how you want to use Codex." pick="Sign in with ChatGPT" />
          <Step duration={STEP_MS}><FirstRunCard when="2｜信任資料夾" screen="Do you trust the contents of this directory?" pick="Yes, continue" /></Step>
          <Step duration={STEP_MS}><FirstRunCard when="3｜寫檔前" screen="Would you like to make the following edits?" pick="Yes, proceed" /></Step>
        </Steps>
      </div>
    </Fit>
  </Shell>
);

const OpenFolder: Page = () => (
  <Shell chapter={3}>
    <PracticeEyebrow time="5 分鐘">練習 3｜Codex</PracticeEyebrow>
    <Heading>練習：在資料夾打開 Codex</Heading>
    <Fit>
      <div style={{ display: 'grid', gridTemplateColumns: '600px 1fr', gap: 56, alignItems: 'center' }}>
        <div style={{ display: 'grid', gap: 34 }}>
          <In i={0}>
            <NumLine n={1} size={34}>下載、解壓練習資料夾</NumLine>
            <div style={{ display: 'flex', alignItems: 'center', gap: 22, marginTop: 16, marginLeft: 62 }}>
              <a href={LAB_ZIP_URL} target="_blank" rel="noreferrer" aria-label="下載練習資料夾 ZIP"><img src={labQr} alt="練習資料夾 ZIP 的下載 QR code" style={{ width: 150, height: 150, display: 'block', background: '#FFFFFF', border: `1px solid ${rule}` }} /></a>
              <span style={{ fontSize: 26, color: muted, lineHeight: 1.45 }}>掃碼下載<br /><Path size={24}>teacher-learning-lab</Path></span>
            </div>
          </In>
          <In i={1}><NumLine n={2} size={34}>打 cd 和空格，拖進資料夾</NumLine></In>
          <In i={2}><NumLine n={3} size={34}>打 codex</NumLine></In>
          <In i={3}><NumLine n={4} size={34}>請它列出 notes/</NumLine></In>
        </div>
        <div>
          <Steps><Step duration={STEP_MS}><Terminal title="終端機（示意，路徑依電腦而定）">
            <Typed>$</Typed>{' cd ~/Downloads/teacher-learning-lab\n'}<Typed>$</Typed>{' codex\n'}<AskLine>{'› 列出 notes/ 裡的檔案，先不要修改\n'}</AskLine><Dim>{'notes/ 裡有六份筆記：\n'}</Dim>{'劉備.md　關羽.md　張飛.md\n曹操.md　桃園結義.md　煮酒論英雄.md'}
          </Terminal></Step></Steps>
        </div>
      </div>
    </Fit>
  </Shell>
);

// ---------- 04 用 Codex 做事 ----------

const Section4: Page = () => <SectionPage chapter={4} label="04 / CODEX" lead="看狀態、開 Session、留下記憶" />;

// One thing that piles up on the Session's desk as you work.
const DeskCard = ({ x, y, kind, label }: { x: number; y: number; kind: IconKind; label: string }) => (
  <g>
    <rect x={x} y={y} width="420" height="110" fill={surface} stroke={rule} strokeWidth="2" />
    <SvgIcon kind={kind} x={x + 62} y={y + 55} size={56} color={amber} />
    <text x={x + 116} y={y + 67} fontSize="34" fill={ink}>{label}</text>
  </g>
);

const SessionDesk: Page = () => (
  <Shell chapter={4}>
    <Eyebrow>Session＝一次工作階段</Eyebrow>
    <Heading>Session 是一張工作桌</Heading>
    <Lead>同一張桌上，前面講過的它都看得到</Lead>
    <Fit>
      <Stage h={400}>
        <Steps>
          <Layer h={400} label="Session 1 的桌上：你的任務、讀過的檔案、它的回答、你的追問">
            <rect x="0" y="10" width="940" height="380" fill="#FFFFFF" stroke={ink} strokeWidth="2" />
            <text x="32" y="62" fontSize="32" fontWeight="600" fill={ink}>Session 1</text>
            <InG i={0}><DeskCard x={32} y={96} kind="chat" label="你的任務" /></InG>
            <InG i={1}><DeskCard x={488} y={96} kind="doc" label="讀過的檔案" /></InG>
            <InG i={2}><DeskCard x={32} y={240} kind="ok" label="它的回答" /></InG>
            <InG i={3}><DeskCard x={488} y={240} kind="search" label="你的追問" /></InG>
          </Layer>
          <Step duration={STEP_MS}><Layer h={400} label="輸入 /new 開新 Session，新的桌子是空的">
            <MapArrow x1={956} x2={1076} y={200} hot />
            <text x="1016" y="176" textAnchor="middle" fontSize="28" fontFamily={mono} fill={amber}>/new</text>
            <rect x="1092" y="10" width="540" height="380" fill="none" stroke={faint} strokeWidth="2" strokeDasharray="12 10" />
            <text x="1124" y="62" fontSize="32" fontWeight="600" fill={quiet}>Session 2</text>
            <text x="1362" y="214" textAnchor="middle" fontSize="44" fill={quiet}>空的</text>
            <text x="1362" y="266" textAnchor="middle" fontSize="28" fill={muted}>前面的東西不在這</text>
          </Layer></Step>
        </Steps>
      </Stage>
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={40}>同一件事，留在同一個 Session</Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

const STATUS_COLS = '250px 1fr';

const StatusCheck: Page = () => (
  <Shell chapter={4}>
    <PracticeEyebrow time="3 分鐘">練習 4｜Codex</PracticeEyebrow>
    <Heading>用 /status 確認 AI 在哪裡</Heading>
    <Fit>
      <div style={{ display: 'grid', gridTemplateColumns: '760px 1fr', gap: 56, alignItems: 'center' }}>
        <In i={0}>
          <Shot src={codexStatus} alt="Codex /status 的輸出，標出 Model、Directory、Permissions、Session 四行" crop={[130, 330, 905, 480]} width={760}>
            <RowMark top={23} width={748} />
            <RowMark top={89} width={748} />
            <RowMark top={122} width={748} />
            <RowMark top={253} width={748} />
          </Shot>
          <Caption>教材範例｜帳號與即時額度已隱藏</Caption>
        </In>
        <div>
          <div style={{ fontSize: 34, marginBottom: 22 }}>輸入 <Path size={34}>/status</Path>，找出這四行</div>
          <div style={{ borderTop: `3px solid ${rule}` }}>
            <TRow head cols={STATUS_COLS} cells={['欄位', '白話來說']} />
            <Steps>
              <Step duration={STEP_MS}><TRow cols={STATUS_COLS} cells={[<Path size={29}>Model</Path>, '用哪個模型']} /></Step>
              <Step duration={STEP_MS}><TRow cols={STATUS_COLS} tint={amberSoft} cells={[<strong><Path size={29}>Directory</Path></strong>, <strong>它在哪個資料夾工作</strong>]} /></Step>
              <Step duration={STEP_MS}><TRow cols={STATUS_COLS} cells={[<Path size={29}>Permissions</Path>, '能不能改你的檔案']} /></Step>
              <Step duration={STEP_MS}><TRow cols={STATUS_COLS} cells={[<Path size={29}>Session</Path>, '這張工作桌的編號']} /></Step>
            </Steps>
          </div>
        </div>
      </div>
      <Steps><Step duration={STEP_MS}><Takeaway>動手前，先看 Directory 對不對</Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

const SessionBox = ({ x, title, children }: { x: number; title: string; children: ReactNode }) => (
  <g>
    <rect x={x} y="40" width="540" height="170" fill="#FFFFFF" stroke={ink} strokeWidth="2" />
    <text x={x + 28} y="88" fontSize="30" fontWeight="600" fill={ink}>{title}</text>
    {children}
  </g>
);

const MemoryLayers: Page = () => (
  <Shell chapter={4}>
    <Eyebrow>Memory＝留下來的上下文</Eyebrow>
    <Heading>Memory：聊天會忘，檔案會留</Heading>
    <Lead>重要的規則，寫成檔案</Lead>
    <Fit>
      <Stage h={460}>
        <Steps>
          <Layer h={460} label="Session 內的記憶：在 Session 1 說的規則，到了 Session 2 就不見了">
            <text x="0" y="24" fontSize="26" fontWeight="600" fill={quiet} letterSpacing="2">Session 內的記憶</text>
            <InG i={0}><SessionBox x={80} title="Session 1">
              <SvgChip x={108} y={118} w={484} h={60} label="規則：開頭先寫「依筆記：」" size={27} fill={amberSoft} stroke={amber} />
            </SessionBox></InG>
            <InG i={1}><MapArrow x1={636} x2={1004} y={125} />
              <text x="820" y="108" textAnchor="middle" fontSize="28" fontFamily={mono} fill={muted}>/new</text></InG>
            <InG i={2}><SessionBox x={1012} title="Session 2">
              <AskMark x={1064} y={148} r={24} />
              <text x="1104" y="158" fontSize="30" fill={amber}>規則不見了</text>
            </SessionBox></InG>
          </Layer>
          <Step duration={STEP_MS}><Layer h={460} label="專案裡的記憶：AGENTS.md 寫在資料夾裡，每個 Session 開始都會讀">
            <text x="0" y="290" fontSize="26" fontWeight="600" fill={amber} letterSpacing="2">專案裡的記憶</text>
            <g fill="none" stroke={okGreen} strokeWidth="4">
              <StepPath d="M720 330 C560 330 360 300 350 214" i={0} />
              <StepPath d="M912 330 C1072 330 1272 300 1282 214" i={1} />
            </g>
            <g className="aib-build" style={buildDelay(0)}>
              <DocShape x={646} y={290} w={340} h={160} fill={amberSoft} stroke={amber} sw={3} />
              <text x="816" y="364" textAnchor="middle" fontSize="36" fontFamily={mono} fontWeight="600" fill={ink}>AGENTS.md</text>
              <text x="816" y="412" textAnchor="middle" fontSize="26" fill={muted}>每次開都會讀</text>
            </g>
            <g className="aib-build" style={buildDelay(3)}>
              <rect x="1036" y="114" width="480" height="76" fill="#FFFFFF" />
              <OkDot x={1064} y={150} r={24} />
              <text x="1104" y="160" fontSize="30" fill={okGreen}>讀了檔案，照規則做</text>
            </g>
          </Layer></Step>
        </Steps>
      </Stage>
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={28}>要它一直記得，就寫進 AGENTS.md</Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

// One round of the memory practice: what you type, then what happens.
const RoundCard = ({ when, lines, ok, result }: { when: string; lines: string; ok: boolean | 'save'; result: string }) => (
  <div style={{ background: '#FFFFFF', border: `1px solid ${rule}`, height: '100%', boxSizing: 'border-box', padding: '24px 26px 28px', display: 'flex', flexDirection: 'column' }}>
    <div style={{ fontSize: 32, fontWeight: 600, color: 'var(--osd-accent)' }}>{when}</div>
    <div style={{ marginTop: 18, flex: 1, background: term, color: '#E9B650', padding: '22px 24px', fontFamily: mono, fontSize: 29, lineHeight: 1.6, minHeight: 300, boxSizing: 'border-box', whiteSpace: 'pre-wrap' }}>{lines}</div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 22, background: ok === false ? amberSoft : sage, border: `2px solid ${ok === false ? amber : okGreen}`, padding: '12px 18px', fontSize: 29, fontWeight: 600 }}>
      {ok === 'save' ? <Icon kind="save" size={40} color={okGreen} /> : ok ? <Icon kind="ok" size={40} color={okGreen} /> : <svg viewBox="0 0 40 40" style={{ width: 40, height: 40 }} aria-hidden="true"><CrossMark x={20} y={20} size={22} color={amber} /></svg>}
      <span>{result}</span>
    </div>
  </div>
);

const MemoryPractice: Page = () => (
  <Shell chapter={4}>
    <PracticeEyebrow time="7 分鐘">練習 5｜Codex</PracticeEyebrow>
    <Heading>練習（Memory）：寫進 AGENTS.md</Heading>
    <Fit>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32, alignItems: 'stretch' }}>
        <Steps>
          <RoundCard when="1｜只用說的" lines={'› 之後回答，\n  開頭先寫「依筆記：」\n/new\n› 劉備是誰？'} ok={false} result="新 Session 沒照做" />
          <Step duration={STEP_MS}><RoundCard when="2｜寫進檔案" lines={'› 把這條規則寫進 AGENTS.md'} ok="save" result="Yes, proceed 存檔" /></Step>
          <Step duration={STEP_MS}><RoundCard when="3｜再開一次" lines={'/new\n› 劉備是誰？'} ok result="開頭出現「依筆記：」" /></Step>
        </Steps>
      </div>
    </Fit>
  </Shell>
);

// ---------- Close ----------

const RecapStop = ({ x, n, verb }: { x: number; n: Chapter; verb: string }) => (
  <g>
    <circle cx={x} cy="90" r="56" fill={amberSoft} stroke={amber} strokeWidth="3" />
    <text x={x} y="106" textAnchor="middle" fontSize="44" fontFamily={display} fill={amber}>{n}</text>
    <text x={x} y="200" textAnchor="middle" fontSize="34" fontWeight="600" fill={ink}>{CHAPTERS[n - 1]}</text>
    <text x={x} y="250" textAnchor="middle" fontSize="29" fill={muted}>{verb}</text>
  </g>
);

const Recap: Page = () => (
  <Shell>
    <Eyebrow>總結</Eyebrow>
    <Heading>今天學的四件事</Heading>
    <Fit>
      <Figure h={280} label="四章：GPT 是猜下一個字、找資料要附來源、裝好 Codex、規則寫進 AGENTS.md">
        <g fill="none" stroke={amber} strokeWidth="4"><DrawPath i={4} d="M260 90 H1372" /></g>
        <InG i={0}><RecapStop x={204} n={1} verb="猜下一個字，會猜錯" /></InG>
        <InG i={1}><RecapStop x={612} n={2} verb="先查資料，附上來源" /></InG>
        <InG i={2}><RecapStop x={1020} n={3} verb="在資料夾打開 Codex" /></InG>
        <InG i={3}><RecapStop x={1428} n={4} verb="規則寫進 AGENTS.md" /></InG>
      </Figure>
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={72}>下一篇：把筆記放進 Obsidian，做成知識庫</Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

// ---------- Deck ----------

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

export const meta: SlideMeta = {
  title: '01-a 認識 AI：從 ChatGPT 到 Codex',
  createdAt: '2026-10-17T01:58:35.085Z',
  theme: 'thoughtstream',
};

const deck: Page[] = [
  Cover, SpeakerIntro, Agenda, Evolution,
  Section1, NextToken, Hallucination, ChatVsCodex, Practice1,
  Section2, Thinking, WebSearch, RagSteps, Practice2,
  Section3, Install, FirstRun, OpenFolder,
  Section4, SessionDesk, StatusCheck, MemoryLayers, MemoryPractice,
  Recap,
];

// 1-based page number of a page in this deck (for the agenda).
function pageOf(page: Page) {
  return deck.indexOf(page) + 1;
}

// Speaker notes, keyed by page so they stay aligned with the deck order.
const NOTES = new Map<Page, string>([
  [Cover, '0:00–0:30。今天是入門篇：先弄懂 ChatGPT 這類 AI 怎麼運作、為什麼會說錯、怎麼讓它先查資料；最後把 Codex 裝好，學會三個用 Codex 一定會碰到的概念：Session、Status、Memory。下一篇再用這些工具做知識庫。'],
  [SpeakerIntro, '0:30–1:00。我是黃懷萱，中央大學碩士，研究 NLP、LLM 和 RAG；現在在關貿網路做智慧客服，參與 EZ WAY、eHub、TTLL 等服務。今天講的 RAG，就是我平常在做的事。'],
  [Agenda, '1:00–2:00。四章，大約 60 分鐘，每章最後都有一個 3 到 7 分鐘的小練習。第一章講 GPT 的原理和幻覺；第二章講現在的 ChatGPT 為什麼變厲害：會先想、會先查；第三章把 Codex 裝好；第四章學 Session、Status、Memory，最後寫出一份 AGENTS.md。練習 1、2 用 ChatGPT 網頁版就能做，練習 3 以後要用 Codex。'],
  [Evolution, '2:00–3:00。先看全貌，這也是今天的路線。一開始只有文字生成：你問它答，就是 2022 年的 ChatGPT。按一下：後來會推理，也就是 Thinking 模式，先把問題拆開再回答。按一下：再來會用工具，例如上網搜尋。按一下：最後能自己執行任務，Codex 會讀你的檔案、改檔、存檔，這就是 Agent。最後一下：不管多會做事，核心還是在猜下一個字；所以第一章先從這裡講起。'],
  [Section1, '3:00–3:15。第一章：GPT 是什麼。只講兩件事：它怎麼產生文字，以及為什麼會說錯。'],
  [NextToken, '3:15–5:00。GPT 是 Generative Pre-trained Transformer，中文叫生成式預訓練模型，名字不用背。它做的事很單純：看前面的文字，猜下一個最可能出現的字詞，再接著猜下一個。先讓大家想：「學生需要更___」，你會填什麼？按一下：模型心裡有一張機率表，這裡的數字是示意。「清楚的」最常見，就選它，然後一直接下去。最後一下：它挑的是最常見的說法，不是查證過的說法。這句話就是幻覺的來源。'],
  [Hallucination, '5:00–6:30。早期的 GPT-3.5 算一長串加法，很肯定地回答 8402。先問大家：你相信嗎？按一下：自己驗算是 8484。它沒有真的去算，只猜了一個看起來像答案的數字。最後一下：語氣肯定，不等於答案正確。這種沒有根據卻說得很肯定的回答，就叫幻覺。現在的模型算術已經進步很多，下一章會講為什麼。圖片來源：IT 邦幫忙 https://ithelp.ithome.com.tw/articles/10315994'],
  [ChatVsCodex, '6:30–9:00。今天會用到兩個工具。ChatGPT 是對話框：你問一句，它回一段話，適合發想、請它解釋、找資料。按一下：Codex 是 OpenAI 的 Agent 工具，在你電腦的資料夾裡工作。你交代一件事，它會自己打開資料夾裡的檔案來讀，做完再存成新檔。最後一下：ChatGPT 幫你想清楚，Codex 幫你做完。ChatGPT 也能上傳檔案，兩者的差別在使用情境，分工沒有那麼絕對。Claude 也有類似的分工：Claude 對話，和 Claude Code。'],
  [Practice1, '9:00–15:00。練習 5 分鐘，用 ChatGPT 網頁版。先不要開搜尋功能，輸入畫面上那句：「逐字引用《三國演義》第 21 回，曹操說『天下英雄』那一句」。接著打開維基文庫第 21 回：https://zh.wikisource.org/wiki/三國演義/第021回 ，用 Ctrl+F 或 Cmd+F 找「英雄」，一個字一個字比對。按一下：一樣，就是有根據；對不上，就是幻覺。每個人的結果可能不同，重點是養成回原文比對的習慣。請一兩位分享結果。'],
  [Section2, '15:00–15:15。第二章：現在的 ChatGPT 為什麼變厲害？兩個關鍵：會先想（Thinking），會先查（Web Search）。查資料這件事，有個名字叫 RAG。'],
  [Thinking, '15:15–17:00。Thinking 模式也叫推理模式。同一題長加法，先出現題目。按一下：Thinking 不急著寫答案，先拆成幾小段、一段一段加、最後再驗算一次。研究上叫 Chain of Thought（CoT），思考鏈，名字不用背。按一下：這次答對了，8484。最後一下：多想幾步，比較不會亂猜，但還是可能錯，所以前面的比對習慣要留著。ChatGPT 裡選 Thinking 模型，就會看到它先想一陣子，例如「處理時間 31 秒」。'],
  [WebSearch, '17:00–19:00。這是 ChatGPT 的實際畫面：問「最近的台灣新聞」，它先顯示「正在搜尋 2 個網站」，就是標 1 的地方，再看標 2：它找了中央社和路透社。按一下：回答裡會附上來源，點得開、查得到。最後一下：模型的訓練資料有截止日，今天的新聞它本來不知道，要靠搜尋。搜尋就是一種工具，第一頁說的「使用工具」就是這個。'],
  [RagSteps, '19:00–22:00。RAG 全名 Retrieval-Augmented Generation，檢索增強生成，拆成三步。R 檢索：問「桃園結義有哪些人？」，先到資料來源裡找。來源可以是網路、你上傳的檔案，或你電腦的資料夾，找到〈桃園結義〉第 1 回。按一下，A 增強：把問題和找到的資料一起交給 AI，題目多了依據。按一下，G 生成：AI 照資料回答，並附上出處。最後一下：剛剛的 Web Search 就是 RAG，資料從網路來；上傳檔案也是 RAG，資料從你的檔案來；第四章的 Codex 讀資料夾，資料從你的電腦來。AI 本身沒變，只是多看了資料。來源：https://arxiv.org/abs/2005.11401'],
  [Practice2, '22:00–28:00。練習 5 分鐘：同一題，這次打開搜尋，再問一次。完整提示詞：「請上網搜尋，逐字引用《三國演義》第 21 回，曹操說『天下英雄』那一句，附上來源連結；找不到就說找不到。」三個重點就是畫面上的定位、期望輸出、限制。左邊是練習 1：沒有來源，只能自己去找。按一下：開搜尋後，回答會附連結，點開就能比對。最後一下：有來源連結，才查得回去。提醒：附了連結也要點開看，偶爾連結和內容對不上。'],
  [Section3, '28:00–28:15。第三章：安裝 Codex。前兩章都在瀏覽器裡用 ChatGPT；Codex 要裝在電腦上，才能讀你資料夾裡的檔案。'],
  [Install, '28:15–33:00。四步，一步一步來。Mac 用「終端機」，Windows 用 PowerShell 或命令提示字元。第一步：到 nodejs.org 下載 LTS 版，用預設選項安裝。按一下，第二步：關掉再重開終端機，輸入 node -v 和 npm -v，兩個都看到版本號就對了。按一下，第三步：輸入 npm install -g @openai/codex@latest。出現「找不到指令」先重開終端機；還是不行，重跑一次 Node.js 安裝程式。按一下，第四步：輸入 codex，選 Sign in with ChatGPT，用瀏覽器登入。Plus、Pro、Business、Enterprise 方案含 Codex 用量，其他方案請課前確認。助教在教室後面，卡住請舉手。'],
  [FirstRun, '33:00–34:00。第一次打開 Codex 會看到三個英文畫面，像第一次登入學校系統。第一個登入，選 Sign in with ChatGPT。按一下：第二個問你信不信任這個資料夾，確認是你要的資料夾，選 Yes, continue。按一下：第三個是 AI 要寫檔案前問你，先看它要寫什麼，再選 Yes, proceed；練習 5 會遇到。'],
  [OpenFolder, '34:00–40:00。練習 5 分鐘。先掃碼下載練習資料夾，解壓縮；Windows 的「全部解壓縮」常多包一層，看到另一個 teacher-learning-lab 就再點進去，直到看見 notes 資料夾。電腦上也可以打網址 github.com/Chrouos/AI-workshop-slides 下載。接著打開終端機，打 cd 和一個空格，把資料夾拖進視窗，按 Enter；打 codex；最後輸入「列出 notes/ 裡的檔案，先不要修改」。按一下出現示意畫面：看到六份筆記就成功了，路徑每台電腦不同。'],
  [Section4, '40:00–40:15。第四章：用 Codex 做事前，要懂三個詞：Session、Status、Memory。'],
  [SessionDesk, '40:15–42:00。Session 是一次工作階段，像一張工作桌。你交代的任務、它讀過的檔案、它的回答、你的追問，都堆在同一張桌上，所以你可以說「剛剛那份再改短一點」，它知道你指哪份。按一下：輸入 /new 會開一張新桌子，新的桌子是空的，前面講過的它都看不到。最後一下：同一件事，留在同一個 Session 做完。'],
  [StatusCheck, '42:00–45:00。練習 3 分鐘：在 Codex 輸入 /status。畫面上框了四行，請大家先自己找。按一下：Model，用哪個模型；按一下：Directory，它在哪個資料夾工作，這行最重要；按一下：Permissions，能不能改你的檔案；按一下：Session，這張工作桌的編號。最後一下：動手前先看 Directory，要是 teacher-learning-lab；不是的話，關掉 Codex，回到上一個練習重新 cd。下面兩行 limit 是用量額度，還剩多少可以用，額度用完要等重置。'],
  [MemoryLayers, '45:00–47:00。Memory 是 Codex 能延續的上下文，分兩層。第一層是 Session 內的記憶：在 Session 1 說「回答開頭先寫依筆記」，它會照做；但開新 Session，這條規則就不見了。按一下，第二層是專案裡的記憶：把規則寫進資料夾裡的 AGENTS.md，Codex 每次開 Session 都會先讀它，所以新的 Session 也照做。/status 裡的 Agents.md 那一行，就是在說這個檔案。最後一下：要它一直記得，就寫進 AGENTS.md。'],
  [MemoryPractice, '47:00–54:00。練習 7 分鐘，親手驗證剛剛那頁。第一輪：輸入「之後回答，開頭先寫『依筆記：』」，再打 /new 開新 Session，問「劉備是誰？」，看看開頭有沒有「依筆記：」。按一下，第二輪：輸入「把這條規則寫進 AGENTS.md」，它會問你要不要存檔，看過內容選 Yes, proceed。按一下，第三輪：再打 /new，問一次「劉備是誰？」，這次開頭會出現「依筆記：」。如果沒生效，輸入 /quit 關掉，再打 codex 重開一次。做完的人打開 AGENTS.md 看看，它就是一份普通的文字檔。'],
  [Recap, '54:00–58:00。回顧四件事。一、GPT 在猜下一個字，所以會猜錯，要回原文比對。二、Thinking 會先想、Web Search 會先查，先查資料再回答就是 RAG，記得看來源。三、Codex 裝好了，在資料夾裡打開它。四、Session 是工作桌，/status 先看 Directory，重要的規則寫進 AGENTS.md。按一下：下一篇把三國筆記放進 Obsidian，請 Codex 幫我們做成知識庫、畫關係圖。'],
]);

export const notes: (string | undefined)[] = deck.map(page => NOTES.get(page));

export default deck satisfies Page[];
