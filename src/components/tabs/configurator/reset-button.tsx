'use client';

import React, { useState } from 'react';

import { Button, Group, Popover, Stack, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconArrowBackUp, IconCheck } from '@tabler/icons-react';

import { FEEDBACK_DURATION_MS } from '@/components/common/feedback';
import { ICON_SIZE_MD } from '@/components/common/icon-style';
import { useCustomTweaksContext } from '@/components/contexts/custom-tweaks-context';
import { usePresetsContext } from '@/components/contexts/presets-context';

/** Resets the whole configurator, after a confirmation popover. */
export const ResetButton: React.FC = () => {
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
            // Wide enough for the explanation to wrap into a few short lines
            width={300}
            shadow='md'
            trapFocus
        >
            <Popover.Target>
                <Button
                    onClick={toggleConfirm}
                    variant='default'
                    // Red text marks it as destructive
                    c='red'
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
