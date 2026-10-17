/**
 * Checks Base64 encoding and decoding functionality.
 */

import { describe, expect, test } from 'bun:test';

import { decode, encode } from '@/lib/encoders/base64';
import { convertLua } from '@/lib/encoders/convert';

const TEST_STRING =
    'The quick brown fox jumps over the lazy dog. 1234567890!@#$%^&*()_+-=[]{}|;:\'",.<>/?`~';

describe('Base64 Encoding/Decoding', () => {
    test('Encoder produces Base64 without padding', () => {
        const encoded = encode(TEST_STRING);
        expect(encoded).toBeDefined();
        expect(encoded).toBeString();
        expect(encoded.endsWith('=')).toBeFalse();
    });

    test('Decoder produces original string', () => {
        const encoded = encode(TEST_STRING);
        const decoded = decode(encoded);
        expect(decoded).toBe(TEST_STRING);
    });
});

describe('convertLua', () => {
    test('round-trips Lua and reports input that is not Base64URL', () => {
        const lua = 'local x = 1';
        const { output: encoded } = convertLua(lua, 'encode', false);

        expect(convertLua(encoded, 'decode', false)).toEqual({ output: lua });
        expect(convertLua('  ', 'decode', true)).toEqual({ output: '' });
        expect(convertLua('not base64 !!', 'decode', false)).toHaveProperty(
            'error'
        );
    });
});
