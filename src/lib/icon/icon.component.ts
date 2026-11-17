import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { icons } from './icons';
import { loadRamaIcon, ramaIcons } from './icon-loader';

// Nombres que no existen ni en el set core ni en el set completo de Figma (se muestra 'dot').
const unknown = signal<ReadonlySet<string>>(new Set());

@Component({
  selector: 'rama-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'rama-icon', '[attr.aria-hidden]': '!label()', '[attr.role]': 'label() ? "img" : null', '[attr.aria-label]': 'label()' },
  template: `<svg [attr.width]="size()" [attr.height]="size()" [attr.viewBox]="viewBox()" fill="none"
    [attr.stroke]="fromFigma() ? 'none' : 'currentColor'" [attr.stroke-width]="strokeWidth()"
    stroke-linecap="round" stroke-linejoin="round" [innerHTML]="body()"></svg>`,
  styles: `:host { display: inline-flex; flex: none; line-height: 0; }`,
})
export class RamaIcon {
  private readonly sanitizer = inject(DomSanitizer);
  readonly name = input.required<string>();
  readonly size = input(16);
  readonly strokeWidth = input(1.6);
  readonly label = input<string>();

  // Core (síncrono) → set completo de Figma (perezoso, por categoría) → 'dot' si no existe.
  // Mientras se descarga el chunk de un ícono del set completo se dibuja un svg vacío del mismo tamaño.
  private readonly raw = computed(() => {
    const n = this.name();
    return icons[n] ?? ramaIcons()[n] ?? (unknown().has(n) ? icons['dot'] : '');
  });
  // Los SVG exportados de Figma (Iconsax) vienen dibujados con relleno; los provisionales, con trazo.
  readonly fromFigma = computed(() => this.raw().startsWith('<!--viewBox:'));
  readonly viewBox = computed(() => this.raw().match(/^<!--viewBox:([^>]+)-->/)?.[1] ?? '0 0 16 16');
  // Registro interno y estático (no entrada de usuario): es seguro marcarlo como confiable.
  readonly body = computed(() => this.sanitizer.bypassSecurityTrustHtml(this.raw()));

  constructor() {
    effect(() => {
      const n = this.name();
      if (icons[n] || ramaIcons()[n] || unknown().has(n)) return;
      loadRamaIcon(n).then(ok => { if (!ok) unknown.update(s => new Set(s).add(n)); }, () => unknown.update(s => new Set(s).add(n)));
    });
  }
}
