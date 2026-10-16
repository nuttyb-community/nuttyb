'use client';

import React, { useRef, useState } from 'react';

import {
    ActionIcon,
    Badge,
    Box,
    Group,
    List,
    Menu,
    Popover,
    Radio,
    ScrollArea,
    Stack,
    Text,
} from '@mantine/core';
import { useDebouncedValue, useElementSize, useHover } from '@mantine/hooks';
import {
    IconCircleCheckFilled,
    IconDots,
    IconFileExport,
    IconPencil,
} from '@tabler/icons-react';

import { ConfirmDeleteMenuItem } from '@/components/common/confirm-delete-menu-item';
import { ICON_SIZE_MD } from '@/components/common/icon-style';
import { usePresetsContext } from '@/components/contexts/presets-context';
import type { Preset } from '@/lib/presets/registry';

import { computeConfigDiff, ConfigDiffTable } from './preset-showcase.utils';

const PresetDetails: React.FC<{ preset: Preset }> = ({ preset }) => {
    const overrides = computeConfigDiff(preset.configuration);

    return (
        <Stack gap='md'>
            <Stack gap={2}>
                <Text fw={700}>{preset.name}</Text>
                {preset.description && (
                    <Text size='sm'>{preset.description}</Text>
                )}
            </Stack>
            {overrides.length > 0 && (
                <Stack gap='xs'>
                    <Text size='sm' fw={700}>
                        Settings
                    </Text>
                    <ConfigDiffTable overrides={overrides} />
                </Stack>
            )}
            {preset.presetTweaks && preset.presetTweaks.length > 0 && (
                <Stack gap='xs'>
                    <Text size='sm' fw={700}>
                        Custom tweaks
                    </Text>
                    <List size='sm' spacing={4}>
                        {preset.presetTweaks.map((t, idx) => (
                            <List.Item key={idx}>
                                {t.description || t.path.split('/').pop()}
                            </List.Item>
                        ))}
                    </List>
                </Stack>
            )}
        </Stack>
    );
};

interface PresetCardProps {
    preset: Preset;
    onEdit: (preset: Preset) => void;
}

/** Actions for the user's own presets. */
const PresetMenu: React.FC<PresetCardProps> = ({ preset, onEdit }) => {
    const { exportPreset, deleteLocalPreset } = usePresetsContext();

    return (
        <Menu position='bottom-end'>
            <Menu.Target>
                <ActionIcon
                    variant='subtle'
                    color='gray'
                    aria-label={`${preset.name} actions`}
                >
                    <IconDots size={18} />
                </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
                <Menu.Item
                    leftSection={<IconPencil {...ICON_SIZE_MD} />}
                    onClick={() => onEdit(preset)}
                >
                    Edit
                </Menu.Item>
                <Menu.Item
                    leftSection={<IconFileExport {...ICON_SIZE_MD} />}
                    onClick={() => exportPreset(preset.id)}
                >
                    Export JSON
                </Menu.Item>
                <ConfirmDeleteMenuItem
                    onDelete={() => deleteLocalPreset(preset.id)}
                />
            </Menu.Dropdown>
        </Menu>
    );
};

const PresetCard: React.FC<PresetCardProps> = ({ preset, onEdit }) => {
    const { activePresetId, isModified, selectPreset } = usePresetsContext();
    const { hovered, ref } = useHover<HTMLButtonElement>();
    // Details open after a short hover, or right away on keyboard focus
    const [hoveredLong] = useDebouncedValue(hovered, 400);
    const [isKeyboardFocused, setKeyboardFocused] = useState(false);
    const isActive = activePresetId === preset.id;
    const isDisabled = preset.status === 'disabled';

    return (
        // The menu sits beside the card, not inside it: a radio can't contain a button
        <Box pos='relative' flex='none' w={220}>
            <Popover
                opened={(hovered && hoveredLong) || isKeyboardFocused}
                width={320}
                position='bottom-start'
                shadow='md'
            >
                <Popover.Target>
                    {/* Arrow keys move between cards with the same name */}
                    <Radio.Card
                        ref={ref}
                        name='preset'
                        checked={isActive}
                        // Not `disabled`: that would stop the arrow keys here.
                        // selectPreset ignores disabled presets.
                        aria-disabled={isDisabled}
                        onClick={() => selectPreset(preset.id)}
                        p='md'
                        h='100%'
                        // A button centres its content; flex puts it at the top like a Card
                        display='flex'
                        // Selected: primary border and fill. Hover: background only.
                        bd={
                            isActive
                                ? '1px solid var(--mantine-primary-color-filled)'
                                : undefined
                        }
                        bg={
                            isActive
                                ? 'var(--mantine-primary-color-light)'
                                : hovered && !isDisabled
                                  ? 'var(--mantine-color-default-hover)'
                                  : undefined
                        }
                        opacity={isDisabled ? 0.5 : undefined}
                        style={{
                            cursor: isDisabled ? 'not-allowed' : undefined,
                            // Inside the edge: the scroll area clips anything outside
                            outlineOffset: -2,
                        }}
                        onFocus={(e) =>
                            setKeyboardFocused(
                                e.currentTarget.matches(':focus-visible')
                            )
                        }
                        onBlur={() => setKeyboardFocused(false)}
                    >
                        <Stack gap={4} flex={1}>
                            {/* Right padding keeps the title clear of the menu button */}
                            <Group
                                gap={6}
                                wrap='nowrap'
                                pr={preset.isBuiltIn ? 0 : 'lg'}
                            >
                                {isActive && (
                                    <Text c='blue' lh={0}>
                                        <IconCircleCheckFilled size={18} />
                                    </Text>
                                )}
                                {/* Long names give way to the badge with an ellipsis */}
                                <Text fw={700} truncate flex={1} miw={0}>
                                    {preset.name}
                                </Text>
                                {isActive && isModified && (
                                    <Badge
                                        size='sm'
                                        variant='light'
                                        flex='none'
                                    >
                                        Modified
                                    </Badge>
                                )}
                                {isDisabled && (
                                    <Badge
                                        size='sm'
                                        variant='light'
                                        color='gray'
                                        flex='none'
                                    >
                                        Disabled
                                    </Badge>
                                )}
                            </Group>
                            {preset.description && (
                                <Text size='sm' lineClamp={2}>
                                    {preset.description}
                                </Text>
                            )}
                        </Stack>
                    </Radio.Card>
                </Popover.Target>
                <Popover.Dropdown>
                    <PresetDetails preset={preset} />
                </Popover.Dropdown>
            </Popover>
            {!preset.isBuiltIn && (
                <Box pos='absolute' top={10} right={10}>
                    <PresetMenu preset={preset} onEdit={onEdit} />
                </Box>
            )}
        </Box>
    );
};

export const PresetCardList: React.FC<{
    onEdit: (preset: Preset) => void;
}> = ({ onEdit }) => {
    const { builtInPresets, localPresets } = usePresetsContext();
    const { ref: frameRef, width: frameWidth } = useElementSize();
    const { ref: rowRef, width: rowWidth } = useElementSize();
    const viewportRef = useRef<HTMLDivElement>(null);
    const [isAtEnd, setAtEnd] = useState(false);
    // Fade the right edge while more cards are hidden that way
    const hasMoreRight = rowWidth > frameWidth + 1 && !isAtEnd;
    // Stored presets are never built-in, whatever the saved data says
    const presets = [
        ...builtInPresets,
        ...localPresets.map((p) => ({ ...p, isBuiltIn: false })),
    ];

    return (
        <Box ref={frameRef} pos='relative'>
            {/* Scrolls sideways once the cards outgrow the column */}
            <ScrollArea
                scrollbars='x'
                type='auto'
                viewportRef={viewportRef}
                onScrollPositionChange={({ x }) => {
                    const viewport = viewportRef.current;
                    if (!viewport) return;
                    setAtEnd(
                        x + viewport.clientWidth >= viewport.scrollWidth - 1
                    );
                }}
            >
                <Group
                    ref={rowRef}
                    role='radiogroup'
                    aria-label='Preset'
                    gap='md'
                    wrap='nowrap'
                    align='stretch'
                    w='max-content'
                    // Clears the overlaid 12px scrollbar with a 16px gap
                    pb={28}
                >
                    {presets.map((preset) => (
                        <PresetCard
                            key={preset.id}
                            preset={preset}
                            onEdit={onEdit}
                        />
                    ))}
                </Group>
            </ScrollArea>
            <Box
                pos='absolute'
                top={0}
                right={0}
                bottom={0}
                w={64}
                opacity={hasMoreRight ? 1 : 0}
                style={{
                    background:
                        'linear-gradient(to right, transparent, var(--mantine-color-body))',
                    pointerEvents: 'none',
                    transition: 'opacity 150ms ease',
                }}
            />
        </Box>
    );
};
