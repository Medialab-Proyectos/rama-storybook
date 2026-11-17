import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';
import { signal } from '@angular/core';
import { RamaAlert } from '../../lib/alert/alert.component';
import { RamaBadge } from '../../lib/badge/badge.component';
import { RamaButton } from '../../lib/button/button.component';
import { RamaCard } from '../../lib/card/card.component';
import { RamaCheckbox } from '../../lib/checkbox/checkbox.component';
import { RamaInput } from '../../lib/input/input.component';
import { RamaTextarea } from '../../lib/input/textarea.component';
import { RamaPanelChip } from '../../lib/side-panel/panel-chip.component';
import { RamaPanelField } from '../../lib/side-panel/panel-field.component';
import { RamaPanelSection } from '../../lib/side-panel/panel-section.component';
import { RamaSidePanel, type SidePanelWidth } from '../../lib/side-panel/side-panel.component';
import { RamaTable, type TableColumn, type TableRow } from '../../lib/table/table.component';
import { RamaUploaderButton } from '../../lib/uploader/uploader-button.component';
import { RamaUploader } from '../../lib/uploader/uploader.component';

const meta: Meta<RamaSidePanel> = {
  title: 'Organismos/Panel lateral',
  component: RamaSidePanel,
  decorators: [moduleMetadata({
    imports: [RamaSidePanel, RamaPanelSection, RamaPanelField, RamaPanelChip, RamaButton, RamaAlert, RamaCheckbox, RamaInput, RamaTextarea,
      RamaUploader, RamaUploaderButton, RamaCard, RamaBadge, RamaTable],
  })],
  parameters: { layout: 'padded' },
};
export default meta;

const TITLE = 'Revisar entrega de turno';
const DESC = 'Verifica la información registrada por el Operador Área 3.2 antes de aceptar o devolver la entrega.';

/** Campos de la entrega de turno (filas "Component 39/42/46" del Figma). */
const CAMPOS = [
  { label: '1. Puesto de trabajo', valor: 'Operador Área 3.2 · Estación Castilla 2', ok: false },
  { label: '2. Novedades operacionales', valor: 'Se ajustó la presión de descarga de la Bomba P-101 tras la alarma de VOI estándar en la ronda de las 10:00.', ok: false },
  { label: '3. Ronda asignada', valor: 'Ronda Sección Crudos EC2 – Turno A', ok: true },
  { label: '4. Tareas con desviación', valor: '2 de 18 tareas fuera de ventana operativa', ok: false, medium: false },
  { label: '5. Desviaciones corregidas', valor: '2', ok: false, medium: true },
  { label: '6. Estado de la entrega', valor: 'En revisión', ok: false, medium: true },
];

const MUCHOS = Array.from({ length: 6 }, (_, i) => ({ label: `${7 + i}. Tarea de ronda ${i + 1}`, valor: `Lectura registrada en la Bomba P-10${i + 1}`, ok: true }));

/** Contenido del cuerpo del panel (Big/Small × Scroll), reutilizado por varias historias. */
const BODY = (rows: string) => `
  <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
    <span style="font:700 14px/20px var(--rama-font);color:var(--rama-text-subtle)">Aprobado por:</span>
    <rama-panel-chip tone="purple">Supervisor de turno</rama-panel-chip>
    <rama-panel-chip tone="yellow">Coordinación</rama-panel-chip>
  </div>
  <rama-panel-section title="Detalle de la entrega: 1">
    @for (c of ${rows}; track c.label) {
      <rama-panel-field [label]="c.label" [size]="c.medium ? 'medium' : 'small'">
        <rama-checkbox field-check [(checked)]="c.ok">Validar {{ c.label }}</rama-checkbox>
        {{ c.valor }}
      </rama-panel-field>
    }
  </rama-panel-section>`;

const COMMENT = `<hr />
  <rama-textarea label="Comentario (Obligatorio)" placeholder="Ingresa un comentario..." [rows]="4" />`;

const FOOTER = `
  <rama-button panel-footer variant="outlined" size="xl" (click)="open = false">Cancelar</rama-button>
  <rama-button panel-footer size="xl" (click)="open = false">Devolver</rama-button>`;

export const Default: StoryObj<RamaSidePanel> = {
  name: 'Panel lateral',
  args: { size: 'big', side: 'right', closeOnBackdrop: true },
  argTypes: {
    size: { control: 'inline-radio', options: ['big', 'small', 'full'] },
    side: { control: 'inline-radio', options: ['right', 'left'] },
  },
  render: args => ({
    props: { ...args, open: true, campos: CAMPOS.slice(0, 4) },
    template: `
      <rama-button (click)="open = true">Abrir panel</rama-button>
      <rama-side-panel [(open)]="open" [size]="size" [side]="side" [closeOnBackdrop]="closeOnBackdrop" title="${TITLE}" description="${DESC}">
        ${BODY('campos')}
        ${COMMENT}
        ${FOOTER}
      </rama-side-panel>`,
  }),
};

export const TamanosScroll: StoryObj<RamaSidePanel> = {
  name: 'Tamaños y scroll',
  parameters: { docs: { description: { story: 'Figma "Component 185": Big (458×860) y Small (458×469), sin y con scroll. El cuerpo hace scroll cuando el contenido supera el alto; encabezado y footer quedan fijos.' } } },
  render: () => ({
    props: {
      pocos: CAMPOS.slice(0, 1),
      big: CAMPOS.slice(0, 4).map(c => ({ ...c })),
      bigScroll: [...CAMPOS, ...MUCHOS].map(c => ({ ...c })),
      smallScroll: CAMPOS.map(c => ({ ...c })),
    },
    template: `
      <div style="display:flex;flex-wrap:wrap;gap:32px;align-items:flex-start">
        <rama-side-panel mode="inline" size="big" [open]="true" title="${TITLE}" description="${DESC}">
          ${BODY('big')}${COMMENT}${FOOTER}
        </rama-side-panel>
        <rama-side-panel mode="inline" size="big" [open]="true" title="${TITLE}" description="${DESC}">
          ${BODY('bigScroll')}${COMMENT}${FOOTER}
        </rama-side-panel>
        <rama-side-panel mode="inline" size="small" [open]="true" title="${TITLE}" description="${DESC}">
          ${BODY('pocos')}${FOOTER}
        </rama-side-panel>
        <rama-side-panel mode="inline" size="small" [open]="true" title="${TITLE}" description="${DESC}">
          ${BODY('smallScroll')}${COMMENT}${FOOTER}
        </rama-side-panel>
      </div>`,
  }),
};

export const Encabezado: StoryObj<RamaSidePanel> = {
  name: 'Encabezado y footer',
  parameters: { docs: { description: { story: 'Panel/Header "Simple" (solo cierre, sin título: usa `ariaLabel`) y "with text" (título, descripción y separador). Footer "Open" con dos botones a lo ancho.' } } },
  render: () => ({
    template: `
      <div style="display:flex;flex-wrap:wrap;gap:32px;align-items:flex-start">
        <rama-side-panel mode="inline" size="small" [open]="true" ariaLabel="Filtros de rondas">
          <rama-panel-field label="Estación">Estación Castilla 2</rama-panel-field>
          <rama-panel-field label="Turno" size="medium">Turno A · 06:00 – 18:00</rama-panel-field>
          <rama-button panel-footer variant="outlined" size="xl">Limpiar</rama-button>
          <rama-button panel-footer size="xl">Aplicar</rama-button>
        </rama-side-panel>
        <rama-side-panel mode="inline" size="small" [open]="true" title="${TITLE}" description="${DESC}">
          <rama-panel-field label="Cargo que entrega">Operador Área 3.2</rama-panel-field>
          <rama-panel-field label="Cargo que recibe">Supervisor de turno</rama-panel-field>
          <rama-button panel-footer variant="outlined" size="xl">Cancelar</rama-button>
          <rama-button panel-footer size="xl">Devolver</rama-button>
        </rama-side-panel>
      </div>`,
  }),
};

export const TiposContenido: StoryObj<RamaPanelSection> = {
  name: 'Tipos de contenido',
  parameters: { docs: { description: { story: 'Figma "Component 188": Stroke/Content (caja con borde), Outline/Content (encabezado clave: valor sin borde, valor con scroll interno) y Acordeón (botón con `aria-expanded`; hover, foco y deshabilitado completados con tokens).' } } },
  render: () => ({
    props: { campos: CAMPOS.map(c => ({ ...c })), abierto: true },
    template: `
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,417px),1fr));gap:32px;align-items:start;max-width:1340px">
        <rama-panel-section type="stroke" title="Detalle de la entrega: 1">
          @for (c of campos; track c.label) {
            <rama-panel-field [label]="c.label" [size]="c.medium ? 'medium' : 'small'">
              <rama-checkbox field-check [(checked)]="c.ok">Validar {{ c.label }}</rama-checkbox>
              {{ c.valor }}
            </rama-panel-field>
          }
        </rama-panel-section>
        <rama-panel-section type="outline" title="Estado:" value="Devuelto por el Supervisor de turno">
          <rama-panel-field label="Comentario de la devolución." [maxHeight]="87">
            Falta registrar la lectura de presión de succión de la Bomba P-101 en la ronda de las 14:00. Completa la tarea pendiente
            y adjunta la evidencia fotográfica de la corrección de la desviación antes de volver a enviar la entrega de turno.
            Recuerda validar la ventana operativa con la Coordinación de la Estación Castilla 2.
          </rama-panel-field>
        </rama-panel-section>
        <div style="display:flex;flex-direction:column;gap:16px">
          <rama-panel-section type="accordion" title="Evidencias de la ronda" counter="(3/3 documentos cargados)" [(expanded)]="abierto">
            <rama-uploader-button state="success" [showSuccessNotice]="false" fileName="Evidencia_bomba_P-101_EC2.pdf" />
            <rama-uploader-button state="success" [showSuccessNotice]="false" fileName="Lecturas_tanque_T-203_EC2.pdf" />
            <rama-uploader-button state="success" [showSuccessNotice]="false" fileName="Acta_entrega_turno_A.pdf" />
          </rama-panel-section>
          <rama-panel-section type="accordion" title="Documentos de planeación" counter="(0/3 documentos cargados)" [expanded]="false" />
          <rama-panel-section type="accordion" title="Anexos (deshabilitado)" [expanded]="false" [disabled]="true" />
        </div>
      </div>`,
  }),
};

export const ContenidoPanel: StoryObj<RamaSidePanel> = {
  name: 'Componentes dentro del panel',
  parameters: { docs: { description: { story: 'Componentes reutilizados dentro del panel: alertas compactas, checkbox, input, campo deshabilitado, textarea con error y uploader.' } } },
  render: () => ({
    template: `
      <rama-side-panel mode="inline" size="full" [open]="true" title="Adjuntar soportes de la ronda" description="Sube las evidencias de la ronda de la Estación Castilla 2 antes de enviar la entrega de turno.">
        <rama-alert variant="compact" state="error" title="Por favor, selecciona los ítems de la entrega por los cuales la devuelves." />
        <rama-alert variant="compact" state="information" title="Necesitarás el número de la orden de trabajo generada en el sistema para ingresarlo aquí." />
        <rama-alert variant="compact" state="success" title="Documento se ha cargado con éxito." />
        <div style="display:flex;gap:24px;flex-wrap:wrap">
          <rama-checkbox>Por defecto</rama-checkbox>
          <rama-checkbox [checked]="true">Seleccionado</rama-checkbox>
          <rama-checkbox class="is-focus">Foco</rama-checkbox>
          <rama-checkbox [disabled]="true">Deshabilitado</rama-checkbox>
        </div>
        <rama-input label="Orden de trabajo" placeholder="Número de la orden" size="small" />
        <rama-panel-field label="5. Sección" size="medium">Sección Crudos EC2</rama-panel-field>
        <rama-textarea label="Comentario (Obligatorio)" placeholder="Ingresa un comentario..." [rows]="5" error="Por favor ingresa un comentario" />
        <rama-uploader [fullWidth]="true" label="Sube uno o varios documentos" />
        <rama-uploader-button label="Evidencia de la ronda (Obligatorio)" />
        <rama-uploader-button state="success" fileName="Evidencia_bomba_P-101_EC2.pdf" />
        <rama-button panel-footer variant="outlined" size="xl">Cancelar</rama-button>
        <rama-button panel-footer size="xl">Enviar</rama-button>
      </rama-side-panel>`,
  }),
};

/* ───────────── Patrón REVO "Mis responsabilidades": panel sin fondo junto al dashboard ───────────── */

interface Registro extends TableRow { id: string; titulo: string; detalle: string; estado: string; }
interface Responsabilidad {
  id: string; nombre: string; resumen: string; pendientes: number; badge: 'primary' | 'warning' | 'error' | 'info' | 'success';
  ancho: SidePanelWidth; ampliado?: boolean; contexto: string; registros: Registro[];
}

const COLS: TableColumn[] = [
  { key: 'titulo', header: 'Registro', minWidth: 220 },
  { key: 'detalle', header: 'Detalle', minWidth: 180 },
  { key: 'estado', header: 'Estado', type: 'tag', width: 150,
    tagTypes: { Activa: 'error', 'En reparación': 'warning', Controlada: 'success', 'Por documentar': 'warning', Abierto: 'error', 'En proceso': 'info', 'Por realizar': 'primary' } },
];

const RESPONSABILIDADES: Responsabilidad[] = [
  { id: 'contencion', nombre: 'Registro de contención primaria', resumen: 'Fugas activas en la Estación Castilla 2', pendientes: 3, badge: 'error', ancho: 'm',
    contexto: 'Disponibilidad del equipo: 96 % · VOI estándar: 1 violación en el turno.',
    registros: [
      { id: 'f1', titulo: 'Fuga en válvula V-301 · Área 3.2', detalle: 'Goteo · Crudo', estado: 'Activa' },
      { id: 'f2', titulo: 'Fuga en brida de la Bomba P-101 · Área 3.2', detalle: 'Rezumado · Agua de producción', estado: 'Activa' },
      { id: 'f3', titulo: 'Fuga en línea de descarga del Tanque T-203', detalle: 'Chorro · Crudo', estado: 'En reparación' },
      { id: 'f4', titulo: 'Fuga en sello del Compresor K-102 · Área 3.1', detalle: 'Goteo · Gas', estado: 'Controlada' },
    ] },
  { id: 'entrega', nombre: 'Entrega de turno por documentar', resumen: 'Turno A · Sección Crudos EC2', pendientes: 2, badge: 'warning', ancho: 'm',
    contexto: 'Resumen del turno: 2 violaciones VOI · 1 equipo no disponible · 5 de 6 rondas completadas · 1 NCR abierto.',
    registros: [
      { id: 'e1', titulo: 'Entrega Turno A · Operador Área 3.2', detalle: 'Ronda Sección Crudos EC2 – Turno A', estado: 'Por documentar' },
      { id: 'e2', titulo: 'Entrega Turno A · Operador Área 3.1', detalle: 'Ronda Área 3.1 – Turno A', estado: 'Por documentar' },
    ] },
  { id: 'ncr', nombre: 'NCR e incidentes', resumen: 'Abiertos, en proceso y vencidos', pendientes: 3, badge: 'info', ancho: 'm',
    contexto: 'Valor, ventana VOI y tendencia del equipo seleccionado.',
    registros: [
      { id: 'n1', titulo: 'NCR-0412 · Presión de descarga P-101 fuera de ventana', detalle: 'Supervisor de turno', estado: 'Abierto' },
      { id: 'n2', titulo: 'NCR-0415 · Nivel alto del Tanque T-203', detalle: 'Operador Área 3.2', estado: 'En proceso' },
      { id: 'n3', titulo: 'NCR-0419 · Temperatura de sello del Compresor K-102', detalle: 'Operador Área 3.1', estado: 'Abierto' },
    ] },
  { id: 'rondas', nombre: 'Rondas por realizar', resumen: 'Se abre ya ampliado', pendientes: 2, badge: 'primary', ancho: 'm', ampliado: true,
    contexto: 'Última lectura de cada tarea de la ronda.',
    registros: [
      { id: 'r1', titulo: 'Ronda Sección Crudos EC2 – Turno A', detalle: '18 tareas · 06:00 – 10:00', estado: 'Por realizar' },
      { id: 'r2', titulo: 'Ronda Área 3.2 – Turno A', detalle: '12 tareas · 10:00 – 14:00', estado: 'Por realizar' },
    ] },
];

/** Estado de la composición (signals: el dashboard reacciona sin depender de zone.js). */
function crearEstado() {
  const resps = signal(RESPONSABILIDADES.map(r => ({ ...r, registros: r.registros.map(x => ({ ...x })) })));
  const open = signal(false);
  const sel = signal<Responsabilidad | null>(null);
  const nivel = signal<1 | 2>(1);
  const idx = signal(0);
  const ampliado = signal(false);
  const reserva = signal(0);
  const fila = signal<HTMLElement | null>(null);
  const aviso = signal<string | null>(null);
  let timer: ReturnType<typeof setTimeout> | undefined;
  const programarAviso = (ms = 4000) => { clearTimeout(timer); timer = setTimeout(() => aviso.set(null), ms); };
  return {
    resps, open, sel, nivel, idx, ampliado, reserva, fila, aviso, cols: COLS,
    abrir(r: Responsabilidad, el: EventTarget | null) {
      fila.set(el as HTMLElement);
      sel.set(r); nivel.set(1); idx.set(0); ampliado.set(!!r.ampliado); open.set(true);
    },
    verRegistro(row: TableRow) {
      const r = sel(); if (!r) return;
      idx.set(Math.max(0, r.registros.findIndex(x => x.id === row['id']))); nivel.set(2);
    },
    volver() { nivel.set(1); },
    mover(d: number) { const r = sel(); if (r) idx.set(Math.min(r.registros.length - 1, Math.max(0, idx() + d))); },
    registro() { const r = sel(); return r ? r.registros[idx()] : null; },
    guardar() {
      const r = sel(); const reg = r?.registros[idx()]; if (!r || !reg) return;
      resps.update(list => list.map(x => (x.id === r.id ? { ...x, pendientes: Math.max(0, x.pendientes - 1) } : x)));
      sel.set(resps().find(x => x.id === r.id) ?? null);
      aviso.set(`Registro guardado: ${reg.titulo}`); programarAviso();
      nivel.set(1);
    },
    deshacer() { aviso.set(null); clearTimeout(timer); },
    pausarAviso() { clearTimeout(timer); },
    reanudarAviso() { if (aviso()) programarAviso(2000); },
    cerrado() { nivel.set(1); },
  };
}

/** Contenido de los dos niveles (listado → documento) y footer, para la historia del patrón. */
const NIVELES = `
  @if (sel(); as r) {
    <rama-alert variant="compact" state="information" [dismissible]="false" title="Contexto del dashboard">{{ r.contexto }}</rama-alert>
    @if (nivel() === 1) {
      <rama-table [columns]="cols" [rows]="r.registros" [actions]="['primary']" [actionLabels]="{ primary: 'Abrir registro' }"
        [caption]="r.nombre" (action)="verRegistro($event.row)" />
    } @else {
      @if (registro(); as reg) {
        <rama-panel-section type="stroke" title="Datos del registro">
          <rama-panel-field label="Registro">{{ reg.titulo }}</rama-panel-field>
          <rama-panel-field label="Detalle">{{ reg.detalle }}</rama-panel-field>
          <rama-panel-field label="Estado" size="medium">{{ reg.estado }}</rama-panel-field>
          <rama-panel-field label="Cargo responsable">Supervisor de turno</rama-panel-field>
        </rama-panel-section>
        <rama-textarea label="Observaciones" placeholder="Describe la acción tomada..." [rows]="4" />
      }
    }
  }
  @if (nivel() === 2) {
    <!-- Dentro de un bloque @if, el footer se proyecta con ngProjectAs (un solo nodo raíz). -->
    <ng-container ngProjectAs="[panel-footer]">
      <rama-button variant="outlined" size="xl" (click)="volver()">Cancelar</rama-button>
      <rama-button size="xl" (click)="guardar()">Guardar</rama-button>
    </ng-container>
  }`;

/** Aviso flotante: alerta compacta existente (rama-alert) posicionada abajo a la izquierda. */
const AVISO = `
  @if (aviso(); as texto) {
    <div class="aviso-flotante" style="position:fixed;left:16px;bottom:16px;z-index:500;width:min(420px,calc(100vw - 32px));box-shadow:var(--rama-shadow-large);border-radius:14px"
      (mouseenter)="pausarAviso()" (mouseleave)="reanudarAviso()" (focusin)="pausarAviso()" (focusout)="reanudarAviso()">
      <rama-alert variant="compact" state="success" title="Cambios guardados" closeLabel="Cerrar aviso" (closed)="deshacer()">
        {{ texto }} · <rama-button variant="ghost" size="xs" (click)="deshacer()">Deshacer</rama-button>
      </rama-alert>
    </div>
  }`;

const KPI = 'font:700 32px/40px var(--rama-font);color:var(--rama-text-default-black)';

export const JuntoAlDashboard: StoryObj<RamaSidePanel> = {
  name: 'Junto al dashboard (sin fondo)',
  parameters: {
    layout: 'fullscreen',
    docs: { description: { story: [
      '`mode="docked"`: panel pegado a la derecha, a todo el alto, **sin fondo** (role="dialog" aria-modal="false"; no atrapa el foco).',
      'El dashboard sigue activo y con scroll. El panel **no mueve la página**: emite `dockedWidth` (px a reservar; 0 si está cerrado o si el viewport mide menos de 1280px) y la página lo usa como `margin-right`.',
      'Desde 1280px el dashboard se angosta; por debajo el panel queda encima; por debajo de 768px es una hoja a pantalla completa.',
      'Nivel 1 = listado de la responsabilidad (título + ⤢ + ✕); nivel 2 = documento ("← listado" + ‹ › + ⤢ + ✕). Esc cierra y el foco vuelve a la fila (`returnFocus`).',
      'El aviso al guardar es la alerta compacta existente (`rama-alert variant="compact"`) posicionada como aviso flotante (4 s, se pausa con hover/foco).',
      '```html\n<main [style.margin-right.px]="reserva()">…</main>\n<rama-side-panel mode="docked" [(open)]="open" panelWidth="m" [expandable]="true" [(expanded)]="ampliado"\n  [returnFocus]="fila" (dockedWidth)="reserva.set($event)" … />\n```',
    ].join('\n\n') } },
  },
  render: () => ({
    props: { ...crearEstado(), kpi: KPI },
    template: `
      <div class="dashboard" [style.margin-right.px]="reserva()" style="transition:margin-right .2s ease-out;min-height:100vh;box-sizing:border-box;padding:24px 16px;background:var(--rama-bg-subtle);font-family:var(--rama-font)">
        <h1 style="margin:0 0 4px;font:700 24px/32px var(--rama-font);color:var(--rama-text-default-black)">Dashboard · Estación Castilla 2</h1>
        <p style="margin:0 0 24px;font:400 14px/20px var(--rama-font);color:var(--rama-text-subtle)">Supervisor de turno · Turno A · Sección Crudos EC2</p>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,220px),1fr));gap:16px;margin-bottom:24px">
          <rama-card cardTitle="Cumplimiento del turno" info="Rondas"><strong [style]="kpi">92 %</strong></rama-card>
          <rama-card cardTitle="Violaciones VOI críticas" info="Turno A"><strong [style]="kpi">2</strong></rama-card>
          <rama-card cardTitle="Fugas activas" info="Contención primaria"><strong [style]="kpi">{{ resps()[0].pendientes }}</strong></rama-card>
          <rama-card cardTitle="Acciones de Análisis Operacional" info="Abiertas"><strong [style]="kpi">5</strong></rama-card>
        </div>
        <rama-card cardTitle="Mis responsabilidades" size="large" info="Clic en una fila para abrirla en el panel">
          <div style="display:flex;flex-direction:column;gap:8px">
            @for (r of resps(); track r.id) {
              <rama-card [interactive]="true" [cardTitle]="r.nombre" [info]="r.resumen" [class.is-hover]="open() && sel()?.id === r.id"
                role="button" [attr.aria-pressed]="open() && sel()?.id === r.id" [attr.data-resp]="r.id"
                (click)="abrir(r, $event.currentTarget)" (keydown.enter)="abrir(r, $event.currentTarget)" (keydown.space)="$event.preventDefault(); abrir(r, $event.currentTarget)">
                <rama-badge card-actions [type]="r.badge" [count]="r.pendientes">pendientes</rama-badge>
              </rama-card>
            }
          </div>
        </rama-card>
        <div style="height:24px"></div>
        <rama-card cardTitle="Rondas de la semana (contenido para probar el scroll)" size="large">
          <div style="display:flex;flex-direction:column">
            @for (d of [1,2,3,4,5,6,7,8,9,10,11,12]; track d) {
              <div style="display:flex;justify-content:space-between;align-items:center;gap:16px;padding:12px 0;border-bottom:1px solid var(--rama-border-inset);font:400 14px/20px var(--rama-font)">
                <span>Ronda Sección Crudos EC2 – día {{ d }}</span><rama-badge [type]="d % 4 ? 'success' : 'warning'">{{ d % 4 ? 'Completada' : 'Cortada' }}</rama-badge>
              </div>
            }
          </div>
        </rama-card>
      </div>

      <rama-side-panel mode="docked" [(open)]="open" panelWidth="m" [expandable]="true" [(expanded)]="ampliado"
        [returnFocus]="fila()" (dockedWidth)="reserva.set($event)" (closed)="cerrado()"
        [title]="nivel() === 2 ? (registro()?.titulo ?? '') : (sel()?.nombre ?? '')"
        [backLabel]="nivel() === 2 ? sel()?.nombre : undefined" (back)="volver()"
        [showPager]="nivel() === 2" [hasPrev]="idx() > 0" [hasNext]="idx() < (sel()?.registros?.length ?? 1) - 1"
        [pagerText]="(idx() + 1) + ' de ' + (sel()?.registros?.length ?? 0)" (prev)="mover(-1)" (next)="mover(1)">
        ${NIVELES}
      </rama-side-panel>
      ${AVISO}`,
  }),
};

export const AnchosSML: StoryObj<RamaSidePanel> = {
  name: 'Anchos S / M / L',
  parameters: { docs: { description: { story: '`panelWidth`: **S 458px** (detalle solo lectura), **M 720px** (formulario de una entidad), **L 960px** (entrega de turno, bandejas). Gana sobre `width` (que sigue funcionando). **En REVO todas las responsabilidades usan el mismo ancho, M (720px), por consistencia; para contenido más ancho se usa Ampliar.** Con `expandable` + `expanded` el panel ocupa todo el ancho disponible. Sin token de tamaño en Rama: los px están documentados en el componente. Los botones abren cada ancho en modo `docked`.' } } },
  render: () => {
    const open = signal(false);
    const ancho = signal<SidePanelWidth>('s');
    return {
      props: { open, ancho, ampliado: signal(false), abrir: (w: SidePanelWidth) => { ancho.set(w); open.set(true); } },
      template: `
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:24px">
          <rama-button variant="outlined" (click)="abrir('s')">Abrir S (458)</rama-button>
          <rama-button variant="outlined" (click)="abrir('m')">Abrir M (720)</rama-button>
          <rama-button variant="outlined" (click)="abrir('l')">Abrir L (960)</rama-button>
        </div>
        <div style="display:flex;flex-direction:column;gap:32px;align-items:flex-start">
          <rama-side-panel mode="inline" size="small" panelWidth="s" [open]="true" [closable]="false" title="S · Cumplimiento de rondas del turno" description="Detalle de solo lectura (KPI).">
            <rama-panel-field label="Cumplimiento">92 % · 11 de 12 rondas</rama-panel-field>
          </rama-side-panel>
          <rama-side-panel mode="inline" size="small" panelWidth="m" [open]="true" [closable]="false" title="M · Registro de contención primaria" description="Formulario de una entidad.">
            <rama-panel-field label="Registro">Fuga en válvula V-301 · Área 3.2</rama-panel-field>
          </rama-side-panel>
          <rama-side-panel mode="inline" size="small" panelWidth="l" [open]="true" [closable]="false" title="L · Entrega de turno por documentar" description="Entrega de turno y bandejas (lista + detalle).">
            <rama-panel-field label="Resumen del turno">2 violaciones VOI · 1 equipo no disponible · 5 de 6 rondas completadas</rama-panel-field>
          </rama-side-panel>
        </div>
        <rama-side-panel mode="docked" [(open)]="open" [panelWidth]="ancho()" [expandable]="true" [(expanded)]="ampliado"
          [title]="'Panel ' + ancho().toUpperCase()" description="Panel sin fondo: la página sigue activa.">
          <rama-panel-field label="Ancho">{{ ampliado() ? 'Ampliado: todo el ancho' : (ancho() === 's' ? '458 px' : ancho() === 'm' ? '720 px' : '960 px') }}</rama-panel-field>
        </rama-side-panel>`,
    };
  },
};

export const EncabezadoNavegacion: StoryObj<RamaSidePanel> = {
  name: 'Encabezado con Volver y anterior/siguiente',
  parameters: { docs: { description: { story: 'Navegación interna de máximo 2 niveles, sin miga de pan. **Nivel 1** (listado): título de la responsabilidad + ⤢ Ampliar + ✕. **Nivel 2** (documento): `backLabel` muestra "← {listado}" (emite `back`), `showPager` muestra ‹ › (emiten `prev`/`next`, deshabilitados con `hasPrev`/`hasNext`) y `pagerText` el "n de N". Botones con hover `bg-subtle`, foco `--rama-focus-ring` y deshabilitado `text-disabled` (no están en Figma).' } } },
  render: () => {
    const fugas = RESPONSABILIDADES[0].registros;
    return {
      props: { fugas, idx: signal(0), log: signal('') },
      template: `
        <div style="display:flex;flex-wrap:wrap;gap:32px;align-items:flex-start">
          <rama-side-panel mode="inline" size="small" [open]="true" [expandable]="true" title="Registro de contención primaria" description="Nivel 1 · listado de fugas.">
            @for (f of fugas; track f.id) { <rama-panel-field [label]="f.estado">{{ f.titulo }}</rama-panel-field> }
          </rama-side-panel>
          <rama-side-panel mode="inline" size="small" [open]="true" [expandable]="true"
            [title]="fugas[idx()].titulo" backLabel="Registro de contención primaria" (back)="log.set('back')"
            [showPager]="true" [hasPrev]="idx() > 0" [hasNext]="idx() < fugas.length - 1" [pagerText]="(idx() + 1) + ' de ' + fugas.length"
            (prev)="idx.set(idx() - 1); log.set('prev')" (next)="idx.set(idx() + 1); log.set('next')">
            <rama-panel-field label="Detalle">{{ fugas[idx()].detalle }}</rama-panel-field>
            <rama-panel-field label="Estado" size="medium">{{ fugas[idx()].estado }}</rama-panel-field>
            @if (log()) { <p style="margin:0;font:400 14px/20px var(--rama-font);color:var(--rama-text-subtle)">Último evento: <code>{{ log() }}</code></p> }
          </rama-side-panel>
        </div>`,
    };
  },
};
