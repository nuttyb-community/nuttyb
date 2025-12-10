'use client';

import React from 'react';

import { Button, Flex, Title } from '@mantine/core';
import NextLink from 'next/link';
import { usePathname } from 'next/navigation';

import { Link, LINKS } from '@/lib/navigation';

import PageWrapper from './page-wrapper';

const links: Link[] = Object.values(LINKS);

const Header: React.FC = () => {
    const pathname = usePathname();

    return (
        <PageWrapper>
            <Flex pt='8px' align='center' justify='space-between'>
                <Title order={1}>NuttyB Collective</Title>
                <Flex gap='md' align='baseline'>
                    {links.map((link) => {
                        return (
                            <Button
                                component={NextLink}
                                href={link.href}
                                key={link.title}
                                variant={
                                    pathname.startsWith(link.href)
                                        ? 'filled'
                                        : 'subtle'
                                }
                            >
                                {link.title}
                            </Button>
                        );
                    })}
                </Flex>
            </Flex>
        </PageWrapper>
    );
};

export default Header;
