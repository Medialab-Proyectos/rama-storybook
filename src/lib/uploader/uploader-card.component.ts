import { ChangeDetectionStrategy, Component, ElementRef, computed, inject, input, linkedSignal, output, signal, viewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { RamaIcon } from '../icon/icon.component';
import { uploaderCirclesSvg } from './uploader-circles';
import { RamaUploadNote } from './upload-note.component';

export type UploaderCardState = 'default' | 'disabled' | 'loading' | 'analysis' | 'success' | 'error' | 'error-message';

/**
 * Uploader card Rama (Figma: 22 Uploaders · "Uploader card", 606×195). Una sola plantilla por tarjeta:
 * - `default`: ícono add-circle, título y formato; clic o arrastrar para elegir el archivo.
 * - `disabled`: gris (#F9F9F9 / borde #A0A9B4), sin interacción.
 * - `loading`: "Subiendo tu documento..." con spinner.
 * - `analysis`: "Haciendo los cálculos anuales..." + avance ("100 de 120").
 * - `success`: borde verde, botones Reemplazar archivo / Consultar documento / Reporte general
 *   (los dos últimos opcionales) y notificación "El documento se ha cargado con éxito.".
 * - `error`: borde rojo, botón "Volver a cargar" y notificación de error con detalle y botón.
 * - `error-message`: borde rojo y el texto de formato en rojo (validación de formato/tamaño).
 */
@Component({
  selector: 'rama-uploader-card',
  imports: [RamaIcon, RamaUploadNote],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="card" [class]="'card ' + state()" [class.dragging]="dragging()"
      [attr.role]="clickable() ? 'button' : null" [attr.tabindex]="clickable() ? 0 : null"
      [attr.aria-disabled]="state() === 'disabled' || null" [attr.aria-busy]="busy() || null"
      [attr.aria-label]="clickable() ? 'Subir ' + title() : null"
      (click)="clickable() && pick()" (keydown.enter)="clickable() && pick()" (keydown.space)="clickable() && pick($event)"
      (dragover)="onDragOver($event)" (dragleave)="dragging.set(false)" (drop)="onDrop($event)">
      <span class="bg" [innerHTML]="circles"></span>
      @if (state() === 'loading' || state() === 'analysis') {
        <p class="status" role="status"><rama-icon name="loading" [size]="18" class="spin" />{{ state() === 'loading' ? loadingText() : analysisText() }}</p>
        @if (state() === 'analysis' && progress()) { <p class="status progress">{{ progress() }}</p> }
      }
      <div class="content">
        @if (showIcon()) { <rama-icon name="add-circle" [size]="32" class="add" /> }
        <div class="texts">
          <p class="title">{{ title() }}</p>
          <p class="hint">{{ hint() }}</p>
        </div>
      </div>
      @if (state() === 'success') {
        <div class="actions" (click)="$event.stopPropagation()">
          <button type="button" class="btn outlined" (click)="replace.emit(); pick()">{{ replaceLabel() }}<rama-icon name="refresh-5" [size]="20" /></button>
          @if (secondLabel()) { <button type="button" class="btn filled" (click)="second.emit()">{{ secondLabel() }}</button> }
          @if (thirdLabel()) { <button type="button" class="btn filled" (click)="third.emit()">{{ thirdLabel() }}</button> }
        </div>
      }
      @if (state() === 'error') {
        <div class="actions" (click)="$event.stopPropagation()">
          <button type="button" class="btn filled" (click)="retry.emit(); pick()">{{ retryLabel() }}</button>
        </div>
      }
      <input #file type="file" class="sr-only" [accept]="accept()" tabindex="-1" aria-hidden="true" (change)="onFile($event)" />
    </div>

    @if (state() === 'success' && notice()) {
      <rama-upload-note kind="success" (closed)="closeNotice()">{{ successMessage() }}</rama-upload-note>
    }
    @if (state() === 'error' && notice()) {
      <div class="note error" role="alert">
        <rama-icon name="alert-circle" [size]="18" class="alert" />
        <div class="error-body">
          <p class="error-title">{{ errorTitle() }}</p>
          @if (errorText()) { <p class="error-text">{{ errorText() }}</p> }
          @if (errorActionLabel()) { <button type="button" class="btn error-btn" (click)="errorAction.emit()">{{ errorActionLabel() }}</button> }
        </div>
      </div>
    }
  `,
  styles: `
    /* Figma usa colores del kit Flowkit (#0092ED, #FD7575, #FC5555); se usan los tokens Rama más cercanos
       para que la tarjeta siga la paleta y cambie con el tema. */
    :host {
      --uc-accent: var(--rama-primary-600); --uc-error-border: var(--rama-red-300); --uc-error-msg: var(--rama-red-400);
      display: flex; flex-direction: column; gap: var(--rama-space-8); width: 100%; max-width: 606px; font-family: var(--rama-font);
    }
    .card {
      position: relative; overflow: hidden; box-sizing: border-box; min-height: 195px;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      padding: var(--rama-space-24) var(--rama-space-16); background: var(--rama-bg-default-white);
      border: var(--rama-border-width-thin) solid var(--uc-accent); border-radius: 15px;
      box-shadow: var(--rama-shadow-small); outline: none;
    }
    .card[role='button'] { cursor: pointer; }
    .card[role='button']:focus-visible { box-shadow: var(--rama-focus-ring); }
    /* Hover y arrastre no están en Figma: se completan con tokens. */
    .card[role='button']:hover { background: var(--rama-bg-subtle); }
    .card.dragging { background: var(--rama-primary-50); border-style: dashed; }
    .btn.filled:hover { background: var(--rama-primary-700); border-color: var(--rama-primary-700); }
    .btn.outlined:hover, .btn.error-btn:hover { background: var(--rama-bg-inset); }
    .bg { position: absolute; left: 50%; top: -309px; width: 992px; height: 992px; transform: translateX(-50%); pointer-events: none; }
    .bg ::ng-deep svg { display: block; }
    .content, .status, .actions { position: relative; }
    .content { display: flex; flex-direction: column; align-items: center; gap: var(--rama-space-12); width: 100%; max-width: 455px; text-align: center; }
    .texts { display: flex; flex-direction: column; gap: var(--rama-space-4); width: 100%; }
    .title { margin: 0; font-size: 24px; line-height: normal; font-weight: var(--rama-weight-bold); letter-spacing: -0.48px; color: var(--rama-text-default-black); }
    .hint { margin: 0; font-size: 14px; line-height: 20px; font-weight: var(--rama-weight-medium); color: var(--rama-text-muted); }
    .add { color: var(--uc-accent); }
    .status { display: flex; align-items: center; justify-content: center; gap: var(--rama-space-8); height: 22px; margin: 0; padding: 1px 12px;
      font-size: 14px; line-height: 20px; font-weight: var(--rama-weight-bold); color: var(--uc-accent); }
    .spin { transform: rotate(180deg); animation: uc-spin 1s linear infinite; }
    @media (prefers-reduced-motion: reduce) { .spin { animation: none; } }
    @keyframes uc-spin { from { transform: rotate(180deg); } to { transform: rotate(540deg); } }

    .actions { display: flex; align-items: center; justify-content: center; gap: var(--rama-space-16); margin-top: var(--rama-space-24); flex-wrap: wrap; }
    .card.error .actions { margin-top: 26px; }
    .btn { display: inline-flex; align-items: center; justify-content: center; gap: var(--rama-space-8); min-width: 164px; white-space: nowrap; padding: var(--rama-space-8) var(--rama-space-16);
      border: var(--rama-border-width-thin) solid var(--uc-accent); border-radius: var(--rama-radius-small);
      font: var(--rama-weight-bold) 12px/20px var(--rama-font); cursor: pointer; box-sizing: border-box; }
    .btn:focus-visible { outline: none; box-shadow: var(--rama-focus-ring); }
    .btn.filled { background: var(--uc-accent); color: var(--rama-text-default-white); }
    .btn.outlined { height: 36px; background: var(--rama-bg-default-white); color: var(--uc-accent); font-weight: var(--rama-weight-regular); }

    /* Estados */
    .card.disabled { padding: var(--rama-space-32) var(--rama-space-16); background: var(--rama-neutral-100); border-color: var(--rama-text-subtle); }
    .card.disabled .title, .card.disabled .hint, .card.disabled .add { color: var(--rama-text-subtle); }
    .card.success { border-color: var(--rama-text-success); }
    .card.error { border-color: var(--uc-error-border); }
    .card.error-message { border-color: var(--uc-error-msg); box-shadow: none; }
    .card.error-message .hint { color: var(--uc-error-msg); font-weight: var(--rama-weight-semibold); }

    /* Notificaciones (Semantic Notifications de la página) */
    .note { display: flex; gap: var(--rama-space-16); align-items: center; padding: var(--rama-space-12); border-radius: 14px; box-shadow: var(--rama-shadow-x-small); }
    /* Figma #E9C1BF: sin token exacto, se usa red-100. */
    .note.error { align-items: flex-start; gap: var(--rama-space-8); background: var(--rama-error-surface); border: var(--rama-border-width-thin) solid var(--rama-red-100); }
    .alert { flex: none; color: var(--rama-text-error); }
    .error-body { flex: 1; display: flex; flex-direction: column; align-items: flex-start; gap: var(--rama-space-10); color: var(--rama-text-error); }
    .error-title, .error-text { margin: 0; font-size: 12px; line-height: 20px; letter-spacing: -0.24px; }
    .error-title { font-weight: var(--rama-weight-bold); }
    .error-text { margin-top: calc(-1 * var(--rama-space-10)); font-weight: var(--rama-weight-regular); white-space: pre-line; }
    .btn.error-btn { width: auto; min-width: 0; background: var(--rama-bg-default-white); border-color: var(--rama-text-error); color: var(--rama-text-error); }
    .sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
  `,
})
export class RamaUploaderCard {
  readonly state = input<UploaderCardState>('default');
  readonly title = input('Plantilla de calculo salarial');
  readonly hint = input('En formato Excel y tamaño máximo de 10 MB');
  readonly accept = input('.xls,.xlsx');
  readonly loadingText = input('Subiendo tu documento...');
  readonly analysisText = input('Haciendo los cálculos anuales...');
  /** Avance del análisis, p. ej. "100 de 120". */
  readonly progress = input<string>();
  readonly replaceLabel = input('Reemplazar archivo');
  /** Segundo y tercer botón del estado success; vacíos = ocultos. */
  readonly secondLabel = input('Consultar documento');
  readonly thirdLabel = input('Reporte general');
  readonly successMessage = input('El documento se ha cargado con éxito.');
  readonly retryLabel = input('Volver a cargar');
  readonly errorTitle = input('No pudimos cargar el archivo “Plantilla de calculo salarial” porque contiene datos inconsistentes.');
  readonly errorText = input<string>('Las observaciones han sido resaltadas en el documento para que las revises y ajustes.\nUna vez corregido, podrás volver a cargarlo.');
  readonly errorActionLabel = input('Consultar documento');

  readonly fileSelected = output<File>();
  readonly replace = output<void>();
  readonly second = output<void>();
  readonly third = output<void>();
  readonly retry = output<void>();
  readonly errorAction = output<void>();
  readonly notificationClosed = output<void>();

  protected readonly circles = inject(DomSanitizer).bypassSecurityTrustHtml(uploaderCirclesSvg());
  protected readonly dragging = signal(false);
  /** La notificación se reabre cada vez que cambia el estado. */
  protected readonly notice = linkedSignal(() => { this.state(); return true; });
  private readonly file = viewChild<ElementRef<HTMLInputElement>>('file');

  readonly clickable = computed(() => this.state() === 'default' || this.state() === 'error-message');
  readonly busy = computed(() => this.state() === 'loading' || this.state() === 'analysis');
  readonly showIcon = computed(() => ['default', 'disabled', 'error-message'].includes(this.state()));

  pick(e?: Event) { e?.preventDefault(); this.file()?.nativeElement.click(); }

  onFile(e: Event) {
    const input = e.target as HTMLInputElement;
    const f = input.files?.[0];
    if (f) { this.notice.set(true); this.fileSelected.emit(f); }
    input.value = '';
  }

  onDragOver(e: DragEvent) { if (!this.clickable()) return; e.preventDefault(); this.dragging.set(true); }

  onDrop(e: DragEvent) {
    if (!this.clickable()) return;
    e.preventDefault(); this.dragging.set(false);
    const f = e.dataTransfer?.files?.[0];
    if (f) { this.notice.set(true); this.fileSelected.emit(f); }
  }

  closeNotice() { this.notice.set(false); this.notificationClosed.emit(); }
}
