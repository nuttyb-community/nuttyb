/**
 * Centralized localStorage keys for the application.
 * All storage keys should be defined here to avoid collisions and enable easy management.
 */

/**
 * Key for storing user's configuration settings (game mode, difficulty, etc.).
 * Includes version tracking via Git SHA for automatic cache invalidation.
 */
export const CONFIGURATION_STORAGE_KEY = 'nuttyb-configuration';

/**
 * Key for storing user's custom Lua tweaks.
 * This data is version-independent and persists across app updates.
 */
export const CUSTOM_TWEAKS_STORAGE_KEY = 'nuttyb-custom-tweaks';

/**
 * Key for storing editor sort mode preference (alphabet or tweaktype).
 */
export const EDITOR_SORT_MODE_STORAGE_KEY = 'nuttyb-editor-sort-mode';

/**
 * Key for storing custom user-saved presets.
 */
export const LOCAL_PRESETS_STORAGE_KEY = 'nuttyb-local-presets';

/**
 * Key for storing user's currently active preset ID.
 */
export const ACTIVE_PRESET_ID_STORAGE_KEY = 'nuttyb-active-preset-id';
