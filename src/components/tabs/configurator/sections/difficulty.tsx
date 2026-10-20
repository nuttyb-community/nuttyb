'use client';

import React from 'react';

import { NumberInput, SimpleGrid, Stack, Title } from '@mantine/core';

import { LabelWithTooltip } from '@/components/common/label-with-tooltip';
import { useNumberSetting } from '@/hooks/use-number-setting';

export const DifficultySection: React.FC = () => {
    const queenCount = useNumberSetting('queenCount', 1, 100);
    const raptorHpMult = useNumberSetting('raptorHpMult', 0.1, 10);
    const queenHpMult = useNumberSetting('queenHpMult', 0.1, 10);

    return (
        <Stack gap='md'>
            <Title order={2}>Difficulty</Title>
            <NumberInput
                label={
                    <LabelWithTooltip
                        label='Queen count'
                        tooltip='Number of raptor queens (1 - 100)'
                    />
                }
                {...queenCount}
                step={1}
                allowNegative={false}
                required
            />
            <SimpleGrid spacing='xl' cols={2}>
                <NumberInput
                    label={
                        <LabelWithTooltip
                            label='Queen HP multiplier'
                            tooltip='Health of raptor queens (0.1 - 10)'
                        />
                    }
                    {...queenHpMult}
                    step={0.1}
                    decimalScale={1}
                    allowNegative={false}
                    required
                />
                <NumberInput
                    label={
                        <LabelWithTooltip
                            label='Raptor HP multiplier'
                            tooltip='Health of regular raptors (0.1 - 10)'
                        />
                    }
                    {...raptorHpMult}
                    step={0.1}
                    decimalScale={1}
                    allowNegative={false}
                    required
                />
            </SimpleGrid>
        </Stack>
    );
};
