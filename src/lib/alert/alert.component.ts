import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { RamaIcon } from '../icon/icon.component';

export type AlertState = 'success' | 'information' | 'caution' | 'warning' | 'error';
export type AlertVariant = 'default' | 'compact';

/** Íconos de la tarjeta (set "Alerts"): check, info-circle de trazo y Essetional/Danger.
 *  Warning y Caution no existen en Figma: se completaron con el mismo ícono de Error. */
const ICON_DEFAULT: Record<AlertState, string> = {
  success: 'check', information: 'info-circle-stroke', caution: 'danger', warning: 'danger', error: 'danger',
};
/** Íconos de la notificación compacta (ejemplos de página): checks y "alert" (círculo con !). */
const ICON_COMPACT: Record<AlertState, string> = {
  success: 'checks', information: 'alert-circle', caution: 'alert-circle', warning: 'alert-circle', error: 'alert-circle',
};

/**
 * Alerta Rama (Figma "Rama (3)" › Alerts). `default` es la tarjeta del set "Alerts" (816 px,
 * título Bold 20 + descripción 18/28); `compact` es la "Semantic Notification" que se usa en las
 * páginas (ancho completo del contenido, título y descripción 14/20). La descripción va como
 * contenido proyectado; título y botón de cerrar son opcionales.
 */
@Component({
  selector: 'rama-alert',
  imports: [RamaIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[hidden]': 'dismissed()' },
  template: `
    <div [class]="'alert ' + state() + ' ' + variant()" [attr.role]="state() === 'error' ? 'alert' : 'status'">
      <span class="featured" aria-hidden="true"><rama-icon [name]="icon()" [size]="iconSize()" /></span>
      <div class="text">
        @if (title()) { <p class="title">{{ title() }}</p> }
        <div class="desc"><ng-content /></div>
      </div>
      @if (dismissible()) {
        <button type="button" class="close" [attr.aria-label]="closeLabel()" (click)="dismiss()">
          <rama-icon [name]="variant() === 'compact' ? 'close-bold' : 'x'" [size]="20" />
        </button>
      }
    </div>
  `,
  styles: `
    :host { display: block; }
    .alert {
      display: flex; align-items: flex-start; gap: var(--rama-space-24); padding: var(--rama-space-24);
      border-radius: var(--rama-radius-medium); box-shadow: var(--rama-shadow-x-small); font-family: var(--rama-font);
      background: var(--surface); color: var(--tone);
    }
    /* Ícono destacado: caja on-fill con el ícono en el color de la superficie (como en Figma). */
    .featured {
      flex: none; display: flex; align-items: center; justify-content: center; box-sizing: border-box;
      width: 36px; height: 36px; border-radius: var(--rama-radius-small);
      background: var(--on-fill); color: var(--surface); box-shadow: var(--rama-shadow-small);
    }
    .text { flex: 1; min-width: 0; display: flex; flex-direction: column; justify-content: center; gap: var(--rama-space-8); overflow-wrap: anywhere; }
    .title { margin: 0; font-size: 20px; line-height: normal; font-weight: var(--rama-weight-bold); letter-spacing: -0.4px; }
    .desc { font-size: 18px; line-height: 28px; font-weight: var(--rama-weight-regular); }
    .desc:empty { display: none; }
    .close {
      flex: none; display: flex; padding: 0; border: 0; background: transparent; color: inherit; cursor: pointer;
      border-radius: var(--rama-radius-xs); transition: background-color .15s;
    }
    .close:hover { background: var(--rama-black-5); }
    .close:focus-visible { outline: none; box-shadow: var(--rama-focus-ring); }

    /* Compacta (Semantic Notification): relleno 12, separación 16, radio 14 (sin token: está entre
       medium 12 y large 16), título Bold y descripción Medium 14/20 separados 4px. */
    .compact { gap: var(--rama-space-16); padding: var(--rama-space-12); border-radius: 14px; }
    .compact .text { gap: var(--rama-space-4); }
    .compact .title, .compact .desc { font-size: 14px; line-height: 20px; letter-spacing: -0.28px; }
    .compact .title { font-weight: var(--rama-weight-bold); }
    .compact .desc { font-weight: var(--rama-weight-medium); }

    /* Móvil: la tarjeta grande reduce relleno y separación para no comerse el ancho. */
    @media (max-width: 480px) {
      .default { gap: var(--rama-space-16); padding: var(--rama-space-16); }
      .default .title { font-size: 18px; }
      .default .desc { font-size: 16px; line-height: 24px; }
    }

    .success { --surface: var(--rama-success-surface); --on-fill: var(--rama-success-on-fill); --tone: var(--rama-text-success); }
    .information { --surface: var(--rama-information-surface); --on-fill: var(--rama-information-on-fill); --tone: var(--rama-text-information); }
    .caution { --surface: var(--rama-caution-surface); --on-fill: var(--rama-caution-on-fill); --tone: var(--rama-text-caution); }
    .warning { --surface: var(--rama-warning-surface); --on-fill: var(--rama-warning-on-fill); --tone: var(--rama-text-warning); }
    .error { --surface: var(--rama-error-surface); --on-fill: var(--rama-error-on-fill); --tone: var(--rama-text-error); }
  `,
})
export class RamaAlert {
  readonly state = input<AlertState>('information');
  readonly variant = input<AlertVariant>('default');
  readonly title = input<string>();
  readonly dismissible = input(true);
  readonly closeLabel = input('Cerrar alerta');
  readonly closed = output<void>();

  readonly icon = computed(() => (this.variant() === 'compact' ? ICON_COMPACT : ICON_DEFAULT)[this.state()]);
  /** En la notificación de error de Figma el ícono "alert" mide 18; el resto, 20. */
  readonly iconSize = computed(() => (this.variant() === 'compact' && this.state() === 'error' ? 18 : 20));
  protected readonly dismissed = signal(false);

  dismiss() {
    this.dismissed.set(true);
    this.closed.emit();
  }
}
