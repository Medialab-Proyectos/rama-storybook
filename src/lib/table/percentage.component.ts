import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type PercentageTone = 'yellow' | 'green' | 'red' | 'none';

/** Indicador de porcentaje con anillo de progreso (Figma: celda "Porcentage"). */
@Component({
  selector: 'rama-percentage',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="pct" role="meter" [attr.aria-valuenow]="clamped()" aria-valuemin="0" aria-valuemax="100" [attr.aria-label]="clamped() + '%'">
      <span class="num">{{ clamped() }}%</span>
      <svg width="27" height="27" viewBox="0 0 27 27" aria-hidden="true">
        <circle cx="13.5" cy="13.5" r="11.27" fill="none" stroke-width="4.5" class="track" />
        @if (clamped() > 0 && resolvedTone() !== 'none') {
          <circle cx="13.5" cy="13.5" r="11.27" fill="none" stroke-width="4.5" [class]="'bar ' + resolvedTone()"
            stroke-linecap="round" [attr.stroke-dasharray]="circumference" [attr.stroke-dashoffset]="offset()"
            transform="rotate(-90 13.5 13.5)" />
        }
      </svg>
    </span>
  `,
  styles: `
    :host { display: inline-flex; }
    .pct { display: inline-flex; align-items: center; gap: 11px; height: 32px; padding: 7px 8px; box-sizing: border-box; border-radius: var(--rama-radius-full); }
    .num { font: var(--rama-weight-semibold) 14px/16px var(--rama-font); color: var(--rama-text-default-black); }
    .track { stroke: var(--rama-neutro-on-fill); }
    /* Figma (Loading circle): trazo 4.5 sobre anillo de 27px; colores = *-fill semánticos. "None" = solo la pista. */
    .bar.yellow { stroke: var(--rama-caution-fill); }
    .bar.green { stroke: var(--rama-success-fill); }
    .bar.red { stroke: var(--rama-error-fill); }
  `,
})
export class RamaPercentage {
  readonly value = input(0);
  /** Si no se indica, se elige por umbral: < 40 rojo, < 75 amarillo, resto verde. */
  readonly tone = input<PercentageTone>();
  protected readonly circumference = 2 * Math.PI * 11.27;
  readonly clamped = computed(() => Math.max(0, Math.min(100, Math.round(this.value()))));
  readonly offset = computed(() => this.circumference * (1 - this.clamped() / 100));
  readonly resolvedTone = computed<PercentageTone>(() => {
    const t = this.tone();
    if (t) return t;
    const v = this.clamped();
    return v < 40 ? 'red' : v < 75 ? 'yellow' : 'green';
  });
}
