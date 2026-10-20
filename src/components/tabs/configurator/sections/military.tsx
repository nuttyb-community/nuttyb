'use client';

import { Checkbox, Input, SegmentedControl, Stack, Title } from '@mantine/core';

import { ENABLED_MILITARY_TIERS } from '@/lib/command-generator/data/configuration';
import { useConfiguratorContext } from '@/components/contexts/configurator-context';

export const MilitarySection: React.FC = () => {
    const { configuration, setProperty } = useConfiguratorContext();

    return (
        <Stack gap='md'>
            <Title order={2}>Military</Title>
            <Stack gap='sm'>
                <Input.Wrapper
                    label='Buildable military units'
                    description='Combat unit tiers that factories and commanders offer. Builders, transports and satellites are always available.'
                    size='md'
                >
                    <SegmentedControl
                        display='flex'
                        data={[...ENABLED_MILITARY_TIERS]}
                        value={configuration.enabledMilitaryTiers}
                        onChange={(value) =>
                            setProperty('enabledMilitaryTiers', value)
                        }
                    />
                </Input.Wrapper>
                <Checkbox
                    label='T4 defences'
                    description='Tier 4 defensive structures'
                    checked={configuration.isDefencesT4}
                    onChange={(event) =>
                        setProperty('isDefencesT4', event.currentTarget.checked)
                    }
                />
                <Checkbox
                    label='RFLRPC Rebalance'
                    description='Rebalance for Ragnarok, Calamity and Starfall'
                    checked={configuration.isRFLRPCRebalance}
                    onChange={(event) =>
                        setProperty(
                            'isRFLRPCRebalance',
                            event.currentTarget.checked
                        )
                    }
                />
                <Checkbox
                    label='T4 RFLRPC'
                    description='More powerful, T4 versions of Ragnarok, Calamity and Starfall'
                    checked={configuration.isRFLRPCT4}
                    onChange={(event) =>
                        setProperty('isRFLRPCT4', event.currentTarget.checked)
                    }
                />
                <Checkbox
                    label='T3 unit launcher'
                    description='Launches a random Titan, Behemoth, Juggernaut or Sol Invictus'
                    checked={configuration.isT3UnitLauncher}
                    onChange={(event) =>
                        setProperty(
                            'isT3UnitLauncher',
                            event.currentTarget.checked
                        )
                    }
                />
                <Checkbox
                    label='Epic Tumbleweed launcher'
                    description='Launches Epic Tumbleweeds: huge damage, with friendly fire'
                    checked={configuration.isTumbleweedLauncher}
                    onChange={(event) =>
                        setProperty(
                            'isTumbleweedLauncher',
                            event.currentTarget.checked
                        )
                    }
                />
            </Stack>
        </Stack>
    );
};
