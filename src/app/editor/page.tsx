'use client';

import { Stack, Text, Title } from '@mantine/core';

import { useConfiguratorContext } from '@/components/contexts/configurator-context';
import { useLuaBundleContext } from '@/components/contexts/lua-bundle-context';
import PageLoader from '@/components/page-loader';
import { LuaEditor } from '@/components/tabs/editor/editor';

export default function Page() {
    const { luaFiles, isLoading: isLuaLoading, error } = useLuaBundleContext();
    const { configuration, isLoading: isConfigLoading } =
        useConfiguratorContext();

    const isLoading = isLuaLoading || isConfigLoading;

    if (isLoading) return <PageLoader />;
    if (error) return <div>Error loading Lua bundle: {error.message}</div>;

    return (
        <Stack gap='md'>
            <Stack gap='xs'>
                <Title order={2}>Lua Editor</Title>
                <Text c='dimmed' size='sm'>
                    Edit Lua tweaks live with a VS Code-like experience
                </Text>
            </Stack>

            <LuaEditor luaFiles={luaFiles} configuration={configuration} />
        </Stack>
    );
}
