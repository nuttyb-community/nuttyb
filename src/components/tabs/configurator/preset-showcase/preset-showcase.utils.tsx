import React from 'react';

import {
    IconBolt,
    IconDownload,
    IconFlame,
    IconMoodSmile,
    IconRotateDot,
    IconSparkles,
    IconUser,
} from '@tabler/icons-react';

import {
    Configuration,
    DEFAULT_CONFIGURATION,
} from '@/lib/command-generator/data/configuration';

/**
 * Unified icon registry — single source of truth for icon names,
 * display labels, and React components.
 */
export const ICON_MAP: Record<
    string,
    {
        label: string;
        component: React.ComponentType<{ size?: number; stroke?: number }>;
    }
> = {
    IconRotateDot: { label: 'Rotate', component: IconRotateDot },
    IconMoodSmile: { label: 'Smile', component: IconMoodSmile },
    IconFlame: { label: 'Flame', component: IconFlame },
    IconBolt: { label: 'Energy/Bolt', component: IconBolt },
    IconSparkles: { label: 'Sparkles', component: IconSparkles },
    IconDownload: { label: 'Download', component: IconDownload },
    IconUser: { label: 'User', component: IconUser },
};

/** Subset of icons available in the preset save/edit modal. */
export const ICON_OPTIONS = [
    'IconSparkles',
    'IconFlame',
    'IconBolt',
    'IconMoodSmile',
    'IconUser',
] as const;

/** Renders the Tabler icon component for a given icon name. */
export function getPresetIcon(iconName: string, size = 28) {
    const entry = ICON_MAP[iconName] ?? ICON_MAP.IconUser;
    const Icon = entry.component;
    return <Icon size={size} stroke={1.5} />;
}

/** Metadata for each Configuration key — used in tooltips and diff displays. */
const CONFIG_METADATA: Record<
    keyof Configuration,
    { label: string; tooltip: string }
> = {
    presetDifficulty: {
        label: 'Difficulty',
        tooltip: 'Preset base difficulty (Easy, Medium, Hard)',
    },
    lobbyName: {
        label: 'Lobby Name Tag',
        tooltip: 'Added to auto-generated lobby name',
    },
    gameMap: {
        label: 'Map',
        tooltip: 'Selected game map',
    },
    start: {
        label: 'Start',
        tooltip:
            'Starting conditions. "No rush" provides a 12-minute grace period.',
    },
    queenCount: {
        label: 'Raptor Queen Count',
        tooltip: 'Number of raptor queens (1 - 100)',
    },
    incomeMult: {
        label: 'Resource Income Multiplier',
        tooltip: 'Affects both energy and metal production (0.1 - 10)',
    },
    buildPowerMult: {
        label: 'Build Power Multiplier',
        tooltip: 'Affects build power (0.1 - 10)',
    },
    buildDistMult: {
        label: 'Build Distance Multiplier',
        tooltip:
            'Defines how far you can build compared to vanilla BAR (0.5 - 10)',
    },
    challenges: {
        label: 'Challenges',
        tooltip: 'Special waves and bosses challenges',
    },
    isEcoT4: {
        label: 'T4 Economy',
        tooltip: 'Legendary fusion reactors and energy converters',
    },
    isRFLRPCRebalance: {
        label: 'RFLRPC Rebalance',
        tooltip: 'Rebalance for Ragnarok, Calamity and Starfall',
    },
    isRFLRPCT4: {
        label: 'Epic RFLRPC',
        tooltip: 'Epic Ragnarok, Calamity and Starfall',
    },
    isMegaNuke: {
        label: 'Mega Nuke',
        tooltip: 'Enable Mega Nuke capability',
    },
};

/**
 * Computes the list of configuration overrides compared to defaults.
 * Shared by both the tooltip and the modal config-diff display.
 */
export function computeConfigDiff(
    config: Configuration
): Array<{ label: string; value: string; tooltip: string }> {
    const diffs: Array<{ label: string; value: string; tooltip: string }> = [];
    const defaultKeys = Object.keys(DEFAULT_CONFIGURATION) as Array<
        keyof typeof DEFAULT_CONFIGURATION
    >;
    for (const key of defaultKeys) {
        if (config[key] !== DEFAULT_CONFIGURATION[key]) {
            const meta = CONFIG_METADATA[key];
            if (meta) {
                let valDisplay = String(config[key]);
                if (typeof config[key] === 'boolean') {
                    valDisplay = config[key] ? 'Enabled' : 'Disabled';
                }
                diffs.push({
                    label: meta.label,
                    value: valDisplay,
                    tooltip: meta.tooltip,
                });
            }
        }
    }
    return diffs;
}

/**
 * Converts a `replaces` field (string | string[] | undefined) to a
 * comma-separated display string.
 */
function replacesToDisplayString(
    replaces: string | string[] | undefined
): string {
    if (!replaces) return '';
    if (Array.isArray(replaces)) return replaces.map(String).join(', ');
    return typeof replaces === 'string' ? replaces : '';
}

/** Form-friendly tweak row shape used by the modal. */
export interface TweakFormRow {
    id: string;
    description: string;
    type: 'tweakdefs' | 'tweakunits';
    path: string;
    replaces: string;
}

/**
 * Maps preset tweaks to form rows — shared by both edit and import flows.
 */
export function mapPresetTweaksToFormRows(
    tweaks: Array<{
        description?: string;
        type?: string;
        path?: string;
        replaces?: string | string[];
    }>
): TweakFormRow[] {
    return tweaks.map((t, index: number) => ({
        id: `tweak-${Date.now()}-${index}-${Math.random()}`,
        description: t.description || '',
        type:
            t.type === 'tweakunits'
                ? ('tweakunits' as const)
                : ('tweakdefs' as const),
        path: t.path || '',
        replaces: replacesToDisplayString(t.replaces),
    }));
}
