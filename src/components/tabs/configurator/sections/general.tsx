'use client';

import React from 'react';

import { NativeSelect, SimpleGrid, Stack, Title } from '@mantine/core';

import { useConfiguratorContext } from '@/components/contexts/configurator-context';
import {
    GameMap,
    MAPS,
    START_OPTIONS,
    StartOption,
} from '@/lib/command-generator/data/configuration';

export const GeneralSection: React.FC = () => {
    const { configuration, setProperty } = useConfiguratorContext();

    return (
        <Stack gap='sm'>
            <Title order={3}>General</Title>
            <SimpleGrid spacing='xl' cols={2}>
                <Stack gap='sm'>
                    <NativeSelect
                        label='Map'
                        data={MAPS}
                        value={configuration.gameMap}
                        onChange={(event) =>
                            setProperty(
                                'gameMap',
                                event.currentTarget.value as GameMap
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
                </Stack>
            </SimpleGrid>
        </Stack>
    );
};
