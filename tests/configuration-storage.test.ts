/**
 * Tests for configuration sanitization against untrusted/unknown input.
 */

import { describe, expect, test } from 'bun:test';

import { getMappedData } from '@/lib/command-generator/configuration/mapper';
import {
    type Configuration,
    DEFAULT_CONFIGURATION,
} from '@/lib/command-generator/data/configuration';
import { sanitizeConfiguration } from '@/lib/configuration-storage/storage';

describe('sanitizeConfiguration', () => {
    test('returns defaults for null', () => {
        expect(sanitizeConfiguration(null)).toEqual(DEFAULT_CONFIGURATION);
    });

    test('returns defaults for undefined', () => {
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
            // Removed in favour of the HP and difficulty-tweak settings
            presetDifficulty: 'Hard',
            raptorHpMult: 3,
            bogusKey: 42,
        });

        expect(result).not.toHaveProperty('bogusKey');
        expect(result).not.toHaveProperty('presetDifficulty');
        expect(result).toEqual({
            ...DEFAULT_CONFIGURATION,
            raptorHpMult: 3,
        });
    });

    test('replaces invalid enum values with the default', () => {
        const result = sanitizeConfiguration({
            gameMap: 'Not A Map',
            enabledMilitaryTiers: 'T4',
            ecoStyle: 'Hybrid',
            effectsReduction: 'Max',
            // Valid before the evolving tiers started at T4
            ecoMaxTier: 0,
        });
        expect(result).toEqual(DEFAULT_CONFIGURATION);
    });

    test('replaces wrong-typed values with the default', () => {
        const result = sanitizeConfiguration({ queenCount: 'twelve' });
        expect(result.queenCount).toBe(DEFAULT_CONFIGURATION.queenCount);
    });

    test('passes a fully valid config through unchanged', () => {
        const validConfig: Configuration = {
            ...DEFAULT_CONFIGURATION,
            challenges: 'Mini Bosses Extended',
            gameMap: 'Darkside (12P)',
            start: 'Zero grace',
            lobbyName: 'Custom Lobby',
            ecoStyle: 'Evolving',
            ecoMaxTier: 6,
            isRFLRPCRebalance: false,
            isRFLRPCT4: false,
            isMegaNuke: true,
            isT3GeoWalls: true,
            isCrossFactionT2: false,
            isDefencesT4: false,
            raptorHpMult: 3,
            queenHpMult: 2.5,
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
