/**
 * All changes recorded for a single date.
 */
export interface ChangelogEntry {
    /** ISO date string, e.g. "2026-06-11". */
    date: string;
    items: string[];
}
