'use client';

import { Stack, Text, Title } from '@mantine/core';

import { useConfiguratorContext } from '@/components/contexts/configurator-context';
import { useLuaBundleContext } from '@/components/contexts/lua-bundle-context';
import { PageLoader } from '@/components/page-loader';
import {
    PAGE_HEIGHT,
    PAGE_PADDING,
    PageWrapper,
} from '@/components/page-wrapper';
import { LuaEditor } from '@/components/tabs/editor/editor';

export default function Page() {
    const { luaFiles, isLoading: isLuaLoading, error } = useLuaBundleContext();
    const { configuration, isLoading: isConfigLoading } =
        useConfiguratorContext();

    const isLoading = isLuaLoading || isConfigLoading;

    if (isLoading) return <PageLoader />;
    if (error) return <div>Error loading Lua bundle: {error.message}</div>;

    return (
        <PageWrapper py={PAGE_PADDING}>
            <Stack gap='lg' h={PAGE_HEIGHT}>
                <Stack gap='xs'>
                    <Title order={1}>Lua editor</Title>
                    <Text>
                        Read and edit the Lua in each command slot or source
                        file, then copy it as Base64.
                    </Text>
                </Stack>

                <LuaEditor luaFiles={luaFiles} configuration={configuration} />
            </Stack>
        </PageWrapper>
    );
}
