import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RamaIcon } from '../icon/icon.component';
import { FieldSize, LABEL_STYLES } from './field.styles';

/** Colores del Label de Figma, incluido Disabled (en los campos, Disabled sale solo del estado). */
export type RamaLabelColor = 'primary' | 'secondary' | 'disabled';

/**
 * Etiqueta Rama (Figma: 13 Inputs · "Label", Size=Medium/Small × Color=Primary/Secondary/Disabled),
 * con asterisco de obligatorio e ícono de info opcionales. Usa los mismos estilos que la etiqueta
 * interna de rama-input / rama-textarea / rama-autocomplete; sirve para rotular controles que no
 * traen etiqueta propia (grupos de checkbox o radio, campos a la medida). Con `for` se asocia a un
 * control por id.
 */
@Component({
  selector: 'rama-label',
  imports: [RamaIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.size-small]': "size() === 'small'",
    '[class.label-primary]': "color() === 'primary'", '[class.label-secondary]': "color() === 'secondary'", '[class.is-disabled]': "color() === 'disabled'",
  },
  template: `<label class="label" [attr.for]="for() ?? null"><ng-content />@if (required()) {<span class="req" aria-hidden="true">*</span>}@if (tooltip()) {<span class="label-tip" [title]="tooltip()" role="img" [attr.aria-label]="tooltip()"><rama-icon name="info-circle" [size]="14" /></span>}</label>`,
  styles: [`:host { display: inline-flex; font-family: var(--rama-font); min-width: 0; }`, LABEL_STYLES],
})
export class RamaLabel {
  readonly size = input<FieldSize>('medium');
  /** Sin valor: Primary, o Secondary dentro de rama-form (igual que las etiquetas de los campos). */
  readonly color = input<RamaLabelColor>();
  readonly required = input(false);
  readonly tooltip = input<string>();
  /** Id del control que rotula. */
  readonly for = input<string>();
}
