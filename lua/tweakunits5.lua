--NuttyB Experimental Wave Challenge
-- Authors: BackBash
-- bar-nuttyb-collective.github.io/configurator
return {
    raptor_air_scout_basic_t2_v1 = {
        customparams = {
            raptorcustomsquad = true,
            raptorsquadunitsamount = 25,
            raptorsquadminanger = 20,
            raptorsquadmaxanger = 26,
            raptorsquadweight = 10,
            raptorsquadrarity = "basic",
            raptorsquadbehavior = "raider",
            raptorsquadbehaviordistance = 500,
            raptorsquadbehaviorchance = 0.75,
        },
    },
    raptor_hive_assault_basic = {
        customparams = {
            raptorcustomsquad = true,
            raptorsquadunitsamount = 25,
            raptorsquadminanger = 0,
            raptorsquadmaxanger = 40,
            raptorsquadweight = 1,
            raptorsquadrarity = "basic",
            raptorsquadbehavior = "raider",
            raptorsquadbehaviordistance = 500,
            raptorsquadbehaviorchance = 0.75,
        },
    },
    raptor_land_swarmer_basic_t3_v1 = {
        customparams = {
            raptorcustomsquad = true,
            raptorsquadunitsamount = 25,
            raptorsquadminanger = 0,
            raptorsquadmaxanger = 40,
            raptorsquadweight = 2,
            raptorsquadrarity = "basic",
            raptorsquadbehavior = "raider",
            raptorsquadbehaviordistance = 500,
            raptorsquadbehaviorchance = 0.75,
        },
    },
        raptor_evolved_motort4 = {
        customparams = {
            raptorcustomsquad = true,
            raptorsquadunitsamount = 12,
            raptorsquadminanger = 50,
            raptorsquadmaxanger = 300,
            raptorsquadweight = 3,
            raptorsquadrarity = "special",
            raptorsquadbehavior = "artillery",
            raptorsquadbehaviordistance = 2500,
            raptorsquadbehaviorchance = 0.75,
        },
    },
    raptor_hive_assault_heavy = {
        customparams = {
            raptorcustomsquad = true,
            raptorsquadunitsamount = 25,
            raptorsquadminanger = 55,
            raptorsquadmaxanger = 70,
            raptorsquadweight = 1,
            raptorsquadrarity = "basic",
            raptorsquadbehavior = "berserk",
            raptorsquadbehaviordistance = 500,
            raptorsquadbehaviorchance = 0.75,
        },
    },
    raptor_hive_assault_superheavy = {
        customparams = {
            raptorcustomsquad = true,
            raptorsquadunitsamount = 25,
            raptorsquadminanger = 80,
            raptorsquadmaxanger = 85,
            raptorsquadweight = 1,
            raptorsquadrarity = "basic",
            raptorsquadbehavior = "berserk",
            raptorsquadbehaviordistance = 500,
            raptorsquadbehaviorchance = 0.75,
        },
    },
    raptor_air_kamikaze_basic_t2_v1 = {
        customparams = {
            raptorcustomsquad = true,
            raptorsquadunitsamount = 55,
            raptorsquadminanger = 100,
            raptorsquadmaxanger = 105,
            raptorsquadweight = 2,
            raptorsquadrarity = "basic",
            raptorsquadbehavior = "berserk",
            raptorsquadbehaviordistance = 500,
            raptorsquadbehaviorchance = 0.75,
        },
    },
    raptor_matriarch_fire = {
        customparams = {
            raptorcustomsquad = true,
            raptorsquadunitsamount = 30,
            raptorsquadminanger = 105,
            raptorsquadmaxanger = 135,
            raptorsquadweight = 3,
            raptorsquadrarity = "special",
            raptorsquadbehavior = "berserk",
            raptorsquadbehaviordistance = 500,
            raptorsquadbehaviorchance = 0.75,
        },
    },
    raptor_matriarch_basic = {
        customparams = {
            raptorcustomsquad = true,
            raptorsquadunitsamount = 30,
            raptorsquadminanger = 105,
            raptorsquadmaxanger = 135,
            raptorsquadweight = 3,
            raptorsquadrarity = "special",
            raptorsquadbehavior = "berserk",
            raptorsquadbehaviordistance = 500,
            raptorsquadbehaviorchance = 0.75,
        },
    },
    raptor_matriarch_acid = {
        customparams = {
            raptorcustomsquad = true,
            raptorsquadunitsamount = 30,
            raptorsquadminanger = 105,
            raptorsquadmaxanger = 135,
            raptorsquadweight = 3,
            raptorsquadrarity = "special",
            raptorsquadbehavior = "berserk",
            raptorsquadbehaviordistance = 500,
            raptorsquadbehaviorchance = 0.75,
        },
    },
    raptor_matriarch_electric = {
        customparams = {
            raptorcustomsquad = true,
            raptorsquadunitsamount = 30,
            raptorsquadminanger = 105,
            raptorsquadmaxanger = 135,
            raptorsquadweight = 3,
            raptorsquadrarity = "special",
            raptorsquadbehavior = "berserk",
            raptorsquadbehaviordistance = 500,
            raptorsquadbehaviorchance = 0.75,
        },
		weapons = {
			[5] = {
				def = "",
			},
        },
    },
	raptor_queen_veryeasy = {
		selfdestructas = "customfusionexplo",
		explodeas = "customfusionexplo",
        maxthisunit = 3,
        customparams = {
            raptorcustomsquad = true,
            i18n_en_humanname = "Queen Degenerative",
            i18n_en_tooltip = "SHES A BIG ONE",
            raptorsquadunitsamount = 2,
            raptorsquadminanger = 70,
            raptorsquadmaxanger = 150,
            raptorsquadweight = 2,
            raptorsquadrarity = "special",
            raptorsquadbehavior = "berserk",
            raptorsquadbehaviordistance = 500,
            raptorsquadbehaviorchance = 0.75,
        },
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
    }
}
