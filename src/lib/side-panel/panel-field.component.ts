import { ChangeDetectionStrategy, Component, input } from '@angular/core';

let nextId = 0;

/**
 * Campo de solo lectura del panel lateral (Figma: filas "Component 39/42/46" del Tipo de contenido e Input "Desibled").
 * Etiqueta 12 Semibold `text-muted` sobre una caja `neutral-200` (radio 6, relleno 10/12) con el valor 12 Semibold
 * `text-default-black`. Slot opcional `[field-check]` para un `rama-checkbox` a la izquierda (24px, separación 8,
 * alineado con la caja). `maxHeight` activa el scroll interno (Outline/Content, pulgar `text-subtle`).
 * `size="medium"` usa el valor 14 Medium/20 (Figma: "NO", "Opción 1").
 */
@Component({
  selector: 'rama-panel-field',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class.medium]': "size() === 'medium'" },
  template: `
    <div class="check"><ng-content select="[field-check]" /></div>
    <div class="col">
      <span class="label" [id]="id">{{ label() }}</span>
      <div class="value" [class.scroll]="!!maxHeight()" [style.max-height.px]="maxHeight() ?? null" role="group" [attr.aria-labelledby]="id"
        [attr.tabindex]="maxHeight() ? 0 : null"><ng-content /></div>
    </div>
  `,
  styles: `
    :host { display: flex; align-items: flex-start; gap: var(--rama-space-8); min-width: 0; font-family: var(--rama-font); }
    .check:empty { display: none; }
    /* El checkbox se centra con la caja: 16 de la etiqueta + 4 de separación. */
    .check { flex: none; display: flex; align-items: center; align-self: stretch; padding-top: var(--rama-space-20); }
    /* El texto del checkbox se oculta visualmente (sirve como nombre accesible) sin sumar ancho. */
    .check ::ng-deep rama-checkbox .text { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
    .col { flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; gap: var(--rama-space-4); }
    .label { font-size: 12px; line-height: 16px; font-weight: var(--rama-weight-semibold); color: var(--rama-text-muted); }
    .value { box-sizing: border-box; min-height: 40px; display: flex; align-items: center; padding: var(--rama-space-10) var(--rama-space-12);
      border-radius: 6px; background: var(--rama-neutral-200); color: var(--rama-text-default-black);
      font-size: 12px; line-height: 16px; font-weight: var(--rama-weight-semibold); overflow-wrap: anywhere; }
    :host(.medium) .value { font-size: 14px; line-height: 20px; font-weight: var(--rama-weight-medium); }
    .value.scroll { display: block; overflow-y: auto; scrollbar-width: thin; scrollbar-color: var(--rama-text-subtle) transparent; }
    .value.scroll:focus-visible { outline: none; box-shadow: var(--rama-focus-ring); }
    .value.scroll::-webkit-scrollbar { width: var(--rama-space-16); }
    .value.scroll::-webkit-scrollbar-thumb { background: var(--rama-text-subtle); border: var(--rama-border-width-heavy) solid transparent;
      background-clip: padding-box; border-radius: var(--rama-radius-small); }
  `,
})
export class RamaPanelField {
  readonly label = input('');
  readonly size = input<'small' | 'medium'>('small');
  readonly maxHeight = input<number>();
  protected readonly id = `rama-panel-field-${nextId++}`;
}
