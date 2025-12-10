'use client';

import React from 'react';

import { Divider, Stack } from '@mantine/core';

import { useConfiguratorContext } from '@/components/contexts/configurator-context';
import { useCustomTweaksContext } from '@/components/contexts/custom-tweaks-context';
import { useLuaBundleContext } from '@/components/contexts/lua-bundle-context';
import { TweakDataProvider } from '@/components/contexts/tweak-data-context';
import PageLoader from '@/components/page-loader';
import Configurator from '@/components/tabs/configurator/configurator';
import GeneratedCommands from '@/components/tabs/configurator/generated-commands';
import { useTweakData } from '@/hooks/use-tweak-data';

export default function Page() {
    const { configuration, isLoading: isConfigLoading } =
        useConfiguratorContext();
    const { luaFiles, isLoading: isLuaLoading, error } = useLuaBundleContext();
    const { getEnabledTweaks, isLoading: isTweaksLoading } =
        useCustomTweaksContext();

    const enabledCustomTweaks = getEnabledTweaks();
    const { sections } = useTweakData(
        configuration,
        luaFiles,
        enabledCustomTweaks
    );

    const isLoading = isLuaLoading || isConfigLoading || isTweaksLoading;

    if (isLoading) return <PageLoader />;
    if (error) return <div>Error: {error.message}</div>;

    return (
        <TweakDataProvider sections={sections}>
            <Stack gap='xl'>
                <Configurator />
                <Divider />
                <GeneratedCommands />
            </Stack>
        </TweakDataProvider>
    );
}
