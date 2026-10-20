'use client';

import React from 'react';

import {
    Alert,
    Checkbox,
    Input,
    NumberInput,
    SegmentedControl,
    SimpleGrid,
    Stack,
    Title,
} from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';

import { LabelWithTooltip } from '@/components/common/label-with-tooltip';
import { useConfiguratorContext } from '@/components/contexts/configurator-context';
import { useNumberSetting } from '@/hooks/use-number-setting';
import {
    ECO_MAX_TIERS,
    ECO_STYLES,
} from '@/lib/command-generator/data/configuration';

export const EconomySection: React.FC = () => {
    const { configuration, setProperty } = useConfiguratorContext();

    const incomeMult = useNumberSetting('incomeMult', 0.1, 10);
    const buildPowerMult = useNumberSetting('buildPowerMult', 0.1, 10);
    const buildDistMult = useNumberSetting('buildDistMult', 0.5, 10);
    const t3AideCap = useNumberSetting('t3AideCap', 1, 100);

    return (
        <Stack gap='md'>
            <Title order={2}>Economy & Production</Title>
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
                <SimpleGrid spacing='xl' cols={2}>
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
                </SimpleGrid>
                <Checkbox
                    label='Cross-faction T2 labs'
                    description="Build other factions' T2 labs at 70% extra cost"
                    checked={configuration.isCrossFactionT2}
                    onChange={(event) =>
                        setProperty(
                            'isCrossFactionT2',
                            event.currentTarget.checked
                        )
                    }
                />
                <NumberInput
                    label={
                        <LabelWithTooltip
                            label='T3 aide cap'
                            tooltip='How many ground and air T3 aides each player can have (1 - 100)'
                        />
                    }
                    {...t3AideCap}
                    step={1}
                    allowNegative={false}
                    allowDecimal={false}
                    required
                />
            </Stack>
            <Stack gap='sm'>
                <Input.Wrapper
                    label='Economy style'
                    description='Classic NuttyB experience or fully upgradeable fusion reactors and energy converters.'
                >
                    <SegmentedControl
                        display='flex'
                        data={[...ECO_STYLES]}
                        value={configuration.ecoStyle}
                        onChange={(value) => setProperty('ecoStyle', value)}
                    />
                </Input.Wrapper>
                {configuration.ecoStyle === 'Classic' && (
                    <Alert
                        color='gray'
                        variant='light'
                        icon={<IconInfoCircle size={18} />}
                    >
                        T3 and T4 fusion reactors and energy converters are
                        added to the game. T4 are non-explosive.
                    </Alert>
                )}
                {configuration.ecoStyle === 'Evolving' && (
                    <Stack gap='sm'>
                        <Alert
                            color='gray'
                            variant='light'
                            icon={<IconInfoCircle size={18} />}
                        >
                            T1+ fusion reactors and T2+ converters are
                            upgradeable by building the next tier on top, up to
                            the chosen max. T4+ buildings are non-explosive.
                        </Alert>
                        <Input.Wrapper label='Maximum available tier'>
                            <SegmentedControl
                                display='flex'
                                data={ECO_MAX_TIERS.map((tier) => ({
                                    label: `T${tier}`,
                                    value: String(tier),
                                }))}
                                value={String(configuration.ecoMaxTier)}
                                onChange={(value) =>
                                    setProperty('ecoMaxTier', Number(value))
                                }
                            />
                        </Input.Wrapper>
                    </Stack>
                )}
            </Stack>
        </Stack>
    );
};
