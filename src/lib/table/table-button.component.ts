import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RamaIcon } from '../icon/icon.component';

export type TableButtonType = 'primary' | 'search' | 'success' | 'edit' | 'answer' | 'error';

/** Ícono por defecto de cada tipo, según Figma (15.2 Tables · Table Buttons). */
export const TABLE_BUTTON_ICONS: Record<TableButtonType, string> = {
  primary: 'eye', search: 'search-normal', success: 'check', edit: 'edit-2', answer: 'corner-up-left', error: 'trash-2',
};

/**
 * Botón de acción para celdas de tabla (Figma: Table Buttons). Fondo suave del color del tipo;
 * sin `label` queda como botón de solo ícono (el caso de la celda "Acciones").
 * Las clases de host `is-hover` / `is-pressed` solo sirven para mostrar estados fijos en la documentación.
 */
@Component({
  selector: 'rama-table-button',
  imports: [RamaIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button type="button" class="tbtn" [class]="'tbtn ' + kind()" [attr.aria-label]="label() ? null : ariaLabel()" [disabled]="disabled()">
      <rama-icon [name]="icon() ?? icons[kind()]" [size]="20" />
      @if (label()) { <span>{{ label() }}</span> }
      @if (label() && showArrow()) { <rama-icon name="arrow-down" [size]="20" /> }
    </button>
  `,
  styles: `
    :host { display: inline-flex; }
    .tbtn {
      display: inline-flex; align-items: center; justify-content: center; gap: var(--rama-space-8);
      height: 36px; min-width: 36px; padding: var(--rama-space-8); border: 0; border-radius: var(--rama-radius-small);
      font: var(--rama-weight-bold) 14px/16px var(--rama-font); white-space: nowrap; cursor: pointer;
      background-color: var(--tb-bg); color: var(--tb-fg); transition: background-color .15s;
    }
    /* Hover en Figma: velo blanco del 10 % sobre el fondo del tipo. */
    .tbtn:hover, :host(.is-hover) .tbtn { background-image: linear-gradient(var(--rama-white-10), var(--rama-white-10)); }
    .tbtn:active, :host(.is-pressed) .tbtn { background-color: var(--tb-pressed); background-image: none; }
    .tbtn:focus-visible { outline: none; box-shadow: var(--rama-focus-ring); }
    /* Disabled (sin variante en Figma): completado con tokens. */
    .tbtn:disabled, .tbtn:disabled:hover { cursor: not-allowed; background: var(--rama-bg-subtle); background-image: none; color: var(--rama-text-disabled); }

    .primary { --tb-bg: var(--rama-primary-50); --tb-fg: var(--rama-text-primary); --tb-pressed: var(--rama-primary-100); }
    .search { --tb-bg: var(--rama-purple-50); --tb-fg: var(--rama-purple-700); --tb-pressed: var(--rama-purple-100); }
    .success { --tb-bg: var(--rama-success-surface); --tb-fg: var(--rama-text-success); --tb-pressed: var(--rama-green-100); }
    .edit { --tb-bg: var(--rama-information-surface); --tb-fg: var(--rama-text-information); --tb-pressed: var(--rama-blue-100); }
    .answer { --tb-bg: var(--rama-pink-50); --tb-fg: var(--rama-pink-700); --tb-pressed: var(--rama-pink-100); }
    .error { --tb-bg: var(--rama-error-surface); --tb-fg: var(--rama-text-error); --tb-pressed: var(--rama-red-100); }
  `,
})
export class RamaTableButton {
  protected readonly icons = TABLE_BUTTON_ICONS;
  readonly kind = input<TableButtonType>('primary');
  readonly label = input<string>();
  readonly icon = input<string>();
  readonly showArrow = input(false);
  readonly disabled = input(false);
  readonly ariaLabel = input<string>();
}
