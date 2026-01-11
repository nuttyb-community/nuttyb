export interface Link {
    href: string;
    title: string;
}

export const LINKS: { [key: string]: Link } = {
    configurator: {
        href: '/configurator',
        title: 'Configurator',
    },
    data: {
        href: '/data',
        title: 'Data',
    },
    custom: {
        href: '/custom',
        title: 'Custom',
    },
    base64: {
        href: '/base64',
        title: 'Base64',
    },
    editor: {
        href: '/editor',
        title: 'Editor',
    },
} as const;
