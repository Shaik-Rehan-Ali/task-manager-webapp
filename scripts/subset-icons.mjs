// Subsets the Material Symbols variable font to only the icon ligatures the app
// uses, producing two tiny woff2 files: outlined (FILL=0) and filled (FILL=1).
// Material Symbols maps each icon name to a glyph via GSUB ligature substitutions,
// so we subset by passing the literal ligature texts to harfbuzz.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import subsetFont from 'subset-font';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const src = path.join(root, 'node_modules/material-symbols/material-symbols-outlined.woff2');
const outDir = path.join(root, 'public', 'fonts');

const LIGATURES = [
  'task_alt', 'edit_note', 'settings', 'analytics',
  'add', 'search', 'close', 'arrow_back', 'clear',
  'calendar_month', 'calendar_today', 'schedule', 'event', 'repeat', 'title', 'description',
  'check_circle', 'pending_actions', 'assignment_turned_in', 'assignment', 'category', 'check',
  'business_center', 'person', 'school', 'fitness_center', 'shopping_cart',
  'edit', 'delete', 'delete_outline', 'push_pin',
  'dark_mode', 'light_mode', 'settings_brightness', 'palette', 'storage',
  'delete_sweep', 'delete_forever', 'content_copy', 'open_in_browser', 'code', 'info',
  'file_download', 'file_upload', 'share', 'content_paste', 'data_object', 'error',
  'trending_up', 'date_range', 'hourglass_empty', 'pie_chart',
];

const fontBuffer = await readFile(src);

async function make(fill, filename) {
  const subset = await subsetFont(fontBuffer, LIGATURES.join(' '), {
    targetFormat: 'woff2',
    variationAxes: { FILL: fill, wght: 400, opsz: 24 },
  });
  await mkdir(outDir, { recursive: true });
  await writeFile(path.join(outDir, filename), subset);
  console.log(`Wrote ${filename} (${(subset.length / 1024).toFixed(1)} KB, FILL=${fill})`);
}

await make(0, 'icons-outlined.woff2');
await make(1, 'icons-filled.woff2');