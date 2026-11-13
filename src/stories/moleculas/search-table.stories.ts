import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';
import { RamaSearchTable } from '../../lib/search-table/search-table.component';
import { RamaTable, TableColumn, TableRow } from '../../lib/table/table.component';

const columns: TableColumn[] = [
  { key: 'puesto', header: 'Puesto de trabajo', sortable: true },
  { key: 'area', header: 'Área organizativa', sortable: true },
  { key: 'turno', header: 'Turno', width: 160 },
  { key: 'estado', header: 'Estado', width: 160, type: 'tag' },
];
const rows: TableRow[] = [
  { id: 1, puesto: 'Supervisor de recorredores', area: 'Campo Moriche-Abarco', turno: 'Turno A8 06-14', estado: 'Por documentar' },
  { id: 2, puesto: 'Operador VTI U8700', area: 'VTI - U8700', turno: 'Turno A8 06-14', estado: 'Por documentar' },
  { id: 3, puesto: 'Operador Estación Castilla 2', area: 'Estación Castilla 2', turno: 'Turno B8 14-22', estado: 'En documentación' },
  { id: 4, puesto: 'Supervisor Área Campo 3.2', area: 'Área Campo 3.2 - Ruitoque', turno: 'Turno A8 06-14', estado: 'Revisión' },
  { id: 5, puesto: 'Operador Batería Abanico', area: 'Batería Abanico', turno: 'Turno C8 22-06', estado: 'Revisión' },
  { id: 6, puesto: 'Operador de campo', area: 'Zona 1', turno: 'Turno A8 06-14', estado: 'Cerrada' },
];

const normalize = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
const filter = (q: string) => (q ? rows.filter(r => Object.values(r).some(v => normalize(String(v)).includes(normalize(q)))) : rows);

const meta: Meta<RamaSearchTable> = {
  title: 'Moléculas/Search table',
  component: RamaSearchTable,
  decorators: [moduleMetadata({ imports: [RamaSearchTable, RamaTable] })],
  parameters: { layout: 'padded' },
  args: { placeholder: 'Buscar', disabled: false, shadow: true },
};
export default meta;

export const Buscador: StoryObj<RamaSearchTable> = {
  render: (args) => ({
    props: { ...args, q: '' },
    template: `<rama-search-table [placeholder]="placeholder" [disabled]="disabled" [shadow]="shadow" [(value)]="q" />`,
  }),
};

export const Estados: StoryObj<RamaSearchTable> = {
  render: () => ({
    template: `
      <div class="sb-doc" style="display:flex;flex-direction:column;gap:20px">
        <p class="sb-lead">Default, Hovered (al pasar el cursor, fondo gris), Selected (al escribir: borde primario y botón X para limpiar), Default with content (al salir del campo con texto) y Disable.</p>
        <div><code>Default</code><rama-search-table /></div>
        <div><code>Default with content</code><rama-search-table value="Revisión" /></div>
        <div><code>Disable</code><rama-search-table [disabled]="true" /></div>
        <div><code>Disable with content</code><rama-search-table [disabled]="true" value="Revisión" /></div>
      </div>`,
  }),
};

export const ConTabla: StoryObj<RamaSearchTable> = {
  name: 'Filtrando una tabla',
  render: () => ({
    props: { q: '', filter, columns },
    template: `
      <div class="sb-doc" style="display:flex;flex-direction:column;gap:16px">
        <p class="sb-lead">Comportamiento de Figma: al escribir, la tabla muestra solo las filas que coinciden; la X (o Escape) limpia el buscador y vuelve a mostrar todos los registros. El buscador va encima de la tabla, alineado a la derecha.</p>
        <div style="display:flex;justify-content:flex-end">
          <rama-search-table [(value)]="q" ariaLabel="Buscar en la entrega de turno" />
        </div>
        <rama-table [columns]="columns" [rows]="filter(q)" caption="Entrega de turno por documentar" emptyText="Ningún registro coincide con la búsqueda." />
      </div>`,
  }),
};
