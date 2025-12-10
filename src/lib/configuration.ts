export const MODES = ['Raptors', 'Scavengers'] as const;
export const DIFFICULTIES = [
    'Default',
    'Very Easy',
    'Easy',
    'Normal',
    'Hard',
    'Very Hard',
    'Epic',
] as const;
export const EXTRAS = [
    'None',
    'Mini Bosses',
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
export const HEALTH_VALUES = [
    '1.3x',
    '1.5x',
    '1.7x',
    '2.0x',
    '2.5x',
    '3.0x',
    '4.0x',
    '5.0x',
] as const;
export const BOSS_HEALTH_VALUES = [
    '1.3x',
    '1.5x',
    '1.7x',
    '2.0x',
    '2.5x',
    '3.0x',
    '4.0x',
    '5.0x',
    '7.0x',
    '9.0x',
    '11.0x',
    '13.0x',
] as const;

export type Mode = (typeof MODES)[number];
export type Difficulty = (typeof DIFFICULTIES)[number];
export type Extras = (typeof EXTRAS)[number];
export type GameMap = (typeof MAPS)[number];
export type StartOption = (typeof START_OPTIONS)[number];
export type HealthValue = (typeof HEALTH_VALUES)[number];
export type BossHealthValue = (typeof BOSS_HEALTH_VALUES)[number];

export interface Configuration {
    isMainTweaks: boolean;
    isEvolvingCommanders: boolean;
    mode: Mode;
    difficulty: Difficulty;
    enemyHealth: HealthValue;
    bossHealth: BossHealthValue;
    extras: Extras;
    gameMap: GameMap;
    start: StartOption;
    lobbyName: string;
    isCrossFactionT2: boolean;
    isT3Eco: boolean;
    isT3Builders: boolean;
    isUnitLaunchers: boolean;
    isLrpcRebalance: boolean;
    isT4Defences: boolean;
    isT4AirRework: boolean;
    isMegaNuke: boolean;
}

export const DEFAULT_CONFIGURATION: Configuration = {
    isMainTweaks: true,
    isEvolvingCommanders: true,
    mode: 'Raptors',
    difficulty: 'Epic',
    enemyHealth: '1.3x',
    bossHealth: '1.3x',
    extras: 'Mini Bosses',
    gameMap: 'Full Metal Plate (12P)',
    start: 'No rush',
    lobbyName: '',
    isCrossFactionT2: true,
    isT3Eco: true,
    isT3Builders: true,
    isUnitLaunchers: true,
    isLrpcRebalance: true,
    isT4Defences: true,
    isT4AirRework: true,
    isMegaNuke: false,
};
