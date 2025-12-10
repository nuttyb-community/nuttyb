import React, { createContext, useContext } from 'react';

interface TweakDataContext {
    sections: string[];
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
    sections,
    children,
}: TweakDataProviderProps) {
    return (
        <TweakDataContext.Provider value={{ sections }}>
            {children}
        </TweakDataContext.Provider>
    );
}
