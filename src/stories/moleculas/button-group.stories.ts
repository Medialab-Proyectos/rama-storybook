import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';
import { ButtonGroupOption, RamaButtonGroup } from '../../lib/button-group/button-group.component';

const turnos: ButtonGroupOption[] = [
  { value: 'diurno', label: 'Turno diurno' },
  { value: 'nocturno', label: 'Turno nocturno' },
  { value: 'todos', label: 'Todos los turnos' },
];
const conIconos: ButtonGroupOption[] = Array.from({ length: 7 }, (_, i) => ({
  value: `op-${i + 1}`, label: 'Text button', leadIcon: 'info-circle', trailIcon: 'arrow-down',
}));
const soloIconos: ButtonGroupOption[] = [
  { value: 'lista', leadIcon: 'menu', ariaLabel: 'Vista de lista' },
  { value: 'tarjetas', leadIcon: 'layers-2', ariaLabel: 'Vista de tarjetas' },
  { value: 'calendario', leadIcon: 'calendar-1', ariaLabel: 'Vista de calendario' },
];

const meta: Meta<RamaButtonGroup> = {
  title: 'Moléculas/Button group',
  component: RamaButtonGroup,
  decorators: [moduleMetadata({ imports: [RamaButtonGroup] })],
  parameters: { layout: 'padded' },
  argTypes: {
    type: { control: 'inline-radio', options: ['grouped', 'ungrouped'] },
  },
  args: { type: 'grouped', multiple: false, options: turnos, value: 'diurno' },
};
export default meta;

export const Playground: StoryObj<RamaButtonGroup> = {
  render: (args) => ({
    props: args,
    template: `
      <div class="sb-doc">
        <rama-button-group [options]="options" [type]="type" [multiple]="multiple" [(value)]="value" ariaLabel="Filtrar por turno" />
      </div>`,
  }),
};

export const Tipos: StoryObj<RamaButtonGroup> = {
  name: 'Grouped y Ungrouped',
  render: () => ({
    props: { conIconos },
    template: `
      <div class="sb-doc" style="display:flex;flex-direction:column;gap:20px">
        <p class="sb-lead">Grouped une las opciones en una caja con divisores; Ungrouped las separa 8px, cada una con su borde.</p>
        <div><h2 style="font-size:14px">Grouped</h2><rama-button-group [options]="conIconos" type="grouped" value="op-1" /></div>
        <div><h2 style="font-size:14px">Ungrouped</h2><rama-button-group [options]="conIconos" type="ungrouped" value="op-1" /></div>
      </div>`,
  }),
};

export const EstadosOpcion: StoryObj<RamaButtonGroup> = {
  name: 'Estados de la opción',
  render: () => ({
    props: { one: [{ value: 'a', label: 'Text button', leadIcon: 'info-circle', trailIcon: 'arrow-down' }] },
    template: `
      <div class="sb-doc">
        <table class="sb-table" style="width:auto">
          <thead><tr><th></th><th>Default</th><th>Hover</th><th>Selected</th><th>Focus</th></tr></thead>
          <tbody>
            @for (t of ['grouped', 'ungrouped']; track t) {
              <tr><td><b>{{ t }}</b></td>
                <td><rama-button-group [options]="one" [type]="t" /></td>
                <td><rama-button-group class="is-hover" [options]="one" [type]="t" /></td>
                <td><rama-button-group [options]="one" [type]="t" value="a" /></td>
                <td><rama-button-group class="is-focus" [options]="one" [type]="t" /></td>
              </tr>
            }
          </tbody>
        </table>
      </div>`,
  }),
};

export const Variantes: StoryObj<RamaButtonGroup> = {
  name: 'Solo texto, solo ícono y múltiple',
  render: () => ({
    props: { turnos, soloIconos, multi: ['diurno'] },
    template: `
      <div class="sb-doc" style="display:flex;flex-direction:column;gap:20px">
        <div><h2 style="font-size:14px">Solo texto</h2><rama-button-group [options]="turnos" value="todos" /></div>
        <div><h2 style="font-size:14px">Solo ícono</h2><rama-button-group [options]="soloIconos" value="lista" ariaLabel="Cambiar vista" /></div>
        <div><h2 style="font-size:14px">Selección múltiple</h2>
          <rama-button-group [options]="turnos" [multiple]="true" [(value)]="multi" type="ungrouped" /></div>
      </div>`,
  }),
};
