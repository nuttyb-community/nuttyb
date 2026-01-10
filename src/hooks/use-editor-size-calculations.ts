import { encode } from '@/lib/encoders/base64';
import { minify } from '@/lib/lua-utils/minificator';

interface UseEditorSizeCalculationsProps {
    getCurrentContent: (path: string) => string;
    getSlotContent: (slotName: string) => string;
}

export function useEditorSizeCalculations({
    getCurrentContent,
    getSlotContent,
}: UseEditorSizeCalculationsProps) {
    // Slot size calculation
    const getSlotB64Size = (slotName: string): number => {
        try {
            const content = getSlotContent(slotName);
            return encode(minify(content.trim())).length;
        } catch {
            const content = getSlotContent(slotName);
            return encode(content.trim()).length;
        }
    };

    // File size calculation
    const getFileB64Size = (path: string): number => {
        try {
            const content = getCurrentContent(path);
            return encode(minify(content.trim())).length;
        } catch {
            const content = getCurrentContent(path);
            return encode(content.trim()).length;
        }
    };

    return {
        getSlotB64Size,
        getFileB64Size,
    };
}
