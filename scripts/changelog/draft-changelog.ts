import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { parseChangelog } from '@/lib/changelog/parse';

import { log } from '../sync/utils/logger';

/**
 * Scaffolds new dated sections into CHANGELOG.md from git history.
 *
 * It finds the latest date already recorded in the changelog and collects every
 * non-merge commit made *after* that date, grouped by commit date. The new sections
 * are inserted at the top of the dated list (newest first) as plain bullet lists,
 * ready for a maintainer to trim and tidy before committing.
 *
 * Note: only commits strictly after the latest recorded date are picked up, since the
 * changelog tracks dates (not commit hashes) and we must avoid duplicating already
 * curated entries. Add same-day follow-up commits manually if needed.
 */

const CHANGELOG_PATH = fileURLToPath(
    new URL('../../CHANGELOG.md', import.meta.url)
);
const DATED_SECTION = /^##\s+\d{4}-\d{2}-\d{2}/m;

interface Commit {
    date: string;
    hash: string;
    subject: string;
}

function getCommitsAfter(date: string | undefined): Commit[] {
    // Tab-delimited fields; commit subjects never contain tabs.
    const args = [
        'log',
        '--no-merges',
        '--date=short',
        '--pretty=format:%ad%x09%h%x09%s',
    ];
    if (date) args.push('--since', `${date} 23:59:59`);

    const output = execFileSync('git', args, { encoding: 'utf8' }).trim();
    if (!output) return [];

    return output
        .split('\n')
        .map((line): Commit => {
            const [d, hash, subject] = line.split('\t');
            return { date: d, hash, subject };
        })
        .filter((c) => !date || c.date > date);
}

function buildSections(commits: Commit[]): string {
    const byDate = new Map<string, Commit[]>();
    for (const commit of commits) {
        const list = byDate.get(commit.date) ?? [];
        list.push(commit);
        byDate.set(commit.date, list);
    }

    const dates = [...byDate.keys()].toSorted((a, b) => (a < b ? 1 : -1));

    return dates
        .map((date) => {
            const bullets = byDate
                .get(date)!
                .map((c) => `- ${c.subject} (${c.hash})`)
                .join('\n');
            return `## ${date}\n\n${bullets}\n`;
        })
        .join('\n');
}

function insertSections(content: string, sections: string): string {
    const match = DATED_SECTION.exec(content);
    if (match) {
        const index = match.index;
        return `${content.slice(0, index)}${sections}\n${content.slice(index)}`;
    }
    // No dated sections yet: append after the intro.
    return `${content.replace(/\s*$/, '')}\n\n${sections}`;
}

function main() {
    try {
        const dryRun = process.argv.includes('--dry-run');

        log('Reading CHANGELOG.md');
        const content = readFileSync(CHANGELOG_PATH, 'utf8');

        const entries = parseChangelog(content);
        const latestDate = entries[0]?.date;
        log(
            latestDate
                ? `Latest recorded date: ${latestDate}`
                : 'No dated entries found yet'
        );

        const commits = getCommitsAfter(latestDate);
        if (commits.length === 0) {
            log('Changelog is up to date. No new commits to draft.');
            return;
        }

        log(`Found ${commits.length} new commit(s) to draft`);
        const sections = buildSections(commits);

        if (dryRun) {
            log('Dry run - would insert the following sections:\n');
            console.log(sections);
            return;
        }

        const updated = insertSections(content, sections);
        writeFileSync(CHANGELOG_PATH, updated);
        log('CHANGELOG.md updated. Please curate the new entries.');
    } catch (error_) {
        console.error((error_ as Error).message);
        // eslint-disable-next-line unicorn/no-process-exit
        process.exit(1);
    }
}

main();
