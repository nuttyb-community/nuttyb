import { useMemo } from 'react';

import {
    type EnabledCustomTweak,
    generateCommands,
} from '@/lib/command-generator/command-generator';
import type { Configuration } from '@/lib/command-generator/data/configuration';
import { formatSlotName } from '@/lib/command-generator/slot';
import type { LuaFile, LuaTweakType } from '@/types/types';

export interface SlotContent {
    slotName: string;
    type: LuaTweakType;
    sources: string[];
    content: string;
}

/**
 * Hook to extract slot content from command generation result
 */
export function useSlotContent(
    luaFiles: LuaFile[],
    configuration: Configuration,
    enabledCustomTweaks: EnabledCustomTweak[]
): SlotContent[] {
    return useMemo(() => {
        if (luaFiles.length === 0) return [];

        const result = generateCommands(
            configuration,
            luaFiles,
            enabledCustomTweaks
        );

        // Extract all commands with slot info (tweakdefs/tweakunits only)
        return result.chunks
            .flatMap((chunk) => chunk.commands)
            .filter((cmd) => cmd.slot !== undefined)
            .map((cmd) => ({
                slotName: formatSlotName(
                    cmd.type as LuaTweakType,
                    cmd.slot!.index
                ),
                type: cmd.type as LuaTweakType,
                sources: cmd.slot!.sources,
                content: cmd.slot!.content,
            }));
    }, [luaFiles, configuration, enabledCustomTweaks]);
}
