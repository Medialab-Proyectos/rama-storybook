import { ChangeDetectionStrategy, Component, ElementRef, effect, input, model, output, viewChild } from '@angular/core';
import { RamaIcon } from '../icon/icon.component';
import { DialogFocus } from '../modal/dialog-focus';

export interface LegacyNavColumn { title: string; items: string[]; }

/**
 * Menú lateral · versión actual (drawer global de la plataforma, tal como está en el wireframe
 * "Dashboard de gestión por rol"). Panel que entra desde la izquierda con fondo atenuado:
 * encabezado "Menú", columna de módulos (270px, con punto) y el submenú del módulo activo con
 * "Página inicial / Mis responsabilidades", columnas de enlaces y enlaces finales.
 * Convive con `rama-sidebar` (versión nueva de Figma "[NEW]").
 */
@Component({
  selector: 'rama-sidebar-legacy',
  imports: [RamaIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(document:keydown.escape)': 'open() && close()' },
  template: `
    <div class="scrim" [class.open]="open()" (click)="close()">
      <aside #drawer class="drawer" role="dialog" aria-modal="true" aria-label="Menú" tabindex="-1"
        (click)="$event.stopPropagation()" (keydown)="onKeydown($event)">
        <div class="head">
          <span class="title">{{ title() }}</span>
          <button type="button" class="close" data-dialog-close aria-label="Cerrar" (click)="close()"><rama-icon name="x" [size]="16" [strokeWidth]="2" /></button>
        </div>
        <div class="body">
          <nav class="modules" aria-label="Módulos">
            @for (m of modules(); track m) {
              <button type="button" class="module" [class.active]="m === activeModule()" [attr.aria-current]="m === activeModule() ? 'true' : null"
                (click)="activeModule.set(m)">
                <svg width="15" height="15" viewBox="0 0 16 16" stroke="currentColor" stroke-width="1.6" fill="none" aria-hidden="true"><circle cx="8" cy="8" r="3"/></svg>
                <span>{{ m }}</span>
              </button>
            }
          </nav>
          <div class="flyout">
            <div class="top-links">
              @for (l of topLinks(); track l) {
                <a class="top-link" [class.active]="l === activeLink()" (click)="activeLink.set(l); linkClick.emit({ section: '', item: l })">{{ l }}</a>
              }
            </div>
            <div class="columns">
              @for (col of columns(); track col.title) {
                <div class="section">
                  <h4>{{ col.title }}</h4>
                  <ul>
                    @for (it of col.items; track $index) { <li><a (click)="linkClick.emit({ section: col.title, item: it })">{{ it }}</a></li> }
                  </ul>
                </div>
              }
            </div>
            @if (bottomLinks().length) {
              <div class="top-links bottom">
                @for (l of bottomLinks(); track l) { <a class="top-link" (click)="linkClick.emit({ section: '', item: l })">{{ l }}</a> }
              </div>
            }
          </div>
        </div>
      </aside>
    </div>
  `,
  styles: `
    /* Valores del wireframe: fondo atenuado rgba(22,22,22,.4), módulo activo en --primary y hover de enlaces en --primary-dark. */
    .scrim { position: fixed; inset: 0; z-index: 300; background: rgba(22, 22, 22, .4); visibility: hidden; opacity: 0; transition: opacity .2s, visibility .2s; }
    .scrim.open { visibility: visible; opacity: 1; }
    .drawer { position: fixed; top: 0; left: 0; bottom: 0; max-width: 95vw; display: flex; flex-direction: column; background: var(--rama-bg-default-white);
      box-shadow: var(--rama-shadow-2x-large); outline: none; font-family: var(--rama-font); transform: translateX(-100%); transition: transform .2s; }
    .scrim.open .drawer { transform: translateX(0); }
    .head { position: sticky; top: 0; display: flex; align-items: center; justify-content: space-between; padding: var(--rama-space-16) var(--rama-space-20);
      background: var(--rama-bg-default-white); border-bottom: var(--rama-border-width-thin) solid var(--rama-border-default); }
    .title { font-size: 17px; font-weight: var(--rama-weight-bold); color: var(--rama-text-default-black); }
    .close { display: flex; padding: 6px; border: 0; border-radius: 50%; background: transparent; color: var(--rama-text-muted); cursor: pointer; }
    .close:hover { background: var(--rama-bg-subtle); }
    .body { display: flex; overflow: hidden; height: calc(100vh - 61px); }
    .modules { width: 270px; flex: none; overflow-y: auto; box-sizing: border-box; padding: var(--rama-space-12) 10px;
      border-right: var(--rama-border-width-thin) solid var(--rama-border-default); }
    .module { display: flex; align-items: center; gap: 10px; width: 100%; margin-bottom: 2px; padding: 10px 14px; box-sizing: border-box;
      border: var(--rama-border-width-thin) solid transparent; border-radius: var(--rama-radius-small); background: transparent; cursor: pointer;
      font: 13.5px var(--rama-font); color: var(--rama-text-default-black); text-align: left; }
    .module:hover { background: var(--rama-bg-subtle); border-color: var(--rama-border-inset); }
    .module.active { background: var(--rama-primary-300); border-color: transparent; color: var(--rama-text-default-white); font-weight: var(--rama-weight-bold); }
    .module svg { flex: none; }
    .flyout { flex: 1; overflow-y: auto; padding: var(--rama-space-20) var(--rama-space-24); }
    .top-links { display: flex; flex-wrap: wrap; gap: var(--rama-space-20); margin-bottom: var(--rama-space-20); }
    .top-links.bottom { margin: var(--rama-space-20) 0 0; }
    .top-link { font-size: 13.5px; font-weight: var(--rama-weight-semibold); color: var(--rama-text-default-black); cursor: pointer; }
    .top-link:hover, .top-link.active { color: var(--rama-primary-400); }
    .top-link.active { text-decoration: underline; }
    .columns { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: var(--rama-space-20) var(--rama-space-24); }
    h4 { margin: 0 0 8px; padding-bottom: 6px; border-bottom: var(--rama-border-width-thin) solid var(--rama-border-default);
      font-size: 11px; font-weight: var(--rama-weight-bold); letter-spacing: .3px; text-transform: uppercase; color: var(--rama-text-muted); }
    ul { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 7px; }
    li a { font-size: 12.5px; color: var(--rama-text-default-black); cursor: pointer; }
    li a:hover { color: var(--rama-primary-400); }
    .module:focus-visible, .close:focus-visible { outline: none; box-shadow: var(--rama-focus-ring); }
  `,
})
export class RamaSidebarLegacy {
  readonly open = model(false);
  readonly title = input('Menú');
  readonly modules = input<string[]>([
    'Home', 'Administrador', 'BSC', 'Indicadores', 'Planes', 'Gestión del riesgo', 'Mejoras', 'Revisiones por la Dirección', 'Documentos',
    'Complementarios MIPG', 'Portafolio de Proyectos', 'Analítico', 'Gestión de Seguridad de la Información', 'SGSST', 'SGA', 'Presentaciones',
    'Compromisos', 'Reuniones', 'Eventos y Decisiones', 'OLAP', 'Integridad operativa', 'Encuestas', 'Alineación',
    'Complementarios Sistemas de G...', 'Contexto Organizacional', 'Antisoborno',
  ]);
  readonly activeModule = model('Integridad operativa');
  readonly topLinks = input(['Página inicial', 'Mis responsabilidades']);
  readonly activeLink = model('Mis responsabilidades');
  readonly columns = input<LegacyNavColumn[]>([
    { title: 'Revo', items: ['Puestos', 'Escenarios', 'Rondas', 'Equipos', 'Tareas', 'LOPC'] },
    { title: 'Activación', items: ['Escenarios', 'Rondas', 'Corridas', 'Equipos', 'Tareas'] },
    { title: 'Reportes', items: ['Cifras tareas', 'Cifras de tareas de estado', 'Estadísticas de equipos', 'Ncr-Incidentes', 'Rondas digitadas', 'Disponibilidad',
      'Tareas por sistema', 'Entrega de turno', 'Directrices', 'Lectura de directrices de turno', 'Comentarios del turno', 'Rondas configuradas',
      'Escenarios configurados', 'Resumen de operación', 'Multidimensionales', 'Malos actores', 'Gestión de tiempos', 'Cifras equipos', 'LOPC'] },
    { title: 'Atributos personalizados', items: ['Rondas', 'Equipos', 'Tareas'] },
    { title: 'Ajustes', items: ['Clases de equipos', 'Tipos de equipos', 'Clases de tareas', 'Categorías de tareas', 'Causas de violación', 'Estados de operatividad',
      'Corridas', 'Valores de estados', 'Turnos', 'Parámetros', 'Importar Xml Ronda', 'Tipos de fuga', 'Tipos de sustancias', 'Ubicación fuga'] },
    { title: 'Inhibición de Capas de Protección', items: ['Gestionar', 'Atributos personalizados', 'Reportes', 'Flujos activos', 'Flujos', 'Plantillas de notificaciones', 'Configurador búsqueda', 'Correos'] },
    { title: 'Lazo de Control de Proceso', items: ['Gestionar', 'Atributos personalizados', 'Reportes', 'Flujos activos', 'Flujos'] },
  ]);
  readonly bottomLinks = input(['Mis pasos asignados', 'Otros ajustes']);
  readonly linkClick = output<{ section: string; item: string }>();
  readonly closed = output<void>();

  private readonly drawer = viewChild<ElementRef<HTMLElement>>('drawer');
  private readonly focus = new DialogFocus();
  private wasOpen = false;

  constructor() {
    effect(() => {
      const el = this.drawer()?.nativeElement;
      if (this.open() && el && !this.wasOpen) { this.wasOpen = true; this.focus.activate(el); }
      if (!this.open() && this.wasOpen) { this.wasOpen = false; this.focus.restore(); }
    });
  }

  onKeydown(event: KeyboardEvent) { const el = this.drawer()?.nativeElement; if (el) this.focus.trap(event, el); }
  close() { this.open.set(false); this.closed.emit(); }
}
