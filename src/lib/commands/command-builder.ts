import type { Configuration } from '../configuration';
import type { EnabledCustomTweak } from './custom-tweaks';
import {
    allocateCustomTweakSlots,
    packLuaSourcesIntoSlots,
} from './slot-packer';
import type { LuaFile, TweakValue } from '../../types/types';
import {
    CONFIGURATION_MAPPING,
    MAX_COMMAND_LENGTH,
} from '../data/configuration-mapping';

/**
 * Interpolates placeholders in command strings.
 *
 * Supported placeholders:
 * - %%MODE%% → 'raptor' or 'scav' based on game mode
 *
 * @param command The command string with placeholders
 * @param mode The current game mode ('Raptors' or 'Scavengers')
 * @returns The interpolated command string
 */
function interpolateCommand(
    command: string,
    mode: Configuration['mode']
): string {
    const modePrefix = mode === 'Scavengers' ? 'scav' : 'raptor';
    return command.replaceAll('%%MODE%%', modePrefix);
}

/**
 * Builds the $rename command for custom lobby naming.
 *
 * Format: $rename Collective NuttyB <Mode> [<user_input>] [<enemyHealth>xHP / <bossHealth>xQHP]
 *
 * @param configuration User's selected configuration
 * @returns The $rename command string, or undefined if no custom name
 */
function buildRenameCommand(configuration: Configuration): string | undefined {
    const customName = configuration.lobbyName?.trim();

    const mode = configuration.mode;
    const difficulty = configuration.difficulty;
    const enemyHealth = configuration.enemyHealth;
    const bossHealth = configuration.bossHealth;

    let command = `!rename Collective NuttyB ${mode} `;
    if (difficulty !== 'Default') command += `[${difficulty}] `;
    if (customName) command += `[${customName}] `;
    command += `[${enemyHealth.toString()}HP | ${bossHealth.toString()}QHP]`;

    return command.replaceAll('.', '_');
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
            rawCommands.push(
                ...commands.map((cmd) =>
                    interpolateCommand(cmd, configuration.mode)
                )
            );
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

    // Generate rename command if custom lobby name is set
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
        ...(renameCommand ? [renameCommand] : []),
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
