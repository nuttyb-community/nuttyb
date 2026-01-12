/**
 * E2E tests for lobby command generation.
 */

import { describe, expect, test } from 'bun:test';

import {
    type EnabledCustomTweak,
    generateCommands,
} from '@/lib/command-generator/command-generator';
import { interpolateCommands } from '@/lib/command-generator/command-template';
import {
    MAX_CHUNK_SIZE,
    MAX_SLOT_SIZE,
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
import { LuaSource, packLuaSources } from '@/lib/command-generator/packer';
import { decode, encode } from '@/lib/encoders/base64';
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
    // Interpolate any command templates in BASE_COMMANDS
    const interpolatedBaseCommands = interpolateCommands(
        BASE_COMMANDS,
        configuration
    );

    const mapped: string[] = [
        ...interpolatedBaseCommands,
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
        const result = generateCommands(config, luaFiles);

        // Validate slot usage statistics
        expect(result.slotUsage.tweakdefs).toBeLessThanOrEqual(
            MAX_SLOTS_PER_TYPE
        );
        expect(result.slotUsage.tweakunits).toBeLessThanOrEqual(
            MAX_SLOTS_PER_TYPE
        );

        // Derive sections from structured chunks
        const sections = result.chunks.map((chunk) =>
            chunk.commands.map((cmd) => cmd.command).join('\n')
        );

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

            // Each command must fit within MAX_CHUNK_SIZE - that's the absolute limit
            // MAX_SLOT_SIZE is a target limit, not a real constraint
            expect(generatedTweak.length).toBeLessThanOrEqual(MAX_CHUNK_SIZE);

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

describe('Tweakunits plain table isolation', () => {
    test('Plain table tweakunits files get separate slots', () => {
        // Plain table format - starts with { after comments
        const plainTable1: LuaSource = {
            path: 'lua/evocom-arm.lua',
            content: `--NuttyB Armada Com
{
    armcom = { health = 5000 }
}`,
            priority: 1,
        };

        const plainTable2: LuaSource = {
            path: 'lua/evocom-cor.lua',
            content: `--NuttyB Cortex Com
return {
    corcom = { health = 5000 }
}`,
            priority: 1,
        };

        const result = packLuaSources([plainTable1, plainTable2], 'tweakunits');

        // Each plain table should get its own slot
        expect(result.commands.length).toBe(2);
        expect(result.slotUsage.used).toBe(2);
    });

    test('Executable code tweakunits files can be merged', () => {
        // Executable code format - uses do...end block
        const execCode1: LuaSource = {
            path: 'lua/lrpc-rebalance.lua',
            content: `--NuttyB LRPC
do
    local unitDefs = UnitDefs or {}
    table.mergeInPlace(unitDefs.armbrtha, { health = 13000 })
end`,
            priority: 6,
        };

        const execCode2: LuaSource = {
            path: 'lua/air-rework-t4.lua',
            content: `--NuttyB T4 Air
do
    local unitDefs = UnitDefs or {}
    table.mergeInPlace(unitDefs.armfepoch, { speed = 100 })
end`,
            priority: 7,
        };

        const result = packLuaSources([execCode1, execCode2], 'tweakunits');

        // Executable code files can be merged into one slot
        expect(result.commands.length).toBe(1);
        expect(result.slotUsage.used).toBe(1);
    });

    test('Mixed plain table and executable code get proper isolation', () => {
        const plainTable: LuaSource = {
            path: 'lua/main-units.lua',
            content: `--NuttyB Main Units
{
    cortron = { health = 12000 }
}`,
            priority: 0,
        };

        const execCode: LuaSource = {
            path: 'lua/lrpc-rebalance.lua',
            content: `--NuttyB LRPC
do
    local unitDefs = UnitDefs or {}
    table.mergeInPlace(unitDefs.armbrtha, { health = 13000 })
end`,
            priority: 6,
        };

        const result = packLuaSources([plainTable, execCode], 'tweakunits');

        // Plain table gets its own slot, exec code gets another
        expect(result.commands.length).toBe(2);
        expect(result.slotUsage.used).toBe(2);
    });

    test('Tweakdefs files are not affected by plain table isolation', () => {
        // Even if content looks like a plain table, tweakdefs should merge normally
        const defs1: LuaSource = {
            path: 'lua/defs1.lua',
            content: `--Defs 1
{
    somedef = { value = 1 }
}`,
            priority: 1,
        };

        const defs2: LuaSource = {
            path: 'lua/defs2.lua',
            content: `--Defs 2
{
    otherdef = { value = 2 }
}`,
            priority: 1,
        };

        const result = packLuaSources([defs1, defs2], 'tweakdefs');

        // Tweakdefs should merge regardless of format
        expect(result.commands.length).toBe(1);
        expect(result.slotUsage.used).toBe(1);
    });
});

describe('Command-centric structure (generateCommands)', () => {
    test('generateCommands returns properly structured commands', () => {
        const config = DEFAULT_CONFIGURATION;
        const bundle = getBundle();
        if (!bundle) expect.unreachable('Bundle should exist');

        const result = generateCommands(config, bundle.files);
        const allCommands = result.chunks.flatMap((c) => c.commands);

        // Validate command structure contract
        for (const cmd of allCommands) {
            expect(['tweakdefs', 'tweakunits', 'command']).toContain(cmd.type);
            expect(typeof cmd.command).toBe('string');
            expect(cmd.command.length).toBeGreaterThan(0);

            // Slot presence follows type rules
            if (cmd.type === 'command') {
                expect(cmd.slot).toBeUndefined();
            } else {
                expect(cmd.slot).toBeDefined();
                expect(typeof cmd.slot!.index).toBe('number');
                expect(Array.isArray(cmd.slot!.sources)).toBe(true);
                expect(typeof cmd.slot!.content).toBe('string');
            }
        }

        // Validate slot usage counts
        const tweakdefsCmds = allCommands.filter((c) => c.type === 'tweakdefs');
        const tweakunitsCmds = allCommands.filter(
            (c) => c.type === 'tweakunits'
        );
        expect(result.slotUsage.tweakdefs).toBe(tweakdefsCmds.length);
        expect(result.slotUsage.tweakunits).toBe(tweakunitsCmds.length);
    });
});

describe('Command size validation', () => {
    test('Oversized custom tweaks are dropped gracefully', () => {
        const config = DEFAULT_CONFIGURATION;
        const bundle = getBundle();
        if (!bundle) expect.unreachable('Bundle should exist');

        const luaFiles = bundle.files;

        // Create a custom tweak with base64 code that results in command > MAX_SLOT_SIZE
        const oversizedCode = 'A'.repeat(MAX_SLOT_SIZE + 1000);
        const customTweaks: EnabledCustomTweak[] = [
            {
                id: 1,
                description: 'Oversized Tweak',
                type: 'tweakdefs',
                code: oversizedCode,
                enabled: true,
            },
        ];

        const result = generateCommands(config, luaFiles, customTweaks);

        // Should be dropped, not cause error
        expect(result.droppedCustomTweaks.length).toBe(1);
        expect(result.droppedCustomTweaks[0].description).toBe(
            'Oversized Tweak'
        );

        // All chunks should still be valid
        for (const chunk of result.chunks) {
            for (const cmd of chunk.commands) {
                expect(cmd.command.length).toBeLessThanOrEqual(MAX_CHUNK_SIZE);
            }
        }
    });

    test('Valid custom tweaks are allocated while oversized ones are dropped', () => {
        const config = DEFAULT_CONFIGURATION;
        const bundle = getBundle();
        if (!bundle) expect.unreachable('Bundle should exist');

        const luaFiles = bundle.files;
        const validCode = encode('-- Valid tweak\nlocal x = 1');
        const oversizedCode = 'A'.repeat(MAX_SLOT_SIZE + 1000);

        const customTweaks: EnabledCustomTweak[] = [
            {
                id: 1,
                description: 'Valid',
                type: 'tweakdefs',
                code: validCode,
                enabled: true,
            },
            {
                id: 2,
                description: 'Oversized',
                type: 'tweakdefs',
                code: oversizedCode,
                enabled: true,
            },
            {
                id: 3,
                description: 'Also Valid',
                type: 'tweakunits',
                code: validCode,
                enabled: true,
            },
        ];

        const result = generateCommands(config, luaFiles, customTweaks);

        expect(result.droppedCustomTweaks.length).toBe(1);
        expect(result.droppedCustomTweaks[0].description).toBe('Oversized');

        // Valid tweaks should be in chunks
        const allCommands = result.chunks.flatMap((chunk) => chunk.commands);
        const customCommands = allCommands.filter((cmd) =>
            cmd.slot?.sources.some((s) => s.startsWith('custom:'))
        );
        expect(customCommands.length).toBe(2);
    });
});
