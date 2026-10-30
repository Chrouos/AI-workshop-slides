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
import forestryPublishBuilding from './assets/forestry-publish-building.png';
import forestryPluginSlugify from './assets/forestry-plugin-slugify.png';
import dgPaletteForestry from './assets/dg-command-palette-forestry.png';
import dgProperty from './assets/dg-publish-property.png';
import timelineSite from './assets/timeline-on-site.png';
import siteHome from './assets/site-home.png';
import siteGuide from './assets/site-guide.png';
import siteStory from './assets/site-story.png';
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

// Lesson 4's steps, prompts and URLs live outside the vault, in the lab folder.
const FINAL_URL = 'https://github.com/Chrouos/AI-workshop-slides/tree/main/examples/final';
const PROMPTS_URL = 'https://github.com/Chrouos/AI-workshop-slides/blob/main/examples/aw-04-lab/prompts.md';
const LAB_URL = 'https://github.com/Chrouos/AI-workshop-slides/blob/main/examples/aw-04-lab/README.md';
const LAB_ZIP_URL = 'https://raw.githubusercontent.com/Chrouos/AI-workshop-slides/main/examples/aw-04-lab.zip';

// Top-right link to the lesson's step handbook (prompts.md): shown once on the agenda,
// and again only on the practice that has prompts to copy.
const PromptsCopy = ({ lead, section }: { lead: string; section: string }) => (
  <>
  <a href={PROMPTS_URL} target="_blank" rel="noreferrer" style={{ position: 'absolute', top: 176, right: 144, display: 'flex', alignItems: 'center', gap: 18, color: muted, textDecoration: 'none' }}>
    <span style={{ textAlign: 'right', fontSize: 24, lineHeight: 1.4 }}>{lead}<br /><strong style={{ color: amber, fontFamily: mono }}>prompts.md</strong> {section}</span>
    <img src={promptsQr} alt="步驟手冊 prompts.md 的 QR code" style={{ width: 120, height: 120, display: 'block', background: '#FFFFFF', border: `1px solid ${rule}`, padding: 5 }} />
  </a>
    <FooterUrl href={PROMPTS_URL} />
  </>
);

// The four chapters of the lesson, in the order you meet them. Pages inside a chapter show where we are.
const CHAPTERS = ['開一座花園', '連上 Obsidian', '挑卡發布', '更新與檢查'];
type Chapter = 1 | 2 | 3 | 4;

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
  <div style={{ fontSize: 24, lineHeight: 1.4, color: quiet, marginTop: 12 }}>{children}</div>
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
const SvgNum = ({ x, y, n, color = amber }: { x: number; y: number; n: number; color?: string }) => (
  <g><circle cx={x} cy={y} r="22" fill={color} /><text x={x} y={y + 9} textAnchor="middle" fontSize="25" fontWeight="600" fill="#FFFFFF">{n}</text></g>
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
          <Layer h={390} label="第一堂大綱、第二堂知識庫、第三堂時間軸">
            <InG i={0}><LessonStop x={204} n={1} kind="doc" name="大綱" file="三國演義大綱.md" /></InG>
            <InG i={1}><MapArrow x1={300} x2={516} y={110} /></InG>
            <InG i={2}><LessonStop x={612} n={2} kind="folder" name="知識庫" file="三國人物知識庫/" /></InG>
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

// The finished example site, before anything is explained: three real pages, left to right
// in the order a reader clicks them.
// One live page of the example site, large; each click lays the next one over it and adds its row on the right.
const SITE_W = 1040;
const LiveShot = ({ n, src, title, detail, alt }: { n: number; src: string; title: string; detail: string; alt: string }) => (
  <>
    <div style={{ position: 'absolute', left: 0, top: 0 }}>
      <Screenshot src={src} aspect={1040 / 650} width={SITE_W} alt={alt} />
    </div>
    <div style={{ position: 'absolute', left: SITE_W + 56, top: (n - 1) * 150, right: 0, display: 'flex', gap: 20, alignItems: 'flex-start' }}>
      <NumDot n={n} />
      <div>
        <div style={{ fontSize: 32, fontWeight: 600, lineHeight: 1.3 }}>{title}</div>
        <div style={{ fontSize: 26, color: muted, lineHeight: 1.4, marginTop: 6 }}>{detail}</div>
      </div>
    </div>
  </>
);

const FinalSite: Page = () => (
  <Shell source={'範例網站 glowing-clearing.forestry.md；知識庫 examples/final（GitHub）'}>
    <Eyebrow>範例網站｜實際畫面</Eyebrow>
    <Heading>四堂課的筆記，發布成網站</Heading>
    <Fit>
      <div style={{ position: 'relative', height: Math.round(SITE_W / (1040 / 650)) }}>
        <LiveShot n={1} src={siteHome} title="首頁〈三國演義〉" detail="打開網址看到的第一頁" alt="範例網站首頁〈三國演義〉：亂世開場、各自的路兩個小標題，人名和事件都是可以點的連結" />
        <Steps>
          <Step duration={STEP_MS}><LiveShot n={2} src={siteGuide} title="導覽頁" detail="從這裡點到時間軸、人物、事件" alt="範例網站的知識庫導覽：一段說明、一行引用框，時間段連到時間軸和劉備的故事線，人物段列出劉備、關羽、張飛等連結" /></Step>
          <Step duration={STEP_MS}><LiveShot n={3} src={siteStory} title="〈劉備的故事線〉" detail="劉備一路遇到誰、經歷什麼" alt="範例網站的〈劉備的故事線〉：劉備走過的各站由上往下排，每一站中間是事件，左邊是同伴，右邊是對手，名字依關係上色" /></Step>
          <Step duration={STEP_MS}><div style={{ position: 'absolute', left: SITE_W + 56, right: 0, top: 470, fontFamily: display, fontSize: 40, lineHeight: 1.35, color: amber }}>從首頁點得到每一張卡</div></Step>
        </Steps>
      </div>
    </Fit>
    <FooterUrl href={FINAL_URL} />
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
    <Eyebrow>AGENDA｜120 分鐘，含五個練習</Eyebrow>
    <Heading>課程大綱</Heading>
    <PromptsCopy lead="今天的步驟手冊" section="先在筆電打開" />
    <Fit>
      <div style={{ display: 'grid', gridTemplateColumns: AGENDA_COLS, paddingBottom: 12, borderBottom: `1px solid ${rule}` }}>
        <span /><SmallLabel>章節</SmallLabel><span style={{ textAlign: 'right' }}><SmallLabel>時間｜頁</SmallLabel></span>
      </div>
      <AgendaRow i={0} n={1} time="8–20 分" page={Section1} />
      <AgendaRow i={1} n={2} time="20–50 分" page={Section2} />
      <AgendaRow i={2} n={3} time="50–83 分" page={Section3} />
      <AgendaRow i={3} n={4} time="83–120 分" page={Section4} />
    </Fit>
  </Shell>
);

// The lesson's route on a chapter's opening page: four stops, this one in amber.
const TRACK_XS = [130, 594, 1058, 1522];

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
            <InG i={1}><SvgNum x={24} y={385} n={1} /><text x="60" y="395" fontSize="30" fontWeight="600" fill={ink}>用戶端：你的瀏覽器</text></InG>
          </Layer>
          <Step duration={STEP_MS}><Layer h={420} label="網址指向伺服器，一台一直開著的電腦，它找到〈劉備〉這個檔案">
            <MapArrow x1={484} x2={584} y={170} hot draw />
            <text x="534" y="150" textAnchor="middle" fontSize="24" fill={amber}>要這頁</text>
            <Build>
              <rect x="600" y="20" width="440" height="300" fill={surface} stroke={faint} strokeWidth="2" />
              <SvgIcon kind="server" x={648} y={72} size={56} color={muted} />
              <text x="692" y="82" fontSize="28" fill={ink}>伺服器：一直開著的電腦</text>
              <DocShape x={630} y={130} w={110} h={150} />
              <text x="685" y="222" textAnchor="middle" fontSize="28" fill={muted}>首頁</text>
              <DocShape x={765} y={130} w={110} h={150} fill={amberSoft} stroke={amber} sw={3} />
              <text x="820" y="222" textAnchor="middle" fontSize="28" fontWeight="600" fill={ink}>劉備</text>
              <DocShape x={900} y={130} w={110} h={150} />
              <text x="955" y="222" textAnchor="middle" fontSize="28" fill={muted}>曹操</text>
            </Build>
            <Build i={1}><SvgNum x={624} y={385} n={2} /><text x="660" y="395" fontSize="30" fontWeight="600" fill={ink}>伺服器找到檔案</text></Build>
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
            <Build i={1}><SvgNum x={1186} y={385} n={3} /><text x="1222" y="395" fontSize="30" fontWeight="600" fill={ink}>用戶端畫成網頁</text></Build>
          </Layer></Step>
        </Steps>
      </Stage>
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={32}>今天做的網站，就是放在別台電腦上的檔案</Takeaway></Step></Steps>
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
    <Lead>CI 自動檢查、建置；CD 自動上線</Lead>
    <Fit>
      <Stage h={470}>
        <Steps>
          <Layer h={470} label="沒有自動部署時：改好檔案後，每次都要自己上傳、自己重做網頁">
            <InG i={0}><text x="0" y="30" fontSize="28" fontWeight="600" fill={warn}>沒有自動部署時：每次自己上傳、自己重做網頁</text></InG>
            <InG i={1}><LaneBox x={0} y={50} kind="doc" label="改好檔案" tone="plain" /></InG>
            <InG i={2}><MapArrow x1={338} x2={426} y={110} /><LaneBox x={434} y={50} kind="user" label="自己上傳" tone="hand" /></InG>
            <InG i={3}><MapArrow x1={772} x2={860} y={110} /><LaneBox x={868} y={50} kind="user" label="自己重做網頁" tone="hand" /></InG>
            <InG i={4}><MapArrow x1={1206} x2={1294} y={110} /><LaneBox x={1302} y={50} kind="globe" label="上線" tone="plain" /></InG>
          </Layer>
          <Step duration={STEP_MS}><Layer h={470} label="CI/CD：你按發布送到 Forestry，之後檢查、建置和上線都自動跑">
            <text x="0" y="270" fontSize="28" fontWeight="600" fill={amber}>CI/CD：你只按發布，檢查、建置、上線自動完成</text>
            <Build><LaneBox x={0} y={290} kind="doc" label="改好檔案" tone="plain" /></Build>
            <Build i={1}><MapArrow x1={338} x2={426} y={350} hot /><LaneBox x={434} y={290} kind="mail" label="按發布" tone="you" /><text x="599" y="446" textAnchor="middle" fontSize="25" fontWeight="600" fill={link}>手動：送到 Forestry</text></Build>
            <Build i={2}><MapArrow x1={772} x2={860} y={350} hot /><LaneBox x={868} y={290} kind="gear" label="檢查、建置" tone="auto" /></Build>
            <Build i={3}><MapArrow x1={1206} x2={1294} y={350} hot /><LaneBox x={1302} y={290} kind="globe" label="自動上線" tone="auto" /></Build>
            <Build i={4}><path d="M868 418 V428 H1632 V418" fill="none" stroke={okGreen} strokeWidth="3" /><text x="1250" y="458" textAnchor="middle" fontSize="25" fontWeight="600" fill={okGreen}>Forestry 收到後，自動跑</text></Build>
          </Layer></Step>
        </Steps>
      </Stage>
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={28}>你按發布之後，檢查、建置、上線都會自動完成</Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

const BuildStep: Page = () => (
  <Shell chapter={2} source={'Digital Garden 模板 github.com/oleeskild/digitalgarden（Forestry.md 也用它建置）；Eleventy 文件 11ty.dev/docs'}>
    <Eyebrow>Building 在做什麼</Eyebrow>
    <Heading>建置（Build）</Heading>
    <Lead>把筆記做成瀏覽器能看的網頁</Lead>
    <Fit>
      <Stage h={430}>
        <Steps>
          <Layer h={430} label="原始檔 人物/劉備.md：開頭是屬性，內文有 [[關羽]]、[[張飛]] 兩個連結">
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
          <Step duration={STEP_MS}><Layer h={430} label="Forestry 建置：你按發布後，它自動照模板把原始檔做成網頁">
            <Build>
              <SvgIcon kind="gear" x={810} y={150} size={110} color={amber} />
              <text x="810" y="258" textAnchor="middle" fontSize="31" fontWeight="600" fill={ink}>Forestry 建置</text>
            </Build>
            <MapArrow x1={640} x2={980} y={310} hot draw />
            <Build i={1}><text x="810" y="362" textAnchor="middle" fontSize="26" fill={muted}>你按發布，這步自動跑</text></Build>
          </Layer></Step>
          <Step duration={STEP_MS}><Layer h={430} label="做好的網頁：屬性不顯示，[[關羽]]、[[張飛]] 變成可以點的連結">
            <Build>
              <BrowserFrame x={1000} y={0} w={632} h={420} url="…/人物/劉備/" />
              <text x="1036" y="140" fontSize="48" fontWeight="600" fill={ink}>劉備</text>
              <text x="1036" y="236" fontSize="34" fill={ink}>第 1 回和 <tspan fill={link} textDecoration="underline">關羽</tspan>、</text>
              <text x="1036" y="292" fontSize="34" fill={ink}><tspan fill={link} textDecoration="underline">張飛</tspan> 桃園結義。</text>
            </Build>
            <Build i={1}><text x="1036" y="384" fontSize="25" fill={quiet}>屬性不會顯示在網頁上</text></Build>
          </Layer></Step>
        </Steps>
      </Stage>
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={36}>[[連結]] 是在建置時才變成網址</Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

// ---------- 02 建立網站 ----------

const Section2: Page = () => <SectionPage chapter={2} label="02 / 連接" lead="裝外掛、連上 Forestry，發布第一次" />;

// An outline over the picture that marks the spot a checklist line talks about. It is
// positioned against the nearest `position: relative` box around the <Steps>.
// With `n`, a numbered badge sits just right of the outline, matching the same number on the checklist line.
const SPOT_COLOR = '#E9B650';
const SpotNum = ({ n, style }: { n?: number; style?: CSSProperties }) => (
  <span style={{ width: 44, height: 44, borderRadius: 22, flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: n ? SPOT_COLOR : 'transparent', color: ink, fontSize: 26, fontWeight: 600, ...style }}>{n}</span>
);
// `inside` tucks the number into the outline's top-right corner, for an outline that ends at a picture's edge.
const Spot = ({ box, n, inside = false }: { box: [number, number, number, number]; n?: number; inside?: boolean }) => (
  <>
    <div style={{ position: 'absolute', left: box[0], top: box[1], width: box[2], height: box[3], border: `4px solid ${SPOT_COLOR}`, boxSizing: 'border-box' }} />
    {n ? <SpotNum n={n} style={{ position: 'absolute', left: inside ? box[0] + box[2] - 54 : box[0] + box[2] + 6, top: inside ? box[1] + 10 : box[1] + box[3] / 2 - 22 }} /> : null}
  </>
);

// One step of the catch-up route for students without an account yet.
const CatchChip = ({ children }: { children: ReactNode }) => (
  <span style={{ background: amberSoft, border: `2px solid ${amber}`, padding: '8px 18px' }}>{children}</span>
);

const ForestryAccount: Page = () => (
  <Shell chapter={1} source={'Forestry.md forestry.md（實際畫面）'}>
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
          <CatchChip>下一頁：種一座花園</CatchChip>
        </div>
      </Step></Steps>
    </Fit>
  </Shell>
);

const PlantGarden: Page = () => (
  <Shell chapter={1} source={'Forestry.md 儀表板（實際畫面）'}>
    <Eyebrow>登入後第一個畫面｜實際畫面</Eyebrow>
    <Heading>種一座花園（Plant）</Heading>
    <Fit>
      <div style={{ position: 'relative', width: 1000, margin: '0 auto' }}>
        <In i={0}><Screenshot src={forestryPlant} aspect={1202 / 542} width={1000} alt="Plant new garden：Garden name 欄位填著 green-elm，下面顯示 green-elm.forestry.md，最下面是 Plant 按鈕" /></In>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 36, marginTop: 36 }}>
          <Steps>
            <Step duration={STEP_MS}><TourStep n={1} title="取名字" detail="Forestry 先給一個，可以改" box={[48, 142, 680, 66]} at={[22, 175]} /></Step>
            <Step duration={STEP_MS}><TourStep n={2} title="這就是網址" detail="名字.forestry.md" box={[48, 212, 330, 36]} badge="right" /></Step>
            <Step duration={STEP_MS}><TourStep n={3} title="按 Plant" detail="大約半分鐘種好" box={[48, 334, 752, 66]} /></Step>
          </Steps>
        </div>
      </div>
    </Fit>
  </Shell>
);

const GardenLive: Page = () => (
  <Shell chapter={1} source={'Forestry.md 儀表板（實際畫面）'}>
    <Eyebrow>種好之後｜實際畫面</Eyebrow>
    <Heading>網站上線：Your garden is live</Heading>
    <Fit>
      <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: '880px 1fr', gap: 80, alignItems: 'start' }}>
        <In i={0}><Screenshot src={forestryGardenLive} aspect={2014 / 1250} width={880} alt="Forestry 儀表板：Your garden is live，網址 glowing-clearing.forestry.md，Copy address 按鈕；下面是 Connect Obsidian、Choose your home page 兩個步驟" /></In>
        <div style={{ display: 'grid', gap: 44, paddingTop: 30 }}>
          <Steps>
            <Step duration={STEP_MS}><TourStep n={1} title="你的網址" detail="點一下就能打開" box={[300, 164, 284, 38]} at={[616, 183]} /></Step>
            <Step duration={STEP_MS}><TourStep n={2} title="Copy address" detail="複製網址，下一頁練習 1 就用到" box={[386, 198, 108, 34]} at={[526, 215]} /></Step>
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
            <div style={{ background: warnSoft, padding: '16px 30px' }}><StatusLine ok={false} size={32}>打不開：按 Copy address 再貼</StatusLine></div>
          </div>
        </Step>
      </Steps>
    </Fit>
  </Shell>
);

// ---------- 03 連接 Obsidian ----------

const Section3: Page = () => <SectionPage chapter={3} label="03 / 挑卡" lead="決定哪些卡公開，讓時間軸和導覽頁上線" />;

const InstallPlugin: Page = () => (
  <Shell chapter={2} source={'Obsidian 說明：社群外掛 obsidian.md/help/community-plugins'}>
    <Eyebrow>Obsidian 設定｜實際畫面</Eyebrow>
    <Heading>安裝 Digital Garden 外掛</Heading>
    <Fit>
      <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: '880px 1fr', gap: 64, alignItems: 'start' }}>
        <In i={0}><Screenshot src={obsidianRestricted} aspect={1784 / 880} width={880} alt="Obsidian 設定，左邊選第三方外掛程式，右邊有「離開受限模式」按鈕" /></In>
        <In i={1}><Screenshot src={dgPluginInstall} aspect={840 / 490} width={600} alt="社群外掛的 Digital Garden 頁：版本 2.103.0、作者 oleeskild、安裝按鈕" /></In>
        <div style={{ gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 36, marginTop: 8 }}>
          <Steps>
            <Step duration={STEP_MS}><TourStep n={1} title="第三方外掛程式" detail="按「離開受限模式」，才能裝外掛" box={[730, 300, 124, 44]} /></Step>
            <Step duration={STEP_MS}><TourStep n={2} title="瀏覽 → 搜 Digital Garden" detail="認明作者是 oleeskild" box={[944, 0, 600, 178]} /></Step>
            <Step duration={STEP_MS}><TourStep n={3} title="安裝 → 啟用" detail="裝好後按「啟用」" box={[962, 280, 84, 46]} at={[938, 303]} /></Step>
          </Steps>
        </div>
      </div>
    </Fit>
  </Shell>
);

const ConnectForestry: Page = () => (
  <Shell chapter={2} source={'Digital Garden 外掛設定；Forestry.md 儀表板（實際畫面）'}>
    <Eyebrow>設定 → Digital Garden｜實際畫面</Eyebrow>
    <Heading>用 Garden Key 連上 Forestry</Heading>
    <Fit>
      <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: '1000px 1fr', gap: 60, alignItems: 'start' }}>
        <In i={0}><Screenshot src={forestryPluginConnect} aspect={1850 / 790} width={1000} caption="Obsidian：外掛設定，還沒連線" alt="Digital Garden 外掛設定：Publish to 選 Forestry.md，下面 Garden Key 欄位是空的，旁邊有 Connect 按鈕" /></In>
        <In i={1}><Screenshot src={forestryGardenKey} aspect={806 / 577} width={520} caption="Forestry 儀表板：Garden Key" alt="Forestry 儀表板的 Garden Key 卡片，金鑰遮住，下面有 Reveal Garden Key 和 Regenerate Garden Key" /></In>
        <div style={{ gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 36, marginTop: 8 }}>
          <Steps>
            <Step duration={STEP_MS}><TourStep n={1} title="Publish to 選 Forestry.md" box={[810, 76, 166, 44]} /></Step>
            <Step duration={STEP_MS}><TourStep n={2} title="Reveal Garden Key，複製" detail="外掛靠它找到你的花園" box={[1074, 244, 476, 44]} /></Step>
            <Step duration={STEP_MS}><TourStep n={3} title="貼上，按 Connect" detail="連上後，首頁選〈三國演義〉" box={[462, 226, 516, 58]} /></Step>
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
  <Shell chapter={2} source={'Forestry.md 儀表板 Garden Key 說明'}>
    <Eyebrow>Garden Key 的保管</Eyebrow>
    <Heading>Garden Key 就像密碼</Heading>
    <Lead>拿到 Key 的人，都能發布到你的網站</Lead>
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
              <text x="516" y="414" fontSize="28" fill={ink}>外流了：到 Forestry 按 Regenerate Garden Key</text>
            </Build>
          </Layer></Step>
        </Steps>
      </Stage>
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={32}>舊 Key 失效，把新 Key 貼回外掛設定</Takeaway></Step></Steps>
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
  <Shell chapter={2} source={'Forestry.md Publish history；@sindresorhus/slugify'}>
    <Eyebrow>Failed 的原因｜實際畫面</Eyebrow>
    <Heading>卡名是中文，網址撞在一起</Heading>
    <Fit>
      <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: '640px 1fr', gap: 80, alignItems: 'start' }}>
        <div style={{ position: 'relative' }}>
          <In i={0}><Screenshot src={forestryPublishHistory} aspect={1197 / 782} width={640} caption="第一次發布：連續失敗兩次" alt="Forestry 的 Publish history：最下面 Garden planted，接著兩筆 Publish failed，最上面一筆 Notes published" /></In>
          <Steps><Step duration={STEP_MS}><div className="aw4-still"><Spot box={[4, 178, 632, 162]} /></div></Step></Steps>
        </div>
        <div>
          <Stage w={600} h={360}>
            <Steps>
              <Step duration={STEP_MS}><Layer w={600} h={360} label="三張卡的路徑：人物/劉備、人物/關羽、關係/桃園結義，網址全都變成三條斜線">
                <Build><text x="0" y="28" fontSize="26" fontWeight="600" fill={muted}>卡片路徑　Simple note URLs 開著時的網址</text></Build>
                <Build i={1}><SlugRow y={60} path="人物/劉備" /></Build>
                <Build i={2}><SlugRow y={140} path="人物/關羽" /></Build>
                <Build i={3}><SlugRow y={220} path="關係/桃園結義" /></Build>
              </Layer></Step>
              <Step duration={STEP_MS}><Layer w={600} h={360} label="中文字被拿掉，每張卡的網址重複，網站建置失敗">
                <Build><text x="0" y="340" fontSize="26" fontWeight="600" fill={warn}>網址重複（DuplicatePermalink）→ 建置失敗</text></Build>
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
  <Shell chapter={2} source={'Digital Garden 外掛設定 Simple note URLs'}>
    <Eyebrow>設定 → 第三方外掛 → Digital Garden → Publishing</Eyebrow>
    <Heading>關掉 Simple note URLs</Heading>
    <Fit>
      <div style={{ position: 'relative', width: 1200, margin: '0 auto' }}>
        <In i={0}><Screenshot src={forestryPluginSlugify} aspect={1850 / 386} width={1200} caption="連上 Forestry 之後，同一頁往下捲才看得到 Publishing" alt="Digital Garden 外掛設定的 Publishing 區：Simple note URLs，說明寫 Turn this off if your note names use non-Latin characters，開關是開著的" /></In>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 36, marginTop: 40 }}>
          <Steps>
            <Step duration={STEP_MS}><TourStep n={1} title="說明裡就有寫" detail="non-Latin＝不是英文字母" box={[22, 116, 1000, 96]} /></Step>
            <Step duration={STEP_MS}><TourStep n={2} title="把開關關掉" detail="截圖裡是開著的（紫色）" box={[1078, 112, 92, 52]} badge="right" /></Step>
            <Step duration={STEP_MS}><Callout n={3} title="再發布一次" detail="等 Published，打開網址：首頁是〈三國演義〉" /></Step>
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
    <PracticeEyebrow time="13 分鐘">練習 2｜連上並發布</PracticeEyebrow>
    <Heading>練習（連接）：連上並發布第一次</Heading>
    <PillRow>
      <Pill tag="定位">今天的知識庫</Pill>
      <Pill tag="期望輸出">首頁是三國演義</Pill>
      <Pill tag="限制">Garden Key 不外流</Pill>
    </PillRow>
    <Fit>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', gap: 6 }}>
        <FlowStep i={1} n={1} w={220} kind="plug" label="裝外掛、連線" sub="Garden Key" />
        <FlowArrow i={2} />
        <FlowStep i={3} n={2} w={220} kind="doc" label="看屬性" sub="〈三國演義〉" />
        <FlowArrow i={4} />
        <FlowStep i={5} n={3} w={220} kind="upload" label="Publish All" sub="Ctrl／Cmd + P" />
        <FlowArrow i={6} />
        <FlowStep i={7} n={4} w={220} kind="clock" label="看狀態" sub="Publish history" />
        <FlowArrow i={8} />
        <FlowStep i={9} n={5} w={220} kind="gear" label="關開關" sub="Simple note URLs" />
        <FlowArrow i={10} />
        <FlowStep i={11} n={6} w={220} kind="globe" label="再發布" sub="打開網址" />
      </div>
      <Steps>
        <Step duration={STEP_MS}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 40, marginTop: 40 }}>
            <div style={{ background: warnSoft, padding: '14px 30px' }}><StatusLine ok={false} size={30}>第一次 Failed 是正常的：做第 5 步</StatusLine></div>
            <div style={{ background: surface, padding: '14px 30px' }}><StatusLine ok size={30}>已經 Published：跳到第 6 步</StatusLine></div>
          </div>
        </Step>
        <Step duration={STEP_MS}>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 20 }}>
            <div style={{ background: sage, padding: '14px 30px' }}><StatusLine ok size={30}>打開網址，首頁是〈三國演義〉：過關</StatusLine></div>
          </div>
        </Step>
      </Steps>
    </Fit>
  </Shell>
);

const EditAgain: Page = () => (
  <Shell chapter={4} source={'Forestry.md Publish history'}>
    <PracticeEyebrow time="4 分鐘">小練習｜也是休息時間</PracticeEyebrow>
    <Heading>改一句，再發布一次</Heading>
    <PillRow>
      <Pill tag="定位">〈三國演義〉</Pill>
      <Pill tag="期望輸出">網站上看到那句</Pill>
      <Pill tag="限制">只改一句</Pill>
    </PillRow>
    <Fit>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', gap: 16 }}>
        <FlowStep i={1} n={1} w={330} kind="doc" label="改一句" sub="〈三國演義〉加一句" />
        <FlowArrow i={2} />
        <FlowStep i={3} n={2} w={330} kind="upload" label="再發布" sub="Publish All" />
        <FlowArrow i={4} />
        <FlowStep i={5} n={3} w={330} kind="clock" label="等 Published" sub="Publish history" />
        <FlowArrow i={6} />
        <FlowStep i={7} n={4} w={330} kind="browser" label="重新整理" sub="網址上看那句" />
      </div>
      <Steps>
        <Step duration={STEP_MS}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 40, marginTop: 56 }}>
            <div style={{ background: sage, padding: '16px 30px' }}><StatusLine ok size={32}>看到新句子：網站更新了</StatusLine></div>
            <div style={{ background: warnSoft, padding: '16px 30px' }}><StatusLine ok={false} size={32}>沒變：等半分鐘再重新整理</StatusLine></div>
          </div>
        </Step>
      </Steps>
    </Fit>
  </Shell>
);

// ---------- 04 挑卡發布 ----------

const Section4: Page = () => <SectionPage chapter={4} label="04 / 檢查" lead="改一句再發布，再從首頁點到新卡" />;

// The tick on a card in the picture, decoded: the same tick in Obsidian's property panel
// (a crop of the real screenshot), which is the same as the line dg-publish: true.
const PropertyStrip = ({ x, y }: { x: number; y: number }) => (
  <g>
    <svg x={x} y={y} width="405" height="54" viewBox="90 410 540 72" aria-hidden="true"><image href={dgProperty} x="0" y="0" width="1830" height="770" /></svg>
    <rect x={x} y={y} width="405" height="54" fill="none" stroke={rule} strokeWidth="2" />
  </g>
);

const PublishFlag: Page = () => (
  <Shell chapter={2} source={'Digital Garden 入門（dg-publish）docs.forestry.md/getting-started/01-getting-started；Obsidian 說明：屬性 obsidian.md/help/properties'}>
    <Eyebrow>打開〈三國演義〉｜看屬性第一行</Eyebrow>
    <Heading>發布旗標（dg-publish）</Heading>
    <Lead>屬性（Frontmatter）裡「要公開」的勾</Lead>
    <Fit>
      <Stage h={470}>
        <Steps>
          <Layer h={470} label="你的知識庫有五張卡，三張打勾，兩張沒勾；中間是一個寫著 dg-publish 的篩子">
            <InG i={0}><SvgIcon kind="folder" x={26} y={28} size={44} color={muted} /><text x="60" y="40" fontSize="28" fontWeight="600" fill={ink}>你的知識庫</text></InG>
            <InG i={1}><CardRow x={0} y={80} w={360} name="三國演義" on /><CardRow x={0} y={150} w={360} name="劉備" on /><CardRow x={0} y={220} w={360} name="桃園結義" on /></InG>
            <InG i={2}><CardRow x={0} y={290} w={360} name="我的草稿" on={false} /><CardRow x={0} y={360} w={360} name="上課筆記" on={false} /></InG>
            <InG i={3}>
              <path d="M520 100 H900 L760 260 V340 H660 V260 Z" fill={amberSoft} stroke={amber} strokeWidth="3" />
              <text x="710" y="160" textAnchor="middle" fontSize="30" fontFamily={mono} fontWeight="600" fill={ink}>dg-publish</text>
              <text x="710" y="206" textAnchor="middle" fontSize="25" fill={muted}>打勾的才放行</text>
            </InG>
            <g fill="none" stroke={faint} strokeWidth="3"><DrawPath i={4} d="M370 108 C440 108 470 140 540 150" /><DrawPath i={4} d="M370 178 C440 178 470 170 560 180" /><DrawPath i={4} d="M370 248 C440 248 480 210 590 210" /></g>
          </Layer>
          <Step duration={STEP_MS}><Layer h={470} label="卡上的勾，就是 Obsidian 屬性面板的 dg-publish 打勾，等於原始檔開頭寫 dg-publish: true">
            <Build><TickBox x={300} y={15} on /><text x="356" y="42" textAnchor="middle" fontSize="34" fill={amber}>＝</text></Build>
            <Build i={1}><PropertyStrip x={384} y={2} /><text x="384" y="86" fontSize="24" fill={quiet}>Obsidian 屬性面板</text></Build>
            <Build i={2}>
              <text x="826" y="42" textAnchor="middle" fontSize="34" fill={amber}>＝</text>
              <rect x="856" y="2" width="330" height="54" fill={term} />
              <text x="878" y="39" fontSize="28" fontFamily={mono} fill="#F5F5F4">dg-publish: <tspan fill="#8DD4A0">true</tspan></text>
              <text x="856" y="86" fontSize="24" fill={quiet}>原始檔的開頭</text>
            </Build>
          </Layer></Step>
          <Step duration={STEP_MS}><Layer h={470} label="按發布之後，網站上只出現三張打勾的卡">
            <MapArrow x1={780} x2={1010} y={320} hot draw />
            <text x="895" y="300" textAnchor="middle" fontSize="25" fontWeight="600" fill={link}>按發布才送出</text>
            <Build>
              <BrowserFrame x={1030} y={110} w={602} h={340} url="….forestry.md" />
              <CardRow x={1070} y={190} w={300} name="三國演義" on />
              <CardRow x={1070} y={270} w={300} name="劉備" on />
              <CardRow x={1070} y={350} w={300} name="桃園結義" on />
            </Build>
          </Layer></Step>
          <Step duration={STEP_MS}><Layer h={470} label="沒勾的兩張留在你的電腦">
            <g fill="none" stroke={faint} strokeWidth="3"><StepPath d="M372 318 H392 V388 H372 M392 353 H412" /></g>
            <Build i={1}>
              <rect x="416" y="326" width="236" height="54" fill={surface} stroke={faint} strokeWidth="2" strokeDasharray="8 6" />
              <text x="534" y="362" textAnchor="middle" fontSize="27" fill={muted}>留在你的電腦</text>
            </Build>
          </Layer></Step>
        </Steps>
      </Stage>
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={32}>勾了 dg-publish，還要按發布才會上網站</Takeaway></Step></Steps>
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
  <Shell chapter={3} source={'Digital Garden 入門（dg-publish）docs.forestry.md/getting-started/01-getting-started'}>
    <Eyebrow>第三堂的 eli5 改寫版</Eyebrow>
    <Heading>發布前，看新卡的屬性</Heading>
    <Fit>
      <Stage h={470}>
        <Steps>
          <Layer h={470} label="人物/劉備.md 經過 eli5 改寫，產生 劉備-5歲版.md">
            <InG i={0}><SourceDoc x={0} y={0} w={620} h={268} name="人物/劉備.md" lines={['---', 'dg-publish: true', '---', '劉備，字玄德，是中山靖王之後']} /></InG>
            <InG i={1}><MapArrow x1={640} x2={992} y={124} hot /><text x="816" y="104" textAnchor="middle" fontSize="28" fontWeight="600" fill={amber}>eli5 改寫</text></InG>
            <InG i={2}><SourceDoc x={1012} y={0} w={620} h={268} name="劉備-5歲版.md" lines={['---', 'dg-publish: true', '---', '劉備，字玄德，是中山靖王的後代。']} highlight={1} /></InG>
          </Layer>
          <Step duration={STEP_MS}><Layer h={470} label="如果改寫版也有 dg-publish: true">
            <Build>
              <rect x="1030" y="122" width="330" height="48" fill="none" stroke={warn} strokeWidth="4" />
              <text x="1372" y="156" fontSize="26" fontWeight="600" fill={warn}>如果 5 歲版也有這行</text>
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
          <Step duration={STEP_MS}><Layer h={470} label="5 歲版不想公開：拿掉 dg-publish 那行，網站上那張也跟著不見">
            <g fill="none" stroke={okGreen} strokeWidth="5" strokeLinecap="round"><StepPath d="M1040 146 H1350" /></g>
            <Build i={4}><text x="1372" y="204" fontSize="26" fontWeight="600" fill={okGreen}>不想公開：拿掉這行</text></Build>
            <Build i={6}><rect x="1054" y="372" width="570" height="68" fill="#FFFFFF" opacity="0.8" /><line x1="1066" y1="406" x2="1340" y2="406" stroke={okGreen} strokeWidth="4" strokeLinecap="round" /></Build>
          </Layer></Step>
        </Steps>
      </Stage>
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={28}>改寫出來的卡，可能連 dg-publish 一起抄過去</Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

// Adding the publish flag to a card that has none: the card, the command, the tick it leaves.
const AddFlag: Page = () => (
  <Shell chapter={3} source={'Digital Garden 外掛指令（實際畫面）；Obsidian 說明：屬性 obsidian.md/help/properties'}>
    <Eyebrow>要公開的卡｜實際畫面</Eyebrow>
    <Heading>用 Add publish flag 補上勾</Heading>
    <Fit>
      <div style={{ position: 'relative', width: 1632, height: 330 }}>
        <In i={0} style={{ position: 'absolute', left: 0, top: 0 }}>
          <Figure w={440} h={300} label="整理/時間軸.md：開頭直接是一段 HTML，沒有屬性">
            <DocShape x={0} y={0} w={440} h={300} />
            <text x="28" y="48" fontSize="27" fontWeight="600" fill={ink}>整理/時間軸.md</text>
            <line x1="28" y1="68" x2="400" y2="68" stroke={rule} strokeWidth="2" />
            <text x="28" y="122" fontSize="26" fontFamily={mono} fill={quiet}>{'<div class="tl">'}</text>
            <text x="28" y="166" fontSize="26" fontFamily={mono} fill={quiet}>…</text>
            <NoDot x={46} y={240} r={18} />
            <text x="76" y="250" fontSize="27" fontWeight="600" fill={warn}>沒有屬性</text>
          </Figure>
        </In>
        <Steps>
          <Step duration={STEP_MS}>
            <div style={{ position: 'absolute', left: 470, top: 0, width: 620 }}>
              <div style={{ fontSize: 28, fontWeight: 600, marginBottom: 12 }}><span style={{ color: amber }}>→</span>　Ctrl／Cmd + P，選這行</div>
              <div style={{ position: 'relative' }}>
                <CropShot src={dgPaletteForestry} nat={[1406, 1123]} crop={[20, 120, 760, 145]} width={620} alt="Obsidian 命令面板：第一行 Publish All Notes Marked for Publish，第二行 Digital Garden: Add publish flag" />
                <Spot box={[0, 60, 620, 58]} />
              </div>
            </div>
          </Step>
          <Step duration={STEP_MS}>
            <div style={{ position: 'absolute', left: 1130, top: 0, width: 502 }}>
              <div style={{ fontSize: 28, fontWeight: 600, marginBottom: 12 }}><span style={{ color: amber }}>→</span>　屬性多了一個勾</div>
              <CropShot src={dgProperty} nat={[1830, 770]} crop={[90, 400, 560, 96]} width={502} alt="Obsidian 屬性面板：dg-publish 已打勾" />
              <div style={{ marginTop: 18 }}><StatusLine ok size={28}>{`和第 ${pageOf(PublishFlag)} 頁的勾一樣`}</StatusLine></div>
            </div>
          </Step>
        </Steps>
      </div>
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={40}>練習 3-1 就用它，替時間軸補上勾</Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

const HomeFlag: Page = () => (
  <Shell chapter={2} source={'Digital Garden 入門（dg-home）docs.forestry.md/getting-started/01-getting-started'}>
    <Eyebrow>〈三國演義〉屬性第二行</Eyebrow>
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
  <Shell chapter={3} source={'Obsidian 說明：內部連結 obsidian.md/help/links'}>
    <Eyebrow>讓讀者從首頁點到每張卡</Eyebrow>
    <Heading>建立知識庫導覽頁</Heading>
    <Fit>
      <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: '780px 1fr', gap: 60, alignItems: 'start' }}>
        <Figure w={780} h={450} label="整理/知識庫導覽.md：標題列是紫色，就是首頁 [[知識庫導覽]] 連到的那一頁；開頭有 dg-publish，下面三個路標連到時間軸、人物、事件">
          <InG i={0}>
            <DocShape x={0} y={0} w={780} h={440} />
            <path d="M2 2 H757 L778 23 V75 H2 Z" fill={linkSoft} />
            <path d="M758 0 V22 H780" fill="none" stroke={rule} strokeWidth="2" />
            <text x="30" y="52" fontSize="28" fontWeight="600" fill={link}>整理/知識庫導覽.md</text>
            <line x1="0" y1="76" x2="780" y2="76" stroke={rule} strokeWidth="2" />
          </InG>
          <InG i={1}><text x="30" y="118" fontSize="26" fontFamily={mono} fill={quiet}>dg-publish: true</text></InG>
          <PopG i={2}><Signpost y={150} label="時間" links="[[時間軸]]" /></PopG>
          <PopG i={2.6}><Signpost y={244} label="人物" links="[[劉備]]、[[曹操]]、[[孫權]]" /></PopG>
          <PopG i={3.2}><Signpost y={338} label="事件" links="[[桃園結義]]、[[白門樓]]…" /></PopG>
          <InG i={4.2}><text x="250" y="430" fontSize="24" fill={amber}>三英戰呂布先不放，練習 4 再加</text></InG>
        </Figure>
        <div>
          <In i={5.2}>
            <Figure w={792} h={136} label="首頁 三國演義.md 的最後一行連到知識庫導覽">
              <DocShape x={0} y={0} w={792} h={130} />
              <text x="28" y="44" fontSize="26" fontWeight="600" fill={ink}>三國演義.md（首頁）最後一行</text>
              <rect x="22" y="64" width="300" height="50" fill={linkSoft} stroke={link} strokeWidth="2" />
              <text x="38" y="99" fontSize="28" fontFamily={mono} fill={link}>[[知識庫導覽]]</text>
            </Figure>
          </In>
          <div style={{ marginTop: 30 }}>
            <Steps>
              <In i={6.2} style={{ fontSize: 30, fontWeight: 600, marginBottom: 18 }}>發布前核對一次</In>
              <Step duration={STEP_MS}><><div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}><SpotNum n={1} /><StatusLine ok size={30}>導覽頁有 dg-publish: true</StatusLine></div><Spot box={[18, 90, 272, 40]} n={1} /></></Step>
              <Step duration={STEP_MS}><><div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}><SpotNum n={2} /><StatusLine ok size={30}>首頁連到 [[知識庫導覽]]</StatusLine></div><Spot box={[852, 56, 316, 66]} n={2} />
                <svg viewBox="0 0 1632 140" style={{ position: 'absolute', left: 0, top: 0, width: 1632, height: 140, overflow: 'visible', pointerEvents: 'none' }} aria-hidden="true">
                  <g fill="none" stroke={link} strokeWidth="4"><StepPath d="M850 89 C822 89 826 38 798 38" /></g>
                  <polygon points="782,38 798,29 798,47" fill={link} className="aw4-tip" style={{ transitionDelay: '480ms' }} />
                </svg>
              </></Step>
              <Step duration={STEP_MS}><><div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}><SpotNum n={3} /><StatusLine ok size={30}>連到的卡，每張都要勾 dg-publish</StatusLine></div><Spot box={[238, 144, 530, 254]} n={3} inside /></></Step>
              <Step duration={STEP_MS}><div style={{ display: 'flex', alignItems: 'center', gap: 12 }}><SpotNum /><StatusLine ok size={30}>5 歲版沒有公開（除非你想公開）</StatusLine></div></Step>
            </Steps>
          </div>
        </div>
      </div>
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={32}>放進導覽頁的卡，也要各自勾 dg-publish 才會上網站</Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

const PublishCommand: Page = () => (
  <Shell chapter={2} source={'Digital Garden 指令 docs.forestry.md/getting-started/02-commands'}>
    <Eyebrow>發布｜實際畫面</Eyebrow>
    <Heading>命令面板（Command Palette）</Heading>
    <Lead>Ctrl／Cmd + P，打 garden 找指令</Lead>
    <Fit>
      <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: '640px 1fr', gap: 80, alignItems: 'start' }}>
        <In i={0}><CropShot src={dgPaletteForestry} nat={[1406, 1123]} crop={[0, 10, 1406, 1113]} width={640} alt="Obsidian 命令面板列出 Digital Garden 的指令：第一行 Publish All Notes Marked for Publish，第二行 Add publish flag，下面還有 Publish Active Note 等" /></In>
        <In i={1} style={{ position: 'absolute', left: 240, top: 84, height: 32, padding: '0 14px', display: 'flex', alignItems: 'center', background: raised, border: `1px solid ${rule}`, fontSize: 24, color: quiet }}>挑卡時再用</In>
        <div style={{ display: 'grid', gap: 44, paddingTop: 30 }}>
          <Steps>
            <Step duration={STEP_MS}><TourStep n={1} title="Publish All Notes Marked for Publish" detail="發布所有勾了 dg-publish 的卡，今天的練習都用這個" box={[8, 55, 624, 28]} badge="right" /></Step>
            <Step duration={STEP_MS}><TourStep n={2} title="Publish Active Note" detail="只發布打開的這一張" box={[8, 318, 624, 28]} badge="right" /></Step>
          </Steps>
        </div>
      </div>
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={20}>練習 2 只要用 Publish All</Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

// The publish log right after Publish All: the newest row is on top. Rows of the real
// screenshot (crop of forestry-publish-building.png) are outlined one per click.
const PublishStatus: Page = () => (
  <Shell chapter={2} source={'Forestry.md 儀表板 Publish history（實際畫面）'}>
    <Eyebrow>按完發布｜回 Forestry 儀表板</Eyebrow>
    <Heading>看 Publish history 的狀態</Heading>
    <Fit>
      <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: '820px 1fr', gap: 90, alignItems: 'start' }}>
        <In i={0}><CropShot src={forestryPublishBuilding} nat={[1274, 996]} crop={[48, 33, 1169, 611]} width={820} alt="Forestry 的 Publish history，最新的在最上面：第一筆 Building，Running for 9s；第二筆 Published，Live now；第三筆 Publish failed，Failed" /></In>
        <div style={{ display: 'grid', gap: 44, paddingTop: 20 }}>
          <Steps>
            <Step duration={STEP_MS}><TourStep n={1} title="Building：建置中" detail="約半分鐘；下一頁看它在做什麼" box={[4, 122, 812, 100]} /></Step>
            <Step duration={STEP_MS}><TourStep n={2} title="Published：上線了" detail="Live now＝網址上現在的版本" box={[4, 226, 812, 100]} /></Step>
            <Step duration={STEP_MS}><TourStep n={3} title="Failed：沒有上線" detail="點右邊箭頭看原因" box={[4, 328, 812, 100]} /></Step>
          </Steps>
        </div>
      </div>
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={36}>最上面那一筆，就是你剛按的發布</Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

const Practice31: Page = () => (
  <Shell chapter={3} source={'Digital Garden 指令 docs.forestry.md/getting-started/02-commands'}>
    <PracticeEyebrow time="8 分鐘">練習 3-1｜時間軸</PracticeEyebrow>
    <Heading>練習（dg-publish）：讓時間軸卡上線</Heading>
    <PillRow>
      <Pill tag="定位">整理/時間軸.md</Pill>
      <Pill tag="期望輸出">網站看得到時間軸</Pill>
      <Pill tag="限制">先看屬性</Pill>
    </PillRow>
    <Fit>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', gap: 16 }}>
        <FlowStep i={1} n={1} w={330} kind="doc" label="打開時間軸" sub="看屬性" />
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
            <div style={{ background: warnSoft, padding: '16px 30px' }}><StatusLine ok={false} size={32}>404（找不到頁面）：沒勾或還沒發布</StatusLine></div>
          </div>
        </Step>
      </Steps>
    </Fit>
  </Shell>
);

const HtmlTest: Page = () => (
  <Shell chapter={3} source={'範例網站 glowing-clearing.forestry.md/整理/時間軸/；markdown-it（模板設定 html: true）github.com/markdown-it/markdown-it'}>
    <Eyebrow>範例網站｜實際畫面</Eyebrow>
    <Heading>時間軸卡在網站上的樣子</Heading>
    <Fit>
      <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: '640px 1fr', gap: 100, alignItems: 'start' }}>
        <In i={0}>
          <CropShot src={timelineSite} alt="範例網站的時間軸頁：米色框裡一條橫向時間軸，看得到桃園結義、曹操獻刀、捉放曹、溫酒斬華雄，第五件三英戰呂布被右邊切到；下方來源卡是一行行純文字檔名" nat={[950, 700]} crop={[0, 0, 950, 700]} width={640} />
          <Caption>範例網站的時間軸，共 12 件事</Caption>
        </In>
        <div style={{ display: 'grid', gap: 48, paddingTop: 40 }}>
          <Steps>
            <Step duration={STEP_MS}><TourStep n={1} title={<StatusLine ok size={34}>HTML 照常顯示</StatusLine>} detail="第三堂的橫向時間軸直接發布" box={[4, 6, 632, 460]} /></Step>
            <Step duration={STEP_MS}><TourStep n={2} title={<StatusLine ok size={34}>事件名稱是純文字</StatusLine>} detail="點不了；後面的事件往右滑" box={[6, 101, 628, 85]} badge="right" /></Step>
            <Step duration={STEP_MS}><TourStep n={3} title={<StatusLine ok size={34}>來源卡也是純文字</StatusLine>} detail="沒有連結，就不會點到 404" box={[13, 209, 230, 256]} badge="right" /></Step>
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

// Practice 3-2 pastes two Codex prompts: each shows the real text, then the check on a click.
const PromptStepTitle = ({ n, children }: { n: number; children: ReactNode }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 30, fontWeight: 600, whiteSpace: 'nowrap' }}><NumDot n={n} />{children}</div>
);
const PromptPaste = ({ children }: { children: ReactNode }) => (
  <div style={{ background: term, color: '#F5F5F4', padding: '20px 28px', fontFamily: mono, fontSize: 24, lineHeight: 1.5 }}>
    <div style={{ color: '#BCC3CC', marginBottom: 6 }}>貼進 Codex</div>
    <Typed>{children}</Typed>
  </div>
);
const PromptCheck = ({ children }: { children: ReactNode }) => (
  <div style={{ background: sage, padding: '14px 24px', fontSize: 26, lineHeight: 1.45, color: ink }}>{children}</div>
);

const Practice32: Page = () => (
  <Shell chapter={3} source={'Digital Garden 指令 docs.forestry.md/getting-started/02-commands'}>
    <PracticeEyebrow time="14 分鐘">練習 3-2｜導覽頁</PracticeEyebrow>
    <Heading>練習（導覽頁）：幫網站做目錄</Heading>
    <PromptsCopy lead="複製兩段提示詞" section="練習 3-2" />
    <PillRow>
      <Pill tag="定位">知識庫導覽</Pill>
      <Pill tag="期望輸出">導覽頁連結點得開</Pill>
      <Pill tag="限制">先看屬性</Pill>
    </PillRow>
    <Fit>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 56, alignItems: 'start' }}>
        <In i={1} style={{ display: 'grid', gap: 18 }}>
          <PromptStepTitle n={1}>Codex 做導覽頁</PromptStepTitle>
          <PromptPaste>請在 整理/ 新增 知識庫導覽.md。分成時間、人物、事件三段：時間那段只放 [[時間軸]]；人物那段用 [[連結]] 列出 人物/ 裡的每張卡；事件那段用 [[連結]] 列出 關係/ 裡的每張卡，但先不要放〈三英戰呂布〉，練習 4 再加。只連到已有的卡，不要新增卡片，也不要改別的檔案。開頭加上 dg-publish: true。寫入前先給我看。</PromptPaste>
          <Steps><Step duration={STEP_MS}><PromptCheck>看預覽：沒有三英戰呂布、沒有找不到的卡 → 回「可以」</PromptCheck></Step></Steps>
        </In>
        <In i={2} style={{ display: 'grid', gap: 18 }}>
          <PromptStepTitle n={2}>〈三國演義〉最後一行加 <span style={{ fontFamily: mono, color: link }}>[[知識庫導覽]]</span></PromptStepTitle>
          <PromptStepTitle n={3}>列出還沒勾的卡</PromptStepTitle>
          <PromptPaste>列出 整理/知識庫導覽.md 連到的每張卡，每張一行，寫出它開頭有沒有 dg-publish: true。只列清單，不要修改任何檔案。</PromptPaste>
          <Steps><Step duration={STEP_MS}><PromptCheck>標「沒有」的卡打開看屬性：要公開就 Add publish flag，不公開就從導覽頁刪掉</PromptCheck></Step></Steps>
        </In>
      </div>
      <Steps>
        <Step duration={STEP_MS}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 28, marginTop: 36 }}>
            <PromptStepTitle n={4}>Publish All，等 Published</PromptStepTitle>
            <div style={{ background: sage, padding: '12px 24px' }}><StatusLine ok size={28}>首頁 → 導覽頁 → 每張卡</StatusLine></div>
            <div style={{ background: warnSoft, padding: '12px 24px' }}><StatusLine ok={false} size={28}>404：那張沒勾或沒發布</StatusLine></div>
          </div>
        </Step>
      </Steps>
    </Fit>
  </Shell>
);

// ---------- 04 更新與檢查 ----------


// One stop on the route a reader clicks in practice 4: white before the check, green once it opens.
const RouteStop = ({ x, w, name, ok = false }: { x: number; w: number; name: string; ok?: boolean }) => (
  <g>
    <rect x={x} y="0" width={w} height="76" rx="38" fill={ok ? sage : '#FFFFFF'} stroke={ok ? okGreen : faint} strokeWidth="3" />
    <text x={x + w / 2} y="49" textAnchor="middle" fontSize="30" fontWeight="600" fill={ink}>{name}</text>
  </g>
);

// Inside a <Step>: the same stop turning green, fading in over the white one after `at` ms.
const RouteStopOk = ({ x, w, name, at }: { x: number; w: number; name: string; at: number }) => (
  <g className="aw4-tip" style={{ transitionDelay: `${at}ms` }}><RouteStop x={x} w={w} name={name} ok /></g>
);

// Why the route breaks at one stop: a red box hung under that stop (`at` is the stop's centre).
const RouteFail = ({ i, x, w, at, label }: { i: number; x: number; w: number; at: number; label: string }) => (
  <Build i={i}>
    <line x1={at} y1="80" x2={at} y2="118" stroke={warn} strokeWidth="3" />
    <rect x={x} y="118" width={w} height="58" fill={warnSoft} />
    <NoDot x={x + 32} y={147} r={16} />
    <text x={x + 62} y="156" fontSize="26" fontWeight="600" fill={warn}>{label}</text>
  </Build>
);

const Practice4: Page = () => (
  <Shell chapter={4}>
    <PracticeEyebrow time="14 分鐘">練習 4｜自己檢查</PracticeEyebrow>
    <Heading>練習（檢查）：從首頁點到新卡</Heading>
    <PillRow>
      <Pill tag="定位">一張新卡</Pill>
      <Pill tag="期望輸出">首頁點得到新卡</Pill>
      <Pill tag="限制">只從首頁點</Pill>
    </PillRow>
    <Fit>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', gap: 24 }}>
        <FlowStep i={1} n={1} w={420} kind="upload" label="公開三英戰呂布" sub="勾選、加進導覽頁、發布" />
        <FlowArrow i={2} />
        <FlowStep i={3} n={2} w={420} kind="clock" label="等到 Published" sub="看 Publish history" />
        <FlowArrow i={4} />
        <FlowStep i={5} n={3} w={420} kind="home" label="打開網址，從首頁點" sub="一站一站點下去" />
      </div>
      <div style={{ marginTop: 44 }}>
        <Stage h={180}>
          <Steps>
            <Layer h={180} label="要走的路線：首頁 → 導覽頁 → 三英戰呂布，還沒點過的都是白色">
              <InG i={6}>
                <RouteStop x={150} w={180} name="首頁" />
                <RouteStop x={430} w={220} name="導覽頁" />
                <RouteStop x={790} w={280} name="三英戰呂布" />
                <g stroke={faint} strokeWidth="3"><line x1="330" y1="38" x2="414" y2="38" /><line x1="650" y1="38" x2="774" y2="38" /></g>
                <polygon points="428,38 412,29 412,47" fill={faint} />
                <polygon points="788,38 772,29 772,47" fill={faint} />
              </InG>
            </Layer>
            <Step duration={STEP_MS}><Layer h={180} label="點得到：三站依序變綠，點到新卡就完成">
              <RouteStopOk x={150} w={180} name="首頁" at={100} />
              <g fill="none" stroke={okGreen} strokeWidth="5"><StepPath i={1} d="M330 38 H414" /><StepPath i={6} d="M650 38 H774" /></g>
              <polygon points="428,38 412,29 412,47" fill={okGreen} className="aw4-tip" style={{ transitionDelay: '560ms' }} />
              <RouteStopOk x={430} w={220} name="導覽頁" at={560} />
              <polygon points="788,38 772,29 772,47" fill={okGreen} className="aw4-tip" style={{ transitionDelay: '1020ms' }} />
              <RouteStopOk x={790} w={280} name="三英戰呂布" at={1020} />
              <Build i={12}><OkDot x={1150} y={38} r={26} /><text x="1192" y="50" fontSize="34" fontWeight="600" fill={okGreen}>點到新卡：完成</text></Build>
            </Layer></Step>
            <Step duration={STEP_MS}><Layer h={180} label="點不到：導覽頁沒有新連結，看下一頁；點新卡是 404，新卡沒勾 dg-publish">
              <Build i={0}><text x="150" y="157" fontSize="28" fontWeight="600" fill={warn}>點不到？</text></Build>
              <RouteFail i={1} x={360} w={352} at={540} label="沒有新連結：看下一頁" />
              <RouteFail i={3} x={744} w={416} at={930} label="404：新卡沒勾 dg-publish" />
            </Layer></Step>
          </Steps>
        </Stage>
      </div>
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
  <Shell chapter={4} source={'Forestry.md 儀表板 Publish history'}>
    <Eyebrow>發布了，網站沒變</Eyebrow>
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
          <Step duration={STEP_MS}><Layer h={520} label="檢查三：那一筆的狀態。Building 再等，Published 往下一步，Failed 點開看原因">
            <Build><CheckRow y={250} n={3} title="狀態是什麼？" sub="Building／Published／Failed" /></Build>
            <Build i={1}>
              <rect x="640" y="240" width="992" height="190" fill="#FFFFFF" stroke={rule} strokeWidth="2" />
              <StatusChip x={668} y={262} w={140} label="Building" color={blue} />
              <text x="828" y="290" fontSize="26" fill={ink}>再等一下</text>
              <StatusChip x={668} y={316} w={140} label="Published" color={okGreen} />
              <text x="828" y="344" fontSize="26" fill={ink}>往第 4 步</text>
              <StatusChip x={668} y={370} w={140} label="Failed" color={warn} />
              <text x="828" y="398" fontSize="26" fill={ink}>{`點右邊箭頭看原因，對照第 ${pageOf(SlugFail)} 頁`}</text>
            </Build>
          </Layer></Step>
          <Step duration={STEP_MS}><Layer h={520} label="檢查四：瀏覽器略過快取重新載入">
            <Build><CheckRow y={440} n={4} title="略過快取重新載入" sub="Ctrl／Cmd + Shift + R" /></Build>
            <Build i={1}>
              <rect x="640" y="448" width="760" height="64" fill={surface} stroke={faint} strokeWidth="2" />
              <text x="668" y="490" fontSize="26" fill={ink}>瀏覽器按 Ctrl／Cmd + Shift + R，或開無痕視窗</text>
            </Build>
          </Layer></Step>
        </Steps>
      </Stage>
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={24}>從第 1 步往下查，不要跳步</Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

// The student's own site after today's practices: one checklist row per practice, ticked
// one click at a time over the empty row (aw4-still, so the tick row doesn't drift).
const DONE_X = 800;
const DONE_H = 116;
const DoneRow = ({ top, name, practice, done = false }: { top: number; name: string; practice: string; done?: boolean }) => (
  <div className={done ? 'aw4-still' : undefined} style={{ position: 'absolute', left: DONE_X, right: 0, top, height: DONE_H, boxSizing: 'border-box', display: 'flex', alignItems: 'center', gap: 28, padding: '0 36px', background: done ? sage : '#FFFFFF', border: done ? `2px solid ${okGreen}` : `2px dashed ${faint}` }}>
    <svg viewBox="0 0 48 48" style={{ width: 48, height: 48, flexShrink: 0 }} aria-hidden="true">
      <rect x="3" y="3" width="42" height="42" fill="#FFFFFF" stroke={done ? okGreen : faint} strokeWidth="3" />
      {done ? <g className="aw4-build" style={buildDelay(1)}><TickMark x={24} y={26} size={28} /></g> : null}
    </svg>
    <span style={{ flex: 1, fontSize: 38, fontWeight: 600, color: done ? ink : muted }}>{name}</span>
    <span style={{ fontSize: 25, fontWeight: 600, padding: '6px 18px', whiteSpace: 'nowrap', background: done ? '#FFFFFF' : surface, color: done ? okGreen : quiet }}>{practice}</span>
  </div>
);

const FinalResult: Page = () => (
  <Shell chapter={4} source={'範例網站 glowing-clearing.forestry.md/整理/時間軸/'}>
    <Eyebrow>最終成果｜打開自己的網站對照</Eyebrow>
    <Heading>你的網站：今天練習的成果</Heading>
    <Fit>
      <div style={{ position: 'relative', width: 1632, height: 410 }}>
        <In i={0} style={{ position: 'absolute', left: 0, top: 0 }}>
          <CropShot src={timelineSite} alt="範例網站的時間軸頁：標題三國時間軸，一條橫向時間軸依回目排出桃園結義、曹操獻刀、捉放曹、溫酒斬華雄，下方是來源卡清單" nat={[950, 700]} crop={[0, 0, 950, 458]} width={720} />
          <Caption>範例網站的時間軸</Caption>
        </In>
        <In i={1}><DoneRow top={0} name="時間軸" practice="練習 3-1" /></In>
        <In i={2}><DoneRow top={DONE_H + 30} name="知識庫導覽" practice="練習 3-2" /></In>
        <In i={3}><DoneRow top={(DONE_H + 30) * 2} name="三英戰呂布" practice="練習 4" /></In>
        <Steps>
          <Step duration={STEP_MS}><DoneRow top={0} name="時間軸" practice="練習 3-1" done /></Step>
          <Step duration={STEP_MS}><DoneRow top={DONE_H + 30} name="知識庫導覽" practice="練習 3-2" done /></Step>
          <Step duration={STEP_MS}><DoneRow top={(DONE_H + 30) * 2} name="三英戰呂布" practice="練習 4" done /></Step>
        </Steps>
      </div>
      <Steps><Step duration={STEP_MS}><Takeaway>三項都打勾，今天的網站就完成了</Takeaway></Step></Steps>
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
        <MatrixHead n={2} kind="folder" name="知識庫" />
        <MatrixHead n={3} kind="timeline" name="時間軸" />
        <MatrixHead n={4} kind="globe" name="網站" hot />
      </In>
      <div>
        <Steps>
          <Step duration={STEP_MS}><MatrixRow label="RAG" cells={['Web Search 是一種 RAG', '查筆記、附出處', '只照卡片內容排', '卡片的出處一起發布']} /></Step>
          <Step duration={STEP_MS}><MatrixRow label="Obsidian" cells={['（預告）', '安裝、連結、關係圖', '用回目排時間軸', 'Digital Garden 發布']} /></Step>
          <Step duration={STEP_MS}><MatrixRow label="Skills" cells={['AGENTS.md（預告）', '（預告）', '安裝、自己寫一個', 'Skill 產出放上網站']} /></Step>
        </Steps>
      </div>
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={40}>四堂課都在擴充同一個三國知識庫</Takeaway></Step></Steps>
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
  <div style={{ fontSize: 25, color: quiet, marginTop: 14 }}>到橘色字的網站，搜尋下一行的標題</div>
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
            <RefItem who="obsidian-digital-garden" where="github.com" title="Simple note URLs：中文卡名要關掉" />
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

export const meta: SlideMeta = {
  title: 'aw-04 發布成網站',
  createdAt: '2026-10-17T02:55:57.689Z',
  theme: 'thoughtstream',
};

const deck: Page[] = [
  Cover, LessonRecap, FinalSite, Agenda,
  Section1, ForestryAccount, PlantGarden, GardenLive, Practice1,
  Section2, InstallPlugin, ConnectForestry, KeySafety, PublishFlag, HomeFlag, PublishCommand, PublishStatus, BuildStep, SlugFail, SlugFix, Practice2,
  Section3, FrontmatterCheck, AddFlag, Practice31, HtmlTest, NavPage, Practice32,
  Section4, EditAgain, Practice4, NotUpdated, FinalResult,
  CourseRecap, ReferencesGarden, ReferencesDeploy,
  AppendixIndex, HtmlLinks, WebsiteIs, CiCd,
];

// 1-based page number of a page in this deck (for the agenda).
function pageOf(page: Page) {
  return deck.indexOf(page) + 1;
}

// Speaker notes, keyed by page so they stay aligned with the deck order.
const NOTES = new Map<Page, string>([
  [Cover, `00:00–01:00
最後一堂。前三堂我們寫了大綱、做了知識庫、用 Skill 排出時間軸，全部都還在自己的電腦裡。知識庫就是三國人物知識庫這個資料夾，Obsidian 叫它儲存庫（vault），今天都叫它知識庫。今天把它變成一個網址，同學、家人打開就看得到。
右下角三個圓圈就是今天的路線：筆記 → Forestry.md → 網址。Forestry.md 是幫你放網站的服務，等一下會介紹。
先在筆電打開這份簡報，網址在畫面上：chrouos.github.io/AI-workshop-slides。第 ${pageOf(Agenda)} 頁大綱右上角是今天的步驟手冊 prompts.md，每個練習的步驟和網址都在裡面，在筆電上點開、整段複製，不用照投影幕打字；投影幕上的 QR code 只能用手機掃。今天的教材都在 ${LAB_URL} ，整包下載是 aw-04-lab.zip：${LAB_ZIP_URL} ，所有教材的總表在 https://github.com/Chrouos/AI-workshop-slides/tree/main/examples 。`],
  [LessonRecap, `01:00–04:00
先回頭看三樣東西。第一堂用 Codex 寫出 三國演義大綱.md，人名都是 [[連結]]。第二堂把它放進 Obsidian 的知識庫，和人物、勢力、關係卡連起來。第三堂補進三張關係卡，用自己寫的 Skill 排出 時間軸.md。
按一下：第四個站是今天要做的網站。
再按一下：今天把前三堂的成果放到一個網址上。先打開 Obsidian，確認第三堂做的 整理/時間軸.md 和 關係/三英戰呂布.md 都在。`],
  [FinalSite, `04:00–05:30
先看做完的樣子。這是範例網站 glowing-clearing.forestry.md 的實際畫面，用的是四堂課同一個三國知識庫，另外照原文多補了幾張人物、事件卡。網址就在下面參考列，大家可以在筆電上打開點點看。
先看首頁〈三國演義〉，打開網址第一頁就是它。
按一下：換成導覽頁，從這裡點到時間軸、人物、事件。
按一下：再換成〈劉備的故事線〉：照回目排出劉備一路遇到誰、和誰經歷了哪些事。每一站中間是事件，左邊是同伴，右邊是對手；像曹操、呂布，在不同站會換邊。上面的圖是一段 HTML，下面再用一般的 [[連結]] 連到每張人物、事件卡。網頁上的小標題、引用框、表格，都是筆記裡的 Markdown 寫的。
最後一下：今天的目標是讀者從首頁點得到每一張卡。範例的知識庫放在 GitHub，課後想對照可以看：${FINAL_URL}
畫面是 2026-10-30 發布後擷取，網址逐頁確認打得開。`],
  [Agenda, `05:30–08:00
四章、五個練習，中間還有一個小練習當休息。章節的順序，就是真的做一遍會遇到的順序：遇到什麼，就在那一步講什麼。
右上角是今天的步驟手冊 prompts.md：課前作業和每個練習的步驟都在裡面，請現在在筆電打開，整堂課開著；後面只有練習 3-2 那頁會再放一次這個連結。網址：${PROMPTS_URL}
第一章開一座花園：註冊 Forestry.md、種一座花園，練習 1 打開自己的網址。第二章連上 Obsidian：裝外掛、連上 Forestry，看〈三國演義〉開頭的發布設定，按發布，回 Forestry 看結果；第一次發布常會失敗，就在這一章修好再發布，練習 2 把整段自己做一遍。第三章挑卡發布：決定哪些卡公開，練習 3-1 讓時間軸上線，練習 3-2 做導覽頁。第四章更新與檢查：小練習改一句再發布，練習 4 從首頁點到新卡，點不開就照四個檢查查；最後看成果、回顧四堂課，剩下的時間問答。
比較可能卡住的是第一、二章的帳號和連線。上週的課前作業是註冊 Forestry.md 帳號、種一座花園，等一下第 ${pageOf(ForestryAccount)} 頁會確認；沒註冊的人，現場用 email 或 GitHub 帳號註冊。`],
  [Section1, `08:00–08:30
第一章：開一座花園。在 Forestry.md 種出自己的網址，先讓大家有一個打得開的網站。`],
  [WebsiteIs, `（課後自讀，上課不講。）
你打一個網址，看到的網頁是從哪來的？這頁分三步看。
第一個畫面：你在瀏覽器輸入網址。你的瀏覽器就是用戶端（client）。網址就像門牌，告訴瀏覽器去哪一台電腦拿東西。
按一下：網址指向一台一直開著、連在網路上的電腦，叫伺服器（server）。伺服器上放了很多檔案，它找到〈劉備〉這一頁。
按一下：檔案送回來，瀏覽器把它畫成網頁，看到標題、內文、可以點的連結。
最後一下：今天做的網站，就是放在別台電腦上的檔案。今天要做的，就是把你的卡變成這種檔案，放到那台電腦上。`],
  [CiCd, `（課後自讀，上課不講。）
這頁講一個工程師常說的詞：CI/CD。CI 是 Continuous Integration，持續整合：每次改動送進來，就自動檢查、建置一次，有錯馬上知道；CD 是 Continuous Deployment，持續部署：檢查、建置通過，就自動上線。名字不用背，記住它在做什麼就好。
上面一排是沒有自動部署時的做法：改好檔案，自己把檔案上傳到伺服器，再自己重做網頁，才算上線。紅色的兩格都要人動手，人動手就可能漏掉其中一步。
按一下：下面一排是 CI/CD。紫色那格是你唯一要做的：按發布，把改好的卡送到 Forestry，就像把信投進郵筒。綠色括號是自動的部分：Forestry 收到之後，檢查、建置、上線都自動執行，像郵差會把信送到。建置失敗就不會上線，第二章的 Failed 就是這樣。
最後一下：你按發布之後，檢查、建置、上線都會自動完成。注意，按發布這一步還是要你自己做。`],
  [BuildStep, `32:30–34:30
Building 在做什麼？建置，就是把筆記做成網頁，像照食譜做出一道菜：食譜是原始檔，菜是網頁。
左邊是 人物/劉備.md 的原始檔：開頭是屬性，內文有 [[關羽]]、[[張飛]] 兩個連結。
按一下：你只做一件事，按發布，把卡送到 Forestry。後面它自動跑：照 Digital Garden 的網站模板建置，做好就換掉網址上的舊網頁。
按一下：做好的網頁。屬性不會顯示，標題變大，[[關羽]]、[[張飛]] 變成可以點的連結。
最後一下：[[連結]] 是在建置時才變成網址。建置時，每張卡都要分到一個自己的網址；下一頁的失敗就出在這裡。附錄第 ${pageOf(HtmlLinks)} 頁會再用到這件事；這種「你只按發布，後面自動」的做法，正式名稱 CI/CD，在附錄第 ${pageOf(CiCd)} 頁。`],
  [PublishStatus, `31:00–32:30
按了 Publish All，結果要回 Forestry 儀表板看：Publish history，發布紀錄，最新的一筆在最上面。這是講師的實際畫面。
按一下：1，Building，建置中，它在做什麼下一頁看。旁邊寫 Running for 9s，已經跑了 9 秒。講師 2026-10-30 實測，從按發布到做好大約 22 到 24 秒，半分鐘左右。
按一下：2，Published，上線了。旁邊寫 Live now，網址上現在看到的就是這一版。
按一下：3，Failed，失敗，這次沒有上線，網址上還是上一版。右邊有個小箭頭，點開可以看錯誤訊息。卡名是中文的話，第一次發布多半會看到它，兩頁之後看原因。
最後一下：最上面那一筆，就是你剛按的發布。`],
  [Section2, `20:00–20:30
第二章：連上 Obsidian，發布第一次。照真的做一遍的順序走：裝外掛、連線、看屬性、按發布、看結果，失敗就修好再發布。`],
  [Section3, `50:00–50:30
第三章：挑卡發布。網站上已經有〈三國演義〉，接下來決定還有哪些卡要公開：先讓第三堂的時間軸上線，再做一張導覽頁，讓讀者從首頁點得到每張卡。`],
  [ForestryAccount, `08:30–10:00
上週的課前作業：註冊 Forestry.md。它是 Digital Garden 外掛作者推出的代管服務，幫你把筆記建置成網站、給你一個網址。用它，就不用另外申請 GitHub、Vercel，也不用建 token。
這是講師 2026-10-30 的實際畫面。
按一下：1，打開 forestry.md，按 Sign up 註冊。
按一下：2，填 email 和密碼。
按一下：3，或者按最下面的 GitHub，用 GitHub 帳號登入，兩種都可以。
最後一下：還沒註冊的同學，現在就註冊，註冊完照下一頁種一座花園。`],
  [PlantGarden, `10:00–12:00
登入後的第一個畫面：Plant new garden，種一座花園。
按一下：1，Garden name，Forestry 會先幫你取一個名字，例如 green-elm，想換就自己改。
按一下：2，下面那行就是你的網址：名字.forestry.md。
按一下：3，按 Plant。講師實測種好花了 23 秒。
免費方案（講師帳號 2026-10-30 顯示）：一個網站、每月 30 次發布、100 MB 空間。上課和平常寫卡應該夠用。每月 30 次，指的是一個月可以按 30 次發布，所以改好幾張卡再一起發布，比較省次數。`],
  [GardenLive, `12:00–14:00
種好之後看到這個畫面：Your garden is live。
按一下：1，中間這行就是你的網址，點了就打開。現在打開只會看到模板的空網站，因為我們還沒有發布任何卡。
按一下：2，Copy address 複製網址，之後要打開自己的網站，就貼這個網址。
按一下：3，下面是 Forestry 給的步驟清單，畫面裡看得到前兩步。第一步 Connect Obsidian，連上你的 Obsidian；第二步 Choose your home page，選首頁，連上之後外掛會直接問你。這兩步都在第二章做。清單再往下還有一步 Publish more notes，發布更多卡：第二章發布第一次，第三章再挑卡發布。
這張是講師連好、也發布過之後截的，所以前兩步已經打勾。大家自己的畫面上，這兩步現在還沒打勾。`],
  [Practice1, `14:00–20:00
練習 1，6 分鐘：驗收課前作業，還沒做的人現場補。這個練習沒有提示詞，照投影片三步做。
登入 Forestry，確認你有一座花園，打開你的網址。看得到網頁就過關。
還沒註冊、或還沒種花園的同學，現場照第 ${pageOf(ForestryAccount)}、${pageOf(PlantGarden)} 頁做，註冊和 Plant 都在瀏覽器裡完成。
按一下：打得開，過關。打不開，多半是網址打錯：回 Forestry 儀表板按 Copy address（第 ${pageOf(GardenLive)} 頁）複製，再貼到瀏覽器；儀表板上沒有花園，照第 ${pageOf(PlantGarden)} 頁按 Plant。`],
  [InstallPlugin, `20:30–23:00
回到 Obsidian，裝 Digital Garden 外掛。這是講師的實際畫面，Obsidian 1.14.4。
按一下：1，設定 → 第三方外掛程式。第一次會看到受限模式：Obsidian 預設不執行別人寫的外掛，按右邊的「離開受限模式」，才能裝外掛。
按一下：2，社群外掛程式按「瀏覽」，搜尋 Digital Garden，認明作者是 oleeskild，避免裝到名字相近的其他外掛。講師看到的版本是 2.103.0。
按一下：3，按安裝，裝好再按啟用。
外掛只會裝在目前打開的這個知識庫，請確認你打開的是三國人物知識庫。官方說明：https://obsidian.md/help/community-plugins`],
  [ConnectForestry, `23:00–25:30
連線。左邊是 Obsidian 外掛的設定，右邊是 Forestry 儀表板。
按一下：1，設定 → 左下的 Digital Garden，Publish to 選 Forestry.md。預設是 GitHub，要自己改。
按一下：2，到 Forestry 儀表板右邊的 Garden Key，按 Reveal Garden Key，複製那串字。外掛帶著它發布，Forestry 就知道要放到你的花園。另一個做法是儀表板上的 Connect Obsidian 按鈕，會打開 Obsidian 幫你自動填好；這條路講師沒有截圖，教室裡以貼上 Garden Key 為主。
按一下：3，回 Obsidian，把 Key 貼進 Garden Key 欄位，按 Connect。出現「Connected to 你的花園名稱」就連上了。接著外掛會請你選網站首頁，選〈三國演義〉；為什麼選它，第 ${pageOf(HomeFlag)} 頁會看到。`],
  [KeySafety, `25:30–26:30
Garden Key 怎麼保管。Forestry 自己的說明寫：有了這組 Key，任何人都能發布到你的網站，所以要像密碼一樣收好。
中間這個鑰匙圖示就是 Garden Key。
按一下：它只該放在一個地方，外掛設定的 Garden Key 欄位。
按一下：不要貼進筆記，筆記發布後會公開；不要出現在截圖、投影片；不要傳到 LINE 群組或 Email。
按一下：萬一外流，到 Forestry 儀表板按 Regenerate Garden Key，產生一組新的。
最後一下：按了 Regenerate，舊的 Key 就不能用了。外掛裡還是舊的那組，所以要把新的 Key 貼回外掛設定，再按 Connect。`],
  [SlugFail, `34:30–36:00
Failed 的原因。這是講師準備課程時真的遇到的；你們的卡名也是中文，第一次發布很可能也會這樣。
左邊是講師的 Publish history。
按一下：框起來的是種好花園之後，連續兩次 Publish failed。
按一下：右邊看原因。外掛有一個設定叫 Simple note URLs，預設開著，會把卡片路徑轉成英文小寫的網址，例如 My Folder/My Note 變成 my-folder/my-note。可是它轉不了中文字，會直接拿掉。講師用同一個轉換套件實測：人物/劉備、人物/關羽、關係/桃園結義，全部變成三條斜線。
按一下：中文字被拿掉，每張卡的網址都一樣。上一頁說建置時每張卡要分到自己的網址，網址撞在一起，建置就失敗。點開錯誤訊息會看到 DuplicatePermalink，意思就是網址重複。
最後一下：卡名是中文，就要關掉 Simple note URLs。下一頁看在哪裡關。`],
  [SlugFix, `36:00–37:00
這個開關在設定 → 第三方外掛 → Digital Garden，同一頁往下捲到 Publishing。要先連上 Forestry，這一段才會出現。
按一下：1，說明裡就有寫：note names use non-Latin characters 就關掉，也就是卡名用的不是英文字母（例如中文），就把它關掉。
按一下：2，截圖裡的開關是開著的（紫色），把它關掉。
按一下：3，再發布一次：Publish All，回 Publish history 等最上面那一筆變成 Published，再打開網址，首頁就是〈三國演義〉。講師關掉之後再發布，就變成 Published，網址是 /人物/劉備/ 這樣的中文網址，瀏覽器打得開。
最後一下：開著是三條斜線，關掉是正常的中文網址。這張外掛畫面是講師另開一個測試用的 Obsidian 截的，為了讓沒連線的外掛也顯示 Publishing 這一段，只在記憶體裡暫時改了連線判斷，沒有存任何設定。`],
  [Practice2, `37:00–50:00
練習 2，13 分鐘：把剛才那一段自己做一遍。步驟在步驟手冊 prompts.md 練習 2，順序和投影片一樣。
1，裝外掛、連線：照第 ${pageOf(InstallPlugin)}、${pageOf(ConnectForestry)} 頁，連上後首頁選〈三國演義〉。
2，打開〈三國演義〉，看屬性有沒有 dg-publish 和 dg-home（第 ${pageOf(PublishFlag)}、${pageOf(HomeFlag)} 頁）。
3，Ctrl／Cmd + P，Publish All。
4，回 Forestry 看 Publish history，等最上面那一筆不再是 Building。
5，如果是 Failed：照第 ${pageOf(SlugFix)} 頁關掉 Simple note URLs。
6，再發布一次，等 Published，打開網址。
按一下：第一次 Failed 是正常的（原因在第 ${pageOf(SlugFail)} 頁），照第 5 步關掉再發布就好。如果你先關了這個開關，第一次就會是 Published，直接跳到第 6 步打開網址。
最後一下：打開網址，首頁是〈三國演義〉就過關。關掉之後還是 Failed，先回外掛設定確認開關真的關了；外掛設定沒有顯示 Connected，回第 1 步重新貼 Garden Key。`],
  [EditAgain, `83:30–87:30
小練習，4 分鐘，也當作休息：改一句，再發布一次。步驟在步驟手冊 prompts.md 的〈小練習〉。
1，打開〈三國演義〉，在最後加一句你自己的話，例如「這是我的三國筆記」。
2，Ctrl／Cmd + P，Publish All。
3，回 Publish history，等最上面那一筆變成 Published（狀態怎麼看，第 ${pageOf(PublishStatus)} 頁）。
4，重新整理你的網址，看那句有沒有出現。
按一下：看到新句子，就是網站更新了；沒變，先等半分鐘再重新整理，可能還在 Building。做完的同學起來走走、喝水。`],
  [Section4, `83:00–83:30
第四章：更新與檢查。之後每次改卡都是同一套：改、發布、看狀態、從首頁點一遍。先做一個小練習，再做最後一個練習。`],
  [PublishFlag, `26:30–29:00
連好了，先打開〈三國演義〉看最上面：兩條 --- 中間有兩行，dg-publish: true 和 dg-home: true。這一塊叫屬性，英文是 Frontmatter，是寫給程式看的設定，Obsidian 會把它顯示成屬性面板。這頁看第一行 dg-publish，下一頁看 dg-home。
dg-publish 是「要公開」的勾。左邊是你的知識庫，五張卡，三張打勾、兩張沒勾；中間像一個篩子，打勾的才放行。
按一下：卡上的勾是什麼？上面這排：它就是 Obsidian 屬性面板裡 dg-publish 的勾選框（中間是實際畫面），也等於原始檔開頭寫 dg-publish: true。在屬性面板打勾，和自己打這一行，結果一樣。
按一下：按發布之後，網站上只出現打勾的三張。箭頭上寫著：按發布才送出。
按一下：沒勾的〈我的草稿〉〈上課筆記〉留在你的電腦，不會上傳。
最後一下：勾了 dg-publish，還要按發布才會上網站。反過來說，勾了又發布，任何拿到網址的人都看得到，私人的東西不要勾。〈三國演義〉已經勾好了；其他卡要不要公開，第三章再挑。
來源：https://docs.forestry.md/getting-started/01-getting-started/ 、https://obsidian.md/help/properties`],
  [FrontmatterCheck, `50:30–52:30
挑卡的第一件事：新卡發布前先看屬性，決定它要不要公開。
第三堂我們用 eli5 把 人物/劉備.md 改寫成 5 歲小孩聽得懂的版本，存成 劉備-5歲版.md。改寫時，Codex 可能把開頭的屬性一起抄過去。
按一下：如果 5 歲版的屬性也有 dg-publish: true，它也會被發布。
按一下：結果是一發布，網站上會多一張〈劉備-5歲版〉，和原本的〈劉備〉並排，讀者可能搞不清楚哪張才對。
按一下：5 歲版那行被綠線劃掉，下面網站上那張也跟著淡掉：不想公開，就在屬性取消勾選，或刪掉那一行，下次 Publish All 之後網站上就不會有它。第三堂的 eli5 提示詞最後一句是「新檔不要加 dg-publish。」，所以 5 歲版通常本來就沒有這行；Codex 沒照做才會出現。
最後一下：改寫出來的卡，可能連 dg-publish 一起抄過去，所以發布前先看一眼。要公開、卻缺勾的卡怎麼補，下一頁。`],
  [AddFlag, `52:30–54:00
反過來的情況：要公開，卡上卻沒有勾。第三堂時間軸 Skill 產出的 整理/時間軸.md 就是這樣，開頭直接是一段 HTML，沒有屬性，所以它不會被發布。
按一下：不用自己打：打開那張卡，Ctrl／Cmd + P，選 Digital Garden: Add publish flag。
按一下：屬性就多了一個 dg-publish，已經打勾，就是第 ${pageOf(PublishFlag)} 頁那個勾。指令清單裡也有 Remove publish flag，用來拿掉；在屬性面板取消勾選也可以。
最後一下：練習 3-1 就用這個指令，替時間軸補上勾。`],
  [Practice31, `54:00–62:00
練習 3-1，8 分鐘：讓第三堂的時間軸卡上線。步驟在步驟手冊 prompts.md 練習 3-1。
1，打開 整理/時間軸.md，看屬性。
2，沒有 dg-publish 的話，Ctrl／Cmd + P，執行 Digital Garden: Add publish flag。
3，Publish All，等 Publish history 變 Published。
4，打開你的網址，後面接 /整理/時間軸/。
按一下：看到橫向時間軸就過關。看到 404，意思是「找不到頁面」：網站上沒有這一頁。在我們的網站上，點了是 404，多半是那張卡沒勾，或勾了還沒發布、還沒等到 Published，回第 2、3 步補上。下一頁看時間軸在網站上的樣子。`],
  [HomeFlag, `29:00–30:00
第二行 dg-home: true：指定網站首頁。剛才連上 Forestry 時，外掛請你選首頁，選的就是〈三國演義〉；教材裡它本來就有這一行。沒有首頁也發布得出去，但打開網址只會看到一串筆記清單，外掛會顯示 Live, no home page（外掛 2.103.0 的說明文字）。
按一下：打開網址，最後面是一個斜線，也就是網站的第一頁，顯示的就是〈三國演義〉。
最後一下：整個網站只放一張 dg-home。如果兩張卡都寫了 dg-home，哪一張會變成首頁就說不準。`],
  [NavPage, `64:30–69:00
第一次來的讀者可能不知道從哪開始，所以做一張導覽頁，人物、事件的連結都放在這裡。
左邊是 整理/知識庫導覽.md：屬性有 dg-publish: true，下面三個路標。時間連到 [[時間軸]]，人物連到每張人物卡，事件連到每張關係卡。導覽頁是一般的 Markdown 筆記，這些 [[連結]] 在網站上都點得開。下面那行橘色字：〈三英戰呂布〉先不放，留給練習 4 當新卡。導覽頁可以自己手打，也可以請 Codex 做，提示詞在 prompts.md 練習 3-2。
右上：再打開〈三國演義〉，在最後一行加 [[知識庫導覽]]。首頁連到導覽頁，讀者才點得到其他卡。這個紫色連結，指的就是左邊標題列也是紫色的那張導覽頁。
接著一項一項按，對清單。清單上的編號，和圖上黃框旁的編號是同一個：
按一下：1，導覽頁有 dg-publish: true，左邊黃框 1 那行。
按一下：2，首頁最後一行連到 [[知識庫導覽]]，紫色箭頭從這個連結指到左邊的導覽頁。
按一下：3，黃框 3 裡，導覽頁連到的每張卡都要勾 dg-publish。連到的卡不會自動一起發布：外掛只送出有勾的卡，導覽頁連到一張沒勾的卡，網站上點那個連結就是 404。教材原本的 12 張卡都已經勾好。還沒勾的，通常是第三堂新增的〈白門樓〉〈草船借箭〉，和你第二堂自己寫的卡；時間軸在練習 3-1 已經勾好了。怎麼找出沒勾的卡，練習 3-2 再做。
按一下：〈劉備-5歲版〉沒有公開，除非你本來就想公開它。
最後一下：放進導覽頁的卡，也要各自勾 dg-publish 才會上網站。`],
  [PublishCommand, `30:00–31:00
屬性看過了，現在發布。發布要用命令面板：按 Ctrl／Cmd + P，打 garden，會列出 Digital Garden 的所有指令。這是講師的實際畫面，外掛 2.103.0。第二行 Add publish flag 標著「挑卡時再用」，第三章第 ${pageOf(AddFlag)} 頁再用。
按一下：1，第一行 Publish All Notes Marked for Publish：一次發布所有勾了 dg-publish 的卡。今天的練習都用它，後面簡稱 Publish All。
按一下：2，往下有 Publish Active Note，只發布打開的這一張。
最後一下：練習 2 只要用 Publish All。
來源：https://docs.forestry.md/getting-started/02-commands/`],
  [HtmlTest, `62:00–64:30
這是範例網站上的〈時間軸〉，網址是 glowing-clearing.forestry.md/整理/時間軸/。它和第三堂 Skill 產出的 時間軸.md 是同一種寫法：一段 HTML 畫成橫向時間軸，下面一段「來源卡」。範例網站多補了幾張卡，所以有 12 件事；你第三堂做的是 6 件，畫面會短一點。
按一下：1，HTML 照常顯示。模板預設允許筆記裡寫 HTML（markdown-it 的 html: true），所以第三堂 Skill 產出的 HTML 可以直接發布。
按一下：2，事件名稱是純文字，點不了，這是對的；想點到人物和事件卡，下一頁做導覽頁。網站的內文欄比較窄，一開始只看得到前面幾件，右邊那件被切到：用觸控板往右滑，或拖曳時間軸下方的捲軸，就看得到後面的事件。發布後實際滑一次，確認每件都在。
按一下：3，下面的來源卡也只寫檔名純文字，沒有做成連結，所以不會點到 404。這是第三堂在 SKILL.md 補的規則。如果你的時間軸裡還有 <a href> 連結，重跑一次 Skill，或手動把那幾個 <a> 拿掉。
畫面是 2026-10-30 從 Obsidian 外掛發布到 Forestry 後擷取，時間軸頁和其他 29 頁都確認打得開。`],
  [HtmlLinks, `（課後自讀，上課不講。）
時間軸是一段 HTML，想在裡面放連結，要知道這件事。回想第 ${pageOf(BuildStep)} 頁：[[連結]] 是建置時轉換的，但它只轉換一般的 Markdown 文字，HTML 區塊裡的 [[ ]] 不會被轉換。
第一種：在 HTML 裡寫 [[劉備]]。網站上會變成什麼樣子？
按一下：原樣顯示兩對中括號，點不了。這是講師另一張測試卡的本機建置結果。
按一下：第二種：寫成連到 .md 檔的 <a href="../關係/桃園結義.md">。
按一下：看起來像連結，能不能點開要看模板版本。講師之前用舊版 Skill 排出的時間軸，在當時的模板上點下去是 404；新版模板會試著換成網站網址，但卡片沒發布一樣 404。結果會因版本而不同，所以我們不靠它。
按一下：第三種：純文字，「第 1 回：關係/桃園結義」。
按一下：不能點，但正常顯示，不會 404。
最後一下：人名、來源卡用純文字；人物連結放在導覽頁。這就是今天網站的設計：時間軸用來看事件順序，可以點的連結都放在導覽頁。SKILL.md 裡的兩條規則：人名用純文字，不用 [[連結]]；來源卡只寫檔名純文字，不做連結。想讓讀者點得到來源卡，就在時間軸下面、HTML 區塊外，另外用一般的 [[桃園結義]] 列一行，那一行會正常轉換。`],
  [Practice32, `69:00–83:00
練習 3-2，14 分鐘：做導覽頁，讓讀者從首頁點得到每張卡。兩段提示詞都在步驟手冊 prompts.md 練習 3-2，右上角就是連結，在筆電上複製：${PROMPTS_URL}
1. 做導覽頁：在三國人物知識庫資料夾打開 Codex，貼上：
「請在 整理/ 新增 知識庫導覽.md。分成時間、人物、事件三段：時間那段只放 [[時間軸]]；人物那段用 [[連結]] 列出 人物/ 裡的每張卡；事件那段用 [[連結]] 列出 關係/ 裡的每張卡，但先不要放〈三英戰呂布〉，練習 4 再加。只連到已有的卡，不要新增卡片，也不要改別的檔案。開頭加上 dg-publish: true。寫入前先給我看。」
按一下：看過預覽：事件那段沒有三英戰呂布，也沒有知識庫裡找不到的卡，再回「可以」。講師做的導覽頁放在線上，可以對照：https://github.com/Chrouos/AI-workshop-slides/blob/main/examples/aw-04-sample-output/%E7%9F%A5%E8%AD%98%E5%BA%AB%E5%B0%8E%E8%A6%BD.md
2. 打開〈三國演義〉，在最後一行加 [[知識庫導覽]]。
3. 找出還沒勾的卡。在同一個 Codex 貼上：
「列出 整理/知識庫導覽.md 連到的每張卡，每張一行，寫出它開頭有沒有 dg-publish: true。只列清單，不要修改任何檔案。」
按一下：拿清單去核對：打開標「沒有」的卡，看屬性，確定 Codex 沒看錯。要公開的，打開那張卡按 Ctrl／Cmd + P，執行 Digital Garden: Add publish flag；不想公開的，回導覽頁把那個連結刪掉。每張卡公不公開，由你自己決定（第 ${pageOf(FrontmatterCheck)} 頁）。
按一下：4. Ctrl／Cmd + P，執行 Publish All Notes Marked for Publish，等 Publish history 變 Published 再打開網址。成功的樣子：從首頁點到知識庫導覽，再點到時間軸和每張卡，每一頁都打得開；導覽頁上每個連結都點得開，包括你剛補勾的卡。點了是 404，回第 3 步查那張卡。
講師實跑（2026-10-24，Codex 0.154.0，在範例知識庫的副本上跑）：導覽頁的預覽確實沒放三英戰呂布，回「可以」才寫入；清單標出〈白門樓〉〈草船借箭〉沒有 dg-publish，其他都有，也沒改到任何檔案。每個人的清單會不一樣，例如第二堂自己寫的卡。
時間軸裡的連結怎麼處理，見第 ${pageOf(HtmlTest)} 頁。`],

  [Practice4, `87:30–101:30
練習 4，14 分鐘：自己檢查。步驟在步驟手冊 prompts.md 練習 4。
1. 公開〈三英戰呂布〉：練習 3-2 故意沒把它放進導覽頁，它也還沒有 dg-publish。打開它，執行 Digital Garden: Add publish flag；在導覽頁的事件那段加上 [[三英戰呂布]]；再執行 Publish All Notes Marked for Publish。
2. 等到 Published：打開 Forestry 儀表板的 Publish history，最上面那一筆變成 Published 再往下。
3. 打開自己的網址（忘了就看第 ${pageOf(GardenLive)} 頁）。只從首頁開始點，不直接打卡片的網址，這樣才知道讀者從首頁點不點得到。下面這排就是要走的路線：首頁 → 導覽頁 → 三英戰呂布。三站現在是白的，代表還沒點過。
按一下：每一站打得開就變綠；三站都綠，點到新卡，就完成。
最後一下：點不到，紅框掛在出問題的那一站下面，常見兩種。左邊，導覽頁上沒有新連結：可能是改了導覽頁還沒發布，或還沒等到 Published 就去看；下一頁照四個檢查一步一步查。右邊，點新卡是 404：先查〈三英戰呂布〉有沒有勾 dg-publish。補好之後，再發布一次，等到 Published，再從首頁點一次。`],
  [NotUpdated, `101:30–104:00
發布了，網站卻沒變：照順序查四個地方。四項都是前面用過的，這頁只排順序。右邊的畫面是示意，實際畫面依版本略有不同。
1. 有沒有按發布？Obsidian 按 Ctrl／Cmd + P，搜尋 garden publish。
按一下：2. Forestry 收到了嗎？Publish history 最上面那一筆的時間，和你按發布的時間對得上，就是收到了。沒有新的一筆，回第 1 步，或到外掛設定看是不是還顯示 Connected。
按一下：3. 那一筆的狀態（第 ${pageOf(PublishStatus)} 頁）。Building 就再等；Published 就往第 4 步；Failed 點右邊箭頭看原因，對照第 ${pageOf(SlugFail)} 頁。
按一下：4. 前面都對，網站還是舊的？瀏覽器可能還留著舊頁面。按 Ctrl／Cmd + Shift + R，略過快取重新載入，或開無痕視窗看。
最後一下：從第 1 步往下查，不要跳步。`],
  [FinalResult, `104:00–106:30
最後對一下成果。右邊三行是今天第三、四章的練習放上去的，剛才練習 4 從首頁點過一遍，點得到的就打勾。左邊是範例網站的時間軸，大家的事件數和外觀可能不一樣。
按一下：練習 3-1，時間軸。
按一下：練習 3-2，知識庫導覽。
按一下：練習 4，三英戰呂布。還沒打勾的，照第 ${pageOf(NotUpdated)} 頁的四個檢查一項一項查，課後再補也可以。
最後一下：三項都打勾，今天的網站就完成了。範例多了幾張卡和〈劉備的故事線〉，課後想對照，網址在第 ${pageOf(FinalSite)} 頁的參考列。`],
  [CourseRecap, `106:30–109:00（109:00–120:00 問答）
四堂課走一圈。上面是四個成果：大綱、知識庫、時間軸、網站。
按一下：RAG 這條線。第一堂知道 Web Search 是一種 RAG；第二堂在自己的知識庫查資料、附出處；第三堂的時間軸只照卡片上寫的回目和年份排，沒寫的不補；今天，卡片上寫的出處會跟著卡片一起發布到網站上。
按一下：Obsidian 這條線。第一堂只預告；第二堂安裝、連結、畫關係圖；第三堂用卡片上的回目排出時間軸；今天用 Digital Garden 發布。
按一下：Skills 這條線。第一堂預告 AGENTS.md；第三堂安裝熱門 Skill、自己寫一個；今天把 Skill 的產出放上網站。
最後一下：四堂課都在擴充同一個三國知識庫，每一堂都用上一堂的成果。後面兩頁是參考資料，再後面是附錄，課後有興趣再看。109:00 之後的時間留給大家發問。謝謝大家這四堂課。`],
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
]);

export const notes: (string | undefined)[] = deck.map(page => NOTES.get(page));

export default deck satisfies Page[];
