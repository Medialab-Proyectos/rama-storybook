import { ChangeDetectionStrategy, Component, ElementRef, computed, input, linkedSignal, output, viewChild } from '@angular/core';
import { RamaIcon } from '../icon/icon.component';
import { RamaFileState } from './file-state.component';
import { RamaUploadNote } from './upload-note.component';

export type UploaderButtonState = 'default' | 'disabled' | 'loading' | 'success' | 'error';

let nextId = 0;

/**
 * Uploader button Rama (Figma: 22 Uploaders · "Uploader Button", 423 de ancho). Un campo para un
 * solo documento: etiqueta, botón "Subir documento ↑" a todo el ancho y texto de ayuda.
 * - `loading`: la etiqueta pasa a ser el nombre del archivo; el archivo se ve con "Cargando..." y la papelera.
 * - `success`: el archivo cargado y la notificación "Documento se ha cargado con éxito.".
 * - `error`: el botón se mantiene y aparece la notificación de error (formato o tamaño).
 */
@Component({
  selector: 'rama-uploader-button',
  host: { '[class.st-loading]': "state() === 'loading'", '[class.st-success]': "state() === 'success'" },
  imports: [RamaIcon, RamaFileState, RamaUploadNote],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (state() === 'loading' || state() === 'success') {
      <p class="label">{{ fileName() }}</p>
      <rama-file-state [name]="fileName()" [status]="state() === 'loading' ? 'loading' : 'success'" action="remove"
        [notification]="notice() && showSuccessNotice()" [successMessage]="successMessage()" (remove)="remove.emit()" (notificationClosed)="closeNotice()" />
    } @else {
      <div class="field">
        <label class="label" [attr.for]="id">{{ label() }}</label>
        <button type="button" class="upload" [id]="id" [disabled]="state() === 'disabled'" [attr.aria-describedby]="describedBy()" (click)="pick()">
          {{ buttonLabel() }}<rama-icon name="upload" [size]="20" />
        </button>
      </div>
      @if (state() === 'error' && notice()) {
        <rama-upload-note kind="error" [id]="id + '-error'" (closed)="closeNotice()">{{ errorMessage() }}</rama-upload-note>
      } @else if (hint()) {
        <p class="hint" [id]="id + '-hint'">{{ hint() }}</p>
      }
      <input #file type="file" class="sr-only" [accept]="accept()" tabindex="-1" aria-hidden="true" (change)="onFile($event)" />
    }
  `,
  styles: `
    :host { display: flex; flex-direction: column; gap: var(--rama-space-8); width: 100%; max-width: 423px; font-family: var(--rama-font); box-sizing: border-box; }
    :host(.st-loading) { padding-bottom: var(--rama-space-16); }
    :host(.st-success) { padding: var(--rama-space-16) 0; }
    .field { display: flex; flex-direction: column; gap: var(--rama-space-4); }
    .label { margin: 0; font-size: 14px; line-height: 20px; font-weight: var(--rama-weight-bold); color: var(--rama-neutral-700); word-break: break-word; }
    .upload {
      display: flex; align-items: center; justify-content: center; gap: var(--rama-space-8); width: 100%; height: 49px; box-sizing: border-box;
      padding: var(--rama-space-10) var(--rama-space-16); background: var(--rama-bg-default-white); border: var(--rama-border-width-thin) solid var(--rama-text-information);
      border-radius: var(--rama-radius-small); box-shadow: var(--rama-shadow-x-small);
      font: var(--rama-weight-bold) 14px/20px var(--rama-font); color: var(--rama-text-information); cursor: pointer;
    }
    /* Hover/active no están en Figma: se completan con tokens. */
    .upload:hover:not(:disabled) { background: var(--rama-bg-inset); }
    .upload:active:not(:disabled) { background: var(--rama-information-surface); }
    .upload:focus-visible { outline: none; box-shadow: var(--rama-focus-ring); }
    .upload:disabled { border-color: var(--rama-border-disabled); color: var(--rama-text-disabled); cursor: not-allowed; }
    .hint { margin: 0; font-size: 12px; line-height: normal; font-weight: var(--rama-weight-medium); color: var(--rama-text-subtle); }

    .sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
  `,
})
export class RamaUploaderButton {
  protected readonly id = `rama-uploader-button-${nextId++}`;
  readonly state = input<UploaderButtonState>('default');
  readonly label = input('Adjuntar acta de aprobación (Obligatorio)');
  readonly buttonLabel = input('Subir documento');
  readonly hint = input('El documento debe ser tipo PDF y no superar los 10 MB.');
  readonly accept = input('.pdf');
  readonly fileName = input('');
  readonly successMessage = input('Documento se ha cargado con éxito.');
  /** false = en success solo se ve la fila del archivo con la papelera (Figma Panel lateral "Document + trash"). */
  readonly showSuccessNotice = input(true);
  readonly errorMessage = input('El documento debe ser tipo PDF o Excel y no superar los 10 MB.');

  readonly fileSelected = output<File>();
  readonly remove = output<void>();
  readonly notificationClosed = output<void>();

  /** La notificación se reabre cada vez que cambia el estado. */
  protected readonly notice = linkedSignal(() => { this.state(); return true; });
  protected readonly describedBy = computed(() =>
    this.state() === 'error' && this.notice() ? this.id + '-error' : this.hint() ? this.id + '-hint' : null);
  private readonly file = viewChild<ElementRef<HTMLInputElement>>('file');

  pick() { this.file()?.nativeElement.click(); }

  onFile(e: Event) {
    const input = e.target as HTMLInputElement;
    const f = input.files?.[0];
    if (f) { this.notice.set(true); this.fileSelected.emit(f); }
    input.value = '';
  }

  closeNotice() { this.notice.set(false); this.notificationClosed.emit(); }
}
