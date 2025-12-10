import { Configuration, DEFAULT_CONFIGURATION } from '@/lib/configuration';

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
 * Returns the configuration if valid, or null if version mismatch.
 *
 * @param stored The stored configuration from localStorage
 * @returns The stored configuration if valid, null otherwise
 */
export function validateStoredConfiguration(
    stored: StoredConfiguration
): StoredConfiguration | null {
    const currentSha = getCurrentGitSha();

    // Version mismatch - invalidate stored config
    if (stored.gitSha !== currentSha) {
        return null;
    }

    // Ensure configuration object has all required fields
    // (handles cases where new fields were added in updates)
    if (!stored.configuration || typeof stored.configuration !== 'object') {
        return null;
    }

    return stored;
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
