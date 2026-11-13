import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';
import { RamaCard } from '../../lib/card/card.component';
import { RamaButton } from '../../lib/button/button.component';

const slot = `<div style="height:124px;border:var(--rama-border-width-thin) dashed var(--rama-border-info);background:var(--rama-information-surface);border-radius:var(--rama-radius-small)"></div>`;
const actions = (disabled = false) => `
  <rama-button card-actions variant="outlined" size="xs" trailIcon="add" [disabled]="${disabled}">Agregar</rama-button>
  <rama-button card-actions variant="ghost" size="xs" [iconOnly]="true" leadIcon="add" ariaLabel="Agregar elemento" [disabled]="${disabled}" />`;

const meta: Meta<RamaCard> = {
  title: 'Moléculas/Card',
  component: RamaCard,
  decorators: [moduleMetadata({ imports: [RamaCard, RamaButton] })],
  parameters: { layout: 'padded' },
  argTypes: { size: { control: 'inline-radio', options: ['small', 'large'] } },
  args: { cardTitle: 'Rondas por realizar', info: 'Turno A8 06-14', size: 'small', interactive: false, disabled: false },
};
export default meta;

export const Playground: StoryObj<RamaCard> = {
  render: (args) => ({
    props: args,
    template: `<rama-card style="max-width:555px" [cardTitle]="cardTitle" [info]="info" [size]="size" [interactive]="interactive" [disabled]="disabled">${actions()}${slot}</rama-card>`,
  }),
};

export const Anchos: StoryObj<RamaCard> = {
  name: 'Anchos (variantes Figma)',
  render: () => ({
    props: {
      items: [
        { w: 555, size: 'small', title: 'Rondas por realizar' },
        { w: 848, size: 'small', title: 'Directrices por leer' },
        { w: 1141, size: 'large', title: 'Desviaciones corregidas' },
        { w: 1435, size: 'large', title: 'Cumplimiento de rondas por estación' },
        { w: 1728, size: 'large', title: 'Violaciones VOI estándar y críticas' },
      ],
    },
    template: `
      <div class="sb-doc" style="display:flex;flex-direction:column;gap:24px">
        <p class="sb-lead">"Card in Slot": título, texto de información y acciones a la derecha, y un slot libre (zona punteada). Las cinco variantes de Figma solo cambian el ancho (555 → 1728 px); desde 1141 px el título pasa a Semi Bold 16 (<code>size="large"</code>). El ancho lo pone la grilla donde se usa; aquí se limita con <code>max-width</code> y se adapta en pantallas angostas.</p>
        @for (c of items; track c.w) {
          <rama-card [style.max-width.px]="c.w" [size]="c.size" [cardTitle]="c.title" info="Turno A8 06-14">${actions()}${slot}</rama-card>
        }
      </div>`,
  }),
};

export const Estados: StoryObj<RamaCard> = {
  render: () => ({
    template: `
      <div class="sb-doc">
        <p class="sb-lead">Solo las tarjetas <code>interactive</code> tienen hover y focus. Figma rotula Hover, Focus y Disabled pero no los dibuja; se completaron con tokens: hover = <code>--rama-shadow-small</code> + borde primario, focus = <code>--rama-focus-ring</code>, disabled = <code>--rama-bg-subtle</code>, <code>--rama-border-disabled</code> y <code>--rama-text-disabled</code> (el contenido queda inerte).</p>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,420px),1fr));gap:20px">
          <rama-card cardTitle="Default" info="Turno A8 06-14">${actions()}${slot}</rama-card>
          <rama-card class="is-hover" [interactive]="true" cardTitle="Hover" info="Turno A8 06-14">${actions()}${slot}</rama-card>
          <rama-card class="is-focus" [interactive]="true" cardTitle="Focus" info="Turno A8 06-14">${actions()}${slot}</rama-card>
          <rama-card [disabled]="true" cardTitle="Disabled" info="Turno A8 06-14">${actions(true)}${slot}</rama-card>
        </div>
      </div>`,
  }),
};
