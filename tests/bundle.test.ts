/**
 * Validates that all Lua files referenced in configuration-mapping.ts
 * are present in lua-bundle.json
 */

import { describe, expect, test } from 'bun:test';

import {
    BASE_TWEAKS,
    CONFIGURATION_MAPPING,
} from '@/lib/command-generator/data/configuration-mapping';

import { extractLuaReferences, getBundle } from './utils/bundle';

describe('Lua Bundle Validation', () => {
    test('Bundle exists and not empty', () => {
        const bundle = getBundle();
        expect(bundle).toBeDefined();
        // if (!bundle) expect.unreachable('Bundle should exist');
        expect(bundle!.sha).toBeDefined();
        expect(bundle!.files.length).toBeGreaterThan(0);
    });

    test('Bundle contains all Lua files referenced in configuration mapping', () => {
        const bundle = getBundle();
        if (!bundle) expect.unreachable('Bundle should exist');

        // Extract all Lua references from the configuration mapping and base tweaks
        const configReferences = extractLuaReferences(CONFIGURATION_MAPPING);
        const baseTweaksReferences = extractLuaReferences(BASE_TWEAKS);
        const allReferences = [...configReferences, ...baseTweaksReferences];
        const uniqueReferences = [...new Set(allReferences)].toSorted();

        // Create a set of bundle paths for quick lookup
        const bundlePaths = new Set(bundle.files.map((f) => f.path));

        for (const ref of uniqueReferences) {
            expect(bundlePaths.has(ref)).toBeTrue();
        }
    });
});
