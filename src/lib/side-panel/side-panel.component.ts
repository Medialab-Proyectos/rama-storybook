import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, computed, effect, inject, input, model, output, signal, untracked, viewChild } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { RamaIcon } from '../icon/icon.component';
import { DialogFocus } from '../modal/dialog-focus';

let nextId = 0;

/** Tamaños del Figma "Component 185": Big 458×860, Small 458×469. `full` ocupa todo el alto del viewport. */
export type SidePanelSize = 'big' | 'small' | 'full';
/**
 * `overlay`: diálogo modal con fondo (Esc, foco atrapado).
 * `inline`: región complementaria estática (documentación/layouts).
 * `docked`: panel "sin fondo" pegado a la derecha, a todo el alto. No bloquea la página ni atrapa el foco
 *   (role="dialog" aria-modal="false"); Esc lo cierra y el foco vuelve al elemento que lo abrió. No mueve la página:
 *   emite `dockedWidth` para que la página reserve el espacio (ver historia "Junto al dashboard (sin fondo)").
 *   Por debajo de 768px se convierte en hoja a pantalla completa.
 */
export type SidePanelMode = 'overlay' | 'inline' | 'docked';
/** Anchos del patrón REVO: S detalle de solo lectura, M formulario de una entidad, L entrega de turno / bandejas. */
export type SidePanelWidth = 's' | 'm' | 'l';

/** Sin token de tamaño en Rama: S = 458 (ancho Figma "Component 185"), M = 720, L = 960 px. */
const PANEL_WIDTHS: Record<SidePanelWidth, number> = { s: 458, m: 720, l: 960 };
/** Desde este ancho de viewport la página reserva el espacio del panel docked; por debajo, el panel se superpone. */
const DOCK_RESERVE_MIN = 1280;

/**
 * Panel lateral Rama (Figma "Panel lateral": Panel/Header, Footer, Component 185).
 * - Encabezado: "Simple" (solo cierre 32px) si no hay `title`; "with text" con título 20 Bold,
 *   descripción 14/20 y separador `border-default`.
 * - Barra de navegación opcional (apagada por defecto): "← {backLabel}" (`back`), ‹ › (`prev`/`next`, con
 *   `hasPrev`/`hasNext`) y ⤢ Ampliar/Reducir (`expandable` + `expanded`). Solo aparece si se activa alguna.
 * - Cuerpo con scroll vertical (barra 16px con pulgar `border-default`, radio 8) y separación 16 entre bloques.
 *   Un `<hr>` proyectado en el cuerpo es el "Content Divider" a sangre (border-inset).
 * - Footer (slot `[panel-footer]`): borde superior 2px, relleno 16/32, separación 24, botones a lo ancho.
 */
@Component({
  selector: 'rama-side-panel',
  imports: [RamaIcon, NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(document:keydown.escape)': 'onEscape($event)', '[class.inline]': "mode() === 'inline'" },
  template: `
    <ng-template #content>
      <header class="head" [class.simple]="!title()">
        @if (hasToolbar()) {
          <div class="toolbar">
            @if (backLabel()) {
              <button type="button" class="back" [attr.aria-label]="'Volver a ' + backLabel()" (click)="back.emit()">
                <rama-icon class="back-icon" name="arrow-left" [size]="20" />
                <span class="back-label">{{ backLabel() }}</span>
              </button>
            }
            <span class="tools">
              @if (showPager()) {
                <span class="pager" role="group" [attr.aria-label]="pagerGroupLabel()">
                  <button type="button" class="icon-btn" [disabled]="!hasPrev()" [attr.aria-label]="prevLabel()" (click)="hasPrev() && prev.emit()">
                    <rama-icon name="back" [size]="24" />
                  </button>
                  @if (pagerText()) { <span class="pager-text" aria-live="polite">{{ pagerText() }}</span> }
                  <button type="button" class="icon-btn" [disabled]="!hasNext()" [attr.aria-label]="nextLabel()" (click)="hasNext() && next.emit()">
                    <rama-icon name="chevron-right" [size]="24" />
                  </button>
                </span>
              }
              @if (expandable()) {
                <button type="button" class="icon-btn expand" [class.on]="expanded()" [attr.aria-pressed]="expanded()"
                  [attr.aria-label]="expanded() ? collapseLabel() : expandLabel()" [attr.title]="expanded() ? collapseLabel() : expandLabel()"
                  (click)="toggleExpanded()">
                  <rama-icon [name]="expanded() ? 'minimize-2' : 'maximize-2'" [size]="24" />
                </button>
              }
              @if (closable()) {
                <button type="button" class="close" data-dialog-close [attr.aria-label]="closeLabel()" (click)="close()"><rama-icon name="x" [size]="32" /></button>
              }
            </span>
          </div>
        } @else if (closable()) {
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
        <aside #panel class="panel" [class]="panelClass()" [style.width.px]="styleWidth()" role="complementary"
          [attr.aria-labelledby]="title() ? titleId : null" [attr.aria-label]="title() ? null : ariaLabel()">
          <ng-container [ngTemplateOutlet]="content" />
        </aside>
      }
    } @else if (mode() === 'docked') {
      @if (open()) {
        <aside #panel class="panel docked" [class]="panelClass() + ' docked'" [style.width.px]="styleWidth()" role="dialog" aria-modal="false"
          [attr.aria-labelledby]="title() ? titleId : null" [attr.aria-label]="title() ? null : ariaLabel()" tabindex="-1">
          <ng-container [ngTemplateOutlet]="content" />
        </aside>
      }
    } @else {
      <div class="scrim" [class.open]="open()" (click)="closeOnBackdrop() && close()">
        @if (open()) {
          <aside #panel class="panel" [class]="panelClass()" [style.width.px]="styleWidth()" role="dialog" aria-modal="true"
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
    /* Ampliado: todo el ancho disponible (overlay deja el margen de 16; inline, el del contenedor). */
    .panel.expanded { width: calc(100vw - 2 * var(--rama-space-16)); }
    .scrim .panel.size-full.expanded { width: 100vw; }
    :host(.inline) .panel.expanded { width: 100%; }

    /* Docked ("sin fondo"): pegado a la derecha, a todo el alto, sin scrim; la página sigue activa debajo/al lado. */
    .panel.docked { position: fixed; z-index: 400; top: 0; right: 0; bottom: 0; height: auto; max-width: 100vw;
      border-width: 0 0 0 var(--rama-border-width-thin); border-radius: 0; animation: slide-in-right .2s ease-out; }
    .panel.docked.left { right: auto; left: 0; border-width: 0 var(--rama-border-width-thin) 0 0; animation-name: slide-in-left; }
    .panel.docked.expanded { width: 100vw; border-width: 0; }
    /* Móvil / tablet vertical: hoja a pantalla completa que sube desde abajo. */
    @media (max-width: 767.98px) {
      .panel.docked, .panel.docked.left { left: 0; right: 0; width: 100vw !important; border-width: 0; animation-name: sheet-up; }
    }

    @keyframes slide-in-right { from { transform: translateX(calc(100% + var(--rama-space-16))); } }
    @keyframes slide-in-left { from { transform: translateX(calc(-100% - var(--rama-space-16))); } }
    @keyframes sheet-up { from { transform: translateY(100%); } }
    @media (prefers-reduced-motion: reduce) { .scrim .panel, .panel.docked { animation: none; } .scrim { transition: none; } }

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

    /* Barra de navegación (no está en Figma: completada con tokens). Volver a la izquierda; ‹ ›, ⤢ y ✕ a la derecha. */
    .toolbar { align-self: stretch; display: flex; align-items: center; gap: var(--rama-space-8); min-height: 32px; }
    .tools { margin-left: auto; display: inline-flex; align-items: center; gap: var(--rama-space-8); }
    .pager { display: inline-flex; align-items: center; gap: var(--rama-space-4); }
    .pager-text { font-size: 14px; line-height: 20px; color: var(--rama-text-subtle); white-space: nowrap; font-variant-numeric: tabular-nums; }
    .icon-btn { display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; padding: 0; border: 0; background: transparent;
      color: var(--rama-text-default-black); cursor: pointer; border-radius: var(--rama-radius-xs); transition: background-color .15s; }
    .icon-btn:hover:not(:disabled) { background: var(--rama-bg-subtle); }
    .icon-btn:focus-visible { outline: none; box-shadow: var(--rama-focus-ring); }
    .icon-btn:disabled { cursor: not-allowed; color: var(--rama-text-disabled); }
    /* Íconos de Rama (Figma 1.3 Iconos · Essential): maximize-2 para ampliar, minimize-2 para reducir; activo con fondo bg-inset. */
    .expand.on { background: var(--rama-bg-inset); }
    .back { min-width: 0; display: inline-flex; align-items: center; gap: var(--rama-space-4); padding: var(--rama-space-4) var(--rama-space-8) var(--rama-space-4) 0;
      border: 0; background: transparent; cursor: pointer; border-radius: var(--rama-radius-xs); color: var(--rama-text-primary);
      font: var(--rama-weight-bold) 14px/20px var(--rama-font); transition: background-color .15s; }
    .back:hover { background: var(--rama-bg-subtle); }
    .back:focus-visible { outline: none; box-shadow: var(--rama-focus-ring); }
    .back-label { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

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
  /** Ancho en px. Si se define `panelWidth`, el preset gana. */
  readonly width = input(458);
  /** Preset de ancho: `s` 458, `m` 720, `l` 960 px. */
  readonly panelWidth = input<SidePanelWidth>();
  readonly closeOnBackdrop = input(true);

  /** Muestra el botón ⤢ Ampliar/Reducir; `expanded` lleva el panel a todo el ancho disponible. */
  readonly expandable = input(false);
  readonly expanded = model(false);
  readonly expandLabel = input('Ampliar panel');
  readonly collapseLabel = input('Reducir panel');

  /** Nivel 2: nombre del listado al que vuelve "← {backLabel}" (emite `back`). Sin valor, no se muestra. */
  readonly backLabel = input<string>();
  /** Muestra ‹ › para recorrer la lista filtrada (emite `prev`/`next`; deshabilitados según `hasPrev`/`hasNext`). */
  readonly showPager = input(false);
  readonly hasPrev = input(true);
  readonly hasNext = input(true);
  readonly prevLabel = input('Registro anterior');
  readonly nextLabel = input('Registro siguiente');
  /** Texto opcional entre ‹ y ›, p. ej. "2 de 5". */
  readonly pagerText = input<string>();
  readonly pagerGroupLabel = input('Navegar entre registros');

  /** Docked: elemento al que vuelve el foco al cerrar (p. ej. la fila). Sin valor, vuelve al que estaba activo al abrir. */
  readonly returnFocus = input<HTMLElement | null>();

  readonly closed = output<void>();
  readonly back = output<void>();
  readonly prev = output<void>();
  readonly next = output<void>();
  /**
   * Solo `docked`: ancho en px que la página debe reservar (p. ej. `margin-right`) para no quedar debajo del panel.
   * 0 si está cerrado o si el viewport mide menos de 1280px (ahí el panel se superpone). Al ampliar se mantiene
   * el ancho normal para que la página no se reacomode debajo.
   */
  readonly dockedWidth = output<number>();

  protected readonly titleId = `rama-panel-title-${nextId++}`;
  protected readonly hasToolbar = computed(() => !!this.backLabel() || this.showPager() || this.expandable());
  protected readonly baseWidth = computed(() => { const p = this.panelWidth(); return p ? PANEL_WIDTHS[p] : this.width(); });
  protected readonly styleWidth = computed(() => (this.expanded() ? null : this.baseWidth()));
  protected readonly panelClass = computed(() =>
    `panel size-${this.size()}${this.side() === 'left' ? ' left' : ''}${this.expanded() ? ' expanded' : ''}`);
  private readonly panel = viewChild<ElementRef<HTMLElement>>('panel');
  private readonly focus = new DialogFocus();
  private wasOpen = false;
  private previous: HTMLElement | null = null;

  private readonly wide = signal(typeof matchMedia === 'function' && matchMedia(`(min-width: ${DOCK_RESERVE_MIN}px)`).matches);
  private readonly reserve = computed(() => (this.mode() === 'docked' && this.open() && this.wide() ? this.baseWidth() : 0));
  private lastReserve = 0;

  constructor() {
    effect(() => {
      const mode = this.mode();
      if (mode === 'inline') return;
      const el = this.panel()?.nativeElement;
      const open = this.open();
      untracked(() => {
        if (open && el && !this.wasOpen) {
          this.wasOpen = true;
          if (mode === 'docked') { this.previous = document.activeElement as HTMLElement | null; el.focus(); }
          else this.focus.activate(el);
        }
        if (!open && this.wasOpen) {
          this.wasOpen = false;
          if (mode === 'docked') { (this.returnFocus() ?? this.previous)?.focus?.(); this.previous = null; }
          else this.focus.restore();
        }
      });
    });

    effect(() => {
      const w = this.reserve();
      if (w !== this.lastReserve) { this.lastReserve = w; this.dockedWidth.emit(w); }
    });

    if (typeof matchMedia === 'function') {
      const mq = matchMedia(`(min-width: ${DOCK_RESERVE_MIN}px)`);
      const onChange = (e: MediaQueryListEvent) => this.wide.set(e.matches);
      mq.addEventListener('change', onChange);
      inject(DestroyRef).onDestroy(() => mq.removeEventListener('change', onChange));
    }
  }

  onEscape(event?: Event) {
    if (!this.open() || this.mode() === 'inline' || event?.defaultPrevented) return;
    this.close();
  }

  onKeydown(event: KeyboardEvent) {
    const el = this.panel()?.nativeElement;
    if (el) this.focus.trap(event, el);
  }

  toggleExpanded() {
    this.expanded.update(v => !v);
  }

  close() {
    this.open.set(false);
    this.closed.emit();
  }
}
