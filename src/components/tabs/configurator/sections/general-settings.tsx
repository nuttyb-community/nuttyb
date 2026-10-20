'use client';

import React from 'react';

import { NativeSelect, Stack, Title } from '@mantine/core';

import { LabelWithTooltip } from '@/components/common/label-with-tooltip';
import { useConfiguratorContext } from '@/components/contexts/configurator-context';
import {
    GameMap,
    MAPS,
    START_OPTIONS,
    StartOption,
} from '@/lib/command-generator/data/configuration';

import { LobbyNameInput } from './lobby-name-input';

export const GeneralSettingsSection: React.FC = () => {
    const { configuration, setProperty } = useConfiguratorContext();

    return (
        <Stack gap='md'>
            <Title order={2}>General settings</Title>
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
            </Stack>
        </Stack>
    );
};
