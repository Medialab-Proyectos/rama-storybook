import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';
import { RamaBadge } from '../../lib/badge/badge.component';
import { RamaIcon } from '../../lib/icon/icon.component';
import { RamaTag } from '../../lib/tag/tag.component';

/** Guía de uso de la página "Tag" de Figma (Rama (3)): "Badge vs. Tag: Diferencie". */
const meta: Meta = {
  title: 'Guías/Badge vs Tag',
  decorators: [moduleMetadata({ imports: [RamaBadge, RamaTag, RamaIcon] })],
  parameters: { layout: 'padded', controls: { disable: true } },
};
export default meta;

export const Guia: StoryObj = {
  name: 'Guía de uso',
  render: () => ({
    template: `
      <div class="sb-doc bvt">
        <h2>Badge vs. Tag: en qué se diferencian</h2>
        <p class="sb-lead">Badges y Tags se parecen, pero cumplen propósitos distintos. Los <b>Badges</b> comunican un estado o
          información relevante; los <b>Tags</b> identifican, categorizan u organizan contenido.</p>

        <div class="cols">
          <section>
            <h3>Badge</h3>
            <div class="ex"><rama-badge type="success" [dot]="true">Completada</rama-badge><rama-badge type="warning" [dot]="true">Pendiente</rama-badge></div>
            <p>Componente compacto y <b>no interactivo</b> que comunica el estado, una condición o información importante asociada a un elemento.</p>
          </section>
          <section>
            <h3>Tag</h3>
            <div class="ex"><rama-tag size="small">Seguridad de procesos</rama-tag><rama-tag size="small" theme="primary" [closable]="true">Integridad</rama-tag></div>
            <p>Componente que identifica, categoriza u organiza contenido. Puede ser solo informativo o permitir acciones como seleccionar o quitar.</p>
          </section>
        </div>

        <h3 class="sec">Cuándo usar cada uno</h3>
        <div class="cols">
          <section>
            <h4>Badge</h4>
            <ul>
              <li><b>Comunicar un estado.</b> <span class="ex-inline"><rama-badge type="info" size="small">Activa</rama-badge><rama-badge type="warning" size="small">Pendiente</rama-badge><rama-badge type="success" size="small">Completada</rama-badge></span></li>
              <li><b>Resaltar información relevante.</b> <span class="ex-inline"><rama-badge type="primary" size="small">Nuevo</rama-badge><rama-badge type="caution" size="small">Destacado</rama-badge><rama-badge type="error" size="small">Urgente</rama-badge></span></li>
              <li><b>Mostrar información no interactiva.</b> <span class="ex-inline"><rama-badge type="success" size="small">Aprobada</rama-badge><rama-badge type="neutral" size="small">En revisión</rama-badge></span></li>
            </ul>
          </section>
          <section>
            <h4>Tag</h4>
            <ul>
              <li><b>Identificar categorías.</b> <span class="ex-inline"><rama-tag size="xs">Operaciones</rama-tag><rama-tag size="xs">Mantenimiento</rama-tag><rama-tag size="xs">HSE</rama-tag></span></li>
              <li><b>Organizar contenido.</b> <span class="ex-inline"><rama-tag size="xs" line="dashed">Rondas</rama-tag><rama-tag size="xs" line="dashed">Directrices</rama-tag><rama-tag size="xs" line="dashed">Contención</rama-tag></span></li>
              <li><b>Gestionar contenido:</b> agregar o quitar etiquetas asignadas. <span class="ex-inline"><rama-tag size="xs" theme="primary" [closable]="true">Estación Castilla 2</rama-tag><rama-tag size="xs" theme="primary" [closable]="true">Turno diurno</rama-tag></span></li>
            </ul>
          </section>
        </div>

        <h3 class="sec">Pautas de uso</h3>
        <div class="cols">
          <section>
            <h4>Badge</h4>
            <div class="rule do"><rama-icon name="check" [size]="24" [strokeWidth]="2" /><p><b>Sí:</b> usa badges para estados e información concisa. Mantén las etiquetas claras y los colores semánticos consistentes.</p></div>
            <div class="rule dont"><rama-icon name="x-circle" [size]="24" /><p><b>No:</b> uses badges como controles interactivos, no dependas solo del color y no recargues la interfaz con indicadores innecesarios.</p></div>
          </section>
          <section>
            <h4>Tag</h4>
            <div class="rule do"><rama-icon name="check" [size]="24" [strokeWidth]="2" /><p><b>Sí:</b> usa tags para categorizar, etiquetar u organizar contenido, con nombres de categoría cortos y reconocibles.</p></div>
            <div class="rule dont"><rama-icon name="x-circle" [size]="24" /><div><p><b>No:</b></p>
              <ul>
                <li>uses tags para comunicar estados del sistema o alertas;</li>
                <li>los hagas interactivos si el tag no tiene una acción;</li>
                <li>pongas muchos tags cuando no aportan valor ni claridad;</li>
                <li>uses tags interactivos sin estados claros de hover, foco, seleccionado y deshabilitado cuando apliquen.</li>
              </ul></div>
            </div>
          </section>
        </div>
      </div>
      <style>
        .bvt { max-width: 960px; }
        .bvt h2 { margin: 0 0 8px; font-size: 22px; }
        .bvt h3 { margin: 0 0 12px; font-size: 18px; }
        .bvt h3.sec { margin: 32px 0 12px; padding-top: 24px; border-top: 1px solid var(--rama-border-default); }
        .bvt h4 { margin: 0 0 8px; font-size: 16px; }
        .bvt .cols { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px 40px; margin-top: 16px; }
        .bvt section > p, .bvt li, .bvt .rule p { font-size: 14px; line-height: 20px; color: var(--rama-text-default-black); }
        .bvt .ex, .bvt .ex-inline { display: inline-flex; flex-wrap: wrap; gap: 8px; }
        .bvt .ex-inline { margin-top: 6px; }
        .bvt ul { margin: 0; padding-left: 18px; display: flex; flex-direction: column; gap: 12px; }
        .bvt .rule { display: flex; gap: 10px; align-items: flex-start; padding: 10px; margin-bottom: 8px; border-radius: 8px; background: var(--rama-bg-subtle); }
        .bvt .rule p { margin: 2px 0 6px; }
        .bvt .rule ul { gap: 4px; font-size: 14px; }
        .bvt .rule rama-icon { flex: none; }
        .bvt .do rama-icon { color: var(--rama-text-success); }
        .bvt .dont rama-icon { color: var(--rama-text-error); }
      </style>`,
  }),
};
