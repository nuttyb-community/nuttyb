/**
 * Validates that all Lua files referenced in configuration-mapping.ts
 * are present in lua-bundle.json
 */

import fs from 'node:fs';
import path from 'node:path';

import { CONFIGURATION_MAPPING } from '@/lib/data/configuration-mapping';
import type { LuaFile } from '@/types/types';

interface Bundle {
    sha: string;
    files: LuaFile[];
}

const DATA_STORE_PATH = './public/data' as const;
const BUNDLE_FILE_NAME = 'lua-bundle.json' as const;
const LUA_PREFIX = '~' as const;

/**
 * Reads the lua-bundle.json file
 */
function getBundle(): Bundle | undefined {
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
function extractLuaReferences(obj: unknown): string[] {
    const references: string[] = [];

    if (typeof obj === 'string') {
        if (obj.startsWith(LUA_PREFIX)) {
            references.push(obj.slice(LUA_PREFIX.length));
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

/**
 * Main validation function
 */
function main(): void {
    console.log('Validating Lua file references in configuration mapping...\n');

    // Load the bundle
    const bundle = getBundle();
    if (!bundle) {
        console.error('ERROR: Could not read lua-bundle.json');
        // eslint-disable-next-line unicorn/no-process-exit
        process.exit(1);
    }

    console.log(`Bundle SHA: ${bundle.sha}`);
    console.log(`Bundle contains ${bundle.files.length} files\n`);

    // Extract all Lua references from the configuration mapping
    const luaReferences = extractLuaReferences(CONFIGURATION_MAPPING);
    const uniqueReferences = luaReferences.toSorted();

    console.log(
        `Found ${uniqueReferences.length} unique Lua file references in configuration mapping\n`
    );

    // Create a set of bundle paths for quick lookup
    const bundlePaths = new Set(bundle.files.map((f) => f.path));

    // Check each reference
    const missingFiles: string[] = [];

    for (const ref of uniqueReferences) {
        if (bundlePaths.has(ref)) {
            console.log(`  ✓ ${ref}`);
        } else {
            console.log(`  ✗ ${ref} (MISSING)`);
            missingFiles.push(ref);
        }
    }

    console.log('');

    // Report results
    if (missingFiles.length > 0) {
        console.error(
            `ERROR: ${missingFiles.length} file(s) referenced in configuration mapping are missing from lua-bundle.json:\n`
        );
        for (const file of missingFiles) {
            console.error(`  - ${file}`);
        }
        // eslint-disable-next-line unicorn/no-process-exit
        process.exit(1);
    }

    console.log('SUCCESS: All referenced Lua files are present in the bundle.');
}

main();
