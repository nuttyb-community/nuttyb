'use client';

import React, { useMemo, useState } from 'react';

import { Button, Group, Stack, Title } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconArrowBackUp, IconPlus } from '@tabler/icons-react';

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
        <Stack gap='md'>
            <Group justify='space-between'>
                <Title order={2}>Preset</Title>
                <Group gap='xs'>
                    {isModified && activePresetId && (
                        <Button
                            variant='subtle'
                            color='gray'
                            leftSection={<IconArrowBackUp size={16} />}
                            onClick={() => selectPreset(activePresetId)}
                        >
                            Revert changes
                        </Button>
                    )}
                    <Button
                        variant='default'
                        leftSection={<IconPlus size={16} />}
                        onClick={handleNewPreset}
                    >
                        New preset
                    </Button>
                </Group>
            </Group>

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
