'use client';

import React, { useEffect, useState } from 'react';

import { ActionIcon, TextInput, Tooltip } from '@mantine/core';
import { useDebouncedCallback } from '@mantine/hooks';
import { IconX } from '@tabler/icons-react';

import { LabelWithTooltip } from '@/components/common/label-with-tooltip';
import { useConfiguratorContext } from '@/components/contexts/configurator-context';
import { usePresetsContext } from '@/components/contexts/presets-context';
import { getDefaultLobbyNameTag } from '@/lib/command-generator/data/configuration';

/** Lobby name tag, saved after a pause in typing; empty means the auto tag. */
export const LobbyNameInput: React.FC = () => {
    const { configuration, setProperty } = useConfiguratorContext();
    const { activePresetName } = usePresetsContext();
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
        <TextInput
            label={
                <LabelWithTooltip
                    label='Name tag'
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
    );
};
