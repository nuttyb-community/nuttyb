'use client';

import React, { useCallback, useState } from 'react';

import { Button, Flex, Stack, Title } from '@mantine/core';
import { IconArrowBackUp, IconCheck } from '@tabler/icons-react';

import { ICON_SIZE_MD } from '@/components/common/icon-style';
import { useConfiguratorContext } from '@/components/contexts/configurator-context';
import { useCustomTweaksContext } from '@/components/contexts/custom-tweaks-context';

import CustomTweaksSection from './sections/custom-tweaks';
import DifficultySection from './sections/difficulty';
import ExtrasSection from './sections/extras';
import GeneralSection from './sections/general';

const Configurator: React.FC = () => {
    const { customTweaks, clearEnabledTweaks } = useCustomTweaksContext();
    const hasCustomTweaks = customTweaks.length > 0;

    const { resetConfiguration } = useConfiguratorContext();
    const [isResetSuccessShowing, setResetSuccessShowing] = useState(false);

    const handleReset = useCallback(() => {
        resetConfiguration();
        clearEnabledTweaks();

        setResetSuccessShowing(true);
        setTimeout(() => setResetSuccessShowing(false), 2000);
    }, [resetConfiguration, clearEnabledTweaks]);

    return (
        <Stack gap='md'>
            <Flex justify='space-between'>
                <Title order={2}>Configurator</Title>
                <Button
                    color={!isResetSuccessShowing ? 'red' : 'green'}
                    onClick={handleReset}
                    leftSection={
                        !isResetSuccessShowing ? (
                            <IconArrowBackUp {...ICON_SIZE_MD} />
                        ) : (
                            <IconCheck {...ICON_SIZE_MD} />
                        )
                    }
                >
                    {!isResetSuccessShowing ? 'Reset' : 'Configuration reset!'}
                </Button>
            </Flex>

            <GeneralSection />
            <DifficultySection />
            <ExtrasSection />
            {hasCustomTweaks && <CustomTweaksSection />}
        </Stack>
    );
};

export default Configurator;
