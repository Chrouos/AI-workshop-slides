import type { DesignSystem, Page, SlideMeta, SlideTransition } from '@open-slide/core';
import { Step, Steps, useIsActivePage, useSlidePageNumber } from '@open-slide/core';
import type { CSSProperties, ReactNode } from 'react';
import wrongSum from './assets/llm-hallucination-calculation.png';
import guess8460 from './assets/guess-8460.png';
import webSearch from './assets/thinking-web-search.png';
import researchAnswer from './assets/thinking-research-answer.png';
import codexStart from './assets/codex-cli-start.png';
import codexStatus from './assets/codex-cli-status.png';
import nodeCheck from './assets/node-npm-check.png';
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

// ---------- Frame ----------

const Title = ({ children }: { children: ReactNode }) => (
  <h1 style={{ fontFamily: '"Libre Baskerville", Georgia, "Times New Roman", serif', fontSize: 132, fontWeight: 400, lineHeight: 1.17, letterSpacing: '-0.035em', maxWidth: 1500, margin: 0, color: ink, whiteSpace: 'pre-line' }}>{children}</h1>
);

// With a source, the footer's left side names where the page's idea comes from.
const Footer = ({ source }: { source?: ReactNode }) => {
  const { current, total } = useSlidePageNumber();
  return (
    <div style={{ position: 'absolute', left: 144, right: 144, bottom: 56, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 32, borderTop: '1px solid #E7E5E4', paddingTop: 22, fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', fontSize: 22, fontWeight: 400, color: quiet }}>
      {source ? <span style={{ whiteSpace: 'nowrap' }}><strong style={{ fontWeight: 600, color: muted }}>參考</strong>｜{source}</span> : <span>AI 協作課｜第 1 堂 認識 AI，學會用 Codex</span>}
      <span style={{ flexShrink: 0, whiteSpace: 'nowrap' }}>{String(current).padStart(2, '0')} / {String(total).padStart(2, '0')}</span>
    </div>
  );
};

const Eyebrow = ({ children }: { children: ReactNode }) => (
  <div style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', fontSize: 24, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#78716C' }}>{children}</div>
);

const PracticeEyebrow = ({ children, time }: { children: ReactNode; time: string }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
    <Eyebrow>{children}</Eyebrow>
    <span style={{ display: 'inline-flex', alignItems: 'center', background: '#FFFFFF', border: `1px solid ${rule}`, padding: '6px 18px', fontSize: 24, whiteSpace: 'nowrap' }}>
      <strong style={{ color: amber }}>⏱ {time}</strong>
    </span>
  </div>
);

// The five chapters of lesson 1.
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
          {String(chapter).padStart(2, '0')}｜{CHAPTERS[chapter - 1]}
        </span>
      )}
    </div>
  );
};

const Shell = ({ children, top = 112, chapter, enterChapter = false, source }: { children: ReactNode; top?: number; chapter?: Chapter; enterChapter?: boolean; source?: ReactNode }) => (
  <div className="aw1-deck" style={{ width: '100%', height: '100%', boxSizing: 'border-box', position: 'relative', display: 'flex', flexDirection: 'column', background: 'var(--osd-bg)', color: 'var(--osd-text)', fontFamily: 'var(--osd-font-body)', padding: `${top}px 144px 126px` }}>
    {chapter ? <RouteBar chapter={chapter} enter={enterChapter} /> : null}
    {children}
    <Footer source={source} />
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
    <NumDot n={n} />
    <span>{children}</span>
  </div>
);

const Callout = ({ n, title, detail }: { n: number; title: ReactNode; detail?: ReactNode }) => (
  <div style={{ display: 'grid', gridTemplateColumns: '44px 1fr', gap: 20, alignItems: 'start' }}>
    <NumDot n={n} />
    <div>
      <div style={{ fontSize: 32, fontWeight: 600, lineHeight: 1.35 }}>{title}</div>
      {detail ? <div style={{ fontSize: 27, color: muted, marginTop: 6, lineHeight: 1.45 }}>{detail}</div> : null}
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
    {caption ? <Caption>{caption}</Caption> : null}
  </div>
);

// An outline drawn over one region of a screenshot (in % of the image), with its number.
const RegionMark = ({ x, y, w, h, n, i, badge = 'left' }: { x: number; y: number; w: number; h: number; n: number; i: number; badge?: 'left' | 'right' }) => {
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
const RowMark = ({ top, height = 32, width, n, badge = true }: { top: number; height?: number; width: number; n?: 1 | 2 | 3; badge?: boolean }) => (
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
const Pill = ({ tag, children }: { tag: string; children: ReactNode }) => (
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
    <SmallLabel>你輸入</SmallLabel>
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

const SvgChip = ({ x, y, w, label, fill = '#FFFFFF', stroke = rule, color = ink, size = 24, h = 44, weight }: { x: number; y: number; w: number; label: string; fill?: string; stroke?: string; color?: string; size?: number; h?: number; weight?: number }) => (
  <g><rect x={x} y={y} width={w} height={h} rx="4" fill={fill} stroke={stroke} strokeWidth="2" /><text x={x + w / 2} y={y + h / 2 + size * 0.36} textAnchor="middle" fontSize={size} fontWeight={weight} fill={color}>{label}</text></g>
);

const Bubble = ({ x, y, w, h, fill = '#FFFFFF', stroke = rule }: { x: number; y: number; w: number; h: number; fill?: string; stroke?: string }) => (
  <path d={`M${x + 12} ${y} H${x + w - 12} Q${x + w} ${y} ${x + w} ${y + 12} V${y + h - 12} Q${x + w} ${y + h} ${x + w - 12} ${y + h} H${x + 60} L${x + 36} ${y + h + 22} L${x + 40} ${y + h} H${x + 12} Q${x} ${y + h} ${x} ${y + h - 12} V${y + 12} Q${x} ${y} ${x + 12} ${y} Z`} fill={fill} stroke={stroke} strokeWidth="2" />
);

// ---------- Opening ----------

const Cover: Page = () => (
  <Shell top={174}>
    <In i={0}><Eyebrow>AI WORKSHOP｜第 1 堂（共 4 堂）</Eyebrow></In>
    <In i={1} style={{ marginTop: 62 }}><Title>{'GPT 是什麼'}</Title></In>
    <In i={2} style={{ marginTop: 40, fontSize: 35, color: muted }}>{'從 GPT 怎麼寫字講起，學會用 Codex 跟 AI 一起做事'}</In>
    <In i={3} style={{ width: 160, height: 5, background: amber, marginTop: 72 }}><span /></In>
    <In i={3} style={{ marginTop: 40, display: 'flex', alignItems: 'center', gap: 14, fontSize: 28, color: muted }}>
      <Icon kind="laptop" size={36} color={muted} />在筆電打開簡報：<span style={{ fontFamily: mono, color: ink, fontWeight: 600 }}>chrouos.github.io/AI-workshop-slides</span>
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

// One lesson of the four, drawn as the thing it produces.
const LessonStop = ({ x, n, name, sub, today = false, children }: { x: number; n: number; name: string; sub: string; today?: boolean; children: ReactNode }) => (
  <g>
    <rect x={x - 150} y={40} width={300} height={230} rx="8" fill={today ? amberSoft : '#FFFFFF'} stroke={today ? amber : rule} strokeWidth={today ? 4 : 2} />
    {children}
    <text x={x} y={334} textAnchor="middle" fontSize="42" fontWeight="600" fill={ink}>{name}</text>
    <text x={x} y={382} textAnchor="middle" fontSize="28" fill={muted}>{sub}</text>
    <SvgChip x={x - 80} y={406} w={160} h={46} label={`第 ${n} 堂`} size={25} fill={today ? amber : surface} stroke={today ? amber : rule} color={today ? '#FFFFFF' : quiet} />
  </g>
);

const CourseMap: Page = () => (
  <Shell>
    <Eyebrow>課程地圖｜四堂課只做一件作品</Eyebrow>
    <Heading>四堂課，做一份知識庫</Heading>
    <Fit>
      <Figure h={470} label="第 1 堂大綱、第 2 堂筆記庫、第 3 堂時間軸、第 4 堂網站">
        <InG i={0}>
          <LessonStop x={204} n={1} name="大綱" sub="Codex 照原文寫" today>
            <DocShape x={134} y={72} w={140} h={166} />
            <rect x="156" y="104" width="92" height="8" fill={rule} />
            <rect x="156" y="126" width="80" height="8" fill={rule} />
            <rect x="148" y="160" width="112" height="38" rx="4" fill={linkSoft} />
            <text x="204" y="188" textAnchor="middle" fontSize="24" fill={link}>[[劉備]]</text>
          </LessonStop>
        </InG>
        <InG i={1}><MapArrow x1={360} x2={456} y={155} /></InG>
        <InG i={2}>
          <LessonStop x={612} n={2} name="筆記庫" sub="Obsidian 連起來">
            <g stroke={link} strokeWidth="3"><line x1="542" y1="110" x2="682" y2="120" /><line x1="542" y1="110" x2="602" y2="205" /><line x1="682" y1="120" x2="602" y2="205" /><line x1="682" y1="120" x2="692" y2="200" /></g>
            <circle cx="542" cy="110" r="24" fill={linkSoft} stroke={link} strokeWidth="3" />
            <circle cx="682" cy="120" r="24" fill={linkSoft} stroke={link} strokeWidth="3" />
            <circle cx="602" cy="205" r="24" fill={linkSoft} stroke={link} strokeWidth="3" />
            <circle cx="692" cy="200" r="16" fill="#FFFFFF" stroke={faint} strokeWidth="3" strokeDasharray="5 5" />
          </LessonStop>
        </InG>
        <InG i={3}><MapArrow x1={768} x2={864} y={155} /></InG>
        <InG i={4}>
          <LessonStop x={1020} n={3} name="時間軸" sub="Skill 幫忙排">
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
          <LessonStop x={1428} n={4} name="網站" sub="發布給別人看">
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

const AgendaRow = ({ i, n, kind, result, time, page }: { i: number; n: Chapter; kind: IconKind; result: string; time: string; page: Page }) => (
  <In i={i} style={{ display: 'grid', gridTemplateColumns: AGENDA_COLS, alignItems: 'center', minHeight: 104, borderBottom: `1px solid ${rule}` }}>
    <span style={{ fontFamily: display, fontSize: 40, color: amber }}>{String(n).padStart(2, '0')}</span>
    <span style={{ fontSize: 38, fontWeight: 600 }}>{CHAPTERS[n - 1]}</span>
    <span style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
      <Icon kind={kind} size={52} color={amber} />
      <span style={{ fontSize: 30 }}>{result}</span>
    </span>
    <span style={{ textAlign: 'right' }}><span style={{ display: 'block', fontSize: 26, color: amber }}>{time}</span><span style={{ display: 'block', fontSize: 24, color: quiet, marginTop: 4 }}>第 {pageOf(page)} 頁</span></span>
  </In>
);

const Agenda: Page = () => (
  <Shell>
    <Eyebrow>AGENDA｜120 分鐘，兩個練習</Eyebrow>
    <Heading>今天的五章</Heading>
    <Fit>
      <div style={{ display: 'grid', gridTemplateColumns: AGENDA_COLS, paddingBottom: 12, borderBottom: `1px solid ${rule}` }}>
        <span /><SmallLabel>章節</SmallLabel><SmallLabel>結束時你會</SmallLabel><span style={{ textAlign: 'right' }}><SmallLabel>時間｜頁</SmallLabel></span>
      </div>
      <AgendaRow i={0} n={1} kind="think" result="知道 AI 為什麼會說錯" time="10–40 分" page={Section1} />
      <AgendaRow i={1} n={2} kind="search" result="拿到附來源的答案" time="40–67 分" page={Section2} />
      <AgendaRow i={2} n={3} kind="down" result="電腦裡有 Codex" time="67–73 分" page={Section3} />
      <AgendaRow i={3} n={4} kind="terminal" result="會看 /status、寫規則" time="73–90 分" page={Section4} />
      <AgendaRow i={4} n={5} kind="doc" result="一份三國演義大綱.md" time="90–112 分" page={Section5} />
    </Fit>
  </Shell>
);

// ---------- Chapter pages ----------

const TRACK_XS = [90, 453, 816, 1179, 1542];

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

// ---------- 01 AI 怎麼走到今天（以 GPT 為例） ----------

const Section1: Page = () => (
  <Shell top={192} chapter={1} enterChapter>
    <In i={0}><Eyebrow>01 / GPT</Eyebrow></In>
    <In i={1} style={{ marginTop: 63 }}><Title>AI 怎麼走到今天</Title></In>
    <In i={2} style={{ fontSize: 36, lineHeight: 1.5, color: muted, marginTop: 30, maxWidth: 1500 }}>
      以 GPT 為例：它怎麼寫字、為什麼會錯、有哪些補救
    </In>
    <div style={{ marginTop: 96 }}><ChapterTrack chapter={1} /></div>
  </Shell>
);

// One stop on the overview: a circle with an icon, a name, and a short note under it.
const MapNode = ({ x, y, kind, label, sub, tone, r = 56 }: { x: number; y: number; kind: IconKind; label: string; sub: string; tone: 'plain' | 'warn' | 'blue' | 'amber'; r?: number }) => {
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
  <Shell chapter={1} source={'Vaswani et al. 2017（Transformer）；Brown et al. 2020（GPT-3）；Ouyang et al. 2022（InstructGPT）'}>
    <Eyebrow>先看全貌｜本章地圖</Eyebrow>
    <Heading>大型語言模型（LLM）的限制與補救</Heading>
    <Fit>
      <Stage h={500}>
        <Steps>
          <Layer h={500} label="模型的限制：猜下一個字，所以有隨機性，也會幻覺">
            <InG i={0}>
              <rect x="0" y="0" width="1632" height="210" fill={warnSoft} opacity="0.45" />
              <text x="28" y="48" fontSize="28" fontWeight="600" fill={warn}>模型的限制</text>
            </InG>
            <InG i={1}><MapNode x={420} y={88} kind="chat" label="猜下一個字" sub="" tone="plain" /></InG>
            <InG i={2}><MapArrow x1={484} x2={666} y={88} /><text x="575" y="70" textAnchor="middle" fontSize="25" fontWeight="600" fill={amber}>所以</text><MapNode x={730} y={88} kind="dice" label="隨機性" sub="" tone="warn" /></InG>
            <InG i={3}><MapArrow x1={794} x2={976} y={88} /><text x="885" y="70" textAnchor="middle" fontSize="25" fontWeight="600" fill={amber}>也會</text><MapNode x={1040} y={88} kind="alert" label="幻覺" sub="" tone="warn" /></InG>
          </Layer>
          <Step duration={STEP_MS}><Layer h={500} label="補救方法：Thinking 也就是 CoT 列步驟、用工具像計算機、Web Search 查資料">
            <rect x="0" y="250" width="1632" height="250" fill={blueSoft} opacity="0.5" />
            <text x="28" y="296" fontSize="28" fontWeight="600" fill={blue}>補救方法</text>
            <g className="aw1-build" style={buildDelay(0)}><MapNode x={420} y={340} kind="think" label="Thinking" sub="CoT 列步驟" tone="blue" /></g>
            <g className="aw1-build" style={buildDelay(1)}><MapNode x={730} y={340} kind="calc" label="用工具" sub="Tool Calling" tone="blue" /></g>
            <g className="aw1-build" style={buildDelay(2)}><MapNode x={1040} y={340} kind="search" label="Web Search" sub="查資料 RAG" tone="blue" /></g>
          </Layer></Step>
          <Step duration={STEP_MS}><Layer h={500} label="Agent：把工具串起來做事">
            <g fill="none" stroke={amber} strokeWidth="3"><StepPath d="M730 278 V266 H1040 V278" /></g>
            <g fill="none" stroke={amber} strokeWidth="4"><StepPath d="M885 266 C885 236 1360 236 1390 274" i={1} /></g>
            <text x="1160" y="230" textAnchor="middle" fontSize="25" fontWeight="600" fill={amber}>串起來</text>
            <g className="aw1-build" style={buildDelay(2)}><MapNode x={1400} y={340} kind="terminal" label="Agent" sub="把工具串起來做事" tone="amber" r={62} /></g>
          </Layer></Step>
        </Steps>
      </Stage>
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={28}>三個限制，三種補救</Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

const WordTile = ({ children, hot = false }: { children: ReactNode; hot?: boolean }) => (
  <div style={{ width: 300, height: 260, boxSizing: 'border-box', display: 'grid', placeItems: 'center', fontFamily: display, fontSize: 112, background: hot ? amber : '#FFFFFF', color: hot ? '#FFFFFF' : ink, border: `3px solid ${hot ? amber : rule}` }}>{children}</div>
);

const NextWordGame: Page = () => (
  <Shell chapter={1} source={'Radford et al. 2018, Improving Language Understanding by Generative Pre-Training（GPT-1, OpenAI）'}>
    <Eyebrow>GPT＝生成式預訓練模型</Eyebrow>
    <Heading>下一個 Token 預測（Next-Token Prediction）</Heading>
    <Lead>看前面的字，接下一個最順的字</Lead>
    <Fit z={1.1}>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: 36 }}>
        <In i={0}>
          <SmallLabel>前面的字</SmallLabel>
          <div style={{ display: 'flex', gap: 20, marginTop: 16 }}>
            <WordTile>今天</WordTile>
            <WordTile>天氣</WordTile>
            <WordTile>很</WordTile>
          </div>
        </In>
        <In i={1} style={{ fontSize: 100, color: faint, lineHeight: 1, paddingBottom: 80 }}>→</In>
        <In i={2}>
          <SmallLabel color={amber}>下一個字</SmallLabel>
          <div style={{ position: 'relative', width: 300, height: 260, marginTop: 16 }}>
            <Steps>
              <div style={{ width: 300, height: 260, boxSizing: 'border-box', border: `4px dashed ${amber}`, display: 'grid', placeItems: 'center', fontFamily: display, fontSize: 124, color: amber }}>?</div>
              <Step duration={STEP_MS}><div style={{ position: 'absolute', inset: 0 }}><WordTile hot>好</WordTile></div></Step>
            </Steps>
          </div>
        </In>
      </div>
      <div className="aw1-token-note" data-ref-page={pageOf(OneByOne)} style={{ textAlign: 'center', fontSize: 25, color: quiet, marginTop: 28 }}>以「字」示意，模型實際切的單位叫 Token</div>
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={44}>GPT 根據前面的內容，預測下一個 Token</Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

const NextWord = ({ word, pct, top = false, order = 0 }: { word: string; pct: number; top?: boolean; order?: number }) => (
  <div style={{ display: 'grid', gridTemplateColumns: '170px 1fr 130px', alignItems: 'center', gap: 24 }}>
    <span style={{ fontSize: 52, fontWeight: top ? 600 : 400, color: top ? 'var(--osd-text)' : muted }}>{word}</span>
    <div style={{ height: 58, background: surface }}><div className="aw1-bar" style={{ ...buildDelay(order), width: `${pct}%`, height: '100%', background: top ? amber : rule }} /></div>
    <span style={{ fontSize: 38, color: top ? amber : quiet, textAlign: 'right' }}>{pct}%</span>
  </div>
);

const ProbTable: Page = () => (
  <Shell chapter={1} source={'Brown et al. 2020, Language Models are Few-Shot Learners, arXiv:2005.14165（表中機率為示意）'}>
    <Eyebrow>接龍的根據</Eyebrow>
    <Heading>下一個 Token 的機率分布</Heading>
    <Lead>模型根據前文，估計每個候選 Token 出現的機率</Lead>
    <Fit>
      <div style={{ display: 'grid', gridTemplateColumns: '680px 1fr', columnGap: 88, alignItems: 'center' }}>
        <In i={0} style={{ background: surface, borderTop: `4px solid ${rule}`, padding: '60px 48px' }}>
          <SmallLabel>已經寫出的文字</SmallLabel>
          <div style={{ fontFamily: display, fontSize: 86, marginTop: 34, lineHeight: 1.3, whiteSpace: 'nowrap' }}>今天天氣很<span style={{ display: 'inline-block', width: 110, borderBottom: `6px solid ${amber}`, marginLeft: 12 }}>&nbsp;</span></div>
        </In>
        <div>
          <Steps>
            <Step duration={STEP_MS}>
              <div style={{ display: 'grid', gap: 32 }}>
                <SmallLabel>下一個字的機率（示意）</SmallLabel>
                <NextWord word="好" pct={58} top order={0} />
                <NextWord word="熱" pct={22} order={1} />
                <NextWord word="冷" pct={11} order={2} />
                <NextWord word="不錯" pct={9} order={3} />
              </div>
            </Step>
          </Steps>
        </div>
      </div>
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={44}>機率最高的字，最常被挑中</Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

const Tok = ({ children, hot = false }: { children: ReactNode; hot?: boolean }) => (
  <span style={{ display: 'inline-grid', placeItems: 'center', minWidth: 150, height: 104, padding: '0 22px', boxSizing: 'border-box', fontSize: 54, fontFamily: display, background: hot ? amberSoft : '#FFFFFF', border: `3px solid ${hot ? amber : rule}`, color: ink }}>{children}</span>
);

const TokRow = ({ n, children }: { n: number; children: ReactNode }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
    <span style={{ width: 150, fontSize: 30, color: quiet }}>第 {n} 輪</span>
    {children}
  </div>
);

const OneByOne: Page = () => (
  <Shell chapter={1} source={'Brown et al. 2020, arXiv:2005.14165（自迴歸）；Sennrich et al. 2016, arXiv:1508.07909（Token）'}>
    <Eyebrow>一次只接一格</Eyebrow>
    <Heading>自迴歸生成（Autoregressive Generation）</Heading>
    <Fit>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 480px', gap: 48, alignItems: 'center' }}>
        <div style={{ display: 'grid', gap: 28 }}>
          <Steps>
            <TokRow n={1}><Tok>今天</Tok><Tok hot>天氣</Tok></TokRow>
            <Step duration={STEP_MS}><TokRow n={2}><Tok>今天</Tok><Tok>天氣</Tok><Tok hot>很</Tok></TokRow></Step>
            <Step duration={STEP_MS}><TokRow n={3}><Tok>今天</Tok><Tok>天氣</Tok><Tok>很</Tok><Tok hot>好</Tok></TokRow></Step>
            <Step duration={STEP_MS}><TokRow n={4}><Tok>今天</Tok><Tok>天氣</Tok><Tok>很</Tok><Tok>好</Tok><Tok hot>。</Tok></TokRow></Step>
          </Steps>
        </div>
        <div>
          <Steps>
            <Step duration={STEP_MS}>
              <div style={{ background: blueSoft, borderLeft: `6px solid ${blue}`, padding: '30px 34px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}><Tok hot>很</Tok><span style={{ fontSize: 40, color: blue, fontWeight: 600 }}>＝1 個 Token</span></div>
                <div style={{ fontSize: 32, color: muted, marginTop: 20, lineHeight: 1.5 }}>AI 讀寫文字的單位（示意）</div>
              </div>
            </Step>
          </Steps>
        </div>
      </div>
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={64}>一次產生一個 Token，再接回前文繼續產生</Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

// A chat window drawn as a picture (示意). The answer is revealed on click.
const ChatWin = ({ label, ask, regen = false, children }: { label: string; ask: string; regen?: boolean; children: ReactNode }) => (
  <div style={{ width: 760, background: '#FFFFFF', border: `1px solid ${rule}`, boxShadow: '0 10px 30px rgba(28,25,23,0.08)' }}>
    <div style={{ height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 28px', background: surface, borderBottom: `1px solid ${rule}`, fontSize: 27, color: muted }}>
      <span style={{ fontWeight: 600 }}>{label}</span>
      {regen ? <span style={{ display: 'flex', alignItems: 'center', gap: 8, color: amber, fontWeight: 600 }}><Icon kind="redo" size={34} color={amber} />重新產生</span> : null}
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
  <Shell chapter={1} source={'Holtzman et al. 2020, The Curious Case of Neural Text Degeneration, arXiv:1904.09751'}>
    <Eyebrow>隨機性｜現場示範</Eyebrow>
    <Heading>隨機取樣（Sampling）</Heading>
    <Lead>同一段前文可能抽到不同 Token，後續答案也跟著改變</Lead>
    <Fit>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 56 }}>
        <In i={0}>
          <ChatWin label="第 1 次" ask="用一句話介紹劉備">
            <Steps><Step duration={STEP_MS}><ChatAnswer>劉備是蜀漢的開國皇帝，以仁德聞名。</ChatAnswer></Step></Steps>
          </ChatWin>
        </In>
        <In i={1}>
          <ChatWin label="第 2 次" ask="用一句話介紹劉備" regen>
            <Steps><Step duration={STEP_MS}><ChatAnswer>劉備字玄德，和關羽、張飛在桃園結拜。</ChatAnswer></Step></Steps>
          </ChatWin>
        </In>
      </div>
      <Caption>畫面為示意</Caption>
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={40}>答案不同，是因為每次抽到的字不一樣</Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

const SliceLabel = ({ x, y, word, pct, color = ink, size = 34 }: { x: number; y: number; word: string; pct: string; color?: string; size?: number }) => (
  <g>
    <text x={x} y={y} textAnchor="middle" fontSize={size} fontWeight="600" fill={color}>{word}</text>
    <text x={x} y={y + 32} textAnchor="middle" fontSize="24" fill={color}>{pct}</text>
  </g>
);

const Randomness: Page = () => (
  <Shell chapter={1} source={'Holtzman et al. 2020, The Curious Case of Neural Text Degeneration（取樣與溫度）, arXiv:1904.09751'}>
    <Eyebrow>隨機性｜Temperature</Eyebrow>
    <Heading>溫度參數（Temperature）</Heading>
    <Lead>調整取樣的變化程度：低溫較穩，高溫較多變</Lead>
    <Fit>
      <Stage h={520}>
        <Steps>
          <Layer h={520} label="轉盤：好 58%、熱 22%、冷 11%、不錯 9%">
            <InG i={0}>
              <path d="M380 260 L380 60 A200 200 0 1 1 283.6 435.3 Z" fill={amberSoft} stroke="#FFFFFF" strokeWidth="4" />
              <path d="M380 260 L283.6 435.3 A200 200 0 0 1 189.8 198.2 Z" fill={blueSoft} stroke="#FFFFFF" strokeWidth="4" />
              <path d="M380 260 L189.8 198.2 A200 200 0 0 1 272.8 91.1 Z" fill={sage} stroke="#FFFFFF" strokeWidth="4" />
              <path d="M380 260 L272.8 91.1 A200 200 0 0 1 380 60 Z" fill={raised} stroke="#FFFFFF" strokeWidth="4" />
              <SliceLabel x={500} y={290} word="好" pct="58%" color={amber} size={44} />
              <SliceLabel x={252} y={262} word="熱" pct="22%" color={blue} />
              <SliceLabel x={290} y={176} word="冷" pct="11%" color={okGreen} />
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
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={16}>會變，不代表錯；但有時會變成錯的</Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

// grow: the bar fills as the page settles in (for a meter shown before any click).
const Meter = ({ label, value, pct, tone, empty = false, grow = false }: { label: string; value: string; pct: number; tone: string; empty?: boolean; grow?: boolean }) => {
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
  <Shell chapter={1} source={'Ji et al. 2023, Survey of Hallucination in Natural Language Generation, arXiv:2202.03629'}>
    <Eyebrow>猜出來的字，可能是錯的</Eyebrow>
    <Heading>AI 幻覺（Hallucination）</Heading>
    <Lead>像考試硬掰：寫得很順，其實沒讀過</Lead>
    <Fit>
      <In i={0} style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 56 }}>
        <Icon kind="chat" size={64} color={muted} />
        <div style={{ position: 'relative', background: '#FFFFFF', border: `2px solid ${rule}`, borderRadius: 16, padding: '24px 40px', fontSize: 44 }}>問：劉備字什麼？　答：<strong>劉備，字孔明。</strong></div>
        <span style={{ fontSize: 24, color: quiet }}>小模型 qwen3:1.7b<br />講師實測</span>
      </In>
      <div style={{ display: 'grid', gap: 40 }}>
        <Steps>
          <In i={1}><Meter label="語氣" value="很肯定" pct={96} tone={amber} grow /></In>
          <Step duration={STEP_MS}>
            <Meter label="事實" value="對不上" pct={0} tone={warn} empty />
            <div style={{ marginTop: 16, marginLeft: 178, fontSize: 30, color: warn }}>原文第 1 回：「姓劉，名備，字<strong>玄德</strong>」；孔明是諸葛亮</div>
          </Step>
        </Steps>
      </div>
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={64}>內容和事實對不上，語氣卻很肯定，就叫幻覺</Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

const RealHallucination: Page = () => (
  <Shell chapter={1} source={'圖片：IT 邦幫忙 ithelp.ithome.com.tw/articles/10315994'}>
    <Eyebrow>早期 GPT-3.5｜真實案例</Eyebrow>
    <Heading>幻覺實例：GPT-3.5 的長加法</Heading>
    <Fit>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 520px', gap: 64, alignItems: 'center' }}>
        <div style={{ display: 'grid', rowGap: 26 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '170px 1fr', alignItems: 'center' }}>
            <SmallLabel>題目</SmallLabel>
            <In i={0} style={{ fontFamily: mono, fontSize: 36 }}>2+4+7+9+23+1+5+7+2+5<br />+74+2+7953+34+356</In>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '170px 1fr', alignItems: 'center' }}>
            <SmallLabel>AI 答</SmallLabel>
            <In i={1} style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
              <span style={{ fontFamily: display, fontSize: 116, lineHeight: 1.05, color: muted }}>8402</span>
              <Steps><Step duration={STEP_MS}><svg viewBox="0 0 80 80" style={{ width: 80, height: 80, display: 'block' }} aria-label="錯"><g className="aw1-steppop" style={buildDelay(0, 60)}><NoDot x={40} y={40} r={36} /></g></svg></Step></Steps>
            </In>
          </div>
          <Steps>
            <Step duration={STEP_MS}>
              <div style={{ display: 'grid', gridTemplateColumns: '170px 1fr', alignItems: 'center' }}>
                <SmallLabel color={amber}>驗算</SmallLabel>
                <span style={{ fontFamily: display, fontSize: 116, lineHeight: 1.05, color: amber }}>8484</span>
              </div>
            </Step>
          </Steps>
        </div>
        <In i={2}>
          <div style={{ border: `1px solid ${rule}`, background: '#FFFFFF', padding: 12 }}>
            <img src={wrongSum} alt="早期 ChatGPT（GPT-3.5）把一長串加法算成 8402" style={{ display: 'block', width: 494, height: 204 }} />
          </div>
          <Caption>實際畫面｜早期 GPT-3.5｜圖片來源：IT 邦幫忙</Caption>
        </In>
      </div>
      <Steps><Step duration={STEP_MS}><Takeaway>它沒有算，只猜了一個像答案的數字</Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

// One station of the "how an answer comes out" pipeline.
const PipeBox = ({ x, label, hot = false, children }: { x: number; label: string; hot?: boolean; children: ReactNode }) => (
  <g>
    <rect x={x - 120} y={70} width={240} height={220} fill={hot ? amberSoft : '#FFFFFF'} stroke={hot ? amber : rule} strokeWidth={hot ? 3 : 2} />
    {children}
    <text x={x} y={346} textAnchor="middle" fontSize="32" fontWeight="600" fill={ink}>{label}</text>
  </g>
);

const WhyHallucinate: Page = () => (
  <Shell chapter={1} source={'Kalai et al. 2025, Why Language Models Hallucinate, arXiv:2509.04664'}>
    <Eyebrow>幻覺從哪裡來</Eyebrow>
    <Heading>幻覺的成因：從資料到回答</Heading>
    <Lead>像聽人轉述：大家都這樣說，就照說</Lead>
    <Fit>
      <Stage h={440}>
        <Steps>
          <Layer h={440} label="讀過的大量文字，變成一張機率表">
            <InG i={0}>
              <PipeBox x={140} label="讀過的文字">
                <DocShape x={70} y={100} w={110} h={140} fill={surface} />
                <DocShape x={95} y={115} w={110} h={140} fill={surface} />
                <DocShape x={120} y={130} w={110} h={140} />
              </PipeBox>
            </InG>
            <InG i={1}><MapArrow x1={266} x2={344} y={180} /></InG>
            <InG i={2}>
              <PipeBox x={470} label="機率表">
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
              <PipeBox x={800} label="挑最常見的" hot>
                <text x="800" y="170" textAnchor="middle" fontSize="32" fontWeight="600" fill={amber}>最常見的</text>
                <text x="800" y="214" textAnchor="middle" fontSize="32" fontWeight="600" fill={amber}>說法</text>
              </PipeBox>
            </g>
            <g className="aw1-build" style={buildDelay(2, 0)}><MapArrow x1={926} x2={1334} y={180} hot /></g>
            <g className="aw1-build" style={buildDelay(3, 0)}>
              <PipeBox x={1460} label="說出口">
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
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={20}>所以要請它先想、用工具，或給它資料</Takeaway></Step></Steps>
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
    <span style={{ width: 22, height: 22, background: color, display: 'inline-block' }} />{children}
  </span>
);

const FlowBox = ({ x, y, w, label, tone = 'plain' }: { x: number; y: number; w: number; label: string; tone?: 'plain' | 'step' | 'ok' | 'bad' }) => {
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
  <Shell chapter={1} source={'Wei et al. 2022, Chain-of-Thought Prompting Elicits Reasoning in Large Language Models, arXiv:2201.11903'}>
    <Eyebrow>解法一｜Thinking 背後的做法</Eyebrow>
    <Heading>思維鏈（Chain of Thought, CoT）是什麼</Heading>
    <Lead>像考試用草稿紙：先寫過程，再寫答案</Lead>
    <QuestionCard>雞兔同籠：35 個頭、94 隻腳。直接答和先寫過程差在哪？</QuestionCard>
    <Fit>
      <Stage h={330}>
        <Steps>
          <Step duration={STEP_MS}><Layer h={330} label="直接寫答案：從題目一下子跳到答案，猜雞 20、兔 15（示意）">
            <text x="0" y="62" fontSize="30" fontWeight="600" fill={warn}>直接寫答案</text>
            <FlowBox x={230} y={20} w={150} label="題目" />
            <g fill="none" stroke={warn} strokeWidth="4" strokeDasharray="12 9"><path d="M384 50 C620 -30 960 -30 1196 50" /></g>
            <polygon points="1200,56 1182,46 1190,62" fill={warn} />
            <text x="790" y="40" textAnchor="middle" fontSize="27" fontWeight="600" fill={warn}>一下子猜出答案</text>
            <g className="aw1-build" style={buildDelay(2)}><FlowBox x={1206} y={20} w={300} label="雞 20、兔 15？" tone="bad" /></g>
            <text x="1520" y="66" fontSize="24" fill={quiet}>示意</text>
          </Layer></Step>
          <Step duration={STEP_MS}><Layer h={330} label="先寫過程：題目、題型、公式、套數字、計算、答案，一環扣一環">
            <text x="0" y="212" fontSize="30" fontWeight="600" fill={blue}>先寫過程</text>
            <g className="aw1-build" style={buildDelay(0)}><FlowBox x={230} y={170} w={150} label="題目" /></g>
            <g className="aw1-build" style={buildDelay(1)}><LinkRings x={404} y={208} /><FlowBox x={424} y={170} w={150} label="題型" tone="step" /></g>
            <g className="aw1-build" style={buildDelay(2)}><LinkRings x={598} y={208} /><FlowBox x={618} y={170} w={150} label="公式" tone="step" /></g>
            <g className="aw1-build" style={buildDelay(3)}><LinkRings x={792} y={208} /><FlowBox x={812} y={170} w={150} label="套數字" tone="step" /></g>
            <g className="aw1-build" style={buildDelay(4)}><LinkRings x={986} y={208} /><FlowBox x={1006} y={170} w={150} label="計算" tone="step" /></g>
            <g className="aw1-build" style={buildDelay(5)}>
              <MapArrow x1={1160} x2={1200} y={208} hot />
              <FlowBox x={1206} y={170} w={300} label="答案" tone="ok" />
            </g>
            <g className="aw1-build" style={buildDelay(7)}>
              <text x="230" y="306" fontSize="28" fill={muted}>思維（想）＋ 鏈（一環扣一環）＝ 一步接一步的推理過程</text>
            </g>
          </Layer></Step>
        </Steps>
      </Stage>
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={36}>CoT：讓模型回答前，先把推理步驟一步一步寫出來</Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

const StripTile = ({ x, y, w, label, tone = 'plain' }: { x: number; y: number; w: number; label: string; tone?: 'plain' | 'step' | 'ok' | 'bad' }) => {
  const fill = tone === 'step' ? blueSoft : tone === 'ok' ? sage : tone === 'bad' ? warnSoft : surface;
  const stroke = tone === 'step' ? blue : tone === 'ok' ? okGreen : tone === 'bad' ? warn : rule;
  return (
    <g>
      <rect x={x} y={y} width={w} height="68" fill={fill} stroke={stroke} strokeWidth="2" strokeDasharray={tone === 'bad' ? '9 7' : undefined} />
      <text x={x + w / 2} y={y + 45} textAnchor="middle" fontSize="28" fontFamily={mono} fontWeight={tone === 'plain' ? 400 : 600} fill={tone === 'bad' ? warn : ink}>{label}</text>
    </g>
  );
};

const WayChip = ({ n, children }: { n: number; children: ReactNode }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 14, background: '#FFFFFF', border: `1px solid ${rule}`, padding: '12px 20px', fontSize: 28 }}>
    <NumDot n={n} size={42} /><span>{children}</span>
  </div>
);

const CotWhy: Page = () => (
  <Shell chapter={1} source={'Kojima et al. 2022, arXiv:2205.11916；Wei et al. 2022, arXiv:2201.11903'}>
    <Eyebrow>它不是只會猜下一個字嗎？寫步驟為什麼有用？</Eyebrow>
    <Heading>CoT 為什麼有效</Heading>
    <QuestionCard>一盒鉛筆 12 枝，買 3 盒，送掉 5 枝，還剩幾枝？</QuestionCard>
    <Fit>
      <Stage h={230}>
        <Steps>
          <Step duration={STEP_MS}><Layer h={230} label="沒寫步驟：前文只有題目，下一步就得猜出答案，例如猜 30（示意）">
            <text x="0" y="44" fontSize="28" fontWeight="600" fill={warn}>沒寫步驟</text>
            <StripTile x={180} y={0} w={330} label="12枝 3盒 送5枝＝" />
            <MapArrow x1={520} x2={1110} y={34} />
            <g className="aw1-build" style={buildDelay(1)}>
              <StripTile x={1120} y={0} w={190} label="30？" tone="bad" />
              <text x="1330" y="44" fontSize="27" fill={warn}>一步跳到答案（示意）</text>
            </g>
          </Layer></Step>
          <Step duration={STEP_MS}><Layer h={230} label="寫了步驟：12×3=36、36−5= 都變成前文，下一步只要接 31">
            <text x="0" y="194" fontSize="28" fontWeight="600" fill={blue}>寫了步驟</text>
            <StripTile x={180} y={150} w={330} label="12枝 3盒 送5枝" />
            <g className="aw1-build" style={buildDelay(0)}><StripTile x={520} y={150} w={230} label="12×3=36" tone="step" /></g>
            <g className="aw1-build" style={buildDelay(1)}><StripTile x={760} y={150} w={200} label="36−5=" tone="step" /></g>
            <g className="aw1-build" style={buildDelay(2)}>
              <path d="M520 128 V116 H960 V128" fill="none" stroke={blue} strokeWidth="3" />
              <text x="740" y="104" textAnchor="middle" fontSize="27" fontWeight="600" fill={blue}>寫下來的步驟，也變成前文</text>
            </g>
            <g fill="none" stroke={amber} strokeWidth="4"><StepPath d="M970 184 H1100" i={4} /></g>
            <g className="aw1-build" style={buildDelay(5)}>
              <polygon points="1112,184 1096,175 1096,193" fill={amber} />
              <StripTile x={1120} y={150} w={190} label="31 ✓" tone="ok" />
              <text x="1330" y="194" fontSize="27" fill={okGreen}>小小一步，好猜</text>
            </g>
          </Layer></Step>
        </Steps>
      </Stage>
      <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginTop: 34 }}>
        <Steps>
          <Step duration={STEP_MS}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
              <SmallLabel>讓它寫步驟的三種方法</SmallLabel>
              <div className="aw1-build" style={buildDelay(0)}><WayChip n={1}>提示詞加「請一步一步想」</WayChip></div>
              <div className="aw1-build" style={buildDelay(1)}><WayChip n={2}>給一題有步驟的範例</WayChip></div>
              <div className="aw1-build" style={buildDelay(2)}><WayChip n={3}>Thinking 模型自動做</WayChip></div>
            </div>
          </Step>
        </Steps>
      </div>
      <Steps>
        <Step duration={STEP_MS}><div style={{ marginTop: 28 }}><StatusLine ok={false} size={30}>步驟也是它寫的：錯一步，後面跟著錯；算術還是心算</StatusLine></div></Step>
        <Step duration={STEP_MS}><Takeaway marginTop={24}>先寫草稿再作答，比較不會跳錯</Takeaway></Step>
      </Steps>
    </Fit>
  </Shell>
);

// One reasoning step of the worked example: number, what the step is, what it wrote.
const CotCard = ({ n, label, children, tone = 'step', tag }: { n: number; label: string; children: ReactNode; tone?: 'step' | 'tool' | 'ok'; tag?: string }) => {
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
  <Shell chapter={1} source={'Wei et al. 2022, arXiv:2201.11903；Gao et al. 2023, PAL, arXiv:2211.10435'}>
    <Eyebrow>例子｜Codex 實際輸出 2026-10-18</Eyebrow>
    <Heading>CoT＋Tool Calling 實例</Heading>
    <QuestionCard right={<><LegendKey color={blue}>CoT</LegendKey><LegendKey color={amber}>Tool Calling</LegendKey></>}>籠子裡有 35 個頭、94 隻腳，雞和兔各幾隻？</QuestionCard>
    <Fit>
      <div style={{ display: 'grid', gridTemplateColumns: '760px 1fr', gap: 28, alignItems: 'start' }}>
        <div style={{ display: 'grid', gap: 14 }}>
          <Steps>
            <Step duration={STEP_MS}><CotCard n={1} label="判斷：這是二元一次方程式" tag="CoT"><span style={{ fontSize: 27 }}>「雞兔同籠」題型</span></CotCard></Step>
            <Step duration={STEP_MS}><CotCard n={2} label="想公式" tag="CoT"><Eq>x+y=35　2x+4y=94</Eq><span style={{ fontSize: 24, color: muted, marginLeft: 18 }}>x＝雞、y＝兔</span></CotCard></Step>
            <Step duration={STEP_MS}><CotCard n={3} label="套數字" tag="CoT"><Eq>2x+2y=70 → 2y=24 → y=12，x=23</Eq></CotCard></Step>
          </Steps>
        </div>
        <div style={{ display: 'grid', gap: 14 }}>
          <Steps>
            <Step duration={STEP_MS}>
              <CotCard n={4} label="按計算機（程式）" tone="tool" tag="Tool Calling">
                <div style={{ background: term, color: '#F5F5F4', fontFamily: mono, fontSize: 24, lineHeight: 1.5, padding: '10px 14px', whiteSpace: 'pre' }}>
                  <span style={{ color: '#E9B650' }}>{"python3 -c 'heads=35; feet=94;\n rabbits=(feet-2*heads)//2;\n chickens=heads-rabbits;\n print(chickens, rabbits)'\n"}</span>
                  <span style={{ fontSize: 32, fontWeight: 700, outline: '3px solid #E9B650', outlineOffset: 2 }}>23 12</span>
                </div>
              </CotCard>
            </Step>
            <Step duration={STEP_MS}>
              <CotCard n={5} label="答案" tone="ok">
                <div style={{ fontFamily: display, fontSize: 42 }}>雞 23 隻，兔 12 隻</div>
                <div style={{ fontSize: 26, color: okGreen, fontWeight: 600 }}>驗算：23×2＋12×4＝94 ✓</div>
              </CotCard>
            </Step>
          </Steps>
        </div>
      </div>
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={20}>先想清楚步驟（CoT），計算交給工具（Tool Calling）</Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

// A calculator drawn as a picture: the sum on the display, the = key pressed.
const CalcKey = ({ x, y, label, hot = false }: { x: number; y: number; label: string; hot?: boolean }) => (
  <g>
    <rect x={x} y={y} width="78" height="46" rx="6" fill={hot ? amber : '#FFFFFF'} stroke={hot ? amber : rule} strokeWidth="2" />
    <text x={x + 39} y={y + 33} textAnchor="middle" fontSize="28" fontWeight="600" fill={hot ? '#FFFFFF' : ink}>{label}</text>
  </g>
);

const ToolCalc: Page = () => (
  <Shell chapter={1} source={'Gao et al. 2023, PAL, arXiv:2211.10435；Schick et al. 2023, Toolformer, arXiv:2302.04761'}>
    <Eyebrow>CoT 會想，但算術還是心算 → 交給工具算</Eyebrow>
    <Heading>工具呼叫（Tool Calling）</Heading>
    <Lead>像把算式輸入計算機，按下「＝」</Lead>
    <In i={0} style={{ marginTop: 14, fontSize: 28 }}><strong style={{ color: amber }}>Tool Calling（工具呼叫）</strong>：模型寫一行程式或呼叫工具，讓工具算出結果</In>
    <Fit>
      <div style={{ display: 'grid', gridTemplateColumns: '470px 1fr', gap: 40, alignItems: 'center' }}>
        <div>
          <In i={0} style={{ background: '#FFFFFF', border: `2px solid ${ink}`, padding: '12px 18px', fontFamily: mono, fontSize: 30, lineHeight: 1.5 }}>
            2+4+7+9+23+1+5+7+2+5<br />+74+2+7953+34+356＝？
          </In>
          <Steps>
            <Step duration={STEP_MS}>
              <div style={{ marginTop: 22 }}>
                <Figure w={470} h={300} label="計算機：輸入算式，按下等號">
                  <rect x="40" y="0" width="390" height="300" rx="18" fill={raised} stroke={ink} strokeWidth="2" />
                  <rect x="66" y="22" width="338" height="62" rx="6" fill={term} />
                  <text x="390" y="64" textAnchor="end" fontSize="28" fontFamily={mono} fill="#8DD4A0">…+34+356</text>
                  <CalcKey x={66} y={104} label="7" /><CalcKey x={152} y={104} label="8" /><CalcKey x={238} y={104} label="9" /><CalcKey x={324} y={104} label="＋" />
                  <CalcKey x={66} y={162} label="4" /><CalcKey x={152} y={162} label="5" /><CalcKey x={238} y={162} label="6" /><CalcKey x={324} y={162} label="－" />
                  <CalcKey x={66} y={220} label="1" /><CalcKey x={152} y={220} label="2" /><CalcKey x={238} y={220} label="3" /><CalcKey x={324} y={220} label="＝" hot />
                </Figure>
              </div>
            </Step>
          </Steps>
        </div>
        <div>
          <Steps>
            <Step duration={STEP_MS}>
              <Terminal title="Codex 實際輸出｜2026-10-18" size={26}>
                <Dim>{'exec\n'}</Dim>
                <AskLine>{"python3 -c 'print(sum([2,4,7,9,23,1,5,7,2,5,74,2,7953,34,356]))'\n"}</AskLine>
                <Dim>{' succeeded in 2814ms:\n'}</Dim>
                <span style={{ fontSize: 48, fontWeight: 700, lineHeight: 1.3 }}><HotLine>8484</HotLine></span>{'\n'}
                <Dim>{'codex\n'}</Dim>
                {'用 Python 程式計算結果是：8484'}
              </Terminal>
              <Caption>codex-cli 0.154.0｜已刪去與題目無關的系統警告</Caption>
            </Step>
          </Steps>
        </div>
      </div>
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={36}>算出來的，不是猜出來的：沒有隨機性</Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

// One way to answer the long sum. The method shows first; its answer (and how much to trust it)
// is its own click, so the room can guess before seeing the result.
const WayCard = ({ kind, name, like, result, verdict, why, tone, shot }: { kind: IconKind; name: string; like: string; result: string; verdict: string; why?: string; tone: 'bad' | 'mid' | 'good'; shot?: ReactNode }) => {
  const c = tone === 'bad' ? warn : tone === 'mid' ? blue : okGreen;
  const soft = tone === 'bad' ? warnSoft : tone === 'mid' ? blueSoft : sage;
  return (
    <div style={{ background: soft, borderTop: `6px solid ${c}`, padding: '26px 30px 30px', height: '100%', boxSizing: 'border-box', display: 'grid', justifyItems: 'center', alignContent: 'start', gap: 16, textAlign: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}><Icon kind={kind} size={60} color={c} /><span style={{ fontSize: 40, fontWeight: 600 }}>{name}</span></div>
      <div style={{ fontSize: 32, background: '#FFFFFF', padding: '6px 22px', borderRadius: 24 }}>＝{like}</div>
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
  <Shell chapter={1} source={'Gao et al. 2023, PAL: Program-aided Language Models, arXiv:2211.10435'}>
    <Eyebrow>同一題長加法｜三種做法</Eyebrow>
    <Heading>三種解法：直接答、CoT、工具</Heading>
    <Fit>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 36, alignItems: 'stretch' }}>
        <In i={1}><WayCard kind="dice" name="直接回答" like="猜" result="8460" verdict="✗ 錯，每次還不一樣" why="ChatGPT 實際畫面｜不准它算" tone="bad" shot={<Crop src={guess8460} alt="ChatGPT 被要求不可以偷偷計算，回答：我不算，純猜：8460" iw={1794} ih={456} crop={[118, 268, 364, 78]} width={460} />} /></In>
        <In i={2}><WayCard kind="think" name="CoT（Thinking）" like="心算、列步驟" result="8484" verdict="可能錯，步驟要核對" why="還是心算" tone="mid" /></In>
        <In i={3}><WayCard kind="calc" name="Tool Calling" like="按計算機" result="8484" verdict="✓ 每次都一樣" why="可以重跑，也看得到算式" tone="good" /></In>
      </div>
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={32}>要算得準，就讓它按計算機</Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

const WebSearch: Page = () => (
  <Shell chapter={1} source={'Nakano et al. 2021, WebGPT: Browser-assisted Question-answering, arXiv:2112.09332'}>
    <Eyebrow>Web Search＝另一種工具</Eyebrow>
    <Heading>Web Search 會先上網找資料</Heading>
    <Lead>搜尋也是 Tool Calling：計算機幫它算，搜尋幫它查</Lead>
    <Fit>
      {/* Two rows: each screenshot sits next to the callout that explains it; row 2 is one click. */}
      <div style={{ display: 'grid', gridTemplateColumns: '1100px 1fr', gap: 56, alignItems: 'center' }}>
        <In i={0}>
          <Screenshot src={webSearch} aspect={1586 / 484} width={1100} alt="ChatGPT 回答台灣新聞前，先搜尋中央社和路透社兩個網站">
            <RegionMark n={1} i={2} x={7.5} y={51} w={36} h={28} badge="right" />
          </Screenshot>
        </In>
        <In i={1}><Callout n={1} title="先搜尋網站" detail="中央社、路透社" /></In>
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
              <Caption>ChatGPT 實際畫面｜2026 年 9 月</Caption>
            </div>
            <Callout n={2} title="回答附上來源" detail="點得開，查得到" />
          </div>
        </Step>
      </Steps>
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={56}>先查再答叫 RAG，搜到的內容就是「檢索來的資料」</Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

const SourceRow = ({ x, y, kind, label }: { x: number; y: number; kind: IconKind; label: string }) => (
  <g>
    <rect x={x} y={y} width="380" height="72" fill="#FFFFFF" stroke={rule} strokeWidth="2" />
    <SvgIcon kind={kind} x={x + 44} y={y + 36} size={42} color={blue} />
    <text x={x + 86} y={y + 47} fontSize="31" fill={ink}>{label}</text>
  </g>
);

const RagR: Page = () => (
  <Shell chapter={1} source={'Lewis et al. 2020, Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks, arXiv:2005.11401'}>
    <Eyebrow>RAG 第 1 步｜Retrieval</Eyebrow>
    <Heading>R：檢索（Retrieval）</Heading>
    <Lead>先找出相關的那一段，像去圖書館找書</Lead>
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
            <g className="aw1-build" style={buildDelay(0)}><SourceRow x={590} y={124} kind="globe" label="網路" /></g>
            <g className="aw1-build" style={buildDelay(1)}><SourceRow x={590} y={214} kind="doc" label="上傳的檔案" /></g>
            <g className="aw1-build" style={buildDelay(2)}><SourceRow x={590} y={304} kind="folder" label="你的資料夾" /></g>
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
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={24}>先找到資料，後面才有根據</Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

const RagA: Page = () => (
  <Shell chapter={1} source={'Lewis et al. 2020, Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks, arXiv:2005.11401'}>
    <Eyebrow>RAG 第 2 步｜Augmented</Eyebrow>
    <Heading>A：增強（Augmented）</Heading>
    <Lead>題目和資料裝同一箱，一起交出去</Lead>
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
              <SvgChip x={730} y={200} w={320} h={56} label="問題" size={28} />
              <SvgChip x={730} y={276} w={320} h={56} label="資料：第 21 回" size={28} fill={amberSoft} stroke={amber} />
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
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={24}>題目加上資料，AI 就不用硬猜</Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

const RagG: Page = () => (
  <Shell chapter={1} source={'Lewis et al. 2020, arXiv:2005.11401；原文：維基文庫《三國演義》第 21 回'}>
    <Eyebrow>RAG 第 3 步｜Generation</Eyebrow>
    <Heading>G：生成（Generation）</Heading>
    <Lead>照找到的資料回答，附上出處</Lead>
    <Fit>
      <In i={0} style={{ display: 'flex', alignItems: 'flex-start', gap: 28 }}>
        <Icon kind="chat" size={72} color={muted} />
        <div style={{ flex: 1, background: '#FFFFFF', border: `2px solid ${rule}`, borderRadius: 16, padding: '34px 46px' }}>
          <SmallLabel>AI 回答（示意）</SmallLabel>
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
        <Steps><Step duration={STEP_MS}><StatusLine ok size={36}>點開出處，找得到同一句</StatusLine></Step></Steps>
      </div>
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={40}>有來源 ≠ 一定正確：點開來源逐字核對</Takeaway></Step></Steps>
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
  <Shell chapter={1} source={'Lewis et al. 2020, Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks, arXiv:2005.11401'}>
    <Eyebrow>RAG 三步合起來</Eyebrow>
    <Heading>檢索增強生成（RAG）</Heading>
    <Lead>先找資料，再帶著資料回答，就像開書考</Lead>
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
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={36}>今天的大綱練習，也是一場開書考</Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

const RagMiniPractice: Page = () => (
  <Shell chapter={1}>
    <PracticeEyebrow time="3 分鐘">小練習｜自己的 ChatGPT</PracticeEyebrow>
    <Heading>小練習：Web Search 找來源</Heading>
    <Lead>挑一件你最近好奇的事：球賽、旅行、科技，都可以。</Lead>
    <Fit>
      <div style={{ display: 'grid', gridTemplateColumns: '1.08fr 0.92fr', gap: 76, alignItems: 'start' }}>
        <div>
          <div style={{ fontSize: 26, fontWeight: 600, color: amber, marginBottom: 20 }}>若能選 Thinking，先選好，再貼上這句</div>
          <div style={{ background: surface, borderLeft: `6px solid ${amber}`, padding: '38px 44px 42px' }}>
            <div style={{ fontFamily: display, fontSize: 45, lineHeight: 1.48, color: ink }}>
              「請上網搜尋：<span style={{ color: amber }}>＿＿＿＿？</span><br />
              用三句話回答，附上來源。」
            </div>
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
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={58}>看得到來源，還要親自點開核對</Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

const LoopNode = ({ x, y, kind, label, ly }: { x: number; y: number; kind: IconKind; label: string; ly: number }) => (
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
  <Shell chapter={2} source={'Yao et al. 2023, ReAct, arXiv:2210.03629；Anthropic 2024, Building Effective Agents'}>
    <Eyebrow>Agent＝會用工具、執行任務</Eyebrow>
    <Heading>AI 代理（Agent）</Heading>
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
            <InG i={2}><LoopNode x={446} y={250} kind="chat" label="提出要做的動作" ly={360} /></InG>
            <InG i={3}><text x="446" y="404" textAnchor="middle" fontSize="26" fill={muted}>例：建立 hello.md</text></InG>
          </Layer>
          <Step duration={STEP_MS}><Layer h={500} label="你檢查，選 Yes, proceed 才放行">
            <g fill="none" stroke={amber} strokeWidth="4"><StepPath d="M490 200 Q560 70 732 64" /></g>
            <g className="aw1-build" style={buildDelay(3)}><ArrowTip x={746} y={64} dx={180} dy={-6} /></g>
            <g className="aw1-build" style={buildDelay(1)}><LoopNode x={816} y={70} kind="ok" label="你檢查" ly={-10} />
              <rect x="900" y="-34" width="190" height="42" fill={sage} stroke={okGreen} strokeWidth="2" />
              <text x="995" y="-5" textAnchor="middle" fontSize="24" fontFamily={mono} fontWeight="700" fill={ink}>Yes, proceed</text>
              <text x="1106" y="-5" fontSize="24" fill={muted}>（跳出確認時）</text></g>
          </Layer></Step>
          <Step duration={STEP_MS}><Layer h={500} label="執行，再回報給你">
            <g fill="none" stroke={amber} strokeWidth="4"><StepPath d="M886 64 Q1080 70 1140 188" /><StepPath d="M1146 300 Q1080 430 900 432" i={2} /><StepPath d="M740 440 Q260 520 116 338" i={4} /></g>
            <g className="aw1-build" style={buildDelay(2)}><ArrowTip x={1148} y={202} dx={66} dy={130} /></g>
            <g className="aw1-build" style={buildDelay(4)}><ArrowTip x={886} y={432} dx={-188} dy={2} /></g>
            <g className="aw1-build" style={buildDelay(6)}><ArrowTip x={110} y={324} dx={-150} dy={-194} /></g>
            <g className="aw1-build" style={buildDelay(1)}><LoopNode x={1186} y={250} kind="tool" label="執行" ly={360} /></g>
            <g className="aw1-build" style={buildDelay(3)}><LoopNode x={816} y={432} kind="save" label="回報" ly={530} /></g>
            <g className="aw1-steppop" style={buildDelay(7)}>
              <rect x="706" y="208" width="220" height="84" fill={term} />
              <text x="816" y="246" textAnchor="middle" fontSize="28" fontFamily={mono} fill="#F5F5F4">&gt;_ Agent</text>
              <text x="816" y="278" textAnchor="middle" fontSize="24" fill="#E9B650">這一整圈</text>
            </g>
          </Layer></Step>
        </Steps>
      </Stage>
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={56}>Codex 就是一種 Agent：真的動手做，做完回報</Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

// ---------- 02 ChatGPT 與 Codex ----------

const Section2: Page = () => <SectionPage chapter={2} label="02 / CHATGPT × CODEX" lead="先認識會動手的 Agent，再比較 ChatGPT 與 Codex" />;

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
  <Shell chapter={2} source={'OpenAI Codex 文件 developers.openai.com/codex'}>
    <Eyebrow>本課這樣分工</Eyebrow>
    <Heading>ChatGPT 和 Codex 的分工</Heading>
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

const LaneStep = ({ kind, text, hot = false, you = false }: { kind: IconKind; text: string; hot?: boolean; you?: boolean }) => (
  <div style={{ width: 236, height: 184, boxSizing: 'border-box', background: hot ? amberSoft : '#FFFFFF', border: `2px solid ${hot ? amber : rule}`, display: 'grid', justifyItems: 'center', alignContent: 'center', gap: 14, position: 'relative' }}>
    <Icon kind={kind} size={64} color={hot ? amber : muted} />
    <span style={{ fontSize: 30, fontWeight: 600 }}>{text}</span>
    {you ? <span style={{ position: 'absolute', top: 8, right: 8, background: warn, color: '#FFFFFF', fontSize: 24, fontWeight: 600, padding: '2px 10px' }}>你做</span> : null}
  </div>
);

const LaneArrow = () => <span style={{ fontSize: 44, color: faint, lineHeight: 1 }}>→</span>;

const Lane = ({ name, kind, tint, stroke, count, children }: { name: string; kind: IconKind; tint: string; stroke: string; count: string; children: ReactNode }) => (
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
    <Eyebrow>為什麼這份作業在資料夾裡做</Eyebrow>
    <Heading>寫大綱：ChatGPT vs Codex</Heading>
    <Fit>
      <div style={{ display: 'grid', gap: 36 }}>
        <Steps>
          <In i={0}>
            <Lane name="ChatGPT" kind="chat" tint="#FFFFFF" stroke={faint} count="你動手 3 次">
              <LaneStep kind="folder" text="打開 21 個檔" you />
              <LaneArrow />
              <LaneStep kind="doc" text="貼上再提問" you />
              <LaneArrow />
              <LaneStep kind="chat" text="它回一段話" />
              <LaneArrow />
              <LaneStep kind="save" text="自己存成檔" you />
            </Lane>
          </In>
          <Step duration={STEP_MS}>
            <Lane name="Codex" kind="terminal" tint={amberSoft} stroke={amber} count="你動手 1 次">
              <LaneStep kind="chat" text="一句交代" you />
              <LaneArrow />
              <LaneStep kind="folder" text="它讀 原文/" hot />
              <LaneArrow />
              <LaneStep kind="save" text="它存好檔案" hot />
            </Lane>
          </Step>
        </Steps>
      </div>
      <Steps><Step duration={STEP_MS}><Takeaway>21 回原文在檔案裡：Codex 直接讀，寫成檔案</Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

// A ChatGPT screen drawn as a picture (示意); search may run automatically.
const ChatScreen = ({ ask, children }: { ask: string; children: ReactNode }) => (
  <div style={{ width: 1300, margin: '0 auto', background: '#FFFFFF', border: `1px solid ${rule}`, boxShadow: '0 10px 30px rgba(28,25,23,0.08)' }}>
    <div style={{ height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 30px', background: surface, borderBottom: `1px solid ${rule}`, fontSize: 26, color: muted }}>
      <span style={{ fontWeight: 600 }}>ChatGPT（示意）</span>
      <span style={{ display: 'flex', alignItems: 'center', gap: 10, border: `2px solid ${faint}`, color: quiet, padding: '4px 16px', borderRadius: 24, fontWeight: 600 }}><Icon kind="globe" size={30} color={faint} />可能自動搜尋</span>
    </div>
    <div style={{ padding: '30px 40px 36px' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}><span style={{ background: amberSoft, borderRadius: 30, padding: '12px 28px', fontSize: 31 }}>{ask}</span></div>
      <div style={{ marginTop: 34 }}>{children}</div>
    </div>
  </div>
);

// Practice 1 runs before the lab download: the prompts are copied from prompts.md on GitHub.
const PromptsCopy = ({ step }: { step: string }) => (
  <a href={PROMPTS_URL} target="_blank" rel="noreferrer" style={{ position: 'absolute', top: 176, right: 144, display: 'flex', alignItems: 'center', gap: 18, color: muted, textDecoration: 'none' }}>
    <span style={{ textAlign: 'right', fontSize: 24, lineHeight: 1.4 }}>複製提示詞<br /><strong style={{ color: amber, fontFamily: mono }}>prompts.md</strong> 練習 {step}</span>
    <img src={promptsQr} alt="prompts.md 的 QR code" style={{ width: 120, height: 120, display: 'block', background: '#FFFFFF', border: `1px solid ${rule}`, padding: 5 }} />
  </a>
);

const Practice1NoSearch: Page = () => (
  <Shell chapter={2} source={'維基文庫《三國演義》第 21 回 zh.wikisource.org/wiki/三國演義/第021回'}>
    <PracticeEyebrow time="17 分鐘（三步）">練習 1｜ChatGPT</PracticeEyebrow>
    <Heading>練習（幻覺）：先不給資料問一次</Heading>
    <PromptsCopy step="1-1" />
    <In i={0} style={{ marginTop: 30 }}><PromptBox>《三國演義》第 21 回，劉備聽完曹操說「天下英雄只有你我」，做了什麼？為什麼？</PromptBox></In>
    <Fit>
      <In i={1}>
        <ChatScreen ask="劉備聽完，做了什麼？為什麼？">
          <Steps>
            <Step duration={STEP_MS}>
              <ChatAnswer><strong>做了什麼：</strong><span style={{ borderBottom: `3px dashed ${faint}` }}>匙箸掉到地上，推說被雷聲嚇到</span></ChatAnswer>
            </Step>
            <Step duration={STEP_MS}>
              <div style={{ marginTop: 18 }}><ChatAnswer><strong>為什麼：</strong><span style={{ borderBottom: `3px dashed ${faint}` }}>掩飾野心，怕曹操起疑</span><span style={{ fontSize: 24, color: quiet, marginLeft: 20 }}>常見回答，請記下你的</span></ChatAnswer></div>
            </Step>
            <Step duration={STEP_MS}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginTop: 28, marginLeft: 66 }}>
                <span style={{ background: amberSoft, border: `2px solid ${amber}`, color: ink, fontSize: 28, fontWeight: 600, padding: '8px 20px' }}>沒附原文</span>
                <span style={{ fontSize: 28, color: muted }}>答得再順，也分不出是記得還是編的</span>
              </div>
            </Step>
          </Steps>
        </ChatScreen>
      </In>
    </Fit>
  </Shell>
);

const AnswerCard = ({ title, tone, quote, children }: { title: string; tone: 'plain' | 'ok'; quote: ReactNode; children: ReactNode }) => (
  <div style={{ background: tone === 'ok' ? sage : surface, borderTop: `5px solid ${tone === 'ok' ? okGreen : faint}`, padding: '28px 36px 32px', height: '100%', boxSizing: 'border-box' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <Icon kind={tone === 'ok' ? 'globe' : 'chat'} size={52} color={tone === 'ok' ? okGreen : muted} />
      <span style={{ fontSize: 38, fontWeight: 600 }}>{title}</span>
    </div>
    <div style={{ marginTop: 26, background: '#FFFFFF', border: `1px solid ${rule}`, padding: '24px 28px', fontSize: 34, lineHeight: 1.5 }}>{quote}</div>
    <div style={{ marginTop: 26 }}>{children}</div>
  </div>
);

// The browser's find bar (Cmd/Ctrl+F) over the source page, drawn as a picture.
const FindBar = ({ term: word, hits }: { term: string; hits: string }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 14, background: '#FFFFFF', border: `2px solid ${okGreen}`, padding: '8px 18px', fontSize: 28 }}>
    <Icon kind="search" size={32} color={okGreen} />
    <span style={{ fontWeight: 600 }}>{word}</span>
    <span style={{ marginLeft: 'auto', color: muted, fontSize: 24 }}>{hits}</span>
  </div>
);

const Practice1Search: Page = () => (
  <Shell chapter={2} source={'維基文庫《三國演義》第 21 回 zh.wikisource.org/wiki/三國演義/第021回'}>
    <PracticeEyebrow time="練習 1 第 2 步">練習 1｜ChatGPT</PracticeEyebrow>
    <Heading>練習（查證）：原因在原文哪一句</Heading>
    <PromptsCopy step="1-2" />
    <In i={0} style={{ marginTop: 30 }}><PromptBox>你說的原因，原文哪一句寫的？引用原句，附維基文庫連結。</PromptBox></In>
    <Fit>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48 }}>
        <Steps>
          <Step duration={STEP_MS}>
            <AnswerCard title="它引用的原句" tone="plain" quote="「…又恐操生疑，故借懼雷以掩飾之耳。」">
              <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: '#FFFFFF', border: `2px solid ${faint}`, padding: '6px 16px', fontFamily: mono, fontSize: 26 }}><Icon kind="globe" size={30} color={muted} />zh.wikisource.org</span>
                <span style={{ fontSize: 24, color: quiet }}>常見回答，請看你的</span>
              </div>
            </AnswerCard>
          </Step>
          <Step duration={STEP_MS}>
            <div style={{ background: sage, borderTop: `5px solid ${okGreen}`, padding: '28px 36px 32px', height: '100%', boxSizing: 'border-box' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <Icon kind="browser" size={52} color={okGreen} />
                <span style={{ fontSize: 38, fontWeight: 600 }}>點開連結，Cmd/Ctrl+F</span>
              </div>
              <div style={{ marginTop: 26 }}><FindBar term="掩飾" hits="3 筆" /></div>
              <div style={{ marginTop: 18, background: '#FFFFFF', border: `1px solid ${rule}`, padding: '20px 26px', fontFamily: display, fontSize: 32, lineHeight: 1.55 }}>
                又恐操生疑，故借懼雷以<span style={{ background: 'rgba(233,182,80,0.35)' }}>掩飾</span>之耳。
              </div>
            </div>
          </Step>
        </Steps>
      </div>
      <Steps><Step duration={STEP_MS}><Takeaway>搜得到同一句才算數；搜不到，就再追問</Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

const Practice1Check: Page = () => (
  <Shell chapter={2} source={'維基文庫《三國演義》第 21 回 zh.wikisource.org/wiki/三國演義/第021回'}>
    <PracticeEyebrow time="練習 1 第 3 步">練習 1｜ChatGPT</PracticeEyebrow>
    <Heading>練習（RAG）：附上原文再問一次</Heading>
    <PromptsCopy step="1-3" />
    <Fit>
      <In i={0} style={{ background: '#FFFFFF', border: `1px solid ${rule}`, boxShadow: '0 10px 30px rgba(28,25,23,0.08)' }}>
        <div style={{ height: 58, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 30px', background: surface, borderBottom: `1px solid ${rule}`, fontSize: 26, color: muted }}>
          <span style={{ fontWeight: 600 }}>新對話｜原文和問題一起送出</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}><Icon kind="globe" size={30} color={muted} />原文：維基文庫第 21 回</span>
        </div>
        <div style={{ padding: '28px 36px 32px' }}>
          <div style={{ background: surface, borderLeft: `6px solid ${okGreen}`, padding: '20px 28px', fontFamily: display, fontSize: 34, lineHeight: 1.6 }}>
            操以手指玄德，後自指曰：「今天下英雄，惟使君與操耳。」玄德聞言，吃了一驚，手中所執匙箸，不覺落於地下。
          </div>
          <div style={{ marginTop: 22, fontSize: 33, lineHeight: 1.5 }}>只根據這段原文：劉備聽完做了什麼？為什麼？原文沒寫，就說「原文沒寫」。</div>
        </div>
      </In>
      <Steps><Step duration={STEP_MS}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28, marginTop: 36 }}>
          <div style={{ background: surface, borderTop: `4px solid ${faint}`, padding: '24px 30px', fontSize: 31 }}><strong>1-1 沒給資料</strong><div style={{ marginTop: 10, color: muted }}>說得出原因：掩飾野心、怕曹操起疑</div></div>
          <div style={{ background: sage, borderTop: `4px solid ${okGreen}`, padding: '24px 30px', fontSize: 31 }}><strong>1-3 只給這段</strong><div style={{ marginTop: 10, color: muted }}>只該說「吃了一驚」或「原文沒寫」</div></div>
        </div>
      </Step></Steps>
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={30}>又說出野心？追問「原文哪一句？」</Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

// ---------- 03 安裝 Codex ----------

const Section3: Page = () => <SectionPage chapter={3} label="03 / 安裝" lead="讓 AI 進到你電腦裡的資料夾" />;

const InstallNode: Page = () => (
  <Shell chapter={3} source={'Node.js 官方下載頁 nodejs.org/en/download'}>
    <Eyebrow>步驟 1／4｜Codex 要靠 Node.js 才能跑</Eyebrow>
    <Heading>下載 Node.js 的 LTS 版</Heading>
    <Fit z={1.1}>
      <div style={{ display: 'grid', gridTemplateColumns: '960px 1fr', gap: 56, alignItems: 'center' }}>
        <In i={0} style={{ background: '#FFFFFF', border: `1px solid ${rule}`, boxShadow: '0 10px 30px rgba(28,25,23,0.08)' }}>
          <div style={{ height: 58, display: 'flex', alignItems: 'center', gap: 14, padding: '0 26px', background: surface, borderBottom: `1px solid ${rule}` }}>
            <Icon kind="globe" size={32} color={muted} />
            <span style={{ fontFamily: mono, fontSize: 27, color: muted }}>nodejs.org/en/download</span>
            <span style={{ marginLeft: 'auto', fontSize: 24, color: quiet }}>示意</span>
          </div>
          <div style={{ padding: '44px 56px 52px' }}>
            <div style={{ fontFamily: display, fontSize: 52 }}>Download Node.js</div>
            <div style={{ position: 'relative', display: 'flex', gap: 34, marginTop: 44 }}>
              <div style={{ position: 'relative', width: 360, height: 150, boxSizing: 'border-box', background: '#5FA04E', color: '#FFFFFF', display: 'grid', placeItems: 'center', fontSize: 44, fontWeight: 600 }}>
                LTS
                <span style={{ position: 'absolute', bottom: 14, fontSize: 24, fontWeight: 400 }}>長期支援版</span>
              </div>
              <div style={{ width: 360, height: 150, boxSizing: 'border-box', background: surface, border: `2px solid ${rule}`, color: quiet, display: 'grid', placeItems: 'center', fontSize: 40 }}>Current</div>
              <Steps>
                <Step duration={STEP_MS}><div style={{ position: 'absolute', left: -14, top: -14, width: 388, height: 178, border: '5px solid #E9B650', boxSizing: 'border-box' }} /></Step>
              </Steps>
            </div>
          </div>
        </In>
        <div>
          <Steps>
            <Step duration={STEP_MS}>
              <div style={{ background: '#FFFFFF', border: `1px solid ${rule}`, padding: '30px 34px' }}>
                <SmallLabel>安裝程式</SmallLabel>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 22 }}>
                  <span style={{ border: `2px solid ${amber}`, color: amber, fontSize: 30, fontWeight: 600, padding: '10px 22px' }}>Next</span>
                  <span style={{ fontSize: 34, color: faint }}>→</span>
                  <span style={{ border: `2px solid ${amber}`, color: amber, fontSize: 30, fontWeight: 600, padding: '10px 22px' }}>Next</span>
                  <span style={{ fontSize: 34, color: faint }}>→</span>
                  <span style={{ background: okGreen, color: '#FFFFFF', fontSize: 30, fontWeight: 600, padding: '12px 22px' }}>Finish</span>
                </div>
                <div style={{ fontSize: 31, marginTop: 26 }}>全部用預設，按到 Finish 就好</div>
              </div>
            </Step>
          </Steps>
        </div>
      </div>
    </Fit>
  </Shell>
);

const CheckVersion: Page = () => (
  <Shell chapter={3} source={'Node.js 官方下載頁 nodejs.org/en/download'}>
    <Eyebrow>步驟 2／4｜裝完先重開終端機</Eyebrow>
    <Heading>用 node -v、npm -v 看版本</Heading>
    <Fit>
      <div style={{ display: 'grid', gridTemplateColumns: '900px 1fr', gap: 64, alignItems: 'center' }}>
        <In i={0}>
          <Shot src={nodeCheck} alt="命令提示字元輸入 node -v 顯示 v24.21.0，npm -v 顯示 11.6.2" crop={[110, 250, 820, 440]} width={900}>
            <RowMark top={20} height={100} width={420} n={1} />
            <RowMark top={286} height={100} width={420} n={2} />
          </Shot>
          <Caption>教材範例｜版本號依電腦而定</Caption>
        </In>
        <div style={{ display: 'grid', gap: 40 }}>
          <Steps>
            <Step duration={STEP_MS}><Cue n={1}><Callout n={1} title={<><Path size={32}>node -v</Path>：v 開頭的版本號</>} detail="例如 v24.21.0" /></Cue></Step>
            <Step duration={STEP_MS}><Cue n={2}><Callout n={2} title={<><Path size={32}>npm -v</Path>：一串數字</>} detail="例如 11.6.2" /></Cue></Step>
            <Step duration={STEP_MS}>
              <div style={{ background: warnSoft, borderLeft: `6px solid ${warn}`, padding: '20px 26px' }}>
                <div style={{ fontSize: 30, fontWeight: 600, color: warn }}>出現「找不到指令」</div>
                <div style={{ fontSize: 28, marginTop: 8 }}>重開終端機；還不行就重裝 Node.js</div>
              </div>
            </Step>
          </Steps>
        </div>
      </div>
    </Fit>
  </Shell>
);

const InstallCodex: Page = () => (
  <Shell chapter={3} source={'Codex CLI 安裝說明 github.com/openai/codex'}>
    <Eyebrow>步驟 3／4｜Mac：終端機｜Windows：PowerShell</Eyebrow>
    <Heading>用 npm 安裝 Codex</Heading>
    <Fit z={1.12}>
      <In i={0}>
        <Terminal title="終端機" size={34}>
          <Typed>$</Typed>{' npm install -g @openai/codex@latest\n'}
          <Dim>{'  （跑完沒有紅色 ERROR 就對了）\n'}</Dim>
          <Steps>
            <Step duration={STEP_MS}><div><Typed>$</Typed>{' codex --version'}</div></Step>
            <Step duration={STEP_MS}><div><HotLine>codex-cli 0.154.0</HotLine></div></Step>
          </Steps>
        </Terminal>
      </In>
      <Steps>
        <Step duration={STEP_MS}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 22, marginTop: 36 }}>
            <StatusLine ok size={32}>印出 codex-cli 版本號：裝好了</StatusLine>
            <span style={{ fontSize: 26, color: quiet }}>講師電腦實測｜2026-10-17</span>
          </div>
        </Step>
      </Steps>
    </Fit>
  </Shell>
);

const FirstRunCard = ({ when, screen, pick }: { when: string; screen: string; pick: string }) => (
  <div style={{ background: '#FFFFFF', border: `1px solid ${rule}`, height: '100%', boxSizing: 'border-box', padding: '26px 26px 30px' }}>
    <div style={{ fontSize: 34, fontWeight: 600, color: 'var(--osd-accent)' }}>{when}</div>
    <div style={{ marginTop: 18, background: term, color: '#F5F5F4', padding: '26px 26px', fontFamily: mono, fontSize: 32, lineHeight: 1.45, minHeight: 250, boxSizing: 'border-box' }}>{screen}</div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 24, background: sage, border: `2px solid ${okGreen}`, padding: '14px 18px' }}><Icon kind="ok" size={44} color={okGreen} /><span style={{ fontFamily: mono, fontSize: 30, fontWeight: 700 }}>{pick}</span></div>
  </div>
);

const FirstRun: Page = () => (
  <Shell chapter={3} source={'Codex CLI 文件 developers.openai.com/codex/cli'}>
    <Eyebrow>步驟 4／4｜輸入 codex 之後｜畫面為示意</Eyebrow>
    <Heading>第一次開 Codex 的三個畫面</Heading>
    <Fit>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32, alignItems: 'stretch' }}>
        <Steps>
          <FirstRunCard when="1｜登入" screen="Choose how you want to use Codex." pick="Sign in with ChatGPT" />
          <Step duration={STEP_MS}><FirstRunCard when="2｜信任資料夾" screen="Do you trust the contents of this directory?" pick="Yes, continue" /></Step>
          <Step duration={STEP_MS}><FirstRunCard when="3｜改資料夾外的檔" screen="Would you like to make the following edits?" pick="Yes, proceed" /></Step>
        </Steps>
      </div>
      <Steps><Step duration={STEP_MS}><div style={{ display: 'flex', justifyContent: 'center', marginTop: 32 }}><StatusLine ok size={30}>登入成功：瀏覽器說已登入，終端機出現 Codex 輸入列</StatusLine></div></Step></Steps>
    </Fit>
  </Shell>
);

// ---------- 04 看懂 Codex ----------

const Section4: Page = () => <SectionPage chapter={4} label="04 / CODEX CLI" lead="啟動畫面、Session、/status、Memory" />;

const StartScreen: Page = () => (
  <Shell chapter={4} source={'Codex CLI 文件 developers.openai.com/codex/cli'}>
    <Eyebrow>打開 Codex 第一眼</Eyebrow>
    <Heading>讀懂 Codex 啟動畫面</Heading>
    <Fit>
      <div style={{ display: 'grid', gridTemplateColumns: '1000px 1fr', gap: 64, alignItems: 'center' }}>
        <In i={0}>
          <Shot src={codexStart} alt="Codex 0.154.0 啟動畫面：model 與 directory 兩個欄位，下方是輸入列" crop={[130, 340, 920, 420]} width={1000}>
            <RowMark top={150} height={46} width={960} n={1} badge={false} />
            <RowMark top={202} height={46} width={960} n={2} badge={false} />
            <RowMark top={355} height={46} width={500} n={3} badge={false} />
          </Shot>
          <Caption>教材範例｜路徑是講師的另一個資料夾，你的會是 aw-01-lab</Caption>
        </In>
        <div style={{ display: 'grid', gap: 40 }}>
          <Steps>
            <Step duration={STEP_MS}><Cue n={1}><Callout n={1} title={<><Path size={32}>model</Path>：用哪個模型</>} detail="名稱會變，不用背" /></Cue></Step>
            <Step duration={STEP_MS}><Cue n={2}><Callout n={2} title={<><Path size={32}>directory</Path>：在哪個資料夾</>} detail="它在這裡讀檔、存檔" /></Cue></Step>
            <Step duration={STEP_MS}><Cue n={3}><Callout n={3} title={<><Path size={32}>›</Path> 後面：打字的地方</>} detail="中文直接打" /></Cue></Step>
          </Steps>
        </div>
      </div>
    </Fit>
  </Shell>
);

const DeskCard = ({ x, y, kind, label, eg }: { x: number; y: number; kind: IconKind; label: string; eg: string }) => (
  <g>
    <rect x={x} y={y} width="420" height="120" fill={surface} stroke={rule} strokeWidth="2" />
    <SvgIcon kind={kind} x={x + 62} y={y + 60} size={56} color={amber} />
    <text x={x + 116} y={y + 52} fontSize="32" fontWeight="600" fill={ink}>{label}</text>
    <text x={x + 116} y={y + 94} fontSize="26" fill={muted}>{eg}</text>
  </g>
);

const SessionDesk: Page = () => (
  <Shell chapter={4}>
    <Eyebrow>Session＝一次工作階段</Eyebrow>
    <Heading>Session（工作階段）</Heading>
    <Lead>像一張工作桌：桌上的東西它都看得到</Lead>
    <Fit>
      <Stage h={400}>
        <Steps>
          <Layer h={400} label="Session 1 的桌上：你的任務、讀過的檔案、它的回答、你的追問">
            <rect x="0" y="10" width="940" height="380" fill="#FFFFFF" stroke={ink} strokeWidth="2" />
            <text x="32" y="62" fontSize="32" fontWeight="600" fill={ink}>Session 1</text>
            <InG i={0}><DeskCard x={32} y={92} kind="chat" label="你的任務" eg="寫第 1 回大綱" /></InG>
            <InG i={1}><DeskCard x={488} y={92} kind="doc" label="讀過的檔案" eg="原文/第001回.txt" /></InG>
            <InG i={2}><DeskCard x={32} y={236} kind="ok" label="它的回答" eg="一段大綱草稿" /></InG>
            <InG i={3}><DeskCard x={488} y={236} kind="search" label="你的追問" eg="「剛剛那段改短」" /></InG>
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
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={40}>同一件事，留在同一個 Session</Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

const STATUS_COLS = '250px 1fr';

const StatusPage: Page = () => (
  <Shell chapter={4} source={'Codex 斜線指令 developers.openai.com/codex/cli/slash-commands'}>
    <Eyebrow>指令｜在 Codex 裡輸入 /status</Eyebrow>
    <Heading>用 /status 確認 Directory</Heading>
    <Fit>
      <div style={{ display: 'grid', gridTemplateColumns: '780px 1fr', gap: 56, alignItems: 'center' }}>
        <In i={0}>
          <Shot src={codexStatus} alt="Codex /status 的輸出，只標出 Directory 這一行，其他欄位變暗" crop={[130, 330, 905, 480]} width={780}>
            <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 88, background: 'rgba(31,34,38,0.74)' }} />
            <div style={{ position: 'absolute', left: 0, right: 0, top: 126, bottom: 0, background: 'rgba(31,34,38,0.74)' }} />
            <RowMark top={88} height={38} width={768} />
          </Shot>
          <Caption>教材範例｜你的 Directory 會是自己的資料夾</Caption>
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
              <div style={{ fontSize: 27, color: quiet, marginTop: 26, lineHeight: 1.6 }}>其他欄位先知道就好：<br /><Path size={26}>Model</Path> 模型・<Path size={26}>Permissions</Path> 改檔權限・<Path size={26}>Session</Path> 編號</div>
            </Step>
          </Steps>
        </div>
      </div>
      <Steps><Step duration={STEP_MS}><Takeaway>動手前，先看 Directory 對不對</Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

const UsageBar = ({ y, label, pct, i = 0 }: { y: number; label: string; pct: number; i?: number }) => {
  const live = useIsActivePage();
  return (
    <g>
      <text x="0" y={y} fontSize="31" fill={ink}>{label}</text>
      <rect x="0" y={y + 20} width="700" height="50" fill={surface} stroke={rule} strokeWidth="2" />
      <rect x="0" y={y + 20} width={7 * pct} height="50" fill="#8CCB9B" className={live ? 'aw1-fill' : undefined} style={live ? { animationDelay: enterDelay(i, 360), animationDuration: `${BAR_MS}ms` } : undefined} />
      <text x="690" y={y} textAnchor="end" fontSize="26" fill={okGreen}>還剩 {pct}%（示意）</text>
    </g>
  );
};

const TokTile = ({ x, w, label, tint }: { x: number; w: number; label: string; tint: string }) => (
  <g><rect x={x} y={150} width={w} height="76" fill={tint} stroke="#FFFFFF" strokeWidth="3" /><text x={x + w / 2} y={202} textAnchor="middle" fontSize="38" fill={ink}>{label}</text></g>
);

const UsageToken: Page = () => (
  <Shell chapter={4} source={'Codex 方案與額度 developers.openai.com/codex/pricing'}>
    <Eyebrow>Usage 與 Token｜簡單分清楚</Eyebrow>
    <Heading>Usage（額度）與 Token</Heading>
    <Lead>像手機方案：月租額度，和用掉的流量</Lead>
    <Fit>
      <Stage h={480}>
        <Steps>
          <Layer h={480} label="Usage：帳號這段時間還能用多少，/status 最下面兩行">
            <InG i={0}>
              <text x="0" y="50" fontSize="46" fontWeight="600" fill={ink}>Usage</text>
              <text x="0" y="98" fontSize="29" fill={muted}>帳號這段時間還能用多少</text>
            </InG>
            <InG i={1}><UsageBar y={170} label="5 小時額度" pct={74} i={1} /></InG>
            <InG i={2}><UsageBar y={290} label="每週額度" pct={53} i={2} /></InG>
            <InG i={3}><text x="0" y="430" fontSize="27" fill={quiet}>就是 /status 最下面兩行</text></InG>
          </Layer>
          <Step duration={STEP_MS}><Layer h={480} label="Token：AI 讀寫文字的單位；提示詞、讀到的檔案、前面的對話都算">
            <line x1="820" y1="10" x2="820" y2="470" stroke={rule} strokeWidth="2" />
            <text x="900" y="50" fontSize="46" fontWeight="600" fill={ink}>Token</text>
            <text x="900" y="98" fontSize="29" fill={muted}>AI 讀寫文字的單位（切法示意）</text>
            <g className="aw1-build" style={buildDelay(0)}>
              <TokTile x={900} w={150} label="今天" tint={amberSoft} />
              <TokTile x={1050} w={150} label="天氣" tint={blueSoft} />
              <TokTile x={1200} w={100} label="很" tint={sage} />
              <TokTile x={1300} w={100} label="好" tint={amberSoft} />
              <TokTile x={1400} w={100} label="。" tint={blueSoft} />
            </g>
            <g className="aw1-build" style={buildDelay(1)}>
              <SvgChip x={900} y={290} w={220} h={64} label="你的提示詞" size={28} />
              <text x="1140" y="334" textAnchor="middle" fontSize="36" fill={faint}>＋</text>
              <SvgChip x={1160} y={290} w={220} h={64} label="讀到的檔案" size={28} fill={amberSoft} stroke={amber} />
              <text x="1400" y="334" textAnchor="middle" fontSize="36" fill={faint}>＋</text>
              <SvgChip x={1420} y={290} w={212} h={64} label="前面的對話" size={28} />
              <text x="1266" y="430" textAnchor="middle" fontSize="30" fontWeight="600" fill={amber}>＝這次用掉的 Token</text>
            </g>
          </Layer></Step>
        </Steps>
      </Stage>
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={24}>讀的檔越多，Token 越多，額度用得越快</Takeaway></Step></Steps>
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
  <Shell chapter={4} source={'Codex 文件：AGENTS.md developers.openai.com/codex/guides/agents-md；agents.md'}>
    <Eyebrow>Memory＝留下來的上下文</Eyebrow>
    <Heading>Memory 的兩層</Heading>
    <Lead>像口頭交代，和貼在牆上的公告</Lead>
    <Fit>
      <Stage h={460}>
        <Steps>
          <Layer h={460} label="Session 內的記憶：在 Session 1 說的規則，到了 Session 2 就不見了">
            <text x="0" y="24" fontSize="26" fontWeight="600" fill={quiet} letterSpacing="2">第一層｜Session 內的記憶</text>
            <InG i={0}><SessionBox x={80} title="Session 1">
              <SvgChip x={108} y={118} w={484} h={60} label="規則：只根據 原文/ 回答" size={27} fill={amberSoft} stroke={amber} />
            </SessionBox></InG>
            <InG i={1}><MapArrow x1={636} x2={1004} y={125} />
              <text x="820" y="108" textAnchor="middle" fontSize="28" fontFamily={mono} fill={muted}>/new</text></InG>
            <InG i={2}><SessionBox x={1012} title="Session 2">
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
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={28}>聊天只留在這個 Session；AGENTS.md 只管這個資料夾</Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

const TreeRow = ({ y, kind, name, hot = false }: { y: number; kind: IconKind; name: string; hot?: boolean }) => (
  <g>
    {hot ? <rect x="40" y={y - 34} width="380" height="60" fill={amberSoft} stroke={amber} strokeWidth="2" /> : null}
    <SvgIcon kind={kind} x={84} y={y - 4} size={38} color={hot ? amber : muted} />
    <text x="118" y={y + 7} fontSize="31" fontFamily={kind === 'folder' ? undefined : mono} fontWeight={hot ? 700 : 400} fill={ink}>{name}</text>
  </g>
);

const SessionReads = ({ y, n }: { y: number; n: number }) => (
  <g>
    <rect x="1190" y={y} width="442" height="100" fill="#FFFFFF" stroke={ink} strokeWidth="2" />
    <text x="1220" y={y + 60} fontSize="31" fontWeight="600" fill={ink}>Session {n}</text>
    <OkDot x={1414} y={y + 50} r={20} />
    <text x="1444" y={y + 60} fontSize="27" fill={okGreen}>先讀規則</text>
  </g>
);

const AgentsFile: Page = () => (
  <Shell chapter={4} source={'Codex 文件：AGENTS.md developers.openai.com/codex/guides/agents-md；agents.md'}>
    <Eyebrow>專案裡的記憶</Eyebrow>
    <Heading>AGENTS.md 是給 Codex 的規則檔</Heading>
    <Fit>
      <Stage h={460}>
        <Steps>
          <Layer h={460} label="aw-01-lab 資料夾裡的 AGENTS.md，內容是三條規則（示意）">
            <InG i={0}>
              <rect x="0" y="20" width="460" height="420" fill={surface} />
              <SvgIcon kind="folder" x={52} y={74} size={44} color={amber} />
              <text x="88" y="86" fontSize="32" fontWeight="600" fill={ink}>aw-01-lab/</text>
              <TreeRow y={170} kind="folder" name="原文/" />
              <TreeRow y={240} kind="doc" name="回目.md" />
              <TreeRow y={310} kind="doc" name="prompts.md" />
              <TreeRow y={380} kind="doc" name="AGENTS.md" hot />
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
            <g className="aw1-build" style={buildDelay(2)}><SessionReads y={50} n={1} /></g>
            <g className="aw1-build" style={buildDelay(3)}><SessionReads y={190} n={2} /></g>
            <g className="aw1-build" style={buildDelay(4)}><SessionReads y={330} n={3} /></g>
          </Layer></Step>
        </Steps>
      </Stage>
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={32}>它就是普通的文字檔，打開就能改</Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

// ---------- 05 用 Codex 寫大綱 ----------

const Section5: Page = () => <SectionPage chapter={5} label="05 / 實作" lead="只看原文，寫出前 21 回的大綱" />;

const LabRow = ({ y, kind, name, note }: { y: number; kind: IconKind; name: string; note: string }) => (
  <g>
    <line x1="120" y1={y} x2="190" y2={y} stroke={faint} strokeWidth="3" />
    <SvgIcon kind={kind} x={226} y={y} size={46} color={kind === 'folder' ? amber : muted} />
    <text x="266" y={y + 12} fontSize="34" fontFamily={mono} fontWeight="600" fill={ink}>{name}</text>
    <text x="640" y={y + 12} fontSize="30" fill={muted}>{note}</text>
  </g>
);

const DownloadLab: Page = () => (
  <Shell chapter={5}>
    <Eyebrow>練習資料夾｜維基文庫原文，公有領域</Eyebrow>
    <Heading>下載練習資料夾 aw-01-lab</Heading>
    <In i={0} style={{ marginTop: 30, display: 'flex', alignItems: 'center', gap: 28 }}>
      <a href={LAB_ZIP_URL} target="_blank" rel="noreferrer" aria-label="下載 aw-01-lab.zip"><img src={labQr} alt="aw-01-lab.zip 的下載 QR code" style={{ width: 150, height: 150, display: 'block', background: '#FFFFFF', border: `1px solid ${rule}`, padding: 6 }} /></a>
      <div style={{ display: 'grid', gap: 12 }}>
        <span style={{ fontSize: 32, fontWeight: 600 }}>掃碼，或按下面的按鈕下載 ZIP</span>
        <a href={LAB_ZIP_URL} download="aw-01-lab.zip" style={{ justifySelf: 'start', display: 'inline-flex', alignItems: 'center', gap: 12, background: amber, color: '#FFFFFF', padding: '10px 24px', fontSize: 28, fontWeight: 600, textDecoration: 'none' }}><Icon kind="down" size={34} color="#FFFFFF" />下載 aw-01-lab.zip</a>
      </div>
    </In>
    <Fit>
      <Figure h={470} label="aw-01-lab 裡有：原文資料夾（第 1 到 21 回全文）、回目.md、prompts.md、README.md">
        <InG i={1}>
          <SvgIcon kind="folder" x={120} y={50} size={64} color={amber} />
          <text x="170" y="64" fontSize="40" fontWeight="600" fill={ink}>aw-01-lab/</text>
          <line x1="120" y1="90" x2="120" y2="410" stroke={faint} strokeWidth="3" />
        </InG>
        <InG i={2}>
          <LabRow y={150} kind="folder" name="原文/" note="第 1–21 回全文，一回一檔" />
          <DocShape x={1230} y={100} w={90} h={110} fill={surface} />
          <DocShape x={1260} y={112} w={90} h={110} fill={surface} />
          <DocShape x={1290} y={124} w={90} h={110} />
          <text x="1420" y="170" fontSize="28" fontFamily={mono} fill={muted}>×21</text>
        </InG>
        <InG i={3}><LabRow y={260} kind="doc" name="回目.md" note="21 回的回目清單" /></InG>
        <InG i={4}><LabRow y={340} kind="doc" name="prompts.md" note="等一下要貼的提示詞" /></InG>
        <InG i={5}><LabRow y={410} kind="doc" name="README.md" note="資料夾說明" /></InG>
      </Figure>
    </Fit>
  </Shell>
);

const OpenLab: Page = () => (
  <Shell chapter={5}>
    <PracticeEyebrow time="3 分鐘">練習 2-1｜Codex</PracticeEyebrow>
    <Heading>練習（/status）：確認資料夾對不對</Heading>
    <Fit z={1.08}>
      <div style={{ display: 'grid', gridTemplateColumns: '1060px 1fr', gap: 56, alignItems: 'center' }}>
        <In i={0}>
          {/* The terminal lines appear with the cues of the steps on the right, so command, output and check alternate. */}
          <Terminal title="終端機（示意，路徑依電腦而定）" size={30}>
            <Typed>$</Typed>{' cd '}<Dim>{'〔打空格，再把 aw-01-lab 資料夾拖進來〕\n'}</Dim>
            <CueSpan n={1}><Typed>$</Typed>{' ls\n'}</CueSpan>
            <CueSpan n={1} delay={260}><HotLine>原文</HotLine>{'  README.md  '}<HotLine>prompts.md</HotLine>{'  '}<HotLine>回目.md</HotLine>{'\n'}</CueSpan>
            <CueSpan n={2}><Typed>$</Typed>{' codex\n'}<AskLine>{'› /status\n'}</AskLine></CueSpan>
            <CueSpan n={2} delay={260}>{'Directory:    '}<HotLine>~/…/aw-01-lab</HotLine></CueSpan>
          </Terminal>
        </In>
        <div style={{ display: 'grid' }}>
          <Steps>
            <Step duration={STEP_MS}><Cue n={1} /></Step>
            <Step duration={STEP_MS}>
              <div style={{ display: 'grid', gap: 30 }}>
                <div className="aw1-build" style={{ ...buildDelay(0), background: sage, padding: '22px 26px' }}><StatusLine ok size={32}>ls 看得到 原文</StatusLine><div style={{ fontSize: 28, marginTop: 10, marginLeft: 50 }}>再打 <Path size={28}>codex</Path></div></div>
                <div className="aw1-build" style={{ ...buildDelay(1), background: amberSoft, padding: '22px 26px' }}><StatusLine ok={false} size={32}>只看到 aw-01-lab</StatusLine><div style={{ fontSize: 28, marginTop: 10, marginLeft: 50 }}>多包一層：<Path size={28}>cd aw-01-lab</Path></div></div>
              </div>
            </Step>
            <Step duration={STEP_MS}><Cue n={2} /></Step>
            <Step duration={STEP_MS}><div style={{ background: sage, padding: '22px 26px', marginTop: 30 }}><StatusLine ok size={32}>Directory 結尾對</StatusLine><div style={{ fontSize: 28, marginTop: 10, marginLeft: 50 }}>可以開始了</div></div></Step>
          </Steps>
        </div>
      </div>
    </Fit>
  </Shell>
);

// One round of the memory practice: what you type, then what happens.
const RoundCard = ({ when, lines, ok, result }: { when: string; lines: string; ok: boolean | 'save'; result: string }) => (
  <div style={{ background: '#FFFFFF', border: `1px solid ${rule}`, height: '100%', boxSizing: 'border-box', padding: '24px 26px 28px', display: 'flex', flexDirection: 'column' }}>
    <div style={{ fontSize: 33, fontWeight: 600, color: 'var(--osd-accent)' }}>{when}</div>
    <div style={{ marginTop: 18, flex: 1, background: term, color: '#E9B650', padding: '22px 24px', fontFamily: mono, fontSize: 30, lineHeight: 1.6, minHeight: 300, boxSizing: 'border-box', whiteSpace: 'pre-wrap' }}>{lines}</div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 22, background: ok === false ? amberSoft : sage, border: `2px solid ${ok === false ? amber : okGreen}`, padding: '12px 18px', fontSize: 30, fontWeight: 600 }}>
      {ok === 'save' ? <Icon kind="save" size={40} color={okGreen} /> : ok ? <Icon kind="ok" size={40} color={okGreen} /> : <svg viewBox="0 0 40 40" style={{ width: 40, height: 40 }} aria-hidden="true"><CrossMark x={20} y={20} size={22} color={amber} /></svg>}
      <span>{result}</span>
    </div>
  </div>
);

const RulePractice: Page = () => (
  <Shell chapter={5} source={'Codex 文件：AGENTS.md developers.openai.com/codex/guides/agents-md；agents.md'}>
    <PracticeEyebrow time="5 分鐘">練習 2-2｜Codex</PracticeEyebrow>
    <Heading>練習（Memory）：規則寫進 AGENTS.md</Heading>
    <Fit z={1.04}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32, alignItems: 'stretch' }}>
        <Steps>
          <RoundCard when="1｜寫規則" lines={'› 請在 AGENTS.md\n  寫一條規則：只根據\n  原文/ 回答，找不到\n  就說找不到，最後\n  一行寫出處……'} ok="save" result="資料夾多了 AGENTS.md" />
          <Step duration={STEP_MS}><RoundCard when="2｜/new 再問" lines={'/new\n› 劉備第一次出場\n  在第幾回？\n第一回。\n出處：原文/第001回.txt'} ok result="最後一行照規則寫" /></Step>
          <Step duration={STEP_MS}><RoundCard when="3｜對照題" lines={'› 諸葛亮第一次出場\n  在第幾回？\n原文/ 裡找不到……'} ok result="沒有憑記憶報回數" /></Step>
        </Steps>
      </div>
    </Fit>
  </Shell>
);

const FlowStation = ({ x, label, children }: { x: number; label: string; children: ReactNode }) => (
  <g>
    {children}
    <text x={x} y={330} textAnchor="middle" fontSize="31" fontWeight="600" fill={ink}>{label}</text>
  </g>
);

const OutlinePrompt: Page = () => (
  <Shell chapter={5} source={'維基文庫《三國演義》第 1–21 回 zh.wikisource.org/wiki/三國演義'}>
    <PracticeEyebrow time="5 分鐘">練習 2-3｜Codex</PracticeEyebrow>
    <Heading>練習（RAG）：照原文寫大綱</Heading>
    <PillRow>
      <Pill tag="定位">原文第 1–21 回</Pill>
      <Pill tag="期望輸出">三國演義大綱.md</Pill>
      <Pill tag="限制">原文沒寫的不加</Pill>
    </PillRow>
    <Fit>
      <Stage h={360}>
        <Steps>
          <Layer h={360} label="Codex 讀原文資料夾的 21 個檔">
            <InG i={1}>
              <FlowStation x={150} label="原文/ 21 回">
                <DocShape x={70} y={110} w={120} h={150} fill={surface} />
                <DocShape x={100} y={125} w={120} h={150} fill={surface} />
                <DocShape x={130} y={140} w={120} h={150} />
              </FlowStation>
            </InG>
            <InG i={2}><MapArrow x1={264} x2={362} y={200} /></InG>
            <InG i={3}>
              <FlowStation x={470} label="Codex 讀完">
                <rect x="380" y="130" width="180" height="140" fill={term} />
                <text x="470" y="212" textAnchor="middle" fontSize="30" fontFamily={mono} fill="#F5F5F4">&gt;_ Codex</text>
              </FlowStation>
            </InG>
          </Layer>
          <Step duration={STEP_MS}><Layer h={360} label="先給你看草稿">
            <MapArrow x1={572} x2={670} y={200} />
            <FlowStation x={790} label="先給你看">
              <Bubble x={690} y={110} w={200} h={150} />
              <rect x="714" y="140" width="150" height="12" fill={rule} />
              <rect x="714" y="170" width="120" height="12" fill={rule} />
              <rect x="714" y="200" width="140" height="12" fill={linkSoft} />
              <rect x="714" y="230" width="100" height="12" fill={sage} />
            </FlowStation>
          </Layer></Step>
          <Step duration={STEP_MS}><Layer h={360} label="你說可以，它直接存成三國演義大綱.md">
            <MapArrow x1={904} x2={1002} y={200} hot />
            <FlowStation x={1120} label="你說「可以」">
              <rect x="1016" y="120" width="208" height="64" rx="32" fill={amberSoft} />
              <text x="1120" y="163" textAnchor="middle" fontSize="30" fill={ink}>可以，存檔</text>
              <rect x="1016" y="206" width="208" height="60" fill={sage} stroke={okGreen} strokeWidth="2" />
              <text x="1120" y="246" textAnchor="middle" fontSize="28" fontWeight="700" fill={ink}>直接存檔</text>
            </FlowStation>
            <MapArrow x1={1238} x2={1336} y={200} hot />
            <FlowStation x={1470} label="三國演義大綱.md">
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
  <Shell chapter={5} source={'維基文庫《三國演義》第 1–21 回 zh.wikisource.org/wiki/三國演義'}>
    <Eyebrow>講師實測｜Codex 0.154</Eyebrow>
    <Heading>實測結果：21 段，每段附出處</Heading>
    <Fit>
      <div style={{ display: 'grid', gridTemplateColumns: '1100px 1fr', gap: 48, alignItems: 'center' }}>
        <In i={0} style={{ background: '#FFFFFF', border: `1px solid ${rule}`, boxShadow: '0 10px 30px rgba(28,25,23,0.08)' }}>
          <div style={{ height: 54, display: 'flex', alignItems: 'center', gap: 12, padding: '0 24px', background: surface, borderBottom: `1px solid ${rule}`, fontSize: 25, color: muted }}>
            <Icon kind="doc" size={30} color={muted} />三國演義大綱.md
          </div>
          <div style={{ padding: '20px 34px 24px', fontSize: 28, lineHeight: 1.6 }}>
            <div style={{ fontSize: 36, fontWeight: 600 }}># 三國演義大綱</div>
            <div style={{ fontSize: 30, fontWeight: 600, marginTop: 10 }}>## 第 1 回 宴桃園豪傑三結義　斬黃巾英雄首立功</div>
            <div>……<L>[[劉備]]</L>在涿縣遇到<L>[[張飛]]</L>、<L>[[關羽]]</L>，三人在桃園結義……</div>
            <div style={{ color: okGreen, fontWeight: 600 }}><Ring n={2} inline>出處：原文/第001回.txt</Ring></div>
            <div style={{ fontSize: 30, fontWeight: 600, marginTop: 14 }}>## 第 2 回 <Ring n={3} inline><L>[[張飛]]</L>怒鞭督郵　<L>[[何進]]</L>謀誅宦豎</Ring></div>
            <div>……督郵索賄陷害<L>[[劉備]]</L>，<L>[[張飛]]</L>怒鞭督郵，三人棄官離去……</div>
            <div style={{ color: okGreen, fontWeight: 600 }}><Ring n={2} inline>出處：原文/第002回.txt</Ring></div>
            <div style={{ color: quiet, marginTop: 10 }}>⋮　第 3–21 回，同樣格式</div>
          </div>
        </In>
        <div style={{ display: 'grid', gap: 40 }}>
          <Steps>
            <Step duration={STEP_MS}><Callout n={1} title={<>人名變成 <span style={{ color: link }}>[[連結]]</span></>} detail="第二堂就能連到人物卡" /></Step>
            <Step duration={STEP_MS}><Cue n={2}><Callout n={2} title="每段最後附出處" detail="21 段，21 個出處" /></Cue></Step>
            <Step duration={STEP_MS}><Cue n={3}><Callout n={3} title="小毛病：回目被改了" detail="「張翼德」變成 [[張飛]]" /></Cue></Step>
          </Steps>
        </div>
      </div>
    </Fit>
  </Shell>
);

// One title, shown the way it appears in a file, for the 回目 check.
const TitleChip = ({ file, children }: { file: string; children: ReactNode }) => (
  <div style={{ background: '#FFFFFF', border: `1px solid ${rule}`, padding: '12px 22px' }}>
    <div style={{ fontFamily: mono, fontSize: 24, color: muted }}>{file}</div>
    <div style={{ fontSize: 28, marginTop: 4, whiteSpace: 'nowrap' }}>{children}</div>
  </div>
);

const CheckSource: Page = () => (
  <Shell chapter={5} source={'維基文庫《三國演義》第 1–21 回 zh.wikisource.org/wiki/三國演義'}>
    <PracticeEyebrow time="4 分鐘">練習 2-4｜核對</PracticeEyebrow>
    <Heading>練習（RAG）：請它指出原文哪一句</Heading>
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
            <text x="910" y="182" fontSize="30" fill={muted}>去必有失。<tspan fill={ink}>我有一計，可殺車冑：</tspan></text>
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
            <TitleChip file="三國演義大綱.md">## 第 21 回 曹操煮酒論英雄　關公賺城斬車胄</TitleChip>
            <span style={{ fontSize: 40, color: okGreen, fontWeight: 600 }}>＝</span>
            <TitleChip file="回目.md">第 21 回　曹操煮酒論英雄　關公賺城斬車胄</TitleChip>
          </div>
        </Step>
        <Step duration={STEP_MS}><Takeaway marginTop={24}>搜得到原句、標題一字不差，才算核對過</Takeaway></Step>
      </Steps>
    </Fit>
  </Shell>
);

// ---------- Close ----------

const RecapStop = ({ x, n, verb }: { x: number; n: Chapter; verb: string }) => (
  <g>
    <circle cx={x} cy="100" r="76" fill={amberSoft} stroke={amber} strokeWidth="3" />
    <text x={x} y="122" textAnchor="middle" fontSize="60" fontFamily={display} fill={amber}>{n}</text>
    <text x={x} y="240" textAnchor="middle" fontSize="34" fontWeight="600" fill={ink}>{CHAPTERS[n - 1]}</text>
    <text x={x} y="294" textAnchor="middle" fontSize="30" fill={muted}>{verb}</text>
  </g>
);

const Recap: Page = () => (
  <Shell>
    <Eyebrow>總結</Eyebrow>
    <Heading>今天學的五件事</Heading>
    <Fit>
      <Figure h={320} label="五章回顧">
        <g fill="none" stroke={amber} strokeWidth="4"><DrawPath i={5} d="M240 100 H1392" /></g>
        <InG i={0}><RecapStop x={163} n={1} verb="猜字會猜錯" /></InG>
        <InG i={1}><RecapStop x={489} n={2} verb="追問原文哪一句" /></InG>
        <InG i={2}><RecapStop x={816} n={3} verb="Node.js＋Codex" /></InG>
        <InG i={3}><RecapStop x={1143} n={4} verb="/status、AGENTS.md" /></InG>
        <InG i={4}><RecapStop x={1469} n={5} verb="大綱每段附出處" /></InG>
      </Figure>
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={72}>AI 寫的東西，回原文核對過才算數</Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

const GraphNode = ({ x, y, name, empty = false }: { x: number; y: number; name: string; empty?: boolean }) => (
  <g>
    <circle cx={x} cy={y} r="40" fill={empty ? '#FFFFFF' : linkSoft} stroke={empty ? linkPale : link} strokeWidth="3" strokeDasharray={empty ? '7 6' : undefined} />
    <text x={x} y={y + 10} textAnchor="middle" fontSize="27" fill={empty ? linkPale : link}>{name}</text>
  </g>
);

const NextLesson: Page = () => (
  <Shell>
    <Eyebrow>預告｜第 2 堂 Obsidian 與 RAG</Eyebrow>
    <Heading>下一堂：大綱放進 Obsidian</Heading>
    <Fit>
      <Stage h={440}>
        <Steps>
          <Layer h={440} label="今天的三國演義大綱.md，人名都是連結">
            <InG i={0}>
              <DocShape x={0} y={50} w={400} h={340} fill="#FFFFFF" stroke={amber} sw={3} />
              <text x="30" y="108" fontSize="30" fontWeight="600" fill={ink}>三國演義大綱.md</text>
              <rect x="30" y="140" width="300" height="12" fill={rule} />
              <text x="30" y="210" fontSize="30" fill={ink}><tspan fill={link}>[[劉備]]</tspan>遇到<tspan fill={link}>[[關羽]]</tspan></text>
              <rect x="30" y="240" width="320" height="12" fill={rule} />
              <text x="30" y="306" fontSize="30" fill={ink}><tspan fill={link}>[[曹操]]</tspan>獻刀……</text>
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
            <GraphNode x={840} y={130} name="劉備" />
            <GraphNode x={820} y={320} name="關羽" />
            <GraphNode x={990} y={370} name="張飛" />
            <GraphNode x={1290} y={100} name="曹操" />
            <GraphNode x={1250} y={360} name="孫權" />
            <circle cx="606" cy="396" r="14" fill={linkSoft} stroke={link} strokeWidth="3" />
            <text x="630" y="405" fontSize="25" fill={link}>深紫＝已經有人物卡</text>
          </Layer></Step>
          <Step duration={STEP_MS}><Layer h={440} label="還沒有卡的人名，會是淡紫色連結">
            <g stroke={linkPale} strokeWidth="3" strokeDasharray="8 7"><line x1="1060" y1="230" x2="1520" y2="170" /><line x1="1060" y1="230" x2="1520" y2="300" /></g>
            <GraphNode x={1520} y={170} name="董卓" empty />
            <GraphNode x={1520} y={300} name="呂布" empty />
            <circle cx="1374" cy="396" r="14" fill="#FFFFFF" stroke={linkPale} strokeWidth="3" strokeDasharray="5 4" />
            <text x="1398" y="405" fontSize="25" fill={linkPale}>淡紫＝還沒有卡</text>
          </Layer></Step>
        </Steps>
      </Stage>
      <Steps>
        <Step duration={STEP_MS}>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 40 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 14, background: '#FFFFFF', border: `2px solid ${amber}`, padding: '12px 26px', fontSize: 30 }}>
              <Icon kind="down" size={38} color={amber} />下一堂前，先安裝 Obsidian<span style={{ fontFamily: mono, fontSize: 28, color: muted }}>obsidian.md</span>
            </span>
          </div>
        </Step>
      </Steps>
    </Fit>
  </Shell>
);

// ---------- Appendix: no Codex plan ----------

// One backup route: icon, name, what you need, and a tag saying how to treat it.
const RouteCard = ({ y, kind, title, sub, tag, tone }: { y: number; kind: IconKind; title: string; sub: string; tag: string; tone: 'ok' | 'plain' | 'warn' }) => {
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

const ReferencesModel: Page = () => (
  <Shell>
    <Eyebrow>延伸閱讀｜第 1 章用到的論文</Eyebrow>
    <Heading>參考資料（一）：模型原理與幻覺</Heading>
    <RefHint />
    <Fit>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'start' }}>
        <In i={0}>
          <RefGroup label="猜下一個字、Token">
            <RefItem who="Vaswani et al. 2017" where="1706.03762" title="Attention Is All You Need" />
            <RefItem who="Radford et al. 2018" where="OpenAI 報告" title="Improving Language Understanding by Generative Pre-Training" />
            <RefItem who="Brown et al. 2020" where="2005.14165" title="Language Models are Few-Shot Learners" />
            <RefItem who="Ouyang et al. 2022" where="2203.02155" title="Training Language Models to Follow Instructions with Human Feedback" />
            <RefItem who="Sennrich et al. 2016" where="1508.07909" title="Neural Machine Translation of Rare Words with Subword Units" />
          </RefGroup>
        </In>
        <In i={1}>
          <RefGroup label="隨機性、幻覺">
            <RefItem who="Holtzman et al. 2020" where="1904.09751" title="The Curious Case of Neural Text Degeneration" />
            <RefItem who="Ji et al. 2023" where="2202.03629" title="Survey of Hallucination in Natural Language Generation" />
            <RefItem who="Huang et al. 2023" where="2311.05232" title="A Survey on Hallucination in Large Language Models" />
            <RefItem who="Kalai et al. 2025" where="2509.04664" title="Why Language Models Hallucinate" />
          </RefGroup>
        </In>
      </div>
    </Fit>
  </Shell>
);

const ReferencesMethods: Page = () => (
  <Shell>
    <Eyebrow>延伸閱讀｜第 1 章用到的論文</Eyebrow>
    <Heading>參考資料（二）：CoT、工具、RAG 與 Agent</Heading>
    <RefHint />
    <Fit>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'start' }}>
        <In i={0}>
          <RefGroup label="CoT、Tool Calling">
            <RefItem who="Wei et al. 2022" where="2201.11903" title="Chain-of-Thought Prompting Elicits Reasoning in LLMs" />
            <RefItem who="Kojima et al. 2022" where="2205.11916" title="Large Language Models are Zero-Shot Reasoners" />
            <RefItem who="Gao et al. 2023" where="2211.10435" title="PAL: Program-aided Language Models" />
            <RefItem who="Schick et al. 2023" where="2302.04761" title="Toolformer: Language Models Can Teach Themselves to Use Tools" />
          </RefGroup>
        </In>
        <In i={1}>
          <RefGroup label="Web Search、RAG、Agent">
            <RefItem who="Nakano et al. 2021" where="2112.09332" title="WebGPT: Browser-assisted Question-answering with Human Feedback" />
            <RefItem who="Lewis et al. 2020" where="2005.11401" title="Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks" />
            <RefItem who="Yao et al. 2023" where="2210.03629" title="ReAct: Synergizing Reasoning and Acting in Language Models" />
            <RefItem who="Anthropic 2024" where="anthropic.com" title="Building Effective Agents" />
          </RefGroup>
        </In>
      </div>
    </Fit>
  </Shell>
);

const NoPlan: Page = () => (
  <Shell>
    <Eyebrow>附錄｜先看這頁：選一條備案</Eyebrow>
    <Heading>沒有 Codex 方案怎麼辦</Heading>
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
              <RouteCard y={10} kind="cloud" title="A｜opencode＋免費模型" sub="不用登入、不用信用卡" tag="首選" tone="ok" />
              <RouteWhy y={10}>實測可用｜第 {pageOf(OpencodeSteps)} 頁</RouteWhy>
            </g>
          </Layer></Step>
          <Step duration={STEP_MS}><Layer h={470} label="備案 B：Codex 加 OpenRouter，要帳號和 API Key">
            <g fill="none" stroke={faint} strokeWidth="3"><StepPath d="M300 235 H400" /></g>
            <g className="aw1-build" style={buildDelay(1)}>
              <RouteCard y={169} kind="key" title="B｜Codex＋OpenRouter" sub="要帳號和 API Key" tag="備用" tone="plain" />
              <RouteWhy y={169}>和 Codex 一樣｜第 {pageOf(OpenRouterRoute)} 頁</RouteWhy>
            </g>
          </Layer></Step>
          <Step duration={STEP_MS}><Layer h={470} label="備案 C：自己電腦跑模型，只能示範">
            <g fill="none" stroke={faint} strokeWidth="3" strokeDasharray="10 8"><StepPath d="M300 235 C350 235 350 394 400 394" /></g>
            <g className="aw1-build" style={buildDelay(1)}>
              <RouteCard y={328} kind="laptop" title="C｜自己電腦跑模型" sub="Ollama，資料不出電腦" tag="示範" tone="warn" />
              <RouteWhy y={328}>只能示範｜第 {pageOf(LocalLadder)} 頁</RouteWhy>
            </g>
          </Layer></Step>
        </Steps>
      </Stage>
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={32}>先走 A，不行再試 B；C 只拿來示範</Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

const CmdRow = ({ n, cmd, note }: { n: number; cmd: string; note: string }) => (
  <div style={{ display: 'grid', gridTemplateColumns: '52px 1fr', alignItems: 'center', gap: 18, padding: '10px 0', borderBottom: `1px solid ${rule}` }}>
    <NumDot n={n} />
    <div>
      <div style={{ fontFamily: mono, fontSize: 30, fontWeight: 600 }}>{cmd}</div>
      <div style={{ fontSize: 25, color: muted, marginTop: 4 }}>{note}</div>
    </div>
  </div>
);

const ModelRow = ({ name, tag, hot = false }: { name: string; tag: string; hot?: boolean }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 18px', background: hot ? 'rgba(141,212,160,0.16)' : 'transparent', outline: hot ? '3px solid #8DD4A0' : 'none', outlineOffset: -3 }}>
    <span style={{ fontFamily: mono, fontSize: 27, color: '#F5F5F4' }}>{name}</span>
    <span style={{ fontSize: 24, fontWeight: 600, color: hot ? '#8DD4A0' : '#BCC3CC' }}>{tag}</span>
  </div>
);

const MapChip = ({ codex, oc }: { codex: string; oc: string }) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 12, background: '#FFFFFF', border: `1px solid ${rule}`, padding: '10px 18px', fontSize: 27, whiteSpace: 'nowrap' }}>
    <span style={{ fontFamily: mono, color: muted }}>{codex}</span>
    <span style={{ color: faint }}>→</span>
    <span style={{ fontWeight: 600 }}>{oc}</span>
  </span>
);

const OpencodeSteps: Page = () => (
  <Shell source={'opencode 文件 opencode.ai/docs/zen、opencode.ai/docs/tui'}>
    <Eyebrow>附錄｜備案 A｜opencode-ai 1.19.3 實測</Eyebrow>
    <Heading>備案 A：opencode＋免費模型</Heading>
    <Fit>
      <div style={{ display: 'grid', gridTemplateColumns: '880px 1fr', gap: 56, alignItems: 'center' }}>
        <In i={0}>
          <CmdRow n={1} cmd="node -v" note="有版本號就好（第三章裝過）" />
          <CmdRow n={2} cmd="npm install -g opencode-ai" note="Mac、Windows 同一行" />
          <CmdRow n={3} cmd="cd 練習資料夾 → opencode" note="不用登入" />
          <CmdRow n={4} cmd="/models" note="挑一個免費模型" />
          <CmdRow n={5} cmd="貼上 prompts.md 的提示詞" note="和 Codex 練習一樣" />
        </In>
        <div>
          <Steps>
            <Step duration={STEP_MS}>
              <div style={{ background: term, border: '1px solid #555B60' }}>
                <div style={{ height: 50, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', background: '#30343A', fontFamily: mono, fontSize: 24, color: '#BCC3CC' }}><span>/models</span><span>示意</span></div>
                <div style={{ padding: '12px 0' }}>
                  <ModelRow name="DeepSeek V4.1 Flash Free" tag="推薦" hot />
                  <ModelRow name="GLM-5.3 Flash Free" tag="推薦" />
                  <ModelRow name="Big Pickle" tag="預設，較慢" />
                </div>
              </div>
            </Step>
          </Steps>
        </div>
      </div>
      <Steps>
        <Step duration={STEP_MS}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 36, flexWrap: 'wrap' }}>
            <SmallLabel>和 Codex 的對照</SmallLabel>
            <MapChip codex="/status" oc="畫面上直接看模型" />
            <MapChip codex="/new" oc="/new" />
            <MapChip codex="AGENTS.md" oc="一樣會讀" />
          </div>
        </Step>
      </Steps>
    </Fit>
  </Shell>
);

const OpencodeRun: Page = () => (
  <Shell source={'opencode 文件 opencode.ai/docs/zen'}>
    <Eyebrow>附錄｜備案 A｜講師電腦實測 2026-10-17</Eyebrow>
    <Heading>opencode 實測：29 秒建好檔案</Heading>
    <Fit>
      <div style={{ display: 'grid', gridTemplateColumns: '960px 1fr', gap: 48, alignItems: 'center' }}>
        <In i={0}>
          <Terminal title="終端機｜aw-01-lab 的複本" size={25}>
            <Typed>$</Typed>{' opencode run -m opencode/deepseek-v4.1-flash-free \\\n'}<AskLine>{'  "列出這個資料夾的檔案，然後建立 hello.md，內容是：你好"\n'}</AskLine>
            <Steps>
              <Step duration={STEP_MS}><div><Dim>{'$ ls -la …'}</Dim></div></Step>
              <Step duration={STEP_MS}><div>{'← Write hello.md\n'}<span style={{ color: '#8DD4A0' }}>Wrote file successfully.</span></div></Step>
              <Step duration={STEP_MS}><div>{'檔案：README.md、prompts.md、原文/（目錄）、回目.md。\n已建立 hello.md，內容為「你好」。'}</div></Step>
            </Steps>
          </Terminal>
        </In>
        <div style={{ display: 'grid', gap: 24 }}>
          <Steps>
            <Step duration={STEP_MS}>
              <div style={{ background: sage, borderTop: `5px solid ${okGreen}`, padding: '20px 24px' }}>
                <SmallLabel color={okGreen}>大綱提示詞｜15 秒</SmallLabel>
                <div style={{ fontSize: 27, lineHeight: 1.55, marginTop: 10 }}><L>[[劉備]]</L>、<L>[[關羽]]</L>、<L>[[張飛]]</L>於桃園結義，聚鄉勇投軍討伐<L>[[張角]]</L>的黃巾賊……</div>
                <div style={{ marginTop: 10 }}><StatusLine ok size={27}>內容和原文對得上</StatusLine></div>
              </div>
            </Step>
            <Step duration={STEP_MS}>
              <div style={{ background: amberSoft, borderLeft: `6px solid ${amber}`, padding: '16px 22px', fontSize: 27, lineHeight: 1.5 }}>
                <strong style={{ color: amber }}>免費額度沒有公開</strong><br />全班同時用，可能被擋
              </div>
            </Step>
          </Steps>
        </div>
      </div>
    </Fit>
  </Shell>
);

// One rung of the model-size ladder: a bar, a verdict mark, the model and what happened.
const Rung = ({ x, h, size, name, l1, l2, verdict }: { x: number; h: number; size: string; name: string; l1: string; l2: string; verdict: 'no' | 'meh' | 'demo' | 'ok' }) => {
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
  <Shell source={'Ollama 文件 docs.ollama.com/context-length'}>
    <Eyebrow>附錄｜備案 C｜1B、2B 夠不夠？講師電腦實測</Eyebrow>
    <Heading>備案 C：1B、2B 的模型不夠用</Heading>
    <Fit>
      <Stage h={450}>
        <Steps>
          <Layer h={450} label="1B 和 1.7B：不會動手，或亂編內容">
            <line x1="20" y1="300" x2="1612" y2="300" stroke={ink} strokeWidth="2" />
            <InG i={0}><Rung x={163} h={60} size="1B" name="llama3.2:1b" l1="只印出指令" l2="沒有動手" verdict="no" /></InG>
            <InG i={1}><Rung x={489} h={90} size="1.7B" name="qwen3:1.7b" l1="編出 [[李四]]" l2="「劉備字孔明」" verdict="no" /></InG>
          </Layer>
          <Step duration={STEP_MS}><Layer h={450} label="4B：很慢，大綱寫成紅樓夢">
            <g className="aw1-build" style={buildDelay(0, 0)}><Rung x={816} h={130} size="4B" name="qwen3:4b" l1="一題約 270 秒" l2="寫出紅樓夢人物" verdict="meh" /></g>
          </Layer></Step>
          <Step duration={STEP_MS}><Layer h={450} label="gemma4:e2b：能讀檔、建檔，大綱不可靠，只能示範">
            <g className="aw1-build" style={buildDelay(0, 0)}><Rung x={1143} h={170} size="e2b" name="gemma4:e2b" l1="能讀檔、建檔" l2="大綱不可靠" verdict="demo" /></g>
          </Layer></Step>
          <Step duration={STEP_MS}><Layer h={450} label="雲端免費模型：大綱正確">
            <g className="aw1-build" style={buildDelay(0, 0)}><Rung x={1469} h={220} size="雲端" name="免費雲端模型" l1="大綱正確" l2="約 15 秒" verdict="ok" /></g>
          </Layer></Step>
        </Steps>
      </Stage>
      <div style={{ fontSize: 24, color: quiet, textAlign: 'center' }}>講師在這台電腦（Ollama 0.40.3）、這些任務測過的模型</div>
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={20}>最少要 gemma4:e2b，而且只能拿來示範</Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

const CtxTick = ({ label, hot = false, bad = false }: { label: string; hot?: boolean; bad?: boolean }) => (
  <span style={{ display: 'grid', justifyItems: 'center', gap: 10, fontFamily: mono, fontSize: 27, color: hot ? okGreen : bad ? warn : quiet, fontWeight: hot || bad ? 700 : 400 }}>
    <span style={{ width: 4, height: 18, background: hot ? okGreen : bad ? warn : faint }} />{label}
  </span>
);

const OllamaRoute: Page = () => (
  <Shell source={'Ollama 文件 docs.ollama.com/integrations/opencode'}>
    <Eyebrow>附錄｜備案 C｜Ollama 0.40.3 實測</Eyebrow>
    <Heading>備案 C：用 Ollama 示範本機模型</Heading>
    <Fit>
      <div style={{ display: 'grid', gridTemplateColumns: '620px 1fr', gap: 48, alignItems: 'center' }}>
        <In i={0} style={{ background: '#FFFFFF', border: `1px solid ${rule}`, padding: '30px 34px 34px' }}>
          <SmallLabel>Ollama 設定｜Context length</SmallLabel>
          <div style={{ position: 'relative', height: 40, marginTop: 40 }}>
            <div style={{ position: 'absolute', left: 10, right: 10, top: 16, height: 10, background: raised }} />
            <div style={{ position: 'absolute', left: 10, width: '58%', top: 16, height: 10, background: okGreen }} />
            <div style={{ position: 'absolute', left: 'calc(58% - 12px)', top: 0, width: 42, height: 42, borderRadius: 21, background: '#FFFFFF', border: `5px solid ${okGreen}`, boxSizing: 'border-box' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10 }}>
            <CtxTick label="4k" bad /><CtxTick label="8k" /><CtxTick label="16k" /><CtxTick label="32k" hot /><CtxTick label="64k" /><CtxTick label="128k" />
          </div>
          <div style={{ display: 'grid', gap: 16, marginTop: 34 }}>
            <StatusLine ok={false} size={28}>預設 4k：提示詞被默默截斷</StatusLine>
            <StatusLine ok size={28}>調到 32k 以上</StatusLine>
          </div>
        </In>
        <div>
          <Steps>
            <Step duration={STEP_MS}>
              <Terminal title="終端機" size={27}>
                <Dim>{'# 先到 ollama.com 下載安裝\n'}</Dim>
                <Typed>$</Typed>{' ollama pull gemma4:e2b  '}<Dim>{'# 約 4.6 GB\n'}</Dim>
                <Typed>$</Typed>{' ollama run gemma4:e2b   '}<Dim>{'# 聊天，/bye 離開\n'}</Dim>
                <Typed>$</Typed>{' ollama launch opencode \\\n    --model gemma4:e2b\n'}
                <Typed>$</Typed>{' ollama ps  '}<Dim>{'# CONTEXT 要是 32768'}</Dim>
              </Terminal>
            </Step>
          </Steps>
        </div>
      </div>
      <Steps><Step duration={STEP_MS}><Takeaway marginTop={40}>16 GB 的電腦才示範，8 GB 不要跑</Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

const ErrorCard = ({ msg, fix }: { msg: string; fix: string }) => (
  <div style={{ background: '#FFFFFF', border: `1px solid ${rule}`, borderLeft: `6px solid ${warn}` }}>
    <div style={{ background: term, color: '#F1A89B', fontFamily: mono, fontSize: 24, lineHeight: 1.5, padding: '16px 20px', whiteSpace: 'pre-wrap' }}>{msg}</div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px', fontSize: 29, fontWeight: 600 }}><Icon kind="tool" size={36} color={okGreen} />{fix}</div>
  </div>
);

const OpenRouterRoute: Page = () => (
  <Shell source={'OpenRouter 文件 openrouter.ai/docs/cookbook/coding-agents/codex-cli'}>
    <Eyebrow>附錄｜備案 B｜codex-cli 0.154.0 實測</Eyebrow>
    <Heading>備案 B：Codex＋OpenRouter</Heading>
    <Fit>
      <div style={{ display: 'grid', gridTemplateColumns: '900px 1fr', gap: 44, alignItems: 'center' }}>
        <In i={0}>
          <Terminal title="~/.codex/config.toml" size={26}>
            <AskLine>{'model_provider = "openrouter"\nmodel = "poolside/laguna-xs-2.1:free"\n\n'}</AskLine>
            {'[model_providers.openrouter]\nname = "OpenRouter"\nbase_url = "https://openrouter.ai/api/v1"\nenv_key = "OPENROUTER_API_KEY"\n'}<HotLine>{'wire_api = "responses"'}</HotLine>
          </Terminal>
        </In>
        <div style={{ display: 'grid', gap: 26 }}>
          <Steps>
            <Step duration={STEP_MS}><ErrorCard msg={'ERROR: Missing environment variable: OPENROUTER_API_KEY.'} fix="先設定 API Key" /></Step>
            <Step duration={STEP_MS}><ErrorCard msg={'wire_api = "chat" is no longer supported.'} fix="改成 responses" /></Step>
            <Step duration={STEP_MS}><div style={{ background: amberSoft, padding: '16px 22px', fontSize: 29, fontWeight: 600, color: amber }}>免費：每分鐘 20 次、每天 50 次</div></Step>
          </Steps>
        </div>
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

const deck: Page[] = [
  Cover, SpeakerIntro, CourseMap, Agenda,
  Section1, Evolution, NextWordGame, ProbTable, OneByOne, SameQuestion, Randomness,
  WhatIsHallucination, RealHallucination, WhyHallucinate, CotWhat, CotWhy, ToolCalc, ToolCompare, CotPage, WebSearch, RagR, RagA, RagG, OpenBookPage, RagMiniPractice,
  Section2, AgentPage, ChatVsCodex, SameTaskTwoWays, Practice1NoSearch, Practice1Search, Practice1Check,
  Section3, InstallNode, CheckVersion, InstallCodex, FirstRun,
  Section4, StartScreen, SessionDesk, StatusPage, UsageToken, MemoryLayers, AgentsFile,
  Section5, DownloadLab, OpenLab, RulePractice, OutlinePrompt, OutlineResult, CheckSource,
  Recap, NextLesson, ReferencesModel, ReferencesMethods,
  NoPlan, OpencodeSteps, OpencodeRun, OpenRouterRoute, LocalLadder, OllamaRoute,
];

function pageOf(page: Page) {
  return deck.indexOf(page) + 1;
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
今天五章：第一章以 GPT 為例，說明 AI 怎麼生成文字、為什麼會錯，以及 CoT、工具和 RAG 怎麼補救；第二章比較 ChatGPT 和 Codex，接著做練習 1；第三章是安裝，大部分人課前已經裝好，這裡快速對一次；第四章看懂 Codex 的畫面、Session、/status 和 Memory；第五章是練習 2，用 Codex 寫大綱。
練習 1 只要瀏覽器就能做；還沒裝好 Codex 的同學，練習 1 的時間請助教協助安裝。`],
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
按一下：去哪裡找？可以是網路、你上傳的檔案，或你電腦裡的資料夾。今天練習 2 用的就是資料夾。
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
最後一下：有來源不等於一定正確。來源可能被誤讀，引的句子也可能被改過一兩個字。練習 1 會讓大家親手試一次：同一題，先不給資料問，再附上原文問，比比看答案差在哪。`],
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
  [SameTaskTwoWays, `45:00–50:00。
用今天的作業來比。如果用 ChatGPT 寫 21 回的大綱：你要打開 21 個檔、一段一段複製貼上，它回一段話，你再自己存成檔，你動手 3 次，而且 21 回的全文很長，要貼很多次。
按一下：用 Codex：你交代一句，它自己去讀 原文/ 資料夾，寫完直接存好檔案，你只動手 1 次。
最後一下：這份作業的 21 回原文本來就是檔案，放在資料夾裡；Codex 能直接讀，寫好也直接存成檔案，所以在資料夾裡做。不過練習 1 先用 ChatGPT：同一題先不給資料問，再追問原文出處，最後附上原文問一次。`],
  [Practice1NoSearch, `50:00–56:00（練習 6 分鐘）。
練習 1 用 ChatGPT 網頁版，三步都問同一題：劉備聽完曹操說「天下英雄只有你我」，做了什麼？為什麼？這一步先不給任何資料，看它憑記憶怎麼答。
提示詞都在 prompts.md。在筆電打開這份簡報的同學，點右上角的連結，就會開 GitHub 上的檔案，直接複製，不用照投影片打字：${PROMPTS_URL}
開一段新對話，貼上 prompts.md 的「練習 1-1」。不用調整搜尋開關，它有沒有自動搜尋都沒關係。
按一下：做了什麼。它多半會說筷子掉到地上。
按一下：為什麼。它多半也說得出原因，例如借雷聲掩飾、怕曹操看穿他的野心。請把這兩句記下來，第 ${pageOf(Practice1Check)} 頁要拿來比。
最後一下：這段回答沒有附原文。答得再順，我們也分不出它是記得還是編的，幻覺難抓就難在這裡。下一頁請它拿出原文。
講師用 Codex（gpt-5.6-luna）代替 ChatGPT 試過（2026-10-24，不是 ChatGPT 網頁版）：它答「把手中的匙箸掉在地上，正好雷聲大作，便假裝是被雷聲嚇到」，原因是「掩飾自己的震驚與野心」。ChatGPT 網頁版未實測。
還沒裝好 Codex 的同學，這段時間請舉手，助教過去協助安裝（安裝步驟在第三章那幾頁）。`],
  [Practice1Search, `56:00–62:00（練習 6 分鐘）。
在同一段對話接著貼 prompts.md 的「練習 1-2」：你說的原因，原文哪一句寫的？引用原句，附維基文庫連結。
先讓大家貼上、等它回答。
按一下：左邊是常見的回答：引用一句原文，例如「又恐操生疑，故借懼雷以掩飾之耳」，再附一個連結。你的不一定一樣，看你自己的。
按一下：自己查。點開連結；沒有連結，就開 prompts.md 裡附的維基文庫第 21 回。按 Mac 的 Cmd+F 或 Windows 的 Ctrl+F，搜「掩飾」兩個字，網頁上有三筆。對照它引用的句子，看找不找得到。
講師用 Codex 代替試過（2026-10-24）：它引用「吾之學圃，正欲使操知我無大志；不意操竟指我為英雄，我故失驚落箸。又恐操生疑，故借懼雷以掩飾之耳。」並附上維基文庫連結，這句在原文找得到。ChatGPT 網頁版未實測，你的結果可能不同。
最後一下：找得到同一句，它說的原因才有出處。找不到，或只對得上幾個字，就貼「這句我在原文找不到，請重新引用原句」，再查一次。如果它第一輪根本沒說原因，先問「劉備為什麼掉筷子？」`],
  [Practice1Check, `62:00–67:00（練習 5 分鐘）。
前兩頁是「閉書」：ChatGPT 憑記憶回答，或自己上網找。這頁換成「開書」，也就是剛才講的 RAG：資料由我們找好，和問題放在同一則訊息裡送出。
這一步請按「新對話」，開一段新的對話。原本那段已經講過原因，它會記得，就比不出差別。從 prompts.md 的「練習 1-3」複製整段，原文和問題一起送出。原文是維基文庫第 21 回的節錄，只到筷子掉下去為止。
按一下：和 1-1 比。1-1 沒給資料，它說得出原因：掩飾野心、怕曹操起疑。這次只給這段，「做了什麼」一樣是筷子掉到地上；「為什麼」這段只寫到「吃了一驚」，所以它只該說「吃了一驚」，或說「原文沒寫」。
講師用 Codex 代替試過（2026-10-24，新的對話）：它答「劉備手中的匙箸不覺掉到地上。因為他聽到曹操說……後，吃了一驚」，沒有再提野心。ChatGPT 網頁版未實測。
最後一下：如果它又說出野心、掩飾這類原因，那是它自己補的，追問「原文哪一句寫了這個原因？」，看它會不會改口。給大家兩分鐘試，再請一兩位分享。
補充：劉備為什麼掉筷子，第 21 回後面其實有寫，是他回去才跟關羽、張飛說的，就是 1-2 搜到的那句。它補的不一定錯，但不在你給它的這段原文裡。等一下 Codex 的 AGENTS.md 規則「只根據原文，找不到就說找不到」，就是在防這件事。`],
  [Section3, `67:00–67:30。
第三章：安裝 Codex。前兩章都在瀏覽器裡；Codex 要裝在電腦上，才能讀你資料夾裡的檔案。課前已經裝好的同學，這幾頁當複習，順便幫旁邊的人看一下。`],
  [InstallNode, `67:30–68:30。
第一步：Codex 是用 Node.js 寫的，要先裝 Node.js。到 https://nodejs.org/en/download/ 下載。
按一下：選 LTS，長期支援版，比較穩。（畫面是示意，官網排版會改。）
按一下：安裝程式一路按 Next（Mac 是「繼續」），全部用預設選項，最後 Finish。`],
  [CheckVersion, `68:30–69:30。
第二步：裝完一定要關掉、再重開終端機。Mac 用「終端機」，Windows 用 PowerShell 或命令提示字元。
按一下：輸入 node -v，成功的樣子：印出 v 開頭的版本號，例如 v24.21.0，數字不用一樣。
按一下：輸入 npm -v，成功的樣子：印出一串數字，例如 11.6.2。版本號每台電腦不同，有數字就對了。
按一下：出現「找不到指令」，先重開終端機；還是不行，再跑一次 Node.js 安裝程式。`],
  [InstallCodex, `69:30–71:00。
第三步：輸入 npm install -g @openai/codex@latest。成功的樣子：跑完回到提示字元，沒有紅色的 ERROR；黃色的 WARN 可以不管。Mac 如果出現權限錯誤，請助教協助。
按一下：輸入 codex --version。
按一下：看到 codex-cli 0.154.0 這種版本號，就裝好了。這是講師電腦 2026-10-17 的實際輸出，你的版本號可能比較新。
最後一下：成功的樣子：印出 codex-cli 0.x 這種版本號。`],
  [FirstRun, `71:00–73:00。
第四步：輸入 codex。第一次打開會看到三個英文畫面（畫面為示意，文字是 Codex 0.154 的原文）。
第一個是登入，選 Sign in with ChatGPT，會開瀏覽器讓你登入。Plus、Pro、Business、Enterprise 方案含 Codex 用量；其他方案請看最後的附錄備案。
按一下：第二個問你信不信任這個資料夾，確認是你要的資料夾，選 Yes, continue。
按一下：第三個是它要改資料夾外面的檔案時問你。先看它要改哪個檔，再選 Yes, proceed。權限是 Workspace 時，改這個資料夾裡的檔案不會問，直接就寫好了；今天的練習都在資料夾裡，多半看不到這個畫面。
2026-10-24 實測（Codex 0.154.0 互動介面，Mac）：在全新的資料夾打 codex，帳號已登入，所以沒看到登入畫面。先跳出「✨ Update available!」，選項是 1. Update now、2. Skip、3. Skip until next version，這是有新版才會出現，上課選 2. Skip 就好；接著是信任畫面，原文「Do you trust the contents of this directory?」，選項 1. Yes, continue、2. No, quit。寫 AGENTS.md 和三國演義大綱.md 都沒有跳確認畫面，直接寫好；請它在上一層資料夾建檔，才跳出「Would you like to make the following edits?」，選項是 1. Yes, proceed (y)、2. Yes, and don't ask again for these files (a)、3. No, and tell Codex what to do differently (esc)。
最後一下：登入成功的樣子：瀏覽器顯示已經登入，可以關掉；回到終端機，看到 Codex 的輸入列（› 後面可以打字）。`],
  [Section4, `73:00–73:30。
第四章：看懂 Codex。四個東西：啟動畫面、Session、/status、Memory。`],
  [StartScreen, `73:30–75:30。
這是 Codex 0.154 的啟動畫面（教材範例，帳號已隱藏）。
按一下：model，現在用哪個模型。名稱會隨版本和帳號變，不用背。
按一下：directory，它在哪個資料夾工作，讀檔、存檔都在這裡。這張圖是講師的另一個練習資料夾，你的會不一樣。
按一下：下面有「›」的那一列，是打字的地方，中文直接打，按 Enter 送出。`],
  [SessionDesk, `75:30–78:00。
Session 是一次工作階段，像一張工作桌。你交代的任務（例如寫第 1 回大綱）、它讀過的檔案（原文/第001回.txt）、它的回答、你的追問，都堆在同一張桌上，所以你可以說「剛剛那段改短」，它知道你指哪段。
按一下：輸入 /new 會換一張新桌子，新的桌子是空的，前面講過的它都看不到。這時候說「剛剛那段改短」，它不知道是哪段。
最後一下：同一件事，留在同一個 Session 做完；換一件事，就開新的。`],
  [StatusPage, `78:00–81:00。
這頁我示範，大家先看就好；練習 2-1 進到練習資料夾以後，再自己打一次。在 Codex 輸入 /status，畫面上的欄位很多，今天只看一行。
按一下：Directory，它在哪個資料夾工作。結尾要是你的練習資料夾，例如 aw-01-lab。它讀檔、存檔都在這裡，資料夾錯了，後面全部白做。
按一下：其他欄位先知道就好：Model 是用哪個模型；Permissions 是能不能改你的檔案，Workspace 代表它能直接改這個資料夾裡的檔案，要動到資料夾外面才會先問你（依 Codex 文件）；Session 是這張工作桌的編號。最下面兩行是額度，下一頁講。
2026-10-24 實測（Codex 0.154.0 互動介面，Mac）：/status 由上到下是 Model、Model provider、Directory、Permissions、Agents.md、Account、Collaboration mode、Session，最下面是 5h limit 和 Weekly limit 兩行。預設設定下 Permissions 顯示「Workspace (Ask for approval)」；還沒有 AGENTS.md 時，Agents.md 那行是 <none>。講師自己的電腦改過設定，會顯示「Workspace (Approve for me)」，不要照講師的抄。Account 那行會露出 email，投影時注意。
最後一下：動手前，先看 Directory 對不對。練習 2 第一件事就是做這個。`],
  [UsageToken, `81:00–84:00。
兩個容易混的詞，像手機方案：月租額度，和你用掉的流量。
Usage 是帳號這段時間還能用多少，就是 /status 最下面那兩行：5 小時額度、每週額度。用完要等它重置。
按一下：Token 是 AI 讀寫文字的單位，前面接龍那頁講過。你的提示詞、它讀到的檔案、前面的對話，加起來就是這次用掉的 Token。
最後一下：讀的檔越多，Token 越多，額度用得越快。所以交代時把範圍講清楚，例如「只讀 原文/」，就不會浪費。`],
  [MemoryLayers, `84:00–87:00。
Memory 是 Codex 能延續的上下文，分兩層。像口頭交代，和貼在牆上的公告。
第一層，Session 內的記憶：在 Session 1 說「只根據 原文/ 回答」，它會照做；但打 /new 開新 Session，這條規則就不見了。
按一下：第二層，專案裡的記憶：把規則寫進資料夾裡的 AGENTS.md，Codex 每次開 Session 都會先讀，所以新的 Session 也照做。/status 裡 Agents.md 那一行，說的就是這個檔。
最後一下：講清楚範圍。聊天裡說的，只留在這個 Session；AGENTS.md 寫在這個資料夾裡，在這個資料夾開 Codex 每次都會讀，換到別的資料夾就不會讀。Codex 不會永久記住你們聊過什麼，重要的規則請寫進檔案。`],
  [AgentsFile, `87:00–90:00。
AGENTS.md 長什麼樣子？它就放在練習資料夾最上層，內容是幾條規則。畫面上的內容是示意，等一下練習 2-2 你會請 Codex 自己寫出來。
按一下：之後每開一個 Session，Codex 都會先讀這個檔，照著做。
最後一下：它就是普通的文字檔，用記事本打開就能改。`],
  [Section5, `90:00–90:30。
第五章：用 Codex 寫大綱。今天的作品就在這一章完成。`],
  [DownloadLab, `90:30–93:00。
在筆電打開這份簡報，按下載按鈕，會下載 aw-01-lab.zip：${LAB_ZIP_URL} 。手機掃 QR code 會下載到手機，請用筆電按按鈕。解壓縮後打開，要看到 原文/、回目.md、prompts.md；Windows 的「全部解壓縮」常多包一層，看到另一個 aw-01-lab 就再點進去，下一頁會用 ls 檢查。資料夾也可以在 GitHub 上瀏覽：${LAB_URL}
裡面有：原文/ 資料夾，第 1 到 21 回的全文，一回一個檔，取自維基文庫，是公有領域；回目.md，21 回的回目清單；prompts.md，等一下要貼的提示詞，請直接從這裡複製；README.md，資料夾說明。`],
  [OpenLab, `93:00–96:00（練習 3 分鐘）。
練習 2-1。打開終端機，打 cd 和一個空格，把 aw-01-lab 資料夾拖進視窗，按 Enter。
按一下：打 ls，按 Enter。Mac 和 Windows 的 PowerShell 都能用；Windows 的命令提示字元請打 dir。要看到 原文、prompts.md、回目.md 這三個。
按一下：右邊兩種結果。ls 看得到原文，就可以打 codex。ls 只看到另一個 aw-01-lab，代表 Windows 的「全部解壓縮」多包了一層：打 cd aw-01-lab 進去，再 ls 一次。只看 Directory 分不出這個錯，因為外面那層也叫 aw-01-lab。
按一下：確認好了，再打 codex。第一次在這個資料夾打開，會問你信不信任，選 Yes, continue。進去後輸入 /status，看 Directory 那一行（畫面為示意，路徑依電腦而定）。
按一下：Directory 結尾是 aw-01-lab，就可以開始了。開了 Codex 才發現不對，打 /quit 離開，再重新 cd。`],
  [RulePractice, `96:00–101:00（練習 5 分鐘）。
練習 2-2，從 prompts.md 複製這段貼上：
「請在 AGENTS.md 寫一條規則：回答三國問題時，只根據 原文/ 資料夾裡的文字；找不到就說「原文/ 裡找不到」；每次回答的最後一行寫「出處：原文/第00N回.txt」。」
如果跳出確認畫面，看過內容選 Yes, proceed；沒有跳出、直接寫好也算成功，到資料夾看有沒有 AGENTS.md。
規則最後那句「最後一行寫出處」是故意加的：它憑記憶答題不會寫這行，所以看得出新的 Session 有沒有讀到規則。
按一下：輸入 /new，換一張新桌子，再問「劉備第一次出場在第幾回？」。最後一行是「出處：原文/第001回.txt」這種格式，就代表新的 Session 讀了規則。
按一下：對照題，問「諸葛亮第一次出場在第幾回？」。前 21 回他還沒出場，只有第 9 回一首詩提到「諸葛隆中臥」。照規則，它要說原文/ 裡找不到，不能憑記憶報回數。
2026-10-24 實測（Codex 0.154.0 互動介面，Mac，gpt-5.6-luna）：貼上規則後沒有跳確認畫面，畫面直接出現「Added AGENTS.md (+5 -0)」。輸入 /new 後問劉備，答「劉備第一次出場在第一回，文中以「姓劉，名備，字玄德」介紹。」，最後一行「出處：原文/第001回.txt」；再問諸葛亮，答「原文／裡找不到諸葛亮正式出場；只在第九回詩句中提到「諸葛隆中臥」。」，最後一行「出處：原文/第009回.txt」。找不到也照樣附出處，是規則寫了「每次回答」的關係。
另外用 codex exec 試過（同一天）：同一個資料夾拿掉 AGENTS.md 再問諸葛亮，它直接答「第三十七回」。
如果沒生效，打 /quit 關掉，再打 codex 重開一次。`],
  [OutlinePrompt, `101:00–106:00（練習 5 分鐘，Codex 跑約 1 分半）。
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
  [OutlineResult, `106:00–108:00。
這是講師電腦上用 Codex 0.154 實跑的結果，21 段。速度不代表品質，寫得好不好要看下一頁的核對。
按一下：人名都變成 [[連結]]，第二堂放進 Obsidian 就能連到人物卡。
按一下：每段最後都附了出處，21 段、21 個出處。
按一下：有個小毛病：它把回目標題裡的人名也改了，「張翼德怒鞭督郵」變成「[[張飛]]怒鞭督郵」，「何國舅」變成「[[何進]]」，回目就不是原文了。講師實測時用的是舊版提示詞；補上「標題裡的人名不用加連結」之後重跑（2026-10-17），21 段的標題都沒有連結了。你如果還是遇到，就跟它說：「標題照回目原文，不要加連結」。`],
  [CheckSource, `108:00–112:00（練習 4 分鐘）。
練習 2-4：核對也交給對話來做。先請 Codex 指出根據，貼上 prompts.md 的「練習 2-4」：三國演義大綱.md 第 N 回那段的第二句，根據原文哪一句？引用原句。N 換成你想查的回數。這裡用講師範例的第 21 回當例子，第二句是「劉備奉命出兵截擊袁術後脫離曹操，關羽又設計斬殺徐州刺史車冑，重新占據徐州」。
按一下：它引用了原句，例如「我有一計，可殺車冑：乘夜扮作曹軍到徐州，引車冑出迎，襲而殺之。」並寫出處。這是講師實測（2026-10-24，codex exec 對範例大綱），它還多引了一句「術若投紹，必從徐州過……」。
按一下：自己查。打開 原文/第021回.txt：Mac 按右鍵，選「打開方式」再選「文字編輯」；Windows 按右鍵，選「開啟檔案」再選「記事本」。按 Cmd+F 或 Ctrl+F，貼上引用句裡的四、五個字，例如「可殺車冑」。找得到，這句就有根據；找不到，回 Codex 說「原文/第021回.txt 裡找不到這句，請重新確認」。
按一下：再看標題。把大綱那段的標題，和 回目.md 第 21 回比一比。講師舊版的大綱就是在這裡出錯：「張翼德」被改成 [[張飛]]。
最後一下：引用的句子搜得到、標題和回目一字不差，這段才算核對過。抽查兩段對了，只代表這兩段；整份還是要分段核對，例如每次五回。在自己的資料上查證，就是 RAG 的最後一關。
時間不夠就先做一段，有時間再做第二段。`],
  [Recap, `112:00–116:00。
回顧五章。一、GPT 在猜下一個字，會猜錯也會說得很肯定。二、同一題先不給資料問，再追問原文哪一句，最後附上原文問；AI 說的原因，要找得到原句才算數。三、裝好 Node.js 和 Codex。四、Codex 裡先看 /status 的 Directory，重要的規則寫進 AGENTS.md。五、用 Codex 照原文寫出大綱，每段附出處。
最後一下：AI 寫的東西，回原文核對過才算數。`],
  [NextLesson, `116:00–120:00。
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
- Codex 原始碼與安裝：https://github.com/openai/codex
- Node.js 下載：https://nodejs.org/en/download
- 《三國演義》原文：https://zh.wikisource.org/wiki/三國演義`],
  [NoPlan, `附錄（備用，不計入 120 分鐘）。這頁是附錄的入口，每張卡右邊寫了該看第幾頁。
沒有含 Codex 的 ChatGPT 方案，還是有三條路可以練習，照順序試。
按一下：備案 A，opencode 加免費雲端模型。opencode 是另一套和 Codex 很像的工具，不用登入、不用信用卡，講師實測用它跑大綱提示詞，內容正確。這是首選。
按一下：備案 B，Codex 加 OpenRouter。操作和今天教的 Codex 一樣，但要註冊 OpenRouter 帳號、建立 API Key，免費帳號每天只有 50 次請求。
按一下：備案 C，用 Ollama 在自己電腦跑模型。好處是資料不出電腦，但學生電腦跑得動的小模型會亂寫，所以只拿來示範，不當真正的備案。
最後一下：先走 A，不行再試 B；C 只拿來示範。
講師電腦實測：opencode-ai 1.19.3、codex-cli 0.154.0、Ollama 0.40.3。`],
  [OpencodeSteps, `附錄（備用）。備案 A：opencode 加免費模型。
五步，都在終端機打：
1. node -v，有版本號就好，第三章已經裝過 Node.js。
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
]);

export const notes: (string | undefined)[] = deck.map(page => NOTES.get(page));

export default deck satisfies Page[];
