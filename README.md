# open-slide workspace

Slides as React components. Each slide lives under `slides/<id>/index.tsx` and default-exports an array of page components. The `@open-slide/core` runtime handles layout, scaling, navigation, thumbnails, and fullscreen play mode — you just write the pages.

## AI 協作課（四堂）

- [簡報首頁](https://chrouos.github.io/AI-workshop-slides/)：[第一堂](https://chrouos.github.io/AI-workshop-slides/s/aw-01/)、[第二堂](https://chrouos.github.io/AI-workshop-slides/s/aw-02/)、[第三堂](https://chrouos.github.io/AI-workshop-slides/s/aw-03/)、[第四堂](https://chrouos.github.io/AI-workshop-slides/s/aw-04/)
- [教材總表](examples/README.md)：每堂的提示詞、要下載的 ZIP、卡住時的範例
- [QR code 總表](examples/qr/README.md)：投影或印給學生掃

| 堂 | 主題 | 下載 |
| --- | --- | --- |
| 第一堂 | 認識 AI，學會用 Codex | [aw-01-lab.zip](https://raw.githubusercontent.com/Chrouos/AI-workshop-slides/main/examples/aw-01-lab.zip) |
| 第二堂 | Obsidian 與 RAG | [三國人物知識庫.zip](https://raw.githubusercontent.com/Chrouos/AI-workshop-slides/main/examples/aw-02-vault/%E4%B8%89%E5%9C%8B%E4%BA%BA%E7%89%A9%E7%9F%A5%E8%AD%98%E5%BA%AB.zip) |
| 第三堂 | Skills | [第三堂範例.zip](https://raw.githubusercontent.com/Chrouos/AI-workshop-slides/main/examples/aw-03-lab/%E7%AC%AC%E4%B8%89%E5%A0%82%E7%AF%84%E4%BE%8B.zip)（卡住時用） |
| 第四堂 | 發布到網站 | [第三堂完成版.zip](https://raw.githubusercontent.com/Chrouos/AI-workshop-slides/main/examples/aw-04-lab/%E7%AC%AC%E4%B8%89%E5%A0%82%E5%AE%8C%E6%88%90%E7%89%88.zip)（第三堂沒做完的人用） |

## Getting started

```bash
pnpm install
pnpm dev
```

Then open the dev server and edit `slides/getting-started/index.tsx`, or create a new slide at `slides/<your-slide>/index.tsx`.

## Scripts

| Command | Description |
| --- | --- |
| `pnpm dev` | Start the dev server with hot reload. |
| `pnpm build` | Build a static bundle you can deploy. |
| `pnpm preview` | Preview the built bundle locally. |

## Authoring a slide

```tsx
// slides/my-slide/index.tsx
import type { Page, SlideMeta } from '@open-slide/core';

const Cover: Page = () => (
  <div style={{ width: '100%', height: '100%' }}>Hello</div>
);

export const meta: SlideMeta = { title: 'My slide' };
export default [Cover] satisfies Page[];
```

Every page renders into a fixed **1920 × 1080** canvas — design with absolute pixel values. Put images, videos, and fonts under `slides/<id>/assets/` and import them directly.

See [`CLAUDE.md`](./CLAUDE.md) for the full authoring guide.

## Navigation

- Arrow keys / PageUp / PageDown move between pages.
- `F` enters fullscreen play mode; Esc exits.
- In play mode: Space / → next, ← prev.

## Claude Code integration

This workspace ships with Claude Code skills preconfigured under `.claude/skills/` and `.agents/skills/`. Ask Claude Code to "make slides about X" and the `create-slide` skill takes over. Use `apply-comments` to iterate via inspector-style markers inside your source.

## Config

Optional `open-slide.config.ts` at the workspace root:

```ts
import type { OpenSlideConfig } from '@open-slide/core';

const openSlideConfig: OpenSlideConfig = {
  port: 5173,
};

export default openSlideConfig;
```

Supported fields: `slidesDir`, `port`.
