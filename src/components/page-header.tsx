'use client';

import type React from 'react';

import { ActionIcon, Anchor, Button, Group, Menu, Text } from '@mantine/core';
import {
    IconBrandDiscord,
    IconBrandGithub,
    IconChevronDown,
} from '@tabler/icons-react';
import NextImage, { type StaticImageData } from 'next/image';
import NextLink from 'next/link';
import { usePathname } from 'next/navigation';

import logo from '@/assets/logo.svg';
import { ICON_SIZE_MD } from '@/components/common/icon-style';
import { PageWrapper } from '@/components/page-wrapper';
import { EXTERNAL_LINKS, LINKS, type Link } from '@/lib/navigation';

const toolLinks: Link[] = Object.values(LINKS.tools);

const VERSION =
    process.env.NODE_ENV === 'development'
        ? '[dev]'
        : `[${process.env.NEXT_PUBLIC_BUILD_DATE} · ${process.env.NEXT_PUBLIC_GIT_SHA?.slice(0, 7)}]`;

export const PageHeader: React.FC = () => {
    const pathname = usePathname();
    const isActive = (href: string) => pathname.startsWith(href);

    return (
        <PageWrapper h='100%'>
            <Group h='100%' justify='space-between'>
                <Group gap='sm' wrap='nowrap' align='baseline'>
                    <Anchor
                        component={NextLink}
                        href='/'
                        aria-label='NuttyB CE home'
                        underline='never'
                        c='inherit'
                    >
                        <Group gap='sm' wrap='nowrap'>
                            <NextImage
                                src={logo as StaticImageData}
                                alt=''
                                width={42}
                                height={42}
                            />
                            {/* ponytail: logo-only below xs keeps the header on one line down to ~380px; burger menu if the nav grows */}
                            {/* Brand, not a heading: the page title is the page's only h1 */}
                            {/* Baseline-aligned so the row's baseline is the text's, not the logo's bottom edge; the version tag lines up with it */}
                            <Text
                                fz='h2'
                                fw={700}
                                visibleFrom='md'
                                style={{ alignSelf: 'baseline' }}
                            >
                                NuttyB CE
                            </Text>
                        </Group>
                    </Anchor>
                    {/* Separate link: an <a> can't nest inside the home link */}
                    <Anchor
                        component={NextLink}
                        href='/#latest-changes'
                        size='xs'
                        c='dimmed'
                        visibleFrom='xs'
                    >
                        {VERSION}
                    </Anchor>
                </Group>
                <Group gap='md'>
                    <ActionIcon
                        component='a'
                        href={EXTERNAL_LINKS.repo}
                        target='_blank'
                        variant='subtle'
                        size='lg'
                        aria-label='GitHub repository'
                    >
                        <IconBrandGithub size={22} />
                    </ActionIcon>
                    <ActionIcon
                        component='a'
                        href={EXTERNAL_LINKS.discord}
                        target='_blank'
                        variant='subtle'
                        size='lg'
                        aria-label='Discord'
                    >
                        <IconBrandDiscord size={22} />
                    </ActionIcon>
                    <Button
                        component={NextLink}
                        href={LINKS.configurator.href}
                        variant={
                            isActive(LINKS.configurator.href)
                                ? 'filled'
                                : 'subtle'
                        }
                    >
                        {LINKS.configurator.title}
                    </Button>
                    <Menu position='bottom-end'>
                        <Menu.Target>
                            <Button
                                variant={
                                    toolLinks.some((link) =>
                                        isActive(link.href)
                                    )
                                        ? 'filled'
                                        : 'subtle'
                                }
                                rightSection={
                                    <IconChevronDown {...ICON_SIZE_MD} />
                                }
                            >
                                Developer tools
                            </Button>
                        </Menu.Target>
                        <Menu.Dropdown>
                            {toolLinks.map((link) => (
                                <Menu.Item
                                    key={link.href}
                                    component={NextLink}
                                    href={link.href}
                                >
                                    {link.title}
                                </Menu.Item>
                            ))}
                        </Menu.Dropdown>
                    </Menu>
                </Group>
            </Group>
        </PageWrapper>
    );
};
