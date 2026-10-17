'use client';

import React from 'react';

import { NumberInput, SimpleGrid, Stack, Title } from '@mantine/core';

import { LabelWithTooltip } from '@/components/common/label-with-tooltip';
import { useNumberSetting } from '@/hooks/use-number-setting';

export const DifficultySection: React.FC = () => {
    const queenCount = useNumberSetting('queenCount', 1, 100);
    const raptorHpMult = useNumberSetting('raptorHpMult', 0.1, 10);
    const queenHpMult = useNumberSetting('queenHpMult', 0.1, 10);
    const incomeMult = useNumberSetting('incomeMult', 0.1, 10);
    const buildPowerMult = useNumberSetting('buildPowerMult', 0.1, 10);
    const buildDistMult = useNumberSetting('buildDistMult', 0.5, 10);

    return (
        <Stack gap='md'>
            <Title order={2}>Difficulty</Title>
            <SimpleGrid spacing='xl' cols={2}>
                <Stack gap='sm'>
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
                </Stack>
                <Stack gap='sm'>
                    <NumberInput
                        label={
                            <LabelWithTooltip
                                label='Resource income multiplier'
                                tooltip='Affects both energy and metal production (0.1 - 10)'
                            />
                        }
                        {...incomeMult}
                        step={0.1}
                        decimalScale={1}
                        allowNegative={false}
                        required
                    />
                    <NumberInput
                        label={
                            <LabelWithTooltip
                                label='Build power multiplier'
                                tooltip='Affects build power (0.1 - 10). Suggest matching the resource income multiplier for balance.'
                            />
                        }
                        {...buildPowerMult}
                        step={0.1}
                        decimalScale={1}
                        allowNegative={false}
                        required
                    />
                    <NumberInput
                        label={
                            <LabelWithTooltip
                                label='Build distance multiplier'
                                tooltip='Defines how far you can build compared to vanilla BAR (0.5 - 10)'
                            />
                        }
                        {...buildDistMult}
                        step={0.1}
                        decimalScale={1}
                        allowNegative={false}
                        required
                    />
                </Stack>
            </SimpleGrid>
        </Stack>
    );
};
