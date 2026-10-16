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

export type Challenges = (typeof CHALLENGES)[number];
export type GameMap = (typeof MAPS)[number];
export type StartOption = (typeof START_OPTIONS)[number];

export interface Configuration {
    challenges: Challenges;
    gameMap: GameMap;
    start: StartOption;
    lobbyName: string;
    isEcoT4: boolean;
    isRFLRPCRebalance: boolean;
    isRFLRPCT4: boolean;
    isMegaNuke: boolean;
    isT3GeoWalls: boolean;
    isCrossFactionT2: boolean;
    isDefencesT4: boolean;
    // Numeric multipliers
    raptorHpMult: number;
    queenHpMult: number;
    incomeMult: number;
    buildDistMult: number;
    buildPowerMult: number;
    queenCount: number;
}

export const DEFAULT_CONFIGURATION: Configuration = {
    challenges: 'Mini Bosses',
    gameMap: 'Full Metal Plate (12P)',
    start: 'No rush',
    lobbyName: '',
    isEcoT4: true,
    isRFLRPCRebalance: true,
    isRFLRPCT4: true,
    isMegaNuke: false,
    isT3GeoWalls: false,
    isCrossFactionT2: true,
    isDefencesT4: true,
    // Numeric multipliers
    raptorHpMult: 1.5,
    queenHpMult: 1.5,
    incomeMult: 1,
    buildDistMult: 1.5,
    buildPowerMult: 1,
    queenCount: 12,
};

/**
 * Generates the default lobby name tag from the challenge and the active
 * preset's name. Without a preset, the preset part is left out.
 */
export function getDefaultLobbyNameTag(
    config: { challenges: Challenges },
    presetName?: string
): string {
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

    const presetTag = presetName ? `[${presetName}]` : '';

    return `Raptors${challengeTag}${presetTag}[No Mex]`;
}
