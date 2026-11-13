import { ChangeDetectionStrategy, Component, ElementRef, computed, inject, input, model, signal } from '@angular/core';
import { RamaIcon } from '../icon/icon.component';
import { CalendarMode, RamaCalendar } from './calendar.component';
import { DateRange, formatDDMMYYYY, startOfDay } from './date-utils';

export type DatepickerSize = 'medium' | 'small';

let nextId = 0;

/**
 * Datepicker Rama (Figma: 17 Calendar · Datepicker). Campo con etiqueta, ícono de calendario
 * y texto de apoyo; abre el calendario en un panel y aplica la fecha con "Seleccionar".
 * Estados: Enable, Full, Disabled, Focus (al abrir) y Error. Tamaños medium (48px) y small (44px).
 */
@Component({
  selector: 'rama-datepicker',
  imports: [RamaIcon, RamaCalendar],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class.is-range]': "mode() === 'range'", '[class.size-small]': "size() === 'small'", '(document:click)': 'onDocClick($event)', '(keydown.escape)': 'close(true)' },
  template: `
    <div class="field" [class.error]="!!error()" [class.disabled]="disabled()" [class.filled]="!!display()">
      @if (label()) {
        <label class="upper" [attr.for]="id">{{ label() }} @if (required()) { <span class="req" aria-hidden="true">*</span> }</label>
      }
      <div class="anchor">
        <button type="button" class="control" [id]="id" [class.open]="open()" [class.filled]="!!display()" [disabled]="disabled()"
          aria-haspopup="dialog" [attr.aria-expanded]="open()" [attr.aria-describedby]="hasHelp() ? id + '-help' : null" [attr.aria-invalid]="!!error() || null"
          [attr.aria-required]="required() || null" (click)="toggle()" (keydown.arrowdown)="openPanel($event)">
          <span class="txt">{{ display() || placeholder() }}</span>
          <rama-icon name="calendar-1" [size]="20" />
        </button>
        @if (open()) {
          <div class="panel" role="dialog" [attr.aria-label]="label() || 'Calendario'">
            <rama-calendar [mode]="mode()" [min]="min()" [max]="max()" [today]="today()"
              [value]="draft()" (valueChange)="draft.set($event)" [range]="draftRange()" (rangeChange)="draftRange.set($event)"
              (confirm)="apply()" (cancel)="close(true)" />
          </div>
        }
      </div>
      @if (hasHelp()) {
        <span class="lower" [id]="id + '-help'">{{ error() || helpText() }}</span>
      }
    </div>
  `,
  styles: `
    :host { display: inline-block; width: 200px; max-width: 100%; position: relative; font-family: var(--rama-font); }
    :host(.is-range) { width: 259px; }
    .field { display: flex; flex-direction: column; gap: var(--rama-space-4); }
    .upper { display: flex; align-items: center; gap: var(--rama-space-4); font: var(--rama-weight-bold) 14px/16px var(--rama-font); color: var(--rama-field-label-color, var(--rama-text-default-black)); }
    .req { color: var(--rama-text-error); }
    .control { display: flex; align-items: center; gap: var(--rama-space-8); width: 100%; min-height: 48px; padding: 0 var(--rama-space-20);
      background: var(--rama-bg-default-white); border: 1px solid var(--rama-border-inset); border-radius: var(--rama-radius-xs);
      font: var(--rama-weight-regular) 16px/normal var(--rama-font); color: var(--rama-text-subtle); text-align: left; cursor: pointer; }
    .control.filled { color: var(--rama-text-default-black); }
    .control rama-icon { color: var(--rama-text-default-black); }
    .txt { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .anchor { position: relative; }
    /* Hover (no está en Figma, completado con tokens). */
    .field:not(.error) .control:not(:disabled):not(.open):hover { border-color: var(--rama-border-primary-emphasis); }
    .control.open, .control:focus-visible { outline: none; border-color: var(--rama-border-primary); box-shadow: var(--rama-focus-ring); }
    .lower { font: var(--rama-weight-regular) 14px/16px var(--rama-font); color: var(--rama-text-subtle); }
    .filled .lower { color: var(--rama-text-muted); }

    .error .control { border-color: var(--rama-border-error-emphasis); }
    .error .control rama-icon { color: var(--rama-text-error); }
    .error .lower { color: var(--rama-text-error); }

    .disabled .upper { color: var(--rama-text-subtle); }
    .disabled .control { background: var(--rama-bg-subtle); border-color: var(--rama-border-disabled); color: var(--rama-text-disabled); cursor: not-allowed; }
    .disabled .control rama-icon { color: var(--rama-text-subtle); }
    .disabled .lower { color: var(--rama-text-disabled); }

    /* Size=Small (Figma State6..State10, 200x84): etiqueta 12/16 semibold (el asterisco sigue 14 bold), caja de 44px. */
    :host(.size-small) .upper { font-size: 12px; font-weight: var(--rama-weight-semibold); }
    :host(.size-small) .req { font-size: 14px; font-weight: var(--rama-weight-bold); }
    :host(.size-small) .control { min-height: 44px; height: 44px; padding: 0 var(--rama-space-12); font-size: 14px; line-height: 16px; }
    :host(.size-small) .lower { font-size: 12px; }

    /* Ejemplo de Figma (59677:31685 / 59677:32123): calendario de 559px, 10px debajo de la caja. */
    .panel { position: absolute; top: calc(100% + var(--rama-space-10)); left: 0; z-index: 50; }
    .panel rama-calendar { width: 559px; max-width: calc(100vw - 32px); }
  `,
})
export class RamaDatepicker {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  protected readonly id = `rama-datepicker-${nextId++}`;

  readonly mode = input<CalendarMode>('single');
  readonly label = input('');
  readonly size = input<DatepickerSize>('medium');
  readonly required = input(false);
  readonly placeholder = input('DD/MM/AAAA');
  readonly helpText = input('DD/MM/AAAA');
  readonly error = input<string>();
  readonly disabled = input(false);
  readonly min = input<Date | null>(null);
  readonly max = input<Date | null>(null);
  readonly today = input<Date>(startOfDay(new Date()));
  readonly value = model<Date | null>(null);
  readonly range = model<DateRange>({ start: null, end: null });

  readonly open = signal(false);
  readonly draft = signal<Date | null>(null);
  readonly draftRange = signal<DateRange>({ start: null, end: null });

  /** El texto de apoyo es opcional (en el ejemplo de Figma el campo mide 68px, sin texto de apoyo). */
  readonly hasHelp = computed(() => !!(this.error() || this.helpText()));

  readonly display = computed(() => {
    if (this.mode() === 'single') return formatDDMMYYYY(this.value());
    const { start, end } = this.range();
    return start ? `${formatDDMMYYYY(start)} - ${formatDDMMYYYY(end ?? start)}` : '';
  });

  toggle() { this.open() ? this.close(false) : this.openPanel(); }

  openPanel(e?: Event) {
    e?.preventDefault();
    this.draft.set(this.value());
    this.draftRange.set(this.range());
    this.open.set(true);
  }

  apply() {
    if (this.mode() === 'single') this.value.set(this.draft());
    else { const r = this.draftRange(); this.range.set({ start: r.start, end: r.end ?? r.start }); }
    this.close(true);
  }

  close(refocus: boolean) {
    if (!this.open()) return;
    this.open.set(false);
    if (refocus) this.host.nativeElement.querySelector<HTMLButtonElement>('.control')?.focus();
  }

  onDocClick(e: MouseEvent) {
    if (this.open() && !this.host.nativeElement.contains(e.target as Node)) this.close(false);
  }
}
