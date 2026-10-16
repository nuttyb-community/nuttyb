import {
    type Configuration,
    DEFAULT_CONFIGURATION,
} from '@/lib/command-generator/data/configuration';
import { CONFIGURATION_MAPPING } from '@/lib/command-generator/data/configuration-mapping';

export interface ConfigDiff {
    label: string;
    value: string;
}

/**
 * Settings that differ from the defaults, labelled with the mapping
 * descriptions. Shown in the preset popover and form.
 */
export function computeConfigDiff(config: Configuration): ConfigDiff[] {
    const defaultKeys = Object.keys(DEFAULT_CONFIGURATION) as Array<
        keyof typeof DEFAULT_CONFIGURATION
    >;
    return defaultKeys
        .filter((key) => config[key] !== DEFAULT_CONFIGURATION[key])
        .map((key) => {
            const value = config[key];
            return {
                label: CONFIGURATION_MAPPING[key].description,
                value:
                    typeof value === 'boolean'
                        ? value
                            ? 'Enabled'
                            : 'Disabled'
                        : String(value),
            };
        });
}
