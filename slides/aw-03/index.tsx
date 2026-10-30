import type { DesignSystem, Page, SlideMeta, SlideTransition } from '@open-slide/core';
import { Step, Steps, useIsActivePage, useSlidePageNumber } from '@open-slide/core';
import type { CSSProperties, ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';
import ddResult from './assets/diagram-design-result.png';
import dgHtmlTest from './assets/digital-garden-html-test.png';
import timelineFirstRun from './assets/timeline-first-run.png';
import tlDiagram from './assets/timeline-diagram-design.png';
import tlArchify from './assets/timeline-archify.png';
import tlInstructor from './assets/timeline-instructor.png';
import timelineFixed from './assets/timeline-fixed.png';
import promptsQr from './assets/prompts-qr.svg';

// Where students copy every prompt from (opened on their laptop, not typed off the projector).
const PROMPTS_URL = 'https://github.com/Chrouos/AI-workshop-slides/blob/main/examples/aw-03-lab/prompts.md';
const LAB_URL = 'https://github.com/Chrouos/AI-workshop-slides/tree/main/examples/aw-03-lab';
const LAB_ZIP_URL = 'https://raw.githubusercontent.com/Chrouos/AI-workshop-slides/main/examples/aw-03-lab.zip';
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

// A full link to copy sits on its own line under the footer rule, so it never takes room from the page.
const FooterUrl = ({ href, children }: { href: string; children?: ReactNode }) => (
  <a href={href} target="_blank" rel="noreferrer" style={{ position: 'absolute', left: 144, bottom: 18, fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', fontSize: 22, lineHeight: '26px', color: amber, textDecoration: 'underline', textUnderlineOffset: 3, whiteSpace: 'nowrap' }}>{children ?? href}</a>
);

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
  <>
  <a href={PROMPTS_URL} target="_blank" rel="noreferrer" style={{ position: 'absolute', top: 176, right: 144, display: 'flex', alignItems: 'center', gap: 18, color: muted, textDecoration: 'none' }}>
    <span style={{ textAlign: 'right', fontSize: 24, lineHeight: 1.4 }}>複製提示詞<br /><strong style={{ color: amber, fontFamily: mono }}>prompts.md</strong> 練習 {step}</span>
    <img src={promptsQr} alt="prompts.md 的 QR code" style={{ width: 120, height: 120, display: 'block', background: '#FFFFFF', border: `1px solid ${rule}`, padding: 5 }} />
  </a>
    <FooterUrl href={PROMPTS_URL} />
  </>
);

// The five chapters of the lesson. Pages inside a chapter show where we are.
const CHAPTERS = ['什麼是 Skill', '安裝熱門 Skill', '用 Skill 做好讀的筆記', '寫自己的 Skill'];
type Chapter = 1 | 2 | 3 | 4;

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
  <span style={{ flex: '0 0 auto', width: size, height: size, borderRadius: size / 2, background: amber, color: '#FFFFFF', display: 'grid', placeItems: 'center', fontSize: Math.max(24, Math.round(size * 0.57)), fontWeight: 600 }}>{n}</span>
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
      <span style={{ fontFamily: mono, color: '#BCC3CC', fontSize: 24, marginLeft: 16 }}>{title}</span>
    </div>
    <div style={{ padding: '28px 38px 34px', fontFamily: mono, fontSize: 29, lineHeight: 1.6, whiteSpace: 'pre' }}>{children}</div>
  </div>
);
const Typed = ({ children }: { children: ReactNode }) => <span style={{ color: '#8DD4A0' }}>{children}</span>;
const AskLine = ({ children }: { children: ReactNode }) => <span style={{ color: '#E9B650' }}>{children}</span>;
const Dim = ({ children }: { children: ReactNode }) => <span style={{ color: '#BCC3CC' }}>{children}</span>;

const Caption = ({ children }: { children: ReactNode }) => (
  <div style={{ fontSize: 24, lineHeight: 1.4, color: quiet, marginTop: 12 }}>{children}</div>
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
const RegionMark = ({ x, y, w, h, n, i = 0, badge = 'left', step }: { x: number; y: number; w: number; h: number; n?: number; i?: number; badge?: 'left' | 'right' | 'top'; step?: boolean }) => {
  const live = useIsActivePage();
  const enter = !step && live;
  return (
    <div className={step ? 'aw3-build' : enter ? 'aw3-in' : undefined} style={{ position: 'absolute', left: `${x}%`, top: `${y}%`, width: `${w}%`, height: `${h}%`, border: '4px solid #E9B650', boxSizing: 'border-box', ...(step ? buildDelay(1) : {}), animationDelay: enter ? enterDelay(i) : undefined }}>
      {n ? <span style={{ position: 'absolute', ...(badge === 'left' ? { left: -26, top: -26 } : badge === 'top' ? { left: '50%', marginLeft: -24, top: -46 } : { right: -56, top: '50%', marginTop: -24 }), width: 48, height: 48, borderRadius: 24, background: amber, color: '#FFFFFF', display: 'grid', placeItems: 'center', fontSize: 26, fontWeight: 600, boxShadow: '0 0 0 4px #FFFFFF' }}>{n}</span> : null}
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
      <span style={{ fontFamily: mono, color: '#BCC3CC', fontSize: 24, marginLeft: 16 }}>{title}</span>
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
const CodeDoc = ({ title, width, size = 27, lh = 1.5, children }: { title: string; width?: number; size?: number; lh?: number; children: ReactNode }) => (
  <div style={{ width, boxSizing: 'border-box', background: '#FFFFFF', border: `1px solid ${rule}`, boxShadow: '0 10px 30px rgba(28,25,23,0.08)' }}>
    <div style={{ height: 52, display: 'flex', alignItems: 'center', gap: 12, padding: '0 26px', background: surface, borderBottom: `1px solid ${rule}` }}>
      <Icon kind="doc" size={30} color={muted} />
      <span style={{ fontFamily: mono, fontSize: 24, color: muted }}>{title}</span>
    </div>
    <div style={{ padding: '18px 30px 22px', fontFamily: mono, fontSize: size, lineHeight: lh, ['--cl-lh' as string]: lh } as CSSProperties}>{children}</div>
  </div>
);

// One line of a CodeDoc. `band` tints it; `n` puts a numbered badge on its right.
const CL = ({ children, band, color = ink, n, dot = 44 }: { children?: ReactNode; band?: string; color?: string; n?: number; dot?: number }) => (
  <div style={{ whiteSpace: 'pre', color, background: band, margin: '0 -30px', padding: '0 30px', minHeight: 'calc(var(--cl-lh, 1.5) * 1em)', position: 'relative' }}>
    {children}
    {n ? <span style={{ position: 'absolute', right: 14, top: '50%', marginTop: -dot / 2, zIndex: 1 }}><NumDot n={n} size={dot} /></span> : null}
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

// ---------- Chapter openers ----------

// The lesson's route on a chapter's opening page: five stops, this one in amber.
const TRACK_XS = [150, 594, 1038, 1482];

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

// Tints that tie a folder on the left to its cards on the right: brown = 人物, green = 關係.
const peopleTint = '#F7EFE7';
const relTint = '#EDF3ED';

// One folder row of the vault, drawn inside an SVG picture. A tinted row is a folder whose cards appear on the right.
const VaultRow = ({ y, x = 60, name, count, root = false, fill = '#FFFFFF', stroke = faint, tint, tone = muted }: { y: number; x?: number; name: string; count?: string; root?: boolean; fill?: string; stroke?: string; tint?: string; tone?: string }) => (
  <g>
    {tint ? <rect x={x - 14} y={y - 40} width={470} height={60} rx="8" fill={tint} /> : null}
    <Folder x={x} y={y - 30} w={56} h={42} fill={root ? muted : fill} stroke={root ? muted : stroke} />
    <text x={x + 76} y={y + 4} fontSize={root ? 36 : 33} fontWeight={root ? 600 : tint ? 600 : 400} fill={ink}>{name}</text>
    {count ? <text x={x + 220} y={y + 4} fontSize="28" fontWeight={tint ? 600 : 400} fill={tone}>{count}</text> : null}
  </g>
);

// A tinted column on the right, headed by the same folder icon as its row on the left.
const FolderColumn = ({ x, w, name, fill, stroke, tint }: { x: number; w: number; name: string; fill: string; stroke: string; tint: string }) => (
  <g>
    <rect x={x - w / 2} y={6} width={w} height={434} rx="12" fill={tint} />
    <Folder x={x - 62} y={22} w={40} h={30} fill={fill} stroke={stroke} />
    <text x={x - 12} y={50} fontSize="28" fontWeight="600" fill={stroke}>{name}/</text>
  </g>
);

const Review: Page = () => (
  <Shell>
    <Eyebrow>回顧｜第二堂</Eyebrow>
    <Heading>三國筆記庫（Vault）</Heading>
    <Fit>
      <Stage h={470}>
        <Steps>
          <Layer h={470} label="筆記庫的資料夾：人物 5 張、勢力 3 張、關係 3 張、原文有第 1–21 回和第 37、38、46 回、整理裡有大綱、模板裡有關係卡模板；人物資料夾是棕色，右邊棕色欄的圓圈就是那五張人物卡；關係資料夾是綠色，中間綠色欄的方框就是那三張關係卡">
            <InG i={0}><VaultRow y={50} x={0} name="三國人物知識庫" root /></InG>
            <InG i={1}><VaultRow y={126} name="人物" count="5 張人物卡" fill={amberSoft} stroke={amber} tint={peopleTint} tone={amber} /></InG>
            <InG i={2}><VaultRow y={188} name="勢力" count="3 張" /></InG>
            <InG i={3}><VaultRow y={250} name="關係" count="3 張關係卡" fill={sage} stroke={okGreen} tint={relTint} tone={okGreen} /></InG>
            <InG i={4}><VaultRow y={312} name="原文" count="第 1–21、37、38、46 回" /></InG>
            <InG i={5}><VaultRow y={374} name="整理" count="大綱" /></InG>
            <InG i={6}><VaultRow y={436} name="模板" count="關係卡模板" /></InG>
            <InG i={7}><FolderColumn x={880} w={170} name="人物" fill={amberSoft} stroke={amber} tint={peopleTint} /></InG>
            <PopG i={8}><Person x={880} y={150} name="劉備" /></PopG>
            <PopG i={8.6}><Person x={880} y={270} name="關羽" /></PopG>
            <PopG i={9.2}><Person x={880} y={390} name="張飛" /></PopG>
            <InG i={10}><FolderColumn x={1200} w={270} name="關係" fill={sage} stroke={okGreen} tint={relTint} /></InG>
            <PopG i={11}><RelBox cx={1200} y={118} label="桃園結義" /></PopG>
            <PopG i={11.6}><RelBox cx={1200} y={238} label="煮酒論英雄" /></PopG>
            <PopG i={12.2}><RelBox cx={1200} y={358} label="赤壁之戰" /></PopG>
            <InG i={13}><FolderColumn x={1520} w={170} name="人物" fill={amberSoft} stroke={amber} tint={peopleTint} /></InG>
            <PopG i={14}><Person x={1520} y={210} name="曹操" /></PopG>
            <PopG i={14.6}><Person x={1520} y={330} name="孫權" /></PopG>
          </Layer>
          <Step duration={STEP_MS}><Layer h={470} label="十二條線把人物連到關係卡：卡片的參與人物寫了誰，就連到誰">
            <g fill="none" stroke={quiet} strokeWidth="3">
              <StepPath d="M926 150 L1090 150" i={0} />
              <StepPath d="M926 150 L1090 270" i={0} />
              <StepPath d="M926 150 L1090 390" i={0} />
              <StepPath d="M926 270 L1090 150" i={1} />
              <StepPath d="M926 270 L1090 270" i={1} />
              <StepPath d="M926 270 L1090 390" i={1} />
              <StepPath d="M926 390 L1090 150" i={2} />
              <StepPath d="M926 390 L1090 270" i={2} />
              <StepPath d="M926 390 L1090 390" i={2} />
              <StepPath d="M1474 210 L1310 270" i={3} />
              <StepPath d="M1474 210 L1310 390" i={3} />
              <StepPath d="M1474 330 L1310 390" i={4} />
            </g>
            <g className="aw3-build" style={buildDelay(5)}>
              <line x1="830" y1="462" x2="880" y2="462" stroke={quiet} strokeWidth="3" /><text x="894" y="471" fontSize="26" fill={muted}>關係卡寫了他參與，就連一條線（共 12 條）</text>
            </g>
          </Layer></Step>
        </Steps>
      </Stage>
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={28}>今天用 Skill 畫圖、改寫，再排出時間軸</Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

// A table-of-contents row: chapter, time and page.
const AGENDA_COLS = '90px 1fr 220px';

const AgendaRow = ({ i, n, time, page }: { i: number; n: Chapter; time: string; page: Page }) => (
  <In i={i} style={{ display: 'grid', gridTemplateColumns: AGENDA_COLS, alignItems: 'center', minHeight: 108, borderBottom: `1px solid ${rule}` }}>
    <span style={{ fontFamily: display, fontSize: 40, color: amber }}>{String(n).padStart(2, '0')}</span>
    <span style={{ fontSize: 38, fontWeight: 600 }}>{CHAPTERS[n - 1]}</span>
    <span style={{ textAlign: 'right' }}><span style={{ display: 'block', fontSize: 26, color: amber }}>{time}</span><span style={{ display: 'block', fontSize: 24, color: quiet, marginTop: 4 }}>第 {pageOf(page)} 頁</span></span>
  </In>
);

const Agenda: Page = () => (
  <Shell>
    <Eyebrow>AGENDA｜120 分鐘，三個練習</Eyebrow>
    <Heading>課程大綱</Heading>
    <Fit>
      <div style={{ display: 'grid', gridTemplateColumns: AGENDA_COLS, paddingBottom: 12, borderBottom: `1px solid ${rule}` }}>
        <span /><SmallLabel>章節</SmallLabel><span style={{ textAlign: 'right' }}><SmallLabel>時間｜頁</SmallLabel></span>
      </div>
      <AgendaRow i={0} n={1} time="11–27 分" page={Section1} />
      <AgendaRow i={1} n={2} time="27–44 分" page={Section2} />
      <AgendaRow i={2} n={3} time="44–64 分" page={Section3} />
      <AgendaRow i={3} n={4} time="69–112 分" page={Section4} />
    </Fit>
  </Shell>
);

// ---------- 01 什麼是 Skill ----------

const Section1: Page = () => <SectionPage chapter={1} label="01 / SKILL" lead="交給 Agent 的一份做事說明" />;

// 07: what eli5 does before we use it — one content in, the way of telling it changes per listener.
// Audience styles are quoted from the real SKILL.md tables (Age 5, Middle school, Manager, Parents).
const AUDIENCES = [
  { who: '5 歲小孩', how: '簡單的詞、短句子、好玩的比喻' },
  { who: '國中生', how: '術語先解釋，一步一步講' },
  { who: '主管', how: '先講影響、時程、成本' },
  { who: '爸媽', how: '用他們熟悉的東西打比方' },
];
const AUD_Y = [12, 120, 228, 336];

const Eli5Intro: Page = () => (
  <Shell chapter={1} source={'eli5 原始檔 github.com/DreambigOu/ELI5'}>
    <Eyebrow>先認識今天的 Skill</Eyebrow>
    <Heading>eli5：依聽眾換講法</Heading>
    <Lead>Explain Like I'm 5，講得像我只有 5 歲</Lead>
    <Fit>
      <Stage h={430}>
        <Steps>
          <Layer h={430} label="一段內容交給 eli5，eli5 先認出聽眾，再換講法：5 歲小孩用簡單的詞、短句子、好玩的比喻；國中生先解釋術語、一步一步講；主管先講影響、時程、成本；爸媽用他們熟悉的東西打比方">
            <InG i={0}>
              <DocShape x={0} y={110} w={300} h={220} />
              {[0, 1, 2, 3].map(k => <rect key={k} x={36} y={160 + k * 40} width={k === 3 ? 140 : 226} height={14} rx="7" fill={raised} />)}
              <text x="150" y="384" textAnchor="middle" fontSize="28" fill={muted}>要講的內容</text>
              <MapArrow x1={320} x2={444} y={220} />
            </InG>
            <InG i={1}>
              <rect x="450" y="110" width="360" height="220" fill={amberSoft} stroke={amber} strokeWidth="3" />
              <text x="630" y="196" textAnchor="middle" fontSize="50" fontWeight="600" fontFamily={mono} fill={amber}>eli5</text>
              <SvgLines x={630} y={256} lines={['先認出聽眾', '再換講法']} size={30} fill={ink} />
            </InG>
            <g fill="none" stroke={faint} strokeWidth="3">
              {AUD_Y.map((y, k) => <DrawPath key={k} i={2 + k * 0.5} d={`M812 220 C900 220 912 ${y + 43} 990 ${y + 43}`} />)}
            </g>
            {AUDIENCES.map((a, k) => (
              <InG key={a.who} i={2.5 + k * 0.5}>
                <rect x="1000" y={AUD_Y[k]} width="632" height="86" fill="#FFFFFF" stroke={rule} strokeWidth="2" />
                <text x="1026" y={AUD_Y[k] + 54} fontSize="30" fontWeight="600" fill={ink}>{a.who}</text>
                <text x="1196" y={AUD_Y[k] + 53} fontSize="27" fill={muted}>{a.how}</text>
              </InG>
            ))}
          </Layer>
          <Step duration={STEP_MS}><Layer h={430} label="今天的任務：要講的內容是人物/劉備.md，聽眾是 5 歲小孩">
            <g fill="none" stroke={amber} strokeWidth="5"><StepPath d={`M812 220 C900 220 912 ${AUD_Y[0] + 43} 990 ${AUD_Y[0] + 43}`} /></g>
            <g className="aw3-build" style={buildDelay(1)}>
              <rect x="1000" y={AUD_Y[0]} width="632" height="86" fill={amberSoft} stroke={amber} strokeWidth="4" />
              <text x="1026" y={AUD_Y[0] + 54} fontSize="30" fontWeight="600" fill={amber}>{AUDIENCES[0].who}</text>
              <text x="1196" y={AUD_Y[0] + 53} fontSize="27" fill={ink}>{AUDIENCES[0].how}</text>
            </g>
            <g className="aw3-build" style={buildDelay(2)}>
              <rect x="0" y="110" width="300" height="220" fill="none" stroke={amber} strokeWidth="4" />
              <rect x="-10" y="350" width="320" height="50" fill="#FAFAF9" />
              <text x="150" y="384" textAnchor="middle" fontSize="27" fontFamily={mono} fontWeight="600" fill={amber}>人物/劉備.md</text>
            </g>
          </Layer></Step>
        </Steps>
      </Stage>
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={30}>任務目的：卡片內容不變，講到 5 歲小孩也聽得懂</Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

// Two colours used across chapter 1: what this prompt asks for (changes every time),
// and what the Skill supplies (the reusable method).
const Hl = ({ k, children }: { k: 'task' | 'skill'; children: ReactNode }) => (
  <span style={{ background: k === 'task' ? blueSoft : amberSoft, borderBottom: `3px solid ${k === 'task' ? blue : amber}`, padding: '0 4px' }}>{children}</span>
);

const SplitCard = ({ k, title, children }: { k: 'task' | 'skill'; title: string; children: ReactNode }) => (
  <div style={{ background: '#FFFFFF', border: `1px solid ${rule}`, borderTop: `5px solid ${k === 'task' ? blue : amber}`, padding: '20px 30px 24px', height: '100%', boxSizing: 'border-box' }}>
    <SmallLabel color={k === 'task' ? blue : amber}>{title}</SmallLabel>
    <div style={{ marginTop: 12, fontSize: 30, lineHeight: 1.6 }}>{children}</div>
  </div>
);

// 08: the task example, and which part of the prompt belongs to whom.
const TaskPrompt: Page = () => (
  <Shell chapter={1} source={'prompts.md 練習 2-3；eli5 github.com/dreambigou/eli5'}>
    <Eyebrow>任務範例</Eyebrow>
    <Heading>任務：把劉備卡講給 5 歲小孩聽</Heading>
    <Fit>
      <In i={0}><PromptBox size={30}><Hl k="skill">請使用 eli5 skill</Hl>，把 <Hl k="task">人物/劉備.md</Hl> 用 <Hl k="task">5 歲小孩</Hl>聽得懂的方式重新說一次，存成 <Hl k="task">整理/劉備-5歲版.md</Hl>。<Hl k="task">只用卡片裡有的內容</Hl>，不要加新的事實；<Hl k="task">保留 [[連結]]</Hl>。……</PromptBox></In>
      <Steps>
        <Step duration={STEP_MS}><div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, marginTop: 36 }}>
          <SplitCard k="task" title="藍底：寫在提示詞，每次會變">哪張卡：人物/劉備.md<br />給誰看：5 歲小孩<br />存哪裡、限制：只用原卡、保留連結</SplitCard>
          <SplitCard k="skill" title="橘底：點名 eli5，交給它">怎麼解釋給這個聽眾聽：<br />用什麼詞、照什麼順序、<br />要不要打比方</SplitCard>
        </div></Step>
        <Step duration={STEP_MS}><Takeaway marginTop={32}>講給 5 歲小孩聽要怎麼寫？Codex 去翻 eli5</Takeaway></Step>
      </Steps>
    </Fit>
  </Shell>
);

// 09: naming the Skill, and the real log showing Codex picked it up.
const PickSkill: Page = () => (
  <Shell chapter={1} source={'Codex Skills 文件 developers.openai.com/codex/skills'}>
    <Eyebrow>怎麼叫出 Skill</Eyebrow>
    <Heading>點名 eli5，看它的回報</Heading>
    <Fit>
      <div style={{ position: 'relative', height: 300 }}>
        <TermBox title="Codex 實際紀錄（節錄）" width={1080} size={28}>
          <Steps>
            <TL tone="ask">› 請使用 eli5 skill，把 人物/劉備.md 用 5 歲小孩……</TL>
            <Step duration={STEP_MS}>
              <TL hot>• 我會先讀取 eli5 skill 和劉備卡片，再用適合 5 歲……</TL>
              <div style={{ ...RUN_NOTE, top: 96 }}><Callout n={1} title="回報要用 eli5" detail="看到這句，才確定它有用" /></div>
            </Step>
            <Step duration={STEP_MS}>
              <TL hot><Typed>$</Typed> cat .agents/skills/eli5/SKILL.md; cat 人物/劉備.md</TL>
              <div style={{ ...RUN_NOTE, top: 196 }}><Callout n={2} title="讀進整份 SKILL.md" detail="接著照裡面的做法改寫" /></div>
            </Step>
          </Steps>
        </TermBox>
      </div>
      <Steps>
        <Step duration={STEP_MS}><div style={{ marginTop: 28, fontSize: 28, color: muted }}>沒點名時，Codex 會看每個 Skill 的 description 自己挑，可能挑錯（附錄第 {pageOf(CallByName)} 頁）</div></Step>
        <Step duration={STEP_MS}><Takeaway marginTop={24}>點名是明確告訴它；看到回報才算確認</Takeaway></Step>
      </Steps>
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
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={32}>每個 Skill 都有 SKILL.md；附件看需要</Takeaway></Step></Steps>
    </Fit>
  </Shell>
);


// 10: the output first — what changed and what stayed, before opening the Skill.
const ChangeRow = ({ kept = false, tag, children }: { kept?: boolean; tag: string; children: ReactNode }) => (
  <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', alignItems: 'center', gap: 20, padding: '12px 22px', background: '#FFFFFF', border: `1px solid ${rule}`, borderLeft: `6px solid ${kept ? okGreen : amber}`, fontSize: 28, height: '100%', boxSizing: 'border-box' }}>
    <span style={{ fontWeight: 600, color: kept ? okGreen : amber }}>{tag}</span>
    <span>{children}</span>
  </div>
);

const ResultTrace: Page = () => (
  <Shell chapter={1} source={'範例檔 aw-03-sample-output/練習2/劉備-5歲版.md；卡片原文：維基文庫《三國演義》第 1 回'}>
    <Eyebrow>看輸出</Eyebrow>
    <Heading>改寫後：講法變了，事實沒變</Heading>
    <Fit>
      <In i={0} style={{ display: 'flex', gap: 40, fontSize: 27, marginBottom: 16 }}>
        <span><Mk>橘底</Mk>＝換了說法</span>
        <span><Mk ok>綠底</Mk>＝原封不動</span>
      </In>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 36 }}>
        <In i={1}><RewritePanel label="原卡" file="人物/劉備.md" tone="plain"><div style={{ fontSize: 29, lineHeight: 1.7 }}>黃巾起事，招兵<Mk>榜文</Mk>貼到涿縣，劉備看著榜文嘆氣，被身後的 <Mk ok>[[張飛]]</Mk> 一聲喝住，兩人進酒店喝酒時，又遇上推著車子要進城<Mk>投軍</Mk>的 <Mk ok>[[關羽]]</Mk></div></RewritePanel></In>
        <In i={2}><RewritePanel label="eli5 改寫後" file="整理/劉備-5歲版.md" tone="ok"><div style={{ fontSize: 29, lineHeight: 1.7 }}>黃巾起事了，有人貼出<Mk>告示</Mk>，要找人當兵。劉備看著告示，嘆了一口氣。這時，身後的 <Mk ok>[[張飛]]</Mk> 大聲叫住他。兩人進店裡喝酒。他們又遇到了 <Mk ok>[[關羽]]</Mk>。關羽推著車子，正要進城<Mk>當兵</Mk>。</div></RewritePanel></In>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 16px', marginTop: 24 }}>
        <Steps>
          <Step duration={STEP_MS}><ChangeRow tag="詞變簡單">榜文 → 告示、投軍 → 當兵</ChangeRow></Step>
          <Step duration={STEP_MS}><ChangeRow tag="句子變短">原卡一整句，拆成六個短句</ChangeRow></Step>
          <Step duration={STEP_MS}><ChangeRow tag="多了比喻">開頭：把他想成「帶大家做大事的隊長」</ChangeRow></Step>
          <Step duration={STEP_MS}><ChangeRow kept tag="沒變">[[張飛]]、[[關羽]] 連結都還在</ChangeRow></Step>
        </Steps>
      </div>
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={24}>這些改法從哪來？打開 eli5 看</Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

// 11: inside eli5, part 1 — the two fields at the top, the only part Codex reads before it picks a Skill.
const Eli5Front: Page = () => (
  <Shell chapter={1} source={'eli5 原始檔 github.com/DreambigOu/ELI5；Codex Skills 文件 developers.openai.com/codex/skills'}>
    <Eyebrow>打開 eli5｜SKILL.md 開頭</Eyebrow>
    <Heading>開頭兩欄：name 和 description</Heading>
    <Fit>
      <div style={{ display: 'grid', gridTemplateColumns: '1000px 1fr', gap: 52, alignItems: 'center' }}>
        <In i={0}>
          <CodeDoc title=".agents/skills/eli5/SKILL.md（開頭）" size={27} lh={1.42}>
            <CL color={quiet}>---</CL>
            <CL band={raised} n={1}>name: eli5</CL>
            <CL band={amberSoft} n={2}>description: "Explain any topic, code, concept,</CL>
            <CL band={amberSoft}>  or error tailored to a specific audience's</CL>
            <CL band={amberSoft}>  level of understanding.</CL>
            <CL band={sage} n={3}>  Use this skill whenever the user says</CL>
            <CL band={sage}>  'explain like I am', 'ELI5', 'explain this</CL>
            <CL band={sage}>  to my', 'break this down for', 'dumb it</CL>
            <CL band={sage}>  down', 'simplify this for' …"</CL>
            <CL color={quiet}>---</CL>
            <CL color={quiet}># Explain Like I Am... (ELI5)</CL>
            <CL color={quiet}>## Step 1: Identify the Audience …</CL>
          </CodeDoc>
        </In>
        <div style={{ display: 'grid', gap: 36 }}>
          <Steps>
            <Step duration={STEP_MS}><Callout n={1} title="name：它的名字" detail="資料夾也叫 eli5；點名就寫這個字" /></Step>
            <Step duration={STEP_MS}><Callout n={2} title="description 前半：做什麼" detail="照聽眾的程度，解釋任何主題" /></Step>
            <Step duration={STEP_MS}><Callout n={3} title="description 後半：何時用" detail="聽到「ELI5」「解釋給…聽」「講簡單一點」" /></Step>
          </Steps>
        </div>
      </div>
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={30}>Codex 平常只看這兩欄，選中了才讀全文</Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

// 12: inside eli5, part 2 — the method in the body, traced to the changes on the output page.
const Eli5Body: Page = () => (
  <Shell chapter={1} source={'eli5 原始檔 github.com/DreambigOu/ELI5；Agent Skills 規格 agentskills.io/specification'}>
    <Eyebrow>打開 eli5｜SKILL.md 本文（節錄）</Eyebrow>
    <Heading>本文：先認聽眾，再照步驟寫</Heading>
    <Fit>
      <div style={{ display: 'grid', gridTemplateColumns: '1040px 1fr', gap: 48, alignItems: 'center' }}>
        <In i={0}>
          <CodeDoc title=".agents/skills/eli5/SKILL.md（本文節錄）" size={25} lh={1.34}>
            <CL band={raised} n={1}>## Step 1: Identify the Audience</CL>
            <CL band={raised}>### Ages / Grade Levels / Job Roles / Relationships</CL>
            <CL band={raised}>| Age 5 | Super simple words. Use fun analogies</CL>
            <CL band={raised}>|       | with toys, animals … Short sentences. |</CL>
            <CL band={raised}>If the audience isn't explicitly stated, default to "Age 5"</CL>
            <CL color={quiet}>## Step 2: Read the Source Material</CL>
            <CL band={sage} n={2}>## Step 3: Craft the Explanation</CL>
            <CL band={sage}>### Structure</CL>
            <CL band={sage}>1. Start with the "what"   2. Use an analogy</CL>
            <CL band={sage}>3. Fill in details   4. End with the "so what"</CL>
            <CL band={sage}>### Language Calibration: No jargon. One idea per sentence.</CL>
            <CL color={quiet}>## Tone Matching · Examples · Important Reminders</CL>
          </CodeDoc>
        </In>
        <div style={{ display: 'grid', gap: 34 }}>
          <Steps>
            <Step duration={STEP_MS}><Callout n={1} title="認出聽眾：Age 5" detail="簡單的詞、短句子；對得上「詞變簡單」「句子變短」" /></Step>
            <Step duration={STEP_MS}><Callout n={2} title="照結構寫：先說是什麼，再打比方" detail="對得上開頭的「隊長」比喻" /></Step>
            <Step duration={STEP_MS}><div style={{ background: blueSoft, borderLeft: `6px solid ${blue}`, padding: '16px 22px' }}>
              <div style={{ fontSize: 30, fontWeight: 600, color: blue }}>保留 [[連結]]：eli5 沒寫</div>
              <div style={{ fontSize: 26, color: muted, marginTop: 6 }}>這條來自提示詞</div>
            </div></Step>
          </Steps>
        </div>
      </div>
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={30}>做法來自 Skill，這次的要求來自提示詞</Takeaway></Step></Steps>
    </Fit>
    <FooterUrl href="https://github.com/DreambigOu/ELI5/blob/main/skills/eli5/SKILL.md">看完整原文：https://github.com/DreambigOu/ELI5/blob/main/skills/eli5/SKILL.md</FooterUrl>
  </Shell>
);

// 13: change the card or the audience; the prompt changes, the Skill stays.
const ReuseRow = ({ card, who, sample = false }: { card: string; who: string; sample?: boolean }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 16, background: '#FFFFFF', border: `1px solid ${rule}`, borderLeft: `6px solid ${blue}`, padding: '16px 24px', fontSize: 29 }}>
    <span>請使用 eli5 skill，把 <Hl k="task">{card}</Hl> 改給 <Hl k="task">{who}</Hl> 看……</span>
    {sample ? <span style={{ marginLeft: 'auto', fontSize: 24, color: quiet }}>（示意）</span> : null}
  </div>
);

const WhySkill: Page = () => (
  <Shell chapter={1} source={'Anthropic 2025, Equipping Agents for the Real World with Agent Skills'}>
    <Eyebrow>為什麼存成 Skill</Eyebrow>
    <Heading>換人物、換對象，Skill 不用動</Heading>
    <Lead>像食譜架：做法先存好，要用時翻出來</Lead>
    <Fit>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 90px 420px', alignItems: 'center' }}>
        <div style={{ display: 'grid', gap: 18 }}>
          <Steps>
            <ReuseRow card="人物/劉備.md" who="5 歲小孩" />
            <Step duration={STEP_MS}><ReuseRow card="人物/關羽.md" who="5 歲小孩" sample /></Step>
            <Step duration={STEP_MS}><ReuseRow card="人物/曹操.md" who="國中生" sample /></Step>
          </Steps>
        </div>
        <div style={{ textAlign: 'center', fontSize: 52, color: faint }}>→</div>
        <In i={1}><div style={{ background: amberSoft, border: `3px solid ${amber}`, padding: '28px 30px', textAlign: 'center' }}>
          <div style={{ fontFamily: mono, fontSize: 34, fontWeight: 600, color: amber }}>eli5／SKILL.md</div>
          <div style={{ fontSize: 28, marginTop: 14, lineHeight: 1.5 }}>同一份做法<br />先認聽眾、再照順序寫</div>
        </div></In>
      </div>
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={40}>每次不同的寫提示詞，可重用的做法存成 Skill</Takeaway></Step></Steps>
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
  <Shell source={'Codex Skills 文件（依 description 自動挑選）developers.openai.com/codex/skills'}>
    <Eyebrow>附錄｜Codex 怎麼挑 Skill</Eyebrow>
    <Heading>隱式啟用（Implicit Invocation）</Heading>
    <Lead>Codex 依 description 判斷該用哪個 Skill</Lead>
    <Fit>
      <Stage h={420}>
        <Steps>
          <Layer h={420} label="你說：把劉備卡用 5 歲小孩聽得懂的方式重新說一次。架上有四個 Skill：diagram-design、eli5、speak-human-tw、pdf">
            <InG i={0}>
              <rect x="316" y="0" width="1000" height="74" rx="37" fill={amberSoft} stroke={amber} strokeWidth="2" />
              <text x="816" y="48" textAnchor="middle" fontSize="31" fill={ink}>把劉備卡用 5 歲小孩聽得懂的方式重新說一次</text>
            </InG>
            <InG i={1}>
              <SkillSpine x={0} name="diagram-design" lines={['畫架構圖、流程圖', '各類圖表']} />
              <SkillSpine x={424} name="eli5" lines={['依對象用白話', '解釋複雜概念']} />
              <SkillSpine x={848} name="speak-human-tw" lines={['中文去 AI 味', '改得像真人寫的']} />
              <SkillSpine x={1272} name="pdf" lines={['讀取、建立', '檢查 PDF']} />
              <line x1="0" y1="398" x2="1632" y2="398" stroke={faint} strokeWidth="6" />
            </InG>
          </Layer>
          <Step duration={STEP_MS}><Layer h={420} label="Codex 比對 description：「用 5 歲小孩聽得懂的方式」符合 eli5 的「依對象用白話」，挑中 eli5">
            <g fill="none" stroke={amber} strokeWidth="5" strokeLinecap="round">
              <StepPath d="M646 62 H956" />
              <StepPath d="M800 72 C740 112 650 132 604 164" i={1} />
            </g>
            <g className="aw3-build" style={buildDelay(2)}>
              <SkillSpine x={424} name="eli5" lines={['依對象用白話', '解釋複雜概念']} hot />
              <line x1="452" y1="290" x2="614" y2="290" stroke={amber} strokeWidth="5" strokeLinecap="round" />
              <OkDot x={760} y={190} r={24} />
              <text x="830" y="130" fontSize="27" fontWeight="600" fill={amber}>符合 description</text>
            </g>
          </Layer></Step>
        </Steps>
      </Stage>
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={36}>description 寫清楚何時用，Codex 比較容易挑中</Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

// A column heading over the two invocation lanes: the step number from the five-step flow.
const LaneHead = ({ x, n, label }: { x: number; n: number; label: string }) => (
  <g>
    <circle cx={x + 17} cy={30} r={17} fill={amber} />
    <text x={x + 17} y={38} textAnchor="middle" fontSize="24" fontWeight="600" fill="#FFFFFF">{n}</text>
    <text x={x + 46} y={39} fontSize="25" fontWeight="600" fill={quiet}>{label}</text>
  </g>
);

const CallByName: Page = () => (
  <Shell source={'Codex Skills 文件（點名與自動挑選）developers.openai.com/codex/skills'}>
    <Eyebrow>附錄｜沒點名時</Eyebrow>
    <Heading>沒點名，Codex 會自己挑</Heading>
    <Lead>自己挑可能挑錯，所以練習都點名</Lead>
    <Fit>
      <Stage h={420}>
        <Steps>
          <Layer h={420} label="自動挑：提示詞沒寫 Skill 名稱，Codex 比對 description，可能選中 eli5，再讀 SKILL.md">
            <InG i={0}>
              <LaneHead x={0} n={1} label="提問" />
              <LaneHead x={616} n={2} label="比對 description" />
              <LaneHead x={972} n={3} label="選中" />
              <LaneHead x={1332} n={4} label="讀 SKILL.md" />
            </InG>
            <InG i={1}>
              <text x="0" y="96" fontSize="26" fontWeight="600" fill={quiet} letterSpacing="2">自動挑：沒寫名稱</text>
              <rect x="0" y="112" width="560" height="96" fill="#FFFFFF" stroke={rule} strokeWidth="2" />
              <text x="30" y="171" fontSize="30" fill={ink}>把劉備卡改成 5 歲小孩聽得懂的版本</text>
              <MapArrow x1={566} x2={612} y={160} />
              <rect x="616" y="112" width="300" height="96" fill={term} />
              <text x="766" y="152" textAnchor="middle" fontSize="26" fontFamily={mono} fill="#F5F5F4">Codex</text>
              <text x="766" y="188" textAnchor="middle" fontSize="24" fill="#BCC3CC">比對 description</text>
              <MapArrow x1={922} x2={968} y={160} />
              <rect x="972" y="112" width="300" height="96" fill="#FFFFFF" stroke={faint} strokeWidth="2" strokeDasharray="10 8" />
              <AskMark x={1032} y={160} r={24} />
              <text x="1072" y="170" fontSize="30" fill={muted}>可能選中</text>
              <MapArrow x1={1278} x2={1328} y={160} />
              <rect x="1332" y="112" width="300" height="96" fill="#FFFFFF" stroke={rule} strokeWidth="2" />
              <text x="1482" y="171" textAnchor="middle" fontSize="28" fontFamily={mono} fill={muted}>SKILL.md</text>
            </InG>
          </Layer>
          <Step duration={STEP_MS}><Layer h={420} label="點名：提示詞寫「請使用 eli5 skill」，不用比對，直接選中 eli5，再讀 SKILL.md">
            <g className="aw3-build" style={buildDelay(0)}>
              <text x="0" y="296" fontSize="26" fontWeight="600" fill={amber} letterSpacing="2">點名：寫出名稱</text>
              <rect x="0" y="312" width="560" height="96" fill={amberSoft} stroke={amber} strokeWidth="2" />
              <text x="30" y="371" fontSize="30" fill={ink}>請使用 <tspan fontWeight="700" fill={amber} fontFamily={mono}>eli5 skill</tspan>，把劉備卡……</text>
            </g>
            <g className="aw3-build" style={buildDelay(1)}>
              <text x="766" y="340" textAnchor="middle" fontSize="25" fill={quiet}>不用比對</text>
              <MapArrow x1={566} x2={968} y={360} hot />
            </g>
            <g className="aw3-build" style={buildDelay(2)}>
              <rect x="972" y="312" width="300" height="96" fill={sage} stroke={okGreen} strokeWidth="2" />
              <OkDot x={1032} y={360} r={24} />
              <text x="1072" y="370" fontSize="30" fontWeight="600" fill={okGreen}>選中 eli5</text>
              <MapArrow x1={1278} x2={1328} y={360} hot />
              <rect x="1332" y="312" width="300" height="96" fill={sage} stroke={okGreen} strokeWidth="2" />
              <text x="1482" y="371" textAnchor="middle" fontSize="28" fontFamily={mono} fill={ink}>SKILL.md</text>
            </g>
          </Layer></Step>
        </Steps>
      </Stage>
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={36}>點名是明確告訴 Codex 用哪一個</Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

// One step of the five-step flow Codex follows to use a Skill.
const FlowStep = ({ n, title, sub, hot = false }: { n: number; title: ReactNode; sub: ReactNode; hot?: boolean }) => (
  <div style={{ width: 289, height: 176, boxSizing: 'border-box', padding: '20px 22px', background: hot ? amberSoft : '#FFFFFF', border: `2px solid ${hot ? amber : rule}` }}>
    <NumDot n={n} size={40} />
    <div style={{ fontSize: 30, fontWeight: 600, lineHeight: 1.25, marginTop: 16, whiteSpace: 'nowrap' }}>{title}</div>
    <div style={{ fontSize: 25, color: muted, marginTop: 8, whiteSpace: 'nowrap' }}>{sub}</div>
  </div>
);

const FlowArrow = () => (
  <svg width="46" height="176" viewBox="0 0 46 176" style={{ display: 'block' }} aria-hidden>
    <line x1="6" y1="88" x2="30" y2="88" stroke={faint} strokeWidth="3" />
    <polygon points="42,88 28,79 28,97" fill={faint} />
  </svg>
);

// A small tag pinning a line of the real run to a step of the flow.
const StepTag = ({ n }: { n: number }) => (
  <span style={{ marginLeft: 22, padding: '2px 12px', background: '#E9B650', color: term, fontFamily: 'var(--osd-font-body)', fontSize: 24, fontWeight: 600 }}>第 {n} 步</span>
);

const LoadOnUse: Page = () => (
  <Shell source={'Codex Skills 文件（progressive disclosure）developers.openai.com/codex/skills'}>
    <Eyebrow>附錄｜Codex 怎麼讀 Skill</Eyebrow>
    <Heading>漸進式揭露（Progressive Disclosure）</Heading>
    <Lead>裝再多 Skill，平常也只佔一點上下文</Lead>
    <Fit>
      <div style={{ display: 'flex', alignItems: 'stretch' }}>
        <In i={0}><FlowStep n={1} title={<>載入 Skill 清單</>} sub={<>開 Session 時就做</>} /></In>
        <Steps>
          <Step duration={STEP_MS}><div style={{ display: 'flex' }}><FlowArrow /><FlowStep n={2} title={<>你提問</>} sub={<>劉備卡講給 5 歲小孩</>} /></div></Step>
          <Step duration={STEP_MS}><div style={{ display: 'flex' }}><FlowArrow /><FlowStep n={3} title={<>比對 description</>} sub={<>哪個 Skill 符合</>} /></div></Step>
          <Step duration={STEP_MS}><div style={{ display: 'flex' }}><FlowArrow /><FlowStep n={4} title={<>選中 eli5</>} sub={<>依對象用白話解釋</>} /></div></Step>
          <Step duration={STEP_MS}><div style={{ display: 'flex' }}><FlowArrow /><FlowStep n={5} title={<>讀完整 SKILL.md</>} sub={<>照裡面的步驟做</>} hot /></div></Step>
        </Steps>
      </div>
      <Steps>
        <Step duration={STEP_MS}>
          <div style={{ display: 'flex', gap: 46, marginTop: 18 }}>
            <div style={{ width: 1294, borderTop: `3px solid ${faint}`, paddingTop: 10, textAlign: 'center', fontSize: 27, color: muted }}>第 1–4 步：只看名稱和 description（約佔上下文 2% 以內）</div>
            <div style={{ width: 289, borderTop: `3px solid ${amber}`, paddingTop: 10, textAlign: 'center', fontSize: 27, fontWeight: 600, color: amber }}>第 5 步才讀整份</div>
          </div>
          <div style={{ marginTop: 22 }}>
            <TermBox title="Codex 實際紀錄（節錄）" size={25}>
              <TL tone="dim">• 我會先讀取 eli5 skill 和〈劉備〉筆記……<StepTag n={4} /></TL>
              <TL hot><Typed>$</Typed> cat .agents/skills/eli5/SKILL.md<StepTag n={5} /></TL>
            </TermBox>
          </div>
        </Step>
      </Steps>
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={28}>選中 Skill 之後，Codex 才讀整份 SKILL.md</Takeaway></Step></Steps>
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
  <Shell source={'Codex 文件 developers.openai.com/codex/guides/agents-md；developers.openai.com/codex/skills'}>
    <Eyebrow>附錄｜比較 1｜三種交代方式</Eyebrow>
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
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={30}>Prompt 只管這次，AGENTS.md 每次讀，Skill 要用才讀</Takeaway></Step></Steps>
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
  <Shell source={'Anthropic 2024, Introducing the Model Context Protocol；modelcontextprotocol.io'}>
    <Eyebrow>附錄｜比較 2｜MCP</Eyebrow>
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
              <text x="521" y="216" textAnchor="middle" fontSize="26" fill={muted}>教 Codex 做法</text>
              <rect x="642" y="150" width="348" height="172" fill={term} />
              <text x="816" y="248" textAnchor="middle" fontSize="38" fontFamily={mono} fill="#F5F5F4">&gt;_ Codex</text>
            </InG>
          </Layer>
          <Step duration={STEP_MS}><Layer h={420} label="右邊是 MCP：把 Codex 接到 GitHub、Google Drive、資料庫">
            <g className="aw3-build" style={buildDelay(0)}>
              <text x="1232" y="44" fontSize="30" fontWeight="600" fill={blue}>MCP：連接工具</text>
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
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={40}>Skill 告訴 Codex 怎麼做，MCP 讓 Codex 連到外部工具</Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

const CMP_COLS = '240px 1fr 1fr 1.25fr';

const CompareTable: Page = () => (
  <Shell chapter={1} source={'Codex 文件 developers.openai.com/codex（guides/agents-md、skills、mcp）'}>
    <Eyebrow>Skill 和其他做法的差別</Eyebrow>
    <Heading>Prompt、AGENTS.md、Skill、MCP</Heading>
    <Fit>
      <div style={{ borderTop: `3px solid ${rule}` }}>
        <TRow head cols={CMP_COLS} cells={['名稱', '是什麼', '什麼時候用', '三國例子']} />
        <In i={0}><TRow cols={CMP_COLS} size={31} cells={[<strong>Prompt</strong>, '這一次的要求', '只做一次的事', '把劉備卡改短一點']} /></In>
        <In i={1}><TRow cols={CMP_COLS} size={31} cells={[<strong style={{ fontFamily: mono }}>AGENTS.md</strong>, '這個專案的規則', '每次都要遵守', '回答都附檔名']} /></In>
        <In i={2}><TRow cols={CMP_COLS} size={31} tint={amberSoft} cells={[<strong>Skill</strong>, '一類工作的做法', '常常重複做', 'eli5 改成 5 歲版']} /></In>
        <In i={3}><TRow cols={CMP_COLS} size={31} tint={blueSoft} cells={[<strong>MCP</strong>, '連到外部工具', '要查外部系統', '讀 GitHub 上的檔案']} /></In>
      </div>
      <Steps>
        <Step duration={STEP_MS}><Takeaway marginTop={36}>常常重複做的事，寫成 Skill</Takeaway></Step>
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
  <Shell source={'Codex 文件：Skills developers.openai.com/codex/skills；MCP developers.openai.com/codex/mcp'}>
    <Eyebrow>附錄｜小測驗：Skill 還是 MCP</Eyebrow>
    <Heading>判斷題：Skill 還是 MCP？</Heading>
    <Fit>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48 }}>
        <In i={0}><QuizCard n={1} scene="每次 Review PR，都要照公司的 10 條規範檢查" answer="Skill" why="固定的做法和檢查流程" tone="skill" /></In>
        <In i={1}><QuizCard n={2} scene="希望 AI 能查公司的 Jira 或資料庫" answer="MCP" why="要連到外部系統拿資料" tone="mcp" /></In>
      </div>
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={44}>Skill 提供做法，MCP 連接外部系統</Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

// ---------- 02 安裝熱門 Skill ----------

const Section2: Page = () => <SectionPage chapter={2} label="02 / 安裝" lead="裝兩個別人寫好的 Skill" />;

// One part of the install command, explained in a box under it.
const CmdPart = ({ x, w, cx, half, name, lines }: { x: number; w: number; cx: number; half: number; name: string; lines: string[] }) => (
  <g>
    <g fill="none" stroke={amber} strokeWidth="3"><path d={`M${cx - half} 150 V164 H${cx + half} V150`} /><path d={`M${cx} 164 V212`} /></g>
    <rect x={x} y="212" width={w} height="212" fill="#FFFFFF" stroke={amber} strokeWidth="2" />
    <text x={x + 30} y="268" fontSize="32" fontWeight="600" fontFamily={mono} fill={amber}>{name}</text>
    <SvgLines x={x + 30} y={326} lines={lines} size={30} fill={ink} anchor="start" />
  </g>
);

const SkillsAddCmd: Page = () => (
  <Shell chapter={2} source={'skills 安裝工具（Vercel Labs）github.com/vercel-labs/skills；Node.js nodejs.org'}>
    <Eyebrow>安裝指令</Eyebrow>
    <Heading>用 npx skills add 安裝 Skill</Heading>
    <Fit>
      <Stage h={430}>
        <Steps>
          <Layer h={430} label="指令 npx skills add dreambigou/eli5 分成三段">
            <InG i={0}>
              <rect x="0" y="0" width="1632" height="132" fill={term} />
              <text x="60" y="84" fontSize="54" fontFamily={mono} fill="#8DD4A0">$</text>
              <text x="220" y="84" textAnchor="middle" fontSize="56" fontFamily={mono} fill="#F5F5F4">npx</text>
              <text x="760" y="84" textAnchor="middle" fontSize="56" fontFamily={mono} fill="#F5F5F4">skills add</text>
              <text x="1340" y="84" textAnchor="middle" fontSize="56" fontFamily={mono} fill="#E9B650">dreambigou/eli5</text>
            </InG>
          </Layer>
          <Step duration={STEP_MS}><Layer h={430} label="npx：Node.js 附的工具，把程式下載下來直接執行">
            <g className="aw3-build" style={buildDelay(0)}><CmdPart x={0} w={480} cx={220} half={60} name="npx" lines={['Node.js 附的工具', '下載程式，直接執行']} /></g>
          </Layer></Step>
          <Step duration={STEP_MS}><Layer h={430} label="skills add：skills 這個安裝程式的「新增」">
            <g className="aw3-build" style={buildDelay(0)}><CmdPart x={530} w={480} cx={760} half={175} name="skills add" lines={['skills：裝 Skill 的程式', 'add：新增一個']} /></g>
          </Layer></Step>
          <Step duration={STEP_MS}><Layer h={430} label="dreambigou/eli5：GitHub 上的帳號和專案名稱">
            <g className="aw3-build" style={buildDelay(0)}><CmdPart x={1060} w={572} cx={1340} half={255} name="dreambigou/eli5" lines={['GitHub 的 帳號/專案', '要裝哪個 Skill']} /></g>
          </Layer></Step>
        </Steps>
      </Stage>
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={40}>前兩段不變，換最後一段就能裝別的 Skill</Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

// A GitHub address or a command, set large with the owner/repo part marked.
const UrlRow = ({ label, prefix, name, dark = false }: { label: string; prefix: string; name: string; dark?: boolean }) => (
  <div style={{ display: 'grid', gridTemplateColumns: '112px 1fr', alignItems: 'center', gap: 20 }}>
    <SmallLabel color={muted}>{label}</SmallLabel>
    <div style={{ background: dark ? term : '#FFFFFF', border: `1px solid ${dark ? '#555B60' : rule}`, padding: '16px 28px', fontFamily: mono, fontSize: 32, whiteSpace: 'nowrap', color: dark ? '#F5F5F4' : quiet }}>
      {prefix}<span style={{ color: dark ? '#E9B650' : ink, fontWeight: 600, background: dark ? 'rgba(233,182,80,0.16)' : amberSoft, borderBottom: `3px solid ${dark ? '#E9B650' : amber}`, padding: '0 4px' }}>{name}</span>
    </div>
  </div>
);

const RepoName: Page = () => (
  <Shell chapter={2} source={'eli5 github.com/dreambigou/eli5；diagram-design github.com/cathrynlavery/diagram-design'}>
    <Eyebrow>指令最後一段</Eyebrow>
    <Heading>從 GitHub 網址找出專案名稱</Heading>
    <Fit>
      <In i={0}><SmallLabel>例子｜eli5</SmallLabel></In>
      <In i={1} style={{ display: 'grid', gap: 14, marginTop: 12 }}>
        <UrlRow label="網址" prefix="https://github.com/" name="dreambigou/eli5" />
        <UrlRow label="指令" prefix="$ npx skills add " name="dreambigou/eli5" dark />
      </In>
      <In i={2} style={{ marginTop: 44 }}><SmallLabel>換你｜diagram-design</SmallLabel></In>
      <In i={3} style={{ display: 'grid', gap: 14, marginTop: 12 }}>
        <UrlRow label="網址" prefix="https://github.com/" name="cathrynlavery/diagram-design" />
        <div style={{ position: 'relative' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '112px 1fr', alignItems: 'center', gap: 20 }}>
            <SmallLabel color={muted}>指令</SmallLabel>
            <div style={{ border: `2px dashed ${faint}`, padding: '14px 28px', fontFamily: mono, fontSize: 32, color: quiet }}>$ npx skills add ？</div>
          </div>
          <Steps>
            <Step duration={STEP_MS}><div style={{ position: 'absolute', inset: 0 }}>
              <UrlRow label="指令" prefix="$ npx skills add " name="cathrynlavery/diagram-design" dark />
            </div></Step>
          </Steps>
        </div>
      </In>
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={40}>github.com/ 後面兩段，就是要打的名稱</Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

// One tool to check: what it is for, shown next to its real output.
const ToolNote = ({ name, children }: { name: string; children: ReactNode }) => (
  <div style={{ background: '#FFFFFF', border: `1px solid ${rule}`, borderLeft: `6px solid ${amber}`, padding: '16px 26px' }}>
    <div style={{ fontFamily: mono, fontSize: 30, fontWeight: 600, color: amber }}>{name}</div>
    <div style={{ fontSize: 28, lineHeight: 1.45, marginTop: 4 }}>{children}</div>
  </div>
);

const ToolCheck: Page = () => (
  <Shell source={'Git 安裝 git-scm.com/install/mac、git-scm.com/install/windows；Node.js 下載 nodejs.org/en/download'}>
    <PracticeEyebrow time="開場 2 分鐘">練習 1｜第 1 步</PracticeEyebrow>
    <Heading>練習（安裝）：先確認有 git 和 Node.js</Heading>
    <PromptsCopy step="1-1" />
    <Fit>
      <div style={{ display: 'grid', gridTemplateColumns: '880px 1fr', gap: 56, alignItems: 'center' }}>
        <TermBox title="終端機｜實際輸出" size={32}>
          <Steps>
            <TL><Typed>$</Typed> git --version</TL>
            <Step duration={STEP_MS}><div>
              <TL hot>git version 2.54.0 (Apple Git-157)</TL>
              <TL><Typed>$</Typed> node -v</TL>
            </div></Step>
            <Step duration={STEP_MS}><div>
              <TL hot>v24.12.0</TL>
              <TL><Typed>$</Typed> npx -v</TL>
              <TL hot>11.6.2</TL>
            </div></Step>
          </Steps>
        </TermBox>
        <div style={{ display: 'grid', gap: 22 }}>
          <In i={0}><ToolNote name="git">從 GitHub 下載 Skill 用</ToolNote></In>
          <In i={1}><ToolNote name="node、npx">跑 npx skills add 用<br />node 要 v22.20 以上</ToolNote></In>
        </div>
      </div>
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={44}>若沒有版本號，下一步教學安裝過程</Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

// One stop of a left-to-right how-to flow, drawn as an icon in a circle.
const HowStop = ({ x, n, kind, label, sub, hot = false, href }: { x: number; n: number; kind: IconKind; label: string; sub: string; hot?: boolean; href?: string }) => {
  const body = (
  <g>
    <circle cx={x} cy="96" r="80" fill={hot ? amberSoft : '#FFFFFF'} stroke={hot ? amber : rule} strokeWidth="3" />
    <SvgIcon kind={kind} x={x} y={96} size={72} color={hot ? amber : muted} />
    <circle cx={x - 62} cy="34" r="24" fill={amber} />
    <text x={x - 62} y="43" textAnchor="middle" fontSize="26" fontWeight="600" fill="#FFFFFF">{n}</text>
    <text x={x} y="232" textAnchor="middle" fontSize="32" fontWeight="600" fill={href ? amber : ink} style={href ? { textDecoration: 'underline' } : undefined}>{label}</text>
    <text x={x} y="282" textAnchor="middle" fontSize="28" fill={muted}>{sub}</text>
  </g>
  );
  return href ? <a href={href} target="_blank" rel="noreferrer">{body}</a> : body;
};

// A link students click on their own laptop (the projector shows it underlined).
const WebLink = ({ href, children, size = 30 }: { href: string; children: ReactNode; size?: number }) => (
  <a href={href} target="_blank" rel="noreferrer" style={{ fontFamily: mono, fontSize: size, color: amber, textDecoration: 'underline', textUnderlineOffset: 4 }}>{children}</a>
);

const InstallNode: Page = () => (
  <Shell source={'Git 安裝 git-scm.com/install/mac、git-scm.com/install/windows；Node.js 下載 nodejs.org/en/download'}>
    <Eyebrow>沒有 git 或 Node.js｜邊聽邊裝</Eyebrow>
    <Heading>安裝 git &amp; Node.js</Heading>
    <PromptsCopy step="1-1" />
    <Fit z={0.9}>
      <In i={0}><SmallLabel>第 1 步｜git</SmallLabel></In>
      <In i={1} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 36, marginTop: 12 }}>
        <OsFix os="MAC">先到 <WebLink href="https://brew.sh">brew.sh</WebLink> 裝 Homebrew<br />再打 <Path size={30}>brew install git</Path></OsFix>
        <OsFix os="WINDOWS"><WebLink href="https://git-scm.com/install/windows">git-scm.com/install/windows</WebLink><br />按 Click here to download，選項用預設</OsFix>
      </In>
      <Steps>
        <Step duration={STEP_MS}><div style={{ marginTop: 36 }}>
          <SmallLabel>第 2 步｜Node.js（npx 跟著一起裝好）</SmallLabel>
          <div style={{ marginTop: 16 }}>
            <Figure h={300} label="裝 Node.js 四步：打開 nodejs.org、下載 LTS 安裝檔、雙擊安裝一路按繼續、終端機關掉重開再打 node -v">
              <HowStop x={200} n={1} kind="globe" label="打開 nodejs.org" sub="按 Download" href="https://nodejs.org/en/download" />
              <MapArrow x1={300} x2={510} y={96} /><HowStop x={610} n={2} kind="down" label="下載 LTS 版" sub="Mac .pkg／Windows .msi" />
              <MapArrow x1={710} x2={920} y={96} /><HowStop x={1020} n={3} kind="ok" label="雙擊安裝" sub="一路按「繼續」或 Next" />
              <MapArrow x1={1120} x2={1330} y={96} /><HowStop x={1432} n={4} kind="terminal" label="終端機關掉重開" sub="再打 node -v" hot />
            </Figure>
          </div>
        </div></Step>
      </Steps>
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

// A folder line in a small file tree; `hot` marks where the Skill lands.
const VaultLine = ({ depth, name, hot = false, note }: { depth: number; name: string; hot?: boolean; note?: string }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 14, height: 56, paddingLeft: depth * 44 + 14, fontFamily: mono, fontSize: 29, background: hot ? amberSoft : undefined, border: hot ? `2px solid ${amber}` : '2px solid transparent', fontWeight: hot ? 600 : 400 }}>
    <Icon kind="folder" size={34} color={hot ? amber : faint} />
    <span>{name}</span>
    {note ? <span style={{ marginLeft: 'auto', paddingRight: 16, fontFamily: 'var(--osd-font-body)', fontSize: 26, color: amber }}>{note}</span> : null}
  </div>
);

const CdVault: Page = () => (
  <Shell chapter={2} source={'skills 安裝工具：Project 裝在目前資料夾 github.com/vercel-labs/skills'}>
    <PracticeEyebrow time="練習 1 第 2 步">練習 1｜走進筆記庫</PracticeEyebrow>
    <Heading>練習（安裝）：先 cd 到筆記庫</Heading>
    <PromptsCopy step="1-2" />
    <Fit>
      <div style={{ display: 'grid', gridTemplateColumns: '900px 1fr', gap: 48, alignItems: 'center' }}>
        <TermBox title="終端機｜路徑每台不同" size={28}>
          <TL tone="note"># 打 cd 和空格，把資料夾拖進來，按 Enter</TL>
          <TL><Typed>$</Typed> cd ~/Downloads/三國人物知識庫</TL>
          <TL><Typed>$</Typed> ls</TL>
          <TL hot>{'三國演義.md  人物  勢力  原文\n整理  模板  關係'}</TL>
        </TermBox>
        <Steps>
          <Step duration={STEP_MS}><div style={{ background: '#FFFFFF', border: `1px solid ${rule}`, padding: '14px 10px' }}>
            <VaultLine depth={0} name="三國人物知識庫/" />
            <VaultLine depth={1} name="人物/  關係/  …" />
            <VaultLine depth={1} name=".agents/skills/" hot note="Skill 裝這裡" />
          </div></Step>
        </Steps>
      </div>
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={44}>選 Project，Skill 會裝進終端機所在的資料夾</Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

// What to press at a prompt, pinned to the right end of that terminal line.
const Press = ({ children }: { children: ReactNode }) => (
  <span style={{ marginLeft: 26, padding: '2px 14px', background: '#E9B650', color: term, fontFamily: 'var(--osd-font-body)', fontSize: 25, fontWeight: 600 }}>{children}</span>
);

const AddEli5: Page = () => (
  <Shell chapter={2} source={'eli5（MIT 授權）github.com/dreambigou/eli5；skills 安裝工具 github.com/vercel-labs/skills'}>
    <PracticeEyebrow time="練習 1 第 3 步">練習 1｜安裝</PracticeEyebrow>
    <Heading>練習（Skill）：npx skills add 裝 eli5</Heading>
    <PromptsCopy step="1-3" />
    <Fit>
      <TermBox title="終端機｜實際輸出（節錄）" size={26}>
        <Steps>
          <TL><Typed>$</Typed> npx skills add dreambigou/eli5</TL>
          <Step duration={STEP_MS}><div>
            <TL tone="dim">Need to install the following packages:</TL>
            <TL tone="dim">skills@1.7.4</TL>
            <TL hot>Ok to proceed? (y)<Press>按 Enter</Press></TL>
          </div></Step>
          <Step duration={STEP_MS}><div>
            <TL tone="dim">◇  Found 1 skill</TL>
            <TL>◆  Which agents do you want to install to?</TL>
            <TL tone="dim">│  ── Universal (.agents/skills) ── always included ──</TL>
            <TL hot>│    • Codex<Press>已經包含，不用選</Press></TL>
          </div></Step>
          <Step duration={STEP_MS}><div>
            <TL tone="dim">│    ○ Claude Code (.claude/skills)</TL>
            <TL hot>│  ↑↓ move, space select, enter confirm<Press>按 Enter</Press></TL>
          </div></Step>
        </Steps>
      </TermBox>
      <Steps><Step duration={STEP_MS}><div style={{ marginTop: 22, fontSize: 28, color: muted, textAlign: 'center' }}>用 Claude Code 的人：按 ↓ 移到 Claude Code，按空白鍵打勾，再按 Enter</div></Step></Steps>
    </Fit>
  </Shell>
);

const AddEli5Scope: Page = () => (
  <Shell chapter={2} source={'skills 安裝工具（Project 與 Global）github.com/vercel-labs/skills'}>
    <PracticeEyebrow time="練習 1 第 3 步">練習 1｜安裝</PracticeEyebrow>
    <Heading>接著三題：選 Project，裝進筆記庫</Heading>
    <PromptsCopy step="1-3" />
    <Fit>
      <TermBox title="終端機｜接上一頁（節錄）" size={25}>
        <Steps>
          <TL>◆  Installation scope</TL>
          <TL hot>│  ● Project (Install in current directory (committed with your project))<Press>選 Project，按 Enter</Press></TL>
          <TL tone="dim">│  ○ Global</TL>
          <Step duration={STEP_MS}><div>
            <TL>◆  Installation method</TL>
            <TL hot>│  ● Symlink (Recommended)<Press>預設，按 Enter</Press></TL>
          </div></Step>
          <Step duration={STEP_MS}><div>
            <TL>◆  Proceed with installation?</TL>
            <TL hot>│  ● Yes / ○ No<Press>按 Enter</Press></TL>
          </div></Step>
          <Step duration={STEP_MS}><div>
            <TL tone="dim">◇  Installed 1 skill</TL>
            <TL hot>│  ✓ ./.agents/skills/eli5</TL>
            <TL tone="dim">└  Done!  Review skills before use; they run with full agent permissions.</TL>
          </div></Step>
        </Steps>
      </TermBox>
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={20}>選 Project，eli5 就裝在筆記庫的 .agents/skills/</Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

const AddDiagram: Page = () => (
  <Shell chapter={2} source={'diagram-design 安裝說明 github.com/cathrynlavery/diagram-design'}>
    <PracticeEyebrow time="練習 1 第 4 步">練習 1｜安裝</PracticeEyebrow>
    <Heading>練習（Skill）：再裝 diagram-design</Heading>
    <PromptsCopy step="1-4" />
    <Fit>
      <TermBox title="終端機｜實際輸出（節錄）" size={28}>
        <Steps>
          <TL><Typed>$</Typed> npx skills add cathrynlavery/diagram-design</TL>
          <Step duration={STEP_MS}><div>
            <TL tone="dim">◇  Found 1 skill</TL>
            <TL tone="note"># 接下來四題跟裝 eli5 一樣，都按 Enter</TL>
            <TL tone="dim">◇  Installation scope</TL>
            <TL tone="dim">│  Project</TL>
          </div></Step>
          <Step duration={STEP_MS}><div>
            <TL tone="dim">◇  Installed 1 skill</TL>
            <TL hot>│  ✓ ./.agents/skills/diagram-design</TL>
          </div></Step>
          <Step duration={STEP_MS}><div>
            <TL><Typed>$</Typed> ls .agents/skills</TL>
            <TL hot>diagram-design  eli5</TL>
          </div></Step>
        </Steps>
      </TermBox>
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={20}>兩個 Skill 都在筆記庫的 .agents/skills/ 裡</Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

// One error message, then (on click) what it means and what to do.
const ErrRow = ({ msg, os, cause, fix }: { msg: ReactNode; os: string; cause: string; fix: ReactNode }) => (
  <div style={{ display: 'grid', gridTemplateColumns: '760px 1fr', gap: 32, alignItems: 'center', padding: '20px 0', borderBottom: `1px solid ${rule}` }}>
    <div>
      <SmallLabel color={quiet}>{os}</SmallLabel>
      <div style={{ marginTop: 6, background: term, color: '#F2A097', fontFamily: mono, fontSize: 26, padding: '10px 20px', whiteSpace: 'nowrap' }}>{msg}</div>
    </div>
    <Steps><Step duration={STEP_MS}><div>
      <div style={{ fontSize: 30, fontWeight: 600, color: amber }}>{cause}</div>
      <div style={{ fontSize: 28, lineHeight: 1.45, marginTop: 4 }}>{fix}</div>
    </div></Step></Steps>
  </div>
);

const InstallErrors: Page = () => (
  <Shell source={'skills 安裝工具 github.com/vercel-labs/skills；PowerShell 執行原則 learn.microsoft.com'}>
    <Eyebrow>附錄｜裝不起來 1／2</Eyebrow>
    <Heading>裝不起來，先看錯誤訊息</Heading>
    <Fit>
      <div style={{ borderTop: `1px solid ${rule}` }}>
        <ErrRow os="MAC" msg="zsh: command not found: npx" cause="沒裝 Node.js" fix={<>照第 {pageOf(InstallNode)} 頁裝 Node.js，終端機關掉重開</>} />
        <ErrRow os="MAC／WINDOWS" msg="Failed to clone … spawn git ENOENT" cause="沒有 git" fix={<>Mac：裝 Homebrew 後 <Path size={28}>brew install git</Path><br />Windows：<Path size={28}>git-scm.com/install/windows</Path></>} />
        <ErrRow os="WINDOWS（示意）" msg="… npx.ps1 … 已停用指令碼執行" cause="PowerShell 擋住 npx" fix={<>改打 <Path size={28}>npx.cmd skills add …</Path></>} />
      </div>
    </Fit>
  </Shell>
);

const ZipFallback: Page = () => (
  <Shell source={'GitHub：Code → Download ZIP docs.github.com；Codex .agents/skills、Claude Code .claude/skills'}>
    <Eyebrow>附錄｜裝不起來 2／2</Eyebrow>
    <Heading>指令都不行：下載 ZIP，自己放進去</Heading>
    <In i={0} style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 36 }}>
      <ChipStep n={1}>GitHub 按 Code → Download ZIP</ChipStep><ChipArrow />
      <ChipStep n={2}>解壓縮</ChipStep><ChipArrow />
      <ChipStep n={3}>拖進 skills 資料夾</ChipStep>
    </In>
    <Fit>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px 1fr', alignItems: 'center' }}>
        <In i={1}><div style={{ background: '#FFFFFF', border: `1px solid ${rule}`, padding: '14px 10px' }}>
          <SmallLabel color={quiet}>　ZIP 解開後</SmallLabel>
          <VaultLine depth={0} name="ELI5-main/" />
          <VaultLine depth={1} name="skills/" />
          <VaultLine depth={2} name="eli5/" hot note="拿這層" />
        </div></In>
        <Steps>
          <Step duration={STEP_MS}><svg width="120" height="60" viewBox="0 0 120 60" style={{ display: 'block' }} aria-hidden><MapArrow x1={14} x2={106} y={30} hot /></svg></Step>
          <Step duration={STEP_MS}><div style={{ background: '#FFFFFF', border: `1px solid ${rule}`, padding: '14px 10px' }}>
            <SmallLabel color={quiet}>　三國人物知識庫</SmallLabel>
            <VaultLine depth={0} name=".agents/skills/" note="Codex" />
            <VaultLine depth={1} name="eli5/" hot note="裡面直接有 SKILL.md" />
            <VaultLine depth={0} name=".claude/skills/" note="Claude Code" />
          </div></Step>
        </Steps>
      </div>
      <Steps><Step duration={STEP_MS}><div style={{ marginTop: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 18, fontSize: 28, color: muted }}>Finder 看不到 .agents，在筆記庫打<span style={{ fontFamily: mono, background: term, color: '#F5F5F4', padding: '4px 16px' }}>mkdir -p .agents/skills && open .agents/skills</span></div></Step></Steps>
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
  <Shell chapter={2} source={'Codex Skills 文件（.agents/skills 位置）developers.openai.com/codex/skills'}>
    <PracticeEyebrow time="練習 1 第 5 步">練習 1｜確認</PracticeEyebrow>
    <Heading>在筆記庫開 Codex，確認 Skill</Heading>
    <PromptsCopy step="1-5" />
    <In i={0} style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 44 }}>
      <ChipStep n={1}>終端機還在筆記庫裡</ChipStep><ChipArrow />
      <ChipStep n={2}><Path size={28}>codex</Path></ChipStep><ChipArrow />
      <ChipStep n={3}>問 Codex 有哪些 Skill</ChipStep>
    </In>
    <Fit z={0.96}>
      <TermBox title="Codex 實際輸出（節錄）" size={25}>
        <Steps>
          <TL tone="ask">› 列出你現在可以使用的 skills 名稱，每個一行，附一句用途。不要讀或修改任何檔案。</TL>
          <Step duration={STEP_MS}><div>
            <TL tone="dim">  ……</TL>
            <TL hot>- diagram-design：製作架構圖、流程圖、資料模型與各類圖表。</TL>
            <TL hot>- eli5：依讀者的背景與理解程度，用容易懂的方式解釋概念。</TL>
          </div></Step>
        </Steps>
      </TermBox>
      <Steps>
        <Step duration={STEP_MS}><div style={{ display: 'flex', justifyContent: 'center', marginTop: 10 }}>
          <div style={{ background: sage, padding: '12px 28px' }}><StatusLine ok size={30}>兩個都在：裝好了</StatusLine></div>
          <span style={{ marginLeft: 28, alignSelf: 'center', fontSize: 26, color: quiet }}>少一個或裝不起來：看附錄第 {pageOf(InstallErrors)}–{pageOf(ZipFallback)} 頁</span>
        </div></Step>
        <Step duration={STEP_MS}><Takeaway marginTop={8}>清單只表示已安裝；下一章實際執行一次，確認能用</Takeaway></Step>
      </Steps>
    </Fit>
  </Shell>
);

// ---------- Recorded runs ----------

// Every demo is a recording of a real run; nothing runs live in class. Drop the file into
// ./assets/ and point the constant at it with new URL('./assets/<file>', import.meta.url).href.
// While a constant is undefined, its page shows a marked slot with the planned parts.
const INSTALL_VIDEO: string | undefined = new URL('./assets/skills-install.mp4', import.meta.url).href;
const USE_VIDEO: string | undefined = new URL('./assets/skills-use.mp4', import.meta.url).href;
const TIMELINE_VIDEO: string | undefined = new URL('./assets/timeline-skill.mp4', import.meta.url).href;

const clock = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

const VideoPage = ({ chapter, eyebrow, title, src, file, parts }: { chapter: Chapter; eyebrow: string; title: string; src?: string; file: string; parts: [number, string][] }) => {
  const live = useIsActivePage();
  const video = useRef<HTMLVideoElement>(null);
  const [now, setNow] = useState(0);
  useEffect(() => { if (!live) video.current?.pause(); }, [live]);
  const part = parts.reduce((at, [t], k) => (now >= t ? k : at), 0);
  const jump = (t: number) => {
    const v = video.current;
    if (!v) return;
    v.currentTime = t;
    void v.play();
  };
  return (
    <Shell chapter={chapter}>
      <Eyebrow>{eyebrow}</Eyebrow>
      <Heading>{title}</Heading>
      <Fit>
        <div style={{ display: 'grid', gridTemplateColumns: '1072px 1fr', gap: 44, alignItems: 'center' }}>
          <In i={0}>
            {src ? (
              <video ref={video} src={src} controls muted playsInline preload="metadata"
                onTimeUpdate={(e) => setNow(e.currentTarget.currentTime)}
                onKeyDown={(e) => { if (e.key === ' ') e.stopPropagation(); }}
                aria-label={`示範錄影：${title}`}
                style={{ width: 1072, height: 603, display: 'block', background: term, border: `1px solid ${rule}` }} />
            ) : (
              <div style={{ width: 1072, height: 603, boxSizing: 'border-box', border: `3px dashed ${amber}`, background: amberSoft, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
                <span style={{ fontSize: 44, fontWeight: 600, color: amber }}>影片待錄</span>
                <span style={{ fontFamily: mono, fontSize: 28, color: muted }}>slides/aw-03/assets/{file}</span>
              </div>
            )}
          </In>
          <div style={{ display: 'grid', gap: 12 }}>
            {parts.map(([t, label], k) => (
              <In key={t} i={k + 1}>
                <button type="button" disabled={!src} onClick={(e) => { e.currentTarget.blur(); jump(t); }}
                  style={{ width: '100%', display: 'grid', gridTemplateColumns: '84px 1fr', alignItems: 'center', gap: 12, padding: '14px 20px', boxSizing: 'border-box', textAlign: 'left', cursor: src ? 'pointer' : 'default', font: 'inherit', fontSize: 28, color: ink, background: src && k === part ? amberSoft : '#FFFFFF', border: `1px solid ${src && k === part ? amber : rule}`, transition: 'background-color 200ms ease, border-color 200ms ease' }}>
                  <span style={{ fontFamily: mono, fontSize: 26, color: amber, fontWeight: 600 }}>{clock(t)}</span>
                  <span style={{ whiteSpace: 'nowrap' }}>{label}</span>
                </button>
              </In>
            ))}
            <Caption>點時間跳到那一段</Caption>
          </div>
        </div>
      </Fit>
    </Shell>
  );
};

const InstallVideo: Page = () => (
  <VideoPage chapter={2} eyebrow="練習 1｜示範錄影" title="錄影：npx 裝好兩個 Skill" src={INSTALL_VIDEO} file="skills-install.mp4"
    parts={[[0, '裝 eli5：一路按 Enter'], [44, '裝 diagram-design'], [92, '開 Codex，列出 Skill']]} />
);

const UseVideo: Page = () => (
  <VideoPage chapter={3} eyebrow="練習 2｜示範錄影" title="錄影：畫關係圖、改寫劉備卡" src={USE_VIDEO} file="skills-use.mp4"
    parts={[[0, '貼上練習 2-1'], [42, 'Codex 問配色'], [52, '回答：用預設'], [166, '存好關係圖'], [180, '重開 Codex，貼上練習 2-3']]} />
);

const TimelineVideo: Page = () => (
  <VideoPage chapter={4} eyebrow="練習 3｜示範錄影" title="錄影：跑時間軸、補規則、再跑" src={TIMELINE_VIDEO} file="timeline-skill.mp4"
    parts={[[0, 'npx 裝骨架'], [38, '第一次跑'], [72, '搜到 6 處「未記載」'], [82, '自己加兩行規則'], [88, '重開再跑'], [130, '再搜：0 處']]} />
);

// ---------- Break ----------

const BreakPage: Page = () => (
  <Shell chapter={3}>
    <Eyebrow>中場</Eyebrow>
    <Heading>休息 5 分鐘</Heading>
    <Fit>
      <Figure h={300} label="休息時間可以做三件事：補做練習 2、舉手提問、喝水走動">
        <InG i={0}><HowStop x={300} n={1} kind="edit" label="補做練習 2" sub="關係圖、5 歲版" /></InG>
        <InG i={1}><HowStop x={816} n={2} kind="chat" label="舉手提問" sub="卡住的地方" /></InG>
        <InG i={2}><HowStop x={1332} n={3} kind="ok" label="回來接第四章" sub="寫自己的 Skill" /></InG>
      </Figure>
    </Fit>
  </Shell>
);

// ---------- 03 用 Skill 做好讀的筆記 ----------

const Section3: Page = () => <SectionPage chapter={3} label="03 / 使用" lead="畫成關係圖、改成白話" />;

const DiagramRun: Page = () => (
  <Shell chapter={3} source={'diagram-design github.com/cathrynlavery/diagram-design'}>
    <PracticeEyebrow time="20 分鐘（三步）">練習 2｜diagram-design</PracticeEyebrow>
    <Heading>練習（Skill）：畫人物關係圖</Heading>
    <PromptsCopy step="2-1" />
    <PillRow>
      <Pill tag="定位">人物、勢力、關係卡</Pill>
      <Pill tag="期望輸出">圖/三國關係圖.html</Pill>
      <Pill tag="限制">只畫卡片有寫的</Pill>
    </PillRow>
    <Fit>
      <TermBox title="Codex 實際紀錄（節錄）" size={27}>
        <Steps>
          <TL tone="ask">› 請使用 diagram-design skill，讀 人物/、勢力/、關係/ 裡的卡片……</TL>
          <Step duration={STEP_MS}><div>
            <TL>• 三國關係圖要使用哪種配色？確認後我會完成並存成「圖/三國關係圖.html」。</TL>
            <TL hot>  - 保留 skill 預設：淺灰底、墨色文字、赭紅重點   <span style={{ color: '#E9B650' }}>← 寫法會變，找「預設」這一項</span></TL>
            <TL tone="dim">  - 自訂古典配色：米白底、墨色文字、朱紅重點</TL>
            <TL tone="dim">  - 提供網站、設計檔或色碼作為樣式來源</TL>
          </div></Step>
          <Step duration={STEP_MS}><TL tone="type">› 保留預設樣式，請直接產生並存檔。</TL></Step>
          <Step duration={STEP_MS}><div>
            <TL>• 已存成 圖/三國關係圖.html。</TL>
            <TL tone="dim">  包含勢力分框、依回目排列的事件、12 條平滑關係曲線，以及逐線來源表。</TL>
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
    <PromptsCopy step="2-2（線太亂時）" />
    <Fit z={0.92}>
      <div style={{ display: 'grid', gridTemplateColumns: '1080px 1fr', gap: 64, alignItems: 'center', position: 'relative' }}>
        <In i={0}>
          <Crop src={ddResult} alt="diagram-design 產生的三國關係圖：左邊蜀漢框裡是劉備、關羽、張飛，中間三個事件依回目由上到下，右邊是曹魏的曹操和東吳的孫權；十二條平滑曲線上只寫結義、守護、聯手這類關係" iw={2090} ih={1180} crop={[0, 0, 2090, 1180]} width={1080} />
          <Caption>在 Finder／檔案總管雙擊 圖/三國關係圖.html 打開</Caption>
        </In>
        <div style={{ display: 'grid', gap: 40 }}>
          <Steps>
            <Step duration={STEP_MS}><Callout n={1} title="勢力框裡放人物" detail="蜀漢在左；曹魏、東吳在右" /><MarkLayer width={1080} height={610}><RegionMark step n={1} x={2} y={3} w={19.5} h={95} badge="top" /></MarkLayer></Step>
            <Step duration={STEP_MS}><Callout n={2} title="事件依回目由上到下" detail="第 1、21、49–50 回" /><MarkLayer width={1080} height={610}><RegionMark step n={2} x={44} y={11} w={17} h={86} badge="right" /></MarkLayer></Step>
            <Step duration={STEP_MS}><Callout n={3} title="線上只寫關係" detail="出處列在圖下方的來源表" /><MarkLayer width={1080} height={610}><RegionMark step n={3} x={35.5} y={13} w={6} h={80} /></MarkLayer></Step>
          </Steps>
        </div>
      </div>
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
    <div style={{ fontSize: 34, lineHeight: 1.75, marginTop: 14 }}>{children}</div>
  </div>
);

const Eli5Rewrite: Page = () => (
  <Shell chapter={3} source={'eli5 github.com/dreambigou/eli5；卡片原文：維基文庫《三國演義》第 1 回'}>
    <PracticeEyebrow time="練習 2 第 3 步">練習 2｜eli5</PracticeEyebrow>
    <Heading>練習（Skill）：用 eli5 改寫劉備卡</Heading>
    <PromptsCopy step="2-3" />
    <PillRow>
      <Pill tag="定位">人物/劉備.md</Pill>
      <Pill tag="期望輸出">5 歲版</Pill>
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
            三人<Mk>越談越投合</Mk>，<Mk ok>隔天</Mk>就在<Mk ok>張飛莊後的桃園</Mk><Mk>立誓</Mk>，留下著名的 <Mk ok>[[桃園結義]]</Mk>；誓畢拜劉備為兄，<Mk ok>從此他成了關、張的大哥</Mk>
          </RewritePanel>
          <Step duration={STEP_MS}>
            <RewritePanel label="eli5 改寫後" file="整理/劉備-5歲版.md" tone="ok">
              三個人<Mk>越聊越合得來</Mk>。<Mk ok>隔天</Mk>，他們就在<Mk ok>張飛家後面的桃園</Mk>裡，<Mk>一起許下約定，成為兄弟</Mk>。這就是 <Mk ok>[[桃園結義]]</Mk>。<Mk ok>劉備成了關羽和張飛的大哥</Mk>。
            </RewritePanel>
          </Step>
        </Steps>
      </div>
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={30}>古文改成白話，事實和 [[連結]] 都留著</Takeaway></Step></Steps>
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
  <Shell source={'Digital Garden 文件 docs.forestry.md/getting-started/01-getting-started'}>
    <Eyebrow>附錄｜第四堂發布前 1／2</Eyebrow>
    <Heading>Frontmatter 的 dg-publish 被照抄</Heading>
    <In i={0} style={{ marginTop: 18, fontSize: 32, color: muted }}>dg-publish 是第四堂的公開開關：<strong style={{ color: ink }}>true＝會放上網站</strong></In>
    <Fit>
      <Stage h={360}>
        <Steps>
          <Layer h={360} label="原卡人物/劉備.md 有 dg-publish: true；eli5 改寫後的整理/劉備-5歲版.md 也照抄了 dg-publish: true">
            <InG i={1}><FrontCard x={0} file="人物/劉備.md" /></InG>
            <InG i={2}>
              <MapArrow x1={446} x2={556} y={150} hot />
              <text x="501" y="130" textAnchor="middle" fontSize="26" fontFamily={mono} fill={amber}>eli5</text>
            </InG>
            <InG i={3}><FrontCard x={572} file="整理/劉備-5歲版.md" hot /></InG>
          </Layer>
          <Step duration={STEP_MS}><Layer h={360} label="第四堂發布時，兩張劉備卡都會公開">
            <g className="aw3-build" style={buildDelay(0)}><MapArrow x1={1018} x2={1120} y={150} /></g>
            <g className="aw3-build" style={buildDelay(1)}>
              <rect x="1136" y="20" width="496" height="270" fill="#FFFFFF" stroke={rule} strokeWidth="2" />
              <rect x="1136" y="20" width="496" height="52" fill="#ECEAE8" />
              <SvgIcon kind="globe" x={1170} y={46} size={32} color={muted} />
              <text x="1200" y="56" fontSize="25" fill={muted}>第四堂的網站</text>
              <text x="1170" y="140" fontSize="30" fill={ink}>劉備</text>
              <text x="1170" y="200" fontSize="30" fill={ink}>劉備-5歲版</text>
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


const Section4: Page = () => <SectionPage chapter={4} label="04 / 自己寫" lead="把排時間軸的做法，寫成 SKILL.md" />;

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
  <Shell chapter={4} source={'回目順序：維基文庫《三國演義》zh.wikisource.org/wiki/三國演義'}>
    <Eyebrow>按小說回目排的橫向時間軸</Eyebrow>
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
            <g fill="none" stroke={amber} strokeWidth="4"><StepPath d="M680 150 H1590" i={1} /></g>
            <g className="aw3-build" style={buildDelay(2)}>
              <TimeDot x={700} n="第 1 回" name="桃園結義" />
              <TimeDot x={874} n="第 5 回" name="三英戰呂布" />
              <TimeDot x={1048} n="第 19 回" name="白門樓" />
              <TimeDot x={1222} n="第 21 回" name="煮酒論英雄" />
              <TimeDot x={1396} n="第 46 回" name="草船借箭" />
              <TimeDot x={1570} n="第 49 回" name="赤壁之戰" />
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
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={24}>讀卡片欄位、依回目排序、寫進 整理/時間軸.md</Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

// One section of the skeleton next to the callout that explains it. Sections after the
// first continue the same file panel, so the file builds up one section per click.
const SKEL_COLS = '1080px 1fr';
const SkelPart = ({ note, children }: { note: ReactNode; children: ReactNode }) => (
  <div style={{ display: 'grid', gridTemplateColumns: SKEL_COLS, gap: 52, alignItems: 'center' }}>
    <div style={{ background: '#FFFFFF', border: `1px solid ${rule}`, borderTop: 'none', padding: '4px 30px 10px', fontFamily: mono, fontSize: 25, lineHeight: 1.3, ['--cl-lh' as string]: 1.3 } as CSSProperties}>{children}</div>
    {note}
  </div>
);

const SkillSkeleton: Page = () => (
  <Shell chapter={4} source={'Agent Skills 規格 agentskills.io/specification；Codex Skills developers.openai.com/codex/skills'}>
    <Eyebrow>練習 3｜起點</Eyebrow>
    <Heading>練習用 SKILL.md 骨架</Heading>
    <Fit z={0.98}>
      <Steps>
        <In i={0} style={{ display: 'grid', gridTemplateColumns: SKEL_COLS, gap: 52, alignItems: 'center' }}>
          <CodeDoc title="sanguo-timeline/SKILL.md" size={25} lh={1.3}>
            <CL band={amberSoft}>---</CL>
            <CL band={amberSoft}>name: sanguo-timeline</CL>
            <CL band={amberSoft} n={1}>description: 把三國筆記庫的卡片依回目排成時間軸。</CL>
            <CL band={amberSoft}>  使用者說「三國時間軸」「排時間軸」時使用。</CL>
            <CL band={amberSoft}>---</CL>
            <CL># 三國時間軸</CL>
          </CodeDoc>
          <Callout n={1} title="description" detail="寫進使用者會說的話" />
        </In>
        <Step duration={STEP_MS}><SkelPart note={<Callout n={2} title="步驟：讀、排、寫" detail="可以照自己的話改" />}>
          <CL band={blueSoft} n={2}>## 步驟</CL>
          <CL band={blueSoft}>1. 讀 關係/ 每張卡的 回目、年份、參與人物</CL>
          <CL band={blueSoft}>2. 依回目由小到大排；沒有回目的卡，最後列出來</CL>
          <CL band={blueSoft}>3. 寫入 整理/時間軸.md</CL>
        </SkelPart></Step>
        <Step duration={STEP_MS}><SkelPart note={<Callout n={3} title="輸出格式：長什麼樣" detail="名字不加 [[ ]]，第四堂能直接發布" />}>
          <CL band={sage} n={3}>## 輸出格式</CL>
          <CL band={sage}>- 一段 HTML，畫成橫向時間軸：事件依回目由左到右排在一條線上</CL>
          <CL band={sage}>- 線上只寫事件名稱，線下寫回目和年份</CL>
          <CL band={sage}>- 比畫面寬的時候可以左右拖曳，看得到完整時間軸</CL>
          <CL band={sage}>- HTML 裡的名字用純文字，不加 [[ ]]</CL>
          <CL band={sage}>- 時間軸下方列出每個事件的來源卡</CL>
        </SkelPart></Step>
      </Steps>
    </Fit>
  </Shell>
);

const HtmlLinkTest: Page = () => (
  <Shell source={'Digital Garden 文件 docs.forestry.md；github.com/oleeskild/obsidian-digital-garden'}>
    <Eyebrow>附錄｜第四堂發布前 2／2</Eyebrow>
    <Heading>HTML 裡的 [[連結]] 不會轉換</Heading>
    <Fit>
      <div style={{ display: 'grid', gridTemplateColumns: '660px 1fr', gap: 72, alignItems: 'center', position: 'relative' }}>
        <In i={0}>
          <Crop src={dgHtmlTest} alt="Digital Garden 網站的測試頁：HTML 區塊裡的 [[劉備]]、[[關羽]]、[[張飛]] 原樣顯示成文字；下方顯示 script 有執行" iw={1400} ih={900} crop={[400, 180, 640, 580]} width={660} />
          <Caption>放上網站後的樣子</Caption>
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
  <Shell chapter={4} source={'skills 安裝工具（本機資料夾也能裝）github.com/vercel-labs/skills；Codex Skills developers.openai.com/codex/skills'}>
    <PracticeEyebrow time="38 分鐘（五步，後兩步選做）">練習 3｜安裝骨架</PracticeEyebrow>
    <Heading>練習（Skill）：npx skills add 裝骨架</Heading>
    <PromptsCopy step="3-1" />
    <In i={0} style={{ marginTop: 18, fontSize: 30, color: muted }}>先把 <Path size={28}>aw-03-lab/關係/</Path> 的三張卡，拖進筆記庫的 <Path size={28}>關係/</Path></In>
    <Fit>
      <div style={{ display: 'grid', gridTemplateColumns: '1010px 1fr', gap: 40, alignItems: 'center' }}>
        <TermBox title="終端機｜實際輸出（節錄，路徑每台不同）" size={25}>
          <Steps>
            <TL tone="ask">› /quit</TL>
            <TL tone="note"># 打 npx skills add 和空格，把骨架資料夾拖進來</TL>
            <TL><Typed>$</Typed> npx skills add ~/Downloads/aw-03-lab/sanguo-timeline</TL>
            <Step duration={STEP_MS}><div>
              <TL tone="dim">◇  Local path validated</TL>
              <TL hot>●  Skill: sanguo-timeline</TL>
              <TL tone="note"># 四題跟第二章一樣：Enter、Project、Symlink、Yes</TL>
            </div></Step>
            <Step duration={STEP_MS}><div>
              <TL tone="dim">◇  Installed 1 skill</TL>
              <TL hot>│  ✓ ./.agents/skills/sanguo-timeline</TL>
            </div></Step>
          </Steps>
        </TermBox>
        <Steps>
          <Step duration={STEP_MS}><div style={{ background: '#FFFFFF', border: `1px solid ${rule}`, padding: '14px 10px' }}>
            <SmallLabel color={quiet}>　三國人物知識庫</SmallLabel>
            <VaultLine depth={0} name=".agents/skills/" />
            <VaultLine depth={1} name="sanguo-timeline/" hot />
            <div style={{ fontSize: 26, color: muted, padding: '10px 14px 0', lineHeight: 1.45 }}>資料夾名稱要跟 SKILL.md 的 name 一樣</div>
          </div></Step>
        </Steps>
      </div>
      <Steps>
        <Step duration={STEP_MS}><div style={{ display: 'flex', alignItems: 'center', gap: 18, marginTop: 32 }}>
          <ChipStep n={1}>再打 <Path size={30}>codex</Path></ChipStep><ChipArrow />
          <ChipStep n={2}>問「列出你能用的 skills」</ChipStep><ChipArrow />
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 12, background: sage, border: `2px solid ${okGreen}`, padding: '10px 22px', fontSize: 30 }}><Icon kind="ok" size={36} color={okGreen} />看到 <Path size={30}>sanguo-timeline</Path></span>
        </div></Step>
      </Steps>
    </Fit>
  </Shell>
);

// A callout placed to the right of the 1080px terminal, inside the same <Step> as the line it explains.
const RUN_NOTE: CSSProperties = { position: 'absolute', left: 1132, top: 96, width: 500, color: 'var(--osd-text)', fontFamily: 'var(--osd-font-body)', whiteSpace: 'normal' };

const RunTimeline: Page = () => (
  <Shell chapter={4} source={'Codex Skills 文件 developers.openai.com/codex/skills'}>
    <PracticeEyebrow time="練習 3 第 2 步">練習 3｜執行</PracticeEyebrow>
    <Heading>練習（Skill）：執行三國時間軸</Heading>
    <PromptsCopy step="3-2" />
    <In i={0} style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 44 }}>
      <ChipStep n={1}>在剛重開的 Codex</ChipStep><ChipArrow />
      <ChipStep n={2}>貼上練習 3-2</ChipStep><ChipArrow />
      <ChipStep n={3}>Obsidian 打開 <Path size={28}>整理/時間軸.md</Path></ChipStep>
    </In>
    <Fit>
      {/* Each step reveals a terminal line and, beside the terminal, the callout that explains it. */}
      <div style={{ position: 'relative', height: 300 }}>
        <TermBox title="Codex 實際紀錄（節錄）" width={1080} size={28}>
          <Steps>
            <TL tone="ask">› 請使用 sanguo-timeline skill，排出三國時間軸。</TL>
            <Step duration={STEP_MS}>
              <div>
                <TL tone="dim">• 我會使用 `sanguo-timeline` skill，先讀取其規則……</TL>
                <TL hot><Typed>$</Typed> sed -n '1,240p' .agents/skills/sanguo-timeline/SKILL.md</TL>
              </div>
              <div style={RUN_NOTE}><Callout n={1} title="先讀你寫的 SKILL.md" detail="點名後，Codex 照這份做" /></div>
            </Step>
            <Step duration={STEP_MS}>
              <TL hot>• 已完成三國時間軸，依回目由小到大排列，共 6 張關係卡；……</TL>
              <div style={{ ...RUN_NOTE, top: 200 }}><Callout n={2} title="寫好 整理/時間軸.md" detail="6 張關係卡，依回目排" /></div>
            </Step>
          </Steps>
        </TermBox>
      </div>
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={40}>Codex 照 SKILL.md 寫的內容執行</Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

const TimelineResult: Page = () => (
  <Shell chapter={4}>
    <Eyebrow>練習 3｜先看第一次跑的結果</Eyebrow>
    <Heading>按回目排出的橫向時間軸</Heading>
    <Fit>
      <div style={{ position: 'relative', marginTop: 12 }}>
        <In i={0}>
          <Crop src={timelineFirstRun} alt="第一次跑出的時間軸：一條橫線上依序是桃園結義、三英戰呂布、白門樓、煮酒論英雄、草船借箭、赤壁之戰，線下是第 1、5、19、21、46、49 回；第 5 回以後都寫年份：未記載；下方來源卡是藍色底線的連結" iw={2480} ih={1400} crop={[40, 360, 2400, 760]} width={1500} />
          <Caption>整理/時間軸.md 裡的 HTML 畫出來的樣子</Caption>
        </In>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 40, marginTop: 28 }}>
          <Steps>
            <Step duration={STEP_MS}><Callout n={1} title="6 件事，依回目排好" detail="小說順序，不是精確年代" /><MarkLayer width={1500} height={475}><RegionMark step n={1} x={1} y={2} w={98} h={23} badge="left" /></MarkLayer></Step>
            <Step duration={STEP_MS}><Callout n={2} title="年份寫「未記載」" detail="SKILL.md 沒說沒年份要怎麼寫" /><MarkLayer width={1500} height={475}><RegionMark step n={2} x={18} y={24} w={81} h={10} badge="left" /></MarkLayer></Step>
            <Step duration={STEP_MS}><Callout n={3} title="來源卡變成連結" detail="SKILL.md 沒說要不要連結" /><MarkLayer width={1500} height={475}><RegionMark step n={3} x={2.5} y={56.5} w={66.5} h={43} badge="right" /></MarkLayer></Step>
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
  <Shell chapter={4} source={'Anthropic 2025, Equipping Agents for the Real World with Agent Skills（開發與評估 Skill）'}>
    <Eyebrow>練習 3｜調整</Eyebrow>
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
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={16}>改一次 SKILL.md，之後每次執行都照新規則</Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

// One real flaw from the first run (left) and, on a click, the rule that fixed it and the re-run output (right).
const EditExample: Page = () => (
  <Shell chapter={4}>
    <PracticeEyebrow time="練習 3 第 3 步">練習 3｜補規則</PracticeEyebrow>
    <Heading>SKILL.md 補兩行規則，再跑一次</Heading>
    <PromptsCopy step="3-3" />
    <Fit>
      <In i={0}>
        <CodeDoc title=".agents/skills/sanguo-timeline/SKILL.md｜輸出格式最後補兩行" size={26}>
          <CL band={sage} color={okGreen} n={1} dot={36}>+ 年份照卡片抄，卡片沒寫就不寫，不要寫「未標註」「未記載」或「—」</CL>
          <CL band={sage} color={okGreen} n={2} dot={36}>{'+ 來源卡只寫檔名純文字，不做連結，不用 <a href>，也不用 [[ ]]'}</CL>
        </CodeDoc>
      </In>
      <div style={{ display: 'grid', gridTemplateColumns: '1150px 1fr', gap: 32, alignItems: 'center', marginTop: 24 }}>
        <Steps>
          <Step duration={STEP_MS}><div>
            <SmallLabel color={okGreen}>再跑一次</SmallLabel>
            <div style={{ marginTop: 10 }}>
              <Crop src={timelineFixed} alt="補兩行規則後重跑的時間軸：六件事依回目排好，線下只有回目，只有桃園結義多寫中平元年；下方來源卡是六行純文字檔名，沒有連結" iw={2400} ih={760} crop={[0, 0, 2400, 760]} width={1150}>
                <MarkLayer width={1150} height={364}>
                  <RegionMark step n={1} x={1.5} y={19} w={97} h={13} badge="left" />
                  <RegionMark step n={2} x={1.5} y={47} w={23} h={52} badge="right" />
                </MarkLayer>
              </Crop>
            </div>
          </div></Step>
        </Steps>
        <Steps>
          <Step duration={STEP_MS}><div style={{ display: 'grid', gap: 14, justifyItems: 'start' }}>
            <SmallLabel>換你補</SmallLabel>
            <ChipStep n={1}><Path size={26}>/quit</Path></ChipStep>
            <ChipStep n={2}><Path size={26}>open -e …/SKILL.md</Path></ChipStep>
            <ChipStep n={3}>貼兩行、存檔</ChipStep>
            <ChipStep n={4}><Path size={26}>codex</Path> 再跑</ChipStep>
          </div></Step>
        </Steps>
      </div>
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
  <Shell chapter={4}>
    <PracticeEyebrow time="練習 3 第 4 步">練習 3｜進階選做</PracticeEyebrow>
    <Heading>進階：只排出劉備的事件</Heading>
    <PromptsCopy step="3-4" />
    <In i={0} style={{ marginTop: 40 }}>
      <CodeDoc title="自己在 SKILL.md 的步驟加第 4 步" size={28}>
        <CL band={sage} color={okGreen}>+ 4. 使用者指定人物時，只留下參與人物有他的事件</CL>
      </CodeDoc>
    </In>
    <Steps><Step duration={STEP_MS}><div style={{ marginTop: 20 }}><PromptBox size={29}>請使用 sanguo-timeline skill，只排劉備的事件，存成 整理/時間軸-劉備.md</PromptBox></div></Step></Steps>
    <Fit>
      <Stage h={240}>
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
          <Step duration={STEP_MS}><Layer h={260} label="結果：草船借箭的參與人物沒有劉備，被拿掉；其他五件留下">
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
        <div style={{ background: sage, padding: '12px 28px' }}><StatusLine ok size={29}>草船借箭沒有劉備，拿掉，剩 5 件</StatusLine></div>
      </div></Step></Steps>
    </Fit>
  </Shell>
);

// One drawing of the same 整理/時間軸.md: who drew it, then a crop of the real page.
// One drawing Skill's result: its name, then the whole timeline at full width.
// Later results sit on top of earlier ones, so each click swaps the picture.
const StyleRow = ({ src, alt, name, sub, cover = false }: { src: string; alt: string; name: string; sub: string; cover?: boolean }) => (
  <div style={{ position: cover ? 'absolute' : 'relative', inset: cover ? 0 : undefined, background: 'var(--osd-bg)' }}>
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginBottom: 12 }}>
      <span style={{ fontFamily: mono, fontSize: 32, fontWeight: 600, color: amber }}>{name}</span>
      <span style={{ fontSize: 27, color: muted }}>{sub}</span>
    </div>
    <img src={src} alt={alt} style={{ width: 1632, height: 272, display: 'block', border: `1px solid ${rule}` }} />
  </div>
);

const TimelineStyles: Page = () => (
  <Shell chapter={4} source={'範例 aw-03-sample-output/練習3/；npx skills find github.com/vercel-labs/skills'}>
    <PracticeEyebrow time="練習 3 第 5 步">練習 3｜進階選做</PracticeEyebrow>
    <Heading>進階：換一個畫圖 Skill</Heading>
    <PromptsCopy step="3-5" />
    <In i={0} style={{ marginTop: 18, fontSize: 30, color: muted }}>同一份 整理/時間軸.md，換一個 Skill 畫，會長一樣嗎？</In>
    <Fit>
      <div style={{ position: 'relative' }}>
        <Steps>
          <Step duration={STEP_MS}><StyleRow src={tlDiagram} name="diagram-design" sub="練習 1-4 已裝" alt="diagram-design 畫的時間軸：灰底、細黑線、小圓點，六件事平均排開，事件名稱在線上，回目在線下" /></Step>
          <Step duration={STEP_MS}><StyleRow cover src={tlArchify} name="archify" sub="要另外裝" alt="archify 畫的時間軸：米色底、大號襯線字，紅色圓點，六件事平均排開" /></Step>
          <Step duration={STEP_MS}><StyleRow cover src={tlInstructor} name="自訂 HTML" sub="照需求另外寫" alt="自訂 HTML 時間軸：橘色粗線照第 1 到 120 回的比例排（圖只截到第 50 回），事件名稱放在黃色標籤裡，看得出第 21 到 46 回中間空了一大段" /></Step>
        </Steps>
      </div>
      <Steps><Step duration={STEP_MS}><div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 20, marginTop: 40, fontSize: 30 }}>
        <span style={{ color: muted }}>找別的畫圖 Skill：</span>
        <span style={{ fontFamily: mono, background: term, color: '#8DD4A0', padding: '8px 20px' }}>$ npx skills find timeline</span>
        <span style={{ color: muted }}>或到 skills.sh 搜</span>
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
    <Heading>今天學的四件事</Heading>
    <Fit>
      <Figure h={260} label="四章：Skill 是做事說明、寫出名稱就能用；用 npx skills add 安裝、畫圖和改白話、改 SKILL.md 再跑">
        <g fill="none" stroke={amber} strokeWidth="4"><DrawPath i={4} d="M202 80 H1430" /></g>
        <InG i={0}><RecapStop x={150} n={1} verb="寫出名稱就能用" /></InG>
        <InG i={1}><RecapStop x={594} n={2} verb="npx skills add" /></InG>
        <InG i={2}><RecapStop x={1038} n={3} verb="畫圖、改白話" /></InG>
        <InG i={3}><RecapStop x={1482} n={4} verb="改 SKILL.md 再跑" /></InG>
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
  <Shell source={'Forestry.md 入門 docs.forestry.md/getting-started/01-getting-started'}>
    <Eyebrow>下一堂預告</Eyebrow>
    <Heading>第四堂：發布成網站</Heading>
    <Fit>
      <Figure h={300} label="Obsidian 裡勾好要公開的卡，按發布，Forestry 建成網站，得到一個網址">
        <InG i={0}><SiteStop x={260} kind="folder" label="筆記庫" sub="含 時間軸.md" /></InG>
        <InG i={1}><MapArrow x1={360} x2={710} y={100} /></InG>
        <InG i={2}><SiteStop x={816} kind="terminal" label="Forestry" sub="建成網站" /></InG>
        <InG i={3}><MapArrow x1={922} x2={1272} y={100} hot /></InG>
        <InG i={4}><SiteStop x={1372} kind="globe" label="網址" sub="名字.forestry.md" hot /></InG>
      </Figure>
      <Steps><Step duration={STEP_MS}><div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 32, marginTop: 56 }}>
          <div style={{ background: sage, padding: '16px 28px' }}><StatusLine ok size={30}>註冊 Forestry.md</StatusLine></div>
          <div style={{ background: sage, padding: '16px 28px' }}><StatusLine ok size={30}>按 Plant 種一座花園</StatusLine></div>
          <div style={{ background: sage, padding: '16px 28px' }}><StatusLine ok size={30}>抄下自己的網址</StatusLine></div>
        </div>
        <div style={{ textAlign: 'center', marginTop: 32, fontSize: 28, color: muted }}>
          課前作業步驟：<a href="https://github.com/Chrouos/AI-workshop-slides/blob/main/examples/aw-04-lab/prompts.md" target="_blank" rel="noreferrer" style={{ fontFamily: mono, color: amber, fontWeight: 600 }}>examples/aw-04-lab/prompts.md</a>
        </div>
      </div></Step></Steps>
    </Fit>
  </Shell>
);

// ---------- Appendix ----------

// One row of the appendix contents: the situation, then the pages to turn to.
const APX_COLS = '240px 1fr 220px';
const ApxRow = ({ i, group, need, pages }: { i: number; group?: string; need: string; pages: Page[] }) => (
  <In i={i} style={{ display: 'grid', gridTemplateColumns: APX_COLS, alignItems: 'center', minHeight: 78, borderBottom: `1px solid ${rule}` }}>
    <SmallLabel color={group ? amber : quiet}>{group ?? ''}</SmallLabel>
    <span style={{ fontSize: 31 }}>{need}</span>
    <span style={{ fontSize: 30, color: amber, textAlign: 'right' }}>第 {pages.map(pageOf).join('–')} 頁</span>
  </In>
);

const AppendixIndex: Page = () => (
  <Shell>
    <Eyebrow>附錄｜需要時再翻</Eyebrow>
    <Heading>附錄目錄</Heading>
    <Fit>
      <div style={{ borderTop: `1px solid ${rule}` }}>
        <ApxRow i={0} group="裝不起來" need="終端機出現錯誤訊息" pages={[InstallErrors]} />
        <ApxRow i={1} need="指令都不行：下載 ZIP，自己放進去" pages={[ZipFallback]} />
        <ApxRow i={2} group="想多懂一點" need="沒點名時，Codex 怎麼挑 Skill" pages={[CallByName, DescriptionTrigger]} />
        <ApxRow i={3} need="裝很多 Skill，會不會塞滿上下文" pages={[LoadOnUse]} />
        <ApxRow i={4} need="Prompt、AGENTS.md、Skill、MCP 的差別" pages={[PromptAgentsSkill, SkillOrMcp]} />
        <ApxRow i={5} group="第四堂發布前" need="5 歲版也帶著 dg-publish" pages={[DgPublishCopied]} />
        <ApxRow i={6} need="HTML 裡的 [[連結]] 不會轉成連結" pages={[HtmlLinkTest]} />
      </div>
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
    <RefHint>到橘色那個網站，搜尋下一行的標題就找得到</RefHint>
    <Fit>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'start' }}>
        <In i={0}>
          <RefGroup label="Agent Skills">
            <RefItem who="Anthropic 2025" where="anthropic.com" title="Equipping Agents for the Real World with Agent Skills" />
            <RefItem who="Agent Skills 規格" where="agentskills.io" title="Specification：name、description、資料夾結構" />
            <RefItem who="OpenAI Codex 文件" where="developers.openai.com" title="Skills：用到才讀全文、.agents/skills 位置" />
            <RefItem who="Vercel Labs" where="github.com" title="skills：npx skills add 安裝工具；skills.sh 搜尋 Skill" />
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
    <Eyebrow>延伸閱讀｜第 2–4 章用到的工具與原文</Eyebrow>
    <Heading>參考資料（二）：兩個 Skill 與原文</Heading>
    <RefHint>到橘色那個網站，搜尋下一行的標題就找得到</RefHint>
    <Fit>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'start' }}>
        <In i={0}>
          <RefGroup label="今天裝的 Skill">
            <RefItem who="Cathryn Lavery" where="github.com" title="diagram-design：把資料畫成圖的 Skill" />
            <RefItem who="DreambigOu" where="github.com" title="ELI5：依對象用白話解釋的 Skill" />
            <RefItem who="OpenAI" where="learn.chatgpt.com" title="Build skills：Skill 放在哪裡、怎麼載入" />
          </RefGroup>
        </In>
        <In i={1}>
          <RefGroup label="原文、發布">
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

export const meta: SlideMeta = {
  title: 'aw-03 Skills',
  createdAt: '2026-10-17T02:58:51.682Z',
  theme: 'thoughtstream',
};

const deck: Page[] = [
  Cover, Review, Agenda, ToolCheck, InstallNode,
  Section1, Eli5Intro, TaskPrompt, PickSkill, ResultTrace, Eli5Front, Eli5Body, WhySkill, SkillFolder, CompareTable,
  Section2, SkillsAddCmd, RepoName, CdVault, AddEli5, AddEli5Scope, AddDiagram, SkillsList, InstallVideo,
  Section3, DiagramRun, DiagramResult, UseVideo, Eli5Rewrite, BreakPage,
  Section4, TimelineGoal, SkillSkeleton, SaveSkill, RunTimeline, TimelineResult, EditLoop, EditExample, TimelineVideo, PersonFilter, TimelineStyles,
  Recap, NextLesson, ReferencesSkills, ReferencesTools,
  AppendixIndex, InstallErrors, ZipFallback, CallByName, DescriptionTrigger, LoadOnUse, PromptAgentsSkill, McpPlug, SkillOrMcp, DgPublishCopied, HtmlLinkTest,
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
- 一段 HTML，畫成橫向時間軸：事件依回目由左到右排在一條線上
- 線上只寫事件名稱，線下寫回目和年份
- 比畫面寬的時候可以左右拖曳，看得到完整時間軸
- HTML 裡的名字用純文字，不加 [[ ]]
- 時間軸下方列出每個事件的來源卡`;

// Speaker notes, keyed by page so they stay aligned with the deck order.
const NOTES = new Map<Page, string>([
  [Cover, `00:00–01:00。第三堂講 Skills。前兩堂用 Codex 寫了大綱，做出三國筆記庫；今天把常做的事寫成說明書，交給 Codex 照著做。先裝兩個別人寫好的 Skill 來用，最後自己寫一個「三國時間軸」。
請大家先在自己的筆電打開這份簡報：${DECK_SITE}。今天的提示詞都在 prompts.md，練習頁右上角的連結點下去就是，整段複製貼上，不用照投影片打字。今天的教材整包在 aw-03-lab.zip：${LAB_ZIP_URL} ，裡面有 prompts.md、時間軸 Skill 骨架 sanguo-timeline，和第四章要用的三張關係卡。講師每個練習的實跑成品放在線上的 aw-03-sample-output/，想對照再看。Codex 一樣開在自己的「三國人物知識庫」，不是開在 aw-03-lab。所有教材的總表：https://github.com/Chrouos/AI-workshop-slides/tree/main/examples`],
  [Review, `01:00–06:00。先回顧上一堂。左邊是筆記庫的資料夾：人物 5 張、勢力 3 張、關係 3 張；原文資料夾有第 1 到 21 回全文，和第 37、38、46 回的節選；整理資料夾裡放著第一堂寫的大綱；模板資料夾有關係卡模板。右邊用顏色對回左邊：棕色欄的圓圈是人物資料夾裡的五張人物卡，綠色欄的方框是關係資料夾裡的三張關係卡。
按一下：這 12 條線（桃園結義 3 條、煮酒論英雄 4 條、赤壁之戰 5 條），都是關係卡最後一行「參與人物」寫出來的，上一堂我們請 Codex 照這個規則畫過 ASCII 關係圖。
請大家打開上一堂的筆記庫，確認卡片都還在。今天全部接著用這一個筆記庫。
最後一下：今天用 Skill 畫一張關係圖、改寫一張卡，最後自己寫 Skill 排出時間軸。`],
  [Agenda, `06:00–08:00。今天四章、三個練習。先看懂一份 SKILL.md，再安裝兩個熱門 Skill，接著用 Skill 畫一張關係圖、改寫一張卡，最後跑自己的 sanguo-timeline，補一條規則再跑一次。做得快的同學有加碼題：標籤疊到就請 Codex 修、只排劉備的事件、換一個畫圖 Skill 畫同一條時間軸，到那一頁再說。第三章做完，64 分休息 5 分鐘。
第四章花的時間最多：跑自己的 Skill、看結果、改 SKILL.md、再跑一次，這是今天的重點。裝不起來時的解法、想多懂一點的內容，都放在最後的附錄，需要時再翻。最後 8 分鐘總結、預告第四堂；第四堂前請先註冊 Forestry.md。
下一頁先做練習 1 的第一步：檢查電腦有沒有 Node.js 和 git。`],
  [Section1, `11:00–11:15。第一章：什麼是 Skill。先認識今天要用的 eli5，再跟著一個任務走一遍：下提示詞、看 Codex 有沒有用到它、看改寫結果，最後打開 eli5 的 SKILL.md，看那些改法是從哪裡來的。接著講為什麼要存成 Skill、Skill 資料夾長什麼樣子，最後用一張表和 Prompt、AGENTS.md、MCP 比一比。還在裝 Node.js 的同學，邊裝邊聽。`],
  [Eli5Intro, `11:15–12:45。先認識今天第一個用到的 Skill：eli5。全名是 Explain Like I'm 5，英文網路上常見的說法，意思是「講得像我只有 5 歲」，請對方用最簡單的方式解釋。
eli5 只做一件事：同一段內容，看是誰在聽，換一種講法。左邊是要講的內容，中間是 eli5，它先認出聽眾，再決定怎麼講。右邊四種聽眾，都是它的 SKILL.md 裡真的有寫的：5 歲小孩用簡單的詞、短句子、好玩的比喻；國中生要先解釋術語、一步一步講；主管先聽影響、時程、成本；爸媽就用他們熟悉的東西打比方。檔案裡還有更多，例如 10 歲、大學生、工程師、朋友。
按一下：今天的任務，要講的內容是 人物/劉備.md，聽眾選 5 歲小孩，對到第一列。
最後一下：任務目的。劉備卡照原文寫，「招兵榜文」「投軍」這種詞讀起來吃力。我們要的是內容不變、講法換掉，讓 5 歲小孩也聽得懂。第三章練習 2 大家會自己做一次。`],
  [TaskPrompt, `12:45–14:15。任務範例：把劉備卡講給 5 歲小孩聽。這是第三章練習 2-3 的提示詞，大家等一下會自己貼。
先看提示詞裡的兩種顏色。按一下：藍底的部分寫在提示詞裡，每次都會變：這次是哪張卡、給誰看、存到哪裡、有什麼限制，例如只用原卡的內容、保留 [[連結]]。橘底只有一句「請使用 eli5 skill」，把「怎麼解釋給這個聽眾聽」交給 eli5。
要分清楚：保留連結、存到 整理/ 這些要求，是我們寫在提示詞裡的，不是 eli5 自己會做的事。eli5 只負責「依聽眾調整解釋方式」。
最後一下：講給 5 歲小孩聽要怎麼寫？Codex 自己不知道，它去翻 eli5。下一頁看它怎麼翻。`],
  [PickSkill, `14:15–15:45。點名，就是在提示詞寫出 Skill 名稱，明確告訴 Codex 要用哪一個。這是講師 2026-10-30 的實跑紀錄（Codex 0.165.0）。
按一下：Codex 先回報「我會先讀取 eli5 skill 和劉備卡片，再用適合 5 歲小孩的說法寫成新檔」。看到這一句，才確定它有要用 eli5。
按一下：接著它執行 cat .agents/skills/eli5/SKILL.md，把整份 SKILL.md 讀進來，同時讀劉備卡，再照 SKILL.md 的做法改寫。等一下大家自己跑的時候，也看這兩行。
按一下：沒點名的話，Codex 會看每個 Skill 的 description 自己挑，可能挑對，也可能挑錯或沒用到，細節放附錄第 ${pageOf(CallByName)}–${pageOf(LoadOnUse)} 頁。今天的練習提示詞全部都有點名。
最後一下：點名是明確告訴它；看到回報才算確認。正式的點名寫法也可以在提示詞打 $ 從選單挑，例如 $eli5。下一頁先看它改寫出來的結果。`],
  [ResultTrace, `15:45–17:45。先看輸出。左邊是原卡第二段，右邊是 eli5 改寫的實際產出（講師 2026-10-30 實跑，範例檔 aw-03-sample-output/練習2/劉備-5歲版.md）。上面的顏色：橘底是換了說法的地方，綠底是原封不動的地方。請大家先自己找找看，哪裡不一樣？
按一下：詞變簡單。榜文變成告示，投軍變成當兵。
按一下：句子變短。原卡這一段是一整句，右邊拆成六個短句，一句只講一件事。
按一下：多了比喻。整份改寫的開頭多了一句：「你可以把他想成一個想帶著大家一起做大事的隊長」，原卡沒有這句。
按一下：沒變的。[[張飛]]、[[關羽]] 這兩個連結都還在，事件也照原卡的順序。
最後一下：這些改法從哪來？Codex 剛剛讀了 eli5 的 SKILL.md，接下來兩頁打開它看。`],
  [Eli5Front, `17:45–19:45。打開 eli5 的 SKILL.md。它是純文字檔，用一般的文字編輯器就能打開，放在筆記庫的 .agents/skills/eli5/SKILL.md，第二章會裝。先看最上面兩條 --- 中間這一段，只有兩欄。
按一下：第一欄 name，Skill 的名字。資料夾也要叫這個名字；提示詞裡點名「請使用 eli5 skill」，寫的就是它。
按一下：第二欄 description 的前半，說它做什麼：依照聽眾的理解程度，解釋任何主題、程式碼、概念或錯誤訊息。
按一下：description 的後半，說什麼時候用：使用者說「explain like I am」「ELI5」「explain this to my」「break this down for」「simplify this for」這類話的時候。原文後面還有一句：就算只說了「explain to my wife」「tell my boss」這種半句，也要用。
最後一下：Codex 開 Session 時，只先讀每個 Skill 的這兩欄，當成一張清單；被點名，或比對 description 選中了，才讀下面的全文。所以 description 要寫清楚做什麼、何時用。沒點名時怎麼挑、裝很多 Skill 會不會塞滿上下文，在附錄第 ${pageOf(CallByName)}–${pageOf(LoadOnUse)} 頁。`],
  [Eli5Body, `19:45–22:00。再看本文，這段才是做法。畫面只節錄幾行，完整原文在頁面最下面的連結，筆電上點開就是 GitHub。
按一下：第一塊，Step 1 先認出聽眾。裡面有四張對照表：年齡、年級、職業、家人朋友。提示詞寫了「5 歲小孩」，對上 Age 5 那一列：用很簡單的詞、拿玩具和動物打比方、句子要短。這對得上上一頁的「詞變簡單」「句子變短」。表格下面還有一句：沒說聽眾是誰，就當成 5 歲。Step 2 是先讀懂要講的內容，這次就是劉備卡。
按一下：第二塊，Step 3 照做法寫。Structure 規定順序：先用一句話說是什麼、打比方、補細節、最後說跟你有什麼關係；Language Calibration 說不用艱深的詞、一句只講一件事。開頭那句「隊長」的比喻，對得上這裡的「打比方」。我們只能說「對得上」，看不到模型內部是不是因為這一條才這樣改。
按一下：那 [[連結]] 為什麼還在？翻遍 eli5 都沒有這條規則。保留連結、存到 整理/劉備-5歲版.md、只用卡片裡有的內容，都是我們寫在提示詞裡的，就是任務頁的藍底。提示詞沒寫的話，連結可能就不見了。
最後一下：做法來自 Skill，這次的要求來自提示詞。name 和 description 每份 Skill 都要寫；下面的做法沒有固定格式，依任務寫。eli5 用 Step 1、2、3，第四章我們自己寫的時間軸 Skill 會用「步驟」和「輸出格式」兩段。`],
  [WhySkill, `22:00–23:30。那為什麼要把做法存成 Skill？第一列是剛剛的任務。
按一下：換成關羽卡，提示詞只改藍底的卡片名稱。
按一下：換成曹操卡、改給國中生看，提示詞改了兩個地方，eli5 一個字都不用動，它的對照表裡本來就有國中生（Middle school）該怎麼講。這兩列是示意，講師沒有實跑。
像食譜架：做法先存好，要用時翻出來，不用每次重新交代怎麼解釋。
最後一下：每次不同的寫提示詞，可重用的做法存成 Skill。分清楚這兩件事，第四章自己寫 Skill 時才知道哪些要寫進 SKILL.md。`],
  [SkillFolder, `23:30–24:30。Skill 在電腦裡就是一個資料夾。eli5 的資料夾裡只有一個 SKILL.md。
按一下：diagram-design 比較大，除了 SKILL.md，還有 references、scripts、assets，放參考資料、小程式和圖檔。
最後一下：每個 Skill 都有 SKILL.md；其他檔案是附件，看需要才有。Agent 讀 SKILL.md 時，會照裡面的指示再去翻附件。`],
  [DescriptionTrigger, `（附錄，課堂不講；想知道沒點名時 Codex 怎麼挑 Skill 再看。）Codex 怎麼知道該用哪個 Skill？Codex 會看 description。像在書架前找書，看書背就大概知道該拿哪本。你說「把劉備卡用 5 歲小孩聽得懂的方式重新說一次」，架上有四個 Skill，各自的 description 寫著它管什麼。
按一下：Codex 比對之後，eli5 寫著「依對象用白話解釋」，跟你的要求最接近，Codex 就選用 eli5。這是 Codex 自己判斷的，不是一個開關：你的說法跟 description 差太多，Codex 可能沒挑到，或挑錯。
最後一下：description 寫清楚何時用，Codex 比較容易挑中。自己寫 Skill 時，這一行最重要。`],
  [LoadOnUse, `（附錄，課堂不講。）裝了很多 Skill，會不會塞滿 Codex 的上下文？不會，因為 Codex 分五步讀 Skill。第 1 步在開 Session 時就做了：Codex 載入每個 Skill 的名稱和 description，就是一張清單。
按一下：第 2 步，你提問，例如把劉備卡改成 5 歲小孩聽得懂的版本。
按一下：第 3 步，Codex 拿你的問題比對每個 description，就是上一頁的隱式啟用。
按一下：第 4 步，選中 eli5。
按一下：第 5 步，到這裡 Codex 才把整份 SKILL.md 讀進來，照裡面的步驟做。SKILL.md 如果附了參考資料或程式，也是用到時才讀。
按一下：下面是實際紀錄。Codex 先回一句「我會使用 eli5 skill」，這是第 4 步；接著用 cat 指令把筆記庫裡那份 SKILL.md 整份讀進來，這是第 5 步（講師 2026-10-29 實測，Codex 0.165.0，eli5 裝在筆記庫裡）。第 1 到 4 步，Codex 只看名稱和 description，官方文件說這張清單通常只佔上下文 2% 以內。
最後一下：選中 Skill 之後，Codex 才讀整份 SKILL.md。所以多裝幾個沒關係，description 一定要寫好。`],
  [CallByName, `（附錄，課堂不講；想知道沒點名時 Codex 怎麼挑再看。）正課第 ${pageOf(PickSkill)} 頁我們是點名要用 eli5。如果提示詞沒寫 Skill 名稱呢？上面這一列是自動挑：提示詞沒寫 Skill 名稱，Codex 拿你的問題比對每個 Skill 的 description，可能選中 eli5，也可能沒選中或選錯。
按一下：下面這一列是點名：提示詞直接寫「請使用 eli5 skill」，Codex 不用比對，直接選中 eli5，接著一樣讀整份 SKILL.md。這是我們實測時用的提示詞開頭。Codex 正式的點名寫法，是在提示詞打 $ 從選單挑 Skill，例如 $eli5；直接寫出名稱，實測也會選中。
最後一下：點名是明確告訴 Codex 用哪一個，還是要看它回報「我會使用 eli5」才算確認。今天的練習提示詞，全部都有點名。
Codex 怎麼比對 description、裝很多 Skill 會不會塞滿上下文，放在附錄第 ${pageOf(DescriptionTrigger)}–${pageOf(LoadOnUse)} 頁，課後有興趣再看。`],
  [PromptAgentsSkill, `（附錄，課堂不講；第 1 章比較表的細節。）接下來比一比：Prompt、AGENTS.md、Skill，等一下再加上 MCP。看三個 Session：問劉備是誰、改寫劉備卡、畫關係圖。Prompt 像便條紙：在 Session 1 說「這次回答短一點」，只管這一次，開新 Session 就沒了。
按一下：AGENTS.md 像教室公約，第一堂練習過，每個 Session 開始都會讀，三次都讀了。
按一下：Skill 像食譜，要做那道菜才翻：eli5 只在改寫劉備卡時拿出來，diagram-design 只在畫圖時用。
最後一下：Prompt 只管這次，AGENTS.md 每次讀，Skill 要用才讀。`],
  [McpPlug, `（附錄，課堂不講。）第四種是 MCP，全名 Model Context Protocol。左邊是 Skill，教 Codex 怎麼做事。
按一下：右邊是 MCP，像插座，把外面的工具接進來：GitHub、Google Drive、公司資料庫。Skill 寫得再好，Codex 也讀不到沒有連線的外部系統；要用外部系統，就要設定 MCP。
最後一下：Skill 告訴 Codex 怎麼做，MCP 讓 Codex 連到外部工具。今天的練習只用 Skill，MCP 知道是什麼就好。`],
  [CompareTable, `24:30–27:00。Skill 跟其他幾種交代 Codex 的方式差在哪？這張表從上往下念一次就好。Prompt 是這一次的要求，例如把劉備卡改短一點。AGENTS.md 是這個專案的規則，每次都要遵守，例如回答都附檔名。Skill 是一類工作的做法，常常重複做的事，例如用 eli5 改成 5 歲版。MCP 連到外部工具或資料，例如讀 GitHub 上的檔案。
最後一下：常常重複做的事，寫成 Skill。只做一次的事打 Prompt 就好；每次都要遵守的規則放 AGENTS.md；要連外部系統，才需要 MCP。今天的練習只用 Skill，MCP 知道是什麼就好。三種方式的圖解和 Skill／MCP 判斷題放在附錄第 ${pageOf(PromptAgentsSkill)}–${pageOf(SkillOrMcp)} 頁。`],
  [SkillOrMcp, `（附錄，課堂不講；可當課後自我檢查。）判斷題，請大家先舉手猜。情境 1：每次 Review PR，都要照公司的 10 條規範檢查。
按一下：Skill，因為這是固定的做法和檢查流程。
情境 2：希望 AI 能查公司的 Jira 或資料庫。
按一下：MCP，因為要連到外部系統拿資料。
最後一下：Skill 提供做法，MCP 連接外部系統，兩個可以一起用：用 MCP 拿資料，再照 Skill 的做法整理。題目出自 docs/course_1_認識 AI.md。`],
  [Section2, `27:00–27:15。第二章：安裝熱門 Skill。裝兩個：diagram-design 畫圖，eli5 改寫成白話。兩個都用同一行指令裝：npx skills add。`],
  [SkillsAddCmd, `27:15–29:00。先看懂這行指令，等一下要自己貼進終端機。npx skills add dreambigou/eli5 分成三段。
按一下：第一段 npx。npx 是 Node.js 附帶的工具：它把後面那個程式下載下來，直接執行，不用另外安裝。所以電腦要先有 Node.js，開場已經檢查過。
按一下：第二段 skills add。skills 是 Vercel Labs 做的 Skill 安裝程式，add 是「新增」。它到 GitHub 把 Skill 抓下來，放進 Codex、Claude Code 這些 Agent 找 Skill 的資料夾。
按一下：第三段 dreambigou/eli5，是 GitHub 上的帳號和專案名稱：dreambigou 是作者的帳號，eli5 是專案。
最後一下：前兩段每次都一樣，最後一段換成別的專案，就是裝別的 Skill。skills.sh 這個網站可以搜尋別人分享的 Skill，每個 Skill 的頁面都寫好這行指令。
來源：https://github.com/vercel-labs/skills`],
  [RepoName, `29:00–30:30。最後一段去哪裡找？打開 Skill 的 GitHub 頁面，看瀏覽器上方的網址。eli5 的網址是 https://github.com/dreambigou/eli5，github.com/ 後面的 dreambigou/eli5，就是接在 npx skills add 後面的名稱。
下面換你。diagram-design 的網址是 https://github.com/cathrynlavery/diagram-design，指令要怎麼打？請大家先想 10 秒。
按一下：答案是 npx skills add cathrynlavery/diagram-design。中間的斜線要留著，前面的 https://github.com/ 不用打。
最後一下：github.com/ 後面兩段就是名稱。網址後面如果還接著 /tree/main 這類字，只取前兩段。`],
  [ToolCheck, `08:00–10:00。開始講之前，先做練習 1 的第一步：確認電腦有這三個工具。第二章裝 Skill 要用到，git 和 Node.js 從下載到裝好都要幾分鐘，所以現在先檢查，沒有的人等一下邊聽第一章邊裝。打開終端機（Mac 是「終端機」，Windows 是 PowerShell），一次打一行，指令在 prompts.md 練習 1-1。第一行 git --version。
按一下：看到 git version 2 開頭就有了。skills 從 GitHub 下載 Skill 要用 git。接著 node -v，問 Node.js 的版本。
按一下：看到 v 開頭的數字就有了，講師的是 v24.12.0。skills 這個程式要 Node.js v22.20 以上，比這個舊的（例如 v20 或 v22.12），要到官網重裝 LTS 版。最後 npx -v，看到數字就好；npx 是跟著 Node.js 一起裝的。
最後一下：三個都有版本號，就先放著，第二章再回來用。出現 command not found 或「無法辨識」，就是沒裝，照下一頁現在開始裝，先裝 git，再裝 Node.js。課前通知已經請大家先裝好；還沒裝的同學，邊聽第一章邊裝，第二章開始前裝好就跟得上。`],
  [InstallNode, `10:00–11:00。這頁給還沒裝的同學：現在開始裝，裝的時候一邊聽第一章。先裝 git，再裝 Node.js。畫面上的網址都可以點，請在自己的筆電打開這份簡報點連結，或從 prompts.md 練習 1-1 點。
第 1 步 git，照 git 官網 git-scm.com/install 的建議。Mac 先裝 Homebrew：點 brew.sh，複製首頁那一行貼進終端機，按 Enter；問密碼就打電腦的登入密碼，打字時畫面不會顯示。它會順便裝好 Apple 的命令列工具，要等幾分鐘。裝完畫面最後有「Next steps」，照它列的指令貼上，終端機才找得到 brew。接著打 brew install git，裝完打 git --version。官網也列了 xcode-select --install，但這個方法常常跳出「目前無法從軟體更新伺服器取得」而裝不起來，所以我們用 Homebrew。Windows 點 git-scm.com/install/windows，按 Click here to download，下載 x64 的安裝檔，選項都用預設，裝完把 PowerShell 關掉重開，再打 git --version。
按一下：第 2 步 Node.js，照四步裝，npx 會跟著一起裝好。一，點 nodejs.org，按 Download。二，下載標著 LTS 的版本，LTS 是長期支援版，比較穩定；Mac 下載 .pkg，Windows 下載 .msi。三，雙擊安裝檔，選項都用預設，一路按「繼續」或 Next；Mac 最後會要你輸入電腦的登入密碼。四，把終端機整個關掉再打開，新的視窗才找得到 node，再打 node -v 和 npx -v 確認。Windows 這兩段講師沒有實測。
裝好後重開終端機，再打一次 git --version、node -v、npx -v。第二章開始前還沒裝好的，舉手讓助教幫忙；真的裝不好，改用附錄第 ${pageOf(ZipFallback)} 頁下載 ZIP 自己放的做法，不用 Node.js（prompts.md 最後的「備用做法」）。`],
  [CdVault, `30:30–32:00。第二步，讓終端機走進筆記庫。等一下 npx skills add 會問要裝在哪裡，我們選 Project，意思是裝進終端機現在所在的資料夾。所以要先 cd 到三國人物知識庫，Skill 才會裝進筆記庫。
打 cd 和一個空格，把「三國人物知識庫」資料夾從 Finder（Windows 是檔案總管）拖進終端機，路徑會自動填好，按 Enter。再打 ls，要看得到 人物、關係、原文、模板。只看到另一個「三國人物知識庫」，是解壓縮多包了一層，Windows 很常見，再打 cd 三國人物知識庫 進去一層。
按一下：Skill 會裝在筆記庫裡的 .agents/skills/。.agents 前面有一個點，是隱藏資料夾，Finder 和 Obsidian 平常看不到，Codex 開在筆記庫時會讀它。練習 3 自己寫的 Skill 也放這裡。
最後一下：選 Project，Skill 會裝進終端機所在的資料夾。這一步沒進對資料夾，Skill 會裝到別的地方，Codex 開在筆記庫時找不到。`],
  [AddEli5, `32:00–34:00。第三步，裝 eli5。裝別人寫的 Skill 之前，先到它的 GitHub 頁面打開 SKILL.md，看它要 Codex 做什麼：Skill 執行時有 Codex 的完整權限。eli5 我們第一章已經看過了。貼上 prompts.md 練習 1-3 的 npx skills add dreambigou/eli5，按 Enter。接下來會連續問幾題，每題看清楚再按。
按一下：第一次用 npx 跑 skills，它會問要不要先下載 skills 這個程式：Need to install the following packages: skills@1.7.4，Ok to proceed? 括號裡的 y 是預設答案，直接按 Enter 就是同意。版本號不同沒關係。
按一下：它從 GitHub 抓下專案，找到 1 個 Skill，就是 eli5。接著問要裝給哪些 Agent。清單第一區叫 Universal，標著 always included，表示一定會裝；這一區共用 .agents/skills 這個資料夾，Codex 就在裡面，不用另外選。
按一下：下面是其他 Agent，例如 Claude Code，各有自己的資料夾。最下面一行是操作說明：上下鍵移動、空白鍵勾選、Enter 確認。只用 Codex 的話，什麼都不用勾，直接按 Enter。
最後一下：有用 Claude Code 的同學，按向下鍵移到 Claude Code，按空白鍵打勾，再按 Enter，它會一起裝到 .claude/skills。畫面上的 Claude Code 是空心圓（沒勾），跟你們多數人的畫面一樣；講師電腦實際上預先勾好了，錄影裡會看到。
這是講師 2026-10-30 在 Mac 實跑的輸出（skills 1.7.4），清單很長，只節錄這幾行。`],
  [AddEli5Scope, `34:00–36:00。接著還有三題。第一題 Installation scope，裝在哪裡。Project 裝在終端機現在的資料夾，也就是筆記庫；Global 裝在家目錄，在哪個資料夾開 Codex 都用得到。今天選 Project，它本來就是預設，按 Enter。
按一下：第二題 Installation method，安裝方式。預設的 Symlink 是推薦選項：檔案只放一份在 .agents/skills，其他 Agent 的資料夾用捷徑指過去。直接按 Enter。
按一下：它會先列出 Installation Summary 和安全檢查 Security Risk Assessments，再問 Proceed with installation?，要不要開始裝。停在 Yes，按 Enter。
按一下：看到 Installed 1 skill 和 ./.agents/skills/eli5，就裝好了。最後一行提醒：Skill 執行時有 Agent 的完整權限，使用前先看過。
最後一下：選 Project，eli5 就裝在筆記庫的 .agents/skills/。Skill 是寫給 Codex 的做事說明，Codex 會照著做，能動的檔案和指令跟 Codex 原本的權限一樣。不認識的 Skill，先打開 SKILL.md 看它要 Codex 做什麼，再決定裝不裝。
筆記庫裡還會多一個 skills-lock.json，記錄裝了哪些 Skill、從哪裡來，不用動它。
來源：https://github.com/dreambigou/eli5`],
  [AddDiagram, `36:00–38:00。第四步，用同樣的方法裝 diagram-design。貼上 prompts.md 練習 1-4 的 npx skills add cathrynlavery/diagram-design。這個專案比較大，下載要等十幾秒。
按一下：一樣找到 1 個 Skill，後面四題跟剛才一模一樣：Agent 不用選、Project、Symlink、Yes，全部按 Enter。這次 npx 通常不會再問要不要下載 skills，第一次已經下載過了。
按一下：看到 ./.agents/skills/diagram-design，就裝好了。diagram-design 除了 SKILL.md，還附了 references、scripts、assets 幾個資料夾，第一章看過；skills 會整個資料夾一起裝。
按一下：打 ls .agents/skills 確認，看得到 diagram-design 和 eli5 兩個資料夾。
最後一下：兩個 Skill 都在筆記庫的 .agents/skills/ 裡。
來源：https://github.com/cathrynlavery/diagram-design`],
  [InstallErrors, `（附錄，裝不起來時翻到這頁。）裝不起來，先看錯誤訊息，常見的是這三種。先看左邊的訊息，猜猜看是什麼原因。
按一下：第一種 command not found: npx，Windows 會寫「無法辨識 'npx'」：電腦找不到 npx，代表沒裝 Node.js，或是裝完沒把終端機關掉重開。
按一下：第二種 Failed to clone，後面寫 spawn git ENOENT：skills 要用 git 下載，但找不到 git，照第 ${pageOf(InstallNode)} 頁的方法裝 git。這行是講師把 git 拿掉後實際跑出來的。
按一下：第三種只有 Windows 會遇到：PowerShell 預設不執行 .ps1 指令檔，訊息裡會有 npx.ps1 和「已停用指令碼執行」。改打 npx.cmd skills add，後面接一樣的名稱，就能執行。這行是示意，講師沒有在 Windows 實測，實際文字可能不同。`],
  [ZipFallback, `（附錄，裝不起來時翻到這頁。）指令怎麼試都不行，最後一招是自己下載、自己放。Skill 其實就是一個資料夾，裡面有 SKILL.md。三步：在 GitHub 專案頁按綠色的 Code 按鈕，選 Download ZIP；解壓縮；把 Skill 的資料夾拖進筆記庫的 skills 資料夾。
左邊：解壓縮後要找對層。eli5 的 ZIP 解開是 ELI5-main，裡面有 README、eli5-workspace，Skill 在 skills/eli5；這一層裡面直接就是 SKILL.md。要拿的是 eli5 這個資料夾，不是整個 ELI5-main。
按一下：拖到右邊這裡。
按一下：放進筆記庫的 .agents/skills/，Codex 讀這裡；用 Claude Code 的放 .claude/skills/。放好後打開 eli5 資料夾，要直接看到 SKILL.md。網路上舊的教學會寫家目錄的 ~/.codex/skills，現在 Codex 統一讀 .agents/skills。
最後一下：.agents 是隱藏資料夾，Finder 不讓你建點開頭的資料夾，也看不到它。在筆記庫的終端機打 mkdir -p .agents/skills && open .agents/skills，會建好資料夾並用 Finder 打開，把 eli5 拖進去就好。Windows 打 mkdir -Force .agents\\skills; explorer .agents\\skills。prompts.md 的「備用做法」都有這兩行。`],
  [SkillsList, `38:00–41:00。第五步，確認 Codex 看得到這兩個 Skill。終端機還在筆記庫裡，不用再 cd，直接打 codex。已經開著 Codex 的同學，先輸入 /quit 關掉再開。不確定終端機在哪，開了 Codex 打 /status，Directory 的結尾要是三國人物知識庫。第一次在筆記庫開 Codex，會先問要不要信任這個資料夾，選 Yes, continue。
然後貼上 prompts.md 練習 1-5 這句：列出你現在可以使用的 skills 名稱，每個一行，附一句用途。不要讀或修改任何檔案。
按一下：這是講師 2026-10-30 的實際輸出（Codex 0.165.0），中間省略了一些。找兩行：diagram-design 和 eli5。用途那句是 Codex 自己摘要的，每次寫法不一樣。
按一下：兩個都在，就裝好了。講師電腦裝了比較多 Skill，你的清單會短一點，這是正常的。講師電腦另外裝過 diagram-design 的 Codex 外掛版，所以清單還多一行 diagram-design:diagram-design；你們只用 npx 裝，不會有這行。
最後一下：清單只表示已安裝；下一章實際執行一次，確認能用。剩下的時間，幫旁邊的同學確認。
少一個 Skill，或 npx 出現錯誤訊息：翻附錄第 ${pageOf(InstallErrors)} 頁對照常見錯誤；指令怎麼試都不行，附錄第 ${pageOf(ZipFallback)} 頁是下載 ZIP 自己放的做法。`],
  [InstallVideo, `41:00–44:00。這是講師事先錄好的完整安裝過程，課堂上不現場跑。按播放鍵開始，影片沒有聲音，邊放邊講；右邊的時間可以直接跳段。
還在裝的同學，跟著影片一步一步做：裝 eli5 時一路按 Enter，裝 diagram-design 一樣，最後開 Codex 列出 Skill。已經裝好的同學，這三分鐘幫旁邊的人看畫面，或舉手提問。
影片約 2 分半（講師 2026-10-30 錄，skills 1.7.4、Codex 0.165.0）。0:00 裝 eli5：第一次會問 Ok to proceed，之後每題都直接按 Enter；0:44 裝 diagram-design，下載要等十幾秒；1:32 開 Codex 列出 Skill。講師電腦裝了很多 Skill，清單很長，eli5 和 diagram-design 會先閃過、被捲到上面；你們的清單短很多。講師電腦有裝 Claude Code，所以安裝完成時寫著 symlinked: Claude Code；你們沒裝的話不會有這行。`],
  [Section3, `44:00–44:15。第三章：用 Skill 做好讀的筆記。兩個練習：用 diagram-design 把關係卡畫成圖，用 eli5 把劉備卡改成 5 歲版。`],
  [DiagramRun, `44:15–49:00。練習 2 共 20 分鐘。Codex 還開在筆記庫裡，直接貼上 prompts.md 練習 2-1，跟畫面上這段一樣。這段提示詞把圖的樣子講清楚：人物放進勢力的框、事件依回目由上到下、平滑曲線、線上只寫兩三個字的關係，檔名改列在圖下方的表。講師用舊版提示詞實跑時沒寫這些，Codex 在每條線旁邊都標了兩個檔名，線又直角轉來轉去，整張圖很亂。
按一下：Codex 讀完卡片，第一次用 diagram-design 會停下來問樣式。這是講師 2026-10-30 實跑的畫面（Codex 0.165.0，diagram-design 2.6.136），這次是三個選項。選項的寫法會跟著版本變，不用背，找「預設」那一項。
按一下：回答「保留預設樣式，請直接產生並存檔。」
按一下：存好了，Codex 回報 12 條平滑曲線，附逐線來源表。實測這一步要一兩分鐘；寫檔前如果問 Yes, proceed，看過再按。`],
  [DiagramResult, `49:00–53:00。這是講師 2026-10-30 實跑畫出來的圖。打開的方法：在 Finder（Windows 是檔案總管）進到筆記庫的 圖/ 資料夾，雙擊 三國關係圖.html，會用瀏覽器打開。Obsidian 的檔案列表看不到 .html，這是正常的。
按一下：人物放在勢力的框裡：左邊蜀漢是劉備、關羽、張飛，右邊是曹魏的曹操和東吳的孫權。框是照 勢力/ 的卡片排的。
按一下：中間是三個事件，依回目由上到下：第 1 回桃園結義、第 21 回煮酒論英雄、第 49 到 50 回赤壁之戰。
按一下：線上只寫兩三個字的關係，例如結義、守護、放行。每條線是哪張卡寫的，列在圖下方的「逐線來源」表，往下捲就看得到。線的數量每次會不一樣，這次是 12 條；你第二堂自己寫過關係卡的話，還會再多，這是正常的。
你的圖如果線疊在一起、看不出是誰的，在同一個 Session 接著貼 prompts.md 練習 2-2：「圖上的線太亂，看不出哪條是誰的。請改用平滑曲線，不要直角轉折；標籤不要互相蓋住。人物、事件、關係和來源表不變，存回同一個檔案。」講師實測過，直角線會改成平滑曲線。Codex 改完會說「確認標籤互不重疊」，還是要自己在瀏覽器重新整理，再看一次。`],
  [UseVideo, `53:00–57:00。講師錄好的練習 2 完整過程：貼上練習 2-1，Codex 停下來問樣式，回答用預設，存好關係圖；再貼上練習 2-3，eli5 改寫劉備卡。課堂上不現場跑。
影片約 4 分 14 秒（講師 2026-10-30 錄，Codex 0.165.0，diagram-design 2.6.136），等待的空檔剪掉了。0:42 Codex 停下來問「沿用預設配色，還是指定配色？」；0:52 回答用預設，畫圖實際花了快 2 分鐘；2:46 存好，回報 5 位人物、3 個事件、12 條曲線和來源表；3:00 重開 Codex，貼上練習 2-3，請 eli5 把劉備卡講給 5 歲小孩聽，不到一分鐘就存好 整理/劉備-5歲版.md，回報保留了所有連結、沒加 dg-publish、原卡沒改（這一段是講師換成 5 歲版後補錄的，Codex 讀的是講師家目錄那份 eli5，內容跟筆記庫裡的一樣）。
影片中間有一行紅字 Used computer … Failed：講師電腦的 Codex 想開瀏覽器檢查圖，被安全設定擋下，不影響存檔；你們的 Codex 多半不會出現這行。
同學自己的 Codex 在跑的時候，正好看影片對照下一步，或舉手提問。影片最後是 eli5 改寫劉備卡，下一頁直接看改寫前後的比對。`],
  [Eli5Rewrite, `57:00–64:00。影片最後貼的就是 prompts.md 練習 2-3 的提示詞：
請使用 eli5 skill，把 人物/劉備.md 用 5 歲小孩聽得懂的方式重新說一次，存成 整理/劉備-5歲版.md。只用卡片裡有的內容，不要加新的事實；保留 [[連結]]。不要修改原本的卡片。新檔不要加 dg-publish。
最後一句是為第四堂準備的：原卡最上面有 dg-publish: true，eli5 改寫時可能照抄，5 歲版就會跟原卡一起公開。細節在附錄第 ${pageOf(DgPublishCopied)} 頁，第四堂發布前也會講。
我們只看一段：桃園結義那段。綠底是保留下來的事實：隔天、張飛莊後的桃園、[[桃園結義]] 這個連結、劉備成了關、張的大哥。橘底是要換成白話的說法：越談越投合、立誓。
按一下：右邊是 eli5 的實際產出（講師 2026-10-30，範例檔 aw-03-sample-output/練習2/劉備-5歲版.md 就是這一份）。綠底的事實都還在：隔天、張飛家後面的桃園、[[桃園結義]]、劉備成了關羽和張飛的大哥；橘底的換成 5 歲小孩聽得懂的話：越聊越合得來、一起許下約定，成為兄弟。
最後一下：古文改成白話，事實和 [[連結]] 都留著，這就是 eli5 做的事。其他段落請大家打開兩張卡自己對照，例如販屨織蓆變成賣鞋子、編席子，匙箸變成湯匙和筷子。
接下來到 64:00，把練習 2 的三步做完：畫圖、線太亂就重排、改寫劉備卡。`],
  [DgPublishCopied, `（附錄，第四堂發布前再看；第四堂也會講。講師早期用舊提示詞實測時遇到的，當時是改寫給國中生。）實測時發現一件事。原卡最上面有 dg-publish: true，這是第四堂發布用的開關。eli5 改寫時，把這一行也照抄過去了。
按一下：第四堂發布時，兩張劉備卡都會公開，網站上會出現兩個劉備。
按一下：不想公開 5 歲版，就刪掉 dg-publish 那一行（改成 dg-publish: false，或在 Obsidian 的屬性欄取消勾選也可以）。下次請 Codex 改寫時，提示詞最後多加一句：「新檔不要加 dg-publish」，新檔就不會帶著公開設定。
最後一下：發布前，先看最上面的 frontmatter。`],
  [BreakPage, `64:00–69:00。中場休息 5 分鐘。練習 2 還沒做完的同學，可以利用這段時間補做；有問題就舉手，講師和助教過去看。回來接第四章：寫自己的 Skill。`],
  [Section4, `69:00–69:15。第四章：寫自己的 Skill。把排時間軸的做法寫成 SKILL.md，以後一句話就能重排。`],
  [TimelineGoal, `69:15–71:00。先想清楚這個 Skill 要做什麼：把事件按小說回目排在一條橫線上。回目是小說的章回順序，大致跟著故事走，不是精確的年代；年份卡片有寫才標。像整理相簿，把照片照順序排好。左邊是筆記庫裡的六張關係卡：第二堂就有的三張，加上 aw-03-lab 給的三張（三英戰呂布、白門樓、草船借箭），回目順序是亂的。
按一下：依回目由小到大排好。
按一下：寫成一頁 整理/時間軸.md，內容是一段 HTML 畫的橫向時間軸，第四堂可以直接放上網站。
最後一下：讀卡片欄位、依回目排序、寫進 整理/時間軸.md，就是這個 Skill 的三個步驟。`],
  [SkillSkeleton, `71:00–74:00。這是講師給的骨架，一段一段看。最上面是 name 和 description：description 寫何時用，把同學可能會說的話寫進去，例如「三國時間軸」「排時間軸」。完整內容如下；下一頁用 npx skills add 把它裝進筆記庫，不用自己複製存檔：
${SKELETON}
按一下：步驟三步：讀、排、寫，可以照自己的話改，但不要少步驟。
按一下：輸出格式寫的是時間軸長什麼樣：橫向、線上只寫事件名稱、線下寫回目和年份；事件多了比畫面寬，可以左右拖曳看完整條。其中最重要的一條：HTML 裡的名字用純文字，不加 [[ ]]。放上網站後，HTML 裡的 [[ ]] 不會變成連結，會原封不動顯示；講師的實測在附錄第 ${pageOf(HtmlLinkTest)} 頁，第四堂會實際看到。
name 只能用小寫英文、數字和連字號，所以叫 sanguo-timeline，資料夾也要叫這個名字。這份骨架講師 2026-10-30 原封不動實測過（Codex 0.165.0），能畫出橫向時間軸。`],
  [HtmlLinkTest, `（附錄，第四堂發布前再看；第四堂也會講。）第四章的時間軸，名字都是純文字，沒有 [[ ]]。為什麼要這樣規定？講師用自己網站的 Digital Garden 模板在本機建置測試，這是畫面。
按一下：HTML 區塊裡的 [[劉備]]、[[關羽]]、[[張飛]]，原封不動顯示成文字，沒有變成連結。
按一下：HTML、style、script 都能正常顯示和執行，所以時間軸用 HTML 沒問題。
最後一下：所以人名用純文字。真的想要點得到，<a href> 裡要放網站上的網址；直接連 ../關係/*.md 這種筆記庫裡的路徑，放上網站可能 404，要看網站模板的版本；第四章的時間軸結果就遇過這種連結。
另外，獨立的 .html 檔不會被 Obsidian 外掛上傳，所以我們把 HTML 直接寫在筆記裡，跟著卡片一起發布。第四堂會用 Forestry 實際發布一次。`],
  [SaveSkill, `74:00–78:00。練習 3 開始。第一步先補資料：時間軸要有事件可以排，筆記庫只有第二堂的三張關係卡，太少了。aw-03-lab 裡的 關係/ 資料夾有講師照原文寫好的三張：三英戰呂布、白門樓、草船借箭，回目、年份、出處都填好了。在 Finder（Windows 是檔案總管）打開 aw-03-lab/關係/，全選三個檔案，拖進 Obsidian 筆記庫的 關係/。拖檔案，不要拖整個資料夾。
接著裝骨架。骨架是 aw-03-lab.zip 裡的 sanguo-timeline 資料夾，裡面只有一個 SKILL.md，安裝方法跟第二章一樣用 npx skills add；差別是這次不是從 GitHub 下載，而是裝自己電腦上的資料夾，所以名稱那一段換成資料夾的路徑。指令在 prompts.md 練習 3-1。
先在 Codex 輸入 /quit 離開，回到終端機。這時終端機還在筆記庫裡，不用再 cd。打 npx skills add 和一個空格，把 aw-03-lab 裡的 sanguo-timeline 資料夾從 Finder（Windows 是檔案總管）拖進終端機，路徑會自動填好，按 Enter。還沒解壓縮 aw-03-lab.zip 的同學，先解壓縮。Windows 被擋的話一樣改打 npx.cmd。
按一下：它認得這是本機資料夾（Local path validated），找到一個 Skill，名字是 sanguo-timeline。接下來四題跟第二章一樣：Agent 不用選按 Enter、Project、Symlink、Yes。本機資料夾不用 git。
按一下：看到 ./.agents/skills/sanguo-timeline，就裝好了。
按一下：裝好的資料夾叫 sanguo-timeline：skills 用 SKILL.md 裡的 name 當資料夾名稱。name 只能用小寫英文、數字和連字號，資料夾名稱也要跟它一樣，Codex 才認得。裝進去的是一份複本，等一下改 SKILL.md，改的是筆記庫裡這一份，aw-03-lab 裡的原檔不會變。
最後一下：打 codex 重開，問「列出你現在可以使用的 skills…」，清單裡看到 sanguo-timeline 就對了。沒看到，先輸入 /status，確認 Directory 的結尾是三國人物知識庫。
講師 2026-10-30 實測（skills 1.7.4、Codex 0.165.0）：用本機路徑裝好後，Codex 列出 sanguo-timeline：「將三國筆記依回目排列成時間軸」。
npx 裝不起來：prompts.md 練習 3-1 最後有備用做法，用一行指令建好並打開 .agents/skills，把 sanguo-timeline 資料夾拖進去，跟附錄第 ${pageOf(ZipFallback)} 頁的做法一樣。不要請 Codex 建：Codex 0.165 預設不讓自己寫進 .agents/，會回「.agents 設為唯讀」。`],
  [RunTimeline, `78:00–81:00。練習 3 共 38 分鐘，先跑第一次。步驟：骨架剛裝好、Codex 也重開了；貼上 prompts.md 練習 3-2：「請使用 sanguo-timeline skill，排出三國時間軸。」；寫檔前如果問 Yes，看過再按；最後在 Obsidian 打開 整理/時間軸.md。上面三個小框就是這幾步。下面是講師實測的紀錄，第一行是我們貼進去的那句。
按一下：Codex 說「我會使用 sanguo-timeline skill」，接著用 sed 讀進我們寫的 SKILL.md，這次讀的是筆記庫裡的 .agents/skills。點名後，Codex 照這份 SKILL.md 做。
按一下：最後回報「依回目由小到大排列，共 6 張關係卡」，寫好了 整理/時間軸.md。你第二堂自己寫過一張關係卡，線上會多一件事，變成 7 件，正常。
最後一下：Codex 照 SKILL.md 寫的內容執行；SKILL.md 沒寫的地方，Codex 會自己決定，下一頁就會看到。
提醒：aw-03-lab 的三張關係卡沒拖進 關係/，只會排出 3 件；回練習 3-1 第一步補拖。`],
  [TimelineResult, `81:00–85:00。這是講師 10-30 用這份骨架第一次跑出的 整理/時間軸.md，用瀏覽器打開的樣子：一條橫線，事件依回目由左到右排。全班先一起看這一份，等一下再看自己的。
按一下：6 件事，第 1、5、19、21、46、49 回，照小說的順序，不是精確年代。線上只有事件名稱，乾淨好讀。
按一下：再看黃框，線下的年份：只有桃園結義寫中平元年，其他五件都寫「年份：未記載」。回頭看 SKILL.md：輸出格式只說線下寫回目和年份，沒說卡片沒寫年份時要怎麼辦，所以 Codex 自己決定寫「未記載」。問題出在 SKILL.md 沒寫這種情況。
按一下：下面的來源卡變成藍色底線的連結，連到 ../關係/桃園結義.md 這種筆記庫裡的路徑；SKILL.md 也沒說要不要連結。放上網站可能點下去是 404，等一下一起修。
同一份骨架，每次錯法不一樣：舊版骨架（表格）講師 10-17 跑出「未標註」、10-24 跑出「—」和 [[關係/桃園結義]]。`],
  [EditLoop, `85:00–87:00。結果不滿意怎麼辦？像改食譜：菜不好吃，就改食譜，不用每次站在廚師旁邊重新口述。
第一步執行。按一下：第二步看結果。
按一下：第三步改 SKILL.md。
按一下：第四步再跑一次，回到第一步。
按一下：中間這個劃掉的，是我們不做的事：重打一長串提示詞。
最後一下：改一次 SKILL.md，之後每次執行都照新規則。下一頁就是講師實際跑出來的兩個問題，我們照這個循環修。`],
  [EditExample, `87:00–99:00。上一頁的兩個問題，都是因為 SKILL.md 沒寫清楚：沒說卡片沒寫年份時要怎麼辦，Codex 就寫「年份：未記載」；沒說來源卡要不要連結，Codex 就做成 <a href="../關係/桃園結義.md">，放上網站可能點下去是 404。修法就是在 SKILL.md 的輸出格式最後補兩行，畫面上綠底那兩行。不用重打提示詞，改說明書就好。
同一份骨架，每次錯法不一樣：舊版骨架講師跑過「未標註」「—」和 [[關係/桃園結義]]，所以第一行把這幾種都寫進去了。
按一下：這是講師 10-30 補了這兩行、同一句再跑一次的結果。框 1：線下只剩回目，「未記載」不見了；只有桃園結義的卡寫了年份，所以多一行中平元年。框 2：來源卡變成「桃園結義.md」這樣的純文字，沒有連結，放上網站不會點到 404。
按一下：換你們。先檢查自己的時間軸：在 Obsidian 打開 整理/時間軸.md，切到編輯模式（右上角的筆圖示；閱讀模式會把 HTML 畫成圖，搜不到 <a href），按 Cmd+F 或 Ctrl+F，分別搜「未標註」「未記載」「—」「<a href」「[[」。搜得到哪一個，就補對應的那一行。
補的方法就是這四步：在 Codex 輸入 /quit 回到終端機；Mac 打 open -e .agents/skills/sanguo-timeline/SKILL.md，用「文字編輯」打開，Windows 打 notepad .agents\\skills\\sanguo-timeline\\SKILL.md，用記事本打開；把 prompts.md 練習 3-3 的兩行貼在檔案最後，存檔、關掉；再打 codex 重開、重跑。這些在 prompts.md 3-3 都有，照著貼就好。
為什麼不請 Codex 改？講師 2026-10-30 用 Codex 0.165.0 實測：請 Codex 改 SKILL.md，它回「目前環境將 .agents 設為唯讀，寫入遭拒」。Codex 為了安全，預設不讓自己改 .agents/ 裡的檔案。說明書由人來改，Codex 照著做，這也正是今天的重點。
五個都搜不到的同學，一樣有事做：挑一個你不滿意的地方，例如顏色、事件名稱的字太小、想在線下多寫參與人物，寫成一句規則，用同樣的方式加在輸出格式最後，存檔，再跑一次。`],
  [TimelineVideo, `99:00–102:00。講師錄好的練習 3 完整過程（2026-10-30，Codex 0.165.0，約 2 分鐘，等待的空檔剪掉了），課堂上不現場跑。0:00 npx 裝骨架；0:38 第一次跑，Codex 回報「未填年份均標示『未記載』」；1:12 /quit 後用 grep 數，整理/時間軸.md 裡有 6 處「未記載」；1:22 SKILL.md 最後多了兩行規則（影片略過編輯畫面，用 tail 顯示檔案最後四行；你們用 open -e 或 notepad 打開來貼）；1:28 重開 Codex，同一句再跑一次；2:10 再搜，0 處。
重點就是這一段：同一句提示詞，改了 SKILL.md，結果跟著變。影片開頭有一行 Codex 有新版的提示，不用理它；中間有一行讀到 superpowers 的 SKILL.md，是講師電腦另外裝的 Skill，你們不會有。還在改規則的同學，跟著影片做。`],
  [PersonFilter, `102:00–106:00。做完的人挑戰進階選做：只排出劉備的事件。照練習 3-3 的方法打開 SKILL.md，在步驟的第 3 步下面加一行第 4 步：「使用者指定人物時，只留下參與人物有他的事件」，存檔。下面是加這一步之前的六件事。
按一下：/quit、重開 Codex 後輸入：「請使用 sanguo-timeline skill，只排劉備的事件，存成 整理/時間軸-劉備.md」。
按一下：這是講師實測的結果，2026-10-18、10-24（舊版表格）和 10-30（橫向時間軸）都是第 1、5、19、21、49 回，五件事。草船借箭被拿掉了，因為它的參與人物是周瑜、諸葛亮、魯肅、[[曹操]]，沒有劉備。
按一下：所以你的結果可能是 5 件或 6 件。第二堂練習自己寫過〈轅門射戟〉或〈許田打圍〉的同學，那張卡的參與人物有劉備，會多一件，變成 6 件，這是對的；寫〈溫酒斬華雄〉的沒有劉備，還是 5 件。10-30 那次，只有第 1 回有年份（中平元年），來源卡是純文字，練習 3-3 加的兩條規則照樣有效。核對方法一樣：打開每張卡看「參與人物」那一行。
還有時間的同學，下一頁換一個畫圖 Skill。`],
  [TimelineStyles, `106:00–112:00。進階選做第二題：同一份 整理/時間軸.md，換一個畫圖 Skill 畫。先問大家：交給不同的 Skill 畫，會長一樣嗎？接下來一張一張看，都是講師 10-30 實跑的成品，整條時間軸截下來，六件事都在；每按一下換一張，放在同一個位置比較。
按一下：diagram-design，練習 1-4 已經裝好，畫得很素：灰底、細線、小圓點，六件事平均排開。
按一下：archify，要另外裝：米色底、大號襯線字、紅色圓點，一樣平均排開。archify 原本要每件事都有完整日期，三國卡片只有回目，Codex 沒有硬套它的格式，改寫了一份自己的 HTML。
按一下：自訂 HTML，不用畫圖 Skill，請 Codex 照需求另外寫的。它照第 1 到 120 回的比例排，畫面只截到第 50 回，看得出第 21 回到第 46 回中間空了一大段；網頁上還能切換「只看劉備」。三份都沒有自己補年份，只有桃園結義有中平元年。
同樣叫做「畫圖」的 Skill，每個人寫的 SKILL.md 不一樣，畫出來的風格就不一樣，沒有哪一個是標準答案，挑你喜歡的。
按一下：去哪裡找？在終端機打 npx skills find，後面接英文關鍵字，例如 timeline。講師 10-30 搜過，archify 有 18.3 萬次安裝、diagram-design 有 2.2 萬次，都在結果裡。也可以上 skills.sh 這個網站搜。找到喜歡的，跟第二章一樣用 npx skills add 裝；裝之前先到 GitHub 打開它的 SKILL.md 看一眼，Skill 執行時有 Codex 的完整權限。
提示詞在 prompts.md 練習 3-5，用 archify 的話把開頭的 diagram-design 換成 archify。成品放在線上的 aw-03-sample-output/練習3/，下載回去用瀏覽器打開比一比。
最後 2 分鐘，請一兩位同學分享自己改了 SKILL.md 哪一行。`],
  [Recap, `112:00–116:00。回顧四件事。一、Skill 是交給 Agent 的做事說明，提示詞寫出 Skill 名稱就能用。二、用 npx skills add 加上 GitHub 的「帳號/專案」安裝，選 Project 就裝進筆記庫的 .agents/skills；指令不行時，下載 ZIP 自己放進去。三、diagram-design 把卡片畫成關係圖，eli5 把古文改成白話，都是一句話叫 Skill 做事。四、結果不滿意，改 SKILL.md 再跑，這是今天的重點。
按一下：下一堂把筆記庫發布成網站。`],
  [NextLesson, `116:00–120:00。第四堂：把筆記庫發布成網站。在 Obsidian 勾好要公開的卡，按發布，Forestry 會把它建成網站，給你一個「名字.forestry.md」的網址；今天做的 時間軸.md 也會放上去。
按一下：第四堂有一份課前作業，只要註冊一個帳號，全部在瀏覽器裡做：打開 https://forestry.md 按 Sign up，用 email 和密碼，或用 GitHub 帳號登入都可以；登入後按 Plant 種一座花園，名字會自動給一個，可以改；等畫面出現 Your garden is live，點網址打開，把網址抄下來。不用 GitHub、Vercel，也不用建 token；Digital Garden 外掛上課時才裝。完整步驟在 examples/aw-04-lab/prompts.md 最上面的「課前作業」，在筆電上點畫面下方的連結。
做完的樣子：手上有一個打得開的「名字.forestry.md」網址。卡住了就把畫面截圖帶來，第四堂第一個練習就是驗收。今天寫的 SKILL.md、時間軸.md 和 三英戰呂布.md 留著，第四堂還會用到。免費方案一個網站、每月 30 次發布、100 MB，上課夠用。`],
  [ReferencesSkills, `（課後自讀，上課不講。）
第 1 章講 Skill、AGENTS.md、MCP 時用到的文件。
Agent Skills：
- Anthropic 2025, Equipping Agents for the Real World with Agent Skills（Skill 的設計、progressive disclosure、怎麼開發與評估）. https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills
- Agent Skills 規格（name、description 的寫法，scripts、references、assets 資料夾）：https://agentskills.io/specification ；入門說明：https://agentskills.io/what-are-skills
- Codex Skills 文件（先看 name 和 description，用到才讀全文；.agents/skills 的位置；點名 $skill）：https://developers.openai.com/codex/skills
- skills 安裝工具（npx skills add，Vercel Labs）：https://github.com/vercel-labs/skills ；搜尋 Skill：https://skills.sh
AGENTS.md、MCP：
- Codex 文件：AGENTS.md. https://developers.openai.com/codex/guides/agents-md
- AGENTS.md 格式說明：https://agents.md
- Anthropic 2024, Introducing the Model Context Protocol. https://www.anthropic.com/news/model-context-protocol
- MCP 官方文件：https://modelcontextprotocol.io ；Codex 接 MCP：https://developers.openai.com/codex/mcp`],
  [ReferencesTools, `（課後自讀，上課不講。）
今天裝的 Skill：
- diagram-design（Cathryn Lavery）：https://github.com/cathrynlavery/diagram-design
- eli5（DreambigOu）：https://github.com/dreambigou/eli5 ；skills.sh 頁面與安全評估：https://skills.sh/dreambigou/eli5
- Skill 放在哪裡、怎麼載入（OpenAI，Build skills）：https://learn.chatgpt.com/docs/build-skills ；Skill 目錄：https://skills.sh
原文、發布：
- 《三國演義》原文（維基文庫）：https://zh.wikisource.org/wiki/三國演義 ；aw-03-lab 三張關係卡用的回目：https://zh.wikisource.org/wiki/三國演義/第005回 、https://zh.wikisource.org/wiki/三國演義/第019回 、https://zh.wikisource.org/wiki/三國演義/第046回
- Obsidian Properties（frontmatter 屬性）：https://help.obsidian.md/properties
- Digital Garden 文件（dg-publish）：https://docs.forestry.md/getting-started/01-getting-started/ ；外掛原始碼：https://github.com/oleeskild/obsidian-digital-garden
- 第四堂要用：Forestry.md 入門 https://docs.forestry.md/getting-started/01-getting-started/`],
  [AppendixIndex, `（附錄目錄，課堂不講。）裝不起來的解法、想多懂一點的內容、第四堂發布前要注意的事，都放在附錄。上課時遇到哪個情況，請同學在自己的筆電翻到對應頁碼。`],
]);

export const notes: (string | undefined)[] = deck.map(page => NOTES.get(page));

export default deck satisfies Page[];
