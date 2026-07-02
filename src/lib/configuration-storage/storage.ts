import {
    CHALLENGES,
    Configuration,
    DEFAULT_CONFIGURATION,
    MAPS,
    PRESET_DIFFICULTIES,
    START_OPTIONS,
} from '@/lib/command-generator/data/configuration';

/** Enum fields mapped to their allowed value sets, for sanitization. */
const ENUM_FIELDS: {
    [K in
        | 'presetDifficulty'
        | 'challenges'
        | 'gameMap'
        | 'start']: readonly Configuration[K][];
} = {
    presetDifficulty: PRESET_DIFFICULTIES,
    challenges: CHALLENGES,
    gameMap: MAPS,
    start: START_OPTIONS,
};

/**
 * Sanitizes an untrusted/unknown value into a complete, valid Configuration.
 * Unknown keys are dropped, enum fields fall back to defaults when the value
 * isn't in the allowed set, and primitive fields fall back to defaults when
 * the type doesn't match (or the number isn't finite).
 *
 * @param partial Untrusted candidate configuration (e.g. parsed JSON)
 * @returns A complete, valid Configuration
 */
export function sanitizeConfiguration(partial: unknown): Configuration {
    if (
        typeof partial !== 'object' ||
        partial === null ||
        Array.isArray(partial)
    ) {
        return { ...DEFAULT_CONFIGURATION };
    }

    const input = partial as Record<string, unknown>;
    const result = { ...DEFAULT_CONFIGURATION } as Configuration;
    const validKeys = Object.keys(
        DEFAULT_CONFIGURATION
    ) as (keyof Configuration)[];

    for (const key of validKeys) {
        if (!(key in input)) continue;
        const value = input[key];
        const defaultValue = DEFAULT_CONFIGURATION[key];

        if (key in ENUM_FIELDS) {
            const allowedValues = ENUM_FIELDS[key as keyof typeof ENUM_FIELDS];
            if ((allowedValues as readonly unknown[]).includes(value)) {
                (result as unknown as Record<string, unknown>)[key] = value;
            }
            continue;
        }

        if (typeof value !== typeof defaultValue) {
            continue;
        }

        if (typeof value === 'number' && !Number.isFinite(value)) {
            continue;
        }

        (result as unknown as Record<string, unknown>)[key] = value;
    }

    return result;
}

/**
 * Structure stored in localStorage for configuration.
 * Includes Git SHA for version tracking.
 */
export interface StoredConfiguration {
    /** The user's saved configuration */
    configuration: Configuration;
    /** Git SHA of the app version when config was saved */
    gitSha: string;
}

/**
 * Get the current Git SHA from environment.
 * Returns 'development' if not set (local dev without git).
 */
function getCurrentGitSha(): string {
    return process.env.NEXT_PUBLIC_GIT_SHA ?? 'development';
}

/**
 * Default stored configuration with current Git SHA.
 */
export function getDefaultStoredConfiguration(): StoredConfiguration {
    return {
        configuration: DEFAULT_CONFIGURATION,
        gitSha: getCurrentGitSha(),
    };
}

/**
 * Validates stored configuration against current app version.
 * Merges stored config with defaults to ensure all fields exist.
 *
 * @param stored The stored configuration from localStorage
 * @returns The stored configuration merged with defaults, or null if invalid
 */
export function validateStoredConfiguration(
    stored: StoredConfiguration
): StoredConfiguration | null {
    // Ensure configuration object exists
    if (!stored.configuration || typeof stored.configuration !== 'object') {
        return null;
    }

    return {
        configuration: sanitizeConfiguration(stored.configuration),
        gitSha: getCurrentGitSha(),
    };
}

/**
 * Creates a StoredConfiguration object with the current Git SHA.
 *
 * @param configuration The configuration to wrap
 * @returns StoredConfiguration ready for persistence
 */
export function createStoredConfiguration(
    configuration: Configuration
): StoredConfiguration {
    return {
        configuration,
        gitSha: getCurrentGitSha(),
    };
}
