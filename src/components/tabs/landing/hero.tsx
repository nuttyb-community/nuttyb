import type React from 'react';

import { Box, Button, Group, Stack, Text, Title } from '@mantine/core';
import { IconBrandDiscord } from '@tabler/icons-react';
import NextLink from 'next/link';

import heroImage from '@/assets/hero.avif';
import { PageWrapper } from '@/components/page-wrapper';
import { EXTERNAL_LINKS, LINKS } from '@/lib/navigation';

// Dark fade from the left keeps the hero text readable over the busy screenshot
const HERO_FADE =
    'linear-gradient(90deg, rgba(20, 20, 20, 0.95) 0%, rgba(20, 20, 20, 0.85) 40%, rgba(20, 20, 20, 0.3) 100%)';

/** Full-width hero; the wrapper inside keeps its text on the page grid. */
export const Hero: React.FC = () => (
    <Box
        component='section'
        bg={`${HERO_FADE} center / cover, url(${heroImage.src}) center / cover`}
    >
        <PageWrapper py={96}>
            <Stack gap='md'>
                {/* Display size: the default h1 is barely larger than the section headings */}
                <Title order={1} size='3rem'>
                    NuttyB Community Edition
                </Title>
                <Text size='xl'>
                    Raptors PvE in Beyond All Reason, pushed to its limits.
                </Text>
                <Text maw={640}>
                    Community-made tweaks bring new buildings, weapons and far
                    tougher raptors. The mod keeps evolving with new content and
                    balance changes.
                </Text>
                <Group gap='sm' mt='sm'>
                    {/* Server component: can't pass component={NextLink}, so the link wraps the button */}
                    <NextLink href={LINKS.configurator.href}>
                        <Button component='span' size='md'>
                            Open configurator
                        </Button>
                    </NextLink>
                    <Button
                        component='a'
                        href={EXTERNAL_LINKS.discord}
                        target='_blank'
                        size='md'
                        variant='default'
                        leftSection={<IconBrandDiscord size={18} />}
                    >
                        Join Discord
                    </Button>
                </Group>
            </Stack>
        </PageWrapper>
    </Box>
);
