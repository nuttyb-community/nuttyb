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
                label='Cross faction T2'
                checked={configuration.isCrossFactionT2}
                onChange={(event) =>
                    setProperty('isCrossFactionT2', event.currentTarget.checked)
                }
            />
            <Checkbox
                label='T3 Eco'
                checked={configuration.isT3Eco}
                onChange={(event) =>
                    setProperty('isT3Eco', event.currentTarget.checked)
                }
            />
            <Checkbox
                label='T3 Builders'
                checked={configuration.isT3Builders}
                onChange={(event) =>
                    setProperty('isT3Builders', event.currentTarget.checked)
                }
            />
            <Checkbox
                label='Unit Launchers'
                checked={configuration.isUnitLaunchers}
                onChange={(event) =>
                    setProperty('isUnitLaunchers', event.currentTarget.checked)
                }
            />
            <Checkbox
                label='LRPC Rebalance v2'
                checked={configuration.isLrpcRebalance}
                onChange={(event) =>
                    setProperty('isLrpcRebalance', event.currentTarget.checked)
                }
            />
            <Checkbox
                label='T4 Defences Test'
                checked={configuration.isT4Defences}
                onChange={(event) =>
                    setProperty('isT4Defences', event.currentTarget.checked)
                }
            />
            <Checkbox
                label='T4 Air Rework'
                checked={configuration.isT4AirRework}
                onChange={(event) =>
                    setProperty('isT4AirRework', event.currentTarget.checked)
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
