import { ChangeDetectionStrategy, Component, ElementRef, input, model, viewChild } from '@angular/core';
import { RamaIcon } from '../icon/icon.component';

/**
 * Buscador de tablas (Figma: 18 Search table). Estados: Default, Hovered (fondo gris),
 * Selected (al escribir: borde primario y botón para limpiar), Default with content
 * (texto en gris oscuro al salir del campo) y Disable.
 * Al limpiar con la X el valor vuelve a '' para que la tabla muestre todos los registros.
 */
@Component({
  selector: 'rama-search-table',
  imports: [RamaIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <label class="box" [class.filled]="!!value()" [class.disabled]="disabled()" [class.flat]="!shadow()">
      <rama-icon name="search" [size]="20" class="lead" />
      <input #field type="search" [placeholder]="placeholder()" [value]="value()" [disabled]="disabled()"
        [attr.aria-label]="ariaLabel() ?? placeholder()" (input)="value.set(field.value)" (keydown.escape)="clear()" />
      @if (value() && !disabled()) {
        <button type="button" class="clear" aria-label="Limpiar búsqueda" (mousedown)="$event.preventDefault()" (click)="clear()">
          <rama-icon name="x" [size]="18" />
        </button>
      }
    </label>
  `,
  styles: `
    :host { display: block; width: 311px; max-width: 100%; }
    .box {
      display: flex; align-items: center; gap: var(--rama-space-8); height: 44px; padding: 0 var(--rama-space-16);
      background: var(--rama-bg-default-white); border: 1px solid var(--rama-border-default); border-radius: var(--rama-radius-small);
      --st-shadow: var(--rama-shadow-medium); box-shadow: var(--st-shadow); cursor: text; transition: background-color .15s, border-color .15s;
    }
    /* shadow=false (p. ej. dentro de la hoja inferior de dropdown-list): sin sombra en ningún estado. */
    .box.flat { --st-shadow: 0 0 0 0 transparent; }
    .box:hover { background: var(--rama-neutro-fill); }
    .lead { color: var(--rama-text-subtle); }
    input {
      flex: 1; min-width: 0; border: 0; outline: 0; background: transparent; padding: 0;
      font: var(--rama-weight-medium) 12px/16px var(--rama-font); letter-spacing: -0.24px; color: var(--rama-text-muted);
    }
    input::placeholder { color: var(--rama-text-subtle); }
    input::-webkit-search-cancel-button { display: none; }
    .filled .lead { color: var(--rama-text-muted); }

    /* Selected: el usuario está escribiendo. */
    .box:focus-within { background: var(--rama-bg-default-white); border: 1.5px solid var(--rama-border-primary); padding: 0 var(--rama-space-8); }
    .box:focus-within .lead { color: var(--rama-text-default-black); }
    .box:focus-within input { font-size: 14px; line-height: 18px; letter-spacing: -0.28px; color: var(--rama-text-default-black); }
    .clear { display: none; align-items: center; padding: 6px; border: 0; border-radius: 6px; cursor: pointer;
      background: var(--rama-neutro-fill); color: var(--rama-text-default-black); box-shadow: var(--rama-shadow-x-small); }
    .box:focus-within .clear { display: inline-flex; }
    .clear:hover { background: var(--rama-neutro-on-fill); }
    .clear:focus-visible { outline: none; box-shadow: var(--rama-focus-ring); }
    /* Foco por teclado (sin variante en Figma): anillo de foco además del borde primario de "Selected". */
    .box:has(input:focus-visible) { box-shadow: var(--st-shadow), var(--rama-focus-ring); }

    .disabled, .disabled:hover { background: var(--rama-neutral-100); border-color: var(--rama-border-disabled); cursor: not-allowed; }
    .disabled .lead, .disabled input, .disabled input::placeholder { color: var(--rama-text-disabled); }
    .disabled input { cursor: not-allowed; }
  `,
})
export class RamaSearchTable {
  readonly value = model('');
  readonly placeholder = input('Buscar');
  readonly ariaLabel = input<string>();
  readonly disabled = input(false);
  /** Sombra medium de Figma; false la quita en todos los estados (se mantiene el anillo de foco). */
  readonly shadow = input(true);
  private readonly field = viewChild.required<ElementRef<HTMLInputElement>>('field');

  clear() {
    this.value.set('');
    this.field().nativeElement.focus();
  }
}
