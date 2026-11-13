import { ChangeDetectionStrategy, Component, ElementRef, computed, forwardRef, inject, input, output, signal, viewChild } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { RamaIcon } from '../icon/icon.component';
import { FIELD_STYLES, uniqueFieldId } from '../input/field.styles';

/**
 * Nodo del árbol. Un nodo con `children` (aunque sea `[]`) es una carpeta (Type=Tree) que se
 * despliega; uno sin `children` es una opción seleccionable (Type=Checkbox o Radio Button).
 * Admite cualquier profundidad (Figma documenta los niveles 0, 1 y 2).
 */
export interface SearchTreeNode {
  value: string;
  label: string;
  /** Código que antecede al nombre de la carpeta (p. ej. "1001"). */
  code?: string;
  /** Opción no seleccionable (estado deshabilitado, completado con tokens). */
  disabled?: boolean;
  children?: SearchTreeNode[];
}

/** Type del Search menu: árbol con buscador o panel de descripción libre. */
export type SearchMenuType = 'tree' | 'description';
/** Size del Search menu: Medium 490px, Small 428px. */
export type SearchMenuSize = 'medium' | 'small';

type Row = { node: SearchTreeNode; level: number; folder: boolean; expanded: boolean; parent?: SearchTreeNode; emptyAfter?: boolean };
const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const isFolder = (n: SearchTreeNode) => n.children !== undefined;
const hits = (n: SearchTreeNode, q: string) => norm(`${n.code ?? ''} ${n.label}`).includes(q);
const subtreeHits = (n: SearchTreeNode, q: string): boolean => (n.children ?? []).some(c => hits(c, q) || subtreeHits(c, q));
const flatLeaves = (nodes: SearchTreeNode[]): SearchTreeNode[] => nodes.flatMap(n => (isFolder(n) ? flatLeaves(n.children!) : [n]));

/**
 * Search input Rama (Figma: 13 Search input + página "Search menu": sets ".Tree Items" y "Search menu").
 * El campo abre un panel (Search menu) de dos tipos:
 * - `menuType="tree"` (Search tree): título, buscador y árbol de carpetas en N niveles con opciones
 *   seleccionables: checkbox en modo múltiple (Type=Checkbox) o radio en modo simple (Type=Radio Button).
 * - `menuType="description"` (Description): título, área de texto con etiqueta y botón Eliminar.
 * `menuSize` fija el ancho del panel: medium (490px) o small (428px).
 * Teclado en el árbol: ↑/↓ mueven, → expande o entra a la carpeta, ← colapsa o sube al padre,
 * Inicio/Fin, Enter/Espacio despliegan o seleccionan, Esc cierra.
 */
@Component({
  selector: 'rama-search-input',
  imports: [RamaIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => RamaSearchInput), multi: true }],
  host: { '[class.has-error]': '!!error()', '[class.is-disabled]': 'isDisabled()', '[class.is-focus]': 'open() || staticOpen()' },
  template: `
    @if (label()) {
      <label class="label" [attr.for]="id">{{ label() }}@if (required()) {<span class="req" aria-hidden="true">*</span>}</label>
    }
    <div class="anchor">
      <button #field type="button" class="box field" [id]="id" [disabled]="isDisabled()" aria-haspopup="dialog" [attr.aria-expanded]="open()"
        [attr.aria-invalid]="!!error()" [attr.aria-describedby]="hasLower() ? id + '-help' : null" (click)="open() ? close() : openPanel()">
        <span class="text" [class.placeholder]="!summary()">{{ summary() || placeholder() }}</span>
        <rama-icon name="plus-circle" [size]="20" />
      </button>
      @if (open() || staticOpen()) {
        <div class="menu" role="dialog" [class.small]="menuSize() === 'small'" [class.desc]="menuType() === 'description'"
          [class.static]="staticOpen()" [attr.aria-label]="panelTitle()" (keydown.escape)="close(true)">
          <div class="menu-head">
            <button type="button" class="back" (click)="back.emit(); close(true)"><rama-icon name="arrow-right" [size]="14" class="flip" /> Volver</button>
            <button type="button" class="x" aria-label="Cerrar" (click)="close(true)"><rama-icon name="close-lg" [size]="32" /></button>
          </div>
          <h3 class="title">{{ panelTitle() }}</h3>
          @if (menuType() === 'description') {
            <div class="desc-field">
              <label class="label" [attr.for]="id + '-desc'">{{ descriptionLabel() }}@if (required()) {<span class="req" aria-hidden="true">*</span>}</label>
              <textarea #ta class="ta" [id]="id + '-desc'" [placeholder]="descriptionPlaceholder()" [value]="text()" [attr.aria-required]="required()"
                (input)="setText(ta.value)"></textarea>
            </div>
            <button type="button" class="remove" (click)="removeText()">Eliminar <rama-icon name="trash-2" [size]="20" /></button>
          } @else {
            <div class="search-row">
              <label class="search">
                <rama-icon name="search" [size]="20" />
                <input #q type="search" [placeholder]="searchPlaceholder()" [value]="draft()" aria-label="Buscar en la lista"
                  (input)="draft.set(q.value)" (keydown.enter)="query.set(draft())" />
              </label>
              <button type="button" class="find" (click)="query.set(draft())">Buscar</button>
            </div>
            <div class="tree" role="tree" [attr.aria-multiselectable]="multiple()" [attr.aria-label]="panelTitle()" tabindex="0" (keydown)="onTreeKey($event)"
              [attr.aria-activedescendant]="active() >= 0 ? rowId(active()) : null">
              @for (r of rows(); track r.node.value; let i = $index) {
                @if (r.folder) {
                  <div class="row folder" role="treeitem" [id]="rowId(i)" [attr.aria-expanded]="r.expanded" [attr.aria-level]="r.level + 1"
                    [style.padding-left.px]="indent(r.level)" [class.expanded]="r.expanded" [class.active]="i === active()"
                    (click)="active.set(i); toggleGroup(r.node)">
                    <rama-icon class="chev" [name]="r.expanded ? 'chevron-up' : 'chevron-down'" [size]="16" />
                    <rama-icon class="folder-ic" name="folder" [size]="16" />
                    <span class="folder-text">@if (r.node.code) {<span class="code">{{ r.node.code }}</span>}{{ r.node.label }}</span>
                  </div>
                  @if (r.emptyAfter) { <div class="note" role="none" [style.padding-left.px]="indent(r.level + 1)">Sin elementos</div> }
                } @else {
                  <div class="row leaf" role="treeitem" [id]="rowId(i)" [attr.aria-level]="r.level + 1" [attr.aria-selected]="isSelected(r.node.value)"
                    [attr.aria-disabled]="r.node.disabled || null" [class.disabled]="r.node.disabled"
                    [style.padding-left.px]="indent(r.level)" [class.selected]="isSelected(r.node.value)" [class.active]="i === active()"
                    (click)="active.set(i); choose(r.node)">
                    <span class="ctl" [class.radio]="!multiple()" [class.on]="isSelected(r.node.value)" aria-hidden="true">
                      @if (isSelected(r.node.value)) {<svg viewBox="0 0 16 16"><path d="M5.333 8l2 2 3.334-3.333" /></svg>}
                    </span>
                    <span class="leaf-text">{{ r.node.label }}</span>
                  </div>
                }
              } @empty {
                @if (loading()) {
                  <div class="note" role="none" aria-live="polite"><rama-icon name="loading" [size]="16" class="spin" /> Cargando…</div>
                } @else if (query()) {
                  <div class="note" role="none">Sin resultados para "{{ query() }}"</div>
                } @else {
                  <div class="note" role="none">No hay elementos para mostrar</div>
                }
              }
            </div>
          }
        </div>
      }
    </div>
    @if (hasLower()) { <div class="lower" [id]="id + '-help'"><span>{{ error() || helper() }}</span></div> }
  `,
  styles: [FIELD_STYLES, `
    :host { gap: var(--rama-space-8); }
    /* El search input usa radio small (8px), a diferencia de input y datepicker (4px). */
    .box { border-radius: var(--rama-radius-small); }
    .anchor { position: relative; }
    .field { width: 100%; text-align: left; font: inherit; cursor: pointer; color: var(--rama-text-default-black); }
    .field:focus-visible { outline: none; border-color: var(--rama-border-primary); box-shadow: var(--rama-focus-ring); }
    .field:disabled { cursor: not-allowed; }
    .text { flex: 1; min-width: 0; font-size: 16px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .placeholder { color: var(--rama-text-subtle); }
    :host(.is-disabled) .text { color: var(--rama-text-disabled); }
    /* Figma "Search input" (59684:75632): plus-circle 20px en default-black; con el menú abierto el borde pasa a
       border-primary con focus-ring y el texto (también el placeholder) se muestra en default-black. */
    .field rama-icon { color: var(--rama-text-default-black); }
    :host(.is-focus) .field { border-color: var(--rama-border-primary); box-shadow: var(--rama-focus-ring); }
    :host(.is-focus) .placeholder { color: var(--rama-text-default-black); }
    /* Completado con tokens: hover como el resto de campos (text-subtle) y disabled. */
    :host(:not(.has-error):not(.is-disabled):not(.is-focus)) .field:hover:not(:focus-visible) { border-color: var(--rama-text-subtle); }
    :host(.is-disabled) .field rama-icon { color: var(--rama-text-disabled); }

    /* ---- Search menu (Figma 59627:3115). Type=Search tree: 490/428 x 494, radio 10px, sombra 2X-Large.
       Medidas desde el borde exterior (el borde de Figma va por dentro): Volver (19,19), título y=66, buscador y=111 (46px), árbol y=161 (306px). ---- */
    .menu { position: absolute; top: calc(100% + 8px); left: 0; z-index: 20; width: 490px; max-width: 90vw; box-sizing: border-box;
      display: flex; flex-direction: column; padding: 18px 20px 0 18px; height: 494px; overflow: hidden;
      background: var(--rama-bg-default-white); border: var(--rama-border-width-thin) solid var(--rama-border-default);
      border-radius: 10px; box-shadow: var(--rama-shadow-2x-large); font-family: var(--rama-font); }
    .menu.small { width: 428px; }
    .menu.static { position: relative; top: 0; margin-top: var(--rama-space-8); z-index: auto; }
    .menu-head { display: flex; align-items: center; height: 22px; }
    /* Chip Volver: #f2f4f7 (neutral-200) y texto #002133 (information-on-fill). */
    .back { display: inline-flex; align-items: center; gap: 5px; height: 22px; padding: 0 var(--rama-space-8); box-sizing: border-box; border: 0;
      border-radius: var(--rama-radius-xs); background: var(--rama-neutral-200); color: var(--rama-information-on-fill);
      font: var(--rama-weight-semibold) 10px/normal var(--rama-font); cursor: pointer; }
    .back rama-icon { color: var(--rama-text-default-black); }
    .flip { transform: rotate(180deg); }
    .x { position: absolute; top: 6px; right: 8px; display: inline-flex; padding: 0; border: 0; background: transparent;
      color: var(--rama-text-default-black); cursor: pointer; border-radius: var(--rama-radius-xs); }
    .back:focus-visible, .x:focus-visible, .tree:focus-visible, .remove:focus-visible { outline: none; box-shadow: var(--rama-focus-ring); }
    .title { margin: 25px 0 0; font-size: 20px; line-height: normal; font-weight: var(--rama-weight-bold); letter-spacing: -0.4px; color: var(--rama-text-default-black); }
    .search-row { display: flex; gap: 9px; align-items: center; margin-top: 21px; }
    .search { flex: 1; display: flex; align-items: center; gap: var(--rama-space-8); padding: var(--rama-space-12) var(--rama-space-16); min-width: 0;
      border: var(--rama-border-width-thin) solid var(--rama-border-default); border-radius: var(--rama-radius-small); color: var(--rama-text-subtle); }
    .search:focus-within { border-color: var(--rama-border-primary); }
    .search input { flex: 1; min-width: 0; padding: 0; border: 0; outline: 0; font: var(--rama-weight-medium) 12px/16px var(--rama-font); letter-spacing: -0.24px; color: var(--rama-text-default-black); }
    .search input::placeholder { color: var(--rama-text-subtle); }
    .find { flex: none; height: 42px; padding: 0 var(--rama-space-16); border: var(--rama-border-width-thin) solid var(--rama-primary-fill);
      border-radius: var(--rama-radius-small); background: var(--rama-bg-default-white); color: var(--rama-primary-fill);
      font: var(--rama-weight-bold) 14px/20px var(--rama-font); cursor: pointer; box-shadow: var(--rama-shadow-x-small); }
    .find:hover { background: var(--rama-primary-50); }
    .find:focus-visible { outline: none; box-shadow: var(--rama-focus-ring); }

    /* Slot tree: borde default, radio 8, relleno 12 arriba / 8 izquierda, barra de scroll de 16px (#eaecf0). */
    .tree { flex: none; height: 306px; margin-top: 4px; box-sizing: border-box; overflow-y: auto; padding: var(--rama-space-12) 0 0 var(--rama-space-8);
      border: var(--rama-border-width-thin) solid var(--rama-border-default); border-radius: var(--rama-radius-small);
      display: flex; flex-direction: column; outline: none; scrollbar-width: thin; scrollbar-color: var(--rama-border-default) transparent; }
    .tree::-webkit-scrollbar { width: 16px; }
    .tree::-webkit-scrollbar-thumb { background: var(--rama-border-default); border: 4px solid transparent; background-clip: padding-box; border-radius: 8px; }

    /* .Tree Items (Figma 59623:2996): 28px de alto, relleno 6px; sangría izquierda 6 / 12 / 16 px por nivel 0 / 1 / 2. */
    .row { display: flex; align-items: center; gap: var(--rama-space-8); padding: 6px; box-sizing: border-box; min-height: 28px;
      border-radius: var(--rama-radius-small); color: var(--rama-text-muted); cursor: pointer; flex: none; min-width: 0; }
    .row:hover, .tree:focus-visible .row.active { background: var(--rama-primary-50); }
    .folder { font: var(--rama-weight-medium) 12px/16px var(--rama-font); }
    .chev { color: var(--rama-text-default-black); }
    .folder-ic { color: var(--rama-primary-on-fill); }
    .folder-text { flex: 1; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .code { margin-right: 6px; }
    .leaf { font: var(--rama-weight-medium) 14px/16px var(--rama-font); }
    .leaf-text { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .leaf.selected { color: var(--rama-text-information); font-weight: var(--rama-weight-semibold); }
    /* Control 16px de Check/Radio: borde interior 1px border-inset y relleno blanco; activo #005794 con check blanco. */
    .ctl { width: 16px; height: 16px; flex: none; box-sizing: border-box; display: inline-flex; border-radius: var(--rama-radius-xs);
      border: var(--rama-border-width-thin) solid var(--rama-border-inset); background: var(--rama-bg-default-white); }
    .ctl.radio { border-radius: var(--rama-radius-full); }
    .ctl.on { background: var(--rama-primary-on-fill); border-color: var(--rama-primary-on-fill); }
    .ctl svg { width: 16px; height: 16px; margin: -1px; flex: none; fill: none; stroke: var(--rama-text-default-white); stroke-width: 1.5; stroke-linecap: round; }
    /* Completado con tokens (no está en Figma): hover del control, opción deshabilitada, vacío y cargando. */
    .leaf:hover .ctl:not(.on) { border-color: var(--rama-border-primary); }
    .leaf.disabled { cursor: not-allowed; color: var(--rama-text-disabled); }
    .leaf.disabled:hover { background: transparent; }
    .leaf.disabled .ctl { background: var(--rama-bg-subtle); border-color: var(--rama-border-disabled); }
    .leaf.disabled .ctl.on { background: var(--rama-text-disabled); border-color: var(--rama-text-disabled); }
    .note { display: flex; align-items: center; gap: var(--rama-space-8); padding: 6px; font: var(--rama-weight-medium) 12px/16px var(--rama-font); color: var(--rama-text-subtle); }
    .spin { animation: rama-si-spin 1s linear infinite; }
    @keyframes rama-si-spin { to { transform: rotate(360deg); } }
    @media (prefers-reduced-motion: reduce) { .spin { animation: none; } }

    /* ---- Type=Description: 490/428 x 317, relleno 20 desde el borde exterior (19 + 1 de borde), separación 16, radio 8, sin sombra. ---- */
    .menu.desc { height: auto; min-height: 317px; padding: 19px; gap: var(--rama-space-16); justify-content: center;
      border-radius: var(--rama-radius-small); box-shadow: none; }
    .menu.desc .x { top: 11px; right: 7px; }
    .menu.desc .title { margin: 0; font-size: 18px; line-height: 16px; font-weight: var(--rama-weight-semibold); letter-spacing: -0.36px; }
    .desc-field { display: flex; flex-direction: column; gap: var(--rama-space-8); height: 155px; }
    .ta { flex: 1; min-height: 0; resize: none; box-sizing: border-box; padding: var(--rama-space-12); border-radius: var(--rama-radius-small);
      border: var(--rama-border-width-thin) solid var(--rama-border-inset); background: var(--rama-bg-default-white); outline: none;
      font: var(--rama-weight-regular) 12px/16px var(--rama-font); color: var(--rama-text-default-black); }
    .ta::placeholder { color: var(--rama-text-muted); }
    .ta:focus { border-color: var(--rama-border-primary); box-shadow: var(--rama-focus-ring); }
    .remove { align-self: flex-end; display: inline-flex; align-items: center; gap: var(--rama-space-8); padding: var(--rama-space-8) var(--rama-space-16);
      border: 0; border-radius: var(--rama-radius-small); background: transparent; color: var(--rama-text-primary);
      font: var(--rama-weight-bold) 14px/16px var(--rama-font); cursor: pointer; }
    .remove:hover { background: var(--rama-primary-50); }
  `],
})
export class RamaSearchInput implements ControlValueAccessor {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly label = input<string>();
  readonly placeholder = input('Placeholder');
  readonly required = input(false);
  readonly helper = input<string>();
  readonly error = input<string>();
  readonly disabled = input(false);
  /** true = Type=Checkbox (selección múltiple); false = Type=Radio Button (selección simple). */
  readonly multiple = input(true);
  readonly tree = input<SearchTreeNode[]>([]);
  readonly panelTitle = input('Seleccionar');
  readonly searchPlaceholder = input('Placeholder');
  /** Type del Search menu. Con 'description' el valor del control es el texto escrito. */
  readonly menuType = input<SearchMenuType>('tree');
  /** Size del Search menu: medium (490px) o small (428px). */
  readonly menuSize = input<SearchMenuSize>('medium');
  readonly descriptionLabel = input('Descripción');
  readonly descriptionPlaceholder = input('');
  /** Solo documentación: muestra el panel abierto en el flujo, sin el campo flotante. */
  readonly staticOpen = input(false);
  /** Carpetas desplegadas al iniciar (por `value`). */
  readonly initiallyExpanded = input<string[]>([]);
  /** Muestra "Cargando…" en el árbol mientras llegan los datos (completado con tokens). */
  readonly loading = input(false);
  readonly back = output<void>();
  /** Botón Eliminar del tipo Description (el texto ya se limpió al emitirse). */
  readonly remove = output<void>();

  readonly field = viewChild<ElementRef<HTMLButtonElement>>('field');
  readonly id = uniqueFieldId('rama-search-input');
  readonly value = signal<string[]>([]);
  readonly text = signal('');
  readonly open = signal(false);
  readonly draft = signal('');
  readonly query = signal('');
  readonly active = signal(-1);
  private readonly expandedGroups = signal<Set<string> | null>(null);
  private readonly formDisabled = signal(false);

  readonly isDisabled = computed(() => this.disabled() || this.formDisabled());
  readonly hasLower = computed(() => !!(this.error() || this.helper()));
  private readonly leaves = computed(() => flatLeaves(this.tree()));
  private readonly expanded = computed(() => this.expandedGroups() ?? new Set(this.initiallyExpanded()));
  readonly summary = computed(() => this.menuType() === 'description'
    ? this.text()
    : this.value().map(v => this.leaves().find(l => l.value === v)?.label ?? v).join(', '));

  readonly rows = computed<Row[]>(() => {
    const q = norm(this.query().trim());
    const open = this.expanded();
    const out: Row[] = [];
    const walk = (nodes: SearchTreeNode[], level: number, q: string, parent?: SearchTreeNode) => {
      for (const n of nodes) {
        const self = !q || hits(n, q);
        if (isFolder(n)) {
          if (!self && !subtreeHits(n, q)) continue;
          // Con búsqueda activa se despliegan las carpetas con coincidencias; si la carpeta coincide se muestra completa.
          const expanded = open.has(n.value) || !!q;
          out.push({ node: n, level, folder: true, expanded, parent, emptyAfter: expanded && !n.children!.length });
          if (expanded) walk(n.children!, level + 1, self ? '' : q, n);
        } else if (self) {
          out.push({ node: n, level, folder: false, expanded: false, parent });
        }
      }
    };
    walk(this.tree(), 0, q);
    return out;
  });

  private onChange: (v: string | string[] | null) => void = () => {};
  private onTouched: () => void = () => {};

  rowId(i: number) { return `${this.id}-row-${i}`; }
  isSelected(v: string) { return this.value().includes(v); }
  /** Sangría de Figma por nivel: 6 / 12 / 16 px; los niveles más profundos suman 4 px. */
  indent(level: number) { return level <= 0 ? 6 : level === 1 ? 12 : 16 + (level - 2) * 4; }

  openPanel() { this.open.set(true); this.active.set(-1); }
  close(returnFocus = false) {
    this.open.set(false);
    this.onTouched();
    if (returnFocus) this.field()?.nativeElement.focus();
  }

  toggleGroup(g: SearchTreeNode, force?: boolean) {
    const s = new Set(this.expanded());
    const willOpen = force ?? !s.has(g.value);
    if (willOpen) s.add(g.value); else s.delete(g.value);
    this.expandedGroups.set(s);
  }

  choose(n: SearchTreeNode) {
    if (n.disabled) return;
    const next = this.multiple()
      ? (this.isSelected(n.value) ? this.value().filter(v => v !== n.value) : [...this.value(), n.value])
      : [n.value];
    this.value.set(next);
    this.onChange(this.multiple() ? next : next[0] ?? null);
    if (!this.multiple() && !this.staticOpen()) this.close(true);
  }

  setText(v: string) { this.text.set(v); this.onChange(v); }
  removeText() { this.setText(''); this.remove.emit(); }

  onTreeKey(e: KeyboardEvent) {
    const rows = this.rows();
    if (!rows.length) return;
    const i = this.active();
    const r = rows[i];
    switch (e.key) {
      case 'ArrowDown': this.active.set(Math.min(rows.length - 1, i + 1)); break;
      case 'ArrowUp': this.active.set(Math.max(0, i - 1)); break;
      case 'Home': this.active.set(0); break;
      case 'End': this.active.set(rows.length - 1); break;
      case 'ArrowRight':
        if (r?.folder) { if (!r.expanded) this.toggleGroup(r.node, true); else if (rows[i + 1]?.parent === r.node) this.active.set(i + 1); }
        break;
      case 'ArrowLeft':
        if (r?.folder && r.expanded) this.toggleGroup(r.node, false);
        else if (r?.parent) this.active.set(rows.findIndex(x => x.node === r.parent));
        break;
      case 'Enter':
      case ' ':
        if (!r) return;
        if (r.folder) this.toggleGroup(r.node); else this.choose(r.node);
        break;
      default: return;
    }
    e.preventDefault();
    queueMicrotask(() => this.host.nativeElement.querySelector(`#${this.rowId(this.active())}`)?.scrollIntoView({ block: 'nearest' }));
  }

  writeValue(v: string | string[] | null): void {
    if (this.menuType() === 'description') { this.text.set(typeof v === 'string' ? v : ''); return; }
    this.value.set(v == null ? [] : Array.isArray(v) ? v : [v]);
  }
  registerOnChange(fn: (v: string | string[] | null) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState(d: boolean): void { this.formDisabled.set(d); }
}
