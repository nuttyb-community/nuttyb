'use client';

import { useMemo } from 'react';

import type { DroppedTweak } from '@/components/contexts/tweak-data-context';
import {
    type EnabledCustomTweak,
    generateCommands,
} from '@/lib/command-generator/command-generator';
import { MAX_SLOTS_PER_TYPE } from '@/lib/command-generator/constants';
import type { Configuration } from '@/lib/command-generator/data/configuration';
import type { LuaFile } from '@/types/types';

export interface UseTweakDataReturn {
    sections: string[];
    slotUsage?: {
        tweakdefs: { used: number; total: number };
        tweakunits: { used: number; total: number };
    };
    error?: string;
    droppedTweaks: DroppedTweak[];
}

export function useTweakData(
    configuration: Configuration,
    luaFiles: LuaFile[],
    enabledCustomTweaks?: EnabledCustomTweak[]
): UseTweakDataReturn {
    const result = useMemo<UseTweakDataReturn>(() => {
        if (luaFiles.length === 0) {
            return { sections: [], droppedTweaks: [] };
        }

        try {
            const result = generateCommands(
                configuration,
                luaFiles,
                enabledCustomTweaks
            );

            // Derive sections from structured chunks
            const sections = result.chunks.map((chunk) =>
                chunk.commands.map((cmd) => cmd.command).join('\n')
            );

            // Transform business type to display type
            const droppedTweaks: DroppedTweak[] =
                result.droppedCustomTweaks.map((tweak) => ({
                    description: tweak.description,
                    type: tweak.type,
                }));

            return {
                sections,
                slotUsage: {
                    tweakdefs: {
                        used: result.slotUsage.tweakdefs,
                        total: MAX_SLOTS_PER_TYPE,
                    },
                    tweakunits: {
                        used: result.slotUsage.tweakunits,
                        total: MAX_SLOTS_PER_TYPE,
                    },
                },
                droppedTweaks,
            };
        } catch (error) {
            console.error('[useTweakData] Failed to build commands:', error);
            return {
                sections: [],
                droppedTweaks: [],
                error:
                    error instanceof Error
                        ? error.message
                        : 'Failed to generate commands',
            };
        }
    }, [configuration, luaFiles, enabledCustomTweaks]);

    return result;
}
