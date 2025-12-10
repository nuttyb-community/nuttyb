'use client';

import { useMemo } from 'react';

import { buildLobbySections } from '@/lib/commands/command-builder';
import type { EnabledCustomTweak } from '@/lib/commands/custom-tweaks';
import type { Configuration } from '@/lib/configuration';
import type { LuaFile } from '@/types/types';

export interface UseTweakDataReturn {
    sections: string[];
}

export function useTweakData(
    configuration: Configuration,
    luaFiles: LuaFile[],
    enabledCustomTweaks?: EnabledCustomTweak[]
): UseTweakDataReturn {
    const sections = useMemo(() => {
        if (luaFiles.length === 0) {
            return [];
        }

        return buildLobbySections(configuration, luaFiles, enabledCustomTweaks);
    }, [configuration, luaFiles, enabledCustomTweaks]);

    return { sections };
}
