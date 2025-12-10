'use client';

import React from 'react';

import { NativeSelect, Stack, Title } from '@mantine/core';

import { useConfiguratorContext } from '@/components/contexts/configurator-context';
import {
    BOSS_HEALTH_VALUES,
    BossHealthValue,
    DIFFICULTIES,
    Difficulty,
    HEALTH_VALUES,
    HealthValue,
    START_OPTIONS,
    StartOption,
} from '@/lib/configuration';

const DifficultySection: React.FC = () => {
    const { configuration, setProperty } = useConfiguratorContext();

    return (
        <Stack gap='sm'>
            <Title order={3}>Difficulty</Title>
            <NativeSelect
                label='Difficulty'
                data={DIFFICULTIES}
                value={configuration.difficulty}
                onChange={(event) =>
                    setProperty(
                        'difficulty',
                        event.currentTarget.value as Difficulty
                    )
                }
            />
            <NativeSelect
                label='Start'
                data={START_OPTIONS}
                value={configuration.start}
                onChange={(event) =>
                    setProperty(
                        'start',
                        event.currentTarget.value as StartOption
                    )
                }
            />
            <NativeSelect
                label='Enemy health'
                data={HEALTH_VALUES}
                value={configuration.enemyHealth}
                onChange={(event) =>
                    setProperty(
                        'enemyHealth',
                        event.currentTarget.value as HealthValue
                    )
                }
            />
            <NativeSelect
                label='Boss health'
                data={BOSS_HEALTH_VALUES}
                value={configuration.bossHealth}
                onChange={(event) =>
                    setProperty(
                        'bossHealth',
                        event.currentTarget.value as BossHealthValue
                    )
                }
            />
        </Stack>
    );
};

export default DifficultySection;
