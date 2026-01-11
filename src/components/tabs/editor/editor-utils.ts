/**
 * Editor-specific utilities for processing Lua content.
 * Combines minification (with graceful fallback) and base64 encoding.
 */

import { encode } from '@/lib/encoders/base64';
import { minify } from '@/lib/lua-utils/minificator';

/**
 * Result of processing Lua content with minification and encoding.
 */
interface ProcessedLuaContent {
    /** Minified Lua code (or original if minification failed) */
    minified: string;
    /** Base64 encoded minified content */
    encoded: string;
    /** Byte length of encoded string */
    size: number;
}

/**
 * Attempts to minify Lua content with graceful fallback.
 */
function minifyWithFallback(content: string): string {
    try {
        return minify(content);
    } catch {
        // If minification fails, return original content
        // This ensures encoding can still proceed
        return content;
    }
}

/**
 * Processes Lua content by minifying (with fallback) and encoding to base64.
 * Used internally by convenience functions.
 */
function processLuaContent(content: string): ProcessedLuaContent {
    const trimmed = content.trim();
    const minified = minifyWithFallback(trimmed);
    const encoded = encode(minified);

    return {
        minified,
        encoded,
        size: encoded.length,
    };
}

/**
 * Encodes Lua content to base64 after attempting minification.
 *
 * If minification fails, encodes the original content.
 * Content is trimmed before processing.
 *
 * @param content - Raw Lua code to encode
 * @returns Base64 encoded string
 */
export function encodeMinified(content: string): string {
    return processLuaContent(content).encoded;
}

/**
 * Calculates the byte size of Lua content after minification and encoding.
 *
 * Useful for validating against size limits (e.g., slot capacity).
 * If minification fails, calculates size of encoded original content.
 *
 * @param content - Raw Lua code to measure
 * @returns Size in bytes after encoding
 */
export function calculateEncodedSize(content: string): number {
    return processLuaContent(content).size;
}
