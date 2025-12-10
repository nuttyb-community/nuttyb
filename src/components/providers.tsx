'use client';

import { ConfiguratorProvider } from '@/components/contexts/configurator-context';
import { CustomTweaksProvider } from '@/components/contexts/custom-tweaks-context';
import { LuaBundleProvider } from '@/components/contexts/lua-bundle-context';

interface ProvidersProps {
    children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
    return (
        <LuaBundleProvider>
            <CustomTweaksProvider>
                <ConfiguratorProvider>{children}</ConfiguratorProvider>
            </CustomTweaksProvider>
        </LuaBundleProvider>
    );
}
