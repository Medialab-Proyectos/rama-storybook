import { ChangeDetectionStrategy, Component, computed, input, model } from '@angular/core';
import { RamaIcon } from '../icon/icon.component';

export interface ButtonGroupOption {
  value: string;
  label?: string;
  leadIcon?: string;
  trailIcon?: string;
  /** Obligatorio cuando la opción no tiene label (solo ícono). */
  ariaLabel?: string;
  disabled?: boolean;
}

/**
 * Grupo de botones Rama (Figma: 5 Buttons group). `grouped` une las opciones en una sola
 * caja con divisores; `ungrouped` las separa 8px con borde propio. La opción seleccionada
 * se marca con fondo primary-50. Los íconos van siempre en text-information. Con `multiple` funciona como conjunto de toggles.
 * Las clases de host `is-hover` / `is-focus` solo fijan estados en la documentación.
 */
@Component({
  selector: 'rama-button-group',
  imports: [RamaIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="group" [class.grouped]="type() === 'grouped'" [class.ungrouped]="type() === 'ungrouped'" role="group" [attr.aria-label]="ariaLabel()">
      @for (opt of options(); track opt.value) {
        <button type="button" class="opt" [class.selected]="isSelected(opt.value)" [attr.aria-pressed]="isSelected(opt.value)"
          [disabled]="opt.disabled" [attr.aria-label]="opt.label ? null : opt.ariaLabel" (click)="toggle(opt.value)">
          @if (opt.leadIcon) { <rama-icon [name]="opt.leadIcon" [size]="20" /> }
          @if (opt.label) { <span>{{ opt.label }}</span> }
          @if (opt.trailIcon) { <rama-icon [name]="opt.trailIcon" [size]="20" /> }
        </button>
      }
    </div>
  `,
  styles: `
    :host { display: inline-flex; max-width: 100%; }
    .group { display: inline-flex; align-items: stretch; max-width: 100%; }
    .grouped { border: var(--rama-border-width-thin) solid var(--rama-border-inset); border-radius: var(--rama-radius-small); overflow: hidden; }
    .ungrouped { gap: var(--rama-space-8); flex-wrap: wrap; }

    .opt {
      display: inline-flex; align-items: center; gap: var(--rama-space-8); padding: var(--rama-space-12) var(--rama-space-16);
      background: var(--rama-bg-default-white); color: var(--rama-text-default-black); border: 0; cursor: pointer;
      font: var(--rama-weight-bold) 14px/16px var(--rama-font); white-space: nowrap; position: relative;
      transition: background-color .15s, color .15s;
    }
    .grouped .opt { border-right: var(--rama-border-width-thin) solid var(--rama-border-inset); }
    .grouped .opt:last-child { border-right: 0; }
    .ungrouped .opt { border: var(--rama-border-width-thin) solid var(--rama-border-inset); border-radius: var(--rama-radius-small); }

    .opt:hover, :host(.is-hover) .opt { background: var(--rama-bg-inset); color: var(--rama-text-information); }
    .opt.selected { background: var(--rama-primary-50); color: var(--rama-text-information); }
    .opt:focus-visible, :host(.is-focus) .opt { outline: none; box-shadow: var(--rama-focus-ring); z-index: 1; }
    .opt:disabled { cursor: not-allowed; background: var(--rama-bg-default-white); color: var(--rama-text-disabled); }
    /* Figma .Option ButtonG: los íconos van en text-information en todos los estados (el texto solo cambia en hover/selected). */
    .opt rama-icon { color: var(--rama-text-information); }
    .opt:disabled rama-icon { color: var(--rama-text-disabled); }
  `,
})
export class RamaButtonGroup {
  readonly options = input<ButtonGroupOption[]>([]);
  readonly type = input<'grouped' | 'ungrouped'>('grouped');
  readonly multiple = input(false);
  readonly ariaLabel = input<string>();
  /** Valor seleccionado: string (selección única) o string[] (con `multiple`). */
  readonly value = model<string | string[] | null>(null);

  private readonly selected = computed(() => {
    const v = this.value();
    return new Set(v == null ? [] : Array.isArray(v) ? v : [v]);
  });

  isSelected(v: string) { return this.selected().has(v); }

  toggle(v: string) {
    if (!this.multiple()) { this.value.set(v); return; }
    const next = new Set(this.selected());
    if (next.has(v)) next.delete(v); else next.add(v);
    this.value.set([...next]);
  }
}
