'use client';

import React from 'react';

import { Checkbox, Stack, Title } from '@mantine/core';

import { useConfiguratorContext } from '@/components/contexts/configurator-context';

export const ExtrasSection: React.FC = () => {
    const { configuration, setProperty } = useConfiguratorContext();

    return (
        <Stack gap='md'>
            <Title order={2}>Extras</Title>
            <Stack gap='sm'>
                <Checkbox
                    label='Mega Nuke'
                    checked={configuration.isMegaNuke}
                    onChange={(event) =>
                        setProperty('isMegaNuke', event.currentTarget.checked)
                    }
                />
                <Checkbox
                    label='T3 Geo + Walls'
                    checked={configuration.isT3GeoWalls}
                    onChange={(event) =>
                        setProperty('isT3GeoWalls', event.currentTarget.checked)
                    }
                />
            </Stack>
        </Stack>
    );
};
