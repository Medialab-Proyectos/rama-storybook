import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';
import { RamaTag } from '../../lib/tag/tag.component';
import { avatarPlaceholder } from '../shared/avatar-placeholder';

const sizes = ['xs', 'small', 'medium', 'large'];

type Args = RamaTag & { label: string };

const meta: Meta<Args> = {
  title: 'Átomos/Tag',
  component: RamaTag,
  decorators: [moduleMetadata({ imports: [RamaTag] })],
  parameters: { layout: 'padded' },
  argTypes: {
    theme: { control: 'inline-radio', options: ['neutral', 'primary'] },
    line: { control: 'inline-radio', options: ['solid', 'dashed'] },
    size: { control: 'inline-radio', options: sizes },
  },
  args: { label: 'Tag Label', theme: 'neutral', line: 'solid', size: 'small', closable: true },
};
export default meta;

export const Playground: StoryObj<Args> = {
  render: (args) => ({
    props: { ...args, avatarPlaceholder },
    template: `<rama-tag [theme]="theme" [line]="line" [size]="size" leadIcon="add" [count]="2" [avatar]="avatarPlaceholder" [dot]="true"
      [trailDot]="true" [trailAvatar]="avatarPlaceholder" [trailCount]="2" [closable]="closable">{{ label }}</rama-tag>`,
  }),
};

export const Variantes: StoryObj<Args> = {
  name: 'Tema × línea × tamaño',
  render: (args) => ({
    props: { ...args, sizes, avatarPlaceholder, combos: [
      { theme: 'neutral', line: 'solid' }, { theme: 'primary', line: 'solid' },
      { theme: 'neutral', line: 'dashed' }, { theme: 'primary', line: 'dashed' },
    ] },
    template: `
      <div class="sb-doc">
        <p class="sb-lead">Los tags solo llevan borde, sin fondo. La línea punteada indica un valor sugerido o pendiente de confirmar. Todos los elementos son opcionales.</p>
        <div style="overflow-x:auto"><table class="sb-table" style="width:auto">
          <thead><tr><th></th>@for (c of combos; track $index) { <th>{{ c.theme }} · {{ c.line }}</th> }</tr></thead>
          <tbody>
            @for (s of sizes; track s) {
              <tr><td><b>{{ s }}</b></td>
                @for (c of combos; track $index) {
                  <td><rama-tag [theme]="c.theme" [line]="c.line" [size]="s" leadIcon="add" [count]="2" [avatar]="avatarPlaceholder" [dot]="true"
                    [trailDot]="true" [trailAvatar]="avatarPlaceholder" [trailCount]="2" [closable]="true">{{ label }}</rama-tag></td>
                }
              </tr>
            }
          </tbody>
        </table></div>
      </div>`,
  }),
};

export const Filtros: StoryObj<Args> = {
  name: 'Uso como filtros',
  render: () => ({
    props: { filtros: ['Área Campo 3.2', 'Turno A', 'Operador de campo'], quitar(f: string[], x: string) { f.splice(f.indexOf(x), 1); } },
    template: `
      <div class="sb-doc" style="display:flex;gap:8px;flex-wrap:wrap">
        @for (f of filtros; track f) { <rama-tag theme="primary" size="small" [closable]="true" (closed)="quitar(filtros, f)">{{ f }}</rama-tag> }
        <rama-tag line="dashed" size="small" leadIcon="add">Agregar filtro</rama-tag>
      </div>`,
  }),
};
