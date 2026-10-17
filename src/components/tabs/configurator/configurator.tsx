'use client';

import React from 'react';

import { Group, Stack, Title } from '@mantine/core';

import { PresetShowcase } from './preset-showcase';
import { ResetButton } from './reset-button';
import { CustomTweaksSection } from './sections/custom-tweaks';
import { DifficultySection } from './sections/difficulty';
import { ExtrasSection } from './sections/extras';
import { GameSettingsSection } from './sections/game-settings';

export const Configurator: React.FC = () => (
    <Stack gap='lg'>
        {/* The heading lives in this column so the commands panel starts at
            the same height and fits the window */}
        <Group justify='space-between'>
            <Title order={1}>Configurator</Title>
            <ResetButton />
        </Group>
        <Stack gap='xl'>
            <PresetShowcase />
            <DifficultySection />
            <GameSettingsSection />
            <ExtrasSection />
            <CustomTweaksSection />
        </Stack>
    </Stack>
);
