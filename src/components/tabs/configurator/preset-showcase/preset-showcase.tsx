'use client';

import type React from 'react';
import { useState } from 'react';

import { Button, Group, Stack, Title } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconArrowBackUp, IconPlus } from '@tabler/icons-react';

import { usePresetsContext } from '@/components/contexts/presets-context';
import type { Preset } from '@/lib/presets/registry';

import { PresetCardList } from './preset-card-list';
import { PresetModal } from './preset-modal';

export const PresetShowcase: React.FC = () => {
    const { activePresetId, isModified, selectPreset } = usePresetsContext();
    const [isModalOpen, { open: openModal, close: closeModal }] =
        useDisclosure(false);
    // Kept after closing, so the title doesn't change during the exit animation
    const [editedPreset, setEditedPreset] = useState<Preset | null>(null);

    const openEditor = (preset: Preset | null) => {
        setEditedPreset(preset);
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
                        onClick={() => openEditor(null)}
                    >
                        New preset
                    </Button>
                </Group>
            </Group>

            <PresetCardList onEdit={openEditor} />

            <PresetModal
                opened={isModalOpen}
                onClose={closeModal}
                preset={editedPreset}
            />
        </Stack>
    );
};
