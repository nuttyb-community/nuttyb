'use client';

import { ConfiguratorProvider } from '@/components/contexts/configurator-context';
import { CustomTweaksProvider } from '@/components/contexts/custom-tweaks-context';
import { LuaBundleProvider } from '@/components/contexts/lua-bundle-context';
import { PresetsProvider } from '@/components/contexts/presets-context';

interface ProvidersProps {
    children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
    return (
        <LuaBundleProvider>
            <CustomTweaksProvider>
                <ConfiguratorProvider>
                    <PresetsProvider>{children}</PresetsProvider>
                </ConfiguratorProvider>
            </CustomTweaksProvider>
        </LuaBundleProvider>
    );
}
