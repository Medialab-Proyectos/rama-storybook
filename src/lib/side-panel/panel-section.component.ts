import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { RamaIcon } from '../icon/icon.component';

let nextId = 0;

/** Figma "Component 188" (Tipo de contenido): Stroke/Content, Outline/Content y Acordeon Content. */
export type PanelSectionType = 'stroke' | 'outline' | 'accordion';

/**
 * Bloque de contenido del panel lateral.
 * - `stroke`: título 14 Bold `text-subtle` + caja con borde `border-default`, radio 6, relleno 24/16, separación 10.
 * - `outline`: encabezado "Clave: valor" (14 Semibold, clave `text-muted`, valor `text-default-black`) sin borde, separación 10.
 * - `accordion`: caja con borde, relleno 24/16, separación 16; cabecera botón (título + contador 11 Regular)
 *   con chevron 24 y `aria-expanded`; los ítems proyectados se separan con línea 1px `border-default` y 10px.
 */
@Component({
  selector: 'rama-panel-section',
  imports: [RamaIcon, NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': "'t-' + type()" },
  template: `
    <!-- Un único <ng-content>: Angular solo proyecta una vez, así que cada tipo lo reutiliza con ngTemplateOutlet. -->
    <ng-template #items><ng-content /></ng-template>
    @switch (type()) {
      @case ('accordion') {
        <div class="box acc" [class.collapsed]="!expanded()">
          <h3 class="acc-h">
            <button type="button" class="acc-trigger" [id]="id + '-btn'" [attr.aria-expanded]="expanded()" [attr.aria-controls]="id + '-panel'"
              [disabled]="disabled()" (click)="toggle()">
              <span class="acc-title">{{ title() }}@if (counter()) {<span class="counter">{{ counter() }}</span>}</span>
              <rama-icon class="chev" name="chevron-up" [size]="24" />
            </button>
          </h3>
          <div class="acc-body items" role="region" [id]="id + '-panel'" [attr.aria-labelledby]="id + '-btn'" [hidden]="!expanded()">
            <ng-container [ngTemplateOutlet]="items" />
          </div>
        </div>
      }
      @case ('outline') {
        @if (title()) {
          <p class="kv">{{ title() }}@if (value()) {<span class="kv-value">{{ value() }}</span>}</p>
        }
        <div class="items-plain"><ng-container [ngTemplateOutlet]="items" /></div>
      }
      @default {
        @if (title()) { <p class="sec-title">{{ title() }}</p> }
        <div class="box stroke"><ng-container [ngTemplateOutlet]="items" /></div>
      }
    }
  `,
  styles: `
    :host { display: flex; flex-direction: column; gap: var(--rama-space-8); min-width: 0; font-family: var(--rama-font); }
    :host(.t-outline) { gap: var(--rama-space-10); }

    .sec-title { margin: 0; font-size: 14px; line-height: 20px; font-weight: var(--rama-weight-bold); color: var(--rama-text-subtle); }
    .kv { margin: 0; font-size: 14px; line-height: 16px; font-weight: var(--rama-weight-semibold); color: var(--rama-text-muted); }
    .kv-value { margin-left: var(--rama-space-4); color: var(--rama-text-default-black); }

    /* Radio 6 = spacing-scale-08 en Figma (no hay token de radio de 6px). */
    .box { display: flex; flex-direction: column; gap: var(--rama-space-10); padding: var(--rama-space-24) var(--rama-space-16);
      border: var(--rama-border-width-thin) solid var(--rama-border-default); border-radius: 6px; background: var(--rama-bg-default-white); }
    .items-plain { display: flex; flex-direction: column; gap: var(--rama-space-10); }

    .acc { gap: var(--rama-space-16); }
    .acc.collapsed { gap: 0; }
    .acc-h { margin: 0; font: inherit; }
    .acc-trigger { display: flex; align-items: center; justify-content: space-between; gap: var(--rama-space-8); width: 100%; min-height: 24px;
      padding: 0; border: 0; background: transparent; color: var(--rama-text-default-black); font: inherit; text-align: left; cursor: pointer;
      border-radius: var(--rama-radius-xs); transition: background-color .15s, box-shadow .15s; }
    /* Completado con tokens (Figma no define hover/focus/disabled del acordeón). */
    .acc-trigger:hover { background: var(--rama-bg-subtle); }
    .acc-trigger:focus-visible { outline: none; box-shadow: var(--rama-focus-ring); }
    .acc-trigger:disabled { cursor: not-allowed; color: var(--rama-text-disabled); background: transparent; }
    .acc-trigger:disabled .acc-title, .acc-trigger:disabled .counter { color: var(--rama-text-disabled); }
    .acc-title { font-size: 14px; line-height: 20px; font-weight: var(--rama-weight-bold); color: var(--rama-text-subtle); }
    .counter { margin-left: var(--rama-space-4); font-size: 11px; line-height: 20px; font-weight: var(--rama-weight-regular); }
    .chev { flex: none; transition: transform .2s; }
    .collapsed .chev { transform: rotate(180deg); }
    @media (prefers-reduced-motion: reduce) { .chev { transition: none; } }

    .items { display: flex; flex-direction: column; gap: var(--rama-space-10); }
    .items[hidden] { display: none; }
    /* Separador entre ítems del acordeón: 1px border-default (Figma rect #EAECF0) con 10px a cada lado. */
    :host ::ng-deep .acc-body > * + * { padding-top: var(--rama-space-10); border-top: var(--rama-border-width-thin) solid var(--rama-border-default); }
  `,
})
export class RamaPanelSection {
  readonly type = input<PanelSectionType>('stroke');
  /** Stroke: título de la sección. Outline: clave del encabezado ("Estado:"). Acordeón: título de la cabecera. */
  readonly title = input('');
  /** Outline: valor del encabezado ("Devuelto por sala"). */
  readonly value = input<string>();
  /** Acordeón: contador junto al título ("(1/3 documentos cargados)"). */
  readonly counter = input<string>();
  readonly expanded = model(true);
  readonly disabled = input(false);

  protected readonly id = `rama-panel-section-${nextId++}`;

  toggle() {
    this.expanded.update(v => !v);
  }
}
