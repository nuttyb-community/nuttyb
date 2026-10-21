import type { TweakValue } from '@/types/types';

import type { Configuration } from '../data/configuration';
import {
    BASE_COMMANDS,
    BASE_TWEAKS,
    CONFIGURATION_MAPPING,
} from '../data/configuration-mapping';

/**
 * Maps configuration settings to expected commands and Lua files.
 * @param configuration Target configuration
 * @returns The list of expected commands and Lua file paths
 */
export function getMappedData(configuration: Configuration): {
    commands: string[];
    tweakunits: string[];
    tweakdefs: string[];
} {
    const commands: string[] = [...BASE_COMMANDS];
    const tweakunits: string[] = [...BASE_TWEAKS.tweakunits];
    const tweakdefs: string[] = [
        ...BASE_TWEAKS.tweakdefs,
        // Numbers can't be value-mapped, so they fill the templates directly
        `lua/raptor-hp.template.lua{HP_MULTIPLIER=${configuration.raptorHpMult}}`,
        `lua/queen-hp.template.lua{HP_MULTIPLIER=${configuration.queenHpMult}}`,
        `lua/builders-t3.template.lua{T3_AIDE_CAP=${configuration.t3AideCap}}`,
        ...(configuration.ecoStyle === 'Evolving'
            ? [`lua/eco-evo.template.lua{MAX_TIER=${configuration.ecoMaxTier}}`]
            : []),
    ];

    for (const configKey in configuration) {
        const configValue = configuration[configKey as keyof Configuration];
        const mapping = CONFIGURATION_MAPPING[configKey as keyof Configuration];
        if (!mapping) continue;
        const tweakValue = mapping.values[
            `${configValue}` as keyof typeof mapping.values
        ] as TweakValue | undefined;

        commands.push(...(tweakValue?.command ?? []));
        tweakunits.push(...(tweakValue?.tweakunits ?? []));
        tweakdefs.push(...(tweakValue?.tweakdefs ?? []));
    }

    return { commands, tweakunits, tweakdefs };
}
