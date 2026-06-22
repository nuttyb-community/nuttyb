'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';

import {
    ActionIcon,
    Button,
    Card,
    Divider,
    Flex,
    Grid,
    Group,
    Modal,
    ScrollArea,
    Select,
    Stack,
    Text,
    Textarea,
    TextInput,
    Tooltip,
} from '@mantine/core';
import {
    IconAlertTriangle,
    IconCircleCheck,
    IconCircleX,
    IconFileImport,
    IconPlus,
    IconTrash,
} from '@tabler/icons-react';

import {
    Configuration,
    DEFAULT_CONFIGURATION,
} from '@/lib/command-generator/data/configuration';
import type { Preset } from '@/lib/presets/registry';

import {
    computeConfigDiff,
    getPresetIcon,
    ICON_MAP,
    ICON_OPTIONS,
    mapPresetTweaksToFormRows,
    type TweakFormRow,
} from './preset-showcase.utils';

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

function isValidTweakUrl(url: string): boolean {
    if (!url.startsWith('https://')) {
        // If it starts with http://, it's invalid
        if (url.startsWith('http://')) return false;
        // Local paths are valid
        return true;
    }
    try {
        const parsedUrl = new URL(url);
        return (
            parsedUrl.hostname === 'raw.githubusercontent.com' ||
            parsedUrl.hostname === 'gist.githubusercontent.com'
        );
    } catch {
        return false; // Invalid URL string
    }
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
    const [selectedIcon, setSelectedIcon] = useState('IconSparkles');
    const [presetConfiguration, setPresetConfiguration] =
        useState<Configuration | null>(null);
    const [presetTweaks, setPresetTweaks] = useState<TweakFormRow[]>([]);
    const [importError, setImportError] = useState<string | null>(null);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [importSuccess, setImportSuccess] = useState(false);
    const [hasRemoteTweaks, setHasRemoteTweaks] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Reset form state when the modal opens
    useEffect(() => {
        if (!opened) return;

        if (editPreset) {
            setPresetName(editPreset.name);
            setPresetDescription(editPreset.description || '');
            setSelectedIcon(editPreset.icon || 'IconSparkles');
            setPresetConfiguration(
                isEditPresetActive
                    ? { ...configuration }
                    : { ...editPreset.configuration }
            );
            setPresetTweaks(
                mapPresetTweaksToFormRows(editPreset.presetTweaks || [])
            );
            const hasRemote = (editPreset.presetTweaks || []).some(
                (t) =>
                    t.path &&
                    (t.path.startsWith('http://') ||
                        t.path.startsWith('https://'))
            );
            setHasRemoteTweaks(hasRemote);
        } else {
            setPresetName('');
            setPresetDescription('');
            setSelectedIcon('IconSparkles');
            setPresetConfiguration({ ...configuration });
            setPresetTweaks([]);
            setHasRemoteTweaks(false);
        }
        setImportError(null);
        setSaveError(null);
        setImportSuccess(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [opened]);

    const configDiff = useMemo(() => {
        const configToCompare = presetConfiguration || configuration;
        return computeConfigDiff(configToCompare);
    }, [presetConfiguration, configuration]);

    const handleSave = () => {
        if (!presetName.trim()) return;

        const hasInvalidUrl = presetTweaks.some(
            (t) => t.path.trim() && !isValidTweakUrl(t.path.trim())
        );

        if (hasInvalidUrl) {
            setSaveError(
                'One or more tweaks contain an unsupported remote URL. Only GitHub URLs (raw/gist) are allowed.'
            );
            return;
        }

        setSaveError(null);

        const formattedPresetTweaks = presetTweaks
            .filter((t) => t.path.trim())
            .map((t) => {
                const replacesStr = t.replaces.trim();
                let replaces: string | string[] | undefined;
                if (replacesStr) {
                    replaces = replacesStr.includes(',')
                        ? replacesStr
                              .split(',')
                              .map((s) => s.trim())
                              .filter(Boolean)
                        : replacesStr;
                }
                return {
                    description: t.description.trim(),
                    type: t.type,
                    path: t.path.trim(),
                    ...(replaces ? { replaces } : {}),
                };
            });

        onSave(
            {
                name: presetName.trim(),
                description: presetDescription.trim() || 'Custom user preset.',
                icon: selectedIcon,
                configuration: presetConfiguration || { ...configuration },
                presetTweaks: formattedPresetTweaks,
            },
            editPreset?.id
        );

        onClose();
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
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
                            'Invalid preset: Missing or invalid preset name.'
                        );
                        setImportSuccess(false);
                        return;
                    }

                    setPresetName(parsed.name || '');
                    setPresetDescription(parsed.description || '');
                    setSelectedIcon(parsed.icon || 'IconSparkles');

                    if (
                        parsed.configuration &&
                        typeof parsed.configuration === 'object'
                    ) {
                        setPresetConfiguration({
                            ...DEFAULT_CONFIGURATION,
                            ...parsed.configuration,
                        });
                    }

                    const tweaks = parsed.presetTweaks || [];
                    if (Array.isArray(tweaks)) {
                        const hasInvalidUrl = tweaks.some(
                            (t) => t.path && !isValidTweakUrl(t.path)
                        );
                        if (hasInvalidUrl) {
                            setImportError(
                                'Preset contains unsupported remote URLs. Only GitHub URLs (raw/gist) are allowed.'
                            );
                            setImportSuccess(false);
                            return;
                        }
                        setPresetTweaks(mapPresetTweaksToFormRows(tweaks));
                        const hasRemote = tweaks.some(
                            (t) =>
                                t.path &&
                                (t.path.startsWith('http://') ||
                                    t.path.startsWith('https://'))
                        );
                        setHasRemoteTweaks(hasRemote);
                    }
                    setImportError(null);
                    setSaveError(null);
                    setImportSuccess(true);
                } catch {
                    setImportError('Failed to parse JSON file.');
                    setImportSuccess(false);
                }
            })
            .catch(() => {
                setImportError('Failed to read file content.');
                setImportSuccess(false);
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
                replaces: '',
            },
        ]);
    };

    const handleRemoveTweak = (id: string) => {
        setPresetTweaks((prev) => prev.filter((t) => t.id !== id));
    };

    const handleTweakChange = (
        id: string,
        field: 'description' | 'type' | 'path' | 'replaces',
        value: string
    ) => {
        setPresetTweaks((prev) =>
            prev.map((t) => {
                if (t.id !== id) return t;
                if (field === 'type') {
                    return {
                        ...t,
                        type: value as 'tweakdefs' | 'tweakunits',
                    };
                }
                return { ...t, [field]: value };
            })
        );
    };

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title={editPreset ? 'Edit Preset' : 'Create New Preset'}
            size='lg'
            centered
        >
            <Stack gap='md'>
                {/* Top JSON Import Option */}
                <input
                    type='file'
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    accept='.json'
                    onChange={handleFileChange}
                />
                <Button
                    size='sm'
                    variant='outline'
                    color='blue'
                    leftSection={<IconFileImport size={16} />}
                    onClick={handleImportClick}
                    fullWidth
                >
                    Import Preset from JSON File
                </Button>

                {importError && (
                    <Group gap={6} wrap='nowrap' align='flex-start'>
                        <IconCircleX
                            size={14}
                            color='var(--mantine-color-red-5)'
                            style={{ flexShrink: 0, marginTop: '2px' }}
                        />
                        <Text size='xs' c='red' fw={500}>
                            Import Error: {importError}
                        </Text>
                    </Group>
                )}

                {importSuccess && !importError && (
                    <Group gap={6} wrap='nowrap' align='flex-start'>
                        <IconCircleCheck
                            size={14}
                            color='var(--mantine-color-green-5)'
                            style={{ flexShrink: 0, marginTop: '2px' }}
                        />
                        <Text size='xs' c='green.5' fw={500}>
                            Preset imported successfully!
                        </Text>
                    </Group>
                )}

                {saveError && (
                    <Group gap={6} wrap='nowrap' align='flex-start'>
                        <IconCircleX
                            size={14}
                            color='var(--mantine-color-red-5)'
                            style={{ flexShrink: 0, marginTop: '2px' }}
                        />
                        <Text size='xs' c='red' fw={500}>
                            Save Error: {saveError}
                        </Text>
                    </Group>
                )}

                {hasRemoteTweaks && (
                    <Group gap={6} wrap='nowrap' align='flex-start'>
                        <IconAlertTriangle
                            size={14}
                            color='var(--mantine-color-yellow-5)'
                            style={{ flexShrink: 0, marginTop: '2px' }}
                        />
                        <Text size='xs' c='yellow.5' fw={500}>
                            Warning: This preset loads external scripts hosted
                            on GitHub, make sure to trust the author.
                        </Text>
                    </Group>
                )}

                <Divider
                    label='Preset Configuration Details'
                    labelPosition='center'
                />

                <TextInput
                    label='Preset Name'
                    placeholder="e.g. Pyrem's Preset"
                    value={presetName}
                    onChange={(e) => setPresetName(e.currentTarget.value)}
                    required
                    data-autofocus
                />

                <Textarea
                    label='Description'
                    placeholder='Provide a brief description of the preset...'
                    value={presetDescription}
                    onChange={(e) =>
                        setPresetDescription(e.currentTarget.value)
                    }
                    rows={2}
                />

                <Stack gap='xs'>
                    <Text size='sm' fw={500}>
                        Select Icon
                    </Text>
                    <Group gap='sm'>
                        {ICON_OPTIONS.map((iconName) => {
                            const entry = ICON_MAP[iconName];
                            return (
                                <Tooltip label={entry.label} key={iconName}>
                                    <ActionIcon
                                        size='xl'
                                        variant={
                                            selectedIcon === iconName
                                                ? 'filled'
                                                : 'outline'
                                        }
                                        color={
                                            selectedIcon === iconName
                                                ? 'yellow'
                                                : 'gray'
                                        }
                                        onClick={() =>
                                            setSelectedIcon(iconName)
                                        }
                                    >
                                        {getPresetIcon(iconName, 22)}
                                    </ActionIcon>
                                </Tooltip>
                            );
                        })}
                    </Group>
                </Stack>

                {configDiff.length > 0 && (
                    <Stack gap='xs'>
                        <Text size='xs' fw={600} c='dimmed'>
                            ACTIVE CONFIGURATION OVERRIDES:
                        </Text>
                        <Flex gap='xs' wrap='wrap'>
                            {configDiff.map((diff) => (
                                <Card
                                    key={diff.label}
                                    py='4px'
                                    px='8px'
                                    radius='sm'
                                    bg='dark.6'
                                    bd='1px solid var(--mantine-color-dark-4)'
                                >
                                    <Text size='xs' span fw={600} c='yellow.4'>
                                        {diff.label}:{' '}
                                    </Text>
                                    <Text size='xs' span c='white'>
                                        {diff.value}
                                    </Text>
                                </Card>
                            ))}
                        </Flex>
                    </Stack>
                )}

                <Divider
                    label='Preset Tweaks (Optional)'
                    labelPosition='center'
                />

                <Text size='xs' c='dimmed' mt={-5}>
                    Add custom Lua scripts to load from a path or GitHub URL
                    when this preset is active.
                </Text>

                {presetTweaks.length > 0 && (
                    <ScrollArea.Autosize
                        mah={300}
                        type='hover'
                        offsetScrollbars
                    >
                        <Stack gap='xs'>
                            {presetTweaks.map((tweak) => (
                                <Card
                                    key={tweak.id}
                                    p='xs'
                                    radius='sm'
                                    bg='dark.7'
                                    bd='1px solid var(--mantine-color-dark-5)'
                                >
                                    <Grid gutter='xs' align='flex-end'>
                                        <Grid.Col span={{ base: 12, sm: 6 }}>
                                            <TextInput
                                                label='Tweak Description'
                                                placeholder='e.g. Cross Faction T2'
                                                value={tweak.description}
                                                onChange={(e) =>
                                                    handleTweakChange(
                                                        tweak.id,
                                                        'description',
                                                        e.currentTarget.value
                                                    )
                                                }
                                                size='xs'
                                            />
                                        </Grid.Col>
                                        <Grid.Col span={{ base: 10, sm: 5 }}>
                                            <Select
                                                label='Tweak Type'
                                                data={[
                                                    {
                                                        value: 'tweakdefs',
                                                        label: 'Tweakdefs (Logic)',
                                                    },
                                                    {
                                                        value: 'tweakunits',
                                                        label: 'Tweakunits (Properties)',
                                                    },
                                                ]}
                                                value={tweak.type}
                                                onChange={(val) =>
                                                    handleTweakChange(
                                                        tweak.id,
                                                        'type',
                                                        val || 'tweakdefs'
                                                    )
                                                }
                                                size='xs'
                                            />
                                        </Grid.Col>
                                        <Grid.Col span={{ base: 2, sm: 1 }}>
                                            <Flex
                                                justify='center'
                                                align='flex-end'
                                                pb={4}
                                                h='100%'
                                            >
                                                <ActionIcon
                                                    color='red'
                                                    variant='subtle'
                                                    onClick={() =>
                                                        handleRemoveTweak(
                                                            tweak.id
                                                        )
                                                    }
                                                    size='md'
                                                >
                                                    <IconTrash size={16} />
                                                </ActionIcon>
                                            </Flex>
                                        </Grid.Col>
                                        <Grid.Col span={{ base: 12, sm: 7 }}>
                                            <TextInput
                                                label='Path or GitHub URL'
                                                placeholder='e.g. https://raw.githubusercontent.com/.../tweak.lua'
                                                value={tweak.path}
                                                onChange={(e) =>
                                                    handleTweakChange(
                                                        tweak.id,
                                                        'path',
                                                        e.currentTarget.value
                                                    )
                                                }
                                                size='xs'
                                                required
                                            />
                                        </Grid.Col>
                                        <Grid.Col span={{ base: 12, sm: 5 }}>
                                            <TextInput
                                                label='Replaces (Optional)'
                                                placeholder='e.g. lua/eco-t3.lua'
                                                value={tweak.replaces}
                                                onChange={(e) =>
                                                    handleTweakChange(
                                                        tweak.id,
                                                        'replaces',
                                                        e.currentTarget.value
                                                    )
                                                }
                                                size='xs'
                                            />
                                        </Grid.Col>
                                    </Grid>
                                </Card>
                            ))}
                        </Stack>
                    </ScrollArea.Autosize>
                )}

                <Button
                    size='xs'
                    variant='light'
                    color='gray'
                    leftSection={<IconPlus size={14} />}
                    onClick={handleAddTweak}
                    fullWidth
                >
                    Add Custom Tweak Row
                </Button>

                <Group justify='flex-end' mt='md'>
                    <Button variant='subtle' color='gray' onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        color='yellow'
                        onClick={handleSave}
                        disabled={!presetName.trim()}
                    >
                        {editPreset ? 'Save Changes' : 'Create Preset'}
                    </Button>
                </Group>
            </Stack>
        </Modal>
    );
};
