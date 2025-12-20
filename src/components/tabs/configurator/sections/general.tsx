'use client';

import React from 'react';

import { NativeSelect, Stack, TextInput, Title } from '@mantine/core';

import { useConfiguratorContext } from '@/components/contexts/configurator-context';
import { GameMap, MAPS, START_OPTIONS, StartOption } from '@/lib/configuration';

const GeneralSection: React.FC = () => {
    const { configuration, setProperty } = useConfiguratorContext();

    return (
        <Stack gap='sm'>
            <Title order={3}>General</Title>
            <TextInput
                label='Lobby name tag'
                placeholder='Custom name tag (optional)'
                value={configuration.lobbyName}
                onChange={(event) =>
                    setProperty('lobbyName', event.currentTarget.value)
                }
            />
            <NativeSelect
                label='Map'
                data={MAPS}
                value={configuration.gameMap}
                onChange={(event) =>
                    setProperty('gameMap', event.currentTarget.value as GameMap)
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
    );
};

export default GeneralSection;
