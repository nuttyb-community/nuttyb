'use client';

import { useCallback, useMemo, useState } from 'react';

import {
    Checkbox,
    Flex,
    Radio,
    SimpleGrid,
    Stack,
    Text,
    Textarea,
    Title,
} from '@mantine/core';

import { decode, encode } from '@/lib/encoders/base64';
import { beautify } from '@/lib/lua-utils/beautifier';
import { minify } from '@/lib/lua-utils/minificator';

type Mode = 'encode' | 'decode';

export default function Page() {
    const [mode, setMode] = useState<Mode>('encode');
    const [isFormatterEnabled, setFormatterEnabled] = useState<boolean>(true);
    const [inputText, setInputText] = useState<string>('');

    const outputText = useMemo(() => {
        if (!inputText) return '';

        switch (mode) {
            case 'encode':
                return encode(
                    isFormatterEnabled ? minify(inputText) : inputText
                );
            case 'decode':
                return isFormatterEnabled
                    ? beautify(decode(inputText))
                    : decode(inputText);
        }
    }, [inputText, mode, isFormatterEnabled]);

    const handleModeChange = useCallback((newMode: string) => {
        setMode(newMode as Mode);
        setInputText('');
    }, []);

    return (
        <Stack gap='xl'>
            <Stack gap='sm'>
                <Title order={2}>Base64 Encoder/Decoder</Title>
                <Text c='dimmed' size='sm'>
                    In order to use your Lua code in the game, it needs to be
                    encoded in Base64 format. Use this tool to encode or decode
                    Base64 strings.
                </Text>
            </Stack>

            <Stack>
                <Radio.Group value={mode} onChange={handleModeChange}>
                    <Flex gap='md'>
                        <Radio value='encode' label='Encode' />
                        <Radio value='decode' label='Decode' />
                    </Flex>
                </Radio.Group>

                <Checkbox
                    label='Enable formatter'
                    description='Minify Lua before encoding and beautify after decoding'
                    checked={isFormatterEnabled}
                    onChange={(event) =>
                        setFormatterEnabled(event.currentTarget.checked)
                    }
                />

                <SimpleGrid cols={2}>
                    <Textarea
                        label='Input'
                        placeholder='Your text goes here'
                        value={inputText}
                        onChange={(event) =>
                            setInputText(event.currentTarget.value)
                        }
                        autosize
                        maxRows={17}
                    />
                    <Textarea
                        label='Output'
                        placeholder='Generated text will be here'
                        readOnly
                        value={outputText}
                        autosize
                        maxRows={17}
                    />
                </SimpleGrid>
            </Stack>
        </Stack>
    );
}
