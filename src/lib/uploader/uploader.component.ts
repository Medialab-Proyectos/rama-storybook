import { ChangeDetectionStrategy, Component, ElementRef, computed, input, model, output, signal, viewChild } from '@angular/core';
import { RamaIcon } from '../icon/icon.component';
import { FileStateAction, RamaFileState } from './file-state.component';
import { RamaUploadNote } from './upload-note.component';

export type UploadStatus = 'loading' | 'success' | 'error';
export interface UploadItem { id: number; name: string; size: number; status: UploadStatus; error?: string; file?: File; }

let nextId = 0;

/**
 * Uploader Rama (Figma: 22 Uploaders, "Uploader Card multiple documents" + "File State").
 * Acepta archivos por arrastrar y soltar o por botón, valida formato (`accept`) y tamaño (`maxSizeMb`),
 * y lista cada archivo con su estado. La lista es un `model` para que el consumidor actualice el
 * estado real de la carga (loading → success / error).
 */
@Component({
  selector: 'rama-uploader',
  host: { '[class.full-width]': 'fullWidth()' },
  imports: [RamaIcon, RamaFileState, RamaUploadNote],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="drop" [class.dragging]="dragging()" [class.disabled]="disabled()" [class.has-error]="generalError()" [class.busy]="busy()"
      [class.loaded]="loadedCount() > 0 && !busy()"
      (dragover)="onDragOver($event)" (dragleave)="dragging.set(false)" (drop)="onDrop($event)">
      <p class="title">{{ label() }}</p>
      <p class="hint" [id]="hintId">{{ hint() }}</p>
      @if (busy()) {
        <div class="busy-state" role="status">
          <span class="busy-line"><rama-icon name="loading" [size]="18" class="spin flip" />Cargando...</span>
          <span class="busy-count">{{ loadedCount() }}/{{ items().length }} documentos cargados</span>
        </div>
      } @else {
        <button type="button" class="drop-btn" [attr.aria-describedby]="hintId" [disabled]="disabled() || full()" (click)="fileInput().nativeElement.click()">{{ buttonLabel() }}</button>
        @if (secondLabel()) {
          <button type="button" class="drop-link" [disabled]="disabled()" (click)="secondAction.emit()">{{ secondLabel() }}</button>
        }
      }
      <input #fileInput type="file" class="sr-only" [attr.accept]="accept() || null" [multiple]="multiple()" [disabled]="disabled()"
        [attr.aria-label]="label()" (change)="onPick($event)" />
    </div>

    @if (generalError(); as err) {
      <rama-upload-note kind="error" class="general" (closed)="generalError.set(null)">{{ err }}</rama-upload-note>
    }

    @if (multiple() && items().length) {
      <div class="counter" aria-live="polite">
        <strong>Documentos cargados</strong>
        <span>{{ loadedCount() }}/{{ maxFiles() }} documentos cargados</span>
      </div>
    }

    @if (items().length) {
      <ul class="files">
        @for (item of items(); track item.id) {
          <li class="file">
            <rama-file-state [name]="item.name" [status]="item.status" [action]="actionFor(item)" [errorMessage]="item.error"
              [notification]="(item.status === 'success' ? showSuccess() : showErrorNotification()) && !closed().has(item.id)"
              (remove)="remove(item)" (download)="fileDownload.emit(item)" (notificationClosed)="closeNote(item)" />
          </li>
        }
      </ul>
    }
  `,
  styles: `
    :host { display: flex; flex-direction: column; gap: var(--rama-space-16); width: 100%; max-width: 378px; box-sizing: border-box; font-family: var(--rama-font); }
    /* Figma fija 378; en contenedores más anchos (p. ej. panel lateral de 424) se puede ocupar todo el ancho. */
    :host(.full-width) { max-width: none; }
    rama-file-state { max-width: none; }
    .drop {
      display: flex; flex-direction: column; align-items: center; gap: var(--rama-space-8); padding: var(--rama-space-16);
      border: var(--rama-border-width-thin) solid var(--rama-border-primary); border-radius: var(--rama-radius-large);
      background: var(--rama-bg-default-white); text-align: center; transition: background-color .15s, border-color .15s;
    }
    .drop.dragging { background: var(--rama-primary-50); border-style: dashed; }
    .drop.has-error { border-color: var(--rama-border-error-emphasis); }
    /* Disabled: fondo blanco, borde #EAECF0; título y ayuda conservan su color. */
    .drop.disabled { background: var(--rama-bg-default-white); border-color: var(--rama-border-default); }
    /* Figma: título en neutral-600 (#4D4D56); solo con documentos ya cargados pasa a muted. */
    .title { margin: 0; font-size: 16px; line-height: 24px; font-weight: var(--rama-weight-bold); color: var(--rama-neutral-600); }
    .drop.loaded .title { color: var(--rama-text-muted); }
    .hint { margin: 0; font-size: 12px; line-height: 1.5; letter-spacing: -0.132px; color: var(--rama-text-subtle); }
    .sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }

    /* Botón "Agregar documentos": 164 de ancho, 8/16 de relleno, 12/20 bold (Figma 12017:15250). */
    .drop-btn, .drop-link { width: 164px; box-sizing: border-box; border-radius: var(--rama-radius-small); font: var(--rama-weight-bold) 12px/20px var(--rama-font); cursor: pointer; }
    .drop-btn { padding: var(--rama-space-8) var(--rama-space-16); background: var(--rama-bg-default-white);
      border: var(--rama-border-width-thin) solid var(--rama-border-primary); color: var(--rama-text-primary); }
    .drop-btn:disabled { border-color: var(--rama-border-default); color: var(--rama-text-disabled); cursor: not-allowed; }
    /* Segundo botón: enlace de texto 12/20 regular (Figma secondButton 12017:15251). */
    .drop-link { padding: var(--rama-space-10) var(--rama-space-16); border: 0; background: transparent; color: var(--rama-text-primary); font-weight: var(--rama-weight-regular); }
    .drop-link:disabled { color: var(--rama-text-disabled); cursor: not-allowed; }
    /* Hover no está en Figma: se completa con tokens. */
    .drop-btn:hover:not(:disabled) { background: var(--rama-bg-inset); }
    .drop-link:hover:not(:disabled) { text-decoration: underline; }
    .drop-btn:focus-visible, .drop-link:focus-visible { outline: none; box-shadow: var(--rama-focus-ring); }

    /* Loading del drop (Figma 12017:15306): reemplaza los botones. */
    .drop.busy { justify-content: flex-start; }
    .busy-state { display: flex; flex-direction: column; align-items: center; gap: var(--rama-space-4); width: 175px; }
    .busy-line { display: flex; align-items: center; gap: var(--rama-space-8); font-size: 14px; line-height: 20px; font-weight: var(--rama-weight-bold); color: var(--rama-text-primary); }
    .busy-count { font-size: 12px; line-height: 20px; color: var(--rama-text-subtle); }
    .spin { animation: up-spin 1s linear infinite; }
    .flip { transform: rotate(180deg) scaleY(-1); }
    @media (prefers-reduced-motion: reduce) { .spin { animation: none; } }
    @keyframes up-spin { from { transform: rotate(180deg) scaleY(-1); } to { transform: rotate(540deg) scaleY(-1); } }

    .counter { display: flex; flex-direction: column; font-size: 12px; line-height: 20px; color: var(--rama-text-subtle); }
    .counter strong { font-size: 14px; }

    .files { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; }
    .file { display: flex; flex-direction: column; gap: var(--rama-space-8); padding: var(--rama-space-16) 0;
      border-bottom: var(--rama-border-width-thin) solid var(--rama-border-default); }
    .file:first-child { padding-top: 0; }
    .file:last-child { border-bottom: 0; }
    /* Error general: queda a 8px del drop (Figma 11983:13994). */
    .general { margin-top: calc(var(--rama-space-8) - var(--rama-space-16)); }
  `,
})
export class RamaUploader {
  readonly label = input('Sube uno o varios documentos');
  readonly hint = input('El documento debe ser tipo PDF o Excel y no superar los 10 MB.');
  readonly buttonLabel = input('Agregar documentos');
  /** Enlace de texto opcional bajo el botón (Figma secondButton); vacío = oculto. */
  readonly secondLabel = input('');
  /** Extensiones permitidas separadas por coma, p. ej. ".pdf,.xls,.xlsx". */
  readonly accept = input('.pdf,.xls,.xlsx');
  readonly maxSizeMb = input(10);
  readonly multiple = input(true);
  readonly maxFiles = input(10);
  readonly disabled = input(false);
  /** true = ocupa el 100% del contenedor (sin el máximo de 378 de Figma). */
  readonly fullWidth = input(false);
  readonly removable = input(true);
  readonly showSuccess = input(true);
  readonly showErrorNotification = input(true);
  /** Acción del archivo cargado: quitar (papelera) o descargar (Figma "File loaded + Download icon"). */
  readonly fileAction = input<'remove' | 'download'>('remove');
  readonly items = model<UploadItem[]>([]);
  readonly filesAdded = output<UploadItem[]>();
  readonly fileRemoved = output<UploadItem>();
  readonly fileDownload = output<UploadItem>();
  readonly secondAction = output<void>();

  protected readonly hintId = `rama-uploader-hint-${nextId++}`;
  protected readonly dragging = signal(false);
  protected readonly generalError = signal<string | null>(null);
  protected readonly fileInput = viewChild.required<ElementRef<HTMLInputElement>>('fileInput');
  protected readonly loadedCount = computed(() => this.items().filter(i => i.status === 'success').length);
  protected readonly full = computed(() => this.multiple() && this.items().length >= this.maxFiles());
  /** Hay archivos subiendo: el drop muestra "Cargando..." en lugar de los botones. */
  protected readonly busy = computed(() => this.items().some(i => i.status === 'loading'));
  protected readonly closed = signal<Set<number>>(new Set());

  protected actionFor(item: UploadItem): FileStateAction {
    if (this.fileAction() === 'download' && item.status === 'success') return 'download';
    return this.removable() ? 'remove' : 'none';
  }

  closeNote(item: UploadItem) { this.closed.update(s => new Set(s).add(item.id)); }

  onDragOver(event: DragEvent) {
    if (this.disabled()) return;
    event.preventDefault();
    this.dragging.set(true);
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.dragging.set(false);
    if (!this.disabled() && event.dataTransfer?.files) this.add(Array.from(event.dataTransfer.files));
  }

  onPick(event: Event) {
    const el = event.target as HTMLInputElement;
    if (el.files) this.add(Array.from(el.files));
    el.value = '';
  }

  remove(item: UploadItem) {
    this.items.update(list => list.filter(i => i.id !== item.id));
    this.fileRemoved.emit(item);
  }

  private add(files: File[]) {
    this.generalError.set(null);
    if (!this.multiple()) files = files.slice(0, 1);
    const room = this.multiple() ? this.maxFiles() - this.items().length : 1;
    if (files.length > room) {
      this.generalError.set(`Solo puedes cargar ${this.maxFiles()} documentos.`);
      files = files.slice(0, Math.max(room, 0));
    }
    const added = files.map(file => this.validate(file));
    this.items.update(list => (this.multiple() ? [...list, ...added] : added));
    if (added.length) this.filesAdded.emit(added);
  }

  private validate(file: File): UploadItem {
    const item: UploadItem = { id: nextId++, name: file.name, size: file.size, status: 'success', file };
    const allowed = this.accept().split(',').map(e => e.trim().toLowerCase()).filter(Boolean);
    const ext = '.' + (file.name.split('.').pop() ?? '').toLowerCase();
    if (allowed.length && !allowed.includes(ext)) {
      return { ...item, status: 'error', error: `El formato ${ext} no está permitido. Usa ${allowed.join(', ')}.` };
    }
    if (file.size > this.maxSizeMb() * 1024 * 1024) {
      return { ...item, status: 'error', error: `El documento supera los ${this.maxSizeMb()} MB permitidos.` };
    }
    return item;
  }
}
