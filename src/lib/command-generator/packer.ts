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
 * Helper to build the encoded/formatted content for a slot.
 * If the content starts with a comment line, it preserves that comment line
 * as the first line, puts the `-- Source: ...` manifest on the second line,
 * and the remaining content (optionally minified) below.
 */
/**
 * Separates the first comment line of a Lua file from the remaining content.
 *
 * @param content The Lua file content
 * @returns Cleaned first comment and remaining content
 */
function extractFirstCommentAndRemaining(content: string): {
    firstComment: string;
    remaining: string;
} {
    const lines = content.split('\n');
    let firstCommentIndex = -1;
    for (const [i, rawLine] of lines.entries()) {
        const line = rawLine.trim();
        if (line === '') {
            continue;
        }
        if (line.startsWith('--')) {
            firstCommentIndex = i;
        }
        break;
    }

    if (firstCommentIndex !== -1) {
        const rawComment = lines[firstCommentIndex];
        const firstComment = rawComment.trim().replace(/^--+\s*/, '');
        const remainingLines = [
            ...lines.slice(0, firstCommentIndex),
            ...lines.slice(firstCommentIndex + 1),
        ];
        return {
            firstComment,
            remaining: remainingLines.join('\n'),
        };
    }

    return {
        firstComment: '',
        remaining: content,
    };
}

/**
 * Builds the final Lua content for a slot, merging top comments and adding source manifest.
 */
function buildFinalContent(
    sources: string[],
    firstComments: string[],
    remainingContent: string,
    minifyContent: boolean
): string {
    const preparedContent = minifyContent
        ? minify(remainingContent)
        : remainingContent;
    const sourceManifest = `-- Source: ${JSON.stringify(sources)}`;

    if (firstComments.length > 0) {
        const mergedComment = `-- ${firstComments.join('-')}`;
        return `${mergedComment}\n${sourceManifest}\n${preparedContent}`;
    }
    return `${sourceManifest}\n${preparedContent}`;
}

/**
 * Checks if adding new content to existing slot would exceed the size limit.
 *
 * @param existingSources Current source paths in the slot
 * @param existingComments Current slot comments
 * @param existingRemainingContent Current slot remaining content
 * @param newSourcePath Path of the new source to add
 * @param newComment Comment of the new source to add
 * @param newRemainingContent Remaining content of the new source to add
 * @returns true if addition fits, false otherwise
 */
function canFitInSlot(
    existingSources: string[],
    existingComments: string[],
    existingRemainingContent: string,
    newSourcePath: string,
    newComment: string,
    newRemainingContent: string
): boolean {
    const combinedSources = [...existingSources, newSourcePath];
    const combinedComments = newComment
        ? [...existingComments, newComment]
        : existingComments;
    const combinedContent = existingRemainingContent
        ? existingRemainingContent + '\n\n' + newRemainingContent
        : newRemainingContent;

    const finalContent = buildFinalContent(
        combinedSources,
        combinedComments,
        combinedContent,
        true
    );
    const encoded = encode(finalContent);

    return encoded.length <= MAX_SLOT_SIZE;
}

/** A slot being built, tracking sources and content separately */
interface SlotBuilder {
    sources: string[];
    firstComments: string[];
    remainingContent: string;
    /** If true, this slot contains a plain table and cannot accept more sources */
    isPlainTable: boolean;
}

interface ProcessedLuaSource {
    path: string;
    firstComment: string;
    remainingContent: string;
    priority: number;
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

    const processedSources: ProcessedLuaSource[] = sources.map((source) => {
        const { firstComment, remaining } = extractFirstCommentAndRemaining(
            source.content
        );
        return {
            path: source.path,
            firstComment,
            remainingContent: remaining,
            priority: source.priority,
        };
    });

    const slots: SlotBuilder[] = [];
    let currentSlot: SlotBuilder = {
        sources: [],
        firstComments: [],
        remainingContent: '',
        isPlainTable: false,
    };

    for (const source of processedSources) {
        const remainingContent = source.remainingContent;
        const sourceIsPlainTable =
            slotType === 'tweakunits' && isPlainTableFormat(remainingContent);

        // For tweakunits: plain table sources cannot be merged with anything
        // - If current slot has a plain table, start a new slot
        // - If new source is a plain table and current slot has content, start a new slot
        const needsNewSlotForPlainTable =
            currentSlot.isPlainTable ||
            (sourceIsPlainTable && currentSlot.remainingContent);

        const fitsInCurrentSlot =
            !needsNewSlotForPlainTable &&
            canFitInSlot(
                currentSlot.sources,
                currentSlot.firstComments,
                currentSlot.remainingContent,
                source.path,
                source.firstComment,
                remainingContent
            );

        if (fitsInCurrentSlot) {
            // Source fits in current slot
            if (currentSlot.remainingContent) {
                currentSlot.remainingContent += '\n\n' + remainingContent;
            } else {
                currentSlot.remainingContent = remainingContent;
            }
            currentSlot.sources.push(source.path);
            if (source.firstComment) {
                currentSlot.firstComments.push(source.firstComment);
            }
            // Mark slot as plain table if this source is one
            if (sourceIsPlainTable) {
                currentSlot.isPlainTable = true;
            }
        } else {
            // Source doesn't fit or needs isolation - start new slot
            if (currentSlot.remainingContent) {
                slots.push(currentSlot);
            }
            currentSlot = {
                sources: [source.path],
                firstComments: source.firstComment ? [source.firstComment] : [],
                remainingContent,
                isPlainTable: sourceIsPlainTable,
            };
        }
    }

    // Push the last slot
    if (currentSlot.remainingContent) {
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
        const finalMinifiedContent = buildFinalContent(
            slot.sources,
            slot.firstComments,
            slot.remainingContent,
            true
        );
        const encoded = encode(finalMinifiedContent);
        const slotName = formatSlotName(slotType, i);
        const commandString = `!bset ${slotName} ${encoded}`;

        const finalUnminifiedContent = buildFinalContent(
            slot.sources,
            slot.firstComments,
            slot.remainingContent,
            false
        );

        return {
            type: slotType, // 'tweakdefs' or 'tweakunits'
            command: commandString,
            slot: {
                index: i,
                sources: slot.sources,
                content: finalUnminifiedContent,
            },
        };
    });

    return {
        commands,
        slotUsage: { used: slots.length, total: MAX_SLOTS_PER_TYPE },
    };
}
