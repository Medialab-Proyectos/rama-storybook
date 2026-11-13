import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';
import { RamaCalendar } from '../../lib/calendar/calendar.component';
import { RamaDatepicker } from '../../lib/calendar/datepicker.component';

// Fechas fijas del ejemplo de Figma: hoy 17 de mayo de 2025, días anteriores deshabilitados.
const today = new Date(2025, 4, 17);

const meta: Meta = {
  title: 'Organismos/Datepicker',
  decorators: [moduleMetadata({ imports: [RamaCalendar, RamaDatepicker] })],
  parameters: { layout: 'padded' },
};
export default meta;

export const Uso: StoryObj = {
  render: () => ({
    props: { today, d1: null, d2: today, r: { start: null, end: null } },
    template: `
      <div class="sb-doc" style="min-height:560px">
        <p class="sb-lead">Campo de fecha con el calendario en un panel. Se abre con clic, Enter o flecha abajo; se cierra con Esc, "Cancelar" o clic afuera.</p>
        <div style="display:flex;gap:32px;align-items:flex-start;flex-wrap:wrap">
          <rama-datepicker label="Fecha de la ronda" [required]="true" [today]="today" [min]="today" [(value)]="d1" />
          <rama-datepicker label="Fecha del turno" [required]="true" [today]="today" [(value)]="d2" />
          <rama-datepicker mode="range" label="Periodo del reporte" [required]="true" [today]="today" [(range)]="r" />
        </div>
      </div>`,
  }),
};

export const Estados: StoryObj = {
  render: () => ({
    props: { today },
    template: `
      <div class="sb-doc" style="display:flex;gap:32px;flex-wrap:wrap">
        <div><code>Enable</code><br><br><rama-datepicker label="Fecha de la ronda" [required]="true" /></div>
        <div><code>Full</code><br><br><rama-datepicker label="Fecha de la ronda" [required]="true" [value]="today" /></div>
        <div><code>Disabled</code><br><br><rama-datepicker label="Fecha de la ronda" [required]="true" [disabled]="true" /></div>
        <div><code>Error</code><br><br><rama-datepicker label="Fecha de la ronda" [required]="true" error="Ingresa una fecha válida" /></div>
      </div>`,
  }),
};

export const Tamanos: StoryObj = {
  name: 'Tamaños',
  render: () => ({
    props: { today },
    template: `
      <div class="sb-doc">
        <p class="sb-lead">Figma 17 Calendar · Datepicker: medium (200×88, caja de 48px) y small (200×84, caja de 44px con etiqueta y textos más pequeños).</p>
        <div style="display:flex;gap:32px;flex-wrap:wrap;align-items:flex-start">
          <div><code>Medium</code><br><br><rama-datepicker label="Fecha de la ronda" [required]="true" [today]="today" /></div>
          <div><code>Small</code><br><br><rama-datepicker size="small" label="Fecha de la ronda" [required]="true" [today]="today" /></div>
          <div><code>Small · Full</code><br><br><rama-datepicker size="small" label="Fecha de la ronda" [required]="true" [today]="today" [value]="today" /></div>
          <div><code>Small · Disabled</code><br><br><rama-datepicker size="small" label="Fecha de la ronda" [required]="true" [disabled]="true" /></div>
          <div><code>Small · Error</code><br><br><rama-datepicker size="small" label="Fecha de la ronda" [required]="true" error="Ingresa una fecha válida" /></div>
        </div>
      </div>`,
  }),
};

export const Ejemplo: StoryObj = {
  name: 'Ejemplo (Figma)',
  render: () => ({
    props: { today, d1: null, d2: today, r: { start: today, end: today } },
    template: `
      <div class="sb-doc" style="min-height:520px">
        <p class="sb-lead">Ejemplo de Figma: campos sin texto de apoyo (200×68 y 259×68 para rango). El calendario se abre 10px debajo de la caja, con 559px de ancho.</p>
        <div style="display:flex;gap:62px;align-items:flex-start;flex-wrap:wrap">
          <rama-datepicker label="Fecha de la ronda" [required]="true" helpText="" [today]="today" [min]="today" [(value)]="d1" />
          <rama-datepicker label="Fecha del turno" [required]="true" helpText="" [today]="today" [min]="today" [(value)]="d2" />
          <rama-datepicker mode="range" label="Periodo del reporte" [required]="true" helpText="" [today]="today" [min]="today" [(range)]="r" />
        </div>
      </div>`,
  }),
};
