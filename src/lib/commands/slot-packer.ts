import { encode } from '../base64';
import type { EnabledCustomTweak, SlotUsage } from './custom-tweaks';
import { calculateUsedSlots, findFirstAvailableSlot } from './custom-tweaks';
import {
    MAX_COMMAND_LENGTH,
    MAX_SLOTS_PER_TYPE,
} from '../data/configuration-mapping';

/**
 * Assigns each Lua source to its own sequential slot.
 *
 * Slot naming: slotType, slotType1, slotType2, ..., slotType9
 * (e.g., tweakdefs, tweakdefs1, tweakdefs2, ..., tweakdefs9)
 *
 * @param luaSources Array of raw Lua source strings to assign
 * @param slotType Either 'tweakdefs' or 'tweakunits'
 * @returns Array of `!bset` commands
 * @throws Error if number of sources exceeds slot limit (10)
 * @throws Error if single Lua source exceeds command length limit
 */
export function packLuaSourcesIntoSlots(
    luaSources: string[],
    slotType: 'tweakdefs' | 'tweakunits'
): string[] {
    if (luaSources.length === 0) {
        return [];
    }

    // Check slot limit upfront
    if (luaSources.length > MAX_SLOTS_PER_TYPE) {
        throw new Error(
            `Too many ${slotType} sources (${luaSources.length}). ` +
                `Maximum is ${MAX_SLOTS_PER_TYPE} slots.`
        );
    }

    const commands: string[] = [];

    let slotIndex = 0;
    for (const luaSource of luaSources) {
        const encoded = encode(luaSource);
        const slotName = slotIndex === 0 ? slotType : `${slotType}${slotIndex}`;
        const command = `!bset ${slotName} ${encoded}`;

        // Check command length limit
        if (command.length > MAX_COMMAND_LENGTH) {
            console.error(
                `CRITICAL: ${slotType} Lua source at slot ${slotIndex} exceeds MAX_COMMAND_LENGTH!\n` +
                    `Command is ${command.length} chars, limit is ${MAX_COMMAND_LENGTH}.`
            );
            throw new Error(
                `${slotType} Lua source at slot ${slotIndex} exceeds ${MAX_COMMAND_LENGTH} char limit (${command.length} chars)`
            );
        }

        commands.push(command);
        slotIndex++;
    }

    return commands;
}

/**
 * Allocates slots for custom tweaks and generates !bset commands.
 *
 * Custom tweaks are pre-encoded Base64URL strings, so we just need to
 * find available slots and generate the appropriate commands.
 *
 * @param existingCommands Array of existing !bset commands to analyze for used slots
 * @param customTweaks Optional array of enabled custom tweaks
 * @returns Array of !bset commands for custom tweaks
 */
export function allocateCustomTweakSlots(
    existingCommands: string[],
    customTweaks?: EnabledCustomTweak[]
): string[] {
    if (!customTweaks || customTweaks.length === 0) {
        return [];
    }

    // Calculate which slots are already used by standard tweaks
    const slotUsage: SlotUsage = calculateUsedSlots(existingCommands);

    const customCommands: string[] = [];

    for (const tweak of customTweaks) {
        const slot = findFirstAvailableSlot(slotUsage, tweak.type);

        if (slot === null) {
            console.warn(
                `No available slot for custom tweak "${tweak.description}" (${tweak.type}). All slots are occupied.`
            );
            continue;
        }

        // Mark slot as used for subsequent iterations
        slotUsage[tweak.type].add(slot);

        // Generate the !bset command
        // Custom tweaks are already Base64URL encoded
        const slotName = `${tweak.type}${slot}`;
        const command = `!bset ${slotName} ${tweak.code}`;
        customCommands.push(command);
    }

    return customCommands;
}
