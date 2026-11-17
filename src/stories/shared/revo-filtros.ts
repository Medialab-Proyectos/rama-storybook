// Barra de filtros de "Mis responsabilidades" (wireframe REVO: pbAdvField / pbAdvPill / pbAdvToggleBtn / pbFoot),
// armada SOLO con componentes existentes de Rama. No es un componente de librería: es una composición que
// usan las plantillas "Barra de filtros" y "Bandeja". Cada vista define sus campos (mismos del wireframe).
import { computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RamaAutocomplete } from '../../lib/autocomplete/autocomplete.component';
import { RamaButton } from '../../lib/button/button.component';
import { RamaDatepicker } from '../../lib/calendar/datepicker.component';
import type { DropdownOption } from '../../lib/dropdown-list/dropdown-list.component';
import { RamaForm, RamaFormSection } from '../../lib/form/form.component';
import { RamaInput } from '../../lib/input/input.component';
import { RamaSearchInput, type SearchTreeNode } from '../../lib/search-input/search-input.component';
import { RamaSearchTable } from '../../lib/search-table/search-table.component';
import { RamaTag } from '../../lib/tag/tag.component';

export const FILTER_IMPORTS = [FormsModule, RamaForm, RamaFormSection, RamaInput, RamaAutocomplete, RamaDatepicker, RamaSearchInput,
  RamaSearchTable, RamaButton, RamaTag];

/** input = rama-input · select = rama-autocomplete (sin valor = "Todos") · date = rama-datepicker · tree = rama-search-input (árbol). */
export type FiltroKind = 'input' | 'select' | 'date' | 'tree';
export interface FiltroDef {
  key: string;
  label: string;
  kind: FiltroKind;
  placeholder?: string;
  options?: DropdownOption[];
  /** Va dentro de "Más filtros". */
  more?: boolean;
}

const opts = (xs: string[]): DropdownOption[] => xs.map(x => ({ value: x, label: x }));

// ── Datos reales del wireframe (listas de opciones) ──
export const TURNOS = opts(['Turno A8 06-14', 'Turno B8 14-22', 'Turno C8 22-06']);
export const PUESTOS = opts(['Operador-Seccion Crudos EC2', 'Operador de planta de patio-Seccion Crudos EC2', 'Operador-Estacion Castilla 2',
  'Auxiliar de operaciones-Estacion Castilla 2', 'Supervisor-Estacion Castilla 2', 'Técnico de tablero-Estacion Castilla 2', 'Operador-VTI - U840']);
/** Árbol de áreas (Castilla-Apiay → Dpto Castilla → Estacion Castilla 2 → Seccion Crudos EC2). */
export const AREAS: SearchTreeNode[] = [
  { value: 'castilla-apiay', label: 'Castilla-Apiay', children: [
    { value: 'dpto-castilla', label: 'Departamento de Produccion Castilla', children: [
      { value: 'ec2', label: 'Estacion Castilla 2', children: [{ value: 'crudos-ec2', label: 'Seccion Crudos EC2' }] },
      { value: 'ec3', label: 'Estacion Castilla 3' },
      { value: 'santos', label: 'Estacion 1 Santos' },
    ] },
  ] },
  { value: 'moriche', label: 'Campo Moriche-Abarco' },
  { value: 'vti-u840', label: 'VTI - U840' },
];
export const TIPO_FUGA = opts(['Humedecimiento', 'Goteo', 'Derrame', 'Rocío/Aspersión', 'Emisión visible', 'Otro']);
export const SUSTANCIA = opts(['Gas', 'Crudo', 'Agua de producción', 'Condensado', 'Químico', 'Otro']);
export const POSICION = opts(['En la entrada', 'Parte superior', 'Parte media', 'Parte inferior', 'Costado derecho', 'Costado izquierdo', 'Otro']);
export const FUENTE_RIESGO = opts(['Sello mecánico de bomba', 'Empaque de válvula', 'Conexión bridada', 'Brida', 'Válvula de drenaje',
  'Válvula de alivio / venteo', 'Línea de proceso', 'Tubería o accesorio', 'Instrumentación / toma de muestra', 'Otro']);

// ── Campos por vista (copiados de renderEntregaTurnoList, renderEntregaTurnoRevisarList, renderIncidentesDocList,
//    renderContencionList y renderDirectricesList) ──
const puesto: FiltroDef = { key: 'puesto', label: 'Puesto de trabajo', kind: 'select', placeholder: 'Todos los puestos', options: PUESTOS };
const turno: FiltroDef = { key: 'turno', label: 'Turno', kind: 'select', placeholder: 'Todos', options: TURNOS };
const area: FiltroDef = { key: 'area', label: 'Área organizativa', kind: 'tree', placeholder: 'Todas las áreas', more: true };
const fecha: FiltroDef = { key: 'fecha', label: 'Fecha', kind: 'date' };

export const FILTROS_ENTREGA_DOCUMENTAR: FiltroDef[] = [puesto, fecha, turno, area,
  { key: 'estado', label: 'Estado', kind: 'select', placeholder: 'Todos', more: true,
    options: opts(['Por documentar', 'En documentación', 'Para aceptación', 'Cerrado']) }];

export const FILTROS_ENTREGA_REVISAR: FiltroDef[] = [puesto, turno, area,
  { key: 'estado', label: 'Estado', kind: 'select', placeholder: 'Todos', more: true, options: opts(['Para aceptación', 'Cerrado']) }];

export const FILTROS_NCR: FiltroDef[] = [puesto, fecha, { ...turno, placeholder: 'Todos los turnos' }, area,
  { key: 'tipo', label: 'Tipo', kind: 'select', placeholder: 'Todos', more: true, options: opts(['NCR', 'INC']) }];

export const FILTROS_CONTENCION: FiltroDef[] = [
  { key: 'nombre', label: 'Nombre', kind: 'input', placeholder: 'Buscar por nombre...' },
  { ...area, more: false },
  { key: 'tipoFuga', label: 'Tipo de fuga', kind: 'select', placeholder: 'Todos', options: TIPO_FUGA },
  { key: 'sustancia', label: 'Sustancia peligrosa', kind: 'select', placeholder: 'Todos', options: SUSTANCIA },
  { key: 'equipoTag', label: 'Equipo / Tag', kind: 'input', placeholder: 'Ej. TANQ_CONT_RESD', more: true },
  { key: 'posicion', label: 'Posición / Ubicación', kind: 'select', placeholder: 'Todos', options: POSICION, more: true },
  { key: 'localizacion', label: 'Localización del escape', kind: 'input', placeholder: 'Buscar por localización...', more: true },
  { key: 'fuenteRiesgo', label: 'Fuente del riesgo', kind: 'select', placeholder: 'Todos', options: FUENTE_RIESGO, more: true },
  { key: 'estado', label: 'Estado', kind: 'select', placeholder: 'Todos', options: opts(['Abierta', 'En gestión', 'Cerrada']), more: true },
  { ...fecha, more: true },
];

export const FILTROS_DIRECTRICES: FiltroDef[] = [
  { key: 'puesto', label: 'Mi puesto de trabajo', kind: 'select', placeholder: 'Todos mis puestos',
    options: opts(['Operador-Seccion Crudos EC2', 'Operador de planta de patio-Seccion Crudos EC2']) },
  { key: 'fecha', label: 'Fecha', kind: 'select', placeholder: 'Todas', options: opts(['Hoy', 'Esta semana', 'Este mes']) },
];

const fmtDate = (d: Date) => `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
const findTree = (nodes: SearchTreeNode[], v: string): string | undefined => {
  for (const n of nodes) {
    if (n.value === v) return n.label;
    const r = n.children && findTree(n.children, v);
    if (r) return r;
  }
  return undefined;
};

export type FilterValues = Record<string, string | Date | null | undefined>;

/**
 * Estado de una barra de filtros: `draft` (lo que está escrito en los campos, enlazado con ngModel)
 * y `applied` (lo aplicado con "Buscar"). Las etiquetas de filtros activos salen de lo aplicado.
 * `q` es el buscador de la versión angosta.
 */
export function createFilterState(defs: FiltroDef[], initial: FilterValues = {}) {
  const draft: FilterValues = { q: '', ...initial };
  const applied = signal<FilterValues>({ ...draft });
  const more = signal(defs.some(d => d.more && initial[d.key]));
  /** Versión angosta: la barra completa se despliega con "Filtros (n)". */
  const open = signal(false);
  const valueLabel = (d: FiltroDef, v: string | Date) =>
    v instanceof Date ? fmtDate(v) : d.kind === 'tree' ? findTree(AREAS, v) ?? v : d.options?.find(o => o.value === v)?.label ?? v;
  const chips = computed(() => {
    const a = applied();
    const out: { key: string; label: string }[] = [];
    if (a['q']) out.push({ key: 'q', label: `Búsqueda: ${a['q']}` });
    for (const d of defs) {
      const v = a[d.key];
      if (v) out.push({ key: d.key, label: `${d.label}: ${valueLabel(d, v)}` });
    }
    return out;
  });
  return {
    defs, draft, applied, more, open, chips,
    count: computed(() => chips().length),
    toggleMore: () => more.update(v => !v),
    toggleOpen: () => open.update(v => !v),
    buscar: () => { applied.set({ ...draft }); open.set(false); },
    limpiar: () => { for (const k of Object.keys(draft)) draft[k] = k === 'q' ? '' : null; applied.set({ ...draft }); },
    quitar: (key: string) => { draft[key] = key === 'q' ? '' : null; applied.update(a => ({ ...a, [key]: key === 'q' ? '' : null })); },
  };
}
export type FilterState = ReturnType<typeof createFilterState>;

const field = (s: string, d: FiltroDef, i: number) => {
  const m = `[(ngModel)]="${s}.draft['${d.key}']"`;
  switch (d.kind) {
    case 'input': return `<rama-input label="${d.label}" placeholder="${d.placeholder ?? ''}" ${m} />`;
    case 'date': return `<rama-datepicker class="fb-date" label="${d.label}" helpText="" [(value)]="${s}.draft['${d.key}']" />`;
    case 'tree': return `<rama-search-input label="${d.label}" placeholder="${d.placeholder}" panelTitle="${d.label}" searchPlaceholder="Buscar área"
        [tree]="areas" [multiple]="false" [initiallyExpanded]="['castilla-apiay', 'dpto-castilla']" ${m} />`;
    default: return `<rama-autocomplete label="${d.label}" placeholder="${d.placeholder}" [options]="${s}.defs[${i}].options" ${m} />`;
  }
};

/**
 * Plantilla de la barra. `s` es el nombre de la prop con el estado (createFilterState).
 * - Ancho ≥ 560px: filtros visibles con etiqueta + "Más filtros" + Limpiar/Buscar + etiquetas activas.
 * - Contenedor < 560px (p. ej. sobre la lista de una bandeja): buscador + botón "Filtros (n)" que despliega la barra.
 */
export function filterBarTemplate(s: string, state: FilterState, opts2: { label: string; searchPlaceholder?: string }) {
  const all = state.defs.map((d, i) => ({ d, i }));
  const visibles = all.filter(x => !x.d.more);
  const extra = all.filter(x => x.d.more);
  const cols = (n: number) => (n === 4 ? 2 : Math.min(3, Math.max(1, n))) as 1 | 2 | 3;
  const id = `fb-${s}`;
  return `
  <div class="fb" role="search" aria-label="${opts2.label}">
    <div class="fb-in">
      <div class="fb-compact">
        <rama-search-table [shadow]="false" placeholder="${opts2.searchPlaceholder ?? 'Buscar'}" ariaLabel="Buscar en ${opts2.label}"
          [(value)]="${s}.draft['q']" (keydown.enter)="${s}.buscar()" />
        <rama-button variant="outlined" leadIcon="sort" (click)="${s}.toggleOpen()">Filtros{{ ${s}.count() ? ' (' + ${s}.count() + ')' : '' }}</rama-button>
      </div>
      <div class="fb-full" id="${id}" [class.open]="${s}.open()">
        <rama-form>
          <rama-form-section [columns]="${cols(visibles.length)}">
            ${visibles.map(x => field(s, x.d, x.i)).join('\n')}
          </rama-form-section>
          ${extra.length ? `
          <div class="fb-more">
            <rama-button variant="ghost" size="small" [trailIcon]="${s}.more() ? 'chevron-up' : 'chevron-down'" (click)="${s}.toggleMore()">Más filtros</rama-button>
          </div>
          @if (${s}.more()) {
            <div class="fb-extra">
              <rama-form-section [columns]="${cols(extra.length)}">
                ${extra.map(x => field(s, x.d, x.i)).join('\n')}
              </rama-form-section>
            </div>
          }` : ''}
          <div class="fb-foot">
            <span class="fb-hint">Todos los campos son opcionales — deja todo vacío para ver el listado completo.</span>
            <div class="fb-actions">
              <rama-button variant="outlined" (click)="${s}.limpiar()">Limpiar</rama-button>
              <rama-button (click)="${s}.buscar()">Buscar</rama-button>
            </div>
          </div>
        </rama-form>
      </div>
      @if (${s}.chips().length) {
        <ul class="fb-chips" aria-label="Filtros activos">
          @for (c of ${s}.chips(); track c.key) {
            <li><rama-tag theme="primary" [closable]="true" [closeLabel]="'Quitar filtro ' + c.label" (closed)="${s}.quitar(c.key)">{{ c.label }}</rama-tag></li>
          }
        </ul>
      }
    </div>
  </div>`;
}

/** Estilos de maquetación de la barra (solo tokens --rama-*). La consulta de contenedor la hace .fb sobre .fb-in. */
export const FILTER_BAR_STYLES = `
  .fb { container-type: inline-size; container-name: fb; min-width: 0; }
  .fb-in { display: flex; flex-direction: column; gap: var(--rama-space-12); font-family: var(--rama-font); }
  .fb-compact { display: none; align-items: center; gap: var(--rama-space-8); }
  .fb-compact rama-search-table { flex: 1 1 auto; width: auto; min-width: 0; }
  .fb-full rama-search-input, .fb-full rama-autocomplete, .fb-full rama-input, .fb-full .fb-date { width: 100%; min-width: 0; }
  .fb-more { display: flex; margin-top: calc(-1 * var(--rama-space-8)); }
  /* "Más filtros" del wireframe: separador punteado sobre los campos extra. */
  .fb-extra { padding-top: var(--rama-space-16); border-top: var(--rama-border-width-thin) dashed var(--rama-border-inset); }
  .fb-foot { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: var(--rama-space-12); }
  .fb-hint { font-size: 12px; line-height: 16px; color: var(--rama-text-muted); }
  .fb-actions { display: flex; gap: var(--rama-space-8); margin-left: auto; }
  .fb-chips { display: flex; flex-wrap: wrap; gap: var(--rama-space-8); margin: 0; padding: 0; list-style: none; }
  @container fb (max-width: 559px) {
    .fb-compact { display: flex; }
    .fb-full:not(.open) { display: none; }
    .fb-full.open { padding: var(--rama-space-16); border: var(--rama-border-width-thin) solid var(--rama-border-default);
      border-radius: var(--rama-radius-small); background: var(--rama-bg-default-white); }
    .fb-hint { display: none; }
  }
`;
