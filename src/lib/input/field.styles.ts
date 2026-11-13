// Estilos compartidos por los campos Rama (Figma: 13 Inputs). Los usan input, textarea,
// autocomplete y search-input para que label, caja y textos de apoyo sean idénticos.
// Figma 13 Inputs · "Label" (59759:37010): Size=Medium (14/16 bold) · Small (12/16 semibold) ×
// Color=Primary (text/base/default-black) · Secondary (text/base/muted) · Disabled (text/base/subtle).
// El asterisco es siempre 14px bold text/semantic/error y el ícono de info 14px text/base/subtle.
// Lo comparten los campos (etiqueta interna) y el componente independiente rama-label.
export const LABEL_STYLES = `
  /* Sin color explícito: Primary, o lo que defina el contenedor (rama-form usa Secondary). */
  .label { display: flex; align-items: center; gap: var(--rama-space-4); font-size: 14px; line-height: 16px; font-weight: var(--rama-weight-bold); color: var(--rama-field-label-color, var(--rama-text-default-black)); }
  :host(.label-primary) .label { color: var(--rama-text-default-black); }
  :host(.label-secondary) .label { color: var(--rama-text-muted); }
  /* Ícono de info de 14px después del asterisco (Figma Label · tooltip). */
  .label-tip { display: inline-flex; color: var(--rama-text-subtle); cursor: help; }
  .req { color: var(--rama-text-error); }
  /* Color=Disabled: va después de Primary/Secondary para ganarles. */
  :host(.is-disabled) .label { color: var(--rama-text-subtle); }
  :host(.size-small) .label { font-size: 12px; line-height: 16px; font-weight: var(--rama-weight-semibold); }
  /* El asterisco de obligatorio se mantiene en 14px bold aunque la etiqueta Small sea 12px. */
  :host(.size-small) .req { font-size: 14px; font-weight: var(--rama-weight-bold); }
`;

/** Color de la etiqueta (Figma Label · Color). Disabled se aplica solo cuando el campo está deshabilitado. */
export type LabelColor = 'primary' | 'secondary';

export const FIELD_STYLES = `
  :host { display: flex; flex-direction: column; gap: var(--rama-space-4); font-family: var(--rama-font); min-width: 0; }
  ${LABEL_STYLES}
  .box {
    position: relative; display: flex; align-items: center; gap: var(--rama-space-8); min-height: 48px;
    padding: 0 var(--rama-space-20); background: var(--rama-bg-default-white);
    border: var(--rama-border-width-thin) solid var(--rama-border-inset); border-radius: var(--rama-radius-xs);
    color: var(--rama-text-muted); cursor: text; transition: border-color .15s, box-shadow .15s;
  }
  .box:focus-within, :host(.is-focus) .box { border-color: var(--rama-border-primary); box-shadow: var(--rama-focus-ring); }
  :host(.has-error) .box { border-color: var(--rama-border-error-emphasis); box-shadow: none; }
  :host(.is-disabled) .box { background: var(--rama-bg-subtle); border-color: var(--rama-border-disabled); box-shadow: none; cursor: not-allowed; color: var(--rama-text-disabled); }
  .control {
    flex: 1; min-width: 0; border: 0; outline: 0; background: transparent; padding: 0;
    font: var(--rama-weight-regular) 16px/normal var(--rama-font); color: var(--rama-text-default-black);
  }
  .control::placeholder { color: var(--rama-text-subtle); }
  .control:disabled { color: var(--rama-text-disabled); cursor: not-allowed; }
  .control:disabled::placeholder { color: var(--rama-text-disabled); }
  .lower { display: flex; justify-content: space-between; gap: var(--rama-space-16); font-size: 14px; line-height: 16px; color: var(--rama-text-subtle); }
  :host(.is-focus) .lower, :host(:focus-within) .lower, :host(.is-filled) .lower { color: var(--rama-text-muted); }
  :host(.has-error) .lower { color: var(--rama-text-error); }
  /* Estado Error: el valor se muestra en gris (text/base/subtle), como en Figma. */
  :host(.has-error) .control { color: var(--rama-text-subtle); }
  :host(.is-disabled) .lower { color: var(--rama-text-disabled); }
  .counter { margin-left: auto; text-align: right; white-space: nowrap; }
  .icon-btn { display: inline-flex; padding: 0; border: 0; background: transparent; color: inherit; cursor: pointer; border-radius: var(--rama-radius-xs); }
  .icon-btn:disabled { cursor: not-allowed; }

  /* Size=Small (Figma 13 Inputs): etiqueta 12px semibold, caja de 44px con 12px de relleno y radio 4px,
     valor 14px y textos de apoyo 12px; etiqueta, caja y textos de apoyo van a 4px (Figma 800x88 / 713x84). */
  :host(.size-small) .box { min-height: 44px; padding: 0 var(--rama-space-12); }
  :host(.size-small) .control { font-size: 14px; line-height: 16px; }
  :host(.size-small) .lower { font-size: 12px; line-height: 16px; }
`;

/** Tamaños de los campos Rama (Figma: Size=Medium · Size=Small). */
export type FieldSize = 'medium' | 'small';

let nextId = 0;
export const uniqueFieldId = (prefix: string) => `${prefix}-${++nextId}`;
