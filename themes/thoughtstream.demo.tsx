import { type Page, useSlidePageNumber } from '@open-slide/core';

const FONT_HREF = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;600&family=Libre+Baskerville:wght@400;700&display=swap';
const FONT_LINK_ID = 'osd-webfont-theme-thoughtstream';
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

const Title = ({ children }: { children: React.ReactNode }) => (
  <h1
    style={{
      fontFamily: '"Libre Baskerville", Georgia, "Times New Roman", serif',
      fontSize: 132,
      fontWeight: 400,
      lineHeight: 1.17,
      letterSpacing: '-0.035em',
      maxWidth: 1450,
      margin: 0,
      color: '#1C1917',
    }}
  >
    {children}
  </h1>
);

const Footer = () => {
  const { current, total } = useSlidePageNumber();
  return (
    <div
      style={{
        position: 'absolute',
        left: 144,
        right: 144,
        bottom: 56,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTop: '1px solid #E7E5E4',
        paddingTop: 22,
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        fontSize: 22,
        fontWeight: 400,
        color: '#A8A29E',
      }}
    >
      <span>THOUGHTSTREAM</span>
      <span>{String(current).padStart(2, '0')} / {String(total).padStart(2, '0')}</span>
    </div>
  );
};

const Eyebrow = ({ children }: { children: React.ReactNode }) => (
  <div
    style={{
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      fontSize: 24,
      fontWeight: 600,
      letterSpacing: '0.14em',
      textTransform: 'uppercase',
      color: '#78716C',
    }}
  >
    {children}
  </div>
);

const Cover: Page = () => (
  <div style={{ width: '100%', height: '100%', boxSizing: 'border-box', position: 'relative', background: '#FAFAF9', padding: '180px 144px 112px' }}>
    <Eyebrow>Notes on better thinking</Eyebrow>
    <div style={{ marginTop: 74 }}><Title>A little room<br />to think.</Title></div>
    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 38, lineHeight: 1.55, color: '#57534E', maxWidth: 1100, marginTop: 48 }}>
      Let the important idea have space to breathe.
    </p>
    <Footer />
  </div>
);

const Content: Page = () => (
  <div style={{ width: '100%', height: '100%', boxSizing: 'border-box', position: 'relative', background: '#FAFAF9', padding: '112px 144px' }}>
    <Eyebrow>01 / An observation</Eyebrow>
    <h2 style={{ fontFamily: '"Libre Baskerville", Georgia, "Times New Roman", serif', fontSize: 76, fontWeight: 400, lineHeight: 1.2, letterSpacing: '-0.025em', color: '#1C1917', margin: '50px 0 0', maxWidth: 1400 }}>
      Clarity begins with space.
    </h2>
    <div style={{ width: 1250, borderTop: '1px solid #E7E5E4', marginTop: 62 }} />
    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 38, lineHeight: 1.55, color: '#57534E', maxWidth: 1250, marginTop: 54 }}>
      A single thought, given enough room, becomes easier to see and remember.
    </p>
    <Footer />
  </div>
);

const Closer: Page = () => (
  <div style={{ width: '100%', height: '100%', boxSizing: 'border-box', position: 'relative', background: '#FAFAF9', padding: '220px 144px 112px' }}>
    <Eyebrow>One thought to keep</Eyebrow>
    <div style={{ marginTop: 64 }}><Title>Make room for<br />what matters.</Title></div>
    <Footer />
  </div>
);

export default [Cover, Content, Closer] satisfies Page[];
