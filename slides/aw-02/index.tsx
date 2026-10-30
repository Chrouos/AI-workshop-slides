import type { DesignSystem, Page, SlideMeta, SlideTransition } from '@open-slide/core';
import { Step, Steps, useIsActivePage, useSlidePageNumber } from '@open-slide/core';
import type { CSSProperties, ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';
import downloadPage from './assets/download-crop.png';
import firstLaunch from './assets/obsidian-first-launch.png';
import vaultQr from './assets/lab-zip-qr.svg';
import treeOk from './assets/tree-ok.png';
import treeWrong from './assets/tree-wrong.png';
import caocaoLine from './assets/caocao-chibi-line.png';
import chibiTop from './assets/chibi-top.png';
import chibiParticipants from './assets/chibi-participants.png';
import taoyuanGraph from './assets/liubei-taoyuan-graph.png';
import taoyuanLine from './assets/liubei-taoyuan-line.png';
import outlineCh1 from './assets/outline-ch1-sample.png';
import liubeiCard from './assets/liubei-card.png';
import backlinksPane from './assets/backlinks-pane-sample.png';
import ownCard from './assets/own-card-sanying.png';
import vaultGraph from './assets/vault-graph.png';
import vaultGraphCards from './assets/vault-graph-cards.png';
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
// One download for the lesson: the vault (三國人物知識庫/) and prompts.md. Practice 3/4 reference runs live online in aw-02-sample-output/.
const VAULT_ZIP_URL = 'https://raw.githubusercontent.com/Chrouos/AI-workshop-slides/main/examples/aw-02-lab.zip';
const DECK_SITE = 'chrouos.github.io/AI-workshop-slides';
const GH = 'https://github.com/Chrouos/AI-workshop-slides/blob/main/examples';
const PROMPTS_URL = `${GH}/aw-02-lab/prompts.md`;
// The frozen sample outline from lesson 1, used by the appendix's 曹操 discussion.
const SAMPLE_OUTLINE_URL = `${GH}/aw-01-sample-output/%E4%B8%89%E5%9C%8B%E6%BC%94%E7%BE%A9%E5%A4%A7%E7%B6%B1.md`;
// Appendix, optional discussion: the 曹操 seven-battle run.
const ADV3_URL = `${GH}/aw-02-sample-output/%E9%80%B2%E9%9A%8E_%E6%9B%B9%E6%93%8D%E6%88%B0%E5%BD%B9%E5%9B%9E%E7%AD%94.md`;

// ---------- Demo videos ----------
// The instructor never runs things live: each demo is a silent screen recording in ./assets/.
// What each video shows, chapter by chapter, is in that page's speaker notes; keep the chapter
// times in `parts` and the notes in step with the recording.
const TOUR_VIDEO: string | undefined = new URL('./assets/obsidian-tour.mp4', import.meta.url).href;
const CARD_VIDEO: string | undefined = new URL('./assets/card-and-link.mp4', import.meta.url).href;
const RAG_VIDEO: string | undefined = new URL('./assets/rag-own-card.mp4', import.meta.url).href;

// ---------- Frame ----------

const Title = ({ children }: { children: ReactNode }) => (
  <h1 style={{ fontFamily: '"Libre Baskerville", Georgia, "Times New Roman", serif', fontSize: 132, fontWeight: 400, lineHeight: 1.17, letterSpacing: '-0.035em', maxWidth: 1500, margin: 0, color: ink, whiteSpace: 'pre-line' }}>{children}</h1>
);

// With a source, the footer's left side names where the page's idea comes from.
const Footer = ({ source }: { source?: ReactNode }) => {
  const { current, total } = useSlidePageNumber();
  return (
    <div style={{ position: 'absolute', left: 144, right: 144, bottom: 56, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 32, borderTop: '1px solid #E7E5E4', paddingTop: 22, fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', fontSize: 22, fontWeight: 400, color: quiet }}>
      {source ? <span style={{ whiteSpace: 'nowrap' }}><strong style={{ fontWeight: 600, color: muted }}>參考</strong>｜{source}</span> : <span>AI 協作課｜第 2 堂 Obsidian 與 AI Agent</span>}
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

// Prompts are copied from aw-02-lab/prompts.md on GitHub (outside the vault, so Codex never reads them).
// Sits top right, under the chapter route bar.
const PromptsCopy = ({ step }: { step: string }) => (
  <>
  <a href={PROMPTS_URL} target="_blank" rel="noreferrer" style={{ position: 'absolute', top: 168, right: 144, display: 'flex', alignItems: 'center', gap: 18, color: muted, textDecoration: 'none' }}>
    <span style={{ textAlign: 'right', fontSize: 24, lineHeight: 1.4 }}>複製提示詞<br /><strong style={{ color: amber, fontFamily: mono }}>prompts.md</strong> {step}</span>
    <img src={promptsQr} alt="第二堂 prompts.md 的 QR code" style={{ width: 120, height: 120, display: 'block', background: '#FFFFFF', border: `1px solid ${rule}`, padding: 5 }} />
  </a>
    <FooterUrl href={PROMPTS_URL} />
  </>
);

// A file on GitHub the class opens on their laptops (the deck is open there too).
const FileLink = ({ href, children }: { href: string; children: ReactNode }) => (
  <a href={href} target="_blank" rel="noreferrer" style={{ fontFamily: mono, fontSize: 26, color: amber, fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: 6 }}>{children}</a>
);

// The four chapters of the lesson. Pages inside a chapter show where we are.
const CHAPTERS = ['認識 Obsidian', '寫自己的關係卡', '讓 Codex 讀筆記庫', '請 Codex 畫關係圖'];
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
      <span style={{ fontFamily: mono, color: '#BCC3CC', fontSize: 24, marginLeft: 16 }}>{title}</span>
    </div>
    <div style={{ padding: '24px 36px 30px', fontFamily: mono, fontSize: size, lineHeight: 1.6, whiteSpace: 'pre' }}>{children}</div>
  </div>
);
const Typed = ({ children }: { children: ReactNode }) => <span style={{ color: '#8DD4A0' }}>{children}</span>;
const AskLine = ({ children }: { children: ReactNode }) => <span style={{ color: '#E9B650' }}>{children}</span>;
const Dim = ({ children }: { children: ReactNode }) => <span style={{ color: '#BCC3CC' }}>{children}</span>;

const Caption = ({ children }: { children: ReactNode }) => (
  <div style={{ fontSize: 24, lineHeight: 1.4, color: quiet, marginTop: 12 }}>{children}</div>
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
    <svg viewBox="0 0 36 36" style={{ width: Math.max(36, size), height: Math.max(36, size), flexShrink: 0 }} aria-hidden="true">{ok ? <TickMark x={18} y={20} size={24} /> : <CrossMark x={18} y={18} size={18} color={amber} />}</svg>
    <span>{children}</span>
  </div>
);

// The 「不對就…」 box under a practice: what went wrong (red label), then the self-fix.
const FixBox = ({ label, children, marginTop = 24, labelWidth }: { label: ReactNode; children: ReactNode; marginTop?: number; labelWidth?: number }) => (
  <div style={{ marginTop, display: 'flex', alignItems: 'center', gap: 24, background: '#FFFFFF', border: `1px solid ${rule}`, borderLeft: `8px solid ${warn}`, padding: '14px 28px' }}>
    <span style={{ flex: '0 0 auto', width: labelWidth, fontSize: 27, fontWeight: 600, color: warn }}>{label}</span>
    <span style={{ fontSize: 27, lineHeight: 1.45 }}>{children}</span>
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
    {kind ? <text x={x + 20} y={y + 34} fontSize="24" fill={quiet}>{kind}</text> : null}
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
  <g><circle cx={x} cy={y} r={r} fill={amber} /><text x={x} y={y + Math.max(24, r * 1.3) * 0.35} textAnchor="middle" fontSize={Math.max(24, r * 1.3)} fontWeight="700" fill="#FFFFFF">?</text></g>
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
    <text x={x + 24} y={y + 33} fontSize="24" fill={muted}>{title}</text>
  </g>
);

// A sentence in a card, with a highlight that sweeps on when its step is revealed.
const QuoteLine = ({ x, y, w, text, at = 0 }: { x: number; y: number; w: number; text: string; at?: number }) => (
  <g><rect className="aw2-sweep" style={{ transitionDelay: `${at}ms` }} x={x} y={y - 30} width={w} height="42" fill={amberSoft} /><text x={x + 10} y={y} fontSize="26" fill={ink}>{text}</text></g>
);

// ---------- Demo video page ----------

// A recorded demo beside buttons that jump to each part. With no file yet, a dashed box names
// the file to record and the buttons list the planned parts (times are estimates until then).
type VideoPart = [number, string];
const clock = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

const DemoVideo = ({ src, file, parts, label }: { src?: string; file: string; parts: VideoPart[]; label: string }) => {
  const live = useIsActivePage();
  const video = useRef<HTMLVideoElement>(null);
  const [now, setNow] = useState(0);
  useEffect(() => { if (!live) video.current?.pause(); }, [live]);
  const part = src ? parts.reduce((at, [t], k) => (now >= t ? k : at), 0) : -1;
  const jump = (t: number) => {
    const v = video.current;
    if (!v) return;
    v.currentTime = t;
    void v.play();
  };
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '979px 1fr', gap: 48, alignItems: 'center' }}>
      <In i={0}>
        {src ? (
          <video
            ref={video}
            src={src}
            controls
            muted
            playsInline
            preload="metadata"
            onTimeUpdate={(e) => setNow(e.currentTarget.currentTime)}
            onKeyDown={(e) => { if (e.key === ' ') e.stopPropagation(); }}
            aria-label={label}
            style={{ width: 979, height: 551, display: 'block', background: '#000000', border: `1px solid ${rule}` }}
          />
        ) : (
          <div role="img" aria-label={`影片待錄：${file}`} style={{ width: 979, height: 551, boxSizing: 'border-box', border: `4px dashed ${amber}`, background: surface, display: 'grid', placeItems: 'center', textAlign: 'center' }}>
            <div>
              <div style={{ fontSize: 48, fontWeight: 600, color: amber }}>影片待錄</div>
              <div style={{ fontFamily: mono, fontSize: 34, marginTop: 20 }}>{file}</div>
              <div style={{ fontSize: 26, color: muted, marginTop: 26, lineHeight: 1.5 }}>錄好放進 slides/aw-02/assets/</div>
            </div>
          </div>
        )}
      </In>
      <div style={{ display: 'grid', gap: 12 }}>
        {parts.map(([t, text], k) => (
          <In key={t} i={k + 1}>
            {/* A div, not a <button>: the thumbnail rail already wraps each page in a button. */}
            <div
              role={src ? 'button' : undefined}
              tabIndex={src ? 0 : undefined}
              onClick={(e) => { if (!src) return; e.currentTarget.blur(); jump(t); }}
              onKeyDown={(e) => { if (src && e.key === 'Enter') jump(t); }}
              style={{ width: '100%', display: 'grid', gridTemplateColumns: '84px 1fr', alignItems: 'center', gap: 12, padding: '14px 20px', boxSizing: 'border-box', textAlign: 'left', cursor: src ? 'pointer' : 'default', font: 'inherit', fontSize: 28, color: ink, background: k === part ? amberSoft : '#FFFFFF', border: `1px solid ${k === part ? amber : rule}`, transition: 'background-color 200ms ease, border-color 200ms ease' }}
            >
              <span style={{ fontFamily: mono, fontSize: 26, color: amber, fontWeight: 600 }}>{clock(t)}</span>
              <span style={{ whiteSpace: 'nowrap' }}>{text}</span>
            </div>
          </In>
        ))}
        <Caption>{src ? '點時間跳到那一段' : '預計的段落，錄好後照實際時間改'}</Caption>
      </div>
    </div>
  );
};

// ---------- Opening ----------

const Cover: Page = () => (
  <Shell top={174}>
    <In i={0}><Eyebrow>AI WORKSHOP｜第 2 堂（共 4 堂）</Eyebrow></In>
    <In i={1} style={{ marginTop: 62 }}><Title>{'Obsidian\n與 AI Agent'}</Title></In>
    <In i={2} style={{ marginTop: 40, fontSize: 35, color: muted }}>大綱放進筆記庫，讓 Codex 讀筆記、畫關係圖</In>
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

// First thing in class: both downloads start now and run while the recap is on.
const StartDownloads: Page = () => (
  <Shell source={'Obsidian 說明：下載與安裝 obsidian.md/help/install'}>
    <PracticeEyebrow time="現在開始，邊下載邊聽">練習 1｜下載</PracticeEyebrow>
    <Heading>先下載 Obsidian 和 aw-02-lab.zip</Heading>
    <FooterUrl href={VAULT_ZIP_URL}>{decodeURI(VAULT_ZIP_URL)}</FooterUrl>
    <Fit>
      <div style={{ display: 'grid', gridTemplateColumns: '1040px 1fr', gap: 72, alignItems: 'start' }}>
        <In i={0}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 32, fontWeight: 600, marginBottom: 16 }}><NumDot n={1} />下載並安裝 Obsidian</div>
          <Screenshot src={downloadPage} aspect={1400 / 490} width={1040} url="obsidian.md/download" caption="官方下載頁｜免費，不用註冊" alt="Obsidian 下載頁上的紫色 Download 按鈕">
            <RegionMark n={1} i={2} x={13} y={14} w={74} h={52} badge="left" />
          </Screenshot>
        </In>
        <In i={1}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 32, fontWeight: 600, marginBottom: 16 }}><NumDot n={2} />下載這堂的教材</div>
          <div style={{ background: amberSoft, borderTop: `5px solid ${amber}`, padding: '22px 24px 26px', textAlign: 'center' }}>
            <div style={{ fontFamily: mono, fontSize: 28, fontWeight: 600 }}>aw-02-lab.zip</div>
            <a href={VAULT_ZIP_URL} target="_blank" rel="noreferrer" aria-label="下載第二堂的 aw-02-lab.zip">
              <img src={vaultQr} alt="aw-02-lab.zip 的 GitHub 下載 QR code" style={{ width: 230, height: 230, display: 'block', margin: '14px auto 0', imageRendering: 'pixelated' }} />
            </a>
            <a href={VAULT_ZIP_URL} download="aw-02-lab.zip" style={{ display: 'inline-block', marginTop: 12, padding: '8px 20px', background: amber, color: '#FFFFFF', fontSize: 26, fontWeight: 600, textDecoration: 'none' }}>在筆電上按這裡下載</a>
          </div>
        </In>
      </div>
    </Fit>
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
            <div style={{ height: 52, display: 'flex', alignItems: 'center', padding: '0 26px', background: '#30343A', fontFamily: mono, fontSize: 24, color: '#BCC3CC' }}>三國演義大綱.md（第一堂的成品，節選）</div>
            <div style={{ padding: '24px 30px 28px' }}>
              <MdLine head>## 第 1 回 宴桃園豪傑三結義　斬黃巾英雄首立功</MdLine>
              <MdLine><RawLinks text="……[[劉備]]、[[關羽]]、[[張飛]]在桃園祭告天地，" /></MdLine>
              <MdLine>結為兄弟，並招募鄉勇討賊……</MdLine>
              <MdLine dim>出處：原文/第001回.md</MdLine>
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
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={56}>大綱裡有連結，但還沒有對應的人物卡</Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

// One stop on today's route: an icon in a circle, what you do, and which practice does it.
const GoalStop = ({ x, n, kind, label, sub }: { x: number; n: number; kind: IconKind; label: string; sub: string }) => (
  <g>
    <circle cx={x} cy="130" r="96" fill={amberSoft} stroke={amber} strokeWidth="3" />
    <SvgIcon kind={kind} x={x} y={130} size={100} color={amber} />
    <SvgNum x={x - 74} y={52} n={n} />
    <text x={x} y="290" textAnchor="middle" fontSize="40" fontWeight="600" fill={ink}>{label}</text>
    <text x={x} y="342" textAnchor="middle" fontSize="28" fill={muted}>{sub}</text>
  </g>
);

const TodayGoal: Page = () => (
  <Shell>
    <Eyebrow>今天的主線</Eyebrow>
    <Heading>同一張卡：寫好、連好、交給 Codex</Heading>
    <Fit>
      <Stage h={380}>
        <Steps>
          <Layer h={380} label="第 1 站：寫一張自己的關係卡，練習 2">
            <InG i={0}><GoalStop x={204} n={1} kind="doc" label="寫一張卡" sub="練習 2" /></InG>
          </Layer>
          <Step duration={STEP_MS}><Layer h={380} label="第 2 站：連得過去，卡片連回大綱，練習 2">
            <g className="aw2-build" style={buildDelay(0)}><MapArrow x1={320} x2={496} y={130} hot /></g>
            <g className="aw2-build" style={buildDelay(1)}><GoalStop x={612} n={2} kind="link" label="連得過去" sub="卡片連回大綱｜練習 2" /></g>
          </Layer></Step>
          <Step duration={STEP_MS}><Layer h={380} label="第 3 站：AI 找得到，Codex 回答時引用你寫的關係卡，練習 3">
            <g className="aw2-build" style={buildDelay(0)}><MapArrow x1={728} x2={904} y={130} hot /></g>
            <g className="aw2-build" style={buildDelay(1)}><GoalStop x={1020} n={3} kind="search" label="AI 找得到" sub="引用你寫的卡｜練習 3" /></g>
          </Layer></Step>
          <Step duration={STEP_MS}><Layer h={380} label="第 4 站：畫成關係圖，Codex 把你寫的關係卡畫進去，練習 4">
            <g className="aw2-build" style={buildDelay(0)}><MapArrow x1={1136} x2={1312} y={130} hot /></g>
            <g className="aw2-build" style={buildDelay(1)}><GoalStop x={1428} n={4} kind="graph" label="畫成關係圖" sub="畫進你寫的卡｜練習 4" /></g>
          </Layer></Step>
        </Steps>
      </Stage>
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={40}>練習 2 到 4，用的都是你自己寫的那張卡</Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

// A table-of-contents row: chapter, time and page.
const AGENDA_COLS = '80px 1fr 220px';

const AgendaRow = ({ i, n, time, page }: { i: number; n: Chapter; time: string; page: Page }) => (
  <In i={i} style={{ display: 'grid', gridTemplateColumns: AGENDA_COLS, alignItems: 'center', minHeight: 104, borderBottom: `1px solid ${rule}` }}>
    <span style={{ fontFamily: display, fontSize: 40, color: amber }}>{String(n).padStart(2, '0')}</span>
    <span style={{ fontSize: 38, fontWeight: 600 }}>{CHAPTERS[n - 1]}</span>
    <span style={{ textAlign: 'right' }}><span style={{ display: 'block', fontSize: 26, color: amber }}>{time}</span><span style={{ display: 'block', fontSize: 24, color: quiet, marginTop: 4 }}>第 {pageOf(page)} 頁</span></span>
  </In>
);

// The break in the middle of the lesson, as a thin row between two chapters.
const BreakRow = ({ i, time, page }: { i: number; time: string; page: Page }) => (
  <In i={i} style={{ display: 'grid', gridTemplateColumns: AGENDA_COLS, alignItems: 'center', minHeight: 72, borderBottom: `1px solid ${rule}`, background: surface }}>
    <span />
    <span style={{ fontSize: 30, color: muted }}>休息 5 分鐘</span>
    <span style={{ textAlign: 'right' }}><span style={{ display: 'block', fontSize: 26, color: amber }}>{time}</span><span style={{ display: 'block', fontSize: 24, color: quiet, marginTop: 4 }}>第 {pageOf(page)} 頁</span></span>
  </In>
);

const Agenda: Page = () => (
  <Shell>
    <Eyebrow>AGENDA｜120 分鐘，四個練習</Eyebrow>
    <Heading>課程大綱</Heading>
    <Fit>
      <div style={{ display: 'grid', gridTemplateColumns: AGENDA_COLS, paddingBottom: 12, borderBottom: `1px solid ${rule}` }}>
        <span /><SmallLabel>章節</SmallLabel><span style={{ textAlign: 'right' }}><SmallLabel>時間｜頁</SmallLabel></span>
      </div>
      <AgendaRow i={0} n={1} time="10–29 分" page={Section1} />
      <AgendaRow i={1} n={2} time="29–55 分" page={Section2} />
      <BreakRow i={2} time="55–60 分" page={BreakTime} />
      <AgendaRow i={3} n={3} time="60–90 分" page={Section3} />
      <AgendaRow i={4} n={4} time="90–100 分" page={Section4} />
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

const Section1: Page = () => <SectionPage chapter={1} label="01 / OBSIDIAN" lead="先打開筆記庫點一圈，再說剛才用了什麼" />;

// One .md file inside a folder column: a small page glyph and the file name.
const FileRow = ({ x, y, name }: { x: number; y: number; name: string }) => (
  <g>
    <path d={`M${x} ${y} H${x + 14} L${x + 20} ${y + 6} V${y + 24} H${x} Z`} fill="#FFFFFF" stroke={faint} strokeWidth="2" strokeLinejoin="round" />
    <text x={x + 34} y={y + 21} fontSize="26" fill={ink}>{name}<tspan fill={quiet}>.md</tspan></text>
  </g>
);

// A sub-folder of the vault, drawn as a column: folder name and count on top, its files listed below.
const VaultColumn = ({ x, w, label, count, children }: { x: number; w: number; label: string; count: string; children: ReactNode }) => (
  <g>
    <rect x={x} y={196} width={w} height={276} fill="#FFFFFF" stroke={rule} strokeWidth="2" />
    <Folder x={x + 20} y={214} w={38} h={30} />
    <text x={x + 70} y={240} fontSize="28" fontWeight="600" fill={ink}>{label}/</text>
    <text x={x + w - 18} y={240} textAnchor="end" fontSize="26" fontWeight="600" fill={amber}>{count}</text>
    <line x1={x} y1={260} x2={x + w} y2={260} stroke={rule} strokeWidth="2" />
    {children}
  </g>
);

// A secondary folder named in passing: quiet outline, no contents shown.
const QuietFolder = ({ x, label }: { x: number; label: string }) => (
  <g>
    <Folder x={x} y={118} w={34} h={28} fill={raised} stroke={faint} />
    <text x={x + 46} y={143} fontSize="26" fill={quiet}>{label}/</text>
  </g>
);

const VaultFolder: Page = () => (
  <Shell chapter={1} source={'Obsidian 說明：資料怎麼儲存 obsidian.md/help/data-storage'}>
    <Eyebrow>剛才打開的資料夾（Obsidian 介面叫「儲存庫」）</Eyebrow>
    <Heading>儲存庫（Vault）</Heading>
    <Lead>一個資料夾；一張卡就是一個 .md 檔</Lead>
    <Fit>
      <Stage h={490}>
        <Steps>
          <Step duration={STEP_MS}><Layer h={490} label="Obsidian 打開這個資料夾來寫筆記。三國人物知識庫資料夾：入口卡三國演義.md；人物、勢力、關係三個資料夾，各放 5、3、3 張卡；另有原文（第 37、38、46 回）、整理（練習產出）和模板三個資料夾">
            <g className="aw2-build" style={buildDelay(0)}>
              <rect x="0" y="148" width="360" height="190" fill={linkSoft} stroke={link} strokeWidth="2" />
              <text x="28" y="198" fontSize="28" fontWeight="600" fill={link}>Obsidian</text>
              <text x="28" y="258" fontSize="44" fill={ink}>打開來寫</text>
              <text x="28" y="308" fontSize="25" fill={muted}>看到的就是這些檔案</text>
            </g>
            <g className="aw2-build" style={buildDelay(1)}><MapArrow x1={366} x2={428} y={243} color={link} hot /></g>
            <g className="aw2-build" style={buildDelay(2)}>
              <Folder x={436} y={0} w={760} h={486} fill="#FBF7F2" stroke={amber} sw={3} />
              <text x={466} y={66} fontSize="32" fontWeight="600" fill={ink}>三國人物知識庫/</text>
              <text x={1166} y={66} textAnchor="end" fontSize="26" fill={amber}>共 12 張卡</text>
              <line x1={466} y1={90} x2={1166} y2={90} stroke={rule} strokeWidth="2" />
            </g>
            <g className="aw2-build" style={buildDelay(3)}>
              <DocShape x={466} y={106} w={280} h={56} fill={amberSoft} stroke={amber} />
              <text x={490} y={144} fontSize="28" fontWeight="600" fill={ink}>三國演義<tspan dx="14" fontSize="24" fontWeight="400" fill={amber}>入口卡</tspan></text>
              <QuietFolder x={776} label="原文" />
              <QuietFolder x={916} label="整理" />
              <QuietFolder x={1056} label="模板" />
            </g>
            <g className="aw2-build" style={buildDelay(4)}>
              <VaultColumn x={466} w={200} label="人物" count="5">
                <FileRow x={490} y={278} name="劉備" />
                <FileRow x={490} y={316} name="關羽" />
                <FileRow x={490} y={354} name="張飛" />
                <FileRow x={490} y={392} name="曹操" />
                <FileRow x={490} y={430} name="孫權" />
              </VaultColumn>
            </g>
            <g className="aw2-build" style={buildDelay(5)}>
              <VaultColumn x={686} w={200} label="勢力" count="3">
                <FileRow x={710} y={278} name="蜀漢" />
                <FileRow x={710} y={316} name="曹魏" />
                <FileRow x={710} y={354} name="東吳" />
              </VaultColumn>
            </g>
            <g className="aw2-build" style={buildDelay(6)}>
              <VaultColumn x={906} w={260} label="關係" count="3">
                <FileRow x={930} y={278} name="桃園結義" />
                <FileRow x={930} y={316} name="煮酒論英雄" />
                <FileRow x={930} y={354} name="赤壁之戰" />
              </VaultColumn>
            </g>
          </Layer></Step>
          <Step duration={STEP_MS}><Layer h={490} label="Codex 讀同一個資料夾，不用手動上傳">
            <g className="aw2-build" style={buildDelay(1)}><BackArrow x1={1266} x2={1204} y={243} color={okGreen} /></g>
            <g className="aw2-build" style={buildDelay(0)}>
              <rect x="1272" y="148" width="360" height="190" fill={sage} stroke={okGreen} strokeWidth="2" />
              <text x="1300" y="198" fontSize="28" fontWeight="600" fill={okGreen}>Codex</text>
              <text x="1300" y="258" fontSize="44" fill={ink}>讀同一份</text>
              <text x="1300" y="308" fontSize="25" fill={muted}>不用手動上傳</text>
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
    <Eyebrow>剛才點的紫色字</Eyebrow>
    <Heading>Wiki Link 內部連結</Heading>
    <Lead>像課本寫「見第 12 頁」，翻過去就到</Lead>
    <Fit>
      <Stage h={360}>
        <Steps>
          <Layer h={360} label="你打的字：三人在桃園立誓，拜 [[劉備]] 為兄">
            <InG i={0}>
              <text x="0" y="36" fontSize="28" fontWeight="600" fill={quiet}>你打的字</text>
              <rect x="0" y="70" width="480" height="280" fill={surface} stroke={rule} strokeWidth="2" />
              <text x="40" y="190" fontSize="40" fontFamily={mono} fill={ink}>三人在桃園立誓，</text>
              <text x="40" y="262" fontSize="40" fontFamily={mono} fill={ink}>拜 <tspan fill={link}>[[劉備]]</tspan> 為兄</text>
            </InG>
          </Layer>
          <Step duration={STEP_MS}><Layer h={360} label="Obsidian 顯示：劉備變成紫色、有底線的連結">
            <g className="aw2-build" style={buildDelay(0)}><MapArrow x1={492} x2={564} y={210} /></g>
            <g className="aw2-build" style={buildDelay(1)}>
              <text x="576" y="36" fontSize="28" fontWeight="600" fill={link}>Obsidian 顯示</text>
              <rect x="576" y="70" width="480" height="280" fill="#FFFFFF" stroke={rule} strokeWidth="2" />
              <text x="616" y="190" fontSize="40" fill={ink}>三人在桃園立誓，</text>
              <text x="616" y="262" fontSize="40" fill={ink}>拜 <tspan fill={link} textDecoration="underline">劉備</tspan> 為兄</text>
            </g>
          </Layer></Step>
          <Step duration={STEP_MS}><Layer h={360} label="點一下劉備，打開人物卡 劉備.md">
            <g fill="none" stroke={link} strokeWidth="4"><StepPath d="M1068 210 H1128" /></g>
            <g className="aw2-build" style={buildDelay(2)}>
              <polygon points="1144,210 1126,200 1126,220" fill={link} />
              <text x="1152" y="36" fontSize="28" fontWeight="600" fill={amber}>點一下就打開</text>
              <DocShape x={1152} y={70} w={480} h={280} fill={amberSoft} stroke={amber} sw={3} />
              <text x="1180" y="114" fontSize="26" fill={quiet}>人物/</text>
              <text x="1392" y="232" textAnchor="middle" fontSize="52" fontWeight="600" fill={ink}>劉備.md</text>
            </g>
          </Layer></Step>
        </Steps>
      </Stage>
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={32}>卡名放進 [[ ]]，就建立一條內部連結</Takeaway></Step></Steps>
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
    <Eyebrow>剛才在右邊看到的清單</Eyebrow>
    <Heading>反向連結（Backlinks）</Heading>
    <Lead>像書末索引：列出提到這個名字的頁</Lead>
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
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={28}>Obsidian 自動列出所有連到〈劉備〉的卡</Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

const GrayLink: Page = () => (
  <Shell source={'Obsidian 說明：內部連結 obsidian.md/help/links；快速切換 obsidian.md/help/plugins/quick-switcher'}>
    <Eyebrow>附錄｜還沒建立的卡</Eyebrow>
    <Heading>未解析連結（Unresolved Link）</Heading>
    <Lead>連結指向的卡，資料夾裡還沒有</Lead>
    <Fit>
      <Stage h={420}>
        <Steps>
          <Layer h={420} label="有卡：劉備是深紫色連結，指到 人物/劉備.md">
            <InG i={0}>
              <text x="0" y="40" fontSize="27" fontWeight="600" fill={okGreen}>有這張卡</text>
              <text x="0" y="140" fontSize="64" fill={link} textDecoration="underline">劉備</text>
            </InG>
            <InG i={1}><MapArrow x1={170} x2={320} y={118} /></InG>
            <InG i={2}><CardDoc x={340} y={58} w={300} h={120} name="人物/劉備.md" size={30} fill={amberSoft} stroke={amber} /></InG>
            <PopG i={4}><OkDot x={680} y={118} r={26} /></PopG>
          </Layer>
          <Step duration={STEP_MS}><Layer h={420} label="沒卡：呂布是淡紫色連結，資料夾裡沒有 呂布.md">
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
          <Step duration={STEP_MS}><Layer h={420} label="點下淡色連結，Obsidian 會新建一張空白的 呂布.md">
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
        <Step duration={STEP_MS}><Takeaway marginTop={24}>淡色連結：指向的卡還沒建立</Takeaway></Step>
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
  <Shell>
    <Eyebrow>附錄｜三國筆記庫的卡</Eyebrow>
    <Heading>人物卡、勢力卡、關係卡</Heading>
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
        <Step duration={STEP_MS}><Takeaway marginTop={18}>人物之間發生的事，寫成關係卡</Takeaway></Step>
      </Steps>
    </Fit>
  </Shell>
);

// Five people on top, three relation cards below. Each click adds one story.

const StoryLinks = ({ story, paths }: { story: 0 | 1 | 2; paths: string[] }) => (
  <g fill="none" stroke={quiet} strokeWidth="6" strokeLinecap="round">
    {paths.map((d, i) => <StepPath key={d} d={d} i={i} />)}
  </g>
);

const StoryMap: Page = () => (
  <Shell source={'維基文庫《三國演義》第 1、21、49–50 回 zh.wikisource.org/wiki/三國演義'}>
    <Eyebrow>附錄｜人物怎麼連在一起</Eyebrow>
    <Heading>人物卡透過關係卡相連</Heading>
    <Fit>
      <div style={{ background: '#FFFFFF', border: `1px solid ${rule}` }}>
        <Stage h={440}>
          <Steps>
            <Layer h={440} label="上排五張人物卡：關羽、張飛、劉備、曹操、孫權">
              <text x="28" y="118" fontSize="24" fontWeight="600" fill={amber}>人物卡</text>
              <text x="28" y="342" fontSize="24" fontWeight="600" fill={okGreen}>關係卡</text>
              <line x1="28" y1="420" x2="78" y2="420" stroke={quiet} strokeWidth="6" strokeLinecap="round" /><text x="92" y="428" fontSize="24" fill={muted}>關係卡寫了他參與</text>
              <InG i={0}><Person x={260} y={110} name="關羽" /></InG>
              <InG i={1}><Person x={490} y={110} name="張飛" /></InG>
              <InG i={2}><Person x={790} y={110} name="劉備" hub /></InG>
              <InG i={3}><Person x={1130} y={110} name="曹操" hub /></InG>
              <InG i={4}><Person x={1470} y={110} name="孫權" /></InG>
            </Layer>
            <Step duration={STEP_MS}><Layer h={440} label="桃園結義連到關羽、張飛、劉備">
              <StoryLinks story={0} paths={['M260 156 C260 240 400 270 470 310', 'M490 156 V310', 'M790 156 C790 240 600 270 520 310']} />
              <g className="aw2-build" style={buildDelay(3)}><RelBox cx={495} y={310} w={230} label="桃園結義" sub="第 1 回" /></g>
            </Layer></Step>
            <Step duration={STEP_MS}><Layer h={440} label="煮酒論英雄連到劉備、曹操">
              <StoryLinks story={1} paths={['M800 166 C820 240 900 280 930 310', 'M1120 166 C1100 240 1020 280 990 310']} />
              <g className="aw2-build" style={buildDelay(2)}><RelBox cx={960} y={310} w={250} label="煮酒論英雄" sub="第 21 回" /></g>
            </Layer></Step>
            <Step duration={STEP_MS}><Layer h={440} label="赤壁之戰連到曹操、孫權">
              <StoryLinks story={2} paths={['M1140 166 C1160 240 1240 280 1270 310', 'M1470 156 C1470 240 1380 280 1330 310']} />
              <g className="aw2-build" style={buildDelay(2)}><RelBox cx={1300} y={310} w={230} label="赤壁之戰" sub="第 49–50 回" /></g>
            </Layer></Step>
          </Steps>
        </Stage>
      </div>
      <Steps><Step duration={STEP_MS}><Takeaway>劉備、曹操各連到兩張關係卡</Takeaway></Step></Steps>
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
    <PracticeEyebrow time="4 分半">練習 1｜點一圈</PracticeEyebrow>
    <Heading>沿連結走：劉備 → 桃園結義 → 關羽</Heading>
    <Fit>
      <div style={{ background: '#FFFFFF', border: `1px solid ${rule}`, padding: '20px 0' }}>
        <Stage h={430}>
          <Steps>
            <Layer h={340} label="第一站：劉備人物卡">
              <Station x={260} kind="人物/" name="劉備" line={amber} why="點卡裡的「桃園結義」" />
            </Layer>
            <Step duration={STEP_MS}><Layer h={340} label="第二站：桃園結義關係卡，說明三人在第 1 回結為兄弟">
              <g fill="none" stroke={amber} strokeWidth="12" strokeLinecap="round"><StepPath d="M298 150 H636" /></g>
              <g className="aw2-build" style={buildDelay(3)}>
                <rect x="636" y="96" width="360" height="108" fill={sage} stroke={okGreen} strokeWidth="3" />
                <text x="816" y="72" textAnchor="middle" fontSize="24" fill={quiet}>關係/</text>
                <text x="816" y="164" textAnchor="middle" fontSize="40" fontWeight="600" fill={ink}>桃園結義</text>
                <SvgLines x={816} y={262} lines={['再點卡裡的「關羽」']} size={26} fill={muted} />
              </g>
            </Layer></Step>
            <Step duration={STEP_MS}><Layer h={340} label="第三站：關羽人物卡">
              <g fill="none" stroke={amber} strokeWidth="12" strokeLinecap="round"><StepPath d="M996 150 H1334" /></g>
              <g className="aw2-build" style={buildDelay(3)}><Station x={1372} kind="人物/" name="關羽" line={amber} why="打開右邊的反向連結" /></g>
            </Layer></Step>
            <Step duration={STEP_MS}><Layer h={430} label="走回來：按返回回到上一張，或在關羽卡的反向連結看到桃園結義">
              {/* A dashed line can't use the dash-offset draw itself, so a solid copy draws inside a mask. */}
              <mask id="aw2-linkwalk-back" maskUnits="userSpaceOnUse" x="0" y="0" width="1632" height="430">
                <g fill="none" stroke="#FFFFFF" strokeWidth="12"><StepPath d="M1372 322 C1372 400 860 400 830 330" /></g>
              </mask>
              <path d="M1372 322 C1372 400 860 400 830 330" fill="none" stroke={link} strokeWidth="5" strokeDasharray="12 9" mask="url(#aw2-linkwalk-back)" />
              <g className="aw2-build" style={buildDelay(3)}>
                <polygon points="826,318 816,342 842,338" fill={link} />
                <text x="1100" y="420" textAnchor="middle" fontSize="30" fill={link}>反向連結裡有〈桃園結義〉，點它就回去</text>
              </g>
            </Layer></Step>
          </Steps>
        </Stage>
      </div>
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={36}>做到了：關羽卡的反向連結列出〈桃園結義〉</Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

const FirstLaunch: Page = () => (
  <Shell chapter={1} source={'Obsidian 說明：語言設定 obsidian.md/help/User+interface/Language+settings；管理儲存庫 obsidian.md/help/manage-vaults'}>
    <PracticeEyebrow time="2 分鐘">練習 1｜打開筆記庫</PracticeEyebrow>
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
    <PracticeEyebrow time="2 分半">練習 1｜打開筆記庫</PracticeEyebrow>
    <Heading>解壓縮，打開三國筆記庫</Heading>
    <Fit z={1.25}>
      {/* One click per step: the downloaded ZIP is there on arrival, then unzip (with the OS tip), then open the inner folder. */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <Stage w={1216} h={420}>
          <Steps>
            <Layer w={1216} h={300} label="第 1 步：找到剛才下載的 aw-02-lab.zip">
              <InG i={1}>
                <rect x="40" y="40" width="220" height="170" fill="#FFFFFF" stroke={faint} strokeWidth="3" />
                <path d="M40 92 H260" stroke={faint} strokeWidth="3" />
                <rect x="132" y="40" width="36" height="170" fill={raised} stroke={faint} strokeWidth="2" />
                <text x="150" y="260" textAnchor="middle" fontSize="28" fontWeight="600" fill={ink}>1｜找到 ZIP</text>
              </InG>
            </Layer>
            <Step duration={STEP_MS}>
              <Layer w={1216} h={300} label="第 2 步：解壓縮成 aw-02-lab 資料夾，筆記庫是裡面的三國人物知識庫">
                <g className="aw2-build" style={buildDelay(0)}><MapArrow x1={290} x2={370} y={125} /></g>
                <g className="aw2-build" style={buildDelay(1)}>
                  <Folder x={410} y={40} w={240} h={170} />
                  <text x={530} y={124} textAnchor="middle" fontSize="22" fill={muted}>aw-02-lab/</text>
                  <text x={530} y={164} textAnchor="middle" fontSize="26" fontWeight="600" fill={ink}>三國人物知識庫</text>
                  <text x={530} y={260} textAnchor="middle" fontSize="28" fontWeight="600" fill={ink}>2｜解壓縮</text>
                </g>
              </Layer>
              <div className="aw2-build" style={{ ...buildDelay(2), position: 'absolute', left: 40, right: 0, top: 316, background: surface, borderLeft: `4px solid ${amber}`, padding: '16px 26px', fontSize: 30 }}>Windows：右鍵 → 全部解壓縮｜Mac：雙擊</div>
            </Step>
            <Step duration={STEP_MS}>
              <Layer w={1216} h={300} label="第 3 步：用 Obsidian 開啟資料夾為儲存庫，選裡面的三國人物知識庫">
                <g className="aw2-build" style={buildDelay(0)}><MapArrow x1={680} x2={760} y={125} hot /></g>
                <g className="aw2-build" style={buildDelay(1)}>
                  <AppFrame x={800} y={30} w={380} h={190} title="Obsidian" />
                  <rect x="830" y="104" width="320" height="64" rx="6" fill={linkSoft} stroke={link} strokeWidth="2" />
                  <text x="990" y="146" textAnchor="middle" fontSize="26" fill={link}>開啟資料夾為儲存庫</text>
                  <text x="990" y="260" textAnchor="middle" fontSize="28" fontWeight="600" fill={ink}>3｜選三國人物知識庫</text>
                </g>
              </Layer>
            </Step>
          </Steps>
        </Stage>
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
    <PracticeEyebrow time="1 分半">練習 1｜檢查</PracticeEyebrow>
    <Heading>打開後，左邊有六個資料夾</Heading>
    <Fit>
      <div style={{ display: 'grid', gridTemplateColumns: '640px 640px', gap: 96, justifyContent: 'center' }}>
        <In i={0}><TreePanel src={treeOk} ok label="對了：六個資料夾＋入口卡" alt="Obsidian 左側：人物、勢力、原文、整理、模板、關係六個資料夾和三國演義入口卡" /></In>
        <div>
          <Steps>
            <Step duration={STEP_MS}><TreePanel src={treeWrong} ok={false} label="選到外層：看到 prompts" alt="Obsidian 左側只看到三國人物知識庫資料夾和 prompts，代表打開了外層的 aw-02-lab" /></Step>
          </Steps>
        </div>
      </div>
      <Steps><Step duration={STEP_MS}><div style={{ display: 'flex', justifyContent: 'center' }}><FixBox label="選到外層了" marginTop={36}>點左下角的儲存庫名稱 →「管理儲存庫」，重開<strong>裡面那層</strong>「三國人物知識庫」</FixBox></div></Step></Steps>
    </Fit>
  </Shell>
);

// Recorded demo of practice 1: the route 劉備 → 桃園結義 → 關羽, back via backlinks, then the local graph.
const VideoTour: Page = () => (
  <Shell chapter={1}>
    <Eyebrow>示範影片｜約 50 秒</Eyebrow>
    <Heading>示範影片：沿連結點一圈</Heading>
    <Fit>
      <DemoVideo
        src={TOUR_VIDEO}
        file="obsidian-tour.mp4"
        label="示範影片：在三國筆記庫點劉備、桃園結義、關羽，用反向連結回到桃園結義，再看桃園結義的關聯圖，從圖上點回劉備"
        parts={[
          [0, '打開 人物/劉備'],
          [7, '點「桃園結義」'],
          [16, '再點「關羽」'],
          [19, '打開右邊的反向連結'],
          [27, '點〈桃園結義〉走回去'],
          [32, '看〈桃園結義〉的關聯圖'],
          [47, '點圖上的劉備，回到卡片'],
        ]}
      />
    </Fit>
  </Shell>
);

// ---------- 02 寫自己的關係卡 ----------

const Section2: Page = () => <SectionPage chapter={2} label="02 / 寫卡" lead="搬進大綱，寫一張卡，再連回大綱" />;

const MergeOutline: Page = () => (
  <Shell chapter={2} source={'Obsidian 說明：內部連結 obsidian.md/help/links'}>
    <PracticeEyebrow time="3 分半">練習 2｜合併</PracticeEyebrow>
    <Heading>把原文和大綱放進筆記庫</Heading>
    <Fit>
      <Stage h={460}>
        <Steps>
          <Layer h={460} label="第一堂的 Codex_練習 資料夾裡有 原文 資料夾（藍框）和 三國演義大綱.md（橘框）">
            <InG i={0}>
              <Folder x={0} y={40} w={460} h={330} fill={surface} stroke={faint} sw={3} />
              <text x="26" y="100" fontSize="30" fontWeight="600" fill={ink}>Codex_練習/</text>
              <rect x="24" y="126" width="200" height="50" fill={blueSoft} stroke={blue} strokeWidth="3" />
              <text x="40" y="161" fontSize="28" fontFamily={mono} fontWeight="600" fill={ink}>原文/</text>
              <text x="208" y="160" textAnchor="end" fontSize="24" fill={muted}>21 個檔</text>
              <text x="40" y="206" fontSize="27" fontFamily={mono} fill={muted}>回目.md</text>
              <text x="40" y="252" fontSize="27" fontFamily={mono} fill={muted}>AGENTS.md</text>
              <rect x="24" y="282" width="412" height="58" fill={amberSoft} stroke={amber} strokeWidth="3" />
              <text x="40" y="321" fontSize="28" fontFamily={mono} fontWeight="600" fill={ink}>三國演義大綱.md</text>
            </InG>
          </Layer>
          <Step duration={STEP_MS}><Layer h={460} label="原文 裡的 21 個檔（藍）拖進筆記庫的 原文 資料夾，那裡已有第 37、38、46 回；大綱（橘）拖進 整理 資料夾；人物 資料夾的範例卡不用動">
            {/* Each moved item keeps its colour on both sides and on its arrow: 原文 blue, 大綱 amber. Builds in story order. */}
            <g className="aw2-build" style={buildDelay(0)}>
              <Folder x={600} y={0} w={1032} h={450} fill={surface} stroke={faint} sw={3} />
              <text x="624" y="60" fontSize="28" fontWeight="600" fill={ink}>三國人物知識庫/</text>
            </g>
            <g className="aw2-build" style={buildDelay(1)}>
              <rect x="884" y="24" width="200" height="50" fill={blueSoft} stroke={blue} strokeWidth="3" />
              <text x="902" y="59" fontSize="28" fontFamily={mono} fontWeight="600" fill={ink}>原文/</text>
              <text x="1104" y="58" fontSize="24" fill={muted}>已有第 37、38、46 回</text>
            </g>
            <g fill="none" stroke={blue} strokeWidth="5"><StepPath d="M224 151 C420 151 520 16 700 16 H820 C848 16 850 49 862 49" i={2} /></g>
            <g className="aw2-build" style={buildDelay(5.5)}><polygon points="884,49 862,37 862,61" fill={blue} /></g>
            <g className="aw2-build" style={buildDelay(3)}>
              <rect x="630" y="86" width="480" height="340" fill="#FFFFFF" stroke={rule} strokeWidth="2" />
              <text x="652" y="128" fontSize="28" fontFamily={mono} fontWeight="600" fill={ink}>整理/</text>
            </g>
            <g className="aw2-build" style={buildDelay(4)}>
              <rect x="652" y="148" width="436" height="56" fill={amberSoft} stroke={amber} strokeWidth="3" />
              <text x="670" y="186" fontSize="28" fontFamily={mono} fontWeight="600" fill={ink}>三國演義大綱.md</text>
            </g>
            <g fill="none" stroke={amber} strokeWidth="5"><StepPath d="M436 311 C540 311 540 176 630 176" i={5} /></g>
            <g className="aw2-build" style={buildDelay(9)}><polygon points="650,176 628,164 628,188" fill={amber} /></g>
            <g className="aw2-build" style={buildDelay(6)}>
              <rect x="1140" y="86" width="470" height="340" fill="#FFFFFF" stroke={rule} strokeWidth="2" />
              <text x="1162" y="128" fontSize="28" fontFamily={mono} fontWeight="600" fill={ink}>人物/</text>
              <CardDoc x={1164} y={150} w={420} h={84} name="劉備.md" size={32} />
              <text x="1164" y="292" fontSize="26" fontFamily={mono} fill={muted}>關羽.md　張飛.md</text>
              <text x="1164" y="338" fontSize="26" fontFamily={mono} fill={muted}>曹操.md　孫權.md</text>
              <text x="1374" y="402" textAnchor="middle" fontSize="24" fill={quiet}>範例人物卡，不用動</text>
            </g>
          </Layer></Step>
          <Step duration={STEP_MS}><Layer h={460} label="大綱第 1 回裡的 [[劉備]]，自己連到 人物/劉備.md">
            <g className="aw2-build" style={buildDelay(0)}>
              <rect x="652" y="244" width="436" height="164" fill={surface} />
              <text x="1070" y="280" textAnchor="end" fontSize="24" fill={quiet}>大綱 第 1 回</text>
              <text x="670" y="336" fontSize="30" fill={ink}>……<tspan fill={link} textDecoration="underline">劉備</tspan>、<tspan fill={link} textDecoration="underline">關羽</tspan>、<tspan fill={link} textDecoration="underline">張飛</tspan></text>
              <text x="670" y="384" fontSize="30" fill={ink}>在桃園祭告天地……</text>
            </g>
            {/* The link runs up through the gap between the outline file and the excerpt, then into 劉備.md. */}
            <g fill="none" stroke={link} strokeWidth="5"><StepPath d="M760 306 C760 250 772 224 810 224 H1096 C1120 224 1124 196 1144 194" i={2} /></g>
            <g className="aw2-build" style={buildDelay(5)}><polygon points="1166,193 1144,182 1144,205" fill={link} /><OkDot x={1584} y={150} r={24} /></g>
          </Layer></Step>
        </Steps>
      </Stage>
      <Steps>
        <Step duration={STEP_MS}><div style={{ display: 'flex', justifyContent: 'center', marginTop: 24 }}><StatusLine ok size={32}>看結果：原文/ 有第 001–021 回，再加 037、038、046 回</StatusLine></div></Step>
        <Step duration={STEP_MS}><FixBox label="拖成整個資料夾" marginTop={16}>Mac 按「停止」、Windows 選「略過這些檔案」，再全選裡面的檔重拖</FixBox></Step>
      </Steps>
    </Fit>
  </Shell>
);

// Stacked: the outline excerpt drawn 1500 px wide (1.01× native, text ~32 px), then the card it
// opens shown as two enlarged crops (its title and first line) so both read on a projector.
// Last click: mark 2 on the pale 董卓 and a deep / pale legend in place of a takeaway.
const CL_W = 1500;
const CL_H = Math.round(CL_W / (1480 / 192));
const CL_LINK_X = Math.round(CL_W * 0.576); // centre of 劉備 on line 1 (sample outline, 1480 × 192 capture)

const ClickLiubei: Page = () => (
  <Shell chapter={2} source={'Obsidian 說明：內部連結 obsidian.md/help/links'}>
    <PracticeEyebrow time="4 分半">練習 2｜合併</PracticeEyebrow>
    <Heading>點大綱的劉備，分辨深淺連結</Heading>
    <Fit>
      <div style={{ position: 'relative' }}>
      <In i={0}>
        <Screenshot src={outlineCh1} aspect={1480 / 192} width={CL_W} caption="整理/三國演義大綱，第 1 回" alt="大綱第 1 回：劉備、關羽、張飛、桃園結義、曹操是深紫色連結，張角、董卓是淡紫色連結">
          <RegionMark n={1} i={2} x={54.9} y={10} w={5.3} h={29} badge="above" drop={14} />
        </Screenshot>
      </In>
      {/* One click: the arrow draws down from 劉備, then the card it opens lands. */}
      <div style={{ position: 'relative', height: 212, marginTop: 16 }}>
        <Steps>
          <Step duration={STEP_MS}>
            <svg viewBox="0 0 1632 240" style={{ position: 'absolute', left: 0, top: -59, width: 1632, height: 240, overflow: 'visible' }} aria-hidden="true">
              <g fill="none" stroke={amber} strokeWidth="4"><StepPath d={`M${CL_LINK_X} 4 V44`} /></g>
              <g className="aw2-build" style={buildDelay(4)}><polygon points={`${CL_LINK_X - 12},42 ${CL_LINK_X + 12},42 ${CL_LINK_X},58`} fill={amber} /></g>
            </svg>
            <div className="aw2-build" style={{ ...buildDelay(4), position: 'absolute', left: 0, top: 0 }}>
              <div style={{ background: '#FFFFFF', border: `1px solid ${rule}`, boxShadow: '0 10px 30px rgba(28,25,23,0.08)', padding: '14px 14px 14px', display: 'grid', gap: 10 }}>
                <Crop src={liubeiCard} natW={1460} natH={800} x={0} y={10} w={1340} h={95} scale={0.9} alt="劉備卡的標題：劉備" />
                <Crop src={liubeiCard} natW={1460} natH={800} x={0} y={420} w={1340} h={50} scale={0.9} alt="劉備卡第一句：劉備，字玄德，是中山靖王之後，家住涿縣樓桑村" />
              </div>
              <Caption>人物/劉備（範例卡，節選）</Caption>
            </div>
            {/* The fix for this click, in the space beside the card. */}
            <div className="aw2-build" style={{ ...buildDelay(6), position: 'absolute', right: 0, top: 0, width: 360, boxSizing: 'border-box', background: '#FFFFFF', border: `1px solid ${rule}`, borderLeft: `8px solid ${warn}`, padding: '14px 22px' }}>
              <div style={{ fontSize: 27, fontWeight: 600, color: warn }}>點不過去</div>
              <div style={{ fontSize: 26, lineHeight: 1.45, marginTop: 4 }}>檢查大綱有沒有放在<br /><span style={{ whiteSpace: 'nowrap' }}>「三國人物知識庫」裡面</span></div>
            </div>
          </Step>
        </Steps>
      </div>
      <Steps>
        <Step duration={STEP_MS}>
          <Pin style={{ left: 0, top: 0, width: CL_W, height: CL_H }}><StepMark n={2} x={20.7} y={62} w={5.2} h={24.6} badge="below" drop={16} /></Pin>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, marginTop: 30 }}>
            <LinkKind n={1} word="劉備" pale={false} title="深紫：有卡，點了會打開" sub="例：劉備、關羽、曹操、桃園結義" />
            <LinkKind n={2} word="董卓" pale title="淡紫：還沒有卡，點了會新增" sub="例：張角、董卓、呂布……" />
          </div>
        </Step>
      </Steps>
      </div>
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
  <Shell source={'Obsidian 說明：反向連結 obsidian.md/help/plugins/backlinks'}>
    <Eyebrow>附錄｜大綱放進來之後</Eyebrow>
    <Heading>合併後的反向連結</Heading>
    <Fit>
      <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: '500px 1fr', gap: 120, alignItems: 'center', justifyContent: 'center' }}>
        <In i={0}>
          {/* Cropped just above the half-cut line at the bottom of the capture (600 × 734 of 600 × 750). */}
          <div style={{ width: 500, border: `1px solid ${rule}`, background: '#FFFFFF', boxShadow: '0 10px 30px rgba(28,25,23,0.08)' }}>
            <Crop src={backlinksPane} natW={600} natH={750} x={0} y={0} w={600} h={734} scale={500 / 600} alt="劉備卡的反向連結面板：已連結本筆記的檔案 36，三國演義 4，三國演義大綱 19" />
          </div>
          <Caption>Obsidian 實際畫面</Caption>
        </In>
        <div>
          <div style={{ fontSize: 30, color: muted, marginBottom: 6 }}>劉備被提到幾處（不是卡片張數）</div>
          <BigCount label="合併前" value="17 處" tone="plain" />
          {/* Each click lands a number and the spot in the panel it comes from (pinned over the 500 × 625 screenshot). */}
          <Steps>
            <Step duration={STEP_MS}>
              <BigCount label="合併後" value="36 處" tone="ok" />
              <Pin style={{ left: 0, top: 0, width: 500, height: 612 }}><StepMark n={1} x={4} y={2.6} w={93} h={8.2} badge="right" /></Pin>
            </Step>
            <Step duration={STEP_MS}>
              <BigCount label="來自大綱" value="19 處" tone="amber" />
              <Pin style={{ left: 0, top: 0, width: 500, height: 612 }}><StepMark n={2} x={4} y={85.8} w={93} h={8.2} badge="right" /></Pin>
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


// One bar of how often a not-yet-carded name shows up in the outline. On the live page the
// bars grow from zero in order (i), right after the list lands.
const NameBar = ({ name, n, i, max = 29 }: { name: string; n: number; i: number; max?: number }) => {
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
  <Shell source={'Obsidian 說明：內部連結 obsidian.md/help/links；原文：維基文庫《三國演義》第 5、19 回 zh.wikisource.org/wiki/三國演義'}>
    <Eyebrow>附錄｜選做：整理淡色連結</Eyebrow>
    <Heading>未解析連結要不要補卡</Heading>
    <Fit>
      <div style={{ display: 'grid', gridTemplateColumns: '640px 1fr', gap: 72, alignItems: 'center' }}>
        <In i={0}>
          <SmallLabel>大綱裡出現最多次、還沒有卡的人</SmallLabel>
          <div style={{ marginTop: 18 }}>
            <NameBar name="呂布" n={29} i={0} />
            <NameBar name="董卓" n={19} i={1} />
            <NameBar name="袁術" n={6} i={2} />
            <NameBar name="袁紹" n={6} i={3} />
            <NameBar name="李傕" n={6} i={4} />
            <NameBar name="孫堅" n={6} i={5} />
          </div>
        </In>
        <div style={{ display: 'grid', gap: 22 }}>
          <Steps>
            <Step duration={STEP_MS}><Decision n={1} when="先數次數" then="搜尋「呂布」" eg={<>Cmd+Shift+F（Windows 是 Ctrl+Shift+F）</>} /></Step>
            <Step duration={STEP_MS}><Decision n={2} when="常出現、原文夠寫" then="記下來，之後照原文補卡" eg="例：呂布 29 次，第 5、19 回都有他" /></Step>
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
// A step number beside a mark on the card, outside the screenshot so it covers no text.
const PcNum = ({ n, top }: { n: number; top: number }) => <span style={{ ...BADGE_STYLE, left: -60, top }}>{n}</span>;

const Practice2Card: Page = () => (
  <Shell chapter={2} source={'維基文庫《三國演義》第 5 回 zh.wikisource.org/wiki/三國演義/第005回'}>
    <PracticeEyebrow time="3 分鐘">練習 2｜寫卡</PracticeEyebrow>
    <Heading>寫一張自己的關係卡</Heading>
    <PromptsCopy step="練習 2-2" />
    <PillRow>
      <Pill tag="定位">第 5／16／20 回</Pill>
      <Pill tag="期望輸出">照模板寫</Pill>
      <Pill tag="限制">原文沒寫不寫</Pill>
    </PillRow>
    <Fit>
      <div style={{ position: 'relative', width: 1632, height: 520 }}>
        <In i={1} style={{ position: 'absolute', left: 0, top: 0 }}>
          <Screenshot src={ownCard} aspect={1352 / 627} width={990} caption="範例〈三英戰呂布〉，請挑別的事件" alt="照模板寫的三英戰呂布卡：屬性回目 5，句子裡張飛、關羽是連結，參與人物裡呂布是純文字，最後一行寫出處" />
        </In>
        <Steps>
          <Step duration={STEP_MS}>
            <div style={{ position: 'absolute', inset: 0 }}>
              <div style={{ position: 'absolute', left: PC_RIGHT, top: 0 }}>
                <CardStep n={1} text="新增筆記，貼上模板" h={96}>
                  <rect x="0" y="10" width="250" height="56" fill={surface} stroke={rule} strokeWidth="2" />
                  <text x="16" y="47" fontSize="24" fontFamily={mono} fill={ink}>prompts.md 2-2</text>
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
                  <text x="128" y="90" fontSize="24" fill={quiet}>人物/劉備.md</text>
                  <text x="380" y="90" fontSize="24" fill={link}>← 跳出選單</text>
                </CardStep>
              </div>
              <PxMark x={16} y={285} w={60} h={38} color={link} />
              <PcNum n={2} top={280} />
              <div style={{ position: 'absolute', left: 347, top: 366, width: 54, borderBottom: `5px dashed ${quiet}` }} />
              <div style={{ position: 'absolute', left: 500, top: 467, display: 'flex', gap: 36, fontSize: 26 }}>
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
                  <text x="18" y="38" fontSize="25" fontFamily={mono} fill={ink}>出處：原文/第005回.md</text>
                </CardStep>
              </div>
              <PxMark x={16} y={92} w={272} h={40} color={amber} />
              <PcNum n={3} top={88} />
              <PxMark x={16} y={404} w={274} h={42} color={amber} />
              <PcNum n={3} top={401} />
            </div>
          </Step>
        </Steps>
      </div>
    </Fit>
  </Shell>
);

// One event to choose from: its chapter, its name, who to link with [[ ]], and who stays plain text.
const EventPick = ({ ch, name, links, plain }: { ch: string; name: string; links: string[]; plain?: ReactNode }) => (
  <div style={{ background: '#FFFFFF', border: `1px solid ${rule}`, borderTop: `5px solid ${amber}`, padding: '24px 30px 26px', boxSizing: 'border-box', height: '100%' }}>
    <div style={{ fontSize: 26, fontWeight: 600, color: amber }}>{ch}</div>
    <div style={{ fontFamily: display, fontSize: 50, lineHeight: 1.25, marginTop: 6 }}>{name}</div>
    <div style={{ fontSize: 24, color: quiet, marginTop: 22 }}>要連到</div>
    <div style={{ fontFamily: mono, fontSize: 30, color: link, marginTop: 6, lineHeight: 1.5 }}>{links.map((n) => `[[${n}]]`).join('、')}</div>
    {plain ? <div style={{ fontSize: 26, color: muted, marginTop: 14, lineHeight: 1.45 }}>{plain}</div> : null}
  </div>
);

// 2-2, second half: the three events to pick from, then the check and its fix.
const Practice2Pick: Page = () => (
  <Shell chapter={2} source={'維基文庫《三國演義》第 5、16、20 回 zh.wikisource.org/wiki/三國演義'}>
    <PracticeEyebrow time="6 分鐘">練習 2｜寫卡</PracticeEyebrow>
    <Heading>從三個事件挑一個寫</Heading>
    <PromptsCopy step="練習 2-2" />
    <Fit>
      <In i={0} style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 36 }}>
        <EventPick ch="第 5 回" name="溫酒斬華雄" links={['關羽', '曹操']} plain="華雄寫純文字" />
        <EventPick ch="第 16 回" name="轅門射戟" links={['劉備', '關羽', '張飛']} plain="呂布寫純文字，也列進參與人物" />
        <EventPick ch="第 20 回" name="許田打圍" links={['曹操', '劉備', '關羽']} />
      </In>
      <In i={1} style={{ marginTop: 20, fontSize: 27, color: muted, textAlign: 'center' }}>「參與人物：」那一行照這樣列｜三英戰呂布、白門樓先不寫</In>
      <Steps>
        <Step duration={STEP_MS}><div style={{ display: 'flex', justifyContent: 'center', marginTop: 34 }}><StatusLine ok size={32}>看結果：打開〈關羽〉，反向連結裡有你寫的卡</StatusLine></div></Step>
        <Step duration={STEP_MS}><FixBox label="沒有出現" marginTop={16}>回這張卡看「關羽」：淡紫或黑字，就改成 [[關羽]] 再看一次</FixBox></Step>
      </Steps>
    </Fit>
  </Shell>
);

// One paragraph of the outline as Obsidian shows it; `linked` turns the event name into a link.
const OutlinePara = ({ linked }: { linked: boolean }) => (
  <div style={{ background: '#FFFFFF', border: `1px solid ${rule}`, padding: '22px 30px', fontSize: 30, lineHeight: 1.7 }}>
    <span style={{ color: link, textDecoration: 'underline' }}>曹操</span>在陳留散家財招募義兵……聯軍在汜水關由<span style={{ color: link, textDecoration: 'underline' }}>關羽</span>
    <span style={{ outline: `3px solid ${linked ? okGreen : amber}`, outlineOffset: 3, margin: '0 6px', color: linked ? link : ink, textDecoration: linked ? 'underline' : 'none' }}>溫酒斬華雄</span>，之後在虎牢關由<span style={{ color: link, textDecoration: 'underline' }}>劉備</span>、<span style={{ color: link, textDecoration: 'underline' }}>關羽</span>、<span style={{ color: link, textDecoration: 'underline' }}>張飛</span>合力戰退<span style={{ color: linkFaint, textDecoration: 'underline' }}>呂布</span>。
  </div>
);

// One swatch of the colour legend under the outline paragraph.
const Swatch = ({ color, under = true, box, children }: { color: string; under?: boolean; box?: string; children: ReactNode }) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
    <span style={{ fontSize: 28, color, textDecoration: under ? 'underline' : 'none', outline: box ? `3px solid ${box}` : undefined, outlineOffset: 2, padding: '0 4px' }}>字</span>
    {children}
  </span>
);

const AddLinksBack: Page = () => (
  <Shell chapter={2} source={'Obsidian 說明：內部連結 obsidian.md/help/links'}>
    <PracticeEyebrow time="5 分鐘">練習 2｜連回大綱</PracticeEyebrow>
    <Heading>把你的關係卡連回大綱</Heading>
    <Fit>
      <div style={{ width: 1400, margin: '0 auto' }}>
        <In i={0}>
          {/* Label left, colour legend right, on one line to leave room for the result and the fix below. */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <SmallLabel>補之前：範例大綱第 5 回，「溫酒斬華雄」是黑字</SmallLabel>
            <div style={{ display: 'flex', gap: 32, fontSize: 25, color: muted }}>
              <Swatch color={link}>有卡的連結</Swatch>
              <Swatch color={linkFaint}>還沒有卡</Swatch>
              <Swatch color={ink} under={false} box={amber}>黑字：還沒連</Swatch>
            </div>
          </div>
          <div style={{ marginTop: 10 }}><OutlinePara linked={false} /></div>
        </In>
        <Steps>
          <Step duration={STEP_MS}>
            <div style={{ marginTop: 26 }}>
              <SmallLabel color={okGreen}>補之後：改成 [[溫酒斬華雄]]，括號裡換成你寫的卡名</SmallLabel>
              <div style={{ marginTop: 10 }}><OutlinePara linked /></div>
              <div style={{ marginTop: 10, fontSize: 27, color: muted }}>大綱沒有一樣的字：段尾加<span style={{ color: link }}>（[[卡名]]）</span>，例如第 20 回加<span style={{ color: link }}>（[[許田打圍]]）</span></div>
            </div>
          </Step>
          <Step duration={STEP_MS}><div style={{ display: 'flex', justifyContent: 'center', marginTop: 22 }}><StatusLine ok size={32}>看結果：打開你寫的卡，反向連結出現〈三國演義大綱〉</StatusLine></div></Step>
          <Step duration={STEP_MS}><FixBox label="變成淡紫色" marginTop={16}>[[ ]] 裡的名字跟你寫的卡名不一樣，改成一字不差再看一次</FixBox></Step>
        </Steps>
      </div>
    </Fit>
  </Shell>
);

// Halfway: a 5-minute break, and the three things that should be done by now.
const BreakTime: Page = () => (
  <Shell>
    <Eyebrow>中場休息</Eyebrow>
    <Heading>休息 5 分鐘</Heading>
    <Lead>回來前，對一下這三項</Lead>
    <Fit>
      <div style={{ display: 'grid', gap: 34, justifyContent: 'center' }}>
        <In i={0}><StatusLine ok size={44}>Obsidian 打開三國筆記庫</StatusLine></In>
        <In i={1}><StatusLine ok size={44}>大綱在 整理/，點得到〈劉備〉</StatusLine></In>
        <In i={2}><StatusLine ok size={44}>你寫的關係卡連到人物，也連回大綱</StatusLine></In>
      </div>
    </Fit>
  </Shell>
);

// Recorded demo of practice 2, shown before the practice: move the outline in, write a card, link it back.
const VideoCard: Page = () => (
  <Shell chapter={2}>
    <Eyebrow>示範影片｜約 3 分鐘</Eyebrow>
    <Heading>示範影片：搬檔、寫卡、連回大綱</Heading>
    <Fit>
      <DemoVideo
        src={CARD_VIDEO}
        file="card-and-link.mp4"
        label="示範影片：把原文和大綱搬進筆記庫，照模板寫一張關係卡，再把卡名加進大綱，看反向連結"
        parts={[
          [0, '搬原文和大綱進來'],
          [32, '點大綱第 1 回的劉備'],
          [44, '在 關係/ 新增筆記，貼模板'],
          [68, '寫兩三句，人名加 [[ ]]'],
          [110, '填回目和出處'],
          [128, '大綱那一段加 [[卡名]]'],
          [150, '看反向連結'],
        ]}
      />
    </Fit>
  </Shell>
);

// ---------- 03 讓 Codex 讀筆記庫 ----------

const Section3: Page = () => <SectionPage chapter={3} label="03 / 讀筆記庫" lead="Codex 先翻你的筆記，再回答" />;

const MiniCard = ({ x, y, name, hot = false, dash = false }: { x: number; y: number; name: string; hot?: boolean; dash?: boolean }) => (
  <g>
    <rect x={x} y={y} width="136" height="58" fill={hot ? amberSoft : '#FFFFFF'} stroke={hot ? amber : rule} strokeWidth={hot ? 3 : 2} strokeDasharray={dash ? '8 6' : undefined} />
    <text x={x + 68} y={y + 38} textAnchor="middle" fontSize="24" fontWeight={hot ? 600 : 400} fill={hot ? ink : quiet}>{name}</text>
  </g>
);

const RagHead = ({ x, letter, term: word, english }: { x: number; letter: string; term: string; english: string }) => (
  <g>
    <text x={x} y="56" fontSize="62" fontFamily={display} fill={amber}>{letter}</text>
    <text x={x + 56} y="52" fontSize="36" fontWeight="600" fill={ink}>{word}</text>
    <text x={x + 140} y="52" fontSize="24" fill={quiet}>{english}</text>
  </g>
);

const RagIdea: Page = () => (
  <Shell chapter={3} source={'Lewis et al. 2020, Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks, arXiv:2005.11401'}>
    <Eyebrow>第三章的核心</Eyebrow>
    <Heading>檢索增強生成（RAG）</Heading>
    <Lead>像開書考：先翻筆記，再作答</Lead>
    <Fit>
      <Stage h={440}>
        <Steps>
          <Layer h={440} label="R 檢索：在關係資料夾找出寫到關羽的卡：桃園結義、煮酒論英雄、赤壁之戰和練習 2 寫的許田打圍">
            <InG i={0}><RagHead x={0} letter="R" term="檢索" english="Retrieval" /></InG>
            <InG i={1}>
              <rect x="0" y="86" width="500" height="320" fill={surface} />
              <rect x="24" y="106" width="452" height="56" rx="28" fill="#FFFFFF" stroke={ink} strokeWidth="2" />
              <text x="250" y="143" textAnchor="middle" fontSize="25" fill={ink}>關羽參與了哪些事件？只看 關係/</text>
            </InG>
            <InG i={2}><MiniCard x={24} y={192} name="桃園結義" /><MiniCard x={182} y={192} name="煮酒論英雄" /><MiniCard x={340} y={192} name="赤壁之戰" /></InG>
            <InG i={3}><MiniCard x={182} y={268} name="許田打圍" dash /></InG>
            <PopG i={6}><MiniCard x={24} y={192} name="桃園結義" hot /><MiniCard x={182} y={192} name="煮酒論英雄" hot /><MiniCard x={340} y={192} name="赤壁之戰" hot /></PopG>
            <PopG i={7}><MiniCard x={182} y={268} name="許田打圍" hot dash /></PopG>
            <InG i={8}><text x="250" y="378" textAnchor="middle" fontSize="26" fill={muted}>找出寫到關羽的卡</text></InG>
          </Layer>
          <Step duration={STEP_MS}><Layer h={440} label="A 增強：把問題和找到的卡一起交給模型">
            <MapArrow x1={512} x2={560} y={246} hot />
            <RagHead x={566} letter="A" term="增強" english="Augmented" />
            <rect x="566" y="86" width="500" height="320" fill={linkSoft} />
            <g className="aw2-build" style={buildDelay(0)}>
              <rect x="596" y="106" width="440" height="150" fill="#FFFFFF" stroke={link} strokeWidth="2" strokeDasharray="10 8" />
              <text x="616" y="142" fontSize="24" fill={link}>一起交出去</text>
              <SvgChip x={616} y={156} w={400} h={42} label="問題：關羽參與了哪些事件？" size={24} />
              <SvgChip x={616} y={208} w={190} h={40} label="桃園結義.md…" fill={amberSoft} stroke={amber} />
              <SvgChip x={826} y={208} w={190} h={40} label="許田打圍.md" fill={amberSoft} stroke={amber} />
            </g>
            <g className="aw2-build" style={buildDelay(1)}>
              <DownArrowSvg x={816} y1={262} y2={296} color={link} />
              <rect x="736" y="300" width="160" height="58" fill={link} />
              <text x="816" y="339" textAnchor="middle" fontSize="30" fontWeight="600" fill="#FFFFFF">模型</text>
              <text x="816" y="392" textAnchor="middle" fontSize="24" fill={muted}>問題附上筆記</text>
            </g>
          </Layer></Step>
          <Step duration={STEP_MS}><Layer h={440} label="G 生成：列出關羽參與的事件，並附上檔名">
            <MapArrow x1={1078} x2={1126} y={246} hot />
            <RagHead x={1132} letter="G" term="生成" english="Generation" />
            <rect x="1132" y="86" width="500" height="320" fill={sage} />
            <g className="aw2-build" style={buildDelay(0)}>
              <Bubble x={1160} y={110} w={444} h={120} />
              <text x="1186" y="160" fontSize="30" fontWeight="600" fill={ink}>桃園結義、……、許田打圍</text>
              <text x="1186" y="204" fontSize="24" fill={muted}>照筆記回答</text>
            </g>
            <g className="aw2-build" style={buildDelay(1)}>
              <text x="1160" y="296" fontSize="24" fill={amber} fontWeight="600">檔名</text>
              <SvgChip x={1222} y={268} w={170} label="桃園結義.md" fill={amberSoft} stroke={amber} />
              <SvgChip x={1404} y={268} w={200} label="許田打圍.md" fill={amberSoft} stroke={amber} />
              <text x="1382" y="378" textAnchor="middle" fontSize="26" fill={muted}>回答附上檔名</text>
            </g>
          </Layer></Step>
        </Steps>
      </Stage>
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={28}>模型不變，變的是輸入多了筆記</Takeaway></Step></Steps>
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
              <Pin style={{ ...CODEX_CALLOUT, top: 280 }}><Callout n={4} title="六個資料夾都在" detail="只看到外層：/quit，再 cd 進去" /></Pin>
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
    <Eyebrow>練習 3 的提示詞｜這一題貫穿整章</Eyebrow>
    <Heading>要求附出處（Citation）</Heading>
    <Fit>
      <In i={0}>
        <div style={{ background: '#FFFFFF', border: `1px solid ${rule}`, borderLeft: `8px solid ${amber}`, padding: '26px 40px' }}>
          <SmallLabel>在 Codex 輸入</SmallLabel>
          <div style={{ marginTop: 10 }}>
            <Steps>
              <PromptPart text="關羽參與了哪些事件？" tag="問題" />
              <Step duration={STEP_MS}><PromptPart text="只根據 關係/ 資料夾裡的卡回答，" tag="範圍" /></Step>
              <Step duration={STEP_MS}><PromptPart text="每個事件附上檔名和一句卡片原句；" tag="出處" /></Step>
              <Step duration={STEP_MS}><PromptPart text="卡片沒寫的就說找不到，不要自己補。" tag="限制" /></Step>
            </Steps>
          </div>
        </div>
      </In>
      <Steps><Step duration={STEP_MS}><Takeaway>附上檔名和原句，回答才能查證</Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

// The premise of practice 3, before the demo: 關羽's card links only three events, so the fourth
// (the card written in practice 2) has to be found by Codex searching 關係/ itself.
const RelCard = ({ y, name, mine = false }: { y: number; name: string; mine?: boolean }) => (
  <g>
    <DocShape x={960} y={y} w={340} h={74} fill={mine ? amberSoft : '#FFFFFF'} stroke={mine ? amber : rule} sw={mine ? 3 : 2} dash={mine ? '10 7' : undefined} />
    <text x={984} y={y + 48} fontSize="32" fontWeight={mine ? 600 : 400} fill={ink}>{name}</text>
  </g>
);

const FourthEvent: Page = () => (
  <Shell chapter={3}>
    <Eyebrow>練習 3 的題目｜先看關羽卡</Eyebrow>
    <Heading>檢索（Retrieval）：關羽卡沒列的事件</Heading>
    <Lead>關羽卡只列了 3 件事，沒有〈許田打圍〉</Lead>
    <Fit>
      <Stage h={450}>
        <Steps>
          <Layer h={450} label="人物/關羽.md 最後一行「關係與事件」只連到桃園結義、煮酒論英雄、赤壁之戰；關係/ 裡的許田打圍是練習 2 寫的卡，關羽卡沒有連到它">
            <InG i={0}>
              <DocShape x={0} y={60} w={620} h={330} fill="#FFFFFF" stroke={rule} />
              <text x="30" y="110" fontSize="26" fill={quiet}>人物/關羽.md 最後一行</text>
              <text x="30" y="190" fontSize="34" fill={ink}>關係與事件：</text>
              <text x="30" y="254" fontSize="34" fill={link} textDecoration="underline">桃園結義</text>
              <text x="30" y="306" fontSize="34" fill={link} textDecoration="underline">煮酒論英雄</text>
              <text x="30" y="358" fontSize="34" fill={link} textDecoration="underline">赤壁之戰</text>
            </InG>
            <InG i={1}>
              <Folder x={930} y={0} w={702} h={450} fill="#FBF7F2" stroke={amber} />
              <text x="960" y="58" fontSize="30" fontWeight="600" fill={ink}>關係/</text>
              <RelCard y={86} name="桃園結義" />
              <RelCard y={176} name="煮酒論英雄" />
              <RelCard y={266} name="赤壁之戰" />
              <RelCard y={356} name="許田打圍" mine />
              <text x="1284" y="404" textAnchor="end" fontSize="24" fill={amber} fontWeight="600">練習 2 寫的卡</text>
            </InG>
            <g fill="none" stroke={link} strokeWidth="3">
              <DrawPath i={3} d="M200 244 C520 244 700 123 950 123" />
              <DrawPath i={4} d="M230 296 C520 296 700 213 950 213" />
              <DrawPath i={5} d="M200 348 C520 348 700 303 950 303" />
            </g>
            <InG i={7}>
              <line x1="640" y1="393" x2="940" y2="393" stroke={faint} strokeWidth="3" strokeDasharray="10 8" />
              <CrossMark x={790} y={393} size={26} color={warn} />
              <text x="790" y="440" textAnchor="middle" fontSize="26" fill={warn}>關羽卡沒連到它</text>
            </InG>
          </Layer>
          <Step duration={STEP_MS}><Layer h={450} label="Codex 自己搜 關係/ 的每一張卡，許田打圍裡寫了 [[關羽]]，所以 4 張都找得到">
            <g className="aw2-build" style={buildDelay(0)}>
              <rect x="1312" y="78" width="10" height="360" fill={okGreen} />
              <text x="1340" y="160" fontSize="30" fontWeight="600" fill={okGreen}>Codex 搜 關係/</text>
              <text x="1340" y="204" fontSize="30" fontWeight="600" fill={okGreen}>找到 4 張</text>
              <text x="1340" y="256" fontSize="25" fill={muted}>許田打圍裡</text>
              <text x="1340" y="292" fontSize="25" fill={muted}>寫了 [[關羽]]</text>
            </g>
          </Layer></Step>
        </Steps>
      </Stage>
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={24}>4 件事都列出來，原句也都對得回卡片，回答才算正確</Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

// Recorded demo of practice 3: the 關羽 question in the instructor's vault, then checking it in Obsidian.
const VideoRag: Page = () => (
  <Shell chapter={3}>
    <Eyebrow>示範影片｜約 2 分鐘</Eyebrow>
    <Heading>示範影片：Codex 找到〈許田打圍〉</Heading>
    <Fit>
      <DemoVideo
        src={RAG_VIDEO}
        file="rag-own-card.mp4"
        label="示範影片：在筆記庫用 Codex 問關羽參與了哪些事件，看它搜尋、附上檔名和原句，再回 Obsidian 用搜尋核對原句，對照關羽卡，四張卡都有"
        parts={[
          [0, '貼上練習 3 的提示詞'],
          [11, 'Codex 先搜尋 關係/'],
          [23, '回答附檔名和原句'],
          [43, '回 Obsidian 搜原句'],
          [82, '對照關羽卡最後一行'],
        ]}
      />
    </Fit>
  </Shell>
);

// Practice 3: ask on your own vault, then match every line of the answer to the card it names.
// Left: what Codex answered. Right: the same sentence in the card. The list on the right is
// 關羽's own list of events plus your card, so a missing row also shows up. Rows have a fixed
// height so each tick lands between its pair on a click.
const CK_COLS = '640px 1fr 640px';
const CK_HEAD = 104;
const CK_ROW = 66;
const CK_GAP = 8;

const CkSide = ({ title, sub, color }: { title: string; sub: string; color: string }) => (
  <div style={{ borderTop: `5px solid ${color}`, paddingTop: 10 }}>
    <div style={{ fontSize: 30, fontWeight: 600 }}>{title}</div>
    <div style={{ fontSize: 24, color: muted }}>{sub}</div>
  </div>
);

// One pair: the answer's line on the left, the card's sentence on the right.
const CkRow = ({ ev, quote, mine = false }: { ev: string; quote: string; mine?: boolean }) => {
  const border = `2px ${mine ? 'dashed' : 'solid'} ${mine ? amber : rule}`;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: CK_COLS, alignItems: 'center', height: CK_ROW }}>
      <div style={{ height: '100%', boxSizing: 'border-box', display: 'flex', alignItems: 'center', gap: 18, padding: '0 20px', background: term, color: '#F5F5F4', border: mine ? border : `2px solid ${term}` }}>
        <span style={{ fontSize: 28, fontWeight: 600, whiteSpace: 'nowrap' }}>{ev}</span>
        <span style={{ fontSize: 27, color: '#D6D3D1' }}>{quote}</span>
      </div>
      <div style={{ height: 0, borderTop: `3px dashed ${faint}`, margin: '0 14px' }} />
      <div style={{ height: '100%', boxSizing: 'border-box', display: 'flex', alignItems: 'center', gap: 18, padding: '0 20px', background: '#FFFFFF', border }}>
        <span style={{ fontFamily: mono, fontSize: 24, color: muted, whiteSpace: 'nowrap' }}>{ev}.md</span>
        <span style={{ fontSize: 27, background: amberSoft, padding: '2px 6px' }}>{quote}</span>
      </div>
    </div>
  );
};

// The verdict for row k (0-based), dropped onto the middle of its connector.
const CkTick = ({ k, label }: { k: number; label: string }) => (
  <div style={{ position: 'absolute', left: 640, right: 640, top: CK_HEAD + k * (CK_ROW + CK_GAP), height: CK_ROW, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
    <svg viewBox="0 0 48 48" style={{ width: 40, height: 40, display: 'block' }} aria-hidden="true"><OkDot x={24} y={24} r={22} /></svg>
    <span style={{ fontSize: 24, fontWeight: 600, color: okGreen, background: 'var(--osd-bg)', padding: '0 4px' }}>{label}</span>
  </div>
);

const AskCheck: Page = () => (
  <Shell chapter={3} source={'Lewis et al. 2020, arXiv:2005.11401；Gao et al. 2023（核對引文）, arXiv:2305.14627'}>
    <PracticeEyebrow time="15 分鐘">練習 3｜換你問</PracticeEyebrow>
    <Heading>核對回答：4 件事都要對得回卡片</Heading>
    <PromptsCopy step="練習 3" />
    <PillRow>
      <span style={{ fontSize: 30, fontWeight: 600, marginRight: 8 }}>關羽參與了哪些事件？</span>
      <Pill tag="定位">關係/ 的卡</Pill>
      <Pill tag="期望輸出">檔名＋原句</Pill>
      <Pill tag="限制">沒寫說找不到</Pill>
    </PillRow>
    <Fit>
      <In i={1} style={{ position: 'relative' }}>
        <div style={{ display: 'grid', gridTemplateColumns: CK_COLS, height: CK_HEAD - 14, marginBottom: 14 }}>
          <CkSide title="Codex 回答的" sub="事件和它引用的原句" color={amber} />
          <div style={{ alignSelf: 'end', textAlign: 'center', fontSize: 24, lineHeight: 1.35, color: muted }}><span style={{ fontFamily: mono }}>Cmd/Ctrl+F</span><br />人名開頭：跳過再搜</div>
          <CkSide title="卡片裡寫的" sub="關羽卡列的 3 張＋你寫的卡（例：許田打圍）" color={okGreen} />
        </div>
        <div style={{ display: 'grid', gap: CK_GAP }}>
          <CkRow ev="桃園結義" quote="「誓畢拜劉備為兄，關羽次之」" />
          <CkRow ev="煮酒論英雄" quote="「衝進後園按劍而立」" />
          <CkRow ev="赤壁之戰" quote="「念及當年在曹營受到的厚待」" />
          <CkRow ev="許田打圍" quote="「提刀拍馬要斬曹操」" mine />
        </div>
        <Steps>
          <Step duration={STEP_MS}><CkTick k={0} label="對得上" /></Step>
          <Step duration={STEP_MS}><CkTick k={1} label="對得上" /></Step>
          <Step duration={STEP_MS}><CkTick k={2} label="對得上" /></Step>
          <Step duration={STEP_MS}><CkTick k={3} label="Codex 自己找到" /></Step>
        </Steps>
      </In>
      <Steps>
        <Step duration={STEP_MS}><FixBox label="你寫的卡沒出現" labelWidth={200} marginTop={14}>檢查卡在不在 關係/ 資料夾、卡裡有沒有 [[關羽]]</FixBox></Step>
        <Step duration={STEP_MS}><FixBox label="對不上才追問" labelWidth={200} marginTop={8}>你引用的「<u>　　　</u>」跟 <u>　　　</u>.md 寫的不一樣。請照卡片原句改正；找不到就說找不到。</FixBox></Step>
      </Steps>
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
  <Shell source={'Lewis et al. 2020, arXiv:2005.11401（檢索）；搜尋工具 rg（ripgrep）github.com/BurntSushi/ripgrep'}>
    <Eyebrow>附錄｜曹操題 1／5｜R</Eyebrow>
    <Heading>R 檢索：Codex 先搜尋筆記</Heading>
    <Lead>像按 Ctrl+F，把整個資料夾搜一遍</Lead>
    <Fit>
      <In i={0}>
        <div style={{ background: term, color: '#F5F5F4', padding: '16px 28px', fontFamily: mono, fontSize: 27, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span><span style={{ color: '#8DD4A0' }}>Ran</span>{" rg -n -i '曹操|戰役|戰爭|之戰|大戰' -g '*.md' ."}</span>
          <span style={{ fontFamily: 'var(--osd-font-body)', fontSize: 24, color: '#BCC3CC' }}>Codex 紀錄</span>
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
                <div className="aw2-build" style={{ ...buildDelay(6), display: 'flex', alignItems: 'center', gap: 12, marginTop: 6, fontSize: 25, color: muted }}>
                  <span style={{ width: 40, height: 20, background: amber }} />橘＝回答引用的檔
                </div>
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
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={20}>Codex 這次只讀搜尋命中的句子，沒讀整張卡</Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

// A matched line from the search, labelled with its file and line number.
// Amber edge = a line the search found and sent along with the question.
const Excerpt = ({ y, file, text }: { y: number; file: string; text: string }) => (
  <g>
    <rect x="0" y={y} width="860" height="84" fill="#FFFFFF" stroke={rule} strokeWidth="2" />
    <rect x="0" y={y} width="8" height="84" fill={amber} />
    <text x="28" y={y + 30} fontSize="24" fontFamily={mono} fill={quiet}>{file}</text>
    <text x="28" y={y + 68} fontSize="26" fill={ink}>{text}</text>
  </g>
);

const UsedMark = ({ y }: { y: number }) => (
  <g><rect x="-6" y={y - 6} width="872" height="96" fill="none" stroke={okGreen} strokeWidth="5" /><OkDot x={866} y={y} r={20} /></g>
);

const AStep: Page = () => (
  <Shell source={'Lewis et al. 2020, Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks, arXiv:2005.11401'}>
    <Eyebrow>附錄｜曹操題 2／5｜A</Eyebrow>
    <Heading>A 增強：找到的句子跟著問題送出</Heading>
    <Lead>像把翻到的那幾頁攤在桌上</Lead>
    <Fit>
      <Stage h={450}>
        <Steps>
          <Layer h={450} label="搜尋找到的句子（節選，橘色邊）：曹操卡第 11 行、赤壁之戰卡第 13 和 19 行、大綱第 44 行">
            <InG i={0}><rect x="0" y="4" width="8" height="26" fill={amber} /><text x="20" y="24" fontSize="25" fontWeight="600" fill={amber}>搜到的句子（77 行中的 4 行）</text></InG>
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
              <rect x="1024" y="202" width="270" height="40" fill="#FFFFFF" stroke={amber} strokeWidth="2" /><text x="1159" y="230" textAnchor="middle" fontSize="24" fontFamily={mono} fill={ink}>曹操.md:11</text>
              <rect x="1024" y="252" width="270" height="40" fill="#FFFFFF" stroke={amber} strokeWidth="2" /><text x="1159" y="280" textAnchor="middle" fontSize="24" fontFamily={mono} fill={ink}>赤壁之戰.md:13</text>
              <text x="1159" y="336" textAnchor="middle" fontSize="24" fill={amber}>……共 77 行搜尋結果</text>
            </g>
            <g className="aw2-build" style={buildDelay(2)}>
              <MapArrow x1={1336} x2={1400} y={220} hot />
              <rect x="1412" y="160" width="220" height="120" fill={link} />
              <text x="1522" y="232" textAnchor="middle" fontSize="36" fontWeight="600" fill="#FFFFFF">模型</text>
              <text x="1522" y="330" textAnchor="middle" fontSize="25" fill={ink}>44,156 token</text>
              <text x="1522" y="366" textAnchor="middle" fontSize="24" fill={quiet}>含 Codex 自己的說明</text>
            </g>
          </Layer></Step>
          <Step duration={STEP_MS}><Layer h={450} label="回答真正引用的是曹操卡第 11 行和赤壁之戰卡第 19 行">
            <g className="aw2-build" style={buildDelay(0)}><UsedMark y={44} /><UsedMark y={244} /></g>
            <g className="aw2-build" style={buildDelay(1)}><text x="840" y="24" textAnchor="end" fontSize="25" fontWeight="600" fill={okGreen}>打勾＝回答真正引用的句子</text></g>
          </Layer></Step>
        </Steps>
      </Stage>
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={20}>模型拿到的是問題加上檢索到的筆記</Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

const AnsLine = ({ children, color = '#F5F5F4', size = 28, indent = 0 }: { children: ReactNode; color?: string; size?: number; indent?: number }) => (
  <div style={{ fontFamily: mono, fontSize: size, lineHeight: 1.55, color, paddingLeft: indent, whiteSpace: 'pre' }}>{children}</div>
);

const GStep: Page = () => (
  <Shell source={'Gao et al. 2023, Enabling Large Language Models to Generate Text with Citations, arXiv:2305.14627'}>
    <Eyebrow>附錄｜曹操題 3／5｜G</Eyebrow>
    <Heading>G 生成：回答附上檔名和原句</Heading>
    <Fit>
      <div style={{ display: 'grid', gridTemplateColumns: '720px 1fr', gap: 48, alignItems: 'center' }}>
        <In i={0}>
          <div style={{ background: term, borderTop: `5px solid ${amber}`, padding: '20px 30px 26px' }}>
            <div style={{ fontSize: 24, color: '#BCC3CC', marginBottom: 10 }}>Codex 實際回答（全文，排版調整）</div>
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
                <div style={{ marginTop: 10, position: 'relative', width: 852 }}>
                  <Screenshot src={caocaoLine} aspect={1078 / 54} width={852} alt="曹操卡的實際畫面：第 49 至 50 回曹操率大軍南下，在赤壁之戰被孫權麾下的周瑜火燒戰船" />
                  <div style={{ position: 'absolute', inset: -5, border: `4px solid ${okGreen}`, pointerEvents: 'none' }} />
                </div>
              </div>
            </Step>
            <Step duration={STEP_MS}>
              <div style={{ marginTop: 40 }}>
                <SmallLabel>打開 關係/赤壁之戰.md，找到這一句</SmallLabel>
                <div style={{ marginTop: 10, position: 'relative', width: 620 }}>
                  <Screenshot src={chibiParticipants} aspect={668 / 65} width={620} alt="赤壁之戰卡的實際畫面：參與人物：孫權、曹操、劉備、關羽、張飛" />
                  <div style={{ position: 'absolute', inset: -5, border: `4px solid ${okGreen}`, pointerEvents: 'none' }} />
                </div>
              </div>
            </Step>
          </Steps>
        </div>
      </div>
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={36}>有檔名和原句，就能回筆記核對</Takeaway></Step></Steps>
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
const PromptQuote = ({ children, minHeight = 120 }: { children: ReactNode; minHeight?: number }) => (
  <div style={{ background: '#FFFFFF', border: `1px solid ${rule}`, borderLeft: `6px solid ${amber}`, padding: '12px 20px', fontSize: 27, lineHeight: 1.5, marginBottom: 16, minHeight, boxSizing: 'border-box' }}>{children}</div>
);

// What the model did between the prompt and the answer: an arrow, then the route taken.
const RouteLine = ({ ok, children }: { ok: boolean; children: ReactNode }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 26, color: ok ? okGreen : quiet, fontWeight: 600, margin: '0 0 14px 6px' }}>
    <svg viewBox="0 0 30 36" style={{ width: 24, height: 30, flexShrink: 0 }} aria-hidden="true">
      <path d="M15 2 V28 M6 20 L15 32 L24 20" fill="none" stroke={ok ? okGreen : faint} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
    <span>{children}</span>
  </div>
);

// One cited source inside the RAG answer: file name, then the card line it quotes.
const CiteLine = ({ file, quote }: { file: string; quote: string }) => (
  <div style={{ display: 'flex', gap: 14, alignItems: 'baseline', fontSize: 24, lineHeight: 1.5, marginTop: 6 }}>
    <span style={{ fontFamily: mono, color: okGreen, fontWeight: 600, whiteSpace: 'nowrap' }}>{file}</span>
    <span style={{ color: muted }}>{quote}</span>
  </div>
);

// One extra rule the RAG prompt adds on top of the bare question.
const AddedRule = ({ children }: { children: ReactNode }) => (
  <span style={{ background: amberSoft, color: amber, fontSize: 24, fontWeight: 600, padding: '4px 14px', borderRadius: 20, whiteSpace: 'nowrap' }}>＋{children}</span>
);

const WithWithout: Page = () => (
  <Shell source={'Shuster et al. 2021, Retrieval Augmentation Reduces Hallucination in Conversation, arXiv:2104.07567'}>
    <Eyebrow>附錄｜曹操題 4／5｜同一題問兩次</Eyebrow>
    <Heading>有 RAG 和沒有 RAG 的回答</Heading>
    <Fit>
      {/* Input first: both prompts show on arrival; route + answer land on clicks, left then right. */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48 }}>
        <AnswerPanel title="沒有 RAG" sub="空資料夾，直接問" tone="plain">
          <PromptQuote minHeight={112}>曹操參與哪場戰役？</PromptQuote>
          <Steps>
            <Step duration={STEP_MS}>
              <RouteLine ok={false}>沒有資料可查，憑模型記憶回答</RouteLine>
              <AnswerBox>官渡之戰（200年）、赤壁之戰（208年）、濮陽、下邳、潼關之戰等</AnswerBox>
              <StatusLine ok={false}>說不出根據哪份資料</StatusLine>
            </Step>
          </Steps>
        </AnswerPanel>
        <AnswerPanel title="有 RAG" sub="在筆記庫，先查再答" tone="ok">
          <PromptQuote minHeight={112}>
            依這座筆記庫，曹操參與哪場戰役？
            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}><AddedRule>只看卡片</AddedRule><AddedRule>附檔名和原句</AddedRule><AddedRule>沒寫就說找不到</AddedRule></div>
          </PromptQuote>
          <Steps>
            <Step duration={STEP_MS}>
              <RouteLine ok>先搜尋筆記庫，引用 2 張卡裡的句子</RouteLine>
              <AnswerBox>
                赤壁之戰
                <CiteLine file="人物/曹操.md" quote="「…在赤壁之戰被孫權麾下的周瑜火燒戰船」" />
                <CiteLine file="關係/赤壁之戰.md" quote="「參與人物：孫權、曹操、劉備…」" />
                <div style={{ fontSize: 24, color: quiet, marginTop: 6 }}>其他戰役：筆記裡找不到</div>
              </AnswerBox>
              <StatusLine ok>引用的句子都找得到</StatusLine>
            </Step>
          </Steps>
        </AnswerPanel>
      </div>
      <Steps>
        <Step duration={STEP_MS}><div style={{ marginTop: 26, textAlign: 'center', fontSize: 32, color: amber, fontWeight: 600 }}>右邊引用有根據，但只答了一場：大綱裡的濮陽、下邳都漏了</div></Step>
      </Steps>
    </Fit>
  </Shell>
);

// The jump arrow on the provenance page, in the step-3 block's own px (its left edge = x 600).
const P32_JUMP = 'M82 276 C82 340 400 340 580 300';
const P32_HEAD = '598,296 578,288 582,310';

const LinksHelp: Page = () => (
  <Shell source={'Obsidian 說明：內部連結 obsidian.md/help/links'}>
    <Eyebrow>附錄｜為什麼連結要寫好</Eyebrow>
    <Heading>來源追溯（Provenance）</Heading>
    <Lead>像論文的參考文獻，一路往回查</Lead>
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
              <div style={{ position: 'relative' }}>
                {/* The jump: from the marked link in step 2, under its line, into the card. */}
                <svg viewBox="0 0 600 400" style={{ position: 'absolute', left: -600, top: 0, width: 600, height: 400, overflow: 'visible' }} aria-hidden="true">
                  <g fill="none" stroke={amber} strokeWidth="4"><StepPath d={P32_JUMP} /></g>
                  <g className="aw2-build" style={buildDelay(4)}><polygon points={P32_HEAD} fill={amber} /></g>
                </svg>
                <div className="aw2-build" style={buildDelay(4)}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 30, marginBottom: 12 }}><NumDot n={3} />跳到〈赤壁之戰〉</div>
                  <Screenshot src={chibiTop} aspect={746 / 330} width={600} caption="Obsidian 實際畫面（節選）" alt="赤壁之戰關係卡：回目 49，第一句寫曹操收服北方後率大軍南下" />
                </div>
              </div>
            </Step>
          </Steps>
        </div>
      </div>
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={32}>檔名指出出處，連結帶你回到相關的卡</Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

const LimitMissing: Page = () => (
  <Shell source={'Barnett et al. 2024, Seven Failure Points When Engineering a RAG System, arXiv:2401.05856'}>
    <Eyebrow>附錄｜RAG 的限制 1</Eyebrow>
    <Heading>缺少內容（Missing Content）</Heading>
    <Lead>筆記沒寫的內容，檢索不到</Lead>
    <In i={0} style={{ marginTop: 26 }}><PromptQuote minHeight={0}>官渡之戰是誰打贏的？請只根據這個筆記庫裡的 .md 卡片回答，附上檔名；筆記沒寫的就說找不到，不要自己補。</PromptQuote></In>
    <Fit>
      <Stage h={310}>
        <Steps>
          <Layer h={310} label="Codex 搜尋「官渡」，沒有任何卡提到">
            <InG i={1}>
              <Folder x={110} y={0} w={340} h={200} fill="#FBF7F2" stroke={amber} />
              <SvgIcon kind="search" x={280} y={106} size={96} color={amber} />
              <text x="280" y="250" textAnchor="middle" fontSize="30" fill={muted}>搜尋「官渡」</text></InG>
            <PopG i={4}><text x="280" y="300" textAnchor="middle" fontSize="32" fontWeight="600" fill={amber}>0 張卡提到</text></PopG>
          </Layer>
          <Step duration={STEP_MS}><Layer h={310} label="Codex 的實際回答：找不到。筆記庫中的 .md 卡片沒有提到官渡之戰或其勝負">
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
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={24}>筆記沒寫時，正確的回答是「找不到」</Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

const Added = ({ children }: { children: ReactNode }) => (
  <mark style={{ background: '#F6D78B', color: ink, padding: '0 4px' }}>{children}</mark>
);

const LimitMiss: Page = () => (
  <Shell source={'Barnett et al. 2024, arXiv:2401.05856；Liu et al. 2023, Lost in the Middle, arXiv:2307.03172'}>
    <Eyebrow>附錄｜曹操題 5／5｜搜到卻沒用上</Eyebrow>
    <Heading>搜到卻沒用上</Heading>
    <Lead>搜到的內容，回答也可能漏掉沒用</Lead>
    <Fit>
      {/* First answer on arrival; click 1 shows what it missed; click 2 the narrower question and its answer. */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48 }}>
        <AnswerPanel title="第一次問" sub="範圍：整座筆記庫" tone="plain">
          <PromptQuote minHeight={0}>依這座筆記庫，曹操參與哪場戰役？只根據 .md 卡片回答，每個說法附上檔名和一句卡片原句；……</PromptQuote>
          <AnswerBox>赤壁之戰。<br /><span style={{ color: amber }}>「筆記中找不到曹操參與其他戰役」</span></AnswerBox>
          <Steps>
            <Step duration={STEP_MS}><StatusLine ok={false}>大綱搜到 26 行，濮陽、下邳都沒算</StatusLine></Step>
          </Steps>
        </AnswerPanel>
        <Steps>
          <Step duration={STEP_MS}>
            <AnswerPanel title="縮小範圍再問" sub="範圍：只查大綱" tone="ok">
              <PromptQuote minHeight={0}>再查 <Added>整理/三國演義大綱.md</Added>：曹操在<Added>第 1 到 21 回</Added>參與了哪些戰役？<Added>每一項附回目</Added>和檔名；筆記沒寫的不要補。</PromptQuote>
              <AnswerBox>列出 <strong>7 項</strong>：滎陽（第 6 回）、<br />濮陽（第 11 回）、下邳（第 19 回）……</AnswerBox>
            </AnswerPanel>
          </Step>
        </Steps>
      </div>
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={24}>縮小檢索範圍：指定檔案和回目</Takeaway></Step></Steps>
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
  <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr 250px', alignItems: 'center', background: head ? raised : '#FFFFFF', borderBottom: `1px solid ${rule}`, fontSize: head ? 24 : 28, fontWeight: head ? 600 : 400, color: head ? muted : ink, lineHeight: 1.35, padding: '6px 0' }}>
    <span style={{ paddingLeft: 20, color: head ? muted : quiet }}>{n}</span>
    <span>{battle}</span>
    <span>{ch}</span>
  </div>
);

// Where row 1 of the answer table sits inside the page's wrapper (measured on the rendered page).
const P3_ROW1_TOP = 96;
const P3_ROW_H = 51;

const Practice3: Page = () => (
  <Shell source={'維基文庫《三國演義》第 1–21 回 zh.wikisource.org/wiki/三國演義'}>
    <Eyebrow>附錄｜進階討論｜「參與」算到哪裡</Eyebrow>
    <Heading>核對範例大綱上的 7 項戰役</Heading>
    <PromptsCopy step="進階討論" />
    <PillRow>
      <Pill tag="定位">範例大綱</Pill>
      <Pill tag="期望輸出">每列打勾或問號</Pill>
      <Pill tag="限制">只看大綱</Pill>
    </PillRow>
    <Fit>
      {/* The task is on screen from the start; the one click is the answer: row 1 gets its "?" and the reason. */}
      <div style={{ position: 'relative' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1020px 1fr', gap: 64, alignItems: 'center' }}>
        <In i={1}>
          <SmallLabel>曹操在第 1–21 回的戰役（Codex 的回答，共 7 項）</SmallLabel>
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
        <In i={2} style={{ display: 'grid', gap: 20 }}>
          <div style={{ fontSize: 31, fontWeight: 600 }}>每一列問三件事</div>
          <StatusLine ok size={30}>檔案在嗎</StatusLine>
          <StatusLine ok size={30}>原句在嗎</StatusLine>
          <StatusLine ok size={30}>有沒有多寫</StatusLine>
          <div style={{ marginTop: 14, display: 'grid', gap: 10, fontSize: 24, color: muted }}>
            <span>回答：<FileLink href={ADV3_URL}>進階_曹操戰役回答.md</FileLink></span>
            <span>對照：<FileLink href={SAMPLE_OUTLINE_URL}>三國演義大綱.md</FileLink></span>
          </div>
        </In>
      </div>
      <Steps>
        <Step duration={STEP_MS}>
          {/* Row 1 of the table, outlined, with its "?" (offsets: label + rule + head row). */}
          <div className="aw2-build" style={{ ...buildDelay(0), position: 'absolute', left: -6, top: P3_ROW1_TOP, width: 1032, height: P3_ROW_H, border: `4px solid ${amber}`, boxSizing: 'border-box' }} />
          <svg className="aw2-build" viewBox="0 0 48 48" style={{ ...buildDelay(1), position: 'absolute', left: 950, top: P3_ROW1_TOP + P3_ROW_H / 2 - 22, width: 44, height: 44 }} aria-hidden="true"><AskMark x={24} y={24} r={22} /></svg>
          <div style={{ marginTop: 22, fontSize: 31, textAlign: 'center' }}><strong style={{ color: amber }}>第 1 列值得討論：</strong>大綱第 5 回只寫曹操發檄文，沒寫他上陣</div>
        </Step>
      </Steps>
      </div>
    </Fit>
  </Shell>
);

const Practice3Ask: Page = () => (
  <Shell source={'維基文庫《三國演義》第 5 回 zh.wikisource.org/wiki/三國演義/第005回'}>
    <Eyebrow>附錄｜進階討論｜追問</Eyebrow>
    <Heading>追問 Codex 引用原句</Heading>
    <PromptsCopy step="進階討論" />
    <Fit>
      <In i={0}>
        <Terminal title="Codex 回覆（範例大綱，節錄）" width={1632} size={27}>
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
        <Step duration={STEP_MS}><Takeaway marginTop={22}>要求引用原句，比較看得出哪項是模型自己補的</Takeaway></Step>
        <Step duration={STEP_MS}>
          {/* The template's opening (the rest is in prompts.md), then two questions to put in its blank. */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16, marginTop: 22, fontSize: 28 }}>
            <span style={{ color: muted }}>有時間，自己問一題：</span>
            <span style={{ background: term, color: '#F5F5F4', fontFamily: mono, fontSize: 27, padding: '8px 22px' }}><AskLine>（你的問題）</AskLine>只根據 人物/ 勢力/ 關係/ 整理/ 裡的卡回答……</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 20, marginTop: 20 }}>
            <span style={{ fontSize: 28, color: muted }}>例如：</span>
            <QChip>白門樓上，劉備對曹操說了什麼原話？</QChip>
            <QChip>關羽在第 1 到 21 回斬了哪些人？</QChip>
          </div>
        </Step>
      </Steps>
    </Fit>
  </Shell>
);

// ---------- 04 請 Codex 畫關係圖 ----------

const Section4: Page = () => <SectionPage chapter={4} label="04 / 關係圖" lead="把練習 2 寫的卡，畫進關羽的關係圖" />;

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

// One row of the node / edge legend beside the graph.
const KgKey = ({ y, title, sub, children }: { y: number; title: string; sub: string; children: ReactNode }) => (
  <g>
    {children}
    <text x="1310" y={y - 6} fontSize="30" fontWeight="600" fill={ink}>{title}</text>
    <text x="1310" y={y + 32} fontSize="25" fill={muted}>{sub}</text>
  </g>
);

// A grey "?" for a guessed edge, so it doesn't borrow the amber of the person nodes.
const GuessMark = ({ x, y, r = 22 }: { x: number; y: number; r?: number }) => (
  <g><circle cx={x} cy={y} r={r} fill={muted} /><text x={x} y={y + Math.max(24, r * 1.3) * 0.35} textAnchor="middle" fontSize={Math.max(24, r * 1.3)} fontWeight="700" fill="#FFFFFF">?</text></g>
);

const PointsLines: Page = () => (
  <Shell chapter={4} source={'Hogan et al. 2021, Knowledge Graphs, ACM Computing Surveys, arXiv:2003.02320'}>
    <Eyebrow>關係圖怎麼看</Eyebrow>
    <Heading>知識圖譜（Knowledge Graph）</Heading>
    <Lead>人物和事件畫成點，有關係就連一條線</Lead>
    <Fit>
      <Stage h={440}>
        <Steps>
          <Layer h={440} label="節點：劉備、關羽、張飛、曹操四個人物，桃園結義、煮酒論英雄兩個事件">
            {/* People first (劉備、關羽、張飛、曹操, as the notes read them), then the two events, then the legend. */}
            <PopG i={0}><MapPerson x={570} y={84} name="劉備" r={52} size={32} /></PopG>
            <PopG i={0.6}><MapPerson x={110} y={80} name="關羽" r={52} size={32} /></PopG>
            <PopG i={1.2}><MapPerson x={110} y={360} name="張飛" r={52} size={32} /></PopG>
            <PopG i={1.8}><MapPerson x={1060} y={84} name="曹操" r={52} size={32} /></PopG>
            <InG i={2.8}><MapBox x={200} y={185} w={200} h={70} label="桃園結義" fill={sage} stroke={okGreen} size={30} /></InG>
            <InG i={3.4}><MapBox x={730} y={185} w={220} h={70} label="煮酒論英雄" fill={sage} stroke={okGreen} size={30} /></InG>
            <InG i={4.4}>
              <rect x="1180" y="20" width="452" height="400" fill="#FFFFFF" stroke={rule} strokeWidth="2" />
              <KgKey y={110} title="節點（Node）" sub="人物、事件">
                <circle cx="1226" cy="104" r="20" fill={amberSoft} stroke={amber} strokeWidth="2" /><rect x="1252" y="90" width="36" height="28" fill={sage} stroke={okGreen} strokeWidth="2" />
              </KgKey>
            </InG>
          </Layer>
          <Step duration={STEP_MS}><Layer h={440} label="邊：劉關張連到桃園結義，劉備和曹操連到煮酒論英雄，都是灰色實線，卡片有原句">
            <g fill="none" stroke={quiet} strokeWidth="5" strokeLinecap="round">
              <StepPath d="M146 118 L232 185" i={0} />
              <StepPath d="M146 322 L232 255" i={1} />
              <StepPath d="M530 118 L380 185" i={2} />
              <StepPath d="M610 118 L770 185" i={3} />
              <StepPath d="M1020 118 L920 185" i={4} />
            </g>
            <g className="aw2-build" style={buildDelay(4)}>
              <KgKey y={210} title="邊（Edge）" sub="卡片裡有原句">
                <path d="M1206 204 H1290" stroke={quiet} strokeWidth="6" />
              </KgKey>
            </g>
          </Layer></Step>
          <Step duration={STEP_MS}><Layer h={440} label="曹操到桃園結義是淡灰虛線打問號：卡片沒寫曹操參加結義">
            {/* A dashed line can't use the dash-offset draw itself, so a solid copy draws inside a mask. */}
            <mask id="aw2-kg-guess" maskUnits="userSpaceOnUse" x="0" y="0" width="1180" height="440">
              <g fill="none" stroke="#FFFFFF" strokeWidth="12"><StepPath d="M1060 136 C1080 430 340 440 300 255" /></g>
            </mask>
            <path d="M1060 136 C1080 430 340 440 300 255" fill="none" stroke={faint} strokeWidth="5" strokeDasharray="12 9" mask="url(#aw2-kg-guess)" />
            <g className="aw2-build" style={buildDelay(4)}><GuessMark x={690} y={366} r={24} /></g>
            <g className="aw2-build" style={buildDelay(5)}>
              <KgKey y={316} title="找不到原句" sub="先別畫，回卡片查">
                <path d="M1206 310 H1248" stroke={faint} strokeWidth="6" strokeDasharray="10 7" /><GuessMark x={1272} y={310} r={16} />
              </KgKey>
            </g>
          </Layer></Step>
        </Steps>
      </Stage>
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={28}>圖上的每條線，卡片裡都要找得到原句</Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

// The whole graph (3984 × 2807, one Obsidian session) is too small to read at slide size, so it
// stays as an overview with markers; each click also opens a zoomed crop of the marked region
// beside it. Panels 1–2 crop the overview itself. Panel 3 crops a second capture of the same layout,
// taken zoomed out (graph labels grow slower than the layout, so the cards' names read larger there);
// `mark` places that crop on the overview. All panels draw labels at about 24 px.
const GV_W = 640; // overview width; image is 451 px tall
const GV_NAT_W = 3984;
const GV_NAT_H = 2807;
const GV_ZOOM_W = 932;
const GV_ZOOM_H = 460;
type GvZoom = {
  n: number; title: string; x: number; y: number; scale: number; alt: string; badge: Badge;
  img?: { src: string; natW: number; natH: number }; mark?: { x: number; y: number; w: number; h: number };
};
const GV_ZOOMS: GvZoom[] = [
  { n: 1, title: '大圓：三國演義大綱', x: 1568, y: 935, scale: 1, badge: 'right', alt: '放大：中間的大圓三國演義大綱，四周的線都連到它' },
  { n: 2, title: '淡色小點：還沒有卡', x: 1510, y: 20, scale: 0.98, badge: 'right', alt: '放大：淡色小點，例如夏侯惇、陶謙、韓胤、孫堅、李傕，都還沒有卡' },
  {
    n: 3, title: '右下一群：範例卡', x: 28, y: 53, scale: 1.394, badge: 'below',
    img: { src: vaultGraphCards, natW: 700, natH: 435 }, mark: { x: 2335, y: 1404, w: 1649, h: 875 },
    alt: '放大：劉備、曹操、張飛、孫權、曹魏、蜀漢、赤壁之戰、煮酒論英雄等範例卡，彼此連得很密',
  },
];

// A marker over the overview for one zoom region, in % of the image.
const GvMark = ({ z }: { z: GvZoom }) => {
  const m = z.mark ?? { x: z.x, y: z.y, w: GV_ZOOM_W / z.scale, h: GV_ZOOM_H / z.scale };
  return <StepMark n={z.n} badge={z.badge} x={(m.x / GV_NAT_W) * 100} y={(m.y / GV_NAT_H) * 100} w={(m.w / GV_NAT_W) * 100} h={(m.h / GV_NAT_H) * 100} />;
};

const GraphView: Page = () => (
  <Shell source={'Obsidian 說明：關聯圖 obsidian.md/help/plugins/graph'}>
    <Eyebrow>附錄｜整座筆記庫的關聯圖</Eyebrow>
    <Heading>關聯圖（Graph View）</Heading>
    <Lead>一個名字一個點，有連結就連一條線</Lead>
    <Fit>
      <div style={{ display: 'grid', gridTemplateColumns: `${GV_W}px 1fr`, gap: 56 }}>
        <In i={0}>
          <Screenshot src={vaultGraph} aspect={GV_NAT_W / GV_NAT_H} width={GV_W} caption="合併大綱後的關聯圖｜實際畫面" alt="關聯圖：中間的大點是三國演義大綱，四周一圈淡色小點是還沒有卡的人，右下一群深色點是範例卡" />
        </In>
        {/* Each click: a marker on the overview, and that region enlarged here (later panels cover earlier ones). */}
        <div style={{ position: 'relative', height: 530 }}>
          <Steps>
            {GV_ZOOMS.map(z => (
              <Step key={z.n} duration={STEP_MS}>
                <Pin style={{ left: -(GV_W + 56), top: 0, width: GV_W, height: Math.round(GV_W * GV_NAT_H / GV_NAT_W) }}><GvMark z={z} /></Pin>
                <Pin style={{ left: 0, top: 0, width: GV_ZOOM_W + 4, height: 530, background: 'var(--osd-bg)' }}>
                  <Callout n={z.n} title={z.title} />
                  <div style={{ marginTop: 18, border: '2px solid #E9B650', background: '#FFFFFF', boxSizing: 'border-box', width: GV_ZOOM_W + 4, height: GV_ZOOM_H + 4 }}>
                    <Crop src={z.img?.src ?? vaultGraph} natW={z.img?.natW ?? GV_NAT_W} natH={z.img?.natH ?? GV_NAT_H} x={z.x} y={z.y} w={GV_ZOOM_W / z.scale} h={GV_ZOOM_H / z.scale} scale={z.scale} alt={z.alt} />
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

// The local-graph capture (610 × 860) drawn 600 px tall, cropped 70 px in from the left so a half-cut
// label at the edge drops out. 劉備 and 桃園結義 node centres are given in drawn px.
const LG_H = 470;
const LG_S = LG_H / 860;
const LG_CROP_X = 100;
const LG_W = Math.round((610 - LG_CROP_X) * LG_S);
// A point of the capture (native px) in drawn px.
const lgX = (nx: number) => Math.round((nx - LG_CROP_X) * LG_S);
const lgY = (ny: number) => Math.round(ny * LG_S);

const LocalGraph: Page = () => (
  <Shell chapter={4} source={'Obsidian 說明：關聯圖 obsidian.md/help/plugins/graph'}>
    <Eyebrow>Obsidian 已經畫好的關係圖</Eyebrow>
    <Heading>局部關聯圖（Local Graph）</Heading>
    <Lead>打開劉備卡，Obsidian 畫出它連到的卡</Lead>
    <Fit>
      <div style={{ display: 'grid', gridTemplateColumns: `${LG_W}px 1fr`, gap: 72, alignItems: 'center' }}>
        <In i={0}>
          <div style={{ position: 'relative', width: LG_W, height: LG_H, border: `1px solid ${rule}`, background: '#FFFFFF', boxShadow: '0 10px 30px rgba(28,25,23,0.08)' }}>
            <Crop src={taoyuanGraph} natW={610} natH={860} x={LG_CROP_X} y={0} w={610 - LG_CROP_X} h={860} scale={LG_S} alt="劉備的局部關聯圖，放大劉備到桃園結義這一條線" />
            <svg viewBox={`0 0 ${LG_W} ${LG_H}`} style={{ position: 'absolute', inset: 0, width: LG_W, height: LG_H, overflow: 'visible' }} aria-hidden="true">
              {/* Starts just under the 劉備 label so the mark never covers it. */}
              <g fill="none" stroke={amber} strokeWidth="8" strokeLinecap="round"><DrawPath i={2} d={`M${lgX(211)} ${lgY(166)} L${lgX(351)} ${lgY(762)}`} /></g>
              <InG i={1}><SvgChip x={lgX(243)} y={lgY(31)} w={110} h={48} label="劉備" size={28} fill="#FFFFFF" stroke={amber} /></InG>
              <InG i={6}><SvgChip x={lgX(384) - 20} y={lgY(688)} w={160} h={48} label="桃園結義" size={28} fill="#FFFFFF" stroke={amber} /></InG>
            </svg>
          </div>
          <Caption>實際畫面｜橘線是標示</Caption>
        </In>
        <div>
          <Steps>
            <div style={{ fontSize: 36 }}>劉備到〈桃園結義〉這條線，是哪來的？</div>
            <Step duration={STEP_MS}>
              <div style={{ marginTop: 30 }}>
                <SmallLabel>人物/劉備.md 裡的這一句</SmallLabel>
                <div style={{ marginTop: 12, position: 'relative', width: 1180 }}>
                  <Screenshot src={taoyuanLine} aspect={1410 / 52} width={1180} alt="劉備卡：三人越談越投合，隔天就在張飛莊後的桃園立誓，留下著名的桃園結義" />
                  <div style={{ position: 'absolute', left: '62.4%', top: '-6%', width: '10.4%', height: '112%', border: `4px solid ${amber}` }} />
                </div>
              </div>
            </Step>
            <Step duration={STEP_MS}><Takeaway marginTop={44}>劉備卡裡寫了 [[桃園結義]]，Obsidian 就畫這條線</Takeaway></Step>
            <Step duration={STEP_MS}><div style={{ marginTop: 28, fontSize: 30, lineHeight: 1.5, color: muted, textAlign: 'center' }}>{''}</div></Step>
          </Steps>
        </div>
      </div>
    </Fit>
  </Shell>
);

const AsciiAsk: Page = () => (
  <Shell chapter={4} source={'Edge et al. 2024, From Local to Global: A Graph RAG Approach, arXiv:2404.16130'}>
    <PracticeEyebrow time="6 分半，Codex 跑約 1 分鐘">練習 4｜關係圖</PracticeEyebrow>
    <Heading>請 Codex 用文字畫關羽的關係圖</Heading>
    <PromptsCopy step="練習 4" />
    <PillRow>
      <Pill tag="定位">桃園結義＋你寫的卡</Pill>
      <Pill tag="期望輸出">從關羽畫起，附出處</Pill>
      <Pill tag="限制">只畫參與人物</Pill>
    </PillRow>
    <Fit>
      <div style={{ display: 'grid', gridTemplateColumns: '600px 1fr', gap: 32, alignItems: 'start' }}>
        <In i={0}>
          <Terminal title="貼進 Codex" size={27}>
            <div>請讀取 關係/桃園結義.md</div>
            <div>和 關係/<AskLine>許田打圍</AskLine>.md，</div>
            <div>用純文字畫出人物關係圖。</div>
            <div>只畫兩張卡「參與人物：」</div>
            <div>那一行列出的人。</div>
            <div><Dim>……其餘照 prompts.md 貼上</Dim></div>
          </Terminal>
          <div style={{ marginTop: 14, fontSize: 26, lineHeight: 1.45, color: amber, fontWeight: 600 }}>許田打圍 換成你在練習 2 寫的卡名</div>
        </In>
        <Steps>
          <Step duration={STEP_MS}>
            <Terminal title="Codex 回答（格式示意）" size={27}>
              <div>關羽</div>
              <div>├─ [1] 結義兄弟 ── 劉備（來源：關係/桃園結義.md）</div>
              <div>├─ [2] 結義兄弟 ── 張飛（來源：關係/桃園結義.md）</div>
              <div><AskLine>└─ [3] 提刀要斬 ── 曹操（來源：關係/許田打圍.md）</AskLine></div>
            </Terminal>
            <div style={{ marginTop: 14, fontSize: 26, lineHeight: 1.45, color: amber, fontWeight: 600 }}>橘字那條來自練習 2 寫的卡</div>
          </Step>
        </Steps>
      </div>
      <Steps>
        <Step duration={STEP_MS}><FixBox label="橘字那條沒出現" marginTop={28}>檢查提示詞裡的卡名有沒有換對，再看那張卡「參與人物」那一行有沒有 [[關羽]]。改好再貼一次。</FixBox></Step>
      </Steps>
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
      <Figure h={290} label="四章：點連結看反向連結、寫卡連回大綱、Codex 讀筆記庫找到你寫的關係卡、Codex 把它畫進關係圖">
        <g fill="none" stroke={amber} strokeWidth="4"><DrawPath i={4} d="M260 90 H1372" /></g>
        <InG i={0}><RecapStop x={204} n={1} verb="點連結，看反向連結" /></InG>
        <InG i={1}><RecapStop x={612} n={2} verb="寫卡，連回大綱" /></InG>
        <InG i={2}><RecapStop x={1020} n={3} verb="Codex 找到你寫的卡" /></InG>
        <InG i={3}><RecapStop x={1428} n={4} verb="你寫的卡畫進關係圖" /></InG>
      </Figure>
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={64}>筆記庫在你的電腦裡，Codex 讀得到，就能幫你找、幫你畫</Takeaway></Step></Steps>
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
    <Heading>用 Skill 畫圖、排時間軸</Heading>
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
      <Steps><Step duration={STEP_MS}>
        <div style={{ marginTop: 32, textAlign: 'center', fontSize: 30, color: muted }}>
          <strong style={{ color: ink }}>課前：</strong>裝好 git 和 Node.js（LTS 版），終端機打<span style={{ fontFamily: mono, background: surface, border: `1px solid ${rule}`, padding: '2px 12px' }}>node -v</span>、<span style={{ fontFamily: mono, background: surface, border: `1px solid ${rule}`, padding: '2px 12px' }}>git --version</span>，都看到版本號就好
        </div>
      </Step></Steps>
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

// ---------- Appendix ----------

// One row of the appendix contents: the group, the situation, then the pages to turn to.
const APX_COLS = '220px 1fr 220px';
const ApxRow = ({ i, group, need, pages }: { i: number; group?: string; need: string; pages: Page[] }) => {
  const first = pageOf(pages[0]);
  const last = pageOf(pages[pages.length - 1]);
  return (
    <In i={i} style={{ display: 'grid', gridTemplateColumns: APX_COLS, alignItems: 'center', minHeight: 70, borderBottom: `1px solid ${rule}` }}>
      <SmallLabel color={group ? amber : quiet}>{group ?? ''}</SmallLabel>
      <span style={{ fontSize: 31 }}>{need}</span>
      <span style={{ fontSize: 30, color: amber, textAlign: 'right' }}>第 {first === last ? first : `${first}–${last}`} 頁</span>
    </In>
  );
};

const AppendixIndex: Page = () => (
  <Shell>
    <Eyebrow>附錄｜課堂不講，需要時再翻</Eyebrow>
    <Heading>附錄目錄</Heading>
    <Fit>
      <div style={{ borderTop: `1px solid ${rule}` }}>
        <ApxRow i={0} group="Obsidian" need="三種卡，人物怎麼透過關係卡相連" pages={[CardTypes, StoryMap]} />
        <ApxRow i={1} need="淡色連結：點了會怎樣、要不要補卡" pages={[GrayLink, GrayDecide]} />
        <ApxRow i={2} need="大綱放進來後的反向連結和關聯圖" pages={[BacklinksReal, GraphView]} />
        <ApxRow i={3} group="RAG 細節" need="曹操題：Codex 搜了什麼、讀了什麼、怎麼答" pages={[RStep, GStep]} />
        <ApxRow i={4} need="引用有根據，卻漏了好幾場戰役" pages={[WithWithout, LimitMiss]} />
        <ApxRow i={5} need="連結幫你查證；筆記沒寫就答找不到" pages={[LinksHelp, LimitMissing]} />
        <ApxRow i={6} group="進階討論" need="「參與」算到哪裡：曹操的 7 項戰役" pages={[Practice3, Practice3Ask]} />
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
  title: 'aw-02 Obsidian 與 AI Agent',
  createdAt: '2026-10-17T03:04:26.505Z',
  theme: 'thoughtstream',
};

const deck: Page[] = [
  Cover, StartDownloads, LastLesson, TodayGoal, Agenda,
  Section1, FirstLaunch, GetVault, VaultCheck, VideoTour, LinkWalk, WikiLink, Backlinks, VaultFolder,
  Section2, VideoCard, MergeOutline, ClickLiubei, Practice2Card, Practice2Pick, AddLinksBack, BreakTime,
  Section3, OpenInCodex, AskWithFiles, RagIdea, FourthEvent, VideoRag, AskCheck,
  Section4, PointsLines, LocalGraph, AsciiAsk,
  Recap, NextSkills, ReferencesRag, ReferencesGraph,
  AppendixIndex, CardTypes, StoryMap, GrayLink, GrayDecide, BacklinksReal, GraphView,
  RStep, AStep, GStep, WithWithout, LimitMiss, LinksHelp, LimitMissing,
  Practice3, Practice3Ask,
];

// 1-based page number of a page in this deck (for the agenda).
function pageOf(page: Page) {
  return deck.indexOf(page) + 1;
}

// Speaker notes, keyed by page so they stay aligned with the deck order.
const NOTES = new Map<Page, string>([
  [Cover, `00:00–01:00。今天是四堂課的第二堂：Obsidian 與 AI Agent。上一堂大家用 Codex 寫出《三國演義》第 1 到 21 回的大綱，今天把它放進一座三國筆記庫，自己寫一張關係卡連進去，再讓 Codex 讀這座筆記庫：先回答問題，再畫關係圖。
先請大家在自己的筆電打開這份簡報：${DECK_SITE}，點第二堂。下載按鈕、提示詞連結都在筆電上點；投影的 QR code 用手機掃，只會存到手機。`],
  [StartDownloads, `01:00–04:00（下載，邊下載邊聽）。第一件事先做，因為要等：兩樣東西現在就開始下載。
1：打開 obsidian.md/download，按紫色的下載鈕。網頁會自己判斷系統，Windows 顯示 Download for Windows，Mac 顯示 Download for macOS；沒看到就往下捲，在自己的系統那一列按 Universal。下載完直接安裝：Windows 打開安裝檔按下一步；Mac 打開 .dmg，把 Obsidian 拖進「應用程式」。免費，不用註冊。
2：在筆電的簡報上按「在筆電上按這裡下載」，下載 aw-02-lab.zip。手機掃 QR code 只會存到手機，用不到。ZIP 裡有三國筆記庫和這堂的 prompts.md。
${VAULT_ZIP_URL}
先不用打開，也不用解壓縮。接下來我講上一堂的回顧，大家的下載和安裝就在背景跑；第一章再一起打開。官方安裝說明：https://obsidian.md/help/install`],
  [LastLesson, `04:00–07:00。先看上一堂的成果。左邊是講師用 Codex 跑出來的 三國演義大綱.md：一回一段，人名都寫成 [[劉備]] 這種連結，每段最後一行是出處。大家自己的大綱長得差不多，今天全程用自己那一份。
這些 [[ ]] 現在連到哪裡？按一下：哪裡都還沒連到。大綱是單獨一個檔案，旁邊沒有劉備卡，所以劉備是淡色的連結，點下去只會新增一張空白卡。
最後一下：大綱裡有連結，但還沒有對應的人物卡。今天就是要把它放進有人物卡的筆記庫。`],
  [TodayGoal, `07:00–09:00。今天只有一條主線，四站。第 1 站：寫一張自己的關係卡，例如第 5 回的溫酒斬華雄。
按一下，第 2 站：連得過去。卡片連到關羽、曹操這些人物卡，也從大綱連回來。按一下，第 3 站：AI 找得到。請 Codex 查筆記回答，它要能找到你寫的那張卡，回答附的原句回卡片搜得到。按一下，第 4 站：畫成關係圖。請 Codex 把你寫的卡畫進關係圖。
最後一下：練習 2 到 4 用的都是你自己寫的那張卡，不會換教材。`],
  [Agenda, `09:00–10:00。四章、四個練習。第一章認識 Obsidian：先打開筆記庫，沿連結點一圈，再解釋剛才用到的功能，10 到 29 分。第二章寫自己的關係卡：搬進大綱、寫卡、連回大綱，29 到 55 分。55 分休息 5 分鐘。第三章讓 Codex 讀筆記庫：它要找到你寫的卡，回答附的原句對得回卡片，60 到 90 分。第四章請 Codex 畫關係圖：把你寫的卡畫進去，90 到 100 分。最後預告第三堂、交代課前作業，留時間問答。
今天講師不現場跑，每個示範都是錄好的影片，大家照影片自己做。`],
  [Section1, `10:00–10:30。第一章：認識 Obsidian。這章先動手：裝好、打開筆記庫、沿連結點一圈。點完再告訴大家剛才用了哪些功能。還在安裝的同學，邊裝邊看。`],
  [FirstLaunch, `10:30–12:30（練習 2 分鐘）。安裝好就打開 Obsidian，第一次會看到這個畫面。標 1 的地方在最下面：語言選單選「繁體中文」，畫面當下就換成中文，不用重開。
按一下：標 2，三個選項裡今天用第二個「開啟資料夾為儲存庫」。先不要按「建立新的儲存庫」。官方說明：https://obsidian.md/help/User+interface/Language+settings
2026-10-24 實測（Obsidian 1.10.3、1.14.5，Mac）：第一次打開是英文畫面，選繁體中文後當下切換。`],
  [GetVault, `12:30–15:00（練習 2 分半）。1：找到剛才下載的 aw-02-lab.zip。按一下，2：解壓縮。Windows 請在 ZIP 上按右鍵選「全部解壓縮」，直接雙擊只是打開來看，還沒真的解開；Mac 雙擊就會解開。解出來是 aw-02-lab 資料夾，筆記庫是裡面的「三國人物知識庫」。
按一下，3：回到 Obsidian，按「開啟資料夾為儲存庫」，選 aw-02-lab 裡面的「三國人物知識庫」這一層，不要選外層的 aw-02-lab。提示詞放在筆記庫外面，Codex 在筆記庫搜尋時才不會搜到它。
2026-10-24 實測（Obsidian 1.10.3、1.14.5，Mac）：打開時不會跳「信任作者」的視窗，直接進到空白的「新分頁」。Obsidian 會自己在裡面建一個 .obsidian 資料夾，不用管它。Windows 未實測。
步驟也寫在 prompts.md 的〈練習 1〉：${PROMPTS_URL}`],
  [VaultCheck, `15:00–16:30（練習 1 分半）。這是講師電腦上的實際畫面。左邊：打開對的資料夾，左側有六個資料夾：人物、勢力、原文、整理、模板、關係，最下面是入口卡〈三國演義〉。原文/ 現在只有第 37、38、46 回的節選，練習 2 會把第一堂的 21 回搬進去。
按一下：如果左邊只看到「三國人物知識庫」一個資料夾，加上 prompts，代表打開的是外層的 aw-02-lab。Windows 的「全部解壓縮」有時還會再多包一層 aw-02-lab，一樣往裡面找。
按一下：下面的框是解法：點左下角的儲存庫名稱，選「管理儲存庫」，重新「開啟資料夾為儲存庫」，這次選裡面那個「三國人物知識庫」。`],
  [VideoTour, `16:30–18:30（影片 51 秒）。打開筆記庫的人，先看一段影片：講師沿著連結點一圈。下一頁大家照著做。影片沒有聲音，邊放邊講；右邊的時間可以直接跳段。
影片內容（講師的螢幕錄影）：0:00 左側打開 人物/劉備。0:07 在劉備卡點「桃園結義」。0:16 在〈桃園結義〉點「關羽」。0:19 打開右側欄，看反向連結。0:27 點反向連結裡的〈桃園結義〉走回去。0:32 切到〈桃園結義〉的關聯圖分頁：中間是這張卡，連出去的點就是卡裡寫到的人和事。0:47 在圖上點劉備，回到劉備卡。
關聯圖分頁是講師事先開好的。自己開：打開那張卡，按右上角「⋯」選單，或按 Ctrl/Cmd+P 找「局部關聯圖」。第 ${pageOf(LocalGraph)} 頁會再講一次。`],
  [LinkWalk, `18:30–23:00（練習 4 分半）。練習 1 的最後一步，大家自己點一圈。步驟也在 prompts.md 的〈練習 1〉。
第一站：左側打開 人物/劉備，在第三段找到「桃園結義」，點下去。按一下：到了〈桃園結義〉，這張關係卡寫第 1 回三人結為兄弟。再點卡裡的「關羽」。按一下：到了〈關羽〉。打開右上角的右側欄，切到「反向連結」分頁。
按一下：反向連結裡列著〈桃園結義〉，點它就走回去。也可以按左上角的 ← 回上一張。
最後一下：做到了的標準：關羽卡的反向連結裡看得到〈桃園結義〉。新打開的筆記庫，右側欄預設是收起來的，找不到反向連結的人先檢查這個。
給大家 4 分鐘，點完的人可以自己多逛幾張。`],
  [WikiLink, `23:00–25:00。剛才點的紫色字，就是 Obsidian 的內部連結，叫 Wiki Link（Obsidian 寫作 Wikilink）。左邊是檔案裡真正打的字：「拜 [[劉備]] 為兄」，人名包在兩對中括號裡。
按一下：Obsidian 顯示時，中括號會藏起來，劉備變成紫色、有底線的字。按一下：點一下就打開 人物/劉備.md。打 [[ 的時候 Obsidian 會跳出選單讓你選卡名，不用整個打完，等一下寫卡會用到。
最後一下：卡名放進 [[ ]]，就建立一條內部連結。官方說明：https://obsidian.md/help/links`],
  [Backlinks, `25:00–27:00。剛才在關羽卡右邊看到的清單，叫「反向連結」，英文 Backlinks：從一張卡回頭看，哪些卡連到了它。這頁用劉備當例子：三國演義、桃園結義、煮酒論英雄、赤壁之戰、曹操、蜀漢這幾張卡，內文都寫了 [[劉備]]。
按一下：打開劉備卡，右邊的「反向連結」面板會自動列出這些卡：講師的筆記庫裡一共 11 張卡、17 處提到劉備。
最後一下：Obsidian 自動列出所有連到〈劉備〉的卡，你不用回頭在劉備卡裡寫。等一下你寫的卡連到關羽，關羽卡的反向連結就會多一列，這就是檢查有沒有連成功的方法。官方說明：https://obsidian.md/help/plugins/backlinks`],
  [VaultFolder, `27:00–29:00。最後說剛才打開的到底是什麼。Obsidian 的「儲存庫」，英文 Vault，就是你電腦裡的一個資料夾，一張卡就是一個 .md 檔，用記事本也打得開。
按一下：Obsidian 打開這個資料夾來寫。這座筆記庫有 12 張卡：人物 5 張、勢力 3 張、關係 3 張，加入口卡〈三國演義〉。原文、整理、模板這幾個資料夾不算卡。
按一下：Codex 讀的也是同一個資料夾，不用上傳。
最後一下：檔案在你的電腦裡，Codex 也讀得到。這是第三章的前提。三種卡怎麼分、人物怎麼透過關係卡相連，放在附錄第 ${pageOf(CardTypes)}–${pageOf(StoryMap)} 頁。官方說明：https://obsidian.md/help/data-storage`],
  [Section2, `29:00–29:30。第二章：寫自己的關係卡。三件事：把第一堂的大綱搬進筆記庫、寫一張關係卡、把它連回大綱。這一整章都是練習 2：先看一段示範影片，再自己做，做完剛好休息。`],
  [VideoCard, `29:30–33:00（影片約 3 分鐘）。這一章要做的三件事，先看講師做一次，再自己做：搬原文和大綱進來、寫一張關係卡、把它連回大綱。影片從 0:00 放到最後，沒有聲音，邊放邊講；右邊的時間可以直接跳段。下一頁開始，大家一步一步自己做。
影片裡要講的一點：影片是從模板按 Cmd+A 全選複製，Obsidian 不會選到最上面的「屬性」（回目、年份），所以貼上後沒有回目，1:50 示範補法：右上角 ⋯ →「新增檔案屬性」，名稱打 回目，值打 20。你們不用這樣做：prompts.md 練習 2-2 直接放了整段模板（從 --- 開始），複製貼進新筆記，回目、年份會自動變成屬性欄。
影片內容（講師的螢幕錄影，3 分 07 秒，沒有聲音）：0:00 在 Finder 打開 Codex_練習/原文，Cmd+A 全選 21 個檔，拖到 Obsidian 左側的 原文/；再把大綱拖進 整理/。0:32 打開大綱，點第 1 回的劉備。0:44 在 關係/ 新增筆記〈許田打圍〉，貼上模板。1:08 寫兩三句（原文第 20 回），人名加 [[ ]]，參與人物寫曹操、劉備、關羽。1:50 補回目和出處。2:08 打開大綱第 20 回那段，最後加上（[[許田打圍]]）。2:30 打開〈許田打圍〉和〈關羽〉，看反向連結。`],
  [MergeOutline, `33:00–36:30（練習 3 分半）。剛才影片的第一段，現在自己做。左邊是第一堂的練習資料夾 aw-01-lab/Codex_練習，要搬兩樣東西：原文 資料夾裡的 21 個檔，和大家寫好的 三國演義大綱.md。
按一下：藍色是原文，橘色是大綱，搬過去還是同一個顏色。打開第一堂的 原文/，按 Cmd+A（Windows 是 Ctrl+A）全選 21 個檔，拖進筆記庫的 原文/；那裡已經有第 37、38、46 回，合起來 24 個檔。拖的是裡面的檔案，不是 原文 資料夾本身。大綱拖進「整理」資料夾。可以在檔案總管（Mac 是 Finder）裡拖，也可以直接拖到 Obsidian 左側。原文放進來，大綱每段最後的「出處：原文/第001回.md」就找得到。旁邊的「人物」資料夾是講師的卡，不用動。
按一下：大綱第 1 回寫的是 [[劉備]]，人物資料夾裡剛好有 劉備.md，Obsidian 會依卡名自動對上這個連結，不用改任何字。
按一下：看結果：打開筆記庫的 原文/，有第 001 到 021 回，再加第 037、038、046 回，一共 24 個檔。
最後一下：不小心拖了整個資料夾：Mac 跳出「要取代嗎」就按「停止」，Windows 跳出「取代或略過檔案」就選「略過這些檔案」，第 37、38、46 回才不會被蓋掉；然後打開 原文 資料夾，全選裡面的檔再拖一次。Windows 的對話框講師沒有實測。
有人第一堂另外讓 Codex 寫了自己的 劉備.md，這次先不要放進來：同一個筆記庫裡有兩張都叫劉備的卡，[[劉備]] 只會連到其中一張。`],
  [ClickLiubei, `36:30–41:00（練習 4 分半）。上面是合併後的實際畫面，講師的大綱第 1 回，你的大綱用字會不同，請看自己的。標 1 是劉備，深紫色，代表找得到卡。
按一下：點它，就打開下面這張講師的人物卡 人物/劉備。請大家點自己大綱裡的劉備。點得過去，劉備卡右邊的反向連結會多一列「三國演義大綱」。點不過去的，看右邊的框：檢查大綱是不是放在「三國人物知識庫」裡面，而不是旁邊。
同一段裡，董卓的顏色比較淡。
最後一下，標 2：董卓是淡紫色，筆記庫裡還沒有這張卡，這叫「未解析連結」（Unresolved Link）。點了 Obsidian 會在筆記庫最外層新增一張空白的 董卓.md，不想新增就先別點。下面的圖例：1 深紫是有卡，點了會打開，關羽、張飛、曹操、〈桃園結義〉也一樣；2 淡紫是還沒有卡。淡色不一定是打錯字，多半是還沒寫卡。
投影或螢幕分不出深淺時，按 Cmd+O（Windows 是 Ctrl+O）搜名字，找不到這個檔，就是還沒有卡。
淡色的名字要不要補卡、怎麼數它出現幾次，是選做，放在附錄第 ${pageOf(GrayDecide)} 頁；之後可以照原文補卡；第三堂會直接給大家講師照原文寫好的三張卡。
2026-10-24 實測（Obsidian 1.10.3、1.14.5，Mac）：大綱放進 整理/，不用重開 Obsidian，點第 1 回的劉備就打開 人物/劉備。`],
  [Practice2Card, `41:00–44:00（練習 2-2 前 3 分鐘，整個 2-2 共 9 分鐘）。練習 2 的重點：自己寫一張關係卡。條件在畫面上三個框：定位，第 5、16、20 回三個事件挑一個；期望輸出，照模板寫；限制，原文沒寫的不寫。模板從右上角的 prompts.md 練習 2-2 複製。步驟和可以挑的事件都在 prompts.md 的〈練習 2〉：${PROMPTS_URL}
左邊是講師照模板寫的〈三英戰呂布〉，取材第 5 回，是 Obsidian 實際畫面的節選。一張卡至少要有：最上面的「回目」、用完整句子寫的內容、「參與人物」、最後一行「出處」。
按一下，1：在左側「關係」資料夾按右鍵，選「新增筆記」，取名就是事件名稱；從 prompts.md 練習 2-2 複製整段模板（從第一行 --- 開始），貼進去，回目、年份會變成屬性欄。不要從模板檔按 Cmd+A 全選複製，會漏掉屬性。
按一下，2：用完整的句子寫兩三句就好，大綱那一回的段落可以拿來當底稿。有卡的人名前後加兩對中括號，例如 [[劉備]]；打完 [[ 和第一個字，Obsidian 會跳出選單。看範例：標 2 的紫框，張飛加了 [[ ]]，變成連結；參與人物裡的呂布底下畫虛線，他還沒有卡，寫純文字。
按一下，3：填上回目，例如 5；最後一行寫出處，例如「出處：原文/第005回.md」。範例卡上標 3 的兩個橘框就是這兩處。
忘了怎麼操作的，回第 ${pageOf(VideoCard)} 頁的示範影片，按 0:44 再看一次。下一頁是可以挑的三個事件。`],
  [Practice2Pick, `44:00–50:00（練習 2-2 後 6 分鐘）。請從這三個事件挑一個，三個都連得到關羽，第三章會用到：第 5 回〈溫酒斬華雄〉，連到關羽、曹操，華雄寫純文字；第 16 回〈轅門射戟〉，連到劉備、關羽、張飛（原文「關、張隨往」），呂布寫純文字，也要列進參與人物；第 20 回〈許田打圍〉，連到曹操、劉備、關羽。「參與人物：」那一行也照這樣列：有卡的加 [[ ]]，沒卡的寫純文字。
不要寫三英戰呂布和白門樓：第三堂會直接發這兩張寫好的卡，同名的卡會撞在一起。不確定細節就查原文：在 Obsidian 左邊打開 原文/，點那一回就看得到。
按一下：看結果：打開〈關羽〉，右邊的反向連結裡出現剛寫的卡，就成功了。
最後一下：沒出現的話，回你寫的卡看關羽是不是深紫色：淡紫或黑字，就是 [[ ]] 沒加好或名字打錯，改成 [[關羽]] 再看一次。
2026-10-24 實測（Obsidian 1.10.3、1.14.5，Mac）：在「關係」按右鍵選「新增筆記」，標題已經選好，直接打「許田打圍」按 Enter 就改好名字。寫完、連到曹操、劉備、關羽後，〈關羽〉的反向連結馬上多一列「許田打圍」。`],
  [AddLinksBack, `50:00–55:00（練習 5 分鐘）。卡寫好了，現在大綱還連不到它：講師的大綱第 5 回，「溫酒斬華雄」是黑字。下面的圖例照 Obsidian 的顏色：紫色是有卡的連結，淡紫是還沒有卡，橘框框起來的是還沒連的黑字。
按一下：在大綱裡改成 [[溫酒斬華雄]]，換成你那張卡的名字，就變成紫色連結。寫〈轅門射戟〉的，第 16 回改成「呂布在[[轅門射戟]]」。下面那行：大綱裡沒有剛好一樣的字，例如第 20 回寫的是「許田打獵」，就在那一段最後加上「（[[許田打圍]]）」。
按一下：看結果：打開你寫的卡，反向連結出現〈三國演義大綱〉，這一步就完成了。
最後一下：沒出現：看大綱裡剛加的連結，淡紫色代表 [[ ]] 裡的名字跟你寫的卡名不一樣，改成一字不差再看一次。
到這裡，主線的前兩站完成：你寫了一張卡，從關羽、從大綱都連得過去。
2026-10-24 實測（Obsidian 1.10.3，Mac）：在大綱第 20 回那段最後加上「（[[許田打圍]]）」，〈許田打圍〉的反向連結就出現「三國演義大綱」。`],
  [BreakTime, `55:00–60:00（休息 5 分鐘）。休息 5 分鐘。回來前請大家對一下這三項：Obsidian 打開三國筆記庫；大綱在 整理/，點得到〈劉備〉；你寫的卡連到人物，也連回大綱。
下一章要用終端機開 Codex，休息時可以先把終端機打開。`],
  [Section3, `60:00–60:30。第三章：讓 Codex 讀你的筆記庫。筆記庫就是電腦裡的一個資料夾，Codex 在這個資料夾裡打開，就能先翻你的筆記再回答，包括你剛寫的那張卡。`],
  [OpenInCodex, `60:30–63:30（練習 3 分鐘）。大家一起做。打開終端機（Windows 是 PowerShell），打 cd 和一個空格，把「三國人物知識庫」資料夾拖進視窗，按 Enter。
按一下：打 codex。第一次在這個資料夾開，會問信不信任這個資料夾，選 Yes, continue，跟第一堂一樣。
按一下：貼上「列出這個資料夾第一層的資料夾，不要讀或修改任何檔案。」提示詞在 prompts.md 的〈準備〉：${PROMPTS_URL}
按一下：要看到人物、勢力、原文、整理、模板、關係，可能還有 .obsidian。只列出「三國人物知識庫」一個資料夾，就是 cd 到外層的 aw-02-lab 了：輸入 /quit，cd 進裡面那一層，再打 codex。
實測（2026-10-24，Codex 0.154.0）：在多一層的資料夾，它回答「這個資料夾第一層只有一個資料夾：三國人物知識庫」。`],
  [AskWithFiles, `63:30–64:30。這是練習 3 用的提示詞，整章都問這一題，一次看一行。第一行是問題：關羽參與了哪些事件？
按一下：範圍，只根據 關係/ 資料夾裡的卡。範圍定在關係卡，大家的答案才比得起來，你寫的卡也在這個資料夾裡。按一下：出處，每個事件附上檔名和一句卡片原句，等一下核對靠的就是這兩樣。按一下：限制，卡片沒寫的就說找不到，不要自己補。
最後一下：附上檔名和原句，回答才查得到根據。完整提示詞在 prompts.md 的〈練習 3〉。`],
  [RagIdea, `64:30–67:00。這一題 Codex 是怎麼回答的？方法叫 RAG，Retrieval-Augmented Generation，檢索增強生成。三步：
R 檢索：問「關羽參與了哪些事件？只看 關係/」，先在關係資料夾把寫到關羽的卡找出來：桃園結義、煮酒論英雄、赤壁之戰，還有講師在練習 2 寫的〈許田打圍〉。大家的筆記庫裡，這一張就是自己寫的那張卡。
按一下，A 增強：把問題和找到的卡一起交給模型。
按一下，G 生成：照卡片回答，並附上檔名。橘色的就是 R 找到的那幾張卡，從頭到尾同一個顏色。
最後一下：模型不變，變的是輸入多了筆記。下一頁就看 R 這一步：關羽卡沒列出〈許田打圍〉，Codex 為什麼還找得到。Codex 真正下了什麼搜尋指令、讀了幾行，講師的實跑紀錄放在附錄第 ${pageOf(RStep)}–${pageOf(GStep)} 頁，上課不講。來源：https://arxiv.org/abs/2005.11401`],
  [FourthEvent, `67:00–68:30。看影片之前，先講這一題怎麼算答對。左邊是 人物/關羽.md 的最後一行「關係與事件」，只連到三件事：桃園結義、煮酒論英雄、赤壁之戰。右邊是 關係/ 資料夾，裡面有四張卡，第四張〈許田打圍〉是講師在練習 2 寫的。關羽卡沒有連到它，虛線打叉就是這個意思。大家自己寫的卡也一樣，關羽卡最後一行不會有它。
按一下：Codex 不是照關羽卡最後一行回答，它會自己搜 關係/ 裡的每一張卡。〈許田打圍〉的內文寫了 [[關羽]]，所以搜得到，回答會列出 4 件事。
最後一下：判斷標準有兩個。第一，4 件事都要列出來，少一件就是漏了。第二，每件事附的原句，回卡片搜得到、意思也沒寫錯，才算正確。下一頁的影片就是照這兩個標準檢查。`],
  [VideoRag, `68:30–70:30（影片約 2 分鐘）。看講師在自己的筆記庫問這一題。剛才說過，關羽卡最後一行沒有〈許田打圍〉，看 Codex 能不能自己找到它。看它先搜尋、再回答，回答附檔名和原句；再回 Obsidian 搜原句、對照關羽卡最後一行。
影片裡四張都找到了（桃園結義、許田打圍、煮酒論英雄、赤壁之戰），原句也都對得上。搜到的原句在 Obsidian 會用框線標出來，影片另外加了橘框。
影片內容（講師的螢幕錄影，1 分 48 秒，沒有聲音）：0:00 在「三國人物知識庫」打開 Codex，貼上練習 3 的提示詞。0:11 Codex 先搜尋 關係/ 裡的卡。0:23 回答列出四件事，每件附檔名和原句。0:43 切到 Obsidian，打開引用的卡，用 Cmd+F 搜原句。1:22 打開 人物/關羽.md，看最後一行「關係與事件」。1:36 對照完：關羽卡列的 3 張，加上講師寫的〈許田打圍〉，回答 4 張都有。`],
  [AskCheck, `70:30–90:00（練習 15 分鐘，Codex 跑約 1 分鐘；85:30–90:00 留給還沒做完的人補做）。換你在自己的筆記庫問同一題。從 prompts.md〈練習 3〉整段複製，貼進 Codex，按 Enter。全文：關羽參與了哪些事件？只根據 關係/ 資料夾裡的卡回答，每個事件附上檔名和一句卡片原句；卡片沒寫的就說找不到，不要自己補。畫面上那一行是它的重點：定位，關係/ 的卡；期望輸出，檔名加原句；限制，沒寫就說找不到。
等它跑的時候講怎麼核對，跟剛才影片做的一樣。左邊是 Codex 回答的：事件和它引用的原句。右邊是卡片裡寫的：打開那張卡，按 Cmd+F（Windows 是 Ctrl+F）搜引號裡開頭四五個字。中間那行小字：開頭是人名就跳過人名，搜後面的字，卡片裡人名是連結，連著搜會搜不到。
右邊的清單從哪來：人物/關羽.md 最後一行「關係與事件」列了桃園結義、煮酒論英雄、赤壁之戰，再加上你寫的卡。這四張，回答裡都要有；少一列就是漏了。
按一下：桃園結義，搜「誓畢拜劉備」，搜得到，對得上。按一下：煮酒論英雄，搜「衝進後園」，對得上。按一下：赤壁之戰，搜「念及當年」，對得上。畫面上這三句是從卡片挑的例子，大家的回答可能引用別句，一樣搜搜看。
按一下：第四列是你在練習 2 寫的卡，畫面用講師的〈許田打圍〉當例子，原句「提刀拍馬要斬曹操」是影片裡實跑的回答。關羽卡最後一行沒有這張卡，它出現在回答裡，就是 Codex 自己搜到的。這是今天主線的第三站。
按一下：你寫的卡沒出現，通常是卡不在 關係/ 資料夾，或卡裡沒有 [[關羽]]，先檢查這兩個，改好再貼一次。
最後一下：全部對得上就做完了，不用追問。只有原句跟卡片寫的不一樣，才貼這句請 Codex 改正，提示詞在 prompts.md〈練習 3〉。它改完的那句，回 Obsidian 再搜一次。
講完核對，大家自己做到 85:30。有人問「意思對、只是字不一樣，算不算對」：今天的規則是原句要一字不差搜得到，判斷才不會因人而異；意思對但不是原句的情況，附錄的進階討論再聊。
你寫的卡沒連到關羽的人：把提示詞裡的關羽換成你寫的卡裡連到的人物，右邊的清單改看那個人的人物卡最後一行。
85:30–90:00 留給還在跑的同學補做；做完的同學可以把題目換成你寫的卡裡的另一位人物，再跑一次。`],
  [Section4, `90:00–90:30。第四章：請 Codex 畫關係圖。關係圖就是點和線。今天請 Codex 把你在練習 2 寫的那張關係卡畫進關羽的關係圖，講師的例子是〈許田打圍〉。`],
  [PointsLines, `90:30–92:00。知識圖譜（Knowledge Graph）就是點和線。點叫節點（Node）：人物是圓圈，劉備、關羽、張飛、曹操；事件是方框，桃園結義、煮酒論英雄。
按一下：線叫邊（Edge）。關羽、張飛、劉備連到桃園結義；劉備、曹操連到煮酒論英雄。每一條灰色實線，都能在卡片裡找到一句原句。
按一下：曹操連到桃園結義這條是淡灰色虛線加問號：卡片沒寫曹操參加結義，就不畫。
最後一下：圖上的每條線，卡片裡都要找得到原句；卡片沒寫的就不畫。練習 4 的提示詞也照這個規則寫。`],
  [LocalGraph, `92:00–93:30。整座筆記庫的圖太密，只看一條線。左邊是劉備的局部關聯圖：打開劉備卡，在右上角「⋯」選單或命令選擇器（Ctrl/Cmd+P）找「局部關聯圖」。橘色那條是講師加的標示，劉備到〈桃園結義〉。
先問：劉備到〈桃園結義〉這條線是哪來的？按一下：劉備卡裡有一句「三人越談越投合，隔天就在張飛莊後的桃園立誓，留下著名的 [[桃園結義]]」，橘框框起來的就是那個連結，跟左邊那條橘線同一個顏色。
按一下：劉備卡裡寫了 [[桃園結義]]，Obsidian 就畫這條線。打開你自己的卡看局部關聯圖，連到關羽、曹操的那幾條線，就是你剛才加的 [[ ]]。最後一下：關聯圖上的線沒寫是什麼關係，也沒寫出處。練習 4 請 Codex 用文字畫，每條線寫上關係和來源檔名。整座筆記庫的關聯圖放在附錄第 ${pageOf(GraphView)} 頁。`],
  [AsciiAsk, `93:30–100:00（練習 6 分半，Codex 跑約 1 分鐘）。練習 4：請 Codex 用純文字畫關羽的關係圖。左邊是要貼進 Codex 的提示詞，畫面只放前幾行，完整的從 prompts.md〈練習 4〉複製：${PROMPTS_URL}
提示詞裡的「關係/＿＿.md」要換成你在練習 2 寫的卡名。畫面用講師的〈許田打圍〉當例子；寫〈溫酒斬華雄〉的就換成 溫酒斬華雄，寫〈轅門射戟〉的換成 轅門射戟。
三個框是提示詞的重點。定位：只讀〈桃園結義〉和你寫的卡。期望輸出：從關羽畫起，每條線編號、附來源檔名。限制：只畫兩張卡「參與人物」那一行的人，找不到原句就不畫。兩張卡都有關羽，所以從關羽畫起，兩張卡的人會畫在同一張圖上。
大家貼上、按 Enter，讓它跑。
按一下：會看到的樣子大概像這樣，這是格式示意，不是實跑。前兩條來自〈桃園結義〉；橘字那條來自〈許田打圍〉：原文第 20 回寫關羽「提刀拍馬便出，要斬曹操」。劉備已經在第 1 條畫過，提示詞要求每兩個人只畫一條，所以不會再畫一次。用詞、分支怎麼排，每個人會不一樣。
最後一下：你寫的卡沒出現在圖上，先檢查兩件事：提示詞裡的卡名有沒有換對；你寫的卡「參與人物」那一行有沒有 [[關羽]]。改好再貼一次。
做完的同學：把起點換成你寫的卡裡的另一位人物，再畫一次。第三堂會用 Skill 把同樣的關係畫成 HTML 圖。`],
  [Recap, `100:00–104:00。回顧四章。一，Obsidian：點連結往下讀，看反向連結找回來。二，寫一張自己的關係卡，連到人物，也從大綱連回來。三，讓 Codex 讀筆記庫：它先翻筆記再回答，回答裡有你寫的卡，原句回卡片搜得到。四，請 Codex 畫關係圖：你寫的卡接進圖裡。
最後一下：筆記庫就是你電腦裡的資料夾，Codex 讀得到，就能幫你找、幫你畫。下一堂把這些做法存成 Skill。`],
  [NextSkills, `104:00–120:00（含問答）。下一堂講 Skill。Skill 就是一份寫好的做事說明，像食譜：照著做，每次的做法比較一致。
第一步，把 Skill 裝進 Codex。按一下：第二步，用 Skill 做事：畫關係圖、把卡片改寫成好讀的版本。按一下：第三步，自己寫一個 Skill，把三國的事件排成時間軸。
按一下：同一座筆記庫，下一堂會多出圖和時間軸，今天的筆記庫和你寫的卡請留著。
最後一下：課前作業。下一堂用 npx skills add 安裝 Skill，要先有 git 和 Node.js，先裝 git。打開終端機（Windows 是 PowerShell），輸入 git --version，看到 git version 2 開頭就有了；沒有的話，照 git 官網 https://git-scm.com/install 的建議：Mac 先到 https://brew.sh 裝 Homebrew，再輸入 brew install git；Windows 打開 https://git-scm.com/install/windows 按 Click here to download，選項都用預設。接著到 https://nodejs.org/en/download 下載標著 LTS 的安裝檔（Mac 是 .pkg，Windows 是 .msi），選項都用預設。裝完把終端機關掉重開，輸入 node -v，看到 v22 以上的版本號就可以了。詳細步驟在第三堂 prompts.md 練習 1-1。
剩下的時間開放問答。`],
  [ReferencesRag, `（課後自讀，上課不講。）
第 3 章用到的論文。arXiv 編號可以直接打 arxiv.org/abs/編號 打開。
RAG、附出處：
- Lewis et al. 2020, Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks（RAG 這個名字的出處）. https://arxiv.org/abs/2005.11401
- Shuster et al. 2021, Retrieval Augmentation Reduces Hallucination in Conversation（先查資料再答，亂編的情況變少）. https://arxiv.org/abs/2104.07567
- Gao et al. 2023, Enabling Large Language Models to Generate Text with Citations（要求回答附出處，並檢查出處是否支持回答）. https://arxiv.org/abs/2305.14627
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
  [AppendixIndex, `（附錄目錄，課堂不講。）上課沒講的細節放在這裡：Obsidian 多看一點的功能、講師用「曹操參與哪場戰役」實跑的 RAG 紀錄，和一個沒有標準答案的進階討論。同學問到時，請他在自己的筆電翻到對應頁碼。`],
  [CardTypes, `（附錄，課堂不講。）三國筆記庫的卡分三種。最上面是入口卡〈三國演義〉，從它可以連到每一張卡。
人物卡 5 張：劉備、關羽、張飛、曹操、孫權，一張寫一個人。按一下：勢力卡 3 張：蜀漢、曹魏、東吳，一張寫一方陣營。按一下：關係卡 3 張：桃園結義、煮酒論英雄、赤壁之戰，一張寫一件事：誰和誰、在第幾回、發生什麼事。
按一下：三種共 11 張，加入口卡一共 12 張。原文、整理、模板這三個資料夾裡的東西不算卡。
最後一下：人物之間發生的事，寫成關係卡。三張關係卡最上面有「回目」欄位，〈桃園結義〉還寫了年份「中平元年」；第三堂排時間軸會用到這兩個欄位。`],
  [StoryMap, `（附錄，課堂不講。）上排五個人物。按一下：〈桃園結義〉接到關羽、張飛、劉備，第 1 回。按一下：〈煮酒論英雄〉接到劉備和曹操，第 21 回。按一下：〈赤壁之戰〉接到曹操和孫權，第 49 到 50 回。
最後一下：劉備、曹操外面多一圈，各連到兩張關係卡。圖上只畫每段故事最核心的人；卡片正文其實連到更多人，例如〈赤壁之戰〉也連到劉備、關羽、張飛。
小說出處：https://zh.wikisource.org/wiki/三國演義/第001回 、https://zh.wikisource.org/wiki/三國演義/第021回 、https://zh.wikisource.org/wiki/三國演義/第049回`],
  [GrayLink, `（附錄，課堂不講。）連到還沒建立的筆記，叫「未解析連結」（Unresolved Link）。上面：[[劉備]] 有對應的卡，所以是深紫色，點了就打開。
按一下：[[呂布]] 寫了連結，可是資料夾裡沒有 呂布.md，Obsidian 會顯示成比較淡的紫色。
按一下：點淡色連結，Obsidian 會新建一張空白的 呂布.md。2026-10-24 實測（Obsidian 1.10.3，Mac）：在大綱點淡色的董卓，馬上新增一張空白的 董卓.md，放在筆記庫最外層，不會放進 人物/。
按一下：淡色連結：指向的卡還沒建立，不一定是打錯字。
最後一下：分不出深淺時，按 Cmd+O（Windows 是 Ctrl+O）打開快速切換，輸入名字，找不到這個檔，就是還沒有卡。`],
  [GrayDecide, `（附錄，選做。）淡色連結要補卡，還是先留著？步驟在 prompts.md 的〈附錄：整理淡色連結〉。
左邊是講師大綱裡出現最多次、還沒有卡的人：呂布 29 次、董卓 19 次，袁術、袁紹、李傕、孫堅各 6 次。你的大綱數字會不一樣，所以先自己數。
按一下，1：按 Cmd+Shift+F（Windows 是 Ctrl+Shift+F）打開搜尋，輸入「呂布」，看「三國演義大綱」那一列有幾處。
按一下，2：常出現、原文也夠寫一張卡的，記下來。呂布第 5 回三英戰呂布、第 19 回白門樓都有完整的故事；這兩張第三堂會直接發寫好的卡。
按一下，3：只出現一兩次的，先留著。淡色連結不會壞，之後補卡就自動變深色。
2026-10-24 實測（Obsidian 1.10.3、1.14.5，Mac）：Cmd+Shift+F 搜「呂布」，在講師的大綱是「29 項結果」，連回目標題裡的呂布也算進去。原文放進筆記庫後，搜尋結果還會多出原文裡的呂布。`],
  [BacklinksReal, `（附錄，課堂不講。）左邊是劉備卡右側的反向連結面板，放進講師的大綱後的實際畫面（2026-10-24 擷取，Obsidian 1.14.5）。這裡的數字算的是「劉備被提到幾處」，不是卡片有幾張。大綱放進來之前，筆記庫裡有 17 處提到劉備。
按一下，標 1：「已連結本筆記的檔案」變成 36。按一下，標 2：其中 19 處來自三國演義大綱。
你沒有改劉備卡，這些反向連結是 Obsidian 自動算出來的。用自己的大綱，數字會不一樣。`],
  [GraphView, `（附錄，課堂不講。）Obsidian 內建的 Graph View 叫「關聯圖」：按左側工具列的關聯圖圖示，或按 Ctrl+G（Mac 是 Cmd+G）。這是筆記庫和講師的大綱合併後的實際畫面，你的圖排法會不一樣。
注意：這張畫面是原文還不在筆記庫時擷取的。原文/ 的 24 個檔（第 1–21 回和第 37、38、46 回節選）沒有任何連結，會在外圍多出 24 個孤零零的小點。想跟畫面一樣，打開關聯圖右上角的設定（齒輪），在「篩選」把孤立檔案（英文介面叫 Orphans）關掉。這個選項的中文名稱講師還沒確認。
按一下，標 1：中間的大圓是三國演義大綱，連出去最多線。按一下，標 2：四周一圈淡色小點，是大綱裡還沒有卡的名字。按一下，標 3：右下一群深色點，是講師的人物、勢力、關係卡，彼此連得很密。`],
  [RStep, `（附錄，課堂不講；講師用「曹操參與哪場戰役」實跑的 RAG 紀錄，第 1 頁。）提示詞：「依這座筆記庫，曹操參與哪場戰役？只根據 .md 卡片回答，每個說法附上檔名和一句卡片原句；筆記沒寫的就說找不到，不要自己補。」（2026-10-18，Codex 0.154.0，唯讀模式。）
R，檢索。上面這行是 Codex 實際執行的搜尋指令：rg 是一個搜尋工具，意思是在所有 .md 檔裡找「曹操、戰役、戰爭、之戰、大戰」這幾個詞。
按一下：找到 14 個檔、77 行。橘色的兩條，赤壁之戰卡和曹操卡，是最後回答引用的檔。最多的是大綱 26 行；練習提示詞 7 行，因為那時候筆記庫裡還放著練習提示詞，連它都被當成證據搜進來，所以提示詞後來整份搬出筆記庫。這份紀錄跑的是講師較早的大綱版本，行數會跟現在不同。
按一下：實跑紀錄裡，它沒有另外打開整張卡，搜尋完就直接回答，用的只是這 77 行。
最後一下：這次 Codex 只讀了搜尋命中的句子，沒讀整張卡。搜尋到不等於讀過，核對時要記得。`],
  [AStep, `（附錄，課堂不講；曹操題實跑第 2 頁。）A，增強。左邊橘色邊的是搜尋找到的句子，挑 77 行裡的 4 行：曹操卡第 11 行、赤壁之戰卡第 13 和 19 行、大綱第 44 行。
按一下：這些句子和問題放進同一份輸入，送進模型；輸入框裡橘框的兩行只是舉例，77 行全都在裡面。這一輪輸入 44,156 個 token，裡面包含 Codex 自己的說明，不全是筆記。
按一下：回答真正引用的，是綠框打勾的兩句：曹操卡第 11 行，和赤壁之戰卡第 19 行的「參與人物」。
最後一下：模型拿到的是問題加上檢索到的筆記。`],
  [GStep, `（附錄，課堂不講；曹操題實跑第 3 頁。）G，生成。左邊是 Codex 的實際回答：「曹操參與的戰役是：赤壁之戰。」接著兩個檔名，各附一句原句。最後一句是「筆記中找不到曹操參與其他戰役的明確記載」。
按一下：打開 人物/曹操.md，這一句就在第 4 段。按一下：打開 關係/赤壁之戰.md，最後一行就是參與人物。
最後一下：有檔名和原句，就能回筆記核對。但請先記住：兩句引用都找得到，不代表答案完整，第 ${pageOf(WithWithout)}–${pageOf(LimitMiss)} 頁會看到它漏了什麼。`],
  [WithWithout, `（附錄，課堂不講；曹操題實跑第 4 頁。）同一個問題，問兩次，都是實跑。左邊在一個空資料夾裡問「曹操參與哪場戰役？」；右邊在筆記庫裡問，多了三個要求：只看卡片、附檔名和原句、沒寫就說找不到。兩次問法不一樣，所以差別有的來自筆記，有的來自問法，分不開。
按一下：左邊沒東西可查，只能憑記憶回答：官渡之戰、赤壁之戰、濮陽、下邳、潼關之戰等。沒有檔名，沒辦法回去查它根據什麼。
按一下：右邊先搜尋筆記庫，引用曹操卡和赤壁之戰卡的兩句，回答「赤壁之戰」。兩句都找得到。
最後一下：右邊引用有根據，但只答了一場。大綱裡明明寫了濮陽、下邳，它都沒算。這就是「有根據」和「完整」要分開查的原因，下一頁看縮小範圍再問的結果。`],
  [LimitMiss, `（附錄，課堂不講；曹操題實跑第 5 頁。）搜到卻沒用上：搜到了，回答也可能漏掉沒用。左邊是第一次回答：赤壁之戰，還說「筆記中找不到曹操參與其他戰役」。
按一下：可是大綱裡搜到 26 行，寫了濮陽、下邳好幾場仗，它都沒算進去。
按一下：縮小範圍再問：「再查 整理/三國演義大綱.md：曹操在第 1 到 21 回參與了哪些戰役？每一項附回目和檔名；筆記沒寫的不要補。」這次在講師的大綱上實跑（2026-10-24，Codex 0.154.0），列了 7 項。同一題跑三次，三次都是 7 項，但內容不一樣：有兩次把第 5 回排除，一次列了進去。這 7 項怎麼核對，是附錄第 ${pageOf(Practice3)} 頁的進階討論。
最後一下：縮小檢索範圍：指定檔案和回目。`],
  [LinksHelp, `（附錄，課堂不講。）來源追溯，英文 Provenance：從答案往回找，它根據哪個檔案、哪段內容。實跑時 Codex 是用搜尋找到句子，紀錄裡看不到它沿著 [[連結]] 一張一張點過去；連結真正幫上忙的地方，是你查證的時候。
1：回答寫了 人物/曹操.md。按一下，2：打開它，那一句裡的「赤壁之戰」是紫色連結。按一下，3：點下去，就跳到〈赤壁之戰〉。
最後一下：檔名指出出處，連結帶你回到相關的卡。`],
  [LimitMissing, `（附錄，課堂不講。）RAG 的限制之一，Barnett 等人叫它「缺少內容」（Missing Content）：筆記沒寫的內容，檢索不到。實跑提示詞：「官渡之戰是誰打贏的？請只根據這個筆記庫裡的 .md 卡片回答，附上檔名；筆記沒寫的就說找不到，不要自己補。」它搜尋「官渡、袁紹、曹操」，沒有任何卡提到官渡。
按一下：它的回答是「找不到。筆記庫中的 .md 卡片沒有提到「官渡之戰」或其勝負。」
最後一下：筆記沒寫時，正確的回答就是「找不到」。官渡之戰在第 30 回，不在第 1 到 21 回的大綱裡。`],
  [Practice3, `（附錄，進階討論，選做；有時間或課後再聊。）這一題沒有一刀兩斷的答案，重點是說得出依據哪一句。回答是「曹操在第 1 到 21 回參與了哪些戰役」在講師的大綱上的實跑結果，一共 7 項：${ADV3_URL}；對照的是講師的大綱：${SAMPLE_OUTLINE_URL}
每一列問三件事：檔案在嗎、原句在嗎、有沒有多寫。
按一下：第 1 列值得討論。大綱第 5 回只寫「曹操在陳留散家財招募義兵，發檄文召集各路諸侯討伐董卓」，汜水關是關羽溫酒斬華雄，虎牢關是劉關張戰呂布，沒寫曹操上陣。可是「參與」不一定要親自上陣：發檄文、出兵也算參與嗎？兩種判斷都說得通，重點是說得出依據哪一句。原文第 5 回還有一句「操引軍往來救應」，但那不在大綱裡。
其他列講師的判斷：第 2 列滎陽（第 6 回「曹操獨自追擊，卻在滎陽被董卓軍擊敗」）、第 3 列徐州（第 10–12 回）、第 4 列濮陽（第 11 回「呂布在濮陽設計誘敵」）、第 5 列攻打呂布（第 13 回）、第 7 列下邳（第 18–19 回）都打勾。第 6 列「淯水」兩個字只在第 16 回的回目，內文沒有，回目算不算大綱寫的，也可以討論。`],
  [Practice3Ask, `（附錄，進階討論，選做。）對第 1 列有疑問，就追問 Codex：「大綱第 5 回哪一句寫了曹操在汜水關或虎牢關上陣打仗？只根據 整理/三國演義大綱.md，引用原句；沒寫就說沒寫。」
按一下：講師 2026-10-24 實跑，它回「沒寫」，把第 5 回那句整段引出來。
按一下：要求引用原句，比較看得出哪一項是模型自己補的。但「沒寫上陣」是否等於「沒參與」，還是要自己判斷。
最後一下：有時間自己問一題。畫面上是範本的開頭，整段在 prompts.md 的〈進階討論〉：「（你的問題）只根據 人物/ 勢力/ 關係/ 整理/ 裡的卡回答，每個說法附上檔名和一句原句；沒寫的就說找不到，不要自己補。」範圍不含 原文/，所以它引原文就算多寫。這兩題模型可能知道得比卡片多，正好看它有沒有多寫：「白門樓上，劉備對曹操說了什麼原話？」原話在 原文/第019回.md：「公不見丁建陽、董卓之事乎？」它直接說出這句卻沒引用檔案，就是範圍外補來的。「關羽在第 1 到 21 回斬了哪些人？」大綱沒寫第 1 回的程遠志，它照規則說找不到才對。`],
]);

export const notes: (string | undefined)[] = deck.map(page => NOTES.get(page));

export default deck satisfies Page[];
