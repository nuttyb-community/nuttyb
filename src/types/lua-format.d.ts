declare module 'lua-format' {
    interface LuaFormatOptions {
        /**
         * Whether to rename local variables for minification
         */
        RenameVariables?: boolean;

        /**
         * Whether to rename global variables for minification
         */
        RenameGlobals?: boolean;

        /**
         * Whether to solve mathematical expressions during minification
         */
        SolveMath?: boolean;

        /**
         * Indentation string for beautification (e.g., '\t' or '  ')
         */
        Indentation?: string;
    }

    interface LuaFormatter {
        /**
         * Minify Lua code with optional configuration
         */
        Minify(code: string, options?: LuaFormatOptions): string;

        /**
         * Beautify Lua code with optional configuration
         */
        Beautify(code: string, options?: LuaFormatOptions): string;
    }

    /**
     * Default export - lua-format object with Minify and Beautify methods
     */
    const luamin: LuaFormatter;
    export default luamin;

    /**
     * Named export - simple minify function that takes only code string
     */
    export function minify(code: string): string;
}
