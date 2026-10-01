import { createRequire } from 'node:module';
import { copyFile, mkdir, readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createViteConfig } from '@open-slide/core/vite';

const coreRequire = createRequire(import.meta.resolve('@open-slide/core/vite'));
const { build } = await import(pathToFileURL(coreRequire.resolve('vite')).href);

const config = await createViteConfig({ userCwd: process.cwd(), mode: 'build' });
config.base = '/AI-workshop-slides/';

await build(config);
await copyFile('dist/index.html', 'dist/404.html');

for (const entry of await readdir('slides', { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  const slideEntry = join('slides', entry.name, 'index.tsx');
  if (!(await stat(slideEntry).catch(() => null))?.isFile()) continue;
  const routeDir = join('dist', 's', entry.name);
  await mkdir(routeDir, { recursive: true });
  await copyFile('dist/index.html', join(routeDir, 'index.html'));
}
