/**
 * Slot packing for Lua sources.
 *
 * Packs Lua files sequentially into slots while respecting size limits.
 * Sources must be pre-sorted by priority by the caller.
 */

import { LuaTweakType } from './command-generator';
import { MAX_CHUNK_SIZE, MAX_SLOT_SIZE, MAX_SLOTS_PER_TYPE } from './constants';
import { encode } from '../encoders/base64';
import { minify } from '../lua-utils/minificator';

/** Lua source with metadata for packing */
export interface LuaSource {
    path: string;
    content: string;
    priority: number;
}

/** Result of packing Lua sources into slots */
export interface PackingResult {
    /** Generated !bset commands */
    commands: string[];
    /** Slot usage statistics */
    slotUsage: { used: number; total: number };
}

/**
 * Checks if adding new content to existing slot would exceed the size limit.
 *
 * @param existing Existing slot content
 * @param addition New content to add
 * @returns true if addition fits, false otherwise
 */
function canFitInSlot(existing: string, addition: string): boolean {
    const existingEncoded = encode(minify(existing + '\n\n')).length;
    const additionEncoded = encode(minify(addition)).length;
    return existingEncoded + additionEncoded <= MAX_SLOT_SIZE;
}

/**
 * Generates slot name according to BAR conventions.
 * Slot 0 = 'tweakdefs', Slot 1+ = 'tweakdefs1', 'tweakdefs2', etc.
 *
 * @param type Type of tweak
 * @param index Index of the slot
 * @returns command slot name
 */
function formatSlotName(type: LuaTweakType, index: number): string {
    return index === 0 ? type : `${type}${index}`;
}

/** A slot being built, tracking sources and content separately */
interface SlotBuilder {
    sources: string[];
    content: string;
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
    let currentSlot: SlotBuilder = { sources: [], content: '' };

    for (const source of sources) {
        const content = source.content;

        if (currentSlot.content === '') {
            currentSlot.sources.push(source.path);
            currentSlot.content = content;
        } else if (canFitInSlot(currentSlot.content, content)) {
            currentSlot.sources.push(source.path);
            currentSlot.content += '\n\n' + content;
        } else {
            slots.push(currentSlot);
            currentSlot = { sources: [source.path], content };
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

    // Generate !bset commands with source manifests
    const commands = slots.map((slot, i) => {
        const minifiedContent = minify(slot.content);
        const sourceManifest = `-- Source: ${JSON.stringify(slot.sources)}`;
        const encoded = encode(`${sourceManifest}\n${minifiedContent}`);
        const slotName = formatSlotName(slotType, i);
        return `!bset ${slotName} ${encoded}`;
    });

    return {
        commands,
        slotUsage: { used: slots.length, total: MAX_SLOTS_PER_TYPE },
    };
}

/**
 * Packs commands into sections respecting MAX_CHUNK_SIZE.
 *
 * @param commands List of commands to pack
 * @returns List of packed command sections
 */
export function packCommandsIntoSections(commands: string[]): string[] {
    if (commands.length === 0) return [];

    const sections: string[] = [];
    let current = '';

    for (const cmd of commands) {
        if (!cmd) continue;

        if (cmd.length > MAX_CHUNK_SIZE) {
            throw new Error(
                `Command exceeds maximum length: ${cmd.length} > ${MAX_CHUNK_SIZE}`
            );
        }

        const separator = current ? '\n' : '';
        if (current.length + separator.length + cmd.length <= MAX_CHUNK_SIZE) {
            current += separator + cmd;
        } else {
            if (current) sections.push(current);
            current = cmd;
        }
    }

    if (current) sections.push(current);
    return sections;
}
