import type { ValueMapping } from '../../types/types';

/**
 * Maximum length for a single command or paste section.
 * This is the BAR game client's chat input limit.
 */
export const MAX_COMMAND_LENGTH = 51_000;

/**
 * Maximum slots per tweak type (tweakdefs, tweakdefs1-9 = 10 slots).
 */
export const MAX_SLOTS_PER_TYPE = 10;

/**
 * Base commands always included for Raptors mode.
 */
export const BASE_COMMANDS = [
    '!preset coop',
    '!teamsize 12',
    '!autobalance off',
    '!assistdronesbuildpowermultiplier 1',
    '!assistdronesenabled enabled',
    '!commanderbuildersbuildpower 1000',
    '!commanderbuildersenabled enabled',
    '!commanderbuildersrange 1000',
    '!disablemapdamage 1',
    '!experimentalextraunits 1',
    '!experimentallegionfaction 1',
    '!experimentalshields bounceeverything',
    '!maxunits 10000',
    '!multiplier_builddistance 1.5',
    '!multiplier_buildpower 1',
    '!multiplier_buildtimecost 1',
    '!multiplier_energyconversion 1',
    '!multiplier_energycost 1',
    '!multiplier_energyproduction 1',
    '!multiplier_losrange 1',
    '!multiplier_maxdamage 1',
    '!multiplier_maxvelocity 1',
    '!multiplier_metalcost 1',
    '!multiplier_metalextraction 1',
    '!multiplier_radarrange 1',
    '!multiplier_resourceincome 1',
    '!multiplier_shieldpower 2',
    '!multiplier_turnrate 1',
    '!multiplier_weapondamage 1',
    '!multiplier_weaponrange 1',
    '!raptor_difficulty epic',
    '!raptor_spawntimemult 1',
    '!releasecandidates 1',
    '!startenergy 10000',
    '!startenergystorage 10000',
    '!startmetal 10000',
    '!startmetalstorage 10000',
    '!scavunitsforplayers 1',
    '!forceallunits 1',
    '!unit_restrictions_noair 0',
    '!unit_restrictions_noendgamelrpc 0',
    '!unit_restrictions_noextractors 1',
    '!unit_restrictions_nolrpc 0',
    '!unit_restrictions_nonukes 0',
    '!draft_mode disabled',
    '!unit_restrictions_notacnukes 0',
    '$welcome-message See https://nuttyb.org for mod info and setup instructions',
    '!unit_market 0',
    '!evocom 0',
    '!nowasting all',
    '!bSet unit_restrictions_nonukes 1',
    '!bSet raptor_queen_count 8',
    '!balance',
] as const;

/**
 * Tweaks always enabled (not configurable).
 */
export const BASE_TWEAKS = {
    tweakdefs: [
        '~lua/main-defs.lua',
        '~lua/eco-t3.lua',
        '~lua/builders-t3.lua',
        '~lua/unit-launchers.lua',
    ],
    tweakunits: [
        '~lua/main-units.lua',
        '~lua/evocom-leg.lua',
        '~lua/evocom-arm.lua',
        '~lua/evocom-cor.lua',
        '~lua/lrpc-rebalance.lua',
        '~lua/air-rework-t4.lua',
    ],
} as const;

// References to actual Lua files are prefixed with ~
export const CONFIGURATION_MAPPING: ValueMapping = {
    presetDifficulty: {
        description: 'Preset difficulty level',
        values: {
            Easy: {
                tweakdefs: [
                    '~lua/raptor-hp/raptor-hp-1.3x.lua',
                    '~lua/queen-hp/queen-hp-1.3x.lua',
                    '~lua/cross-faction-t2.lua',
                    '~lua/defences-t4.lua',
                ],
            },
            Medium: {
                tweakdefs: [
                    '~lua/raptor-hp/raptor-hp-1.5x.lua',
                    '~lua/queen-hp/queen-hp-1.5x.lua',
                    '~lua/cross-faction-t2.lua',
                    '~lua/defences-t4.lua',
                ],
            },
            Hard: {
                tweakdefs: [
                    '~lua/raptor-hp/raptor-hp-3.0x.lua',
                    '~lua/queen-hp/queen-hp-3.0x.lua',
                ],
            },
        },
    },
    extras: {
        description: 'Extra challenges',
        values: {
            None: undefined,
            'Mini Bosses': { tweakdefs: ['~lua/mini-bosses.lua'] },
            'Experimental Wave Challenge': {
                tweakunits: ['~lua/wave-challenge.lua'],
            },
        },
    },
    gameMap: {
        description: 'Map',
        values: {
            'Full Metal Plate (12P)': {
                command: [
                    '!map Full Metal Plate',
                    '!addbox 82 82 117 117 2',
                    '!clearbox 1',
                    '!teamsize 12',
                ],
            },
            'Raptor Crater (16P)': {
                command: [
                    '!map Raptor Crater',
                    '!addbox 84 81 119 116 2',
                    '!clearbox 1',
                    '!teamsize 16',
                ],
            },
            'Raptor Crater Inverted (16P)': {
                command: [
                    '!map Raptor Crater',
                    '!disablemapdamage 0$',
                    '!debugcommands invertmap',
                    '!addbox 84 81 119 116 2',
                    '!clearbox 1',
                    '!teamsize 16',
                ],
            },
            'Special Hotstepper (16P)': {
                command: [
                    '!map Special Hotstepper',
                    '!addbox 83 81 118 116 2',
                    '!clearbox 1',
                    '!map_lavatiderhythm disabled',
                    '!teamsize 16',
                ],
            },
            'To Kill The Middle (12P)': {
                command: [
                    '!map To Kill The Middle',
                    '!addbox 82 82 117 117 2',
                    '!clearbox 1',
                    '!teamsize 12',
                ],
            },
            'Ancient Bastion Remake (8P)': {
                command: [
                    '!map Ancient Bastion Remake',
                    '!addbox 0 0 100 200 1',
                    '!addbox 175 0 200 200 2',
                    '!teamsize 8',
                ],
            },
            'Ancient Vault (12P)': {
                command: [
                    '!map Ancient Vault',
                    '!addbox 0 0 200 120 1',
                    '!addbox 0 180 200 200 2',
                    '!teamsize 12',
                ],
            },
            'Bismuth Valley (8P)': {
                command: [
                    '!map Bismuth Valley',
                    '!addbox 0 0 64 200 1',
                    '!addbox 175 0 200 200 2',
                    '!teamsize 8',
                ],
            },
            'Darkside (12P)': {
                command: [
                    '!map Darkside',
                    '!addbox 0 0 64 200 1',
                    '!addbox 175 0 200 200 2',
                    '!teamsize 12',
                ],
            },
            'Flats and Forests (12P)': {
                command: [
                    '!map Flats and Forests',
                    '!addbox 0 0 64 200 1',
                    '!addbox 175 0 200 200 2',
                    '!teamsize 12',
                ],
            },
            'Special Creek (12P)': {
                command: [
                    '!map Special Creek',
                    '!addbox 158 0 200 200 2',
                    '!teamsize 12',
                ],
            },
            'Starwatcher (8P)': {
                command: [
                    '!map Starwatcher',
                    '!addbox 0 0 64 200 1',
                    '!addbox 175 0 200 200 2',
                    '!teamsize 8',
                ],
            },
        },
    },
    start: {
        description: 'Starting conditions',
        values: {
            'No rush': {
                command: [
                    '!raptor_queentimemult 1.3',
                    '!raptor_spawncountmult 3',
                    '!bSet raptor_queen_count 12',
                    '!raptor_firstwavesboost 4',
                    '!raptor_graceperiodmult 3',
                ],
            },
            'No rush solo': {
                command: [
                    '!raptor_queentimemult 1.3',
                    '!raptor_spawncountmult 3',
                    '!raptor_firstwavesboost 3',
                    '!raptor_graceperiodmult 2.7',
                ],
            },
            'Zero grace': {
                command: [
                    '!raptor_queentimemult 1.4',
                    '!raptor_spawncountmult 3',
                    '!raptor_firstwavesboost 3',
                    '!raptor_graceperiodmult 0.1',
                ],
            },
            Surrounded: {
                command: [
                    '!raptor_queentimemult 1.3',
                    '!raptor_spawncountmult 3',
                    '!raptor_firstwavesboost 6',
                    '!raptor_graceperiodmult 3',
                    '!addbox 60 60 140 140 1',
                    '!raptor_raptorstart avoid',
                    '!clearbox 2',
                ],
            },
        },
    },
    lobbyName: {
        description: 'Custom lobby name',
        values: {
            '': undefined, // Empty string means no custom name - handled dynamically
        },
    },
    isMegaNuke: {
        description: 'Mega Nuke',
        values: {
            true: { tweakunits: ['~lua/mega-nuke.lua'] },
            false: undefined,
        },
    },
} as const;
