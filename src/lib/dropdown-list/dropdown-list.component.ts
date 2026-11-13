import { ChangeDetectionStrategy, Component, ElementRef, computed, effect, forwardRef, inject, input, model, output, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { RamaIcon } from '../icon/icon.component';
import { RamaSearchTable } from '../search-table/search-table.component';
import { uniqueFieldId } from '../input/field.styles';

export interface DropdownOption {
  value: string;
  label: string;
  /** Ícono del ítem (tipo "icon"); por defecto `user`, como en Figma. */
  icon?: string;
  disabled?: boolean;
  /** Título de grupo ("Title items" en Figma). */
  group?: string;
}
export type DropdownItemType = 'icon' | 'checkbox' | 'text';
export type DropdownSize = 'large' | 'medium' | 'small';
/** `popover`: tarjeta flotante (desktop/tablet). `sheet`: hoja inferior móvil (Figma Dropdown list · Mobile). */
export type DropdownPresentation = 'popover' | 'sheet';

/** Ancho de viewport bajo el cual `presentation="auto"` usa la hoja inferior (Figma Mobile 390px). */
export const RAMA_SHEET_MEDIA = '(max-width: 600px)';

const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/**
 * Lista desplegable Rama (Figma: 12 Dropdown list). Tipos de ítem: con ícono, con checkbox o
 * solo texto; tamaños Large/Medium/Small; estados enable, hover, selected y disabled.
 * Funciona sola (foco en la lista, flechas/Home/End/Enter/Espacio/Esc) o controlada por un
 * campo (autocomplete): en ese caso el campo pasa `selected` y reenvía las teclas a `handleKey()`.
 *
 * `presentation="sheet"` dibuja la variante Mobile: barra con asa y botón cerrar, buscador
 * (rama-search-table) que filtra la lista y divisor inferior. El buscador maneja ↑/↓/Enter/Esc.
 * El mismo componente lo usa el autocomplete en móvil, así hay una sola implementación de la hoja.
 * La clase de host/ítem `is-hover` del story solo fija el estado para la documentación.
 */
@Component({
  selector: 'rama-dropdown-list',
  imports: [RamaIcon, RamaSearchTable],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => RamaDropdownList), multi: true }],
  host: {
    '[class.sheet]': "presentation() === 'sheet'",
    '[style.width]': "presentation() === 'sheet' ? null : width()",
  },
  template: `
    @if (presentation() === 'sheet') {
      <div class="handle-bar">
        <span class="handle" aria-hidden="true"></span>
        <button type="button" class="close-btn" [attr.aria-label]="closeLabel()" (click)="close.emit()">
          <rama-icon name="close-24" [size]="24" />
        </button>
      </div>
    }
    <!-- En popover .panel es display: contents (no agrega caja). -->
    <div class="panel">
      @if (presentation() === 'sheet') {
        <rama-search-table class="search" [shadow]="false" [placeholder]="searchPlaceholder()" [ariaLabel]="searchPlaceholder() + ' en ' + ariaLabel()"
          [(value)]="query" (keydown)="onSearchKey($event)" />
      }
      <ng-content select="[header]" />
      <div class="list" role="listbox" [id]="id" [attr.tabindex]="standalone() ? 0 : -1" [attr.aria-multiselectable]="multiple()"
        [attr.aria-label]="ariaLabel()" [attr.aria-activedescendant]="activeIndex() >= 0 ? optionId(activeIndex()) : null"
        (keydown)="standalone() && handleKey($event)">
        @for (row of rows(); track row.key) {
          @if (row.kind === 'group') {
            <div class="group" role="presentation">{{ row.label }}</div>
          } @else {
            <div class="item" role="option" [id]="optionId(row.index)" [class]="'size-' + size()"
              [class.selected]="isSelected(row.option.value)" [class.active]="row.index === activeIndex()"
              [class.disabled]="row.option.disabled" [attr.aria-selected]="isSelected(row.option.value)"
              [attr.aria-disabled]="row.option.disabled || null"
              (mouseenter)="!row.option.disabled && activeIndex.set(row.index)" (mousedown)="$event.preventDefault()"
              (click)="choose(row.index)">
              @if (type() === 'icon') { <rama-icon [name]="row.option.icon ?? 'user'" [size]="20" /> }
              @if (type() === 'checkbox') {
                <span class="cb" [class.on]="isSelected(row.option.value)" aria-hidden="true">@if (isSelected(row.option.value)) {<rama-icon name="check" [size]="12" />}</span>
              }
              <span class="text">{{ row.option.label }}</span>
              @if (type() !== 'checkbox' && isSelected(row.option.value)) { <rama-icon name="check" [size]="20" class="check" /> }
            </div>
          }
        } @empty {
          <div class="empty">{{ emptyText() }}</div>
        }
      </div>
    </div>
    @if (presentation() === 'sheet') { <div class="divider" aria-hidden="true"></div> }
  `,
  styles: `
    /* Popover (desktop/tablet). */
    :host {
      display: flex; flex-direction: column; box-sizing: border-box; max-height: 320px; padding: var(--rama-space-12);
      background: var(--rama-bg-default-white); border: var(--rama-border-width-thin) solid var(--rama-border-inset);
      border-radius: var(--rama-radius-small); box-shadow: var(--rama-shadow-medium); font-family: var(--rama-font);
    }
    :host(:has(.list:focus-visible)) { box-shadow: var(--rama-shadow-medium), var(--rama-focus-ring); }
    .list { display: flex; flex-direction: column; flex: 1 1 auto; min-height: 0; overflow-y: auto; outline: none; }
    .group { padding: 17px var(--rama-space-12); font-size: 12px; line-height: normal; font-weight: var(--rama-weight-bold); color: var(--rama-text-subtle); }
    .item {
      display: flex; align-items: center; gap: var(--rama-space-8); padding: var(--rama-space-14); border-radius: var(--rama-radius-small);
      font-weight: var(--rama-weight-medium); color: var(--rama-text-muted); cursor: pointer; user-select: none; flex: none;
    }
    .size-large { font-size: 16px; line-height: normal; }
    .size-medium { font-size: 14px; line-height: 16px; }
    .size-small { font-size: 12px; line-height: 16px; }
    .text { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    /* Hover de Figma: #d9d9d9 (variable sds, sin token Rama) → token más cercano: border-inset (#d8dee4). */
    .item.active, .item:hover, .item.is-hover { background: var(--rama-border-inset); }
    .item.selected { background: var(--rama-primary-50); color: var(--rama-text-information); }
    .item.selected.active { background: var(--rama-primary-100); }
    .item.disabled { color: var(--rama-text-disabled); background: transparent; cursor: not-allowed; }
    /* CheckButton Small de Figma (16px, radio 4): enable blanco/borde inset; hover gris inset/borde primario;
       seleccionado relleno primary-fill/borde primario; disabled bg subtle/borde default. */
    .cb { width: 16px; height: 16px; flex: none; box-sizing: border-box; display: inline-flex; align-items: center; justify-content: center;
      border: var(--rama-border-width-thin) solid var(--rama-border-inset); border-radius: var(--rama-radius-xs); background: var(--rama-bg-default-white); }
    .item.active .cb, .item:hover .cb, .item.is-hover .cb { background: var(--rama-bg-inset); border-color: var(--rama-border-primary); }
    .cb.on, .item.active .cb.on, .item:hover .cb.on { background: var(--rama-primary-fill); border-color: var(--rama-border-primary); color: var(--rama-text-default-white); }
    .item.disabled .cb { background: var(--rama-bg-subtle); border-color: var(--rama-border-default); }
    /* Sin resultados (hueco de Figma, completado con tokens): mismo relleno que un ítem, texto subtle. */
    .empty { padding: var(--rama-space-14); font-size: 14px; line-height: 16px; color: var(--rama-text-subtle); }

    /* Sheet (Figma Dropdown list · Mobile, 390x567): hoja con radio superior 16, borde default y sombra Large. */
    :host(.sheet) {
      width: 100%; height: min(567px, 85dvh); max-height: none; padding: 0; gap: var(--rama-space-4); overflow: hidden;
      border-color: var(--rama-border-default); border-radius: var(--rama-radius-large) var(--rama-radius-large) 0 0;
      box-shadow: var(--rama-shadow-large);
    }
    :host(.sheet:has(.list:focus-visible)) { box-shadow: var(--rama-shadow-large), var(--rama-focus-ring); }
    .handle-bar { position: relative; display: flex; align-items: center; justify-content: flex-end; flex: none; padding: var(--rama-space-12) var(--rama-space-8) var(--rama-space-8) var(--rama-space-16); }
    .handle { position: absolute; top: var(--rama-space-10); left: 50%; width: 36px; height: 4px; transform: translateX(-50%);
      border-radius: 2px; background: var(--rama-border-inset); }
    .close-btn { display: inline-flex; padding: 0; border: 0; background: transparent; color: var(--rama-text-default-black);
      cursor: pointer; border-radius: var(--rama-radius-xs); }
    .close-btn:focus-visible { outline: none; box-shadow: var(--rama-focus-ring); }
    .panel { display: contents; }
    /* "Menú desplegable": tarjeta interna con borde default, radio 8, sombra Large y relleno 1/8/8. */
    :host(.sheet) .panel { display: flex; flex-direction: column; gap: var(--rama-space-8); flex: 1 1 auto; min-height: 0; padding: 1px var(--rama-space-8) var(--rama-space-8);
      border: var(--rama-border-width-thin) solid var(--rama-border-default); border-radius: var(--rama-radius-small);
      box-shadow: var(--rama-shadow-large); background: var(--rama-bg-default-white); }
    .search { width: 100%; flex: none; }
    :host(.sheet) .list { padding: var(--rama-space-8); }
    :host(.sheet) .empty { font-size: 12px; }
    .divider { flex: none; height: 1px; border-radius: 40px; background: var(--rama-border-default); }
  `,
})
export class RamaDropdownList implements ControlValueAccessor {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly options = input<DropdownOption[]>([]);
  readonly type = input<DropdownItemType>('icon');
  readonly size = input<DropdownSize>('large');
  readonly multiple = input(false);
  readonly width = input<string>('280px');
  readonly ariaLabel = input<string>('Opciones');
  readonly emptyText = input('Sin resultados');
  /** Selección controlada desde afuera (autocomplete). Si es null, usa su propio valor (CVA). */
  readonly selected = input<string[] | null>(null);
  /** Desactiva el manejo de teclado propio cuando la lista la controla otro campo. */
  readonly standalone = input(true);
  readonly presentation = input<DropdownPresentation>('popover');
  /** Texto del buscador de la hoja móvil. */
  readonly searchPlaceholder = input('Buscar');
  readonly closeLabel = input('Cerrar');
  /** Texto del buscador de la hoja; filtra las opciones (sin tildes ni mayúsculas). */
  readonly query = model('');
  readonly activeIndex = model(-1);
  readonly optionSelect = output<DropdownOption>();
  readonly close = output<void>();

  readonly id = uniqueFieldId('rama-listbox');
  private readonly ownValue = signal<string[]>([]);
  private readonly selection = computed(() => this.selected() ?? this.ownValue());

  /** Opciones visibles: en la hoja se filtran con el buscador. */
  readonly visible = computed(() => {
    const q = this.presentation() === 'sheet' ? norm(this.query().trim()) : '';
    return q ? this.options().filter(o => norm(o.label).includes(q)) : this.options();
  });

  readonly rows = computed(() => {
    const out: ({ kind: 'group'; key: string; label: string } | { kind: 'option'; key: string; index: number; option: DropdownOption })[] = [];
    let lastGroup: string | undefined;
    this.visible().forEach((option, index) => {
      if (option.group && option.group !== lastGroup) out.push({ kind: 'group', key: 'g-' + option.group + index, label: option.group });
      lastGroup = option.group;
      out.push({ kind: 'option', key: 'o-' + option.value, index, option });
    });
    return out;
  });

  private onChange: (v: string | string[] | null) => void = () => {};
  private onTouched: () => void = () => {};

  constructor() {
    // Mantiene visible el ítem activo al navegar con teclado.
    effect(() => {
      const i = this.activeIndex();
      if (i >= 0) queueMicrotask(() => this.host.nativeElement.querySelector(`#${this.optionId(i)}`)?.scrollIntoView({ block: 'nearest' }));
    });
    // En la hoja el buscador hace de combobox: se le asignan los atributos ARIA sin tocar rama-search-table.
    effect(() => {
      const sheet = this.presentation() === 'sheet';
      const active = this.activeIndex() >= 0 ? this.optionId(this.activeIndex()) : null;
      queueMicrotask(() => {
        const field = this.searchField();
        if (!sheet || !field) return;
        field.setAttribute('role', 'combobox');
        field.setAttribute('aria-controls', this.id);
        field.setAttribute('aria-expanded', 'true');
        field.setAttribute('aria-autocomplete', 'list');
        if (active) field.setAttribute('aria-activedescendant', active); else field.removeAttribute('aria-activedescendant');
      });
    });
    // Al filtrar, el ítem activo pasa al primero visible.
    effect(() => {
      this.query();
      if (this.presentation() === 'sheet' && this.query()) this.activeIndex.set(this.visible().findIndex(o => !o.disabled));
    });
  }

  private searchField() { return this.host.nativeElement.querySelector<HTMLInputElement>('.search input'); }
  /** Lleva el foco al buscador de la hoja (lo usa el autocomplete al abrir en móvil). */
  focusSearch() { this.searchField()?.focus(); }

  optionId(i: number) { return `${this.id}-opt-${i}`; }
  isSelected(v: string) { return this.selection().includes(v); }

  choose(index: number) {
    const option = this.visible()[index];
    if (!option || option.disabled) return;
    this.activeIndex.set(index);
    if (this.selected() === null) {
      const next = this.multiple()
        ? (this.ownValue().includes(option.value) ? this.ownValue().filter(v => v !== option.value) : [...this.ownValue(), option.value])
        : [option.value];
      this.ownValue.set(next);
      this.onChange(this.multiple() ? next : option.value);
      this.onTouched();
    }
    this.optionSelect.emit(option);
  }

  /** Teclas del buscador de la hoja: solo ↑/↓/Enter/Esc (el resto escribe en el campo). */
  onSearchKey(e: KeyboardEvent) {
    if (['ArrowDown', 'ArrowUp', 'Enter', 'Escape'].includes(e.key)) this.handleKey(e, true);
  }

  /** Navegación por teclado. Devuelve true si consumió la tecla. */
  handleKey(e: KeyboardEvent, typing = !this.standalone()): boolean {
    const opts = this.visible();
    const step = (from: number, dir: 1 | -1) => {
      for (let n = 1; n <= opts.length; n++) {
        const i = (from + dir * n + opts.length) % opts.length;
        if (!opts[i].disabled) return i;
      }
      return from;
    };
    switch (e.key) {
      case 'ArrowDown': this.activeIndex.set(step(this.activeIndex(), 1)); break;
      case 'ArrowUp': this.activeIndex.set(step(this.activeIndex() < 0 ? 0 : this.activeIndex(), -1)); break;
      case 'Home': if (typing) return false; this.activeIndex.set(step(-1, 1)); break;
      case 'End': if (typing) return false; this.activeIndex.set(step(0, -1)); break;
      case 'Enter':
      case ' ':
        if (e.key === ' ' && typing) return false;
        if (this.activeIndex() < 0) return false;
        this.choose(this.activeIndex());
        break;
      case 'Escape': this.close.emit(); break;
      default: return false;
    }
    e.preventDefault();
    return true;
  }

  writeValue(v: string | string[] | null): void { this.ownValue.set(v == null ? [] : Array.isArray(v) ? v : [v]); }
  registerOnChange(fn: (v: string | string[] | null) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
}
