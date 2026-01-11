import {
    AppShell,
    AppShellHeader,
    AppShellMain,
    ColorSchemeScript,
    mantineHtmlProps,
    MantineProvider,
} from '@mantine/core';
import type { Metadata } from 'next';

import '@mantine/core/styles.css';
import { PageHeader } from '@/components/page-header';
import { PageWrapper } from '@/components/page-wrapper';
import { Providers } from '@/components/providers';

export const metadata: Metadata = {
    title: 'NuttyB Community Configurator',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang='en' {...mantineHtmlProps}>
            <head>
                <ColorSchemeScript />
            </head>
            <body className={'antialiased'}>
                <MantineProvider
                    defaultColorScheme='dark'
                    forceColorScheme='dark'
                >
                    <Providers>
                        <AppShell padding='md' header={{ height: 60 }}>
                            <AppShellHeader bg='dark' withBorder={false}>
                                <PageHeader />
                            </AppShellHeader>
                            <AppShellMain>
                                <PageWrapper>{children}</PageWrapper>
                            </AppShellMain>
                        </AppShell>
                    </Providers>
                </MantineProvider>
            </body>
        </html>
    );
}
