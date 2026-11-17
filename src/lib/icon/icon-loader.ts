// Carga perezosa del set completo de íconos de Figma (public/icons/rama/**, ~2200 íconos).
// Los íconos "core" (icons.ts) siguen siendo síncronos; el resto se pide por categoría con import()
// dinámico, así que solo se descarga el chunk de la categoría que realmente se usa.
import { signal } from '@angular/core';

type RamaIndex = typeof import('./icons-rama.generated');

const loadedIcons = signal<Readonly<Record<string, string>>>({});
/** Íconos del set completo ya cargados (señal: los componentes se re-renderizan al llegar). */
export const ramaIcons = loadedIcons.asReadonly();

let index: Promise<{ mod: RamaIndex; byName: Map<string, string> }> | undefined;
const chunks = new Map<string, Promise<void>>();

function loadIndex() {
  return (index ??= import('./icons-rama.generated').then(mod => {
    const byName = new Map<string, string>();
    for (const [cat, names] of Object.entries(mod.ramaIconNames)) for (const n of names) byName.set(n, cat);
    return { mod, byName };
  }));
}

/** Carga el chunk que contiene `name`. Resuelve `false` si el ícono no existe en el set. */
export async function loadRamaIcon(name: string): Promise<boolean> {
  if (loadedIcons()[name]) return true;
  const { mod, byName } = await loadIndex();
  const cat = byName.get(name);
  if (!cat) return false;
  let chunk = chunks.get(cat);
  if (!chunk) {
    chunk = mod.ramaIconChunks[cat]().then(m => loadedIcons.update(all => ({ ...all, ...m.icons })));
    chunks.set(cat, chunk);
  }
  await chunk;
  return true;
}

/** Nombres del set completo agrupados por categoría (para galerías o buscadores). */
export async function ramaIconCatalog(): Promise<Record<string, readonly string[]>> {
  return (await loadIndex()).mod.ramaIconNames;
}
