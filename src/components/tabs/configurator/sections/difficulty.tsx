'use client';

import React from 'react';

import { NumberInput, SimpleGrid, Stack, Title } from '@mantine/core';

import { useConfiguratorContext } from '@/components/contexts/configurator-context';
import { DEFAULT_CONFIGURATION } from '@/lib/command-generator/data/configuration';

import { clampNumber, LabelWithTooltip } from './general';

export const DifficultySection: React.FC = () => {
    const { configuration, setProperty } = useConfiguratorContext();

    return (
        <Stack gap='md'>
            <Title order={2}>Difficulty</Title>
            <SimpleGrid spacing='xl' cols={2}>
                <NumberInput
                    label={
                        <LabelWithTooltip
                            label='Raptor HP multiplier'
                            tooltip='Health of regular raptors (0.1 - 10)'
                        />
                    }
                    value={configuration.raptorHpMult}
                    onChange={(value) =>
                        setProperty(
                            'raptorHpMult',
                            clampNumber(
                                value,
                                0.1,
                                10,
                                DEFAULT_CONFIGURATION.raptorHpMult
                            )
                        )
                    }
                    min={0.1}
                    max={10}
                    step={0.1}
                    decimalScale={1}
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
                    value={configuration.queenHpMult}
                    onChange={(value) =>
                        setProperty(
                            'queenHpMult',
                            clampNumber(
                                value,
                                0.1,
                                10,
                                DEFAULT_CONFIGURATION.queenHpMult
                            )
                        )
                    }
                    min={0.1}
                    max={10}
                    step={0.1}
                    decimalScale={1}
                    allowNegative={false}
                    required
                />
            </SimpleGrid>
        </Stack>
    );
};
