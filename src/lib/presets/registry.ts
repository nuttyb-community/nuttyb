import { Configuration } from '@/lib/command-generator/data/configuration';
import type { LuaTweakType } from '@/types/types';

export interface PresetTweak {
    description: string;
    type: LuaTweakType;
    path: string;
    replaces?: string | string[];
}

export interface Preset {
    id: string;
    name: string;
    description: string;
    icon: string;
    configuration: Configuration;
    presetTweaks?: PresetTweak[];
    isBuiltIn?: boolean;
}
