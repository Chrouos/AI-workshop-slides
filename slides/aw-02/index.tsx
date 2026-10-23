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
const VAULT_ZIP_URL = 'https://raw.githubusercontent.com/Chrouos/AI-workshop-slides/main/examples/aw-02-vault/%E4%B8%89%E5%9C%8B%E4%BA%BA%E7%89%A9%E7%9F%A5%E8%AD%98%E5%BA%AB.zip';
const DECK_SITE = 'chrouos.github.io/AI-workshop-slides';
const GH = 'https://github.com/Chrouos/AI-workshop-slides/blob/main/examples';
const PROMPTS_URL = `${GH}/aw-02-lab/prompts.md`;
// The frozen sample outline: for students who missed lesson 1, and the shared reference of practice 3.
const SAMPLE_OUTLINE_URL = `${GH}/aw-02-lab/%E4%B8%89%E5%9C%8B%E6%BC%94%E7%BE%A9%E5%A4%A7%E7%B6%B1.md`;
const CHECK3_URL = `${GH}/aw-02-check/%E5%85%88%E6%A0%B8%E5%B0%8D%E9%80%99%E4%BB%BD%E5%9B%9E%E7%AD%94.md`;
const CHECK4_URL = `${GH}/aw-02-check/%E8%AC%9B%E5%B8%AB%E7%9A%84ASCII%E9%97%9C%E4%BF%82%E5%9C%96.md`;

// ---------- Frame ----------

const Title = ({ children }: { children: ReactNode }) => (
  <h1 style={{ fontFamily: '"Libre Baskerville", Georgia, "Times New Roman", serif', fontSize: 132, fontWeight: 400, lineHeight: 1.17, letterSpacing: '-0.035em', maxWidth: 1500, margin: 0, color: ink, whiteSpace: 'pre-line' }}>{children}</h1>
);

// With a source, the footer's left side names where the page's idea comes from.
const Footer = ({ source }: { source?: ReactNode }) => {
  const { current, total } = useSlidePageNumber();
  return (
    <div style={{ position: 'absolute', left: 144, right: 144, bottom: 56, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 32, borderTop: '1px solid #E7E5E4', paddingTop: 22, fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', fontSize: 22, fontWeight: 400, color: quiet }}>
      {source ? <span style={{ whiteSpace: 'nowrap' }}><strong style={{ fontWeight: 600, color: muted }}>參考</strong>｜{source}</span> : <span>AI 協作課｜第 2 堂 Obsidian 與 RAG</span>}
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

// Prompts are copied from aw-02-lab/prompts.md on GitHub (outside the vault, so Codex never reads them).
// Sits top right, under the chapter route bar.
const PromptsCopy = ({ step }: { step: string }) => (
  <a href={PROMPTS_URL} target="_blank" rel="noreferrer" style={{ position: 'absolute', top: 168, right: 144, display: 'flex', alignItems: 'center', gap: 18, color: muted, textDecoration: 'none' }}>
    <span style={{ textAlign: 'right', fontSize: 24, lineHeight: 1.4 }}>複製提示詞<br /><strong style={{ color: amber, fontFamily: mono }}>prompts.md</strong> {step}</span>
    <img src={promptsQr} alt="第二堂 prompts.md 的 QR code" style={{ width: 120, height: 120, display: 'block', background: '#FFFFFF', border: `1px solid ${rule}`, padding: 5 }} />
  </a>
);

// A file on GitHub the class opens on their laptops (the deck is open there too).
const FileLink = ({ href, children }: { href: string; children: ReactNode }) => (
  <a href={href} target="_blank" rel="noreferrer" style={{ fontFamily: mono, fontSize: 26, color: amber, fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: 6 }}>{children}</a>
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

const Shell = ({ children, top = 112, chapter, enterChapter = false, source }: { children: ReactNode; top?: number; chapter?: Chapter; enterChapter?: boolean; source?: ReactNode }) => (
  <div className="aw2-deck" style={{ width: '100%', height: '100%', boxSizing: 'border-box', position: 'relative', display: 'flex', flexDirection: 'column', background: 'var(--osd-bg)', color: 'var(--osd-text)', fontFamily: 'var(--osd-font-body)', padding: `${top}px 144px 126px` }}>
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

// One region of a screenshot, enlarged: (x, y, w, h) in the image's own pixels, drawn `scale`
// times its native size. Used where the whole screenshot would be too small to read.
const Crop = ({ src, natW, natH, x, y, w, h, scale, alt }: { src: string; natW: number; natH: number; x: number; y: number; w: number; h: number; scale: number; alt: string }) => (
  <div style={{ position: 'relative', width: Math.round(w * scale), height: Math.round(h * scale), overflow: 'hidden' }}>
    <img src={src} alt={alt} style={{ position: 'absolute', left: -x * scale, top: -y * scale, width: natW * scale, height: natH * scale, maxWidth: 'none', display: 'block' }} />
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

// A piece pinned at a fixed spot relative to a picture (a Screenshot's image box). Used to keep
// a callout in the same <Step> as the marker it explains, so both land on one click.
const Pin = ({ style, children }: { style: CSSProperties; children: ReactNode }) => (
  <div style={{ position: 'absolute', ...style }}>{children}</div>
);

// A callout pinned to the right of the picture, `top` px below the image's top edge.
const Beside = ({ top, gap = 64, width = 468, children }: { top: number; gap?: number; width?: number; children: ReactNode }) => (
  <Pin style={{ left: `calc(100% + ${gap}px)`, top, width }}>{children}</Pin>
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
    <In i={4} style={{ position: 'absolute', left: 144, bottom: 170, fontSize: 28, color: muted }}>筆電打開簡報：<strong style={{ fontFamily: mono, color: ink }}>{DECK_SITE}</strong></In>
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
  <Shell source={'維基文庫《三國演義》第 1–21 回 zh.wikisource.org/wiki/三國演義'}>
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
              <StepPath d="M742 230 C820 230 880 240 939 221" i={2} />
              <StepPath d="M742 250 C850 262 1040 268 1109 221" i={3} />
              <StepPath d="M742 270 C900 290 1200 290 1279 221" i={4} />
              <StepPath d="M742 290 C960 312 1370 310 1449 221" i={5} />
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
      <AgendaRow i={2} n={3} kind="search" result="核對 AI 的回答（練習 3）" time="70–97 分" page={Section3} />
      <AgendaRow i={3} n={4} kind="graph" result="核對過的關係圖（練習 4）" time="97–120 分" page={Section4} />
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
  <Shell chapter={1} source={'Obsidian 說明：資料怎麼儲存 obsidian.md/help/data-storage'}>
    <Eyebrow>筆記庫（Obsidian 介面叫「儲存庫」）</Eyebrow>
    <Heading>儲存庫（Vault）</Heading>
    <Lead>一個本機資料夾；每張卡是一個 Markdown（.md）檔案</Lead>
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
  <Shell chapter={1} source={'Obsidian 說明：內部連結 obsidian.md/help/links'}>
    <Eyebrow>雙向連結</Eyebrow>
    <Heading>Wikilink：[[ ]] 格式的內部連結</Heading>
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
  <Shell chapter={1} source={'Obsidian 說明：反向連結 obsidian.md/help/plugins/backlinks'}>
    <Eyebrow>反向連結（Backlinks）</Eyebrow>
    <Heading>反向連結（Backlinks）</Heading>
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
  <Shell chapter={1} source={'Obsidian 說明：內部連結 obsidian.md/help/links；快速切換 obsidian.md/help/plugins/quick-switcher'}>
    <Eyebrow>還沒建立的卡</Eyebrow>
    <Heading>未解析連結（Unresolved Link）</Heading>
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
            <g fill="none" stroke={rule} strokeWidth="3"><DrawPath i={1} d="M760 70 C700 100 400 100 330 128" /></g>
            <InG i={2}><CardPile cx={330} kind="人物" count="5 張" names="劉備、曹操、孫權…" holds="寫一個人" fill={amberSoft} stroke={amber} /></InG>
          </Layer>
          <Step duration={STEP_MS}><Layer h={420} label="勢力卡：3 張，蜀漢、曹魏、東吳，寫一方陣營">
            <g fill="none" stroke={rule} strokeWidth="3"><StepPath d="M816 70 V126" /></g>
            <g className="aw2-build" style={buildDelay(2)}><CardPile cx={816} kind="勢力" count="3 張" names="蜀漢、曹魏、東吳" holds="寫一方陣營" fill={blueSoft} stroke={blue} /></g>
          </Layer></Step>
          <Step duration={STEP_MS}><Layer h={420} label="關係卡：3 張，桃園結義、煮酒論英雄、赤壁之戰，寫一件事裡誰和誰">
            <g fill="none" stroke={rule} strokeWidth="3"><StepPath d="M872 70 C930 100 1230 100 1300 128" /></g>
            <g className="aw2-build" style={buildDelay(2)}><CardPile cx={1300} kind="關係" count="3 張" names="桃園結義、煮酒…" holds="寫一件事：誰和誰" fill={sage} stroke={okGreen} /></g>
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
  <Shell chapter={1} source={'維基文庫《三國演義》第 1、21、49–50 回 zh.wikisource.org/wiki/三國演義'}>
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
  <Shell chapter={1} source={'Obsidian 說明：內部連結 obsidian.md/help/links；反向連結 obsidian.md/help/plugins/backlinks'}>
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
              {/* A dashed line can't use the dash-offset draw itself, so a solid copy draws inside a mask. */}
              <mask id="aw2-linkwalk-back" maskUnits="userSpaceOnUse" x="0" y="0" width="1632" height="430">
                <g fill="none" stroke="#FFFFFF" strokeWidth="12"><StepPath d="M1372 322 C1372 400 860 400 830 330" /></g>
              </mask>
              <path d="M1372 322 C1372 400 860 400 830 330" fill="none" stroke={link} strokeWidth="5" strokeDasharray="12 9" mask="url(#aw2-linkwalk-back)" />
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
  <Shell chapter={1} source={'Obsidian 說明：下載與安裝 obsidian.md/help/install'}>
    <PracticeEyebrow time="15 分鐘（四步）">練習 1｜安裝</PracticeEyebrow>
    <Heading>練習（安裝）：下載 Obsidian</Heading>
    <Fit>
      <In i={0}>
        <Screenshot src={downloadPage} aspect={1400 / 490} width={1100} url="obsidian.md/download" caption="官方下載頁（2026-10 擷取）" alt="Obsidian 下載頁上的紫色 Download 按鈕">
          {/* Callouts sit to the right of the picture; marker 2 lands with its own callout. */}
          <Steps>
            <Beside top={57}><Callout n={1} title={<Path size={31}>obsidian.md/download</Path>} /></Beside>
            <Step duration={STEP_MS}>
              <StepMark n={2} x={13} y={14} w={74} h={52} badge="right" />
              <Beside top={143}><Callout n={2} title="按紫色的下載鈕" /></Beside>
            </Step>
            <Step duration={STEP_MS}><Beside top={229}><Callout n={3} title="照畫面安裝，打開" detail="免費，不用註冊" /></Beside></Step>
          </Steps>
        </Screenshot>
      </In>
    </Fit>
  </Shell>
);

const FirstLaunch: Page = () => (
  <Shell chapter={1} source={'Obsidian 說明：語言設定 obsidian.md/help/User+interface/Language+settings；管理儲存庫 obsidian.md/help/manage-vaults'}>
    <PracticeEyebrow time="練習 1 第 2 步">練習 1｜安裝</PracticeEyebrow>
    <Heading>第一次打開，先改繁體中文</Heading>
    <Fit z={1.15}>
      <In i={0}>
        <Screenshot src={firstLaunch} aspect={1520 / 470} width={1360} caption="Obsidian 起始畫面（實際擷取）" alt="Obsidian 起始畫面：建立新的儲存庫、開啟資料夾為儲存庫、連接至 Obsidian Sync 和最下方的語言選單">
          <RegionMark n={1} i={2} x={6} y={83} w={92} h={14} badge="right" />
          {/* Callouts sit under the caption; marker 2 lands with its own callout. */}
          <Steps>
            <Pin style={{ left: 0, top: 'calc(100% + 73px)', width: 680 }}><Callout n={1} title="最下面選繁體中文" /></Pin>
            <Step duration={STEP_MS}>
              <StepMark n={2} x={1.5} y={29} w={97} h={20} badge="right" />
              <Pin style={{ left: 733, top: 'calc(100% + 73px)', width: 680 }}><Callout n={2} title="等一下用「開啟資料夾為儲存庫」" /></Pin>
            </Step>
          </Steps>
        </Screenshot>
      </In>
      <div style={{ height: 74 }} />
    </Fit>
  </Shell>
);

const GetVault: Page = () => (
  <Shell chapter={1} source={'Obsidian 說明：管理儲存庫 obsidian.md/help/manage-vaults'}>
    <PracticeEyebrow time="練習 1 第 3 步">練習 1｜安裝</PracticeEyebrow>
    <Heading>下載並打開三國筆記庫</Heading>
    <Fit>
      <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: 56, alignItems: 'start' }}>
        <In i={0} style={{ background: amberSoft, borderTop: `5px solid ${amber}`, padding: '20px 24px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: 28, fontWeight: 600 }}>下載三國筆記庫</div>
          <a href={VAULT_ZIP_URL} target="_blank" rel="noreferrer" aria-label="開啟 GitHub 上的三國人物知識庫 ZIP">
            <img src={vaultQr} alt="三國人物知識庫 ZIP 的 GitHub 下載 QR code" style={{ width: 250, height: 250, display: 'block', margin: '14px auto 0', imageRendering: 'pixelated' }} />
          </a>
          <a href={VAULT_ZIP_URL} download="三國人物知識庫.zip" style={{ display: 'inline-block', marginTop: 10, padding: '8px 20px', background: amber, color: '#FFFFFF', fontSize: 24, fontWeight: 600, textDecoration: 'none' }}>在筆電上按這裡下載</a>
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
  <Shell chapter={1} source={'Obsidian 說明：管理儲存庫 obsidian.md/help/manage-vaults'}>
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
  <Shell chapter={2} source={'Obsidian 說明：內部連結 obsidian.md/help/links'}>
    <PracticeEyebrow time="25 分鐘（五步）">練習 2｜合併</PracticeEyebrow>
    <Heading>練習（合併）：大綱放進整理資料夾</Heading>
    <div style={{ position: 'absolute', top: 176, right: 144, textAlign: 'right', fontSize: 24, lineHeight: 1.5, color: muted }}>沒有大綱的人，下載範例<br /><FileLink href={SAMPLE_OUTLINE_URL}>三國演義大綱.md</FileLink></div>
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
              <polygon points="650,176 628,164 628,188" fill={amber} />
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

// Stacked: the outline excerpt drawn 1500 px wide (1.04× native, text ~25 px), then the card it
// opens shown as two enlarged crops (its title and first line) so both read on a projector.
const CL_W = 1500;
const CL_LINK_X = Math.round(CL_W * 0.963); // centre of 劉備 at the end of line 1

const ClickLiubei: Page = () => (
  <Shell chapter={2} source={'Obsidian 說明：內部連結 obsidian.md/help/links'}>
    <PracticeEyebrow time="練習 2 第 2 步">練習 2｜合併</PracticeEyebrow>
    <Heading>點大綱的劉備，跳到人物卡</Heading>
    <Fit>
      <In i={0}>
        <Screenshot src={outlineCh1} aspect={1440 / 230} width={CL_W} caption="整理/三國演義大綱，第 1 回｜實際畫面" alt="大綱第 1 回裡的劉備是深紫色連結">
          <RegionMark n={1} i={2} x={94} y={38} w={4.6} h={17} badge="above" drop={14} />
        </Screenshot>
      </In>
      {/* One click: the arrow draws down from 劉備, then the card it opens lands. */}
      <div style={{ position: 'relative', height: 212, marginTop: 16 }}>
        <Steps>
          <Step duration={STEP_MS}>
            <svg viewBox="0 0 1632 240" style={{ position: 'absolute', left: 0, top: -59, width: 1632, height: 240, overflow: 'visible' }} aria-hidden="true">
              <g fill="none" stroke={amber} strokeWidth="4"><StepPath d={`M${CL_LINK_X} 4 V144 H1262`} /></g>
              <g className="aw2-build" style={buildDelay(4)}><polygon points="1246,144 1264,134 1264,154" fill={amber} /></g>
            </svg>
            <div className="aw2-build" style={{ ...buildDelay(4), position: 'absolute', left: 0, top: 0 }}>
              <div style={{ background: '#FFFFFF', border: `1px solid ${rule}`, boxShadow: '0 10px 30px rgba(28,25,23,0.08)', padding: '14px 14px 14px', display: 'grid', gap: 10 }}>
                <Crop src={liubeiCard} natW={1460} natH={800} x={0} y={10} w={1340} h={95} scale={0.9} alt="劉備卡的標題：劉備" />
                <Crop src={liubeiCard} natW={1460} natH={800} x={0} y={420} w={1340} h={50} scale={0.9} alt="劉備卡第一句：劉備，字玄德，是中山靖王之後，家住涿縣樓桑村" />
              </div>
              <Caption>人物/劉備｜講師的卡（節選）</Caption>
            </div>
          </Step>
        </Steps>
      </div>
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={24}>大綱和人物卡接上了</Takeaway></Step></Steps>
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
  <Shell chapter={2} source={'Obsidian 說明：反向連結 obsidian.md/help/plugins/backlinks'}>
    <Eyebrow>合併之後</Eyebrow>
    <Heading>劉備的反向連結變多了</Heading>
    <Fit>
      <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: '500px 1fr', gap: 120, alignItems: 'center', justifyContent: 'center' }}>
        <In i={0}>
          <Screenshot src={backlinksPane} aspect={600 / 750} width={500} caption="劉備卡右側的反向連結｜實際畫面" alt="劉備卡的反向連結面板：已連結本筆記的檔案 41，三國演義 4，三國演義大綱 24" />
        </In>
        <div>
          <div style={{ fontSize: 30, color: muted, marginBottom: 6 }}>劉備被提到幾處（不是卡片張數）</div>
          <BigCount label="合併前" value="17 處" tone="plain" />
          {/* Each click lands a number and the spot in the panel it comes from (pinned over the 500 × 625 screenshot). */}
          <Steps>
            <Step duration={STEP_MS}>
              <BigCount label="合併後" value="41 處" tone="ok" />
              <Pin style={{ left: 0, top: 0, width: 500, height: 625 }}><StepMark n={1} x={4} y={2.5} w={93} h={8} badge="right" /></Pin>
            </Step>
            <Step duration={STEP_MS}>
              <BigCount label="來自大綱" value="24 處" tone="amber" />
              <Pin style={{ left: 0, top: 0, width: 500, height: 625 }}><StepMark n={2} x={4} y={84} w={93} h={8} badge="right" /></Pin>
            </Step>
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
  <Shell chapter={2} source={'Obsidian 說明：內部連結 obsidian.md/help/links'}>
    <PracticeEyebrow time="練習 2 第 3 步">練習 2｜找淡色連結</PracticeEyebrow>
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

// One bar of how often a not-yet-carded name shows up in the outline. On the live page the
// bars grow from zero in order (i), right after the list lands.
const NameBar = ({ name, n, i, max = 32 }: { name: string; n: number; i: number; max?: number }) => {
  const live = useIsActivePage();
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr 70px', alignItems: 'center', gap: 16, height: 56 }}>
      <span style={{ fontSize: 31, color: link }}>{name}</span>
      <div style={{ height: 30, background: surface }}><div className={live ? 'aw2-fill' : undefined} style={{ width: `${(n / max) * 100}%`, height: '100%', background: linkFaint, transformOrigin: 'left center', animationDelay: live ? enterDelay(i, 260) : undefined }} /></div>
      <span style={{ fontSize: 28, color: quiet, textAlign: 'right' }}>{n}</span>
    </div>
  );
};

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
  <Shell chapter={2} source={'Obsidian 說明：內部連結 obsidian.md/help/links；原文：維基文庫《三國演義》第 5、19 回 zh.wikisource.org/wiki/三國演義'}>
    <PracticeEyebrow time="練習 2 第 4 步">練習 2｜整理連結</PracticeEyebrow>
    <Heading>淡色連結：補卡還是先留著</Heading>
    <Fit>
      <div style={{ display: 'grid', gridTemplateColumns: '640px 1fr', gap: 72, alignItems: 'center' }}>
        <In i={0}>
          <SmallLabel>大綱裡出現最多次、還沒有卡的人</SmallLabel>
          <div style={{ marginTop: 18 }}>
            <NameBar name="呂布" n={32} i={0} />
            <NameBar name="董卓" n={15} i={1} />
            <NameBar name="袁術" n={11} i={2} />
            <NameBar name="李傕" n={9} i={3} />
            <NameBar name="郭汜" n={7} i={4} />
            <NameBar name="袁紹" n={7} i={5} />
          </div>
        </In>
        <div style={{ display: 'grid', gap: 22 }}>
          <Steps>
            <Step duration={STEP_MS}><Decision n={1} when="先數次數" then="搜尋「呂布」" eg={<>Cmd+Shift+F（Windows 是 Ctrl+Shift+F）</>} /></Step>
            <Step duration={STEP_MS}><Decision n={2} when="常出現、原文夠寫" then="記下來，第三堂補卡" eg="例：呂布 32 次，第 5、19 回都有他" /></Step>
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
  <Shell chapter={2} source={'維基文庫《三國演義》第 5 回 zh.wikisource.org/wiki/三國演義/第005回'}>
    <PracticeEyebrow time="練習 2 第 5 步">練習 2｜寫卡</PracticeEyebrow>
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
  <Shell chapter={3} source={'Lewis et al. 2020, Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks, arXiv:2005.11401'}>
    <Eyebrow>RAG＝檢索增強生成</Eyebrow>
    <Heading>檢索增強生成（RAG）</Heading>
    <Lead>先找相關卡片，連同問題交給模型，再根據資料回答</Lead>
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

// A callout beside the terminal: undo the terminal's mono / pre / light-text styles.
const CODEX_CALLOUT: CSSProperties = { left: 1156, width: 476, fontFamily: 'var(--osd-font-body)', whiteSpace: 'normal', color: ink, lineHeight: 'normal' };

const OpenInCodex: Page = () => (
  <Shell chapter={3} source={'Codex CLI 文件 developers.openai.com/codex/cli；斜線指令 developers.openai.com/codex/cli/slash-commands'}>
    <PracticeEyebrow time="3 分鐘">準備｜終端機（Windows 是 PowerShell）</PracticeEyebrow>
    <Heading>用 Codex 打開筆記庫</Heading>
    <PromptsCopy step="準備" />
    <Fit>
      {/* The callouts sit right of the terminal (pinned to this box) and land with the line they describe. */}
      <In i={0} style={{ position: 'relative' }}>
        <Terminal title="終端機（示意，路徑依電腦而定）" width={1100} size={32}>
          <div><Typed>$</Typed>{' cd '}<span style={{ color: '#E9B650', fontFamily: 'var(--osd-font-body)', fontSize: 27 }}>← 空格，再把資料夾拖進來</span></div>
          <Steps>
            <Pin style={{ ...CODEX_CALLOUT, top: 40 }}><Callout n={1} title="cd 進「三國人物知識庫」" /></Pin>
            <Step duration={STEP_MS}>
              <div><Typed>$</Typed>{' codex'}</div>
              <Pin style={{ ...CODEX_CALLOUT, top: 120 }}><Callout n={2} title="打 codex" /></Pin>
            </Step>
            <Step duration={STEP_MS}>
              <div><AskLine>› 列出這個資料夾第一層的資料夾，不要讀或修改任何檔案。</AskLine></div>
              <Pin style={{ ...CODEX_CALLOUT, top: 200 }}><Callout n={3} title="請它列出資料夾" /></Pin>
            </Step>
            <Step duration={STEP_MS}>
              <div style={{ background: 'rgba(233,182,80,0.18)', outline: '3px solid #E9B650', margin: '6px -12px 0', padding: '0 12px' }}>{'人物  勢力  原文  整理  模板  關係'}</div>
              <Pin style={{ ...CODEX_CALLOUT, top: 280 }}><Callout n={4} title="六個資料夾都在" detail="只列出「三國人物知識庫」：/quit，再 cd 進裡面那層" /></Pin>
            </Step>
          </Steps>
        </Terminal>
      </In>
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
  <Shell chapter={3} source={'Gao et al. 2023, Enabling Large Language Models to Generate Text with Citations, arXiv:2305.14627'}>
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
  <Shell chapter={3} source={'Lewis et al. 2020, arXiv:2005.11401（檢索）；搜尋工具 rg（ripgrep）github.com/BurntSushi/ripgrep'}>
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
  <Shell chapter={3} source={'Lewis et al. 2020, Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks, arXiv:2005.11401'}>
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
  <Shell chapter={3} source={'Gao et al. 2023, Enabling Large Language Models to Generate Text with Citations, arXiv:2305.14627'}>
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
  <Shell chapter={3} source={'Shuster et al. 2021, Retrieval Augmentation Reduces Hallucination in Conversation, arXiv:2104.07567'}>
    <Eyebrow>同一題，問兩次｜實跑</Eyebrow>
    <Heading>沒有筆記和有筆記，差在哪</Heading>
    <Fit>
      {/* Input first: both prompts show on arrival; the answers land on clicks, left then right. */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48 }}>
        <AnswerPanel title="沒有筆記" sub="在空資料夾問" tone="plain">
          <PromptQuote>曹操參與哪場戰役？</PromptQuote>
          <Steps>
            <Step duration={STEP_MS}>
              <AnswerBox>官渡之戰（200年）、赤壁之戰（208年）<br />濮陽、下邳、潼關之戰等</AnswerBox>
              <StatusLine ok={false}>沒有檔名，查不回去</StatusLine>
            </Step>
          </Steps>
        </AnswerPanel>
        <AnswerPanel title="有筆記" sub="在筆記庫問" tone="ok">
          <PromptQuote>依這座筆記庫，曹操參與哪場戰役？只根據 .md 卡片回答，每個說法附上檔名和一句卡片原句；筆記沒寫的就說找不到，不要自己補。</PromptQuote>
          <Steps>
            <Step duration={STEP_MS}>
              <AnswerBox>赤壁之戰<br /><span style={{ fontFamily: mono, fontSize: 25, color: okGreen }}>人物/曹操.md、關係/赤壁之戰.md＋原句</span></AnswerBox>
              <StatusLine ok>每一句都查得到</StatusLine>
            </Step>
          </Steps>
        </AnswerPanel>
      </div>
      <div style={{ marginTop: 20, textAlign: 'center', fontSize: 26, color: quiet }}>兩次問法不同：右邊多了範圍、檔名和原句的要求</div>
      <Steps>
        <Step duration={STEP_MS}><div style={{ marginTop: 10, textAlign: 'center', fontSize: 32, color: amber, fontWeight: 600 }}>「官渡之戰」：筆記庫裡一個字都沒有</div></Step>
      </Steps>
    </Fit>
  </Shell>
);

const LinksHelp: Page = () => (
  <Shell chapter={3} source={'Obsidian 說明：內部連結 obsidian.md/help/links'}>
    <Eyebrow>為什麼連結要寫好</Eyebrow>
    <Heading>來源追溯（Provenance）</Heading>
    <Lead>從回答的檔名打開卡片，再沿連結核對相關內容</Lead>
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
  <Shell chapter={3} source={'Barnett et al. 2024, Seven Failure Points When Engineering a RAG System, arXiv:2401.05856'}>
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
  <Shell chapter={3} source={'Barnett et al. 2024, arXiv:2401.05856；Liu et al. 2023, Lost in the Middle, arXiv:2307.03172'}>
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
              <AnswerBox>列出 <strong>7 項</strong>：滎陽（第 6 回）、<br />濮陽（第 11 回）、下邳（第 19 回）……</AnswerBox>
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
    <svg viewBox="0 0 464 300" style={{ display: 'block', width: '100%', height: 'auto', marginTop: 14 }} role="img" aria-label={alt}>{children}</svg>
    <div style={{ fontSize: 30, lineHeight: 1.4, marginTop: 12 }}>{caption}</div>
  </div>
);

const CheckThree: Page = () => (
  <Shell chapter={3} source={'Gao et al. 2023（核對引文）, arXiv:2305.14627；Es et al. 2023, Ragas, arXiv:2309.15217'}>
    <Eyebrow>核對回答｜用剛才的實跑結果</Eyebrow>
    <Heading>核對回答的三件事</Heading>
    <Fit>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 36 }}>
        <Steps>
          <In i={0} style={{ display: 'grid' }}><CheckPanel label="1｜檔案在嗎" caption="這座筆記庫裡有這個檔嗎？" alt="回答寫的出處 原文/第011回.txt，在筆記庫的原文資料夾裡找得到，打勾">
            <Folder x={6} y={14} w={262} h={276} fill={surface} stroke={faint} />
            <text x="24" y="78" fontSize="28" fontFamily={mono} fill={ink}>原文/</text>
            <text x="24" y="122" fontSize="25" fontFamily={mono} fill={quiet}>第001回.txt</text>
            <text x="24" y="154" fontSize="25" fontFamily={mono} fill={quiet}>⋮</text>
            <rect x="16" y="168" width="242" height="46" fill={sage} stroke={okGreen} strokeWidth="2" />
            <text x="24" y="200" fontSize="25" fontFamily={mono} fontWeight="600" fill={ink}>第011回.txt</text>
            <text x="24" y="256" fontSize="23" fontFamily={mono} fill={quiet}>⋮ 共 21 回＋節選</text>
            <rect x="282" y="74" width="178" height="100" fill="#FFFFFF" stroke={okGreen} strokeWidth="2" />
            <text x="371" y="112" textAnchor="middle" fontSize="24" fill={quiet}>回答寫的</text>
            <text x="371" y="152" textAnchor="middle" fontSize="23" fontFamily={mono} fill={ink}>第011回.txt</text>
            <path d="M282 150 C268 166 266 182 260 190" fill="none" stroke={okGreen} strokeWidth="3" />
            <PopG i={3}><OkDot x={440} y={50} /></PopG>
          </CheckPanel></In>
          <Step duration={STEP_MS}><CheckPanel label="2｜原句在嗎" caption="卡片裡找得到那句話嗎？" alt="大綱第 11 回寫了呂布在濮陽設計誘敵，使曹操中伏敗退，打勾">
            <DocShape x={6} y={20} w={432} h={266} />
            <text x="28" y="72" fontSize="26" fill={quiet}>大綱 第 11 回</text>
            <rect x="20" y="104" width="404" height="54" fill={amberSoft} />
            <text x="32" y="142" fontSize="30" fill={ink}>呂布在濮陽設計誘敵，</text>
            <text x="32" y="222" fontSize="30" fill={ink}>使曹操中伏敗退</text>
            <g className="aw2-build" style={buildDelay(3)}><OkDot x={436} y={36} /></g>
          </CheckPanel></Step>
          <Step duration={STEP_MS}><CheckPanel label="3｜有沒有多寫" caption="回答說的，大綱都寫了嗎？" alt="回答說曹操攻打呂布，大綱第 13 回寫了袁紹派兵助曹操攻打呂布，沒有多寫，打勾">
            <DocShape x={6} y={20} w={432} h={266} />
            <text x="28" y="72" fontSize="26" fill={quiet}>大綱 第 13 回</text>
            <text x="28" y="124" fontSize="28" fill={ink}>袁紹派兵助曹操</text>
            <text x="28" y="170" fontSize="28" fill={ink}>攻打呂布</text>
            <text x="28" y="250" fontSize="27" fill={okGreen}>回答：曹操「攻打呂布」</text>
            <g className="aw2-build" style={buildDelay(3)}><OkDot x={436} y={36} /></g>
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

// One row of the shared 7-item answer: compact, so all seven fit beside the checks.
const AnswerRow = ({ n, battle, ch, head = false }: { n: string; battle: string; ch: string; head?: boolean }) => (
  <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr 250px', alignItems: 'center', background: head ? raised : '#FFFFFF', borderBottom: `1px solid ${rule}`, fontSize: head ? 24 : 28, fontWeight: head ? 600 : 400, color: head ? muted : ink, lineHeight: 1.35, padding: '9px 0' }}>
    <span style={{ paddingLeft: 20, color: head ? muted : quiet }}>{n}</span>
    <span>{battle}</span>
    <span>{ch}</span>
  </div>
);

const Practice3: Page = () => (
  <Shell chapter={3} source={'維基文庫《三國演義》第 1–21 回 zh.wikisource.org/wiki/三國演義'}>
    <PracticeEyebrow time="6 分鐘（兩步）">練習 3｜RAG</PracticeEyebrow>
    <Heading>練習（RAG）：核對 7 項回答</Heading>
    <PromptsCopy step="練習 3" />
    <PillRow>
      <Pill tag="定位">範例大綱</Pill>
      <Pill tag="期望輸出">每列打勾或問號</Pill>
      <Pill tag="限制">只看大綱</Pill>
    </PillRow>
    <Fit>
      <div style={{ display: 'grid', gridTemplateColumns: '1020px 1fr', gap: 64, alignItems: 'center' }}>
        <In i={1}>
          <SmallLabel>曹操在第 1–21 回的戰役（Codex 實跑，全文 7 項）</SmallLabel>
          <div style={{ marginTop: 10, borderTop: `3px solid ${rule}` }}>
            <AnswerRow head n="#" battle="戰役" ch="回目" />
            <AnswerRow n="1" battle="討伐董卓、汜水關與虎牢關之戰" ch="第 5 回" />
            <AnswerRow n="2" battle="滎陽追擊董卓之戰" ch="第 6 回" />
            <AnswerRow n="3" battle="徐州攻陶謙之戰" ch="第 10–12 回" />
            <AnswerRow n="4" battle="濮陽與呂布交戰" ch="第 11–12 回" />
            <AnswerRow n="5" battle="攻打呂布" ch="第 13 回" />
            <AnswerRow n="6" battle="淯水攻打張繡、敗師" ch="第 16–18 回" />
            <AnswerRow n="7" battle="攻打呂布、下邳圍城與白門樓之戰" ch="第 18–19 回" />
          </div>
        </In>
        <div style={{ display: 'grid', gap: 22 }}>
          <Steps>
            <div style={{ fontSize: 31, fontWeight: 600 }}>每一列問三件事</div>
            <Step duration={STEP_MS}><StatusLine ok size={30}>檔案在嗎</StatusLine></Step>
            <Step duration={STEP_MS}><StatusLine ok size={30}>原句在嗎</StatusLine></Step>
            <Step duration={STEP_MS}><StatusLine ok size={30}>有沒有多寫</StatusLine></Step>
          </Steps>
          <In i={2} style={{ marginTop: 18, display: 'grid', gap: 10, fontSize: 24, color: muted }}>
            <span>回答：<FileLink href={CHECK3_URL}>先核對這份回答.md</FileLink></span>
            <span>對照：<FileLink href={SAMPLE_OUTLINE_URL}>三國演義大綱.md</FileLink></span>
          </In>
        </div>
      </div>
      <Steps>
        <Step duration={STEP_MS}>
          <div style={{ marginTop: 30, fontSize: 31, textAlign: 'center' }}><strong style={{ color: amber }}>第 1 列打問號：</strong>大綱第 5 回只寫曹操發檄文，上陣的是關羽和劉關張</div>
        </Step>
      </Steps>
    </Fit>
  </Shell>
);

const Practice3Ask: Page = () => (
  <Shell chapter={3} source={'維基文庫《三國演義》第 5 回 zh.wikisource.org/wiki/三國演義/第005回'}>
    <PracticeEyebrow time="練習 3 第 2 步">練習 3｜追問</PracticeEyebrow>
    <Heading>追問 Codex：原句是哪一句</Heading>
    <PromptsCopy step="練習 3" />
    <Fit>
      <In i={0}>
        <Terminal title="Codex（2026-10-24 實跑，範例大綱，回覆節錄）" width={1632} size={29}>
          <div><AskLine>› 大綱第 5 回哪一句寫了曹操在汜水關或虎牢關上陣打仗？</AskLine></div>
          <div><AskLine>  只根據 整理/三國演義大綱.md，引用原句；沒寫就說沒寫。</AskLine></div>
          <Steps>
            <Step duration={STEP_MS}>
              <div style={{ marginTop: 14 }}>沒寫。第 5 回原句是：</div>
              <div><Dim>{'> [[曹操]]在陳留散家財招募義兵，發檄文召集各路諸侯討伐[[董卓]]……'}</Dim></div>
              <div><Dim>{'> 聯軍在汜水關由[[關羽]]溫酒斬華雄，之後在虎牢關由[[劉備]]、[[關羽]]、[[張飛]]合力戰退[[呂布]]。'}</Dim></div>
              <div>這句沒有寫曹操在汜水關或虎牢關上陣打仗。</div>
            </Step>
          </Steps>
        </Terminal>
      </In>
      <Steps>
        <Step duration={STEP_MS}><Takeaway marginTop={32}>追問一句，就看出哪項是它自己補的</Takeaway></Step>
        <Step duration={STEP_MS}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 20, marginTop: 30 }}>
            <span style={{ fontSize: 28, color: muted }}>有時間，自己問一題：</span>
            <QChip>白門樓上，劉備對曹操說了什麼原話？</QChip>
            <QChip>關羽在第 1 到 21 回斬了哪些人？</QChip>
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
    <svg viewBox="0 0 464 260" style={{ display: 'block', width: '100%', height: 'auto', marginTop: 14 }} role="img" aria-label={alt}>{children}</svg>
    <div style={{ fontSize: 30, lineHeight: 1.4, marginTop: 10 }}>{caption}</div>
  </div>
);

const MapPerson = ({ x, y, name, r = 54, size = 34 }: { x: number; y: number; name: string; r?: number; size?: number }) => (
  <g><circle cx={x} cy={y} r={r} fill={amberSoft} stroke={amber} strokeWidth="2" /><text x={x} y={y + size * 0.36} textAnchor="middle" fontSize={size} fill={ink}>{name}</text></g>
);

const MapBox = ({ x, y, w = 128, h = 72, label, fill = surface, stroke = rule, size = 34 }: { x: number; y: number; w?: number; h?: number; label: string; fill?: string; stroke?: string; size?: number }) => (
  <g><rect x={x} y={y} width={w} height={h} fill={fill} stroke={stroke} strokeWidth="2" /><text x={x + w / 2} y={y + h / 2 + size * 0.36} textAnchor="middle" fontSize={size} fill={ink}>{label}</text></g>
);

const PointsLines: Page = () => (
  <Shell chapter={4} source={'Hogan et al. 2021, Knowledge Graphs, ACM Computing Surveys, arXiv:2003.02320'}>
    <Eyebrow>知識圖譜（Knowledge Graph）</Eyebrow>
    <Heading>知識圖譜（Knowledge Graph）</Heading>
    <Lead>把人物與事件當節點，把有根據的關係當邊</Lead>
    <Fit>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 36 }}>
        <Steps>
          <MiniMap label="國文｜三國" caption="人物和事件" alt="劉備、關羽連到桃園結義是綠線；曹操連到桃園結義是橘色虛線，打問號">
            <g fill="none" stroke={okGreen} strokeWidth="5"><DrawPath i={2} d="M92 104 L192 180" /><DrawPath i={2} d="M372 104 L272 180" /></g>
            <path d="M232 116 V178" stroke={amber} strokeWidth="5" strokeDasharray="9 7" />
            <MapPerson x={58} y={58} name="劉備" />
            <MapPerson x={232} y={58} name="曹操" />
            <MapPerson x={406} y={58} name="關羽" />
            <MapBox x={132} y={180} w={200} label="桃園結義" fill={sage} stroke={okGreen} />
            <PopG i={5}><AskMark x={266} y={150} r={20} /></PopG>
          </MiniMap>
          <Step duration={STEP_MS}>
            <MiniMap label="歷史｜一個單元" caption="前因後果" alt="原因到事件是綠線，事件到結果是橘色虛線，打問號">
              <MapBox x={0} y={104} label="原因" />
              <MapBox x={168} y={104} label="事件" fill={sage} stroke={okGreen} />
              <MapBox x={336} y={104} label="結果" />
              <g fill="none" stroke={okGreen} strokeWidth="5"><StepPath d="M128 140 H168" i={1} /></g>
              <g className="aw2-build" style={buildDelay(4)}>
                <path d="M296 140 H336" stroke={amber} strokeWidth="5" strokeDasharray="9 7" />
                <AskMark x={316} y={84} r={20} />
              </g>
            </MiniMap>
          </Step>
          <Step duration={STEP_MS}>
            <MiniMap label="自然｜食物鏈" caption="誰吃誰" alt="草、兔子、老鷹，兩條都是綠線">
              <MapBox x={0} y={104} label="草" />
              <MapBox x={168} y={104} label="兔子" />
              <MapBox x={336} y={104} label="老鷹" />
              <g fill="none" stroke={okGreen} strokeWidth="5"><StepPath d="M128 140 H168" i={1} /><StepPath d="M296 140 H336" i={3} /></g>
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

// The whole graph (1600 × 1393) is too small to read at slide size, so it stays as an overview
// with markers; each click also opens a zoomed crop of the marked region beside it.
const GV_W = 640; // overview width; image is 557 px tall
const GV_ZOOM_W = 932;
const GV_ZOOM_H = 520;
type GvZoom = { n: number; title: string; x: number; y: number; scale: number; alt: string };
const GV_ZOOMS: GvZoom[] = [
  { n: 1, title: '大圓：三國演義大綱', x: 529, y: 407, scale: 1.7, alt: '放大：中間的大圓三國演義大綱，四周的線都連到它' },
  { n: 2, title: '淡色小點：還沒有卡', x: 290, y: 100, scale: 1.7, alt: '放大：淡色小點，例如李肅、臧霸、陳登、華雄，都還沒有卡' },
  { n: 3, title: '右下一群：講師的卡', x: 854, y: 970, scale: 1.25, alt: '放大：曹操、孫權、劉備、張飛、關羽、赤壁之戰、煮酒論英雄等講師的卡，彼此連得很密' },
];

// A marker over the overview for one zoom region, in % of the image.
const GvMark = ({ z }: { z: GvZoom }) => (
  <StepMark n={z.n} badge={z.n === 1 ? 'right' : 'left'} x={(z.x / 1600) * 100} y={(z.y / 1393) * 100} w={(GV_ZOOM_W / z.scale / 1600) * 100} h={(GV_ZOOM_H / z.scale / 1393) * 100} />
);

const GraphView: Page = () => (
  <Shell chapter={4} source={'Obsidian 說明：關聯圖 obsidian.md/help/plugins/graph'}>
    <Eyebrow>Obsidian 內建的圖</Eyebrow>
    <Heading>關聯圖（Graph View）</Heading>
    <Fit>
      <div style={{ display: 'grid', gridTemplateColumns: `${GV_W}px 1fr`, gap: 56 }}>
        <In i={0}>
          <Screenshot src={vaultGraph} aspect={1600 / 1393} width={GV_W} caption="合併大綱後的關聯圖｜實際畫面" alt="關聯圖：中間的大點是三國演義大綱，四周一圈淡色小點是還沒有卡的人，右下一群深色點是講師的卡" />
        </In>
        {/* Each click: a marker on the overview, and that region enlarged here (later panels cover earlier ones). */}
        <div style={{ position: 'relative', height: 590 }}>
          <Steps>
            {GV_ZOOMS.map(z => (
              <Step key={z.n} duration={STEP_MS}>
                <Pin style={{ left: -(GV_W + 56), top: 0, width: GV_W, height: Math.round(GV_W * 1393 / 1600) }}><GvMark z={z} /></Pin>
                <Pin style={{ left: 0, top: 0, width: GV_ZOOM_W + 4, height: 590, background: 'var(--osd-bg)' }}>
                  <Callout n={z.n} title={z.title} />
                  <div style={{ marginTop: 18, border: '2px solid #E9B650', background: '#FFFFFF', boxSizing: 'border-box', width: GV_ZOOM_W + 4, height: GV_ZOOM_H + 4 }}>
                    <Crop src={vaultGraph} natW={1600} natH={1393} x={z.x} y={z.y} w={GV_ZOOM_W / z.scale} h={GV_ZOOM_H / z.scale} scale={z.scale} alt={z.alt} />
                  </div>
                </Pin>
              </Step>
            ))}
          </Steps>
        </div>
      </div>
    </Fit>
  </Shell>
);

// The local-graph crop (610 × 860) drawn 600 px tall; 劉備 and 桃園結義 node centres in drawn px.
const LG_H = 600;
const LG_W = Math.round(610 * LG_H / 860);

const LocalGraph: Page = () => (
  <Shell chapter={4} source={'Obsidian 說明：關聯圖 obsidian.md/help/plugins/graph'}>
    <Eyebrow>局部關聯圖｜一條線</Eyebrow>
    <Heading>圖譜中的邊（Edge）</Heading>
    <Fit>
      <div style={{ display: 'grid', gridTemplateColumns: `${LG_W}px 1fr`, gap: 80, alignItems: 'center' }}>
        <In i={0}>
          <div style={{ position: 'relative', width: LG_W, height: LG_H }}>
            <Screenshot src={taoyuanGraph} aspect={610 / 860} width={LG_W} alt="劉備的局部關聯圖，放大劉備到桃園結義這一條線" />
            <svg viewBox={`0 0 ${LG_W} ${LG_H}`} style={{ position: 'absolute', inset: 0, width: LG_W, height: LG_H, overflow: 'visible' }} aria-hidden="true">
              <g fill="none" stroke={amber} strokeWidth="8" strokeLinecap="round"><DrawPath i={2} d="M133 57 L245 539" /></g>
              <InG i={1}><SvgChip x={160} y={22} w={110} h={48} label="劉備" size={28} fill="#FFFFFF" stroke={amber} /></InG>
              <InG i={6}><SvgChip x={262} y={500} w={160} h={48} label="桃園結義" size={28} fill="#FFFFFF" stroke={amber} /></InG>
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
  <Shell chapter={4} source={'Edge et al. 2024, From Local to Global: A Graph RAG Approach, arXiv:2404.16130'}>
    <PracticeEyebrow time="14 分鐘（四步）">練習 4｜知識圖譜</PracticeEyebrow>
    <Heading>練習（圖譜）：畫 ASCII 關係圖</Heading>
    <PromptsCopy step="練習 4" />
    <Fit>
      <In i={0} style={{ background: '#FFFFFF', border: `1px solid ${rule}`, borderLeft: `8px solid ${amber}`, padding: '16px 32px', fontSize: 28, lineHeight: 1.5 }}>
        <div>請把〈桃園結義〉〈煮酒論英雄〉相關的人物畫成 ASCII 關係圖。</div>
        <div>每條線一行，格式：人物 ──關係── 人物（來源：檔名）。</div>
        <div>只畫卡片裡寫得出原句的線，不要改任何檔案。</div>
      </In>
      <Steps>
        <Step duration={STEP_MS}>
          <div style={{ marginTop: 20 }}>
            <Terminal title="講師的實跑回覆（2026-10-17，全文 9 條）" width={1632} size={26}>
              <div className="aw2-build" style={buildDelay(0, 160)}>劉備 ──結義兄弟（劉備為兄）── 關羽（來源：關係/桃園結義.md）</div>
              <div className="aw2-build" style={buildDelay(1, 160)}>劉備 ──結義兄弟（劉備為兄、張飛為弟）── 張飛（來源：關係/桃園結義.md）</div>
              <div className="aw2-build" style={buildDelay(2, 160)}>關羽 ──結義兄弟（三兄弟）── 張飛（來源：關係/桃園結義.md）</div>
              <div className="aw2-build" style={buildDelay(3, 160)}>曹操 ──請劉備青梅煮酒、共論天下英雄── 劉備（來源：關係/煮酒論英雄.md）</div>
              <div className="aw2-build" style={buildDelay(4, 160)}>曹操 ──與劉備並稱天下英雄── 劉備（來源：關係/煮酒論英雄.md）</div>
              <div className="aw2-build" style={buildDelay(5, 160)}>關羽 ──與張飛一同按劍守護劉備── 劉備（來源：關係/桃園結義.md）</div>
              <div className="aw2-build" style={buildDelay(6, 160)}>張飛 ──與關羽一同按劍守護劉備── 劉備（來源：關係/桃園結義.md）</div>
              <div className="aw2-build" style={buildDelay(7, 160)}>劉備 ──聯手── 孫權（來源：關係/煮酒論英雄.md）</div>
              <div className="aw2-build" style={buildDelay(8, 160)}>孫權 ──對抗── 曹操（來源：關係/煮酒論英雄.md）</div>
            </Terminal>
          </div>
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
  <TRow cols={CHECK_COLS} size={28} tint={ok ? '#FFFFFF' : amberSoft} cells={[line, <Path size={24}>{card}</Path>, <span style={{ color: ok ? ink : amber }}>{quote}</span>, <span className="aw2-build" style={{ display: 'inline-block', ...buildDelay(2) }}><Verdict ok={ok} /></span>]} />
);

const CheckLines: Page = () => (
  <Shell chapter={4} source={'維基文庫《三國演義》第 1、21 回 zh.wikisource.org/wiki/三國演義'}>
    <PracticeEyebrow time="練習 4 第 2 步">練習 4｜第 1 輪：講師的線</PracticeEyebrow>
    <Heading>逐線核對：每條線找原句</Heading>
    <div style={{ position: 'absolute', top: 176, right: 144, textAlign: 'right', fontSize: 24, lineHeight: 1.5, color: muted }}>講師的 9 條線<br /><FileLink href={CHECK4_URL}>講師的ASCII關係圖.md</FileLink></div>
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
          <Step duration={STEP_MS}><div style={{ marginTop: 24, fontSize: 31 }}>講師的 9 條線：<strong style={{ color: okGreen }}>7 條有原句</strong>，<strong style={{ color: amber }}>2 條打問號</strong></div></Step>
        </Steps>
      </div>
    </Fit>
  </Shell>
);

const AskBack4: Page = () => (
  <Shell chapter={4} source={'維基文庫《三國演義》第 21、43–44 回 zh.wikisource.org/wiki/三國演義'}>
    <PracticeEyebrow time="練習 4 第 3 步">練習 4｜追問</PracticeEyebrow>
    <Heading>追問 Codex：這句撐得住嗎</Heading>
    <PromptsCopy step="練習 4" />
    <Fit>
      <In i={0}>
        <Terminal title="Codex（2026-10-24 實跑，回覆節錄）" width={1632} size={26}>
          <div><AskLine>› 下面的線，請到它寫的來源卡找出撐得住它的原句，逐條引用；找不到就說找不到，不要改任何檔案。</AskLine></div>
          <div><AskLine>  劉備 ──聯手── 孫權（來源：關係/煮酒論英雄.md）</AskLine></div>
          <div><AskLine>  孫權 ──對抗── 曹操（來源：關係/煮酒論英雄.md）</AskLine></div>
          <Steps>
            <Step duration={STEP_MS}>
              <div style={{ marginTop: 12 }}>1. 劉備 ──聯手── 孫權：找到可支撐的原句：</div>
              <div><Dim>{'   「到了 [[赤壁之戰]]，劉備已經站在 [[孫權]] 那一邊對抗曹操」'}</Dim></div>
              <div><Dim>{'   但原句沒有直接使用「聯手」一詞，是描述劉備站在孫權一方。'}</Dim></div>
              <div>2. 孫權 ──對抗── 曹操：找到可直接支撐的原句：</div>
              <div><Dim>{'   「劉備已經站在 [[孫權]] 那一邊對抗曹操」'}</Dim></div>
            </Step>
          </Steps>
        </Terminal>
      </In>
      <Steps>
        <Step duration={STEP_MS}><Takeaway marginTop={32}>它說「找到」，撐不撐得住由你判斷</Takeaway></Step>
      </Steps>
    </Fit>
  </Shell>
);

// One paragraph of the outline as Obsidian shows it; `linked` turns the event name into a link.
const OutlinePara = ({ linked }: { linked: boolean }) => (
  <div style={{ background: '#FFFFFF', border: `1px solid ${rule}`, padding: '22px 30px', fontSize: 30, lineHeight: 1.7 }}>
    <span style={{ color: link, textDecoration: 'underline' }}>曹操</span>在陳留散家財招募義兵……聯軍在汜水關由<span style={{ color: link, textDecoration: 'underline' }}>關羽</span>
    <span style={{ outline: `3px solid ${linked ? okGreen : amber}`, outlineOffset: 4, color: linked ? link : ink, textDecoration: linked ? 'underline' : 'none' }}>溫酒斬華雄</span>，之後在虎牢關由<span style={{ color: link, textDecoration: 'underline' }}>劉備</span>、<span style={{ color: link, textDecoration: 'underline' }}>關羽</span>、<span style={{ color: link, textDecoration: 'underline' }}>張飛</span>合力戰退<span style={{ color: linkFaint, textDecoration: 'underline' }}>呂布</span>。
  </div>
);

const AddLinksBack: Page = () => (
  <Shell chapter={4} source={'Obsidian 說明：內部連結 obsidian.md/help/links'}>
    <PracticeEyebrow time="練習 4 第 4 步">練習 4｜補連結</PracticeEyebrow>
    <Heading>把自己的關係卡連回大綱</Heading>
    <Fit>
      <div style={{ width: 1400, margin: '0 auto' }}>
        <In i={0}>
          <SmallLabel>補之前：範例大綱第 5 回，「溫酒斬華雄」是黑字（示意）</SmallLabel>
          <div style={{ marginTop: 10 }}><OutlinePara linked={false} /></div>
        </In>
        <Steps>
          <Step duration={STEP_MS}>
            <div style={{ marginTop: 30 }}>
              <SmallLabel color={okGreen}>補之後：打成 [[溫酒斬華雄]]，換成你那張卡的名字</SmallLabel>
              <div style={{ marginTop: 10 }}><OutlinePara linked /></div>
            </div>
          </Step>
          <Step duration={STEP_MS}><Takeaway marginTop={30}>補上 [[ ]]，大綱就接到你的關係卡</Takeaway></Step>
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
  <Shell source={'Codex 文件：Skills developers.openai.com/codex/skills；agentskills.io'}>
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
  <div style={{ fontSize: 25, color: quiet, marginTop: 14 }}>arXiv 編號：到 arxiv.org/abs/ 後面接編號，就能打開論文</div>
);

const ReferencesRag: Page = () => (
  <Shell>
    <Eyebrow>延伸閱讀｜第 3 章用到的論文</Eyebrow>
    <Heading>參考資料（一）：RAG 與核對回答</Heading>
    <RefHint />
    <Fit>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'start' }}>
        <In i={0}>
          <RefGroup label="RAG、附出處">
            <RefItem who="Lewis et al. 2020" where="2005.11401" title="Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks" />
            <RefItem who="Shuster et al. 2021" where="2104.07567" title="Retrieval Augmentation Reduces Hallucination in Conversation" />
            <RefItem who="Gao et al. 2023" where="2305.14627" title="Enabling Large Language Models to Generate Text with Citations" />
          </RefGroup>
        </In>
        <In i={1}>
          <RefGroup label="RAG 的限制、核對">
            <RefItem who="Barnett et al. 2024" where="2401.05856" title="Seven Failure Points When Engineering a Retrieval Augmented Generation System" />
            <RefItem who="Liu et al. 2023" where="2307.03172" title="Lost in the Middle: How Language Models Use Long Contexts" />
            <RefItem who="Es et al. 2023" where="2309.15217" title="Ragas: Automated Evaluation of Retrieval Augmented Generation" />
          </RefGroup>
        </In>
      </div>
    </Fit>
  </Shell>
);

const ReferencesGraph: Page = () => (
  <Shell>
    <Eyebrow>延伸閱讀｜第 1、4 章的論文與文件</Eyebrow>
    <Heading>參考資料（二）：知識圖譜、Obsidian 與原文</Heading>
    <RefHint />
    <Fit>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'start' }}>
        <In i={0}>
          <RefGroup label="知識圖譜">
            <RefItem who="Hogan et al. 2021" where="2003.02320" title="Knowledge Graphs（ACM Computing Surveys）" />
            <RefItem who="Pan et al. 2023" where="2306.08302" title="Unifying Large Language Models and Knowledge Graphs: A Roadmap" />
            <RefItem who="Edge et al. 2024" where="2404.16130" title="From Local to Global: A Graph RAG Approach to Query-Focused Summarization" />
          </RefGroup>
        </In>
        <In i={1}>
          <RefGroup label="Obsidian 說明、原文">
            <RefItem who="Obsidian 說明" where="obsidian.md/help" title="Internal links 內部連結、Backlinks 反向連結" />
            <RefItem who="Obsidian 說明" where="obsidian.md/help" title="Graph view 關聯圖、Manage vaults 管理儲存庫" />
            <RefItem who="維基文庫" where="zh.wikisource.org" title="《三國演義》第 1–21 回全文（筆記庫 原文/ 的來源）" />
          </RefGroup>
        </In>
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
  title: 'aw-02 Obsidian 與 RAG',
  createdAt: '2026-10-17T03:04:26.505Z',
  theme: 'thoughtstream',
};

const deck: Page[] = [
  Cover, LastLesson, TodayGoal, Agenda,
  Section1, VaultFolder, WikiLink, Backlinks, GrayLink, CardTypes, StoryMap, LinkWalk, DownloadObsidian, FirstLaunch, GetVault, VaultCheck,
  Section2, MergeOutline, ClickLiubei, BacklinksReal, GrayReal, GrayDecide, Practice2Card,
  Section3, RagIdea, OpenInCodex, AskWithFiles, RStep, AStep, GStep, WithWithout, LinksHelp, LimitMissing, LimitMiss, CheckThree, Practice3, Practice3Ask,
  Section4, PointsLines, GraphView, LocalGraph, AsciiAsk, CheckLines, AskBack4, AddLinksBack,
  Recap, NextSkills, ReferencesRag, ReferencesGraph,
];

// 1-based page number of a page in this deck (for the agenda).
function pageOf(page: Page) {
  return deck.indexOf(page) + 1;
}

// Speaker notes, keyed by page so they stay aligned with the deck order.
const NOTES = new Map<Page, string>([
  [Cover, `00:00–01:00
今天是四堂課的第二堂：Obsidian 與 RAG。上一堂大家用 Codex 寫出了《三國演義》第 1 到 21 回的大綱，今天把它放進一座三國筆記庫，跟講師準備好的人物卡接起來；接著請 Codex 先查筆記再回答，最後畫一張每條線都有出處的關係圖。
先請大家在自己的筆電打開這份簡報：${DECK_SITE}，點第二堂。今天的下載按鈕、提示詞連結，都在筆電上點；投影的 QR code 用手機掃，只會存到手機。所有教材也列在 https://github.com/Chrouos/AI-workshop-slides/tree/main/examples 。`],
  [LastLesson, `01:00–05:00
先看上一堂的成果。左邊是講師用 Codex 實際跑出來的 三國演義大綱.md：一回一段，人名都寫成 [[劉備]] 這種連結，每段最後一行是出處。
先問大家：這些 [[ ]] 現在連到哪？按一下：哪裡都還沒連到。大綱是單獨一個檔案，旁邊沒有劉備卡，所以劉備是淡色的連結，點下去只會新增一張空白卡。
最後一下：大綱有連結了，但還沒接上人物卡。今天就是要把它放進筆記庫，接上講師準備的人物卡。
補充數字（不用記）：講師這份 21 段、每段都有出處，Codex 跑了 1 分 38 秒；當時的舊提示詞讓它連回目標題裡的人名也加了 [[ ]]，現在的提示詞已經改掉。
第一堂沒來、或大綱不見的同學，用講師的範例大綱：第 ${pageOf(MergeOutline)} 頁右上角有連結（examples/aw-02-lab/三國演義大綱.md），下載後一樣放進筆記庫的「整理」資料夾。練習 3 全班也用這一份對照。`],
  [TodayGoal, `05:00–08:00
左邊是第一堂結束時的樣子：大綱是一個單獨的檔案，裡面的 [[劉備]]、[[曹操]]、[[呂布]] 都是連結，但連到空處，因為還沒有那些卡。
按一下：今天結束時，大綱放進「三國人物知識庫」的「整理」資料夾，大綱裡的劉備、關羽、張飛、曹操，就連到講師寫好的人物卡；人物卡再透過〈桃園結義〉〈煮酒論英雄〉這些關係卡連在一起。
最後一下：今天四個練習，全部在這座筆記庫裡做。`],
  [Agenda, `08:00–10:00
四章、四個練習。第一章認識 Obsidian，練習 1 是安裝、改繁體中文、打開講師的三國筆記庫，10 到 45 分。第二章把大綱放進筆記庫，練習 2 是合併、找淡色連結、自己寫一張關係卡，45 到 70 分。第三章是今天的重點，在筆記庫裡做 RAG，練習 3 是全班核對同一份講師實跑的回答，抓到可疑的那一項再追問 Codex，70 到 97 分。第四章建立知識圖譜，練習 4 是請 Codex 畫 ASCII 關係圖、逐線核對、追問、把自己的關係卡連回大綱，97 分到結束。`],
  [Section1, `10:00–10:30
第一章：認識 Obsidian。三件事：筆記庫是什麼、連結怎麼寫、卡片分幾種。`],
  [VaultFolder, `10:30–13:00
Obsidian 的「儲存庫」，英文 Vault，就是你電腦裡的一個資料夾。這座「三國人物知識庫」有 12 張卡：人物 5 張、勢力 3 張、關係 3 張，共 11 張，再加 1 張入口卡〈三國演義〉。另外的資料夾不算卡：原文/ 放第 1 到 21 回的全文和第 37、38、46 回節選，都是 .txt；整理/ 等一下放大綱；模板/ 放關係卡模板。.md 是純文字檔，用記事本也打得開。Obsidian 繁中介面把筆記庫叫「儲存庫」，是同一個東西。
按一下：Obsidian 打開這個資料夾來寫，看到的就是這些檔案。
按一下：Codex 讀的也是同一個資料夾，不用上傳到任何地方。
最後一下：檔案在你的電腦裡，Codex 也讀得到。這是今天 RAG 能做的前提。官方說明：https://obsidian.md/help/data-storage`],
  [WikiLink, `13:00–15:30
這種雙中括號格式叫 Wikilink，是 Obsidian 內部連結的一種。左邊是你在檔案裡打的字：「拜 [[劉備]] 為兄」，人名包在兩對中括號裡。
按一下：Obsidian 顯示時，中括號會藏起來，劉備變成紫色、有底線的字。
按一下：點一下劉備，就打開 人物/劉備.md。打 [[ 的時候 Obsidian 會跳出選單讓你選卡名，不用整個打完。
最後一下：人名打在 [[ ]] 裡，就連到那張卡。官方說明：https://obsidian.md/help/links`],
  [Backlinks, `15:30–18:00
這頁的術語是「反向連結」，英文 Backlinks：從劉備這張卡回頭看，哪些卡連到了它。中間是劉備。旁邊這幾張卡：三國演義、桃園結義、煮酒論英雄、赤壁之戰、曹操、蜀漢，內文都寫了 [[劉備]]，箭頭都指向他。
按一下：打開劉備卡，右邊的「反向連結」面板會自動列出「已連結本筆記的檔案」。講師的筆記庫裡一共 11 張卡、17 處提到劉備：三國演義 4 處，桃園結義、煮酒論英雄、赤壁之戰各 2 處，曹操 1 處，還有孫權、張飛、關羽、蜀漢、曹魏、東吳 6 張各 1 處。這些數字是講師在筆記庫裡實際數的。
最後一下：誰連到劉備，Obsidian 會自己列出來，你不用回頭在劉備卡裡寫。這就是「雙向」的意思：你只寫一邊，兩邊都看得到。`],
  [GrayLink, `18:00–20:00
連到尚未建立的筆記，叫「未解析連結」（Unresolved Link）。上面：[[劉備]] 有對應的卡，所以是深紫色，點了就打開。
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
練習 1，四頁，一共 15 分鐘。第一步：打開 obsidian.md/download。網頁會自己判斷系統，Windows 顯示 Download for Windows，Mac 顯示 Download for macOS；沒看到就往下捲，在自己的系統那一列按 Universal。
按一下：按紫色的下載鈕。按一下：照畫面安裝。Windows 打開安裝檔按下一步；Mac 打開 .dmg，把 Obsidian 拖進「應用程式」。Obsidian 免費，不用註冊。上一堂結束時已經請大家先下載，裝好的人直接看下一頁。官方說明：https://obsidian.md/help/install`],
  [FirstLaunch, `33:00–36:00
第一次打開會看到這個畫面。標 1 的地方在最下面：語言選單選「繁體中文」，介面會重新整理。
按一下：標 2 的地方，三個選項裡，今天用第二個「開啟資料夾為儲存庫」。現在先不要按「建立新的儲存庫」，下一頁下載完教材再按。官方說明：https://obsidian.md/help/User+interface/Language+settings`],
  [GetVault, `36:00–41:00
在筆電的簡報上按「在筆電上按這裡下載」。手機掃 QR code 只會存到手機，用不到。按鈕和 QR code 連到同一份 ZIP：
${VAULT_ZIP_URL}
1 下載 ZIP。2 解壓縮：Windows 一定要在 ZIP 上按右鍵選「全部解壓縮」，直接雙擊只是預覽，Obsidian 打不開；解壓縮後外面可能多一層同名資料夾，往裡面點一層。Mac 雙擊就會解開。3 回到 Obsidian，按「開啟資料夾為儲存庫」，選「三國人物知識庫」這一層，不要選外層的下載資料夾。
步驟也寫在 prompts.md 的〈練習 1〉：${PROMPTS_URL}`],
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
第一堂沒來、或大綱不見的人：點右上角的「三國演義大綱.md」，GitHub 頁面右上角有下載鈕（Download raw file），存下來再拖進 整理/。這份就是講師的範例大綱：${SAMPLE_OUTLINE_URL}
另外：大綱每段最後的「出處：原文/第001回.txt」，在這座筆記庫裡也找得到。原文/ 已經放了第 1 到 21 回的全文，跟第一堂的檔案一樣，不用從第一堂的資料夾複製。原文是 .txt，Obsidian 預設不顯示 .txt，左邊的 原文/ 看起來是空的；要看原文，用 Finder（Windows 是檔案總管）打開 原文/，按右鍵用「文字編輯」（Windows 是「記事本」）打開。`],
  [ClickLiubei, `50:00–52:30
左邊是講師電腦上合併後的實際畫面：整理/三國演義大綱。標 1 是第 1 回裡的劉備，深紫色，代表找得到卡。
按一下：點它，就打開右邊這張講師的人物卡 人物/劉備。
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
練習 2 第三步，5 分鐘：淡色連結要補卡，還是先留著。
左邊是講師的大綱裡出現最多次、還沒有卡的人：呂布 32 次、董卓 15 次、袁術 11 次、李傕 9 次、郭汜和袁紹各 7 次。你的大綱數字會不一樣，所以先自己數。
按一下，1：按 Cmd+Shift+F（Windows 是 Ctrl+Shift+F）打開搜尋，輸入「呂布」，看「三國演義大綱」那一列有幾處。再搜一個你在大綱裡看到的淡色名字。
按一下，2：常出現、而且原文夠寫一張卡的，記下來。判斷看兩件事：出現幾次，和原文有沒有足夠的段落寫出一張有根據的卡。呂布第 5 回三英戰呂布、第 19 回白門樓都有完整的故事，是好人選；今天先不寫，第三堂用 Skill 照原文補。
按一下，3：只出現一兩次的，先留著。淡色連結不會壞，之後補卡就自動變深色。
做完的標準：你說得出自己大綱裡呂布出現幾處，也替一個淡色名字決定好「補卡」或「先留著」。`],
  [Practice2Card, `61:00–70:00
練習 2 最後一步，9 分鐘：自己寫一張關係卡。條件在上面三個框：定位，從大綱挑一回；期望輸出，照模板寫；限制，原文沒寫的不寫。至少連到兩位有卡的人物。步驟和可以挑的事件都在 prompts.md 的〈練習 2（寫卡）〉：${PROMPTS_URL}
左邊是講師照模板寫的〈三英戰呂布〉，取材第 5 回，是 Obsidian 實際畫面的節選。模板在筆記庫的 模板/關係卡模板.md，一張卡至少要有這幾樣：最上面的「回目」（原文有寫年份才填「年份」）、用完整句子寫的內容、「參與人物」、最後一行「出處」。
按一下，1：打開模板，全選、複製；在左側「關係」資料夾按右鍵，選「新增筆記」，取名就是事件名稱，把模板貼進去。
按一下，2：寫到有卡的人名，前後加兩對中括號，例如 [[劉備]]。打完 [[ 和第一個字，Obsidian 會跳出選單，選人名按 Enter。看範例：紫框的張飛加了 [[ ]]，變成連結；參與人物裡的呂布底下畫虛線，他還沒有卡，照模板寫純文字。
按一下，3：填上回目，例如 5；最後一行寫出處，例如「出處：原文/第005回.txt」。
請挑範例以外的事件，不要寫三英戰呂布和白門樓：第三堂會請 Codex 新增這兩張關係卡，自己手寫的同名卡會撞名。可以挑：第 5 回〈溫酒斬華雄〉，連到關羽、曹操；第 16 回〈轅門射戟〉，連到劉備、關羽、張飛（原文「關、張隨往」，呂布寫純文字）；第 20 回〈許田打圍〉，連到曹操、劉備、關羽（原文第 20 回寫了曹操和天子在許田打獵，雲長想殺曹操，玄德搖頭制止）。
不確定細節就查原文。原文是 .txt，Obsidian 預設不顯示，請用 Finder（Windows 是檔案總管）打開筆記庫的 原文/，那一回按右鍵，用「文字編輯」（Windows 是「記事本」）打開。
寫完怎麼知道成功：打開你連到的人物卡，例如〈關羽〉，右邊的反向連結裡會出現你的新卡。你自己那張卡的反向連結是空的，這是正常的，因為還沒有別的檔連到它；練習 4 最後會把它連回大綱。`],
  [Section3, `70:00–70:30
第三章是今天的重點：在筆記庫裡做 RAG。第一堂講過，Web Search 是 RAG，資料從網路來；今天資料從自己的筆記庫來。`],
  [RagIdea, `70:30–73:00
RAG 是 Retrieval-Augmented Generation，檢索增強生成。三步：
R 檢索：問「依這座筆記庫，曹操參與哪場戰役？」，先在筆記庫裡把相關的卡找出來，例如〈曹操〉和〈赤壁之戰〉。問題加上「依這座筆記庫」，是把範圍限定在我們的卡；曹操卡裡寫到的戰役是赤壁之戰。
按一下，A 增強：把問題和找到的內容一起交給模型，題目多了依據。
按一下，G 生成：照筆記回答，並附上檔名。
最後一下：模型沒變，只是先看了筆記。接下來用 Codex 實際跑一次，三個字母各看一頁，每一頁都對照 Codex 真的做了什麼。來源：https://arxiv.org/abs/2005.11401`],
  [OpenInCodex, `73:00–76:00
這一頁大家一起做，練習 3 的追問和練習 4 都要用。打開終端機（Windows 是 PowerShell）。打 cd 和一個空格，把「三國人物知識庫」資料夾拖進視窗，按 Enter。
按一下：打 codex。第一次在這個資料夾開 Codex，會問你信不信任這個資料夾，選 Yes, continue，跟第一堂一樣。
按一下：貼上「列出這個資料夾第一層的資料夾，不要讀或修改任何檔案。」提示詞在 prompts.md 的〈準備〉：${PROMPTS_URL}
按一下：要看到人物、勢力、原文、整理、模板、關係，可能還有 .obsidian。只列出一個「三國人物知識庫」，就是進到外層了，Windows 的「全部解壓縮」常會這樣：輸入 /quit，cd 進裡面那一層，再打 codex。不要只看 /status 的 Directory，外層和裡層名字一樣，看不出來。
實測（2026-10-24，Codex 0.154.0）：在對的資料夾，它列出 .obsidian、人物、勢力、原文、整理、模板、關係；在多一層的資料夾，它回答「這個資料夾第一層只有一個資料夾：三國人物知識庫」。
沒裝 Codex 或登入不了的同學，跟旁邊的人一組，看他的畫面一起核對，練習 3 的核對不需要 Codex。`],
  [AskWithFiles, `76:00–77:00
講師先示範，同一題貫穿整章。在 Codex 輸入這一整段，這就是講師實跑時用的提示詞：
「依這座筆記庫，曹操參與哪場戰役？只根據 .md 卡片回答，每個說法附上檔名和一句卡片原句；筆記沒寫的就說找不到，不要自己補。」
一次一行：第一行是問題，先把範圍說在前面。按一下：只根據 .md 卡片。按一下：附檔名，再加一句原句，等一下核對比較快。按一下：沒寫就說找不到。
最後一下：附了檔名和原句，才查得回去。接下來三頁，是這一題在講師電腦上的實跑紀錄（2026-10-18，Codex 0.154.0，模型 gpt-5.6-luna，唯讀模式，筆記庫已經放進大綱）。`],
  [RStep, `77:00–78:30
R，檢索。上面這行是 Codex 實際執行的搜尋指令：rg 是一個搜尋工具，意思是在所有 .md 檔裡找「曹操、戰役、戰爭、之戰、大戰」這幾個詞。在 Codex 的畫面上會顯示成「Ran ……」或「Explored」。
按一下，第一階段，搜尋：找到 14 個檔、77 行有對到。最多的是大綱 26 行；練習提示詞 7 行，因為那時候筆記庫裡還放著練習提示詞，裡面也有曹操這題。這點值得停一下：放在筆記庫裡的任何檔案，連練習用的提示詞都會被搜到、拿來當證據，所以提示詞後來整份搬出筆記庫，核對時也要看每一句引文是從哪個檔來的；煮酒論英雄 6 行；赤壁之戰、曹操、曹魏各 5 行；其他 8 個檔一共 23 行，圖上把曹魏和這 8 個檔併成「其他 9 個檔」28 行。
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
同一個問題，問兩次，都是實跑。先看兩次的提示詞原文。左邊：在一個空資料夾裡問 Codex「曹操參與哪場戰役？」，只有問題本身。右邊：在筆記庫裡問。老實說，兩次問法不一樣：右邊多了「依這座筆記庫」、附檔名和原句、找不到就說的要求。所以等一下看到的差別，一半來自筆記，一半來自問法。
按一下：左邊的回答。它憑記憶回答：官渡之戰（200 年）、赤壁之戰（208 年）、濮陽、下邳、潼關之戰等，最後還補一句「若題目只問一場，通常答案是赤壁之戰」。沒有檔名，你沒辦法回去查。課綱說用 ChatGPT 比，也可以：在 ChatGPT 不開搜尋問同一題，結果很像。
按一下：右邊的回答：赤壁之戰，附兩個檔名和原句，每一句都查得到。
最後一下：左邊說的「官渡之戰」，筆記庫裡一個字都沒有。它不一定錯，官渡之戰確實有，但它不是從我們的筆記來的，查不回去。`],
  [LinksHelp, `84:30–86:30
這頁講「來源追溯」，英文 Provenance：從答案往回找，它根據哪個檔案、哪段內容。連結有什麼用？先老實說：實跑時 Codex 是用搜尋找到這些句子，紀錄裡看不到它沿著 [[連結]] 一張一張點過去。連結真正幫上忙的地方，是你查證的時候。
1：回答寫了 人物/曹操.md。按一下，2：打開它，那一句裡的「赤壁之戰」是紫色連結。按一下，3：點下去，就跳到〈赤壁之戰〉這張關係卡，最上面寫著回目 49，第一句就是「曹操收服北方後率大軍南下」。
最後一下：答案有檔名，連結讓它有路可回。卡片連得越完整，你從一個答案查回原句、再查到相關的卡就越快。`],
  [LimitMissing, `86:30–88:00
RAG 的限制一：筆記沒寫的，它找不到。上面是實跑的提示詞原文：「官渡之戰是誰打贏的？請只根據這個筆記庫裡的 .md 卡片回答，附上檔名；筆記沒寫的就說找不到，不要自己補。」它搜尋「官渡、袁紹、曹操」，沒有任何卡提到官渡。
按一下：它的回答是「找不到。筆記庫中的 .md 卡片沒有提到「官渡之戰」或其勝負。」
最後一下：說找不到，是好的回答。剛才空資料夾那一次，它說官渡是曹操最有名的戰役；有了「找不到就說找不到」這條限制，它就不會拿記憶來補。官渡之戰在第 30 回，不在我們第 1 到 21 回的大綱裡。`],
  [LimitMiss, `88:00–90:00
限制二：資料一多，它也會看漏。左邊是剛才那一題的第一次回答：赤壁之戰，還說「筆記中找不到曹操參與其他戰役的明確記載」。可是 R 那一頁看到，大綱裡搜到 26 行，寫了濮陽、兗州、淯水、下邳好幾場仗，它都沒算進去。原因可能是它把問題理解成「最有名的一場」，或結果太多只挑了講師的卡。
按一下：縮小範圍再問一次，實跑提示詞：「再查 整理/三國演義大綱.md：曹操在第 1 到 21 回參與了哪些戰役？每一項附回目和檔名；筆記沒寫的不要補。」黃色標起來的是多加的範圍。右邊這次是 2026-10-24 在範例大綱上實跑（Codex 0.154.0，gpt-5.6-luna，唯讀），它整份大綱讀完，列了 7 項，例如第 6 回滎陽、第 11 回濮陽、第 19 回下邳。同一題講師跑了三次，三次都是 7 項，但內容不一樣：有兩次把第 5 回排除，說大綱沒寫曹操上陣；有一次把第 5 回列了進去。等一下練習 3 用的就是列進去的那一次。
最後一下：改的是範圍：查哪個檔、哪幾回。可是這 7 項也要核對，下一頁先示範怎麼核對。`],
  [CheckThree, `90:00–91:00
核對回答的三件事，用剛才那份 7 項的回答示範兩列，其他留給大家。
1 檔案在嗎：它每一項的檔名寫的是「原文/第011回.txt」這種，是從大綱的出處抄來的。筆記庫的 原文/ 裡第 1 到 21 回都在，第011回.txt 找得到，打勾。原文是 .txt，Obsidian 左邊看不到，要用 Finder 或檔案總管打開 原文/ 看。如果回答裡出現資料夾裡沒有的檔名，例如它寫成第 30 回，那就是第一個要抓的問題。
按一下，2 原句在嗎：「濮陽與呂布交戰」，大綱第 11 回寫了「呂布在濮陽設計誘敵，使曹操中伏敗退」，打勾。
按一下，3 有沒有多寫：「攻打呂布」，大綱第 13 回寫了「袁紹派兵助曹操攻打呂布」，回答說的大綱都寫了，打勾。沒寫的、或寫得比大綱多的，就打問號。
最後一下：三件都打勾，才放心用。`],
  [Practice3, `91:00–95:00
練習 3，4 分鐘。全班核對同一份回答：剛才那題在範例大綱上的實跑結果，一共 7 項。對照的也是同一份範例大綱，所以大家的答案可以互相比。
請在筆電打開右邊兩個連結：先核對這份回答.md（${CHECK3_URL}）和範例大綱 三國演義大綱.md（${SAMPLE_OUTLINE_URL}）。大綱在瀏覽器裡按 Ctrl+F（Mac 是 Cmd+F）找「第 6 回」，就跳到那一回。剛才示範過第 4、5 列，請核對其他五列。
按一下、再按一下、再按一下：每一列問三件事：檔案在嗎、原句在嗎、有沒有多寫。
給大家 3 分鐘，再請兩位說說：哪一列打了問號，為什麼。
最後一下（等大家說完再按）：第 1 列打問號。

答案，講師用（對照範例大綱）：
第 1 列，討伐董卓、汜水關與虎牢關之戰，第 5 回：問號。大綱第 5 回只寫「曹操在陳留散家財招募義兵，發檄文召集各路諸侯討伐董卓」，汜水關是「由關羽溫酒斬華雄」，虎牢關是「由劉備、關羽、張飛合力戰退呂布」，沒寫曹操上陣。同一題另外兩次實跑，都因為這樣把第 5 回排除了。補充：原文第 5 回有一句「操引軍往來救應」，所以它補的不一定錯，但不是從大綱來的，違反了「筆記沒寫的不要補」。
第 2 列，滎陽追擊董卓，第 6 回：打勾，「曹操獨自追擊，卻在滎陽被董卓軍擊敗」。
第 3 列，徐州攻陶謙，第 10–12 回：打勾，第 10 回「起兵攻打徐州的陶謙」、第 11 回「使曹操退兵」、第 12 回「曹操攻打徐州時」。
第 4 列，濮陽與呂布交戰，第 11–12 回：打勾（剛才示範過）。
第 5 列，攻打呂布，第 13 回：打勾（剛才示範過），「袁紹派兵助曹操攻打呂布」。
第 6 列，淯水攻打張繡，第 16–18 回：打勾。第 16 回「曹操攻打張繡時，典韋戰死，曹操敗退」、第 17 回「曹操率軍攻打張繡」、第 18 回「張繡設下反計，曹操因此大敗」。「淯水」兩個字只在第 16 回的回目「曹孟德敗師淯水」，內文沒有；有人因此打問號也說得通，正好討論：回目算不算大綱寫的。
第 7 列，攻打呂布、下邳圍城與白門樓，第 18–19 回：打勾，第 18 回「曹操轉而攻打呂布」、第 19 回「曹操與劉備合兵圍攻下邳」。
看漏的：第 3 回「袁紹、曹操率兵誅殺宦官」它沒列，算不算戰役可以討論，兩種判斷都行。
用自己大綱的同學：這份回答是對照範例大綱跑的，請對範例大綱，不要對自己的大綱。`],
  [Practice3Ask, `95:00–97:00
打了問號的那一列，不要只在心裡打叉，回頭問 Codex。提示詞在 prompts.md 的〈練習 3〉，把回數和事情換成你要問的那一列：「大綱第 5 回哪一句寫了曹操在汜水關或虎牢關上陣打仗？只根據 整理/三國演義大綱.md，引用原句；沒寫就說沒寫。」
按一下：講師 2026-10-24 在範例大綱上實跑，它回「沒寫」，把第 5 回那句整段引出來，再說「這句沒有寫曹操在汜水關或虎牢關上陣打仗」。用自己大綱的同學，Codex 查的是你自己的大綱，回答可能不一樣，看它引的那句你同不同意。
按一下：追問一句，就看出哪一項是它自己補的。原先的回答把它列進去，現在問原句在哪，它就承認沒寫。
最後一下：有時間的人自己問一題，提示詞範本也在 prompts.md：「（你的問題）只根據 .md 卡片回答，每個說法附上檔名和一句卡片原句；筆記沒寫的就說找不到，不要自己補。」這兩題，模型的記憶比卡片多，正好看它有沒有多寫：
「白門樓上，劉備對曹操說了什麼原話？」實測：它說找不到完整原話，只引大綱「曹操在劉備提醒丁原、董卓舊事後，下令縊死呂布」。原話在 原文/第019回.txt：「公不見丁建陽、董卓之事乎？」它如果直接說出這句，就是用記憶補的，大綱裡沒有。
「關羽在第 1 到 21 回斬了哪些人？」實測：華雄（第 5 回）、車冑（第 21 回），並說第 1 回沒寫被斬的人名。打開 原文/第001回.txt 會看到關羽斬了程遠志：大綱沒寫，它照規則說找不到，這就是 RAG 的限制一，筆記沒寫的它找不到。`],
  [Section4, `97:00–97:30
第四章：建立知識圖譜。知識圖譜聽起來很大，其實就是點和線，重點是每條線都要說得出出處。`],
  [PointsLines, `97:30–99:00
知識圖譜把人、事件等放成節點（Node），把關係畫成邊（Edge）。國文：劉備、關羽連到桃園結義，兩條綠線；曹操連到桃園結義那條是橘色虛線加問號，因為原文沒寫曹操參加結義。
按一下，歷史：原因到事件是綠線，事件到結果打問號，代表要回課本確認。按一下，自然：草、兔子、老鷹的食物鏈，兩條都有課本根據。
按一下：顏色規則。綠線：原文有寫。橘色虛線加問號：原文沒寫，要回去查。今天剩下的頁面都照這個規則。
最後一下：每條線都說得出出處。`],
  [GraphView, `99:00–100:00
Obsidian 內建的 Graph View 叫「關聯圖」：按左側工具列的關聯圖圖示，或按 Ctrl+G（Mac 是 Cmd+G）。這是講師電腦上合併大綱後的實際畫面。
按一下，標 1：中間的大圓是三國演義大綱，連出去最多線；右邊是那一塊放大的樣子。按一下，標 2：四周一圈淡色小點，就是剛才那 70 個還沒有卡的名字。按一下，標 3：右下一群深色點，是講師的人物、勢力、關係卡，彼此連得很密。
大綱和講師的卡之間，只靠劉備、關羽、張飛、曹操這幾條線接著。等一下補連結，這兩群會接得更緊。`],
  [LocalGraph, `100:00–101:00
圖譜中的一條線，專有名詞叫「邊」（Edge）。整張關聯圖太密，換個方式看：只看一條線。左邊是劉備的局部關聯圖，實際畫面放大；打開劉備卡，在右上角「⋯」選單或命令選擇器（Ctrl/Cmd+P）找「局部關聯圖」。橘色那條是講師加的標示，就是劉備到〈桃園結義〉的線。
先問：這條線是哪來的？按一下：劉備卡裡有一句「三人越談越投合，隔天就在張飛莊後的桃園立誓，留下著名的 [[桃園結義]]」，框起來的就是那個連結。
最後一下：每條線，都來自卡片裡的一個 [[連結]]。想知道一條線為什麼存在，就回卡片找那個連結和它所在的句子。`],
  [AsciiAsk, `101:00–103:00
練習 4，四頁一共 14 分鐘。先請 Codex 畫 ASCII 關係圖，ASCII 就是純文字畫的圖。畫面上就是完整提示詞，請從 prompts.md 的〈練習 4〉複製：${PROMPTS_URL}
三行就是三個重點：定位兩張卡、一線一行附檔名、沒原句不畫。
大家貼上、按 Enter，讓它跑，大約一分鐘。它跑的時候，先看講師的結果。
按一下：講師 2026-10-17 實跑的回覆，全文 9 條線，沒有刪改。這份也放在筆電上打得開的 講師的ASCII關係圖.md（${CHECK4_URL}），下一頁全班先核對這一份；你自己跑出來的，第 ${pageOf(AskBack4)} 頁再核對。
你的線數會不一樣：講師 2026-10-24 在範例筆記庫上再跑一次，只畫了 6 條，全部找得到原句。所以要練「沒原句的線」，大家先一起核對講師這份。
補充：講師另外試過不限格式的版本，它畫成一大張框線圖，劉備出現兩次，很難核對；所以提示詞才要求一線一行。`],
  [CheckLines, `103:00–107:00
第 1 輪：全班核對講師的 9 條線。每條線打開它寫的來源卡，找一句撐得住的原句：兩個人都在句子裡，關係也寫出來。先說怎麼併：同一句原句撐住的線，併成一列，所以 9 條線變成 5 列。給大家 2 分鐘自己找，再一起按。
按一下：劉關張結義 3 條線，都靠〈桃園結義〉的「誓畢拜劉備為兄，關羽次之，張飛為弟」，打勾。
按一下：曹操和劉備 2 條，都靠〈煮酒論英雄〉曹操說的「今天下英雄，惟使君與操耳」，打勾。
按一下：關張守護劉備 2 條，靠〈桃園結義〉的「關、張聽說大哥被帶走，急忙衝進後園按劍守護」，打勾。
按一下：劉備和孫權「聯手」，它說來源是〈煮酒論英雄〉，可是這張卡只在最後順帶一句「到了赤壁之戰，劉備已經站在孫權那一邊對抗曹操」，沒寫聯手的經過，打問號。
按一下：孫權和曹操「對抗」，同一句，主詞是劉備，打問號。這兩條本來也超出〈桃園結義〉〈煮酒論英雄〉的範圍。
最後一下：7 條有原句，2 條打問號。打問號的兩條，下一頁拿去問 Codex。`],
  [AskBack4, `107:00–111:00
打了問號的線，拿去追問 Codex。提示詞在 prompts.md 的〈練習 4〉第 1 輪：「下面的線，請到它寫的來源卡找出撐得住它的原句，逐條引用；找不到就說找不到，不要改任何檔案。」下面貼上打問號的兩條線。
按一下：講師 2026-10-24 實跑的回覆。它兩條都說「找到」，引的是同一句「劉備已經站在孫權那一邊對抗曹操」；第一條還自己補了一句「原句沒有直接使用聯手一詞」。
先問大家：這句撐得住「劉備和孫權聯手」嗎？撐得住「孫權對抗曹操」嗎？請兩位說。講師的判斷：第一條勉強，句子只說劉備站在孫權那邊，沒寫兩人怎麼聯手；第二條撐不住，對抗曹操的主詞是劉備。要留這兩條，就改用〈赤壁之戰〉寫清楚的「孫權最後決定和劉備聯手」，來源改成 關係/赤壁之戰.md。
最後一下：它說「找到」，撐不撐得住，要你自己判斷。
第 2 輪：核對你自己跑出來的線，方法一樣。找不到原句的，回覆 Codex：「第 N 條在 關係/＿＿.md 找不到原句，請刪掉這條，其他照原樣再列一次，不要改任何檔案。」實測提醒：講師故意說一條其實找得到原句的線（關羽、張飛按劍守護劉備）找不到，它也照刪了，沒有反駁。所以刪之前，自己要先確定真的找不到。`],
  [AddLinksBack, `111:00–115:00
練習 4 最後一步：把你在練習 2 寫的關係卡，連回大綱。範例大綱第 5 回寫的是黑字「溫酒斬華雄」，所以大綱和〈溫酒斬華雄〉這張卡沒接上。上面是示意，照 Obsidian 的顏色畫：紫色是有卡的連結，淡紫是還沒有卡，框起來的是黑字。
按一下：在大綱裡改成 [[溫酒斬華雄]]，換成你那張卡的名字，就變成紫色連結。寫〈轅門射戟〉的，第 16 回「呂布在轅門射戟」改成「呂布在[[轅門射戟]]」。寫〈許田打圍〉的，範例大綱第 20 回寫的是「許田打獵」，字不一樣，就在那一段最後加上「（[[許田打圍]]）」。用第一堂舊版提示詞寫的大綱，「煮酒論英雄」「桃園結義」可能也是黑字，一起補。
最後一下：補上 [[ ]]，大綱就接到你的關係卡。打開你的關係卡，反向連結裡多了「三國演義大綱」；回去看關聯圖，大綱和講師那群卡之間也多了一條線。`],
  [Recap, `115:00–118:00
回顧四件事。一，筆記庫就是一個資料夾，Obsidian 和 Codex 讀同一份。二，大綱放進整理資料夾，[[劉備]] 接上講師的人物卡，淡色連結先數次數，再決定補卡還是先留著。三，RAG：先查筆記再回答，要求附檔名，用三件事核對：檔案在嗎、原句在嗎、有沒有多寫。四，知識圖譜是點和線，每條線都要找得到原句，找不到就刪。
最後一下：筆記寫得清楚、連得好，AI 才答得準。`],
  [NextSkills, `118:00–120:00
下一堂講 Skill。Skill 就是一份寫好的做事說明，像食譜：照著做，每次的做法都一樣。
第一步，把 Skill 裝進 Codex。
按一下：第二步，用 Skill 做事。今天會預告兩個：diagram-design 畫關係圖，第一次用它會先問你要哪種樣式，選 1；eli5 把卡片改寫成好讀的版本。
按一下：第三步，大家自己寫一個 Skill，用它把三國的事件排成時間軸。
最後一下：同一座筆記庫，下一堂會多出圖和時間軸，今天的筆記庫請留著。
課前請大家先註冊 GitHub 和 Vercel，第四堂發布網站要用，避免現場一起註冊卡在 email 驗證。`],
  [ReferencesRag, `（課後自讀，上課不講。）
第 3 章用到的論文。arXiv 編號可以直接打 arxiv.org/abs/編號 打開。
RAG、附出處：
- Lewis et al. 2020, Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks（RAG 這個名字的出處）. https://arxiv.org/abs/2005.11401
- Shuster et al. 2021, Retrieval Augmentation Reduces Hallucination in Conversation（先查資料再答，亂編的情況變少）. https://arxiv.org/abs/2104.07567
- Gao et al. 2023, Enabling Large Language Models to Generate Text with Citations（要求回答附出處，並檢查出處撐不撐得住）. https://arxiv.org/abs/2305.14627
RAG 的限制、核對：
- Barnett et al. 2024, Seven Failure Points When Engineering a Retrieval Augmented Generation System（資料裡沒有、找到了卻沒用上等失敗點）. https://arxiv.org/abs/2401.05856
- Liu et al. 2023, Lost in the Middle: How Language Models Use Long Contexts（資料一長，中間的內容容易被忽略）. https://arxiv.org/abs/2307.03172
- Es et al. 2023, Ragas: Automated Evaluation of Retrieval Augmented Generation（評估回答是否忠於找到的資料）. https://arxiv.org/abs/2309.15217
搜尋工具 rg（ripgrep）：https://github.com/BurntSushi/ripgrep
Codex CLI：https://developers.openai.com/codex/cli 、斜線指令 https://developers.openai.com/codex/cli/slash-commands`],
  [ReferencesGraph, `（課後自讀，上課不講。）
知識圖譜：
- Hogan et al. 2021, Knowledge Graphs（ACM Computing Surveys，入門綜述）. https://arxiv.org/abs/2003.02320
- Pan et al. 2023, Unifying Large Language Models and Knowledge Graphs: A Roadmap. https://arxiv.org/abs/2306.08302
- Edge et al. 2024, From Local to Global: A Graph RAG Approach to Query-Focused Summarization（讓模型從文字抽出圖譜，再拿圖譜做 RAG）. https://arxiv.org/abs/2404.16130
Obsidian 官方說明：
- 資料怎麼儲存：https://obsidian.md/help/data-storage
- 下載與安裝：https://obsidian.md/help/install
- 語言設定：https://obsidian.md/help/User+interface/Language+settings
- 管理儲存庫：https://obsidian.md/help/manage-vaults
- 內部連結：https://obsidian.md/help/links
- 反向連結：https://obsidian.md/help/plugins/backlinks
- 快速切換：https://obsidian.md/help/plugins/quick-switcher
- 關聯圖：https://obsidian.md/help/plugins/graph
原文：維基文庫《三國演義》 https://zh.wikisource.org/wiki/三國演義 ，例如第 1 回 https://zh.wikisource.org/wiki/三國演義/第001回 、第 21 回 https://zh.wikisource.org/wiki/三國演義/第021回
下一堂的 Skill：https://developers.openai.com/codex/skills 、https://agentskills.io`],
]);

export const notes: (string | undefined)[] = deck.map(page => NOTES.get(page));

export default deck satisfies Page[];
