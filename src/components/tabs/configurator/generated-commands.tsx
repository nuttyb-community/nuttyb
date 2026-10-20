'use client';

import type React from 'react';
import { useEffect, useRef } from 'react';

import {
    Alert,
    Button,
    Group,
    List,
    Progress,
    Stack,
    Text,
    Textarea,
    Title,
} from '@mantine/core';
import { useClipboard } from '@mantine/hooks';
import { IconCheck, IconCopy } from '@tabler/icons-react';

import { ICON_SIZE_MD } from '@/components/common/icon-style';
import { useTweakDataContext } from '@/components/contexts/tweak-data-context';

interface SlotMeterProps {
    label: string;
    used: number;
    total: number;
}

const SlotMeter: React.FC<SlotMeterProps> = ({ label, used, total }) => {
    const percent = total > 0 ? (used / total) * 100 : 100;
    const color =
        used >= total
            ? 'red'
            : percent >= 80 // Orange from 80% of the slots used
              ? 'orange'
              : 'blue';

    return (
        <Stack gap={4}>
            <Group justify='space-between'>
                <Text size='sm'>{label}</Text>
                <Text size='sm'>
                    {used} / {total}
                </Text>
            </Group>
            <Progress value={percent} color={color} />
        </Stack>
    );
};

export const GeneratedCommands: React.FC = () => {
    const { commandText, slotUsage, droppedTweaks, error } =
        useTweakDataContext();
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const clipboard = useClipboard();

    // The clipboard can be blocked; then select the text so Ctrl+C works
    useEffect(() => {
        if (!clipboard.error) return;
        textareaRef.current?.focus();
        textareaRef.current?.select();
    }, [clipboard.error]);

    return (
        // Fills the sticky column, so the command box takes the height left
        <Stack gap='md' h='100%'>
            <Title order={2}>Commands</Title>
            <Stack gap='md' flex={1} mih={0}>
                {slotUsage && !error && (
                    <>
                        <SlotMeter
                            label='Tweakdefs slots'
                            {...slotUsage.tweakdefs}
                        />
                        <SlotMeter
                            label='Tweakunits slots'
                            {...slotUsage.tweakunits}
                        />
                    </>
                )}

                {error && (
                    <Alert color='red' title="Couldn't generate the commands">
                        {error}
                    </Alert>
                )}

                {droppedTweaks.length > 0 && (
                    <Alert
                        color='orange'
                        title='Some custom tweaks were left out'
                    >
                        <Stack gap='xs'>
                            <Text size='sm'>
                                They didn&apos;t fit into the free slots:
                            </Text>
                            <List size='sm'>
                                {droppedTweaks.map((t, i) => (
                                    <List.Item key={i}>
                                        <Text span size='sm' fw={700}>
                                            {t.description}
                                        </Text>{' '}
                                        · {t.type}
                                    </List.Item>
                                ))}
                            </List>
                            <Text size='sm'>
                                Turn off other tweaks to make room.
                            </Text>
                        </Stack>
                    </Alert>
                )}

                <Stack gap='xs'>
                    <Button
                        size='md'
                        fullWidth
                        color={clipboard.copied ? 'teal' : 'blue'}
                        disabled={!commandText}
                        onClick={() => clipboard.copy(commandText)}
                        leftSection={
                            clipboard.copied ? (
                                <IconCheck {...ICON_SIZE_MD} />
                            ) : (
                                <IconCopy {...ICON_SIZE_MD} />
                            )
                        }
                    >
                        {clipboard.copied ? 'Copied!' : 'Copy commands'}
                    </Button>
                    <Text size='sm'>
                        Paste them into the chat of a lobby you host.
                    </Text>
                </Stack>

                {clipboard.error && (
                    <Alert color='red' title="Couldn't copy automatically">
                        The commands are selected below. Press Ctrl+C (⌘C on a
                        Mac) to copy them.
                    </Alert>
                )}

                <Textarea
                    ref={textareaRef}
                    value={commandText}
                    readOnly
                    // Height when the sticky column doesn't stretch it
                    rows={12}
                    aria-label='Generated commands'
                    flex={1}
                    // In the sticky column the box stretches into the space left
                    styles={{
                        root: { display: 'flex', flexDirection: 'column' },
                        wrapper: { flex: 1 },
                        input: {
                            height: '100%',
                            fontFamily: 'var(--mantine-font-family-monospace)',
                            fontSize: 'var(--mantine-font-size-xs)',
                        },
                    }}
                />
            </Stack>
        </Stack>
    );
};
