import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';
import { FormsModule } from '@angular/forms';
import { RamaCheckbox } from '../../lib/checkbox/checkbox.component';
import { RamaRadio, RamaRadioGroup } from '../../lib/radio/radio.component';

const states = [
  { label: 'Default', cls: '', disabled: false },
  { label: 'Hover', cls: 'is-hover', disabled: false },
  { label: 'Focus', cls: 'is-focus', disabled: false },
  { label: 'Disabled', cls: '', disabled: true },
];

const meta: Meta = {
  title: 'Átomos/Checkbox y Radio',
  decorators: [moduleMetadata({ imports: [RamaCheckbox, RamaRadio, RamaRadioGroup, FormsModule] })],
  parameters: { layout: 'padded' },
};
export default meta;

export const Checkbox: StoryObj = {
  render: () => ({
    props: { states, sizes: ['medium', 'small'] },
    template: `
      <div class="sb-doc">
        <p class="sb-lead">Tres tipos: sin marcar, marcado e indeterminado (para "seleccionar todo" cuando solo hay algunos marcados). Se activa con clic en la caja o el texto, o con Espacio.</p>
        @for (sz of sizes; track sz) {
          <h2 style="font-size:14px">{{ sz === 'medium' ? 'Medium · 24px' : 'Small · 16px' }}</h2>
          <table class="sb-table" style="width:auto">
            <thead><tr><th></th><th>Sin marcar</th><th>Marcado</th><th>Indeterminado</th></tr></thead>
            <tbody>
              @for (s of states; track s.label) {
                <tr><td><b>{{ s.label }}</b></td>
                  <td><rama-checkbox [class]="s.cls" [size]="sz" [disabled]="s.disabled">Texto</rama-checkbox></td>
                  <td><rama-checkbox [class]="s.cls" [size]="sz" [disabled]="s.disabled" [checked]="true">Texto</rama-checkbox></td>
                  <td><rama-checkbox [class]="s.cls" [size]="sz" [disabled]="s.disabled" [indeterminate]="true">Texto</rama-checkbox></td>
                </tr>
              }
            </tbody>
          </table>
        }
      </div>`,
  }),
};

export const CheckboxConFormulario: StoryObj = {
  name: 'Checkbox con ngModel',
  render: () => ({
    props: {
      items: [
        { label: 'Ronda de equipos rotativos', ok: true },
        { label: 'Ronda de tanques', ok: false },
        { label: 'Ronda de pozos', ok: false },
      ],
      all(items: { ok: boolean }[]) { return items.every(i => i.ok); },
      some(items: { ok: boolean }[]) { return items.some(i => i.ok) && !items.every(i => i.ok); },
      setAll(items: { ok: boolean }[], v: boolean) { items.forEach(i => (i.ok = v)); },
    },
    template: `
      <div class="sb-doc" style="display:flex;flex-direction:column;gap:12px">
        <rama-checkbox [checked]="all(items)" [indeterminate]="some(items)" (checkedChange)="setAll(items, $event)">Seleccionar todas las rondas</rama-checkbox>
        <div style="display:flex;flex-direction:column;gap:12px;padding-left:32px">
          @for (it of items; track it.label) { <rama-checkbox [(ngModel)]="it.ok">{{ it.label }}</rama-checkbox> }
        </div>
      </div>`,
  }),
};

export const Radio: StoryObj = {
  render: () => ({
    props: { states, sizes: ['medium', 'small'] },
    template: `
      <div class="sb-doc">
        <p class="sb-lead">El seleccionado se marca con chulo (<code>variant="check"</code>) o con punto (<code>variant="dot"</code>). Las flechas del teclado mueven la selección dentro del grupo.</p>
        @for (sz of sizes; track sz) {
          <h2 style="font-size:14px">{{ sz === 'medium' ? 'Medium · 24px' : 'Small · 16px' }}</h2>
          <table class="sb-table" style="width:auto">
            <thead><tr><th></th><th>Sin seleccionar</th><th>Seleccionado · check</th><th>Seleccionado · dot</th></tr></thead>
            <tbody>
              @for (s of states; track s.label) {
                <tr><td><b>{{ s.label }}</b></td>
                  <td><rama-radio-group [size]="sz" [disabled]="s.disabled"><rama-radio [class]="s.cls" value="a">Texto</rama-radio></rama-radio-group></td>
                  <td><rama-radio-group [size]="sz" [disabled]="s.disabled" variant="check" value="a"><rama-radio [class]="s.cls" value="a">Texto</rama-radio></rama-radio-group></td>
                  <td><rama-radio-group [size]="sz" [disabled]="s.disabled" variant="dot" value="a"><rama-radio [class]="s.cls" value="a">Texto</rama-radio></rama-radio-group></td>
                </tr>
              }
            </tbody>
          </table>
        }
      </div>`,
  }),
};

export const RadioConFormulario: StoryObj = {
  name: 'Radio con ngModel',
  render: () => ({
    props: { turno: 'nocturno' },
    template: `
      <div class="sb-doc">
        <rama-radio-group [(ngModel)]="turno" ariaLabel="Turno" orientation="horizontal">
          <rama-radio value="diurno">Turno diurno</rama-radio>
          <rama-radio value="nocturno">Turno nocturno</rama-radio>
          <rama-radio value="mixto" [disabled]="true">Turno mixto</rama-radio>
        </rama-radio-group>
      </div>`,
  }),
};
