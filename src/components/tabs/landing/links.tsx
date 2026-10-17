import React from 'react';

import {
    IconArrowsSplit,
    IconBellRinging,
    IconBook,
    IconBrandDiscord,
    IconBrandGithub,
    IconBuildingFactory2,
    IconFileDescription,
    IconGrid4x4,
    IconLayoutDashboard,
    IconRecycle,
    IconRuler2,
    IconStack2,
    IconWorld,
} from '@tabler/icons-react';

import { EXTERNAL_LINKS } from '@/lib/navigation';

import type { LinkItem } from './link-items';

export const WIDGETS: LinkItem[] = [
    {
        title: 'Raptor Panel',
        href: 'https://github.com/goldjee/BAR-Widgets/tree/main/src/raptor-panel',
        description:
            'Real-time player economy, raptor evolution, queen spawn ETA and queen health.',
        icon: <IconLayoutDashboard />,
    },
    {
        title: 'Raptor Notifications',
        href: 'https://github.com/goldjee/BAR-Widgets/tree/main/src/raptor-notifications',
        description:
            'In-chat reminders for when to build defences, when grace ends and when queens spawn.',
        icon: <IconBellRinging />,
    },
    {
        title: 'Raptor Grid Draw',
        href: 'https://github.com/goldjee/BAR-Widgets/tree/main/src/raptor-fmp-grid-draw',
        description:
            'Splits Full Metal Plate into equal spots so everyone gets enough buildable space.',
        icon: <IconGrid4x4 />,
    },
    {
        title: 'Layout Planner',
        href: 'https://github.com/goldjee/BAR-Widgets/tree/main/src/layout-planner',
        description: 'Draw, save and load your base layouts.',
        icon: <IconRuler2 />,
    },
    {
        title: 'Reclaim Selected',
        href: 'https://github.com/goldjee/BAR-Widgets/tree/main/src/reclaim-selected',
        description:
            'Adds a command button to reclaim all selected units and buildings.',
        icon: <IconRecycle />,
    },
    {
        title: 'Holo Place',
        href: 'https://github.com/goldjee/BAR-Widgets/tree/main/src/holo-place',
        description:
            'Places the next building in the queue when the current one is almost done.',
        icon: <IconBuildingFactory2 />,
    },
    {
        title: 'Build Orders',
        href: 'https://github.com/goldjee/BAR-Widgets/tree/main/src/build-orders',
        description: 'Build structures over other existing ones.',
        icon: <IconStack2 />,
    },
    {
        title: 'Copy Queue',
        href: 'https://github.com/goldjee/BAR-Widgets/tree/main/src/split-builder-queue',
        description: 'Split a long build queue between multiple constructors.',
        icon: <IconArrowsSplit />,
    },
];

export const COMMUNITY: LinkItem[] = [
    {
        title: 'GitHub repository',
        href: EXTERNAL_LINKS.repo,
        description: 'Report bugs and request new features.',
        icon: <IconBrandGithub />,
    },
    {
        title: 'Discord',
        href: EXTERNAL_LINKS.discord,
        description: 'Official Discord channel for NuttyB tweaks.',
        icon: <IconBrandDiscord />,
    },
    {
        title: 'Guide for noobs',
        href: 'https://docs.google.com/document/d/11FfEiKAjp0NSKTwvmywqUNefrOqVapnW5e3o5azSmXY/',
        description: 'How to play NuttyB Raptors as a new player.',
        icon: <IconBook />,
    },
    {
        title: 'Preset guide',
        href: EXTERNAL_LINKS.presetGuide,
        description: 'Save, share and overlay custom configurations.',
        icon: <IconFileDescription />,
    },
    {
        title: 'Beyond All Reason',
        href: 'https://www.beyondallreason.info/',
        description: 'The game itself. Replays can be downloaded here.',
        icon: <IconWorld />,
    },
];
