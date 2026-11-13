import { ChangeDetectionStrategy, Component, ElementRef, input, model, viewChildren } from '@angular/core';
import { RamaIcon } from '../icon/icon.component';

export interface TabItem { label: string; icon?: string; count?: number; dot?: boolean; disabled?: boolean; }
export type TabsVariant = 'primary' | 'secondary';

let nextId = 0;

/**
 * Tabs Rama (Figma: 10 Tabs). `primary` = "Tab principal" (pestañas con borde; estados Enable,
 * Hover, Pressed = seleccionada, Disabled); `secondary` = "Tabs secondary" (subrayado; Enable, Hover,
 * Pressed). Ambas admiten ícono, contador y punto opcionales. Teclado: flechas, Inicio y Fin.
 * El contenido proyectado se muestra dentro del tabpanel de la pestaña seleccionada.
 * Clases de host `is-hover` / `is-focus` fijan el estado de la segunda pestaña (solo docs).
 */
@Component({
  selector: 'rama-tabs',
  imports: [RamaIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="list" [class]="'list ' + variant()" role="tablist" [attr.aria-label]="ariaLabel()">
      @for (tab of tabs(); track $index; let i = $index) {
        <button #tabBtn type="button" role="tab" class="tab" [id]="uid + '-tab-' + i"
          [attr.aria-selected]="i === selected()" [attr.aria-controls]="uid + '-panel'"
          [attr.tabindex]="i === selected() ? 0 : -1" [disabled]="tab.disabled"
          [class.selected]="i === selected()" (click)="select(i)" (keydown)="onKey($event, i)">
          @if (tab.icon) { <rama-icon class="lead" [name]="tab.icon" [size]="20" /> }
          @if (variant() === 'primary' && tab.count !== undefined) { <span class="count">{{ tab.count }}</span> }
          <span class="label">{{ tab.label }}</span>
          @if (tab.dot) { <span class="dot" aria-hidden="true"></span> }
          @if (variant() === 'secondary' && tab.count !== undefined) { <span class="count">{{ tab.count }}</span> }
        </button>
      }
    </div>
    <div role="tabpanel" class="panel" [id]="uid + '-panel'" [attr.aria-labelledby]="uid + '-tab-' + selected()" tabindex="0">
      <ng-content />
    </div>
  `,
  styles: `
    :host { display: block; }
    .list { display: flex; }
    .tab { font-family: var(--rama-font); cursor: pointer; background: var(--rama-bg-default-white); }
    .tab:focus-visible { outline: none; box-shadow: var(--rama-focus-ring); }
    .tab:disabled { cursor: not-allowed; }
    .label { flex: 1 0 0; text-align: center; font-size: 14px; line-height: 16px; letter-spacing: 0; white-space: nowrap; }
    .panel:focus-visible { outline: none; box-shadow: var(--rama-focus-ring); }
    .panel:empty { display: none; }

    /* Ícono, contador y punto comunes (Figma ". Item Tab" / "Tab principal"). */
    .tab { gap: var(--rama-space-8); }
    .count {
      min-width: 16px; height: 16px; padding: var(--rama-border-width-thin) var(--rama-space-4); box-sizing: border-box;
      display: inline-flex; align-items: center; justify-content: center; flex: none;
      font-weight: var(--rama-weight-bold); font-size: 12px; line-height: 16px; letter-spacing: -0.24px;
    }
    /* Trail Dot: caja 14×14 con círculo de 6px. */
    .dot { width: 6px; height: 6px; margin: var(--rama-space-4); border-radius: var(--rama-radius-full); background: var(--rama-text-primary); flex: none; }

    /* Primary — Figma "Tab principal" (Enable / Hover / Pressed / Disabled). El borde de Figma es
       interior: se descuenta del padding para conservar 40px (con ícono) / 36px (solo texto). */
    .primary { gap: var(--rama-space-16); flex-wrap: wrap; }
    .primary .tab {
      display: inline-flex; align-items: center; min-width: 181px; box-sizing: border-box;
      padding: calc(var(--rama-space-10) - var(--rama-border-width-thin)) calc(var(--rama-space-12) - var(--rama-border-width-thin));
      border: var(--rama-border-width-thin) solid var(--rama-border-default);
      border-radius: var(--rama-radius-small); color: var(--rama-text-muted);
    }
    .primary .label { font-weight: var(--rama-weight-bold); }
    .primary .count { border-radius: var(--rama-radius-2xl); background: var(--rama-neutro-on-fill); color: var(--rama-text-muted); }
    .primary .tab:not(:disabled):not(.selected):hover, :host(.is-hover) .primary .tab:nth-child(2) { background: var(--rama-bg-inset); }
    .primary .tab:not(:disabled):not(.selected):hover .lead, :host(.is-hover) .primary .tab:nth-child(2) .lead { color: var(--rama-text-primary); }
    .primary .tab:not(:disabled):not(.selected):hover .count, :host(.is-hover) .primary .tab:nth-child(2) .count { background: var(--rama-primary-fill); color: var(--rama-text-default-white); }
    .primary .tab.selected { border-color: var(--rama-primary-700); color: var(--rama-primary-700); box-shadow: var(--rama-shadow-x-small); }
    .primary .tab.selected .count { background: var(--rama-information-surface); color: var(--rama-primary-700); }
    .primary .tab.selected .dot { background: var(--rama-primary-700); }
    .primary .tab:disabled { border-color: var(--rama-border-disabled); color: var(--rama-text-disabled); box-shadow: var(--rama-shadow-x-small); }
    .primary .tab:disabled .count { color: var(--rama-text-disabled); }
    .primary .tab:disabled .dot { background: var(--rama-text-disabled); }
    :host(.is-focus) .primary .tab:nth-child(2) { box-shadow: var(--rama-focus-ring); }

    /* Secondary — Figma ". Item Tab" / "Tabs secondary" (Enable / Hover / Pressed). Padding 12px;
       el subrayado (1px, 2px seleccionado) es interior en Figma: se descuenta del padding inferior. */
    .secondary .tab {
      display: inline-flex; align-items: center; width: 181px; box-sizing: border-box; border: 0;
      padding: var(--rama-space-12) var(--rama-space-12) calc(var(--rama-space-12) - var(--rama-border-width-thin));
      border-bottom: var(--rama-border-width-thin) solid var(--rama-border-default); color: var(--rama-text-muted);
    }
    .secondary .label { font-weight: var(--rama-weight-medium); }
    .secondary .count { border-radius: var(--rama-radius-xs); background: var(--rama-primary-fill); color: var(--rama-text-default-white); }
    .secondary .tab:not(:disabled):not(.selected):hover, :host(.is-hover) .secondary .tab:nth-child(2) { background: var(--rama-bg-inset); }
    .secondary .tab:not(:disabled):not(.selected):hover .lead, :host(.is-hover) .secondary .tab:nth-child(2) .lead { color: var(--rama-text-primary); }
    .secondary .tab.selected {
      padding-bottom: calc(var(--rama-space-12) - var(--rama-border-width-medium));
      border-bottom: var(--rama-border-width-medium) solid var(--rama-border-primary); color: var(--rama-text-default-black);
    }
    .secondary .tab.selected .label { font-weight: var(--rama-weight-semibold); }
    /* Disabled secundario (no está en Figma; completado con tokens, igual que el Disabled principal):
       texto, ícono, punto y contador en text-disabled y subrayado en border-disabled. */
    .secondary .tab:disabled { color: var(--rama-text-disabled); border-bottom-color: var(--rama-border-disabled); }
    .secondary .tab:disabled .lead { color: var(--rama-text-disabled); }
    .secondary .tab:disabled .dot { background: var(--rama-text-disabled); }
    .secondary .tab:disabled .count { background: var(--rama-bg-subtle); color: var(--rama-text-disabled); }
    :host(.is-focus) .secondary .tab:nth-child(2) { box-shadow: var(--rama-focus-ring); }
  `,
})
export class RamaTabs {
  readonly tabs = input<TabItem[]>([]);
  readonly variant = input<TabsVariant>('primary');
  readonly ariaLabel = input<string>();
  readonly selected = model(0);

  protected readonly uid = `rama-tabs-${nextId++}`;
  private readonly buttons = viewChildren<ElementRef<HTMLButtonElement>>('tabBtn');

  select(i: number) {
    if (!this.tabs()[i]?.disabled) this.selected.set(i);
  }

  onKey(event: KeyboardEvent, i: number) {
    const enabled = this.tabs().map((t, idx) => (t.disabled ? -1 : idx)).filter(idx => idx >= 0);
    const pos = enabled.indexOf(i);
    let target: number | undefined;
    if (event.key === 'ArrowRight') target = enabled[(pos + 1) % enabled.length];
    else if (event.key === 'ArrowLeft') target = enabled[(pos - 1 + enabled.length) % enabled.length];
    else if (event.key === 'Home') target = enabled[0];
    else if (event.key === 'End') target = enabled[enabled.length - 1];
    if (target === undefined) return;
    event.preventDefault();
    this.select(target);
    this.buttons()[target]?.nativeElement.focus();
  }
}
