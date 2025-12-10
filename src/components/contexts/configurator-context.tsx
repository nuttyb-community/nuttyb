'use client';

import React, { createContext, useCallback, useContext, useMemo } from 'react';

import type { Configuration } from '@/lib/configuration';
import {
    createStoredConfiguration,
    getDefaultStoredConfiguration,
    StoredConfiguration,
    validateStoredConfiguration,
} from '@/lib/storage/configuration-storage';
import { CONFIGURATION_STORAGE_KEY } from '@/lib/storage/storage-keys';
import { useLocalStorage } from '@/lib/storage/use-local-storage';

interface ConfiguratorContextValue {
    configuration: Configuration;
    setProperty: <K extends keyof Configuration>(
        key: K,
        value: Configuration[K]
    ) => void;
    /** Whether configuration is still loading from localStorage */
    isLoading: boolean;
}

const ConfiguratorContext = createContext<ConfiguratorContextValue | undefined>(
    undefined
);

export function useConfiguratorContext(): ConfiguratorContextValue {
    const context = useContext(ConfiguratorContext);

    if (!context)
        throw new Error(
            'useConfiguratorContext must be used within a ConfiguratorProvider'
        );

    return context;
}

interface ConfiguratorProviderProps {
    children: React.ReactNode;
}

export function ConfiguratorProvider({ children }: ConfiguratorProviderProps) {
    const [storedConfig, setStoredConfig, isLoaded] =
        useLocalStorage<StoredConfiguration>(
            CONFIGURATION_STORAGE_KEY,
            getDefaultStoredConfiguration(),
            {
                onLoad: validateStoredConfiguration,
            }
        );

    const configuration = storedConfig.configuration;

    const setProperty = useCallback(
        <K extends keyof Configuration>(key: K, value: Configuration[K]) => {
            setStoredConfig((prev) =>
                createStoredConfiguration({
                    ...prev.configuration,
                    [key]: value,
                })
            );
        },
        [setStoredConfig]
    );

    const value = useMemo<ConfiguratorContextValue>(
        () => ({
            configuration,
            setProperty,
            isLoading: !isLoaded,
        }),
        [configuration, setProperty, isLoaded]
    );

    return (
        <ConfiguratorContext.Provider value={value}>
            {children}
        </ConfiguratorContext.Provider>
    );
}
