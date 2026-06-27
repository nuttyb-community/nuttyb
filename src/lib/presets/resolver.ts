import type { EnabledCustomTweak } from '@/lib/command-generator/command-generator';
import { encode } from '@/lib/encoders/base64';

import type { Preset, PresetTweak } from './registry';

interface FileLike {
    path: string;
    data: string;
}

/** Builds a resolved EnabledCustomTweak from a preset tweak definition. */
function buildTweak(
    tweak: PresetTweak,
    index: number,
    code: string
): EnabledCustomTweak {
    return {
        id: -(index + 1), // Negative IDs for transient preset tweaks
        description: tweak.description,
        type: tweak.type,
        code,
        priority: index,
        enabled: true,
        replaces: tweak.replaces,
    };
}

/**
 * Resolves active preset tweaks from file paths and remote URLs.
 *
 * @param preset The preset to resolve tweaks for
 * @param luaFiles The list of bundled Lua files
 * @param remoteFiles Cached remote file contents (key is URL, value is file content)
 * @returns Array of resolved EnabledCustomTweak objects
 */
export function resolvePresetTweaks(
    preset: Preset,
    luaFiles: FileLike[],
    remoteFiles: Record<string, string> = {}
): EnabledCustomTweak[] {
    const tweaksToResolve = preset.presetTweaks || [];

    return tweaksToResolve
        .map((tweak, index): EnabledCustomTweak | null => {
            if (tweak.path.startsWith('https://')) {
                const content = remoteFiles[tweak.path];
                return content
                    ? buildTweak(tweak, index, encode(content))
                    : null;
            }

            const file = luaFiles.find((f) => f.path === tweak.path);
            return file ? buildTweak(tweak, index, encode(file.data)) : null;
        })
        .filter((t): t is EnabledCustomTweak => t !== null);
}
