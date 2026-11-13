import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type PanelChipTone = 'purple' | 'yellow';

/**
 * Etiqueta de clasificación del panel lateral (Figma "Label": Default morado / amarillo).
 * 16 Semibold, relleno 4/8, radio 8. Morado: fondo `okr-purple` (exacto #DBCCFF), texto `purple-800`
 * (Figma #4A0094 sin token exacto). Amarillo: fondo `caution-surface`, texto `text-caution` (#4F4700 exacto).
 */
@Component({
  selector: 'rama-panel-chip',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': "'tone-' + tone()" },
  template: `<ng-content />`,
  styles: `
    :host { display: inline-flex; align-items: center; justify-content: center; box-sizing: border-box; min-height: 27px;
      padding: var(--rama-space-4) var(--rama-space-8); border-radius: var(--rama-radius-small);
      font: var(--rama-weight-semibold) 16px/normal var(--rama-font); white-space: nowrap; }
    :host(.tone-purple) { background: var(--rama-okr-purple); color: var(--rama-purple-800); }
    :host(.tone-yellow) { background: var(--rama-caution-surface); color: var(--rama-text-caution); }
  `,
})
export class RamaPanelChip {
  readonly tone = input<PanelChipTone>('purple');
}
