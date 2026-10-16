import React from 'react';

import { Container, type ContainerProps } from '@mantine/core';

/** Shared width for the header and page content, so their edges line up. */
export const PageWrapper: React.FC<ContainerProps> = (props) => (
    <Container size={1600} {...props} />
);
