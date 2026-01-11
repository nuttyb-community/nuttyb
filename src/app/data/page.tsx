'use client';

import { useMemo } from 'react';

import { Code, Group, Stack, Table, Text, Title, Tooltip } from '@mantine/core';

import { useLuaBundleContext } from '@/components/contexts/lua-bundle-context';
import { PageLoader } from '@/components/page-loader';
import { DataItem, type DataItemProps } from '@/components/tabs/data/data-item';
import {
    BASE_COMMANDS,
    BASE_TWEAKS,
    CONFIGURATION_MAPPING,
} from '@/lib/command-generator/data/configuration-mapping';
import { encode } from '@/lib/encoders/base64';
import type { LuaFile, TweakType } from '@/types/types';

interface ConfigValueEntry {
    value: string;
    items: DataItemProps[];
}

interface ConfigOptionEntry {
    configKey: string;
    description: string;
    values: ConfigValueEntry[];
}

function buildBaseItems(luaFiles: LuaFile[]): DataItemProps[] {
    const luaFileMap = new Map(luaFiles.map((f) => [f.path, f.data]));

    // Base commands - concatenated
    const commandItem: DataItemProps = {
        type: 'command' as TweakType,
        data: BASE_COMMANDS.join('\n'),
    };

    // Base tweakdefs
    const tweakdefsItems: DataItemProps[] = BASE_TWEAKS.tweakdefs.map(
        (path) => {
            const cleanPath = path.replace(/^~/, '').split('{')[0];
            const content = luaFileMap.get(cleanPath);

            return {
                type: 'tweakdefs' as TweakType,
                source: cleanPath,
                data: content ? encode(content.trim()) : '',
                isMissing: !content,
            };
        }
    );

    // Base tweakunits
    const tweakunitsItems: DataItemProps[] = BASE_TWEAKS.tweakunits.map(
        (path) => {
            const cleanPath = path.replace(/^~/, '').split('{')[0];
            const content = luaFileMap.get(cleanPath);

            return {
                type: 'tweakunits' as TweakType,
                source: cleanPath,
                data: content ? encode(content.trim()) : '',
                isMissing: !content,
            };
        }
    );

    return [commandItem, ...tweakdefsItems, ...tweakunitsItems];
}

function buildConfigurationView(luaFiles: LuaFile[]): ConfigOptionEntry[] {
    const luaFileMap = new Map(luaFiles.map((f) => [f.path, f.data]));
    const entries: ConfigOptionEntry[] = [];

    for (const [configKey, mapping] of Object.entries(CONFIGURATION_MAPPING)) {
        const valueEntries: ConfigValueEntry[] = [];

        for (const [valueKey, tweakValue] of Object.entries(mapping.values)) {
            const items: DataItemProps[] = [];

            if (!tweakValue) {
                valueEntries.push({ value: valueKey, items: [] });
                continue;
            }

            const tv = tweakValue;

            // Process commands - concatenate all into single item
            if (tv.command && tv.command.length > 0) {
                items.push({
                    type: 'command' as TweakType,
                    data: tv.command.join('\n'),
                });
            }

            // Process tweakdefs Lua files
            if (tv.tweakdefs && tv.tweakdefs.length > 0) {
                for (const path of tv.tweakdefs) {
                    const cleanPath = path.replace(/^~/, '').split('{')[0];
                    const content = luaFileMap.get(cleanPath);

                    items.push({
                        type: 'tweakdefs' as TweakType,
                        source: cleanPath,
                        data: content ? encode(content.trim()) : '',
                        isMissing: !content,
                    });
                }
            }

            // Process tweakunits Lua files
            if (tv.tweakunits && tv.tweakunits.length > 0) {
                for (const path of tv.tweakunits) {
                    const cleanPath = path.replace(/^~/, '').split('{')[0];
                    const content = luaFileMap.get(cleanPath);

                    items.push({
                        type: 'tweakunits' as TweakType,
                        source: cleanPath,
                        data: content ? encode(content.trim()) : '',
                        isMissing: !content,
                    });
                }
            }

            valueEntries.push({ value: valueKey, items });
        }

        entries.push({
            configKey,
            description: mapping.description,
            values: valueEntries,
        });
    }

    return entries;
}

export default function Page() {
    const { luaFiles, sha, isLoading, error } = useLuaBundleContext();

    const baseItems = useMemo(() => buildBaseItems(luaFiles), [luaFiles]);

    const configEntries = useMemo(
        () => buildConfigurationView(luaFiles),
        [luaFiles]
    );

    if (isLoading) return <PageLoader />;
    if (error) return <div>Error: {error.message}</div>;

    return (
        <Stack gap='xl'>
            <Stack gap='sm'>
                <Group justify='space-between'>
                    <Title order={2}>Configuration Data Reference</Title>
                    {sha && (
                        <Tooltip label={sha}>
                            <Text size='sm' c='dimmed'>
                                Bundle:{' '}
                                <Code>
                                    {sha.includes('loc')
                                        ? sha
                                        : `${sha.slice(0, 7)}...`}
                                </Code>
                            </Text>
                        </Tooltip>
                    )}
                </Group>
                <Text size='sm' c='dimmed'>
                    All configuration options with underlying data.
                    {luaFiles.length > 0 &&
                        ` ${luaFiles.length} Lua files loaded.`}
                </Text>
            </Stack>

            {/* Base Commands and Tweaks */}
            <Stack gap='xs'>
                <Text fw={500}>Base (always included)</Text>
                <Stack gap='xs'>
                    {baseItems.map((item, idx) => (
                        <DataItem
                            key={`${item.type}-${item.source ?? idx}`}
                            {...item}
                        />
                    ))}
                </Stack>
            </Stack>

            {configEntries
                .filter((option) => option.values.length > 0)
                .map((option) => (
                    <Stack key={option.configKey} gap='xs'>
                        <Text fw={500}>{option.description}</Text>
                        <Table striped withTableBorder>
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th style={{ width: '150px' }}>
                                        Value
                                    </Table.Th>
                                    <Table.Th>Data</Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {option.values
                                    .filter(
                                        (v) => v.items && v.items.length > 0
                                    )
                                    .map((v) => (
                                        <Table.Tr key={v.value}>
                                            <Table.Td valign='top'>
                                                <Code>{v.value}</Code>
                                            </Table.Td>
                                            <Table.Td>
                                                {v.items.length === 0 ? (
                                                    <Text
                                                        size='sm'
                                                        c='dimmed'
                                                        fs='italic'
                                                    >
                                                        —
                                                    </Text>
                                                ) : (
                                                    <Stack gap='xs'>
                                                        {v.items.map(
                                                            (item, idx) => (
                                                                <DataItem
                                                                    key={`${item.type}-${item.source ?? idx}`}
                                                                    {...item}
                                                                />
                                                            )
                                                        )}
                                                    </Stack>
                                                )}
                                            </Table.Td>
                                        </Table.Tr>
                                    ))}
                            </Table.Tbody>
                        </Table>
                    </Stack>
                ))}
        </Stack>
    );
}
