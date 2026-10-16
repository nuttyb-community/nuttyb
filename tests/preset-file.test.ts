import { describe, expect, test } from 'bun:test';

import { DEFAULT_CONFIGURATION } from '@/lib/command-generator/data/configuration';
import { parsePresetFile } from '@/lib/presets/preset-file';

describe('parsePresetFile', () => {
    test('reads a valid preset and sanitizes its settings', () => {
        const result = parsePresetFile(
            JSON.stringify({
                name: 'Mine',
                configuration: { queenCount: 6, unknownKey: true },
                presetTweaks: [
                    {
                        description: 'T3 eco',
                        type: 'tweakdefs',
                        path: 'lua/eco-t3.lua',
                    },
                ],
            })
        );

        expect(result).toEqual({
            preset: {
                name: 'Mine',
                description: '',
                configuration: { ...DEFAULT_CONFIGURATION, queenCount: 6 },
                presetTweaks: [
                    {
                        description: 'T3 eco',
                        type: 'tweakdefs',
                        path: 'lua/eco-t3.lua',
                    },
                ],
            },
        });
    });

    test('rejects broken JSON, nameless files and untrusted hosts', () => {
        expect(parsePresetFile('{')).toEqual({
            error: 'The file is not valid JSON.',
        });
        expect(parsePresetFile('{}')).toHaveProperty('error');
        expect(
            parsePresetFile(
                JSON.stringify({
                    name: 'Evil',
                    presetTweaks: [{ path: 'https://evil.example.com/x.lua' }],
                })
            )
        ).toHaveProperty('error');
    });
});
