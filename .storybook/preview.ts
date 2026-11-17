import type { Decorator, Preview } from '@storybook/angular-vite';
import { themes } from '../src/tokens/tokens';

const withTheme: Decorator = (story, context) => {
  const theme = context.globals['theme'] ?? 'rama';
  if (theme === 'rama') document.documentElement.removeAttribute('data-theme');
  else document.documentElement.setAttribute('data-theme', theme);
  return story();
};

const preview: Preview = {
  decorators: [withTheme],
  globalTypes: {
    theme: {
      description: 'Modo de color del sistema de diseño',
      toolbar: {
        title: 'Tema',
        icon: 'paintbrush',
        items: Object.entries(themes).map(([value, t]) => ({ value, title: t.label })),
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { theme: 'rama' },
  parameters: {
    controls: {
      // Miembros internos de los componentes (computed, métodos, ControlValueAccessor): no son API pública.
      exclude: /^(current|results|searching|onDocClick|spec|lineHeight|closed|closeNote|busy|activate|active|add|allOnPageSelected|apply|ariaSort|body|buttons|canGo|choose|chooseMonth|chooseYear|circumference|clamped|classes|clear|closeMenu|colCount|descId|detail|dialog|dismiss|dismissed|display|displayText|draft|draftRange|dragging|expanded|expandedGroups|field|fileInput|filtered|focus|focusables|focused|fontPx|formDisabled|fromFigma|full|generalError|goTo|group|handleKey|hasLower|hasSelection|host|iconPx|iconSize|icons|id|isDisabled|isExpanded|isSelected|itemType|keyOf|leaves|list|loadedCount|months|offset|onChange|onDocClick|onDragOver|onDrop|onFocusOut|onInput|onKey|onKeydown|onPick|onToggle|onTouched|onTreeKey|onType|openMenu|openPanel|optionId|outOfBounds|overlayIconPx|ownValue|page|pageCount|pageRows|panel|pick|previous|px|query|rangeLabel|raw|registerOnChange|registerOnTouched|remove|resolvedTone|restore|rowId|sanitizer|select|selectedOptions|selection|setDisabledState|shiftMonth|showStrength|someOnPageSelected|sortDir|sortKey|sortedRows|strength|strengthLabel|summary|titleId|toggle|toggleAll|toggleExpand|toggleGroup|toggleRow|toggleSort|toggleView|trap|uid|validate|view|viewBox|viewMonth|wasOpen|weekdays|weeks|writeValue|years)$/,
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    options: {
      // Atomic Design: Introducción → Fundamentos (tokens) → Átomos → Moléculas → Organismos → Plantillas → Páginas → Guías.
      // Regla: un componente solo contiene piezas de su nivel o de niveles inferiores.
      // Dentro de cada nivel, el orden de ORDER (de lo más simple a lo más compuesto); luego, el orden de las historias.
      // @ts-ignore -- Storybook evalúa esta función como JavaScript plano: no admite anotaciones de tipo.
      storySort: (a, b) => {
        const LEVELS = ['Introducción', 'Fundamentos', 'Átomos', 'Moléculas', 'Organismos', 'Plantillas', 'Páginas', 'Guías'];
        const ORDER = [
          'Colores', 'Tipografía', 'Íconos', 'Sombras y desenfoques', 'Espacios, grillas y bordes',
          'Button', 'Badge', 'Tag', 'Avatar', 'Label', 'Checkbox y Radio', 'Table button', 'Porcentaje',
          'Input y Text area', 'Button group', 'Breadcrumb', 'Tabs', 'Search table', 'Dropdown list', 'Calendar', 'Alert', 'Card', 'File state', 'Uploader button',
          'Menú y Sidebar', 'Menú y Sidebar · versión actual', 'Formulario', 'Autocomplete', 'Search input', 'Datepicker', 'Table', 'Modal y Pop up', 'Panel lateral', 'Uploader card', 'Uploader de documentos',
          'Mis responsabilidades', 'Barra de filtros', 'Bandeja',
          'Badge vs Tag',
        ];
        const [la, na] = a.title.split('/');
        const [lb, nb] = b.title.split('/');
        if (la !== lb) return LEVELS.indexOf(la) - LEVELS.indexOf(lb);
        if (a.title === b.title) return 0;
        const ia = ORDER.indexOf(na), ib = ORDER.indexOf(nb);
        if (ia !== -1 && ib !== -1) return ia - ib;
        return (na || '').localeCompare(nb || '', 'es');
      },
    },
    a11y: {
      test: 'todo',
    },
  },
};

export default preview;
