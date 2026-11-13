// Convierte public/icons/*.svg (exportados de Figma, página "1.3 Iconos") al registro de íconos.
// El nombre del archivo es el nombre del ícono. Se conserva el viewBox original.
import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, resolve, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dir = resolve(root, 'public/icons');
const entries = {};
if (existsSync(dir)) {
  for (const file of readdirSync(dir).filter(f => f.endsWith('.svg'))) {
    const svg = readFileSync(resolve(dir, file), 'utf8');
    const viewBox = (svg.match(/viewBox="([^"]+)"/) || [, '0 0 24 24'])[1];
    const inner = svg.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '')
      // Se conservan none, degradados (url(...)) y colores con variable (var(...)); el resto pasa a currentColor.
      .replace(/(fill|stroke)="(?!none|url\(|var\()[^"]*"/g, '$1="currentColor"');
    const name = basename(file, '.svg').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    entries[name] = `<!--viewBox:${viewBox}-->${inner.trim()}`;
  }
}
const out = resolve(root, 'src/lib/icon/icons.generated.ts');
writeFileSync(out, '// Generado por scripts/build-icons.mjs a partir de public/icons/*.svg — no editar a mano.\n'
  + `export const generatedIcons: Record<string, string> = ${JSON.stringify(entries, null, 2)};\n`);
console.log(`${Object.keys(entries).length} íconos importados en ${out}`);
