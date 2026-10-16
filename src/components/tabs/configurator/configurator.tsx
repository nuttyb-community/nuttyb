'use client';

import React from 'react';

import { Group, Stack, Title } from '@mantine/core';

import { PresetShowcase } from './preset-showcase';
import { ResetButton } from './reset-button';
import { CustomTweaksSection } from './sections/custom-tweaks';
import { DifficultySection } from './sections/difficulty';
import { ExtrasSection } from './sections/extras';
import { GeneralSection } from './sections/general';

/** Space between the settings sections. */
const SECTION_GAP = 48;

export const Configurator: React.FC = () => (
    <Stack gap='lg'>
        {/* The heading lives in this column so the commands panel starts at
            the same height and fits the window */}
        <Group justify='space-between'>
            <Title order={1}>Configurator</Title>
            <ResetButton />
        </Group>
        <Stack gap={SECTION_GAP}>
            <PresetShowcase />
            <DifficultySection />
            <GeneralSection />
            <ExtrasSection />
            <CustomTweaksSection />
        </Stack>
    </Stack>
);
