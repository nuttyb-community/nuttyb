'use client';

import React, { useMemo, useRef, useState } from 'react';

import {
    ActionIcon,
    Badge,
    Box,
    Card,
    Group,
    List,
    Menu,
    Popover,
    ScrollArea,
    Stack,
    Table,
    Text,
} from '@mantine/core';
import { useDebouncedValue, useElementSize, useHover } from '@mantine/hooks';
import {
    IconCircleCheckFilled,
    IconDots,
    IconFileExport,
    IconPencil,
    IconTrash,
} from '@tabler/icons-react';

import { ICON_SIZE_MD } from '@/components/common/icon-style';
import type { Preset } from '@/lib/presets/registry';

import { computeConfigDiff } from './preset-showcase.utils';

const PresetDetails: React.FC<{ preset: Preset }> = ({ preset }) => {
    const overrides = useMemo(
        () => computeConfigDiff(preset.configuration),
        [preset.configuration]
    );

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
                    <Table
                        fz='sm'
                        verticalSpacing={4}
                        horizontalSpacing={0}
                        withRowBorders={false}
                    >
                        <Table.Tbody>
                            {overrides.map((o) => (
                                <Table.Tr key={o.label}>
                                    <Table.Td>{o.label}</Table.Td>
                                    <Table.Td ta='right' fw={700}>
                                        {o.value}
                                    </Table.Td>
                                </Table.Tr>
                            ))}
                        </Table.Tbody>
                    </Table>
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

interface PresetMenuProps {
    preset: Preset;
    onEdit: (preset: Preset) => void;
    onExport: (id: string) => void;
    onDelete: (id: string) => void;
}

/** Actions for the user's own presets; delete asks for a second click. */
const PresetMenu: React.FC<PresetMenuProps> = ({
    preset,
    onEdit,
    onExport,
    onDelete,
}) => {
    const [isConfirmingDelete, setConfirmingDelete] = useState(false);

    return (
        <Menu position='bottom-end' onClose={() => setConfirmingDelete(false)}>
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
                    onClick={() => onExport(preset.id)}
                >
                    Export JSON
                </Menu.Item>
                <Menu.Item
                    color='red'
                    leftSection={<IconTrash {...ICON_SIZE_MD} />}
                    closeMenuOnClick={isConfirmingDelete}
                    onClick={() =>
                        isConfirmingDelete
                            ? onDelete(preset.id)
                            : setConfirmingDelete(true)
                    }
                >
                    {isConfirmingDelete ? 'Click again to delete' : 'Delete'}
                </Menu.Item>
            </Menu.Dropdown>
        </Menu>
    );
};

interface PresetCardProps extends PresetMenuProps {
    isActive: boolean;
    isModified: boolean;
    onSelect: (id: string) => void;
}

const PresetCard: React.FC<PresetCardProps> = ({
    preset,
    isActive,
    isModified,
    onSelect,
    ...menuProps
}) => {
    const { hovered, ref } = useHover<HTMLDivElement>();
    // Details open after a short hover, or right away on keyboard focus
    const [hoveredLong] = useDebouncedValue(hovered, 400);
    const [isKeyboardFocused, setKeyboardFocused] = useState(false);
    const isDisabled = preset.status === 'disabled';
    const select = () => {
        if (!isDisabled) onSelect(preset.id);
    };

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
                    <Card
                        ref={ref}
                        role='radio'
                        aria-checked={isActive}
                        aria-disabled={isDisabled}
                        tabIndex={0}
                        // Mantine's focus ring utility class
                        className='mantine-focus-auto'
                        withBorder
                        padding='md'
                        h='100%'
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
                            cursor: isDisabled ? 'not-allowed' : 'pointer',
                            // Inside the edge: the scroll area clips anything outside
                            outlineOffset: -2,
                        }}
                        onClick={select}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                select();
                            }
                        }}
                        onFocus={(e) =>
                            setKeyboardFocused(
                                e.currentTarget.matches(':focus-visible')
                            )
                        }
                        onBlur={() => setKeyboardFocused(false)}
                    >
                        <Stack gap={4}>
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
                    </Card>
                </Popover.Target>
                <Popover.Dropdown>
                    <PresetDetails preset={preset} />
                </Popover.Dropdown>
            </Popover>
            {!preset.isBuiltIn && (
                <Box pos='absolute' top={10} right={10}>
                    <PresetMenu preset={preset} {...menuProps} />
                </Box>
            )}
        </Box>
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
    ...cardProps
}) => {
    const { ref: frameRef, width: frameWidth } = useElementSize();
    const { ref: rowRef, width: rowWidth } = useElementSize();
    const viewportRef = useRef<HTMLDivElement>(null);
    const [isAtEnd, setAtEnd] = useState(false);
    // Fade the right edge while more cards are hidden that way
    const hasMoreRight = rowWidth > frameWidth + 1 && !isAtEnd;

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
                    {allPresets.map((preset) => (
                        <PresetCard
                            key={preset.id}
                            preset={preset}
                            isActive={activePresetId === preset.id}
                            {...cardProps}
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
