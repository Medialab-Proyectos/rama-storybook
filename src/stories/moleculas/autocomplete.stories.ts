import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';
import { FormsModule } from '@angular/forms';
import { RamaAutocomplete } from '../../lib/autocomplete/autocomplete.component';
import { DropdownOption } from '../../lib/dropdown-list/dropdown-list.component';

const puestos: DropdownOption[] = [
  'Operador de campo', 'Supervisor de turno', 'Coordinador de producción', 'Ingeniero de soporte',
  'Técnico de mantenimiento', 'Jefe de departamento', 'Analista HSE',
].map(label => ({ value: label.toLowerCase().replace(/\s+/g, '-'), label }));

type Args = RamaAutocomplete & { valor: string | string[] | null };

const meta: Meta<Args> = {
  title: 'Moléculas/Autocomplete',
  component: RamaAutocomplete,
  decorators: [moduleMetadata({ imports: [RamaAutocomplete, FormsModule] })],
  parameters: { layout: 'padded' },
  argTypes: { presentation: { control: 'inline-radio', options: ['auto', 'popover', 'sheet'] } },
  args: { presentation: 'auto', label: 'Puesto de trabajo', placeholder: 'Placeholder', required: true, helper: '', error: '', disabled: false, multiple: false, valor: null },
};
export default meta;

export const Playground: StoryObj<Args> = {
  render: (args) => ({
    props: { ...args, puestos },
    template: `
      <div style="width:320px;min-height:420px">
        <rama-autocomplete [label]="label" [placeholder]="placeholder" [required]="required" [helper]="helper" [error]="error"
          [disabled]="disabled" [multiple]="multiple" [presentation]="presentation" [options]="puestos" [(ngModel)]="valor" />
        <p class="sb-lead" style="margin-top:16px">Escribe para filtrar. Con <code>presentation="auto"</code>, en pantallas de 600px o menos se abre la hoja inferior.</p>
      </div>`,
  }),
};

export const Estados: StoryObj<Args> = {
  render: () => ({
    props: { puestos },
    template: `
      <div class="sb-doc" style="display:grid;grid-template-columns:repeat(2,240px);gap:32px 64px">
        <rama-autocomplete label="Con placeholder" [required]="true" [options]="puestos" />
        <rama-autocomplete label="Ítem seleccionado" [required]="true" [options]="puestos" ngModel="operador-de-campo" />
        <rama-autocomplete label="Error" [required]="true" [options]="puestos" error="Selecciona un puesto" />
        <rama-autocomplete label="Deshabilitado" [required]="true" [options]="puestos" [disabled]="true" />
      </div>`,
  }),
};

export const Multiselect: StoryObj<Args> = {
  render: () => ({
    props: { puestos, valor: ['operador-de-campo', 'analista-hse'] },
    template: `
      <div style="width:360px;min-height:440px">
        <rama-autocomplete label="Destinatarios" [required]="true" [multiple]="true" [options]="puestos" [(ngModel)]="valor" helper="Puedes elegir varios" />
        <p class="sb-lead" style="margin-top:16px">Backspace con el campo vacío quita el último.</p>
      </div>`,
  }),
};

export const Movil: StoryObj<Args> = {
  name: 'Mobile · hoja inferior',
  render: () => ({
    props: { puestos, uno: 'supervisor-de-turno', varios: ['operador-de-campo', 'analista-hse', 'supervisor-de-turno'] },
    template: `
      <div class="sb-doc">
        <p class="sb-lead">Device=Mobile: el campo pasa a Size=Small (44px) y al abrirlo aparece la Dropdown list como hoja inferior con buscador; el foco va al buscador (↑/↓, Enter, Esc). Se cierra con la X, el fondo, Esc o al elegir (simple). Aquí se fuerza con <code>presentation="sheet"</code>; en la app <code>auto</code> lo decide por el ancho de pantalla.</p>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:32px;max-width:640px">
          <rama-autocomplete label="Puesto de trabajo" [required]="true" presentation="sheet" [options]="puestos" placeholder="Selecciona un puesto" />
          <rama-autocomplete label="Puesto de trabajo" [required]="true" presentation="sheet" [options]="puestos" [(ngModel)]="uno" />
          <rama-autocomplete label="Destinatarios" [required]="true" presentation="sheet" [multiple]="true" [options]="puestos" placeholder="Selecciona puestos" />
          <rama-autocomplete label="Destinatarios" [required]="true" presentation="sheet" [multiple]="true" [options]="puestos" [(ngModel)]="varios" />
        </div>
      </div>`,
  }),
};
