/**
 * Strips the comment prefix (-- and following whitespace) from a Lua comment line.
 * Single-pass operation that trims and removes prefix efficiently.
 *
 * @param line Lua comment line (may include leading/trailing whitespace)
 * @returns Cleaned comment text without -- prefix
 */
export function stripCommentPrefix(line: string): string {
    return line.trim().replace(/^--+\s*/, '');
}

/**
 * Extracts all top comment lines from Lua content before any actual code.
 * Preserves original comment formatting including -- prefix and newlines.
 * Skips and ignores blank lines (before, within, and after comment block).
 *
 * @param content Lua source code
 * @returns All top comment lines (with -- prefix and newlines) or empty string
 */
export function extractTopComments(content: string): string[] {
    const lines = content.split('\n');
    const out: string[] = [];
    let hasFoundComment = false;

    for (const line of lines) {
        const isComment = /^\s*--+/.test(line);
        const isBlank = /^\s*$/.test(line);

        if (isComment) {
            out.push(line);
            hasFoundComment = true;
        } else if (!isBlank && hasFoundComment) {
            // Hit actual code after finding comments - stop
            break;
        }
    }

    return out.filter((line) => line.trim() !== '');
}

/**
 * Remove comments from a single line while preserving code
 * @param line - Single line of code
 * @returns Line with comments removed
 */
export function removeCommentsFromLine(line: string) {
    let result = '';
    let i = 0;
    let inString = false;
    let stringChar = '';

    while (i < line.length) {
        const ch = line[i];
        const nextCh = i + 1 < line.length ? line[i + 1] : '';

        // Handle strings
        if ((ch === '"' || ch === "'") && (i === 0 || line[i - 1] !== '\\')) {
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

        // Handle comments (only if not in string)
        if (!inString && ch === '-' && nextCh === '-') {
            // Rest of line is comment - stop processing
            break;
        }

        result += ch;
        i++;
    }

    return result;
}

/** Pattern for source manifest comments: -- Source: ["path1", "path2"] */
const SOURCE_MANIFEST_PATTERN = /^--\s*Source:\s*(\[.*\])$/;

/**
 * Extracts source manifest comment (-- Source: [...]) from Lua content.
 * These are preserved through minification for debugging/tracing.
 *
 * @param content Lua source code
 * @returns Source manifest comment line or undefined if not found
 */
export function extractSourceManifest(content: string): string | undefined {
    return content
        .split('\n')
        .find((line) => SOURCE_MANIFEST_PATTERN.test(line.trim()));
}

/**
 * Parses source paths from a source manifest comment.
 * @param line Line containing -- Source: ["path1", "path2"]
 * @returns Array of source paths or empty array if parsing fails
 */
export function parseSourceManifest(line: string): string[] {
    const match = line.trim().match(SOURCE_MANIFEST_PATTERN);
    if (!match) return [];

    try {
        return JSON.parse(match[1]) as string[];
    } catch {
        return [];
    }
}
