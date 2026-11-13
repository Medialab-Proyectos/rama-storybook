import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { RamaIcon } from '../icon/icon.component';

export type BadgeType = 'primary' | 'info' | 'success' | 'caution' | 'warning' | 'error' | 'neutral';
export type BadgeSize = 'small' | 'medium' | 'large';

/**
 * Badge Rama (Figma: 7 Badges). Etiqueta con fondo de color para estados y categorías.
 * Todos los elementos son opcionales y van en este orden: ícono, contador, avatar, punto,
 * texto y botón de quitar. El texto se proyecta como contenido.
 * Nota: en Figma el tipo "Error" usa la paleta rosa (OKR pink), no la roja.
 */
@Component({
  selector: 'rama-badge',
  imports: [RamaIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': "'t-' + type() + ' s-' + size()" },
  template: `
    <span class="badge">
      @if (leadIcon()) { <rama-icon [name]="leadIcon()!" [size]="iconSize()" /> }
      @if (count() != null) { <span class="count">{{ count() }}</span> }
      @if (avatar()) { <img class="avatar" [src]="avatar()" alt="" /> }
      @if (dot()) { <span class="dot-box" aria-hidden="true"><span class="dot"></span></span> }
      <span class="label"><ng-content /></span>
      @if (closable()) {
        <button type="button" class="close" [attr.aria-label]="closeLabel()" (click)="closed.emit()">
          <rama-icon name="x-close" [size]="iconSize()" [strokeWidth]="1.2" />
        </button>
      }
    </span>
  `,
  styles: `
    :host { display: inline-flex; vertical-align: middle; }
    .badge { display: inline-flex; align-items: center; overflow: hidden; white-space: nowrap;
      background: var(--_bg); color: var(--_fg); font-family: var(--rama-font); font-weight: var(--rama-weight-semibold); }
    .label:empty { display: none; }
    .count { display: inline-flex; align-items: center; justify-content: center; flex: none; border-radius: var(--rama-radius-xl);
      background: var(--_num-bg); color: var(--_num-fg); font: var(--rama-weight-bold) 10px/12px var(--rama-font); letter-spacing: -0.02em; }
    .avatar { flex: none; border-radius: var(--rama-radius-full); object-fit: cover; }
    .dot-box { flex: none; width: 12px; height: 12px; display: inline-flex; align-items: center; justify-content: center; }
    .dot { width: 6px; height: 6px; border-radius: var(--rama-radius-full); background: currentColor; }
    /* Punto por tamaño (Figma 7 Badges · Lead Dot): Small 4, Medium 6, Large 8, siempre en caja de 12. */
    :host(.s-small) .dot { width: 4px; height: 4px; }
    :host(.s-large) .dot { width: 8px; height: 8px; }
    .close { display: inline-flex; padding: 0; border: 0; background: transparent; color: inherit; cursor: pointer; border-radius: var(--rama-radius-xs); }
    .close:focus-visible { outline: none; box-shadow: var(--rama-focus-ring); }

    :host(.s-small) .badge { gap: var(--rama-space-4); padding: 2px var(--rama-space-4); border-radius: var(--rama-radius-xs); font-size: 10px; line-height: 12px; }
    :host(.s-medium) .badge { gap: var(--rama-space-4); padding: var(--rama-space-4) var(--rama-space-8); border-radius: var(--rama-radius-xs); font-size: 12px; line-height: 16px; }
    :host(.s-large) .badge { gap: var(--rama-space-8); padding: var(--rama-space-8) 10px; border-radius: var(--rama-radius-small); font-size: 12px; line-height: 16px; }
    :host(.s-small) .count, :host(.s-medium) .count { width: 14px; height: 14px; }
    :host(.s-large) .count { width: 16px; height: 16px; }
    :host(.s-small) .avatar, :host(.s-medium) .avatar { width: 16px; height: 16px; }
    :host(.s-large) .avatar { width: 24px; height: 24px; }

    :host(.t-primary) { --_bg: var(--rama-primary-50); --_fg: var(--rama-primary-on-fill); --_num-bg: var(--rama-primary-fill); --_num-fg: var(--rama-text-default-white); }
    :host(.t-info) { --_bg: var(--rama-information-surface); --_fg: var(--rama-text-information); --_num-bg: var(--rama-information-fill); --_num-fg: var(--rama-text-information); }
    :host(.t-success) { --_bg: var(--rama-success-surface); --_fg: var(--rama-text-success); --_num-bg: var(--rama-success-fill); --_num-fg: var(--rama-text-success); }
    :host(.t-caution) { --_bg: var(--rama-caution-surface); --_fg: var(--rama-text-caution); --_num-bg: var(--rama-caution-fill); --_num-fg: var(--rama-text-caution); }
    :host(.t-warning) { --_bg: var(--rama-warning-surface); --_fg: var(--rama-text-warning); --_num-bg: var(--rama-warning-fill); --_num-fg: var(--rama-text-warning); }
    :host(.t-error) { --_bg: var(--rama-okr-pink); --_fg: var(--rama-pink-700); --_num-bg: var(--rama-pink-500); --_num-fg: var(--rama-text-default-white); }
    :host(.t-neutral) { --_bg: var(--rama-neutro-fill); --_fg: var(--rama-text-muted); --_num-bg: var(--rama-neutro-on-fill); --_num-fg: var(--rama-text-muted); }
  `,
})
export class RamaBadge {
  readonly type = input<BadgeType>('primary');
  readonly size = input<BadgeSize>('medium');
  readonly leadIcon = input<string>();
  readonly count = input<number | string | null>(null);
  /** URL de la imagen del avatar. */
  readonly avatar = input<string>();
  readonly dot = input(false);
  readonly closable = input(false);
  readonly closeLabel = input('Quitar');
  readonly closed = output<void>();

  readonly iconSize = computed(() => ({ small: 12, medium: 14, large: 16 })[this.size()]);
}
