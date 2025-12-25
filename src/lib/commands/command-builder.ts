import type { Configuration } from '../configuration';
import type {
    CustomTweakAllocationResult,
    EnabledCustomTweak,
} from './custom-tweaks';
import { allocateCustomTweakSlots } from './custom-tweaks';
import type { LuaSourceWithMetadata } from './slot-packer';
import { packLuaSourcesIntoSlots } from './slot-packer';
import { resolveLuaReference } from './template-interpolator';
import type { LuaFile, TweakValue } from '../../types/types';
import {
    BASE_COMMANDS,
    BASE_TWEAKS,
    CONFIGURATION_MAPPING,
    DEFAULT_LUA_PRIORITY,
    LUA_PRIORITIES,
    MAX_COMMAND_LENGTH,
} from '../data/configuration-mapping';

/**
 * Result of building lobby command sections with metadata.
 */
export interface LobbySectionsResult {
    sections: string[];
    slotUsage: {
        tweakdefs: { used: number; total: number };
        tweakunits: { used: number; total: number };
    };
    droppedCustomTweaks: EnabledCustomTweak[];
}

/**
 * Gets the priority for a Lua file path.
 * Strips template variables and ~ prefix before lookup.
 *
 * @param path File path (e.g., '~lua/main-defs.lua' or '~lua/raptor-hp-template.lua{HP_MULTIPLIER=1.5}')
 * @returns Priority level (0 = highest)
 */
function getLuaFilePriority(path: string): number {
    // Strip ~ prefix and template variables: ~lua/file.lua{VAR=val} -> lua/file.lua
    const cleanPath = path.replace(/^~/, '').replace(/\{[^}]*\}$/, '');
    return LUA_PRIORITIES[cleanPath] ?? DEFAULT_LUA_PRIORITY;
}

/**
 * Builds the !rename command for custom lobby naming.
 *
 * Format: !rename Community NuttyB [<PresetDifficulty>] [<CustomName>]
 *
 * @param configuration User's selected configuration
 * @returns The !rename command string
 */
function buildRenameCommand(configuration: Configuration): string {
    const customName = configuration.lobbyName?.trim();
    const preset = configuration.presetDifficulty;

    let command = `!rename Community NuttyB [${preset}]`;
    if (customName) command += ` [${customName}]`;

    return command;
}

/**
 * Splits commands into sections using greedy bin-packing.
 * Each section respects the maximum length constraint.
 *
 * @param commands Array of command strings
 * @param maxLength Maximum length per section (including newline separators)
 * @returns Array of section strings (commands joined by newlines)
 */
function splitCommandsIntoSections(
    commands: string[],
    maxLength: number
): string[] {
    if (commands.length === 0) {
        return [];
    }

    interface Section {
        commands: string[];
        length: number;
    }

    const sections: Section[] = [];

    for (const cmd of commands) {
        if (!cmd) continue;

        let placed = false;

        for (const section of sections) {
            // Account for newline separator (+1) unless it's the first command
            const neededLength =
                section.commands.length === 0 ? cmd.length : cmd.length + 1;

            if (section.length + neededLength <= maxLength) {
                section.commands.push(cmd);
                section.length += neededLength;
                placed = true;
                break;
            }
        }

        if (!placed) {
            sections.push({ commands: [cmd], length: cmd.length });
        }
    }

    return sections.map((section) => section.commands.join('\n'));
}

/**
 * Builds paste-ready lobby command sections from configuration and Lua files.
 *
 * This is the main entry point for command generation. It:
 * 1. Maps configuration options to Lua sources with paths and priorities
 * 2. Packs Lua sources into optimized `!bset` commands using IIFE wrapping
 * 3. Allocates slots for enabled custom tweaks
 * 4. Groups all commands into sections ≤ MAX_COMMAND_LENGTH
 * 5. Returns sections with slot usage metadata
 *
 * @param configuration User's selected configuration
 * @param luaFiles Available Lua files from bundle
 * @param customTweaks Optional array of enabled custom tweaks to include
 * @returns Sections and slot usage metadata
 */
export function buildLobbySections(
    configuration: Configuration,
    luaFiles: LuaFile[],
    customTweaks?: EnabledCustomTweak[]
): LobbySectionsResult {
    // Collect Lua sources with metadata for priority-based packing
    const tweakdefsSources: LuaSourceWithMetadata[] = [];
    const tweakunitsSources: LuaSourceWithMetadata[] = [];
    const rawCommands: string[] = [];

    const luaFileMap = new Map(luaFiles.map((f) => [f.path, f.data]));

    // Always include Raptor base commands
    rawCommands.push(...BASE_COMMANDS);

    // Always include always-enabled tweaks (with paths for priority lookup)
    for (const path of BASE_TWEAKS.tweakdefs) {
        const luaContent = resolveLuaReference(path, luaFileMap);
        tweakdefsSources.push({
            path,
            content: luaContent.trim(),
            priority: getLuaFilePriority(path),
        });
    }

    for (const path of BASE_TWEAKS.tweakunits) {
        const luaContent = resolveLuaReference(path, luaFileMap);
        tweakunitsSources.push({
            path,
            content: luaContent.trim(),
            priority: getLuaFilePriority(path),
        });
    }

    // Process each configuration option
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
            rawCommands.push(...commands);
        }

        // Process Lua files (tweakdefs and tweakunits) with paths for priority
        for (const [type, paths] of [
            ['tweakdefs', tweakValue.tweakdefs],
            ['tweakunits', tweakValue.tweakunits],
        ] as const) {
            if (!paths || paths.length === 0) continue;

            for (const path of paths) {
                const luaContent = resolveLuaReference(path, luaFileMap);
                const source: LuaSourceWithMetadata = {
                    path,
                    content: luaContent.trim(),
                    priority: getLuaFilePriority(path),
                };

                if (type === 'tweakdefs') {
                    tweakdefsSources.push(source);
                } else {
                    tweakunitsSources.push(source);
                }
            }
        }
    }

    // Pack Lua sources with new multi-file IIFE packing
    const tweakdefsResult = packLuaSourcesIntoSlots(
        tweakdefsSources,
        'tweakdefs'
    );
    const tweakunitsResult = packLuaSourcesIntoSlots(
        tweakunitsSources,
        'tweakunits'
    );

    // Combine standard bset commands for slot analysis
    const standardBsetCommands = [
        ...tweakdefsResult.commands,
        ...tweakunitsResult.commands,
    ];

    // Generate custom tweak commands with dynamic slot allocation (still 1:1)
    const customTweakResult: CustomTweakAllocationResult =
        allocateCustomTweakSlots(standardBsetCommands, customTweaks);
    const customTweakCommands = customTweakResult.commands;
    const droppedCustomTweaks = customTweakResult.droppedCustomTweaks;

    // Generate rename command
    const renameCommand = buildRenameCommand(configuration);

    // Sort raw commands: !preset first, then others
    const sortedRawCommands = rawCommands.toSorted((a, b) => {
        const aIsPreset = a.startsWith('!preset');
        const bIsPreset = b.startsWith('!preset');
        if (aIsPreset && !bIsPreset) return -1;
        if (!aIsPreset && bIsPreset) return 1;
        return 0;
    });

    // Order: commands first (with !preset at the start), then tweaks
    const allCommands = [
        ...sortedRawCommands,
        renameCommand,
        ...standardBsetCommands,
        ...customTweakCommands,
    ];

    return {
        sections: splitCommandsIntoSections(allCommands, MAX_COMMAND_LENGTH),
        slotUsage: {
            tweakdefs: tweakdefsResult.slotUsage,
            tweakunits: tweakunitsResult.slotUsage,
        },
        droppedCustomTweaks,
    };
}
