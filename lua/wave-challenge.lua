-- ExpoWaves
-- NuttyB Experimental Wave Challenge
-- Authors: BackBash
-- https://github.com/nuttyb-community/nuttyb

do
    local unitDefs, tableMerge = UnitDefs or {}, table.merge
    local merge = table.mergeInPlace or tableMerge

    local function pveSquad(
        minAnger,
        maxAnger,
        behavior,
        rarity,
        amount,
        weight,
        distance
    )
        return {
            raptorcustomsquad = true,
            raptorsquadunitsamount = amount or 1,
            raptorsquadminanger = minAnger,
            raptorsquadmaxanger = maxAnger,
            raptorsquadweight = weight or 5,
            raptorsquadrarity = rarity or 'basic',
            raptorsquadbehavior = behavior,
            raptorsquadbehaviordistance = distance or 500,
            raptorsquadbehaviorchance = 0.75,
        }
    end

    merge(unitDefs, {
        raptor_air_scout_basic_t2_v1 = {
            customparams = pveSquad(20, 26, 'raider', 'basic', 25, 10),
        },
        raptor_hive_assault_basic = {
            customparams = pveSquad(0, 40, 'raider', 'basic', 25, 1),
        },
        raptor_land_swarmer_basic_t3_v1 = {
            customparams = pveSquad(0, 40, 'raider', 'basic', 25, 2),
        },
        raptor_evolved_motort4 = {
            customparams = pveSquad(
                50,
                300,
                'artillery',
                'special',
                12,
                3,
                2500
            ),
        },
        raptor_hive_assault_heavy = {
            customparams = pveSquad(55, 70, 'berserk', 'basic', 25, 1),
        },
        raptor_hive_assault_superheavy = {
            customparams = pveSquad(80, 85, 'berserk', 'basic', 25, 1),
        },
        raptor_air_kamikaze_basic_t2_v1 = {
            customparams = pveSquad(100, 105, 'berserk', 'basic', 55, 2),
        },
        raptor_matriarch_fire = {
            customparams = pveSquad(105, 135, 'berserk', 'special', 30, 3),
        },
        raptor_matriarch_basic = {
            customparams = pveSquad(105, 135, 'berserk', 'special', 30, 3),
        },
        raptor_matriarch_acid = {
            customparams = pveSquad(105, 135, 'berserk', 'special', 30, 3),
        },
        raptor_matriarch_electric = {
            customparams = pveSquad(105, 135, 'berserk', 'special', 30, 3),
            weapons = {
                [5] = {
                    def = '',
                },
            },
        },
        raptor_queen_veryeasy = {
            selfdestructas = 'customfusionexplo',
            explodeas = 'customfusionexplo',
            maxthisunit = 3,
            customparams = tableMerge(
                pveSquad(70, 150, 'berserk', 'special', 2, 2),
                {
                    i18n_en_humanname = 'Queen Degenerative',
                    i18n_en_tooltip = 'SHES A BIG ONE',
                }
            ),
            weapondefs = {
                melee = {
                    damage = {
                        default = 5000,
                    },
                },
                yellow_missile = {
                    damage = {
                        default = 1,
                        vtol = 500,
                    },
                },
                goo = {
                    range = 500,
                    damage = {
                        default = 1200,
                    },
                },
            },
        },
        corcomlvl4 = {
            weapondefs = {
                disintegratorxl = {
                    damage = {
                        commanders = 0,
                        default = 99999,
                        scavboss = 1000,
                        raptorqueen = 5000,
                    },
                },
            },
        },
    })
end
