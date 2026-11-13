import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';
import { RamaLabel } from '../../lib/input/label.component';
import { RamaInput } from '../../lib/input/input.component';

const meta: Meta = {
  title: 'Átomos/Label',
  decorators: [moduleMetadata({ imports: [RamaLabel, RamaInput] })],
  parameters: { layout: 'padded' },
};
export default meta;

export const Etiqueta: StoryObj = {
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
