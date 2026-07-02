import fs from 'node:fs';
import path from 'node:path';

import type { LuaFile } from '@/types/types';

interface Bundle {
    sha: string;
    files: LuaFile[];
}

const DATA_STORE_PATH = './public/data' as const;
const BUNDLE_FILE_NAME = 'lua-bundle.json' as const;

/**
 * Reads the lua-bundle.json file
 */
export function getBundle(): Bundle | undefined {
    const p = path.join(DATA_STORE_PATH, BUNDLE_FILE_NAME);
    try {
        const file = fs.readFileSync(p, 'utf8');
        return JSON.parse(file) as Bundle;
    } catch {
        return undefined;
    }
}

/**
 * Recursively extracts all Lua file references from the configuration mapping
 */
export function extractLuaReferences(obj: unknown): string[] {
    const references: string[] = [];

    if (typeof obj === 'string') {
        // Strip a legacy ~ prefix and any template variables {VAR=value}
        const basePath = obj.replace(/^~/, '').split('{')[0];
        if (basePath.startsWith('lua/') && basePath.endsWith('.lua')) {
            references.push(basePath);
        }
    } else if (Array.isArray(obj)) {
        for (const item of obj) {
            references.push(...extractLuaReferences(item));
        }
    } else if (obj !== null && typeof obj === 'object') {
        for (const value of Object.values(obj)) {
            references.push(...extractLuaReferences(value));
        }
    }

    return references;
}
