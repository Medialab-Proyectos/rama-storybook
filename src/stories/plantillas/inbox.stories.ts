import { computed, signal, type WritableSignal } from '@angular/core';
import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';
import { RamaAlert } from '../../lib/alert/alert.component';
import { RamaBadge, type BadgeType } from '../../lib/badge/badge.component';
import { RamaCheckbox } from '../../lib/checkbox/checkbox.component';
import { RamaIcon } from '../../lib/icon/icon.component';
import { RamaTextarea } from '../../lib/input/textarea.component';
import { RamaPanelField } from '../../lib/side-panel/panel-field.component';
import { RamaPanelSection } from '../../lib/side-panel/panel-section.component';
import { RamaTable, type TableColumn } from '../../lib/table/table.component';
import { RamaUploaderButton } from '../../lib/uploader/uploader-button.component';
import {
  AREAS, FILTER_BAR_STYLES, FILTER_IMPORTS, FILTROS_ENTREGA_REVISAR, FILTROS_NCR, createFilterState, filterBarTemplate,
} from '../shared/revo-filtros';

/**
 * Plantilla "Bandeja": lista + detalle a la vez (panel L), armada con componentes existentes de Rama:
 * barra de filtros (versión angosta: rama-search-table + "Filtros (n)" + rama-tag), rama-badge, rama-checkbox
 * (selección múltiple y "Seleccionar todo"), rama-panel-section / rama-panel-field (detalle de solo lectura),
 * rama-textarea, rama-autocomplete, rama-datepicker, rama-uploader-button, rama-table (resumen del bloque),
 * rama-alert compacta (confirmación) y rama-button.
 * Campos, columnas y botones copiados del wireframe (renderEntregaTurnoRevisarList + renderEntregaTurnoDoc,
 * renderIncidentesDocList + renderIncidenteDoc / renderIncidenteDocBulk).
 *
 * Teclado: la lista de entregas es un listbox (↑/↓/Inicio/Fin mueven la selección, Enter abre el detalle);
 * la de NCR es una lista con casillas (↑/↓ mueven el foco entre las filas, Espacio en la casilla la marca).
 * Contenedor < 640px: se ve la lista O el detalle, con "← {nombre de la lista}" para volver.
 */
const meta: Meta = {
  title: 'Plantillas/Bandeja',
  decorators: [moduleMetadata({
    imports: [...FILTER_IMPORTS, RamaBadge, RamaCheckbox, RamaIcon, RamaTextarea, RamaPanelSection, RamaPanelField, RamaTable,
      RamaUploaderButton, RamaAlert],
  })],
  parameters: { layout: 'padded' },
};
export default meta;
type Story = StoryObj;

/* ───────────── Maquetación de la bandeja (solo tokens) ───────────── */
const STYLES = FILTER_BAR_STYLES + `
  .frame { width: 960px; max-width: 100%; }
  .frame.m { width: 390px; }
  .bx { container-type: inline-size; container-name: bx; font-family: var(--rama-font); }
  .bx-in { display: grid; grid-template-columns: minmax(0, 2fr) minmax(0, 3fr); min-height: 640px;
    border: var(--rama-border-width-thin) solid var(--rama-border-default); border-radius: var(--rama-radius-small); background: var(--rama-bg-default-white); }
  .bx-list { display: flex; flex-direction: column; gap: var(--rama-space-12); min-width: 0; padding: var(--rama-space-16);
    border-right: var(--rama-border-width-thin) solid var(--rama-border-default); }
  .bx-detail { display: flex; flex-direction: column; min-width: 0; }
  .bx-scroll { flex: 1 1 auto; display: flex; flex-direction: column; gap: var(--rama-space-16); padding: var(--rama-space-24); }
  .bx-foot { display: flex; justify-content: flex-end; flex-wrap: wrap; gap: var(--rama-space-8); padding: var(--rama-space-16) var(--rama-space-24);
    border-top: var(--rama-border-width-thin) solid var(--rama-border-default); }
  .bx-back { display: none; }
  .bx-count { display: flex; align-items: center; justify-content: space-between; gap: var(--rama-space-8); margin: 0;
    font-size: 12px; line-height: 16px; font-weight: var(--rama-weight-semibold); color: var(--rama-text-muted); }
  .bx-all { padding-left: var(--rama-space-12); }
  .bx-h { display: flex; align-items: flex-start; justify-content: space-between; gap: var(--rama-space-12); }
  .bx-h h3 { margin: 0; font-size: 16px; line-height: 24px; font-weight: var(--rama-weight-bold); color: var(--rama-text-default-black); outline: none; }
  .bx-help { margin: 0; font-size: 14px; line-height: 20px; color: var(--rama-text-muted); }
  .grid2 { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--rama-space-10) var(--rama-space-16); }

  /* Ítems de la lista. Rama no tiene "ítem de lista seleccionable": estados completados con tokens
     (hover bg-inset, seleccionado primary-50 + barra primaria, foco --rama-focus-ring). */
  .lst { display: flex; flex-direction: column; margin: 0; padding: 0; list-style: none; border-radius: var(--rama-radius-small); outline: none; }
  .it { position: relative; display: flex; align-items: flex-start; gap: var(--rama-space-8); padding: var(--rama-space-12);
    border-bottom: var(--rama-border-width-thin) solid var(--rama-border-default); cursor: pointer; }
  .it:hover { background: var(--rama-bg-inset); }
  .it.sel { background: var(--rama-primary-50); }
  .it.sel::before { content: ''; position: absolute; inset: 0 auto 0 0; width: var(--rama-space-4); background: var(--rama-border-primary); }
  .lst:focus-visible .it.sel, .it:has(.it-open:focus-visible) { box-shadow: inset 0 0 0 var(--rama-border-width-thin) var(--rama-border-primary), var(--rama-focus-ring); z-index: 1; }
  .it-open { flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; gap: var(--rama-space-4); padding: 0; border: 0; background: transparent;
    font: inherit; text-align: left; color: inherit; cursor: pointer; outline: none; }
  .it-body { flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; gap: var(--rama-space-4); }
  .it-t { font-size: 14px; line-height: 20px; font-weight: var(--rama-weight-semibold); color: var(--rama-text-default-black); overflow-wrap: anywhere; }
  .it-m { font-size: 12px; line-height: 16px; color: var(--rama-text-muted); }
  .it-row { display: flex; align-items: center; gap: var(--rama-space-8); flex-wrap: wrap; }

  /* Estado vacío (no existe en Rama: ícono + título + texto). */
  .empty { flex: 1 1 auto; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: var(--rama-space-8);
    padding: var(--rama-space-48) var(--rama-space-24); text-align: center; color: var(--rama-text-muted); }
  .empty-ic { display: inline-flex; padding: var(--rama-space-16); border-radius: var(--rama-radius-full); background: var(--rama-success-surface); color: var(--rama-text-success); }
  .empty h3 { margin: 0; font-size: 16px; line-height: 24px; font-weight: var(--rama-weight-bold); color: var(--rama-text-default-black); }
  .empty p { margin: 0; font-size: 14px; line-height: 20px; }
  .bx-in.is-empty { grid-template-columns: minmax(0, 1fr); }
  .bx-in.is-empty .bx-list { border-right: 0; }
  .sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }

  @container bx (max-width: 639px) {
    .bx-in { grid-template-columns: minmax(0, 1fr); min-height: 0; }
    .bx-list { border-right: 0; }
    .bx-in.show-detail .bx-list { display: none; }
    .bx-in:not(.show-detail) .bx-detail { display: none; }
    .bx-back { display: flex; padding: var(--rama-space-8) var(--rama-space-16) 0; }
    .bx-scroll { padding: var(--rama-space-16); }
    .bx-foot { padding: var(--rama-space-12) var(--rama-space-16); }
    .bx-foot rama-button { flex: 1 1 auto; }
    .grid2 { grid-template-columns: minmax(0, 1fr); }
  }
`;

/** Teclado de listbox: ↑/↓/Inicio/Fin mueven la selección; Enter abre. */
function listboxKeys<T extends { id: number }>(items: () => T[], sel: WritableSignal<number | null>, prefix: string, abrir: () => void) {
  return (e: KeyboardEvent) => {
    const ids = items().map(i => i.id);
    if (!ids.length) return;
    const cur = ids.indexOf(sel() ?? -1);
    let next = cur;
    if (e.key === 'ArrowDown') next = Math.min(ids.length - 1, cur + 1);
    else if (e.key === 'ArrowUp') next = Math.max(0, cur - 1);
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = ids.length - 1;
    else if (e.key === 'Enter') { e.preventDefault(); abrir(); return; }
    else return;
    e.preventDefault();
    sel.set(ids[next]);
    document.getElementById(`${prefix}-${ids[next]}`)?.scrollIntoView({ block: 'nearest' });
  };
}
const focusLater = (id: string) => setTimeout(() => document.getElementById(id)?.focus(), 0);

/* ───────────── Entrega de turno por revisar ───────────── */
interface Entrega {
  id: number; area: string; puesto: string; turno: string; dia: string; estado: string; responsable: string; creado: string; modificado: string;
  secciones: Record<string, string>;
}
// Secciones del formato HSE-F-467 (ENTREGA_DOC_SECTIONS del wireframe).
const SECCIONES = ['Alineamiento de productos', 'Aspectos de Atención Inmediata', 'Datos de Laboratorio', 'Análisis Operacional',
  'Aspectos HSE y de Seguridad de Procesos - GDT', 'Novedades y gestión operacional', 'Aspectos de Mantenimiento'];
const ENTREGAS: Entrega[] = [
  { id: 1, area: 'VTI - U840', puesto: 'Operador-VTI - U840', turno: 'Turno C8 22-06', dia: '15/Jun/2026 22:00:00', estado: 'Para aceptación', responsable: 'Soporte Revo',
    creado: '15/Jun/2026 22:08:11', modificado: '16/Jun/2026 05:52:40', secciones: {
      'Alineamiento de productos': 'Producción estable durante todo el turno. Sin desviaciones de calidad reportadas.',
      'Aspectos de Atención Inmediata': 'Ninguna. Turno sin novedades HSE.',
      'Datos de Laboratorio': 'Muestra de crudo tomada a las 02:00, resultado dentro de especificación.',
      'Análisis Operacional': 'Condiciones de planta dentro de ventana operativa durante todo el turno. Sin violaciones a la GC ni al VOI.' } },
  { id: 2, area: 'Estacion Castilla 2', puesto: 'Operador-Estacion Castilla 2', turno: 'Turno C8 22-06', dia: '15/Jun/2026 22:00:00', estado: 'Para aceptación', responsable: 'Soporte Revo',
    creado: '15/Jun/2026 22:05:30', modificado: '16/Jun/2026 05:48:12', secciones: {
      'Alineamiento de productos': 'Turno estable, producción dentro de lo programado. Ronda de cierre completada.',
      'Aspectos de Atención Inmediata': 'Ninguna. Sin novedades HSE.',
      'Novedades y gestión operacional': 'Arranque de bomba de respaldo a las 01:40 por mantenimiento del equipo principal; operación normalizada.' } },
  { id: 3, area: 'Estacion Castilla 2', puesto: 'Auxiliar de operaciones-Estacion Castilla 2', turno: 'Turno C8 22-06', dia: '15/Jun/2026 22:00:00', estado: 'Para aceptación', responsable: 'Soporte Revo',
    creado: '15/Jun/2026 22:12:44', modificado: '16/Jun/2026 05:55:03', secciones: {
      'Alineamiento de productos': 'Inventario de químicos verificado. Sin diferencias frente al registro.',
      'Aspectos HSE y de Seguridad de Procesos - GDT': 'Se reportó una condición insegura (derrame menor en cubeto) y se corrigió durante el turno.',
      'Aspectos de Mantenimiento': 'Queda pendiente el cambio de empaque en la válvula de succión del tanque de lavado.' } },
];
const ESTADO_ENTREGA: Record<string, BadgeType> = { 'Para aceptación': 'primary', Cerrado: 'success' };

function entregaStory(initial: Entrega[], mobile = false) {
  const items = signal(initial.map(e => ({ ...e })));
  const sel = signal<number | null>(initial[0]?.id ?? null);
  const showDetail = signal(false);
  const aviso = signal('');
  const comentario: Record<number, string> = {};
  const fb = createFilterState(FILTROS_ENTREGA_REVISAR, { turno: 'Turno C8 22-06' });
  const visibles = computed(() => {
    const a = fb.applied();
    const q = String(a['q'] ?? '').toLowerCase();
    return items().filter(e => (!a['turno'] || e.turno === a['turno']) && (!a['estado'] || e.estado === a['estado'])
      && (!a['puesto'] || e.puesto === a['puesto']) && (!q || `${e.puesto} ${e.area}`.toLowerCase().includes(q)));
  });
  const actual = computed(() => items().find(e => e.id === sel()) ?? null);
  const abrir = () => { showDetail.set(true); focusLater('etr-detail-h'); };
  const elegir = (id: number) => { sel.set(id); abrir(); };
  const volver = () => { showDetail.set(false); focusLater('etr-list'); };
  /** "Marcar como revisado": sale de la bandeja y pasa a la siguiente pendiente (o al estado vacío). */
  const marcarRevisado = () => {
    const lista = visibles();
    const i = lista.findIndex(e => e.id === sel());
    const siguiente = lista[i + 1] ?? lista[i - 1] ?? null;
    aviso.set(`Entrega de turno de ${actual()?.puesto} marcada como revisada.`);
    items.update(xs => xs.filter(e => e.id !== sel()));
    sel.set(siguiente?.id ?? null);
    if (siguiente) focusLater('etr-detail-h'); else focusLater('etr-empty');
  };
  return {
    props: { fb, areas: AREAS, items, visibles, sel, actual, showDetail, aviso, comentario, secciones: SECCIONES, estados: ESTADO_ENTREGA,
      elegir, volver, marcarRevisado, onKey: listboxKeys(visibles, sel, 'etr', abrir) },
    styles: [STYLES],
    template: `
    <div class="frame${mobile ? ' m' : ''}">
      <div class="bx">
        <div class="bx-in" [class.show-detail]="showDetail()" [class.is-empty]="!items().length">
          <section class="bx-list" aria-label="Entregas por revisar">
            ${filterBarTemplate('fb', fb, { label: 'Entrega de turno por revisar', searchPlaceholder: 'Buscar puesto' })}
            @if (aviso()) {
              <rama-alert state="success" variant="compact" (closed)="aviso.set('')">{{ aviso() }}</rama-alert>
            }
            @if (items().length) {
              <p class="bx-count"><span>{{ visibles().length }} por revisar</span></p>
              @if (visibles().length) {
                <div id="etr-list" class="lst" role="listbox" tabindex="0" aria-label="Entregas de turno por revisar"
                  [attr.aria-activedescendant]="sel() != null ? 'etr-' + sel() : null" (keydown)="onKey($event)">
                  @for (e of visibles(); track e.id) {
                    <div class="it" role="option" [id]="'etr-' + e.id" [class.sel]="e.id === sel()" [attr.aria-selected]="e.id === sel()" (click)="elegir(e.id)">
                      <div class="it-body">
                        <span class="it-t">{{ e.puesto }}</span>
                        <span class="it-m">{{ e.area }} · {{ e.turno }} · {{ e.dia }}</span>
                        <span class="it-row"><rama-badge size="small" [type]="estados[e.estado]">{{ e.estado }}</rama-badge></span>
                      </div>
                    </div>
                  }
                </div>
              } @else {
                <p class="bx-help">No hay entregas de turno con esos filtros.</p>
              }
            } @else {
              <div class="empty" id="etr-empty" tabindex="-1">
                <span class="empty-ic"><rama-icon name="checks" [size]="32" /></span>
                <h3>Todo revisado</h3>
                <p>No hay entregas de turno pendientes de revisar.</p>
              </div>
            }
          </section>

          @if (actual(); as e) {
            <section class="bx-detail" aria-labelledby="etr-detail-h">
              <div class="bx-back"><rama-button variant="ghost" size="small" leadIcon="arrow-left" (click)="volver()">Entregas por revisar</rama-button></div>
              <div class="bx-scroll">
                <div class="bx-h">
                  <h3 id="etr-detail-h" tabindex="-1">Entrega de turno por revisar</h3>
                  <rama-badge [type]="estados[e.estado]">{{ e.estado }}</rama-badge>
                </div>
                <rama-panel-section title="Datos de la entrega">
                  <div class="grid2">
                    <rama-panel-field label="Área organizativa">{{ e.area }}</rama-panel-field>
                    <rama-panel-field label="Puesto de trabajo">{{ e.puesto }}</rama-panel-field>
                    <rama-panel-field label="Fecha">{{ e.dia }}</rama-panel-field>
                    <rama-panel-field label="Turno">{{ e.turno }}</rama-panel-field>
                    <rama-panel-field label="Responsable">{{ e.responsable }}</rama-panel-field>
                    <rama-panel-field label="Estado">{{ e.estado }}</rama-panel-field>
                    <rama-panel-field label="Fecha Creado">{{ e.creado }}</rama-panel-field>
                    <rama-panel-field label="Última Modificación">{{ e.modificado }}</rama-panel-field>
                  </div>
                </rama-panel-section>
                <rama-panel-section title="Reporte de la entrega">
                  @for (s of secciones; track s) {
                    <rama-panel-field [label]="s" size="medium">{{ e.secciones[s] || 'Sin registro.' }}</rama-panel-field>
                  }
                </rama-panel-section>
                <rama-textarea label="Comentario de revisión (Opcional)" placeholder="Observaciones de la revisión (opcional)..." [rows]="3"
                  [(ngModel)]="comentario[e.id]" />
              </div>
              <div class="bx-foot">
                <rama-button leadIcon="check" (click)="marcarRevisado()">Marcar como revisado</rama-button>
              </div>
            </section>
          }
        </div>
      </div>
    </div>`,
  };
}

export const EntregaPorRevisar: Story = {
  name: 'Entrega de turno por revisar',
  render: () => entregaStory(ENTREGAS),
};

export const EntregaVacia: Story = {
  name: 'Entrega de turno · estado vacío',
  render: () => entregaStory([]),
};

export const EntregaMovil: Story = {
  name: 'Entrega de turno · angosta (390px)',
  render: () => entregaStory(ENTREGAS, true),
};

/* ───────────── Incidentes y NCR por documentar (selección múltiple) ───────────── */
interface Ncr {
  id: number; tipo: 'NCR' | 'INC'; equipo: string; area: string; variable: string; alias: string; criterio: string; valor: string; ventana: string;
  vc: { gc: (number | string)[]; voie: (number | string)[]; voic: (number | string)[]; limites: (number | string)[] } | null; fecha: string; turno: string;
}
// INCIDENTES_DOC_ROWS del wireframe (todas en estado "Abierta").
const NCRS: Ncr[] = [
  { id: 1, tipo: 'INC', equipo: 'BOM-ART1', area: 'Seccion Crudos EC2', variable: 'Vibración rodamiento', alias: 'VIB_ROD_BOMART1_1205', criterio: 'VOIEA', valor: '7.8 mm/s', ventana: '< 4.5 mm/s', vc: { gc: [2, 4], voie: [3, 4.5], voic: [4, 5.5], limites: ['–', 8] }, fecha: '15/Jun/2026 11:05', turno: 'Turno A8 06-14' },
  { id: 5, tipo: 'INC', equipo: 'Estacion Castilla 2', area: 'Estacion Castilla 2', variable: 'Temperatura horno EC2', alias: 'TEMP_HORNO_EC2_5120', criterio: 'VOIEA', valor: '312°C', ventana: '< 280°C', vc: { gc: [220, 260], voie: [240, 280], voic: [260, 300], limites: ['–', 350] }, fecha: '16/Jun/2026 10:40', turno: 'Turno A8 06-14' },
  { id: 6, tipo: 'NCR', equipo: 'TANQ_CONT_RESD', area: 'Estacion Castilla 2', variable: 'Nivel de contención', alias: 'NIVEL_CONT_RESD_6630', criterio: 'VOIEA', valor: '88%', ventana: '< 80%', vc: { gc: [60, 70], voie: [70, 80], voic: [75, 90], limites: ['–', 100] }, fecha: '15/Jun/2026 06:10', turno: 'Turno A8 06-14' },
  { id: 7, tipo: 'NCR', equipo: 'SEP-TRI-02', area: 'Estacion Castilla 2', variable: 'Nivel interfase agua-crudo', alias: 'NIVEL_INTERFASE_SEPTRI02_6210', criterio: 'VOIEA', valor: '68%', ventana: '< 60%', vc: { gc: [40, 50], voie: [45, 60], voic: [50, 70], limites: ['–', 85] }, fecha: '16/Jun/2026 09:15', turno: 'Turno A8 06-14' },
  { id: 9, tipo: 'NCR', equipo: 'TANQ-203', area: 'Estacion Castilla 3', variable: 'Nivel tanque almacenamiento', alias: 'NIVEL_TANQ203_8120', criterio: 'VOIEA', valor: '91%', ventana: '< 85%', vc: { gc: [60, 75], voie: [70, 85], voic: [80, 95], limites: ['–', 100] }, fecha: '16/Jun/2026 09:50', turno: 'Turno A8 06-14' },
  { id: 11, tipo: 'INC', equipo: 'DET-GAS-12', area: 'Estacion Castilla 2', variable: 'Concentración de gas detectada', alias: 'CONC_GAS_DETGAS12_9502', criterio: 'Estado', valor: 'alarma activa', ventana: 'Sin alarma', vc: null, fecha: '16/Jun/2026 10:25', turno: 'Turno A8 06-14' },
  { id: 12, tipo: 'NCR', equipo: 'BOM-ART2', area: 'Seccion Crudos EC2', variable: 'Presión de descarga', alias: 'PRES_DESC_BOMART2_1033', criterio: 'VOIEA', valor: '640 psi', ventana: '< 600 psi', vc: { gc: [450, 500], voie: [480, 600], voic: [520, 650], limites: ['–', 750] }, fecha: '16/Jun/2026 06:40', turno: 'Turno A8 06-14' },
];
const TIPO_BADGE: Record<string, BadgeType> = { NCR: 'warning', INC: 'error' };
const CAUSAS = ['CAMIONVACI', 'CONTRAI', 'DISE', 'EstEqProd', 'FRANG', 'HUM', 'IFACILI', 'ING', 'INSTR', 'LOPC', 'MCIVIL', 'MELECT', 'MESTAT',
  'MINSTR', 'MMECAN', 'MTTODEF', 'PPROD', 'PRC', 'PRODLIMPIA'].map(c => ({ value: c, label: c }));
const TIPO_ACCION = ['Seguridad Procesos', 'Integridad Mec.', 'Disponibilidad'].map(c => ({ value: c, label: c }));
// Columnas de renderIncidenteDocBulk (resumen de las violaciones seleccionadas).
const COLS_BULK: TableColumn[] = [
  { key: 'variable', header: 'Nombre', minWidth: 180 }, { key: 'alias', header: 'Alias', minWidth: 200 }, { key: 'criterio', header: 'Criterio', minWidth: 90 },
  { key: 'tipo', header: 'Tipo', type: 'tag', tagTypes: TIPO_BADGE, minWidth: 90 }, { key: 'fecha', header: 'Fecha', minWidth: 150 }, { key: 'valor', header: 'Valor', minWidth: 100 },
];

function ncrStory(mobile = false) {
  const items = signal(NCRS.map(n => ({ ...n })));
  const sel = signal<number | null>(NCRS[0].id);
  const checked = signal<number[]>([]);
  const bloque = signal(false);
  const showDetail = signal(false);
  const aviso = signal('');
  const form = { comentario: '', causa: null as string | null, crearAccion: false, accionDesc: '', accionTipo: 'Seguridad Procesos', accionFecha: null as Date | null };
  const fb = createFilterState(FILTROS_NCR);
  const visibles = computed(() => {
    const a = fb.applied();
    const q = String(a['q'] ?? '').toLowerCase();
    return items().filter(n => (!a['tipo'] || n.tipo === a['tipo']) && (!a['turno'] || n.turno === a['turno'])
      && (!q || `${n.variable} ${n.equipo} ${n.alias}`.toLowerCase().includes(q)));
  });
  const actual = computed(() => items().find(n => n.id === sel()) ?? null);
  const seleccionadas = computed(() => items().filter(n => checked().includes(n.id)));
  const todas = computed(() => visibles().length > 0 && visibles().every(n => checked().includes(n.id)));
  const algunas = computed(() => !todas() && visibles().some(n => checked().includes(n.id)));
  const reset = () => Object.assign(form, { comentario: '', causa: null, crearAccion: false, accionDesc: '', accionTipo: 'Seguridad Procesos', accionFecha: null });
  const marcar = (id: number, v: boolean) => checked.update(xs => (v ? [...xs, id] : xs.filter(x => x !== id)));
  const marcarTodas = (v: boolean) => checked.set(v ? visibles().map(n => n.id) : []);
  const elegir = (id: number) => { sel.set(id); bloque.set(false); reset(); showDetail.set(true); focusLater('ncr-detail-h'); };
  const documentarBloque = () => { bloque.set(true); reset(); showDetail.set(true); focusLater('ncr-detail-h'); };
  const volver = () => { showDetail.set(false); setTimeout(() => (document.querySelector('.it.sel .it-open') as HTMLElement | null)?.focus(), 0); };
  const guardar = () => {
    const ids = bloque() ? checked() : [sel()!];
    const lista = visibles();
    const resto = lista.filter(n => !ids.includes(n.id));
    const i = lista.findIndex(n => n.id === sel());
    const siguiente = resto.find((_, k) => k >= i) ?? resto[resto.length - 1] ?? null;
    aviso.set(ids.length === 1 ? '1 violación documentada.' : `${ids.length} violaciones documentadas.`);
    items.update(xs => xs.filter(n => !ids.includes(n.id)));
    checked.update(xs => xs.filter(x => !ids.includes(x)));
    bloque.set(false);
    reset();
    sel.set(siguiente?.id ?? null);
    focusLater(siguiente ? 'ncr-detail-h' : 'ncr-empty');
  };
  const puedeGuardar = () => !!form.comentario.trim() && !!form.causa && (!form.crearAccion || (!!form.accionDesc.trim() && !!form.accionFecha));
  /** ↑/↓/Inicio/Fin mueven el foco (y la selección) entre las filas; Enter/Espacio en la fila abren. */
  const onKey = (e: KeyboardEvent) => {
    if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(e.key)) return;
    const ids = visibles().map(n => n.id);
    const cur = Math.max(0, ids.indexOf(sel() ?? -1));
    const next = e.key === 'ArrowDown' ? Math.min(ids.length - 1, cur + 1) : e.key === 'ArrowUp' ? Math.max(0, cur - 1) : e.key === 'Home' ? 0 : ids.length - 1;
    e.preventDefault();
    sel.set(ids[next]);
    bloque.set(false);
    setTimeout(() => (document.getElementById(`ncr-open-${ids[next]}`) as HTMLElement | null)?.focus(), 0);
  };
  return {
    props: { fb, areas: AREAS, items, visibles, sel, actual, checked, seleccionadas, todas, algunas, bloque, showDetail, aviso, form, causas: CAUSAS,
      tiposAccion: TIPO_ACCION, tipoBadge: TIPO_BADGE, colsBulk: COLS_BULK, marcar, marcarTodas, elegir, documentarBloque, volver, guardar, puedeGuardar, onKey,
      today: new Date(2026, 5, 16) },
    styles: [STYLES],
    template: `
    <div class="frame${mobile ? ' m' : ''}">
      <div class="bx">
        <div class="bx-in" [class.show-detail]="showDetail()" [class.is-empty]="!items().length">
          <section class="bx-list" aria-label="Incidentes y NCR por documentar">
            ${filterBarTemplate('fb', fb, { label: 'Incidentes y NCR por documentar', searchPlaceholder: 'Buscar equipo o variable' })}
            @if (aviso()) {
              <rama-alert state="success" variant="compact" (closed)="aviso.set('')">{{ aviso() }}</rama-alert>
            }
            @if (items().length) {
              <div class="bx-count bx-all">
                <rama-checkbox [checked]="todas()" [indeterminate]="algunas()" (checkedChange)="marcarTodas($event)">Seleccionar todo</rama-checkbox>
                <span>{{ visibles().length }} abiertas</span>
              </div>
              <ul class="lst" aria-label="Incidentes y NCR abiertos" (keydown)="onKey($event)">
                @for (n of visibles(); track n.id) {
                  <li class="it" [class.sel]="n.id === sel() && !bloque()">
                    <rama-checkbox [checked]="checked().includes(n.id)" (checkedChange)="marcar(n.id, $event)"><span class="sr">Seleccionar {{ n.variable }}</span></rama-checkbox>
                    <button type="button" class="it-open" [id]="'ncr-open-' + n.id" [attr.aria-current]="n.id === sel() && !bloque() ? 'true' : null"
                      [attr.tabindex]="n.id === (sel() ?? visibles()[0].id) ? 0 : -1" (click)="elegir(n.id)">
                      <span class="it-row"><rama-badge size="small" [type]="tipoBadge[n.tipo]">{{ n.tipo }}</rama-badge><span class="it-t">{{ n.variable }}</span></span>
                      <span class="it-m">{{ n.equipo }} · {{ n.fecha }} · {{ n.valor }}</span>
                    </button>
                  </li>
                }
              </ul>
              <div class="bx-count" style="justify-content:flex-end">
                <rama-button [disabled]="!checked().length" (click)="documentarBloque()">Documentar{{ checked().length ? ' (' + checked().length + ')' : '' }}</rama-button>
              </div>
            } @else {
              <div class="empty" id="ncr-empty" tabindex="-1">
                <span class="empty-ic"><rama-icon name="checks" [size]="32" /></span>
                <h3>Todo documentado</h3>
                <p>No hay incidentes ni NCR abiertos por documentar.</p>
              </div>
            }
          </section>

          @if (bloque() || actual()) {
            <section class="bx-detail" aria-labelledby="ncr-detail-h">
              <div class="bx-back"><rama-button variant="ghost" size="small" leadIcon="arrow-left" (click)="volver()">Incidentes y NCR</rama-button></div>
              <div class="bx-scroll">
                @if (bloque()) {
                  <div class="bx-h"><h3 id="ncr-detail-h" tabindex="-1">Documentar {{ seleccionadas().length }} {{ seleccionadas().length === 1 ? 'violación seleccionada' : 'violaciones seleccionadas' }}</h3></div>
                  <rama-table [columns]="colsBulk" [rows]="seleccionadas()" caption="Violaciones seleccionadas" />
                } @else if (actual(); as n) {
                  <div class="bx-h">
                    <h3 id="ncr-detail-h" tabindex="-1">Documentar {{ n.tipo === 'NCR' ? 'no conformidad' : 'incidente' }}</h3>
                    <rama-badge type="warning">Abierta</rama-badge>
                  </div>
                  <rama-panel-section [title]="n.variable">
                    <div class="grid2">
                      <rama-panel-field label="Equipo">{{ n.equipo }}</rama-panel-field>
                      <rama-panel-field label="Alias">{{ n.alias }}</rama-panel-field>
                      <rama-panel-field label="Criterio">{{ n.criterio }}</rama-panel-field>
                      <rama-panel-field label="Tipo">{{ n.tipo }}</rama-panel-field>
                      <rama-panel-field label="Fecha">{{ n.fecha }}</rama-panel-field>
                      <rama-panel-field label="Valor">{{ n.valor }} (vent. {{ n.ventana }})</rama-panel-field>
                    </div>
                  </rama-panel-section>
                  <rama-panel-section title="Valores de control">
                    @if (n.vc; as vc) {
                      <div class="grid2">
                        <rama-panel-field label="GC (Guía de control)">{{ vc.gc[0] }} / {{ vc.gc[1] }}</rama-panel-field>
                        <rama-panel-field label="VOIE (Estándar)">{{ vc.voie[0] }} / {{ vc.voie[1] }}</rama-panel-field>
                        <rama-panel-field label="VOIC (Crítica)">{{ vc.voic[0] }} / {{ vc.voic[1] }}</rama-panel-field>
                        <rama-panel-field label="Límites">{{ vc.limites[0] }} / {{ vc.limites[1] }}</rama-panel-field>
                      </div>
                    } @else {
                      <rama-panel-field label="Valores de control">—</rama-panel-field>
                    }
                  </rama-panel-section>
                  <p class="bx-help">Se generó automáticamente durante la ejecución de la ronda y no se documentó en el momento. Mientras no se documente, el incidente queda en estado <strong>Abierto</strong>. Comentario y Causa son obligatorios.</p>
                }
                <rama-form>
                  <rama-textarea label="Comentario" [required]="true" placeholder="Describe lo ocurrido..." [rows]="4" [(ngModel)]="form.comentario" />
                  @if (!bloque()) {
                    <rama-uploader-button label="Archivos adjuntos" buttonLabel="Adjuntar archivo" accept=".pdf,.xls,.xlsx,image/*"
                      hint="Formatos permitidos: PDF, Excel, imagen — máx. 10 MB. Puedes adjuntar varios." />
                  }
                  <rama-autocomplete label="Causa" [required]="true" placeholder="Seleccionar causa..." [options]="causas" [(ngModel)]="form.causa" />
                  @if (!bloque()) {
                    <rama-checkbox size="small" [(checked)]="form.crearAccion">Crear o documentar una acción asociada a este {{ actual()?.tipo === 'NCR' ? 'NCR' : 'incidente' }}</rama-checkbox>
                    @if (form.crearAccion) {
                      <rama-textarea label="Descripción de la acción" [required]="true" placeholder="Ej. Verificar válvula de alivio PSV-101 en sobrepresurización" [rows]="3" [(ngModel)]="form.accionDesc" />
                      <rama-form-section [columns]="2">
                        <rama-autocomplete label="Tipo" [options]="tiposAccion" [(ngModel)]="form.accionTipo" />
                        <rama-datepicker label="Fecha límite" [required]="true" helpText="" [today]="today" [min]="today" [(value)]="form.accionFecha" style="width:100%" />
                      </rama-form-section>
                    }
                  }
                </rama-form>
              </div>
              <div class="bx-foot">
                <rama-button [disabled]="!puedeGuardar()" (click)="guardar()">{{ form.crearAccion && !bloque() ? 'Guardar y crear acción' : 'Guardar' }}</rama-button>
              </div>
            </section>
          }
        </div>
      </div>
    </div>`,
  };
}

export const NcrIncidentes: Story = {
  name: 'Incidentes y NCR por documentar',
  render: () => ncrStory(),
};

export const NcrMovil: Story = {
  name: 'Incidentes y NCR · angosta (390px)',
  render: () => ncrStory(true),
};
