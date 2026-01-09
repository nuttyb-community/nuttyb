'use client';

import React, { useCallback, useMemo, useState } from 'react';

import { Flex } from '@mantine/core';

import { useCustomTweaksContext } from '@/components/contexts/custom-tweaks-context';
import { EditorPanel } from '@/components/tabs/editor/editor-panel';
import { EditorSidebar } from '@/components/tabs/editor/editor-sidebar';
import { useEditorStorage } from '@/hooks/use-editor-storage';
import { useSlotContents } from '@/hooks/use-slot-contents';
import type { Configuration } from '@/lib/command-generator/data/configuration';
import { encode } from '@/lib/encoders/base64';
import { minify } from '@/lib/lua-utils/minificator';
import type { LuaFile } from '@/types/types';

interface LuaEditorProps {
    luaFiles: LuaFile[];
    configuration: Configuration;
}

type ViewMode = 'sources' | 'slots';

const LuaEditor: React.FC<LuaEditorProps> = ({ luaFiles, configuration }) => {
    const [viewMode, setViewMode] = useState<ViewMode>('slots');
    const { getEnabledTweaks } = useCustomTweaksContext();

    // Extract files from lua/ folder
    const luaFolderFiles = useMemo(() => {
        return luaFiles.filter((file) => file.path.startsWith('lua/'));
    }, [luaFiles]);

    // Compute slot contents
    const slotContents = useSlotContents(
        luaFiles,
        configuration,
        getEnabledTweaks
    );

    // Storage management
    const {
        editedFiles,
        editedSlots,
        setEditedFiles,
        setEditedSlots,
        modifiedFileCount,
        modifiedSlotCount,
    } = useEditorStorage();

    // Selection state
    const [selectedFile, setSelectedFile] = useState<string | null>(null);
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

    // Auto-select first file/slot
    React.useEffect(() => {
        if (!selectedFile && luaFolderFiles.length > 0) {
            setSelectedFile(luaFolderFiles[0].path);
        }
    }, [selectedFile, luaFolderFiles]);

    React.useEffect(() => {
        if (!selectedSlot && slotContents.length > 0) {
            setSelectedSlot(slotContents[0].slotName);
        }
    }, [selectedSlot, slotContents]);

    // Content getters
    const getCurrentContent = useCallback(
        (path: string): string => {
            const edited = editedFiles.get(path);
            if (edited) return edited.currentData;
            const original = luaFolderFiles.find((f) => f.path === path);
            return original?.data ?? '';
        },
        [editedFiles, luaFolderFiles]
    );

    const getSlotContent = useCallback(
        (slotName: string): string => {
            const edited = editedSlots.get(slotName);
            if (edited) return edited.currentData;
            const slot = slotContents.find((s) => s.slotName === slotName);
            return slot?.content ?? '';
        },
        [editedSlots, slotContents]
    );

    // Modification checks
    const isFileModified = useCallback(
        (path: string): boolean => {
            const edited = editedFiles.get(path);
            if (!edited) return false;
            return edited.currentData !== edited.originalData;
        },
        [editedFiles]
    );

    const isSlotModified = useCallback(
        (slotName: string): boolean => {
            const edited = editedSlots.get(slotName);
            if (!edited) return false;
            return edited.currentData !== edited.originalData;
        },
        [editedSlots]
    );

    // Slot size calculation
    const getSlotB64Size = useCallback(
        (slotName: string): number => {
            try {
                const content = getSlotContent(slotName);
                return encode(minify(content.trim())).length;
            } catch {
                const content = getSlotContent(slotName);
                return encode(content.trim()).length;
            }
        },
        [getSlotContent]
    );

    // File size calculation
    const getFileB64Size = useCallback(
        (path: string): number => {
            try {
                const content = getCurrentContent(path);
                return encode(minify(content.trim())).length;
            } catch {
                const content = getCurrentContent(path);
                return encode(content.trim()).length;
            }
        },
        [getCurrentContent]
    );

    // Editor change handler
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

    // Reset handlers
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

    // Download handler
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

    // Current state
    const currentContent =
        viewMode === 'sources'
            ? selectedFile
                ? getCurrentContent(selectedFile)
                : ''
            : selectedSlot
              ? getSlotContent(selectedSlot)
              : '';

    const currentTitle = viewMode === 'sources' ? selectedFile : selectedSlot;
    const currentIsModified =
        viewMode === 'sources'
            ? selectedFile
                ? isFileModified(selectedFile)
                : false
            : selectedSlot
              ? isSlotModified(selectedSlot)
              : false;

    const currentSlotInfo =
        viewMode === 'slots' && selectedSlot
            ? (() => {
                  const slot = slotContents.find(
                      (s) => s.slotName === selectedSlot
                  );
                  return slot
                      ? {
                            type: slot.type,
                            slotSize: getSlotB64Size(selectedSlot),
                        }
                      : null;
              })()
            : null;

    const handleReset = () => {
        if (viewMode === 'sources' && selectedFile) {
            resetFile(selectedFile);
        } else if (viewMode === 'slots' && selectedSlot) {
            resetSlot(selectedSlot);
        }
    };

    return (
        <Flex gap='md' style={{ height: 'calc(100vh - 200px)' }}>
            <EditorSidebar
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                luaFiles={luaFolderFiles}
                slotContents={slotContents}
                selectedFile={selectedFile}
                selectedSlot={selectedSlot}
                onSelectFile={setSelectedFile}
                onSelectSlot={setSelectedSlot}
                isFileModified={isFileModified}
                isSlotModified={isSlotModified}
                getSlotSize={getSlotB64Size}
                getFileSize={getFileB64Size}
                modifiedFileCount={modifiedFileCount}
                modifiedSlotCount={modifiedSlotCount}
            />
            <EditorPanel
                viewMode={viewMode}
                currentTitle={currentTitle}
                currentContent={currentContent}
                isModified={currentIsModified}
                slotInfo={currentSlotInfo}
                onChange={handleEditorChange}
                onReset={handleReset}
                onDownload={viewMode === 'sources' ? downloadFile : undefined}
            />
        </Flex>
    );
};

export default LuaEditor;
