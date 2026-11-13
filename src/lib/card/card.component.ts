import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type CardSize = 'small' | 'large';

/**
 * Card Rama (Figma "Rama (3)" › Cards › set "Card"). Cabecera (título a la izquierda; texto de
 * información y acciones a la derecha, separados 8px) y un slot libre (contenido proyectado).
 * Las variantes del set solo cambian el ancho (555, 848, 1141, 1435 y 1728 px, en pasos de
 * ~293 px = columna + gutter de la grilla), así que el ancho lo pone el contenedor. Desde la variante 3 (1141 px)
 * el título pasa a Semi Bold 16 (`size="large"`); en las angostas es Bold 14/16 (`small`).
 * Las acciones (botón "Agregar" + ícono) se proyectan con el atributo `card-actions`.
 * Con `interactive` la tarjeta es enfocable y tiene hover/focus; `disabled` la deshabilita.
 * Figma rotula Hover/Focus/Disabled pero no los dibuja: se completaron con tokens
 * (sombra small + borde primario, `--rama-focus-ring`, bg-subtle/border-disabled/text-disabled).
 */
@Component({
  selector: 'rama-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.tabindex]': 'interactive() && !disabled() ? 0 : null',
    '[attr.aria-disabled]': 'disabled() || null',
    '[class.interactive]': 'interactive()',
    '[class.disabled]': 'disabled()',
    '[class.large]': 'size() === "large"',
  },
  template: `
    <div class="top" [class.empty]="!cardTitle() && !info()">
      <span class="title">{{ cardTitle() }}</span>
      <span class="actions">
        @if (info()) { <span class="info">{{ info() }}</span> }
        <ng-content select="[card-actions]" />
      </span>
    </div>
    <div class="slot" [attr.inert]="disabled() || null"><ng-content /></div>
  `,
  styles: `
    :host {
      display: flex; flex-direction: column; gap: var(--rama-space-16); padding: var(--rama-space-12);
      background: var(--rama-bg-default-white); border: var(--rama-border-width-thin) solid var(--rama-border-inset);
      border-radius: var(--rama-radius-medium); box-shadow: var(--rama-shadow-x-small); overflow: hidden;
      font-family: var(--rama-font); color: var(--rama-text-muted); min-width: 0;
      transition: box-shadow .15s, border-color .15s, background-color .15s;
    }
    .top { display: flex; align-items: center; justify-content: space-between; gap: var(--rama-space-8) var(--rama-space-16); flex-wrap: wrap; }
    .title { min-width: 0; font-size: 14px; line-height: 16px; font-weight: var(--rama-weight-bold); letter-spacing: 0; }
    :host(.large) .title { font-size: 16px; line-height: normal; font-weight: var(--rama-weight-semibold); letter-spacing: -0.32px; }
    .info { font-size: 14px; line-height: 16px; font-weight: var(--rama-weight-regular); white-space: nowrap; }
    .actions { display: inline-flex; align-items: center; gap: var(--rama-space-8); margin-left: auto; }
    .top.empty:not(:has([card-actions])) { display: none; }
    .slot:empty { display: none; }

    /* Estados (completados con tokens: Figma solo los rotula). */
    :host(.interactive) { cursor: pointer; }
    :host(.interactive:hover), :host(.is-hover) { box-shadow: var(--rama-shadow-small); border-color: var(--rama-border-primary); }
    :host(.interactive:focus-visible), :host(.is-focus) { outline: none; box-shadow: var(--rama-focus-ring); border-color: var(--rama-border-primary); }
    :host(.disabled) {
      cursor: not-allowed; box-shadow: none; background: var(--rama-bg-subtle);
      border-color: var(--rama-border-disabled); color: var(--rama-text-disabled);
    }
    :host(.disabled) .slot { filter: grayscale(1); opacity: .6; }
  `,
})
export class RamaCard {
  readonly cardTitle = input<string>();
  readonly info = input<string>();
  /** `small`: título Bold 14/16 (variantes 555 y 848). `large`: Semi Bold 16 (1141 en adelante). */
  readonly size = input<CardSize>('small');
  readonly interactive = input(false);
  readonly disabled = input(false);
}
