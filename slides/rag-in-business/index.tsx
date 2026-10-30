import type { DesignSystem, Page, SlideMeta, SlideTransition } from '@open-slide/core';
import { Step, Steps, useIsActivePage, useSlidePageNumber } from '@open-slide/core';
import type { CSSProperties, ReactNode } from 'react';
import chatgptSearch from './assets/chatgpt-search.png';
import googleOverview from './assets/google-ai-overview.png';
import newsLtn from './assets/news-ltn-1.png';
import notebooklmAnswer from './assets/notebooklm-answer.png';
import notebooklmSource from './assets/notebooklm-source.png';
import rufusChat from './assets/rufus-chat.png';

// Same look as the aw-01..04 workshop decks (thoughtstream theme): warm white, serif headings,
// amber for the thing to look at, line icons instead of logos.
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
const FONT_LINK_ID = 'osd-webfont-rag-in-business';
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
// The aw decks' vocabulary: clicks go through <Steps>/<Step>; the CSS adds a short rise to what a
// step reveals, pieces inside a step that settle in order, bars that grow and lines that draw.
// Un-clicked motion runs only on the page the audience is watching (useIsActivePage).
const EASE_OUT = 'cubic-bezier(0.23, 1, 0.32, 1)';
const STEP_MS = 280;
const BUILD_MS = 320;
const BUILD_GAP = 90;
const BAR_MS = 600;
const ENTER_MS = 420;
const ENTER_GAP = 90;
const DRAW_MS = 520;

const MOTION_CSS = `
.rib-deck [data-osd-step] > * { transition: transform ${STEP_MS}ms ${EASE_OUT}; }
.rib-deck [data-osd-step="pending"] > * { transform: translateY(8px); }
.rib-deck .rib-build { transition-property: opacity, transform; transition-duration: ${BUILD_MS}ms; transition-timing-function: ${EASE_OUT}; }
.rib-deck [data-osd-step="pending"] .rib-build { opacity: 0; transform: translateY(10px); }
.rib-deck .rib-bar { transform-origin: left center; transition: transform ${BAR_MS}ms ${EASE_OUT}; }
.rib-deck [data-osd-step="pending"] .rib-bar { transform: scaleX(0); }
.rib-deck .rib-stepdraw { stroke-dasharray: 1; stroke-dashoffset: 0; transition: stroke-dashoffset ${DRAW_MS}ms ${EASE_OUT}; }
.rib-deck [data-osd-step="pending"] .rib-stepdraw { stroke-dashoffset: 1; }
@keyframes rib-in { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: none; } }
.rib-deck .rib-in { animation: rib-in ${ENTER_MS}ms ${EASE_OUT} both; }
@keyframes rib-draw { from { stroke-dashoffset: 1; } to { stroke-dashoffset: 0; } }
.rib-deck .rib-draw { stroke-dasharray: 1; animation: rib-draw ${DRAW_MS}ms ${EASE_OUT} both; }
@keyframes rib-pop { from { opacity: 0; transform: scale(0.75); } to { opacity: 1; transform: scale(1); } }
.rib-deck .rib-pop { transform-box: fill-box; transform-origin: center; animation: rib-pop 300ms ${EASE_OUT} both; }
@keyframes rib-in-fade { from { opacity: 0; } to { opacity: 1; } }
@media (prefers-reduced-motion: reduce) {
  .rib-deck .rib-in, .rib-deck .rib-pop { animation: rib-in-fade 150ms ease both; }
  .rib-deck .rib-draw { animation: none; stroke-dasharray: none; }
  .rib-deck .rib-stepdraw, .rib-deck [data-osd-step="pending"] .rib-stepdraw { transition: none; stroke-dasharray: none; stroke-dashoffset: 0; }
  .rib-deck [data-osd-step] > *, .rib-deck [data-osd-step="pending"] > * { transform: none; transition: none; }
  .rib-deck .rib-build { transition: opacity 150ms ease; transition-delay: 0s !important; }
  .rib-deck [data-osd-step="pending"] .rib-build { transform: none; }
  .rib-deck .rib-bar, .rib-deck [data-osd-step="pending"] .rib-bar { transform: none; transition: none; }
}
`;
const MOTION_STYLE_ID = 'osd-motion-rag-in-business';
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
  return <div className={live ? 'rib-in' : undefined} style={live ? { ...style, animationDelay: enterDelay(i) } : style}>{children}</div>;
};

const InG = ({ i, children }: { i: number; children: ReactNode }) => {
  const live = useIsActivePage();
  return <g className={live ? 'rib-in' : undefined} style={live ? { animationDelay: enterDelay(i) } : undefined}>{children}</g>;
};

// A solid line that draws itself on when the page arrives.
const DrawPath = ({ i, d }: { i: number; d: string }) => {
  const live = useIsActivePage();
  return <path d={d} pathLength={1} className={live ? 'rib-draw' : undefined} style={live ? { animationDelay: enterDelay(i) } : undefined} />;
};

// A solid line inside a <Step>: it draws itself when that step is revealed.
const StepPath = ({ d, i = 0 }: { d: string; i?: number }) => (
  <path d={d} pathLength={1} className="rib-stepdraw" style={buildDelay(i, 60)} />
);

const ink = '#1C1917';
const muted = '#57534E';
const faint = '#948D88'; // strokes and arrows only
const quiet = '#736D68'; // secondary text that must still read on a projector
const rule = '#D6D3D1';
const amber = '#9A6846';
const amberSoft = '#EFE2D4';
const sage = '#DCE5DC';
const okGreen = '#4F7A55';
const blue = '#4A6A8C';
const blueSoft = '#E3EAF1';
const plum = '#7654C7';
const plumSoft = '#EEE7F2';
const display = 'var(--osd-font-display)';

// ---------- Frame ----------

const Title = ({ children }: { children: ReactNode }) => (
  <h1 style={{ fontFamily: '"Libre Baskerville", Georgia, "Times New Roman", serif', fontSize: 132, fontWeight: 400, lineHeight: 1.17, letterSpacing: '-0.035em', maxWidth: 1500, margin: 0, color: ink, whiteSpace: 'pre-line' }}>{children}</h1>
);

// With a source, the footer's left side names where the page's facts come from.
const Footer = ({ source }: { source?: ReactNode }) => {
  const { current, total } = useSlidePageNumber();
  return (
    <div style={{ position: 'absolute', left: 144, right: 144, bottom: 56, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 32, borderTop: '1px solid #E7E5E4', paddingTop: 22, fontSize: 22, color: quiet }}>
      {source ? <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}><strong style={{ fontWeight: 600, color: muted }}>參考</strong>｜{source}</span> : <span>AI 協作課｜延伸：企業怎麼用 RAG</span>}
      <span style={{ flexShrink: 0, whiteSpace: 'nowrap' }}>{String(current).padStart(2, '0')} / {String(total).padStart(2, '0')}</span>
    </div>
  );
};

const Eyebrow = ({ children }: { children: ReactNode }) => (
  <div style={{ fontSize: 24, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#78716C' }}>{children}</div>
);

const Shell = ({ children, top = 112, source }: { children: ReactNode; top?: number; source?: ReactNode }) => (
  <div className="rib-deck" style={{ width: '100%', height: '100%', boxSizing: 'border-box', position: 'relative', display: 'flex', flexDirection: 'column', background: 'var(--osd-bg)', color: 'var(--osd-text)', fontFamily: 'var(--osd-font-body)', padding: `${top}px 144px 126px` }}>
    {children}
    <Footer source={source} />
  </div>
);

// The page's main picture: fills the space between the heading and the footer, centred vertically.
const Fit = ({ children }: { children: ReactNode }) => (
  <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingTop: 24 }}>{children}</div>
);

const Takeaway = ({ children, color = amber, marginTop = 40 }: { children: ReactNode; color?: string; marginTop?: number }) => (
  <div style={{ fontFamily: display, fontSize: 44, lineHeight: 1.35, color, marginTop, textAlign: 'center' }}>{children}</div>
);

const Heading = ({ children }: { children: ReactNode }) => (
  <h2 style={{ fontFamily: display, fontSize: 66, fontWeight: 400, lineHeight: 1.2, letterSpacing: '-0.025em', margin: '40px 0 0', maxWidth: 1620 }}>{children}</h2>
);

const Lead = ({ children }: { children: ReactNode }) => (
  <p style={{ fontSize: 34, lineHeight: 1.5, color: muted, maxWidth: 1560, margin: '18px 0 0' }}>{children}</p>
);

// ---------- Icons ----------
// Line icons on a 64×64 grid, used instead of company logos.
type IconKind = 'globe' | 'doc' | 'building' | 'search' | 'chat' | 'mail' | 'lock' | 'cart' | 'chart' | 'scale';

const IconPaths = ({ kind, color }: { kind: IconKind; color: string }) => (
  <g fill="none" stroke={color} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
    {kind === 'globe' && <><circle cx="32" cy="32" r="24" /><path d="M8 32 H56" /><path d="M32 8 C21 18 21 46 32 56 C43 46 43 18 32 8" /></>}
    {kind === 'doc' && <><path d="M16 6 H40 L50 16 V58 H16 Z" /><path d="M40 6 V16 H50" /><path d="M23 30 H43 M23 39 H43 M23 48 H36" /></>}
    {kind === 'building' && <><path d="M12 58 V14 H40 V58" /><path d="M40 28 H52 V58" /><path d="M6 58 H58" /><path d="M20 22 H24 M28 22 H32 M20 32 H24 M28 32 H32 M20 42 H24 M28 42 H32" /></>}
    {kind === 'search' && <><circle cx="27" cy="27" r="16" /><path d="M39 39 L54 54" /></>}
    {kind === 'chat' && <><path d="M8 12 H56 V42 H30 L18 53 V42 H8 Z" /><path d="M19 24 H45 M19 32 H37" /></>}
    {kind === 'mail' && <><rect x="8" y="14" width="48" height="36" rx="3" /><path d="M8 18 L32 36 L56 18" /></>}
    {kind === 'lock' && <><rect x="14" y="28" width="36" height="28" rx="3" /><path d="M21 28 V20 C21 13 26 9 32 9 C38 9 43 13 43 20 V28" /><path d="M32 38 V46" /></>}
    {kind === 'cart' && <><path d="M6 10 H14 L20 42 H50 L56 20 H17" /><circle cx="24" cy="52" r="4" /><circle cx="46" cy="52" r="4" /></>}
    {kind === 'chart' && <><path d="M8 56 H58" /><path d="M16 56 V38 M28 56 V26 M40 56 V32 M52 56 V14" /></>}
    {kind === 'scale' && <><path d="M32 8 V56 M18 56 H46" /><path d="M10 18 H54" /><path d="M10 18 L4 36 H16 Z M54 18 L48 36 H60 Z" /></>}
  </g>
);

const Icon = ({ kind, size = 64, color = ink }: { kind: IconKind; size?: number; color?: string }) => (
  <svg viewBox="0 0 64 64" style={{ width: size, height: size, display: 'block', flexShrink: 0 }} aria-hidden="true"><IconPaths kind={kind} color={color} /></svg>
);

const SvgIcon = ({ kind, x, y, size = 64, color = ink }: { kind: IconKind; x: number; y: number; size?: number; color?: string }) => (
  <g transform={`translate(${x - size / 2} ${y - size / 2}) scale(${size / 64})`}><IconPaths kind={kind} color={color} /></g>
);

// ---------- Picture helpers ----------
// Pictures are drawn 1:1 on the canvas, so SVG font sizes are real pixel sizes.
const Figure = ({ w = 1632, h, label, children }: { w?: number; h: number; label: string; children: ReactNode }) => (
  <svg viewBox={`0 0 ${w} ${h}`} style={{ display: 'block', width: w, height: h, overflow: 'visible' }} role="img" aria-label={label}>{children}</svg>
);

// A box that stacks SVG layers, so each <Step> can add one layer.
const Stage = ({ w = 1632, h, children }: { w?: number; h: number; children: ReactNode }) => (
  <div style={{ position: 'relative', width: w, height: h }}>{children}</div>
);

const Layer = ({ w = 1632, h, label, children }: { w?: number; h: number; label?: string; children: ReactNode }) => (
  <svg viewBox={`0 0 ${w} ${h}`} style={{ position: 'absolute', inset: 0, width: w, height: h, overflow: 'visible' }} role={label ? 'img' : undefined} aria-label={label} aria-hidden={label ? undefined : true}>{children}</svg>
);

const MapArrow = ({ x1, x2, y, hot = false, color }: { x1: number; x2: number; y: number; hot?: boolean; color?: string }) => {
  const c = color ?? (hot ? amber : faint);
  return <g fill={c} stroke={c}><line x1={x1} y1={y} x2={x2 - 12} y2={y} strokeWidth={hot ? 4 : 3} /><polygon points={`${x2},${y} ${x2 - 16},${y - 9} ${x2 - 16},${y + 9}`} strokeWidth="0" /></g>;
};

// A numbered citation mark, the way answer pages point back to a source.
const Cite = ({ x, y, n, color = amber }: { x: number; y: number; n: number; color?: string }) => (
  <g><rect x={x} y={y - 26} width="34" height="34" rx="17" fill={color} /><text x={x + 17} y={y - 2} textAnchor="middle" fontSize="22" fontWeight="600" fill="#FFFFFF">{n}</text></g>
);

// A grey bar standing for one line of answer text.
const TextBar = ({ x, y, w, fill = rule }: { x: number; y: number; w: number; fill?: string }) => (
  <rect x={x} y={y - 14} width={w} height="14" rx="7" fill={fill} />
);

// ---------- 01 Cover ----------

const Cover: Page = () => (
  <Shell top={174}>
    <In i={0}><Eyebrow>AI WORKSHOP｜延伸</Eyebrow></In>
    <In i={1} style={{ marginTop: 62 }}><Title>{'企業怎麼用\nRAG'}</Title></In>
    <In i={2} style={{ marginTop: 40, fontSize: 35, color: muted }}>不少 AI 產品會先查資料，再回答</In>
    <In i={3} style={{ width: 160, height: 5, background: amber, marginTop: 72 }}><span /></In>
    <div style={{ position: 'absolute', right: 144, bottom: 190 }}>
      <Figure w={700} h={260} label="三種資料來源：網路、你的文件、公司自己的資料，先查過再交給模型，回答附出處">
        <InG i={3}><SvgIcon kind="globe" x={40} y={50} size={60} color={blue} /></InG>
        <InG i={4}><SvgIcon kind="doc" x={40} y={130} size={60} color={plum} /></InG>
        <InG i={5}><SvgIcon kind="building" x={40} y={210} size={60} color={okGreen} /></InG>
        <g fill="none" stroke={faint} strokeWidth="3"><DrawPath i={6} d="M86 50 C170 50 170 130 236 130" /><DrawPath i={6} d="M86 130 H236" /><DrawPath i={6} d="M86 210 C170 210 170 130 236 130" /></g>
        <InG i={7}><rect x="240" y="96" width="150" height="68" fill={ink} /><text x="315" y="140" textAnchor="middle" fontSize="28" fontWeight="600" fill="#FFFFFF">模型</text></InG>
        <InG i={8}><MapArrow x1={398} x2={452} y={130} hot /></InG>
        <InG i={9}>
          <rect x="462" y="62" width="238" height="136" fill="#FFFFFF" stroke={rule} strokeWidth="2" />
          <TextBar x={484} y={100} w={190} />
          <TextBar x={484} y={130} w={150} />
          <Cite x={644} y={136} n={1} />
          <text x="484" y="182" fontSize="24" fill={amber} fontWeight="600">附出處</text>
        </InG>
      </Figure>
    </div>
  </Shell>
);

// ---------- 02 Where RAG looks ----------

// One kind of source on the left of the map: an icon, what it is, and the products that use it.
const SourceBand = ({ y, kind, color, soft, label, products }: { y: number; kind: IconKind; color: string; soft: string; label: string; products: string }) => (
  <g>
    <rect x="0" y={y} width="820" height="128" fill={soft} />
    <rect x="0" y={y} width="8" height="128" fill={color} />
    <SvgIcon kind={kind} x={76} y={y + 64} size={64} color={color} />
    <text x="140" y={y + 54} fontSize="36" fontWeight="600" fill={ink}>{label}</text>
    <text x="140" y={y + 100} fontSize="27" fill={muted}>{products}</text>
  </g>
);

const WhereItLooks: Page = () => (
  <Shell source={'Lewis et al. 2020, Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks, arXiv:2005.11401'}>
    <Eyebrow>先看全貌</Eyebrow>
    <Heading>RAG 的資料從哪裡查</Heading>
    <Lead>步驟都一樣：先查資料，交給模型，回答附出處</Lead>
    <Fit>
      <div style={{ height: 30 }} />
      <Stage h={452}>
        <Layer h={452} label="右邊固定：查到的資料交給模型，回答附出處">
          <InG i={0}>
            <text x="0" y="-14" fontSize="26" fontWeight="600" fill={amber}>R 檢索｜查哪裡？</text>
            <rect x="0" y="0" width="820" height="452" fill="none" stroke={rule} strokeWidth="2" strokeDasharray="10 8" />
          </InG>
          <InG i={1}>
            <rect x="1010" y="186" width="200" height="80" fill={ink} />
            <text x="1110" y="238" textAnchor="middle" fontSize="32" fontWeight="600" fill="#FFFFFF">模型</text>
            <text x="1110" y="300" textAnchor="middle" fontSize="24" fill={quiet}>A 增強：問題加上查到的資料</text>
          </InG>
          <InG i={2}>
            <MapArrow x1={1222} x2={1290} y={226} hot />
            <rect x="1300" y="130" width="332" height="192" fill="#FFFFFF" stroke={rule} strokeWidth="2" />
            <TextBar x={1328} y={182} w={270} />
            <TextBar x={1328} y={216} w={230} />
            <TextBar x={1328} y={250} w={180} />
            <Cite x={1520} y={256} n={1} />
            <Cite x={1562} y={256} n={2} />
            <text x="1328" y="300" fontSize="24" fontWeight="600" fill={amber}>G 生成：回答附出處</text>
          </InG>
        </Layer>
        <Steps>
          <Step duration={STEP_MS}><Layer h={452} label="網路：ChatGPT 搜尋、Perplexity、Google AI 摘要">
            <g className="rib-build" style={buildDelay(0)}><SourceBand y={14} kind="globe" color={blue} soft={blueSoft} label="網路上的網頁" products="ChatGPT 搜尋、Perplexity、Google AI 摘要" /></g>
            <g className="rib-build" style={buildDelay(1)} fill="none" stroke={blue} strokeWidth="3"><StepPath d="M820 78 C920 78 920 214 1004 214" i={1} /></g>
          </Layer></Step>
          <Step duration={STEP_MS}><Layer h={452} label="你自己的文件：NotebookLM">
            <g className="rib-build" style={buildDelay(0)}><SourceBand y={162} kind="doc" color={plum} soft={plumSoft} label="你自己的文件" products="NotebookLM（現名 Gemini Notebook）" /></g>
            <g className="rib-build" style={buildDelay(1)} fill="none" stroke={plum} strokeWidth="3"><StepPath d="M820 226 H1004" i={1} /></g>
          </Layer></Step>
          <Step duration={STEP_MS}><Layer h={452} label="公司自己的資料：Amazon 購物助理、摩根士丹利、Klarna 客服">
            <g className="rib-build" style={buildDelay(0)}><SourceBand y={310} kind="building" color={okGreen} soft={sage} label="公司自己的資料" products="Amazon 購物助理、摩根士丹利、Klarna 客服" /></g>
            <g className="rib-build" style={buildDelay(1)} fill="none" stroke={okGreen} strokeWidth="3"><StepPath d="M820 374 C920 374 920 238 1004 238" i={1} /></g>
          </Layer></Step>
        </Steps>
      </Stage>
      <Steps><Step duration={STEP_MS}><Takeaway>用的模型可能一樣，差別在查的是哪份資料</Takeaway></Step></Steps>
    </Fit>
  </Shell>
);

// ---------- 03 Searching the web ----------

// A real screenshot in a plain browser frame (address bar with the site name).
const Screenshot = ({ src, width, aspect, boxH, url, alt, children }: { src: string; width: number; aspect: number; boxH?: number; url?: string; alt: string; children?: ReactNode }) => (
  <div style={{ width, background: '#FFFFFF' }}>
    {url ? (
      <div style={{ height: 52, boxSizing: 'border-box', background: '#ECEAE8', border: `1px solid ${rule}`, borderBottom: 'none', display: 'flex', alignItems: 'center', gap: 10, padding: '0 18px' }}>
        <span style={{ width: 12, height: 12, borderRadius: 6, background: '#D87771' }} />
        <span style={{ width: 12, height: 12, borderRadius: 6, background: '#E4BB62' }} />
        <span style={{ width: 12, height: 12, borderRadius: 6, background: '#81B984' }} />
        <span style={{ flex: 1, marginLeft: 14, background: '#FFFFFF', borderRadius: 18, padding: '4px 18px', fontSize: 23, color: ink }}>{url}</span>
      </div>
    ) : null}
    <div style={{ width, height: boxH ?? Math.round(width / aspect), boxSizing: 'border-box', border: `1px solid ${rule}`, background: '#FFFFFF', boxShadow: '0 10px 30px rgba(28,25,23,0.08)', position: 'relative' }}>
      <div style={{ position: 'relative', width: '100%', height: Math.round(width / aspect) }}>
        <img src={src} alt={alt} style={{ width: '100%', height: '100%', display: 'block' }} />
        {children}
      </div>
    </div>
  </div>
);

// An outline over one region of a screenshot (in % of the image), landing with its <Step>.
// The same outline in pixels, for a mark that lands in the same <Step> as the note beside it.
const PxMark = ({ x, y, w, h }: { x: number; y: number; w: number; h: number }) => (
  <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, border: '4px solid #E9B650', boxSizing: 'border-box', zIndex: 2 }} />
);

const Mark = ({ x, y, w, h }: { x: number; y: number; w: number; h: number }) => (
  <div style={{ position: 'absolute', left: `${x}%`, top: `${y}%`, width: `${w}%`, height: `${h}%`, border: '4px solid #E9B650', boxSizing: 'border-box' }} />
);

const NumDot = ({ n, size = 44 }: { n: number; size?: number }) => (
  <span style={{ flex: '0 0 auto', width: size, height: size, borderRadius: size / 2, background: amber, color: '#FFFFFF', display: 'grid', placeItems: 'center', fontSize: Math.round(size * 0.57), fontWeight: 600 }}>{n}</span>
);

// One numbered note in the column beside a screenshot.
const SideNote = ({ n, title, children }: { n: number; title: ReactNode; children?: ReactNode }) => (
  <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
    <NumDot n={n} />
    <div>
      <div style={{ fontSize: 32, fontWeight: 600, lineHeight: 1.3 }}>{title}</div>
      {children ? <div style={{ fontSize: 26, color: muted, lineHeight: 1.45, marginTop: 6 }}>{children}</div> : null}
    </div>
  </div>
);

// Both answers to the same question, at full size: each click lays the next one over the last.
const SEARCH_W = 1160;
const SEARCH_H = Math.round(SEARCH_W / (1570 / 783)); // the taller (ChatGPT) image sets the frame for both
const SearchShot = ({ src, aspect, url, alt, children }: { src: string; aspect: number; url: string; alt: string; children?: ReactNode }) => (
  <div style={{ position: 'absolute', left: 0, top: 0, width: SEARCH_W }}>
    <Screenshot src={src} width={SEARCH_W} aspect={aspect} boxH={SEARCH_H} url={url} alt={alt}>{children}</Screenshot>
  </div>
);

const SideColumn = ({ top, children }: { top: number; children: ReactNode }) => (
  <div style={{ position: 'absolute', left: SEARCH_W + 52, right: 0, top }}>{children}</div>
);

const WebSearch: Page = () => (
  <Shell source={'OpenAI〈Introducing ChatGPT search〉2024-10-31；Google〈AI Overviews〉2024-05-14；Perplexity 說明中心'}>
    <Eyebrow>資料來源 1｜網路</Eyebrow>
    <Heading>上網查完再回答：同一題問兩個 AI</Heading>
    <Fit>
      <div style={{ position: 'relative', height: 52 + SEARCH_H }}>
        <SearchShot src={chatgptSearch} aspect={1570 / 783} url="chatgpt.com" alt="ChatGPT 搜尋實際畫面：問「草船借箭是真的歷史嗎？請搜尋網路，用三句話回答並附來源」。回答第一句是「草船借箭並非完全虛構，但《三國演義》中諸葛亮借箭的情節並非正史記載」，說歷史原型可能是孫權，最後列出兩個資料來源：中央電視台、中國文化研究院">
          <Steps><Step duration={STEP_MS}><Mark x={0.5} y={68} w={72} h={25} /></Step></Steps>
        </SearchShot>
        <SideColumn top={0}>
          <SideNote n={1} title="ChatGPT 搜尋">回答最後列出「資料來源」</SideNote>
        </SideColumn>
        <Steps>
          <Step duration={STEP_MS}>
            <SearchShot src={googleOverview} aspect={1338 / 594} url="google.com" alt="Google 搜尋「草船借箭是真的歷史嗎」的 AI 摘要實際畫面：第一句是「不是。在正史中，草船借箭完全是《三國演義》作者羅貫中虛構的文學情節」，句尾附「風傳媒 +2」的來源標記；下一段說真正主角是東吳之主孫權，附 YouTube 來源">
              <Mark x={0.8} y={30.5} w={13.5} h={11} />
            </SearchShot>
            <SideColumn top={170}>
              <SideNote n={2} title="Google AI 摘要">句子後面的「風傳媒 +2」是引用的網頁</SideNote>
            </SideColumn>
          </Step>
          <Step duration={STEP_MS}>
            <SideColumn top={360}>
              <div style={{ fontFamily: display, fontSize: 38, lineHeight: 1.4, color: amber }}>兩邊開頭的說法不一樣，哪個對？</div>
            </SideColumn>
          </Step>
        </Steps>
      </div>
    </Fit>
  </Shell>
);

// ---------- 04 Who is right: back to the source ----------

// One answer's opening line, with the verdict that lands once the source is on screen.
const ClaimCard = ({ who, quote, ok, verdict }: { who: string; quote: string; ok: boolean; verdict: string }) => (
  <div style={{ background: '#FFFFFF', border: `1px solid ${rule}`, padding: '24px 30px', boxSizing: 'border-box' }}>
    <div style={{ fontSize: 26, fontWeight: 600, color: quiet }}>{who}</div>
    <div style={{ fontSize: 30, lineHeight: 1.5, marginTop: 8 }}>{quote}</div>
    <Steps>
      <Step duration={STEP_MS}>
        <div style={{ display: 'flex', gap: 14, alignItems: 'baseline', marginTop: 16, fontSize: 27, lineHeight: 1.45 }}>
          <span style={{ flexShrink: 0, background: ok ? okGreen : amber, color: '#FFFFFF', fontWeight: 600, padding: '2px 14px' }}>{ok ? '對得上' : '說太滿'}</span>
          <span style={{ color: muted }}>{verdict}</span>
        </div>
      </Step>
    </Steps>
  </div>
);

const SourceCheck: Page = () => (
  <Shell source={'陳壽《三國志・吳書・吳主傳》裴松之注引《魏略》（維基文庫）'}>
    <Eyebrow>誰說得對？回到原文</Eyebrow>
    <Heading>核對來源：兩個回答和原文對一對</Heading>
    <Fit>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
        {/* The source lands first (first <Steps> in the page), but sits under the two answers. */}
        <div style={{ order: 2 }}>
          <Steps>
            <Step duration={STEP_MS}>
              <div style={{ background: amberSoft, borderLeft: `8px solid ${amber}`, padding: '24px 36px' }}>
                <div style={{ fontSize: 25, fontWeight: 600, color: amber }}>原文｜《三國志》裴松之注引《魏略》，寫的是建安十八年（213 年）的事</div>
                <div style={{ fontFamily: display, fontSize: 36, lineHeight: 1.5, marginTop: 10 }}>權乘大船來觀軍，公使弓弩亂發，箭著其船，船偏重將覆，權因回船，復以一面受箭，箭均船平，乃還。</div>
                <div style={{ fontSize: 28, color: muted, marginTop: 8 }}>白話：孫權坐船來看曹軍，曹操下令放箭，船一邊中箭快翻了；孫權掉頭用另一邊接箭，船平了才回去。</div>
              </div>
            </Step>
          </Steps>
        </div>
        <div style={{ order: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40 }}>
          <ClaimCard who="ChatGPT 搜尋" quote="「草船借箭並非完全虛構，但《三國演義》中諸葛亮借箭的情節並非正史記載」" ok verdict="原文真的有船中箭、掉頭再受箭，主角是孫權" />
          <ClaimCard who="Google AI 摘要" quote="「在正史中，『草船借箭』完全是《三國演義》作者羅貫中虛構的文學情節」" ok={false} verdict="諸葛亮借箭是小說沒錯，但原文有類似的事，不算「完全」虛構" />
        </div>
        <div style={{ order: 3 }}>
          <Steps><Step duration={STEP_MS}><Takeaway marginTop={4}>大方向兩邊都對；用詞準不準，要看原文才知道</Takeaway></Step></Steps>
        </div>
      </div>
    </Fit>
  </Shell>
);

// ---------- 05 Your own documents: NotebookLM ----------

const NotebookLM: Page = () => (
  <Shell source={'Google NotebookLM 說明中心；Google 部落格 2024-06-06、2026-07-16；原文：維基文庫《三國演義》第 46 回'}>
    <Eyebrow>資料來源 2｜你自己的文件</Eyebrow>
    <Heading>上傳原文再提問：NotebookLM</Heading>
    <Fit>
      <div style={{ display: 'grid', gridTemplateColumns: '1000px 1fr', gap: 52, alignItems: 'start' }}>
        <div style={{ position: 'relative' }}>
          <In i={0}>
            <Screenshot src={notebooklmAnswer} width={1000} aspect={1195 / 526} url="notebook.google.com" alt="NotebookLM（現名 Gemini Notebook）實際畫面：來源只有第046回.md，問「諸葛亮借到幾支箭？每艘船大約有幾支？」，回答「總借箭數：共借到十萬餘枝箭」「每艘船箭數：平均每艘船大約有五六千枝箭」，兩句後面都附編號 1" />
          </In>
          <div style={{ display: 'grid', gap: 18, marginTop: 28 }}>
            <In i={1}><SideNote n={1} title="來源只放第 46 回原文，再問借到幾支箭" /></In>
            <Steps>
              <Step duration={STEP_MS}><PxMark x={616} y={376} w={52} h={50} /><SideNote n={2} title="每句後面的編號 1，就是出處" /></Step>
            </Steps>
          </div>
        </div>
        <div>
          <Steps>
            <Step duration={STEP_MS}>
              <div style={{ fontSize: 27, fontWeight: 600, color: amber, marginBottom: 12 }}>點編號 1，左邊打開第046回.md，標出這一段</div>
              <Screenshot src={notebooklmSource} width={580} aspect={685 / 594} alt="點了編號 1 之後，左邊打開來源第046回.md，原文被標成灰底：「卻說孔明回船謂魯肅曰：每船上箭約五六千矣。不費江東半分之力，已得十萬餘箭。」">
                <Mark x={0} y={73} w={100} h={27} />
              </Screenshot>
            </Step>
            <Step duration={STEP_MS}>
              <div style={{ fontFamily: display, fontSize: 36, lineHeight: 1.4, color: amber, marginTop: 24 }}>「五六千」「十萬餘」都對得上原文</div>
            </Step>
          </Steps>
        </div>
      </div>
    </Fit>
  </Shell>
);

// ---------- 06 Company data: Amazon's shopping assistant ----------

const ShoppingAssistant: Page = () => (
  <Shell source={'Amazon〈Amazon Rufus〉aboutamazon.com（官方範例畫面）；Amazon 2025 Q4 財報 2026-02-05'}>
    <Eyebrow>資料來源 3｜公司自己的資料：商品</Eyebrow>
    <Heading>購物助理：根據商品說明回答</Heading>
    <Fit>
      <div style={{ display: 'grid', gridTemplateColumns: '680px 1fr', gap: 64, alignItems: 'center' }}>
        <In i={0}>
          <div style={{ fontSize: 24, color: quiet, marginBottom: 10 }}>Amazon 官方公布的 Rufus 畫面</div>
          <Screenshot src={rufusChat} width={680} aspect={380 / 343} alt="Amazon 官方公布的 Rufus 對話畫面：顧客問這支匹克球拍適不適合初學者，Rufus 回答適合；顧客再問 does it come with a case?（有附收納套嗎？），Rufus 回答 Yes, it comes with a case. According to the product description, this pickleball paddle comes with a fashionable paddle cover">
            <Steps><Step duration={STEP_MS}><Mark x={9} y={64} w={90} h={26} /></Step></Steps>
          </Screenshot>
        </In>
        <div style={{ display: 'grid', gap: 36 }}>
          <In i={1}><SideNote n={1} title="顧客問：有附球拍套嗎？">does it come with a case?</SideNote></In>
          <Steps>
            <Step duration={STEP_MS}><SideNote n={2} title="回答說了根據哪裡">「According to the product description」＝根據商品說明</SideNote></Step>
            <Step duration={STEP_MS}><SideNote n={3} title="主要查 Amazon 自己的資料">商品頁、顧客評論、顧客問答，也會用網路上的資料</SideNote></Step>
            <Step duration={STEP_MS}><div style={{ fontFamily: display, fontSize: 36, lineHeight: 1.4, color: amber }}>回答對不對，回商品頁看說明就知道</div></Step>
          </Steps>
        </div>
      </div>
    </Fit>
  </Shell>
);

// ---------- 07 Company data: Morgan Stanley ----------

// A small stack of documents inside a picture.
const DocStack = ({ x, y }: { x: number; y: number }) => (
  <g>
    <rect x={x + 36} y={y} width="150" height="180" fill="#FFFFFF" stroke={okGreen} strokeWidth="2" />
    <rect x={x + 18} y={y + 16} width="150" height="180" fill="#FFFFFF" stroke={okGreen} strokeWidth="2" />
    <rect x={x} y={y + 32} width="150" height="180" fill={sage} stroke={okGreen} strokeWidth="3" />
    <path d={`M${x + 24} ${y + 84} H${x + 126} M${x + 24} ${y + 116} H${x + 126} M${x + 24} ${y + 148} H${x + 96}`} stroke={okGreen} strokeWidth="5" strokeLinecap="round" />
  </g>
);

// One published number with what it means.
const StatTile = ({ big, unit, children }: { big: string; unit: string; children: ReactNode }) => (
  <div style={{ background: '#FFFFFF', border: `1px solid ${rule}`, borderTop: `6px solid ${okGreen}`, padding: '22px 30px' }}>
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
      <span style={{ fontFamily: display, fontSize: 64, lineHeight: 1, color: amber }}>{big}</span>
      <span style={{ fontSize: 30, fontWeight: 600 }}>{unit}</span>
    </div>
    <div style={{ fontSize: 26, color: muted, lineHeight: 1.45, marginTop: 10 }}>{children}</div>
  </div>
);

const MorganStanley: Page = () => (
  <Shell source={'Morgan Stanley 新聞稿 2024-06-26；OpenAI 客戶案例〈Morgan Stanley〉'}>
    <Eyebrow>資料來源 3｜公司自己的資料：研究報告</Eyebrow>
    <Heading>理財顧問的助理：摩根士丹利</Heading>
    <Fit>
      <Figure h={300} label="理財顧問把客戶的問題交給 AI 助理，助理從公司的研究和知識資料（約 10 萬份文件）找答案，再回答給理財顧問">
        <InG i={0}>
          <circle cx="110" cy="96" r="44" fill={amberSoft} stroke={amber} strokeWidth="3" />
          <path d="M40 220 C40 160 180 160 180 220" fill={amberSoft} stroke={amber} strokeWidth="3" />
          <text x="110" y="276" textAnchor="middle" fontSize="30" fontWeight="600" fill={ink}>理財顧問</text>
        </InG>
        <InG i={1}>
          <MapArrow x1={210} x2={560} y={110} hot />
          <text x="385" y="88" textAnchor="middle" fontSize="28" fill={ink}>問：客戶問到的問題</text>
        </InG>
        <InG i={2}>
          <rect x="574" y="60" width="300" height="130" fill={ink} />
          <text x="724" y="122" textAnchor="middle" fontSize="34" fontWeight="600" fill="#FFFFFF">AI 助理</text>
          <text x="724" y="164" textAnchor="middle" fontSize="24" fill="#D6D3D1">2023 年 9 月全面上線</text>
        </InG>
        <InG i={3}>
          <MapArrow x1={890} x2={1110} y={124} color={okGreen} />
          <text x="1000" y="102" textAnchor="middle" fontSize="28" fill={okGreen}>先查</text>
          <DocStack x={1130} y={20} />
          <text x="1360" y="110" fontSize="30" fontWeight="600" fill={ink}>公司的研究</text>
          <text x="1360" y="152" fontSize="30" fontWeight="600" fill={ink}>和知識資料</text>
          <text x="1360" y="194" fontSize="26" fill={muted}>約 10 萬份文件</text>
        </InG>
        <InG i={4}>
          <path d="M574 172 H214" stroke={amber} strokeWidth="4" fill="none" />
          <polygon points="200,172 216,163 216,181" fill={amber} />
          <text x="385" y="214" textAnchor="middle" fontSize="28" fill={amber}>回答</text>
        </InG>
      </Figure>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, marginTop: 36 }}>
        <Steps>
          <Step duration={STEP_MS}><StatTile big="10 萬份" unit="公司文件">AI 助理能查的範圍</StatTile></Step>
          <Step duration={STEP_MS}><StatTile big="98%" unit="理財顧問團隊在用">官方 2024 年 6 月公布</StatTile></Step>
        </Steps>
      </div>
    </Fit>
  </Shell>
);

// ---------- 08 Customer service: Klarna ----------

// One bar of the before/after comparison; it grows when its step is revealed.
const TimeBar = ({ label, minutes, text, color }: { label: string; minutes: number; text: string; color: string }) => (
  <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', alignItems: 'center', gap: 20 }}>
    <span style={{ fontSize: 30, fontWeight: 600 }}>{label}</span>
    <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
      <div className="rib-bar" style={{ width: minutes * 60, height: 46, background: color }} />
      <span style={{ fontSize: 30, fontWeight: 600, color }}>{text}</span>
    </div>
  </div>
);

const Klarna: Page = () => (
  <Shell source={'Klarna 新聞稿 2024-02-27；Bloomberg 2025-05-08；TechCrunch 2025-06-04'}>
    <Eyebrow>資料來源 3｜公司自己的資料：客服</Eyebrow>
    <Heading>AI 客服：Klarna 上線第一個月</Heading>
    <Lead>Klarna 是瑞典的購物分期付款公司，AI 客服處理退款、退貨、付款問題</Lead>
    <Fit>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 40 }}>
        <In i={0}><StatTile big="230 萬" unit="次對話">上線第一個月（2024 年 2 月）</StatTile></In>
        <In i={1}><StatTile big="2/3" unit="的客服對話">由 AI 客服處理</StatTile></In>
        <In i={2}><StatTile big="35+" unit="種語言">全天 24 小時都能問</StatTile></In>
      </div>
      <div style={{ display: 'grid', gap: 22, marginTop: 40 }}>
        <div style={{ fontSize: 26, color: quiet }}>解決一個問題要多久</div>
        <Steps>
          <Step duration={STEP_MS}><TimeBar label="AI 上線前" minutes={11} text="11 分鐘" color={faint} /></Step>
          <Step duration={STEP_MS}><TimeBar label="AI 客服" minutes={2} text="不到 2 分鐘" color={okGreen} /></Step>
          <Step duration={STEP_MS}>
            <div style={{ background: amberSoft, borderLeft: `8px solid ${amber}`, padding: '18px 30px', fontSize: 29, lineHeight: 1.5, marginTop: 12 }}>
              <strong style={{ color: amber }}>2025 年</strong>，Klarna 執行長說：當初太在意省錢，客服品質變差了。所以又找回真人客服，讓客人想找真人時找得到。
            </div>
          </Step>
        </Steps>
      </div>
    </Fit>
  </Shell>
);

// ---------- 09 Air Canada ----------

// A full link to copy sits on its own line under the footer rule.
const FooterUrl = ({ href }: { href: string }) => (
  <a href={href} target="_blank" rel="noreferrer" style={{ position: 'absolute', left: 144, bottom: 18, fontSize: 22, lineHeight: '26px', color: amber, textDecoration: 'underline', textUnderlineOffset: 3, whiteSpace: 'nowrap' }}>{href}</a>
);

const NEWS_URL = 'https://news.ltn.com.tw/news/world/breakingnews/4584025';
const NEWS_W = 850;

const AirCanada: Page = () => (
  <Shell source={'自由時報 2024-02-20；判決 Moffatt v. Air Canada, 2024 BCCRT 149（2024-02-14）'}>
    <Eyebrow>反面教材｜新聞</Eyebrow>
    <Heading>客服機器人答錯，公司要負責：加拿大航空</Heading>
    <Fit>
      <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: `${NEWS_W}px 1fr`, gap: 56, alignItems: 'start' }}>
        <In i={0}>
          <Screenshot src={newsLtn} width={NEWS_W} aspect={1711 / 1222} url="news.ltn.com.tw" alt="自由時報 2024 年 2 月 20 日新聞〈AI浪潮下首起判決！聊天機器人誤導客戶 加航需賠償〉：2022 年 11 月莫法特為參加祖母葬禮買機票，加航官網的聊天機器人說他只要在 90 天內申請退款，就會依喪親規定退還部分票價；事後才知道喪親優惠必須在出發前申請" />
        </In>
        <div style={{ display: 'grid', gap: 34, paddingTop: 60 }}>
          <Steps>
            <Step duration={STEP_MS}><PxMark x={47} y={444} w={799} h={79} /><SideNote n={1} title="機器人說">90 天內申請，就能退部分票價</SideNote></Step>
            <Step duration={STEP_MS}><PxMark x={47} y={541} w={799} h={109} /><SideNote n={2} title="公司規定">喪親優惠要在出發前申請</SideNote></Step>
            <Step duration={STEP_MS}><SideNote n={3} title="仲裁結果：加航要賠 812 加元">新聞原文：「顧客沒有責任區分企業網站上的準確資訊和不準確資訊」</SideNote></Step>
            <Step duration={STEP_MS}><div style={{ fontFamily: display, fontSize: 38, lineHeight: 1.4, color: amber }}>機器人的回答，要對得上公司規定</div></Step>
          </Steps>
        </div>
      </div>
    </Fit>
    <FooterUrl href={NEWS_URL} />
  </Shell>
);

export const meta: SlideMeta = {
  title: '企業怎麼用 RAG',
  createdAt: '2026-10-30T14:28:51.809Z',
  theme: 'thoughtstream',
};

const deck: Page[] = [Cover, WhereItLooks, WebSearch, SourceCheck, NotebookLM, ShoppingAssistant, MorganStanley, Klarna, AirCanada];
export default deck satisfies Page[];

// Page changes: the outgoing page holds, the incoming one rises 6px as it fades in.
const HOLD: Keyframe[] = [{ opacity: 1 }, { opacity: 1 }];
export const transition: SlideTransition = {
  duration: 260,
  exit: { duration: 260, easing: 'cubic-bezier(0.4, 0, 1, 1)', keyframes: HOLD },
  enter: { duration: 260, easing: EASE_OUT, keyframes: [{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'translateY(0)' }] },
};

const NOTES = new Map<Page, string>([
  [Cover, `這一段是延伸。前面我們在筆記庫裡做 RAG：請 Codex 先查筆記，再回答，附上檔名。
不少 AI 產品背後也是這個做法：先查資料，再回答，附上出處。接下來看幾個實際的例子。`],
  [WhereItLooks, `先看全貌。RAG 三步：R 檢索，先查資料；A 增強，把問題和查到的資料一起交給模型；G 生成，回答附上出處。右邊這一段每家都差不多，差別在左邊：去哪裡查。
按一下：第一種查網路上的網頁，像 ChatGPT 搜尋、Perplexity、Google 的 AI 摘要。
按一下：第二種查你自己的文件，像 Google 的 NotebookLM，2026 年 7 月改名 Gemini Notebook。
按一下：第三種查公司自己的資料，像 Amazon 的購物助理、摩根士丹利給理財顧問的助理、Klarna 的 AI 客服。
最後一下：用的模型可能一樣，差別在查的是哪份資料。
補充：這些公司的官方說明大多不寫「RAG」這個詞，寫的是「搜尋網路」「根據你的資料」。做法和 RAG 一樣，都是先查再答。`],
  [WebSearch, `第一種：查網路。同一題問兩個 AI：「草船借箭是真的歷史嗎？」畫面是 2026-10-30 沒登入時的實際截圖。
先看 ChatGPT 搜尋。OpenAI 在 2024 年 10 月 31 日推出，2025 年 2 月起不用登入也能用。按一下：回答最後列出「資料來源」，每一條都能點開。
按一下：Google 的 AI 摘要。2024 年 5 月先在美國推出，同年 10 月台灣也有，2025 年 5 月起支援中文；2025 年 7 月 Google 說每月超過 20 億人用。框起來的「風傳媒 +2」，是這句話引用的網頁：風傳媒，加上另外 2 個來源。
按一下：兩邊開頭的說法不一樣。ChatGPT 說「並非完全虛構」，Google 說「完全是虛構」。哪個對？下一頁回原文看。AI 每次回答可能不同，大家課後自己問，結果可能和畫面不一樣。
另外 Perplexity 也是同一種做法：它說自己會搜尋網路、找可信的來源再整理成回答，回答裡附來源連結；官方說明也建議使用者再核對來源。2025 年 5 月執行長說一個月約有 7.8 億次提問。現在要登入才能用，所以這裡沒放截圖。`],
  [SourceCheck, `上一頁兩個回答開頭不一樣，我們回原文看。
畫面上是兩個回答的第一句。先請大家猜：哪個對？
按一下：這是原文。《三國志》的〈吳主傳〉，裴松之的注引了《魏略》，記建安十八年，也就是 213 年，在濡須和曹操對峙的時候：孫權坐大船來看曹軍，曹操叫弓箭手亂射，箭插滿船的一邊，船快翻了；孫權把船掉頭，用另一邊接箭，兩邊一樣重，船平了才回去。
按一下：ChatGPT 說「並非完全虛構」，對得上：原文真的有船中箭、掉頭再受箭這件事，只是主角是孫權，而且他不是去借箭的。
按一下：Google 說「完全是虛構的文學情節」。諸葛亮三天借十萬枝箭，原文確實沒有，這部分沒錯；但原文有一件很像的事，說「完全」虛構就說得太滿了。Google 下一段其實也寫了原型是孫權。
最後一下：大方向兩邊都對，用詞準不準，要回原文才知道。這就是附出處的用處：說法不一樣時，有地方可以查。`],
  [NotebookLM, `第二種：查你自己的文件。這是我實際跑的 NotebookLM（現在叫 Gemini Notebook），2026-10-31 截圖。
來源只放一個檔案：課程筆記庫裡的第 46 回原文，就是草船借箭那一回。然後問：「諸葛亮借到幾支箭？每艘船大約有幾支？」
它回答：總共十萬餘枝，每艘船大約五六千枝。按一下：框起來的編號 1，就是這句的出處。
按一下：點了編號 1，左邊打開第046回.md，把原文那一段標起來：「每船上箭約五六千矣……已得十萬餘箭。」
最後一下：「五六千」「十萬餘」都對得上原文。下面幾句細節我也對過：「輕快船二十隻」「當夜五更時候」，原文也有。
NotebookLM 的回答根據你放的來源，旁邊附編號，點編號會跳到原文那一段；免費版一個筆記本最多放 50 個來源。它也可以幫你上網找新來源，剛才我沒有用這個功能。
這和我們課堂上請 Codex 查筆記庫是同一種做法：資料是你給的，回答要對得上這些資料。`],
  [ShoppingAssistant, `第三種：查公司自己的資料。先看 Amazon 的購物助理 Rufus，2024 年 2 月推出，2026 年 5 月改名 Alexa for Shopping。左邊是 Amazon 官方公布的畫面。
顧客在一支匹克球拍的商品頁問：「有附球拍套嗎？」
按一下：框起來的是 Rufus 的回答：「有。根據商品說明，這支球拍附一個球拍套，可以防刮。」
按一下：它說了根據哪裡：According to the product description，根據商品說明。
按一下：Amazon 說 Rufus 用的是 Amazon 的商品目錄、顧客評論、顧客問答，也會用網路上的資料；在商品頁上，它根據商品說明、評論和問答回答。2025 年第四季財報說，這一年有超過 3 億位顧客用過。
最後一下：回答對不對，回商品頁看說明就知道。`],
  [MorganStanley, `再看摩根士丹利，美國的大型投資銀行。
理財顧問遇到客戶的問題，可以直接問 AI 助理；助理先查公司的研究和知識資料，再回答。官方的說法是讓理財顧問「快速查到摩根士丹利所有的研究與知識資料」。這個助理 2023 年 9 月全面上線，用的是 OpenAI 的模型。
按一下：助理能查的公司文件大約有 10 萬份。補充一句：摩根士丹利的負責人在 OpenAI 的客戶案例裡說，早期這個助理大約只能回答 7,000 個問題，後來這 10 萬份文件裡的問題都能回答。
按一下：2024 年 6 月官方公布，98% 的理財顧問團隊在用。
這裡我們沒有實際畫面，因為這是公司內部系統。`],
  [Klarna, `最後一個是智慧客服。Klarna 是瑞典的購物分期付款公司，2024 年 2 月公布 AI 客服上線第一個月的成績：聊了 230 萬次，占客服對話的三分之二，支援 35 種以上語言，全天 24 小時都能問。用的是 OpenAI 的模型，處理退款、退貨、付款問題。
按一下：AI 上線前，解決一個問題要 11 分鐘；按一下：AI 客服不到 2 分鐘。
按一下：不過到了 2025 年 5 月，Klarna 執行長接受 Bloomberg 訪問時說，當初太在意省錢，客服品質變差了。所以他們又找回真人客服，讓客人想找真人時找得到。AI 客服還在，現在是 AI 和真人一起服務。
AI 客服回得快，但如果答錯了，誰要負責？下一頁看一則新聞。`],
  [AirCanada, `最後是反面教材，這是自由時報 2024 年 2 月 20 日的新聞，網址在下方。
2022 年 11 月，加拿大的莫法特要去參加祖母的葬禮，在加拿大航空官網問客服機器人。按一下：新聞框起來這段，機器人說只要在 90 天內申請，就會依喪親規定退還部分票價。
按一下：下一段，加航的規定其實是喪親優惠要在出發前申請，事後不退。
按一下：莫法特向民事仲裁庭求償。加航主張機器人是「對自身行為負責的獨立法律個體」，仲裁員不接受，說顧客沒有責任分辨網站上哪些資訊對、哪些不對。加航要賠 812.02 加元，裡面是損害 650.88、利息和仲裁費；新聞換算約新台幣 1.9 萬元。
最後一下：機器人的回答算公司說的，所以要對得上公司規定。這也是 RAG 要附出處的原因：回答旁邊附上規定原文，答錯時比較容易被發現。
補充：判決書沒有寫這個機器人用什麼技術，所以這裡不說它是不是 RAG，只用它說明「機器人答錯，公司要負責」。`],
]);

export const notes: (string | undefined)[] = deck.map(page => NOTES.get(page));
