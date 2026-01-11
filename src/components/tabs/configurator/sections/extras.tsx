'use client';

import React from 'react';

import {
    Checkbox,
    NativeSelect,
    SimpleGrid,
    Stack,
    Title,
} from '@mantine/core';

import { useConfiguratorContext } from '@/components/contexts/configurator-context';
import {
    Challenges,
    CHALLENGES,
} from '@/lib/command-generator/data/configuration';

export const ExtrasSection: React.FC = () => {
    const { configuration, setProperty } = useConfiguratorContext();

    return (
        <Stack gap='sm'>
            <Title order={3}>Extras</Title>
            <SimpleGrid spacing='xl' cols={2}>
                <Stack gap='sm'>
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
                    <Checkbox
                        label='T4 Economy'
                        description='Legendary fusion reactors and energy converters'
                        checked={configuration.isEcoT4}
                        onChange={(event) =>
                            setProperty('isEcoT4', event.currentTarget.checked)
                        }
                    />
                </Stack>
                <Stack gap='sm'>
                    <Checkbox
                        label='RFLRPC Rebalance'
                        description='Rebalance for Ragnarok, Calamity and Starfall'
                        checked={configuration.isRFLRPCRebalance}
                        onChange={(event) =>
                            setProperty(
                                'isRFLRPCRebalance',
                                event.currentTarget.checked
                            )
                        }
                    />
                    <Checkbox
                        label='Epic RFLRPC'
                        description='Epic Ragnarok, Calamity and Starfall'
                        checked={configuration.isRFLRPCT4}
                        onChange={(event) =>
                            setProperty(
                                'isRFLRPCT4',
                                event.currentTarget.checked
                            )
                        }
                    />
                    <Checkbox
                        label='Mega Nuke'
                        checked={configuration.isMegaNuke}
                        onChange={(event) =>
                            setProperty(
                                'isMegaNuke',
                                event.currentTarget.checked
                            )
                        }
                    />
                </Stack>
            </SimpleGrid>
        </Stack>
    );
};
