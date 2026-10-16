import React from 'react';

import {
    Anchor,
    List,
    ListItem,
    type MantineSpacing,
    SimpleGrid,
    Stack,
    Text,
} from '@mantine/core';
import dayjs from 'dayjs';

import type { ChangelogEntry } from '@/lib/changelog/types';

const CHANGELOG_URL =
    'https://github.com/nuttyb-community/nuttyb/blob/main/CHANGELOG.md';

interface ChangelogProps {
    entries: ChangelogEntry[];
    /** How many of the most recent dates to display, one column each. */
    limit?: number;
    /** Column gap; pass the page grid's gap so the columns line up with it. */
    spacing?: MantineSpacing;
}

export const Changelog: React.FC<ChangelogProps> = ({
    entries,
    limit = 3,
    spacing = 'xl',
}) => {
    if (entries.length === 0) return null;

    return (
        <Stack gap='md'>
            <SimpleGrid cols={{ base: 1, md: limit }} spacing={spacing}>
                {entries.slice(0, limit).map((entry) => (
                    <Stack key={entry.date} gap='xs'>
                        <Text fw={700}>
                            {dayjs(entry.date).format('DD.MM.YYYY')}
                        </Text>
                        <List size='sm' ml={-7} spacing={4}>
                            {entry.items.map((item, itemIndex) => (
                                <ListItem key={itemIndex}>{item}</ListItem>
                            ))}
                        </List>
                    </Stack>
                ))}
            </SimpleGrid>
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
