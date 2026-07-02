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

    test('strips leading and inline comments', () => {
        const code = ['-- header', 'local x = 1 -- trailing', 'print(x)'].join(
            '\n'
        );

        const result = minify(code);

        expect(result).not.toContain('--');
    });
});
