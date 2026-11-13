import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, computed, effect, inject, input, model, output, signal, viewChild } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { RamaIcon } from '../icon/icon.component';
import { DialogFocus } from './dialog-focus';

export type ModalVariant = 'form' | 'confirm';
export type ModalSize = 'small' | 'medium' | 'large' | 'xlarge';
export type ModalTone = 'caution' | 'error' | 'success' | 'information';

/** Ícono destacado por tono (Figma "Featured icon": Warning · Info · Error · Success). */
const TONE_ICON: Record<ModalTone, string> = {
  caution: 'alert-triangle',
  information: 'alert-circle',
  error: 'alert-circle',
  success: 'checks',
};

/** Anchos de Figma (Modals/popups) por tipo y tamaño. */
const WIDTHS: Record<ModalVariant, Record<ModalSize, number>> = {
  form: { small: 390, medium: 700, large: 1054, xlarge: 1233 },
  confirm: { small: 358, medium: 400, large: 571, xlarge: 700 },
};

/** Por debajo de este ancho de ventana se usa siempre la versión Small (ejemplos Figma a 390). */
const COMPACT_QUERY = '(max-width: 480px)';

let nextId = 0;

/**
 * Modal / pop up Rama (Figma: Modals/popup · Header · Footer · Featured icon).
 * - `form` (Type=Modal): título a la izquierda, acción opcional en el encabezado (slot `[modal-header-action]`),
 *   contenido con scroll y footer (slot `[modal-footer]`). Anchos: small 390 · medium 700 · large 1054 · xlarge 1233.
 *   En small el footer apila los botones a todo el ancho; en los demás se alinea a la derecha.
 *   En móvil (≤ 480 px) pasa a Small y se muestra como hoja inferior a todo el ancho.
 * - `confirm` (Type=Popup): alerta/confirmación centrada con ícono destacado (`role="alertdialog"`).
 *   Anchos: small 358 · medium 400 · large 571 · xlarge 700. En small los botones van apilados a todo el ancho;
 *   en medium, large y xlarge van en fila, centrados y con su ancho natural.
 * El ancho nunca supera el de la ventana (16 px de margen), así 700 cabe en tablet 744.
 */
@Component({
  selector: 'rama-modal',
  imports: [RamaIcon, NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(document:keydown.escape)': 'open() && closeOnEscape() && close()' },
  template: `
    <!-- Cada slot se proyecta una sola vez y se reubica según la variante. -->
    <ng-template #bodySlot><ng-content /></ng-template>
    <ng-template #footerSlot><ng-content select="[modal-footer]" /></ng-template>
    <ng-template #actionSlot><ng-content select="[modal-header-action]" /></ng-template>
    @if (open()) {
      <div class="scrim" [class.sheet]="sheet()" (click)="closeOnBackdrop() && close()">
        <div #dialog [class]="'modal ' + variant() + ' size-' + effectiveSize()" [style.width]="width()"
          [attr.role]="variant() === 'confirm' ? 'alertdialog' : 'dialog'" aria-modal="true"
          [attr.aria-labelledby]="titleId" [attr.aria-describedby]="description() ? descId : null" tabindex="-1"
          (click)="$event.stopPropagation()" (keydown)="onKeydown($event)">
          @if (variant() === 'confirm') {
            <div class="close-row">
              <button type="button" class="close" data-dialog-close aria-label="Cerrar" (click)="close()"><rama-icon name="close-bold" [size]="closeSize()" /></button>
            </div>
            <div class="confirm-body">
              @if (featuredIcon(); as name) { <span [class]="'featured ' + tone()" aria-hidden="true"><rama-icon [name]="name" [size]="20" /></span> }
              <h2 class="title" [id]="titleId">{{ title() }}</h2>
              <div class="text" [id]="descId">@if (description()) { <p>{{ description() }}</p> }<ng-container [ngTemplateOutlet]="bodySlot" /></div>
            </div>
            <div class="confirm-footer"><ng-container [ngTemplateOutlet]="footerSlot" /></div>
          } @else {
            <header class="head">
              <div class="head-text">
                <h2 class="title" [id]="titleId">{{ title() }}</h2>
                @if (description()) { <p class="desc" [id]="descId">{{ description() }}</p> }
              </div>
              <div class="head-action"><ng-container [ngTemplateOutlet]="actionSlot" /></div>
              <button type="button" class="close" data-dialog-close aria-label="Cerrar" (click)="close()"><rama-icon name="close-bold" [size]="closeSize()" /></button>
            </header>
            <div class="content"><ng-container [ngTemplateOutlet]="bodySlot" /></div>
            <footer class="foot">
              @if (requiredNote()) {
                <p class="note"><rama-icon name="alert-circle" [size]="20" />{{ requiredNote() }}</p>
              }
              <div class="foot-actions"><ng-container [ngTemplateOutlet]="footerSlot" /></div>
            </footer>
          }
        </div>
      </div>
    }
  `,
  styles: `
    /* Fondo atenuado de Figma: rgba(29,29,29,.7) (sin token equivalente). Margen de 16 px con la ventana. */
    .scrim {
      position: fixed; inset: 0; z-index: 400; display: flex; align-items: center; justify-content: center;
      padding: var(--rama-space-16); background: rgba(29, 29, 29, .7);
    }
    .modal {
      position: relative; display: flex; flex-direction: column; max-width: 100%;
      max-height: calc(100vh - 2 * var(--rama-space-16)); max-height: calc(100dvh - 2 * var(--rama-space-16)); box-sizing: border-box;
      background: var(--rama-bg-default-white); color: var(--rama-text-default-black); font-family: var(--rama-font);
      /* Figma: borde border.default y radio 15px, sin sombra (el fondo atenuado da la separación). */
      border: var(--rama-border-width-thin) solid var(--rama-border-default); border-radius: 15px;
      outline: none; overflow: hidden;
    }
    .close-row { display: flex; justify-content: flex-end; }
    .close {
      display: flex; flex: none; padding: 0; border: 0; background: transparent; color: var(--rama-text-default-black);
      cursor: pointer; border-radius: var(--rama-radius-xs);
    }
    .close:hover { background: var(--rama-bg-subtle); }
    .close:focus-visible { outline: none; box-shadow: var(--rama-focus-ring); }
    .title { margin: 0; font-weight: var(--rama-weight-bold); }

    /* Form = Type=Modal. M/L/XL: 16px arriba y 24 a los lados; encabezado de 50px con el título centrado en vertical;
       cierre de 20px absoluto (13 arriba / 9 a la derecha); 16px entre encabezado, contenido y footer;
       footer a todo el ancho con borde superior, 8/24 de relleno, nota de obligatorios a la izquierda y botones a la derecha. */
    .head {
      position: relative; display: flex; align-items: center; gap: var(--rama-space-24);
      padding: var(--rama-space-16) var(--rama-space-24) 0; min-height: 66px; box-sizing: border-box;
    }
    .form .head .close { position: absolute; top: 13px; right: 9px; }
    /* Con acción en el encabezado se reserva el hueco del cierre para que no se monten (en Figma se solapan). */
    .form .head:has(.head-action > *) { padding-right: calc(var(--rama-space-24) + var(--rama-space-20)); }
    .head-action { display: flex; align-items: center; gap: var(--rama-space-8); }
    .head-action:empty { display: none; }
    .head-text { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 6px; }
    .form .title { font-size: 20px; line-height: normal; letter-spacing: -0.4px; }
    .desc { margin: 0; font-size: 14px; line-height: 20px; font-weight: var(--rama-weight-medium); color: var(--rama-text-muted); }
    /* Contenido con scroll; barra fina en border.default como el "Scroll bar (Light version)" de Figma. */
    .content {
      flex: 1; min-height: 0; overflow-y: auto; padding: var(--rama-space-16) var(--rama-space-24);
      scrollbar-width: thin; scrollbar-color: var(--rama-border-default) transparent;
    }
    .foot {
      display: flex; align-items: center; gap: var(--rama-space-16); padding: var(--rama-space-8) var(--rama-space-24);
      border-top: var(--rama-border-width-thin) solid var(--rama-border-default); background: var(--rama-bg-default-white);
    }
    .foot-actions { display: flex; gap: var(--rama-space-16); margin-left: auto; }
    .foot-actions:empty { display: none; }
    .note {
      flex: 1; display: flex; align-items: center; gap: var(--rama-space-4); margin: 0;
      font-size: 12px; line-height: 16px; font-weight: var(--rama-weight-bold); color: var(--rama-text-complementary);
    }
    /* Small (390): encabezado de 64px con relleno 16, acción y cierre de 24px en la fila del título separados 8px;
       contenido 8/16/24; footer con relleno 16, en columna con 12px y botón a todo el ancho; nota en muted. */
    .form.size-small .head { gap: var(--rama-space-8); padding: var(--rama-space-16); min-height: 64px; }
    .form.size-small .head .close { position: static; }
    .form.size-small .content { padding: var(--rama-space-8) var(--rama-space-16) var(--rama-space-24); }
    .form.size-small .foot { flex-direction: column; align-items: stretch; gap: var(--rama-space-12); padding: var(--rama-space-16); }
    .form.size-small .foot-actions { flex-direction: column; margin-left: 0; }
    .form.size-small .note { color: var(--rama-text-muted); }
    /* Móvil: el modal de formulario es una hoja inferior a todo el ancho con las esquinas superiores redondeadas. */
    .scrim.sheet { align-items: flex-end; padding: var(--rama-space-64) 0 0; }
    .scrim.sheet .form { max-height: 100%; border-bottom: 0; border-radius: 15px 15px 0 0; }

    /* Confirm = Type=Popup. Medium/Large/xLarge: relleno 12/15, separación 10; contenido con 8px entre ícono,
       título (24 bold) y texto (14/16 medium, muted); botones en fila, separados 32px con 16px arriba/abajo. */
    .confirm { gap: var(--rama-space-10); padding: var(--rama-space-12) 15px; }
    .confirm-body { display: flex; flex-direction: column; align-items: center; gap: var(--rama-space-8); text-align: center; }
    .confirm .title { font-size: 24px; line-height: normal; }
    .text { font-size: 14px; line-height: 16px; font-weight: var(--rama-weight-medium); color: var(--rama-text-muted); }
    .text p { margin: 0 0 14px; }
    .text :last-child { margin-bottom: 0; }
    /* Small (358): relleno 12/24/32, 12px entre cierre (24px) y contenido, 16px dentro del contenido, 28px hasta los botones. */
    .confirm.size-small { gap: 0; padding: var(--rama-space-12) var(--rama-space-24) var(--rama-space-32); }
    /* Fila del cierre de Figma: 2px arriba + 19px de alto; el ícono de 24 sobresale por abajo. */
    .confirm.size-small .close-row { height: 21px; padding-top: 2px; box-sizing: border-box; align-items: flex-start; }
    .confirm.size-small .confirm-body { gap: var(--rama-space-16); margin-top: var(--rama-space-12); }
    /* Featured icon: 36px (8 + 20 + 8), radio 8, sombra Light/Small; fondo on-fill y glifo claro por tono. */
    .featured { display: flex; padding: var(--rama-space-8); border-radius: var(--rama-radius-small); box-shadow: var(--rama-shadow-small); }
    .featured.caution { background: var(--rama-caution-on-fill); color: var(--rama-text-default-white); }
    .featured.information { background: var(--rama-information-on-fill); color: var(--rama-border-inset); }
    .featured.error { background: var(--rama-error-on-fill); color: var(--rama-border-inset); }
    .featured.success { background: var(--rama-success-on-fill); color: var(--rama-success-surface); }
    .confirm-footer { display: flex; justify-content: center; gap: var(--rama-space-32); padding: var(--rama-space-16) 0; }
    .confirm.size-small .confirm-footer { flex-direction: column; gap: var(--rama-space-12); padding: 0; margin-top: 28px; }
    :host ::ng-deep .confirm.size-small .confirm-footer > rama-button > button { width: 100%; }
    /* Botones del footer del formulario: 144×56, 14/16 semibold (Figma Footer). */
    :host ::ng-deep .form .foot-actions .btn { min-width: 144px; height: 56px; font-size: 14px; line-height: 16px; font-weight: var(--rama-weight-semibold); }
    :host ::ng-deep .form.size-small .foot-actions > div { flex-direction: column; }
    :host ::ng-deep .form.size-small .foot-actions rama-button > button { width: 100%; }
  `,
})
export class RamaModal {
  readonly open = model(false);
  readonly variant = input<ModalVariant>('form');
  readonly size = input<ModalSize>('large');
  readonly title = input('');
  readonly description = input<string>();
  /** Nota al inicio del footer (Figma: "Los campos señalados son obligatorios*."). */
  readonly requiredNote = input<string>();
  /** Ícono destacado del pop up. Sin valor usa el del tono; `null` lo oculta. */
  readonly icon = input<string | null | undefined>(undefined);
  readonly tone = input<ModalTone>('caution');
  readonly closeOnBackdrop = input(true);
  readonly closeOnEscape = input(true);
  readonly closed = output<void>();

  protected readonly titleId = `rama-modal-title-${nextId}`;
  protected readonly descId = `rama-modal-desc-${nextId++}`;
  private readonly dialog = viewChild<ElementRef<HTMLElement>>('dialog');
  private readonly focus = new DialogFocus();
  private wasOpen = false;

  /** Ventana de móvil: fuerza la versión Small (y la hoja inferior en el formulario). */
  private readonly compact = signal(false);
  readonly effectiveSize = computed<ModalSize>(() => (this.compact() ? 'small' : this.size()));
  protected readonly sheet = computed(() => this.compact() && this.variant() === 'form');
  protected readonly closeSize = computed(() => (this.effectiveSize() === 'small' ? 24 : 20));
  protected readonly featuredIcon = computed(() => {
    const icon = this.icon();
    return icon === null ? null : icon || TONE_ICON[this.tone()];
  });

  readonly width = computed(() => (this.sheet() ? '100%' : WIDTHS[this.variant()][this.effectiveSize()] + 'px'));

  constructor() {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mq = window.matchMedia(COMPACT_QUERY);
      const sync = () => this.compact.set(mq.matches);
      sync();
      mq.addEventListener('change', sync);
      inject(DestroyRef).onDestroy(() => mq.removeEventListener('change', sync));
    }
    effect(() => {
      const el = this.dialog()?.nativeElement;
      if (this.open() && el && !this.wasOpen) { this.wasOpen = true; this.focus.activate(el); }
      if (!this.open() && this.wasOpen) { this.wasOpen = false; this.focus.restore(); }
    });
  }

  onKeydown(event: KeyboardEvent) {
    const el = this.dialog()?.nativeElement;
    if (el) this.focus.trap(event, el);
  }

  close() {
    this.open.set(false);
    this.closed.emit();
  }
}
