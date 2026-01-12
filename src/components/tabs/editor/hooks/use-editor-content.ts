import { useCallback, useMemo, useState } from 'react';

import { useDebouncedCallback } from '@mantine/hooks';

import type { EditedFile } from '@/components/tabs/editor/hooks/use-editor-storage';
import type { SlotContent } from '@/hooks/use-slot-content';
import { beautify } from '@/lib/lua-utils/beautifier';
import type { LuaFile } from '@/types/types';

interface UseEditorContentProps {
    luaFolderFiles: LuaFile[];
    slotContents: SlotContent[];
    editedFiles: Map<string, EditedFile>;
    editedSlots: Map<string, EditedFile>;
    setEditedFiles: (
        updater: (prev: Map<string, EditedFile>) => Map<string, EditedFile>
    ) => void;
    setEditedSlots: (
        updater: (prev: Map<string, EditedFile>) => Map<string, EditedFile>
    ) => void;
}

export function useEditorContent({
    luaFolderFiles,
    slotContents,
    editedFiles,
    editedSlots,
    setEditedFiles,
    setEditedSlots,
}: UseEditorContentProps) {
    // Selection State
    const [rawSelectedFile, setRawSelectedFile] = useState<string | null>(null);
    const [rawSelectedSlot, setRawSelectedSlot] = useState<string | null>(null);

    const selectedFile = useMemo(() => {
        if (!rawSelectedFile) {
            return luaFolderFiles.length > 0 ? luaFolderFiles[0].path : null;
        }
        const exists = luaFolderFiles.some((f) => f.path === rawSelectedFile);
        return exists
            ? rawSelectedFile
            : luaFolderFiles.length > 0
              ? luaFolderFiles[0].path
              : null;
    }, [rawSelectedFile, luaFolderFiles]);

    const selectedSlot = useMemo(() => {
        if (!rawSelectedSlot) {
            return slotContents.length > 0 ? slotContents[0].slotName : null;
        }
        const exists = slotContents.some((s) => s.slotName === rawSelectedSlot);
        return exists
            ? rawSelectedSlot
            : slotContents.length > 0
              ? slotContents[0].slotName
              : null;
    }, [rawSelectedSlot, slotContents]);

    // Setters update raw selection
    const setSelectedFile = useCallback(
        (value: string | null) => setRawSelectedFile(value),
        []
    );
    const setSelectedSlot = useCallback(
        (value: string | null) => setRawSelectedSlot(value),
        []
    );

    // Pending Edits State
    const [pendingEdits, setPendingEdits] = useState<Map<string, string>>(
        new Map()
    );

    // Content Getters
    const getCurrentContent = useCallback(
        (path: string): string => {
            // Check pending edits first for immediate UI updates
            const pending = pendingEdits.get(`file:${path}`);
            if (pending !== undefined) return pending;

            const edited = editedFiles.get(path);
            if (edited) return edited.currentData;
            const original = luaFolderFiles.find((f) => f.path === path);
            return original?.data ?? '';
        },
        [pendingEdits, editedFiles, luaFolderFiles]
    );

    const getSlotContent = useCallback(
        (slotName: string): string => {
            // Check pending edits first for immediate UI updates
            const pending = pendingEdits.get(`slot:${slotName}`);
            if (pending !== undefined) return pending;

            const edited = editedSlots.get(slotName);
            if (edited) return edited.currentData;
            const slot = slotContents.find((s) => s.slotName === slotName);
            const content = slot?.content ?? '';

            // Beautify slot content for display in editor while keeping commands minified
            return beautify(content);
        },
        [pendingEdits, editedSlots, slotContents]
    );

    // Modification Checks
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

    // Change Handlers
    const debouncedFileWrite = useDebouncedCallback(
        (path: string, originalData: string, currentData: string) => {
            setEditedFiles((prev) => {
                const next = new Map(prev);
                next.set(path, {
                    path,
                    originalData,
                    currentData,
                });
                return next;
            });
            setPendingEdits((prev) => {
                const next = new Map(prev);
                next.delete(`file:${path}`);
                return next;
            });
        },
        500
    );

    const debouncedSlotWrite = useDebouncedCallback(
        (slotName: string, originalData: string, currentData: string) => {
            setEditedSlots((prev) => {
                const next = new Map(prev);
                next.set(slotName, {
                    path: slotName,
                    originalData,
                    currentData,
                });
                return next;
            });
            setPendingEdits((prev) => {
                const next = new Map(prev);
                next.delete(`slot:${slotName}`);
                return next;
            });
        },
        500
    );

    const handleFileChange = useCallback(
        (path: string, value: string) => {
            const original = luaFolderFiles.find((f) => f.path === path);
            if (!original) return;

            // Store in pending state for immediate UI updates
            setPendingEdits((prev) => {
                const next = new Map(prev);
                next.set(`file:${path}`, value);
                return next;
            });

            // Debounce the storage write
            debouncedFileWrite(path, original.data, value);
        },
        [luaFolderFiles, debouncedFileWrite]
    );

    const handleSlotChange = useCallback(
        (slotName: string, value: string) => {
            const original = slotContents.find((s) => s.slotName === slotName);
            if (!original) return;

            // Store in pending state for immediate UI updates
            setPendingEdits((prev) => {
                const next = new Map(prev);
                next.set(`slot:${slotName}`, value);
                return next;
            });

            // Debounce the storage write
            debouncedSlotWrite(slotName, beautify(original.content), value);
        },
        [slotContents, debouncedSlotWrite]
    );

    // Reset Handlers
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

    return {
        // Selection state
        selectedFile,
        selectedSlot,
        setSelectedFile,
        setSelectedSlot,
        // Content getters
        getCurrentContent,
        getSlotContent,
        // Modification checks
        isFileModified,
        isSlotModified,
        // Change handlers
        handleFileChange,
        handleSlotChange,
        // Reset handlers
        resetFile,
        resetSlot,
    };
}
