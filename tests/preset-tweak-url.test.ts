import { describe, expect, test } from 'bun:test';

import {
    isAllowedRemoteTweakUrl,
    isValidTweakUrl,
} from '@/lib/presets/tweak-url';

describe('isAllowedRemoteTweakUrl (fetch boundary)', () => {
    test('allows whitelisted GitHub raw/gist https hosts', () => {
        expect(
            isAllowedRemoteTweakUrl(
                'https://raw.githubusercontent.com/owner/repo/main/tweak.lua'
            )
        ).toBe(true);
        expect(
            isAllowedRemoteTweakUrl(
                'https://gist.githubusercontent.com/owner/abc/raw/tweak.lua'
            )
        ).toBe(true);
    });

    test('rejects non-whitelisted hosts, http, and non-URLs', () => {
        expect(
            isAllowedRemoteTweakUrl('https://evil.example.com/tweak.lua')
        ).toBe(false);
        // http is never allowed, even on a whitelisted host
        expect(
            isAllowedRemoteTweakUrl(
                'http://raw.githubusercontent.com/owner/repo/main/tweak.lua'
            )
        ).toBe(false);
        // look-alike host must not pass
        expect(
            isAllowedRemoteTweakUrl(
                'https://raw.githubusercontent.com.evil.com/tweak.lua'
            )
        ).toBe(false);
        expect(isAllowedRemoteTweakUrl('not a url')).toBe(false);
        expect(isAllowedRemoteTweakUrl('lua/main-defs.lua')).toBe(false);
    });
});

describe('isValidTweakUrl (UI input)', () => {
    test('accepts local bundled paths', () => {
        expect(isValidTweakUrl('lua/main-defs.lua')).toBe(true);
        expect(isValidTweakUrl('')).toBe(true);
    });

    test('accepts whitelisted https hosts and rejects everything else remote', () => {
        expect(
            isValidTweakUrl(
                'https://raw.githubusercontent.com/owner/repo/main/tweak.lua'
            )
        ).toBe(true);
        expect(isValidTweakUrl('https://evil.example.com/tweak.lua')).toBe(
            false
        );
        expect(isValidTweakUrl('http://example.com/tweak.lua')).toBe(false);
    });
});
