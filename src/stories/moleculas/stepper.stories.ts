import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';
import { RamaStepper, StepperItem } from '../../lib/stepper/stepper.component';
import { RamaButton } from '../../lib/button/button.component';

const iniciarSesion: StepperItem[] = [
  { label: 'Datos básicos' }, { label: 'Asistentes' }, { label: 'Configuración agenda' },
];

const meta: Meta<RamaStepper> = {
  title: 'Moléculas/Stepper',
  component: RamaStepper,
  decorators: [moduleMetadata({ imports: [RamaStepper, RamaButton] })],
  parameters: { layout: 'padded' },
  args: { steps: iniciarSesion, current: 0, linear: true, clickable: true, ariaLabel: 'Pasos para iniciar la sesión' },
  argTypes: { current: { control: { type: 'number', min: 0, max: 2, step: 1 } } },
};
export default meta;

export const Playground: StoryObj<RamaStepper> = {
  render: (args) => ({
    props: { ...args },
    template: `<div style="max-width:1185px"><rama-stepper [steps]="steps" [(current)]="current" [linear]="linear" [clickable]="clickable" [ariaLabel]="ariaLabel" /></div>`,
  }),
};

export const Estados: StoryObj<RamaStepper> = {
  name: 'Estados de los pasos',
  render: () => ({
    props: { steps: iniciarSesion },
    template: `
      <div class="sb-doc" style="display:flex;flex-direction:column;gap:28px;max-width:1185px">
        <p class="sb-lead" style="margin:0">Cada paso tiene tres estados. <b>Completado</b>: círculo y conector en primario. <b>Activo</b>: círculo en primario y etiqueta semibold en color primario (<code>aria-current="step"</code>). <b>Pendiente</b>: círculo blanco con borde y número en gris.</p>
        <div><code>Paso 1 activo</code><rama-stepper [steps]="steps" [current]="0" /></div>
        <div><code>Paso 2 activo</code><rama-stepper [steps]="steps" [current]="1" /></div>
        <div><code>Paso 3 activo</code><rama-stepper [steps]="steps" [current]="2" /></div>
        <div><code>Solo informativo (clickable = false)</code><rama-stepper [steps]="steps" [current]="1" [clickable]="false" /></div>
      </div>`,
  }),
};

export const Asistente: StoryObj<RamaStepper> = {
  name: 'En un asistente (Iniciar sesión)',
  render: () => ({
    props: {
      steps: iniciarSesion, paso: 0,
      subtitulos: ['Configure los datos antes de comenzar', 'Asistentes internos y externos (opcional)', 'Responsables y duración de la agenda'],
    },
    template: `
      <div class="sb-doc" style="display:flex;flex-direction:column;gap:16px;max-width:1185px">
        <p class="sb-lead" style="margin:0">Lineal: con «Siguiente» se avanza y con «Atrás» o el número de un paso ya completado se vuelve sin perder lo escrito. Los números de los pasos siguientes no responden: no se puede saltar del 1 al 3.</p>
        <p style="margin:0;font:var(--rama-weight-regular) 14px/16px var(--rama-font);color:var(--rama-text-muted)">{{ subtitulos[paso] }}</p>
        <rama-stepper [steps]="steps" [(current)]="paso" ariaLabel="Pasos para iniciar la sesión" />
        <div style="display:flex;gap:16px;align-items:center">
          @if (paso > 0) { <rama-button variant="ghost" size="small" leadIcon="arrow-left" (click)="paso = paso - 1">Atrás</rama-button> }
          <span style="flex:1"></span>
          <rama-button variant="filled" size="large" [trailIcon]="paso < 2 ? 'arrow-right' : undefined" (click)="paso = paso < 2 ? paso + 1 : paso">{{ paso < 2 ? 'Siguiente' : 'Iniciar sesión' }}</rama-button>
        </div>
      </div>`,
  }),
};
