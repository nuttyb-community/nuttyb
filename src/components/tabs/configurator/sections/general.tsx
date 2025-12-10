'use client';

import React from 'react';

import {
    Checkbox,
    Flex,
    NativeSelect,
    Radio,
    Stack,
    TextInput,
    Title,
} from '@mantine/core';

import { useConfiguratorContext } from '@/components/contexts/configurator-context';
import { GameMap, MAPS, Mode, MODES } from '@/lib/configuration';

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
            <Checkbox
                label='NuttyB Main Tweaks'
                checked={configuration.isMainTweaks}
                onChange={(event) =>
                    setProperty('isMainTweaks', event.currentTarget.checked)
                }
            />
            <Checkbox
                label='NuttyB evolving commanders'
                checked={configuration.isEvolvingCommanders}
                onChange={(event) =>
                    setProperty(
                        'isEvolvingCommanders',
                        event.currentTarget.checked
                    )
                }
            />
            <Radio.Group
                label='Mode'
                value={configuration.mode}
                onChange={(value) => setProperty('mode', value as Mode)}
            >
                <Flex gap='md'>
                    {MODES.map((mode) => (
                        <Radio key={mode} value={mode} label={mode} />
                    ))}
                </Flex>
            </Radio.Group>
            <NativeSelect
                label='Map'
                data={MAPS}
                value={configuration.gameMap}
                onChange={(event) =>
                    setProperty('gameMap', event.currentTarget.value as GameMap)
                }
            />
        </Stack>
    );
};

export default GeneralSection;
