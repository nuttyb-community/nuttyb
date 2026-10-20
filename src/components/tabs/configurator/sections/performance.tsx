'use client';

import React from 'react';

import {
    Checkbox,
    Input,
    SegmentedControl,
    SimpleGrid,
    Stack,
    Title,
} from '@mantine/core';

import { useConfiguratorContext } from '@/components/contexts/configurator-context';
import { EFFECTS_REDUCTION_LEVELS } from '@/lib/command-generator/data/configuration';

export const PerformanceSection: React.FC = () => {
    const { configuration, setProperty } = useConfiguratorContext();

    return (
        <Stack gap='md'>
            <Title order={2}>Performance</Title>
            <SimpleGrid spacing='xl' cols={{ base: 1, md: 2 }}>
                <Input.Wrapper
                    label='Effects reduction'
                    description='Light trims trails on the T4 units and shrinks harmless raptor death blasts, Medium also on raptors with smaller impacts, Heavy on every unit and drops tracks and building decals. Combat stays the same.'
                >
                    <SegmentedControl
                        display='flex'
                        data={[...EFFECTS_REDUCTION_LEVELS]}
                        value={configuration.effectsReduction}
                        onChange={(value) =>
                            setProperty('effectsReduction', value)
                        }
                    />
                </Input.Wrapper>
                <Checkbox
                    label='Reduced death effects'
                    description='Hides death and crash particles; explosion damage and wrecks stay the same'
                    checked={configuration.isReducedDeathEffects}
                    onChange={(event) =>
                        setProperty(
                            'isReducedDeathEffects',
                            event.currentTarget.checked
                        )
                    }
                />
            </SimpleGrid>
        </Stack>
    );
};
