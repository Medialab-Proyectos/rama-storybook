import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';
import { RamaTableButton } from '../../lib/table/table-button.component';

const meta: Meta = {
  title: 'Átomos/Table button',
  decorators: [moduleMetadata({ imports: [RamaTableButton] })],
  parameters: { layout: 'padded' },
};
export default meta;

export const BotonesDeTabla: StoryObj = {
  name: 'Botones de tabla',
  render: () => ({
    props: {
      kinds: [
        { kind: 'primary', label: 'Ver detalle' }, { kind: 'search', label: 'Buscar' }, { kind: 'success', label: 'Aprobar' },
        { kind: 'edit', label: 'Editar' }, { kind: 'answer', label: 'Responder' }, { kind: 'error', label: 'Eliminar' },
      ],
      states: [{ label: 'Default', cls: '' }, { label: 'Hover', cls: 'is-hover' }, { label: 'Pressed', cls: 'is-pressed' }],
    },
    template: `
      <div class="sb-doc">
        <p class="sb-lead">Acciones de celda. En la columna "Acciones" se usan sin texto (solo ícono); cada tipo tiene su color. "Disabled" no existe en Figma y se completa con tokens (bg-subtle + text-disabled).</p>
        <table class="sb-table" style="width:auto">
          <thead><tr><th>Tipo</th>@for (s of states; track s.label) { <th>{{ s.label }}</th> }<th>Disabled</th><th>Solo ícono</th></tr></thead>
          <tbody>
            @for (k of kinds; track k.kind) {
              <tr><td><b>{{ k.kind }}</b></td>
                @for (s of states; track s.label) { <td><rama-table-button [class]="s.cls" [kind]="$any(k.kind)" [label]="k.label" [showArrow]="true" /></td> }
                <td><rama-table-button [kind]="$any(k.kind)" [label]="k.label" [showArrow]="true" [disabled]="true" /></td>
                <td><rama-table-button [kind]="$any(k.kind)" [ariaLabel]="k.label" /></td>
              </tr>
            }
          </tbody>
        </table>
      </div>`,
  }),
};
