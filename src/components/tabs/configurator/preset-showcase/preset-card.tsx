'use client';

import React, { useState } from 'react';

import {
    ActionIcon,
    Badge,
    Box,
    Group,
    Menu,
    Popover,
    Radio,
    Stack,
    Text,
} from '@mantine/core';
import { useDebouncedValue, useHover } from '@mantine/hooks';
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

import { PresetDetails } from './preset-details';

interface EditablePresetProps {
    preset: Preset;
    onEdit: (preset: Preset) => void;
}

/** Actions for the user's own presets. */
const PresetMenu: React.FC<EditablePresetProps> = ({ preset, onEdit }) => {
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

export const PresetCard: React.FC<EditablePresetProps> = ({
    preset,
    onEdit,
}) => {
    const { activePresetId, isModified, selectPreset } = usePresetsContext();
    const { hovered, ref } = useHover<HTMLButtonElement>();
    // Details open after a short hover, or right away on keyboard focus
    const [hoveredLong] = useDebouncedValue(hovered, 400);
    const [isKeyboardFocused, setKeyboardFocused] = useState(false);
    const isActive = activePresetId === preset.id;

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
                                : hovered
                                  ? 'var(--mantine-color-default-hover)'
                                  : 'var(--mantine-color-default)'
                        }
                        // Inside the edge: the scroll area clips anything outside
                        style={{ outlineOffset: -2 }}
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
                                    <IconCircleCheckFilled
                                        size={18}
                                        color='var(--mantine-color-blue-text)'
                                    />
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
