'use client';

import { useCallback, useEffect, useReducer, useRef } from 'react';

/**
 * Options for the useLocalStorage hook.
 */
interface UseLocalStorageOptions<T> {
    /**
     * Called when stored data is loaded from localStorage.
     * Can be used to validate/migrate data or check version compatibility.
     * Return null to use defaultValue instead of the stored value.
     */
    onLoad?: (stored: T) => T | null;
}

/**
 * Result tuple from useLocalStorage hook.
 */
type UseLocalStorageResult<T> = [
    /** Current value (defaultValue until hydration completes) */
    value: T,
    /** Update the stored value */
    setValue: (value: T | ((prev: T) => T)) => void,
    /** Whether localStorage has been loaded (false during SSR/hydration) */
    isLoaded: boolean,
];

/**
 * SSR-safe localStorage hook with hydration mismatch prevention.
 *
 * Uses ref + forceRender pattern to avoid React hydration errors:
 * - During SSR and initial hydration, returns defaultValue
 * - After hydration, loads from localStorage and triggers re-render
 * - All updates are immediately persisted to localStorage
 *
 * @param key localStorage key
 * @param defaultValue Value to use when no stored data exists or during SSR
 * @param options Optional configuration (onLoad validator/migrator)
 * @returns Tuple of [value, setValue, isLoaded]
 *
 * @example
 * ```tsx
 * const [config, setConfig, isLoaded] = useLocalStorage(
 *     'my-config',
 *     { theme: 'dark' },
 *     {
 *         onLoad: (stored) => {
 *             // Validate version, return null to reset
 *             if (stored.version !== CURRENT_VERSION) return null;
 *             return stored;
 *         }
 *     }
 * );
 * ```
 */
export function useLocalStorage<T>(
    key: string,
    defaultValue: T,
    options?: UseLocalStorageOptions<T>
): UseLocalStorageResult<T> {
    // Store data in ref to avoid hydration mismatch
    const valueRef = useRef<T>(defaultValue);
    const isLoadedRef = useRef(false);

    // Force re-render mechanism
    const [, forceRender] = useReducer((x: number) => x + 1, 0);

    // Load from localStorage after hydration
    useEffect(() => {
        if (typeof window === 'undefined') return;

        try {
            const stored = localStorage.getItem(key);
            if (stored) {
                const parsed = JSON.parse(stored) as T;
                // Apply onLoad validator/migrator if provided
                const validated = options?.onLoad
                    ? options.onLoad(parsed)
                    : parsed;

                if (validated !== null) {
                    valueRef.current = validated;
                } else {
                    // onLoad returned null, clear stale storage and use default
                    localStorage.removeItem(key);
                    valueRef.current = defaultValue;
                }
            }
        } catch {
            // Ignore parse errors, use default value
        }

        isLoadedRef.current = true;
        forceRender();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [key]);

    // Setter that updates ref and persists to localStorage
    const setValue = useCallback(
        (valueOrUpdater: T | ((prev: T) => T)) => {
            const newValue =
                typeof valueOrUpdater === 'function'
                    ? (valueOrUpdater as (prev: T) => T)(valueRef.current)
                    : valueOrUpdater;

            valueRef.current = newValue;
            forceRender();

            try {
                localStorage.setItem(key, JSON.stringify(newValue));
            } catch {
                // Ignore storage errors (quota exceeded, etc.)
            }
        },
        [key]
    );

    return [valueRef.current, setValue, isLoadedRef.current];
}
