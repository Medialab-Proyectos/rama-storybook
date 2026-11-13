import {
  ChangeDetectionStrategy, Component, DestroyRef, ElementRef, TemplateRef, afterNextRender, computed, contentChild,
  inject, input, linkedSignal, model, output, signal, viewChild,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { RamaIcon } from '../icon/icon.component';
import { RamaButton } from '../button/button.component';
import { RamaCheckbox } from '../checkbox/checkbox.component';
import { RamaBadge, BadgeType } from '../badge/badge.component';
import { RamaAvatar } from '../avatar/avatar.component';
import { RamaTableButton, TableButtonType } from './table-button.component';
import { RamaPercentage } from './percentage.component';

/**
 * Tipos de celda de Figma ("Column Cell" y "Action cell"):
 * text · icon-text (ícono 24 + texto) · tag (badge large) · percentage (anillo) · input (campo editable)
 * · avatar (avatar 32) · icon (solo ícono 24) · empty (celda vacía).
 */
export type TableCellType = 'text' | 'icon-text' | 'tag' | 'percentage' | 'input' | 'avatar' | 'icon' | 'empty';
export type TableRow = Record<string, unknown>;
/** Valor de una celda `avatar`: URL de la imagen o datos del avatar. */
export type TableAvatarValue = string | { src?: string; initials?: string; label?: string };

export interface TableColumn {
  key: string;
  header: string;
  /** Ancho fijo en px; sin ancho la columna reparte el espacio sobrante. */
  width?: number;
  /** Ancho mínimo (px) antes de que la tabla pase a desplazarse en horizontal. Por defecto 160. */
  minWidth?: number;
  type?: TableCellType;
  align?: 'left' | 'center' | 'right';
  /** Encabezado "Title sort": título + flechas para ordenar. */
  sortable?: boolean;
  /** Encabezado "Filter": botón de filtro (emite `filter`). */
  filterable?: boolean;
  /** Encabezado "Icon": solo un ícono (el título queda como texto accesible y tooltip). */
  headerIcon?: string;
  /** Ícono de las celdas `icon-text` / `icon` (por defecto calendar-time / edit-2). */
  icon?: string;
  /** Tipo de badge por valor, para celdas `tag` (por defecto primary). */
  tagTypes?: Record<string, BadgeType>;
  /** Placeholder de las celdas `input`. */
  placeholder?: string;
}

export interface TableActionEvent { type: TableButtonType; row: TableRow; }
export interface TableCellChangeEvent { row: TableRow; key: string; value: string; }

type SortDir = 'asc' | 'desc';

const NARROW = 52;
const DEFAULT_MIN = 160;

/**
 * Tabla Rama (Figma: 15.2 Tables · "Table (detach me!)"). Encabezado gris, filas de 56px con borde inferior,
 * columna opcional de selección, columna opcional para expandir un detalle (variante "Nested": una tabla
 * interna pasada como `<ng-template #detail let-row>`), orden por columna, paginación y columna "Acciones"
 * fija a la derecha. Cuando el ancho no alcanza, la tabla se desplaza en horizontal y muestra la barra
 * "Scroll bar (Light version)" debajo de la tarjeta.
 */
@Component({
  selector: 'rama-table',
  imports: [NgTemplateOutlet, RamaIcon, RamaButton, RamaCheckbox, RamaBadge, RamaAvatar, RamaTableButton, RamaPercentage],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="wrap">
      <div #scroller class="scroller" (scroll)="measure()" [attr.tabindex]="overflowing() ? 0 : null"
        [attr.role]="overflowing() ? 'region' : null" [attr.aria-label]="overflowing() ? (caption() ?? 'Tabla') + ', desplazable' : null">
        <table [attr.aria-label]="caption()" [attr.aria-busy]="loading() || null" [style.min-width.px]="minTableWidth()">
          <colgroup>
            @if (expandable()) { <col [style.width.px]="narrow" /> }
            @if (selectable()) { <col [style.width.px]="narrow" /> }
            @for (c of columns(); track c.key) { <col [style.width.px]="colWidth(c)" /> }
            @if (actions().length) { <col [style.width.px]="actionsWidth()" /> }
          </colgroup>
          <thead>
            <tr>
              @if (expandable()) { <th class="narrow"><span class="sr-only">Expandir</span></th> }
              @if (selectable()) {
                <th class="narrow">
                  <rama-checkbox class="cell-check" [checked]="allOnPageSelected()" [indeterminate]="someOnPageSelected()"
                    [disabled]="!pageRows().length" (checkedChange)="toggleAll()"><span class="sr-only">Seleccionar todas las filas de la página</span></rama-checkbox>
                </th>
              }
              @for (c of columns(); track c.key) {
                <th [style.text-align]="headerAlign(c)" [attr.aria-sort]="ariaSort(c)" [class.narrow]="isNarrow(c)">
                  @if (c.headerIcon) {
                    <rama-icon class="h-icon" [name]="c.headerIcon" [size]="24" [label]="c.header" [attr.title]="c.header" />
                  } @else if (c.sortable) {
                    <button type="button" class="sort" (click)="toggleSort(c.key)">
                      <span class="h-text">{{ c.header }}</span>
                      <rama-icon name="arrow-3" [size]="24" [class.active]="sortKey() === c.key" [class.desc]="sortKey() === c.key && sortDir() === 'desc'" />
                    </button>
                  } @else if (c.filterable) {
                    <span class="h-filter">
                      @if (c.header) { <span class="h-text">{{ c.header }}</span> }
                      <button type="button" class="icon-btn" [attr.aria-label]="'Filtrar por ' + c.header" (click)="filter.emit(c.key)">
                        <rama-icon name="sort" [size]="24" />
                      </button>
                    </span>
                  } @else if (c.type === 'empty' || isNarrow(c)) {
                    <span class="sr-only">{{ c.header }}</span>
                  } @else {
                    <span class="h-text">{{ c.header }}</span>
                  }
                </th>
              }
              @if (actions().length) { <th class="actions-h">{{ actionsHeader() }}</th> }
            </tr>
          </thead>
          <tbody>
            @if (loading()) {
              <tr><td class="state" [attr.colspan]="colCount()">
                <span class="loading"><rama-icon name="loading" [size]="20" class="spin" />{{ loadingText() }}</span>
              </td></tr>
            } @else {
              @for (row of pageRows(); track keyOf(row)) {
                <tr class="row" [class.selected]="isSelected(row)" [attr.aria-selected]="selectable() ? isSelected(row) : null">
                  @if (expandable()) {
                    <td class="narrow">
                      <button type="button" class="icon-btn expand" [class.open]="isExpanded(row)" [attr.aria-expanded]="isExpanded(row)"
                        [attr.aria-label]="(isExpanded(row) ? 'Contraer' : 'Expandir') + ' fila'" (click)="toggleExpand(row)">
                        <rama-icon name="chevron-down-lg" [size]="24" />
                      </button>
                    </td>
                  }
                  @if (selectable()) {
                    <td class="narrow">
                      <rama-checkbox class="cell-check" [checked]="isSelected(row)" (checkedChange)="toggleRow(row)"><span class="sr-only">Seleccionar fila</span></rama-checkbox>
                    </td>
                  }
                  @for (c of columns(); track c.key) {
                    <td [style.text-align]="cellAlign(c)" [class.narrow]="isNarrow(c)">
                      @switch (c.type ?? 'text') {
                        @case ('tag') { @if (row[c.key]) { <rama-badge size="large" [type]="c.tagTypes?.[$any(row[c.key])] ?? 'primary'">{{ row[c.key] }}</rama-badge> } }
                        @case ('percentage') { <rama-percentage [value]="$any(row[c.key])" /> }
                        @case ('avatar') {
                          @let av = avatarOf(row[c.key]);
                          <rama-avatar size="3x" [src]="av.src" [initials]="av.initials" [label]="av.label ?? c.header" [attr.title]="av.label" />
                        }
                        @case ('icon') { <rama-icon [name]="c.icon ?? 'edit-2'" [size]="24" [label]="$any(row[c.key]) || c.header" /> }
                        @case ('icon-text') {
                          <span class="icon-text"><rama-icon [name]="c.icon ?? 'calendar-time'" [size]="24" /><span class="text" [title]="$any(row[c.key])">{{ row[c.key] }}</span></span>
                        }
                        @case ('input') {
                          <input class="cell-input" type="text" [value]="row[c.key] ?? ''" [placeholder]="c.placeholder ?? ''" [attr.aria-label]="c.header"
                            (change)="cellChange.emit({ row, key: c.key, value: $any($event.target).value })" />
                        }
                        @case ('empty') {}
                        @default { <span class="text" [title]="$any(row[c.key])">{{ row[c.key] }}</span> }
                      }
                    </td>
                  }
                  @if (actions().length) {
                    <td class="actions">
                      <span class="actions-in">
                        <span class="divider" aria-hidden="true"></span>
                        @for (a of actions(); track a) {
                          <rama-table-button [kind]="a" [ariaLabel]="actionLabels()[a] ?? a" (click)="action.emit({ type: a, row })" />
                        }
                      </span>
                    </td>
                  }
                </tr>
                @if (expandable() && isExpanded(row) && detail()) {
                  <tr class="detail-row">
                    <td [attr.colspan]="colCount()"><div class="detail"><ng-container [ngTemplateOutlet]="detail()!" [ngTemplateOutletContext]="{ $implicit: row }" /></div></td>
                  </tr>
                }
              } @empty {
                <tr><td class="state" [attr.colspan]="colCount()">{{ emptyText() }}</td></tr>
              }
            }
          </tbody>
        </table>
      </div>
      @if (pageSize() > 0 && sortedRows().length > pageSize() && !loading()) {
        <div class="pager">
          <span>{{ rangeLabel() }}</span>
          <div class="pager-btns">
            <rama-button variant="outlined" size="xs" leadIcon="back" [iconOnly]="true" ariaLabel="Página anterior" [disabled]="page() === 0" (click)="goTo(page() - 1)" />
            <span class="page-num">{{ page() + 1 }} / {{ pageCount() }}</span>
            <rama-button variant="outlined" size="xs" leadIcon="chevron-right" [iconOnly]="true" ariaLabel="Página siguiente" [disabled]="page() >= pageCount() - 1" (click)="goTo(page() + 1)" />
          </div>
        </div>
      }
    </div>
    @if (overflowing()) {
      <div class="hbar" aria-hidden="true" (pointerdown)="onTrackDown($event)">
        <span class="thumb" [class.dragging]="dragging()" [style.left.%]="thumbLeft()" [style.width.%]="thumbWidth()" (pointerdown)="onThumbDown($event)"></span>
      </div>
    }
  `,
  styles: `
    :host { display: block; --tbl-border: var(--rama-border-default); }
    .wrap { border: 1px solid var(--tbl-border); border-radius: var(--rama-radius-medium); overflow: hidden;
      box-shadow: var(--rama-shadow-x-small); background: var(--rama-bg-default-white); }
    /* El desplazamiento horizontal usa la barra propia de Figma (debajo de la tarjeta); la nativa se oculta. */
    .scroller { overflow-x: auto; overflow-y: hidden; scrollbar-width: none; }
    .scroller::-webkit-scrollbar { display: none; }
    .scroller:focus-visible { outline: none; box-shadow: inset var(--rama-focus-ring); }
    table { width: 100%; border-collapse: separate; border-spacing: 0; table-layout: fixed; font-family: var(--rama-font); }
    th, td { height: 56px; padding: var(--rama-space-4) var(--rama-space-8); border-bottom: 1px solid var(--tbl-border);
      vertical-align: middle; text-align: left; box-sizing: border-box; }
    th { background: var(--rama-bg-subtle); color: var(--rama-text-muted); font: var(--rama-weight-semibold) 14px/16px var(--rama-font); }
    td { background: var(--rama-bg-default-white); color: var(--rama-text-default-black); font: var(--rama-weight-regular) 14px/16px var(--rama-font);
      transition: background-color .15s; }
    /* Selectores con ">" para no afectar a una tabla anidada (comparte los mismos estilos del componente). */
    tbody > tr:last-child > td { border-bottom: 0; }
    .narrow { text-align: center; }
    .text, .h-text { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }

    /* Hover de fila (sin estado en Figma): completado con bg-inset. */
    tbody > tr.row:hover > td { background: var(--rama-bg-inset); }
    /* Fila seleccionada = estado "Pressed" de las celdas en Figma (bordes superior e inferior primarios). */
    tbody > tr.selected > td { box-shadow: inset 0 1px 0 var(--rama-border-primary), inset 0 -1px 0 var(--rama-border-primary); }

    /* Header "Title sort": gap 10, flechas arrow-3 24px en gris muted. */
    .sort { display: inline-flex; align-items: center; gap: var(--rama-space-10); width: 100%; padding: 0; border: 0; background: none;
      font: inherit; color: inherit; cursor: pointer; text-align: left; border-radius: var(--rama-radius-xs); }
    .sort .h-text { flex: 1; min-width: 0; }
    .sort rama-icon { color: var(--rama-text-muted); transition: transform .15s, color .15s; }
    .sort:hover, .sort:hover rama-icon { color: var(--rama-text-default-black); }
    .sort rama-icon.active { color: var(--rama-text-primary); }
    .sort rama-icon.desc { transform: scaleY(-1); }
    .h-icon { color: var(--rama-text-muted); vertical-align: middle; }
    .h-filter { display: flex; align-items: center; gap: var(--rama-space-10); }
    .h-filter .h-text { flex: 1; min-width: 0; }
    th.narrow .h-filter { justify-content: center; }

    .icon-btn { display: inline-flex; padding: 0; border: 0; background: none; color: var(--rama-text-muted); cursor: pointer;
      border-radius: var(--rama-radius-xs); transition: transform .15s, color .15s, background-color .15s; vertical-align: middle; }
    .icon-btn:hover { color: var(--rama-text-default-black); }
    .expand { color: var(--rama-text-default-black); }
    .expand.open { transform: rotate(180deg); }
    .sort:focus-visible, .icon-btn:focus-visible { outline: none; box-shadow: var(--rama-focus-ring); }

    /* rama-checkbox: se limita a la caja de 24px (el texto es solo para lectores de pantalla). */
    .cell-check { width: 24px; vertical-align: middle; }

    .icon-text { display: flex; align-items: center; gap: var(--rama-space-10); min-width: 0; }
    .icon-text .text { flex: 1; min-width: 0; }

    /* Celda "Input": Text Input de Figma (borde inset, radio xs, 48px de alto, padding 20). */
    .cell-input { width: 100%; box-sizing: border-box; min-height: 48px; padding: 0 var(--rama-space-20); border: 1px solid var(--rama-border-inset);
      border-radius: var(--rama-radius-xs); background: var(--rama-bg-default-white); color: var(--rama-text-default-black);
      font: var(--rama-weight-regular) 16px/normal var(--rama-font); outline: none; transition: border-color .15s, box-shadow .15s; }
    .cell-input::placeholder { color: var(--rama-text-subtle); }
    .cell-input:hover { border-color: var(--rama-border-primary); }
    .cell-input:focus-visible { border-color: var(--rama-border-primary); box-shadow: var(--rama-focus-ring); }

    /* Columna "Acciones": fija a la derecha cuando la tabla se desplaza (Figma 1024 / 744). */
    .actions, .actions-h { position: sticky; right: 0; z-index: 1; }
    .actions-h { text-align: center; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .actions { padding: var(--rama-space-4) var(--rama-space-8) var(--rama-space-4) 0; }
    .actions-in { display: flex; align-items: center; justify-content: flex-end; gap: var(--rama-space-8); }
    .divider { flex: none; width: 1px; height: 32px; background: var(--tbl-border); margin-right: 1px; }

    .detail-row > td { height: auto; padding: 0 var(--rama-space-8) var(--rama-space-8); background: var(--rama-bg-default-white); }
    .detail { padding-top: var(--rama-space-8); }

    /* Estados vacío y cargando (sin variante en Figma): completados con tokens. */
    .state { text-align: center; color: var(--rama-text-muted); }
    .loading { display: inline-flex; align-items: center; gap: var(--rama-space-8); }
    .loading rama-icon { color: var(--rama-text-primary); }
    .spin { animation: rama-spin 1s linear infinite; }
    @keyframes rama-spin { to { transform: rotate(360deg); } }

    .pager { display: flex; align-items: center; justify-content: space-between; gap: var(--rama-space-16);
      padding: var(--rama-space-10) var(--rama-space-16); border-top: 1px solid var(--tbl-border);
      font: var(--rama-weight-regular) 13px/16px var(--rama-font); color: var(--rama-text-muted); }
    .pager-btns { display: inline-flex; align-items: center; gap: var(--rama-space-8); }
    .page-num { min-width: 48px; text-align: center; color: var(--rama-text-default-black); font-weight: var(--rama-weight-semibold); }

    /* "Scroll bar (Light version)": 16px de alto, 4px de padding, barra de 8px gris (neutral-300) con radio 8. */
    .hbar { position: relative; height: 16px; margin-top: var(--rama-space-8); padding: var(--rama-space-4); box-sizing: border-box; cursor: pointer; touch-action: none; }
    .thumb { position: absolute; top: var(--rama-space-4); height: 8px; border-radius: var(--rama-radius-small); background: var(--rama-border-default);
      cursor: grab; transition: background-color .15s; }
    .hbar:hover .thumb, .thumb.dragging { background: var(--rama-border-inset); }
    .thumb.dragging { cursor: grabbing; }
  `,
})
export class RamaTable {
  readonly columns = input.required<TableColumn[]>();
  readonly rows = input<TableRow[]>([]);
  /** Propiedad de cada fila que la identifica (selección, expansión). */
  readonly rowKey = input('id');
  readonly selectable = input(false);
  readonly expandable = input(false);
  readonly actions = input<TableButtonType[]>([]);
  readonly actionLabels = input<Partial<Record<TableButtonType, string>>>({ primary: 'Ver detalle', search: 'Buscar', success: 'Aprobar', edit: 'Editar', answer: 'Responder', error: 'Eliminar' });
  readonly actionsHeader = input('Acciones');
  /** Filas por página; 0 desactiva la paginación. */
  readonly pageSize = input(0);
  readonly caption = input<string>();
  readonly emptyText = input('No hay registros para mostrar.');
  readonly loading = input(false);
  readonly loadingText = input('Cargando registros…');
  /** Claves (`rowKey`) de las filas seleccionadas. */
  readonly selected = model<unknown[]>([]);
  readonly action = output<TableActionEvent>();
  /** Clic en el filtro de un encabezado "Filter" (clave de la columna). */
  readonly filter = output<string>();
  /** Cambio confirmado en una celda `input`. */
  readonly cellChange = output<TableCellChangeEvent>();

  readonly detail = contentChild<TemplateRef<unknown>>('detail');
  private readonly scroller = viewChild.required<ElementRef<HTMLElement>>('scroller');

  protected readonly narrow = NARROW;
  readonly sortKey = signal<string | null>(null);
  readonly sortDir = signal<SortDir>('asc');
  private readonly expanded = signal<Set<unknown>>(new Set());
  /** Vuelve a la primera página cuando cambian los datos. */
  readonly page = linkedSignal({ source: () => this.rows(), computation: () => 0 });

  readonly overflowing = signal(false);
  readonly thumbLeft = signal(0);
  readonly thumbWidth = signal(100);
  readonly dragging = signal(false);

  readonly actionsWidth = computed(() => {
    const n = this.actions().length;
    // Figma: primera acción 54px (divisor + gap 10 + botón 36 + 8), cada acción siguiente 44px.
    // Mínimo 98px (el de Figma con 2 acciones) para que quepa el título "Acciones".
    return n ? Math.max(98, n * 44 + 10) : 0;
  });
  readonly minTableWidth = computed(() =>
    (this.expandable() ? NARROW : 0) + (this.selectable() ? NARROW : 0) + this.actionsWidth()
    + this.columns().reduce((s, c) => s + (this.colWidth(c) ?? c.minWidth ?? DEFAULT_MIN), 0));

  readonly sortedRows = computed(() => {
    const key = this.sortKey();
    const rows = [...this.rows()];
    if (!key) return rows;
    const dir = this.sortDir() === 'asc' ? 1 : -1;
    return rows.sort((a, b) => {
      const va = a[key], vb = b[key];
      if (typeof va === 'number' && typeof vb === 'number') return (va - vb) * dir;
      return String(va ?? '').localeCompare(String(vb ?? ''), 'es', { numeric: true, sensitivity: 'base' }) * dir;
    });
  });
  readonly pageCount = computed(() => Math.max(1, Math.ceil(this.sortedRows().length / (this.pageSize() || 1))));
  readonly pageRows = computed(() => {
    const size = this.pageSize();
    if (!size) return this.sortedRows();
    const start = this.page() * size;
    return this.sortedRows().slice(start, start + size);
  });
  readonly rangeLabel = computed(() => {
    const size = this.pageSize(), total = this.sortedRows().length;
    const start = this.page() * size + 1;
    return `Mostrando ${start}–${Math.min(start + size - 1, total)} de ${total}`;
  });
  readonly colCount = computed(() => this.columns().length + (this.expandable() ? 1 : 0) + (this.selectable() ? 1 : 0) + (this.actions().length ? 1 : 0));
  readonly allOnPageSelected = computed(() => this.pageRows().length > 0 && this.pageRows().every(r => this.isSelected(r)));
  readonly someOnPageSelected = computed(() => !this.allOnPageSelected() && this.pageRows().some(r => this.isSelected(r)));

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const el = this.scroller().nativeElement;
      const ro = new ResizeObserver(() => this.measure());
      ro.observe(el);
      const table = el.querySelector('table');
      if (table) ro.observe(table);
      this.measure();
      destroyRef.onDestroy(() => ro.disconnect());
    });
  }

  keyOf(row: TableRow): unknown { return row[this.rowKey()]; }
  isSelected(row: TableRow): boolean { return this.selected().includes(this.keyOf(row)); }
  isExpanded(row: TableRow): boolean { return this.expanded().has(this.keyOf(row)); }
  isNarrow(c: TableColumn): boolean { return c.type === 'avatar' || c.type === 'icon' || (!!c.headerIcon && !c.width); }
  colWidth(c: TableColumn): number | undefined { return c.width ?? (this.isNarrow(c) ? NARROW : undefined); }
  headerAlign(c: TableColumn): string { return c.align ?? (this.isNarrow(c) ? 'center' : 'left'); }
  cellAlign(c: TableColumn): string {
    return c.align ?? (c.type === 'tag' || c.type === 'percentage' || this.isNarrow(c) ? 'center' : 'left');
  }
  avatarOf(v: unknown): { src?: string; initials?: string; label?: string } {
    if (!v) return {};
    return typeof v === 'string' ? { src: v } : (v as { src?: string; initials?: string; label?: string });
  }

  ariaSort(c: TableColumn): string | null {
    if (!c.sortable) return null;
    if (this.sortKey() !== c.key) return 'none';
    return this.sortDir() === 'asc' ? 'ascending' : 'descending';
  }

  toggleSort(key: string) {
    if (this.sortKey() === key) this.sortDir.update(d => (d === 'asc' ? 'desc' : 'asc'));
    else { this.sortKey.set(key); this.sortDir.set('asc'); }
  }

  toggleRow(row: TableRow) {
    const k = this.keyOf(row);
    this.selected.update(s => (s.includes(k) ? s.filter(x => x !== k) : [...s, k]));
  }

  toggleAll() {
    const keys = this.pageRows().map(r => this.keyOf(r));
    this.selected.update(s => (this.allOnPageSelected() ? s.filter(k => !keys.includes(k)) : [...new Set([...s, ...keys])]));
  }

  toggleExpand(row: TableRow) {
    const k = this.keyOf(row);
    this.expanded.update(s => { const n = new Set(s); n.has(k) ? n.delete(k) : n.add(k); return n; });
  }

  goTo(p: number) { this.page.set(Math.max(0, Math.min(this.pageCount() - 1, p))); }

  /** Recalcula si hay desbordamiento horizontal y la posición de la barra. */
  measure() {
    const el = this.scroller().nativeElement;
    const { scrollWidth: sw, clientWidth: cw, scrollLeft: sl } = el;
    const over = sw - cw > 1;
    this.overflowing.set(over);
    if (!over) return;
    const w = Math.max(10, (cw / sw) * 100);
    this.thumbWidth.set(w);
    this.thumbLeft.set((sl / (sw - cw)) * (100 - w));
  }

  onThumbDown(e: PointerEvent) {
    e.stopPropagation();
    e.preventDefault();
    const thumb = e.currentTarget as HTMLElement;
    const track = thumb.parentElement!;
    const el = this.scroller().nativeElement;
    const startX = e.clientX, startScroll = el.scrollLeft;
    const trackW = track.clientWidth - 8;
    const ratio = (el.scrollWidth - el.clientWidth) / Math.max(1, trackW * (1 - this.thumbWidth() / 100));
    thumb.setPointerCapture(e.pointerId);
    this.dragging.set(true);
    const move = (ev: PointerEvent) => { el.scrollLeft = startScroll + (ev.clientX - startX) * ratio; };
    const up = () => {
      this.dragging.set(false);
      thumb.removeEventListener('pointermove', move);
      thumb.removeEventListener('pointerup', up);
      thumb.removeEventListener('pointercancel', up);
    };
    thumb.addEventListener('pointermove', move);
    thumb.addEventListener('pointerup', up);
    thumb.addEventListener('pointercancel', up);
  }

  /** Clic en la pista: centra la barra en ese punto. */
  onTrackDown(e: PointerEvent) {
    const track = e.currentTarget as HTMLElement;
    const el = this.scroller().nativeElement;
    const rect = track.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    el.scrollTo({ left: pct * el.scrollWidth - el.clientWidth / 2, behavior: 'smooth' });
  }
}
