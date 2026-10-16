import {
    AppShell,
    AppShellHeader,
    AppShellMain,
    mantineHtmlProps,
    MantineProvider,
} from '@mantine/core';
import type { Metadata } from 'next';

import '@mantine/core/styles.css';
import { PageHeader } from '@/components/page-header';
import { Providers } from '@/components/providers';

export const metadata: Metadata = {
    title: 'NuttyB CE Configurator',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        // The theme is always dark, so the HTML starts dark: no ColorSchemeScript,
        // which would default to light and flash it until hydration
        <html lang='en' {...mantineHtmlProps} data-mantine-color-scheme='dark'>
            <body>
                <MantineProvider
                    defaultColorScheme='dark'
                    forceColorScheme='dark'
                >
                    <Providers>
                        <AppShell header={{ height: 60 }}>
                            <AppShellHeader bg='dark' withBorder={false}>
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
