'use client';

import { useState } from 'react';

import {
    Button,
    Checkbox,
    CopyButton,
    Group,
    SegmentedControl,
    SimpleGrid,
    Stack,
    Text,
    Textarea,
    Title,
} from '@mantine/core';
import { IconCheck, IconCopy } from '@tabler/icons-react';

import { FEEDBACK_DURATION_MS } from '@/components/common/feedback';
import { ICON_SIZE_MD } from '@/components/common/icon-style';
import {
    PAGE_HEIGHT,
    PAGE_PADDING,
    PageWrapper,
} from '@/components/page-wrapper';
import { decode, encode } from '@/lib/encoders/base64';
import { beautify } from '@/lib/lua-utils/beautifier';
import { minify } from '@/lib/lua-utils/minificator';

type Mode = 'encode' | 'decode';

const MODES: { value: Mode; label: string }[] = [
    { value: 'encode', label: 'Encode' },
    { value: 'decode', label: 'Decode' },
];

/** What each box holds, so the labels say Lua or Base64URL, not input and output. */
const BOX_LABELS: Record<Mode, { input: string; output: string }> = {
    encode: { input: 'Lua', output: 'Base64URL' },
    decode: { input: 'Base64URL', output: 'Lua' },
};

const FORMATTER_LABELS: Record<Mode, string> = {
    encode: 'Minify the Lua first',
    decode: 'Format the decoded Lua',
};

/** Box height when the boxes stack on narrow screens instead of filling the window. */
const BOX_ROWS = 12;

/** Monospace boxes that stretch into the height left and scroll inside. */
const BOX_STYLES = {
    root: { display: 'flex', flexDirection: 'column' },
    wrapper: { flex: 1 },
    input: {
        height: '100%',
        fontFamily: 'var(--mantine-font-family-monospace)',
    },
} as const;

/** Decoding throws on anything that isn't Base64URL; that becomes an error. */
const convert = (
    input: string,
    mode: Mode,
    isFormatterEnabled: boolean
): { output: string; error?: string } => {
    if (!input.trim()) return { output: '' };
    if (mode === 'encode')
        return { output: encode(isFormatterEnabled ? minify(input) : input) };

    try {
        const decoded = decode(input.trim());
        return { output: isFormatterEnabled ? beautify(decoded) : decoded };
    } catch {
        return {
            output: '',
            error: "This isn't Base64URL. To encode Lua, switch to Encode.",
        };
    }
};

export default function Page() {
    const [mode, setMode] = useState<Mode>('encode');
    const [isFormatterEnabled, setFormatterEnabled] = useState(true);
    const [inputText, setInputText] = useState('');

    const { output, error } = convert(inputText, mode, isFormatterEnabled);

    // The result becomes the new input, so switching checks the round trip
    const handleModeChange = (newMode: Mode) => {
        if (output) setInputText(output);
        setMode(newMode);
    };

    return (
        <PageWrapper py={PAGE_PADDING}>
            {/* Side by side, the page fills the window and the boxes scroll inside */}
            <Stack gap='lg' h={{ md: PAGE_HEIGHT }}>
                <Stack gap='xs'>
                    <Title order={1}>Base64</Title>
                    <Text>
                        Lobby commands carry Lua as Base64URL. Encode your Lua
                        to add it as a custom tweak, or decode a tweak to read
                        it.
                    </Text>
                </Stack>

                <Group gap='xl'>
                    <SegmentedControl
                        data={MODES}
                        value={mode}
                        onChange={handleModeChange}
                    />
                    <Checkbox
                        label={FORMATTER_LABELS[mode]}
                        checked={isFormatterEnabled}
                        onChange={(event) =>
                            setFormatterEnabled(event.currentTarget.checked)
                        }
                    />
                </Group>

                <SimpleGrid
                    cols={{ base: 1, md: 2 }}
                    spacing='xl'
                    flex={1}
                    mih={0}
                >
                    <Textarea
                        label={BOX_LABELS[mode].input}
                        placeholder={`Paste ${BOX_LABELS[mode].input} here`}
                        value={inputText}
                        onChange={(event) =>
                            setInputText(event.currentTarget.value)
                        }
                        error={error}
                        rows={BOX_ROWS}
                        styles={BOX_STYLES}
                    />
                    <Stack gap='sm' mih={0}>
                        <Textarea
                            label={BOX_LABELS[mode].output}
                            readOnly
                            value={output}
                            rows={BOX_ROWS}
                            flex={1}
                            mih={0}
                            styles={BOX_STYLES}
                        />
                        <Group>
                            <CopyButton
                                value={output}
                                timeout={FEEDBACK_DURATION_MS}
                            >
                                {({ copied, copy }) => (
                                    <Button
                                        color={copied ? 'teal' : 'blue'}
                                        disabled={!output}
                                        onClick={copy}
                                        leftSection={
                                            copied ? (
                                                <IconCheck {...ICON_SIZE_MD} />
                                            ) : (
                                                <IconCopy {...ICON_SIZE_MD} />
                                            )
                                        }
                                    >
                                        {copied
                                            ? 'Copied!'
                                            : `Copy ${BOX_LABELS[mode].output}`}
                                    </Button>
                                )}
                            </CopyButton>
                        </Group>
                    </Stack>
                </SimpleGrid>
            </Stack>
        </PageWrapper>
    );
}
