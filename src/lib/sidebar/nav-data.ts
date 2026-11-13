// Contenido de ejemplo del menú Rama tomado de Figma ("2 Menu / Sidebar navigator [NEW]").
// Los componentes reciben estos datos por input; aquí solo están los valores por defecto.

export interface NavLink { label: string; href?: string; }
export interface NavSection { title: string; links: NavLink[]; }
export interface NavModule {
  label: string;
  /** Nombre del ícono (24px) del registro rama-icon. */
  icon: string;
  /** Enlaces destacados del menú abierto (Figma "Slot - Links", con ícono de salida). */
  quickLinks?: NavLink[];
  /** Columnas del menú abierto. */
  sections?: NavSection[];
}
export interface HelpItem { title: string; description: string; image: string; action?: string; }
export interface HelpGroup { title: string; items: HelpItem[]; }
export interface NavUser { name: string; subtitle: string; avatar?: string; initials?: string; }
export interface NavFooterLink { id: string; label: string; icon: string; }

const QUICK: NavLink[] = [{ label: 'Pagina inicial' }, { label: 'Mis responsabilidades' }];
const SECTIONS: NavSection[] = [
  { title: 'Reportes', links: ['Planes', 'Categorias', 'Tareas', 'Avances parciales', 'Cambios', 'Contador', 'Auditoria de tareas'].map(label => ({ label })) },
  { title: 'Planificacion', links: ['Planes', 'Tareas', 'Administrar tareas'].map(label => ({ label })) },
  { title: 'Atributos personalizados', links: ['Planes', 'Categorias', 'Tareas'].map(label => ({ label })) },
  { title: 'Ajustes', links: ['Funciones', 'Notificaciones', 'Contenido notificaciones', 'Correos', 'Parametros', 'Configurador de busqueda'].map(label => ({ label })) },
];

const mod = (label: string, icon: string): NavModule => ({ label, icon, quickLinks: QUICK, sections: SECTIONS });

export const DEFAULT_MODULES: NavModule[] = [
  mod('Home', 'home-2'), mod('Administrador', 'users'), mod('SGSI', 'lock'), mod('SGSST', 'healthcare'),
  mod('MPG', 'medal'), mod('SGA', 'green-leaf'), mod('Revisiones', 'thumb-up'), mod('Portafolio de proyectos', 'suitcase'),
  mod('Indicadores', 'chart-pie'), mod('Complementos', 'tools'), mod('BSC', 'award'), mod('OLAP', 'cloud'),
  mod('Documentos', 'clipboard'), mod('Mejoras', 'settings-profiles'), mod('Planes', 'multi-window'),
  mod('Gestión del riesgo', 'warning-2'), mod('Reuniones', 'coffee'), mod('Eventos y decisiones', 'stopwatch'),
  mod('Presentaciones', 'presentation'), mod('Riesgos pro', 'activity'), mod('Analítico', 'chart-1'),
  mod('Alineación', 'layers-2'), mod('Compromisos', 'target'),
];
// Resultados de la búsqueda rápida de Figma ("Search link"): secciones con ruta Módulo -> Sección.
DEFAULT_MODULES.find(m => m.label === 'Mejoras')!.sections = [
  { title: 'Requisitos legales y otros', links: [{ label: 'Plantillas notificaciones' }] },
  ...SECTIONS,
];
DEFAULT_MODULES.find(m => m.label === 'Complementos')!.sections = [{ title: 'Gestion de cambios', links: [{ label: 'Plantillas notificaciones' }] }, ...SECTIONS];
DEFAULT_MODULES.find(m => m.label === 'Revisiones')!.sections = [{ title: 'Fases de auditoria', links: [{ label: 'Plantillas notificaciones' }] }, ...SECTIONS];

export const DEFAULT_HELP: HelpGroup[] = [
  { title: 'Ayudas', items: [
    { title: 'Ayudas en linea', description: 'Accedes a otras ayudas en linea y soporte desde aqui.', image: 'nav/ayuda-1', action: 'Ver todo' },
    { title: 'Manuales con IA', description: 'Accede a manuales creados con inteligencia artificial desde aquí.', image: 'nav/ayuda-2', action: 'Ver todo' },
    { title: 'Documentos con IA', description: 'Accede a manuales creados con inteligencia artificial desde aquí.', image: 'nav/ayuda-2', action: 'Ver todo' },
  ] },
  { title: 'Ayudas de aprendizaje', items: [
    { title: 'Manuales', description: 'Manuales en formato PDF de todos los modulos.', image: 'nav/ayuda-3', action: 'Explorar' },
    { title: 'Wiki SVE', description: 'Wiki inteligente con toda la informacion online', image: 'nav/ayuda-4', action: 'Explorar' },
  ] },
];

export const DEFAULT_FOOTER: NavFooterLink[] = [
  { id: 'soporte', label: 'Soporte', icon: 'lifebelt' },
  { id: 'tema', label: 'Seleccion de Tema / Color', icon: 'color-swatch' },
];

export const DEFAULT_USER: NavUser = { name: 'Juan Buitrago', subtitle: 'Universidad Jorge Tadeo Lozano', avatar: 'nav/avatar-usuario.jpg', initials: 'JB' };

/** Entradas rápidas del topbar (Figma "_Full-width header navigation sub menu"). */
export interface QuickEntryGroup { title: string; links: string[]; }
export const DEFAULT_QUICK_ENTRIES: QuickEntryGroup[] = [
  { title: 'Conceptos', links: [] },
  { title: 'Ultimas funcionalidades', links: ['Novedades'] },
  { title: 'Responsabilidades', links: ['Mis responsabilidades', 'Reporte global'] },
  { title: 'Recursos', links: ['Plantillas', 'Agentes'] },
  { title: 'Acerca de', links: ['Version del sistema'] },
];
