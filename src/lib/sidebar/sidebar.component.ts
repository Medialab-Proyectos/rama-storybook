import { ChangeDetectionStrategy, Component, computed, input, model, output, signal } from '@angular/core';
import { RamaIcon } from '../icon/icon.component';
import {
  DEFAULT_FOOTER, DEFAULT_HELP, DEFAULT_MODULES, DEFAULT_USER,
  HelpGroup, NavFooterLink, NavLink, NavModule, NavUser,
} from './nav-data';

export type { HelpGroup, NavFooterLink, NavLink, NavModule, NavSection, NavUser } from './nav-data';

interface SearchGroup { path: string; module: string; section: string; links: NavLink[]; }

/**
 * Sidebar navigator Rama (Figma: 2 Menu / Sidebar navigator [NEW], 36:59538).
 * - Encabezado: botón de menú (40px), saludo "Hola, Bienvenido" (24 bold) y buscador.
 * - Lista de módulos con su ícono (_Nav item base: Default, Hover y Selected con chevron).
 * - Al elegir un módulo se abre el submenú (_Dropdown header navigation sub menu): enlaces
 *   destacados con ícono de salida, columnas de enlaces y el bloque de ayudas (Help center).
 * - Búsqueda rápida: vacía muestra la ayuda "Búsqueda rápida"; con texto lista los enlaces que
 *   coinciden agrupados por ruta "Módulo -> Sección" (Figma Search empty / Search link).
 * - Pie: Soporte, Selección de Tema / Color y la tarjeta del usuario.
 */
@Component({
  selector: 'rama-sidebar',
  imports: [RamaIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(document:keydown.escape)': 'activeModule.set(null)' },
  template: `
    <aside class="sidebar" aria-label="Menú principal">
      <div class="top">
        <div class="pad"><button type="button" class="menu-btn" aria-label="Contraer menú" (click)="menuClick.emit()"><rama-icon name="menu" [size]="40" /></button></div>
        <p class="pad greeting">{{ greeting() }}</p>
        <div class="pad">
          <label class="search" [class.active]="searching() || focused()">
            @if (!searching()) { <rama-icon name="search-sidebar" [size]="20" class="search-ic" /> }
            <input #q type="search" [placeholder]="searchPlaceholder()" [value]="query()" aria-label="Buscar en el menú"
              (input)="query.set(q.value)" (focus)="focused.set(true)" (blur)="focused.set(false)" />
            @if (searching()) {
              <button type="button" class="clear" aria-label="Limpiar búsqueda" (click)="query.set(''); q.focus()"><rama-icon name="x-circle" [size]="20" /></button>
            }
          </label>
        </div>

        @if (searching()) {
          @if (results().length) {
            <div class="results" role="list">
              @for (g of results(); track g.path) {
                <div class="result" role="listitem">
                  <p class="result-path">{{ g.path }}</p>
                  @for (l of g.links; track l.label) {
                    <a class="result-link" (click)="linkClick.emit({ module: g.module, section: g.section, link: l })">{{ l.label }}</a>
                  }
                </div>
              }
            </div>
            <hr class="divider full" />
          }
          <div class="pad"><div class="quick-help">
            <p class="qh-title">Búsqueda rápida</p>
            <p class="qh-text">{{ searchHelp() }}</p>
          </div></div>
        } @else {
          <nav class="pad items" aria-label="Módulos">
            @for (m of modules(); track m.label) {
              <button type="button" class="item" [class.selected]="m.label === activeModule()" [attr.aria-expanded]="m.label === activeModule()"
                (click)="toggle(m)">
                <rama-icon [name]="m.icon" [size]="24" />
                <span class="item-label">{{ m.label }}</span>
                @if (m.label === activeModule()) { <rama-icon name="chevron-down" [size]="20" class="chev" /> }
              </button>
            }
          </nav>
        }
      </div>

      <div class="foot">
        <hr class="divider" />
        <nav class="items" aria-label="Opciones">
          @for (f of footerLinks(); track f.id) {
            <button type="button" class="item" (click)="footerClick.emit(f.id)"><rama-icon [name]="f.icon" [size]="24" /><span class="item-label">{{ f.label }}</span></button>
          }
        </nav>
        <hr class="divider" />
        <button type="button" class="user" (click)="userClick.emit()">
          @if (user().avatar) { <img class="avatar" [src]="user().avatar" alt="" /> }
          @else { <span class="avatar initials">{{ user().initials }}</span> }
          <span class="user-text"><span class="user-name">{{ user().name }}</span><span class="user-sub">{{ user().subtitle }}</span></span>
        </button>
      </div>
    </aside>

    @if (current(); as m) {
      <section class="submenu" [attr.aria-label]="m.label">
        @if (m.quickLinks?.length) {
          <div class="quick">
            @for (l of m.quickLinks; track l.label) {
              <a class="link-ic" (click)="linkClick.emit({ module: m.label, section: '', link: l })">{{ l.label }}<rama-icon name="share" [size]="20" /></a>
            }
          </div>
        }
        <div class="cols">
          @for (s of m.sections ?? []; track s.title) {
            <div class="col">
              <p class="col-title">{{ s.title }}</p>
              @for (l of s.links; track $index) {
                <a class="link" (click)="linkClick.emit({ module: m.label, section: s.title, link: l })">{{ l.label }}</a>
              }
            </div>
          }
        </div>
        @if (help().length) {
          <div class="help">
            @for (g of help(); track g.title) {
              <p class="help-title">{{ g.title }}</p>
              <div class="help-items">
                @for (h of g.items; track h.title) {
                  <a class="help-card" (click)="helpClick.emit(h)">
                    <img class="help-img" [src]="h.image + '.jpg'" alt="" />
                    <span class="help-text"><span class="help-name">{{ h.title }}</span><span class="help-desc">{{ h.description }}</span></span>
                    <rama-icon name="arrow-right-sm" [size]="20" class="help-arrow" />
                  </a>
                }
              </div>
            }
          </div>
        }
      </section>
    }
  `,
  styles: `
    :host { position: relative; display: inline-flex; align-items: flex-start; font-family: var(--rama-font); }
    .sidebar {
      width: 340px; box-sizing: border-box; display: flex; flex-direction: column; justify-content: space-between;
      background: var(--rama-bg-default-white); border-right: var(--rama-border-width-thin) solid var(--rama-border-default);
      border-radius: var(--rama-radius-xl); min-height: 100%;
    }
    .top { display: flex; flex-direction: column; gap: var(--rama-space-24); padding: var(--rama-space-24) 0; }
    .pad { padding: 0 var(--rama-space-16); }
    .menu-btn { display: flex; padding: 0; border: 0; background: none; cursor: pointer; color: var(--rama-text-default-black); border-radius: var(--rama-radius-small); }
    .greeting { margin: 0; font-size: 24px; line-height: normal; font-weight: var(--rama-weight-bold); color: var(--rama-text-default-black); }

    /* Buscador: 308px, relleno 14, borde #EAECF0, texto 12 semibold; activo: borde primary + sombra */
    .search { display: flex; align-items: center; gap: var(--rama-space-8); padding: 14px; border: var(--rama-border-width-thin) solid var(--rama-border-default);
      border-radius: var(--rama-radius-small); background: var(--rama-bg-default-white); cursor: text; }
    .search.active { border-color: var(--rama-border-primary); filter: drop-shadow(6px 6px 5px rgba(120, 132, 149, .05)); }
    .search-ic { color: var(--rama-text-muted); }
    .search input { flex: 1; min-width: 0; border: 0; outline: 0; padding: 0; background: none;
      font: var(--rama-weight-semibold) 12px/normal var(--rama-font); letter-spacing: -0.24px; color: var(--rama-text-default-black); }
    .search input::placeholder { color: var(--rama-text-muted); }
    .search input::-webkit-search-cancel-button { display: none; }
    .clear { display: flex; padding: 0; border: 0; background: none; cursor: pointer; color: var(--rama-text-default-black); border-radius: var(--rama-radius-full); }

    /* _Nav item base: relleno 12, radio 6, ícono 24, texto 14/16 semibold */
    .items { display: flex; flex-direction: column; gap: var(--rama-space-4); }
    .item { display: flex; align-items: center; gap: var(--rama-space-12); width: 100%; padding: var(--rama-space-12); border: 0; border-radius: 6px;
      background: var(--rama-bg-default-white); color: var(--rama-text-default-black); cursor: pointer; text-align: left;
      font: var(--rama-weight-semibold) 14px/16px var(--rama-font); }
    .item-label { flex: 1; min-width: 0; }
    .item:hover { background: var(--rama-neutro-on-fill); }
    .item.selected { background: var(--rama-primary-selected); color: var(--rama-text-information); }
    .chev { transform: rotate(-90deg); }
    .item:focus-visible, .menu-btn:focus-visible, .user:focus-visible, .clear:focus-visible { outline: none; box-shadow: var(--rama-focus-ring); }

    /* Resultados de búsqueda: 24 de lado, 24 entre grupos, ruta 14 semibold subtle, enlace 14 medium subrayado */
    .results { display: flex; flex-direction: column; gap: var(--rama-space-24); padding: 0 var(--rama-space-24); }
    .result { display: flex; flex-direction: column; gap: var(--rama-space-12); }
    .result-path { margin: 0; font: var(--rama-weight-semibold) 14px/16px var(--rama-font); color: var(--rama-text-subtle); }
    .result-link { font: var(--rama-weight-medium) 14px/normal var(--rama-font); letter-spacing: -0.28px; color: var(--rama-text-default-black);
      text-decoration: underline; cursor: pointer; }
    .result-link:hover { color: var(--rama-text-primary); }
    .quick-help { display: flex; flex-direction: column; gap: var(--rama-space-16); padding: var(--rama-space-16) 0; text-align: center; }
    .qh-title { margin: 0; font: var(--rama-weight-bold) 16px/20px var(--rama-font); color: var(--rama-text-default-black); }
    .qh-text { margin: 0; font: var(--rama-weight-regular) 12px/16px var(--rama-font); color: var(--rama-text-muted); }

    .divider { margin: 0; border: 0; border-top: var(--rama-border-width-thin) solid var(--rama-border-default); }
    .foot { display: flex; flex-direction: column; gap: var(--rama-space-24); padding: var(--rama-space-16); }
    /* Tarjeta de usuario: fondo neutral-100, borde, radio 12, relleno 16, avatar 40 */
    .user { display: flex; align-items: center; gap: var(--rama-space-12); padding: var(--rama-space-16); border: var(--rama-border-width-thin) solid var(--rama-border-default);
      border-radius: var(--rama-radius-medium); background: var(--rama-neutral-100); cursor: pointer; text-align: left; }
    .avatar { width: 40px; height: 40px; flex: none; border-radius: var(--rama-radius-full); object-fit: cover; }
    .avatar.initials { display: inline-flex; align-items: center; justify-content: center; background: var(--rama-success-surface); color: var(--rama-text-success);
      font: var(--rama-weight-bold) 16px/20px var(--rama-font); }
    .user-text { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
    .user-name { font: var(--rama-weight-semibold) 14px/16px var(--rama-font); color: var(--rama-text-information); }
    .user-sub { font: var(--rama-weight-medium) 12px/16px var(--rama-font); color: var(--rama-text-subtle); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

    /* Submenú del módulo: 861px, borde, radio 19, sombra lg, relleno 24/20, 24 entre bloques */
    .submenu { position: absolute; top: 0; left: 344px; z-index: 30; width: 861px; max-width: calc(100vw - 360px); box-sizing: border-box;
      display: flex; flex-direction: column; gap: var(--rama-space-24); padding: var(--rama-space-24) var(--rama-space-20);
      background: var(--rama-bg-default-white); border: var(--rama-border-width-thin) solid var(--rama-border-default); border-radius: 19px;
      box-shadow: 0 12px 16px -4px rgba(16, 24, 40, .08), 0 4px 6px -2px rgba(16, 24, 40, .03); }
    .quick { display: flex; flex-direction: column; gap: var(--rama-space-12); align-items: flex-start; }
    /* .Link menu con ícono: 14/16 semibold información + share 20; hover en primary */
    .link-ic { display: inline-flex; align-items: center; gap: var(--rama-space-8); font: var(--rama-weight-semibold) 14px/16px var(--rama-font); color: var(--rama-text-information); cursor: pointer; }
    .link-ic:hover { color: var(--rama-text-primary); }
    .cols { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: var(--rama-space-24); }
    .col { display: flex; flex-direction: column; gap: var(--rama-space-12); align-items: flex-start; }
    .col-title { margin: 0; font: var(--rama-weight-semibold) 14px/16px var(--rama-font); color: var(--rama-text-subtle); }
    .link { font: var(--rama-weight-semibold) 14px/16px var(--rama-font); color: var(--rama-text-default-black); cursor: pointer; }
    .link:hover { color: var(--rama-text-primary); }
    /* Help center: fondo neutral-100, radio 17, relleno 16; tarjetas con imagen redonda de 60 */
    .help { display: flex; flex-direction: column; gap: var(--rama-space-24); padding: var(--rama-space-16); border-radius: 17px; background: var(--rama-neutral-100); }
    .help-title { margin: 0; font: var(--rama-weight-semibold) 14px/16px var(--rama-font); color: var(--rama-text-information); }
    .help-items { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: var(--rama-space-12); margin-top: calc(-1 * var(--rama-space-12)); }
    .help-card { position: relative; display: flex; gap: var(--rama-space-12); align-items: flex-start; border-radius: var(--rama-radius-small); cursor: pointer; }
    .help-img { width: 60px; height: 60px; flex: none; border-radius: 100px; object-fit: cover; }
    .help-text { display: flex; flex-direction: column; gap: var(--rama-space-4); padding-right: 24px; }
    .help-name { font: var(--rama-weight-semibold) 12px/16px var(--rama-font); color: var(--rama-text-default-black); }
    .help-desc { font: var(--rama-weight-regular) 10px/12px var(--rama-font); color: var(--rama-text-muted); }
    .help-arrow { position: absolute; top: 0; right: 3px; color: var(--rama-text-primary); opacity: 0; transition: opacity .15s; }
    .help-card:hover .help-name { color: var(--rama-text-primary); }
    .help-card:hover .help-arrow { opacity: 1; }
  `,
})
export class RamaSidebar {
  readonly greeting = input('Hola, Bienvenido');
  readonly searchPlaceholder = input('Buscar');
  readonly searchHelp = input('Navega rápido entre las opciones del menu filtrando tu búsqueda aquí.');
  readonly modules = input<NavModule[]>(DEFAULT_MODULES);
  readonly help = input<HelpGroup[]>(DEFAULT_HELP);
  readonly footerLinks = input<NavFooterLink[]>(DEFAULT_FOOTER);
  readonly user = input<NavUser>(DEFAULT_USER);
  /** Módulo abierto (muestra su submenú); null = cerrado. */
  readonly activeModule = model<string | null>(null);
  /** Texto del buscador; con texto muestra los resultados en lugar de los módulos. */
  readonly query = model('');

  readonly menuClick = output<void>();
  readonly linkClick = output<{ module: string; section: string; link: NavLink }>();
  readonly helpClick = output<{ title: string }>();
  readonly footerClick = output<string>();
  readonly userClick = output<void>();

  protected readonly focused = signal(false);
  readonly searching = computed(() => this.query().trim().length > 0);
  readonly current = computed(() => this.searching() ? undefined : this.modules().find(m => m.label === this.activeModule()));
  readonly results = computed<SearchGroup[]>(() => {
    const q = this.query().trim().toLowerCase();
    if (!q) return [];
    const out: SearchGroup[] = [];
    for (const m of this.modules()) {
      const moduleHit = m.label.toLowerCase().includes(q);
      for (const s of m.sections ?? []) {
        const links = moduleHit || s.title.toLowerCase().includes(q) ? s.links.slice(0, 1) : s.links.filter(l => l.label.toLowerCase().includes(q));
        if (links.length) out.push({ path: `${m.label} -> ${s.title}`, module: m.label, section: s.title, links });
      }
    }
    return out.slice(0, 6);
  });

  toggle(m: NavModule) { this.activeModule.set(this.activeModule() === m.label ? null : m.label); }
}
