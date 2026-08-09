import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { PNG } from 'pngjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SRC_CSS = join(__dirname, '..', 'src', 'styles', 'bat.css');
const OUT_PNG = join(__dirname, '..', 'public', 'bat-sprite.png');
const PIXEL_SCALE = 4; // matches the original `.bat { transform: scale(4) ... }`

const css = readFileSync(SRC_CSS, 'utf8');

// Extract only the unprefixed `@keyframes bat { ... }` block (identical to the
// -webkit- one, just without vendor duplication).
const keyframesMatch = css.match(/@keyframes bat \{([\s\S]*)\}\s*$/);
if (!keyframesMatch) throw new Error('Could not find @keyframes bat block');
const body = keyframesMatch[1];

// Each stop looks like: `  14.3% {\n    box-shadow: 33px 6px #202020, ...;\n  }`
const stopRegex = /([\d.]+)%\s*\{\s*box-shadow:\s*([^;]+);\s*\}/g;
const frames = [];
let match;
while ((match = stopRegex.exec(body))) {
  const percent = parseFloat(match[1]);
  const shadows = match[2].split(',').map((s) => s.trim());
  const pixels = shadows.map((shadow) => {
    const m = shadow.match(/(-?\d+)px\s+(-?\d+)px\s+(#[0-9a-fA-F]{3,6})/);
    if (!m) throw new Error(`Could not parse shadow entry: ${JSON.stringify(shadow)}`);
    const [, x, y, color] = m;
    return { x: parseInt(x, 10), y: parseInt(y, 10), color };
  });
  frames.push({ percent, pixels });
}
frames.sort((a, b) => a.percent - b.percent);

if (frames.length === 0) throw new Error('No keyframe stops parsed from bat.css');

// Bounding box shared by every frame so the sprite cells are all the same size.
let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
for (const frame of frames) {
  for (const { x, y } of frame.pixels) {
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
  }
}
const cellW = (maxX - minX + 1) * PIXEL_SCALE;
const cellH = (maxY - minY + 1) * PIXEL_SCALE;

const png = new PNG({ width: cellW * frames.length, height: cellH });
png.data.fill(0); // transparent background outside drawn pixels

function hexToRgb(hex) {
  let h = hex.slice(1);
  if (h.length === 3) {
    h = h.split('').map((c) => c + c).join('');
  }
  const n = parseInt(h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

frames.forEach((frame, frameIndex) => {
  const offsetX = frameIndex * cellW;
  for (const { x, y, color } of frame.pixels) {
    const [r, g, b] = hexToRgb(color);
    const px0 = offsetX + (x - minX) * PIXEL_SCALE;
    const py0 = (y - minY) * PIXEL_SCALE;
    for (let dy = 0; dy < PIXEL_SCALE; dy++) {
      for (let dx = 0; dx < PIXEL_SCALE; dx++) {
        const idx = ((py0 + dy) * png.width + (px0 + dx)) * 4;
        png.data[idx] = r;
        png.data[idx + 1] = g;
        png.data[idx + 2] = b;
        png.data[idx + 3] = 255;
      }
    }
  }
});

writeFileSync(OUT_PNG, PNG.sync.write(png));
console.log(`Wrote ${OUT_PNG}`);
console.log(`Frames: ${frames.length}, cell: ${cellW}x${cellH}, sheet: ${png.width}x${png.height}`);
console.log(`Bounding box (raw units): x[${minX},${maxX}] y[${minY},${maxY}]`);
