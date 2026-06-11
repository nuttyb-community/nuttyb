import React from 'react';

import {
    Anchor,
    List,
    ListItem,
    Stack,
    Text,
    Timeline,
    TimelineItem,
} from '@mantine/core';
import dayjs from 'dayjs';

import type { ChangelogEntry } from '@/lib/changelog/types';

const CHANGELOG_URL =
    'https://github.com/nuttyb-community/nuttyb/blob/main/CHANGELOG.md';

interface ChangelogProps {
    entries: ChangelogEntry[];
    /** How many of the most recent dates to display. */
    limit?: number;
}

export const Changelog: React.FC<ChangelogProps> = ({ entries, limit = 5 }) => {
    if (entries.length === 0) return null;

    const visibleItems = entries.slice(0, limit);

    return (
        <Stack gap='sm'>
            <Timeline active={0} bulletSize={15} lineWidth={2}>
                {visibleItems.map((entry, entryIndex) => (
                    <TimelineItem
                        key={entry.date}
                        title={dayjs(entry.date).format('DD.MM.YYYY')}
                        lineVariant={entryIndex === 0 ? 'solid' : 'dashed'}
                    >
                        <>
                            <List size='sm'>
                                {entry.items.map((item, itemIndex) => (
                                    <ListItem key={itemIndex}>{item}</ListItem>
                                ))}
                            </List>
                        </>
                    </TimelineItem>
                ))}
            </Timeline>
            <Text size='sm'>
                See the{' '}
                <Anchor href={CHANGELOG_URL} target='_blank'>
                    full changelog
                </Anchor>{' '}
                for the complete history.
            </Text>
        </Stack>
    );
};
