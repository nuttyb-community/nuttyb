'use client';

import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';

import { useConfiguratorContext } from '@/components/contexts/configurator-context';
import { useLuaBundleContext } from '@/components/contexts/lua-bundle-context';
import { useLocalStorage } from '@/hooks/use-local-storage';
import type { EnabledCustomTweak } from '@/lib/command-generator/command-generator';
import { type Configuration } from '@/lib/command-generator/data/configuration';
import {
    ACTIVE_PRESET_ID_STORAGE_KEY,
    LOCAL_PRESETS_STORAGE_KEY,
} from '@/lib/configuration-storage/keys';
import { sanitizeConfiguration } from '@/lib/configuration-storage/storage';
import { parsePresetStatus, type Preset } from '@/lib/presets/registry';
import { resolvePresetTweaks } from '@/lib/presets/resolver';
import { isAllowedRemoteTweakUrl } from '@/lib/presets/tweak-url';

interface PresetsContextValue {
    activePresetId: string | null;
    /** Shown in the default lobby name tag */
    activePresetName?: string;
    activePresetTweaks: EnabledCustomTweak[];
    builtInPresets: Preset[];
    localPresets: Preset[];
    isModified: boolean;
    selectPreset: (id: string) => void;
    savePreset: (
        presetData: Omit<Preset, 'id' | 'isBuiltIn'>,
        id?: string
    ) => void;
    deleteLocalPreset: (id: string) => void;
    exportPreset: (id: string) => void;
}

const PresetsContext = createContext<PresetsContextValue | undefined>(
    undefined
);

export function usePresetsContext() {
    const context = useContext(PresetsContext);
    if (!context) {
        throw new Error(
            'usePresetsContext must be used within a PresetsProvider'
        );
    }
    return context;
}

export function PresetsProvider({ children }: { children: React.ReactNode }) {
    const { configuration, setConfiguration } = useConfiguratorContext();
    const { luaFiles } = useLuaBundleContext();

    const [activePresetId, setActivePresetId] = useLocalStorage<string | null>(
        ACTIVE_PRESET_ID_STORAGE_KEY,
        'default'
    );
    const [localPresets, setLocalPresets] = useLocalStorage<Preset[]>(
        LOCAL_PRESETS_STORAGE_KEY,
        [],
        {
            // Saved presets are never built-in, whatever the stored data says.
            // The form has no status toggle any more, so none stay disabled.
            onLoad: (stored) =>
                stored.map((preset) => ({
                    ...preset,
                    isBuiltIn: false,
                    status: 'enabled',
                })),
        }
    );

    // Combine hardcoded base presets and dynamically loaded presets from the bundle
    const parsedPresets = useMemo<Preset[]>(() => {
        const dynamicPresets: Preset[] = [];
        for (const file of luaFiles) {
            // Check if file is a config.json inside a preset folder
            // e.g. public/presets/example/config.json
            const match = file.path.match(
                /^public\/presets\/([^/]+)\/config\.json$/
            );
            if (match) {
                try {
                    const parsed = JSON.parse(file.data) as Partial<Preset>;
                    if (parsed.name && parsed.configuration) {
                        dynamicPresets.push({
                            id: parsed.id || match[1], // fallback to folder name as id
                            name: parsed.name,
                            description: parsed.description || '',
                            configuration: sanitizeConfiguration(
                                parsed.configuration
                            ),
                            presetTweaks: parsed.presetTweaks || [],
                            status: parsePresetStatus(parsed.status),
                            isBuiltIn: true,
                        });
                    }
                } catch (error) {
                    // eslint-disable-next-line no-console
                    console.error(
                        `Failed to parse preset config from ${file.path}:`,
                        error
                    );
                }
            }
        }
        // Difficulty presets from easiest (Medium is 'default'), then the rest by name
        const order = ['casual', 'easy', 'default', 'hard'];
        dynamicPresets.sort((a, b) => {
            const indexA = order.indexOf(a.id);
            const indexB = order.indexOf(b.id);
            if (indexA !== -1 && indexB !== -1) return indexA - indexB;
            if (indexA !== -1) return -1;
            if (indexB !== -1) return 1;
            return a.name.localeCompare(b.name);
        });
        return dynamicPresets;
    }, [luaFiles]);

    // Disabled presets stay in the bundle but are hidden and unselectable
    const builtInPresets = useMemo<Preset[]>(
        () => parsedPresets.filter((p) => p.status !== 'disabled'),
        [parsedPresets]
    );

    /** Finds a preset by ID across the enabled built-in and local presets. */
    const findPresetById = useCallback(
        (id: string): Preset | null =>
            builtInPresets.find((p) => p.id === id) ||
            localPresets.find((p) => p.id === id) ||
            null,
        [builtInPresets, localPresets]
    );

    const activePreset = useMemo<Preset | null>(
        () => (activePresetId ? findPresetById(activePresetId) : null),
        [activePresetId, findPresetById]
    );

    /** Applies all properties from a Configuration object to the current context. */
    const applyConfiguration = useCallback(
        (config: Configuration) => {
            setConfiguration(config);
        },
        [setConfiguration]
    );

    const [remoteFiles, setRemoteFiles] = useState<Record<string, string>>({});
    const fetchedUrlsRef = useRef<Set<string>>(new Set());

    useEffect(() => {
        if (!activePreset) return;

        const tweaks = activePreset.presetTweaks || [];
        const remoteUrls = tweaks
            .map((t) => t.path)
            .filter((path) => path.startsWith('https://'));

        for (const url of remoteUrls) {
            if (fetchedUrlsRef.current.has(url)) continue;
            fetchedUrlsRef.current.add(url);

            // Enforce the host whitelist at the fetch boundary, not just in the
            // import UI — this is the actual network/trust boundary.
            if (!isAllowedRemoteTweakUrl(url)) {
                // eslint-disable-next-line no-console
                console.warn(
                    `Skipped remote preset tweak from untrusted host: ${url}`
                );
                continue;
            }

            void fetch(url)
                .then((res) => {
                    if (!res.ok)
                        throw new Error(`HTTP error! status: ${res.status}`);
                    return res.text();
                })
                .then((text) => {
                    setRemoteFiles((prev) => ({ ...prev, [url]: text }));
                })
                .catch((error) => {
                    fetchedUrlsRef.current.delete(url);
                    // eslint-disable-next-line no-console
                    console.error(
                        `Failed to fetch remote preset tweak from ${url}:`,
                        error
                    );
                });
        }
    }, [activePreset]);

    // Check if configuration differs from active preset configuration
    const isModified = useMemo(() => {
        if (!activePreset) return false;
        // Compare only configuration keys
        const presetConfig = activePreset.configuration;
        for (const key of Object.keys(presetConfig) as Array<
            keyof typeof presetConfig
        >) {
            if (configuration[key] !== presetConfig[key]) {
                return true;
            }
        }
        return false;
    }, [activePreset, configuration]);

    // Automatically save configuration changes to custom presets
    useEffect(() => {
        if (
            !activePresetId ||
            activePresetId === 'default' ||
            builtInPresets.some((p) => p.id === activePresetId)
        ) {
            return;
        }

        setLocalPresets((prev) => {
            const currentLocal = prev.find((p) => p.id === activePresetId);
            if (!currentLocal) return prev;

            // Configuration only has primitive values — stringify is safe
            if (
                JSON.stringify(currentLocal.configuration) ===
                JSON.stringify(configuration)
            )
                return prev;

            return prev.map((p) =>
                p.id === activePresetId
                    ? {
                          ...p,
                          configuration: { ...configuration },
                      }
                    : p
            );
        });
    }, [configuration, activePresetId, setLocalPresets, builtInPresets]);

    // Resolve active preset tweaks from file paths and inline codes
    const activePresetTweaks = useMemo<EnabledCustomTweak[]>(() => {
        if (!activePreset) return [];
        return resolvePresetTweaks(activePreset, luaFiles, remoteFiles);
    }, [activePreset, luaFiles, remoteFiles]);

    const selectPreset = useCallback(
        (id: string) => {
            const preset = findPresetById(id);
            if (!preset) return;

            applyConfiguration(preset.configuration);
            setActivePresetId(id);
        },
        [findPresetById, applyConfiguration, setActivePresetId]
    );

    // If the stored active preset no longer exists (disabled, renamed or
    // removed built-in), fall back to the default preset.
    useEffect(() => {
        if (parsedPresets.length === 0) return; // bundle still loading
        if (!activePresetId) return;
        if (!findPresetById(activePresetId)) selectPreset('default');
    }, [parsedPresets, activePresetId, findPresetById, selectPreset]);

    const savePreset = useCallback(
        (presetData: Omit<Preset, 'id' | 'isBuiltIn'>, id?: string) => {
            const presetFields = {
                name: presetData.name.trim(),
                description: presetData.description || '',
                status: presetData.status ?? 'enabled',
                configuration: { ...presetData.configuration },
                presetTweaks: presetData.presetTweaks || [],
            };

            if (id) {
                setLocalPresets((prev) =>
                    prev.map((p) =>
                        p.id === id ? { ...p, ...presetFields } : p
                    )
                );
            } else {
                const newPreset: Preset = {
                    id: crypto.randomUUID(),
                    ...presetFields,
                };

                setLocalPresets((prev) => [...prev, newPreset]);
                setActivePresetId(newPreset.id);
            }

            applyConfiguration(presetData.configuration);
        },
        [applyConfiguration, setLocalPresets, setActivePresetId]
    );

    const deleteLocalPreset = useCallback(
        (id: string) => {
            setLocalPresets((prev) => prev.filter((p) => p.id !== id));
            if (activePresetId === id) {
                selectPreset('default');
            }
        },
        [activePresetId, setLocalPresets, selectPreset]
    );

    const exportPreset = useCallback(
        (id: string) => {
            const preset = findPresetById(id);
            if (!preset) return;

            // Prepare export data including presetTweaks
            const exportData = {
                version: 1,
                name: preset.name,
                description: preset.description,
                status: preset.status ?? 'enabled',
                configuration: preset.configuration,
                presetTweaks: preset.presetTweaks || [],
            };

            const dataStr =
                'data:text/json;charset=utf-8,' +
                encodeURIComponent(JSON.stringify(exportData, null, 2));
            const downloadAnchor = document.createElement('a');
            downloadAnchor.setAttribute('href', dataStr);
            downloadAnchor.setAttribute(
                'download',
                `${preset.name.toLowerCase().replaceAll(/[^a-z0-9]/g, '_')}_preset.json`
            );
            document.body.append(downloadAnchor);
            downloadAnchor.click();
            downloadAnchor.remove();
        },
        [findPresetById]
    );

    const value = useMemo(
        () => ({
            activePresetId,
            activePresetName: activePreset?.name,
            activePresetTweaks,
            builtInPresets,
            localPresets,
            isModified,
            selectPreset,
            deleteLocalPreset,
            exportPreset,
            savePreset,
        }),
        [
            activePresetId,
            activePreset,
            activePresetTweaks,
            builtInPresets,
            localPresets,
            isModified,
            selectPreset,
            deleteLocalPreset,
            exportPreset,
            savePreset,
        ]
    );

    return (
        <PresetsContext.Provider value={value}>
            {children}
        </PresetsContext.Provider>
    );
}
