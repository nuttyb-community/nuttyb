'use client';

import { Center, Loader } from '@mantine/core';

export const PageLoader: React.FC = () => {
    return (
        <Center h='50vh'>
            <Loader type='oval' size='md' />
        </Center>
    );
};
