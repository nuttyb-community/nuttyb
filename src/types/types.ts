import type { Configuration } from '../lib/command-generator/data/configuration';

// Extract all possible values from Configuration properties
export type ExtractValues<T> = T extends readonly (infer U)[]
    ? U
    : T extends object
      ? T[keyof T]
      : T;

// Convert boolean to string literals for Record compatibility
export type StringifyBooleans<T> = T extends boolean ? `${T}` : T;

/**
 * The three output types for tweak configuration:
 * - 'command': Raw lobby commands (e.g., !preset, !map)
 * - 'tweakdefs': Lua code for tweakdefs slots
 * - 'tweakunits': Lua code for tweakunits slots
 */
export const LUA_TWEAK_TYPES = ['tweakdefs', 'tweakunits'] as const;
export type LuaTweakType = (typeof LUA_TWEAK_TYPES)[number];
export type TweakType = (typeof LUA_TWEAK_TYPES)[number] | 'command';

/**
 * A value that can produce any combination of output types.
 * Empty arrays are treated as undefined during processing.
 */
export type TweakValue = Partial<Record<TweakType, string[]>>;

/**
 * Hierarchical mapping: configuration key -> possible values -> outputs by type.
 * Each configuration option maps its possible values to TweakValue objects
 * that can contain commands, tweakdefs, and/or tweakunits.
 */
export type ValueMapping = {
    [K in keyof Configuration]: {
        /** The setting's label, as the preset details show it */
        description: string;
        values: Record<
            StringifyBooleans<ExtractValues<Configuration[K]>>,
            TweakValue | undefined
        >;
    };
};

export interface LuaFile {
    path: string;
    data: string;
}
