import { useCallback, useMemo } from 'react';

import { useLocalStorage } from '@/hooks/use-local-storage';

export interface EditedFile {
    path: string;
    originalData: string;
    currentData: string;
}

export function useEditorStorage() {
    const [storedEditedFiles, setStoredEditedFiles] = useLocalStorage<
        Record<string, EditedFile>
    >('nuttyb-edited-files', {});
    const [storedEditedSlots, setStoredEditedSlots] = useLocalStorage<
        Record<string, EditedFile>
    >('nuttyb-edited-slots', {});

    const editedFiles = useMemo(
        () => new Map(Object.entries(storedEditedFiles)),
        [storedEditedFiles]
    );
    const editedSlots = useMemo(
        () => new Map(Object.entries(storedEditedSlots)),
        [storedEditedSlots]
    );

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

    const modifiedFileCount = useMemo(
        () =>
            [...editedFiles.values()].filter(
                (f) => f.currentData !== f.originalData
            ).length,
        [editedFiles]
    );

    const modifiedSlotCount = useMemo(
        () =>
            [...editedSlots.values()].filter(
                (f) => f.currentData !== f.originalData
            ).length,
        [editedSlots]
    );

    return {
        editedFiles,
        editedSlots,
        setEditedFiles,
        setEditedSlots,
        modifiedFileCount,
        modifiedSlotCount,
    };
}
