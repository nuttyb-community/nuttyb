'use client';

import type React from 'react';

import {
    NativeSelect,
    NumberInput,
    SimpleGrid,
    Stack,
    Title,
} from '@mantine/core';

import { LabelWithTooltip } from '@/components/common/label-with-tooltip';
import { useConfiguratorContext } from '@/components/contexts/configurator-context';
import { useNumberSetting } from '@/hooks/use-number-setting';
import {
    CHALLENGES,
    type Challenges,
} from '@/lib/command-generator/data/configuration';

export const DifficultySection: React.FC = () => {
    const { configuration, setProperty } = useConfiguratorContext();

    const queenCount = useNumberSetting('queenCount', 1, 100);
    const raptorHpMult = useNumberSetting('raptorHpMult', 0.1, 10);
    const queenHpMult = useNumberSetting('queenHpMult', 0.1, 10);

    return (
        <Stack gap='md'>
            <Title order={2}>Difficulty</Title>
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
                <NativeSelect
                    label='Challenges'
                    data={CHALLENGES}
                    value={configuration.challenges}
                    onChange={(event) =>
                        setProperty(
                            'challenges',
                            event.currentTarget.value as Challenges
                        )
                    }
                />
            </Stack>
        </Stack>
    );
};
