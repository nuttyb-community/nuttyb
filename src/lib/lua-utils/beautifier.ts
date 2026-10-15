import luamin from 'lua-format';

/**
 * Beautify Lua code using lua-format.
 * @param lua Code to be beautified
 * @returns Beautified code
 */
export function beautify(lua: string): string {
    let beautifiedCode = lua;
    try {
        beautifiedCode = luamin.Beautify(lua, {
            RenameVariables: false,
            RenameGlobals: false,
            SolveMath: false,
            Indentation: ' '.repeat(4),
        });
    } catch {
        console.warn(
            'Failed to beautify Lua code using lua-format. Returning original code.'
        );
    }

    // Remove lua-format's own header block if any and trim.
    beautifiedCode = beautifiedCode
        .replaceAll(/--\[\[[\s\S]*?--\]\]/g, '')
        .trim();

    return beautifiedCode;
}
