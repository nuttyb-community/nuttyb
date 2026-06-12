-- MainDefs
-- NuttyB v1.52b Def Main
-- Authors: ChrispyNut, BackBash
-- https://github.com/nuttyb-community/nuttyb

local unitDefs, tableMerge = UnitDefs or {}, table.merge

-- Commanders deliberately have no repulsor shields: adding Shield weapons to
-- them caused a desync error in the engine.

for name, def in pairs(unitDefs) do
    if string.sub(name, 1, 24) == 'raptor_air_fighter_basic' then
        if def.weapondefs then
            for _, weaponDef in pairs(def.weapondefs) do
                weaponDef.name = 'Spike'
                weaponDef.accuracy = 200
                weaponDef.collidefriendly = 0
                weaponDef.collidefeature = 0
                weaponDef.avoidfeature = 0
                weaponDef.avoidfriendly = 0
                weaponDef.areaofeffect = 64
                weaponDef.edgeeffectiveness = 0.3
                weaponDef.explosiongenerator =
                    'custom:raptorspike-large-sparks-burn'
                weaponDef.cameraShake = {}
                weaponDef.dance = {}
                weaponDef.interceptedbyshieldtype = 0
                weaponDef.model = 'Raptors/spike.s3o'
                weaponDef.reloadtime = 1.1
                weaponDef.soundstart = 'talonattack'
                weaponDef.startvelocity = 200
                weaponDef.submissile = 1
                weaponDef.smoketrail = 0
                weaponDef.smokePeriod = {}
                weaponDef.smoketime = {}
                weaponDef.smokesize = {}
                weaponDef.smokecolor = {}
                weaponDef.soundhit = {}
                weaponDef.texture1 = {}
                weaponDef.texture2 = {}
                weaponDef.tolerance = {}
                weaponDef.tracks = 0
                weaponDef.turnrate = 60000
                weaponDef.weaponacceleration = 100
                weaponDef.weapontimer = 1
                weaponDef.weaponvelocity = 1000
                weaponDef.weapontype = {}
                weaponDef.wobble = {}
            end
        end
    elseif name:match '^[acl][ore][rgm]com' and not name:match '_scav$' then
        table.mergeInPlace(def, {
            customparams = {
                combatradius = 0,
                fall_damage_multiplier = 0,
                paratrooper = true,
                wtboostunittype = {},
            },
            featuredefs = {
                dead = {
                    damage = 9999999,
                    reclaimable = false,
                    mass = 9999999,
                },
            },
        })
    end
end

local weaponMods = {
    raptor_air_kamikaze_basic_t2_v1 = {
        selfdestructas = 'raptor_empdeath_big',
    },
    raptor_land_swarmer_emp_t2_v1 = {
        weapondefs = {
            raptorparalyzersmall = {
                damage = { shields = 70 },
                paralyzetime = 6,
            },
        },
    },
    raptor_land_assault_emp_t2_v1 = {
        weapondefs = {
            raptorparalyzerbig = {
                damage = { shields = 150 },
                paralyzetime = 10,
            },
        },
    },
    raptor_allterrain_arty_emp_t2_v1 = {
        weapondefs = {
            goolauncher = {
                paralyzetime = 6,
            },
        },
    },
    raptor_allterrain_arty_emp_t4_v1 = {
        weapondefs = {
            goolauncher = {
                paralyzetime = 10,
            },
        },
    },
    raptor_air_bomber_emp_t2_v1 = {
        weapondefs = {
            weapon = {
                damage = {
                    shields = 1100,
                    default = 2000,
                },
                paralyzetime = 10,
            },
        },
    },
    raptor_allterrain_swarmer_emp_t2_v1 = {
        weapondefs = {
            raptorparalyzersmall = {
                damage = { shields = 70 },
                paralyzetime = 6,
            },
        },
    },
    raptor_allterrain_assault_emp_t2_v1 = {
        weapondefs = {
            raptorparalyzerbig = {
                damage = { shields = 150 },
                paralyzetime = 6,
            },
        },
    },
    raptor_matriarch_electric = {
        weapondefs = {
            goo = { paralyzetime = 13 },
            melee = { paralyzetime = 13 },
            spike_emp_blob = { paralyzetime = 13 },
        },
    },
}

for unitName, modifications in pairs(weaponMods) do
    if unitDefs[unitName] then
        unitDefs[unitName] = tableMerge(unitDefs[unitName], modifications)
    end
end

for _, raptorTurretName in pairs({
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
    'raptor_worm_green',
}) do
    local raptorTurretDef = unitDefs[raptorTurretName]
    if raptorTurretDef then
        raptorTurretDef.maxthisunit = 10
        raptorTurretDef.health = raptorTurretDef.health * 2
        if raptorTurretDef.weapondefs then
            for _, weapon in pairs(raptorTurretDef.weapondefs) do
                weapon.reloadtime = weapon.reloadtime / 1.5
                weapon.range = weapon.range / 2
            end
        end
    end
end

-- Flying builders should not explode on death
for _, def in pairs(unitDefs) do
    if def.builder == true and def.canfly == true then
        def.explodeas = ''
        def.selfdestructas = ''
    end
end

local bombers = {
    'raptor_air_bomber_basic_t2_v1',
    'raptor_air_bomber_basic_t2_v2',
    'raptor_air_bomber_basic_t4_v1',
    'raptor_air_bomber_basic_t4_v2',
    'raptor_air_bomber_basic_t1_v1',
}

for _, bomberName in pairs(bombers) do
    local def = unitDefs[bomberName]
    if def and def.weapondefs then
        for _, weaponDef in pairs(def.weapondefs) do
            weaponDef.damage.default = weaponDef.damage.default / 1.30
        end
    end
end

local respawnTurrets = { 'armrespawn', 'correspawn', 'legnanotcbase' }
for _, name in ipairs(respawnTurrets) do
    local def = unitDefs[name]
    if def then
        def.cantbetransported, def.footprintx, def.footprintz = false, 4, 4
        def.customparams = def.customparams or {}
        def.customparams.paratrooper = true
        def.customparams.fall_damage_multiplier = 0
    end
end

-- Hive Spawns

local function deepCopy(orig)
    local copy = {}
    for k, v in pairs(orig) do
        copy[k] = type(v) == 'table' and deepCopy(v) or v
    end
    return copy
end

local function insertMissing(target, source)
    for k, v in pairs(source) do
        if type(v) == 'table' then
            target[k] = target[k] or {}
            insertMissing(target[k], v)
        elseif target[k] == nil then
            target[k] = v
        end
    end
end

local function cloneUnit(base, new, additions)
    if unitDefs[base] and not unitDefs[new] then
        local copy = deepCopy(unitDefs[base])
        insertMissing(copy, additions)
        unitDefs[new] = copy
    end
end

local clones = {
    {
        'raptor_land_swarmer_basic_t1_v1',
        'raptor_hive_swarmer_basic',
        {
            name = 'Hive Spawn',
            customparams = {
                i18n_en_humanname = 'Hive Spawn',
                i18n_en_tooltip = 'Raptor spawned to defend hives from attackers.',
            },
        },
    },
    {
        'raptor_land_assault_basic_t2_v1',
        'raptor_hive_assault_basic',
        {
            name = 'Armored Assault Raptor',
            customparams = {
                i18n_en_humanname = 'Armored Assault Raptor',
                i18n_en_tooltip = 'Heavy, slow, and unyielding—these beasts are made to take the hits others cant.',
            },
        },
    },
    {
        'raptor_land_assault_basic_t4_v1',
        'raptor_hive_assault_heavy',
        {
            name = 'Heavy Armored Assault Raptor',
            customparams = {
                i18n_en_humanname = 'Heavy Armored Assault Raptor',
                i18n_en_tooltip = 'Lacking speed, these armored monsters make up for it with raw, unbreakable toughness.',
            },
        },
    },
    {
        'raptor_land_assault_basic_t4_v2',
        'raptor_hive_assault_superheavy',
        {
            name = 'Super Heavy Armored Assault Raptor',
            customparams = {
                i18n_en_humanname = 'Super Heavy Armored Assault Raptor',
                i18n_en_tooltip = 'These super-heavy armored beasts may be slow, but they’re built to take a pounding and keep rolling.',
            },
        },
    },
    {
        'raptorartillery',
        'raptor_evolved_motort4',
        {
            name = 'Evolved Lobber',
            customparams = {
                i18n_en_humanname = 'Evolved Lobber',
                i18n_en_tooltip = 'These lobbers did not just evolve—they became deadlier than anything before them.',
            },
        },
    },
    {
        'raptor_land_swarmer_basic_t1_v1',
        'raptor_acidspawnling',
        {
            name = 'Acid Spawnling',
            customparams = {
                i18n_en_humanname = 'Acid Spawnling',
                i18n_en_tooltip = 'This critters are so cute but can be so deadly at the same time.',
            },
        },
    },
}
for _, data in ipairs(clones) do
    cloneUnit(data[1], data[2], data[3])
end

local oldUnitDef_Post = UnitDef_Post
function UnitDef_Post(unitID, unitDef)
    if oldUnitDef_Post and oldUnitDef_Post ~= UnitDef_Post then
        oldUnitDef_Post(unitID, unitDef)
    end

    local basehp = (
        unitDefs['raptor_land_swarmer_basic_t1_v1']
        and unitDefs['raptor_land_swarmer_basic_t1_v1'].health
    )

    local weapon_common = {
        texture1 = {},
        texture2 = {},
        tracks = false,
        weaponvelocity = 4000,
        smokePeriod = {},
        smoketime = {},
        smokesize = {},
        smokecolor = {},
        smoketrail = 0,
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
        cegtag = 'blob_trail_blue',
        explosiongenerator = 'custom:genericshellexplosion-huge-bomb',
        impulsefactor = 0.4,
        intensity = 0.3,
        interceptedbyshieldtype = 1,
        range = 2300,
        reloadtime = 10,
        rgbcolor = '0.2 0.5 0.9',
        size = 8,
        sizedecay = 0.09,
        soundhit = 'bombsmed2',
        soundstart = 'bugarty',
        sprayangle = 2048,
        tolerance = 60000,
        turnrate = 6000,
        trajectoryheight = 2,
        turret = true,
        weapontype = 'Cannon',
        weaponvelocity = 520,
        startvelocity = 140,
        weaponacceleration = 125,
        weapontimer = 0.2,
        wobble = 14500,
        highTrajectory = 1,
        damage = { default = 900, shields = 600 },
    }

    local weapon_throwup = {
        accuracy = 1024,
        areaofeffect = 24,
        burst = 1,
        burstrate = 0.3,
        cegtag = 'blob_trail_green',
        edgeeffectiveness = 0.63,
        explosiongenerator = 'custom:raptorspike-small-sparks-burn',
        impulsefactor = 1,
        intensity = 0.4,
        interceptedbyshieldtype = 1,
        name = 'Acid',
        range = 250,
        reloadtime = 1,
        rgbcolor = '0.8 0.99 0.11',
        size = 1,
        stages = 6,
        soundhit = 'bloodsplash3',
        soundstart = 'alien_bombrel',
        sprayangle = 128,
        tolerance = 5000,
        turret = true,
        weapontimer = 0.1,
        weapontype = 'Cannon',
        weaponvelocity = 320,
        damage = { default = 80 },
    }

    local overrides = {
        raptor_hive_swarmer_basic = {
            metalcost = 350,
            nochasecategory = 'OBJECT',
            icontype = 'raptor_land_swarmer_basic_t1_v1',
        },
        raptor_hive_assault_basic = {
            metalcost = 3000,
            health = 25000,
            speed = 20.0,
            nochasecategory = 'OBJECT',
            icontype = 'raptor_land_assault_basic_t2_v1',
            weapondefs = { aaweapon = weapon_common },
        },
        raptor_hive_assault_heavy = {
            metalcost = 6000,
            health = 30000,
            speed = 17.0,
            nochasecategory = 'OBJECT',
            icontype = 'raptor_land_assault_basic_t4_v1',
            weapondefs = { aaweapon = weapon_common },
        },
        raptor_hive_assault_superheavy = {
            metalcost = 9000,
            health = 35000,
            speed = 16.0,
            nochasecategory = 'OBJECT',
            icontype = 'raptor_land_assault_basic_t4_v2',
            weapondefs = { aaweapon = weapon_common },
        },
        raptor_evolved_motort4 = {
            icontype = 'raptor_allterrain_arty_basic_t4_v1',
            weapondefs = { poopoo = weapon_poopoo },
            weapons = {
                [1] = {
                    badtargetcategory = 'MOBILE',
                    def = 'poopoo',
                    maindir = '0 0 1',
                    maxangledif = 50,
                    onlytargetcategory = 'NOTAIR',
                },
            },
        },
        raptor_acidspawnling = {
            metalcost = 375,
            energycost = 600,
            health = basehp * 2,
            icontype = 'raptor_land_swarmer_basic_t1_v1',
            buildpic = 'raptors/raptorh1b.DDS',
            objectname = 'Raptors/raptor_droneb.s3o',
            weapondefs = { throwup = weapon_throwup },
            weapons = {
                [1] = {
                    def = 'throwup',
                    onlytargetcategory = 'NOTAIR',
                    maindir = '0 0 1',
                    maxangledif = 180,
                },
            },
        },
    }

    for name, patch in pairs(overrides) do
        local def = unitDefs[name]
        if def then
            for key, value in pairs(patch) do
                if key == 'weapondefs' then
                    def.weapondefs = def.weapondefs or {}
                    for weaponName, weaponPatch in pairs(value) do
                        def.weapondefs[weaponName] = def.weapondefs[weaponName]
                            or {}
                        for field, fieldValue in pairs(weaponPatch) do
                            def.weapondefs[weaponName][field] = fieldValue
                        end
                    end
                elseif key == 'weapons' then
                    def.weapons = value
                else
                    def[key] = value
                end
            end
        end
    end
end
