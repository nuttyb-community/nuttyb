/**
 * Command template interpolation for lobby commands.
 *
 * Supports templates embedded in BASE_COMMANDS or other command arrays.
 * Templates are auto-detected by the presence of $variable$ placeholders.
 *
 * Syntax:
 * - $variable$ : Required variable, replaced with value (error if empty)
 * - $?content?$ : Optional section, removed entirely if any $variable$ inside is empty
 *
 * @example
 * // Template: '!rename Community NuttyB [$presetDifficulty$] $?[$lobbyName$]?$'
 * //
 * // With { presetDifficulty: 'Medium', lobbyName: 'My Game' }
 * // -> '!rename Community NuttyB [Medium] [My Game]'
 * //
 * // With { presetDifficulty: 'Medium', lobbyName: '' }
 * // -> '!rename Community NuttyB [Medium]'
 */

import type { Configuration } from './data/configuration';

export type TemplateContext = Record<string, string>;

/** Pattern to detect $variable$ placeholders */
const VARIABLE_PATTERN = /\$(\w+)\$/;

/**
 * Checks if a command string contains template placeholders.
 *
 * @param command Command string to check
 * @returns True if the command contains $variable$ patterns
 */
export function isCommandTemplate(command: string): boolean {
    return VARIABLE_PATTERN.test(command);
}

/** Pattern for optional sections: $?content?$ (non-greedy match until ?$) */
const OPTIONAL_SECTION_PATTERN = /\$\?(.*?)\?\$/g;

/** Pattern for variable replacement: $variable$ */
const VARIABLE_REPLACE_PATTERN = /\$(\w+)\$/g;

/**
 * Processes optional sections in a template.
 * Removes sections where any variable is empty/undefined.
 *
 * @param template Template string with optional sections
 * @param context Variable values
 * @returns Template with optional sections resolved
 */
function processOptionalSections(
    template: string,
    context: TemplateContext
): string {
    return template.replaceAll(
        OPTIONAL_SECTION_PATTERN,
        (_match: string, content: string) => {
            // Find all variables in this section
            const matches = content.matchAll(VARIABLE_REPLACE_PATTERN);
            const variables = [...matches].map((m) => m[1]);

            // Check if all variables have non-empty values
            const allPresent = variables.every((varName) => {
                const value = context[varName];
                return value !== undefined && value !== '';
            });

            if (allPresent) {
                // Keep section content with variables replaced
                return content.replaceAll(
                    VARIABLE_REPLACE_PATTERN,
                    (_m: string, varName: string) => context[varName] ?? ''
                );
            }

            // Remove entire section
            return '';
        }
    );
}

/**
 * Replaces required variables in a template.
 * Throws if any variable is missing or empty.
 *
 * @param template Template string with variables
 * @param context Variable values
 * @returns Template with variables replaced
 * @throws Error if a required variable is empty or missing
 */
function replaceRequiredVariables(
    template: string,
    context: TemplateContext
): string {
    return template.replaceAll(
        VARIABLE_REPLACE_PATTERN,
        (match: string, varName: string) => {
            const value = context[varName];

            if (value === undefined || value === '') {
                throw new Error(
                    `Required template variable is empty or missing: ${varName}`
                );
            }

            return value;
        }
    );
}

/**
 * Interpolates a command template with provided values.
 *
 * @param template Template string with $variable$ placeholders
 * @param context Variable values to substitute
 * @returns Interpolated command string
 * @throws Error if a required variable is missing or empty
 *
 * @example
 * interpolateCommandTemplate(
 *     '!rename Community NuttyB [$presetDifficulty$] $?[$lobbyName$]?$',
 *     { presetDifficulty: 'Medium', lobbyName: '' }
 * )
 * // Returns: '!rename Community NuttyB [Medium]'
 */
export function interpolateCommandTemplate(
    template: string,
    context: TemplateContext
): string {
    // 1. Process optional sections first (they handle their own variable replacement)
    let result = processOptionalSections(template, context);

    // 2. Replace remaining required variables
    result = replaceRequiredVariables(result, context);

    // 3. Normalize whitespace (collapse multiple spaces, trim)
    return result.replaceAll(/\s{2,}/g, ' ').trim();
}

/**
 * Builds a template context from a Configuration object.
 * Maps configuration properties to template variable names.
 *
 * @param config Configuration object
 * @returns Template context with all config values as strings
 */
export function buildTemplateContext(config: Configuration): TemplateContext {
    return {
        presetDifficulty: config.presetDifficulty,
        lobbyName: config.lobbyName?.trim() ?? '',
        extras: config.challenges,
        gameMap: config.gameMap,
        start: config.start,
        isMegaNuke: String(config.isMegaNuke),
        // Numeric settings
        incomeMult: String(config.incomeMult),
        buildDistMult: String(config.buildDistMult),
        buildPowerMult: String(config.buildPowerMult),
        queenCount: String(config.queenCount),
    };
}

/**
 * Interpolates all command templates in an array.
 * Non-template commands are passed through unchanged.
 *
 * @param commands Array of commands (some may be templates)
 * @param config Configuration for variable substitution
 * @returns Array of interpolated commands
 */
export function interpolateCommands(
    commands: readonly string[],
    config: Configuration
): string[] {
    const context = buildTemplateContext(config);

    return commands.map((cmd) => {
        if (isCommandTemplate(cmd)) {
            return interpolateCommandTemplate(cmd, context);
        }
        return cmd;
    });
}
