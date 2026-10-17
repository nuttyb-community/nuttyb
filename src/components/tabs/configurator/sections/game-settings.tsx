'use client';

import React from 'react';

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
    GameMap,
    MAPS,
    START_OPTIONS,
    StartOption,
} from '@/lib/command-generator/data/configuration';

import { LobbyNameInput } from './lobby-name-input';

export const GameSettingsSection: React.FC = () => {
    const { configuration, setProperty } = useConfiguratorContext();
    const queenCount = useNumberSetting('queenCount', 1, 100);
    const incomeMult = useNumberSetting('incomeMult', 0.1, 10);
    const buildPowerMult = useNumberSetting('buildPowerMult', 0.1, 10);
    const buildDistMult = useNumberSetting('buildDistMult', 0.5, 10);

    return (
        <Stack gap='md'>
            <Title order={2}>Game settings</Title>
            <SimpleGrid spacing='xl' cols={2}>
                <Stack gap='sm'>
                    <LobbyNameInput />
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
                        label={
                            <LabelWithTooltip
                                label='Start'
                                tooltip='Starting conditions. "No rush" provides a 12-minute grace period before waves start.'
                            />
                        }
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
                        label={
                            <LabelWithTooltip
                                label='Raptor queen count'
                                tooltip='Number of raptor queens (1 - 100)'
                            />
                        }
                        {...queenCount}
                        step={1}
                        allowNegative={false}
                        required
                    />
                </Stack>
                <Stack gap='sm'>
                    <NumberInput
                        label={
                            <LabelWithTooltip
                                label='Resource income multiplier'
                                tooltip='Affects both energy and metal production (0.1 - 10)'
                            />
                        }
                        {...incomeMult}
                        step={0.1}
                        decimalScale={1}
                        allowNegative={false}
                        required
                    />
                    <NumberInput
                        label={
                            <LabelWithTooltip
                                label='Build power multiplier'
                                tooltip='Affects build power (0.1 - 10). Suggest matching the resource income multiplier for balance.'
                            />
                        }
                        {...buildPowerMult}
                        step={0.1}
                        decimalScale={1}
                        allowNegative={false}
                        required
                    />
                    <NumberInput
                        label={
                            <LabelWithTooltip
                                label='Build distance multiplier'
                                tooltip='Defines how far you can build compared to vanilla BAR (0.5 - 10)'
                            />
                        }
                        {...buildDistMult}
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
