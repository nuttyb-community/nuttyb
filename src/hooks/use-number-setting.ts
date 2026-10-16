import { useConfiguratorContext } from '@/components/contexts/configurator-context';
import {
    type Configuration,
    DEFAULT_CONFIGURATION,
} from '@/lib/command-generator/data/configuration';

function clampNumber(
    value: string | number,
    min: number,
    max: number,
    fallback: number
): number {
    const numericValue = Number(value);

    if (value === '' || !Number.isFinite(numericValue)) {
        return fallback;
    }

    return Math.min(max, Math.max(min, numericValue));
}

type NumericKey = {
    [K in keyof Configuration]: Configuration[K] extends number ? K : never;
}[keyof Configuration];

/** Value, clamping onChange and range for a number setting's NumberInput. */
export function useNumberSetting(field: NumericKey, min: number, max: number) {
    const { configuration, setProperty } = useConfiguratorContext();

    return {
        value: configuration[field],
        // Out of range clamps; a cleared box falls back to the default
        onChange: (value: string | number) =>
            setProperty(
                field,
                clampNumber(value, min, max, DEFAULT_CONFIGURATION[field])
            ),
        min,
        max,
    };
}
