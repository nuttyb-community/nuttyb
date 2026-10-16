'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';

import {
    ActionIcon,
    Alert,
    Button,
    Group,
    Input,
    Modal,
    MultiSelect,
    Paper,
    SegmentedControl,
    Stack,
    Text,
    Textarea,
    TextInput,
} from '@mantine/core';
import {
    IconAlertTriangle,
    IconFileImport,
    IconPlus,
    IconTrash,
} from '@tabler/icons-react';

import { Configuration } from '@/lib/command-generator/data/configuration';
import { LUA_PRIORITIES } from '@/lib/command-generator/data/configuration-mapping';
import { sanitizeConfiguration } from '@/lib/configuration-storage/storage';
import type { Preset } from '@/lib/presets/registry';
import { isValidTweakUrl } from '@/lib/presets/tweak-url';

import {
    computeConfigDiff,
    ConfigDiffTable,
    mapPresetTweaksToFormRows,
    type TweakFormRow,
} from './preset-showcase.utils';

/** Built-in Lua files a preset tweak can replace. */
const BUILT_IN_LUA_FILES = Object.keys(LUA_PRIORITIES).toSorted();

/** Where the preset's settings come from, explained above the table. */
const SETTINGS_SOURCE_TEXT = {
    current: 'Saved from your current configuration.',
    preset: 'Stored in this preset. Select the preset to change them.',
    import: 'Taken from the imported file.',
} as const;

const isRemotePath = (path: string) => /^https?:\/\//.test(path.trim());

interface PresetModalProps {
    opened: boolean;
    onClose: () => void;
    onSave: (
        presetData: Omit<Preset, 'id' | 'isBuiltIn'>,
        editId?: string
    ) => void;
    /** Current configurator configuration (used as default for new presets). */
    configuration: Configuration;
    /** If set, the modal opens in edit mode for this preset. */
    editPreset?: Preset | null;
    /** Whether the edit preset is the currently active one. */
    isEditPresetActive?: boolean;
}

export const PresetModal: React.FC<PresetModalProps> = ({
    opened,
    onClose,
    onSave,
    configuration,
    editPreset,
    isEditPresetActive,
}) => {
    const [presetName, setPresetName] = useState('');
    const [presetDescription, setPresetDescription] = useState('');
    const [presetConfiguration, setPresetConfiguration] =
        useState<Configuration | null>(null);
    const [settingsSource, setSettingsSource] =
        useState<keyof typeof SETTINGS_SOURCE_TEXT>('current');
    const [presetTweaks, setPresetTweaks] = useState<TweakFormRow[]>([]);
    const [importError, setImportError] = useState<string | null>(null);
    // Empty tweak paths are only flagged after a save attempt
    const [hasTriedSave, setTriedSave] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Reset form state when the modal opens
    // ponytail: deliberate reset-on-open; key-based remount if this grows
    /* eslint-disable react-hooks/set-state-in-effect */
    useEffect(() => {
        if (!opened) return;

        const useStoredSettings = editPreset && !isEditPresetActive;
        setPresetName(editPreset?.name ?? '');
        setPresetDescription(editPreset?.description ?? '');
        setPresetConfiguration(
            useStoredSettings
                ? { ...editPreset.configuration }
                : { ...configuration }
        );
        setSettingsSource(useStoredSettings ? 'preset' : 'current');
        setPresetTweaks(
            mapPresetTweaksToFormRows(editPreset?.presetTweaks ?? [])
        );
        setImportError(null);
        setTriedSave(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [opened]);
    /* eslint-enable react-hooks/set-state-in-effect */

    const configDiff = useMemo(
        () => computeConfigDiff(presetConfiguration ?? configuration),
        [presetConfiguration, configuration]
    );

    const hasRemoteTweaks = presetTweaks.some((t) => isRemotePath(t.path));

    // Unsupported hosts are flagged as you type; empty paths only after saving
    const getPathError = (path: string): string | undefined => {
        const trimmed = path.trim();
        if (!trimmed)
            return hasTriedSave
                ? 'Enter a GitHub URL or a bundled path'
                : undefined;
        if (!isValidTweakUrl(trimmed))
            return 'Only raw.githubusercontent.com and gist.githubusercontent.com URLs are allowed';
        return undefined;
    };

    const handleSave = () => {
        setTriedSave(true);
        if (!presetName.trim()) return;

        const hasInvalidPath = presetTweaks.some(
            (t) => !t.path.trim() || !isValidTweakUrl(t.path.trim())
        );
        if (hasInvalidPath) return;

        onSave(
            {
                name: presetName.trim(),
                description: presetDescription.trim(),
                configuration: presetConfiguration ?? { ...configuration },
                presetTweaks: presetTweaks.map((t) => ({
                    description: t.description.trim(),
                    type: t.type,
                    path: t.path.trim(),
                    ...(t.replaces.length > 0 && {
                        replaces:
                            t.replaces.length === 1
                                ? t.replaces[0]
                                : t.replaces,
                    }),
                })),
            },
            editPreset?.id
        );

        onClose();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        file.text()
            .then((content) => {
                try {
                    const parsed = JSON.parse(content) as Partial<Preset>;
                    if (!parsed.name || typeof parsed.name !== 'string') {
                        setImportError(
                            'The file has no preset name, so it is not a preset.'
                        );
                        return;
                    }

                    const tweaks = Array.isArray(parsed.presetTweaks)
                        ? parsed.presetTweaks
                        : [];
                    if (
                        tweaks.some((t) => t.path && !isValidTweakUrl(t.path))
                    ) {
                        setImportError(
                            'The preset loads scripts from hosts other than GitHub, which are not allowed.'
                        );
                        return;
                    }

                    setPresetName(parsed.name);
                    setPresetDescription(parsed.description ?? '');
                    if (
                        parsed.configuration &&
                        typeof parsed.configuration === 'object'
                    ) {
                        setPresetConfiguration(
                            sanitizeConfiguration(parsed.configuration)
                        );
                        setSettingsSource('import');
                    }
                    setPresetTweaks(mapPresetTweaksToFormRows(tweaks));
                    setImportError(null);
                } catch {
                    setImportError('The file is not valid JSON.');
                }
            })
            .catch(() => {
                setImportError('The file could not be read.');
            });

        event.target.value = '';
    };

    const handleAddTweak = () => {
        setPresetTweaks((prev) => [
            ...prev,
            {
                id: `tweak-${Date.now()}-${Math.random()}`,
                description: '',
                type: 'tweakdefs',
                path: '',
                replaces: [],
            },
        ]);
    };

    const handleRemoveTweak = (id: string) => {
        setPresetTweaks((prev) => prev.filter((t) => t.id !== id));
    };

    const updateTweak = (id: string, changes: Partial<TweakFormRow>) => {
        setPresetTweaks((prev) =>
            prev.map((t) => (t.id === id ? { ...t, ...changes } : t))
        );
    };

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title={editPreset ? 'Edit preset' : 'New preset'}
            size='lg'
            centered
        >
            <Stack gap='lg'>
                {importError && (
                    <Alert
                        color='red'
                        title='Could not import the preset'
                        withCloseButton
                        onClose={() => setImportError(null)}
                    >
                        {importError}
                    </Alert>
                )}

                <Stack gap='md'>
                    <TextInput
                        label='Name'
                        placeholder="e.g. Pyrem's preset"
                        value={presetName}
                        onChange={(e) => setPresetName(e.currentTarget.value)}
                        error={
                            hasTriedSave && !presetName.trim()
                                ? 'Give the preset a name'
                                : undefined
                        }
                        required
                        data-autofocus
                    />
                    <Textarea
                        label='Description'
                        description='Shown on the preset card. Say what the preset changes.'
                        placeholder='e.g. 2× income, 6 queens, no mini bosses'
                        value={presetDescription}
                        onChange={(e) =>
                            setPresetDescription(e.currentTarget.value)
                        }
                        autosize
                        minRows={2}
                    />
                </Stack>

                <Stack gap='xs'>
                    <Text fw={700}>Settings</Text>
                    <Text size='sm'>
                        {SETTINGS_SOURCE_TEXT[settingsSource]}
                    </Text>
                    {configDiff.length > 0 ? (
                        <ConfigDiffTable overrides={configDiff} />
                    ) : (
                        <Text size='sm' c='dimmed'>
                            Same as the default configuration.
                        </Text>
                    )}
                </Stack>

                <Stack gap='sm'>
                    <Stack gap={2}>
                        <Text fw={700}>Custom tweaks</Text>
                        <Text size='sm'>
                            Lua scripts loaded with this preset, from GitHub or
                            the bundle.
                        </Text>
                    </Stack>

                    {hasRemoteTweaks && (
                        <Alert
                            color='yellow'
                            icon={<IconAlertTriangle size={18} />}
                            title='This preset runs scripts from GitHub'
                        >
                            They load from their authors&apos; repositories.
                            Only use presets from people you trust.
                        </Alert>
                    )}

                    {presetTweaks.map((tweak, index) => (
                        <Paper key={tweak.id} withBorder p='md'>
                            <Stack gap='sm'>
                                <Group gap='sm' align='flex-end' wrap='nowrap'>
                                    <TextInput
                                        label='Description'
                                        placeholder='e.g. Cross-faction T2'
                                        value={tweak.description}
                                        onChange={(e) =>
                                            updateTweak(tweak.id, {
                                                description:
                                                    e.currentTarget.value,
                                            })
                                        }
                                        flex={1}
                                    />
                                    <Input.Wrapper label='Type'>
                                        <SegmentedControl
                                            display='flex'
                                            data={['tweakdefs', 'tweakunits']}
                                            value={tweak.type}
                                            onChange={(value) =>
                                                updateTweak(tweak.id, {
                                                    type: value,
                                                })
                                            }
                                        />
                                    </Input.Wrapper>
                                    <ActionIcon
                                        variant='subtle'
                                        color='red'
                                        size='input-sm'
                                        aria-label={`Remove tweak ${index + 1}`}
                                        onClick={() =>
                                            handleRemoveTweak(tweak.id)
                                        }
                                    >
                                        <IconTrash size={18} />
                                    </ActionIcon>
                                </Group>
                                <TextInput
                                    label='Lua file'
                                    description='A raw GitHub or gist URL, or a bundled path such as lua/eco-t3.lua'
                                    placeholder='https://raw.githubusercontent.com/…/tweak.lua'
                                    value={tweak.path}
                                    onChange={(e) =>
                                        updateTweak(tweak.id, {
                                            path: e.currentTarget.value,
                                        })
                                    }
                                    error={getPathError(tweak.path)}
                                    required
                                />
                                <MultiSelect
                                    label='Replaces'
                                    description='Built-in files this tweak replaces. Leave empty to add it alongside them.'
                                    placeholder={
                                        tweak.replaces.length === 0
                                            ? 'Nothing'
                                            : undefined
                                    }
                                    // Keep imported paths that aren't built-in files
                                    data={[
                                        ...new Set([
                                            ...BUILT_IN_LUA_FILES,
                                            ...tweak.replaces,
                                        ]),
                                    ]}
                                    value={tweak.replaces}
                                    onChange={(replaces) =>
                                        updateTweak(tweak.id, { replaces })
                                    }
                                    searchable
                                    clearable
                                />
                            </Stack>
                        </Paper>
                    ))}

                    <Group>
                        <Button
                            variant='default'
                            leftSection={<IconPlus size={16} />}
                            onClick={handleAddTweak}
                        >
                            Add tweak
                        </Button>
                    </Group>
                </Stack>

                <Group justify='space-between'>
                    <input
                        type='file'
                        ref={fileInputRef}
                        hidden
                        accept='.json'
                        onChange={handleFileChange}
                    />
                    <Button
                        variant='subtle'
                        color='gray'
                        leftSection={<IconFileImport size={16} />}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        Import JSON…
                    </Button>
                    <Group gap='sm'>
                        <Button variant='default' onClick={onClose}>
                            Cancel
                        </Button>
                        <Button onClick={handleSave}>
                            {editPreset ? 'Save changes' : 'Create preset'}
                        </Button>
                    </Group>
                </Group>
            </Stack>
        </Modal>
    );
};
