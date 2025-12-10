'use client';

import React from 'react';

import {
    ActionIcon,
    Badge,
    Button,
    Code,
    Group,
    Stack,
    Table,
    Text,
    Title,
    Tooltip,
} from '@mantine/core';
import { useClipboard } from '@mantine/hooks';

import { useCustomTweaksContext } from '@/components/contexts/custom-tweaks-context';
import type { CustomTweak } from '@/lib/commands/custom-tweaks';

interface TweakRowProps {
    tweak: CustomTweak;
    onDelete: (id: number) => void;
}

function TweakRow({ tweak, onDelete }: TweakRowProps) {
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
                <Badge
                    size='sm'
                    variant='light'
                    color={tweak.type === 'tweakdefs' ? 'blue' : 'green'}
                >
                    {tweak.type}
                </Badge>
            </Table.Td>
            <Table.Td>
                <Group gap='xs' wrap='nowrap'>
                    <Tooltip label={tweak.code} multiline maw={400}>
                        <Code style={{ fontSize: '11px', cursor: 'help' }}>
                            {displayCode}
                        </Code>
                    </Tooltip>
                    <Button
                        size='xs'
                        variant='light'
                        color={clipboard.copied ? 'teal' : 'gray'}
                        onClick={() => clipboard.copy(tweak.code)}
                    >
                        {clipboard.copied ? 'Copied!' : 'Copy'}
                    </Button>
                </Group>
            </Table.Td>
            <Table.Td>
                <ActionIcon
                    color='red'
                    variant='subtle'
                    onClick={() => onDelete(tweak.id)}
                    title='Delete tweak'
                >
                    ✕
                </ActionIcon>
            </Table.Td>
        </Table.Tr>
    );
}

const SavedTweaksList: React.FC = () => {
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

            <Table striped highlightOnHover>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>Description</Table.Th>
                        <Table.Th>Type</Table.Th>
                        <Table.Th>Code</Table.Th>
                        <Table.Th style={{ width: 50 }}>Actions</Table.Th>
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

export default SavedTweaksList;
