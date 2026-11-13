import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';
import { RamaBadge } from '../../lib/badge/badge.component';
import { avatarPlaceholder } from '../shared/avatar-placeholder';

const types = ['primary', 'info', 'success', 'caution', 'warning', 'error', 'neutral'];
const sizes = ['small', 'medium', 'large'];

type Args = RamaBadge & { label: string };

const meta: Meta<Args> = {
  title: 'Átomos/Badge',
  component: RamaBadge,
  decorators: [moduleMetadata({ imports: [RamaBadge] })],
  parameters: { layout: 'padded' },
  argTypes: {
    type: { control: 'select', options: types },
    size: { control: 'inline-radio', options: sizes },
    leadIcon: { control: 'select', options: [undefined, 'add', 'info-circle'] },
  },
  args: { label: 'Tag Label', type: 'primary', size: 'medium', leadIcon: 'add', count: 2, dot: true, closable: true },
};
export default meta;

export const Playground: StoryObj<Args> = {
  render: (args) => ({
    props: { ...args, avatarPlaceholder },
    template: `<rama-badge [type]="type" [size]="size" [leadIcon]="leadIcon" [count]="count" [avatar]="avatarPlaceholder" [dot]="dot" [closable]="closable">{{ label }}</rama-badge>`,
  }),
};

export const TiposYTamanos: StoryObj<Args> = {
  name: 'Tipos × tamaños',
  render: (args) => ({
    props: { ...args, types, sizes, avatarPlaceholder },
    template: `
      <div class="sb-doc">
        <p class="sb-lead">Fondo suave con texto del mismo color. Primary para lo general; Info, Success, Caution, Warning y Error para estados; Neutral para datos sin carga semántica. Todos los elementos son opcionales.</p>
        <div style="overflow-x:auto"><table class="sb-table" style="width:auto">
          <thead><tr><th></th>@for (s of sizes; track s) { <th>{{ s }}</th> }</tr></thead>
          <tbody>
            @for (t of types; track t) {
              <tr><td><b>{{ t }}</b></td>
                @for (s of sizes; track s) {
                  <td><rama-badge [type]="t" [size]="s" leadIcon="add" [count]="2" [avatar]="avatarPlaceholder" [dot]="true" [closable]="true">{{ label }}</rama-badge></td>
                }
              </tr>
            }
          </tbody>
        </table></div>
      </div>`,
  }),
};

export const UsoComun: StoryObj<Args> = {
  name: 'Uso común',
  render: () => ({
    template: `
      <div class="sb-doc" style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">
        <rama-badge type="success" [dot]="true">Cerrada</rama-badge>
        <rama-badge type="info" [dot]="true">En ejecución</rama-badge>
        <rama-badge type="warning" [dot]="true">Abierta</rama-badge>
        <rama-badge type="error" [count]="3">Incidentes</rama-badge>
        <rama-badge type="caution">Por revisar</rama-badge>
        <rama-badge type="neutral" [closable]="true">Turno A</rama-badge>
      </div>`,
  }),
};
