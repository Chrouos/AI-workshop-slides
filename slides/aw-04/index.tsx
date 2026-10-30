import type { DesignSystem, Page, SlideMeta, SlideTransition } from '@open-slide/core';
import { Step, Steps, useIsActivePage, useSlidePageNumber } from '@open-slide/core';
import type { CSSProperties, ReactNode } from 'react';
import forestrySignin from './assets/forestry-signin.png';
import forestryPlant from './assets/forestry-plant.png';
import forestryGardenLive from './assets/forestry-garden-live.png';
import obsidianRestricted from './assets/obsidian-restricted-mode.png';
import dgPluginInstall from './assets/dg-plugin-install.png';
import forestryPluginConnect from './assets/forestry-plugin-connect.png';
import forestryGardenKey from './assets/forestry-garden-key.png';
import forestryPublishHistory from './assets/forestry-publish-history.png';
import forestryPluginSlugify from './assets/forestry-plugin-slugify.png';
import dgPaletteForestry from './assets/dg-command-palette-forestry.png';
import dgProperty from './assets/dg-publish-property.png';
import timelineSite from './assets/timeline-on-site.png';
import promptsQr from './assets/prompts-qr.svg';

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
.aw4-deck .aw4-tip { transition: opacity 160ms ${EASE_OUT}; }
.aw4-deck [data-osd-step="pending"] .aw4-tip { opacity: 0; }
.aw4-deck [data-osd-step="pending"] > .aw4-still { transform: none; }
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
  .aw4-deck .aw4-build, .aw4-deck .aw4-tip { transition: opacity 150ms ease; transition-delay: 0s !important; }
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
  <h1 style={{ fontFamily: '"Libre Baskerville", Georgia, "Times New Roman", serif', fontSize: 132, fontWeight: 400, lineHeight: 1.17, letterSpacing: '-0.035em', maxWidth: 'none', margin: 0, color: ink, whiteSpace: 'pre-line', minWidth: '0px', minHeight: '0px', maxHeight: 'none', flexShrink: '0', flexGrow: '0', flexBasis: 'auto', width: '1261.01px', height: '154.44px', translate: '0px 0px' }}>{children}</h1>
);

// With a source, the footer's left side names where the page's idea comes from.
const Footer = ({ source }: { source?: ReactNode }) => {
  const { current, total } = useSlidePageNumber();
  return (
    <div style={{ position: 'absolute', left: 144, right: 144, bottom: 56, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 32, borderTop: '1px solid #E7E5E4', paddingTop: 22, fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', fontSize: 22, fontWeight: 400, color: quiet }}>
      {source ? <span style={{ whiteSpace: 'nowrap' }}><strong style={{ fontWeight: 600, color: muted }}>參考</strong>｜{source}</span> : <span>AI 協作課｜第 4 堂 發布成網站</span>}
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

// Lesson 4's steps, prompts and URLs live outside the vault, in the lab folder.
const PROMPTS_URL = 'https://github.com/Chrouos/AI-workshop-slides/blob/main/examples/aw-04-lab/prompts.md';
const LAB_URL = 'https://github.com/Chrouos/AI-workshop-slides/blob/main/examples/aw-04-lab/README.md';
const LAB_ZIP_URL = 'https://raw.githubusercontent.com/Chrouos/AI-workshop-slides/main/examples/aw-04-lab.zip';

// Top-right on a practice page: where to copy this practice's steps and prompts.
const PromptsCopy = ({ step, section }: { step?: string; section?: string }) => (
  <>
  <a href={PROMPTS_URL} target="_blank" rel="noreferrer" style={{ position: 'absolute', top: 176, right: 144, display: 'flex', alignItems: 'center', gap: 18, color: muted, textDecoration: 'none' }}>
    <span style={{ textAlign: 'right', fontSize: 24, lineHeight: 1.4 }}>複製步驟和網址<br /><strong style={{ color: amber, fontFamily: mono }}>prompts.md</strong> {section ?? `練習 ${step}`}</span>
    <img src={promptsQr} alt="prompts.md 的 QR code" style={{ width: 120, height: 120, display: 'block', background: '#FFFFFF', border: `1px solid ${rule}`, padding: 5 }} />
  </a>
    <a href={PROMPTS_URL} target="_blank" rel="noreferrer" style={{ position: 'absolute', left: 144, bottom: 112, fontSize: 24, lineHeight: '26px', color: amber, textDecoration: 'underline', textUnderlineOffset: 3 }}>{PROMPTS_URL}</a>
    <div aria-hidden style={{ order: 1, height: 24, flexShrink: 0 }} />
  </>
);

// The five chapters of the lesson. Pages inside a chapter show where we are.
const CHAPTERS = ['開一座花園', '連接 Obsidian', '網站怎麼更新', '挑卡發布', '互相驗收與延伸'];
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

const Shell = ({ children, top = 112, chapter, enterChapter = false, source }: { children: ReactNode; top?: number; chapter?: Chapter; enterChapter?: boolean; source?: ReactNode }) => (
  <div className="aw4-deck" style={{ width: '100%', height: '100%', boxSizing: 'border-box', position: 'relative', display: 'flex', flexDirection: 'column', background: 'var(--osd-bg)', color: 'var(--osd-text)', fontFamily: 'var(--osd-font-body)', padding: `${top}px 144px 126px` }}>
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

// One click of a guided tour: an outline over a picture plus its caption. The outline is
// positioned (in px) against the nearest `position: relative` box around the <Steps>.
// It returns siblings, so the reveal's 8px rise never moves the outline's anchor.
// `at` puts the number badge at a given centre instead of on the outline's corner.
const TourStep = ({ n, title, detail, box, badge = 'left', at }: { n: number; title: ReactNode; detail?: ReactNode; box: [number, number, number, number]; badge?: 'left' | 'right'; at?: [number, number] }) => (
  <>
    <Callout n={n} title={title} detail={detail} />
    <div style={{ position: 'absolute', left: box[0], top: box[1], width: box[2], height: box[3], border: '4px solid #E9B650', boxSizing: 'border-box' }} />
    <span style={{ position: 'absolute', left: at ? at[0] - 22 : badge === 'left' ? box[0] - 22 : box[0] + box[2] - 22, top: at ? at[1] - 22 : box[1] - 22, width: 44, height: 44, borderRadius: 22, background: amber, color: '#FFFFFF', display: 'grid', placeItems: 'center', fontSize: 24, fontWeight: 600, boxShadow: '0 0 0 4px #FFFFFF' }}>{n}</span>
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

const Layer = ({ w = 1632, h, label, still = false, children }: { w?: number; h: number; label?: string; still?: boolean; children: ReactNode }) => (
  <svg className={still ? 'aw4-still' : undefined} viewBox={`0 0 ${w} ${h}`} style={{ position: 'absolute', inset: 0, width: w, height: h, overflow: 'visible' }} role={label ? 'img' : undefined} aria-label={label} aria-hidden={label ? undefined : true}>{children}</svg>
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

// With `draw` (inside a <Step>), the shaft draws itself when the step is revealed and the tip lands at its end.
const MapArrow = ({ x1, x2, y, hot = false, draw = false }: { x1: number; x2: number; y: number; hot?: boolean; draw?: boolean }) => (
  <g fill={hot ? amber : faint} stroke={hot ? amber : faint}>
    {draw ? <path d={`M${x1} ${y} H${x2 - 12}`} pathLength={1} fill="none" strokeWidth={hot ? 4 : 3} className="aw4-stepdraw" style={buildDelay(0, 60)} /> : <line x1={x1} y1={y} x2={x2 - 12} y2={y} strokeWidth={hot ? 4 : 3} />}
    <polygon points={`${x2},${y} ${x2 - 16},${y - 9} ${x2 - 16},${y + 9}`} strokeWidth="0" className={draw ? 'aw4-tip' : undefined} style={draw ? { transitionDelay: '240ms' } : undefined} />
  </g>
);

// With `draw` (inside a <Step>), it draws itself like MapArrow.
const DownArrowSvg = ({ x, y1, y2, color = faint, draw = false }: { x: number; y1: number; y2: number; color?: string; draw?: boolean }) => (
  <g fill={color} stroke={color}>
    {draw ? <path d={`M${x} ${y1} V${y2 - 12}`} pathLength={1} fill="none" strokeWidth="3" className="aw4-stepdraw" style={buildDelay(0, 60)} /> : <line x1={x} y1={y1} x2={x} y2={y2 - 12} strokeWidth="3" />}
    <polygon points={`${x},${y2} ${x - 9},${y2 - 16} ${x + 9},${y2 - 16}`} strokeWidth="0" className={draw ? 'aw4-tip' : undefined} style={draw ? { transitionDelay: '240ms' } : undefined} />
  </g>
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
    <rect x={x + 88} y={y + 8} width={w - 96} height="36" rx="18" fill="#FFFFFF" />
    <text x={x + 102} y={y + 34.5} fontSize="24" fontFamily={mono} fill={muted}>{url}</text>
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
    <In i={1} style={{ marginTop: 62 }}><Title>{'把知識庫發布成網站'}</Title></In>
    <In i={2} style={{ marginTop: 40, fontSize: 35, color: muted }}>從 Obsidian 到一個公開網址</In>
    <In i={3} style={{ width: 160, height: 5, background: amber, marginTop: 72 }}><span /></In>
    <In i={3} style={{ marginTop: 40, display: 'flex', alignItems: 'center', gap: 14, fontSize: 28, color: muted }}>
      <Icon kind="browser" size={36} color={muted} />在筆電打開簡報：<span style={{ fontFamily: mono, color: ink, fontWeight: 600 }}>chrouos.github.io/AI-workshop-slides</span>
    </In>
    <div style={{ position: 'absolute', right: 144, bottom: 170 }}>
      <Figure w={720} h={200} label="筆記、Forestry、網址">
        <InG i={3}><circle cx="80" cy="100" r="72" fill={linkSoft} stroke={link} strokeWidth="2" /><SvgIcon kind="doc" x={80} y={100} size={70} color={link} /></InG>
        <InG i={4}><MapArrow x1={168} x2={232} y={100} /></InG>
        <InG i={5}><circle cx="320" cy="100" r="72" fill="#FFFFFF" stroke={faint} strokeWidth="2" /><SvgIcon kind="server" x={320} y={100} size={70} color={muted} /></InG>
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
    <Heading>課程回顧：前三堂成果</Heading>
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
            <MapArrow x1={1116} x2={1332} y={110} hot draw />
            <Build><LessonStop x={1428} n={4} kind="globe" name="網站" file="….forestry.md" hot /></Build>
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
        <InG i={0}><BrowserFrame x={0} y={0} w={1632} h={410} url="https://你的花園.forestry.md" /></InG>
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
          <rect x="930" y="86" width="672" height="146" fill="#FFFFFF" stroke={rule} strokeWidth="2" />
          <text x="956" y="118" fontSize="24" fill={quiet}>時間軸｜看事件順序</text>
          <text x="1590" y="118" textAnchor="end" fontSize="24" fill={muted}>橫向，沒有連結</text>
          <line x1="956" y1="180" x2="1576" y2="180" stroke={muted} strokeWidth="3" />
          <path d="M1576 172 L1590 180 L1576 188 Z" fill={muted} />
          <text x="1030" y="162" textAnchor="middle" fontSize="24" fill={ink}>桃園結義</text>
          <circle cx="1030" cy="180" r="7" fill={muted} />
          <text x="1030" y="216" textAnchor="middle" fontSize="24" fill={muted}>第 1 回</text>
          <text x="1190" y="162" textAnchor="middle" fontSize="24" fill={ink}>三英戰呂布</text>
          <circle cx="1190" cy="180" r="7" fill={muted} />
          <text x="1190" y="216" textAnchor="middle" fontSize="24" fill={muted}>第 5 回</text>
          <text x="1350" y="162" textAnchor="middle" fontSize="24" fill={ink}>白門樓</text>
          <circle cx="1350" cy="180" r="7" fill={muted} />
          <text x="1350" y="216" textAnchor="middle" fontSize="24" fill={muted}>第 19 回</text>
          <text x="1510" y="162" textAnchor="middle" fontSize="24" fill={ink}>煮酒論英雄</text>
          <circle cx="1510" cy="180" r="7" fill={muted} />
          <text x="1510" y="216" textAnchor="middle" fontSize="24" fill={muted}>第 21 回</text>
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
    <Eyebrow>AGENDA｜120 分鐘，含五個練習</Eyebrow>
    <Heading>課程大綱</Heading>
    <Fit>
      <div style={{ display: 'grid', gridTemplateColumns: AGENDA_COLS, paddingBottom: 12, borderBottom: `1px solid ${rule}` }}>
        <span /><SmallLabel>章節</SmallLabel><SmallLabel>結束時你會</SmallLabel><span style={{ textAlign: 'right' }}><SmallLabel>時間｜頁</SmallLabel></span>
      </div>
      <AgendaRow i={0} n={1} kind="globe" result="打得開自己的網址" time="10–22 分" page={Section1} />
      <AgendaRow i={1} n={2} kind="plug" result="首頁變成三國演義" time="22–44 分" page={Section2} />
      <AgendaRow i={2} n={3} kind="gear" result="說得出網站怎麼更新" time="44–58 分" page={Section3} />
      <AgendaRow i={3} n={4} kind="timeline" result="時間軸、導覽頁上線" time="58–89 分" page={Section4} />
      <AgendaRow i={4} n={5} kind="user" result="同學點得到你的新卡" time="89–120 分" page={Section5} />
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

const Section1: Page = () => <SectionPage chapter={1} label="01 / 花園" lead="在 Forestry.md 種一座花園，拿到自己的網址" />;

const WebsiteIs: Page = () => (
  <Shell source={'MDN Web Docs〈How the web works〉developer.mozilla.org'}>
    <Eyebrow>網站＝網址＋檔案</Eyebrow>
    <Heading>用戶端與伺服器（Client–Server）</Heading>
    <Lead>網址像門牌，指出網頁放在哪台電腦</Lead>
    <Fit>
      <Stage h={420}>
        <Steps>
          <Layer h={420} label="你在瀏覽器輸入網址">
            <InG i={0}>
              <BrowserFrame x={0} y={20} w={470} h={300} url="你的花園.forestry.md" />
              <rect x="40" y="150" width="390" height="64" rx="32" fill={amberSoft} stroke={amber} strokeWidth="2" />
              <text x="235" y="192" textAnchor="middle" fontSize="28" fill={ink}>輸入網址，按 Enter</text>
            </InG>
            <InG i={1}><SvgNum x={24} y={385} n={1} /><text x="60" y="395" fontSize="30" fontWeight="600" fill={ink}>你的瀏覽器</text></InG>
          </Layer>
          <Step duration={STEP_MS}><Layer h={420} label="網址指向一台一直開著的電腦，它找到〈劉備〉這個檔案">
            <MapArrow x1={484} x2={584} y={170} hot draw />
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
            <MapArrow x1={1054} x2={1150} y={170} hot draw />
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
  <Shell source={'Fowler 2024, Continuous Integration martinfowler.com/articles/continuousIntegration.html'}>
    <Eyebrow>自動化部署</Eyebrow>
    <Heading>持續整合與持續部署（CI/CD）</Heading>
    <Lead>按發布後，自動建置並更新網站</Lead>
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
          <Step duration={STEP_MS}><Layer h={470} label="CI/CD：你按發布送到 Forestry，之後建置和上線都自動跑">
            <text x="0" y="270" fontSize="28" fontWeight="600" fill={amber}>CI/CD：你只按發布，建置和上線自動</text>
            <Build><LaneBox x={0} y={290} kind="doc" label="改好檔案" tone="plain" /></Build>
            <Build i={1}><MapArrow x1={338} x2={426} y={350} hot /><LaneBox x={434} y={290} kind="mail" label="按發布" tone="you" /><text x="599" y="446" textAnchor="middle" fontSize="25" fontWeight="600" fill={link}>手動：送到 Forestry</text></Build>
            <Build i={2}><MapArrow x1={772} x2={860} y={350} hot /><LaneBox x={868} y={290} kind="gear" label="自動建置" tone="auto" /></Build>
            <Build i={3}><MapArrow x1={1206} x2={1294} y={350} hot /><LaneBox x={1302} y={290} kind="globe" label="自動上線" tone="auto" /></Build>
            <Build i={4}><path d="M868 418 V428 H1632 V418" fill="none" stroke={okGreen} strokeWidth="3" /><text x="1250" y="458" textAnchor="middle" fontSize="25" fontWeight="600" fill={okGreen}>Forestry 收到後，自動跑</text></Build>
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
  <Shell chapter={3} source={'Forestry.md 儀表板 Publish history（講師 2026-10-30 實測）'}>
    <Eyebrow>一次更新的流程｜講師實測</Eyebrow>
    <Heading>自動部署的更新流程</Heading>
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
          <Step duration={STEP_MS}><Layer h={430} label="自動：Forestry 收到新版本">
            <g fill="none" stroke={okGreen} strokeWidth="5"><StepPath d={`M${TICK_XS[1] + 20} 230 H${TICK_XS[2] - 20}`} /></g>
            <Build i={1}><Tick x={TICK_XS[2]} time="自動" kind="repo" label="Forestry 收到" sub="發布紀錄多一筆" /></Build>
          </Layer></Step>
          <Step duration={STEP_MS}><Layer h={430} label="自動：Forestry 建置">
            <g fill="none" stroke={okGreen} strokeWidth="5"><StepPath d={`M${TICK_XS[2] + 20} 230 H${TICK_XS[3] - 20}`} /></g>
            <Build i={1}><Tick x={TICK_XS[3]} time="自動" kind="gear" label="建置" sub="重新建置整個網站" /></Build>
          </Layer></Step>
          <Step duration={STEP_MS}><Layer h={430} label="網址更新：按發布後大約半分鐘">
            <g fill="none" stroke={okGreen} strokeWidth="5"><StepPath d={`M${TICK_XS[3] + 20} 230 H${TICK_XS[4] - 20}`} /></g>
            <Build i={1}><Tick x={TICK_XS[4]} time="自動" kind="globe" label="網址更新" sub="重新整理就看到" hot /></Build>
            <Build i={2}>
              <path d={`M${TICK_XS[1]} 380 V394 H${TICK_XS[4]} V380`} fill="none" stroke={amber} strokeWidth="3" />
              <text x={(TICK_XS[1] + TICK_XS[4]) / 2} y="428" textAnchor="middle" fontSize="27" fontWeight="600" fill={amber}>按發布後大約半分鐘（講師實測 22–24 秒）</text>
            </Build>
          </Layer></Step>
        </Steps>
      </Stage>
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={36}>沒變的話，先等半分鐘再重新整理</Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

const BuildStep: Page = () => (
  <Shell chapter={3} source={'Digital Garden 模板 github.com/oleeskild/digitalgarden（Forestry.md 也用它建置）；Eleventy 文件 11ty.dev/docs'}>
    <Eyebrow>原始檔 → 網頁</Eyebrow>
    <Heading>靜態網站建置（Build）</Heading>
    <Lead>把 Markdown 筆記轉成瀏覽器能讀的網頁</Lead>
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
          <Step duration={STEP_MS}><Layer h={430} label="Forestry 建置：照模板把原始檔做成網頁">
            <Build>
              <SvgIcon kind="gear" x={810} y={150} size={110} color={amber} />
              <text x="810" y="258" textAnchor="middle" fontSize="31" fontWeight="600" fill={ink}>Forestry 建置</text>
            </Build>
            <MapArrow x1={640} x2={980} y={310} hot draw />
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
  <Shell chapter={3} source={'Digital Garden 入門（dg-publish）docs.forestry.md/getting-started/01-getting-started'}>
    <Eyebrow>公開範圍</Eyebrow>
    <Heading>發布旗標（dg-publish）</Heading>
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
              <text x="710" y="196" textAnchor="middle" fontSize="25" fill={muted}>打勾的才放行</text>
            </InG>
            <g fill="none" stroke={faint} strokeWidth="3"><DrawPath i={4} d="M370 98 C440 98 470 130 540 140" /><DrawPath i={4} d="M370 168 C440 168 470 160 560 170" /><DrawPath i={4} d="M370 238 C440 238 480 200 590 200" /></g>
          </Layer>
          <Step duration={STEP_MS}><Layer h={450} label="網站上只出現三張打勾的卡">
            <MapArrow x1={780} x2={1010} y={300} hot draw />
            <text x="895" y="282" textAnchor="middle" fontSize="25" fontWeight="600" fill={link}>按發布才送出</text>
            <Build>
              <BrowserFrame x={1030} y={40} w={602} h={380} url="….forestry.md" />
              <SvgChip x={1070} y={130} w={300} h={60} label="三國演義" size={28} />
              <SvgChip x={1070} y={210} w={300} h={60} label="劉備" size={28} />
              <SvgChip x={1070} y={290} w={300} h={60} label="時間軸" size={28} />
              <OkDot x={1420} y={210} r={30} />
            </Build>
          </Layer></Step>
          <Step duration={STEP_MS}><Layer h={450} label="沒勾的兩張留在你的電腦">
            <g fill="none" stroke={faint} strokeWidth="3"><StepPath d="M368 336 C376 360 378 380 380 392" /></g>
            <Build i={1}>
              <rect x="380" y="372" width="300" height="54" fill={surface} stroke={faint} strokeWidth="2" strokeDasharray="8 6" />
              <text x="530" y="408" textAnchor="middle" fontSize="27" fill={muted}>留在你的電腦</text>
            </Build>
          </Layer></Step>
        </Steps>
      </Stage>
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={32}>dg-publish 只負責選卡，按發布才會送出</Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

// ---------- 02 建立網站 ----------

const Section2: Page = () => <SectionPage chapter={2} label="02 / 連接" lead="裝外掛、連上 Forestry，發布第一次" />;

// An outline over the picture that marks the spot a checklist line talks about. It is
// positioned against the nearest `position: relative` box around the <Steps>.
const Spot = ({ box }: { box: [number, number, number, number] }) => (
  <div style={{ position: 'absolute', left: box[0], top: box[1], width: box[2], height: box[3], border: '4px solid #E9B650', boxSizing: 'border-box' }} />
);

// One step of the catch-up route for students without an account yet.
const CatchChip = ({ children }: { children: ReactNode }) => (
  <span style={{ background: amberSoft, border: `2px solid ${amber}`, padding: '8px 18px' }}>{children}</span>
);

const ForestryAccount: Page = () => (
  <Shell chapter={1} source={'Forestry.md forestry.md（講師 2026-10-30 實際畫面）'}>
    <Eyebrow>課前作業｜實際畫面</Eyebrow>
    <Heading>註冊 Forestry.md</Heading>
    <Fit>
      <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: '440px 1fr', gap: 110, alignItems: 'start' }}>
        <In i={0}><Screenshot src={forestrySignin} aspect={976 / 1280} width={440} alt="Forestry.md 登入頁：Sign in、Sign up 兩個分頁，Email、Password 欄位，下面是 GitHub 登入按鈕" /></In>
        <div style={{ display: 'grid', gap: 48, paddingTop: 40 }}>
          <Steps>
            <Step duration={STEP_MS}><TourStep n={1} title="按 Sign up 註冊" detail="打開 forestry.md" box={[226, 186, 186, 46]} badge="right" /></Step>
            <Step duration={STEP_MS}><TourStep n={2} title="填 email 和密碼" detail="自己設一組密碼" box={[44, 260, 372, 118]} badge="right" /></Step>
            <Step duration={STEP_MS}><TourStep n={3} title="或用 GitHub 登入" detail="有 GitHub 帳號的人，按這裡就好" box={[44, 506, 372, 48]} badge="right" /></Step>
          </Steps>
        </div>
      </div>
      <Steps><Step duration={STEP_MS}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 36, fontSize: 26, whiteSpace: 'nowrap' }}>
          <span style={{ fontWeight: 600, color: amber }}>還沒註冊：</span>
          <CatchChip>forestry.md</CatchChip><span style={{ color: faint }}>→</span>
          <CatchChip>Sign up</CatchChip><span style={{ color: faint }}>→</span>
          <CatchChip>下一頁 Plant 一座花園</CatchChip>
        </div>
      </Step></Steps>
    </Fit>
  </Shell>
);

const PlantGarden: Page = () => (
  <Shell chapter={1} source={'Forestry.md 儀表板（講師 2026-10-30 實際畫面）'}>
    <Eyebrow>登入後第一個畫面｜實際畫面</Eyebrow>
    <Heading>種一座花園（Plant）</Heading>
    <Fit>
      <div style={{ position: 'relative', width: 1000, margin: '0 auto' }}>
        <In i={0}><Screenshot src={forestryPlant} aspect={1202 / 542} width={1000} alt="Plant new garden：Garden name 欄位填著 green-elm，下面顯示 green-elm.forestry.md，最下面是 Plant 按鈕" /></In>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 36, marginTop: 36 }}>
          <Steps>
            <Step duration={STEP_MS}><TourStep n={1} title="取名字" detail="會先給一個，可以改" box={[48, 142, 680, 66]} at={[22, 175]} /></Step>
            <Step duration={STEP_MS}><TourStep n={2} title="這就是網址" detail="名字.forestry.md" box={[48, 212, 300, 36]} badge="right" /></Step>
            <Step duration={STEP_MS}><TourStep n={3} title="按 Plant" detail="約半分鐘種好" box={[48, 334, 752, 66]} /></Step>
          </Steps>
        </div>
      </div>
    </Fit>
  </Shell>
);

const GardenLive: Page = () => (
  <Shell chapter={1} source={'Forestry.md 儀表板（講師 2026-10-30 實際畫面）'}>
    <Eyebrow>種好之後｜實際畫面</Eyebrow>
    <Heading>網站上線：Your garden is live</Heading>
    <Fit>
      <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: '880px 1fr', gap: 80, alignItems: 'start' }}>
        <In i={0}><Screenshot src={forestryGardenLive} aspect={2014 / 1250} width={880} alt="Forestry 儀表板：Your garden is live，網址 glowing-clearing.forestry.md，Copy address 按鈕；下面是 Connect Obsidian、Choose your home page 兩個步驟" /></In>
        <div style={{ display: 'grid', gap: 44, paddingTop: 30 }}>
          <Steps>
            <Step duration={STEP_MS}><TourStep n={1} title="你的網址" detail="點一下就能打開" box={[300, 164, 284, 38]} badge="right" /></Step>
            <Step duration={STEP_MS}><TourStep n={2} title="Copy address" detail="複製網址，傳給同學用" box={[386, 198, 108, 34]} badge="right" /></Step>
            <Step duration={STEP_MS}><TourStep n={3} title="下一步：Connect Obsidian" detail="第二章做" box={[28, 318, 620, 46]} /></Step>
          </Steps>
        </div>
      </div>
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
  <Shell chapter={1} source={'Forestry.md forestry.md'}>
    <PracticeEyebrow time="6 分鐘">練習 1｜驗收課前作業</PracticeEyebrow>
    <Heading>練習（驗收）：打開自己的網址</Heading>
    <PromptsCopy step="1" />
    <PillRow>
      <Pill tag="定位">自己的花園</Pill>
      <Pill tag="期望輸出">打得開網址</Pill>
      <Pill tag="限制">一人一座</Pill>
    </PillRow>
    <Fit>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', gap: 24 }}>
        <FlowStep i={1} n={1} w={420} kind="user" label="登入 Forestry" sub="還沒註冊就現場註冊" />
        <FlowArrow i={2} />
        <FlowStep i={3} n={2} w={420} kind="home" label="有一座花園" sub="沒有就按 Plant" />
        <FlowArrow i={4} />
        <FlowStep i={5} n={3} w={420} kind="globe" label="打開網址" sub="名字.forestry.md" />
      </div>
      <Steps>
        <Step duration={STEP_MS}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 40, marginTop: 56 }}>
            <div style={{ background: sage, padding: '16px 30px' }}><StatusLine ok size={32}>打得開網址：過關</StatusLine></div>
            <div style={{ background: warnSoft, padding: '16px 30px' }}><StatusLine ok={false} size={32}>打不開：舉手，助教來</StatusLine></div>
          </div>
        </Step>
      </Steps>
    </Fit>
  </Shell>
);

// ---------- 03 連接 Obsidian ----------

const Section3: Page = () => <SectionPage chapter={3} label="03 / 原理" lead="改一句、再發布一次，看網站怎麼更新" />;

const InstallPlugin: Page = () => (
  <Shell chapter={2} source={'Obsidian 說明：社群外掛 obsidian.md/help/community-plugins'}>
    <Eyebrow>Obsidian 設定｜實際畫面（Obsidian 1.14.4）</Eyebrow>
    <Heading>安裝 Digital Garden 外掛</Heading>
    <Fit>
      <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: '880px 1fr', gap: 64, alignItems: 'start' }}>
        <In i={0}><Screenshot src={obsidianRestricted} aspect={1784 / 880} width={880} alt="Obsidian 設定，左邊選第三方外掛程式，右邊有「離開受限模式」按鈕" /></In>
        <In i={1}><Screenshot src={dgPluginInstall} aspect={840 / 490} width={600} alt="社群外掛的 Digital Garden 頁：版本 2.103.0、作者 oleeskild、安裝按鈕" /></In>
        <div style={{ gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 36, marginTop: 8 }}>
          <Steps>
            <Step duration={STEP_MS}><TourStep n={1} title="第三方外掛程式" detail="按「離開受限模式」" box={[730, 300, 124, 44]} /></Step>
            <Step duration={STEP_MS}><TourStep n={2} title="瀏覽 → 搜 Digital Garden" detail="作者 oleeskild" box={[944, 0, 600, 76]} /></Step>
            <Step duration={STEP_MS}><TourStep n={3} title="安裝 → 啟用" detail="裝好後按「啟用」" box={[962, 280, 84, 46]} badge="right" /></Step>
          </Steps>
        </div>
      </div>
    </Fit>
  </Shell>
);

const ConnectForestry: Page = () => (
  <Shell chapter={2} source={'Digital Garden 外掛 2.103.0 設定；Forestry.md 儀表板（講師 2026-10-30 實際畫面）'}>
    <Eyebrow>設定 → Digital Garden｜實際畫面</Eyebrow>
    <Heading>用 Garden Key 連上 Forestry</Heading>
    <Fit>
      <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: '1000px 1fr', gap: 60, alignItems: 'start' }}>
        <In i={0}><Screenshot src={forestryPluginConnect} aspect={1850 / 790} width={1000} caption="Obsidian：外掛設定，還沒連線" alt="Digital Garden 外掛設定：Publish to 選 Forestry.md，下面 Garden Key 欄位是空的，旁邊有 Connect 按鈕" /></In>
        <In i={1}><Screenshot src={forestryGardenKey} aspect={806 / 577} width={520} caption="Forestry 儀表板：Garden Key" alt="Forestry 儀表板的 Garden Key 卡片，金鑰遮住，下面有 Reveal Garden Key 和 Regenerate Garden Key" /></In>
        <div style={{ gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 36, marginTop: 8 }}>
          <Steps>
            <Step duration={STEP_MS}><TourStep n={1} title="Publish to 選 Forestry.md" box={[810, 76, 166, 44]} /></Step>
            <Step duration={STEP_MS}><TourStep n={2} title="Reveal Garden Key，複製" detail="或按儀表板的 Connect Obsidian，自動填好" box={[1074, 244, 476, 44]} /></Step>
            <Step duration={STEP_MS}><TourStep n={3} title="貼上，按 Connect" detail="出現 Connected to 你的花園" box={[462, 226, 516, 58]} /></Step>
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

const KeySafety: Page = () => (
  <Shell chapter={2} source={'Forestry.md 儀表板 Garden Key 說明（講師 2026-10-30 畫面）'}>
    <Eyebrow>Garden Key 的保管</Eyebrow>
    <Heading>Garden Key 等同密碼</Heading>
    <Lead>有了它，誰都能發布到你的網站</Lead>
    <Fit>
      <Stage h={440}>
        <Steps>
          <Layer h={440} label="中間是一把 Garden Key">
            <PopG i={0}><circle cx="816" cy="170" r="120" fill={amberSoft} stroke={amber} strokeWidth="3" /><SvgIcon kind="key" x={816} y={170} size={150} color={amber} /></PopG>
            <InG i={1}><text x="816" y="336" textAnchor="middle" fontSize="28" fill={muted}>Garden Key</text></InG>
          </Layer>
          <Step duration={STEP_MS}><Layer h={440} label="只放一個地方：外掛設定的 Garden Key 欄位">
            <g fill="none" stroke={okGreen} strokeWidth="4"><StepPath d="M694 170 H470" /></g>
            <Build i={1}>
              <rect x="0" y="100" width="460" height="140" fill={sage} stroke={okGreen} strokeWidth="2" />
              <OkDot x={44} y={140} r={22} />
              <text x="80" y="150" fontSize="30" fontWeight="600" fill={ink}>只貼在外掛設定</text>
              <text x="80" y="200" fontSize="26" fill={muted}>Garden Key 欄位</text>
            </Build>
          </Layer></Step>
          <Step duration={STEP_MS}><Layer h={440} label="不要貼進筆記、截圖或聊天群組">
            <g fill="none" stroke={warn} strokeWidth="3" strokeDasharray="8 8"><path d="M936 150 L1160 78" /><path d="M938 172 H1160" /><path d="M936 194 L1160 266" /></g>
            <Build><NoPlace y={40} label="貼進筆記" /></Build>
            <Build i={1}><NoPlace y={134} label="截圖、投影片" /></Build>
            <Build i={2}><NoPlace y={228} label="LINE 群組、Email" /></Build>
          </Layer></Step>
          <Step duration={STEP_MS}><Layer h={440} label="外流了：到 Forestry 按 Regenerate Garden Key">
            <Build>
              <rect x="436" y="372" width="760" height="64" rx="32" fill="#FFFFFF" stroke={amber} strokeWidth="2" />
              <SvgIcon kind="key" x={480} y={404} size={42} color={amber} />
              <text x="516" y="414" fontSize="28" fill={ink}>外流了 → Forestry 按 Regenerate Garden Key</text>
            </Build>
          </Layer></Step>
        </Steps>
      </Stage>
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={32}>換一把新的，舊的就失效</Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

// A note's path and the address it gets when "Simple note URLs" is on.
const SlugRow = ({ y, path }: { y: number; path: string }) => (
  <g>
    <rect x="0" y={y} width="330" height="58" fill="#FFFFFF" stroke={rule} strokeWidth="2" />
    <text x="20" y={y + 39} fontSize="27" fontFamily={mono} fill={ink}>{path}</text>
    <MapArrow x1={340} x2={420} y={y + 29} />
    <rect x="430" y={y} width="160" height="58" fill={warnSoft} stroke={warn} strokeWidth="2" />
    <text x="510" y={y + 39} textAnchor="middle" fontSize="30" fontFamily={mono} fontWeight="600" fill={warn}>///</text>
  </g>
);

const SlugFail: Page = () => (
  <Shell chapter={2} source={'Forestry.md Publish history；@sindresorhus/slugify 1.1.2 實測（講師 2026-10-30）'}>
    <Eyebrow>講師實際踩到的錯｜發布失敗</Eyebrow>
    <Heading>中文卡名發布失敗</Heading>
    <Fit>
      <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: '640px 1fr', gap: 80, alignItems: 'start' }}>
        <div style={{ position: 'relative' }}>
          <In i={0}><Screenshot src={forestryPublishHistory} aspect={1197 / 782} width={640} caption="講師第一次發布：連續失敗兩次" alt="Forestry 的 Publish history：最下面 Garden planted，接著兩筆 Publish failed，最上面一筆 Notes published" /></In>
          <Steps><Step duration={STEP_MS}><div className="aw4-still"><Spot box={[4, 178, 632, 162]} /></div></Step></Steps>
        </div>
        <div>
          <Stage w={600} h={360}>
            <Steps>
              <Layer w={600} h={360} label="三張卡的路徑">
                <InG i={1}><text x="0" y="28" fontSize="26" fontWeight="600" fill={muted}>卡片路徑　Simple note URLs 開著時的網址</text></InG>
              </Layer>
              <Step duration={STEP_MS}><Layer w={600} h={360} label="人物/劉備、人物/關羽、關係/桃園結義，網址全都變成三條斜線">
                <Build><SlugRow y={60} path="人物/劉備" /></Build>
                <Build i={1}><SlugRow y={140} path="人物/關羽" /></Build>
                <Build i={2}><SlugRow y={220} path="關係/桃園結義" /></Build>
              </Layer></Step>
              <Step duration={STEP_MS}><Layer w={600} h={360} label="中文字被拿掉，每張卡的網址撞在一起，網站建置失敗">
                <Build><path d="M600 66 V330" fill="none" stroke={warn} strokeWidth="3" /><text x="0" y="340" fontSize="26" fontWeight="600" fill={warn}>中文被拿掉，網址撞在一起 → 建置失敗</text></Build>
              </Layer></Step>
            </Steps>
          </Stage>
        </div>
      </div>
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={28}>卡名是中文，就要關掉 Simple note URLs</Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

const SlugFix: Page = () => (
  <Shell chapter={2} source={'Digital Garden 外掛 2.103.0 設定 Simple note URLs'}>
    <Eyebrow>設定 → Digital Garden → Publishing｜外掛畫面</Eyebrow>
    <Heading>關掉 Simple note URLs</Heading>
    <Fit>
      <div style={{ position: 'relative', width: 1200, margin: '0 auto' }}>
        <In i={0}><Screenshot src={forestryPluginSlugify} aspect={1850 / 386} width={1200} caption="連上 Forestry 之後，同一頁往下捲才看得到 Publishing" alt="Digital Garden 外掛設定的 Publishing 區：Simple note URLs，說明寫 Turn this off if your note names use non-Latin characters，開關是開著的" /></In>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 36, marginTop: 40 }}>
          <Steps>
            <Step duration={STEP_MS}><TourStep n={1} title="說明就寫了" detail="non-Latin（中文）要關掉" box={[22, 116, 804, 96]} /></Step>
            <Step duration={STEP_MS}><TourStep n={2} title="把開關關掉" detail="變成灰色" box={[1078, 112, 92, 52]} badge="right" /></Step>
            <Step duration={STEP_MS}><Callout n={3} title="再發布一次" detail="講師關掉後就變 Published" /></Step>
          </Steps>
        </div>
      </div>
      <Steps><Step duration={STEP_MS}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 28, marginTop: 40, fontSize: 30 }}>
          <span style={{ background: warnSoft, padding: '12px 26px' }}>開著：人物/劉備 → <span style={{ fontFamily: mono, color: warn, fontWeight: 600 }}>///</span></span>
          <span style={{ background: sage, padding: '12px 26px' }}>關掉：人物/劉備 → <span style={{ fontFamily: mono, color: okGreen, fontWeight: 600 }}>/人物/劉備/</span></span>
        </div>
      </Step></Steps>
    </Fit>
  </Shell>
);

const Practice2: Page = () => (
  <Shell chapter={2} source={'Digital Garden 指令 docs.forestry.md/getting-started/02-commands'}>
    <PracticeEyebrow time="10 分鐘">練習 2｜連接</PracticeEyebrow>
    <Heading>練習（連接）：連上 Forestry</Heading>
    <PromptsCopy step="2" />
    <PillRow>
      <Pill tag="定位">今天的儲存庫</Pill>
      <Pill tag="期望輸出">首頁變三國演義</Pill>
      <Pill tag="限制">Garden Key 不外流</Pill>
    </PillRow>
    <Fit>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', gap: 16 }}>
        <FlowStep i={1} n={1} w={250} kind="plug" label="安裝外掛" sub="Digital Garden" />
        <FlowArrow i={2} />
        <FlowStep i={3} n={2} w={250} kind="server" label="Publish to" sub="選 Forestry.md" />
        <FlowArrow i={4} />
        <FlowStep i={5} n={3} w={250} kind="key" label="Garden Key" sub="貼上 → Connect" />
        <FlowArrow i={6} />
        <FlowStep i={7} n={4} w={250} kind="gear" label="關一個開關" sub="Simple note URLs" />
        <FlowArrow i={8} />
        <FlowStep i={9} n={5} w={250} kind="upload" label="發布" sub="Publish All Notes" />
      </div>
      <Steps>
        <Step duration={STEP_MS}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 40, marginTop: 56 }}>
            <div style={{ background: sage, padding: '16px 30px' }}><StatusLine ok size={32}>Published，首頁變〈三國演義〉</StatusLine></div>
            <div style={{ background: warnSoft, padding: '16px 30px' }}><StatusLine ok={false} size={32}>Failed：查第 4 步的開關</StatusLine></div>
          </div>
        </Step>
      </Steps>
    </Fit>
  </Shell>
);

const EditAgain: Page = () => (
  <Shell chapter={3} source={'Forestry.md Publish history（講師 2026-10-30 實測）'}>
    <PracticeEyebrow time="4 分鐘">小練習｜也是休息時間</PracticeEyebrow>
    <Heading>改一句，再發布一次</Heading>
    <PromptsCopy section="小練習" />
    <PillRow>
      <Pill tag="定位">〈三國演義〉</Pill>
      <Pill tag="期望輸出">網站上看到那句</Pill>
      <Pill tag="限制">只改一句</Pill>
    </PillRow>
    <Fit>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', gap: 16 }}>
        <FlowStep i={1} n={1} w={330} kind="doc" label="改一句" sub="〈三國演義〉加一句" />
        <FlowArrow i={2} />
        <FlowStep i={3} n={2} w={330} kind="upload" label="再發布" sub="Publish All Notes" />
        <FlowArrow i={4} />
        <FlowStep i={5} n={3} w={330} kind="clock" label="看發布紀錄" sub="Published 了嗎" />
        <FlowArrow i={6} />
        <FlowStep i={7} n={4} w={330} kind="browser" label="重新整理" sub="網址上看那句" />
      </div>
      <Steps>
        <Step duration={STEP_MS}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 40, marginTop: 56 }}>
            <div style={{ background: sage, padding: '16px 30px' }}><StatusLine ok size={32}>看到新句子：網站更新了</StatusLine></div>
            <div style={{ background: warnSoft, padding: '16px 30px' }}><StatusLine ok={false} size={32}>沒變：等半分鐘再整理</StatusLine></div>
          </div>
        </Step>
      </Steps>
    </Fit>
  </Shell>
);

// ---------- 04 挑卡發布 ----------

const Section4: Page = () => <SectionPage chapter={4} label="04 / 發布" lead="先讓時間軸上線，再做導覽頁" />;

const CodeBlock = ({ label, children, width }: { label: string; children: ReactNode; width?: number }) => (
  <div style={{ width, boxSizing: 'border-box', background: '#202326', color: '#F5F5F4', borderTop: `5px solid ${amber}`, padding: '28px 36px 36px' }}>
    <div style={{ color: '#BAB5B0', fontSize: 24, letterSpacing: '0.06em', marginBottom: 18 }}>{label}</div>
    <div style={{ fontFamily: mono, fontSize: 38, lineHeight: 1.7, whiteSpace: 'pre' }}>{children}</div>
  </div>
);

const PublishSwitch: Page = () => (
  <Shell chapter={4} source={'Obsidian 說明：屬性 obsidian.md/help/properties；dg-publish：docs.forestry.md/getting-started'}>
    <Eyebrow>卡片的屬性</Eyebrow>
    <Heading>Obsidian 屬性（dg-publish）</Heading>
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
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={64}>屬性面板打勾，等於原始檔寫 dg-publish: true</Takeaway></Step></Steps>
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
  <Shell chapter={4} source={'Digital Garden 入門（dg-publish）docs.forestry.md/getting-started/01-getting-started'}>
    <Eyebrow>實測：第三堂產出的兩張卡</Eyebrow>
    <Heading>前置中繼資料（Frontmatter）</Heading>
    <Fit>
      <Stage h={470}>
        <Steps>
          <Layer h={470} label="人物/劉備.md 經過 eli5 改寫，產生 劉備-5歲版.md">
            <InG i={0}><SourceDoc x={0} y={0} w={620} h={268} name="人物/劉備.md" lines={['---', 'dg-publish: true', '---', '劉備，字玄德，是中山靖王之後']} /></InG>
            <InG i={1}><MapArrow x1={640} x2={992} y={124} hot /><text x="816" y="104" textAnchor="middle" fontSize="28" fontWeight="600" fill={amber}>eli5 改寫</text></InG>
            <InG i={2}><SourceDoc x={1012} y={0} w={620} h={268} name="劉備-5歲版.md" lines={['---', 'dg-publish: true', '---', '劉備，字玄德，是中山靖王的後代。']} highlight={1} /></InG>
          </Layer>
          <Step duration={STEP_MS}><Layer h={470} label="改寫版連 dg-publish: true 也一起抄過去">
            <Build>
              <rect x="1030" y="122" width="330" height="48" fill="none" stroke={warn} strokeWidth="4" />
              <text x="1380" y="156" fontSize="27" fontWeight="600" fill={warn}>連這行也抄了</text>
            </Build>
          </Layer></Step>
          <Step duration={STEP_MS}><Layer h={470} label="發布後，網站上會多一張劉備">
            <DownArrowSvg x={1322} y1={272} y2={304} color={warn} />
            <Build>
              <BrowserFrame x={830} y={306} w={802} h={160} url="….forestry.md" />
              <SvgChip x={860} y={378} w={180} h={56} label="劉備" size={27} />
              <SvgChip x={1060} y={378} w={290} h={56} label="劉備-5歲版" size={27} fill={warnSoft} stroke={warn} />
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
              <text x="428" y="360" fontSize="27" fontWeight="600" fill={ink}>時間軸.md 少這行</text>
              <text x="428" y="400" fontSize="25" fontFamily={mono} fill={amber}>+ dg-publish: true</text>
              <text x="428" y="436" fontSize="24" fill={muted}>Skill 產出沒有開頭三行</text>
            </Build>
          </Layer></Step>
        </Steps>
      </Stage>
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={28}>新卡發布前，先看開頭三行</Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

const HomeFlag: Page = () => (
  <Shell chapter={4} source={'Digital Garden 入門（dg-home）docs.forestry.md/getting-started/01-getting-started'}>
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
            <MapArrow x1={660} x2={830} y={210} hot draw />
            <text x="745" y="190" textAnchor="middle" fontSize="25" fontFamily={mono} fill={amber}>網址 /</text>
            <Build>
              <BrowserFrame x={850} y={20} w={782} h={380} url="你的花園.forestry.md/" />
              <SvgIcon kind="home" x={900} y={124} size={48} color={amber} />
              <text x="940" y="140" fontSize="44" fontWeight="600" fill={ink}>三國演義</text>
              <rect x="884" y="176" width="680" height="12" fill={rule} />
              <rect x="884" y="204" width="600" height="12" fill={rule} />
              <text x="884" y="276" fontSize="30" fill={ink}><tspan fill={link} textDecoration="underline">劉備</tspan>、<tspan fill={link} textDecoration="underline">關羽</tspan>、<tspan fill={link} textDecoration="underline">張飛</tspan></text>
            </Build>
            <Build i={1}><text x="1241" y="436" textAnchor="middle" fontSize="27" fill={muted}>打開網址，第一頁就是〈三國演義〉</text></Build>
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
  <Shell chapter={4} source={'Obsidian 說明：內部連結 obsidian.md/help/links'}>
    <Eyebrow>讓讀者從首頁點到每張卡</Eyebrow>
    <Heading>建立知識庫導覽頁</Heading>
    <Fit>
      <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: '780px 1fr', gap: 60, alignItems: 'start' }}>
        <In i={0}>
          <Figure w={780} h={450} label="整理/知識庫導覽.md：開頭有 dg-publish，下面三個路標連到時間軸、人物、事件">
            <DocShape x={0} y={0} w={780} h={440} />
            <text x="30" y="52" fontSize="28" fontWeight="600" fill={ink}>整理/知識庫導覽.md</text>
            <line x1="30" y1="76" x2="740" y2="76" stroke={rule} strokeWidth="2" />
            <text x="30" y="118" fontSize="26" fontFamily={mono} fill={quiet}>dg-publish: true</text>
            <Signpost y={150} label="時間" links="[[時間軸]]" />
            <Signpost y={244} label="人物" links="[[劉備]]、[[曹操]]、[[孫權]]" />
            <Signpost y={338} label="事件" links="[[桃園結義]]、[[白門樓]]…" />
            <text x="250" y="430" fontSize="24" fill={amber}>三英戰呂布先不放，練習 4 再加</text>
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
              <Step duration={STEP_MS}><><div style={{ marginBottom: 14 }}><StatusLine ok size={30}>導覽頁有 dg-publish: true</StatusLine></div><Spot box={[18, 90, 272, 40]} /></></Step>
              <Step duration={STEP_MS}><><div style={{ marginBottom: 14 }}><StatusLine ok size={30}>首頁連到 [[知識庫導覽]]</StatusLine></div><Spot box={[852, 56, 316, 66]} /></></Step>
              <Step duration={STEP_MS}><><div style={{ marginBottom: 14 }}><StatusLine ok size={30}>連到的卡都有 dg-publish</StatusLine></div><Spot box={[238, 144, 530, 254]} /></></Step>
              <Step duration={STEP_MS}><div><StatusLine ok size={30}>5 歲版沒公開（除非你要）</StatusLine></div></Step>
            </Steps>
          </div>
        </div>
      </div>
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={32}>人物、事件的連結，都放在導覽頁</Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

const PublishCommand: Page = () => (
  <Shell chapter={2} source={'Digital Garden 指令 docs.forestry.md/getting-started/02-commands'}>
    <Eyebrow>發布｜Digital Garden 2.103.0 實際畫面</Eyebrow>
    <Heading>命令面板（Command Palette）</Heading>
    <Lead>Ctrl／Cmd + P，打 garden 找指令</Lead>
    <Fit>
      <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: '640px 1fr', gap: 80, alignItems: 'start' }}>
        <In i={0}><Screenshot src={dgPaletteForestry} aspect={1406 / 1123} width={640} alt="Obsidian 命令面板列出 Digital Garden 的指令：第一行 Publish All Notes Marked for Publish，第二行 Add publish flag，下面還有 Publish Active Note 等" /></In>
        <div style={{ display: 'grid', gap: 44, paddingTop: 30 }}>
          <Steps>
            <Step duration={STEP_MS}><TourStep n={1} title="Publish All Notes Marked for Publish" detail="發布所有勾了 dg-publish 的卡；今天都用它" box={[8, 59, 624, 28]} badge="right" /></Step>
            <Step duration={STEP_MS}><TourStep n={2} title="Add publish flag" detail="幫打開的這張卡加上 dg-publish" box={[8, 89, 624, 28]} badge="right" /></Step>
            <Step duration={STEP_MS}><TourStep n={3} title="Publish Active Note" detail="只發布打開的這一張" box={[8, 322, 624, 28]} badge="right" /></Step>
          </Steps>
        </div>
      </div>
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={20}>先 Add publish flag，再 Publish All</Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

const Practice31: Page = () => (
  <Shell chapter={4} source={'Digital Garden 指令 docs.forestry.md/getting-started/02-commands'}>
    <PracticeEyebrow time="8 分鐘">練習 3-1｜時間軸</PracticeEyebrow>
    <Heading>練習（dg-publish）：讓時間軸卡上線</Heading>
    <PromptsCopy step="3-1" />
    <PillRow>
      <Pill tag="定位">整理/時間軸.md</Pill>
      <Pill tag="期望輸出">網站看得到時間軸</Pill>
      <Pill tag="限制">先查開頭三行</Pill>
    </PillRow>
    <Fit>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', gap: 16 }}>
        <FlowStep i={1} n={1} w={330} kind="doc" label="打開時間軸" sub="看開頭三行" />
        <FlowArrow i={2} />
        <FlowStep i={3} n={2} w={330} kind="ok" label="Add publish flag" sub="沒有 dg-publish 才加" />
        <FlowArrow i={4} />
        <FlowStep i={5} n={3} w={330} kind="upload" label="Publish All" sub="等 Published" />
        <FlowArrow i={6} />
        <FlowStep i={7} n={4} w={330} kind="globe" label="打開網址" sub="…/整理/時間軸/" />
      </div>
      <Steps>
        <Step duration={STEP_MS}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 40, marginTop: 56 }}>
            <div style={{ background: sage, padding: '16px 30px' }}><StatusLine ok size={32}>看到橫向時間軸：過關</StatusLine></div>
            <div style={{ background: warnSoft, padding: '16px 30px' }}><StatusLine ok={false} size={32}>404：沒勾或沒發布</StatusLine></div>
          </div>
        </Step>
      </Steps>
    </Fit>
  </Shell>
);

const HtmlTest: Page = () => (
  <Shell chapter={4} source={'markdown-it（模板設定 html: true）github.com/markdown-it/markdown-it；模板 github.com/oleeskild/digitalgarden'}>
    <Eyebrow>實測：第三堂 Skill 的產出｜本機建置</Eyebrow>
    <Heading>時間軸卡上網站（本機測試）</Heading>
    <Fit>
      <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: '500px 1fr', gap: 110, alignItems: 'start' }}>
        <In i={0}>
          <CropShot src={timelineSite} alt="時間軸.md 在 Digital Garden 網站上的樣子：米色框裡一條橫向時間軸，看得到桃園結義第 1 回、三英戰呂布第 5 回、白門樓第 19 回，其餘要往右捲；下方來源卡是六行純文字檔名" nat={[1224, 1410]} crop={[0, 0, 1224, 1410]} width={500} />
          <Caption>講師模板本機建置（2026-10-30）</Caption>
        </In>
        <div style={{ display: 'grid', gap: 48, paddingTop: 60 }}>
          <Steps>
            <Step duration={STEP_MS}><TourStep n={1} title={<StatusLine ok size={34}>HTML 照常顯示</StatusLine>} detail="橫向時間軸，沒有用到 script" box={[4, 6, 494, 566]} /></Step>
            <Step duration={STEP_MS}><TourStep n={2} title={<StatusLine ok size={34}>只看到 3 件，往右滑</StatusLine>} detail="網站內文比較窄，另外 3 件在右邊" box={[26, 148, 452, 112]} badge="right" /></Step>
            <Step duration={STEP_MS}><TourStep n={3} title={<StatusLine ok size={34}>來源卡是純文字</StatusLine>} detail="沒有連結，就不會 404" box={[26, 306, 240, 236]} badge="right" /></Step>
          </Steps>
        </div>
      </div>
    </Fit>
  </Shell>
);

// One way of writing a link inside the timeline's HTML: first the code on a neutral card
// (verdict = undefined), then, on the next click, the same card tinted by its verdict.
const HtmlCode = ({ x, label, lines, ok }: { x: number; label: string; lines: [string, string, string]; ok?: boolean }) => {
  const tone = ok === undefined ? faint : ok ? okGreen : warn;
  return (
    <g>
      <rect x={x} y="0" width="520" height="430" fill={ok === undefined ? surface : ok ? sage : warnSoft} />
      <rect x={x} y="0" width="520" height="5" fill={tone} />
      <text x={x + 26} y="50" fontSize="25" fontWeight="600" fill={ok === undefined ? muted : tone}>{label}</text>
      <rect x={x + 26} y="70" width="468" height="130" fill={term} />
      <text x={x + 44} y="116" fontSize="24" fontFamily={mono} fill="#BCC3CC">{lines[0]}</text>
      <text x={x + 44} y="152" fontSize="24" fontFamily={mono} fill="#F5F5F4">{lines[1]}</text>
      <text x={x + 44} y="188" fontSize="24" fontFamily={mono} fill="#BCC3CC">{lines[2]}</text>
    </g>
  );
};

// …and what the site shows for it (inside a <Step>: the arrow draws, then the result settles).
const HtmlResult = ({ x, ok, shows, note, linkLike = false }: { x: number; ok: boolean; shows: string; note: string; linkLike?: boolean }) => (
  <g>
    <DownArrowSvg x={x + 260} y1={210} y2={252} color={ok ? okGreen : warn} draw />
    <Build i={1}>
      <text x={x + 26} y="282" fontSize="25" fontWeight="600" fill={muted}>網站上看到</text>
      <rect x={x + 26} y="298" width="468" height="62" fill="#FFFFFF" stroke={rule} strokeWidth="2" />
      <text x={x + 44} y="340" fontSize="30" fill={linkLike ? link : ink} textDecoration={linkLike ? 'underline' : undefined}>{shows}</text>
    </Build>
    <Build i={3}>
      {ok ? <OkDot x={x + 40} y={398} r={18} /> : <NoDot x={x + 40} y={398} r={18} />}
      <text x={x + 70} y="408" fontSize="27" fill={ink}>{note}</text>
    </Build>
  </g>
);

const HtmlLinks: Page = () => (
  <Shell source={'CommonMark Spec 0.31.2〈HTML blocks〉spec.commonmark.org/0.31.2/#html-blocks'}>
    <Eyebrow>時間軸 Skill 的寫法</Eyebrow>
    <Heading>HTML 區塊裡的連結</Heading>
    <Lead>同一個連結三種寫法，網站上各長怎樣？</Lead>
    <Fit>
      <Stage h={430}>
        <Steps>
          <Layer h={430} label="第一種寫法：HTML 裡寫 [[劉備]]">
            <InG i={0}><HtmlCode x={0} label="寫法 1：[[ ]] 連結" lines={['<div class="ev">', '  [[劉備]] 桃園結義', '</div>']} /></InG>
          </Layer>
          <Step duration={STEP_MS}><Layer h={430} still label="網站上原樣顯示兩對中括號，點不了">
            <HtmlCode x={0} label="寫法 1：[[ ]] 連結" ok={false} lines={['<div class="ev">', '  [[劉備]] 桃園結義', '</div>']} />
            <HtmlResult x={0} ok={false} shows="[[劉備]] 桃園結義" note="原樣顯示，點不了" />
          </Layer></Step>
          <Step duration={STEP_MS}><Layer h={430} label="第二種寫法：連到 .md 檔的 a 標籤">
            <Build><HtmlCode x={556} label="寫法 2：連到 .md" lines={['<a href="../關係/', '  桃園結義.md">', '…</a>']} /></Build>
          </Layer></Step>
          <Step duration={STEP_MS}><Layer h={430} still label="網站上看起來像連結，能不能點開要看模板版本">
            <HtmlCode x={556} label="寫法 2：連到 .md" ok={false} lines={['<a href="../關係/', '  桃園結義.md">', '…</a>']} />
            <HtmlResult x={556} ok={false} shows="關係/桃園結義.md" note="看模板版本，可能 404" linkLike />
          </Layer></Step>
          <Step duration={STEP_MS}><Layer h={430} label="第三種寫法：純文字">
            <Build><HtmlCode x={1112} label="寫法 3：純文字" lines={['<li>', '  第 1 回：關係/桃園結義', '</li>']} /></Build>
          </Layer></Step>
          <Step duration={STEP_MS}><Layer h={430} still label="網站上正常顯示，不會 404">
            <HtmlCode x={1112} label="寫法 3：純文字" ok lines={['<li>', '  第 1 回：關係/桃園結義', '</li>']} />
            <HtmlResult x={1112} ok shows="第 1 回：關係/桃園結義" note="正常顯示，不會 404" />
          </Layer></Step>
        </Steps>
      </Stage>
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={36}>人名、來源卡用純文字；人物連結放在導覽頁</Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

const Practice32: Page = () => (
  <Shell chapter={4} source={'Digital Garden 指令 docs.forestry.md/getting-started/02-commands'}>
    <PracticeEyebrow time="12 分鐘">練習 3-2｜導覽頁</PracticeEyebrow>
    <Heading>練習（導覽頁）：讓讀者點得到每張卡</Heading>
    <PromptsCopy step="3-2" />
    <PillRow>
      <Pill tag="定位">知識庫導覽</Pill>
      <Pill tag="期望輸出">導覽頁連結點得開</Pill>
      <Pill tag="限制">先查開頭三行</Pill>
    </PillRow>
    <Fit>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', gap: 16 }}>
        <FlowStep i={1} n={1} w={330} kind="terminal" label="Codex 做導覽頁" sub="三英戰呂布先不放" />
        <FlowArrow i={2} />
        <FlowStep i={3} n={2} w={330} kind="home" label="首頁連導覽頁" sub="加 [[知識庫導覽]]" />
        <FlowArrow i={4} />
        <FlowStep i={5} n={3} w={330} kind="search" label="列出沒勾的卡" sub="Codex 只列，你核對" />
        <FlowArrow i={6} />
        <FlowStep i={7} n={4} w={330} kind="upload" label="全部發布" sub="Publish All Notes" />
      </div>
      <Steps>
        <Step duration={STEP_MS}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 32, marginTop: 56 }}>
            <div style={{ background: sage, padding: '16px 28px' }}><StatusLine ok size={30}>首頁 → 導覽頁 → 每張卡</StatusLine></div>
            <div style={{ background: sage, padding: '16px 28px' }}><StatusLine ok size={30}>導覽頁的連結都點得開</StatusLine></div>
            <div style={{ background: warnSoft, padding: '16px 28px' }}><StatusLine ok={false} size={30}>404：那張沒勾或沒發布</StatusLine></div>
          </div>
        </Step>
      </Steps>
    </Fit>
  </Shell>
);

// ---------- 05 互相驗收與延伸 ----------

const Section5: Page = () => <SectionPage chapter={5} label="05 / 驗收" lead="請同學從首頁點一遍，再看下一步" />;

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
    <Heading>網站驗收：連結走查</Heading>
    <Lead>從首頁依序點，每個連結都要打得開</Lead>
    <Fit>
      <div style={{ background: '#FFFFFF', border: `1px solid ${rule}`, padding: '20px 0' }}>
        <Stage h={380}>
          <Steps>
            <Layer h={380} label="四站：首頁、導覽頁，再分到時間軸和白門樓">
              <InG i={0}><RelayStop x={170} y={190} name="首頁" state="ok" /></InG>
              <InG i={1}><RelayStop x={560} y={190} name="導覽頁" state="idle" /></InG>
              <InG i={2}><RelayStop x={1000} y={86} name="時間軸" state="idle" /></InG>
              <InG i={3}><RelayStop x={1000} y={300} name="白門樓" state="idle" /></InG>
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
                <text x="1090" y="148" fontSize="26" fill={muted}>人物連結在導覽頁</text>
              </Build>
            </Layer></Step>
            <Step duration={STEP_MS}><Layer h={380} label="導覽頁點白門樓打不開：先查白門樓有沒有勾 dg-publish">
              <g fill="none" stroke={warn} strokeWidth="6"><StepPath d="M616 218 L752 252" /><StepPath i={3} d="M806 266 L940 290" /></g>
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
    <PracticeEyebrow time="12 分鐘">練習 4｜互相驗收</PracticeEyebrow>
    <Heading>練習（驗收）：同學從首頁找到新卡</Heading>
    <PromptsCopy step="4" />
    <PillRow>
      <Pill tag="定位">一張新卡</Pill>
      <Pill tag="期望輸出">同學點得到新卡</Pill>
      <Pill tag="限制">無痕視窗、從首頁</Pill>
    </PillRow>
    <Fit>
      <Stage h={420}>
        <Steps>
          <Layer h={420} label="你：公開三英戰呂布，加 dg-publish，並在導覽頁加上連結">
            <InG i={0}><PersonBadge x={90} label="你" tint={linkSoft} stroke={link} /></InG>
            <InG i={1}>
              <DocShape x={210} y={30} w={330} h={160} fill="#FFFFFF" stroke={link} sw={2} />
              <SvgNum x={210} y={30} n={1} />
              <text x="240" y="84" fontSize="28" fontWeight="600" fill={ink}>公開三英戰呂布</text>
              <text x="240" y="128" fontSize="25" fill={muted}>加 dg-publish</text>
              <text x="240" y="168" fontSize="25" fill={muted}>導覽頁加連結</text>
            </InG>
          </Layer>
          <Step duration={STEP_MS}><Layer h={420} label="在 Forestry 按 Copy address 複製網址，自己先開無痕視窗看一次，再傳給同學">
            <Build><SvgNum x={600} y={60} n={2} /><text x="636" y="70" fontSize="28" fontWeight="600" fill={ink}>傳你的網址</text></Build>
            <Build i={1}><MapArrow x1={560} x2={1180} y={110} hot /><rect x="660" y="136" width="420" height="54" rx="27" fill="#FFFFFF" stroke={amber} strokeWidth="2" /><text x="870" y="171" textAnchor="middle" fontSize="25" fontFamily={mono} fill={ink}>你的花園.forestry.md</text><text x="870" y="226" textAnchor="middle" fontSize="24" fill={muted}>傳之前，自己先開無痕看一次</text></Build>
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
          <Step duration={STEP_MS}><Layer h={420} label="回報：找到新卡，或哪一頁打不開">
            <Build><SvgNum x={600} y={380} n={4} /><text x="636" y="390" fontSize="28" fontWeight="600" fill={ink}>回報結果</text></Build>
            <Build i={1}><OkDot x={900} y={380} r={22} /><text x="934" y="390" fontSize="28" fill={okGreen} fontWeight="600">找到新卡</text></Build>
            <Build i={2}><NoDot x={1120} y={380} r={22} /><text x="1154" y="390" fontSize="28" fill={warn} fontWeight="600">回報打不開的那一頁</text></Build>
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

// A publish status chip with Forestry's own wording (drawn, not a screenshot).
const StatusChip = ({ x, y, w, label, color }: { x: number; y: number; w: number; label: string; color: string }) => (
  <g><rect x={x} y={y} width={w} height="38" rx="19" fill={color} /><text x={x + w / 2} y={y + 27} textAnchor="middle" fontSize="24" fontWeight="600" fill="#FFFFFF">{label}</text></g>
);

const NotUpdated: Page = () => (
  <Shell chapter={5} source={'Forestry.md 儀表板 Publish history（講師 2026-10-30 實測）'}>
    <Eyebrow>常見問題｜右邊狀態照 Forestry 的字</Eyebrow>
    <Heading>部署疑難排解：四個檢查</Heading>
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
          <Step duration={STEP_MS}><Layer h={520} label="檢查二：Forestry 儀表板的 Publish history，最上面那一筆的時間對得上">
            <Build><CheckRow y={120} n={2} title="Forestry 收到了嗎？" sub="Publish history 最上面那一筆" /></Build>
            <Build i={1}>
              <rect x="640" y="100" width="992" height="120" fill="#FFFFFF" stroke={rule} strokeWidth="2" />
              <rect x="640" y="100" width="992" height="46" fill="#36694B" />
              <text x="664" y="132" fontSize="24" fill="#FFFFFF">Forestry.md ／ 你的花園 ／ Publish history</text>
              <text x="668" y="196" fontSize="26" fill={muted}>最新一筆</text>
              <rect x="800" y="164" width="150" height="44" fill="none" stroke="#E9B650" strokeWidth="4" />
              <text x="875" y="196" textAnchor="middle" fontSize="28" fontWeight="600" fill={ink}>1 分鐘前</text>
              <text x="980" y="196" fontSize="25" fill={okGreen}>和按發布的時間相符：Forestry 已收到</text>
            </Build>
          </Layer></Step>
          <Step duration={STEP_MS}><Layer h={520} label="檢查三：那一筆的狀態：Building 再等、Published 完成、Failed 點開看原因">
            <Build><CheckRow y={250} n={3} title="狀態是什麼？" sub="Building／Published／Failed" /></Build>
            <Build i={1}>
              <rect x="640" y="240" width="992" height="190" fill="#FFFFFF" stroke={rule} strokeWidth="2" />
              <StatusChip x={668} y={262} w={140} label="Building" color={blue} />
              <text x="828" y="290" fontSize="26" fill={ink}>建置中，約半分鐘，再等</text>
              <StatusChip x={668} y={316} w={140} label="Published" color={okGreen} />
              <text x="828" y="344" fontSize="26" fill={ink}>完成，網址已更新</text>
              <StatusChip x={668} y={370} w={140} label="Failed" color={warn} />
              <text x="828" y="398" fontSize="26" fill={ink}>失敗：中文卡先查 Simple note URLs 關了沒</text>
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
  <Shell source={'Lewis et al. 2020, Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks, arXiv:2005.11401'}>
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
          <Step duration={STEP_MS}><MatrixRow label="RAG" cells={['Web Search 就是 RAG', '查筆記、附出處', '時間軸只照卡片排', '每張卡都有出處']} /></Step>
          <Step duration={STEP_MS}><MatrixRow label="Obsidian" cells={['（預告）', '安裝、連結、關係圖', '用回目排時間軸', 'Digital Garden 發布']} /></Step>
          <Step duration={STEP_MS}><MatrixRow label="Skills" cells={['AGENTS.md（預告）', '（預告）', '安裝、自己寫一個', 'Skill 產出放上網站']} /></Step>
        </Steps>
      </div>
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={40}>四堂課都在擴充同一個三國知識庫</Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

// Without `i` (a row inside a <Step>), the row has no entrance of its own.
const SKILL_ROW: CSSProperties = { display: 'grid', gridTemplateColumns: '130px 380px 1fr', alignItems: 'center', gap: 30, background: surface, borderLeft: `5px solid ${amber}`, padding: '36px 40px' };

const SkillRow = ({ i, cmd, what, icon }: { i?: number; cmd: string; what: string; icon: ReactNode }) => {
  const body = (
    <>
      <svg viewBox="0 0 110 80" style={{ width: 110, height: 80 }} aria-hidden="true">{icon}</svg>
      <span style={{ fontFamily: mono, fontSize: 36, fontWeight: 600, color: amber }}>{cmd}</span>
      <span style={{ fontSize: 34, lineHeight: 1.4 }}>{what}</span>
    </>
  );
  return i === undefined ? <div style={SKILL_ROW}>{body}</div> : <In i={i} style={SKILL_ROW}>{body}</In>;
};

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
            <MapArrow x1={300} x2={516} y={110} hot draw />
            <Build><LoopStop x={612} n={2} kind="search" label="核對出處" tag="第 2 堂：RAG" /></Build>
          </Layer></Step>
          <Step duration={STEP_MS}><Layer h={440} label="第三步：勾選、發布">
            <MapArrow x1={708} x2={924} y={110} hot draw />
            <Build><LoopStop x={1020} n={3} kind="upload" label="勾選、發布" tag="第 4 堂：發布" /></Build>
          </Layer></Step>
          <Step duration={STEP_MS}><Layer h={440} label="第四步：傳網址給一個人看，然後下週再一輪">
            <MapArrow x1={1116} x2={1332} y={110} hot draw />
            <Build><LoopStop x={1428} n={4} kind="user" label="傳網址給一個人" tag="第 4 堂：驗收" /></Build>
            <Build i={1}><g fill="none" stroke={amber} strokeWidth="4" strokeDasharray="10 8"><path d="M1428 326 C1428 420 204 420 204 336" /></g></Build>
            <Build i={2}><polygon points="204,326 194,344 214,344" fill={amber} /><text x="816" y="436" textAnchor="middle" fontSize="27" fontWeight="600" fill={amber}>下週再一輪</text></Build>
          </Layer></Step>
        </Steps>
      </Stage>
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={20}>每週一輪，網站每週多一張有出處的卡</Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

const NextSteps: Page = () => (
  <Shell source={'obsidian-wiki 文件 github.com/Ar9av/obsidian-wiki'}>
    <Eyebrow>選修延伸｜課後</Eyebrow>
    <Heading>發布前，用 llm-wiki 整理</Heading>
    <Fit>
      <div style={{ display: 'grid', gap: 28 }}>
        <Steps>
          <SkillRow i={0} cmd="$wiki-ingest" what="收新資料，整理成卡片" icon={<g>
            <DocShape x={4} y={14} w={40} h={52} /><MapArrow x1={50} x2={74} y={40} hot /><Folder x={78} y={18} w={30} h={44} />
          </g>} />
          <Step duration={STEP_MS}><SkillRow cmd="$wiki-query" what="查答案，附出處" icon={<g>
            <circle cx="44" cy="36" r="24" fill="none" stroke={okGreen} strokeWidth="5" /><path d="M62 54 l22 22" stroke={okGreen} strokeWidth="6" strokeLinecap="round" />
          </g>} /></Step>
          <Step duration={STEP_MS}><SkillRow cmd="$wiki-lint" what="健檢：斷連結、孤立頁" icon={<g>
            <rect x="6" y="28" width="38" height="24" rx="12" fill="none" stroke={faint} strokeWidth="5" /><rect x="66" y="28" width="38" height="24" rx="12" fill="none" stroke={faint} strokeWidth="5" />
            <path d="M50 22 L60 58" stroke={warn} strokeWidth="5" strokeLinecap="round" />
          </g>} /></Step>
        </Steps>
      </div>
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={48}>整理、查證、健檢完，再按發布</Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

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

const RefHint = () => (
  <div style={{ fontSize: 25, color: quiet, marginTop: 14 }}>到右邊的網站搜尋標題就找得到；完整網址寫在講者備註</div>
);

const ReferencesGarden: Page = () => (
  <Shell>
    <Eyebrow>延伸閱讀｜今天用到的工具文件</Eyebrow>
    <Heading>參考資料（一）：Digital Garden 與 Obsidian</Heading>
    <RefHint />
    <Fit>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'start' }}>
        <In i={0}>
          <RefGroup label="Digital Garden">
            <RefItem who="Digital Garden 文件" where="docs.forestry.md" title="Getting Started：dg-publish、dg-home" />
            <RefItem who="Digital Garden 文件" where="docs.forestry.md" title="Commands：Publish Active Note、Publish All Notes" />
            <RefItem who="Forestry.md" where="forestry.md" title="代管 Digital Garden：Plant、Garden Key、Publish history" />
            <RefItem who="oleeskild" where="github.com" title="obsidian-digital-garden（外掛 README）" />
            <RefItem who="oleeskild" where="github.com" title="digitalgarden（網站模板）" />
          </RefGroup>
        </In>
        <In i={1}>
          <RefGroup label="Obsidian、Markdown">
            <RefItem who="Obsidian Help" where="obsidian.md" title="Community plugins（社群外掛）" />
            <RefItem who="Obsidian Help" where="obsidian.md" title="Properties（屬性、frontmatter）" />
            <RefItem who="Obsidian Help" where="obsidian.md" title="Internal links（內部連結）" />
            <RefItem who="CommonMark Spec 0.31.2" where="spec.commonmark.org" title="HTML blocks：HTML 區塊裡的文字不會再轉換" />
            <RefItem who="markdown-it" where="github.com" title="模板用的 Markdown 轉換器（html: true）" />
          </RefGroup>
        </In>
      </div>
    </Fit>
  </Shell>
);

const ReferencesDeploy: Page = () => (
  <Shell>
    <Eyebrow>延伸閱讀｜今天用到的工具文件</Eyebrow>
    <Heading>參考資料（二）：網站與自動部署</Heading>
    <RefHint />
    <Fit>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'start' }}>
        <In i={0}>
          <RefGroup label="網站、CI/CD、建置">
            <RefItem who="MDN Web Docs" where="developer.mozilla.org" title="How the web works" />
            <RefItem who="Fowler 2024" where="martinfowler.com" title="Continuous Integration" />
            <RefItem who="Eleventy 文件" where="11ty.dev" title="Digital Garden 模板用的建置工具" />
          </RefGroup>
        </In>
        <In i={1}>
          <RefGroup label="Digital Garden 外掛設定">
            <RefItem who="obsidian-digital-garden 2.103.0" where="github.com" title="Simple note URLs：中文卡名要關掉" />
            <RefItem who="Digital Garden 文件" where="docs.forestry.md" title="自己架：GitHub＋Vercel（課後選讀）" />
          </RefGroup>
        </In>
      </div>
    </Fit>
  </Shell>
);

const AppendixRow = ({ i, page, title, why }: { i: number; page: Page; title: string; why: string }) => (
  <In i={i} style={{ display: 'grid', gridTemplateColumns: '160px 1fr', alignItems: 'baseline', padding: '26px 0', borderBottom: `1px solid ${rule}` }}>
    <span style={{ fontSize: 28, color: amber, fontWeight: 600 }}>第 {pageOf(page)} 頁</span>
    <span><span style={{ fontSize: 36, fontWeight: 600 }}>{title}</span><span style={{ display: 'block', fontSize: 27, color: muted, marginTop: 8 }}>{why}</span></span>
  </In>
);

const AppendixIndex: Page = () => (
  <Shell>
    <Eyebrow>附錄｜課後自讀，上課不講</Eyebrow>
    <Heading>想多懂一點再看</Heading>
    <Fit>
      <div style={{ borderTop: `1px solid ${rule}` }}>
        <AppendixRow i={0} page={HtmlLinks} title="HTML 區塊裡的連結" why="時間軸要自己改 HTML 時，哪種連結寫法點得開" />
        <AppendixRow i={1} page={WebsiteIs} title="用戶端與伺服器" why="打一個網址，網頁是從哪台電腦送來的" />
        <AppendixRow i={2} page={CiCd} title="持續整合與持續部署（CI/CD）" why="工程師說的「自動部署」是什麼" />
      </div>
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
  Section1, ForestryAccount, PlantGarden, GardenLive, Practice1,
  Section2, InstallPlugin, ConnectForestry, KeySafety, SlugFail, SlugFix, PublishCommand, Practice2,
  Section3, EditAgain, UpdateTimeline, BuildStep, PublishFilter,
  Section4, PublishSwitch, FrontmatterCheck, Practice31, HtmlTest, HomeFlag, NavPage, Practice32,
  Section5, CheckSite, Practice4, NotUpdated,
  CourseRecap, Closing, NextSteps, ReferencesGarden, ReferencesDeploy,
  AppendixIndex, HtmlLinks, WebsiteIs, CiCd,
];

// 1-based page number of a page in this deck (for the agenda).
function pageOf(page: Page) {
  return deck.indexOf(page) + 1;
}

// Speaker notes, keyed by page so they stay aligned with the deck order.
const NOTES = new Map<Page, string>([
  [Cover, `00:00–01:00
最後一堂。前三堂我們寫了大綱、做了筆記庫、用 Skill 排出時間軸，全部都還在自己的電腦裡。今天把它變成一個網址，同學、家人打開就看得到。
右下角三個圓圈就是今天的路線：筆記 → Forestry.md → 網址。Forestry.md 是幫你放網站的服務，等一下會介紹。
請大家先在筆電打開這份簡報，網址在畫面上：chrouos.github.io/AI-workshop-slides。練習頁右上角的 prompts.md 連結要在筆電上點，步驟、提示詞和網址都整段複製，不用照投影幕打字；投影幕上的 QR code 只能用手機掃。今天的教材都在 ${LAB_URL} ，整包下載是 aw-04-lab.zip：${LAB_ZIP_URL} ，所有教材的總表在 https://github.com/Chrouos/AI-workshop-slides/tree/main/examples 。`],
  [LessonRecap, `01:00–04:00
先回頭看三樣東西。第一堂用 Codex 寫出 三國演義大綱.md，人名都是 [[連結]]。第二堂把它放進 Obsidian，和人物、勢力、關係卡連起來。第三堂補進三張關係卡，用自己寫的 Skill 排出 時間軸.md。
按一下：第四個站是今天要做的網站。
再按一下：今天把前三堂的成果放到一個網址上。請大家先打開 Obsidian，確認第三堂做的 整理/時間軸.md 和 關係/三英戰呂布.md 都在。`],
  [SiteGoal, `04:00–07:30
這是做完後的樣子（示意，實際外觀看模板）。打開網址先到首頁〈三國演義〉，點〈知識庫導覽〉。導覽頁是一般的筆記，裡面的 [[連結]] 都點得開。
從導覽頁有兩條路：上面那條到〈時間軸〉，看事件的先後順序；它是一條橫向時間軸，線上只有事件名稱和回目，第三堂的 Skill 讓它不放任何連結，所以在時間軸上點不到人物或事件卡。下面那條直接到〈劉備〉〈桃園結義〉這些人物、事件卡。
按一下：這就是今天的路線，首頁 → 導覽頁 → 時間軸、人物、事件。第五章大家會照這條路互相驗收。`],
  [Agenda, `07:30–10:00
五章、五個練習，中間還有一個小練習當休息。順序是先動手、再講原理。
第一章開一座花園：註冊 Forestry.md、種一座花園，練習 1 打開自己的網址。第二章連接 Obsidian：裝外掛、用 Garden Key 連線、關掉一個中文卡一定要關的開關，練習 2 發布第一次。第三章網站怎麼更新：小練習改一句再發布，再看背後發生什麼。第四章挑卡發布：練習 3-1 讓時間軸上線，練習 3-2 做導覽頁。第五章互相驗收：練習 4 請同學從首頁找到你的新卡。
最容易卡的是第一、二章的帳號和連線，助教會在教室後面。上週的課前作業是註冊 Forestry.md 帳號、種一座花園，等一下第 ${pageOf(ForestryAccount)} 頁會確認；沒註冊的人，現場用 email 或 GitHub 帳號註冊。`],
  [Section1, `10:00–10:30
第一章：開一座花園。在 Forestry.md 種出自己的網址，先讓大家有一個打得開的網站。`],
  [WebsiteIs, `（課後自讀，上課不講。）
先問大家：你打一個網址，看到的網頁是從哪來的？
第一個畫面：你在瀏覽器輸入網址。網址就像門牌，告訴瀏覽器去哪一台電腦拿東西。
按一下：網址指向一台一直開著、連在網路上的電腦，叫主機。主機上放了很多檔案，主機找到〈劉備〉這一頁。
按一下：檔案送回來，瀏覽器把它畫成網頁，看到標題、內文、可以點的連結。
最後一下：網站就是放在別台電腦上的檔案。今天要做的，就是把你的卡變成這種檔案，放到那台電腦上。`],
  [CiCd, `（課後自讀，上課不講。）
這頁講一個工程師常說的詞：CI/CD。CI 是 Continuous Integration，持續整合；CD 是 Continuous Deployment，持續部署。名字不用背，記住它在做什麼就好。
上面一排是以前的做法：改好檔案，自己把檔案上傳到主機，再自己重做網頁，才算上線。紅色的兩格都要人動手，常常忘記其中一步。
按一下：下面一排是 CI/CD。紫色那格是你唯一要做的：按發布，把改好的卡送到 Forestry，就像把信投進郵筒。綠色括號是自動的部分：Forestry 收到之後，建置、上線都自動執行，像郵差會把信送到。
最後一下：你按發布；之後的建置、上線都自動。注意，按發布這一步要你自己做。`],
  [UpdateTimeline, `48:30–51:00
剛才你改了一句、按發布，背後發生了這五步。時間是講師 2026-10-30 在 Forestry.md 實測的。
第一格：你在〈劉備〉補一句。紫色字寫「你動手」。
按一下：你按發布，外掛把這張卡送出去。這也是你動手。
按一下：綠色開始是自動的。Forestry 收到，它的發布紀錄（Publish history）多一筆。
按一下：Forestry 重新建置整個網站。
按一下：網址上的網頁更新，重新整理就看到。下面的括號：講師實測從按發布到上線，每次 22 到 24 秒，大約半分鐘。
最後一下：沒變的話，先等半分鐘再重新整理。很多人以為壞了，其實只是還在建置。`],
  [BuildStep, `51:00–54:00
「建置」這個詞剛才一直出現，這頁看它到底做了什麼。像照食譜做出一道菜：食譜是原始檔，菜是網頁。
左邊是 人物/劉備.md 的原始檔：開頭三行是屬性，內文有 [[關羽]]、[[張飛]] 兩個連結。
按一下：Forestry 照模板開始建置。Forestry 用的就是 Digital Garden 的網站模板。
按一下：做好的網頁。開頭三行不見了，標題變大，[[關羽]] 變成一個可以點的連結。
最後一下：[[連結]] 是在建置時才變成網址。記住這句，第四章講時間軸卡時會用到：有些地方的 [[ ]] 不會被轉換。`],
  [PublishFilter, `54:00–58:00
最後一個概念：誰決定哪些卡上網站？卡片開頭的 dg-publish。左上角的說明：打勾的方框，就是開頭寫了 dg-publish: true。
左邊是你的儲存庫，五張卡，三張打勾。中間像一個篩子，打勾的才放行。
按一下：網站上只出現打勾的三張。注意箭頭上的字：按發布才送出。勾 dg-publish 只是先選好卡，還要按發布，卡才會送出。很多同學勾完就去看網址，結果什麼都沒有，就是少了這一步。
按一下：沒勾的〈我的草稿〉〈上課筆記〉留在你的電腦，不會上傳。
最後一下：dg-publish 只負責選卡，按發布才會送出。反過來說，勾了又按了發布，就是全世界看得到，私人的東西不要勾。第四章會教怎麼勾、怎麼檢查。
來源：https://docs.forestry.md/getting-started/01-getting-started/`],
  [Section2, `22:00–22:30
第二章：讓 Obsidian 連上 Forestry。裝外掛、用 Garden Key 連線，關掉一個中文卡一定要關的開關，然後發布第一次。`],
  [Section3, `44:00–44:30
第三章：網站怎麼更新。先動手改一句、再發布一次，看到網站變了，再來看背後發生什麼。`],
  [ForestryAccount, `10:30–12:00
上週的課前作業：註冊 Forestry.md。它是 Digital Garden 外掛作者推出的代管服務，幫你把筆記建置成網站、給你一個網址。用它，就不用另外申請 GitHub、Vercel，也不用建 token。
這是講師 2026-10-30 的實際畫面。
按一下：1，打開 forestry.md，按 Sign up 註冊。
按一下：2，填 email 和密碼。
按一下：3，或者按最下面的 GitHub，用 GitHub 帳號登入，兩種都可以。
最後一下：還沒註冊的同學，現在就註冊，註冊完照下一頁種一座花園。`],
  [PlantGarden, `12:00–14:00
登入後的第一個畫面：Plant new garden，種一座花園。
按一下：1，Garden name，它會先幫你取一個名字，例如 green-elm，想換就自己改。
按一下：2，下面那行就是你的網址：名字.forestry.md。
按一下：3，按 Plant。講師實測種好花了 23 秒。
免費方案（講師帳號 2026-10-30 顯示）：一個網站、每月 30 次發布、100 MB 空間。上課和平常寫卡都夠用；每月 30 次是說按發布 30 次，所以改好幾張卡再一起發布，比較省。`],
  [GardenLive, `14:00–16:00
種好之後看到這個畫面：Your garden is live。
按一下：1，中間這行就是你的網址，點了就打開。現在打開，是模板的空網站，我們還沒有發布任何卡。
按一下：2，Copy address 複製網址，練習 4 要傳給同學。
按一下：3，下面是 Forestry 給的步驟清單，畫面裡看得到前兩步。第一步 Connect Obsidian，連上你的 Obsidian；第二步 Choose your home page，選首頁，連上之後外掛會直接問你。這兩步都在第二章做。清單再往下還有一步 Publish more notes，發布更多卡，第二章試發布一次，第四章再挑卡發布。
這張是講師連好、也發布過之後截的，所以前兩步已經打勾。你們現在看到的是還沒打勾的版本。`],
  [Practice1, `16:00–22:00
練習 1，6 分鐘：驗收課前作業，還沒做的人現場補。步驟在 prompts.md 練習 1：${PROMPTS_URL}
登入 Forestry，確認你有一座花園，打開你的網址。看得到網頁就過關。
還沒註冊、或還沒種花園的同學，現場照前兩頁做，註冊和 Plant 都在瀏覽器裡完成。
按一下：打得開，過關；打不開，舉手，助教過來。`],
  [InstallPlugin, `22:30–25:00
回到 Obsidian，裝 Digital Garden 外掛。這是講師的實際畫面，Obsidian 1.14.4。
按一下：1，設定 → 第三方外掛程式。第一次會看到受限模式，按右邊的「離開受限模式」。
按一下：2，社群外掛程式按「瀏覽」，搜尋 Digital Garden，認明作者是 oleeskild，名字相近的外掛不要裝錯。講師看到的版本是 2.103.0。
按一下：3，按安裝，裝好再按啟用。
外掛是裝在目前這個儲存庫，請確認你打開的是三國人物知識庫。官方說明：https://obsidian.md/help/community-plugins`],
  [ConnectForestry, `25:00–28:00
連線。左邊是 Obsidian 外掛的設定，右邊是 Forestry 儀表板。
按一下：1，設定 → 左下的 Digital Garden，Publish to 選 Forestry.md。預設是 GitHub，要自己改。
按一下：2，到 Forestry 儀表板右邊的 Garden Key，按 Reveal Garden Key，複製那串字。另一個做法：儀表板上的 Connect Obsidian 按鈕，會打開 Obsidian 幫你自動填好，外掛設定頁的說明也這樣寫。這條路講師沒有截圖，教室裡以 Garden Key 貼上為主。
按一下：3，回 Obsidian，把 Key 貼進 Garden Key 欄位，按 Connect。出現「Connected to 你的花園名稱」就連上了。
連上之後，外掛會請你選首頁。我們的〈三國演義〉開頭已經有 dg-home，選它就好。`],
  [KeySafety, `28:00–29:30
Garden Key 就像你網站的鑰匙。Forestry 自己的說明寫：有了這把 Key，任何人都能發布到你的網站，所以要收好。
中間是一把 Garden Key。
按一下：它只該放在一個地方，外掛設定的 Garden Key 欄位。
按一下：不要貼進筆記，筆記發布後會公開；不要出現在截圖、投影片；不要傳到 LINE 群組或 Email。
按一下：萬一外流，到 Forestry 儀表板按 Regenerate Garden Key，換一把新的，再貼進外掛。
最後一下：換一把新的，舊的就失效。`],
  [SlugFail, `29:30–31:00
這頁是講師準備課程時真的踩到的錯，你們也一定會遇到，所以先講。
左邊是講師的 Publish history，發布紀錄，最新的在最上面。最下面是種花園，接著連續兩次 Publish failed，失敗。
按一下：右邊看原因。外掛有一個設定叫 Simple note URLs，預設開著，會把卡片路徑轉成英文小寫的網址，例如 My Folder/My Note 變成 my-folder/my-note。可是中文字它轉不了，直接拿掉。講師用同一個轉換套件實測：人物/劉備、人物/關羽、關係/桃園結義，全部變成三條斜線。
按一下：每張卡的網址都一樣，網站不知道哪個網址給哪張卡，建置就失敗。錯誤訊息裡會出現 DuplicatePermalink，意思就是網址重複。
最後一下：卡名是中文，就要關掉 Simple note URLs。下一頁看在哪裡關。`],
  [SlugFix, `31:00–32:00
這個開關在外掛設定同一頁，往下捲到 Publishing。注意：要先連上 Forestry，這一段才會出現。
按一下：1，說明自己就寫了：note names use non-Latin characters，也就是卡名不是英文字母，就把它關掉。
按一下：2，把開關關掉，變成灰色。
按一下：3，再發布一次。講師關掉之後再發布，就變成 Published，網址是 /人物/劉備/ 這樣的中文網址，瀏覽器打得開。
最後一下：開著是三條斜線，關掉是正常的中文網址。這張外掛畫面是講師另開一個測試用的 Obsidian 截的，為了讓沒連線的外掛也顯示 Publishing 這一段，只在記憶體裡暫時改了連線判斷，沒有存任何設定。`],
  [Practice2, `33:30–44:00
練習 2，10 分鐘：把 Obsidian 連上 Forestry，發布第一次。步驟在 prompts.md 練習 2：${PROMPTS_URL}
五步，和 prompts.md 一樣：1 安裝外掛；2 設定 → Digital Garden，Publish to 選 Forestry.md；3 貼 Garden Key，按 Connect；4 往下把 Simple note URLs 關掉；5 按 Ctrl／Cmd + P，搜 garden publish，選 Publish All Notes Marked for Publish。
按一下：回 Forestry 看 Publish history，最上面那一筆變成 Published，再打開網址，首頁變成〈三國演義〉就成功了。出現 Failed，點右邊的箭頭展開看錯誤；看到 DuplicatePermalink，就是第 4 步的開關沒關。`],
  [EditAgain, `44:30–48:30
小練習，4 分鐘，也當作休息：改一句，再發布一次。步驟在 prompts.md 的〈小練習〉：${PROMPTS_URL}
1，打開〈三國演義〉，在最後加一句你自己的話，例如「這是我的三國筆記」。
2，Ctrl／Cmd + P，Publish All Notes Marked for Publish。
3，回 Forestry 儀表板看 Publish history，等最上面那一筆變成 Published。
4，重新整理你的網址，看那句有沒有出現。
按一下：看到新句子，就是網站更新了；沒變，先等半分鐘再重新整理。做完的同學起來走走、喝水，有問題這時候問。下一頁看剛才背後發生了什麼。`],
  [Section4, `58:00–58:30
第四章：挑卡發布。先讓第三堂的時間軸卡上線，再做一張導覽頁，讓讀者從首頁點得到每張卡。`],
  [PublishSwitch, `58:30–60:00
左邊是 Obsidian 屬性面板的實際畫面：dg-publish 旁邊有個勾選框，打勾就是要公開。
按一下：切換到原始碼模式看，就是檔案最上面三行：兩條 --- 中間夾著 dg-publish: true。這三行叫 frontmatter，也叫屬性。
最後一下：屬性面板打勾，等於原始檔寫 dg-publish: true。
另一個方法：打開那張卡，Ctrl／Cmd + P，執行 Digital Garden: Add publish flag，它會幫你加上這行。`],
  [FrontmatterCheck, `60:00–62:30
這是第三堂實測時發生的事。我們用 eli5 把 人物/劉備.md 改寫成 5 歲小孩聽得懂的版本，存成 劉備-5歲版.md。內容是對的。
按一下：但它把開頭的 dg-publish: true 也一起抄了過去。
按一下：結果是一發布，網站上會多一張〈劉備-5歲版〉，和原本的〈劉備〉並排，讀者會搞不清楚哪張才對。
按一下：如果有 dg-publish、又不想公開，就刪掉那行，或在屬性取消勾選。第三堂的 eli5 提示詞現在最後一句是「新檔不要加 dg-publish。」，所以你的5 歲版可能本來就沒有這行；講師實測那次是舊提示詞，才會抄過去。
按一下：反過來的情況也有。第三堂時間軸 Skill 實跑產出的 時間軸.md，開頭完全沒有屬性，直接就是一段 HTML。它不會被發布；練習 3-1 會幫它加上。
最後一下：新卡發布前，先看開頭三行。不想公開的卡刪掉 dg-publish，要公開的卡缺了就補上。`],
  [Practice31, `62:30–70:30
練習 3-1，8 分鐘：讓第三堂的時間軸卡上線。步驟在 prompts.md 練習 3-1：${PROMPTS_URL}
1，打開 整理/時間軸.md，先看開頭三行。第三堂的 Skill 產出的時間軸，開頭沒有屬性，直接就是一段 HTML。
2，沒有 dg-publish 的話，Ctrl／Cmd + P，執行 Add publish flag。
3，Ctrl／Cmd + P，Publish All Notes Marked for Publish，等 Publish history 變 Published。
4，打開你的網址，後面接 /整理/時間軸/。
按一下：看到橫向時間軸就過關；404 就是沒勾，或勾了還沒發布。下一頁看時間軸在網站上的樣子。
筆記庫裡沒有第三堂的 時間軸.md 或三張新卡的同學（第三堂沒做完）：講師的成品在線上 https://github.com/Chrouos/AI-workshop-slides/tree/main/examples/aw-03-sample-output ，練習3 資料夾的 時間軸.md 放進 整理/；三張卡在 aw-03-lab.zip 的 關係/ 資料夾（線上 examples/aw-03-lab/關係/），放進 關係/。拖檔案、不要拖整個資料夾。`],
  [HomeFlag, `73:00–74:30
網站打開的第一頁是哪一張？由 dg-home 決定。
左邊是〈三國演義〉的開頭：除了 dg-publish，還多一行 dg-home: true。講師的教材已經加好了。
按一下：打開網址，最後面是一個斜線，也就是網站的第一頁，顯示的就是〈三國演義〉。
最後一下：整個網站只放一張 dg-home。兩張都有的話，首頁會不確定是哪一張。`],
  [NavPage, `74:30–77:00
第一次來的讀者不知道從哪開始，所以做一張導覽頁。這也是整個網站的入口：時間軸只有事件名稱、沒有連結，人物、事件的連結都放在這裡。
左邊是 整理/知識庫導覽.md：開頭有 dg-publish: true，下面三個路標。時間連到 [[時間軸]]，人物連到每張人物卡，事件連到每張關係卡。導覽頁是一般的 Markdown 筆記，這些 [[連結]] 在網站上都點得開。下面那行橘色字：〈三英戰呂布〉先不放，留給練習 4 當新卡。導覽頁可以自己手打，也可以請 Codex 做，提示詞在 prompts.md 練習 3-2。
右上：再打開〈三國演義〉，在最後一行加 [[知識庫導覽]]。首頁連到導覽頁，讀者才點得到其他卡。
接著一項一項按，對清單：
按一下：導覽頁有 dg-publish: true。
按一下：首頁最後一行連到 [[知識庫導覽]]。
按一下：導覽頁連到的每張卡都要有 dg-publish。連到的卡不會自動一起發布，少勾一張，網站上那個連結就點不開。講師的 12 張範例卡本來就勾好了；沒勾的通常是第三堂新增的〈白門樓〉〈草船借箭〉、你第二堂自己寫的卡，時間軸在練習 3-1 已經勾好了。一張張打開太慢，練習 3-2 會請 Codex 只列清單，你再打開核對。不想公開的卡，就把它從導覽頁拿掉。
按一下：〈劉備-5歲版〉沒有公開，除非你本來就想公開它。
最後一下：人物、事件的連結，都放在導覽頁。`],
  [PublishCommand, `32:00–33:30
發布要用命令面板。按 Ctrl／Cmd + P，打 garden，就會列出 Digital Garden 的所有指令。這是講師的實際畫面，外掛 2.103.0。
按一下：1，第一行 Publish All Notes Marked for Publish，一次發布所有勾了 dg-publish 的卡。今天的練習都用它。
按一下：2，Add publish flag，幫你現在打開的這張卡加上 dg-publish。不用自己打那三行。
按一下：3，往下有 Publish Active Note，只發布打開的這一張，這張也要有 dg-publish。
最後一下：先 Add publish flag，再 Publish All。另外，Forestry 的儀表板會提到 Publication Center，是左邊工具列的小幼苗圖示，可以看哪些卡要發布；今天用命令面板就夠了。
來源：https://docs.forestry.md/getting-started/02-commands/`],
  [HtmlTest, `70:30–73:00
這是第三堂時間軸 Skill 跑出來的 時間軸.md，也就是講師第三堂練習 3 跑出來的那份：一段 HTML，畫成橫向時間軸，第 1 回到第 49 回共六件事，下面一段「來源卡」列出每件事出自哪張關係卡。講師 2026-10-30 把它放進自己的 Digital Garden 模板，在電腦上建置成網站，這是實際畫面。先說清楚：這是本機建置，還沒透過 Obsidian 外掛發布到線上驗證，等一下大家發布後請一起確認。
按一下：1，HTML 照常顯示。模板預設就允許筆記裡寫 HTML（markdown-it 的 html: true），所以第三堂讓 Skill 產出 HTML 沒有問題。這段時間軸只用到排版和顏色設定，沒有 script，網站上不需要另外跑程式。
按一下：2，網站的內文欄比較窄，一開始只看得到桃園結義、三英戰呂布、白門樓三件。用觸控板往右滑，或拖曳時間軸下方的捲軸，就會看到煮酒論英雄、草船借箭、赤壁之戰。發布後請大家實際滑一次，確認六件都在。
按一下：3，來源卡寫成純文字檔名，沒有做成連結，所以不會點到 404。第三堂第一次跑的時候，Skill 把來源卡寫成 <a href="../關係/桃園結義.md"> 這種連結；講師之前用舊版 Skill 排出的時間軸，在這個模板上點下去就是 404。所以第三堂在 SKILL.md 補了一條規則：來源卡只寫檔名純文字，不做連結。用舊版 Skill 產出的同學，重跑一次，或手動把那幾個 <a> 拿掉。`],
  [HtmlLinks, `（課後自讀，上課不講。）
時間軸是一段 HTML，想在裡面放連結，要知道這件事。回想第 ${pageOf(BuildStep)} 頁：[[連結]] 是建置時轉換的，但它只轉換一般的 Markdown 文字，HTML 區塊裡的 [[ ]] 不會被轉換。
第一種：在 HTML 裡寫 [[劉備]]。網站上會變成什麼樣子？
按一下：原樣顯示兩對中括號，點不了。這是講師另一張測試卡的本機建置結果。
按一下：第二種：寫成連到 .md 檔的 <a href="../關係/桃園結義.md">。
按一下：看起來像連結，能不能點開要看模板版本。講師之前用舊版 Skill 排出的時間軸，在當時的模板上點下去是 404；新版模板會試著換成網站網址，但卡片沒發布一樣 404。結果會因版本而不同，所以我們不靠它。
按一下：第三種：純文字，「第 1 回：關係/桃園結義」。
按一下：不能點，但正常顯示，不會 404。
最後一下：人名、來源卡用純文字；人物連結放在導覽頁。這就是今天網站的設計：時間軸用來看事件順序，可以點的連結都放在導覽頁。SKILL.md 裡的兩條規則：人名用純文字，不用 [[連結]]；來源卡只寫檔名純文字，不做連結。想讓讀者點得到來源卡，就在時間軸下面、HTML 區塊外，另外用一般的 [[桃園結義]] 列一行，那一行會正常轉換。`],
  [Practice32, `77:00–89:00
練習 3-2，12 分鐘：做導覽頁，讓讀者從首頁點得到每張卡。兩段提示詞都在 prompts.md 練習 3-2，在筆電上複製：${PROMPTS_URL}
1. 做導覽頁：在三國人物知識庫資料夾打開 Codex，貼上：
「請在 整理/ 新增 知識庫導覽.md。分成時間、人物、事件三段：時間那段只放 [[時間軸]]；人物那段用 [[連結]] 列出 人物/ 裡的每張卡；事件那段用 [[連結]] 列出 關係/ 裡的每張卡，但先不要放〈三英戰呂布〉，練習 4 再加。只連到已有的卡，不要新增卡片，也不要改別的檔案。開頭加上 dg-publish: true。寫入前先給我看。」
看過預覽：事件那段沒有三英戰呂布，也沒有筆記庫裡找不到的卡，再回「可以」。講師做的導覽頁放在線上，可以對照：https://github.com/Chrouos/AI-workshop-slides/blob/main/examples/aw-04-sample-output/%E7%9F%A5%E8%AD%98%E5%BA%AB%E5%B0%8E%E8%A6%BD.md
2. 打開〈三國演義〉，在最後一行加 [[知識庫導覽]]。
3. 找出還沒勾的卡。在同一個 Codex 貼上：
「列出 整理/知識庫導覽.md 連到的每張卡，每張一行，寫出它開頭有沒有 dg-publish: true。只列清單，不要修改任何檔案。」
拿清單去核對：打開標「沒有」的卡，看開頭三行，確定 Codex 沒看錯。要公開的，打開那張卡按 Ctrl／Cmd + P，執行 Digital Garden: Add publish flag；不想公開的，回導覽頁把那個連結刪掉。這一步要自己決定每張卡公不公開，跟第 ${pageOf(PublishFilter)} 頁的篩子是同一件事。
4. Ctrl／Cmd + P，執行 Publish All Notes Marked for Publish，等 Publish history 變 Published 再打開網址。
按一下：成功的樣子：從首頁點到知識庫導覽，再點到時間軸和每張卡，每一頁都打得開；導覽頁上每個連結都點得開，包括你剛補勾的卡。點了是 404，就是那張還沒勾、或勾了還沒發布。
講師實跑（2026-10-24，Codex 0.154.0，在範例筆記庫的副本上跑）：導覽頁的預覽確實沒放三英戰呂布，回「可以」才寫入；清單標出〈白門樓〉〈草船借箭〉沒有 dg-publish，其他都有，也沒改到任何檔案。每個人的清單會不一樣，例如第二堂自己寫的卡。
時間軸裡的人名是純文字、點不了，這是對的。如果時間軸裡出現 [[ ]]，或點了會 404 的來源卡連結，回第三堂的 SKILL.md 補規則，再產生一次。`],

  [Section5, `89:00–89:30
最後一章：先請同學驗收你的網站，再看 Git 和接下來可以做什麼。`],
  [CheckSite, `89:30–91:30
驗收的方法：從首頁依序點，每個連結都要打得開。路線和開場那頁一樣：首頁 → 導覽頁，再分兩條，一條到時間軸，一條到導覽頁上的卡。
按一下：首頁點得到導覽頁嗎？
按一下：導覽頁點得到時間軸嗎？打開時間軸，人名是純文字、點不了，這是對的，不是壞掉；要點人物，回導覽頁點。
按一下：最後一段故意示範打不開的情況：從導覽頁點〈白門樓〉打不開，網站給的是 404。〈白門樓〉是第三堂新增的卡，當時規定新卡不加 dg-publish，所以它還沒勾；也可能是勾了還沒發布。講師的 12 張範例卡本來就勾好了，打不開的多半是第三堂的新卡，或你第二堂自己寫的卡。連到的卡不會自動發布。
最後一下：補勾之後，再發布一次，等 Publish history 變成 Published（約半分鐘），再從首頁點一次。`],
  [Practice4, `91:30–103:30
練習 4，12 分鐘（多 2 分鐘給修好再走一次）：互相驗收。兩人一組。步驟在 prompts.md 練習 4。
1. 公開〈三英戰呂布〉：練習 3-2 故意沒把它放進導覽頁，它也還沒有 dg-publish。打開它，執行 Digital Garden: Add publish flag；在導覽頁的事件那段加上 [[三英戰呂布]]；再執行 Publish All Notes Marked for Publish。
按一下：2. 找網址：打開 Forestry 儀表板，最上面「Your garden is live」下面那行就是你的網址，按 Copy address 複製。傳之前，自己先開無痕視窗（Chrome、Edge：Ctrl＋Shift＋N；Mac：Cmd＋Shift＋N）貼上，從首頁點到〈三英戰呂布〉。再把網址傳給同學，用 LINE 或寫在紙上都可以。
按一下：3. 同學在自己的電腦開無痕視窗，貼上你的網址。一定要看同學自己打開的公開網址，不要看講師的螢幕，也不要用你自己的電腦，你的瀏覽器可能留著舊的畫面。只能從首頁開始點：首頁 → 導覽頁 → 三英戰呂布，不能直接打卡片的網址。
按一下：4. 回報結果：找到新卡就打勾；找不到，說哪一頁打不開、看到什麼（404、連結不見）。你回去查那一頁的 dg-publish 和連結，修好再發布，請同學再點一次。
做完交換角色。最後請一兩組分享在哪一頁打不開，通常是三英戰呂布沒勾（404）、導覽頁改了沒重新發布（連結不在），或改了沒等 Published 就去看。`],
  [NotUpdated, `103:30–106:00
大家剛才最常遇到的：發布了，網站卻沒變。照順序查四個地方，右邊的畫面都是示意，實際畫面依版本略有不同。
1. 有沒有按發布？勾了 dg-publish 不會自己送出。Obsidian 按 Ctrl／Cmd + P，搜尋 garden publish。
按一下：2. Forestry 收到了嗎？打開 Forestry 儀表板，看 Publish history 最上面那一筆的時間。和剛才按發布的時間相符，就代表 Forestry 已收到；沒有新的一筆，回到第 1 步，或到外掛設定看是不是還顯示 Connected。
按一下：3. 那一筆的狀態。Building 是建置中，講師實測大約半分鐘，再等；Published 是完成；Failed 是失敗，點右邊的箭頭展開看錯誤訊息，拍給助教。中文卡最常見的失敗，是外掛的 Simple note URLs 沒關（第 ${pageOf(SlugFix)} 頁），錯誤訊息裡會出現 DuplicatePermalink。
按一下：4. 前面都對，網站還是舊的？瀏覽器可能留著舊頁面。按 Ctrl／Cmd + Shift + R 強制重新整理，或開無痕視窗看。
最後一下：從第 1 步往下查，不要跳步。`],
  [CourseRecap, `106:00–109:00
四堂課走一圈。上面是四個成果：大綱、筆記庫、時間軸、網站。
按一下：RAG 這條線。第一堂知道 Web Search 就是 RAG；第二堂在自己的筆記庫查資料、附出處；第三堂的時間軸只照卡片上寫的回目和年份排，沒寫的不補；今天網站上每張卡都有出處。
按一下：Obsidian 這條線。第一堂只預告；第二堂安裝、連結、畫關係圖；第三堂用卡片上的回目排出時間軸；今天用 Digital Garden 發布。
按一下：Skills 這條線。第一堂預告 AGENTS.md；第三堂安裝熱門 Skill、自己寫一個；今天把 Skill 的產出放上網站。
最後一下：四堂課都在擴充同一個三國知識庫，每一堂都用上一堂的成果。`],
  [NextSteps, `111:30–114:00
最後是選修延伸，給想多做一點的人。llm-wiki 是一組整理筆記庫的 Skill，放在發布之前用：
$wiki-ingest：收新資料，整理成卡片，對應循環的第一步。
按一下：$wiki-query：查答案，附出處，就是第二堂的 RAG，對應第二步。
按一下：$wiki-lint：健檢，找斷掉的連結、孤立頁、缺屬性的頁。它找到的斷連結，就是同學在網站上點不開的地方。
安裝（需要 Python 3）：pip install obsidian-wiki，再 obsidian-wiki setup --vault <筆記庫完整路徑>，最後 obsidian-wiki doctor 檢查。裝好後在 Codex 打開筆記庫，說「set up my wiki」。
完整說明：https://github.com/Ar9av/obsidian-wiki/blob/main/docs/installation.md 、https://github.com/Ar9av/obsidian-wiki/blob/main/docs/skills.md
按一下：整理、查證、健檢完，再按發布。後面兩頁是參考資料，再後面是附錄，課後有興趣再看。最後幾分鐘留給大家發問。謝謝大家這四堂課。`],
  [AppendixIndex, `（課後自讀，上課不講。）
附錄三頁，給想多懂一點的同學：時間軸要自己改 HTML 時，哪種連結寫法點得開；打一個網址，網頁從哪來；工程師說的自動部署是什麼。`],
  [ReferencesGarden, `（課後自讀，上課不講。）
今天用到的 Digital Garden、Obsidian 文件，按主題排。
Digital Garden：
- Digital Garden 文件 Getting Started（dg-publish、dg-home）. https://docs.forestry.md/getting-started/01-getting-started/
- Digital Garden 文件 Commands（Publish Active Note、Publish All Notes Marked for Publish）. https://docs.forestry.md/getting-started/02-commands/
- Forestry.md（代管 Digital Garden：Plant、Garden Key、Publish history）. https://forestry.md
- obsidian-digital-garden 外掛 README. https://github.com/oleeskild/obsidian-digital-garden
- digitalgarden 網站模板（Eleventy 建置，markdown-it 設 html: true）. https://github.com/oleeskild/digitalgarden
Obsidian、Markdown：
- Obsidian Help：Community plugins. https://obsidian.md/help/community-plugins
- Obsidian Help：Properties. https://obsidian.md/help/properties
- Obsidian Help：Internal links. https://obsidian.md/help/links
- CommonMark Spec 0.31.2：HTML blocks（HTML 區塊原樣輸出，裡面的 [[ ]] 不會轉換）. https://spec.commonmark.org/0.31.2/#html-blocks
- markdown-it. https://github.com/markdown-it/markdown-it`],
  [ReferencesDeploy, `（課後自讀，上課不講。）
網站、CI/CD、建置：
- MDN Web Docs：How the web works. https://developer.mozilla.org/en-US/docs/Learn_web_development/Getting_started/Web_standards/How_the_web_works
- Fowler 2024, Continuous Integration. https://martinfowler.com/articles/continuousIntegration.html
- Eleventy 文件. https://www.11ty.dev/docs/
Digital Garden 外掛設定：
- obsidian-digital-garden 2.103.0 設定 Simple note URLs：說明寫「note names use non-Latin characters 就關掉」。https://github.com/oleeskild/obsidian-digital-garden
- 想自己架（GitHub＋Vercel，要申請 token）：Digital Garden 入門 https://docs.forestry.md/getting-started/01-getting-started/`],
  [Closing, `109:00–111:30
課程結束後，知識庫怎麼繼續擴充？給大家一個每週做一次的小循環，四步都是這四堂學過的。
第一步：新增一張卡。用第一堂的 Codex，或第三堂的 Skill，照原文寫一張新的人物或事件卡。
按一下：第二步：核對出處。第二堂的 RAG：每一句都要找得到原文，找不到就刪。
按一下：第三步：勾 dg-publish、按發布，也把它加進導覽頁。第四堂今天做的。
按一下：第四步：把網址傳給一個人看，請他從首頁點到這張卡，就像今天的練習 4。然後下週再來一輪。
最後一下：每週一輪，網站每週多一張有出處的卡。`],
]);

export const notes: (string | undefined)[] = deck.map(page => NOTES.get(page));

export default deck satisfies Page[];
