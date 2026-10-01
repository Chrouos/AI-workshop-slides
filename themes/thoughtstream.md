---
name: ThoughtStream
description: A quiet editorial theme with warm white space, stone accents, and literary serif headings.
mode: light
---

# ThoughtStream

## Palette

| Role | Value | Notes |
| --- | --- | --- |
| bg | `#FAFAF9` | Warm white canvas |
| text | `#1C1917` | Warm black primary copy |
| accent | `#78716C` | Stone labels, rules, and key details |
| muted | `#57534E` | Secondary copy |
| faint | `#A8A29E` | Tertiary labels and page numbers |
| surface | `#F5F5F4` | Rare, quiet content block |
| rule | `#E7E5E4` | Hairline separators |

## Typography

- Display font: `"Libre Baskerville", Georgia, "Times New Roman", serif` — weight 400 for reflective titles, 700 only for emphasis.
- Body font: `Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif` — weight 400 for copy, 600 for labels.
- Webfont import: `https://fonts.googleapis.com/css2?family=Inter:wght@400;600&family=Libre+Baskerville:wght@400;700&display=swap`. Follow `slide-authoring/references/webfonts.md` when copying into a real slide.
- Type-scale overrides for the 1920 × 1080 canvas: hero 132 px; page heading 76 px; body 38 px; caption and label 24 px. The source design's 17 px body type and 680 px reading measure are web values, so use these slide sizes and keep prose within roughly 1250 px.
- Heading line-height 1.17; body line-height 1.55. Keep no more than two weights on one page.

## Layout

- Content padding: 144 px at left and right, 112 px at top. Reserve the lower 110 px for the footer.
- Alignment: left-aligned editorial column. Use large empty areas to create a deliberate reading rhythm.
- Grid notes: align titles, body, rules, and footer to the same left edge. Limit paragraphs to 2–3 short lines. Separate content with `#E7E5E4` rules, never shadows.
- Geometry: sharp corners, no gradients or decorative illustrations. The 12 px spacing rhythm from the source becomes multiples of 24–48 px at slide scale.

## Fixed components

These are paste-ready. Copy them verbatim into a slide that uses this theme.

### Title

```tsx
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
```

### Footer

```tsx
import { useSlidePageNumber } from '@open-slide/core';

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
```

### Eyebrow

```tsx
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
```

## Motion

- Philosophy: static. Reading and reflection benefit from stillness; use the framework's default page change without element-level animation.
- Reusable keyframes: none.

## Aesthetic

Quiet editorial minimalism, like a spacious personal essay set on warm paper. Warm black serif titles give the ideas a literary voice; restrained stone labels and fine rules guide the eye without calling attention to themselves. Let white space carry the composition. Avoid rounded cards, shadows, gradients, decorative icons, and dense blocks of copy.

## Example usage

```tsx
const Cover: Page = () => (
  <div style={{ width: '100%', height: '100%', boxSizing: 'border-box', position: 'relative', background: '#FAFAF9', padding: '180px 144px 112px' }}>
    <Eyebrow>Notes on better thinking</Eyebrow>
    <div style={{ marginTop: 74 }}><Title>A little room to think.</Title></div>
    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 38, lineHeight: 1.55, color: '#57534E', maxWidth: 1100, marginTop: 48 }}>
      Let the important idea have space to breathe.
    </p>
    <Footer />
  </div>
);
```
