import {
    AppShell,
    AppShellHeader,
    AppShellMain,
    MantineProvider,
} from '@mantine/core';
import type { Metadata } from 'next';

import '@mantine/core/styles.css';
import './globals.css';
import { PageHeader } from '@/components/page-header';
import { Providers } from '@/components/providers';

export const metadata: Metadata = {
    title: 'NuttyB CE',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        // The theme is always dark, so a static attribute replaces ColorSchemeScript:
        // no inline script, and nothing to flash before hydration
        <html
            lang='en'
            data-mantine-color-scheme='dark'
            suppressHydrationWarning
        >
            <body>
                <MantineProvider forceColorScheme='dark'>
                    <Providers>
                        <AppShell header={{ height: 60 }}>
                            <AppShellHeader bg='dark.9' withBorder={false}>
                                <PageHeader />
                            </AppShellHeader>
                            <AppShellMain>{children}</AppShellMain>
                        </AppShell>
                    </Providers>
                </MantineProvider>
            </body>
        </html>
    );
}
