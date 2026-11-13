import { ChangeDetectionStrategy, Component, input, linkedSignal, output } from '@angular/core';
import { RamaIcon } from '../icon/icon.component';
import { RamaUploadNote } from './upload-note.component';

export type FileStateStatus = 'default' | 'loading' | 'success' | 'error';
export type FileStateAction = 'none' | 'remove' | 'download';

/**
 * Fila de archivo de los uploaders (Figma 22 Uploaders · "File State", 378 de ancho). La comparten
 * el Uploader button y el Uploader multiple.
 * - Chip "Carga de archivo": fondo neutral-100, borde 1 info, radio 8, relleno 10/16, sombra x-small;
 *   nombre 14/20 bold info. En `loading` suma "Cargando..." (12/20 bold) con el spinner 16 y separa 4.
 * - Acción a la derecha (26×26, separación 8): papelera text-muted (`remove`) o descarga negra (`download`).
 * - Notificación debajo (separación 8): éxito en `success`, mensaje de error en `error` (`notification`).
 */
@Component({
  selector: 'rama-file-state',
  imports: [RamaIcon, RamaUploadNote],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="row">
      <div class="chip" [class.busy]="status() === 'loading'" [attr.aria-busy]="status() === 'loading' || null">
        <span class="name">{{ name() }}</span>
        @if (status() === 'loading') {
          <span class="loading" role="status"><rama-icon name="loading" [size]="16" class="spin" />{{ loadingText() }}</span>
        }
      </div>
      @if (action() === 'remove') {
        <button type="button" class="act trash" [attr.aria-label]="'Quitar ' + name()" (click)="remove.emit()"><rama-icon name="trash-2-26" [size]="26" /></button>
      } @else if (action() === 'download') {
        <button type="button" class="act download" [attr.aria-label]="'Descargar ' + name()" [disabled]="status() === 'loading'" (click)="download.emit()"><rama-icon name="download" [size]="26" /></button>
      }
    </div>
    @if (notification() && open()) {
      @if (status() === 'success') {
        <rama-upload-note kind="success" (closed)="close()">{{ successMessage() }}</rama-upload-note>
      } @else if (status() === 'error' && errorMessage()) {
        <rama-upload-note kind="error" (closed)="close()">{{ errorMessage() }}</rama-upload-note>
      }
    }
  `,
  styles: `
    :host { display: flex; flex-direction: column; gap: var(--rama-space-8); width: 100%; max-width: 378px; font-family: var(--rama-font); }
    .row { display: flex; align-items: center; gap: var(--rama-space-8); }
    .chip {
      flex: 1; min-width: 0; display: flex; flex-direction: column; gap: var(--rama-space-8); box-sizing: border-box;
      /* Figma dibuja el borde por dentro (40 / 64 de alto): se descuenta del relleno vertical de 10. */
      padding: calc(var(--rama-space-10) - var(--rama-border-width-thin)) var(--rama-space-16); background: var(--rama-neutral-100);
      border: var(--rama-border-width-thin) solid var(--rama-text-information); border-radius: var(--rama-radius-small);
      box-shadow: var(--rama-shadow-x-small); color: var(--rama-text-information);
    }
    .chip.busy { gap: var(--rama-space-4); }
    .name { font-size: 14px; line-height: 20px; font-weight: var(--rama-weight-bold); word-break: break-word; }
    .loading { display: flex; align-items: center; gap: var(--rama-space-4); font-size: 12px; line-height: 20px; font-weight: var(--rama-weight-bold); }
    /* El spinner de Figma va rotado 180° y reflejado en Y. */
    .spin { transform: rotate(180deg) scaleY(-1); animation: fs-spin 1s linear infinite; }
    @keyframes fs-spin { from { transform: rotate(180deg) scaleY(-1); } to { transform: rotate(540deg) scaleY(-1); } }
    @media (prefers-reduced-motion: reduce) { .spin { animation: none; } }
    .act { flex: none; display: flex; padding: 0; border: 0; background: transparent; cursor: pointer; border-radius: var(--rama-radius-xs); }
    .trash { color: var(--rama-text-muted); }
    .download { color: var(--rama-text-default-black); }
    /* Hover, focus y disabled no están en Figma: se completan con tokens. */
    .act:hover { background: var(--rama-bg-inset); }
    .trash:hover { color: var(--rama-text-error); }
    .download:hover { color: var(--rama-text-information); }
    .act:focus-visible { outline: none; box-shadow: var(--rama-focus-ring); }
    .act:disabled { color: var(--rama-text-disabled); background: transparent; cursor: not-allowed; }
  `,
})
export class RamaFileState {
  readonly name = input.required<string>();
  readonly status = input<FileStateStatus>('default');
  readonly action = input<FileStateAction>('none');
  /** Muestra la notificación de éxito/error bajo el archivo. */
  readonly notification = input(true);
  readonly loadingText = input('Cargando...');
  readonly successMessage = input('Documento se ha cargado con éxito.');
  readonly errorMessage = input<string | undefined>('');

  readonly remove = output<void>();
  readonly download = output<void>();
  readonly notificationClosed = output<void>();

  /** Se reabre cada vez que cambia el estado del archivo. */
  protected readonly open = linkedSignal(() => { this.status(); return true; });

  protected close() { this.open.set(false); this.notificationClosed.emit(); }
}
