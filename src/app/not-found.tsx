import React from 'react';

import { Stack, Text, Title } from '@mantine/core';

import { PageWrapper } from '@/components/page-wrapper';

export default function Page() {
    return (
        <PageWrapper py='md'>
            <Stack gap='sm'>
                <Title order={2}>404</Title>
                <Text>Page not found</Text>
            </Stack>
        </PageWrapper>
    );
}
