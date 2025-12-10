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
