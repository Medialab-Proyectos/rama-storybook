import type { Meta, StoryObj } from '@storybook/angular-vite';
import { borderWidth, grids, radius, spacing } from '../../tokens/tokens';

const meta: Meta = { title: 'Fundamentos/Espacios, grillas y bordes', parameters: { layout: 'padded' } };
export default meta;

export const Espacios: StoryObj = {
  name: '1.6 Sistema de espacios',
  render: () => ({
    props: { spacing },
    template: `
      <div class="sb-doc">
        <h2>Sistema de espacios</h2>
        <p class="sb-lead">Escala de 4 a 256 px (variables <code>--rama-space-*</code>). Úsala para padding, gap y márgenes; los valores intermedios 10 y 14 existen para ajustes finos de componentes.</p>
        <table class="sb-table">
          <thead><tr><th style="width:180px">Token</th><th style="width:80px">Valor</th><th>Muestra</th></tr></thead>
          <tbody>
            @for (s of spacing; track s) {
              <tr><td><code>--rama-space-{{ s }}</code></td><td>{{ s }}px</td>
                <td><div style="height:16px;background:var(--rama-primary-300);border-radius:2px" [style.width.px]="s"></div></td></tr>
            }
          </tbody>
        </table>
      </div>`,
  }),
};

export const Grillas: StoryObj = {
  name: '1.7 Grid / Grillas',
  render: () => ({
    props: { grids: grids.map(g => ({ ...g, cols: Array.from({ length: g.columns }) })) },
    template: `
      <div class="sb-doc">
        <h2>Grillas</h2>
        <p class="sb-lead">Grillas de columnas para desktop (lienzo de 1440px), con gutter de 32px. La de 12 columnas con padding deja 112px de margen a cada lado.</p>
        @for (g of grids; track g.name) {
          <h2 style="font-size:14px;margin-top:20px">{{ g.name }} <code>{{ g.columns }} col · gutter {{ g.gutter }} · margen {{ g.offset }}</code></h2>
          <div style="background:var(--rama-bg-subtle);border:1px solid var(--rama-border-inset);border-radius:8px;height:72px;display:grid"
            [style.grid-template-columns]="'repeat(' + g.columns + ', 1fr)'" [style.column-gap]="(g.gutter / 1440 * 100) + '%'"
            [style.padding]="'0 ' + (g.offset / 1440 * 100) + '%'">
            @for (c of g.cols; track $index) { <div style="background:var(--rama-red-50);border-left:1px solid var(--rama-red-200);border-right:1px solid var(--rama-red-200)"></div> }
          </div>
        }
      </div>`,
  }),
};

export const Bordes: StoryObj = {
  name: '1.8 Border radius / width',
  render: () => ({
    props: { radius: Object.entries(radius).map(([n, v]) => ({ n, v })), widths: Object.entries(borderWidth).map(([n, v]) => ({ n, v })) },
    template: `
      <div class="sb-doc">
        <h2>Border radius</h2>
        <p class="sb-lead">Variables <code>--rama-radius-*</code>. <i>small</i> (8px) es el radio por defecto de botones e inputs; <i>large</i> para tarjetas; <i>full</i> para pills y avatares.</p>
        <div class="sb-grid-tiles">
          @for (r of radius; track r.n) {
            <div class="sb-tile"><div style="width:80px;height:80px;background:var(--rama-primary-100);border:2px solid var(--rama-primary-400)" [style.border-radius.px]="r.v"></div>
              <b>{{ r.n }} · {{ r.v }}px</b><code>--rama-radius-{{ r.n }}</code></div>
          }
        </div>
        <h2>Border width</h2>
        <p class="sb-lead">Variables <code>--rama-border-width-*</code>.</p>
        <div class="sb-grid-tiles">
          @for (w of widths; track w.n) {
            <div class="sb-tile"><div style="width:80px;height:56px;border-radius:8px;border-style:solid;border-color:var(--rama-text-default-black)" [style.border-width.px]="w.v"></div>
              <b>{{ w.n }} · {{ w.v }}px</b><code>--rama-border-width-{{ w.n }}</code></div>
          }
        </div>
      </div>`,
  }),
};
