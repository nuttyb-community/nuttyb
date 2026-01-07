'use client';

import React, { useCallback, useMemo, useState } from 'react';

import {
    ActionIcon,
    Badge,
    Box,
    Flex,
    Group,
    Paper,
    ScrollArea,
    SegmentedControl,
    Stack,
    Text,
    TextInput,
    Tooltip,
} from '@mantine/core';
import { useClipboard } from '@mantine/hooks';
import Editor, { type OnMount } from '@monaco-editor/react';
import {
    IconCheck,
    IconCode,
    IconCopy,
    IconDownload,
    IconFile,
    IconPackage,
    IconRefresh,
    IconSearch,
    IconTransform,
} from '@tabler/icons-react';
import type { editor } from 'monaco-editor';

import { ICON_STYLE } from '@/components/common/icon-style';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { getMappedData } from '@/lib/command-generator/configuration/mapper';
import { MAX_SLOT_SIZE } from '@/lib/command-generator/constants';
import type { Configuration } from '@/lib/command-generator/data/configuration';
import {
    DEFAULT_LUA_PRIORITY,
    LUA_PRIORITIES,
} from '@/lib/command-generator/data/configuration-mapping';
import { resolveLuaReference } from '@/lib/command-generator/interpolator';
import { type LuaSource, packLuaSources } from '@/lib/command-generator/packer';
import { decode, encode } from '@/lib/encoders/base64';
import { minify } from '@/lib/lua-utils/minificator';
import type { LuaFile, LuaTweakType } from '@/types/types';

interface LuaEditorProps {
    luaFiles: LuaFile[];
    configuration: Configuration;
}

interface EditedFile {
    path: string;
    originalData: string;
    currentData: string;
}

interface SlotContent {
    slotName: string;
    type: LuaTweakType;
    sources: string[];
    content: string; // The combined Lua content before encoding
}

type ViewMode = 'sources' | 'slots';

function getLuaPriority(path: string): number {
    const clean = path.replace(/^~/, '').replace(/\{[^}]*\}$/, '');
    return LUA_PRIORITIES[clean] ?? DEFAULT_LUA_PRIORITY;
}

/**
 * Computes slot contents using the same packing logic as the command generator.
 * This extracts the slot manifest comments and content from packed commands.
 */
function computeSlotContents(
    luaFileMap: Map<string, string>,
    paths: string[],
    slotType: LuaTweakType
): SlotContent[] {
    if (paths.length === 0) return [];

    // Resolve and sort sources (same as command generator)
    const sources: LuaSource[] = paths.map((originalRef) => ({
        path: originalRef,
        content: resolveLuaReference(originalRef, luaFileMap).trim(),
        priority: getLuaPriority(originalRef),
    }));
    sources.sort((a, b) => a.priority - b.priority);

    // Use the shared packing logic to generate commands
    const { commands } = packLuaSources(sources, slotType);

    // Extract slot content from the commands by decoding them
    return commands.map((command) => {
        // Command format: !bset <slotName> <base64EncodedContent>
        const parts = command.split(' ');
        const slotName = parts[1];
        const encodedContent = parts[2];

        // Decode to get the manifest + minified content
        const decoded = decode(encodedContent);
        // Extract the source manifest line
        const manifestMatch = decoded.match(/^-- Source: (\[.*?\])\n/);
        const sourcePaths: string[] = manifestMatch
            ? (JSON.parse(manifestMatch[1]) as string[])
            : [];

        // For display, we want the original (non-minified) content with manifest
        // Reconstruct by getting original content for each source
        const originalContents = sourcePaths
            .map((path) => {
                const source = sources.find((s) => s.path === path);
                return source?.content ?? '';
            })
            .filter(Boolean);

        const manifest = `-- Source: ${JSON.stringify(sourcePaths)}`;
        const content = `${manifest}\n${originalContents.join('\n\n')}`;

        return {
            slotName,
            type: slotType,
            sources: sourcePaths,
            content,
        };
    });
}

const LuaEditor: React.FC<LuaEditorProps> = ({ luaFiles, configuration }) => {
    const [viewMode, setViewMode] = useState<ViewMode>('slots');

    // Only include files from the lua/ folder (and subfolders)
    const luaFolderFiles = useMemo(() => {
        return luaFiles.filter((file) => file.path.startsWith('lua/'));
    }, [luaFiles]);

    // Compute slot contents based on configuration
    const slotContents = useMemo(() => {
        const luaFileMap = new Map(luaFiles.map((f) => [f.path, f.data]));
        const { tweakdefs: defsPaths, tweakunits: unitsPaths } =
            getMappedData(configuration);

        const tweakdefsSlots = computeSlotContents(
            luaFileMap,
            defsPaths,
            'tweakdefs'
        );
        const tweakunitsSlots = computeSlotContents(
            luaFileMap,
            unitsPaths,
            'tweakunits'
        );

        return [...tweakdefsSlots, ...tweakunitsSlots];
    }, [luaFiles, configuration]);

    const [selectedFile, setSelectedFile] = useState<string | null>(
        luaFolderFiles[0]?.path ?? null
    );
    const [selectedSlot, setSelectedSlot] = useState<string | null>(
        slotContents[0]?.slotName ?? null
    );

    // Persist edited files to localStorage
    const [storedEditedFiles, setStoredEditedFiles] = useLocalStorage<
        Record<string, EditedFile>
    >('nuttyb-edited-files', {});
    const [storedEditedSlots, setStoredEditedSlots] = useLocalStorage<
        Record<string, EditedFile>
    >('nuttyb-edited-slots', {});

    // Convert stored object to Map for internal use
    const editedFiles = useMemo(
        () => new Map(Object.entries(storedEditedFiles)),
        [storedEditedFiles]
    );
    const editedSlots = useMemo(
        () => new Map(Object.entries(storedEditedSlots)),
        [storedEditedSlots]
    );

    // Helper to update stored files
    const setEditedFiles = useCallback(
        (
            updater: (prev: Map<string, EditedFile>) => Map<string, EditedFile>
        ) => {
            setStoredEditedFiles((prev) => {
                const prevMap = new Map(Object.entries(prev));
                const nextMap = updater(prevMap);
                return Object.fromEntries(nextMap);
            });
        },
        [setStoredEditedFiles]
    );

    // Helper to update stored slots
    const setEditedSlots = useCallback(
        (
            updater: (prev: Map<string, EditedFile>) => Map<string, EditedFile>
        ) => {
            setStoredEditedSlots((prev) => {
                const prevMap = new Map(Object.entries(prev));
                const nextMap = updater(prevMap);
                return Object.fromEntries(nextMap);
            });
        },
        [setStoredEditedSlots]
    );

    const [searchQuery, setSearchQuery] = useState('');
    const clipboard = useClipboard({ timeout: 2000 });
    const base64Clipboard = useClipboard({ timeout: 2000 });

    // Filter files based on search
    const filteredFiles = useMemo(() => {
        if (!searchQuery) return luaFolderFiles;
        const query = searchQuery.toLowerCase();
        return luaFolderFiles.filter((file) =>
            file.path.toLowerCase().includes(query)
        );
    }, [luaFolderFiles, searchQuery]);

    // Filter slots based on search
    const filteredSlots = useMemo(() => {
        if (!searchQuery) return slotContents;
        const query = searchQuery.toLowerCase();
        return slotContents.filter(
            (slot) =>
                slot.slotName.toLowerCase().includes(query) ||
                slot.sources.some((s) => s.toLowerCase().includes(query))
        );
    }, [slotContents, searchQuery]);

    // Get current content for selected file
    const getCurrentContent = useCallback(
        (path: string): string => {
            const edited = editedFiles.get(path);
            if (edited) return edited.currentData;
            const original = luaFolderFiles.find((f) => f.path === path);
            return original?.data ?? '';
        },
        [editedFiles, luaFolderFiles]
    );

    // Get content for selected slot
    const getSlotContent = useCallback(
        (slotName: string): string => {
            const edited = editedSlots.get(slotName);
            if (edited) return edited.currentData;
            const slot = slotContents.find((s) => s.slotName === slotName);
            return slot?.content ?? '';
        },
        [editedSlots, slotContents]
    );

    // Check if file has been modified
    const isFileModified = useCallback(
        (path: string): boolean => {
            const edited = editedFiles.get(path);
            if (!edited) return false;
            return edited.currentData !== edited.originalData;
        },
        [editedFiles]
    );

    // Check if slot has been modified
    const isSlotModified = useCallback(
        (slotName: string): boolean => {
            const edited = editedSlots.get(slotName);
            if (!edited) return false;
            return edited.currentData !== edited.originalData;
        },
        [editedSlots]
    );

    // Get Base64 encoded size for a slot
    const getSlotB64Size = useCallback(
        (slotName: string): number => {
            const content = getSlotContent(slotName);
            return encode(minify(content.trim())).length;
        },
        [getSlotContent]
    );

    // Handle editor content change
    const handleEditorChange = useCallback(
        (value: string | undefined) => {
            if (value === undefined) return;

            if (viewMode === 'sources' && selectedFile) {
                const original = luaFolderFiles.find(
                    (f) => f.path === selectedFile
                );
                if (!original) return;

                setEditedFiles((prev) => {
                    const next = new Map(prev);
                    next.set(selectedFile, {
                        path: selectedFile,
                        originalData: original.data,
                        currentData: value,
                    });
                    return next;
                });
            } else if (viewMode === 'slots' && selectedSlot) {
                const original = slotContents.find(
                    (s) => s.slotName === selectedSlot
                );
                if (!original) return;

                setEditedSlots((prev) => {
                    const next = new Map(prev);
                    next.set(selectedSlot, {
                        path: selectedSlot,
                        originalData: original.content,
                        currentData: value,
                    });
                    return next;
                });
            }
        },
        [
            viewMode,
            selectedFile,
            selectedSlot,
            luaFolderFiles,
            slotContents,
            setEditedFiles,
            setEditedSlots,
        ]
    );

    // Reset file to original
    const resetFile = useCallback(
        (path: string) => {
            setEditedFiles((prev) => {
                const next = new Map(prev);
                next.delete(path);
                return next;
            });
        },
        [setEditedFiles]
    );

    // Reset slot to original
    const resetSlot = useCallback(
        (slotName: string) => {
            setEditedSlots((prev) => {
                const next = new Map(prev);
                next.delete(slotName);
                return next;
            });
        },
        [setEditedSlots]
    );

    // Download file
    const downloadFile = useCallback(() => {
        if (!selectedFile) return;
        const content = getCurrentContent(selectedFile);
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = selectedFile.split('/').pop() ?? 'file.lua';
        document.body.append(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    }, [selectedFile, getCurrentContent]);

    // Monaco editor mount handler
    const handleEditorMount: OnMount = useCallback(
        (editor: editor.IStandaloneCodeEditor) => {
            // Configure editor settings
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

    const selectedContent =
        viewMode === 'sources'
            ? selectedFile
                ? getCurrentContent(selectedFile)
                : ''
            : selectedSlot
              ? getSlotContent(selectedSlot)
              : '';
    const modifiedFileCount = [...editedFiles.values()].filter(
        (f) => f.currentData !== f.originalData
    ).length;
    const modifiedSlotCount = [...editedSlots.values()].filter(
        (f) => f.currentData !== f.originalData
    ).length;

    // Copy current content (works for both modes)
    const copyCurrentContent = useCallback(() => {
        if (viewMode === 'sources' && selectedFile) {
            clipboard.copy(getCurrentContent(selectedFile));
        } else if (viewMode === 'slots' && selectedSlot) {
            clipboard.copy(getSlotContent(selectedSlot));
        }
    }, [
        viewMode,
        selectedFile,
        selectedSlot,
        getCurrentContent,
        getSlotContent,
        clipboard,
    ]);

    // Copy as Base64 (works for both modes) - uses minified content for slots
    const copyCurrentAsBase64 = useCallback(() => {
        if (viewMode === 'sources' && selectedFile) {
            base64Clipboard.copy(
                encode(getCurrentContent(selectedFile).trim())
            );
        } else if (viewMode === 'slots' && selectedSlot) {
            const content = getSlotContent(selectedSlot);
            base64Clipboard.copy(encode(minify(content.trim())));
        }
    }, [
        viewMode,
        selectedFile,
        selectedSlot,
        getCurrentContent,
        getSlotContent,
        base64Clipboard,
    ]);

    // Get current display title
    const currentTitle = viewMode === 'sources' ? selectedFile : selectedSlot;
    const currentSlotInfo =
        viewMode === 'slots' && selectedSlot
            ? slotContents.find((s) => s.slotName === selectedSlot)
            : null;

    return (
        <Flex gap='md' style={{ height: 'calc(100vh - 200px)' }}>
            {/* File Explorer Sidebar */}
            <Paper withBorder p='sm' style={{ width: 280, flexShrink: 0 }}>
                <Stack gap='sm' style={{ height: '100%' }}>
                    {/* View Mode Switch */}
                    <SegmentedControl
                        size='xs'
                        value={viewMode}
                        onChange={(value) => setViewMode(value as ViewMode)}
                        data={[
                            { label: 'Source Files', value: 'sources' },
                            { label: 'Slot Content', value: 'slots' },
                        ]}
                    />

                    <Group justify='space-between'>
                        <Text fw={600} size='sm'>
                            {viewMode === 'sources' ? 'Files' : 'Slots'}
                        </Text>
                        {viewMode === 'sources' && modifiedFileCount > 0 && (
                            <Badge size='sm' color='yellow'>
                                {modifiedFileCount} modified
                            </Badge>
                        )}
                        {viewMode === 'slots' && modifiedSlotCount > 0 && (
                            <Badge size='sm' color='yellow'>
                                {modifiedSlotCount} modified
                            </Badge>
                        )}
                    </Group>

                    <TextInput
                        placeholder={
                            viewMode === 'sources'
                                ? 'Search files...'
                                : 'Search slots...'
                        }
                        size='xs'
                        leftSection={<IconSearch size={14} />}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.currentTarget.value)}
                    />

                    <ScrollArea style={{ flex: 1 }}>
                        <Stack gap={2}>
                            {viewMode === 'sources'
                                ? // Source Files List
                                  filteredFiles.map((file) => {
                                      const fileName = file.path
                                          .split('/')
                                          .pop();
                                      const isSelected =
                                          selectedFile === file.path;
                                      const isModified = isFileModified(
                                          file.path
                                      );

                                      return (
                                          <Box
                                              key={file.path}
                                              p='xs'
                                              style={{
                                                  cursor: 'pointer',
                                                  borderRadius: 4,
                                                  backgroundColor: isSelected
                                                      ? 'var(--mantine-color-blue-9)'
                                                      : 'transparent',
                                              }}
                                              onClick={() =>
                                                  setSelectedFile(file.path)
                                              }
                                          >
                                              <Group gap='xs' wrap='nowrap'>
                                                  <IconFile size={14} />
                                                  <Text
                                                      size='sm'
                                                      truncate
                                                      style={{ flex: 1 }}
                                                  >
                                                      {fileName}
                                                  </Text>
                                                  {isModified && (
                                                      <Badge
                                                          size='xs'
                                                          color='yellow'
                                                          variant='dot'
                                                      />
                                                  )}
                                              </Group>
                                          </Box>
                                      );
                                  })
                                : // Slots List
                                  filteredSlots.map((slot) => {
                                      const isSelected =
                                          selectedSlot === slot.slotName;
                                      const isModified = isSlotModified(
                                          slot.slotName
                                      );

                                      return (
                                          <Box
                                              key={slot.slotName}
                                              p='xs'
                                              style={{
                                                  cursor: 'pointer',
                                                  borderRadius: 4,
                                                  backgroundColor: isSelected
                                                      ? 'var(--mantine-color-blue-9)'
                                                      : 'transparent',
                                              }}
                                              onClick={() =>
                                                  setSelectedSlot(slot.slotName)
                                              }
                                          >
                                              <Stack gap={2}>
                                                  <Group gap='xs' wrap='nowrap'>
                                                      <IconPackage size={14} />
                                                      <Text
                                                          size='sm'
                                                          fw={500}
                                                          truncate
                                                          style={{ flex: 1 }}
                                                      >
                                                          {slot.slotName}
                                                      </Text>
                                                      {isModified && (
                                                          <Badge
                                                              size='xs'
                                                              color='yellow'
                                                              variant='dot'
                                                          />
                                                      )}
                                                      <Badge
                                                          size='xs'
                                                          color={
                                                              slot.type ===
                                                              'tweakdefs'
                                                                  ? 'cyan'
                                                                  : 'grape'
                                                          }
                                                      >
                                                          {slot.sources.length}
                                                      </Badge>
                                                  </Group>
                                                  <Group
                                                      gap='xs'
                                                      justify='space-between'
                                                  >
                                                      <Text
                                                          size='xs'
                                                          c='dimmed'
                                                          truncate
                                                          style={{ flex: 1 }}
                                                      >
                                                          {slot.sources
                                                              .map(
                                                                  (s) =>
                                                                      s
                                                                          .replace(
                                                                              /^~?lua\//,
                                                                              ''
                                                                          )
                                                                          .split(
                                                                              '{'
                                                                          )[0]
                                                              )
                                                              .join(', ')}
                                                      </Text>
                                                      <Text
                                                          size='xs'
                                                          c={
                                                              getSlotB64Size(
                                                                  slot.slotName
                                                              ) > MAX_SLOT_SIZE
                                                                  ? 'red'
                                                                  : 'dimmed'
                                                          }
                                                      >
                                                          {getSlotB64Size(
                                                              slot.slotName
                                                          ).toLocaleString()}
                                                          /
                                                          {MAX_SLOT_SIZE.toLocaleString()}
                                                      </Text>
                                                  </Group>
                                              </Stack>
                                          </Box>
                                      );
                                  })}
                        </Stack>
                    </ScrollArea>
                </Stack>
            </Paper>

            {/* Editor Panel */}
            <Paper withBorder style={{ flex: 1, overflow: 'hidden' }}>
                {currentTitle ? (
                    <Stack gap={0} style={{ height: '100%' }}>
                        {/* Editor Toolbar */}
                        <Flex
                            p='xs'
                            justify='space-between'
                            align='center'
                            style={{
                                borderBottom:
                                    '1px solid var(--mantine-color-dark-4)',
                            }}
                        >
                            <Group gap='xs'>
                                {viewMode === 'sources' ? (
                                    <IconCode size={16} />
                                ) : (
                                    <IconPackage size={16} />
                                )}
                                <Text size='sm' fw={500}>
                                    {currentTitle}
                                </Text>
                                {viewMode === 'sources' &&
                                    selectedFile &&
                                    isFileModified(selectedFile) && (
                                        <Badge size='xs' color='yellow'>
                                            Modified
                                        </Badge>
                                    )}
                                {viewMode === 'slots' &&
                                    selectedSlot &&
                                    isSlotModified(selectedSlot) && (
                                        <Badge size='xs' color='yellow'>
                                            Modified
                                        </Badge>
                                    )}
                                {viewMode === 'slots' && currentSlotInfo && (
                                    <Badge
                                        size='xs'
                                        color={
                                            currentSlotInfo.type === 'tweakdefs'
                                                ? 'cyan'
                                                : 'grape'
                                        }
                                    >
                                        {currentSlotInfo.type}
                                    </Badge>
                                )}
                                {viewMode === 'slots' && selectedSlot && (
                                    <Badge
                                        size='xs'
                                        color={
                                            getSlotB64Size(selectedSlot) >
                                            MAX_SLOT_SIZE
                                                ? 'red'
                                                : 'gray'
                                        }
                                        variant='outline'
                                    >
                                        B64:{' '}
                                        {getSlotB64Size(
                                            selectedSlot
                                        ).toLocaleString()}{' '}
                                        / {MAX_SLOT_SIZE.toLocaleString()}
                                    </Badge>
                                )}
                            </Group>

                            <Group gap='xs'>
                                {viewMode === 'sources' &&
                                    selectedFile &&
                                    isFileModified(selectedFile) && (
                                        <Tooltip label='Reset to original'>
                                            <ActionIcon
                                                variant='subtle'
                                                size='sm'
                                                onClick={() =>
                                                    resetFile(selectedFile)
                                                }
                                            >
                                                <IconRefresh {...ICON_STYLE} />
                                            </ActionIcon>
                                        </Tooltip>
                                    )}
                                {viewMode === 'slots' &&
                                    selectedSlot &&
                                    isSlotModified(selectedSlot) && (
                                        <Tooltip label='Reset to original'>
                                            <ActionIcon
                                                variant='subtle'
                                                size='sm'
                                                onClick={() =>
                                                    resetSlot(selectedSlot)
                                                }
                                            >
                                                <IconRefresh {...ICON_STYLE} />
                                            </ActionIcon>
                                        </Tooltip>
                                    )}
                                <Tooltip
                                    label={
                                        clipboard.copied
                                            ? 'Copied!'
                                            : 'Copy code'
                                    }
                                >
                                    <ActionIcon
                                        variant='subtle'
                                        size='sm'
                                        color={
                                            clipboard.copied ? 'green' : 'blue'
                                        }
                                        onClick={copyCurrentContent}
                                    >
                                        {clipboard.copied ? (
                                            <IconCheck {...ICON_STYLE} />
                                        ) : (
                                            <IconCopy {...ICON_STYLE} />
                                        )}
                                    </ActionIcon>
                                </Tooltip>
                                <Tooltip
                                    label={
                                        base64Clipboard.copied
                                            ? 'Copied!'
                                            : 'Copy as Base64'
                                    }
                                >
                                    <ActionIcon
                                        variant='subtle'
                                        size='sm'
                                        color={
                                            base64Clipboard.copied
                                                ? 'green'
                                                : 'blue'
                                        }
                                        onClick={copyCurrentAsBase64}
                                    >
                                        {base64Clipboard.copied ? (
                                            <IconCheck {...ICON_STYLE} />
                                        ) : (
                                                <IconTransform {...ICON_STYLE} />
                                        )}
                                    </ActionIcon>
                                </Tooltip>
                                {viewMode === 'sources' && (
                                    <Tooltip label='Download file'>
                                        <ActionIcon
                                            variant='subtle'
                                            size='sm'
                                            onClick={downloadFile}
                                        >
                                            <IconDownload {...ICON_STYLE} />
                                        </ActionIcon>
                                    </Tooltip>
                                )}
                            </Group>
                        </Flex>

                        {/* Monaco Editor */}
                        <Box style={{ flex: 1 }}>
                            <Editor
                                key={viewMode} // Force re-mount when switching modes
                                height='100%'
                                language='lua'
                                theme='vs-dark'
                                value={selectedContent}
                                onChange={handleEditorChange}
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
                ) : (
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
                )}
            </Paper>
        </Flex>
    );
};

export default LuaEditor;
