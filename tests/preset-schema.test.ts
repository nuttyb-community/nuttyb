import fs from 'node:fs';
import path from 'node:path';

import Ajv from 'ajv';
import { describe, expect, test } from 'bun:test';

import {
    CHALLENGES,
    DEFAULT_CONFIGURATION,
    ECO_MAX_TIERS,
    ECO_STYLES,
    EFFECTS_REDUCTION_LEVELS,
    ENABLED_MILITARY_TIERS,
    MAPS,
    START_OPTIONS,
} from '@/lib/command-generator/data/configuration';
import { LUA_PRIORITIES } from '@/lib/command-generator/data/configuration-mapping';
import { LUA_TWEAK_TYPES } from '@/types/types';

import schema from '../public/presets/schema.json';

const PRESETS_DIR = './public/presets';

interface PresetFile {
    presetTweaks?: { replaces?: string | string[] }[];
}

// Skip schema.json next to the preset folders
const presets = fs
    .readdirSync(PRESETS_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => ({
        name: entry.name,
        data: JSON.parse(
            fs.readFileSync(
                path.join(PRESETS_DIR, entry.name, 'config.json'),
                'utf8'
            )
        ) as PresetFile,
    }));

test('preset schema matches Configuration and tweak types', () => {
    const config = schema.properties.configuration.properties;

    expect(Object.keys(config).toSorted()).toEqual(
        Object.keys(DEFAULT_CONFIGURATION).toSorted()
    );
    expect(config.challenges.enum).toEqual([...CHALLENGES]);
    expect(config.gameMap.enum).toEqual([...MAPS]);
    expect(config.start.enum).toEqual([...START_OPTIONS]);
    expect(config.enabledMilitaryTiers.enum).toEqual([
        ...ENABLED_MILITARY_TIERS,
    ]);
    expect(config.ecoStyle.enum).toEqual([...ECO_STYLES]);
    expect(config.ecoMaxTier.enum).toEqual([...ECO_MAX_TIERS]);
    expect(config.effectsReduction.enum).toEqual([...EFFECTS_REDUCTION_LEVELS]);
    expect(schema.properties.presetTweaks.items.properties.type.enum).toEqual([
        ...LUA_TWEAK_TYPES,
    ]);
});

describe('Bundled presets', () => {
    test('exist', () => {
        expect(presets.length).toBeGreaterThan(0);
    });

    // Unknown or invalid configuration values are dropped silently on load,
    // so a stale value would quietly fall back to the default.
    const validate = new Ajv({ allErrors: true }).compile(schema);
    test.each(presets.map(({ name, data }) => [name, data]))(
        '%s conforms to the preset schema',
        (_, data) => {
            validate(data);
            expect(validate.errors ?? []).toEqual([]);
        }
    );

    // A replaced file that no longer exists is silently skipped, so the
    // preset tweak never loads.
    test('only replace known built-in tweaks', () => {
        const unknownTargets = presets.flatMap(({ name, data }) =>
            (data.presetTweaks ?? [])
                .flatMap(({ replaces }) => replaces ?? [])
                .filter((target) => !(target in LUA_PRIORITIES))
                .map((target) => `${name}: ${target}`)
        );

        expect(unknownTargets).toEqual([]);
    });
});
