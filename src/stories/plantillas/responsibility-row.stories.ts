import { computed, signal } from '@angular/core';
import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';
import { RamaBadge, type BadgeType } from '../../lib/badge/badge.component';
import { RamaButton } from '../../lib/button/button.component';
import { RamaIcon } from '../../lib/icon/icon.component';
import { RamaPanelField } from '../../lib/side-panel/panel-field.component';
import { RamaPanelSection } from '../../lib/side-panel/panel-section.component';
import { RamaSidePanel } from '../../lib/side-panel/side-panel.component';

/**
 * Plantilla "Mis responsabilidades": filas del dashboard REVO armadas con componentes existentes de Rama:
 * rama-icon (ícono de la fila y chevron), rama-badge (estado), rama-button (acción rápida "Continuar ronda"),
 * "Ver directriz" (abre la directriz en rama-side-panel docked de 720px, donde está "Marcar como leída") y, para "Directrices por leer", expansión en línea con rama-panel-section (acordeón por
 * directriz) + rama-panel-field (Mi puesto de trabajo, Directriz por leer, Directriz dada por, Fecha).
 * Filas, textos y estados copiados del wireframe (role.misResponsabilidades.resumen de Supervisor y Operador
 * y renderDirectricesList).
 *
 * Fila = botón nativo que abre (aria-current="true" cuando su panel está abierto) + acción rápida hermana (no abre).
 * Rama no tiene "fila de lista": estados completados con tokens (hover bg-inset, seleccionada primary-50 + barra
 * primaria, foco --rama-focus-ring). Directrices: el botón de la fila lleva aria-expanded/aria-controls.
 */
const meta: Meta = {
  title: 'Plantillas/Mis responsabilidades',
  decorators: [moduleMetadata({ imports: [RamaIcon, RamaBadge, RamaButton, RamaPanelSection, RamaPanelField, RamaSidePanel] })],
  parameters: { layout: 'padded' },
};
export default meta;
type Story = StoryObj;

const STYLES = `
  .wrap { width: 720px; max-width: 100%; font-family: var(--rama-font); container-type: inline-size; container-name: mr; }
  .card { border: var(--rama-border-width-thin) solid var(--rama-border-default); border-radius: var(--rama-radius-small); background: var(--rama-bg-default-white); }
  .card-h { display: flex; flex-wrap: wrap; align-items: baseline; justify-content: space-between; gap: var(--rama-space-8);
    padding: var(--rama-space-16) var(--rama-space-16) var(--rama-space-8); }
  .card-h h3 { margin: 0; font-size: 16px; line-height: 24px; font-weight: var(--rama-weight-bold); color: var(--rama-text-default-black); }
  .card-h span { font-size: 12px; line-height: 16px; color: var(--rama-text-muted); }
  .rows { margin: 0; padding: 0; list-style: none; }
  .rr { position: relative; border-top: var(--rama-border-width-thin) solid var(--rama-border-default); }
  .rr:first-child { border-top: 0; }
  .rr-line { position: relative; display: flex; align-items: center; gap: var(--rama-space-12); padding: var(--rama-space-12) var(--rama-space-16); }
  /* Patrón "fila clicable": el botón que abre se estira sobre toda la fila (::after); la acción rápida queda por encima. */
  .rr-open { flex: 1 1 0; min-width: 0; display: flex; align-items: center; gap: var(--rama-space-12); padding: 0;
    border: 0; background: transparent; font: inherit; text-align: left; color: inherit; cursor: pointer; outline: none; }
  .rr-open::after { content: ''; position: absolute; inset: 0; }
  .rr-quick { position: relative; z-index: 1; flex: none; }
  .rr-line > rama-badge, .rr-chev { flex: none; }
  .rr-line:hover, .rr.is-hover .rr-line { background: var(--rama-bg-inset); }
  .rr.sel .rr-line { background: var(--rama-primary-50); }
  .rr.sel .rr-line::before { content: ''; position: absolute; inset: 0 auto 0 0; width: var(--rama-space-4); background: var(--rama-border-primary); }
  .rr-line:has(.rr-open:focus-visible), .rr.is-focus .rr-line { box-shadow: inset 0 0 0 var(--rama-border-width-thin) var(--rama-border-primary), var(--rama-focus-ring); z-index: 1; border-radius: var(--rama-radius-xs); }
  .rr-ic { flex: none; display: inline-flex; padding: var(--rama-space-8); border-radius: var(--rama-radius-small); background: var(--rama-primary-50); color: var(--rama-text-primary); }
  .rr-ic.error { background: var(--rama-okr-pink); color: var(--rama-pink-700); }
  .rr-txt { flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
  .rr-t { font-size: 14px; line-height: 20px; font-weight: var(--rama-weight-semibold); color: var(--rama-text-default-black); }
  .rr-m { font-size: 12px; line-height: 16px; color: var(--rama-text-muted); }
  .rr-chev { flex: none; color: var(--rama-text-subtle); transition: transform .2s; }
  .rr-chev.right { transform: rotate(-90deg); }
  .rr-chev.open { transform: rotate(180deg); }
  @media (prefers-reduced-motion: reduce) { .rr-chev { transition: none; } }
  .rr-exp { display: flex; flex-direction: column; gap: var(--rama-space-12); padding: 0 var(--rama-space-16) var(--rama-space-16) calc(var(--rama-space-16) + 40px + var(--rama-space-12)); }
  .dir-txt { margin: 0; font-size: 14px; line-height: 20px; color: var(--rama-text-default-black); }
  .grid2 { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--rama-space-10) var(--rama-space-16); }
  .dir-foot { display: flex; justify-content: flex-end; }
  .dir-row { display: flex; align-items: center; gap: var(--rama-space-12); padding: var(--rama-space-8) 0; border-top: var(--rama-border-width-thin) solid var(--rama-border-default); }
  .dir-row:first-child { border-top: 0; }
  .dir-body { display: flex; flex-direction: column; gap: var(--rama-space-16); }
  .states { display: flex; flex-direction: column; gap: var(--rama-space-16); }
  .states > div > p { margin: 0 0 var(--rama-space-4); font: var(--rama-weight-semibold) 12px/16px var(--rama-font); color: var(--rama-text-muted); }
  .status { margin: var(--rama-space-12) 0 0; font-size: 12px; line-height: 16px; color: var(--rama-text-muted); }
  @container mr (max-width: 520px) {
    /* Angosto: la acción rápida baja a su propia línea debajo del texto. */
    .rr-line { flex-wrap: wrap; }
    .rr-quick { order: 5; flex-basis: 100%; margin-left: calc(40px + var(--rama-space-12)); }
    .rr-exp { padding-left: var(--rama-space-16); }
    .grid2 { grid-template-columns: minmax(0, 1fr); }
  }
`;

interface Row {
  key: string; t: string; s?: string; badge: string; cls: BadgeType; icon?: string;
  /** Acción rápida en la fila (no abre el panel). */
  quick?: string;
  /** Se expande en la fila en lugar de abrir el panel (Directrices por leer). */
  expandable?: boolean;
}
interface Directriz { id: string; titulo: string; texto: string; puesto: string; puestoCoord: string; autor: string; fecha: string; leida: boolean }

// Wireframe · Operador (resumen + "Mis responsabilidades hoy").
const OPERADOR: Row[] = [
  { key: 'rondasFinalizar', t: 'Rondas por finalizar', s: '4 rondas', badge: 'En curso', cls: 'info', quick: 'Continuar ronda' },
  { key: 'rondasRealizar', t: 'Rondas por realizar', s: '4 rondas', badge: 'Pendiente', cls: 'warning' },
  { key: 'entregaTurno', t: 'Entrega de turno por documentar', s: '4 pendientes', badge: 'Pendiente', cls: 'warning' },
  { key: 'incidentesDoc', t: 'Incidentes y NCR por documentar', s: '4 incidentes', badge: 'Pendiente', cls: 'warning' },
  { key: 'directrices', t: 'Directrices por leer', s: '2 directrices', badge: 'Pendiente', cls: 'warning', expandable: true },
];
// Wireframe · Supervisor.
const SUPERVISOR: Row[] = [
  { key: 'entregaTurnoRevisar', t: 'Entrega de turno por revisar', badge: 'Pendiente', cls: 'warning' },
  { key: 'entregaTurno', t: 'Entrega de turno por documentar', badge: 'Pendiente', cls: 'warning' },
  { key: 'directrices', t: 'Directrices por leer', badge: 'Pendiente', cls: 'warning', expandable: true },
  { key: 'registroContencion', t: 'Registro de Contención Primaria', badge: '2 activas', cls: 'error', icon: 'danger' },
];
// DIRECTRICES_DOC_ROWS cerradas del wireframe (puesto del operador / del supervisor).
const DIR_OPERADOR: Directriz[] = [
  { id: 'd6', titulo: 'Checklist de arranque Bomba sumergible BES-14', texto: 'Verificar curva de carga y nivel de vibración antes de reiniciar la bomba sumergible BES-14 tras el mantenimiento del turno anterior.',
    puesto: 'Operador-Seccion Crudos EC2', puestoCoord: 'Coordinador-Coordinación Producción Castilla', autor: 'Coordinador-Coordinación Producción Castilla', fecha: '23/Oct/2026 05:48:00', leida: false },
  { id: 'd11', titulo: 'Drenaje de fondos de tanques antes del despacho', texto: 'Drenar el agua libre de los tanques de la sección y registrar el volumen drenado antes de autorizar el despacho.',
    puesto: 'Operador de planta de patio-Seccion Crudos EC2', puestoCoord: 'Coordinador-Coordinación Producción Castilla', autor: 'Coordinador-Coordinación Producción Castilla', fecha: '24/Oct/2026 05:58:00', leida: false },
];
const DIR_SUPERVISOR: Directriz[] = [
  { id: 'd9', titulo: 'Nuevo protocolo de bloqueo y etiquetado (LOTO)', texto: 'Antes de intervenir equipos en la estación, confirmar el bloqueo y etiquetado con el supervisor entrante y registrar el cierre en la entrega de turno.',
    puesto: 'Supervisor-Estacion Castilla 2', puestoCoord: 'Coordinador-Coordinación Producción Castilla', autor: 'Coordinador-Coordinación Producción Castilla', fecha: '24/Oct/2026 05:52:00', leida: false },
  { id: 'd10', titulo: 'Revisión obligatoria de parámetros antes del cambio de turno', texto: 'Verificar presión y nivel de la sección de aguas antes de recibir el turno y dejar constancia en la entrega.',
    puesto: 'Técnico de tablero-Estacion Castilla 2', puestoCoord: 'Coordinador-Coordinación Producción Castilla', autor: 'Coordinador-Coordinación de Campo e Inyección Castilla', fecha: '24/Oct/2026 05:55:00', leida: false },
];

/** Una fila. `extra` son clases fijas de documentación (is-hover / is-focus). */
const ROW = (extra = '') => `
  <li class="rr ${extra}" [class.sel]="sel() === r.key" [class.has-quick]="!!r.quick">
    <div class="rr-line">
      <button type="button" class="rr-open" [id]="'rr-' + r.key" [attr.aria-describedby]="'rr-st-' + r.key"
        [attr.aria-current]="sel() === r.key ? 'true' : null"
        [attr.aria-expanded]="r.expandable ? expanded() === r.key : null" [attr.aria-controls]="r.expandable ? 'rr-exp-' + r.key : null"
        (click)="abrir(r)">
        <span class="rr-ic" [class.error]="r.cls === 'error'"><rama-icon [name]="r.icon || 'info-circle-stroke'" [size]="20" /></span>
        <span class="rr-txt">
          <span class="rr-t">{{ r.t }}</span>
          @if (meta(r); as m) { <span class="rr-m">{{ m }}</span> }
        </span>
      </button>
      @if (r.quick) {
        <rama-button class="rr-quick" variant="outlined" size="xs" (click)="rapida(r)">{{ r.quick }}</rama-button>
      }
      <rama-badge [id]="'rr-st-' + r.key" [type]="estado(r).cls">{{ estado(r).badge }}</rama-badge>
      <rama-icon class="rr-chev" [class.right]="!r.expandable" [class.open]="r.expandable && expanded() === r.key" name="chevron-down" [size]="24" />
    </div>
    @if (r.expandable && expanded() === r.key) {
      <div class="rr-exp" [id]="'rr-exp-' + r.key" role="region" [attr.aria-labelledby]="'rr-' + r.key">
        @for (d of directrices(); track d.id) {
          <div class="dir-row">
            <span class="rr-txt"><span class="rr-t">{{ d.titulo }}</span><span class="rr-m">{{ d.leida ? 'Leída' : 'No leída' }} · {{ d.autor }}</span></span>
            <rama-button variant="outlined" size="xs" (click)="ver(d.id)">Ver directriz</rama-button>
          </div>
        }
      </div>
    }
  </li>`;

function state(rows: Row[], dirs: Directriz[], opts: { sel?: string; expanded?: string } = {}) {
  const sel = signal<string | null>(opts.sel ?? null);
  const expanded = signal<string | null>(opts.expanded ?? null);
  const directrices = signal(dirs.map(d => ({ ...d })));
  const status = signal('');
  const verId = signal<string | null>(null);
  const dirIdx = computed(() => directrices().findIndex(d => d.id === verId()));
  const dirActual = computed(() => directrices()[dirIdx()] ?? null);
  const leidas = computed(() => directrices().filter(d => d.leida).length);
  /** Directrices por leer: el badge pasa a "Completado" (success) cuando todas están leídas, como en el wireframe. */
  const estado = (r: Row) => r.expandable
    ? (leidas() === directrices().length ? { badge: 'Completado', cls: 'success' as BadgeType } : { badge: 'Pendiente', cls: 'warning' as BadgeType })
    : { badge: r.badge, cls: r.cls };
  const meta = (r: Row) => r.expandable ? `${leidas()} de ${directrices().length} directrices leídas` : r.s ?? '';
  return {
    rows, sel, expanded, directrices, status, estado, meta, verId, dirIdx, dirActual,
    ver: (id: string) => { verId.set(id); sel.set('directrices'); },
    cerrarDir: () => { verId.set(null); sel.set(null); },
    mover: (d: number) => { const ds = directrices(); const i = dirIdx() + d; if (ds[i]) verId.set(ds[i].id); },
    abrir: (r: Row) => {
      if (r.expandable) { expanded.update(k => (k === r.key ? null : r.key)); return; }
      sel.set(r.key);
      status.set(`Panel abierto: ${r.t}`);
    },
    rapida: (r: Row) => { sel.set(r.key); status.set(`${r.quick}: abre el panel ya ampliado (${r.t}).`); },
    leer: (id: string) => directrices.update(ds => ds.map(d => (d.id === id ? { ...d, leida: true } : d))),
  };
}

const LIST = (title: string, sub: string) => `
  <div class="wrap">
    <div class="card">
      <div class="card-h"><h3>${title}</h3><span>${sub}</span></div>
      <ul class="rows">
        @for (r of rows; track r.key) { ${ROW()} }
      </ul>
    </div>
    <p class="status" role="status">{{ status() }}</p>
    <rama-side-panel mode="docked" panelWidth="m" [open]="!!dirActual()" (closed)="cerrarDir()" [title]="dirActual()?.titulo ?? ''"
      backLabel="Directrices por leer" (back)="cerrarDir()" [showPager]="true" [hasPrev]="dirIdx() > 0" [hasNext]="dirIdx() < directrices().length - 1"
      [pagerText]="(dirIdx() + 1) + ' de ' + directrices().length" (prev)="mover(-1)" (next)="mover(1)">
      @if (dirActual(); as d) {
        <div class="dir-body">
          <p class="dir-txt">{{ d.texto }}</p>
          <div class="grid2">
            <rama-panel-field label="Mi puesto de trabajo">{{ d.puesto }}</rama-panel-field>
            <rama-panel-field label="Directriz por leer">{{ d.puestoCoord }}</rama-panel-field>
            <rama-panel-field label="Directriz dada por">{{ d.autor }}</rama-panel-field>
            <rama-panel-field label="Fecha">{{ d.fecha }}</rama-panel-field>
          </div>
        </div>
        <ng-container ngProjectAs="[panel-footer]">
          @if (!d.leida) { <rama-button size="large" leadIcon="check" (click)="leer(d.id)">Marcar como leída</rama-button> }
        </ng-container>
      }
    </rama-side-panel>
  </div>`;

export const Operador: Story = {
  name: 'Mis responsabilidades · Operador',
  render: () => ({
    props: state(OPERADOR, DIR_OPERADOR, { expanded: 'directrices' }),
    styles: [STYLES],
    template: LIST('Mis responsabilidades hoy', 'Operador-Seccion Crudos EC2 · Turno A8 06-14'),
  }),
};

export const Supervisor: Story = {
  name: 'Mis responsabilidades · Supervisor',
  render: () => ({
    props: state(SUPERVISOR, DIR_SUPERVISOR, { sel: 'entregaTurnoRevisar' }),
    styles: [STYLES],
    template: LIST('Mis responsabilidades', 'Supervisor-Estacion Castilla 2 · Turno A8 06-14'),
  }),
};

/** Estados fijos de la fila (documentación): default, hover, foco, seleccionada (panel abierto), con acción rápida y expandida. */
export const Estados: Story = {
  name: 'Estados de la fila',
  render: () => {
    const one = (row: Row, o: { sel?: string; expanded?: string } = {}) => state([row], DIR_OPERADOR, o);
    const entrega = OPERADOR[2];
    return {
      props: {
        a: one(entrega), b: one(entrega), c: one(entrega), d: one(entrega, { sel: entrega.key }),
        e: one(OPERADOR[0]), f: one(OPERADOR[4], { expanded: 'directrices' }),
      },
      styles: [STYLES],
      template: `
        <div class="wrap states">
          ${[['a', 'Default', ''], ['b', 'Hover', 'is-hover'], ['c', 'Foco (teclado)', 'is-focus'], ['d', 'Seleccionada (su panel está abierto)', ''],
            ['e', 'Con acción rápida', ''], ['f', 'Expandida (Directrices por leer)', '']].map(([k, label, cls]) => `
            <div><p>${label}</p>
              <div class="card"><ul class="rows">
                @for (r of ${k}.rows; track r.key) { ${ROW(cls)
                  .replace(/sel\(\)/g, `${k}.sel()`).replace(/expanded\(\)/g, `${k}.expanded()`).replace(/directrices\(\)/g, `${k}.directrices()`)
                  .replace(/\(click\)="abrir\(r\)"/, `(click)="${k}.abrir(r)"`).replace(/rapida\(r\)/, `${k}.rapida(r)`).replace(/leer\(d\.id\)/, `${k}.leer(d.id)`)
                  .replace(/estado\(r\)/g, `${k}.estado(r)`).replace(/meta\(r\)/g, `${k}.meta(r)`)
                  .replace(/'rr-st-' \+ r\.key/g, `'rr-st-${k}-' + r.key`).replace(/\[id\]="'rr-' \+ r\.key"/, `[id]="'rr-${k}-' + r.key"`)} }
              </ul></div>
            </div>`).join('')}
        </div>`,
    };
  },
};

export const Angosta: Story = {
  name: 'Mis responsabilidades · angosta (390px)',
  render: () => ({
    props: state(OPERADOR, DIR_OPERADOR, { expanded: 'directrices' }),
    styles: [STYLES + ' .wrap { width: 390px; }'],
    template: LIST('Mis responsabilidades hoy', 'Operador-Seccion Crudos EC2'),
  }),
};
