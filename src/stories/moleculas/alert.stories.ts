import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';
import { RamaAlert } from '../../lib/alert/alert.component';

const states = ['success', 'information', 'caution', 'warning', 'error'];
type Args = RamaAlert & { description: string };

const meta: Meta<Args> = {
  title: 'Moléculas/Alert',
  component: RamaAlert,
  decorators: [moduleMetadata({ imports: [RamaAlert] })],
  parameters: { layout: 'padded' },
  argTypes: {
    state: { control: 'inline-radio', options: states },
    variant: { control: 'inline-radio', options: ['default', 'compact'] },
  },
  args: {
    state: 'success', variant: 'default', dismissible: true,
    title: '¡Entrega de turno guardada con éxito!',
    description: 'El reporte de la entrega de turno se ha creado y guardado correctamente.',
  },
};
export default meta;

export const Playground: StoryObj<Args> = {
  render: (args) => ({
    props: args,
    template: `<div style="max-width:816px"><rama-alert [state]="state" [variant]="variant" [title]="title" [dismissible]="dismissible">{{ description }}</rama-alert></div>`,
  }),
};

export const Estados: StoryObj<Args> = {
  render: () => ({
    props: {
      items: [
        { state: 'success', title: '¡Ronda guardada con éxito!', text: 'La ronda se ha registrado y guardado correctamente.' },
        { state: 'information', title: 'Entrega de turno pendiente', text: 'El Supervisor de Estación aún no ha aceptado el reporte del turno anterior.' },
        { state: 'error', title: 'No se pudo guardar la directriz', text: 'Ocurrió un error inesperado al guardar. Intenta de nuevo en unos minutos.' },
        { state: 'warning', title: 'Valor fuera de ventana operativa', text: 'La presión de descarga supera la VOI estándar. Comentario y causa obligatorios.' },
        { state: 'caution', title: 'Ronda próxima a vencer', text: 'Quedan 20 minutos para completar la ronda de este turno.' },
      ],
    },
    template: `
      <div class="sb-doc" style="display:flex;flex-direction:column;gap:24px;max-width:816px">
        <p class="sb-lead">Set "Alerts" de Figma: Success, Information y Error (816 px, relleno 24). Warning y Caution no existen en Figma y se completaron con sus tokens semánticos (<code>--rama-warning-*</code>, <code>--rama-caution-*</code>) y el ícono de Error. Error usa <code>role="alert"</code> (se anuncia de inmediato) y el resto <code>role="status"</code>.</p>
        @for (a of items; track a.state) { <rama-alert [state]="a.state" [title]="a.title">{{ a.text }}</rama-alert> }
      </div>`,
  }),
};

export const SinTituloNiCierre: StoryObj<Args> = {
  name: 'Sin título / sin cerrar',
  render: () => ({
    template: `
      <div class="sb-doc" style="display:flex;flex-direction:column;gap:24px;max-width:816px">
        <p class="sb-lead">Título y botón de cerrar son opcionales (<code>title</code>, <code>dismissible</code>). Sin botón, la alerta queda fija hasta que cambie el estado de la pantalla.</p>
        <rama-alert state="information">Las rondas del turno A8 se habilitan a las 06:00.</rama-alert>
        <rama-alert state="success" title="¡Directriz publicada!" [dismissible]="false">Los operadores del área ya pueden leerla desde Mi puesto.</rama-alert>
      </div>`,
  }),
};

export const Compacta: StoryObj<Args> = {
  name: 'Compacta (notificación)',
  render: () => ({
    template: `
      <div class="sb-doc" style="display:flex;flex-direction:column;gap:12px;max-width:816px">
        <p class="sb-lead">"Semantic Notification": relleno 12, radio 14, título Bold y descripción Medium 14/20. Íconos de Figma: <code>checks</code> (éxito) y <code>alert</code> (información y error, este último de 18 px); el cierre es el <code>close</code> relleno.</p>
        <rama-alert state="success" variant="compact" title="¡Ronda enviada con éxito!">La ronda se procesó correctamente y se envió al Supervisor de Estación para su revisión.</rama-alert>
        <rama-alert state="information" variant="compact">Para agilizar tu gestión, precargamos la plantilla de la ronda anterior. Revisa los datos, haz los cambios que necesites o agrega nuevas tareas.</rama-alert>
        <rama-alert state="error" variant="compact" title="No se pudo guardar y enviar la ronda">Ocurrió un error inesperado al guardar y enviar la ronda.</rama-alert>
        <rama-alert state="warning" variant="compact" title="Desviación sin acción asignada">Registra la acción de análisis operacional antes de cerrar el turno.</rama-alert>
      </div>`,
  }),
};

export const EnPagina: StoryObj<Args> = {
  name: 'En página',
  parameters: { layout: 'fullscreen' },
  render: () => ({
    template: `
      <div style="background:var(--rama-bg-default-white);min-height:100vh;font-family:var(--rama-font)">
        <div style="height:80px;background:var(--rama-bg-subtle);border-bottom:var(--rama-border-width-thin) solid var(--rama-border-inset)"></div>
        <div style="max-width:1440px;margin:0 auto;padding:var(--rama-space-24) clamp(16px,5.5vw,80px);display:flex;flex-direction:column;gap:var(--rama-space-24)">
          <rama-alert state="success" variant="compact" title="¡Rondas por corregir enviadas con éxito!">Tu envío se procesó correctamente. Se envió a las áreas correspondientes para que continúen con la gestión.</rama-alert>
          <div>
            <p style="margin:0;font-size:20px;line-height:24px;font-weight:var(--rama-weight-bold);color:var(--rama-text-default-black)">Rondas por corregir</p>
            <p style="margin:4px 0 0;font-size:16px;line-height:24px;color:var(--rama-text-muted)">Contenido de la página (tabla, filtros…) debajo de la alerta.</p>
          </div>
        </div>
      </div>`,
  }),
};
