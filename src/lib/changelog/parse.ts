import type { ChangelogEntry } from './types';

const DATE_HEADING = /^##\s+(\d{4}-\d{2}-\d{2})\s*$/;
const BULLET = /^[-*]\s+(.+)$/;

/**
 * Parse a date-grouped changelog document into structured entries.
 *
 * Expected shape (anything before the first `## YYYY-MM-DD` heading, such as the
 * title/intro, is ignored):
 *
 *   ## 2026-06-11
 *   - Something new
 *   - Something fixed
 *
 * `### ...` subheadings (e.g. leftover category headings) are ignored; the bullets
 * that follow them are still collected. Wrapped bullet lines (indented continuations)
 * are joined back together. Entries are returned newest-first by date.
 *
 * Degrades gracefully: malformed or empty input yields an empty array.
 */
export function parseChangelog(markdown: string): ChangelogEntry[] {
    if (!markdown) return [];

    const entries: ChangelogEntry[] = [];
    let entry: ChangelogEntry | undefined;

    for (const line of markdown.split(/\r?\n/)) {
        const dateMatch = DATE_HEADING.exec(line);
        if (dateMatch) {
            entry = { date: dateMatch[1], items: [] };
            entries.push(entry);
            continue;
        }

        // Skip everything until the first dated section.
        if (!entry) continue;

        const bulletMatch = BULLET.exec(line);
        if (bulletMatch) {
            entry.items.push(bulletMatch[1].trim());
            continue;
        }

        // Indented continuation of the previous bullet (wrapped line).
        if (entry.items.length > 0 && /^\s+\S/.test(line)) {
            entry.items[entry.items.length - 1] += ` ${line.trim()}`;
        }
    }

    // Drop empty entries, then sort newest-first.
    return entries
        .filter((e) => e.items.length > 0)
        .toSorted((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}
