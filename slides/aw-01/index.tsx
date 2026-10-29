import type { DesignSystem, Page, SlideMeta, SlideTransition } from '@open-slide/core';
import { Step, Steps, useIsActivePage, useSlidePageNumber } from '@open-slide/core';
import type { CSSProperties, ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';
import wrongSum from './assets/llm-hallucination-calculation.png';
import guess8460 from './assets/guess-8460.png';
import webSearch from './assets/thinking-web-search.png';
import researchAnswer from './assets/thinking-research-answer.png';
import codexStart from './assets/codex-cli-start.png';
import codexStatus from './assets/codex-cli-status.png';
import loginSuccess from './assets/codex-login-success.png';
import labQr from './assets/lab-zip-qr.svg';
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
const FONT_LINK_ID = 'osd-webfont-aw-01';
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
// when their step is revealed, bars that grow, and pieces that settle in order. Un-clicked
// motion (a page's pieces settling in, the chapter bar filling) runs only on the page the
// audience is watching (useIsActivePage).
const EASE_OUT = 'cubic-bezier(0.23, 1, 0.32, 1)';
const STEP_MS = 280;
const BUILD_MS = 320;
const BUILD_GAP = 90;
const BAR_MS = 600;
const FILL_MS = 480;
const ENTER_MS = 420;
const ENTER_GAP = 90;
const DRAW_MS = 520;

const MOTION_CSS = `
.aw1-deck [data-osd-step] > * { transition: transform ${STEP_MS}ms ${EASE_OUT}; }
.aw1-deck [data-osd-step="pending"] > * { transform: translateY(8px); }
.aw1-deck .aw1-build { transition-property: opacity, transform; transition-duration: ${BUILD_MS}ms; transition-timing-function: ${EASE_OUT}; }
.aw1-deck [data-osd-step="pending"] .aw1-build { opacity: 0; transform: translateY(10px); }
.aw1-deck .aw1-bar { transform-origin: left center; transition: transform ${BAR_MS}ms ${EASE_OUT}; }
.aw1-deck [data-osd-step="pending"] .aw1-bar { transform: scaleX(0); }
.aw1-deck .aw1-stepdraw { stroke-dasharray: 1; stroke-dashoffset: 0; transition: stroke-dashoffset ${DRAW_MS}ms ${EASE_OUT}; }
.aw1-deck [data-osd-step="pending"] .aw1-stepdraw { stroke-dashoffset: 1; }
.aw1-deck .aw1-token-note::after { content: "（第 " attr(data-ref-page) " 頁）"; }
@keyframes aw1-fill { from { transform: scaleX(0); } to { transform: scaleX(1); } }
.aw1-deck .aw1-fill { transform-origin: left center; animation: aw1-fill ${FILL_MS}ms ${EASE_OUT} 160ms both; }
@keyframes aw1-in { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: none; } }
.aw1-deck .aw1-in { animation: aw1-in ${ENTER_MS}ms ${EASE_OUT} both; }
@keyframes aw1-draw { from { stroke-dashoffset: 1; } to { stroke-dashoffset: 0; } }
.aw1-deck .aw1-draw { stroke-dasharray: 1; animation: aw1-draw ${DRAW_MS}ms ${EASE_OUT} both; }
@keyframes aw1-pop { from { opacity: 0; transform: scale(0.75); } to { opacity: 1; transform: scale(1); } }
.aw1-deck .aw1-pop { transform-box: fill-box; transform-origin: center; animation: aw1-pop 300ms ${EASE_OUT} both; }
@keyframes aw1-in-fade { from { opacity: 0; } to { opacity: 1; } }
.aw1-deck rect.aw1-fill { transform-box: fill-box; }
.aw1-deck .aw1-steppop { transform-box: fill-box; transform-origin: center; transition-property: opacity, transform; transition-duration: 300ms; transition-timing-function: ${EASE_OUT}; }
.aw1-deck [data-osd-step="pending"] .aw1-steppop { opacity: 0; transform: scale(0.75); }
.aw1-deck .aw1-cue { transition: opacity ${STEP_MS}ms ${EASE_OUT}; }
${[1, 2, 3, 4].map(n => `.aw1-deck:has([data-osd-step="pending"] > [data-cue="${n}"]) .aw1-cue[data-cue="${n}"] { opacity: 0; }`).join('\n')}
@media (prefers-reduced-motion: reduce) {
  .aw1-deck .aw1-cue { transition: none; }
  .aw1-deck .aw1-steppop { transition: opacity 150ms ease; transition-delay: 0s !important; }
  .aw1-deck [data-osd-step="pending"] .aw1-steppop { transform: none; }
  .aw1-deck .aw1-in, .aw1-deck .aw1-pop { animation: aw1-in-fade 150ms ease both; }
  .aw1-deck .aw1-draw { animation: none; stroke-dasharray: none; }
  .aw1-deck .aw1-stepdraw, .aw1-deck [data-osd-step="pending"] .aw1-stepdraw { transition: none; stroke-dasharray: none; stroke-dashoffset: 0; }
  .aw1-deck [data-osd-step] > *, .aw1-deck [data-osd-step="pending"] > * { transform: none; transition: none; }
  .aw1-deck .aw1-build { transition: opacity 150ms ease; transition-delay: 0s !important; }
  .aw1-deck [data-osd-step="pending"] .aw1-build { transform: none; }
  .aw1-deck .aw1-bar, .aw1-deck [data-osd-step="pending"] .aw1-bar { transform: none; transition: none; }
  .aw1-deck .aw1-fill { animation: none; }
}
`;
const MOTION_STYLE_ID = 'osd-motion-aw-01';
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
  return <div className={live ? 'aw1-in' : undefined} style={live ? { ...style, animationDelay: enterDelay(i) } : style}>{children}</div>;
};

const InG = ({ i, children }: { i: number; children: ReactNode }) => {
  const live = useIsActivePage();
  return <g className={live ? 'aw1-in' : undefined} style={live ? { animationDelay: enterDelay(i) } : undefined}>{children}</g>;
};

const PopG = ({ i, children }: { i: number; children: ReactNode }) => {
  const live = useIsActivePage();
  return <g className={live ? 'aw1-pop' : undefined} style={live ? { animationDelay: enterDelay(i) } : undefined}>{children}</g>;
};

const DrawPath = ({ i, d }: { i: number; d: string }) => {
  const live = useIsActivePage();
  return <path d={d} pathLength={1} className={live ? 'aw1-draw' : undefined} style={live ? { animationDelay: enterDelay(i) } : undefined} />;
};

// A solid line inside a <Step>: it draws itself when that step is revealed.
const StepPath = ({ d, i = 0 }: { d: string; i?: number }) => (
  <path d={d} pathLength={1} className="aw1-stepdraw" style={buildDelay(i, 60)} />
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
const warnSoft = '#F3E1DC';
const link = '#7654C7'; // Obsidian's internal-link purple
const linkSoft = '#EEE7F2';
const linkPale = '#B9A6E3'; // Obsidian's fainter purple for a link with no card yet
const term = '#1F2226';
const mono = '"Source Code Pro", Consolas, Menlo, monospace';
const display = 'var(--osd-font-display)';
const LAB_URL = 'https://github.com/Chrouos/AI-workshop-slides/tree/main/examples/aw-01-lab';
const LAB_ZIP_URL = 'https://raw.githubusercontent.com/Chrouos/AI-workshop-slides/main/examples/aw-01-lab.zip';
const PROMPTS_URL = 'https://github.com/Chrouos/AI-workshop-slides/blob/main/examples/aw-01-lab/prompts.md';

// Text is authored in explicit span/tspan slots at each call site so inspector
// edits can target one label, including repeated labels and forwarded props.
// ---------- Frame ----------

const Title = ({ children }: { children: ReactNode }) => (
  <h1 style={{ fontFamily: '"Libre Baskerville", Georgia, "Times New Roman", serif', fontSize: 132, fontWeight: 400, lineHeight: 1.17, letterSpacing: '-0.035em', maxWidth: 1500, margin: 0, color: ink, whiteSpace: 'pre-line' }}>{children}</h1>
);

// With a source, the footer's left side names where the page's idea comes from.
const Footer = ({ children }: { children: ReactNode }) => {
  const { current, total } = useSlidePageNumber();
  return (
    <div style={{ position: 'absolute', left: 144, right: 144, bottom: 56, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 32, borderTop: '1px solid #E7E5E4', paddingTop: 22, fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', fontSize: 22, fontWeight: 400, color: quiet }}>
      {children}
      <span style={{ flexShrink: 0, whiteSpace: 'nowrap' }}>{String(current).padStart(2, '0')}<span> / </span>{String(total).padStart(2, '0')}</span>
    </div>
  );
};

const Eyebrow = ({ children }: { children: ReactNode }) => (
  <div style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', fontSize: 24, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#78716C' }}>{children}</div>
);

const PracticeEyebrow = ({ children, time }: { children: ReactNode; time: ReactNode }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
    <Eyebrow><span>{children}</span></Eyebrow>
    <span style={{ display: 'inline-flex', alignItems: 'center', background: '#FFFFFF', border: `1px solid ${rule}`, padding: '6px 18px', fontSize: 24, whiteSpace: 'nowrap' }}>
      <strong style={{ color: amber }}><span>⏱ </span><span>{time}</span></strong>
    </span>
  </div>
);

// The five chapters of lesson 1 (also used in accessible descriptions).
const CHAPTERS = ['AI 怎麼走到今天', 'ChatGPT 與 Codex', '安裝 Codex', '看懂 Codex', '用 Codex 寫大綱'];
type Chapter = 1 | 2 | 3 | 4 | 5;

const RouteSeg = ({ color, fill = false }: { color: string; fill?: boolean }) => (
  <span style={{ width: 34, height: 6, background: fill ? rule : color, display: 'block' }}>
    {fill ? <span className="aw1-fill" style={{ display: 'block', width: '100%', height: '100%', background: color }} /> : null}
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
      {chapter === 1 ? (
        <span style={{ marginLeft: 12, fontFamily: 'var(--osd-font-body)', fontSize: 24, fontWeight: 600, color: amber, letterSpacing: '0.04em' }}>
          01｜AI 怎麼走到今天（以 GPT 為例）
        </span>
      ) : (
        <span style={{ marginLeft: 12, fontFamily: 'var(--osd-font-body)', fontSize: 24, fontWeight: 600, color: amber, letterSpacing: '0.04em' }}>
          {chapter === 2 ? <span>02｜ChatGPT 與 Codex</span> : chapter === 3 ? <span>03｜安裝 Codex</span> : chapter === 4 ? <span>04｜看懂 Codex</span> : <span>05｜用 Codex 寫大綱</span>}
        </span>
      )}
    </div>
  );
};

const Shell = ({ children, top = 112, chapter, enterChapter = false, source }: { children: ReactNode; top?: number; chapter?: Chapter; enterChapter?: boolean; source?: ReactNode }) => (
  <div className="aw1-deck" style={{ width: '100%', height: '100%', boxSizing: 'border-box', position: 'relative', display: 'flex', flexDirection: 'column', background: 'var(--osd-bg)', color: 'var(--osd-text)', fontFamily: 'var(--osd-font-body)', padding: `${top}px 144px 126px` }}>
    {chapter ? <RouteBar chapter={chapter} enter={enterChapter} /> : null}
    {children}
    <Footer>{source ? <span style={{ whiteSpace: 'nowrap' }}><strong style={{ fontWeight: 600, color: muted }}>參考</strong><span>｜</span>{source}</span> : <span>AI 協作課｜第 1 堂 認識 AI，學會用 Codex</span>}</Footer>
  </div>
);

// The page's main picture: fills the space between the heading and the footer.
const Fit = ({ z = 1, children }: { z?: number; children: ReactNode }) => (
  <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingTop: 24 }}>
    <div style={{ zoom: z }}>
      {/* @slide-comment id="c-fa004a8e" ts="2026-10-20T13:18:00.665Z" text="eyJub3RlIjoi6YCZ5LiA5aGK55qE5ouG5q2l6amfIOWPr-S7peWcqOaLhueahOe0sOS4gOm7nuiuk-S6uuimuuW-l-S7luecn-eahOacieWcqOaLhiJ9" */}{children}</div>
  </div>
);

const Takeaway = ({ children, color = amber, marginTop = 48 }: { children: ReactNode; color?: string; marginTop?: number }) => (
  <div style={{ fontFamily: display, fontSize: 44, lineHeight: 1.35, color, marginTop, textAlign: 'center' }}>{children}</div>
);

const Heading = ({ children }: { children: ReactNode }) => (
  <h2 style={{ fontFamily: display, fontSize: 66, fontWeight: 400, lineHeight: 1.2, letterSpacing: '-0.025em', margin: '40px 0 0', maxWidth: 1620 }}>{children}</h2>
);

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
    <span style={{ flex: '0 0 auto', width: 44, height: 44, borderRadius: 44 / 2, background: amber, color: '#FFFFFF', display: 'grid', placeItems: 'center', fontSize: Math.round(44 * 0.57), fontWeight: 600 }}>{n}</span>
    <span>{children}</span>
  </div>
);

const Callout = ({ n, title, detail }: { n: ReactNode; title: ReactNode; detail?: ReactNode }) => (
  <div style={{ display: 'grid', gridTemplateColumns: '44px 1fr', gap: 20, alignItems: 'start' }}>
    <span style={{ flex: '0 0 auto', width: 44, height: 44, borderRadius: 44 / 2, background: amber, color: '#FFFFFF', display: 'grid', placeItems: 'center', fontSize: Math.round(44 * 0.57), fontWeight: 600 }}>{n}</span>
    <div>
      <div style={{ fontSize: 32, fontWeight: 600, lineHeight: 1.35 }}>{title}</div>
      {detail ? <div style={{ fontSize: 27, color: muted, marginTop: 6, lineHeight: 1.45 }}>{detail}</div> : null}
    </div>
  </div>
);

// A terminal window. Lines are plain text; "$" lines are what the learner types.
const Terminal = ({ title, children, width, size = 29 }: { title: ReactNode; children: ReactNode; width?: number; size?: number }) => (
  <div style={{ width, boxSizing: 'border-box', background: term, color: '#F5F5F4', border: '1px solid #555B60' }}>
    <div style={{ height: 52, display: 'flex', alignItems: 'center', gap: 12, background: '#30343A', padding: '0 26px', boxSizing: 'border-box' }}>
      <span style={{ width: 13, height: 13, borderRadius: 20, background: '#DF6A63' }} />
      <span style={{ width: 13, height: 13, borderRadius: 20, background: '#E9B650' }} />
      <span style={{ width: 13, height: 13, borderRadius: 20, background: '#73BB78' }} />
      <span style={{ fontFamily: mono, color: '#BCC3CC', fontSize: 24, marginLeft: 16 }}>{title}</span>
    </div>
    <div style={{ padding: '28px 38px 34px', fontFamily: mono, fontSize: size, lineHeight: 1.6, whiteSpace: 'pre' }}>{children}</div>
  </div>
);
const Typed = ({ children }: { children: ReactNode }) => <span style={{ color: '#8DD4A0' }}>{children}</span>;
const AskLine = ({ children }: { children: ReactNode }) => <span style={{ color: '#E9B650' }}>{children}</span>;
const Dim = ({ children }: { children: ReactNode }) => <span style={{ color: '#9AA3AD' }}>{children}</span>;
const HotLine = ({ children }: { children: ReactNode }) => <span style={{ background: 'rgba(233,182,80,0.22)', outline: '3px solid #E9B650', outlineOffset: 2 }}>{children}</span>;

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
    {caption ? <div style={{ fontSize: 24, lineHeight: 1.4, color: quiet, marginTop: 12 }}>{caption}</div> : null}
  </div>
);

// An outline drawn over one region of a screenshot (in % of the image), with its number.
const RegionMark = ({ x, y, w, h, n, i, badge = 'left' }: { x: number; y: number; w: number; h: number; n: ReactNode; i: number; badge?: 'left' | 'right' }) => {
  const live = useIsActivePage();
  return (
    <div className={live ? 'aw1-in' : undefined} style={{ position: 'absolute', left: `${x}%`, top: `${y}%`, width: `${w}%`, height: `${h}%`, border: '4px solid #E9B650', boxSizing: 'border-box', animationDelay: live ? enterDelay(i) : undefined }}>
      <span style={{ position: 'absolute', ...(badge === 'left' ? { left: -26, top: -26 } : { right: -56, top: '50%', marginTop: -24 }), width: 48, height: 48, borderRadius: 24, background: amber, color: '#FFFFFF', display: 'grid', placeItems: 'center', fontSize: 26, fontWeight: 600, boxShadow: '0 0 0 4px #FFFFFF' }}>{n}</span>
    </div>
  );
};

// Shows only the useful region of a screenshot, enlarged. crop = [x, y, w, h] in image pixels.
const Crop = ({ src, alt, iw, ih, crop, width, dark = false, children }: { src: string; alt: string; iw: number; ih: number; crop: [number, number, number, number]; width: number; dark?: boolean; children?: ReactNode }) => {
  const [x, y, w, h] = crop;
  const s = width / w;
  return (
    <div style={{ position: 'relative', width, height: Math.round(h * s), overflow: 'hidden', background: dark ? '#1F2228' : '#FFFFFF', border: `1px solid ${rule}`, flexShrink: 0 }}>
      <img src={src} alt={alt} style={{ position: 'absolute', left: -x * s, top: -y * s, width: iw * s, height: ih * s, maxWidth: 'none' }} />
      {children}
    </div>
  );
};

// The 1800×1080 CLI captures.
const Shot = ({ src, alt, crop, width, children }: { src: string; alt: string; crop: [number, number, number, number]; width: number; children?: ReactNode }) => (
  <Crop src={src} alt={alt} iw={1800} ih={1080} crop={crop} width={width} dark>{children}</Crop>
);

// With n, the mark carries its callout's number and appears together with <Cue n> (see MOTION_CSS).
const RowMark = ({ top, height = 32, width, n, badge = true }: { top: number; height?: number; width: number; n?: ReactNode; badge?: boolean }) => (
  <div className={n ? 'aw1-cue' : undefined} data-cue={n} style={{ position: 'absolute', left: 6, top, width, height, border: '3px solid #E9B650', boxSizing: 'border-box' }}>
    {n && badge ? <span style={{ position: 'absolute', right: -54, top: '50%', marginTop: -20, width: 40, height: 40, borderRadius: 20, background: amber, color: '#FFFFFF', display: 'grid', placeItems: 'center', fontSize: 24, fontWeight: 600, boxShadow: '0 0 0 3px #FFFFFF' }}>{n}</span> : null}
  </div>
);

// Wrap the content of a <Step> in <Cue n>: everything marked .aw1-cue[data-cue=n] on the page
// stays hidden until that step is revealed, so a mark on a screenshot lands with its explanation.
const Cue = ({ n, children }: { n: 1 | 2 | 3 | 4; children?: ReactNode }) => <div data-cue={n}>{children}</div>;

// A piece of a picture that appears with <Cue n>; delay staggers pieces of the same cue.
const CueSpan = ({ n, delay = 0, children }: { n: 1 | 2 | 3 | 4; delay?: number; children: ReactNode }) => (
  <span className="aw1-cue" data-cue={n} style={{ transitionDelay: `${delay}ms` }}>{children}</span>
);

// An outline that frames a piece of text; with n it appears with <Cue n>.
const Ring = ({ n, children, inline = false }: { n: 1 | 2 | 3; children: ReactNode; inline?: boolean }) => {
  const Tag = inline ? 'span' : 'div';
  return (
    <Tag style={{ position: 'relative', display: inline ? 'inline-block' : 'block' }}>
      {children}
      <span className="aw1-cue" data-cue={n} style={{ position: 'absolute', inset: '-3px -8px', border: `3px solid ${amber}`, pointerEvents: 'none' }} />
    </Tag>
  );
};

const TRow = ({ cells, cols, head = false, tint, size = 30 }: { cells: ReactNode[]; cols: string; head?: boolean; tint?: string; size?: number }) => (
  <div style={{ display: 'grid', gridTemplateColumns: cols, background: head ? raised : tint ?? 'transparent', borderBottom: `1px solid ${rule}`, fontSize: head ? 24 : size, fontWeight: head ? 600 : 400, color: head ? muted : 'var(--osd-text)', lineHeight: 1.45 }}>
    {cells.map((c, i) => (
      <div key={i} style={{ padding: head ? '14px 22px' : '20px 22px' }}>{c}</div>
    ))}
  </div>
);

// One line of a prompt squeezed to three labelled pills, ≤10 字 each.
const Pill = ({ tag, children }: { tag: ReactNode; children: ReactNode }) => (
  <span style={{ display: 'inline-flex', alignItems: 'stretch', border: `2px solid ${amber}`, borderRadius: 32, overflow: 'hidden', fontSize: 28, whiteSpace: 'nowrap' }}>
    <span style={{ background: amber, color: '#FFFFFF', fontWeight: 600, padding: '8px 18px' }}>{tag}</span>
    <span style={{ background: '#FFFFFF', padding: '8px 22px' }}>{children}</span>
  </span>
);

const PillRow = ({ i = 0, children }: { i?: number; children: ReactNode }) => (
  <In i={i} style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 30 }}>{children}</In>
);

const StatusLine = ({ ok, children, size = 28 }: { ok: boolean; children: ReactNode; size?: number }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: size, color: ok ? okGreen : amber, fontWeight: 600 }}>
    <svg viewBox="0 0 36 36" style={{ width: 36, height: 36, flexShrink: 0 }} aria-hidden="true">{ok ? <TickMark x={18} y={20} size={24} /> : <CrossMark x={18} y={18} size={18} color={amber} />}</svg>
    <span>{children}</span>
  </div>
);

// The exact sentence learners type, shown once in a quiet box.
const PromptBox = ({ children }: { children: ReactNode }) => (
  <div style={{ background: '#FFFFFF', border: `1px solid ${rule}`, borderLeft: `6px solid ${amber}`, padding: '20px 32px', display: 'flex', alignItems: 'center', gap: 22 }}>
    <SmallLabel><span>你輸入</span></SmallLabel>
    <span style={{ fontSize: 33 }}>{children}</span>
  </div>
);

// ---------- Icons ----------
type IconKind = 'calc' | 'doc' | 'chat' | 'ok' | 'save' | 'browser' | 'search' | 'think' | 'terminal' | 'folder' | 'globe' | 'down' | 'dice' | 'alert' | 'cloud' | 'laptop' | 'key' | 'redo' | 'tool' | 'book';

const IconPaths = ({ kind, color }: { kind: IconKind; color: string }) => (
  <g fill="none" stroke={color} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
    {kind === 'calc' && <><rect x="14" y="6" width="36" height="52" rx="4" /><rect x="20" y="12" width="24" height="10" /><path d="M21 32 h4 M30 32 h4 M39 32 h4 M21 41 h4 M30 41 h4 M39 41 h4 M21 50 h4 M30 50 h4 M39 50 h4" /></>}
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
    {kind === 'dice' && <><rect x="9" y="9" width="46" height="46" rx="9" /><circle cx="21" cy="21" r="2.5" fill={color} /><circle cx="32" cy="32" r="2.5" fill={color} /><circle cx="43" cy="43" r="2.5" fill={color} /></>}
    {kind === 'alert' && <><path d="M32 8 L58 54 H6 Z" /><path d="M32 26 V39" /><circle cx="32" cy="47" r="1.5" fill={color} /></>}
    {kind === 'cloud' && <><path d="M18 48 H48 C56 48 60 42 60 36 C60 29 54 24 47 25 C45 16 37 11 29 13 C21 15 17 22 18 29 C11 30 6 35 6 40 C6 45 11 48 18 48 Z" /></>}
    {kind === 'laptop' && <><rect x="12" y="12" width="40" height="28" rx="2" /><path d="M4 50 H60 L55 42 H9 Z" /></>}
    {kind === 'key' && <><circle cx="20" cy="32" r="11" /><path d="M31 32 H58 M50 32 V42 M42 32 V39" /></>}
    {kind === 'redo' && <><path d="M50 34 A18 18 0 1 1 44 18" /><path d="M46 8 V20 H34" /></>}
    {kind === 'tool' && <><path d="M40 10 C33 10 28 16 30 23 L10 43 C8 45 8 49 11 52 C14 55 18 55 20 53 L40 33 C47 35 53 30 53 23 L46 28 L38 25 L36 18 Z" /></>}
    {kind === 'book' && <><path d="M32 16 C24 10 14 10 6 12 V52 C14 50 24 50 32 56 C40 50 50 50 58 52 V12 C50 10 40 10 32 16 Z" /><path d="M32 16 V56" /></>}
  </g>
);

const Icon = ({ kind, size = 64, color = ink }: { kind: IconKind; size?: number; color?: string }) => (
  <svg viewBox="0 0 64 64" style={{ width: size, height: size, display: 'block', flexShrink: 0 }} aria-hidden="true"><IconPaths kind={kind} color={color} /></svg>
);

const SvgIcon = ({ kind, x, y, size = 64, color = ink }: { kind: IconKind; x: number; y: number; size?: number; color?: string }) => (
  <g transform={`translate(${x - size / 2} ${y - size / 2}) scale(${size / 64})`}><IconPaths kind={kind} color={color} /></g>
);

// ---------- Picture helpers ----------
const Figure = ({ w = 1632, h, label, children }: { w?: number; h: number; label: string; children: ReactNode }) => (
  <svg viewBox={`0 0 ${w} ${h}`} style={{ display: 'block', width: w, height: h, overflow: 'visible' }} role="img" aria-label={label}>{children}</svg>
);

const Stage = ({ w = 1632, h, children }: { w?: number; h: number; children: ReactNode }) => (
  <div style={{ position: 'relative', width: w, height: h }}>
    {/* @slide-comment id="c-9bc3d71e" ts="2026-10-20T13:17:28.317Z" text="eyJub3RlIjoi6YCZ5LiA5q6155qEIGFuaW1hdGlvbiDlhKrljJblj6_ku6XkuIDlsaTkuIDlsaTnmoTmhJ_oproifQ" */}{children}</div>
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

const NoDot = ({ x, y, r = 22 }: { x: number; y: number; r?: number }) => (
  <g><circle cx={x} cy={y} r={r} fill={warn} /><CrossMark x={x} y={y} size={r * 0.8} color="#FFFFFF" /></g>
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

const SvgChip = ({ x, y, w, label, fill = '#FFFFFF', stroke = rule, color = ink, size = 24, h = 44, weight }: { x: number; y: number; w: number; label: ReactNode; fill?: string; stroke?: string; color?: string; size?: number; h?: number; weight?: number }) => (
  <g><rect x={x} y={y} width={w} height={h} rx="4" fill={fill} stroke={stroke} strokeWidth="2" /><text x={x + w / 2} y={y + h / 2 + size * 0.36} textAnchor="middle" fontSize={size} fontWeight={weight} fill={color}>{label}</text></g>
);

const Bubble = ({ x, y, w, h, fill = '#FFFFFF', stroke = rule }: { x: number; y: number; w: number; h: number; fill?: string; stroke?: string }) => (
  <path d={`M${x + 12} ${y} H${x + w - 12} Q${x + w} ${y} ${x + w} ${y + 12} V${y + h - 12} Q${x + w} ${y + h} ${x + w - 12} ${y + h} H${x + 60} L${x + 36} ${y + h + 22} L${x + 40} ${y + h} H${x + 12} Q${x} ${y + h} ${x} ${y + h - 12} V${y + 12} Q${x} ${y} ${x + 12} ${y} Z`} fill={fill} stroke={stroke} strokeWidth="2" />
);

// ---------- Opening ----------

const Cover: Page = () => (
  <Shell top={174}>
    <In i={0}><Eyebrow><span>AI WORKSHOP｜第 1 堂（共 4 堂）</span></Eyebrow></In>
    <In i={1} style={{ marginTop: 62 }}><Title><span>{'GPT 是什麼'}</span></Title></In>
    <In i={2} style={{ marginTop: 40, fontSize: 35, color: muted }}><span>{'從 GPT 怎麼寫字講起，學會用 Codex 跟 AI 一起做事'}</span></In>
    <In i={3} style={{ width: 160, height: 5, background: amber, marginTop: 72 }}><span /></In>
    <In i={3} style={{ marginTop: 40, display: 'flex', alignItems: 'center', gap: 14, fontSize: 28, color: muted }}>
      <Icon kind="laptop" size={36} color={muted} /><span>在筆電打開簡報：</span><span style={{ fontFamily: mono, color: ink, fontWeight: 600 }}>chrouos.github.io/AI-workshop-slides</span>
    </In>
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
    <Eyebrow><span>講者介紹 / ABOUT ME</span></Eyebrow>
    <Heading><span>黃懷萱</span></Heading>
    <Lead><span>AI 工程師，研究 NLP、LLM、RAG</span></Lead>
    <Fit>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 220px 1fr', gap: 48, alignItems: 'start' }}>
        <In i={0} style={{ textAlign: 'center' }}>
          <SmallLabel><span>求學</span></SmallLabel>
          <div style={{ fontFamily: display, fontSize: 68, lineHeight: 1.25, marginTop: 25 }}>中央大學碩士</div>
          <div style={{ fontSize: 31, color: muted, marginTop: 18 }}>NLP / LLM / RAG</div>
        </In>
        <In i={1} style={{ fontSize: 88, color: faint, textAlign: 'center', lineHeight: 1, marginTop: 60 }}><span>→</span></In>
        <In i={2} style={{ textAlign: 'center' }}>
          <SmallLabel><span>工作</span></SmallLabel>
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

// One lesson of the four, drawn as the thing it produces.
const LessonStop = ({ x, n, name, sub, today = false, children }: { x: number; n: number; name: ReactNode; sub: ReactNode; today?: boolean; children: ReactNode }) => (
  <g>
    <rect x={x - 150} y={40} width={300} height={230} rx="8" fill={today ? amberSoft : '#FFFFFF'} stroke={today ? amber : rule} strokeWidth={today ? 4 : 2} />
    {children}
    <text x={x} y={334} textAnchor="middle" fontSize="42" fontWeight="600" fill={ink}>{name}</text>
    <text x={x} y={382} textAnchor="middle" fontSize="28" fill={muted}>{sub}</text>
    <SvgChip x={x - 80} y={406} w={160} h={46} label={<tspan><tspan>第 </tspan><tspan>{n}</tspan><tspan> 堂</tspan></tspan>} size={25} fill={today ? amber : surface} stroke={today ? amber : rule} color={today ? '#FFFFFF' : quiet} />
  </g>
);

const CourseMap: Page = () => (
  <Shell>
    <Eyebrow><span>課程地圖｜四堂課只做一件作品</span></Eyebrow>
    <Heading><span>四堂課，做一份知識庫</span></Heading>
    <Fit>
      <Figure h={470} label="第 1 堂大綱、第 2 堂筆記庫、第 3 堂時間軸、第 4 堂網站">
        <InG i={0}>
          <LessonStop x={204} n={1} name={<tspan>{"大綱"}</tspan>} sub={<tspan>{"Codex 照原文寫"}</tspan>} today>
            <DocShape x={134} y={72} w={140} h={166} />
            <rect x="156" y="104" width="92" height="8" fill={rule} />
            <rect x="156" y="126" width="80" height="8" fill={rule} />
            <rect x="148" y="160" width="112" height="38" rx="4" fill={linkSoft} />
            <text x="204" y="188" textAnchor="middle" fontSize="24" fill={link}>[[劉備]]</text>
          </LessonStop>
        </InG>
        <InG i={1}><MapArrow x1={360} x2={456} y={155} /></InG>
        <InG i={2}>
          <LessonStop x={612} n={2} name={<tspan>{"筆記庫"}</tspan>} sub={<tspan>{"Obsidian 連起來"}</tspan>}>
            <g stroke={link} strokeWidth="3"><line x1="542" y1="110" x2="682" y2="120" /><line x1="542" y1="110" x2="602" y2="205" /><line x1="682" y1="120" x2="602" y2="205" /><line x1="682" y1="120" x2="692" y2="200" /></g>
            <circle cx="542" cy="110" r="24" fill={linkSoft} stroke={link} strokeWidth="3" />
            <circle cx="682" cy="120" r="24" fill={linkSoft} stroke={link} strokeWidth="3" />
            <circle cx="602" cy="205" r="24" fill={linkSoft} stroke={link} strokeWidth="3" />
            <circle cx="692" cy="200" r="16" fill="#FFFFFF" stroke={faint} strokeWidth="3" strokeDasharray="5 5" />
          </LessonStop>
        </InG>
        <InG i={3}><MapArrow x1={768} x2={864} y={155} /></InG>
        <InG i={4}>
          <LessonStop x={1020} n={3} name={<tspan>{"時間軸"}</tspan>} sub={<tspan>{"Skill 幫忙排"}</tspan>}>
            <line x1="910" y1="155" x2="1130" y2="155" stroke={ink} strokeWidth="4" />
            <circle cx="920" cy="155" r="13" fill={amber} />
            <circle cx="990" cy="155" r="13" fill={amber} />
            <circle cx="1060" cy="155" r="13" fill={amber} />
            <circle cx="1120" cy="155" r="13" fill={amber} />
            <rect x="900" y="88" width="80" height="34" rx="4" fill={surface} stroke={rule} />
            <rect x="1040" y="188" width="80" height="34" rx="4" fill={surface} stroke={rule} />
          </LessonStop>
        </InG>
        <InG i={5}><MapArrow x1={1176} x2={1272} y={155} /></InG>
        <InG i={6}>
          <LessonStop x={1428} n={4} name={<tspan>{"網站"}</tspan>} sub={<tspan>{"發布給別人看"}</tspan>}>
            <rect x="1318" y="78" width="220" height="154" rx="6" fill="#FFFFFF" stroke={ink} strokeWidth="2" />
            <line x1="1318" y1="106" x2="1538" y2="106" stroke={ink} strokeWidth="2" />
            <circle cx="1336" cy="92" r="5" fill={faint} /><circle cx="1352" cy="92" r="5" fill={faint} /><circle cx="1368" cy="92" r="5" fill={faint} />
            <rect x="1340" y="126" width="120" height="12" fill={rule} />
            <rect x="1340" y="152" width="170" height="10" fill={rule} />
            <rect x="1340" y="174" width="150" height="10" fill={rule} />
            <rect x="1340" y="196" width="90" height="10" fill={linkSoft} />
          </LessonStop>
        </InG>
        <PopG i={8}><circle cx="334" cy="46" r="38" fill={amber} /><text x="334" y="55" textAnchor="middle" fontSize="26" fontWeight="600" fill="#FFFFFF">今天</text></PopG>
      </Figure>
    </Fit>
  </Shell>
);

// A table-of-contents row: chapter, the thing you walk away with, time and page.
const AGENDA_COLS = '90px 1fr 600px 180px';

const AgendaRow = ({ i, n, numberLabel, name, kind, result, time, page }: { i: number; n: Chapter; numberLabel: ReactNode; name: ReactNode; kind: IconKind; result: ReactNode; time: ReactNode; page: Page }) => (
  <In i={i} style={{ display: 'grid', gridTemplateColumns: AGENDA_COLS, alignItems: 'center', minHeight: 104, borderBottom: `1px solid ${rule}` }}>
    <span style={{ fontFamily: display, fontSize: 40, color: amber }}>{numberLabel}</span>
    <span style={{ fontSize: 38, fontWeight: 600 }}>{name}</span>
    <span style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
      <Icon kind={kind} size={52} color={amber} />
      <span style={{ fontSize: 30 }}>{result}</span>
    </span>
    <span style={{ textAlign: 'right' }}><span style={{ display: 'block', fontSize: 26, color: amber }}>{time}</span><span style={{ display: 'block', fontSize: 24, color: quiet, marginTop: 4 }}><span>第 </span>{pageOf(page)}<span> 頁</span></span></span>
  </In>
);

const Agenda: Page = () => (
  <Shell>
    <Eyebrow><span>AGENDA｜120 分鐘｜練習 1 課後自己練</span></Eyebrow>
    <Heading><span>今天的五章</span></Heading>
    <Fit>
      <div style={{ display: 'grid', gridTemplateColumns: AGENDA_COLS, paddingBottom: 12, borderBottom: `1px solid ${rule}` }}>
        <span /><SmallLabel><span>章節</span></SmallLabel><SmallLabel><span>結束時你會</span></SmallLabel><span style={{ textAlign: 'right' }}><SmallLabel><span>時間｜頁</span></SmallLabel></span>
      </div>
      <AgendaRow i={0} n={1} numberLabel={<span>01</span>} name={<span>{"AI 怎麼走到今天"}</span>} kind="think" result={<span>{"知道 AI 為什麼會說錯"}</span>} time={<span>{"10–40 分"}</span>} page={Section1} />
      <AgendaRow i={1} n={2} numberLabel={<span>02</span>} name={<span>{"ChatGPT 與 Codex"}</span>} kind="search" result={<span>{"分得清 ChatGPT 和 Codex"}</span>} time={<span>{"40–50 分"}</span>} page={Section2} />
      <AgendaRow i={2} n={3} numberLabel={<span>03</span>} name={<span>{"安裝 Codex"}</span>} kind="down" result={<span>{"電腦裡有 Codex"}</span>} time={<span>{"50–67 分"}</span>} page={Section3} />
      <AgendaRow i={3} n={4} numberLabel={<span>04</span>} name={<span>{"看懂 Codex"}</span>} kind="terminal" result={<span>{"會看 /status、寫規則"}</span>} time={<span>{"67–84 分"}</span>} page={Section4} />
      <AgendaRow i={4} n={5} numberLabel={<span>05</span>} name={<span>{'使用 Codex'}<br />{''}</span>} kind="doc" result={<span>{'建立自己的知識庫'}</span>} time={<span>{"84–108 分"}</span>} page={Section5} />
    </Fit>
  </Shell>
);

// ---------- Chapter pages ----------

const TRACK_XS = [90, 453, 816, 1179, 1542];

const TrackStop = ({ x, n, name, chapter }: { x: number; n: Chapter; name: ReactNode; chapter: Chapter }) => {
  const now = n === chapter;
  const done = n < chapter;
  return (
    <g>
      {now ? <PopG i={4}><circle cx={x} cy="50" r="34" fill={amber} /><text x={x} y="60" textAnchor="middle" fontSize="28" fontWeight="600" fill="#FFFFFF">{n}</text></PopG>
        : <g><circle cx={x} cy="50" r="22" fill={done ? faint : '#FFFFFF'} stroke={done ? faint : rule} strokeWidth="3" /><text x={x} y="59" textAnchor="middle" fontSize="24" fontWeight="600" fill={done ? '#FFFFFF' : quiet}>{n}</text></g>}
      <text x={x} y="130" textAnchor="middle" fontSize="28" fontWeight={now ? 600 : 400} fill={now ? amber : quiet}>{name}</text>
    </g>
  );
};

const ChapterTrack = ({ chapter }: { chapter: Chapter }) => {
  const cur = TRACK_XS[chapter - 1];
  return (
    <Figure h={170} label={`今天的五章，現在在第 ${chapter} 章：${CHAPTERS[chapter - 1]}`}>
      <line x1={TRACK_XS[0]} y1="50" x2={TRACK_XS[4]} y2="50" stroke={rule} strokeWidth="4" />
      {chapter > 1 ? <g stroke={amber} strokeWidth="5" fill="none"><DrawPath i={1} d={`M${TRACK_XS[0]} 50 H${cur}`} /></g> : null}
      <TrackStop x={TRACK_XS[0]} n={1} name={<tspan>{"AI 怎麼走到今天"}</tspan>} chapter={chapter} />
      <TrackStop x={TRACK_XS[1]} n={2} name={<tspan>{"ChatGPT 與 Codex"}</tspan>} chapter={chapter} />
      <TrackStop x={TRACK_XS[2]} n={3} name={<tspan>{"安裝 Codex"}</tspan>} chapter={chapter} />
      <TrackStop x={TRACK_XS[3]} n={4} name={<tspan>{"看懂 Codex"}</tspan>} chapter={chapter} />
      <TrackStop x={TRACK_XS[4]} n={5} name={<tspan>{"用 Codex 寫大綱"}</tspan>} chapter={chapter} />
    </Figure>
  );
};

const SectionPage = ({ chapter, title, label, lead }: { chapter: Chapter; title: ReactNode; label: ReactNode; lead: string }) => (
  <Shell top={192} chapter={chapter} enterChapter>
    <In i={0}><div style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', fontSize: 24, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#78716C' }}>{label}</div></In>
    <In i={1} style={{ marginTop: 63 }}><h1 style={{ fontFamily: '"Libre Baskerville", Georgia, "Times New Roman", serif', fontSize: 132, fontWeight: 400, lineHeight: 1.17, letterSpacing: '-0.035em', maxWidth: 1500, margin: 0, color: ink, whiteSpace: 'pre-line' }}>{title}</h1></In>
    <In i={2} style={{ fontSize: 36, lineHeight: 1.5, color: muted, marginTop: 30, maxWidth: 1500 }}><span>{lead}</span></In>
    <div style={{ marginTop: 96 }}><ChapterTrack chapter={chapter} /></div>
  </Shell>
);

// ---------- 01 AI 怎麼走到今天（以 GPT 為例） ----------

const Section1: Page = () => (
  <Shell top={192} chapter={1} enterChapter>
    <In i={0}><Eyebrow><span>01 / GPT</span></Eyebrow></In>
    <In i={1} style={{ marginTop: 63 }}><Title><span>AI 怎麼走到今天？</span></Title></In>
    <In i={2} style={{ fontSize: 36, lineHeight: 1.5, color: muted, marginTop: 30, maxWidth: 1500 }}><span>
      以 GPT 為例：它怎麼寫字、為什麼會錯、有哪些補救
    </span></In>
    <div style={{ marginTop: 96 }}><ChapterTrack chapter={1} /></div>
  </Shell>
);

// One stop on the overview: a circle with an icon, a name, and a short note under it.
const MapNode = ({ x, y, kind, label, sub, tone, r = 56 }: { x: number; y: number; kind: IconKind; label: ReactNode; sub: string; tone: 'plain' | 'warn' | 'blue' | 'amber'; r?: number }) => {
  const stroke = tone === 'amber' ? amber : tone === 'blue' ? blue : tone === 'warn' ? warn : faint;
  const fill = tone === 'amber' ? amberSoft : tone === 'blue' ? blueSoft : tone === 'warn' ? warnSoft : '#FFFFFF';
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill={fill} stroke={stroke} strokeWidth="3" />
      <SvgIcon kind={kind} x={x} y={y} size={r * 1.05} color={tone === 'plain' ? ink : stroke} />
      <text x={x} y={y + r + 40} textAnchor="middle" fontSize="31" fontWeight="600" fill={ink}>{label}</text>
      {sub ? <text x={x} y={y + r + 78} textAnchor="middle" fontSize="26" fill={muted}>{sub}</text> : null}
    </g>
  );
};

const Evolution: Page = () => (
  <Shell chapter={1} source={<span>{'Vaswani et al. 2017（Transformer）；Brown et al. 2020（GPT-3）；Ouyang et al. 2022（InstructGPT）'}</span>}>
    <Eyebrow><span>先看全貌｜本章地圖</span></Eyebrow>
    <Heading><span>大型語言模型（LLM）的限制與補救</span></Heading>
    <Fit>
      <Stage h={500}>
        <Steps>
          <Layer h={500} label="模型的限制：猜下一個字，所以有隨機性，也會幻覺">
            <InG i={0}>
              <rect x="0" y="0" width="1632" height="210" fill={warnSoft} opacity="0.45" />
              <text x="28" y="48" fontSize="28" fontWeight="600" fill={warn}>模型的限制</text>
            </InG>
            <InG i={1}><MapNode x={420} y={88} kind="chat" label={<tspan>{"猜下一個字"}</tspan>} sub="" tone="plain" /></InG>
            <InG i={2}><MapArrow x1={484} x2={666} y={88} /><text x="575" y="70" textAnchor="middle" fontSize="25" fontWeight="600" fill={amber}>所以</text><MapNode x={730} y={88} kind="dice" label={<tspan>{"隨機性"}</tspan>} sub="" tone="warn" /></InG>
            <InG i={3}><MapArrow x1={794} x2={976} y={88} /><text x="885" y="70" textAnchor="middle" fontSize="25" fontWeight="600" fill={amber}>也會</text><MapNode x={1040} y={88} kind="alert" label={<tspan>{"幻覺"}</tspan>} sub="" tone="warn" /></InG>
          </Layer>
          <Step duration={STEP_MS}><Layer h={500} label="補救方法：Thinking 也就是 CoT 列步驟、用工具像計算機、Web Search 查資料">
            <rect x="0" y="250" width="1632" height="250" fill={blueSoft} opacity="0.5" />
            <text x="28" y="296" fontSize="28" fontWeight="600" fill={blue}>補救方法</text>
            <g className="aw1-build" style={buildDelay(0)}><MapNode x={420} y={340} kind="think" label={<tspan>{"Thinking"}</tspan>} sub="CoT 列步驟" tone="blue" /></g>
            <g className="aw1-build" style={buildDelay(1)}><MapNode x={730} y={340} kind="calc" label={<tspan>{"用工具"}</tspan>} sub="Tool Calling" tone="blue" /></g>
            <g className="aw1-build" style={buildDelay(2)}><MapNode x={1040} y={340} kind="search" label={<tspan>{"Web Search"}</tspan>} sub="查資料 RAG" tone="blue" /></g>
          </Layer></Step>
          <Step duration={STEP_MS}><Layer h={500} label="Agent：把工具串起來做事">
            <g fill="none" stroke={amber} strokeWidth="3"><StepPath d="M730 278 V266 H1040 V278" /></g>
            <g fill="none" stroke={amber} strokeWidth="4"><StepPath d="M885 266 C885 236 1360 236 1390 274" i={1} /></g>
            <text x="1160" y="230" textAnchor="middle" fontSize="25" fontWeight="600" fill={amber}>串起來</text>
            <g className="aw1-build" style={buildDelay(2)}><MapNode x={1400} y={340} kind="terminal" label={<tspan>{"Agent"}</tspan>} sub="把工具串起來做事" tone="amber" r={62} /></g>
          </Layer></Step>
        </Steps>
      </Stage>
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={28}><span>三個限制，三種補救</span></Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

const WordTile = ({ children, hot = false }: { children: ReactNode; hot?: boolean }) => (
  <div style={{ width: 300, height: 260, boxSizing: 'border-box', display: 'grid', placeItems: 'center', fontFamily: display, fontSize: 112, background: hot ? amber : '#FFFFFF', color: hot ? '#FFFFFF' : ink, border: `3px solid ${hot ? amber : rule}` }}>{children}</div>
);

const NextWordGame: Page = () => (
  <Shell chapter={1} source={<span>{'Radford et al. 2018, Improving Language Understanding by Generative Pre-Training（GPT-1, OpenAI）'}</span>}>
    <Eyebrow><span>GPT＝生成式預訓練模型</span></Eyebrow>
    <Heading><span>下一個 Token 預測（Next-Token Prediction）</span></Heading>
    <Lead><span>看前面的字，接下一個最順的字</span></Lead>
    <Fit z={1.1}>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: 36 }}>
        <In i={0}>
          <SmallLabel><span>前面的字</span></SmallLabel>
          <div style={{ display: 'flex', gap: 20, marginTop: 16 }}>
            <WordTile><span>今天</span></WordTile>
            <WordTile><span>天氣</span></WordTile>
            <WordTile><span>很</span></WordTile>
          </div>
        </In>
        <In i={1} style={{ fontSize: 100, color: faint, lineHeight: 1, paddingBottom: 80 }}><span>→</span></In>
        <In i={2}>
          <SmallLabel color={amber}><span>下一個字</span></SmallLabel>
          <div style={{ position: 'relative', width: 300, height: 260, marginTop: 16 }}>
            <Steps>
              <div style={{ width: 300, height: 260, boxSizing: 'border-box', border: `4px dashed ${amber}`, display: 'grid', placeItems: 'center', fontFamily: display, fontSize: 124, color: amber }}>?</div>
              <Step duration={STEP_MS}><div style={{ position: 'absolute', inset: 0 }}><WordTile hot><span>好</span></WordTile></div></Step>
            </Steps>
          </div>
        </In>
      </div>
      <div className="aw1-token-note" data-ref-page={pageOf(OneByOne)} style={{ textAlign: 'center', fontSize: 25, color: quiet, marginTop: 28 }}>以「字」示意，模型實際切的單位叫 Token</div>
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={44}><span>GPT 根據前面的內容，預測下一個 Token</span></Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

const NextWord = ({ word, pct, top = false, order = 0 }: { word: ReactNode; pct: number; top?: boolean; order?: number }) => (
  <div style={{ display: 'grid', gridTemplateColumns: '170px 1fr 130px', alignItems: 'center', gap: 24 }}>
    <span style={{ fontSize: 52, fontWeight: top ? 600 : 400, color: top ? 'var(--osd-text)' : muted }}>{word}</span>
    <div style={{ height: 58, background: surface }}><div className="aw1-bar" style={{ ...buildDelay(order), width: `${pct}%`, height: '100%', background: top ? amber : rule }} /></div>
    <span style={{ fontSize: 38, color: top ? amber : quiet, textAlign: 'right' }}>{pct}<span>%</span></span>
  </div>
);

const ProbTable: Page = () => (
  <Shell chapter={1} source={<span>{'Brown et al. 2020, Language Models are Few-Shot Learners, arXiv:2005.14165（表中機率為示意）'}</span>}>
    <Eyebrow><span>接龍的根據</span></Eyebrow>
    <Heading><span>下一個 Token 的機率分布</span></Heading>
    <Lead><span>模型根據前文，估計每個候選 Token 出現的機率</span></Lead>
    <Fit>
      <div style={{ display: 'grid', gridTemplateColumns: '680px 1fr', columnGap: 88, alignItems: 'center' }}>
        <In i={0} style={{ background: surface, borderTop: `4px solid ${rule}`, padding: '60px 48px' }}>
          <SmallLabel><span>已經寫出的文字</span></SmallLabel>
          <div style={{ fontFamily: display, fontSize: 86, marginTop: 34, lineHeight: 1.3, whiteSpace: 'nowrap' }}><span>今天天氣很</span><span style={{ display: 'inline-block', width: 110, borderBottom: `6px solid ${amber}`, marginLeft: 12 }}>&nbsp;</span></div>
        </In>
        <div>
          <Steps>
            <Step duration={STEP_MS}>
              <div style={{ display: 'grid', gap: 32 }}>
                <SmallLabel><span>下一個字的機率（示意）</span></SmallLabel>
                <NextWord word={<span>{"好"}</span>} pct={58} top order={0} />
                <NextWord word={<span>{"熱"}</span>} pct={22} order={1} />
                <NextWord word={<span>{"冷"}</span>} pct={11} order={2} />
                <NextWord word={<span>{"不錯"}</span>} pct={9} order={3} />
              </div>
            </Step>
          </Steps>
        </div>
      </div>
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={44}><span>機率最高的字，最常被挑中</span></Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

const Tok = ({ children, hot = false }: { children: ReactNode; hot?: boolean }) => (
  <span style={{ display: 'inline-grid', placeItems: 'center', minWidth: 150, height: 104, padding: '0 22px', boxSizing: 'border-box', fontSize: 54, fontFamily: display, background: hot ? amberSoft : '#FFFFFF', border: `3px solid ${hot ? amber : rule}`, color: ink }}>{children}</span>
);

const TokRow = ({ n, children }: { n: ReactNode; children: ReactNode }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
    <span style={{ width: 150, fontSize: 30, color: quiet }}><span>第 </span>{n}<span> 輪</span></span>
    {children}
  </div>
);

const OneByOne: Page = () => (
  <Shell chapter={1} source={<span>{'Brown et al. 2020, arXiv:2005.14165（自迴歸）；Sennrich et al. 2016, arXiv:1508.07909（Token）'}</span>}>
    <Eyebrow><span>一次只接一格</span></Eyebrow>
    <Heading><span>自迴歸生成（Autoregressive Generation）</span></Heading>
    <Fit>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 480px', gap: 48, alignItems: 'center' }}>
        <div style={{ display: 'grid', gap: 28 }}>
          <Steps>
            <TokRow n={<span>{1}</span>}><Tok><span>今天</span></Tok><Tok hot><span>天氣</span></Tok></TokRow>
            <Step duration={STEP_MS}><TokRow n={<span>{2}</span>}><Tok><span>今天</span></Tok><Tok><span>天氣</span></Tok><Tok hot><span>很</span></Tok></TokRow></Step>
            <Step duration={STEP_MS}><TokRow n={<span>{3}</span>}><Tok><span>今天</span></Tok><Tok><span>天氣</span></Tok><Tok><span>很</span></Tok><Tok hot><span>好</span></Tok></TokRow></Step>
            <Step duration={STEP_MS}><TokRow n={<span>{4}</span>}><Tok><span>今天</span></Tok><Tok><span>天氣</span></Tok><Tok><span>很</span></Tok><Tok><span>好</span></Tok><Tok hot><span>。</span></Tok></TokRow></Step>
          </Steps>
        </div>
        <div>
          <Steps>
            <Step duration={STEP_MS}>
              <div style={{ background: blueSoft, borderLeft: `6px solid ${blue}`, padding: '30px 34px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}><Tok hot><span>很</span></Tok><span style={{ fontSize: 40, color: blue, fontWeight: 600 }}>＝1 個 Token</span></div>
                <div style={{ fontSize: 32, color: muted, marginTop: 20, lineHeight: 1.5 }}>AI 讀寫文字的單位（示意）</div>
              </div>
            </Step>
          </Steps>
        </div>
      </div>
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={64}><span>一次產生一個 Token，再接回前文繼續產生</span></Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

// A chat window drawn as a picture (示意). The answer is revealed on click.
const ChatWin = ({ label, ask, regen = false, children }: { label: ReactNode; ask: ReactNode; regen?: boolean; children: ReactNode }) => (
  <div style={{ width: 760, background: '#FFFFFF', border: `1px solid ${rule}`, boxShadow: '0 10px 30px rgba(28,25,23,0.08)' }}>
    <div style={{ height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 28px', background: surface, borderBottom: `1px solid ${rule}`, fontSize: 27, color: muted }}>
      <span style={{ fontWeight: 600 }}>{label}</span>
      {regen ? <span style={{ display: 'flex', alignItems: 'center', gap: 8, color: amber, fontWeight: 600 }}><Icon kind="redo" size={34} color={amber} /><span>重新產生</span></span> : null}
    </div>
    <div style={{ padding: '30px 32px 36px', minHeight: 330, boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}><span style={{ background: amberSoft, borderRadius: 30, padding: '12px 28px', fontSize: 32 }}>{ask}</span></div>
      <div style={{ marginTop: 40 }}>{children}</div>
    </div>
  </div>
);

const ChatAnswer = ({ children }: { children: ReactNode }) => (
  <div style={{ display: 'flex', gap: 18, alignItems: 'flex-start', fontSize: 36, lineHeight: 1.5 }}>
    <Icon kind="chat" size={48} color={muted} />
    <span>{children}</span>
  </div>
);

const SameQuestion: Page = () => (
  <Shell chapter={1} source={<span>{'Holtzman et al. 2020, The Curious Case of Neural Text Degeneration, arXiv:1904.09751'}</span>}>
    <Eyebrow><span>隨機性｜現場示範</span></Eyebrow>
    <Heading><span>隨機取樣（Sampling）</span></Heading>
    <Lead><span>同一段前文可能抽到不同 Token，後續答案也跟著改變</span></Lead>
    <Fit>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 56 }}>
        <In i={0}>
          <ChatWin label={<span>{"第 1 次"}</span>} ask={<span>{"用一句話介紹劉備"}</span>}>
            <Steps><Step duration={STEP_MS}><ChatAnswer><span>劉備是蜀漢的開國皇帝，以仁德聞名。</span></ChatAnswer></Step></Steps>
          </ChatWin>
        </In>
        <In i={1}>
          <ChatWin label={<span>{"第 2 次"}</span>} ask={<span>{"用一句話介紹劉備"}</span>} regen>
            <Steps><Step duration={STEP_MS}><ChatAnswer><span>劉備字玄德，和關羽、張飛在桃園結拜。</span></ChatAnswer></Step></Steps>
          </ChatWin>
        </In>
      </div>
      <Caption><span>{'\n'}</span></Caption>
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={40}><span>答案不同，是因為每次抽到的字不一樣</span></Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

const SliceLabel = ({ x, y, word, pct, color = ink, size = 34 }: { x: number; y: number; word: ReactNode; pct: ReactNode; color?: string; size?: number }) => (
  <g>
    <text x={x} y={y} textAnchor="middle" fontSize={size} fontWeight="600" fill={color}>{word}</text>
    <text x={x} y={y + 32} textAnchor="middle" fontSize="24" fill={color}>{pct}</text>
  </g>
);

const Randomness: Page = () => (
  <Shell chapter={1} source={<span>{'Holtzman et al. 2020, The Curious Case of Neural Text Degeneration（取樣與溫度）, arXiv:1904.09751'}</span>}>
    <Eyebrow><span>隨機性｜Temperature</span></Eyebrow>
    <Heading><span>溫度參數（Temperature）</span></Heading>
    <Lead><span>Temperature 高，隨機性高；Temperature 低，隨機性低</span></Lead>
    <Fit>
      <Stage h={520}>
        <Steps>
          <Layer h={520} label="轉盤：好 58%、熱 22%、冷 11%、不錯 9%">
            <InG i={0}>
              <path d="M380 260 L380 60 A200 200 0 1 1 283.6 435.3 Z" fill={amberSoft} stroke="#FFFFFF" strokeWidth="4" />
              <path d="M380 260 L283.6 435.3 A200 200 0 0 1 189.8 198.2 Z" fill={blueSoft} stroke="#FFFFFF" strokeWidth="4" />
              <path d="M380 260 L189.8 198.2 A200 200 0 0 1 272.8 91.1 Z" fill={sage} stroke="#FFFFFF" strokeWidth="4" />
              <path d="M380 260 L272.8 91.1 A200 200 0 0 1 380 60 Z" fill={raised} stroke="#FFFFFF" strokeWidth="4" />
              <SliceLabel x={500} y={290} word={<tspan>{"好"}</tspan>} pct={<tspan>{"58%"}</tspan>} color={amber} size={44} />
              <SliceLabel x={252} y={262} word={<tspan>{"熱"}</tspan>} pct={<tspan>{"22%"}</tspan>} color={blue} />
              <SliceLabel x={290} y={176} word={<tspan>{"冷"}</tspan>} pct={<tspan>{"11%"}</tspan>} color={okGreen} />
              <text x="338" y="128" textAnchor="middle" fontSize="24" fill={muted}>不錯</text>
              <polygon points="380,48 364,20 396,20" fill={ink} />
              <text x="380" y="510" textAnchor="middle" fontSize="26" fill={quiet}>今天天氣很＿（示意）</text>
            </InG>
          </Layer>
          <Step duration={STEP_MS}><Layer h={520} label="這一次轉到「熱」">
            <g stroke={ink} strokeWidth="7" strokeLinecap="round" fill="none"><StepPath d="M380 260 L250 369" /></g>
            <circle cx="380" cy="260" r="16" fill={ink} />
            <g className="aw1-build" style={buildDelay(2)}>
              <rect x="600" y="300" width="260" height="96" fill="#FFFFFF" stroke={blue} strokeWidth="3" />
              <text x="730" y="342" textAnchor="middle" fontSize="26" fill={muted}>這次接了</text>
              <text x="730" y="382" textAnchor="middle" fontSize="34" fontWeight="600" fill={blue}>「熱」</text>
            </g>
          </Layer></Step>
          <Step duration={STEP_MS}><Layer h={520} label="溫度旋鈕：低就穩定，高就多變">
            <text x="1220" y="60" textAnchor="middle" fontSize="32" fontWeight="600" fill={ink}>溫度（Temperature）</text>
            <path d="M1020 330 A200 200 0 0 1 1220 130" fill="none" stroke={sage} strokeWidth="40" />
            <path d="M1220 130 A200 200 0 0 1 1420 330" fill="none" stroke={amberSoft} strokeWidth="40" />
            <g stroke={ink} strokeWidth="7" strokeLinecap="round" fill="none"><StepPath d="M1220 330 L1340 210" i={1} /></g>
            <circle cx="1220" cy="330" r="16" fill={ink} />
            <text x="1010" y="384" textAnchor="middle" fontSize="32" fontWeight="600" fill={okGreen}>低</text>
            <text x="1430" y="384" textAnchor="middle" fontSize="32" fontWeight="600" fill={amber}>高</text>
            <text x="1220" y="440" textAnchor="middle" fontSize="28" fill={ink}>低：常挑同一個字，比較穩</text>
            <text x="1220" y="484" textAnchor="middle" fontSize="28" fill={ink}>高：常換說法，比較多變</text>
          </Layer></Step>
        </Steps>
      </Stage>
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={16}><span>會變，不代表錯；但有時會變成錯的</span></Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

// grow: the bar fills as the page settles in (for a meter shown before any click).
const Meter = ({ label, value, pct, tone, empty = false, grow = false }: { label: ReactNode; value: ReactNode; pct: number; tone: string; empty?: boolean; grow?: boolean }) => {
  const live = useIsActivePage();
  const fill = grow && live;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr 220px', alignItems: 'center', gap: 28 }}>
      <span style={{ fontSize: 42, fontWeight: 600 }}>{label}</span>
      <div style={{ height: 70, background: empty ? '#FFFFFF' : surface, border: empty ? `3px dashed ${faint}` : 'none', boxSizing: 'border-box' }}>
        {pct > 0 ? <div className={fill ? 'aw1-fill' : 'aw1-bar'} style={{ width: `${pct}%`, height: '100%', background: tone, animationDelay: fill ? '420ms' : undefined, animationDuration: fill ? `${BAR_MS}ms` : undefined }} /> : null}
      </div>
      <span style={{ fontSize: 38, color: tone, fontWeight: 600 }}>{value}</span>
    </div>
  );
};

const WhatIsHallucination: Page = () => (
  <Shell chapter={1} source={<span>{'Ji et al. 2023, Survey of Hallucination in Natural Language Generation, arXiv:2202.03629'}</span>}>
    <Eyebrow><span>猜出來的字，可能是錯的</span></Eyebrow>
    <Heading><span>AI 幻覺（Hallucination）</span></Heading>
    <Lead><span>像考試硬掰：寫得很順，其實沒讀過</span></Lead>
    <Fit>
      <In i={0} style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 56 }}>
        <Icon kind="chat" size={64} color={muted} />
        <div style={{ position: 'relative', background: '#FFFFFF', border: `2px solid ${rule}`, borderRadius: 16, padding: '24px 40px', fontSize: 44 }}><span>問：劉備字什麼？　答：</span><strong>劉備，字孔明。</strong></div>
        <span style={{ fontSize: 24, color: quiet }}><span>小模型 qwen3:1.7b</span><br /><span>講師實測</span></span>
      </In>
      <div style={{ display: 'grid', gap: 40 }}>
        <Steps>
          <In i={1}><Meter label={<span>{"語氣"}</span>} value={<span>{"很肯定"}</span>} pct={96} tone={amber} grow /></In>
          <Step duration={STEP_MS}>
            <Meter label={<span>{"事實"}</span>} value={<span>{"對不上"}</span>} pct={0} tone={warn} empty />
            <div style={{ marginTop: 16, marginLeft: 178, fontSize: 30, color: warn }}><span>原文第 1 回：「姓劉，名備，字</span><strong>玄德</strong><span>」；孔明是諸葛亮</span></div>
          </Step>
        </Steps>
      </div>
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={64}><span>內容和事實對不上，語氣卻很肯定，就叫幻覺</span></Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

const RealHallucination: Page = () => (
  <Shell chapter={1} source={<span>{'圖片：IT 邦幫忙 ithelp.ithome.com.tw/articles/10315994'}</span>}>
    <Eyebrow><span>早期 GPT-3.5｜真實案例</span></Eyebrow>
    <Heading><span>幻覺實例：GPT-3.5 的長加法</span></Heading>
    <Fit>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 520px', gap: 64, alignItems: 'center' }}>
        <div style={{ display: 'grid', rowGap: 26 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '170px 1fr', alignItems: 'center' }}>
            <SmallLabel><span>題目</span></SmallLabel>
            <In i={0} style={{ fontFamily: mono, fontSize: 36 }}><span>2+4+7+9+23+1+5+7+2+5</span><br /><span>+74+2+7953+34+356</span></In>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '170px 1fr', alignItems: 'center' }}>
            <SmallLabel><span>AI 答</span></SmallLabel>
            <In i={1} style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
              <span style={{ fontFamily: display, fontSize: 116, lineHeight: 1.05, color: muted }}>8402</span>
              <Steps><Step duration={STEP_MS}><svg viewBox="0 0 80 80" style={{ width: 80, height: 80, display: 'block' }} aria-label="錯"><g className="aw1-steppop" style={buildDelay(0, 60)}><NoDot x={40} y={40} r={36} /></g></svg></Step></Steps>
            </In>
          </div>
          <Steps>
            <Step duration={STEP_MS}>
              <div style={{ display: 'grid', gridTemplateColumns: '170px 1fr', alignItems: 'center' }}>
                <SmallLabel color={amber}><span>驗算</span></SmallLabel>
                <span style={{ fontFamily: display, fontSize: 116, lineHeight: 1.05, color: amber }}>8484</span>
              </div>
            </Step>
          </Steps>
        </div>
        <In i={2}>
          <div style={{ border: `1px solid ${rule}`, background: '#FFFFFF', padding: 12 }}>
            <img src={wrongSum} alt="早期 ChatGPT（GPT-3.5）把一長串加法算成 8402" style={{ display: 'block', width: 494, height: 204 }} />
          </div>
          <Caption><span>實際畫面｜早期 GPT-3.5｜圖片來源：IT 邦幫忙</span></Caption>
        </In>
      </div>
      <Steps><Step duration={STEP_MS}><Takeaway><span>它沒有算，只猜了一個像答案的數字</span></Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

// One station of the "how an answer comes out" pipeline.
const PipeBox = ({ x, label, hot = false, children }: { x: number; label: ReactNode; hot?: boolean; children: ReactNode }) => (
  <g>
    <rect x={x - 120} y={70} width={240} height={220} fill={hot ? amberSoft : '#FFFFFF'} stroke={hot ? amber : rule} strokeWidth={hot ? 3 : 2} />
    {children}
    <text x={x} y={346} textAnchor="middle" fontSize="32" fontWeight="600" fill={ink}>{label}</text>
  </g>
);

const WhyHallucinate: Page = () => (
  <Shell chapter={1} source={<span>{'Kalai et al. 2025, Why Language Models Hallucinate, arXiv:2509.04664'}</span>}>
    <Eyebrow><span>幻覺從哪裡來</span></Eyebrow>
    <Heading><span>幻覺的成因：從資料到回答</span></Heading>
    <Lead><span>像聽人轉述：大家都這樣說，就照說</span></Lead>
    <Fit>
      <Stage h={440}>
        <Steps>
          <Layer h={440} label="讀過的大量文字，變成一張機率表">
            <InG i={0}>
              <PipeBox x={140} label={<tspan>{"讀過的文字"}</tspan>}>
                <DocShape x={70} y={100} w={110} h={140} fill={surface} />
                <DocShape x={95} y={115} w={110} h={140} fill={surface} />
                <DocShape x={120} y={130} w={110} h={140} />
              </PipeBox>
            </InG>
            <InG i={1}><MapArrow x1={266} x2={344} y={180} /></InG>
            <InG i={2}>
              <PipeBox x={470} label={<tspan>{"機率表"}</tspan>}>
                <text x="372" y="146" fontSize="26" fontWeight="600" fill={amber}>好</text>
                <rect x="410" y="122" width="150" height="30" fill={amber} />
                <text x="372" y="192" fontSize="26" fill={muted}>熱</text>
                <rect x="410" y="168" width="64" height="30" fill={rule} />
                <text x="372" y="238" fontSize="26" fill={muted}>冷</text>
                <rect x="410" y="214" width="36" height="30" fill={rule} />
              </PipeBox>
            </InG>
          </Layer>
          <Step duration={STEP_MS}><Layer h={440} label="挑最常見的說法，直接說出口">
            <g className="aw1-build" style={buildDelay(0, 0)}><MapArrow x1={596} x2={674} y={180} hot /></g>
            <g className="aw1-build" style={buildDelay(1, 0)}>
              <PipeBox x={800} label={<tspan>{"挑最常見的"}</tspan>} hot>
                <text x="800" y="170" textAnchor="middle" fontSize="32" fontWeight="600" fill={amber}>最常見的</text>
                <text x="800" y="214" textAnchor="middle" fontSize="32" fontWeight="600" fill={amber}>說法</text>
              </PipeBox>
            </g>
            <g className="aw1-build" style={buildDelay(2, 0)}><MapArrow x1={926} x2={1334} y={180} hot /></g>
            <g className="aw1-build" style={buildDelay(3, 0)}>
              <PipeBox x={1460} label={<tspan>{"說出口"}</tspan>}>
                <Bubble x={1366} y={120} w={188} h={96} />
                <text x="1460" y="178" textAnchor="middle" fontSize="28" fill={ink}>很順的一句</text>
              </PipeBox>
            </g>
          </Layer></Step>
          <Step duration={STEP_MS}><Layer h={440} label="中間少了查證這一步">
            <rect x="1010" y="110" width="240" height="140" fill="#FFFFFF" stroke={warn} strokeWidth="3" strokeDasharray="12 9" />
            <text x="1130" y="172" textAnchor="middle" fontSize="34" fontWeight="600" fill={warn}>查證</text>
            <text x="1130" y="216" textAnchor="middle" fontSize="26" fill={warn}>跳過了</text>
            <g className="aw1-build" style={buildDelay(1)}><NoDot x={1240} y={110} r={26} /></g>
          </Layer></Step>
        </Steps>
      </Stage>
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={20}><span>所以要請它先想、用工具，或給它資料</span></Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

const QuestionCard = ({ children, right }: { children: ReactNode; right?: ReactNode }) => (
  <In i={0} style={{ display: 'flex', alignItems: 'center', gap: 20, background: '#FFFFFF', border: `1px solid ${rule}`, borderLeft: `6px solid ${amber}`, padding: '18px 30px', marginTop: 28 }}>
    <svg viewBox="0 0 48 48" style={{ width: 44, height: 44, flexShrink: 0 }} aria-hidden="true"><AskMark x={24} y={24} r={22} /></svg>
    <span style={{ fontSize: 34 }}>{children}</span>
    {right ? <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 18 }}>{right}</span> : null}
  </In>
);

const LegendKey = ({ color, children }: { color: string; children: ReactNode }) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 25, color, fontWeight: 600 }}>
    <span style={{ width: 22, height: 22, background: color, display: 'inline-block' }} /><span>{children}</span>
  </span>
);

const FlowBox = ({ x, y, w, label, tone = 'plain' }: { x: number; y: number; w: number; label: ReactNode; tone?: 'plain' | 'step' | 'ok' | 'bad' }) => {
  const fill = tone === 'step' ? blueSoft : tone === 'ok' ? sage : tone === 'bad' ? warnSoft : '#FFFFFF';
  const stroke = tone === 'step' ? blue : tone === 'ok' ? okGreen : tone === 'bad' ? warn : ink;
  return (
    <g>
      <rect x={x} y={y} width={w} height="76" rx="8" fill={fill} stroke={stroke} strokeWidth="2" strokeDasharray={tone === 'bad' ? '10 8' : undefined} />
      <text x={x + w / 2} y={y + 49} textAnchor="middle" fontSize="30" fontWeight="600" fill={tone === 'bad' ? warn : ink}>{label}</text>
    </g>
  );
};

const LinkRings = ({ x, y }: { x: number; y: number }) => (
  <g fill="none" stroke={blue} strokeWidth="4">
    <rect x={x - 22} y={y - 10} width="26" height="20" rx="10" />
    <rect x={x - 4} y={y - 10} width="26" height="20" rx="10" />
  </g>
);

const CotWhat: Page = () => (
  <Shell chapter={1} source={<span>{'Wei et al. 2022, Chain-of-Thought Prompting Elicits Reasoning in Large Language Models, arXiv:2201.11903'}</span>}>
    <Eyebrow><span>解法一｜Thinking 背後的做法</span></Eyebrow>
    <Heading><span>思維鏈（Chain of Thought, CoT）是什麼</span></Heading>
    <Lead><span>先寫過程，再寫答案</span></Lead>
    <QuestionCard><span>雞兔同籠：35 個頭、94 隻腳。直接答和先寫過程差在哪？</span></QuestionCard>
    <Fit>
      <Stage h={330}>
        <Steps>
          <Step duration={STEP_MS}><Layer h={330} label="直接寫答案：從題目一下子跳到答案，猜雞 20、兔 15（示意）">
            <text x="0" y="62" fontSize="30" fontWeight="600" fill={warn}>直接寫答案</text>
            <FlowBox x={230} y={20} w={150} label={<tspan>{"題目"}</tspan>} />
            <g fill="none" stroke={warn} strokeWidth="4" strokeDasharray="12 9"><path d="M384 50 C620 -30 960 -30 1196 50" /></g>
            <polygon points="1200,56 1182,46 1190,62" fill={warn} />
            <text x="790" y="40" textAnchor="middle" fontSize="27" fontWeight="600" fill={warn}>一下子猜出答案</text>
            <g className="aw1-build" style={buildDelay(2)}><FlowBox x={1206} y={20} w={300} label={<tspan>{"雞 20、兔 15？"}</tspan>} tone="bad" /></g>
            <text x="1520" y="66" fontSize="24" fill={quiet}>示意</text>
          </Layer></Step>
          <Step duration={STEP_MS}><Layer h={330} label="先寫過程：題目、題型、公式、套數字、計算、答案，一環扣一環">
            <text x="0" y="212" fontSize="30" fontWeight="600" fill={blue}>先寫過程</text>
            <g className="aw1-build" style={buildDelay(0)}><FlowBox x={230} y={170} w={150} label={<tspan>{"題目"}</tspan>} /></g>
            <g className="aw1-build" style={buildDelay(1)}><LinkRings x={404} y={208} /><FlowBox x={424} y={170} w={150} label={<tspan>{"題型"}</tspan>} tone="step" /></g>
            <g className="aw1-build" style={buildDelay(2)}><LinkRings x={598} y={208} /><FlowBox x={618} y={170} w={150} label={<tspan>{"公式"}</tspan>} tone="step" /></g>
            <g className="aw1-build" style={buildDelay(3)}><LinkRings x={792} y={208} /><FlowBox x={812} y={170} w={150} label={<tspan>{"套數字"}</tspan>} tone="step" /></g>
            <g className="aw1-build" style={buildDelay(4)}><LinkRings x={986} y={208} /><FlowBox x={1006} y={170} w={150} label={<tspan>{"計算"}</tspan>} tone="step" /></g>
            <g className="aw1-build" style={buildDelay(5)}>
              <MapArrow x1={1160} x2={1200} y={208} hot />
              <FlowBox x={1206} y={170} w={300} label={<tspan>{"答案"}</tspan>} tone="ok" />
            </g>
            <g className="aw1-build" style={buildDelay(7)}>
              <text x="230" y="306" fontSize="28" fill={muted}>思維（想）＋ 鏈（一環扣一環）＝ 一步接一步的推理過程</text>
            </g>
          </Layer></Step>
        </Steps>
      </Stage>
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={36}><span>CoT：讓模型回答前，先把推理步驟一步一步寫出來</span></Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

const StripTile = ({ x, y, w, label, tone = 'plain' }: { x: number; y: number; w: number; label: ReactNode; tone?: 'plain' | 'step' | 'ok' | 'bad' }) => {
  const fill = tone === 'step' ? blueSoft : tone === 'ok' ? sage : tone === 'bad' ? warnSoft : surface;
  const stroke = tone === 'step' ? blue : tone === 'ok' ? okGreen : tone === 'bad' ? warn : rule;
  return (
    <g>
      <rect x={x} y={y} width={w} height="68" fill={fill} stroke={stroke} strokeWidth="2" strokeDasharray={tone === 'bad' ? '9 7' : undefined} />
      <text x={x + w / 2} y={y + 45} textAnchor="middle" fontSize="28" fontFamily={mono} fontWeight={tone === 'plain' ? 400 : 600} fill={tone === 'bad' ? warn : ink}>{label}</text>
    </g>
  );
};

const WayChip = ({ n, children }: { n: ReactNode; children: ReactNode }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 14, background: '#FFFFFF', border: `1px solid ${rule}`, padding: '12px 20px', fontSize: 28 }}>
    <span style={{ flex: '0 0 auto', width: 42, height: 42, borderRadius: 42 / 2, background: amber, color: '#FFFFFF', display: 'grid', placeItems: 'center', fontSize: Math.round(42 * 0.57), fontWeight: 600 }}>{n}</span><span>{children}</span>
  </div>
);

const CotWhy: Page = () => (
  <Shell chapter={1} source={<span>{'Kojima et al. 2022, arXiv:2205.11916；Wei et al. 2022, arXiv:2201.11903'}</span>}>
    <Eyebrow><span>它不是只會猜下一個字嗎？寫步驟為什麼有用？</span></Eyebrow>
    <Heading><span>CoT 為什麼有效</span></Heading>
    <QuestionCard><span>一盒鉛筆 12 枝，買 3 盒，送掉 5 枝，還剩幾枝？</span></QuestionCard>
    <Fit>
      <Stage h={230}>
        <Steps>
          <Step duration={STEP_MS}><Layer h={230} label="沒寫步驟：前文只有題目，下一步就得猜出答案，例如猜 30（示意）">
            <text x="0" y="44" fontSize="28" fontWeight="600" fill={warn}>沒寫步驟</text>
            <StripTile x={180} y={0} w={330} label={<tspan>{"12枝 3盒 送5枝＝"}</tspan>} />
            <MapArrow x1={520} x2={1110} y={34} />
            <g className="aw1-build" style={buildDelay(1)}>
              <StripTile x={1120} y={0} w={190} label={<tspan>{"30？"}</tspan>} tone="bad" />
              <text x="1330" y="44" fontSize="27" fill={warn}>一步跳到答案（示意）</text>
            </g>
          </Layer></Step>
          <Step duration={STEP_MS}><Layer h={230} label="寫了步驟：12×3=36、36−5= 都變成前文，下一步只要接 31">
            <text x="0" y="194" fontSize="28" fontWeight="600" fill={blue}>寫了步驟</text>
            <StripTile x={180} y={150} w={330} label={<tspan>{"12枝 3盒 送5枝"}</tspan>} />
            <g className="aw1-build" style={buildDelay(0)}><StripTile x={520} y={150} w={230} label={<tspan>{"12×3=36"}</tspan>} tone="step" /></g>
            <g className="aw1-build" style={buildDelay(1)}><StripTile x={760} y={150} w={200} label={<tspan>{"36−5="}</tspan>} tone="step" /></g>
            <g className="aw1-build" style={buildDelay(2)}>
              <path d="M520 128 V116 H960 V128" fill="none" stroke={blue} strokeWidth="3" />
              <text x="740" y="104" textAnchor="middle" fontSize="27" fontWeight="600" fill={blue}>寫下來的步驟，也變成前文</text>
            </g>
            <g fill="none" stroke={amber} strokeWidth="4"><StepPath d="M970 184 H1100" i={4} /></g>
            <g className="aw1-build" style={buildDelay(5)}>
              <polygon points="1112,184 1096,175 1096,193" fill={amber} />
              <StripTile x={1120} y={150} w={190} label={<tspan>{"31 ✓"}</tspan>} tone="ok" />
              <text x="1330" y="194" fontSize="27" fill={okGreen}>小小一步，好猜</text>
            </g>
          </Layer></Step>
        </Steps>
      </Stage>
      <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginTop: 34 }}>
        <Steps>
          <Step duration={STEP_MS}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
              <SmallLabel><span>讓它寫步驟的三種方法</span></SmallLabel>
              <div className="aw1-build" style={buildDelay(0)}><WayChip n={<span>{1}</span>}><span>提示詞加「請一步一步想」</span></WayChip></div>
              <div className="aw1-build" style={buildDelay(1)}><WayChip n={<span>{2}</span>}><span>給一題有步驟的範例</span></WayChip></div>
              <div className="aw1-build" style={buildDelay(2)}><WayChip n={<span>{3}</span>}><span>Thinking 模型自動做</span></WayChip></div>
            </div>
          </Step>
        </Steps>
      </div>
      <Steps>
        <Step duration={STEP_MS}><div style={{ marginTop: 28 }}><StatusLine ok={false} size={30}><span>步驟也是它寫的：錯一步，後面跟著錯；算術還是心算</span></StatusLine></div></Step>
        <Step duration={STEP_MS}><Takeaway marginTop={24}><span>先寫草稿再作答，比較不會跳錯</span></Takeaway></Step>
      </Steps>
    </Fit>
  </Shell>
);

// One reasoning step of the worked example: number, what the step is, what it wrote.
const CotCard = ({ n, label, children, tone = 'step', tag }: { n: ReactNode; label: ReactNode; children: ReactNode; tone?: 'step' | 'tool' | 'ok'; tag?: ReactNode }) => {
  const c = tone === 'ok' ? okGreen : tone === 'tool' ? amber : blue;
  const soft = tone === 'ok' ? sage : tone === 'tool' ? amberSoft : blueSoft;
  return (
    <div style={{ background: soft, borderLeft: `6px solid ${c}`, padding: '10px 20px 12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <span style={{ width: 40, height: 40, borderRadius: 20, background: c, color: '#FFFFFF', display: 'grid', placeItems: 'center', fontSize: 24, fontWeight: 600 }}>{n}</span>
        <span style={{ fontSize: 30, fontWeight: 600, color: c }}>{label}</span>
        {tag ? <span style={{ marginLeft: 'auto', fontSize: 24, fontWeight: 600, color: c, border: `2px solid ${c}`, padding: '2px 12px', borderRadius: 18 }}>{tag}</span> : null}
      </div>
      <div style={{ marginTop: 4, marginLeft: 54 }}>{children}</div>
    </div>
  );
};

const Eq = ({ children }: { children: ReactNode }) => <span style={{ fontFamily: mono, fontSize: 30 }}>{children}</span>;

const CotPage: Page = () => (
  <Shell chapter={1} source={<span>{'Wei et al. 2022, arXiv:2201.11903；Gao et al. 2023, PAL, arXiv:2211.10435'}</span>}>
    <Eyebrow><span>例子｜Codex 實際輸出 2026-10-18</span></Eyebrow>
    <Heading><span>CoT＋Tool Calling 實例</span></Heading>
    <QuestionCard right={<><LegendKey color={blue}><span>CoT</span></LegendKey><LegendKey color={amber}><span>Tool Calling</span></LegendKey></>}><span>籠子裡有 35 個頭、94 隻腳，雞和兔各幾隻？</span></QuestionCard>
    <Fit>
      <div style={{ display: 'grid', gridTemplateColumns: '760px 1fr', gap: 28, alignItems: 'start' }}>
        <div style={{ display: 'grid', gap: 14 }}>
          <Steps>
            <Step duration={STEP_MS}><CotCard n={<span>{1}</span>} label={<span>{"判斷：這是二元一次方程式"}</span>} tag={<span>CoT</span>}><span style={{ fontSize: 27 }}>「雞兔同籠」題型</span></CotCard></Step>
            <Step duration={STEP_MS}><CotCard n={<span>{2}</span>} label={<span>{"想公式"}</span>} tag={<span>CoT</span>}><Eq><span>x+y=35　2x+4y=94</span></Eq><span style={{ fontSize: 24, color: muted, marginLeft: 18 }}>x＝雞、y＝兔</span></CotCard></Step>
            <Step duration={STEP_MS}><CotCard n={<span>{3}</span>} label={<span>{"套數字"}</span>} tag={<span>CoT</span>}><Eq><span>2x+2y=70 → 2y=24 → y=12，x=23</span></Eq></CotCard></Step>
          </Steps>
        </div>
        <div style={{ display: 'grid', gap: 14 }}>
          <Steps>
            <Step duration={STEP_MS}>
              <CotCard n={<span>{4}</span>} label={<span>{"按計算機（程式）"}</span>} tone="tool" tag={<span>Tool Calling</span>}>
                <div style={{ background: term, color: '#F5F5F4', fontFamily: mono, fontSize: 24, lineHeight: 1.5, padding: '10px 14px', whiteSpace: 'pre' }}>
                  <span style={{ color: '#E9B650' }}>{"python3 -c 'heads=35; feet=94;\n rabbits=(feet-2*heads)//2;\n chickens=heads-rabbits;\n print(chickens, rabbits)'\n"}</span>
                  <span style={{ fontSize: 32, fontWeight: 700, outline: '3px solid #E9B650', outlineOffset: 2 }}>23 12</span>
                </div>
              </CotCard>
            </Step>
            <Step duration={STEP_MS}>
              <CotCard n={<span>{5}</span>} label={<span>{"答案"}</span>} tone="ok">
                <div style={{ fontFamily: display, fontSize: 42 }}>雞 23 隻，兔 12 隻</div>
                <div style={{ fontSize: 26, color: okGreen, fontWeight: 600 }}>驗算：23×2＋12×4＝94 ✓</div>
              </CotCard>
            </Step>
          </Steps>
        </div>
      </div>
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={20}><span>先想清楚步驟（CoT），計算交給工具（Tool Calling）</span></Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

// A calculator drawn as a picture: the sum on the display, the = key pressed.
const CalcKey = ({ x, y, label, hot = false }: { x: number; y: number; label: ReactNode; hot?: boolean }) => (
  <g>
    <rect x={x} y={y} width="78" height="46" rx="6" fill={hot ? amber : '#FFFFFF'} stroke={hot ? amber : rule} strokeWidth="2" />
    <text x={x + 39} y={y + 33} textAnchor="middle" fontSize="28" fontWeight="600" fill={hot ? '#FFFFFF' : ink}>{label}</text>
  </g>
);

const ToolCalc: Page = () => (
  <Shell chapter={1} source={<span>{'Gao et al. 2023, PAL, arXiv:2211.10435；Schick et al. 2023, Toolformer, arXiv:2302.04761'}</span>}>
    <Eyebrow><span>CoT 會想，但算術還是心算 → 交給工具算</span></Eyebrow>
    <Heading><span>工具呼叫（Tool Calling）</span></Heading>
    <Lead><span>像把算式輸入計算機，按下「＝」</span></Lead>
    <In i={0} style={{ marginTop: 14, fontSize: 28 }}><strong style={{ color: amber }}>Tool Calling（工具呼叫）</strong><span>：模型寫一行程式或呼叫工具，讓工具算出結果</span></In>
    <Fit>
      <div style={{ display: 'grid', gridTemplateColumns: '470px 1fr', gap: 40, alignItems: 'center' }}>
        <div>
          <In i={0} style={{ background: '#FFFFFF', border: `2px solid ${ink}`, padding: '12px 18px', fontFamily: mono, fontSize: 30, lineHeight: 1.5 }}><span>
            2+4+7+9+23+1+5+7+2+5</span><br /><span>+74+2+7953+34+356＝？
          </span></In>
          <Steps>
            <Step duration={STEP_MS}>
              <div style={{ marginTop: 22 }}>
                <Figure w={470} h={300} label="計算機：輸入算式，按下等號">
                  <rect x="40" y="0" width="390" height="300" rx="18" fill={raised} stroke={ink} strokeWidth="2" />
                  <rect x="66" y="22" width="338" height="62" rx="6" fill={term} />
                  <text x="390" y="64" textAnchor="end" fontSize="28" fontFamily={mono} fill="#8DD4A0">…+34+356</text>
                  <CalcKey x={66} y={104} label={<tspan>{"7"}</tspan>} /><CalcKey x={152} y={104} label={<tspan>{"8"}</tspan>} /><CalcKey x={238} y={104} label={<tspan>{"9"}</tspan>} /><CalcKey x={324} y={104} label={<tspan>{"＋"}</tspan>} />
                  <CalcKey x={66} y={162} label={<tspan>{"4"}</tspan>} /><CalcKey x={152} y={162} label={<tspan>{"5"}</tspan>} /><CalcKey x={238} y={162} label={<tspan>{"6"}</tspan>} /><CalcKey x={324} y={162} label={<tspan>{"－"}</tspan>} />
                  <CalcKey x={66} y={220} label={<tspan>{"1"}</tspan>} /><CalcKey x={152} y={220} label={<tspan>{"2"}</tspan>} /><CalcKey x={238} y={220} label={<tspan>{"3"}</tspan>} /><CalcKey x={324} y={220} label={<tspan>{"＝"}</tspan>} hot />
                </Figure>
              </div>
            </Step>
          </Steps>
        </div>
        <div>
          <Steps>
            <Step duration={STEP_MS}>
              <Terminal title={<span>{"Codex 實際輸出｜2026-10-18"}</span>} size={26}>
                <Dim><span>{'exec\n'}</span></Dim>
                <AskLine><span>{"python3 -c 'print(sum([2,4,7,9,23,1,5,7,2,5,74,2,7953,34,356]))'\n"}</span></AskLine>
                <Dim><span>{' succeeded in 2814ms:\n'}</span></Dim>
                <span style={{ fontSize: 48, fontWeight: 700, lineHeight: 1.3 }}><HotLine><span>8484</span></HotLine></span><span>{'\n'}</span>
                <Dim><span>{'codex\n'}</span></Dim>
                <span>{'用 Python 程式計算結果是：8484'}</span>
              </Terminal>
              <Caption><span>codex-cli 0.154.0｜已刪去與題目無關的系統警告</span></Caption>
            </Step>
          </Steps>
        </div>
      </div>
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={36}><span>算出來的，不是猜出來的：沒有隨機性</span></Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

// One way to answer the long sum. The method shows first; its answer (and how much to trust it)
// is its own click, so the room can guess before seeing the result.
const WayCard = ({ kind, name, like, result, verdict, why, tone, shot }: { kind: IconKind; name: ReactNode; like: ReactNode; result: ReactNode; verdict: ReactNode; why?: string; tone: 'bad' | 'mid' | 'good'; shot?: ReactNode }) => {
  const c = tone === 'bad' ? warn : tone === 'mid' ? blue : okGreen;
  const soft = tone === 'bad' ? warnSoft : tone === 'mid' ? blueSoft : sage;
  return (
    <div style={{ background: soft, borderTop: `6px solid ${c}`, padding: '26px 30px 30px', height: '100%', boxSizing: 'border-box', display: 'grid', justifyItems: 'center', alignContent: 'start', gap: 16, textAlign: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}><Icon kind={kind} size={60} color={c} /><span style={{ fontSize: 40, fontWeight: 600 }}>{name}</span></div>
      <div style={{ fontSize: 32, background: '#FFFFFF', padding: '6px 22px', borderRadius: 24 }}><span>＝</span>{like}</div>
      <div style={{ width: '100%', borderTop: `2px dashed ${c}`, opacity: 0.5 }} />
      <Steps>
        <Step duration={STEP_MS}>
          <div style={{ display: 'grid', justifyItems: 'center', gap: 12 }}>
            {shot}
            <div className="aw1-build" style={{ ...buildDelay(shot ? 1 : 0), fontFamily: display, fontSize: 96, lineHeight: 1.1, color: c }}>{result}</div>
            <div className="aw1-build" style={{ ...buildDelay(shot ? 2 : 1), fontSize: 31, fontWeight: 600, color: c }}>{verdict}</div>
            {why ? <div className="aw1-build" style={{ ...buildDelay(shot ? 3 : 2), fontSize: 27, color: muted }}>{why}</div> : null}
          </div>
        </Step>
      </Steps>
    </div>
  );
};

const ToolCompare: Page = () => (
  <Shell chapter={1} source={<span>{'Gao et al. 2023, PAL: Program-aided Language Models, arXiv:2211.10435'}</span>}>
    <Eyebrow><span>同一題長加法｜三種做法</span></Eyebrow>
    <Heading><span>三種解法：直接答、CoT、工具</span></Heading>
    <Fit>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 36, alignItems: 'stretch' }}>
        <In i={1}><WayCard kind="dice" name={<span>{"直接回答"}</span>} like={<span>{"猜"}</span>} result={<span>{"8460"}</span>} verdict={<span>{"✗ 錯，每次還不一樣"}</span>} why="ChatGPT 實際畫面｜不准它算" tone="bad" shot={<Crop src={guess8460} alt="ChatGPT 被要求不可以偷偷計算，回答：我不算，純猜：8460" iw={1794} ih={456} crop={[118, 268, 364, 78]} width={460} />} /></In>
        <In i={2}><WayCard kind="think" name={<span>{"CoT（Thinking）"}</span>} like={<span>{"心算、列步驟"}</span>} result={<span>{"8484"}</span>} verdict={<span>{"可能錯，步驟要核對"}</span>} why="還是心算" tone="mid" /></In>
        <In i={3}><WayCard kind="calc" name={<span>{"Tool Calling"}</span>} like={<span>{"按計算機"}</span>} result={<span>{"8484"}</span>} verdict={<span>{"✓ 每次都一樣"}</span>} why="可以重跑，也看得到算式" tone="good" /></In>
      </div>
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={32}><span>要算得準，就讓它按計算機</span></Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

const WebSearch: Page = () => (
  <Shell chapter={1} source={<span>{'Nakano et al. 2021, WebGPT: Browser-assisted Question-answering, arXiv:2112.09332'}</span>}>
    <Eyebrow><span>Web Search＝另一種工具</span></Eyebrow>
    <Heading><span>Web Search 會先上網找資料</span></Heading>
    <Lead><span>搜尋也是 Tool Calling：計算機幫它算，搜尋幫它查</span></Lead>
    <Fit>
      {/* Two rows: each screenshot sits next to the callout that explains it; row 2 is one click. */}
      <div style={{ display: 'grid', gridTemplateColumns: '1100px 1fr', gap: 56, alignItems: 'center' }}>
        <In i={0}>
          <Screenshot src={webSearch} aspect={1586 / 484} width={1100} alt="ChatGPT 回答台灣新聞前，先搜尋中央社和路透社兩個網站">
            <RegionMark n={<span>{1}</span>} i={2} x={7.5} y={51} w={36} h={28} badge="right" />
          </Screenshot>
        </In>
        <In i={1}><Callout n={<span>{1}</span>} title={<span>{"先搜尋網站"}</span>} detail="中央社、路透社" /></In>
      </div>
      <Steps>
        <Step duration={STEP_MS}>
          <div style={{ display: 'grid', gridTemplateColumns: '1100px 1fr', gap: 56, alignItems: 'center', marginTop: 28 }}>
            <div>
              <div style={{ position: 'relative' }}>
                <Crop src={researchAnswer} alt="回答裡附上中央社 CNA 的來源標籤" iw={1480} ih={1328} crop={[50, 700, 1260, 72]} width={1100}>
                  <div style={{ position: 'absolute', left: '85.5%', top: 4, width: '13.5%', bottom: 4, border: '4px solid #E9B650', boxSizing: 'border-box' }} />
                </Crop>
              </div>
              <Caption><span>ChatGPT 實際畫面｜2026 年 9 月</span></Caption>
            </div>
            <Callout n={<span>{2}</span>} title={<span>{"回答附上來源"}</span>} detail="點得開，查得到" />
          </div>
        </Step>
      </Steps>
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={56}><span>先查再答叫 RAG，搜到的內容就是「檢索來的資料」</span></Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

const SourceRow = ({ x, y, kind, label }: { x: number; y: number; kind: IconKind; label: ReactNode }) => (
  <g>
    <rect x={x} y={y} width="380" height="72" fill="#FFFFFF" stroke={rule} strokeWidth="2" />
    <SvgIcon kind={kind} x={x + 44} y={y + 36} size={42} color={blue} />
    <text x={x + 86} y={y + 47} fontSize="31" fill={ink}>{label}</text>
  </g>
);

const RagR: Page = () => (
  <Shell chapter={1} source={<span>{'Lewis et al. 2020, Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks, arXiv:2005.11401'}</span>}>
    <Eyebrow><span>RAG 第 1 步｜Retrieval</span></Eyebrow>
    <Heading><span>R：檢索（Retrieval）</span></Heading>
    <Lead><span>先找出相關的那一段，像去圖書館找書</span></Lead>
    <Fit>
      <Stage h={470}>
        <Steps>
          <Layer h={470} label="問題：曹操說天下英雄那句在哪一回？">
            <InG i={0}>
              <rect x="0" y="40" width="470" height="380" fill={surface} />
              <text x="30" y="96" fontSize="27" fontWeight="600" fill={quiet}>問題</text>
              <rect x="30" y="130" width="410" height="170" rx="22" fill="#FFFFFF" stroke={ink} strokeWidth="2" />
              <text x="235" y="200" textAnchor="middle" fontSize="33" fill={ink}>曹操說「天下英雄」</text>
              <text x="235" y="252" textAnchor="middle" fontSize="33" fill={ink}>那句在哪一回？</text>
            </InG>
          </Layer>
          <Step duration={STEP_MS}><Layer h={470} label="去網路、上傳的檔案、你的資料夾找">
            <MapArrow x1={482} x2={570} y={230} />
            <text x="590" y="96" fontSize="27" fontWeight="600" fill={blue}>去哪裡找</text>
            <g className="aw1-build" style={buildDelay(0)}><SourceRow x={590} y={124} kind="globe" label={<tspan>{"網路"}</tspan>} /></g>
            <g className="aw1-build" style={buildDelay(1)}><SourceRow x={590} y={214} kind="doc" label={<tspan>{"上傳的檔案"}</tspan>} /></g>
            <g className="aw1-build" style={buildDelay(2)}><SourceRow x={590} y={304} kind="folder" label={<tspan>{"你的資料夾"}</tspan>} /></g>
          </Layer></Step>
          <Step duration={STEP_MS}><Layer h={470} label="找到第 21 回〈曹操煮酒論英雄〉">
            <MapArrow x1={982} x2={1090} y={230} hot />
            <g className="aw1-build" style={buildDelay(0)}>
              <DocShape x={1110} y={50} w={330} h={360} fill={amberSoft} stroke={amber} sw={3} />
              <text x="1275" y="150" textAnchor="middle" fontSize="44" fontWeight="600" fill={ink}>第 21 回</text>
              <text x="1275" y="210" textAnchor="middle" fontSize="31" fill={muted}>曹操煮酒論英雄</text>
              <rect x="1150" y="258" width="250" height="16" fill={rule} />
              <rect x="1150" y="292" width="250" height="34" fill={amber} opacity="0.45" />
              <rect x="1150" y="344" width="180" height="16" fill={rule} />
            </g>
            <g className="aw1-build" style={buildDelay(1)}><text x="1275" y="458" textAnchor="middle" fontSize="28" fill={amber} fontWeight="600">找到相關的那一段</text></g>
          </Layer></Step>
        </Steps>
      </Stage>
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={24}><span>先找到資料，後面才有根據</span></Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

const RagA: Page = () => (
  <Shell chapter={1} source={<span>{'Lewis et al. 2020, Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks, arXiv:2005.11401'}</span>}>
    <Eyebrow><span>RAG 第 2 步｜Augmented</span></Eyebrow>
    <Heading><span>A：增強（Augmented）</span></Heading>
    <Lead><span>題目和資料裝同一箱，一起交出去</span></Lead>
    <Fit>
      <Stage h={460}>
        <Steps>
          <Layer h={460} label="手上有兩樣東西：問題，和 R 找到的資料">
            <InG i={0}>
              <rect x="0" y="30" width="520" height="130" fill="#FFFFFF" stroke={ink} strokeWidth="2" />
              <text x="28" y="74" fontSize="25" fontWeight="600" fill={quiet}>問題</text>
              <text x="28" y="126" fontSize="32" fill={ink}>天下英雄那句在哪一回？</text>
            </InG>
            <InG i={1}>
              <DocShape x={0} y={200} w={520} h={240} fill={amberSoft} stroke={amber} sw={3} />
              <text x="28" y="244" fontSize="25" fontWeight="600" fill={amber}>R 找到的資料｜第 21 回</text>
              <text x="28" y="300" fontSize="31" fill={ink}>操以手指玄德，後自指曰：</text>
              <text x="28" y="348" fontSize="31" fill={ink}>「今天下英雄，</text>
              <text x="28" y="396" fontSize="31" fill={ink}>惟使君與操耳。」</text>
            </InG>
          </Layer>
          <Step duration={STEP_MS}><Layer h={460} label="兩樣東西裝進同一個包裹">
            <g fill="none" stroke={blue} strokeWidth="4"><StepPath d="M530 95 C600 95 620 180 680 200" /><StepPath d="M530 320 C600 320 620 260 680 250" i={1} /></g>
            <g className="aw1-build" style={buildDelay(2)}>
              <rect x="690" y="110" width="400" height="260" fill={blueSoft} stroke={blue} strokeWidth="3" strokeDasharray="12 9" />
              <path d="M690 110 L750 70 H1030 L1090 110" fill="none" stroke={blue} strokeWidth="3" />
              <text x="890" y="170" textAnchor="middle" fontSize="31" fontWeight="600" fill={blue}>一起交出去</text>
              <SvgChip x={730} y={200} w={320} h={56} label={<tspan>{"問題"}</tspan>} size={28} />
              <SvgChip x={730} y={276} w={320} h={56} label={<tspan>{"資料：第 21 回"}</tspan>} size={28} fill={amberSoft} stroke={amber} />
            </g>
          </Layer></Step>
          <Step duration={STEP_MS}><Layer h={460} label="交給 AI，這次有資料可以照著答">
            <MapArrow x1={1104} x2={1210} y={240} hot />
            <rect x="1226" y="170" width="300" height="140" fill={blue} />
            <text x="1376" y="258" textAnchor="middle" fontSize="48" fontWeight="600" fill="#FFFFFF">AI</text>
            <text x="1376" y="370" textAnchor="middle" fontSize="28" fill={muted}>照著資料讀題目</text>
          </Layer></Step>
        </Steps>
      </Stage>
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={24}><span>題目加上資料，AI 就不用硬猜</span></Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

const RagG: Page = () => (
  <Shell chapter={1} source={<span>{'Lewis et al. 2020, arXiv:2005.11401；原文：維基文庫《三國演義》第 21 回'}</span>}>
    <Eyebrow><span>RAG 第 3 步｜Generation</span></Eyebrow>
    <Heading><span>G：生成（Generation）</span></Heading>
    <Lead><span>照找到的資料回答，附上出處</span></Lead>
    <Fit>
      <In i={0} style={{ display: 'flex', alignItems: 'flex-start', gap: 28 }}>
        <Icon kind="chat" size={72} color={muted} />
        <div style={{ flex: 1, background: '#FFFFFF', border: `2px solid ${rule}`, borderRadius: 16, padding: '34px 46px' }}>
          <SmallLabel><span>AI 回答（示意）</span></SmallLabel>
          <div style={{ fontSize: 36, marginTop: 18 }}>在第 21 回〈曹操煮酒論英雄〉，曹操說：</div>
          <div style={{ fontFamily: display, fontSize: 64, lineHeight: 1.35, marginTop: 18 }}>「今天下英雄，惟使君與操耳。」</div>
          <Steps>
            <Step duration={STEP_MS}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 14, marginTop: 30, background: sage, border: `2px solid ${okGreen}`, padding: '12px 24px' }}>
                <Icon kind="globe" size={40} color={okGreen} />
                <span style={{ fontSize: 30, fontWeight: 600 }}>出處</span>
                <span style={{ fontFamily: mono, fontSize: 28 }}>zh.wikisource.org／三國演義／第021回</span>
              </div>
            </Step>
          </Steps>
        </div>
      </In>
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 40 }}>
        <Steps><Step duration={STEP_MS}><StatusLine ok size={36}><span>點開出處，找得到同一句</span></StatusLine></Step></Steps>
      </div>
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={40}><span>有來源 ≠ 一定正確：點開來源逐字核對</span></Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

const ClosedBook = ({ x, y }: { x: number; y: number }) => (
  <g>
    <rect x={x - 70} y={y - 90} width="140" height="180" rx="6" fill="#FFFFFF" stroke={ink} strokeWidth="3" />
    <rect x={x - 70} y={y - 90} width="24" height="180" fill={raised} stroke={ink} strokeWidth="3" />
    <line x1={x - 30} y1={y - 40} x2={x + 50} y2={y - 40} stroke={rule} strokeWidth="6" />
  </g>
);

const OpenBookPage: Page = () => (
  <Shell chapter={1} source={<span>{'Lewis et al. 2020, Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks, arXiv:2005.11401'}</span>}>
    <Eyebrow><span>RAG 三步合起來</span></Eyebrow>
    <Heading><span>檢索增強生成（RAG）</span></Heading>
    <Lead><span>先找資料，再帶著資料回答，就像開書考</span></Lead>
    <Fit>
      <Stage h={480}>
        <Steps>
          <Layer h={480} label="閉書考：一般 GPT 只靠記憶，可能亂寫">
            <InG i={0}>
              <rect x="0" y="0" width="600" height="480" fill={surface} />
              <text x="300" y="64" textAnchor="middle" fontSize="42" fontWeight="600" fill={ink}>閉書考</text>
              <text x="300" y="106" textAnchor="middle" fontSize="27" fill={muted}>一般 GPT</text>
              <ClosedBook x={300} y={230} />
              <text x="300" y="370" textAnchor="middle" fontSize="31" fill={ink}>只靠記憶</text>
              <AskMark x={210} y={428} r={24} />
              <text x="248" y="438" fontSize="30" fill={amber} fontWeight="600">可能亂寫</text>
            </InG>
          </Layer>
          <Step duration={STEP_MS}><Layer h={480} label="開書考：RAG 先翻書、對照題目、照書作答附頁碼">
            <rect x="680" y="0" width="952" height="480" fill={sage} />
            <text x="1156" y="64" textAnchor="middle" fontSize="42" fontWeight="600" fill={ink}>開書考</text>
            <text x="1156" y="106" textAnchor="middle" fontSize="27" fill={muted}>RAG</text>
            <g className="aw1-build" style={buildDelay(0)}>
              <circle cx="840" cy="230" r="82" fill="#FFFFFF" stroke={okGreen} strokeWidth="3" />
              <SvgIcon kind="book" x={840} y={230} size={92} color={okGreen} />
              <text x="840" y="360" textAnchor="middle" fontSize="31" fontWeight="600" fill={ink}>R 翻到那頁</text>
            </g>
            <g className="aw1-build" style={buildDelay(1)}>
              <MapArrow x1={932} x2={1062} y={230} />
              <circle cx="1156" cy="230" r="82" fill="#FFFFFF" stroke={okGreen} strokeWidth="3" />
              <SvgIcon kind="doc" x={1156} y={230} size={92} color={okGreen} />
              <text x="1156" y="360" textAnchor="middle" fontSize="31" fontWeight="600" fill={ink}>A 對照題目</text>
            </g>
            <g className="aw1-build" style={buildDelay(2)}>
              <MapArrow x1={1248} x2={1378} y={230} />
              <circle cx="1472" cy="230" r="82" fill="#FFFFFF" stroke={okGreen} strokeWidth="3" />
              <SvgIcon kind="chat" x={1472} y={230} size={92} color={okGreen} />
              <text x="1472" y="360" textAnchor="middle" fontSize="31" fontWeight="600" fill={ink}>G 照書作答</text>
            </g>
            <g className="aw1-build" style={buildDelay(3)}>
              <OkDot x={1080} y={428} r={24} />
              <text x="1118" y="438" fontSize="30" fill={okGreen} fontWeight="600">答案附頁碼</text>
            </g>
          </Layer></Step>
        </Steps>
      </Stage>
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={36}><span>今天的大綱練習，也是一場開書考</span></Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

const RagMiniPractice: Page = () => (
  <Shell chapter={1}>
    <PracticeEyebrow time={<span>{"3 分鐘"}</span>}><span>小練習｜自己的 ChatGPT</span></PracticeEyebrow>
    <Heading><span>小練習：Web Search 找來源</span></Heading>
    <Lead><span>挑一件你最近好奇的事：球賽、旅行、科技，都可以。</span></Lead>
    <Fit>
      <div style={{ display: 'grid', gridTemplateColumns: '1.08fr 0.92fr', gap: 76, alignItems: 'start' }}>
        <div>
          <div style={{ fontSize: 26, fontWeight: 600, color: amber, marginBottom: 20 }}>若能選 Thinking，先選好，再貼上這句</div>
          <div style={{ background: surface, borderLeft: `6px solid ${amber}`, padding: '38px 44px 42px' }}>
            <div style={{ fontFamily: display, fontSize: 45, lineHeight: 1.48, color: ink }}><span>
              「請上網搜尋：</span><span style={{ color: amber }}>＿＿＿＿？</span><br /><span>
              用三句話回答，附上來源。」
            </span></div>
          </div>
          <div style={{ fontSize: 26, color: quiet, lineHeight: 1.5, marginTop: 20 }}>把空格換成你的問題。</div>
        </div>
        <Steps><Step duration={STEP_MS}><div>
          <div style={{ fontSize: 26, fontWeight: 600, color: muted, marginBottom: 14 }}>回答後，找三個地方</div>
          <div style={{ borderTop: `1px solid ${rule}`, padding: '18px 0 20px', display: 'grid', gridTemplateColumns: '68px 1fr', alignItems: 'start' }}>
            <span style={{ fontFamily: display, fontSize: 37, color: amber }}>01</span>
            <div><strong style={{ fontSize: 34 }}>思考</strong><div style={{ fontSize: 27, color: muted, marginTop: 4 }}>有顯示「已思考」嗎？</div></div>
          </div>
          <div style={{ borderTop: `1px solid ${rule}`, padding: '18px 0 20px', display: 'grid', gridTemplateColumns: '68px 1fr', alignItems: 'start' }}>
            <span style={{ fontFamily: display, fontSize: 37, color: amber }}>02</span>
            <div><strong style={{ fontSize: 34 }}>搜尋</strong><div style={{ fontSize: 27, color: muted, marginTop: 4 }}>有顯示搜尋活動嗎？</div></div>
          </div>
          <div style={{ borderTop: `1px solid ${rule}`, borderBottom: `1px solid ${rule}`, padding: '18px 0 20px', display: 'grid', gridTemplateColumns: '68px 1fr', alignItems: 'start' }}>
            <span style={{ fontFamily: display, fontSize: 37, color: amber }}>03</span>
            <div><strong style={{ fontSize: 34 }}>來源</strong><div style={{ fontSize: 27, color: muted, marginTop: 4 }}>點開一則，對照答案。</div></div>
          </div>
        </div></Step></Steps>
      </div>
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={58}><span>親自檢查來源以及檢查生成內容是否正確是很重要的環節</span></Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

const LoopNode = ({ x, y, kind, label, ly }: { x: number; y: number; kind: IconKind; label: ReactNode; ly: number }) => (
  <g>
    <circle cx={x} cy={y} r="64" fill="#FFFFFF" stroke={amber} strokeWidth="3" />
    <SvgIcon kind={kind} x={x} y={y} size={70} color={amber} />
    <text x={x} y={ly} textAnchor="middle" fontSize="32" fontWeight="600" fill={ink}>{label}</text>
  </g>
);

// An arrowhead whose tip sits at (x, y), pointing along (dx, dy).
const ArrowTip = ({ x, y, dx, dy, color = amber }: { x: number; y: number; dx: number; dy: number; color?: string }) => {
  const l = Math.hypot(dx, dy); const ux = dx / l; const uy = dy / l;
  const bx = x - ux * 22; const by = y - uy * 22;
  return <polygon points={`${x},${y} ${bx - uy * 11},${by + ux * 11} ${bx + uy * 11},${by - ux * 11}`} fill={color} />;
};

const AgentPage: Page = () => (
  <Shell chapter={2} source={<span>{'Yao et al. 2023, ReAct, arXiv:2210.03629；Anthropic 2024, Building Effective Agents'}</span>}>
    <Eyebrow><span>Agent＝會用工具、執行任務</span></Eyebrow>
    <Heading><span>AI 代理（Agent）</span></Heading>
    <Fit>
      <Stage h={500}>
        <Steps>
          <Layer h={500} label="你交代任務，Agent 提出要做的動作">
            <InG i={0}>
              <circle cx="110" cy="250" r="70" fill={surface} stroke={rule} strokeWidth="2" />
              <text x="110" y="262" textAnchor="middle" fontSize="38" fontWeight="600" fill={ink}>你</text>
              <text x="110" y="156" textAnchor="middle" fontSize="28" fill={muted}>交代任務</text>
            </InG>
            <InG i={1}><MapArrow x1={186} x2={370} y={250} hot /></InG>
            <InG i={2}><LoopNode x={446} y={250} kind="chat" label={<tspan>{"提出要做的動作"}</tspan>} ly={360} /></InG>
            <InG i={3}><text x="446" y="404" textAnchor="middle" fontSize="26" fill={muted}>例：建立 hello.md</text></InG>
          </Layer>
          <Step duration={STEP_MS}><Layer h={500} label="你檢查，選 Yes, proceed 才放行">
            <g fill="none" stroke={amber} strokeWidth="4"><StepPath d="M490 200 Q560 70 732 64" /></g>
            <g className="aw1-build" style={buildDelay(3)}><ArrowTip x={746} y={64} dx={180} dy={-6} /></g>
            <g className="aw1-build" style={buildDelay(1)}><LoopNode x={816} y={70} kind="ok" label={<tspan>{"你檢查"}</tspan>} ly={-10} />
              <rect x="900" y="-34" width="190" height="42" fill={sage} stroke={okGreen} strokeWidth="2" />
              <text x="995" y="-5" textAnchor="middle" fontSize="24" fontFamily={mono} fontWeight="700" fill={ink}>Yes, proceed</text>
              <text x="1106" y="-5" fontSize="24" fill={muted}>（跳出確認時）</text></g>
          </Layer></Step>
          <Step duration={STEP_MS}><Layer h={500} label="執行，再回報給你">
            <g fill="none" stroke={amber} strokeWidth="4"><StepPath d="M886 64 Q1080 70 1140 188" /><StepPath d="M1146 300 Q1080 430 900 432" i={2} /><StepPath d="M740 440 Q260 520 116 338" i={4} /></g>
            <g className="aw1-build" style={buildDelay(2)}><ArrowTip x={1148} y={202} dx={66} dy={130} /></g>
            <g className="aw1-build" style={buildDelay(4)}><ArrowTip x={886} y={432} dx={-188} dy={2} /></g>
            <g className="aw1-build" style={buildDelay(6)}><ArrowTip x={110} y={324} dx={-150} dy={-194} /></g>
            <g className="aw1-build" style={buildDelay(1)}><LoopNode x={1186} y={250} kind="tool" label={<tspan>{"執行"}</tspan>} ly={360} /></g>
            <g className="aw1-build" style={buildDelay(3)}><LoopNode x={816} y={432} kind="save" label={<tspan>{"回報"}</tspan>} ly={530} /></g>
            <g className="aw1-steppop" style={buildDelay(7)}>
              <rect x="706" y="208" width="220" height="84" fill={term} />
              <text x="816" y="246" textAnchor="middle" fontSize="28" fontFamily={mono} fill="#F5F5F4">&gt;_ Agent</text>
              <text x="816" y="278" textAnchor="middle" fontSize="24" fill="#E9B650">這一整圈</text>
            </g>
          </Layer></Step>
        </Steps>
      </Stage>
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={56}><span>Codex 就是一種 Agent：真的動手做，做完回報</span></Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

// ---------- 02 ChatGPT 與 Codex ----------

const Section2: Page = () => <SectionPage chapter={2} title={<span>{"ChatGPT 與 Codex"}</span>} label={<span>{"02 / CHATGPT × CODEX"}</span>} lead="先認識會動手的 Agent，再比較 ChatGPT 與 Codex" />;

const ToolPanel = ({ kind, name, tagline, fit, tint, stroke, children }: { kind: IconKind; name: ReactNode; tagline: ReactNode; fit: ReactNode; tint: string; stroke: string; children: ReactNode }) => (
  <div style={{ background: tint, borderTop: `5px solid ${stroke}`, padding: '26px 34px 30px' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
      <Icon kind={kind} size={58} color={stroke} />
      <span style={{ fontSize: 44, fontWeight: 600 }}>{name}</span>
      <span style={{ fontSize: 30, color: muted, marginLeft: 8 }}>{tagline}</span>
    </div>
    <div style={{ marginTop: 22 }}>{children}</div>
    <div style={{ marginTop: 18, fontSize: 31 }}><SmallLabel color={stroke}><span>適合</span></SmallLabel>　{fit}</div>
  </div>
);

const ChatVsCodex: Page = () => (
  <Shell chapter={2} source={<span>{'OpenAI Codex 文件 developers.openai.com/codex'}</span>}>
    <Eyebrow><span>本課這樣分工</span></Eyebrow>
    <Heading><span>ChatGPT 和 Codex 的分工</span></Heading>
    <Fit>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48 }}>
        <Steps>
          <ToolPanel kind="chat" name={<span>{"ChatGPT"}</span>} tagline={<span>{"在對話框裡聊"}</span>} fit={<span>{"發想、解釋、找資料"}</span>} tint="#FFFFFF" stroke={faint}>
            <Figure w={722} h={250} label="你問一句，ChatGPT 回一段話">
              <rect x="330" y="14" width="380" height="64" rx="32" fill={amberSoft} />
              <text x="520" y="56" textAnchor="middle" fontSize="29" fill={ink}>RAG 是什麼？</text>
              <Bubble x={12} y={108} w={540} h={112} />
              <text x="40" y="154" fontSize="28" fill={ink}>RAG 就是先找資料，</text>
              <text x="40" y="196" fontSize="28" fill={ink}>再回答的方法……</text>
            </Figure>
          </ToolPanel>
          <Step duration={STEP_MS}>
            <ToolPanel kind="terminal" name={<span>{"Codex"}</span>} tagline={<span>{"在你的資料夾裡做"}</span>} fit={<span>{"讀檔、整理、存成檔案"}</span>} tint={amberSoft} stroke={amber}>
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
      <Steps><Step duration={STEP_MS}><Takeaway><span>ChatGPT 幫你想，Codex 幫你做</span></Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

const LaneStep = ({ kind, text, hot = false, you = false }: { kind: IconKind; text: ReactNode; hot?: boolean; you?: boolean }) => (
  <div style={{ width: 236, height: 184, boxSizing: 'border-box', background: hot ? amberSoft : '#FFFFFF', border: `2px solid ${hot ? amber : rule}`, display: 'grid', justifyItems: 'center', alignContent: 'center', gap: 14, position: 'relative' }}>
    <Icon kind={kind} size={64} color={hot ? amber : muted} />
    <span style={{ fontSize: 30, fontWeight: 600 }}>{text}</span>
    {you ? <span style={{ position: 'absolute', top: 8, right: 8, background: warn, color: '#FFFFFF', fontSize: 24, fontWeight: 600, padding: '2px 10px' }}>你做</span> : null}
  </div>
);

const LaneArrow = () => <span style={{ fontSize: 44, color: faint, lineHeight: 1 }}>→</span>;

const Lane = ({ name, kind, tint, stroke, count, children }: { name: ReactNode; kind: IconKind; tint: string; stroke: string; count: ReactNode; children: ReactNode }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 18, background: tint, borderLeft: `6px solid ${stroke}`, padding: '26px 30px' }}>
    <div style={{ width: 200, display: 'grid', gap: 8 }}>
      <Icon kind={kind} size={52} color={stroke} />
      <span style={{ fontSize: 34, fontWeight: 600 }}>{name}</span>
    </div>
    {children}
    <span style={{ marginLeft: 'auto', fontSize: 30, fontWeight: 600, color: stroke, whiteSpace: 'nowrap' }}>{count}</span>
  </div>
);

const SameTaskTwoWays: Page = () => (
  <Shell chapter={2}>
    <Eyebrow><span>為什麼這份作業在資料夾裡做</span></Eyebrow>
    <Heading><span>ChatGPT vs Codex</span></Heading>
    <Fit>
      <div style={{ display: 'grid', gap: 36 }}>
        <Steps>
          <In i={0}>
            <Lane name={<span>{"ChatGPT"}</span>} kind="chat" tint="#FFFFFF" stroke={faint} count={<span>{'動手 3 次'}</span>}>
              <LaneStep kind="folder" text={<span>{"打開 21 個檔"}</span>} you />
              <LaneArrow />
              <LaneStep kind="doc" text={<span>{"貼上再提問"}</span>} you />
              <LaneArrow />
              <LaneStep kind="chat" text={<span>{"它回一段話"}</span>} />
              <LaneArrow />
              <LaneStep kind="save" text={<span>{"自己存成檔"}</span>} you />
            </Lane>
          </In>
          <Step duration={STEP_MS}>
            <Lane name={<span>{"Codex"}</span>} kind="terminal" tint={amberSoft} stroke={amber} count={<span>{'動手 1 次'}</span>}>
              <LaneStep kind="chat" text={<span>{"一句交代"}</span>} you />
              <LaneArrow />
              <LaneStep kind="folder" text={<span>{"它讀 原文/"}</span>} hot />
              <LaneArrow />
              <LaneStep kind="save" text={<span>{"它存好檔案"}</span>} hot />
            </Lane>
          </Step>
        </Steps>
      </div>
      <Steps><Step duration={STEP_MS}><Takeaway><span>Codex 可以直接讀檔案，寫檔案</span></Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

// One step of practice 1 (ChatGPT), which students do on their own after class.
const SelfStep = ({ n, kind, title, detail }: { n: number; kind: IconKind; title: ReactNode; detail: ReactNode }) => (
  <div style={{ background: surface, borderTop: `5px solid ${amber}`, padding: '28px 32px 32px', height: '100%', boxSizing: 'border-box' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}><NumDot n={n} /><Icon kind={kind} size={52} color={amber} /></div>
    <div style={{ fontSize: 36, fontWeight: 600, marginTop: 22 }}>{title}</div>
    <div style={{ fontSize: 28, color: muted, marginTop: 10 }}>{detail}</div>
  </div>
);

const ChatGPTSelf: Page = () => (
  <Shell chapter={2}>
    <PracticeEyebrow time={<span>{"約 15 分鐘"}</span>}><span>練習 1｜ChatGPT｜課後自己練</span></PracticeEyebrow>
    <Heading><span>課後自己練：給不給原文，答案差多少</span></Heading>
    <Fit>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32 }}>
        <In i={0}><SelfStep n={1} kind="chat" title={<span>先不給資料問</span>} detail={<span>看它憑記憶怎麼答</span>} /></In>
        <In i={1}><SelfStep n={2} kind="search" title={<span>追問原文哪一句</span>} detail={<span>自己點開原文核對</span>} /></In>
        <In i={2}><SelfStep n={3} kind="book" title={<span>附上原文再問</span>} detail={<span>比比看答案差在哪</span>} /></In>
      </div>
      <In i={3} style={{ marginTop: 40, display: 'flex', alignItems: 'center', gap: 36, background: '#FFFFFF', border: `1px solid ${rule}`, padding: '24px 32px' }}>
        <a href={PROMPTS_URL} target="_blank" rel="noreferrer" aria-label="打開 prompts.md"><img src={promptsQr} alt="prompts.md 的 QR code" style={{ width: 130, height: 130, display: 'block', background: '#FFFFFF', border: `1px solid ${rule}`, padding: 5 }} /></a>
        <div style={{ display: 'grid', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 32 }}><Icon kind="doc" size={40} color={amber} /><span>提示詞：</span><Path size={32}><span>prompts.md</span></Path><span>的「練習 1」</span></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 32 }}><Icon kind="folder" size={40} color={amber} /><span>參考結果：</span><Path size={32}><span>aw-01-lab/ChatGPT_練習/</span></Path></div>
          <a href={PROMPTS_URL} target="_blank" rel="noreferrer" style={{ fontSize: 24, color: amber, textDecoration: 'underline', textUnderlineOffset: 3 }}>{PROMPTS_URL}</a>
        </div>
      </In>
    </Fit>
  </Shell>
);

// ---------- 03 安裝 Codex ----------

const Section3: Page = () => <SectionPage chapter={3} title={<span>{"安裝 Codex"}</span>} label={<span>{"03 / 安裝"}</span>} lead="讓 AI 進到你電腦裡的資料夾" />;

// A keyboard key, drawn as a keycap.
const Key = ({ children }: { children: ReactNode }) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', background: '#FFFFFF', border: `2px solid ${faint}`, borderBottomWidth: 6, borderRadius: 10, padding: '2px 16px', fontSize: 30, fontWeight: 600, lineHeight: 1.4, whiteSpace: 'nowrap' }}>{children}</span>
);

const OpenStep = ({ n, children, size = 32 }: { n: number; children: ReactNode; size?: number }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 18, fontSize: size, lineHeight: 1.4, minHeight: 58 }}>
    <NumDot n={n} />
    <span style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>{children}</span>
  </div>
);

// One OS column: how to open the terminal, then the window you should see (shown with <Cue n={1}>).
const OpenCard = ({ os, steps, window: win }: { os: ReactNode; steps: ReactNode; window: ReactNode }) => (
  <div style={{ background: surface, borderTop: `5px solid ${amber}`, padding: '22px 34px 30px' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}><Icon kind="laptop" size={48} color={amber} /><span style={{ fontSize: 40, fontWeight: 600 }}>{os}</span></div>
    <div style={{ display: 'grid', gap: 10, marginTop: 18 }}>{steps}</div>
    <div className="aw1-cue" data-cue={1} style={{ marginTop: 24 }}>{win}</div>
  </div>
);

const OpenTerminal: Page = () => (
  <Shell chapter={3}>
    <Eyebrow><span>步驟 1／7｜Mac 和 Windows 各一種</span></Eyebrow>
    <Heading><span>先打開終端機</span></Heading>
    <Fit>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48 }}>
        <In i={0}>
          <OpenCard
            os={<span>Mac</span>}
            steps={<>
              <OpenStep n={1}><Key><span>⌘ command</span></Key><span>＋</span><Key><span>空白鍵</span></Key></OpenStep>
              <OpenStep n={2}><span>打</span><Path size={32}><span>terminal</span></Path></OpenStep>
              <OpenStep n={3}><span>按</span><Key><span>return</span></Key></OpenStep>
            </>}
            window={<Terminal title={<span>{"終端機"}</span>} size={32}><span>{'you@MacBook ~ % '}</span><span style={{ background: '#F5F5F4' }}>{' '}</span></Terminal>}
          />
        </In>
        <In i={1}>
          <OpenCard
            os={<span>Windows</span>}
            steps={<>
              <OpenStep n={1}><span>按</span><Key><span>⊞ Win</span></Key><span>鍵</span></OpenStep>
              <OpenStep n={2}><span>打</span><Path size={32}><span>powershell</span></Path></OpenStep>
              <OpenStep n={3}><span>選「Windows PowerShell」</span></OpenStep>
            </>}
            window={<Terminal title={<span>{"Windows PowerShell"}</span>} size={32}><HotLine><span>PS</span></HotLine><span>{' C:\\Users\\you> '}</span><span style={{ background: '#F5F5F4' }}>{' '}</span></Terminal>}
          />
        </In>
      </div>
      <Steps><Step duration={STEP_MS}><Cue n={1}><Takeaway marginTop={28}><span>看到游標在閃，就能打字了</span></Takeaway></Cue></Step></Steps>
    </Fit>
  </Shell>
);

// One line of the terminal on the anatomy page; cue makes it appear with <Cue n>.
const TermRow = ({ cue, children }: { cue?: 1 | 2 | 3; children: ReactNode }) => (
  <div className={cue ? 'aw1-cue' : undefined} data-cue={cue} style={{ display: 'flex', alignItems: 'center', gap: 14, minHeight: 76 }}>{children}</div>
);

const TermDot = ({ n, cue }: { n: number; cue?: 1 | 2 | 3 }) => (
  <span className={cue ? 'aw1-cue' : undefined} data-cue={cue} style={{ display: 'inline-flex', fontFamily: 'var(--osd-font-body)' }}><NumDot n={n} size={40} /></span>
);

const TerminalAnatomy: Page = () => (
  <Shell chapter={3}>
    <Eyebrow><span>步驟 2／7｜跟著打一次</span></Eyebrow>
    <Heading><span>在終端機打一行指令</span></Heading>
    <Lead><span>CLI 就是打字的介面，沒有按鈕可點</span></Lead>
    <Fit>
      <div style={{ display: 'grid', gridTemplateColumns: '960px 1fr', gap: 56, alignItems: 'center' }}>
        <In i={0}>
          <Terminal title={<span>{"終端機（Mac 示意）"}</span>} size={40}>
            <div style={{ whiteSpace: 'normal' }}>
              <TermRow>
                <span style={{ whiteSpace: 'pre' }}>{'you@MacBook ~ %'}</span><TermDot n={1} />
                <span className="aw1-cue" data-cue={1} style={{ display: 'inline-flex', alignItems: 'center', gap: 14 }}><Typed><span>echo hello</span></Typed><TermDot n={2} /></span>
              </TermRow>
              <TermRow cue={2}><span>hello</span><TermDot n={3} /></TermRow>
              <TermRow cue={3}><span style={{ whiteSpace: 'pre' }}>{'you@MacBook ~ % '}</span><span style={{ width: 24, height: 46, background: '#F5F5F4', display: 'inline-block' }} /><TermDot n={4} /></TermRow>
            </div>
          </Terminal>
        </In>
        <div style={{ display: 'grid', gap: 30 }}>
          <In i={1}><Callout n={1} title={<span>提示字元：在等你打字</span>} detail={<span>Windows 長這樣：<Path size={27}><span>{'PS C:\\Users\\you>'}</span></Path></span>} /></In>
          <Steps>
            <Step duration={STEP_MS}><Cue n={1}><Callout n={2} title={<span>打指令，按 Enter</span>} detail={<span>貼上：Mac ⌘V／Windows Ctrl+V</span>} /></Cue></Step>
            <Step duration={STEP_MS}><Cue n={2}><Callout n={3} title={<span>結果印在下一行</span>} /></Cue></Step>
            <Step duration={STEP_MS}><Cue n={3}><Callout n={4} title={<span>提示字元再出現＝做完了</span>} detail={<span>還沒出現，就先等</span>} /></Cue></Step>
          </Steps>
        </div>
      </div>
    </Fit>
  </Shell>
);

const InstallCodex: Page = () => (
  <Shell chapter={3} source={<span>{'官方安裝說明 learn.chatgpt.com/docs/codex/cli'}</span>}>
    <Eyebrow><span>步驟 3／7｜依你的作業系統，選一行執行</span></Eyebrow>
    <Heading><span>直接安裝 Codex</span></Heading>
    <Lead><span>不需要先裝 Node.js 或 npm</span></Lead>
    <Fit>
      <div style={{ display: 'grid', gap: 28 }}>
        <In i={0}>
          <Terminal title={<span>Mac／Linux｜貼進終端機，按 Enter</span>} size={32}>
            <span>curl -fsSL https://chatgpt.com/codex/install.sh | sh</span>
          </Terminal>
        </In>
        <In i={1}>
          <Terminal title={<span>Windows｜貼進 PowerShell，按 Enter</span>} size={32}>
            <span>irm https://chatgpt.com/codex/install.ps1 | iex</span>
          </Terminal>
        </In>
        <In i={2}>
          <div style={{ padding: '22px 28px', background: surface, borderLeft: `5px solid ${amber}`, fontSize: 32, lineHeight: 1.5 }}>
            <div>裝好後，重開終端機或 PowerShell，輸入 <Path size={32}>codex --version</Path></div>
            <div style={{ marginTop: 8, color: muted }}>看到版本號就成功，先不用打 <Path size={32}>codex</Path></div>
            <div style={{ marginTop: 8, fontSize: 26, color: quiet }}><span>出現 command not found？看附錄第 </span>{pageOf(PathFixMac)}<span>–</span>{pageOf(InstallErrors)}<span> 頁</span></div>
          </div>
        </In>
      </div>
    </Fit>
  </Shell>
);

const CdFolder: Page = () => (
  <Shell chapter={3}>
    <Eyebrow><span>步驟 5／7｜cd＝換到別的資料夾</span></Eyebrow>
    <Heading><span>用 cd 走進練習資料夾</span></Heading>
    <Lead><span>Codex 只在你所在的資料夾裡讀檔、存檔</span></Lead>
    <Fit>
      <div style={{ display: 'grid', gridTemplateColumns: '1072px 1fr', gap: 44, alignItems: 'center' }}>
        <In i={0}>
          <Terminal title={<span>{"終端機（Mac 示意）"}</span>} size={26}>
            <div style={{ whiteSpace: 'pre' }}>
              <TermRow><Dim><span>{'you@MacBook ~ %'}</span></Dim><Typed><span>{'cd'}</span></Typed><span>{'/Users/you/Downloads/aw-01-lab/Codex_練習'}</span><TermDot n={1} /></TermRow>
              <TermRow cue={1}><Dim><span>{'you@MacBook '}</span></Dim><HotLine><span>{'Codex_練習'}</span></HotLine><Dim><span>{' %'}</span></Dim><TermDot n={2} /><span className="aw1-cue" data-cue={2} style={{ display: 'inline-flex', alignItems: 'center', gap: 14 }}><Typed><span>{'ls'}</span></Typed></span></TermRow>
              <TermRow cue={2}><HotLine><span>{'原文'}</span></HotLine><span>{'  回目.md'}</span><TermDot n={3} /></TermRow>
            </div>
          </Terminal>
        </In>
        <div style={{ display: 'grid', gap: 30 }}>
          <In i={1}><Callout n={<span>{1}</span>} title={<span>打 cd 和空格，拖進資料夾</span>} detail={<span>拖 Codex_練習，再按 Enter</span>} /></In>
          <Steps>
            <Step duration={STEP_MS}><Cue n={1}><Callout n={<span>{2}</span>} title={<span>提示字元變成 Codex_練習</span>} detail={<span>Windows：<Path size={27}><span>{'PS …\\Codex_練習>'}</span></Path></span>} /></Cue></Step>
            <Step duration={STEP_MS}><Cue n={2}><Callout n={<span>{3}</span>} title={<span>打 ls，看得到 原文 就對了</span>} detail={<span>看到 Codex_練習？再 cd 一次</span>} /></Cue></Step>
          </Steps>
        </div>
      </div>
    </Fit>
  </Shell>
);

// A browser window around a screenshot; url is shown in the address bar.
const BrowserFrame = ({ url, children }: { url: ReactNode; children: ReactNode }) => (
  <div style={{ background: '#FFFFFF', border: `1px solid ${rule}`, boxShadow: '0 10px 30px rgba(28,25,23,0.08)' }}>
    <div style={{ height: 52, display: 'flex', alignItems: 'center', gap: 12, background: surface, borderBottom: `1px solid ${rule}`, padding: '0 22px' }}>
      <span style={{ width: 13, height: 13, borderRadius: 20, background: '#DF6A63' }} />
      <span style={{ width: 13, height: 13, borderRadius: 20, background: '#E9B650' }} />
      <span style={{ width: 13, height: 13, borderRadius: 20, background: '#73BB78' }} />
      <span style={{ flex: 1, marginLeft: 10, background: '#FFFFFF', border: `1px solid ${rule}`, borderRadius: 18, padding: '3px 18px', fontFamily: mono, fontSize: 22, color: muted }}>{url}</span>
    </div>
    {children}
  </div>
);

const CodexLogin: Page = () => (
  <Shell chapter={3} source={<span>{'Codex CLI 0.154.0 實際畫面文字｜developers.openai.com/codex/cli'}</span>}>
    <Eyebrow><span>步驟 6／7｜在練習資料夾打 codex，按 Enter</span></Eyebrow>
    <Heading><span>用 ChatGPT 帳號登入 Codex</span></Heading>
    <Fit>
      <div style={{ display: 'grid', gridTemplateColumns: '940px 1fr', gap: 52, alignItems: 'center' }}>
        <In i={0}>
          <Terminal title={<span>{"終端機"}</span>} size={26}>
            <Dim><span>{'you@MacBook Codex_練習 %'}</span></Dim><Typed><span>{' codex'}</span></Typed><span>{'\n'}</span>
            <span>{"  Welcome to Codex, OpenAI's command-line coding agent\n\n"}</span>
            <HotLine><span>{'> 1. Sign in with ChatGPT'}</span></HotLine><span>{'\n'}</span>
            <Dim><span>{'  2. Sign in with Device Code\n  3. Provide your own API key\n\n'}</span></Dim>
            <span>{'  Press enter to continue'}</span>
            <CueSpan n={2}><Dim><span>{'\n  ─────────── 登入之後 ───────────\n'}</span></Dim><Typed><span>{'  ✓ Signed in with your ChatGPT account'}</span></Typed><span>{'\n  Press enter to continue'}</span></CueSpan>
          </Terminal>
        </In>
        <div style={{ display: 'grid', gap: 26 }}>
          <In i={1}><Callout n={<span>{1}</span>} title={<span>選 1，按 Enter</span>} detail={<Path size={27}><span>Sign in with ChatGPT</span></Path>} /></In>
          <Steps>
            <Step duration={STEP_MS}><Cue n={1}>
              <div style={{ display: 'grid', gap: 18 }}>
                <Callout n={<span>{2}</span>} title={<span>瀏覽器跳出來，登入 ChatGPT</span>} detail={<span>看到這頁就能關掉，不用按 Open Codex</span>} />
                <BrowserFrame url={<span>{"localhost:1455/success"}</span>}><img src={loginSuccess} alt="Codex 登入成功頁：You’re signed in and may close this tab" style={{ width: '100%', display: 'block' }} /></BrowserFrame>
              </div>
            </Cue></Step>
            <Step duration={STEP_MS}><Cue n={2}><Callout n={<span>{3}</span>} title={<span>回到終端機，再按 Enter</span>} detail={<span>出現 ✓ 就是登入成功</span>} /></Cue></Step>
          </Steps>
        </div>
      </div>
    </Fit>
  </Shell>
);

// Which answer to give the trust question, depending on the folder Codex was opened in.
const TrustCard = ({ when, path, pick, ok }: { when: ReactNode; path: ReactNode; pick: ReactNode; ok: boolean }) => (
  <div style={{ background: ok ? sage : amberSoft, borderTop: `5px solid ${ok ? okGreen : amber}`, padding: '22px 30px 26px' }}>
    <div style={{ fontSize: 32, fontWeight: 600 }}>{when}</div>
    <div style={{ marginTop: 8, fontSize: 26, color: muted }}>{path}</div>
    <div style={{ marginTop: 16 }}><StatusLine ok={ok} size={32}>{pick}</StatusLine></div>
  </div>
);

const CodexTrust: Page = () => (
  <Shell chapter={3} source={<span>{'Codex CLI 0.154.0 實際畫面文字｜developers.openai.com/codex/cli'}</span>}>
    <Eyebrow><span>步驟 7／7｜登入之後，它會問這一題</span></Eyebrow>
    <Heading><span>確認資料夾，再選信任</span></Heading>
    <Fit>
      <div style={{ display: 'grid', gridTemplateColumns: '880px 1fr', gap: 52, alignItems: 'center' }}>
        <In i={0}>
          <Terminal title={<span>{"終端機"}</span>} size={28}>
            <span>{'> You are in '}</span><HotLine><span>{'…/aw-01-lab/Codex_練習'}</span></HotLine><span>{'\n\n'}</span>
            <span>{'  Do you trust the contents of\n  this directory?\n\n'}</span>
            <span>{'› '}</span><Ring n={1} inline><span>{'1. Yes, continue'}</span></Ring><span>{'\n  '}</span><Ring n={2} inline><span>{'2. No, quit'}</span></Ring><span>{'\n\n'}</span>
            <Dim><span>{'  Press enter to continue'}</span></Dim>
          </Terminal>
        </In>
        <div style={{ display: 'grid', gap: 28 }}>
          <In i={1}><Callout n={<span>{1}</span>} title={<span>You are in：Codex 在哪個資料夾</span>} detail={<span>要是剛才 cd 進去的那個</span>} /></In>
          <Steps>
            <Step duration={STEP_MS}><Cue n={1}><TrustCard ok when={<span>結尾是 Codex_練習</span>} path={<Path size={26}><span>{'…/aw-01-lab/Codex_練習'}</span></Path>} pick={<span>直接按 Enter：1. Yes, continue</span>} /></Cue></Step>
            <Step duration={STEP_MS}><Cue n={2}><TrustCard ok={false} when={<span>只有 /Users/you：忘了 cd</span>} path={<Path size={26}><span>{'/Users/you　C:\\Users\\you'}</span></Path>} pick={<span>按 ↓ 選 2. No, quit，回去 cd</span>} /></Cue></Step>
          </Steps>
        </div>
      </div>
    </Fit>
  </Shell>
);

// ---------- 04 看懂 Codex ----------

const Section4: Page = () => <SectionPage chapter={4} title={<span>{"看懂 Codex"}</span>} label={<span>{"04 / CODEX CLI"}</span>} lead="啟動畫面、Session、/status、Memory" />;

const StartScreen: Page = () => (
  <Shell chapter={4} source={<span>{'Codex CLI 文件 developers.openai.com/codex/cli'}</span>}>
    <Eyebrow><span>打開 Codex 第一眼</span></Eyebrow>
    <Heading><span>讀懂 Codex 啟動畫面</span></Heading>
    <Fit>
      <div style={{ display: 'grid', gridTemplateColumns: '1000px 1fr', gap: 64, alignItems: 'center' }}>
        <In i={0}>
          <Shot src={codexStart} alt="Codex 0.154.0 啟動畫面：model 與 directory 兩個欄位，下方是輸入列" crop={[130, 340, 920, 420]} width={1000}>
            <RowMark top={150} height={46} width={960} n={<span>1</span>} badge={false} />
            <RowMark top={202} height={46} width={960} n={<span>2</span>} badge={false} />
            <RowMark top={355} height={46} width={500} n={<span>3</span>} badge={false} />
          </Shot>
          <Caption><span>教材範例｜路徑是講師的另一個資料夾，你的會是 Codex_練習</span></Caption>
        </In>
        <div style={{ display: 'grid', gap: 40 }}>
          <Steps>
            <Step duration={STEP_MS}><Cue n={1}><Callout n={<span>{1}</span>} title={<><Path size={32}><span>model</span></Path><span>：用哪個模型</span></>} detail="名稱會變，不用背" /></Cue></Step>
            <Step duration={STEP_MS}><Cue n={2}><Callout n={<span>{2}</span>} title={<><Path size={32}><span>directory</span></Path><span>：在哪個資料夾</span></>} detail="它在這裡讀檔、存檔" /></Cue></Step>
            <Step duration={STEP_MS}><Cue n={3}><Callout n={<span>{3}</span>} title={<><Path size={32}><span>›</span></Path><span> 後面：打字的地方</span></>} detail="中文直接打" /></Cue></Step>
          </Steps>
        </div>
      </div>
    </Fit>
  </Shell>
);

const DeskCard = ({ x, y, kind, label, eg }: { x: number; y: number; kind: IconKind; label: ReactNode; eg: ReactNode }) => (
  <g>
    <rect x={x} y={y} width="420" height="120" fill={surface} stroke={rule} strokeWidth="2" />
    <SvgIcon kind={kind} x={x + 62} y={y + 60} size={56} color={amber} />
    <text x={x + 116} y={y + 52} fontSize="32" fontWeight="600" fill={ink}>{label}</text>
    <text x={x + 116} y={y + 94} fontSize="26" fill={muted}>{eg}</text>
  </g>
);

const SessionDesk: Page = () => (
  <Shell chapter={4}>
    <Eyebrow><span>Session＝一次工作階段</span></Eyebrow>
    <Heading><span>Session（工作階段）</span></Heading>
    <Lead><span>像一張工作桌：桌上的東西它都看得到</span></Lead>
    <Fit>
      <Stage h={400}>
        <Steps>
          <Layer h={400} label="Session 1 的桌上：你的任務、讀過的檔案、它的回答、你的追問">
            <rect x="0" y="10" width="940" height="380" fill="#FFFFFF" stroke={ink} strokeWidth="2" />
            <text x="32" y="62" fontSize="32" fontWeight="600" fill={ink}>Session 1</text>
            <InG i={0}><DeskCard x={32} y={92} kind="chat" label={<tspan>{"你的任務"}</tspan>} eg={<tspan>{"寫第 1 回大綱"}</tspan>} /></InG>
            <InG i={1}><DeskCard x={488} y={92} kind="doc" label={<tspan>{"讀過的檔案"}</tspan>} eg={<tspan>{"原文/第001回.txt"}</tspan>} /></InG>
            <InG i={2}><DeskCard x={32} y={236} kind="ok" label={<tspan>{"它的回答"}</tspan>} eg={<tspan>{"一段大綱草稿"}</tspan>} /></InG>
            <InG i={3}><DeskCard x={488} y={236} kind="search" label={<tspan>{"你的追問"}</tspan>} eg={<tspan>{"「剛剛那段改短」"}</tspan>} /></InG>
          </Layer>
          <Step duration={STEP_MS}><Layer h={400} label="輸入 /new 開新 Session，新的桌子是空的">
            <MapArrow x1={956} x2={1076} y={200} hot />
            <text x="1016" y="176" textAnchor="middle" fontSize="30" fontFamily={mono} fill={amber}>/new</text>
            <rect x="1092" y="10" width="540" height="380" fill="none" stroke={faint} strokeWidth="2" strokeDasharray="12 10" />
            <text x="1124" y="62" fontSize="32" fontWeight="600" fill={quiet}>Session 2</text>
            <text x="1362" y="190" textAnchor="middle" fontSize="44" fill={quiet}>空的</text>
            <text x="1362" y="242" textAnchor="middle" fontSize="28" fill={muted}>問「剛剛那段」</text>
            <text x="1362" y="282" textAnchor="middle" fontSize="28" fill={muted}>它不知道是哪段</text>
          </Layer></Step>
        </Steps>
      </Stage>
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={40}><span>同一件事，留在同一個 Session</span></Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

const STATUS_COLS = '250px 1fr';

const StatusPage: Page = () => (
  <Shell chapter={4} source={<span>{'Codex 斜線指令 developers.openai.com/codex/cli/slash-commands'}</span>}>
    <Eyebrow><span>指令｜在 Codex 裡輸入 /status</span></Eyebrow>
    <Heading><span>用 /status 確認 Directory</span></Heading>
    <Fit>
      <div style={{ display: 'grid', gridTemplateColumns: '780px 1fr', gap: 56, alignItems: 'center' }}>
        <In i={0}>
          <Shot src={codexStatus} alt="Codex /status 的輸出，只標出 Directory 這一行，其他欄位變暗" crop={[130, 330, 905, 480]} width={780}>
            <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 88, background: 'rgba(31,34,38,0.74)' }} />
            <div style={{ position: 'absolute', left: 0, right: 0, top: 126, bottom: 0, background: 'rgba(31,34,38,0.74)' }} />
            <RowMark top={88} height={38} width={768} />
          </Shot>
          <Caption><span>教材範例｜你的 Directory 會是自己的資料夾</span></Caption>
        </In>
        <div>
          <Steps>
            <Step duration={STEP_MS}>
              <div style={{ background: amberSoft, borderLeft: `6px solid ${amber}`, padding: '26px 30px' }}>
                <span style={{ background: amber, color: '#FFFFFF', fontSize: 24, fontWeight: 600, padding: '4px 14px' }}>今天必看</span>
                <div style={{ fontFamily: mono, fontSize: 44, fontWeight: 700, marginTop: 18 }}>Directory</div>
                <div style={{ fontSize: 34, marginTop: 10 }}>它在哪個資料夾工作</div>
                <div style={{ fontSize: 28, color: muted, marginTop: 10 }}>結尾要是你的練習資料夾</div>
              </div>
            </Step>
            <Step duration={STEP_MS}>
              <div style={{ fontSize: 27, color: quiet, marginTop: 26, lineHeight: 1.6 }}><span>其他欄位先知道就好：</span><br /><Path size={26}><span>Model</span></Path><span> 模型・</span><Path size={26}><span>Permissions</span></Path><span> 改檔權限・</span><Path size={26}><span>Session</span></Path><span> 編號</span></div>
            </Step>
          </Steps>
        </div>
      </div>
      <Steps><Step duration={STEP_MS}><Takeaway><span>動手前，先看 Directory 對不對</span></Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

const UsageBar = ({ y, label, pct, i = 0 }: { y: number; label: ReactNode; pct: number; i?: number }) => {
  const live = useIsActivePage();
  return (
    <g>
      <text x="0" y={y} fontSize="31" fill={ink}>{label}</text>
      <rect x="0" y={y + 20} width="700" height="50" fill={surface} stroke={rule} strokeWidth="2" />
      <rect x="0" y={y + 20} width={7 * pct} height="50" fill="#8CCB9B" className={live ? 'aw1-fill' : undefined} style={live ? { animationDelay: enterDelay(i, 360), animationDuration: `${BAR_MS}ms` } : undefined} />
      <text x="690" y={y} textAnchor="end" fontSize="26" fill={okGreen}><tspan>還剩 </tspan>{pct}<tspan>%（示意）</tspan></text>
    </g>
  );
};

const TokTile = ({ x, w, label, tint }: { x: number; w: number; label: ReactNode; tint: string }) => (
  <g><rect x={x} y={150} width={w} height="76" fill={tint} stroke="#FFFFFF" strokeWidth="3" /><text x={x + w / 2} y={202} textAnchor="middle" fontSize="38" fill={ink}>{label}</text></g>
);

const UsageToken: Page = () => (
  <Shell chapter={4} source={<span>{'Codex 方案與額度 developers.openai.com/codex/pricing'}</span>}>
    <Eyebrow><span>Usage 與 Token｜簡單分清楚</span></Eyebrow>
    <Heading><span>Usage（額度）與 Token</span></Heading>
    <Lead><span>像手機方案：月租額度，和用掉的流量</span></Lead>
    <Fit>
      <Stage h={480}>
        <Steps>
          <Layer h={480} label="Usage：帳號這段時間還能用多少，/status 最下面兩行">
            <InG i={0}>
              <text x="0" y="50" fontSize="46" fontWeight="600" fill={ink}>Usage</text>
              <text x="0" y="98" fontSize="29" fill={muted}>帳號這段時間還能用多少</text>
            </InG>
            <InG i={1}><UsageBar y={170} label={<tspan>{"5 小時額度"}</tspan>} pct={74} i={1} /></InG>
            <InG i={2}><UsageBar y={290} label={<tspan>{"每週額度"}</tspan>} pct={53} i={2} /></InG>
            <InG i={3}><text x="0" y="430" fontSize="27" fill={quiet}>就是 /status 最下面兩行</text></InG>
          </Layer>
          <Step duration={STEP_MS}><Layer h={480} label="Token：AI 讀寫文字的單位；提示詞、讀到的檔案、前面的對話都算">
            <line x1="820" y1="10" x2="820" y2="470" stroke={rule} strokeWidth="2" />
            <text x="900" y="50" fontSize="46" fontWeight="600" fill={ink}>Token</text>
            <text x="900" y="98" fontSize="29" fill={muted}>AI 讀寫文字的單位（切法示意）</text>
            <g className="aw1-build" style={buildDelay(0)}>
              <TokTile x={900} w={150} label={<tspan>{"今天"}</tspan>} tint={amberSoft} />
              <TokTile x={1050} w={150} label={<tspan>{"天氣"}</tspan>} tint={blueSoft} />
              <TokTile x={1200} w={100} label={<tspan>{"很"}</tspan>} tint={sage} />
              <TokTile x={1300} w={100} label={<tspan>{"好"}</tspan>} tint={amberSoft} />
              <TokTile x={1400} w={100} label={<tspan>{"。"}</tspan>} tint={blueSoft} />
            </g>
            <g className="aw1-build" style={buildDelay(1)}>
              <SvgChip x={900} y={290} w={220} h={64} label={<tspan>{"你的提示詞"}</tspan>} size={28} />
              <text x="1140" y="334" textAnchor="middle" fontSize="36" fill={faint}>＋</text>
              <SvgChip x={1160} y={290} w={220} h={64} label={<tspan>{"讀到的檔案"}</tspan>} size={28} fill={amberSoft} stroke={amber} />
              <text x="1400" y="334" textAnchor="middle" fontSize="36" fill={faint}>＋</text>
              <SvgChip x={1420} y={290} w={212} h={64} label={<tspan>{"前面的對話"}</tspan>} size={28} />
              <text x="1266" y="430" textAnchor="middle" fontSize="30" fontWeight="600" fill={amber}>＝這次用掉的 Token</text>
            </g>
          </Layer></Step>
        </Steps>
      </Stage>
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={24}><span>讀的檔越多，Token 越多，額度用得越快</span></Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

const SessionBox = ({ x, title, children }: { x: number; title: ReactNode; children: ReactNode }) => (
  <g>
    <rect x={x} y="40" width="540" height="170" fill="#FFFFFF" stroke={ink} strokeWidth="2" />
    <text x={x + 28} y="88" fontSize="30" fontWeight="600" fill={ink}>{title}</text>
    {children}
  </g>
);

const MemoryLayers: Page = () => (
  <Shell chapter={4} source={<span>{'Codex 文件：AGENTS.md developers.openai.com/codex/guides/agents-md；agents.md'}</span>}>
    <Eyebrow><span>Memory＝留下來的上下文</span></Eyebrow>
    <Heading><span>Memory 的兩層</span></Heading>
    <Lead><span>像口頭交代，和貼在牆上的公告</span></Lead>
    <Fit>
      <Stage h={460}>
        <Steps>
          <Layer h={460} label="Session 內的記憶：在 Session 1 說的規則，到了 Session 2 就不見了">
            <text x="0" y="24" fontSize="26" fontWeight="600" fill={quiet} letterSpacing="2">第一層｜Session 內的記憶</text>
            <InG i={0}><SessionBox x={80} title={<tspan>{"Session 1"}</tspan>}>
              <SvgChip x={108} y={118} w={484} h={60} label={<tspan>{"規則：只根據 原文/ 回答"}</tspan>} size={27} fill={amberSoft} stroke={amber} />
            </SessionBox></InG>
            <InG i={1}><MapArrow x1={636} x2={1004} y={125} />
              <text x="820" y="108" textAnchor="middle" fontSize="28" fontFamily={mono} fill={muted}>/new</text></InG>
            <InG i={2}><SessionBox x={1012} title={<tspan>{"Session 2"}</tspan>}>
              <AskMark x={1064} y={148} r={24} />
              <text x="1104" y="158" fontSize="30" fill={amber}>規則不見了</text>
            </SessionBox></InG>
          </Layer>
          <Step duration={STEP_MS}><Layer h={460} label="專案裡的記憶：AGENTS.md 寫在資料夾裡，每個 Session 開始都會讀">
            <text x="0" y="290" fontSize="26" fontWeight="600" fill={amber} letterSpacing="2">第二層｜專案裡的記憶</text>
            <g fill="none" stroke={okGreen} strokeWidth="4">
              <StepPath d="M720 330 C560 330 360 300 350 214" i={0} />
              <StepPath d="M912 330 C1072 330 1272 300 1282 214" i={1} />
            </g>
            <g className="aw1-build" style={buildDelay(0)}>
              <DocShape x={646} y={290} w={340} h={160} fill={amberSoft} stroke={amber} sw={3} />
              <text x="816" y="364" textAnchor="middle" fontSize="36" fontFamily={mono} fontWeight="600" fill={ink}>AGENTS.md</text>
              <text x="816" y="412" textAnchor="middle" fontSize="26" fill={muted}>每次開都會讀</text>
            </g>
            <g className="aw1-build" style={buildDelay(3)}>
              <rect x="1036" y="114" width="480" height="76" fill="#FFFFFF" />
              <OkDot x={1064} y={150} r={24} />
              <text x="1104" y="160" fontSize="30" fill={okGreen}>讀了檔案，照規則做</text>
            </g>
          </Layer></Step>
        </Steps>
      </Stage>
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={28}><span>聊天只留在這個 Session；AGENTS.md 只管這個資料夾</span></Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

const TreeRow = ({ y, kind, name, hot = false }: { y: number; kind: IconKind; name: ReactNode; hot?: boolean }) => (
  <g>
    {hot ? <rect x="40" y={y - 34} width="380" height="60" fill={amberSoft} stroke={amber} strokeWidth="2" /> : null}
    <SvgIcon kind={kind} x={84} y={y - 4} size={38} color={hot ? amber : muted} />
    <text x="118" y={y + 7} fontSize="31" fontFamily={kind === 'folder' ? undefined : mono} fontWeight={hot ? 700 : 400} fill={ink}>{name}</text>
  </g>
);

const SessionReads = ({ y, n }: { y: number; n: ReactNode }) => (
  <g>
    <rect x="1190" y={y} width="442" height="100" fill="#FFFFFF" stroke={ink} strokeWidth="2" />
    <text x="1220" y={y + 60} fontSize="31" fontWeight="600" fill={ink}><tspan>Session </tspan>{n}</text>
    <OkDot x={1414} y={y + 50} r={20} />
    <text x="1444" y={y + 60} fontSize="27" fill={okGreen}>先讀規則</text>
  </g>
);

const AgentsFile: Page = () => (
  <Shell chapter={4} source={<span>{'Codex 文件：AGENTS.md developers.openai.com/codex/guides/agents-md；agents.md'}</span>}>
    <Eyebrow><span>專案裡的記憶</span></Eyebrow>
    <Heading><span>AGENTS.md 是給 Codex 的規則檔</span></Heading>
    <Fit>
      <Stage h={460}>
        <Steps>
          <Layer h={460} label="Codex_練習 資料夾裡的 AGENTS.md，內容是三條規則（示意）">
            <InG i={0}>
              <rect x="0" y="20" width="460" height="420" fill={surface} />
              <SvgIcon kind="folder" x={52} y={74} size={44} color={amber} />
              <text x="88" y="86" fontSize="32" fontWeight="600" fill={ink}>Codex_練習/</text>
              <TreeRow y={170} kind="folder" name={<tspan>{"原文/"}</tspan>} />
              <TreeRow y={260} kind="doc" name={<tspan>{"回目.md"}</tspan>} />
              <TreeRow y={350} kind="doc" name={<tspan>{"AGENTS.md"}</tspan>} hot />
            </InG>
            <InG i={1}><MapArrow x1={470} x2={540} y={350} hot /></InG>
            <InG i={2}>
              <DocShape x={556} y={40} w={540} h={400} fill="#FFFFFF" stroke={amber} sw={3} />
              <text x="590" y="100" fontSize="32" fontFamily={mono} fontWeight="600" fill={ink}>AGENTS.md</text>
              <line x1="590" y1="124" x2="1060" y2="124" stroke={rule} strokeWidth="2" />
              <text x="590" y="184" fontSize="30" fill={ink}>回答三國問題時：</text>
              <text x="590" y="240" fontSize="30" fill={ink}>・只根據 原文/ 的文字</text>
              <text x="590" y="296" fontSize="30" fill={ink}>・找不到就說找不到</text>
              <text x="590" y="352" fontSize="30" fill={ink}>・寫出出處（第幾回）</text>
              <text x="590" y="414" fontSize="24" fill={quiet}>內容示意</text>
            </InG>
          </Layer>
          <Step duration={STEP_MS}><Layer h={460} label="每個 Session 一開始都先讀這個檔">
            <g fill="none" stroke={okGreen} strokeWidth="4">
              <StepPath d="M1100 240 C1140 240 1150 100 1190 100" i={0} />
              <StepPath d="M1100 240 H1190" i={1} />
              <StepPath d="M1100 240 C1140 240 1150 380 1190 380" i={2} />
            </g>
            <g className="aw1-build" style={buildDelay(2)}><SessionReads y={50} n={<tspan>{1}</tspan>} /></g>
            <g className="aw1-build" style={buildDelay(3)}><SessionReads y={190} n={<tspan>{2}</tspan>} /></g>
            <g className="aw1-build" style={buildDelay(4)}><SessionReads y={330} n={<tspan>{3}</tspan>} /></g>
          </Layer></Step>
        </Steps>
      </Stage>
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={32}><span>它就是普通的文字檔，打開就能改</span></Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

// ---------- 05 用 Codex 寫大綱 ----------

const Section5: Page = () => <SectionPage chapter={5} title={<span>{"用 Codex 寫大綱"}</span>} label={<span>{"05 / 實作"}</span>} lead="只看原文，寫出前 21 回的大綱" />;

const LabRow = ({ y, kind, name, note, indent = 0, hot = false }: { y: number; kind: IconKind; name: ReactNode; note: ReactNode; indent?: number; hot?: boolean }) => {
  const x = 120 + indent;
  return (
    <g>
      {hot ? <rect x={x + 74} y={y - 32} width={1250 - x} height="64" fill={amberSoft} stroke={amber} strokeWidth="2" /> : null}
      <line x1={x} y1={y} x2={x + 70} y2={y} stroke={faint} strokeWidth="3" />
      <SvgIcon kind={kind} x={x + 106} y={y} size={46} color={kind === 'folder' ? amber : muted} />
      <text x={x + 146} y={y + 12} fontSize="34" fontFamily={mono} fontWeight="600" fill={ink}>{name}</text>
      <text x="760" y={y + 12} fontSize="30" fontWeight={hot ? 600 : 400} fill={hot ? amber : muted}>{note}</text>
    </g>
  );
};

const DownloadLab: Page = () => (
  <Shell chapter={3}>
    <Eyebrow><span>步驟 4／7｜練習資料夾｜維基文庫原文，公有領域</span></Eyebrow>
    <Heading><span>下載練習資料夾 aw-01-lab</span></Heading>
    <In i={0} style={{ marginTop: 30, display: 'flex', alignItems: 'center', gap: 28 }}>
      <a href={LAB_ZIP_URL} target="_blank" rel="noreferrer" aria-label="下載 aw-01-lab.zip"><img src={labQr} alt="aw-01-lab.zip 的下載 QR code" style={{ width: 150, height: 150, display: 'block', background: '#FFFFFF', border: `1px solid ${rule}`, padding: 6 }} /></a>
      <div style={{ display: 'grid', gap: 12 }}>
        <span style={{ fontSize: 32, fontWeight: 600 }}>掃碼，或按下面的按鈕下載 ZIP</span>
        <a href={LAB_ZIP_URL} download="aw-01-lab.zip" style={{ justifySelf: 'start', display: 'inline-flex', alignItems: 'center', gap: 12, background: amber, color: '#FFFFFF', padding: '10px 24px', fontSize: 28, fontWeight: 600, textDecoration: 'none' }}><Icon kind="down" size={34} color="#FFFFFF" /><span>下載 aw-01-lab.zip</span></a>
        <a href={LAB_ZIP_URL} target="_blank" rel="noreferrer" style={{ fontSize: 26, lineHeight: 1.4, color: amber, textDecoration: 'underline', textUnderlineOffset: 4 }}>{LAB_ZIP_URL}</a>
      </div>
    </In>
    <Fit>
      <Figure h={470} label="aw-01-lab 裡有：ChatGPT_練習（練習 1 參考結果）、Codex_練習（原文資料夾和回目.md，今天打開 Codex 的地方）、prompts.md、README.md">
        <InG i={1}>
          <SvgIcon kind="folder" x={120} y={40} size={64} color={amber} />
          <text x="170" y="54" fontSize="40" fontWeight="600" fill={ink}>aw-01-lab/</text>
          <line x1="120" y1="78" x2="120" y2="440" stroke={faint} strokeWidth="3" />
        </InG>
        <InG i={2}><LabRow y={120} kind="folder" name={<tspan>{"ChatGPT_練習/"}</tspan>} note={<tspan>{"練習 1 參考結果，課後自己練"}</tspan>} /></InG>
        <InG i={3}>
          <LabRow y={195} kind="folder" name={<tspan>{"Codex_練習/"}</tspan>} note={<tspan>{"今天在這裡打開 Codex"}</tspan>} hot />
          <line x1="226" y1="228" x2="226" y2="325" stroke={faint} strokeWidth="3" />
          <LabRow y={265} indent={106} kind="folder" name={<tspan>{"原文/"}</tspan>} note={<tspan>{"第 1–21 回全文，一回一檔"}</tspan>} />
          <LabRow y={325} indent={106} kind="doc" name={<tspan>{"回目.md"}</tspan>} note={<tspan>{"21 回的回目清單"}</tspan>} />
        </InG>
        <InG i={4}><LabRow y={385} kind="doc" name={<tspan>{"prompts.md"}</tspan>} note={<tspan>{"兩個練習的提示詞"}</tspan>} /></InG>
        <InG i={5}><LabRow y={440} kind="doc" name={<tspan>{"README.md"}</tspan>} note={<tspan>{"資料夾說明"}</tspan>} /></InG>
      </Figure>
    </Fit>
  </Shell>
);

const OpenLab: Page = () => (
  <Shell chapter={5}>
    <PracticeEyebrow time={<span>{"3 分鐘"}</span>}><span>練習 2-1｜Codex</span></PracticeEyebrow>
    <Heading><span>練習（/status）：確認資料夾對不對</span></Heading>
    <Fit z={1.08}>
      <div style={{ display: 'grid', gridTemplateColumns: '1060px 1fr', gap: 56, alignItems: 'center' }}>
        <In i={0}>
          {/* The terminal lines appear with the cues of the steps on the right, so command, output and check alternate. */}
          <Terminal title={<span>{"終端機（示意，路徑依電腦而定）"}</span>} size={30}>
            <Typed><span>$</span></Typed><span>{' cd '}</span><Dim><span>{'〔打空格，再把 Codex_練習 資料夾拖進來〕\n'}</span></Dim>
            <CueSpan n={1}><Typed><span>$</span></Typed><span>{' ls\n'}</span></CueSpan>
            <CueSpan n={1} delay={260}><HotLine><span>原文</span></HotLine><span>{'  '}</span><HotLine><span>回目.md</span></HotLine><span>{'\n'}</span></CueSpan>
            <CueSpan n={2}><Typed><span>$</span></Typed><span>{' codex\n'}</span><AskLine><span>{'› /status\n'}</span></AskLine></CueSpan>
            <CueSpan n={2} delay={260}><span>{'Directory:    '}</span><HotLine><span>~/…/Codex_練習</span></HotLine></CueSpan>
          </Terminal>
        </In>
        <div style={{ display: 'grid' }}>
          <Steps>
            <Step duration={STEP_MS}><Cue n={1} /></Step>
            <Step duration={STEP_MS}>
              <div style={{ display: 'grid', gap: 30 }}>
                <div className="aw1-build" style={{ ...buildDelay(0), background: sage, padding: '22px 26px' }}><StatusLine ok size={32}><span>ls 看得到 原文</span></StatusLine><div style={{ fontSize: 28, marginTop: 10, marginLeft: 50 }}><span>再打 </span><Path size={28}><span>codex</span></Path></div></div>
                <div className="aw1-build" style={{ ...buildDelay(1), background: amberSoft, padding: '22px 26px' }}><StatusLine ok={false} size={32}><span>看到 Codex_練習</span></StatusLine><div style={{ fontSize: 28, marginTop: 10, marginLeft: 50 }}><span>還在外層：</span><Path size={28}><span>cd Codex_練習</span></Path></div></div>
              </div>
            </Step>
            <Step duration={STEP_MS}><Cue n={2} /></Step>
            <Step duration={STEP_MS}><div style={{ background: sage, padding: '22px 26px', marginTop: 30 }}><StatusLine ok size={32}><span>Directory 結尾對</span></StatusLine><div style={{ fontSize: 28, marginTop: 10, marginLeft: 50 }}>可以開始了</div></div></Step>
          </Steps>
        </div>
      </div>
    </Fit>
  </Shell>
);

// One desk (Session) in the memory practice: what you ask, and what Codex answers.
const AskDesk = ({ y, title, h, children }: { y: number; title: ReactNode; h: number; children: ReactNode }) => (
  <g>
    <rect x="640" y={y} width="992" height="228" fill="#FFFFFF" stroke={ink} strokeWidth="2" />
    <text x="668" y={y + 46} fontSize="30" fontWeight="600" fill={ink}>{title}</text>
    <rect x="668" y={y + 68} width="620" height={h} fill={term} />
    {children}
  </g>
);

// Practice 2-2, step 1: students make AGENTS.md themselves in a plain text editor.
const EditorCard = ({ os, app, steps }: { os: ReactNode; app: ReactNode; steps: ReactNode }) => (
  <div style={{ background: surface, borderTop: `5px solid ${amber}`, padding: '22px 34px 30px', height: '100%', boxSizing: 'border-box' }}>
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 18 }}><span style={{ fontSize: 40, fontWeight: 600 }}>{os}</span><span style={{ fontSize: 30, color: amber, fontWeight: 600 }}>{app}</span></div>
    <div style={{ display: 'grid', gap: 10, marginTop: 18 }}>{steps}</div>
  </div>
);

const AgentsByHand: Page = () => (
  <Shell chapter={5}>
    <PracticeEyebrow time={<span>{"5 分鐘"}</span>}><span>練習 2-2｜第 1 步｜文字編輯器</span></PracticeEyebrow>
    <Heading><span>練習（Memory）：自己建 AGENTS.md</span></Heading>
    <Lead><span>它是普通的文字檔，貼上 prompts.md 的三行規則</span></Lead>
    <Fit>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48 }}>
        <In i={0}>
          <EditorCard os={<span>Mac</span>} app={<span>文字編輯</span>} steps={<>
            <OpenStep n={1} size={30}><span>打開「文字編輯」，新增文件</span></OpenStep>
            <OpenStep n={2} size={30}><span>格式 → 製作純文字</span></OpenStep>
            <OpenStep n={3} size={30}><span>貼上規則，按</span><Key><span>⌘ S</span></Key></OpenStep>
            <OpenStep n={4} size={30}><span>存進 Codex_練習，選「使用 .md」</span></OpenStep>
          </>} />
        </In>
        <In i={1}>
          <EditorCard os={<span>Windows</span>} app={<span>記事本</span>} steps={<>
            <OpenStep n={1} size={30}><span>打開「記事本」</span></OpenStep>
            <OpenStep n={2} size={30}><span>貼上規則</span></OpenStep>
            <OpenStep n={3} size={30}><span>檔案 → 另存新檔，存進 Codex_練習</span></OpenStep>
            <OpenStep n={4} size={30}><span>存檔類型選「所有檔案」</span></OpenStep>
          </>} />
        </In>
      </div>
      <Steps><Step duration={STEP_MS}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 28, marginTop: 36, background: '#FFFFFF', border: `1px solid ${rule}`, padding: '20px 32px' }}>
          <span style={{ fontSize: 32 }}>檔名要剛好是</span><Path size={34}><span>AGENTS.md</span></Path>
          <StatusLine ok={false} size={30}><span>不是 AGENTS.md.txt、AGENTS.rtf</span></StatusLine>
        </div>
      </Step></Steps>
    </Fit>
  </Shell>
);

const RulePractice: Page = () => (
  <Shell chapter={5} source={<span>{'Codex 文件：AGENTS.md developers.openai.com/codex/guides/agents-md；agents.md'}</span>}>
    <PracticeEyebrow time={<span>{"4 分鐘"}</span>}><span>練習 2-2｜第 2 步｜Codex</span></PracticeEyebrow>
    <Heading><span>練習（Memory）：換新 Session，規則還在</span></Heading>
    <Lead><span>規則貼上牆，換新桌子也看得到</span></Lead>
    <Fit>
      <Stage h={470}>
        <Steps>
          <Layer h={470} label="第一步：自己建好的 AGENTS.md，像在牆上貼一張公告">
            <InG i={0}><text x="20" y="36" fontSize="30" fontWeight="600" fill={amber}>① 建好規則檔＝貼上牆</text></InG>
            <InG i={1}>
              <DocShape x={20} y={60} w={470} h={340} fill={amberSoft} stroke={amber} sw={3} />
              <text x="50" y="120" fontSize="34" fontFamily={mono} fontWeight="700" fill={ink}>AGENTS.md</text>
              <line x1="50" y1="144" x2="460" y2="144" stroke={amber} strokeWidth="2" />
              <text x="50" y="204" fontSize="30" fill={ink}>・只根據 原文/ 回答</text>
              <text x="50" y="264" fontSize="30" fill={ink}>・最後一行寫出處</text>
              <text x="50" y="324" fontSize="30" fill={ink}>・找不到就說找不到</text>
              <text x="50" y="378" fontSize="24" fill={quiet}>內容示意</text>
            </InG>
            <InG i={2}>
              <OkDot x={44} y={442} r={20} />
              <text x="76" y="452" fontSize="28" fontWeight="600" fill={okGreen}>Codex_練習 多了 AGENTS.md</text>
            </InG>
          </Layer>
          <Step duration={STEP_MS}><Layer h={470} label="第二步：/new 換一張新桌子再問劉備，最後一行照公告寫出處">
            <rect x="40" y="232" width="430" height="46" fill="none" stroke={okGreen} strokeWidth="3" className="aw1-build" style={buildDelay(0)} />
            <g className="aw1-build" style={buildDelay(0)}>
              <AskDesk y={0} title={<tspan>{"② /new 換一張新桌子，再問"}</tspan>} h={146}>
                <text x="692" y="110" fontSize="28" fontFamily={mono} fill="#E9B650">› 劉備第一次出場在第幾回？</text>
                <text x="692" y="150" fontSize="28" fontFamily={mono} fill="#F5F5F4">第一回。</text>
                <rect x="682" y="166" width="400" height="44" fill="none" stroke="#8DD4A0" strokeWidth="3" />
                <text x="692" y="198" fontSize="28" fontFamily={mono} fill="#8DD4A0">出處：原文/第001回.txt</text>
              </AskDesk>
            </g>
            <g fill="none" stroke={okGreen} strokeWidth="4"><StepPath d="M470 255 C560 255 580 188 680 188" i={1} /></g>
            <g className="aw1-build" style={buildDelay(2)}>
              <OkDot x={1340} y={126} r={22} />
              <text x="1378" y="122" fontSize="30" fontWeight="600" fill={okGreen}>最後一行</text>
              <text x="1378" y="162" fontSize="30" fontWeight="600" fill={okGreen}>照公告寫</text>
            </g>
          </Layer></Step>
          <Step duration={STEP_MS}><Layer h={470} label="第三步：對照題問諸葛亮，原文 前 21 回沒有他，它說找不到，沒有憑記憶報回數">
            <rect x="40" y="292" width="430" height="46" fill="none" stroke={okGreen} strokeWidth="3" className="aw1-build" style={buildDelay(0)} />
            <g className="aw1-build" style={buildDelay(0)}>
              <AskDesk y={242} title={<tspan>{"③ 對照題：前 21 回還沒有他"}</tspan>} h={108}>
                <text x="692" y="352" fontSize="28" fontFamily={mono} fill="#E9B650">› 諸葛亮第一次出場在第幾回？</text>
                <rect x="682" y="374" width="300" height="44" fill="none" stroke="#8DD4A0" strokeWidth="3" />
                <text x="692" y="406" fontSize="28" fontFamily={mono} fill="#8DD4A0">原文/ 裡找不到</text>
              </AskDesk>
            </g>
            <g fill="none" stroke={okGreen} strokeWidth="4"><StepPath d="M470 315 C560 315 580 396 680 396" i={1} /></g>
            <g className="aw1-build" style={buildDelay(2)}>
              <OkDot x={1340} y={330} r={22} />
              <text x="1378" y="341" fontSize="30" fontWeight="600" fill={okGreen}>沒憑記憶</text>
              <text x="1320" y="398" fontSize="24" fill={quiet}>拿掉公告再問：</text>
              <text x="1320" y="434" fontSize="24" fontWeight="600" fill={warn}>答「第三十七回」</text>
            </g>
          </Layer></Step>
        </Steps>
      </Stage>
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={28}><span>換了新桌子，還是照牆上的公告做</span></Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

const FlowStation = ({ x, label, children }: { x: number; label: ReactNode; children: ReactNode }) => (
  <g>
    {children}
    <text x={x} y={330} textAnchor="middle" fontSize="31" fontWeight="600" fill={ink}>{label}</text>
  </g>
);

const OutlinePrompt: Page = () => (
  <Shell chapter={5} source={<span>{'維基文庫《三國演義》第 1–21 回 zh.wikisource.org/wiki/三國演義'}</span>}>
    <PracticeEyebrow time={<span>{"5 分鐘"}</span>}><span>練習 2-3｜Codex</span></PracticeEyebrow>
    <Heading><span>練習（RAG）：照原文寫大綱</span></Heading>
    <PillRow>
      <Pill tag={<span>{"定位"}</span>}><span>原文第 1–21 回</span></Pill>
      <Pill tag={<span>{"期望輸出"}</span>}><span>三國演義大綱.md</span></Pill>
      <Pill tag={<span>{"限制"}</span>}><span>原文沒寫的不加</span></Pill>
    </PillRow>
    <Fit>
      <Stage h={360}>
        <Steps>
          <Layer h={360} label="Codex 讀原文資料夾的 21 個檔">
            <InG i={1}>
              <FlowStation x={150} label={<tspan>{"原文/ 21 回"}</tspan>}>
                <DocShape x={70} y={110} w={120} h={150} fill={surface} />
                <DocShape x={100} y={125} w={120} h={150} fill={surface} />
                <DocShape x={130} y={140} w={120} h={150} />
              </FlowStation>
            </InG>
            <InG i={2}><MapArrow x1={264} x2={362} y={200} /></InG>
            <InG i={3}>
              <FlowStation x={470} label={<tspan>{"Codex 讀完"}</tspan>}>
                <rect x="380" y="130" width="180" height="140" fill={term} />
                <text x="470" y="212" textAnchor="middle" fontSize="30" fontFamily={mono} fill="#F5F5F4">&gt;_ Codex</text>
              </FlowStation>
            </InG>
          </Layer>
          <Step duration={STEP_MS}><Layer h={360} label="先給你看草稿">
            <MapArrow x1={572} x2={670} y={200} />
            <FlowStation x={790} label={<tspan>{"先給你看"}</tspan>}>
              <Bubble x={690} y={110} w={200} h={150} />
              <rect x="714" y="140" width="150" height="12" fill={rule} />
              <rect x="714" y="170" width="120" height="12" fill={rule} />
              <rect x="714" y="200" width="140" height="12" fill={linkSoft} />
              <rect x="714" y="230" width="100" height="12" fill={sage} />
            </FlowStation>
          </Layer></Step>
          <Step duration={STEP_MS}><Layer h={360} label="你說可以，它直接存成三國演義大綱.md">
            <MapArrow x1={904} x2={1002} y={200} hot />
            <FlowStation x={1120} label={<tspan>{"你說「可以」"}</tspan>}>
              <rect x="1016" y="120" width="208" height="64" rx="32" fill={amberSoft} />
              <text x="1120" y="163" textAnchor="middle" fontSize="30" fill={ink}>可以，存檔</text>
              <rect x="1016" y="206" width="208" height="60" fill={sage} stroke={okGreen} strokeWidth="2" />
              <text x="1120" y="246" textAnchor="middle" fontSize="28" fontWeight="700" fill={ink}>直接存檔</text>
            </FlowStation>
            <MapArrow x1={1238} x2={1336} y={200} hot />
            <FlowStation x={1470} label={<tspan>{"三國演義大綱.md"}</tspan>}>
              <DocShape x={1390} y={110} w={160} h={180} fill={sage} stroke={okGreen} sw={3} />
              <SvgIcon kind="save" x={1470} y={200} size={64} color={okGreen} />
            </FlowStation>
          </Layer></Step>
        </Steps>
      </Stage>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 8 }}>
        <Steps>
          <Step duration={STEP_MS}><span style={{ display: 'inline-block', background: sage, border: `2px solid ${okGreen}`, padding: '10px 22px', fontSize: 28, fontWeight: 600 }}>完成：檔案出現，每段都有出處</span></Step>
          <Step duration={STEP_MS}><span style={{ display: 'inline-block', background: amberSoft, border: `2px solid ${amber}`, padding: '10px 22px', fontSize: 28, fontWeight: 600 }}>最低：先做第 1–2 回，再擴到 21 回</span></Step>
        </Steps>
      </div>
    </Fit>
  </Shell>
);

const L = ({ children }: { children: ReactNode }) => <span style={{ color: link }}>{children}</span>;

const OutlineResult: Page = () => (
  <Shell chapter={5} source={<span>{'維基文庫《三國演義》第 1–21 回 zh.wikisource.org/wiki/三國演義'}</span>}>
    <Eyebrow><span>講師實測｜Codex 0.154</span></Eyebrow>
    <Heading><span>實測結果：21 段，每段附出處</span></Heading>
    <Fit>
      <div style={{ display: 'grid', gridTemplateColumns: '1100px 1fr', gap: 48, alignItems: 'center' }}>
        <In i={0} style={{ background: '#FFFFFF', border: `1px solid ${rule}`, boxShadow: '0 10px 30px rgba(28,25,23,0.08)' }}>
          <div style={{ height: 54, display: 'flex', alignItems: 'center', gap: 12, padding: '0 24px', background: surface, borderBottom: `1px solid ${rule}`, fontSize: 25, color: muted }}>
            <Icon kind="doc" size={30} color={muted} /><span>三國演義大綱.md
          </span></div>
          <div style={{ padding: '20px 34px 24px', fontSize: 28, lineHeight: 1.6 }}>
            <div style={{ fontSize: 36, fontWeight: 600 }}># 三國演義大綱</div>
            <div style={{ fontSize: 30, fontWeight: 600, marginTop: 10 }}>## 第 1 回 宴桃園豪傑三結義　斬黃巾英雄首立功</div>
            <div><span>……</span><L><span>[[劉備]]</span></L><span>在涿縣遇到</span><L><span>[[張飛]]</span></L><span>、</span><L><span>[[關羽]]</span></L><span>，三人在桃園結義……</span></div>
            <div style={{ color: okGreen, fontWeight: 600 }}><Ring n={2} inline><span>出處：原文/第001回.txt</span></Ring></div>
            <div style={{ fontSize: 30, fontWeight: 600, marginTop: 14 }}><span>## 第 2 回 </span><Ring n={3} inline><L><span>[[張飛]]</span></L><span>怒鞭督郵　</span><L><span>[[何進]]</span></L><span>謀誅宦豎</span></Ring></div>
            <div><span>……督郵索賄陷害</span><L><span>[[劉備]]</span></L><span>，</span><L><span>[[張飛]]</span></L><span>怒鞭督郵，三人棄官離去……</span></div>
            <div style={{ color: okGreen, fontWeight: 600 }}><Ring n={2} inline><span>出處：原文/第002回.txt</span></Ring></div>
            <div style={{ color: quiet, marginTop: 10 }}>⋮　第 3–21 回，同樣格式</div>
          </div>
        </In>
        <div style={{ display: 'grid', gap: 40 }}>
          <Steps>
            <Step duration={STEP_MS}><Callout n={<span>{1}</span>} title={<><span>人名變成 </span><span style={{ color: link }}>[[連結]]</span></>} detail="第二堂就能連到人物卡" /></Step>
            <Step duration={STEP_MS}><Cue n={2}><Callout n={<span>{2}</span>} title={<span>{"每段最後附出處"}</span>} detail="21 段，21 個出處" /></Cue></Step>
            <Step duration={STEP_MS}><Cue n={3}><Callout n={<span>{3}</span>} title={<span>{"小毛病：回目被改了"}</span>} detail="「張翼德」變成 [[張飛]]" /></Cue></Step>
          </Steps>
        </div>
      </div>
    </Fit>
  </Shell>
);

// One title, shown the way it appears in a file, for the 回目 check.
const TitleChip = ({ file, children }: { file: ReactNode; children: ReactNode }) => (
  <div style={{ background: '#FFFFFF', border: `1px solid ${rule}`, padding: '12px 22px' }}>
    <div style={{ fontFamily: mono, fontSize: 24, color: muted }}>{file}</div>
    <div style={{ fontSize: 28, marginTop: 4, whiteSpace: 'nowrap' }}>{children}</div>
  </div>
);

const CheckSource: Page = () => (
  <Shell chapter={5} source={<span>{'維基文庫《三國演義》第 1–21 回 zh.wikisource.org/wiki/三國演義'}</span>}>
    <PracticeEyebrow time={<span>{"4 分鐘"}</span>}><span>練習 2-4｜核對</span></PracticeEyebrow>
    <Heading><span>練習（RAG）：請它指出原文哪一句</span></Heading>
    <Fit>
      <Stage h={400}>
        <Steps>
          <Layer h={400} label="問 Codex：三國演義大綱.md 第 21 回那段的第二句，根據原文哪一句？引用原句">
            <InG i={0}>
              <rect x="0" y="0" width="760" height="400" fill={term} />
              <text x="32" y="48" fontSize="24" fontFamily={mono} fill="#BCC3CC">Codex</text>
              <text x="32" y="100" fontSize="29" fill="#E9B650">› 三國演義大綱.md 第 21 回</text>
              <text x="32" y="142" fontSize="29" fill="#E9B650">  那段的第二句，根據原文</text>
              <text x="32" y="184" fontSize="29" fill="#E9B650">  哪一句？引用原句。</text>
            </InG>
          </Layer>
          <Step duration={STEP_MS}><Layer h={400} label="Codex 引用原句：我有一計，可殺車冑：乘夜扮作曹軍到徐州，引車冑出迎，襲而殺之">
            <g className="aw1-build" style={buildDelay(0)}>
              <text x="32" y="246" fontSize="30" fill="#F5F5F4">「我有一計，可殺車冑：</text>
              <text x="32" y="290" fontSize="30" fill="#F5F5F4">乘夜扮作曹軍到徐州，</text>
              <text x="32" y="334" fontSize="30" fill="#F5F5F4">引車冑出迎，襲而殺之。」</text>
              <text x="32" y="380" fontSize="25" fontFamily={mono} fill="#9AA3AD">出處：原文/第021回.txt</text>
            </g>
          </Layer></Step>
          <Step duration={STEP_MS}><Layer h={400} label="用文字編輯或記事本打開原文第 021 回，Cmd 或 Ctrl+F 搜尋可殺車冑，找到同一句">
            <rect x="880" y="0" width="752" height="400" fill={surface} stroke={rule} strokeWidth="2" />
            <text x="910" y="52" fontSize="26" fontFamily={mono} fontWeight="600" fill={muted}>原文/第021回.txt</text>
            <rect x="1300" y="18" width="310" height="50" fill="#FFFFFF" stroke={okGreen} strokeWidth="2" />
            <SvgIcon kind="search" x={1330} y={43} size={30} color={okGreen} />
            <text x="1356" y="53" fontSize="27" fontWeight="600" fill={ink}>可殺車冑</text>
            <text x="1594" y="52" textAnchor="end" fontSize="24" fill={muted}>1/1</text>
            <text x="910" y="132" fontSize="30" fill={muted}>雲長曰：「他伏甕城邊待我，</text>
            <text x="910" y="182" fontSize="30" fill={muted}><tspan>去必有失。</tspan><tspan fill={ink}>我有一計，可殺車冑：</tspan></text>
            <text x="910" y="232" fontSize="30" fill={ink}>乘夜扮作曹軍到徐州，</text>
            <text x="910" y="282" fontSize="30" fill={ink}>引車冑出迎，襲而殺之。」</text>
            <text x="910" y="332" fontSize="30" fill={muted}>飛然其言。</text>
            <g fill="none" stroke={okGreen} strokeWidth="3">
              <rect x="1062" y="148" width="334" height="48" rx="6" />
              <rect x="900" y="198" width="352" height="48" rx="6" />
              <rect x="900" y="248" width="384" height="48" rx="6" />
            </g>
            <g fill="none" stroke={okGreen} strokeWidth="4">
              <StepPath d="M760 290 C820 290 840 222 900 222" i={0} />
            </g>
            <g className="aw1-build" style={buildDelay(1)}><OkDot x={1316} y={272} r={20} /></g>
          </Layer></Step>
        </Steps>
      </Stage>
      <Steps>
        <Step duration={STEP_MS}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20, marginTop: 28 }}>
            <TitleChip file={<span>{"三國演義大綱.md"}</span>}><span>## 第 21 回 曹操煮酒論英雄　關公賺城斬車胄</span></TitleChip>
            <span style={{ fontSize: 40, color: okGreen, fontWeight: 600 }}>＝</span>
            <TitleChip file={<span>{"回目.md"}</span>}><span>第 21 回　曹操煮酒論英雄　關公賺城斬車胄</span></TitleChip>
          </div>
        </Step>
        <Step duration={STEP_MS}><Takeaway marginTop={24}><span>搜得到原句、標題一字不差，才算核對過</span></Takeaway></Step>
      </Steps>
    </Fit>
  </Shell>
);

// The instructor's screen recording of practice 2, with buttons that jump to each part.
const DEMO_VIDEO = new URL('./assets/outline-practice-demo.mp4', import.meta.url).href;
const DEMO_PARTS: [number, string][] = [
  [0, '進資料夾，看 AGENTS.md'],
  [22, '打開 OpenCode，選免費模型'],
  [56, '問：劉備第一次出場？'],
  [92, '問：諸葛亮呢？原文找不到'],
  [128, '貼上練習 2-3 提示詞'],
  [228, '回「寫入」，存成大綱'],
];
const clock = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

const PracticeVideo: Page = () => {
  const live = useIsActivePage();
  const video = useRef<HTMLVideoElement>(null);
  const [now, setNow] = useState(0);
  useEffect(() => { if (!live) video.current?.pause(); }, [live]);
  const part = DEMO_PARTS.reduce((at, [t], k) => (now >= t ? k : at), 0);
  const jump = (t: number) => {
    const v = video.current;
    if (!v) return;
    v.currentTime = t;
    void v.play();
  };
  return (
    <Shell chapter={5}>
      <Eyebrow><span>講師示範｜OpenCode｜約 5 分鐘</span></Eyebrow>
      <Heading><span>實作影片：從 cd 到大綱存檔</span></Heading>
      <Fit>
        <div style={{ display: 'grid', gridTemplateColumns: '979px 1fr', gap: 48, alignItems: 'center' }}>
          <In i={0}>
            <video
              ref={video}
              src={DEMO_VIDEO}
              controls
              muted
              playsInline
              preload="metadata"
              onTimeUpdate={(e) => setNow(e.currentTarget.currentTime)}
              onKeyDown={(e) => { if (e.key === ' ') e.stopPropagation(); }}
              aria-label="講師實作影片：cd 進 Codex_練習、打開 OpenCode、問兩個問題，再用練習 2-3 的提示詞寫出 21 回大綱並存檔"
              style={{ width: 979, height: 640, display: 'block', background: '#000000', border: `1px solid ${rule}` }}
            />
          </In>
          <div style={{ display: 'grid', gap: 12 }}>
            {DEMO_PARTS.map(([t, label], k) => (
              <In key={t} i={k + 1}>
                <button
                  type="button"
                  onClick={(e) => { e.currentTarget.blur(); jump(t); }}
                  style={{ width: '100%', display: 'grid', gridTemplateColumns: '84px 1fr', alignItems: 'center', gap: 12, padding: '14px 20px', boxSizing: 'border-box', textAlign: 'left', cursor: 'pointer', font: 'inherit', fontSize: 28, color: ink, background: k === part ? amberSoft : '#FFFFFF', border: `1px solid ${k === part ? amber : rule}`, transition: 'background-color 200ms ease, border-color 200ms ease' }}
                >
                  <span style={{ fontFamily: mono, fontSize: 26, color: amber, fontWeight: 600 }}>{clock(t)}</span>
                  <span style={{ whiteSpace: 'nowrap' }}>{label}</span>
                </button>
              </In>
            ))}
            <Caption><span>點時間跳到那一段｜換成 Codex，步驟一樣</span></Caption>
          </div>
        </div>
      </Fit>
    </Shell>
  );
};

// ---------- Close ----------

const RecapStop = ({ x, n, name, verb }: { x: number; n: Chapter; name: ReactNode; verb: ReactNode }) => (
  <g>
    <circle cx={x} cy="100" r="76" fill={amberSoft} stroke={amber} strokeWidth="3" />
    <text x={x} y="122" textAnchor="middle" fontSize="60" fontFamily={display} fill={amber}>{n}</text>
    <text x={x} y="240" textAnchor="middle" fontSize="34" fontWeight="600" fill={ink}>{name}</text>
    <text x={x} y="294" textAnchor="middle" fontSize="30" fill={muted}>{verb}</text>
  </g>
);

const Recap: Page = () => (
  <Shell>
    <Eyebrow><span>總結</span></Eyebrow>
    <Heading><span>今天學的五件事</span></Heading>
    <Fit>
      <Figure h={320} label="五章回顧">
        <g fill="none" stroke={amber} strokeWidth="4"><DrawPath i={5} d="M240 100 H1392" /></g>
        <InG i={0}><RecapStop x={163} n={1} name={<tspan>{"AI 怎麼走到今天"}</tspan>} verb={<tspan>{"猜字會猜錯"}</tspan>} /></InG>
        <InG i={1}><RecapStop x={489} n={2} name={<tspan>{"ChatGPT 與 Codex"}</tspan>} verb={<tspan>{"ChatGPT 想，Codex 做"}</tspan>} /></InG>
        <InG i={2}><RecapStop x={816} n={3} name={<tspan>{"安裝 Codex"}</tspan>} verb={<tspan>{"裝好並驗證 Codex"}</tspan>} /></InG>
        <InG i={3}><RecapStop x={1143} n={4} name={<tspan>{"看懂 Codex"}</tspan>} verb={<tspan>{"/status、AGENTS.md"}</tspan>} /></InG>
        <InG i={4}><RecapStop x={1469} n={5} name={<tspan>{"用 Codex 寫大綱"}</tspan>} verb={<tspan>{"大綱每段附出處"}</tspan>} /></InG>
      </Figure>
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={72}><span>AI 寫的東西，回原文核對過才算數</span></Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

const GraphNode = ({ x, y, name, empty = false }: { x: number; y: number; name: ReactNode; empty?: boolean }) => (
  <g>
    <circle cx={x} cy={y} r="40" fill={empty ? '#FFFFFF' : linkSoft} stroke={empty ? linkPale : link} strokeWidth="3" strokeDasharray={empty ? '7 6' : undefined} />
    <text x={x} y={y + 10} textAnchor="middle" fontSize="27" fill={empty ? linkPale : link}>{name}</text>
  </g>
);

const NextLesson: Page = () => (
  <Shell>
    <Eyebrow><span>預告｜第 2 堂 Obsidian 與 RAG</span></Eyebrow>
    <Heading><span>下一堂：大綱放進 Obsidian</span></Heading>
    <Fit>
      <Stage h={440}>
        <Steps>
          <Layer h={440} label="今天的三國演義大綱.md，人名都是連結">
            <InG i={0}>
              <DocShape x={0} y={50} w={400} h={340} fill="#FFFFFF" stroke={amber} sw={3} />
              <text x="30" y="108" fontSize="30" fontWeight="600" fill={ink}>三國演義大綱.md</text>
              <rect x="30" y="140" width="300" height="12" fill={rule} />
              <text x="30" y="210" fontSize="30" fill={ink}><tspan fill={link}>[[劉備]]</tspan><tspan>遇到</tspan><tspan fill={link}>[[關羽]]</tspan></text>
              <rect x="30" y="240" width="320" height="12" fill={rule} />
              <text x="30" y="306" fontSize="30" fill={ink}><tspan fill={link}>[[曹操]]</tspan><tspan>獻刀……</tspan></text>
              <text x="30" y="362" fontSize="26" fill={okGreen}>出處：原文/…</text>
            </InG>
          </Layer>
          <Step duration={STEP_MS}><Layer h={440} label="放進筆記庫，連到講師的人物卡">
            <MapArrow x1={420} x2={540} y={220} hot />
            <rect x="560" y="10" width="1072" height="420" fill={surface} />
            <text x="590" y="58" fontSize="28" fontWeight="600" fill={ink}>Obsidian 筆記庫</text>
            <g stroke={link} strokeWidth="3">
              <line x1="1060" y1="230" x2="840" y2="130" /><line x1="1060" y1="230" x2="820" y2="320" />
              <line x1="1060" y1="230" x2="990" y2="370" /><line x1="1060" y1="230" x2="1290" y2="100" />
              <line x1="1060" y1="230" x2="1250" y2="360" />
            </g>
            <circle cx="1060" cy="230" r="52" fill={amberSoft} stroke={amber} strokeWidth="3" />
            <text x="1060" y="240" textAnchor="middle" fontSize="28" fontWeight="600" fill={ink}>大綱</text>
            <GraphNode x={840} y={130} name={<tspan>{"劉備"}</tspan>} />
            <GraphNode x={820} y={320} name={<tspan>{"關羽"}</tspan>} />
            <GraphNode x={990} y={370} name={<tspan>{"張飛"}</tspan>} />
            <GraphNode x={1290} y={100} name={<tspan>{"曹操"}</tspan>} />
            <GraphNode x={1250} y={360} name={<tspan>{"孫權"}</tspan>} />
            <circle cx="606" cy="396" r="14" fill={linkSoft} stroke={link} strokeWidth="3" />
            <text x="630" y="405" fontSize="25" fill={link}>深紫＝已經有人物卡</text>
          </Layer></Step>
          <Step duration={STEP_MS}><Layer h={440} label="還沒有卡的人名，會是淡紫色連結">
            <g stroke={linkPale} strokeWidth="3" strokeDasharray="8 7"><line x1="1060" y1="230" x2="1520" y2="170" /><line x1="1060" y1="230" x2="1520" y2="300" /></g>
            <GraphNode x={1520} y={170} name={<tspan>{"董卓"}</tspan>} empty />
            <GraphNode x={1520} y={300} name={<tspan>{"呂布"}</tspan>} empty />
            <circle cx="1374" cy="396" r="14" fill="#FFFFFF" stroke={linkPale} strokeWidth="3" strokeDasharray="5 4" />
            <text x="1398" y="405" fontSize="25" fill={linkPale}>淡紫＝還沒有卡</text>
          </Layer></Step>
        </Steps>
      </Stage>
      <Steps>
        <Step duration={STEP_MS}>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 40 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 14, background: '#FFFFFF', border: `2px solid ${amber}`, padding: '12px 26px', fontSize: 30 }}>
              <Icon kind="down" size={38} color={amber} /><span>下一堂前，先安裝 Obsidian</span><span style={{ fontFamily: mono, fontSize: 28, color: muted }}>obsidian.md</span>
            </span>
          </div>
        </Step>
      </Steps>
    </Fit>
  </Shell>
);

// ---------- Appendix: no Codex plan ----------

// One backup route: icon, name, what you need, and a tag saying how to treat it.
const RouteCard = ({ y, kind, title, sub, tag, tone }: { y: number; kind: IconKind; title: ReactNode; sub: ReactNode; tag: ReactNode; tone: 'ok' | 'plain' | 'warn' }) => {
  const c = tone === 'ok' ? okGreen : tone === 'warn' ? warn : amber;
  const soft = tone === 'ok' ? sage : tone === 'warn' ? warnSoft : amberSoft;
  return (
    <g>
      <rect x="400" y={y} width="640" height="132" fill="#FFFFFF" stroke={tone === 'ok' ? okGreen : ink} strokeWidth={tone === 'ok' ? 3 : 2} />
      <SvgIcon kind={kind} x={462} y={y + 66} size={66} color={c} />
      <text x="522" y={y + 56} fontSize="34" fontWeight="600" fill={ink}>{title}</text>
      <text x="522" y={y + 102} fontSize="27" fill={muted}>{sub}</text>
      <rect x="1064" y={y + 40} width="120" height="52" rx="26" fill={soft} stroke={c} strokeWidth="2" />
      <text x="1124" y={y + 76} textAnchor="middle" fontSize="27" fontWeight="600" fill={c}>{tag}</text>
    </g>
  );
};

const RouteWhy = ({ y, children }: { y: number; children: ReactNode }) => (
  <text x="1214" y={y + 76} fontSize="27" fill={ink}>{children}</text>
);

// ---------- References ----------

// One cited work: who and where on the first line, the title under it.
const RefItem = ({ who, where, title }: { who: ReactNode; where: ReactNode; title: ReactNode }) => (
  <div>
    <div style={{ fontSize: 27, fontWeight: 600, lineHeight: 1.3 }}><span>{who}</span><span style={{ fontFamily: mono, fontSize: 24, fontWeight: 400, color: amber, marginLeft: 18 }}>{where}</span></div>
    <div style={{ fontSize: 24, color: muted, lineHeight: 1.35, marginTop: 4 }}>{title}</div>
  </div>
);

const RefGroup = ({ label, children }: { label: ReactNode; children: ReactNode }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
    <div style={{ borderBottom: `2px solid ${amber}`, paddingBottom: 8 }}><span style={{ color: 'var(--osd-accent)', fontSize: 25, fontWeight: 600, letterSpacing: '0.07em' }}>{label}</span></div>
    {children}
  </div>
);

const RefHint = () => (
  <div style={{ fontSize: 25, color: quiet, marginTop: 14 }}>arXiv 編號：到 arxiv.org/abs/ 後面接編號，就能打開論文</div>
);

const ReferencesModel: Page = () => (
  <Shell>
    <Eyebrow><span>延伸閱讀｜第 1 章用到的論文</span></Eyebrow>
    <Heading><span>參考資料（一）：模型原理與幻覺</span></Heading>
    <RefHint />
    <Fit>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'start' }}>
        <In i={0}>
          <RefGroup label={<span>{"猜下一個字、Token"}</span>}>
            <RefItem who={<span>{"Vaswani et al. 2017"}</span>} where={<span>{"1706.03762"}</span>} title={<span>{"Attention Is All You Need"}</span>} />
            <RefItem who={<span>{"Radford et al. 2018"}</span>} where={<span>{"OpenAI 報告"}</span>} title={<span>{"Improving Language Understanding by Generative Pre-Training"}</span>} />
            <RefItem who={<span>{"Brown et al. 2020"}</span>} where={<span>{"2005.14165"}</span>} title={<span>{"Language Models are Few-Shot Learners"}</span>} />
            <RefItem who={<span>{"Ouyang et al. 2022"}</span>} where={<span>{"2203.02155"}</span>} title={<span>{"Training Language Models to Follow Instructions with Human Feedback"}</span>} />
            <RefItem who={<span>{"Sennrich et al. 2016"}</span>} where={<span>{"1508.07909"}</span>} title={<span>{"Neural Machine Translation of Rare Words with Subword Units"}</span>} />
          </RefGroup>
        </In>
        <In i={1}>
          <RefGroup label={<span>{"隨機性、幻覺"}</span>}>
            <RefItem who={<span>{"Holtzman et al. 2020"}</span>} where={<span>{"1904.09751"}</span>} title={<span>{"The Curious Case of Neural Text Degeneration"}</span>} />
            <RefItem who={<span>{"Ji et al. 2023"}</span>} where={<span>{"2202.03629"}</span>} title={<span>{"Survey of Hallucination in Natural Language Generation"}</span>} />
            <RefItem who={<span>{"Huang et al. 2023"}</span>} where={<span>{"2311.05232"}</span>} title={<span>{"A Survey on Hallucination in Large Language Models"}</span>} />
            <RefItem who={<span>{"Kalai et al. 2025"}</span>} where={<span>{"2509.04664"}</span>} title={<span>{"Why Language Models Hallucinate"}</span>} />
          </RefGroup>
        </In>
      </div>
    </Fit>
  </Shell>
);

const ReferencesMethods: Page = () => (
  <Shell>
    <Eyebrow><span>延伸閱讀｜第 1 章用到的論文</span></Eyebrow>
    <Heading><span>參考資料（二）：CoT、工具、RAG 與 Agent</span></Heading>
    <RefHint />
    <Fit>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'start' }}>
        <In i={0}>
          <RefGroup label={<span>{"CoT、Tool Calling"}</span>}>
            <RefItem who={<span>{"Wei et al. 2022"}</span>} where={<span>{"2201.11903"}</span>} title={<span>{"Chain-of-Thought Prompting Elicits Reasoning in LLMs"}</span>} />
            <RefItem who={<span>{"Kojima et al. 2022"}</span>} where={<span>{"2205.11916"}</span>} title={<span>{"Large Language Models are Zero-Shot Reasoners"}</span>} />
            <RefItem who={<span>{"Gao et al. 2023"}</span>} where={<span>{"2211.10435"}</span>} title={<span>{"PAL: Program-aided Language Models"}</span>} />
            <RefItem who={<span>{"Schick et al. 2023"}</span>} where={<span>{"2302.04761"}</span>} title={<span>{"Toolformer: Language Models Can Teach Themselves to Use Tools"}</span>} />
          </RefGroup>
        </In>
        <In i={1}>
          <RefGroup label={<span>{"Web Search、RAG、Agent"}</span>}>
            <RefItem who={<span>{"Nakano et al. 2021"}</span>} where={<span>{"2112.09332"}</span>} title={<span>{"WebGPT: Browser-assisted Question-answering with Human Feedback"}</span>} />
            <RefItem who={<span>{"Lewis et al. 2020"}</span>} where={<span>{"2005.11401"}</span>} title={<span>{"Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks"}</span>} />
            <RefItem who={<span>{"Yao et al. 2023"}</span>} where={<span>{"2210.03629"}</span>} title={<span>{"ReAct: Synergizing Reasoning and Acting in Language Models"}</span>} />
            <RefItem who={<span>{"Anthropic 2024"}</span>} where={<span>{"anthropic.com"}</span>} title={<span>{"Building Effective Agents"}</span>} />
          </RefGroup>
        </In>
      </div>
    </Fit>
  </Shell>
);

const NoPlan: Page = () => (
  <Shell>
    <Eyebrow><span>附錄｜先看這頁：選一條備案</span></Eyebrow>
    <Heading><span>沒有 Codex 方案怎麼辦</span></Heading>
    <Fit>
      <Stage h={470}>
        <Steps>
          <Layer h={470} label="起點：沒有含 Codex 的 ChatGPT 方案">
            <InG i={0}>
              <rect x="0" y="175" width="300" height="120" fill={warnSoft} stroke={warn} strokeWidth="2" />
              <text x="150" y="227" textAnchor="middle" fontSize="30" fontWeight="600" fill={warn}>沒有含 Codex</text>
              <text x="150" y="269" textAnchor="middle" fontSize="30" fontWeight="600" fill={warn}>的方案</text>
            </InG>
          </Layer>
          <Step duration={STEP_MS}><Layer h={470} label="備案 A：opencode 加免費雲端模型，不用登入，首選">
            <g fill="none" stroke={okGreen} strokeWidth="4"><StepPath d="M300 235 C350 235 350 76 400 76" /></g>
            <g className="aw1-build" style={buildDelay(1)}>
              <RouteCard y={10} kind="cloud" title={<tspan>{"A｜opencode＋免費模型"}</tspan>} sub={<tspan>{"不用登入、不用信用卡"}</tspan>} tag={<tspan>{"首選"}</tspan>} tone="ok" />
              <RouteWhy y={10}><tspan>實測可用｜第 </tspan>{pageOf(OpencodeSteps)}<tspan> 頁</tspan></RouteWhy>
            </g>
          </Layer></Step>
          <Step duration={STEP_MS}><Layer h={470} label="備案 B：Codex 加 OpenRouter，要帳號和 API Key">
            <g fill="none" stroke={faint} strokeWidth="3"><StepPath d="M300 235 H400" /></g>
            <g className="aw1-build" style={buildDelay(1)}>
              <RouteCard y={169} kind="key" title={<tspan>{"B｜Codex＋OpenRouter"}</tspan>} sub={<tspan>{"要帳號和 API Key"}</tspan>} tag={<tspan>{"備用"}</tspan>} tone="plain" />
              <RouteWhy y={169}><tspan>和 Codex 一樣｜第 </tspan>{pageOf(OpenRouterRoute)}<tspan> 頁</tspan></RouteWhy>
            </g>
          </Layer></Step>
          <Step duration={STEP_MS}><Layer h={470} label="備案 C：自己電腦跑模型，只能示範">
            <g fill="none" stroke={faint} strokeWidth="3" strokeDasharray="10 8"><StepPath d="M300 235 C350 235 350 394 400 394" /></g>
            <g className="aw1-build" style={buildDelay(1)}>
              <RouteCard y={328} kind="laptop" title={<tspan>{"C｜自己電腦跑模型"}</tspan>} sub={<tspan>{"Ollama，資料不出電腦"}</tspan>} tag={<tspan>{"示範"}</tspan>} tone="warn" />
              <RouteWhy y={328}><tspan>只能示範｜第 </tspan>{pageOf(LocalLadder)}<tspan> 頁</tspan></RouteWhy>
            </g>
          </Layer></Step>
        </Steps>
      </Stage>
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={32}><span>先走 A，不行再試 B；C 只拿來示範</span></Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

const CmdRow = ({ n, cmd, note }: { n: ReactNode; cmd: ReactNode; note: ReactNode }) => (
  <div style={{ display: 'grid', gridTemplateColumns: '52px 1fr', alignItems: 'center', gap: 18, padding: '10px 0', borderBottom: `1px solid ${rule}` }}>
    <span style={{ flex: '0 0 auto', width: 44, height: 44, borderRadius: 44 / 2, background: amber, color: '#FFFFFF', display: 'grid', placeItems: 'center', fontSize: Math.round(44 * 0.57), fontWeight: 600 }}>{n}</span>
    <div>
      <div style={{ fontFamily: mono, fontSize: 30, fontWeight: 600 }}>{cmd}</div>
      <div style={{ fontSize: 25, color: muted, marginTop: 4 }}>{note}</div>
    </div>
  </div>
);

const ModelRow = ({ name, tag, hot = false }: { name: ReactNode; tag: ReactNode; hot?: boolean }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 18px', background: hot ? 'rgba(141,212,160,0.16)' : 'transparent', outline: hot ? '3px solid #8DD4A0' : 'none', outlineOffset: -3 }}>
    <span style={{ fontFamily: mono, fontSize: 27, color: '#F5F5F4' }}>{name}</span>
    <span style={{ fontSize: 24, fontWeight: 600, color: hot ? '#8DD4A0' : '#BCC3CC' }}>{tag}</span>
  </div>
);

const MapChip = ({ codex, oc }: { codex: ReactNode; oc: ReactNode }) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 12, background: '#FFFFFF', border: `1px solid ${rule}`, padding: '10px 18px', fontSize: 27, whiteSpace: 'nowrap' }}>
    <span style={{ fontFamily: mono, color: muted }}>{codex}</span>
    <span style={{ color: faint }}>→</span>
    <span style={{ fontWeight: 600 }}>{oc}</span>
  </span>
);

const OpencodeSteps: Page = () => (
  <Shell source={<span>{'opencode 文件 opencode.ai/docs/zen、opencode.ai/docs/tui'}</span>}>
    <Eyebrow><span>附錄｜備案 A｜opencode-ai 1.19.3 實測</span></Eyebrow>
    <Heading><span>備案 A：opencode＋免費模型</span></Heading>
    <Fit>
      <div style={{ display: 'grid', gridTemplateColumns: '880px 1fr', gap: 56, alignItems: 'center' }}>
        <In i={0}>
          <CmdRow n={<span>{1}</span>} cmd={<span>{"node -v"}</span>} note={<span>{"若沒有，先到 nodejs.org 裝 LTS"}</span>} />
          <CmdRow n={<span>{2}</span>} cmd={<span>{"npm install -g opencode-ai"}</span>} note={<span>{"Mac、Windows 同一行"}</span>} />
          <CmdRow n={<span>{3}</span>} cmd={<span>{"cd 練習資料夾 → opencode"}</span>} note={<span>{"不用登入"}</span>} />
          <CmdRow n={<span>{4}</span>} cmd={<span>{"/models"}</span>} note={<span>{"挑一個免費模型"}</span>} />
          <CmdRow n={<span>{5}</span>} cmd={<span>{"貼上 prompts.md 的提示詞"}</span>} note={<span>{"和 Codex 練習一樣"}</span>} />
        </In>
        <div>
          <Steps>
            <Step duration={STEP_MS}>
              <div style={{ background: term, border: '1px solid #555B60' }}>
                <div style={{ height: 50, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', background: '#30343A', fontFamily: mono, fontSize: 24, color: '#BCC3CC' }}><span>/models</span><span>示意</span></div>
                <div style={{ padding: '12px 0' }}>
                  <ModelRow name={<span>{"DeepSeek V4.1 Flash Free"}</span>} tag={<span>{"推薦"}</span>} hot />
                  <ModelRow name={<span>{"GLM-5.3 Flash Free"}</span>} tag={<span>{"推薦"}</span>} />
                  <ModelRow name={<span>{"Big Pickle"}</span>} tag={<span>{"預設，較慢"}</span>} />
                </div>
              </div>
            </Step>
          </Steps>
        </div>
      </div>
      <Steps>
        <Step duration={STEP_MS}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 36, flexWrap: 'wrap' }}>
            <SmallLabel><span>和 Codex 的對照</span></SmallLabel>
            <MapChip codex={<span>{"/status"}</span>} oc={<span>{"畫面上直接看模型"}</span>} />
            <MapChip codex={<span>{"/new"}</span>} oc={<span>{"/new"}</span>} />
            <MapChip codex={<span>{"AGENTS.md"}</span>} oc={<span>{"一樣會讀"}</span>} />
          </div>
        </Step>
      </Steps>
    </Fit>
  </Shell>
);

const OpencodeRun: Page = () => (
  <Shell source={<span>{'opencode 文件 opencode.ai/docs/zen'}</span>}>
    <Eyebrow><span>附錄｜備案 A｜講師電腦實測 2026-10-17</span></Eyebrow>
    <Heading><span>opencode 實測：29 秒建好檔案</span></Heading>
    <Fit>
      <div style={{ display: 'grid', gridTemplateColumns: '960px 1fr', gap: 48, alignItems: 'center' }}>
        <In i={0}>
          <Terminal title={<span>{"終端機｜aw-01-lab 的複本"}</span>} size={25}>
            <Typed><span>$</span></Typed><span>{' opencode run -m opencode/deepseek-v4.1-flash-free \\\n'}</span><AskLine><span>{'  "列出這個資料夾的檔案，然後建立 hello.md，內容是：你好"\n'}</span></AskLine>
            <Steps>
              <Step duration={STEP_MS}><div><Dim><span>{'$ ls -la …'}</span></Dim></div></Step>
              <Step duration={STEP_MS}><div>{'← Write hello.md\n'}<span style={{ color: '#8DD4A0' }}>Wrote file successfully.</span></div></Step>
              <Step duration={STEP_MS}><div>{'檔案：README.md、prompts.md、原文/（目錄）、回目.md。\n已建立 hello.md，內容為「你好」。'}</div></Step>
            </Steps>
          </Terminal>
        </In>
        <div style={{ display: 'grid', gap: 24 }}>
          <Steps>
            <Step duration={STEP_MS}>
              <div style={{ background: sage, borderTop: `5px solid ${okGreen}`, padding: '20px 24px' }}>
                <SmallLabel color={okGreen}><span>大綱提示詞｜15 秒</span></SmallLabel>
                <div style={{ fontSize: 27, lineHeight: 1.55, marginTop: 10 }}><L><span>[[劉備]]</span></L><span>、</span><L><span>[[關羽]]</span></L><span>、</span><L><span>[[張飛]]</span></L><span>於桃園結義，聚鄉勇投軍討伐</span><L><span>[[張角]]</span></L><span>的黃巾賊……</span></div>
                <div style={{ marginTop: 10 }}><StatusLine ok size={27}><span>內容和原文對得上</span></StatusLine></div>
              </div>
            </Step>
            <Step duration={STEP_MS}>
              <div style={{ background: amberSoft, borderLeft: `6px solid ${amber}`, padding: '16px 22px', fontSize: 27, lineHeight: 1.5 }}>
                <strong style={{ color: amber }}>免費額度沒有公開</strong><br /><span>全班同時用，可能被擋
              </span></div>
            </Step>
          </Steps>
        </div>
      </div>
    </Fit>
  </Shell>
);

// One rung of the model-size ladder: a bar, a verdict mark, the model and what happened.
const Rung = ({ x, h, size, name, l1, l2, verdict }: { x: number; h: number; size: ReactNode; name: ReactNode; l1: ReactNode; l2: ReactNode; verdict: 'no' | 'meh' | 'demo' | 'ok' }) => {
  const fill = verdict === 'no' ? warnSoft : verdict === 'meh' ? amberSoft : verdict === 'demo' ? sage : blueSoft;
  const stroke = verdict === 'no' ? warn : verdict === 'meh' ? amber : verdict === 'demo' ? okGreen : blue;
  const top = 300 - h;
  return (
    <g>
      <rect x={x - 110} y={top} width="220" height={h} fill={fill} stroke={stroke} strokeWidth="2" />
      <text x={x} y={288} textAnchor="middle" fontSize="30" fontWeight="600" fill={stroke}>{size}</text>
      {verdict === 'no' ? <NoDot x={x} y={top - 34} r={26} /> : verdict === 'meh' ? <AskMark x={x} y={top - 34} r={26} /> : <OkDot x={x} y={top - 34} r={26} />}
      {verdict === 'demo' ? <text x={x + 36} y={top - 26} fontSize="25" fontWeight="600" fill={okGreen}>只能示範</text> : null}
      <text x={x} y={348} textAnchor="middle" fontSize="27" fontFamily={mono} fontWeight="600" fill={ink}>{name}</text>
      <text x={x} y={392} textAnchor="middle" fontSize="26" fill={muted}>{l1}</text>
      <text x={x} y={428} textAnchor="middle" fontSize="26" fill={muted}>{l2}</text>
    </g>
  );
};

const LocalLadder: Page = () => (
  <Shell source={<span>{'Ollama 文件 docs.ollama.com/context-length'}</span>}>
    <Eyebrow><span>附錄｜備案 C｜1B、2B 夠不夠？講師電腦實測</span></Eyebrow>
    <Heading><span>備案 C：1B、2B 的模型不夠用</span></Heading>
    <Fit>
      <Stage h={450}>
        <Steps>
          <Layer h={450} label="1B 和 1.7B：不會動手，或亂編內容">
            <line x1="20" y1="300" x2="1612" y2="300" stroke={ink} strokeWidth="2" />
            <InG i={0}><Rung x={163} h={60} size={<tspan>{"1B"}</tspan>} name={<tspan>{"llama3.2:1b"}</tspan>} l1={<tspan>{"只印出指令"}</tspan>} l2={<tspan>{"沒有動手"}</tspan>} verdict="no" /></InG>
            <InG i={1}><Rung x={489} h={90} size={<tspan>{"1.7B"}</tspan>} name={<tspan>{"qwen3:1.7b"}</tspan>} l1={<tspan>{"編出 [[李四]]"}</tspan>} l2={<tspan>{"「劉備字孔明」"}</tspan>} verdict="no" /></InG>
          </Layer>
          <Step duration={STEP_MS}><Layer h={450} label="4B：很慢，大綱寫成紅樓夢">
            <g className="aw1-build" style={buildDelay(0, 0)}><Rung x={816} h={130} size={<tspan>{"4B"}</tspan>} name={<tspan>{"qwen3:4b"}</tspan>} l1={<tspan>{"一題約 270 秒"}</tspan>} l2={<tspan>{"寫出紅樓夢人物"}</tspan>} verdict="meh" /></g>
          </Layer></Step>
          <Step duration={STEP_MS}><Layer h={450} label="gemma4:e2b：能讀檔、建檔，大綱不可靠，只能示範">
            <g className="aw1-build" style={buildDelay(0, 0)}><Rung x={1143} h={170} size={<tspan>{"e2b"}</tspan>} name={<tspan>{"gemma4:e2b"}</tspan>} l1={<tspan>{"能讀檔、建檔"}</tspan>} l2={<tspan>{"大綱不可靠"}</tspan>} verdict="demo" /></g>
          </Layer></Step>
          <Step duration={STEP_MS}><Layer h={450} label="雲端免費模型：大綱正確">
            <g className="aw1-build" style={buildDelay(0, 0)}><Rung x={1469} h={220} size={<tspan>{"雲端"}</tspan>} name={<tspan>{"免費雲端模型"}</tspan>} l1={<tspan>{"大綱正確"}</tspan>} l2={<tspan>{"約 15 秒"}</tspan>} verdict="ok" /></g>
          </Layer></Step>
        </Steps>
      </Stage>
      <div style={{ fontSize: 24, color: quiet, textAlign: 'center' }}>講師在這台電腦（Ollama 0.40.3）、這些任務測過的模型</div>
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={20}><span>最少要 gemma4:e2b，而且只能拿來示範</span></Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

const CtxTick = ({ label, hot = false, bad = false }: { label: ReactNode; hot?: boolean; bad?: boolean }) => (
  <span style={{ display: 'grid', justifyItems: 'center', gap: 10, fontFamily: mono, fontSize: 27, color: hot ? okGreen : bad ? warn : quiet, fontWeight: hot || bad ? 700 : 400 }}>
    <span style={{ width: 4, height: 18, background: hot ? okGreen : bad ? warn : faint }} /><span>{label}</span>
  </span>
);

const OllamaRoute: Page = () => (
  <Shell source={<span>{'Ollama 文件 docs.ollama.com/integrations/opencode'}</span>}>
    <Eyebrow><span>附錄｜備案 C｜Ollama 0.40.3 實測</span></Eyebrow>
    <Heading><span>備案 C：用 Ollama 示範本機模型</span></Heading>
    <Fit>
      <div style={{ display: 'grid', gridTemplateColumns: '620px 1fr', gap: 48, alignItems: 'center' }}>
        <In i={0} style={{ background: '#FFFFFF', border: `1px solid ${rule}`, padding: '30px 34px 34px' }}>
          <SmallLabel><span>Ollama 設定｜Context length</span></SmallLabel>
          <div style={{ position: 'relative', height: 40, marginTop: 40 }}>
            <div style={{ position: 'absolute', left: 10, right: 10, top: 16, height: 10, background: raised }} />
            <div style={{ position: 'absolute', left: 10, width: '58%', top: 16, height: 10, background: okGreen }} />
            <div style={{ position: 'absolute', left: 'calc(58% - 12px)', top: 0, width: 42, height: 42, borderRadius: 21, background: '#FFFFFF', border: `5px solid ${okGreen}`, boxSizing: 'border-box' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10 }}>
            <CtxTick label={<span>{"4k"}</span>} bad /><CtxTick label={<span>{"8k"}</span>} /><CtxTick label={<span>{"16k"}</span>} /><CtxTick label={<span>{"32k"}</span>} hot /><CtxTick label={<span>{"64k"}</span>} /><CtxTick label={<span>{"128k"}</span>} />
          </div>
          <div style={{ display: 'grid', gap: 16, marginTop: 34 }}>
            <StatusLine ok={false} size={28}><span>預設 4k：提示詞被默默截斷</span></StatusLine>
            <StatusLine ok size={28}><span>調到 32k 以上</span></StatusLine>
          </div>
        </In>
        <div>
          <Steps>
            <Step duration={STEP_MS}>
              <Terminal title={<span>{"終端機"}</span>} size={27}>
                <Dim><span>{'# 先到 ollama.com 下載安裝\n'}</span></Dim>
                <Typed><span>$</span></Typed><span>{' ollama pull gemma4:e2b  '}</span><Dim><span>{'# 約 4.6 GB\n'}</span></Dim>
                <Typed><span>$</span></Typed><span>{' ollama run gemma4:e2b   '}</span><Dim><span>{'# 聊天，/bye 離開\n'}</span></Dim>
                <Typed><span>$</span></Typed><span>{' ollama launch opencode \\\n    --model gemma4:e2b\n'}</span>
                <Typed><span>$</span></Typed><span>{' ollama ps  '}</span><Dim><span>{'# CONTEXT 要是 32768'}</span></Dim>
              </Terminal>
            </Step>
          </Steps>
        </div>
      </div>
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={40}><span>16 GB 的電腦才示範，8 GB 不要跑</span></Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

const ErrorCard = ({ msg, fix }: { msg: ReactNode; fix: ReactNode }) => (
  <div style={{ background: '#FFFFFF', border: `1px solid ${rule}`, borderLeft: `6px solid ${warn}` }}>
    <div style={{ background: term, color: '#F1A89B', fontFamily: mono, fontSize: 24, lineHeight: 1.5, padding: '16px 20px', whiteSpace: 'pre-wrap' }}>{msg}</div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px', fontSize: 29, fontWeight: 600 }}><Icon kind="tool" size={36} color={okGreen} /><span>{fix}</span></div>
  </div>
);

const OpenRouterRoute: Page = () => (
  <Shell source={<span>{'OpenRouter 文件 openrouter.ai/docs/cookbook/coding-agents/codex-cli'}</span>}>
    <Eyebrow><span>附錄｜備案 B｜codex-cli 0.154.0 實測</span></Eyebrow>
    <Heading><span>備案 B：Codex＋OpenRouter</span></Heading>
    <Fit>
      <div style={{ display: 'grid', gridTemplateColumns: '900px 1fr', gap: 44, alignItems: 'center' }}>
        <In i={0}>
          <Terminal title={<span>{"~/.codex/config.toml"}</span>} size={26}>
            <AskLine><span>{'model_provider = "openrouter"\nmodel = "poolside/laguna-xs-2.1:free"\n\n'}</span></AskLine>
            <span>{'[model_providers.openrouter]\nname = "OpenRouter"\nbase_url = "https://openrouter.ai/api/v1"\nenv_key = "OPENROUTER_API_KEY"\n'}</span><HotLine><span>{'wire_api = "responses"'}</span></HotLine>
          </Terminal>
        </In>
        <div style={{ display: 'grid', gap: 26 }}>
          <Steps>
            <Step duration={STEP_MS}><ErrorCard msg={<span>{'ERROR: Missing environment variable: OPENROUTER_API_KEY.'}</span>} fix={<span>{"先設定 API Key"}</span>} /></Step>
            <Step duration={STEP_MS}><ErrorCard msg={<span>{'wire_api = "chat" is no longer supported.'}</span>} fix={<span>{"改成 responses"}</span>} /></Step>
            <Step duration={STEP_MS}><div style={{ background: amberSoft, padding: '16px 22px', fontSize: 29, fontWeight: 600, color: amber }}>免費：每分鐘 20 次、每天 50 次</div></Step>
          </Steps>
        </div>
      </div>
    </Fit>
  </Shell>
);

// ---------- 附錄：安裝疑難排解 ----------

const InstallRow = ({ label, children }: { label: ReactNode; children: ReactNode }) => (
  <div style={{ display: 'grid', gridTemplateColumns: '210px 1fr', alignItems: 'center', borderTop: `1px solid ${rule}`, padding: '9px 26px' }}>
    <span style={{ fontSize: 26, color: muted, fontWeight: 600 }}>{label}</span>
    <span style={{ fontFamily: mono, fontSize: 27, whiteSpace: 'nowrap' }}>{children}</span>
  </div>
);

const ToolInstallCard = ({ name, doc, children }: { name: ReactNode; doc: ReactNode; children: ReactNode }) => (
  <div style={{ background: '#FFFFFF', border: `1px solid ${rule}`, borderLeft: `6px solid ${amber}` }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 26px', background: surface }}>
      <span style={{ fontSize: 32, fontWeight: 600 }}>{name}</span>
      <span style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 25, color: muted }}><Icon kind="book" size={30} color={muted} /><span>{doc}</span></span>
    </div>
    {children}
  </div>
);

const InstallCompare: Page = () => (
  <Shell source={<span>{'learn.chatgpt.com/docs/codex/cli、github.com/openai/codex、code.claude.com/docs/en/setup'}</span>}>
    <Eyebrow><span>附錄｜安裝 1／4｜2026-10-27 依官方文件核對</span></Eyebrow>
    <Heading><span>Codex 與 Claude Code 安裝對照</span></Heading>
    <Fit>
      <div style={{ display: 'grid', gap: 26 }}>
        <In i={0}>
          <ToolInstallCard name={<span>{"Codex（OpenAI）"}</span>} doc={<span>{"learn.chatgpt.com/docs/codex/cli"}</span>}>
            <InstallRow label={<span>{"Mac／Linux"}</span>}><span>{"curl -fsSL https://chatgpt.com/codex/install.sh | sh"}</span></InstallRow>
            <InstallRow label={<span>{"Windows"}</span>}><span>{"irm https://chatgpt.com/codex/install.ps1 | iex"}</span></InstallRow>
            <InstallRow label={<span>{"裝在哪"}</span>}><span>{"~/.local/bin　｜　%LOCALAPPDATA%\\Programs\\OpenAI\\Codex\\bin"}</span></InstallRow>
            <InstallRow label={<span>{"確認"}</span>}><span>{"codex --version"}</span></InstallRow>
          </ToolInstallCard>
        </In>
        <In i={1}>
          <ToolInstallCard name={<span>{"Claude Code（Anthropic）"}</span>} doc={<span>{"code.claude.com/docs/en/setup"}</span>}>
            <InstallRow label={<span>{"Mac／Linux"}</span>}><span>{"curl -fsSL https://claude.ai/install.sh | bash"}</span></InstallRow>
            <InstallRow label={<span>{"Windows"}</span>}><span>{"irm https://claude.ai/install.ps1 | iex"}</span></InstallRow>
            <InstallRow label={<span>{"裝在哪"}</span>}><span>{"~/.local/bin　｜　%USERPROFILE%\\.local\\bin"}</span></InstallRow>
            <InstallRow label={<span>{"確認"}</span>}><span>{"claude --version"}</span></InstallRow>
          </ToolInstallCard>
        </In>
      </div>
    </Fit>
  </Shell>
);

// PATH drawn as a short list of folders; the green row is the one to add.
const PathList = ({ rows, add }: { rows: ReactNode[]; add: ReactNode }) => (
  <div style={{ background: '#FFFFFF', border: `1px solid ${rule}` }}>
    <div style={{ padding: '12px 20px', background: raised, fontSize: 25, fontWeight: 600, color: muted }}>PATH＝電腦找指令的資料夾清單</div>
    {rows.map((r, i) => (
      <div key={i} style={{ padding: '10px 20px', borderTop: `1px solid ${rule}`, fontFamily: mono, fontSize: 24, color: quiet }}>{r}</div>
    ))}
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, padding: '10px 20px', borderTop: `2px solid ${okGreen}`, background: sage, fontFamily: mono, fontSize: 24, fontWeight: 700, color: okGreen }}>
      <span>{add}</span><span style={{ fontFamily: 'var(--osd-font-body)', whiteSpace: 'nowrap' }}>＋ 要加這行</span>
    </div>
  </div>
);

const PathFixMac: Page = () => (
  <Shell source={<span>{'code.claude.com/docs/en/troubleshoot-install（Verify your PATH）、chatgpt.com/codex/install.sh'}</span>}>
    <Eyebrow><span>附錄｜安裝 2／4｜Mac、Linux</span></Eyebrow>
    <Heading><span>Mac：找不到 codex 指令</span></Heading>
    <Fit>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 500px', gap: 40, alignItems: 'center' }}>
        <In i={1}>
          <Terminal title={<span>{"終端機（zsh）｜照順序，好了就停"}</span>} size={26}>
            <Dim><span>{"# 1 關掉終端機（含 VS Code）重開，再試一次\n\n# 2 檔案在不在？看到 codex 或 claude＝有裝\n"}</span></Dim>
            <Typed><span>{"ls ~/.local/bin\n\n"}</span></Typed>
            <Dim><span>{"# 3 把資料夾加進 PATH（只做一次）\n"}</span></Dim>
            <Typed><span>{"echo 'export PATH=\"$HOME/.local/bin:$PATH\"' >> ~/.zshrc\nsource ~/.zshrc\n\n"}</span></Typed>
            <Dim><span>{"# 4 看到版本號就成功\n"}</span></Dim>
            <Typed><span>{"codex --version"}</span></Typed>
          </Terminal>
        </In>
        <div style={{ display: 'grid', gap: 26 }}>
          <In i={0}><ErrorCard msg={<span>{"zsh: command not found: codex"}</span>} fix={<span>{"PATH 裡沒有安裝資料夾"}</span>} /></In>
          <In i={2}><PathList rows={[<span>{"/opt/homebrew/bin"}</span>, <span>{"/usr/bin"}</span>]} add={<span>{"~/.local/bin"}</span>} /></In>
        </div>
      </div>
    </Fit>
  </Shell>
);

const PathFixWin: Page = () => (
  <Shell source={<span>{'code.claude.com/docs/en/troubleshoot-install（Verify your PATH）、chatgpt.com/codex/install.ps1'}</span>}>
    <Eyebrow><span>附錄｜安裝 3／4｜Windows</span></Eyebrow>
    <Heading><span>Windows：找不到 codex 指令</span></Heading>
    <Fit>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 470px', gap: 36, alignItems: 'center' }}>
        <In i={1}>
          <Terminal title={<span>{"PowerShell｜照順序，好了就停"}</span>} size={24}>
            <Dim><span>{"# 1 關掉所有 PowerShell 和 VS Code，重開再試\n\n# 2 檔案在不在？True＝有裝\n"}</span></Dim>
            <Typed><span>{"$bin = \"$env:LOCALAPPDATA\\Programs\\OpenAI\\Codex\\bin\"\nTest-Path \"$bin\\codex.exe\"\n\n"}</span></Typed>
            <Dim><span>{"# 3 加進使用者 PATH（只做一次）\n"}</span></Dim>
            <Typed><span>{"$p = [Environment]::GetEnvironmentVariable('Path','User')\n[Environment]::SetEnvironmentVariable('Path',\"$p;$bin\",'User')\n\n"}</span></Typed>
            <Dim><span>{"# 4 關掉、重開 PowerShell，看到版本號就成功\n"}</span></Dim>
            <Typed><span>{"codex --version"}</span></Typed>
          </Terminal>
        </In>
        <div style={{ display: 'grid', gap: 24 }}>
          <In i={0}><ErrorCard msg={<span>{"codex : 無法辨識 'codex' 詞彙是否為 Cmdlet、函數、指令檔或可執行程式的名稱。"}</span>} fix={<span>{"PATH 裡沒有安裝資料夾"}</span>} /></In>
          <In i={2}><PathList rows={[<span>{"C:\\Windows\\system32"}</span>]} add={<span>{"…\\OpenAI\\Codex\\bin"}</span>} /></In>
          <In i={3}><div style={{ background: amberSoft, padding: '14px 20px', fontSize: 25, lineHeight: 1.45 }}><strong style={{ color: amber }}>Claude Code</strong><span>：$bin 改成 </span><Path size={24}>{"$env:USERPROFILE\\.local\\bin"}</Path><span>，檔名 claude.exe</span></div></In>
        </div>
      </div>
    </Fit>
  </Shell>
);

const ErrLine = ({ see, fix, i }: { see: ReactNode; fix: ReactNode; i: number }) => (
  <In i={i} style={{ display: 'grid', gridTemplateColumns: '760px 1fr', alignItems: 'stretch', borderBottom: `1px solid ${rule}` }}>
    <div style={{ background: term, color: '#F1A89B', fontFamily: mono, fontSize: 24, lineHeight: 1.45, padding: '14px 22px', display: 'flex', alignItems: 'center', whiteSpace: 'pre-line' }}>{see}</div>
    <div style={{ background: '#FFFFFF', fontSize: 28, lineHeight: 1.4, padding: '14px 24px', display: 'flex', alignItems: 'center' }}>{fix}</div>
  </In>
);

const InstallErrors: Page = () => (
  <Shell source={<span>{'code.claude.com/docs/en/troubleshoot-install、github.com/openai/codex（README）'}</span>}>
    <Eyebrow><span>附錄｜安裝 4／4｜看錯誤訊息找解法</span></Eyebrow>
    <Heading><span>安裝時的常見錯誤</span></Heading>
    <Fit>
      <div style={{ border: `1px solid ${rule}` }}>
        <div style={{ display: 'grid', gridTemplateColumns: '760px 1fr', background: raised, fontSize: 24, fontWeight: 600, color: muted }}>
          <div style={{ padding: '12px 22px' }}>你看到</div><div style={{ padding: '12px 24px' }}>這樣做</div>
        </div>
        <ErrLine i={0} see={<span>{"command not found: codex\n無法辨識 'codex' 詞彙"}</span>} fix={<span><span>先重開視窗；還不行看第 </span>{pageOf(PathFixMac)}<span>（Mac）、</span>{pageOf(PathFixWin)}<span>（Windows）頁</span></span>} />
        <ErrLine i={1} see={<span>{"'irm' 不是內部或外部命令"}</span>} fix={<span>{"這是「命令提示字元」，改開 PowerShell 再貼"}</span>} />
        <ErrLine i={2} see={<span>{"找不到符合參數名稱 'fsSL' 的參數"}</span>} fix={<span>{"在 Windows 貼了 Mac 那行，改貼 irm 那行"}</span>} />
        <ErrLine i={3} see={<span>{"因為這個系統上已停用指令碼執行"}</span>} fix={<span><Path size={24}>{"Set-ExecutionPolicy -Scope CurrentUser RemoteSigned"}</Path></span>} />
        <ErrLine i={4} see={<span>{"codex --version 版本很舊"}</span>} fix={<span><span>以前用 npm 裝過：</span><Path size={24}>{"npm uninstall -g @openai/codex"}</Path></span>} />
        <ErrLine i={5} see={<span>{"syntax error near unexpected token '<'\n403、連線逾時"}</span>} fix={<span>{"網路擋住下載，改用手機熱點再跑一次"}</span>} />
      </div>
    </Fit>
  </Shell>
);

// ---------- Deck ----------

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
  title: 'aw-01 認識 AI，學會用 Codex',
  createdAt: '2026-10-17T02:58:08.906Z',
  theme: 'thoughtstream',
};

// Pages in deck order, recorded as the default export below is evaluated; pageOf reads it.
const ORDER: Page[] = [];
const slot = (page: Page) => { ORDER.push(page); return page; };

// Page order. The dev UI's reorder rewrites this literal and the notes literal below together.
export default [
  slot(Cover), slot(SpeakerIntro), slot(CourseMap), slot(Agenda),
  slot(Section1), slot(Evolution), slot(NextWordGame), slot(ProbTable), slot(OneByOne), slot(SameQuestion), slot(Randomness),
  slot(WhatIsHallucination), slot(RealHallucination), slot(WhyHallucinate), slot(CotWhat), slot(CotWhy), slot(ToolCalc), slot(ToolCompare), slot(CotPage), slot(WebSearch), slot(RagR), slot(RagA), slot(RagG), slot(OpenBookPage), slot(RagMiniPractice),
  slot(Section2), slot(AgentPage), slot(ChatVsCodex), slot(SameTaskTwoWays), slot(ChatGPTSelf),
  slot(Section3), slot(OpenTerminal), slot(TerminalAnatomy), slot(InstallCodex), slot(DownloadLab), slot(CdFolder), slot(CodexLogin), slot(CodexTrust),
  slot(Section4), slot(StartScreen), slot(StatusPage), slot(UsageToken), slot(SessionDesk), slot(MemoryLayers), slot(AgentsFile),
  slot(Section5), slot(OpenLab), slot(AgentsByHand), slot(RulePractice), slot(OutlinePrompt), slot(OutlineResult), slot(CheckSource), slot(PracticeVideo),
  slot(Recap), slot(NextLesson), slot(ReferencesModel), slot(ReferencesMethods),
  slot(NoPlan), slot(OpencodeSteps), slot(OpencodeRun), slot(OpenRouterRoute), slot(LocalLadder), slot(OllamaRoute),
  slot(InstallCompare), slot(PathFixMac), slot(PathFixWin), slot(InstallErrors),
] satisfies Page[];

function pageOf(page: Page) {
  return ORDER.indexOf(page) + 1;
}

const NOTES = new Map<Page, string>([
  [Cover, `00:00–01:00。
大家好，這是四堂 AI 工作坊的第一堂。今天兩件事：先弄懂 ChatGPT 這類 AI 怎麼寫出一段話、為什麼會寫錯；再把 Codex 用起來，請它照《三國演義》原文寫出前 21 回的大綱。
請大家先在筆電打開這份簡報，網址在畫面上：chrouos.github.io/AI-workshop-slides。等一下的提示詞連結和下載按鈕，都要在筆電上點；投影幕上的 QR code 只能用手機掃，手機上的東西貼不到筆電。所有教材也整理在 https://github.com/Chrouos/AI-workshop-slides/tree/main/examples 。`],
  [SpeakerIntro, `01:00–03:00。
我是黃懷萱，中央大學碩士，研究 NLP、LLM 和 RAG；現在在關貿網路做智慧客服，參與 EZ WAY、eHub、TTLL 等服務。今天會講到的 RAG，就是我平常在做的事。`],
  [CourseMap, `03:00–07:00。
四堂課只做一件作品：一座《三國演義》知識庫。
第 1 堂（今天）：用 Codex 照原文寫大綱，人名寫成 [[劉備]] 這種連結。
第 2 堂：把大綱放進 Obsidian，和講師準備的人物卡連起來。
第 3 堂：用 Skill 擴充卡片、排出時間軸。
第 4 堂：發布成網站，同學可以從首頁一路點進每張卡。
每一堂都接著上一堂的成果做，所以今天的大綱檔請一定要存好。`],
  [Agenda, `07:00–10:00。
今天五章：第一章以 GPT 為例，說明 AI 怎麼生成文字、為什麼會錯，以及 CoT、工具和 RAG 怎麼補救；第二章比較 ChatGPT 和 Codex；第三章從打開終端機開始，安裝 Codex、下載練習資料夾，在資料夾裡登入 Codex；第四章看懂 Codex 的畫面、Session、/status 和 Memory；第五章是練習 2，用 Codex 寫大綱。練習 1 用 ChatGPT，課後自己練，第二章結尾會告訴你在哪裡。
第五章大約 108 分結束，剩下的時間留給沒跑完的同學補做和提問。還沒裝好 Codex 的同學，現在就舉手，助教先過去協助安裝。`],
  [Section1, `10:00–10:30。
第一章：AI 怎麼走到今天，以 GPT 為例。我們用一條因果鏈來講，每一步都是上一步的問題逼出來的。`],
  [Evolution, `10:30–11:30。
先看這一章的地圖，分上下兩層。
上層是模型的限制：它只會猜下一個字；猜，所以有隨機性；猜錯了也說得很肯定，這叫幻覺。
按一下：下層是三種補救方法。Thinking，背後的做法叫 CoT 思維鏈，先列步驟；用工具，英文叫 Tool Calling，算數學就寫程式去算，像按計算機；Web Search，先查資料再回答，這就是 RAG。三種可以一起用，不是一個接一個。
按一下：Agent 把這些工具串起來，幫你把一件事做完。今天要用的 Codex 就是 Agent。
最後一下：三個限制，三種補救。接下來一個一個拆開看。`],
  [NextWordGame, `11:30–12:30。
GPT 是 Generative Pre-trained Transformer，生成式預訓練模型，名字不用背。這頁的專有名詞是「下一個 Token 預測」，它做的事很像文字接龍。
畫面上是「今天、天氣、很」，請大家喊一下，下一個字你會接什麼？
按一下：大部分人會接「好」。GPT 也是這樣：看前面的字，接一個最順的字。
最後一下：不管它看起來多聰明，底下一直在做的事就是猜下一個字。
畫面下方那行小字：這裡先用「字」講，比較好懂；模型實際切的單位叫 Token，可能是一個字、半個詞或幾個字母，第 ${pageOf(OneByOne)} 頁會再講。`],
  [ProbTable, `12:30–13:30。
它怎麼決定接哪個字？先看「下一個 Token 的機率分布」。左邊是已經寫出來的「今天天氣很」。
按一下：模型心裡有一張機率表。這些數字是示意，不是真的模型輸出：「好」58%、「熱」22%、「冷」11%、「不錯」9%。
最後一下：機率最高的字，最常被挑中。注意我說「最常」，不是「每次」，等一下講隨機性會用到。`],
  [OneByOne, `13:30–14:30。
這叫「自迴歸生成」：一句話是一格一格接出來的。第 1 輪接出「天氣」；按一下，第 2 輪拿「今天天氣」當前文，再接「很」；按一下，第 3 輪接「好」；按一下，第 4 輪接句號，結束。
按一下：每一格叫一個 Token，是 AI 讀寫文字的單位。中文的切法不一定剛好一字一格，這裡是示意。第四章講額度時還會用到這個詞。
最後一下：再長的回答，也是這樣一格一格接出來。`],
  [SameQuestion, `14:30–15:30。
這頁講「隨機取樣」。現場示範：打開 ChatGPT，問「用一句話介紹劉備」。
按一下：第一次的答案。（畫面上是示意。）
接著按 ChatGPT 的「重新產生」，按一下：第二次的答案不一樣。兩句都說得通，只是挑的字不同。
最後一下：答案不同，是因為每次抽到的字不一樣，不代表它壞掉了，這是設計上就有的隨機性。請大家自己也按兩次「重新產生」看看。`],
  [Randomness, `15:30–16:30。
為什麼會不一樣？取樣有個「溫度參數」，可以調整變化程度。先把機率表畫成轉盤：「好」占 58%，「熱」22%，「冷」11%，「不錯」9%（示意）。每次接字就轉一次。
按一下：這次停在「熱」。「好」的機率最高，還是可能轉到別的。
按一下：轉盤的隨機程度有個旋鈕，叫溫度。調低比較穩，調高比較多變。網頁版的 ChatGPT 不能調，知道有這個詞就好。
最後一下：會變，不代表錯；兩個答案都可能是對的。但有時候會變成錯的，下一頁就講這件事。`],
  [WhatIsHallucination, `16:30–17:30。
AI 幻覺，英文 Hallucination。像考試硬掰的學生：沒讀過，但寫得很順。
上面是講師實測的回答：在自己電腦用小模型 qwen3:1.7b（附錄備案 C 那頁）問「劉備字什麼」，它很肯定地說「劉備，字孔明」。語氣這一條是滿的。先問大家：對嗎？
按一下：和事實對不上。第 1 回原文寫「姓劉，名備，字玄德」；孔明是諸葛亮的字。它把兩個人搞混了，還說得很順。
最後一下：內容和事實對不上，語氣卻很肯定，就叫幻覺。注意：沒附來源、但內容是對的，不算幻覺；幻覺是指內容本身錯了。大模型比較少錯這種題目，但一樣會錯，下一頁看一個大模型的真實例子。`],
  [RealHallucination, `17:30–18:30。
真實案例。左邊大字：題目是一長串加法，2+4+7……+7953+34+356。早期 GPT-3.5 很肯定地回答 8402。右邊小圖是當時的實際畫面。
先問大家：你相信嗎？
按一下：打叉，錯了。
按一下：自己驗算，正確答案是 8484。
最後一下：它沒有真的去算，只是猜了一個看起來像答案的數字。現在的模型算術已經進步很多，後面幾頁講它們怎麼改進的。
圖片來源：IT 邦幫忙 https://ithelp.ithome.com.tw/articles/10315994`],
  [WhyHallucinate, `18:30–19:30。
幻覺的原因不只一個，這裡講最常見的一個。回到它產生答案的流程：它讀過大量文字，整理成一張機率表。
按一下：然後挑最常見的說法，直接說出口。
按一下：中間少了一步：查證。它不會停下來確認這句話對不對，所以很順的句子也可能是錯的。
其他原因，提一句就好：訓練資料裡本來就沒有、或寫錯的內容；資料有截止日期，比較新的事它不知道；題目問得太模糊，它就自己補。
最後一下：所以要請它先想、用工具，或給它資料。接下來幾頁就是這幾種補救。`],
  [CotWhat, `19:30–21:00。
解法一：Thinking。它背後的做法有個名字，叫思維鏈，英文 Chain of Thought，簡稱 CoT。像考試用草稿紙：先把過程寫出來，再寫答案。
先看題目：雞兔同籠，籠子裡有 35 個頭、94 隻腳。直接寫答案，和先寫過程，差在哪？
按一下：上面這排是直接寫答案：從題目一下子跳到「雞 20、兔 15」，這是示意的猜測，而且是錯的。
按一下：下面這排是先寫過程：先判斷題型、想公式、把數字套進去、計算，最後才是答案，一環扣一環。名字本身就在說這件事：思維是「想」，鏈是「一環扣一環」，合起來就是一步接一步的推理過程。
最後一下：一句話定義，CoT 就是讓模型在回答前，先把中間的推理步驟一步一步寫出來。
可以順帶一提：雞兔同籠是很老的題目，最早見於《孫子算經》。`],
  [CotWhy, `21:00–23:00。
這頁是重點。上面那行就是要回答的問題：前面說它只會猜下一個字，寫步驟為什麼會有用？用一題簡單的應用題來看：一盒鉛筆 12 枝，買 3 盒，送掉 5 枝，還剩幾枝？
按一下：回到猜下一個字。上面這排沒寫步驟：前文只有題目，它要猜的下一步就直接是答案，跳得很遠，可能隨手猜個 30（示意）。
按一下：下面這排寫了步驟：它先寫下「12×3＝36」，這行字就變成前文；接著寫「36－5＝」，下一步只要接出「31」。36 已經寫在紙上了，36 減 5 是很小、很好猜的一步。每一步都是一個好猜的小步。
按一下：讓它寫步驟有三種方法，一次出來：
一、在提示詞加一句「請一步一步想」，叫 zero-shot CoT。來源：Kojima et al. 2022, Large Language Models are Zero-Shot Reasoners, https://arxiv.org/abs/2205.11916
二、先給它一題有步驟的範例，它就會照樣寫步驟，叫 few-shot CoT。來源：Wei et al. 2022, Chain-of-Thought Prompting Elicits Reasoning in Large Language Models, https://arxiv.org/abs/2201.11903
三、Thinking、推理模型（像 ChatGPT 的 Thinking、OpenAI 的 o 系列）是產品功能：回答前會自動先做一次 CoT，你可能會看到「已思考 N 秒」。分清楚：CoT 是方法，Thinking 是幫你自動做這個方法的功能。
按一下：限制：步驟也是它自己寫的，寫錯一步，後面就跟著錯；算術還是在心算。
最後一下：先寫草稿再作答，比較不會跳錯。但算術還是心算，所以下一頁給它一台計算機。`],
  [CotPage, `26:00–28:00。
例子：雞兔同籠，把剛剛兩個概念串起來。藍色是 CoT（想步驟），橘色是 Tool Calling（工具算），右上角是圖例。用 Codex 實際跑一次。2026-10-18 在講師電腦上，codex-cli 0.154.0、模型 gpt-5.6-luna。提示詞：「雞兔同籠：籠子裡有 35 個頭、94 隻腳。雞和兔各有幾隻？請一步一步寫出你的想法：先判斷這是什麼題型、列出算式，最後的計算請用程式算。」
先看題目。
按一下：第 ① 步，判斷題型，這是 CoT。它說：「這是『雞兔同籠』題型，也就是用二元一次方程式解題。」
按一下：第 ② 步，想公式。設雞 x 隻、每隻 2 隻腳，兔 y 隻、每隻 4 隻腳：x＋y＝35，2x＋4y＝94。
按一下：第 ③ 步，套數字。第一式乘 2 得到 2x＋2y＝70，和第二式相減，2y＝24，所以兔 y＝12，雞 35－12＝23。
按一下：第 ④ 步，按計算機，這就是 Tool Calling。它真的執行了一行 Python，印出「23 12」。原始紀錄裡同一行指令還順便讀了講師電腦上一個無關的外掛說明檔，另有幾行 macOS 系統警告，畫面上都刪掉了，只留 Python 的部分。
按一下：第 ⑤ 步，答案：雞 23 隻，兔 12 隻。自己驗算：23×2＋12×4＝46＋48＝94，對。
最後一下：先想清楚步驟，這是 CoT；計算交給工具，這是 Tool Calling。兩個一起用，答案又清楚又準。下一頁換另一種工具：搜尋。`],
  [ToolCalc, `23:00–25:00。
解法二：用工具，英文叫 Tool Calling，工具呼叫。CoT 會想，但算術還是在心算；所以現在的 AI 遇到計算，不在腦中硬算，而是寫一行程式、或呼叫一個工具，讓工具算出結果，就像把算式輸入計算機、按下等號。畫面上那行就是定義：模型寫一行程式或呼叫工具，讓工具算出結果。
先看題目，一長串加法。
按一下：計算機。寫程式算，就是把數字輸進去、按「＝」。
按一下：這是 Codex 的實際輸出，2026-10-18 在講師電腦上跑的，codex-cli 0.154.0、模型 gpt-5.6-luna。提示詞是：「2 + 4 + 7 + 9 + 23 + 1 + 5 + 7 + 2 + 5 + 74 + 2 + 7953 + 34 + 356 = ? 請用程式算出來，告訴我答案。」它執行了一行 Python：print(sum([...]))，2.8 秒得到 8484，最後回答「用 Python 程式計算結果是：8484」。原始紀錄裡還有幾行 macOS xcodebuild 和沙盒的系統警告，和題目無關，畫面上刪掉了。
ChatGPT 也會這樣做：它有寫程式的工具，畫面上可能會出現「已分析」或一段程式碼，就是它去按計算機了。
最後一下：算出來的，不是猜出來的。計算機每次都給同一個答案，這裡就沒有隨機性的問題。`],
  [ToolCompare, `25:00–26:00。
同一題長加法，三種做法排在一起：猜、心算、按計算機。先請大家猜：哪一種最可信？
按一下：左邊是直接回答，等於用猜的。卡片上是 2026 年 9 月 ChatGPT 的真實畫面：我故意要求它「不可以偷偷計算」，它就老實說「我不算，純猜：8460」。錯，而且每次問可能都不一樣。
按一下：CoT，也就是 Thinking，等於心算、列步驟：這次得到 8484，但步驟是它自己寫的，可能錯，所以還是要核對，不能當成一定對。
按一下：Tool Calling 等於按計算機：8484，每次都一樣。為什麼比較可信？可以重跑一次看結果一不一樣，也看得到它輸入了什麼算式，數字有沒有抄錯。
最後一下：要算得準，就讓它按計算機。下一頁用一個例子，把 CoT 和 Tool Calling 串起來：雞兔同籠。`],
  [WebSearch, `28:00–29:30。
解法三：搜尋也是一種工具，一樣是 Tool Calling。計算機幫它算，搜尋幫它查。這是 ChatGPT 的實際畫面：問「最近的台灣新聞」，它先顯示「正在搜尋 2 個網站」，標 1 的地方：中央社和路透社。
按一下：回答裡附了來源標籤，像這裡的「中央社 CNA」，點得開、查得到。
最後一下：先查資料再回答，這個做法有個名字叫 RAG。在這一課，搜尋找到的網頁內容，就是 RAG 裡「檢索來的資料」；第五章換成資料夾裡的原文。接下來拆成三步：R、A、G。`],
  [RagR, `29:30–31:00。
剛剛說搜尋是一種工具，R 就是用這個工具的那一步。
RAG 全名 Retrieval-Augmented Generation，檢索增強生成。第一步 R，檢索。像去圖書館，先找到那本書。
問題是：曹操說「天下英雄」那句在哪一回？
按一下：去哪裡找？可以是網路、你上傳的檔案，或你電腦裡的資料夾。今天的練習用的就是資料夾。
按一下：找到第 21 回〈曹操煮酒論英雄〉，而且找到相關的那一段。
最後一下：先找到資料，後面才有根據。`],
  [RagA, `31:00–32:30。
工具查回來的東西，要交給 AI 才有用。
第二步 A，增強。手上有兩樣東西：問題，和 R 找到的那一段原文。
按一下：把兩樣東西裝進同一個包裹，一起交出去，像寄包裹題目和資料放同一箱。
按一下：AI 收到的就不只是題目，還有資料可以照著讀。
最後一下：題目加上資料，AI 就不用硬猜。`],
  [RagG, `32:30–34:00。
最後一步，AI 照工具查回來的資料回答。
第三步 G，生成：照資料回答。畫面上是示意的回答，引的句子是真的：第 21 回，曹操說「今天下英雄，惟使君與操耳。」
按一下：回答附上出處，維基文庫第 21 回。
按一下：點開出處，找得到同一句，就代表它不是瞎掰的。
最後一下：有來源不等於一定正確。來源可能被誤讀，引的句子也可能被改過一兩個字。第五章的練習，最後一步就是請 Codex 指出大綱根據原文哪一句，再自己打開原文核對。`],
  [OpenBookPage, `34:00–35:00。
把三步合起來，RAG 就像開書考。
左邊是閉書考：一般 GPT 只靠記憶作答，記錯了也會寫得很順。
按一下：右邊是開書考：R 先翻到那一頁，A 把書上那段和題目對照著看，G 照書作答，答案還附頁碼，老師可以翻回去對。
最後一下：今天後面的大綱練習，就是一場開書考：書是資料夾裡的 21 回原文。
來源：https://arxiv.org/abs/2005.11401`],
  [RagMiniPractice, `35:00–38:00（小練習 3 分鐘）。
請大家打開自己的 ChatGPT，挑一個自己真的有興趣、最近可能有新資訊的問題。可以問最近的球賽、想去的地方，或一項科技的最新進展。
如果介面能選 Thinking，先選好。輸入畫面上的提示詞，把空格換成你的問題。
按一下：回答後看畫面上三個地方：一，有沒有顯示「已思考」；二，有沒有顯示搜尋活動；三，有沒有可以點開的來源。點開其中一個來源，找出支撐答案的那一句。
提醒：不同版本的介面名稱會不同；只有來源連結，能支持它查過資料，不能單憑連結證明它用了 Thinking。若找不到 Thinking，就記下你看到什麼，不用硬湊。
最後一下：看得到來源，還要親自點開核對。請一兩位分享：你問了什麼？來源真的支持答案嗎？`],
  [AgentPage, `38:30–40:30。
第二章先認識 AI 代理，英文 Agent。它能規劃步驟、使用工具，像會自己動手的實習生。這裡示範需要你確認的操作。
你交代任務，它提出要做的動作，例如「我要建立 hello.md，內容是……」。
按一下：你檢查。當 Codex 跳出確認畫面時，看過它要做的事，再選 Yes, proceed。是否詢問取決於權限設定：預設在練習資料夾裡建檔、改檔多半直接做，不會問；要動到資料夾外面才會跳出來（第三章會再看到）。
按一下：它執行，再回報結果，等你決定下一步。提出動作、你檢查、執行、回報，這一整圈就是 Agent 在做的事。
最後一下：Codex 就是一種 Agent，會真的動手做，做完回報。遇到確認畫面時，重點是看清楚它要做什麼，再放行。下一頁比較它和 ChatGPT。`],
  [Section2, `38:00–38:30。
第二章：ChatGPT 與 Codex。先看 Codex 所屬的 Agent 怎麼執行任務，再比較兩個產品的用法。`],
  [ChatVsCodex, `40:30–45:00。
ChatGPT 是對話框：你問一句，它回一段話，適合發想、請它解釋、找資料。
按一下：Codex 在你電腦的資料夾裡工作：你交代一件事，它自己打開資料夾裡的檔案來讀，做完再存成新檔。
最後一下：ChatGPT 幫你想清楚，Codex 幫你做完。這是本課的分工方式，不是規定：ChatGPT 也能上傳檔案，Codex 也能聊天。Claude 也有類似的分工：Claude 對話，和 Claude Code。`],
  [SameTaskTwoWays, `45:00–49:00。
用今天的作業來比。如果用 ChatGPT 寫 21 回的大綱：你要打開 21 個檔、一段一段複製貼上，它回一段話，你再自己存成檔，你動手 3 次，而且 21 回的全文很長，要貼很多次。
按一下：用 Codex：你交代一句，它自己去讀 原文/ 資料夾，寫完直接存好檔案，你只動手 1 次。
最後一下：這份作業的 21 回原文本來就是檔案，放在資料夾裡；Codex 能直接讀，寫好也直接存成檔案，所以在資料夾裡做。下一頁先交代一個回家自己練的 ChatGPT 練習。`],
  [ChatGPTSelf, `49:00–50:00。
練習 1 用 ChatGPT，課堂上不做，回家自己練，大約 15 分鐘。三步都問同一題：《三國演義》第 21 回，劉備聽完曹操說「天下英雄只有你我」，做了什麼？為什麼？
第一步，先不給資料問，看它憑記憶怎麼答。第二步，追問「你說的原因，原文哪一句寫的？」，自己點開維基文庫，用 Cmd+F 或 Ctrl+F 找那一句。第三步，開新對話，附上一小段原文再問，比比看答案差在哪。
提示詞在 prompts.md 的「練習 1」，掃這個 QR code 或點連結就能打開：${PROMPTS_URL} 。等一下第三章會下載練習資料夾 aw-01-lab，做完可以對照裡面 ChatGPT_練習 資料夾的參考結果，有截圖和每題的重點。
今天課堂上的練習 2，用的是同一個概念：先找資料再回答，而且要回原文核對。`],
  [Section3, `50:00–50:30。
第三章：安裝 Codex。前兩章都在瀏覽器裡；Codex 要裝在電腦上，才能讀你資料夾裡的檔案。課前已經裝好的同學，這幾頁當複習，順便幫旁邊的人看一下。`],
  [OpenTerminal, `50:30–53:00。
裝 Codex 之前，先打開終端機。很多人沒用過，沒關係，這頁跟著做。
Mac：按 command 加空白鍵，叫出 Spotlight 搜尋框，打 terminal，按 return。中文介面的 App 叫「終端機」，打中文也找得到。找不到的話，從「應用程式 → 工具程式 → 終端機」打開。
Windows：按鍵盤上的 Windows 鍵，或點左下角開始，打 powershell，選「Windows PowerShell」。不要選「以系統管理員身分執行」，一般開就好。也不要開到「命令提示字元」，它的開頭沒有 PS，等一下的安裝指令在那裡跑不動。
按一下：打開後會看到這樣的視窗。Mac 的開頭是你的帳號名稱，最後一個符號是 %；Windows 的開頭是 PS。Mac 的終端機可能是白底黑字，跟畫面顏色不一樣沒關係。
最後一下：看到游標在閃，就能打字了。打開了的同學舉個手；還沒打開的，旁邊的人幫忙看一下。`],
  [TerminalAnatomy, `53:00–56:00。
終端機就是 CLI，英文 Command Line Interface，命令列介面。平常的 App 用滑鼠點按鈕；這裡沒有按鈕，要打一行字告訴電腦做什麼。等一下的 Codex 也是在這種視窗裡用的。
先看第一行。前面這段叫提示字元，代表電腦在等你打字。Mac 的 ~ 代表你現在在哪個資料夾，~ 是你的使用者資料夾；Windows 是 PS C:\\Users\\你的名字>，意思一樣。
按一下：請大家跟著打 echo hello，按 Enter。不用照投影片一個字一個字打的時候，也可以貼上：Mac 按 command+V，Windows 按 Ctrl+V，或在視窗裡按右鍵。
按一下：結果印在下一行。echo 的意思是「照著唸出來」，你打什麼，它就回什麼，所以印出 hello。
按一下：提示字元又出現了，代表這行指令做完了，可以打下一行。指令還在跑的時候，提示字元不會出現，這時就先等，別急著打。等一下裝 Codex 要跑一陣子，就是看這個。
注意：終端機裡不能用滑鼠點來移動游標，要用鍵盤的左右鍵。打錯了用 Delete 或 Backspace 刪掉重打就好。`],
  [InstallCodex, `56:00–59:00。
終端機打開了，接著直接安裝 Codex CLI，不用先裝 Node.js，也不用 npm。依你的作業系統選一行，不要兩行都跑。
Mac 或 Linux：在剛才的終端機貼上 curl -fsSL https://chatgpt.com/codex/install.sh | sh，按 Enter。
Windows：在剛才的 PowerShell 貼上 irm https://chatgpt.com/codex/install.ps1 | iex，按 Enter。這是官方 PowerShell 獨立安裝程式，Windows 也不必用 npm。
等安裝完成，關掉並重新開啟終端機或 PowerShell，輸入 codex --version。看到 codex-cli 加版本號就表示裝好了，版本號每台電腦可能不同。
如果找不到 codex 指令，先確認已重開視窗；仍不行，照附錄第 ${pageOf(PathFixMac)}（Mac）或第 ${pageOf(PathFixWin)}（Windows）頁把資料夾加進 PATH，其他錯誤訊息對照第 ${pageOf(InstallErrors)} 頁。公司電腦若有政策限制，請助教協助。
看到版本號就好，先不要打 codex：要先下載練習資料夾、cd 進去，再在那裡打 codex 登入。
來源：https://learn.chatgpt.com/docs/codex/cli 、https://learn.chatgpt.com/docs/config-file/environment-variables 。這裡依官方文件列出指令，未在 Windows 實機測試。`],
  [DownloadLab, `59:00–61:30。
Codex 裝好了，先把等一下要用的練習資料夾下載下來，Codex 要在這個資料夾裡工作。
在筆電打開這份簡報，按下載按鈕，會下載 aw-01-lab.zip：${LAB_ZIP_URL} 。手機掃 QR code 會下載到手機，請用筆電按按鈕。解壓縮後打開，要看到 ChatGPT_練習、Codex_練習 兩個資料夾，和 prompts.md、README.md；Windows 的「全部解壓縮」常多包一層，看到另一個 aw-01-lab 就再點進去。建議解壓縮在「下載」資料夾就好，等一下比較好找。資料夾也可以在 GitHub 上瀏覽：${LAB_URL}
裡面有：ChatGPT_練習，練習 1 的參考結果，課後自己練完再看。Codex_練習，今天打開 Codex 的地方，裡面只有 原文/ 和 回目.md：原文/ 是第 1 到 21 回的全文，一回一個檔，取自維基文庫，是公有領域；回目.md 是 21 回的回目清單。這個資料夾只放 Codex 要讀的東西，別的檔案不會干擾它。prompts.md 是兩個練習的提示詞，請直接從這裡複製；README.md 是資料夾說明。`],
  [CdFolder, `61:30–64:00。
現在的終端機還在家目錄，提示字元是 ~。Codex 只在你所在的資料夾裡讀檔、存檔，所以要先走進練習資料夾。cd 就是 change directory，換資料夾。
打 cd，再打一個空格。接著打開 Finder 或檔案總管，找到剛才解壓縮的 aw-01-lab，打開它，把裡面的 Codex_練習 資料夾拖進終端機視窗，路徑會自己出現，按 Enter。這樣不用自己打路徑，也不會打錯。
按一下：提示字元變了。Mac 從 ~ 變成 Codex_練習；Windows 的 PS 後面那串路徑，結尾會變成 Codex_練習。看到這個就代表進去了。
按一下：打 ls，按 Enter，列出這個資料夾裡有什麼。Mac 和 Windows 的 PowerShell 都能用 ls。要看到 原文 和 回目.md 兩個。
如果看到的是 ChatGPT_練習、Codex_練習、prompts.md，代表拖成外面那層 aw-01-lab 了：打 cd Codex_練習 再進去一層，再 ls 一次。
拖不進去的話，也可以自己打：Mac 是 cd ~/Downloads/aw-01-lab/Codex_練習，Windows 是 cd ~\\Downloads\\aw-01-lab\\Codex_練習（假設解壓縮在「下載」）。`],
  [CodexLogin, `64:00–66:00。
在剛才 cd 進去的練習資料夾，打 codex，按 Enter。提示字元前面要是 Codex_練習。第一次打開會先問你怎麼登入。畫面上的英文是 Codex 0.154.0 的原文，版本不同，字可能差一點。
選 1. Sign in with ChatGPT，它本來就停在第一項，直接按 Enter。Plus、Pro、Business、Enterprise 方案含 Codex 用量；其他方案請看最後的附錄備案。
按一下：瀏覽器會自己打開 ChatGPT 的登入頁，用你的 ChatGPT 帳號登入，按繼續。登入完會看到這頁：You're signed in and may close this tab，意思是登入好了，分頁可以關掉。下面的 Open Codex 按鈕不用按，那是開桌面版 App 的。
瀏覽器沒有自己打開的話，終端機會顯示 Finish signing in via your browser，下面有一串網址，把它複製到瀏覽器打開就好。
按一下：回到終端機，看到 ✓ Signed in with your ChatGPT account，就是登入成功，再按 Enter 繼續。
如果你是課前裝的，打開時可能先跳出「✨ Update available!」，問你要不要更新，上課先選 2. Skip，按 ↓ 再按 Enter。
講師 2026-10-29 用 Codex 0.154.0 在 Mac 上擷取：登入選單是在沒登入的全新設定下拍的；成功頁是 Codex 內建的那一頁。`],
  [CodexTrust, `66:00–67:00。
登入之後，它接著問：Do you trust the contents of this directory? 你信不信任這個資料夾？
先看第一行 You are in，後面是 Codex 現在所在的資料夾，要是剛才 cd 進去的那個。
按一下：結尾是 Codex_練習，它本來就停在 1. Yes, continue，直接按 Enter。信任之後，Codex 在這個資料夾裡建檔、改檔多半不會再問你；要動到資料夾外面的檔案時，會跳出 Would you like to make the following edits?，看過再選 Yes, proceed。
按一下：如果 You are in 後面只有 /Users/你的名字（Windows 是 C:\\Users\\你的名字），代表忘了 cd，Codex 開在家目錄。家目錄裡什麼都有，不要信任它：按 ↓ 移到 2. No, quit，按 Enter 離開，回上一頁 cd 進練習資料夾，再打一次 codex。
看到 Codex 的輸入列，› 後面可以打字，第三章就完成了。輸入 /quit 可以先離開，第五章再回來；畫面怎麼看，下一章講。
講師 2026-10-29 實測（Codex 0.154.0，Mac）：在全新的資料夾打 codex，選項就是 1. Yes, continue、2. No, quit。`],
  [Section4, `67:00–67:30。
第四章：看懂 Codex。依序看啟動畫面、/status、額度和 Token、Session、Memory。`],
  [StartScreen, `67:30–69:30。
這是 Codex 0.154 的啟動畫面（教材範例，帳號已隱藏）。
按一下：model，現在用哪個模型。名稱會隨版本和帳號變，不用背。
按一下：directory，它在哪個資料夾工作，讀檔、存檔都在這裡。這張圖是講師的另一個練習資料夾，你的會不一樣。
按一下：下面有「›」的那一列，是打字的地方，中文直接打，按 Enter 送出。`],
  [SessionDesk, `75:30–78:00。
/status 裡有一行 Session，現在來講它是什麼。Session 是一次工作階段，像一張工作桌。你交代的任務（例如寫第 1 回大綱）、它讀過的檔案（原文/第001回.txt）、它的回答、你的追問，都堆在同一張桌上，所以你可以說「剛剛那段改短」，它知道你指哪段。
按一下：輸入 /new 會換一張新桌子，新的桌子是空的，前面講過的它都看不到。這時候說「剛剛那段改短」，它不知道是哪段。
最後一下：同一件事，留在同一個 Session 做完；換一件事，就開新的。下一頁接著看：換了 Session，你交代過的規則要怎麼留下來。`],
  [StatusPage, `69:30–72:30。
這頁我示範，大家先看就好；練習 2-1 進到練習資料夾以後，再自己打一次。在 Codex 輸入 /status，畫面上的欄位很多，今天只看一行。
按一下：Directory，它在哪個資料夾工作。結尾要是你的練習資料夾 Codex_練習。它讀檔、存檔都在這裡，資料夾錯了，後面全部白做。
按一下：其他欄位先知道就好：Model 是用哪個模型；Permissions 是能不能改你的檔案，Workspace 代表它能直接改這個資料夾裡的檔案，要動到資料夾外面才會先問你（依 Codex 文件）；Session 是這次工作階段的編號，後面再講。最下面兩行是額度，下一頁講。
2026-10-24 實測（Codex 0.154.0 互動介面，Mac）：/status 由上到下是 Model、Model provider、Directory、Permissions、Agents.md、Account、Collaboration mode、Session，最下面是 5h limit 和 Weekly limit 兩行。預設設定下 Permissions 顯示「Workspace (Ask for approval)」；還沒有 AGENTS.md 時，Agents.md 那行是 <none>。講師自己的電腦改過設定，會顯示「Workspace (Approve for me)」，不要照講師的抄。Account 那行會露出 email，投影時注意。
最後一下：動手前，先看 Directory 對不對。等一下的練習，第一件事就是做這個。`],
  [UsageToken, `72:30–75:30。
兩個容易混的詞，像手機方案：月租額度，和你用掉的流量。
Usage 是帳號這段時間還能用多少，就是 /status 最下面那兩行：5 小時額度、每週額度。用完要等它重置。
按一下：Token 是 AI 讀寫文字的單位，前面接龍那頁講過。你的提示詞、它讀到的檔案、前面的對話，加起來就是這次用掉的 Token。
最後一下：讀的檔越多，Token 越多，額度用得越快。所以交代時把範圍講清楚，例如「只讀 原文/」，就不會浪費。`],
  [MemoryLayers, `78:00–81:00。
Memory 是 Codex 能延續的上下文，分兩層。像口頭交代，和貼在牆上的公告。
第一層，Session 內的記憶：在 Session 1 說「只根據 原文/ 回答」，它會照做；但打 /new 開新 Session，這條規則就不見了。
按一下：第二層，專案裡的記憶：把規則寫進資料夾裡的 AGENTS.md，Codex 每次開 Session 都會先讀，所以新的 Session 也照做。/status 裡 Agents.md 那一行，說的就是這個檔。
最後一下：講清楚範圍。聊天裡說的，只留在這個 Session；AGENTS.md 寫在這個資料夾裡，在這個資料夾開 Codex 每次都會讀，換到別的資料夾就不會讀。Codex 不會永久記住你們聊過什麼，重要的規則請寫進檔案。`],
  [AgentsFile, `81:00–84:00。
AGENTS.md 長什麼樣子？它就放在練習資料夾最上層，內容是幾條規則。畫面上的內容是示意，等一下練習 2-2，你會自己用文字編輯器建一個。
按一下：之後每開一個 Session，Codex 都會先讀這個檔，照著做。
最後一下：它就是普通的文字檔，用記事本打開就能改。`],
  [Section5, `84:00–84:30。
第五章：用 Codex 寫大綱。今天的作品就在這一章完成。`],
  [OpenLab, `84:30–87:30（練習 3 分鐘）。
練習 2-1，回到練習資料夾。第三章已經 cd 進去過；如果終端機關掉了，就像第三章那樣，打 cd 和一個空格，把 Codex_練習 資料夾拖進視窗，按 Enter。
按一下：打 ls，按 Enter。Mac 和 Windows 的 PowerShell 都能用；Windows 的命令提示字元請打 dir。要看到 原文、回目.md 兩個。
按一下：右邊兩種結果。ls 看得到原文，就可以打 codex。ls 看到的是 Codex_練習、ChatGPT_練習，代表還在外面那層 aw-01-lab：打 cd Codex_練習 進去，再 ls 一次。
按一下：確認好了，再打 codex。第三章已經信任過這個資料夾，不會再問；如果還是跳出來，確認 You are in 結尾是 Codex_練習，再選 Yes, continue。進去後輸入 /status，看 Directory 那一行（畫面為示意，路徑依電腦而定）。
按一下：Directory 結尾是 Codex_練習，就可以開始了。開了 Codex 才發現不對，打 /quit 離開，再重新 cd。`],
  [AgentsByHand, `87:30–92:30（練習 5 分鐘）。
練習 2-2 第 1 步：自己建 AGENTS.md。上一章說過，它就是一個普通的文字檔，所以用電腦內建的文字編輯器就能寫。Codex 先開著沒關係。
規則從 prompts.md 的「練習 2-2」複製，三行：回答問題時，只根據 原文/ 資料夾裡的文字；找不到就說「原文/ 裡找不到」；每次回答的最後一行寫「出處：原文/第00N回.txt」。
Mac 用「文字編輯」：按 command＋空白鍵，打 textedit 打開，按「新增文件」。先到選單「格式 → 製作純文字」，這步很重要，不然存出來是 rtf，Codex 讀不懂。貼上規則，按 command＋S，檔名打 AGENTS.md，位置選 Codex_練習。跳出「要使用 .md 還是 .txt」，選「使用 .md」。
Windows 用「記事本」：按 Windows 鍵打「記事本」打開，貼上規則，選「檔案 → 另存新檔」，位置選 Codex_練習，存檔類型改成「所有檔案」，檔名打 AGENTS.md，編碼用 UTF-8，按存檔。存檔類型沒改的話，會存成 AGENTS.md.txt。
按一下：檔名要剛好是 AGENTS.md，大寫，副檔名是 .md。存成 AGENTS.md.txt 或 AGENTS.rtf，Codex 都不會讀。Windows 預設會把副檔名藏起來，看不出來的話，用終端機打 ls 確認（Codex 開著時，先開另一個終端機視窗再 cd 進去）。`],
  [RulePractice, `92:30–96:30（練習 4 分鐘）。
練習 2-2 第 2 步。這頁延續第 ${pageOf(MemoryLayers)} 頁的比喻：AGENTS.md 是貼在牆上的公告，/new 是換一張新桌子。我們來驗證：換了新桌子，它還會不會看牆。
規則最後那句「最後一行寫出處」是故意加的：它憑記憶答題不會寫這行，所以看得出新的 Session 有沒有讀到規則。
按一下：回到 Codex，輸入 /new，換一張新桌子，再問「劉備第一次出場在第幾回？」。最後一行是「出處：原文/第001回.txt」這種格式，就代表新的 Session 讀了規則。
按一下：對照題，問「諸葛亮第一次出場在第幾回？」。前 21 回他還沒出場，只有第 9 回一首詩提到「諸葛隆中臥」。照規則，它要說原文/ 裡找不到，不能憑記憶報回數。右下角那行是對照：同一個資料夾拿掉 AGENTS.md 再問，它直接答「第三十七回」，那是它憑記憶說的，原文/ 裡沒有。
最後一下：換了新桌子，還是照牆上的公告做。重要的規則寫進 AGENTS.md，不要只在聊天裡講。
2026-10-24 實測（Codex 0.154.0 互動介面，Mac，gpt-5.6-luna）：當時是請 Codex 寫 AGENTS.md，內容和這三行一樣。輸入 /new 後問劉備，答「劉備第一次出場在第一回，文中以「姓劉，名備，字玄德」介紹。」，最後一行「出處：原文/第001回.txt」；再問諸葛亮，答「原文／裡找不到諸葛亮正式出場；只在第九回詩句中提到「諸葛隆中臥」。」，最後一行「出處：原文/第009回.txt」。找不到也照樣附出處，是規則寫了「每次回答」的關係。自己用文字編輯器建的檔案，Codex 讀法一樣；這個版本講師還沒在課堂流程實跑過。
另外用 codex exec 試過（同一天）：同一個資料夾拿掉 AGENTS.md 再問諸葛亮，它直接答「第三十七回」。
如果沒生效：先打 /quit 關掉，再打 codex 重開一次；還是不行，回去檢查檔名是不是剛好 AGENTS.md、有沒有存在 Codex_練習 裡。`],
  [OutlinePrompt, `96:30–101:30（練習 5 分鐘，Codex 跑約 1 分半）。
練習 2-3，今天的主菜。從 prompts.md 複製完整提示詞：
【定位】
請讀 原文/ 資料夾裡第 1 回到第 21 回的文字。
【期望輸出】
寫成一個檔案：三國演義大綱.md。
每一回一個段落，標題寫成「## 第 N 回 回目」。
每段寫 2 到 3 句，說這一回發生了什麼事。
內文的人名都寫成 Obsidian 連結，例如 [[劉備]]；標題裡的人名不用加連結。
事件名稱如果第二堂的筆記庫已經有卡，也寫成連結：[[桃園結義]]、[[煮酒論英雄]]。
每段最後一行寫「出處：原文/第00N回.txt」。
【限制】
只能用原文裡的內容，原文沒寫的事情不要加。
寫入檔案前，先給我看內容，等我說可以再寫。

流程：Codex 先讀完 21 個檔。
按一下：它會先把草稿給你看。
按一下：你回「可以，存檔」，它就直接寫進資料夾，不會再跳確認畫面。資料夾裡會多一個三國演義大綱.md。
2026-10-24 實測（Codex 0.154.0 互動介面，Mac，gpt-5.6-luna）：它讀完 21 回，先把 21 段草稿貼在畫面上，最後一句是「如果內容可以，請回覆「可以」，我再建立 三國演義大綱.md。」，這時資料夾裡還沒有檔案。回「可以」之後，畫面出現「Added 三國演義大綱.md (+125 -0)」，沒有跳確認畫面；檔案 21 段，標題沒有連結。這次草稿裡的人名沒加 [[ ]]，存進檔案時才加上，所以看草稿時不用急著糾正，存好後打開檔案看就好。
按一下：完成的樣子：資料夾裡出現三國演義大綱.md，打開看每段最後都有出處。
按一下：最低完成：時間不夠的話，先把提示詞裡的「第 1 回到第 21 回」改成「第 1 回到第 2 回」，做出兩段並附出處；做完再請它擴到 21 回。
講師實測大約 1 分 38 秒寫完，這只是讓大家知道要等多久，快慢和寫得好不好無關。等的時候可以看它讀了哪些檔。
人名一律用本名寫連結：玄德是劉備、雲長是關羽、翼德是張飛、孟德是曹操。
跑壞了、或時間到還沒跑完：先用講師的範例成果，第二堂照樣接得上：https://github.com/Chrouos/AI-workshop-slides/blob/main/examples/aw-01-sample-output/三國演義大綱.md （prompts.md 練習 2-3 下面也有這個連結）。
Windows：Codex 在 Windows 讀這些中文檔會不會變亂碼，講師沒有實測（檔案是 UTF-8）。如果它說讀到亂碼，跟它說「請用 UTF-8 讀取 原文/ 的檔案」。`],
  [OutlineResult, `101:30–103:30。
這是講師電腦上用 Codex 0.154 實跑的結果，21 段。速度不代表品質，寫得好不好要看下一頁的核對。
按一下：人名都變成 [[連結]]，第二堂放進 Obsidian 就能連到人物卡。
按一下：每段最後都附了出處，21 段、21 個出處。
按一下：有個小毛病：它把回目標題裡的人名也改了，「張翼德怒鞭督郵」變成「[[張飛]]怒鞭督郵」，「何國舅」變成「[[何進]]」，回目就不是原文了。講師實測時用的是舊版提示詞；補上「標題裡的人名不用加連結」之後重跑（2026-10-17），21 段的標題都沒有連結了。你如果還是遇到，就跟它說：「標題照回目原文，不要加連結」。`],
  [CheckSource, `103:30–107:30（練習 4 分鐘）。
練習 2-4：核對也交給對話來做。先請 Codex 指出根據，貼上 prompts.md 的「練習 2-4」：三國演義大綱.md 第 N 回那段的第二句，根據原文哪一句？引用原句。N 換成你想查的回數。這裡用講師範例的第 21 回當例子，第二句是「劉備奉命出兵截擊袁術後脫離曹操，關羽又設計斬殺徐州刺史車冑，重新占據徐州」。
按一下：它引用了原句，例如「我有一計，可殺車冑：乘夜扮作曹軍到徐州，引車冑出迎，襲而殺之。」並寫出處。這是講師實測（2026-10-24，codex exec 對範例大綱），它還多引了一句「術若投紹，必從徐州過……」。
按一下：自己查。打開 原文/第021回.txt：Mac 按右鍵，選「打開方式」再選「文字編輯」；Windows 按右鍵，選「開啟檔案」再選「記事本」。按 Cmd+F 或 Ctrl+F，貼上引用句裡的四、五個字，例如「可殺車冑」。找得到，這句就有根據；找不到，回 Codex 說「原文/第021回.txt 裡找不到這句，請重新確認」。
按一下：再看標題。把大綱那段的標題，和 回目.md 第 21 回比一比。講師舊版的大綱就是在這裡出錯：「張翼德」被改成 [[張飛]]。
最後一下：引用的句子搜得到、標題和回目一字不差，這段才算核對過。抽查兩段對了，只代表這兩段；整份還是要分段核對，例如每次五回。在自己的資料上查證，就是 RAG 的最後一關。
時間不夠就先做一段，有時間再做第二段。`],
  [PracticeVideo, `107:30 起（影片約 5 分鐘）。
練習講完，放一次講師的實作影片，從頭到尾看一遍整個流程。按影片的播放鍵開始；右邊的時間可以直接跳段，時間不夠就從 2:08 寫大綱那段開始看。影片沒有聲音，邊放邊講。
先講一句：影片裡用的是 OpenCode 加免費的 DeepSeek 模型，不是 Codex。步驟完全一樣：cd 進 Codex_練習、打開工具、貼提示詞。沒有 ChatGPT 方案的人，附錄有 OpenCode 的裝法。
0:00 先 cd 進 Codex_練習，打 ls 看到 原文 和 回目.md，再用 cat 看 AGENTS.md 裡的三條規則。
0:22 打開 OpenCode，打 free 篩出免費模型，選 DeepSeek。
0:56 問「劉備第一次出場在第幾回？」它讀原文，回答第 1 回，最後一行附出處，還照規則給了笑臉。
1:32 問「諸葛亮第一次出場在第幾回？」這題是陷阱：前 21 回諸葛亮還沒登場。它搜了原文，老實說找不到，只在第 9 回的詩裡提到「諸葛」。這就是 AGENTS.md 那條「找不到就說找不到」在發揮作用。
2:08 貼上練習 2-3 的提示詞。它一回一回讀完 21 個檔，大約一分半寫出草稿。
3:48 它問「要我直接寫入 三國演義大綱.md 嗎？」回「寫入」，它就存進資料夾。最後回到終端機打 ls，多了 三國演義大綱.md。
放這段影片，後面每頁的時間都會往後延約 5 分鐘；時間緊就只放 2:08 之後。`],
  [Recap, `107:30–111:30。
回顧五章。一、GPT 在猜下一個字，會猜錯也會說得很肯定。二、ChatGPT 幫你想清楚，Codex 在資料夾裡幫你做完。三、用官方獨立安裝程式裝好 Codex，並用 codex --version 確認。四、Codex 裡先看 /status 的 Directory，重要的規則寫進 AGENTS.md。五、用 Codex 照原文寫出大綱，每段附出處。
最後一下：AI 寫的東西，回原文核對過才算數。`],
  [NextLesson, `111:30–115:30。
下一堂把今天的大綱放進 Obsidian。
左邊是今天的三國演義大綱.md，人名都是 [[連結]]。
按一下：放進筆記庫後，[[劉備]]、[[關羽]]、[[張飛]]、[[曹操]]、[[孫權]] 會連到講師準備的人物卡，大綱就變成一張網。
按一下：還沒有卡的人名，例如董卓、呂布，會是淡紫色連結（比有卡的紫色淡），下一堂再決定要不要補卡。
按一下：請在下一堂前先安裝 Obsidian：https://obsidian.md 。大綱檔請存好，下一堂要用。`],
  [ReferencesModel, `（課後自讀，上課不講。）
第 1 章前半用到的論文，按章節排。arXiv 編號可以直接打 arxiv.org/abs/編號 打開。
猜下一個字、Token：
- Vaswani et al. 2017, Attention Is All You Need. https://arxiv.org/abs/1706.03762
- Radford et al. 2018, Improving Language Understanding by Generative Pre-Training（GPT-1）. https://cdn.openai.com/research-covers/language-unsupervised/language_understanding_paper.pdf
- Brown et al. 2020, Language Models are Few-Shot Learners（GPT-3）. https://arxiv.org/abs/2005.14165
- Ouyang et al. 2022, Training language models to follow instructions with human feedback（InstructGPT，ChatGPT 的前身）. https://arxiv.org/abs/2203.02155
- Sennrich et al. 2016, Neural Machine Translation of Rare Words with Subword Units（Token 怎麼切）. https://arxiv.org/abs/1508.07909 ；自己試切 Token：https://platform.openai.com/tokenizer
隨機性、幻覺：
- Holtzman et al. 2020, The Curious Case of Neural Text Degeneration（取樣、溫度）. https://arxiv.org/abs/1904.09751
- Ji et al. 2023, Survey of Hallucination in Natural Language Generation. https://arxiv.org/abs/2202.03629
- Huang et al. 2023, A Survey on Hallucination in Large Language Models. https://arxiv.org/abs/2311.05232
- Kalai et al. 2025, Why Language Models Hallucinate（OpenAI：訓練和評分方式鼓勵它猜）. https://arxiv.org/abs/2509.04664`],
  [ReferencesMethods, `（課後自讀，上課不講。）
CoT、Tool Calling：
- Wei et al. 2022, Chain-of-Thought Prompting Elicits Reasoning in Large Language Models（few-shot CoT）. https://arxiv.org/abs/2201.11903
- Kojima et al. 2022, Large Language Models are Zero-Shot Reasoners（「請一步一步想」）. https://arxiv.org/abs/2205.11916
- Gao et al. 2023, PAL: Program-aided Language Models（寫程式去算）. https://arxiv.org/abs/2211.10435
- Schick et al. 2023, Toolformer: Language Models Can Teach Themselves to Use Tools. https://arxiv.org/abs/2302.04761
Web Search、RAG、Agent：
- Nakano et al. 2021, WebGPT: Browser-assisted question-answering with human feedback. https://arxiv.org/abs/2112.09332
- Lewis et al. 2020, Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks（RAG 這個名字的出處）. https://arxiv.org/abs/2005.11401
- Yao et al. 2023, ReAct: Synergizing Reasoning and Acting in Language Models（邊想邊用工具）. https://arxiv.org/abs/2210.03629
- Anthropic 2024, Building Effective Agents. https://www.anthropic.com/engineering/building-effective-agents
工具文件與原文：
- Codex CLI：https://developers.openai.com/codex/cli 、斜線指令 https://developers.openai.com/codex/cli/slash-commands 、方案與額度 https://developers.openai.com/codex/pricing
- AGENTS.md：https://developers.openai.com/codex/guides/agents-md 、https://agents.md
- Codex CLI 安裝方式（含獨立安裝）：https://learn.chatgpt.com/docs/codex/cli
- Codex 原始碼：https://github.com/openai/codex
- Node.js 下載：https://nodejs.org/en/download
- 《三國演義》原文：https://zh.wikisource.org/wiki/三國演義`],
  [NoPlan, `附錄（備用，不計入 120 分鐘）。這頁是「沒有方案」備案的入口，每張卡右邊寫了該看第幾頁。安裝裝不起來、找不到 codex 指令，看第 ${pageOf(InstallCompare)}–${pageOf(InstallErrors)} 頁。
沒有含 Codex 的 ChatGPT 方案，還是有三條路可以練習，照順序試。
按一下：備案 A，opencode 加免費雲端模型。opencode 是另一套和 Codex 很像的工具，不用登入、不用信用卡，講師實測用它跑大綱提示詞，內容正確。這是首選。
按一下：備案 B，Codex 加 OpenRouter。操作和今天教的 Codex 一樣，但要註冊 OpenRouter 帳號、建立 API Key，免費帳號每天只有 50 次請求。
按一下：備案 C，用 Ollama 在自己電腦跑模型。好處是資料不出電腦，但學生電腦跑得動的小模型會亂寫，所以只拿來示範，不當真正的備案。
最後一下：先走 A，不行再試 B；C 只拿來示範。
講師電腦實測：opencode-ai 1.19.3、codex-cli 0.154.0、Ollama 0.40.3。`],
  [OpencodeSteps, `附錄（備用）。備案 A：opencode 加免費模型。
五步，都在終端機打：
1. 這個備案使用 npm，所以需要另外安裝 Node.js。若尚未安裝，先到 https://nodejs.org/en/download 下載並安裝 LTS 版，重開終端機，再用 node -v 確認版本。這是備案的準備，Codex 獨立安裝不需要。
2. npm install -g opencode-ai，Mac 和 Windows 同一行。裝完可以打 opencode --version 確認。
3. cd 進練習資料夾，打 opencode，不用登入。
4. 輸入 /models，選一個免費模型。
5. 從 prompts.md 貼上提示詞，和 Codex 的練習一樣。
按一下：/models 的清單（畫面為示意）。沒登入時 opencode models 就會列出免費模型，例如 deepseek-v4.1-flash-free、glm-5.3-flash-free、big-pickle（預設）。推薦 DeepSeek V4.1 Flash Free 或 GLM-5.3 Flash Free；依官方文件，這兩個不會拿提示詞去訓練，Big Pickle、LL Alpha、MiMo 可能會（文件說明，講師未驗證）。預設的 Big Pickle 寫大綱也對，但花了 148 秒。
按一下：和 Codex 的對照。opencode 沒有 /status，模型名稱直接顯示在畫面上，用 /models 換模型；/new 開新 Session、/sessions 看舊的；/init 會建立 AGENTS.md（以上依文件）。講師實測：opencode 會讀 AGENTS.md，寫一條「最後一行寫——小助教」，它有照做；沒有 AGENTS.md 時會改讀 CLAUDE.md。
Windows：官方文件建議用 WSL，講師沒有在原生 Windows 上測過。
來源：免費模型與隱私 https://opencode.ai/docs/zen/ 、指令 https://opencode.ai/docs/tui/ 、AGENTS.md https://opencode.ai/docs/rules/ 、Windows 用 WSL https://opencode.ai/docs/windows-wsl/`],
  [OpencodeRun, `附錄（備用）。講師電腦 2026-10-17 實測，在 aw-01-lab 的複本裡跑。
指令：opencode run -m opencode/deepseek-v4.1-flash-free "列出這個資料夾的檔案，然後建立 hello.md，內容是：你好"
按一下：它先執行 ls -la 看資料夾。
按一下：寫入 hello.md，回報 Wrote file successfully.
按一下：最後回答檔案清單，並說已建立 hello.md。全程 29 秒，hello.md 真的出現了。
按一下：用 prompts.md 的大綱提示詞再跑一次，15 秒，第 1 回寫成「[[劉備]]、[[關羽]]、[[張飛]]於桃園結義，聚鄉勇投軍討伐[[張角]]的黃巾賊。三人隨[[盧植]]、[[皇甫嵩]]、[[朱儁]]征戰……」，和原文對得上。
按一下：注意事項。免費額度沒有公開，超過會出現 HTTP 429 FreeUsageLimitError；第三方說大約一天 100 次，但沒有官方數字。全班在同一個 IP 上用，可能一起被擋。速度從 6 秒到 2 分鐘以上都有。免費模型清單變得很快，上課前一天要再跑一次 opencode models 確認。不要把個人資料放進提示詞。
來源：免費模型與隱私 https://opencode.ai/docs/zen/ 、模型供應商 https://opencode.ai/docs/providers/`],
  [LocalLadder, `附錄（備用）。有人問：能不能在自己電腦裝 1B、2B 的小模型就好？答案是不行。以下是講師在這台電腦、用這幾個任務（列檔、建檔、寫大綱）測過的模型，Ollama 0.40.3，Context 設 32k；換電腦、換任務，結果可能不同。
llama3.2:1b：把工具指令當文字印出來，從頭到尾沒有動手。opencode 0/2、Codex 0/2。
qwen3:1.7b：在 opencode 裡 3 次有 2 次建好檔案，但在 Codex 裡只會規劃或亂編。寫大綱時編出「[[李四]]、[[王五]]」「張飛關羽首創太平道」；直接 ollama run 問，它說「劉備，字孔明」。
按一下：qwen3:4b 很慢，一題約 270 秒，大綱裡還寫出《紅樓夢》的人物。
按一下：gemma4:e2b（下載約 4.6 GB，32k 時吃約 7 GB 記憶體）：在 opencode 裡列檔、讀檔、建檔 3 次都成功，每次 40–45 秒；在 Codex 裡 2 次都成功。但寫大綱時內容含糊或寫錯。
按一下：對照組是雲端免費模型，大綱正確，約 15 秒。
最後一下：4B 以下不可靠。最少要 gemma4:e2b，而且只拿來示範「看資料夾、讀檔、建檔」。記憶體：8 GB 的電腦不要跑本機 Agent，連 1.7B 在 32k 都要約 5 GB；16 GB 可以示範 gemma4:e2b。
來源：opencode 接 Ollama https://opencode.ai/docs/providers/ 、https://docs.ollama.com/integrations/opencode 、Context 長度 https://docs.ollama.com/context-length`],
  [OllamaRoute, `附錄（備用）。備案 C：用 Ollama 示範本機模型。
1. 到 https://ollama.com/download 下載安裝（Mac 要 macOS 14 以上；Windows 用 OllamaSetup.exe，Windows 10 22H2 以上）。
2. 左邊這張最重要：打開 Ollama 設定，把 Context length 調到 32k 以上。預設 4k 會默默截斷提示詞：光是 opencode 的提示詞就約 7,900 個 Token，Codex 的更長。截斷後模型會回「我沒有權限存取本地檔案」，而且不會報錯。
按一下，右邊的終端機：
3. ollama pull gemma4:e2b，約 4.6 GB。
4. ollama run gemma4:e2b 可以直接聊天，打 /bye 離開。
5. ollama launch opencode --model gemma4:e2b，不用寫設定檔就能用 opencode 開它。也可以接 Codex：在 ~/.codex/config.toml 寫 model_provider = "ollama"、model = "gemma4:e2b"，再打 codex（不要用 codex --oss，0.154 在沒登入的電腦上還是會先跳登入畫面，而且會自動下載約 14 GB 的 gpt-oss:20b）。
6. ollama ps 看 CONTEXT 那一欄要是 32768；ollama list 看裝了哪些模型；ollama rm 模型名稱 可以刪掉。
用 Codex 接 Ollama 時，每次都會出現「Model metadata … not found」和「failed to refresh available models」兩行訊息，不影響使用。
最後一下：16 GB 的電腦才示範，8 GB 不要跑。
來源：https://docs.ollama.com/integrations/codex 、https://docs.ollama.com/context-length`],
  [OpenRouterRoute, `附錄（備用）。備案 B：Codex 加 OpenRouter，操作和今天的 Codex 一樣。
1. 到 https://openrouter.ai 註冊，Keys → 建立一把 Key。
2. 設定 Key。Mac：echo 'export OPENROUTER_API_KEY="sk-or-v1-..."' >> ~/.zshrc && source ~/.zshrc。Windows PowerShell：setx OPENROUTER_API_KEY "sk-or-v1-..."，再關掉、重開終端機。
3. config.toml 寫成畫面上這樣。可以再加 request_max_retries = 0 和 stream_max_retries = 0，認證錯誤時就不會白白重試 5 次。
4. cd 進練習資料夾，打 codex。
按一下：沒設 Key 會看到這個真實錯誤：ERROR: Missing environment variable: OPENROUTER_API_KEY. 回到第 2 步。
按一下：網路上很多舊教學寫 wire_api = "chat"，0.154 已經不支援，config 會載入失敗，真實訊息是：Error loading config.toml: wire_api = "chat" is no longer supported. How to fix: set wire_api = "responses" in your provider config.
按一下：免費額度：每分鐘 20 次、每天 50 次；帳號買過 10 美元額度後是每天 1000 次。Codex 每呼叫一次工具就算一次，50 次只夠做幾個小任務。免費模型的供應商可能會記錄或拿提示詞訓練，不要貼私人資料。
2026-10-17 可用的免費寫程式模型：poolside/laguna-xs-2.1:free、poolside/laguna-s-2.1:free、cohere/north-mini-code:free。清單變得很快，上課前一天要再確認。
講師只驗證到設定檔能載入、請求有送到 openrouter.ai/api/v1/responses，還沒用真的 Key 從頭跑完一次。
來源：https://openrouter.ai/docs/cookbook/coding-agents/codex-cli.md 、https://openrouter.ai/docs/api/reference/limits 、https://github.com/openai/codex/discussions/7782`],
  [InstallCompare, `附錄（備用）。安裝疑難排解 1／4：Codex 和 Claude Code 的官方安裝方式，2026-10-27 依官方文件和安裝腳本核對。
兩套都是「獨立安裝程式」，不用先裝 Node.js。依作業系統選一行，不要兩行都跑。
Codex：
- Mac／Linux：curl -fsSL https://chatgpt.com/codex/install.sh | sh（同一行也用來更新）
- Windows PowerShell：irm https://chatgpt.com/codex/install.ps1 | iex
- 官方 README 的 Windows 寫法是 powershell -ExecutionPolicy ByPass -c "irm https://chatgpt.com/codex/install.ps1 | iex"，效果一樣，好處是在「命令提示字元」也能直接貼。
- 裝在哪：Mac／Linux 是 ~/.local/bin/codex；Windows 是 %LOCALAPPDATA%\\Programs\\OpenAI\\Codex\\bin\\codex.exe。設定和登入資料在 ~/.codex。
- 安裝程式會自己把資料夾加進 PATH：Mac 的 zsh 寫進 ~/.zprofile，Linux 的 bash 寫進 ~/.bashrc；Windows 寫進「使用者 PATH」。所以大多數人只要「關掉視窗重開」就好。
- 也可以用 npm install -g @openai/codex 或 brew install --cask codex，但課堂統一用上面的獨立安裝。
Claude Code：
- Mac／Linux／WSL：curl -fsSL https://claude.ai/install.sh | bash（注意結尾是 bash，不是 sh）
- Windows PowerShell：irm https://claude.ai/install.ps1 | iex
- Windows 命令提示字元：curl -fsSL https://claude.ai/install.cmd -o install.cmd && install.cmd && del install.cmd
- 裝在哪：Mac／Linux 是 ~/.local/bin/claude；Windows 是 %USERPROFILE%\\.local\\bin\\claude.exe。
- Claude Code 的安裝程式不會自己改 PATH，只會在最後的 Setup notes 印出「Native installation exists but ~/.local/bin is not in your PATH」，所以「找不到 claude」比「找不到 codex」更常見，照下兩頁加進 PATH。
- 確認：claude --version；更完整的檢查：claude doctor。Claude Code 要 Pro、Max、Team、Enterprise 或 Console 帳號，免費方案不能用。
來源：Codex https://learn.chatgpt.com/docs/codex/cli （舊網址 developers.openai.com/codex/cli 會轉到這裡）、https://github.com/openai/codex#installing-and-running-codex-cli ；Claude Code https://code.claude.com/docs/en/setup 。`],
  [PathFixMac, `附錄（備用）。安裝疑難排解 2／4：Mac、Linux 找不到指令。
右上是症狀：zsh: command not found: codex（Linux 的 bash 是 bash: codex: command not found）。意思是程式有裝好，但終端機不知道去哪個資料夾找它。
右下這張圖：PATH 是一張「去哪些資料夾找指令」的清單。Codex 和 Claude Code 在 Mac 都裝在 ~/.local/bin，這個資料夾不在清單上，就會找不到。
左邊照順序做，哪一步好了就停：
1. 關掉終端機重開。VS Code 裡的終端機會沿用 VS Code 開啟時的 PATH，所以要整個 VS Code 關掉重開。Codex 安裝程式已經幫你寫好 PATH，大多數人做完這步就好了。
2. ls ~/.local/bin。有看到 codex 或 claude，代表有裝；出現 No such file or directory，代表安裝沒成功，回去重跑安裝指令，或看第 ${pageOf(InstallErrors)} 頁的錯誤對照。
3. 把資料夾加進 PATH，兩行：echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.zshrc，然後 source ~/.zshrc。echo 成功時不會印任何東西。
   - Linux 用 bash：把兩處 ~/.zshrc 改成 ~/.bashrc。
   - Mac 用 bash（很少見）：改成 ~/.bash_profile。
   - 不確定用哪個 shell：輸入 echo $0。
   - echo 出現 permission denied：ls -l ~/.zshrc 看擁有者；是 root 就 sudo chown $(whoami) ~/.zshrc，是自己就 chmod u+w ~/.zshrc，再做一次第 3 步。
4. codex --version（或 claude --version）看到版本號就成功。
還是不行：which -a codex 會列出所有找得到的 codex，若第一個是 npm 裝的舊版，看第 ${pageOf(InstallErrors)} 頁「版本很舊」那一列。
來源：https://code.claude.com/docs/en/troubleshoot-install#verify-your-path ；Codex 安裝腳本 https://chatgpt.com/codex/install.sh （BIN_DIR 預設 $HOME/.local/bin）。`],
  [PathFixWin, `附錄（備用）。安裝疑難排解 3／4：Windows 找不到指令。
右上是症狀。中文 Windows 的 PowerShell 會顯示「codex : 無法辨識 'codex' 詞彙是否為 Cmdlet、函數、指令檔或可執行程式的名稱」；命令提示字元則是「'codex' 不是內部或外部命令、可執行的程式或批次檔」。英文 Windows 是 The term 'codex' is not recognized。
右邊中間：PATH 是「去哪些資料夾找指令」的清單，Codex 在 Windows 裝在 %LOCALAPPDATA%\\Programs\\OpenAI\\Codex\\bin，要把它加進清單。
左邊照順序做，哪一步好了就停：
1. 關掉所有 PowerShell 視窗和 VS Code，重開再打 codex --version。安裝程式已經寫好使用者 PATH，但「已經開著的視窗」看不到新的 PATH。
2. 設定 $bin，再 Test-Path "$bin\\codex.exe"。True 代表有裝；False 代表沒裝成功，回去重跑安裝指令，或看第 ${pageOf(InstallErrors)} 頁的錯誤對照。
3. 兩行把資料夾加進「使用者 PATH」：先讀出目前的使用者 PATH 存到 $p，再把 $bin 接在後面寫回去。不用系統管理員權限，也不會動到系統 PATH。
   不想打指令的話：開始功能表搜尋「編輯您帳戶的環境變數」→ 使用者變數的 Path → 編輯 → 新增，貼上資料夾路徑。
4. 關掉、重開 PowerShell，codex --version 看到版本號就成功。
右下 Claude Code：把 $bin 換成 "$env:USERPROFILE\\.local\\bin"，第 2 步檢查 claude.exe，第 4 步打 claude --version。Claude Code 的安裝程式不會自己改 PATH，所以這頁對它更常用到。
還是不行：where.exe codex 會列出所有找得到的 codex；若第一個在 npm 資料夾裡，看第 ${pageOf(InstallErrors)} 頁「版本很舊」那一列。VS Code 的終端機要整個 VS Code 重開才會吃到新 PATH。
講師未在 Windows 實機測試；步驟依 Claude Code 官方排錯文件和 Codex 的 install.ps1 腳本整理。
來源：https://code.claude.com/docs/en/troubleshoot-install#verify-your-path ；Codex 安裝腳本 https://chatgpt.com/codex/install.ps1 （預設資料夾 $env:LOCALAPPDATA\\Programs\\OpenAI\\Codex\\bin，會寫入使用者 PATH）。`],
  [InstallErrors, `附錄（備用）。安裝疑難排解 4／4：看錯誤訊息找解法。左欄是畫面上會看到的字，右欄是做法。
1. command not found／無法辨識 'codex' 詞彙：程式找不到。先重開視窗，還不行就看第 ${pageOf(PathFixMac)}（Mac）或第 ${pageOf(PathFixWin)}（Windows）頁。
2. 'irm' 不是內部或外部命令：開到的是「命令提示字元」（提示字元前面沒有 PS）。從開始功能表搜尋 PowerShell 開新視窗再貼。或者留在命令提示字元，改貼官方 README 的 powershell -ExecutionPolicy ByPass -c "irm https://chatgpt.com/codex/install.ps1 | iex"。Claude Code 則用 curl -fsSL https://claude.ai/install.cmd -o install.cmd && install.cmd && del install.cmd。
3. 找不到符合參數名稱 'fsSL' 的參數（英文：A parameter cannot be found that matches parameter name 'fsSL'）：在 Windows PowerShell 貼了 Mac 的 curl 那行。PowerShell 的 curl 是另一個指令，改貼 irm 那行。反過來，PowerShell 出現「語彙基元 '&&' 不是有效的陳述式分隔符號」，是把命令提示字元的指令貼到 PowerShell。
4. 因為這個系統上已停用指令碼執行（running scripts is disabled on this system）：通常是以前用 npm 裝過，npm 產生的 codex.ps1、npm.ps1 被 PowerShell 的執行原則擋下。執行 Set-ExecutionPolicy -Scope CurrentUser RemoteSigned（只改自己帳號，不用系統管理員），再重開視窗。公司電腦若不准改，請助教協助，或改用獨立安裝。
5. codex --version 版本很舊，或裝了新版還是跑舊版：以前照舊教學用 npm 裝過，PATH 先找到舊的。npm uninstall -g @openai/codex 移除後重開視窗。Mac 用 which -a codex、Windows 用 where.exe codex 看有幾份。Codex 的安裝程式偵測到 npm 版時，也會問要不要幫你移除。
6. syntax error near unexpected token '<'、403、連線逾時：下載到的不是安裝腳本，是網頁或被擋的回應，常見於公司或學校網路、Proxy。改用手機熱點再跑一次。Codex 安裝程式會先從 releases.openai.com 下載，失敗時自動改從 GitHub 下載。
Claude Code 的同類錯誤都一樣處理，把 codex 換成 claude；它還有 claude doctor 可以自我檢查。
來源：https://code.claude.com/docs/en/troubleshoot-install （Find your error、Wrong install command on Windows、running scripts is disabled）、https://github.com/openai/codex （README 的 Windows 安裝指令）。`],
]);

const n = (page: Page) => NOTES.get(page);

// Index-aligned with the default export: keep one n(Page) per page, in the same order.
export const notes: (string | undefined)[] = [
  n(Cover),
  n(SpeakerIntro),
  n(CourseMap),
  n(Agenda),
  n(Section1),
  n(Evolution),
  n(NextWordGame),
  n(ProbTable),
  n(OneByOne),
  n(SameQuestion),
  n(Randomness),
  n(WhatIsHallucination),
  n(RealHallucination),
  n(WhyHallucinate),
  n(CotWhat),
  n(CotWhy),
  n(ToolCalc),
  n(ToolCompare),
  n(CotPage),
  n(WebSearch),
  n(RagR),
  n(RagA),
  n(RagG),
  n(OpenBookPage),
  n(RagMiniPractice),
  n(Section2),
  n(AgentPage),
  n(ChatVsCodex),
  n(SameTaskTwoWays),
  n(ChatGPTSelf),
  n(Section3),
  n(OpenTerminal),
  n(TerminalAnatomy),
  n(InstallCodex),
  n(DownloadLab),
  n(CdFolder),
  n(CodexLogin),
  n(CodexTrust),
  n(Section4),
  n(StartScreen),
  n(StatusPage),
  n(UsageToken),
  n(SessionDesk),
  n(MemoryLayers),
  n(AgentsFile),
  n(Section5),
  n(OpenLab),
  n(AgentsByHand),
  n(RulePractice),
  n(OutlinePrompt),
  n(OutlineResult),
  n(CheckSource),
  n(Recap),
  n(NextLesson),
  n(ReferencesModel),
  n(ReferencesMethods),
  n(NoPlan),
  n(OpencodeSteps),
  n(OpencodeRun),
  n(OpenRouterRoute),
  n(LocalLadder),
  n(OllamaRoute),
  n(InstallCompare),
  n(PathFixMac),
  n(PathFixWin),
  n(InstallErrors),
];

if (import.meta.env.DEV) {
  ORDER.forEach((page, i) => {
    if (notes[i] !== NOTES.get(page)) console.warn(`aw-01: notes[${i}] is not NOTES of page ${i + 1} (edited in the notes panel, or out of order with the pages)`);
  });
}
