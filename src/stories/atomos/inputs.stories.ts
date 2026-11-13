import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';
import { FormsModule } from '@angular/forms';
import { RamaInput } from '../../lib/input/input.component';
import { RamaTextarea } from '../../lib/input/textarea.component';
import { RamaLabel } from '../../lib/input/label.component';
import { RamaButton } from '../../lib/button/button.component';

type Args = RamaInput & { valor: string };

const meta: Meta<Args> = {
  title: 'Átomos/Input y Text area',
  component: RamaInput,
  decorators: [moduleMetadata({ imports: [RamaInput, RamaTextarea, RamaLabel, RamaButton, FormsModule] })],
  parameters: { layout: 'padded' },
  argTypes: {
    size: { control: 'inline-radio', options: ['medium', 'small'] },
    labelColor: { control: 'inline-radio', options: [undefined, 'primary', 'secondary'] },
    leadAddonType: { control: 'inline-radio', options: ['unfold', 'link'] },
    trailAddonType: { control: 'inline-radio', options: ['unfold', 'currency'] },
    type: { control: 'select', options: ['text', 'email', 'password', 'number', 'tel', 'url'] },
    leadIcon: { control: 'select', options: [undefined, 'add', 'search', 'user'] },
    trailIcon: { control: 'select', options: [undefined, 'arrow-down', 'search'] },
  },
  args: {
    label: 'Correo',
    placeholder: 'example@gmail.com',
    helper: 'Texto de apoyo',
    required: true,
    error: '',
    disabled: false,
    maxLength: 50,
    type: 'email',
    valor: '',
    size: 'medium',
    leadAddonType: 'unfold',
    trailAddonType: 'unfold',
  },
};
export default meta;

export const Playground: StoryObj<Args> = {
  args: {
    size: 'small',
  },

  render: (args) => ({
    props: args,
    template: `
      <div style="max-width:560px">
        <rama-input [size]="size" [label]="label" [placeholder]="placeholder" [helper]="helper" [required]="required" [error]="error"
          [disabled]="disabled" [maxLength]="maxLength" [type]="type" [leadIcon]="leadIcon" [trailIcon]="trailIcon"
          [tooltip]="tooltip" [leadAddon]="leadAddon" [trailAddon]="trailAddon" [leadAddonType]="leadAddonType" [trailAddonType]="trailAddonType"
          [labelColor]="labelColor" [labelTooltip]="labelTooltip" [(ngModel)]="valor" />
      </div>`,
  }),
};

export const Estados: StoryObj<Args> = {
  render: () => ({
    props: { full: 'example@gmail.com' },
    template: `
      <div class="sb-doc" style="display:flex;flex-direction:column;gap:24px;max-width:800px">
        <p class="sb-lead">Enable, Full (con valor), Focus, Error y Disabled. El estado Focus sale solo al escribir; aquí se muestra fijo.</p>
        <rama-input label="Enable" placeholder="example@gmail.com" helper="Support text" [maxLength]="50" [required]="true" />
        <rama-input label="Full" placeholder="example@gmail.com" helper="Support text" [maxLength]="50" [required]="true" [ngModel]="full" />
        <rama-input class="is-focus" label="Focus" placeholder="example@gmail.com" helper="Support text" [maxLength]="50" [required]="true" [ngModel]="full" />
        <rama-input label="Error" placeholder="example@gmail.com" error="El correo no es válido" [maxLength]="50" [required]="true" />
        <rama-input label="Disabled" placeholder="example@gmail.com" helper="Support text" [maxLength]="50" [required]="true" [disabled]="true" />
        <p class="sb-lead">Con ícono inicial, add-on y flecha: Focus pinta en negro los íconos inicial y final; Error pinta en rojo íconos y add-ons (el tooltip sigue gris); Disabled los aclara.</p>
        <rama-input class="is-focus" label="Focus" leadIcon="add" leadAddon="CO" tooltip="Información adicional" trailIcon="arrow-down" placeholder="example@gmail.com" [ngModel]="full" />
        <rama-input label="Error" leadIcon="add" leadAddon="CO" tooltip="Información adicional" trailIcon="arrow-down" placeholder="example@gmail.com" error="Support text" [maxLength]="50" [required]="true" />
        <rama-input label="Disabled" leadIcon="add" leadAddon="CO" tooltip="Información adicional" trailIcon="arrow-down" [passwordStrength]="true" placeholder="example@gmail.com" helper="Support text" [maxLength]="50" [required]="true" [disabled]="true" />
      </div>`,
  }),
};

export const Completo: StoryObj<Args> = {
  name: 'Todas las partes (Figma)',
  render: () => ({
    props: { tags: ['Operaciones', 'Mantenimiento', 'HSE'] },
    template: `
      <div class="sb-doc" style="max-width:800px">
        <p class="sb-lead">El componente de Figma reúne todas las partes opcionales: ícono inicial, tags, add-on inicial y final, fuerza de contraseña, tooltip, ícono final, texto de apoyo y contador. Se activan por separado según el caso.</p>
        <rama-input label="Label" placeholder="example@gmail.com" helper="Support text" [maxLength]="50" [required]="true"
          leadIcon="add" [tags]="tags" leadAddon="CO" trailAddon="CO" [passwordStrength]="true" tooltip="Información adicional" trailIcon="arrow-down" />
      </div>`,
  }),
};

export const Variantes: StoryObj<Args> = {
  name: 'Add-ons, tags y contraseña',
  render: () => ({
    props: {
      tags: ['Operaciones', 'Mantenimiento'],
      pass: '',
      removeTag(t: string) {
        this['tags'] = (this['tags'] as string[]).filter((x: string) => x !== t);
      },
    },
    template: `
      <div class="sb-doc" style="display:flex;flex-direction:column;gap:24px;max-width:560px">
        <rama-input label="Sitio web" leadAddon="http://" leadAddonType="link" placeholder="www.ecopetrol.com.co" />
        <rama-input label="Teléfono" leadAddon="CO" placeholder="300 000 0000" type="tel" />
        <rama-input label="Monto" trailAddon="USD" trailAddonType="currency" placeholder="0" type="number" />
        <rama-input label="Áreas" [tags]="tags" placeholder="Agregar área" (tagRemove)="removeTag($event)" />
        <rama-input label="Contraseña" type="password" placeholder="Escribe una contraseña" [passwordStrength]="true" helper="Mínimo 10 caracteres, con mayúsculas, números y símbolos" [(ngModel)]="pass" />
        <rama-input label="Con tooltip" placeholder="Valor" tooltip="Este dato se usa para el reporte de turno" />
      </div>`,
  }),
};

export const TextArea: StoryObj<Args> = {
  name: 'Text Area',
  render: () => ({
    props: { obs: '' },
    template: `
      <div class="sb-doc" style="display:flex;flex-direction:column;gap:24px;max-width:420px">
        <p class="sb-lead">Figma Text Area: caja de 140px (188px con etiqueta y textos de apoyo). Opcionales: tooltip dentro de la caja y un botón inset proyectado con <code>textarea-actions</code>. Con <code>rows</code> el alto sale de las filas.</p>
        <rama-textarea label="Observaciones" placeholder="Describe la novedad" helper="Support text" [maxLength]="300" [required]="true" [(ngModel)]="obs" />
        <rama-textarea label="Con tooltip y acción" placeholder="Describe la novedad" helper="Support text" [maxLength]="300" [required]="true" tooltip="Se adjunta al reporte de turno">
          <rama-button textarea-actions variant="outlined" size="xs">Usar plantilla</rama-button>
        </rama-textarea>
        <rama-textarea class="is-focus" label="Focus" placeholder="Describe la novedad" helper="Support text" [maxLength]="300" [required]="true" />
        <rama-textarea label="Error" placeholder="Describe la novedad" error="Campo obligatorio" [maxLength]="300" [required]="true" tooltip="Se adjunta al reporte de turno" />
        <rama-textarea label="Disabled" placeholder="Describe la novedad" helper="Support text" [maxLength]="300" [required]="true" [disabled]="true" tooltip="Se adjunta al reporte de turno">
          <rama-button textarea-actions variant="outlined" size="xs" [disabled]="true">Usar plantilla</rama-button>
        </rama-textarea>
        <rama-textarea size="small" label="Small con filas" placeholder="Enter a description..." [rows]="3" [required]="true" />
      </div>`,
  }),
};

export const Tamanos: StoryObj<Args> = {
  name: 'Tamaños',
  render: () => ({
    template: `
      <div class="sb-doc">
        <p class="sb-lead">Figma 13 Inputs · <code>Size=Medium</code> (caja de 48px, valor 16px) y <code>Size=Small</code> (caja de 44px, etiqueta 12px, valor 14px y textos de apoyo 12px).</p>
        <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:32px;max-width:960px">
          <div><code>Medium</code><br><br><rama-input label="Correo" placeholder="example@gmail.com" helper="Support text" [maxLength]="50" [required]="true" leadAddon="CO" trailIcon="arrow-down" /></div>
          <div><code>Small</code><br><br><rama-input size="small" label="Correo" placeholder="example@gmail.com" helper="Support text" [maxLength]="50" [required]="true" leadAddon="CO" trailIcon="arrow-down" /></div>
          <div><rama-input label="Error" placeholder="example@gmail.com" error="Campo obligatorio" [required]="true" /></div>
          <div><rama-input size="small" label="Error" placeholder="example@gmail.com" error="Campo obligatorio" [required]="true" /></div>
          <div><code>Text area · Medium</code><br><br><rama-textarea label="Observaciones" placeholder="Enter a description..." helper="Support text" [maxLength]="300" [required]="true" /></div>
          <div><code>Text area · Small</code><br><br><rama-textarea size="small" label="Observaciones" placeholder="Enter a description..." helper="Support text" [maxLength]="300" [required]="true" /></div>
        </div>
      </div>`,
  }),
};

export const Etiqueta: StoryObj<Args> = {
  name: 'Label',
  render: () => ({
    template: `
      <div class="sb-doc">
        <p class="sb-lead">Figma 13 Inputs · <code>Label</code>: Size=Medium (14/16 bold) o Small (12/16 semibold) × Color=Primary, Secondary o Disabled. En los campos se controla con <code>labelColor</code> (Disabled sale solo del estado y dentro de <code>rama-form</code> se usa Secondary); <code>rama-label</code> sirve para rotular controles sin etiqueta propia.</p>
        <div style="display:grid;grid-template-columns:repeat(3,max-content);gap:16px 48px;align-items:center">
          <rama-label [required]="true" tooltip="Información adicional">Primary</rama-label>
          <rama-label color="secondary" [required]="true" tooltip="Información adicional">Secondary</rama-label>
          <rama-label color="disabled" [required]="true" tooltip="Información adicional">Disabled</rama-label>
          <rama-label size="small" [required]="true" tooltip="Información adicional">Primary</rama-label>
          <rama-label size="small" color="secondary" [required]="true" tooltip="Información adicional">Secondary</rama-label>
          <rama-label size="small" color="disabled" [required]="true" tooltip="Información adicional">Disabled</rama-label>
        </div>
        <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:32px;max-width:800px;margin-top:32px">
          <rama-input size="small" label="Cargo del responsable" labelColor="primary" placeholder="Supervisor de estación" />
          <rama-input size="small" label="Cargo del responsable" labelColor="secondary" placeholder="Supervisor de estación" />
        </div>
      </div>`,
  }),
};
