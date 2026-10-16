import { Configuration } from '@/lib/command-generator/data/configuration';
import type { LuaTweakType } from '@/types/types';

export interface PresetTweak {
    description: string;
    type: LuaTweakType;
    path: string;
    replaces?: string | string[];
}

/** Showcase availability of a preset. Disabled presets stay in the bundle
 *  but are hidden from the UI and cannot be selected. */
export type PresetStatus = 'enabled' | 'disabled';

export interface Preset {
    id: string;
    name: string;
    description: string;
    configuration: Configuration;
    presetTweaks?: PresetTweak[];
    /** Presets without a status default to enabled. */
    status?: PresetStatus;
    isBuiltIn?: boolean;
}

/** Parses an untrusted status value from preset JSON, defaulting to enabled. */
export function parsePresetStatus(value: unknown): PresetStatus {
    return value === 'disabled' ? 'disabled' : 'enabled';
}
