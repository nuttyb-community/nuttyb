import React from 'react';

import { Grid, Stack, Title } from '@mantine/core';

import { useCustomTweaksContext } from '@/components/contexts/custom-tweaks-context';

import CustomTweaksSection from './sections/custom-tweaks';
import DifficultySection from './sections/difficulty';
import ExtrasSection from './sections/extras';
import GeneralSection from './sections/general';

const Configurator: React.FC = () => {
    const { customTweaks } = useCustomTweaksContext();
    const hasCustomTweaks = customTweaks.length > 0;

    return (
        <Stack gap='md'>
            <Title order={2}>Configurator</Title>

            <Grid columns={12} gutter='xl'>
                <Grid.Col span={4}>
                    <GeneralSection />
                </Grid.Col>

                <Grid.Col span={4}>
                    <DifficultySection />
                </Grid.Col>

                <Grid.Col span={4}>
                    <ExtrasSection />
                </Grid.Col>
            </Grid>
            {hasCustomTweaks && <CustomTweaksSection />}
        </Stack>
    );
};

export default Configurator;
