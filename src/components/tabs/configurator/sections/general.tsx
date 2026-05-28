'use client';

import React from 'react';

import {
    Group,
    NativeSelect,
    NumberInput,
    SimpleGrid,
    Stack,
    TextInput,
    Title,
    Tooltip,
} from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';

import { useConfiguratorContext } from '@/components/contexts/configurator-context';
import {
    GameMap,
    getDefaultLobbyNameTag,
    MAPS,
    START_OPTIONS,
    StartOption,
} from '@/lib/command-generator/data/configuration';

interface LabelWithTooltipProps {
    label: string;
    tooltip: string;
}

const LabelWithTooltip: React.FC<LabelWithTooltipProps> = ({
    label,
    tooltip,
}) => (
    <Group
        gap={4}
        align='center'
        wrap='nowrap'
        style={{ display: 'inline-flex' }}
    >
        <span>{label}</span>
        <Tooltip
            label={tooltip}
            multiline
            w={240}
            withArrow
            transitionProps={{ transition: 'pop', duration: 150 }}
            events={{ hover: true, focus: true, touch: true }}
            bg='var(--mantine-color-dark-8)'
            c='var(--mantine-color-dark-0)'
            bd='1px solid var(--mantine-primary-color-filled)'
            radius='md'
            p='xs'
        >
            <span
                style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    color: 'var(--mantine-color-dimmed)',
                    cursor: 'help',
                    verticalAlign: 'middle',
                    transition: 'color 0.2s ease',
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.color =
                        'var(--mantine-primary-color-filled)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'var(--mantine-color-dimmed)';
                }}
            >
                <IconInfoCircle size={14} />
            </span>
        </Tooltip>
    </Group>
);

export const GeneralSection: React.FC = () => {
    const { configuration, setProperty } = useConfiguratorContext();

    return (
        <Stack gap='sm'>
            <Title order={3}>General</Title>
            <SimpleGrid spacing='xl' cols={2}>
                <Stack gap='sm'>
                    <TextInput
                        label={
                            <LabelWithTooltip
                                label='Lobby name tag'
                                tooltip='It will be added to auto-generated lobby name'
                            />
                        }
                        placeholder={getDefaultLobbyNameTag(configuration)}
                        value={
                            configuration.lobbyName ||
                            getDefaultLobbyNameTag(configuration)
                        }
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
                        label={
                            <LabelWithTooltip
                                label='Resource income multiplier'
                                tooltip='Affects both energy and metal production (0.1 - 10)'
                            />
                        }
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
                        label={
                            <LabelWithTooltip
                                label='Build power multiplier'
                                tooltip='Affects build power (0.1 - 10). Suggest matching the resource income multiplier for balance.'
                            />
                        }
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
                        label={
                            <LabelWithTooltip
                                label='Build distance multiplier'
                                tooltip='Defines how far you can build compared to vanilla BAR (0.5 - 10)'
                            />
                        }
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
