import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RamaIcon } from '../icon/icon.component';

export type UploadNoteKind = 'success' | 'error';

/**
 * Notificación compacta de los uploaders (Figma 22 Uploaders):
 * - `success` = "Semantic Notifications (Light version)": 48 alto, relleno 12, separación 16, radio 14,
 *   fondo success-surface, ícono "checks" 16 en caja 26 success-on-fill, texto 14/20 bold, cierre close-bold 20.
 * - `error` = "Component 99": relleno 16, separación 16 con el cierre y 8 entre ícono y texto (alineados arriba),
 *   fondo error-surface, ícono "alert" 18 en caja 26 error-on-fill, texto 14/20 bold, cierre close-bold 20.
 * El texto va por proyección. `role` status/alert según el tipo para que se anuncie.
 */
@Component({
  selector: 'rama-upload-note',
  imports: [RamaIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'kind()',
    '[attr.role]': "kind() === 'error' ? 'alert' : 'status'",
  },
  template: `
    <div class="content">
      <span class="icon"><rama-icon [name]="kind() === 'error' ? 'alert-circle' : 'checks'" [size]="kind() === 'error' ? 18 : 16" /></span>
      <p class="text"><ng-content /></p>
    </div>
    @if (closable()) {
      <button type="button" class="close" aria-label="Cerrar notificación" (click)="closed.emit()"><rama-icon name="close-bold" [size]="20" /></button>
    }
  `,
  styles: `
    :host { display: flex; align-items: center; gap: var(--rama-space-16); box-sizing: border-box; width: 100%; border-radius: 14px /* Figma 14: sin token de radio equivalente */; font-family: var(--rama-font); }
    :host(.success) { min-height: 48px; /* 48 de alto: el ícono de 26 queda a 11 del borde (Figma). */
      padding: calc(var(--rama-space-12) - 1px) var(--rama-space-12); background: var(--rama-success-surface); box-shadow: var(--rama-shadow-x-small); }
    :host(.error) { padding: var(--rama-space-16); background: var(--rama-error-surface); }
    .content { flex: 1; min-width: 0; display: flex; gap: var(--rama-space-16); align-items: center; }
    :host(.error) .content { gap: var(--rama-space-8); align-items: flex-start; }
    .icon { flex: none; display: flex; align-items: center; justify-content: center; width: 26px; height: 26px; border-radius: var(--rama-radius-xs); }
    :host(.success) .icon { background: var(--rama-success-on-fill); color: var(--rama-success-surface); filter: drop-shadow(3.667px 3.667px 3.056px rgba(120, 132, 149, .05)); }
    :host(.error) .icon { background: var(--rama-error-on-fill); color: var(--rama-error-surface); }
    .text { flex: 1; min-width: 0; margin: 0; font-size: 14px; line-height: 20px; font-weight: var(--rama-weight-bold); letter-spacing: -0.28px; word-break: break-word; }
    :host(.success) .text { color: var(--rama-text-success); }
    :host(.error) .text { color: var(--rama-text-error); }
    .close { flex: none; display: flex; padding: 0; border: 0; background: transparent; cursor: pointer; border-radius: var(--rama-radius-xs); }
    :host(.success) .close { color: var(--rama-text-success); }
    :host(.error) .close { color: var(--rama-error-on-fill); }
    /* Hover/focus no definidos en Figma: se completan con tokens. */
    .close:hover { background: color-mix(in srgb, currentColor 8%, transparent); }
    .close:focus-visible { outline: none; box-shadow: var(--rama-focus-ring); }
  `,
})
export class RamaUploadNote {
  readonly kind = input<UploadNoteKind>('success');
  readonly closable = input(true);
  readonly closed = output<void>();
}
