import dayjs from 'dayjs';

import type { LuaFile } from '@/types/types';

import {
    fetchLua as fetchLuaFromGitHub,
    getLatestCommitHash,
} from './connectors/source-github';
import { fetchLua as fetchLuaFromLocal } from './connectors/source-local';
import { deleteData, getSavedBundle, saveBundle } from './connectors/target';
import { getHelpText, parseCliArgs } from './utils/command-line-input';
import { log } from './utils/logger';
import { minify } from './utils/minificator';

// Default GitHub repository to pull from
export const REPO_OWNER = 'BAR-NuttyB-collective' as const;
export const REPO_NAME = 'NuttyB' as const;
export const REPO_BRANCH = 'main' as const;

async function main() {
    try {
        const runOptions = parseCliArgs();

        if (!runOptions) throw new Error('Unknown error.');

        if (runOptions.help) {
            console.log(getHelpText());
            return;
        }

        log('Sync started');
        let fileData: LuaFile[] = [];
        let commitHashSource: string;

        if (runOptions.source.type === 'github') {
            const owner = runOptions.source.repositoryOwner;
            const name = runOptions.source.repositoryName;
            const branch = runOptions.source.repositoryBranch;

            log('Reading cached data');
            const savedBundle = getSavedBundle();

            log('Reading commit hashes');
            const commitHashLocal = savedBundle ? savedBundle.sha : undefined;
            commitHashSource = await getLatestCommitHash(owner, name, branch);

            if (!runOptions.force && commitHashLocal === commitHashSource) {
                log('Commit hashes match. No action needed.');
                return;
            }

            log('Fetching Lua files from GitHub');
            fileData = await fetchLuaFromGitHub(owner, name, branch);
        } else {
            // Local path source - use datetime as version identifier
            commitHashSource = `loc-${dayjs().format('YYYY-MM-DD-HH:mm:ss')}`;

            log(
                `Fetching Lua files from local path: ${runOptions.source.localPath}`
            );
            fileData = fetchLuaFromLocal(runOptions.source.localPath);
        }

        log('Generating Lua bundle');
        const bundle: { sha: string; files: LuaFile[] } = {
            sha: commitHashSource,
            files: fileData.map((file) => ({
                path: file.path,
                data: minify(file.data),
            })),
        };

        log('Clearing existing data');
        deleteData();

        log('Saving new bundle');
        saveBundle(bundle);

        log('Sync completed');
    } catch (error_) {
        console.error((error_ as Error).message);
        // eslint-disable-next-line unicorn/no-process-exit
        process.exit(1);
    }
}

await main();
