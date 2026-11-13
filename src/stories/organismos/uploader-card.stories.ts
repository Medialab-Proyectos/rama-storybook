import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';
import { RamaUploader, UploadItem } from '../../lib/uploader/uploader.component';
import { signal } from '@angular/core';
import { RamaUploaderCard, UploaderCardState } from '../../lib/uploader/uploader-card.component';
import { RamaUploaderButton } from '../../lib/uploader/uploader-button.component';

const meta: Meta<RamaUploaderCard> = {
  title: 'Organismos/Uploader card',
  component: RamaUploaderCard,
  decorators: [moduleMetadata({ imports: [RamaUploader, RamaUploaderCard, RamaUploaderButton] })],
  parameters: { layout: 'padded' },
};
export default meta;

export const Estados: StoryObj<RamaUploaderCard> = {
  render: () => ({
    template: `
      <div class="sb-doc" style="display:flex;flex-direction:column;gap:40px">
        <p class="sb-lead">Tarjeta de un solo documento. Estados de Figma: Disabled, Default, Loading, Analysis, Success, Error with notification y Error message.</p>
        <div><code>Disabled</code><br><br><rama-uploader-card state="disabled" title="Archivo de planta de cargos permanentes" /></div>
        <div><code>Default</code><br><br><rama-uploader-card /></div>
        <div><code>Loading</code><br><br><rama-uploader-card state="loading" /></div>
        <div><code>Analysis</code><br><br><rama-uploader-card state="analysis" progress="100 de 120" /></div>
        <div><code>Success</code><br><br><rama-uploader-card state="success" /></div>
        <div><code>Error with notification</code><br><br>
          <rama-uploader-card state="error" errorTitle="No pudimos cargar el archivo “Plantilla de calculo salarial” porque contiene datos inconsistentes."
            errorText="Las observaciones han sido resaltadas en el documento para que las revises y ajustes.&#10;Una vez corregido, podrás volver a cargarlo." /></div>
        <div><code>Error message</code><br><br><rama-uploader-card state="error-message" /></div>
      </div>`,
  }),
};

export const Flujo: StoryObj<RamaUploaderCard> = {
  render: () => {
    // Storybook corre sin zone.js: el estado va en signals para que los setTimeout repinten la tarjeta.
    const state = signal<UploaderCardState>('default');
    const avance = signal('');
    return {
      props: {
        state, avance,
        subir() {
          state.set('loading');
          setTimeout(() => { state.set('analysis'); avance.set('60 de 120'); }, 1200);
          setTimeout(() => avance.set('120 de 120'), 2200);
          setTimeout(() => state.set('success'), 3000);
        },
        reiniciar() { state.set('default'); avance.set(''); },
      },
      template: `
        <div class="sb-doc">
          <p class="sb-lead">Elige un archivo (clic, Enter o arrastrar): pasa por Loading y Analysis y termina en Success.</p>
          <rama-uploader-card [state]="state()" [progress]="avance()" (fileSelected)="subir()" (replace)="reiniciar()" />
        </div>`,
    };
  },
};
