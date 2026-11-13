import {
  ChangeDetectionStrategy, Component, computed, forwardRef, inject, input, model, signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

let nextGroupId = 0;

/**
 * Grupo de radios Rama (Figma: 6 Check / Radio → RadioButton). Es el que conecta con
 * ngModel / formularios. `variant` elige la marca del seleccionado: `check` (círculo con
 * chulo, Figma "Checked") o `dot` (círculo con punto, Figma "Dot").
 * Los radios usan inputs nativos con el mismo name, así que las flechas mueven la selección.
 */
@Component({
  selector: 'rama-radio-group',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => RamaRadioGroup), multi: true }],
  host: { role: 'radiogroup', '[attr.aria-label]': 'ariaLabel()', '[class.horizontal]': "orientation() === 'horizontal'" },
  template: `<ng-content />`,
  styles: `
    :host { display: inline-flex; flex-direction: column; gap: var(--rama-space-12); }
    :host(.horizontal) { flex-direction: row; flex-wrap: wrap; gap: var(--rama-space-24); }
  `,
})
export class RamaRadioGroup implements ControlValueAccessor {
  readonly value = model<unknown>(null);
  readonly name = input(`rama-radio-${nextGroupId++}`);
  readonly variant = input<'check' | 'dot'>('dot');
  readonly size = input<'medium' | 'small'>('medium');
  readonly disabled = input(false);
  readonly orientation = input<'vertical' | 'horizontal'>('vertical');
  readonly ariaLabel = input<string>();

  private readonly formDisabled = signal(false);
  readonly isDisabled = computed(() => this.disabled() || this.formDisabled());

  private onChange: (v: unknown) => void = () => {};
  onTouched: () => void = () => {};

  select(v: unknown) { this.value.set(v); this.onChange(v); }

  writeValue(v: unknown) { this.value.set(v); }
  registerOnChange(fn: (v: unknown) => void) { this.onChange = fn; }
  registerOnTouched(fn: () => void) { this.onTouched = fn; }
  setDisabledState(d: boolean) { this.formDisabled.set(d); }
}

/** Opción de radio. Debe ir dentro de `<rama-radio-group>`. */
@Component({
  selector: 'rama-radio',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <label class="rb" [class.small]="group.size() === 'small'" [class.disabled]="isDisabled()">
      <span class="circle" [class.on]="checked()" [class.dot]="group.variant() === 'dot'">
        <input type="radio" class="native" [name]="group.name()" [checked]="checked()" [disabled]="isDisabled()"
          (change)="group.select(value())" (blur)="group.onTouched()" />
        @if (checked()) {
          @if (group.variant() === 'check') {
            <svg class="mark" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 12L11 15L16 10" /></svg>
          } @else {
            <span class="inner" aria-hidden="true"></span>
          }
        }
      </span>
      <span class="text"><ng-content /></span>
    </label>
  `,
  styles: `
    :host { display: inline-flex; }
    :host { --_border-disabled: var(--rama-border-default); }
    .rb { display: inline-flex; align-items: center; gap: var(--rama-space-8); cursor: pointer;
      font: var(--rama-weight-medium) 16px/normal var(--rama-font); letter-spacing: -0.32px; color: var(--rama-text-default-black); }
    .rb.small { font-size: 14px; line-height: 16px; letter-spacing: 0; }
    .text:empty { display: none; }

    .circle { position: relative; flex: none; width: 24px; height: 24px; border-radius: var(--rama-radius-full);
      border: var(--rama-border-width-thin) solid var(--rama-border-inset); background: var(--rama-bg-default-white);
      display: inline-flex; align-items: center; justify-content: center; transition: background-color .15s, border-color .15s, box-shadow .15s; }
    .small .circle { width: 16px; height: 16px; }
    .native { position: absolute; inset: -1px; margin: 0; opacity: 0; cursor: inherit; border-radius: 50%; }
    .mark { width: 100%; height: 100%; fill: none; stroke: var(--rama-text-default-white); stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
    .inner { width: 8px; height: 8px; border-radius: var(--rama-radius-full); background: var(--rama-bg-default-white); }
    .small .inner { width: 6px; height: 6px; }

    .rb:hover .circle, :host(.is-hover) .circle { background: var(--rama-bg-inset); border-color: var(--rama-border-primary); }
    .circle.on { background: var(--rama-primary-fill); border-color: var(--rama-border-primary); }
    .rb:hover .circle.on, :host(.is-hover) .circle.on { background: var(--rama-primary-surface); }
    .rb:hover .on .mark, :host(.is-hover) .on .mark { stroke: var(--rama-text-primary); }
    .rb:hover .on .inner, :host(.is-hover) .on .inner { background: var(--rama-text-primary); }
    .circle:has(.native:focus-visible), :host(.is-focus) .circle { background: var(--rama-bg-default-white); border-color: var(--rama-border-primary); box-shadow: var(--rama-focus-ring); }
    .circle:has(.native:focus-visible) .mark, :host(.is-focus) .mark { stroke: var(--rama-text-primary); }
    .circle:has(.native:focus-visible) .inner, :host(.is-focus) .inner { background: var(--rama-text-primary); }

    .rb.disabled { cursor: not-allowed; color: var(--rama-text-disabled); }
    .rb.disabled .circle, .rb.disabled:hover .circle { background: var(--rama-bg-subtle); border-color: var(--_border-disabled); box-shadow: none; }
    .rb.disabled .mark { stroke: var(--rama-text-disabled); }
    .rb.disabled .inner { background: var(--rama-text-disabled); }
  `,
})
export class RamaRadio {
  readonly group = inject(RamaRadioGroup);
  readonly value = input.required<unknown>();
  readonly disabled = input(false);

  readonly checked = computed(() => this.group.value() === this.value());
  readonly isDisabled = computed(() => this.disabled() || this.group.isDisabled());
}
