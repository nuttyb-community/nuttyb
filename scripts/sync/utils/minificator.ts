import luamin from 'lua-format';

function extractTopComments(content: string) {
    const lines = content.split('\n');
    let out = '';
    for (let i = 0; i < Math.min(3, lines.length); i++) {
        if (/^\s*--.*/.test(lines[i])) out += lines[i] + '\n';
        else break;
    }
    return out;
}

export function minify(lua: string): string {
    // Extract top comments first (first 3 lines starting with --).
    const topComments = extractTopComments(lua);

    // Remove comments from input before minifying to avoid luafmt header inclusion.
    let contentWithoutComments = lua;
    // Remove multi-line block comments: --[[ ... --]].
    contentWithoutComments = contentWithoutComments.replaceAll(
        /--\[\[[\s\S]*?--\]\]/g,
        ''
    );
    // Remove single-line comments entirely.
    contentWithoutComments = contentWithoutComments
        .split('\n')
        .filter((line) => !/^\s*--.*/.test(line))
        .join('\n')
        .trim();

    let minifiedCode = contentWithoutComments;
    try {
        minifiedCode = luamin.Minify(contentWithoutComments, {
            RenameVariables: true,
            RenameGlobals: false,
            SolveMath: true,
        });
    } catch (error) {
        console.error(
            `lua-format minification failed: ${(error as Error).message}, using unminified content`
        );
        minifiedCode = contentWithoutComments;
    }

    // Remove lua-format's own header block if any and trim.
    minifiedCode = minifiedCode.replaceAll(/--\[\[[\s\S]*?--\]\]/g, '').trim();

    // Strip a leading 'return' if present (converter.ts strips it before encoding).
    minifiedCode = minifiedCode.replace(/^return\s*/, '');

    // Compose final output: top comments + processed code.
    return topComments + minifiedCode;
}
