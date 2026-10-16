/**
 * Validates that all Lua files referenced in configuration-mapping.ts
 * are present in lua-bundle.json
 */

import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, test } from 'bun:test';

import { DEFAULT_CONFIGURATION } from '@/lib/command-generator/data/configuration';
import {
    BASE_TWEAKS,
    CONFIGURATION_MAPPING,
} from '@/lib/command-generator/data/configuration-mapping';

import { extractLuaReferences, getBundle } from './utils/bundle';

describe('Bundled presets', () => {
    // Unknown keys are dropped silently on load, so a stale key would quietly
    // fall back to the default value.
    test('use only known configuration keys', () => {
        const presetsDir = './public/presets';
        // Skip schema.json next to the preset folders
        const dirs = fs
            .readdirSync(presetsDir, { withFileTypes: true })
            .filter((entry) => entry.isDirectory())
            .map((entry) => entry.name);
        const unknownKeys = dirs.flatMap((dir) => {
            const file = path.join(presetsDir, dir, 'config.json');
            const { configuration } = JSON.parse(
                fs.readFileSync(file, 'utf8')
            ) as { configuration: Record<string, unknown> };
            return Object.keys(configuration)
                .filter((key) => !(key in DEFAULT_CONFIGURATION))
                .map((key) => `${dir}: ${key}`);
        });

        expect(unknownKeys).toEqual([]);
    });
});

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
