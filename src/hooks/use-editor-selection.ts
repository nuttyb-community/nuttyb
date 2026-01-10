import { useState } from 'react';

import type { SlotContent } from '@/hooks/use-slot-content';
import type { LuaFile } from '@/types/types';

interface UseEditorSelectionProps {
    luaFolderFiles: LuaFile[];
    slotContents: SlotContent[];
}

export function useEditorSelection({
    luaFolderFiles,
    slotContents,
}: UseEditorSelectionProps) {
    const [selectedFile, setSelectedFile] = useState<string | null>(
        luaFolderFiles.length > 0 ? luaFolderFiles[0].path : null
    );

    const [selectedSlot, setSelectedSlot] = useState<string | null>(
        slotContents.length > 0 ? slotContents[0].slotName : null
    );

    return {
        selectedFile,
        selectedSlot,
        setSelectedFile,
        setSelectedSlot,
    };
}
