/**
 * Tests for Lua minification utilities.
 */

import { describe, expect, test } from 'bun:test';

import { minify } from '@/lib/lua-utils/minificator';

describe('minify', () => {
    test('does not merge tokens across lines in the non-minifiable fallback path', () => {
        const code = [
            '{',
            '    foo = 1 or',
            '    2,',
            '    bar = 3,',
            '}',
        ].join('\n');

        const result = minify(code);

        expect(result).not.toContain('or2');
        expect(result).toContain('foo');
        expect(result).toContain('bar');
    });

    test('minifies normal Lua code without throwing', () => {
        const result = minify('do\n    local x = 1\n    print(x)\nend');

        expect(result.length).toBeGreaterThan(0);
        expect(result).not.toMatch(/--/);
    });

    test('keeps negative numbers apart from the next keyword', () => {
        const code = [
            'for i = 10, 1, -1 do print(i) end',
            'local x = -1 if x == -1 then end',
            'local function f() return -1 end',
            'local y = x or -2 and z',
        ].join('\n');

        const result = minify(code);

        expect(result).not.toMatch(/\d(do|if|then|end|and)\b/);
    });

    test('leaves numbers inside strings alone', () => {
        const result = minify("local s = '-1do' print(s, -1)");

        expect(result).toContain("'-1do'");
    });

    test('strips leading and inline comments', () => {
        const code = ['-- header', 'local x = 1 -- trailing', 'print(x)'].join(
            '\n'
        );

        const result = minify(code);

        expect(result).not.toContain('--');
    });
});
