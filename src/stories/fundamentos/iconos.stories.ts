import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';
import { RamaIcon } from '../../lib/icon/icon.component';
import { icons } from '../../lib/icon/icons';
import { generatedIcons } from '../../lib/icon/icons.generated';

const names = Object.keys(icons).sort();
const fromFigma = Object.keys(generatedIcons).length;

const meta: Meta<RamaIcon> = {
  title: 'Fundamentos/Íconos',
  component: RamaIcon,
  decorators: [moduleMetadata({ imports: [RamaIcon] })],
  parameters: { layout: 'padded' },
  argTypes: {
    name: { control: 'select', options: names },
    size: { control: { type: 'range', min: 12, max: 48, step: 2 } },
    strokeWidth: { control: { type: 'range', min: 1, max: 2.5, step: 0.1 } },
  },
  args: { name: 'search', size: 24, strokeWidth: 1.6 },
};
export default meta;

export const Icono: StoryObj<RamaIcon> = {
  render: (args) => ({ props: args, template: `<rama-icon [name]="name" [size]="size" [strokeWidth]="strokeWidth" style="color:var(--rama-primary-400)" />` }),
};

export const Galeria: StoryObj<RamaIcon> = {
  name: 'Galería',
  render: (args) => ({
    props: { ...args, names, fromFigma },
    template: `
      <div class="sb-doc">
        <h2>Íconos</h2>
        <p class="sb-lead">
          @if (fromFigma) { {{ fromFigma }} íconos importados desde Figma. }
          @else { Set provisional: son los íconos del wireframe REVO. Para usar los de la página "1.3 Iconos" de Figma, expórtalos como SVG a <code>public/icons/</code> y corre <code>npm run icons</code>. }
          Uso: <code>&lt;rama-icon name="search" [size]="16" /&gt;</code>. El color hereda de <code>color</code>.
        </p>
        <div class="sb-grid-tiles">
          @for (n of names; track n) {
            <div class="sb-tile"><rama-icon [name]="n" [size]="size" [strokeWidth]="strokeWidth" /><code>{{ n }}</code></div>
          }
        </div>
      </div>`,
  }),
};
