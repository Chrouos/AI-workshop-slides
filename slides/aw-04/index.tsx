import type { DesignSystem, Page, SlideMeta, SlideTransition } from '@open-slide/core';
import { Step, Steps, useIsActivePage, useSlidePageNumber } from '@open-slide/core';
import type { CSSProperties, ReactNode } from 'react';
import dgSettings from './assets/dg-settings-github.png';
import dgPalette from './assets/dg-command-palette.png';
import dgProperty from './assets/dg-publish-property.png';
import timelineSite from './assets/timeline-on-site.png';

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
const FONT_LINK_ID = 'osd-webfont-aw-04';
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
// Same vocabulary as ai-basics-01a. Clicks go through the framework's <Steps>/<Step>;
// the CSS only adds a short rise to whatever a <Step> reveals, lines that draw themselves
// when their step is revealed, and pieces that settle in order. Un-clicked motion (a page's
// pieces settling in, the chapter bar filling) runs only on the page the audience is
// watching (useIsActivePage). Thumbnails, overview and exports render every step revealed.
const EASE_OUT = 'cubic-bezier(0.23, 1, 0.32, 1)';
const STEP_MS = 280; // a <Step> fading in + an 8px rise
const BUILD_MS = 320; // pieces inside a revealed step settling in order
const BUILD_GAP = 90; // stagger between those pieces
const FILL_MS = 480; // chapter bar filling left to right
const ENTER_MS = 420; // a piece of a page settling in when the page arrives
const ENTER_GAP = 90; // stagger between those pieces
const DRAW_MS = 520; // a connecting line drawing from one end to the other

const MOTION_CSS = `
.aw4-deck [data-osd-step] > * { transition: transform ${STEP_MS}ms ${EASE_OUT}; }
.aw4-deck [data-osd-step="pending"] > * { transform: translateY(8px); }
.aw4-deck .aw4-build { transition-property: opacity, transform; transition-duration: ${BUILD_MS}ms; transition-timing-function: ${EASE_OUT}; }
.aw4-deck [data-osd-step="pending"] .aw4-build { opacity: 0; transform: translateY(10px); }
.aw4-deck .aw4-stepdraw { stroke-dasharray: 1; stroke-dashoffset: 0; transition: stroke-dashoffset ${DRAW_MS}ms ${EASE_OUT}; }
.aw4-deck [data-osd-step="pending"] .aw4-stepdraw { stroke-dashoffset: 1; }
@keyframes aw4-fill { from { transform: scaleX(0); } to { transform: scaleX(1); } }
.aw4-deck .aw4-fill { transform-origin: left center; animation: aw4-fill ${FILL_MS}ms ${EASE_OUT} 160ms both; }
@keyframes aw4-in { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: none; } }
.aw4-deck .aw4-in { animation: aw4-in ${ENTER_MS}ms ${EASE_OUT} both; }
@keyframes aw4-draw { from { stroke-dashoffset: 1; } to { stroke-dashoffset: 0; } }
.aw4-deck .aw4-draw { stroke-dasharray: 1; animation: aw4-draw ${DRAW_MS}ms ${EASE_OUT} both; }
@keyframes aw4-pop { from { opacity: 0; transform: scale(0.75); } to { opacity: 1; transform: scale(1); } }
.aw4-deck .aw4-pop { transform-box: fill-box; transform-origin: center; animation: aw4-pop 300ms ${EASE_OUT} both; }
@keyframes aw4-in-fade { from { opacity: 0; } to { opacity: 1; } }
@media (prefers-reduced-motion: reduce) {
  .aw4-deck .aw4-in, .aw4-deck .aw4-pop { animation: aw4-in-fade 150ms ease both; }
  .aw4-deck .aw4-draw { animation: none; stroke-dasharray: none; }
  .aw4-deck .aw4-stepdraw, .aw4-deck [data-osd-step="pending"] .aw4-stepdraw { transition: none; stroke-dasharray: none; stroke-dashoffset: 0; }
  .aw4-deck [data-osd-step] > *, .aw4-deck [data-osd-step="pending"] > * { transform: none; transition: none; }
  .aw4-deck .aw4-build { transition: opacity 150ms ease; transition-delay: 0s !important; }
  .aw4-deck [data-osd-step="pending"] .aw4-build { transform: none; }
  .aw4-deck .aw4-fill { animation: none; }
}
`;
const MOTION_STYLE_ID = 'osd-motion-aw-04';
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
  return <div className={live ? 'aw4-in' : undefined} style={live ? { ...style, animationDelay: enterDelay(i) } : style}>{children}</div>;
};

// The same, for a group inside an SVG picture.
const InG = ({ i, children }: { i: number; children: ReactNode }) => {
  const live = useIsActivePage();
  return <g className={live ? 'aw4-in' : undefined} style={live ? { animationDelay: enterDelay(i) } : undefined}>{children}</g>;
};

// A mark (tick, cross, badge) that pops in after the thing it marks has landed.
const PopG = ({ i, children }: { i: number; children: ReactNode }) => {
  const live = useIsActivePage();
  return <g className={live ? 'aw4-pop' : undefined} style={live ? { animationDelay: enterDelay(i) } : undefined}>{children}</g>;
};

// A solid connecting line that draws itself on when the page arrives.
const DrawPath = ({ i, d }: { i: number; d: string }) => {
  const live = useIsActivePage();
  return <path d={d} pathLength={1} className={live ? 'aw4-draw' : undefined} style={live ? { animationDelay: enterDelay(i) } : undefined} />;
};

// A solid line inside a <Step>: it draws itself when that step is revealed.
const StepPath = ({ d, i = 0 }: { d: string; i?: number }) => (
  <path d={d} pathLength={1} className="aw4-stepdraw" style={buildDelay(i, 60)} />
);

// A group inside a revealed step that settles in after the step starts.
const Build = ({ i = 0, children }: { i?: number; children: ReactNode }) => (
  <g className="aw4-build" style={buildDelay(i)}>{children}</g>
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
const blue = '#4A6A8C';
const blueSoft = '#E3EAF1';
const warn = '#9B4A3C';
const warnSoft = '#F6DEDA';
const link = '#7654C7'; // Obsidian's internal-link purple
const linkSoft = '#EEE7F2';
const term = '#1F2226';
const mono = '"Source Code Pro", Consolas, Menlo, monospace';
const display = 'var(--osd-font-display)';

// ---------- Frame ----------

const Title = ({ children }: { children: ReactNode }) => (
  <h1 style={{ fontFamily: '"Libre Baskerville", Georgia, "Times New Roman", serif', fontSize: 132, fontWeight: 400, lineHeight: 1.17, letterSpacing: '-0.035em', maxWidth: 1500, margin: 0, color: ink, whiteSpace: 'pre-line' }}>{children}</h1>
);

const Footer = () => {
  const { current, total } = useSlidePageNumber();
  return (
    <div style={{ position: 'absolute', left: 144, right: 144, bottom: 56, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #E7E5E4', paddingTop: 22, fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', fontSize: 22, fontWeight: 400, color: quiet }}>
      <span>AI 協作課｜第 4 堂 發布成網站</span>
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

// The five chapters of the lesson. Pages inside a chapter show where we are.
const CHAPTERS = ['筆記怎麼變成網址', '建立網站', '連接 Obsidian', '挑卡發布', '互相驗收與延伸'];
type Chapter = 1 | 2 | 3 | 4 | 5;

// One segment of the route bar. The current chapter is amber; on a chapter's opening
// page it fills in left to right, once, on the live page only.
const RouteSeg = ({ color, fill = false }: { color: string; fill?: boolean }) => (
  <span style={{ width: 34, height: 6, background: fill ? rule : color, display: 'block' }}>
    {fill ? <span className="aw4-fill" style={{ display: 'block', width: '100%', height: '100%', background: color }} /> : null}
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

const Shell = ({ children, top = 112, chapter, enterChapter = false }: { children: ReactNode; top?: number; chapter?: Chapter; enterChapter?: boolean }) => (
  <div className="aw4-deck" style={{ width: '100%', height: '100%', boxSizing: 'border-box', position: 'relative', display: 'flex', flexDirection: 'column', background: 'var(--osd-bg)', color: 'var(--osd-text)', fontFamily: 'var(--osd-font-body)', padding: `${top}px 144px 126px` }}>
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

const Callout = ({ n, title, detail }: { n: number; title: ReactNode; detail?: ReactNode }) => (
  <div style={{ display: 'grid', gridTemplateColumns: '44px 1fr', gap: 20, alignItems: 'start' }}>
    <NumDot n={n} />
    <div>
      <div style={{ fontSize: 31, fontWeight: 600, lineHeight: 1.35 }}>{title}</div>
      {detail ? <div style={{ fontSize: 26, color: muted, marginTop: 6, lineHeight: 1.45 }}>{detail}</div> : null}
    </div>
  </div>
);

const Typed = ({ children }: { children: ReactNode }) => <span style={{ color: '#8DD4A0' }}>{children}</span>;

const Caption = ({ children }: { children: ReactNode }) => (
  <div style={{ fontSize: 22, lineHeight: 1.4, color: quiet, marginTop: 12 }}>{children}</div>
);

// A real screenshot at its own aspect ratio.
const Screenshot = ({ src, aspect, width, caption, alt, children }: { src: string; aspect: number; width: number; caption?: string; alt: string; children?: ReactNode }) => (
  <div style={{ width }}>
    <div style={{ width, height: Math.round(width / aspect), boxSizing: 'border-box', border: `1px solid ${rule}`, background: '#FFFFFF', boxShadow: '0 10px 30px rgba(28,25,23,0.08)', position: 'relative' }}>
      <img src={src} alt={alt} style={{ width: '100%', height: '100%', display: 'block' }} />
      {children}
    </div>
    {caption ? <Caption>{caption}</Caption> : null}
  </div>
);

// Only the useful region of a real screenshot, enlarged. `nat` is the image's own size.
const CropShot = ({ src, alt, nat, crop, width }: { src: string; alt: string; nat: [number, number]; crop: [number, number, number, number]; width: number }) => {
  const [x, y, w, h] = crop;
  const s = width / w;
  return (
    <div style={{ position: 'relative', width, height: Math.round(h * s), overflow: 'hidden', background: '#FFFFFF', border: `1px solid ${rule}`, boxShadow: '0 10px 30px rgba(28,25,23,0.08)' }}>
      <img src={src} alt={alt} style={{ position: 'absolute', left: -x * s, top: -y * s, width: nat[0] * s, height: nat[1] * s, maxWidth: 'none' }} />
    </div>
  );
};

// A numbered marker sitting on a screenshot (enters with the page).
const MarkBubble = ({ n, left, top, i }: { n: number; left: string | number; top: string | number; i: number }) => {
  const live = useIsActivePage();
  return (
    <span className={live ? 'aw4-in' : undefined} style={{ position: 'absolute', left, top, marginLeft: -26, marginTop: -26, width: 52, height: 52, borderRadius: 26, background: amber, color: '#FFFFFF', display: 'grid', placeItems: 'center', fontSize: 26, fontWeight: 600, boxShadow: '0 0 0 5px #FFFFFF, 0 4px 12px rgba(0,0,0,0.25)', animationDelay: live ? enterDelay(i) : undefined }}>{n}</span>
  );
};

// One click of a guided tour: an outline over a picture plus its caption. The outline is
// positioned (in px) against the nearest `position: relative` box around the <Steps>.
// It returns siblings, so the reveal's 8px rise never moves the outline's anchor.
const TourStep = ({ n, title, detail, box, badge = 'left' }: { n: number; title: ReactNode; detail?: ReactNode; box: [number, number, number, number]; badge?: 'left' | 'right' }) => (
  <>
    <Callout n={n} title={title} detail={detail} />
    <div style={{ position: 'absolute', left: box[0], top: box[1], width: box[2], height: box[3], border: '4px solid #E9B650', boxSizing: 'border-box' }} />
    <span style={{ position: 'absolute', left: badge === 'left' ? box[0] - 22 : box[0] + box[2] - 22, top: box[1] - 22, width: 44, height: 44, borderRadius: 22, background: amber, color: '#FFFFFF', display: 'grid', placeItems: 'center', fontSize: 24, fontWeight: 600, boxShadow: '0 0 0 4px #FFFFFF' }}>{n}</span>
  </>
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
  <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: size, color: ok ? okGreen : warn, fontWeight: 600 }}>
    <svg viewBox="0 0 36 36" style={{ width: 36, height: 36, flexShrink: 0 }} aria-hidden="true">{ok ? <TickMark x={18} y={20} size={24} /> : <CrossMark x={18} y={18} size={18} color={warn} />}</svg>
    <span>{children}</span>
  </div>
);

// ---------- Icons ----------
// Simple line icons on a 64×64 grid, used in flows and pictures instead of emoji.
type IconKind = 'doc' | 'ok' | 'browser' | 'search' | 'terminal' | 'folder' | 'globe' | 'key' | 'mail' | 'server' | 'gear' | 'clock' | 'user' | 'repo' | 'upload' | 'home' | 'timeline' | 'plug' | 'code';

const IconPaths = ({ kind, color }: { kind: IconKind; color: string }) => (
  <g fill="none" stroke={color} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
    {kind === 'doc' && <><path d="M16 6 H40 L50 16 V58 H16 Z" /><path d="M40 6 V16 H50" /><path d="M23 30 H43 M23 39 H43 M23 48 H36" /></>}
    {kind === 'ok' && <><circle cx="32" cy="32" r="25" /><path d="M20 33 L28 41 L45 23" /></>}
    {kind === 'browser' && <><rect x="6" y="10" width="52" height="44" rx="4" /><path d="M6 22 H58" /><path d="M16 34 H48 M16 43 H38" /></>}
    {kind === 'search' && <><circle cx="27" cy="27" r="16" /><path d="M39 39 L54 54" /></>}
    {kind === 'terminal' && <><rect x="6" y="10" width="52" height="44" rx="4" /><path d="M16 25 L25 32 L16 39" /><path d="M30 41 H45" /></>}
    {kind === 'folder' && <><path d="M6 16 V52 H58 V22 H30 L25 16 Z" /></>}
    {kind === 'globe' && <><circle cx="32" cy="32" r="24" /><path d="M8 32 H56" /><path d="M32 8 C21 18 21 46 32 56 C43 46 43 18 32 8" /></>}
    {kind === 'key' && <><circle cx="20" cy="32" r="12" /><path d="M32 32 H58 M50 32 V42 M42 32 V40" /></>}
    {kind === 'mail' && <><path d="M12 30 C12 18 20 12 30 12 H44 C52 12 56 18 56 26 V52 H12 Z" /><path d="M22 28 H44" /><path d="M32 52 V60" /><path d="M44 12 V4 H52" /></>}
    {kind === 'server' && <><rect x="10" y="8" width="44" height="20" rx="3" /><rect x="10" y="36" width="44" height="20" rx="3" /><path d="M18 18 H22 M18 46 H22" /></>}
    {kind === 'gear' && <><circle cx="32" cy="32" r="10" /><path d="M32 8 V17 M32 47 V56 M8 32 H17 M47 32 H56 M15 15 L21 21 M43 43 L49 49 M49 15 L43 21 M15 49 L21 43" /></>}
    {kind === 'clock' && <><circle cx="32" cy="32" r="24" /><path d="M32 18 V32 L42 38" /></>}
    {kind === 'user' && <><circle cx="32" cy="22" r="11" /><path d="M12 56 C12 42 22 36 32 36 C42 36 52 42 52 56" /></>}
    {kind === 'repo' && <><path d="M10 20 L32 8 L54 20 V46 L32 58 L10 46 Z" /><path d="M10 20 L32 32 L54 20 M32 32 V58" /></>}
    {kind === 'upload' && <><path d="M32 42 V10 M20 22 L32 10 L44 22" /><path d="M10 40 V54 H54 V40" /></>}
    {kind === 'home' && <><path d="M8 30 L32 9 L56 30" /><path d="M15 25 V55 H49 V25" /><path d="M27 55 V40 H37 V55" /></>}
    {kind === 'timeline' && <><path d="M6 32 H58" /><circle cx="16" cy="32" r="5" /><circle cx="32" cy="32" r="5" /><circle cx="48" cy="32" r="5" /><path d="M16 22 V12 M32 42 V52 M48 22 V12" /></>}
    {kind === 'plug' && <><path d="M23 8 V20 M41 8 V20" /><path d="M14 20 H50 V30 C50 41 42 47 32 47 C22 47 14 41 14 30 Z" /><path d="M32 47 V58" /></>}
    {kind === 'code' && <><path d="M22 18 L8 32 L22 46 M42 18 L56 32 L42 46" /><path d="M36 12 L28 52" /></>}
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

const DocShape = ({ x, y, w, h, fill = '#FFFFFF', stroke = rule, sw = 2, dash }: { x: number; y: number; w: number; h: number; fill?: string; stroke?: string; sw?: number; dash?: string }) => (
  <g>
    <path d={`M${x} ${y} H${x + w - 22} L${x + w} ${y + 22} V${y + h} H${x} Z`} fill={fill} stroke={stroke} strokeWidth={sw} strokeDasharray={dash} />
    <path d={`M${x + w - 22} ${y} V${y + 22} H${x + w}`} fill="none" stroke={stroke} strokeWidth={sw} />
  </g>
);

const Folder = ({ x, y, w, h, fill = amberSoft, stroke = amber, sw = 2 }: { x: number; y: number; w: number; h: number; fill?: string; stroke?: string; sw?: number }) => (
  <path d={`M${x} ${y + 14} V${y + h} H${x + w} V${y + 14} H${x + w * 0.42} L${x + w * 0.36} ${y} H${x} Z`} fill={fill} stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />
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

const NoDot = ({ x, y, r = 22 }: { x: number; y: number; r?: number }) => (
  <g><circle cx={x} cy={y} r={r} fill={warn} /><CrossMark x={x} y={y} size={r * 0.75} color="#FFFFFF" /></g>
);

// A numbered dot inside a picture.
const SvgNum = ({ x, y, n }: { x: number; y: number; n: number }) => (
  <g><circle cx={x} cy={y} r="22" fill={amber} /><text x={x} y={y + 9} textAnchor="middle" fontSize="25" fontWeight="600" fill="#FFFFFF">{n}</text></g>
);

const MapArrow = ({ x1, x2, y, hot = false }: { x1: number; x2: number; y: number; hot?: boolean }) => (
  <g fill={hot ? amber : faint} stroke={hot ? amber : faint}><line x1={x1} y1={y} x2={x2 - 12} y2={y} strokeWidth={hot ? 4 : 3} /><polygon points={`${x2},${y} ${x2 - 16},${y - 9} ${x2 - 16},${y + 9}`} strokeWidth="0" /></g>
);

const DownArrowSvg = ({ x, y1, y2, color = faint }: { x: number; y1: number; y2: number; color?: string }) => (
  <g fill={color} stroke={color}><line x1={x} y1={y1} x2={x} y2={y2 - 12} strokeWidth="3" /><polygon points={`${x},${y2} ${x - 9},${y2 - 16} ${x + 9},${y2 - 16}`} strokeWidth="0" /></g>
);

// A small chip with text, e.g. a file name or a URL.
const SvgChip = ({ x, y, w, label, fill = '#FFFFFF', stroke = rule, color = ink, size = 24, h = 44, font }: { x: number; y: number; w: number; label: string; fill?: string; stroke?: string; color?: string; size?: number; h?: number; font?: string }) => (
  <g><rect x={x} y={y} width={w} height={h} rx="4" fill={fill} stroke={stroke} strokeWidth="2" /><text x={x + w / 2} y={y + h / 2 + size * 0.36} textAnchor="middle" fontSize={size} fontFamily={font} fill={color}>{label}</text></g>
);

// A browser window frame drawn inside a picture.
const BrowserFrame = ({ x, y, w, h, url }: { x: number; y: number; w: number; h: number; url: string }) => (
  <g>
    <rect x={x} y={y} width={w} height={h} fill="#FFFFFF" stroke={rule} strokeWidth="2" />
    <rect x={x} y={y} width={w} height="52" fill="#ECEAE8" />
    <circle cx={x + 26} cy={y + 26} r="7" fill="#D87771" /><circle cx={x + 48} cy={y + 26} r="7" fill="#E4BB62" /><circle cx={x + 70} cy={y + 26} r="7" fill="#81B984" />
    <rect x={x + 96} y={y + 10} width={w - 120} height="32" rx="16" fill="#FFFFFF" />
    <text x={x + 116} y={y + 34} fontSize="22" fontFamily={mono} fill={muted}>{url}</text>
  </g>
);

// A note card with a tick box: ticked cards carry dg-publish.
const TickBox = ({ x, y, on }: { x: number; y: number; on: boolean }) => (
  <g><rect x={x} y={y} width="26" height="26" fill="#FFFFFF" stroke={on ? okGreen : faint} strokeWidth="3" />{on ? <TickMark x={x + 13} y={y + 14} size={18} /> : null}</g>
);

const CardRow = ({ x, y, w = 300, name, on }: { x: number; y: number; w?: number; name: string; on: boolean }) => (
  <g>
    <rect x={x} y={y} width={w} height="56" fill={on ? '#FFFFFF' : surface} stroke={on ? okGreen : faint} strokeWidth="2" strokeDasharray={on ? undefined : '8 6'} />
    <TickBox x={x + 16} y={y + 15} on={on} />
    <text x={x + 58} y={y + 37} fontSize="27" fill={on ? ink : quiet}>{name}</text>
  </g>
);

// ---------- Opening ----------

const Cover: Page = () => (
  <Shell top={174}>
    <In i={0}><Eyebrow>AI WORKSHOP 04｜發布成網站</Eyebrow></In>
    <In i={1} style={{ marginTop: 62 }}><Title>{'把三國知識庫\n發布成網站'}</Title></In>
    <In i={2} style={{ marginTop: 40, fontSize: 35, color: muted }}>從 Obsidian 到一個公開網址</In>
    <In i={3} style={{ width: 160, height: 5, background: amber, marginTop: 72 }}><span /></In>
    <div style={{ position: 'absolute', right: 144, bottom: 170 }}>
      <Figure w={720} h={200} label="筆記、GitHub、網址">
        <InG i={3}><circle cx="80" cy="100" r="72" fill={linkSoft} stroke={link} strokeWidth="2" /><SvgIcon kind="doc" x={80} y={100} size={70} color={link} /></InG>
        <InG i={4}><MapArrow x1={168} x2={232} y={100} /></InG>
        <InG i={5}><circle cx="320" cy="100" r="72" fill="#FFFFFF" stroke={faint} strokeWidth="2" /><SvgIcon kind="repo" x={320} y={100} size={70} color={muted} /></InG>
        <InG i={6}><MapArrow x1={408} x2={472} y={100} hot /></InG>
        <InG i={7}><circle cx="560" cy="100" r="72" fill={amberSoft} stroke={amber} strokeWidth="2" /><SvgIcon kind="globe" x={560} y={100} size={70} color={amber} /></InG>
      </Figure>
    </div>
  </Shell>
);

// One finished piece of the course, drawn as a stop on a line.
const LessonStop = ({ x, n, kind, name, file, hot = false }: { x: number; n: number; kind: IconKind; name: string; file: string; hot?: boolean }) => (
  <g>
    <circle cx={x} cy="110" r="88" fill={hot ? amberSoft : '#FFFFFF'} stroke={hot ? amber : faint} strokeWidth="3" />
    <SvgIcon kind={kind} x={x} y={110} size={96} color={hot ? amber : muted} />
    <text x={x} y="250" textAnchor="middle" fontSize="26" fill={hot ? amber : quiet} fontWeight={hot ? 600 : 400}>第 {n} 堂</text>
    <text x={x} y="306" textAnchor="middle" fontSize="44" fontWeight="600" fill={ink}>{name}</text>
    <text x={x} y="354" textAnchor="middle" fontSize="26" fontFamily={mono} fill={muted}>{file}</text>
  </g>
);

const LessonRecap: Page = () => (
  <Shell>
    <Eyebrow>回顧</Eyebrow>
    <Heading>前三堂做出的東西</Heading>
    <Fit>
      <Stage h={390}>
        <Steps>
          <Layer h={390} label="第一堂大綱、第二堂筆記庫、第三堂時間軸">
            <InG i={0}><LessonStop x={204} n={1} kind="doc" name="大綱" file="三國演義大綱.md" /></InG>
            <InG i={1}><MapArrow x1={300} x2={516} y={110} /></InG>
            <InG i={2}><LessonStop x={612} n={2} kind="folder" name="筆記庫" file="三國人物知識庫/" /></InG>
            <InG i={3}><MapArrow x1={708} x2={924} y={110} /></InG>
            <InG i={4}><LessonStop x={1020} n={3} kind="timeline" name="時間軸" file="整理/時間軸.md" /></InG>
          </Layer>
          <Step duration={STEP_MS}><Layer h={390} label="第四堂：網站，今天要做的">
            <MapArrow x1={1116} x2={1332} y={110} hot />
            <Build><LessonStop x={1428} n={4} kind="globe" name="網站" file="….vercel.app" hot /></Build>
            <Build i={1}><SvgChip x={1478} y={12} w={110} h={44} label="今天" fill={amber} stroke={amber} color="#FFFFFF" size={25} /></Build>
          </Layer></Step>
        </Steps>
      </Stage>
      <Steps><Step duration={STEP_MS}><Takeaway>今天把前三堂的成果，放到一個網址上</Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

// A page of the finished site, drawn as one card the reader walks through.
const SitePage = ({ x, kind, name, line, next }: { x: number; kind: string; name: string; line: string; next?: string }) => (
  <g>
    <rect x={x} y="86" width="340" height="290" fill="#FFFFFF" stroke={rule} strokeWidth="2" />
    <text x={x + 26} y="130" fontSize="24" fill={quiet}>{kind}</text>
    <text x={x + 26} y="186" fontSize="38" fontWeight="600" fill={ink}>{name}</text>
    <text x={x + 26} y="236" fontSize="25" fill={muted}>{line}</text>
    {next ? <text x={x + 26} y="330" fontSize="29" fill={link} textDecoration="underline">{next}</text> : null}
  </g>
);

const SiteGoal: Page = () => (
  <Shell>
    <Eyebrow>成果示意｜外觀依模板而定</Eyebrow>
    <Heading>今天要做出的網站</Heading>
    <Fit z={1.05}>
      <Figure h={420} label="網站上的路徑：首頁三國演義 → 知識庫導覽 → 時間軸看事件順序，或 → 劉備、桃園結義等人物和事件卡">
        <InG i={0}><BrowserFrame x={0} y={0} w={1632} h={410} url="https://my-garden-….vercel.app" /></InG>
        <InG i={1}><SitePage x={30} kind="首頁" name="三國演義" line="東漢末年，天下大亂" next="知識庫導覽" /></InG>
        <InG i={3}>
          <rect x="434" y="86" width="400" height="290" fill={amberSoft} stroke={amber} strokeWidth="2" />
          <text x="460" y="130" fontSize="24" fill={amber}>導覽頁</text>
          <text x="460" y="186" fontSize="38" fontWeight="600" fill={ink}>知識庫導覽</text>
          <text x="460" y="246" fontSize="29" fill={link} textDecoration="underline">時間軸</text>
          <text x="460" y="298" fontSize="29" fill={link} textDecoration="underline">劉備、曹操、孫權</text>
          <text x="460" y="350" fontSize="29" fill={link} textDecoration="underline">桃園結義、赤壁之戰</text>
        </InG>
        <InG i={5}>
          <rect x="930" y="86" width="672" height="130" fill="#FFFFFF" stroke={rule} strokeWidth="2" />
          <text x="956" y="124" fontSize="24" fill={quiet}>時間軸｜看事件順序</text>
          <text x="1590" y="124" textAnchor="end" fontSize="24" fill={muted}>表格，人名不能點</text>
          <text x="956" y="166" fontSize="26" fill={ink}>第 1 回　桃園結義　劉備、關羽、張飛</text>
          <text x="956" y="202" fontSize="26" fill={ink}>第 21 回　煮酒論英雄　曹操、劉備</text>
        </InG>
        <InG i={7}>
          <rect x="930" y="246" width="672" height="130" fill="#FFFFFF" stroke={rule} strokeWidth="2" />
          <text x="956" y="284" fontSize="24" fill={quiet}>人物、事件卡</text>
          <text x="956" y="340" fontSize="36" fontWeight="600" fill={ink}>劉備　桃園結義　……</text>
        </InG>
        <g fill="none" stroke={amber} strokeWidth="4">
          <DrawPath i={2} d="M374 231 H420" />
          <DrawPath i={4} d="M834 238 C880 238 880 151 916 151" />
          <DrawPath i={6} d="M834 290 C880 290 880 311 916 311" />
          <DrawPath i={6} d="M834 342 C880 342 880 311 916 311" />
        </g>
        <InG i={8}><polygon points="432,231 416,222 416,240" fill={amber} /><polygon points="928,151 912,142 912,160" fill={amber} /><polygon points="928,311 912,302 912,320" fill={amber} /></InG>
      </Figure>
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={40}>首頁 → 導覽頁 → 時間軸、人物、事件</Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

// A table-of-contents row: chapter, the thing you walk away with, time and page.
const AGENDA_COLS = '90px 1fr 560px 180px';

const AgendaRow = ({ i, n, kind, result, time, page }: { i: number; n: Chapter; kind: IconKind; result: string; time: string; page: Page }) => (
  <In i={i} style={{ display: 'grid', gridTemplateColumns: AGENDA_COLS, alignItems: 'center', minHeight: 108, borderBottom: `1px solid ${rule}` }}>
    <span style={{ fontFamily: display, fontSize: 40, color: amber }}>{String(n).padStart(2, '0')}</span>
    <span style={{ fontSize: 38, fontWeight: 600 }}>{CHAPTERS[n - 1]}</span>
    <span style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
      <Icon kind={kind} size={54} color={amber} />
      <span style={{ fontSize: 30 }}>{result}</span>
    </span>
    <span style={{ textAlign: 'right' }}><span style={{ display: 'block', fontSize: 26, color: amber }}>{time}</span><span style={{ display: 'block', fontSize: 24, color: quiet, marginTop: 4 }}>第 {pageOf(page)} 頁</span></span>
  </In>
);

const Agenda: Page = () => (
  <Shell>
    <Eyebrow>AGENDA｜120 分鐘，含四個練習</Eyebrow>
    <Heading>課程大綱</Heading>
    <Fit>
      <div style={{ display: 'grid', gridTemplateColumns: AGENDA_COLS, paddingBottom: 12, borderBottom: `1px solid ${rule}` }}>
        <span /><SmallLabel>章節</SmallLabel><SmallLabel>結束時你會</SmallLabel><span style={{ textAlign: 'right' }}><SmallLabel>時間｜頁</SmallLabel></span>
      </div>
      <AgendaRow i={0} n={1} kind="globe" result="說得出網址怎麼來" time="10–30 分" page={Section1} />
      <AgendaRow i={1} n={2} kind="repo" result="有一個 vercel.app 網址" time="30–50 分" page={Section2} />
      <AgendaRow i={2} n={3} kind="key" result="外掛連上 GitHub" time="50–68 分" page={Section3} />
      <AgendaRow i={3} n={4} kind="timeline" result="時間軸卡上網站" time="68–95 分" page={Section4} />
      <AgendaRow i={4} n={5} kind="user" result="同學走得到你的卡" time="95–120 分" page={Section5} />
    </Fit>
  </Shell>
);

// The lesson's route on a chapter's opening page: five stops, this one in amber.
const TRACK_XS = [110, 463, 816, 1169, 1522];

const TrackStop = ({ x, n, chapter }: { x: number; n: Chapter; chapter: Chapter }) => {
  const now = n === chapter;
  const done = n < chapter;
  return (
    <g>
      {now ? <PopG i={4}><circle cx={x} cy="50" r="34" fill={amber} /><text x={x} y="60" textAnchor="middle" fontSize="28" fontWeight="600" fill="#FFFFFF">{n}</text></PopG>
        : <g><circle cx={x} cy="50" r="22" fill={done ? faint : '#FFFFFF'} stroke={done ? faint : rule} strokeWidth="3" /><text x={x} y="59" textAnchor="middle" fontSize="24" fontWeight="600" fill={done ? '#FFFFFF' : quiet}>{n}</text></g>}
      <text x={x} y="130" textAnchor="middle" fontSize="28" fontWeight={now ? 600 : 400} fill={now ? amber : quiet}>{CHAPTERS[n - 1]}</text>
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

// ---------- 01 筆記怎麼變成網址 ----------

const Section1: Page = () => <SectionPage chapter={1} label="01 / 網站" lead="網站是什麼、檔案放在哪、怎麼自動更新" />;

const WebsiteIs: Page = () => (
  <Shell chapter={1}>
    <Eyebrow>網站＝網址＋檔案</Eyebrow>
    <Heading>網站是什麼</Heading>
    <Lead>網址像門牌，照著它找到那一頁</Lead>
    <Fit>
      <Stage h={420}>
        <Steps>
          <Layer h={420} label="你在瀏覽器輸入網址">
            <InG i={0}>
              <BrowserFrame x={0} y={20} w={470} h={300} url="my-garden.vercel.app" />
              <rect x="40" y="150" width="390" height="64" rx="32" fill={amberSoft} stroke={amber} strokeWidth="2" />
              <text x="235" y="192" textAnchor="middle" fontSize="28" fill={ink}>輸入網址，按 Enter</text>
            </InG>
            <InG i={1}><SvgNum x={24} y={385} n={1} /><text x="60" y="395" fontSize="30" fontWeight="600" fill={ink}>你的瀏覽器</text></InG>
          </Layer>
          <Step duration={STEP_MS}><Layer h={420} label="網址指向一台一直開著的電腦，它找到〈劉備〉這個檔案">
            <MapArrow x1={484} x2={584} y={170} hot />
            <text x="534" y="150" textAnchor="middle" fontSize="24" fill={amber}>要這頁</text>
            <Build>
              <rect x="600" y="20" width="440" height="300" fill={surface} stroke={faint} strokeWidth="2" />
              <SvgIcon kind="server" x={648} y={72} size={56} color={muted} />
              <text x="692" y="82" fontSize="28" fill={ink}>一直開著的電腦</text>
              <DocShape x={630} y={130} w={110} h={150} />
              <text x="685" y="222" textAnchor="middle" fontSize="28" fill={muted}>首頁</text>
              <DocShape x={765} y={130} w={110} h={150} fill={amberSoft} stroke={amber} sw={3} />
              <text x="820" y="222" textAnchor="middle" fontSize="28" fontWeight="600" fill={ink}>劉備</text>
              <DocShape x={900} y={130} w={110} h={150} />
              <text x="955" y="222" textAnchor="middle" fontSize="28" fill={muted}>曹操</text>
            </Build>
            <Build i={1}><SvgNum x={624} y={385} n={2} /><text x="660" y="395" fontSize="30" fontWeight="600" fill={ink}>主機找到檔案</text></Build>
          </Layer></Step>
          <Step duration={STEP_MS}><Layer h={420} label="檔案傳回來，瀏覽器畫成網頁">
            <MapArrow x1={1054} x2={1150} y={170} hot />
            <text x="1102" y="150" textAnchor="middle" fontSize="24" fill={amber}>送回來</text>
            <Build>
              <BrowserFrame x={1162} y={20} w={470} h={300} url="…/劉備" />
              <text x="1192" y="126" fontSize="40" fontWeight="600" fill={ink}>劉備</text>
              <rect x="1192" y="152" width="400" height="12" fill={rule} />
              <rect x="1192" y="180" width="340" height="12" fill={rule} />
              <rect x="1192" y="208" width="370" height="12" fill={rule} />
              <text x="1192" y="280" fontSize="28" fill={link} textDecoration="underline">桃園結義</text>
            </Build>
            <Build i={1}><SvgNum x={1186} y={385} n={3} /><text x="1222" y="395" fontSize="30" fontWeight="600" fill={ink}>瀏覽器畫成網頁</text></Build>
          </Layer></Step>
        </Steps>
      </Stage>
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={32}>網站就是放在別台電腦上的檔案</Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

// One of the three places the files live: a desk, a warehouse, a shop.
const PlacePanel = ({ x, kind, kicker, name, foot, tint, stroke, children }: { x: number; kind: IconKind; kicker: string; name: string; foot: string; tint: string; stroke: string; children: ReactNode }) => (
  <g>
    <rect x={x} y="0" width="500" height="440" fill={tint} />
    <rect x={x} y="0" width="500" height="6" fill={stroke} />
    <SvgIcon kind={kind} x={x + 56} y={66} size={60} color={stroke} />
    <text x={x + 104} y="52" fontSize="24" fontWeight="600" fill={stroke}>{kicker}</text>
    <text x={x + 104} y="92" fontSize="36" fontWeight="600" fill={ink}>{name}</text>
    {children}
    <text x={x + 28} y="414" fontSize="27" fill={muted}>{foot}</text>
  </g>
);

const ThreePlaces: Page = () => (
  <Shell chapter={1}>
    <Eyebrow>檔案在哪裡</Eyebrow>
    <Heading>檔案放在三個地方</Heading>
    <Lead>像書桌、倉庫、店面</Lead>
    <Fit>
      <Stage h={440}>
        <Steps>
          <Layer h={440} label="你的電腦：Obsidian 儲存庫，全部的卡，包括草稿">
            <InG i={0}><PlacePanel x={0} kind="folder" kicker="書桌" name="你的電腦" foot="全部的卡，只有你看得到" tint={linkSoft} stroke={link}>
              <CardRow x={28} y={130} w={444} name="劉備.md" on />
              <CardRow x={28} y={196} w={444} name="時間軸.md" on />
              <CardRow x={28} y={262} w={444} name="我的草稿.md" on={false} />
              <CardRow x={28} y={328} w={444} name="上課筆記.md" on={false} />
            </PlacePanel></InG>
          </Layer>
          <Step duration={STEP_MS}><Layer h={440} label="GitHub：網站的 repo，存勾選的卡和網站程式">
            <MapArrow x1={506} x2={562} y={220} hot />
            <text x="534" y="196" textAnchor="middle" fontSize="22" fontWeight="600" fill={link}>按發布</text>
            <Build><PlacePanel x={566} kind="repo" kicker="倉庫" name="GitHub" foot="勾選的卡＋網站程式" tint={surface} stroke={faint}>
              <text x="596" y="160" fontSize="27" fontFamily={mono} fill={ink}>my-garden/</text>
              <text x="620" y="208" fontSize="25" fontFamily={mono} fill={muted}>src/site/notes/</text>
              <text x="650" y="252" fontSize="25" fontFamily={mono} fill={ink}>劉備.md</text>
              <text x="650" y="296" fontSize="25" fontFamily={mono} fill={ink}>時間軸.md</text>
              <text x="620" y="344" fontSize="25" fontFamily={mono} fill={quiet}>package.json …</text>
            </PlacePanel></Build>
          </Layer></Step>
          <Step duration={STEP_MS}><Layer h={440} label="Vercel：做好的網頁和網址，所有人都看得到">
            <MapArrow x1={1072} x2={1128} y={220} hot />
            <text x="1100" y="196" textAnchor="middle" fontSize="22" fontWeight="600" fill={okGreen}>自動</text>
            <Build><PlacePanel x={1132} kind="globe" kicker="店面" name="Vercel" foot="做好的網頁，誰都看得到" tint={sage} stroke={okGreen}>
              <BrowserFrame x={1160} y={128} w={444} h={232} url="….vercel.app" />
              <text x="1186" y="226" fontSize="32" fontWeight="600" fill={ink}>劉備</text>
              <rect x="1186" y="246" width="360" height="12" fill={rule} />
              <rect x="1186" y="272" width="300" height="12" fill={rule} />
              <text x="1186" y="332" fontSize="26" fill={link} textDecoration="underline">桃園結義</text>
            </PlacePanel></Build>
          </Layer></Step>
        </Steps>
      </Stage>
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={36}>草稿只留在你的電腦裡</Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

const FlowStation = ({ x, kicker, name, fill, kind }: { x: number; kicker: string; name: string; fill: string; kind: IconKind }) => (
  <g>
    <rect x={x} y="0" width="330" height="360" fill={fill} />
    <rect x={x} y="0" width="330" height="5" fill={amber} />
    <text x={x + 26} y="48" fontSize="25" fontWeight="600" fill={amber}>{kicker}</text>
    <text x={x + 26} y="96" fontSize="34" fontWeight="600" fill={ink}>{name}</text>
    <SvgIcon kind={kind} x={x + 296} y={36} size={40} color={muted} />
  </g>
);

const FourStops: Page = () => (
  <Shell chapter={1}>
    <Eyebrow>從筆記到網址</Eyebrow>
    <Heading>筆記變成網址的四站</Heading>
    <Fit>
      <Stage h={450}>
        <Steps>
          <Layer h={450} label="第一站：在 Obsidian 寫卡，勾了 dg-publish 的才要公開">
            <InG i={0}><FlowStation x={0} kicker="1 寫卡" name="Obsidian" fill={linkSoft} kind="doc" /></InG>
            <InG i={1}><CardRow x={20} y={140} w={290} name="劉備" on /><CardRow x={20} y={206} w={290} name="時間軸" on /><CardRow x={20} y={272} w={290} name="我的草稿" on={false} /></InG>
          </Layer>
          <Step duration={STEP_MS}><Layer h={450} label="第二站：Digital Garden 外掛只把勾選的卡送出去">
            <MapArrow x1={338} x2={426} y={180} hot />
            <FlowStation x={434} kicker="2 送出" name="Digital Garden" fill={amberSoft} kind="plug" />
            <Build>
              <path d="M470 140 H730 L650 230 V300 H550 V230 Z" fill="#FFFFFF" stroke={amber} strokeWidth="2" />
              <text x="600" y="186" textAnchor="middle" fontSize="26" fill={ink}>只收勾選的</text>
              <TickBox x={587} y={246} on />
            </Build>
            <text x="382" y="160" textAnchor="middle" fontSize="24" fontWeight="600" fill={link}>按發布</text>
            <Build i={1}>
              <path d="M10 382 V398 H754 V382" fill="none" stroke={link} strokeWidth="3" />
              <text x="382" y="436" textAnchor="middle" fontSize="28" fontWeight="600" fill={link}>你動手：勾選 → 按發布</text>
            </Build>
          </Layer></Step>
          <Step duration={STEP_MS}><Layer h={450} label="第三站：GitHub 存一份公開版本">
            <MapArrow x1={772} x2={860} y={180} hot />
            <FlowStation x={868} kicker="3 存檔" name="GitHub" fill={surface} kind="repo" />
            <Build>
              <Folder x={920} y={150} w={226} h={150} fill="#FFFFFF" stroke={faint} sw={3} />
              <text x="1033" y="250" textAnchor="middle" fontSize="27" fontFamily={mono} fill={ink}>my-garden</text>
            </Build>
            <Build i={1}><text x="1033" y="350" textAnchor="middle" fontSize="25" fill={muted}>收到新版本</text></Build>
          </Layer></Step>
          <Step duration={STEP_MS}><Layer h={450} label="第四站：Vercel 做成網頁，給一個網址">
            <MapArrow x1={1206} x2={1294} y={180} hot />
            <FlowStation x={1302} kicker="4 上架" name="Vercel" fill={sage} kind="globe" />
            <Build>
              <BrowserFrame x={1322} y={140} w={290} h={180} url="….vercel.app" />
              <g stroke={link} strokeWidth="5"><path d="M1346 236 H1500" /><path d="M1346 268 H1460" /></g>
            </Build>
            <text x="1250" y="160" textAnchor="middle" fontSize="24" fontWeight="600" fill={okGreen}>自動</text>
            <Build i={1}>
              <path d="M878 382 V398 H1622 V382" fill="none" stroke={okGreen} strokeWidth="3" />
              <text x="1250" y="436" textAnchor="middle" fontSize="28" fontWeight="600" fill={okGreen}>自動：GitHub 收到後，Vercel 建置、上線</text>
            </Build>
          </Layer></Step>
        </Steps>
      </Stage>
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={28}>你只按一次發布，GitHub 收到後就自動上線</Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

// One box in a lane of work: an icon and a short label.
const LaneBox = ({ x, y, kind, label, tone }: { x: number; y: number; kind: IconKind; label: string; tone: 'plain' | 'hand' | 'auto' | 'you' }) => {
  const stroke = tone === 'auto' ? okGreen : tone === 'hand' ? warn : tone === 'you' ? link : faint;
  const fill = tone === 'auto' ? sage : tone === 'hand' ? warnSoft : tone === 'you' ? linkSoft : '#FFFFFF';
  return (
    <g>
      <rect x={x} y={y} width="330" height="120" fill={fill} stroke={stroke} strokeWidth="2" />
      <SvgIcon kind={kind} x={x + 58} y={y + 60} size={60} color={stroke} />
      <text x={x + 104} y={y + 72} fontSize="32" fontWeight="600" fill={ink}>{label}</text>
    </g>
  );
};

const CiCd: Page = () => (
  <Shell chapter={1}>
    <Eyebrow>CI/CD＝持續整合／持續部署</Eyebrow>
    <Heading>CI/CD：推上去就自動更新</Heading>
    <Lead>像投郵筒：信投進去，郵差會送到</Lead>
    <Fit>
      <Stage h={470}>
        <Steps>
          <Layer h={470} label="以前：改好檔案後，每次都要自己上傳、自己重做網頁">
            <InG i={0}><text x="0" y="30" fontSize="28" fontWeight="600" fill={warn}>以前：每次自己搬</text></InG>
            <InG i={1}><LaneBox x={0} y={50} kind="doc" label="改好檔案" tone="plain" /></InG>
            <InG i={2}><MapArrow x1={338} x2={426} y={110} /><LaneBox x={434} y={50} kind="user" label="自己上傳" tone="hand" /></InG>
            <InG i={3}><MapArrow x1={772} x2={860} y={110} /><LaneBox x={868} y={50} kind="user" label="自己重做網頁" tone="hand" /></InG>
            <InG i={4}><MapArrow x1={1206} x2={1294} y={110} /><LaneBox x={1302} y={50} kind="globe" label="上線" tone="plain" /></InG>
          </Layer>
          <Step duration={STEP_MS}><Layer h={470} label="CI/CD：你按發布送上 GitHub，之後建置和上線都自動跑">
            <text x="0" y="270" fontSize="28" fontWeight="600" fill={amber}>CI/CD：你只投信，送信自動</text>
            <Build><LaneBox x={0} y={290} kind="doc" label="改好檔案" tone="plain" /></Build>
            <Build i={1}><MapArrow x1={338} x2={426} y={350} hot /><LaneBox x={434} y={290} kind="mail" label="按發布" tone="you" /><text x="599" y="446" textAnchor="middle" fontSize="25" fontWeight="600" fill={link}>手動：送上 GitHub</text></Build>
            <Build i={2}><MapArrow x1={772} x2={860} y={350} hot /><LaneBox x={868} y={290} kind="gear" label="自動建置" tone="auto" /></Build>
            <Build i={3}><MapArrow x1={1206} x2={1294} y={350} hot /><LaneBox x={1302} y={290} kind="globe" label="自動上線" tone="auto" /></Build>
            <Build i={4}><path d="M868 418 V428 H1632 V418" fill="none" stroke={okGreen} strokeWidth="3" /><text x="1250" y="458" textAnchor="middle" fontSize="25" fontWeight="600" fill={okGreen}>GitHub 收到後，自動跑</text></Build>
          </Layer></Step>
        </Steps>
      </Stage>
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={28}>你按發布；之後的建置、上線都自動</Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

// One moment on the update timeline.
const TICK_XS = [110, 460, 810, 1160, 1510];

const Tick = ({ x, time, kind, label, sub, hot = false, manual = false }: { x: number; time: string; kind: IconKind; label: string; sub: string; hot?: boolean; manual?: boolean }) => (
  <g>
    <circle cx={x} cy="66" r="62" fill={hot ? amberSoft : '#FFFFFF'} stroke={hot ? amber : rule} strokeWidth="2" />
    <SvgIcon kind={kind} x={x} y={66} size={72} color={hot ? amber : muted} />
    <text x={x} y="182" textAnchor="middle" fontSize="28" fontWeight="600" fill={manual ? link : okGreen}>{time}</text>
    <circle cx={x} cy="230" r="20" fill={hot ? okGreen : '#FFFFFF'} stroke={manual ? link : okGreen} strokeWidth="4" />
    <text x={x} y="306" textAnchor="middle" fontSize="36" fontWeight="600" fill={ink}>{label}</text>
    <text x={x} y="352" textAnchor="middle" fontSize="27" fill={muted}>{sub}</text>
  </g>
);

const UpdateTimeline: Page = () => (
  <Shell chapter={1}>
    <Eyebrow>一次更新的流程｜時間為示意</Eyebrow>
    <Heading>改一句，網站跟著更新</Heading>
    <Fit>
      <Stage h={430}>
        <Steps>
          <Layer h={430} label="你動手：在〈劉備〉補一句">
            <line x1={TICK_XS[0]} y1="230" x2={TICK_XS[4]} y2="230" stroke={rule} strokeWidth="4" />
            <InG i={0}><Tick x={TICK_XS[0]} time="你動手" kind="doc" label="改一句" sub="〈劉備〉補一句" manual /></InG>
          </Layer>
          <Step duration={STEP_MS}><Layer h={430} label="你動手：按發布">
            <g fill="none" stroke={link} strokeWidth="5"><StepPath d={`M${TICK_XS[0] + 20} 230 H${TICK_XS[1] - 20}`} /></g>
            <Build i={1}><Tick x={TICK_XS[1]} time="你動手" kind="upload" label="按發布" sub="外掛送出" manual /></Build>
          </Layer></Step>
          <Step duration={STEP_MS}><Layer h={430} label="自動：GitHub 收到新版本">
            <g fill="none" stroke={okGreen} strokeWidth="5"><StepPath d={`M${TICK_XS[1] + 20} 230 H${TICK_XS[2] - 20}`} /></g>
            <Build i={1}><Tick x={TICK_XS[2]} time="自動" kind="repo" label="GitHub 收到" sub="多一筆紀錄" /></Build>
          </Layer></Step>
          <Step duration={STEP_MS}><Layer h={430} label="自動：Vercel 建置">
            <g fill="none" stroke={okGreen} strokeWidth="5"><StepPath d={`M${TICK_XS[2] + 20} 230 H${TICK_XS[3] - 20}`} /></g>
            <Build i={1}><Tick x={TICK_XS[3]} time="自動" kind="gear" label="Vercel 建置" sub="整個網站重做" /></Build>
          </Layer></Step>
          <Step duration={STEP_MS}><Layer h={430} label="網址更新：按發布後幾秒到一兩分鐘">
            <g fill="none" stroke={okGreen} strokeWidth="5"><StepPath d={`M${TICK_XS[3] + 20} 230 H${TICK_XS[4] - 20}`} /></g>
            <Build i={1}><Tick x={TICK_XS[4]} time="自動" kind="globe" label="網址更新" sub="重新整理就看到" hot /></Build>
            <Build i={2}>
              <path d={`M${TICK_XS[1]} 380 V394 H${TICK_XS[4]} V380`} fill="none" stroke={amber} strokeWidth="3" />
              <text x={(TICK_XS[1] + TICK_XS[4]) / 2} y="428" textAnchor="middle" fontSize="27" fontWeight="600" fill={amber}>按發布後，幾秒到一兩分鐘（示意）</text>
            </Build>
          </Layer></Step>
        </Steps>
      </Stage>
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={36}>沒變的話，先等兩分鐘再重新整理</Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

const BuildStep: Page = () => (
  <Shell chapter={1}>
    <Eyebrow>建置（Build）</Eyebrow>
    <Heading>建置：把 .md 做成網頁</Heading>
    <Lead>像照食譜，做出一道菜</Lead>
    <Fit>
      <Stage h={430}>
        <Steps>
          <Layer h={430} label="原始檔 人物/劉備.md：開頭三行屬性，內文有 [[關羽]]、[[張飛]] 兩個連結">
            <InG i={0}>
              <DocShape x={0} y={0} w={620} h={420} />
              <text x="32" y="50" fontSize="25" fill={quiet}>人物/劉備.md（原始檔）</text>
              <line x1="32" y1="72" x2="580" y2="72" stroke={rule} strokeWidth="2" />
            </InG>
            <InG i={1}>
              <text x="32" y="124" fontSize="30" fontFamily={mono} fill={quiet}>---</text>
              <text x="32" y="168" fontSize="30" fontFamily={mono} fill={quiet}>dg-publish: true</text>
              <text x="32" y="212" fontSize="30" fontFamily={mono} fill={quiet}>---</text>
              <text x="32" y="272" fontSize="32" fontFamily={mono} fontWeight="600" fill={ink}># 劉備</text>
              <text x="32" y="330" fontSize="30" fontFamily={mono} fill={ink}>第 1 回和 <tspan fill={link}>[[關羽]]</tspan>、</text>
              <text x="32" y="378" fontSize="30" fontFamily={mono} fill={ink}><tspan fill={link}>[[張飛]]</tspan> 桃園結義。</text>
            </InG>
          </Layer>
          <Step duration={STEP_MS}><Layer h={430} label="Vercel 建置：照模板把原始檔做成網頁">
            <Build>
              <SvgIcon kind="gear" x={810} y={150} size={110} color={amber} />
              <text x="810" y="258" textAnchor="middle" fontSize="31" fontWeight="600" fill={ink}>Vercel 建置</text>
            </Build>
            <MapArrow x1={640} x2={980} y={310} hot />
          </Layer></Step>
          <Step duration={STEP_MS}><Layer h={430} label="做好的網頁：屬性不見了，[[關羽]]、[[張飛]] 變成可以點的連結">
            <Build>
              <BrowserFrame x={1000} y={0} w={632} h={420} url="…/人物/劉備/" />
              <text x="1036" y="140" fontSize="48" fontWeight="600" fill={ink}>劉備</text>
              <text x="1036" y="236" fontSize="34" fill={ink}>第 1 回和 <tspan fill={link} textDecoration="underline">關羽</tspan>、</text>
              <text x="1036" y="292" fontSize="34" fill={ink}><tspan fill={link} textDecoration="underline">張飛</tspan> 桃園結義。</text>
            </Build>
            <Build i={1}><text x="1036" y="384" fontSize="25" fill={quiet}>開頭三行不會顯示</text></Build>
          </Layer></Step>
        </Steps>
      </Stage>
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={36}>[[連結]] 是在建置時才變成網址</Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

const PublishFilter: Page = () => (
  <Shell chapter={1}>
    <Eyebrow>公開範圍</Eyebrow>
    <Heading>dg-publish 決定哪些卡上網</Heading>
    <Fit>
      <Stage h={450}>
        <Steps>
          <Layer h={450} label="你的儲存庫有五張卡，三張勾了 dg-publish，兩張沒勾">
            <InG i={0}><SvgIcon kind="folder" x={26} y={22} size={44} color={link} /><text x="60" y="34" fontSize="28" fontWeight="600" fill={ink}>你的儲存庫</text><TickBox x={250} y={12} on /><text x="288" y="34" fontSize="25" fill={muted}>＝開頭寫了 dg-publish: true</text></InG>
            <InG i={1}><CardRow x={0} y={70} w={360} name="三國演義" on /><CardRow x={0} y={140} w={360} name="劉備" on /><CardRow x={0} y={210} w={360} name="時間軸" on /></InG>
            <InG i={2}><CardRow x={0} y={280} w={360} name="我的草稿" on={false} /><CardRow x={0} y={350} w={360} name="上課筆記" on={false} /></InG>
            <InG i={3}>
              <path d="M520 90 H900 L760 250 V330 H660 V250 Z" fill={amberSoft} stroke={amber} strokeWidth="3" />
              <text x="710" y="150" textAnchor="middle" fontSize="30" fontFamily={mono} fontWeight="600" fill={ink}>dg-publish</text>
              <text x="710" y="196" textAnchor="middle" fontSize="25" fill={muted}>只讓打勾的過</text>
            </InG>
            <g fill="none" stroke={faint} strokeWidth="3"><DrawPath i={4} d="M370 98 C440 98 470 130 540 140" /><DrawPath i={4} d="M370 168 C440 168 470 160 560 170" /><DrawPath i={4} d="M370 238 C440 238 480 200 590 200" /></g>
          </Layer>
          <Step duration={STEP_MS}><Layer h={450} label="網站上只出現三張打勾的卡">
            <MapArrow x1={780} x2={1010} y={300} hot />
            <text x="895" y="282" textAnchor="middle" fontSize="25" fontWeight="600" fill={link}>按發布才送出</text>
            <Build>
              <BrowserFrame x={1030} y={40} w={602} h={380} url="….vercel.app" />
              <SvgChip x={1070} y={130} w={300} h={60} label="三國演義" size={28} />
              <SvgChip x={1070} y={210} w={300} h={60} label="劉備" size={28} />
              <SvgChip x={1070} y={290} w={300} h={60} label="時間軸" size={28} />
              <OkDot x={1420} y={210} r={30} />
            </Build>
          </Layer></Step>
          <Step duration={STEP_MS}><Layer h={450} label="沒勾的兩張留在你的電腦">
            <Build>
              <rect x="380" y="372" width="300" height="54" fill={surface} stroke={faint} strokeWidth="2" strokeDasharray="8 6" />
              <text x="530" y="408" textAnchor="middle" fontSize="27" fill={muted}>留在你的電腦</text>
              <path d="M368 336 C376 360 378 380 380 392" fill="none" stroke={faint} strokeWidth="3" />
            </Build>
          </Layer></Step>
        </Steps>
      </Stage>
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={32}>dg-publish 只是選卡，按發布才會上去</Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

// ---------- 02 建立網站 ----------

const Section2: Page = () => <SectionPage chapter={2} label="02 / 部署" lead="用模板在 GitHub 建 repo，交給 Vercel 上架" />;

const GitHubAccount: Page = () => (
  <Shell chapter={2}>
    <Eyebrow>回顧上週作業</Eyebrow>
    <Heading>課前作業：GitHub 帳號</Heading>
    <Fit>
      <div style={{ display: 'grid', gridTemplateColumns: '720px 1fr', gap: 72, alignItems: 'center' }}>
        <In i={0}>
          <Figure w={720} h={440} label="GitHub 個人頁示意：大頭貼、帳號名稱、Repositories">
            <rect x="0" y="0" width="720" height="436" fill="#FFFFFF" stroke={rule} strokeWidth="2" />
            <rect x="0" y="0" width="720" height="56" fill="#24292F" />
            <text x="26" y="37" fontSize="24" fontFamily={mono} fill="#FFFFFF">github.com/你的帳號</text>
            <circle cx="150" cy="200" r="86" fill={surface} stroke={rule} strokeWidth="2" />
            <SvgIcon kind="user" x={150} y={200} size={110} color={faint} />
            <text x="280" y="188" fontSize="42" fontWeight="600" fill={ink}>你的帳號</text>
            <text x="280" y="232" fontSize="25" fill={quiet}>Username</text>
            <line x1="40" y1="318" x2="680" y2="318" stroke={rule} strokeWidth="2" />
            <text x="40" y="372" fontSize="27" fill={ink}>Repositories</text>
            <SvgChip x={232} y={344} w={60} h={40} label="0" size={24} fill={raised} />
          </Figure>
          <Caption>示意圖</Caption>
        </In>
        <div>
          <Steps>
            <div style={{ fontSize: 34, fontWeight: 600, marginBottom: 30 }}>上週作業完成了嗎？</div>
            <Step duration={STEP_MS}><div style={{ marginBottom: 22 }}><StatusLine ok size={32}>點過驗證信</StatusLine></div></Step>
            <Step duration={STEP_MS}><div style={{ marginBottom: 22 }}><StatusLine ok size={32}>登得進 github.com</StatusLine></div></Step>
            <Step duration={STEP_MS}><div style={{ marginBottom: 22 }}><StatusLine ok size={32}>記下 Username</StatusLine></div></Step>
            <Step duration={STEP_MS}><div><StatusLine ok size={32}>Vercel 用 GitHub 登入</StatusLine></div></Step>
          </Steps>
        </div>
      </div>
      <Steps><Step duration={STEP_MS}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 48, fontSize: 26, whiteSpace: 'nowrap' }}>
          <span style={{ fontWeight: 600, color: amber }}>還沒註冊：</span>
          <CatchChip>github.com 註冊，約 5 分</CatchChip><span style={{ color: faint }}>→</span>
          <CatchChip>收驗證信</CatchChip><span style={{ color: faint }}>→</span>
          <CatchChip>Vercel：Continue with GitHub</CatchChip>
          <span style={{ color: muted }}>｜等信時看鄰座畫面</span>
        </div>
      </Step></Steps>
    </Fit>
  </Shell>
);

// One step of the catch-up route for students without an account yet.
const CatchChip = ({ children }: { children: ReactNode }) => (
  <span style={{ background: amberSoft, border: `2px solid ${amber}`, padding: '8px 18px' }}>{children}</span>
);

const VersionRow = ({ y, label, hot = false }: { y: number; label: string; hot?: boolean }) => (
  <g>
    <rect x="40" y={y} width="680" height="62" fill={hot ? amberSoft : '#FFFFFF'} stroke={hot ? amber : rule} strokeWidth="2" />
    <circle cx="76" cy={y + 31} r="10" fill={hot ? amber : faint} />
    <text x="104" y={y + 41} fontSize="28" fill={ink}>{label}</text>
  </g>
);

const Division: Page = () => (
  <Shell chapter={2}>
    <Eyebrow>兩個服務</Eyebrow>
    <Heading>GitHub 和 Vercel 的分工</Heading>
    <Lead>倉庫收貨記帳，店面負責開門</Lead>
    <Fit>
      <Stage h={420}>
        <Steps>
          <Layer h={420} label="GitHub：存網站的檔案，每次修改都留一版">
            <InG i={0}>
              <rect x="0" y="0" width="760" height="410" fill={surface} />
              <rect x="0" y="0" width="760" height="6" fill={faint} />
              <SvgIcon kind="repo" x={60} y={62} size={60} color={muted} />
              <text x="108" y="52" fontSize="24" fontWeight="600" fill={quiet}>倉庫</text>
              <text x="108" y="90" fontSize="36" fontWeight="600" fill={ink}>GitHub</text>
            </InG>
            <InG i={1}><VersionRow y={130} label="第 3 版：加了〈時間軸〉" hot /></InG>
            <InG i={2}><VersionRow y={206} label="第 2 版：改了首頁" /></InG>
            <InG i={3}><VersionRow y={282} label="第 1 版：建立網站" /></InG>
            <InG i={4}><text x="40" y="390" fontSize="27" fill={muted}>每次修改都留一版</text></InG>
          </Layer>
          <Step duration={STEP_MS}><Layer h={420} label="Vercel：看到新版本就建置，給一個網址">
            <MapArrow x1={770} x2={862} y={160} hot />
            <text x="816" y="140" textAnchor="middle" fontSize="24" fill={amber}>新版</text>
            <Build>
              <rect x="872" y="0" width="760" height="410" fill={sage} />
              <rect x="872" y="0" width="760" height="6" fill={okGreen} />
              <SvgIcon kind="globe" x={932} y={62} size={60} color={okGreen} />
              <text x="980" y="52" fontSize="24" fontWeight="600" fill={okGreen}>店面</text>
              <text x="980" y="90" fontSize="36" fontWeight="600" fill={ink}>Vercel</text>
            </Build>
            <Build i={1}>
              <SvgChip x={912} y={140} w={190} h={62} label="拿最新版" size={27} />
              <MapArrow x1={1110} x2={1150} y={171} />
              <SvgChip x={1158} y={140} w={170} h={62} label="建置" size={27} />
              <MapArrow x1={1336} x2={1376} y={171} />
              <SvgChip x={1384} y={140} w={208} h={62} label="換上新網頁" size={27} />
            </Build>
            <Build i={2}>
              <rect x="912" y="250" width="680" height="62" rx="31" fill="#FFFFFF" stroke={okGreen} strokeWidth="2" />
              <text x="1252" y="291" textAnchor="middle" fontSize="27" fontFamily={mono} fill={ink}>my-garden-….vercel.app</text>
              <text x="912" y="390" fontSize="27" fill={muted}>給你一個網址</text>
            </Build>
          </Layer></Step>
        </Steps>
      </Stage>
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={36}>GitHub 有新版，Vercel 就重做網站</Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

// The Vercel screens the learner will see after pressing the button, drawn simply.
const WizardPane = ({ x, w, n, title, children }: { x: number; w: number; n: number; title: string; children: ReactNode }) => (
  <g>
    <rect x={x} y="30" width={w} height="400" fill="#FFFFFF" stroke={rule} strokeWidth="2" />
    <rect x={x} y="30" width={w} height="58" fill="#111111" />
    <text x={x + 26} y="68" fontSize="26" fill="#FFFFFF">▲ Vercel</text>
    <SvgNum x={x} y={30} n={n} />
    <text x={x + 28} y="146" fontSize="34" fontWeight="600" fill={ink}>{title}</text>
    {children}
  </g>
);

const DeploySite: Page = () => (
  <Shell chapter={2}>
    <Eyebrow>官方入門頁＋Vercel｜畫面示意</Eyebrow>
    <Heading>用模板部署網站</Heading>
    <Fit>
      <Stage h={440}>
        <Steps>
          <Layer h={440} label="Digital Garden 官方入門頁的 Deploy to Vercel 按鈕">
            <InG i={0}>
              <DocShape x={0} y={30} w={380} h={400} fill={surface} />
              <text x="28" y="92" fontSize="26" fill={quiet}>官方入門頁</text>
              <text x="28" y="156" fontSize="36" fontWeight="600" fill={ink}>Digital Garden</text>
              <text x="28" y="204" fontSize="36" fontWeight="600" fill={ink}>模板</text>
              <rect x="28" y="290" width="324" height="76" rx="8" fill="#111111" />
              <text x="190" y="339" textAnchor="middle" fontSize="28" fontWeight="600" fill="#FFFFFF">▲ Deploy to Vercel</text>
            </InG>
            <PopG i={2}><SvgNum x={0} y={30} n={1} /></PopG>
          </Layer>
          <Step duration={STEP_MS}><Layer h={440} label="Vercel：Git Scope 選你的帳號，Repository Name 填 my-garden，按 Create">
            <MapArrow x1={390} x2={452} y={230} hot />
            <Build><WizardPane x={470} w={560} n={2} title="Create Git Repository">
              <text x="498" y="210" fontSize="28" fill={muted}>Git Scope：你的帳號</text>
              <text x="498" y="262" fontSize="28" fill={muted}>Repository Name</text>
              <rect x="498" y="280" width="504" height="58" fill="#FFFFFF" stroke={faint} strokeWidth="2" /><text x="516" y="320" fontSize="30" fontFamily={mono} fill={ink}>my-garden</text>
              <rect x="828" y="356" width="174" height="56" rx="6" fill="#111111" /><text x="915" y="393" textAnchor="middle" fontSize="28" fill="#FFFFFF">Create</text>
            </WizardPane></Build>
          </Layer></Step>
          <Step duration={STEP_MS}><Layer h={440} label="部署完成：出現網址，打開會看到模板首頁">
            <MapArrow x1={1040} x2={1102} y={230} hot />
            <Build><WizardPane x={1120} w={512} n={3} title="部署完成">
              <text x="1148" y="206" fontSize="28" fill={muted}>等 1–2 分鐘</text>
              <text x="1148" y="258" fontSize="36" fontWeight="600" fill={okGreen}>Congratulations!</text>
              <rect x="1146" y="290" width="460" height="56" rx="28" fill={sage} /><text x="1170" y="327" fontSize="26" fontFamily={mono} fill={ink}>my-garden-….vercel.app</text>
              <text x="1148" y="398" fontSize="28" fontWeight="600" fill={link}>點網址，打開看看</text>
            </WizardPane></Build>
          </Layer></Step>
        </Steps>
      </Stage>
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={36}>打得開模板首頁，才算部署好</Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

// One stop in a practice flow: a numbered icon, then what to do.
const FlowStep = ({ i, n, kind, label, sub, w = 400 }: { i: number; n: number; kind: IconKind; label: string; sub?: ReactNode; w?: number }) => (
  <In i={i} style={{ width: w, textAlign: 'center', display: 'grid', justifyItems: 'center' }}>
    <div style={{ position: 'relative', width: 170, height: 170, borderRadius: 85, background: '#FFFFFF', border: `2px solid ${rule}`, display: 'grid', placeItems: 'center' }}>
      <Icon kind={kind} size={96} color={ink} />
      <span style={{ position: 'absolute', left: -6, top: -6 }}><NumDot n={n} size={52} /></span>
    </div>
    <div style={{ fontSize: 36, fontWeight: 600, marginTop: 26, lineHeight: 1.35 }}>{label}</div>
    {sub ? <div style={{ fontSize: 26, color: muted, marginTop: 10 }}>{sub}</div> : null}
  </In>
);

const FlowArrow = ({ i }: { i: number }) => <In i={i} style={{ color: faint, fontSize: 60, lineHeight: 1, marginTop: 52 }}>→</In>;

const Practice1: Page = () => (
  <Shell chapter={2}>
    <PracticeEyebrow time="13 分鐘">練習 1｜部署</PracticeEyebrow>
    <Heading>練習（部署）：建立自己的網站</Heading>
    <PillRow>
      <Pill tag="定位">官方模板</Pill>
      <Pill tag="期望輸出">打得開的網站</Pill>
      <Pill tag="限制">卡 5 分鐘就舉手</Pill>
    </PillRow>
    <Fit>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', gap: 16 }}>
        <FlowStep i={1} n={1} w={330} kind="user" label="登入兩個帳號" sub="GitHub、Vercel" />
        <FlowArrow i={2} />
        <FlowStep i={3} n={2} w={330} kind="upload" label="按 Deploy" sub="Deploy to Vercel" />
        <FlowArrow i={4} />
        <FlowStep i={5} n={3} w={330} kind="repo" label="取名 my-garden" sub="按 Create" />
        <FlowArrow i={6} />
        <FlowStep i={7} n={4} w={330} kind="globe" label="打開網址" sub="看到模板首頁" />
      </div>
      <Steps>
        <Step duration={STEP_MS}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 40, marginTop: 56 }}>
            <div style={{ background: sage, padding: '16px 30px' }}><StatusLine ok size={32}>網址打得開模板首頁：完成</StatusLine></div>
            <div style={{ background: warnSoft, padding: '16px 30px' }}><StatusLine ok={false} size={32}>只拿到網址，還不算</StatusLine></div>
          </div>
        </Step>
      </Steps>
    </Fit>
  </Shell>
);

// ---------- 03 連接 Obsidian ----------

const Section3: Page = () => <SectionPage chapter={3} label="03 / 連接" lead="裝外掛、建 token，讓 Obsidian 寫得進 repo" />;

// The token as a key that opens one door only.
const Door = ({ x, label, open }: { x: number; label: string; open: boolean }) => (
  <g>
    <rect x={x} y="30" width="190" height="270" fill={open ? sage : surface} stroke={open ? okGreen : faint} strokeWidth="3" />
    {open ? <path d={`M${x} 30 L${x + 80} 56 V326 L${x} 300 Z`} fill="#FFFFFF" stroke={okGreen} strokeWidth="3" /> : <circle cx={x + 156} cy="170" r="9" fill={faint} />}
    <text x={x + 95} y="356" textAnchor="middle" fontSize="28" fontFamily={open ? mono : undefined} fill={open ? okGreen : quiet} fontWeight={open ? 600 : 400}>{label}</text>
  </g>
);

const TokenDoors: Page = () => (
  <Shell chapter={3}>
    <Eyebrow>token＝存取權杖</Eyebrow>
    <Heading>token：只開一扇門的鑰匙</Heading>
    <Lead>像給快遞一把只開信箱的鑰匙</Lead>
    <Fit>
      <Stage h={400}>
        <Steps>
          <Layer h={400} label="Obsidian 的 Digital Garden 外掛拿著一把 token">
            <InG i={0}>
              <rect x="0" y="40" width="440" height="280" fill={linkSoft} stroke={link} strokeWidth="2" />
              <text x="32" y="96" fontSize="34" fontWeight="600" fill={ink}>Obsidian</text>
              <text x="32" y="140" fontSize="27" fill={muted}>Digital Garden 外掛</text>
            </InG>
            <PopG i={2}><circle cx="220" cy="236" r="58" fill={amberSoft} stroke={amber} strokeWidth="3" /><SvgIcon kind="key" x={220} y={236} size={84} color={amber} /></PopG>
            <InG i={3}><text x="220" y="366" textAnchor="middle" fontSize="27" fill={amber} fontWeight="600">token</text></InG>
          </Layer>
          <Step duration={STEP_MS}><Layer h={400} label="GitHub 上有三個 repo：只有 my-garden 打得開">
            <MapArrow x1={460} x2={620} y={200} hot />
            <Build><Door x={660} label="其他 repo" open={false} /></Build>
            <Build i={1}><Door x={950} label="my-garden" open /></Build>
            <Build i={2}><Door x={1240} label="其他 repo" open={false} /></Build>
          </Layer></Step>
          <Step duration={STEP_MS}><Layer h={400} label="外掛可以寫進 my-garden，其他 repo 打不開">
            <Build><NoDot x={755} y={110} r={28} /><NoDot x={1335} y={110} r={28} /></Build>
            <Build i={1}><OkDot x={1100} y={110} r={30} /></Build>
          </Layer></Step>
        </Steps>
      </Stage>
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={36}>沒有 token，外掛進不了 repo</Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

const SetRow = ({ children, hot = false }: { children: ReactNode; hot?: boolean }) => (
  <div style={{ padding: '8px 22px', fontSize: 25, background: hot ? '#E7E5E4' : undefined, fontWeight: hot ? 600 : 400 }}>{children}</div>
);

const UiButton = ({ children, dark = false }: { children: ReactNode; dark?: boolean }) => (
  <span style={{ display: 'inline-block', padding: '8px 22px', background: dark ? link : '#FFFFFF', color: dark ? '#FFFFFF' : ink, border: `1px solid ${dark ? link : rule}`, borderRadius: 6, fontSize: 24 }}>{children}</span>
);

const InstallPlugin: Page = () => (
  <Shell chapter={3}>
    <Eyebrow>Obsidian 設定｜介面示意</Eyebrow>
    <Heading>安裝 Digital Garden 外掛</Heading>
    <Fit z={1.2}>
      <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: '1000px 1fr', gap: 48 }}>
        <In i={0} style={{ height: 470, border: `1px solid ${rule}`, background: '#FFFFFF', display: 'grid', gridTemplateColumns: '300px 1fr', boxShadow: '0 10px 30px rgba(28,25,23,0.08)' }}>
          <div style={{ background: surface, borderRight: `1px solid ${rule}`, paddingTop: 18 }}>
            <div style={{ padding: '0 22px 10px', fontSize: 22, color: quiet }}>設定</div>
            <SetRow>一般</SetRow><SetRow>編輯器</SetRow><SetRow>檔案與連結</SetRow><SetRow>外觀</SetRow><SetRow>快捷鍵</SetRow><SetRow>核心外掛程式</SetRow><SetRow hot>第三方外掛程式</SetRow>
          </div>
          <div style={{ padding: '28px 34px', display: 'grid', alignContent: 'start', gap: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 26 }}><span>受限模式</span><UiButton>關閉</UiButton></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 26 }}><span>社群外掛程式</span><UiButton dark>瀏覽</UiButton></div>
            <div style={{ border: `1px solid ${rule}`, padding: '18px 20px', background: '#FAFAF9' }}>
              <div style={{ border: `1px solid ${rule}`, background: '#FFFFFF', padding: '8px 16px', fontSize: 24, borderRadius: 4 }}>⌕ Digital Garden</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 18 }}>
                <span style={{ fontSize: 27, fontWeight: 600 }}>Digital Garden</span>
                <span style={{ display: 'flex', gap: 12 }}><UiButton dark>安裝</UiButton><UiButton>啟用</UiButton></span>
              </div>
            </div>
          </div>
        </In>
        <div style={{ display: 'grid', alignContent: 'start', gap: 34, paddingTop: 10 }}>
          <Steps>
            <Step duration={STEP_MS}><TourStep n={1} title="第三方外掛" box={[4, 374, 296, 56]} badge="right" /></Step>
            <Step duration={STEP_MS}><TourStep n={2} title="按「瀏覽」" box={[860, 92, 132, 60]} badge="right" /></Step>
            <Step duration={STEP_MS}><TourStep n={3} title="安裝、啟用" box={[316, 200, 668, 170]} /></Step>
          </Steps>
        </div>
      </div>
    </Fit>
  </Shell>
);

// GitHub's fine-grained token form, drawn simply, with the five places to touch.
const FormRow = ({ y, label, children }: { y: number; label: string; children: ReactNode }) => (
  <g>
    <text x="30" y={y} fontSize="25" fontWeight="600" fill={ink}>{label}</text>
    {children}
  </g>
);

const CreateToken: Page = () => (
  <Shell chapter={3}>
    <Eyebrow>GitHub 設定｜畫面示意，介面會改版</Eyebrow>
    <Heading>建立 GitHub token</Heading>
    <Fit>
      <div style={{ display: 'grid', gridTemplateColumns: '900px 1fr', gap: 60, alignItems: 'center' }}>
        <In i={0}>
          <Figure w={900} h={560} label="GitHub 建立 fine-grained token 的表單示意：Token name、Expiration 90 天、Only select repositories、兩個權限 Read and write、Generate token">
            <rect x="0" y="0" width="900" height="556" fill="#FFFFFF" stroke={rule} strokeWidth="2" />
            <rect x="0" y="0" width="900" height="54" fill="#24292F" />
            <text x="24" y="36" fontSize="23" fontFamily={mono} fill="#FFFFFF">github.com/settings/personal-access-tokens/new</text>
            <FormRow y={110} label="Token name"><rect x="330" y="80" width="420" height="44" fill="#FFFFFF" stroke={faint} strokeWidth="2" /><text x="344" y="111" fontSize="25" fontFamily={mono} fill={ink}>digital-garden</text></FormRow>
            <FormRow y={172} label="Expiration"><rect x="330" y="142" width="240" height="44" fill={linkSoft} stroke={link} strokeWidth="2" /><text x="344" y="173" fontSize="25" fill={ink}>90 days ▾</text><text x="590" y="173" fontSize="24" fill={quiet}>預設 30 天</text></FormRow>
            <FormRow y={236} label="Repository access">
              <circle cx="344" cy="228" r="9" fill="none" stroke={faint} strokeWidth="2" /><text x="362" y="236" fontSize="25" fill={quiet}>All repositories</text>
              <circle cx="344" cy="270" r="9" fill={link} /><text x="362" y="278" fontSize="25" fontWeight="600" fill={ink}>Only select repositories</text>
              <rect x="362" y="294" width="330" height="44" fill={linkSoft} stroke={link} strokeWidth="2" /><text x="376" y="325" fontSize="24" fontFamily={mono} fill={ink}>你的帳號/my-garden</text>
            </FormRow>
            <FormRow y={386} label="Permissions">
              <text x="344" y="386" fontSize="25" fill={ink}>Contents</text><text x="600" y="386" fontSize="25" fontWeight="600" fill={okGreen}>Read and write</text>
              <text x="344" y="428" fontSize="25" fill={ink}>Pull requests</text><text x="600" y="428" fontSize="25" fontWeight="600" fill={okGreen}>Read and write</text>
              <text x="344" y="470" fontSize="24" fill={quiet}>Metadata</text><text x="600" y="470" fontSize="24" fill={quiet}>Read-only（自動）</text>
            </FormRow>
            <rect x="30" y="490" width="250" height="50" rx="6" fill="#1F883D" /><text x="155" y="523" textAnchor="middle" fontSize="25" fontWeight="600" fill="#FFFFFF">Generate token</text>
            <SvgNum x={310} y={270} n={1} />
            <SvgNum x={300} y={378} n={2} />
            <SvgNum x={300} y={420} n={3} />
            <SvgNum x={310} y={164} n={4} />
            <SvgNum x={306} y={515} n={5} />
          </Figure>
        </In>
        <div style={{ display: 'grid', gap: 26 }}>
          <Steps>
            <div style={{ fontSize: 28, fontWeight: 600, color: amber }}>按鈕會換位置，確認這五件事</div>
            <Step duration={STEP_MS}><Callout n={1} title="只選網站那一個 repo" detail="Only select repositories" /></Step>
            <Step duration={STEP_MS}><Callout n={2} title="Contents：讀寫" detail="外掛把筆記寫進 repo" /></Step>
            <Step duration={STEP_MS}><Callout n={3} title="Pull requests：讀寫" detail="外掛更新網站模板時用" /></Step>
            <Step duration={STEP_MS}><Callout n={4} title="有到期日" detail="例如 90 天，到期再重產" /></Step>
            <Step duration={STEP_MS}><Callout n={5} title="產生後馬上複製" detail="只顯示這一次" /></Step>
          </Steps>
        </div>
      </div>
    </Fit>
  </Shell>
);

const NoPlace = ({ y, label }: { y: number; label: string }) => (
  <g>
    <rect x="1172" y={y} width="460" height="76" fill={warnSoft} stroke={warn} strokeWidth="2" />
    <NoDot x={1212} y={y + 38} r={20} />
    <text x="1248" y={y + 48} fontSize="29" fill={ink}>{label}</text>
  </g>
);

const TokenSafety: Page = () => (
  <Shell chapter={3}>
    <Eyebrow>token 的保管</Eyebrow>
    <Heading>token 要像密碼一樣收好</Heading>
    <Fit>
      <Stage h={440}>
        <Steps>
          <Layer h={440} label="中間是一把 token">
            <PopG i={0}><circle cx="816" cy="170" r="120" fill={amberSoft} stroke={amber} strokeWidth="3" /><SvgIcon kind="key" x={816} y={170} size={150} color={amber} /></PopG>
            <InG i={1}><text x="816" y="336" textAnchor="middle" fontSize="28" fontFamily={mono} fill={muted}>github_pat_…</text></InG>
          </Layer>
          <Step duration={STEP_MS}><Layer h={440} label="只放一個地方：外掛設定的 GitHub token 欄位">
            <g fill="none" stroke={okGreen} strokeWidth="4"><StepPath d="M694 170 H470" /></g>
            <Build i={1}>
              <rect x="0" y="100" width="460" height="140" fill={sage} stroke={okGreen} strokeWidth="2" />
              <OkDot x={44} y={140} r={22} />
              <text x="80" y="150" fontSize="30" fontWeight="600" fill={ink}>只貼在外掛設定</text>
              <text x="80" y="200" fontSize="26" fill={muted}>GitHub token 欄位</text>
            </Build>
          </Layer></Step>
          <Step duration={STEP_MS}><Layer h={440} label="不要貼進筆記、截圖或聊天群組">
            <g fill="none" stroke={warn} strokeWidth="3" strokeDasharray="8 8"><path d="M936 150 L1160 78" /><path d="M938 172 H1160" /><path d="M936 194 L1160 266" /></g>
            <Build><NoPlace y={40} label="貼進筆記" /></Build>
            <Build i={1}><NoPlace y={134} label="截圖、投影片" /></Build>
            <Build i={2}><NoPlace y={228} label="LINE 群組、Email" /></Build>
          </Layer></Step>
          <Step duration={STEP_MS}><Layer h={440} label="90 天到期，回 GitHub 按 Regenerate">
            <Build>
              <rect x="476" y="372" width="680" height="64" rx="32" fill="#FFFFFF" stroke={amber} strokeWidth="2" />
              <SvgIcon kind="clock" x={520} y={404} size={42} color={amber} />
              <text x="556" y="414" fontSize="28" fill={ink}>90 天到期 → 回 GitHub 按 Regenerate</text>
            </Build>
          </Layer></Step>
        </Steps>
      </Stage>
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={32}>外流了：到 GitHub 刪掉，重建一把</Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

const ConnectGitHub: Page = () => (
  <Shell chapter={3}>
    <Eyebrow>設定 → Digital Garden</Eyebrow>
    <Heading>把 token 填進外掛</Heading>
    <Fit>
      <In i={0} style={{ position: 'relative', width: 1240, margin: '0 auto' }}>
        <Screenshot src={dgSettings} aspect={1680 / 500} width={1240} caption="Digital Garden 外掛設定（實際畫面）" alt="Digital Garden 外掛設定中的 GitHub repo name、Username、token 欄位">
          <MarkBubble n={1} left="97%" top="39%" i={2} />
          <MarkBubble n={2} left="97%" top="64%" i={3} />
          <MarkBubble n={3} left="97%" top="89%" i={4} />
        </Screenshot>
      </In>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 36, marginTop: 40 }}>
        <Steps>
          <Step duration={STEP_MS}><Callout n={1} title="repo name" detail="只填 my-garden" /></Step>
          <Step duration={STEP_MS}><Callout n={2} title="Username" detail="你的 GitHub 帳號" /></Step>
          <Step duration={STEP_MS}><Callout n={3} title="token" detail="貼上剛才複製的那串" /></Step>
        </Steps>
      </div>
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={36}>填好還不算，發布一張才知道連上沒</Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

const Practice2: Page = () => (
  <Shell chapter={3}>
    <PracticeEyebrow time="8 分鐘">練習 2｜連接</PracticeEyebrow>
    <Heading>練習（token）：連上 GitHub</Heading>
    <PillRow>
      <Pill tag="定位">今天的儲存庫</Pill>
      <Pill tag="期望輸出">首頁變三國演義</Pill>
      <Pill tag="限制">token 不外流</Pill>
    </PillRow>
    <Fit>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', gap: 16 }}>
        <FlowStep i={1} n={1} w={330} kind="plug" label="安裝外掛" sub="Digital Garden" />
        <FlowArrow i={2} />
        <FlowStep i={3} n={2} w={330} kind="key" label="建 token" sub="只選一個 repo" />
        <FlowArrow i={4} />
        <FlowStep i={5} n={3} w={330} kind="doc" label="填三格" sub="repo、帳號、token" />
        <FlowArrow i={6} />
        <FlowStep i={7} n={4} w={330} kind="upload" label="試發布一張" sub="〈三國演義〉" />
      </div>
      <Steps>
        <Step duration={STEP_MS}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 40, marginTop: 56 }}>
            <div style={{ background: sage, padding: '16px 30px' }}><StatusLine ok size={32}>網址首頁變成〈三國演義〉：連上了</StatusLine></div>
            <div style={{ background: warnSoft, padding: '16px 30px' }}><StatusLine ok={false} size={32}>沒變：回頭查三格</StatusLine></div>
          </div>
        </Step>
      </Steps>
    </Fit>
  </Shell>
);

// ---------- 04 挑卡發布 ----------

const Section4: Page = () => <SectionPage chapter={4} label="04 / 發布" lead="查開頭三行、勾選，發布時間軸卡" />;

const CodeBlock = ({ label, children, width }: { label: string; children: ReactNode; width?: number }) => (
  <div style={{ width, boxSizing: 'border-box', background: '#202326', color: '#F5F5F4', borderTop: `5px solid ${amber}`, padding: '28px 36px 36px' }}>
    <div style={{ color: '#BAB5B0', fontSize: 24, letterSpacing: '0.06em', marginBottom: 18 }}>{label}</div>
    <div style={{ fontFamily: mono, fontSize: 38, lineHeight: 1.7, whiteSpace: 'pre' }}>{children}</div>
  </div>
);

const PublishSwitch: Page = () => (
  <Shell chapter={4}>
    <Eyebrow>卡片的屬性</Eyebrow>
    <Heading>dg-publish 是卡片上的開關</Heading>
    <Fit>
      <div style={{ display: 'grid', gridTemplateColumns: '860px 120px 1fr', alignItems: 'center' }}>
        <In i={0}>
          <CropShot src={dgProperty} alt="Obsidian 屬性面板：dg-publish 勾選框已打勾" nat={[1830, 770]} crop={[60, 296, 700, 300]} width={860} />
          <Caption>Obsidian 屬性面板（實際畫面）</Caption>
        </In>
        <div style={{ gridColumn: '2 / 4' }}>
          <Steps>
            <Step duration={STEP_MS}>
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', alignItems: 'center' }}>
                <div style={{ fontSize: 80, color: amber, textAlign: 'center', fontFamily: display }}>＝</div>
                <CodeBlock label="原始檔的開頭三行">
                  <div style={{ color: '#BAB5B0' }}>---</div>
                  <div>dg-publish: <span style={{ color: '#8DD4A0' }}>true</span></div>
                  <div style={{ color: '#BAB5B0' }}>---</div>
                </CodeBlock>
              </div>
            </Step>
          </Steps>
        </div>
      </div>
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={64}>打勾和寫 true，是同一件事</Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

// A note drawn as paper, with a few lines of its source.
const SourceDoc = ({ x, y, w, h, name, lines, highlight }: { x: number; y: number; w: number; h: number; name: string; lines: string[]; highlight?: number }) => (
  <g>
    <DocShape x={x} y={y} w={w} h={h} />
    <text x={x + 28} y={y + 46} fontSize="26" fontWeight="600" fill={ink}>{name}</text>
    <line x1={x + 28} y1={y + 66} x2={x + w - 40} y2={y + 66} stroke={rule} strokeWidth="2" />
    {lines.map((l, k) => (
      <text key={k} x={x + 28} y={y + 112 + k * 44} fontSize={k < 3 ? 28 : 26} fontFamily={k < 3 ? mono : undefined} fill={k < 3 ? (k === highlight ? ink : quiet) : ink}>{l}</text>
    ))}
  </g>
);

const FrontmatterCheck: Page = () => (
  <Shell chapter={4}>
    <Eyebrow>實測：第三堂產出的兩張卡</Eyebrow>
    <Heading>發布前檢查 frontmatter</Heading>
    <Fit>
      <Stage h={470}>
        <Steps>
          <Layer h={470} label="人物/劉備.md 經過 eli5 改寫，產生 劉備-國中生版.md">
            <InG i={0}><SourceDoc x={0} y={0} w={620} h={268} name="人物/劉備.md" lines={['---', 'dg-publish: true', '---', '劉備，字玄德，是中山靖王之後']} /></InG>
            <InG i={1}><MapArrow x1={640} x2={992} y={124} hot /><text x="816" y="104" textAnchor="middle" fontSize="28" fontWeight="600" fill={amber}>eli5 改寫</text></InG>
            <InG i={2}><SourceDoc x={1012} y={0} w={620} h={268} name="劉備-國中生版.md" lines={['---', 'dg-publish: true', '---', '劉備，字玄德，是中山靖王的後代。']} highlight={1} /></InG>
          </Layer>
          <Step duration={STEP_MS}><Layer h={470} label="改寫版連 dg-publish: true 也一起抄過去">
            <Build>
              <rect x="1030" y="128" width="330" height="50" fill="none" stroke={warn} strokeWidth="4" />
              <text x="1380" y="162" fontSize="27" fontWeight="600" fill={warn}>連這行也抄了</text>
            </Build>
          </Layer></Step>
          <Step duration={STEP_MS}><Layer h={470} label="發布後，網站上會多一張劉備">
            <DownArrowSvg x={1322} y1={272} y2={304} color={warn} />
            <Build>
              <BrowserFrame x={830} y={306} w={802} h={160} url="….vercel.app" />
              <SvgChip x={860} y={378} w={180} h={56} label="劉備" size={27} />
              <SvgChip x={1060} y={378} w={290} h={56} label="劉備-國中生版" size={27} fill={warnSoft} stroke={warn} />
              <text x="1374" y="415" fontSize="26" fontWeight="600" fill={warn}>多一張劉備</text>
            </Build>
          </Layer></Step>
          <Step duration={STEP_MS}><Layer h={470} label="如果有 dg-publish、又不想公開，就刪掉那行">
            <Build>
              <rect x="0" y="320" width="380" height="130" fill={sage} stroke={okGreen} strokeWidth="2" />
              <OkDot x={40} y={370} r={22} />
              <text x="74" y="380" fontSize="26" fontWeight="600" fill={ink}>如果有 dg-publish</text>
              <text x="74" y="424" fontSize="26" fill={muted}>又不想公開：刪掉那行</text>
            </Build>
          </Layer></Step>
          <Step duration={STEP_MS}><Layer h={470} label="反過來：時間軸.md 沒有這行，要公開就自己加上">
            <Build>
              <rect x="404" y="320" width="400" height="130" fill={amberSoft} stroke={amber} strokeWidth="2" />
              <text x="428" y="364" fontSize="27" fontWeight="600" fill={ink}>時間軸.md 少這行</text>
              <text x="428" y="408" fontSize="25" fontFamily={mono} fill={amber}>+ dg-publish: true</text>
              <text x="428" y="438" fontSize="22" fill={muted}>Skill 產出沒有開頭三行</text>
            </Build>
          </Layer></Step>
        </Steps>
      </Stage>
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={28}>新卡發布前，先看開頭三行</Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

const HomeFlag: Page = () => (
  <Shell chapter={4}>
    <Eyebrow>網站的第一頁</Eyebrow>
    <Heading>dg-home：指定網站首頁</Heading>
    <Fit>
      <Stage h={440}>
        <Steps>
          <Layer h={440} label="三國演義.md 的開頭有 dg-publish 和 dg-home 兩行">
            <InG i={0}>
              <DocShape x={0} y={20} w={640} h={380} />
              <text x="30" y="68" fontSize="27" fontWeight="600" fill={ink}>三國演義.md</text>
              <line x1="30" y1="88" x2="600" y2="88" stroke={rule} strokeWidth="2" />
              <text x="30" y="138" fontSize="30" fontFamily={mono} fill={quiet}>---</text>
              <text x="30" y="184" fontSize="30" fontFamily={mono} fill={quiet}>dg-publish: true</text>
            </InG>
            <InG i={1}>
              <rect x="20" y="198" width="360" height="52" fill={amberSoft} stroke={amber} strokeWidth="2" />
              <text x="30" y="234" fontSize="30" fontFamily={mono} fontWeight="600" fill={ink}>dg-home: true</text>
              <text x="30" y="282" fontSize="30" fontFamily={mono} fill={quiet}>---</text>
              <text x="30" y="340" fontSize="27" fill={ink}>東漢末年，天下動盪……</text>
            </InG>
          </Layer>
          <Step duration={STEP_MS}><Layer h={440} label="打開網址的第一頁，就是三國演義">
            <MapArrow x1={660} x2={830} y={210} hot />
            <text x="745" y="190" textAnchor="middle" fontSize="25" fontFamily={mono} fill={amber}>網址 /</text>
            <Build>
              <BrowserFrame x={850} y={20} w={782} h={380} url="my-garden-….vercel.app/" />
              <SvgIcon kind="home" x={900} y={124} size={48} color={amber} />
              <text x="940" y="140" fontSize="44" fontWeight="600" fill={ink}>三國演義</text>
              <rect x="884" y="176" width="680" height="12" fill={rule} />
              <rect x="884" y="204" width="600" height="12" fill={rule} />
              <text x="884" y="276" fontSize="30" fill={ink}><tspan fill={link} textDecoration="underline">劉備</tspan>、<tspan fill={link} textDecoration="underline">關羽</tspan>、<tspan fill={link} textDecoration="underline">張飛</tspan></text>
            </Build>
            <Build i={1}><text x="1241" y="436" textAnchor="middle" fontSize="27" fill={muted}>打開網址，第一頁就是它</text></Build>
          </Layer></Step>
        </Steps>
      </Stage>
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={32}>整個網站只放一張 dg-home</Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

// One signpost on the navigation page: a label and the cards it points to.
const Signpost = ({ y, label, links }: { y: number; label: string; links: string }) => (
  <g>
    <path d={`M30 ${y} H190 L222 ${y + 32} L190 ${y + 64} H30 Z`} fill={amberSoft} stroke={amber} strokeWidth="2" />
    <text x="56" y={y + 43} fontSize="29" fontWeight="600" fill={ink}>{label}</text>
    <text x="250" y={y + 43} fontSize="29" fontFamily={mono} fill={link}>{links}</text>
  </g>
);

const NavPage: Page = () => (
  <Shell chapter={4}>
    <Eyebrow>讓讀者從首頁走進來</Eyebrow>
    <Heading>做一張導覽頁</Heading>
    <Fit>
      <div style={{ display: 'grid', gridTemplateColumns: '780px 1fr', gap: 60, alignItems: 'start' }}>
        <In i={0}>
          <Figure w={780} h={450} label="整理/知識庫導覽.md：開頭有 dg-publish，下面三個路標連到時間軸、人物、事件">
            <DocShape x={0} y={0} w={780} h={440} />
            <text x="30" y="52" fontSize="28" fontWeight="600" fill={ink}>整理/知識庫導覽.md</text>
            <line x1="30" y1="76" x2="740" y2="76" stroke={rule} strokeWidth="2" />
            <text x="30" y="118" fontSize="26" fontFamily={mono} fill={quiet}>dg-publish: true</text>
            <Signpost y={150} label="時間" links="[[時間軸]]" />
            <Signpost y={244} label="人物" links="[[劉備]]、[[曹操]]、[[孫權]]" />
            <Signpost y={338} label="事件" links="[[桃園結義]]、[[赤壁之戰]]" />
          </Figure>
        </In>
        <div>
          <In i={1}>
            <Figure w={792} h={136} label="首頁 三國演義.md 的最後一行連到知識庫導覽">
              <DocShape x={0} y={0} w={792} h={130} />
              <text x="28" y="44" fontSize="26" fontWeight="600" fill={ink}>三國演義.md（首頁）最後一行</text>
              <rect x="22" y="64" width="300" height="50" fill={linkSoft} stroke={link} strokeWidth="2" />
              <text x="38" y="99" fontSize="28" fontFamily={mono} fill={link}>[[知識庫導覽]]</text>
            </Figure>
          </In>
          <div style={{ marginTop: 30 }}>
            <Steps>
              <div style={{ fontSize: 30, fontWeight: 600, marginBottom: 18 }}>發布前對一次</div>
              <Step duration={STEP_MS}><div style={{ marginBottom: 14 }}><StatusLine ok size={30}>導覽頁有 dg-publish: true</StatusLine></div></Step>
              <Step duration={STEP_MS}><div style={{ marginBottom: 14 }}><StatusLine ok size={30}>首頁連到 [[知識庫導覽]]</StatusLine></div></Step>
              <Step duration={STEP_MS}><div style={{ marginBottom: 14 }}><StatusLine ok size={30}>要公開的卡都有 dg-publish</StatusLine></div></Step>
              <Step duration={STEP_MS}><div><StatusLine ok size={30}>國中生版沒公開（除非你要）</StatusLine></div></Step>
            </Steps>
          </div>
        </div>
      </div>
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={32}>要點人物、事件，都從導覽頁走</Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

const PublishCommand: Page = () => (
  <Shell chapter={4}>
    <Eyebrow>發布｜Digital Garden 2.96.0</Eyebrow>
    <Heading>用命令面板發布</Heading>
    <Lead>Ctrl／Cmd + P，搜尋 garden publish</Lead>
    <Fit>
      <div style={{ position: 'relative', width: 1300, margin: '0 auto' }}>
        <In i={0}>
          <CropShot src={dgPalette} alt="Obsidian 命令面板搜尋 garden publish：第一行 Publish Active Note，第二行 Publish All Notes Marked for Publish" nat={[1800, 720]} crop={[50, 172, 1000, 166]} width={1300} />
          <Caption>命令面板實際畫面，裁切放大</Caption>
        </In>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 56, marginTop: 30 }}>
          <Steps>
            <Step duration={STEP_MS}><TourStep n={1} title="Publish Active Note" detail="只發正在看的這一張；練習 2 試發布用" box={[0, 2, 1300, 104]} /></Step>
            <Step duration={STEP_MS}><TourStep n={2} title="Publish All Notes Marked for Publish" detail="所有勾了 dg-publish 的卡；練習 3 用" box={[0, 108, 1300, 106]} /></Step>
          </Steps>
        </div>
      </div>
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={36}>練習 3 要一次送好幾張，所以用 2</Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

const HtmlTest: Page = () => (
  <Shell chapter={4}>
    <Eyebrow>實測：第三堂 Skill 的產出｜本機建置</Eyebrow>
    <Heading>時間軸卡上網站（本機測試）</Heading>
    <Fit>
      <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: '540px 1fr', gap: 110, alignItems: 'start' }}>
        <In i={0}>
          <CropShot src={timelineSite} alt="時間軸.md 在 Digital Garden 網站上的樣子：HTML 表格列出第 1 到 49 回六件事，人物欄是純文字，下方來源卡是連到 .md 檔的連結" nat={[1400, 1000]} crop={[418, 300, 600, 630]} width={540} />
          <Caption>時間軸.md，講師的模板本機建置（實際畫面）</Caption>
        </In>
        <div style={{ display: 'grid', gap: 48, paddingTop: 80 }}>
          <Steps>
            <Step duration={STEP_MS}><TourStep n={1} title={<StatusLine ok size={34}>HTML 表格照常顯示</StatusLine>} detail="第 1–49 回，六件事" box={[2, 4, 536, 452]} /></Step>
            <Step duration={STEP_MS}><TourStep n={2} title={<StatusLine ok size={34}>人名是純文字</StatusLine>} detail="沒有 [[ ]] 殘留" box={[386, 70, 150, 388]} badge="right" /></Step>
            <Step duration={STEP_MS}><TourStep n={3} title={<StatusLine ok={false} size={34}>來源卡一點就 404</StatusLine>} detail="連到 .md 檔，網站上找不到" box={[2, 520, 244, 42]} badge="right" /></Step>
          </Steps>
        </div>
      </div>
    </Fit>
  </Shell>
);

// One way of writing a link inside the timeline's HTML, and what the site shows.
const HtmlCase = ({ x, ok, lines, shows, note, linkLike = false }: { x: number; ok: boolean; lines: [string, string, string]; shows: string; note: string; linkLike?: boolean }) => (
  <g>
    <rect x={x} y="0" width="520" height="430" fill={ok ? sage : warnSoft} />
    <rect x={x} y="0" width="520" height="5" fill={ok ? okGreen : warn} />
    <text x={x + 26} y="50" fontSize="25" fontWeight="600" fill={ok ? okGreen : warn}>寫在 HTML 裡</text>
    <rect x={x + 26} y="70" width="468" height="130" fill={term} />
    <text x={x + 44} y="116" fontSize="24" fontFamily={mono} fill="#BCC3CC">{lines[0]}</text>
    <text x={x + 44} y="152" fontSize="24" fontFamily={mono} fill="#F5F5F4">{lines[1]}</text>
    <text x={x + 44} y="188" fontSize="24" fontFamily={mono} fill="#BCC3CC">{lines[2]}</text>
    <DownArrowSvg x={x + 260} y1={210} y2={252} color={ok ? okGreen : warn} />
    <text x={x + 26} y="282" fontSize="25" fontWeight="600" fill={muted}>網站上看到</text>
    <rect x={x + 26} y="298" width="468" height="62" fill="#FFFFFF" stroke={rule} strokeWidth="2" />
    <text x={x + 44} y="340" fontSize="30" fill={linkLike ? link : ink} textDecoration={linkLike ? 'underline' : undefined}>{shows}</text>
    {ok ? <OkDot x={x + 40} y={398} r={18} /> : <NoDot x={x + 40} y={398} r={18} />}
    <text x={x + 70} y="408" fontSize="27" fill={ink}>{note}</text>
  </g>
);

const HtmlLinks: Page = () => (
  <Shell chapter={4}>
    <Eyebrow>時間軸 Skill 的寫法</Eyebrow>
    <Heading>HTML 裡的連結，網站上會失效</Heading>
    <Fit>
      <Stage h={430}>
        <Steps>
          <Layer h={430} label="寫 [[劉備]]：網站上原樣顯示兩對中括號">
            <InG i={0}><HtmlCase x={0} ok={false} lines={['<div class="ev">', '  [[劉備]] 桃園結義', '</div>']} shows="[[劉備]] 桃園結義" note="原樣顯示，點不了" /></InG>
          </Layer>
          <Step duration={STEP_MS}><Layer h={430} label="寫連到 .md 檔的 a 標籤：網站上點下去是 404">
            <Build><HtmlCase x={556} ok={false} lines={['<a href="../關係/', '  桃園結義.md">', '…</a>']} shows="關係/桃園結義.md" note="點下去 404" linkLike /></Build>
          </Layer></Step>
          <Step duration={STEP_MS}><Layer h={430} label="寫純文字：網站上乾淨顯示">
            <Build><HtmlCase x={1112} ok lines={['<li>', '  第 1 回：關係/桃園結義', '</li>']} shows="第 1 回：關係/桃園結義" note="乾淨，不會壞" /></Build>
          </Layer></Step>
        </Steps>
      </Stage>
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={36}>所以人名、來源卡用純文字；要點人物，走導覽頁</Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

const ExtraFolder: Page = () => (
  <Shell>
    <Eyebrow>附錄 A｜進階選修：diagram-design 的關係圖</Eyebrow>
    <Heading>獨立 .html 要放進 extra/</Heading>
    <Fit>
      <Stage h={460}>
        <Steps>
          <Layer h={460} label="第三堂用 diagram-design 畫的 三國關係圖.html">
            <InG i={0}>
              <DocShape x={0} y={150} w={300} h={180} fill={amberSoft} stroke={amber} sw={3} />
              <SvgIcon kind="code" x={150} y={220} size={60} color={amber} />
              <text x="150" y="300" textAnchor="middle" fontSize="26" fontFamily={mono} fill={ink}>三國關係圖.html</text>
            </InG>
          </Layer>
          <Step duration={STEP_MS}><Layer h={460} label="Digital Garden 外掛只上傳筆記，不上傳 .html">
            <g fill="none" stroke={warn} strokeWidth="3" strokeDasharray="8 8"><path d="M300 200 C360 140 380 90 430 90" /></g>
            <Build>
              <rect x="440" y="20" width="440" height="140" fill={warnSoft} stroke={warn} strokeWidth="2" />
              <text x="470" y="74" fontSize="29" fontWeight="600" fill={ink}>Digital Garden 外掛</text>
              <NoDot x={490} y={118} r={20} />
              <text x="522" y="128" fontSize="27" fill={warn}>不上傳 .html</text>
            </Build>
          </Layer></Step>
          <Step duration={STEP_MS}><Layer h={460} label="改走另一條路：在 GitHub 網頁把檔案新增到 repo 的 extra/ 資料夾，並在 .eleventy.js 加一行設定">
            <g fill="none" stroke={okGreen} strokeWidth="4"><StepPath d="M300 280 C360 340 380 360 430 360" /></g>
            <Build i={1}>
              <rect x="440" y="290" width="440" height="160" fill={surface} stroke={faint} strokeWidth="2" />
              <Folder x={466} y={318} w={110} h={80} fill="#FFFFFF" stroke={faint} />
              <text x="596" y="336" fontSize="29" fontWeight="600" fill={ink}>repo 的 extra/</text>
              <text x="596" y="376" fontSize="24" fontFamily={mono} fill={muted}>sanguo-map.html</text>
              <text x="596" y="420" fontSize="25" fill={amber}>＋ .eleventy.js 加一行</text>
              <OkDot x={850} y={320} r={20} />
            </Build>
          </Layer></Step>
          <Step duration={STEP_MS}><Layer h={460} label="在筆記裡用 iframe 把它嵌進來">
            <MapArrow x1={890} x2={950} y={370} hot />
            <Build>
              <DocShape x={962} y={230} w={670} h={220} />
              <text x="990" y="276" fontSize="26" fontWeight="600" fill={ink}>三國關係圖.md（要勾 dg-publish）</text>
              <rect x="990" y="300" width="610" height="60" fill={term} />
              <text x="1006" y="340" fontSize="24" fontFamily={mono} fill="#F5F5F4">&lt;iframe src="/extra/sanguo-map.html"&gt;</text>
              <OkDot x={1012} y={404} r={18} />
              <text x="1042" y="414" fontSize="27" fill={ink}>網站上嵌進整張圖</text>
            </Build>
          </Layer></Step>
        </Steps>
      </Stage>
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={28}>外掛只送筆記，.html 要自己放</Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

const Practice3: Page = () => (
  <Shell chapter={4}>
    <PracticeEyebrow time="12 分鐘">練習 3｜發布</PracticeEyebrow>
    <Heading>練習（dg-publish）：發布時間軸卡</Heading>
    <PillRow>
      <Pill tag="定位">時間軸＋導覽頁</Pill>
      <Pill tag="期望輸出">導覽頁走得通</Pill>
      <Pill tag="限制">先查開頭三行</Pill>
    </PillRow>
    <Fit>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', gap: 16 }}>
        <FlowStep i={1} n={1} w={330} kind="search" label="查開頭三行" sub="多了刪、少了補" />
        <FlowArrow i={2} />
        <FlowStep i={3} n={2} w={330} kind="home" label="做導覽頁" sub="連時間軸、人物、事件" />
        <FlowArrow i={4} />
        <FlowStep i={5} n={3} w={330} kind="ok" label="勾 dg-publish" sub="導覽頁、時間軸、卡" />
        <FlowArrow i={6} />
        <FlowStep i={7} n={4} w={330} kind="upload" label="全部發布" sub="Publish All Notes" />
      </div>
      <Steps>
        <Step duration={STEP_MS}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 40, marginTop: 56 }}>
            <div style={{ background: sage, padding: '16px 30px' }}><StatusLine ok size={32}>首頁 → 導覽頁 → 時間軸</StatusLine></div>
            <div style={{ background: sage, padding: '16px 30px' }}><StatusLine ok size={32}>導覽頁點得到劉備</StatusLine></div>
          </div>
        </Step>
      </Steps>
    </Fit>
  </Shell>
);

// ---------- 05 互相驗收與延伸 ----------

const Section5: Page = () => <SectionPage chapter={5} label="05 / 驗收" lead="請同學走一遍，再看 Git 和下一步" />;

// Checking the site like a relay: every hand-off has to work.
const RelayStop = ({ x, y = 130, name, state }: { x: number; y?: number; name: string; state: 'ok' | 'bad' | 'idle' }) => (
  <g>
    <circle cx={x} cy={y} r="62" fill={state === 'bad' ? warnSoft : state === 'ok' ? sage : '#FFFFFF'} stroke={state === 'bad' ? warn : state === 'ok' ? okGreen : faint} strokeWidth="3" />
    <text x={x} y={y + 11} textAnchor="middle" fontSize="30" fill={ink}>{name}</text>
  </g>
);

const CheckSite: Page = () => (
  <Shell chapter={5}>
    <Eyebrow>網站驗收</Eyebrow>
    <Heading>從首頁一路點下去</Heading>
    <Fit>
      <div style={{ background: '#FFFFFF', border: `1px solid ${rule}`, padding: '20px 0' }}>
        <Stage h={380}>
          <Steps>
            <Layer h={380} label="四站：首頁、導覽頁，再分到時間軸和劉備">
              <InG i={0}><RelayStop x={170} y={190} name="首頁" state="ok" /></InG>
              <InG i={1}><RelayStop x={560} y={190} name="導覽頁" state="idle" /></InG>
              <InG i={2}><RelayStop x={1000} y={86} name="時間軸" state="idle" /></InG>
              <InG i={3}><RelayStop x={1000} y={300} name="劉備" state="idle" /></InG>
            </Layer>
            <Step duration={STEP_MS}><Layer h={380} label="首頁點得到導覽頁">
              <g fill="none" stroke={okGreen} strokeWidth="6"><StepPath d="M232 190 H498" /></g>
              <Build i={2}><OkDot x={365} y={150} /><text x="365" y="262" textAnchor="middle" fontSize="27" fill={ink}>首頁點得到導覽頁？</text></Build>
            </Layer></Step>
            <Step duration={STEP_MS}><Layer h={380} label="導覽頁點得到時間軸；時間軸裡的人名是純文字，這是對的">
              <g fill="none" stroke={okGreen} strokeWidth="6"><StepPath d="M616 162 L940 104" /></g>
              <Build i={2}>
                <OkDot x={778} y={110} />
                <text x="1090" y="70" fontSize="28" fontWeight="600" fill={ink}>時間軸打得開</text>
                <text x="1090" y="110" fontSize="26" fill={okGreen}>人名是純文字：這是對的</text>
                <text x="1090" y="148" fontSize="26" fill={muted}>要點人物，走導覽頁</text>
              </Build>
            </Layer></Step>
            <Step duration={STEP_MS}><Layer h={380} label="導覽頁點劉備打不開：先查劉備有沒有勾 dg-publish">
              <g stroke={warn} strokeWidth="6"><line x1="616" y1="218" x2="752" y2="252" /><line x1="806" y1="266" x2="940" y2="290" /></g>
              <Build i={1}>
                <NoDot x={779} y={259} r={26} />
                <text x="1090" y="292" fontSize="28" fontWeight="600" fill={warn}>打不開？</text>
                <text x="1090" y="332" fontSize="26" fill={warn}>查這張的 dg-publish</text>
              </Build>
            </Layer></Step>
          </Steps>
        </Stage>
      </div>
      <Steps><Step duration={STEP_MS}><Takeaway>補勾之後，再發布一次</Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

const PersonBadge = ({ x, label, tint, stroke }: { x: number; label: string; tint: string; stroke: string }) => (
  <g>
    <circle cx={x} cy="90" r="70" fill={tint} stroke={stroke} strokeWidth="3" />
    <SvgIcon kind="user" x={x} y={90} size={84} color={stroke} />
    <text x={x} y="200" textAnchor="middle" fontSize="32" fontWeight="600" fill={ink}>{label}</text>
  </g>
);

const Practice4: Page = () => (
  <Shell chapter={5}>
    <PracticeEyebrow time="10 分鐘">練習 4｜互相驗收</PracticeEyebrow>
    <Heading>練習（驗收）：同學從首頁找到新卡</Heading>
    <PillRow>
      <Pill tag="定位">一張新卡</Pill>
      <Pill tag="期望輸出">同學走得到</Pill>
      <Pill tag="限制">無痕視窗、從首頁</Pill>
    </PillRow>
    <Fit>
      <Stage h={420}>
        <Steps>
          <Layer h={420} label="你：公開一張新卡，並在導覽頁加上連結">
            <InG i={0}><PersonBadge x={90} label="你" tint={linkSoft} stroke={link} /></InG>
            <InG i={1}>
              <DocShape x={210} y={30} w={330} h={160} fill="#FFFFFF" stroke={link} sw={2} />
              <SvgNum x={210} y={30} n={1} />
              <text x="240" y="84" fontSize="28" fontWeight="600" fill={ink}>公開一張新卡</text>
              <text x="240" y="128" fontSize="25" fill={muted}>例：三英戰呂布</text>
              <text x="240" y="168" fontSize="25" fill={muted}>導覽頁加連結</text>
            </InG>
          </Layer>
          <Step duration={STEP_MS}><Layer h={420} label="把網址傳給同學">
            <Build><SvgNum x={600} y={60} n={2} /><text x="636" y="70" fontSize="28" fontWeight="600" fill={ink}>傳網址給同學</text></Build>
            <Build i={1}><MapArrow x1={560} x2={1180} y={110} hot /><rect x="660" y="136" width="420" height="54" rx="27" fill="#FFFFFF" stroke={amber} strokeWidth="2" /><text x="870" y="171" textAnchor="middle" fontSize="25" fontFamily={mono} fill={ink}>my-garden-….vercel.app</text></Build>
            <Build i={2}><PersonBadge x={1300} label="同學" tint={amberSoft} stroke={amber} /></Build>
          </Layer></Step>
          <Step duration={STEP_MS}><Layer h={420} label="同學用無痕視窗打開你的網址，只從首頁點：首頁、導覽頁、新卡">
            <Build><SvgNum x={600} y={286} n={3} /><text x="636" y="296" fontSize="28" fontWeight="600" fill={ink}>同學開無痕視窗</text></Build>
            <Build i={1}>
              <SvgChip x={940} y={262} w={150} h={60} label="首頁" size={28} />
              <MapArrow x1={1096} x2={1140} y={292} />
              <SvgChip x={1148} y={262} w={170} h={60} label="導覽頁" size={28} />
              <MapArrow x1={1324} x2={1368} y={292} />
              <SvgChip x={1376} y={262} w={210} h={60} label="三英戰呂布" size={28} fill={sage} stroke={okGreen} />
            </Build>
          </Layer></Step>
          <Step duration={STEP_MS}><Layer h={420} label="回報：走到了，或卡在哪一頁">
            <Build><SvgNum x={600} y={380} n={4} /><text x="636" y="390" fontSize="28" fontWeight="600" fill={ink}>回報結果</text></Build>
            <Build i={1}><OkDot x={900} y={380} r={22} /><text x="934" y="390" fontSize="28" fill={okGreen} fontWeight="600">走到了</text></Build>
            <Build i={2}><NoDot x={1120} y={380} r={22} /><text x="1154" y="390" fontSize="28" fill={warn} fontWeight="600">回報卡在哪一頁</text></Build>
          </Layer></Step>
        </Steps>
      </Stage>
    </Fit>
  </Shell>
);

// A question box in the "site didn't update" check.
const AskBox = ({ x, y, w, label }: { x: number; y: number; w: number; label: string }) => (
  <g>
    <rect x={x} y={y} width={w} height="110" rx="55" fill="#FFFFFF" stroke={ink} strokeWidth="2" />
    <text x={x + w / 2} y={y + 66} textAnchor="middle" fontSize="32" fontWeight="600" fill={ink}>{label}</text>
  </g>
);

const FixBox = ({ x, y, w, label }: { x: number; y: number; w: number; label: string }) => (
  <g>
    <rect x={x} y={y} width={w} height="96" fill={amberSoft} stroke={amber} strokeWidth="2" />
    <text x={x + w / 2} y={y + 59} textAnchor="middle" fontSize="30" fill={ink}>{label}</text>
  </g>
);

// One check in the "site didn't update" list, on the left of the picture.
const CheckRow = ({ y, n, title, sub }: { y: number; n: number; title: string; sub: string }) => (
  <g>
    <SvgNum x={22} y={y + 24} n={n} />
    <text x="60" y={y + 34} fontSize="32" fontWeight="600" fill={ink}>{title}</text>
    <text x="60" y={y + 72} fontSize="25" fill={muted}>{sub}</text>
  </g>
);

// A deployment status chip as Vercel shows it (drawn, not a screenshot).
const StatusChip = ({ x, y, w, label, color }: { x: number; y: number; w: number; label: string; color: string }) => (
  <g><rect x={x} y={y} width={w} height="38" rx="19" fill={color} /><text x={x + w / 2} y={y + 27} textAnchor="middle" fontSize="24" fontWeight="600" fill="#FFFFFF">{label}</text></g>
);

const NotUpdated: Page = () => (
  <Shell chapter={5}>
    <Eyebrow>常見問題｜右邊畫面為示意</Eyebrow>
    <Heading>網站沒更新時的四個檢查</Heading>
    <Fit>
      <Stage h={520}>
        <Steps>
          <Layer h={520} label="檢查一：有沒有按發布，在 Obsidian 命令面板">
            <InG i={0}><CheckRow y={10} n={1} title="有沒有按發布？" sub="Publish Active Note／All Notes" /></InG>
            <InG i={1}>
              <rect x="640" y="14" width="992" height="64" fill={linkSoft} stroke={link} strokeWidth="2" />
              <text x="668" y="56" fontSize="26" fill={ink}>Obsidian：Ctrl／Cmd + P → garden publish</text>
            </InG>
          </Layer>
          <Step duration={STEP_MS}><Layer h={520} label="檢查二：GitHub 的 repo 首頁，最新一筆 commit 的時間對得上">
            <Build><CheckRow y={120} n={2} title="GitHub 有新 commit 嗎？" sub="repo 首頁，看最新一筆的時間" /></Build>
            <Build i={1}>
              <rect x="640" y="100" width="992" height="120" fill="#FFFFFF" stroke={rule} strokeWidth="2" />
              <rect x="640" y="100" width="992" height="46" fill="#24292F" />
              <text x="664" y="132" fontSize="24" fontFamily={mono} fill="#FFFFFF">github.com/你的帳號/my-garden</text>
              <text x="668" y="196" fontSize="26" fill={muted}>最新 commit</text>
              <rect x="830" y="164" width="150" height="44" fill="none" stroke="#E9B650" strokeWidth="4" />
              <text x="905" y="196" textAnchor="middle" fontSize="28" fontWeight="600" fill={ink}>2 分鐘前</text>
              <text x="1010" y="196" fontSize="25" fill={okGreen}>對得上剛才按發布：收到了</text>
            </Build>
          </Layer></Step>
          <Step duration={STEP_MS}><Layer h={520} label="檢查三：Vercel → 你的專案 → Deployments，看最上面那一筆的狀態">
            <Build><CheckRow y={250} n={3} title="Vercel 部署狀態？" sub="Deployments 最上面那一筆" /></Build>
            <Build i={1}>
              <rect x="640" y="240" width="992" height="190" fill="#FFFFFF" stroke={rule} strokeWidth="2" />
              <rect x="640" y="240" width="992" height="46" fill="#111111" />
              <text x="664" y="272" fontSize="24" fill="#FFFFFF">▲ Vercel ／ my-garden ／ Deployments</text>
              <text x="668" y="332" fontSize="24" fontFamily={mono} fill={ink}>my-garden-….vercel.app</text>
              <StatusChip x={1120} y={306} w={110} label="Ready" color={okGreen} />
              <text x="1250" y="333" fontSize="24" fill={muted}>2 分鐘前</text>
              <line x1="660" y1="358" x2="1612" y2="358" stroke={rule} strokeWidth="2" />
              <StatusChip x={668} y={374} w={130} label="Building" color={amber} />
              <text x="810" y="402" fontSize="24" fill={ink}>建置中，再等</text>
              <StatusChip x={980} y={374} w={110} label="Ready" color={okGreen} />
              <text x="1102" y="402" fontSize="24" fill={ink}>完成</text>
              <StatusChip x={1176} y={374} w={100} label="Error" color={warn} />
              <text x="1288" y="402" fontSize="24" fill={ink}>失敗，點進去看</text>
            </Build>
          </Layer></Step>
          <Step duration={STEP_MS}><Layer h={520} label="檢查四：瀏覽器強制重新整理">
            <Build><CheckRow y={440} n={4} title="重新整理、清快取" sub="Ctrl／Cmd + Shift + R" /></Build>
            <Build i={1}>
              <rect x="640" y="448" width="760" height="64" fill={surface} stroke={faint} strokeWidth="2" />
              <text x="668" y="490" fontSize="26" fill={ink}>瀏覽器：Ctrl／Cmd + Shift + R 強制重新整理</text>
            </Build>
          </Layer></Step>
        </Steps>
      </Stage>
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={24}>從第 1 步往下查，不要跳步</Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

// Git as a photo routine: snap, send, and the shop window updates itself.
const GitStation = ({ x, cmd, name, detail, children, fill }: { x: number; cmd: string; name: string; detail: string; children: ReactNode; fill: string }) => (
  <g>
    <rect x={x} y="0" width="460" height="420" fill={fill} />
    <rect x={x} y="0" width="460" height="5" fill={amber} />
    <text x={x + 30} y="54" fontSize="28" fontFamily={mono} fontWeight="600" fill={amber}>{cmd}</text>
    {children}
    <text x={x + 30} y="330" fontSize="38" fontWeight="600" fill={ink}>{name}</text>
    <text x={x + 30} y="378" fontSize="27" fill={muted}>{detail}</text>
  </g>
);

const GitBasics: Page = () => (
  <Shell chapter={5}>
    <Eyebrow>Git 基礎｜commit</Eyebrow>
    <Heading>發布按鈕在幕後做的事</Heading>
    <Lead>像拍照存檔，再把照片寄出去</Lead>
    <Fit>
      <Stage h={420}>
        <Steps>
          <Layer h={420} label="你在 Obsidian 按 Publish">
            <InG i={0}><GitStation x={0} cmd="你按 Publish" name="按發布" detail="在 Obsidian 裡" fill={linkSoft}>
              <SvgIcon kind="upload" x={230} y={170} size={120} color={link} />
            </GitStation></InG>
          </Layer>
          <Step duration={STEP_MS}><Layer h={420} label="外掛在你的 GitHub repo 建一筆 commit，等於 git commit 加 git push">
            <MapArrow x1={470} x2={576} y={210} hot />
            <Build><GitStation x={586} cmd="commit" name="外掛建一筆 commit" detail="＝ git commit＋git push" fill={amberSoft}>
              <rect x="736" y="110" width="160" height="110" rx="10" fill="#FFFFFF" stroke={amber} strokeWidth="4" /><rect x="776" y="94" width="50" height="20" fill={amber} />
              <circle cx="816" cy="165" r="34" fill="none" stroke={amber} strokeWidth="4" />
            </GitStation></Build>
          </Layer></Step>
          <Step duration={STEP_MS}><Layer h={420} label="Vercel 收到新版本，網站自己更新">
            <MapArrow x1={1056} x2={1162} y={210} hot />
            <Build><GitStation x={1172} cmd="（自動）" name="網站自己更新" detail="Vercel 收到新版就重做" fill={sage}>
              <path d="M1300 130 H1500 L1520 160 H1280 Z" fill={okGreen} /><rect x="1292" y="160" width="216" height="90" fill="#FFFFFF" stroke={okGreen} strokeWidth="3" /><rect x="1312" y="178" width="80" height="54" fill={sage} />
            </GitStation></Build>
          </Layer></Step>
        </Steps>
      </Stage>
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={36}>自己打 git commit、git push，做的是同一件事</Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

// A line of the real workflow file, shown inside the Actions box.
const YamlLine = ({ y, children, dim = false }: { y: number; children: ReactNode; dim?: boolean }) => (
  <text x="560" y={y} fontSize="25" fontFamily={mono} fill={dim ? '#BCC3CC' : '#F5F5F4'}>{children}</text>
);

const ActionsDeploy: Page = () => (
  <Shell>
    <Eyebrow>附錄 B｜另一套部署方式（進階，今天用不到）</Eyebrow>
    <Heading>另一套部署方式：GitHub Actions</Heading>
    <Lead>像 GitHub 上的機器人，照清單做事</Lead>
    <Fit>
      <Stage h={430}>
        <Steps>
          <Layer h={430} label="你 git push 到 GitHub">
            <InG i={0}>
              <rect x="0" y="130" width="230" height="150" fill={surface} stroke={faint} strokeWidth="2" />
              <SvgIcon kind="repo" x={115} y={186} size={64} color={muted} />
              <text x="115" y="258" textAnchor="middle" fontSize="28" fontWeight="600" fill={ink}>GitHub</text>
              <text x="115" y="110" textAnchor="middle" fontSize="26" fontFamily={mono} fill={amber}>git push</text>
            </InG>
          </Layer>
          <Step duration={STEP_MS}><Layer h={430} label="GitHub Actions 照 .github/workflows/pages.yml 的清單，一步一步建置">
            <MapArrow x1={240} x2={520} y={205} hot />
            <Build>
              <rect x="530" y="0" width="680" height="420" fill={term} />
              <text x="560" y="46" fontSize="24" fontFamily={mono} fill="#E9B650">.github/workflows/pages.yml</text>
              <YamlLine y={100} dim>on: push → main</YamlLine>
              <YamlLine y={148}>- Check out repository</YamlLine>
              <YamlLine y={196}>- Set up Node.js</YamlLine>
              <YamlLine y={244}>- Install dependencies</YamlLine>
              <YamlLine y={292}>- Build slides</YamlLine>
              <YamlLine y={340}>- Deploy GitHub Pages</YamlLine>
              <text x="560" y="396" fontSize="24" fill="#BCC3CC">節錄，實際檔案還有幾行設定</text>
            </Build>
          </Layer></Step>
          <Step duration={STEP_MS}><Layer h={430} label="建好的網站放到 GitHub Pages，給一個 github.io 網址">
            <MapArrow x1={1220} x2={1300} y={205} hot />
            <Build>
              <BrowserFrame x={1310} y={100} w={322} h={220} url="….github.io" />
              <SvgIcon kind="globe" x={1471} y={222} size={70} color={okGreen} />
              <text x="1471" y="372" textAnchor="middle" fontSize="27" fill={muted}>GitHub Pages</text>
            </Build>
          </Layer></Step>
        </Steps>
      </Stage>
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={28}>今天用 Vercel；想全放在 GitHub，再試 Actions</Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

// ---------- Close ----------

const MATRIX_COLS = '210px repeat(4, 1fr)';

const MatrixHead = ({ n, kind, name, hot = false }: { n: number; kind: IconKind; name: string; hot?: boolean }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 18, padding: '20px 22px', background: hot ? amberSoft : surface, borderTop: `5px solid ${hot ? amber : faint}` }}>
    <Icon kind={kind} size={60} color={hot ? amber : muted} />
    <span><span style={{ display: 'block', fontSize: 25, color: hot ? amber : quiet }}>第 {n} 堂</span><span style={{ display: 'block', fontSize: 38, fontWeight: 600 }}>{name}</span></span>
  </div>
);

const MatrixRow = ({ label, cells }: { label: string; cells: [string, string, string, string] }) => (
  <div style={{ display: 'grid', gridTemplateColumns: MATRIX_COLS, gap: 12, alignItems: 'stretch', marginTop: 14 }}>
    <div style={{ fontSize: 32, fontWeight: 600, color: amber, display: 'flex', alignItems: 'center' }}>{label}</div>
    <div style={{ fontSize: 30, lineHeight: 1.4, padding: '26px 22px', background: '#FFFFFF', border: `1px solid ${rule}` }}>{cells[0]}</div>
    <div style={{ fontSize: 30, lineHeight: 1.4, padding: '26px 22px', background: '#FFFFFF', border: `1px solid ${rule}` }}>{cells[1]}</div>
    <div style={{ fontSize: 30, lineHeight: 1.4, padding: '26px 22px', background: '#FFFFFF', border: `1px solid ${rule}` }}>{cells[2]}</div>
    <div style={{ fontSize: 30, lineHeight: 1.4, padding: '26px 22px', background: amberSoft, border: `1px solid ${amber}`, fontWeight: 600 }}>{cells[3]}</div>
  </div>
);

const CourseRecap: Page = () => (
  <Shell>
    <Eyebrow>四堂課總結</Eyebrow>
    <Heading>四堂課回顧：大綱到網站</Heading>
    <Fit>
      <In i={0} style={{ display: 'grid', gridTemplateColumns: MATRIX_COLS, gap: 12 }}>
        <span />
        <MatrixHead n={1} kind="doc" name="大綱" />
        <MatrixHead n={2} kind="folder" name="筆記庫" />
        <MatrixHead n={3} kind="timeline" name="時間軸" />
        <MatrixHead n={4} kind="globe" name="網站" hot />
      </In>
      <div>
        <Steps>
          <Step duration={STEP_MS}><MatrixRow label="RAG" cells={['Web Search 就是 RAG', '查筆記、附出處', '照原文新增卡片', '每張卡都有出處']} /></Step>
          <Step duration={STEP_MS}><MatrixRow label="Obsidian" cells={['（預告）', '安裝、連結、關係圖', '卡片模板、時間欄位', 'Digital Garden 發布']} /></Step>
          <Step duration={STEP_MS}><MatrixRow label="Skills" cells={['AGENTS.md（預告）', '（預告）', '安裝、自己寫一個', 'Skill 產出放上網站']} /></Step>
        </Steps>
      </div>
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={40}>四堂課，做的是同一座三國知識庫</Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

const SkillRow = ({ i, cmd, what, icon }: { i: number; cmd: string; what: string; icon: ReactNode }) => (
  <In i={i} style={{ display: 'grid', gridTemplateColumns: '130px 380px 1fr', alignItems: 'center', gap: 30, background: surface, borderLeft: `5px solid ${amber}`, padding: '36px 40px' }}>
    <svg viewBox="0 0 110 80" style={{ width: 110, height: 80 }} aria-hidden="true">{icon}</svg>
    <span style={{ fontFamily: mono, fontSize: 36, fontWeight: 600, color: amber }}>{cmd}</span>
    <span style={{ fontSize: 34, lineHeight: 1.4 }}>{what}</span>
  </In>
);

// One stop of the weekly loop after the course, tagged with the lesson it comes from.
const LoopStop = ({ x, n, kind, label, tag }: { x: number; n: number; kind: IconKind; label: string; tag: string }) => (
  <g>
    <circle cx={x} cy="110" r="84" fill="#FFFFFF" stroke={amber} strokeWidth="3" />
    <SvgIcon kind={kind} x={x} y={110} size={90} color={amber} />
    <SvgNum x={x - 64} y={44} n={n} />
    <text x={x} y="250" textAnchor="middle" fontSize="38" fontWeight="600" fill={ink}>{label}</text>
    <SvgChip x={x - 150} y={272} w={300} h={46} label={tag} size={24} fill={surface} />
  </g>
);

const Closing: Page = () => (
  <Shell>
    <Eyebrow>下課之後</Eyebrow>
    <Heading>課後第一步：每週一張卡</Heading>
    <Fit>
      <Stage h={440}>
        <Steps>
          <Layer h={440} label="第一步：新增一張卡">
            <InG i={0}><LoopStop x={204} n={1} kind="doc" label="新增一張卡" tag="第 1、3 堂：Codex、Skill" /></InG>
          </Layer>
          <Step duration={STEP_MS}><Layer h={440} label="第二步：核對出處">
            <MapArrow x1={300} x2={516} y={110} hot />
            <Build><LoopStop x={612} n={2} kind="search" label="核對出處" tag="第 2 堂：RAG" /></Build>
          </Layer></Step>
          <Step duration={STEP_MS}><Layer h={440} label="第三步：勾選、發布">
            <MapArrow x1={708} x2={924} y={110} hot />
            <Build><LoopStop x={1020} n={3} kind="upload" label="勾選、發布" tag="第 4 堂：發布" /></Build>
          </Layer></Step>
          <Step duration={STEP_MS}><Layer h={440} label="第四步：傳網址給一個人看，然後下週再一輪">
            <MapArrow x1={1116} x2={1332} y={110} hot />
            <Build><LoopStop x={1428} n={4} kind="user" label="傳網址給一個人" tag="第 4 堂：驗收" /></Build>
            <g fill="none" stroke={amber} strokeWidth="4" strokeDasharray="10 8"><path d="M1428 326 C1428 420 204 420 204 336" /></g>
            <Build i={2}><polygon points="204,326 194,344 214,344" fill={amber} /><text x="816" y="436" textAnchor="middle" fontSize="27" fontWeight="600" fill={amber}>下週再一輪</text></Build>
          </Layer></Step>
        </Steps>
      </Stage>
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={20}>每週一輪，網站每週多一張有出處的卡</Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

const NextSteps: Page = () => (
  <Shell>
    <Eyebrow>選修延伸｜課後</Eyebrow>
    <Heading>發布前，用 llm-wiki 整理</Heading>
    <Fit>
      <div style={{ display: 'grid', gap: 28 }}>
        <SkillRow i={0} cmd="$wiki-ingest" what="收新資料，整理成卡片" icon={<g>
          <DocShape x={4} y={14} w={40} h={52} /><MapArrow x1={50} x2={74} y={40} hot /><Folder x={78} y={18} w={30} h={44} />
        </g>} />
        <SkillRow i={1} cmd="$wiki-query" what="查答案，附出處" icon={<g>
          <circle cx="44" cy="36" r="24" fill="none" stroke={okGreen} strokeWidth="5" /><path d="M62 54 l22 22" stroke={okGreen} strokeWidth="6" strokeLinecap="round" />
        </g>} />
        <SkillRow i={2} cmd="$wiki-lint" what="健檢：斷連結、孤立頁" icon={<g>
          <rect x="6" y="28" width="38" height="24" rx="12" fill="none" stroke={faint} strokeWidth="5" /><rect x="66" y="28" width="38" height="24" rx="12" fill="none" stroke={faint} strokeWidth="5" />
          <path d="M50 22 L60 58" stroke={warn} strokeWidth="5" strokeLinecap="round" />
        </g>} />
      </div>
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={48}>整理、查證、健檢完，再按發布</Takeaway></Step></Steps>
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
Section5.transition = OPENER;

export const meta: SlideMeta = {
  title: 'aw-04 發布成網站',
  createdAt: '2026-10-17T02:55:57.689Z',
  theme: 'thoughtstream',
};

const deck: Page[] = [
  Cover, LessonRecap, SiteGoal, Agenda,
  Section1, WebsiteIs, ThreePlaces, FourStops, CiCd, UpdateTimeline, BuildStep, PublishFilter,
  Section2, GitHubAccount, Division, DeploySite, Practice1,
  Section3, TokenDoors, InstallPlugin, CreateToken, TokenSafety, ConnectGitHub, Practice2,
  Section4, PublishSwitch, FrontmatterCheck, HomeFlag, NavPage, PublishCommand, HtmlTest, HtmlLinks, Practice3,
  Section5, CheckSite, Practice4, NotUpdated, GitBasics,
  CourseRecap, Closing, NextSteps,
  ExtraFolder, ActionsDeploy,
];

// 1-based page number of a page in this deck (for the agenda).
function pageOf(page: Page) {
  return deck.indexOf(page) + 1;
}

// Speaker notes, keyed by page so they stay aligned with the deck order.
const NOTES = new Map<Page, string>([
  [Cover, `00:00–01:00
最後一堂。前三堂我們寫了大綱、做了筆記庫、用 Skill 排出時間軸，全部都還在自己的電腦裡。今天把它變成一個網址，同學、家人打開就看得到。
右下角三個圓圈就是今天的路線：筆記 → GitHub → 網址。`],
  [LessonRecap, `01:00–04:00
先回頭看三樣東西。第一堂用 Codex 寫出 三國演義大綱.md，人名都是 [[連結]]。第二堂把它放進 Obsidian，和人物、勢力、關係卡連起來。第三堂用 Skill 擴充卡片，排出 時間軸.md。
按一下：第四個站是今天要做的網站。
再按一下：今天把前三堂的成果放到一個網址上。請大家先打開 Obsidian，確認時間軸那張卡還在。`],
  [SiteGoal, `04:00–07:30
這是做完後的樣子（示意，實際外觀看模板）。打開網址先到首頁〈三國演義〉，點〈知識庫導覽〉。導覽頁是一般的筆記，裡面的 [[連結]] 都點得開。
從導覽頁有兩條路：上面那條到〈時間軸〉，看事件的先後順序；它是一張表格，第三堂的 Skill 讓人名寫成純文字，所以表格裡的人名不能點。下面那條直接到〈劉備〉〈桃園結義〉這些人物、事件卡。
按一下：這就是今天的路線，首頁 → 導覽頁 → 時間軸、人物、事件。第五章大家會照這條路互相驗收。`],
  [Agenda, `07:30–10:00
五章、四個練習。第一章 20 分鐘講概念：網站是什麼、檔案放哪、為什麼推上去就會自己更新。第二章做出網址。第三章讓 Obsidian 連上 GitHub。第四章挑卡發布，包括第三堂的時間軸卡。第五章互相驗收，再看 Git 和下一步。
最容易卡的是第二、三章的帳號和 token，助教會在教室後面。上週作業是先註冊 GitHub、Vercel，等一下第 ${pageOf(GitHubAccount)} 頁會檢查。`],
  [Section1, `10:00–10:30
第一章先不動手。把「筆記怎麼變成網址」講清楚，後面每一步按下去，你才知道東西跑到哪裡。`],
  [WebsiteIs, `10:30–13:00
先問大家：你打一個網址，看到的網頁是從哪來的？
第一個畫面：你在瀏覽器輸入網址。網址就像門牌，告訴瀏覽器去哪一台電腦拿東西。
按一下：網址指向一台一直開著、連在網路上的電腦，叫主機。它上面放了一堆檔案，找到〈劉備〉這一頁。
按一下：檔案送回來，瀏覽器把它畫成網頁，看到標題、內文、可以點的連結。
最後一下：網站就是放在別台電腦上的檔案。今天要做的，就是把你的卡變成這種檔案，放到那台電腦上。`],
  [ThreePlaces, `13:00–16:00
今天會碰到三個地方，先分清楚。像書桌、倉庫、店面。
第一個是書桌：你的電腦。Obsidian 儲存庫在這裡，所有卡片都在，包括草稿和上課筆記，只有你看得到。
按一下：倉庫是 GitHub。等一下會建一個叫 my-garden 的 repo，裡面放網站程式，還有你勾選要公開的卡，放在 src/site/notes/ 底下，這是 Digital Garden 模板的實際位置。箭頭上寫「按發布」：卡片要你在 Obsidian 按發布，才會送到這裡，不會自己跑上去。
按一下：店面是 Vercel。這一段是自動的：GitHub 一收到新的卡，Vercel 就把它做成網頁、給網址，誰都看得到。
最後一下：草稿只留在你的電腦裡。不會因為你裝了外掛，整個儲存庫就跑上網。`],
  [FourStops, `16:00–18:30
把三個地方串起來，中間多一個外掛，一共四站。先看哪些是你動手、哪些是自動。
第一站 Obsidian：你寫卡，要公開的卡打勾。
按一下：第二站 Digital Garden 外掛，裝在 Obsidian 裡。你按「發布」，它才把打勾的卡送出去。下面紫色的括號：前兩站都是你動手，勾選、按發布。
按一下：第三站 GitHub 收到新版本。
按一下：第四站 Vercel 做成網頁、給網址。綠色括號這一段是自動的：GitHub 收到之後，Vercel 自己建置、上線，你不用再做什麼。
最後一下：你只按一次發布，GitHub 收到後就自動上線。下一頁講這個「自動」叫什麼。
來源：https://docs.forestry.md/getting-started/01-getting-started/`],
  [CiCd, `18:30–21:30
這頁講一個工程師常說的詞：CI/CD。CI 是 Continuous Integration，持續整合；CD 是 Continuous Deployment，持續部署。名字不用背，記住它在做什麼就好。
上面一排是以前的做法：改好檔案，自己把檔案上傳到主機，再自己重做網頁，才算上線。紅色的兩格都要人動手，常常忘記其中一步。
按一下：下面一排是 CI/CD。紫色那格是你唯一要做的：按發布，把改好的卡送上 GitHub，就像把信投進郵筒。綠色括號是自動的部分：GitHub 收到之後，建置、上線都自己跑，像郵差會把信送到。
最後一下：你按發布；之後的建置、上線都自動。注意，按發布這一步不會自己發生。`],
  [UpdateTimeline, `21:30–24:00
用一次更新走一遍，時間都是示意，實際看網路和網站大小。
第一格：你在〈劉備〉補一句。紫色字寫「你動手」。
按一下：你按發布，外掛把這張卡送出去。這也是你動手。
按一下：綠色開始是自動的。GitHub 收到，多一筆紀錄。
按一下：Vercel 發現有新版本，開始建置，整個網站重做一次。
按一下：網址上的網頁更新，重新整理就看到。下面的括號：從按發布到網址更新，通常幾秒到一兩分鐘。
最後一下：沒變的話，先等兩分鐘再重新整理。很多人以為壞了，其實只是還在建置。`],
  [BuildStep, `24:00–27:00
「建置」這個詞剛才一直出現，這頁看它到底做了什麼。像照食譜做出一道菜：食譜是原始檔，菜是網頁。
左邊是 人物/劉備.md 的原始檔：開頭三行是屬性，內文有 [[關羽]]、[[張飛]] 兩個連結。
按一下：Vercel 照模板開始建置。
按一下：做好的網頁。開頭三行不見了，標題變大，[[關羽]] 變成一個可以點的連結。
最後一下：[[連結]] 是在建置時才變成網址。記住這句，第四章講時間軸卡時會用到：有些地方的 [[ ]] 不會被轉換。`],
  [PublishFilter, `27:00–30:00
最後一個概念：誰決定哪些卡上網站？卡片開頭的 dg-publish。左上角的說明：打勾的方框，就是開頭寫了 dg-publish: true。
左邊是你的儲存庫，五張卡，三張打勾。中間像一個篩子，只讓打勾的過。
按一下：網站上只出現打勾的三張。注意箭頭上的字：按發布才送出。勾 dg-publish 只是先選好卡，還要按發布，卡才會上去。很多同學勾完就去看網址，結果什麼都沒有，就是少了這一步。
按一下：沒勾的〈我的草稿〉〈上課筆記〉留在你的電腦，不會上傳。
最後一下：dg-publish 只是選卡，按發布才會上去。反過來說，勾了又按了發布，就是全世界看得到，私人的東西不要勾。第四章會教怎麼勾、怎麼檢查。
來源：https://docs.forestry.md/getting-started/01-getting-started/`],
  [Section2, `30:00–30:30
第二章動手。按一個按鈕，GitHub 上多一個 repo，Vercel 上多一個網址。`],
  [GitHubAccount, `30:30–32:00
上週的作業是先註冊 GitHub 和 Vercel，因為現場一起註冊，常常卡在 email 驗證信。
左邊是 GitHub 個人頁的示意。先問大家：都完成了嗎？
按一下：驗證信的連結點過了。按一下：登得進 github.com。按一下：記下自己的 Username，等一下填外掛會用到，它是網址 github.com/ 後面那一段，不是 email。按一下：Vercel 選 Continue with GitHub，用 GitHub 帳號登入，不用另外記密碼。
最後一下：還沒註冊的人，照下面這條補：
1. 到 https://github.com/signup 註冊，大約 5 分鐘。
2. 收 email 驗證信，點連結。信有時要等幾分鐘，也看一下垃圾郵件匣。
3. 到 https://vercel.com/signup ，選 Continue with GitHub。
等信的這段時間，先坐到鄰座旁邊看他的畫面跟著練習 1，信到了再自己做一次。助教會協助。`],
  [Division, `32:00–34:00
這兩個服務常被搞混，用倉庫和店面來分。
左邊 GitHub 是倉庫：收貨、記帳。每次修改都留一版，第 1 版建立網站、第 2 版改首頁、第 3 版加了〈時間軸〉，哪一版改了什麼都查得到。
按一下：右邊 Vercel 是店面。它看到 GitHub 有新版，就拿最新那一版去建置，換上新網頁，給你一個網址。
最後一下：GitHub 有新版，Vercel 就重做網站。兩邊都免費方案就夠用。`],
  [DeploySite, `34:00–37:00
先示範一次，大家先看，下一頁再一起做。畫面是示意，Vercel 改版時按鈕位置可能不同。
第一步：打開 Digital Garden 官方入門頁 https://docs.forestry.md/getting-started/01-getting-started/ ，找到 Deploy to Vercel 按鈕。
按一下：Vercel 出現 Create Git Repository。Git Scope 選你的 GitHub 帳號，Repository Name 自己取，建議就用 my-garden，按 Create。還沒登入的話會先請你用 GitHub 登入。
按一下：等一到兩分鐘，看到 Congratulations 和一個網址。點那個網址打開看看。
最後一下：打得開模板首頁，才算部署好。只看到網址還不夠，有時網址出來了，打開卻是錯誤頁。成功的話，把 repo 名稱和網址抄下來，第三章會用到。`],
  [Practice1, `37:00–50:00
練習 1，13 分鐘：建立自己的網站。這不是 AI 練習，三格只是提醒：用官方模板、做出打得開的網站、卡住 5 分鐘就舉手。
1. 先在瀏覽器登入 GitHub 和 Vercel。
2. 到官方入門頁按 Deploy to Vercel：https://docs.forestry.md/getting-started/01-getting-started/
3. Repository Name 填 my-garden，按 Create。
4. 等部署完成，打開網址。
按一下：完成的樣子是網址打開後，看到 Digital Garden 模板的首頁。只拿到網址還不算，一定要打開看。順便把 repo 名稱和網址記下來。
常見狀況：GitHub 要你授權 Vercel 存取 repo，選允許；名稱重複就改成 my-garden-2；等超過 5 分鐘還在跑，請助教看 Vercel 專案頁的 Deployments。部署卡住的人先跳過，講師課後協助，後面可以先看鄰座同學的畫面。`],
  [Section3, `50:00–50:30
網站已經有了，但現在是空的模板。這一章讓 Obsidian 有權限把卡寫進 my-garden。`],
  [TokenDoors, `50:30–52:00
外掛要把卡寫進你的 GitHub repo，GitHub 得先知道它是你派來的。這就是 token，中文叫存取權杖。像給快遞一把鑰匙，只開你家信箱，不開大門。
第一個畫面：Obsidian 裡的 Digital Garden 外掛，手上拿著 token。
按一下：GitHub 上你可能有好幾個 repo。
按一下：這把 token 只打得開 my-garden，其他 repo 打不開。這叫 fine-grained token，權限切得很細，萬一外流，損失也只限這一個 repo。
最後一下：沒有 token，外掛進不了 repo，發布會失敗。`],
  [InstallPlugin, `52:00–54:00
大家跟著做。左下角齒輪進設定。畫面是依繁中介面整理的示意，版本不同可能略有差異。
按一下：左邊點「第三方外掛程式」。如果看到受限模式，按「關閉」。
按一下：社群外掛程式那一列，按「瀏覽」。
按一下：搜尋 Digital Garden，按安裝，裝好再按啟用。
外掛是裝在目前這個儲存庫，請確認你打開的是三國人物知識庫。官方說明：https://obsidian.md/help/community-plugins`],
  [CreateToken, `54:00–57:00
這一步最容易卡，慢慢來。GitHub 的畫面常改版，所以投影片不教按哪裡，教你確認哪五件事。左邊的表單是示意。
打開 https://github.com/settings/personal-access-tokens/new 。也可以從右上頭像 → Settings → Developer settings → Personal access tokens → Fine-grained tokens → Generate new token 走進去。Token name 取一個認得出來的名字，例如 digital-garden。
按一下：1，Repository access 選 Only select repositories，只勾你的網站那一個 repo，例如 my-garden。萬一 token 外流，別人也只碰得到這個 repo。
按一下：2，Permissions 裡的 Contents 改成 Read and write。外掛就是靠它把你的筆記寫進 repo。
按一下：3，Pull requests 也改成 Read and write。Digital Garden 外掛的說明寫明要這兩項；Pull requests 是給「更新網站模板」用的，外掛會開一個 pull request 把新版模板合進來。Metadata 會自動變唯讀，不用動。
按一下：4，Expiration 要有到期日。預設 30 天，建議改 90 天；到期後發布會失敗，回同一頁按 Regenerate，再把新的貼進外掛。
按一下：5，按 Generate token，馬上複製。這串字只顯示這一次，關掉頁面就看不到了。
來源：https://github.com/oleeskild/obsidian-digital-garden （README 的 fine-grained token 設定：Contents 與 Pull requests 都要 Read and write）、https://docs.forestry.md/advanced/fine-grained-access-token/`],
  [TokenSafety, `57:00–58:30
剛複製的那串字，等於 my-garden 的鑰匙，要當密碼看待。fine-grained token 開頭通常是 github_pat_。
按一下：它只該放在一個地方，外掛設定的 GitHub token 欄位。
按一下：不要貼進筆記（筆記勾了 dg-publish 就公開了），不要出現在截圖或投影片，不要丟到 LINE 群組或 Email 問人。
按一下：90 天到期後發布會失敗。回 GitHub 同一頁，找到這把 token 按 Regenerate，再把新的貼進外掛。
最後一下：萬一外流，到 GitHub 的 token 列表按 Delete，重建一把就好。`],
  [ConnectGitHub, `58:30–60:00
回 Obsidian → 設定 → 左側最下面的 Digital Garden，看到 GitHub Authentication 這三格。這是外掛的實際畫面。
按一下：1，GitHub repo name 只填名字，例如 my-garden。不要加帳號，也不要貼網址。
按一下：2，GitHub Username 填你的帳號，就是 github.com/ 後面那段。
按一下：3，GitHub token 貼上剛才複製的那串。填好就會自動存，不用按儲存。
最後一下：填好還不算。三格裡打錯一個字，畫面看起來一樣。要知道有沒有連上，就真的發布一張卡試試，下一頁的練習就做這件事。`],
  [Practice2, `60:00–68:00
練習 2，8 分鐘。剛才跟著做完的人，檢查一遍；沒跟上的現在補。
1. 安裝並啟用 Digital Garden 外掛。
2. 建 fine-grained token：只選 my-garden、Contents 和 Pull requests 讀寫、有到期日。
3. 在外掛填三格：repo name、Username、token。
4. 試發布一張：打開〈三國演義〉，按 Ctrl／Cmd + P，搜尋 garden publish，選 Publish Active Note（第 ${pageOf(PublishCommand)} 頁會細講）。〈三國演義〉本來就有 dg-publish 和 dg-home，發布它不會公開別的卡。
按一下：等一兩分鐘，打開你的網址。首頁從模板的預設頁變成〈三國演義〉，就代表連上了。上面的人名連結現在點不開是正常的，那些卡還沒發布，第四章再處理。
沒變的話：先等兩分鐘；再回頭查三格，最常見的是 repo name 多打了帳號，或 token 少勾了 Contents。`],
  [Section4, `68:00–68:30
第四章挑卡發布。先學怎麼看開頭三行，再把首頁、導覽頁、時間軸卡一起發布。`],
  [PublishSwitch, `68:30–70:00
左邊是 Obsidian 屬性面板的實際畫面：dg-publish 旁邊有個勾選框，打勾就是要公開。
按一下：切換到原始碼模式看，就是檔案最上面三行：兩條 --- 中間夾著 dg-publish: true。這三行叫 frontmatter，也叫屬性。
最後一下：打勾和寫 true，是同一件事。
另一個方法：打開那張卡，Ctrl／Cmd + P，執行 Digital Garden: Add publish flag，它會幫你加上這行。`],
  [FrontmatterCheck, `70:00–72:30
這是第三堂實測時發生的事。我們用 eli5 把 人物/劉備.md 改寫成國中生看得懂的版本，存成 劉備-國中生版.md。內容是對的。
按一下：但它把開頭的 dg-publish: true 也一起抄了過去。
按一下：結果是一發布，網站上會多一張〈劉備-國中生版〉，和原本的〈劉備〉並排，讀者會搞不清楚哪張才對。
按一下：如果有 dg-publish、又不想公開，就刪掉那行，或在屬性取消勾選。第三堂的 eli5 提示詞現在最後一句是「新檔不要加 dg-publish。」，所以你的國中生版可能本來就沒有這行；講師實測那次是舊提示詞，才會抄過去。
按一下：反過來的情況也有。第三堂時間軸 Skill 實跑產出的 時間軸.md，開頭完全沒有屬性，直接就是 <table>。它不會被發布；要公開的話，在最上面自己加三行：---、dg-publish: true、---，或打開它執行 Add publish flag。
最後一下：新卡發布前，先看開頭三行。多了要刪，少了要補。`],
  [HomeFlag, `72:30–74:00
網站打開的第一頁是哪一張？由 dg-home 決定。
左邊是〈三國演義〉的開頭：除了 dg-publish，還多一行 dg-home: true。講師的教材已經加好了。
按一下：打開網址，最後面是一個斜線，也就是網站的第一頁，顯示的就是〈三國演義〉。
最後一下：整個網站只放一張 dg-home。兩張都有的話，首頁會不確定是哪一張。`],
  [NavPage, `74:00–76:30
第一次來的讀者不知道從哪開始，所以做一張導覽頁。這也是整個網站的路口：時間軸是一張表格，人名不能點，要點人物、事件，都從這裡走。
左邊是 整理/知識庫導覽.md：開頭有 dg-publish: true，下面三個路標。時間連到 [[時間軸]]，人物連到每張人物卡，事件連到每張關係卡。導覽頁是一般的 Markdown 筆記，這些 [[連結]] 在網站上都點得開。可以自己手打，也可以請 Codex 做，提示詞在練習 3 的備註。
右上：再打開〈三國演義〉，在最後一行加 [[知識庫導覽]]。首頁連得到導覽頁，讀者才走得進來。
接著一項一項按，對清單：
按一下：導覽頁有 dg-publish: true。
按一下：首頁最後一行連到 [[知識庫導覽]]。
按一下：導覽頁連到的每張卡，只要想公開，都要有 dg-publish。連到的卡不會自動一起發布，少勾一張，網站上那個連結就點不開。
按一下：〈劉備-國中生版〉沒有公開，除非你本來就想公開它。
最後一下：要點人物、事件，都從導覽頁走。`],
  [PublishCommand, `76:30–78:00
勾好之後，按 Ctrl／Cmd + P，搜尋 garden publish。這是 Digital Garden 2.96.0 命令面板的實際畫面，裁切放大了前兩行。
按一下：第一行 Publish Active Note，只發布你現在打開的這一張，而且這張要有 dg-publish。練習 2 試發布〈三國演義〉用的就是它。
按一下：第二行 Publish All Notes Marked for Publish，一次發布所有勾了 dg-publish 的卡。
最後一下：練習 3 要一次送出導覽頁、時間軸和好幾張卡，所以用第二行。之後只改一張卡，用第一行就好。發布完等一兩分鐘再看網址。
來源：https://docs.forestry.md/getting-started/02-commands/`],
  [HtmlTest, `78:00–80:30
這是第三堂時間軸 Skill 實際跑出來的 時間軸.md：一個 HTML 表格，第 1 回到第 49 回共六件事，人物欄寫純文字，下面一段「來源卡」列出每件事出自哪張關係卡。我把它放進自己的 Digital Garden 模板，在電腦上建置成網站，這是實際畫面。先說清楚：這是本機建置，還沒透過 Obsidian 外掛發布到線上驗證，等一下大家發布後請一起確認。
按一下：1，表格照常顯示。模板預設就允許筆記裡寫 HTML（markdown-it 的 html: true），所以第三堂讓 Skill 產出 HTML 沒有問題。
按一下：2，人物欄都是純文字，沒有 [[ ]] 殘留。這是我們在 SKILL.md 裡要求的。
按一下：3，問題在下面的來源卡。Skill 把它寫成 <a href="../關係/桃園結義.md">，在網站上點下去是 404，找不到頁面。原因是網站上的網址不是 .md 檔名，建置時會換成另一種網址。
第三堂的 SKILL.md 已經補了一條規則：「- 來源卡只寫檔名純文字，不做連結」。用舊版 Skill 產出的同學，重跑一次，或手動把那幾個 <a> 拿掉。`],
  [HtmlLinks, `80:30–82:00
把剛才的問題整理成三種寫法。回想第 ${pageOf(BuildStep)} 頁：[[連結]] 是建置時轉換的，但它只轉換一般的 Markdown 文字，HTML 區塊裡的東西會原封不動送出去。
第一種：在 HTML 裡寫 [[劉備]]，網站上原樣顯示兩對中括號，點不了。這是講師另一張測試卡的本機建置結果。
按一下：第二種：寫成連到 .md 檔的 <a href="../關係/桃園結義.md">。看起來像連結，點下去是 404，就是上一頁實測看到的。
按一下：第三種：純文字，「第 1 回：關係/桃園結義」。不能點，但乾淨、不會壞。
最後一下：所以時間軸裡的人名、來源卡都用純文字；要點人物，走導覽頁。這就是今天網站的設計：時間軸負責看順序，導覽頁負責帶路。SKILL.md 裡的兩條規則：人名用純文字，不用 [[連結]]；來源卡只寫檔名純文字，不做連結。想讓讀者點得到來源卡，就在表格下面、HTML 區塊外，另外用一般的 [[桃園結義]] 列一行，那一行會正常轉換。`],
  [ExtraFolder, `課後選修（附錄 A，不占課堂 120 分鐘）
第三堂用 diagram-design 畫的 三國關係圖.html 是一個獨立的 HTML 檔，不是筆記。想把它放上網站，看這頁。
按一下：Digital Garden 外掛只上傳筆記，.html 檔它不會送。
按一下：所以要走另一條路：打開 GitHub 上的 my-garden，按 Add file → Create new file，檔名打 extra/sanguo-map.html（打了斜線就會建出 extra 資料夾），用文字編輯器打開 三國關係圖.html，整段複製貼上，按 Commit changes。檔名用英文，網址比較不會出問題。
還要一行設定：模板預設不會把 extra/ 放上網站。在 GitHub 上編輯 .eleventy.js，在 eleventyConfig.addPassthroughCopy("src/site/img"); 那幾行旁邊加一行：
eleventyConfig.addPassthroughCopy({ "extra": "extra" });
講師的網站就是加了這一行，本機測試才看得到 iframe。
按一下：再新增一張筆記，例如〈三國關係圖〉，內文放一行 <iframe src="/extra/sanguo-map.html" width="100%" height="600"></iframe>，勾 dg-publish 發布。網站上就會嵌進整張圖。
最後一下：外掛只送筆記，.html 要自己放。這是講師網站的本機測試結果，還沒在線上驗證。`],
  [Practice3, `82:00–95:00
練習 3，13 分鐘：做導覽頁，把時間軸卡和卡片一起發布上去。
1. 查開頭三行：第三堂新增的卡一張一張打開。〈劉備-國中生版〉如果有 dg-publish、又不想公開，就刪掉那行；時間軸.md 沒有屬性，要公開就在最上面加 ---、dg-publish: true、---。
2. 做導覽頁：可以手打，或請 Codex 做。完整提示詞：
「請在 整理/ 新增〈知識庫導覽〉。分成時間、人物、事件三段：時間那段列出 [[時間軸]]；人物、事件兩段，用 [[連結]] 列出筆記庫裡每張人物卡和事件卡。只連到已有的卡，不要新增卡片。開頭加上 dg-publish: true。寫入前先給我看。」
接著打開〈三國演義〉，最後一行加 [[知識庫導覽]]。
3. 勾 dg-publish：導覽頁、時間軸，還有導覽頁連到的每張卡。照第 ${pageOf(NavPage)} 頁的清單對一次。
4. Ctrl／Cmd + P，執行 Publish All Notes Marked for Publish，等兩分鐘打開網址。
按一下：完成的樣子：首頁 → 導覽頁 → 時間軸走得通；導覽頁點得到〈劉備〉。時間軸裡的人名是純文字、點不了，這是對的。如果時間軸裡出現 [[ ]] 或點了會 404 的來源卡連結，回第三堂的 SKILL.md 補規則，再產生一次。`],
  [Section5, `95:00–95:30
最後一章：先請同學驗收你的網站，再看 Git 和接下來可以做什麼。`],
  [CheckSite, `95:30–97:30
驗收的方法像跑接力，每一棒都要交得出去。路線和開場那頁一樣：首頁 → 導覽頁，再分兩條，一條到時間軸，一條到人物卡。
按一下：首頁點得到導覽頁嗎？
按一下：導覽頁點得到時間軸嗎？打開時間軸，人名是純文字、點不了，這是對的，不是壞掉；要點人物，回導覽頁走。
按一下：最後一棒故意示範斷掉：從導覽頁點〈劉備〉打不開，通常是這張沒勾 dg-publish，或勾了還沒發布。連到的卡不會自動發布。
最後一下：補勾之後，再發布一次，等兩分鐘重新走。`],
  [Practice4, `97:30–107:00
練習 4，10 分鐘：互相驗收。兩人一組。
1. 你先公開一張新卡，例如第三堂新增的〈三英戰呂布〉，在導覽頁的事件那段加上 [[三英戰呂布]]，兩張都要有 dg-publish，發布。
按一下：2. 把你的網址傳給同學，用 LINE 或寫在紙上都可以。
按一下：3. 同學在自己的電腦開無痕視窗（Chrome：Ctrl／Cmd + Shift + N），貼上你的網址。一定要看同學自己打開的公開網址，不要看講師的螢幕，也不要用你自己的電腦，你的瀏覽器可能留著舊的畫面。只能從首頁開始點：首頁 → 導覽頁 → 三英戰呂布，不能直接打卡片的網址。
按一下：4. 回報結果：走到了就打勾；走不到，說卡在哪一頁，你回去查那一頁的 dg-publish 和連結，修好再發布。
做完交換角色。最後請一兩組分享斷在哪裡，通常是忘了勾、勾了沒發布，或連結的卡名打錯。`],
  [NotUpdated, `107:00–110:00
大家剛才最常遇到的：發布了，網站卻沒變。照順序查四個地方，右邊的畫面都是示意，實際畫面依版本略有不同。
1. 有沒有按發布？勾了 dg-publish 不會自己送出。Obsidian 按 Ctrl／Cmd + P，搜尋 garden publish。
按一下：2. GitHub 有沒有新 commit？打開 github.com/你的帳號/my-garden，看最上面「最新一筆」的時間。時間對得上剛才按發布，就是收到了；還停在很久以前，回到第 1 步，或查外掛三格。
按一下：3. Vercel 的狀態。登入 Vercel → 點你的專案 my-garden → 上面的 Deployments，看最上面那一筆。Building 是建置中，再等；Ready 是完成；Error 是失敗，點進去看錯誤訊息，拍給助教。
按一下：4. 前面都對，網站還是舊的？瀏覽器可能留著舊頁面。按 Ctrl／Cmd + Shift + R 強制重新整理，或開無痕視窗看。
最後一下：從第 1 步往下查，不要跳步。`],
  [GitBasics, `110:00–112:30
今天一直按的「發布」，在幕後做了什麼？工程師用一個叫 Git 的工具管理版本。像拍照存檔，再把照片寄出去。
第一格：你在 Obsidian 按 Publish。
按一下：外掛在你的 GitHub repo 建了一筆 commit。commit 就是一張快照，記下這次改了什麼。工程師在自己電腦上會打 git commit 拍快照，再打 git push 寄到 GitHub；Digital Garden 外掛透過 GitHub 的 API，直接在 GitHub 上建這筆 commit，等於一次做完這兩步。剛才檢查 2 看的「最新 commit」，就是它。
按一下：GitHub 收到新版本，Vercel 就自動重做網站，這就是第 ${pageOf(CiCd)} 頁的 CI/CD。
最後一下：自己打 git commit、git push，做的是同一件事。想自己試：git clone 你的 my-garden（GitHub 上 Code → HTTPS 複製網址），改 README，再 git add、git commit -m "說明"、git push。README 不會變成公開筆記。
來源：https://git-scm.com/book/en/v2/Git-Basics-Recording-Changes-to-the-Repository`],
  [ActionsDeploy, `課後選修（附錄 B，不占課堂 120 分鐘）
這是另一套部署方式，今天的 Vercel 流程用不到。除了 Vercel，GitHub 自己也有一個自動化工具，叫 GitHub Actions。像 GitHub 上的機器人，照一張清單做事。
你 git push 到 GitHub。
按一下：GitHub 讀 .github/workflows/ 資料夾裡的清單，照順序執行。右邊是這份簡報實際用的 pages.yml 節錄：push 到 main 就觸發，取出程式碼、裝 Node.js、裝套件、建置投影片、部署。
按一下：建好的網站放到 GitHub Pages，得到一個 github.io 網址。你現在看的這份簡報，就是這樣上線的。
最後一下：今天用 Vercel 最簡單；想全部留在 GitHub、或要自己控制每一步，再改用 Actions。
來源：https://docs.github.com/en/actions 、https://github.com/Chrouos/AI-workshop-slides/blob/main/.github/workflows/pages.yml`],
  [CourseRecap, `112:30–115:30
四堂課走一圈。上面是四個成果：大綱、筆記庫、時間軸、網站。
按一下：RAG 這條線。第一堂知道 Web Search 就是 RAG；第二堂在自己的筆記庫查資料、附出處；第三堂照原文新增卡片；今天網站上每張卡都有出處。
按一下：Obsidian 這條線。第一堂只預告；第二堂安裝、連結、畫關係圖；第三堂加卡片模板和時間欄位；今天用 Digital Garden 發布。
按一下：Skills 這條線。第一堂預告 AGENTS.md；第三堂安裝熱門 Skill、自己寫一個；今天把 Skill 的產出放上網站。
最後一下：四堂課做的是同一座三國知識庫，每一堂都接著上一堂。`],
  [NextSteps, `118:00–120:00
最後是選修延伸，給想多做一點的人。llm-wiki 是一組整理筆記庫的 Skill，放在發布之前用：
$wiki-ingest：收新資料，整理成卡片，對應循環的第一步。
$wiki-query：查答案，附出處，就是第二堂的 RAG，對應第二步。
$wiki-lint：健檢，找斷掉的連結、孤立頁、缺屬性的頁。它找到的斷連結，就是同學在網站上走不到的地方。
安裝（需要 Python 3）：pip install obsidian-wiki，再 obsidian-wiki setup --vault <筆記庫完整路徑>，最後 obsidian-wiki doctor 檢查。裝好後在 Codex 打開筆記庫，說「set up my wiki」。
完整說明：https://github.com/Ar9av/obsidian-wiki/blob/main/docs/installation.md 、https://github.com/Ar9av/obsidian-wiki/blob/main/docs/skills.md
按一下：整理、查證、健檢完，再按發布。後面兩頁是附錄，課後有興趣再看。謝謝大家這四堂課。`],
  [Closing, `115:30–118:00
課程結束後，知識庫怎麼繼續長？給大家一個每週做一次的小循環，四步都是這四堂學過的。
第一步：新增一張卡。用第一堂的 Codex，或第三堂的 Skill，照原文寫一張新的人物或事件卡。
按一下：第二步：核對出處。第二堂的 RAG：每一句都要找得到原文，找不到就刪。
按一下：第三步：勾 dg-publish、按發布，也把它加進導覽頁。第四堂今天做的。
按一下：第四步：把網址傳給一個人看，請他從首頁點到這張卡，就像今天的練習 4。然後下週再來一輪。
最後一下：每週一輪，網站每週多一張有出處的卡。`],
]);

export const notes: (string | undefined)[] = deck.map(page => NOTES.get(page));

export default deck satisfies Page[];
