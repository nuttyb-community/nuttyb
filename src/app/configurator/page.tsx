'use client';

import React, { useMemo } from 'react';

import { Alert, Box, Grid } from '@mantine/core';

import { useConfiguratorContext } from '@/components/contexts/configurator-context';
import { useCustomTweaksContext } from '@/components/contexts/custom-tweaks-context';
import { useLuaBundleContext } from '@/components/contexts/lua-bundle-context';
import { usePresetsContext } from '@/components/contexts/presets-context';
import { TweakDataProvider } from '@/components/contexts/tweak-data-context';
import { PageLoader } from '@/components/page-loader';
import {
    PAGE_HEIGHT,
    PAGE_PADDING,
    PageWrapper,
} from '@/components/page-wrapper';
import { Configurator } from '@/components/tabs/configurator/configurator';
import { GeneratedCommands } from '@/components/tabs/configurator/generated-commands';
import { useTweakData } from '@/hooks/use-tweak-data';

/** The output panel sticks just below the header, one page padding down. */
const OUTPUT_TOP = `calc(var(--app-shell-header-height) + ${PAGE_PADDING})`;

export default function Page() {
    const { configuration, isLoading: isConfigLoading } =
        useConfiguratorContext();
    const { luaFiles, isLoading: isLuaLoading, error } = useLuaBundleContext();
    const { getEnabledTweaks, isLoading: isTweaksLoading } =
        useCustomTweaksContext();
    const { activePresetTweaks, activePresetName } = usePresetsContext();

    // Memoised: a fresh array identity here would re-run full command
    // generation (Lua minification of the whole bundle) on every render.
    const enabledCustomTweaks = useMemo(
        () => [...getEnabledTweaks(), ...activePresetTweaks],
        [getEnabledTweaks, activePresetTweaks]
    );
    const {
        commandText,
        slotUsage,
        error: tweakError,
        droppedTweaks,
    } = useTweakData(
        configuration,
        luaFiles,
        enabledCustomTweaks,
        activePresetName
    );

    const isLoading = isLuaLoading || isConfigLoading || isTweaksLoading;

    if (isLoading) return <PageLoader />;
    if (error)
        return (
            <PageWrapper py={PAGE_PADDING}>
                <Alert color='red' title="Couldn't load the Lua bundle">
                    {error.message}
                </Alert>
            </PageWrapper>
        );

    return (
        <PageWrapper py={PAGE_PADDING}>
            <TweakDataProvider
                commandText={commandText}
                slotUsage={slotUsage}
                error={tweakError}
                droppedTweaks={droppedTweaks}
            >
                <Grid gap='xl'>
                    <Grid.Col span={{ base: 12, lg: 8 }}>
                        <Configurator />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, lg: 4 }}>
                        <Box
                            pos='sticky'
                            top={OUTPUT_TOP}
                            // In two-column layout the panel fills the window, so it never scrolls off
                            h={{ lg: PAGE_HEIGHT }}
                        >
                            <GeneratedCommands />
                        </Box>
                    </Grid.Col>
                </Grid>
            </TweakDataProvider>
        </PageWrapper>
    );
}
