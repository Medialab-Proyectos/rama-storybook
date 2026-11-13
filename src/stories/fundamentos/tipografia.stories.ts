import type { Meta, StoryObj } from '@storybook/angular-vite';
import { fontWeights, letterSpacings, responsiveText, textStyles } from '../../tokens/tokens';

const weights = Object.entries(fontWeights).filter(([k]) => k !== 'heavy').map(([name, value]) => ({ name, value }));

const meta: Meta = {
  title: 'Fundamentos/Tipografía',
  parameters: { layout: 'padded' },
  argTypes: {
    weight: { control: 'select', options: weights.map(w => w.name) },
    spacing: { control: 'select', options: Object.keys(letterSpacings) },
    sample: { control: 'text' },
  },
  args: { weight: 'regular', spacing: '0%', sample: 'Integridad operativa REVO' },
};
export default meta;

type Args = { weight: string; spacing: string; sample: string };

export const Escala: StoryObj<Args> = {
  render: (args) => ({
    props: { ...args, styles: textStyles, weightValue: fontWeights[args.weight], ls: letterSpacings[args.spacing] },
    template: `
      <div class="sb-doc">
        <h2>Escala tipográfica · Inter</h2>
        <p class="sb-lead">Cada estilo existe en pesos 300 a 700 y con interletrado de -2 % a 2 %. Cámbialos con los controles. En código se usan las clases <code>.rama-h1</code> … <code>.rama-c2</code> combinadas con <code>.rama-w-*</code>.</p>
        <table class="sb-table">
          <thead><tr><th style="width:200px">Estilo</th><th style="width:150px">Tamaño / interlineado</th><th>Muestra</th></tr></thead>
          <tbody>
            @for (s of styles; track s.key) {
              <tr>
                <td><b>{{ s.label }}</b><br><code>.rama-{{ s.key }}</code></td>
                <td>{{ s.size }}px / {{ s.lineHeight }}px</td>
                <td><div [class]="'rama-' + s.key" [style.font-weight]="weightValue" [style.letter-spacing.em]="ls"
                  style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:900px">{{ sample }}</div></td>
              </tr>
            }
          </tbody>
        </table>
      </div>`,
  }),
};

export const Pesos: StoryObj<Args> = {
  render: (args) => ({
    props: { ...args, weights },
    template: `
      <div class="sb-doc">
        <h2>Pesos</h2>
        <p class="sb-lead">Variables <code>--rama-weight-*</code>. Existe también <i>heavy</i> (900), que no se usa en los estilos de texto.</p>
        @for (w of weights; track w.name) {
          <div style="display:flex;align-items:baseline;gap:24px;padding:12px 0;border-bottom:1px solid var(--rama-border-inset)">
            <code style="width:170px">--rama-weight-{{ w.name }}</code>
            <span style="width:40px;color:var(--rama-text-muted)">{{ w.value }}</span>
            <span class="rama-b1" [style.font-weight]="w.value">{{ sample }}</span>
          </div>
        }
      </div>`,
  }),
};

export const Responsive: StoryObj<Args> = {
  name: 'Responsive (móvil ≤ 440px)',
  render: (args) => ({
    props: { ...args, rows: responsiveText },
    template: `
      <div class="sb-doc">
        <h2>Tamaños en móvil</h2>
        <p class="sb-lead">Colección <b>Responsive</b> (device size 440). Las clases <code>.rama-*</code> cambian a estos tamaños con un media query de 440px.</p>
        <table class="sb-table">
          <thead><tr><th style="width:200px">Estilo</th><th style="width:150px">Tamaño / interlineado</th><th>Muestra</th></tr></thead>
          <tbody>
            @for (r of rows; track r.label) {
              <tr><td><b>{{ r.label }}</b></td><td>{{ r.size }}px / {{ r.lineHeight }}px</td>
                <td><span [style.font-size.px]="r.size" [style.line-height.px]="r.lineHeight">{{ sample }}</span></td></tr>
            }
          </tbody>
        </table>
      </div>`,
  }),
};
