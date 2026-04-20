/**
 * Theme Configuration — barrel re-export
 *
 * All theme data lives in focused modules under ./theme-data/.
 * This file re-exports everything so existing imports keep working.
 */

export { aboutThemes, getAboutTheme } from './theme-data/about';
export { analyticsThemeMap } from './theme-data/analytics';
export { bootMessages, getBootMessages } from './theme-data/boot';
export { getThemeLogo, themeLogos, themePrompts } from './theme-data/branding';
export { contribution3DVariantMap, getContribution3DVariant } from './theme-data/contribution-3d';
export { getCurrentTheme, getThemeConfig, themeConfig } from './theme-data/core';
export { getStatusBarConfig, themeStatusBars } from './theme-data/status-bar';
export { getThemeToasts, themeToasts } from './theme-data/toasts';
export { themeTypewriterTexts } from './theme-data/typewriter';
