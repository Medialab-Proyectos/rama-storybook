// Manejo de foco compartido por rama-modal y rama-side-panel: guarda el elemento activo al abrir,
// lleva el foco al diálogo, lo mantiene dentro con Tab/Shift+Tab y lo devuelve al cerrar.

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export class DialogFocus {
  private previous: HTMLElement | null = null;

  activate(container: HTMLElement) {
    this.previous = document.activeElement as HTMLElement | null;
    const first = this.focusables(container).find(el => !el.hasAttribute('data-dialog-close')) ?? container;
    first.focus();
  }

  restore() {
    this.previous?.focus?.();
    this.previous = null;
  }

  trap(event: KeyboardEvent, container: HTMLElement) {
    if (event.key !== 'Tab') return;
    const items = this.focusables(container);
    if (!items.length) { event.preventDefault(); container.focus(); return; }
    const first = items[0];
    const last = items[items.length - 1];
    const active = document.activeElement;
    if (event.shiftKey && (active === first || !container.contains(active))) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && active === last) { event.preventDefault(); first.focus(); }
  }

  private focusables(container: HTMLElement): HTMLElement[] {
    return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(el => el.offsetParent !== null || el === document.activeElement);
  }
}
