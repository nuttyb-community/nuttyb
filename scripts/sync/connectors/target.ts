import fs from 'node:fs';
import path from 'node:path';

import { LuaFile } from '@/types/types';

const DATA_STORE_PATH = './public/data' as const;
const BUNDLE_FILE_NAME = 'lua-bundle.json' as const;

export interface Bundle {
    sha: string;
    files: LuaFile[];
}

export function getSavedBundle(): Bundle | undefined {
    const p = path.join(DATA_STORE_PATH, BUNDLE_FILE_NAME);
    try {
        const file = fs.readFileSync(p, 'utf8');

        return JSON.parse(file) as Bundle;
    } catch {
        return undefined;
    }
}

export function deleteData(): void {
    if (fs.existsSync(DATA_STORE_PATH)) {
        fs.rmSync(DATA_STORE_PATH, { recursive: true, force: true });
    }
}

export function saveBundle(bundle: Bundle): void {
    const p = path.join(DATA_STORE_PATH, BUNDLE_FILE_NAME);
    try {
        const dirname = path.dirname(p);

        if (!fs.existsSync(dirname)) fs.mkdirSync(dirname, { recursive: true });

        fs.writeFileSync(p, JSON.stringify(bundle, null, 4), 'utf8');
    } catch (error) {
        throw new Error(
            `Failed to save file ${p}: ${(error as Error).message}`
        );
    }
}
