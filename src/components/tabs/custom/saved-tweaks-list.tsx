'use client';

import React from 'react';

import {
    ActionIcon,
    Code,
    Flex,
    Stack,
    Table,
    Text,
    Title,
    Tooltip,
} from '@mantine/core';
import { useClipboard } from '@mantine/hooks';
import { IconCheck, IconCopy, IconX } from '@tabler/icons-react';

import { ICON_STYLE } from '@/components/common/icon-style';
import { TweakTypeBadge } from '@/components/common/type-badge';
import { useCustomTweaksContext } from '@/components/contexts/custom-tweaks-context';
import type { CustomTweak } from '@/lib/command-generator/command-generator';

interface TweakRowProps {
    tweak: CustomTweak;
    onDelete: (id: number) => void;
}

const TweakRow: React.FC<TweakRowProps> = ({ tweak, onDelete }) => {
    const clipboard = useClipboard({ timeout: 1500 });

    // Truncate code for display
    const displayCode =
        tweak.code.length > 50 ? `${tweak.code.slice(0, 50)}...` : tweak.code;

    return (
        <Table.Tr>
            <Table.Td>
                <Text size='sm' fw={500}>
                    {tweak.description}
                </Text>
            </Table.Td>
            <Table.Td>
                <TweakTypeBadge type={tweak.type} />
            </Table.Td>
            <Table.Td>
                <Flex
                    gap='xs'
                    wrap='nowrap'
                    align='center'
                    justify='space-between'
                >
                    <Code style={{ fontSize: '11px', cursor: 'help' }}>
                        {displayCode}
                    </Code>
                    <Flex gap='xs' wrap='nowrap' align='center'>
                        <Tooltip label='Copy'>
                            <ActionIcon
                                variant='subtle'
                                size='sm'
                                color={clipboard.copied ? 'green' : 'blue'}
                                onClick={() => clipboard.copy(tweak.code)}
                            >
                                {clipboard.copied ? (
                                    <IconCheck {...ICON_STYLE} />
                                ) : (
                                    <IconCopy {...ICON_STYLE} />
                                )}
                            </ActionIcon>
                        </Tooltip>
                        <Tooltip label='Delete'>
                            <ActionIcon
                                variant='subtle'
                                size='sm'
                                color='red'
                                onClick={() => onDelete(tweak.id)}
                            >
                                <IconX {...ICON_STYLE} />
                            </ActionIcon>
                        </Tooltip>
                    </Flex>
                </Flex>
            </Table.Td>
        </Table.Tr>
    );
};

export const SavedTweaksList: React.FC = () => {
    const { customTweaks, deleteTweak } = useCustomTweaksContext();

    if (customTweaks.length === 0) {
        return (
            <Stack gap='md'>
                <Title order={3}>Saved Tweaks</Title>
                <Text c='dimmed' ta='center' py='xl'>
                    No custom tweaks saved yet
                </Text>
            </Stack>
        );
    }

    return (
        <Stack gap='md'>
            <Title order={3}>Saved Tweaks</Title>

            <Table striped>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>Description</Table.Th>
                        <Table.Th>Type</Table.Th>
                        <Table.Th>Code</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {customTweaks.map((tweak) => (
                        <TweakRow
                            key={tweak.id}
                            tweak={tweak}
                            onDelete={deleteTweak}
                        />
                    ))}
                </Table.Tbody>
            </Table>
        </Stack>
    );
};
