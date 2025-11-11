--NuttyB v1.52b Def Main
-- Authors: ChrispyNut, BackBash
-- bar-nuttyb-collective.github.io/configurator
local unitDefs, repulsor, pairs, tableMerge = UnitDefs or {}, 'repulsor', pairs, table.merge

function addWeapon(h, i, j)
	unitDefs[h] = unitDefs[h] or {}
	unitDefs[h].weapons = unitDefs[h].weapons or {}
	unitDefs[h].weapondefs = unitDefs[h].weapondefs or {}
	unitDefs[h].customparams = unitDefs[h].customparams or {}
	table.insert(
		unitDefs[h].weapons,
		{
			def = repulsor,
			onlytargetcategory = j or ''
		}
	)
	unitDefs[h].weapondefs[repulsor] = i
	if i.shield and i.shield.power > 0 then
		i.range = i.shield.radius
		unitDefs[h].customparams =
			tableMerge(
			unitDefs[h].customparams or {},
			{
				off_on_stun = 'true',
				shield_color_mult = 0.8,
				shield_power = i.shield.power,
				shield_radius = i.shield.radius
			}
		)
	end
end

for _, shieldedUnit in ipairs(
	{
		'armcom',
		'armcomlvl2',
		'armcomlvl3',
		'armcomlvl4',
		'corcom',
		'corcomlvl2',
		'corcomlvl3',
		'corcomlvl4',
		'legcom',
		'legcomlvl2',
		'legcomlvl3',
		'legcomlvl4',
		'legcomlvl5'
	}
) do
	addWeapon(
		shieldedUnit,
		{
			avoidfeature = false,
			craterareaofeffect = 0,
			craterboost = 0,
			cratermult = 0,
			edgeeffectiveness = 0.15,
			name = 'PlasmaRepulsor',
			range = 50,
			soundhitwet = 'sizzle',
			weapontype = 'Shield',
			damage = {
				default = 100
			},
			shield = {
				alpha = 0.15,
				armortype = 'shields',
				energyuse = 1,
				force = 2.5,
				intercepttype = 1,
				power = 500,
				powerregen = 3,
				powerregenenergy = 3,
				radius = 100,
				repulser = true,
				smart = true,
				startingpower = 100,
				visiblerepulse = true,
				badcolor = {
					1,
					0.2,
					0.2,
					0.2
				},
				goodcolor = {
					0.2,
					1,
					0.2,
					0.17
				}
			}
		}
	)
end

for name, def in pairs(unitDefs) do
	if string.sub(name, 1, 24) == 'raptor_air_fighter_basic' then
		if def.weapondefs then
			for _, s in pairs(def.weapondefs) do
				s.name = 'Spike'
				s.accuracy = 200
				s.collidefriendly = 0
				s.collidefeature = 0
				s.avoidfeature = 0
				s.avoidfriendly = 0
				s.areaofeffect = 64
				s.edgeeffectiveness = 0.3
				s.explosiongenerator = 'custom:raptorspike-large-sparks-burn'
				s.cameraShake = {}
				s.dance = {}
				s.interceptedbyshieldtype = 0
				s.model = 'Raptors/spike.s3o'
				s.reloadtime = 1.1
				s.soundstart = 'talonattack'
				s.startvelocity = 200
				s.submissile = 1
				s.smoketrail = 0
				s.smokePeriod = {}
				s.smoketime = {}
				s.smokesize = {}
				s.smokecolor = {}
				s.soundhit = {}
				s.texture1 = {}
				s.texture2 = {}
				s.tolerance = {}
				s.tracks = 0
				s.turnrate = 60000
				s.weaponacceleration = 100
				s.weapontimer = 1
				s.weaponvelocity = 1000
				s.weapontype = {}
				s.wobble = {}
			end
		end
	elseif name:match '^[acl][ore][rgm]com' and not name:match '_scav$' then
		table.mergeInPlace(def, {
			customparams = {
				combatradius = 0,
				fall_damage_multiplier = 0,
				paratrooper = true,
				wtboostunittype = {}
			},
			featuredefs = {
				dead = {
					damage = 9999999,
					reclaimable = false,
					mass = 9999999
				}
			}
		})
	end
end

local weaponMods = {
	raptor_air_kamikaze_basic_t2_v1 = {
		selfdestructas = 'raptor_empdeath_big'
	},
	raptor_land_swarmer_emp_t2_v1 = {
		weapondefs = {
			raptorparalyzersmall = {
				damage = {shields = 70},
				paralyzetime = 6
			}
		}
	},
	raptor_land_assault_emp_t2_v1 = {
		weapondefs = {
			raptorparalyzerbig = {
				damage = {shields = 150},
				paralyzetime = 10
			}
		}
	},
	raptor_allterrain_arty_emp_t2_v1 = {
		weapondefs = {
			goolauncher = {
				paralyzetime = 6
			}
		}
	},
	raptor_allterrain_arty_emp_t4_v1 = {
		weapondefs = {
			goolauncher = {
				paralyzetime = 10
			}
		}
	},
	raptor_air_bomber_emp_t2_v1 = {
		weapondefs = {
			weapon = {
				damage = {
					shields = 1100,
					default = 2000
				},
				paralyzetime = 10
			}
		}
	},
	raptor_allterrain_swarmer_emp_t2_v1 = {
		weapondefs = {
			raptorparalyzersmall = {
				damage = {shields = 70},
				paralyzetime = 6
			}
		}
	},
	raptor_allterrain_assault_emp_t2_v1 = {
		weapondefs = {
			raptorparalyzerbig = {
				damage = {shields = 150},
				paralyzetime = 6
			}
		}
	},
	raptor_matriarch_electric = {
		weapondefs = {
			goo = {paralyzetime = 13},
			melee = {paralyzetime = 13},
			spike_emp_blob = {paralyzetime = 13}
		}
	}
}

for unitName, modifications in pairs(weaponMods) do
	if unitDefs[unitName] then
		unitDefs[unitName] = tableMerge(unitDefs[unitName], modifications)
	end
end

for _, raptorTurretName in pairs(
	{
		'raptor_antinuke',
		'raptor_turret_acid_t2_v1',
		'raptor_turret_acid_t3_v1',
		'raptor_turret_acid_t4_v1',
		'raptor_turret_antiair_t2_v1',
		'raptor_turret_antiair_t3_v1',
		'raptor_turret_antiair_t4_v1',
		'raptor_turret_antinuke_t2_v1',
		'raptor_turret_antinuke_t3_v1',
		'raptor_turret_basic_t2_v1',
		'raptor_turret_basic_t3_v1',
		'raptor_turret_basic_t4_v1',
		'raptor_turret_burrow_t2_v1',
		'raptor_turret_emp_t2_v1',
		'raptor_turret_emp_t3_v1',
		'raptor_turret_emp_t4_v1',
		'raptor_worm_green'
	}
) do
	local raptorTurretDef = unitDefs[raptorTurretName]
	raptorTurretDef.maxthisunit = 10
	raptorTurretDef.health = raptorTurretDef.health * 2
	if raptorTurretDef.weapondefs then
		for _, weapon in pairs(raptorTurretDef.weapondefs) do
			weapon.reloadtime = weapon.reloadtime / 1.5
			weapon.range = weapon.range / 2
		end
	end
end

for _, q in pairs(unitDefs) do
	if q.builder == true then
		if q.canfly == true then
			q.explodeas = ''
			q.selfdestructas = ''
		end
	end
end

local bombers = {
	'raptor_air_bomber_basic_t2_v1',
	'raptor_air_bomber_basic_t2_v2',
	'raptor_air_bomber_basic_t4_v1',
	'raptor_air_bomber_basic_t4_v2',
	'raptor_air_bomber_basic_t1_v1'
}

for _, toChangeName in pairs(bombers) do
	local def = unitDefs[toChangeName]
	if def.weapondefs then
		for _, weaponDef in pairs(def.weapondefs) do
			weaponDef.damage.default = weaponDef.damage.default / 1.30
		end
	end
end

local units = {'armrespawn', 'correspawn', 'legnanotcbase'}
for _, name in ipairs(units) do
    local u = UnitDefs[name]
    if u then
        u.cantbetransported, u.footprintx, u.footprintz = false, 4, 4
        u.customparams = u.customparams or {}
        u.customparams.paratrooper = true
        u.customparams.fall_damage_multiplier = 0
    end
end

-- Hive Spawns
local UnitDefs = UnitDefs or {}

local function deepCopy(orig)
    local copy = {}
    for k, v in pairs(orig) do
        copy[k] = type(v) == "table" and deepCopy(v) or v
    end
    return copy
end

local function insertMissing(t, s)
    for k, v in pairs(s) do
        if type(v) == "table" then
            t[k] = t[k] or {}
            insertMissing(t[k], v)
        elseif t[k] == nil then
            t[k] = v
        end
    end
end

local function cloneUnit(base, new, additions)
    if UnitDefs[base] and not UnitDefs[new] then
        local copy = deepCopy(UnitDefs[base])
        insertMissing(copy, additions)
        UnitDefs[new] = copy
    end
end

local clones = {
    {
        "raptor_land_swarmer_basic_t1_v1",
        "raptor_hive_swarmer_basic",
        {
            name = "Hive Spawn",
            customparams = {
                i18n_en_humanname = "Hive Spawn",
                i18n_en_tooltip = "Raptor spawned to defend hives from attackers."
            }
        }
    },
    {
        "raptor_land_assault_basic_t2_v1",
        "raptor_hive_assault_basic",
        {
            name = "Armored Assault Raptor",
            customparams = {
                i18n_en_humanname = "Armored Assault Raptor",
                i18n_en_tooltip = "Heavy, slow, and unyielding—these beasts are made to take the hits others cant."
            }
        }
    },
    {
        "raptor_land_assault_basic_t4_v1",
        "raptor_hive_assault_heavy",
        {
            name = "Heavy Armored Assault Raptor",
            customparams = {
                i18n_en_humanname = "Heavy Armored Assault Raptor",
                i18n_en_tooltip = "Lacking speed, these armored monsters make up for it with raw, unbreakable toughness."
            }
        }
    },
    {
        "raptor_land_assault_basic_t4_v2",
        "raptor_hive_assault_superheavy",
        {
            name = "Super Heavy Armored Assault Raptor",
            customparams = {
                i18n_en_humanname = "Super Heavy Armored Assault Raptor",
                i18n_en_tooltip = "These super-heavy armored beasts may be slow, but they’re built to take a pounding and keep rolling."
            }
        }
    },
    {
        "raptorartillery",
        "raptor_evolved_motort4",
        {
            name = "Evolved Lobber",
            customparams = {
                i18n_en_humanname = "Evolved Lobber",
                i18n_en_tooltip = "These lobbers did not just evolve—they became deadlier than anything before them."
            }
        }
    },
    {
        "raptor_land_swarmer_basic_t1_v1",
        "raptor_acidspawnling",
        {
            name = "Acid Spawnling",
            customparams = {
                i18n_en_humanname = "Acid Spawnling",
                i18n_en_tooltip = "This critters are so cute but can be so deadly at the same time."
            }
        }
    }
}
for _, data in ipairs(clones) do
    cloneUnit(data[1], data[2], data[3])
end

local oldUnitDef_Post = UnitDef_Post
function UnitDef_Post(unitID, unitDef)
    if oldUnitDef_Post and oldUnitDef_Post ~= UnitDef_Post then
        oldUnitDef_Post(unitID, unitDef)
    end

    local basehp =
        (UnitDefs["raptor_land_swarmer_basic_t1_v1"] and UnitDefs["raptor_land_swarmer_basic_t1_v1"].health)

    local weapon_common = {
            texture1 = {},
            texture2 = {},
            tracks = false,
            weaponvelocity = 4000,
            smokePeriod = {},
            smoketime = {},
            smokesize = {},
            smokecolor = {},
            smoketrail = 0
    }

    local weapon_poopoo = {
        accuracy = 2048,
        areaofeffect = 256,
        burst = 4,
        burstrate = 0.4,
        flighttime = 12,
        dance = 25,
        craterareaofeffect = 256,
        edgeeffectiveness = 0.7,
        cegtag = "blob_trail_blue",
        explosiongenerator = "custom:genericshellexplosion-huge-bomb",
        impulsefactor = 0.4,
        intensity = 0.3,
        interceptedbyshieldtype = 1,
        range = 2300,
        reloadtime = 10,
        rgbcolor = "0.2 0.5 0.9",
        size = 8,
        sizedecay = 0.09,
        soundhit = "bombsmed2",
        soundstart = "bugarty",
        sprayangle = 2048,
        tolerance = 60000,
        turnrate = 6000,
        trajectoryheight = 2,
        turret = true,
        weapontype = "Cannon",
        weaponvelocity = 520,
        startvelocity = 140,
        weaponacceleration = 125,
        weapontimer = 0.2,
        wobble = 14500,
        highTrajectory = 1,
        damage = {default = 900, shields = 600}
    }

    local weapon_throwup = {
        accuracy = 1024,
        areaofeffect = 24,
        burst = 1,
        burstrate = 0.3,
        cegtag = "blob_trail_green",
        edgeeffectiveness = 0.63,
        explosiongenerator = "custom:raptorspike-small-sparks-burn",
        impulsefactor = 1,
        intensity = 0.4,
        interceptedbyshieldtype = 1,
        name = "Acid",
        range = 250,
        reloadtime = 1,
        rgbcolor = "0.8 0.99 0.11",
        size = 1,
        stages = 6,
        soundhit = "bloodsplash3",
        soundstart = "alien_bombrel",
        sprayangle = 128,
        tolerance = 5000,
        turret = true,
        weapontimer = 0.1,
        weapontype = "Cannon",
        weaponvelocity = 320,
        damage = {default = 80}
    }

    local overrides = {
        raptor_hive_swarmer_basic = {
            metalcost = 350,
            nochasecategory = "OBJECT",
            icontype = "raptor_land_swarmer_basic_t1_v1"
        },
        raptor_hive_assault_basic = {
            metalcost = 3000,
            health = 25000,
            speed = 20.0,
            nochasecategory = "OBJECT",
            icontype = "raptor_land_assault_basic_t2_v1",
            weapondefs = {aaweapon = weapon_common}
        },
        raptor_hive_assault_heavy = {
            metalcost = 6000,
            health = 30000,
            speed = 17.0,
            nochasecategory = "OBJECT",
            icontype = "raptor_land_assault_basic_t4_v1",
            weapondefs = {aaweapon = weapon_common}
        },
        raptor_hive_assault_superheavy = {
            metalcost = 9000,
            health = 35000,
            speed = 16.0,
            nochasecategory = "OBJECT",
            icontype = "raptor_land_assault_basic_t4_v2",
            weapondefs = {aaweapon = weapon_common}
        },
        raptor_evolved_motort4 = {
            icontype = "raptor_allterrain_arty_basic_t4_v1",
            weapondefs = {poopoo = weapon_poopoo},
            weapons = {
                [1] = {
                    badtargetcategory = "MOBILE",
                    def = "poopoo",
                    maindir = "0 0 1",
                    maxangledif = 50,
                    onlytargetcategory = "NOTAIR"
                }
            }
        },
        raptor_acidspawnling = {
            metalcost = 375,
            energycost = 600,
            health = basehp * 2,
            icontype = "raptor_land_swarmer_basic_t1_v1",
            buildpic = "raptors/raptorh1b.DDS",
            objectname = "Raptors/raptor_droneb.s3o",
            weapondefs = {throwup = weapon_throwup},
            weapons = {
                [1] = {
                    def = "throwup",
                    onlytargetcategory = "NOTAIR",
                    maindir = "0 0 1",
                    maxangledif = 180
                }
            }
        }
    }

    for name, patch in pairs(overrides) do
        local def = UnitDefs[name]
        if def then
            for k, v in pairs(patch) do
                if k == "weapondefs" then
                    def.weapondefs = def.weapondefs or {}
                    for w, p in pairs(v) do
                        def.weapondefs[w] = def.weapondefs[w] or {}
                        for a, b in pairs(p) do
                            def.weapondefs[w][a] = b
                        end
                    end
                elseif k == "weapons" then
                    def.weapons = v
                else
                    def[k] = v
                end
            end
        end
    end
end
