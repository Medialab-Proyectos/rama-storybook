import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { RamaIcon } from '../icon/icon.component';

export type TagSize = 'xs' | 'small' | 'medium' | 'large';

/**
 * Tag Rama (Figma: 8 Tags). Etiqueta con borde (sin fondo), en tema neutral o primary y línea
 * sólida o punteada. Elementos opcionales antes del texto (ícono, contador, avatar, punto) y
 * después (punto, avatar, contador, quitar). El texto se proyecta como contenido.
 */
@Component({
  selector: 'rama-tag',
  imports: [RamaIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': "'th-' + theme() + ' s-' + size() + (line() === 'dashed' ? ' dashed' : '')" },
  template: `
    <span class="tag">
      @if (leadIcon()) { <rama-icon class="ic" [name]="leadIcon()!" [size]="iconSize()" /> }
      @if (count() != null) { <span class="count">{{ count() }}</span> }
      @if (avatar()) { <img class="avatar" [src]="avatar()" alt="" /> }
      @if (dot()) { <span class="dot-box" aria-hidden="true"><span class="dot"></span></span> }
      <span class="label"><ng-content /></span>
      @if (trailDot()) { <span class="dot-box" aria-hidden="true"><span class="dot"></span></span> }
      @if (trailAvatar()) { <img class="avatar" [src]="trailAvatar()" alt="" /> }
      @if (trailCount() != null) { <span class="count">{{ trailCount() }}</span> }
      @if (closable()) {
        <button type="button" class="close" [attr.aria-label]="closeLabel()" (click)="closed.emit()">
          <rama-icon name="x-close" [size]="iconSize()" [strokeWidth]="1.2" />
        </button>
      }
    </span>
  `,
  styles: `
    :host { display: inline-flex; vertical-align: middle; }
    .tag { display: inline-flex; align-items: center; white-space: nowrap; overflow: hidden;
      border: var(--rama-border-width-thin) solid var(--_border); color: var(--_fg);
      font-family: var(--rama-font); font-weight: var(--rama-weight-bold); background: transparent; }
    :host(.dashed) .tag { border-style: dashed; }
    .label:empty { display: none; }
    .ic, .close { color: var(--_icon); }
    .count { display: inline-flex; align-items: center; justify-content: center; flex: none; border-radius: var(--rama-radius-xs);
      background: var(--_num-bg); color: var(--_num-fg); font-weight: var(--rama-weight-bold); letter-spacing: -0.02em; }
    .avatar { flex: none; border-radius: var(--rama-radius-full); object-fit: cover; }
    .dot-box { flex: none; display: inline-flex; align-items: center; justify-content: center; }
    /* Punto por tamaño (Figma): XS 4, Small y Medium 6, Large 8. */
    .dot { width: 6px; height: 6px; border-radius: var(--rama-radius-full); background: currentColor; }
    :host(.s-xs) .dot { width: 4px; height: 4px; }
    :host(.s-large) .dot { width: 8px; height: 8px; }
    .close { display: inline-flex; padding: 0; border: 0; background: transparent; cursor: pointer; border-radius: var(--rama-radius-xs); }
    .close:focus-visible { outline: none; box-shadow: var(--rama-focus-ring); }

    :host(.s-xs) .tag, :host(.s-small) .tag { gap: var(--rama-space-4); padding: var(--rama-space-4) var(--rama-space-8); border-radius: var(--rama-radius-xs); }
    :host(.s-medium) .tag { gap: var(--rama-space-8); padding: var(--rama-space-8) 10px; border-radius: var(--rama-radius-small); }
    :host(.s-large) .tag { gap: var(--rama-space-8); padding: var(--rama-space-8) var(--rama-space-12); border-radius: var(--rama-radius-small); }

    :host(.s-xs) .tag { font-size: 10px; line-height: 12px; }
    :host(.s-xs) .count, :host(.s-xs) .avatar, :host(.s-xs) .dot-box { width: 12px; height: 12px; font-size: 10px; line-height: 12px; }
    :host(.s-small) .tag { font-size: 12px; line-height: 16px; }
    :host(.s-small) .count, :host(.s-small) .avatar, :host(.s-small) .dot-box { width: 14px; height: 14px; font-size: 10px; line-height: 12px; }
    :host(.s-medium) .tag { font-size: 14px; line-height: 16px; }
    :host(.s-medium) .count, :host(.s-medium) .avatar { width: 16px; height: 16px; font-size: 12px; line-height: 16px; }
    :host(.s-medium) .dot-box { width: 14px; height: 14px; }
    :host(.s-large) .tag { font-size: 16px; line-height: 20px; }
    :host(.s-large) .count, :host(.s-large) .avatar { width: 20px; height: 20px; font-size: 14px; line-height: 16px; }
    :host(.s-large) .dot-box { width: 16px; height: 16px; }

    :host(.th-neutral) { --_border: var(--rama-border-inset); --_fg: var(--rama-text-muted); --_icon: var(--rama-text-subtle);
      --_num-bg: var(--rama-bg-subtle); --_num-fg: var(--rama-text-subtle); }
    :host(.th-primary) { --_border: var(--rama-border-primary); --_fg: var(--rama-text-primary); --_icon: var(--rama-text-primary);
      --_num-bg: var(--rama-primary-50); --_num-fg: var(--rama-text-primary); }
  `,
})
export class RamaTag {
  readonly theme = input<'neutral' | 'primary'>('neutral');
  readonly line = input<'solid' | 'dashed'>('solid');
  readonly size = input<TagSize>('small');
  readonly leadIcon = input<string>();
  readonly count = input<number | string | null>(null);
  readonly avatar = input<string>();
  readonly dot = input(false);
  readonly trailDot = input(false);
  readonly trailAvatar = input<string>();
  readonly trailCount = input<number | string | null>(null);
  readonly closable = input(false);
  readonly closeLabel = input('Quitar');
  readonly closed = output<void>();

  readonly iconSize = computed(() => ({ xs: 10, small: 12, medium: 14, large: 16 })[this.size()]);
}
