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
import { IconFileImport } from '@tabler/icons-react';

import { useConfiguratorContext } from '@/components/contexts/configurator-context';
import { usePresetsContext } from '@/components/contexts/presets-context';
import { computeConfigDiff } from '@/lib/presets/config-diff';
import { parsePresetFile } from '@/lib/presets/preset-file';
import type { Preset } from '@/lib/presets/registry';

import { ConfigDiffTable } from './preset-details';
import {
    getPathError,
    PresetTweakList,
    toFormRows,
} from './preset-tweak-fields';

/** Where the preset's settings come from, explained above the table. */
const SETTINGS_SOURCE_TEXT = {
    current: 'Saved from your current configuration.',
    preset: 'Stored in this preset. Select the preset to change them.',
    import: 'Taken from the imported file.',
} as const;

interface PresetFormProps {
    /** The preset to edit; a new one is created when null. */
    preset: Preset | null;
    onClose: () => void;
}

// The modal unmounts it on close, so every opening starts from `preset`
const PresetForm: React.FC<PresetFormProps> = ({ preset, onClose }) => {
    const { configuration } = useConfiguratorContext();
    const { activePresetId, savePreset } = usePresetsContext();
    // The active preset saves the current settings; any other keeps its own
    const useStoredSettings = preset !== null && preset.id !== activePresetId;

    const [presetName, setPresetName] = useState(preset?.name ?? '');
    const [presetDescription, setPresetDescription] = useState(
        preset?.description ?? ''
    );
    const [presetConfiguration, setPresetConfiguration] = useState(
        useStoredSettings ? preset.configuration : configuration
    );
    const [settingsSource, setSettingsSource] = useState<
        keyof typeof SETTINGS_SOURCE_TEXT
    >(useStoredSettings ? 'preset' : 'current');
    const [presetTweaks, setPresetTweaks] = useState(() =>
        toFormRows(preset?.presetTweaks ?? [])
    );
    const [importError, setImportError] = useState<string | null>(null);
    // Empty tweak paths are only flagged after a save attempt
    const [hasTriedSave, setTriedSave] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const configDiff = computeConfigDiff(presetConfiguration);

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
            preset?.id
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

        const result = parsePresetFile(await file.text());
        if ('error' in result) {
            setImportError(result.error);
            return;
        }

        const imported = result.preset;
        setPresetName(imported.name);
        setPresetDescription(imported.description);
        if (imported.configuration) {
            setPresetConfiguration(imported.configuration);
            setSettingsSource('import');
        }
        setPresetTweaks(toFormRows(imported.presetTweaks));
        setImportError(null);
    };

    return (
        <form
            // Our own field errors replace the browser's required-field bubbles
            noValidate
            onSubmit={(event) => {
                event.preventDefault();
                handleSave();
            }}
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

                <PresetTweakList
                    tweaks={presetTweaks}
                    onChange={setPresetTweaks}
                    showEmptyPathErrors={hasTriedSave}
                />

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
                        <Button type='submit'>
                            {preset ? 'Save changes' : 'Create preset'}
                        </Button>
                    </Group>
                </Group>
            </Stack>
        </form>
    );
};

interface PresetModalProps extends PresetFormProps {
    opened: boolean;
}

/** Creates a preset, or edits one when `preset` is set. */
export const PresetModal: React.FC<PresetModalProps> = ({
    opened,
    onClose,
    preset,
}) => (
    <Modal
        opened={opened}
        onClose={onClose}
        title={preset ? 'Edit preset' : 'New preset'}
        size='lg'
        centered
    >
        <PresetForm key={preset?.id} preset={preset} onClose={onClose} />
    </Modal>
);
