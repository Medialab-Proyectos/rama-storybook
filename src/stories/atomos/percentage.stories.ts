import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';
import { RamaPercentage } from '../../lib/table/percentage.component';

const meta: Meta = {
  title: 'Átomos/Porcentaje',
  decorators: [moduleMetadata({ imports: [RamaPercentage] })],
  parameters: { layout: 'padded' },
};
export default meta;

export const Porcentaje: StoryObj = {
  name: 'Tonos (Figma "Porcentage")',
  render: () => ({
    template: `
      <div class="sb-doc" style="display:flex;gap:24px;align-items:center">
        <rama-percentage [value]="44" tone="yellow" />
        <rama-percentage [value]="91" tone="green" />
        <rama-percentage [value]="16" tone="red" />
        <rama-percentage [value]="0" tone="none" />
      </div>`,
  }),
};
