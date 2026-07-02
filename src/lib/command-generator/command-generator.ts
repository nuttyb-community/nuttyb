/**
 * Main module for generating NuttyB lobby commands.
 *
 * Flow: Configuration -> Lua sources -> Packed slots -> Command sections
 */

import type { LuaFile, LuaTweakType, TweakType } from '@/types/types';

import { interpolateCommands } from './command-template';
import { getMappedData } from './configuration/mapper';
import { MAX_SLOT_SIZE } from './constants';
import type { Configuration } from './data/configuration';
import {
    DEFAULT_LUA_PRIORITY,
    LUA_PRIORITIES,
} from './data/configuration-mapping';
import { resolveLuaReference } from './interpolator';
import type { LuaSource } from './packer';
import { extractFirstCommentAndRemaining, packLuaSources } from './packer';
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
    /** Priority for ordering (lower loads first) */
    priority: number;
    /** Origin: saved by the user, or resolved transiently from a preset */
    source: 'user' | 'preset';
    /** Built-in file path(s) to replace, e.g. 'lua/eco-t3.lua' */
    replaces?: string | string[];
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
 * Complete result of command generation
 */
export interface GenerationResult {
    commands: Command[]; // All generated commands in emission order
    slotUsage: {
        tweakdefs: number; // Number of tweakdefs slots used
        tweakunits: number; // Number of tweakunits slots used
    };
    droppedCustomTweaks: EnabledCustomTweak[]; // Custom tweaks that didn't fit
}

/**
 * Strips the template variable suffix (and a legacy ~ prefix, if present)
 * from a Lua file path. Used for normalising paths before comparison or
 * priority lookup.
 *
 * @example cleanLuaPath('lua/raptor-hp-template.lua{HP_MULTIPLIER=1.5}') → 'lua/raptor-hp-template.lua'
 */
export function cleanLuaPath(path: string): string {
    return path.replace(/^~/, '').replace(/\{[^}]*\}$/, '');
}

/**
 * Normalises a `replaces` value (which may be a single string or an array)
 * into a guaranteed array.
 */
function normalizeReplaces(replaces?: string | string[]): string[] {
    if (!replaces) return [];
    return Array.isArray(replaces) ? replaces : [replaces];
}

/**
 * Gets priority for a Lua file path.
 * Strips ~ prefix and template variables before lookup.
 */
function getLuaPriority(path: string): number {
    return LUA_PRIORITIES[cleanLuaPath(path)] ?? DEFAULT_LUA_PRIORITY;
}

/**
 * Gets priority for a preset tweak based on its replaced target(s).
 * Uses the first replaced target's priority: a multi-target replacement
 * inherits the slot position of the first file it replaces.
 */
function getPresetPriority(replaces?: string | string[]): number {
    if (!replaces) return DEFAULT_LUA_PRIORITY;
    const targets = normalizeReplaces(replaces);
    return getLuaPriority(targets[0]);
}

/** A single custom tweak allocation */
interface CustomTweakAllocation {
    tweak: EnabledCustomTweak;
    slotIndex: number;
    command: string;
}

/** Result of allocating custom tweaks to slots */
interface CustomTweakAllocationResult {
    dropped: EnabledCustomTweak[];
    allocated: { tweakdefs: number; tweakunits: number };
    allocations: CustomTweakAllocation[];
}

/**
 * Allocates slots for custom tweaks and generates !bset commands.
 *
 * @param usedSlots Slot indices already occupied by packed sources, per type
 * @param customTweaks Enabled custom tweaks sorted by priority
 */
function allocateCustomTweaks(
    usedSlots: Record<LuaTweakType, Set<number>>,
    customTweaks: EnabledCustomTweak[] | undefined
): CustomTweakAllocationResult {
    if (!customTweaks || customTweaks.length === 0) {
        return {
            dropped: [],
            allocated: { tweakdefs: 0, tweakunits: 0 },
            allocations: [],
        };
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

// ── Preset helpers ────────────────────────────────────────

/**
 * Filters preset tweaks to only those whose replaced targets are all active
 * in the current configuration.
 */
function filterActivePresetTweaks(
    enabledTweaks: EnabledCustomTweak[],
    activePaths: Set<string>
): EnabledCustomTweak[] {
    return enabledTweaks.filter((t) => {
        if (t.source !== 'preset') return false;
        if (!t.replaces) return true; // Standalone preset tweaks always apply
        const targets = normalizeReplaces(t.replaces);
        return targets.every((target) => activePaths.has(cleanLuaPath(target)));
    });
}

/**
 * Collects all Lua paths that are being replaced by the given preset tweaks.
 */
function collectReplacedPaths(presetTweaks: EnabledCustomTweak[]): Set<string> {
    const replaced = new Set<string>();
    for (const t of presetTweaks) {
        for (const target of normalizeReplaces(t.replaces)) {
            replaced.add(cleanLuaPath(target));
        }
    }
    return replaced;
}

/**
 * Converts preset tweaks of a specific type into LuaSources for packing.
 */
function resolvePresetSources(
    presetTweaks: EnabledCustomTweak[],
    tweakType: LuaTweakType
): LuaSource[] {
    return presetTweaks
        .filter((t) => t.type === tweakType)
        .map((t) => ({
            path: `preset:${t.description}`,
            content: decode(t.code).trim(),
            priority: getPresetPriority(t.replaces),
        }));
}

/**
 * Validates that no individual command exceeds MAX_SLOT_SIZE.
 *
 * @throws Error naming the offending command length
 */
function assertCommandSizes(commands: Command[]): void {
    for (const cmd of commands) {
        if (cmd.command.length > MAX_SLOT_SIZE) {
            throw new Error(
                `Command exceeds maximum length: ${cmd.command.length} > ${MAX_SLOT_SIZE}. ` +
                    'This indicates a bug in command generation.'
            );
        }
    }
}

/**
 * Generates structured commands from configuration
 * @param configuration User's selected configuration
 * @param luaFiles Available Lua files from bundle
 * @param customTweaks Optional enabled custom tweaks
 *
 * @returns GenerationResult with commands, slot usage, and dropped tweaks
 */
export function generateCommands(
    configuration: Configuration,
    luaFiles: LuaFile[],
    customTweaks?: EnabledCustomTweak[]
): GenerationResult {
    const luaFileMap = new Map(luaFiles.map((f) => [f.path, f.data]));

    // 1. Map configuration to commands and Lua paths
    const {
        commands: rawCommands,
        tweakdefs: defsPaths,
        tweakunits: unitsPaths,
    } = getMappedData(configuration);

    // Build the set of active paths in the configuration
    const activePaths = new Set(
        [...defsPaths, ...unitsPaths].map((p) => cleanLuaPath(p))
    );

    // Separate preset tweaks from user custom tweaks by origin
    const enabledTweaks = customTweaks?.filter((t) => t.enabled) || [];
    const userCustomTweaks = enabledTweaks.filter((t) => t.source === 'user');

    // Filter preset tweaks to only those whose replaced targets are active
    const presetTweaks = filterActivePresetTweaks(enabledTweaks, activePaths);

    // Remove built-in paths that are replaced by preset tweaks
    const replacedPaths = collectReplacedPaths(presetTweaks);
    const filteredDefsPaths = defsPaths.filter(
        (path) => !replacedPaths.has(cleanLuaPath(path))
    );
    const filteredUnitsPaths = unitsPaths.filter(
        (path) => !replacedPaths.has(cleanLuaPath(path))
    );

    // 2. Interpolate command templates
    const interpolatedCommands = interpolateCommands(
        rawCommands,
        configuration
    );

    // 3. Resolve and pack tweakdefs (including preset tweaks merged into main pack)
    const tweakdefsSources = resolveLuaSources(luaFileMap, filteredDefsPaths);
    const sortedTweakdefs = sortLua([
        ...tweakdefsSources,
        ...resolvePresetSources(presetTweaks, 'tweakdefs'),
    ]);
    const tweakdefsResult = packLuaSources(sortedTweakdefs, 'tweakdefs');

    // 4. Resolve and pack tweakunits (including preset tweaks merged into main pack)
    const tweakunitsSources = resolveLuaSources(luaFileMap, filteredUnitsPaths);
    const sortedTweakunits = sortLua([
        ...tweakunitsSources,
        ...resolvePresetSources(presetTweaks, 'tweakunits'),
    ]);
    const tweakunitsResult = packLuaSources(sortedTweakunits, 'tweakunits');

    // 5. Allocate user custom tweaks to separate slots (sorted by priority first)
    // Slot indices come straight from the packer's structured output.
    const usedSlots: Record<LuaTweakType, Set<number>> = {
        tweakdefs: new Set(
            tweakdefsResult.commands.flatMap((cmd) =>
                cmd.slot ? [cmd.slot.index] : []
            )
        ),
        tweakunits: new Set(
            tweakunitsResult.commands.flatMap((cmd) =>
                cmd.slot ? [cmd.slot.index] : []
            )
        ),
    };

    // Sort custom tweaks by priority before allocation (lower priority loads first)
    const sortedCustomTweaks = userCustomTweaks.toSorted(
        (a, b) => a.priority - b.priority
    );

    const allocationResult = allocateCustomTweaks(
        usedSlots,
        sortedCustomTweaks
    );

    // 5b. Convert custom tweak allocations to Command objects
    const customCommands: Command[] = allocationResult.allocations.map(
        (allocation) => {
            const decoded = decode(allocation.tweak.code);
            const { firstComment, remaining } =
                extractFirstCommentAndRemaining(decoded);

            const manifestComment = `-- Custom Tweak: ${allocation.tweak.description}`;
            const finalContent = firstComment
                ? `-- ${firstComment}\n${manifestComment}\n${remaining}`
                : `${manifestComment}\n${remaining}`;

            return {
                type: allocation.tweak.type,
                command: allocation.command,
                slot: {
                    index: allocation.slotIndex,
                    sources: [`custom:${allocation.tweak.description}`],
                    content: finalContent,
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

    // 7. Validate command sizes before returning
    assertCommandSizes(allCommands);

    return {
        commands: allCommands,
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
