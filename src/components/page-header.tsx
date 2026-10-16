'use client';

import React from 'react';

import { Anchor, Button, Group, Menu, Text } from '@mantine/core';
import { IconChevronDown } from '@tabler/icons-react';
import NextImage, { type StaticImageData } from 'next/image';
import NextLink from 'next/link';
import { usePathname } from 'next/navigation';

import logo from '@/assets/logo.svg';
import { ICON_SIZE_MD } from '@/components/common/icon-style';
import { PageWrapper } from '@/components/page-wrapper';
import { Link, LINKS } from '@/lib/navigation';

const toolLinks: Link[] = Object.values(LINKS.tools);

export const PageHeader: React.FC = () => {
    const pathname = usePathname();
    const isActive = (href: string) => pathname.startsWith(href);

    return (
        <PageWrapper h='100%'>
            <Group h='100%' justify='space-between'>
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
                        <Text fz='h2' fw={700} visibleFrom='xs'>
                            NuttyB CE
                        </Text>
                    </Group>
                </Anchor>
                <Group gap='md'>
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
                                    isActive('/tools') ? 'filled' : 'subtle'
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
