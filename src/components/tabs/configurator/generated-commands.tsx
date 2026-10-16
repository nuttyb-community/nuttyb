'use client';

import React, { useState } from 'react';

import {
    Alert,
    Button,
    CopyButton,
    Group,
    List,
    Popover,
    Progress,
    Stack,
    Text,
    Textarea,
    Title,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconArrowBackUp, IconCheck, IconCopy } from '@tabler/icons-react';

import { ICON_SIZE_MD } from '@/components/common/icon-style';
import { useCustomTweaksContext } from '@/components/contexts/custom-tweaks-context';
import { usePresetsContext } from '@/components/contexts/presets-context';
import { useTweakDataContext } from '@/components/contexts/tweak-data-context';

/** How long "Copied!" and "Reset done" stay on their buttons. */
const FEEDBACK_DURATION_MS = 2000;
/** Wide enough for the reset explanation to wrap into a few short lines. */
const RESET_CONFIRM_WIDTH = 300;
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

const ResetButton: React.FC = () => {
    const { clearEnabledTweaks } = useCustomTweaksContext();
    const { selectPreset } = usePresetsContext();
    const [isResetSuccessShowing, setResetSuccessShowing] = useState(false);
    const [isConfirming, { close: closeConfirm, toggle: toggleConfirm }] =
        useDisclosure(false);

    // Back to the Medium preset, which carries the default configuration
    const handleReset = () => {
        selectPreset('default');
        clearEnabledTweaks();
        closeConfirm();

        setResetSuccessShowing(true);
        setTimeout(() => setResetSuccessShowing(false), FEEDBACK_DURATION_MS);
    };

    return (
        <Popover
            opened={isConfirming}
            onChange={(opened) => {
                if (!opened) closeConfirm();
            }}
            position='bottom-end'
            width={RESET_CONFIRM_WIDTH}
            shadow='md'
            trapFocus
        >
            <Popover.Target>
                <Button
                    variant='subtle'
                    color={isResetSuccessShowing ? 'green' : 'gray'}
                    size='compact-sm'
                    onClick={toggleConfirm}
                    leftSection={
                        isResetSuccessShowing ? (
                            <IconCheck {...ICON_SIZE_MD} />
                        ) : (
                            <IconArrowBackUp {...ICON_SIZE_MD} />
                        )
                    }
                >
                    {isResetSuccessShowing ? 'Reset done' : 'Reset all'}
                </Button>
            </Popover.Target>
            <Popover.Dropdown>
                <Stack gap='sm'>
                    <Text fw={700}>Reset everything?</Text>
                    <Text size='sm'>
                        This selects the Medium preset, which puts every setting
                        back to its default, including the lobby name tag. Your
                        custom tweaks are turned off.
                    </Text>
                    <Text size='sm'>Saved presets and tweaks are kept.</Text>
                    <Group justify='flex-end' gap='sm'>
                        <Button variant='default' onClick={closeConfirm}>
                            Cancel
                        </Button>
                        <Button color='red' onClick={handleReset}>
                            Reset
                        </Button>
                    </Group>
                </Stack>
            </Popover.Dropdown>
        </Popover>
    );
};

export const GeneratedCommands: React.FC = () => {
    const { commandText, slotUsage, droppedTweaks, error } =
        useTweakDataContext();

    return (
        // Fills the sticky column, so the command box takes the height left
        <Stack gap='md' h='100%'>
            <Group justify='space-between'>
                <Title order={2}>Commands</Title>
                <ResetButton />
            </Group>
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
                    <Alert color='red' title='Command Generation Error'>
                        {error}
                    </Alert>
                )}

                {droppedTweaks.length > 0 && (
                    <Alert color='orange' title='Some tweaks were not included'>
                        <Text size='sm'>
                            No slots available for the following tweaks:
                        </Text>
                        <List>
                            {droppedTweaks.map((t, i) => (
                                <List.Item key={i}>
                                    <Text size='sm'>
                                        <strong>{t.description}</strong> (
                                        {t.type})
                                    </Text>
                                </List.Item>
                            ))}
                        </List>
                        <Text size='sm' mt='sm'>
                            Disable some other tweaks to free up slots.
                        </Text>
                    </Alert>
                )}

                <CopyButton value={commandText} timeout={FEEDBACK_DURATION_MS}>
                    {({ copied, copy }) => (
                        <Button
                            size='md'
                            fullWidth
                            color={copied ? 'teal' : 'blue'}
                            disabled={!commandText}
                            onClick={copy}
                            leftSection={
                                copied ? (
                                    <IconCheck {...ICON_SIZE_MD} />
                                ) : (
                                    <IconCopy {...ICON_SIZE_MD} />
                                )
                            }
                        >
                            {copied ? 'Copied!' : 'Copy commands'}
                        </Button>
                    )}
                </CopyButton>

                <Textarea
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
