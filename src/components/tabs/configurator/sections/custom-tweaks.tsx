'use client';

import React, { useState } from 'react';

import {
    ActionIcon,
    Button,
    Checkbox,
    Group,
    Menu,
    Stack,
    Table,
    Text,
    Title,
} from '@mantine/core';
import { useClipboard, useDisclosure } from '@mantine/hooks';
import {
    IconArrowDown,
    IconArrowUp,
    IconCheck,
    IconCopy,
    IconDots,
    IconPencil,
    IconPlus,
} from '@tabler/icons-react';

import { ConfirmDeleteMenuItem } from '@/components/common/confirm-delete-menu-item';
import { ICON_SIZE_MD, ICON_STYLE } from '@/components/common/icon-style';
import { TweakTypeBadge } from '@/components/common/type-badge';
import { useCustomTweaksContext } from '@/components/contexts/custom-tweaks-context';
import type { CustomTweak } from '@/lib/command-generator/command-generator';

import { CustomTweakModal } from './custom-tweak-modal';

interface TweakMenuProps {
    tweak: CustomTweak;
    onEdit: (tweak: CustomTweak) => void;
}

/** Edit, copy and delete; delete asks for a second click, like presets. */
const TweakMenu: React.FC<TweakMenuProps> = ({ tweak, onEdit }) => {
    const { deleteTweak } = useCustomTweaksContext();
    const clipboard = useClipboard();

    return (
        <Menu position='bottom-end'>
            <Menu.Target>
                <ActionIcon
                    variant='subtle'
                    color='gray'
                    aria-label={`${tweak.description} actions`}
                >
                    <IconDots {...ICON_STYLE} />
                </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
                <Menu.Item
                    leftSection={<IconPencil {...ICON_SIZE_MD} />}
                    onClick={() => onEdit(tweak)}
                >
                    Edit
                </Menu.Item>
                <Menu.Item
                    leftSection={
                        clipboard.copied ? (
                            <IconCheck {...ICON_SIZE_MD} />
                        ) : (
                            <IconCopy {...ICON_SIZE_MD} />
                        )
                    }
                    // Stays open so "Copied" can show
                    closeMenuOnClick={false}
                    onClick={() => clipboard.copy(tweak.code)}
                >
                    {clipboard.copied ? 'Copied' : 'Copy code'}
                </Menu.Item>
                <ConfirmDeleteMenuItem onDelete={() => deleteTweak(tweak.id)} />
            </Menu.Dropdown>
        </Menu>
    );
};

interface TweakRowProps extends TweakMenuProps {
    isFirst: boolean;
    isLast: boolean;
}

const TweakRow: React.FC<TweakRowProps> = ({
    tweak,
    isFirst,
    isLast,
    onEdit,
}) => {
    const { isEnabled, toggleTweak, moveTweakUp, moveTweakDown } =
        useCustomTweaksContext();

    return (
        <Table.Tr>
            {/* Takes the spare width, so the buttons column hugs its content */}
            <Table.Td w='100%'>
                <Group gap='xs' wrap='nowrap'>
                    <Checkbox
                        label={tweak.description}
                        checked={isEnabled(tweak.id)}
                        onChange={() => toggleTweak(tweak.id)}
                    />
                    <TweakTypeBadge type={tweak.type} />
                </Group>
            </Table.Td>
            <Table.Td>
                <Group gap='xs' wrap='nowrap' justify='flex-end'>
                    {/* Order only matters once there are two */}
                    {!(isFirst && isLast) && (
                        <>
                            <ActionIcon
                                variant='subtle'
                                color='gray'
                                onClick={() => moveTweakUp(tweak.id)}
                                disabled={isFirst}
                                aria-label={`Move ${tweak.description} up`}
                            >
                                <IconArrowUp {...ICON_STYLE} />
                            </ActionIcon>
                            <ActionIcon
                                variant='subtle'
                                color='gray'
                                onClick={() => moveTweakDown(tweak.id)}
                                disabled={isLast}
                                aria-label={`Move ${tweak.description} down`}
                            >
                                <IconArrowDown {...ICON_STYLE} />
                            </ActionIcon>
                        </>
                    )}
                    <TweakMenu tweak={tweak} onEdit={onEdit} />
                </Group>
            </Table.Td>
        </Table.Tr>
    );
};

export const CustomTweaksSection: React.FC = () => {
    const { customTweaks } = useCustomTweaksContext();
    const [isModalOpen, { open: openModal, close: closeModal }] =
        useDisclosure(false);
    // Kept after closing, so the title doesn't change during the exit animation
    const [editedTweak, setEditedTweak] = useState<CustomTweak | null>(null);

    const sortedTweaks = customTweaks.toSorted(
        (a, b) => a.priority - b.priority
    );

    const openEditor = (tweak: CustomTweak | null) => {
        setEditedTweak(tweak);
        openModal();
    };

    return (
        <Stack gap='md'>
            <Stack gap='xs'>
                <Title order={2}>Custom tweaks</Title>
                <Text size='sm'>
                    Your own tweakdefs and tweakunits code, added to the
                    commands while it&apos;s turned on.
                    {sortedTweaks.length > 1 &&
                        ' Tweaks load from top to bottom.'}
                </Text>
            </Stack>

            {sortedTweaks.length > 0 && (
                // Stripes and hover tie each name to its buttons across the row
                <Table striped highlightOnHover withRowBorders={false}>
                    <Table.Tbody>
                        {sortedTweaks.map((tweak, index) => (
                            <TweakRow
                                key={tweak.id}
                                tweak={tweak}
                                isFirst={index === 0}
                                isLast={index === sortedTweaks.length - 1}
                                onEdit={openEditor}
                            />
                        ))}
                    </Table.Tbody>
                </Table>
            )}

            <Group>
                <Button
                    variant='default'
                    leftSection={<IconPlus {...ICON_SIZE_MD} />}
                    onClick={() => openEditor(null)}
                >
                    Add custom tweak
                </Button>
            </Group>

            <CustomTweakModal
                opened={isModalOpen}
                onClose={closeModal}
                tweak={editedTweak}
            />
        </Stack>
    );
};
