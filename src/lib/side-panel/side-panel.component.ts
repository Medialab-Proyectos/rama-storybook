import { ChangeDetectionStrategy, Component, ElementRef, computed, effect, input, model, output, viewChild } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { RamaIcon } from '../icon/icon.component';
import { DialogFocus } from '../modal/dialog-focus';

let nextId = 0;

/** Tamaños del Figma "Component 185": Big 458×860, Small 458×469. `full` ocupa todo el alto del viewport. */
export type SidePanelSize = 'big' | 'small' | 'full';
/** `overlay`: diálogo modal con fondo (Esc, foco atrapado). `inline`: región complementaria estática (documentación/layouts). */
export type SidePanelMode = 'overlay' | 'inline';

/**
 * Panel lateral Rama (Figma "Panel lateral": Panel/Header, Footer, Component 185).
 * - Encabezado: "Simple" (solo cierre 32px) si no hay `title`; "with text" con título 20 Bold,
 *   descripción 14/20 y separador `border-default`.
 * - Cuerpo con scroll vertical (barra 16px con pulgar `border-default`, radio 8) y separación 16 entre bloques.
 *   Un `<hr>` proyectado en el cuerpo es el "Content Divider" a sangre (border-inset).
 * - Footer (slot `[panel-footer]`): borde superior 2px, relleno 16/32, separación 24, botones a lo ancho.
 */
@Component({
  selector: 'rama-side-panel',
  imports: [RamaIcon, NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(document:keydown.escape)': 'onEscape()', '[class.inline]': "mode() === 'inline'" },
  template: `
    <ng-template #content>
      <header class="head" [class.simple]="!title()">
        @if (closable()) {
          <button type="button" class="close" data-dialog-close [attr.aria-label]="closeLabel()" (click)="close()"><rama-icon name="x" [size]="32" /></button>
        }
        @if (title()) {
          <div class="head-text">
            <h2 class="title" [id]="titleId">{{ title() }}</h2>
            @if (description()) { <p class="desc">{{ description() }}</p> }
          </div>
        }
      </header>
      <div class="body"><ng-content /></div>
      <footer class="foot"><ng-content select="[panel-footer]" /></footer>
    </ng-template>

    @if (mode() === 'inline') {
      @if (open()) {
        <aside #panel class="panel" [class]="panelClass()" [style.width.px]="width()" role="complementary"
          [attr.aria-labelledby]="title() ? titleId : null" [attr.aria-label]="title() ? null : ariaLabel()">
          <ng-container [ngTemplateOutlet]="content" />
        </aside>
      }
    } @else {
      <div class="scrim" [class.open]="open()" (click)="closeOnBackdrop() && close()">
        @if (open()) {
          <aside #panel class="panel" [class]="panelClass()" [style.width.px]="width()" role="dialog" aria-modal="true"
            [attr.aria-labelledby]="title() ? titleId : null" [attr.aria-label]="title() ? null : ariaLabel()"
            tabindex="-1" (click)="$event.stopPropagation()" (keydown)="onKeydown($event)">
            <ng-container [ngTemplateOutlet]="content" />
          </aside>
        }
      </div>
    }
  `,
  styles: `
    :host { display: contents; }
    :host(.inline) { display: block; min-width: 0; max-width: 100%; }
    .scrim { position: fixed; inset: 0; z-index: 400; background: var(--rama-black-20); visibility: hidden; opacity: 0; transition: opacity .2s, visibility .2s; }
    .scrim.open { visibility: visible; opacity: 1; }

    /* Figma Component 185: fondo blanco, borde 1px border-default, radio 10 (sin token: entre small 8 y medium 12),
       sombra 2X-Large. Big/Small flotan a 16px del borde; full va pegado al borde (sin radio). */
    .panel {
      box-sizing: border-box; max-width: calc(100vw - 2 * var(--rama-space-16)); display: flex; flex-direction: column; overflow: hidden;
      background: var(--rama-bg-default-white); color: var(--rama-text-default-black); font-family: var(--rama-font);
      border: var(--rama-border-width-thin) solid var(--rama-border-default); border-radius: 10px;
      box-shadow: var(--rama-shadow-2x-large); outline: none;
    }
    .scrim .panel { position: absolute; top: var(--rama-space-16); right: var(--rama-space-16); max-height: calc(100dvh - 2 * var(--rama-space-16));
      animation: slide-in-right .2s ease-out; }
    .scrim .panel.left { right: auto; left: var(--rama-space-16); animation-name: slide-in-left; }
    .panel.size-big { height: 860px; }
    .panel.size-small { height: 469px; }
    .scrim .panel.size-full { top: 0; right: 0; bottom: 0; height: auto; max-height: none; max-width: 100vw; border-radius: 0; }
    .scrim .panel.size-full.left { right: auto; left: 0; }
    :host(.inline) .panel { max-width: 100%; }
    :host(.inline) .panel.size-full { height: 100%; }
    @keyframes slide-in-right { from { transform: translateX(calc(100% + var(--rama-space-16))); } }
    @keyframes slide-in-left { from { transform: translateX(calc(-100% - var(--rama-space-16))); } }
    @media (prefers-reduced-motion: reduce) { .scrim .panel { animation: none; } .scrim { transition: none; } }

    /* Panel/Header: relleno superior 16, cierre 32 alineado a la derecha, separación 8. */
    .head { flex: none; display: flex; flex-direction: column; align-items: flex-end; gap: var(--rama-space-8); padding: var(--rama-space-16) var(--rama-space-16) 0; }
    .close { display: flex; padding: 0; border: 0; background: transparent; color: var(--rama-text-default-black); cursor: pointer; border-radius: var(--rama-radius-xs);
      transition: background-color .15s; }
    .close:hover { background: var(--rama-bg-subtle); }
    .close:focus-visible { outline: none; box-shadow: var(--rama-focus-ring); }
    .head-text { align-self: stretch; display: flex; flex-direction: column; gap: var(--rama-space-8); padding-bottom: var(--rama-space-8);
      border-bottom: var(--rama-border-width-thin) solid var(--rama-border-default); }
    .title { margin: 0; font-size: 20px; line-height: normal; font-weight: var(--rama-weight-bold); letter-spacing: -0.4px; color: var(--rama-text-default-black); }
    .desc { margin: 0; font-size: 14px; line-height: 20px; font-weight: var(--rama-weight-regular); color: var(--rama-text-subtle); }

    /* Cuerpo: separación 16 entre bloques (Component 185 gap 16) y barra de scroll Figma (16px, pulgar border-default radio 8). */
    .body { flex: 1 1 auto; min-height: 0; overflow-y: auto; overflow-x: hidden; display: flex; flex-direction: column; gap: var(--rama-space-16);
      padding: var(--rama-space-16);
      scrollbar-width: thin; scrollbar-color: var(--rama-border-default) transparent; }
    .body::-webkit-scrollbar { width: var(--rama-space-16); }
    .body::-webkit-scrollbar-track { background: transparent; }
    .body::-webkit-scrollbar-thumb { background: var(--rama-border-default); border: var(--rama-border-width-heavy) solid transparent;
      background-clip: padding-box; border-radius: var(--rama-radius-small); }
    .body::-webkit-scrollbar-thumb:hover { background-color: var(--rama-border-inset); }
    /* Content Divider (Light version): línea 1px border-inset a sangre del panel. */
    :host ::ng-deep .body > hr { flex: none; align-self: stretch; height: 0; margin: 0 calc(-1 * var(--rama-space-16));
      border: 0; border-top: var(--rama-border-width-thin) solid var(--rama-border-inset); }

    /* Footer "Open": borde 2px border-default, relleno 16/32, separación 24, botones flex 1. */
    .foot { flex: none; display: flex; gap: var(--rama-space-24); padding: var(--rama-space-16) var(--rama-space-32);
      background: var(--rama-bg-default-white); border-top: var(--rama-border-width-medium) solid var(--rama-border-default); }
    .foot:empty { display: none; }
    :host ::ng-deep .foot > * { flex: 1 1 0; min-width: 0; }
    :host ::ng-deep .foot > rama-button > button { width: 100%; }
    @media (max-width: 480px) { .foot { gap: var(--rama-space-16); padding: var(--rama-space-16); } }
  `,
})
export class RamaSidePanel {
  readonly open = model(false);
  readonly title = input('');
  readonly description = input<string>();
  /** Nombre accesible cuando el encabezado es "Simple" (sin título). */
  readonly ariaLabel = input('Panel lateral');
  readonly closeLabel = input('Cerrar panel');
  readonly closable = input(true);
  readonly side = input<'right' | 'left'>('right');
  readonly size = input<SidePanelSize>('big');
  readonly mode = input<SidePanelMode>('overlay');
  readonly width = input(458);
  readonly closeOnBackdrop = input(true);
  readonly closed = output<void>();

  protected readonly titleId = `rama-panel-title-${nextId++}`;
  protected readonly panelClass = computed(() => `panel size-${this.size()}${this.side() === 'left' ? ' left' : ''}`);
  private readonly panel = viewChild<ElementRef<HTMLElement>>('panel');
  private readonly focus = new DialogFocus();
  private wasOpen = false;

  constructor() {
    effect(() => {
      if (this.mode() === 'inline') return;
      const el = this.panel()?.nativeElement;
      if (this.open() && el && !this.wasOpen) { this.wasOpen = true; this.focus.activate(el); }
      if (!this.open() && this.wasOpen) { this.wasOpen = false; this.focus.restore(); }
    });
  }

  onEscape() {
    if (this.mode() === 'overlay' && this.open()) this.close();
  }

  onKeydown(event: KeyboardEvent) {
    const el = this.panel()?.nativeElement;
    if (el) this.focus.trap(event, el);
  }

  close() {
    this.open.set(false);
    this.closed.emit();
  }
}
