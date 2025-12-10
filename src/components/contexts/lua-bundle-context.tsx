'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

import type { LuaFile } from '@/types/types';

// Get basePath from Next.js config at build time
const basePath = process.env.__NEXT_ROUTER_BASEPATH || '';

interface LuaBundle {
    sha: string;
    files: LuaFile[];
}

interface LuaBundleContext {
    luaFiles: LuaFile[];
    sha: string | null;
    isLoading: boolean;
    error: Error | null;
}

const LuaBundleContext = createContext<LuaBundleContext | undefined>(undefined);

export function useLuaBundleContext(): LuaBundleContext {
    const context = useContext(LuaBundleContext);

    if (!context)
        throw new Error(
            'useLuaBundleContext must be used within a LuaBundleProvider'
        );

    return context;
}

interface LuaBundleProviderProps {
    children: React.ReactNode;
}

export function LuaBundleProvider({ children }: LuaBundleProviderProps) {
    const [luaFiles, setLuaFiles] = useState<LuaFile[]>([]);
    const [sha, setSha] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        let mounted = true;

        async function fetchLuaBundle() {
            try {
                const response = await fetch(
                    `${basePath}/data/lua-bundle.json`
                );
                if (!response.ok) {
                    throw new Error(
                        `Failed to fetch Lua bundle: ${response.status}`
                    );
                }
                const bundle = (await response.json()) as LuaBundle;

                if (mounted) {
                    setLuaFiles(bundle.files);
                    setSha(bundle.sha);
                    setIsLoading(false);
                }
            } catch (error_) {
                if (mounted) {
                    setError(error_ as Error);
                    setIsLoading(false);
                }
            }
        }

        void fetchLuaBundle();

        return () => {
            mounted = false;
        };
    }, []);

    const value: LuaBundleContext = {
        luaFiles,
        sha,
        isLoading,
        error,
    };

    return (
        <LuaBundleContext.Provider value={value}>
            {children}
        </LuaBundleContext.Provider>
    );
}
