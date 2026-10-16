import type { DesignSystem, Page, SlideMeta, SlideTransition } from '@open-slide/core';
import { Step, Steps, useIsActivePage, useSlidePageNumber } from '@open-slide/core';
import { useState, type CSSProperties, type ReactNode } from 'react';
import downloadPage from './assets/obsidian-download-page.png';
import firstLaunch from './assets/obsidian-first-launch.png';
import dgSettings from './assets/dg-settings-github.png';
import dgPalette from './assets/dg-command-palette.png';
import githubClone from './assets/github-clone-https.png';
import vaultQr from './assets/three-kingdoms-vault-qr.png';

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
const FONT_LINK_ID = 'osd-webfont-obsidian-agent-knowledge-garden';
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
// Same vocabulary as deck 01. Clicks go through the framework's <Steps>/<Step>; the CSS
// only adds a short rise to whatever a <Step> reveals, lines that draw themselves when
// their step is revealed, and pieces that settle in order. Un-clicked motion (a page's
// pieces settling in, connecting lines drawing on, the chapter bar filling) runs only on
// the page the audience is watching (useIsActivePage). Thumbnails, overview and exports
// render every step revealed and skip the entrance, so nothing is caught half-drawn.
const EASE_OUT = 'cubic-bezier(0.23, 1, 0.32, 1)';
const STEP_MS = 280; // a <Step> fading in + an 8px rise
const BUILD_MS = 320; // pieces inside a revealed step settling in order
const BUILD_GAP = 90; // stagger between those pieces
const FILL_MS = 480; // chapter bar filling left to right
const ENTER_MS = 420; // a piece of a page settling in when the page arrives
const ENTER_GAP = 80; // stagger between those pieces
const DRAW_MS = 520; // a connecting line drawing from one end to the other

const MOTION_CSS = `
.okg-deck [data-osd-step] > * { transition: transform ${STEP_MS}ms ${EASE_OUT}; }
.okg-deck [data-osd-step="pending"] > * { transform: translateY(8px); }
.okg-deck .okg-build { transition-property: opacity, transform; transition-duration: ${BUILD_MS}ms; transition-timing-function: ${EASE_OUT}; }
.okg-deck [data-osd-step="pending"] .okg-build { opacity: 0; transform: translateY(10px); }
.okg-deck .okg-stepdraw { stroke-dasharray: 1; stroke-dashoffset: 0; transition: stroke-dashoffset ${DRAW_MS}ms ${EASE_OUT}; }
.okg-deck [data-osd-step="pending"] .okg-stepdraw { stroke-dashoffset: 1; }
@keyframes okg-fill { from { transform: scaleX(0); } to { transform: scaleX(1); } }
.okg-deck .okg-fill { transform-origin: left center; animation: okg-fill ${FILL_MS}ms ${EASE_OUT} 160ms both; }
@keyframes okg-in { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: none; } }
.okg-deck .okg-in { animation: okg-in ${ENTER_MS}ms ${EASE_OUT} both; }
@keyframes okg-draw { from { stroke-dashoffset: 1; } to { stroke-dashoffset: 0; } }
.okg-deck .okg-draw { stroke-dasharray: 1; animation: okg-draw ${DRAW_MS}ms ${EASE_OUT} both; }
@keyframes okg-pop { from { opacity: 0; transform: scale(0.6); } to { opacity: 1; transform: scale(1); } }
.okg-deck .okg-pop { transform-box: fill-box; transform-origin: center; animation: okg-pop 300ms ${EASE_OUT} both; }
@keyframes okg-in-fade { from { opacity: 0; } to { opacity: 1; } }
@media (prefers-reduced-motion: reduce) {
  .okg-deck .okg-in, .okg-deck .okg-pop { animation: okg-in-fade 150ms ease both; }
  .okg-deck .okg-draw { animation: none; stroke-dasharray: none; }
  .okg-deck .okg-stepdraw, .okg-deck [data-osd-step="pending"] .okg-stepdraw { transition: none; stroke-dasharray: none; stroke-dashoffset: 0; }
  .okg-deck [data-osd-step] > *, .okg-deck [data-osd-step="pending"] > * { transform: none; transition: none; }
  .okg-deck .okg-build { transition: opacity 150ms ease; transition-delay: 0s !important; }
  .okg-deck [data-osd-step="pending"] .okg-build { transform: none; }
  .okg-deck .okg-fill { animation: none; }
}
`;
const MOTION_STYLE_ID = 'osd-motion-obsidian-agent-knowledge-garden';
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
  return <div className={live ? 'okg-in' : undefined} style={live ? { ...style, animationDelay: enterDelay(i) } : style}>{children}</div>;
};

// The same, for a group inside an SVG picture.
const InG = ({ i, children }: { i: number; children: ReactNode }) => {
  const live = useIsActivePage();
  return <g className={live ? 'okg-in' : undefined} style={live ? { animationDelay: enterDelay(i) } : undefined}>{children}</g>;
};

// A mark (tick, cross, badge) that pops in after the thing it marks has landed.
const PopG = ({ i, children }: { i: number; children: ReactNode }) => {
  const live = useIsActivePage();
  return <g className={live ? 'okg-pop' : undefined} style={live ? { animationDelay: enterDelay(i) } : undefined}>{children}</g>;
};

// A solid connecting line that draws itself on when the page arrives.
const DrawPath = ({ i, d }: { i: number; d: string }) => {
  const live = useIsActivePage();
  return <path d={d} pathLength={1} className={live ? 'okg-draw' : undefined} style={live ? { animationDelay: enterDelay(i) } : undefined} />;
};

// A solid line inside a <Step>: it draws itself when that step is revealed.
const StepPath = ({ d, i = 0 }: { d: string; i?: number }) => (
  <path d={d} pathLength={1} className="okg-stepdraw" style={buildDelay(i, 60)} />
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
const link = '#7654C7'; // Obsidian's internal-link purple
const linkSoft = '#EEE7F2';
const warn = '#9B4A3C';
const mono = '"Source Code Pro", Consolas, Menlo, monospace';
const display = 'var(--osd-font-display)';
const publicVaultUrl = 'https://raw.githubusercontent.com/Chrouos/AI-workshop-slides/main/examples/obsidian-agent-knowledge-garden/%E4%B8%89%E5%9C%8B%E4%BA%BA%E7%89%A9%E7%9F%A5%E8%AD%98%E5%BA%AB.zip';

// ---------- Frame ----------

const Title = ({ children }: { children: ReactNode }) => (
  <h1 style={{ fontFamily: '"Libre Baskerville", Georgia, "Times New Roman", serif', fontSize: 132, fontWeight: 400, lineHeight: 1.17, letterSpacing: '-0.035em', maxWidth: 1500, margin: 0, color: ink, whiteSpace: 'pre-line' }}>{children}</h1>
);

const Footer = () => {
  const { current, total } = useSlidePageNumber();
  return (
    <div style={{ position: 'absolute', left: 144, right: 144, bottom: 56, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #E7E5E4', paddingTop: 22, fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', fontSize: 22, fontWeight: 400, color: quiet }}>
      <span>AI 協作課｜第二篇</span>
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

// The five chapters of the day. Pages inside a chapter show where we are.
const CHAPTERS = ['認識 Obsidian', '理解 RAG', 'Agent 協作', '做導覽首頁', '發布到網站'];
type Chapter = 1 | 2 | 3 | 4 | 5;

// One segment of the route bar. The current chapter is amber; on a chapter's opening
// page it fills in left to right, once, on the live page only.
const RouteSeg = ({ color, fill = false }: { color: string; fill?: boolean }) => (
  <span style={{ width: 34, height: 6, background: fill ? rule : color, display: 'block' }}>
    {fill ? <span className="okg-fill" style={{ display: 'block', width: '100%', height: '100%', background: color }} /> : null}
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
  <div className="okg-deck" style={{ width: '100%', height: '100%', boxSizing: 'border-box', position: 'relative', background: 'var(--osd-bg)', color: 'var(--osd-text)', fontFamily: 'var(--osd-font-body)', padding: `${top}px 144px 126px` }}>
    {chapter ? <RouteBar chapter={chapter} enter={enterChapter} /> : null}
    {children}
    <Footer />
  </div>
);

const Heading = ({ children }: { children: ReactNode }) => (
  <h2 style={{ fontFamily: display, fontSize: 66, fontWeight: 400, lineHeight: 1.2, letterSpacing: '-0.025em', margin: '40px 0 0', maxWidth: 1620 }}>{children}</h2>
);

// The one-line everyday picture under a heading.
const Lead = ({ children }: { children: ReactNode }) => (
  <p style={{ fontSize: 34, lineHeight: 1.5, color: muted, maxWidth: 1560, margin: '18px 0 0' }}>{children}</p>
);

const SmallLabel = ({ children, color = 'var(--osd-accent)' }: { children: ReactNode; color?: string }) => (
  <span style={{ color, fontSize: 25, fontWeight: 600, letterSpacing: '0.07em' }}>{children}</span>
);

const Path = ({ children, size = 26 }: { children: ReactNode; size?: number }) => (
  <span style={{ fontFamily: mono, fontSize: size, whiteSpace: 'nowrap' }}>{children}</span>
);

const NumDot = ({ n }: { n: number }) => (
  <span style={{ flex: '0 0 auto', width: 44, height: 44, borderRadius: 22, background: amber, color: '#FFFFFF', display: 'grid', placeItems: 'center', fontSize: 25, fontWeight: 600 }}>{n}</span>
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

// Real command / agent output. Lines starting with "$" are what the learner types.
const Terminal = ({ label, children, width }: { label: string; children: ReactNode; width?: number }) => (
  <div style={{ width, boxSizing: 'border-box', background: '#202326', color: '#D6D3D1', borderTop: `5px solid ${amber}`, padding: '24px 34px 28px' }}>
    <div style={{ color: '#BAB5B0', fontSize: 24, letterSpacing: '0.04em', marginBottom: 16 }}>{label}</div>
    <div style={{ fontFamily: mono, fontSize: 28, lineHeight: 1.6, whiteSpace: 'pre' }}>{children}</div>
  </div>
);

const Typed = ({ children }: { children: ReactNode }) => <span style={{ color: '#F3D9B1', fontWeight: 600 }}>{children}</span>;

const Caption = ({ children }: { children: ReactNode }) => (
  <div style={{ fontSize: 22, lineHeight: 1.4, color: quiet, marginTop: 12 }}>{children}</div>
);

const MarkBubble = ({ n, left, top, i }: { n: number; left: string | number; top: string | number; i: number }) => {
  const live = useIsActivePage();
  return (
    <span className={live ? 'okg-in' : undefined} style={{ position: 'absolute', left, top, marginLeft: -26, marginTop: -26, width: 52, height: 52, borderRadius: 26, background: amber, color: '#FFFFFF', display: 'grid', placeItems: 'center', fontSize: 26, fontWeight: 600, boxShadow: '0 0 0 5px #FFFFFF, 0 4px 12px rgba(0,0,0,0.25)', animationDelay: live ? enterDelay(i) : undefined }}>{n}</span>
  );
};

// A real screenshot at its own aspect ratio. Marks are given in % of the image.
const Screenshot = ({ src, aspect, width, caption, alt, url, children }: { src: string; aspect: number; width: number; caption?: string; alt: string; url?: string; children?: ReactNode }) => {
  const h = Math.round(width / aspect);
  return (
    <div style={{ width }}>
      {url ? (
        <div style={{ width, height: 56, boxSizing: 'border-box', background: '#ECEAE8', border: `1px solid ${rule}`, borderBottom: 'none', display: 'flex', alignItems: 'center', gap: 10, padding: '0 18px' }}>
          <span style={{ width: 12, height: 12, borderRadius: 6, background: '#D87771' }} />
          <span style={{ width: 12, height: 12, borderRadius: 6, background: '#E4BB62' }} />
          <span style={{ width: 12, height: 12, borderRadius: 6, background: '#81B984' }} />
          <span style={{ flex: 1, marginLeft: 14, background: '#FFFFFF', borderRadius: 18, padding: '5px 18px', fontFamily: mono, fontSize: 24, color: ink }}>{url}</span>
        </div>
      ) : null}
      <div style={{ width, height: h, boxSizing: 'border-box', border: `1px solid ${rule}`, background: '#FFFFFF', boxShadow: '0 10px 30px rgba(28,25,23,0.08)', position: 'relative' }}>
        <img src={src} alt={alt} style={{ width: '100%', height: '100%', display: 'block' }} />
        {children}
      </div>
      {caption ? <Caption>{caption}</Caption> : null}
    </div>
  );
};

// An outline drawn over one region of a screenshot (in % of the image).
const RegionMark = ({ x, y, w, h, i }: { x: number; y: number; w: number; h: number; i: number }) => {
  const live = useIsActivePage();
  return <div className={live ? 'okg-in' : undefined} style={{ position: 'absolute', left: `${x}%`, top: `${y}%`, width: `${w}%`, height: `${h}%`, border: '4px solid #E9B650', boxSizing: 'border-box', animationDelay: live ? enterDelay(i) : undefined }} />;
};

// ---------- Picture helpers ----------
// Pictures are drawn 1:1 on the 1920×1080 canvas, so SVG font sizes are real pixel sizes.

const Figure = ({ w = 1632, h, label, children, style }: { w?: number; h: number; label: string; children: ReactNode; style?: CSSProperties }) => (
  <svg viewBox={`0 0 ${w} ${h}`} style={{ display: 'block', width: w, height: h, overflow: 'visible', ...style }} role="img" aria-label={label}>{children}</svg>
);

// A box that stacks SVG layers on one another, so each <Step> can add one layer.
const Stage = ({ w = 1632, h, children }: { w?: number; h: number; children: ReactNode }) => (
  <div style={{ position: 'relative', width: w, height: h }}>{children}</div>
);

const Layer = ({ w = 1632, h, label, children }: { w?: number; h: number; label?: string; children: ReactNode }) => (
  <svg viewBox={`0 0 ${w} ${h}`} style={{ position: 'absolute', inset: 0, width: w, height: h, overflow: 'visible' }} role={label ? 'img' : undefined} aria-label={label} aria-hidden={label ? undefined : true}>{children}</svg>
);

// A sheet of paper with a folded corner: a note, a file, an output.
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

const AskMark = ({ x, y, r = 20 }: { x: number; y: number; r?: number }) => (
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

// People are circles; relation cards are boxes (deck 01 uses the same grammar).
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

const MapArrow = ({ x1, x2, y, hot = false }: { x1: number; x2: number; y: number; hot?: boolean }) => (
  <g fill={hot ? amber : faint} stroke={hot ? amber : faint}><line x1={x1} y1={y} x2={x2 - 12} y2={y} strokeWidth={hot ? 4 : 3} /><polygon points={`${x2},${y} ${x2 - 16},${y - 9} ${x2 - 16},${y + 9}`} strokeWidth="0" /></g>
);

const DownArrowSvg = ({ x, y1, y2, color = faint }: { x: number; y1: number; y2: number; color?: string }) => (
  <g fill={color} stroke={color}><line x1={x} y1={y1} x2={x} y2={y2 - 12} strokeWidth="3" /><polygon points={`${x},${y2} ${x - 9},${y2 - 16} ${x + 9},${y2 - 16}`} strokeWidth="0" /></g>
);

// A small chip with text, e.g. a file name the answer cites.
const SvgChip = ({ x, y, w, label, fill = '#FFFFFF', stroke = rule, color = ink, size = 24, h = 44 }: { x: number; y: number; w: number; label: string; fill?: string; stroke?: string; color?: string; size?: number; h?: number }) => (
  <g><rect x={x} y={y} width={w} height={h} rx="4" fill={fill} stroke={stroke} strokeWidth="2" /><text x={x + w / 2} y={y + h / 2 + size * 0.36} textAnchor="middle" fontSize={size} fill={color}>{label}</text></g>
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

// The app window frame for the Obsidian / Codex mock-ups.
const AppFrame = ({ x, y, w, h, title }: { x: number; y: number; w: number; h: number; title: string }) => (
  <g>
    <rect x={x} y={y} width={w} height={h} fill="#FFFFFF" stroke={rule} strokeWidth="2" />
    <rect x={x} y={y} width={w} height="48" fill="#F1F1F1" />
    <line x1={x} y1={y + 48} x2={x + w} y2={y + 48} stroke={rule} strokeWidth="2" />
    <text x={x + 24} y={y + 32} fontSize="22" fill={muted}>{title}</text>
  </g>
);

// ---------- Opening ----------

const Cover: Page = () => (
  <Shell top={174}>
    <In i={0}><Eyebrow>AI WORKSHOP 02｜Obsidian × Agent</Eyebrow></In>
    <In i={1} style={{ marginTop: 62 }}><Title>{'從 Obsidian 筆記，\n到自己的知識網站'}</Title></In>
    <In i={2} style={{ marginTop: 40, fontSize: 35, color: muted }}>一盒已備好的三國知識卡：沿連結讀、請 AI 查、再選擇公開</In>
    <In i={3} style={{ width: 160, height: 5, background: amber, marginTop: 72 }}><span /></In>
    <div style={{ position: 'absolute', right: 144, bottom: 170 }}>
      <Figure w={720} h={230} label="卡片連成關係網，再放上網站">
        <InG i={3}><DocShape x={0} y={40} w={110} h={140} fill={surface} /><DocShape x={22} y={60} w={110} h={140} /><text x={77} y={140} textAnchor="middle" fontSize="26" fill={muted}>.md</text></InG>
        <InG i={4}><MapArrow x1={152} x2={212} y={130} /></InG>
        <g fill="none" stroke={amber} strokeWidth="3"><DrawPath i={6} d="M268 70 L330 170" /><DrawPath i={6} d="M392 70 L330 170" /><DrawPath i={7} d="M392 70 L440 170" /></g>
        <InG i={5}><circle cx="268" cy="70" r="22" fill={amberSoft} stroke={amber} strokeWidth="2" /><circle cx="392" cy="70" r="22" fill={amber} /><rect x="314" y="156" width="32" height="32" fill={sage} stroke={okGreen} strokeWidth="2" transform="rotate(45 330 172)" /><rect x="424" y="156" width="32" height="32" fill={sage} stroke={okGreen} strokeWidth="2" transform="rotate(45 440 172)" /></InG>
        <InG i={8}><MapArrow x1={488} x2={548} y={130} /></InG>
        <InG i={9}><BrowserFrame x={570} y={40} w={150} h={170} url="" /><g stroke={rule} strokeWidth="6"><path d="M590 120 H690" /><path d="M590 146 H670" /><path d="M590 172 H680" /></g></InG>
      </Figure>
    </div>
  </Shell>
);

// A table-of-contents row: chapter, what you do, and the thing you walk away with.
const AGENDA_COLS = '90px 270px 1fr 300px 150px';

const AgendaRow = ({ i, n, doing, result, time, page, children }: { i: number; n: Chapter; doing: string; result: string; time: string; page: Page; children: ReactNode }) => (
  <In i={i} style={{ display: 'grid', gridTemplateColumns: AGENDA_COLS, alignItems: 'center', minHeight: 92, borderBottom: `1px solid ${rule}` }}>
    <span style={{ fontFamily: display, fontSize: 40, color: amber }}>{String(n).padStart(2, '0')}</span>
    <span style={{ fontSize: 35, fontWeight: 600 }}>{CHAPTERS[n - 1]}</span>
    <span style={{ fontSize: 28, color: muted, lineHeight: 1.45, paddingRight: 28 }}>{doing}</span>
    <span style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
      <svg viewBox="0 0 110 70" style={{ width: 110, height: 70, flexShrink: 0 }} aria-hidden="true">{children}</svg>
      <span style={{ fontSize: 28 }}>{result}</span>
    </span>
    <span style={{ textAlign: 'right' }}><span style={{ display: 'block', fontSize: 26, color: amber }}>{time}</span><span style={{ display: 'block', fontSize: 24, color: quiet, marginTop: 4 }}>第 {pageOf(page)} 頁</span></span>
  </In>
);

const Agenda: Page = () => (
  <Shell>
    <Eyebrow>AGENDA｜約 110 分鐘，含操作</Eyebrow>
    <Heading>課程大綱</Heading>
    <Lead>每一章結束，手上都會多一樣東西</Lead>
    <div style={{ display: 'grid', gridTemplateColumns: AGENDA_COLS, marginTop: 26, paddingBottom: 12, borderBottom: `1px solid ${rule}` }}>
      <span /><SmallLabel>章節</SmallLabel><SmallLabel>你會做的事</SmallLabel><SmallLabel>結束時手上有</SmallLabel><span style={{ textAlign: 'right' }}><SmallLabel>時間｜頁</SmallLabel></span>
    </div>
    <AgendaRow i={0} n={1} doing="裝好 Obsidian，打開三國筆記庫，沿連結讀一段故事" result="一盒 12 張卡" time="00–20 分" page={Section1}>
      <rect x="8" y="14" width="44" height="52" fill={surface} stroke={faint} strokeWidth="2" /><rect x="22" y="8" width="44" height="52" fill="#FFFFFF" stroke={faint} strokeWidth="2" /><rect x="36" y="2" width="44" height="52" fill={amberSoft} stroke={amber} strokeWidth="2" />
    </AgendaRow>
    <AgendaRow i={1} n={2} doing="請 Agent（Codex）先查筆記再回答，附上檔名" result="有出處的回答" time="20–35 分" page={Section2}>
      <path d="M8 6 H52 L66 20 V64 H8 Z" fill="#FFFFFF" stroke={faint} strokeWidth="2" /><g stroke={faint} strokeWidth="3"><path d="M18 26 H52" /><path d="M18 38 H46" /></g>
      <circle cx="86" cy="48" r="16" fill={okGreen} /><path d="M78 48 l6 6 l10 -11" fill="none" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
    </AgendaRow>
    <AgendaRow i={2} n={3} doing="請 Agent 新增 4 張卡，重畫關係圖和時間線" result="前後兩張圖" time="35–65 分" page={Section3}>
      <g stroke={faint} strokeWidth="2.5" fill="none"><path d="M14 18 L34 52" /><path d="M48 18 L34 52" /></g>
      <circle cx="14" cy="16" r="9" fill={amberSoft} stroke={amber} strokeWidth="2" /><circle cx="48" cy="16" r="9" fill={amberSoft} stroke={amber} strokeWidth="2" /><rect x="26" y="46" width="16" height="16" fill={sage} stroke={okGreen} strokeWidth="2" />
      <g stroke={okGreen} strokeWidth="2.5" fill="none"><path d="M70 18 L84 52" /><path d="M98 18 L84 52" /></g>
      <circle cx="70" cy="16" r="9" fill={sage} stroke={okGreen} strokeWidth="2" /><circle cx="98" cy="16" r="9" fill={sage} stroke={okGreen} strokeWidth="2" /><rect x="76" y="46" width="16" height="16" fill={sage} stroke={okGreen} strokeWidth="2" />
    </AgendaRow>
    <AgendaRow i={3} n={4} doing="做一張首頁，串起關係圖、時間線和來源卡" result="一張導覽頁" time="65–75 分" page={Section4}>
      <path d="M10 34 L40 8 L70 34 V64 H10 Z" fill={amberSoft} stroke={amber} strokeWidth="2" strokeLinejoin="round" /><rect x="32" y="44" width="16" height="20" fill="#FFFFFF" stroke={amber} strokeWidth="2" />
      <g stroke={faint} strokeWidth="3"><path d="M78 26 H104" /><path d="M78 40 H100" /><path d="M78 54 H104" /></g>
    </AgendaRow>
    <AgendaRow i={4} n={5} doing="挑要公開的卡，發布後請同學驗收" result="一個網址" time="75–110 分" page={Section5}>
      <rect x="6" y="8" width="98" height="56" fill="#FFFFFF" stroke={faint} strokeWidth="2" /><rect x="6" y="8" width="98" height="14" fill={raised} />
      <circle cx="16" cy="15" r="3" fill="#D87771" /><circle cx="26" cy="15" r="3" fill="#E4BB62" /><circle cx="36" cy="15" r="3" fill="#81B984" />
      <g stroke={link} strokeWidth="3"><path d="M18 36 H66" /><path d="M18 50 H54" /></g>
    </AgendaRow>
    <In i={5} style={{ marginTop: 20, fontSize: 25, color: quiet }}>課前準備：裝好 Codex（同第一篇），註冊 GitHub 和 Vercel 免費帳號</In>
  </Shell>
);

// The day's route on a chapter's opening page: five stops, this one in amber.
const ChapterTrack = ({ chapter }: { chapter: Chapter }) => {
  const xs = [90, 453, 816, 1179, 1542];
  const cur = xs[chapter - 1];
  return (
    <Figure h={170} label={`今天的五章，現在在第 ${chapter} 章：${CHAPTERS[chapter - 1]}`}>
      <line x1={xs[0]} y1="50" x2={xs[4]} y2="50" stroke={rule} strokeWidth="4" />
      {chapter > 1 ? <g stroke={amber} strokeWidth="5" fill="none"><DrawPath i={1} d={`M${xs[0]} 50 H${cur}`} /></g> : null}
      <TrackStop x={xs[0]} n={1} chapter={chapter} />
      <TrackStop x={xs[1]} n={2} chapter={chapter} />
      <TrackStop x={xs[2]} n={3} chapter={chapter} />
      <TrackStop x={xs[3]} n={4} chapter={chapter} />
      <TrackStop x={xs[4]} n={5} chapter={chapter} />
    </Figure>
  );
};

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

const SectionPage = ({ chapter, label, lead }: { chapter: Chapter; label: string; lead: string }) => (
  <Shell top={192} chapter={chapter} enterChapter>
    <In i={0}><Eyebrow>{label}</Eyebrow></In>
    <In i={1} style={{ marginTop: 63 }}><Title>{CHAPTERS[chapter - 1]}</Title></In>
    <In i={2} style={{ fontSize: 36, lineHeight: 1.5, color: muted, marginTop: 30, maxWidth: 1500 }}>{lead}</In>
    <div style={{ marginTop: 96 }}><ChapterTrack chapter={chapter} /></div>
  </Shell>
);

// ---------- 01 認識 Obsidian ----------

const Section1: Page = () => <SectionPage chapter={1} label="01 / OBSIDIAN" lead="像一盒放在自己電腦裡的知識卡：先打開，再沿著卡上的連結走" />;

// Five people on top, three relation cards below. People settle in when the page
// arrives; each click adds one story and draws the lines that join it.
const STORY_COLORS = [amber, link, okGreen];

const StoryLinks = ({ story, paths }: { story: 0 | 1 | 2; paths: string[] }) => (
  <g fill="none" stroke={STORY_COLORS[story]} strokeWidth="6" strokeLinecap="round">
    {paths.map((d, i) => <StepPath key={d} d={d} i={i} />)}
  </g>
);

const StoryMap: Page = () => (
  <Shell chapter={1}>
    <Eyebrow>先看今天的例子</Eyebrow>
    <Heading>三國筆記庫：人物卡靠關係卡連起來</Heading>
    <Lead>像畫家族樹：人物是點，一起經歷的事件把人接起來</Lead>
    <div style={{ marginTop: 34, background: '#FFFFFF', border: `1px solid ${rule}` }}>
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
            <g className="okg-build" style={buildDelay(3)}><RelBox cx={495} y={310} w={230} label="桃園結義" sub="第 1 回" fill={amberSoft} stroke={amber} /></g>
          </Layer></Step>
          <Step duration={STEP_MS}><Layer h={440} label="煮酒論英雄連到劉備、曹操">
            <StoryLinks story={1} paths={['M800 166 C820 240 900 280 930 310', 'M1120 166 C1100 240 1020 280 990 310']} />
            <g className="okg-build" style={buildDelay(2)}><RelBox cx={960} y={310} w={250} label="煮酒論英雄" sub="第 21 回" fill={linkSoft} stroke={link} /></g>
          </Layer></Step>
          <Step duration={STEP_MS}><Layer h={440} label="赤壁之戰連到曹操、孫權">
            <StoryLinks story={2} paths={['M1140 166 C1160 240 1240 280 1270 310', 'M1470 156 C1470 240 1380 280 1330 310']} />
            <g className="okg-build" style={buildDelay(2)}><RelBox cx={1300} y={310} w={230} label="赤壁之戰" sub="第 49–50 回" /></g>
          </Layer></Step>
        </Steps>
      </Stage>
    </div>
    <Steps><Step duration={STEP_MS}><p style={{ fontSize: 30, color: muted, marginTop: 26 }}>劉備、曹操外面多一圈：各接上兩段故事，同一張卡能走到不同路線</p></Step></Steps>
  </Shell>
);

// Obsidian window mock-up. Each click lights one part of the window and its caption.
const UI_PANE: CSSProperties = { position: 'absolute', boxSizing: 'border-box' };

const UiSpot = ({ n, left, top }: { n: number; left: number; top: number }) => (
  <span style={{ position: 'absolute', left, top, width: 50, height: 50, borderRadius: 25, background: amber, color: '#FFFFFF', display: 'grid', placeItems: 'center', fontSize: 26, fontWeight: 600, boxShadow: '0 0 0 5px #FFFFFF, 0 4px 12px rgba(0,0,0,0.25)' }}>{n}</span>
);

const UiCallout = ({ n, title, detail, spot }: { n: number; title: string; detail: string; spot: [number, number] }) => (
  <div>
    <div style={{ display: 'flex', gap: 18, alignItems: 'flex-start', padding: '20px 22px', background: surface, borderLeft: `4px solid ${amber}` }}>
      <NumDot n={n} />
      <div><div style={{ fontSize: 30, fontWeight: 600, lineHeight: 1.3 }}>{title}</div><div style={{ fontSize: 26, lineHeight: 1.4, color: muted, marginTop: 6 }}>{detail}</div></div>
    </div>
    <UiSpot n={n} left={spot[0]} top={spot[1]} />
  </div>
);

const TreeRow = ({ children, hot = false, indent = 22 }: { children: ReactNode; hot?: boolean; indent?: number }) => (
  <div style={{ paddingLeft: indent, background: hot ? '#E7E5E4' : undefined, fontWeight: hot ? 600 : 400, lineHeight: 1.45 }}>{children}</div>
);

const ObsidianWindow: Page = () => (
  <Shell chapter={1}>
    <Eyebrow>認識工具</Eyebrow>
    <Heading>Obsidian 畫面：資料夾、卡片、紫色連結</Heading>
    <Lead>打開後的畫面像一本活頁夾：左邊是目錄，中間是翻開的那一頁</Lead>
    <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: '1000px 1fr', gap: 44, marginTop: 36 }}>
      <In i={0} style={{ position: 'relative', height: 500, border: `1px solid ${rule}`, background: '#FFFFFF', boxShadow: '0 10px 30px rgba(28,25,23,0.08)' }}>
        <div style={{ ...UI_PANE, left: 0, top: 0, right: 0, height: 52, background: '#F1F1F1', borderBottom: `1px solid ${rule}`, display: 'flex', alignItems: 'center', padding: '0 22px', fontSize: 23, color: muted }}>
          <span style={{ marginLeft: 330, background: '#FFFFFF', color: ink, padding: '10px 40px', border: `1px solid ${rule}`, borderBottom: 'none' }}>桃園結義</span>
        </div>
        <div style={{ ...UI_PANE, left: 0, top: 52, width: 310, bottom: 0, background: surface, borderRight: `1px solid ${rule}`, padding: '16px 18px', fontSize: 24 }}>
          <div style={{ color: quiet, fontSize: 22, marginBottom: 6 }}>三國人物知識庫</div>
          <TreeRow indent={0}>三國演義</TreeRow>
          <TreeRow indent={0}><span style={{ color: amber, fontWeight: 600 }}>▾ 人物（5）</span></TreeRow>
          <TreeRow>劉備　關羽　張飛</TreeRow>
          <TreeRow>曹操　孫權</TreeRow>
          <TreeRow indent={0}><span style={{ color: amber, fontWeight: 600 }}>▾ 勢力（3）</span></TreeRow>
          <TreeRow>蜀漢　曹魏　東吳</TreeRow>
          <TreeRow indent={0}><span style={{ color: amber, fontWeight: 600 }}>▾ 關係（3）</span></TreeRow>
          <TreeRow hot>桃園結義</TreeRow>
          <TreeRow>煮酒論英雄</TreeRow>
          <TreeRow>赤壁之戰</TreeRow>
        </div>
        <div style={{ ...UI_PANE, left: 310, top: 52, right: 0, bottom: 0, padding: '38px 46px' }}>
          <div style={{ fontSize: 26, fontWeight: 600, color: amber }}>關係卡｜結義</div>
          <div style={{ fontSize: 28, lineHeight: 1.55, marginTop: 22 }}><LinkText text="第 1 回，[[劉備]] 看招兵榜文嘆氣，被 [[張飛]] 喝住，又在酒店遇上來投軍的 [[關羽]]；三人隔天在桃園立誓，結為兄弟" /></div>
          <div style={{ fontSize: 27, marginTop: 26 }}>參與人物：<LinkText text="[[劉備]]、[[關羽]]、[[張飛]]" /></div>
        </div>
      </In>
      <div style={{ display: 'grid', alignContent: 'start', gap: 20 }}>
        <Steps>
          <Step duration={STEP_MS}><UiCallout n={1} title="左邊｜資料夾" detail="人物、勢力、關係各一格" spot={[285, 92]} /></Step>
          <Step duration={STEP_MS}><UiCallout n={2} title="中間｜打開的卡" detail="讀〈桃園結義〉的故事" spot={[940, 92]} /></Step>
          <Step duration={STEP_MS}><UiCallout n={3} title="紫色字｜連結" detail="點人名，走到那張人物卡" spot={[640, 380]} /></Step>
        </Steps>
      </div>
    </div>
    <Caption>依 Obsidian 介面整理的示意，內容就是等一下發給大家的筆記</Caption>
  </Shell>
);

// The vault on disk: one folder, three drawers, twelve .md files. Obsidian writes into
// it and the Agent reads from it — the same folder, not two copies.
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

const VaultFiles: Page = () => (
  <Shell chapter={2}>
    <Eyebrow>Agent 讀的是什麼</Eyebrow>
    <Heading>筆記庫就是資料夾：每張卡是一個 .md</Heading>
    <Lead>就是一般資料夾，每張卡是一個 .md 純文字檔；Obsidian 和 Agent 用的是同一個</Lead>
    <div style={{ marginTop: 30 }}>
      <Stage h={520}>
        <Steps>
          <Layer h={520} label="三國人物知識庫資料夾：根目錄有三國演義.md，人物 5 張、勢力 3 張、關係 3 張，共 12 張；另有原文資料夾">
            <InG i={0}>
              <Folder x={420} y={0} w={790} h={500} fill="#FBF7F2" stroke={amber} sw={3} />
              <text x={450} y={62} fontSize="32" fontWeight="600" fill={ink}>三國人物知識庫/</text>
              <text x={1180} y={62} textAnchor="end" fontSize="26" fill={amber}>12 張 .md 卡</text>
            </InG>
            <InG i={1}><DocShape x={450} y={88} w={130} h={60} fill={amberSoft} stroke={amber} /><text x={515} y={128} textAnchor="middle" fontSize="23" fill={ink}>三國演義</text><text x={594} y={128} fontSize="24" fill={quiet}>入口卡</text>
              <rect x="700" y="92" width="230" height="52" fill="#FFFFFF" stroke={faint} strokeWidth="2" strokeDasharray="8 6" /><text x={716} y={127} fontSize="24" fill={quiet}>原文/：節選 .txt</text><rect x="946" y="92" width="234" height="52" fill="#FFFFFF" stroke={faint} strokeWidth="2" strokeDasharray="8 6" /><text x={962} y={127} fontSize="24" fill={quiet}>整理/：練習產出</text></InG>
            <InG i={2}><Drawer x={450} y={176} w={730} label="人物" count="5 張" /></InG>
            <InG i={2}><FileTile x={470} y={244} name="劉備" /><FileTile x={580} y={244} name="關羽" /><FileTile x={690} y={244} name="張飛" /><FileTile x={800} y={244} name="曹操" /><FileTile x={910} y={244} name="孫權" /></InG>
            <InG i={3}><Drawer x={450} y={318} w={350} label="勢力" count="3 張" /><Drawer x={830} y={318} w={350} label="關係" count="3 張" /></InG>
            <InG i={3}><FileTile x={460} y={388} name="蜀漢" /><FileTile x={566} y={388} name="曹魏" /><FileTile x={672} y={388} name="東吳" /></InG>
            <InG i={3}><FileTile x={840} y={388} name="桃園" /><FileTile x={946} y={388} name="煮酒" /><FileTile x={1052} y={388} name="赤壁" /></InG>
            <InG i={4}>
              <rect x="0" y="160" width="330" height="180" fill={linkSoft} stroke={link} strokeWidth="2" />
              <path d="M262 214 l-30 30 l-8 22 l22 -8 l30 -30 Z" fill="none" stroke={link} strokeWidth="3" strokeLinejoin="round" />
              <text x="28" y="210" fontSize="28" fontWeight="600" fill={link}>Obsidian</text>
              <text x="28" y="264" fontSize="44" fill={ink}>寫筆記</text>
              <text x="28" y="312" fontSize="24" fill={muted}>剛才用過的</text>
              <MapArrow x1={340} x2={410} y={250} hot />
            </InG>
          </Layer>
          <Step duration={STEP_MS}><Layer h={520} label="Agent 讀同一個資料夾；Agent 是會自己開檔、讀檔、寫檔的 AI，今天用 Codex">
            <g className="okg-build" style={buildDelay(1)}><MapArrow x1={1290} x2={1220} y={250} hot /></g>
            <g className="okg-build" style={buildDelay(0)}>
              <rect x="1302" y="120" width="330" height="260" fill={sage} stroke={okGreen} strokeWidth="2" />
              <circle cx="1572" cy="182" r="18" fill="none" stroke={okGreen} strokeWidth="4" /><path d="M1585 195 l18 18" stroke={okGreen} strokeWidth="4" strokeLinecap="round" />
              <text x="1330" y="170" fontSize="28" fontWeight="600" fill={okGreen}>Agent</text>
              <text x="1330" y="224" fontSize="44" fill={ink}>讀筆記</text>
              <SvgLines x={1330} y={278} lines={['會自己開檔、讀檔、', '寫檔的 AI；', '今天用 Codex']} size={24} fill={muted} anchor="start" />
            </g>
          </Layer></Step>
        </Steps>
      </Stage>
    </div>
    <Steps><Step duration={STEP_MS}><p style={{ fontSize: 28, color: muted, marginTop: 6 }}>之後簡報都叫它 Agent：資料夾負責分類，卡上的 [[連結]] 跨資料夾把卡接起來</p></Step></Steps>
  </Shell>
);

const DownloadObsidian: Page = () => (
  <Shell chapter={1}>
    <Eyebrow>安裝 1／2</Eyebrow>
    <Heading>下載 Obsidian</Heading>
    <Lead>像裝一般軟體：官網下載、照畫面安裝；免費，不用註冊帳號</Lead>
    <div style={{ display: 'grid', gridTemplateColumns: '760px 1fr', gap: 64, marginTop: 40, alignItems: 'start' }}>
      <In i={0} style={{ position: 'relative' }}>
        <Screenshot src={downloadPage} aspect={1400 / 840} width={760} url="obsidian.md/download" caption="Obsidian 官方下載頁實際畫面（2026-10-12 擷取，瀏覽器放大 175%）" alt="Obsidian 下載頁上的紫色 Download for Windows 按鈕">
          <RegionMark x={13} y={41} w={74} h={29} i={3} />
          <MarkBubble n={2} left="8%" top="55%" i={4} />
        </Screenshot>
        <MarkBubble n={1} left={720} top={28} i={2} />
      </In>
      <div style={{ display: 'grid', gap: 40, paddingTop: 30 }}>
        <In i={1}><Callout n={1} title="打開網址" detail={<Path size={28}>obsidian.md/download</Path>} /></In>
        <In i={2}><Callout n={2} title="按下載按鈕" detail="網頁會自動顯示你的系統：Windows 或 macOS" /></In>
        <In i={3}><Callout n={3} title="照畫面安裝，再打開 Obsidian" detail="Mac：把 Obsidian 拖進「應用程式」" /></In>
      </div>
    </div>
  </Shell>
);

const FirstLaunch: Page = () => (
  <Shell chapter={1}>
    <Eyebrow>安裝 2／2</Eyebrow>
    <Heading>第一次打開：先改成繁體中文</Heading>
    <Lead>像新手機開機先選語言：在最下面選「繁體中文」</Lead>
    <div style={{ marginTop: 44 }}>
      <In i={0} style={{ position: 'relative' }}>
        <Screenshot src={firstLaunch} aspect={1520 / 470} width={1300} caption="Obsidian 第一次打開的實際畫面（1.10.3，2026-10 擷取）" alt="Obsidian 起始畫面：建立新的儲存庫、開啟資料夾為儲存庫、連接至 Obsidian Sync 和最下方的語言選單">
          <RegionMark x={6} y={83} w={92} h={14} i={2} />
          <MarkBubble n={1} left="-1.5%" top="90%" i={3} />
          <RegionMark x={1.5} y={29} w={97} h={20} i={5} />
          <MarkBubble n={2} left="-1.5%" top="39%" i={6} />
        </Screenshot>
      </In>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, marginTop: 34 }}>
      <In i={4}><Callout n={1} title="先改成繁體中文" detail="選單在畫面最下方" /></In>
      <In i={7}><Callout n={2} title="等一下會用：開啟資料夾為儲存庫" detail="今天不建空白儲存庫，直接打開教材" /></In>
    </div>
  </Shell>
);

// Getting the course vault: scan or click, unzip, open in Obsidian.
const GetVault: Page = () => (
  <Shell chapter={1}>
    <Eyebrow>下載課堂教材</Eyebrow>
    <Heading>下載三國筆記庫，用 Obsidian 打開</Heading>
    <Lead>像拿到一盒裝好的卡片：拆開包裝，整盒放進 Obsidian</Lead>
    <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: 56, marginTop: 36, alignItems: 'start' }}>
      <In i={0} style={{ background: amberSoft, borderTop: `5px solid ${amber}`, padding: '20px 24px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: 28, fontWeight: 600 }}>用電腦下載教材</div>
        <a href={publicVaultUrl} target="_blank" rel="noreferrer" aria-label="開啟 GitHub 上的三國人物知識庫 ZIP">
          <img src={vaultQr} alt="教材 ZIP 的 GitHub 下載 QR code" style={{ width: 250, height: 250, display: 'block', margin: '14px auto 0', imageRendering: 'pixelated' }} />
        </a>
        <a href={publicVaultUrl} download="三國人物知識庫.zip" style={{ display: 'inline-block', marginTop: 10, padding: '8px 20px', background: amber, color: '#FFFFFF', fontSize: 24, fontWeight: 600, textDecoration: 'none' }}>或按這裡下載 ZIP ↓</a>
        <div style={{ fontSize: 22, color: muted, marginTop: 10, lineHeight: 1.4 }}>手機掃描只會存到手機；<br />請在電腦上按按鈕下載</div>
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
            <text x={530} y={150} textAnchor="middle" fontSize="26" fill={ink}>人物／勢力／關係</text>
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
        <In i={6} style={{ marginTop: 20, background: surface, borderLeft: `4px solid ${amber}`, padding: '16px 26px', fontSize: 27, lineHeight: 1.5 }}>解壓縮｜Windows：ZIP 上按右鍵 →「全部解壓縮」（直接雙擊只是瀏覽）；Mac：雙擊即可<br />開啟時選「三國人物知識庫」這一層，不要選外層資料夾</In>
        <In i={7} style={{ marginTop: 18, fontSize: 26, color: amber, fontWeight: 600 }}>完成檢查：左側看得到〈三國演義〉和人物、勢力、關係資料夾</In>
        <In i={8} style={{ marginTop: 10, fontSize: 25, color: quiet }}>裡面另有 原文/（練習二用的小說節選）和 整理/（練習提示詞、之後的練習產出）</In>
      </div>
    </div>
  </Shell>
);

// Reading along links, drawn as a metro line: each card is a station and the relation
// card in the middle says why the two people are connected.
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
    <Heading>點紫色人名：從劉備走到關羽</Heading>
    <Lead>像坐捷運：從〈劉備〉上車，經過〈桃園結義〉，在〈關羽〉下車</Lead>
    <div style={{ marginTop: 40, background: '#FFFFFF', border: `1px solid ${rule}`, padding: '20px 0' }}>
      <Stage h={340}>
        <Steps>
          <Layer h={340} label="第一站：劉備人物卡">
            <Station x={260} kind="人物卡" name="劉備" line={amber} why="點卡裡的 [[桃園結義]]" />
          </Layer>
          <Step duration={STEP_MS}><Layer h={340} label="第二站：桃園結義關係卡，說明三人在第 1 回結為兄弟">
            <g fill="none" stroke={amber} strokeWidth="12" strokeLinecap="round"><StepPath d="M298 150 H778" /></g>
            <g className="okg-build" style={buildDelay(3)}>
              <rect x="636" y="96" width="360" height="108" fill={sage} stroke={okGreen} strokeWidth="3" />
              <text x="816" y="72" textAnchor="middle" fontSize="24" fill={quiet}>關係卡</text>
              <text x="816" y="164" textAnchor="middle" fontSize="40" fontWeight="600" fill={ink}>桃園結義</text>
              <SvgLines x={816} y={262} lines={['第 1 回：三人結為兄弟', '這就是兩人相連的理由']} size={26} fill={muted} />
            </g>
          </Layer></Step>
          <Step duration={STEP_MS}><Layer h={340} label="第三站：關羽人物卡">
            <g fill="none" stroke={amber} strokeWidth="12" strokeLinecap="round"><StepPath d="M996 150 H1334" /></g>
            <g className="okg-build" style={buildDelay(3)}><Station x={1372} kind="另一張人物卡" name="關羽" line={amber} why="同一段故事帶你到這裡" /></g>
          </Layer></Step>
        </Steps>
      </Stage>
    </div>
    <Steps><Step duration={STEP_MS}><p style={{ fontSize: 30, color: muted, marginTop: 28 }}>關係卡不只是一條線：它寫出劉備和關羽為什麼相連</p></Step></Steps>
  </Shell>
);

// The practice: three relation cards the learner can switch between on the slide.
const practiceNoteExamples = [
  { name: '桃園結義', role: '結義關係', content: '第 1 回，[[劉備]] 看招兵榜文嘆氣，被 [[張飛]] 喝住，又在酒店遇上來投軍的 [[關羽]]；三人隔天在桃園立誓，結為兄弟\n參與人物：[[劉備]]、[[關羽]]、[[張飛]]' },
  { name: '煮酒論英雄', role: '對話關係', content: '第 21 回，[[曹操]] 請寄身門下的 [[劉備]] 青梅煮酒，說「今天下英雄，惟使君與操耳」；劉備嚇得掉了匙箸，[[關羽]]、[[張飛]] 衝進後園按劍而立\n參與人物：[[曹操]]、[[劉備]]' },
  { name: '赤壁之戰', role: '對抗關係', content: '第 49 至 50 回，[[孫權]] 和 [[劉備]] 聯手，周瑜火燒曹軍戰船；[[曹操]] 敗逃到華容道，被 [[關羽]] 放走\n參與人物：[[孫權]]、[[曹操]]、[[劉備]]、[[關羽]]、[[張飛]]' },
] as const;

const PracticeFileRow = ({ name, role, active, onClick }: { name: string; role: string; active: boolean; onClick: () => void }) => (
  <div role="button" tabIndex={0} onClick={onClick} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } }} aria-pressed={active} style={{ display: 'flex', alignItems: 'center', gap: 17, padding: '8px 23px', lineHeight: 1.25, boxSizing: 'border-box', borderLeft: `5px solid ${active ? amber : 'transparent'}`, background: active ? '#EDE1D5' : 'transparent', textAlign: 'left', color: ink, fontFamily: 'inherit', cursor: 'pointer' }}>
    <svg viewBox="0 0 28 34" style={{ width: 26, height: 32, flexShrink: 0 }} aria-hidden="true"><DocShape x={1} y={1} w={26} h={32} stroke={active ? amber : quiet} /></svg>
    <span style={{ display: 'grid', gap: 2 }}><strong style={{ fontSize: 28 }}>{name}</strong><span style={{ color: muted, fontSize: 22 }}>{role}</span></span>
  </div>
);

// Purple [[links]] inside the card text, as Obsidian shows them.
const LinkText = ({ text }: { text: string }) => (
  <>{text.split(/(\[\[[^\]]+\]\])/).map((part, i) => part.startsWith('[[') ? <span key={i} style={{ color: link, textDecoration: 'underline' }}>{part.slice(2, -2)}</span> : <span key={i}>{part}</span>)}</>
);

const PracticeVault = () => {
  const [active, setActive] = useState<0 | 1 | 2>(0);
  const selected = practiceNoteExamples[active];
  return (
    <div style={{ border: `1px solid ${rule}`, background: '#FFFFFF', height: 440, display: 'grid', gridTemplateColumns: '365px 1fr', boxShadow: '0 10px 30px rgba(28,25,23,0.06)' }}>
      <div style={{ background: surface, borderRight: `1px solid ${rule}` }}>
        <div style={{ padding: '18px 28px 14px', borderBottom: `1px solid ${rule}` }}>
          <div style={{ fontSize: 30, fontWeight: 600 }}>三國人物知識庫</div>
          <div style={{ color: muted, fontSize: 22, marginTop: 5 }}>共 12 張 · 先看 3 張關係卡</div>
        </div>
        <div style={{ paddingTop: 10 }}>
          <div style={{ padding: '7px 27px 11px', color: amber, fontSize: 24, fontWeight: 600 }}>▾ 關係（3）</div>
          <PracticeFileRow name="桃園結義" role="結義關係" active={active === 0} onClick={() => setActive(0)} />
          <PracticeFileRow name="煮酒論英雄" role="對話關係" active={active === 1} onClick={() => setActive(1)} />
          <PracticeFileRow name="赤壁之戰" role="對抗關係" active={active === 2} onClick={() => setActive(2)} />
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateRows: '72px 1fr', minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 24, padding: '0 34px', borderBottom: `1px solid ${rule}`, background: '#FAFAF9' }}>
          <div style={{ fontSize: 27, color: muted }}>{selected.name}.md</div>
          <span style={{ color: quiet, fontSize: 22 }}>← 點左邊的卡切換</span>
        </div>
        <div style={{ padding: '38px 50px', minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 24 }}><strong style={{ fontSize: 48 }}>{selected.name}</strong><span style={{ color: amber, fontSize: 25 }}>{selected.role}</span></div>
          <div style={{ margin: '28px 0 0', fontSize: 32, lineHeight: 1.55, color: ink, whiteSpace: 'pre-wrap' }}><LinkText text={selected.content} /></div>
        </div>
      </div>
    </div>
  );
};

const ReadRelations: Page = () => (
  <Shell chapter={1}>
    <PracticeEyebrow time="5 分鐘">動手做</PracticeEyebrow>
    <Heading>練習：打開三張關係卡，點人名換卡</Heading>
    <Lead>打開左側〈關係〉資料夾，切換三張卡，看每段故事連到誰</Lead>
    <In i={0} style={{ marginTop: 32 }}><PracticeVault /></In>
    <In i={1} style={{ display: 'flex', alignItems: 'center', gap: 17, fontSize: 28, marginTop: 24 }}><NumDot n={1} /><span>在 Obsidian 打開一張關係卡，點紫色人名，看能走到哪裡</span></In>
    <In i={2} style={{ color: amber, fontSize: 26, fontWeight: 600, marginTop: 14 }}>完成檢查：能從關係卡走到人物卡，再走向另一段關係</In>
  </Shell>
);

// ---------- 02 理解 RAG ----------

const Section2: Page = () => <SectionPage chapter={2} label="02 / RAG" lead="剛才是自己沿連結找資料；現在換 AI 先查筆記，再根據筆記回答" />;

const MiniCard = ({ x, y, name, hot = false }: { x: number; y: number; name: string; hot?: boolean }) => (
  <g>
    <rect x={x} y={y} width="136" height="58" fill={hot ? amberSoft : '#FFFFFF'} stroke={hot ? amber : rule} strokeWidth={hot ? 3 : 2} />
    <text x={x + 68} y={y + 38} textAnchor="middle" fontSize="24" fontWeight={hot ? 600 : 400} fill={hot ? ink : quiet}>{name}</text>
  </g>
);

const RagHead = ({ x, letter, term, english }: { x: number; letter: string; term: string; english: string }) => (
  <g>
    <text x={x} y="56" fontSize="62" fontFamily={display} fill={amber}>{letter}</text>
    <text x={x + 56} y="52" fontSize="36" fontWeight="600" fill={ink}>{term}</text>
    <text x={x + 140} y="52" fontSize="23" fill={quiet}>{english}</text>
  </g>
);

const Bubble = ({ x, y, w, h, fill = '#FFFFFF', stroke = rule, dash }: { x: number; y: number; w: number; h: number; fill?: string; stroke?: string; dash?: string }) => (
  <path d={`M${x + 12} ${y} H${x + w - 12} Q${x + w} ${y} ${x + w} ${y + 12} V${y + h - 12} Q${x + w} ${y + h} ${x + w - 12} ${y + h} H${x + 60} L${x + 36} ${y + h + 22} L${x + 40} ${y + h} H${x + 12} Q${x} ${y + h} ${x} ${y + h - 12} V${y + 12} Q${x} ${y} ${x + 12} ${y} Z`} fill={fill} stroke={stroke} strokeWidth="2" strokeDasharray={dash} />
);

const RagSteps: Page = () => (
  <Shell chapter={2}>
    <Eyebrow>RAG＝檢索增強生成</Eyebrow>
    <Heading>RAG：先找卡、交給 AI、附檔名回答</Heading>
    <Lead>像開書考：先翻到那一頁（R），把它攤在桌上（A），再寫答案（G）</Lead>
    <div style={{ marginTop: 34 }}>
      <Stage h={450}>
        <Steps>
          <Layer h={450} label="R 檢索：從筆記庫找出〈曹操〉和〈赤壁之戰〉">
            <InG i={0}><RagHead x={0} letter="R" term="檢索" english="Retrieval" /></InG>
            <InG i={1}>
              <rect x="0" y="86" width="500" height="320" fill={surface} />
              <rect x="24" y="106" width="452" height="56" rx="28" fill="#FFFFFF" stroke={ink} strokeWidth="2" />
              <text x="250" y="144" textAnchor="middle" fontSize="27" fill={ink}>曹操參與哪場戰役？</text>
            </InG>
            <InG i={2}><MiniCard x={24} y={192} name="劉備" /><MiniCard x={182} y={192} name="關羽" /><MiniCard x={340} y={192} name="曹操" hot /></InG>
            <InG i={3}><MiniCard x={24} y={268} name="桃園結義" /><MiniCard x={182} y={268} name="煮酒論英雄" /><MiniCard x={340} y={268} name="赤壁之戰" hot /></InG>
            <InG i={4}><text x="250" y="378" textAnchor="middle" fontSize="26" fill={muted}>從筆記庫挑出相關的兩張</text></InG>
          </Layer>
          <Step duration={STEP_MS}><Layer h={450} label="A 增強：把問題和兩張卡一起交給 AI">
            <MapArrow x1={512} x2={560} y={246} hot />
            <RagHead x={566} letter="A" term="增強" english="Augmented" />
            <rect x="566" y="86" width="500" height="320" fill={linkSoft} />
            <g className="okg-build" style={buildDelay(0)}>
              <rect x="596" y="106" width="440" height="150" fill="#FFFFFF" stroke={link} strokeWidth="2" strokeDasharray="10 8" />
              <text x="616" y="142" fontSize="24" fill={link}>一起交出去</text>
              <SvgChip x={616} y={160} w={400} label="問題：曹操參與哪場戰役？" size={23} />
              <SvgChip x={616} y={204} w={190} label="曹操.md" fill={amberSoft} stroke={amber} />
              <SvgChip x={826} y={204} w={190} label="赤壁之戰.md" fill={amberSoft} stroke={amber} />
            </g>
            <g className="okg-build" style={buildDelay(1)}>
              <DownArrowSvg x={816} y1={262} y2={296} color={link} />
              <rect x="736" y="300" width="160" height="58" fill={link} />
              <text x="816" y="339" textAnchor="middle" fontSize="30" fontWeight="600" fill="#FFFFFF">AI</text>
              <text x="816" y="392" textAnchor="middle" fontSize="24" fill={muted}>題目多了可查的依據</text>
            </g>
          </Layer></Step>
          <Step duration={STEP_MS}><Layer h={450} label="G 生成：AI 回答赤壁之戰，並附上兩個檔名">
            <MapArrow x1={1078} x2={1126} y={246} hot />
            <RagHead x={1132} letter="G" term="生成" english="Generation" />
            <rect x="1132" y="86" width="500" height="320" fill={sage} />
            <g className="okg-build" style={buildDelay(0)}>
              <Bubble x={1160} y={110} w={444} h={120} />
              <text x="1186" y="160" fontSize="30" fontWeight="600" fill={ink}>曹操參與赤壁之戰。</text>
              <text x="1186" y="204" fontSize="24" fill={muted}>根據筆記，不靠印象</text>
            </g>
            <g className="okg-build" style={buildDelay(1)}>
              <text x="1160" y="296" fontSize="24" fill={okGreen} fontWeight="600">依據</text>
              <SvgChip x={1222} y={268} w={170} label="曹操.md" fill="#FFFFFF" stroke={okGreen} />
              <SvgChip x={1404} y={268} w={200} label="赤壁之戰.md" fill="#FFFFFF" stroke={okGreen} />
              <text x="1382" y="378" textAnchor="middle" fontSize="26" fill={muted}>回答附上檔名</text>
            </g>
          </Layer></Step>
        </Steps>
      </Stage>
    </div>
    <Steps><Step duration={STEP_MS}><p style={{ fontSize: 28, color: muted, marginTop: 10 }}>RAG 不用改 AI 本身：只是回答前，先把找到的資料一起交給它</p></Step></Steps>
  </Shell>
);

// Before / after: the same question answered from memory, then from the notes.
const RagCompare: Page = () => (
  <Shell chapter={2}>
    <Eyebrow>查資料前後</Eyebrow>
    <Heading>沒查筆記和先查筆記：差在有沒有出處</Heading>
    <Lead>像寫作業：憑印象寫，和翻過課本再寫，差在講不講得出出處</Lead>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, marginTop: 34 }}>
      <Steps>
        <div style={{ background: surface, borderTop: `5px solid ${faint}`, padding: '20px 30px 18px' }}>
          <div style={{ fontSize: 32, fontWeight: 600 }}>沒查筆記</div>
          <Figure w={720} h={400} label="沒查筆記：AI 憑印象回答，說不出出處">
            <InG i={0}><rect x="0" y="20" width="720" height="60" rx="30" fill="#FFFFFF" stroke={ink} strokeWidth="2" /><text x="360" y="60" textAnchor="middle" fontSize="27" fill={ink}>依這盒筆記，曹操參與哪場戰役？</text></InG>
            <InG i={1}><DownArrowSvg x={360} y1={88} y2={128} />
              <rect x="280" y="134" width="160" height="70" fill={faint} /><text x="360" y="180" textAnchor="middle" fontSize="30" fontWeight="600" fill="#FFFFFF">AI</text>
              <ellipse cx="560" cy="150" rx="120" ry="44" fill="#FFFFFF" stroke={rule} strokeWidth="2" strokeDasharray="8 6" /><text x="560" y="159" textAnchor="middle" fontSize="25" fill={quiet}>印象中好像…</text>
              <circle cx="452" cy="182" r="7" fill="#FFFFFF" stroke={rule} strokeWidth="2" /></InG>
            <InG i={2}><DownArrowSvg x={360} y1={212} y2={252} />
              <Bubble x={60} y={258} w={600} h={100} stroke={amber} dash="10 8" />
              <text x="96" y="300" fontSize="28" fill={ink}>答案可能對，也可能錯</text>
              <text x="96" y="340" fontSize="24" fill={amber}>沒有檔名可以回去核對</text>
              <AskMark x={620} y={308} r={22} /></InG>
          </Figure>
        </div>
        <Step duration={STEP_MS}><div style={{ background: sage, borderTop: `5px solid ${okGreen}`, padding: '20px 30px 18px' }}>
          <div style={{ fontSize: 32, fontWeight: 600 }}>先查筆記</div>
          <Figure w={720} h={400} label="先查筆記：找到曹操與赤壁之戰兩張卡，回答赤壁之戰並附檔名">
            <rect x="0" y="20" width="720" height="60" rx="30" fill="#FFFFFF" stroke={ink} strokeWidth="2" /><text x="360" y="60" textAnchor="middle" fontSize="27" fill={ink}>依這盒筆記，曹操參與哪場戰役？</text>
            <g className="okg-build" style={buildDelay(0)}><DownArrowSvg x={360} y1={88} y2={128} color={okGreen} />
              <MiniCard x={144} y={136} name="曹操" hot /><MiniCard x={440} y={136} name="赤壁之戰" hot />
              <g fill="none" stroke={amber} strokeWidth="3"><path d="M280 165 H440" /></g>
              <circle cx="332" cy="226" r="16" fill="none" stroke={okGreen} strokeWidth="4" /><path d="M344 238 l14 14" stroke={okGreen} strokeWidth="4" strokeLinecap="round" />
              <text x="372" y="236" fontSize="24" fill={okGreen}>找到兩張卡</text></g>
            <g className="okg-build" style={buildDelay(1)}><DownArrowSvg x={360} y1={252} y2={276} color={okGreen} />
              <Bubble x={60} y={282} w={600} h={86} stroke={okGreen} />
              <text x="96" y="320" fontSize="28" fontWeight="600" fill={ink}>赤壁之戰</text>
              <text x="96" y="354" fontSize="24" fill={okGreen}>依據：曹操.md、赤壁之戰.md</text>
              <OkDot x={620} y={325} /></g>
          </Figure>
        </div></Step>
      </Steps>
    </div>
    <Steps><Step duration={STEP_MS}><p style={{ fontSize: 26, color: quiet, marginTop: 16 }}>題目限定「這盒筆記」：筆記只記了赤壁，不代表曹操一生只打過這一仗</p></Step></Steps>
  </Shell>
);

// Point Codex at the right folder: the vault, not the whole Documents folder.
const OpenInCodex: Page = () => (
  <Shell chapter={2}>
    <Eyebrow>開始查詢前</Eyebrow>
    <Heading>用 Codex 打開筆記庫，先點名</Heading>
    <Lead>像請助理整理書櫃：先帶他走到那一格，再請他點名</Lead>
    <div style={{ display: 'grid', gridTemplateColumns: '880px 1fr', gap: 52, marginTop: 30, alignItems: 'start' }}>
      <div>
        <In i={0}><Terminal label="Windows 開 PowerShell｜Mac 開「終端機」（Codex 安裝見第一篇）" width={880}>
          <div><Typed>$ cd </Typed><span style={{ color: '#E9B650', fontFamily: 'var(--osd-font-body)', fontSize: 26 }}>← 打空格，再把資料夾拖進來</span></div>
          <div><Typed>$ codex</Typed></div>
          <div style={{ color: '#BAB5B0' }}>› 請列出這個資料夾裡所有的 .md 檔</div>
        </Terminal></In>
        <div style={{ display: 'grid', gap: 16, marginTop: 24 }}>
          <In i={1}><Callout n={1} title="cd：走進「三國人物知識庫」這一層" detail="不要停在「文件」或「下載」：Codex 只看你所在的資料夾" /></In>
          <In i={2}><Callout n={2} title="codex：第一次會請你登入" detail="問 Do you trust the contents of this directory? 選 Yes, continue" /></In>
          <In i={3}><Callout n={3} title="提示詞整段複製、一次貼上，最後才按 Enter" detail="一行一行打的話，每按一次 Enter 就先送出一行" /></In>
        </div>
      </div>
      <Steps>
        <Step duration={STEP_MS}><Figure w={700} h={470} label="Codex 列出的 .md：入口 1、人物 5、勢力 3、關係 3，共 12 張卡；另有整理資料夾裡的練習提示詞">
          <AppFrame x={0} y={0} w={700} h={460} title="Codex 的回覆（示意）" />
          <text x="32" y="98" fontSize="27" fontFamily={mono} fill={ink}>三國演義.md</text>
          <text x="32" y="146" fontSize="27" fontFamily={mono} fill={ink}>人物/　5 個</text>
          <text x="32" y="194" fontSize="27" fontFamily={mono} fill={ink}>勢力/　3 個</text>
          <text x="32" y="242" fontSize="27" fontFamily={mono} fill={ink}>關係/　3 個</text>
          <text x="32" y="290" fontSize="27" fontFamily={mono} fill={quiet}>整理/練習提示詞.md</text>
          <text x="32" y="334" fontSize="24" fill={quiet}>（原文/ 是 .txt，不在清單裡）</text>
          <line x1="32" y1="360" x2="668" y2="360" stroke={rule} strokeWidth="2" />
          <text x="32" y="416" fontSize="32" fontWeight="600" fill={okGreen}>卡片 12 張＋提示詞 1 份</text>
          <g className="okg-build" style={buildDelay(2)}><OkDot x={640} y={404} r={26} /></g>
        </Figure></Step>
      </Steps>
    </div>
  </Shell>
);

// The route we expect the Agent to take, so the class knows what to look for.
const RouteStep = ({ y, label, sub, tone = 'card' }: { y: number; label: string; sub: string; tone?: 'card' | 'answer' }) => (
  <g>
    <rect x="0" y={y} width="460" height="96" fill={tone === 'answer' ? sage : amberSoft} stroke={tone === 'answer' ? okGreen : amber} strokeWidth="2" />
    <text x="28" y={y + 42} fontSize="30" fontWeight="600" fill={ink}>{label}</text>
    <text x="28" y={y + 78} fontSize="24" fill={muted}>{sub}</text>
  </g>
);

const AskAgent: Page = () => (
  <Shell chapter={2}>
    <PracticeEyebrow time="5 分鐘">練習提問</PracticeEyebrow>
    <Heading>練習（RAG）：請 Agent 查曹操打過哪一仗</Heading>
    <Lead>像考學生「出處在哪一頁」：答案和檔名都要交</Lead>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 460px', gap: 64, marginTop: 36, alignItems: 'start' }}>
      <In i={0}><PromptSlots full="查筆記練習">
        <SlotRow tag="範圍">這個筆記庫的 .md 卡，從〈曹操〉找起</SlotRow>
        <SlotRow tag="產出">曹操參與哪場戰役？回答並附上檔名</SlotRow>
        <SlotRow tag="限制">要核對相關的關係卡；找不到根據的細節不補寫</SlotRow>
      </PromptSlots></In>
      <div>
        <SmallLabel>預期它會走的路</SmallLabel>
        <Figure w={460} h={400} label="預期路線：先讀曹操.md，再核對赤壁之戰.md，最後回答並附兩個檔名" style={{ marginTop: 14 }}>
          <InG i={1}><RouteStep y={0} label="1｜曹操.md" sub="找到赤壁戰事的記載" /></InG>
          <InG i={2}><DownArrowSvg x={230} y1={100} y2={144} color={amber} /><RouteStep y={148} label="2｜赤壁之戰.md" sub="關係卡：核對交戰經過" /></InG>
          <InG i={3}><DownArrowSvg x={230} y1={248} y2={292} color={okGreen} /><RouteStep y={296} label="3｜回答＋兩個檔名" sub="沒查到的不補" tone="answer" /></InG>
        </Figure>
      </div>
    </div>
  </Shell>
);

// Each sentence of the answer is tied by a line to the sentence in the note that backs it.
const QuoteLine = ({ x, y, w, text }: { x: number; y: number; w: number; text: string }) => (
  <g><rect x={x} y={y - 30} width={w} height="42" fill={amberSoft} /><text x={x + 10} y={y} fontSize="26" fill={ink}>{text}</text></g>
);

const AgentAnswer: Page = () => (
  <Shell chapter={2}>
    <Eyebrow>回答示例</Eyebrow>
    <Heading>好的回答：每一句都對到一張卡</Heading>
    <Lead>像報告附出處：回答裡的每一句，都對得到筆記裡的一句</Lead>
    <div style={{ marginTop: 36 }}>
      <Stage h={480}>
        <Steps>
          <Layer h={480} label="Agent 的回答三句話，最後附上兩個檔名">
            <InG i={0}>
              <rect x="0" y="0" width="660" height="470" fill="#202326" />
              <rect x="0" y="0" width="660" height="5" fill={amber} />
              <text x="34" y="56" fontSize="24" fill="#BAB5B0">依範例筆記整理的回答示意</text>
              <text x="34" y="134" fontSize="30" fontFamily={mono} fill="#F5F5F4">曹操參與赤壁之戰。</text>
              <text x="34" y="224" fontSize="30" fontFamily={mono} fill="#F5F5F4">周瑜火攻，曹軍戰船燒成一片，</text>
              <text x="34" y="314" fontSize="30" fontFamily={mono} fill="#F5F5F4">曹操大敗。</text>
              <text x="34" y="414" fontSize="28" fontFamily={mono} fill="#F3D9B1">依據：曹操.md、赤壁之戰.md</text>
            </InG>
          </Layer>
          <Step duration={STEP_MS}><Layer h={480} label="三句話各自連到曹操.md 與赤壁之戰.md 裡支持它的句子">
            <g className="okg-build" style={buildDelay(0)}>
              <DocShape x={1000} y={0} w={632} h={190} />
              <text x="1028" y="46" fontSize="26" fontWeight="600" fill={amber}>人物/曹操.md</text>
              <QuoteLine x={1024} y={112} w={470} text="在赤壁之戰被孫權麾下的周瑜火燒戰船" />
              <text x="1028" y="166" fontSize="24" fill={quiet}>第 49 至 50 回</text>
            </g>
            <g className="okg-build" style={buildDelay(1)}>
              <DocShape x={1000} y={230} w={632} h={240} />
              <text x="1028" y="276" fontSize="26" fontWeight="600" fill={amber}>關係/赤壁之戰.md</text>
              <QuoteLine x={1024} y={344} w={560} text="周瑜下令火攻，曹軍連在一起的戰船燒成一片" />
              <QuoteLine x={1024} y={410} w={150} text="曹操大敗" />
            </g>
            <g fill="none" stroke={okGreen} strokeWidth="4">
              <StepPath d="M380 124 C700 124 760 100 1018 100" i={2} />
              <StepPath d="M500 214 C720 214 760 332 1018 332" i={3} />
              <StepPath d="M210 304 C700 304 760 398 1018 398" i={4} />
            </g>
          </Layer></Step>
        </Steps>
      </Stage>
    </div>
    <Steps><Step duration={STEP_MS}><p style={{ fontSize: 26, color: quiet, marginTop: 14 }}>範圍是今天的 12 張筆記；不代表曹操一生只參與赤壁一場戰役</p></Step></Steps>
  </Shell>
);

// Three checks, each drawn as a small picture.
const CheckPanel = ({ label, caption, alt, children }: { label: string; caption: string; alt: string; children: ReactNode }) => (
  <div style={{ background: '#FFFFFF', border: `1px solid ${rule}`, padding: '24px 28px 24px', boxSizing: 'border-box', height: '100%' }}>
    <SmallLabel>{label}</SmallLabel>
    <svg viewBox="0 0 464 220" style={{ display: 'block', width: '100%', height: 'auto', marginTop: 14 }} role="img" aria-label={alt}>{children}</svg>
    <div style={{ fontSize: 29, lineHeight: 1.4, marginTop: 12 }}>{caption}</div>
  </div>
);

const CheckAnswer: Page = () => (
  <Shell chapter={2}>
    <Eyebrow>核對回答</Eyebrow>
    <Heading>核對回答三件事：出處、範圍、說不知道</Heading>
    <Lead>像改考卷：對出處、看有沒有亂加、不知道有沒有老實說</Lead>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 36, marginTop: 40 }}>
      <Steps>
        <In i={0} style={{ display: 'grid' }}><CheckPanel label="1｜出處" caption="回答提到的檔案真的存在嗎？" alt="資料夾裡找到回答引用的檔案，打勾">
          <Folder x={40} y={40} w={240} h={150} />
          <DocShape x={120} y={70} w={110} h={100} fill="#FFFFFF" stroke={amber} sw={3} />
          <text x="175" y="130" textAnchor="middle" fontSize="22" fill={ink}>曹操.md</text>
          <circle cx="330" cy="100" r="40" fill="none" stroke={okGreen} strokeWidth="6" /><path d="M358 128 l40 40" stroke={okGreen} strokeWidth="8" strokeLinecap="round" />
          <OkDot x={420} y={50} />
        </CheckPanel></In>
        <Step duration={STEP_MS}><CheckPanel label="2｜範圍" caption="回答有沒有超出筆記寫的？" alt="回答的一部分超出筆記範圍，打上問號">
          <rect x="30" y="30" width="250" height="160" fill={surface} stroke={faint} strokeWidth="2" />
          <text x="155" y="64" textAnchor="middle" fontSize="22" fill={quiet}>筆記寫的範圍</text>
          <rect x="70" y="90" width="170" height="70" fill={sage} stroke={okGreen} strokeWidth="2" />
          <text x="155" y="134" textAnchor="middle" fontSize="24" fill={ink}>赤壁交戰</text>
          <rect x="250" y="90" width="180" height="70" fill="#FFFFFF" stroke={amber} strokeWidth="3" strokeDasharray="10 8" />
          <text x="340" y="134" textAnchor="middle" fontSize="24" fill={amber}>多加的細節</text>
          <AskMark x={430} y={84} />
        </CheckPanel></Step>
        <Step duration={STEP_MS}><CheckPanel label="3｜誠實" caption="資料不夠時，有沒有說出來？" alt="AI 回答筆記裡找不到，打勾">
          <Bubble x={30} y={40} w={400} h={110} stroke={okGreen} />
          <text x="60" y="88" fontSize="26" fill={ink}>筆記裡找不到這件事，</text>
          <text x="60" y="126" fontSize="26" fill={ink}>我無法確認。</text>
          <OkDot x={420} y={50} />
        </CheckPanel></Step>
      </Steps>
    </div>
    <Steps><Step duration={STEP_MS}><p style={{ fontSize: 30, color: muted, marginTop: 36 }}>RAG 能減少瞎掰，但找錯卡或筆記本身寫錯，回答一樣會錯</p></Step></Steps>
  </Shell>
);

// ---------- 03 Agent 協作 ----------

const Section3: Page = () => <SectionPage chapter={3} label="03 / AGENT" lead="像帶實習生：先拍下現況，再請他補卡，最後比一比前後" />;

const PromptPage = ({ children, side }: { children: ReactNode; side: ReactNode }) => (
  <div style={{ display: 'grid', gridTemplateColumns: '1010px 1fr', gap: 52, marginTop: 36, alignItems: 'start' }}>
    <In i={0}>{children}</In>
    <div>{side}</div>
  </div>
);

// The short version of an exercise prompt, in the same three slots as deck 01:
// where to look, what to hand back, what not to do. The full text lives in prompts.md.
const SlotRow = ({ tag, children }: { tag: string; children: ReactNode }) => (
  <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', minHeight: 86 }}>
    <div style={{ background: amber, color: '#FFFFFF', fontSize: 28, fontWeight: 600, display: 'grid', placeItems: 'center' }}>{tag}</div>
    <div style={{ background: amberSoft, display: 'flex', alignItems: 'center', padding: '14px 26px', fontSize: 29, lineHeight: 1.4 }}>{children}</div>
  </div>
);

const PromptSlots = ({ full, children }: { full: string; children: ReactNode }) => (
  <div>
    <SmallLabel>提示詞重點</SmallLabel>
    <div style={{ display: 'grid', gap: 12, marginTop: 12 }}>{children}</div>
    <div style={{ background: '#FFFFFF', border: `1px solid ${rule}`, borderLeft: `5px solid ${amber}`, padding: '16px 24px', marginTop: 18, fontSize: 27 }}>完整版：在 Obsidian 打開 <Path size={26}>整理/練習提示詞.md</Path>，複製「{full}」整段</div>
  </div>
);

const Practice1: Page = () => (
  <Shell chapter={3}>
    <PracticeEyebrow time="5 分鐘">練習一｜畫出起點</PracticeEyebrow>
    <Heading>練習一：把 12 張卡畫成純文字關係圖</Heading>
    <Lead>像整理房間前先拍照：留下「之前」，等一下才比得出差別</Lead>
    <PromptPage side={
      <In i={1} style={{ background: '#FFFFFF', border: `1px solid ${rule}`, boxShadow: '0 10px 30px rgba(28,25,23,0.08)', padding: '18px 18px 16px' }}>
        <div style={{ background: '#202326', padding: '22px 24px', fontFamily: mono, fontSize: 25, lineHeight: 1.75, color: '#F5F5F4', whiteSpace: 'pre' }}>{'劉備 ─ 桃園結義 ─ 關羽\n劉備 ─ 桃園結義 ─ 張飛\n劉備 ─ 煮酒論英雄 ─ 曹操\n曹操 ─ 赤壁之戰 ─ 孫權'}<div style={{ color: '#BAB5B0', fontSize: 22, marginTop: 8 }}>來源：關係/桃園結義.md …</div></div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 14, fontSize: 24 }}><strong>擴充前（純文字圖）</strong><span style={{ color: quiet }}>示意</span></div>
      </In>
    }>
      <PromptSlots full="練習一">
        <SlotRow tag="範圍">〈三國演義〉和人物／勢力／關係，共 12 張卡</SlotRow>
        <SlotRow tag="產出">純文字關係圖＋連結清單，存成 整理/人物關係圖－擴充前.md</SlotRow>
        <SlotRow tag="限制">不改原檔；只用 [[連結]] 作線；新檔不加 dg-publish</SlotRow>
      </PromptSlots>
    </PromptPage>
  </Shell>
);

// The new cards wait in a diff preview until the learner says yes.
const DiffLine = ({ y, text }: { y: number; text: string }) => (
  <g><text x="40" y={y} fontSize="25" fontFamily={mono} fill={okGreen}>+ {text}</text></g>
);

const Practice2: Page = () => (
  <Shell chapter={3}>
    <PracticeEyebrow time="10 分鐘">練習二｜擴充故事</PracticeEyebrow>
    <Heading>練習二：請 Agent 照原文新增 4 張卡</Heading>
    <Lead>像實習生交稿：照附的原文寫，先給你看，你點頭才放進卡片盒</Lead>
    <PromptPage side={
      <Figure w={570} h={500} label="只讀原文資料夾的三份節選；4 張新卡先放在差異預覽，你確認後才寫入">
        <InG i={1}>
          <rect x="0" y="0" width="570" height="96" fill={surface} stroke={rule} strokeWidth="2" />
          <DocShape x={22} y={14} w={50} h={66} /><DocShape x={44} y={18} w={50} h={66} />
          <text x="116" y="44" fontSize="26" fill={ink}>原文/ 第 37、38、46 回節選</text>
          <text x="116" y="78" fontSize="24" fill={warn}>不上網，只讀這三份</text>
        </InG>
        <InG i={2}>
          <DownArrowSvg x={285} y1={104} y2={140} />
          <rect x="0" y="146" width="570" height="220" fill="#FFFFFF" stroke={okGreen} strokeWidth="2" strokeDasharray="10 8" />
          <text x="24" y="184" fontSize="24" fontWeight="600" fill={okGreen}>差異預覽：還沒寫入</text>
          <DiffLine y={226} text="人物/諸葛亮.md" />
          <DiffLine y={262} text="人物/周瑜.md" />
          <DiffLine y={298} text="關係/三顧茅廬.md" />
          <DiffLine y={334} text="關係/草船借箭.md" />
        </InG>
        <InG i={3}>
          <DownArrowSvg x={285} y1={374} y2={410} color={amber} />
          <rect x="0" y="416" width="570" height="80" fill={amberSoft} stroke={amber} strokeWidth="2" />
          <text x="24" y="466" fontSize="28" fontWeight="600" fill={ink}>你看過來源和連結，才說「寫入」</text>
        </InG>
      </Figure>
    }>
      <PromptSlots full="練習二">
        <SlotRow tag="範圍">事實只取自 <Path size={27}>原文/</Path> 三份節選；可以讀舊卡來接連結</SlotRow>
        <SlotRow tag="產出">4 張新卡：諸葛亮、周瑜、三顧茅廬、草船借箭</SlotRow>
        <SlotRow tag="限制">舊卡不覆寫，先看差異；節選沒寫到的標「待確認」；不加 dg-publish</SlotRow>
      </PromptSlots>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 16, fontSize: 27, color: amber, fontWeight: 600 }}><span style={{ fontSize: 30 }}>⚠</span>如果 Codex 問「能不能寫檔」：先看過差異再允許；沒問的話，寫完回 Obsidian 看新卡</div>
    </PromptPage>
  </Shell>
);

// A chapter-ordered timeline: event cards hang off an axis of novel chapters.
const TimeTick = ({ x, n, label, fresh = false }: { x: number; n: string; label: string; fresh?: boolean }) => (
  <g>
    <circle cx={x} cy="60" r="10" fill={fresh ? okGreen : amber} />
    <text x={x} y="34" textAnchor="middle" fontSize="23" fill={fresh ? okGreen : amber}>{n}</text>
    <text x={x} y="100" textAnchor="middle" fontSize="23" fontWeight={fresh ? 600 : 400} fill={ink}>{label}</text>
  </g>
);

const Practice3: Page = () => (
  <Shell chapter={3}>
    <PracticeEyebrow time="8 分鐘">練習三｜再畫一次</PracticeEyebrow>
    <Heading>練習三：重畫關係圖，再按回目排時間線</Heading>
    <Lead>用同一把尺再量一次：畫法一樣，才看得出多了什麼</Lead>
    <PromptPage side={
      <div style={{ display: 'grid', gap: 22 }}>
        <In i={1} style={{ background: '#FFFFFF', border: `1px solid ${rule}`, padding: '16px 20px' }}>
          <SmallLabel>擴充後關係圖</SmallLabel>
          <Figure w={528} h={170} label="擴充後的局部關係圖：劉備經三顧茅廬連到諸葛亮，諸葛亮經草船借箭連到周瑜" style={{ marginTop: 8 }}>
            <g fill="none" strokeWidth="3"><path d="M60 50 L150 130" stroke={amber} /><path d="M264 50 L150 130" stroke={okGreen} /><path d="M264 50 L376 130" stroke={okGreen} /><path d="M470 50 L376 130" stroke={okGreen} /></g>
            <Person x={60} y={44} name="劉備" r={34} size={24} />
            <Person x={264} y={44} name="諸葛亮" r={40} size={22} fill={sage} stroke={okGreen} />
            <Person x={470} y={44} name="周瑜" r={34} size={24} fill={sage} stroke={okGreen} />
            <RelBox cx={150} y={112} w={170} label="三顧茅廬" size={24} />
            <RelBox cx={376} y={112} w={170} label="草船借箭" size={24} />
          </Figure>
        </In>
        <In i={2} style={{ background: '#FFFFFF', border: `1px solid ${rule}`, padding: '16px 20px' }}>
          <SmallLabel>故事時間線｜依小說回目</SmallLabel>
          <Figure w={528} h={118} label="時間線依回目：第 1 回桃園、第 21 回煮酒、第 37–38 回三顧、第 46 回草船、第 49–50 回赤壁" style={{ marginTop: 6 }}>
            <line x1="10" y1="60" x2="518" y2="60" stroke={faint} strokeWidth="3" />
            <TimeTick x={36} n="1" label="桃園" />
            <TimeTick x={146} n="21" label="煮酒" />
            <TimeTick x={262} n="37–38" label="三顧" fresh />
            <TimeTick x={376} n="46" label="草船" fresh />
            <TimeTick x={486} n="49–50" label="赤壁" />
          </Figure>
        </In>
      </div>
    }>
      <PromptSlots full="練習三">
        <SlotRow tag="範圍">全部人物卡和關係卡，含剛加的 4 張</SlotRow>
        <SlotRow tag="產出">整理/ 裡的〈人物關係圖－擴充後〉＋〈故事時間線〉</SlotRow>
        <SlotRow tag="限制">同一套畫法；照回目排，不寫成年份；不加 dg-publish</SlotRow>
      </PromptSlots>
    </PromptPage>
  </Shell>
);

// One map, grown: the original cards stay put, the four new cards branch off them.
const GrowthCompare: Page = () => (
  <Shell chapter={3}>
    <Eyebrow>前後對照</Eyebrow>
    <Heading>擴充前後：同一張圖接出 4 張新卡</Heading>
    <Lead>像植物長新枝：舊枝不動，新卡從旁邊接出去</Lead>
    <div style={{ marginTop: 30, background: '#FFFFFF', border: `1px solid ${rule}` }}>
      <Stage h={520}>
        <Steps>
          <Layer h={520} label="擴充前：五位人物和三張關係卡">
            <text x="1600" y="40" textAnchor="end" fontSize="24" fill={amber}>擴充前：原本 12 張（局部）</text>
            <g fill="none" stroke={amber} strokeWidth="4">
              <DrawPath i={2} d="M130 120 L270 236" /><DrawPath i={2} d="M310 126 L310 236" /><DrawPath i={2} d="M540 122 L350 236" />
              <DrawPath i={2} d="M590 122 L740 236" /><DrawPath i={2} d="M950 122 L800 236" />
              <DrawPath i={2} d="M1000 122 L1090 236" /><DrawPath i={2} d="M1250 122 L1150 236" />
            </g>
            <InG i={0}><Person x={110} y={86} name="關羽" /></InG>
            <InG i={0}><Person x={310} y={86} name="張飛" /></InG>
            <InG i={0}><Person x={565} y={86} name="劉備" /></InG>
            <InG i={0}><Person x={975} y={86} name="曹操" /></InG>
            <InG i={0}><Person x={1270} y={86} name="孫權" /></InG>
            <InG i={1}><RelBox cx={310} y={236} w={220} label="桃園結義" fill={amberSoft} stroke={amber} /></InG>
            <InG i={1}><RelBox cx={770} y={236} w={240} label="煮酒論英雄" fill={amberSoft} stroke={amber} /></InG>
            <InG i={1}><RelBox cx={1120} y={236} w={220} label="赤壁之戰" fill={amberSoft} stroke={amber} /></InG>
          </Layer>
          <Step duration={STEP_MS}><Layer h={520} label="擴充後：劉備經三顧茅廬連到諸葛亮，諸葛亮經草船借箭連到周瑜">
            <text x="1600" y="76" textAnchor="end" fontSize="24" fontWeight="600" fill={okGreen}>擴充後：新增 4 張</text>
            <g fill="none" stroke={okGreen} strokeWidth="5">
              <StepPath d="M565 132 V384" />
              <StepPath d="M675 416 L800 448" i={1} />
              <StepPath d="M888 450 L1030 416" i={2} />
              <StepPath d="M1250 416 L1394 448" i={3} />
            </g>
            <g className="okg-build" style={buildDelay(2)}><RelBox cx={565} y={384} w={220} label="三顧茅廬" /><text x="565" y="478" textAnchor="middle" fontSize="23" fill={quiet}>第 37–38 回</text></g>
            <g className="okg-build" style={buildDelay(3)}><Person x={842} y={452} name="諸葛亮" fill={sage} stroke={okGreen} size={27} /></g>
            <g className="okg-build" style={buildDelay(4)}><RelBox cx={1140} y={384} w={220} label="草船借箭" /><text x="1140" y="478" textAnchor="middle" fontSize="23" fill={quiet}>第 46 回</text></g>
            <g className="okg-build" style={buildDelay(5)}><Person x={1440} y={452} name="周瑜" fill={sage} stroke={okGreen} /></g>
          </Layer></Step>
        </Steps>
      </Stage>
    </div>
    <Steps><Step duration={STEP_MS}><p style={{ fontSize: 28, color: muted, marginTop: 20 }}>多了一條擴充前走不到的路：劉備 → 三顧茅廬 → 諸葛亮 → 草船借箭 → 周瑜</p></Step></Steps>
  </Shell>
);

// An acceptance sheet: what to check, how to check it, and a small picture of each.
const ACCEPT_COLS = '170px 1fr 560px';

const AcceptRow = ({ icon, check, how }: { icon: ReactNode; check: string; how: string }) => (
  <div style={{ display: 'grid', gridTemplateColumns: ACCEPT_COLS, alignItems: 'center', minHeight: 150, borderBottom: `1px solid ${rule}` }}>
    <svg viewBox="0 0 140 90" style={{ width: 140, height: 90 }} aria-hidden="true">{icon}</svg>
    <span style={{ fontSize: 32, fontWeight: 600, lineHeight: 1.4, paddingRight: 32 }}>{check}</span>
    <span style={{ fontSize: 28, color: muted, lineHeight: 1.45 }}>{how}</span>
  </div>
);

const CheckAgentWork: Page = () => (
  <Shell chapter={3}>
    <Eyebrow>人工驗收</Eyebrow>
    <Heading>驗收新卡：數量、連結、回目、dg-publish</Heading>
    <Lead>像驗收裝潢：數數量、試開關、量尺寸</Lead>
    <div style={{ display: 'grid', gridTemplateColumns: ACCEPT_COLS, marginTop: 30, paddingBottom: 12, borderBottom: `2px solid ${ink}` }}>
      <span /><SmallLabel>檢查什麼</SmallLabel><SmallLabel>怎麼看</SmallLabel>
    </div>
    <Steps>
      <In i={0}><AcceptRow check="原本 12 張還在？新的 4 張有來源？" how="數檔案；打開新卡，看回目和節選檔名" icon={<g>
        {[0, 1, 2, 3].map(r => [0, 1, 2].map(c => <rect key={`${r}${c}`} x={6 + c * 22} y={4 + r * 21} width="16" height="16" fill={surface} stroke={faint} strokeWidth="2" />))}
        {[0, 1, 2, 3].map(r => <rect key={r} x={84} y={4 + r * 21} width="16" height="16" fill={sage} stroke={okGreen} strokeWidth="2" />)}
        <text x="108" y="50" fontSize="22" fill={okGreen}>+4</text>
      </g>} /></In>
      <Step duration={STEP_MS}><AcceptRow check="前後兩張圖畫法一樣？新線點得開？" how="在 Obsidian 點每一條新連結，目標卡要存在" icon={<g>
        <g fill="none" stroke={amber} strokeWidth="2.5"><path d="M14 20 L32 60 L50 20" /></g><circle cx="14" cy="18" r="8" fill={amberSoft} stroke={amber} strokeWidth="2" /><circle cx="50" cy="18" r="8" fill={amberSoft} stroke={amber} strokeWidth="2" /><rect x="25" y="56" width="14" height="14" fill={sage} stroke={okGreen} strokeWidth="2" />
        <text x="70" y="52" textAnchor="middle" fontSize="26" fill={muted}>=</text>
        <g fill="none" stroke={okGreen} strokeWidth="2.5"><path d="M90 20 L108 60 L126 20" /></g><circle cx="90" cy="18" r="8" fill={sage} stroke={okGreen} strokeWidth="2" /><circle cx="126" cy="18" r="8" fill={sage} stroke={okGreen} strokeWidth="2" /><rect x="101" y="56" width="14" height="14" fill={sage} stroke={okGreen} strokeWidth="2" />
      </g>} /></Step>
      <Step duration={STEP_MS}><AcceptRow check="時間線照小說回目排，沒寫成歷史年份？" how="對照第 1、21、37–38、46、49–50 回" icon={<g>
        <line x1="6" y1="40" x2="134" y2="40" stroke={faint} strokeWidth="3" />
        <circle cx="20" cy="40" r="6" fill={amber} /><circle cx="60" cy="40" r="6" fill={amber} /><circle cx="100" cy="40" r="6" fill={okGreen} />
        <text x="60" y="24" textAnchor="middle" fontSize="22" fill={amber}>第 N 回</text>
        <text x="70" y="80" textAnchor="middle" fontSize="22" fill={quiet}>西元年</text><line x1="36" y1="72" x2="104" y2="72" stroke={warn} strokeWidth="3" />
      </g>} /></Step>
    </Steps>
    <Steps><Step duration={STEP_MS}><p style={{ fontSize: 26, color: quiet, marginTop: 22 }}>也要看：草船借箭和赤壁之戰有沒有被硬寫成同一件事</p></Step></Steps>
  </Shell>
);

// ---------- 04 建立知識庫 ----------

const Section4: Page = () => <SectionPage chapter={4} label="04 / 導覽" lead="卡、圖和時間線都有了；接下來做一張首頁，讓讀者知道從哪裡開始、怎麼找回來源" />;



// Library picture, built bottom-up: shelves of source cards, a wall map, a desk with rules.
const Pile = ({ x, label, count, fresh = 0 }: { x: number; label: string; count: number; fresh?: number }) => (
  <g>
    <rect x={x + 16} y="300" width="260" height="120" fill={surface} stroke={faint} strokeWidth="2" />
    <rect x={x + 8} y="310" width="260" height="120" fill="#FFFFFF" stroke={faint} strokeWidth="2" />
    <rect x={x} y="320" width="260" height="120" fill={amberSoft} stroke={amber} strokeWidth="2" />
    <text x={x + 24} y="370" fontSize="32" fontWeight="600" fill={ink}>{label}</text>
    <text x={x + 24} y="414" fontSize="25" fill={muted}>{count} 張{fresh ? <tspan fill={okGreen} fontWeight="600">＋新 {fresh}</tspan> : null}</text>
  </g>
);

// Library picture: the shelf of source cards first, then the wall maps that point into it.
const KnowledgeLayers: Page = () => (
  <Shell chapter={4}>
    <Eyebrow>整理方法</Eyebrow>
    <Heading>來源卡和導覽頁</Heading>
    <Lead>像圖書館：書架上放原書，牆上掛館內地圖，告訴你該去哪一架</Lead>
    <div style={{ marginTop: 36 }}>
      <Stage h={460}>
        <Steps>
          <Layer h={460} label="書架：來源卡，入口 1 張、人物 5 加新 2、勢力 3、關係 3 加新 2">
            <InG i={0}><text x="0" y="280" fontSize="30" fontWeight="600" fill={ink}>書架｜來源卡</text><text x="230" y="280" fontSize="26" fill={muted}>一張一個主題，留著出處</text></InG>
            <InG i={1}><Pile x={60} label="入口" count={1} /></InG>
            <InG i={2}><Pile x={460} label="人物" count={5} fresh={2} /></InG>
            <InG i={3}><Pile x={860} label="勢力" count={3} /></InG>
            <InG i={4}><Pile x={1260} label="關係" count={3} fresh={2} /></InG>
          </Layer>
          <Step duration={STEP_MS}><Layer h={460} label="牆上的地圖：導覽頁，關係圖和時間線，都連回書架上的卡">
            <g className="okg-build" style={buildDelay(0)}>
              <text x="0" y="30" fontSize="30" fontWeight="600" fill={ink}>牆上｜導覽頁</text><text x="230" y="30" fontSize="26" fill={muted}>同一批卡，兩種讀法</text>
              <rect x="420" y="56" width="400" height="150" fill="#FFFFFF" stroke={ink} strokeWidth="3" />
              <g fill="none" stroke={amber} strokeWidth="3"><path d="M480 100 L560 160 L640 100 L720 160 L780 100" /></g>
              <circle cx="480" cy="100" r="12" fill={amberSoft} stroke={amber} strokeWidth="2" /><circle cx="640" cy="100" r="12" fill={amberSoft} stroke={amber} strokeWidth="2" /><circle cx="780" cy="100" r="12" fill={sage} stroke={okGreen} strokeWidth="2" />
              <text x="620" y="236" textAnchor="middle" fontSize="26" fill={ink}>關係圖：誰連到誰</text>
            </g>
            <g className="okg-build" style={buildDelay(1)}>
              <rect x="960" y="56" width="460" height="150" fill="#FFFFFF" stroke={ink} strokeWidth="3" />
              <line x1="990" y1="130" x2="1390" y2="130" stroke={faint} strokeWidth="3" />
              <circle cx="1020" cy="130" r="9" fill={amber} /><circle cx="1120" cy="130" r="9" fill={amber} /><circle cx="1220" cy="130" r="9" fill={okGreen} /><circle cx="1300" cy="130" r="9" fill={okGreen} /><circle cx="1370" cy="130" r="9" fill={amber} />
              <text x="1190" y="236" textAnchor="middle" fontSize="26" fill={ink}>時間線：哪件事先</text>
            </g>
                      </Layer></Step>
        </Steps>
      </Stage>
    </div>
    <p style={{ fontSize: 28, color: muted, marginTop: 10 }}>地圖只負責指路；要查證，還是走到書架上的那張卡</p>
  </Shell>
);

// One source card, reached two ways: across the map, or along the timeline.
const TwoWays: Page = () => (
  <Shell chapter={4}>
    <Eyebrow>兩種讀法</Eyebrow>
    <Heading>兩種找法：按人物關係、按小說回目</Heading>
    <Lead>像找教室：可以看樓層平面圖，也可以照課表的時間找；最後都走到同一間</Lead>
    <div style={{ marginTop: 40 }}>
      <Stage h={470}>
        <Steps>
          <Layer h={470} label="中間是來源卡：關係/三顧茅廬.md，記人物和回目">
            <InG i={0}>
              <DocShape x={600} y={70} w={432} h={320} fill={amberSoft} stroke={amber} sw={3} />
              <text x="630" y="122" fontSize="24" fill={amber}>來源卡</text>
              <text x="630" y="178" fontSize="36" fontWeight="600" fill={ink}>三顧茅廬</text>
              <text x="630" y="240" fontSize="26" fill={ink}>人物：<tspan fill={link}>劉備</tspan>、<tspan fill={link}>諸葛亮</tspan></text>
              <text x="630" y="290" fontSize="26" fill={ink}>回目：第 37–38 回</text>
              <text x="630" y="340" fontSize="24" fill={quiet}>來源：原文/第037回節選.txt</text>
            </InG>
          </Layer>
          <Step duration={STEP_MS}><Layer h={470} label="從關係圖：劉備連到三顧茅廬，再連到諸葛亮">
            <g className="okg-build" style={buildDelay(0)}>
              <text x="0" y="40" fontSize="30" fontWeight="600" fill={ink}>從關係圖找</text>
              <text x="0" y="80" fontSize="25" fill={muted}>誰和誰有關？</text>
              <Person x={90} y={210} name="劉備" />
              <Person x={410} y={330} name="諸葛亮" fill={sage} stroke={okGreen} size={27} />
              <RelBox cx={330} y={180} w={200} label="三顧茅廬" />
            </g>
            <g fill="none" stroke={okGreen} strokeWidth="4"><StepPath d="M136 210 H230" i={1} /><StepPath d="M330 244 L380 288" i={2} /></g>
            <g fill="none" stroke={amber} strokeWidth="4" strokeDasharray="10 8"><path d="M436 212 H586" /></g>
            <g className="okg-build" style={buildDelay(3)}><polygon points="598,212 582,203 582,221" fill={amber} /></g>
          </Layer></Step>
          <Step duration={STEP_MS}><Layer h={470} label="從時間線：第 21 回煮酒、第 37–38 回三顧、第 46 回草船">
            <g className="okg-build" style={buildDelay(0)}>
              <text x="1100" y="40" fontSize="30" fontWeight="600" fill={ink}>從時間線找</text>
              <text x="1100" y="80" fontSize="25" fill={muted}>哪件事先發生？</text>
              <line x1="1110" y1="230" x2="1620" y2="230" stroke={faint} strokeWidth="3" />
              <TimeAt x={1160} n="21 回" label="煮酒" />
              <TimeAt x={1380} n="37–38 回" label="三顧" hot />
              <TimeAt x={1580} n="46 回" label="草船" />
            </g>
            <g fill="none" stroke={amber} strokeWidth="4" strokeDasharray="10 8"><path d="M1380 168 C1380 100 1200 100 1046 156" /></g>
            <g className="okg-build" style={buildDelay(2)}><polygon points="1034,160 1050,148 1052,166" fill={amber} /></g>
          </Layer></Step>
        </Steps>
      </Stage>
    </div>
    <Steps><Step duration={STEP_MS}><p style={{ fontSize: 28, color: muted, marginTop: 12 }}>圖和時間線幫忙找路；答案還是要回到來源卡和小說回目</p></Step></Steps>
  </Shell>
);

const TimeAt = ({ x, n, label, hot = false }: { x: number; n: string; label: string; hot?: boolean }) => (
  <g>
    <circle cx={x} cy="230" r={hot ? 16 : 11} fill={hot ? amber : faint} />
    <text x={x} y="196" textAnchor="middle" fontSize="23" fill={hot ? amber : quiet}>{n}</text>
    <text x={x} y="276" textAnchor="middle" fontSize="27" fontWeight={hot ? 600 : 400} fill={ink}>{label}</text>
  </g>
);

// The home page the learner builds: two signposts, one example each.
const Signpost = ({ y, label, target, example }: { y: number; label: string; target: string; example: string }) => (
  <g>
    <path d={`M30 ${y} H440 L480 ${y + 40} L440 ${y + 80} H30 Z`} fill={amberSoft} stroke={amber} strokeWidth="2" />
    <text x="54" y={y + 36} fontSize="27" fontWeight="600" fill={ink}>{label}</text>
    <text x="54" y={y + 68} fontSize="23" fill={link}>[[{target}]]</text>
    <text x="54" y={y + 116} fontSize="23" fill={muted}>{example}</text>
  </g>
);

const HomePagePractice: Page = () => (
  <Shell chapter={4}>
    <PracticeEyebrow time="5 分鐘">導覽頁練習</PracticeEyebrow>
    <Heading>練習：做導覽頁，並從〈三國演義〉連過去</Heading>
    <Lead>像校門口的導覽圖：先告訴人可以往哪兩個方向走</Lead>
    <PromptPage side={
      <Figure w={570} h={480} label="知識庫導覽.md：兩個路標，從人物看關係、按故事順序看">
        <InG i={1}><DocShape x={0} y={0} w={570} h={470} /><text x="30" y="52" fontSize="28" fontWeight="600" fill={ink}>知識庫導覽.md</text><line x1="30" y1="76" x2="520" y2="76" stroke={rule} strokeWidth="2" /></InG>
        <InG i={2}><Signpost y={104} label="從人物看關係" target="人物關係圖－擴充後" example="例：劉備 → 三顧茅廬 → 諸葛亮" /></InG>
        <InG i={3}><Signpost y={270} label="按故事順序看" target="故事時間線" example="例：第 37–38 回在第 46 回之前" /></InG>
        <InG i={4}><text x="30" y="440" fontSize="24" fill={amber}>沒核對的卡標「待確認」</text></InG>
      </Figure>
    }>
      <PromptSlots full="導覽頁練習">
        <SlotRow tag="範圍">擴充後關係圖、故事時間線和來源卡</SlotRow>
        <SlotRow tag="產出">整理/知識庫導覽.md：兩條路，各附一個例子</SlotRow>
        <SlotRow tag="限制">不改來源卡；沒核對的標「待確認」；不加 dg-publish</SlotRow>
      </PromptSlots>
    </PromptPage>
  </Shell>
);

// ---------- 05 發布到網站 ----------

const Section5: Page = () => <SectionPage chapter={5} label="05 / 發布" lead="從這裡開始，內容會公開到網路上：先挑要分享的卡，再交給 Digital Garden 變成網站" />;

const TickBox = ({ x, y, on }: { x: number; y: number; on: boolean }) => (
  <g><rect x={x} y={y} width="26" height="26" fill="#FFFFFF" stroke={on ? okGreen : faint} strokeWidth="3" />{on ? <TickMark x={x + 13} y={y + 14} size={18} /> : null}</g>
);

const FlowCard = ({ x, y, name, on }: { x: number; y: number; name: string; on: boolean }) => (
  <g><rect x={x} y={y} width="190" height="50" fill="#FFFFFF" stroke={on ? amber : rule} strokeWidth="2" strokeDasharray={on ? undefined : '8 6'} /><TickBox x={x + 12} y={y + 12} on={on} /><text x={x + 52} y={y + 34} fontSize="25" fill={on ? ink : quiet}>{name}</text></g>
);

const FlowStation = ({ x, kicker, name, fill }: { x: number; kicker: string; name: string; fill: string }) => (
  <g>
    <rect x={x} y="0" width="330" height="340" fill={fill} />
    <rect x={x} y="0" width="330" height="5" fill={amber} />
    <text x={x + 26} y="46" fontSize="24" fontWeight="600" fill={amber}>{kicker}</text>
    <text x={x + 26} y="92" fontSize="34" fontWeight="600" fill={ink}>{name}</text>
  </g>
);

// A conveyor of four stations. Only ticked cards make it past the second one.
const PublishFlow: Page = () => (
  <Shell chapter={5}>
    <Eyebrow>網站路線</Eyebrow>
    <Heading>發布路線：筆記經過四站變成網址</Heading>
    <Lead>像寄出作品集：挑好作品、裝箱存放，再擺上展示櫃</Lead>
    <div style={{ marginTop: 36 }}>
      <Stage h={420}>
        <Steps>
          <Layer h={420} label="寫稿：在 Obsidian 寫筆記，兩張打勾、一張草稿沒勾">
            <InG i={0}><FlowStation x={0} kicker="寫稿" name="Obsidian" fill={linkSoft} /></InG>
            <InG i={1}><FlowCard x={26} y={130} name="劉備" on /><FlowCard x={26} y={196} name="曹操" on /><FlowCard x={26} y={262} name="我的草稿" on={false} /></InG>
          </Layer>
          <Step duration={STEP_MS}><Layer h={420} label="挑稿：Digital Garden 只收打勾的卡">
            <MapArrow x1={338} x2={426} y={170} hot />
            <FlowStation x={434} kicker="挑稿" name="Digital Garden" fill={amberSoft} />
            <g className="okg-build" style={buildDelay(0)}>
              <path d="M470 130 H730 L650 220 V300 H550 V220 Z" fill="#FFFFFF" stroke={amber} strokeWidth="2" />
              <text x="600" y="176" textAnchor="middle" fontSize="25" fill={ink}>只收打勾的</text>
              <TickBox x={587} y={234} on />
            </g>
            <g className="okg-build" style={buildDelay(1)}><text x="600" y="400" textAnchor="middle" fontSize="24" fill={warn}>沒勾的草稿留在電腦裡</text></g>
          </Layer></Step>
          <Step duration={STEP_MS}><Layer h={420} label="存檔：GitHub 存一份公開版本">
            <MapArrow x1={772} x2={860} y={170} hot />
            <FlowStation x={868} kicker="存檔" name="GitHub" fill={surface} />
            <g className="okg-build" style={buildDelay(0)}>
              <path d="M920 180 L1033 140 L1146 180 V300 H920 Z" fill="#FFFFFF" stroke={faint} strokeWidth="3" strokeLinejoin="round" />
              <path d="M920 180 L1033 220 L1146 180 M1033 220 V300" fill="none" stroke={faint} strokeWidth="3" />
              <text x="1033" y="400" textAnchor="middle" fontSize="24" fill={muted}>存一份公開版本</text>
            </g>
          </Layer></Step>
          <Step duration={STEP_MS}><Layer h={420} label="上架：Vercel 把它變成一個網址">
            <MapArrow x1={1206} x2={1294} y={170} hot />
            <FlowStation x={1302} kicker="上架" name="Vercel" fill={sage} />
            <g className="okg-build" style={buildDelay(0)}>
              <BrowserFrame x={1326} y={130} w={282} h={180} url="….vercel.app" />
              <g stroke={link} strokeWidth="5"><path d="M1350 222 H1500" /><path d="M1350 254 H1460" /></g>
              <text x="1467" y="400" textAnchor="middle" fontSize="24" fill={muted}>變成一個網址</text>
            </g>
          </Layer></Step>
        </Steps>
      </Stage>
    </div>
    <Steps><Step duration={STEP_MS}><div>
      <p style={{ fontSize: 30, color: muted, margin: '20px 0 0' }}>沒打勾的筆記不會上網站；整個筆記庫不會被公開</p>
      <div style={{ background: amberSoft, borderLeft: `5px solid ${amber}`, padding: '14px 24px', fontSize: 27, marginTop: 14 }}>課前先註冊好：GitHub、Vercel 免費帳號（Vercel 可以直接用 GitHub 登入）</div>
    </div></Step></Steps>
  </Shell>
);

// Guided tour over a mock-up: each click outlines one part and shows its caption.
const TourStep = ({ n, title, detail, ring }: { n: number; title: string; detail: ReactNode; ring: [number, number, number, number] }) => (
  <div>
    <Callout n={n} title={title} detail={detail} />
    <div style={{ position: 'absolute', left: ring[0], top: ring[1], width: ring[2], height: ring[3], border: '4px solid #E9B650', boxSizing: 'border-box' }} />
    <span style={{ position: 'absolute', left: ring[0] - 22, top: ring[1] - 22, width: 44, height: 44, borderRadius: 22, background: amber, color: '#FFFFFF', display: 'grid', placeItems: 'center', fontSize: 24, fontWeight: 600, boxShadow: '0 0 0 4px #FFFFFF' }}>{n}</span>
  </div>
);

const SetRow = ({ children, hot = false }: { children: ReactNode; hot?: boolean }) => (
  <div style={{ padding: '8px 22px', fontSize: 25, background: hot ? '#E7E5E4' : undefined, fontWeight: hot ? 600 : 400 }}>{children}</div>
);

const UiButton = ({ children, dark = false }: { children: ReactNode; dark?: boolean }) => (
  <span style={{ display: 'inline-block', padding: '8px 22px', background: dark ? link : '#FFFFFF', color: dark ? '#FFFFFF' : ink, border: `1px solid ${dark ? link : rule}`, borderRadius: 6, fontSize: 24 }}>{children}</span>
);

const InstallPlugin: Page = () => (
  <Shell chapter={5}>
    <Eyebrow>第一次設定 1／4</Eyebrow>
    <Heading>安裝 Digital Garden 外掛</Heading>
    <Lead>像在手機裝 App：打開商店、搜尋、安裝，再打開</Lead>
    <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: '1000px 1fr', gap: 56, marginTop: 36 }}>
      <In i={0} style={{ height: 470, border: `1px solid ${rule}`, background: '#FFFFFF', display: 'grid', gridTemplateColumns: '300px 1fr', boxShadow: '0 10px 30px rgba(28,25,23,0.08)' }}>
        <div style={{ background: surface, borderRight: `1px solid ${rule}`, paddingTop: 18 }}>
          <div style={{ padding: '0 22px 10px', fontSize: 22, color: quiet }}>設定｜介面示意</div>
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
      <div style={{ display: 'grid', alignContent: 'start', gap: 30, paddingTop: 10 }}>
        <Steps>
          <Step duration={STEP_MS}><TourStep n={1} title="設定 → 第三方外掛程式" detail="左下角齒輪進設定" ring={[4, 374, 296, 56]} /></Step>
          <Step duration={STEP_MS}><TourStep n={2} title="關閉受限模式，按「瀏覽」" detail="瀏覽的是社群外掛程式" ring={[860, 92, 132, 60]} /></Step>
          <Step duration={STEP_MS}><TourStep n={3} title="搜尋 Digital Garden → 安裝 → 啟用" detail="裝在目前這個筆記庫" ring={[316, 200, 668, 170]} /></Step>
        </Steps>
      </div>
    </div>
    <In i={2} style={{ background: amberSoft, borderLeft: `5px solid ${amber}`, marginTop: 26, padding: '16px 24px', fontSize: 27 }}>完成檢查：「已安裝外掛程式」裡看得到 Digital Garden，開關是開的</In>
  </Shell>
);

// One button makes two things: a repo on GitHub and a site on Vercel.
// The Vercel screens the learner will see after pressing the button, drawn simply.
const WizardPane = ({ x, n, title, children }: { x: number; n: number; title: string; children: ReactNode }) => (
  <g>
    <rect x={x} y="40" width="400" height="330" fill="#FFFFFF" stroke={rule} strokeWidth="2" />
    <rect x={x} y="40" width="400" height="52" fill="#111111" />
    <text x={x + 20} y="75" fontSize="22" fill="#FFFFFF">▲ Vercel</text>
    <SvgNum x={x} y={40} n={n} />
    <text x={x + 24} y="138" fontSize="27" fontWeight="600" fill={ink}>{title}</text>
    {children}
  </g>
);

const DeploySite: Page = () => (
  <Shell chapter={5}>
    <Eyebrow>第一次設定 2／4</Eyebrow>
    <Heading>按 Deploy to Vercel，建立你的網站</Heading>
    <Lead>像照樣板開一間新店：按一個按鈕，GitHub 放檔案，Vercel 開門營業</Lead>
    <div style={{ marginTop: 34 }}>
      <Stage h={470}>
        <Steps>
          <Layer h={470} label="Digital Garden 官方入門頁的 Deploy to Vercel 按鈕">
            <InG i={0}>
              <DocShape x={0} y={40} w={330} h={330} fill={surface} />
              <text x="26" y="96" fontSize="24" fill={quiet}>官方入門頁</text>
              <text x="26" y="146" fontSize="30" fontWeight="600" fill={ink}>Digital Garden</text>
              <text x="26" y="186" fontSize="30" fontWeight="600" fill={ink}>範本</text>
              <rect x="26" y="240" width="278" height="62" rx="6" fill="#111111" />
              <text x="165" y="281" textAnchor="middle" fontSize="25" fontWeight="600" fill="#FFFFFF">▲ Deploy to Vercel</text>
            </InG>
            <PopG i={2}><SvgNum x={0} y={40} n={1} /></PopG>
          </Layer>
          <Step duration={STEP_MS}><Layer h={470} label="Vercel 第一個畫面：用 GitHub 登入，填 Repository Name，按 Create">
            <MapArrow x1={340} x2={400} y={205} hot />
            <g className="okg-build" style={buildDelay(0)}><WizardPane x={420} n={2} title="Create Git Repository">
              <text x="444" y="184" fontSize="23" fill={muted}>Git Scope：你的 GitHub 帳號</text>
              <text x="444" y="234" fontSize="23" fill={muted}>Repository Name</text>
              <rect x="444" y="248" width="352" height="44" fill="#FFFFFF" stroke={faint} strokeWidth="2" /><text x="460" y="278" fontSize="23" fontFamily={mono} fill={ink}>my-garden</text>
              <rect x="644" y="312" width="152" height="44" rx="6" fill="#111111" /><text x="720" y="342" textAnchor="middle" fontSize="23" fill="#FFFFFF">Create</text>
            </WizardPane></g>
          </Layer></Step>
          <Step duration={STEP_MS}><Layer h={470} label="Vercel 第二個畫面：部署完成，出現網址">
            <MapArrow x1={830} x2={890} y={205} hot />
            <g className="okg-build" style={buildDelay(0)}><WizardPane x={910} n={3} title="部署完成">
              <text x="934" y="184" fontSize="23" fill={muted}>等 1–2 分鐘，看到</text>
              <text x="934" y="226" fontSize="30" fontWeight="600" fill={okGreen}>Congratulations!</text>
              <rect x="934" y="260" width="352" height="44" rx="22" fill={sage} /><text x="954" y="290" fontSize="22" fontFamily={mono} fill={ink}>my-garden-….vercel.app</text>
            </WizardPane></g>
          </Layer></Step>
          <Step duration={STEP_MS}><Layer h={470} label="記下 repo 名稱和網站網址">
            <g className="okg-build" style={buildDelay(0)}>
              <path d="M1352 70 H1632 V330 L1592 370 H1352 Z" fill="#F6E7A9" stroke="#C9A93E" strokeWidth="2" />
              <SvgNum x={1352} y={70} n={4} />
              <text x="1378" y="124" fontSize="28" fontWeight="600" fill={ink}>記下來</text>
              <text x="1378" y="186" fontSize="25" fill={ink}>repo 名稱：</text>
              <line x1="1378" y1="226" x2="1606" y2="226" stroke="#C9A93E" strokeWidth="2" strokeDasharray="6 6" />
              <text x="1378" y="278" fontSize="25" fill={ink}>網站網址：</text>
              <line x1="1378" y1="318" x2="1606" y2="318" stroke="#C9A93E" strokeWidth="2" strokeDasharray="6 6" />
            </g>
          </Layer></Step>
        </Steps>
      </Stage>
    </div>
    <p style={{ fontSize: 26, color: amber, marginTop: 4 }}>官方入口：docs.forestry.md/getting-started/01-getting-started/<span style={{ color: quiet }}>　｜Vercel 畫面為示意，依版本可能不同</span></p>
  </Shell>
);

// GitHub's fine-grained token form, drawn simply, with the four places to touch.
const FormRow = ({ y, label, children }: { y: number; label: string; children: ReactNode }) => (
  <g>
    <text x="30" y={y} fontSize="24" fontWeight="600" fill={ink}>{label}</text>
    {children}
  </g>
);

const CreateToken: Page = () => (
  <Shell chapter={5}>
    <Eyebrow>第一次設定 3／4</Eyebrow>
    <Heading>建立 GitHub token：只授權網站 repo</Heading>
    <Lead>像打一把備用鑰匙：只開網站 repo 這一扇門，還要記得鑰匙哪天到期</Lead>
    <div style={{ display: 'grid', gridTemplateColumns: '860px 1fr', gap: 52, marginTop: 28, alignItems: 'start' }}>
      <In i={0} style={{ position: 'relative' }}>
        <Figure w={860} h={540} label="GitHub 建立 fine-grained token 的表單示意：Token name、Expiration 90 天、Only select repositories、兩個權限 Read and write、Generate token">
          <rect x="0" y="0" width="860" height="536" fill="#FFFFFF" stroke={rule} strokeWidth="2" />
          <rect x="0" y="0" width="860" height="52" fill="#24292F" />
          <text x="24" y="35" fontSize="24" fontFamily={mono} fill="#FFFFFF">github.com/settings/personal-access-tokens/new</text>
          <FormRow y={104} label="Token name"><rect x="330" y="76" width="400" height="42" fill="#FFFFFF" stroke={faint} strokeWidth="2" /><text x="344" y="105" fontSize="24" fontFamily={mono} fill={ink}>digital-garden</text></FormRow>
          <FormRow y={164} label="Expiration"><rect x="330" y="136" width="240" height="42" fill={linkSoft} stroke={link} strokeWidth="2" /><text x="344" y="165" fontSize="24" fill={ink}>90 days ▾</text><text x="590" y="165" fontSize="24" fill={quiet}>預設 30 天</text></FormRow>
          <FormRow y={226} label="Repository access">
            <circle cx="344" cy="218" r="9" fill="none" stroke={faint} strokeWidth="2" /><text x="362" y="226" fontSize="24" fill={quiet}>All repositories</text>
            <circle cx="344" cy="258" r="9" fill={link} /><text x="362" y="266" fontSize="24" fontWeight="600" fill={ink}>Only select repositories</text>
            <rect x="362" y="280" width="320" height="42" fill={linkSoft} stroke={link} strokeWidth="2" /><text x="376" y="309" fontSize="24" fontFamily={mono} fill={ink}>你的帳號/my-garden</text>
          </FormRow>
          <FormRow y={368} label="Permissions">
            <text x="344" y="368" fontSize="24" fill={ink}>Contents</text><text x="590" y="368" fontSize="24" fontWeight="600" fill={okGreen}>Read and write</text>
            <text x="344" y="408" fontSize="24" fill={ink}>Pull requests</text><text x="590" y="408" fontSize="24" fontWeight="600" fill={okGreen}>Read and write</text>
            <text x="344" y="448" fontSize="24" fill={quiet}>Metadata</text><text x="590" y="448" fontSize="24" fill={quiet}>Read-only（自動）</text>
          </FormRow>
          <rect x="30" y="470" width="240" height="50" rx="6" fill="#1F883D" /><text x="150" y="503" textAnchor="middle" fontSize="24" fontWeight="600" fill="#FFFFFF">Generate token</text>
        </Figure>
        <MarkBubble n={1} left={-30} top={26} i={2} />
        <MarkBubble n={2} left={300} top={157} i={3} />
        <MarkBubble n={3} left={330} top={301} i={4} />
        <MarkBubble n={4} left={310} top={388} i={5} />
        <MarkBubble n={5} left={0} top={495} i={6} />
      </In>
      <div style={{ display: 'grid', gap: 18, paddingTop: 4 }}>
        <In i={2}><Callout n={1} title="登入 GitHub，打開這個網址" detail={<Path size={24}>github.com/settings/personal-access-tokens/new</Path>} /></In>
        <In i={3}><Callout n={2} title="Expiration 改成 90 天" detail="到期後回同一頁按 Regenerate，再貼進外掛一次" /></In>
        <In i={4}><Callout n={3} title="Only select repositories" detail="只選剛才建的網站 repo" /></In>
        <In i={5}><Callout n={4} title="兩個權限改成 Read and write" detail="Contents、Pull requests；Metadata 自動唯讀" /></In>
        <In i={6}><Callout n={5} title="Generate token，馬上複製" detail="只顯示這一次；下一頁貼進外掛" /></In>
      </div>
    </div>
  </Shell>
);

// The token as a key that opens one door only.
const Door = ({ x, label, open }: { x: number; label: string; open: boolean }) => (
  <g>
    <rect x={x} y="40" width="130" height="190" fill={open ? sage : surface} stroke={open ? okGreen : faint} strokeWidth="3" />
    {open ? <path d={`M${x} 40 L${x + 60} 60 V250 L${x} 230 Z`} fill="#FFFFFF" stroke={okGreen} strokeWidth="3" /> : <circle cx={x + 104} cy="140" r="7" fill={faint} />}
    <text x={x + 65} y="270" textAnchor="middle" fontSize="23" fill={open ? okGreen : quiet} fontWeight={open ? 600 : 400}>{label}</text>
    {open ? <OkDot x={x + 100} y={80} r={18} /> : <NoDot x={x + 65} y={110} r={18} />}
  </g>
);

const ConnectGitHub: Page = () => (
  <Shell chapter={5}>
    <Eyebrow>第一次設定 4／4</Eyebrow>
    <Heading>把 token 填進 Digital Garden 設定</Heading>
    <Lead>設定 → Digital Garden → GitHub Authentication，把上一頁的鑰匙交給外掛</Lead>
    <div style={{ display: 'grid', gridTemplateColumns: '500px 1fr', gap: 60, marginTop: 34, alignItems: 'start' }}>
      <div>
        <Figure w={500} h={290} label="fine-grained token 只打得開網站 repo，另外兩個 repo 打不開">
          <InG i={0}><Door x={0} label="其他 repo" open={false} /></InG>
          <InG i={1}><Door x={180} label="網站 repo" open /></InG>
          <InG i={2}><Door x={360} label="其他 repo" open={false} /></InG>
        </Figure>
      </div>
      <div>
        <In i={2} style={{ position: 'relative' }}>
          <Screenshot src={dgSettings} aspect={1680 / 500} width={1070} caption="Digital Garden 外掛 2.96.0 實際畫面（2026-10 擷取），練習筆記庫" alt="Digital Garden 外掛設定中的 GitHub repo name、Username、token 欄位">
            <MarkBubble n={1} left="-2.5%" top="39%" i={4} />
            <MarkBubble n={2} left="-2.5%" top="64%" i={5} />
            <MarkBubble n={3} left="-2.5%" top="89%" i={6} />
          </Screenshot>
        </In>
        <div style={{ display: 'grid', gap: 14, marginTop: 20 }}>
          <In i={4}><Callout n={1} title="GitHub repo name：只填 my-garden" detail="不含帳號、不含網址" /></In>
          <In i={5}><Callout n={2} title="GitHub Username：你的帳號" /></In>
          <In i={6}><Callout n={3} title="GitHub token：貼上上一頁的 token（只貼這裡）" /></In>
        </div>
      </div>
    </div>
    <Caption>權限圖解：docs.forestry.md/advanced/fine-grained-access-token/</Caption>
  </Shell>
);

// Which cards will go out: the twelve that came ticked, and the new work that didn't.
const ScopeCard = ({ x, y, name, on, home = false }: { x: number; y: number; name: string; on: boolean; home?: boolean }) => (
  <g>
    <rect x={x} y={y} width="186" height="70" fill={on ? '#FFFFFF' : surface} stroke={on ? okGreen : faint} strokeWidth="2" strokeDasharray={on ? undefined : '8 6'} />
    <TickBox x={x + 14} y={y + 22} on={on} />
    <text x={x + 52} y={y + 45} fontSize="25" fill={on ? ink : quiet}>{name}</text>
    {home ? <path d={`M${x + 156} ${y + 30} l12 -11 l12 11 v16 h-24 Z`} fill={amber} /> : null}
  </g>
);

const PublishScope: Page = () => (
  <Shell chapter={5}>
    <Eyebrow>選擇公開</Eyebrow>
    <Heading>只有勾了 dg-publish 的卡會公開</Heading>
    <Lead>像交作業前貼標籤：貼了「公開」（dg-publish）的，才會被收走</Lead>
    <div style={{ marginTop: 44 }}>
      <Stage h={420}>
        <Steps>
          <Layer h={420} label="教材原有 12 張都已勾選 dg-publish，三國演義另有 dg-home">
            <text x="0" y="24" fontSize="28" fontWeight="600" fill={okGreen}>教材原有 12 張：已勾 dg-publish</text>
            <InG i={0}><ScopeCard x={0} y={74} name="三國演義" on home /><ScopeCard x={200} y={74} name="劉備" on /><ScopeCard x={400} y={74} name="關羽" on /><ScopeCard x={600} y={74} name="張飛" on /></InG>
            <InG i={1}><ScopeCard x={0} y={164} name="曹操" on /><ScopeCard x={200} y={164} name="孫權" on /><ScopeCard x={400} y={164} name="蜀漢" on /><ScopeCard x={600} y={164} name="曹魏" on /></InG>
            <InG i={2}><ScopeCard x={0} y={254} name="東吳" on /><ScopeCard x={200} y={254} name="桃園結義" on /><ScopeCard x={400} y={254} name="煮酒論英雄" on /><ScopeCard x={600} y={254} name="赤壁之戰" on /></InG>
            <InG i={3}><path d="M0 376 l12 -11 l12 11 v16 h-24 Z" fill={amber} /><text x="36" y="392" fontSize="25" fill={muted}>〈三國演義〉另勾 dg-home，當網站首頁</text></InG>
          </Layer>
          <Step duration={STEP_MS}><Layer h={420} label="今天新做的卡、圖、時間線和導覽頁都還沒勾，要逐篇決定">
            <g className="okg-build" style={buildDelay(0)}>
              <line x1="850" y1="50" x2="850" y2="330" stroke={rule} strokeWidth="2" />
              <text x="900" y="24" fontSize="28" fontWeight="600" fill={amber}>今天新做的：還沒勾</text>
              <ScopeCard x={900} y={74} name="諸葛亮" on={false} /><ScopeCard x={1100} y={74} name="周瑜" on={false} /><ScopeCard x={1300} y={74} name="三顧茅廬" on={false} />
            </g>
            <g className="okg-build" style={buildDelay(1)}><ScopeCard x={900} y={164} name="草船借箭" on={false} /><ScopeCard x={1100} y={164} name="關係圖×2" on={false} /><ScopeCard x={1300} y={164} name="時間線" on={false} /></g>
            <g className="okg-build" style={buildDelay(2)}><ScopeCard x={900} y={254} name="知識庫導覽" on={false} /><text x="1100" y="300" fontSize="25" fill={muted}>核對過，再一篇一篇勾</text></g>
          </Layer></Step>
        </Steps>
      </Stage>
    </div>
    <p style={{ fontSize: 28, color: muted, marginTop: 0 }}>連到的卡不會自動公開。要公開一篇：打開它 → Ctrl／Cmd + P → <strong>Digital Garden: Add publish flag</strong></p>
  </Shell>
);

const PublishCommand: Page = () => (
  <Shell chapter={5}>
    <Eyebrow>發布</Eyebrow>
    <Heading>用命令面板發布所有勾選的卡</Heading>
    <Lead>按 Ctrl／Cmd + P 叫出命令面板，搜尋 garden publish，選第二行</Lead>
    <div style={{ display: 'grid', gridTemplateColumns: '1100px 1fr', gap: 56, marginTop: 40, alignItems: 'start' }}>
      <In i={0}>
        <Screenshot src={dgPalette} aspect={1800 / 720} width={1100} caption="Digital Garden 外掛 2.96.0 實際畫面（2026-10 擷取），練習筆記庫" alt="命令面板搜尋 garden publish 的結果">
          <RegionMark x={3} y={35} w={94} h={11.5} i={2} />
          <MarkBubble n={1} left="0%" top="41%" i={3} />
        </Screenshot>
      </In>
      <div style={{ display: 'grid', gap: 30, paddingTop: 30 }}>
        <In i={3}><Callout n={1} title="Publish All Notes Marked for Publish" detail="發布所有勾了 dg-publish 的卡；今天只用這個" /></In>
        <In i={4} style={{ fontSize: 25, color: quiet, lineHeight: 1.5, borderTop: `1px solid ${rule}`, paddingTop: 20 }}>上面那行 Publish Active Note 只發布正在看的這一篇，之後只改一篇時再用</In>
      </div>
    </div>
    <In i={5} style={{ background: amberSoft, borderLeft: `5px solid ${amber}`, padding: '14px 24px', fontSize: 27, marginTop: 22 }}>網站沒更新？先等 1–2 分鐘 → 到 Vercel 看部署有沒有成功 → 確認那一篇有勾 dg-publish</In>
  </Shell>
);

// The public site, drawn as four pages the reader walks through.
const SitePage = ({ x, kind, name, line, next }: { x: number; kind: string; name: string; line: string; next?: string }) => (
  <g>
    <rect x={x} y="96" width="330" height="270" fill="#FFFFFF" stroke={rule} strokeWidth="2" />
    <text x={x + 24} y="138" fontSize="22" fill={quiet}>{kind}</text>
    <text x={x + 24} y="190" fontSize="38" fontWeight="600" fill={ink}>{name}</text>
    <text x={x + 24} y="240" fontSize="23" fill={muted}>{line}</text>
    {next ? <text x={x + 24} y="320" fontSize="28" fill={link} textDecoration="underline">{next} ↗</text> : null}
  </g>
);

const SiteRoute: Page = () => (
  <Shell>
    <Eyebrow>先看今天的成果</Eyebrow>
    <Heading>做完今天，你會有一個這樣的網址</Heading>
    <Lead>像網站版的卡片盒：點人名或事件名，就走到下一張</Lead>
    <div style={{ marginTop: 36 }}>
      <Figure h={420} label="網站上的路徑：三國演義入口 → 劉備 → 桃園結義 → 關羽">
        <InG i={0}><BrowserFrame x={0} y={0} w={1632} h={410} url="https://your-garden.vercel.app" /></InG>
        <InG i={1}><SitePage x={40} kind="入口" name="三國演義" line="先選一個人物" next="劉備" /></InG>
        <InG i={3}><SitePage x={440} kind="人物" name="劉備" line="第 1 回結義…" next="桃園結義" /></InG>
        <InG i={5}><SitePage x={840} kind="關係" name="桃園結義" line="三人結為兄弟" next="關羽" /></InG>
        <InG i={7}><SitePage x={1240} kind="人物" name="關羽" line="走到另一位人物" /></InG>
        <g fill="none" stroke={amber} strokeWidth="4"><DrawPath i={2} d="M200 330 C300 400 360 240 436 230" /><DrawPath i={4} d="M640 330 C720 400 760 240 836 230" /><DrawPath i={6} d="M1000 330 C1100 400 1160 240 1236 230" /></g>
      </Figure>
    </div>
    <Steps><Step duration={STEP_MS}><div style={{ marginTop: 26, fontSize: 34, color: amber }}>內容是一盒 12 張的三國卡片；今天就是從這盒卡，一路做到這個網站</div></Step></Steps>
  </Shell>
);

// Checking the site like a relay: every hand-off has to work.
const RelayStop = ({ x, name, state }: { x: number; name: string; state: 'ok' | 'bad' | 'idle' }) => (
  <g>
    <circle cx={x} cy="130" r="44" fill={state === 'bad' ? '#F6DEDA' : state === 'ok' ? sage : '#FFFFFF'} stroke={state === 'bad' ? warn : state === 'ok' ? okGreen : faint} strokeWidth="3" />
    <text x={x} y="140" textAnchor="middle" fontSize="27" fill={ink}>{name}</text>
  </g>
);

const CheckSite: Page = () => (
  <Shell chapter={5}>
    <Eyebrow>網站驗收</Eyebrow>
    <Heading>打開網址，從首頁一路點到每張卡</Heading>
    <Lead>走一遍開場看過的那條路，像跑接力：斷在哪一棒，就檢查那一頁</Lead>
    <div style={{ marginTop: 40, background: '#FFFFFF', border: `1px solid ${rule}`, padding: '10px 0' }}>
      <Stage h={330}>
        <Steps>
          <Layer h={330} label="四站：入口、人物、關係、另一人物">
            <InG i={0}><RelayStop x={180} name="入口" state="ok" /></InG>
            <InG i={1}><RelayStop x={600} name="劉備" state="idle" /></InG>
            <InG i={2}><RelayStop x={1020} name="桃園" state="idle" /></InG>
            <InG i={3}><RelayStop x={1440} name="關羽" state="idle" /></InG>
          </Layer>
          <Step duration={STEP_MS}><Layer h={330} label="入口能點到人物卡">
            <g fill="none" stroke={okGreen} strokeWidth="6"><StepPath d="M228 130 H552" /></g>
            <g className="okg-build" style={buildDelay(2)}><OkDot x={390} y={90} /><SvgLines x={390} y={230} lines={['入口點得到人物嗎？']} size={27} fill={ink} /></g>
          </Layer></Step>
          <Step duration={STEP_MS}><Layer h={330} label="人物能點到關係卡">
            <g fill="none" stroke={okGreen} strokeWidth="6"><StepPath d="M648 130 H972" /></g>
            <g className="okg-build" style={buildDelay(2)}><OkDot x={810} y={90} /><SvgLines x={810} y={230} lines={['人物點得到關係卡嗎？']} size={27} fill={ink} /></g>
          </Layer></Step>
          <Step duration={STEP_MS}><Layer h={330} label="關係卡點到關羽時打不開：先檢查關羽有沒有勾 dg-publish">
            <g stroke={warn} strokeWidth="6"><line x1="1068" y1="130" x2="1190" y2="130" /><line x1="1270" y1="130" x2="1392" y2="130" /></g>
            <g className="okg-build" style={buildDelay(1)}><NoDot x={1230} y={130} r={24} /><SvgLines x={1230} y={230} lines={['打不開？', '先查這頁有沒有勾 dg-publish']} size={27} fill={warn} /></g>
          </Layer></Step>
        </Steps>
      </Stage>
    </div>
    <Steps><Step duration={STEP_MS}><p style={{ fontSize: 28, color: muted, marginTop: 24 }}>勾好之後重新發布一次，再走一遍</p></Step></Steps>
  </Shell>
);


// The closing practice as three steps in a row, ending in what "done" means.
const RunStep = ({ x, n, title, detail, fill }: { x: number; n: number; title: string; detail: string; fill: string }) => (
  <g>
    <rect x={x} y="40" width="360" height="200" fill={fill} stroke={rule} strokeWidth="2" />
    <SvgNum x={x + 40} y={86} n={n} />
    <text x={x + 76} y="96" fontSize="30" fontWeight="600" fill={ink}>{title}</text>
    <SvgLines x={x + 28} y={160} lines={detail.split('\n')} size={25} fill={muted} anchor="start" />
  </g>
);

const FullPractice: Page = () => (
  <Shell chapter={5}>
    <PracticeEyebrow time="12 分鐘">完整練習</PracticeEyebrow>
    <Heading>完整練習：公開 4 張新卡，請同學走一遍</Heading>
    <Lead>像請同學試玩你設計的關卡：他走得通，才算完成</Lead>
    <div style={{ marginTop: 48 }}>
      <Stage h={300}>
        <Steps>
          <Layer h={300} label="1 選一條路線：人物 → 關係 → 人物">
            <InG i={0}><RunStep x={0} n={1} title="選一條路線" detail={'人物 → 關係 → 人物\n例：曹操 → 赤壁 → 孫權'} fill={amberSoft} /></InG>
          </Layer>
          <Step duration={STEP_MS}><Layer h={300} label="2 請 Agent 解釋這段關係，你回來源卡核對">
            <MapArrow x1={368} x2={418} y={140} hot />
            <g className="okg-build" style={buildDelay(0)}><RunStep x={426} n={2} title="請 Agent 解釋" detail={'這段關係是什麼？\n你回來源卡核對'} fill={linkSoft} /></g>
          </Layer></Step>
          <Step duration={STEP_MS}><Layer h={300} label="3 發布，請同學在網站走一次">
            <MapArrow x1={794} x2={844} y={140} hot />
            <g className="okg-build" style={buildDelay(0)}><RunStep x={852} n={3} title="發布，請同學走" detail={'把網址給同學\n從入口走完三層'} fill="#FFFFFF" /></g>
          </Layer></Step>
          <Step duration={STEP_MS}><Layer h={300} label="完成條件：同學走得通，而且每頁都有根據">
            <MapArrow x1={1220} x2={1270} y={140} hot />
            <g className="okg-build" style={buildDelay(0)}>
              <rect x="1278" y="40" width="354" height="200" fill={sage} stroke={okGreen} strokeWidth="3" />
              <OkDot x={1318} y={86} />
              <text x="1356" y="96" fontSize="30" fontWeight="600" fill={ink}>完成</text>
              <SvgLines x={1306} y={160} lines={['同學走得通', '每一頁都有根據']} size={26} fill={ink} anchor="start" />
            </g>
          </Layer></Step>
        </Steps>
      </Stage>
    </div>
  </Shell>
);

// ---------- Closing ----------

const RecapStop = ({ x, n, verb }: { x: number; n: Chapter; verb: string }) => (
  <g>
    <circle cx={x} cy="90" r="56" fill={amberSoft} stroke={amber} strokeWidth="3" />
    <text x={x} y="106" textAnchor="middle" fontSize="44" fontFamily={display} fill={amber}>{n}</text>
    <text x={x} y="200" textAnchor="middle" fontSize="32" fontWeight="600" fill={ink}>{CHAPTERS[n - 1]}</text>
    <text x={x} y="248" textAnchor="middle" fontSize="27" fill={muted}>{verb}</text>
  </g>
);

const Recap: Page = () => (
  <Shell>
    <Eyebrow>總結</Eyebrow>
    <Heading>回顧：五章做出一個知識網站</Heading>
    <Lead>五章走一圈：打開卡片盒，最後變成同學走得通的網站</Lead>
    <div style={{ marginTop: 64 }}>
      <Figure h={280} label="五章：認識 Obsidian、理解 RAG、Agent 協作、建立知識庫、發布到網站">
        <g fill="none" stroke={amber} strokeWidth="4"><DrawPath i={5} d="M220 90 H1412" /></g>
        <InG i={0}><RecapStop x={160} n={1} verb="打開卡片盒、沿連結讀" /></InG>
        <InG i={1}><RecapStop x={488} n={2} verb="請 Agent 查筆記、附檔名" /></InG>
        <InG i={2}><RecapStop x={816} n={3} verb="請 Agent 補卡、重畫" /></InG>
        <InG i={3}><RecapStop x={1144} n={4} verb="做導覽頁、回到來源" /></InG>
        <InG i={4}><RecapStop x={1472} n={5} verb="挑卡發布、同學驗收" /></InG>
      </Figure>
    </div>
    <Steps><Step duration={STEP_MS}><div style={{ marginTop: 56, borderTop: `2px solid ${amber}`, paddingTop: 28, fontSize: 38, color: amber, lineHeight: 1.5 }}>想一想：為什麼同一張劉備卡，能同時出現在結義和煮酒兩條路上？</div></Step></Steps>
  </Shell>
);

const AppendixRow = ({ i, tag, name, detail, page }: { i: number; tag: string; name: string; detail: string; page: Page }) => (
  <In i={i} style={{ display: 'grid', gridTemplateColumns: '90px 1fr 140px', alignItems: 'center', minHeight: 120, borderBottom: `1px solid ${rule}` }}>
    <span style={{ fontFamily: display, fontSize: 44, color: amber }}>{tag}</span>
    <span><span style={{ display: 'block', fontSize: 36, fontWeight: 600 }}>{name}</span><span style={{ display: 'block', fontSize: 27, color: muted, marginTop: 6 }}>{detail}</span></span>
    <span style={{ textAlign: 'right', fontSize: 24, color: quiet }}>第 {pageOf(page)} 頁</span>
  </In>
);

const Appendix: Page = () => (
  <Shell top={192}>
    <In i={0}><Eyebrow>APPENDIX</Eyebrow></In>
    <In i={1} style={{ marginTop: 63 }}><Title>課後選修</Title></In>
    <In i={2} style={{ fontSize: 36, color: muted, marginTop: 30 }}>主線已經結束；下面兩段可以依經驗挑著看</In>
    <div style={{ marginTop: 56, borderTop: `2px solid ${ink}`, maxWidth: 1400 }}>
      <AppendixRow i={3} tag="A" name="llm-wiki：讓 Agent 照固定步驟整理筆記" detail="安裝與三個常用 Skill" page={LlmWiki} />
      <AppendixRow i={4} tag="B" name="Git：看懂發布的幕後" detail="commit、push 和手動練習" page={GitBasics} />
    </div>
  </Shell>
);

const CodeBlock = ({ label, children }: { label: string; children: ReactNode }) => (
  <div style={{ background: '#202326', color: '#F5F5F4', borderTop: `5px solid ${amber}`, padding: '26px 36px 32px' }}>
    <div style={{ color: '#BAB5B0', fontSize: 24, letterSpacing: '0.08em', marginBottom: 18 }}>{label}</div>
    <div style={{ fontFamily: mono, fontSize: 30, lineHeight: 1.75, whiteSpace: 'pre' }}>{children}</div>
  </div>
);

const LlmWiki: Page = () => (
  <Shell>
    <Eyebrow>課後選修 A｜進階安裝</Eyebrow>
    <Heading>安裝 llm-wiki：幫 Agent 整理筆記的 Skill</Heading>
    <Lead>llm-wiki 是一組 Skills：像交給助理一本固定的整理 SOP</Lead>
    <div style={{ display: 'grid', gridTemplateColumns: '960px 1fr', gap: 64, marginTop: 44, alignItems: 'start' }}>
      <In i={0}><CodeBlock label="範例指令｜需要先裝 Python 3">
        <div><Typed>$</Typed> pip install obsidian-wiki</div>
        <div><Typed>$</Typed> obsidian-wiki setup --vault {'<筆記庫路徑>'}</div>
        <div><Typed>$</Typed> obsidian-wiki doctor</div>
      </CodeBlock></In>
      <div style={{ display: 'grid', gap: 30 }}>
        <In i={1}><Callout n={1} title="把 <筆記庫路徑> 換成完整路徑" detail="setup 會把 Skills 連到 Agent 的設定資料夾" /></In>
        <In i={2}><Callout n={2} title="doctor 檢查有沒有裝好" /></In>
        <In i={3}><Callout n={3} title="在 Codex 打開筆記庫，說「set up my wiki」" /></In>
      </div>
    </div>
    <In i={4} style={{ marginTop: 40 }}>
      <Figure h={130} label="Skill 是給 Agent 的做事說明；Agent 照著它整理筆記庫">
        <DocShape x={0} y={10} w={150} h={110} fill={amberSoft} stroke={amber} sw={3} /><text x="75" y="76" textAnchor="middle" fontSize="28" fill={ink}>SOP</text>
        <MapArrow x1={170} x2={250} y={65} />
        <rect x="270" y="20" width="200" height="90" fill={sage} stroke={okGreen} strokeWidth="2" /><text x="370" y="76" textAnchor="middle" fontSize="30" fontWeight="600" fill={ink}>Agent</text>
        <MapArrow x1={490} x2={570} y={65} />
        <Folder x={590} y={20} w={220} h={90} /><text x="700" y="80" textAnchor="middle" fontSize="26" fill={ink}>筆記庫</text>
        <text x="860" y="76" fontSize="28" fill={muted}>Skill＝給 Agent 的做事說明；主線練習不用裝</text>
      </Figure>
    </In>
  </Shell>
);

const SkillRow = ({ i, cmd, what, icon }: { i: number; cmd: string; what: string; icon: ReactNode }) => (
  <In i={i} style={{ display: 'grid', gridTemplateColumns: '130px 380px 1fr', alignItems: 'center', gap: 30, background: surface, borderLeft: `5px solid ${amber}`, padding: '20px 34px' }}>
    <svg viewBox="0 0 110 80" style={{ width: 110, height: 80 }} aria-hidden="true">{icon}</svg>
    <span style={{ fontFamily: mono, fontSize: 34, fontWeight: 600, color: amber }}>{cmd}</span>
    <span style={{ fontSize: 32, lineHeight: 1.4 }}>{what}</span>
  </In>
);

const WikiSkills: Page = () => (
  <Shell>
    <Eyebrow>課後選修 A｜常用 Skills</Eyebrow>
    <Heading>三個 Wiki Skill：收資料、查資料、做健檢</Heading>
    <Lead>像工具箱裡的三把工具：收資料、查資料、做健檢。裝好後，在 Codex 輸入 $ 叫出來</Lead>
    <div style={{ display: 'grid', gap: 22, marginTop: 44 }}>
      <SkillRow i={0} cmd="$wiki-ingest" what="把資料收進來，整理成附來源的 Wiki 頁" icon={<g>
        <DocShape x={4} y={14} w={40} h={52} /><MapArrow x1={50} x2={74} y={40} hot /><Folder x={78} y={18} w={30} h={44} />
      </g>} />
      <SkillRow i={1} cmd="$wiki-query" what="從 Wiki 找答案，並附上出處" icon={<g>
        <circle cx="44" cy="36" r="24" fill="none" stroke={okGreen} strokeWidth="5" /><path d="M62 54 l22 22" stroke={okGreen} strokeWidth="6" strokeLinecap="round" />
      </g>} />
      <SkillRow i={2} cmd="$wiki-lint" what="健檢：斷掉的連結、孤立頁、過時或矛盾的內容" icon={<g>
        <rect x="6" y="28" width="38" height="24" rx="12" fill="none" stroke={faint} strokeWidth="5" /><rect x="66" y="28" width="38" height="24" rx="12" fill="none" stroke={faint} strokeWidth="5" />
        <path d="M50 22 L60 58" stroke={warn} strokeWidth="5" strokeLinecap="round" />
      </g>} />
    </div>
    <In i={3} style={{ fontSize: 28, color: muted, marginTop: 34 }}>先試一個：用 $wiki-query 問「劉備與曹操在哪段故事同場？」，再核對它引用的卡</In>
  </Shell>
);

// Git as a photo routine: snap, send, and the shop window updates itself.
const GitStation = ({ x, kicker, name, detail, children, fill }: { x: number; kicker: string; name: string; detail: string; children: ReactNode; fill: string }) => (
  <g>
    <rect x={x} y="0" width="460" height="420" fill={fill} />
    <rect x={x} y="0" width="460" height="5" fill={amber} />
    <text x={x + 30} y="52" fontSize="26" fontFamily={mono} fontWeight="600" fill={amber}>{kicker}</text>
    {children}
    <text x={x + 30} y="330" fontSize="38" fontWeight="600" fill={ink}>{name}</text>
    <text x={x + 30} y="378" fontSize="26" fill={muted}>{detail}</text>
  </g>
);

const GitBasics: Page = () => (
  <Shell>
    <Eyebrow>課後選修 B｜Git 觀念</Eyebrow>
    <Heading>Git：commit 存版本、push 送上 GitHub</Heading>
    <Lead>像拍照存檔、寄出照片，店面再換上新照片</Lead>
    <div style={{ marginTop: 36 }}>
      <Stage h={420}>
        <Steps>
          <Layer h={420} label="commit：拍一張快照，記下這次改了什麼">
            <GitStation x={0} kicker="commit" name="拍一張快照" detail="記下這次改了什麼" fill={amberSoft}>
              <rect x="150" y="110" width="160" height="110" rx="10" fill="#FFFFFF" stroke={amber} strokeWidth="4" /><rect x="190" y="94" width="50" height="20" fill={amber} />
              <circle cx="230" cy="165" r="34" fill="none" stroke={amber} strokeWidth="4" />
            </GitStation>
          </Layer>
          <Step duration={STEP_MS}><Layer h={420} label="push：把快照寄到 GitHub">
            <MapArrow x1={470} x2={576} y={210} hot />
            <GitStation x={586} kicker="push" name="寄出去" detail="把快照送到 GitHub" fill={surface}>
              <rect x="726" y="110" width="180" height="120" fill="#FFFFFF" stroke={faint} strokeWidth="4" /><path d="M726 110 L816 180 L906 110" fill="none" stroke={faint} strokeWidth="4" />
            </GitStation>
          </Layer></Step>
          <Step duration={STEP_MS}><Layer h={420} label="部署：Vercel 收到新版本，網站自己更新">
            <MapArrow x1={1056} x2={1162} y={210} hot />
            <GitStation x={1172} kicker="部署" name="網站自己更新" detail="Vercel 收到新版就重做網站" fill={sage}>
              <path d="M1300 130 H1500 L1520 160 H1280 Z" fill={okGreen} /><rect x="1292" y="160" width="216" height="90" fill="#FFFFFF" stroke={okGreen} strokeWidth="3" /><rect x="1312" y="178" width="80" height="54" fill={sage} />
            </GitStation>
          </Layer></Step>
        </Steps>
      </Stage>
    </div>
    <Steps><Step duration={STEP_MS}><p style={{ fontSize: 28, color: muted, marginTop: 26 }}>Digital Garden 發布時，直接在 GitHub 建好新版本（等於替你做了前兩步），Vercel 接著更新網站</p></Step></Steps>
  </Shell>
);

const CloneRepo: Page = () => (
  <Shell>
    <Eyebrow>課後選修 B｜取得 repo</Eyebrow>
    <Heading>git clone：把網站 repo 抄到電腦</Heading>
    <Lead>把 GitHub 上的網站 repo 抄一份到電腦；它和 Obsidian 筆記庫是兩個資料夾</Lead>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 600px', gap: 64, marginTop: 40, alignItems: 'start' }}>
      <div>
        <In i={0}><CodeBlock label="範例指令">
          <div><Typed>$</Typed> git clone {'<repo 網址>'}</div>
          <div><Typed>$</Typed> cd {'<資料夾名稱>'}</div>
        </CodeBlock></In>
        <In i={1} style={{ marginTop: 34 }}><Callout n={1} title="按綠色 Code → HTTPS → 複製網址" detail="角括號要換成實際網址和資料夾名稱" /></In>
        <In i={2} style={{ marginTop: 30 }}>
          <Figure w={900} h={120} label="GitHub 上的網站 repo 與電腦裡的 Obsidian 筆記庫是兩個不同資料夾">
            <Folder x={0} y={10} w={300} h={100} fill={surface} stroke={faint} /><text x="150" y="80" textAnchor="middle" fontSize="26" fill={ink}>網站 repo</text>
            <text x="450" y="74" textAnchor="middle" fontSize="40" fill={warn}>≠</text>
            <Folder x={600} y={10} w={300} h={100} /><text x="750" y="80" textAnchor="middle" fontSize="26" fill={ink}>Obsidian 筆記庫</text>
          </Figure>
        </In>
      </div>
      <In i={1}><Screenshot src={githubClone} aspect={926 / 694} width={600} caption="GitHub Docs 官方圖（CC BY 4.0）" alt="GitHub 綠色 Code 按鈕展開後的 HTTPS 網址" /></In>
    </div>
  </Shell>
);

// Each command gets a plain-words label on the same row.
const GIT_ROW = 50;

const GitLabel = ({ row, n, children }: { row: number; n: number; children: ReactNode }) => (
  <In i={n + 1} style={{ position: 'absolute', left: 0, top: row * GIT_ROW - 4, display: 'flex', alignItems: 'center', gap: 16, fontSize: 28 }}>
    <span style={{ color: amber, fontSize: 30 }}>←</span><NumDot n={n} /><span>{children}</span>
  </In>
);

const CommitPush: Page = () => (
  <Shell>
    <Eyebrow>課後選修 B｜手動練習</Eyebrow>
    <Heading>練習：改 README，再 commit 與 push</Heading>
    <Lead>在網站 repo 的 README 加一行字，再照順序打四個指令</Lead>
    <div style={{ display: 'grid', gridTemplateColumns: '880px 1fr', gap: 30, marginTop: 40 }}>
      <In i={0}>
        <div style={{ background: '#202326', color: '#D6D3D1', borderTop: `5px solid ${amber}`, padding: '24px 34px 28px' }}>
          <div style={{ color: '#BAB5B0', fontSize: 24, marginBottom: 16 }}>示例輸出｜在練習用網站 repo 執行</div>
          <div style={{ fontFamily: mono, fontSize: 28, lineHeight: `${GIT_ROW}px`, whiteSpace: 'pre' }}>
            <div><Typed>$ git status</Typed></div>
            <div>  modified: README.md</div>
            <div><Typed>$ git add README.md</Typed></div>
            <div><Typed>$ git commit -m "記錄知識庫練習"</Typed></div>
            <div>  已建立一個新版本</div>
            <div><Typed>$ git push</Typed></div>
            <div>  已送到 GitHub</div>
          </div>
        </div>
      </In>
      <div style={{ position: 'relative', marginTop: 88 }}>
        <GitLabel row={0} n={1}>看改了什麼</GitLabel>
        <GitLabel row={2} n={2}>選好要拍進去的檔案</GitLabel>
        <GitLabel row={3} n={3}>拍一張快照</GitLabel>
        <GitLabel row={5} n={4}>寄到 GitHub</GitLabel>
      </div>
    </div>
    <In i={6} style={{ fontSize: 26, color: quiet, marginTop: 24 }}>README 的字不會變成公開筆記；筆記仍從 Obsidian 的 Digital Garden 外掛發布</In>
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
Appendix.transition = OPENER;

export const meta: SlideMeta = {
  title: '02 AI 工作坊 ｜Obsidian × Agent 知識庫',
  createdAt: '2026-10-11T18:43:21.284Z',
  theme: 'thoughtstream',
};

const deck: Page[] = [
  Cover, SiteRoute, Agenda,
  Section1, StoryMap, DownloadObsidian, FirstLaunch, GetVault, ObsidianWindow, LinkWalk, ReadRelations,
  Section2, RagSteps, RagCompare, VaultFiles, OpenInCodex, AskAgent, AgentAnswer, CheckAnswer,
  Section3, Practice1, Practice2, Practice3, GrowthCompare, CheckAgentWork,
  Section4, KnowledgeLayers, TwoWays, HomePagePractice,
  Section5, PublishFlow, InstallPlugin, DeploySite, CreateToken, ConnectGitHub, PublishScope, PublishCommand, CheckSite, FullPractice,
  Recap,
  Appendix, LlmWiki, WikiSkills, GitBasics, CloneRepo, CommitPush,
];

// 1-based page number of a page in this deck (for the agenda and appendix contents).
function pageOf(page: Page) {
  return deck.indexOf(page) + 1;
}

// Speaker notes, keyed by page so they stay aligned with the deck order.
const NOTES = new Map<Page, string>([
  [Cover, '今天用《三國演義》當例子：12 張人物、勢力、關係卡都備好了，大家不用先抄資料。先點開一段關係，看懂卡為什麼連在一起；後面再請 AI 查筆記、幫忙擴充，最後挑幾張發布成網站。'],
  [SiteRoute, '開場先看成果：做完今天，每個人會有一個這樣的網址。從〈三國演義〉入口點〈劉備〉，進〈桃園結義〉，再走到〈關羽〉，像網站版的卡片盒。按一下出現最後一句：這個網站就是從一盒 12 張的卡片一路做出來的。畫面是示意，外觀和網址依個人設定不同。'],
  [Agenda, '五章，約 110 分鐘，含大家動手的時間；附錄留到課後。每章結束手上都多一樣東西：第一章裝好 Obsidian、打開筆記庫、沿連結讀；第二章請 Agent（今天用 Codex）先查筆記再回答；第三章請 Agent 新增 4 張卡，重畫關係圖和時間線；第四章做一張導覽首頁；第五章挑卡發布，請同學驗收。時間是估計值，第三章和第五章最容易超時。課前準備：Codex 照第一篇裝好；GitHub、Vercel 帳號先註冊。'],
  [Section1, '大家拿到的是講師準備好的 12 張筆記，直接用 Obsidian 打開現成的資料夾。Obsidian 讀寫的就是電腦裡的 .md 檔；這一章把時間花在讀懂卡和卡之間的關係。'],
  [StoryMap, '五位人物進場後，按三次，依序出現三張關係卡和連線：桃園結義接關羽、張飛、劉備；煮酒論英雄接劉備、曹操；赤壁之戰接曹操、孫權。像畫家族樹，人是點，一起經歷的事件把人接起來。每張卡在圖上只出現一次，劉備和曹操外面多一圈，表示各接了兩段故事。這是 12 張卡中的 8 張；接下來先把 Obsidian 裝好、打開教材，自己點點看。小說出處：第 1、21、49、50 回。來源：https://zh.wikisource.org/wiki/三國演義/第001回 、https://zh.wikisource.org/wiki/三國演義/第021回 、https://zh.wikisource.org/wiki/三國演義/第049回 、https://zh.wikisource.org/wiki/三國演義/第050回'],
  [DownloadObsidian, '網頁會自己判斷系統：Windows 顯示 Download for Windows，Mac 顯示 Download for macOS。沒看到按鈕就往下捲，在 Windows 或 Mac 那一列按 Universal。Windows 打開安裝檔照指示按下一步；macOS 打開 .dmg，把 Obsidian 拖進「應用程式」。裝好就打開，下一頁是第一次啟動的畫面。官方說明：https://obsidian.md/help/install'],
  [FirstLaunch, '第一次打開，先在最下面選繁體中文。今天不建空白儲存庫：等一下下載教材後，用第二個選項「開啟資料夾為儲存庫」直接打開。Obsidian 繁中介面把 vault 叫「儲存庫」，簡報裡說的「筆記庫」是同一個東西。來源：https://obsidian.md/help/User+interface/Language+settings'],
  [GetVault, 'QR code 連到 GitHub 上公開的教材 ZIP；畫面上的下載按鈕也連到同一份檔案，兩種都有 12 張 Markdown 筆記。解壓縮後，在 Obsidian 選「開啟資料夾為儲存庫」，指定「三國人物知識庫」這一層，不要選外層的下載資料夾。打開後左側要看得到〈三國演義〉和人物、勢力、關係三個資料夾。ZIP 裡另有 原文/（第 37、38、46 回節選，.txt 檔，Obsidian 預設不顯示內容，給練習二用）和放在筆記庫外面的 prompts.md（練習提示詞完整版）。教材：https://raw.githubusercontent.com/Chrouos/AI-workshop-slides/main/examples/obsidian-agent-knowledge-garden/%E4%B8%89%E5%9C%8B%E4%BA%BA%E7%89%A9%E7%9F%A5%E8%AD%98%E5%BA%AB.zip ；操作說明：https://obsidian.md/help/Getting+started/Create+a+vault'],
  [ObsidianWindow, '打開後會看到這個畫面，像一本活頁夾。按三次，依序圈出：左邊的資料夾（入口卡加人物 5、勢力 3、關係 3）；中間打開的〈桃園結義〉；紫色的劉備、關羽、張飛，點下去就跨資料夾走到人物卡。這是照 Obsidian 介面整理的示意，內容就是剛下載的筆記。官方說明：https://obsidian.md/help/links'],
  [LinkWalk, '像坐捷運。先看〈劉備〉，按一下，路線走到〈桃園結義〉；再按一下，到〈關羽〉。中間那張關係卡寫著第 1 回的結義，所以這條線有理由，不只是一條線。今天的卡已經加好 [[連結]]，下一頁大家自己點紫色字試試。官方說明：https://obsidian.md/help/Linking+notes+and+files/Internal+links'],
  [ReadRelations, '在 12 張筆記中展開〈關係〉資料夾，看〈桃園結義〉、〈煮酒論英雄〉、〈赤壁之戰〉三張卡；投影片上也可以直接點左邊切換。點人物的紫色連結，確認能跨資料夾走到人物卡。三張卡分別寫結義、對話、對抗，原本各自獨立的人物筆記就有了不同路線。卡片用完整句子講故事，人名連結就寫在句子裡；投影片上只放摘要，完整內容在 Obsidian 裡讀。來源：https://zh.wikisource.org/wiki/三國演義/第001回 、https://zh.wikisource.org/wiki/三國演義/第021回 、https://zh.wikisource.org/wiki/三國演義/第049回 、https://zh.wikisource.org/wiki/三國演義/第050回'],
  [Section2, '剛才大家自己沿連結找資料，要先讀卡片內容，才知道人物為什麼相連。接下來把「先找資料」這一步交給 AI：先拆開 RAG 三個字母，再比較查筆記前後的回答。RAG 是一種工作方式，不是 Obsidian 裡的按鈕。'],
  [RagSteps, '像開書考。題目是「曹操在這盒筆記中參與哪場戰役？」先看 R 檢索：從筆記庫挑出〈曹操〉和〈赤壁之戰〉。按一下是 A 增強：把找到的內容連同問題一起交給模型，AI 本身沒有被改，只是這次回答多了資料可以看。再按一下是 G 生成：模型照這些內容回答「赤壁之戰」，並標出檔名。來源：https://arxiv.org/abs/2005.11401 （Lewis 等人，2020）'],
  [RagCompare, '左邊先出現：沒查筆記，AI 憑印象回答，可能對也可能錯，但沒有檔名可以回去核對。按一下出現右邊：先從〈曹操〉找到〈赤壁之戰〉，對照兩張卡，回答赤壁之戰並附檔名。提醒大家題目限定這盒筆記，不是說曹操一生只打過這一仗。RAG 也可以直接搜尋檔案，不一定要沿連結；找錯資料或資料本身寫錯，回答一樣會錯。來源：https://arxiv.org/abs/2005.11401'],
  [VaultFiles, '進到 Agent 之前，先看筆記庫在電腦裡的樣子：就是一般資料夾。根目錄有〈三國演義〉入口卡，人物 5 張、勢力 3 張、關係 3 張，共 12 張 .md；原文/ 放 3 份 .txt 節選，練習二才用。左邊是剛才用過的 Obsidian，負責寫。按一下出現 Agent：會自己開檔、讀檔、寫檔的 AI，今天用的是 Codex。之後簡報統一叫它 Agent。兩邊用同一個資料夾，不用各存一份。來源：https://obsidian.md/help/Getting+started/Create+a+vault'],
  [OpenInCodex, 'Codex 的安裝和登入沿用第一篇的課前準備。打開終端機，輸入 cd 和一個空格，再把「三國人物知識庫」資料夾從 Finder 或檔案總管拖進終端機，路徑會自己貼上，按 Enter。接著輸入 codex 叫醒它，第一次會請你登入，照畫面做。要停在「三國人物知識庫」這一層，不要停在「文件」或「下載」，因為 Codex 只看你所在的資料夾。按一下看回覆：請它列出所有 .md 檔，數到 12 個再開始提問；原文/ 是 .txt，不算在內。右邊是示意，實際文字會不同。'],
  [AskAgent, '投影片只放三格重點，完整提示詞在 prompts.md「查筆記練習」，請大家整段貼上。右邊是預期路線：先讀〈曹操〉，再核對〈赤壁之戰〉，最後回答並附兩個檔名。看 Agent 有沒有沒查到就憑印象補細節。題目限定「依這盒筆記」。'],
  [AgentAnswer, '這是照範例筆記寫的回答格式示意。三條線依序畫出：第一句對到〈曹操〉的赤壁戰事，第二句對到〈赤壁之戰〉的交戰，第三句對到「曹操軍敗退」。回答範圍是今天的 12 張筆記，不代表曹操一生只參與赤壁一場戰役。來源：練習筆記庫／人物／曹操.md、練習筆記庫／關係／赤壁之戰.md。'],
  [CheckAnswer, '像改考卷。先看第一個檢查，再按兩次看後兩個：出處，回答提到的檔案真的存在嗎；範圍，有沒有多寫筆記沒寫的細節；誠實，資料不夠時有沒有說找不到。RAG 能減少瞎掰，但不保證正確。'],
  [Section3, '這一章是連續三個練習，像帶實習生。練習一先把原本 12 張卡的關係圖存下來；練習二請 Agent 照小說回目新增 4 張卡；練習三用同一套畫法重畫，加上時間線，比一比知識庫長大後多了哪些路。'],
  [Practice1, '像整理房間前先拍照。投影片只放重點：範圍、產出、限制三格，跟第一篇同一個格式；完整提示詞請打開 ZIP 裡的 prompts.md，複製「練習一」整段。這張圖是等一下比較的基準，只畫人物卡和關係卡，先不畫勢力卡；所以不要把還沒有卡的諸葛亮、周瑜畫成已存在的點。純文字圖可以直接貼在 Markdown 的程式碼區塊。存好後在 Obsidian 打開，核對每條線都對得到原卡上的連結。'],
  [Practice2, '只新增四張，不讓它無限生成。Agent 第一次要寫檔時，Codex 會問能不能寫入：先看過它列的差異，確認沒問題再選允許；看不懂就先拒絕、請它再說明一次。資料只給 原文/ 資料夾裡的三份節選：第 37、38 回三顧茅廬，第 46 回草船借箭，所以不用上網，每個人跑出來的來源也一樣。完整提示詞在 prompts.md「練習二」。新卡放進人物／和關係／資料夾，跟原本的卡同一套分類。請 Agent 先列出新增檔案和差異，大家確認來源、人物和連結後才寫入。原本 12 張保持原樣；新卡連出去接到舊卡，舊卡從反向連結就找得到新卡。節選來源：https://zh.wikisource.org/wiki/三國演義/第037回 、https://zh.wikisource.org/wiki/三國演義/第038回 、https://zh.wikisource.org/wiki/三國演義/第046回'],
  [Practice3, '用練習一同一套畫法，前後才比得出差別。完整提示詞在 prompts.md「練習三」。時間線照小說回目排：桃園結義第 1 回、煮酒論英雄第 21 回、三顧茅廬第 37–38 回、草船借箭第 46 回、赤壁第 49–50 回。這是小說的敘事順序，不是歷史年份。想做成網頁的同學，prompts.md 最後有一段課後加分。'],
  [GrowthCompare, '這頁是概念示意，不是 Agent 的實際輸出。先看擴充前的五位人物和三張關係卡；按一下，新增的三顧茅廬、諸葛亮、草船借箭、周瑜從劉備往下長出去，像植物長新枝。請大家指出一條擴充前走不到、擴充後走得到的路，再打開時間線核對先後。'],
  [CheckAgentWork, '像驗收裝潢。第一列先出現，再按兩次看後兩列：數量，原本 12 張還在、新的 4 張有回目和節選檔名；連結，前後兩張圖畫法一樣、每條新連結點得開；順序，時間線照回目排，沒寫成西元年。最後再看一件事：草船借箭和赤壁之戰有沒有被硬寫成同一件事。可以在 Obsidian 點連結，也可以直接打開 Markdown 看來源網址。'],
  [Section4, '上一章做出了新卡、兩版關係圖和一份時間線。卡已經有了，這一章不再畫圖，而是做一張首頁：讓第一次來的讀者知道從哪裡開始，也找得回來源卡。'],
  [KnowledgeLayers, '像圖書館。先看書架：來源卡，入口 1 張、人物 5 張加新 2 張、勢力 3 張、關係 3 張加新 2 張，一張一個主題，留著出處。按一下是牆上的地圖：關係圖和時間線，地圖上的每個點，都是書架上的一張卡。地圖只負責指路，要查證還是走到那張卡。這個分法參考 llm-wiki 的 Raw Sources 和 The Wiki 兩層：https://github.com/Ar9av/obsidian-wiki/blob/main/.skills/llm-wiki/SKILL.md'],
  [TwoWays, '像找教室，可以看平面圖，也可以照課表。中間是〈三顧茅廬〉這張來源卡。按一下，從關係圖走：劉備 → 三顧茅廬 → 諸葛亮。再按一下，從時間線走：它在第 21 回之後、第 46 回草船借箭之前。兩條路最後都回到同一張卡和小說回目。'],
  [HomePagePractice, '這是導覽頁，不是第三張圖；完整提示詞在 prompts.md「導覽頁練習」。像校門口的導覽圖，只告訴讀者可以往哪兩個方向走。做完請大家實際點兩條路，確認關係圖、時間線、人物卡、關係卡都互相找得到；來源回目寫在關係卡裡。練習二沒做完的話，就用原本 12 張卡做一個短一點的導覽頁，並標出缺的地方。'],
  [Section5, '從這裡開始，內容會公開到網路上。先決定哪些卡可以分享，再設定網站、發布，請同學驗收；Git 的手動操作放在課後選修。'],
  [PublishFlow, '像寄出作品集，按三次沿著箭頭走：Obsidian 寫稿；Digital Garden 只收打勾的卡，沒勾的草稿留在電腦裡；GitHub 存一份公開版本；Vercel 變成網址。官方入門流程就是 Obsidian 外掛、GitHub 範本 repo、Vercel 部署。官方也說，連到的筆記不會自動跟著發布。來源：https://docs.forestry.md/getting-started/01-getting-started/ 提醒：這一章要用 GitHub 和 Vercel 帳號，請課前先註冊好；Vercel 可以直接用 GitHub 帳號登入。'],
  [InstallPlugin, '像在手機裝 App，按三次依序圈出：左下角齒輪進設定，點「第三方外掛程式」；若還在受限模式，照畫面按鈕關掉，再按社群外掛程式的「瀏覽」；搜尋 Digital Garden，安裝、啟用。提醒大家這是裝在目前這個筆記庫。介面名稱依 Obsidian 官方繁中翻譯，版本不同可能略有差異。官方說明：https://obsidian.md/help/community-plugins ；Digital Garden 入門：https://docs.forestry.md/getting-started/01-getting-started/'],
  [DeploySite, '先登入 GitHub 和 Vercel，到投影片下方的官方入口，按 Deploy to Vercel。按一下：Vercel 會出現 Create Git Repository，Git Scope 選你的 GitHub 帳號，Repository Name 自己取（例如 my-garden），按 Create；還沒登入的話，會先請你用 GitHub 登入。再按一下：等一兩分鐘部署完成，看到 Congratulations 和網址。最後一下：把 repo 名稱和網址記下來，後面兩頁都會用到。這個網站 repo 和電腦裡的 Obsidian 筆記庫是兩個地方。Vercel 畫面是示意，版本不同可能略有差異。來源：https://docs.forestry.md/getting-started/01-getting-started/'],
  [CreateToken, '這一步最容易卡住，慢慢來。token 像一把備用鑰匙，讓外掛能把公開的筆記寫進你的網站 repo。1：右上頭像 → Settings → 左側最下面 Developer settings → Personal access tokens → Fine-grained tokens → Generate new token；也可以直接打開 github.com/settings/personal-access-tokens/new。Token name 隨便取，例如 digital-garden。2：Repository access 選 Only select repositories，只勾剛才建的網站 repo。3：Repository permissions 裡，Contents 和 Pull requests 都改成 Read and write，Metadata 會自動變成唯讀。4：按 Generate token，馬上複製，它只顯示這一次。官方入門頁也提供一般 token 的連結，fine-grained 比較安全。GitHub 畫面是示意，按鈕位置依版本可能不同。來源：https://docs.forestry.md/advanced/fine-grained-access-token/'],
  [ConnectGitHub, '把上一頁複製的 token 交給外掛。回 Obsidian → 設定 → Digital Garden，依序填：GitHub repo name 填網站 repo 的名稱，GitHub Username 填你的帳號，GitHub token 貼上剛才的 token。左邊的門提醒大家：這把鑰匙只開網站 repo，其他 repo 打不開；權限是 Contents 讀寫、Pull requests 讀寫、Metadata 唯讀。token 只貼在外掛設定，不要貼進筆記或投影片。來源：https://docs.forestry.md/getting-started/01-getting-started/ 、https://docs.forestry.md/advanced/fine-grained-access-token/'],
  [PublishScope, '像交作業前貼標籤。左邊是教材原有的 12 張，都已勾 dg-publish，〈三國演義〉另外勾了 dg-home 當首頁。也可以不用指令，直接在筆記的屬性勾 dg-publish。按一下出現右邊：練習二、三和知識庫練習新做的卡、圖、時間線、導覽頁，預設都不會公開。要公開的話，逐篇核對內容和來源，再打開那一篇，按 Ctrl／Cmd + P 執行 Digital Garden: Add publish flag，或直接在屬性勾 dg-publish。連到的卡不會自動一起發布。來源：https://docs.forestry.md/getting-started/01-getting-started/'],
  [PublishCommand, '確認過公開範圍後，按 Ctrl／Cmd + P，搜尋 garden publish，選第二行 Publish All Notes Marked for Publish，今天只用這個。第一行 Publish Active Note 只發布正在看的那一篇，之後只改一篇時再用。發布後等一兩分鐘，打開 Vercel 網址看更新。網站沒更新的話：再等一下；到 Vercel 的專案頁看最新一次部署是不是成功；確認那一篇真的有勾 dg-publish，再發布一次。來源：https://docs.forestry.md/getting-started/02-commands/'],
  [CheckSite, '回到開場看過的那條路，自己走一遍。像跑接力，按三次一站一站交棒：入口點得到人物嗎？人物點得到關係卡嗎？最後一棒故意示範斷掉：打不開的那一頁，先檢查它有沒有勾 dg-publish，勾好重新發布再走一次。連到的筆記不會自動發布。來源：https://docs.forestry.md/getting-started/01-getting-started/'],
  [FullPractice, '不必再抄人物資料，用範例卡和核對過的關係卡完成驗收。第一步先出現：選一條人物 → 關係 → 人物的路線，例如曹操 → 赤壁之戰 → 孫權。按一下：請 Agent 解釋這段關係，你回來源卡核對。再按一下：發布，把網址給同學，請他從入口走完三層。最後一下是完成條件：同學走得通，而且每一頁都有根據。'],
  [Recap, '五章走一圈。最後按一下出現問題，請大家回答：為什麼同一張劉備卡，能同時出現在結義和煮酒兩條路上？答案是關係卡讓連結有理由，來源卡讓回答查得到。'],
  [Appendix, '主線到上一頁結束。下面是兩段獨立的進階材料：llm-wiki Skills 和 Git 手動操作，依大家的經驗或課後時間選讀。'],
  [LlmWiki, '課後選修，主線練習不用裝新工具。pip 需要先裝好 Python 3。Skill 是給 Agent 的做事說明，像一本固定的 SOP。這頁用命令列安裝，<筆記庫路徑> 要換成完整路徑。setup 會把 Skills 連到多個 Agent 的設定資料夾，也會寫入使用者設定；doctor 用來檢查。裝好後在 Codex 打開筆記庫，說「set up my wiki」。完整說明：https://github.com/Ar9av/obsidian-wiki/blob/main/docs/installation.md'],
  [WikiSkills, '課後選修。在 Codex 輸入 $ 可以叫出已安裝的 Skill。先示範一個具體請求：用 $wiki-query 問「劉備與曹操在哪段故事同場？」，再核對它引用的人物卡；另外兩個帶過就好。$wiki-lint 除了斷掉的連結和孤立頁，也會找過時、矛盾或缺 frontmatter 的頁面。完整清單：https://github.com/Ar9av/obsidian-wiki/blob/main/docs/skills.md'],
  [GitBasics, '課後選修，主線已經發布完，這裡拆開看幕後。像拍照存檔：commit 記下一個版本；按一下，push 把版本寄到 GitHub；再按一下，Vercel 收到新版就重做網站。Digital Garden 外掛是透過 GitHub 的 API 直接建立新版本，所以等於替你做了前兩步。來源：https://git-scm.com/book/en/v2/Git-Basics-Recording-Changes-to-the-Repository 、https://docs.github.com/en/get-started/using-git/pushing-commits-to-a-remote-repository'],
  [CloneRepo, '課後選修。複製的是自己在 Vercel 部署時建立的網站 repo，不是 Obsidian 筆記庫，也不是外掛原始碼。角括號要換成實際網址和資料夾名稱。圖片來源：https://docs.github.com/en/repositories/creating-and-managing-repositories/cloning-a-repository （GitHub Docs，CC BY 4.0）'],
  [CommitPush, '課後選修。先改網站 repo 的 README，再照順序執行 status、add、commit、push，右邊是每個指令的白話。README 的字不會變成公開筆記內容；筆記還是從 Obsidian 的 Digital Garden 外掛發布。push 完可以在 GitHub 看到新版本，再看 Vercel 有沒有部署完成。'],
]);

export const notes: (string | undefined)[] = deck.map(page => NOTES.get(page));

export default deck satisfies Page[];
