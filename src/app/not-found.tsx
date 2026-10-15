import React from 'react';

import { Stack, Text, Title } from '@mantine/core';

export default function Page() {
    return (
        <Stack gap='sm'>
            <Title order={2}>404</Title>
            <Text>Page not found</Text>
        </Stack>
    );
}
