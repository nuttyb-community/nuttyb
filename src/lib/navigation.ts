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

const REPO_URL = 'https://github.com/nuttyb-community/nuttyb';

/** Off-site links shown on the landing page. */
export const EXTERNAL_LINKS = {
    repo: `${REPO_URL}/`,
    changelog: `${REPO_URL}/blob/main/CHANGELOG.md`,
    presetGuide: `${REPO_URL}/blob/main/docs/Preset-guide.md`,
    discord:
        'https://discord.com/channels/549281623154229250/1168959237641216131',
} as const;
