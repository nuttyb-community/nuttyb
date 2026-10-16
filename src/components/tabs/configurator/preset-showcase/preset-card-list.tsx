'use client';

import React, { useMemo, useState } from 'react';

import {
    ActionIcon,
    Badge,
    Button,
    Card,
    Divider,
    Flex,
    Group,
    Popover,
    ScrollArea,
    Stack,
    Text,
    Tooltip,
} from '@mantine/core';
import { useHover } from '@mantine/hooks';
import { IconFileExport, IconPencil, IconTrash } from '@tabler/icons-react';

import { InfoTooltip } from '@/components/common/info-tooltip';
import type { Preset } from '@/lib/presets/registry';

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
                        <Text size='10px' fw={600} c='dimmed' tt='uppercase'>
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
                                        style={{ whiteSpace: 'nowrap' }}
                                    >
                                        {o.label}
                                    </Text>
                                    <Text size='xs' fw={700} c='yellow.4'>
                                        {o.value}
                                    </Text>
                                </Group>
                                <Text size='10px' c='dimmed' lh={1.2}>
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
                        <Text size='10px' fw={600} c='dimmed' tt='uppercase'>
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

interface PresetCardFrameProps {
    isActive: boolean;
    isDisabled: boolean;
    onClick: () => void;
    children: React.ReactNode;
}

const PresetCardFrame: React.FC<PresetCardFrameProps> = ({
    isActive,
    isDisabled,
    onClick,
    children,
}) => {
    const { hovered, ref } = useHover<HTMLDivElement>();
    const isHighlighted = hovered && !isDisabled && !isActive;

    // Same states as the landing page link cards and the difficulty cards
    return (
        <Card
            ref={ref}
            p='xs'
            w={160}
            h={125}
            flex='none'
            withBorder
            bd={
                isActive || isHighlighted
                    ? '1px solid var(--mantine-primary-color-filled)'
                    : undefined
            }
            bg={
                isActive
                    ? 'var(--mantine-primary-color-light)'
                    : isHighlighted
                      ? 'var(--mantine-color-default-hover)'
                      : undefined
            }
            opacity={isDisabled ? 0.5 : undefined}
            onClick={onClick}
            style={{ cursor: isDisabled ? 'not-allowed' : 'pointer' }}
        >
            {children}
        </Card>
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
    const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(
        null
    );

    return (
        <ScrollArea scrollbars='x' type='hover' pb='xs'>
            <Flex gap='md' wrap='nowrap' py='xs'>
                {allPresets.map((preset) => {
                    const isActive = activePresetId === preset.id;
                    const isDisabled = preset.status === 'disabled';
                    const showModified = isActive && isModified;

                    return (
                        <PresetCardFrame
                            key={preset.id}
                            isActive={isActive}
                            isDisabled={isDisabled}
                            onClick={() => {
                                if (!isDisabled) onSelect(preset.id);
                            }}
                        >
                            {isDisabled && (
                                <Tooltip label='This preset is disabled. Edit it to re-enable.'>
                                    <Badge
                                        size='xs'
                                        variant='light'
                                        color='gray'
                                        style={{
                                            position: 'absolute',
                                            top: 4,
                                            left: 4,
                                        }}
                                    >
                                        Disabled
                                    </Badge>
                                </Tooltip>
                            )}
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
                                        <Popover
                                            opened={
                                                confirmingDeleteId === preset.id
                                            }
                                            onChange={(opened) => {
                                                if (!opened) {
                                                    setConfirmingDeleteId(null);
                                                }
                                            }}
                                            position='bottom'
                                            withArrow
                                            shadow='md'
                                        >
                                            <Popover.Target>
                                                <Tooltip label='Delete Preset'>
                                                    <ActionIcon
                                                        size='sm'
                                                        variant='subtle'
                                                        color='red'
                                                        onClick={() =>
                                                            setConfirmingDeleteId(
                                                                preset.id
                                                            )
                                                        }
                                                    >
                                                        <IconTrash size={12} />
                                                    </ActionIcon>
                                                </Tooltip>
                                            </Popover.Target>
                                            <Popover.Dropdown
                                                onClick={(e) =>
                                                    e.stopPropagation()
                                                }
                                            >
                                                <Stack gap={6}>
                                                    <Text size='xs'>
                                                        {`Delete '${preset.name}'?`}
                                                    </Text>
                                                    <Group
                                                        gap={6}
                                                        justify='flex-end'
                                                    >
                                                        <Button
                                                            size='xs'
                                                            variant='default'
                                                            onClick={() =>
                                                                setConfirmingDeleteId(
                                                                    null
                                                                )
                                                            }
                                                        >
                                                            Cancel
                                                        </Button>
                                                        <Button
                                                            size='xs'
                                                            color='red'
                                                            onClick={() => {
                                                                onDelete(
                                                                    preset.id
                                                                );
                                                                setConfirmingDeleteId(
                                                                    null
                                                                );
                                                            }}
                                                        >
                                                            Delete
                                                        </Button>
                                                    </Group>
                                                </Stack>
                                            </Popover.Dropdown>
                                        </Popover>
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

                            <InfoTooltip
                                label={<PresetTooltipContent preset={preset} />}
                                w={280}
                                position='bottom'
                                openDelay={300}
                                showIcon={false}
                            >
                                <Flex
                                    direction='column'
                                    align='center'
                                    justify='center'
                                    flex={1}
                                    mt={-2}
                                    gap='xs'
                                >
                                    <Text
                                        c={isActive ? 'blue' : 'dimmed'}
                                        lh={0}
                                    >
                                        {getPresetIcon(preset.icon, 24)}
                                    </Text>
                                    <Text
                                        size='sm'
                                        fw={700}
                                        ta='center'
                                        truncate='end'
                                        w='100%'
                                    >
                                        {preset.name}
                                        {showModified && ' *'}
                                    </Text>

                                    {preset.description && (
                                        <Text
                                            size='xs'
                                            c='dimmed'
                                            ta='center'
                                            truncate='end'
                                            w='100%'
                                        >
                                            {preset.description}
                                        </Text>
                                    )}
                                </Flex>
                            </InfoTooltip>
                        </PresetCardFrame>
                    );
                })}
            </Flex>
        </ScrollArea>
    );
};
