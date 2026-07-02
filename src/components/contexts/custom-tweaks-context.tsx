'use client';

import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
} from 'react';

import { useLocalStorage } from '@/hooks/use-local-storage';
import type {
    CustomTweak,
    EnabledCustomTweak,
} from '@/lib/command-generator/command-generator';
import { CUSTOM_TWEAKS_STORAGE_KEY } from '@/lib/configuration-storage/keys';
import { LuaTweakType } from '@/types/types';

interface CustomTweaksContextValue {
    /** All saved custom tweaks */
    customTweaks: CustomTweak[];
    /** Add a new custom tweak */
    addTweak: (
        description: string,
        type: LuaTweakType,
        code: string
    ) => CustomTweak;
    /** Delete a custom tweak by ID */
    deleteTweak: (id: number) => void;
    /** Toggle enabled state for a tweak */
    toggleTweak: (id: number) => void;
    /** Check if a tweak is enabled */
    isEnabled: (id: number) => boolean;
    /** Get all enabled tweaks for command generation */
    getEnabledTweaks: () => EnabledCustomTweak[];
    /** Clear all enabled tweaks (disable all) */
    clearEnabledTweaks: () => void;
    /** Move a tweak up in priority order */
    moveTweakUp: (id: number) => void;
    /** Move a tweak down in priority order */
    moveTweakDown: (id: number) => void;
    /** Set of currently enabled tweak IDs */
    enabledIds: Set<number>;
    /** Whether the custom tweaks are still loading from storage */
    isLoading: boolean;
}

const CustomTweaksContext = createContext<CustomTweaksContextValue | undefined>(
    undefined
);

export function useCustomTweaksContext(): CustomTweaksContextValue {
    const context = useContext(CustomTweaksContext);

    if (!context) {
        throw new Error(
            'useCustomTweaksContext must be used within a CustomTweaksProvider'
        );
    }

    return context;
}

interface CustomTweaksProviderProps {
    children: React.ReactNode;
}

interface StoredData {
    tweaks: CustomTweak[];
    enabledIds: number[];
}

const DEFAULT_STORED_DATA: StoredData = { tweaks: [], enabledIds: [] };

/** Result of validating/migrating stored data */
interface MigrationResult {
    data: StoredData;
    /** True when stored data was missing fields and needs persisting back */
    didMigrate: boolean;
}

/**
 * Validates and migrates stored custom tweaks data.
 * Assigns missing priority/source fields (added in later schema versions).
 * Returns null if data is invalid/corrupted to reset to defaults.
 */
function validateAndMigrateStoredData(
    stored: StoredData
): MigrationResult | null {
    // Ensure required structure exists
    if (!stored || typeof stored !== 'object') {
        return null;
    }

    // Ensure arrays exist and are valid
    if (!Array.isArray(stored.tweaks) || !Array.isArray(stored.enabledIds)) {
        return null;
    }

    // Validate each tweak has required properties
    for (const tweak of stored.tweaks) {
        if (
            typeof tweak.id !== 'number' ||
            typeof tweak.type !== 'string' ||
            typeof tweak.code !== 'string'
        ) {
            return null;
        }
    }

    const didMigrate = stored.tweaks.some(
        (tweak) => tweak.priority === undefined || tweak.source === undefined
    );

    // Migrate: assign missing priorities (by array index) and source
    // (everything stored under this key was saved by the user)
    const migratedTweaks = stored.tweaks.map((tweak, index) => ({
        ...tweak,
        priority: tweak.priority ?? index,
        source: tweak.source ?? ('user' as const),
    }));

    return {
        data: {
            ...stored,
            tweaks: migratedTweaks,
        },
        didMigrate,
    };
}

export function CustomTweaksProvider({ children }: CustomTweaksProviderProps) {
    const didMigrateRef = useRef(false);

    const [storedData, setStoredData, isLoaded] = useLocalStorage<StoredData>(
        CUSTOM_TWEAKS_STORAGE_KEY,
        DEFAULT_STORED_DATA,
        {
            onLoad: (stored) => {
                const result = validateAndMigrateStoredData(stored);
                if (!result) return null;
                didMigrateRef.current = result.didMigrate;
                return result.data;
            },
        }
    );

    // Persist migrated data back to localStorage after initial load,
    // but only when a migration actually changed something
    useEffect(() => {
        if (isLoaded && didMigrateRef.current) {
            didMigrateRef.current = false;
            setStoredData(storedData);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isLoaded]); // Only run once when data finishes loading

    const customTweaks = storedData.tweaks;
    const enabledIds = useMemo(
        () => new Set(storedData.enabledIds),
        [storedData.enabledIds]
    );

    const addTweak = useCallback(
        (
            description: string,
            type: LuaTweakType,
            code: string
        ): CustomTweak => {
            const newTweak: CustomTweak = {
                id: Date.now(),
                description: description.trim(),
                type,
                code: code.trim(),
                source: 'user',
                priority:
                    customTweaks.length > 0
                        ? Math.max(...customTweaks.map((t) => t.priority)) + 1
                        : 0,
            };
            setStoredData((prev) => ({
                ...prev,
                tweaks: [...prev.tweaks, newTweak],
            }));
            return newTweak;
        },
        [setStoredData, customTweaks]
    );

    const deleteTweak = useCallback(
        (id: number) => {
            setStoredData((prev) => ({
                tweaks: prev.tweaks.filter((tweak) => tweak.id !== id),
                enabledIds: prev.enabledIds.filter(
                    (enabledId) => enabledId !== id
                ),
            }));
        },
        [setStoredData]
    );

    const toggleTweak = useCallback(
        (id: number) => {
            setStoredData((prev) => ({
                ...prev,
                enabledIds: prev.enabledIds.includes(id)
                    ? prev.enabledIds.filter((enabledId) => enabledId !== id)
                    : [...prev.enabledIds, id],
            }));
        },
        [setStoredData]
    );

    const isEnabled = useCallback(
        (id: number): boolean => enabledIds.has(id),
        [enabledIds]
    );

    const getEnabledTweaks = useCallback((): EnabledCustomTweak[] => {
        return customTweaks
            .filter((tweak) => enabledIds.has(tweak.id))
            .map((tweak) => ({ ...tweak, enabled: true }));
    }, [customTweaks, enabledIds]);

    const clearEnabledTweaks = useCallback(() => {
        setStoredData((prev) => ({
            ...prev,
            enabledIds: [],
        }));
    }, [setStoredData]);

    const moveTweakUp = useCallback(
        (id: number) => {
            setStoredData((prev) => {
                const sorted = prev.tweaks.toSorted(
                    (a, b) => a.priority - b.priority
                );
                const index = sorted.findIndex((t) => t.id === id);

                if (index <= 0) return prev; // Already first or not found

                // Swap priorities with previous tweak
                const updated = [...sorted];
                const temp = updated[index - 1].priority;
                updated[index - 1] = {
                    ...updated[index - 1],
                    priority: updated[index].priority,
                };
                updated[index] = { ...updated[index], priority: temp };

                return {
                    ...prev,
                    tweaks: updated,
                };
            });
        },
        [setStoredData]
    );

    const moveTweakDown = useCallback(
        (id: number) => {
            setStoredData((prev) => {
                const sorted = prev.tweaks.toSorted(
                    (a, b) => a.priority - b.priority
                );
                const index = sorted.findIndex((t) => t.id === id);

                if (index === -1 || index >= sorted.length - 1) return prev; // Not found or already last

                // Swap priorities with next tweak
                const updated = [...sorted];
                const temp = updated[index + 1].priority;
                updated[index + 1] = {
                    ...updated[index + 1],
                    priority: updated[index].priority,
                };
                updated[index] = { ...updated[index], priority: temp };

                return {
                    ...prev,
                    tweaks: updated,
                };
            });
        },
        [setStoredData]
    );

    const value = useMemo<CustomTweaksContextValue>(
        () => ({
            customTweaks,
            addTweak,
            deleteTweak,
            toggleTweak,
            isEnabled,
            getEnabledTweaks,
            clearEnabledTweaks,
            moveTweakUp,
            moveTweakDown,
            enabledIds,
            isLoading: !isLoaded,
        }),
        [
            customTweaks,
            addTweak,
            deleteTweak,
            toggleTweak,
            isEnabled,
            getEnabledTweaks,
            clearEnabledTweaks,
            moveTweakUp,
            moveTweakDown,
            enabledIds,
            isLoaded,
        ]
    );

    return (
        <CustomTweaksContext.Provider value={value}>
            {children}
        </CustomTweaksContext.Provider>
    );
}
