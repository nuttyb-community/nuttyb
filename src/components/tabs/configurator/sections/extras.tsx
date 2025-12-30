'use client';

import React from 'react';

import { Checkbox, NativeSelect, Stack, Title } from '@mantine/core';

import { useConfiguratorContext } from '@/components/contexts/configurator-context';
import {
    Challenges,
    CHALLENGES,
} from '@/lib/command-generator/data/configuration';

const ExtrasSection: React.FC = () => {
    const { configuration, setProperty } = useConfiguratorContext();

    return (
        <Stack gap='sm'>
            <Title order={3}>Extras</Title>
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
                label='Mega Nuke'
                checked={configuration.isMegaNuke}
                onChange={(event) =>
                    setProperty('isMegaNuke', event.currentTarget.checked)
                }
            />
        </Stack>
    );
};

export default ExtrasSection;
