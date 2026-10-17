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
const STAMP_MS = 300; // a tick, cross or "chosen" marker landing, like a teacher's stamp
const STAMP_DELAY = 260; // ...after the thing it marks has faded in
const MARK_MS = 600; // a highlighter sweeping left to right across the quoted sentence
const amberHex = '#9A6846';

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
.atl-deck .atl-stepdraw { stroke-dasharray: 1; stroke-dashoffset: 0; transition: stroke-dashoffset ${DRAW_MS}ms ${EASE_OUT}; }
.atl-deck [data-osd-step="pending"] .atl-stepdraw { stroke-dashoffset: 1; }
@keyframes atl-pop { from { opacity: 0; transform: scale(0.75); } to { opacity: 1; transform: scale(1); } }
.atl-deck .atl-pop { transform-box: fill-box; transform-origin: center; animation: atl-pop ${STAMP_MS}ms ${EASE_OUT} both; }
.atl-deck .atl-stamp { transform-box: fill-box; transform-origin: center; transition: opacity 200ms ease, transform ${STAMP_MS}ms ${EASE_OUT}; transition-delay: ${STAMP_DELAY}ms; }
.atl-deck [data-osd-step="pending"] .atl-stamp { opacity: 0; transform: scale(0.75); }
.atl-deck [data-osd-step="pending"] > .atl-still { transform: none; }
.atl-deck .atl-mark { background-image: linear-gradient(rgba(233, 182, 80, 0.32), rgba(233, 182, 80, 0.32)), linear-gradient(${amberHex}, ${amberHex}); background-repeat: no-repeat; background-position: left top, left bottom; background-size: 100% 100%, 100% 4px; transition: background-size ${MARK_MS}ms cubic-bezier(0.45, 0, 0.25, 1) ${STAMP_DELAY}ms; }
.atl-deck [data-osd-step="pending"] .atl-mark { background-size: 0% 100%, 0% 4px; }
.atl-deck .atl-strike { transform-origin: left center; transition: transform 420ms cubic-bezier(0.45, 0, 0.25, 1) ${STAMP_DELAY}ms; }
.atl-deck [data-osd-step="pending"] .atl-strike { transform: scaleX(0); }
@media (prefers-reduced-motion: reduce) {
  .atl-deck .atl-in, .atl-deck .atl-pop { animation: atl-in-fade 150ms ease both; }
  .atl-deck .atl-draw { animation: none; stroke-dasharray: none; }
  .atl-deck .atl-stepdraw, .atl-deck [data-osd-step="pending"] .atl-stepdraw { transition: none; stroke-dasharray: none; stroke-dashoffset: 0; }
  .atl-deck .atl-stamp, .atl-deck [data-osd-step="pending"] .atl-stamp { transform: none; transition: opacity 150ms ease; }
  .atl-deck .atl-mark, .atl-deck [data-osd-step="pending"] .atl-mark { transition: none; background-size: 100% 100%, 100% 4px; }
  .atl-deck .atl-strike, .atl-deck [data-osd-step="pending"] .atl-strike { transition: none; transform: none; }
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

// A solid line inside a <Step>: it draws itself when that step is revealed.
const StepPath = ({ d, i = 0 }: { d: string; i?: number }) => (
  <path d={d} pathLength={1} className="atl-stepdraw" style={buildDelay(i, 60)} />
);

// A mark (tick, "chosen" ring) that lands after the thing it marks, on the live page.
const PopG = ({ i, children }: { i: number; children: React.ReactNode }) => {
  const live = useIsActivePage();
  return <g className={live ? 'atl-pop' : undefined} style={live ? { animationDelay: enterDelay(i) } : undefined}>{children}</g>;
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
// Simple line icons (64×64) used instead of words in flows, checklists and states.
const Icon = ({ kind, size = 64, color = '#1C1917' }: { kind: 'doc' | 'chat' | 'ok' | 'save' | 'browser' | 'clip' | 'down' | 'search' | 'timeline'; size?: number; color?: string }) => (
  <svg viewBox="0 0 64 64" style={{ width: size, height: size, display: 'block', flexShrink: 0 }} aria-hidden="true">
    <g fill="none" stroke={color} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
      {kind === 'doc' && <><path d="M16 6 H40 L50 16 V58 H16 Z" /><path d="M40 6 V16 H50" /><path d="M23 30 H43 M23 39 H43 M23 48 H36" /></>}
      {kind === 'chat' && <><path d="M8 12 H56 V42 H30 L18 53 V42 H8 Z" /><path d="M19 24 H45 M19 32 H37" /></>}
      {kind === 'ok' && <><circle cx="32" cy="32" r="25" /><path d="M20 33 L28 41 L45 23" /></>}
      {kind === 'save' && <><path d="M10 8 H46 L56 18 V56 H10 Z" /><path d="M20 8 V22 H42 V8" /><path d="M19 56 V38 H45 V56" /></>}
      {kind === 'browser' && <><rect x="6" y="10" width="52" height="44" rx="4" /><path d="M6 22 H58" /><circle cx="14" cy="16" r="1.5" fill={color} /><circle cx="21" cy="16" r="1.5" fill={color} /><path d="M20 38 L28 31 M28 31 L44 43" /></>}
      {kind === 'clip' && <><rect x="14" y="10" width="36" height="46" rx="4" /><path d="M24 6 H40 V14 H24 Z" /><path d="M22 28 H42 M22 37 H42 M22 46 H34" /></>}
      {kind === 'down' && <><path d="M32 8 V40 M20 28 L32 40 L44 28" /><path d="M10 42 V54 H54 V42" /></>}
      {kind === 'search' && <><circle cx="27" cy="27" r="16" /><path d="M39 39 L54 54" /></>}
      {kind === 'timeline' && <><path d="M6 40 H58" /><circle cx="18" cy="40" r="5" fill={color} /><circle cx="44" cy="40" r="5" fill={color} /><path d="M18 34 V18 M44 34 V22" /><rect x="8" y="10" width="20" height="10" /><rect x="34" y="14" width="20" height="10" /></>}
    </g>
  </svg>
);

// Which block of prompts.md this page uses — the only "how to" text left on a practice page.
const PromptRef = ({ children }: { children: React.ReactNode }) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: '#FFFFFF', border: `1px solid ${rule}`, padding: '4px 16px 4px 10px', fontSize: 24, color: muted, whiteSpace: 'nowrap' }}>
    <Icon kind="clip" size={28} color={muted} />prompts.md {children}
  </span>
);

const PracticeEyebrow = ({ children, time, promptRef }: { children: React.ReactNode; time: string; promptRef?: string }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
    <Eyebrow>{children}</Eyebrow>
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 14, background: '#FFFFFF', border: `1px solid ${rule}`, padding: '6px 18px', fontSize: 24, color: muted, whiteSpace: 'nowrap' }}>
      <strong style={{ color: amber }}>⏱ {time}</strong>
    </span>
    {promptRef ? <PromptRef>{promptRef}</PromptRef> : null}
  </div>
);

// A prompt squeezed to one line: three labelled pills, ≤10 字 each.
const Pill = ({ tag, size = 28, children }: { tag: string; size?: number; children: React.ReactNode }) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', background: '#FFFFFF', border: `1px solid ${rule}`, fontSize: size, whiteSpace: 'nowrap' }}>
    <span style={{ background: amber, color: '#FFFFFF', fontSize: size - 4, fontWeight: 600, padding: '8px 14px' }}>{tag}</span>
    <span style={{ padding: '6px 18px' }}>{children}</span>
  </span>
);
const PillRow = ({ children, marginTop = 28, center = false }: { children: React.ReactNode; marginTop?: number; center?: boolean }) => (
  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginTop, justifyContent: center ? 'center' : 'flex-start' }}>{children}</div>
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

// The page's main visual: fills the room between the heading (or the line under it) and the
// footer, centred vertically, so a short page doesn't leave the bottom half empty.
const Stage = ({ top = 290, gap = 0, children }: { top?: number; gap?: number; children: React.ReactNode }) => (
  <div style={{ position: 'absolute', left: 144, right: 144, top, bottom: 150, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap }}>{children}</div>
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
// Every practice prompt, shown the same way: what you type, split into 定位／期望輸出／限制.
const PromptCard = ({ label = '你輸入', children }: { label?: string; children: React.ReactNode }) => (
  <div style={{ background: '#FFFFFF', border: `1px solid ${rule}`, borderLeft: `5px solid ${amber}`, padding: '16px 30px', display: 'grid', gap: 4 }}>
    <SmallLabel>{label}</SmallLabel>
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
    <AgendaRow i={0} n="01" name="理解任務" doing="看成果、認識幻覺與 RAG" result="一個要查的問題" time="00–08 分" page="第 5 頁">
      <line x1="22" y1="35" x2="88" y2="35" stroke={amber} strokeWidth="3" strokeDasharray="6 5" />
      <circle cx="14" cy="35" r="11" fill={amberSoft} stroke={amber} strokeWidth="2" /><circle cx="96" cy="35" r="11" fill={amberSoft} stroke={amber} strokeWidth="2" />
      <circle cx="55" cy="35" r="13" fill={amber} /><text x="55" y="42" textAnchor="middle" fontSize="19" fontWeight="700" fill="#FFFFFF">?</text>
    </AgendaRow>
    <AgendaRow i={1} n="02" name="讀取筆記" doing="練習 1：六份筆記整理成表" result="一張關係表" time="08–20 分" page="第 12 頁">
      <rect x="6" y="6" width="98" height="58" fill="#FFFFFF" stroke={faint} strokeWidth="2" /><rect x="6" y="6" width="98" height="14" fill={raised} />
      <line x1="6" y1="34" x2="104" y2="34" stroke={rule} strokeWidth="2" /><line x1="6" y1="49" x2="104" y2="49" stroke={rule} strokeWidth="2" /><line x1="40" y1="6" x2="40" y2="64" stroke={rule} strokeWidth="2" /><line x1="72" y1="6" x2="72" y2="64" stroke={rule} strokeWidth="2" />
    </AgendaRow>
    <AgendaRow i={2} n="03" name="查證關係" doing="練習 2：草稿逐行找原句" result="核對過的草稿" time="20–35 分" page="第 16 頁">
      <DocShape x={6} y={4} w={78} h={62} /><g stroke={faint} strokeWidth="3"><path d="M18 22 H58" /><path d="M18 34 H50" /><path d="M18 46 H54" /></g>
      <circle cx="88" cy="50" r="16" fill={okGreen} /><TickMark x={88} y={51} size={16} color="#FFFFFF" />
    </AgendaRow>
    <AgendaRow i={3} n="04" name="畫圖與應用" doing="練習 3：畫成知識圖" result="一張知識圖" time="35–60 分" page="第 19 頁">
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

// The day's result graph. On the opening page (p5) it is built one click at a time, each
// story's lines drawing in as it arrives. `prebuilt` (the check page) draws the same graph by
// itself when the page arrives: the audience has seen it built once, now it is "your" file.
const STORY_GRAPH_BOX = { width: '100%', position: 'absolute', inset: 0 } as const;

// Colour rule for every knowledge graph in the deck: green lines are relations the notes state,
// both events share one green card, and emphasis is a heavier outline, never amber (amber means
// "the source doesn't say this").
const LineTag = ({ x, y, text }: { x: number; y: number; text: string }) => {
  const w = text.length * 28 + 24;
  return <g><rect x={x - w / 2} y={y - 21} width={w} height={42} rx="6" fill="#FFFFFF" stroke={rule} strokeWidth="2" /><text x={x} y={y + 10} textAnchor="middle" fontSize="28" fill={muted}>{text}</text></g>;
};
const StoryPerson = ({ x, name, key_ = false }: { x: number; name: string; key_?: boolean }) => (
  <g><circle cx={x} cy="100" r="55" fill={surface} stroke={key_ ? '#1C1917' : rule} strokeWidth={key_ ? 4 : 2} /><text x={x} y="112" textAnchor="middle" fontSize="35" fontWeight={key_ ? 600 : 400} fill="#1C1917">{name}</text></g>
);
const StoryEvent = ({ x, name, source }: { x: number; name: string; source: string }) => (
  <g><rect x={x} y="320" width="340" height="90" fill={sage} stroke={okGreen} strokeWidth="2" /><text x={x + 170} y="377" textAnchor="middle" fontSize="38" fill="#1C1917">{name}</text><text x={x + 170} y="458" textAnchor="middle" fontSize="28" fill={muted}>{source}</text></g>
);
const OATH_LINES = ['M170 155 C170 240 290 260 360 320', 'M470 155 V320', 'M810 147 C790 240 650 280 580 320'];
const TALK_LINES = ['M870 147 C910 235 1000 270 1050 320', 'M1360 155 C1360 240 1280 275 1220 320'];
const OathTags = () => <g><LineTag x={222} y={250} text="參與結義" /><LineTag x={470} y={238} text="參與結義" /><LineTag x={705} y={252} text="參與結義" /></g>;
const TalkTags = () => <g><LineTag x={960} y={250} text="參與對話" /><LineTag x={1318} y={252} text="參與對話" /></g>;
const OATH_SOURCE = '來源：桃園結義.md｜第 1 回';
const TALK_SOURCE = '來源：煮酒論英雄.md｜第 21 回';

const PrebuiltStoryGraph = ({ height }: { height: number }) => (
  <svg viewBox="0 0 1600 500" style={{ ...STORY_GRAPH_BOX, height: height - 10 }} role="img" aria-label="知識圖：關羽、張飛、劉備連到桃園結義；劉備、曹操連到煮酒論英雄">
    <g fill="none" stroke={okGreen} strokeWidth="4">{OATH_LINES.map((d) => <DrawPath key={d} i={2} d={d} />)}</g>
    <g fill="none" stroke={okGreen} strokeWidth="4">{TALK_LINES.map((d) => <DrawPath key={d} i={4} d={d} />)}</g>
    <InG i={0}><StoryPerson x={840} name="劉備" key_ /></InG>
    <InG i={1}><StoryPerson x={170} name="關羽" /><StoryPerson x={470} name="張飛" /><StoryPerson x={1360} name="曹操" /></InG>
    <InG i={3}><StoryEvent x={300} name="桃園結義" source={OATH_SOURCE} /><OathTags /></InG>
    <InG i={5}><StoryEvent x={970} name="煮酒論英雄" source={TALK_SOURCE} /><TalkTags /></InG>
  </svg>
);

const LargeStoryGraph = ({ height = 480, prebuilt = false }: { height?: number; prebuilt?: boolean }) => (
  <div style={{ position: 'relative', height, background: '#FFFFFF', border: `1px solid ${rule}` }}>
    {prebuilt ? <PrebuiltStoryGraph height={height} /> : <Steps>
      <svg viewBox="0 0 1600 500" style={{ width: '100%', height: height - 10, position: 'absolute', inset: 0 }} role="img" aria-label="劉備人物節點">
        <StoryPerson x={840} name="劉備" key_ />
      </svg>
      <Step duration={STEP_MS}><svg viewBox="0 0 1600 500" style={{ width: '100%', height: height - 10, position: 'absolute', inset: 0 }} role="img" aria-label="關羽、張飛、曹操依序出現">
        <g className="atl-build" style={buildDelay(0, 0)}><StoryPerson x={170} name="關羽" /></g><g className="atl-build" style={buildDelay(1, 0)}><StoryPerson x={470} name="張飛" /></g><g className="atl-build" style={buildDelay(2, 0)}><StoryPerson x={1360} name="曹操" /></g>
      </svg></Step>
      <Step duration={STEP_MS}><svg viewBox="0 0 1600 500" style={{ width: '100%', height: height - 10, position: 'absolute', inset: 0 }} role="img" aria-label="桃園結義連到關羽、張飛、劉備">
        <g fill="none" stroke={okGreen} strokeWidth="4">{OATH_LINES.map((d, i) => <StepPath key={d} d={d} i={i} />)}</g>
        <g className="atl-build" style={buildDelay(4)}><StoryEvent x={300} name="桃園結義" source={OATH_SOURCE} /><OathTags /></g>
      </svg></Step>
      <Step duration={STEP_MS}><svg viewBox="0 0 1600 500" style={{ width: '100%', height: height - 10, position: 'absolute', inset: 0 }} role="img" aria-label="煮酒論英雄連到劉備、曹操">
        <g fill="none" stroke={okGreen} strokeWidth="4">{TALK_LINES.map((d, i) => <StepPath key={d} d={d} i={i} />)}</g>
        <g className="atl-build" style={buildDelay(3)}><StoryEvent x={970} name="煮酒論英雄" source={TALK_SOURCE} /><TalkTags /></g>
      </svg></Step>
    </Steps>}
  </div>
);

const ResultFirst: Page = () => (
  <Shell chapter={1} enterChapter>
    <Eyebrow>先看今天的成果</Eyebrow>
    <Heading>今天要做出這張知識圖</Heading>
    <div style={{ marginTop: 26 }}><Lead>人物是點，用線連起來</Lead></div>
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
        <Step duration={STEP_MS}><div style={{ marginTop: 24, padding: '24px 32px', borderLeft: `4px solid ${amber}`, background: amberSoft }}><div style={{ fontSize: 34 }}>故事裡結義的是劉備、關羽、張飛，沒有曹操</div><div style={{ marginTop: 18, fontSize: 31, color: muted, lineHeight: 1.5 }}><strong style={{ color: amber, fontWeight: '700' }}>這就是幻覺：</strong>沒有根據，卻說得很肯定</div></div></Step>
      </Steps>
    </div>
    <Steps><Step duration={STEP_MS}><div style={{ marginTop: 28, fontSize: 33, color: amber }}>如果先給它參考資料，再回答呢？</div></Step></Steps>
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
    <Heading>RAG：先找資料，再回答</Heading>
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
          <InG i={0}>
            <NoteCard x={334} y={80} label="劉備" />
            <NoteCard x={474} y={80} label="張飛" />
            <NoteCard x={614} y={80} label="關羽" />
          </InG>
          <InG i={1}>
            <NoteCard x={334} y={170} label="曹操" />
            <NoteCard x={474} y={170} label="桃園結義" />
            <NoteCard x={614} y={170} label="煮酒論英雄" />
          </InG>
          {/* The search lands: one of the six is picked out. */}
          <PopG i={4}><NoteCard x={474} y={170} label="桃園結義" hot /></PopG>
          <InG i={5}><text x="541" y="296" textAnchor="middle" fontSize="26" fill={quiet}>六份筆記挑出相關的一份</text></InG>
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
    <Steps><Step duration={STEP_MS}><p style={{ marginTop: 36, fontSize: 32, lineHeight: 1.5, color: amber }}>資料多了也會看漏，還是要回原文查</p><p style={{ marginTop: 10, fontSize: 28, color: muted }}>ChatGPT 上網搜尋再回答，也是 RAG</p></Step></Steps>
  </Shell>
);

// If Codex won't install or log in, the same practices still work in the ChatGPT web app.
const StatusScreen: Page = () => (
  <Shell>
    <Eyebrow>附錄｜/status</Eyebrow>
    <Heading>Codex 開錯資料夾？輸入 /status</Heading>
    <div style={{ marginTop: 20 }}><Lead>只看 Directory：要是 teacher-learning-lab</Lead></div>
    <div style={{ display: 'grid', gridTemplateColumns: '760px 1fr', gap: 56, alignItems: 'start', marginTop: 40 }}>
      <div>
        <Shot src={codexStatus} alt="Codex /status 的輸出，標出 Directory 那一行" crop={[130, 330, 905, 480]} width={760}>
          <RowMark top={88} width={748} />
        </Shot>
        <p style={{ fontSize: 24, color: quiet, marginTop: 14 }}>教材範例｜帳號與即時額度已隱藏</p>
      </div>
      <Table>
        <TRow head cols="240px 1fr" cells={['欄位', '白話來說']} />
        <TRow cols="240px 1fr" tint={amberSoft} size={32} cells={[<strong style={{ fontFamily: mono, fontSize: 30 }}>Directory</strong>, <strong>它在哪個資料夾工作</strong>]} />
        <TRow cols="240px 1fr" cells={[<span style={{ fontFamily: mono, fontSize: 25, color: faint }}>Model</span>, <span style={{ color: faint }}>用哪個模型</span>]} />
        <TRow cols="240px 1fr" cells={[<span style={{ fontFamily: mono, fontSize: 25, color: faint }}>Permissions</span>, <span style={{ color: faint }}>能做哪些事</span>]} />
        <TRow cols="240px 1fr" cells={[<span style={{ fontFamily: mono, fontSize: 25, color: faint }}>Session</span>, <span style={{ color: faint }}>這次協作的編號</span>]} />
      </Table>
    </div>
  </Shell>
);


// One line of a prompt, tagged with which of the three things it tells the AI.
const PromptLine = ({ tag, size = 28, children }: { tag: string; size?: number; children: React.ReactNode }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: size, lineHeight: 1.5 }}>
    <span style={{ background: amber, color: '#FFFFFF', fontSize: 23, fontWeight: 600, padding: '2px 0', width: 124, textAlign: 'center', flexShrink: 0 }}>{tag}</span>
    <span>{children}</span>
  </div>
);

// The same request asked two ways. Both prompts first; then A's result; then B's.
const CHOICE_COLS = '660px 1fr';

const PromptChoice: Page = () => (
  <Shell chapter={2}>
    <Eyebrow>現場二選一</Eyebrow>
    <Heading>幫助 AI 理解：完整敘述</Heading>
    <div style={{ marginTop: 20 }}><Lead>三件事寫清楚：定位、期望輸出、限制</Lead></div>
    <div style={{ display: 'grid', gridTemplateColumns: CHOICE_COLS, columnGap: 56, rowGap: 12, marginTop: 34 }}>
      <SmallLabel>A｜你輸入</SmallLabel>
      <SmallLabel>B｜你輸入</SmallLabel>
      <div style={{ background: '#FFFFFF', border: `1px solid ${rule}`, padding: '22px 30px' }}>
        <div style={{ fontSize: 34 }}>「幫我整理三國」</div>
        <div style={{ fontSize: 26, color: quiet, marginTop: 14 }}>三件都沒寫</div>
      </div>
      <div style={{ background: '#FFFFFF', border: `1px solid ${rule}`, borderLeft: `5px solid ${amber}`, padding: '20px 30px', display: 'grid', gap: 8 }}>
        <PromptLine tag="定位">只讀 <Path size={27}>notes/桃園結義.md</Path></PromptLine>
        <PromptLine tag="期望輸出">列出參與人物和他們的關係，每一項附支持的原句</PromptLine>
        <PromptLine tag="限制">先不要改檔案，也不要加入原筆記沒有的事實</PromptLine>
      </div>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: CHOICE_COLS, columnGap: 56, marginTop: 26, alignItems: 'start' }}>
      <Steps>
        <Step duration={STEP_MS}>
          <SmallLabel>↓ A 的 AI 回答（示意）</SmallLabel>
          <div style={{ border: `2px dashed ${faint}`, padding: '18px 28px', marginTop: 12 }}>
            <div style={{ fontSize: 27, lineHeight: 1.5, color: muted }}>《三國演義》寫東漢末年群雄相爭，人物有劉備、曹操、孫權……</div>
            <div style={{ marginTop: 12 }}><StatusLine ok={false}>太廣，沒有出處</StatusLine></div>
          </div>
        </Step>
        <Step duration={STEP_MS}>
          <SmallLabel>↓ B 的 AI 回答（示意）</SmallLabel>
          <div style={{ background: sage, border: `2px solid ${okGreen}`, padding: '18px 28px', marginTop: 12 }}>
            <div style={{ fontSize: 28, lineHeight: 1.5 }}>劉備、關羽、張飛｜結拜兄弟</div>
            <div style={{ fontSize: 27, lineHeight: 1.5, color: muted }}>原句：「劉備、關羽、張飛在桃園結為兄弟。」</div>
            <div style={{ marginTop: 6 }}><StatusLine ok>有原句，查得到</StatusLine></div>
          </div>
        </Step>
      </Steps>
    </div>
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
  <Shell chapter={2} enterChapter>
    <Eyebrow>同一個故事，分成六份短筆記</Eyebrow>
    <Heading>4 個人物、2 件事，共 6 份筆記</Heading>
    <div style={{ marginTop: 20 }}><Lead>線：這個人出現在這件事</Lead></div>
    <Stage top={360}>
      <Figure h={400} label="關羽、張飛、劉備連到桃園結義；劉備、曹操連到煮酒論英雄；劉備同時連到兩件事">
        <g fill="none" stroke={okGreen} strokeWidth="3">
          <DrawPath i={2} d="M190 130 L400 270" />
          <DrawPath i={2} d="M600 130 L480 270" />
          <DrawPath i={2} d="M1420 130 L1250 270" />
        </g>
        <g fill="none" stroke={okGreen} strokeWidth="5">
          <DrawPath i={3} d="M1010 130 L560 270" />
          <DrawPath i={3} d="M1010 130 L1150 270" />
        </g>
        <InG i={0}><NoteFile x={60} y={10} w={260} kind="人物" name="關羽" /></InG>
        <InG i={0}><NoteFile x={470} y={10} w={260} kind="人物" name="張飛" /></InG>
        <InG i={0}><NoteFile x={880} y={10} w={260} kind="人物" name="劉備" stroke="#1C1917" /></InG>
        <InG i={0}><NoteFile x={1290} y={10} w={260} kind="人物" name="曹操" /></InG>
        <InG i={1}><NoteFile x={260} y={270} w={440} kind="事件｜第 1 回" name="桃園結義" tint={sage} stroke={okGreen} /></InG>
        <InG i={1}><NoteFile x={980} y={270} w={440} kind="事件｜第 21 回" name="煮酒論英雄" tint={sage} stroke={okGreen} /></InG>
      </Figure>
    </Stage>
  </Shell>
);

// Practice 1's table, as the AI hands it back: one note per row.
const TABLE_COLS = '160px 300px 240px 1fr';

const TableRow = ({ note, people, relation, quote, top = false }: { note: string; people: string; relation: string; quote: string; top?: boolean }) => (
  <div style={{ display: 'grid', gridTemplateColumns: TABLE_COLS, alignItems: 'center', minHeight: 64, background: '#FFFFFF', border: `1px solid ${rule}`, borderTop: top ? `1px solid ${rule}` : 'none', fontSize: 30 }}>
    <span style={{ paddingLeft: 18, fontWeight: 600 }}>{note}</span>
    <span style={{ paddingLeft: 18 }}>{people}</span>
    <span style={{ paddingLeft: 18 }}>{relation}</span>
    <span style={{ paddingLeft: 18, color: muted }}>{quote}</span>
  </div>
);

const TableHead = () => (
  <div style={{ display: 'grid', gridTemplateColumns: TABLE_COLS, background: raised, fontSize: 26, fontWeight: 600, color: muted, height: 54, alignItems: 'center', border: `1px solid ${rule}`, borderBottom: 'none' }}>
    <span style={{ paddingLeft: 18 }}>筆記</span><span style={{ paddingLeft: 18 }}>人物</span><span style={{ paddingLeft: 18 }}>關係</span><span style={{ paddingLeft: 18, color: amber }}>原句</span>
  </div>
);

const ScanTask: Page = () => (
  <Shell chapter={2}>
    <PracticeEyebrow time="5 分鐘" promptRef="練習 1">練習 1｜讀筆記</PracticeEyebrow>
    <Heading>統整筆記內容</Heading>
    <PillRow>
      <Pill tag="定位">notes/ 六份筆記</Pill>
      <Pill tag="期望輸出">四欄關係表</Pill>
      <Pill tag="限制">不改檔案</Pill>
    </PillRow>
    <Stage top={380}>
    <Steps>
      <Step duration={STEP_MS}>
        <div><SmallLabel>AI 交回的表（節錄）</SmallLabel></div>
        <div style={{ marginTop: 10 }}><TableHead /></div>
        <TableRow top note="關羽" people="關羽、劉備、張飛" relation="結為兄弟" quote="「關羽和劉備、張飛在桃園結為兄弟。」" />
      </Step>
      <Step duration={STEP_MS}>
        <TableRow note="張飛" people="張飛、劉備、關羽" relation="結為兄弟" quote="「張飛和劉備、關羽在桃園結為兄弟。」" />
      </Step>
      <Step duration={STEP_MS}>
        <TableRow note="曹操" people="曹操、劉備" relation="談論誰是英雄" quote="「曹操與劉備在煮酒論英雄的情節中談論誰是英雄。」" />
        <div style={{ height: 54, display: 'flex', alignItems: 'center', paddingLeft: 18, fontSize: 26, color: quiet, background: '#FFFFFF', border: `1px solid ${rule}`, borderTop: 'none' }}>……共六列</div>
      </Step>
    </Steps>
    </Stage>
  </Shell>
);

// Checking one row of the table against its note, one beat at a time. The highlighted copy of
// the note sits exactly over the plain one, so the mark lands on the quoted sentence itself.
const NOTE_LINE_H = 50;
const NoteLine = ({ children, size = 30, color = 'var(--osd-text)', weight = 400 }: { children: React.ReactNode; size?: number; color?: string; weight?: number }) => (
  <div style={{ height: NOTE_LINE_H, display: 'flex', alignItems: 'center', fontSize: size, color, fontWeight: weight, whiteSpace: 'nowrap' }}>{children}</div>
);

const GuanYuNote = ({ marked = false }: { marked?: boolean }) => (
  <div className={marked ? 'atl-still' : undefined} style={{ position: 'absolute', left: 0, top: 0, width: 980, height: 390, boxSizing: 'border-box', background: '#FFFFFF', border: `1px solid ${rule}` }}>
    <div style={{ height: 50, display: 'flex', alignItems: 'center', padding: '0 24px', background: raised, fontFamily: mono, fontSize: 26, color: muted }}>notes/關羽.md（節錄）</div>
    <div style={{ padding: '18px 32px' }}>
      <NoteLine size={34} weight={600}># 關羽</NoteLine>
      <NoteLine weight={600}>## 這份筆記記什麼？</NoteLine>
      <NoteLine><span className={marked ? 'atl-mark' : undefined}>關羽和劉備、張飛在桃園結為兄弟。</span>這是一段結義情節。</NoteLine>
      <NoteLine color={quiet}>⋯</NoteLine>
      <NoteLine weight={600}>## 來源</NoteLine>
      <NoteLine color={muted}>- 《三國演義》第 1 回</NoteLine>
    </div>
  </div>
);

const ScanOutput: Page = () => (
  <Shell chapter={2}>
    <Eyebrow>練習 1｜檢查結果</Eyebrow>
    <Heading>RAG 讓每一列都找得回原句</Heading>
    <div style={{ marginTop: 20 }}><Lead>資料先放進輸入，答案才有出處</Lead></div>
    <div style={{ marginTop: 28 }}><SmallLabel>AI 表格裡的一列</SmallLabel></div>
    <div style={{ marginTop: 10 }}><TableRow top note="關羽" people="關羽、劉備、張飛" relation="結為兄弟" quote="「關羽和劉備、張飛在桃園結為兄弟。」" /></div>
    <div style={{ position: 'relative', height: 390, marginTop: 28 }}>
      <Steps>
        <Step duration={STEP_MS}>
          <GuanYuNote />
          <div style={{ position: 'absolute', left: 1040, top: 14 }}><NumLine n="1" size={34}>打開 <Path size={32}>notes/關羽.md</Path></NumLine></div>
        </Step>
        <Step duration={STEP_MS}>
          <GuanYuNote marked />
          <div style={{ position: 'absolute', left: 1040, top: 112 }}><NumLine n="2" size={34}>找到同一句</NumLine></div>
        </Step>
        <Step duration={STEP_MS}>
          <div style={{ position: 'absolute', left: 1040, top: 210 }}><NumLine n="3" size={34}>一樣，打勾</NumLine></div>
          <svg className="atl-stamp" viewBox="0 0 60 60" style={{ position: 'absolute', left: 1350, top: 190, width: 72, height: 72 }} aria-hidden="true"><circle cx="30" cy="30" r="28" fill={okGreen} /><TickMark x={30} y={31} size={28} color="#FFFFFF" /></svg>
          <div style={{ position: 'absolute', left: 1040, top: 320, fontSize: 36, color: amber, fontWeight: 600 }}>換你挑一列試試</div>
        </Step>
      </Steps>
    </div>
  </Shell>
);

// ---------- 03 練習 2：打草稿 → 逐行找原句 → 刪掉再存 ----------

// The prepared teaching draft (prompts.md 練習 2-1). Fixed geometry so the pen circle (p16) and
// the strike-through (p18) land exactly on the 盟友 line.
const DRAFT_LINE_H = 64;
const DRAFT_TOP = 28 + 44;
const DRAFT_LINES = ['煮酒論英雄（第 21 回）', '├─ 參與人物：劉備、曹操', '├─ 人物關係：兩人談論誰是英雄', '├─ 來源回目：第 21 回', '└─ 人物關係：兩人是盟友'];

const DraftLine = ({ children }: { children: React.ReactNode }) => (
  <div style={{ height: DRAFT_LINE_H, display: 'flex', alignItems: 'center', whiteSpace: 'nowrap' }}>{children}</div>
);

const DRAFT_W = 880;
const DRAFT_H = DRAFT_TOP + 5 * DRAFT_LINE_H + 28;

const DraftCard = () => (
  <div style={{ position: 'absolute', left: 0, top: 0, width: DRAFT_W, height: DRAFT_H, boxSizing: 'border-box', background: surface, padding: '28px 36px' }}>
    <div style={{ fontSize: 28, color: quiet, height: 44 }}>草稿</div>
    <div style={{ fontFamily: mono, fontSize: 36 }}>
      <DraftLine>{DRAFT_LINES[0]}</DraftLine>
      <DraftLine>{DRAFT_LINES[1]}</DraftLine>
      <DraftLine>{DRAFT_LINES[2]}</DraftLine>
      <DraftLine>{DRAFT_LINES[3]}</DraftLine>
      <DraftLine>{DRAFT_LINES[4]}</DraftLine>
    </div>
  </div>
);

// The 盟友 line sits at this y inside the card.
const MENGYOU_Y = DRAFT_TOP + 4 * DRAFT_LINE_H + DRAFT_LINE_H / 2;

const Practice2Draft: Page = () => (
  <Shell chapter={3} enterChapter>
    <PracticeEyebrow time="5 分鐘" promptRef="練習 2-1">練習 2｜打草稿</PracticeEyebrow>
    <Heading>草稿裡，哪一行是多的？</Heading>
    <Stage top={290}>
    <div style={{ position: 'relative', height: DRAFT_H }}>
      <DraftCard />
      <div style={{ position: 'absolute', left: DRAFT_W + 48, top: 0, right: 0, height: DRAFT_H, boxSizing: 'border-box', background: '#FFFFFF', border: `1px solid ${rule}` }}>
        <div style={{ height: 58, display: 'flex', alignItems: 'center', padding: '0 26px', background: raised, fontFamily: mono, fontSize: 26, color: muted }}>notes/煮酒論英雄.md（節錄）</div>
        <div style={{ padding: '28px 34px' }}>
          <div style={{ fontSize: 30, fontWeight: 600 }}>## 發生了什麼？</div>
          <div style={{ fontSize: 34, lineHeight: 1.5, marginTop: 12 }}>曹操與劉備在煮酒論英雄的情節中談論誰是英雄。</div>
          <div style={{ fontSize: 30, fontWeight: 600, marginTop: 28 }}>## 參與人物</div>
          <div style={{ fontSize: 34, marginTop: 12 }}>曹操、劉備</div>
        </div>
      </div>
      <Steps>
        <Step duration={STEP_MS}>
          <svg className="atl-still" viewBox={`0 0 ${DRAFT_W} ${DRAFT_H}`} style={{ position: 'absolute', left: 0, top: 0, width: DRAFT_W, height: DRAFT_H, overflow: 'visible' }} aria-hidden="true">
            <g fill="none" stroke={amber} strokeWidth="6" strokeLinecap="round"><StepPath d={`M16 ${MENGYOU_Y + 4} C16 ${MENGYOU_Y - 50} 488 ${MENGYOU_Y - 52} 488 ${MENGYOU_Y - 2} C488 ${MENGYOU_Y + 48} 34 ${MENGYOU_Y + 52} 24 ${MENGYOU_Y - 8}`} /></g>
            <text x="520" y={MENGYOU_Y + 15} fontSize="44" fontWeight="700" fill={amber}>原文沒有</text>
          </svg>
        </Step>
      </Steps>
    </div>
    </Stage>
  </Shell>
);

// One draft line checked against the note: the line, the sentence that backs it, the result.
const CHECK_COLS = '500px 1fr 120px';

const CheckMark = ({ ok }: { ok: boolean }) => (
  <svg className="atl-stamp" viewBox="0 0 44 44" style={{ width: 50, height: 50, display: 'block' }} aria-hidden="true">
    <circle cx="22" cy="22" r="21" fill={ok ? okGreen : amber} />
    {ok ? <TickMark x={22} y={23} size={22} color="#FFFFFF" /> : <CrossMark x={22} y={22} size={16} color="#FFFFFF" />}
  </svg>
);

const DraftCheckRow = ({ line, quote, ok }: { line: string; quote: string; ok: boolean }) => (
  <div style={{ display: 'grid', gridTemplateColumns: CHECK_COLS, alignItems: 'center', minHeight: 80, background: ok ? '#FFFFFF' : amberSoft, border: `1px solid ${rule}`, borderTop: 'none', fontSize: 30 }}>
    <span style={{ paddingLeft: 22, fontFamily: mono, fontSize: 30 }}>{line}</span>
    <span style={{ paddingLeft: 20, color: ok ? muted : amber, fontWeight: ok ? 400 : 600 }}>{quote}</span>
    <span style={{ display: 'grid', placeItems: 'center' }}><CheckMark ok={ok} /></span>
  </div>
);

const Practice2Check: Page = () => (
  <Shell chapter={3}>
    <PracticeEyebrow time="7 分鐘" promptRef="練習 2-2">練習 2｜逐行找原句</PracticeEyebrow>
    <Heading>請 AI 每行附上原句</Heading>
    <PillRow>
      <Pill tag="定位">煮酒論英雄.md</Pill>
      <Pill tag="期望輸出">每行附原句</Pill>
      <Pill tag="限制">不改檔案</Pill>
    </PillRow>
    <Stage top={380}>
    <Steps>
      <Step duration={STEP_MS}>
        <div style={{ display: 'grid', gridTemplateColumns: CHECK_COLS, background: raised, fontSize: 26, fontWeight: 600, color: muted, height: 56, alignItems: 'center', border: `1px solid ${rule}` }}>
          <span style={{ paddingLeft: 20 }}>草稿的那一行</span><span style={{ paddingLeft: 20 }}>筆記原句</span><span style={{ textAlign: 'center' }}>結果</span>
        </div>
        <DraftCheckRow line="參與人物：劉備、曹操" quote="「曹操與劉備在煮酒論英雄的情節中談論誰是英雄。」" ok />
      </Step>
      <Step duration={STEP_MS}><DraftCheckRow line="人物關係：兩人談論誰是英雄" quote="「曹操與劉備在煮酒論英雄的情節中談論誰是英雄。」" ok /></Step>
      <Step duration={STEP_MS}><DraftCheckRow line="來源回目：第 21 回" quote="「這段情節位於小說第 21 回……」" ok /></Step>
      <Step duration={STEP_MS}><DraftCheckRow line="人物關係：兩人是盟友" quote="找不到" ok={false} /></Step>
      <Step duration={STEP_MS}><div style={{ marginTop: 36, fontSize: 42 }}><strong style={{ color: amber }}>找不到原句，就刪。</strong><span style={{ color: muted, fontSize: 36 }}>RAG 給資料，查證靠你</span></div></Step>
    </Steps>
    </Stage>
  </Shell>
);

const Practice2Save: Page = () => (
  <Shell chapter={3}>
    <PracticeEyebrow time="3 分鐘" promptRef="練習 2-3">練習 2｜存檔</PracticeEyebrow>
    <Heading>刪掉那行，再存檔</Heading>
    <PillRow>
      <Pill tag="定位">剛才的草稿</Pill>
      <Pill tag="期望輸出">刪掉盟友後存檔</Pill>
      <Pill tag="限制">不改 notes/</Pill>
    </PillRow>
    <Stage top={380}>
    <div style={{ position: 'relative', height: DRAFT_H }}>
      <DraftCard />
      <Steps>
        <Step duration={STEP_MS}>
          <div className="atl-still" style={{ position: 'absolute', left: 28, top: DRAFT_TOP + 4 * DRAFT_LINE_H, width: 470, height: DRAFT_LINE_H, background: 'rgba(245, 245, 244, 0.72)' }}>
            <div className="atl-strike" style={{ position: 'absolute', left: 0, right: 0, top: DRAFT_LINE_H / 2 - 4, height: 8, background: amber }} />
          </div>
        </Step>
        <Step duration={STEP_MS}>
          <div style={{ position: 'absolute', left: DRAFT_W + 72, top: 0, right: 0, height: DRAFT_H, display: 'grid', alignContent: 'center', justifyItems: 'start', gap: 22 }}>
            <Icon kind="doc" size={160} />
            <div style={{ fontFamily: mono, fontSize: 34, lineHeight: 1.45 }}>outputs/<br />煮酒論英雄-草稿.md</div>
            <div className="atl-stamp" style={{ display: 'inline-flex', alignItems: 'center', gap: 16, background: sage, border: `2px solid ${okGreen}`, padding: '12px 26px', fontSize: 38, fontWeight: 600, color: okGreen }}><Icon kind="ok" size={48} color={okGreen} />每行都有原句</div>
          </div>
        </Step>
      </Steps>
    </div>
    </Stage>
  </Shell>
);

// One step of the practice-3 flow: an icon and at most a few words.
const FlowStep = ({ i, kind, label, hot = false }: { i: number; kind: 'doc' | 'chat' | 'ok' | 'save' | 'browser'; label: string; hot?: boolean }) => (
  <In i={i} style={{ display: 'grid', justifyItems: 'center', gap: 18, width: 240 }}>
    <div style={{ width: 170, height: 170, display: 'grid', placeItems: 'center', background: hot ? amberSoft : '#FFFFFF', border: `2px solid ${hot ? amber : rule}` }}><Icon kind={kind} size={104} color={hot ? amber : '#1C1917'} /></div>
    <div style={{ fontSize: 34, fontWeight: 600 }}>{label}</div>
  </In>
);
// Arrows land between the steps they join, so the flow reads left to right in order.
const FlowArrow = ({ i }: { i: number }) => <In i={i} style={{ color: faint, fontSize: 56, lineHeight: 1, marginTop: 56 }}>→</In>;

const DiagramTask: Page = () => (
  <Shell chapter={4} enterChapter>
    <PracticeEyebrow time="13 分鐘製作＋7 分鐘核對" promptRef="練習 3">練習 3｜必做關係圖</PracticeEyebrow>
    <Heading>把核對過的關係畫成知識圖</Heading>
    <Stage top={290}>
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
      <FlowStep i={0} kind="doc" label="讀筆記" />
      <FlowArrow i={1} />
      <FlowStep i={2} kind="chat" label="它提設計" />
      <FlowArrow i={3} />
      <FlowStep i={4} kind="ok" label="你說可以" hot />
      <FlowArrow i={5} />
      <FlowStep i={6} kind="save" label="存檔" />
      <FlowArrow i={7} />
      <FlowStep i={8} kind="browser" label="打開" />
    </div>
    <Steps>
      <Step duration={STEP_MS}>
        <PillRow marginTop={72} center>
          <Pill tag="定位" size={32}>筆記＋草稿</Pill>
          <Pill tag="期望輸出" size={32}>HTML 知識圖</Pill>
          <Pill tag="限制" size={32}>只畫有原句的線</Pill>
        </PillRow>
        <div style={{ fontSize: 34, marginTop: 30, textAlign: 'center' }}><strong>檢查：</strong>劉備只畫一次，曹操不接桃園</div>
      </Step>
    </Steps>
    </Stage>
  </Shell>
);

// The check page's graph height; the highlight layer above it uses the same numbers.
const CHECK_GRAPH_H = 440;

const DiagramCheck: Page = () => (
  <Shell chapter={4}>
    <Eyebrow>練習 3｜打開 HTML，逐線檢查</Eyebrow>
    <Heading>每條線都說得出出處</Heading>
    <div style={{ marginTop: 18 }}><SmallLabel>diagrams/三國故事.html（示意）</SmallLabel></div>
    <div style={{ position: 'relative', marginTop: 10 }}>
      <LargeStoryGraph height={CHECK_GRAPH_H} prebuilt />
      <Steps>
        <Step duration={STEP_MS}>
          <div className="atl-still" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: CHECK_GRAPH_H + 2, boxSizing: 'border-box', border: '1px solid transparent', pointerEvents: 'none' }}>
            <svg viewBox="0 0 1600 500" style={{ width: '100%', height: CHECK_GRAPH_H - 10, position: 'absolute', inset: 0 }} aria-hidden="true">
              <g fill="none" stroke={okGreen} strokeWidth="13" strokeLinecap="round"><StepPath d="M870 147 C910 235 1000 270 1050 320" /></g>
              <LineTag x={960} y={250} text="參與對話" />
            </svg>
          </div>
          <div className="atl-build" style={{ ...buildDelay(4), display: 'grid', gridTemplateColumns: '440px 1fr', gap: 30, marginTop: 20, background: sage, padding: '20px 28px' }}>
            <div><div style={{ fontSize: 34, fontWeight: 600 }}>劉備 → 煮酒論英雄</div><div style={{ fontSize: 30, marginTop: 12 }}>線的意思：參與對話</div></div>
            <div><div style={{ fontSize: 27, color: muted }}>來源：notes/煮酒論英雄.md｜第 21 回</div><div style={{ fontSize: 31, lineHeight: 1.5, marginTop: 10 }}>「曹操與劉備在煮酒論英雄的情節中談論誰是英雄」</div></div>
          </div>
        </Step>
      </Steps>
    </div>
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
    <Eyebrow>附錄｜先完成關係圖再做</Eyebrow>
    <Heading>加分練習：把兩件事排成時間軸</Heading>
    <div style={{ marginTop: 48, background: '#FFFFFF', border: `1px solid ${rule}`, padding: '30px 44px' }}>
      <SmallLabel>依小說回目排列，不是歷史年份；間距不代表時間長短</SmallLabel>
      <div style={{ position: 'relative', height: 290, marginTop: 16 }}>
        <Steps>
          <svg viewBox="0 0 1542 290" style={TIMELINE_BOX} role="img" aria-label="回目時間軸：第 1 回桃園結義，劉備、關羽、張飛">
            <line x1="20" y1="232" x2="1500" y2="232" stroke={faint} strokeWidth="3" />
            <polygon points="1520,232 1504,224 1504,240" fill={faint} />
            <text x="1520" y="280" textAnchor="end" fontSize="24" fill={quiet}>小說回目 →</text>
            <TimelineCard x={160} chapter="先｜第 1 回" title="桃園結義" color={okGreen} tint={sage}><tspan fontWeight="700">劉備</tspan>、關羽、張飛</TimelineCard>
          </svg>
          <Step duration={STEP_MS}><svg viewBox="0 0 1542 290" style={TIMELINE_BOX} role="img" aria-label="第 21 回煮酒論英雄，曹操、劉備">
            <TimelineCard x={980} chapter="後｜第 21 回" title="煮酒論英雄" color={okGreen} tint={sage}>曹操、<tspan fontWeight="700">劉備</tspan></TimelineCard>
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
  <div style={{ background: '#FFFFFF', border: `1px solid ${rule}`, borderTop: `4px solid ${amber}`, padding: '40px 36px' }}>
    <div style={{ fontFamily: mono, fontSize: 25, color: quiet }}>{path}</div>
    <div style={{ fontSize: 52, fontWeight: 600, marginTop: 18 }}>{title}</div>
    <div style={{ fontSize: 32, color: muted, marginTop: 12 }}>{detail}</div>
  </div>
);

const Wrapup: Page = () => (
  <Shell>
    <Eyebrow>回顧今天的成果</Eyebrow>
    <Heading>筆記 → 草稿 → 知識圖</Heading>
    <Stage top={320}>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', columnGap: 56, alignItems: 'center' }}>
      <In i={0}><OutputFile path="notes/煮酒論英雄.md" title="原始筆記" detail="發下來的" /></In>
      <In i={1}><ArrowCell gap={56}><OutputFile path="outputs/煮酒論英雄-草稿.md" title="你的草稿" detail="每行有原句" /></ArrowCell></In>
      <In i={2}><ArrowCell gap={56}><OutputFile path="diagrams/三國故事.html" title="你的知識圖" detail="每條線有出處" /></ArrowCell></In>
    </div>
    <Steps>
      <Step duration={STEP_MS}>
        <div style={{ marginTop: 56 }}><SmallLabel>寫在自己的筆記</SmallLabel></div>
        <div style={{ marginTop: 16, display: 'grid', gap: 18 }}>
          <NumLine n="1" size={38}>我查了哪條關係？</NumLine>
          <NumLine n="2" size={38}>哪份筆記、哪一句？</NumLine>
        </div>
      </Step>
      <Step duration={STEP_MS}>
        <div style={{ marginTop: 36, borderTop: `2px solid ${amber}`, paddingTop: 20, fontSize: 44, color: amber }}>每條關係，都回原文找證據</div>
      </Step>
    </Steps>
    </Stage>
  </Shell>
);

// One stop on the "who does it" scale, from AI-first to you-first.
const ShareStop = ({ cx, who, label, title, example, color, tint, round = false }: { cx: number; who: string; label: string; title: string; example: string; color: string; tint: string; round?: boolean }) => (
  <g>
    <text x={cx} y="30" textAnchor="middle" fontSize="30" fontWeight="600" fill={quiet}>{label}</text>
    {round
      ? <circle cx={cx} cy="82" r="38" fill={tint} stroke={color} strokeWidth="2" />
      : <rect x={cx - 95} y="46" width="190" height="72" fill={tint} stroke={color} strokeWidth="2" />}
    <text x={cx} y="94" textAnchor="middle" fontSize="34" fontWeight="600" fill="#1C1917">{who}</text>
    <line x1={cx} y1="116" x2={cx} y2="146" stroke={color} strokeWidth="3" />
    <circle cx={cx} cy="160" r="15" fill={color} stroke="#FFFFFF" strokeWidth="4" />
    <text x={cx} y="252" textAnchor="middle" fontSize="46" fontWeight="600" fill="#1C1917">{title}</text>
    <text x={cx} y="306" textAnchor="middle" fontSize="32" fill={muted}>{example}</text>
  </g>
);

const SHARE_BOX = { width: '100%', height: 330, position: 'absolute', inset: 0 } as const;

const BringBack: Page = () => (
  <Shell>
    <PracticeEyebrow time="3 分鐘">把它帶回教學現場</PracticeEyebrow>
    <Heading>哪些交給 AI，哪些自己查</Heading>
    <Stage top={320}>
    <div style={{ position: 'relative', height: 330 }}>
      <Steps>
        <svg viewBox="0 0 1632 330" style={SHARE_BOX} role="img" aria-label="由 AI 先做到自己確認的分工軸：整理資料交給 AI 先做">
          <defs><linearGradient id="atl-share-bar" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stopColor={okGreen} /><stop offset="1" stopColor={amber} /></linearGradient></defs>
          <rect x="60" y="156" width="1512" height="8" fill="url(#atl-share-bar)" opacity="0.55" />
          <text x="60" y="200" fontSize="26" fill={quiet}>AI 做得多</text>
          <text x="1572" y="200" textAnchor="end" fontSize="26" fill={quiet}>你把關得多</text>
          <ShareStop cx={272} who="AI" label="AI 可以先做" title="整理資料" example="把筆記整理成表" color={okGreen} tint={sage} />
        </svg>
        <Step duration={STEP_MS}><svg viewBox="0 0 1632 330" style={SHARE_BOX} role="img" aria-label="和 AI 一起調整：排知識圖版面">
          <ShareStop cx={816} who="AI＋你" label="和 AI 一起調整" title="排知識圖版面" example="調整位置與連線" color={faint} tint={surface} />
        </svg></Step>
        <Step duration={STEP_MS}><svg viewBox="0 0 1632 330" style={SHARE_BOX} role="img" aria-label="一定要自己確認：回原文查證">
          <ShareStop cx={1360} who="你" label="一定要自己確認" title="回原文查證" example="核對原句與回目" color={amber} tint={amberSoft} round />
        </svg></Step>
      </Steps>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 200px', gap: 64, alignItems: 'center', marginTop: 40 }}>
      <div>
        <div style={{ fontSize: 46, fontWeight: 600, color: amber }}>換你：幫自己的教材寫一句提示詞</div>
        <div style={{ fontSize: 30, lineHeight: 1.6, marginTop: 24, color: muted }}>下一篇｜Obsidian：把人物、事件存成互相連結的知識卡</div>
      </div>
      <div style={{ textAlign: 'center' }}><img src={repoQr} alt="課程 GitHub 資料夾 QR code" style={{ width: 180, height: 180, display: 'block', margin: '0 auto' }} /><div style={{ fontSize: 24, color: muted, marginTop: 8 }}>課程 GitHub</div></div>
    </div>
    </Stage>
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

// "Go check this one in the textbook" — a neutral mark, not the amber "?" for missing evidence.
const CheckSpot = ({ x, y }: { x: number; y: number }) => (
  <g><circle cx={x} cy={y} r="19" fill="#FFFFFF" stroke="#1C1917" strokeWidth="2.5" /><text x={x} y={y + 9} textAnchor="middle" fontSize="24" fontWeight="700" fill="#1C1917">查</text></g>
);

const AskMark = ({ x, y }: { x: number; y: number }) => (
  <g><circle cx={x} cy={y} r="18" fill={amber} /><text x={x} y={y + 9} textAnchor="middle" fontSize="26" fontWeight="700" fill="#FFFFFF">?</text></g>
);

const TeacherTransfer: Page = () => (
  <Shell chapter={1}>
    <Eyebrow>知識概念的基本觀念，就是點與線</Eyebrow>
    <Heading>知識圖 (Knowledge Graph)</Heading>
    <div style={{ marginTop: 20 }}><Lead>每一科都能畫成點和線；標「查」的線，要回課本找出處</Lead></div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 36, marginTop: 28 }}>
      <Steps>
        <MiniMap label="國文｜三國故事" caption="人物和事件怎麼連起來" alt="劉備和關羽都連到桃園結義，關羽那條線標「查」">
          <path d="M100 86 L196 136" stroke={okGreen} strokeWidth="3" />
          <path d="M364 86 L268 136" stroke={okGreen} strokeWidth="4" />
          <MapPerson x={70} y={52} name="劉備" />
          <MapPerson x={394} y={52} name="關羽" />
          <MapBox x={152} y={136} w={160} label="桃園結義" fill={sage} stroke={okGreen} />
          <CheckSpot x={316} y={111} />
        </MiniMap>
        <Step duration={STEP_MS}>
          <MiniMap label="歷史｜一個單元" caption="事件的前因後果" alt="原因、事件、結果三格相連，事件到結果的箭頭標「查」">
            <MapBox x={0} y={96} label="原因" />
            <MapBox x={172} y={96} label="事件" fill={sage} stroke={okGreen} />
            <MapBox x={344} y={96} label="結果" />
            <MapArrow x1={124} x2={168} y={126} />
            <MapArrow x1={296} x2={340} y={126} />
            <CheckSpot x={318} y={70} />
          </MiniMap>
        </Step>
        <Step duration={STEP_MS}>
          <MiniMap label="自然｜課本概念" caption="誰吃誰，能量往哪裡走" alt="草、兔子、老鷹的食物鏈，兔子到老鷹的箭頭標「查」">
            <MapBox x={0} y={96} label="草" fill={sage} stroke={okGreen} />
            <MapBox x={172} y={96} label="兔子" fill={sage} stroke={okGreen} />
            <MapBox x={344} y={96} label="老鷹" fill={sage} stroke={okGreen} />
            <MapArrow x1={124} x2={168} y={126} />
            <MapArrow x1={296} x2={340} y={126} />
            <CheckSpot x={318} y={70} />
          </MiniMap>
        </Step>
      </Steps>
    </div>
    <Steps>
      <Step duration={STEP_MS}>
        <div>
          <svg viewBox="0 0 1632 40" style={{ display: 'block', width: 1632, height: 40 }} aria-hidden="true">
            <g fill="none" stroke={amber} strokeWidth="3" strokeDasharray="8 8"><path d="M260 0 C260 25 700 19 760 40" /><path d="M816 0 V40" /><path d="M1372 0 C1372 25 932 19 872 40" /></g>
          </svg>
          <div style={{ width: 1040, margin: '0 auto', boxSizing: 'border-box', border: `2px solid ${amber}`, background: amberSoft, padding: '18px 40px', textAlign: 'center' }}>
            <div style={{ fontSize: 44, lineHeight: 1.35, color: amber, fontWeight: 600 }}>先找點，再畫線</div>
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
    <DocShape x={x} y={64} w={96} h={104} />
    <title>{name}</title>
  </g>
);

// An empty sub-folder the practice will write into.
const SubFolder = ({ x, name, note }: { x: number; name: string; note: string }) => (
  <g>
    <path d={`M${x} 82 V68 H${x + 58} L${x + 70} 82 H${x + 150} V168 H${x} Z`} fill={surface} stroke={faint} strokeWidth="2" />
    <text x={x + 75} y={203} textAnchor="middle" fontSize="24" fontFamily={mono} fill="#1C1917">{name}</text>
    <text x={x + 75} y={232} textAnchor="middle" fontSize="24" fill={muted}>{note}</text>
  </g>
);

// One row of the folder tree: the tree branch, the name, and an optional note.
const TreeRow = ({ i, branch, name, note, dim = false }: { i: number; branch: string; name: string; note?: string; dim?: boolean }) => (
  <In i={i} style={{ display: 'flex', alignItems: 'baseline', fontFamily: mono, fontSize: 32, lineHeight: 1.75, whiteSpace: 'pre' }}>
    <span style={{ color: faint }}>{branch}</span>
    <span style={{ color: dim ? muted : 'var(--osd-text)', fontWeight: dim ? 400 : 600 }}>{name}</span>
    {note ? <span style={{ fontFamily: 'var(--osd-font-body)', fontSize: 28, color: amber, marginLeft: 24 }}>← {note}</span> : null}
  </In>
);

const ReadyDesk: Page = () => (
  <Shell chapter={1}>
    <Eyebrow>準備開始操作</Eyebrow>
    <Heading>下載練習資料夾</Heading>
    <div style={{ marginTop: 20 }}><Lead>電腦打網址：<span style={{ fontFamily: mono, color: 'var(--osd-text)' }}>github.com/Chrouos/AI-workshop-slides</span></Lead></div>
    <Stage top={330}>
      <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: 64, alignItems: 'center' }}>
        <In i={0} style={{ background: amberSoft, borderTop: `5px solid ${amber}`, padding: '24px 26px 28px', textAlign: 'center' }}>
          <div style={{ fontSize: 30, fontWeight: 600 }}>掃碼下載</div>
          <a href={LAB_ZIP_URL} target="_blank" rel="noreferrer" aria-label="開啟 GitHub 上的練習資料夾 ZIP">
            <img src={labQr} alt="練習資料夾 ZIP 的 GitHub 下載 QR code" style={{ width: 270, height: 270, display: 'block', margin: '14px auto 0' }} />
          </a>
          <a href={labZip} download="teacher-learning-lab.zip" style={{ display: 'inline-block', marginTop: 18, padding: '10px 24px', background: amber, color: '#FFFFFF', fontSize: 28, fontWeight: 600, textDecoration: 'none' }}>或按這裡下載 ZIP ↓</a>
        </In>
        <div>
          <div style={{ background: '#FFFFFF', border: `1px solid ${rule}`, padding: '28px 40px' }}>
            <TreeRow i={1} branch="" name="teacher-learning-lab/" />
            <TreeRow i={2} branch="├─ " name="notes/" />
            <TreeRow i={2} branch="│   ├─ " name="劉備.md　關羽.md　張飛.md　曹操.md" dim />
            <TreeRow i={2} branch="│   └─ " name="桃園結義.md　煮酒論英雄.md" dim />
            <TreeRow i={3} branch="├─ " name="prompts.md" note="課堂提示詞" />
            <TreeRow i={4} branch="├─ " name="outputs/" note="練習 2 存這裡" />
            <TreeRow i={4} branch="└─ " name="diagrams/" note="練習 3 存這裡" />
          </div>
          <In i={5} style={{ fontSize: 32, marginTop: 22 }}><strong>打開後要看到 notes/</strong></In>
        </div>
      </div>
    </Stage>
  </Shell>
);

// Opening Codex inside the practice folder, then one harmless prompt to prove it sees the notes.
const OpenCodex: Page = () => (
  <Shell chapter={1}>
    <Eyebrow>準備開始操作</Eyebrow>
    <Heading>在練習資料夾打開 Codex</Heading>
    <Stage top={290}>
    <div style={{ display: 'grid', gridTemplateColumns: '600px 1fr', gap: 48, alignItems: 'center' }}>
      <div style={{ display: 'grid', gap: 54 }}>
        <In i={0}><NumLine n="1" size={36}>打開終端機</NumLine></In>
        <In i={1}><NumLine n="2" size={36}>打 cd 和空格，拖進資料夾</NumLine></In>
        <In i={2}><NumLine n="3" size={36}>打 codex</NumLine></In>
        <In i={3}><NumLine n="4" size={36}>請它列出 notes/</NumLine></In>
      </div>
      <Steps><Step duration={STEP_MS}><Terminal title="終端機（示意，路徑依電腦而定）" width={984}>
        <div style={{ fontFamily: mono, fontSize: 31, lineHeight: 1.65, whiteSpace: 'pre' }}><span style={{ color: '#8DD4A0' }}>$</span>{' cd ~/Downloads/teacher-learning-lab\n'}<span style={{ color: '#8DD4A0' }}>$</span>{' codex\n'}<span style={{ color: '#E9B650' }}>{'> 列出 notes/ 裡的檔案，先不要修改任何檔案\n'}</span><span style={{ color: '#BCC3CC' }}>{'notes/ 裡有六份筆記和一份 README：\n'}</span>{'劉備.md　關羽.md　張飛.md　曹操.md\n桃園結義.md　煮酒論英雄.md　README.md'}</div>
      </Terminal></Step></Steps>
    </div>
    <In i={5} style={{ background: surface, padding: '20px 34px', marginTop: 44, fontSize: 32 }}><strong>沒有 Plus 方案？</strong>三條路，見附錄第 25 頁</In>
    </Stage>
  </Shell>
);

// One first-run screen of Codex: when it shows up, what it says, what to pick. Text from Codex 0.154.
const FirstRunCard = ({ when, screen, pick }: { when: string; screen: string; pick: string }) => (
  <div style={{ background: '#FFFFFF', border: `1px solid ${rule}`, height: '100%', boxSizing: 'border-box', padding: '26px 26px 30px' }}>
    <div style={{ fontSize: 30, fontWeight: 600, color: 'var(--osd-accent)' }}>{when}</div>
    <div style={{ marginTop: 18, background: '#1F2226', color: '#F5F5F4', padding: '26px 26px', fontFamily: mono, fontSize: 32, lineHeight: 1.45, minHeight: 250, boxSizing: 'border-box' }}>{screen}</div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 24, background: sage, border: `2px solid ${okGreen}`, padding: '14px 18px' }}><Icon kind="ok" size={44} color={okGreen} /><span style={{ fontFamily: mono, fontSize: 30, fontWeight: 700 }}>{pick}</span></div>
  </div>
);

const FirstRun: Page = () => (
  <Shell chapter={1}>
    <Eyebrow>準備開始操作｜第一次啟動（畫面為示意）</Eyebrow>
    <Heading>第一次開 Codex 的三個畫面</Heading>
    <Stage top={290}>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32, alignItems: 'stretch' }}>
      <Steps>
        <FirstRunCard when="1｜登入" screen="Choose how you want to use Codex." pick="Sign in with ChatGPT" />
        <Step duration={STEP_MS}><FirstRunCard when="2｜信任資料夾" screen="Do you trust the contents of this directory?" pick="Yes, continue" /></Step>
        <Step duration={STEP_MS}><FirstRunCard when="3｜寫檔前" screen="Would you like to make the following edits?" pick="Yes, proceed" /></Step>
      </Steps>
    </div>
    <div style={{ fontSize: 28, color: muted, marginTop: 32 }}>卡住了？翻附錄第 23 頁</div>
    </Stage>
  </Shell>
);

// One appendix entry: when you'd need it, what it gives you, which page.
const AppendixRow = ({ kind, when, fix, page }: { kind: 'down' | 'chat' | 'search' | 'timeline' | 'save'; when: string; fix: string; page: number }) => (
  <div style={{ display: 'grid', gridTemplateColumns: '96px 380px 1fr 160px', alignItems: 'center', minHeight: 108, borderBottom: `1px solid ${rule}` }}>
    <Icon kind={kind} size={60} color={amber} />
    <span style={{ fontSize: 36, fontWeight: 600 }}>{when}</span>
    <span style={{ fontSize: 34, color: muted }}>{fix}</span>
    <span style={{ fontSize: 34, color: amber, textAlign: 'right' }}>第 {page} 頁</span>
  </div>
);

const Appendix: Page = () => (
  <Shell>
    <Eyebrow>附錄</Eyebrow>
    <Heading>附錄：練習</Heading>
    <Stage top={300}>
      <div style={{ borderTop: `2px solid ${rule}` }}>
        <In i={0}><AppendixRow kind="down" when="下載資料夾" fix="掃 QR 或下載 ZIP" page={9} /></In>
        <In i={1}><AppendixRow kind="save" when="安裝 Codex" fix="Node.js、npm、codex 四步" page={24} /></In>
        <In i={2}><AppendixRow kind="chat" when="沒有 Plus 方案" fix="ChatGPT、OpenRouter、Ollama" page={25} /></In>
        <In i={3}><AppendixRow kind="search" when="Codex 開錯資料夾" fix="輸入 /status 檢查" page={26} /></In>
        <In i={4}><AppendixRow kind="timeline" when="做完還有時間" fix="加分：排成時間軸" page={27} /></In>
      </div>
    </Stage>
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

// One install step: what to do, and what to type (or what you should see).
const InstallStep = ({ n, title, lines, note }: { n: string; title: string; lines: string; note?: string }) => (
  <div style={{ background: '#FFFFFF', border: `1px solid ${rule}`, padding: '22px 26px', display: 'grid', alignContent: 'start', gap: 14 }}>
    <NumLine n={n} size={34}><strong>{title}</strong></NumLine>
    <div style={{ background: '#1F2226', color: '#F5F5F4', fontFamily: mono, fontSize: 30, lineHeight: 1.45, padding: '16px 22px', whiteSpace: 'pre' }}>{lines}</div>
    {note ? <div style={{ fontSize: 26, color: muted }}>{note}</div> : null}
  </div>
);

const Prework: Page = () => (
  <Shell>
    <Eyebrow>附錄｜上課前</Eyebrow>
    <Heading>安裝 Codex</Heading>
    <Stage top={290}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28 }}>
        <In i={0}><InstallStep n="1" title="下載 Node.js LTS" lines={'nodejs.org → LTS → 預設安裝'} /></In>
        <In i={1}><InstallStep n="2" title="重開終端機，看版本號" lines={'$ node -v   v24.21.0\n$ npm -v    11.6.2'} /></In>
        <In i={2}><InstallStep n="3" title="安裝 Codex" lines={'$ npm install -g @openai/codex@latest'} /></In>
        <In i={3}><InstallStep n="4" title="啟動、登入" lines={'$ codex\n› Sign in with ChatGPT'} note="Plus 以上方案含 Codex；沒有的看第 25 頁" /></In>
      </div>
      <div style={{ fontSize: 26, color: muted, marginTop: 24 }}>Windows：命令提示字元或 PowerShell｜Mac：終端機</div>
    </Stage>
  </Shell>
);

// One way to do the practices without a ChatGPT Plus plan.
const Route = ({ n, name, need, fits, lines, status, ok, web = false }: { n: string; name: string; need: string; fits: string; lines: string; status: React.ReactNode; ok: boolean; web?: boolean }) => (
  <div style={{ background: '#FFFFFF', border: `1px solid ${rule}`, borderTop: `5px solid ${ok ? okGreen : amber}`, padding: '24px 26px', display: 'grid', alignContent: 'start', gap: 16, height: '100%', boxSizing: 'border-box' }}>
    <NumLine n={n} size={36}><strong>{name}</strong></NumLine>
    <div style={{ fontSize: 28, lineHeight: 1.5 }}><span style={{ color: muted }}>需要：</span>{need}<br /><span style={{ color: muted }}>適合：</span>{fits}</div>
    <div style={web ? { background: surface, border: `1px solid ${rule}`, fontSize: 27, lineHeight: 1.6, padding: '14px 18px', whiteSpace: 'pre' } : { background: '#1F2226', color: '#F5F5F4', fontFamily: mono, fontSize: 26, lineHeight: 1.5, padding: '14px 18px', whiteSpace: 'pre' }}>{lines}</div>
    <div style={{ fontSize: 26, fontWeight: 600, color: ok ? okGreen : amber }}>{status}</div>
  </div>
);

const ChatGPTRoute: Page = () => (
  <Shell>
    <Eyebrow>附錄｜沒有 Plus 方案</Eyebrow>
    <Heading>沒有 Plus 方案？三條路</Heading>
    <Stage top={290}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 28, alignItems: 'stretch' }}>
        <In i={0}><Route n="1" name="ChatGPT 網頁版" need="ChatGPT 帳號" fits="不想裝軟體" lines={'1. 上傳六份筆記\n2. 貼 prompts.md 的提示詞\n3. 存檔改說「給我可下載的檔案」'} status="✓ 課堂備案" ok web /></In>
        <In i={1}><Route n="2" name="OpenRouter" need="API key，按用量付費（有免費模型）" fits="想用 Codex、沒有 Plus" lines={'設定 config.toml\n$ codex'} status="未在課前實測" ok={false} /></In>
        <In i={2}><Route n="3" name="Ollama 本機" need="16GB 電腦、把 context 調到 64K" fits="想離線、資料不出電腦" lines={'$ OLLAMA_CONTEXT_LENGTH=65536 \\\n  ollama serve\n$ codex --oss'} status={<>實測：只做得到練習 1<br />核對、存檔會出錯</>} ok={false} /></In>
      </div>
      <div style={{ fontSize: 26, color: muted, marginTop: 24 }}>設定步驟在 prework.md</div>
    </Stage>
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
  "0:00–0:20。今天只做一件事：把幾份筆記整理成每條關係都能核對的知識圖。先簡單自我介紹，再進故事。",
  "0:20–0:50。我是黃懷萱，中央大學碩士，研究 NLP、LLM 和 RAG；現在在關貿網路做智慧客服，參與 EZ WAY、eHub、TTLL 等服務。今天用大家聽過的三國人物，實際試一次 AI 怎麼讀筆記、核對並畫圖。",
  "0:50–1:40。先問大家：如果有100篇三國筆記，想找劉備跟誰有關，你會怎麼找？請想10秒，舉手說說看。聽兩三個答案後，再按一下帶出：那該怎麼利用AI幫我們讀書？今天先用六份短筆記練習，請AI讀、整理、畫圖。插畫只是小說情境，不能當作關係的證據；證據在筆記和小說原文。",
  "1:40–2:00。只說大方向：今天分四段，每段結束手上多一樣東西。理解任務，帶走一個要查的問題；8到20分讀筆記，做出一張關係表；20到35分查證，留下核對過的草稿；35分以後畫成知識圖，最後5分鐘換成自己的教材想一想。接著用30秒口頭說明：ChatGPT可上傳筆記討論，今天用Codex直接讀練習資料夾並交出圖檔；不再展示比較表。",
  "2:00–2:40。先出現劉備；點一下依序出現其他人物，再點一下接到桃園結義，最後接上煮酒論英雄。每個人物都可以寫成獨立筆記；線要寫清楚是什麼關係。劉備只畫一次，兩段故事接在同一個節點。這堂課的成果是可核對的圖，不是已經建好的完整知識庫。",
  "2:40–3:10。成果圖就是點和線。換到其他科也一樣：國文畫人物和事件；按一下，歷史畫前因後果；再按一下，自然畫草、兔子、老鷹的食物鏈。標「查」的線，是要回課本找出處的地方。綠色的線代表原文有寫；後面看到橘色的問號，才是原文沒寫。再按一下：先找點，再畫線。先想一份自己的教材，最後再分享。",
  "3:10–4:10。先問一個具體問題：桃園結義有哪些人？點一下出現教學用的錯答，請大家找出多了誰。再點一下：故事裡沒有曹操。這就是幻覺：沒有根據，卻說得很肯定。這是示意，不是實際模型測試。最後一下：如果先給它參考資料，再回答呢？轉到下一頁。小說來源：https://zh.wikisource.org/wiki/三國演義/第001回現場想讓大家試出幻覺，可以改問比較難的題目，例如請它逐字引用第21回的一句原文，再對照維基文庫，常會對不上。",
  "4:10–5:00。RAG 全名 Retrieval-Augmented Generation（檢索增強生成），課後查閱用。只講核心：同樣問桃園有哪些人，先找到筆記，再把問題和相關筆記交給AI，產生回答。先出現問題和六份筆記；按一下交給AI，再按一下產生回答，最後一下出現提醒。不逐字解釋英文。就像開書考，先翻到那一頁再作答，可能降低無根據回答，但仍要核對來源。本課Codex讀本機筆記，是示範類似RAG的先取得資料再回答概念，不是建置完整RAG系統。全名供課後查閱，不考術語。來源：https://arxiv.org/abs/2005.11401 、https://arxiv.org/abs/2312.10997最後一下補一句：現在的ChatGPT會先上網搜尋再回答，這也是RAG；prompts.md的「補充」有一段可以課後試。",
  "5:00–6:00。像上課前大家先把課本翻到同一頁。用手機掃QR code會下載到手機，所以用電腦的人請打畫面上的網址，或直接按下載按鈕。下載後解壓縮，Windows按右鍵「全部解壓縮」常會多包一層，只看到另一個teacher-learning-lab就再點進去一層。打開後要看到右邊這棵樹：notes/裡的六份筆記、prompts.md是課堂提示詞、outputs/是練習2存檔的地方、diagrams/是練習3存檔的地方；其他檔案像README、prework.md是說明檔，可以先不管。",
  "6:00–7:00。像先跟助教打聲招呼，確認他拿的是同一疊資料。四步：打開終端機（Mac叫Terminal，Windows叫PowerShell）；打cd和一個空格，把裡面有notes的那一層資料夾拖進視窗，按Enter；打codex；請它列出notes/裡的檔案，先不要修改任何檔案。按一下出現終端機畫面示意：看到六份筆記和一份README就成功了，路徑每台電腦不同。第一次啟動會有三個英文畫面，下一頁說明。沒有ChatGPT Plus方案的人，附錄第25頁有三條路：ChatGPT網頁版、OpenRouter、Ollama；課堂上最穩的是ChatGPT網頁版。",
  "7:00–8:00。第一次打開Codex會看到三個英文畫面，像第一次進學校系統：登入、同意、確認。第一個登入，選Sign in with ChatGPT，用瀏覽器登入。按一下，第二個問你信不信任這個資料夾，確認是teacher-learning-lab，選Yes, continue。再按一下，第三個是AI要寫檔案前問你，先看它要寫什麼，再選Yes, proceed；練習2、3存檔時都會遇到。登入畫面寫著Plus、Pro、Business、Enterprise方案包含Codex用量，其他方案請課前先確認；不能用的人走ChatGPT版。最下面那行提醒大家：卡住了就翻附錄第23頁。",
  "8:00–9:00。正式進入練習一。這是六份練習筆記：四個人物、兩件事。線表示這個人出現在這件事裡；劉備同時接到兩件事。先讀懂桃園結義，再用同一張劉備卡接到另一段故事。接下來先看單篇提示詞範例，再擴到六份。",
  "9:00–10:00。先只看A、B兩個輸入，請大家說差在哪：A只有一句話，定位、期望輸出、限制三件都沒寫；B三件都寫了，而且沒有先把答案告訴它，只說要列出人物和關係、每一項附原句。就像出學習單。按一下，出現A的AI回答（示意）：太廣，沒有出處，沒辦法核對。再按一下，出現B的回答：有原句，查得到。下一頁同樣三件事，換成讀六份筆記。",
  "10:00–15:00。練習5分鐘，用prompts.md練習1整段複製，不用照投影片打字。畫面上三格是重點：定位是notes/的六份筆記，期望輸出是一張四欄表（筆記、人物、關係、原句），限制是先不要改檔案。按一下，出現AI交回的表頭和第一列；再按兩下，出現另外兩列。畫面是節錄，句子都是筆記原文。確認六份都在表上、每列都有依據句子。",
  "15:00–20:00。留5分鐘讓較慢者完成，並示範怎麼檢查一列。這頁就是RAG的用處：筆記放進了輸入，AI比較不會亂編，而且每一列都找得回出處。先看AI表格裡關羽這一列。按一下：打開notes/關羽.md；打不開.md的人，按右鍵選記事本（Windows）或文字編輯（Mac）。再按一下：找到同一句，畫線。再按一下：句子一樣、關係也對，打勾。畫面上的筆記是節錄，最下面的「來源：三國演義第1回」就是出處。對照前面示範的錯答：多了曹操。請每人從自己的表挑一列，照這三步做一次。接著精讀煮酒論英雄。",
  "20:00–25:00。這頁先貼一次：prompts.md的練習2-1，把教學草稿整段貼給AI，它只會回「收到」。每個人的AI寫出來的不一樣，為了大家拿到一樣的題目，課堂上一律用這份草稿。左邊是草稿，右邊是筆記原文。先問：哪一行是多的？給30秒，請一兩位說說看。按一下：紅筆圈起「兩人是盟友」，原文沒有。這就是前面看過的幻覺；筆記只寫兩人談論誰是英雄，坐同一桌吃飯，不代表是同一隊。",
  "25:00–32:00。練習7分鐘：請AI每一行都附上原句，貼prompts.md的練習2-2。三格重點：定位是煮酒論英雄.md，期望輸出是草稿每一行附原句、找不到就寫找不到，限制是先不要改檔案。按一下出現第一行：參與人物，原句是「曹操與劉備在煮酒論英雄的情節中談論誰是英雄」，打勾。再按兩下，人物關係和來源回目也找得到原句。再按一下：兩人是盟友，找不到，打叉。最後一下：找不到原句，就刪。RAG是先把資料交給它，查證還是你負責；AI列出原句後，請大家自己打開筆記確認。",
  "32:00–35:00。貼prompts.md的練習2-3：請AI刪掉「兩人是盟友」那行，再存成outputs/煮酒論英雄-草稿.md，不要改notes/的筆記。按一下：盟友那行劃掉。再按一下：存好的檔案出現，每行都有原句。存檔前Codex會問Would you like to make the following edits，看過要寫的內容再選Yes, proceed（第11頁教過）。請大家打開outputs/資料夾確認檔案真的存了。下一頁用這份草稿畫知識圖。",
  "35:00–48:00。13分鐘只做必做的關係圖。先講流程五格：讀筆記、它提設計、你說可以（回它「可以，請存檔」）、存檔（Codex問Would you like to make the following edits時，看過再選Yes, proceed）、拖進瀏覽器打開。按一下出現提示詞三格：定位是六份筆記和核對過的草稿，期望輸出是一張存成diagrams/三國故事.html的知識圖，限制是只畫有原句的線、每條線附來源、先給你看設計再存。提示詞從prompts.md練習3整段複製；有沒有裝diagram-design都用同一段。檢查：劉備只畫一次，曹操沒有接到桃園結義。卡住時：AI沒存檔，就再說一次「請存成diagrams/三國故事.html」。",
  "48:00–55:00。留7分鐘開啟、查證與修圖。開圖：在Finder／檔案總管把HTML拖進瀏覽器；查證：用文字編輯器打開來源.md，每條線都照這樣核對。畫面是示意：你的HTML打開後大概長這樣，排版可能不同。進頁時圖會自己畫好，就是開場第5頁那張圖，現在是大家自己做出來的。按一下：劉備到煮酒論英雄那條線描粗，用綠色加粗，不用橘色（橘色只留給原文沒寫），下面出現它的意思和原句。用文字編輯器打開notes/對應的筆記，對每條線問：表示什麼、哪句支持？若瀏覽器點來源只會下載檔案，就直接開本機筆記核對。劉備只出現一次，不能多連曹操到桃園，也不能把共同對話改成盟友。核對完的人可以做附錄的時間軸加分練習；其他人繼續核對。每條線上都標了關係，事件下方寫著來源檔名；學生自己的HTML排版可能不同，但這兩樣都要有。",
  "55:00–57:00。今天的流程：發下來的原始筆記、你做出的草稿outputs/煮酒論英雄-草稿.md、你做出的知識圖diagrams/三國故事.html。來源和整理分開放，之後才能修正。按一下出現兩個問題，請每人花一分鐘寫在自己的筆記：我查了哪條關係、哪份筆記哪一句支持。再按一下：每條關係，都回原文找證據。",
  "57:00–60:00。兩人一組。先看分工：整理資料可以交給AI先做，例如把筆記整理成表；按一下，排版和AI一起調整；再按一下，回原文核對原句和回目一定要自己來。換你：用定位、期望輸出、限制，幫自己的教材寫一句提示詞，念給隔壁聽，兩分鐘。最後一分鐘：右邊QR code是課程repo，提示詞都在練習資料夾的prompts.md；下一篇Obsidian再練長期保存知識卡。收尾一句：AI畫出的每一條關係，都要回原文找證據。",
  "附錄目錄。主線在前一頁結束，這裡不逐頁講。開課前提醒大家：下載資料夾看第9頁；安裝Codex看第24頁；沒有Codex看第25頁；Codex好像開錯資料夾，翻第26頁輸入/status；做完還有時間，第27頁有加分練習。",
  "上課前完成，約15–20分鐘。四步：到nodejs.org下載LTS版，用預設選項安裝；重開終端機（Windows用命令提示字元或PowerShell，Mac用終端機），輸入node -v和npm -v，兩個都有版本號就對了；輸入npm install -g @openai/codex@latest安裝Codex；輸入codex，選Sign in with ChatGPT登入，Plus、Pro、Business、Enterprise方案包含Codex用量。卡住時：顯示「找不到指令」，先重開終端機；還是不行，重跑一次Node.js安裝程式。完整步驟在prework.md。",
  "附錄。沒有ChatGPT Plus方案的人有三條路。第一條是ChatGPT網頁版：先上傳notes/的六份筆記，貼prompts.md的提示詞；要存檔時改請它「給我一個可下載的檔案」，下載後自己放進outputs/或diagrams/，這是課堂備案，也是目前唯一實測可行的免費路線。第二條是OpenRouter：註冊拿API key，按用量付費、也有免費模型，在~/.codex/config.toml設定後一樣用codex；這條課前還沒實測。第三條是Ollama：在自己電腦跑模型、資料不出電腦。課前用16GB的Mac實測gemma4:e2b：Ollama預設context只有4K，要用OLLAMA_CONTEXT_LENGTH=65536開到64K，模型才看得到工具和筆記；開到64K後，Codex和OpenCode都能讀筆記做出練習1的表，但練習2的逐行核對會漏掉或亂抄，存檔會存錯內容，Codex甚至說已經存了其實沒有；練習3的圖也不完整。記憶體大約用3GB。所以Ollama只適合想自己玩的人，不建議當課堂備案。OpenCode內建的免費雲端模型，在無介面的指令模式下被擋，要在OpenCode的互動介面裡才能用，課前沒測到。設定步驟都在prework.md。",
  '卡住時用：覺得Codex開錯資料夾，就輸入/status。只看Directory那一行，要顯示teacher-learning-lab；不是的話，關掉Codex，回到第10頁重新cd進正確的資料夾。其他欄位（模型、權限、Session）新手不用管。',
  "附錄的加分練習，主線不講。給已經核對完關係圖的人做：時間軸依小說第1回、第21回排先後，不是歷史年份，間距也不代表經過多久。提示詞在prompts.md的加分段落，不要求全班完成。"
];

export default [
  Cover, SpeakerIntro, StoryStart, Agenda, ResultFirst, TeacherTransfer, WrongAnswer, RagFlow, ReadyDesk, OpenCodex, FirstRun, LabOverview, PromptChoice, ScanTask, ScanOutput, Practice2Draft, Practice2Check, Practice2Save, DiagramTask, DiagramCheck, Wrapup, BringBack,
  // Appendix: outside the 60-minute teaching route
  Appendix, Prework, ChatGPTRoute, StatusScreen, StoryTimeline,
] satisfies Page[];
