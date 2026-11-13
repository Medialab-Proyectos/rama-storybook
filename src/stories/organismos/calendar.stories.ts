import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';
import { RamaCalendar } from '../../lib/calendar/calendar.component';
import { RamaDatepicker } from '../../lib/calendar/datepicker.component';

// Fechas fijas del ejemplo de Figma: hoy 17 de mayo de 2025, días anteriores deshabilitados.
const today = new Date(2025, 4, 17);

const meta: Meta = {
  title: 'Organismos/Calendar',
  decorators: [moduleMetadata({ imports: [RamaCalendar, RamaDatepicker] })],
  parameters: { layout: 'padded' },
};
export default meta;

export const Simple: StoryObj = {
  render: () => ({
    props: { today, value: today },
    template: `
      <div class="sb-doc">
        <p class="sb-lead">Selección de una fecha. Teclado: flechas para moverse, Inicio/Fin para ir al inicio o fin de la semana, RePág/AvPág para cambiar de mes (con Mayús, de año) y Enter para elegir.</p>
        <rama-calendar [today]="today" [min]="today" [(value)]="value" />
      </div>`,
  }),
};

export const Rango: StoryObj = {
  render: () => ({
    props: { today, range: { start: today, end: new Date(2025, 4, 19) } },
    template: `
      <div class="sb-doc">
        <p class="sb-lead">Selección de rango: el primer clic marca el inicio y el segundo el fin; los días intermedios quedan con la banda gris.</p>
        <rama-calendar mode="range" [today]="today" [min]="today" [(range)]="range" />
      </div>`,
  }),
};

