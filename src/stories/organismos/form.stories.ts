import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';
import { RamaForm } from '../../lib/form/form.component';
import { FORM_IMPORTS, FORM_OPTIONS, SENTENCIA_FORM } from '../shared/sentencia-form';

const meta: Meta<RamaForm> = {
  title: 'Organismos/Formulario',
  component: RamaForm,
  decorators: [moduleMetadata({ imports: FORM_IMPORTS })],
  parameters: { layout: 'padded' },
};
export default meta;

export const CrearSentencia: StoryObj<RamaForm> = {
  name: 'Crear sentencia',
  render: () => ({
    props: { opts: FORM_OPTIONS },
    template: `
      <div class="sb-doc">
        <p class="sb-lead">Formulario del Figma (contenido de 20 Modals · Type=Modal). <code>rama-form</code> agrupa los bloques con 16px;
          <code>rama-form-section</code> pone el título (12 bold) y los campos en 1, 2 o 3 columnas; <code>rama-form-divider</code> separa bloques;
          los campos agrupados van en una <code>rama-card</code> con su acción "Agregar". Las etiquetas usan el color Secondary (gris).</p>
        <div style="max-width:652px">${SENTENCIA_FORM}</div>
      </div>`,
  }),
};

export const UnaColumna: StoryObj<RamaForm> = {
  name: 'Angosto (una columna)',
  render: () => ({
    props: { opts: FORM_OPTIONS },
    template: `
      <div class="sb-doc">
        <p class="sb-lead">En contenedores de 480px o menos (p. ej. el modal Small de 390px) todas las secciones pasan a una sola columna.</p>
        <div style="max-width:358px">${SENTENCIA_FORM}</div>
      </div>`,
  }),
};
