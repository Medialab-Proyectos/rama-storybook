import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';
import { FormsModule } from '@angular/forms';
import { RamaSearchInput, SearchTreeNode } from '../../lib/search-input/search-input.component';

/** Árbol de áreas REVO en tres niveles: Gerencia (0) → Departamento (1) → Estación / Sección (2). */
const arbol: SearchTreeNode[] = [
  { value: 'gca', code: '2100', label: 'Gerencia Castilla-Apiay', children: [
    { value: 'dpto-castilla', code: '2110', label: 'Departamento Castilla', children: [
      { value: 'ec1', label: 'Estación Castilla 1' },
      { value: 'ec2', label: 'Estación Castilla 2' },
      { value: 'crudos-ec2', label: 'Sección Crudos EC2' },
    ] },
    { value: 'dpto-apiay', code: '2120', label: 'Departamento Apiay', children: [
      { value: 'apiay', label: 'Estación Apiay' },
      { value: 'suria', label: 'Estación Suria (fuera de operación)', disabled: true },
    ] },
    { value: 'coord-mantenimiento', label: 'Coordinación de Mantenimiento Castilla-Apiay' },
  ] },
  { value: 'gch', code: '2200', label: 'Gerencia Chichimene', children: [
    { value: 'dpto-chichimene', code: '2210', label: 'Departamento Chichimene', children: [
      { value: 'chichimene', label: 'Estación Chichimene' },
      { value: 'acacias', label: 'Estación Acacías' },
    ] },
  ] },
  { value: 'grb', code: '2300', label: 'Gerencia Rubiales', children: [
    { value: 'dpto-rubiales', code: '2310', label: 'Departamento Rubiales', children: [
      { value: 'cpf1', label: 'Estación CPF-1' },
      { value: 'cpf2', label: 'Estación CPF-2' },
    ] },
  ] },
  { value: 'gmm', code: '2400', label: 'Gerencia Magdalena Medio', children: [
    { value: 'casabe', label: 'Departamento Casabe' },
    { value: 'llanito', label: 'Departamento Llanito' },
  ] },
  { value: 'gor', code: '2500', label: 'Gerencia Orinoquía', children: [] },
  { value: 'ghs', code: '2600', label: 'Gerencia de HSE y Seguridad de Procesos', children: [
    { value: 'hse-crudos', label: 'Coordinación HSE Crudos' },
  ] },
  { value: 'gin', code: '2700', label: 'Gerencia de Integridad de Activos', children: [
    { value: 'integridad-llanos', label: 'Coordinación de Integridad Llanos' },
  ] },
];

type Args = RamaSearchInput & { valor: string | string[] | null };

const meta: Meta<Args> = {
  title: 'Organismos/Search input',
  component: RamaSearchInput,
  decorators: [moduleMetadata({ imports: [RamaSearchInput, FormsModule] })],
  parameters: { layout: 'padded' },
  argTypes: {
    menuType: { control: 'inline-radio', options: ['tree', 'description'] },
    menuSize: { control: 'inline-radio', options: ['medium', 'small'] },
  },
  args: {
    label: 'Área', placeholder: 'Placeholder', panelTitle: 'Seleccionar área', required: true, multiple: true, disabled: false,
    error: '', helper: '', menuType: 'tree', menuSize: 'medium', descriptionLabel: 'Descripción', valor: [],
  },
};
export default meta;

export const Playground: StoryObj<Args> = {
  render: (args) => ({
    props: { ...args, arbol },
    template: `
      <div style="width:240px;min-height:620px">
        <rama-search-input [label]="label" [placeholder]="placeholder" [panelTitle]="panelTitle" [required]="required"
          [multiple]="multiple" [disabled]="disabled" [error]="error" [helper]="helper" [tree]="arbol"
          [menuType]="menuType" [menuSize]="menuSize" [descriptionLabel]="descriptionLabel" [(ngModel)]="valor" />
        <p class="sb-lead" style="margin-top:16px;width:480px">Abre el panel, despliega una gerencia y un departamento y elige. Prueba buscar "castilla".</p>
      </div>`,
  }),
};

export const Campo: StoryObj<Args> = {
  name: 'Campo (Menu open × Select item)',
  render: () => ({
    props: { arbol },
    template: `
      <div class="sb-doc">
        <p class="sb-lead">Figma "Search input": campo de 205px. Con el menú abierto el borde pasa a primario con anillo de foco.</p>
        <div style="display:grid;grid-template-columns:repeat(2,205px);gap:32px 64px">
          <rama-search-input label="Área" [required]="true" [tree]="arbol" />
          <rama-search-input label="Área" [required]="true" [tree]="arbol" [multiple]="false" ngModel="ec2" />
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:32px;margin-top:32px;align-items:flex-start">
          <div style="width:205px"><rama-search-input label="Área" [required]="true" [staticOpen]="true" panelTitle="Seleccionar área" [tree]="arbol" [initiallyExpanded]="['gca','dpto-castilla']" /></div>
          <div style="width:205px;margin-left:300px"><rama-search-input label="Área" [required]="true" [staticOpen]="true" [multiple]="false" panelTitle="Seleccionar área" [tree]="arbol" [initiallyExpanded]="['gca','dpto-castilla']" ngModel="ec2" /></div>
        </div>
      </div>`,
  }),
};

export const SearchMenu: StoryObj<Args> = {
  name: 'Search menu (tipos y tamaños)',
  render: () => ({
    props: { arbol, multi: ['ec2'], uno: 'ec2', texto: '' },
    template: `
      <div class="sb-doc">
        <h2>Type=Search tree · Checkbox (múltiple)</h2>
        <p class="sb-lead">Carpetas en tres niveles (sangría 6 / 12 / 16 px). Medium 490px y Small 428px.</p>
        <div style="display:flex;flex-wrap:wrap;gap:32px;align-items:flex-start">
          <div style="width:490px"><rama-search-input [staticOpen]="true" panelTitle="Seleccionar área" searchPlaceholder="Buscar área" [tree]="arbol"
            [initiallyExpanded]="['gca','dpto-castilla']" [(ngModel)]="multi" /></div>
          <div style="width:428px"><rama-search-input [staticOpen]="true" menuSize="small" panelTitle="Seleccionar área" searchPlaceholder="Buscar área" [tree]="arbol"
            [initiallyExpanded]="['gca','dpto-castilla']" [(ngModel)]="multi" /></div>
        </div>
        <h2>Type=Search tree · Radio Button (simple)</h2>
        <div style="width:490px"><rama-search-input [staticOpen]="true" [multiple]="false" panelTitle="Seleccionar estación" [tree]="arbol"
          [initiallyExpanded]="['gca','dpto-castilla']" [(ngModel)]="uno" /></div>
        <h2>Type=Description</h2>
        <div style="display:flex;flex-wrap:wrap;gap:32px;align-items:flex-start">
          <div style="width:490px"><rama-search-input [staticOpen]="true" menuType="description" panelTitle="Objeto / Necesidad contractual" label=""
            [required]="true" descriptionLabel="Descripción del requerimiento" descriptionPlaceholder="Descripción breve del bien o servicio que se requiere" [(ngModel)]="texto" /></div>
          <div style="width:428px"><rama-search-input [staticOpen]="true" menuType="description" menuSize="small" panelTitle="Objeto / Necesidad contractual"
            [required]="true" descriptionLabel="Descripción del requerimiento" descriptionPlaceholder="Descripción breve del bien o servicio que se requiere" [(ngModel)]="texto" /></div>
        </div>
      </div>`,
  }),
};

export const Estados: StoryObj<Args> = {
  render: () => ({
    props: { arbol },
    template: `
      <div class="sb-doc" style="display:grid;grid-template-columns:repeat(2,220px);gap:32px 64px">
        <rama-search-input label="Con placeholder" [required]="true" [tree]="arbol" />
        <rama-search-input label="Ítem seleccionado" [required]="true" [tree]="arbol" [multiple]="false" ngModel="crudos-ec2" />
        <rama-search-input label="Error" [required]="true" [tree]="arbol" error="Selecciona un área" />
        <rama-search-input label="Deshabilitado" [required]="true" [tree]="arbol" [disabled]="true" />
      </div>`,
  }),
};

export const SeleccionSimple: StoryObj<Args> = {
  name: 'Selección simple (radio)',
  render: () => ({
    props: { arbol, valor: 'ec2' },
    template: `
      <div style="width:240px;min-height:620px">
        <rama-search-input label="Estación" panelTitle="Seleccionar estación" [required]="true" [multiple]="false" [tree]="arbol" [(ngModel)]="valor" />
      </div>`,
  }),
};

export const EstadosDelArbol: StoryObj<Args> = {
  name: 'Estados del árbol',
  render: () => ({
    props: { arbol },
    template: `
      <div class="sb-doc">
        <p class="sb-lead">Completados con tokens (no están en Figma): opción deshabilitada (Estación Suria), carpeta vacía (Gerencia Orinoquía), cargando y sin elementos.</p>
        <div style="display:flex;flex-wrap:wrap;gap:32px;align-items:flex-start">
          <div style="width:428px"><rama-search-input [staticOpen]="true" menuSize="small" panelTitle="Seleccionar área" [tree]="arbol" [initiallyExpanded]="['gca','dpto-apiay','gor']" /></div>
          <div style="width:428px"><rama-search-input [staticOpen]="true" menuSize="small" panelTitle="Seleccionar área" [tree]="[]" [loading]="true" /></div>
          <div style="width:428px"><rama-search-input [staticOpen]="true" menuSize="small" panelTitle="Seleccionar área" [tree]="[]" /></div>
        </div>
      </div>`,
  }),
};

export const Descripcion: StoryObj<Args> = {
  name: 'Descripción',
  render: () => ({
    props: { texto: '' },
    template: `
      <div style="width:240px;min-height:420px">
        <rama-search-input label="Objeto / Necesidad contractual" panelTitle="Objeto / Necesidad contractual" menuType="description" [required]="true"
          descriptionLabel="Descripción del requerimiento" descriptionPlaceholder="Descripción breve del bien o servicio que se requiere" [(ngModel)]="texto" />
      </div>`,
  }),
};
