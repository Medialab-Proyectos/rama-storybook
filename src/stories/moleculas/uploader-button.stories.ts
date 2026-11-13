import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';
import { RamaUploader, UploadItem } from '../../lib/uploader/uploader.component';
import { RamaUploaderCard } from '../../lib/uploader/uploader-card.component';
import { RamaUploaderButton } from '../../lib/uploader/uploader-button.component';

const meta: Meta<RamaUploaderButton> = {
  title: 'Moléculas/Uploader button',
  component: RamaUploaderButton,
  decorators: [moduleMetadata({ imports: [RamaUploader, RamaUploaderCard, RamaUploaderButton] })],
  parameters: { layout: 'padded' },
};
export default meta;

export const Estados: StoryObj<RamaUploaderButton> = {
  render: () => ({
    template: `
      <div class="sb-doc" style="display:flex;flex-direction:column;gap:32px">
        <p class="sb-lead">Campo para un solo documento con etiqueta y botón a todo el ancho. Estados de Figma: Disabled, Default, Loading, File loaded success y File loaded error.</p>
        <div><code>Disabled</code><br><br><rama-uploader-button state="disabled" /></div>
        <div><code>Default</code><br><br><rama-uploader-button /></div>
        <div><code>Loading</code><br><br><rama-uploader-button state="loading" fileName="Nombre_del_documento_generado_CDP.ECX" /></div>
        <div><code>File loaded success</code><br><br><rama-uploader-button state="success" fileName="Nombre_del_documento_generado_CDP.ECX" /></div>
        <div><code>File loaded success · sin aviso</code> (<code>[showSuccessNotice]="false"</code>, Panel lateral "Document + trash")<br><br><rama-uploader-button state="success" fileName="Acta de entrega de turno.pdf" [showSuccessNotice]="false" /></div>
        <div><code>File loaded error</code><br><br><rama-uploader-button state="error" /></div>
      </div>`,
  }),
};

