import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, test } from 'bun:test';

import {
    CHALLENGES,
    DEFAULT_CONFIGURATION,
    MAPS,
    START_OPTIONS,
} from '@/lib/command-generator/data/configuration';
import { LUA_TWEAK_TYPES } from '@/types/types';

import schema from '../public/presets/schema.json';

// ponytail: drift check only — full validation is the editor's job via $schema
test('preset schema matches Configuration and tweak types', () => {
    const config = schema.properties.configuration.properties;

    expect(Object.keys(config).toSorted()).toEqual(
        Object.keys(DEFAULT_CONFIGURATION).toSorted()
    );
    expect(config.challenges.enum).toEqual([...CHALLENGES]);
    expect(config.gameMap.enum).toEqual([...MAPS]);
    expect(config.start.enum).toEqual([...START_OPTIONS]);
    expect(schema.properties.presetTweaks.items.properties.type.enum).toEqual([
        ...LUA_TWEAK_TYPES,
    ]);
});

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
