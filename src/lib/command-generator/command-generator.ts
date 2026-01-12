/**
 * Main module for generating NuttyB lobby commands.
 *
 * Flow: Configuration -> Lua sources -> Packed slots -> Command sections
 */

import type { LuaFile, LuaTweakType, TweakType } from '@/types/types';

// Re-export for convenience

import { interpolateCommands } from './command-template';
import { getMappedData } from './configuration/mapper';
import { MAX_CHUNK_SIZE, MAX_SLOT_SIZE } from './constants';
import type { Configuration } from './data/configuration';
import {
    DEFAULT_LUA_PRIORITY,
    LUA_PRIORITIES,
} from './data/configuration-mapping';
import { resolveLuaReference } from './interpolator';
import type { LuaSource } from './packer';
import { packLuaSources } from './packer';
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

/**
 * Metadata for slot-based commands (tweakdefs/tweakunits only)
 */
export interface SlotInfo {
    index: number; // 0-9, which slot this command uses
    sources: string[]; // File paths included in this slot
    content: string; // Reconstructed Lua code for editor display
}

/**
 * A single command to be sent to game lobby
 */
export interface Command {
    type: TweakType; // 'tweakdefs' | 'tweakunits' | 'command'
    command: string; // The actual command string (e.g., "!bset tweakdefs0 [base64]")
    slot?: SlotInfo; // Present only for tweakdefs/tweakunits (not plain commands)
}

/**
 * A chunk/section of commands that fits within message size limit
 */
export interface Chunk {
    commands: Command[];
}

/**
 * Complete result of command generation
 */
export interface PackingResult {
    chunks: Chunk[]; // Structured commands grouped by message size
    slotUsage: {
        tweakdefs: number; // Number of tweakdefs slots used
        tweakunits: number; // Number of tweakunits slots used
    };
    droppedCustomTweaks: EnabledCustomTweak[]; // Custom tweaks that didn't fit
}

/**
 * Gets priority for a Lua file path.
 * Strips ~ prefix and template variables before lookup.
 */
function getLuaPriority(path: string): number {
    const clean = path.replace(/^~/, '').replace(/\{[^}]*\}$/, '');
    return LUA_PRIORITIES[clean] ?? DEFAULT_LUA_PRIORITY;
}

/** A single custom tweak allocation */
interface CustomTweakAllocation {
    tweak: EnabledCustomTweak;
    slotIndex: number;
    command: string;
}

/** Result of allocating custom tweaks to slots */
interface CustomTweakAllocationResult {
    commands: string[]; // For backwards compat (derive from allocations)
    dropped: EnabledCustomTweak[];
    allocated: { tweakdefs: number; tweakunits: number };
    allocations: CustomTweakAllocation[]; // NEW: structured allocation data
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
            allocations: [],
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

    const allocations: CustomTweakAllocation[] = [];
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
        const command = `!bset ${slotName} ${tweak.code}`;

        // Validate command size before allocation
        // Oversized custom tweaks are dropped gracefully instead of failing
        if (command.length > MAX_SLOT_SIZE) {
            dropped.push(tweak);
            usedSlots[tweak.type].delete(slot); // Free the slot
            allocated[tweak.type]--;
            continue;
        }

        allocations.push({
            tweak,
            slotIndex: slot,
            command,
        });
    }

    return {
        commands: allocations.map((a) => a.command), // Derive from allocations
        dropped,
        allocated,
        allocations,
    };
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
 * Groups commands into chunks that fit within MAX_CHUNK_SIZE
 *
 * @param commands Array of commands to group
 * @returns Array of command chunks
 */
function groupIntoChunks(commands: Command[]): Chunk[] {
    const chunks: Chunk[] = [];
    let currentChunk: Command[] = [];
    let currentSize = 0;

    for (const cmd of commands) {
        // Validate that individual command doesn't exceed MAX_SLOT_SIZE
        if (cmd.command.length > MAX_SLOT_SIZE) {
            throw new Error(
                `Command exceeds maximum length: ${cmd.command.length} > ${MAX_SLOT_SIZE}. ` +
                    'This indicates a bug in command generation.'
            );
        }

        const separatorLength = currentChunk.length > 0 ? 1 : 0;
        const cmdSize = cmd.command.length + separatorLength;

        if (currentSize + cmdSize > MAX_CHUNK_SIZE && currentChunk.length > 0) {
            chunks.push({ commands: currentChunk });
            currentChunk = [cmd];
            currentSize = cmd.command.length;
        } else {
            currentChunk.push(cmd);
            currentSize += cmdSize;
        }
    }

    if (currentChunk.length > 0) {
        chunks.push({ commands: currentChunk });
    }

    return chunks;
}

/**
 * Generates structured commands from configuration
 * @param configuration User's selected configuration
 * @param luaFiles Available Lua files from bundle
 * @param customTweaks Optional enabled custom tweaks
 *
 * @returns PackingResult with chunks, slot usage, and dropped tweaks
 */
export function generateCommands(
    configuration: Configuration,
    luaFiles: LuaFile[],
    customTweaks?: EnabledCustomTweak[]
): PackingResult {
    const luaFileMap = new Map(luaFiles.map((f) => [f.path, f.data]));

    // 1. Map configuration to commands and Lua paths
    const {
        commands: rawCommands,
        tweakdefs: defsPaths,
        tweakunits: unitsPaths,
    } = getMappedData(configuration);

    // 2. Interpolate command templates
    const interpolatedCommands = interpolateCommands(
        rawCommands,
        configuration
    );

    // 3. Resolve and pack tweakdefs
    const tweakdefsSources = resolveLuaSources(luaFileMap, defsPaths);
    const sortedTweakdefs = sortLua(tweakdefsSources);
    const tweakdefsResult = packLuaSources(sortedTweakdefs, 'tweakdefs');

    // 4. Resolve and pack tweakunits
    const tweakunitsSources = resolveLuaSources(luaFileMap, unitsPaths);
    const sortedTweakunits = sortLua(tweakunitsSources);
    const tweakunitsResult = packLuaSources(sortedTweakunits, 'tweakunits');

    // 5. Allocate custom tweaks
    const tweakdefsCommands = tweakdefsResult.commands.map(
        (cmd) => cmd.command
    );
    const tweakunitsCommands = tweakunitsResult.commands.map(
        (cmd) => cmd.command
    );
    const existingBsetCommands = [...tweakdefsCommands, ...tweakunitsCommands];
    const allocationResult = allocateCustomTweaks(
        existingBsetCommands,
        customTweaks?.filter((t) => t.enabled)
    );

    // 5b. Convert custom tweak allocations to Command objects
    const customCommands: Command[] = allocationResult.allocations.map(
        (allocation) => {
            const decoded = decode(allocation.tweak.code);
            return {
                type: allocation.tweak.type,
                command: allocation.command,
                slot: {
                    index: allocation.slotIndex,
                    sources: [`custom:${allocation.tweak.description}`],
                    content: `-- Custom Tweak: ${allocation.tweak.description}\n${decoded}`,
                },
            };
        }
    );

    // 6. Build Command[] array
    const allCommands: Command[] = [
        // Plain commands (sorted: !preset first)
        ...interpolatedCommands
            .toSorted((a, b) => {
                if (a.startsWith('!preset') && !b.startsWith('!preset'))
                    return -1;
                if (!a.startsWith('!preset') && b.startsWith('!preset'))
                    return 1;
                return 0;
            })
            .map((cmd) => ({
                type: 'command' as TweakType,
                command: cmd,
                // No slot property for plain commands
            })),
        // Tweakdefs commands (already structured from packer)
        ...tweakdefsResult.commands,
        // Tweakunits commands (already structured from packer)
        ...tweakunitsResult.commands,
        // Custom tweak commands
        ...customCommands,
    ];

    // 7. Group commands into chunks (respecting message size limit)
    const chunks = groupIntoChunks(allCommands);

    return {
        chunks,
        slotUsage: {
            tweakdefs:
                tweakdefsResult.slotUsage.used +
                allocationResult.allocated.tweakdefs,
            tweakunits:
                tweakunitsResult.slotUsage.used +
                allocationResult.allocated.tweakunits,
        },
        droppedCustomTweaks: allocationResult.dropped,
    };
}
