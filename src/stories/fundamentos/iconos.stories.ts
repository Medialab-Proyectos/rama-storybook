import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';
import { RamaIcon } from '../../lib/icon/icon.component';
import { icons } from '../../lib/icon/icons';
import { generatedIcons } from '../../lib/icon/icons.generated';
// Solo el índice de nombres (≈60 KB); los SVG del set completo se cargan por categoría al renderizarse.
import { ramaIconNames } from '../../lib/icon/icons-rama.generated';

const coreNames = Object.keys(icons).sort();
const fromFigma = Object.keys(generatedIcons).length;
const ramaCats = Object.keys(ramaIconNames).sort();
const ramaTotal = ramaCats.reduce((n, c) => n + ramaIconNames[c].length, 0);
const allNames = [...coreNames, ...ramaCats.flatMap(c => ramaIconNames[c])];

const CAT_LABELS: Record<string, string> = {
  'essential-icons': 'Essential Icons (trazo)', extra: 'Extra Icons', essential: 'Essential', arrows: 'Arrows', archive: 'Archive',
  building: 'Building', business: 'Business', call: 'Call', car: 'Car', content: 'Content', delivery: 'Delivery', design: 'Design',
  electronics: 'Electronics', files: 'Files', grids: 'Grids', learning: 'Learning', location: 'Location', media: 'Media',
  messages: 'Messages', money: 'Money', notifications: 'Notifications', paragraph: 'Paragraph', programming: 'Programming',
  search: 'Search', security: 'Security', settings: 'Settings', shop: 'Shop', support: 'Support', time: 'Time', users: 'Users',
  weather: 'Weather',
};
const PAGE = 24;

interface Group { id: string; label: string; names: readonly string[]; shown: readonly string[]; }

// Componente solo de documentación (vive en la story, no en src/lib).
@Component({
  selector: 'sb-icon-gallery',
  imports: [RamaIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="sb-doc">
      <h2>Íconos</h2>
      <p class="sb-lead">
        {{ coreCount }} íconos core ({{ fromFigma }} descargados de Figma + set provisional del wireframe), síncronos, y
        {{ ramaTotal }} íconos del set completo de la página "1.3 Iconos" de Figma, en {{ catCount }} categorías, que se cargan
        bajo demanda por categoría. Uso: <code>&lt;rama-icon name="arrows-arrow-left" [size]="16" /&gt;</code>.
        Los de estilo relleno (Icon Type 2) terminan en <code>-bold</code>. El color hereda de <code>color</code>.
        Haz clic en un ícono para copiar su nombre.
      </p>
      <div class="bar">
        <input class="search" type="search" placeholder="Buscar ícono por nombre (p. ej. arrow, trash, bold)…" aria-label="Buscar ícono"
          [value]="query()" (input)="setQuery($any($event.target).value)" />
        <select class="cat" aria-label="Categoría" [value]="cat()" (change)="cat.set($any($event.target).value)">
          <option value="">Todas las categorías</option>
          <option value="core">Core (componentes)</option>
          @for (c of cats; track c) { <option [value]="c">{{ label(c) }}</option> }
        </select>
        <span class="count" aria-live="polite">{{ matchCount() }} resultado(s)</span>
      </div>
      @if (copied()) { <div class="toast" role="status">Copiado: <code>{{ copied() }}</code></div> }
      @for (g of groups(); track g.id) {
        <section class="group">
          <h3>{{ g.label }} <span class="n">{{ g.names.length }}</span></h3>
          <div class="grid">
            @for (n of g.shown; track n) {
              <button type="button" class="tile" [title]="'Copiar ' + n" (click)="copy(n)">
                <rama-icon [name]="n" [size]="size()" [strokeWidth]="strokeWidth()" />
                <span class="name">{{ n }}</span>
              </button>
            }
          </div>
          @if (g.shown.length < g.names.length) {
            <button type="button" class="more" (click)="more(g.id)">Ver más ({{ g.names.length - g.shown.length }} restantes)</button>
          }
        </section>
      } @empty {
        <p class="sb-lead">Ningún ícono coincide con "{{ query() }}".</p>
      }
    </div>`,
  styles: `
    .bar { display: flex; flex-wrap: wrap; gap: var(--rama-space-8); align-items: center; margin: 0 0 var(--rama-space-16);
      position: sticky; top: 0; z-index: 1; background: var(--rama-bg-default-white); padding: var(--rama-space-8) 0; }
    .search { flex: 1 1 320px; min-width: 0; font: inherit; font-size: 14px; padding: var(--rama-space-8) var(--rama-space-12);
      border: var(--rama-border-width-thin) solid var(--rama-border-default); border-radius: var(--rama-radius-medium);
      color: var(--rama-text-default-black); background: var(--rama-bg-default-white); }
    .cat { font: inherit; font-size: 14px; padding: var(--rama-space-8); border: var(--rama-border-width-thin) solid var(--rama-border-default);
      border-radius: var(--rama-radius-medium); background: var(--rama-bg-default-white); color: var(--rama-text-default-black); }
    .search:focus-visible, .cat:focus-visible, .tile:focus-visible, .more:focus-visible { outline: 2px solid var(--rama-focus-ring); outline-offset: 1px; }
    .count { font-size: 12px; color: var(--rama-text-muted); }
    .toast { position: fixed; right: var(--rama-space-16); bottom: var(--rama-space-16); z-index: 2; font-size: 13px;
      background: var(--rama-bg-inverse); color: var(--rama-text-default-white); padding: var(--rama-space-8) var(--rama-space-12);
      border-radius: var(--rama-radius-medium); box-shadow: var(--rama-shadow-medium); }
    .toast code { background: transparent; border: 0; color: inherit; }
    .group { margin-bottom: var(--rama-space-24); }
    h3 { font-size: 15px; font-weight: var(--rama-weight-semibold); margin: 0 0 var(--rama-space-8); }
    h3 .n { font-size: 12px; font-weight: var(--rama-weight-regular); color: var(--rama-text-muted); margin-left: var(--rama-space-4); }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: var(--rama-space-8); }
    .tile { display: flex; flex-direction: column; align-items: center; gap: var(--rama-space-8); padding: var(--rama-space-12) var(--rama-space-8);
      border: var(--rama-border-width-thin) solid var(--rama-border-inset); border-radius: var(--rama-radius-medium);
      background: var(--rama-bg-default-white); color: var(--rama-text-default-black); cursor: pointer; font: inherit; min-height: 84px; }
    .tile:hover { border-color: var(--rama-border-primary); color: var(--rama-text-primary); background: var(--rama-primary-surface); }
    .name { font-family: ui-monospace, Consolas, monospace; font-size: 11px; line-height: 1.3; word-break: break-all; text-align: center;
      color: var(--rama-text-muted); }
    .more { margin-top: var(--rama-space-8); font: inherit; font-size: 13px; cursor: pointer; padding: var(--rama-space-4) var(--rama-space-12);
      border: var(--rama-border-width-thin) solid var(--rama-border-default); border-radius: var(--rama-radius-medium);
      background: var(--rama-bg-subtle); color: var(--rama-text-default-black); }
  `,
})
class IconGallery {
  readonly size = input(24);
  readonly strokeWidth = input(1.6);
  readonly coreCount = coreNames.length;
  readonly fromFigma = fromFigma;
  readonly ramaTotal = ramaTotal;
  readonly catCount = ramaCats.length;
  readonly cats = ramaCats;
  readonly query = signal('');
  readonly cat = signal('');
  readonly copied = signal('');
  private readonly limits = signal<Record<string, number>>({});
  private copyTimer?: ReturnType<typeof setTimeout>;

  label(c: string) { return CAT_LABELS[c] ?? c; }
  setQuery(q: string) { this.query.set(q); this.limits.set({}); }
  more(id: string) { this.limits.update(l => ({ ...l, [id]: (l[id] ?? PAGE) + PAGE * 3 })); }

  readonly groups = computed<Group[]>(() => {
    const terms = this.query().toLowerCase().trim().split(/\s+/).filter(Boolean);
    const match = (n: string) => terms.every(t => n.includes(t));
    const sel = this.cat();
    const src: [string, string, readonly string[]][] = [
      ['core', 'Core (los que usan los componentes)', coreNames],
      ...ramaCats.map(c => [c, this.label(c), ramaIconNames[c]] as [string, string, readonly string[]]),
    ];
    const limits = this.limits();
    return src
      .filter(([id]) => !sel || id === sel)
      .map(([id, label, names]) => {
        const hits = terms.length ? names.filter(match) : names;
        return { id, label, names: hits, shown: hits.slice(0, limits[id] ?? PAGE) };
      })
      .filter(g => g.names.length);
  });
  readonly matchCount = computed(() => this.groups().reduce((n, g) => n + g.names.length, 0));

  copy(name: string) {
    const done = () => { this.copied.set(name); clearTimeout(this.copyTimer); this.copyTimer = setTimeout(() => this.copied.set(''), 1600); };
    if (navigator.clipboard?.writeText) navigator.clipboard.writeText(name).then(done, done); else done();
  }
}

const meta: Meta<RamaIcon> = {
  title: 'Fundamentos/Íconos',
  component: RamaIcon,
  decorators: [moduleMetadata({ imports: [RamaIcon, IconGallery] })],
  parameters: { layout: 'padded' },
  argTypes: {
    name: { control: 'select', options: allNames },
    size: { control: { type: 'range', min: 12, max: 48, step: 2 } },
    strokeWidth: { control: { type: 'range', min: 1, max: 2.5, step: 0.1 } },
  },
  args: { name: 'search', size: 24, strokeWidth: 1.6 },
};
export default meta;

export const Icono: StoryObj<RamaIcon> = {
  render: (args) => ({ props: args, template: `<rama-icon [name]="name" [size]="size" [strokeWidth]="strokeWidth" style="color:var(--rama-primary-400)" />` }),
};

export const Galeria: StoryObj<RamaIcon> = {
  name: 'Galería',
  render: (args) => ({
    props: args,
    template: `<sb-icon-gallery [size]="size" [strokeWidth]="strokeWidth" />`,
  }),
};
