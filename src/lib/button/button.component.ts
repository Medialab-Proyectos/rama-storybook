import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RamaIcon } from '../icon/icon.component';

export type ButtonVariant = 'filled' | 'outlined' | 'ghost';
export type ButtonSize = 'xs' | 'small' | 'medium' | 'large' | 'xl';

/**
 * Botón Rama (Figma: 4 Buttons). Los estados hover/pressed/focus/disabled salen de los
 * pseudo-estados nativos; las clases de host `is-hover`, `is-pressed` e `is-focus` solo
 * existen para mostrar los estados fijos en la documentación.
 * `leadIcon` / `trailIcon` aceptan un nombre de ícono o `'dot'`.
 */
@Component({
  selector: 'rama-button',
  imports: [RamaIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button [attr.type]="type()" class="btn" [class]="classes()" [disabled]="disabled()" [attr.aria-label]="iconOnly() ? ariaLabel() : null">
      @if (leadIcon(); as lead) {
        @if (lead === 'dot') { <span class="dot-slot" aria-hidden="true"><span class="dot"></span></span> } @else { <rama-icon [name]="lead" [size]="iconSize()" /> }
      }
      @if (!iconOnly()) { <span class="label"><ng-content /></span> }
      @if (trailIcon(); as trail) {
        @if (trail === 'dot') { <span class="dot-slot" aria-hidden="true"><span class="dot"></span></span> } @else { <rama-icon [name]="trail" [size]="iconSize()" /> }
      }
    </button>
  `,
  styles: `
    :host { display: inline-flex; }
    :host([block]) { display: flex; }
    :host([block]) .btn { width: 100%; }

    .btn {
      display: inline-flex; align-items: center; justify-content: center; gap: var(--rama-space-10);
      border: var(--rama-border-width-thin) solid transparent; border-radius: var(--rama-radius-small);
      padding: 0 var(--rama-space-16); font-family: var(--rama-font); font-weight: var(--rama-weight-bold);
      letter-spacing: 0; white-space: nowrap; cursor: pointer; background: transparent;
      transition: background-color .15s, color .15s, border-color .15s, box-shadow .15s;
    }
    .btn:focus-visible { outline: none; }
    /* Lead/Trail Type=Dot: punto de 8px dentro de un espacio de 20px, como el ícono. */
    .dot-slot { width: 20px; height: 20px; flex: none; display: inline-flex; align-items: center; justify-content: center; }
    .size-large .dot-slot, .size-xl .dot-slot { width: 24px; height: 24px; }
    .dot { width: 8px; height: 8px; border-radius: var(--rama-radius-full); background: currentColor; flex: none; }

    /* Figma: separación 8 (XS, Small), 10 (Medium) y 12 (Large, XL); íconos de 24px en Large y XL. */
    .size-xs { height: 36px; font-size: 14px; line-height: 16px; gap: var(--rama-space-8); }
    .size-small { height: 40px; font-size: 14px; line-height: 16px; gap: var(--rama-space-8); }
    .size-medium { height: 44px; font-size: 16px; line-height: 20px; }
    .size-large { height: 48px; font-size: 16px; line-height: 20px; gap: var(--rama-space-12); }
    .size-xl { height: 56px; font-size: 18px; line-height: 28px; gap: var(--rama-space-12); }
    .icon-only { padding: 0; aspect-ratio: 1; }

    /* Filled */
    .filled { background: var(--rama-primary-fill); color: var(--rama-text-default-white); }
    .filled:hover, :host(.is-hover) .filled { background: var(--rama-primary-surface); }
    .filled:active, :host(.is-pressed) .filled { background: var(--rama-primary-on-fill); }
    .filled:focus-visible, :host(.is-focus) .filled { background: var(--rama-primary-fill); box-shadow: var(--rama-focus-ring); }

    /* Outlined */
    .outlined { border-color: var(--rama-border-primary); color: var(--rama-text-primary); }
    .outlined:hover, :host(.is-hover) .outlined { background: var(--rama-primary-surface); }
    .outlined:active, :host(.is-pressed) .outlined { background: transparent; border-color: var(--rama-primary-on-fill); color: var(--rama-primary-on-fill); }
    .outlined:focus-visible, :host(.is-focus) .outlined { background: var(--rama-bg-default-white); box-shadow: var(--rama-focus-ring); }

    /* Ghost */
    .ghost { color: var(--rama-text-primary); }
    .ghost:hover, :host(.is-hover) .ghost { color: var(--rama-primary-surface); }
    .ghost:active, :host(.is-pressed) .ghost { color: var(--rama-primary-on-fill); }
    .ghost:focus-visible, :host(.is-focus) .ghost { background: var(--rama-bg-default-white); box-shadow: var(--rama-focus-ring); }

    /* Disabled (gana sobre los demás estados) */
    .btn:disabled { cursor: not-allowed; box-shadow: none; color: var(--rama-text-subtle); }
    .filled:disabled { background: var(--rama-neutro-on-fill); }
    .outlined:disabled { background: transparent; border-color: var(--rama-text-subtle); }
    .ghost:disabled { background: transparent; }
  `,
})
export class RamaButton {
  readonly variant = input<ButtonVariant>('filled');
  readonly size = input<ButtonSize>('medium');
  /** Large y XL usan íconos de 24px; los demás, 20px. */
  readonly iconSize = computed(() => (this.size() === 'large' || this.size() === 'xl' ? 24 : 20));
  readonly type = input<'button' | 'submit' | 'reset'>('button');
  readonly disabled = input(false);
  readonly leadIcon = input<string>();
  readonly trailIcon = input<string>();
  /** Botón solo con ícono (usa `leadIcon`); requiere `ariaLabel`. */
  readonly iconOnly = input(false);
  readonly ariaLabel = input<string>();

  readonly classes = computed(() => `btn ${this.variant()} size-${this.size()}${this.iconOnly() ? ' icon-only' : ''}`);
}
