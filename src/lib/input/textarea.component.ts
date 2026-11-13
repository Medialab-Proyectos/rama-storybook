import { ChangeDetectionStrategy, Component, computed, forwardRef, input, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { RamaIcon } from '../icon/icon.component';
import { FIELD_STYLES, FieldSize, LabelColor, uniqueFieldId } from './field.styles';

/**
 * Área de texto Rama (Figma: 13 Inputs · Text Area). Mismos estados que el input; tamaños medium y small.
 * Partes opcionales del diseño: tooltip (ícono de info dentro de la caja) y acciones dentro de la caja
 * ("Button inset"): se proyectan con el atributo `textarea-actions`, p. ej.
 * `<rama-button textarea-actions variant="outlined" size="xs">…</rama-button>`.
 *
 * Alto: sin `rows`, la caja mide 140px como el componente de Figma (188px con etiqueta y textos de
 * apoyo). Con `rows`, el alto sale de las filas (p. ej. el formulario "Crear sentencia" usa 3).
 */
@Component({
  selector: 'rama-textarea',
  imports: [RamaIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => RamaTextarea), multi: true }],
  host: {
    '[class.has-error]': '!!error()', '[class.is-disabled]': 'isDisabled()', '[class.size-small]': "size() === 'small'", '[class.is-filled]': '!!value()',
    '[class.auto-height]': 'rows() == null',
    // En Figma la etiqueta del text area es Primary también dentro de formularios (modal "Crear sentencia").
    '[class.label-primary]': "(labelColor() ?? 'primary') === 'primary'", '[class.label-secondary]': "labelColor() === 'secondary'",
  },
  template: `
    @if (label()) {
      <label class="label" [attr.for]="id">{{ label() }}@if (required()) {<span class="req" aria-hidden="true">*</span>}@if (labelTooltip()) {<span class="label-tip" [title]="labelTooltip()" role="img" [attr.aria-label]="labelTooltip()"><rama-icon name="info-circle" [size]="14" /></span>}</label>
    }
    <div class="box" (click)="$event.target === $event.currentTarget && control.focus()">
      <textarea #control class="control" [id]="id" [rows]="rows() ?? 2" [value]="value()" [placeholder]="placeholder()" [disabled]="isDisabled()"
        [attr.maxlength]="maxLength() ?? null" [attr.aria-invalid]="!!error()" [attr.aria-required]="required()"
        [attr.aria-describedby]="hasLower() ? id + '-help' : null" (input)="onInput(control.value)" (blur)="onTouched()"></textarea>
      @if (tooltip()) { <span class="tip" [title]="tooltip()" [attr.aria-label]="tooltip()" role="img"><rama-icon name="info-circle" [size]="18" /></span> }
      <ng-content select="[textarea-actions]" />
    </div>
    @if (hasLower()) {
      <div class="lower" [id]="id + '-help'">
        <span>{{ error() || helper() }}</span>
        @if (maxLength()) { <span class="counter">{{ value().length }}/{{ maxLength() }}</span> }
      </div>
    }
  `,
  styles: [FIELD_STYLES, `
    :host { gap: var(--rama-space-8); }
    /* Figma Text Area: relleno de 12px y radio 8px en ambos tamaños; el contenido va en columna
       (texto, tooltip y botón) alineado a la izquierda. */
    .box, :host(.size-small) .box {
      flex-direction: column; align-items: flex-start; justify-content: space-between; gap: var(--rama-space-8);
      min-height: 0; padding: var(--rama-space-12); border-radius: var(--rama-radius-small);
    }
    :host(.auto-height) .box { min-height: 140px; }
    .control { align-self: stretch; flex: 1 1 auto; resize: vertical; }
    .tip { display: inline-flex; cursor: help; color: var(--rama-text-subtle); }
    /* Hover (no está en Figma, completado con tokens), igual que el input. */
    :host(:not(.has-error):not(.is-disabled):not(.is-focus)) .box:hover:not(:focus-within) { border-color: var(--rama-text-subtle); }
  `],
})
export class RamaTextarea implements ControlValueAccessor {
  readonly label = input<string>();
  readonly placeholder = input('');
  readonly size = input<FieldSize>('medium');
  readonly required = input(false);
  readonly helper = input<string>();
  readonly error = input<string>();
  readonly maxLength = input<number>();
  /** Filas visibles. Sin valor, la caja toma el alto del componente de Figma (140px). */
  readonly rows = input<number>();
  readonly disabled = input(false);
  /** Ícono de info (18px) dentro de la caja, debajo del texto (Figma Text Area · tooltip). */
  readonly tooltip = input<string>();
  /** Ayuda junto a la etiqueta (ícono de info de 14px). */
  readonly labelTooltip = input<string>();
  /** Color de la etiqueta (Figma Label · Color). Por defecto Primary, también dentro de rama-form. */
  readonly labelColor = input<LabelColor>();

  readonly id = uniqueFieldId('rama-textarea');
  readonly value = signal('');
  private readonly formDisabled = signal(false);
  readonly isDisabled = computed(() => this.disabled() || this.formDisabled());
  readonly hasLower = computed(() => !!(this.error() || this.helper() || this.maxLength()));

  private onChange: (v: string) => void = () => {};
  onTouched: () => void = () => {};

  onInput(v: string) { this.value.set(v); this.onChange(v); }
  writeValue(v: string | null): void { this.value.set(v ?? ''); }
  registerOnChange(fn: (v: string) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState(d: boolean): void { this.formDisabled.set(d); }
}
