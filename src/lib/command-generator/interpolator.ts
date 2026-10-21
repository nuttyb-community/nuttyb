/**
 * Template interpolation for Lua file references.
 *
 * Supports syntax: lua/file.lua{VAR1=value1,VAR2=value2}
 * Replaces TPL_VARIABLE placeholders in templates with provided values.
 * A legacy `~` prefix on references is tolerated and stripped.
 */

export interface ParsedReference {
    filePath: string;
    variables: Record<string, string>;
}

/**
 * Parses a Lua file reference into path and variables.
 *
 * @param ref Reference string (e.g., 'lua/raptor-hp.template.lua{HP_MULTIPLIER=1.5}')
 * @returns Parsed components or null if invalid
 *
 * @example
 * parseReference('lua/raptor-hp.template.lua{HP_MULTIPLIER=1.5}')
 * // { filePath: 'lua/raptor-hp.template.lua', variables: { HP_MULTIPLIER: '1.5' } }
 *
 * parseReference('lua/main-defs.lua')
 * // { filePath: 'lua/main-defs.lua', variables: {} }
 */
function parseReference(ref: string): ParsedReference | null {
    // Match: path/to/file.lua{VAR1=val1,VAR2=val2} (legacy ~ prefix tolerated)
    const match = ref.match(/^~?([^{]+)(?:\{([^}]+)\})?$/);
    if (!match) {
        console.warn(`Malformed Lua reference syntax: ${ref}`);
        return null;
    }

    const filePath = match[1];
    const variablesString = match[2];
    const variables: Record<string, string> = {};

    if (variablesString) {
        for (const pair of variablesString.split(',')) {
            const [key, value] = pair.split('=').map((s) => s.trim());
            if (!key || value === undefined) {
                console.warn(
                    `Invalid variable pair in reference ${ref}: "${pair}"`
                );
                continue;
            }
            variables[key] = value;
        }
    }

    return { filePath, variables };
}

/**
 * Interpolates TPL_VARIABLE placeholders with values.
 *
 * Placeholders are plain Lua identifiers so templates stay parseable by the
 * linter. Each provided name is replaced literally (not via a word regex), so
 * a placeholder glued to text in a comment (`TPL_HP_MULTIPLIERX`) still works.
 *
 * @param template Template string with TPL_PLACEHOLDER markers
 * @param variables Variable name (without TPL_ prefix) to value mapping
 * @returns Interpolated string
 */
function interpolateTemplate(
    template: string,
    variables: Record<string, string>
): string {
    let result = template;
    const unused: string[] = [];

    for (const [name, value] of Object.entries(variables)) {
        const placeholder = `TPL_${name}`;
        if (!result.includes(placeholder)) {
            unused.push(name);
        }
        result = result.replaceAll(placeholder, value);
    }

    // Warn about unused variables (potential typos)
    if (unused.length > 0) {
        console.warn(
            `Template variables provided but not used: ${unused.join(', ')}`
        );
    }

    for (const leftover of result.match(/TPL_\w+/g) ?? []) {
        console.warn(`Undefined template variable: ${leftover}`);
    }

    return result;
}

/**
 * Resolves a Lua file reference with optional variable interpolation.
 *
 * @param ref Lua file reference (e.g., 'lua/foo.template.lua{VAR=value}')
 * @param luaFileMap Map of file paths to Lua source code
 * @returns Resolved Lua source code
 * @throws Error if reference is invalid or file not found
 *
 * @example
 * resolveLuaReference('lua/raptor-hp.template.lua{HP_MULTIPLIER=1.5}', luaFileMap)
 */
export function resolveLuaReference(
    ref: string,
    luaFileMap: Map<string, string>
): string {
    const parsed = parseReference(ref);
    if (!parsed) {
        throw new Error(`Failed to parse Lua reference: ${ref}`);
    }

    const { filePath, variables } = parsed;
    const template = luaFileMap.get(filePath);

    if (!template) {
        throw new Error(
            `Lua file not found in bundle: ${filePath} (from: ${ref})`
        );
    }

    return interpolateTemplate(template, variables);
}
