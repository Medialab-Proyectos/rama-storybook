import { ChangeDetectionStrategy, Component, ElementRef, computed, inject, input, linkedSignal, model, output, signal } from '@angular/core';
import { RamaIcon } from '../icon/icon.component';
import { DateRange, MONTHS_ES, WEEKDAYS_ES, addDays, addMonths, isoDay, monthGrid, sameDay, startOfDay, weekdayIndex } from './date-utils';

export type CalendarMode = 'single' | 'range';
type View = 'days' | 'months' | 'years';

/**
 * Calendario Rama (Figma: 17 Calendar). Modo `single` (una fecha) o `range` (rango).
 * Navegación como en Figma (sin flechas anterior/siguiente): menús de mes y año, y teclado sobre la
 * grilla (flechas, Inicio/Fin, RePág/AvPág —con Mayús, el año—, Enter/Espacio). Patrón ARIA "grid".
 * Los días del mes anterior quedan vacíos; los del mes siguiente o fuera de [min, max], deshabilitados.
 */
@Component({
  selector: 'rama-calendar',
  imports: [RamaIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="cal" role="group" [attr.aria-label]="mode() === 'range' ? 'Seleccionar rango de fechas' : 'Seleccionar fecha'">
      <div class="body">
        <div class="head">
          <button type="button" class="menu" [attr.aria-expanded]="view() === 'months'" (click)="toggleView('months')">
            <span>{{ months[viewMonth().getMonth()] }}</span><rama-icon name="chevron-down-sm" [size]="16" />
          </button>
          <button type="button" class="menu year" [attr.aria-expanded]="view() === 'years'" (click)="toggleView('years')">
            <span>{{ viewMonth().getFullYear() }}</span><rama-icon name="chevron-down-sm" [size]="16" />
          </button>
        </div>

        @switch (view()) {
          @case ('days') {
            <table class="grid" role="grid" [attr.aria-label]="months[viewMonth().getMonth()] + ' ' + viewMonth().getFullYear()" (keydown)="onKey($event)">
              <thead><tr>@for (w of weekdays; track w) { <th scope="col" [attr.abbr]="w">{{ w }}</th> }</tr></thead>
              <tbody>
                @for (week of weeks(); track $index) {
                  <tr>
                    @for (d of week; track d.iso) {
                      @if (d.blank) {
                        <td role="gridcell" class="blank"></td>
                      } @else {
                      <td [class]="d.band" role="gridcell" [attr.aria-selected]="d.selected" [attr.aria-disabled]="d.disabled || null">
                        <button type="button" class="day" [attr.data-date]="d.iso" [class.today]="d.today" [class.selected]="d.selected"
                          [class.out]="d.disabled" [disabled]="d.disabled" [attr.tabindex]="d.focus ? 0 : -1"
                          [attr.aria-label]="d.label" [attr.aria-current]="d.today ? 'date' : null" (click)="pick(d.date)">{{ d.date.getDate() }}</button>
                      </td>
                      }
                    }
                  </tr>
                }
              </tbody>
            </table>
          }
          @case ('months') {
            <div class="chips" role="listbox" aria-label="Mes">
              @for (m of months; track m; let i = $index) {
                <button type="button" class="chip" role="option" [class.selected]="i === viewMonth().getMonth()" [attr.aria-selected]="i === viewMonth().getMonth()" [disabled]="monthOff(i)" (click)="chooseMonth(i)">{{ m }}</button>
              }
            </div>
          }
          @case ('years') {
            <div class="chips" role="listbox" aria-label="Año">
              @for (y of years(); track y) {
                <button type="button" class="chip" role="option" [class.selected]="y === viewMonth().getFullYear()" [attr.aria-selected]="y === viewMonth().getFullYear()" [disabled]="yearOff(y)" (click)="chooseYear(y)">{{ y }}</button>
              }
            </div>
          }
        }
      </div>
      @if (showFooter()) {
        <div class="foot">
          <button type="button" class="fbtn cancel" (click)="cancel.emit()">{{ cancelLabel() }}</button>
          <button type="button" class="fbtn confirm" [disabled]="!hasSelection()" (click)="confirm.emit(mode() === 'range' ? range() : value())">{{ confirmLabel() }}</button>
        </div>
      }
    </div>
  `,
  styles: `
    /* Figma 59674:30649 (Calendar=Simple/Range, 559x413). Banda de rango = neutral-200; velos negros: hover 10 %, foco 20 %. */
    :host { display: block; width: 559px; max-width: 100%; --cal-border: var(--rama-border-default); --cal-band: var(--rama-neutral-200);
      --cal-sel-text: var(--rama-text-information); --cal-range-text: #232222; /* text/primary de Figma: sin token Rama equivalente */ }
    .cal { background: var(--rama-bg-default-white); border: 1px solid var(--cal-border); border-radius: 10px; /* 10px: sin token de radio */
      box-shadow: var(--rama-shadow-large); overflow: hidden; font-family: var(--rama-font); container-type: inline-size; }
    /* Panel de fechas: 336px en Figma (5 semanas) menos los 2px del borde exterior, que Figma dibuja hacia adentro → 413px en total. Crece si el mes ocupa 6. */
    .body { padding: var(--rama-space-8); display: flex; flex-direction: column; gap: var(--rama-space-8); min-height: 334px; box-sizing: border-box; }

    .head { display: flex; align-items: center; gap: 36px; padding: 0 19px; }
    /* En paneles angostos se compacta el encabezado. */
    @container (max-width: 420px) { .head { gap: var(--rama-space-4); padding: 0 var(--rama-space-4); } .menu { font-size: 18px; } }
    .menu { display: inline-flex; align-items: center; gap: var(--rama-space-8); padding: 10px var(--rama-space-4) 10px var(--rama-space-8); border: 0; background: none;
      border-radius: var(--rama-radius-full); cursor: pointer; font: var(--rama-weight-semibold) 20px/normal var(--rama-font); letter-spacing: -0.4px;
      color: var(--rama-text-default-black); }
    .menu rama-icon { color: var(--rama-text-support); }
    .menu.year { color: var(--rama-text-support); }
    .menu:hover { background: var(--rama-black-5); }
    .menu:focus-visible { background: var(--rama-black-10); }
    .menu:active { background: var(--rama-black-20); }
    .menu:focus-visible, .chip:focus-visible { outline: none; box-shadow: var(--rama-focus-ring); }

    /* Semanas: celdas de 40px con 4px entre filas; 8px entre los días de la semana y la primera fila. */
    .grid { width: 100%; border-collapse: separate; border-spacing: 0; table-layout: fixed; }
    th { height: 32px; box-sizing: border-box; padding: var(--rama-space-8) var(--rama-space-10); font: var(--rama-weight-semibold) 14px/16px var(--rama-font);
      color: var(--rama-text-complementary); text-align: center; }
    td { padding: var(--rama-space-4) 0 0; text-align: center; vertical-align: bottom; position: relative; line-height: 0; }
    tbody tr:first-child td { padding-top: var(--rama-space-8); }
    /* Banda gris del rango: completa en los días intermedios, media en el inicio y el fin. */
    td.in-range::before, td.range-start::before, td.range-end::before { content: ''; position: absolute; bottom: 0; height: 40px; background: var(--cal-band); }
    td.in-range::before { left: 0; right: 0; }
    td.range-start::before { left: 50%; right: 0; }
    td.range-end::before { left: 0; right: 50%; }
    .day { position: relative; width: 40px; height: 40px; border: 1px solid transparent; border-radius: var(--rama-radius-full);
      background: none; cursor: pointer; font: var(--rama-weight-semibold) 14px/16px var(--rama-font); color: var(--rama-text-default-black); }
    .day:hover { background: var(--rama-black-10); }
    .day:focus-visible { outline: none; background: var(--rama-black-20); }
    .day:active { background: var(--rama-primary-50); color: var(--cal-sel-text); }
    /* Hoy (no está en Figma, completado con tokens): borde y texto primary-on-fill; hover primary-100, foco primary-200. */
    .day.today { border-color: var(--rama-primary-on-fill); color: var(--rama-primary-on-fill); }
    .day.today:hover { background: var(--rama-primary-100); }
    .day.today:focus-visible { background: var(--rama-primary-200); }
    .day.today:active { background: var(--rama-primary-50); }
    /* Seleccionado (Figma): primary-50 + texto information; hover +5 % negro, foco +20 % negro, presionado primary-100. */
    .day.selected { background: var(--rama-primary-50); color: var(--cal-sel-text); border-color: transparent; }
    .day.selected:hover { background-image: linear-gradient(var(--rama-black-5), var(--rama-black-5)); }
    .day.selected:focus-visible { background-image: linear-gradient(var(--rama-black-20), var(--rama-black-20)); }
    .day.selected:active { background: var(--rama-primary-100); background-image: none; }
    /* Días intermedios del rango (Figma "Selected (Middle)"): hover/foco con círculo negro 5 % / 10 %. */
    td.in-range .day:not(.selected) { color: var(--cal-range-text); }
    td.in-range .day:not(.selected):hover { background: var(--rama-black-5); }
    td.in-range .day:not(.selected):focus-visible { background: var(--rama-black-10); }
    /* Deshabilitado (Figma State=Disabled): fuera de [min, max] o del mes siguiente. */
    .day.out { color: var(--rama-text-disabled); cursor: default; background: none; border-color: transparent; }
    .day.out.today { border-color: var(--rama-border-disabled); }

    /* Mes/año: celda de 88x52 con píldora de 72x36 (Figma 59671:25719). */
    .chips { display: grid; grid-template-columns: repeat(auto-fill, 88px); justify-content: center; row-gap: 0; padding: var(--rama-space-8) 19px var(--rama-space-16); }
    .chip { width: 72px; height: 36px; margin: var(--rama-space-8); border: 0; border-radius: var(--rama-radius-full); background: none; cursor: pointer;
      font: var(--rama-weight-semibold) 14px/16px var(--rama-font); color: var(--rama-text-support); }
    .chip:hover { background: var(--rama-black-5); }
    .chip:focus-visible { background: var(--rama-black-10); }
    .chip:active { background: var(--rama-black-20); }
    .chip.selected { background: var(--rama-primary-50); color: var(--rama-text-information); }
    /* Mes/año fuera de [min, max] (completado con tokens). */
    .chip:disabled { color: var(--rama-text-disabled); cursor: not-allowed; background: none; }

    .foot { display: flex; gap: var(--rama-space-8); padding: var(--rama-space-16); border-top: 1px solid var(--cal-border); }
    .fbtn { flex: 1; height: 44px; border-radius: var(--rama-radius-small); cursor: pointer; font: var(--rama-weight-bold) 16px/20px var(--rama-font); }
    .cancel { background: var(--rama-bg-default-white); border: 1px solid var(--rama-text-disabled); color: var(--rama-text-muted); }
    .cancel:hover { background: var(--rama-bg-subtle); }
    .confirm { background: var(--rama-primary-on-fill); border: 1px solid var(--rama-primary-on-fill); color: var(--rama-text-default-white); }
    .confirm:disabled { background: var(--rama-neutro-on-fill); border-color: var(--rama-neutro-on-fill); color: var(--rama-text-subtle); cursor: not-allowed; }
    .fbtn:focus-visible { outline: none; box-shadow: var(--rama-focus-ring); }
  `,
})
export class RamaCalendar {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  protected readonly months = MONTHS_ES;
  protected readonly weekdays = WEEKDAYS_ES;

  readonly mode = input<CalendarMode>('single');
  readonly value = model<Date | null>(null);
  readonly range = model<DateRange>({ start: null, end: null });
  readonly min = input<Date | null>(null);
  readonly max = input<Date | null>(null);
  /** Fecha que se considera "hoy" (configurable para ejemplos y pruebas). */
  readonly today = input<Date>(startOfDay(new Date()));
  readonly showFooter = input(true);
  readonly cancelLabel = input('Cancelar');
  readonly confirmLabel = input('Seleccionar');
  readonly confirm = output<Date | DateRange | null>();
  readonly cancel = output<void>();

  readonly view = signal<View>('days');
  /** Día con el foco del teclado; sigue a la selección o a "hoy". */
  readonly focused = linkedSignal(() => startOfDay((this.mode() === 'range' ? this.range().start : this.value()) ?? this.today()));
  readonly viewMonth = linkedSignal(() => new Date(this.focused().getFullYear(), this.focused().getMonth(), 1));
  readonly years = computed(() => {
    const y = this.viewMonth().getFullYear() - 4;
    return Array.from({ length: 12 }, (_, i) => y + i);
  });
  readonly hasSelection = computed(() => (this.mode() === 'range' ? !!this.range().start : !!this.value()));

  readonly weeks = computed(() => {
    const month = this.viewMonth().getMonth();
    const { start, end } = this.range();
    const range = this.mode() === 'range';
    const first = this.viewMonth();
    const days = new Date(first.getFullYear(), month + 1, 0).getDate();
    // Solo las semanas que ocupa el mes (Figma: 5 filas en mayo 2025).
    const count = Math.ceil((weekdayIndex(first) + days) / 7) * 7;
    const cells = monthGrid(first).slice(0, count).map(date => {
      // Figma: los días del mes anterior quedan vacíos; los del mes siguiente se ven deshabilitados.
      const blank = date < first;
      const disabled = date.getMonth() !== month || this.outOfBounds(date);
      const isStart = range && sameDay(date, start);
      const isEnd = range && sameDay(date, end);
      const between = range && !!start && !!end && date > start && date < end;
      const selected = range ? isStart || isEnd : sameDay(date, this.value());
      let band = '';
      if (!disabled && range && start && end && !sameDay(start, end)) band = between ? 'in-range' : isStart ? 'range-start' : isEnd ? 'range-end' : '';
      return {
        date, iso: isoDay(date), blank, disabled, selected, band,
        today: sameDay(date, this.today()),
        focus: sameDay(date, this.focused()),
        label: `${date.getDate()} de ${MONTHS_ES[date.getMonth()]} de ${date.getFullYear()}${isStart ? ', inicio del rango' : isEnd ? ', fin del rango' : ''}`,
      };
    });
    return Array.from({ length: count / 7 }, (_, w) => cells.slice(w * 7, w * 7 + 7));
  });

  outOfBounds(d: Date): boolean {
    const min = this.min(), max = this.max();
    return (!!min && d < startOfDay(min)) || (!!max && d > startOfDay(max));
  }

  /** Mes (del año visible) que queda completo fuera de [min, max]. */
  monthOff(m: number): boolean {
    const y = this.viewMonth().getFullYear(), min = this.min(), max = this.max();
    return (!!min && new Date(y, m + 1, 0) < startOfDay(min)) || (!!max && new Date(y, m, 1) > startOfDay(max));
  }

  /** Año que queda completo fuera de [min, max]. */
  yearOff(y: number): boolean {
    const min = this.min(), max = this.max();
    return (!!min && y < min.getFullYear()) || (!!max && y > max.getFullYear());
  }

  toggleView(v: View) { this.view.update(cur => (cur === v ? 'days' : v)); }
  chooseMonth(m: number) { this.focused.set(addMonths(this.focused(), m - this.focused().getMonth())); this.view.set('days'); }
  chooseYear(y: number) { this.focused.set(addMonths(this.focused(), (y - this.focused().getFullYear()) * 12)); this.view.set('days'); }

  pick(d: Date) {
    if (this.outOfBounds(d)) return;
    this.focused.set(d);
    if (this.mode() === 'single') { this.value.set(d); return; }
    const { start, end } = this.range();
    if (!start || end || d < start) this.range.set({ start: d, end: null });
    else this.range.set({ start, end: d });
  }

  onKey(e: KeyboardEvent) {
    const f = this.focused();
    const moves: Record<string, () => Date> = {
      ArrowLeft: () => addDays(f, -1), ArrowRight: () => addDays(f, 1),
      ArrowUp: () => addDays(f, -7), ArrowDown: () => addDays(f, 7),
      Home: () => addDays(f, -weekdayIndex(f)), End: () => addDays(f, 6 - weekdayIndex(f)),
      PageUp: () => addMonths(f, e.shiftKey ? -12 : -1), PageDown: () => addMonths(f, e.shiftKey ? 12 : 1),
    };
    const move = moves[e.key];
    if (!move) return;
    e.preventDefault();
    const next = move();
    if (this.outOfBounds(next)) return;
    this.focused.set(next);
    // Si el día ya está en pantalla se enfoca de inmediato; si cambió el mes, tras el siguiente render.
    const find = () => this.host.nativeElement.querySelector<HTMLButtonElement>(`[data-date="${isoDay(next)}"]:not(:disabled)`);
    const now = find();
    if (now) now.focus(); else setTimeout(() => find()?.focus());
  }
}
