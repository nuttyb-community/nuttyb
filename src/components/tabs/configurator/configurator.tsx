'use client';

import React from 'react';

import { Stack } from '@mantine/core';

import { PresetShowcase } from './preset-showcase';
import { CustomTweaksSection } from './sections/custom-tweaks';
import { DifficultySection } from './sections/difficulty';
import { ExtrasSection } from './sections/extras';
import { GeneralSection } from './sections/general';

export const Configurator: React.FC = () => (
    <Stack gap={48}>
        <PresetShowcase />
        <DifficultySection />
        <GeneralSection />
        <ExtrasSection />
        <CustomTweaksSection />
    </Stack>
);
