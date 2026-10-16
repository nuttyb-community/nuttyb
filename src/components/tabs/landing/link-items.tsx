'use client';

import React from 'react';

import { Anchor, Card, Group, Stack, Text, ThemeIcon } from '@mantine/core';
import { useHover } from '@mantine/hooks';

export interface LinkItem {
    title: string;
    href: string;
    description: string;
    icon: React.ReactNode;
}

interface LinkContentProps {
    item: LinkItem;
    align?: 'center';
}

const LinkContent: React.FC<LinkContentProps> = ({ item, align }) => (
    <Group gap='sm' wrap='nowrap' align={align ?? 'flex-start'}>
        {/* c='inherit': the icon follows the link colour */}
        <ThemeIcon variant='default' size='lg' c='inherit'>
            {item.icon}
        </ThemeIcon>
        <Stack gap={2}>
            <Text fw={700}>{item.title}</Text>
            <Text size='sm'>{item.description}</Text>
        </Stack>
    </Group>
);

/** Card link: lighter background and a primary border on hover. */
export const LinkCard: React.FC<{ item: LinkItem }> = ({ item }) => {
    const { hovered, ref } = useHover<HTMLAnchorElement>();

    return (
        <Card
            ref={ref}
            component='a'
            href={item.href}
            target='_blank'
            withBorder
            padding='md'
            bg={hovered ? 'var(--mantine-color-default-hover)' : undefined}
            bd={
                hovered
                    ? '1px solid var(--mantine-primary-color-filled)'
                    : undefined
            }
        >
            <LinkContent item={item} />
        </Card>
    );
};

/** Plain link row: inherits the text colour, turns link blue on hover. */
export const TextLink: React.FC<{ item: LinkItem }> = ({ item }) => {
    const { hovered, ref } = useHover<HTMLAnchorElement>();

    return (
        <Anchor
            ref={ref}
            href={item.href}
            target='_blank'
            underline='never'
            display='block'
            c={hovered ? undefined : 'inherit'}
        >
            <LinkContent item={item} align='center' />
        </Anchor>
    );
};
