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
import { EXTERNAL_LINKS } from '@/lib/navigation';

import { LIST_OFFSET } from './list-offset';

interface ChangelogProps {
    entries: ChangelogEntry[];
    /** Column gap; pass the page grid's gap so the columns line up with it. */
    spacing: MantineSpacing;
}

/** The three most recent dates, one column each. */
export const Changelog: React.FC<ChangelogProps> = ({ entries, spacing }) => (
    <Stack gap='md'>
        <SimpleGrid cols={{ base: 1, md: 3 }} spacing={spacing}>
            {entries.slice(0, 3).map((entry) => (
                <Stack key={entry.date} gap='xs'>
                    <Text fw={700}>
                        {dayjs(entry.date).format('DD.MM.YYYY')}
                    </Text>
                    <List size='sm' ml={LIST_OFFSET} spacing={4}>
                        {entry.items.map((item, itemIndex) => (
                            <ListItem key={itemIndex}>{item}</ListItem>
                        ))}
                    </List>
                </Stack>
            ))}
        </SimpleGrid>
        <Text size='sm'>
            See the{' '}
            <Anchor href={EXTERNAL_LINKS.changelog} target='_blank'>
                full changelog
            </Anchor>{' '}
            for the complete history.
        </Text>
    </Stack>
);
