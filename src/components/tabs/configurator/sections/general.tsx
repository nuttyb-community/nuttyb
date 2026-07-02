'use client';

import React, { useEffect, useState } from 'react';

import {
    ActionIcon,
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
import { IconInfoCircle, IconX } from '@tabler/icons-react';

import { useConfiguratorContext } from '@/components/contexts/configurator-context';
import {
    DEFAULT_CONFIGURATION,
    GameMap,
    getDefaultLobbyNameTag,
    MAPS,
    START_OPTIONS,
    StartOption,
} from '@/lib/command-generator/data/configuration';

import styles from './general.module.css';

function clampNumber(
    value: string | number,
    min: number,
    max: number,
    fallback: number
): number {
    const numericValue = Number(value);

    if (value === '' || !Number.isFinite(numericValue)) {
        return fallback;
    }

    return Math.min(max, Math.max(min, numericValue));
}

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
    const lobbyName = configuration.lobbyName ?? '';
    const [localLobbyName, setLocalLobbyName] = useState(lobbyName);

    // Sync local state when external configuration changes (e.g. preset switch)
    useEffect(() => {
        setLocalLobbyName(lobbyName);
    }, [lobbyName]);

    const debouncedSetProperty = useDebouncedCallback((val: string) => {
        setProperty('lobbyName', val);
    }, 500);

    const handleLobbyNameChange = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const val = event.currentTarget.value;
        setLocalLobbyName(val);
        debouncedSetProperty(val);
    };

    const handleResetLobbyName = () => {
        debouncedSetProperty.cancel();
        setLocalLobbyName('');
        setProperty('lobbyName', '');
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
                        onBlur={() => debouncedSetProperty.flush()}
                        rightSection={
                            localLobbyName !== '' && (
                                <Tooltip label='Reset to auto'>
                                    <ActionIcon
                                        size='sm'
                                        variant='subtle'
                                        color='gray'
                                        aria-label='Reset to auto'
                                        onClick={handleResetLobbyName}
                                    >
                                        <IconX size={14} />
                                    </ActionIcon>
                                </Tooltip>
                            )
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
                            setProperty(
                                'queenCount',
                                clampNumber(
                                    value,
                                    1,
                                    100,
                                    DEFAULT_CONFIGURATION.queenCount
                                )
                            )
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
                            setProperty(
                                'incomeMult',
                                clampNumber(
                                    value,
                                    0.1,
                                    10,
                                    DEFAULT_CONFIGURATION.incomeMult
                                )
                            )
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
                            setProperty(
                                'buildPowerMult',
                                clampNumber(
                                    value,
                                    0.1,
                                    10,
                                    DEFAULT_CONFIGURATION.buildPowerMult
                                )
                            )
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
                            setProperty(
                                'buildDistMult',
                                clampNumber(
                                    value,
                                    0.5,
                                    10,
                                    DEFAULT_CONFIGURATION.buildDistMult
                                )
                            )
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
