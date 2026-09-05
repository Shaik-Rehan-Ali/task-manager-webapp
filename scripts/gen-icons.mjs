// Renders PWA icons (PNG) from public/icon.svg using sharp.
import { mkdir } from 'node:fs/promises';
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const outDir = path.join(root, 'public', 'icons');
await mkdir(outDir, { recursive: true });

const svg = path.join(root, 'public', 'icon.svg');

const sizes = [
  { file: 'pwa-192.png', size: 192 },
  { file: 'pwa-512.png', size: 512 },
  { file: 'apple-touch-icon.png', size: 180 },
  { file: 'favicon-32.png', size: 32 },
];

for (const { file, size } of sizes) {
  await sharp(svg).resize(size, size).png().toFile(path.join(outDir, file));
  console.log(`Wrote public/icons/${file} (${size}x${size})`);
}