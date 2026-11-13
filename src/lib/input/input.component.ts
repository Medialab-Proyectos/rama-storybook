import { ChangeDetectionStrategy, Component, computed, forwardRef, input, output, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { RamaIcon } from '../icon/icon.component';
import { FIELD_STYLES, FieldSize, LabelColor, uniqueFieldId } from './field.styles';

export type PasswordStrength = 'weak' | 'moderate' | 'strong';
/** Figma "Lead Add-on": Unfold (texto + ícono unfold) o Link (texto con línea divisoria a la derecha). */
export type LeadAddonType = 'unfold' | 'link';
/** Figma "Trail Add-on": Unfold (texto + ícono unfold) o Currency (texto + flecha abajo). */
export type TrailAddonType = 'unfold' | 'currency';

/** Fuerza simple: longitud + mezcla de mayúsculas, números y símbolos. */
export function passwordStrength(value: string): PasswordStrength | null {
  if (!value) return null;
  const score = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter(r => r.test(value)).length + (value.length >= 10 ? 1 : 0);
  return score >= 4 ? 'strong' : score >= 3 ? 'moderate' : 'weak';
}

/**
 * Campo de texto Rama (Figma: 13 Inputs · Input Text). Estados: enable, full, focus, error y
 * disabled. Partes opcionales del diseño: ícono inicial, tags, add-on inicial/final (p. ej. "CO"),
 * indicador de fuerza de contraseña, tooltip, ícono final, texto de apoyo y contador.
 * Tamaños: medium (por defecto) y small.
 * Las clases de host `is-focus` solo existen para mostrar el estado fijo en la documentación.
 */
@Component({
  selector: 'rama-input',
  imports: [RamaIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => RamaInput), multi: true }],
  host: {
    '[class.has-error]': '!!error()', '[class.is-disabled]': 'isDisabled()', '[class.size-small]': "size() === 'small'", '[class.is-filled]': '!!value()',
    '[class.label-primary]': "labelColor() === 'primary'", '[class.label-secondary]': "labelColor() === 'secondary'",
  },
  template: `
    @if (label()) {
      <label class="label" [attr.for]="id">{{ label() }}@if (required()) {<span class="req" aria-hidden="true">*</span>}@if (labelTooltip()) {<span class="label-tip" [title]="labelTooltip()" role="img" [attr.aria-label]="labelTooltip()"><rama-icon name="info-circle" [size]="14" /></span>}</label>
    }
    <div class="box" (click)="control.focus()">
      @if (leadIcon()) { <rama-icon class="lead-icon" [name]="leadIcon()!" [size]="20" /> }
      @for (t of tags(); track t) {
        <span class="tag">{{ t }}
          <button type="button" class="icon-btn" [disabled]="isDisabled()" [attr.aria-label]="'Quitar ' + t" (click)="$event.stopPropagation(); tagRemove.emit(t)">
            <rama-icon name="tag-close" [size]="12" />
          </button>
        </span>
      }
      @if (leadAddon()) {
        <span class="addon" [class.addon-link]="leadAddonType() === 'link'">{{ leadAddon() }}@if (leadAddonType() === 'unfold') {<rama-icon name="unfold" [size]="20" />}</span>
      }
      <input #control class="control" [id]="id" [type]="type()" [value]="value()" [placeholder]="placeholder()"
        [disabled]="isDisabled()" [attr.maxlength]="maxLength() ?? null" [attr.autocomplete]="autocomplete()"
        [attr.aria-invalid]="!!error()" [attr.aria-required]="required()" [attr.aria-describedby]="hasLower() ? id + '-help' : null"
        (input)="onInput(control.value)" (blur)="onTouched()" />
      @if (trailAddon()) { <span class="addon">{{ trailAddon() }}<rama-icon [name]="trailAddonType() === 'currency' ? 'arrow-down' : 'unfold'" [size]="20" /></span> }
      @if (showStrength()) {
        <span class="strength" [attr.data-level]="strength()" aria-live="polite">
          <span class="bars"><i></i><i></i><i></i></span>
          <span class="strength-label" [class.is-empty]="!strength()" [attr.aria-hidden]="strength() ? null : true">{{ strengthLabel() }}</span>
        </span>
      }
      @if (tooltip()) { <span class="tip" [title]="tooltip()" [attr.aria-label]="tooltip()" role="img"><rama-icon name="info-circle" [size]="18" /></span> }
      @if (trailIcon()) { <rama-icon class="trail-icon" [name]="trailIcon()!" [size]="20" /> }
    </div>
    @if (hasLower()) {
      <div class="lower" [id]="id + '-help'">
        <span>{{ error() || helper() }}</span>
        @if (maxLength()) { <span class="counter">{{ value().length }}/{{ maxLength() }}</span> }
      </div>
    }
  `,
  styles: [FIELD_STYLES, `
    .tag { display: inline-flex; align-items: center; gap: var(--rama-space-4); padding: var(--rama-space-4) var(--rama-space-8); flex: none;
      border: var(--rama-border-width-thin) solid var(--rama-border-inset); border-radius: var(--rama-radius-xs);
      font-size: 12px; line-height: 16px; font-weight: var(--rama-weight-bold); color: var(--rama-text-muted); }
    /* Figma Lead/Trail Add-on: relleno de 12px, alto de la caja, texto 16px medium en ambos tamaños. */
    .addon { display: inline-flex; align-items: center; gap: var(--rama-space-4); padding: 0 var(--rama-space-12); flex: none; align-self: stretch;
      font-size: 16px; line-height: normal; font-weight: var(--rama-weight-medium); color: var(--rama-text-muted); }
    /* Type=Link: sin ícono y con línea divisoria border/base/inset a la derecha. */
    .addon-link { border-right: var(--rama-border-width-thin) solid var(--rama-border-inset); }
    .tag .icon-btn { color: var(--rama-text-subtle); }
    /* Íconos por estado (Figma): Enable muted; Focus negro (ícono inicial y final); Error en rojo
       (ícono inicial, add-ons y final; el tooltip sigue muted); Disabled gris claro (tooltip y final subtle). */
    .tip { display: inline-flex; cursor: help; color: var(--rama-text-muted); }
    /* Hover (no está en Figma, completado con tokens): borde text/base/subtle mientras no haya foco, error ni disabled. */
    :host(:not(.has-error):not(.is-disabled):not(.is-focus)) .box:hover:not(:focus-within) { border-color: var(--rama-text-subtle); }
    .box:focus-within .lead-icon, .box:focus-within .trail-icon,
    :host(.is-focus) .lead-icon, :host(.is-focus) .trail-icon { color: var(--rama-text-default-black); }
    :host(.has-error) .box { color: var(--rama-text-error); }
    :host(.has-error) .addon { color: var(--rama-text-error); }
    :host(.is-disabled) .addon { color: var(--rama-text-disabled); }
    :host(.is-disabled) .tip, :host(.is-disabled) .trail-icon { color: var(--rama-text-subtle); }
    .strength { display: inline-flex; align-items: center; gap: var(--rama-space-8); flex: none; }
    .bars { display: inline-flex; gap: var(--rama-space-4); }
    .bars i { width: 16px; height: 4px; border-radius: var(--rama-radius-large); background: var(--rama-text-disabled); }
    .strength-label { font-size: 10px; line-height: 12px; font-weight: var(--rama-weight-semibold); color: var(--rama-text-muted); }
    /* State=Default: el texto existe pero transparente, para que el ancho no salte al escribir. */
    .strength-label.is-empty { opacity: 0; }
    :host(.is-disabled) .strength-label { color: var(--rama-text-disabled); }
    /* Figma: las barras activas se pintan en text/base/muted (1, 2 o 3 según la fuerza). */
    [data-level="weak"] .bars i:nth-child(1),
    [data-level="moderate"] .bars i:nth-child(-n+2),
    [data-level="strong"] .bars i { background: var(--rama-text-muted); }
    /* Disabled (completado con tokens): barras y texto en text/base/disabled. */
    :host(.is-disabled) .bars i { background: var(--rama-text-disabled); }
  `],
})
export class RamaInput implements ControlValueAccessor {
  readonly label = input<string>();
  readonly placeholder = input('');
  /** Tamaño del campo: medium (48px) o small (44px, textos más pequeños). */
  readonly size = input<FieldSize>('medium');
  readonly type = input<'text' | 'email' | 'password' | 'number' | 'tel' | 'url'>('text');
  readonly required = input(false);
  readonly helper = input<string>();
  /** Mensaje de error: si tiene texto, el campo pasa a estado error. */
  readonly error = input<string>();
  readonly maxLength = input<number>();
  readonly disabled = input(false);
  readonly leadIcon = input<string>();
  readonly trailIcon = input<string>();
  readonly tooltip = input<string>();
  /** Ayuda junto a la etiqueta (ícono de info de 14px). */
  readonly labelTooltip = input<string>();
  readonly leadAddon = input<string>();
  readonly leadAddonType = input<LeadAddonType>('unfold');
  readonly trailAddon = input<string>();
  readonly trailAddonType = input<TrailAddonType>('unfold');
  /** Color de la etiqueta (Figma Label · Color). Sin valor: Primary, o Secondary dentro de rama-form. */
  readonly labelColor = input<LabelColor>();
  readonly tags = input<string[]>([]);
  /** Muestra el indicador de fuerza (pensado para type="password"). */
  readonly passwordStrength = input(false);
  readonly autocomplete = input<string>();
  readonly tagRemove = output<string>();

  readonly id = uniqueFieldId('rama-input');
  readonly value = signal('');
  private readonly formDisabled = signal(false);
  readonly isDisabled = computed(() => this.disabled() || this.formDisabled());
  readonly hasLower = computed(() => !!(this.error() || this.helper() || this.maxLength()));
  readonly showStrength = computed(() => this.passwordStrength());
  readonly strength = computed(() => passwordStrength(this.value()));
  readonly strengthLabel = computed(() => {
    const labels: Record<string, string> = { weak: 'Débil', moderate: 'Moderada', strong: 'Fuerte' };
    return labels[this.strength() ?? 'weak'];
  });

  private onChange: (v: string) => void = () => {};
  onTouched: () => void = () => {};

  onInput(v: string) { this.value.set(v); this.onChange(v); }
  writeValue(v: string | null): void { this.value.set(v ?? ''); }
  registerOnChange(fn: (v: string) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState(d: boolean): void { this.formDisabled.set(d); }
}
