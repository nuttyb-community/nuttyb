'use client';

import type React from 'react';
import { createContext, useCallback, useContext, useMemo } from 'react';

import { useLocalStorage } from '@/hooks/use-local-storage';
import type { Configuration } from '@/lib/command-generator/data/configuration';
import { CONFIGURATION_STORAGE_KEY } from '@/lib/configuration-storage/keys';
import {
    createStoredConfiguration,
    getDefaultStoredConfiguration,
    type StoredConfiguration,
    validateStoredConfiguration,
} from '@/lib/configuration-storage/storage';

interface ConfiguratorContextValue {
    configuration: Configuration;
    setProperty: <K extends keyof Configuration>(
        key: K,
        value: Configuration[K]
    ) => void;
    /** Replaces the entire configuration with the given one */
    setConfiguration: (config: Configuration) => void;
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

    const setConfiguration = useCallback(
        (config: Configuration) => {
            setStoredConfig(createStoredConfiguration(config));
        },
        [setStoredConfig]
    );

    const value = useMemo<ConfiguratorContextValue>(
        () => ({
            configuration,
            setProperty,
            setConfiguration,
            isLoading: !isLoaded,
        }),
        [configuration, setProperty, setConfiguration, isLoaded]
    );

    return (
        <ConfiguratorContext.Provider value={value}>
            {children}
        </ConfiguratorContext.Provider>
    );
}
