import type { Meta, StoryObj } from '@storybook/angular-vite';
import { blur, shadows } from '../../tokens/tokens';

const meta: Meta = { title: 'Fundamentos/Sombras y desenfoques', parameters: { layout: 'padded' } };
export default meta;

export const Sombras: StoryObj = {
  name: '1.4 Sombras / Elevaciones',
  render: () => ({
    props: { items: Object.entries(shadows).map(([name, value]) => ({ name, value })) },
    template: `
      <div class="sb-doc" style="background:var(--rama-bg-subtle);padding:24px">
        <h2>Sombras / Elevaciones</h2>
        <p class="sb-lead">Variables <code>--rama-shadow-*</code>. Cuanto más alta la elevación, más difusa la sombra: <i>small</i> para tarjetas, <i>large</i> para menús y drawers, <i>2x-large</i> para modales.</p>
        <div class="sb-grid-tiles" style="grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:32px">
          @for (s of items; track s.name) {
            <div style="background:#fff;border-radius:12px;height:120px;padding:16px;display:flex;flex-direction:column;justify-content:flex-end" [style.box-shadow]="s.value">
              <b>{{ s.name }}</b><code style="margin-top:6px;font-size:10.5px;white-space:normal">--rama-shadow-{{ s.name }}</code>
            </div>
          }
        </div>
      </div>`,
  }),
};

export const Desenfoques: StoryObj = {
  name: '1.5 Blurs / Desenfoques',
  render: () => ({
    props: { items: Object.entries(blur).map(([name, value]) => ({ name, value })) },
    template: `
      <div class="sb-doc">
        <h2>Desenfoques</h2>
        <p class="sb-lead">Variables <code>--rama-blur-*</code>, para <code>backdrop-filter: blur()</code> en overlays y paneles translúcidos. Cada tarjeta muestra el desenfoque sobre la misma figura.</p>
        <div class="sb-grid-tiles" style="grid-template-columns:repeat(auto-fill,minmax(180px,1fr))">
          @for (b of items; track b.name) {
            <div class="sb-tile" style="padding:0;overflow:hidden">
              <div style="position:relative;width:100%;height:120px;background:var(--rama-bg-subtle)">
                <div style="position:absolute;inset:30px 40px;border-radius:50%;background:linear-gradient(135deg,var(--rama-primary-300),var(--rama-blue-400),var(--rama-yellow-300))"></div>
                <div style="position:absolute;inset:0;background:var(--rama-white-20)" [style.backdrop-filter]="'blur(var(--rama-blur-' + b.name + '))'"></div>
              </div>
              <div style="padding:10px"><b>{{ b.name }}</b> · radio {{ b.value }} (CSS {{ b.value / 2 }}px)<br><code>--rama-blur-{{ b.name }}</code></div>
            </div>
          }
        </div>
      </div>`,
  }),
};
