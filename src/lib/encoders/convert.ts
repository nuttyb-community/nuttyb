import { beautify } from '@/lib/lua-utils/beautifier';
import { minify } from '@/lib/lua-utils/minificator';

import { decode, encode } from './base64';

export const CONVERT_MODES = ['encode', 'decode'] as const;
export type ConvertMode = (typeof CONVERT_MODES)[number];

/**
 * Encodes Lua to Base64URL or decodes it back. The formatter minifies Lua
 * before encoding, or formats it after decoding. Decoding throws on anything
 * that isn't Base64URL; that becomes an error.
 */
export function convertLua(
    input: string,
    mode: ConvertMode,
    isFormatterEnabled: boolean
): { output: string; error?: string } {
    if (!input.trim()) return { output: '' };
    if (mode === 'encode')
        return { output: encode(isFormatterEnabled ? minify(input) : input) };

    try {
        const decoded = decode(input.trim());
        return { output: isFormatterEnabled ? beautify(decoded) : decoded };
    } catch {
        return {
            output: '',
            error: "This isn't Base64URL. To encode Lua, switch to Encode.",
        };
    }
}
