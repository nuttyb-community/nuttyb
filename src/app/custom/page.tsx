'use client';

import { Divider, Stack, Text, Title } from '@mantine/core';

import { useCustomTweaksContext } from '@/components/contexts/custom-tweaks-context';
import PageLoader from '@/components/page-loader';
import AddTweakForm from '@/components/tabs/custom/add-tweak-form';
import SavedTweaksList from '@/components/tabs/custom/saved-tweaks-list';

export default function Page() {
    const { isLoading } = useCustomTweaksContext();

    if (isLoading) return <PageLoader />;

    return (
        <Stack gap='xl'>
            <Stack gap='sm'>
                <Title order={2}>Custom Tweaks</Title>
                <Text c='dimmed' size='sm' mt='xs'>
                    Save your custom tweaks for use in the configurator
                </Text>
            </Stack>

            <AddTweakForm />

            <Divider />

            <SavedTweaksList />
        </Stack>
    );
}
