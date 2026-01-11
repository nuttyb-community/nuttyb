import { useCallback, useRef } from 'react';

import { Box, Flex, Paper, Stack, Text } from '@mantine/core';
import { useClipboard } from '@mantine/hooks';
import Editor, { type OnMount } from '@monaco-editor/react';
import { IconCode, IconPackage } from '@tabler/icons-react';
import type { editor } from 'monaco-editor';

import { EditorToolbar } from '@/components/tabs/editor/editor-toolbar';
import type { LuaTweakType } from '@/types/types';

import { encodeMinified } from './editor-utils';
import { ViewMode } from './types';

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

export const EditorPanel: React.FC<EditorPanelProps> = ({
    viewMode,
    currentTitle,
    currentContent,
    isModified,
    slotInfo,
    onChange,
    onReset,
    onDownload,
}) => {
    const clipboard = useClipboard({ timeout: 2000 });
    const base64Clipboard = useClipboard({ timeout: 2000 });

    // Track editor instance for potential future features
    const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

    const handleEditorMount: OnMount = useCallback(
        (editor: editor.IStandaloneCodeEditor) => {
            editorRef.current = editor;
        },
        []
    );

    const handleCopy = useCallback(() => {
        clipboard.copy(currentContent);
    }, [currentContent, clipboard]);

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
                        onCopyBase64={() =>
                            base64Clipboard.copy(encodeMinified(currentContent))
                        }
                        onDownload={onDownload}
                        isCopied={clipboard.copied}
                        isBase64Copied={base64Clipboard.copied}
                    />
                </Flex>

                <Box style={{ flex: 1 }}>
                    <Editor
                        key={viewMode}
                        path={currentTitle}
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
                            bracketPairColorization: { enabled: true },
                        }}
                    />
                </Box>
            </Stack>
        </Paper>
    );
};
