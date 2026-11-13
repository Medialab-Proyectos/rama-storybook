import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, Injector, afterNextRender, computed, forwardRef, inject, input, signal, viewChild } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { RamaIcon } from '../icon/icon.component';
import { RamaTag } from '../tag/tag.component';
import { DropdownOption, DropdownSize, RAMA_SHEET_MEDIA, RamaDropdownList } from '../dropdown-list/dropdown-list.component';
import { FIELD_STYLES, FieldSize, uniqueFieldId } from '../input/field.styles';

const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/**
 * Autocomplete Rama (Figma: 13 Autocomplete y Autocomplete Multiselect). Campo que filtra
 * mientras se escribe y abre la Dropdown list debajo. Teclado: ↓/↑ navegan, Enter elige,
 * Esc cierra, Backspace en vacío quita el último tag (multiselect, tags = rama-tag Small).
 *
 * Presentación (eje Device de Figma): `presentation="auto"` (por defecto) usa la Dropdown list como
 * popover debajo del campo y, en viewports móviles (RAMA_SHEET_MEDIA), la abre como hoja inferior
 * (`rama-dropdown-list presentation="sheet"`) con su propio buscador; el campo pasa a Size=Small y
 * los ítems a Small, como en Figma Mobile. Se decide por viewport (matchMedia) y no por container
 * query porque la hoja se fija al viewport y cambia el comportamiento (foco en el buscador), no solo estilos.
 */
@Component({
  selector: 'rama-autocomplete',
  imports: [RamaIcon, RamaDropdownList, RamaTag],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => RamaAutocomplete), multi: true }],
  host: {
    '[class.has-error]': '!!error()', '[class.is-disabled]': 'isDisabled()', '[class.is-focus]': 'open()', '[class.size-small]': "effFieldSize() === 'small'", '[class.is-multi]': 'multiple()',
    '(focusout)': 'onFocusOut($event)',
  },
  template: `
    @if (label()) {
      <label class="label" [attr.for]="id">{{ label() }}@if (required()) {<span class="req" aria-hidden="true">*</span>}@if (labelTooltip()) {<span class="label-tip" [title]="labelTooltip()" role="img" [attr.aria-label]="labelTooltip()"><rama-icon name="info-circle" [size]="14" /></span>}</label>
    }
    <div class="anchor">
      <div class="box" (click)="onBoxClick($event); control.focus()">
        <div class="values">
        @if (multiple() && !selectionAsText()) {
          @for (o of selectedOptions(); track o.value) {
            <rama-tag size="small" [closable]="!isDisabled()" [closeLabel]="'Quitar ' + o.label" (closed)="toggle(o)">{{ o.label }}</rama-tag>
          }
        }
        <input #control class="control" [id]="id" role="combobox" autocomplete="off" [disabled]="isDisabled()" [readOnly]="isSheet()"
          [value]="displayText()" [placeholder]="selectionAsText() ? selectedText() : multiple() && selectedOptions().length ? '' : placeholder()"
          [class.sel-text]="selectionAsText()"
          [attr.aria-expanded]="open()" [attr.aria-controls]="list()?.id" aria-autocomplete="list"
          [attr.aria-activedescendant]="open() && active() >= 0 ? list()?.optionId(active()) : null"
          [attr.aria-invalid]="!!error()" [attr.aria-required]="required()" [attr.aria-describedby]="hasLower() ? id + '-help' : null"
          (input)="onType(control.value)" (keydown)="onKey($event)" />
        </div>
        <button type="button" class="icon-btn chevron" tabindex="-1" [disabled]="isDisabled()" [attr.aria-label]="open() ? 'Cerrar opciones' : 'Abrir opciones'"
          (click)="$event.stopPropagation(); open() ? closeMenu() : openMenu(); control.focus()">
          <rama-icon [name]="open() ? 'chevron-up' : 'chevron-down'" [size]="20" />
        </button>
      </div>
      @if (open() && !isSheet()) {
        <rama-dropdown-list class="panel" [options]="filtered()" [type]="itemType()" [size]="listSize()" [multiple]="multiple()"
          [selected]="value()" [standalone]="false" [(activeIndex)]="active" [ariaLabel]="label() ?? 'Opciones'"
          (optionSelect)="toggle($event)" />
      }
      @if (open() && isSheet()) {
        <div class="scrim" (click)="closeMenu(); focusControl()">
          <rama-dropdown-list class="sheet" presentation="sheet" [options]="filtered()" [type]="itemType()" [size]="listSize()"
            [multiple]="multiple()" [selected]="value()" [standalone]="false" [(activeIndex)]="active" [(query)]="query"
            [ariaLabel]="label() ?? 'Opciones'" (click)="$event.stopPropagation()" (optionSelect)="toggle($event)"
            (close)="closeMenu(); focusControl()" />
        </div>
      }
    </div>
    @if (hasLower()) { <div class="lower" [id]="id + '-help'"><span>{{ error() || helper() }}</span></div> }
  `,
  styles: [FIELD_STYLES, `
    .anchor { position: relative; }
    /* Tags + texto dentro de .values; el chevron queda fijo a la derecha. */
    .values { display: flex; flex-wrap: wrap; align-items: center; gap: var(--rama-space-8); flex: 1; min-width: 0; align-self: stretch; }
    .control { min-width: 80px; align-self: stretch; }
    .chevron { margin-left: auto; color: var(--rama-text-default-black); }
    :host(.is-disabled) .chevron { color: var(--rama-text-disabled); }
    /* Multiselect (Figma): los tags van en UNA fila y el campo conserva su alto (48 / 44 small).
       Si no caben, la fila se desplaza horizontalmente (rueda, arrastre o teclado) sin barra visible. */
    :host(.is-multi) .values { flex-wrap: nowrap; overflow-x: auto; overflow-y: hidden; scrollbar-width: none; }
    :host(.is-multi) .values::-webkit-scrollbar { display: none; }
    :host(.is-multi) .values rama-tag { flex: none; }
    /* Con tags el campo de texto se encoge para que tags y chevron quepan en una fila (Figma). */
    :host(.is-multi) .box:has(rama-tag) .control { min-width: var(--rama-space-24); }
    /* Figma (Autocomplete Multiselect · Menu open=True, Select item=True, Desktop): con el menú abierto
       la selección se muestra como texto (16 regular, default-black, una línea) en vez de tags; se puede
       seguir escribiendo para filtrar. Con el menú cerrado vuelven los tags. */
    .control.sel-text::placeholder { color: var(--rama-text-default-black); opacity: 1; }
    .control.sel-text { text-overflow: ellipsis; }
    .panel { position: absolute; top: calc(100% + var(--rama-space-12)); left: 0; z-index: 20; min-width: 100%; }
    /* Hoja móvil: fondo atenuado (sin variante en Figma; color-mix del token negro, como el scrim del modal). */
    .scrim { position: fixed; inset: 0; z-index: 400; display: flex; align-items: flex-end; justify-content: center;
      background: color-mix(in srgb, var(--rama-bg-default-black) 70%, transparent); }
    .sheet { max-width: 600px; }
  `],
})
export class RamaAutocomplete implements ControlValueAccessor {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly label = input<string>();
  readonly placeholder = input('Placeholder');
  readonly required = input(false);
  readonly helper = input<string>();
  readonly error = input<string>();
  readonly disabled = input(false);
  readonly options = input<DropdownOption[]>([]);
  readonly multiple = input(false);
  /** Tamaño de los ítems; por defecto Large en popover y Small en la hoja móvil. */
  readonly size = input<DropdownSize>();
  /** Tamaño del campo (como rama-input): medium 48px o small 44px; por defecto small en móvil. */
  readonly fieldSize = input<FieldSize>();
  /** `auto`: popover en desktop/tablet y hoja inferior en móvil. `popover`/`sheet` lo fijan. */
  readonly presentation = input<'auto' | 'popover' | 'sheet'>('auto');
  readonly labelTooltip = input<string>();
  /** Tipo de ítem de la lista; por defecto ícono en simple y checkbox en multiselect. */
  readonly listType = input<'icon' | 'checkbox' | 'text'>();

  readonly list = viewChild(RamaDropdownList);
  readonly id = uniqueFieldId('rama-autocomplete');
  readonly value = signal<string[]>([]);
  readonly open = signal(false);
  readonly query = signal('');
  readonly active = signal(-1);
  private readonly formDisabled = signal(false);
  private readonly injector = inject(Injector);
  private readonly mobile = signal(false);

  readonly isSheet = computed(() => this.presentation() === 'sheet' || (this.presentation() === 'auto' && this.mobile()));
  readonly effFieldSize = computed<FieldSize>(() => this.fieldSize() ?? (this.isSheet() ? 'small' : 'medium'));
  readonly listSize = computed<DropdownSize>(() => this.size() ?? (this.isSheet() ? 'small' : 'large'));

  constructor() {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mq = window.matchMedia(RAMA_SHEET_MEDIA);
      this.mobile.set(mq.matches);
      const onChange = (e: MediaQueryListEvent) => this.mobile.set(e.matches);
      mq.addEventListener('change', onChange);
      inject(DestroyRef).onDestroy(() => mq.removeEventListener('change', onChange));
    }
  }

  readonly isDisabled = computed(() => this.disabled() || this.formDisabled());
  readonly hasLower = computed(() => !!(this.error() || this.helper()));
  readonly itemType = computed(() => this.listType() ?? (this.multiple() ? 'checkbox' : 'icon'));
  readonly selectedOptions = computed(() => this.value().map(v => this.options().find(o => o.value === v)).filter((o): o is DropdownOption => !!o));
  readonly filtered = computed(() => {
    const q = norm(this.query().trim());
    return q ? this.options().filter(o => norm(o.label).includes(q)) : this.options();
  });
  /** Multiselect en escritorio con el menú abierto y algo seleccionado: la selección va como texto (Figma). */
  readonly selectionAsText = computed(() => this.multiple() && this.open() && !this.isSheet() && this.selectedOptions().length > 0);
  readonly selectedText = computed(() => this.selectedOptions().map(o => o.label).join(', '));
  readonly displayText = computed(() => {
    if (this.isSheet()) return this.multiple() ? '' : this.selectedOptions()[0]?.label ?? '';
    if (this.multiple() || this.query()) return this.query();
    return this.selectedOptions()[0]?.label ?? '';
  });

  private onChange: (v: string | string[] | null) => void = () => {};
  private onTouched: () => void = () => {};

  openMenu() {
    if (this.open()) return;
    this.query.set('');
    this.open.set(true);
    const sel = this.filtered().findIndex(o => this.value().includes(o.value));
    this.active.set(sel);
    // En la hoja el foco va al buscador.
    if (this.isSheet()) afterNextRender(() => this.list()?.focusSearch(), { injector: this.injector });
  }
  /** Clic en la caja abre el menú, salvo que sea el botón de quitar de un tag. */
  onBoxClick(e: MouseEvent) {
    if (this.isDisabled() || (e.target as Element | null)?.closest('rama-tag .close')) return;
    this.openMenu();
  }
  focusControl() { this.host.nativeElement.querySelector<HTMLInputElement>('.control')?.focus(); }
  closeMenu() { this.open.set(false); this.query.set(''); this.active.set(-1); }

  onType(text: string) {
    this.query.set(text);
    this.open.set(true);
    this.active.set(this.filtered().length ? 0 : -1);
  }

  toggle(option: DropdownOption) {
    let next: string[];
    if (this.multiple()) {
      next = this.value().includes(option.value) ? this.value().filter(v => v !== option.value) : [...this.value(), option.value];
      if (!this.isSheet()) this.query.set('');
    } else {
      next = [option.value];
      const wasSheet = this.isSheet();
      this.closeMenu();
      if (wasSheet) this.focusControl();
    }
    this.value.set(next);
    this.onChange(this.multiple() ? next : next[0] ?? null);
  }

  onKey(e: KeyboardEvent) {
    if (!this.open() && (e.key === 'ArrowDown' || e.key === 'ArrowUp' || (this.isSheet() && (e.key === 'Enter' || e.key === ' ')))) {
      this.openMenu(); e.preventDefault(); return;
    }
    if (this.multiple() && e.key === 'Backspace' && !this.query() && this.value().length) {
      const last = this.selectedOptions().at(-1);
      if (last) this.toggle(last);
      return;
    }
    if (e.key === 'Escape' && this.open()) { this.closeMenu(); e.preventDefault(); return; }
    if (this.open()) this.list()?.handleKey(e);
  }

  onFocusOut(e: FocusEvent) {
    // La hoja se cierra con su botón, el fondo, Esc o al elegir (un clic en zona no enfocable no la cierra).
    if (this.isSheet() && this.open()) return;
    if (!this.host.nativeElement.contains(e.relatedTarget as Node)) { this.closeMenu(); this.onTouched(); }
  }

  writeValue(v: string | string[] | null): void { this.value.set(v == null ? [] : Array.isArray(v) ? v : [v]); }
  registerOnChange(fn: (v: string | string[] | null) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState(d: boolean): void { this.formDisabled.set(d); }
}
