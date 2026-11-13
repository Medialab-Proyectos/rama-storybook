// Fuente: design-tokens.tokens.json exportado de Figma "Rama (2)" (plugin Design Tokens) y las
// variables de los componentes. El archivo tiene dos modos de color: Rama (azul, el que usan los
// componentes) y Ecopetrol (verde, el del export JSON). Difieren en la escala primaria y, en Rama,
// en los semánticos information/caution/warning y el borde default (leídos de los componentes).

export type ThemeName = 'rama' | 'ecopetrol';
interface ThemeOverrides {
  /** Escalas de color propias del tema (reemplazan las de `palettes`). */
  palettes?: Record<string, Record<string, string>>;
  semantic?: Record<string, Record<string, string>>;
  text?: Record<string, string>;
  border?: Record<string, string>;
}
export const themes: Record<ThemeName, { label: string; primary: Record<string, string>; overrides?: ThemeOverrides }> = {
  rama: {
    label: 'Rama (azul)',
    primary: {
      '50': '#e0f5fc', '100': '#b0e5f7', '200': '#7cd3f2', '300': '#46c2ed', '400': '#04b5eb',
      '500': '#00a8e9', '600': '#009adb', '700': '#0088c8', '800': '#0077b4', '900': '#005794',
    },
    // Neutral, blue, yellow y orange de `palettes` son los del modo Rama de Figma; los semánticos
    // (information/caution/warning, bordes, on-fill) se derivan de ellas sin overrides.
  },
  ecopetrol: {
    label: 'Ecopetrol (verde)',
    primary: {
      '50': '#e6f2ef', '100': '#cce5df', '200': '#99cbbf', '300': '#337a6b', '400': '#004236',
      '500': '#00382f', '600': '#002e27', '700': '#00241f', '800': '#001a17', '900': '#00110f',
    },
    overrides: {
      // Escalas del modo Ecopetrol de Figma (58960:130036 / 130188 / 130270 / 130352).
      palettes: {
        neutral: {
          '50': '#fafaf9', '100': '#f2f1f0', '200': '#e4e1df', '300': '#d2cecb', '400': '#b5b0ad',
          '500': '#8f8a86', '600': '#6e6964', '700': '#56514b', '800': '#403b33', '900': '#29251f',
        },
        blue: {
          '50': '#e6eef8', '100': '#ccddf1', '200': '#99bbe3', '300': '#6699d5', '400': '#3377c7',
          '500': '#00214d', '600': '#001c42', '700': '#001737', '800': '#00122b', '900': '#000d20',
        },
        yellow: {
          '50': '#fffbe8', '100': '#fff5b8', '200': '#ffee7a', '300': '#f7db17', '400': '#e0c300',
          '500': '#bfa600', '600': '#998400', '700': '#6f6000', '800': '#4a4000', '900': '#2b2500',
        },
        orange: {
          '50': '#fff0e6', '100': '#ffe0cc', '200': '#ffc199', '300': '#ffa266', '400': '#ff8333',
          '500': '#ff5f00', '600': '#d94f00', '700': '#b33f00', '800': '#803000', '900': '#4d1d00',
        },
      },
    },
  },
};

export const palettes: Record<string, Record<string, string>> = {
  primary: themes.rama.primary,
  neutral: {
    '50': '#fcfcfd', '100': '#f9fafb', '200': '#f2f4f7', '300': '#eaecf0', '400': '#c7c9d0',
    '500': '#a9abb2', '600': '#4d4d56', '700': '#3a3a41', '800': '#26262b', '900': '#131316',
    white: '#ffffff', black: '#161619',
  },
  red: {
    '50': '#fee7e6', '100': '#ffd0cc', '200': '#ffa8a0', '300': '#ff7c70', '400': '#ff4b3a',
    '500': '#e51c00', '600': '#c91800', '700': '#a91500', '800': '#8e1f0b', '900': '#290500',
  },
  green: {
    '50': '#e1faf3', '100': '#cdfee1', '200': '#82f2d0', '300': '#00edae', '400': '#00c98f',
    '500': '#009961', '600': '#29845a', '700': '#0c5132', '800': '#0e2f20', '900': '#061b12',
  },
  blue: {
    '50': '#eaf4ff', '100': '#d4eaff', '200': '#b9dcff', '300': '#91d0ff', '400': '#5fb6f5',
    '500': '#2e95d6', '600': '#0073b8', '700': '#00527c', '800': '#003a59', '900': '#002133',
  },
  yellow: {
    '50': '#f6f4ea', '100': '#fff9c7', '200': '#ffef5c', '300': '#ffe600', '400': '#d6ba00',
    '500': '#b19500', '600': '#8a7200', '700': '#4f4700', '800': '#332e00', '900': '#1f1b00',
  },
  orange: {
    '50': '#fff1e3', '100': '#ffe0b8', '200': '#ffc875', '300': '#ffb800', '400': '#f79a00',
    '500': '#d97900', '600': '#a85a00', '700': '#5e4200', '800': '#3d2b00', '900': '#251a00',
  },
  purple: {
    '50': '#f8f1ff', '100': '#efdfff', '200': '#ddb8ff', '300': '#c68cff', '400': '#ad63ff',
    '500': '#9343f0', '600': '#7a22d1', '700': '#6413a6', '800': '#46106f', '900': '#2a083f',
  },
  grey: {
    '50': '#fefeff', '100': '#e0e5f7', '200': '#c8c8cf', '300': '#b1b2b8', '400': '#98989e',
    '500': '#7a7a80', '600': '#626268', '700': '#4e4e53', '800': '#39393f', '900': '#26262b',
  },
  pink: {
    '50': '#ffebff', '100': '#ffd6f6', '200': '#ffb3ea', '300': '#ff80d6', '400': '#f84cba',
    '500': '#d91a8c', '600': '#b0006a', '700': '#760042', '800': '#52002f', '900': '#30001c',
  },
};

/** Alias semánticos de la colección "Alias" de Figma (error→red, warning→orange…). */
export const aliasPalettes: Record<string, string> = {
  error: 'red', warning: 'orange', caution: 'yellow', success: 'green', information: 'blue',
};

/** Colección "Mapped": lo que deben usar los componentes. Depende de la escala primaria del tema. */
export function buildMapped(primary: Record<string, string>, pal: Record<string, Record<string, string>> = palettes) {
  const palettes = pal;
  return {
  text: {
    'default-black': palettes['neutral']['black'],
    'default-white': palettes['neutral']['white'],
    complementary: '#6c6c6c',
    muted: '#656d76',
    subtle: '#a0a9b4',
    disabled: '#cdd0d5',
    support: '#4a4a4a',
    'contrast-black': '#16161966',
    'contrast-white': '#ffffff66',
    primary: primary['400'],
    information: palettes['blue']['700'],
    success: palettes['green']['700'],
    caution: palettes['yellow']['700'],
    warning: palettes['orange']['700'],
    error: palettes['red']['800'],
  },
  background: {
    'default-black': palettes['neutral']['black'],
    'default-white': palettes['neutral']['white'],
    muted: '#1e1e23',
    inverse: '#303030',
    inset: '#f1f1f1',
    subtle: '#f6f8fa',
  },
  semantic: {
    neutro: { surface: '#ffffff', fill: '#f3f3f3', 'on-fill': '#ebebeb' },
    information: { surface: palettes['blue']['50'], fill: palettes['blue']['300'], 'on-fill': palettes['blue']['900'] },
    success: { surface: palettes['green']['50'], fill: palettes['green']['300'], 'on-fill': palettes['green']['800'] },
    caution: { surface: palettes['yellow']['50'], fill: palettes['yellow']['200'], 'on-fill': palettes['yellow']['800'] },
    warning: { surface: palettes['orange']['50'], fill: palettes['orange']['300'], 'on-fill': palettes['orange']['900'] },
    error: { surface: palettes['red']['50'], fill: palettes['red']['500'], 'on-fill': palettes['red']['900'] },
    primary: { surface: primary['100'], fill: primary['300'], 'on-fill': primary['900'], selected: palettes['blue']['50'] },
  } as Record<string, Record<string, string>>,
  border: {
    default: palettes['neutral']['300'],
    inset: '#d8dee4',
    disabled: palettes['neutral']['300'],
    muted: '#27272d',
    primary: primary['400'],
    'primary-emphasis': primary['900'],
    info: palettes['blue']['300'],
    'info-emphasis': palettes['blue']['900'],
    success: palettes['green']['100'],
    'success-emphasis': palettes['green']['600'],
    caution: palettes['yellow']['300'],
    'caution-emphasis': palettes['yellow']['800'],
    warning: palettes['orange']['300'],
    'warning-emphasis': palettes['orange']['900'],
    error: palettes['red']['50'],
    'error-emphasis': palettes['red']['500'],
  },
  };
}

/** Escalas de un tema: las base con las que el tema reemplaza. */
export function themePalettes(name: ThemeName): Record<string, Record<string, string>> {
  const own = themes[name].overrides?.palettes ?? {};
  const out: Record<string, Record<string, string>> = { ...palettes };
  for (const [k, scale] of Object.entries(own)) out[k] = { ...palettes[k], ...scale };
  return out;
}

/** Mapped de un tema: base calculada con su escala primaria + sus overrides. */
export function buildThemeMapped(name: ThemeName) {
  const theme = themes[name];
  const o = theme.overrides ?? {};
  const m = buildMapped(theme.primary, themePalettes(name));
  for (const [group, roles] of Object.entries(o.semantic ?? {})) m.semantic[group] = { ...m.semantic[group], ...roles };
  Object.assign(m.text, o.text ?? {});
  Object.assign(m.border, o.border ?? {});
  return m;
}

export const mapped = buildThemeMapped('rama');

/** Lista plana nombre-de-variable → valor de los tokens que dependen del tema. */
function themedVariables(name: ThemeName): Record<string, string> {
  const m = buildThemeMapped(name);
  const out: Record<string, string> = {};
  for (const [step, hex] of Object.entries(themes[name].primary)) out[`--rama-primary-${step}`] = hex;
  const pal = themePalettes(name);
  for (const scale of Object.keys(themes[name].overrides?.palettes ?? {})) {
    for (const [step, hex] of Object.entries(pal[scale])) out[`--rama-${scale}-${step}`] = hex;
  }
  for (const [k, hex] of Object.entries(m.text)) out[`--rama-text-${k}`] = hex;
  for (const [group, roles] of Object.entries(m.semantic)) {
    for (const [role, hex] of Object.entries(roles)) out[`--rama-${group}-${role}`] = hex;
  }
  for (const [k, hex] of Object.entries(m.border)) out[`--rama-border-${k}`] = hex;
  return out;
}

export const okrs: Record<string, string> = {
  'mint-green': '#ccffdb', red: '#ffdad8', yellow: '#fff9c1', pink: '#fbdffb', blue: '#d7ebfb',
  cyan: '#cbf9fb', green: '#ddf3d6', orange: '#ffe9cc', purple: '#dbccff', grey: '#e9ecf0',
  // "Colores OKR's | Alertas"
  'alert-red': '#ff0044', 'alert-yellow': '#ffbb00', 'alert-green': '#00edae',
};

export const transparencyLevels = [5, 10, 20, 30, 40, 50, 60, 70, 80, 90];

export const fontFamily = 'Inter';
export const fontWeights: Record<string, number> = {
  light: 300, regular: 400, medium: 500, semibold: 600, bold: 700, heavy: 900,
};

/** Estilos de texto (variante "spacing 0%"); el letter-spacing se elige aparte. */
export const textStyles: { key: string; label: string; size: number; lineHeight: number }[] = [
  { key: 'h1', label: 'Header 1', size: 84, lineHeight: 92 },
  { key: 'h2', label: 'Header 2', size: 72, lineHeight: 76 },
  { key: 'h3', label: 'Header 3', size: 60, lineHeight: 68 },
  { key: 'h4', label: 'Header 4', size: 48, lineHeight: 52 },
  { key: 's1', label: 'Subtitle 1', size: 36, lineHeight: 40 },
  { key: 's2', label: 'Subtitle 2', size: 30, lineHeight: 36 },
  { key: 'b1', label: 'Body 1', size: 24, lineHeight: 28.8 },
  { key: 'overline', label: 'Overline', size: 20, lineHeight: 24 },
  { key: 'btn1', label: 'Buttons & links 1', size: 18, lineHeight: 28 },
  { key: 'b2', label: 'Body 2', size: 16, lineHeight: 20 },
  { key: 'btn2', label: 'Buttons & links 2', size: 14, lineHeight: 16 },
  { key: 'c1', label: 'Captions 1', size: 12, lineHeight: 16 },
  { key: 'c2', label: 'Captions 2', size: 10, lineHeight: 12 },
];
/** Letter-spacing en em: los nombres de Figma son porcentajes del tamaño de letra (2% = 0.02em). */
export const letterSpacings: Record<string, number> = { '2%': 0.02, '1%': 0.01, '0%': 0, '-1%': -0.01, '-2%': -0.02 };

/** Colección "Responsive" (device size 440): tamaños para móvil. */
export const responsiveText: { label: string; size: number; lineHeight: number }[] = [
  { label: 'H1', size: 44, lineHeight: 52 }, { label: 'H2', size: 40, lineHeight: 48 },
  { label: 'H3', size: 32, lineHeight: 40 }, { label: 'H4', size: 28, lineHeight: 36 },
  { label: 'Subtitle 1', size: 28, lineHeight: 32 }, { label: 'Subtitle 2', size: 24, lineHeight: 28 },
  { label: 'Body large', size: 20, lineHeight: 24 }, { label: 'Body medium', size: 16, lineHeight: 20 },
  { label: 'Overline', size: 16, lineHeight: 20 }, { label: 'Button medium', size: 16, lineHeight: 24 },
  { label: 'Button small', size: 14, lineHeight: 16 }, { label: 'Caption 1', size: 12, lineHeight: 16 },
  { label: 'Caption 2', size: 10, lineHeight: 12 },
];

export const spacing = [4, 8, 10, 12, 14, 16, 20, 24, 32, 40, 48, 64, 80, 96, 128, 160, 192, 224, 256];

export const radius: Record<string, number> = {
  none: 0, '2xs': 2, xs: 4, small: 8, medium: 12, large: 16, xl: 24, '2xl': 32, full: 999,
};
export const borderWidth: Record<string, number> = {
  none: 0, subtle: 0.5, thin: 1, medium: 2, thick: 3, heavy: 4,
};

export const shadows: Record<string, string> = {
  'x-small': '0 1px 2px 0 #e4e5e73d',
  small: '6px 6px 10px 0 #7884950d',
  medium: '6px 6px 15px 0 #78849526',
  large: '0 12px 16px -4px #78849526, 0 4px 6px -2px #78849514',
  'x-large': '10px 10px 15px 0 #7884951a',
  '2x-large': '15px 15px 35px 0 #78849521',
};

export const blur: Record<string, number> = {
  none: 0, '2xs': 10, xs: 15, small: 20, medium: 40, large: 80, xl: 120, '2xl': 300,
};

export const grids: { name: string; columns: number; gutter: number; offset: number }[] = [
  { name: 'Desktop 12 columnas + padding', columns: 12, gutter: 32, offset: 112 },
  { name: 'Desktop 12 columnas', columns: 12, gutter: 32, offset: 0 },
  { name: 'Desktop 8 columnas', columns: 8, gutter: 32, offset: 0 },
  { name: 'Desktop 6 columnas', columns: 6, gutter: 32, offset: 0 },
  { name: 'Desktop 5 columnas', columns: 5, gutter: 32, offset: 0 },
  { name: 'Desktop 4 columnas', columns: 4, gutter: 32, offset: 0 },
  { name: 'Desktop 3 columnas', columns: 3, gutter: 32, offset: 0 },
  { name: 'Desktop 2 columnas', columns: 2, gutter: 32, offset: 0 },
];

function hexToRgb(hex: string): string {
  const h = hex.replace('#', '');
  return [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16)).join(', ');
}

/** Genera todas las custom properties --rama-* a partir de los tokens. */
export function buildCssVariables(): string {
  const v: string[] = [];
  for (const [name, scale] of Object.entries(palettes)) {
    for (const [step, hex] of Object.entries(scale)) v.push(`--rama-${name}-${step}: ${hex};`);
  }
  for (const lvl of transparencyLevels) {
    v.push(`--rama-black-${lvl}: rgba(${hexToRgb(palettes['neutral']['black'])}, ${lvl / 100});`);
    v.push(`--rama-white-${lvl}: rgba(255, 255, 255, ${lvl / 100});`);
  }
  for (const [k, hex] of Object.entries(mapped.text)) v.push(`--rama-text-${k}: ${hex};`);
  for (const [k, hex] of Object.entries(mapped.background)) v.push(`--rama-bg-${k}: ${hex};`);
  for (const [group, roles] of Object.entries(mapped.semantic)) {
    for (const [role, hex] of Object.entries(roles)) v.push(`--rama-${group}-${role}: ${hex};`);
  }
  for (const [k, hex] of Object.entries(mapped.border)) v.push(`--rama-border-${k}: ${hex};`);
  for (const [k, hex] of Object.entries(okrs)) v.push(`--rama-okr-${k}: ${hex};`);
  v.push(`--rama-font: '${fontFamily}', system-ui, sans-serif;`);
  for (const [k, w] of Object.entries(fontWeights)) v.push(`--rama-weight-${k}: ${w};`);
  for (const s of spacing) v.push(`--rama-space-${s}: ${s}px;`);
  for (const [k, r] of Object.entries(radius)) v.push(`--rama-radius-${k}: ${r}px;`);
  for (const [k, w] of Object.entries(borderWidth)) v.push(`--rama-border-width-${k}: ${w}px;`);
  for (const [k, s] of Object.entries(shadows)) v.push(`--rama-shadow-${k}: ${s};`);
  // Figma exporta un background blur de radio R como CSS blur(R/2); el token ya trae el valor CSS.
  for (const [k, b] of Object.entries(blur)) v.push(`--rama-blur-${k}: ${b / 2}px;`);
  // Focus ring de Figma: halo de 3px en primary-300 al 15 % más dos sombras sutiles.
  v.push(`--rama-focus-ring: 0 0 0 3px color-mix(in srgb, var(--rama-primary-300) 15%, transparent), 0 1px 2px 0 rgba(151, 71, 255, 0.1), 0 1px 3px 0 rgba(151, 71, 255, 0.14);`);
  let css = `:root {\n  ${v.join('\n  ')}\n}\n`;

  const base: Record<string, string> = { ...themedVariables('rama') };
  for (const [name, scale] of Object.entries(palettes)) for (const [step, hex] of Object.entries(scale)) base[`--rama-${name}-${step}`] = hex;
  for (const name of Object.keys(themes) as ThemeName[]) {
    if (name === 'rama') continue;
    const diff = Object.entries(themedVariables(name)).filter(([k, val]) => base[k] !== val);
    css += `\n[data-theme="${name}"] {\n  ${diff.map(([k, val]) => `${k}: ${val};`).join('\n  ')}\n}\n`;
  }
  return css;
}
