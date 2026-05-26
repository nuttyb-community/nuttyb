export const PRESET_DIFFICULTIES = ['Easy', 'Medium', 'Hard'] as const;
export const CHALLENGES = [
    'None',
    'Mini Bosses',
    'Mini Bosses Extended',
    'Experimental Wave Challenge',
] as const;
export const MAPS = [
    'Full Metal Plate (12P)',
    'Raptor Crater (16P)',
    'Raptor Crater Inverted (16P)',
    'Special Hotstepper (16P)',
    'To Kill The Middle (12P)',
    'Ancient Bastion Remake (8P)',
    'Ancient Vault (12P)',
    'Bismuth Valley (8P)',
    'Darkside (12P)',
    'Flats and Forests (12P)',
    'Special Creek (12P)',
    'Starwatcher (8P)',
] as const;
export const START_OPTIONS = [
    'No rush',
    'No rush solo',
    'Zero grace',
    'Surrounded',
] as const;

export type PresetDifficulty = (typeof PRESET_DIFFICULTIES)[number];
export type Challenges = (typeof CHALLENGES)[number];
export type GameMap = (typeof MAPS)[number];
export type StartOption = (typeof START_OPTIONS)[number];

export interface Configuration {
    presetDifficulty: PresetDifficulty;
    challenges: Challenges;
    gameMap: GameMap;
    start: StartOption;
    lobbyName: string;
    isEcoT4: boolean;
    isRFLRPCRebalance: boolean;
    isRFLRPCT4: boolean;
    isMegaNuke: boolean;
    // Numeric multipliers
    incomeMult: number;
    buildDistMult: number;
    buildPowerMult: number;
    queenCount: number;
}

export const DEFAULT_CONFIGURATION: Configuration = {
    presetDifficulty: 'Medium',
    challenges: 'Mini Bosses',
    gameMap: 'Full Metal Plate (12P)',
    start: 'No rush',
    lobbyName: '',
    isEcoT4: true,
    isRFLRPCRebalance: true,
    isRFLRPCT4: true,
    isMegaNuke: false,
    // Numeric multipliers
    incomeMult: 1,
    buildDistMult: 1.5,
    buildPowerMult: 1,
    queenCount: 12,
};

/**
 * Generates the default lobby name tag based on configuration settings.
 */
export function getDefaultLobbyNameTag(config: {
    presetDifficulty: PresetDifficulty;
    challenges: Challenges;
}): string {
    let diffTag = '1_5x';
    switch (config.presetDifficulty) {
        case 'Easy':
            diffTag = '1_3x';
            break;
        case 'Hard':
            diffTag = '3x';
            break;
        // No default
    }

    let challengeTag = '';
    switch (config.challenges) {
        case 'Mini Bosses':
            challengeTag = ' [Mini Bosses]';

            break;

        case 'Mini Bosses Extended':
            challengeTag = ' [Mini Bosses Ext]';

            break;

        case 'Experimental Wave Challenge':
            challengeTag = ' [Expo Waves]';

            break;

        // No default
    }

    return `Raptors${challengeTag}[${diffTag} QHP ${diffTag} HP][No Mex]`;
}
