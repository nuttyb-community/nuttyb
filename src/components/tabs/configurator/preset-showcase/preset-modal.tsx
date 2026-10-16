'use client';

import React, { useRef, useState } from 'react';

import {
    Alert,
    Button,
    Group,
    Modal,
    Stack,
    Text,
    Textarea,
    TextInput,
} from '@mantine/core';
import {
    IconAlertTriangle,
    IconFileImport,
    IconPlus,
} from '@tabler/icons-react';

import { useConfiguratorContext } from '@/components/contexts/configurator-context';
import { usePresetsContext } from '@/components/contexts/presets-context';
import { sanitizeConfiguration } from '@/lib/configuration-storage/storage';
import type { Preset } from '@/lib/presets/registry';
import { isValidTweakUrl } from '@/lib/presets/tweak-url';

import { computeConfigDiff, ConfigDiffTable } from './preset-showcase.utils';
import {
    PresetTweakFields,
    toFormRows,
    type TweakFormRow,
} from './preset-tweak-fields';

/** Where the preset's settings come from, explained above the table. */
const SETTINGS_SOURCE_TEXT = {
    current: 'Saved from your current configuration.',
    preset: 'Stored in this preset. Select the preset to change them.',
    import: 'Taken from the imported file.',
} as const;

const isRemotePath = (path: string) => /^https?:\/\//.test(path.trim());

/** Unsupported hosts are an error right away; an empty path only with `flagEmpty`. */
function getPathError(path: string, flagEmpty: boolean): string | undefined {
    const trimmed = path.trim();
    if (!trimmed)
        return flagEmpty ? 'Enter a GitHub URL or a bundled path' : undefined;
    if (!isValidTweakUrl(trimmed))
        return 'Only raw.githubusercontent.com and gist.githubusercontent.com URLs are allowed';
    return undefined;
}

interface PresetFormProps {
    /** The preset to edit; a new one is created when null. */
    editPreset: Preset | null;
    onClose: () => void;
}

// The modal unmounts it on close, so every opening starts from `editPreset`
const PresetForm: React.FC<PresetFormProps> = ({ editPreset, onClose }) => {
    const { configuration } = useConfiguratorContext();
    const { activePresetId, savePreset } = usePresetsContext();
    // The active preset saves the current settings; any other keeps its own
    const useStoredSettings =
        editPreset !== null && editPreset.id !== activePresetId;

    const [presetName, setPresetName] = useState(editPreset?.name ?? '');
    const [presetDescription, setPresetDescription] = useState(
        editPreset?.description ?? ''
    );
    const [presetConfiguration, setPresetConfiguration] = useState(
        useStoredSettings ? editPreset.configuration : configuration
    );
    const [settingsSource, setSettingsSource] = useState<
        keyof typeof SETTINGS_SOURCE_TEXT
    >(useStoredSettings ? 'preset' : 'current');
    const [presetTweaks, setPresetTweaks] = useState(() =>
        toFormRows(editPreset?.presetTweaks ?? [])
    );
    const [importError, setImportError] = useState<string | null>(null);
    // Empty tweak paths are only flagged after a save attempt
    const [hasTriedSave, setTriedSave] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const configDiff = computeConfigDiff(presetConfiguration);
    const hasRemoteTweaks = presetTweaks.some((t) => isRemotePath(t.path));

    const handleSave = () => {
        setTriedSave(true);
        if (!presetName.trim()) return;
        if (presetTweaks.some((t) => getPathError(t.path, true))) return;

        savePreset(
            {
                name: presetName.trim(),
                description: presetDescription.trim(),
                configuration: presetConfiguration,
                presetTweaks: presetTweaks.map((t) => ({
                    description: t.description.trim(),
                    type: t.type,
                    path: t.path.trim(),
                    ...(t.replaces.length > 0 && { replaces: t.replaces }),
                })),
            },
            editPreset?.id
        );

        onClose();
    };

    const handleFileChange = async (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const input = event.currentTarget;
        const file = input.files?.[0];
        // Cleared so picking the same file again still fires a change
        input.value = '';
        if (!file) return;

        try {
            const parsed = JSON.parse(await file.text()) as Partial<Preset>;
            if (!parsed.name || typeof parsed.name !== 'string') {
                setImportError(
                    'The file has no preset name, so it is not a preset.'
                );
                return;
            }

            const tweaks = Array.isArray(parsed.presetTweaks)
                ? parsed.presetTweaks
                : [];
            if (tweaks.some((t) => t.path && !isValidTweakUrl(t.path))) {
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
            setPresetTweaks(toFormRows(tweaks));
            setImportError(null);
        } catch {
            setImportError('The file is not valid JSON.');
        }
    };

    const updateTweak = (id: string, changes: Partial<TweakFormRow>) => {
        setPresetTweaks((prev) =>
            prev.map((t) => (t.id === id ? { ...t, ...changes } : t))
        );
    };

    return (
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
                <Text size='sm'>{SETTINGS_SOURCE_TEXT[settingsSource]}</Text>
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
                        Lua scripts loaded with this preset, from GitHub or the
                        bundle.
                    </Text>
                </Stack>

                {hasRemoteTweaks && (
                    <Alert
                        color='yellow'
                        icon={<IconAlertTriangle size={18} />}
                        title='This preset runs scripts from GitHub'
                    >
                        They load from their authors&apos; repositories. Only
                        use presets from people you trust.
                    </Alert>
                )}

                {presetTweaks.map((tweak, index) => (
                    <PresetTweakFields
                        key={tweak.id}
                        tweak={tweak}
                        index={index}
                        pathError={getPathError(tweak.path, hasTriedSave)}
                        onChange={(changes) => updateTweak(tweak.id, changes)}
                        onRemove={() =>
                            setPresetTweaks((prev) =>
                                prev.filter((t) => t.id !== tweak.id)
                            )
                        }
                    />
                ))}

                <Group>
                    <Button
                        variant='default'
                        leftSection={<IconPlus size={16} />}
                        onClick={() =>
                            setPresetTweaks((prev) => [
                                ...prev,
                                ...toFormRows([{}]),
                            ])
                        }
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
                    onChange={(event) => void handleFileChange(event)}
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
    );
};

interface PresetModalProps extends PresetFormProps {
    opened: boolean;
}

/** Creates a preset, or edits one when `editPreset` is set. */
export const PresetModal: React.FC<PresetModalProps> = ({
    opened,
    onClose,
    editPreset,
}) => (
    <Modal
        opened={opened}
        onClose={onClose}
        title={editPreset ? 'Edit preset' : 'New preset'}
        size='lg'
        centered
    >
        <PresetForm
            key={editPreset?.id}
            editPreset={editPreset}
            onClose={onClose}
        />
    </Modal>
);
