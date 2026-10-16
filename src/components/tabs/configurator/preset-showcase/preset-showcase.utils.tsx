import React from 'react';

import { Table } from '@mantine/core';

import {
    Configuration,
    DEFAULT_CONFIGURATION,
} from '@/lib/command-generator/data/configuration';

/** Display labels, matching the configurator's field labels. */
const CONFIG_LABELS: Record<keyof Configuration, string> = {
    raptorHpMult: 'Raptor HP multiplier',
    queenHpMult: 'Queen HP multiplier',
    isCrossFactionT2: 'Cross-faction T2 labs',
    isDefencesT4: 'T4 defences',
    lobbyName: 'Lobby name tag',
    gameMap: 'Map',
    start: 'Start',
    queenCount: 'Raptor queen count',
    incomeMult: 'Resource income multiplier',
    buildPowerMult: 'Build power multiplier',
    buildDistMult: 'Build distance multiplier',
    challenges: 'Challenges',
    isEcoT4: 'T4 Economy',
    isRFLRPCRebalance: 'RFLRPC Rebalance',
    isRFLRPCT4: 'T4 RFLRPC',
    isMegaNuke: 'Mega Nuke',
    isT3GeoWalls: 'T3 Geo + Walls',
};

export interface ConfigDiff {
    label: string;
    value: string;
}

/**
 * Computes the list of configuration overrides compared to defaults.
 * Shared by the preset details popover and the preset form.
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
                label: CONFIG_LABELS[key],
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
