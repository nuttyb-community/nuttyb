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
export function extractTopComments(content: string): string {
    const lines = content.split('\n');
    let out = '';
    let hasFoundComment = false;

    for (const line of lines) {
        const isComment = /^\s*--+/.test(line);
        const isBlank = /^\s*$/.test(line);

        if (isComment) {
            out += line + '\n';
            hasFoundComment = true;
        } else if (!isBlank && hasFoundComment) {
            // Hit actual code after finding comments - stop
            break;
        }
        // Skip blank lines (before, within, and after comment block)
    }

    return out;
}
