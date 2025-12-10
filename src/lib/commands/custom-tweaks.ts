import type { TweakType } from '../../types/types';
import { decode } from '../base64';

/**
 * Tweak types that can be used for custom Lua tweaks.
 * Excludes 'command' since custom tweaks are Lua code, not raw commands.
 */
export type LuaTweakType = Exclude<TweakType, 'command'>;

export const LUA_TWEAK_TYPES: readonly LuaTweakType[] = [
    'tweakdefs',
    'tweakunits',
] as const;

/**
 * A custom tweak saved by the user.
 */
export interface CustomTweak {
    /** Unique identifier (timestamp-based) */
    id: number;
    /** User-provided description */
    description: string;
    /** Type determines which slot category is used */
    type: LuaTweakType;
    /** Base64URL-encoded Lua code */
    code: string;
}

/**
 * Custom tweak with enabled state for command generation.
 */
export interface EnabledCustomTweak extends CustomTweak {
    enabled: boolean;
}

/**
 * Result of validating a Base64URL-encoded tweak code.
 */
export interface TweakValidationResult {
    valid: boolean;
    /** First line of decoded Lua (usually a comment with tweak name) */
    firstLine?: string;
    /** Error message if validation failed */
    error?: string;
}

/**
 * Maximum numbered slots per tweak type (1-9).
 * Slot 0 is the base slot (e.g., 'tweakdefs'), 1-9 are numbered (e.g., 'tweakdefs1').
 */
const MAX_NUMBERED_SLOTS = 9;

/**
 * Validates a Base64URL-encoded tweak code.
 * Attempts to decode and extract the first line as a preview.
 *
 * @param code Base64URL-encoded Lua code
 * @returns Validation result with decoded first line or error
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

        return {
            valid: true,
            firstLine: firstLine || '(empty first line)',
        };
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

/**
 * Slot usage tracking for tweakdefs and tweakunits.
 */
export interface SlotUsage {
    tweakdefs: Set<number>;
    tweakunits: Set<number>;
}

/**
 * Regex to extract slot type and number from !bset commands.
 * Captures: [1] = type (tweakdefs|tweakunits), [2] = slot number (empty for base slot, 1-9 for numbered)
 */
const BSET_SLOT_REGEX = /!bset\s+(tweakdefs|tweakunits)(\d?)\s/;

/**
 * Calculates which slots are used by existing !bset commands.
 *
 * @param commands Array of command strings to analyze
 * @returns Sets of used slot numbers per type (0 = base slot, 1-9 = numbered slots)
 */
export function calculateUsedSlots(commands: string[]): SlotUsage {
    const usage: SlotUsage = {
        tweakdefs: new Set(),
        tweakunits: new Set(),
    };

    for (const cmd of commands) {
        const match = cmd.match(BSET_SLOT_REGEX);
        if (match) {
            const type = match[1] as LuaTweakType;
            // Empty string means base slot (index 0), otherwise parse the number
            const slotNum = match[2] === '' ? 0 : Number.parseInt(match[2], 10);
            usage[type].add(slotNum);
        }
    }

    return usage;
}

/**
 * Gets the count of available numbered slots (1-9) for a given type.
 *
 * @param usage Current slot usage
 * @param type Tweak type to check
 * @returns Number of available slots (0-9)
 */
export function getAvailableSlotCount(
    usage: SlotUsage,
    type: LuaTweakType
): number {
    let available = 0;
    for (let i = 1; i <= MAX_NUMBERED_SLOTS; i++) {
        if (!usage[type].has(i)) {
            available++;
        }
    }
    return available;
}

/**
 * Finds the first available numbered slot (1-9) for a given type.
 *
 * @param usage Current slot usage
 * @param type Tweak type to check
 * @returns Slot number (1-9) or null if all slots are taken
 */
export function findFirstAvailableSlot(
    usage: SlotUsage,
    type: LuaTweakType
): number | null {
    for (let i = 1; i <= MAX_NUMBERED_SLOTS; i++) {
        if (!usage[type].has(i)) {
            return i;
        }
    }
    return null;
}
