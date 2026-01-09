import { useCallback } from 'react';

import { Box, Flex, Paper, Stack, Text } from '@mantine/core';
import { useClipboard } from '@mantine/hooks';
import Editor, { type OnMount } from '@monaco-editor/react';
import { IconCode, IconPackage } from '@tabler/icons-react';
import type { editor } from 'monaco-editor';

import { EditorToolbar } from '@/components/tabs/editor/editor-toolbar';
import { encode } from '@/lib/encoders/base64';
import { minify } from '@/lib/lua-utils/minificator';
import type { LuaTweakType } from '@/types/types';

type ViewMode = 'sources' | 'slots';

interface EditorPanelProps {
    viewMode: ViewMode;
    currentTitle: string | null;
    currentContent: string;
    isModified: boolean;
    slotInfo?: {
        type: LuaTweakType;
        slotSize: number;
    } | null;
    onChange: (value: string | undefined) => void;
    onReset: () => void;
    onDownload?: () => void;
}

export function EditorPanel({
    viewMode,
    currentTitle,
    currentContent,
    isModified,
    slotInfo,
    onChange,
    onReset,
    onDownload,
}: EditorPanelProps) {
    const clipboard = useClipboard({ timeout: 2000 });
    const base64Clipboard = useClipboard({ timeout: 2000 });

    const handleEditorMount: OnMount = useCallback(
        (editor: editor.IStandaloneCodeEditor) => {
            editor.updateOptions({
                minimap: { enabled: true },
                fontSize: 14,
                wordWrap: 'on',
                lineNumbers: 'on',
                folding: true,
                bracketPairColorization: { enabled: true },
            });
        },
        []
    );

    const handleCopy = useCallback(() => {
        clipboard.copy(currentContent);
    }, [currentContent, clipboard]);

    const handleCopyBase64 = useCallback(() => {
        try {
            const minified = minify(currentContent.trim());
            base64Clipboard.copy(encode(minified));
        } catch {
            base64Clipboard.copy(encode(currentContent.trim()));
        }
    }, [currentContent, base64Clipboard]);

    if (!currentTitle) {
        return (
            <Paper withBorder style={{ flex: 1, overflow: 'hidden' }}>
                <Flex
                    h='100%'
                    align='center'
                    justify='center'
                    direction='column'
                    gap='md'
                >
                    {viewMode === 'sources' ? (
                        <IconCode size={48} opacity={0.5} />
                    ) : (
                        <IconPackage size={48} opacity={0.5} />
                    )}
                    <Text c='dimmed'>
                        {viewMode === 'sources'
                            ? 'Select a file to edit'
                            : 'Select a slot to view'}
                    </Text>
                </Flex>
            </Paper>
        );
    }

    return (
        <Paper withBorder style={{ flex: 1, overflow: 'hidden' }}>
            <Stack gap={0} style={{ height: '100%' }}>
                <Flex
                    p='xs'
                    justify='space-between'
                    align='center'
                    style={{
                        borderBottom: '1px solid var(--mantine-color-dark-4)',
                    }}
                >
                    <EditorToolbar
                        viewMode={viewMode}
                        currentTitle={currentTitle}
                        isModified={isModified}
                        slotInfo={slotInfo}
                        onReset={onReset}
                        onCopy={handleCopy}
                        onCopyBase64={handleCopyBase64}
                        onDownload={onDownload}
                        isCopied={clipboard.copied}
                        isBase64Copied={base64Clipboard.copied}
                    />
                </Flex>

                <Box style={{ flex: 1 }}>
                    <Editor
                        key={viewMode}
                        height='100%'
                        language='lua'
                        theme='vs-dark'
                        value={currentContent}
                        onChange={onChange}
                        onMount={handleEditorMount}
                        options={{
                            minimap: { enabled: true },
                            fontSize: 14,
                            wordWrap: 'on',
                            lineNumbers: 'on',
                            folding: true,
                            scrollBeyondLastLine: false,
                            automaticLayout: true,
                        }}
                    />
                </Box>
            </Stack>
        </Paper>
    );
}
