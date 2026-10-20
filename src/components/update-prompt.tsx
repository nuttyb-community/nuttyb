'use client';

import React, { useEffect, useState } from 'react';

import {
    Affix,
    Box,
    Button,
    Center,
    CloseButton,
    Group,
    Text,
} from '@mantine/core';

import { PageWrapper } from '@/components/page-wrapper';

const CHECK_INTERVAL_MS = 1000;

/** Prompts for a reload once the deployed version.txt (written by next.config.ts) differs from this bundle's SHA */
export const UpdatePrompt: React.FC = () => {
    const [stale, setStale] = useState(false);
    const [dismissed, setDismissed] = useState(false);

    useEffect(() => {
        // temporarily comment it to see the prompt in dev environment
        if (process.env.NODE_ENV === 'development' || stale) return;

        const check = () => {
            if (document.visibilityState !== 'visible') return;
            fetch(`${process.env.NEXT_PUBLIC_BASE_PATH}/version.txt`, {
                cache: 'no-store',
            })
                .then((response) => (response.ok ? response.text() : null))
                .then((sha) => {
                    if (sha && sha.trim() !== process.env.NEXT_PUBLIC_GIT_SHA)
                        setStale(true);
                })
                // Offline or a deploy in progress isn't a new version
                .catch(() => {});
        };

        const interval = setInterval(check, CHECK_INTERVAL_MS);
        document.addEventListener('visibilitychange', check);
        return () => {
            clearInterval(interval);
            document.removeEventListener('visibilitychange', check);
        };
    }, [stale]);

    if (!stale || dismissed) return null;

    return (
        // Overlays the page instead of pushing it down: some pages fill the window below the header
        <Affix
            position={{
                top: 'var(--app-shell-header-height)',
                left: 0,
                right: 0,
            }}
        >
            <Box
                // bg='blue.8'
                py='xs'
                style={{
                    background:
                        'linear-gradient(90deg, color-mix(in srgb, var(--mantine-color-blue-9) 85%, transparent), color-mix(in srgb, var(--mantine-color-blue-7) 60%, transparent), color-mix(in srgb, var(--mantine-color-blue-9) 85%, transparent))',
                    backdropFilter: 'blur(8px)',
                    // Mantine's shadows are too faint on the dark theme
                    boxShadow: '0 4px 24px var(--mantine-color-dark-8)',
                }}
            >
                <PageWrapper>
                    <Center>
                        <Group wrap='nowrap'>
                            <Text fw={500} c='gray.0'>
                                A new version is available
                            </Text>
                            <Group gap='xs' wrap='nowrap'>
                                {/* No auto-reload: the configurator may hold unsaved changes */}
                                <Button
                                    size='xs'
                                    variant='white'
                                    onClick={() => location.reload()}
                                >
                                    Refresh
                                </Button>
                                <CloseButton
                                    variant='transparent'
                                    c='white'
                                    aria-label='Dismiss'
                                    onClick={() => setDismissed(true)}
                                />
                            </Group>
                        </Group>
                    </Center>
                </PageWrapper>
            </Box>
        </Affix>
    );
};
