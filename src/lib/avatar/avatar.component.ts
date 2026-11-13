import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RamaIcon } from '../icon/icon.component';

export type AvatarSize = '1x' | '2x' | '3x' | '4x' | '5x' | '6x' | '7x' | '8x' | '9x';
export type AvatarRadius = 'round' | 'semi-round' | 'square';
export type AvatarStyle = 'default' | 'border' | 'detached';

const SIZES: Record<AvatarSize, number> = { '1x': 16, '2x': 24, '3x': 32, '4x': 40, '5x': 48, '6x': 64, '7x': 80, '8x': 96, '9x': 120 };

/** Valores fijos por tamaño leídos de Figma (1.9 Avatars, 59056:145662): no siguen una proporción. */
interface AvatarSpec {
  font: number; lineHeight: number | 'normal'; letterSpacing: string; icon: number; hoverIcon: number;
  border: number; detachedPad: number; detachedStroke: number; semiRadius: number;
}
const SPEC: Record<AvatarSize, AvatarSpec> = {
  '1x': { font: 10, lineHeight: 12, letterSpacing: '0', icon: 8, hoverIcon: 8, border: 1, detachedPad: 1, detachedStroke: 1, semiRadius: 4 },
  '2x': { font: 12, lineHeight: 16, letterSpacing: '0', icon: 12, hoverIcon: 12, border: 1, detachedPad: 2, detachedStroke: 1, semiRadius: 4 },
  '3x': { font: 14, lineHeight: 16, letterSpacing: '0', icon: 18, hoverIcon: 16, border: 1.5, detachedPad: 2, detachedStroke: 1, semiRadius: 4 },
  '4x': { font: 16, lineHeight: 20, letterSpacing: '0', icon: 24, hoverIcon: 18, border: 2, detachedPad: 3, detachedStroke: 1, semiRadius: 8 },
  '5x': { font: 18, lineHeight: 28, letterSpacing: '0', icon: 24, hoverIcon: 24, border: 2.5, detachedPad: 3, detachedStroke: 1.5, semiRadius: 8 },
  '6x': { font: 24, lineHeight: 'normal', letterSpacing: '-0.01em', icon: 32, hoverIcon: 32, border: 3, detachedPad: 3, detachedStroke: 2, semiRadius: 12 },
  '7x': { font: 36, lineHeight: 40, letterSpacing: '-0.01em', icon: 40, hoverIcon: 40, border: 3.5, detachedPad: 5, detachedStroke: 2.5, semiRadius: 12 },
  '8x': { font: 48, lineHeight: 52, letterSpacing: '-0.01em', icon: 48, hoverIcon: 48, border: 3.5, detachedPad: 5, detachedStroke: 3, semiRadius: 16 },
  '9x': { font: 60, lineHeight: 68, letterSpacing: '-0.01em', icon: 56, hoverIcon: 56, border: 6, detachedPad: 10, detachedStroke: 3, semiRadius: 24 },
};

/**
 * Avatar Rama (Figma: 1.9 Avatars). Tipo según lo que se pase: `src` (imagen), `initials`
 * (texto) o, si no hay ninguno, ícono de usuario. Con `editable` muestra la capa de hover
 * con el ícono de ajustes; la clase de host `is-hover` la deja fija para la documentación.
 */
@Component({
  selector: 'rama-avatar',
  imports: [RamaIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[style.--av-size.px]': 'px()',
    '[style.--av-semi.px]': 'spec().semiRadius',
    '[style.--av-border.px]': 'spec().border',
    '[style.--av-pad.px]': 'spec().detachedPad',
    '[style.--av-stroke.px]': 'spec().detachedStroke',
    '[class.r-semi-round]': 'radius() === "semi-round"',
    '[class.r-square]': 'radius() === "square"',
    '[class.s-border]': 'avatarStyle() === "border"',
    '[class.s-detached]': 'avatarStyle() === "detached"',
  },
  template: `
    <span class="frame">
      <span class="avatar" role="img" [attr.aria-label]="label() || initials() || 'Usuario'">
        @if (src()) {
          <img [src]="src()" alt="" />
        } @else if (initials()) {
          <span class="initials" [style.font-size.px]="fontPx()" [style.line-height]="lineHeight()" [style.letter-spacing]="spec().letterSpacing">{{ initials() }}</span>
        } @else {
          <rama-icon name="profile-user" [size]="iconPx()" />
        }
        @if (editable()) {
          <span class="overlay" aria-hidden="true"><rama-icon name="setting-2" [size]="overlayIconPx()" /></span>
        }
      </span>
    </span>
  `,
  styles: `
    :host { display: inline-flex; --av-radius: var(--rama-radius-full); }
    :host(.r-semi-round) { --av-radius: var(--av-semi); }
    :host(.r-square) { --av-radius: var(--rama-radius-none); }

    .frame { display: inline-flex; border-radius: var(--av-radius); }
    .avatar {
      position: relative; width: var(--av-size); height: var(--av-size); flex: none; overflow: hidden;
      display: inline-flex; align-items: center; justify-content: center; border-radius: var(--av-radius);
      background: var(--rama-bg-subtle); color: var(--rama-text-subtle);
    }
    img { width: 100%; height: 100%; object-fit: cover; }
    .initials { font-family: var(--rama-font); font-weight: var(--rama-weight-bold); }

    /* Style=Border: borde gris claro (1 a 6px según tamaño) con sombra medium (Figma Shadows/Light/Medium) */
    :host(.s-border) .avatar { border: var(--av-border) solid var(--rama-border-inset); box-shadow: var(--rama-shadow-medium); }
    /* Style=Detached Border: anillo separado del avatar; separación y grosor según tamaño */
    :host(.s-detached) .frame { padding: var(--av-pad); border: var(--av-stroke) solid var(--rama-bg-inset); }

    .overlay {
      position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
      background: var(--rama-black-70); color: var(--rama-text-default-white); border-radius: inherit;
      opacity: 0; transition: opacity .15s; cursor: pointer;
    }
    .avatar:hover .overlay, :host(.is-hover) .overlay { opacity: 1; }
  `,
})
export class RamaAvatar {
  readonly initials = input<string>();
  readonly src = input<string>();
  /** Texto accesible (p. ej. el cargo). */
  readonly label = input<string>();
  readonly size = input<AvatarSize>('4x');
  readonly radius = input<AvatarRadius>('round');
  readonly avatarStyle = input<AvatarStyle>('default');
  readonly editable = input(false);

  readonly px = computed(() => SIZES[this.size()]);
  readonly spec = computed(() => SPEC[this.size()]);
  readonly fontPx = computed(() => this.spec().font);
  readonly lineHeight = computed(() => { const lh = this.spec().lineHeight; return lh === 'normal' ? 'normal' : lh + 'px'; });
  readonly iconPx = computed(() => this.spec().icon);
  readonly overlayIconPx = computed(() => this.spec().hoverIcon);
}
