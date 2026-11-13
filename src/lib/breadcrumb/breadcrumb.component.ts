import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RamaIcon } from '../icon/icon.component';

export interface BreadcrumbItem { label: string; icon?: string; href?: string; }

/**
 * Breadcrumb Rama (Figma: 9 Breadcrumbs). El último elemento es la página actual.
 * La clase de host `is-hover` muestra fijo el estado hover del primer elemento (solo docs).
 */
@Component({
  selector: 'rama-breadcrumb',
  imports: [RamaIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav aria-label="Ruta de navegación">
      <ol>
        @for (item of items(); track $index; let last = $last) {
          <li>
            @if (last) {
              <span class="item current" aria-current="page">
                @if (item.icon) { <rama-icon [name]="item.icon" [size]="20" /> }
                <span>{{ item.label }}</span>
              </span>
            } @else {
              <a class="item" [attr.href]="item.href || null" tabindex="0" (click)="navigate.emit(item)" (keydown.enter)="navigate.emit(item)">
                @if (item.icon) { <rama-icon [name]="item.icon" [size]="20" /> }
                <span>{{ item.label }}</span>
              </a>
              <span class="sep" aria-hidden="true">/</span>
            }
          </li>
        }
      </ol>
    </nav>
  `,
  styles: `
    ol { list-style: none; margin: 0; padding: 0; display: flex; align-items: center; gap: var(--rama-space-12); flex-wrap: wrap; }
    li { display: inline-flex; align-items: center; gap: var(--rama-space-12); }
    .item {
      display: inline-flex; align-items: center; gap: var(--rama-space-8);
      font: var(--rama-weight-medium) 12px/16px var(--rama-font); color: var(--rama-text-muted);
      text-decoration: none; white-space: nowrap; border-radius: var(--rama-radius-xs);
    }
    a.item { cursor: pointer; }
    a.item:hover, :host(.is-hover) li:first-child a.item { font-weight: var(--rama-weight-bold); color: var(--rama-text-primary); }
    a.item:focus-visible { outline: none; box-shadow: var(--rama-focus-ring); }
    .current { font-weight: var(--rama-weight-bold); }
    .sep { font: var(--rama-weight-regular) 12px/16px var(--rama-font); color: var(--rama-text-disabled); }
  `,
})
export class RamaBreadcrumb {
  readonly items = input<BreadcrumbItem[]>([]);
  readonly navigate = output<BreadcrumbItem>();
}
