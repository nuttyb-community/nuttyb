-- MiniBossesExt
-- Mini Bosses Extended Version
-- Authors: RCore, Altwaal
-- docs.google.com/spreadsheets/d/1QSVsuAAMhBrhiZdTihVfSCwPzbbZWDLCtXWP23CU0ko
-- https://github.com/nuttyb-community/nuttyb

do
    local unitDefs, tableMerge, tableCopy, RAPTOR_MATRIARCH_BASIC, CUSTOM_FUSION_EXPLO, spring =
        UnitDefs or {},
        table.merge,
        table.copy,
        'raptor_matriarch_basic',
        'customfusionexplo',
        Spring

    -- Calculate health multipliers from existing unit definitions
    local nbHpMult = unitDefs[RAPTOR_MATRIARCH_BASIC].health / 60000
    local nbQhpMult = unitDefs['raptor_queen_epic'].health / 1250000

    -- Calculate player count multiplier
    local playerCountScale = 1
    if spring.Utilities.Gametype.IsRaptors() then
        playerCountScale = (#spring.GetTeamList() - 2) / 12
    end

    local spawnCountMult = spring.GetModOptions().raptor_spawncountmult or 3
    local totalSpawnScale = playerCountScale * (spawnCountMult / 3)

    -- Function to scale unit counts based on player count
    local function scaledMax(base)
        return math.max(1, math.ceil(base * totalSpawnScale))
    end

    -- Anger thresholds for mini-queen spawning
    local mqAnger = { 01, 2, 03, 105, 110, 125 }
    local mqTimeMult =
        math.max(1, spring.GetModOptions().raptor_queentimemult or 1.3)
    local mqStart, mqLast = mqAnger[1], mqAnger[#mqAnger]
    local mqTargetLast = mqTimeMult * mqAnger[#mqAnger] / 1.3
    local mqFactor = (mqTargetLast - mqStart) / (mqLast - mqStart)

    -- Scale anger thresholds based on queen time multiplier
    for idx = 2, #mqAnger do
        mqAnger[idx] = math.floor(mqStart + (mqAnger[idx] - mqStart) * mqFactor)
    end

    -- Calculate queen-related values for Doombringer spawning
    local mqNumQueens = spring.GetModOptions().raptor_queen_count or 1
    local mqDoomAngerScale = math.min(10, nbQhpMult / 1.3 * 0.9)

    -- Extra anger % required before Doombringers spawn. 0 = vanilla timing.
    local DOOMBRINGER_SPAWN_DELAY = 40

    -- Compact logic for hybrid exponential/linear growth
    local queenThreshold = 20
    local exponentialPart = 10
        * (1.06 ^ math.max(0, math.min(mqNumQueens, queenThreshold) - 8))
    local linearPart = math.max(0, mqNumQueens - queenThreshold)
    local baseQueenAnger = exponentialPart + linearPart
    local mqDoomAnger = math.ceil(mqDoomAngerScale * baseQueenAnger)
    local mqAngerBoss = mqTimeMult * 100 + mqDoomAnger + DOOMBRINGER_SPAWN_DELAY
    local maxDoombringers =
        math.max(3, scaledMax(math.floor((21 * mqNumQueens + 36) / 19)))

    -- Function to clone unit definitions
    local function newUnit(sourceUnit, targetUnit, overrides)
        if unitDefs[sourceUnit] and not unitDefs[targetUnit] then
            unitDefs[targetUnit] =
                tableMerge(unitDefs[sourceUnit], overrides or {})
        end
    end

    -- Base health value from matriarch
    local baseHealth = unitDefs[RAPTOR_MATRIARCH_BASIC].health

    -- Create Queenling units (mini-queens)
    newUnit('raptor_queen_veryeasy', 'raptor_miniq_a', {
        name = 'Queenling Prima',
        icontype = 'raptor_queen_veryeasy',
        health = baseHealth * 5,
        customparams = {
            i18n_en_humanname = 'Queenling Prima',
            i18n_en_tooltip = 'Majestic and bold, ruler of the hunt.',
        },
    })

    newUnit('raptor_queen_easy', 'raptor_miniq_b', {
        name = 'Queenling Secunda',
        icontype = 'raptor_queen_easy',
        health = baseHealth * 6,
        customparams = {
            i18n_en_humanname = 'Queenling Secunda',
            i18n_en_tooltip = 'Swift and sharp, a noble among raptors.',
        },
    })

    newUnit('raptor_queen_normal', 'raptor_miniq_c', {
        name = 'Queenling Tertia',
        icontype = 'raptor_queen_normal',
        health = baseHealth * 7,
        customparams = {
            i18n_en_humanname = 'Queenling Tertia',
            i18n_en_tooltip = 'Refined tastes. Likes her prey rare.',
        },
    })

    newUnit('armcomboss', 'raptor_armcomboss', {
        name = 'Arm Com Boss',
        icontype = 'armcomboss',
        health = baseHealth * 6,
        customparams = {
            i18n_en_humanname = 'Arm Com Boss',
            i18n_en_tooltip = 'Swift and sharp, a noble among raptors.',
        },
    })

    -- Copy weapon definitions from matriarch variants
    unitDefs.raptor_miniq_b.weapondefs.acidgoo =
        tableCopy(unitDefs['raptor_matriarch_acid'].weapondefs.acidgoo)
    unitDefs.raptor_miniq_c.weapondefs.empgoo =
        tableCopy(unitDefs['raptor_matriarch_electric'].weapondefs.goo)

    -- Create Matrona variants (smaller matriarchs)
    for _, matronaData in ipairs {
        {
            'raptor_matriarch_basic',
            'raptor_mama_ba',
            'Matrona',
            'Claws charged with vengeance.',
        },
        {
            'raptor_matriarch_fire',
            'raptor_mama_fi',
            'Pyro Matrona',
            'A firestorm of maternal wrath.',
        },
        {
            'raptor_matriarch_electric',
            'raptor_mama_el',
            'Paralyzing Matrona',
            'Crackling with rage, ready to strike.',
        },
        {
            'raptor_matriarch_acid',
            'raptor_mama_ac',
            'Acid Matrona',
            'Acid-fueled, melting everything in sight.',
        },
    } do
        newUnit(matronaData[1], matronaData[2], {
            name = matronaData[3],
            icontype = matronaData[1],
            health = baseHealth * 1.5,
            customparams = {
                i18n_en_humanname = matronaData[3],
                i18n_en_tooltip = matronaData[4],
            },
        })
    end

    -- Create Raptor Consort (penguin king variant)
    newUnit('critter_penguinking', 'raptor_consort', {
        name = 'Raptor Consort',
        icontype = 'corkorg',
        health = baseHealth * 4,
        mass = 100000,
        nochasecategory = 'MOBILE VTOL OBJECT',
        sonarstealth = false,
        stealth = false,
        speed = 67.5,
        customparams = {
            i18n_en_humanname = 'Raptor Consort',
            i18n_en_tooltip = 'Sneaky powerful little terror.',
        },
    })

    unitDefs.raptor_consort.weapondefs.goo =
        tableCopy(unitDefs['raptor_queen_epic'].weapondefs.goo)

    -- Create Doombringer (ultimate boss unit)
    newUnit('raptor_consort', 'raptor_doombringer', {
        name = 'Doombringer',
        icontype = 'armafust3',
        health = baseHealth * 12,
        speed = 50,
        customparams = {
            i18n_en_humanname = 'Doombringer',
            i18n_en_tooltip = 'Your time is up. The Queens called for backup.',
        },
    })

    -- Function to create PvE squad parameters
    local function pveSquad(
        minAnger,
        maxAnger,
        behavior,
        rarity,
        amount,
        weight
    )
        return {
            raptorcustomsquad = true,
            raptorsquadunitsamount = amount or 1,
            raptorsquadminanger = minAnger,
            raptorsquadmaxanger = maxAnger,
            raptorsquadweight = weight or 5,
            raptorsquadrarity = rarity or 'basic',
            raptorsquadbehavior = behavior,
            raptorsquadbehaviordistance = 500,
            raptorsquadbehaviorchance = 0.75,
        }
    end

    -- Base destruction parameters for mini-queens
    local miniQueenCommon = {
        selfdestructas = CUSTOM_FUSION_EXPLO,
        explodeas = CUSTOM_FUSION_EXPLO,
        weapondefs = {
            yellow_missile = {
                damage = {
                    default = 1,
                    vtol = 1000,
                },
            },
        },
    }

    -- Apply configurations to all boss units
    for unitName, unitConfig in pairs {
        raptor_miniq_a = tableMerge(miniQueenCommon, {
            maxthisunit = scaledMax(2),
            customparams = pveSquad(mqAnger[1], mqAnger[2], 'berserk'),
            weapondefs = {
                goo = { damage = { default = 750 } },
                melee = { damage = { default = 4000 } },
            },
        }),

        raptor_miniq_b = tableMerge(miniQueenCommon, {
            maxthisunit = scaledMax(3),
            customparams = pveSquad(mqAnger[3], mqAnger[4], 'berserk'),
            weapondefs = {
                acidgoo = {
                    burst = 8,
                    reloadtime = 10,
                    sprayangle = 4096,
                    damage = { default = 1500, shields = 1500 },
                },
                melee = { damage = { default = 5000 } },
            },
            weapons = {
                [1] = { def = 'MELEE', maindir = '0 0 1', maxangledif = 155 },
                [2] = { onlytargetcategory = 'VTOL', def = 'yellow_missile' },
                [3] = { onlytargetcategory = 'VTOL', def = 'yellow_missile' },
                [4] = { onlytargetcategory = 'VTOL', def = 'yellow_missile' },
                [5] = { def = 'acidgoo', maindir = '0 0 1', maxangledif = 180 },
            },
        }),

        raptor_miniq_c = tableMerge(miniQueenCommon, {
            maxthisunit = scaledMax(4),
            customparams = pveSquad(mqAnger[5], mqAnger[6], 'berserk'),
            weapondefs = {
                empgoo = {
                    burst = 10,
                    reloadtime = 10,
                    sprayangle = 4096,
                    damage = { default = 2000, shields = 2000 },
                },
                melee = { damage = { default = 6000 } },
            },
            weapons = {
                [1] = { def = 'MELEE', maindir = '0 0 1', maxangledif = 155 },
                [2] = { onlytargetcategory = 'VTOL', def = 'yellow_missile' },
                [3] = { onlytargetcategory = 'VTOL', def = 'yellow_missile' },
                [4] = { onlytargetcategory = 'VTOL', def = 'yellow_missile' },
                [5] = { def = 'empgoo', maindir = '0 0 1', maxangledif = 180 },
            },
        }),

        raptor_consort = {
            explodeas = 'raptor_empdeath_big',
            maxthisunit = scaledMax(6),
            customparams = pveSquad(mqAnger[2], 1000, 'berserk'),
            weapondefs = {
                eyelaser = {
                    name = 'Angry Eyes',
                    reloadtime = 3,
                    rgbcolor = '1 0 0.3',
                    range = 500,
                    damage = { default = 6000, commanders = 6000 },
                },
                goo = {
                    name = 'Snowball Barrage',
                    soundstart = 'penbray2',
                    soundStartVolume = 2,
                    cegtag = 'blob_trail_blue',
                    burst = 8,
                    sprayangle = 2048,
                    weaponvelocity = 600,
                    reloadtime = 4,
                    range = 1000,
                    hightrajectory = 1,
                    rgbcolor = '0.7 0.85 1.0',
                    damage = { default = 1000 },
                },
            },
            weapons = {
                [1] = { def = 'eyelaser', badtargetcategory = 'VTOL OBJECT' },
                [2] = {
                    def = 'goo',
                    maindir = '0 0 1',
                    maxangledif = 180,
                    badtargetcategory = 'VTOL OBJECT',
                },
            },
        },

        raptor_doombringer = {
            explodeas = 'ScavComBossExplo',
            maxthisunit = maxDoombringers,
            customparams = pveSquad(mqAngerBoss, 1000, 'berserk', nil, 1, 99),
            weapondefs = {
                eyelaser = {
                    name = 'Eyes of Doom',
                    reloadtime = 3,
                    rgbcolor = '0.3 1 0',
                    range = 500,
                    damage = { default = 48000, commanders = 24000 },
                },
                goo = {
                    name = 'Amber Hailstorm',
                    soundstart = 'penbray1',
                    soundStartVolume = 2,
                    cegtag = 'blob_trail_red',
                    burst = 15,
                    sprayangle = 3072,
                    weaponvelocity = 600,
                    reloadtime = 5,
                    rgbcolor = '0.7 0.85 1.0',
                    hightrajectory = 1,
                    damage = { default = 5000 },
                },
            },
            weapons = {
                [1] = { def = 'eyelaser', badtargetcategory = 'VTOL OBJECT' },
                [2] = {
                    def = 'goo',
                    maindir = '0 0 1',
                    maxangledif = 180,
                    badtargetcategory = 'VTOL OBJECT',
                },
            },
        },

        raptor_armcomboss = {
            explodeas = 'ScavComBossExplo',
            maxthisunit = maxDoombringers,
            customparams = pveSquad(mqAnger[1], 1000, 'berserk'),
            weapondefs = {
                armcomlaserboss = {
                    name = 'Laser Boss',
                    reloadtime = 0,
                    rgbcolor = '0.3 1 0',
                    range = 1250,
                    speed = 25,
                    damage = {
                        default = 4800,
                        commanders = 2400,
                        shield = 5000,
                    },
                },
                armcomsealaserboss = {
                    name = 'Sea Laser Boss',
                    damage = { default = 5000 },
                },
            },
            weapons = {
                [1] = {
                    def = 'armcomlaserboss',
                    badtargetcategory = 'VTOL OBJECT',
                },
                [2] = {
                    def = 'armcomsealaserboss',
                    maindir = '0 0 1',
                    maxangledif = 180,
                    badtargetcategory = 'VTOL OBJECT',
                },
            },
        },

        raptor_mama_ba = {
            maxthisunit = scaledMax(4),
            customparams = pveSquad(55, mqAnger[3] - 1, 'berserk'),
            weapondefs = {
                goo = { damage = { default = 750 } },
                melee = { damage = { default = 750 } },
            },
        },

        raptor_mama_fi = {
            explodeas = 'raptor_empdeath_big',
            maxthisunit = scaledMax(4),
            customparams = pveSquad(55, mqAnger[3] - 1, 'berserk'),
            weapondefs = {
                flamethrowerspike = { damage = { default = 80 } },
                flamethrowermain = { damage = { default = 160 } },
            },
        },

        raptor_mama_el = {
            maxthisunit = scaledMax(4),
            customparams = pveSquad(65, 1000, 'berserk'),
        },

        raptor_mama_ac = {
            maxthisunit = scaledMax(4),
            customparams = pveSquad(60, 1000, 'berserk'),
            weapondefs = {
                melee = { damage = { default = 750 } },
            },
        },

        raptor_land_assault_basic_t4_v2 = {
            maxthisunit = scaledMax(8),
            customparams = pveSquad(33, 50, 'raider'),
        },

        raptor_land_assault_basic_t4_v1 = {
            maxthisunit = scaledMax(12),
            customparams = pveSquad(51, 64, 'raider', 'basic', 2),
        },
    } do
        unitDefs[unitName] = unitDefs[unitName] or {}
        table.mergeInPlace(unitDefs[unitName], unitConfig, true)
    end

    -- Metal costs for new units
    local newCosts = {
        raptor_mama_ba = 36000,
        raptor_mama_fi = 36000,
        raptor_mama_el = 36000,
        raptor_mama_ac = 36000,
        raptor_consort = 45000,
        raptor_doombringer = 90000,
        raptor_armcomboss = 45000,
    }

    -- Post-processing function to apply metal costs
    local oldUnitDef_Post = UnitDef_Post

    function UnitDef_Post(unitID, unitDef)
        if oldUnitDef_Post then
            oldUnitDef_Post(unitID, unitDef)
        end

        local nbHpScale = 1
        if nbHpMult > 1.3 then
            nbHpScale = nbHpMult / 1.3
        end

        for unitName, baseCost in pairs(newCosts) do
            if UnitDefs[unitName] then
                local finalCost = math.floor(baseCost * nbHpScale)
                UnitDefs[unitName].metalcost = finalCost
            end
        end
    end
end
