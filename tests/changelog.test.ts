/**
 * Tests for the date-grouped changelog parser.
 */

import { describe, expect, test } from 'bun:test';

import { parseChangelog } from '@/lib/changelog/parse';

const SAMPLE = [
    '# Changelog',
    '',
    'Intro text that should be ignored.',
    '',
    '## 2026-06-11',
    '',
    '### Added',
    '',
    '- About page',
    '- Configurator description',
    '',
    '### Changed',
    '',
    '- Moved launchers',
    '',
    '## 2026-06-09',
    '',
    '- Fixed eco-t4',
].join('\n');

describe('parseChangelog', () => {
    test('returns empty array for empty input', () => {
        expect(parseChangelog('')).toEqual([]);
    });

    test('ignores content before the first dated heading', () => {
        const entries = parseChangelog(SAMPLE);
        expect(entries).toHaveLength(2);
        expect(entries[0].date).toBe('2026-06-11');
    });

    test('collects bullets and ignores category subheadings', () => {
        const [latest] = parseChangelog(SAMPLE);
        expect(latest.items).toEqual([
            'About page',
            'Configurator description',
            'Moved launchers',
        ]);
    });

    test('sorts entries newest-first regardless of file order', () => {
        const reordered = [
            '## 2026-01-01',
            '- old',
            '## 2026-12-31',
            '- new',
        ].join('\n');
        const entries = parseChangelog(reordered);
        expect(entries.map((e) => e.date)).toEqual([
            '2026-12-31',
            '2026-01-01',
        ]);
    });

    test('joins wrapped bullet continuation lines', () => {
        const entries = parseChangelog(
            '## 2026-06-11\n- first line\n  continued here'
        );
        expect(entries[0].items).toEqual(['first line continued here']);
    });
});
