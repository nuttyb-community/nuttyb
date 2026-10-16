'use client';

import React, { useMemo } from 'react';

import { Box, Grid } from '@mantine/core';

import { useConfiguratorContext } from '@/components/contexts/configurator-context';
import { useCustomTweaksContext } from '@/components/contexts/custom-tweaks-context';
import { useLuaBundleContext } from '@/components/contexts/lua-bundle-context';
import { usePresetsContext } from '@/components/contexts/presets-context';
import { TweakDataProvider } from '@/components/contexts/tweak-data-context';
import { PageLoader } from '@/components/page-loader';
import { PageWrapper } from '@/components/page-wrapper';
import { Configurator } from '@/components/tabs/configurator/configurator';
import { GeneratedCommands } from '@/components/tabs/configurator/generated-commands';
import { useTweakData } from '@/hooks/use-tweak-data';

/** Space between the sticky output panel and the header or window edge. */
const OUTPUT_GAP = 'var(--mantine-spacing-md)';
/** The output panel sticks just below the header. */
const OUTPUT_TOP = `calc(var(--app-shell-header-height) + ${OUTPUT_GAP})`;
/** In two-column layout the panel fills the window height, so it never scrolls off. */
const OUTPUT_HEIGHT = `calc(100dvh - var(--app-shell-header-height) - 2 * ${OUTPUT_GAP})`;

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
    if (error) return <div>Error loading Lua bundle: {error.message}</div>;

    return (
        <PageWrapper py='md'>
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
                            h={{ lg: OUTPUT_HEIGHT }}
                        >
                            <GeneratedCommands />
                        </Box>
                    </Grid.Col>
                </Grid>
            </TweakDataProvider>
        </PageWrapper>
    );
}
