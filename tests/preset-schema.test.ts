import { expect, test } from 'bun:test';

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
