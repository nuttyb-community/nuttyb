import { Stack, Text, Title } from '@mantine/core';

import { PAGE_PADDING, PageWrapper } from '@/components/page-wrapper';

export default function Page() {
    return (
        <PageWrapper py={PAGE_PADDING}>
            <Stack gap='sm'>
                <Title order={1}>404</Title>
                <Text>Page not found</Text>
            </Stack>
        </PageWrapper>
    );
}
