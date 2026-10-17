'use client';

import React, { useState } from 'react';

import {
    Anchor,
    Button,
    Code,
    Group,
    Input,
    Modal,
    SegmentedControl,
    Stack,
    Text,
    Textarea,
    TextInput,
} from '@mantine/core';
import Link from 'next/link';

import { useCustomTweaksContext } from '@/components/contexts/custom-tweaks-context';
import {
    type CustomTweak,
    validateBase64UrlTweak,
} from '@/lib/command-generator/command-generator';
import { MAX_SLOT_SIZE } from '@/lib/command-generator/constants';
import { LINKS } from '@/lib/navigation';
import { LUA_TWEAK_TYPES, type LuaTweakType } from '@/types/types';

interface CustomTweakFormProps {
    /** The tweak to edit; a new one is added when null. */
    tweak: CustomTweak | null;
    onClose: () => void;
}

// The modal unmounts it on close, so every opening starts from `tweak`
const CustomTweakForm: React.FC<CustomTweakFormProps> = ({
    tweak,
    onClose,
}) => {
    const { addTweak, updateTweak } = useCustomTweaksContext();
    const [name, setName] = useState(tweak?.description ?? '');
    const [type, setType] = useState<LuaTweakType>(tweak?.type ?? 'tweakdefs');
    const [code, setCode] = useState(tweak?.code ?? '');
    // Empty fields are only flagged after a save attempt
    const [hasTriedSave, setTriedSave] = useState(false);

    const trimmedCode = code.trim();

    // Bad code is flagged as you type; the size check skips decoding huge input
    const checkCode = (): { error?: string; firstLine?: string } => {
        if (!trimmedCode)
            return { error: hasTriedSave ? 'Paste the tweak code' : undefined };
        if (trimmedCode.length > MAX_SLOT_SIZE)
            return {
                error: `Too long for a slot: ${trimmedCode.length} characters, the limit is ${MAX_SLOT_SIZE}`,
            };
        return validateBase64UrlTweak(trimmedCode);
    };
    const { error: codeError, firstLine } = checkCode();

    const handleSave = () => {
        setTriedSave(true);
        if (!name.trim() || !trimmedCode || codeError) return;

        if (tweak) updateTweak(tweak.id, { description: name, type, code });
        else addTweak(name, type, code);
        onClose();
    };

    return (
        <form
            // Our own field errors replace the browser's required-field bubbles
            noValidate
            onSubmit={(event) => {
                event.preventDefault();
                handleSave();
            }}
        >
            <Stack gap='md'>
                <TextInput
                    label='Name'
                    placeholder='e.g. Super fast tanks'
                    value={name}
                    onChange={(e) => setName(e.currentTarget.value)}
                    error={
                        hasTriedSave && !name.trim()
                            ? 'Give the tweak a name'
                            : undefined
                    }
                    required
                    data-autofocus
                />
                <Input.Wrapper
                    label='Type'
                    description='Tweakdefs runs Lua code on unit definitions; tweakunits merges a Lua table into them.'
                >
                    <SegmentedControl
                        display='flex'
                        data={[...LUA_TWEAK_TYPES]}
                        value={type}
                        onChange={setType}
                    />
                </Input.Wrapper>
                <Stack gap='xs'>
                    <Textarea
                        label='Code'
                        description={
                            <>
                                Base64URL-encoded Lua. Encode yours with the{' '}
                                <Anchor
                                    component={Link}
                                    href={LINKS.tools.base64.href}
                                    target='_blank'
                                    inherit
                                >
                                    Base64 tool
                                </Anchor>
                                .
                            </>
                        }
                        value={code}
                        onChange={(e) => setCode(e.currentTarget.value)}
                        error={codeError}
                        required
                        autosize
                        // Grows with the code, then scrolls
                        minRows={4}
                        maxRows={12}
                        styles={{
                            input: {
                                fontFamily:
                                    'var(--mantine-font-family-monospace)',
                                fontSize: 'var(--mantine-font-size-xs)',
                            },
                        }}
                    />
                    {/* Shows the paste decoded, so you can tell it's the right tweak */}
                    {!codeError && firstLine && (
                        <Text size='sm' truncate='end'>
                            Starts with <Code>{firstLine}</Code>
                        </Text>
                    )}
                </Stack>
                <Group justify='flex-end' gap='sm'>
                    <Button variant='default' onClick={onClose}>
                        Cancel
                    </Button>
                    <Button type='submit'>
                        {tweak ? 'Save changes' : 'Add tweak'}
                    </Button>
                </Group>
            </Stack>
        </form>
    );
};

interface CustomTweakModalProps extends CustomTweakFormProps {
    opened: boolean;
}

/** Adds a custom tweak, or edits one when `tweak` is set. */
export const CustomTweakModal: React.FC<CustomTweakModalProps> = ({
    opened,
    onClose,
    tweak,
}) => (
    <Modal
        opened={opened}
        onClose={onClose}
        title={tweak ? 'Edit custom tweak' : 'New custom tweak'}
        size='lg'
        centered
    >
        <CustomTweakForm key={tweak?.id} tweak={tweak} onClose={onClose} />
    </Modal>
);
