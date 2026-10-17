import { readFileSync } from 'node:fs';
import path from 'node:path';

import { parseChangelog } from './parse';
import type { ChangelogEntry } from './types';

/** Reads and parses CHANGELOG.md at the repo root; empty if it can't be read. */
export function readChangelogEntries(): ChangelogEntry[] {
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
