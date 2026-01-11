import React from 'react';

import { Box, Center } from '@mantine/core';

export const PageWrapper: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    return (
        <Center>
            <Box w='960px'>{children}</Box>
        </Center>
    );
};
