'use client';

import React, { createContext, useCallback, useContext, useMemo } from 'react';

import type {
    CustomTweak,
    EnabledCustomTweak,
    LuaTweakType,
} from '@/lib/commands/custom-tweaks';
import { CUSTOM_TWEAKS_STORAGE_KEY } from '@/lib/storage/storage-keys';
import { useLocalStorage } from '@/lib/storage/use-local-storage';

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

export function CustomTweaksProvider({ children }: CustomTweaksProviderProps) {
    const [storedData, setStoredData, isLoaded] = useLocalStorage<StoredData>(
        CUSTOM_TWEAKS_STORAGE_KEY,
        DEFAULT_STORED_DATA
    );

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
            };
            setStoredData((prev) => ({
                ...prev,
                tweaks: [...prev.tweaks, newTweak],
            }));
            return newTweak;
        },
        [setStoredData]
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

    const value = useMemo<CustomTweaksContextValue>(
        () => ({
            customTweaks,
            addTweak,
            deleteTweak,
            toggleTweak,
            isEnabled,
            getEnabledTweaks,
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
