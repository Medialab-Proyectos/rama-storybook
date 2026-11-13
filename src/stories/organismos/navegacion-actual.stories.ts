import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';
import { RamaSidebarLegacy } from '../../lib/sidebar/sidebar-legacy.component';
import { RamaTopbarLegacy } from '../../lib/topbar/topbar-legacy.component';

const meta: Meta = {
  title: 'Organismos/Menú y Sidebar · versión actual',
  decorators: [moduleMetadata({ imports: [RamaTopbarLegacy, RamaSidebarLegacy] })],
  parameters: { layout: 'fullscreen' },
};
export default meta;

export const Topbar: StoryObj = {
  name: 'Topbar',
  render: () => ({
    template: `
      <rama-topbar-legacy />
      <p class="sb-lead" style="padding:16px 24px">Versión que usa hoy la plataforma (wireframe "Dashboard de gestión por rol"): barra gris de 80px,
        hamburguesa azul, "Búsquedas Personalizadas", enlaces de texto, usuario y accesos de calendario, galería y pantalla.
        La versión nueva de Figma está en <b>Organismos / Menú y Sidebar</b>.</p>`,
  }),
};

export const MenuLateral: StoryObj = {
  name: 'Menú lateral',
  render: () => ({
    props: { open: true },
    template: `
      <div style="padding:24px"><button type="button" (click)="open = true" style="padding:8px 14px;border:1px solid var(--rama-border-inset);border-radius:8px;background:white;cursor:pointer">Abrir menú</button></div>
      <rama-sidebar-legacy [(open)]="open" />`,
  }),
};

export const MenuCompleto: StoryObj = {
  name: 'Menú completo',
  render: () => ({
    props: { open: false },
    template: `
      <div style="min-height:100vh;background:var(--rama-bg-subtle)">
        <rama-topbar-legacy (menuClick)="open = true" />
        <p class="sb-lead" style="padding:24px">Usa la hamburguesa azul para abrir el menú lateral.</p>
        <rama-sidebar-legacy [(open)]="open" />
      </div>`,
  }),
};
