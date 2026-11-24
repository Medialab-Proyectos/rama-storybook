import { ChangeDetectionStrategy, Component, computed, input, model } from '@angular/core';

export interface StepperItem { label: string; }
export type StepState = 'done' | 'active' | 'pending';

/**
 * Stepper Rama · indicador de pasos de un asistente (p. ej. «Iniciar sesión» en Analoper: Datos básicos ·
 * Asistentes · Configuración agenda).
 *
 * - `current` es el índice (base 0) del paso activo; se puede usar con two-way binding `[(current)]`.
 * - Pasos anteriores = completados (círculo y línea en primario); siguientes = pendientes.
 * - Lineal por defecto (`linear = true`): solo los pasos completados se pueden pulsar para volver;
 *   los siguientes no responden. Con `linear = false` cualquier paso es navegable.
 * - `clickable = false` lo deja solo informativo.
 * Se compone solo con tokens Rama: círculo 24 px con borde medio, número 12/16 bold, etiqueta 12/16
 * (semibold en primario cuando está activa) y conector de 2 px.
 */
@Component({
  selector: 'rama-stepper',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ol class="steps" [attr.aria-label]="ariaLabel()">
      @for (s of steps(); track $index; let i = $index; let last = $last) {
        <li class="step" [class]="state(i)">
          @if (canGo(i)) {
            <button type="button" class="circle" (click)="go(i)"
              [attr.aria-label]="'Volver al paso ' + (i + 1) + ': ' + s.label">{{ i + 1 }}</button>
          } @else {
            <span class="circle" [attr.aria-current]="i === current() ? 'step' : null">{{ i + 1 }}</span>
          }
          <span class="label">{{ s.label }}</span>
        </li>
        @if (!last) { <li class="conn" [class.done]="i < current()" aria-hidden="true"></li> }
      }
    </ol>
  `,
  styles: `
    :host { display: block; font-family: var(--rama-font); }
    .steps { list-style: none; margin: 0; padding: 0; display: flex; align-items: flex-start; }
    .step { display: flex; flex-direction: column; align-items: center; gap: var(--rama-space-4); min-width: 80px; flex: none; }
    .circle {
      box-sizing: border-box; width: 24px; height: 24px; border-radius: 50%; padding: 0; margin: 0;
      display: inline-flex; align-items: center; justify-content: center;
      font: var(--rama-weight-bold) 12px/16px var(--rama-font);
      background: var(--rama-bg-default-white); color: var(--rama-text-muted);
      border: var(--rama-border-width-medium) solid var(--rama-border-default);
    }
    .done .circle, .active .circle {
      background: var(--rama-primary-fill); border-color: var(--rama-primary-fill); color: var(--rama-text-default-white);
    }
    button.circle { cursor: pointer; transition: box-shadow .15s; }
    button.circle:hover { box-shadow: 0 0 0 4px var(--rama-bg-subtle); }
    button.circle:focus-visible { outline: none; box-shadow: var(--rama-focus-ring); }
    .label { font: var(--rama-weight-regular) 12px/16px var(--rama-font); color: var(--rama-text-muted); text-align: center; }
    .active .label { font-weight: var(--rama-weight-semibold); color: var(--rama-text-primary); }
    .conn { flex: 1; min-width: var(--rama-space-16); height: 2px; margin-top: 11px; background: var(--rama-border-default); }
    .conn.done { background: var(--rama-primary-fill); }
  `,
})
export class RamaStepper {
  readonly steps = input<StepperItem[]>([]);
  /** Índice (base 0) del paso activo. */
  readonly current = model(0);
  /** Lineal: solo se vuelve a pasos ya completados. */
  readonly linear = input(true);
  /** Si es false, el stepper es solo informativo. */
  readonly clickable = input(true);
  readonly ariaLabel = input('Pasos');

  protected readonly total = computed(() => this.steps().length);

  protected state(i: number): StepState {
    const c = this.current();
    return i < c ? 'done' : i === c ? 'active' : 'pending';
  }
  protected canGo(i: number): boolean {
    if (!this.clickable() || i === this.current()) return false;
    return this.linear() ? i < this.current() : i < this.total();
  }
  protected go(i: number) { if (this.canGo(i)) this.current.set(i); }
}
