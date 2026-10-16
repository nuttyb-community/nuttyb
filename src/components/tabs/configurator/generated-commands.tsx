'use client';

import React, { useState } from 'react';

import {
    Alert,
    Button,
    Collapse,
    CopyButton,
    Group,
    List,
    Progress,
    Stack,
    Text,
    Textarea,
    Title,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
    IconArrowBackUp,
    IconCheck,
    IconChevronDown,
    IconChevronUp,
    IconCopy,
} from '@tabler/icons-react';

import { ICON_SIZE_MD } from '@/components/common/icon-style';
import { useConfiguratorContext } from '@/components/contexts/configurator-context';
import { useCustomTweaksContext } from '@/components/contexts/custom-tweaks-context';
import { usePresetsContext } from '@/components/contexts/presets-context';
import { useTweakDataContext } from '@/components/contexts/tweak-data-context';

interface SlotMeterProps {
    label: string;
    used: number;
    total: number;
}

const SlotMeter: React.FC<SlotMeterProps> = ({ label, used, total }) => {
    const percent = total > 0 ? (used / total) * 100 : 100;
    const color = used >= total ? 'red' : percent >= 80 ? 'orange' : 'blue';

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
    const { resetConfiguration } = useConfiguratorContext();
    const { clearEnabledTweaks } = useCustomTweaksContext();
    const { clearActivePreset } = usePresetsContext();
    const [isResetSuccessShowing, setResetSuccessShowing] = useState(false);

    const handleReset = () => {
        resetConfiguration();
        clearEnabledTweaks();
        clearActivePreset();

        setResetSuccessShowing(true);
        setTimeout(() => setResetSuccessShowing(false), 2000);
    };

    return (
        <Button
            variant='subtle'
            color={isResetSuccessShowing ? 'green' : 'gray'}
            size='compact-sm'
            onClick={handleReset}
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
    );
};

export const GeneratedCommands: React.FC = () => {
    const { commandText, slotUsage, droppedTweaks, error } =
        useTweakDataContext();
    const [isExpanded, { toggle }] = useDisclosure(false);

    return (
        <Stack gap='md'>
            <Group justify='space-between'>
                <Title order={2}>Commands</Title>
                <ResetButton />
            </Group>
            <Stack gap='md'>
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

                <CopyButton value={commandText} timeout={2000}>
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

                <Button
                    variant='default'
                    fullWidth
                    disabled={!commandText}
                    onClick={toggle}
                    leftSection={
                        isExpanded ? (
                            <IconChevronUp {...ICON_SIZE_MD} />
                        ) : (
                            <IconChevronDown {...ICON_SIZE_MD} />
                        )
                    }
                >
                    {isExpanded ? 'Hide commands' : 'Show commands'}
                </Button>

                <Collapse expanded={isExpanded}>
                    <Textarea
                        value={commandText}
                        readOnly
                        autosize
                        minRows={6}
                        maxRows={15}
                        aria-label='Generated commands'
                        styles={{
                            input: {
                                fontFamily: 'monospace',
                                fontSize: '12px',
                            },
                        }}
                    />
                </Collapse>
            </Stack>
        </Stack>
    );
};
