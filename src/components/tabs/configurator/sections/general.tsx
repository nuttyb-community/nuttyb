'use client';

import React, { useEffect, useState } from 'react';

import {
    ActionIcon,
    NativeSelect,
    NumberInput,
    SimpleGrid,
    Stack,
    TextInput,
    Title,
    Tooltip,
} from '@mantine/core';
import { useDebouncedCallback } from '@mantine/hooks';
import { IconX } from '@tabler/icons-react';

import { LabelWithTooltip } from '@/components/common/info-tooltip';
import { useConfiguratorContext } from '@/components/contexts/configurator-context';
import { usePresetsContext } from '@/components/contexts/presets-context';
import { useNumberSetting } from '@/hooks/use-number-setting';
import {
    GameMap,
    getDefaultLobbyNameTag,
    MAPS,
    START_OPTIONS,
    StartOption,
} from '@/lib/command-generator/data/configuration';

export const GeneralSection: React.FC = () => {
    const { configuration, setProperty } = useConfiguratorContext();
    const { activePresetName } = usePresetsContext();
    const queenCount = useNumberSetting('queenCount', 1, 100);
    const incomeMult = useNumberSetting('incomeMult', 0.1, 10);
    const buildPowerMult = useNumberSetting('buildPowerMult', 0.1, 10);
    const buildDistMult = useNumberSetting('buildDistMult', 0.5, 10);
    const lobbyName = configuration.lobbyName ?? '';
    const [localLobbyName, setLocalLobbyName] = useState(lobbyName);

    // Sync local state when external configuration changes (e.g. preset switch)
    useEffect(() => {
        // ponytail: deliberate prop→state resync; key-based remount if this grows
        // eslint-disable-next-line react-hooks/set-state-in-effect
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
        <Stack gap='md'>
            <Title order={2}>Game settings</Title>
            <SimpleGrid spacing='xl' cols={2}>
                <Stack gap='sm'>
                    <TextInput
                        label={
                            <LabelWithTooltip
                                label='Lobby name tag'
                                tooltip='It will be added to auto-generated lobby name'
                            />
                        }
                        placeholder={getDefaultLobbyNameTag(
                            configuration,
                            activePresetName
                        )}
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
