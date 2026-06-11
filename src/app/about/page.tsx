import { readFileSync } from 'node:fs';
import path from 'node:path';

import { Anchor, List, ListItem, Stack, Text, Title } from '@mantine/core';

import { Changelog } from '@/components/tabs/about/changelog';
import { parseChangelog } from '@/lib/changelog/parse';

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

    return (
        <Stack gap='sm'>
            <Title order={2}>About this project</Title>
            <Text size='sm'>
                Community NuttyB is a mod for Beyond All Reason RTS, which
                pushes Raptors PvE gameplay to its limits. It&apos;s the hard
                work of many people that developed various tweaks to make the
                game more challenging. There are lots of new buildings and
                weapons to discover, and the mod is constantly evolving with new
                content and improvements.
            </Text>

            <Title order={2}>How to play</Title>
            <Text size='sm'>
                To play this mod, of course, you need BAR to be installed. Then,
                go to the configurator page, pick your desired tweaks and copy
                the commands generated. Next, host a new lobby and paste the
                commands into its chat.
            </Text>

            <Title order={2}>Recommended widgets</Title>
            <Text size='sm'>
                We recommend you to use these widgets to make your life a bit
                easier:
            </Text>
            <List size='sm'>
                <ListItem>
                    <Anchor
                        href='https://github.com/goldjee/BAR-Widgets/tree/main/dist/raptor-panel'
                        target='_blank'
                    >
                        Raptor Panel
                    </Anchor>
                    . Displays real-time statistics about the player economy,
                    raptor evolution, queen spawn ETA and their health.
                </ListItem>
                <ListItem>
                    <Anchor
                        href='https://github.com/goldjee/BAR-Widgets/tree/main/dist/raptor-notifications'
                        target='_blank'
                    >
                        Raptor Notifications
                    </Anchor>
                    . In-chat timing notifications for you and your team. Will
                    remind you when it&apos;s better to start building defences,
                    when the grace period ends and when the queens are about to
                    spawn.
                </ListItem>
                <ListItem>
                    <Anchor
                        href='https://gist.githubusercontent.com/rcorex/15ac19cad881b85d2d1e8c1f482b9525/raw/4c6103e6c4687a0f25b87ff88e978b9cb3b05632/map_nuttyb_raptor_grid_draw.lua'
                        target='_blank'
                    >
                        Raptor Grid Draw
                    </Anchor>
                    . Divides the &quot;Full Metal Plate&quot; map into equally
                    sized spots to ensure everyone on your team has enough
                    buildable space.
                </ListItem>
                <ListItem>
                    <Anchor
                        href='https://raw.githubusercontent.com/noryon/BARWidgets/refs/heads/main/LayoutPlanner/LayoutPlanner.lua'
                        target='_blank'
                    >
                        Layout Planner
                    </Anchor>
                    . Allows you to draw, save and load your base layouts.
                </ListItem>
                <ListItem>
                    <Anchor
                        href='https://raw.githubusercontent.com/manshanko/bar-widgets/defae648f8c3a7ae4e06de6af241e0037bab3b20/cmd_reclaim_selected.lua'
                        target='_blank'
                    >
                        Reclaim Selected
                    </Anchor>
                    . Adds a button to the command list that allows you to
                    reclaim all selected units and buildings.
                </ListItem>
                <ListItem>
                    <Anchor
                        href='https://raw.githubusercontent.com/Relicus/pyrem_bar_widgets/8f3b2120c5a1b6e2104fd21be6dfedce1fdaed23/holo_place/holo_place_v4_lite.lua'
                        target='_blank'
                    >
                        Holo Place
                    </Anchor>
                    . Automatically place the next building in your build queue
                    once the current structure is almost done. This helps
                    maintain building momentum by minimizing idle time as the
                    construction unit walks between placement locations.
                </ListItem>
                <ListItem>
                    <Anchor
                        href='https://raw.githubusercontent.com/noryon/BARWidgets/refs/heads/main/BuildOrders/BuildOrders.lua'
                        target='_blank'
                    >
                        Build Orders
                    </Anchor>
                    . Allows you to build structures over other existing ones.
                </ListItem>
                <ListItem>
                    <Anchor
                        href='https://raw.githubusercontent.com/Relicus/pyrem_bar_widgets/8f3b2120c5a1b6e2104fd21be6dfedce1fdaed23/split_build/split_queue_builder_v2'
                        target='_blank'
                    >
                        Copy Queue
                    </Anchor>
                    . Split your long build queue between multiple constructors.
                </ListItem>
            </List>

            <Title order={2}>Community and guides</Title>
            <List size='sm'>
                <ListItem>
                    <Anchor
                        href='https://github.com/nuttyb-community/nuttyb/'
                        target='_blank'
                    >
                        NuttyB Community GitHub Repository
                    </Anchor>
                    . The main repository for this project. You can report bugs
                    and request new features here.
                </ListItem>
                <ListItem>
                    <Anchor
                        href='https://discord.com/channels/549281623154229250/1168959237641216131'
                        target='_blank'
                    >
                        NuttyB Discord
                    </Anchor>
                    . Official Discord channel for NuttyB tweaks.
                </ListItem>
                <ListItem>
                    <Anchor
                        href='https://docs.google.com/document/d/11FfEiKAjp0NSKTwvmywqUNefrOqVapnW5e3o5azSmXY/'
                        target='_blank'
                    >
                        NuttyB Raptors Guide for Noobs
                    </Anchor>
                    . A simple guide for how to play for new players.
                </ListItem>
                <ListItem>
                    <Anchor
                        href='https://www.beyondallreason.info/'
                        target='_blank'
                    >
                        Beyond All Reason
                    </Anchor>
                    . The main site for the game. Game replays can be downloaded
                    here.
                </ListItem>
            </List>

            {changelogEntries.length > 0 && (
                <>
                    <Title order={2}>What&apos;s new</Title>
                    <Changelog entries={changelogEntries} />
                </>
            )}
        </Stack>
    );
}
