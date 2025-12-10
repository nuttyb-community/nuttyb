'use client';

import { useEffect } from 'react';

import { useRouter } from 'next/navigation';

import { LINKS } from '@/lib/navigation';

/**
 * Root page that redirects to the configurator.
 * This replaces the server-side redirect in next.config.ts
 * which is not supported in static exports.
 */
export default function RootPage() {
    const router = useRouter();

    useEffect(() => {
        router.replace(LINKS.configurator.href);
    }, [router]);

    return null;
}
