import { useMemo } from 'react';

import type { EnabledCustomTweak } from '@/lib/command-generator/command-generator';
import { getMappedData } from '@/lib/command-generator/configuration/mapper';
import type { Configuration } from '@/lib/command-generator/data/configuration';
import {
    DEFAULT_LUA_PRIORITY,
    LUA_PRIORITIES,
} from '@/lib/command-generator/data/configuration-mapping';
import { resolveLuaReference } from '@/lib/command-generator/interpolator';
import { type LuaSource, packLuaSources } from '@/lib/command-generator/packer';
import { formatSlotName } from '@/lib/command-generator/slot';
import { decode } from '@/lib/encoders/base64';
import { beautify } from '@/lib/lua-utils/beautifier';
import type { LuaFile, LuaTweakType } from '@/types/types';

export interface SlotContent {
    slotName: string;
    type: LuaTweakType;
    sources: string[];
    content: string;
}

function getLuaPriority(path: string): number {
    const clean = path.replace(/^~/, '').replace(/\{[^}]*\}$/, '');
    return LUA_PRIORITIES[clean] ?? DEFAULT_LUA_PRIORITY;
}

/**
 * Computes slot content using the same packing logic as the command generator.
 */
function computeSlotContent(
    luaFileMap: Map<string, string>,
    paths: string[],
    slotType: LuaTweakType,
    enabledCustomTweaks: EnabledCustomTweak[]
): SlotContent[] {
    if (paths.length === 0 && enabledCustomTweaks.length === 0) return [];

    const slots: SlotContent[] = [];

    // First, add slots from packed sources (slot 0)
    if (paths.length > 0) {
        const sources: LuaSource[] = paths.map((originalRef) => ({
            path: originalRef,
            content: resolveLuaReference(originalRef, luaFileMap).trim(),
            priority: getLuaPriority(originalRef),
        }));
        sources.sort((a, b) => a.priority - b.priority);

        const { commands } = packLuaSources(sources, slotType);

        for (const command of commands) {
            const parts = command.split(' ');
            const slotName = parts[1];
            const encodedContent = parts[2];

            const decoded = decode(encodedContent);
            const manifestMatch = decoded.match(/^-- Source: (\[.*?\])\n/);
            const sourcePaths: string[] = manifestMatch
                ? (JSON.parse(manifestMatch[1]) as string[])
                : [];

            const originalContents = sourcePaths
                .map((path) => {
                    const source = sources.find((s) => s.path === path);
                    return source?.content ?? '';
                })
                .filter(Boolean);

            const manifest = `-- Source: ${JSON.stringify(sourcePaths)}`;
            const content = `${manifest}\n${originalContents.join('\n\n')}`;

            slots.push({
                slotName,
                type: slotType,
                sources: sourcePaths,
                content,
            });
        }
    }

    // Add custom tweaks (slots 1-9)
    const customTweaksOfType = enabledCustomTweaks.filter(
        (t) => t.type === slotType
    );

    const usedSlots = new Set<number>();
    for (const slot of slots) {
        const match = slot.slotName.match(/\d+$/);
        if (match) {
            usedSlots.add(Number.parseInt(match[0], 10));
        }
    }

    for (const tweak of customTweaksOfType) {
        let slotNumber: number | null = null;
        for (let i = 1; i <= 9; i++) {
            if (!usedSlots.has(i)) {
                slotNumber = i;
                break;
            }
        }

        if (slotNumber === null) continue;

        usedSlots.add(slotNumber);

        try {
            const decoded = beautify(decode(tweak.code));
            const manifest = `-- Custom Tweak: ${tweak.description}`;
            const content = `${manifest}\n${decoded}`;
            const slotName = formatSlotName(slotType, slotNumber);

            slots.push({
                slotName,
                type: slotType,
                sources: [`custom:${tweak.description}`],
                content,
            });
        } catch {
            // Skip tweaks that fail to decode
        }
    }

    return slots;
}

export function useSlotContent(
    luaFiles: LuaFile[],
    configuration: Configuration,
    enabledCustomTweaks: EnabledCustomTweak[]
) {
    return useMemo(() => {
        const luaFileMap = new Map(luaFiles.map((f) => [f.path, f.data]));
        const { tweakdefs: defsPaths, tweakunits: unitsPaths } =
            getMappedData(configuration);

        const tweakdefsSlots = computeSlotContent(
            luaFileMap,
            defsPaths,
            'tweakdefs',
            enabledCustomTweaks
        );
        const tweakunitsSlots = computeSlotContent(
            luaFileMap,
            unitsPaths,
            'tweakunits',
            enabledCustomTweaks
        );

        return [...tweakdefsSlots, ...tweakunitsSlots];
    }, [luaFiles, configuration, enabledCustomTweaks]);
}
