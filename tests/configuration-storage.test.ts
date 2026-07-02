/**
 * Tests for configuration sanitization against untrusted/unknown input.
 */

import { describe, expect, test } from 'bun:test';

import { getMappedData } from '@/lib/command-generator/configuration/mapper';
import {
    Configuration,
    DEFAULT_CONFIGURATION,
} from '@/lib/command-generator/data/configuration';
import { sanitizeConfiguration } from '@/lib/configuration-storage/storage';

describe('sanitizeConfiguration', () => {
    test('returns defaults for null', () => {
        expect(sanitizeConfiguration(null)).toEqual(DEFAULT_CONFIGURATION);
    });

    test('returns defaults for undefined', () => {
        // eslint-disable-next-line unicorn/no-useless-undefined -- explicit undefined is the case under test
        expect(sanitizeConfiguration(undefined)).toEqual(DEFAULT_CONFIGURATION);
    });

    test('returns defaults for a string', () => {
        expect(sanitizeConfiguration('not an object')).toEqual(
            DEFAULT_CONFIGURATION
        );
    });

    test('returns defaults for an array', () => {
        expect(sanitizeConfiguration([1, 2, 3])).toEqual(DEFAULT_CONFIGURATION);
    });

    test('drops unknown keys and keeps known valid ones', () => {
        const result = sanitizeConfiguration({
            presetDifficulty: 'Hard',
            bogusKey: 42,
        });

        expect(result).not.toHaveProperty('bogusKey');
        expect(result.presetDifficulty).toBe('Hard');
        expect(result).toEqual({
            ...DEFAULT_CONFIGURATION,
            presetDifficulty: 'Hard',
        });
    });

    test('replaces invalid enum values with the default', () => {
        const result = sanitizeConfiguration({ gameMap: 'Not A Map' });
        expect(result.gameMap).toBe(DEFAULT_CONFIGURATION.gameMap);
    });

    test('replaces wrong-typed values with the default', () => {
        const result = sanitizeConfiguration({ queenCount: 'twelve' });
        expect(result.queenCount).toBe(DEFAULT_CONFIGURATION.queenCount);
    });

    test('passes a fully valid config through unchanged', () => {
        const validConfig: Configuration = {
            ...DEFAULT_CONFIGURATION,
            presetDifficulty: 'Hard',
            challenges: 'Mini Bosses Extended',
            gameMap: 'Darkside (12P)',
            start: 'Zero grace',
            lobbyName: 'Custom Lobby',
            isEcoT4: false,
            isRFLRPCRebalance: false,
            isRFLRPCT4: false,
            isMegaNuke: true,
            isT3GeoWalls: true,
            incomeMult: 2,
            buildDistMult: 3,
            buildPowerMult: 4,
            queenCount: 20,
        };

        expect(sanitizeConfiguration(validConfig)).toEqual(validConfig);
    });
});

describe('getMappedData', () => {
    test('does not throw when given a configuration with an unknown extra key', () => {
        const configWithExtraKey = {
            ...DEFAULT_CONFIGURATION,
            bogusKey: 1,
        } as unknown as Configuration;

        expect(() => getMappedData(configWithExtraKey)).not.toThrow();
    });
});
