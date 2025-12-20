export const PRESET_DIFFICULTIES = ['Easy', 'Medium', 'Hard'] as const;
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

export type PresetDifficulty = (typeof PRESET_DIFFICULTIES)[number];
export type Extras = (typeof EXTRAS)[number];
export type GameMap = (typeof MAPS)[number];
export type StartOption = (typeof START_OPTIONS)[number];

export interface Configuration {
    presetDifficulty: PresetDifficulty;
    extras: Extras;
    gameMap: GameMap;
    start: StartOption;
    lobbyName: string;
    isMegaNuke: boolean;
}

export const DEFAULT_CONFIGURATION: Configuration = {
    presetDifficulty: 'Medium',
    extras: 'Mini Bosses',
    gameMap: 'Full Metal Plate (12P)',
    start: 'No rush',
    lobbyName: '',
    isMegaNuke: false,
};
