// Set provisional tomado del wireframe REVO (viewBox 16, trazo currentColor).
// Para usar los íconos reales de Figma: exportarlos como SVG a public/icons/ y correr
// `npm run icons`, que regenera icons.generated.ts y los mezcla sobre este set.
// El set completo de Figma (public/icons/rama/**) no está aquí: lo carga icon-loader.ts bajo demanda.
import { generatedIcons } from './icons.generated';

const base: Record<string, string> = {
  menu: '<line x1="2.5" y1="4.5" x2="13.5" y2="4.5"/><line x1="2.5" y1="8" x2="13.5" y2="8"/><line x1="2.5" y1="11.5" x2="13.5" y2="11.5"/>',
  close: '<line x1="3" y1="3" x2="13" y2="13"/><line x1="13" y1="3" x2="3" y2="13"/>',
  'chevron-down': '<polyline points="4 6 8 10 12 6"/>',
  'chevron-right': '<polyline points="6 3 11 8 6 13"/>',
  back: '<polyline points="10 3 5 8 10 13"/>',
  search: '<circle cx="7" cy="7" r="5"/><line x1="11" y1="11" x2="14.5" y2="14.5"/>',
  plus: '<line x1="8" y1="2" x2="8" y2="14"/><line x1="2" y1="8" x2="14" y2="8"/>',
  home: '<path d="M2 8l6-5 6 5"/><path d="M4 7v7h8V7"/>',
  calendar: '<rect x="2" y="3" width="12" height="11" rx="1.5"/><line x1="2" y1="7" x2="14" y2="7"/><line x1="5" y1="2" x2="5" y2="4"/><line x1="11" y1="2" x2="11" y2="4"/>',
  gallery: '<rect x="2" y="3" width="12" height="10" rx="1.5"/><circle cx="6" cy="7" r="1.4"/><path d="M14 10l-3.5-3.5L5 12"/>',
  screen: '<rect x="2" y="3" width="12" height="8.5" rx="1"/><line x1="6" y1="14" x2="10" y2="14"/><line x1="8" y1="11.5" x2="8" y2="14"/>',
  refresh: '<path d="M14 8a6 6 0 1 1-2-4.5"/><polyline points="14 2 14 6 10 6"/>',
  download: '<path d="M8 2v8"/><polyline points="4.5 7 8 10.5 11.5 7"/><path d="M2.5 12.5v1a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1v-1"/>',
  upload: '<path d="M8 11V3"/><path d="M4.5 6.5 8 3l3.5 3.5"/><path d="M3 13h10"/>',
  info: '<circle cx="8" cy="8" r="6"/><line x1="8" y1="7.2" x2="8" y2="11"/><circle cx="8" cy="5" r=".6" fill="currentColor" stroke="none"/>',
  alert: '<circle cx="8" cy="8" r="6"/><line x1="8" y1="5" x2="8" y2="9"/><circle cx="8" cy="11" r=".6" fill="currentColor" stroke="none"/>',
  warning: '<path d="M8 1.3 15 14H1z"/><line x1="8" y1="6.3" x2="8" y2="9.8"/><circle cx="8" cy="11.8" r=".6" fill="currentColor" stroke="none"/>',
  check: '<polyline points="3 8 7 12 13 4"/>',
  'check-circle': '<circle cx="8" cy="8" r="6"/><polyline points="5 8 7 10 11 6"/>',
  edit: '<path d="M2 14l.8-3.4 7.9-7.9a1.2 1.2 0 0 1 1.7 0l.9.9a1.2 1.2 0 0 1 0 1.7L5.4 13.2 2 14z"/><path d="M9.3 3.8l2.9 2.9"/>',
  eye: '<path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z"/><circle cx="8" cy="8" r="2"/>',
  trash: '<path d="M3 4h10"/><path d="M6 4V2.5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1V4"/><path d="M4.2 4l.5 9a1 1 0 0 0 1 .9h4.6a1 1 0 0 0 1-.9l.5-9"/><line x1="6.5" y1="6.7" x2="6.5" y2="11.3"/><line x1="9.5" y1="6.7" x2="9.5" y2="11.3"/>',
  attach: '<path d="M9 2 4 7a3 3 0 0 0 4 4l5-5a2 2 0 0 0-3-3L5 8"/>',
  document: '<path d="M4 1.5h5l3 3v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-11a1 1 0 0 1 1-1z"/><path d="M9 1.5v3h3"/><line x1="5" y1="8" x2="11" y2="8"/><line x1="5" y1="10.3" x2="11" y2="10.3"/>',
  tree: '<circle cx="8" cy="2.6" r="1.6"/><circle cx="3" cy="12.5" r="1.6"/><circle cx="13" cy="12.5" r="1.6"/><path d="M8 4.2V7.5M8 7.5L3 11M8 7.5l5 3.5"/>',
  clock: '<circle cx="8" cy="8" r="6"/><polyline points="8 4.5 8 8 10.5 9.5"/>',
  flag: '<path d="M3 14V2"/><path d="M3 2.5h9l-2 3 2 3H3"/>',
  user: '<circle cx="8" cy="5.5" r="2.8"/><path d="M2.5 14a5.5 5.5 0 0 1 11 0"/>',
  dot: '<circle cx="8" cy="8" r="3"/>',
};

export const icons: Record<string, string> = { ...base, ...generatedIcons };
export type IconName = keyof typeof base | (string & {});
