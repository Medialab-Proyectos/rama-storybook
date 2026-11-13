import type { Meta, StoryObj } from '@storybook/angular-vite';
import { aliasPalettes, mapped, okrs, palettes, themes, transparencyLevels } from '../../tokens/tokens';

function onColor(hex: string): string {
  const h = hex.replace('#', '').slice(0, 6);
  const [r, g, b] = [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16) / 255)
    .map(c => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.4 ? '#161619' : '#ffffff';
}

const toSteps = (name: string, scale: Record<string, string>) =>
  Object.entries(scale).map(([step, hex]) => ({ step, hex, on: onColor(hex), variable: `--rama-${name}-${step}` }));

const themeRamps = Object.values(themes).map(t => ({ name: `primary · ${t.label}`, alias: undefined, steps: toSteps('primary', t.primary) }));

const ramps = [
  ...themeRamps,
  ...Object.entries(palettes).filter(([name]) => name !== 'primary').map(([name, scale]) => ({
    name,
    alias: Object.entries(aliasPalettes).find(([, p]) => p === name)?.[0],
    steps: toSteps(name, scale),
  })),
];

const swatches = (group: Record<string, string>, prefix: string) =>
  Object.entries(group).map(([k, hex]) => ({ name: k, hex, variable: `--rama-${prefix}-${k}` }));

const semantic = Object.entries(mapped.semantic).map(([group, roles]) => ({
  group, roles: Object.entries(roles).map(([role, hex]) => ({ role, hex, variable: `--rama-${group}-${role}` })),
}));

const meta: Meta = {
  title: 'Fundamentos/Colores',
  parameters: { layout: 'padded' },
};
export default meta;

export const Paletas: StoryObj = {
  render: () => ({
    props: { ramps },
    template: `
      <div class="sb-doc">
        <h2>Paletas de marca</h2>
        <p class="sb-lead">Colección <b>Brand</b>. El tono 400 de Primary es el color principal y es lo único que cambia entre los dos modos del archivo: <b>Rama</b> (azul, el que usan los componentes) y <b>Ecopetrol</b> (verde). Cámbialo con el selector "Tema" de la barra superior. Las paletas de soporte tienen un alias semántico (error, warning, caution, success, information).</p>
        @for (r of ramps; track r.name) {
          <h2 style="font-size:15px;margin-top:20px">{{ r.name }} @if (r.alias) { <code>alias: {{ r.alias }}</code> }</h2>
          <div class="sb-ramp">
            @for (s of r.steps; track s.step) {
              <div class="sb-ramp-step" [style.background]="s.hex" [style.color]="s.on" [title]="s.variable">
                <b>{{ s.step }}</b><span>{{ s.hex }}</span>
              </div>
            }
          </div>
        }
      </div>`,
  }),
};

export const Semanticos: StoryObj = {
  name: 'Semánticos (Mapped)',
  render: () => ({
    props: { text: swatches(mapped.text, 'text'), bg: swatches(mapped.background, 'bg'), border: swatches(mapped.border, 'border'), semantic },
    template: `
      <div class="sb-doc">
        <h2>Texto</h2>
        <p class="sb-lead">Colección <b>Mapped</b>: los componentes usan estos tokens, nunca los hex directos.</p>
        <div class="sb-swatches">
          @for (s of text; track s.name) {
            <div class="sb-swatch"><div class="sb-swatch-color sb-checker"><div style="height:100%" [style.background]="s.hex"></div></div>
              <div class="sb-swatch-meta"><div><b>{{ s.name }}</b></div><div><code>{{ s.variable }}</code></div><div>{{ s.hex }}</div></div></div>
          }
        </div>
        <h2>Fondos</h2>
        <div class="sb-swatches">
          @for (s of bg; track s.name) {
            <div class="sb-swatch"><div class="sb-swatch-color" [style.background]="s.hex"></div>
              <div class="sb-swatch-meta"><div><b>{{ s.name }}</b></div><div><code>{{ s.variable }}</code></div><div>{{ s.hex }}</div></div></div>
          }
        </div>
        <h2>Estados (surface · fill · on fill)</h2>
        <p class="sb-lead">Surface es el fondo suave de alertas y badges; fill es el color de relleno o acento; on fill es el texto sobre surface.</p>
        @for (g of semantic; track g.group) {
          <h2 style="font-size:15px;margin-top:16px">{{ g.group }}</h2>
          <div class="sb-swatches">
            @for (r of g.roles; track r.role) {
              <div class="sb-swatch"><div class="sb-swatch-color" [style.background]="r.hex"></div>
                <div class="sb-swatch-meta"><div><b>{{ r.role }}</b></div><div><code>{{ r.variable }}</code></div><div>{{ r.hex }}</div></div></div>
            }
          </div>
        }
        <h2>Bordes</h2>
        <div class="sb-swatches">
          @for (s of border; track s.name) {
            <div class="sb-swatch"><div class="sb-swatch-color" style="background:#fff" [style.box-shadow]="'inset 0 0 0 3px ' + s.hex"></div>
              <div class="sb-swatch-meta"><div><b>{{ s.name }}</b></div><div><code>{{ s.variable }}</code></div><div>{{ s.hex }}</div></div></div>
          }
        </div>
      </div>`,
  }),
};

export const Transparencias: StoryObj = {
  render: () => ({
    props: { levels: transparencyLevels },
    template: `
      <div class="sb-doc">
        <h2>Transparencias</h2>
        <p class="sb-lead">Negro base (#161619) y blanco en opacidades de 5 a 90 %. Se usan en overlays (scrim de modales) y textos de contraste.</p>
        <div class="sb-ramp sb-checker">
          @for (l of levels; track l) {
            <div class="sb-ramp-step" [style.background]="'var(--rama-black-' + l + ')'" [style.color]="l >= 50 ? '#fff' : '#161619'"><b>{{ l }}%</b><span>--rama-black-{{ l }}</span></div>
          }
        </div>
        <div class="sb-ramp" style="background:#161619">
          @for (l of levels; track l) {
            <div class="sb-ramp-step" [style.background]="'var(--rama-white-' + l + ')'" [style.color]="l >= 50 ? '#161619' : '#fff'"><b>{{ l }}%</b><span>--rama-white-{{ l }}</span></div>
          }
        </div>
      </div>`,
  }),
};

export const OKRs: StoryObj = {
  render: () => ({
    props: { okr: swatches(okrs, 'okr') },
    template: `
      <div class="sb-doc">
        <h2>Colores OKR</h2>
        <p class="sb-lead">Fondos pastel para categorizar objetivos y elementos en tableros.</p>
        <div class="sb-swatches">
          @for (s of okr; track s.name) {
            <div class="sb-swatch"><div class="sb-swatch-color" [style.background]="s.hex"></div>
              <div class="sb-swatch-meta"><div><b>{{ s.name }}</b></div><div><code>{{ s.variable }}</code></div><div>{{ s.hex }}</div></div></div>
          }
        </div>
      </div>`,
  }),
};
