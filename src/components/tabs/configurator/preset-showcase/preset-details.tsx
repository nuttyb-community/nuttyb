import type React from 'react';

import { List, Stack, Table, Text } from '@mantine/core';

import { type ConfigDiff, computeConfigDiff } from '@/lib/presets/config-diff';
import type { Preset } from '@/lib/presets/registry';

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

/** What a preset sets: name, description, changed settings and tweaks. */
export const PresetDetails: React.FC<{ preset: Preset }> = ({ preset }) => {
    const overrides = computeConfigDiff(preset.configuration);

    return (
        <Stack gap='md'>
            <Stack gap={2}>
                <Text fw={700}>{preset.name}</Text>
                {preset.description && (
                    <Text size='sm'>{preset.description}</Text>
                )}
            </Stack>
            {overrides.length > 0 && (
                <Stack gap='xs'>
                    <Text size='sm' fw={700}>
                        Settings
                    </Text>
                    <ConfigDiffTable overrides={overrides} />
                </Stack>
            )}
            {preset.presetTweaks && preset.presetTweaks.length > 0 && (
                <Stack gap='xs'>
                    <Text size='sm' fw={700}>
                        Custom tweaks
                    </Text>
                    <List size='sm' spacing={4}>
                        {preset.presetTweaks.map((t, idx) => (
                            <List.Item key={idx}>
                                {t.description || t.path.split('/').pop()}
                            </List.Item>
                        ))}
                    </List>
                </Stack>
            )}
        </Stack>
    );
};
