import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RamaIcon } from '../icon/icon.component';

export interface LegacyTopbarLink { label: string; hasMenu?: boolean; }
export interface LegacyTopbarUser { name: string; role: string; initials: string; }

/**
 * Topbar · versión actual (la que usa hoy la plataforma, tal como está en el wireframe
 * "Dashboard de gestión por rol"). Barra gris de 80px con hamburguesa azul, botón
 * "Búsquedas Personalizadas", enlaces de texto, usuario y tres accesos con ícono.
 * Convive con `rama-topbar` (versión nueva de Figma "[NEW]").
 */
@Component({
  selector: 'rama-topbar-legacy',
  imports: [RamaIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="bar">
      <button type="button" class="burger" aria-label="Abrir menú" (click)="menuClick.emit()">
        <svg width="20" height="20" viewBox="0 0 20 20" stroke="currentColor" stroke-width="1.6" fill="none" aria-hidden="true"><line x1="3" y1="6" x2="17" y2="6"/><line x1="3" y1="10" x2="17" y2="10"/><line x1="3" y1="14" x2="17" y2="14"/></svg>
      </button>
      <button type="button" class="searches" (click)="searchesClick.emit()">{{ searchesLabel() }}<rama-icon name="chevron-down" [size]="12" [strokeWidth]="2" /></button>
      <nav class="links" aria-label="Navegación principal">
        @for (l of links(); track l.label) {
          <button type="button" class="link" [attr.aria-haspopup]="l.hasMenu || null" (click)="linkClick.emit(l.label)">
            {{ l.label }}@if (l.hasMenu) { <rama-icon name="chevron-down" [size]="10" [strokeWidth]="2" /> }
          </button>
        }
      </nav>
      <span class="divider" aria-hidden="true"></span>
      <button type="button" class="user" aria-haspopup="true" (click)="userClick.emit()">
        <span class="avatar">{{ user().initials }}</span>
        <span class="meta"><span class="nm">{{ user().name }}</span><span class="rl">{{ user().role }}</span></span>
        <rama-icon name="chevron-down" [size]="14" [strokeWidth]="2" class="chev" />
      </button>
      @if (showIcons()) {
        <div class="icons">
          <button type="button" class="icon-btn" aria-label="Calendario" (click)="iconClick.emit('calendario')">
            <svg width="18" height="18" viewBox="0 0 16 16" stroke="currentColor" stroke-width="1.6" fill="none"><rect x="2" y="3" width="12" height="11" rx="1.5"/><line x1="2" y1="7" x2="14" y2="7"/><line x1="5" y1="2" x2="5" y2="4"/><line x1="11" y1="2" x2="11" y2="4"/></svg>
          </button>
          <button type="button" class="icon-btn" aria-label="Galería" (click)="iconClick.emit('galeria')">
            <svg width="18" height="18" viewBox="0 0 16 16" stroke="currentColor" stroke-width="1.6" fill="none"><rect x="2" y="3" width="12" height="10" rx="1.5"/><circle cx="6" cy="7" r="1.4"/><path d="M14 10l-3.5-3.5L5 12"/></svg>
          </button>
          <button type="button" class="icon-btn" aria-label="Pantalla" (click)="iconClick.emit('pantalla')">
            <svg width="18" height="18" viewBox="0 0 16 16" stroke="currentColor" stroke-width="1.6" fill="none"><rect x="2" y="3" width="12" height="8.5" rx="1"/><line x1="6" y1="14" x2="10" y2="14"/><line x1="8" y1="11.5" x2="8" y2="14"/></svg>
          </button>
        </div>
      }
    </header>
  `,
  styles: `
    :host { display: block; font-family: var(--rama-font); }
    /* Valores del wireframe: fondo #E4E6E9 y hamburguesa azul #04B5EB (hover #005794), fijos en los dos temas. */
    .bar { height: 80px; box-sizing: border-box; display: flex; align-items: center; gap: var(--rama-space-20); padding: 0 var(--rama-space-24);
      background: #e4e6e9; border-bottom: var(--rama-border-width-thin) solid var(--rama-border-default); }
    button { font-family: inherit; cursor: pointer; }
    .burger { width: 40px; height: 40px; flex: none; display: inline-flex; align-items: center; justify-content: center; border: 0;
      border-radius: var(--rama-radius-small); background: #04b5eb; color: #fff; }
    .burger:hover { background: #005794; }
    .searches { display: inline-flex; align-items: center; justify-content: space-between; gap: 10px; min-width: 210px; flex: none; padding: 9px 14px;
      background: var(--rama-bg-default-white); border: var(--rama-border-width-thin) solid var(--rama-border-inset); border-radius: var(--rama-radius-small);
      font-size: 13px; font-weight: var(--rama-weight-semibold); color: var(--rama-text-default-black); }
    .searches:hover { border-color: var(--rama-primary-300); }
    .links { display: flex; align-items: center; gap: var(--rama-space-20); flex: 1; min-width: 0; padding: 0 var(--rama-space-16); overflow: hidden; }
    .link { display: inline-flex; align-items: center; gap: 4px; padding: 0; border: 0; background: transparent; white-space: nowrap;
      font-size: 13.5px; color: var(--rama-text-default-black); }
    .link:hover { color: var(--rama-primary-400); }
    .divider { width: 1px; height: 30px; flex: none; background: var(--rama-border-inset); }
    .user { display: inline-flex; align-items: center; gap: 10px; flex: none; padding: 6px 10px 6px 6px; border: 0; border-radius: var(--rama-radius-full); background: transparent; }
    .user:hover { background: var(--rama-bg-subtle); }
    .avatar { width: 40px; height: 40px; flex: none; display: inline-flex; align-items: center; justify-content: center; border-radius: 50%;
      background: var(--rama-primary-100); color: var(--rama-primary-400); font-size: 14px; font-weight: var(--rama-weight-bold); }
    .meta { display: flex; flex-direction: column; text-align: left; }
    .nm { font-size: 13px; font-weight: var(--rama-weight-semibold); color: var(--rama-text-default-black); }
    .rl { font-size: 11.5px; color: var(--rama-text-muted); }
    .chev { color: var(--rama-text-muted); }
    .icons { display: flex; align-items: center; gap: 2px; flex: none; }
    .icon-btn { width: 36px; height: 36px; display: inline-flex; align-items: center; justify-content: center; border: 0; border-radius: var(--rama-radius-small);
      background: transparent; color: var(--rama-text-muted); }
    .icon-btn:hover { background: var(--rama-bg-subtle); color: var(--rama-text-default-black); }
    .burger:focus-visible, .searches:focus-visible, .link:focus-visible, .user:focus-visible, .icon-btn:focus-visible { outline: none; box-shadow: var(--rama-focus-ring); }
  `,
})
export class RamaTopbarLegacy {
  readonly searchesLabel = input('Búsquedas Personalizadas');
  readonly links = input<LegacyTopbarLink[]>([
    { label: 'Conceptos' }, { label: 'Últimas funcionalidades', hasMenu: true }, { label: 'Ayudas' },
    { label: 'Responsabilidades', hasMenu: true }, { label: 'Recursos', hasMenu: true },
  ]);
  readonly user = input<LegacyTopbarUser>({ name: 'Supervisor de turno', role: 'Supervisor · Estacion Castilla 2', initials: 'SV' });
  readonly showIcons = input(true);

  readonly menuClick = output<void>();
  readonly searchesClick = output<void>();
  readonly linkClick = output<string>();
  readonly userClick = output<void>();
  readonly iconClick = output<'calendario' | 'galeria' | 'pantalla'>();
}
