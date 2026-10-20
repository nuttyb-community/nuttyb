'use client';

import type React from 'react';

import {
    ActionIcon,
    Alert,
    Button,
    Group,
    Input,
    MultiSelect,
    Paper,
    SegmentedControl,
    Stack,
    Text,
    TextInput,
} from '@mantine/core';
import { IconAlertTriangle, IconPlus, IconTrash } from '@tabler/icons-react';

import { LUA_PRIORITIES } from '@/lib/command-generator/data/configuration-mapping';
import type { PresetTweak } from '@/lib/presets/registry';
import { isRemoteTweakPath, isValidTweakUrl } from '@/lib/presets/tweak-url';
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

/** Turns a stored or imported tweak into a form row; `{}` gives a blank row. */
const toFormRow = (t: Partial<PresetTweak>): TweakFormRow => ({
    id: crypto.randomUUID(),
    description: t.description || '',
    type: t.type === 'tweakunits' ? 'tweakunits' : 'tweakdefs',
    path: t.path || '',
    replaces: [t.replaces ?? []].flat().map(String),
});

export const toFormRows = (tweaks: Partial<PresetTweak>[]): TweakFormRow[] =>
    tweaks.map((t) => toFormRow(t));

/** Unsupported hosts are an error right away; an empty path only with `flagEmpty`. */
export function getPathError(
    path: string,
    flagEmpty: boolean
): string | undefined {
    const trimmed = path.trim();
    if (!trimmed)
        return flagEmpty ? 'Enter a GitHub URL or a bundled path' : undefined;
    if (!isValidTweakUrl(trimmed))
        return 'Only raw.githubusercontent.com and gist.githubusercontent.com URLs are allowed';
    return undefined;
}

interface PresetTweakFieldsProps {
    tweak: TweakFormRow;
    index: number;
    pathError?: string;
    onChange: (changes: Partial<TweakFormRow>) => void;
    onRemove: () => void;
}

/** One tweak of the preset form: description, type, Lua file and replaced files. */
const PresetTweakFields: React.FC<PresetTweakFieldsProps> = ({
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

interface PresetTweakListProps {
    tweaks: TweakFormRow[];
    onChange: React.Dispatch<React.SetStateAction<TweakFormRow[]>>;
    /** Flags empty Lua file paths, once the user tried to save */
    showEmptyPathErrors: boolean;
}

/** The preset form's custom tweaks: remote-script warning, rows and Add button. */
export const PresetTweakList: React.FC<PresetTweakListProps> = ({
    tweaks,
    onChange,
    showEmptyPathErrors,
}) => {
    const updateTweak = (id: string, changes: Partial<TweakFormRow>) => {
        onChange((prev) =>
            prev.map((t) => (t.id === id ? { ...t, ...changes } : t))
        );
    };

    return (
        <Stack gap='sm'>
            <Stack gap={2}>
                <Text fw={700}>Custom tweaks</Text>
                <Text size='sm'>
                    Lua scripts loaded with this preset, from GitHub or the
                    bundle.
                </Text>
            </Stack>

            {tweaks.some((t) => isRemoteTweakPath(t.path)) && (
                <Alert
                    color='yellow'
                    icon={<IconAlertTriangle size={18} />}
                    title='This preset runs scripts from GitHub'
                >
                    They load from their authors&apos; repositories. Only use
                    presets from people you trust.
                </Alert>
            )}

            {tweaks.map((tweak, index) => (
                <PresetTweakFields
                    key={tweak.id}
                    tweak={tweak}
                    index={index}
                    pathError={getPathError(tweak.path, showEmptyPathErrors)}
                    onChange={(changes) => updateTweak(tweak.id, changes)}
                    onRemove={() =>
                        onChange((prev) =>
                            prev.filter((t) => t.id !== tweak.id)
                        )
                    }
                />
            ))}

            <Group>
                <Button
                    variant='default'
                    leftSection={<IconPlus size={16} />}
                    onClick={() => onChange((prev) => [...prev, toFormRow({})])}
                >
                    Add tweak
                </Button>
            </Group>
        </Stack>
    );
};
