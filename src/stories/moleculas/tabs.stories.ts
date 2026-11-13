import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';
import { RamaTabs, TabItem } from '../../lib/tabs/tabs.component';

const principal: TabItem[] = [
  { label: 'Por realizar', icon: 'add', count: 4, dot: true },
  { label: 'Por finalizar', icon: 'add', count: 2, dot: true },
  { label: 'Finalizadas', icon: 'add', count: 9 },
  { label: 'Archivadas', icon: 'add', count: 0, disabled: true },
];
const soloTexto: TabItem[] = [{ label: 'Por realizar' }, { label: 'Por finalizar' }, { label: 'Finalizadas' }];
const secundaria: TabItem[] = [
  { label: 'Seguridad de procesos' }, { label: 'Integridad' }, { label: 'Disponibilidad' },
];

const meta: Meta<RamaTabs> = {
  title: 'Moléculas/Tabs',
  component: RamaTabs,
  decorators: [moduleMetadata({ imports: [RamaTabs] })],
  parameters: { layout: 'padded' },
  argTypes: { variant: { control: 'inline-radio', options: ['primary', 'secondary'] } },
  args: { variant: 'primary', tabs: principal, selected: 0, ariaLabel: 'Estados de ronda' },
};
export default meta;

export const Playground: StoryObj<RamaTabs> = {
  render: (args) => ({
    props: { ...args },
    template: `
      <rama-tabs [tabs]="tabs" [variant]="variant" [(selected)]="selected" [ariaLabel]="ariaLabel">
        <p style="font:14px/1.5 var(--rama-font);color:var(--rama-text-muted);padding:16px 4px">Contenido de «{{ tabs[selected].label }}». Usa las flechas, Inicio y Fin para moverte entre pestañas.</p>
      </rama-tabs>`,
  }),
};

export const Principal: StoryObj<RamaTabs> = {
  name: 'Principal · estados',
  render: () => ({
    props: {
      principal, soloTexto,
      estados: ['Enable', 'Hover', 'Pressed', 'Disabled'].map(s => ({ label: s, icon: 'add', count: 2, dot: true, disabled: s === 'Disabled' })),
    },
    template: `
      <div class="sb-doc">
        <p class="sb-lead">Pestaña con borde, 181px de ancho mínimo y 40px de alto (36px solo con texto). Ícono, contador y punto son opcionales. Pressed (seleccionada): borde y texto en primary-700 y contador sobre information surface. Disabled: borde disabled y texto, ícono, contador y punto en text-disabled.</p>
        <h2>Estados (Enable · Hover · Pressed · Disabled)</h2>
        <rama-tabs class="is-hover" [tabs]="estados" [selected]="2" ariaLabel="Estados" />
        <h2>En grupo</h2>
        <p class="sb-lead">Debajo, la segunda pestaña aparece fija en hover y en focus; la cuarta está deshabilitada.</p>
        <div style="display:flex;flex-direction:column;gap:16px">
          <rama-tabs [tabs]="principal" ariaLabel="Default" />
          <rama-tabs class="is-hover" [tabs]="principal" ariaLabel="Hover" />
          <rama-tabs class="is-focus" [tabs]="principal" ariaLabel="Focus" />
        </div>
        <h2>Solo texto</h2>
        <rama-tabs [tabs]="soloTexto" ariaLabel="Solo texto" />
      </div>`,
  }),
};

export const Secundaria: StoryObj<RamaTabs> = {
  name: 'Secundaria (subrayado)',
  render: () => ({
    props: {
      sets: [1, 2, 3, 4, 5].map(n => [...secundaria, { label: 'Reportes' }, { label: 'Ajustes' }].slice(0, n)),
      completa: [
        { label: 'Seguridad', icon: 'add', dot: true, count: 2 },
        { label: 'Integridad', icon: 'add', dot: true, count: 2 },
        { label: 'Disponibilidad', icon: 'add', dot: true, count: 2 },
      ] as TabItem[],
      conDeshabilitada: [
        { label: 'Seguridad', icon: 'add', dot: true, count: 2 },
        { label: 'Integridad', icon: 'add', dot: true, count: 2 },
        { label: 'Disponibilidad', icon: 'add', dot: true, count: 2, disabled: true },
      ] as TabItem[],
    },
    template: `
      <div class="sb-doc" style="display:flex;flex-direction:column;gap:16px">
        <p class="sb-lead" style="margin:0">De 1 a 5 pestañas de 181px. Padding 12px; la seleccionada (Pressed) lleva subrayado de 2px en border-primary y texto semibold default-black; en hover el fondo pasa a inset.</p>
        @for (s of sets; track $index) { <rama-tabs variant="secondary" [tabs]="s" ariaLabel="Secciones" /> }
        <p class="sb-lead" style="margin:16px 0 0">Con ícono, punto y contador opcionales (". Item Tab" de Figma; la segunda pestaña fija en hover)</p>
        <rama-tabs variant="secondary" [tabs]="completa" ariaLabel="Secciones con contador" />
        <rama-tabs class="is-hover" variant="secondary" [tabs]="completa" ariaLabel="Secciones con contador, hover" />
        <p class="sb-lead" style="margin:16px 0 0">Deshabilitada (no está en Figma; completada con tokens como la principal): texto, ícono y punto en text-disabled, contador sobre bg-subtle y subrayado en border-disabled.</p>
        <rama-tabs variant="secondary" [tabs]="conDeshabilitada" ariaLabel="Secciones con una deshabilitada" />
      </div>`,
  }),
};
