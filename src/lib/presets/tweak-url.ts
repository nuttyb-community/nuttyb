/**
 * Trust policy for remote preset tweak sources.
 *
 * Remote tweaks are fetched at runtime and packed into the generated lobby
 * commands, so the set of hosts we are willing to fetch from is a security
 * boundary. Keep this list as the single source of truth and enforce it both
 * in the UI (import/save validation) and at the fetch boundary.
 */

/** Hostnames permitted for remote preset tweak sources. */
const ALLOWED_TWEAK_HOSTS = new Set([
    'raw.githubusercontent.com',
    'gist.githubusercontent.com',
]);

/**
 * True only for `https://` URLs hosted on an allowed remote tweak host.
 * Use this to gate the actual network fetch.
 */
export function isAllowedRemoteTweakUrl(url: string): boolean {
    try {
        const parsed = new URL(url);
        return (
            parsed.protocol === 'https:' &&
            ALLOWED_TWEAK_HOSTS.has(parsed.hostname)
        );
    } catch {
        return false; // Invalid URL string
    }
}

/**
 * Validates a preset tweak path for UI input. Local (bundled) paths are
 * allowed; remote paths must be `https://` on an allowed host. Plain `http://`
 * is always rejected.
 */
export function isValidTweakUrl(path: string): boolean {
    if (!path.startsWith('https://')) {
        // Plain http is never allowed; anything else is treated as a local path.
        if (path.startsWith('http://')) return false;
        return true;
    }
    return isAllowedRemoteTweakUrl(path);
}
