import React from 'react';

import { Container, type ContainerProps } from '@mantine/core';

/** Page padding above and below the content. */
export const PAGE_PADDING = 'var(--mantine-spacing-md)';
/** Content height that fills the window below the header, for pages that scroll inside. */
export const PAGE_HEIGHT = `calc(100dvh - var(--app-shell-header-height) - 2 * ${PAGE_PADDING})`;

/** Shared width for the header and page content, so their edges line up. */
export const PageWrapper: React.FC<ContainerProps> = (props) => (
    <Container size={1600} {...props} />
);
