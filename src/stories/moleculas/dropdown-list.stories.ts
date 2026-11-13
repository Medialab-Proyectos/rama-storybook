import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';
import { FormsModule } from '@angular/forms';
import { DropdownOption, RamaDropdownList } from '../../lib/dropdown-list/dropdown-list.component';
import { RamaAvatar } from '../../lib/avatar/avatar.component';

const opciones: DropdownOption[] = [
  { value: 'castilla', label: 'Estación Castilla' },
  { value: 'apiay', label: 'Estación Apiay' },
  { value: 'chichimene', label: 'Estación Chichimene' },
  { value: 'suria', label: 'Estación Suria', disabled: true },
  { value: 'acacias', label: 'Estación Acacías' },
  { value: 'rubiales', label: 'Campo Rubiales' },
];
const agrupadas: DropdownOption[] = [
  { value: 'perfil', label: 'Mi perfil', group: 'Cuenta' },
  { value: 'roles', label: 'Roles y permisos', group: 'Cuenta' },
  { value: 'ajustes', label: 'Ajustes', group: 'Cuenta' },
  { value: 'ayuda', label: 'Centro de ayuda', group: 'Soporte' },
];

type Args = RamaDropdownList & { valor: string | string[] };

const meta: Meta<Args> = {
  title: 'Moléculas/Dropdown list',
  component: RamaDropdownList,
  decorators: [moduleMetadata({ imports: [RamaDropdownList, RamaAvatar, FormsModule] })],
  parameters: { layout: 'padded' },
  argTypes: {
    type: { control: 'inline-radio', options: ['icon', 'checkbox', 'text'] },
    size: { control: 'inline-radio', options: ['large', 'medium', 'small'] },
    presentation: { control: 'inline-radio', options: ['popover', 'sheet'] },
  },
  args: { type: 'icon', size: 'large', multiple: false, presentation: 'popover', valor: 'castilla' },
};
export default meta;

export const Playground: StoryObj<Args> = {
  render: (args) => ({
    props: { ...args, opciones },
    template: `
      <div style="display:flex;gap:32px;align-items:flex-start">
        <div [style.width]="presentation === 'sheet' ? '390px' : null"><rama-dropdown-list [options]="opciones" [type]="type" [size]="size" [multiple]="multiple" [presentation]="presentation" ariaLabel="Estaciones" [(ngModel)]="valor" /></div>
        <p class="sb-lead">Haz clic en la lista y usa ↑/↓, Home/End, Enter o Espacio.</p>
      </div>`,
  }),
};

export const TiposYTamanos: StoryObj<Args> = {
  name: 'Tipos × tamaños',
  render: () => ({
    props: { opciones: opciones.slice(0, 4), sizes: ['large', 'medium', 'small'], types: ['icon', 'checkbox', 'text'] },
    template: `
      <div class="sb-doc">
        <p class="sb-lead">Ítems con ícono, con checkbox o solo texto, en tamaño Large (16px), Medium (14px) y Small (12px). Estados: enable, hover (gris), selected (azul claro con ✓) y disabled.</p>
        <table class="sb-table" style="width:auto">
          <thead><tr><th></th>@for (t of types; track t) { <th>{{ t }}</th> }</tr></thead>
          <tbody>
            @for (s of sizes; track s) {
              <tr><td><b>{{ s }}</b></td>
                @for (t of types; track t) {
                  <td><rama-dropdown-list [options]="opciones" [type]="t" [size]="s" [multiple]="t === 'checkbox'" [ngModel]="t === 'checkbox' ? ['castilla', 'apiay'] : 'castilla'" [activeIndex]="2" width="260px" /></td>
                }
              </tr>
            }
          </tbody>
        </table>
      </div>`,
  }),
};

export const ConTitulos: StoryObj<Args> = {
  name: 'Con títulos y encabezado',
  render: () => ({
    props: { agrupadas, valor: 'roles' },
    template: `
      <div class="sb-doc" style="display:flex;gap:32px;align-items:flex-start">
        <rama-dropdown-list [options]="agrupadas" [(ngModel)]="valor" ariaLabel="Cuenta" />
        <rama-dropdown-list [options]="agrupadas" ariaLabel="Cuenta">
          <div header style="padding:8px 14px 12px;border-bottom:1px solid var(--rama-border-inset);margin-bottom:4px">
            <div style="font-size:14px;font-weight:700">Label item</div>
            <div style="font-size:12px;color:var(--rama-text-muted);line-height:16px">Lorem ipsum is simply dummy text of the printing and typesetting industry.</div>
          </div>
        </rama-dropdown-list>
      </div>`,
  }),
};

const muchas: DropdownOption[] = [
  'Estación Castilla 1', 'Estación Castilla 2', 'Estación Apiay', 'Estación Chichimene', 'Estación Suria',
  'Estación Acacías', 'Campo Rubiales', 'Estación Cupiagua', 'Estación Cusiana', 'Estación Orito',
].map(label => ({ value: label.toLowerCase().replace(/\s+/g, '-'), label }));
const agrupadasMovil: DropdownOption[] = [
  ...['Mi perfil', 'Roles y permisos', 'Ajustes'].map(label => ({ value: label, label, group: 'Cuenta' })),
  ...['Centro de ayuda', 'Reportar un problema', 'Novedades', 'Términos de uso'].map(label => ({ value: label, label, group: 'Soporte' })),
];

/** Marco de 390px como el frame Mobile de Figma; la hoja se ve estática para documentarla. */
const frame = (inner: string) => `<div style="width:390px;max-width:100%">${inner}</div>`;

export const Movil: StoryObj<Args> = {
  name: 'Mobile · hoja inferior',
  render: () => ({
    props: { muchas, agrupadasMovil, valor: 'estación-apiay', multi: ['estación-castilla-1'] },
    template: `
      <div class="sb-doc">
        <p class="sb-lead">En móvil la lista se presenta como hoja inferior (<code>presentation="sheet"</code>): asa, botón cerrar, buscador que filtra (↑/↓, Enter y Esc desde el buscador), ítems Small de 12px y divisor inferior. El autocomplete usa esta misma hoja.</p>
        <div style="display:flex;flex-wrap:wrap;gap:32px;align-items:flex-start">
          <figure style="margin:0"><figcaption class="sb-lead">Text items</figcaption>
            ${frame(`<rama-dropdown-list presentation="sheet" size="small" [options]="muchas" ariaLabel="Estaciones" [(ngModel)]="valor" />`)}</figure>
          <figure style="margin:0"><figcaption class="sb-lead">Avatar items</figcaption>
            ${frame(`<rama-dropdown-list presentation="sheet" size="small" [options]="muchas" ariaLabel="Estaciones">
              <div header style="display:flex;align-items:center;gap:var(--rama-space-8);padding:var(--rama-space-8) var(--rama-space-14);margin:var(--rama-space-4) var(--rama-space-8) 0;border-radius:var(--rama-radius-small);background:var(--rama-bg-inset)">
                <rama-avatar initials="ST" size="4x" label="Supervisor de turno" />
                <div><div style="font-size:14px;line-height:16px;font-weight:700;color:var(--rama-text-default-black)">Supervisor de turno</div>
                <div style="font-size:12px;line-height:16px;color:var(--rama-text-muted)">Estación Castilla 2 · hace 2 min</div></div>
              </div>
            </rama-dropdown-list>`)}</figure>
          <figure style="margin:0"><figcaption class="sb-lead">Description items</figcaption>
            ${frame(`<rama-dropdown-list presentation="sheet" size="small" [options]="muchas" ariaLabel="Estaciones">
              <div header style="padding:var(--rama-space-8) var(--rama-space-16) var(--rama-space-4)">
                <div style="font-size:14px;line-height:16px;font-weight:700;color:var(--rama-text-default-black)">Estaciones</div>
                <div style="font-size:12px;line-height:16px;color:var(--rama-text-muted)">Elige la estación donde se ejecuta la ronda.</div>
              </div>
            </rama-dropdown-list>`)}</figure>
          <figure style="margin:0"><figcaption class="sb-lead">Title items</figcaption>
            ${frame(`<rama-dropdown-list presentation="sheet" size="small" [options]="agrupadasMovil" ariaLabel="Cuenta" />`)}</figure>
          <figure style="margin:0"><figcaption class="sb-lead">Multi-select</figcaption>
            ${frame(`<rama-dropdown-list presentation="sheet" size="small" type="checkbox" [multiple]="true" [options]="muchas" ariaLabel="Estaciones" [(ngModel)]="multi" />`)}</figure>
        </div>
      </div>`,
  }),
};
