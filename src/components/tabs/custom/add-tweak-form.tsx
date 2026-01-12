'use client';

import React, { useState } from 'react';

import {
    Alert,
    Button,
    Group,
    NativeSelect,
    Stack,
    Text,
    Textarea,
    TextInput,
    Title,
} from '@mantine/core';

import { useCustomTweaksContext } from '@/components/contexts/custom-tweaks-context';
import { validateBase64UrlTweak } from '@/lib/command-generator/command-generator';
import { MAX_SLOT_SIZE } from '@/lib/command-generator/constants';
import { LUA_TWEAK_TYPES, LuaTweakType } from '@/types/types';

interface FormState {
    description: string;
    type: LuaTweakType;
    code: string;
}

const initialFormState: FormState = {
    description: '',
    type: 'tweakdefs',
    code: '',
};

export const AddTweakForm: React.FC = () => {
    const { addTweak } = useCustomTweaksContext();
    const [form, setForm] = useState<FormState>(initialFormState);
    const [error, setError] = useState<string | null>(null);
    const [preview, setPreview] = useState<string | null>(null);

    const handleDescriptionChange = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        setForm((prev) => ({ ...prev, description: event.target.value }));
    };

    const handleTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setForm((prev) => ({
            ...prev,
            type: event.target.value as LuaTweakType,
        }));
    };

    const handleCodeChange = (
        event: React.ChangeEvent<HTMLTextAreaElement>
    ) => {
        const code = event.target.value;
        setForm((prev) => ({ ...prev, code }));

        // Validate on change to show preview/errors
        if (code.trim()) {
            // Check size first (before expensive base64 validation)
            if (code.trim().length > MAX_SLOT_SIZE) {
                setError(
                    `Custom tweak is too large: ${code.trim().length} chars (maximum: ${MAX_SLOT_SIZE})`
                );
                setPreview(null);
                return;
            }

            const result = validateBase64UrlTweak(code);
            if (result.valid) {
                setError(null);
                setPreview(result.firstLine ?? null);
            } else {
                setError(result.error ?? 'Invalid code');
                setPreview(null);
            }
        } else {
            setError(null);
            setPreview(null);
        }
    };

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();

        // Validate description
        if (!form.description.trim()) {
            setError('Description is required');
            return;
        }

        // Validate code
        if (!form.code.trim()) {
            setError('Tweak code is required');
            return;
        }

        const validation = validateBase64UrlTweak(form.code);
        if (!validation.valid) {
            setError(validation.error ?? 'Invalid tweak code');
            return;
        }

        // Add the tweak
        addTweak(form.description, form.type, form.code);

        // Reset form
        setForm(initialFormState);
        setError(null);
        setPreview(null);
    };

    return (
        <form onSubmit={handleSubmit}>
            <Stack gap='md'>
                <Title order={3}>Add Custom Tweak</Title>

                <TextInput
                    label='Description'
                    placeholder='e.g., Super Fast Tanks'
                    value={form.description}
                    onChange={handleDescriptionChange}
                    required
                />

                <NativeSelect
                    label='Type'
                    data={LUA_TWEAK_TYPES.map((t) => ({ value: t, label: t }))}
                    value={form.type}
                    onChange={handleTypeChange}
                />

                <Textarea
                    label='Tweak Code (Base64URL)'
                    placeholder='Paste your base64url encoded tweak code here'
                    value={form.code}
                    onChange={handleCodeChange}
                    minRows={3}
                    maxRows={25}
                    autosize
                    required
                    styles={{
                        input: {
                            fontFamily: 'monospace',
                            fontSize: '12px',
                        },
                    }}
                />

                {preview && (
                    <Text size='sm' c='dimmed'>
                        Preview (first line): <code>{preview}</code>
                    </Text>
                )}

                {error && (
                    <Alert color='red' variant='light'>
                        {error}
                    </Alert>
                )}

                <Group>
                    <Button type='submit' disabled={!!error}>
                        Save Tweak
                    </Button>
                </Group>
            </Stack>
        </form>
    );
};
