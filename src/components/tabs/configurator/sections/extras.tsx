'use client';

import React from 'react';

import { Checkbox, NativeSelect, Stack, Title } from '@mantine/core';

import { useConfiguratorContext } from '@/components/contexts/configurator-context';
import { EXTRAS, Extras } from '@/lib/configuration';

const ExtrasSection: React.FC = () => {
    const { configuration, setProperty } = useConfiguratorContext();

    return (
        <Stack gap='sm'>
            <Title order={3}>Extras</Title>
            <NativeSelect
                label='Extras'
                data={EXTRAS}
                value={configuration.extras}
                onChange={(event) =>
                    setProperty('extras', event.currentTarget.value as Extras)
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
