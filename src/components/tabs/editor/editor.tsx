'use client';

import React, { useCallback, useMemo, useState } from 'react';

import { Flex } from '@mantine/core';

import { useCustomTweaksContext } from '@/components/contexts/custom-tweaks-context';
import { EditorPanel } from '@/components/tabs/editor/editor-panel';
import { EditorSidebar } from '@/components/tabs/editor/editor-sidebar';
import { useEditorContent } from '@/hooks/use-editor-content';
import { useEditorSelection } from '@/hooks/use-editor-selection';
import { useEditorSizeCalculations } from '@/hooks/use-editor-size-calculations';
import { useEditorStorage } from '@/hooks/use-editor-storage';
import { useSlotContents } from '@/hooks/use-slot-contents';
import type { Configuration } from '@/lib/command-generator/data/configuration';
import type { LuaFile } from '@/types/types';

import { ViewMode } from './types';

interface LuaEditorProps {
    luaFiles: LuaFile[];
    configuration: Configuration;
}

export const LuaEditor: React.FC<LuaEditorProps> = ({
    luaFiles,
    configuration,
}) => {
    const [viewMode, setViewMode] = useState<ViewMode>('slots');
    const { getEnabledTweaks } = useCustomTweaksContext();

    // Extract files from lua/ folder
    const luaFolderFiles = useMemo(() => {
        return luaFiles.filter((file) => file.path.startsWith('lua/'));
    }, [luaFiles]);

    // Get enabled custom tweaks
    const enabledTweaks = getEnabledTweaks();

    // Compute slot contents
    const slotContents = useSlotContents(
        luaFiles,
        configuration,
        enabledTweaks
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
    const { selectedFile, selectedSlot, setSelectedFile, setSelectedSlot } =
        useEditorSelection({ luaFolderFiles, slotContents });

    // Content management
    const {
        getCurrentContent,
        getSlotContent,
        isFileModified,
        isSlotModified,
        handleFileChange,
        handleSlotChange,
        resetFile,
        resetSlot,
    } = useEditorContent({
        luaFolderFiles,
        slotContents,
        editedFiles,
        editedSlots,
        setEditedFiles,
        setEditedSlots,
    });

    // Size calculations
    const { getSlotB64Size, getFileB64Size } = useEditorSizeCalculations({
        getCurrentContent,
        getSlotContent,
    });

    // Editor change handler
    const handleEditorChange = useCallback(
        (value: string | undefined) => {
            if (value === undefined) return;

            if (viewMode === 'sources' && selectedFile) {
                handleFileChange(selectedFile, value);
            } else if (viewMode === 'slots' && selectedSlot) {
                handleSlotChange(selectedSlot, value);
            }
        },
        [
            viewMode,
            selectedFile,
            selectedSlot,
            handleFileChange,
            handleSlotChange,
        ]
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

    const currentSlotInfo = useMemo(() => {
        if (viewMode !== 'slots' || !selectedSlot) return null;

        const slot = slotContents.find((s) => s.slotName === selectedSlot);
        return slot
            ? {
                  type: slot.type,
                  slotSize: getSlotB64Size(selectedSlot),
              }
            : null;
    }, [viewMode, selectedSlot, slotContents, getSlotB64Size]);

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
