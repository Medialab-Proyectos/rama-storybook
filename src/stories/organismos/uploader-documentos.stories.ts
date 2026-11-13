import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';
import { RamaUploader, UploadItem } from '../../lib/uploader/uploader.component';
import { RamaUploaderCard } from '../../lib/uploader/uploader-card.component';
import { RamaUploaderButton } from '../../lib/uploader/uploader-button.component';
import { RamaFileState } from '../../lib/uploader/file-state.component';

const meta: Meta<RamaUploader> = {
  title: 'Organismos/Uploader de documentos',
  component: RamaUploader,
  decorators: [moduleMetadata({ imports: [RamaUploader, RamaUploaderCard, RamaUploaderButton, RamaFileState] })],
  parameters: { layout: 'padded' },
  args: { multiple: true, maxFiles: 10, maxSizeMb: 10, accept: '.pdf,.xls,.xlsx', disabled: false },
};
export default meta;

export const Playground: StoryObj<RamaUploader> = {
  render: (args) => ({
    props: args,
    template: `
      <div class="sb-doc">
        <p class="sb-lead">Arrastra archivos sobre la tarjeta o usa el botón. Se valida el formato y el tamaño; cada archivo se puede quitar.</p>
        <rama-uploader [multiple]="multiple" [maxFiles]="maxFiles" [maxSizeMb]="maxSizeMb" [accept]="accept" [disabled]="disabled" />
      </div>`,
  }),
};

const sample: UploadItem[] = [
  { id: 901, name: 'Acta_entrega_turno_Area_3.2.pdf', size: 320_000, status: 'loading' },
  { id: 902, name: 'Registro_rondas_turno_A.xlsx', size: 512_000, status: 'success' },
  { id: 903, name: 'Evidencia_fuga_Bomba_P-101.png', size: 2_100_000, status: 'error', error: 'El documento debe ser tipo PDF o Excel y no superar los 10 MB.' },
];

export const EstadosDeArchivo: StoryObj<RamaUploader> = {
  name: 'Estados de archivo',
  render: () => ({
    props: { items: sample },
    template: `<rama-uploader [(items)]="items" />`,
  }),
};

export const Deshabilitado: StoryObj<RamaUploader> = {
  render: () => ({ template: `<rama-uploader [disabled]="true" />` }),
};

export const ConDescarga: StoryObj<RamaUploader> = {
  name: 'Con descarga',
  render: () => ({
    props: { items: [
      { id: 911, name: 'Acta de entrega de turno.pdf', size: 320_000, status: 'success' },
      { id: 912, name: 'Registro de rondas turno A.xlsx', size: 512_000, status: 'success' },
    ] as UploadItem[] },
    template: `<rama-uploader [(items)]="items" fileAction="download" [showSuccess]="false" />`,
  }),
};

export const AnchoCompleto: StoryObj<RamaUploader> = {
  name: 'Ancho completo',
  render: () => ({
    props: { items: [{ id: 921, name: 'Acta de entrega de turno.pdf', size: 320_000, status: 'success' }] as UploadItem[] },
    template: `
      <div class="sb-doc">
        <p class="sb-lead">Con <code>[fullWidth]="true"</code> ocupa todo el contenedor (aquí 424, como el Panel lateral) en lugar del máximo de 378 de Figma.</p>
        <div style="width:424px;outline:1px dashed var(--rama-border-default)"><rama-uploader [(items)]="items" [fullWidth]="true" /></div>
      </div>`,
  }),
};

export const FileState: StoryObj<RamaUploader> = {
  name: 'File state',
  render: () => ({
    template: `
      <div class="sb-doc" style="display:flex;flex-direction:column;gap:32px">
        <p class="sb-lead">Fila de archivo reutilizable (<code>rama-file-state</code>) que comparten el Uploader button y el Uploader multiple. Estados de Figma "File State".</p>
        <div><code>Default</code><br><br><rama-file-state name="Acta de entrega de turno.pdf" /></div>
        <div><code>Loading</code><br><br><rama-file-state name="Acta de entrega de turno.pdf" status="loading" /></div>
        <div><code>File loaded success</code><br><br><rama-file-state name="Acta de entrega de turno.pdf" status="success" /></div>
        <div><code>File error</code><br><br><rama-file-state name="Registro de rondas Area 3.2.docx" status="error" errorMessage="El documento debe ser tipo PDF o Excel y no superar los 10 MB." /></div>
        <div><code>File loaded + icon trash</code><br><br><rama-file-state name="Acta de entrega de turno.pdf" action="remove" /></div>
        <div><code>File loaded + Download icon</code><br><br><rama-file-state name="Acta de entrega de turno.pdf" action="download" /></div>
      </div>`,
  }),
};

/* ===== Tipo 2 · Uploader card (Figma "Uploader card", 606×195) ===== */
