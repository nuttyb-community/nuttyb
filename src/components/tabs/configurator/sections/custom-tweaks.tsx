'use client';

import React from 'react';

import { Checkbox, Flex, Stack, Title } from '@mantine/core';

import { TypeBadge } from '@/components/common/type-badge';
import { useCustomTweaksContext } from '@/components/contexts/custom-tweaks-context';
import { useTweakDataContext } from '@/components/contexts/tweak-data-context';
import type { LuaTweakType } from '@/types/types';

export const CustomTweaksSection: React.FC = () => {
    const { customTweaks, isEnabled, toggleTweak, enabledIds } =
        useCustomTweaksContext();
    const { slotUsage } = useTweakDataContext();

    // Check if a tweak can be enabled (has available slot)
    const canEnable = (type: LuaTweakType, tweakId: number): boolean => {
        if (enabledIds.has(tweakId)) return true; // Already enabled
        if (!slotUsage) return true; // Optimistic: allow when slot data not yet loaded

        // Check if there's a slot available for this type
        const available = slotUsage[type].total - slotUsage[type].used;
        return available > 0;
    };

    // Don't render if no custom tweaks
    if (customTweaks.length === 0) {
        return null;
    }

    return (
        <Stack gap='sm'>
            <Title order={3}>Custom Tweaks</Title>

            <Flex gap='md' align='baseline' direction='row' wrap='wrap'>
                {customTweaks.map((tweak) => {
                    const enabled = isEnabled(tweak.id);
                    const disabled = !canEnable(tweak.type, tweak.id);

                    return (
                        <Flex
                            key={tweak.id}
                            gap='xs'
                            align='center'
                            wrap='nowrap'
                        >
                            <Checkbox
                                label={tweak.description}
                                checked={enabled}
                                disabled={disabled}
                                onChange={() => toggleTweak(tweak.id)}
                            />
                            <TypeBadge type={tweak.type} />
                        </Flex>
                    );
                })}
            </Flex>
        </Stack>
    );
};
