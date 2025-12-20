import type { Configuration } from '../configuration';
import type { EnabledCustomTweak } from './custom-tweaks';
import {
    allocateCustomTweakSlots,
    packLuaSourcesIntoSlots,
} from './slot-packer';
import type { LuaFile, TweakValue } from '../../types/types';
import {
    BASE_COMMANDS,
    BASE_TWEAKS,
    CONFIGURATION_MAPPING,
    MAX_COMMAND_LENGTH,
} from '../data/configuration-mapping';

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
 * Builds paste-ready lobby command sections from configuration and Lua files.
 *
 * This is the main entry point for command generation. It:
 * 1. Maps configuration options to raw Lua sources and commands
 * 2. Packs Lua sources into `!bset` commands (encoding once at output)
 * 3. Allocates slots for enabled custom tweaks
 * 4. Groups all commands into sections ≤ MAX_COMMAND_LENGTH
 *
 * @param configuration User's selected configuration
 * @param luaFiles Available Lua files from bundle
 * @param customTweaks Optional array of enabled custom tweaks to include
 * @returns Array of paste-ready sections (each ≤ MAX_COMMAND_LENGTH chars)
 */
export function buildLobbySections(
    configuration: Configuration,
    luaFiles: LuaFile[],
    customTweaks?: EnabledCustomTweak[]
): string[] {
    // Collect raw data by type
    const tweakdefsSources: string[] = [];
    const tweakunitsSources: string[] = [];
    const rawCommands: string[] = [];

    const luaFileMap = new Map(luaFiles.map((f) => [f.path, f.data]));

    // Always include Raptor base commands
    rawCommands.push(...BASE_COMMANDS);

    // Always include always-enabled tweaks
    for (const path of BASE_TWEAKS.tweakdefs) {
        const luaFilePath = path.replace(/^~/, '');
        const luaContent = luaFileMap.get(luaFilePath);
        if (luaContent) {
            tweakdefsSources.push(luaContent.trim());
        } else {
            console.warn(
                `Always-enabled Lua file not found in bundle: ${luaFilePath}`
            );
        }
    }

    for (const path of BASE_TWEAKS.tweakunits) {
        const luaFilePath = path.replace(/^~/, '');
        const luaContent = luaFileMap.get(luaFilePath);
        if (luaContent) {
            tweakunitsSources.push(luaContent.trim());
        } else {
            console.warn(
                `Always-enabled Lua file not found in bundle: ${luaFilePath}`
            );
        }
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

        // Process Lua files (tweakdefs and tweakunits)
        for (const [type, paths] of [
            ['tweakdefs', tweakValue.tweakdefs],
            ['tweakunits', tweakValue.tweakunits],
        ] as const) {
            if (!paths || paths.length === 0) continue;

            for (const path of paths) {
                const luaFilePath = path.replace(/^~/, '');
                const luaContent = luaFileMap.get(luaFilePath);

                if (!luaContent) {
                    console.warn(
                        `Lua file not found in bundle: ${luaFilePath} (required by ${configKey})`
                    );
                    continue;
                }

                const trimmedSource = luaContent.trim();
                if (type === 'tweakdefs') {
                    tweakdefsSources.push(trimmedSource);
                } else {
                    tweakunitsSources.push(trimmedSource);
                }
            }
        }
    }

    // Generate all commands
    // Pack Lua sources into !bset commands
    const tweakdefsCommands = packLuaSourcesIntoSlots(
        tweakdefsSources,
        'tweakdefs'
    );
    const tweakunitsCommands = packLuaSourcesIntoSlots(
        tweakunitsSources,
        'tweakunits'
    );

    // Combine standard bset commands for slot analysis
    const standardBsetCommands = [...tweakdefsCommands, ...tweakunitsCommands];

    // Generate custom tweak commands with dynamic slot allocation
    const customTweakCommands = allocateCustomTweakSlots(
        standardBsetCommands,
        customTweaks
    );

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

    // Group commands into paste-ready sections
    if (allCommands.length === 0) {
        return [];
    }

    interface Section {
        commands: string[];
        length: number;
    }

    const sections: Section[] = [];

    for (const cmd of allCommands) {
        if (!cmd) continue;

        let placed = false;

        for (const section of sections) {
            const neededLength =
                section.commands.length === 0 ? cmd.length : cmd.length + 1;

            if (section.length + neededLength <= MAX_COMMAND_LENGTH) {
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
