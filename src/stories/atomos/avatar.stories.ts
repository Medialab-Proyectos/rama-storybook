import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';
import { RamaAvatar } from '../../lib/avatar/avatar.component';

// Imagen de ejemplo abstracta (no es la foto de una persona real).
const ilustracion = 'data:image/svg+xml;utf8,' + encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect width="40" height="40" fill="#b0e5f7"/>` +
  `<circle cx="20" cy="16" r="7" fill="#04b5eb"/><path d="M6 40c2-9 8-13 14-13s12 4 14 13z" fill="#005794"/></svg>`);

const sizes = ['1x', '2x', '3x', '4x', '5x', '6x', '7x', '8x', '9x'];
const px: Record<string, number> = { '1x': 16, '2x': 24, '3x': 32, '4x': 40, '5x': 48, '6x': 64, '7x': 80, '8x': 96, '9x': 120 };

type Args = RamaAvatar & { tipo: string };

const meta: Meta<Args> = {
  title: 'Átomos/Avatar',
  component: RamaAvatar,
  decorators: [moduleMetadata({ imports: [RamaAvatar] })],
  parameters: { layout: 'padded' },
  argTypes: {
    tipo: { control: 'inline-radio', options: ['texto', 'ícono', 'imagen'] },
    size: { control: 'select', options: sizes },
    radius: { control: 'inline-radio', options: ['round', 'semi-round', 'square'] },
    avatarStyle: { control: 'inline-radio', options: ['default', 'border', 'detached'] },
  },
  args: { tipo: 'texto', initials: 'SE', label: 'Supervisor de Estación', size: '6x', radius: 'round', avatarStyle: 'default', editable: false },
};
export default meta;

export const Playground: StoryObj<Args> = {
  render: (args) => ({
    props: { ...args, img: ilustracion },
    template: `<rama-avatar [initials]="tipo === 'texto' ? initials : undefined" [src]="tipo === 'imagen' ? img : undefined"
      [label]="label" [size]="size" [radius]="radius" [avatarStyle]="avatarStyle" [editable]="editable" />`,
  }),
};

export const Tipos: StoryObj<Args> = {
  name: 'Tipos y formas',
  render: () => ({
    props: { img: ilustracion, radii: ['round', 'semi-round', 'square'] },
    template: `
      <div class="sb-doc">
        <p class="sb-lead">Tres tipos: imagen, iniciales e ícono (cuando no hay datos). Tres formas: redonda, semirredonda y cuadrada. Usa iniciales del cargo, nunca nombres propios de ejemplo.</p>
        <table class="sb-table" style="width:auto">
          <thead><tr><th></th><th>Imagen</th><th>Texto</th><th>Ícono</th></tr></thead>
          <tbody>
            @for (r of radii; track r) {
              <tr><td><b>{{ r }}</b></td>
                <td><rama-avatar [src]="img" [radius]="r" size="6x" label="Operador" /></td>
                <td><rama-avatar initials="OP" [radius]="r" size="6x" label="Operador" /></td>
                <td><rama-avatar [radius]="r" size="6x" /></td>
              </tr>
            }
          </tbody>
        </table>
      </div>`,
  }),
};

export const Estilos: StoryObj<Args> = {
  name: 'Estilos y hover',
  render: () => ({
    template: `
      <div class="sb-doc">
        <p class="sb-lead">Default, Border, Detached Border y Hover. Hover solo aparece con <code>editable</code> (capa negra al 70 % con el ícono de ajustes); aquí se muestra fijo.</p>
        <div style="display:flex;gap:32px;align-items:center">
          <div class="sb-tile"><rama-avatar initials="SE" size="6x" /><code>default</code></div>
          <div class="sb-tile"><rama-avatar initials="SE" size="6x" avatarStyle="border" /><code>border</code></div>
          <div class="sb-tile"><rama-avatar initials="SE" size="6x" avatarStyle="detached" /><code>detached</code></div>
          <div class="sb-tile"><rama-avatar class="is-hover" initials="SE" size="6x" [editable]="true" /><code>hover (editable)</code></div>
        </div>
      </div>`,
  }),
};

export const Tamanos: StoryObj<Args> = {
  name: 'Tamaños',
  render: () => ({
    props: { sizes, px },
    template: `
      <div class="sb-doc">
        <p class="sb-lead">Nueve tamaños, de 16 a 120 px.</p>
        <div style="display:flex;gap:20px;align-items:flex-end;flex-wrap:wrap">
          @for (s of sizes; track s) {
            <div style="display:flex;flex-direction:column;align-items:center;gap:8px">
              <rama-avatar initials="SE" [size]="s" /><code>{{ s }} · {{ px[s] }}px</code>
            </div>
          }
        </div>
      </div>`,
  }),
};
