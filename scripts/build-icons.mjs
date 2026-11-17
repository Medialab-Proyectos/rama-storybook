// Convierte los SVG de public/icons/ (exportados de Figma, página "1.3 Iconos") al registro de íconos.
//
// - public/icons/*.svg (planos, "core"): el nombre del archivo es el nombre del ícono. Van a
//   src/lib/icon/icons.generated.ts y se cargan de forma síncrona (los usan los componentes).
// - public/icons/rama/<categoria>/<nombre>.svg (set completo de Figma, ~2200): el nombre en el
//   registro es la ruta en kebab-case sin el prefijo "rama/" (p. ej. rama/arrows/arrow-left.svg →
//   "arrows-arrow-left"). Se generan en trozos por categoría, src/lib/icon/rama/<categoria>.generated.ts,
//   que <rama-icon> importa bajo demanda (import() dinámico) para no inflar el bundle.
//   El índice (solo nombres + loaders) va en src/lib/icon/icons-rama.generated.ts.
// Se conserva el viewBox original; fill/stroke pasan a currentColor salvo none, url(...) y var(...).
import { readdirSync, readFileSync, writeFileSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, resolve, basename, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dir = resolve(root, 'public/icons');
const libDir = resolve(root, 'src/lib/icon');
const chunkDir = resolve(libDir, 'rama');

const kebab = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
function toEntry(file) {
  const svg = readFileSync(file, 'utf8');
  const viewBox = (svg.match(/viewBox="([^"]+)"/) || [, '0 0 24 24'])[1];
  const inner = svg.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '')
    // Se conservan none, degradados (url(...)) y colores con variable (var(...)); el resto pasa a currentColor.
    .replace(/(fill|stroke)="(?!none|url\(|var\()[^"]*"/g, '$1="currentColor"');
  return `<!--viewBox:${viewBox}-->${inner.trim()}`;
}
function walk(d, out = []) {
  for (const e of readdirSync(d, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    const p = resolve(d, e.name);
    if (e.isDirectory()) walk(p, out); else if (e.name.endsWith('.svg')) out.push(p);
  }
  return out;
}

// 1) Core: SVG planos (nombres sin cambios).
const core = {};
const nested = {}; // categoria -> { nombre: svg }
if (existsSync(dir)) {
  for (const file of walk(dir)) {
    const rel = relative(dir, file).split(sep);
    if (rel.length === 1) { core[kebab(basename(file, '.svg'))] = toEntry(file); continue; }
    // 2) Anidados: nombre = ruta en kebab-case, sin el prefijo de set "rama/".
    const parts = rel[0] === 'rama' ? rel.slice(1) : rel;
    const cat = kebab(parts.length > 1 ? parts[0] : 'misc');
    const name = kebab(parts.join('-').replace(/\.svg$/, ''));
    if (core[name]) { console.warn(`! ${rel.join('/')}: "${name}" choca con un ícono core; se omite.`); continue; }
    (nested[cat] ||= {})[name] = toEntry(file);
  }
}

const header = '// Generado por scripts/build-icons.mjs — no editar a mano.\n';
writeFileSync(resolve(libDir, 'icons.generated.ts'), header.replace('— no', 'a partir de public/icons/*.svg — no')
  + `export const generatedIcons: Record<string, string> = ${JSON.stringify(core, null, 2)};\n`);

// Trozos por categoría + índice.
if (existsSync(chunkDir)) for (const f of readdirSync(chunkDir)) if (f.endsWith('.generated.ts')) rmSync(resolve(chunkDir, f));
mkdirSync(chunkDir, { recursive: true });
const cats = Object.keys(nested).sort();
let total = 0;
for (const cat of cats) {
  const entries = Object.fromEntries(Object.entries(nested[cat]).sort(([a], [b]) => a.localeCompare(b)));
  total += Object.keys(entries).length;
  writeFileSync(resolve(chunkDir, `${cat}.generated.ts`), header.replace('— no', `a partir de public/icons/rama/${cat}/ — no`)
    + `export const icons: Record<string, string> = ${JSON.stringify(entries)};\n`);
}
const names = Object.fromEntries(cats.map(c => [c, Object.keys(nested[c]).sort()]));
writeFileSync(resolve(libDir, 'icons-rama.generated.ts'), header.replace('— no', 'a partir de public/icons/rama/ — no')
  + '// Índice del set completo de Figma: nombres por categoría y loaders perezosos (un chunk por categoría).\n'
  + `export const ramaIconNames: Record<string, readonly string[]> = ${JSON.stringify(names)};\n`
  + 'export const ramaIconChunks: Record<string, () => Promise<{ icons: Record<string, string> }>> = {\n'
  + cats.map(c => `  ${JSON.stringify(c)}: () => import('./rama/${c}.generated'),`).join('\n') + '\n};\n');

console.log(`${Object.keys(core).length} íconos core en icons.generated.ts; ${total} íconos del set Figma en ${cats.length} chunks (src/lib/icon/rama/).`);
