import type { DesignSystem, Page, SlideMeta, SlideTransition } from '@open-slide/core';
import { Step, Steps, useSlidePageNumber } from '@open-slide/core';
import { useState, type ReactNode } from 'react';
import downloadPage from './assets/obsidian-download-page.png';
import firstLaunch from './assets/obsidian-first-launch.png';
import dgSettings from './assets/dg-settings-github.png';
import dgPalette from './assets/dg-command-palette.png';
import githubClone from './assets/github-clone-https.png';
import vaultZip from './assets/three-kingdoms-vault.zip?url';
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

const ink = '#1C1917';
const muted = '#57534E';
const quiet = '#736D68';
const rule = '#D6D3D1';
const surface = '#F5F5F4';
const amber = '#9A6846';
const mono = '"Source Code Pro", Consolas, Menlo, monospace';
const publicVaultUrl = 'https://raw.githubusercontent.com/Chrouos/AI-workshop-slides/main/slides/obsidian-agent-knowledge-garden/assets/three-kingdoms-vault.zip';
const motionEaseOut = 'cubic-bezier(0.23, 1, 0.32, 1)';

const chapterTransition: SlideTransition = {
  duration: 240,
  exit: { keyframes: [{ opacity: 1 }, { opacity: 1 }] },
  enter: {
    easing: motionEaseOut,
    keyframes: [
      { opacity: 0, transform: 'translateY(8px)' },
      { opacity: 1, transform: 'translateY(0)' },
    ],
  },
};

const motionCss = `
  @keyframes garden-rise {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes garden-fade {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  @keyframes garden-time {
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
  }
  .garden-cover-title { animation: garden-rise 240ms ${motionEaseOut} both; }
  .garden-cover-subtitle { animation: garden-rise 240ms ${motionEaseOut} 60ms both; }
  .garden-cover-rule { animation: garden-rise 240ms ${motionEaseOut} 120ms both; }
  .garden-practice-time { animation: garden-time 200ms ${motionEaseOut} both; }
  .garden-site-preview { animation: garden-rise 240ms ${motionEaseOut} both; }
  .garden-story-person {
    opacity: 0;
    transform: translateY(8px);
    transition: opacity 340ms ${motionEaseOut}, transform 340ms ${motionEaseOut};
  }
  [data-osd-step="revealed"] .garden-story-person { opacity: 1; transform: translateY(0); }
  .garden-story-link {
    stroke-dasharray: 1;
    stroke-dashoffset: 1;
    transition: stroke-dashoffset 700ms ${motionEaseOut};
  }
  [data-osd-step="revealed"] .garden-story-link { stroke-dashoffset: 0; }
  @media (prefers-reduced-motion: reduce) {
    .garden-cover-title, .garden-cover-subtitle, .garden-cover-rule,
    .garden-practice-time, .garden-site-preview { animation: garden-fade 200ms ${motionEaseOut} both; }
    .garden-story-person, .garden-story-link { transition: none; }
    .garden-story-person { transform: none; }
  }
`;

const MotionStyle = () => <style>{motionCss}</style>;

// Content box inside Shell: 1920 − 2×144 wide.
const CONTENT_W = 1632;

const Title = ({ children, className }: { children: ReactNode; className?: string }) => (
  <h1 className={className} style={{ fontFamily: '"Libre Baskerville", Georgia, "Times New Roman", serif', fontSize: 132, fontWeight: 400, lineHeight: 1.17, letterSpacing: '-0.035em', maxWidth: 1500, margin: 0, color: ink, whiteSpace: 'pre-line' }}>{children}</h1>
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

const chapters = ['認識 Obsidian', '理解 RAG', 'Agent 協作', '建立知識庫', '發布到網站'];
const ChapterMark = ({ chapter }: { chapter: number }) => (
  <div style={{ position: 'absolute', top: 117, right: 144, fontSize: 24, fontWeight: 600, color: amber, letterSpacing: '0.04em' }}>
    {String(chapter).padStart(2, '0')}｜{chapters[chapter - 1]}
  </div>
);

const Shell = ({ children, chapter, top = 112 }: { children: ReactNode; chapter?: number; top?: number }) => (
  <div style={{ width: '100%', height: '100%', boxSizing: 'border-box', position: 'relative', background: 'var(--osd-bg)', color: 'var(--osd-text)', fontFamily: 'var(--osd-font-body)', padding: `${top}px 144px 126px` }}>
    {chapter ? <ChapterMark chapter={chapter} /> : null}
    {children}
    <Footer />
  </div>
);

const Heading = ({ children }: { children: ReactNode }) => (
  <h2 style={{ fontFamily: 'var(--osd-font-display)', fontSize: 76, fontWeight: 400, lineHeight: 1.2, letterSpacing: '-0.025em', margin: '40px 0 0', maxWidth: 1620 }}>
    {children}</h2>
);

const Lead = ({ children, className }: { children: ReactNode; className?: string }) => (
  <p className={className} style={{ fontSize: 36, lineHeight: 1.5, color: muted, maxWidth: 1480, margin: '32px 0 0' }}>
    {children}</p>
);

const Bullet = ({ children, n }: { children: ReactNode; n?: number }) => (
  <div style={{ display: 'grid', gridTemplateColumns: '54px 1fr', gap: 22, alignItems: 'start', fontSize: 38, lineHeight: 1.5, maxWidth: 1480 }}>
    <span style={{ fontFamily: mono, fontSize: 24, fontWeight: 600, color: amber, paddingTop: 11 }}>{n === undefined ? '—' : String(n).padStart(2, '0')}</span>
    <span>{children}</span>
  </div>
);

const NumDot = ({ n }: { n: number }) => (
  <span style={{ flex: '0 0 auto', width: 46, height: 46, borderRadius: 23, background: amber, color: '#FFFFFF', display: 'grid', placeItems: 'center', fontFamily: mono, fontSize: 24, fontWeight: 600, marginTop: 2 }}>{n}</span>
);

const Callout = ({ n, children }: { n: number; children: ReactNode }) => (
  <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', fontSize: 32, lineHeight: 1.45 }}>
    <NumDot n={n} />
    <span style={{ whiteSpace: 'pre-line' }}>{children}</span>
  </div>
);

const ScreenTourCallout = ({ n, title, detail }: { n: number; title: string; detail: string }) => (
  <div style={{ display: 'flex', gap: 18, alignItems: 'flex-start', padding: '20px 22px', background: surface, borderLeft: `4px solid ${amber}` }}>
    <NumDot n={n} />
    <div>
      <div style={{ fontSize: 29, fontWeight: 600, lineHeight: 1.3 }}>{title}</div>
      <div style={{ fontSize: 25, lineHeight: 1.4, color: muted, marginTop: 5 }}>{detail}</div>
    </div>
  </div>
);

const CodeBlock = ({ lines, label }: { lines: string[]; label?: string }) => (
  <div style={{ background: '#202326', color: '#F5F5F4', width: '100%', boxSizing: 'border-box', maxWidth: 1500, padding: '30px 38px 36px', borderTop: `5px solid ${amber}` }}>
    {label ? <div style={{ color: '#BAB5B0', fontSize: 24, letterSpacing: '0.08em', marginBottom: 23 }}>{label}</div> : null}
    {lines.map((line, i) => <div key={i} style={{ fontFamily: mono, fontSize: 30, lineHeight: 1.65, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{line || ' '}</div>)}
  </div>
);

// Real command / agent output. Lines starting with "$ " are what the learner types.
const Terminal = ({ lines, label }: { lines: string[]; label: string }) => (
  <div style={{ background: '#202326', color: '#D6D3D1', width: '100%', boxSizing: 'border-box', maxWidth: 1500, padding: '28px 38px 32px', borderTop: `5px solid ${amber}` }}>
    <div style={{ color: '#BAB5B0', fontSize: 24, letterSpacing: '0.04em', marginBottom: 20 }}>{label}</div>
    {lines.map((line, i) => (
      <div key={i} style={{ fontFamily: mono, fontSize: 28, lineHeight: 1.6, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', color: line.startsWith('$ ') ? '#F3D9B1' : '#D6D3D1', fontWeight: line.startsWith('$ ') ? 600 : 400 }}>{line || ' '}</div>
    ))}
  </div>
);

const Caption = ({ children }: { children: ReactNode }) => (
  <div style={{ fontSize: 22, lineHeight: 1.4, color: quiet, marginTop: 12 }}>{children}</div>
);

const MarkBubble = ({ n, left, top }: { n: number; left: string | number; top: string | number }) => (
  <span style={{ position: 'absolute', left, top, transform: 'translate(-50%, -50%)', width: 52, height: 52, borderRadius: 26, background: amber, color: '#FFFFFF', display: 'grid', placeItems: 'center', fontFamily: mono, fontSize: 26, fontWeight: 600, boxShadow: '0 0 0 5px #FFFFFF, 0 4px 12px rgba(0,0,0,0.25)' }}>{n}</span>
);

// A real screenshot at its own aspect ratio, sized to fit the box it is given.
const Screenshot = ({ src, aspect, maxW, maxH, caption, alt, marks, url }: { src: string; aspect: number; maxW: number; maxH: number; caption: string; alt: string; marks?: { n: number; x: number; y: number }[]; url?: string }) => {
  const bar = url ? 56 : 0;
  const h = Math.min(maxH - bar, maxW / aspect);
  const w = Math.round(h * aspect);
  return (
    <div style={{ width: w }}>
      {url ? (
        <div style={{ width: w, height: bar, boxSizing: 'border-box', background: '#ECEAE8', border: `1px solid ${rule}`, borderBottom: 'none', display: 'flex', alignItems: 'center', gap: 10, padding: '0 18px' }}>
          <span style={{ width: 12, height: 12, borderRadius: 6, background: '#D87771' }} />
          <span style={{ width: 12, height: 12, borderRadius: 6, background: '#E4BB62' }} />
          <span style={{ width: 12, height: 12, borderRadius: 6, background: '#81B984' }} />
          <span style={{ flex: 1, marginLeft: 14, background: '#FFFFFF', borderRadius: 18, padding: '5px 18px', fontFamily: mono, fontSize: 24, color: ink }}>{url}</span>
        </div>
      ) : null}
      <div style={{ width: w, height: Math.round(h), border: `1px solid ${rule}`, background: '#FFFFFF', boxShadow: '0 10px 30px rgba(28,25,23,0.08)', position: 'relative' }}>
        <img src={src} alt={alt} style={{ width: '100%', height: '100%', display: 'block' }} />
        {(marks ?? []).map(m => <MarkBubble key={m.n} n={m.n} left={`${m.x}%`} top={`${m.y}%`} />)}
      </div>
      <Caption>{caption}</Caption>
    </div>
  );
};

const VisualFrame = ({ children, caption, className }: { children: ReactNode; caption: string; className?: string }) => (
  <div className={className} style={{ width: '100%', maxWidth: 1500, height: 505, boxSizing: 'border-box', border: `1px solid ${rule}`, background: '#FFFFFF', position: 'relative', overflow: 'hidden' }}>
    {children}
    <div style={{ position: 'absolute', right: 18, bottom: 14, fontSize: 22, color: quiet, background: 'rgba(255,255,255,0.94)', padding: '5px 10px' }}>{caption}</div>
  </div>
);

const DiagramCard = ({ kicker, title, detail, tint = surface, width }: { kicker?: string; title: string; detail?: string; tint?: string; width?: number }) => (
  <div style={{ width, background: tint, borderTop: `4px solid ${amber}`, padding: '26px 27px', boxSizing: 'border-box', minHeight: 165 }}>
    {kicker ? <div style={{ fontSize: 24, fontWeight: 600, color: amber, letterSpacing: '0.06em', marginBottom: 14 }}>{kicker}</div> : null}
    <div style={{ fontSize: 32, fontWeight: 600, lineHeight: 1.3 }}>{title}</div>
    {detail ? <div style={{ fontSize: 26, lineHeight: 1.4, color: muted, marginTop: 13, whiteSpace: 'pre-line' }}>{detail}</div> : null}
  </div>
);

const storyGraphPaths = [
  ['M 165 115 C 165 205, 270 270, 367 275', 'M 365 115 C 365 195, 385 235, 385 264', 'M 650 115 C 650 205, 500 270, 403 275'],
  ['M 650 115 C 650 205, 730 260, 782 275', 'M 980 115 C 980 205, 875 260, 818 275'],
  ['M 980 115 C 980 205, 1060 260, 1147 275', 'M 1320 115 C 1320 205, 1240 260, 1183 275'],
];
const storyGraphColors = ['#A56B43', '#7654C7', '#528174'];
const storyGraphPeople = [
  { x: 165, name: '關羽' },
  { x: 365, name: '張飛' },
  { x: 650, name: '劉備', hub: true },
  { x: 980, name: '曹操', hub: true },
  { x: 1320, name: '孫權' },
];
const storyGraphRelations = [
  { x: 385, name: '桃園結義' },
  { x: 800, name: '煮酒論英雄' },
  { x: 1165, name: '赤壁之戰' },
];
const StoryGraphNode = ({ x, y, name, relation = false, hub = false }: { x: number; y: number; name: string; relation?: boolean; hub?: boolean }) => (
  <g>
    {hub ? <circle cx={x} cy={y} r="31" fill="none" stroke="#A56B43" strokeWidth="2" /> : null}
    {relation
      ? <rect x={x - 18} y={y - 18} width="36" height="36" rx="3" fill="#DCE5DC" stroke="#528174" strokeWidth="3" transform={`rotate(45 ${x} ${y})`} />
      : <circle cx={x} cy={y} r="20" fill={hub ? '#A56B43' : '#EFE2D4'} stroke="#A56B43" strokeWidth="3" />}
    <text x={x} y={relation ? y + 68 : y - 44} textAnchor="middle" fontSize="31" fontWeight="700" fill={ink} stroke="#FFFFFF" strokeWidth="8" paintOrder="stroke">{name}</text>
  </g>
);

const SearchPanel = ({ title, how, tint, found, result, use }: { title: string; how: string; tint: string; found: boolean; result: string; use: string }) => (
  <div style={{ background: tint, borderTop: `5px solid ${amber}`, padding: '24px 32px 28px' }}>
    <div style={{ fontSize: 38, fontWeight: 600 }}>{title}</div>
    <div style={{ fontSize: 28, color: muted, marginTop: 6 }}>{how}</div>
    <div style={{ display: 'flex', gap: 16, alignItems: 'center', background: '#FFFFFF', padding: '18px 24px', marginTop: 22 }}>
      <span style={{ flex: '0 0 auto', width: 44, height: 44, borderRadius: 22, display: 'grid', placeItems: 'center', background: found ? '#2F6B3A' : '#9B4A3C', color: '#FFFFFF', fontSize: 26, fontWeight: 600 }}>{found ? '✓' : '✗'}</span>
      <span style={{ fontSize: 30, fontWeight: 600, color: found ? '#2F6B3A' : '#9B4A3C' }}>{result}</span>
    </div>
    <div style={{ fontSize: 28, marginTop: 22 }}>{use}</div>
  </div>
);

const RagPanel = ({ title, tint, children }: { title: string; tint: string; children: ReactNode }) => (
  <div style={{ background: tint, borderTop: `5px solid ${amber}`, padding: '18px 32px 20px' }}>
    <div style={{ fontSize: 32, fontWeight: 600, marginBottom: 12 }}>{title}</div>
    {children}
  </div>
);

const RagTheoryCard = ({ letter, term, english, action, example, tint, arrow = false }: { letter: string; term: string; english: string; action: string; example: string; tint: string; arrow?: boolean }) => (
  <div style={{ height: 256, boxSizing: 'border-box', position: 'relative', padding: '24px 30px', background: tint, borderTop: `5px solid ${amber}` }}>
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
      <span style={{ fontFamily: 'var(--osd-font-display)', fontSize: 57, lineHeight: 1, color: amber }}>{letter}</span>
      <strong style={{ fontSize: 35 }}>{term}</strong>
      <span style={{ fontSize: 21, color: muted }}>{english}</span>
    </div>
    <div style={{ fontSize: 28, lineHeight: 1.35, marginTop: 24 }}>{action}</div>
    <div style={{ fontSize: 24, color: amber, fontWeight: 600, marginTop: 17 }}>{example}</div>
    {arrow ? <span aria-hidden="true" style={{ position: 'absolute', right: -30, top: 100, fontSize: 38, color: amber, zIndex: 1 }}>→</span> : null}
  </div>
);

const RagStep = ({ k, text, tone = ink }: { k: string; text: string; tone?: string }) => (
  <div style={{ display: 'grid', gridTemplateColumns: '84px 1fr', alignItems: 'center', background: '#FFFFFF', padding: '10px 24px' }}>
    <span style={{ fontSize: 24, fontWeight: 600, color: amber }}>{k}</span>
    <span style={{ fontSize: 30, fontWeight: 600, color: tone }}>{text}</span>
  </div>
);

// Two notes are read together before the answer is written.
const RagGraph = () => (
  <div style={{ background: '#FFFFFF', borderLeft: `5px solid ${amber}`, padding: '13px 18px 16px' }}>
    <div style={{ fontSize: 24, fontWeight: 600, color: amber, marginBottom: 10 }}>找到兩張有根據的筆記</div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 34px 1fr', gap: 8, alignItems: 'center' }}>
      <div style={{ background: '#FAF6F1', padding: '12px 15px', minHeight: 102, boxSizing: 'border-box' }}>
        <div style={{ fontSize: 24, fontWeight: 600 }}>曹操.md</div>
        <div style={{ fontSize: 21, lineHeight: 1.35, color: muted, marginTop: 5 }}>赤壁戰事中率軍對抗孫權陣營</div>
      </div>
      <span aria-hidden="true" style={{ color: amber, fontSize: 30, textAlign: 'center' }}>→</span>
      <div style={{ background: '#F0F4EE', padding: '12px 15px', minHeight: 102, boxSizing: 'border-box' }}>
        <div style={{ fontSize: 24, fontWeight: 600 }}>赤壁之戰.md</div>
        <div style={{ fontSize: 21, lineHeight: 1.35, color: muted, marginTop: 5 }}>孫權陣營與曹操軍在赤壁交戰</div>
      </div>
    </div>
  </div>
);

const DownArrow = () => <div style={{ textAlign: 'center', color: amber, fontSize: 28, lineHeight: 1.05, margin: '2px 0' }}>↓</div>;

const Arrow = () => <span style={{ color: amber, fontSize: 49, lineHeight: 1 }}>→</span>;

const FrameNote = ({ children, left }: { children: ReactNode; left: number }) => (
  <div style={{ position: 'absolute', left, right: 260, bottom: 58, fontSize: 28, lineHeight: 1.4, color: ink }}>{children}</div>
);

const LinkNoteCard = ({ name, label, destination, detail }: { name: string; label: string; destination?: string; detail: string }) => (
  <div style={{ height: 290, boxSizing: 'border-box', padding: '28px 30px', background: surface, borderTop: `5px solid ${amber}` }}>
    <div style={{ fontSize: 24, color: amber, fontWeight: 600 }}>{label}</div>
    <div style={{ fontSize: 39, fontWeight: 600, marginTop: 21 }}>{name}.md</div>
    <div style={{ fontSize: 26, color: muted, marginTop: 15 }}>{detail}</div>
    {destination ? <div style={{ marginTop: 21, fontSize: 32, fontWeight: 600, color: '#7654C7' }}>[[{destination}]]</div> : null}
  </div>
);

const Diagram = ({ type }: { type: NonNullable<SlideSpec['visual']> }) => {
  if (type === 'obsidian-ui') return <VisualFrame caption="Obsidian 介面示意｜開啟 12 張卡中的〈桃園結義〉">
    <div style={{ display: 'grid', gridTemplateColumns: '910px 1fr', gap: 34, padding: '34px 38px' }}>
      <div style={{ height: 420, border: `1px solid ${rule}`, background: '#FFFFFF', boxShadow: '0 8px 24px rgba(28,25,23,0.07)' }}>
        <div style={{ height: 48, boxSizing: 'border-box', borderBottom: `1px solid ${rule}`, background: '#F1F1F1', display: 'flex', alignItems: 'center', gap: 20, padding: '0 22px', fontSize: 23, color: muted }}>
          <span>▣</span><span>⌕</span><span style={{ marginLeft: 140, background: '#FFFFFF', color: ink, padding: '9px 38px 8px', border: `1px solid ${rule}`, borderBottom: 'none' }}>桃園結義</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '278px 1fr', height: 372 }}>
          <div style={{ background: surface, borderRight: `1px solid ${rule}`, padding: '13px 16px', fontSize: 21, lineHeight: 1.28 }}>
            <div style={{ color: quiet, fontSize: 19, marginBottom: 5 }}>三國人物知識庫 · 12 張卡</div>
            <div style={{ fontWeight: 600 }}>三國演義</div>
            {[
              { folder: '人物', count: 5, rows: ['劉備　關羽　張飛', '曹操　孫權'] },
              { folder: '勢力', count: 3, rows: ['蜀漢　曹魏　東吳'] },
              { folder: '關係', count: 3, rows: ['桃園結義', '煮酒論英雄', '赤壁之戰'] },
            ].map(group => <div key={group.folder}>
              <div style={{ color: amber, fontWeight: 600, paddingTop: 5 }}>▾ {group.folder}（{group.count}）</div>
              {group.rows.map(row => <div key={row} style={{ paddingLeft: 22, background: row === '桃園結義' ? '#E7E5E4' : undefined, fontWeight: row === '桃園結義' ? 600 : 400 }}>{row}</div>)}
            </div>)}
          </div>
          <div style={{ padding: '30px 36px' }}>
            <div style={{ fontSize: 25, fontWeight: 600, color: amber }}>關係卡｜結義</div>
            <div style={{ fontSize: 26, lineHeight: 1.45, marginTop: 21 }}>《三國演義》第 1 回：劉備、關羽、張飛在桃園結為兄弟。</div>
            <div style={{ fontSize: 25, marginTop: 29 }}>參與人物：</div>
            <div style={{ fontSize: 28, color: '#7654C7', textDecoration: 'underline', marginTop: 8 }}>劉備　關羽　張飛</div>
            <div style={{ fontSize: 21, color: muted, marginTop: 25 }}>點開人物，就能沿著故事繼續找關係。</div>
          </div>
        </div>
      </div>
      <div style={{ display: 'grid', alignContent: 'start', gap: 18, paddingTop: 5 }}>
        <Steps>
          <Step><ScreenTourCallout n={1} title="左側｜資料夾分類" detail="人物、勢力、關係各放一個資料夾" /></Step>
          <Step><ScreenTourCallout n={2} title="中央｜關係卡" detail="讀桃園結義的故事與人物" /></Step>
          <Step><ScreenTourCallout n={3} title="紫色字｜人物連結" detail="點劉備、關羽或張飛，繼續探索" /></Step>
        </Steps>
      </div>
    </div>
  </VisualFrame>;
  if (type === 'agent-note') return <VisualFrame caption="練習成果示意｜新卡從原有人物接出新故事">
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 90px 1fr', alignItems: 'center', gap: 24, padding: '40px 52px 72px' }}>
      <div style={{ background: surface, padding: '24px 28px', minHeight: 305, boxSizing: 'border-box' }}>
        <div style={{ fontSize: 25, color: amber, fontWeight: 600 }}>練習一｜原有 12 張卡</div>
        <svg viewBox="0 0 570 180" style={{ width: '100%', height: 180, marginTop: 12 }} aria-label="擴充前的局部關係圖：劉備與曹操透過煮酒論英雄相連，曹操與孫權透過赤壁之戰相連">
          <g fill="none" stroke={amber} strokeWidth="3"><path d="M85 48 Q120 93 185 135" /><path d="M260 48 Q235 90 185 135" /><path d="M260 48 Q320 90 355 135" /><path d="M460 48 Q410 90 355 135" /></g>
          {[['劉備', 85], ['曹操', 260], ['孫權', 460]].map(([name, x]) => <g key={name}><circle cx={x} cy="42" r="27" fill="#EFE2D4" stroke={amber} strokeWidth="2" /><text x={x} y="50" textAnchor="middle" fontSize="21" fontWeight="600" fill={ink}>{name}</text></g>)}
          {[['煮酒論英雄', 185], ['赤壁之戰', 355]].map(([name, x]) => <g key={name}><rect x={Number(x) - 73} y="116" width="146" height="43" rx="5" fill="#FFFFFF" stroke={amber} strokeWidth="2" /><text x={x} y="144" textAnchor="middle" fontSize="18" fill={ink}>{name}</text></g>)}
        </svg>
        <div style={{ marginTop: 13, fontSize: 24, color: muted }}>節選：先保存現有的兩條故事線</div>
      </div>
      <div style={{ color: amber, fontSize: 54, textAlign: 'center' }}>→</div>
      <div style={{ background: '#E4ECE8', padding: '24px 28px', minHeight: 305, boxSizing: 'border-box' }}>
        <div style={{ fontSize: 25, color: '#4D7669', fontWeight: 600 }}>練習二、三｜擴充後重畫</div>
        <svg viewBox="0 0 570 180" style={{ width: '100%', height: 180, marginTop: 12 }} aria-label="擴充後的局部關係圖：劉備透過三顧茅廬連到諸葛亮，諸葛亮透過草船借箭連到周瑜">
          <g fill="none" stroke="#5A8377" strokeWidth="3"><path d="M90 48 Q120 93 190 135" /><path d="M275 48 Q230 90 190 135" /><path d="M275 48 Q330 90 385 135" /><path d="M475 48 Q430 90 385 135" /></g>
          {[['劉備', 90], ['諸葛亮', 275], ['周瑜', 475]].map(([name, x]) => <g key={name}><circle cx={x} cy="42" r="32" fill="#FFFFFF" stroke="#5A8377" strokeWidth="2" /><text x={x} y="50" textAnchor="middle" fontSize="20" fontWeight="600" fill={ink}>{name}</text></g>)}
          {[['三顧茅廬', 190], ['草船借箭', 385]].map(([name, x]) => <g key={name}><rect x={Number(x) - 66} y="116" width="132" height="43" rx="5" fill="#FFFFFF" stroke="#5A8377" strokeWidth="2" /><text x={x} y="144" textAnchor="middle" fontSize="18" fill={ink}>{name}</text></g>)}
        </svg>
        <div style={{ marginTop: 13, fontSize: 24, color: '#436B60' }}>節選：新人物和事件接出另一條路</div>
      </div>
    </div>
    <FrameNote left={52}>比較兩次的圖：哪些人物、事件與連結是第二次才看得到的？</FrameNote>
  </VisualFrame>;
  if (type === 'publish-property') return <VisualFrame caption="筆記屬性示意｜每一則要公開的筆記都需個別設定">
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 34, padding: '38px 48px' }}>
      <Steps>
        <Step>
          <div style={{ height: 310, boxSizing: 'border-box', background: surface, borderTop: `5px solid ${amber}`, padding: '24px 30px' }}>
            <div style={{ fontSize: 28, fontWeight: 600, color: amber }}>三國演義</div>
            <div style={{ fontSize: 39, fontWeight: 600, marginTop: 8 }}>〈三國演義〉</div>
            <div style={{ fontSize: 27, color: muted, marginTop: 12 }}>屬性</div>
            <div style={{ display: 'grid', gap: 10, marginTop: 8 }}>
              {['dg-home', 'dg-publish'].map(name => <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 17, background: '#FFFFFF', padding: '8px 17px', fontSize: 29 }}><span style={{ color: amber, fontWeight: 700 }}>☑</span>{name}</div>)}
            </div>
          </div>
        </Step>
        <Step>
          <div style={{ height: 310, boxSizing: 'border-box', background: surface, borderTop: `5px solid ${amber}`, padding: '24px 30px' }}>
            <div style={{ fontSize: 28, fontWeight: 600, color: amber }}>其餘示範卡</div>
            <div style={{ fontSize: 36, fontWeight: 600, marginTop: 8 }}>其餘 11 張卡</div>
            <div style={{ fontSize: 27, color: muted, marginTop: 12 }}>各自的屬性</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 17, background: '#FFFFFF', padding: '8px 17px', fontSize: 29, marginTop: 8 }}><span style={{ color: amber, fontWeight: 700 }}>☑</span>dg-publish</div>
          </div>
        </Step>
      </Steps>
    </div>
    <div style={{ position: 'absolute', left: 48, right: 48, bottom: 55, background: '#F2E6D9', borderLeft: `5px solid ${amber}`, padding: '16px 24px', fontSize: 27 }}>
      教材原有 12 張已標記；新做的卡與導覽頁請另行決定是否公開。
    </div>
  </VisualFrame>;
  if (type === 'link-notes') return <VisualFrame caption="沿著已備好的內部連結，從人物走進情節再走到人物">
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 35, padding: '43px 50px' }}>
      <Steps>
        <LinkNoteCard name="劉備" label="人物卡" detail="點這張卡裡的連結" destination="桃園結義" />
        <Step><div style={{ position: 'relative' }}><span style={{ position: 'absolute', left: -30, top: 114, color: amber, fontSize: 40 }}>→</span><LinkNoteCard name="桃園結義" label="關係卡" detail="讀出這段關係，再點" destination="關羽" /></div></Step>
        <Step><div style={{ position: 'relative' }}><span style={{ position: 'absolute', left: -30, top: 114, color: amber, fontSize: 40 }}>→</span><LinkNoteCard name="關羽" label="另一張人物卡" detail="同一段故事帶你到這裡" /></div></Step>
      </Steps>
    </div>
    <div style={{ position: 'absolute', left: 50, right: 50, bottom: 55, borderLeft: `5px solid ${amber}`, background: '#F2E6D9', padding: '18px 24px', fontSize: 28 }}>
      關係卡不是轉址：它用「第 1 回結義」解釋劉備與關羽為什麼相連。
    </div>
  </VisualFrame>;
  if (type === 'story-map') return <VisualFrame caption="12 張範例卡中的 8 張｜人物登場後，連出三段關係">
    <div style={{ position: 'relative', width: '100%', height: 400 }}>
      <svg viewBox="0 0 1500 400" role="img" aria-labelledby="story-graph-title story-graph-desc" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', fontFamily: 'var(--osd-font-body)' }}>
        <title id="story-graph-title">三國人物卡與關係卡的連結圖</title>
        <desc id="story-graph-desc">上排五張人物卡，下排三張關係卡。劉備同時連到桃園結義與煮酒論英雄，曹操同時連到煮酒論英雄與赤壁之戰。</desc>
        <text x="32" y="115" fontSize="24" fontWeight="700" fill={amber}>人物卡</text>
        <text x="32" y="300" fontSize="24" fontWeight="700" fill="#528174">關係卡</text>
      </svg>
      <Steps>
        <Step duration={0}>
          <svg viewBox="0 0 1500 400" aria-hidden="true" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 2, fontFamily: 'var(--osd-font-body)', pointerEvents: 'none' }}>
            {storyGraphPeople.map((person, i) => <g key={person.name} className="garden-story-person" style={{ transitionDelay: `${i * 120}ms` }}>
              <StoryGraphNode x={person.x} y={115} name={person.name} hub={person.hub} />
            </g>)}
          </svg>
        </Step>
        {storyGraphRelations.map((relation, i) => <Step key={relation.name} duration={260}>
          <svg viewBox="0 0 1500 400" aria-hidden="true" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 1, fontFamily: 'var(--osd-font-body)', pointerEvents: 'none' }}>
            {storyGraphPaths[i].map((path, segmentIndex) => <path key={path} className="garden-story-link" d={path} pathLength={1} fill="none" stroke={storyGraphColors[i]} strokeWidth="7" strokeLinecap="round" style={{ transitionDelay: `${segmentIndex * 60}ms` }} />)}
            <StoryGraphNode x={relation.x} y={290} name={relation.name} relation />
          </svg>
        </Step>)}
      </Steps>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 30, padding: '7px 35px 0', fontSize: 24, color: muted }}>
      <span>沿線讀：人物 → 關係 → 另一人物</span><span style={{ color: amber, fontWeight: 700 }}>同一張人物卡，也能接上不同故事。</span>
    </div>
  </VisualFrame>;
  if (type === 'vault-create') return <VisualFrame caption="課堂教材｜三國人物知識庫 · 12 張 Markdown 筆記">
    <div style={{ display: 'grid', gridTemplateColumns: '375px 1fr', gap: 35, padding: '35px 44px 0' }}>
      <div style={{ boxSizing: 'border-box', height: 405, background: '#F2E6D9', borderTop: `5px solid ${amber}`, padding: '17px 25px', textAlign: 'center' }}>
        <div style={{ fontSize: 29, fontWeight: 700 }}>掃碼取得 12 張卡</div>
        <a href={publicVaultUrl} target="_blank" rel="noreferrer" aria-label="開啟 GitHub 上的三國人物知識庫 ZIP">
          <img src={vaultQr} alt="教材 ZIP 的 GitHub 下載 QR code" style={{ width: 247, height: 247, display: 'block', margin: '12px auto 0', imageRendering: 'pixelated' }} />
        </a>
        <a href={vaultZip} download="三國人物知識庫.zip" style={{ display: 'inline-block', marginTop: 11, padding: '7px 18px', background: amber, color: '#FFFFFF', fontSize: 24, fontWeight: 700, textDecoration: 'none' }}>或按這裡下載 ZIP ↓</a>
      </div>
      <div style={{ display: 'grid', gap: 14, alignContent: 'start' }}>
        {[
          { n: 1, title: '取得教材', detail: '掃 QR code，或在簡報中按下載按鈕。' },
          { n: 2, title: '解壓縮', detail: '展開 ZIP，保留「人物／勢力／關係」資料夾。' },
          { n: 3, title: '用 Obsidian 開啟', detail: '選「開啟資料夾作為儲存庫」，指定「三國人物知識庫」。' },
        ].map(item => <div key={item.n} style={{ display: 'grid', gridTemplateColumns: '50px 1fr', gap: 17, alignItems: 'start', background: surface, borderLeft: `5px solid ${amber}`, padding: '16px 20px' }}>
          <NumDot n={item.n} />
          <div><div style={{ fontSize: 29, fontWeight: 700 }}>{item.title}</div><div style={{ fontSize: 24, lineHeight: 1.35, color: muted, marginTop: 4 }}>{item.detail}</div></div>
        </div>)}
        <div style={{ marginTop: 8, fontSize: 24, color: amber, fontWeight: 600 }}>完成檢查：左側有〈三國演義〉與三個分類資料夾。</div>
      </div>
    </div>
  </VisualFrame>;
  if (type === 'vault') return <VisualFrame caption="筆記庫根目錄與三個分類資料夾示意">
    <div style={{ position: 'absolute', left: 500, top: 22, width: 220, height: 35, background: '#E7D5C2', border: `2px solid ${amber}`, borderBottom: 'none' }} />
    <div style={{ position: 'absolute', left: 500, top: 55, width: 525, height: 330, boxSizing: 'border-box', padding: '27px 33px', background: '#F2E6D9', border: `2px solid ${amber}` }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 17 }}>
        <span style={{ fontSize: 31, fontWeight: 600 }}>三國人物知識庫</span>
        <span style={{ fontSize: 21, color: amber, fontWeight: 600 }}>電腦裡的資料夾</span>
      </div>
      {[{ name: '三國演義.md', count: '', folder: false }, { name: '人物', count: '5 張', folder: true }, { name: '勢力', count: '3 張', folder: true }, { name: '關係', count: '3 張', folder: true }].map(item => (
        <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: 18, height: 49, padding: '0 20px', boxSizing: 'border-box', background: '#FFFFFF', border: `1px solid ${rule}`, marginBottom: 7, fontSize: 27 }}>
          {item.folder ? <svg aria-hidden="true" width="29" height="26" viewBox="0 0 29 26" fill="none" stroke={amber} strokeWidth="2"><path d="M2 7V22H27V7H14L11 3H2V7Z" /></svg> : <span style={{ width: 22, height: 27, border: `2px solid ${amber}`, borderTopRightRadius: 7, boxSizing: 'border-box', background: '#FAF6F1' }} />}
          <span>{item.name}{item.folder ? '/' : ''}</span>
          {item.count ? <span style={{ marginLeft: 'auto', color: muted, fontSize: 23 }}>{item.count}</span> : null}
        </div>
      ))}
    </div>
    <Steps>
      <Step>
        <div style={{ position: 'absolute', left: 62, top: 145, width: 295, height: 191, boxSizing: 'border-box', padding: '23px 29px', background: surface, borderTop: `5px solid ${amber}` }}>
          <svg aria-hidden="true" viewBox="0 0 64 64" style={{ position: 'absolute', right: 22, top: 23, width: 53, height: 53, fill: 'none', stroke: amber, strokeWidth: 3.5, strokeLinecap: 'round', strokeLinejoin: 'round' }}>
            <path d="M12 45 9 55l10-3 32-32-7-7-32 32Z" /><path d="m39 18 7 7" /><path d="M22 54h29" />
          </svg>
          <div style={{ fontSize: 27, fontWeight: 600, color: amber }}>Obsidian</div>
          <div style={{ fontSize: 53, lineHeight: 1.15, marginTop: 8 }}>寫筆記</div>
          <div style={{ fontSize: 23, color: muted, marginTop: 10 }}>新增、修改 .md 檔</div>
        </div>
        <div style={{ position: 'absolute', left: 378, top: 213, color: amber, fontSize: 50, lineHeight: 1 }}>→</div>
      </Step>
      <Step>
        <div style={{ position: 'absolute', left: 1045, top: 213, color: amber, fontSize: 50, lineHeight: 1 }}>→</div>
        <div style={{ position: 'absolute', left: 1128, top: 145, width: 300, height: 191, boxSizing: 'border-box', padding: '23px 29px', background: surface, borderTop: `5px solid ${amber}` }}>
          <svg aria-hidden="true" viewBox="0 0 64 64" style={{ position: 'absolute', right: 22, top: 23, width: 53, height: 53, fill: 'none', stroke: amber, strokeWidth: 3.5, strokeLinecap: 'round', strokeLinejoin: 'round' }}>
            <circle cx="27" cy="27" r="17" /><path d="m40 40 17 17" /><path d="M21 27h12" />
          </svg>
          <div style={{ fontSize: 27, fontWeight: 600, color: amber }}>Agent</div>
          <div style={{ fontSize: 53, lineHeight: 1.15, marginTop: 8 }}>讀筆記</div>
          <div style={{ fontSize: 23, color: muted, marginTop: 10 }}>搜尋、引用 .md 檔</div>
        </div>
      </Step>
    </Steps>
    <FrameNote left={67}>資料夾負責分類；筆記連結仍能跨資料夾把卡接起來。</FrameNote>
  </VisualFrame>;
  if (type === 'rag-theory') return <VisualFrame caption="RAG 原理示意｜以今天的三國筆記庫為例">
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 33, padding: '48px 52px 0' }}>
      <Steps>
        <Step duration={240}><RagTheoryCard letter="R" term="檢索" english="Retrieval" action="先從筆記庫找相關內容。" example="找到〈曹操〉與〈赤壁之戰〉" tint="#F2E6D9" arrow /></Step>
        <Step duration={240}><RagTheoryCard letter="A" term="增強" english="Augmented" action="把找到的內容連同問題交給 AI。" example="讓問題多了可查的依據" tint="#EAE8F2" arrow /></Step>
        <Step duration={240}><RagTheoryCard letter="G" term="生成" english="Generation" action="AI 根據內容組織回答。" example="答赤壁之戰，並附來源檔名" tint="#E4ECE3" /></Step>
      </Steps>
    </div>
    <div style={{ margin: '34px 52px 0', padding: '20px 27px', borderLeft: `5px solid ${amber}`, background: '#FAF6F1', fontSize: 27, lineHeight: 1.4 }}>
      這頁的問題：曹操在這盒筆記中參與哪場戰役？RAG 在回答時加入找到的筆記，不必重新訓練模型。
    </div>
  </VisualFrame>;
  if (type === 'ragcompare') return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 36 }}>
      <Steps>
        <Step><RagPanel title="沒有 RAG" tint={surface}>
          <RagStep k="問題" text="依筆記，曹操參與哪場戰役？" />
          <DownArrow />
          <RagStep k="AI" text="未查閱筆記" />
          <DownArrow />
          <RagStep k="回答" text="缺少筆記依據" tone="#9B4A3C" />
        </RagPanel></Step>
        <Step><RagPanel title="有 RAG" tint="#E4ECE3">
          <RagStep k="問題" text="依筆記，曹操參與哪場戰役？" />
          <DownArrow />
          <RagGraph />
          <DownArrow />
          <RagStep k="回答" text="赤壁之戰（附檔名）" tone="#2F6B3A" />
        </RagPanel></Step>
      </Steps>
    </div>
  );
  if (type === 'search') return (
    <div style={{ maxWidth: 1632 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 20, fontSize: 32 }}>
        <span style={{ color: muted }}>想找的是：</span>
        <span style={{ background: '#FFFFFF', border: `2px solid ${ink}`, borderRadius: 40, padding: '8px 30px', fontWeight: 600 }}>🔍 桃園結義</span>
        <span style={{ fontSize: 28, color: muted }}>（筆記裡寫的是「劉關張結義」）</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 36, marginTop: 36 }}>
        <SearchPanel title="關鍵字搜尋" how="只搜「桃園結義」這個詞" tint={surface} found={false} result="可能漏掉：筆記寫的是「劉關張結義」" use="筆記少、用詞固定時就夠用（今天）" />
        <SearchPanel title="語意搜尋" how="找意思相近的內容" tint="#E4ECE3" found result="找到〈劉備〉的結義記錄" use="筆記多、用詞不一時再用（以後）" />
      </div>
    </div>
  );
  if (type === 'agent') return <VisualFrame caption="在 Codex 開啟筆記庫的檢查路線">
    <div style={{ padding: '47px 55px', display: 'flex', alignItems: 'center', gap: 20 }}>
      <DiagramCard kicker="① 選資料夾" title="三國人物知識庫" detail="選剛才建立的筆記庫，不選整個「文件」" width={390} tint="#EEE7F2" />
      <Arrow />
      <DiagramCard kicker="② 確認檔案" title="看到 12 張卡" detail={'入口 1 · 人物 5\n勢力 3 · 關係 3'} width={390} tint="#EFE2D4" />
      <Arrow />
      <DiagramCard kicker="③ 再提問" title="讓 Agent 查筆記" detail="下一頁貼上問題；回答須附檔名" width={390} tint="#DCE5DC" />
    </div>
    <FrameNote left={55}>先確認 Codex 看得到 12 張卡，再請它沿連結查找。</FrameNote>
  </VisualFrame>;
  if (type === 'layers') return <VisualFrame caption="來源卡、導覽頁與核對規則示意">
    <div style={{ padding: '35px 62px', display: 'grid', gap: 13 }}>
      <Steps>{[
        ['來源卡', '原有 12 張＋新人物與事件', '每張卡記一個主題，保留可查出處', '#EFE2D4'],
        ['導覽頁', '關係圖＋故事時間線', '同一批卡可以按關係或先後閱讀', '#DCE5DC'],
        ['核對規則', '來源、連結與待確認', '新線與新事件要能回到原文', surface],
      ].map(([n, title, detail, tint]) => <Step key={n}><div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <span style={{ width: 150, fontSize: 26, fontWeight: 600, color: amber }}>{n}</span>
        <div style={{ width: 1120, minHeight: 124, boxSizing: 'border-box', background: tint, borderLeft: `5px solid ${amber}`, padding: '18px 26px' }}>
          <div style={{ fontSize: 32, fontWeight: 600 }}>{title}</div>
          <div style={{ fontSize: 27, color: muted, marginTop: 6 }}>{detail}</div>
        </div>
      </div></Step>)}</Steps>
    </div>
  </VisualFrame>;
  if (type === 'knowledge') return <VisualFrame caption="同一份來源卡的兩種讀法">
    <div style={{ padding: '27px 46px' }}>
      <Steps>
        <Step><div style={{ display: 'flex', gap: 18 }}>
          <DiagramCard kicker="人物" title="劉備 · 諸葛亮" detail="誰和誰有關？" tint="#EFE2D4" width={450} />
          <DiagramCard kicker="事件" title="三顧茅廬" detail="發生了什麼？" tint="#EFE2D4" width={450} />
          <DiagramCard kicker="來源" title="小說第 37–38 回" detail="去哪裡核對？" tint="#EFE2D4" width={450} />
        </div></Step>
        <Step><div style={{ width: 1386, marginTop: 22, boxSizing: 'border-box', background: '#DCE5DC', borderLeft: `5px solid ${amber}`, padding: '20px 29px', fontSize: 28, lineHeight: 1.4 }}>
          <strong style={{ fontSize: 32 }}>導覽頁把卡串起來</strong><br />關係圖回答「誰連到誰」；時間線回答「哪件事先發生」。
        </div></Step>
      </Steps>
    </div>
    <FrameNote left={46}>圖和時間線都應連回來源卡；它們幫助閱讀，不取代原卡。</FrameNote>
  </VisualFrame>;
  if (type === 'site') return <><MotionStyle /><VisualFrame className="garden-site-preview" caption="網站完成畫面示意，網址與外觀依個人設定而異">
    <div style={{ width: '100%', height: 52, background: '#ECEAE8', borderBottom: `1px solid ${rule}`, display: 'flex', alignItems: 'center', padding: '0 26px', boxSizing: 'border-box', fontFamily: mono, fontSize: 22, color: muted }}>https://your-garden.vercel.app</div>
    <div style={{ padding: '35px 62px' }}>
      <div style={{ fontSize: 26, color: amber, fontWeight: 600 }}>我的三國人物知識庫</div>
      <div style={{ fontSize: 48, fontWeight: 600, marginTop: 18 }}>三國演義</div>
      <div style={{ fontSize: 29, marginTop: 24 }}>這次公開的筆記：</div>
      <div style={{ marginTop: 18, color: '#654CC1', fontSize: 32, textDecoration: 'underline' }}>劉備 ↗　曹操 ↗　孫權 ↗</div>
      <div style={{ marginTop: 15, color: muted, fontSize: 25 }}>從人物走進關係卡，再走到另一位人物</div>
    </div>
    <FrameNote left={62}>請同學從入口任選一條路，走過人物 → 關係 → 另一人物。</FrameNote>
  </VisualFrame></>;
  if (type === 'skills') return <VisualFrame caption="Skill 與 MCP 關係示意">
    <div style={{ padding: '50px 73px', display: 'grid', gridTemplateColumns: '1fr 300px 1fr', gap: 44, alignItems: 'center' }}>
      <DiagramCard kicker="像食譜" title="Skill" detail="教 Agent 怎麼做，例如：整理筆記要標出處" tint="#EFE2D4" />
      <div style={{ height: 250, background: '#242427', color: '#FFFFFF', display: 'grid', placeItems: 'center', fontSize: 46, fontWeight: 600 }}>Agent</div>
      <DiagramCard kicker="像插座" title="MCP" detail="讓 Agent 接上新工具或資料，例如：行事曆" tint="#DCE5DC" />
    </div>
    <FrameNote left={73}>讀自己電腦裡的 .md 不用 MCP；要接外部工具時再考慮。</FrameNote>
  </VisualFrame>;
  if (type === 'garden') return <VisualFrame caption="Digital Garden 發布流程示意">
    <div style={{ padding: '58px 50px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 13 }}>
      <Steps>
        <Step><DiagramCard kicker="寫稿" title="Obsidian" detail="寫筆記" width={280} tint="#EEE7F2" /></Step>
        <Step><div style={{ display: 'flex', alignItems: 'center', gap: 13 }}><Arrow /><DiagramCard kicker="挑稿" title="Digital Garden" detail="勾選要公開的篇" width={300} tint="#EFE2D4" /></div></Step>
        <Step><div style={{ display: 'flex', alignItems: 'center', gap: 13 }}><Arrow /><DiagramCard kicker="存檔" title="GitHub" detail="存一份公開版本" width={280} /></div></Step>
        <Step><div style={{ display: 'flex', alignItems: 'center', gap: 13 }}><Arrow /><DiagramCard kicker="上架" title="Vercel" detail="變成一個網址" width={280} tint="#DCE5DC" /></div></Step>
      </Steps>
    </div>
    <FrameNote left={50}>沒打勾的筆記不會上網站，整個筆記庫不會被公開。</FrameNote>
  </VisualFrame>;
  return <VisualFrame caption="Git 與網站部署示意">
    <div style={{ padding: '58px 65px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 28 }}>
      <Steps>
        <Step><DiagramCard kicker="commit" title="拍一張快照" detail="記下這次改了什麼" width={375} tint="#EFE2D4" /></Step>
        <Step><div style={{ display: 'flex', alignItems: 'center', gap: 28 }}><Arrow /><DiagramCard kicker="push" title="寄出去" detail="把快照送到 GitHub" width={375} /></div></Step>
        <Step><div style={{ display: 'flex', alignItems: 'center', gap: 28 }}><Arrow /><DiagramCard kicker="部署" title="網站自己更新" detail="Vercel 收到新版就重做網站" width={375} tint="#DCE5DC" /></div></Step>
      </Steps>
    </div>
    <FrameNote left={65}>Digital Garden 發布時，會替你做前兩步；Vercel 接著更新網站。</FrameNote>
  </VisualFrame>;
};

type Mark = { n: number; x: number; y: number };
type Shot = { src: string; aspect: number; caption: string; alt: string; marks?: Mark[]; url?: string };
type Card = { kicker: string; title: string; detail: string; tint?: string };

type SlideSpec = {
  kind: 'cover' | 'section' | 'list' | 'flow' | 'prompt' | 'code' | 'compare' | 'practice' | 'statement' | 'visual' | 'shot' | 'analogy' | 'terminal' | 'rows' | 'setup' | 'agenda';
  label?: string;
  title: string;
  lead?: string;
  items?: string[];
  left?: { title: string; items: string[] };
  right?: { title: string; items: string[] };
  code?: string[];
  chapter?: number;
  time?: string;
  reveal?: boolean;
  practiceNotes?: boolean;
  visual?: 'link-notes' | 'story-map' | 'vault-create' | 'obsidian-ui' | 'vault' | 'rag-theory' | 'ragcompare' | 'search' | 'agent' | 'agent-note' | 'layers' | 'knowledge' | 'skills' | 'garden' | 'git' | 'site' | 'publish-property';
  shot?: Shot;
  side?: string[];
  sideW?: number;
  sideGap?: number;
  shotReveal?: boolean;
  cards?: Card[];
  foot?: string;
  rows?: [string, string][];
  termLabel?: string;
  note: string;
};

const OBS = 'Obsidian 實際畫面（2026-10 擷取）';
const DG = 'Digital Garden 外掛 2.96.0 實際畫面（2026-10 擷取），練習筆記庫';

const specs: SlideSpec[] = [
  // Opening
  { kind: 'cover', label: 'AI WORKSHOP 02', title: '從 Obsidian 筆記，\n到自己的知識網站', lead: '從一盒已備好的知識卡出發，沿關係找資料、整理，再選擇公開。', note: '今天用《三國演義》示範卡片盒：12 張人物、勢力、關係卡都已備好。學員不用先抄資料，先實際點開一段關係，理解卡片為什麼相連；後面再讓 AI 查筆記、整理並發布。' },
  { kind: 'agenda', label: 'AGENDA', title: '課程大綱', lead: '先打開 12 張知識卡，\n沿連結讀懂一段故事，\n再請 Agent 幫忙擴充。', items: ['打開已備好的《三國演義》筆記庫', '沿人物 → 關係 → 人物讀一段故事', '讓 AI 查筆記回答，附上檔名', '請 Agent 擴充卡片、重畫圖與時間線', '選擇公開的卡，請同學走過連結'], note: '這堂課的素材已備好：1 張故事入口、5 張人物、3 張勢力、3 張關係卡。先從人物卡走進一段情節，再走到另一人物；接著讓 Agent 依來源新增人物與事件，重畫知識圖並製作時間線。最後選擇要發布的卡。' },

  // 01 Obsidian
  { kind: 'section', chapter: 1, label: '01 / OBSIDIAN', title: '認識 Obsidian', lead: '先打開已有內容的卡片盒，再沿關係卡探索。', note: '學員取得講師提供的 12 張筆記，直接用 Obsidian 開啟既有資料夾。Obsidian 讀寫的是電腦裡的 .md 檔；這章把力氣花在閱讀關係。' },
  { kind: 'visual', visual: 'story-map', chapter: 1, label: '先看今天的例子', title: '三段故事，連成一張知識網', lead: '上排是人物卡，下排是關係卡；每條線都是筆記之間的連結。', note: '第一下讓關羽、張飛、劉備、曹操、孫權自動依序出現，介紹人物卡。再按三次，讓關係卡與連線依序出現：劉備→桃園結義→關羽、張飛；曹操→煮酒論英雄→劉備；孫權→赤壁之戰→曹操。8 張卡只在圖上出現一次，劉備與曹操的雙圈表示它們各接上兩段故事。這是 12 張範例卡的局部網絡；下兩頁再介紹 Obsidian 畫面與完整檔案結構。小說出處：第 1、21、43、49、50 回。來源：https://zh.wikisource.org/wiki/三國演義/第001回 、https://zh.wikisource.org/wiki/三國演義/第021回 、https://zh.wikisource.org/wiki/三國演義/第043回 、https://zh.wikisource.org/wiki/三國演義/第049回 、https://zh.wikisource.org/wiki/三國演義/第050回' },
  { kind: 'visual', visual: 'obsidian-ui', chapter: 1, label: '認識工具', title: 'Obsidian：打開一盒知識卡', lead: '左側依人物、勢力、關係分類；打開〈桃園結義〉，再點紫色人名。', note: '按三次逐一顯示右側說明：先看左側根目錄的故事入口與三個分類資料夾（人物 5 張、勢力 3 張、關係 3 張）；再看中央〈桃園結義〉的內容；最後看紫色的劉備、關羽、張飛如何跨資料夾連到人物卡。這是依 Obsidian 介面整理的示意，內容對應提供給學員的筆記檔，內文不重複寫檔名標題。下一頁再用檔案結構說明：每張卡在電腦裡都是一個 .md 純文字檔。官方說明：https://obsidian.md/help/links' },
  { kind: 'visual', visual: 'vault', chapter: 1, label: '看懂檔案', title: '筆記庫的檔案結構', lead: '故事入口放在根目錄，人物、勢力、關係各有資料夾；合計 12 張 .md 卡。', note: '三國人物知識庫根目錄有三國演義.md，人物/ 有 5 張、勢力/ 有 3 張、關係/ 有 3 張，共 12 張。資料夾幫忙分類，[[連結]]則可以跨資料夾連到其他卡。Obsidian 寫入，Agent 讀取同一個筆記庫，兩者不必各存一份。來源：https://obsidian.md/help/Getting+started/Create+a+vault' },
  { kind: 'shot', chapter: 1, label: '安裝 1／2', title: '下載 Obsidian', lead: '到官方網站下載電腦版，免費，不用註冊帳號。', shot: { src: downloadPage, aspect: 1400 / 840, url: 'obsidian.md/download', caption: 'Obsidian 官方下載頁實際畫面（2026-10-12 擷取，瀏覽器放大 175%）', alt: 'Obsidian 下載頁上的紫色 Download for Windows 按鈕', marks: [{ n: 1, x: 94, y: -7 }, { n: 2, x: 8, y: 55 }] }, side: ['打開網址：\nobsidian.md/download', '按對應系統的下載按鈕', '依畫面安裝，再打開 Obsidian'], sideGap: 44, note: '網頁會自動判斷電腦系統：Windows 顯示 Download for Windows，Mac 顯示 Download for macOS。按鈕沒出現的話，往下捲到 App 表格，在 Windows 或 Mac 那一列按 Universal。Windows 打開安裝檔，照指示按「下一步」；macOS 打開 .dmg，把 Obsidian 拖進「應用程式」。安裝完成後打開 Obsidian，進入下一頁的首次啟動畫面。官方說明：https://obsidian.md/help/install' },
  { kind: 'shot', chapter: 1, label: '安裝 2／2', title: '第一次打開：先改語言', lead: '安裝並打開後，在最下面選「繁體中文」。', shot: { src: firstLaunch, aspect: 1520 / 470, caption: 'Obsidian 第一次打開的實際畫面（1.10.3，2026-10 擷取）', alt: 'Obsidian 起始畫面的選項和最下方的語言選單', marks: [{ n: 1, x: 24, y: 89 }] }, note: '第一次打開時先在畫面最下方選繁體中文。今天已有講師提供的筆記庫，下一頁將下載教材並開啟既有資料夾，不需建立空白儲存庫。來源：https://obsidian.md/help/User+interface/Language+settings' },
  { kind: 'visual', chapter: 1, label: '下載課堂教材', title: '下載並打開三國筆記庫', lead: '掃 QR code 或按下載，解壓縮後用 Obsidian 開啟。', visual: 'vault-create', note: 'QR code 連到 GitHub 公開的教材 ZIP；投影片內的下載按鈕連到同一份教材的簡報內建檔案，兩種方式皆包含 12 張 Markdown 筆記。解壓縮後，在 Obsidian 選「開啟資料夾作為儲存庫」或同義選項，指定「三國人物知識庫」資料夾，不要選外層的下載資料夾。完成後左側會看到〈三國演義〉與人物、勢力、關係三個分類資料夾。教材：https://raw.githubusercontent.com/Chrouos/AI-workshop-slides/main/slides/obsidian-agent-knowledge-garden/assets/three-kingdoms-vault.zip；操作說明：https://obsidian.md/help/Getting+started/Create+a+vault' },
  { kind: 'practice', chapter: 1, label: '動手做', title: '先讀三張關係卡', lead: '打開左側〈關係〉資料夾，切換三張卡，看每段故事連到誰。', practiceNotes: true, time: '5 分鐘', note: '在既有的 12 張筆記中，展開〈關係〉資料夾，先看〈桃園結義〉、〈煮酒論英雄〉、〈赤壁之戰〉三張卡。點人物的紫色連結，確認能跨資料夾找到人物卡。這三張卡分別解釋結義、對話、對抗，讓原本孤立的人物筆記形成不同路線。來源：https://zh.wikisource.org/wiki/三國演義/第001回 、https://zh.wikisource.org/wiki/三國演義/第021回 、https://zh.wikisource.org/wiki/三國演義/第049回 、https://zh.wikisource.org/wiki/三國演義/第050回' },
  { kind: 'visual', visual: 'link-notes', chapter: 1, label: '沿連結閱讀', title: '關係卡讓連結有理由', lead: '從〈劉備〉點到〈桃園結義〉，讀完情節，再點到〈關羽〉。', note: '先看〈劉備〉，接著揭示〈桃園結義〉，最後揭示〈關羽〉。中間關係卡記錄第 1 回的結義情節；因此連結有可讀的理由，不只是一條線。今天的範例已加好 [[連結]]，學員在 Obsidian 直接點紫色文字驗證。官方說明：https://obsidian.md/help/Linking+notes+and+files/Internal+links' },
  // 02 RAG
  { kind: 'section', chapter: 2, label: '02 / RAG', title: '理解 RAG', lead: '剛才是自己沿連結找資料；現在讓 AI 先查筆記，再根據筆記回答。', note: '上一頁剛從〈劉備〉沿〈桃園結義〉走到〈關羽〉，學員知道要先看卡片內容才明白人物的關係。接下來換 AI 做「先找資料」這一步：先拆解 RAG 的三個字母，再比較查筆記前後的回答。RAG 是一種工作方式，不是 Obsidian 裡的一個按鈕。' },
  { kind: 'visual', visual: 'rag-theory', chapter: 2, label: 'RAG＝檢索增強生成', title: 'RAG 三個字母在做什麼？', lead: 'Retrieval-Augmented Generation：找資料、提供依據、組織回答。', note: '分三次揭示。今天的真實提問是「曹操在這盒筆記中參與哪場戰役？」R／檢索：從可存取的資料中找出〈曹操〉與〈赤壁之戰〉；A／增強：把找到的內容當作上下文，連同原問題一起提供給模型；增強的是這一次回答可用的資訊，不是改寫模型。G／生成：模型參考這些內容回答「赤壁之戰」，並標出來源檔名。RAG 是「回答前先找資料，再根據資料生成」的總稱。來源：https://arxiv.org/abs/2005.11401 、https://ai.meta.com/blog/retrieval-augmented-generation-streamlining-the-creation-of-intelligent-natural-language-processing-models/' },
  { kind: 'visual', visual: 'ragcompare', chapter: 2, label: '查資料前後', title: '回答前查筆記，差在哪裡？', lead: '同一個問題：依這盒筆記，曹操參與哪場戰役？', note: '先看沒有檢索依據時，答案缺乏可核對的來源；再顯示從〈曹操〉找到〈赤壁之戰〉，交叉核對兩張卡的記載，回答「赤壁之戰」。這盒筆記只記錄這場戰役，請勿把問題解讀成曹操一生只參與這一場戰役。RAG 也可以直接搜尋檔案，不一定沿內部連結；找錯資料或資料本身有誤時，回答仍可能出錯。來源：https://arxiv.org/abs/2005.11401' },
  { kind: 'visual', visual: 'agent', chapter: 2, label: '開始查詢前', title: '在 Codex 開啟筆記庫', lead: '在 Codex 指定同一個「三國人物知識庫」，確認 12 張卡可讀取。', note: '在 Codex 選剛才用 Obsidian 打開的資料夾，請它先列出 12 個 .md 檔名。不要選整個「文件」資料夾。' },
  { kind: 'prompt', chapter: 2, label: '練習提問', title: '練習：用 Agent 查筆記', code: ['請在這個 vault 找〈曹操〉。', '根據筆記，曹操參與了哪場戰役？', '請核對相關戰役卡，回答並附上檔名。', '找不到根據的細節不要補寫。'], note: '看 Agent 是否找到〈曹操〉與〈赤壁之戰〉，回答赤壁之戰並附上兩個檔名；沒有查到的細節不要憑印象補。題目限定依這盒筆記回答。' },
  { kind: 'terminal', chapter: 2, label: '回答示例', title: 'Agent 的回答要有根據', lead: '從兩張筆記核對戰役與參與者，並指出來源。', termLabel: '依範例筆記整理的回答示意', code: ['曹操參與赤壁之戰。', '筆記記載：曹操軍與孫權陣營交戰，', '曹操軍敗退。', '依據：曹操.md、赤壁之戰.md'], note: '這是根據範例筆記寫的格式示意。〈曹操〉記載曹操率軍與孫權陣營對抗；〈赤壁之戰〉記載交戰與敗退。這不代表曹操一生只參與赤壁一場戰役，回答範圍是今天提供的 12 張筆記。來源：練習筆記庫／人物／曹操.md、練習筆記庫／關係／赤壁之戰.md。' },
  { kind: 'list', chapter: 2, label: '核對回答', title: '核對 AI 的回答', lead: '依檔名回到原文，逐項核對回答。', items: ['檔案真的存在嗎？', '回答有沒有超出筆記寫的？', '資料不夠時，有沒有說出來？'], reveal: true, note: 'RAG 可以減少瞎掰，但不保證正確。找錯段落，或筆記本身寫錯，回答一樣會錯。' },

  // 03 Agent collaboration
  { kind: 'section', chapter: 3, label: '03 / AGENT', title: 'Agent 協作', lead: '先畫現有關係圖，再擴充故事，最後重畫並比較。', note: '這一章是連續的三次練習。練習一保存原有 12 張卡的關係圖；練習二請 Agent 依小說回目新增人物與事件卡；練習三用同一套規則重畫圖、製作時間線，比較知識庫長大後多了哪些閱讀路線。' },
  { kind: 'prompt', chapter: 3, label: '畫出起點', title: '練習一：畫現有的知識圖', lead: '先留下「擴充前」的版本，等一下才知道多了什麼。', code: ['請讀取現有 12 張筆記，不要修改原檔。', '只畫「人物 → 關係卡 → 人物」的 ASCII 關係圖。', '用筆記裡的 [[連結]] 作線；不要猜不存在的線。', '每條線旁標來源檔名，並列出尚未成卡的人物或事件。', '把圖存成〈人物關係圖－擴充前.md〉。'], time: '5 分鐘', note: '這次輸出是一張可回看的比較基準。圖的範圍限人物和關係卡，暫不畫勢力卡；因此不要把缺少的諸葛亮、周瑜或新事件畫成已存在的節點。請學生在 Obsidian 開圖，核對線有沒有對應到原卡的連結與情節。ASCII 圖可直接貼在 Markdown 程式碼區塊，不依賴額外外掛。' },
  { kind: 'prompt', chapter: 3, label: '擴充故事', title: '練習二：請 Agent 增加故事卡', lead: '新增人物與事件，讓原有的劉備、赤壁線索長出支線。', code: ['保留原本 12 張卡，不覆寫；寫入前先給我看差異。', '查《三國演義》原文，新增人物／諸葛亮、周瑜，', '再新增事件／三顧茅廬、草船借箭，共 4 張卡。', '每張只寫可核對的事實，附回目與來源網址。', '用 [[連結]] 接到已有的劉備、曹操、赤壁之戰等卡；', '沒有根據的關係標「待確認」，不要自行補線。'], time: '10 分鐘', note: '示範新增四張而非無上限生成。三顧茅廬可查《三國演義》第 37–38 回；草船借箭可查第 46 回。讓 Agent 提出新增檔案清單與差異，學員確認來源、人物與連結後才寫入。原 12 張示範卡保持原樣；新卡用向外連結接到舊卡，舊卡可透過反向連結找到新卡。新卡屬於學員練習產物，並非教材 ZIP 內容。來源：https://zh.wikisource.org/wiki/三國演義/第037回 、https://zh.wikisource.org/wiki/三國演義/第038回 、https://zh.wikisource.org/wiki/三國演義/第046回' },
  { kind: 'prompt', chapter: 3, label: '再畫一次', title: '練習三：重畫圖，加上時間線', lead: '沿用練習一的畫法，讓新增的路線清楚浮現。', code: ['用練習一的規則，重畫全部人物與故事卡的 ASCII 圖；', '存成〈人物關係圖－擴充後.md〉。', '另做〈故事時間線.md〉，依小說回目排事件，', '每個事件連回 [[事件卡]] 並標來源；別把回目當歷史年。', '比較前後兩張圖：新增哪些卡、線和可走路線？', '可加分：輸出單一 HTML，同頁顯示 Graph 與 Timeline。'], time: '8 分鐘', note: '讓 Agent 使用與練習一相同的繪圖規則，這樣才可比較。時間線依小說回目排序：桃園結義第 1 回、煮酒論英雄第 21 回、三顧茅廬第 37–38 回、草船借箭第 46 回、赤壁相關情節第 49–50 回。時間線是作品敘事順序，不等於歷史年份。HTML 是加分選項；若生成，請用單檔本機 HTML，不載入外部套件，並連回來源筆記。' },
  { kind: 'visual', visual: 'agent-note', chapter: 3, label: '前後對照', title: '同一盒卡，故事變多了', lead: '圖讓關係可走；時間線則告訴我們故事先後。', note: '本頁是概念示意，不是 Agent 的實際輸出。練習一的圖只根據原有 12 張卡；練習二新增諸葛亮、周瑜、三顧茅廬、草船借箭後，練習三重畫時應能看見新增人物與事件如何接到原卡。請學生指出一條擴充前走不到、擴充後可以走的路，再開時間線核對事件順序。' },
  { kind: 'list', chapter: 3, label: '人工驗收', title: '核對 Agent 的成果', lead: '來源、連結與先後順序都要回到筆記確認。', items: ['原本 12 張卡是否還在？新增的 4 張卡有來源嗎？', '前後兩張圖是否用同一套畫法？每條新線點得開嗎？', '時間線按小說回目排序，沒有誤寫成歷史年份嗎？'], reveal: true, note: '檢查 Agent 是否真的只新增四張來源卡，是否把草船借箭與赤壁之戰強行當成同一事件，並核對新增連結的目標卡存在。學生可用 Obsidian 點連結，也可直接開 Markdown 查看來源網址。' },

  // 04 Knowledge base
  { kind: 'section', chapter: 4, label: '04 / 知識庫', title: '整理成知識庫', lead: '圖與時間線都做好了，接下來讓人找得到來源。', note: '前一章的三次練習已產生新卡、兩版關係圖與一份時間線。本章不重做同樣的圖，而是把來源卡與導覽頁分清楚，建立讓讀者可以從概覽回到原文的入口。' },
  { kind: 'visual', visual: 'layers', chapter: 4, label: '整理方法', title: '來源卡與導覽頁各做什麼', lead: '來源卡記人物和事件；圖與時間線提供兩種閱讀路線。', note: '分三次顯示：原有及新增的來源卡、由來源卡做成的關係圖與時間線、核對來源與連結的規則。這個區分參考 llm-wiki 的 Raw Sources、The Wiki、The Schema，但今天不需安裝套件。來源：https://github.com/Ar9av/obsidian-wiki/blob/main/.skills/llm-wiki/SKILL.md' },
  { kind: 'visual', visual: 'knowledge', chapter: 4, label: '兩種讀法', title: '一張卡，兩種找法', lead: '從圖找人物關係；從時間線找事件先後，最後都回到來源卡。', note: '先顯示人物、事件、來源三種資訊，再顯示關係圖與時間線的分工。以三顧茅廬為例，圖可從劉備走到諸葛亮，時間線可看它在草船借箭之前；兩者都應連回事件卡及小說回目。' },
  { kind: 'prompt', chapter: 4, label: '知識庫練習', title: '練習：替知識庫做首頁', lead: '把圖與時間線放在同一個入口，讀者才知道從哪裡開始。', code: ['新增〈知識庫導覽.md〉，不要改寫來源卡。', '用 [[連結]] 放入擴充後關係圖與故事時間線；', '列出「從人物看關係」與「按故事順序看」兩條路。', '各選一個例子，連回人物卡、事件卡和來源回目。', '如果某張卡未核對，標「待確認」；先讓我看差異。'], time: '5 分鐘', note: '這是導覽頁而非第三張圖。請學生實際點開兩條路，確認關係圖、時間線、人物與事件卡都能互相找到；來源回目則寫在事件卡裡。若練習二未完成，可使用原有 12 張卡建立較短的導覽頁，並清楚標記缺口。' },

  // 05 Publish
  { kind: 'section', chapter: 5, label: '05 / 發布', title: '發布到網站', lead: '選擇要公開的筆記，交給 Digital Garden 變成網站。', note: '從現在起內容會公開到網路上。先決定哪些筆記可分享，接著設定網站、發布並請同學驗收；Git 的手動操作放在課後選修。' },
  { kind: 'visual', visual: 'garden', chapter: 5, label: '網站路線', title: '發布流程', lead: 'Obsidian 撰寫、Digital Garden 選稿、GitHub 儲存、Vercel 部署。', note: '分四次顯示：寫稿、挑稿、存檔、上架；沿著箭頭說明交接。Digital Garden 官方入門流程：Obsidian 外掛、GitHub 範本 repo、Vercel 部署。官方說連到的筆記不會自動跟著發布。來源：https://docs.forestry.md/getting-started/01-getting-started/' },
  { kind: 'flow', chapter: 5, label: '第一次設定 1／3', title: '安裝 Digital Garden 外掛', lead: '回到 Obsidian 的「設定」，在目前的筆記庫安裝外掛。', items: ['開啟設定 → 社群外掛', '開啟社群外掛，按「瀏覽」', '搜尋 Digital Garden → 安裝 → 啟用'], foot: '完成檢查：在「已安裝外掛」看得到 Digital Garden，且開關已打開。', note: '分三次顯示。先點左下角齒輪進設定，找到「社群外掛」；若仍在受限模式，先按畫面提示啟用社群外掛。接著瀏覽、搜尋 Digital Garden、安裝並啟用。提醒學員這是安裝到目前的筆記庫。官方 Obsidian 操作說明：https://obsidian.md/help/community-plugins；Digital Garden 入門：https://docs.forestry.md/getting-started/01-getting-started/' },
  { kind: 'flow', chapter: 5, label: '第一次設定 2／3', title: '用官方範本建立網站', lead: 'GitHub 儲存網站檔案；Vercel 部署並產生公開網址。', items: ['先登入 GitHub 與 Vercel', '到 Digital Garden 入門頁按 Deploy to Vercel', '替網站 repo 取名，部署後記下網址'], foot: '官方入口：docs.forestry.md/getting-started/01-getting-started/', note: '分三次顯示。從投影片上的官方入口打開範本，按 Deploy to Vercel。Vercel 會在自己的 GitHub 帳號建立網站 repo，接著完成部署並產生網址。請學員記下 repo 名稱和網站網址；這個網站 repo 與本機 Obsidian 筆記庫是兩個地方。來源：https://docs.forestry.md/getting-started/01-getting-started/' },
  { kind: 'setup', chapter: 5, label: '第一次設定 3／3', title: '把 Digital Garden 接上 GitHub', lead: '建立僅授權網站儲存庫的 GitHub token，並填入外掛設定。', items: ['到 GitHub 建 fine-grained token', '只選剛才的網站 repo；依官方文件設定權限', '將帳號、repo 名稱與 token 填進外掛'], foot: '權限圖解：docs.forestry.md/advanced/fine-grained-access-token/', note: '延續上一頁，這一步是讓外掛有權把已公開筆記寫入自己的網站 repo。從官方權限圖解進入 GitHub 的 token 頁，只授權剛建立的網站 repo，權限依官方文件設定。產生後複製 token，回 Obsidian → Digital Garden 設定，填 GitHub Username、GitHub repo name 和 GitHub token。token 只貼在外掛設定，不貼進筆記或投影片。來源：https://docs.forestry.md/getting-started/01-getting-started/ 、https://docs.forestry.md/advanced/fine-grained-access-token/' },
  { kind: 'visual', visual: 'publish-property', chapter: 5, label: '選擇公開', title: '檢查公開範圍', lead: '教材原有 12 張已預設公開；新卡、圖與時間線要另外選。', note: '打開〈三國演義〉確認 dg-home 與 dg-publish；再打開一張人物卡及一張關係卡確認 dg-publish。教材 ZIP 中的 12 張已預設屬性；練習二、三及知識庫練習新建的卡、圖、時間線與導覽頁，預設不會跟著公開。若要公開，逐篇核對內容與來源，再各自設定 dg-publish。連到的卡不會自動一起發布。來源：https://docs.forestry.md/getting-started/01-getting-started/' },
  { kind: 'shot', chapter: 5, label: '發布', title: '發布已標記的筆記', lead: '按 Ctrl／Cmd + P，搜尋 garden publish，選 All Notes Marked for Publish。', shot: { src: dgPalette, aspect: 1800 / 720, caption: DG, alt: '命令面板搜尋 garden publish 的結果' }, side: ['All Notes…：發布所有已標記筆記', 'Active Note：只發布目前這一篇'], sideW: 440, note: '檢查過這 12 張示範卡的公開屬性後，選 Publish All Notes Marked for Publish。若之後只改一篇，可用 Publish Active Note。到 Vercel 網址查看更新。來源：https://docs.forestry.md/getting-started/02-commands/' },
  { kind: 'visual', visual: 'site', chapter: 5, label: '預期成果', title: '公開網站的瀏覽路徑', lead: '入口 → 人物 → 關係 → 另一人物；在網站上也能走完三層。', note: '網站是預期路線示意，外觀與網址依個人設定而異。請從〈三國演義〉選〈劉備〉、〈曹操〉或〈孫權〉，進入關係卡，再走到另一人物。若任何目標頁打不開，檢查是否個別標記 dg-publish 並重新發布。' },
  { kind: 'list', chapter: 5, label: '網站驗收', title: '檢查網站', lead: '請同學在公開網站上任選一條路，走完三層。', items: ['入口能點到人物卡嗎？', '人物能點到關係卡，再到另一人物嗎？', '若某頁打不開，先檢查它的公開屬性'], reveal: true, note: '連到的筆記不會自動發布。若路線中斷，檢查目標卡是否已打勾 dg-publish，然後再次發布。來源：https://docs.forestry.md/getting-started/01-getting-started/' },
  { kind: 'practice', chapter: 5, label: '完整練習', title: '完整練習：交給同學驗收', lead: '用現成的卡片盒完成查詢、發布與同儕驗收。', items: ['任選一條人物 → 關係 → 人物路線', '讓 Agent 解釋這段關係，核對來源卡', '發布 12 張示範卡，請同學在網站走一次'], reveal: true, time: '12 分鐘', note: '不必再抄人物資料。用範例卡與已核對的關係卡完成驗收；同學能從入口連續走到人物、關係、另一人物，且每頁都有根據才算完成。' },
  { kind: 'statement', label: '總結', title: '今天的流程回顧', lead: '打開卡片盒 → 沿關係探索 → 檢索核對 → Agent 整理 → 發布。', note: '收尾請學員說明：為什麼同一張劉備卡能在結義與煮酒兩條路出現？關係卡讓連結可解釋，來源卡讓回答可核對。' },
  { kind: 'section', label: 'APPENDIX', title: '課後選修', lead: '延伸主題：llm-wiki 自動整理與 Git 發布流程。', note: '主線在上一頁已結束。以下是兩段獨立的進階材料：llm-wiki Skills 與 Git 手動操作，可依學員經驗或課後時間選讀。' },
  { kind: 'code', label: '課後選修｜進階安裝', title: '安裝 llm-wiki', code: ['pip install obsidian-wiki', 'obsidian-wiki setup --vault <筆記庫路徑>', 'obsidian-wiki doctor'], lead: 'llm-wiki 是一組讓 Agent 重複整理筆記的 Skills。', note: '這是課後選修，主線的知識頁練習不需要安裝新工具。Skill 是給 Agent 的做事說明。這一頁示範使用命令列安裝；<筆記庫路徑> 要換成完整路徑。setup 會把 Skills 連到多個 Agent 的設定資料夾，也會寫入使用者設定。安裝完成後在 Codex 打開筆記庫，說「set up my wiki」。完整說明：https://github.com/Ar9av/obsidian-wiki/blob/main/docs/installation.md' },
  { kind: 'rows', label: '課後選修｜常用 Skills', title: '常用的 Wiki Skills', lead: '安裝後，才可在 Codex 用 $ 開頭呼叫。', rows: [['$wiki-ingest', '把資料收進來，整理成可追來源的 Wiki 頁'], ['$wiki-query', '從 Wiki 找答案，並附出處'], ['$wiki-lint', '檢查斷掉的連結與孤立頁']], note: '課後選修。先示範一個具體請求：用 $wiki-query 問「劉備與曹操在哪段故事同場？」並核對它引用的人物卡；再帶過其餘兩種 Skill。完整清單：https://github.com/Ar9av/obsidian-wiki/blob/main/docs/skills.md' },
  { kind: 'visual', visual: 'git', label: '課後選修｜Git 觀念', title: 'Git 基本觀念', lead: 'Digital Garden 發布時，會替你完成 commit 與 push。', note: '分三次顯示：commit、push、部署；讓學員指出 Digital Garden 幫他完成哪兩步。這是課後選修。主線已完成網站發布，這裡才拆開看幕後：commit 記下版本，push 把版本送到 GitHub，Vercel 接收後部署。來源：https://git-scm.com/book/en/v2/Git-Basics-Recording-Changes-to-the-Repository.html 、https://docs.github.com/en/get-started/using-git/pushing-commits-to-a-remote-repository' },
  { kind: 'code', label: '課後選修｜取得 repo', title: '複製網站 repo', lead: '這是 GitHub 上的網站 repo；與本機 Obsidian 筆記庫是兩個資料夾。', code: ['git clone <repo 網址>', 'cd <資料夾名稱>'], shot: { src: githubClone, aspect: 926 / 694, caption: 'GitHub Docs 官方圖（CC BY 4.0）', alt: 'GitHub 綠色 Code 按鈕展開後的 HTTPS 網址' }, side: ['按綠色 Code → HTTPS → 複製網址'], note: '課後選修。複製的是自己在 Vercel 部署時建立的網站 repo，不是 Obsidian 筆記庫，也不是外掛原始碼。角括號要換成實際網址和資料夾名稱。圖片來源：https://docs.github.com/en/repositories/creating-and-managing-repositories/cloning-a-repository（GitHub Docs，CC BY 4.0）' },
  { kind: 'terminal', label: '課後選修｜手動練習', title: '練習：commit 與 push', lead: '在網站 repo 的 README 加一行，再看三個動作。', termLabel: '示例輸出｜在練習用網站 repo 執行', code: ['$ git status', '  modified: README.md', '$ git add README.md', '$ git commit -m "記錄知識庫練習"', '  已建立一個新版本', '$ git push', '  已送到 GitHub'], note: '課後選修。請先修改網站 repo 的 README，再執行 status、add、commit、push。README 的字不會自動變成公開筆記內容；筆記仍從 Obsidian 的 Digital Garden 外掛發布。推送後可在 GitHub 核對版本，再看 Vercel 是否完成部署。' },
];

const renderItems = (items: string[], reveal = false) => {
  const rows = items.map((item, i) => <Bullet key={item} n={i + 1}>{item}</Bullet>);
  return reveal ? <Steps>{rows.map((row, i) => <Step key={i}><div style={{ marginBottom: i === rows.length - 1 ? 0 : 28 }}>{row}</div></Step>)}</Steps> : rows;
};

const AgendaRow = ({ n, title, outcome, page }: { n: number; title: string; outcome: string; page: number }) => (
  <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr 90px', alignItems: 'baseline', gap: 24, padding: '22px 0 20px', borderBottom: `1px solid ${rule}` }}>
    <span style={{ fontFamily: 'var(--osd-font-display)', fontSize: 56, lineHeight: 1, color: amber }}>{String(n).padStart(2, '0')}</span>
    <div>
      <div style={{ fontSize: 38, fontWeight: 600, lineHeight: 1.25 }}>{title}</div>
      <div style={{ fontSize: 28, lineHeight: 1.45, color: muted, marginTop: 6 }}>{outcome}</div>
    </div>
    <span style={{ fontFamily: mono, fontSize: 24, color: quiet, textAlign: 'right' }}>p.{String(page).padStart(2, '0')}</span>
  </div>
);

const practiceNoteExamples = [
  { name: '桃園結義', role: '結義關係', content: '第 1 回：劉備、關羽、張飛結義。\n參與人物：[[劉備]]、[[關羽]]、[[張飛]]' },
  { name: '煮酒論英雄', role: '對話關係', content: '第 21 回：曹操與劉備煮酒論英雄。\n參與人物：[[曹操]]、[[劉備]]' },
  { name: '赤壁之戰', role: '對抗關係', content: '第 49 至 50 回：孫權陣營對抗曹操軍。\n相關人物：[[孫權]]、[[曹操]]' },
] as const;

const PracticeFileRow = ({ name, role, active, onClick }: { name: string; role: string; active: boolean; onClick: () => void }) => (
  <button type="button" onClick={onClick} aria-pressed={active} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 17, padding: '7px 23px', border: 'none', borderLeft: `5px solid ${active ? amber : 'transparent'}`, background: active ? '#EDE1D5' : 'transparent', textAlign: 'left', color: ink, fontFamily: 'inherit', cursor: 'pointer' }}>
    <span aria-hidden="true" style={{ width: 26, height: 31, boxSizing: 'border-box', border: `2px solid ${active ? amber : quiet}`, borderTopRightRadius: 7, background: '#FFFFFF', flexShrink: 0 }} />
    <span style={{ display: 'grid', gap: 2 }}><strong style={{ fontSize: 28 }}>{name}</strong><span style={{ color: muted, fontSize: 20 }}>{role}</span></span>
  </button>
);

const PracticeVault = () => {
  const [active, setActive] = useState<0 | 1 | 2>(0);
  const selected = practiceNoteExamples[active];
  const choose = (next: 0 | 1 | 2) => setActive(next);

  return (
    <div style={{ border: `1px solid ${rule}`, background: '#FFFFFF', height: 444, display: 'grid', gridTemplateColumns: '365px 1fr', boxShadow: '0 10px 30px rgba(28,25,23,0.06)' }}>
      <div style={{ background: surface, borderRight: `1px solid ${rule}` }}>
        <div style={{ padding: '18px 28px 14px', borderBottom: `1px solid ${rule}` }}>
          <div style={{ fontSize: 30, fontWeight: 600 }}>三國人物知識庫</div>
          <div style={{ color: muted, fontSize: 22, marginTop: 5 }}>共 12 張 · 這裡先看 3 張關係卡</div>
        </div>
        <div style={{ paddingTop: 10 }}>
          <div style={{ padding: '7px 27px 11px', color: amber, fontSize: 24, fontWeight: 600 }}>▾ 關係（3）</div>
          <PracticeFileRow name="桃園結義" role="結義關係" active={active === 0} onClick={() => choose(0)} />
          <PracticeFileRow name="煮酒論英雄" role="對話關係" active={active === 1} onClick={() => choose(1)} />
          <PracticeFileRow name="赤壁之戰" role="對抗關係" active={active === 2} onClick={() => choose(2)} />
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateRows: '75px 1fr', minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 24, padding: '0 34px', borderBottom: `1px solid ${rule}`, background: '#FAFAF9' }}>
          <div style={{ fontSize: 27, color: muted }}>{selected.name}.md</div>
          <span style={{ border: `1px solid ${amber}`, color: amber, background: '#FFFFFF', fontSize: 22, fontWeight: 600, padding: '8px 16px' }}>已備好範例</span>
        </div>
        <div style={{ padding: '42px 50px', minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 24 }}><strong style={{ fontSize: 48 }}>{selected.name}</strong><span style={{ color: amber, fontSize: 25 }}>{selected.role}</span></div>
          <pre style={{ margin: '30px 0 0', fontFamily: 'var(--osd-font-body)', fontSize: 32, lineHeight: 1.55, color: ink, whiteSpace: 'pre-wrap', userSelect: 'text' }}>{selected.content}</pre>
        </div>
      </div>
    </div>
  );
};

const SideNotes = ({ items, gap = 30 }: { items: string[]; gap?: number }) => (
  <div style={{ display: 'grid', gap, alignContent: 'start', paddingTop: 8 }}>
    {items.map((item, i) => <Callout key={item} n={i + 1}>{item}</Callout>)}
  </div>
);

const RenderSlide = ({ spec }: { spec: SlideSpec }) => {
  if (spec.kind === 'cover') return (
    <Shell top={174}>
      <MotionStyle />
      <Eyebrow>{spec.label}</Eyebrow>
      <div style={{ marginTop: 62 }}><Title className="garden-cover-title">{spec.title}</Title></div>
      <Lead className="garden-cover-subtitle">{spec.lead}</Lead>
      <div className="garden-cover-rule" style={{ width: 160, height: 5, background: amber, marginTop: 80 }} />
    </Shell>
  );

  if (spec.kind === 'section') return (
    <Shell chapter={spec.chapter} top={192}>
      <Eyebrow>{spec.label}</Eyebrow>
      <div style={{ marginTop: 63 }}><Title>{spec.title}</Title></div>
      {spec.lead ? <Lead>{spec.lead}</Lead> : null}
      <div style={{ width: 160, height: 5, background: amber, marginTop: 70 }} />
    </Shell>
  );

  if (spec.kind === 'agenda') return (
    <Shell>
      <div style={{ display: 'grid', gridTemplateColumns: '500px 1fr', gap: 96, height: '100%' }}>
        <div style={{ paddingTop: 8 }}>
          <Eyebrow>{spec.label}</Eyebrow>
          <h2 style={{ fontFamily: 'var(--osd-font-display)', fontSize: 84, fontWeight: 400, lineHeight: 1.25, letterSpacing: '-0.025em', margin: '44px 0 0', whiteSpace: 'pre-line' }}>{spec.title}</h2>
          <div style={{ width: 120, height: 5, background: amber, margin: '52px 0 0' }} />
          <p style={{ fontSize: 32, lineHeight: 1.55, color: muted, margin: '44px 0 0', whiteSpace: 'pre-line' }}>{spec.lead}</p>
        </div>
        <div style={{ borderTop: `2px solid ${ink}`, alignSelf: 'start', marginTop: 8 }}>
          {(spec.items ?? []).map((outcome, i) => (
            <AgendaRow key={chapters[i]} n={i + 1} title={chapters[i]} outcome={outcome} page={specs.findIndex(x => x.kind === 'section' && x.chapter === i + 1) + 1} />
          ))}
        </div>
      </div>
    </Shell>
  );

  // Space left under the heading block: ~600px without a lead, ~520px with one.
  const maxH = spec.shotReveal ? 510 : spec.lead ? 470 : 560;

  return (
    <Shell chapter={spec.chapter}>
      <Eyebrow>{spec.label}</Eyebrow>
      <Heading>{spec.title}</Heading>
      {spec.lead ? <Lead>{spec.lead}</Lead> : null}

      {spec.kind === 'statement' ? <div style={{ width: 165, height: 5, background: amber, marginTop: 80 }} /> : null}

      {spec.kind === 'visual' && spec.visual ? <div style={{ marginTop: spec.lead ? 42 : 70 }}><Diagram type={spec.visual} /></div> : null}

      {spec.kind === 'shot' && spec.shot ? (
        spec.side ? (() => {
          const sideW = spec.sideW ?? 560;
          const h = Math.min(maxH, (CONTENT_W - sideW - 56) / spec.shot.aspect);
          return (
            <div style={{ display: 'grid', gridTemplateColumns: `${Math.round(h * spec.shot.aspect)}px 1fr`, gap: 56, marginTop: spec.lead ? 40 : 56, alignItems: 'start', position: 'relative' }}>
              <Screenshot {...spec.shot} marks={spec.shotReveal ? [] : spec.shot.marks} maxW={CONTENT_W} maxH={h} />
              {spec.shotReveal ? (
                <div style={{ display: 'grid', gap: spec.sideGap ?? 30, alignContent: 'start', paddingTop: 40 }}>
                  <Steps>
                    {spec.side.map((item, i) => {
                      const mark = spec.shot!.marks?.[i];
                      const [title, detail] = item.split('\n');
                      return (
                        <Step key={item}>
                          <ScreenTourCallout n={i + 1} title={title} detail={detail} />
                          {mark ? <MarkBubble n={mark.n} left={Math.round(h * spec.shot!.aspect) * mark.x / 100} top={h * mark.y / 100} /> : null}
                        </Step>
                      );
                    })}
                  </Steps>
                </div>
              ) : <SideNotes items={spec.side} gap={spec.sideGap} />}
            </div>
          );
        })() : (
          <div style={{ marginTop: spec.lead ? 40 : 56 }}><Screenshot {...spec.shot} maxW={CONTENT_W} maxH={maxH} /></div>
        )
      ) : null}

      {spec.kind === 'analogy' && spec.cards ? (
        <div style={{ marginTop: spec.lead ? 56 : 80 }}>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${spec.cards.length}, 1fr)`, gap: 32 }}>
            {spec.cards.map(card => (
              <div key={card.kicker} style={{ background: card.tint ?? surface, borderTop: `5px solid ${amber}`, padding: '34px 38px', minHeight: spec.cards!.length > 2 ? 300 : 320, boxSizing: 'border-box' }}>
                <div style={{ fontSize: 28, fontWeight: 600, color: amber, letterSpacing: '0.04em' }}>{card.kicker}</div>
                <div style={{ fontSize: 50, fontWeight: 600, lineHeight: 1.25, marginTop: 22 }}>{card.title}</div>
                <div style={{ fontSize: 32, lineHeight: 1.45, color: muted, marginTop: 20, whiteSpace: 'pre-line' }}>{card.detail}</div>
              </div>
            ))}
          </div>
          {spec.foot ? <div style={{ fontSize: 30, lineHeight: 1.5, color: muted, marginTop: 44 }}>{spec.foot}</div> : null}
        </div>
      ) : null}

      {spec.kind === 'setup' ? (
        <div style={{ marginTop: 48 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '520px 1fr', gap: 56, alignItems: 'start' }}>
            <div style={{ display: 'grid', gap: 34 }}>
              {(spec.items ?? []).map((item, i) => <Callout key={item} n={i + 1}>{item}</Callout>)}
            </div>
            <Screenshot src={dgSettings} aspect={1680 / 500} maxW={1050} maxH={420} caption={DG} alt="Digital Garden 外掛設定中的 GitHub repo name、Username、token 欄位" />
          </div>
          {spec.foot ? <div style={{ color: amber, fontSize: 26, marginTop: 24 }}>{spec.foot}</div> : null}
        </div>
      ) : null}

      {spec.kind === 'rows' && spec.rows ? (
        <div style={{ display: 'grid', gap: 22, marginTop: 52, maxWidth: 1500 }}>
          {spec.rows.map(([cmd, text]) => (
            <div key={cmd} style={{ display: 'grid', gridTemplateColumns: '400px 1fr', alignItems: 'center', background: surface, borderLeft: `5px solid ${amber}`, padding: '26px 34px', gap: 30 }}>
              <span style={{ fontFamily: mono, fontSize: 34, fontWeight: 600, color: amber }}>{cmd}</span>
              <span style={{ fontSize: 34, lineHeight: 1.4 }}>{text}</span>
            </div>
          ))}
        </div>
      ) : null}

      {spec.kind === 'practice' && spec.practiceNotes ? (
        <div style={{ marginTop: 35 }}>
          <PracticeVault />
          <div style={{ display: 'flex', alignItems: 'center', gap: 17, color: ink, fontSize: 27, marginTop: 25 }}>
            <NumDot n={1} />
            <span>在 Obsidian 打開其中一張關係卡，點 [[人物]] 看能走到哪裡。</span>
          </div>
          <div style={{ color: amber, fontSize: 24, fontWeight: 600, marginTop: 13 }}>完成檢查：能從一張關係卡走到人物卡，再走向別的關係。</div>
        </div>
      ) : null}

      {spec.kind === 'list' || (spec.kind === 'practice' && !spec.practiceNotes) ? (
        <div style={{ display: 'grid', gap: 28, marginTop: spec.lead ? 48 : 72 }}>
          {renderItems(spec.items ?? [], spec.reveal ?? false)}
        </div>
      ) : null}

      {spec.kind === 'flow' ? (
        <div style={{ marginTop: spec.lead ? 50 : 90 }}>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${spec.items?.length ?? 3}, minmax(0, 1fr))`, gap: 20 }}>
            <Steps>{(spec.items ?? []).map((item, i) => (
              <Step key={item}><div style={{ position: 'relative', borderTop: `5px solid ${i === 0 ? amber : rule}`, background: surface, padding: '28px 26px', minHeight: 170, boxSizing: 'border-box' }}>
                <div style={{ fontFamily: mono, fontSize: 24, color: amber }}>{String(i + 1).padStart(2, '0')}</div>
                <div style={{ fontSize: 34, fontWeight: 600, lineHeight: 1.35, marginTop: 18, overflowWrap: 'anywhere' }}>{item}</div>
                {i < (spec.items?.length ?? 0) - 1 ? <span style={{ position: 'absolute', right: -18, top: 80, zIndex: 1, color: amber, fontSize: 32 }}>→</span> : null}
              </div></Step>
            ))}</Steps>
          </div>
          {spec.foot ? <div style={{ background: '#F2E6D9', borderLeft: `5px solid ${amber}`, marginTop: 32, padding: '18px 24px', fontSize: 28, lineHeight: 1.4 }}>{spec.foot}</div> : null}
        </div>
      ) : null}

      {spec.kind === 'compare' ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28, marginTop: 70 }}>
          {[spec.left, spec.right].map((part, i) => part ? <div key={part.title} style={{ borderTop: `5px solid ${i === 0 ? amber : rule}`, background: surface, padding: '34px 38px', minHeight: 360, boxSizing: 'border-box' }}>
            <div style={{ fontSize: 42, fontWeight: 600 }}>{part.title}</div>
            <div style={{ display: 'grid', gap: 22, marginTop: 44 }}>{part.items.map(item => <div key={item} style={{ fontSize: 34, lineHeight: 1.45, color: muted }}>— {item}</div>)}</div>
          </div> : null)}
        </div>
      ) : null}

      {spec.kind === 'prompt' ? (
        <div style={{ marginTop: spec.lead ? 45 : 72 }}><CodeBlock lines={spec.code ?? []} label="你輸入的提示詞" /></div>
      ) : null}

      {spec.kind === 'code' ? (
        spec.shot ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 640px', gap: 56, marginTop: 45, alignItems: 'start' }}>
            <div>
              <CodeBlock lines={spec.code ?? []} label="範例指令" />
              {spec.side ? <div style={{ marginTop: 40 }}><SideNotes items={spec.side} /></div> : null}
            </div>
            <Screenshot {...spec.shot} maxW={640} maxH={470} />
          </div>
        ) : (
          <div style={{ marginTop: spec.lead ? 45 : 72 }}><CodeBlock lines={spec.code ?? []} label="範例指令" /></div>
        )
      ) : null}

      {spec.kind === 'terminal' ? (
        <div style={{ marginTop: spec.lead ? 40 : 56 }}><Terminal lines={spec.code ?? []} label={spec.termLabel ?? ''} /></div>
      ) : null}

      {(spec.kind === 'practice' || (spec.kind === 'prompt' && spec.time)) ? <><MotionStyle /><div className="garden-practice-time" style={{ position: 'absolute', bottom: 140, right: 144, fontSize: 30, color: amber, fontWeight: 600 }}>⏱ {spec.time}</div></> : null}
    </Shell>
  );
};

export const meta: SlideMeta = {
  title: 'AI 工作坊 02｜Obsidian × Agent 知識庫',
  createdAt: '2026-10-11T18:43:21.284Z',
  theme: 'thoughtstream',
};

export const notes: (string | undefined)[] = specs.map(spec => spec.note);

const pages = specs.map(spec => {
  const page = (() => <RenderSlide spec={spec} />) as Page;
  if (spec.kind === 'section') page.transition = chapterTransition;
  return page;
});

export default pages satisfies Page[];
