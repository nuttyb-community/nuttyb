import React from 'react';

import { Stack, Text, Title } from '@mantine/core';

function Page() {
    return (
        <Stack gap='sm'>
            <Title order={2}>404</Title>
            <Text>Page not found</Text>
        </Stack>
    );
}

export default Page;
