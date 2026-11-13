import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';
import { BreadcrumbItem, RamaBreadcrumb } from '../../lib/breadcrumb/breadcrumb.component';

const ruta: BreadcrumbItem[] = [
  { label: 'Inicio', icon: 'home-1' },
  { label: 'Integridad operativa' },
  { label: 'Rondas' },
  { label: 'Rondas por realizar' },
];

const meta: Meta<RamaBreadcrumb> = {
  title: 'Moléculas/Breadcrumb',
  component: RamaBreadcrumb,
  decorators: [moduleMetadata({ imports: [RamaBreadcrumb] })],
  parameters: { layout: 'padded' },
  args: { items: ruta },
};
export default meta;

export const Playground: StoryObj<RamaBreadcrumb> = {
  render: (args) => ({ props: args, template: `<rama-breadcrumb [items]="items" />` }),
};

export const Niveles: StoryObj<RamaBreadcrumb> = {
  name: 'Niveles y estados',
  render: () => ({
    props: {
      niveles: [1, 2, 3, 4].map(n => ruta.slice(0, n)),
      conIconos: ruta.map(i => ({ ...i, icon: 'home-1' })),
      ruta,
    },
    template: `
      <div class="sb-doc" style="display:flex;flex-direction:column;gap:20px">
        <p class="sb-lead" style="margin:0">De 1 a 4 niveles. Los elementos anteriores son enlaces (texto medio, gris); el último es la página actual (negrita, <code>aria-current="page"</code>). En hover el enlace pasa a negrita en color primario. El ícono es opcional en cada nivel.</p>
        @for (n of niveles; track $index) { <rama-breadcrumb [items]="n" /> }
        <div><code>hover</code> &nbsp; <rama-breadcrumb class="is-hover" [items]="ruta" /></div>
        <div><code>ícono en todos los niveles (como en Figma)</code> &nbsp; <rama-breadcrumb [items]="conIconos" /></div>
      </div>`,
  }),
};
