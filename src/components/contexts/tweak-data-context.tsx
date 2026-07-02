import React, { createContext, useContext } from 'react';

/**
 * Minimal display type for dropped custom tweaks.
 * Contains only the fields needed for UI display.
 */
export interface DroppedTweak {
    description: string;
    type: 'tweakdefs' | 'tweakunits';
}

interface TweakDataContext {
    /** All generated commands joined into one copyable text block */
    commandText: string;
    slotUsage?: {
        tweakdefs: { used: number; total: number };
        tweakunits: { used: number; total: number };
    };
    error?: string;
    droppedTweaks: DroppedTweak[];
}

const TweakDataContext = createContext<TweakDataContext | undefined>(undefined);

export function useTweakDataContext(): TweakDataContext {
    const context = useContext(TweakDataContext);

    if (!context)
        throw new Error(
            'useTweakDataContext must be used within a TweakDataProvider'
        );

    return context;
}

type TweakDataProviderProps = TweakDataContext & {
    children: React.ReactNode;
};

export function TweakDataProvider({
    commandText,
    slotUsage,
    error,
    droppedTweaks,
    children,
}: TweakDataProviderProps) {
    return (
        <TweakDataContext.Provider
            value={{
                commandText,
                slotUsage,
                error,
                droppedTweaks,
            }}
        >
            {children}
        </TweakDataContext.Provider>
    );
}
