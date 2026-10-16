import { readFileSync } from 'node:fs';
import path from 'node:path';

import {
    Box,
    Button,
    Center,
    Code,
    Grid,
    GridCol,
    Group,
    SimpleGrid,
    Stack,
    Stepper,
    StepperStep,
    Text,
    Title,
} from '@mantine/core';
import {
    IconArrowsSplit,
    IconBellRinging,
    IconBook,
    IconBrandDiscord,
    IconBrandGithub,
    IconBuildingFactory2,
    IconFileDescription,
    IconGrid4x4,
    IconLayoutDashboard,
    IconRecycle,
    IconRuler2,
    IconStack2,
    IconWorld,
} from '@tabler/icons-react';
import NextLink from 'next/link';

import heroImage from '@/assets/hero.avif';
import { PageWrapper } from '@/components/page-wrapper';
import { Changelog } from '@/components/tabs/landing/changelog';
import {
    LinkCard,
    type LinkItem,
    TextLink,
} from '@/components/tabs/landing/link-items';
import { parseChangelog } from '@/lib/changelog/parse';
import { LINKS } from '@/lib/navigation';

const DISCORD_URL =
    'https://discord.com/channels/549281623154229250/1168959237641216131';
const WIDGETS_URL = 'https://github.com/goldjee/BAR-Widgets/tree/main/src';

// Dark fade from the left keeps the hero text readable over the busy screenshot
const HERO_FADE =
    'linear-gradient(90deg, rgba(20, 20, 20, 0.95) 0%, rgba(20, 20, 20, 0.85) 40%, rgba(20, 20, 20, 0.3) 100%)';

// One gap for every grid on the page, so step and card columns line up.
const GAP = 'xl';

const STEPS = [
    {
        title: 'Pick your settings',
        description: 'Start from a preset and adjust it',
    },
    {
        title: 'Copy the commands',
        description: 'One click copies them all',
    },
    {
        title: 'Paste into lobby chat',
        description: 'Host a lobby and paste them in',
    },
];

const WIDGETS: LinkItem[] = [
    {
        title: 'Raptor Panel',
        href: `${WIDGETS_URL}/raptor-panel`,
        description:
            'Real-time player economy, raptor evolution, queen spawn ETA and queen health.',
        icon: <IconLayoutDashboard />,
    },
    {
        title: 'Raptor Notifications',
        href: `${WIDGETS_URL}/raptor-notifications`,
        description:
            'In-chat reminders for when to build defences, when grace ends and when queens spawn.',
        icon: <IconBellRinging />,
    },
    {
        title: 'Raptor Grid Draw',
        href: `${WIDGETS_URL}/raptor-fmp-grid-draw`,
        description:
            'Splits Full Metal Plate into equal spots so everyone gets enough buildable space.',
        icon: <IconGrid4x4 />,
    },
    {
        title: 'Layout Planner',
        href: `${WIDGETS_URL}/layout-planner`,
        description: 'Draw, save and load your base layouts.',
        icon: <IconRuler2 />,
    },
    {
        title: 'Reclaim Selected',
        href: `${WIDGETS_URL}/reclaim-selected`,
        description:
            'Adds a command button to reclaim all selected units and buildings.',
        icon: <IconRecycle />,
    },
    {
        title: 'Holo Place',
        href: `${WIDGETS_URL}/holo-place`,
        description:
            'Places the next building in the queue when the current one is almost done.',
        icon: <IconBuildingFactory2 />,
    },
    {
        title: 'Build Orders',
        href: `${WIDGETS_URL}/build-orders`,
        description: 'Build structures over other existing ones.',
        icon: <IconStack2 />,
    },
    {
        title: 'Copy Queue',
        href: `${WIDGETS_URL}/split-builder-queue`,
        description: 'Split a long build queue between multiple constructors.',
        icon: <IconArrowsSplit />,
    },
];

const COMMUNITY: LinkItem[] = [
    {
        title: 'GitHub repository',
        href: 'https://github.com/nuttyb-community/nuttyb/',
        description: 'Report bugs and request new features.',
        icon: <IconBrandGithub />,
    },
    {
        title: 'Discord',
        href: DISCORD_URL,
        description: 'Official Discord channel for NuttyB tweaks.',
        icon: <IconBrandDiscord />,
    },
    {
        title: 'Guide for noobs',
        href: 'https://docs.google.com/document/d/11FfEiKAjp0NSKTwvmywqUNefrOqVapnW5e3o5azSmXY/',
        description: 'How to play NuttyB Raptors as a new player.',
        icon: <IconBook />,
    },
    {
        title: 'Preset guide',
        href: 'https://github.com/nuttyb-community/nuttyb/blob/main/docs/Preset-guide.md',
        description: 'Save, share and overlay custom configurations.',
        icon: <IconFileDescription />,
    },
    {
        title: 'Beyond All Reason',
        href: 'https://www.beyondallreason.info/',
        description: 'The game itself. Replays can be downloaded here.',
        icon: <IconWorld />,
    },
];

function getChangelogEntries() {
    try {
        const markdown = readFileSync(
            path.join(process.cwd(), 'CHANGELOG.md'),
            'utf8'
        );
        return parseChangelog(markdown);
    } catch {
        return [];
    }
}

export default function Page() {
    const changelogEntries = getChangelogEntries();
    const steps = STEPS.map((step) => (
        <StepperStep
            key={step.title}
            label={step.title}
            description={step.description}
        />
    ));

    return (
        <>
            {/* Full-width hero; the wrapper inside keeps its text on the page grid */}
            <Box
                component='section'
                style={{
                    backgroundImage: `${HERO_FADE}, url(${heroImage.src})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            >
                <PageWrapper py={96}>
                    <Stack gap='md'>
                        {/* Display size: the default h1 is barely larger than the section headings */}
                        <Title order={1} size='3rem'>
                            NuttyB Community Edition
                        </Title>
                        <Text size='xl'>
                            Raptors PvE in Beyond All Reason, pushed to its
                            limits.
                        </Text>
                        <Text maw={640}>
                            Community-made tweaks bring new buildings, weapons
                            and far tougher raptors. The mod keeps evolving with
                            new content and balance changes.
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
                                href={DISCORD_URL}
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

            {/* Steps get their own band: no heading, generous vertical room */}
            <Box component='section' py={120}>
                <PageWrapper>
                    {/* Static steppers: no onStepClick, so the steps aren't clickable; active={-1} keeps them neutral.
                        A row from md up, a vertical stepper below, where three steps don't fit side by side. */}
                    <Center visibleFrom='md'>
                        <Stepper
                            active={-1}
                            size='lg'
                            wrap={false}
                            // Keeps the connectors visible when the row gets tight
                            styles={{ separator: { minWidth: 48 } }}
                        >
                            {steps}
                        </Stepper>
                    </Center>
                    <Stepper
                        hiddenFrom='md'
                        active={-1}
                        size='lg'
                        orientation='vertical'
                    >
                        {steps}
                    </Stepper>
                </PageWrapper>
            </Box>

            <PageWrapper pb={64}>
                <Stack gap={64}>
                    <Grid gap={GAP}>
                        <GridCol span={{ base: 12, md: 8 }}>
                            <Stack gap='md'>
                                <Title order={2}>Recommended widgets</Title>
                                {/* Plain numbered lines: no list indent, so they line up with the title and cards */}
                                <Stack gap={4}>
                                    <Text>
                                        1. Download a widget&apos;s folder into{' '}
                                        <Code>
                                            Beyond-All-Reason/data/LuaUI/Widgets
                                        </Code>
                                        . Raptor Panel goes into{' '}
                                        <Code>LuaUI/RmlWidgets</Code> instead.
                                    </Text>
                                    <Text>
                                        2. If the game is running, type{' '}
                                        <Code>/luaui reload</Code> in chat.
                                    </Text>
                                    <Text>
                                        3. Enable the widget in the game
                                        settings, on the Custom tab.
                                    </Text>
                                </Stack>
                                <SimpleGrid
                                    cols={{ base: 1, sm: 2 }}
                                    spacing={GAP}
                                >
                                    {WIDGETS.map((item) => (
                                        <LinkCard key={item.href} item={item} />
                                    ))}
                                </SimpleGrid>
                            </Stack>
                        </GridCol>
                        <GridCol span={{ base: 12, md: 4 }}>
                            <Stack gap='md'>
                                <Title order={2}>Community and guides</Title>
                                <Stack gap='md'>
                                    {COMMUNITY.map((item) => (
                                        <TextLink key={item.href} item={item} />
                                    ))}
                                </Stack>
                            </Stack>
                        </GridCol>
                    </Grid>

                    {changelogEntries.length > 0 && (
                        <Stack gap='md'>
                            <Title order={2}>What&apos;s new</Title>
                            <Changelog
                                entries={changelogEntries}
                                spacing={GAP}
                            />
                        </Stack>
                    )}
                </Stack>
            </PageWrapper>
        </>
    );
}
