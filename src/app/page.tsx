import {
    Code,
    Grid,
    GridCol,
    List,
    ListItem,
    SimpleGrid,
    Stack,
    Title,
} from '@mantine/core';

import { PageWrapper } from '@/components/page-wrapper';
import { Changelog } from '@/components/tabs/landing/changelog';
import { Hero } from '@/components/tabs/landing/hero';
import { HowItWorks } from '@/components/tabs/landing/how-it-works';
import { LinkCard, TextLink } from '@/components/tabs/landing/link-items';
import { COMMUNITY, WIDGETS } from '@/components/tabs/landing/links';
import { LIST_OFFSET } from '@/components/tabs/landing/list-offset';
import { readChangelogEntries } from '@/lib/changelog/read';

// One gap for every grid on the page, so the card and changelog columns line up.
const GAP = 'xl';

export default function Page() {
    const changelogEntries = readChangelogEntries();

    return (
        <>
            <Hero />
            <HowItWorks />

            <PageWrapper pb={64}>
                <Stack gap={64}>
                    <Grid gap={GAP}>
                        <GridCol span={{ base: 12, md: 8 }}>
                            <Stack gap='md'>
                                <Title order={2}>Recommended widgets</Title>
                                <List
                                    type='ordered'
                                    ml={LIST_OFFSET}
                                    spacing={4}
                                >
                                    <ListItem>
                                        Download a widget&apos;s folder into{' '}
                                        <Code>
                                            Beyond-All-Reason/data/LuaUI/Widgets
                                        </Code>
                                        . Raptor Panel goes into{' '}
                                        <Code>LuaUI/RmlWidgets</Code> instead.
                                    </ListItem>
                                    <ListItem>
                                        If the game is running, type{' '}
                                        <Code>/luaui reload</Code> in chat.
                                    </ListItem>
                                    <ListItem>
                                        Enable the widget in the game settings,
                                        on the Custom tab.
                                    </ListItem>
                                </List>
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
                                {COMMUNITY.map((item) => (
                                    <TextLink key={item.href} item={item} />
                                ))}
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
