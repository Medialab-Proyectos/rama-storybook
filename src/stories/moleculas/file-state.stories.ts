import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';
import { RamaFileState } from '../../lib/uploader/file-state.component';

const meta: Meta = {
  title: 'Moléculas/File state',
  decorators: [moduleMetadata({ imports: [RamaFileState] })],
  parameters: { layout: 'padded' },
};
export default meta;

export const FileState: StoryObj = {
  name: 'Estados',
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
