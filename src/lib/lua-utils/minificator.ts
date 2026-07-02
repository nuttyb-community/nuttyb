import luamin from 'lua-format';

import { removeCommentsFromLine } from '@/lib/lua-utils/comment-handler';

/**
 * Minify Lua code using luamin with pre- and post-processing to handle comments.
 * @param lua Code to be minified
 * @returns Minified code
 */
export function minify(lua: string): string {
    // Remove comments from input before minifying to avoid luafmt header inclusion.
    let data = lua;
    // Remove multi-line block comments: --[[ ... --]].
    data = data.replaceAll(/--\[\[[\s\S]*?--\]\]/g, '');

    // Remove single-line comments entirely.
    data = data
        .split('\n')
        .filter((line) => !/^\s*--.*/.test(line))
        .join('\n')
        .trim();

    let minifiedCode = data;
    try {
        minifiedCode = luamin.Minify(data, {
            RenameVariables: true,
            RenameGlobals: false,
            SolveMath: true,
        });
    } catch {
        minifiedCode = minifyNonMinifiable(data);
    }

    // Remove lua-format's own header block if any and trim.
    minifiedCode = minifiedCode.replaceAll(/--\[\[[\s\S]*?--\]\]/g, '').trim();

    // Strip a leading 'return' if present (converter.ts strips it before encoding).
    minifiedCode = minifiedCode.replace(/^return\s*/, '');

    return minifiedCode;
}

/**
 * Last resort minification for code that cannot be minified using standard tools.
 * @param code Code to be minified
 * @returns Minified code
 */
function minifyNonMinifiable(code: string): string {
    if (!code || typeof code !== 'string') {
        return code;
    }

    // First pass: remove comments line by line
    const lines = code.split('\n');
    const processedLines = [];

    for (const line of lines) {
        const processedLine = removeCommentsFromLine(line);
        const trimmed = processedLine.trim();

        if (trimmed) {
            // Only add non-empty lines
            processedLines.push(trimmed);
        }
    }

    // Join compacted lines without separators to minimise output size,
    // inserting one only where direct concatenation would merge tokens:
    // word+word (`or` + `2` → `or2`), `-`+`-` (accidental comment),
    // `.`+`.` (accidental concat/varargs operator).
    let output = '';
    for (const line of processedLines) {
        const compacted = compactWhitespaceInLine(line);
        if (!output) {
            output = compacted;
            continue;
        }

        const prev = output.at(-1) ?? '';
        const next = compacted[0] ?? '';
        const needsSeparator =
            (isKeyword(prev) && isKeyword(next)) ||
            (prev === '-' && next === '-') ||
            (prev === '.' && next === '.');

        output += needsSeparator ? '\n' + compacted : compacted;
    }

    return output.trim();
}

/**
 * Compact whitespace within a single Lua code line
 * Removes spaces around operators, commas, brackets while preserving syntax
 * @param line - Single line of code
 * @returns Line with minimal internal whitespace
 */
function compactWhitespaceInLine(line: string): string {
    let result = '';
    let i = 0;
    let inString = false;
    let stringChar = '';

    while (i < line.length) {
        const ch = line[i];
        const nextCh = i + 1 < line.length ? line[i + 1] : '';
        const prevCh = i > 0 ? line[i - 1] : '';

        // Handle strings - preserve exactly
        if ((ch === '"' || ch === "'") && prevCh !== '\\') {
            if (!inString) {
                inString = true;
                stringChar = ch;
            } else if (ch === stringChar) {
                inString = false;
            }
            result += ch;
            i++;
            continue;
        }

        if (inString) {
            result += ch;
            i++;
            continue;
        }

        // Handle whitespace in normal code
        if (/\s/.test(ch)) {
            // Check if we need a space
            if (isKeyword(prevCh) && isKeyword(nextCh)) {
                // Space between two identifier chars - keep single space
                result += ' ';
                // Skip multiple spaces
                while (
                    i + 1 < line.length &&
                    /\s/.test(line[i + 1]) &&
                    line[i + 1] !== '\n'
                ) {
                    i++;
                }
            } else {
                // Skip unnecessary whitespace
            }
            i++;
            continue;
        }

        // Handle multi-character operators first: ==, ~=, <=, >=, ..
        if (
            (ch === '=' && nextCh === '=') ||
            (ch === '~' && nextCh === '=') ||
            (ch === '<' && nextCh === '=') ||
            (ch === '>' && nextCh === '=') ||
            (ch === '.' && nextCh === '.')
        ) {
            result += ch + nextCh;
            i += 2;
            continue;
        }

        // Handle operators and delimiters
        // These characters never need spaces around them in Lua
        if ('=<>()[]{},.;:#+-*/%^'.includes(ch)) {
            result += ch;
            i++;
            continue;
        }

        // Regular character
        result += ch;
        i++;
    }

    return result;
}

/**
 * Check if token is part of an identifier/keyword
 * @param token - Token to check
 * @returns True if token can be part of identifier
 */
function isKeyword(token: string): boolean {
    if (!token) return false;
    return /[a-zA-Z0-9_]/.test(token);
}
