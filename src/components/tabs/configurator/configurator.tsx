'use client';

import React from 'react';

import { Group, SimpleGrid, Stack, Title } from '@mantine/core';

import { PresetShowcase } from './preset-showcase';
import { ResetButton } from './reset-button';
import { CustomTweaksSection } from './sections/custom-tweaks';
import { DifficultySection } from './sections/difficulty';
import { EconomySection } from './sections/economy';
import { ExtrasSection } from './sections/extras';
import { GeneralSettingsSection } from './sections/general-settings';
import { MilitarySection } from './sections/military';
import { PerformanceSection } from './sections/performance';

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
            <SimpleGrid spacing='xl' cols={{ base: 1, md: 2 }}>
                <GeneralSettingsSection />
                <DifficultySection />
                <EconomySection />
                <MilitarySection />
                <ExtrasSection />
            </SimpleGrid>
            <PerformanceSection />
            <CustomTweaksSection />
        </Stack>
    </Stack>
);
