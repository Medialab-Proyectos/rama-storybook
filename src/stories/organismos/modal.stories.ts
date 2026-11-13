import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';
import { RamaButton } from '../../lib/button/button.component';
import { RamaModal } from '../../lib/modal/modal.component';
import { FORM_IMPORTS, FORM_OPTIONS, SENTENCIA_FORM } from '../shared/sentencia-form';

const meta: Meta<RamaModal> = {
  title: 'Organismos/Modal y Pop up',
  component: RamaModal,
  decorators: [moduleMetadata({ imports: [RamaModal, RamaButton, ...FORM_IMPORTS] })],
  parameters: { layout: 'padded' },
};
export default meta;

export const Confirmacion: StoryObj<RamaModal> = {
  name: 'Alerta / confirmación',
  render: () => ({
    props: { open: true },
    template: `
      <rama-button (click)="open = true">Abrir confirmación</rama-button>
      <rama-modal [(open)]="open" variant="confirm" size="large" title="Ya existe una entrega de turno para este puesto" tone="caution" icon="alert-triangle">
        <p>El puesto Operador Área 3.2 ya tiene una entrega de turno en documentación.</p>
        <p>Si necesitas completar o modificar la información, puedes hacerlo desde allí.</p>
        <rama-button modal-footer variant="outlined" size="xs" (click)="open = false">Cancelar</rama-button>
        <rama-button modal-footer size="xs" (click)="open = false">Abrir entrega de turno</rama-button>
      </rama-modal>`,
  }),
};

export const ConTabla: StoryObj<RamaModal> = {
  name: 'Con tabla',
  render: () => ({
    props: {
      open: true,
      rows: [
        { tarea: 'Presión de descarga Bomba P-101', valor: '285 PSI', ventana: '220 – 280' },
        { tarea: 'Nivel Tanque T-203', valor: '92 %', ventana: '30 – 90' },
        { tarea: 'Temperatura Compresor C-05', valor: '88 °C', ventana: '70 – 90' },
      ],
    },
    template: `
      <rama-button (click)="open = true">Abrir formulario</rama-button>
      <rama-modal [(open)]="open" title="Registrar novedad de la ronda" description="Registra la información de las tareas fuera de ventana operativa." size="large">
        <rama-button modal-header-action variant="outlined" size="xs" leadIcon="add">Agregar tarea</rama-button>
        <table class="sb-table">
          <thead><tr><th>Tarea</th><th>Valor</th><th>Ventana operativa</th></tr></thead>
          <tbody>@for (r of rows; track r.tarea) { <tr><td>{{ r.tarea }}</td><td>{{ r.valor }}</td><td>{{ r.ventana }}</td></tr> }</tbody>
        </table>
        <div modal-footer style="display:flex;gap:16px">
          <rama-button variant="outlined" size="large" (click)="open = false">Cancelar</rama-button>
          <rama-button size="large" (click)="open = false">Guardar</rama-button>
        </div>
      </rama-modal>`,
  }),
};

const SIZES = [
  { size: 'small', modal: 390, popup: 358 },
  { size: 'medium', modal: 700, popup: 400 },
  { size: 'large', modal: 1054, popup: 571 },
  { size: 'xlarge', modal: 1233, popup: 700 },
];

export const TamanosPopup: StoryObj<RamaModal> = {
  name: 'Tamaños · Pop up',
  render: () => ({
    props: { sizes: SIZES, current: 'small', open: true },
    template: `
      <div class="sb-doc">
        <p class="sb-lead">Figma 20 Modals · <code>Type=Popup</code>: small 358 · medium 400 · large 571 · xlarge 700 px. En small los botones (Medium, 44 px) se apilan a todo el ancho; en los demás (Small, 36 px) van en fila y centrados. Por debajo de 480 px de ventana se usa siempre small.</p>
        <div style="display:flex;gap:12px;flex-wrap:wrap">
          @for (s of sizes; track s.size) {
            <rama-button variant="outlined" size="small" (click)="current = s.size; open = true">{{ s.size }} · {{ s.popup }}px</rama-button>
          }
        </div>
      </div>
      <rama-modal [(open)]="open" variant="confirm" [size]="current" tone="caution" icon="alert-triangle" title="¿Deseas salir sin guardar cambios realizados?"
        description="Tienes cambios sin guardar. Si sales ahora, se perderán.">
        <rama-button modal-footer variant="outlined" [size]="current === 'small' ? 'medium' : 'xs'" (click)="open = false">Cancelar</rama-button>
        <rama-button modal-footer [size]="current === 'small' ? 'medium' : 'xs'" (click)="open = false">Salir sin guardar</rama-button>
      </rama-modal>`,
  }),
};

export const TamanosModal: StoryObj<RamaModal> = {
  name: 'Tamaños · Modal (formulario)',
  render: () => ({
    props: { sizes: SIZES, current: 'medium', open: true, opts: FORM_OPTIONS },
    template: `
      <div class="sb-doc">
        <p class="sb-lead">Figma 20 Modals · <code>Type=Modal</code>: el modal lleva el formulario "Crear sentencia" (Organismos/Formulario). Anchos: small 390 · medium 700 · large 1054 · xlarge 1233 px. En small el formulario pasa a una columna y el footer apila los botones. Por debajo de 480 px de ventana el modal pasa a small y se muestra como hoja inferior a todo el ancho.</p>
        <div style="display:flex;gap:12px;flex-wrap:wrap">
          @for (s of sizes; track s.size) {
            <rama-button variant="outlined" size="small" (click)="current = s.size; open = true">{{ s.size }} · {{ s.modal }}px</rama-button>
          }
        </div>
      </div>
      <rama-modal [(open)]="open" [size]="current" title="Crear sentencia" requiredNote="Los campos señalados son obligatorios*.">
        ${SENTENCIA_FORM}
        <div modal-footer style="display:flex;gap:16px">
          @if (current !== 'small') { <rama-button variant="outlined" size="xl" (click)="open = false">Cancelar</rama-button> }
          <rama-button size="xl" (click)="open = false">Guardar</rama-button>
        </div>
      </rama-modal>`,
  }),
};

const TONES = [
  { tone: 'caution', label: 'Warning', title: 'Ya existe una entrega de turno para este puesto', text: 'El puesto Operador Área 3.2 ya tiene una entrega de turno en documentación.', action: 'Abrir entrega de turno' },
  { tone: 'information', label: 'Info', title: 'La ronda se sincronizará al recuperar conexión', text: 'Los registros de la Estación Castilla 2 quedan guardados en el dispositivo hasta que vuelva la conexión.', action: 'Entendido' },
  { tone: 'error', label: 'Error', title: '¿Deseas eliminar la tarea de la ronda?', text: 'La tarea "Presión de descarga Bomba P-101" se eliminará de la plantilla. Esta acción no se puede deshacer.', action: 'Eliminar tarea' },
  { tone: 'success', label: 'Success', title: 'Entrega de turno enviada', text: 'El Supervisor Estación recibirá la entrega de turno para su revisión.', action: 'Ir al inicio' },
];

export const Tonos: StoryObj<RamaModal> = {
  name: 'Tonos · ícono destacado',
  render: () => ({
    props: { tones: TONES, t: TONES[0], open: true },
    template: `
      <div class="sb-doc">
        <p class="sb-lead">Figma "Featured icon": Warning (<code>caution</code>, alert-triangle), Info y Error (alert-circle) y Success (checks). Fondo <code>--rama-*-on-fill</code> del tono; el ícono se elige solo según <code>tone</code> (se puede cambiar con <code>icon</code> u ocultar con <code>[icon]="null"</code>).</p>
        <div style="display:flex;gap:12px;flex-wrap:wrap">
          @for (x of tones; track x.tone) {
            <rama-button variant="outlined" size="small" (click)="t = x; open = true">{{ x.label }}</rama-button>
          }
        </div>
      </div>
      <rama-modal [(open)]="open" variant="confirm" size="medium" [tone]="t.tone" [title]="t.title" [description]="t.text">
        <rama-button modal-footer variant="outlined" size="xs" (click)="open = false">Cancelar</rama-button>
        <rama-button modal-footer size="xs" (click)="open = false">{{ t.action }}</rama-button>
      </rama-modal>`,
  }),
};

export const ConAccionEncabezado: StoryObj<RamaModal> = {
  name: 'Encabezado con botón',
  render: () => ({
    props: { open: true, opts: FORM_OPTIONS },
    template: `
      <div class="sb-doc">
        <p class="sb-lead">Figma Header <code>Boton=Yes</code>: botón outlined "Añadir" en el slot <code>[modal-header-action]</code>. En medium/large/xlarge queda a la derecha del título dejando libre el cierre; en small va junto al cierre con 8 px.</p>
      </div>
      <rama-modal [(open)]="open" size="medium" title="Crear sentencia" requiredNote="Los campos señalados son obligatorios*.">
        <rama-button modal-header-action variant="outlined" size="xs" leadIcon="add">Añadir</rama-button>
        ${SENTENCIA_FORM}
        <div modal-footer style="display:flex;gap:16px">
          <rama-button variant="outlined" size="xl" (click)="open = false">Cancelar</rama-button>
          <rama-button size="xl" (click)="open = false">Guardar</rama-button>
        </div>
      </rama-modal>`,
  }),
};
