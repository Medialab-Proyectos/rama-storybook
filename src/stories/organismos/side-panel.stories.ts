import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';
import { RamaAlert } from '../../lib/alert/alert.component';
import { RamaButton } from '../../lib/button/button.component';
import { RamaCheckbox } from '../../lib/checkbox/checkbox.component';
import { RamaInput } from '../../lib/input/input.component';
import { RamaTextarea } from '../../lib/input/textarea.component';
import { RamaPanelChip } from '../../lib/side-panel/panel-chip.component';
import { RamaPanelField } from '../../lib/side-panel/panel-field.component';
import { RamaPanelSection } from '../../lib/side-panel/panel-section.component';
import { RamaSidePanel } from '../../lib/side-panel/side-panel.component';
import { RamaUploaderButton } from '../../lib/uploader/uploader-button.component';
import { RamaUploader } from '../../lib/uploader/uploader.component';

const meta: Meta<RamaSidePanel> = {
  title: 'Organismos/Panel lateral',
  component: RamaSidePanel,
  decorators: [moduleMetadata({
    imports: [RamaSidePanel, RamaPanelSection, RamaPanelField, RamaPanelChip, RamaButton, RamaAlert, RamaCheckbox, RamaInput, RamaTextarea,
      RamaUploader, RamaUploaderButton],
  })],
  parameters: { layout: 'padded' },
};
export default meta;

const TITLE = 'Revisar entrega de turno';
const DESC = 'Verifica la información registrada por el Operador Área 3.2 antes de aceptar o devolver la entrega.';

/** Campos de la entrega de turno (filas "Component 39/42/46" del Figma). */
const CAMPOS = [
  { label: '1. Puesto de trabajo', valor: 'Operador Área 3.2 · Estación Castilla 2', ok: false },
  { label: '2. Novedades operacionales', valor: 'Se ajustó la presión de descarga de la Bomba P-101 tras la alarma de VOI estándar en la ronda de las 10:00.', ok: false },
  { label: '3. Ronda asignada', valor: 'Ronda Sección Crudos EC2 – Turno A', ok: true },
  { label: '4. Tareas con desviación', valor: '2 de 18 tareas fuera de ventana operativa', ok: false, medium: false },
  { label: '5. Desviaciones corregidas', valor: '2', ok: false, medium: true },
  { label: '6. Estado de la entrega', valor: 'En revisión', ok: false, medium: true },
];

const MUCHOS = Array.from({ length: 6 }, (_, i) => ({ label: `${7 + i}. Tarea de ronda ${i + 1}`, valor: `Lectura registrada en la Bomba P-10${i + 1}`, ok: true }));

/** Contenido del cuerpo del panel (Big/Small × Scroll), reutilizado por varias historias. */
const BODY = (rows: string) => `
  <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
    <span style="font:700 14px/20px var(--rama-font);color:var(--rama-text-subtle)">Aprobado por:</span>
    <rama-panel-chip tone="purple">Supervisor de turno</rama-panel-chip>
    <rama-panel-chip tone="yellow">Coordinación</rama-panel-chip>
  </div>
  <rama-panel-section title="Detalle de la entrega: 1">
    @for (c of ${rows}; track c.label) {
      <rama-panel-field [label]="c.label" [size]="c.medium ? 'medium' : 'small'">
        <rama-checkbox field-check [(checked)]="c.ok">Validar {{ c.label }}</rama-checkbox>
        {{ c.valor }}
      </rama-panel-field>
    }
  </rama-panel-section>`;

const COMMENT = `<hr />
  <rama-textarea label="Comentario (Obligatorio)" placeholder="Ingresa un comentario..." [rows]="4" />`;

const FOOTER = `
  <rama-button panel-footer variant="outlined" size="xl" (click)="open = false">Cancelar</rama-button>
  <rama-button panel-footer size="xl" (click)="open = false">Devolver</rama-button>`;

export const Default: StoryObj<RamaSidePanel> = {
  name: 'Panel lateral',
  args: { size: 'big', side: 'right', closeOnBackdrop: true },
  argTypes: {
    size: { control: 'inline-radio', options: ['big', 'small', 'full'] },
    side: { control: 'inline-radio', options: ['right', 'left'] },
  },
  render: args => ({
    props: { ...args, open: true, campos: CAMPOS.slice(0, 4) },
    template: `
      <rama-button (click)="open = true">Abrir panel</rama-button>
      <rama-side-panel [(open)]="open" [size]="size" [side]="side" [closeOnBackdrop]="closeOnBackdrop" title="${TITLE}" description="${DESC}">
        ${BODY('campos')}
        ${COMMENT}
        ${FOOTER}
      </rama-side-panel>`,
  }),
};

export const TamanosScroll: StoryObj<RamaSidePanel> = {
  name: 'Tamaños y scroll',
  parameters: { docs: { description: { story: 'Figma "Component 185": Big (458×860) y Small (458×469), sin y con scroll. El cuerpo hace scroll cuando el contenido supera el alto; encabezado y footer quedan fijos.' } } },
  render: () => ({
    props: {
      pocos: CAMPOS.slice(0, 1),
      big: CAMPOS.slice(0, 4).map(c => ({ ...c })),
      bigScroll: [...CAMPOS, ...MUCHOS].map(c => ({ ...c })),
      smallScroll: CAMPOS.map(c => ({ ...c })),
    },
    template: `
      <div style="display:flex;flex-wrap:wrap;gap:32px;align-items:flex-start">
        <rama-side-panel mode="inline" size="big" [open]="true" title="${TITLE}" description="${DESC}">
          ${BODY('big')}${COMMENT}${FOOTER}
        </rama-side-panel>
        <rama-side-panel mode="inline" size="big" [open]="true" title="${TITLE}" description="${DESC}">
          ${BODY('bigScroll')}${COMMENT}${FOOTER}
        </rama-side-panel>
        <rama-side-panel mode="inline" size="small" [open]="true" title="${TITLE}" description="${DESC}">
          ${BODY('pocos')}${FOOTER}
        </rama-side-panel>
        <rama-side-panel mode="inline" size="small" [open]="true" title="${TITLE}" description="${DESC}">
          ${BODY('smallScroll')}${COMMENT}${FOOTER}
        </rama-side-panel>
      </div>`,
  }),
};

export const Encabezado: StoryObj<RamaSidePanel> = {
  name: 'Encabezado y footer',
  parameters: { docs: { description: { story: 'Panel/Header "Simple" (solo cierre, sin título: usa `ariaLabel`) y "with text" (título, descripción y separador). Footer "Open" con dos botones a lo ancho.' } } },
  render: () => ({
    template: `
      <div style="display:flex;flex-wrap:wrap;gap:32px;align-items:flex-start">
        <rama-side-panel mode="inline" size="small" [open]="true" ariaLabel="Filtros de rondas">
          <rama-panel-field label="Estación">Estación Castilla 2</rama-panel-field>
          <rama-panel-field label="Turno" size="medium">Turno A · 06:00 – 18:00</rama-panel-field>
          <rama-button panel-footer variant="outlined" size="xl">Limpiar</rama-button>
          <rama-button panel-footer size="xl">Aplicar</rama-button>
        </rama-side-panel>
        <rama-side-panel mode="inline" size="small" [open]="true" title="${TITLE}" description="${DESC}">
          <rama-panel-field label="Cargo que entrega">Operador Área 3.2</rama-panel-field>
          <rama-panel-field label="Cargo que recibe">Supervisor de turno</rama-panel-field>
          <rama-button panel-footer variant="outlined" size="xl">Cancelar</rama-button>
          <rama-button panel-footer size="xl">Devolver</rama-button>
        </rama-side-panel>
      </div>`,
  }),
};

export const TiposContenido: StoryObj<RamaPanelSection> = {
  name: 'Tipos de contenido',
  parameters: { docs: { description: { story: 'Figma "Component 188": Stroke/Content (caja con borde), Outline/Content (encabezado clave: valor sin borde, valor con scroll interno) y Acordeón (botón con `aria-expanded`; hover, foco y deshabilitado completados con tokens).' } } },
  render: () => ({
    props: { campos: CAMPOS.map(c => ({ ...c })), abierto: true },
    template: `
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,417px),1fr));gap:32px;align-items:start;max-width:1340px">
        <rama-panel-section type="stroke" title="Detalle de la entrega: 1">
          @for (c of campos; track c.label) {
            <rama-panel-field [label]="c.label" [size]="c.medium ? 'medium' : 'small'">
              <rama-checkbox field-check [(checked)]="c.ok">Validar {{ c.label }}</rama-checkbox>
              {{ c.valor }}
            </rama-panel-field>
          }
        </rama-panel-section>
        <rama-panel-section type="outline" title="Estado:" value="Devuelto por el Supervisor de turno">
          <rama-panel-field label="Comentario de la devolución." [maxHeight]="87">
            Falta registrar la lectura de presión de succión de la Bomba P-101 en la ronda de las 14:00. Completa la tarea pendiente
            y adjunta la evidencia fotográfica de la corrección de la desviación antes de volver a enviar la entrega de turno.
            Recuerda validar la ventana operativa con la Coordinación de la Estación Castilla 2.
          </rama-panel-field>
        </rama-panel-section>
        <div style="display:flex;flex-direction:column;gap:16px">
          <rama-panel-section type="accordion" title="Evidencias de la ronda" counter="(3/3 documentos cargados)" [(expanded)]="abierto">
            <rama-uploader-button state="success" [showSuccessNotice]="false" fileName="Evidencia_bomba_P-101_EC2.pdf" />
            <rama-uploader-button state="success" [showSuccessNotice]="false" fileName="Lecturas_tanque_T-203_EC2.pdf" />
            <rama-uploader-button state="success" [showSuccessNotice]="false" fileName="Acta_entrega_turno_A.pdf" />
          </rama-panel-section>
          <rama-panel-section type="accordion" title="Documentos de planeación" counter="(0/3 documentos cargados)" [expanded]="false" />
          <rama-panel-section type="accordion" title="Anexos (deshabilitado)" [expanded]="false" [disabled]="true" />
        </div>
      </div>`,
  }),
};

export const ContenidoPanel: StoryObj<RamaSidePanel> = {
  name: 'Componentes dentro del panel',
  parameters: { docs: { description: { story: 'Componentes reutilizados dentro del panel: alertas compactas, checkbox, input, campo deshabilitado, textarea con error y uploader.' } } },
  render: () => ({
    template: `
      <rama-side-panel mode="inline" size="full" [open]="true" title="Adjuntar soportes de la ronda" description="Sube las evidencias de la ronda de la Estación Castilla 2 antes de enviar la entrega de turno.">
        <rama-alert variant="compact" state="error" title="Por favor, selecciona los ítems de la entrega por los cuales la devuelves." />
        <rama-alert variant="compact" state="information" title="Necesitarás el número de la orden de trabajo generada en el sistema para ingresarlo aquí." />
        <rama-alert variant="compact" state="success" title="Documento se ha cargado con éxito." />
        <div style="display:flex;gap:24px;flex-wrap:wrap">
          <rama-checkbox>Por defecto</rama-checkbox>
          <rama-checkbox [checked]="true">Seleccionado</rama-checkbox>
          <rama-checkbox class="is-focus">Foco</rama-checkbox>
          <rama-checkbox [disabled]="true">Deshabilitado</rama-checkbox>
        </div>
        <rama-input label="Orden de trabajo" placeholder="Número de la orden" size="small" />
        <rama-panel-field label="5. Sección" size="medium">Sección Crudos EC2</rama-panel-field>
        <rama-textarea label="Comentario (Obligatorio)" placeholder="Ingresa un comentario..." [rows]="5" error="Por favor ingresa un comentario" />
        <rama-uploader [fullWidth]="true" label="Sube uno o varios documentos" />
        <rama-uploader-button label="Evidencia de la ronda (Obligatorio)" />
        <rama-uploader-button state="success" fileName="Evidencia_bomba_P-101_EC2.pdf" />
        <rama-button panel-footer variant="outlined" size="xl">Cancelar</rama-button>
        <rama-button panel-footer size="xl">Enviar</rama-button>
      </rama-side-panel>`,
  }),
};
