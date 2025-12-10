'use client';

import React, { useMemo } from 'react';

import { Badge, Checkbox, Flex, Stack, Text, Title } from '@mantine/core';

import { useConfiguratorContext } from '@/components/contexts/configurator-context';
import { useCustomTweaksContext } from '@/components/contexts/custom-tweaks-context';
import type { LuaTweakType, SlotUsage } from '@/lib/commands/custom-tweaks';
import {
    findFirstAvailableSlot,
    getAvailableSlotCount,
} from '@/lib/commands/custom-tweaks';
import { CONFIGURATION_MAPPING } from '@/lib/data/configuration-mapping';
import type { TweakValue } from '@/types/types';

/**
 * Calculate used slots from standard configuration options.
 * This counts which slots will be occupied by built-in tweaks.
 *
 * With 1:1 slot allocation, each Lua source file occupies its own slot.
 * Slots are assigned sequentially: 0 (base), 1, 2, ..., 9
 */
function calculateStandardSlotUsage(
    configuration: ReturnType<typeof useConfiguratorContext>['configuration']
): SlotUsage {
    // Count how many Lua sources will be assigned per type
    let tweakdefsCount = 0;
    let tweakunitsCount = 0;

    for (const configKey in configuration) {
        const configValue =
            configuration[configKey as keyof typeof configuration];
        const mapping =
            CONFIGURATION_MAPPING[
                configKey as keyof typeof CONFIGURATION_MAPPING
            ];
        const tweakValue = mapping.values[
            `${configValue}` as keyof typeof mapping.values
        ] as TweakValue | undefined;

        if (!tweakValue) continue;

        // Count Lua file references (starting with ~) for each type
        if (tweakValue.tweakdefs) {
            tweakdefsCount += tweakValue.tweakdefs.filter((p) =>
                p.startsWith('~')
            ).length;
        }
        if (tweakValue.tweakunits) {
            tweakunitsCount += tweakValue.tweakunits.filter((p) =>
                p.startsWith('~')
            ).length;
        }
    }

    // With 1:1 allocation, each source gets its own slot (0, 1, 2, ...)
    // Mark slots 0 through count-1 as used for each type
    const usage: SlotUsage = {
        tweakdefs: new Set<number>(),
        tweakunits: new Set<number>(),
    };

    for (let i = 0; i < tweakdefsCount; i++) {
        usage.tweakdefs.add(i);
    }
    for (let i = 0; i < tweakunitsCount; i++) {
        usage.tweakunits.add(i);
    }

    return usage;
}

const CustomTweaksSection: React.FC = () => {
    const { configuration } = useConfiguratorContext();
    const { customTweaks, isEnabled, toggleTweak, enabledIds } =
        useCustomTweaksContext();

    // For checking availability before enable, use configuration-based estimate
    // This avoids circular dependency (enabling affects sections which affects availability)
    const baseSlotUsage = useMemo(
        () => calculateStandardSlotUsage(configuration),
        [configuration]
    );

    // Get assigned slot for each enabled tweak (simulating the allocation algorithm)
    const assignedSlots = useMemo(() => {
        const slots = new Map<number, number>();
        const usage: SlotUsage = {
            tweakdefs: new Set(baseSlotUsage.tweakdefs),
            tweakunits: new Set(baseSlotUsage.tweakunits),
        };

        // Process in order (matching buildLobbySections behavior)
        for (const tweak of customTweaks) {
            if (enabledIds.has(tweak.id)) {
                const slot = findFirstAvailableSlot(usage, tweak.type);
                if (slot !== null) {
                    slots.set(tweak.id, slot);
                    usage[tweak.type].add(slot);
                }
            }
        }

        return slots;
    }, [baseSlotUsage, customTweaks, enabledIds]);

    // Calculate available slot counts (accounting for enabled custom tweaks)
    const availableSlotCounts = useMemo(() => {
        const usage: SlotUsage = {
            tweakdefs: new Set(baseSlotUsage.tweakdefs),
            tweakunits: new Set(baseSlotUsage.tweakunits),
        };

        // Add slots used by enabled custom tweaks
        for (const tweak of customTweaks) {
            if (enabledIds.has(tweak.id)) {
                const slot = findFirstAvailableSlot(usage, tweak.type);
                if (slot !== null) {
                    usage[tweak.type].add(slot);
                }
            }
        }

        return {
            tweakdefs: Math.max(0, getAvailableSlotCount(usage, 'tweakdefs')),
            tweakunits: Math.max(0, getAvailableSlotCount(usage, 'tweakunits')),
        };
    }, [baseSlotUsage, customTweaks, enabledIds]);

    // Check if a tweak can be enabled (has available slot)
    const canEnable = (type: LuaTweakType, tweakId: number): boolean => {
        if (enabledIds.has(tweakId)) return true; // Already enabled

        // Check if there's a slot available
        const usage: SlotUsage = {
            tweakdefs: new Set(baseSlotUsage.tweakdefs),
            tweakunits: new Set(baseSlotUsage.tweakunits),
        };

        // Add already-enabled custom tweaks
        for (const tweak of customTweaks) {
            if (enabledIds.has(tweak.id)) {
                const slot = findFirstAvailableSlot(usage, tweak.type);
                if (slot !== null) {
                    usage[tweak.type].add(slot);
                }
            }
        }

        return findFirstAvailableSlot(usage, type) !== null;
    };

    // Don't render if no custom tweaks
    if (customTweaks.length === 0) {
        return null;
    }

    return (
        <Stack gap='sm'>
            <Flex gap='md' align='baseline'>
                <Title order={3}>Custom Tweaks</Title>
                <Text size='xs' c='dimmed' mt='xs'>
                    Available slots: {availableSlotCounts.tweakdefs} tweakdefs,{' '}
                    {availableSlotCounts.tweakunits} tweakunits
                </Text>
            </Flex>

            <Flex gap='md' align='baseline' direction='row' wrap='wrap'>
                {customTweaks.map((tweak) => {
                    const enabled = isEnabled(tweak.id);
                    const slot = assignedSlots.get(tweak.id);
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
                            <Badge
                                size='sm'
                                variant='light'
                                color={
                                    tweak.type === 'tweakdefs'
                                        ? 'blue'
                                        : 'green'
                                }
                            >
                                {enabled && slot !== undefined
                                    ? `${tweak.type}${slot}`
                                    : tweak.type}
                            </Badge>
                        </Flex>
                    );
                })}
            </Flex>
        </Stack>
    );
};

export default CustomTweaksSection;
