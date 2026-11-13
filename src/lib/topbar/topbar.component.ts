import { ChangeDetectionStrategy, Component, ElementRef, inject, input, model, output } from '@angular/core';
import { RamaIcon } from '../icon/icon.component';
import { DEFAULT_HELP, DEFAULT_QUICK_ENTRIES, HelpGroup, QuickEntryGroup } from '../sidebar/nav-data';

export interface TopbarUser { name: string; role: string; initials: string; }
export type { QuickEntryGroup } from '../sidebar/nav-data';

/**
 * Top Bar Rama (Figma: 2 Menu / Sidebar navigator [NEW] · "Top Bar", 59078:16159).
 * Izquierda: menú (24px), inicio y "Entradas rapidas" (fondo primary-surface, ícono flash).
 * Centro: buscador de 350px. Derecha: avatar con iniciales, nombre, rol y flecha.
 * "Entradas rapidas" abre el submenú: columna de enlaces y, en gris, las ayudas con imagen.
 * Responsive por el ancho del propio topbar (Figma 1728 / 1024 / 744 / 440):
 * - ≤1200px: las dos secciones de ayudas se apilan.
 * - ≤900px (744): el buscador pasa a ícono y el usuario muestra solo el avatar.
 * - ≤600px (440): el botón queda solo con el ícono y el submenú muestra solo la columna de enlaces.
 */
@Component({
  selector: 'rama-topbar',
  imports: [RamaIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(document:click)': 'onDocClick($event)', '(document:keydown.escape)': 'quickOpen.set(false)' },
  template: `
    <header class="bar">
      <div class="left">
        <button type="button" class="menu" aria-label="Abrir menú" (click)="menuClick.emit()"><rama-icon name="menu-24" [size]="24" /></button>
        <div class="row">
          <button type="button" class="home" aria-label="Inicio" (click)="homeClick.emit()"><rama-icon name="home-1" [size]="20" /></button>
          <button type="button" class="quick" [class.open]="quickOpen()" aria-haspopup="true" [attr.aria-expanded]="quickOpen()" (click)="quickOpen.set(!quickOpen())">
            <rama-icon name="flash" [size]="20" /><span class="quick-label">{{ quickLabel() }}</span><rama-icon name="arrow-down" [size]="20" class="caret" />
          </button>
        </div>
      </div>

      <label class="search">
        <rama-icon name="search-normal" [size]="20" />
        <input #q type="search" [placeholder]="searchPlaceholder()" aria-label="Buscar" (keydown.enter)="search.emit(q.value)" />
      </label>

      <div class="right">
        <button type="button" class="search-btn" aria-label="Buscar" (click)="searchClick.emit()"><rama-icon name="search-normal" [size]="24" /></button>
        <button type="button" class="user" aria-haspopup="true" (click)="userClick.emit()">
          <span class="avatar">{{ user().initials }}</span>
          <span class="user-text"><span class="name">{{ user().name }}</span><span class="role">{{ user().role }}</span></span>
          <rama-icon name="arrow-down" [size]="20" />
        </button>
      </div>
    </header>

    @if (quickOpen()) {
      <div class="panel" role="menu" [attr.aria-label]="quickLabel()">
        <div class="entries">
          <p class="heading">{{ quickLabel() }}</p>
          @for (g of entries(); track g.title) {
            <div class="group">
              <a class="group-title" role="menuitem" (click)="entryClick.emit({ group: g.title, link: '' })">{{ g.title }}</a>
              @if (g.links.length) {
                <div class="group-links">
                  @for (l of g.links; track l) { <a class="group-link" role="menuitem" (click)="entryClick.emit({ group: g.title, link: l })">{{ l }}</a> }
                </div>
              }
            </div>
          }
          <a class="group-title only-mobile" role="menuitem" (click)="entryClick.emit({ group: 'Ayudas', link: '' })">Ayudas</a>
        </div>
        <div class="helps">
          @for (h of help(); track h.title; let i = $index) {
            <div class="help-section" [class.second]="i > 0">
              <p class="heading pad">{{ h.title }}</p>
              <div class="cards">
                @for (c of h.items; track c.title; let first = $first) {
                  <div class="card" [class.first]="first">
                    <img class="thumb" [src]="c.image + '-wide.jpg'" alt="" />
                    <div class="card-body">
                      <span class="card-title">{{ c.title }}</span>
                      <span class="card-desc">{{ c.description }}</span>
                      <a class="card-action" (click)="helpClick.emit(c.title)">{{ c.action }}<rama-icon name="arrow-right" [size]="20" /></a>
                    </div>
                  </div>
                }
              </div>
            </div>
          }
        </div>
      </div>
    }
  `,
  styles: `
    :host { position: relative; display: block; container: topbar / inline-size; font-family: var(--rama-font); }
    /* Barra: blanco, borde inferior #EAECF0, sombra small, relleno 12/16 */
    .bar { display: flex; align-items: center; justify-content: space-between; gap: var(--rama-space-16); padding: var(--rama-space-12) var(--rama-space-16);
      background: var(--rama-bg-default-white); border-bottom: var(--rama-border-width-thin) solid var(--rama-border-default);
      filter: drop-shadow(6px 6px 5px rgba(120, 132, 149, .05)); }
    .left { display: flex; align-items: center; gap: var(--rama-space-24); }
    .row { display: flex; align-items: stretch; gap: var(--rama-space-8); }
    button { font: inherit; cursor: pointer; }
    .menu { display: flex; padding: var(--rama-space-12); border: 0; border-radius: var(--rama-radius-small); background: none; color: var(--rama-text-default-black); }
    .home { display: flex; padding: var(--rama-space-8); border: var(--rama-border-width-thin) solid var(--rama-border-default); border-radius: var(--rama-radius-small);
      background: var(--rama-bg-default-white); color: var(--rama-text-default-black); }
    /* "Entradas rapidas": fondo primary-surface, texto 14/16 bold primary-on-fill */
    .quick { display: inline-flex; align-items: center; gap: var(--rama-space-8); padding: var(--rama-space-8) var(--rama-space-12); border: 0;
      border-radius: var(--rama-radius-small); background: var(--rama-primary-surface); color: var(--rama-primary-on-fill);
      font: var(--rama-weight-bold) 14px/16px var(--rama-font); white-space: nowrap; }
    .quick.open .caret { transform: rotate(180deg); }
    .menu:hover, .home:hover { background: var(--rama-bg-subtle); }
    .menu:focus-visible, .home:focus-visible, .quick:focus-visible, .user:focus-visible, .search-btn:focus-visible { outline: none; box-shadow: var(--rama-focus-ring); }

    /* Buscador central de 350px (Input Text Medium con ícono) */
    .search { display: flex; align-items: center; gap: var(--rama-space-8); width: 350px; min-height: 48px; box-sizing: border-box; padding: 0 var(--rama-space-20);
      border: var(--rama-border-width-thin) solid var(--rama-border-inset); border-radius: var(--rama-radius-xs); background: var(--rama-bg-default-white);
      color: var(--rama-text-muted); cursor: text; }
    .search:focus-within { border-color: var(--rama-border-primary); box-shadow: var(--rama-focus-ring); }
    .search input { flex: 1; min-width: 0; border: 0; outline: 0; padding: 0; background: none; font: var(--rama-weight-regular) 16px/normal var(--rama-font); color: var(--rama-text-default-black); }
    .search input::placeholder { color: var(--rama-text-subtle); }
    .search-btn { display: none; padding: var(--rama-space-8); border: 0; border-radius: var(--rama-radius-small); background: none; color: var(--rama-text-default-black); }

    .right { display: flex; align-items: center; gap: var(--rama-space-16); }
    .user { display: flex; align-items: center; gap: var(--rama-space-12); padding: 0; border: 0; background: none; border-radius: var(--rama-radius-small); text-align: left; }
    .avatar { width: 40px; height: 40px; flex: none; display: inline-flex; align-items: center; justify-content: center; border-radius: var(--rama-radius-full);
      background: var(--rama-success-surface); color: var(--rama-text-success); font: var(--rama-weight-bold) 16px/20px var(--rama-font); }
    .user-text { display: flex; flex-direction: column; gap: var(--rama-space-4); width: 182px; }
    .name { font: var(--rama-weight-semibold) 14px/16px var(--rama-font); color: var(--rama-text-default-black); white-space: nowrap; }
    .role { font: var(--rama-weight-medium) 12px/16px var(--rama-font); color: var(--rama-text-subtle); white-space: nowrap; }

    /* Submenú "Entradas rapidas": radio 16, borde, sombra small; columna de 321 y ayudas en gris */
    .panel { position: absolute; top: 72px; left: 123px; z-index: 40; display: flex; max-width: calc(100% - 139px);
      background: var(--rama-bg-default-white); border: var(--rama-border-width-thin) solid var(--rama-border-default); border-radius: var(--rama-radius-large);
      box-shadow: var(--rama-shadow-small); overflow: hidden; }
    .entries { display: flex; flex-direction: column; gap: var(--rama-space-20); width: 321px; flex: none; box-sizing: border-box; padding: var(--rama-space-24); }
    .heading { margin: 0 0 var(--rama-space-4); font: var(--rama-weight-semibold) 16px/20px var(--rama-font); letter-spacing: -0.32px; color: var(--rama-text-information); }
    .group { display: flex; flex-direction: column; gap: var(--rama-space-8); }
    .group-title { font: var(--rama-weight-semibold) 14px/normal var(--rama-font); color: var(--rama-text-default-black); cursor: pointer; }
    .group-links { display: flex; flex-direction: column; gap: var(--rama-space-4); }
    .group-link { font: var(--rama-weight-regular) 12px/normal var(--rama-font); color: var(--rama-text-muted); cursor: pointer; }
    .group-title:hover, .group-link:hover { color: var(--rama-text-primary); }
    .only-mobile { display: none; }
    .helps { display: flex; gap: var(--rama-space-16); padding: var(--rama-space-24); background: var(--rama-neutral-100); border-left: var(--rama-border-width-thin) solid var(--rama-border-default); }
    .help-section { display: flex; flex-direction: column; gap: var(--rama-space-12); width: 400px; }
    .help-section.second { gap: var(--rama-space-24); }
    .pad { padding: 0 var(--rama-space-12); }
    .cards { display: flex; flex-direction: column; }
    .card { display: flex; gap: var(--rama-space-24); padding: 0 var(--rama-space-12) var(--rama-space-12); border-radius: var(--rama-radius-small); }
    .card.first { padding-top: var(--rama-space-12); }
    .help-section.second .card.first { padding-top: 0; }
    .thumb { width: 176px; height: 104px; flex: none; border-radius: 6px; object-fit: cover; }
    .card-body { display: flex; flex-direction: column; gap: var(--rama-space-4); min-width: 0; }
    .card-title { font: var(--rama-weight-semibold) 14px/normal var(--rama-font); color: var(--rama-text-default-black); }
    .card-desc { font: var(--rama-weight-regular) 12px/18px var(--rama-font); color: var(--rama-text-muted); }
    .card-action { display: inline-flex; align-items: center; gap: var(--rama-space-8); margin-top: var(--rama-space-8); font: var(--rama-weight-semibold) 14px/20px var(--rama-font);
      color: var(--rama-text-primary); cursor: pointer; }

    /* 1024: ayudas apiladas en una columna */
    @container topbar (max-width: 1200px) {
      .helps { flex-direction: column; gap: var(--rama-space-24); }
      .help-section, .help-section.second { gap: var(--rama-space-12); }
      .panel { left: 132px; }
    }
    /* 744: buscador como ícono, usuario solo con avatar */
    @container topbar (max-width: 900px) {
      .search, .user-text { display: none; }
      .search-btn { display: flex; }
      /* Figma 744: panel de ~610px, columna de enlaces de 200px e imágenes de 162x96 */
      .panel { left: 43px; top: 66px; right: 16px; max-width: none; }
      .entries { width: 200px; padding: var(--rama-space-20); }
      .helps { flex: 1; min-width: 0; padding: var(--rama-space-24) var(--rama-space-20); }
      .help-section { width: auto; }
      .card { padding-left: 0; padding-right: 0; gap: var(--rama-space-16); }
      .pad { padding: 0; }
      .thumb { width: 162px; height: 96px; }
    }
    /* 440: botón solo ícono; submenú solo con la columna de enlaces y "Ayudas" */
    @container topbar (max-width: 600px) {
      .left { gap: var(--rama-space-16); }
      .quick-label { display: none; }
      .helps { display: none; }
      .only-mobile { display: block; }
      .panel { left: 0; right: 0; max-width: none; }
      .entries { width: 100%; }
    }
  `,
})
export class RamaTopbar {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  readonly quickLabel = input('Entradas rapidas');
  readonly searchPlaceholder = input('Buscar...');
  readonly entries = input<QuickEntryGroup[]>(DEFAULT_QUICK_ENTRIES);
  readonly help = input<HelpGroup[]>(DEFAULT_HELP);
  readonly user = input<TopbarUser>({ name: 'Juan Buitrago', role: 'Líder operaciones', initials: 'JB' });
  /** Submenú de "Entradas rapidas" abierto. */
  readonly quickOpen = model(false);

  readonly menuClick = output<void>();
  readonly homeClick = output<void>();
  readonly searchClick = output<void>();
  readonly search = output<string>();
  readonly userClick = output<void>();
  readonly entryClick = output<{ group: string; link: string }>();
  readonly helpClick = output<string>();

  onDocClick(e: MouseEvent) {
    if (this.quickOpen() && !this.host.nativeElement.contains(e.target as Node)) this.quickOpen.set(false);
  }
}
