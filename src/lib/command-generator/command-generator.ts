/**
 * Main module for generating NuttyB lobby commands.
 *
 * Flow: Configuration -> Lua sources -> Packed slots -> Command sections
 */

import type { LuaFile, LuaTweakType } from '@/types/types';

// Re-export for convenience

import { interpolateCommands } from './command-template';
import { getMappedData } from './configuration/mapper';
import type { Configuration } from './data/configuration';
import {
    DEFAULT_LUA_PRIORITY,
    LUA_PRIORITIES,
} from './data/configuration-mapping';
import { resolveLuaReference } from './interpolator';
import type { LuaSource } from './packer';
import { packCommandsIntoSections, packLuaSources } from './packer';
import { formatSlotName } from './slot';
import { decode } from '../encoders/base64';

/** Result of validating a Base64URL-encoded tweak code */
export interface TweakValidationResult {
    valid: boolean;
    firstLine?: string;
    error?: string;
}

/**
 * Validates a Base64URL-encoded tweak code.
 * Attempts to decode and extract the first line as a preview.
 */
export function validateBase64UrlTweak(code: string): TweakValidationResult {
    if (!code || code.trim() === '') {
        return { valid: false, error: 'Code cannot be empty' };
    }

    // Basic Base64URL character validation
    if (!/^[A-Za-z0-9_-]+$/.test(code.trim())) {
        return {
            valid: false,
            error: 'Invalid Base64URL characters. Use only A-Z, a-z, 0-9, - and _',
        };
    }

    try {
        const decoded = decode(code.trim());

        if (!decoded || decoded.trim() === '') {
            return { valid: false, error: 'Decoded content is empty' };
        }

        const firstLine = decoded.split('\n')[0].trim();
        return { valid: true, firstLine: firstLine || '(empty first line)' };
    } catch (error) {
        return {
            valid: false,
            error:
                error instanceof Error
                    ? `Decode failed: ${error.message}`
                    : 'Failed to decode Base64URL',
        };
    }
}

/** A custom tweak saved by the user */
export interface CustomTweak {
    id: number;
    description: string;
    type: LuaTweakType;
    /** Base64URL-encoded Lua code */
    code: string;
}

/** Custom tweak with enabled state */
export interface EnabledCustomTweak extends CustomTweak {
    enabled: boolean;
}

/** Result of building lobby command sections */
export interface LobbySectionsResult {
    sections: string[];
    slotUsage: {
        tweakdefs: { used: number; total: number };
        tweakunits: { used: number; total: number };
    };
    droppedCustomTweaks: EnabledCustomTweak[];
}

/**
 * Gets priority for a Lua file path.
 * Strips ~ prefix and template variables before lookup.
 */
function getLuaPriority(path: string): number {
    const clean = path.replace(/^~/, '').replace(/\{[^}]*\}$/, '');
    return LUA_PRIORITIES[clean] ?? DEFAULT_LUA_PRIORITY;
}

/** Result of allocating custom tweaks to slots */
interface CustomTweakAllocationResult {
    commands: string[];
    dropped: EnabledCustomTweak[];
    allocated: { tweakdefs: number; tweakunits: number };
}

/**
 * Allocates slots for custom tweaks and generates !bset commands.
 */
function allocateCustomTweaks(
    existingCommands: string[],
    customTweaks: EnabledCustomTweak[] | undefined
): CustomTweakAllocationResult {
    if (!customTweaks || customTweaks.length === 0) {
        return {
            commands: [],
            dropped: [],
            allocated: { tweakdefs: 0, tweakunits: 0 },
        };
    }

    // Parse used slots from existing commands
    const usedSlots: Record<LuaTweakType, Set<number>> = {
        tweakdefs: new Set(),
        tweakunits: new Set(),
    };

    const slotRegex = /!bset\s+(tweakdefs|tweakunits)(\d?)\s/;
    for (const cmd of existingCommands) {
        const match = cmd.match(slotRegex);
        if (match) {
            const type = match[1] as LuaTweakType;
            const num = match[2] === '' ? 0 : Number.parseInt(match[2], 10);
            usedSlots[type].add(num);
        }
    }

    const commands: string[] = [];
    const dropped: EnabledCustomTweak[] = [];
    const allocated = { tweakdefs: 0, tweakunits: 0 };

    for (const tweak of customTweaks) {
        // Find first available slot (1-9, slot 0 reserved for packed sources)
        let slot: number | null = null;
        for (let i = 1; i <= 9; i++) {
            if (!usedSlots[tweak.type].has(i)) {
                slot = i;
                break;
            }
        }

        if (slot === null) {
            dropped.push(tweak);
            continue;
        }

        usedSlots[tweak.type].add(slot);
        allocated[tweak.type]++;
        const slotName = formatSlotName(tweak.type, slot);
        commands.push(`!bset ${slotName} ${tweak.code}`);
    }

    return { commands, dropped, allocated };
}

/**
 * Converts Lua paths to LuaSource objects with resolved content and priority.
 * Note: mappedPaths already includes BASE_TWEAKS from getMappedData().
 */
function resolveLuaSources(
    luaFileMap: Map<string, string>,
    paths: string[]
): LuaSource[] {
    return paths.map((path) => ({
        path,
        content: resolveLuaReference(path, luaFileMap).trim(),
        priority: getLuaPriority(path),
    }));
}

/**
 * Sorts Lua sources
 */
function sortLua(sources: LuaSource[]): LuaSource[] {
    // Sort by priority (ascending: 0 loads first)
    return sources.toSorted((a, b) => a.priority - b.priority);
}

/**
 * Generates paste-ready lobby command sections.
 *
 * @param configuration User's selected configuration
 * @param luaFiles Available Lua files from bundle
 * @param customTweaks Optional enabled custom tweaks
 * @returns Sections and metadata
 */
export function generateCommandSections(
    configuration: Configuration,
    luaFiles: LuaFile[],
    customTweaks?: EnabledCustomTweak[]
): LobbySectionsResult {
    const luaFileMap = new Map(luaFiles.map((f) => [f.path, f.data]));

    // Map configuration to commands and Lua paths (includes BASE_TWEAKS)
    const {
        commands: rawCommands,
        tweakdefs: defsPaths,
        tweakunits: unitsPaths,
    } = getMappedData(configuration);

    // Interpolate any command templates with configuration values
    const interpolatedCommands = interpolateCommands(
        rawCommands,
        configuration
    );

    // Resolve Lua sources with content and priority
    const tweakdefsSources = resolveLuaSources(luaFileMap, defsPaths);
    const tweakunitsSources = resolveLuaSources(luaFileMap, unitsPaths);

    // Sort by priority before packing (packer expects pre-sorted input)
    const sortedTweakdefs = sortLua(tweakdefsSources);
    const sortedTweakunits = sortLua(tweakunitsSources);

    // Pack Lua sources into slots
    const tweakdefsResult = packLuaSources(sortedTweakdefs, 'tweakdefs');
    const tweakunitsResult = packLuaSources(sortedTweakunits, 'tweakunits');

    const bsetCommands = [
        ...tweakdefsResult.commands,
        ...tweakunitsResult.commands,
    ];

    // Allocate custom tweaks
    const {
        commands: customCommands,
        dropped,
        allocated,
    } = allocateCustomTweaks(
        bsetCommands,
        customTweaks?.filter((t) => t.enabled)
    );

    // Sort commands: !preset first
    const sortedCommands = interpolatedCommands.toSorted((a, b) => {
        if (a.startsWith('!preset') && !b.startsWith('!preset')) return -1;
        if (!a.startsWith('!preset') && b.startsWith('!preset')) return 1;
        return 0;
    });

    // Combine all commands in order
    const allCommands = [...sortedCommands, ...bsetCommands, ...customCommands];

    return {
        sections: packCommandsIntoSections(allCommands),
        slotUsage: {
            tweakdefs: {
                used: tweakdefsResult.slotUsage.used + allocated.tweakdefs,
                total: tweakdefsResult.slotUsage.total,
            },
            tweakunits: {
                used: tweakunitsResult.slotUsage.used + allocated.tweakunits,
                total: tweakunitsResult.slotUsage.total,
            },
        },
        droppedCustomTweaks: dropped,
    };
}
