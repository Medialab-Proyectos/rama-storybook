import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';
import { RamaButton } from '../../lib/button/button.component';

const variants = ['filled', 'outlined', 'ghost'];
const sizes = ['xs', 'small', 'medium', 'large', 'xl'];
const states = [
  { label: 'Default', cls: '', disabled: false },
  { label: 'Hover', cls: 'is-hover', disabled: false },
  { label: 'Pressed', cls: 'is-pressed', disabled: false },
  { label: 'Focus', cls: 'is-focus', disabled: false },
  { label: 'Disabled', cls: '', disabled: true },
];

type Args = RamaButton & { label: string };

const meta: Meta<Args> = {
  title: 'Átomos/Button',
  component: RamaButton,
  decorators: [moduleMetadata({ imports: [RamaButton] })],
  parameters: { layout: 'padded' },
  argTypes: {
    variant: { control: 'inline-radio', options: variants },
    size: { control: 'inline-radio', options: sizes },
    leadIcon: { control: 'select', options: [undefined, 'info-circle', 'dot', 'plus', 'download', 'search'] },
    trailIcon: { control: 'select', options: [undefined, 'arrow-down', 'dot', 'chevron-right'] },
  },
  args: { label: 'Click to action', variant: 'filled', size: 'medium', disabled: false, leadIcon: 'info-circle', trailIcon: 'arrow-down' },
};
export default meta;

export const Playground: StoryObj<Args> = {
  render: (args) => ({
    props: args,
    template: `<rama-button [variant]="variant" [size]="size" [disabled]="disabled" [leadIcon]="leadIcon" [trailIcon]="trailIcon">{{ label }}</rama-button>`,
  }),
};

export const Estados: StoryObj<Args> = {
  name: 'Tipos × estados',
  render: (args) => ({
    props: { ...args, variants, states },
    template: `
      <div class="sb-doc">
        <p class="sb-lead">Filled para la acción principal, Outlined para la secundaria y Ghost para acciones terciarias o dentro de tablas. Hover, Pressed y Focus salen solos con el mouse y el teclado; aquí se muestran fijos.</p>
        <table class="sb-table" style="width:auto">
          <thead><tr><th></th>@for (s of states; track s.label) { <th>{{ s.label }}</th> }</tr></thead>
          <tbody>
            @for (v of variants; track v) {
              <tr><td><b>{{ v }}</b></td>
                @for (s of states; track s.label) {
                  <td><rama-button [class]="s.cls" [variant]="v" [size]="size" [disabled]="s.disabled" leadIcon="info-circle" trailIcon="arrow-down">{{ label }}</rama-button></td>
                }
              </tr>
            }
          </tbody>
        </table>
      </div>`,
  }),
};

export const Tamanos: StoryObj<Args> = {
  name: 'Tamaños',
  render: (args) => ({
    props: { ...args, sizes, heights: { xs: 36, small: 40, medium: 44, large: 48, xl: 56 } as Record<string, number> },
    template: `
      <div class="sb-doc">
        <p class="sb-lead">XS y Small usan texto de 14px; Medium y Large, 16px; XL, 18px. Íconos de 20px (24px en Large y XL); separación 8 · 8 · 10 · 12 · 12px.</p>
        <div style="display:flex;align-items:flex-end;gap:16px;flex-wrap:wrap">
          @for (s of sizes; track s) {
            <div style="display:flex;flex-direction:column;align-items:center;gap:8px">
              <rama-button [variant]="variant" [size]="s" leadIcon="info-circle" trailIcon="arrow-down">{{ label }}</rama-button>
              <code>{{ s }} · {{ heights[s] }}px</code>
            </div>
          }
        </div>
      </div>`,
  }),
};

export const Iconos: StoryObj<Args> = {
  name: 'Ícono, punto e ícono solo',
  render: (args) => ({
    props: { ...args, variants },
    template: `
      <div class="sb-doc" style="display:flex;flex-direction:column;gap:16px">
        @for (v of variants; track v) {
          <div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap">
            <rama-button [variant]="v" leadIcon="info-circle">Lead icon</rama-button>
            <rama-button [variant]="v" trailIcon="arrow-down">Trail icon</rama-button>
            <rama-button [variant]="v" leadIcon="dot">Lead dot</rama-button>
            <rama-button [variant]="v" trailIcon="dot">Trail dot</rama-button>
            <rama-button [variant]="v">Solo texto</rama-button>
            <rama-button [variant]="v" leadIcon="info-circle" [iconOnly]="true" ariaLabel="Información" />
          </div>
        }
      </div>`,
  }),
};
