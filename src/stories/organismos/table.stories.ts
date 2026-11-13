import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';
import { RamaTable, TableColumn, TableRow } from '../../lib/table/table.component';
import { RamaTableButton } from '../../lib/table/table-button.component';
import { RamaPercentage } from '../../lib/table/percentage.component';
import type { BadgeType } from '../../lib/badge/badge.component';

const estadoTypes: Record<string, BadgeType> = {
  'Por realizar': 'neutral', 'En curso': 'primary', 'Cortada': 'warning', 'Finalizada': 'success', 'Permitido': 'success', 'Incidente': 'error',
};

const columns: TableColumn[] = [
  { key: 'ronda', header: 'Ronda', width: 220, sortable: true },
  { key: 'puesto', header: 'Puesto de trabajo', sortable: true },
  { key: 'equipo', header: 'Equipo', width: 190 },
  { key: 'estado', header: 'Estado', width: 150, type: 'tag', tagTypes: estadoTypes },
  { key: 'avance', header: 'Avance', width: 110, type: 'percentage', sortable: true, align: 'center' },
];

const rows: TableRow[] = [
  { id: 1, ronda: 'Ronda Pozos Zona 1', puesto: 'Operador de campo · Zona 1', equipo: 'Celda de flotación S-6621', estado: 'Por realizar', avance: 0 },
  { id: 2, ronda: 'Ronda Planta Deshidratación', puesto: 'Operador · VTI U8700', equipo: 'Tanque TANQ-74-011', estado: 'En curso', avance: 45 },
  { id: 3, ronda: 'Ronda Compresores Norte', puesto: 'Supervisor de recorredores', equipo: 'Compresor C-05', estado: 'En curso', avance: 68 },
  { id: 4, ronda: 'Ronda Área 3.2', puesto: 'Supervisor · Área Campo 3.2', equipo: 'TANQ_CONT_RESD', estado: 'Cortada', avance: 30 },
  { id: 5, ronda: 'Ronda Batería Abanico', puesto: 'Operador · Batería Abanico', equipo: 'Separador trifásico 1', estado: 'Finalizada', avance: 100 },
  { id: 6, ronda: 'Ronda Estación Castilla 2', puesto: 'Operador · Estación Castilla 2', equipo: 'Bomba BOM-TRANS-04', estado: 'En curso', avance: 82 },
  { id: 7, ronda: 'Ronda Tanques Zona 1', puesto: 'Operador de campo · Zona 1', equipo: 'Tanque TANQ-203', estado: 'Por realizar', avance: 12 },
];

const equipos: TableRow[] = [
  { id: 'a', equipo: 'Celda de flotación S-6621', tarea: 'Nivel celda de flotación', valor: '4.10 ft', estado: 'Permitido' },
  { id: 'b', equipo: 'Celda de flotación S-6621', tarea: 'Caudal de entrada', valor: '88 BPD', estado: 'Permitido' },
  { id: 'c', equipo: 'Bomba BOM-ART1', tarea: 'Vibración rodamiento', valor: '7.8 mm/s', estado: 'Incidente' },
];
const nestedColumns: TableColumn[] = [
  { key: 'equipo', header: 'Equipo' },
  { key: 'tarea', header: 'Tarea' },
  { key: 'valor', header: 'Valor', width: 120 },
  { key: 'estado', header: 'Estado', width: 140, type: 'tag', tagTypes: estadoTypes },
];

/** Todos los tipos de encabezado y de celda de Figma en una sola tabla. */
const typeColumns: TableColumn[] = [
  { key: 'responsable', header: 'Responsable', type: 'avatar' },
  { key: 'ronda', header: 'Ronda (Title sort)', width: 200, sortable: true },
  { key: 'fecha', header: 'Programada (Icon text)', width: 200, type: 'icon-text' },
  { key: 'observacion', header: 'Observación (Input)', width: 220, type: 'input', placeholder: 'Escribir' },
  { key: 'estado', header: 'Estado (Filter)', width: 160, type: 'tag', tagTypes: estadoTypes, filterable: true },
  { key: 'avance', header: 'Avance', width: 110, type: 'percentage', align: 'center' },
  { key: 'alerta', header: 'Información (Icon)', headerIcon: 'info-circle-24', type: 'icon', icon: 'edit-2' },
  { key: 'vacia', header: 'Columna vacía', width: 52, type: 'empty' },
];
const typeRows: TableRow[] = [
  { id: 1, responsable: { initials: 'OC', label: 'Operador de campo · Zona 1' }, ronda: 'Ronda Pozos Zona 1', fecha: '13/11/2026 · 06:00', observacion: '', estado: 'Por realizar', avance: 0, alerta: 'Editar ronda' },
  { id: 2, responsable: { initials: 'ST', label: 'Supervisor de turno' }, ronda: 'Ronda Estación Castilla 2', fecha: '13/11/2026 · 14:00', observacion: 'Fuga menor en válvula', estado: 'En curso', avance: 44, alerta: 'Editar ronda' },
  { id: 3, responsable: { initials: 'SR', label: 'Supervisor de recorredores' }, ronda: 'Ronda Compresores Norte', fecha: '12/11/2026 · 22:00', observacion: '', estado: 'Finalizada', avance: 91, alerta: 'Editar ronda' },
  { id: 4, responsable: { initials: 'OV', label: 'Operador · VTI U8700' }, ronda: 'Ronda Área 3.2', fecha: '12/11/2026 · 06:00', observacion: '', estado: 'Cortada', avance: 16, alerta: 'Editar ronda' },
];

/** Columnas de los ejemplos responsive de Figma (52 + 200 + 232×4 + 152×2 + acciones 98 = 1582 px). */
const wideColumns: TableColumn[] = [
  { key: 'ronda', header: 'Ronda', width: 200 },
  { key: 'puesto', header: 'Puesto de trabajo', width: 232 },
  { key: 'equipo', header: 'Equipo', width: 232 },
  { key: 'estacion', header: 'Estación', width: 232 },
  { key: 'area', header: 'Área organizativa', width: 232 },
  { key: 'estado', header: 'Estado', width: 152, type: 'tag', tagTypes: estadoTypes },
  { key: 'avance', header: 'Avance', width: 152, type: 'percentage' },
];
const wideRows: TableRow[] = rows.slice(0, 4).map((r, i) => ({
  ...r, estacion: ['Estación Castilla 2', 'VTI - U8700', 'Batería Abanico', 'Área Campo 3.2'][i], area: ['Castilla-Apiay', 'Dpto Castilla', 'Campo Moriche-Abarco', 'Ruitoque'][i],
}));

type Args = { selectable: boolean; expandable: boolean; pageSize: number };

const meta: Meta<Args> = {
  title: 'Organismos/Table',
  decorators: [moduleMetadata({ imports: [RamaTable, RamaTableButton, RamaPercentage] })],
  parameters: { layout: 'padded' },
  argTypes: { pageSize: { control: { type: 'number', min: 0, max: 10 } } },
  args: { selectable: true, expandable: false, pageSize: 5 },
};
export default meta;

export const Tabla: StoryObj<Args> = {
  render: (args) => ({
    props: { ...args, columns, rows, selected: [2], last: '' },
    template: `
      <div class="sb-doc">
        <p class="sb-lead">Encabezado gris con columnas ordenables (clic en el título), selección por fila, celda de etiqueta, celda de porcentaje y botones de acción. La fila seleccionada toma el borde primario (estado "Pressed" de Figma).</p>
        <rama-table [columns]="columns" [rows]="rows" [selectable]="selectable" [expandable]="expandable" [pageSize]="pageSize"
          [actions]="['primary', 'search']" [(selected)]="selected" caption="Rondas del turno" (action)="last = $event.type + ' → ' + $event.row.ronda" />
        <p class="sb-lead" style="margin-top:12px">Seleccionadas: <code>{{ selected.join(', ') || 'ninguna' }}</code> @if (last) { · Última acción: <code>{{ last }}</code> }</p>
      </div>`,
  }),
};

export const TiposDeCelda: StoryObj<Args> = {
  name: 'Tipos de encabezado y celda',
  args: { selectable: true, expandable: false, pageSize: 0 },
  render: (args) => ({
    props: { ...args, columns: typeColumns, rows: typeRows, log: '' },
    template: `
      <div class="sb-doc">
        <p class="sb-lead">Encabezados de Figma: Checkbox, Title, Icon, Title sort, Filter y Empty. Celdas: Avatar, Text, Icon text, Input, Tag, Porcentaje, Icon y Empty. El filtro emite <code>(filter)</code> y la celda Input emite <code>(cellChange)</code> al confirmar.</p>
        <rama-table [columns]="columns" [rows]="rows" [selectable]="selectable" [actions]="['edit']" caption="Rondas programadas"
          (filter)="log = 'Filtro: ' + $event" (cellChange)="log = 'Observación de ' + $event.row.ronda + ': ' + $event.value" />
        @if (log) { <p class="sb-lead" style="margin-top:12px"><code>{{ log }}</code></p> }
      </div>`,
  }),
};

export const Anidada: StoryObj<Args> = {
  name: 'Tabla anidada (expandible)',
  args: { selectable: true, expandable: true, pageSize: 0 },
  render: (args) => ({
    props: { ...args, columns, rows: rows.slice(0, 4), nestedColumns, equipos },
    template: `
      <div class="sb-doc">
        <p class="sb-lead">Variante "Nested" de Figma: el chevrón de cada fila despliega una tabla interna con el detalle (aquí, las tareas registradas de la ronda).</p>
        <rama-table [columns]="columns" [rows]="rows" [selectable]="selectable" [expandable]="expandable" [actions]="['primary', 'search']">
          <ng-template #detail let-row>
            <rama-table [columns]="nestedColumns" [rows]="equipos" [selectable]="true" [actions]="['primary', 'search']" [caption]="'Tareas de ' + row.ronda" />
          </ng-template>
        </rama-table>
      </div>`,
  }),
};

export const Responsive: StoryObj<Args> = {
  name: 'Responsive (scroll y acciones fijas)',
  args: { selectable: true, expandable: false, pageSize: 0 },
  render: (args) => ({
    props: { ...args, columns: wideColumns, rows: wideRows, widths: [1584, 879, 664] },
    template: `
      <div class="sb-doc" style="display:flex;flex-direction:column;gap:32px">
        <p class="sb-lead">Ejemplos de Figma a 1728, 1024 y 744 px: cuando las columnas no caben, la tabla se desplaza en horizontal, la columna "Acciones" queda fija a la derecha y aparece la barra "Scroll bar (Light version)" debajo (también se puede arrastrar o usar Mayús + rueda / teclado sobre la tabla).</p>
        @for (w of widths; track w) {
          <div [style.max-width.px]="w">
            <p class="sb-lead"><code>{{ w }} px</code></p>
            <rama-table [columns]="columns" [rows]="rows" [selectable]="selectable" [expandable]="expandable" [actions]="['primary', 'search']" [caption]="'Rondas (' + w + ' px)'" />
          </div>
        }
      </div>`,
  }),
};

export const Estados: StoryObj<Args> = {
  name: 'Estados vacío y cargando',
  args: { selectable: true, expandable: false, pageSize: 0 },
  render: (args) => ({
    props: { ...args, columns, rows: [] },
    template: `
      <div class="sb-doc" style="display:flex;flex-direction:column;gap:24px">
        <p class="sb-lead">Estados que no existen en Figma, completados con tokens del sistema: sin registros (texto muted) y cargando (ícono "loading" en primario, <code>aria-busy</code>).</p>
        <rama-table [columns]="columns" [rows]="rows" [selectable]="selectable" [actions]="['primary']" caption="Sin registros" emptyText="No hay rondas programadas para este turno." />
        <rama-table [columns]="columns" [rows]="rows" [selectable]="selectable" [actions]="['primary']" caption="Cargando" [loading]="true" />
      </div>`,
  }),
};
