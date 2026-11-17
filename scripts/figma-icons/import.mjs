// Importa el set completo de íconos de Figma ("Rama (3)", página "1.3 Iconos") a public/icons/rama/<categoria>/.
//
// Cómo re-ejecutar la importación:
//  1. Exporta como SVG cada frame de la página (Figma MCP `download_assets` con defaultFormat "svg", o
//     Export → SVG con "Include id attribute") y guárdalos en una carpeta FUERA del repo con estos nombres:
//       essential.svg (frame "Essential Icons" 58916:17277), type1.svg ("Icon Type 1" 58918:134276),
//       type2.svg ("Icon Type 2" 58922:67), extra.svg ("Extra Icons" 58922:10773).
//  2. Si cambió la cantidad o posición de los íconos, regenera positions.json (cajas de cada COMPONENT,
//     codificadas en rejilla; ver el script de lectura en la cabecera de positions.json → "how").
//  3. node scripts/figma-icons/import.mjs <carpeta-con-los-svg>   y luego   npm run icons
//
// Los exports de frames grandes vienen escalados (máx. 4096 px); el script recorta cada componente por
// su id + caja y re-normaliza las coordenadas a 0 0 w h (precisión ≈0.01–0.06 px). Nombres: kebab-case,
// Icon Type 2 con sufijo -bold, duplicados de nombre con distinto dibujo → -v2, -v3…
import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync, readdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const srcDir = process.argv[2];
if (!srcDir) throw new Error("Uso: node scripts/figma-icons/import.mjs <carpeta-con-los-svg-exportados>");
const projectRoot = resolve(here, "../..");
const outRoot = resolve(projectRoot, "public/icons/rama");
const positions = JSON.parse(readFileSync(resolve(here, 'positions.json'), 'utf8')).frames;

// ---------- XML mínimo ----------
function decode(s) { return s.replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n)).replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16))).replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&'); }
function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;'); }
function parse(xml) {
  const root = { tag: '#root', attrs: {}, children: [] };
  const stack = [root];
  const re = /<!--[\s\S]*?-->|<\?[\s\S]*?\?>|<\/([^\s>]+)\s*>|<([^\s/>]+)((?:\s+[^\s=]+\s*=\s*"[^"]*")*)\s*(\/?)>|([^<]+)/g;
  let m;
  while ((m = re.exec(xml))) {
    if (m[1]) { stack.pop(); continue; }
    if (m[2]) {
      const attrs = {};
      const ar = /([^\s=]+)\s*=\s*"([^"]*)"/g; let a;
      while ((a = ar.exec(m[3]))) attrs[a[1]] = decode(a[2]);
      const el = { tag: m[2], attrs, children: [], parent: stack[stack.length - 1] };
      stack[stack.length - 1].children.push(el);
      if (!m[4]) stack.push(el);
      continue;
    }
    if (m[5] && m[5].trim()) stack[stack.length - 1].children.push({ tag: '#text', text: m[5] });
  }
  return root;
}

// ---------- utilidades numéricas ----------
const fmt = v => { let r = Math.round(v * 1000) / 1000; if (Object.is(r, -0)) r = 0; return String(r); };
const NUM = /-?(?:\d*\.\d+|\d+\.?)(?:[eE][-+]?\d+)?/g;
function parseTransform(t) {
  let M = [1, 0, 0, 1, 0, 0];
  const mul = (A, B) => [A[0] * B[0] + A[2] * B[1], A[1] * B[0] + A[3] * B[1], A[0] * B[2] + A[2] * B[3], A[1] * B[2] + A[3] * B[3], A[0] * B[4] + A[2] * B[5] + A[4], A[1] * B[4] + A[3] * B[5] + A[5]];
  const re = /(matrix|translate|scale|rotate|skewX|skewY)\s*\(([^)]*)\)/g; let m;
  while ((m = re.exec(t))) {
    const n = (m[2].match(NUM) || []).map(Number); let T;
    switch (m[1]) {
      case 'matrix': T = n; break;
      case 'translate': T = [1, 0, 0, 1, n[0], n[1] || 0]; break;
      case 'scale': T = [n[0], 0, 0, n[1] ?? n[0], 0, 0]; break;
      case 'rotate': { const r = n[0] * Math.PI / 180, c = Math.cos(r), s = Math.sin(r); T = [c, s, -s, c, 0, 0]; if (n.length > 2) T = mul(mul([1, 0, 0, 1, n[1], n[2]], T), [1, 0, 0, 1, -n[1], -n[2]]); break; }
      case 'skewX': T = [1, 0, Math.tan(n[0] * Math.PI / 180), 1, 0, 0]; break;
      case 'skewY': T = [1, Math.tan(n[0] * Math.PI / 180), 0, 1, 0, 0]; break;
    }
    M = mul(M, T);
  }
  return { M, mul };
}

// ---------- normalización ----------
function makeNorm(s, bx, by) {
  const fx = x => x / s - bx, fy = y => y / s - by, k = v => v / s;
  const path = d => {
    const toks = d.match(/[MmLlHhVvCcSsQqTtAaZz]|-?(?:\d*\.\d+|\d+\.?)(?:[eE][-+]?\d+)?/g) || [];
    const out = []; let i = 0, cmd = '';
    const cnt = { M: 2, L: 2, H: 1, V: 1, C: 6, S: 4, Q: 4, T: 2, A: 7, Z: 0 };
    while (i < toks.length) {
      if (/[a-zA-Z]/.test(toks[i])) { cmd = toks[i++]; out.push(cmd); if (cmd === 'Z' || cmd === 'z') continue; }
      const U = cmd.toUpperCase(), rel = cmd !== U, n = cnt[U];
      const p = toks.slice(i, i + n).map(Number); i += n;
      let q;
      if (U === 'H') q = [rel ? k(p[0]) : fx(p[0])];
      else if (U === 'V') q = [rel ? k(p[0]) : fy(p[0])];
      else if (U === 'A') q = [k(p[0]), k(p[1]), p[2], p[3], p[4], rel ? k(p[5]) : fx(p[5]), rel ? k(p[6]) : fy(p[6])];
      else q = p.map((v, j) => rel ? k(v) : (j % 2 ? fy(v) : fx(v)));
      out.push(q.map((v, j) => (U === 'A' && j >= 2 && j <= 4) ? String(v) : fmt(v)).join(' '));
      if (U === 'M') cmd = rel ? 'l' : 'L';
    }
    return out.join(' ').replace(/ ?([MmLlHhVvCcSsQqTtAaZz]) ?/g, '$1').replace(/ -/g, '-');
  };
  return { fx, fy, k, path, matrix: [1 / s, 0, 0, 1 / s, -bx, -by] };
}
const XA = new Set(['x', 'x1', 'x2', 'cx', 'fx']), YA = new Set(['y', 'y1', 'y2', 'cy', 'fy']);
const KA = new Set(['width', 'height', 'r', 'rx', 'ry', 'stroke-width', 'stroke-dashoffset', 'stdDeviation', 'dx', 'dy']);
const UNIT_ATTR = { linearGradient: 'gradientUnits', radialGradient: 'gradientUnits', mask: 'maskUnits', filter: 'filterUnits', pattern: 'patternUnits' };

function normEl(el, N, raw) {
  if (el.tag === '#text') return { ...el };
  const attrs = { ...el.attrs };
  for (const a of Object.keys(attrs)) if (a.startsWith('data-figma')) delete attrs[a];
  let childRaw = raw;
  if (!raw) {
    const tAttr = /Gradient$/.test(el.tag) ? 'gradientTransform' : 'transform';
    // Coordenadas en unidades de caja de objeto: no se tocan.
    const unitAttr = UNIT_ATTR[el.tag];
    const bboxUnits = unitAttr && (attrs[unitAttr] || 'objectBoundingBox') !== 'userSpaceOnUse';
    if (attrs[tAttr]) {
      const { M, mul } = parseTransform(attrs[tAttr]);
      attrs[tAttr] = 'matrix(' + mul(N.matrix, M).map(fmt).join(' ') + ')';
      childRaw = true; // el contenido queda en el espacio local del transform
      for (const a of ['stroke-width']) if (attrs[a]) attrs[a] = attrs[a]; // ya escalado por la matriz
    } else if (!bboxUnits) {
      for (const a of Object.keys(attrs)) {
        const v = attrs[a];
        if (a === 'd') attrs[a] = N.path(v);
        else if (a === 'points') attrs[a] = (v.match(NUM) || []).map((n, j) => fmt(j % 2 ? N.fy(+n) : N.fx(+n))).join(' ');
        else if (XA.has(a) && !/%/.test(v)) attrs[a] = fmt(N.fx(+v));
        else if (YA.has(a) && !/%/.test(v)) attrs[a] = fmt(N.fy(+v));
        // Peculiaridad del export escalado de Figma: algunos stroke-width salen sin escalar
        // (p. ej. 1.5 en vez de 1.5·s). Si al normalizar queda > 2.5 se conserva el valor original.
        else if (a === 'stroke-width' && N.k(+v) > 2.5 && +v <= 2.5) attrs[a] = fmt(+v);
        else if ((KA.has(a) || a === 'stroke-dasharray') && !/%/.test(v)) attrs[a] =(v.match(NUM) || []).map(n => fmt(N.k(+n))).join(' ');
      }
    }
  } else {
    // dentro de un transform: solo redondeo de path
  }
  if (el.tag === 'clipPath' || el.tag === 'mask') {
    // el contenido de clipPath/mask usa userSpaceOnUse por defecto (maskContentUnits)
  }
  return { tag: el.tag, attrs, children: el.children.map(c => normEl(c, N, childRaw)) };
}

function refsOf(el, set = new Set()) {
  if (el.attrs) for (const v of Object.values(el.attrs)) for (const m of v.matchAll(/url\(#([^)]+)\)/g)) set.add(m[1]);
  if (el.attrs && el.attrs['xlink:href']?.startsWith('#')) set.add(el.attrs['xlink:href'].slice(1));
  if (el.attrs && el.attrs.href?.startsWith('#')) set.add(el.attrs.href.slice(1));
  for (const c of el.children || []) refsOf(c, set);
  return set;
}
function serialize(el) {
  if (el.tag === '#text') return esc(el.text.trim());
  const a = Object.entries(el.attrs).map(([k, v]) => ` ${k}="${esc(v)}"`).join('');
  const inner = el.children.map(serialize).join('');
  return inner ? `<${el.tag}${a}>${inner}</${el.tag}>` : `<${el.tag}${a}/>`;
}
// Quita ids no referenciados, desenvuelve <g> sin atributos y elimina grupos vacíos.
function clean(el, keepIds) {
  if (el.tag === '#text') return [el];
  if (el.attrs.id && !keepIds.has(el.attrs.id)) delete el.attrs.id;
  el.children = el.children.flatMap(c => clean(c, keepIds));
  if (el.tag === 'g' && !el.children.length) return [];
  if (el.tag === 'g' && !Object.keys(el.attrs).length) return el.children;
  if (el.attrs.opacity === '0' && el.tag !== 'stop') return [];
  return [el];
}
function firstPoint(el) {
  if (el.tag === '#text') return null;
  if (el.attrs.transform) return 'skip';
  const a = el.attrs;
  if (a.d) { const n = a.d.match(NUM); if (n) return [+n[0], +n[1]]; }
  if (el.tag === 'rect' && a.x != null) return [+a.x, +(a.y || 0)];
  if ((el.tag === 'circle' || el.tag === 'ellipse') && a.cx != null) return [+a.cx, +a.cy];
  if (el.tag === 'line') return [+a.x1, +a.y1];
  for (const c of el.children) { if (c.tag === 'mask' || c.tag === 'clipPath' || c.tag === 'defs') continue; const p = firstPoint(c); if (p) return p; }
  return null;
}

// ---------- nombres ----------
const hash = s => { let v = 0; for (const ch of s) v = (v * 31 + ch.charCodeAt(0)) % 1296; return v.toString(36).padStart(2, '0'); };
const kebab = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const CAT_FIX = { essetional: 'essential', desing: 'design', programing: 'programming' };
function target(frame, name) {
  const parts = name.split('/').map(kebab).filter(Boolean);
  if (frame === 'Essential Icons') return { cat: 'essential-icons', file: parts.join('-') };
  if (frame === 'Extra Icons') return { cat: 'extra', file: parts.join('-') };
  let cat = parts.length > 1 ? parts[0] : 'misc';
  cat = CAT_FIX[cat] || cat;
  const base = (parts.length > 1 ? parts.slice(1) : parts).join('-');
  return { cat, file: frame === 'Icon Type 2' ? `${base}-bold` : base };
}

// ---------- proceso ----------
// Limpia solo los archivos .svg (las carpetas pueden estar retenidas por el watcher de Storybook).
(function wipe(d) { if (!existsSync(d)) return; for (const e of readdirSync(d, { withFileTypes: true })) { const p = resolve(d, e.name); if (e.isDirectory()) wipe(p); else if (e.name.endsWith('.svg')) rmSync(p, { force: true }); } })(outRoot);
const report = { written: 0, duplicatesSkipped: [], renamed: [], skipped: [], missing: [], perFrame: {} };
const used = new Map(); // ruta -> svg
const batchesDir = resolve(srcDir, 'batches'); mkdirSync(batchesDir, { recursive: true });

for (const [frame, P] of Object.entries(positions)) {
  const xml = readFileSync(resolve(srcDir, P.file), 'utf8');
  const root = parse(xml);
  const byId = new Map();
  (function idx(e) { if (e.attrs?.id) byId.set(e.attrs.id, e); for (const c of e.children || []) idx(c); })(root);
  const s = Math.max(P.fw, P.fh) > 4096 ? 4096 / Math.max(P.fw, P.fh) : 1;
  const odd = new Map(P.odd.map(o => [o[0], [o[1], o[2]]]));
  const comps = [];
  for (let i = 0; i < P.n; i++) {
    const c = P.code.slice(i * 6, i * 6 + 6);
    const [w, h] = odd.get(i) || [24, 24];
    comps.push({ i, x: P.X[parseInt(c.slice(0, 2), 36)], y: P.Y[parseInt(c.slice(2, 4), 36)], h2: c.slice(4, 6), w, h });
  }
  const fits = (g, c) => {
    const p = firstPoint(g);
    if (p === 'skip' || p === null) return true;
    const tol = 0.25 * Math.max(c.w, c.h);
    return p[0] / s >= c.x - tol && p[0] / s <= c.x + c.w + tol && p[1] / s >= c.y - tol && p[1] / s <= c.y + c.h + tol;
  };
  const nameOk = (id, c) => [id, id.replace(/_\d+$/, '')].find(n => hash(n) === c.h2);
  let k = 0; const found = [];
  (function walk(e) {
    for (const ch of e.children || []) {
      if (k >= comps.length) return;
      if (ch.tag === 'g' && ch.attrs.id) {
        let hit = -1, nm;
        for (let j = k; j < Math.min(k + 3, comps.length); j++) { nm = nameOk(ch.attrs.id, comps[j]); if (nm && fits(ch, comps[j])) { hit = j; break; } }
        if (hit >= 0) { for (let j = k; j < hit; j++) report.missing.push(`${frame} #${j}`); found.push({ c: comps[hit], g: ch, name: nm }); k = hit + 1; continue; }
      }
      if (ch.tag === 'g' || ch.tag === 'svg') walk(ch);
    }
  })(root);
  for (let j = k; j < comps.length; j++) report.missing.push(`${frame} #${j}`);

  const batch = [];
  for (const { c, g, name } of found) {
    if (c.w > 100) { report.skipped.push(`${frame}: "${name}" (${c.w}x${c.h}, es una tarjeta de documentación, no un ícono)`); continue; }
    const { cat, file } = target(frame, name);
    const regBase = `${cat}-${file}`;
    const N = makeNorm(s, c.x, c.y);
    const body = normEl(g, N, false);
    // defs referenciados (recursivo)
    const defs = []; const seen = new Set();
    const queue = [...refsOf(g)];
    while (queue.length) { const id = queue.shift(); if (seen.has(id)) continue; seen.add(id); const d = byId.get(id); if (!d) continue; if (!refsOf(body).has(id) && !defs.length && false) continue; defs.push(normEl(d, N, false)); for (const r of refsOf(d)) queue.push(r); }
    // ids únicos por ícono
    let svgInner = serialize({ tag: 'g', attrs: {}, children: [...(defs.length ? [{ tag: 'defs', attrs: {}, children: defs }] : []), body] });
    const tmp = parse(svgInner).children[0];
    const keep = new Set([...refsOf(tmp)]);
    const cleaned = clean(tmp, keep);
    let inner = cleaned.map(serialize).join('');
    let n = 0; const map = new Map();
    for (const id of keep) map.set(id, `${regBase}-${n++}`);
    for (const [from, to] of map) inner = inner.split(`id="${esc(from)}"`).join(`id="${to}"`).split(`url(#${from})`).join(`url(#${to})`).split(`href="#${from}"`).join(`href="#${to}"`);
    const W = fmt(c.w), H = fmt(c.h);
    const svg = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" fill="none" xmlns="http://www.w3.org/2000/svg">${inner}</svg>\n`;
    // nombre único / deduplicación
    let rel = `${cat}/${file}.svg`, suffix = 1;
    const norm = x => x.replace(/id="[^"]*"|url\(#[^)]*\)/g, '');
    let dup = false;
    while (used.has(rel)) {
      if (norm(used.get(rel)) === norm(svg)) { dup = true; break; }
      suffix++; rel = `${cat}/${file}-v${suffix}.svg`;
    }
    if (dup) { report.duplicatesSkipped.push(`${frame}: ${name} → ${rel}`); continue; }
    let finalSvg = svg;
    if (suffix > 1) { report.renamed.push(`${frame}: ${name} → ${rel}`); finalSvg = svg.split(`id="${regBase}-`).join(`id="${regBase}-v${suffix}-`).split(`url(#${regBase}-`).join(`url(#${regBase}-v${suffix}-`); }
    used.set(rel, finalSvg);
    mkdirSync(resolve(outRoot, cat), { recursive: true });
    writeFileSync(resolve(outRoot, rel), finalSvg);
    report.written++;
    batch.push({ index: c.i, name, path: frame, rel, w: c.w, h: c.h, svg: finalSvg });
  }
  writeFileSync(resolve(batchesDir, `${kebab(frame)}.json`), JSON.stringify(batch));
  report.perFrame[frame] = { expected: P.n, matched: found.length, written: batch.length, scale: s };
}
writeFileSync(resolve(srcDir, 'report.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify({ ...report, duplicatesSkipped: report.duplicatesSkipped.length, renamed: report.renamed }, null, 2));
