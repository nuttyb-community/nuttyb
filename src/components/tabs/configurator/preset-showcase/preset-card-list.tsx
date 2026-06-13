'use client';

import React, { useMemo } from 'react';

import {
    ActionIcon,
    Card,
    Divider,
    Flex,
    Group,
    ScrollArea,
    Stack,
    Text,
    Tooltip,
} from '@mantine/core';
import { IconFileExport, IconPencil, IconTrash } from '@tabler/icons-react';

import type { Preset } from '@/lib/presets/registry';

import styles from './preset-showcase.module.css';
import { computeConfigDiff, getPresetIcon } from './preset-showcase.utils';

interface PresetTooltipContentProps {
    preset: Preset;
}

const PresetTooltipContent: React.FC<PresetTooltipContentProps> = ({
    preset,
}) => {
    const overrides = useMemo(
        () => computeConfigDiff(preset.configuration),
        [preset.configuration]
    );

    return (
        <Stack gap={6}>
            <div>
                <Text size='sm' fw={700} c='yellow.4'>
                    {preset.name}
                </Text>
                {preset.description && (
                    <Text size='xs' c='dimmed' mt={2}>
                        {preset.description}
                    </Text>
                )}
            </div>
            {overrides.length > 0 && (
                <>
                    <Divider size='xs' color='dark.4' />
                    <Stack gap={4}>
                        <Text
                            size='10px'
                            fw={600}
                            c='dimmed'
                            className={styles.sectionLabel}
                        >
                            Settings:
                        </Text>
                        {overrides.map((o) => (
                            <div key={o.label}>
                                <Group
                                    justify='space-between'
                                    gap='xs'
                                    wrap='nowrap'
                                >
                                    <Text
                                        size='xs'
                                        fw={600}
                                        className={styles.noWrap}
                                    >
                                        {o.label}
                                    </Text>
                                    <Text size='xs' fw={700} c='yellow.4'>
                                        {o.value}
                                    </Text>
                                </Group>
                                <Text
                                    size='10px'
                                    c='dimmed'
                                    className={styles.tooltipDescription}
                                >
                                    {o.tooltip}
                                </Text>
                            </div>
                        ))}
                    </Stack>
                </>
            )}
            {preset.presetTweaks && preset.presetTweaks.length > 0 && (
                <>
                    <Divider size='xs' color='dark.4' />
                    <Stack gap={2}>
                        <Text
                            size='10px'
                            fw={600}
                            c='dimmed'
                            className={styles.sectionLabel}
                        >
                            Custom Tweaks:
                        </Text>
                        {preset.presetTweaks.map((t, idx) => (
                            <Text key={idx} size='xs' truncate>
                                • {t.description || t.path.split('/').pop()}
                            </Text>
                        ))}
                    </Stack>
                </>
            )}
        </Stack>
    );
};

interface PresetCardListProps {
    allPresets: Preset[];
    activePresetId: string | null;
    isModified: boolean;
    onSelect: (id: string) => void;
    onEdit: (preset: Preset) => void;
    onExport: (id: string) => void;
    onDelete: (id: string) => void;
}

export const PresetCardList: React.FC<PresetCardListProps> = ({
    allPresets,
    activePresetId,
    isModified,
    onSelect,
    onEdit,
    onExport,
    onDelete,
}) => {
    return (
        <ScrollArea scrollbars='x' type='hover' pb='xs'>
            <Flex gap='md' wrap='nowrap' py='xs'>
                {allPresets.map((preset) => {
                    const isActive = activePresetId === preset.id;
                    const showModified = isActive && isModified;

                    return (
                        <Card
                            key={preset.id}
                            shadow='md'
                            radius='md'
                            p='xs'
                            w={160}
                            h={125}
                            onClick={() => onSelect(preset.id)}
                            className={`${styles.presetCard} ${isActive ? styles.presetCardActive : ''}`}
                        >
                            {/* Top action bar row */}
                            <Group
                                gap={2}
                                justify='flex-end'
                                h={22}
                                w='100%'
                                onClick={(e) => e.stopPropagation()}
                            >
                                {!preset.isBuiltIn && (
                                    <>
                                        <Tooltip label='Edit Preset'>
                                            <ActionIcon
                                                size='sm'
                                                variant='subtle'
                                                color='yellow'
                                                onClick={() => onEdit(preset)}
                                            >
                                                <IconPencil size={12} />
                                            </ActionIcon>
                                        </Tooltip>
                                        <Tooltip label='Delete Preset'>
                                            <ActionIcon
                                                size='sm'
                                                variant='subtle'
                                                color='red'
                                                onClick={() =>
                                                    onDelete(preset.id)
                                                }
                                            >
                                                <IconTrash size={12} />
                                            </ActionIcon>
                                        </Tooltip>
                                    </>
                                )}
                                {/* Export is available for all presets */}
                                <Tooltip label='Export Preset JSON'>
                                    <ActionIcon
                                        size='sm'
                                        variant='subtle'
                                        color='blue'
                                        onClick={() => onExport(preset.id)}
                                    >
                                        <IconFileExport size={12} />
                                    </ActionIcon>
                                </Tooltip>
                            </Group>

                            <Tooltip
                                label={<PresetTooltipContent preset={preset} />}
                                multiline
                                w={280}
                                withArrow
                                transitionProps={{
                                    transition: 'pop',
                                    duration: 150,
                                }}
                                bg='var(--mantine-color-dark-8)'
                                c='var(--mantine-color-dark-0)'
                                bd='1px solid var(--mantine-primary-color-filled)'
                                radius='md'
                                p='xs'
                                position='bottom'
                                openDelay={300}
                            >
                                <Flex
                                    direction='column'
                                    align='center'
                                    justify='center'
                                    className={styles.cardBody}
                                    gap='xs'
                                >
                                    <div
                                        className={
                                            isActive
                                                ? styles.cardIconActive
                                                : styles.cardIcon
                                        }
                                    >
                                        {getPresetIcon(preset.icon, 24)}
                                    </div>
                                    <Text
                                        size='xs'
                                        fw={isActive ? 700 : 500}
                                        ta='center'
                                        c={isActive ? 'yellow.4' : 'white'}
                                        className={styles.truncateText}
                                    >
                                        {preset.name}
                                        {showModified && ' *'}
                                    </Text>

                                    {preset.description && (
                                        <Text
                                            size='10px'
                                            c='dimmed'
                                            ta='center'
                                            className={styles.truncateText}
                                        >
                                            {preset.description}
                                        </Text>
                                    )}
                                </Flex>
                            </Tooltip>
                        </Card>
                    );
                })}
            </Flex>
        </ScrollArea>
    );
};
