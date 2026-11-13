import type { StorybookConfig } from '@storybook/angular-vite';

const config: StorybookConfig = {
  "stories": [
    "../src/**/*.mdx",
    "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"
  ],
  "addons": [
    "@storybook/addon-a11y",
    "@storybook/addon-docs"
  ],
  "framework": "@storybook/angular-vite",
  // Imágenes del sistema (ayudas del menú, foto de usuario de ejemplo) servidas desde /public.
  "staticDirs": ["../public"],
  "features": { "sidebarOnboardingChecklist": false, "menuOnboardingChecklist": false, "interactions": false },
  "core": { "disableTelemetry": true, "disableWhatsNewNotifications": true }
};
export default config;
