export interface Link {
    href: string;
    title: string;
}

export const LINKS = {
    configurator: {
        href: '/configurator',
        title: 'Configurator',
    },
    tools: {
        editor: {
            href: '/tools/editor',
            title: 'Lua editor',
        },
        base64: {
            href: '/tools/base64',
            title: 'Base64',
        },
    },
} as const;
