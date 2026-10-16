import type { Configuration } from '@/lib/command-generator/data/configuration';
import { sanitizeConfiguration } from '@/lib/configuration-storage/storage';

import type { Preset, PresetTweak } from './registry';
import { isValidTweakUrl } from './tweak-url';

/** An imported preset file, checked before it fills the preset form. */
export interface ImportedPreset {
    name: string;
    description: string;
    /** Missing when the file has no settings; the form keeps its own then */
    configuration?: Configuration;
    presetTweaks: PresetTweak[];
}

/** Parses an exported preset JSON file, or says why it can't be imported. */
export function parsePresetFile(
    text: string
): { preset: ImportedPreset } | { error: string } {
    try {
        const parsed = JSON.parse(text) as Partial<Preset>;
        if (!parsed.name || typeof parsed.name !== 'string') {
            return {
                error: 'The file has no preset name, so it is not a preset.',
            };
        }

        const presetTweaks = Array.isArray(parsed.presetTweaks)
            ? parsed.presetTweaks
            : [];
        if (presetTweaks.some((t) => t.path && !isValidTweakUrl(t.path))) {
            return {
                error: 'The preset loads scripts from hosts other than GitHub, which are not allowed.',
            };
        }

        return {
            preset: {
                name: parsed.name,
                description: parsed.description ?? '',
                configuration:
                    parsed.configuration &&
                    typeof parsed.configuration === 'object'
                        ? sanitizeConfiguration(parsed.configuration)
                        : undefined,
                presetTweaks,
            },
        };
    } catch {
        return { error: 'The file is not valid JSON.' };
    }
}
