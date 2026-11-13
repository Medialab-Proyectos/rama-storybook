// Formulario de ejemplo "Crear sentencia" (Figma 20 Modals · Type=Modal, slot del modal).
// Se reutiliza en la historia de Formulario y en las de Modal para que ambas muestren lo mismo.
import { RamaAutocomplete } from '../../lib/autocomplete/autocomplete.component';
import { RamaButton } from '../../lib/button/button.component';
import { RamaDatepicker } from '../../lib/calendar/datepicker.component';
import { RamaCard } from '../../lib/card/card.component';
import { RamaForm, RamaFormDivider, RamaFormSection } from '../../lib/form/form.component';
import { RamaInput } from '../../lib/input/input.component';
import { RamaTextarea } from '../../lib/input/textarea.component';

export const FORM_IMPORTS = [RamaForm, RamaFormSection, RamaFormDivider, RamaInput, RamaTextarea, RamaAutocomplete, RamaDatepicker, RamaCard, RamaButton];

export const FORM_OPTIONS = {
  decisiones: [{ value: 'fallo', label: 'Fallo de primera instancia' }, { value: 'apelacion', label: 'Apelación' }, { value: 'tutela', label: 'Tutela' }],
  entidades: [{ value: 'csj', label: 'Corte Suprema de Justicia' }, { value: 'cc', label: 'Corte Constitucional' }, { value: 'ce', label: 'Consejo de Estado' }],
  responsables: [{ value: 'juridica', label: 'Gerencia Jurídica' }, { value: 'operaciones', label: 'Gerencia de Operaciones' }],
  delegaturas: [{ value: 'd1', label: 'Delegatura de Asuntos Jurisdiccionales' }, { value: 'd2', label: 'Delegatura de Control' }],
};

export const SENTENCIA_FORM = `
  <rama-form>
    <rama-form-section title="Información básica" [columns]="2">
      <rama-input size="small" label="Número / Nombre de la sentencia" [required]="true" labelTooltip="Identificador o nombre con el que se registra la sentencia" placeholder="Número /Nombre de la sentencia" />
      <rama-input size="small" label="Radicado" [required]="true" labelTooltip="Número de radicado del proceso" placeholder="Ingresar radicado" />
      <rama-autocomplete fieldSize="small" label="Tipo de decisión" [required]="true" placeholder="Seleccionar tipo de decisión" [options]="opts.decisiones" />
      <rama-input size="small" label="Sentencia asociada" [required]="true" labelTooltip="Sentencia relacionada, si existe" placeholder="Ingresar sentencia asociada" />
      <rama-input size="small" label="Año de la sentencia" [required]="true" labelTooltip="Año en que se profirió la sentencia" placeholder="Ingresar año" />
      <rama-autocomplete fieldSize="small" label="Entidad emisora" [required]="true" placeholder="Seleccionar entidad emisora" [options]="opts.entidades" />
    </rama-form-section>
    <rama-form-divider />
    <rama-textarea size="small" label="Síntesis de fallo" [required]="true" placeholder="Enter a description..." [rows]="3" />
    <rama-card cardTitle="Ordenes">
      <rama-button card-actions variant="outlined" size="xs" leadIcon="add">Agregar</rama-button>
      <rama-form-section [columns]="3">
        <rama-input full size="small" label="Descripción de la orden de reclamación" [required]="true" labelTooltip="Qué ordena la sentencia" placeholder="Ingresar descripción de la orden" />
        <rama-autocomplete fieldSize="small" label="Responsable" [required]="true" labelTooltip="Área que debe cumplir la orden" placeholder="Seleccionar responsable" [options]="opts.responsables" />
        <rama-autocomplete fieldSize="small" label="Delegatura Responsable" [required]="true" labelTooltip="Delegatura a cargo" placeholder="Seleccionar delegadura" [options]="opts.delegaturas" />
        <rama-datepicker size="small" label="Fecha límite" [required]="true" placeholder="Seleccionar fecha" helpText="" style="width:100%" />
      </rama-form-section>
    </rama-card>
  </rama-form>`;
