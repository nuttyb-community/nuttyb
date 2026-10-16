import {
    AppShell,
    AppShellHeader,
    AppShellMain,
    ColorSchemeScript,
    Container,
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
                                <Container size={1600}>{children}</Container>
                            </AppShellMain>
                        </AppShell>
                    </Providers>
                </MantineProvider>
            </body>
        </html>
    );
}
