import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Formulario Rama (Figma: contenido "Slot" de 20 Modals · Type=Modal, p. ej. "Crear sentencia").
 * Contenedor en columna con 16px entre bloques. Dentro de un formulario las etiquetas de los campos
 * usan el color Secondary (muted) de Figma. Se adapta al ancho disponible: en contenedores angostos
 * (p. ej. modal Small de 390px) todas las secciones pasan a una sola columna.
 *
 * Bloques: `rama-form-section` (título + grilla de campos), `rama-form-divider` (línea) y cualquier
 * otro contenido (text area, `rama-card` con campos agrupados, etc.).
 */
@Component({
  selector: 'rama-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
  styles: `
    :host {
      display: flex; flex-direction: column; gap: var(--rama-space-16); container-type: inline-size; container-name: rama-form;
      font-family: var(--rama-font); --rama-field-label-color: var(--rama-text-muted);
    }
  `,
})
export class RamaForm {}

/**
 * Sección del formulario (Figma "ROW" + "Sub Row"): título 12/16 bold neutral-700 y los campos en
 * una grilla de 1 a 3 columnas, 12px entre filas y 16px entre columnas. Un hijo con el atributo
 * `full` ocupa todo el ancho.
 */
@Component({
  selector: 'rama-form-section',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[style.--fs-cols]': 'columns()' },
  template: `
    @if (title()) { <p class="title">{{ title() }}</p> }
    <div class="grid"><ng-content /></div>
  `,
  styles: `
    :host { display: flex; flex-direction: column; gap: var(--rama-space-12); min-width: 0; }
    .title { margin: 0; font: var(--rama-weight-bold) 12px/16px var(--rama-font); color: var(--rama-neutral-700); }
    .grid { display: grid; grid-template-columns: repeat(var(--fs-cols), minmax(0, 1fr)); gap: var(--rama-space-12) var(--rama-space-16); }
    .grid ::ng-deep > [full] { grid-column: 1 / -1; }
    @container rama-form (max-width: 480px) { .grid { grid-template-columns: minmax(0, 1fr); } }
  `,
})
export class RamaFormSection {
  readonly title = input<string>();
  /** Columnas de la grilla (Figma: 2 en "Información básica", 3 en las filas de la tarjeta). */
  readonly columns = input<1 | 2 | 3>(2);
}

/** Separador entre bloques del formulario: línea de 1px #EAECF0 (Figma "Line 61"). */
@Component({
  selector: 'rama-form-divider',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { role: 'separator' },
  template: ``,
  styles: `:host { display: block; height: 0; border-top: var(--rama-border-width-thin) solid var(--rama-border-default); }`,
})
export class RamaFormDivider {}
