import type { DesignSystem, Page, SlideMeta, SlideTransition } from '@open-slide/core';
import { Step, Steps, useIsActivePage, useSlidePageNumber } from '@open-slide/core';
import type { CSSProperties, ReactNode } from 'react';
import downloadPage from './assets/download-crop.png';
import firstLaunch from './assets/obsidian-first-launch.png';
import vaultQr from './assets/three-kingdoms-vault-qr.png';
import treeOk from './assets/tree-ok.png';
import treeWrong from './assets/tree-wrong.png';
import caocaoLine from './assets/caocao-chibi-line.png';
import chibiTop from './assets/chibi-top.png';
import chibiParticipants from './assets/chibi-participants.png';
import taoyuanGraph from './assets/liubei-taoyuan-graph.png';
import taoyuanLine from './assets/liubei-taoyuan-line.png';
import outlineCh1 from './assets/outline-ch1.png';
import liubeiCard from './assets/liubei-card.png';
import backlinksPane from './assets/backlinks-pane.png';
import ownCard from './assets/own-card-sanying.png';
import vaultGraph from './assets/vault-graph.png';
import ch21Before from './assets/ch21-before.png';
import ch21After from './assets/ch21-after.png';

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
const FONT_LINK_ID = 'osd-webfont-aw-02';
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
// when their step is revealed, bars that grow, highlights that sweep, and pieces that
// settle in order. Un-clicked motion runs only on the page the audience is watching
// (useIsActivePage). Thumbnails, overview and exports render every step revealed.
const EASE_OUT = 'cubic-bezier(0.23, 1, 0.32, 1)';
const STEP_MS = 280; // a <Step> fading in + an 8px rise
const BUILD_MS = 320; // pieces inside a revealed step settling in order
const BUILD_GAP = 90; // stagger between those pieces
const BAR_MS = 600; // bars growing from zero
const FILL_MS = 480; // chapter bar filling left to right
const ENTER_MS = 420; // a piece of a page settling in when the page arrives
const ENTER_GAP = 90; // stagger between those pieces
const DRAW_MS = 520; // a connecting line drawing from one end to the other

const MOTION_CSS = `
.aw2-deck [data-osd-step] > * { transition: transform ${STEP_MS}ms ${EASE_OUT}; }
.aw2-deck [data-osd-step="pending"] > * { transform: translateY(8px); }
.aw2-deck .aw2-build { transition-property: opacity, transform; transition-duration: ${BUILD_MS}ms; transition-timing-function: ${EASE_OUT}; }
.aw2-deck [data-osd-step="pending"] .aw2-build { opacity: 0; transform: translateY(10px); }
.aw2-deck .aw2-bar { transform-origin: left center; transition: transform ${BAR_MS}ms ${EASE_OUT}; }
.aw2-deck [data-osd-step="pending"] .aw2-bar { transform: scaleX(0); }
.aw2-deck .aw2-stepdraw { stroke-dasharray: 1; stroke-dashoffset: 0; transition: stroke-dashoffset ${DRAW_MS}ms ${EASE_OUT}; }
.aw2-deck [data-osd-step="pending"] .aw2-stepdraw { stroke-dashoffset: 1; }
.aw2-deck .aw2-sweep { transform-box: fill-box; transform-origin: left center; transition: transform 600ms cubic-bezier(0.45, 0, 0.25, 1); }
.aw2-deck [data-osd-step="pending"] .aw2-sweep { transform: scaleX(0); }
@keyframes aw2-fill { from { transform: scaleX(0); } to { transform: scaleX(1); } }
.aw2-deck .aw2-fill { transform-origin: left center; animation: aw2-fill ${FILL_MS}ms ${EASE_OUT} 160ms both; }
@keyframes aw2-in { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: none; } }
.aw2-deck .aw2-in { animation: aw2-in ${ENTER_MS}ms ${EASE_OUT} both; }
@keyframes aw2-draw { from { stroke-dashoffset: 1; } to { stroke-dashoffset: 0; } }
.aw2-deck .aw2-draw { stroke-dasharray: 1; animation: aw2-draw ${DRAW_MS}ms ${EASE_OUT} both; }
@keyframes aw2-pop { from { opacity: 0; transform: scale(0.75); } to { opacity: 1; transform: scale(1); } }
.aw2-deck .aw2-pop { transform-box: fill-box; transform-origin: center; animation: aw2-pop 300ms ${EASE_OUT} both; }
@keyframes aw2-in-fade { from { opacity: 0; } to { opacity: 1; } }
@media (prefers-reduced-motion: reduce) {
  .aw2-deck .aw2-in, .aw2-deck .aw2-pop { animation: aw2-in-fade 150ms ease both; }
  .aw2-deck .aw2-draw { animation: none; stroke-dasharray: none; }
  .aw2-deck .aw2-stepdraw, .aw2-deck [data-osd-step="pending"] .aw2-stepdraw { transition: none; stroke-dasharray: none; stroke-dashoffset: 0; }
  .aw2-deck [data-osd-step] > *, .aw2-deck [data-osd-step="pending"] > * { transform: none; transition: none; }
  .aw2-deck .aw2-build { transition: opacity 150ms ease; transition-delay: 0s !important; }
  .aw2-deck [data-osd-step="pending"] .aw2-build { transform: none; }
  .aw2-deck .aw2-bar, .aw2-deck [data-osd-step="pending"] .aw2-bar { transform: none; transition: none; }
  .aw2-deck .aw2-sweep, .aw2-deck [data-osd-step="pending"] .aw2-sweep { transform: none; transition: none; }
  .aw2-deck .aw2-fill { animation: none; }
}
`;
const MOTION_STYLE_ID = 'osd-motion-aw-02';
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
  return <div className={live ? 'aw2-in' : undefined} style={live ? { ...style, animationDelay: enterDelay(i) } : style}>{children}</div>;
};

// The same, for a group inside an SVG picture.
const InG = ({ i, children }: { i: number; children: ReactNode }) => {
  const live = useIsActivePage();
  return <g className={live ? 'aw2-in' : undefined} style={live ? { animationDelay: enterDelay(i) } : undefined}>{children}</g>;
};

// A mark (tick, cross, badge) that pops in after the thing it marks has landed.
const PopG = ({ i, children }: { i: number; children: ReactNode }) => {
  const live = useIsActivePage();
  return <g className={live ? 'aw2-pop' : undefined} style={live ? { animationDelay: enterDelay(i) } : undefined}>{children}</g>;
};

// A solid connecting line that draws itself on when the page arrives.
const DrawPath = ({ i, d }: { i: number; d: string }) => {
  const live = useIsActivePage();
  return <path d={d} pathLength={1} className={live ? 'aw2-draw' : undefined} style={live ? { animationDelay: enterDelay(i) } : undefined} />;
};

// A solid line inside a <Step>: it draws itself when that step is revealed.
const StepPath = ({ d, i = 0 }: { d: string; i?: number }) => (
  <path d={d} pathLength={1} className="aw2-stepdraw" style={buildDelay(i, 60)} />
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
const link = '#7654C7'; // Obsidian's internal-link purple
const linkFaint = '#B5A3DF'; // an unresolved link: the same purple, faded
const linkSoft = '#EEE7F2';
const warn = '#9B4A3C';
const term = '#1F2226';
const mono = '"Source Code Pro", Consolas, Menlo, monospace';
const display = 'var(--osd-font-display)';
const VAULT_ZIP_URL = 'https://raw.githubusercontent.com/Chrouos/AI-workshop-slides/main/examples/obsidian-agent-knowledge-garden/%E4%B8%89%E5%9C%8B%E4%BA%BA%E7%89%A9%E7%9F%A5%E8%AD%98%E5%BA%AB.zip';

// ---------- Frame ----------

const Title = ({ children }: { children: ReactNode }) => (
  <h1 style={{ fontFamily: '"Libre Baskerville", Georgia, "Times New Roman", serif', fontSize: 132, fontWeight: 400, lineHeight: 1.17, letterSpacing: '-0.035em', maxWidth: 1500, margin: 0, color: ink, whiteSpace: 'pre-line' }}>{children}</h1>
);

const Footer = () => {
  const { current, total } = useSlidePageNumber();
  return (
    <div style={{ position: 'absolute', left: 144, right: 144, bottom: 56, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #E7E5E4', paddingTop: 22, fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', fontSize: 22, fontWeight: 400, color: quiet }}>
      <span>AI 協作課｜第 2 堂 Obsidian 與 RAG</span>
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

// The four chapters of the lesson. Pages inside a chapter show where we are.
const CHAPTERS = ['認識 Obsidian', '把大綱放進筆記庫', '在筆記庫裡做 RAG', '建立知識圖譜'];
type Chapter = 1 | 2 | 3 | 4;

// One segment of the route bar. The current chapter is amber; on a chapter's opening
// page it fills in left to right, once, on the live page only.
const RouteSeg = ({ color, fill = false }: { color: string; fill?: boolean }) => (
  <span style={{ width: 34, height: 6, background: fill ? rule : color, display: 'block' }}>
    {fill ? <span className="aw2-fill" style={{ display: 'block', width: '100%', height: '100%', background: color }} /> : null}
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
  <div className="aw2-deck" style={{ width: '100%', height: '100%', boxSizing: 'border-box', position: 'relative', display: 'flex', flexDirection: 'column', background: 'var(--osd-bg)', color: 'var(--osd-text)', fontFamily: 'var(--osd-font-body)', padding: `${top}px 144px 126px` }}>
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
const Terminal = ({ title, children, width, size = 29 }: { title: string; children: ReactNode; width?: number; size?: number }) => (
  <div style={{ width, boxSizing: 'border-box', background: term, color: '#F5F5F4', border: '1px solid #555B60' }}>
    <div style={{ height: 52, display: 'flex', alignItems: 'center', gap: 12, background: '#30343A', padding: '0 26px', boxSizing: 'border-box' }}>
      <span style={{ width: 13, height: 13, borderRadius: 20, background: '#DF6A63' }} />
      <span style={{ width: 13, height: 13, borderRadius: 20, background: '#E9B650' }} />
      <span style={{ width: 13, height: 13, borderRadius: 20, background: '#73BB78' }} />
      <span style={{ fontFamily: mono, color: '#BCC3CC', fontSize: 23, marginLeft: 16 }}>{title}</span>
    </div>
    <div style={{ padding: '24px 36px 30px', fontFamily: mono, fontSize: size, lineHeight: 1.6, whiteSpace: 'pre' }}>{children}</div>
  </div>
);
const Typed = ({ children }: { children: ReactNode }) => <span style={{ color: '#8DD4A0' }}>{children}</span>;
const AskLine = ({ children }: { children: ReactNode }) => <span style={{ color: '#E9B650' }}>{children}</span>;
const Dim = ({ children }: { children: ReactNode }) => <span style={{ color: '#BCC3CC' }}>{children}</span>;

const Caption = ({ children }: { children: ReactNode }) => (
  <div style={{ fontSize: 22, lineHeight: 1.4, color: quiet, marginTop: 12 }}>{children}</div>
);

// A real screenshot at its own aspect ratio. Marks are given in % of the image.
const Screenshot = ({ src, aspect, width, caption, alt, url, children }: { src: string; aspect: number; width: number; caption?: string; alt: string; url?: string; children?: ReactNode }) => (
  <div style={{ width }}>
    {url ? (
      <div style={{ width, height: 56, boxSizing: 'border-box', background: '#ECEAE8', border: `1px solid ${rule}`, borderBottom: 'none', display: 'flex', alignItems: 'center', gap: 10, padding: '0 18px' }}>
        <span style={{ width: 12, height: 12, borderRadius: 6, background: '#D87771' }} />
        <span style={{ width: 12, height: 12, borderRadius: 6, background: '#E4BB62' }} />
        <span style={{ width: 12, height: 12, borderRadius: 6, background: '#81B984' }} />
        <span style={{ flex: 1, marginLeft: 14, background: '#FFFFFF', borderRadius: 18, padding: '5px 18px', fontFamily: mono, fontSize: 24, color: ink }}>{url}</span>
      </div>
    ) : null}
    <div style={{ width, height: Math.round(width / aspect), boxSizing: 'border-box', border: `1px solid ${rule}`, background: '#FFFFFF', boxShadow: '0 10px 30px rgba(28,25,23,0.08)', position: 'relative' }}>
      <img src={src} alt={alt} style={{ width: '100%', height: '100%', display: 'block' }} />
      {children}
    </div>
    {caption ? <Caption>{caption}</Caption> : null}
  </div>
);

// Where a marker's number badge sits. 'above' and 'below' hang the badge off a short
// leader line (`drop` px long), so it lands in empty space instead of on the text.
type Badge = 'left' | 'right' | 'above' | 'below';

const BADGE_STYLE: CSSProperties = { position: 'absolute', width: 48, height: 48, borderRadius: 24, background: amber, color: '#FFFFFF', display: 'grid', placeItems: 'center', fontSize: 26, fontWeight: 600, boxShadow: '0 0 0 4px #FFFFFF' };

const MarkBadge = ({ n, badge, drop }: { n: number; badge: Badge; drop: number }) => {
  if (badge === 'left') return <span style={{ ...BADGE_STYLE, left: -26, top: -26 }}>{n}</span>;
  if (badge === 'right') return <span style={{ ...BADGE_STYLE, right: -60, top: '50%', marginTop: -24 }}>{n}</span>;
  const up = badge === 'above';
  return (
    <>
      <span style={{ position: 'absolute', left: '50%', marginLeft: -2, width: 4, height: drop, background: '#E9B650', ...(up ? { bottom: '100%' } : { top: '100%' }) }} />
      <span style={{ ...BADGE_STYLE, left: '50%', marginLeft: -24, ...(up ? { bottom: `calc(100% + ${drop}px)` } : { top: `calc(100% + ${drop}px)` }) }}>{n}</span>
    </>
  );
};

// An outline drawn over one region of a screenshot (in % of the image), with its number.
const RegionMark = ({ x, y, w, h, n, i, badge = 'left', drop = 16 }: { x: number; y: number; w: number; h: number; n: number; i: number; badge?: Badge; drop?: number }) => {
  const live = useIsActivePage();
  return (
    <div className={live ? 'aw2-in' : undefined} style={{ position: 'absolute', left: `${x}%`, top: `${y}%`, width: `${w}%`, height: `${h}%`, border: '4px solid #E9B650', boxSizing: 'border-box', animationDelay: live ? enterDelay(i) : undefined }}>
      <MarkBadge n={n} badge={badge} drop={drop} />
    </div>
  );
};

// The same outline, without the entrance: used inside a <Step> so it lands with the click.
const StepMark = ({ x, y, w, h, n, badge = 'left', drop = 16 }: { x: number; y: number; w: number; h: number; n: number; badge?: Badge; drop?: number }) => (
  <div style={{ position: 'absolute', left: `${x}%`, top: `${y}%`, width: `${w}%`, height: `${h}%`, border: '4px solid #E9B650', boxSizing: 'border-box' }}>
    <MarkBadge n={n} badge={badge} drop={drop} />
  </div>
);

// A marker placed in pixels on a fixed-size picture (for pages built on one absolute stage).
const PxMark = ({ x, y, w, h, n, badge = 'left', drop = 16, color = '#E9B650', dash = false }: { x: number; y: number; w: number; h: number; n?: number; badge?: Badge; drop?: number; color?: string; dash?: boolean }) => (
  <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, border: `4px ${dash ? 'dashed' : 'solid'} ${color}`, boxSizing: 'border-box' }}>
    {n ? <MarkBadge n={n} badge={badge} drop={drop} /> : null}
  </div>
);

const TRow = ({ cells, cols, head = false, tint, size = 30 }: { cells: ReactNode[]; cols: string; head?: boolean; tint?: string; size?: number }) => (
  <div style={{ display: 'grid', gridTemplateColumns: cols, alignItems: 'center', background: head ? raised : tint ?? '#FFFFFF', borderBottom: `1px solid ${rule}`, fontSize: head ? 24 : size, fontWeight: head ? 600 : 400, color: head ? muted : 'var(--osd-text)', lineHeight: 1.4 }}>
    {cells.map((c, i) => (
      <div key={i} style={{ padding: head ? '14px 22px' : '16px 22px' }}>{c}</div>
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

// Card text as Obsidian renders it: [[links]] become purple, underlined names.
const LinkText = ({ text }: { text: string }) => (
  <>{text.split(/(\[\[[^\]]+\]\])/).map((part, i) => part.startsWith('[[') ? <span key={i} style={{ color: link, textDecoration: 'underline' }}>{part.slice(2, -2)}</span> : <span key={i}>{part}</span>)}</>
);

// Card text as it sits in the .md file: the brackets stay, tinted purple.
const RawLinks = ({ text }: { text: string }) => (
  <>{text.split(/(\[\[[^\]]+\]\])/).map((part, i) => part.startsWith('[[') ? <span key={i} style={{ color: '#B79CF2' }}>{part}</span> : <span key={i}>{part}</span>)}</>
);

// ---------- Icons ----------
// Simple line icons on a 64×64 grid, used in flows and pictures instead of emoji.
type IconKind = 'doc' | 'chat' | 'ok' | 'save' | 'browser' | 'search' | 'think' | 'terminal' | 'folder' | 'globe' | 'down' | 'link' | 'graph';

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
    {kind === 'link' && <><path d="M27 37 L37 27" /><path d="M24 30 L17 37 C12 42 12 48 16 52 C20 56 26 56 31 51 L38 44" /><path d="M40 34 L47 27 C52 22 52 16 48 12 C44 8 38 8 33 13 L26 20" /></>}
    {kind === 'graph' && <><circle cx="16" cy="18" r="7" /><circle cx="48" cy="16" r="7" /><circle cx="32" cy="48" r="8" /><path d="M22 22 L28 41 M42 21 L36 41 M23 18 H41" /></>}
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

// A note card with a small kind label and a name.
const CardDoc = ({ x, y, w = 220, h = 110, kind, name, fill = '#FFFFFF', stroke = rule, dash, size = 34 }: { x: number; y: number; w?: number; h?: number; kind?: string; name: string; fill?: string; stroke?: string; dash?: string; size?: number }) => (
  <g>
    <DocShape x={x} y={y} w={w} h={h} fill={fill} stroke={stroke} sw={stroke === rule ? 2 : 3} dash={dash} />
    {kind ? <text x={x + 20} y={y + 34} fontSize="22" fill={quiet}>{kind}</text> : null}
    <text x={x + w / 2} y={kind ? y + h - 26 : y + h / 2 + size * 0.36} textAnchor="middle" fontSize={size} fontWeight="600" fill={ink}>{name}</text>
  </g>
);

// A folder tab shape.
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

const AskMark = ({ x, y, r = 22 }: { x: number; y: number; r?: number }) => (
  <g><circle cx={x} cy={y} r={r} fill={amber} /><text x={x} y={y + r * 0.45} textAnchor="middle" fontSize={r * 1.3} fontWeight="700" fill="#FFFFFF">?</text></g>
);

// A numbered dot inside a picture.
const SvgNum = ({ x, y, n }: { x: number; y: number; n: number }) => (
  <g><circle cx={x} cy={y} r="22" fill={amber} /><text x={x} y={y + 9} textAnchor="middle" fontSize="25" fontWeight="600" fill="#FFFFFF">{n}</text></g>
);

// Multi-line SVG text.
const SvgLines = ({ x, y, lines, size = 26, fill = muted, anchor = 'middle', weight }: { x: number; y: number; lines: string[]; size?: number; fill?: string; anchor?: 'start' | 'middle' | 'end'; weight?: number }) => (
  <text x={x} y={y} fontSize={size} fill={fill} textAnchor={anchor} fontWeight={weight}>
    {lines.map((line, i) => <tspan key={i} x={x} dy={i === 0 ? 0 : size * 1.45}>{line}</tspan>)}
  </text>
);

// People are circles; relation cards are boxes.
const Person = ({ x, y, name, r = 46, hub = false, fill = amberSoft, stroke = amber, size = 30 }: { x: number; y: number; name: string; r?: number; hub?: boolean; fill?: string; stroke?: string; size?: number }) => (
  <g>
    {hub ? <circle cx={x} cy={y} r={r + 10} fill="none" stroke={stroke} strokeWidth="2" /> : null}
    <circle cx={x} cy={y} r={r} fill={fill} stroke={stroke} strokeWidth="2" />
    <text x={x} y={y + size * 0.36} textAnchor="middle" fontSize={size} fill={ink}>{name}</text>
  </g>
);

const RelBox = ({ cx, y, w = 220, label, sub, fill = sage, stroke = okGreen, size = 30 }: { cx: number; y: number; w?: number; label: string; sub?: string; fill?: string; stroke?: string; size?: number }) => (
  <g>
    <rect x={cx - w / 2} y={y} width={w} height="64" fill={fill} stroke={stroke} strokeWidth="2" />
    <text x={cx} y={y + 43} textAnchor="middle" fontSize={size} fill={ink}>{label}</text>
    {sub ? <text x={cx} y={y + 98} textAnchor="middle" fontSize="24" fill={quiet}>{sub}</text> : null}
  </g>
);

const MapArrow = ({ x1, x2, y, hot = false, color }: { x1: number; x2: number; y: number; hot?: boolean; color?: string }) => {
  const c = color ?? (hot ? amber : faint);
  return <g fill={c} stroke={c}><line x1={x1} y1={y} x2={x2 - 12} y2={y} strokeWidth={hot ? 4 : 3} /><polygon points={`${x2},${y} ${x2 - 16},${y - 9} ${x2 - 16},${y + 9}`} strokeWidth="0" /></g>;
};

// The same arrow, pointing left.
const BackArrow = ({ x1, x2, y, color = amber }: { x1: number; x2: number; y: number; color?: string }) => (
  <g fill={color} stroke={color}><line x1={x1} y1={y} x2={x2 + 12} y2={y} strokeWidth="4" /><polygon points={`${x2},${y} ${x2 + 16},${y - 9} ${x2 + 16},${y + 9}`} strokeWidth="0" /></g>
);

const DownArrowSvg = ({ x, y1, y2, color = faint }: { x: number; y1: number; y2: number; color?: string }) => (
  <g fill={color} stroke={color}><line x1={x} y1={y1} x2={x} y2={y2 - 12} strokeWidth="3" /><polygon points={`${x},${y2} ${x - 9},${y2 - 16} ${x + 9},${y2 - 16}`} strokeWidth="0" /></g>
);

// A small chip with text, e.g. a file name the answer cites.
const SvgChip = ({ x, y, w, label, fill = '#FFFFFF', stroke = rule, color = ink, size = 24, h = 44, font }: { x: number; y: number; w: number; label: string; fill?: string; stroke?: string; color?: string; size?: number; h?: number; font?: string }) => (
  <g><rect x={x} y={y} width={w} height={h} rx="4" fill={fill} stroke={stroke} strokeWidth="2" /><text x={x + w / 2} y={y + h / 2 + size * 0.36} textAnchor="middle" fontSize={size} fill={color} fontFamily={font}>{label}</text></g>
);

const Bubble = ({ x, y, w, h, fill = '#FFFFFF', stroke = rule, dash }: { x: number; y: number; w: number; h: number; fill?: string; stroke?: string; dash?: string }) => (
  <path d={`M${x + 12} ${y} H${x + w - 12} Q${x + w} ${y} ${x + w} ${y + 12} V${y + h - 12} Q${x + w} ${y + h} ${x + w - 12} ${y + h} H${x + 60} L${x + 36} ${y + h + 22} L${x + 40} ${y + h} H${x + 12} Q${x} ${y + h} ${x} ${y + h - 12} V${y + 12} Q${x} ${y} ${x + 12} ${y} Z`} fill={fill} stroke={stroke} strokeWidth="2" strokeDasharray={dash} />
);

// The app window frame for drawn Obsidian / Codex screens.
const AppFrame = ({ x, y, w, h, title }: { x: number; y: number; w: number; h: number; title: string }) => (
  <g>
    <rect x={x} y={y} width={w} height={h} fill="#FFFFFF" stroke={rule} strokeWidth="2" />
    <rect x={x} y={y} width={w} height="48" fill="#F1F1F1" />
    <line x1={x} y1={y + 48} x2={x + w} y2={y + 48} stroke={rule} strokeWidth="2" />
    <text x={x + 24} y={y + 32} fontSize="22" fill={muted}>{title}</text>
  </g>
);

// A sentence in a card, with a highlight that sweeps on when its step is revealed.
const QuoteLine = ({ x, y, w, text, at = 0 }: { x: number; y: number; w: number; text: string; at?: number }) => (
  <g><rect className="aw2-sweep" style={{ transitionDelay: `${at}ms` }} x={x} y={y - 30} width={w} height="42" fill={amberSoft} /><text x={x + 10} y={y} fontSize="26" fill={ink}>{text}</text></g>
);

// ---------- Opening ----------

const Cover: Page = () => (
  <Shell top={174}>
    <In i={0}><Eyebrow>AI WORKSHOP｜第 2 堂（共 4 堂）</Eyebrow></In>
    <In i={1} style={{ marginTop: 62 }}><Title>{'Obsidian\n與 RAG'}</Title></In>
    <In i={2} style={{ marginTop: 40, fontSize: 35, color: muted }}>大綱放進筆記庫，請 AI 查筆記回答</In>
    <In i={3} style={{ width: 160, height: 5, background: amber, marginTop: 72 }}><span /></In>
    <div style={{ position: 'absolute', right: 144, bottom: 170 }}>
      <Figure w={720} h={230} label="卡片連成關係網，AI 查卡片後回答並附檔名">
        <InG i={3}><DocShape x={0} y={40} w={110} h={140} fill={surface} /><DocShape x={22} y={60} w={110} h={140} /><text x={77} y={140} textAnchor="middle" fontSize="26" fill={muted}>.md</text></InG>
        <InG i={4}><MapArrow x1={152} x2={212} y={130} /></InG>
        <g fill="none" stroke={link} strokeWidth="3"><DrawPath i={6} d="M268 70 L330 170" /><DrawPath i={6} d="M392 70 L330 170" /><DrawPath i={7} d="M392 70 L440 170" /></g>
        <InG i={5}><circle cx="268" cy="70" r="22" fill={amberSoft} stroke={amber} strokeWidth="2" /><circle cx="392" cy="70" r="22" fill={amber} /><rect x="314" y="156" width="32" height="32" fill={sage} stroke={okGreen} strokeWidth="2" transform="rotate(45 330 172)" /><rect x="424" y="156" width="32" height="32" fill={sage} stroke={okGreen} strokeWidth="2" transform="rotate(45 440 172)" /></InG>
        <InG i={8}><MapArrow x1={488} x2={548} y={130} hot /></InG>
        <InG i={9}><Bubble x={566} y={58} w={154} h={92} stroke={okGreen} /><rect x="584" y="80" width="118" height="12" fill={rule} /><rect x="584" y="104" width="80" height="22" rx="3" fill={sage} stroke={okGreen} strokeWidth="2" /></InG>
      </Figure>
    </div>
  </Shell>
);

const MdLine = ({ children, head = false, dim = false }: { children: ReactNode; head?: boolean; dim?: boolean }) => (
  <div style={{ fontFamily: mono, fontSize: 25, lineHeight: 1.65, whiteSpace: 'pre', color: dim ? '#BCC3CC' : head ? '#F5F5F4' : '#E7E5E4', fontWeight: head ? 600 : 400 }}>{children}</div>
);

const LastLesson: Page = () => (
  <Shell>
    <Eyebrow>回顧第一堂</Eyebrow>
    <Heading>上一堂寫好的三國演義大綱</Heading>
    <Fit>
      <div style={{ display: 'grid', gridTemplateColumns: '960px 1fr', gap: 72, alignItems: 'center' }}>
        <In i={0}>
          <div style={{ background: term, border: '1px solid #555B60' }}>
            <div style={{ height: 52, display: 'flex', alignItems: 'center', padding: '0 26px', background: '#30343A', fontFamily: mono, fontSize: 23, color: '#BCC3CC' }}>三國演義大綱.md（第一堂實跑，節選）</div>
            <div style={{ padding: '24px 30px 28px' }}>
              <MdLine head>## 第 1 回 宴桃園豪傑三結義　斬黃巾英雄首立功</MdLine>
              <MdLine><RawLinks text="……[[劉備]]在涿縣遇到[[張飛]]、[[關羽]]，" /></MdLine>
              <MdLine>三人在桃園結義，招募鄉勇後擊敗黃巾……</MdLine>
              <MdLine dim>出處：原文/第001回.txt</MdLine>
              <MdLine dim>……（一共 21 回）</MdLine>
            </div>
          </div>
        </In>
        <div>
          <Steps>
            <div style={{ fontSize: 34 }}>這些 [[ ]] 現在連到哪？</div>
            <Step duration={STEP_MS}>
              <svg viewBox="0 0 560 220" style={{ display: 'block', width: 560, height: 220, marginTop: 24 }} role="img" aria-label="淡紫色的劉備連結，指向一張還不存在的劉備卡">
                <text x="0" y="120" fontSize="60" fill={linkFaint} textDecoration="underline">劉備</text>
                <line x1="140" y1="100" x2="290" y2="100" stroke={faint} strokeWidth="4" strokeDasharray="10 8" />
                <DocShape x={310} y={30} w={210} h={150} fill="none" stroke={faint} sw={3} dash="10 8" />
                <text x="415" y="115" textAnchor="middle" fontSize="32" fill={quiet}>劉備.md？</text>
              </svg>
              <div style={{ fontSize: 32, color: amber, marginTop: 8 }}>還沒有這張卡</div>
            </Step>
          </Steps>
        </div>
      </div>
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={56}>大綱有連結了，但還沒接上人物卡</Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

const TodayGoal: Page = () => (
  <Shell>
    <Eyebrow>今天的成品</Eyebrow>
    <Heading>大綱放進筆記庫，接上人物卡</Heading>
    <Fit>
      <Stage h={480}>
        <Steps>
          <Layer h={480} label="第一堂結束時：三國演義大綱是一個單獨的檔案，連結還沒接到任何卡">
            <InG i={0}>
              <text x="0" y="28" fontSize="26" fontWeight="600" fill={quiet} letterSpacing="2">第一堂結束時</text>
              <DocShape x={40} y={60} w={300} h={340} fill={amberSoft} stroke={amber} sw={3} />
              <text x="190" y="116" textAnchor="middle" fontSize="27" fontWeight="600" fill={ink}>三國演義大綱.md</text>
            </InG>
            <InG i={1}>
              <SvgChip x={80} y={150} w={220} h={50} label="[[劉備]]" color={linkFaint} stroke={linkFaint} size={28} font={mono} />
              <SvgChip x={80} y={220} w={220} h={50} label="[[曹操]]" color={linkFaint} stroke={linkFaint} size={28} font={mono} />
              <SvgChip x={80} y={290} w={220} h={50} label="[[呂布]]" color={linkFaint} stroke={linkFaint} size={28} font={mono} />
              <text x="190" y="456" textAnchor="middle" fontSize="27" fill={muted}>連結指向空處</text>
            </InG>
          </Layer>
          <Step duration={STEP_MS}><Layer h={480} label="今天結束時：大綱在筆記庫的整理資料夾，連到劉備、關羽、張飛、曹操的人物卡，人物再連到關係卡">
            <MapArrow x1={364} x2={444} y={230} hot />
            <g className="aw2-build" style={buildDelay(0)}>
              <text x="470" y="28" fontSize="26" fontWeight="600" fill={amber} letterSpacing="2">今天結束時</text>
              <Folder x={470} y={50} w={1162} h={400} fill="#FBF7F2" stroke={amber} sw={3} />
              <text x="500" y="108" fontSize="30" fontWeight="600" fill={ink}>三國人物知識庫/</text>
              <DocShape x={510} y={150} w={230} h={250} fill={sage} stroke={okGreen} sw={3} />
              <text x="625" y="200" textAnchor="middle" fontSize="24" fill={quiet}>整理/</text>
              <text x="625" y="282" textAnchor="middle" fontSize="28" fontWeight="600" fill={ink}>三國演義</text>
              <text x="625" y="322" textAnchor="middle" fontSize="28" fontWeight="600" fill={ink}>大綱</text>
            </g>
            <g fill="none" stroke={link} strokeWidth="4">
              <StepPath d="M742 230 C820 230 860 190 924 190" i={2} />
              <StepPath d="M742 250 C860 250 980 170 1094 186" i={3} />
              <StepPath d="M742 270 C900 280 1120 150 1262 182" i={4} />
              <StepPath d="M742 290 C960 300 1300 150 1432 182" i={5} />
            </g>
            <g className="aw2-build" style={buildDelay(2)}>
              <Person x={970} y={190} name="劉備" r={44} />
              <Person x={1140} y={190} name="關羽" r={44} />
              <Person x={1310} y={190} name="張飛" r={44} />
              <Person x={1480} y={190} name="曹操" r={44} />
            </g>
            <g fill="none" stroke={okGreen} strokeWidth="3">
              <StepPath d="M970 236 L1090 330" i={6} /><StepPath d="M1140 236 L1110 330" i={6} /><StepPath d="M1310 236 L1150 330" i={6} />
              <StepPath d="M970 236 L1370 330" i={7} /><StepPath d="M1480 236 L1420 330" i={7} />
            </g>
            <g className="aw2-build" style={buildDelay(6)}>
              <RelBox cx={1120} y={330} w={230} label="桃園結義" />
              <RelBox cx={1400} y={330} w={250} label="煮酒論英雄" />
            </g>
          </Layer></Step>
        </Steps>
      </Stage>
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={36}>今天的四個練習，都在這座筆記庫裡做</Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

// A table-of-contents row: chapter, the thing you walk away with, time and page.
const AGENDA_COLS = '90px 1fr 600px 180px';

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
    <Eyebrow>AGENDA｜120 分鐘，四個練習</Eyebrow>
    <Heading>課程大綱</Heading>
    <Fit>
      <div style={{ display: 'grid', gridTemplateColumns: AGENDA_COLS, paddingBottom: 12, borderBottom: `1px solid ${rule}` }}>
        <span /><SmallLabel>章節</SmallLabel><SmallLabel>結束時你會</SmallLabel><span style={{ textAlign: 'right' }}><SmallLabel>時間｜頁</SmallLabel></span>
      </div>
      <AgendaRow i={0} n={1} kind="folder" result="打開三國筆記庫（練習 1）" time="10–45 分" page={Section1} />
      <AgendaRow i={1} n={2} kind="link" result="大綱接上人物卡（練習 2）" time="45–70 分" page={Section2} />
      <AgendaRow i={2} n={3} kind="search" result="拿到附檔名的回答（練習 3）" time="70–95 分" page={Section3} />
      <AgendaRow i={3} n={4} kind="graph" result="核對過的關係圖（練習 4）" time="95–120 分" page={Section4} />
    </Fit>
  </Shell>
);

// ---------- Chapter openers ----------

// The lesson's route on a chapter's opening page: four stops, this one in amber.
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

// ---------- 01 認識 Obsidian ----------

const Section1: Page = () => <SectionPage chapter={1} label="01 / OBSIDIAN" lead="筆記庫、連結，和三種卡片" />;

const FileTile = ({ x, y, name, hot = false }: { x: number; y: number; name: string; hot?: boolean }) => (
  <g>
    <DocShape x={x} y={y} w={96} h={60} fill={hot ? amberSoft : '#FFFFFF'} stroke={hot ? amber : rule} />
    <text x={x + 48} y={y + 40} textAnchor="middle" fontSize="23" fill={ink}>{name}</text>
  </g>
);

const Drawer = ({ x, y, w, label, count }: { x: number; y: number; w: number; label: string; count: string }) => (
  <g>
    <Folder x={x} y={y} w={w} h={56} />
    <text x={x + 22} y={y + 46} fontSize="28" fontWeight="600" fill={ink}>{label}/</text>
    <text x={x + w - 18} y={y + 46} textAnchor="end" fontSize="24" fill={amber}>{count}</text>
  </g>
);

const VaultFolder: Page = () => (
  <Shell chapter={1}>
    <Eyebrow>筆記庫（Obsidian 介面叫「儲存庫」）</Eyebrow>
    <Heading>筆記庫就是一個資料夾</Heading>
    <Lead>像抽屜櫃：一張卡就是一個 .md 檔</Lead>
    <Fit>
      <Stage h={490}>
        <Steps>
          <Layer h={490} label="三國人物知識庫資料夾：入口卡三國演義.md，人物 5 張、勢力 3 張、關係 3 張；另有原文（第 1 到 21 回全文和三份節選）和整理資料夾">
            <InG i={0}>
              <Folder x={436} y={0} w={760} h={486} fill="#FBF7F2" stroke={amber} sw={3} />
              <text x={466} y={62} fontSize="32" fontWeight="600" fill={ink}>三國人物知識庫/</text>
              <text x={1166} y={62} textAnchor="end" fontSize="26" fill={amber}>12 張卡＝11＋入口 1</text>
            </InG>
            <InG i={1}>
              <DocShape x={466} y={88} w={130} h={54} fill={amberSoft} stroke={amber} /><text x={531} y={124} textAnchor="middle" fontSize="24" fill={ink}>三國演義</text>
              <rect x="612" y="88" width="314" height="54" fill="#FFFFFF" stroke={faint} strokeWidth="2" strokeDasharray="8 6" /><text x={769} y={124} textAnchor="middle" fontSize="24" fill={quiet}>原文/：第 1–21 回＋節選</text>
              <rect x="942" y="88" width="224" height="54" fill="#FFFFFF" stroke={faint} strokeWidth="2" strokeDasharray="8 6" /><text x={1054} y={124} textAnchor="middle" fontSize="24" fill={quiet}>整理/：練習產出</text>
            </InG>
            <InG i={2}><Drawer x={466} y={166} w={700} label="人物" count="5 張" />
              <FileTile x={490} y={238} name="劉備" /><FileTile x={624} y={238} name="關羽" /><FileTile x={758} y={238} name="張飛" /><FileTile x={892} y={238} name="曹操" /><FileTile x={1026} y={238} name="孫權" /></InG>
            <InG i={3}><Drawer x={466} y={322} w={330} label="勢力" count="3 張" /><Drawer x={836} y={322} w={330} label="關係" count="3 張" />
              <FileTile x={478} y={394} name="蜀漢" /><FileTile x={583} y={394} name="曹魏" /><FileTile x={688} y={394} name="東吳" />
              <FileTile x={848} y={394} name="桃園" /><FileTile x={953} y={394} name="煮酒" /><FileTile x={1058} y={394} name="赤壁" /></InG>
          </Layer>
          <Step duration={STEP_MS}><Layer h={490} label="Obsidian 打開這個資料夾來寫筆記">
            <g className="aw2-build" style={buildDelay(0)}>
              <rect x="0" y="148" width="360" height="190" fill={linkSoft} stroke={link} strokeWidth="2" />
              <text x="28" y="198" fontSize="28" fontWeight="600" fill={link}>Obsidian</text>
              <text x="28" y="258" fontSize="44" fill={ink}>打開來寫</text>
              <text x="28" y="308" fontSize="25" fill={muted}>看到的就是這些檔案</text>
            </g>
            <g className="aw2-build" style={buildDelay(1)}><MapArrow x1={366} x2={428} y={243} color={link} hot /></g>
          </Layer></Step>
          <Step duration={STEP_MS}><Layer h={490} label="Codex 讀同一個資料夾，不用上傳">
            <g className="aw2-build" style={buildDelay(1)}><BackArrow x1={1266} x2={1204} y={243} color={okGreen} /></g>
            <g className="aw2-build" style={buildDelay(0)}>
              <rect x="1272" y="148" width="360" height="190" fill={sage} stroke={okGreen} strokeWidth="2" />
              <text x="1300" y="198" fontSize="28" fontWeight="600" fill={okGreen}>Codex</text>
              <text x="1300" y="258" fontSize="44" fill={ink}>讀同一份</text>
              <text x="1300" y="308" fontSize="25" fill={muted}>不用上傳</text>
            </g>
          </Layer></Step>
        </Steps>
      </Stage>
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={20}>檔案在你的電腦裡，Codex 也讀得到</Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

const WikiLink: Page = () => (
  <Shell chapter={1}>
    <Eyebrow>雙向連結</Eyebrow>
    <Heading>用 [[ ]] 連到另一張卡</Heading>
    <Lead>像課本寫「見第 12 頁」，翻過去就到</Lead>
    <Fit>
      <Stage h={400}>
        <Steps>
          <Layer h={400} label="你打的字：三人在桃園立誓，拜 [[劉備]] 為兄">
            <InG i={0}>
              <text x="0" y="40" fontSize="26" fontWeight="600" fill={quiet} letterSpacing="2">你打的字</text>
              <rect x="0" y="70" width="520" height="250" fill={term} />
              <text x="34" y="160" fontSize="34" fontFamily={mono} fill="#F5F5F4">三人在桃園立誓，</text>
              <text x="34" y="226" fontSize="34" fontFamily={mono} fill="#F5F5F4">拜 <tspan fill="#B79CF2">[[劉備]]</tspan> 為兄</text>
            </InG>
          </Layer>
          <Step duration={STEP_MS}><Layer h={400} label="Obsidian 顯示：劉備變成紫色、有底線的連結">
            <MapArrow x1={534} x2={620} y={195} />
            <g className="aw2-build" style={buildDelay(0)}>
              <text x="636" y="40" fontSize="26" fontWeight="600" fill={link} letterSpacing="2">Obsidian 顯示</text>
              <rect x="636" y="70" width="460" height="250" fill="#FFFFFF" stroke={rule} strokeWidth="2" />
              <text x="668" y="160" fontSize="36" fill={ink}>三人在桃園立誓，</text>
              <text x="668" y="226" fontSize="36" fill={ink}>拜 <tspan fill={link} textDecoration="underline">劉備</tspan> 為兄</text>
            </g>
          </Layer></Step>
          <Step duration={STEP_MS}><Layer h={400} label="點一下劉備，打開人物卡 劉備.md">
            <g fill="none" stroke={amber} strokeWidth="4"><StepPath d="M1104 195 H1186" /></g>
            <g className="aw2-build" style={buildDelay(2)}>
              <polygon points="1204,195 1184,184 1184,206" fill={amber} />
              <CardDoc x={1210} y={90} w={420} h={210} kind="人物/" name="劉備.md" fill={amberSoft} stroke={amber} size={44} />
              <text x="1420" y="360" textAnchor="middle" fontSize="27" fill={muted}>點一下就打開</text>
            </g>
          </Layer></Step>
        </Steps>
      </Stage>
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={32}>人名打在 [[ ]] 裡，就連到那張卡</Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

// A card that mentions 劉備, drawn as a small chip with an arrow toward him.
const Mention = ({ x, y, name }: { x: number; y: number; name: string }) => (
  <g><rect x={x} y={y} width="230" height="66" fill="#FFFFFF" stroke={rule} strokeWidth="2" /><text x={x + 115} y={y + 44} textAnchor="middle" fontSize="28" fill={ink}>{name}</text></g>
);

const BacklinkRow = ({ y, name, n }: { y: number; name: string; n: string }) => (
  <g><text x="1210" y={y} fontSize="33" fill={ink}>{name}</text><text x="1606" y={y} textAnchor="end" fontSize="33" fontWeight="600" fill={amber}>{n}</text></g>
);

const Backlinks: Page = () => (
  <Shell chapter={1}>
    <Eyebrow>反向連結（Backlinks）</Eyebrow>
    <Heading>反向連結：誰提到了劉備</Heading>
    <Lead>像反查通訊錄：誰的名單裡有你</Lead>
    <Fit>
      <Stage h={450}>
        <Steps>
          <Layer h={450} label="三國演義、桃園結義、煮酒論英雄、赤壁之戰、曹操、蜀漢這幾張卡都寫了 [[劉備]]">
            <InG i={0}><Person x={560} y={225} name="劉備" r={84} size={42} hub /></InG>
            <InG i={1}><Mention x={0} y={20} name="三國演義" /><Mention x={0} y={192} name="桃園結義" /><Mention x={0} y={364} name="煮酒論英雄" />
              <Mention x={870} y={20} name="赤壁之戰" /><Mention x={870} y={192} name="曹操" /><Mention x={870} y={364} name="蜀漢" /></InG>
            <g fill="none" stroke={link} strokeWidth="3">
              <DrawPath i={3} d="M232 54 L480 180" /><DrawPath i={3} d="M232 225 L462 225" /><DrawPath i={3} d="M232 396 L480 270" />
              <DrawPath i={4} d="M868 54 L640 180" /><DrawPath i={4} d="M868 225 L658 225" /><DrawPath i={4} d="M868 396 L640 270" />
            </g>
            <InG i={5}><g fill={link}><circle cx="484" cy="182" r="7" /><circle cx="466" cy="225" r="7" /><circle cx="484" cy="268" r="7" /><circle cx="636" cy="182" r="7" /><circle cx="654" cy="225" r="7" /><circle cx="636" cy="268" r="7" /></g></InG>
          </Layer>
          <Step duration={STEP_MS}><Layer h={450} label="劉備卡的反向連結面板：已連結本筆記的檔案，共 11 張卡">
            <g className="aw2-build" style={buildDelay(0)}>
              <rect x="1180" y="0" width="452" height="450" fill={surface} stroke={rule} strokeWidth="2" />
              <text x="1210" y="56" fontSize="30" fontWeight="600" fill={ink}>反向連結</text>
              <text x="1606" y="56" textAnchor="end" fontSize="36" fontWeight="600" fill={amber}>11 張</text>
              <line x1="1196" y1="80" x2="1616" y2="80" stroke={rule} strokeWidth="2" />
            </g>
            <g className="aw2-build" style={buildDelay(1)}><BacklinkRow y={134} name="三國演義" n="4 處" /><BacklinkRow y={190} name="桃園結義" n="2 處" /><BacklinkRow y={246} name="煮酒論英雄" n="2 處" /></g>
            <g className="aw2-build" style={buildDelay(2)}><BacklinkRow y={302} name="赤壁之戰" n="2 處" /><BacklinkRow y={358} name="曹操" n="1 處" /></g>
            <g className="aw2-build" style={buildDelay(3)}><text x="1210" y="420" fontSize="28" fill={quiet}>……還有 6 張</text></g>
          </Layer></Step>
        </Steps>
      </Stage>
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={28}>誰連到劉備，Obsidian 會自己列出來</Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

const GrayLink: Page = () => (
  <Shell chapter={1}>
    <Eyebrow>還沒建立的卡</Eyebrow>
    <Heading>還沒建卡的連結，顏色比較淡</Heading>
    <Fit z={1.1}>
      <Stage h={440}>
        <Steps>
          <Layer h={440} label="有卡：劉備是深紫色連結，指到 人物/劉備.md">
            <InG i={0}>
              <text x="0" y="40" fontSize="27" fontWeight="600" fill={okGreen}>有這張卡</text>
              <text x="0" y="140" fontSize="64" fill={link} textDecoration="underline">劉備</text>
            </InG>
            <InG i={1}><MapArrow x1={170} x2={320} y={118} /></InG>
            <InG i={2}><CardDoc x={340} y={58} w={300} h={120} name="人物/劉備.md" size={30} fill={amberSoft} stroke={amber} /></InG>
            <PopG i={4}><OkDot x={680} y={118} r={26} /></PopG>
          </Layer>
          <Step duration={STEP_MS}><Layer h={440} label="沒卡：呂布是淡紫色連結，資料夾裡沒有 呂布.md">
            <g className="aw2-build" style={buildDelay(0)}>
              <text x="0" y="270" fontSize="27" fontWeight="600" fill={amber}>還沒有卡</text>
              <text x="0" y="370" fontSize="64" fill={linkFaint} textDecoration="underline">呂布</text>
            </g>
            <g className="aw2-build" style={buildDelay(1)}>
              <line x1="170" y1="348" x2="304" y2="348" stroke={faint} strokeWidth="3" strokeDasharray="10 8" />
              <DocShape x={340} y={288} w={300} h={120} fill="none" stroke={faint} dash="10 8" />
              <text x="490" y="358" textAnchor="middle" fontSize="30" fill={quiet}>呂布.md？</text>
            </g>
            <g className="aw2-build" style={buildDelay(2)}><AskMark x={680} y={348} r={26} /></g>
          </Layer></Step>
          <Step duration={STEP_MS}><Layer h={440} label="點下淡色連結，Obsidian 會新建一張空白的 呂布.md">
            <g className="aw2-build" style={buildDelay(0)}><MapArrow x1={730} x2={860} y={348} hot /></g>
            <g className="aw2-build" style={buildDelay(1)}>
              <DocShape x={880} y={278} w={180} h={140} fill="#FFFFFF" stroke={link} sw={3} />
              <path d="M970 318 V378 M940 348 H1000" stroke={link} strokeWidth="5" strokeLinecap="round" />
              <text x="1100" y="336" fontSize="32" fill={ink}>點下去：</text>
              <text x="1100" y="384" fontSize="32" fill={ink}>新建一張空白卡</text>
            </g>
          </Layer></Step>
        </Steps>
      </Stage>
      <Steps>
        <Step duration={STEP_MS}><Takeaway marginTop={24}>顏色淡，代表資料夾裡還沒有這張卡</Takeaway></Step>
        <Step duration={STEP_MS}><div style={{ textAlign: 'center', fontSize: 28, color: muted, marginTop: 14 }}>分不出深淺？按 <Path size={28}>Cmd/Ctrl + O</Path> 搜尋名字，找不到就是還沒有卡</div></Step>
      </Steps>
    </Fit>
  </Shell>
);

// A pile of cards of one kind: three offset sheets, a label, a few names and what it holds.
const CardPile = ({ cx, kind, count, names, holds, fill, stroke }: { cx: number; kind: string; count: string; names: string; holds: string; fill: string; stroke: string }) => (
  <g>
    <DocShape x={cx - 150} y={150} w={290} h={170} fill="#FFFFFF" stroke={rule} />
    <DocShape x={cx - 140} y={140} w={290} h={170} fill="#FFFFFF" stroke={rule} />
    <DocShape x={cx - 130} y={130} w={290} h={170} fill={fill} stroke={stroke} sw={3} />
    <text x={cx + 15} y={190} textAnchor="middle" fontSize="36" fontWeight="600" fill={ink}>{kind}</text>
    <text x={cx + 15} y={236} textAnchor="middle" fontSize="27" fill={stroke}>{count}</text>
    <text x={cx + 15} y={280} textAnchor="middle" fontSize="25" fill={muted}>{names}</text>
    <text x={cx} y={384} textAnchor="middle" fontSize="30" fill={ink}>{holds}</text>
  </g>
);

const CardTypes: Page = () => (
  <Shell chapter={1}>
    <Eyebrow>三國筆記庫的卡</Eyebrow>
    <Heading>卡片分三種：人物、勢力、關係</Heading>
    <Lead>像一齣戲：角色、陣營、劇情</Lead>
    <Fit>
      <Stage h={420}>
        <Steps>
          <Layer h={420} label="入口卡三國演義，下面先看人物卡：5 張，寫一個人">
            <InG i={0}><DocShape x={686} y={0} w={260} h={70} fill={surface} stroke={faint} /><text x="816" y="46" textAnchor="middle" fontSize="27" fill={ink}>三國演義（入口）</text></InG>
            <g fill="none" stroke={rule} strokeWidth="3"><DrawPath i={1} d="M760 70 C700 100 400 100 330 128" /><DrawPath i={1} d="M816 70 V126" /><DrawPath i={1} d="M872 70 C930 100 1230 100 1300 128" /></g>
            <InG i={2}><CardPile cx={330} kind="人物" count="5 張" names="劉備、曹操、孫權…" holds="寫一個人" fill={amberSoft} stroke={amber} /></InG>
          </Layer>
          <Step duration={STEP_MS}><Layer h={420} label="勢力卡：3 張，蜀漢、曹魏、東吳，寫一方陣營">
            <g className="aw2-build" style={buildDelay(0)}><CardPile cx={816} kind="勢力" count="3 張" names="蜀漢、曹魏、東吳" holds="寫一方陣營" fill={blueSoft} stroke={blue} /></g>
          </Layer></Step>
          <Step duration={STEP_MS}><Layer h={420} label="關係卡：3 張，桃園結義、煮酒論英雄、赤壁之戰，寫一件事裡誰和誰">
            <g className="aw2-build" style={buildDelay(0)}><CardPile cx={1300} kind="關係" count="3 張" names="桃園結義、煮酒…" holds="寫一件事：誰和誰" fill={sage} stroke={okGreen} /></g>
          </Layer></Step>
        </Steps>
      </Stage>
      <Steps>
        <Step duration={STEP_MS}><div style={{ textAlign: 'center', fontSize: 32, marginTop: 18 }}>人物 5＋勢力 3＋關係 3＝<strong>11 張</strong>，加入口卡〈三國演義〉＝<strong>12 張</strong></div></Step>
        <Step duration={STEP_MS}><Takeaway marginTop={18}>人物之間，靠關係卡接起來</Takeaway></Step>
      </Steps>
    </Fit>
  </Shell>
);

// Five people on top, three relation cards below. Each click adds one story.
const STORY_COLORS = [amber, link, okGreen];

const StoryLinks = ({ story, paths }: { story: 0 | 1 | 2; paths: string[] }) => (
  <g fill="none" stroke={STORY_COLORS[story]} strokeWidth="6" strokeLinecap="round">
    {paths.map((d, i) => <StepPath key={d} d={d} i={i} />)}
  </g>
);

const StoryMap: Page = () => (
  <Shell chapter={1}>
    <Eyebrow>先看今天的例子</Eyebrow>
    <Heading>人物卡靠關係卡連起來</Heading>
    <Fit>
      <div style={{ background: '#FFFFFF', border: `1px solid ${rule}` }}>
        <Stage h={440}>
          <Steps>
            <Layer h={440} label="上排五張人物卡：關羽、張飛、劉備、曹操、孫權">
              <text x="28" y="118" fontSize="24" fontWeight="600" fill={amber}>人物卡</text>
              <text x="28" y="342" fontSize="24" fontWeight="600" fill={okGreen}>關係卡</text>
              <InG i={0}><Person x={260} y={110} name="關羽" /></InG>
              <InG i={1}><Person x={490} y={110} name="張飛" /></InG>
              <InG i={2}><Person x={790} y={110} name="劉備" hub /></InG>
              <InG i={3}><Person x={1130} y={110} name="曹操" hub /></InG>
              <InG i={4}><Person x={1470} y={110} name="孫權" /></InG>
            </Layer>
            <Step duration={STEP_MS}><Layer h={440} label="桃園結義連到關羽、張飛、劉備">
              <StoryLinks story={0} paths={['M260 156 C260 240 400 270 470 310', 'M490 156 V310', 'M790 156 C790 240 600 270 520 310']} />
              <g className="aw2-build" style={buildDelay(3)}><RelBox cx={495} y={310} w={230} label="桃園結義" sub="第 1 回" fill={amberSoft} stroke={amber} /></g>
            </Layer></Step>
            <Step duration={STEP_MS}><Layer h={440} label="煮酒論英雄連到劉備、曹操">
              <StoryLinks story={1} paths={['M800 166 C820 240 900 280 930 310', 'M1120 166 C1100 240 1020 280 990 310']} />
              <g className="aw2-build" style={buildDelay(2)}><RelBox cx={960} y={310} w={250} label="煮酒論英雄" sub="第 21 回" fill={linkSoft} stroke={link} /></g>
            </Layer></Step>
            <Step duration={STEP_MS}><Layer h={440} label="赤壁之戰連到曹操、孫權">
              <StoryLinks story={2} paths={['M1140 166 C1160 240 1240 280 1270 310', 'M1470 156 C1470 240 1380 280 1330 310']} />
              <g className="aw2-build" style={buildDelay(2)}><RelBox cx={1300} y={310} w={230} label="赤壁之戰" sub="第 49–50 回" /></g>
            </Layer></Step>
          </Steps>
        </Stage>
      </div>
      <Steps><Step duration={STEP_MS}><Takeaway>劉備、曹操各接兩段故事</Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

// Reading along links, drawn as a metro line.
const Station = ({ x, kind, name, line, why }: { x: number; kind: string; name: string; line: string; why?: string }) => (
  <g>
    <circle cx={x} cy="150" r="30" fill="#FFFFFF" stroke={line} strokeWidth="8" />
    <text x={x} y="72" textAnchor="middle" fontSize="24" fill={quiet}>{kind}</text>
    <text x={x} y="236" textAnchor="middle" fontSize="40" fontWeight="600" fill={ink}>{name}</text>
    {why ? <SvgLines x={x} y={292} lines={[why]} size={26} fill={muted} /> : null}
  </g>
);

const LinkWalk: Page = () => (
  <Shell chapter={1}>
    <Eyebrow>沿連結閱讀</Eyebrow>
    <Heading>點紫色人名，走到下一張卡</Heading>
    <Fit>
      <div style={{ background: '#FFFFFF', border: `1px solid ${rule}`, padding: '20px 0' }}>
        <Stage h={430}>
          <Steps>
            <Layer h={340} label="第一站：劉備人物卡">
              <Station x={260} kind="人物卡" name="劉備" line={amber} why="點卡裡的 [[桃園結義]]" />
            </Layer>
            <Step duration={STEP_MS}><Layer h={340} label="第二站：桃園結義關係卡，說明三人在第 1 回結為兄弟">
              <g fill="none" stroke={amber} strokeWidth="12" strokeLinecap="round"><StepPath d="M298 150 H636" /></g>
              <g className="aw2-build" style={buildDelay(3)}>
                <rect x="636" y="96" width="360" height="108" fill={sage} stroke={okGreen} strokeWidth="3" />
                <text x="816" y="72" textAnchor="middle" fontSize="24" fill={quiet}>關係卡</text>
                <text x="816" y="164" textAnchor="middle" fontSize="40" fontWeight="600" fill={ink}>桃園結義</text>
                <SvgLines x={816} y={262} lines={['第 1 回：三人結為兄弟']} size={26} fill={muted} />
              </g>
            </Layer></Step>
            <Step duration={STEP_MS}><Layer h={340} label="第三站：關羽人物卡">
              <g fill="none" stroke={amber} strokeWidth="12" strokeLinecap="round"><StepPath d="M996 150 H1334" /></g>
              <g className="aw2-build" style={buildDelay(3)}><Station x={1372} kind="另一張人物卡" name="關羽" line={amber} why="同一段故事帶你到這裡" /></g>
            </Layer></Step>
            <Step duration={STEP_MS}><Layer h={430} label="走回來：按返回回到上一張，或在關羽卡的反向連結看到桃園結義">
              <g fill="none" stroke={link} strokeWidth="5" strokeDasharray="12 9"><StepPath d="M1372 322 C1372 400 860 400 830 330" /></g>
              <g className="aw2-build" style={buildDelay(3)}>
                <polygon points="826,318 816,342 842,338" fill={link} />
                <text x="1100" y="420" textAnchor="middle" fontSize="30" fill={link}>按 ← 回上一張，或看反向連結</text>
              </g>
            </Layer></Step>
          </Steps>
        </Stage>
      </div>
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={36}>走得過去，也走得回來：這就是雙向連結</Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

const DownloadObsidian: Page = () => (
  <Shell chapter={1}>
    <PracticeEyebrow time="15 分鐘（四頁）">練習 1｜安裝</PracticeEyebrow>
    <Heading>練習（安裝）：下載 Obsidian</Heading>
    <Fit>
      <div style={{ display: 'grid', gridTemplateColumns: '1100px 1fr', gap: 64, alignItems: 'center' }}>
        <In i={0}>
          <Screenshot src={downloadPage} aspect={1400 / 490} width={1100} url="obsidian.md/download" caption="官方下載頁（2026-10 擷取）" alt="Obsidian 下載頁上的紫色 Download 按鈕">
            <RegionMark n={2} i={3} x={13} y={14} w={74} h={52} badge="right" />
          </Screenshot>
        </In>
        <div style={{ display: 'grid', gap: 44 }}>
          <Steps>
            <Callout n={1} title={<Path size={31}>obsidian.md/download</Path>} />
            <Step duration={STEP_MS}><Callout n={2} title="按紫色的下載鈕" /></Step>
            <Step duration={STEP_MS}><Callout n={3} title="照畫面安裝，打開" detail="免費，不用註冊" /></Step>
          </Steps>
        </div>
      </div>
    </Fit>
  </Shell>
);

const FirstLaunch: Page = () => (
  <Shell chapter={1}>
    <PracticeEyebrow time="練習 1 第 2 步">練習 1｜安裝</PracticeEyebrow>
    <Heading>第一次打開，先改繁體中文</Heading>
    <Fit z={1.15}>
      <In i={0}>
        <Screenshot src={firstLaunch} aspect={1520 / 470} width={1360} caption="Obsidian 起始畫面（實際擷取）" alt="Obsidian 起始畫面：建立新的儲存庫、開啟資料夾為儲存庫、連接至 Obsidian Sync 和最下方的語言選單">
          <RegionMark n={1} i={2} x={6} y={83} w={92} h={14} badge="right" />
          <RegionMark n={2} i={5} x={1.5} y={29} w={97} h={20} badge="right" />
        </Screenshot>
      </In>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, marginTop: 30 }}>
        <Steps>
          <Callout n={1} title="最下面選繁體中文" />
          <Step duration={STEP_MS}><Callout n={2} title="等一下用「開啟資料夾為儲存庫」" /></Step>
        </Steps>
      </div>
    </Fit>
  </Shell>
);

const GetVault: Page = () => (
  <Shell chapter={1}>
    <PracticeEyebrow time="練習 1 第 3 步">練習 1｜安裝</PracticeEyebrow>
    <Heading>下載並打開三國筆記庫</Heading>
    <Fit>
      <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: 56, alignItems: 'start' }}>
        <In i={0} style={{ background: amberSoft, borderTop: `5px solid ${amber}`, padding: '20px 24px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: 28, fontWeight: 600 }}>用電腦下載</div>
          <a href={VAULT_ZIP_URL} target="_blank" rel="noreferrer" aria-label="開啟 GitHub 上的三國人物知識庫 ZIP">
            <img src={vaultQr} alt="三國人物知識庫 ZIP 的 GitHub 下載 QR code" style={{ width: 250, height: 250, display: 'block', margin: '14px auto 0', imageRendering: 'pixelated' }} />
          </a>
          <a href={VAULT_ZIP_URL} download="三國人物知識庫.zip" style={{ display: 'inline-block', marginTop: 10, padding: '8px 20px', background: amber, color: '#FFFFFF', fontSize: 24, fontWeight: 600, textDecoration: 'none' }}>或按這裡下載 ZIP</a>
        </In>
        <div>
          <Figure w={1216} h={300} label="下載 ZIP、解壓縮成資料夾、用 Obsidian 開啟資料夾為儲存庫">
            <InG i={1}>
              <rect x="40" y="40" width="220" height="170" fill="#FFFFFF" stroke={faint} strokeWidth="3" />
              <path d="M40 92 H260" stroke={faint} strokeWidth="3" />
              <rect x="132" y="40" width="36" height="170" fill={raised} stroke={faint} strokeWidth="2" />
              <text x="150" y="260" textAnchor="middle" fontSize="28" fontWeight="600" fill={ink}>1｜下載 ZIP</text>
            </InG>
            <InG i={2}><MapArrow x1={290} x2={370} y={125} /></InG>
            <InG i={3}>
              <Folder x={410} y={40} w={240} h={170} />
              <text x={530} y={150} textAnchor="middle" fontSize="26" fill={ink}>三國人物知識庫</text>
              <text x={530} y={260} textAnchor="middle" fontSize="28" fontWeight="600" fill={ink}>2｜解壓縮</text>
            </InG>
            <InG i={4}><MapArrow x1={680} x2={760} y={125} hot /></InG>
            <InG i={5}>
              <AppFrame x={800} y={30} w={380} h={190} title="Obsidian" />
              <rect x="830" y="104" width="320" height="64" rx="6" fill={linkSoft} stroke={link} strokeWidth="2" />
              <text x="990" y="146" textAnchor="middle" fontSize="26" fill={link}>開啟資料夾為儲存庫</text>
              <text x="990" y="260" textAnchor="middle" fontSize="28" fontWeight="600" fill={ink}>3｜用 Obsidian 打開</text>
            </InG>
          </Figure>
          <In i={6} style={{ marginTop: 20, background: surface, borderLeft: `4px solid ${amber}`, padding: '16px 26px', fontSize: 30 }}>Windows：右鍵 → 全部解壓縮｜Mac：雙擊</In>
        </div>
      </div>
    </Fit>
  </Shell>
);

// One state of the file panel after opening the vault: right (tick) or one level too high (cross).
const TreePanel = ({ src, ok, label, alt }: { src: string; ok: boolean; label: string; alt: string }) => (
  <div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 32, fontWeight: 600, color: ok ? okGreen : warn, marginBottom: 14 }}>
      <svg viewBox="0 0 48 48" style={{ width: 44, height: 44 }} aria-hidden="true">{ok ? <OkDot x={24} y={24} r={22} /> : <NoDot x={24} y={24} r={22} />}</svg>
      {label}
    </div>
    <Screenshot src={src} aspect={604 / 410} width={640} alt={alt} />
  </div>
);

const VaultCheck: Page = () => (
  <Shell chapter={1}>
    <PracticeEyebrow time="練習 1 完成檢查">練習 1｜安裝</PracticeEyebrow>
    <Heading>打開後，左邊有六個資料夾</Heading>
    <Fit>
      <div style={{ display: 'grid', gridTemplateColumns: '640px 640px', gap: 96, justifyContent: 'center' }}>
        <In i={0}><TreePanel src={treeOk} ok label="對了：六個資料夾＋入口卡" alt="Obsidian 左側：人物、勢力、原文、整理、模板、關係六個資料夾和三國演義入口卡" /></In>
        <div>
          <Steps>
            <Step duration={STEP_MS}><TreePanel src={treeWrong} ok={false} label="選到外層：只有一個資料夾" alt="Obsidian 左側只看到一個三國人物知識庫資料夾，代表打開了外面那一層" /></Step>
          </Steps>
        </div>
      </div>
      <Steps><Step duration={STEP_MS}><div style={{ textAlign: 'center', fontSize: 32, marginTop: 36 }}>解壓縮多包了一層：重新打開<strong>裡面那個</strong>「三國人物知識庫」</div></Step></Steps>
    </Fit>
  </Shell>
);

// ---------- 02 把大綱放進筆記庫 ----------

const Section2: Page = () => <SectionPage chapter={2} label="02 / 合併" lead="第一堂的大綱，接上講師的人物卡" />;

const MergeOutline: Page = () => (
  <Shell chapter={2}>
    <PracticeEyebrow time="3 分鐘">練習 2｜合併</PracticeEyebrow>
    <Heading>練習（合併）：大綱放進整理資料夾</Heading>
    <Fit>
      <Stage h={460}>
        <Steps>
          <Layer h={460} label="第一堂的 aw-01-lab 資料夾裡有 三國演義大綱.md">
            <InG i={0}>
              <Folder x={0} y={40} w={460} h={330} fill={surface} stroke={faint} sw={3} />
              <text x="26" y="100" fontSize="30" fontWeight="600" fill={ink}>aw-01-lab/</text>
              <text x="40" y="160" fontSize="27" fontFamily={mono} fill={muted}>原文/</text>
              <text x="40" y="206" fontSize="27" fontFamily={mono} fill={muted}>回目.md</text>
              <text x="40" y="252" fontSize="27" fontFamily={mono} fill={muted}>prompts.md</text>
              <rect x="24" y="282" width="412" height="58" fill={amberSoft} stroke={amber} strokeWidth="3" />
              <text x="40" y="321" fontSize="28" fontFamily={mono} fontWeight="600" fill={ink}>三國演義大綱.md</text>
            </InG>
          </Layer>
          <Step duration={STEP_MS}><Layer h={460} label="只把大綱這一個檔，拖進三國人物知識庫的 整理 資料夾">
            <g fill="none" stroke={amber} strokeWidth="5"><StepPath d="M436 311 C540 311 540 176 630 176" /></g>
            <g className="aw2-build" style={buildDelay(1)}>
              <polygon points="650,176 628,164 628,188" fill={amber} />
              <Folder x={600} y={0} w={1032} h={450} fill="#FBF7F2" stroke={amber} sw={3} />
              <text x="628" y="60" fontSize="30" fontWeight="600" fill={ink}>三國人物知識庫/</text>
              <rect x="630" y="86" width="480" height="340" fill="#FFFFFF" stroke={rule} strokeWidth="2" />
              <text x="652" y="128" fontSize="28" fontFamily={mono} fontWeight="600" fill={amber}>整理/</text>
              <rect x="652" y="148" width="436" height="56" fill={sage} stroke={okGreen} strokeWidth="3" />
              <text x="670" y="186" fontSize="28" fontFamily={mono} fontWeight="600" fill={ink}>三國演義大綱.md</text>
              <rect x="1140" y="86" width="470" height="340" fill="#FFFFFF" stroke={rule} strokeWidth="2" />
              <text x="1162" y="128" fontSize="28" fontFamily={mono} fontWeight="600" fill={amber}>人物/</text>
              <CardDoc x={1164} y={150} w={420} h={84} name="劉備.md" fill={amberSoft} stroke={amber} size={32} />
              <text x="1164" y="292" fontSize="26" fontFamily={mono} fill={muted}>關羽.md　張飛.md</text>
              <text x="1164" y="338" fontSize="26" fontFamily={mono} fill={muted}>曹操.md　孫權.md</text>
              <text x="1374" y="402" textAnchor="middle" fontSize="24" fill={quiet}>講師的人物卡，不用動</text>
            </g>
          </Layer></Step>
          <Step duration={STEP_MS}><Layer h={460} label="大綱第 1 回裡的 [[劉備]]，自己連到 人物/劉備.md">
            <g className="aw2-build" style={buildDelay(0)}>
              <rect x="652" y="232" width="436" height="170" fill={surface} />
              <text x="1070" y="268" textAnchor="end" fontSize="24" fill={quiet}>大綱 第 1 回</text>
              <text x="670" y="324" fontSize="30" fill={ink}>……<tspan fill={link} textDecoration="underline">劉備</tspan>在涿縣遇到</text>
              <text x="670" y="374" fontSize="30" fill={ink}>張飛、關羽……</text>
            </g>
            <g fill="none" stroke={link} strokeWidth="5"><StepPath d="M758 292 C800 236 1000 214 1144 194" i={2} /></g>
            <g className="aw2-build" style={buildDelay(5)}><polygon points="1166,191 1142,182 1145,205" fill={link} /><OkDot x={1584} y={150} r={24} /></g>
          </Layer></Step>
        </Steps>
      </Stage>
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={32}>只搬一個檔，連結自己會接上</Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

const ClickLiubei: Page = () => (
  <Shell chapter={2}>
    <PracticeEyebrow time="2 分鐘">練習 2｜合併</PracticeEyebrow>
    <Heading>點大綱的劉備，跳到人物卡</Heading>
    <Fit>
      <div style={{ display: 'grid', gridTemplateColumns: '860px 100px 640px', gap: 16, alignItems: 'center' }}>
        <In i={0}>
          <Screenshot src={outlineCh1} aspect={1440 / 230} width={860} caption="整理/三國演義大綱，第 1 回｜實際畫面" alt="大綱第 1 回裡的劉備是深紫色連結">
            <RegionMark n={1} i={2} x={94} y={38} w={4.6} h={17} badge="right" />
          </Screenshot>
        </In>
        <div>
          <Steps>
            <Step duration={STEP_MS}><svg viewBox="0 0 100 80" style={{ width: 100, height: 80, display: 'block' }} aria-hidden="true"><MapArrow x1={4} x2={96} y={40} hot /></svg></Step>
          </Steps>
        </div>
        <div>
          <Steps>
            <Step duration={STEP_MS}><Screenshot src={liubeiCard} aspect={1460 / 800} width={640} caption="人物/劉備｜講師的卡" alt="點下去後打開人物資料夾裡的劉備卡" /></Step>
          </Steps>
        </div>
      </div>
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={56}>大綱和人物卡接上了</Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

// One big before/after number.
const BigCount = ({ label, value, tone }: { label: string; value: string; tone: 'plain' | 'ok' | 'amber' }) => (
  <div style={{ display: 'flex', alignItems: 'baseline', gap: 26, borderBottom: `1px solid ${rule}`, padding: '18px 0' }}>
    <span style={{ fontSize: 32, minWidth: 300 }}>{label}</span>
    <span style={{ fontFamily: display, fontSize: 84, lineHeight: 1, color: tone === 'ok' ? okGreen : tone === 'amber' ? amber : muted }}>{value}</span>
  </div>
);

const BacklinksReal: Page = () => (
  <Shell chapter={2}>
    <Eyebrow>合併之後</Eyebrow>
    <Heading>劉備的反向連結變多了</Heading>
    <Fit>
      <div style={{ display: 'grid', gridTemplateColumns: '500px 1fr', gap: 120, alignItems: 'center', justifyContent: 'center' }}>
        <In i={0}>
          <Screenshot src={backlinksPane} aspect={600 / 750} width={500} caption="劉備卡右側的反向連結｜實際畫面" alt="劉備卡的反向連結面板：已連結本筆記的檔案 41，三國演義 4，三國演義大綱 24">
            <Steps>
              <Step duration={STEP_MS}><StepMark n={1} x={4} y={2.5} w={93} h={8} badge="right" /></Step>
              <Step duration={STEP_MS}><StepMark n={2} x={4} y={84} w={93} h={8} badge="right" /></Step>
            </Steps>
          </Screenshot>
        </In>
        <div>
          <div style={{ fontSize: 30, color: muted, marginBottom: 6 }}>劉備被提到幾處（不是卡片張數）</div>
          <BigCount label="合併前" value="17 處" tone="plain" />
          <Steps>
            <Step duration={STEP_MS}><BigCount label="合併後" value="41 處" tone="ok" /></Step>
            <Step duration={STEP_MS}><BigCount label="來自大綱" value="24 處" tone="amber" /></Step>
          </Steps>
        </div>
      </div>
    </Fit>
  </Shell>
);

// One row of the deep / pale legend under the outline screenshot.
const LinkKind = ({ n, word, pale, title, sub }: { n: number; word: string; pale: boolean; title: string; sub: string }) => (
  <div style={{ display: 'grid', gridTemplateColumns: '48px 130px 1fr', gap: 24, alignItems: 'center' }}>
    <NumDot n={n} size={48} />
    <span style={{ fontSize: 50, color: pale ? linkFaint : link, textDecoration: 'underline' }}>{word}</span>
    <div>
      <div style={{ fontSize: 34, fontWeight: 600 }}>{title}</div>
      <div style={{ fontSize: 27, color: muted, marginTop: 4 }}>{sub}</div>
    </div>
  </div>
);

const CountChip = ({ value, tone }: { value: string; tone: 'deep' | 'pale' }) => (
  <span style={{ display: 'inline-block', fontFamily: display, fontSize: 56, lineHeight: 1, color: tone === 'deep' ? link : amber }}>{value}</span>
);

// Outline excerpt (第 1 回) drawn 1500 px wide; k = 1500 / 1440.
const GR_LEFT = 66;
const GR_TOP = 64;

const GrayReal: Page = () => (
  <Shell chapter={2}>
    <PracticeEyebrow time="2 分鐘">練習 2｜找淡色連結</PracticeEyebrow>
    <Heading>大綱裡顏色淡的連結</Heading>
    <Fit>
      <div style={{ position: 'relative', width: 1632, height: 600 }}>
        <In i={0} style={{ position: 'absolute', left: GR_LEFT, top: GR_TOP }}>
          <Screenshot src={outlineCh1} aspect={1440 / 230} width={1500} alt="大綱第 1 回：劉備、張飛、關羽是深紫色連結，張角、張寶、張梁、董卓是淡紫色連結" />
        </In>
        <div style={{ position: 'absolute', left: GR_LEFT, top: 352, fontSize: 34 }}>哪些名字已經有卡？</div>
        <Steps>
          <Step duration={STEP_MS}>
            <div style={{ position: 'absolute', inset: 0 }}>
              <PxMark x={GR_LEFT + 1381} y={GR_TOP + 84} w={80} h={48} n={1} badge="above" drop={22} />
              <div style={{ position: 'absolute', left: GR_LEFT, top: 412, width: 1200 }}><LinkKind n={1} word="劉備" pale={false} title="深紫：已經有卡，點了會打開" sub="例：劉備、關羽、張飛、曹操" /></div>
            </div>
          </Step>
          <Step duration={STEP_MS}>
            <div style={{ position: 'absolute', inset: 0 }}>
              <PxMark x={GR_LEFT + 1350} y={GR_TOP + 133} w={78} h={48} n={2} badge="below" drop={70} />
              <div style={{ position: 'absolute', left: GR_LEFT, top: 508, width: 1200 }}><LinkKind n={2} word="董卓" pale title="淡紫：還沒有卡，點了會新增空白卡" sub="例：張角、董卓、呂布……" /></div>
            </div>
          </Step>
          <Step duration={STEP_MS}>
            <div style={{ position: 'absolute', inset: 0 }}>
              <div style={{ position: 'absolute', right: 66, top: 420 }}><CountChip value="4 個" tone="deep" /></div>
              <div style={{ position: 'absolute', right: 66, top: 516 }}><CountChip value="70 個" tone="pale" /></div>
            </div>
          </Step>
        </Steps>
      </div>
    </Fit>
  </Shell>
);

// One bar of how often a not-yet-carded name shows up in the outline.
const NameBar = ({ name, n, max = 32 }: { name: string; n: number; max?: number }) => (
  <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr 70px', alignItems: 'center', gap: 16, height: 56 }}>
    <span style={{ fontSize: 31, color: link }}>{name}</span>
    <div style={{ height: 30, background: surface }}><div className="aw2-bar" style={{ width: `${(n / max) * 100}%`, height: '100%', background: linkFaint }} /></div>
    <span style={{ fontSize: 28, color: quiet, textAlign: 'right' }}>{n}</span>
  </div>
);

const Decision = ({ n, when, then, eg }: { n: number; when: string; then: string; eg: ReactNode }) => (
  <div style={{ display: 'grid', gridTemplateColumns: '44px 1fr', gap: 20, background: '#FFFFFF', border: `1px solid ${rule}`, padding: '18px 22px' }}>
    <NumDot n={n} />
    <div>
      <div style={{ fontSize: 31 }}><span style={{ color: muted }}>{when}</span>　→　<strong>{then}</strong></div>
      <div style={{ fontSize: 26, color: quiet, marginTop: 6 }}>{eg}</div>
    </div>
  </div>
);

const GrayDecide: Page = () => (
  <Shell chapter={2}>
    <PracticeEyebrow time="5 分鐘">練習 2｜整理連結</PracticeEyebrow>
    <Heading>淡色連結要怎麼處理</Heading>
    <Fit>
      <div style={{ display: 'grid', gridTemplateColumns: '640px 1fr', gap: 72, alignItems: 'center' }}>
        <In i={0}>
          <SmallLabel>大綱裡出現最多次、還沒有卡的人</SmallLabel>
          <div style={{ marginTop: 18 }}>
            <NameBar name="呂布" n={32} />
            <NameBar name="董卓" n={15} />
            <NameBar name="袁術" n={11} />
            <NameBar name="李傕" n={9} />
            <NameBar name="郭汜" n={7} />
            <NameBar name="袁紹" n={7} />
          </div>
        </In>
        <div style={{ display: 'grid', gap: 22 }}>
          <Steps>
            <Step duration={STEP_MS}><Decision n={1} when="常出現、原文夠寫" then="補一張卡" eg="例：呂布 32 次，第 5、19 回都有他" /></Step>
            <Step duration={STEP_MS}><Decision n={2} when="寫成別名" then="改成已有卡名" eg={<Path size={26}>[[玄德]] → [[劉備]]</Path>} /></Step>
            <Step duration={STEP_MS}><Decision n={3} when="只出現一兩次" then="先留著" eg="淡色不會壞，之後再補" /></Step>
          </Steps>
        </div>
      </div>
    </Fit>
  </Shell>
);

// One practice step on the right: a number, ≤16 字, and a small picture of it.
const CardStep = ({ n, text, h, children }: { n: number; text: ReactNode; h: number; children: ReactNode }) => (
  <div>
    <NumLine n={n} size={29}>{text}</NumLine>
    <svg viewBox={`0 0 520 ${h}`} style={{ display: 'block', width: 520, height: h, marginTop: 10, marginLeft: 62 }} aria-hidden="true">{children}</svg>
  </div>
);

// The example card is a stack of real crops (1352 × 627), drawn 990 px wide (s = 0.732).
const PC_RIGHT = 1040;

const Practice2Card: Page = () => (
  <Shell chapter={2}>
    <PracticeEyebrow time="9 分鐘">練習 2｜寫卡</PracticeEyebrow>
    <Heading>練習（連結）：寫一張關係卡</Heading>
    <PillRow>
      <Pill tag="定位">大綱挑一回</Pill>
      <Pill tag="期望輸出">照模板寫</Pill>
      <Pill tag="限制">原文沒寫不寫</Pill>
    </PillRow>
    <Fit>
      <div style={{ position: 'relative', width: 1632, height: 560 }}>
        <In i={1} style={{ position: 'absolute', left: 0, top: 0 }}>
          <Screenshot src={ownCard} aspect={1352 / 627} width={990} caption="範例：講師照模板寫的〈三英戰呂布〉，第 5 回｜實際畫面節選" alt="照模板寫的三英戰呂布卡：屬性回目 5，句子裡張飛、關羽是連結，參與人物裡呂布是純文字，最後一行寫出處" />
        </In>
        <Steps>
          <Step duration={STEP_MS}>
            <div style={{ position: 'absolute', inset: 0 }}>
              <div style={{ position: 'absolute', left: PC_RIGHT, top: 0 }}>
                <CardStep n={1} text="新增筆記，貼上模板" h={96}>
                  <rect x="0" y="10" width="250" height="56" fill={surface} stroke={rule} strokeWidth="2" />
                  <text x="16" y="47" fontSize="24" fontFamily={mono} fill={ink}>模板/關係卡模板</text>
                  <MapArrow x1={262} x2={322} y={38} hot />
                  <DocShape x={336} y={4} w={150} h={80} fill="#FFFFFF" stroke={amber} sw={3} />
                  <text x="411" y="54" textAnchor="middle" fontSize="24" fill={ink}>關係/新卡</text>
                </CardStep>
              </div>
            </div>
          </Step>
          <Step duration={STEP_MS}>
            <div style={{ position: 'absolute', inset: 0 }}>
              <div style={{ position: 'absolute', left: PC_RIGHT, top: 172 }}>
                <CardStep n={2} text={<>有卡的人名加 [[ ]]，例 <Path size={28}>[[劉備]]</Path></>} h={110}>
                  <rect x="0" y="6" width="220" height="50" fill={term} />
                  <text x="18" y="41" fontSize="27" fontFamily={mono} fill="#B79CF2">[[劉</text>
                  <rect x="40" y="56" width="320" height="50" fill="#FFFFFF" stroke={rule} strokeWidth="2" />
                  <rect x="42" y="58" width="316" height="46" fill={linkSoft} />
                  <text x="60" y="90" fontSize="25" fontWeight="600" fill={ink}>劉備</text>
                  <text x="130" y="90" fontSize="22" fill={quiet}>人物/劉備.md</text>
                  <text x="380" y="90" fontSize="24" fill={link}>← 跳出選單</text>
                </CardStep>
              </div>
              <PxMark x={16} y={285} w={60} h={38} color={link} />
              <div style={{ position: 'absolute', left: 347, top: 366, width: 54, borderBottom: `5px dashed ${quiet}` }} />
              <div style={{ position: 'absolute', left: 0, top: 506, display: 'flex', gap: 36, fontSize: 26 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}><span style={{ width: 34, height: 24, border: `4px solid ${link}` }} />有卡：加 [[ ]]，變連結</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}><span style={{ width: 34, borderBottom: `5px dashed ${quiet}` }} />沒卡：寫純文字</span>
              </div>
            </div>
          </Step>
          <Step duration={STEP_MS}>
            <div style={{ position: 'absolute', inset: 0 }}>
              <div style={{ position: 'absolute', left: PC_RIGHT, top: 362 }}>
                <CardStep n={3} text="填回目，最後一行寫出處" h={60}>
                  <rect x="0" y="4" width="440" height="50" fill={surface} stroke={rule} strokeWidth="2" />
                  <text x="18" y="38" fontSize="25" fontFamily={mono} fill={ink}>出處：原文/第005回.txt</text>
                </CardStep>
              </div>
              <PxMark x={16} y={92} w={272} h={40} color="#E9B650" />
              <PxMark x={16} y={404} w={262} h={42} color="#E9B650" />
            </div>
          </Step>
        </Steps>
      </div>
    </Fit>
  </Shell>
);

// ---------- 03 在筆記庫裡做 RAG ----------

const Section3: Page = () => <SectionPage chapter={3} label="03 / RAG" lead="先查筆記，再回答，附上檔名" />;

const MiniCard = ({ x, y, name, hot = false }: { x: number; y: number; name: string; hot?: boolean }) => (
  <g>
    <rect x={x} y={y} width="136" height="58" fill={hot ? amberSoft : '#FFFFFF'} stroke={hot ? amber : rule} strokeWidth={hot ? 3 : 2} />
    <text x={x + 68} y={y + 38} textAnchor="middle" fontSize="24" fontWeight={hot ? 600 : 400} fill={hot ? ink : quiet}>{name}</text>
  </g>
);

const RagHead = ({ x, letter, term: word, english }: { x: number; letter: string; term: string; english: string }) => (
  <g>
    <text x={x} y="56" fontSize="62" fontFamily={display} fill={amber}>{letter}</text>
    <text x={x + 56} y="52" fontSize="36" fontWeight="600" fill={ink}>{word}</text>
    <text x={x + 140} y="52" fontSize="23" fill={quiet}>{english}</text>
  </g>
);

const RagIdea: Page = () => (
  <Shell chapter={3}>
    <Eyebrow>RAG＝檢索增強生成</Eyebrow>
    <Heading>RAG：先找卡，再回答</Heading>
    <Lead>像開書考：先翻到那一頁，再作答</Lead>
    <Fit>
      <Stage h={440}>
        <Steps>
          <Layer h={440} label="R 檢索：從筆記庫找出曹操和赤壁之戰兩張卡">
            <InG i={0}><RagHead x={0} letter="R" term="檢索" english="Retrieval" /></InG>
            <InG i={1}>
              <rect x="0" y="86" width="500" height="320" fill={surface} />
              <rect x="24" y="106" width="452" height="56" rx="28" fill="#FFFFFF" stroke={ink} strokeWidth="2" />
              <text x="250" y="143" textAnchor="middle" fontSize="25" fill={ink}>依這座筆記庫，曹操參與哪場戰役？</text>
            </InG>
            <InG i={2}><MiniCard x={24} y={192} name="劉備" /><MiniCard x={182} y={192} name="關羽" /><MiniCard x={340} y={192} name="曹操" /></InG>
            <InG i={3}><MiniCard x={24} y={268} name="桃園結義" /><MiniCard x={182} y={268} name="煮酒論英雄" /><MiniCard x={340} y={268} name="赤壁之戰" /></InG>
            <PopG i={6}><MiniCard x={340} y={192} name="曹操" hot /></PopG>
            <PopG i={7}><MiniCard x={340} y={268} name="赤壁之戰" hot /></PopG>
            <InG i={8}><text x="250" y="378" textAnchor="middle" fontSize="26" fill={muted}>挑出相關的卡</text></InG>
          </Layer>
          <Step duration={STEP_MS}><Layer h={440} label="A 增強：把問題和兩張卡一起交給模型">
            <MapArrow x1={512} x2={560} y={246} hot />
            <RagHead x={566} letter="A" term="增強" english="Augmented" />
            <rect x="566" y="86" width="500" height="320" fill={linkSoft} />
            <g className="aw2-build" style={buildDelay(0)}>
              <rect x="596" y="106" width="440" height="150" fill="#FFFFFF" stroke={link} strokeWidth="2" strokeDasharray="10 8" />
              <text x="616" y="142" fontSize="24" fill={link}>一起交出去</text>
              <SvgChip x={616} y={160} w={400} label="問題：曹操參與哪場戰役？" size={23} />
              <SvgChip x={616} y={204} w={190} label="曹操.md" fill={amberSoft} stroke={amber} />
              <SvgChip x={826} y={204} w={190} label="赤壁之戰.md" fill={amberSoft} stroke={amber} />
            </g>
            <g className="aw2-build" style={buildDelay(1)}>
              <DownArrowSvg x={816} y1={262} y2={296} color={link} />
              <rect x="736" y="300" width="160" height="58" fill={link} />
              <text x="816" y="339" textAnchor="middle" fontSize="30" fontWeight="600" fill="#FFFFFF">模型</text>
              <text x="816" y="392" textAnchor="middle" fontSize="24" fill={muted}>題目多了依據</text>
            </g>
          </Layer></Step>
          <Step duration={STEP_MS}><Layer h={440} label="G 生成：回答赤壁之戰，並附上兩個檔名">
            <MapArrow x1={1078} x2={1126} y={246} hot />
            <RagHead x={1132} letter="G" term="生成" english="Generation" />
            <rect x="1132" y="86" width="500" height="320" fill={sage} />
            <g className="aw2-build" style={buildDelay(0)}>
              <Bubble x={1160} y={110} w={444} h={120} />
              <text x="1186" y="160" fontSize="30" fontWeight="600" fill={ink}>赤壁之戰</text>
              <text x="1186" y="204" fontSize="24" fill={muted}>照筆記回答</text>
            </g>
            <g className="aw2-build" style={buildDelay(1)}>
              <text x="1160" y="296" fontSize="24" fill={okGreen} fontWeight="600">檔名</text>
              <SvgChip x={1222} y={268} w={170} label="曹操.md" fill="#FFFFFF" stroke={okGreen} />
              <SvgChip x={1404} y={268} w={200} label="赤壁之戰.md" fill="#FFFFFF" stroke={okGreen} />
              <text x="1382" y="378" textAnchor="middle" fontSize="26" fill={muted}>回答附上檔名</text>
            </g>
          </Layer></Step>
        </Steps>
      </Stage>
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={28}>模型沒變，只是先看了筆記</Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

const OpenInCodex: Page = () => (
  <Shell chapter={3}>
    <Eyebrow>終端機（Mac）／PowerShell（Windows）</Eyebrow>
    <Heading>用 Codex 打開筆記庫</Heading>
    <Fit>
      <div style={{ display: 'grid', gridTemplateColumns: '1100px 1fr', gap: 56, alignItems: 'center' }}>
        <In i={0}>
          <Terminal title="終端機（示意，路徑依電腦而定）" width={1100} size={36}>
            <div><Typed>$</Typed>{' cd '}<span style={{ color: '#E9B650', fontFamily: 'var(--osd-font-body)', fontSize: 27 }}>← 空格，再把資料夾拖進來</span></div>
            <Steps>
              <Step duration={STEP_MS}><div><Typed>$</Typed>{' codex'}</div></Step>
              <Step duration={STEP_MS}><div><AskLine>› /status</AskLine></div></Step>
              <Step duration={STEP_MS}><div style={{ background: 'rgba(233,182,80,0.18)', outline: '3px solid #E9B650', margin: '6px -12px 0', padding: '0 12px' }}><Dim>Directory </Dim>{' ~/Downloads/三國人物知識庫'}</div></Step>
            </Steps>
          </Terminal>
        </In>
        <div style={{ display: 'grid', gap: 36 }}>
          <Callout n={1} title="cd 進「三國人物知識庫」" />
          <Callout n={2} title="打 codex" />
          <Callout n={3} title="/status 看 Directory" />
        </div>
      </div>
    </Fit>
  </Shell>
);

// One line of the prompt, with the role it plays tagged on the right.
const PromptPart = ({ text, tag }: { text: string; tag: string }) => (
  <div style={{ display: 'grid', gridTemplateColumns: '1fr 150px', alignItems: 'center', gap: 24, padding: '10px 0' }}>
    <span style={{ fontSize: 40, lineHeight: 1.4 }}>{text}</span>
    <span style={{ justifySelf: 'start', background: amber, color: '#FFFFFF', fontSize: 26, fontWeight: 600, padding: '6px 18px', borderRadius: 24 }}>{tag}</span>
  </div>
);

const AskWithFiles: Page = () => (
  <Shell chapter={3}>
    <Eyebrow>示範｜這一題貫穿整章</Eyebrow>
    <Heading>提問時要求附上檔名</Heading>
    <Fit>
      <In i={0}>
        <div style={{ background: '#FFFFFF', border: `1px solid ${rule}`, borderLeft: `8px solid ${amber}`, padding: '26px 40px' }}>
          <SmallLabel>在 Codex 輸入</SmallLabel>
          <div style={{ marginTop: 10 }}>
            <Steps>
              <PromptPart text="依這座筆記庫，曹操參與哪場戰役？" tag="問題" />
              <Step duration={STEP_MS}><PromptPart text="只根據 .md 卡片回答，" tag="範圍" /></Step>
              <Step duration={STEP_MS}><PromptPart text="每個說法附上檔名和一句卡片原句；" tag="出處" /></Step>
              <Step duration={STEP_MS}><PromptPart text="筆記沒寫的就說找不到，不要自己補。" tag="限制" /></Step>
            </Steps>
          </div>
        </div>
      </In>
      <Steps><Step duration={STEP_MS}><Takeaway>附了檔名和原句，才查得回去</Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

// One file in the search result: how many lines matched.
const HitBar = ({ file, n, max = 28, hot = false, order = 0 }: { file: string; n: number; max?: number; hot?: boolean; order?: number }) => (
  <div style={{ display: 'grid', gridTemplateColumns: '440px 1fr 90px', alignItems: 'center', gap: 18, height: 46 }}>
    <span style={{ fontFamily: mono, fontSize: 26, color: hot ? ink : muted, fontWeight: hot ? 600 : 400 }}>{file}</span>
    <div style={{ height: 26, background: surface }}><div className="aw2-bar" style={{ ...buildDelay(order), width: `${(n / max) * 100}%`, height: '100%', background: hot ? amber : rule }} /></div>
    <span style={{ fontSize: 27, color: hot ? amber : quiet, textAlign: 'right' }}>{n} 行</span>
  </div>
);

const StageTag = ({ n, children }: { n: number; children: ReactNode }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 31, fontWeight: 600, marginBottom: 12 }}><NumDot n={n} />{children}</div>
);

const RStep: Page = () => (
  <Shell chapter={3}>
    <Eyebrow>R｜Retrieval</Eyebrow>
    <Heading>R 檢索：Codex 先搜尋筆記</Heading>
    <Lead>像按 Ctrl+F，把整個資料夾搜一遍</Lead>
    <Fit>
      <In i={0}>
        <div style={{ background: term, color: '#F5F5F4', padding: '16px 28px', fontFamily: mono, fontSize: 27, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span><span style={{ color: '#8DD4A0' }}>Ran</span>{" rg -n -i '曹操|戰役|戰爭|之戰|大戰' -g '*.md' ."}</span>
          <span style={{ fontFamily: 'var(--osd-font-body)', fontSize: 22, color: '#BCC3CC' }}>實跑紀錄｜Codex 0.154.0</span>
        </div>
      </In>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 440px', gap: 56, marginTop: 22, alignItems: 'start' }}>
        <div>
          <Steps>
            <Step duration={STEP_MS}>
              <div>
                <StageTag n={1}>搜尋：找到候選｜14 個檔、77 行</StageTag>
                <HitBar file="整理/三國演義大綱.md" n={26} order={0} />
                <HitBar file="整理/練習提示詞.md" n={7} order={1} />
                <HitBar file="關係/煮酒論英雄.md" n={6} order={2} />
                <HitBar file="關係/赤壁之戰.md" n={5} hot order={3} />
                <HitBar file="人物/曹操.md" n={5} hot order={4} />
                <HitBar file="其他 9 個檔" n={28} order={5} />
              </div>
            </Step>
          </Steps>
        </div>
        <div>
          <Steps>
            <Step duration={STEP_MS}>
              <div style={{ background: amberSoft, borderTop: `5px solid ${amber}`, padding: '20px 28px 26px' }}>
                <StageTag n={2}>打開：真的讀了幾張？</StageTag>
                <div style={{ fontFamily: display, fontSize: 96, color: amber, lineHeight: 1.1 }}>0 張</div>
                <div style={{ fontSize: 29, lineHeight: 1.5, marginTop: 10 }}>沒有另外打開整張卡，只看了搜尋到的那 77 行</div>
              </div>
            </Step>
          </Steps>
        </div>
      </div>
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={20}>它讀的是搜到的句子，不是整張卡</Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

// A matched line from the search, labelled with its file and line number.
const Excerpt = ({ y, file, text }: { y: number; file: string; text: string }) => (
  <g>
    <rect x="0" y={y} width="860" height="84" fill="#FFFFFF" stroke={rule} strokeWidth="2" />
    <text x="20" y={y + 30} fontSize="22" fontFamily={mono} fill={quiet}>{file}</text>
    <text x="20" y={y + 68} fontSize="26" fill={ink}>{text}</text>
  </g>
);

const UsedMark = ({ y }: { y: number }) => (
  <g><rect x="-6" y={y - 6} width="872" height="96" fill="none" stroke={okGreen} strokeWidth="5" /><OkDot x={866} y={y} r={20} /></g>
);

const AStep: Page = () => (
  <Shell chapter={3}>
    <Eyebrow>A｜Augmented</Eyebrow>
    <Heading>A 增強：找到的句子跟著問題送出</Heading>
    <Lead>像把翻到的那幾頁攤在桌上</Lead>
    <Fit>
      <Stage h={450}>
        <Steps>
          <Layer h={450} label="搜尋找到的句子（實跑節選）：曹操卡第 11 行、赤壁之戰卡第 13 和 19 行、大綱第 44 行">
            <InG i={0}><text x="0" y="24" fontSize="25" fontWeight="600" fill={quiet}>搜到的句子（實跑，77 行中的 4 行）</text></InG>
            <InG i={1}><Excerpt y={44} file="人物/曹操.md:11" text="曹操率大軍南下，在 [[赤壁之戰]] 被 [[孫權]] 麾下的周瑜火燒戰船" /></InG>
            <InG i={2}><Excerpt y={144} file="關係/赤壁之戰.md:13" text="第 49 回東南風起，周瑜下令火攻……曹操大敗" /></InG>
            <InG i={3}><Excerpt y={244} file="關係/赤壁之戰.md:19" text="參與人物：[[孫權]]、[[曹操]]、[[劉備]]、[[關羽]]、[[張飛]]" /></InG>
            <InG i={4}><Excerpt y={344} file="整理/三國演義大綱.md:44" text="……但[[曹操]]用計收復濮陽。" /></InG>
          </Layer>
          <Step duration={STEP_MS}><Layer h={450} label="問題加上這些句子，一起送進模型；這一輪輸入 44,156 token">
            <MapArrow x1={900} x2={980} y={220} hot />
            <g className="aw2-build" style={buildDelay(0)}>
              <rect x="994" y="70" width="330" height="300" fill={linkSoft} stroke={link} strokeWidth="2" strokeDasharray="10 8" />
              <text x="1159" y="118" textAnchor="middle" fontSize="27" fontWeight="600" fill={link}>同一份輸入</text>
              <rect x="1024" y="142" width="270" height="46" fill="#FFFFFF" stroke={ink} strokeWidth="2" /><text x="1159" y="174" textAnchor="middle" fontSize="24" fill={ink}>問題</text>
              <rect x="1024" y="202" width="270" height="34" fill="#FFFFFF" stroke={amber} strokeWidth="2" />
              <rect x="1024" y="246" width="270" height="34" fill="#FFFFFF" stroke={amber} strokeWidth="2" />
              <text x="1159" y="334" textAnchor="middle" fontSize="24" fill={amber}>＋ 77 行搜尋結果</text>
            </g>
            <g className="aw2-build" style={buildDelay(2)}>
              <MapArrow x1={1336} x2={1400} y={220} hot />
              <rect x="1412" y="160" width="220" height="120" fill={link} />
              <text x="1522" y="232" textAnchor="middle" fontSize="36" fontWeight="600" fill="#FFFFFF">模型</text>
              <text x="1522" y="330" textAnchor="middle" fontSize="25" fill={ink}>44,156 token</text>
              <text x="1522" y="366" textAnchor="middle" fontSize="22" fill={quiet}>含 Codex 自己的說明</text>
            </g>
          </Layer></Step>
          <Step duration={STEP_MS}><Layer h={450} label="回答真正引用的是曹操卡第 11 行和赤壁之戰卡第 19 行">
            <g className="aw2-build" style={buildDelay(0)}><UsedMark y={44} /><UsedMark y={244} /></g>
            <g className="aw2-build" style={buildDelay(1)}><text x="1159" y="430" textAnchor="middle" fontSize="28" fontWeight="600" fill={okGreen}>回答引用了打勾的兩句</text></g>
          </Layer></Step>
        </Steps>
      </Stage>
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={20}>問題加上筆記，模型才有根據</Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

const AnsLine = ({ children, color = '#F5F5F4', size = 28, indent = 0 }: { children: ReactNode; color?: string; size?: number; indent?: number }) => (
  <div style={{ fontFamily: mono, fontSize: size, lineHeight: 1.55, color, paddingLeft: indent, whiteSpace: 'pre' }}>{children}</div>
);

const GStep: Page = () => (
  <Shell chapter={3}>
    <Eyebrow>G｜Generation</Eyebrow>
    <Heading>G 生成：回答附上檔名和原句</Heading>
    <Fit>
      <div style={{ display: 'grid', gridTemplateColumns: '820px 1fr', gap: 56, alignItems: 'center' }}>
        <In i={0}>
          <div style={{ background: term, borderTop: `5px solid ${amber}`, padding: '20px 30px 26px' }}>
            <div style={{ fontSize: 22, color: '#BCC3CC', marginBottom: 10 }}>Codex 實際回答（全文，排版調整）</div>
            <AnsLine size={30}>曹操參與的戰役是：赤壁之戰。</AnsLine>
            <AnsLine color="#F3D9B1">· 人物/曹操.md：</AnsLine>
            <AnsLine indent={30}>「第 49 至 50 回曹操率大軍南下，</AnsLine>
            <AnsLine indent={30}>{'  在 [[赤壁之戰]] 被 [[孫權]] 麾下的'}</AnsLine>
            <AnsLine indent={30}>{'  周瑜火燒戰船……」'}</AnsLine>
            <AnsLine color="#F3D9B1">· 關係/赤壁之戰.md：</AnsLine>
            <AnsLine indent={30}>「參與人物：[[孫權]]、[[曹操]]、</AnsLine>
            <AnsLine indent={30}>{'  [[劉備]]、[[關羽]]、[[張飛]]」'}</AnsLine>
            <AnsLine color="#BCC3CC">筆記中找不到曹操參與其他戰役的明確記載。</AnsLine>
          </div>
        </In>
        <div>
          <Steps>
            <Step duration={STEP_MS}>
              <div>
                <SmallLabel>打開 人物/曹操.md，找到這一句</SmallLabel>
                <div style={{ marginTop: 10, position: 'relative', width: 756 }}>
                  <Screenshot src={caocaoLine} aspect={1078 / 54} width={756} alt="曹操卡的實際畫面：第 49 至 50 回曹操率大軍南下，在赤壁之戰被孫權麾下的周瑜火燒戰船" />
                  <div style={{ position: 'absolute', inset: -6, border: `5px solid ${okGreen}`, pointerEvents: 'none' }} />
                </div>
              </div>
            </Step>
            <Step duration={STEP_MS}>
              <div style={{ marginTop: 40 }}>
                <SmallLabel>打開 關係/赤壁之戰.md，找到這一句</SmallLabel>
                <div style={{ marginTop: 10, position: 'relative', width: 520 }}>
                  <Screenshot src={chibiParticipants} aspect={668 / 65} width={520} alt="赤壁之戰卡的實際畫面：參與人物：孫權、曹操、劉備、關羽、張飛" />
                  <div style={{ position: 'absolute', inset: -6, border: `5px solid ${okGreen}`, pointerEvents: 'none' }} />
                </div>
              </div>
            </Step>
          </Steps>
        </div>
      </div>
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={36}>檔名加一句原句，一找就到</Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

// One answer to the same question, with or without the vault.
const AnswerPanel = ({ title, sub, tone, children }: { title: string; sub: string; tone: 'plain' | 'ok'; children: ReactNode }) => (
  <div style={{ background: tone === 'ok' ? sage : surface, borderTop: `5px solid ${tone === 'ok' ? okGreen : faint}`, padding: '24px 34px 28px', height: '100%', boxSizing: 'border-box' }}>
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 18 }}>
      <span style={{ fontSize: 36, fontWeight: 600 }}>{title}</span>
      <span style={{ fontSize: 24, color: quiet }}>{sub}</span>
    </div>
    <div style={{ marginTop: 20 }}>{children}</div>
  </div>
);

const AnswerBox = ({ children }: { children: ReactNode }) => (
  <div style={{ background: '#FFFFFF', border: `1px solid ${rule}`, padding: '18px 24px', fontSize: 30, lineHeight: 1.55, marginBottom: 20 }}>{children}</div>
);

// The exact prompt of one run, shown on top of its answer.
const PromptQuote = ({ children }: { children: ReactNode }) => (
  <div style={{ background: '#FFFFFF', border: `1px solid ${rule}`, borderLeft: `6px solid ${amber}`, padding: '12px 20px', fontSize: 27, lineHeight: 1.5, marginBottom: 16, minHeight: 120, boxSizing: 'border-box' }}>{children}</div>
);

const WithWithout: Page = () => (
  <Shell chapter={3}>
    <Eyebrow>同一題，問兩次｜實跑</Eyebrow>
    <Heading>沒有筆記和有筆記，差在哪</Heading>
    <Fit>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48 }}>
        <Steps>
          <AnswerPanel title="沒有筆記" sub="在空資料夾問" tone="plain">
            <PromptQuote>曹操參與哪場戰役？</PromptQuote>
            <AnswerBox>官渡之戰（200年）、赤壁之戰（208年）<br />濮陽、下邳、潼關之戰等</AnswerBox>
            <StatusLine ok={false}>沒有檔名，查不回去</StatusLine>
          </AnswerPanel>
          <Step duration={STEP_MS}>
            <AnswerPanel title="有筆記" sub="在筆記庫問" tone="ok">
              <PromptQuote>依這座筆記庫，曹操參與哪場戰役？只根據 .md 卡片回答，每個說法附上檔名和一句卡片原句；筆記沒寫的就說找不到，不要自己補。</PromptQuote>
              <AnswerBox>赤壁之戰<br /><span style={{ fontFamily: mono, fontSize: 25, color: okGreen }}>人物/曹操.md、關係/赤壁之戰.md＋原句</span></AnswerBox>
              <StatusLine ok>每一句都查得到</StatusLine>
            </AnswerPanel>
          </Step>
        </Steps>
      </div>
      <Steps>
        <Step duration={STEP_MS}><div style={{ marginTop: 20, textAlign: 'center', fontSize: 26, color: quiet }}>兩次問法不同：右邊多了範圍、檔名和原句的要求</div></Step>
        <Step duration={STEP_MS}><div style={{ marginTop: 10, textAlign: 'center', fontSize: 32, color: amber, fontWeight: 600 }}>「官渡之戰」：筆記庫裡一個字都沒有</div></Step>
      </Steps>
    </Fit>
  </Shell>
);

const LinksHelp: Page = () => (
  <Shell chapter={3}>
    <Eyebrow>為什麼連結要寫好</Eyebrow>
    <Heading>連結讓你沿著卡片查證</Heading>
    <Lead>答案給檔名，連結帶你一路查回去</Lead>
    <Fit>
      <div style={{ display: 'grid', gridTemplateColumns: '960px 1fr', gap: 64, alignItems: 'center' }}>
        <div>
          <In i={0} style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 30 }}><NumDot n={1} />回答寫：<Path size={30}>人物/曹操.md</Path></In>
          <Steps>
            <Step duration={STEP_MS}>
              <div style={{ marginTop: 30 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 30, marginBottom: 12 }}><NumDot n={2} />打開它，點句子裡的 [[赤壁之戰]]</div>
                <div style={{ position: 'relative', width: 940 }}>
                  <Screenshot src={caocaoLine} aspect={1078 / 54} width={940} alt="曹操卡的實際畫面，句子裡的赤壁之戰是紫色連結" />
                  <div style={{ position: 'absolute', left: '47.2%', top: '6%', width: '13%', height: '90%', border: '4px solid #E9B650' }} />
                </div>
              </div>
            </Step>
          </Steps>
        </div>
        <div>
          <Steps>
            <Step duration={STEP_MS}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 30, marginBottom: 12 }}><NumDot n={3} />跳到〈赤壁之戰〉</div>
                <Screenshot src={chibiTop} aspect={746 / 330} width={600} caption="Obsidian 實際畫面（節選）" alt="赤壁之戰關係卡：回目 49，第一句寫曹操收服北方後率大軍南下" />
              </div>
            </Step>
          </Steps>
        </div>
      </div>
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={32}>答案有檔名，連結讓它有路可回</Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

const LimitMissing: Page = () => (
  <Shell chapter={3}>
    <Eyebrow>RAG 的限制 1｜實跑</Eyebrow>
    <Heading>筆記沒寫的，它找不到</Heading>
    <In i={0} style={{ marginTop: 26 }}><PromptQuote>官渡之戰是誰打贏的？請只根據這個筆記庫裡的 .md 卡片回答，附上檔名；筆記沒寫的就說找不到，不要自己補。</PromptQuote></In>
    <Fit>
      <Stage h={330}>
        <Steps>
          <Layer h={330} label="Codex 搜尋「官渡」，沒有任何卡提到">
            <InG i={1}>
              <Folder x={110} y={0} w={340} h={200} fill="#FBF7F2" stroke={amber} />
              <SvgIcon kind="search" x={280} y={106} size={96} color={amber} />
              <text x="280" y="250" textAnchor="middle" fontSize="30" fill={muted}>搜尋「官渡」</text></InG>
            <PopG i={4}><text x="280" y="300" textAnchor="middle" fontSize="32" fontWeight="600" fill={amber}>0 張卡提到</text></PopG>
          </Layer>
          <Step duration={STEP_MS}><Layer h={330} label="Codex 的實際回答：找不到。筆記庫中的 .md 卡片沒有提到官渡之戰或其勝負">
            <MapArrow x1={560} x2={680} y={110} hot />
            <g className="aw2-build" style={buildDelay(0)}>
              <Bubble x={700} y={10} w={920} h={200} stroke={okGreen} />
              <text x="740" y="78" fontSize="38" fontWeight="600" fill={ink}>找不到。</text>
              <text x="740" y="132" fontSize="32" fill={ink}>筆記庫中的 .md 卡片沒有提到</text>
              <text x="740" y="178" fontSize="32" fill={ink}>「官渡之戰」或其勝負。</text>
              <OkDot x={1578} y={52} r={26} />
              <text x="740" y="282" fontSize="24" fill={quiet}>Codex 實際回答（節錄）</text>
            </g>
          </Layer></Step>
        </Steps>
      </Stage>
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={36}>說「找不到」，是好的回答</Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

const Added = ({ children }: { children: ReactNode }) => (
  <mark style={{ background: '#F6D78B', color: ink, padding: '0 4px' }}>{children}</mark>
);

const LimitMiss: Page = () => (
  <Shell chapter={3}>
    <Eyebrow>RAG 的限制 2｜實跑</Eyebrow>
    <Heading>資料一多，它也會看漏</Heading>
    <Fit>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48 }}>
        <Steps>
          <AnswerPanel title="第一次問" sub="範圍：整座筆記庫" tone="plain">
            <PromptQuote>依這座筆記庫，曹操參與哪場戰役？只根據 .md 卡片回答，每個說法附上檔名和一句卡片原句；……</PromptQuote>
            <AnswerBox>赤壁之戰。<br /><span style={{ color: amber }}>「筆記中找不到曹操參與其他戰役」</span></AnswerBox>
            <div style={{ fontSize: 28, color: amber }}>大綱其實搜到 26 行，濮陽、下邳都沒算進去</div>
          </AnswerPanel>
          <Step duration={STEP_MS}>
            <AnswerPanel title="縮小範圍再問" sub="範圍：只查大綱" tone="ok">
              <PromptQuote>再查 <Added>整理/三國演義大綱.md</Added>：曹操在<Added>第 1 到 21 回</Added>參與了哪些戰役？<Added>每一項附回目</Added>和檔名；筆記沒寫的不要補。</PromptQuote>
              <AnswerBox>列出 <strong>13 項</strong>：濮陽（第 11 回）、<br />淯水（第 16 回）、下邳（第 19 回）……</AnswerBox>
            </AnswerPanel>
          </Step>
        </Steps>
      </div>
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={28}>改的是範圍：查哪個檔、哪幾回</Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

// Three checks, each drawn as a small picture.
const CheckPanel = ({ label, caption, alt, children }: { label: string; caption: string; alt: string; children: ReactNode }) => (
  <div style={{ background: '#FFFFFF', border: `1px solid ${rule}`, padding: '24px 28px 24px', boxSizing: 'border-box', height: '100%' }}>
    <SmallLabel>{label}</SmallLabel>
    <svg viewBox="0 0 464 230" style={{ display: 'block', width: '100%', height: 'auto', marginTop: 14 }} role="img" aria-label={alt}>{children}</svg>
    <div style={{ fontSize: 30, lineHeight: 1.4, marginTop: 12 }}>{caption}</div>
  </div>
);

const CheckThree: Page = () => (
  <Shell chapter={3}>
    <Eyebrow>核對回答｜用剛才的實跑結果</Eyebrow>
    <Heading>核對回答的三件事</Heading>
    <Fit>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 36 }}>
        <Steps>
          <In i={0} style={{ display: 'grid' }}><CheckPanel label="1｜檔案在嗎" caption="這座筆記庫裡有這個檔嗎？" alt="回答寫的出處 原文/第011回.txt，在筆記庫的原文資料夾裡找得到，打勾">
            <Folder x={10} y={14} w={250} h={206} fill={surface} stroke={faint} />
            <text x="30" y="70" fontSize="24" fontFamily={mono} fill={ink}>原文/</text>
            <text x="30" y="106" fontSize="22" fontFamily={mono} fill={quiet}>第001回.txt</text>
            <text x="30" y="132" fontSize="22" fontFamily={mono} fill={quiet}>⋮</text>
            <rect x="22" y="140" width="226" height="36" fill={sage} stroke={okGreen} strokeWidth="2" />
            <text x="30" y="166" fontSize="22" fontFamily={mono} fontWeight="600" fill={ink}>第011回.txt</text>
            <text x="30" y="204" fontSize="22" fontFamily={mono} fill={quiet}>⋮ 共 21 回＋節選</text>
            <rect x="282" y="60" width="176" height="70" fill="#FFFFFF" stroke={okGreen} strokeWidth="2" />
            <text x="370" y="88" textAnchor="middle" fontSize="22" fill={quiet}>回答寫的</text>
            <text x="370" y="116" textAnchor="middle" fontSize="22" fontFamily={mono} fill={ink}>第011回.txt</text>
            <path d="M282 112 C266 128 262 150 252 158" fill="none" stroke={okGreen} strokeWidth="3" />
            <OkDot x={440} y={46} />
          </CheckPanel></In>
          <Step duration={STEP_MS}><CheckPanel label="2｜原句在嗎" caption="卡片裡找得到那句話嗎？" alt="大綱第 11 回寫了呂布趁曹操外出攻打濮陽，打勾">
            <DocShape x={10} y={20} w={420} h={190} />
            <text x="34" y="62" fontSize="24" fill={quiet}>大綱 第 11 回</text>
            <rect x="28" y="88" width="384" height="44" fill={amberSoft} />
            <text x="40" y="120" fontSize="26" fill={ink}>呂布趁曹操外出攻打濮陽</text>
            <text x="40" y="172" fontSize="26" fill={ink}>……曹操用計收復濮陽</text>
            <OkDot x={436} y={36} />
          </CheckPanel></Step>
          <Step duration={STEP_MS}><CheckPanel label="3｜有沒有多寫" caption="有沒有原文沒寫的事？" alt="回答說曹操打了虎牢關之戰，但大綱第 5 回只寫劉關張擊退呂布，打問號">
            <DocShape x={10} y={20} w={420} h={190} />
            <text x="34" y="62" fontSize="24" fill={quiet}>大綱 第 5 回</text>
            <text x="34" y="106" fontSize="25" fill={ink}>呂布在虎牢關迎戰，劉備、</text>
            <text x="34" y="144" fontSize="25" fill={ink}>關羽、張飛合力將他擊退</text>
            <text x="34" y="192" fontSize="24" fill={amber}>回答：曹操打「虎牢關之戰」</text>
            <AskMark x={436} y={36} />
          </CheckPanel></Step>
        </Steps>
      </div>
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={36}>三件都打勾，才放心用</Takeaway></Step></Steps>
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
    {sub ? <div style={{ fontSize: 26, color: muted, marginTop: 10 }}>{sub}</div> : null}
  </In>
);

const FlowArrow = ({ i }: { i: number }) => <In i={i} style={{ color: faint, fontSize: 64, lineHeight: 1, marginTop: 44 }}>→</In>;

const QChip = ({ children }: { children: ReactNode }) => (
  <span style={{ background: '#FFFFFF', border: `2px solid ${amber}`, borderRadius: 32, padding: '10px 26px', fontSize: 30 }}>{children}</span>
);

const CHECK_TABLE_COLS = '1fr 160px 300px';

const Practice3: Page = () => (
  <Shell chapter={3}>
    <PracticeEyebrow time="4 分鐘">練習 3｜RAG</PracticeEyebrow>
    <Heading>練習（RAG）：先核對這份回答</Heading>
    <PillRow>
      <Pill tag="定位">講師實跑的回答</Pill>
      <Pill tag="期望輸出">每列打勾或問號</Pill>
      <Pill tag="限制">只看筆記庫</Pill>
    </PillRow>
    <Fit>
      <div style={{ display: 'grid', gridTemplateColumns: '1100px 1fr', gap: 56, alignItems: 'center' }}>
        <In i={1}>
          <SmallLabel>曹操在第 1–21 回的戰役（實跑，13 項節選）</SmallLabel>
          <div style={{ marginTop: 10, borderTop: `3px solid ${rule}` }}>
            <TRow head cols={CHECK_TABLE_COLS} cells={['戰役／戰事', '回目', '檔名']} />
            <TRow cols={CHECK_TABLE_COLS} size={28} cells={['征討張繡，淯水敗退', '第 16 回', <Path size={25}>原文/第016回.txt</Path>]} />
            <TRow cols={CHECK_TABLE_COLS} size={28} cells={['圍攻壽春，擊敗袁術', '第 17 回', <Path size={25}>原文/第017回.txt</Path>]} />
            <TRow cols={CHECK_TABLE_COLS} size={28} cells={['攻張繡，遭賈詡設伏擊敗', '第 18 回', <Path size={25}>原文/第018回.txt</Path>]} />
            <TRow cols={CHECK_TABLE_COLS} size={26} cells={[<span style={{ color: quiet }}>……一共 13 項，剛才看過 2 項</span>, '', '']} />
          </div>
        </In>
        <div style={{ display: 'grid', gap: 22 }}>
          <Steps>
            <div style={{ fontSize: 31, fontWeight: 600 }}>每一列問三件事</div>
            <Step duration={STEP_MS}><StatusLine ok size={30}>檔案在嗎</StatusLine></Step>
            <Step duration={STEP_MS}><StatusLine ok size={30}>原句在嗎</StatusLine></Step>
            <Step duration={STEP_MS}><StatusLine ok size={30}>有沒有多寫</StatusLine></Step>
          </Steps>
        </div>
      </div>
      <Steps>
        <Step duration={STEP_MS}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 20, marginTop: 40 }}>
            <span style={{ fontSize: 28, color: muted }}>有時間，自己問一題：</span>
            <QChip>誰在轅門射戟？</QChip>
            <QChip>劉備怎麼離開許都？</QChip>
          </div>
        </Step>
      </Steps>
    </Fit>
  </Shell>
);

// ---------- 04 建立知識圖譜 ----------

const Section4: Page = () => <SectionPage chapter={4} label="04 / 知識圖譜" lead="點和線，每條線都要有出處" />;

// Three small maps, one per subject. Green lines: the source says so. Amber "?": it does not.
const MiniMap = ({ label, caption, alt, children }: { label: string; caption: string; alt: string; children: ReactNode }) => (
  <div style={{ background: '#FFFFFF', border: `1px solid ${rule}`, padding: '24px 28px 22px', boxSizing: 'border-box' }}>
    <SmallLabel>{label}</SmallLabel>
    <svg viewBox="0 0 464 200" style={{ display: 'block', width: '100%', height: 'auto', marginTop: 14 }} role="img" aria-label={alt}>{children}</svg>
    <div style={{ fontSize: 30, lineHeight: 1.4, marginTop: 10 }}>{caption}</div>
  </div>
);

const MapPerson = ({ x, y, name }: { x: number; y: number; name: string }) => (
  <g><circle cx={x} cy={y} r="46" fill={amberSoft} stroke={amber} strokeWidth="2" /><text x={x} y={y + 11} textAnchor="middle" fontSize="30" fill={ink}>{name}</text></g>
);

const MapBox = ({ x, y, w = 120, label, fill = surface, stroke = rule }: { x: number; y: number; w?: number; label: string; fill?: string; stroke?: string }) => (
  <g><rect x={x} y={y} width={w} height="60" fill={fill} stroke={stroke} strokeWidth="2" /><text x={x + w / 2} y={y + 41} textAnchor="middle" fontSize="30" fill={ink}>{label}</text></g>
);

const PointsLines: Page = () => (
  <Shell chapter={4}>
    <Eyebrow>知識圖譜（Knowledge Graph）</Eyebrow>
    <Heading>知識圖譜就是點和線</Heading>
    <Lead>像畫家族樹：人是點，關係是線</Lead>
    <Fit>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 36 }}>
        <Steps>
          <MiniMap label="國文｜三國" caption="人物和事件" alt="劉備、關羽連到桃園結義是綠線；曹操連到桃園結義是橘色虛線，打問號">
            <path d="M84 92 L180 138" stroke={okGreen} strokeWidth="4" />
            <path d="M380 92 L284 138" stroke={okGreen} strokeWidth="4" />
            <path d="M232 98 V136" stroke={amber} strokeWidth="4" strokeDasharray="8 6" />
            <MapPerson x={60} y={50} name="劉備" />
            <MapPerson x={232} y={50} name="曹操" />
            <MapPerson x={404} y={50} name="關羽" />
            <MapBox x={152} y={136} w={160} label="桃園結義" fill={sage} stroke={okGreen} />
            <AskMark x={262} y={116} r={18} />
          </MiniMap>
          <Step duration={STEP_MS}>
            <MiniMap label="歷史｜一個單元" caption="前因後果" alt="原因到事件是綠線，事件到結果是橘色虛線，打問號">
              <MapBox x={0} y={96} label="原因" />
              <MapBox x={172} y={96} label="事件" fill={sage} stroke={okGreen} />
              <MapBox x={344} y={96} label="結果" />
              <path d="M122 126 H170" stroke={okGreen} strokeWidth="4" />
              <path d="M294 126 H342" stroke={amber} strokeWidth="4" strokeDasharray="8 6" />
              <AskMark x={318} y={78} r={18} />
            </MiniMap>
          </Step>
          <Step duration={STEP_MS}>
            <MiniMap label="自然｜食物鏈" caption="誰吃誰" alt="草、兔子、老鷹，兩條都是綠線">
              <MapBox x={0} y={96} label="草" />
              <MapBox x={172} y={96} label="兔子" />
              <MapBox x={344} y={96} label="老鷹" />
              <path d="M122 126 H170" stroke={okGreen} strokeWidth="4" />
              <path d="M294 126 H342" stroke={okGreen} strokeWidth="4" />
            </MiniMap>
          </Step>
        </Steps>
      </div>
      <Steps>
        <Step duration={STEP_MS}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 80, marginTop: 34, fontSize: 32 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 18 }}><svg viewBox="0 0 80 20" style={{ width: 80, height: 20 }} aria-hidden="true"><path d="M2 10 H78" stroke={okGreen} strokeWidth="6" /></svg>原文有寫</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 18 }}><svg viewBox="0 0 120 44" style={{ width: 120, height: 44 }} aria-hidden="true"><path d="M2 22 H70" stroke={amber} strokeWidth="6" strokeDasharray="10 8" /><AskMark x={96} y={22} r={20} /></svg>原文沒寫</span>
          </div>
        </Step>
        <Step duration={STEP_MS}><Takeaway marginTop={26}>每條線都說得出出處</Takeaway></Step>
      </Steps>
    </Fit>
  </Shell>
);

const GraphView: Page = () => (
  <Shell chapter={4}>
    <Eyebrow>Obsidian 內建的圖</Eyebrow>
    <Heading>Obsidian 的關聯圖</Heading>
    <Fit>
      <div style={{ display: 'grid', gridTemplateColumns: '660px 1fr', gap: 80, alignItems: 'center' }}>
        <In i={0}>
          <Screenshot src={vaultGraph} aspect={1600 / 1393} width={660} caption="合併大綱後的關聯圖｜實際畫面" alt="關聯圖：中間的大點是三國演義大綱，四周一圈淡色小點是還沒有卡的人，右下一群深色點是講師的卡">
            <Steps>
              <Step duration={STEP_MS}><StepMark n={1} x={43} y={33} w={14} h={13} /></Step>
              <Step duration={STEP_MS}><StepMark n={2} x={16} y={1} w={26} h={30} /></Step>
              <Step duration={STEP_MS}><StepMark n={3} x={55} y={61} w={44} h={38} /></Step>
            </Steps>
          </Screenshot>
        </In>
        <div style={{ display: 'grid', gap: 40 }}>
          <Callout n={1} title="大圓：三國演義大綱" />
          <Callout n={2} title="淡色小點：還沒有卡" />
          <Callout n={3} title="右下一群：講師的卡" />
        </div>
      </div>
    </Fit>
  </Shell>
);

// The local-graph crop (610 × 860) drawn 600 px tall; 劉備 and 桃園結義 node centres in drawn px.
const LG_H = 600;
const LG_W = Math.round(610 * LG_H / 860);

const LocalGraph: Page = () => (
  <Shell chapter={4}>
    <Eyebrow>局部關聯圖｜一條線</Eyebrow>
    <Heading>關聯圖上的一條線從哪來</Heading>
    <Fit>
      <div style={{ display: 'grid', gridTemplateColumns: `${LG_W}px 1fr`, gap: 80, alignItems: 'center' }}>
        <In i={0}>
          <div style={{ position: 'relative', width: LG_W, height: LG_H }}>
            <Screenshot src={taoyuanGraph} aspect={610 / 860} width={LG_W} alt="劉備的局部關聯圖，放大劉備到桃園結義這一條線" />
            <svg viewBox={`0 0 ${LG_W} ${LG_H}`} style={{ position: 'absolute', inset: 0, width: LG_W, height: LG_H, overflow: 'visible' }} aria-hidden="true">
              <line x1="133" y1="57" x2="245" y2="539" stroke={amber} strokeWidth="8" strokeLinecap="round" />
              <SvgChip x={160} y={22} w={110} h={48} label="劉備" size={28} fill="#FFFFFF" stroke={amber} />
              <SvgChip x={262} y={500} w={160} h={48} label="桃園結義" size={28} fill="#FFFFFF" stroke={amber} />
            </svg>
          </div>
          <Caption>劉備的局部關聯圖｜實際畫面，橘線為標示</Caption>
        </In>
        <div>
          <Steps>
            <div style={{ fontSize: 34 }}>這條線是哪來的？</div>
            <Step duration={STEP_MS}>
              <div style={{ marginTop: 30 }}>
                <SmallLabel>人物/劉備.md 裡的這一句</SmallLabel>
                <div style={{ marginTop: 10, position: 'relative', width: 1100 }}>
                  <Screenshot src={taoyuanLine} aspect={1410 / 52} width={1100} alt="劉備卡：三人越談越投合，隔天就在張飛莊後的桃園立誓，留下著名的桃園結義" />
                  <div style={{ position: 'absolute', left: '62.4%', top: '-6%', width: '10.4%', height: '112%', border: '4px solid #E9B650' }} />
                </div>
              </div>
            </Step>
            <Step duration={STEP_MS}><Takeaway marginTop={44}>每條線，都來自卡片裡的一個 [[連結]]</Takeaway></Step>
          </Steps>
        </div>
      </div>
    </Fit>
  </Shell>
);

const AsciiAsk: Page = () => (
  <Shell chapter={4}>
    <PracticeEyebrow time="14 分鐘（三頁）">練習 4｜知識圖譜</PracticeEyebrow>
    <Heading>練習（圖譜）：畫 ASCII 關係圖</Heading>
    <PillRow>
      <Pill tag="定位">桃園、煮酒兩張卡</Pill>
      <Pill tag="期望輸出">一線一行附檔名</Pill>
      <Pill tag="限制">沒原句不畫</Pill>
    </PillRow>
    <Fit>
      <Steps>
        <Step duration={STEP_MS}>
          <Terminal title="Codex 實際回覆（2026-10-17，全文）" width={1632} size={31}>
            <div>劉備 ──結義兄弟（劉備為兄）── 關羽（來源：關係/桃園結義.md）</div>
            <div>劉備 ──結義兄弟（劉備為兄、張飛為弟）── 張飛（來源：關係/桃園結義.md）</div>
            <div>關羽 ──結義兄弟（三兄弟）── 張飛（來源：關係/桃園結義.md）</div>
            <div>曹操 ──請劉備青梅煮酒、共論天下英雄── 劉備（來源：關係/煮酒論英雄.md）</div>
            <div>曹操 ──與劉備並稱天下英雄── 劉備（來源：關係/煮酒論英雄.md）</div>
            <div>關羽 ──與張飛一同按劍守護劉備── 劉備（來源：關係/桃園結義.md）</div>
            <div>張飛 ──與關羽一同按劍守護劉備── 劉備（來源：關係/桃園結義.md）</div>
            <div>劉備 ──聯手── 孫權（來源：關係/煮酒論英雄.md）</div>
            <div>孫權 ──對抗── 曹操（來源：關係/煮酒論英雄.md）</div>
          </Terminal>
        </Step>
      </Steps>
    </Fit>
  </Shell>
);

// One row of the line-by-line check: the line, its source card, the sentence, the verdict.
const CHECK_COLS = '400px 270px 1fr 110px';

const Verdict = ({ ok }: { ok: boolean }) => (
  <svg viewBox="0 0 48 48" style={{ width: 40, height: 40, display: 'block' }} aria-hidden="true">{ok ? <OkDot x={24} y={24} r={22} /> : <AskMark x={24} y={24} r={22} />}</svg>
);

const CheckRow = ({ line, card, quote, ok }: { line: string; card: string; quote: string; ok: boolean }) => (
  <TRow cols={CHECK_COLS} size={28} tint={ok ? '#FFFFFF' : amberSoft} cells={[line, <Path size={24}>{card}</Path>, <span style={{ color: ok ? ink : amber }}>{quote}</span>, <Verdict ok={ok} />]} />
);

const CheckLines: Page = () => (
  <Shell chapter={4}>
    <PracticeEyebrow time="練習 4 第 2 步">練習 4｜逐線核對</PracticeEyebrow>
    <Heading>每條線都說得出出處</Heading>
    <Fit>
      <div style={{ fontSize: 30, marginBottom: 14 }}>同一句原句撐住的線，併成一列：<strong>9 條線 → 5 列</strong></div>
      <div style={{ borderTop: `3px solid ${rule}` }}>
        <TRow head cols={CHECK_COLS} cells={['線', '來源卡', '卡片原句', '結果']} />
        <Steps>
          <Step duration={STEP_MS}><CheckRow line="劉、關、張 結義（3 條）" card="桃園結義.md" quote="「誓畢拜劉備為兄，關羽次之，張飛為弟」" ok /></Step>
          <Step duration={STEP_MS}><CheckRow line="曹操—劉備 煮酒（2 條）" card="煮酒論英雄.md" quote="「今天下英雄，惟使君與操耳」" ok /></Step>
          <Step duration={STEP_MS}><CheckRow line="關、張 守護劉備（2 條）" card="桃園結義.md" quote="「關、張……急忙衝進後園按劍守護」" ok /></Step>
          <Step duration={STEP_MS}><CheckRow line="劉備—孫權 聯手" card="煮酒論英雄.md" quote="只順帶一句「站在孫權那一邊」" ok={false} /></Step>
          <Step duration={STEP_MS}><CheckRow line="孫權—曹操 對抗" card="煮酒論英雄.md" quote="同一句，主詞是劉備" ok={false} /></Step>
          <Step duration={STEP_MS}><div style={{ marginTop: 24, fontSize: 31 }}><strong style={{ color: amber }}>後兩條：刪掉，</strong>或改用〈赤壁之戰〉的「孫權最後決定和劉備聯手」</div></Step>
          <Step duration={STEP_MS}><div style={{ marginTop: 14, fontSize: 28, color: muted }}>講師的結果：9 條線，7 條有原句、2 條打問號。你的線數會不同，每條都對到原句就好。</div></Step>
        </Steps>
      </div>
    </Fit>
  </Shell>
);

const AddLinksBack: Page = () => (
  <Shell chapter={4}>
    <PracticeEyebrow time="練習 4 第 3 步">練習 4｜補連結</PracticeEyebrow>
    <Heading>把漏掉的連結補回大綱</Heading>
    <Fit>
      <div style={{ width: 1200, margin: '0 auto' }}>
      <In i={0}>
        <SmallLabel>補之前：「煮酒論英雄」是黑字</SmallLabel>
        <div style={{ marginTop: 10 }}>
          <Screenshot src={ch21Before} aspect={1408 / 258} width={1200} alt="大綱第 21 回內文裡的煮酒論英雄是一般黑字，沒有連結">
            <StepMark n={1} x={86.3} y={24} w={11.5} h={18} badge="right" />
          </Screenshot>
        </div>
      </In>
      <Steps>
        <Step duration={STEP_MS}>
          <div style={{ marginTop: 26 }}>
            <SmallLabel color={okGreen}>補之後：打成 [[煮酒論英雄]]</SmallLabel>
            <div style={{ marginTop: 10 }}>
              <Screenshot src={ch21After} aspect={1408 / 258} width={1200} alt="補上連結後，煮酒論英雄變成紫色連結">
                <StepMark n={2} x={86.3} y={24} w={12.8} h={19} badge="right" />
              </Screenshot>
            </div>
          </div>
        </Step>
        <Step duration={STEP_MS}><Takeaway marginTop={20}>補上 [[ ]]，大綱就接到關係卡</Takeaway></Step>
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
    <text x={x} y="200" textAnchor="middle" fontSize="33" fontWeight="600" fill={ink}>{CHAPTERS[n - 1]}</text>
    <text x={x} y="250" textAnchor="middle" fontSize="29" fill={muted}>{verb}</text>
  </g>
);

const Recap: Page = () => (
  <Shell>
    <Eyebrow>總結</Eyebrow>
    <Heading>今天做完的四件事</Heading>
    <Fit>
      <Figure h={290} label="四章：筆記庫是一個資料夾、大綱接上人物卡、查筆記附檔名、每條線有出處">
        <g fill="none" stroke={amber} strokeWidth="4"><DrawPath i={4} d="M260 90 H1372" /></g>
        <InG i={0}><RecapStop x={204} n={1} verb="筆記庫是一個資料夾" /></InG>
        <InG i={1}><RecapStop x={612} n={2} verb="大綱接上人物卡" /></InG>
        <InG i={2}><RecapStop x={1020} n={3} verb="查筆記，附檔名" /></InG>
        <InG i={3}><RecapStop x={1428} n={4} verb="每條線有出處" /></InG>
      </Figure>
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={64}>筆記寫得清楚、連得好，AI 才答得準</Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

// One stop on the lesson-3 preview: an icon in a circle, a label, and what it gives you.
const SkillStop = ({ x, n, kind, label }: { x: number; n: number; kind: IconKind; label: string }) => (
  <g>
    <circle cx={x} cy="110" r="92" fill={amberSoft} stroke={amber} strokeWidth="3" />
    <SvgIcon kind={kind} x={x} y={110} size={96} color={amber} />
    <SvgNum x={x - 70} y={40} n={n} />
    <text x={x} y="262" textAnchor="middle" fontSize="40" fontWeight="600" fill={ink}>{label}</text>
  </g>
);

const NextSkills: Page = () => (
  <Shell>
    <Eyebrow>下一堂預告</Eyebrow>
    <Heading>下一堂：用 Skill 擴充筆記庫</Heading>
    <Lead>Skill＝寫好的做事說明，像一份食譜</Lead>
    <Fit>
      <Stage h={430}>
        <Steps>
          <Layer h={430} label="第一步：把 Skill 裝進 Codex">
            <InG i={0}><SkillStop x={250} n={1} kind="down" label="裝 Skill" /></InG>
            <InG i={1}><text x="250" y="320" textAnchor="middle" fontSize="28" fill={muted}>裝進 Codex</text></InG>
          </Layer>
          <Step duration={STEP_MS}><Layer h={430} label="第二步：用 Skill 畫關係圖、改寫成好讀版">
            <g className="aw2-build" style={buildDelay(0)}><MapArrow x1={370} x2={570} y={110} hot /></g>
            <g className="aw2-build" style={buildDelay(1)}>
              <SkillStop x={816} n={2} kind="terminal" label="用 Skill" />
              <SvgChip x={646} y={300} w={340} h={54} label="畫關係圖" size={28} fill="#FFFFFF" stroke={amber} />
              <SvgChip x={646} y={366} w={340} h={54} label="改寫成好讀版" size={28} fill="#FFFFFF" stroke={amber} />
            </g>
          </Layer></Step>
          <Step duration={STEP_MS}><Layer h={430} label="第三步：自己寫一個 Skill，做三國時間軸">
            <g className="aw2-build" style={buildDelay(0)}><MapArrow x1={936} x2={1136} y={110} hot /></g>
            <g className="aw2-build" style={buildDelay(1)}>
              <SkillStop x={1382} n={3} kind="doc" label="自己寫一個" />
              <SvgChip x={1212} y={300} w={340} h={54} label="三國時間軸" size={28} fill={sage} stroke={okGreen} />
            </g>
          </Layer></Step>
        </Steps>
      </Stage>
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={24}>同一座筆記庫，下一堂會多出圖和時間軸</Takeaway></Step></Steps>
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
  title: 'aw-02 Obsidian 與 RAG',
  createdAt: '2026-10-17T03:04:26.505Z',
  theme: 'thoughtstream',
};

const deck: Page[] = [
  Cover, LastLesson, TodayGoal, Agenda,
  Section1, VaultFolder, WikiLink, Backlinks, GrayLink, CardTypes, StoryMap, LinkWalk, DownloadObsidian, FirstLaunch, GetVault, VaultCheck,
  Section2, MergeOutline, ClickLiubei, BacklinksReal, GrayReal, GrayDecide, Practice2Card,
  Section3, RagIdea, OpenInCodex, AskWithFiles, RStep, AStep, GStep, WithWithout, LinksHelp, LimitMissing, LimitMiss, CheckThree, Practice3,
  Section4, PointsLines, GraphView, LocalGraph, AsciiAsk, CheckLines, AddLinksBack,
  Recap, NextSkills,
];

// 1-based page number of a page in this deck (for the agenda).
function pageOf(page: Page) {
  return deck.indexOf(page) + 1;
}

// Speaker notes, keyed by page so they stay aligned with the deck order.
const NOTES = new Map<Page, string>([
  [Cover, `00:00–01:00
今天是四堂課的第二堂：Obsidian 與 RAG。上一堂大家用 Codex 寫出了《三國演義》第 1 到 21 回的大綱，今天把它放進一座三國筆記庫，跟講師準備好的人物卡接起來；接著請 Codex 先查筆記再回答，最後畫一張每條線都有出處的關係圖。`],
  [LastLesson, `01:00–05:00
先看上一堂的成果。左邊是講師用 Codex 實際跑出來的 三國演義大綱.md：一回一段，人名都寫成 [[劉備]] 這種連結，每段最後一行是出處。
先問大家：這些 [[ ]] 現在連到哪？按一下：哪裡都還沒連到。大綱是單獨一個檔案，旁邊沒有劉備卡，所以劉備是淡色的連結，點下去只會新增一張空白卡。
最後一下：大綱有連結了，但還沒接上人物卡。今天就是要把它放進筆記庫，接上講師準備的人物卡。
補充數字（不用記）：講師這份 21 段、每段都有出處，Codex 跑了 1 分 38 秒；當時的舊提示詞讓它連回目標題裡的人名也加了 [[ ]]，現在的提示詞已經改掉。
第一堂沒來、或大綱不見的同學，可以用講師用現在這版提示詞跑出來的範例：課程 GitHub 的 examples/aw-01-sample-output/三國演義大綱.md，下載後一樣放進筆記庫的「整理」資料夾。`],
  [TodayGoal, `05:00–08:00
左邊是第一堂結束時的樣子：大綱是一個單獨的檔案，裡面的 [[劉備]]、[[曹操]]、[[呂布]] 都是連結，但連到空處，因為還沒有那些卡。
按一下：今天結束時，大綱放進「三國人物知識庫」的「整理」資料夾，大綱裡的劉備、關羽、張飛、曹操，就連到講師寫好的人物卡；人物卡再透過〈桃園結義〉〈煮酒論英雄〉這些關係卡連在一起。
最後一下：今天四個練習，全部在這座筆記庫裡做。`],
  [Agenda, `08:00–10:00
四章、四個練習。第一章認識 Obsidian，練習 1 是安裝、改繁體中文、打開講師的三國筆記庫，10 到 45 分。第二章把大綱放進筆記庫，練習 2 是合併、找淡色連結、自己寫一張關係卡，45 到 70 分。第三章是今天的重點，在筆記庫裡做 RAG，練習 3 是每人問一題、用三件事核對，70 到 95 分。第四章建立知識圖譜，練習 4 是請 Codex 畫 ASCII 關係圖、逐線核對、把漏掉的連結補回去，95 分到結束。`],
  [Section1, `10:00–10:30
第一章：認識 Obsidian。三件事：筆記庫是什麼、連結怎麼寫、卡片分幾種。`],
  [VaultFolder, `10:30–13:00
Obsidian 的筆記庫，就是你電腦裡的一個資料夾。這座「三國人物知識庫」有 12 張卡：人物 5 張、勢力 3 張、關係 3 張，共 11 張，再加 1 張入口卡〈三國演義〉。另外的資料夾不算卡：原文/ 放第 1 到 21 回的全文和第 37、38、46 回節選，都是 .txt；整理/ 等一下放大綱；模板/ 放關係卡模板。.md 是純文字檔，用記事本也打得開。Obsidian 繁中介面把筆記庫叫「儲存庫」，是同一個東西。
按一下：Obsidian 打開這個資料夾來寫，看到的就是這些檔案。
按一下：Codex 讀的也是同一個資料夾，不用上傳到任何地方。
最後一下：檔案在你的電腦裡，Codex 也讀得到。這是今天 RAG 能做的前提。官方說明：https://obsidian.md/help/data-storage`],
  [WikiLink, `13:00–15:30
左邊是你在檔案裡打的字：「拜 [[劉備]] 為兄」，人名包在兩對中括號裡。
按一下：Obsidian 顯示時，中括號會藏起來，劉備變成紫色、有底線的字。
按一下：點一下劉備，就打開 人物/劉備.md。打 [[ 的時候 Obsidian 會跳出選單讓你選卡名，不用整個打完。
最後一下：人名打在 [[ ]] 裡，就連到那張卡。官方說明：https://obsidian.md/help/links`],
  [Backlinks, `15:30–18:00
中間是劉備。旁邊這幾張卡：三國演義、桃園結義、煮酒論英雄、赤壁之戰、曹操、蜀漢，內文都寫了 [[劉備]]，箭頭都指向他。
按一下：打開劉備卡，右邊的「反向連結」面板會自動列出「已連結本筆記的檔案」。講師的筆記庫裡一共 11 張卡、17 處提到劉備：三國演義 4 處，桃園結義、煮酒論英雄、赤壁之戰各 2 處，曹操 1 處，還有孫權、張飛、關羽、蜀漢、曹魏、東吳 6 張各 1 處。這些數字是講師在筆記庫裡實際數的。
最後一下：誰連到劉備，Obsidian 會自己列出來，你不用回頭在劉備卡裡寫。這就是「雙向」的意思：你只寫一邊，兩邊都看得到。`],
  [GrayLink, `18:00–20:00
上面：[[劉備]] 有對應的卡，所以是深紫色，點了就打開。
按一下：[[呂布]] 寫了連結，可是資料夾裡沒有 呂布.md，Obsidian 會把它顯示成比較淡的紫色。課綱寫「灰色」，實際畫面是淡紫色，第二章會看到真的畫面。
按一下：點淡色連結，Obsidian 會幫你新建一張空白的 呂布.md。不想新建就先別點。
按一下：顏色淡，代表資料夾裡還沒有這張卡，不一定是打錯字。
最後一下：投影或螢幕上分不出深淺的時候，用另一個方法確認：按 Cmd+O（Windows 是 Ctrl+O）打開快速切換，輸入名字，找不到這個檔，就是還沒有卡。`],
  [CardTypes, `20:00–22:30
三國筆記庫的卡分三種。最上面是入口卡〈三國演義〉，從它可以連到每一張卡。
人物卡 5 張：劉備、關羽、張飛、曹操、孫權，一張寫一個人。
按一下：勢力卡 3 張：蜀漢、曹魏、東吳，一張寫一方陣營。
按一下：關係卡 3 張：桃園結義、煮酒論英雄、赤壁之戰，一張寫一件事：誰和誰、在第幾回、發生什麼事。
按一下：算一下：三種共 11 張，加入口卡〈三國演義〉一共 12 張。原文、整理、模板這三個資料夾裡的東西不算卡。
最後一下：人物之間，靠關係卡接起來。三張關係卡最上面已經有「回目」欄位，〈桃園結義〉還寫了年份「中平元年」；模板/ 裡有一份關係卡模板，第三堂排時間軸會用到這兩個欄位。`],
  [StoryMap, `22:30–26:00
上排五個人物。按一下：〈桃園結義〉接到關羽、張飛、劉備，第 1 回。按一下：〈煮酒論英雄〉接到劉備和曹操，第 21 回。按一下：〈赤壁之戰〉接到曹操和孫權，第 49 到 50 回。
最後一下：劉備、曹操外面多一圈，各接了兩段故事。圖上只畫每段故事最核心的人；卡片正文其實連到更多人，例如〈赤壁之戰〉也連到劉備、關羽、張飛。
小說出處：https://zh.wikisource.org/wiki/三國演義/第001回 、https://zh.wikisource.org/wiki/三國演義/第021回 、https://zh.wikisource.org/wiki/三國演義/第049回`],
  [LinkWalk, `26:00–30:00
沿連結讀，像坐捷運。第一站〈劉備〉，卡裡有 [[桃園結義]]。按一下：點進去，到〈桃園結義〉，這張關係卡寫著第 1 回三人結為兄弟。按一下：再點卡裡的 [[關羽]]，到下一張人物卡。
按一下：走回來有兩種方法：按左上角的 ← 回到上一張；或在〈關羽〉打開反向連結，會看到〈桃園結義〉連到他，點它就回去。
最後一下：走得過去，也走得回來，這就是雙向連結。等一下打開筆記庫，大家自己點點看。接下來是練習 1，裝好 Obsidian。`],
  [DownloadObsidian, `30:00–33:00
練習 1，三頁，一共 15 分鐘。第一步：打開 obsidian.md/download。網頁會自己判斷系統，Windows 顯示 Download for Windows，Mac 顯示 Download for macOS；沒看到就往下捲，在自己的系統那一列按 Universal。
按一下：按紫色的下載鈕。按一下：照畫面安裝。Windows 打開安裝檔按下一步；Mac 打開 .dmg，把 Obsidian 拖進「應用程式」。Obsidian 免費，不用註冊。上一堂結束時已經請大家先下載，裝好的人直接看下一頁。官方說明：https://obsidian.md/help/install`],
  [FirstLaunch, `33:00–36:00
第一次打開會看到這個畫面。標 1 的地方在最下面：語言選單選「繁體中文」，介面會重新整理。
按一下：標 2 的地方，三個選項裡，今天用第二個「開啟資料夾為儲存庫」。現在先不要按「建立新的儲存庫」，下一頁下載完教材再按。官方說明：https://obsidian.md/help/User+interface/Language+settings`],
  [GetVault, `36:00–41:00
用電腦下載教材，手機掃 QR code 只會存到手機。按鈕和 QR code 連到同一份 ZIP：
${VAULT_ZIP_URL}
1 下載 ZIP。2 解壓縮：Windows 一定要在 ZIP 上按右鍵選「全部解壓縮」，直接雙擊只是預覽，Obsidian 打不開；解壓縮後外面可能多一層同名資料夾，往裡面點一層。Mac 雙擊就會解開。3 回到 Obsidian，按「開啟資料夾為儲存庫」，選「三國人物知識庫」這一層，不要選外層的下載資料夾。第一次打開可能會問要不要信任這個儲存庫的外掛，選信任即可，這份教材沒有裝第三方外掛。`],
  [VaultCheck, `41:00–45:00
這是講師電腦上的實際畫面。先看左邊：打開對的資料夾，左側會看到六個資料夾：人物、勢力、原文、整理、模板、關係，最下面是入口卡〈三國演義〉。看到這樣，練習 1 就完成了。
按一下：如果左邊只看到一個叫「三國人物知識庫」的資料夾，代表你打開的是外面那一層。Windows 的「全部解壓縮」常會多包一層同名資料夾。
按一下：解法：在左下角的儲存庫名稱點一下，選「管理儲存庫」，重新「開啟資料夾為儲存庫」，這次選裡面那個「三國人物知識庫」。
還有時間的人，打開〈桃園結義〉，點幾個紫色人名逛逛。`],
  [Section2, `45:00–45:30
第二章：把第一堂的大綱放進筆記庫，跟講師的人物卡接起來。這一整章都是練習 2。`],
  [MergeOutline, `45:30–50:00
練習 2 第一步，3 分鐘。左邊是第一堂的 aw-01-lab 資料夾，裡面有大家寫好的 三國演義大綱.md。
按一下：只要搬這一個檔，拖進「三國人物知識庫」的「整理」資料夾。可以在檔案總管（Mac 是 Finder）裡拖，也可以直接拖到 Obsidian 左側的「整理」上。旁邊的「人物」資料夾是講師的卡，不用動。
按一下：大綱第 1 回裡寫的是 [[劉備]]，人物資料夾裡剛好有 劉備.md，所以這個連結自己就接上了，不用改任何字。
最後一下：只搬一個檔，連結自己會接上。
補充，給好奇的同學：如果有人第一堂另外讓 Codex 寫了自己的 劉備.md，這次先不要放進來。同一個筆記庫裡有兩張都叫劉備的卡，[[劉備]] 只會連到其中一張，另一張就沒人連得到。
另外：大綱每段最後的「出處：原文/第001回.txt」，在這座筆記庫裡也找得到。原文/ 已經放了第 1 到 21 回的全文，跟第一堂的檔案一樣，所以出處點得開、核對得到，不用從第一堂的資料夾複製。`],
  [ClickLiubei, `50:00–52:30
左邊是講師電腦上合併後的實際畫面：整理/三國演義大綱。標 1 是第 1 回裡的劉備，深紫色，代表找得到卡。
按一下、再按一下：點它，就打開右邊這張講師的人物卡 人物/劉備。
最後一下：大綱和人物卡接上了。請大家自己點一次，點不過去的，檢查大綱是不是放在「三國人物知識庫」裡面，而不是旁邊。`],
  [BacklinksReal, `52:30–54:30
左邊是劉備卡右側的反向連結面板，實際畫面。先說清楚這裡的數字：它算的是「劉備被提到幾處」，不是卡片有幾張。大綱放進來之前，筆記庫裡有 17 處提到劉備，放進來之後會變幾處？
按一下，標 1：「已連結本筆記的檔案」變成 41。按一下，標 2：其中 24 處來自三國演義大綱。
大綱一放進來，劉備卡就自動多了 24 條反向連結，大綱裡寫到劉備的每一回都列在這裡，點了就跳回大綱那一段。你沒有改劉備卡，它自己變豐富了。`],
  [GrayReal, `54:30–57:00
練習 2 第二步，2 分鐘：在大綱裡找淡色連結。上面是講師電腦上大綱第 1 回的實際畫面。先問大家：哪些名字已經有卡？
按一下，標 1：劉備是深紫色，代表筆記庫裡有 劉備.md，點了會打開。關羽、張飛、曹操也一樣。
按一下，標 2：董卓是淡紫色，代表還沒有這張卡，點了 Obsidian 會幫你新增一張空白卡。同一行的張角、張寶、張梁也是淡的。
按一下：講師這份大綱一共連了 74 個不同的名字，深紫的只有 4 個：劉備、關羽、張飛、曹操；淡紫的有 70 個。孫權在第 1 到 21 回還沒出場，所以大綱裡沒有他。
每個人的大綱數字會不一樣，請大家自己捲一捲。有些人會看到第 2、3 回的回目標題裡，人名也變成連結，那是第一堂舊版提示詞的小毛病，現在的提示詞已經改掉，不影響今天的練習。`],
  [GrayDecide, `57:00–61:00
練習 2 第三步，5 分鐘：淡色連結怎麼處理。
左邊是講師的大綱裡出現最多次、還沒有卡的人：呂布 32 次、董卓 15 次、袁術 11 次、李傕 9 次、郭汜和袁紹各 7 次。右邊三種處理方式，一次一個：
按一下：常出現、而且原文夠寫的，補一張卡。判斷看兩件事：出現幾次，和原文有沒有足夠的段落寫出一張有根據的卡。呂布出現 32 次，第 5 回三英戰呂布、第 19 回白門樓都有完整的故事，是好人選；今天先不寫，第三堂用 Skill 照原文補。
按一下：寫成別名的，改成已有的卡名。例如有人的大綱寫了 [[玄德]]，改成 [[劉備]] 就接上了。講師這份沒有別名，因為第一堂的提示詞要求一律用本名，大家的可能會有，請找找看。
按一下：只出現一兩次的，先留著。淡色連結不會壞，之後補卡就自動變深色。
請每個人在自己的大綱裡挑一個處理：改一個別名，或記下最想補卡的人。`],
  [Practice2Card, `61:00–70:00
練習 2 最後一步，9 分鐘：自己寫一張關係卡。條件在上面三個框：定位，從大綱挑一回；期望輸出，照模板寫；限制，原文沒寫的不寫。至少連到兩位有卡的人物。
左邊是講師照模板寫的〈三英戰呂布〉，取材第 5 回，是 Obsidian 實際畫面的節選。模板在筆記庫的 模板/關係卡模板.md，一張卡至少要有這幾樣：最上面的「回目」（原文有寫年份才填「年份」）、用完整句子寫的內容、「參與人物」、最後一行「出處」。
按一下，1：在左側「關係」資料夾按右鍵，選「新增筆記」，取名就是事件名稱，再把模板的內容複製貼上。
按一下，2：寫到有卡的人名，前後加兩對中括號，例如 [[劉備]]。打完 [[ 和第一個字，Obsidian 會跳出選單，選人名按 Enter。看範例：紫框的張飛加了 [[ ]]，變成連結；參與人物裡的呂布底下畫虛線，他還沒有卡，照模板寫純文字。
按一下，3：填上回目，例如 5；最後一行寫出處，例如「出處：原文/第005回.txt」。這個檔就在筆記庫的 原文/ 裡。
請挑範例以外的事件，不要寫三英戰呂布和白門樓：第三堂會請 Codex 新增〈三英戰呂布〉和〈白門樓〉兩張關係卡，自己手寫的同名卡會撞名。可以挑：第 5 回〈溫酒斬華雄〉，連到關羽和曹操；第 16 回〈轅門射戟〉，連到劉備（呂布寫純文字）；第 8 回〈連環計〉。不確定細節，就打開 原文/ 裡那一回的全文找。寫完打開自己的卡，看右邊的反向連結和關聯圖有沒有多一條線。`],
  [Section3, `70:00–70:30
第三章是今天的重點：在筆記庫裡做 RAG。第一堂講過，Web Search 是 RAG，資料從網路來；今天資料從自己的筆記庫來。`],
  [RagIdea, `70:30–73:00
RAG 是 Retrieval-Augmented Generation，檢索增強生成。三步：
R 檢索：問「依這座筆記庫，曹操參與哪場戰役？」，先在筆記庫裡把相關的卡找出來，例如〈曹操〉和〈赤壁之戰〉。問題加上「依這座筆記庫」，是把範圍限定在我們的卡；曹操卡裡寫到的戰役是赤壁之戰。
按一下，A 增強：把問題和找到的內容一起交給模型，題目多了依據。
按一下，G 生成：照筆記回答，並附上檔名。
最後一下：模型沒變，只是先看了筆記。接下來用 Codex 實際跑一次，三個字母各看一頁，每一頁都對照 Codex 真的做了什麼。來源：https://arxiv.org/abs/2005.11401`],
  [OpenInCodex, `73:00–75:00
打開終端機（Windows 是 PowerShell）。打 cd 和一個空格，把「三國人物知識庫」資料夾拖進視窗，按 Enter。
按一下：打 codex。按一下：在 Codex 裡輸入 /status。按一下：看 Directory 那一行，結尾要是「三國人物知識庫」。不是的話，輸入 /quit 離開，重新 cd。路徑是示意，每台電腦不一樣。
第一次在這個資料夾開 Codex，會問你信不信任這個資料夾，選 Yes, continue，跟第一堂一樣。`],
  [AskWithFiles, `75:00–76:30
講師先示範，同一題貫穿整章。在 Codex 輸入這一整段，這就是講師實跑時用的提示詞：
「依這座筆記庫，曹操參與哪場戰役？只根據 .md 卡片回答，每個說法附上檔名和一句卡片原句；筆記沒寫的就說找不到，不要自己補。」
一次一行：第一行是問題，先把範圍說在前面。按一下：只根據 .md 卡片。按一下：附檔名，再加一句原句，等一下核對比較快。按一下：沒寫就說找不到。
最後一下：附了檔名和原句，才查得回去。接下來三頁，是這一題在講師電腦上的實跑紀錄（2026-10-18，Codex 0.154.0，模型 gpt-5.6-luna，唯讀模式，筆記庫已經放進大綱）。`],
  [RStep, `76:30–78:30
R，檢索。上面這行是 Codex 實際執行的搜尋指令：rg 是一個搜尋工具，意思是在所有 .md 檔裡找「曹操、戰役、戰爭、之戰、大戰」這幾個詞。在 Codex 的畫面上會顯示成「Ran ……」或「Explored」。
按一下，第一階段，搜尋：找到 14 個檔、77 行有對到。最多的是大綱 26 行；練習提示詞 7 行，因為裡面也有曹操這題。這點值得停一下：放在筆記庫裡的任何檔案，連練習用的提示詞都會被搜到、拿來當證據，所以核對時要看每一句引文是從哪個檔來的；煮酒論英雄 6 行；赤壁之戰、曹操、曹魏各 5 行；其他 8 個檔一共 23 行，圖上把曹魏和這 8 個檔併成「其他 9 個檔」28 行。
按一下，第二階段，它有沒有再打開整張卡來讀？實跑紀錄裡沒有：搜尋完它就直接回答了，用的只是這 77 行。
最後一下：它讀的是搜到的句子，不是整張卡。所以卡片裡的句子寫得完整、關鍵詞寫清楚，比較容易被搜到。搜尋到不等於讀過，核對時要記得這一點。`],
  [AStep, `78:30–80:00
A，增強。左邊是搜尋找到的句子，這裡挑 77 行裡的 4 行給大家看，前面是檔名和行號：曹操卡第 11 行、赤壁之戰卡第 13 行和第 19 行、大綱第 44 行。
按一下：這些句子和問題放進同一份輸入，送進模型。實跑紀錄顯示這一輪輸入 44,156 個 token，裡面包含 Codex 自己的說明，不全是筆記。
按一下：回答真正引用的，是打勾的兩句：曹操卡第 11 行，和赤壁之戰卡第 19 行的「參與人物」。
最後一下：問題加上筆記，模型才有根據。`],
  [GStep, `80:00–82:00
G，生成。左邊是 Codex 的實際回答，只調整了換行：「曹操參與的戰役是：赤壁之戰。」接著兩個檔名，各附一句原句：人物/曹操.md 的「第 49 至 50 回曹操率大軍南下，在 [[赤壁之戰]] 被 [[孫權]] 麾下的周瑜火燒戰船……」，關係/赤壁之戰.md 的「參與人物：[[孫權]]、[[曹操]]、[[劉備]]、[[關羽]]、[[張飛]]」。最後一句是「筆記中找不到曹操參與其他戰役的明確記載」，這句等一下限制那頁會再看。
按一下：打開人物/曹操.md，這一句就在第 4 段。按一下：打開關係/赤壁之戰.md，最後一行就是參與人物。
最後一下：檔名加一句原句，一找就到，這就是為什麼提示詞要它附原句。`],
  [WithWithout, `82:00–84:30
同一個問題，問兩次，都是實跑，兩次的提示詞原文都在畫面上。左邊：在一個空資料夾裡問 Codex「曹操參與哪場戰役？」，只有問題本身。它憑記憶回答：官渡之戰（200 年）、赤壁之戰（208 年）、濮陽、下邳、潼關之戰等，最後還補一句「若題目只問一場，通常答案是赤壁之戰」。沒有檔名，你沒辦法回去查。課綱說用 ChatGPT 比，也可以：在 ChatGPT 不開搜尋問同一題，結果很像。
按一下：右邊是在筆記庫裡問，回答赤壁之戰，附兩個檔名和原句，每一句都查得到。
按一下：要老實說，兩次問法不一樣：右邊多了「依這座筆記庫」、附檔名和原句、找不到就說的要求。差別一半來自筆記，一半來自問法。
最後一下：左邊說的「官渡之戰」，筆記庫裡一個字都沒有。它不一定錯，官渡之戰確實有，但它不是從我們的筆記來的，查不回去。`],
  [LinksHelp, `84:30–86:30
連結有什麼用？先老實說：實跑時 Codex 是用搜尋找到這些句子，紀錄裡看不到它沿著 [[連結]] 一張一張點過去。連結真正幫上忙的地方，是你查證的時候。
1：回答寫了 人物/曹操.md。按一下，2：打開它，那一句裡的「赤壁之戰」是紫色連結。按一下，3：點下去，就跳到〈赤壁之戰〉這張關係卡，最上面寫著回目 49，第一句就是「曹操收服北方後率大軍南下」。
最後一下：答案有檔名，連結讓它有路可回。卡片連得越完整，你從一個答案查回原句、再查到相關的卡就越快。`],
  [LimitMissing, `86:30–88:00
RAG 的限制一：筆記沒寫的，它找不到。上面是實跑的提示詞原文：「官渡之戰是誰打贏的？請只根據這個筆記庫裡的 .md 卡片回答，附上檔名；筆記沒寫的就說找不到，不要自己補。」它搜尋「官渡、袁紹、曹操」，沒有任何卡提到官渡。
按一下：它的回答是「找不到。筆記庫中的 .md 卡片沒有提到「官渡之戰」或其勝負。」
最後一下：說找不到，是好的回答。剛才空資料夾那一次，它說官渡是曹操最有名的戰役；有了「找不到就說找不到」這條限制，它就不會拿記憶來補。官渡之戰在第 30 回，不在我們第 1 到 21 回的大綱裡。`],
  [LimitMiss, `88:00–90:00
限制二：資料一多，它也會看漏。左邊是剛才那一題的第一次回答：赤壁之戰，還說「筆記中找不到曹操參與其他戰役的明確記載」。可是 R 那一頁看到，大綱裡搜到 26 行，寫了濮陽、兗州、淯水、下邳好幾場仗，它都沒算進去。原因可能是它把問題理解成「最有名的一場」，或結果太多只挑了講師的卡。
按一下：縮小範圍再問一次，實跑提示詞：「再查 整理/三國演義大綱.md：曹操在第 1 到 21 回參與了哪些戰役？每一項附回目和檔名；筆記沒寫的不要補。」黃色標起來的是多加的範圍。這次它整份大綱讀完，列了 13 項，例如第 11 回濮陽之戰、第 16 回淯水敗退、第 19 回下邳之戰。這一次是在同一份大綱上跑的（前一天的筆記庫副本，大綱內容一樣）。
最後一下：改的是範圍：查哪個檔、哪幾回。可是這 13 項也要核對，下一頁就用它來示範。`],
  [CheckThree, `90:00–91:00
核對回答的三件事，用剛才那份 13 項的回答示範。
1 檔案在嗎：它每一項的檔名寫的是「原文/第011回.txt」這種，是從大綱的出處抄來的。打開筆記庫的 原文/ 資料夾，第 1 到 21 回都在，第011回.txt 找得到，打勾。如果回答裡出現資料夾裡沒有的檔名，例如它寫成第 30 回，那就是第一個要抓的問題。
按一下，2 原句在嗎：「濮陽之戰，與呂布交戰」，大綱第 11 回寫了「呂布趁曹操外出攻打濮陽……曹操用計收復濮陽」，打勾。
按一下，3 有沒有多寫：它列了「虎牢關之戰」，但大綱第 5 回只寫「呂布在虎牢關迎戰，劉備、關羽、張飛合力將他擊退」，沒寫曹操上陣，這就是多寫了。
最後一下：三件都打勾，才放心用。`],
  [Practice3, `91:00–95:00
練習 3，4 分鐘。先不要自己出題，先核對一份現成的回答：剛才「縮小範圍再問」的實跑結果，一共 13 項，剛才示範過 2 項（第 11 回濮陽、第 5 回虎牢關），請核對其他幾項，例如畫面上的第 16、17、18 回。打開筆記庫的 整理/三國演義大綱.md 對照那一回，必要時再開 原文/ 裡的全文。
按一下、再按一下、再按一下：每一列問三件事：檔案在嗎、原句在嗎、有沒有多寫。
最後一下：有時間的人，再自己問一題，例如「誰在轅門射戟？」（第 16 回）、「劉備怎麼離開許都？」（第 21 回），一樣用這三件事核對。
請兩位分享：有沒有抓到它多寫或看漏的地方。

這份「先核對這份回答」放在筆記庫外面：examples/aw-02-check/先核對這份回答.md（筆記庫裡的 整理/練習提示詞.md 只留一行指引）。放在外面，是因為筆記庫裡的任何檔案都可能被 Codex 搜到、當成證據引用，這份答案如果放在庫裡，會被它自己找回來。內容如下：
---
## 練習 3：先核對這份回答

提問（實跑）：
再查 整理/三國演義大綱.md：曹操在第 1 到 21 回參與了哪些戰役？每一項附回目和檔名；筆記沒寫的不要補。

Codex 的回答（2026-10-17 實跑，原文照錄）：
| 戰役／戰事 | 回目 | 檔名 |
|---|---|---|
| 討伐董卓，聯軍進逼洛陽、虎牢關之戰 | 第 5 回 | 原文/第005回.txt |
| 追擊董卓，滎陽敗於徐榮 | 第 6 回 | 原文/第006回.txt |
| 討伐青州黃巾 | 第 10 回 | 原文/第010回.txt |
| 攻打陶謙 | 第 10 回 | 原文/第010回.txt |
| 濮陽之戰，與呂布交戰 | 第 11 回 | 原文/第011回.txt |
| 兗州之戰，與呂布交戰 | 第 12 回 | 原文/第012回.txt |
| 擊敗李傕、郭汜，迎接獻帝 | 第 14 回 | 原文/第014回.txt |
| 征討張繡，淯水敗退 | 第 16 回 | 原文/第016回.txt |
| 圍攻壽春，擊敗袁術 | 第 17 回 | 原文/第017回.txt |
| 再度討伐張繡 | 第 17 回 | 原文/第017回.txt |
| 攻張繡，遭賈詡設伏擊敗 | 第 18 回 | 原文/第018回.txt |
| 擊破劉表、張繡追兵 | 第 18 回 | 原文/第018回.txt |
| 攻打呂布、下邳之戰 | 第 19 回 | 原文/第019回.txt |
（原回答的回目欄還附了完整回目名稱，這裡省略。）

每一列核對三件事：1 檔名在 原文/ 裡找得到嗎？2 大綱那一回真的寫了這件事嗎？3 有沒有大綱沒寫的內容？
提示：第 5 回那一列，大綱只寫呂布在虎牢關迎戰劉備、關羽、張飛，沒寫曹操上陣。
---`],
  [Section4, `95:00–95:30
第四章：建立知識圖譜。知識圖譜聽起來很大，其實就是點和線，重點是每條線都要說得出出處。`],
  [PointsLines, `95:30–98:00
知識圖譜就是點和線。國文：劉備、關羽連到桃園結義，兩條綠線；曹操連到桃園結義那條是橘色虛線加問號，因為原文沒寫曹操參加結義。
按一下，歷史：原因到事件是綠線，事件到結果打問號，代表要回課本確認。按一下，自然：草、兔子、老鷹的食物鏈，兩條都有課本根據。
按一下：顏色規則。綠線：原文有寫。橘色虛線加問號：原文沒寫，要回去查。今天剩下的頁面都照這個規則。
最後一下：每條線都說得出出處。`],
  [GraphView, `98:00–100:00
Obsidian 內建關聯圖：按左側工具列的關聯圖圖示，或按 Ctrl+G（Mac 是 Cmd+G）。這是講師電腦上合併大綱後的實際畫面。
按一下，標 1：中間的大圓是三國演義大綱，連出去最多線。按一下，標 2：四周一圈淡色小點，就是剛才那 70 個還沒有卡的名字。按一下，標 3：右下一群深色點，是講師的人物、勢力、關係卡，彼此連得很密。
大綱和講師的卡之間，只靠劉備、關羽、張飛、曹操這幾條線接著。等一下補連結，這兩群會接得更緊。`],
  [LocalGraph, `100:00–101:30
整張關聯圖太密，換個方式看：只看一條線。左邊是劉備的局部關聯圖，實際畫面放大；打開劉備卡，在右上角「⋯」選單或命令選擇器（Ctrl/Cmd+P）找「局部關聯圖」。橘色那條是講師加的標示，就是劉備到〈桃園結義〉的線。
先問：這條線是哪來的？按一下：劉備卡裡有一句「三人越談越投合，隔天就在張飛莊後的桃園立誓，留下著名的 [[桃園結義]]」，框起來的就是那個連結。
最後一下：每條線，都來自卡片裡的一個 [[連結]]。想知道一條線為什麼存在，就回卡片找那個連結和它所在的句子。`],
  [AsciiAsk, `101:30–105:00
練習 4，三頁一共 14 分鐘。先請 Codex 畫 ASCII 關係圖，ASCII 就是純文字畫的圖。完整提示詞：
「請把〈桃園結義〉〈煮酒論英雄〉相關的人物畫成 ASCII 關係圖。
每條線一行，格式：人物 ──關係── 人物（來源：檔名）。
只畫卡片裡寫得出原句的線，不要改任何檔案。」
三個框就是這段的重點：定位兩張卡、一線一行附檔名、沒原句不畫。
按一下：講師實跑的回覆，全文 9 條線，沒有刪改。請先數一數你自己的有幾條，你的數字會不一樣。下一頁一條一條核對。
補充：講師另外試過不限格式的版本，它畫成一大張框線圖，劉備出現兩次，很難核對；所以提示詞才要求一線一行。`],
  [CheckLines, `105:00–110:00
逐線核對：打開來源卡，找原句。先說怎麼併：同一句原句撐住的線，併成一列，所以 9 條線變成 5 列。
按一下：劉關張結義 3 條線，都靠〈桃園結義〉的「誓畢拜劉備為兄，關羽次之，張飛為弟」，打勾。
按一下：曹操和劉備 2 條，都靠〈煮酒論英雄〉曹操說的「今天下英雄，惟使君與操耳」，打勾。
按一下：關張守護劉備 2 條，靠〈桃園結義〉的「關、張聽說大哥被帶走，急忙衝進後園按劍守護」，打勾。
按一下：劉備和孫權「聯手」，它說來源是〈煮酒論英雄〉，可是這張卡只在最後順帶一句「到了赤壁之戰，劉備已經站在孫權那一邊對抗曹操」，沒寫聯手的經過，打問號。
按一下：孫權和曹操「對抗」，同一句，主詞是劉備，打問號。
按一下：後兩條刪掉；或者改用〈赤壁之戰〉卡裡寫清楚的那句「孫權最後決定和劉備聯手」，來源改成 關係/赤壁之戰.md。這兩條本來也超出〈桃園結義〉〈煮酒論英雄〉的範圍。
最後一下：講師的結果是 9 條線、7 條有原句、2 條打問號。大家拿自己的圖，照這張表一條一條核對；線數不同沒關係，重點是每條都對到一句原句。`],
  [AddLinksBack, `110:00–115:00
練習 4 最後一步：把漏掉的連結補回大綱。核對時會發現：〈煮酒論英雄〉明明有卡，可是大綱第 21 回寫的是黑字「煮酒論英雄」，沒有連結，所以關聯圖上大綱和這張卡沒接上。上面是補之前的實際畫面，標 1。
按一下：在大綱裡改成 [[煮酒論英雄]]，標 2，變成紫色連結。第 1 回的「三人在桃園結義」也一樣，改成 [[桃園結義]]。
最後一下：補上 [[ ]]，大綱就接到關係卡，回去看關聯圖，大綱和講師那群卡之間會多出線來。剛才核對時發現的其他漏掉的連結，也用同樣方法補。`],
  [Recap, `115:00–118:00
回顧四件事。一，筆記庫就是一個資料夾，Obsidian 和 Codex 讀同一份。二，大綱放進整理資料夾，[[劉備]] 接上講師的人物卡，淡色連結決定要補卡、改名還是先留著。三，RAG：先查筆記再回答，要求附檔名，用三件事核對：檔案在嗎、原句在嗎、有沒有多寫。四，知識圖譜是點和線，每條線都要找得到原句，找不到就刪。
最後一下：筆記寫得清楚、連得好，AI 才答得準。`],
  [NextSkills, `118:00–120:00
下一堂講 Skill。Skill 就是一份寫好的做事說明，像食譜：照著做，每次的做法都一樣。
第一步，把 Skill 裝進 Codex。
按一下：第二步，用 Skill 做事。今天會預告兩個：diagram-design 畫關係圖，第一次用它會先問你要哪種樣式，選 1；eli5 把卡片改寫成好讀的版本。
按一下：第三步，大家自己寫一個 Skill，用它把三國的事件排成時間軸。
最後一下：同一座筆記庫，下一堂會多出圖和時間軸，今天的筆記庫請留著。
課前請大家先註冊 GitHub 和 Vercel，第四堂發布網站要用，避免現場一起註冊卡在 email 驗證。`],
]);

export const notes: (string | undefined)[] = deck.map(page => NOTES.get(page));

export default deck satisfies Page[];
