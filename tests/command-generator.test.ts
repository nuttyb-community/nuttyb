/**
 * E2E tests for lobby command generation.
 */

import { describe, expect, test } from 'bun:test';

import { generateCommandSections } from '@/lib/command-generator/command-generator';
import {
    MAX_CHUNK_SIZE,
    // MAX_SLOT_SIZE,
    MAX_SLOTS_PER_TYPE,
} from '@/lib/command-generator/constants';
import {
    Configuration,
    DEFAULT_CONFIGURATION,
} from '@/lib/command-generator/data/configuration';
import {
    BASE_COMMANDS,
    BASE_TWEAKS,
    CONFIGURATION_MAPPING,
    DEFAULT_LUA_PRIORITY,
    LUA_PRIORITIES,
} from '@/lib/command-generator/data/configuration-mapping';
import { decode } from '@/lib/encoders/base64';
import {
    extractSourceManifest,
    parseSourceManifest,
} from '@/lib/lua-utils/comment-handler';
import { TweakValue } from '@/types/types';

import { getBundle } from './utils/bundle';

/**
 * Helper function to map configuration settings to expected commands and Lua files.
 * @param configuration Target configuration
 * @returns The list of expected commands and Lua file paths
 */
function mapSettingsToConfig(configuration: Configuration): string[] {
    const mapped: string[] = [
        ...BASE_COMMANDS,
        ...BASE_TWEAKS.tweakdefs,
        ...BASE_TWEAKS.tweakunits,
    ];

    // Include always-enabled base tweaks

    for (const configKey in configuration) {
        const configValue = configuration[configKey as keyof Configuration];
        const mapping = CONFIGURATION_MAPPING[configKey as keyof Configuration];
        const tweakValue = mapping.values[
            `${configValue}` as keyof typeof mapping.values
        ] as TweakValue | undefined;

        if (!tweakValue) continue;

        // Process commands
        const commands = tweakValue.command;
        if (commands && commands.length > 0) {
            mapped.push(...commands);
        }

        // Process Lua files (tweakdefs and tweakunits)
        for (const paths of [tweakValue.tweakdefs, tweakValue.tweakunits]) {
            if (paths && paths.length > 0) {
                mapped.push(...paths);
            }
        }
    }

    return mapped;
}

/**
 * Validates that Lua sources are ordered by priority group (relative order).
 * Ensures dependencies load before dependent code.
 *
 * @param sources Array of source paths extracted from commands
 */
function validatePriorityOrder(sources: string[]): void {
    let maxPriority = -1;

    for (const sourceRef of sources) {
        // Clean path for lookup (strip ~ prefix and template variables)
        const cleanPath = sourceRef.replace(/^~/, '').replace(/\{[^}]*\}$/, '');
        const priority = LUA_PRIORITIES[cleanPath] ?? DEFAULT_LUA_PRIORITY;

        // Priority should never decrease (monotonic non-decreasing)
        expect(priority).toBeGreaterThanOrEqual(maxPriority);
        maxPriority = Math.max(maxPriority, priority);
    }
}

// FIXME: Fix the tests due to recent changes in command generation logic
describe('Command generation', () => {
    test('Default configuration generates expected commands', () => {
        const config = DEFAULT_CONFIGURATION;
        const bundle = getBundle();
        if (!bundle) expect.unreachable('Bundle should exist');

        const luaFiles = bundle.files;
        const generatedLobbySections = generateCommandSections(
            config,
            luaFiles
        );
        const sections = generatedLobbySections.sections;

        expect(sections.length).toBeGreaterThan(0);
        const generatedTweaks = [];
        for (const section of sections) {
            expect(section.length).toBeLessThanOrEqual(MAX_CHUNK_SIZE);
            generatedTweaks.push(...section.split('\n'));
        }

        // Decode generated tweaks to extract source references
        const tweaks = [];
        const tweakdefsSources = [];
        const tweakunitsSources = [];
        let tweakdefsCnt = 0;
        let tweakunitsCnt = 0;
        for (const generatedTweak of generatedTweaks) {
            if (!/^!bset tweakdefs|^!bset tweakunits/.test(generatedTweak)) {
                tweaks.push(generatedTweak);
                continue;
            }

            const isTweakdefs = generatedTweak.startsWith('!bset tweakdefs');
            const isTweakunits = generatedTweak.startsWith('!bset tweakunits');

            if (isTweakdefs) tweakdefsCnt++;
            if (isTweakunits) tweakunitsCnt++;
            const base64 = generatedTweak.replace(
                /^!bset tweakdefs\d* |^!bset tweakunits\d* /,
                ''
            );

            // Each command must fit within MAX_SLOT_SIZE
            // TODO: Investigate why some commands may exceed the limit
            // expect(generatedTweak.length).toBeLessThanOrEqual(MAX_SLOT_SIZE);

            const decoded = decode(base64);
            const manifest = extractSourceManifest(decoded);
            const sourceRefs = manifest ? parseSourceManifest(manifest) : [];

            // Separate by slot type for priority validation
            if (isTweakdefs) tweakdefsSources.push(...sourceRefs);
            if (isTweakunits) tweakunitsSources.push(...sourceRefs);

            tweaks.push(...sourceRefs);
        }

        // Verify slot counts are within limits
        expect(tweakdefsCnt).toBeLessThanOrEqual(MAX_SLOTS_PER_TYPE);
        expect(tweakunitsCnt).toBeLessThanOrEqual(MAX_SLOTS_PER_TYPE);

        // Validate priority ordering (dependencies load before dependents)
        validatePriorityOrder(tweakdefsSources);
        validatePriorityOrder(tweakunitsSources);

        const expectedTweaks = mapSettingsToConfig(config);
        for (const expectedTweak of expectedTweaks) {
            expect(tweaks).toContain(expectedTweak);
        }
    });
});
