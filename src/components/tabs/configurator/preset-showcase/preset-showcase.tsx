'use client';

import React, { useMemo, useState } from 'react';

import { Button, Flex, Group, Stack, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconPlus } from '@tabler/icons-react';

import { useConfiguratorContext } from '@/components/contexts/configurator-context';
import { usePresetsContext } from '@/components/contexts/presets-context';
import type { Preset } from '@/lib/presets/registry';

import { PresetCardList } from './preset-card-list';
import { PresetModal } from './preset-modal';

export const PresetShowcase: React.FC = () => {
    const {
        activePresetId,
        builtInPresets,
        localPresets,
        isModified,
        selectPreset,
        deleteLocalPreset,
        exportPreset,
        savePreset,
    } = usePresetsContext();

    const { configuration } = useConfiguratorContext();

    const [isModalOpen, { open: openModal, close: closeModal }] =
        useDisclosure(false);
    const [editPreset, setEditPreset] = useState<Preset | null>(null);

    const allPresets = useMemo<Preset[]>(
        () => [
            ...builtInPresets.map((p) => ({ ...p, isBuiltIn: true })),
            ...localPresets.map((p) => ({ ...p, isBuiltIn: false })),
        ],
        [builtInPresets, localPresets]
    );

    const handleNewPreset = () => {
        setEditPreset(null);
        openModal();
    };

    const handleEditPreset = (preset: Preset) => {
        setEditPreset(preset);
        openModal();
    };

    return (
        <Stack gap='sm'>
            <Flex justify='space-between' align='center' wrap='wrap' gap='sm'>
                <Stack gap={0}>
                    <Text size='sm' fw={600} c='dimmed' tt='uppercase'>
                        Preset Showcase
                    </Text>
                    <Text size='xs' c='dimmed'>
                        Select a configuration preset, upload presets, or save
                        your current settings.
                    </Text>
                </Stack>

                <Group gap='xs'>
                    <Button
                        size='xs'
                        variant='light'
                        color='green'
                        leftSection={<IconPlus size={16} />}
                        onClick={handleNewPreset}
                    >
                        New Preset
                    </Button>
                </Group>
            </Flex>

            <PresetCardList
                allPresets={allPresets}
                activePresetId={activePresetId}
                isModified={isModified}
                onSelect={selectPreset}
                onEdit={handleEditPreset}
                onExport={exportPreset}
                onDelete={deleteLocalPreset}
            />

            <PresetModal
                opened={isModalOpen}
                onClose={closeModal}
                onSave={savePreset}
                configuration={configuration}
                editPreset={editPreset}
                isEditPresetActive={
                    editPreset !== null && activePresetId === editPreset.id
                }
            />
        </Stack>
    );
};
