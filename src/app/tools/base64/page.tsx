'use client';

import { useState } from 'react';

import {
    Button,
    Checkbox,
    Group,
    SegmentedControl,
    SimpleGrid,
    Stack,
    Text,
    Textarea,
    Title,
} from '@mantine/core';
import { useClipboard } from '@mantine/hooks';
import { IconCheck, IconCopy } from '@tabler/icons-react';

import { ICON_SIZE_MD } from '@/components/common/icon-style';
import {
    PAGE_HEIGHT,
    PAGE_PADDING,
    PageWrapper,
} from '@/components/page-wrapper';
import {
    CONVERT_MODES,
    convertLua,
    type ConvertMode,
} from '@/lib/encoders/convert';

/** Per mode: the switch label, what each box holds and the formatter checkbox. */
const MODES = {
    encode: {
        label: 'Encode',
        input: 'Lua',
        output: 'Base64URL',
        formatter: 'Minify the Lua first',
    },
    decode: {
        label: 'Decode',
        input: 'Base64URL',
        output: 'Lua',
        formatter: 'Format the decoded Lua',
    },
} as const;

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

export default function Page() {
    const [mode, setMode] = useState<ConvertMode>('encode');
    const [isFormatterEnabled, setFormatterEnabled] = useState(true);
    const [inputText, setInputText] = useState('');
    const clipboard = useClipboard();

    const { output, error } = convertLua(inputText, mode, isFormatterEnabled);

    // The result becomes the new input, so switching checks the round trip
    const handleModeChange = (newMode: ConvertMode) => {
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
                        data={CONVERT_MODES.map((value) => ({
                            value,
                            label: MODES[value].label,
                        }))}
                        value={mode}
                        onChange={handleModeChange}
                    />
                    <Checkbox
                        label={MODES[mode].formatter}
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
                        label={MODES[mode].input}
                        placeholder={`Paste ${MODES[mode].input} here`}
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
                            label={MODES[mode].output}
                            readOnly
                            value={output}
                            rows={BOX_ROWS}
                            flex={1}
                            mih={0}
                            styles={BOX_STYLES}
                        />
                        <Group>
                            <Button
                                color={clipboard.copied ? 'teal' : 'blue'}
                                disabled={!output}
                                onClick={() => clipboard.copy(output)}
                                leftSection={
                                    clipboard.copied ? (
                                        <IconCheck {...ICON_SIZE_MD} />
                                    ) : (
                                        <IconCopy {...ICON_SIZE_MD} />
                                    )
                                }
                            >
                                {clipboard.copied
                                    ? 'Copied!'
                                    : `Copy ${MODES[mode].output}`}
                            </Button>
                        </Group>
                    </Stack>
                </SimpleGrid>
            </Stack>
        </PageWrapper>
    );
}
