import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';
import { RamaSidebar } from '../../lib/sidebar/sidebar.component';
import { RamaTopbar } from '../../lib/topbar/topbar.component';

const meta: Meta = {
  title: 'Organismos/Menú y Sidebar',
  decorators: [moduleMetadata({ imports: [RamaTopbar, RamaSidebar] })],
  parameters: { layout: 'fullscreen' },
};
export default meta;

const canvas = (body: string) => `<div style="min-height:100vh;background:var(--rama-bg-subtle);padding:24px;box-sizing:border-box">${body}</div>`;

export const Sidebar: StoryObj = {
  name: 'Sidebar',
  render: () => ({
    props: { active: null as string | null },
    template: canvas(`
      <p class="sb-lead">Figma 2 Menu / Sidebar navigator [NEW] · Status=Default. Elige un módulo para abrir su menú; escribe en el buscador para la búsqueda rápida.</p>
      <rama-sidebar [(activeModule)]="active" />`),
  }),
};

export const SidebarAbierto: StoryObj = {
  name: 'Sidebar · menú abierto',
  render: () => ({
    props: { active: 'Administrador' },
    template: canvas(`<rama-sidebar [(activeModule)]="active" />`),
  }),
};

export const SidebarBusqueda: StoryObj = {
  name: 'Sidebar · búsqueda rápida',
  render: () => ({
    props: { q: 'Mejoras' },
    template: canvas(`
      <p class="sb-lead">Status=Search link: resultados agrupados por "Módulo -> Sección". Borra el texto para ver los módulos o escribe otra palabra (p. ej. "Plantillas").</p>
      <rama-sidebar [(query)]="q" />`),
  }),
};

export const Topbar: StoryObj = {
  name: 'Topbar · tamaños',
  render: () => ({
    template: canvas(`
      <p class="sb-lead">Figma Top Bar · Size=1728 / 1024 / 744 / 440. El topbar se adapta a su propio ancho.</p>
      @for (w of [1728, 1024, 744, 440]; track w) {
        <p class="sb-lead" style="margin:24px 0 8px"><code>{{ w }}px</code></p>
        <div [style.width.px]="w" style="max-width:100%"><rama-topbar /></div>
      }`),
  }),
};

export const TopbarSubmenu: StoryObj = {
  name: 'Topbar · entradas rápidas',
  render: () => ({
    props: { open: true, width: 1728 },
    template: canvas(`
      <div style="display:flex;gap:8px;margin-bottom:16px">
        @for (w of [1728, 1024, 744, 440]; track w) {
          <button type="button" (click)="$event.stopPropagation(); width = w; open = true" style="padding:6px 12px;border:1px solid var(--rama-border-default);border-radius:8px;background:white;cursor:pointer">{{ w }}px</button>
        }
      </div>
      <div [style.width.px]="width" style="max-width:100%;min-height:820px"><rama-topbar [(quickOpen)]="open" /></div>`),
  }),
};

export const MenuCompleto: StoryObj = {
  name: 'Menú completo',
  render: () => ({
    props: { sidebar: true, active: null as string | null },
    template: `
      <div style="min-height:100vh;background:var(--rama-bg-subtle)">
        <rama-topbar (menuClick)="sidebar = !sidebar" />
        @if (sidebar) { <div style="padding:16px"><rama-sidebar [(activeModule)]="active" (menuClick)="sidebar = false" /></div> }
      </div>`,
  }),
};
