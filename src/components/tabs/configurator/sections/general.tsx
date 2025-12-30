'use client';

import React from 'react';

import {
    NativeSelect,
    NumberInput,
    SimpleGrid,
    Stack,
    TextInput,
    Title,
} from '@mantine/core';

import { useConfiguratorContext } from '@/components/contexts/configurator-context';
import {
    GameMap,
    MAPS,
    START_OPTIONS,
    StartOption,
} from '@/lib/command-generator/data/configuration';

const GeneralSection: React.FC = () => {
    const { configuration, setProperty } = useConfiguratorContext();

    return (
        <Stack gap='sm'>
            <Title order={3}>General</Title>
            <SimpleGrid spacing='xl' cols={2}>
                <Stack gap='sm'>
                    <TextInput
                        label='Lobby name tag'
                        description='It will be added to auto-generated lobby name'
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
                    <NumberInput
                        label='Raptor queen count'
                        description='Number of raptor queens (1 - 100)'
                        value={configuration.queenCount}
                        onChange={(value) =>
                            setProperty('queenCount', Number(value) || 8)
                        }
                        min={1}
                        max={100}
                        step={1}
                        allowNegative={false}
                        required
                    />
                </Stack>
                <Stack gap='sm'>
                    <NumberInput
                        label='Resource income multiplier'
                        description='Affects both energy and metal production (0.1 - 10)'
                        value={configuration.incomeMult}
                        onChange={(value) =>
                            setProperty('incomeMult', Number(value) || 1)
                        }
                        min={0.1}
                        max={10}
                        step={0.1}
                        decimalScale={1}
                        allowNegative={false}
                        required
                    />
                    <NumberInput
                        label='Build power multiplier'
                        description='Affects the build power (0.1 - 10). Might want to make it the same as resource income multiplier for balance.'
                        value={configuration.buildPowerMult}
                        onChange={(value) =>
                            setProperty('buildPowerMult', Number(value) || 1)
                        }
                        min={0.1}
                        max={10}
                        step={0.1}
                        decimalScale={1}
                        allowNegative={false}
                        required
                    />
                    <NumberInput
                        label='Build distance multiplier'
                        description='Defines how far you can build, compared to vanilla BAR (0.5 - 10)'
                        value={configuration.buildDistMult}
                        onChange={(value) =>
                            setProperty('buildDistMult', Number(value) || 1.5)
                        }
                        min={0.5}
                        max={10}
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

export default GeneralSection;
