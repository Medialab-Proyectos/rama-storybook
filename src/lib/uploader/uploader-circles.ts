// Fondo decorativo de los uploaders tipo tarjeta (Figma 22 Uploaders · "Background"): círculos
// concéntricos de 128 a 992 px (cada 96 px) en #EAECF0 (token border-default), con la máscara degradada vertical de Figma
// (opaco hasta el 43,7 % y transparente desde el 66,2 %). Se dibuja con los mismos valores del asset.
let nextId = 0;

const SIZES = [128, 224, 320, 416, 512, 608, 704, 800, 896, 992];

export function uploaderCirclesSvg(): string {
  const id = `rama-uc-mask-${nextId++}`;
  const circles = SIZES.map(s =>
    `<circle cx="496" cy="496" r="${s / 2 - 0.5}" style="stroke: var(--rama-border-default)"${s === 128 ? '' : ' opacity="0.9"'}/>`).join('');
  return `<svg viewBox="0 0 992 992" width="992" height="992" fill="none" aria-hidden="true">
    <defs>
      <linearGradient id="${id}-g" x1="496" y1="0" x2="496" y2="992" gradientUnits="userSpaceOnUse">
        <stop offset="0.437233" stop-color="white"/><stop offset="0.662338" stop-color="white" stop-opacity="0"/>
      </linearGradient>
      <mask id="${id}"><rect width="992" height="992" fill="url(#${id}-g)"/></mask>
    </defs>
    <g mask="url(#${id})">${circles}</g>
  </svg>`;
}
