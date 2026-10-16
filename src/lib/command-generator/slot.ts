import { LuaTweakType } from '@/types/types';

/**
 * Formats slot name for custom tweaks.
 * Slot 0 is the bare type name; the rest are numbered (tweakdefs1, ...).
 */
export function formatSlotName(type: LuaTweakType, slotNumber: number): string {
    return slotNumber === 0 ? type : `${type}${slotNumber}`;
}
