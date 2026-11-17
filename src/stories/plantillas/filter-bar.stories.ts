import { computed } from '@angular/core';
import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';
import type { BadgeType } from '../../lib/badge/badge.component';
import { RamaButton } from '../../lib/button/button.component';
import { RamaTable, type TableColumn, type TableRow } from '../../lib/table/table.component';
import {
  AREAS, FILTER_BAR_STYLES, FILTER_IMPORTS, FILTROS_CONTENCION, FILTROS_ENTREGA_DOCUMENTAR, FILTROS_ENTREGA_REVISAR,
  createFilterState, filterBarTemplate, type FilterState, type FiltroDef,
} from '../shared/revo-filtros';

/**
 * Plantilla "Barra de filtros" de Mis responsabilidades (wireframe REVO: pbAdvField / pbAdvPill / pbAdvToggleBtn / pbFoot).
 * Composición de componentes existentes: rama-form + rama-form-section (grilla), rama-autocomplete (selects),
 * rama-search-input (Área organizativa, árbol), rama-datepicker, rama-input, rama-button (Más filtros, Limpiar, Buscar,
 * Filtros (n)), rama-search-table (buscador de la versión angosta) y rama-tag closable (filtros activos), sobre la
 * rama-table del listado. Campos y columnas copiados de las vistas del wireframe.
 */
const meta: Meta = {
  title: 'Plantillas/Barra de filtros',
  decorators: [moduleMetadata({ imports: [...FILTER_IMPORTS, RamaTable, RamaButton] })],
  parameters: { layout: 'padded' },
};
export default meta;
type Story = StoryObj;

const ESTADO_ENTREGA: Record<string, BadgeType> = { 'Por documentar': 'warning', 'En documentación': 'info', 'Para aceptación': 'primary', Cerrado: 'success' };
const ESTADO_FUGA: Record<string, BadgeType> = { Abierta: 'error', 'En gestión': 'warning', Cerrada: 'success' };

// Columnas de renderEntregaTurnoList / renderEntregaTurnoRevisarList.
const COLS_ENTREGA: TableColumn[] = [
  { key: 'area', header: 'Área organizativa' }, { key: 'puesto', header: 'Puesto de trabajo', minWidth: 220 },
  { key: 'turno', header: 'Turno' }, { key: 'dia', header: 'Día' },
  { key: 'estado', header: 'Estado', type: 'tag', tagTypes: ESTADO_ENTREGA, width: 170 },
];
const ROWS_ENTREGA: TableRow[] = [
  { id: 1, area: 'Estacion Castilla 2', puesto: 'Operador-Estacion Castilla 2', turno: 'Turno A8 06-14', dia: '16/Jun/2026 05:00:00', estado: 'Por documentar' },
  { id: 2, area: 'Estacion Castilla 2', puesto: 'Supervisor-Estacion Castilla 2', turno: 'Turno A8 06-14', dia: '16/Jun/2026 05:00:00', estado: 'Por documentar' },
  { id: 3, area: 'Seccion Crudos EC2', puesto: 'Operador-Seccion Crudos EC2', turno: 'Turno A8 06-14', dia: '16/Jun/2026 05:00:00', estado: 'Por documentar' },
  { id: 4, area: 'Estacion 1 Santos', puesto: 'Supervisor-Estacion 1 Santos', turno: 'Turno A8 06-14', dia: '16/Jun/2026 05:00:00', estado: 'En documentación' },
  { id: 5, area: 'VTI - U840', puesto: 'Operador-VTI - U840', turno: 'Turno C8 22-06', dia: '15/Jun/2026 22:00:00', estado: 'Para aceptación' },
  { id: 6, area: 'Estacion Castilla 2', puesto: 'Auxiliar de operaciones-Estacion Castilla 2', turno: 'Turno C8 22-06', dia: '15/Jun/2026 22:00:00', estado: 'Para aceptación' },
  { id: 7, area: 'Estacion Castilla 2', puesto: 'Operador-Estacion Castilla 2', turno: 'Turno B8 14-22', dia: '15/Jun/2026 14:00:00', estado: 'Cerrado' },
];

// Columnas de renderContencionList.
const COLS_CONTENCION: TableColumn[] = [
  { key: 'nombre', header: 'Nombre' }, { key: 'area', header: 'Área organizativa' }, { key: 'tipoFuga', header: 'Tipo de fuga' },
  { key: 'sustancia', header: 'Sustancia peligrosa' }, { key: 'equipoTag', header: 'Equipo / Tag' },
  { key: 'estado', header: 'Estado', type: 'tag', tagTypes: ESTADO_FUGA, width: 140 },
];
const ROWS_CONTENCION: TableRow[] = [
  { id: 0, nombre: 'Fuga Gas 1', area: 'Estacion Castilla 2', tipoFuga: 'Humedecimiento', sustancia: 'Gas', equipoTag: 'TANQ_CONT_RESD', posicion: 'Parte superior', localizacion: 'Brida superior del tanque de contención', fuenteRiesgo: 'Sello mecánico de bomba', estado: 'Abierta' },
  { id: 1, nombre: 'Fuga Líquido 2', area: 'Seccion Crudos EC2', tipoFuga: 'Goteo', sustancia: 'Crudo', equipoTag: 'BOM-ART1', posicion: 'En la entrada', localizacion: 'Empaque de la válvula de succión', fuenteRiesgo: 'Empaque de válvula', estado: 'En gestión' },
  { id: 2, nombre: 'Fuga Gas 3', area: 'Campo Moriche-Abarco', tipoFuga: 'Humedecimiento', sustancia: 'Gas', equipoTag: 'COMP-C05', posicion: 'Costado derecho', localizacion: 'Conexión bridada lateral del compresor', fuenteRiesgo: 'Conexión bridada', estado: 'Cerrada' },
  { id: 3, nombre: 'Fuga Líquido 4', area: 'VTI - U8700', tipoFuga: 'Derrame', sustancia: 'Agua de producción', equipoTag: 'TANQ-74-011', posicion: 'Parte inferior', localizacion: 'Válvula de drenaje de fondo', fuenteRiesgo: 'Válvula de drenaje', estado: 'Cerrada' },
];

/** Filtra las filas con lo aplicado (texto: contiene; listas: igual; área: por nombre). La fecha no se filtra en el ejemplo. */
function filtered(rows: TableRow[], defs: FiltroDef[], st: FilterState, areaLabel: (v: string) => string) {
  return computed(() => {
    const a = st.applied();
    const norm = (x: unknown) => String(x ?? '').toLowerCase();
    return rows.filter(r => {
      if (a['q'] && !Object.values(r).some(v => norm(v).includes(norm(a['q'])))) return false;
      return defs.every(d => {
        const v = a[d.key];
        if (!v || d.kind === 'date' || !(d.key in r)) return true;
        if (d.kind === 'tree') return norm(r[d.key]) === norm(areaLabel(v as string));
        if (d.kind === 'input') return norm(r[d.key]).includes(norm(v));
        return r[d.key] === v;
      });
    });
  });
}
const areaLabel = (v: string) => {
  const walk = (ns: typeof AREAS): string | undefined => {
    for (const n of ns) { if (n.value === v) return n.label; const r = n.children && walk(n.children); if (r) return r; }
    return undefined;
  };
  return walk(AREAS) ?? v;
};

const STYLES = FILTER_BAR_STYLES + `
  .page { display: flex; flex-direction: column; gap: var(--rama-space-16); max-width: 1200px; font-family: var(--rama-font); }
  .page h1 { margin: 0; font-size: 20px; line-height: 28px; font-weight: var(--rama-weight-bold); color: var(--rama-text-default-black); }
  .card { padding: var(--rama-space-24); border: var(--rama-border-width-thin) solid var(--rama-border-default); border-radius: var(--rama-radius-small);
    background: var(--rama-bg-default-white); }
  .toolbar { display: flex; justify-content: flex-end; }
  .frames { display: flex; flex-wrap: wrap; gap: var(--rama-space-24); align-items: flex-start; }
  .frame { display: flex; flex-direction: column; gap: var(--rama-space-8); }
  .frame > p { margin: 0; font-size: 12px; line-height: 16px; color: var(--rama-text-muted); }
  .frame .card { padding: var(--rama-space-16); }
`;

export const EntregaDeTurno: Story = {
  name: 'Entrega de turno por documentar',
  render: () => {
    const fb = createFilterState(FILTROS_ENTREGA_DOCUMENTAR, { turno: 'Turno A8 06-14' });
    return {
      props: { fb, areas: AREAS, cols: COLS_ENTREGA, rows: filtered(ROWS_ENTREGA, FILTROS_ENTREGA_DOCUMENTAR, fb, areaLabel) },
      styles: [STYLES],
      template: `
        <div class="page">
          <h1>Entrega de turno por documentar</h1>
          <div class="card">${filterBarTemplate('fb', fb, { label: 'Entrega de turno por documentar', searchPlaceholder: 'Buscar puesto' })}</div>
          <rama-table [columns]="cols" [rows]="rows()" [actions]="['edit']" [actionLabels]="{ edit: 'Documentar' }" [pageSize]="5"
            caption="Entregas de turno por documentar" emptyText="No hay entregas de turno con esos filtros." />
        </div>`,
    };
  },
};

export const RegistroDeContencion: Story = {
  name: 'Registro de contención primaria',
  render: () => {
    // Con filtros aplicados al abrir (se recuerdan al reabrir): "Más filtros" queda desplegado porque Estado está en él.
    const fb = createFilterState(FILTROS_CONTENCION, { sustancia: 'Gas', estado: 'Abierta' });
    return {
      props: { fb, areas: AREAS, cols: COLS_CONTENCION, rows: filtered(ROWS_CONTENCION, FILTROS_CONTENCION, fb, areaLabel) },
      styles: [STYLES],
      template: `
        <div class="page">
          <h1>Registro de Contención Primaria</h1>
          <div class="card">${filterBarTemplate('fb', fb, { label: 'Registro de contención primaria', searchPlaceholder: 'Buscar fuga' })}</div>
          <div class="toolbar"><rama-button variant="outlined" size="small" leadIcon="add">Registrar nueva fuga</rama-button></div>
          <rama-table [columns]="cols" [rows]="rows()" [actions]="['edit']" [actionLabels]="{ edit: 'Documentar' }"
            caption="Registro de contención primaria" emptyText="No hay fugas con esos filtros." />
        </div>`,
    };
  },
};

export const Angosta: Story = {
  name: 'Versión angosta (bandeja / móvil)',
  render: () => {
    const a = createFilterState(FILTROS_ENTREGA_REVISAR, { turno: 'Turno C8 22-06' });
    const b = createFilterState(FILTROS_ENTREGA_REVISAR, { turno: 'Turno C8 22-06' });
    b.open.set(true);
    return {
      props: { a, b, areas: AREAS },
      styles: [STYLES],
      template: `
        <div class="frames">
          <div class="frame" style="width:390px">
            <p>390px · contraída: buscador + "Filtros (n)"</p>
            <div class="card">${filterBarTemplate('a', a, { label: 'Entrega de turno por revisar', searchPlaceholder: 'Buscar puesto' })}</div>
          </div>
          <div class="frame" style="width:390px">
            <p>390px · desplegada con "Filtros (n)"</p>
            <div class="card">${filterBarTemplate('b', b, { label: 'Entrega de turno por revisar (desplegada)', searchPlaceholder: 'Buscar puesto' })}</div>
          </div>
        </div>`,
    };
  },
};
