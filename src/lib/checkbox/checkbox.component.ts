import { ChangeDetectionStrategy, Component, computed, forwardRef, input, model, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

/**
 * Checkbox Rama (Figma: 6 Check / Radio → CheckButton). Usa un input nativo invisible para
 * teclado (Espacio), foco y lectores de pantalla. Funciona con ngModel y formularios reactivos
 * (valor booleano). `indeterminate` muestra el guion y se limpia al cambiar.
 * Las clases de host `is-hover` / `is-focus` solo fijan estados en la documentación.
 */
@Component({
  selector: 'rama-checkbox',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => RamaCheckbox), multi: true }],
  template: `
    <label class="cb" [class.small]="size() === 'small'" [class.disabled]="isDisabled()">
      <span class="box" [class.on]="checked() || indeterminate()">
        <input type="checkbox" class="native" [checked]="checked()" [indeterminate]="indeterminate()" [disabled]="isDisabled()"
          [attr.aria-checked]="indeterminate() ? 'mixed' : checked()" (change)="onToggle($event)" (blur)="onTouched()" />
        @if (indeterminate()) {
          <svg class="mark" viewBox="0 0 24 24" aria-hidden="true"><path d="M16 12H8" /></svg>
        } @else if (checked()) {
          <svg class="mark" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 12L11 15L16 10" /></svg>
        }
      </span>
      <span class="text"><ng-content /></span>
    </label>
  `,
  styles: `
    :host { display: inline-flex; }
    :host { --_border-disabled: var(--rama-border-default); }
    .cb { display: inline-flex; align-items: center; gap: var(--rama-space-8); cursor: pointer;
      font: var(--rama-weight-medium) 16px/normal var(--rama-font); letter-spacing: -0.32px; color: var(--rama-text-default-black); }
    .cb.small { font-size: 14px; line-height: 16px; letter-spacing: 0; }
    .text:empty { display: none; }

    .box { position: relative; flex: none; width: 24px; height: 24px; border-radius: 6px;
      border: var(--rama-border-width-thin) solid var(--rama-border-inset); background: var(--rama-bg-default-white);
      display: inline-flex; align-items: center; justify-content: center; transition: background-color .15s, border-color .15s, box-shadow .15s; }
    .small .box { width: 16px; height: 16px; border-radius: var(--rama-radius-xs); }
    .native { position: absolute; inset: -1px; margin: 0; opacity: 0; cursor: inherit; }
    .mark { width: 100%; height: 100%; fill: none; stroke: var(--rama-text-default-white); stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }

    .cb:hover .box, :host(.is-hover) .box { background: var(--rama-bg-inset); border-color: var(--rama-border-primary); }
    .box.on { background: var(--rama-primary-fill); border-color: var(--rama-border-primary); }
    .cb:hover .box.on, :host(.is-hover) .box.on { background: var(--rama-primary-surface); }
    .cb:hover .box.on .mark, :host(.is-hover) .box.on .mark { stroke: var(--rama-text-primary); }
    .box:has(.native:focus-visible), :host(.is-focus) .box { background: var(--rama-bg-default-white); border-color: var(--rama-border-primary); box-shadow: var(--rama-focus-ring); }
    .box:has(.native:focus-visible) .mark, :host(.is-focus) .mark { stroke: var(--rama-text-primary); }

    .cb.disabled { cursor: not-allowed; color: var(--rama-text-disabled); }
    .cb.disabled .box, .cb.disabled:hover .box { background: var(--rama-bg-subtle); border-color: var(--_border-disabled); box-shadow: none; }
    .cb.disabled .mark { stroke: var(--rama-text-disabled); }
  `,
})
export class RamaCheckbox implements ControlValueAccessor {
  readonly checked = model(false);
  readonly indeterminate = model(false);
  readonly disabled = input(false);
  readonly size = input<'medium' | 'small'>('medium');

  private readonly formDisabled = signal(false);
  readonly isDisabled = computed(() => this.disabled() || this.formDisabled());

  private onChange: (v: boolean) => void = () => {};
  onTouched: () => void = () => {};

  onToggle(e: Event) {
    const value = (e.target as HTMLInputElement).checked;
    this.indeterminate.set(false);
    this.checked.set(value);
    this.onChange(value);
  }

  writeValue(v: unknown) { this.checked.set(!!v); }
  registerOnChange(fn: (v: boolean) => void) { this.onChange = fn; }
  registerOnTouched(fn: () => void) { this.onTouched = fn; }
  setDisabledState(d: boolean) { this.formDisabled.set(d); }
}
