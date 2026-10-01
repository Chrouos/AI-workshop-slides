import { createRequire } from 'node:module';
import { copyFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { createViteConfig } from '@open-slide/core/vite';

const coreRequire = createRequire(import.meta.resolve('@open-slide/core/vite'));
const { build } = await import(pathToFileURL(coreRequire.resolve('vite')).href);

const config = await createViteConfig({ userCwd: process.cwd(), mode: 'build' });
config.base = '/AI-workshop-slides/';

await build(config);
await copyFile('dist/index.html', 'dist/404.html');
