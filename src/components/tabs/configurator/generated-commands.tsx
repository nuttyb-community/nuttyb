'use client';

import React, { useRef, useState } from 'react';

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
import { IconCheck, IconCopy } from '@tabler/icons-react';

import { FEEDBACK_DURATION_MS } from '@/components/common/feedback';
import { ICON_SIZE_MD } from '@/components/common/icon-style';
import { useTweakDataContext } from '@/components/contexts/tweak-data-context';

/** Command box height when the panel isn't stretched by the sticky column. */
const COMMAND_ROWS = 12;
/** A slot meter turns orange from this share of slots used. */
const SLOT_WARNING_PERCENT = 80;

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
            : percent >= SLOT_WARNING_PERCENT
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
    const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>(
        'idle'
    );

    // The clipboard can be blocked; then select the text so Ctrl+C works
    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(commandText);
            setCopyState('copied');
            setTimeout(() => setCopyState('idle'), FEEDBACK_DURATION_MS);
        } catch {
            setCopyState('failed');
            textareaRef.current?.focus();
            textareaRef.current?.select();
        }
    };

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
                        color={copyState === 'copied' ? 'teal' : 'blue'}
                        disabled={!commandText}
                        onClick={() => void handleCopy()}
                        leftSection={
                            copyState === 'copied' ? (
                                <IconCheck {...ICON_SIZE_MD} />
                            ) : (
                                <IconCopy {...ICON_SIZE_MD} />
                            )
                        }
                    >
                        {copyState === 'copied' ? 'Copied!' : 'Copy commands'}
                    </Button>
                    <Text size='sm'>
                        Paste them into the chat of a lobby you host.
                    </Text>
                </Stack>

                {copyState === 'failed' && (
                    <Alert color='red' title="Couldn't copy automatically">
                        The commands are selected below. Press Ctrl+C (⌘C on a
                        Mac) to copy them.
                    </Alert>
                )}

                <Textarea
                    ref={textareaRef}
                    value={commandText}
                    readOnly
                    rows={COMMAND_ROWS}
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
