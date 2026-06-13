'use client';

import React, { useEffect, useState } from 'react';

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
import { useDebouncedCallback } from '@mantine/hooks';
import { IconInfoCircle } from '@tabler/icons-react';

import { useConfiguratorContext } from '@/components/contexts/configurator-context';
import {
    GameMap,
    getDefaultLobbyNameTag,
    MAPS,
    START_OPTIONS,
    StartOption,
} from '@/lib/command-generator/data/configuration';

import styles from './general.module.css';

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
            <span className={styles.infoIcon}>
                <IconInfoCircle size={14} />
            </span>
        </Tooltip>
    </Group>
);

export const GeneralSection: React.FC = () => {
    const { configuration, setProperty } = useConfiguratorContext();
    const displayLobbyName =
        configuration.lobbyName || getDefaultLobbyNameTag(configuration);
    const [localLobbyName, setLocalLobbyName] = useState(displayLobbyName);

    // Sync local state when external configuration changes (e.g. preset switch)
    useEffect(() => {
        setLocalLobbyName(displayLobbyName);
    }, [displayLobbyName]);

    const debouncedSetProperty = useDebouncedCallback((val: string) => {
        setProperty('lobbyName', val);
    }, 1000);

    const handleLobbyNameChange = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const val = event.currentTarget.value;
        setLocalLobbyName(val);
        debouncedSetProperty(val);
    };

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
                        value={localLobbyName}
                        onChange={handleLobbyNameChange}
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
