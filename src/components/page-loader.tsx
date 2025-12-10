'use client';

import { Center, Loader } from '@mantine/core';

export default function PageLoader() {
    return (
        <Center h='50vh'>
            <Loader type='oval' size='md' />
        </Center>
    );
}
