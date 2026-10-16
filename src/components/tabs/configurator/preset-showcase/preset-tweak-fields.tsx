'use client';

import React from 'react';

import {
    ActionIcon,
    Group,
    Input,
    MultiSelect,
    Paper,
    SegmentedControl,
    Stack,
    TextInput,
} from '@mantine/core';
import { IconTrash } from '@tabler/icons-react';

import { LUA_PRIORITIES } from '@/lib/command-generator/data/configuration-mapping';
import type { PresetTweak } from '@/lib/presets/registry';
import { LUA_TWEAK_TYPES, type LuaTweakType } from '@/types/types';

/** Built-in Lua files a preset tweak can replace. */
const BUILT_IN_LUA_FILES = Object.keys(LUA_PRIORITIES).toSorted();

/** A preset tweak as the form edits it: `replaces` is always a list. */
export interface TweakFormRow {
    id: string;
    description: string;
    type: LuaTweakType;
    path: string;
    replaces: string[];
}

/** Turns stored or imported tweaks into form rows; `[{}]` gives one blank row. */
export const toFormRows = (tweaks: Partial<PresetTweak>[]): TweakFormRow[] =>
    tweaks.map(
        (t): TweakFormRow => ({
            id: crypto.randomUUID(),
            description: t.description || '',
            type: t.type === 'tweakunits' ? 'tweakunits' : 'tweakdefs',
            path: t.path || '',
            replaces: [t.replaces ?? []].flat().map(String),
        })
    );

interface PresetTweakFieldsProps {
    tweak: TweakFormRow;
    index: number;
    pathError?: string;
    onChange: (changes: Partial<TweakFormRow>) => void;
    onRemove: () => void;
}

/** One tweak of the preset form: description, type, Lua file and replaced files. */
export const PresetTweakFields: React.FC<PresetTweakFieldsProps> = ({
    tweak,
    index,
    pathError,
    onChange,
    onRemove,
}) => (
    <Paper withBorder p='md'>
        <Stack gap='sm'>
            <Group gap='sm' align='flex-end' wrap='nowrap'>
                <TextInput
                    label='Description'
                    placeholder='e.g. Cross-faction T2'
                    value={tweak.description}
                    onChange={(e) =>
                        onChange({ description: e.currentTarget.value })
                    }
                    flex={1}
                />
                <Input.Wrapper label='Type'>
                    <SegmentedControl
                        display='flex'
                        data={[...LUA_TWEAK_TYPES]}
                        value={tweak.type}
                        onChange={(type) => onChange({ type })}
                    />
                </Input.Wrapper>
                <ActionIcon
                    variant='subtle'
                    color='red'
                    size='input-sm'
                    aria-label={`Remove tweak ${index + 1}`}
                    onClick={onRemove}
                >
                    <IconTrash size={18} />
                </ActionIcon>
            </Group>
            <TextInput
                label='Lua file'
                description='A raw GitHub or gist URL, or a bundled path such as lua/eco-t3.lua'
                placeholder='https://raw.githubusercontent.com/…/tweak.lua'
                value={tweak.path}
                onChange={(e) => onChange({ path: e.currentTarget.value })}
                error={pathError}
                required
            />
            <MultiSelect
                label='Replaces'
                description='Built-in files this tweak replaces. Leave empty to add it alongside them.'
                placeholder={
                    tweak.replaces.length === 0 ? 'Nothing' : undefined
                }
                // Keep imported paths that aren't built-in files
                data={[...new Set([...BUILT_IN_LUA_FILES, ...tweak.replaces])]}
                value={tweak.replaces}
                onChange={(replaces) => onChange({ replaces })}
                searchable
                clearable
            />
        </Stack>
    </Paper>
);
