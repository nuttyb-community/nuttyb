import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

import {
    BASE_COMMANDS,
    BASE_TWEAKS,
    CONFIGURATION_MAPPING,
    DEFAULT_LUA_PRIORITY,
    LUA_PRIORITIES,
} from '@/lib/command-generator/data/configuration-mapping';
import type { LuaSource } from '@/lib/command-generator/packer';
import { packLuaSources } from '@/lib/command-generator/packer';
import type { LuaTweakType } from '@/types/types';

/**
 * Build a map from `~lua/<file>.lua` → tweakdefs | tweakunits
 * by scanning BASE_TWEAKS and every value in CONFIGURATION_MAPPING.
 */
function buildClassification(): Map<string, LuaTweakType> {
    const classification = new Map<string, LuaTweakType>();

    function addEntries(
        entries: readonly string[] | undefined,
        type: LuaTweakType
    ) {
        if (!entries) return;
        for (const entry of entries) {
            // Strip template params like {HP_MULTIPLIER=1.3}
            const path = entry.replace(/\{.*\}$/, '');
            if (!classification.has(path)) {
                classification.set(path, type);
            }
        }
    }

    addEntries(BASE_TWEAKS.tweakdefs, 'tweakdefs');
    addEntries(BASE_TWEAKS.tweakunits, 'tweakunits');

    for (const config of Object.values(CONFIGURATION_MAPPING)) {
        for (const mapping of Object.values(config.values)) {
            if (!mapping) continue;
            if ('tweakdefs' in mapping)
                addEntries(mapping.tweakdefs as string[], 'tweakdefs');
            if ('tweakunits' in mapping)
                addEntries(mapping.tweakunits as string[], 'tweakunits');
        }
    }

    return classification;
}

function main() {
    const root = path.join(import.meta.dir, '..', '..');
    const luaDir = path.join(root, 'lua');

    const files = readdirSync(luaDir)
        .filter((f) => f.endsWith('.lua'))
        .toSorted();

    const classification = buildClassification();

    // Build LuaSource arrays for each type, sorted by priority
    const sources: Record<LuaTweakType, LuaSource[]> = {
        tweakdefs: [],
        tweakunits: [],
    };

    for (const file of files) {
        const content = readFileSync(path.join(luaDir, file), 'utf8');
        const ref = `~lua/${file}`;
        const luaPath = `lua/${file}`;
        const type = classification.get(ref) ?? 'tweakunits';
        const priority =
            LUA_PRIORITIES[luaPath] ??
            LUA_PRIORITIES[ref] ??
            DEFAULT_LUA_PRIORITY;

        sources[type].push({ path: ref, content, priority });
    }

    // Sort by priority (ascending — lower loads first)
    for (const type of ['tweakdefs', 'tweakunits'] as const) {
        sources[type] = sources[type].toSorted(
            (a, b) => a.priority - b.priority
        );
    }

    // Pack into slots
    const defsPack = packLuaSources(sources.tweakdefs, 'tweakdefs');
    const unitsPack = packLuaSources(sources.tweakunits, 'tweakunits');

    // === Section 1: Preset Commands ===
    console.log('=== Preset Commands ===\n');
    for (const cmd of BASE_COMMANDS) {
        console.log(cmd);
    }
    console.log();

    // === Section 2: TweakDefs ===
    console.log('=== TweakDefs ===\n');
    for (const cmd of defsPack.commands) {
        console.log(cmd.command);
    }
    console.log();

    // === Section 3: TweakUnits ===
    console.log('=== TweakUnits ===\n');
    for (const cmd of unitsPack.commands) {
        console.log(cmd.command);
    }
}

main();
