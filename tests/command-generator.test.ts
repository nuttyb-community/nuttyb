/**
 * E2E tests for lobby command generation.
 */

import { describe, expect, test } from 'bun:test';

import { decode } from '@/lib/base64';
import { buildLobbySections } from '@/lib/commands/command-builder';
import { Configuration, DEFAULT_CONFIGURATION } from '@/lib/configuration';
import {
    BASE_COMMANDS,
    BASE_TWEAKS,
    CONFIGURATION_MAPPING,
    DEFAULT_LUA_PRIORITY,
    LUA_PRIORITIES,
    MAX_COMMAND_LENGTH,
    MAX_SLOTS_PER_TYPE,
} from '@/lib/data/configuration-mapping';
import { stripCommentPrefix } from '@/lib/lua-comments';
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

describe('Command generation', () => {
    test('Default configuration generates expected commands', () => {
        const config = DEFAULT_CONFIGURATION;
        const bundle = getBundle();
        if (!bundle) expect.unreachable('Bundle should exist');

        const luaFiles = bundle.files;
        const generatedLobbySections = buildLobbySections(config, luaFiles);
        const sections = generatedLobbySections.sections;

        expect(sections.length).toBeGreaterThan(0);
        const generatedTweaks = [];
        for (const section of sections) {
            expect(section.length).toBeLessThanOrEqual(MAX_COMMAND_LENGTH);
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
            const decodedLines = decode(base64).split('\n');
            const sourceRefs = [];
            for (const line of decodedLines) {
                if (line.startsWith('-- Source: ')) {
                    const sourceRef = stripCommentPrefix(line)
                        .trim()
                        .replace('Source: ', '');
                    sourceRefs.push(sourceRef);

                    // Separate by slot type for priority validation
                    if (isTweakdefs) tweakdefsSources.push(sourceRef);
                    if (isTweakunits) tweakunitsSources.push(sourceRef);
                }
            }
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
