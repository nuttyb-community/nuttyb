/**
 * Slot packing for Lua sources.
 *
 * Packs Lua files sequentially into slots while respecting size limits.
 * Sources must be pre-sorted by priority by the caller.
 *
 * For tweakunits: Plain table format files (starting with `{`) must each get
 * their own slot because BAR's engine expects a single table per tweakunits slot.
 * Executable code format files (using `do...end` blocks) can be merged together.
 */

import { LuaTweakType } from '@/types/types';

import type { Command } from './command-generator';
import { MAX_SLOT_SIZE, MAX_SLOTS_PER_TYPE } from './constants';
import { formatSlotName } from './slot';
import { encode } from '../encoders/base64';
import { minify } from '../lua-utils/minificator';

/**
 * Detects if Lua content is a plain table format (starts with `{` after comments).
 * Plain table tweakunits cannot be merged - each needs its own slot.
 *
 * @param content Lua source content
 * @returns true if content is plain table format
 */
function isPlainTableFormat(content: string): boolean {
    // Strip leading comments and whitespace to find the first code character
    const stripped = content
        .replaceAll(/^(\s*--[^\n]*\n)*/g, '') // Remove leading comment lines
        .trimStart();

    return stripped.startsWith('{') || stripped.startsWith('return {');
}

/** Lua source with metadata for packing */
export interface LuaSource {
    path: string;
    content: string;
    priority: number;
}

/** Result of packing Lua sources into slots */
export interface PackingResult {
    /** Generated commands with slot metadata */
    commands: Command[];
    /** Slot usage statistics */
    slotUsage: { used: number; total: number };
}

/**
 * Checks if adding new content to existing slot would exceed the size limit.
 *
 * @param existingSources Current source paths in the slot
 * @param existingContent Current slot content
 * @param newSourcePath Path of the new source to add
 * @param newContent Content of the new source to add
 * @returns true if addition fits, false otherwise
 */
function canFitInSlot(
    existingSources: string[],
    existingContent: string,
    newSourcePath: string,
    newContent: string
): boolean {
    const combinedSources = [...existingSources, newSourcePath];
    const combinedContent = existingContent
        ? existingContent + '\n\n' + newContent
        : newContent;

    const manifest = `-- Source: ${JSON.stringify(combinedSources)}`;
    const minifiedContent = minify(combinedContent);
    const encoded = encode(`${manifest}\n${minifiedContent}`);

    return encoded.length <= MAX_SLOT_SIZE;
}

/** A slot being built, tracking sources and content separately */
interface SlotBuilder {
    sources: string[];
    content: string;
    /** If true, this slot contains a plain table and cannot accept more sources */
    isPlainTable: boolean;
}

/**
 * Packs Lua sources sequentially into slots.
 * Sources must be pre-sorted by priority (ascending: 0 loads first).
 * Each slot gets a manifest comment listing all sources: -- Source: ["path1", "path2"]
 *
 * @param sources Lua sources (must be pre-sorted by priority)
 * @param slotType Either 'tweakdefs' or 'tweakunits'
 * @returns Packed commands and slot usage
 * @throws Error if slot limit exceeded
 */
export function packLuaSources(
    sources: readonly LuaSource[],
    slotType: LuaTweakType
): PackingResult {
    if (sources.length === 0) {
        return {
            commands: [],
            slotUsage: { used: 0, total: MAX_SLOTS_PER_TYPE },
        };
    }

    const slots: SlotBuilder[] = [];
    let currentSlot: SlotBuilder = {
        sources: [],
        content: '',
        isPlainTable: false,
    };

    for (const source of sources) {
        const content = source.content;
        const sourceIsPlainTable =
            slotType === 'tweakunits' && isPlainTableFormat(content);

        // For tweakunits: plain table sources cannot be merged with anything
        // - If current slot has a plain table, start a new slot
        // - If new source is a plain table and current slot has content, start a new slot
        const needsNewSlotForPlainTable =
            currentSlot.isPlainTable ||
            (sourceIsPlainTable && currentSlot.content);

        const fitsInCurrentSlot =
            !needsNewSlotForPlainTable &&
            canFitInSlot(
                currentSlot.sources,
                currentSlot.content,
                source.path,
                content
            );

        if (fitsInCurrentSlot) {
            // Source fits in current slot
            if (currentSlot.content) {
                currentSlot.content += '\n\n' + content;
            } else {
                currentSlot.content = content;
            }
            currentSlot.sources.push(source.path);
            // Mark slot as plain table if this source is one
            if (sourceIsPlainTable) {
                currentSlot.isPlainTable = true;
            }
        } else {
            // Source doesn't fit or needs isolation - start new slot
            if (currentSlot.content) {
                slots.push(currentSlot);
            }
            currentSlot = {
                sources: [source.path],
                content,
                isPlainTable: sourceIsPlainTable,
            };
        }
    }

    // Push the last slot
    if (currentSlot.content) {
        slots.push(currentSlot);
    }

    if (slots.length > MAX_SLOTS_PER_TYPE) {
        throw new Error(
            `Too many ${slotType} slots needed (${slots.length}). ` +
                `Maximum is ${MAX_SLOTS_PER_TYPE}. Disable some settings to reduce usage.`
        );
    }

    // Generate structured commands with slot metadata
    const commands: Command[] = slots.map((slot, i) => {
        const minifiedContent = minify(slot.content);
        const sourceManifest = `-- Source: ${JSON.stringify(slot.sources)}`;
        const encoded = encode(`${sourceManifest}\n${minifiedContent}`);
        const slotName = formatSlotName(slotType, i);
        const commandString = `!bset ${slotName} ${encoded}`;

        return {
            type: slotType, // 'tweakdefs' or 'tweakunits'
            command: commandString,
            slot: {
                index: i,
                sources: slot.sources,
                content: `${sourceManifest}\n${slot.content}`, // Unminified with manifest
            },
        };
    });

    return {
        commands,
        slotUsage: { used: slots.length, total: MAX_SLOTS_PER_TYPE },
    };
}
