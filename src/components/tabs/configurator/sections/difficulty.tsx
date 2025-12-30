'use client';

import React from 'react';

import { Flex, List, Radio, Stack, Text, Title } from '@mantine/core';

import { useConfiguratorContext } from '@/components/contexts/configurator-context';
import { useCustomTweaksContext } from '@/components/contexts/custom-tweaks-context';
import {
    PRESET_DIFFICULTIES,
    PresetDifficulty,
} from '@/lib/command-generator/data/configuration';

const PRESET_DETAILS: Record<
    PresetDifficulty,
    { title: string; description: string; features: string[] }
> = {
    Easy: {
        title: 'Easy',
        description: 'Gentle introduction with extra tools',
        features: [
            '1.3x enemy HP',
            '1.3x queen HP',
            'Cross-faction T2 labs',
            'T4 defences',
        ],
    },
    Medium: {
        title: 'Medium',
        description: 'Balanced challenge for experienced players',
        features: [
            '1.5x enemy HP',
            '1.5x queen HP',
            'Cross-faction T2 labs',
            'T4 defences',
        ],
    },
    Hard: {
        title: 'Hard',
        description: 'Brutal difficulty for veterans',
        features: ['3x enemy HP', '3x queen HP'],
    },
};

const DifficultySection: React.FC = () => {
    const { configuration, setProperty } = useConfiguratorContext();
    const { clearEnabledTweaks } = useCustomTweaksContext();

    const handlePresetChange = (value: string) => {
        setProperty('presetDifficulty', value as PresetDifficulty);
        clearEnabledTweaks();
    };

    return (
        <Stack gap='sm'>
            <Title order={3}>Difficulty</Title>
            <Radio.Group
                value={configuration.presetDifficulty}
                onChange={handlePresetChange}
            >
                <Flex align='start' gap='md'>
                    {PRESET_DIFFICULTIES.map((preset) => {
                        const details = PRESET_DETAILS[preset];
                        return (
                            <Radio.Card
                                key={preset}
                                value={preset}
                                radius='md'
                                p='sm'
                                bd={
                                    preset === configuration.presetDifficulty
                                        ? '1px solid var(--mantine-primary-color-filled)'
                                        : undefined
                                }
                                bg={
                                    preset === configuration.presetDifficulty
                                        ? 'var(--mantine-primary-color-light)'
                                        : undefined
                                }
                            >
                                <Stack gap='xs' style={{ flex: 1 }}>
                                    <Flex align='center' gap='md'>
                                        <Radio.Indicator />
                                        <Text fw={600}>{details.title}</Text>
                                    </Flex>
                                    <Text size='sm' c='dimmed'>
                                        {details.description}
                                    </Text>
                                    <List>
                                        {details.features.map((feature) => (
                                            <List.Item key={feature}>
                                                {feature}
                                            </List.Item>
                                        ))}
                                    </List>
                                </Stack>
                            </Radio.Card>
                        );
                    })}
                </Flex>
            </Radio.Group>
        </Stack>
    );
};

export default DifficultySection;
