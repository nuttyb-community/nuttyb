import React from 'react';

import { Table } from '@mantine/core';

import {
    Configuration,
    DEFAULT_CONFIGURATION,
} from '@/lib/command-generator/data/configuration';
import { CONFIGURATION_MAPPING } from '@/lib/command-generator/data/configuration-mapping';

export interface ConfigDiff {
    label: string;
    value: string;
}

/**
 * Computes the list of configuration overrides compared to defaults, labelled
 * with the mapping descriptions. Shared by the preset popover and form.
 */
export function computeConfigDiff(config: Configuration): ConfigDiff[] {
    const defaultKeys = Object.keys(DEFAULT_CONFIGURATION) as Array<
        keyof typeof DEFAULT_CONFIGURATION
    >;
    return defaultKeys
        .filter((key) => config[key] !== DEFAULT_CONFIGURATION[key])
        .map((key) => {
            const value = config[key];
            return {
                label: CONFIGURATION_MAPPING[key].description,
                value:
                    typeof value === 'boolean'
                        ? value
                            ? 'Enabled'
                            : 'Disabled'
                        : String(value),
            };
        });
}

/** Two-column table of setting overrides: label left, value right. */
export const ConfigDiffTable: React.FC<{ overrides: ConfigDiff[] }> = ({
    overrides,
}) => (
    <Table
        fz='sm'
        verticalSpacing={4}
        horizontalSpacing={0}
        withRowBorders={false}
    >
        <Table.Tbody>
            {overrides.map((o) => (
                <Table.Tr key={o.label}>
                    <Table.Td>{o.label}</Table.Td>
                    <Table.Td ta='right' fw={700}>
                        {o.value}
                    </Table.Td>
                </Table.Tr>
            ))}
        </Table.Tbody>
    </Table>
);
