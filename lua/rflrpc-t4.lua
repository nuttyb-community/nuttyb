-- T4RFLRPC
-- Epic Ragnarok, Calamity, Starfall
-- Authors: Altwaal
-- https://github.com/nuttyb-community/nuttyb

do
    local unitDefs, tableMerge = UnitDefs or {}, table.merge

    local function ensureBuildOption(builderName, optionName)
        local builder = unitDefs[builderName]
        local optionDef = optionName and unitDefs[optionName]
        if not builder or not optionDef then
            return
        end

        builder.buildoptions = builder.buildoptions or {}
        for i = 1, #builder.buildoptions do
            if builder.buildoptions[i] == optionName then
                return
            end
        end

        builder.buildoptions[#builder.buildoptions + 1] = optionName
    end

    -- Epic unit names
    local EPIC_RAGNAROK = 'epic_ragnarok'
    local EPIC_CALAMITY = 'epic_calamity'
    local EPIC_STARFALL = 'epic_starfall'

    unitDefs[EPIC_RAGNAROK] = tableMerge(unitDefs['armvulc'], {
        name = 'T4 Ragnarok',
        description = 'Advanced Armada artillery engineering. Unleashes powerful plasma barrages across the battlefield.',
        buildtime = 900000,
        health = 140000,
        metalcost = 180000,
        energycost = 2600000,
        icontype = 'armvulc',
        customparams = {
            i18n_en_humanname = 'T4 Ragnarok',
            i18n_en_tooltip = 'Powerful burst-fire plasma artillery. Destroys everything in range.',
            techlevel = 4,
        },
        weapondefs = {
            apocalypse_plasma_cannon = {
                collidefriendly = 0,
                collidefeature = 0,
                avoidfeature = 0,
                avoidfriendly = 0,
                name = 'Apocalypse Plasma Cannon',
                weapontype = 'BeamLaser',
                rgbcolor = '1.0 0.2 0.1',
                burst = 4,
                burstrate = 0.25,
                reloadtime = 6,
                accuracy = 500,
                areaofeffect = 160,
                range = 3080,
                energypershot = 88750,
                turret = true,
                soundstart = 'lrpcshot3',
                soundhit = 'rflrpcexplo',
                soundhitvolume = 40,
                size = 8,
                impulsefactor = 1.3,
                weaponvelocity = 3100,
                thickness = 12,
                laserflaresize = 8,
                texture3 = 'largebeam',
                tilelength = 150,
                tolerance = 10000,
                beamtime = 0.12,
                corethickness = 0.4,
                explosiongenerator = 'custom:tachyonshot',
                craterboost = 0.15,
                cratermult = 0.15,
                edgeeffectiveness = 0.25,
                impactonly = 1,
                noselfdamage = true,
                soundtrigger = 1,
                damage = {
                    default = 22701,
                    shields = 2673,
                    subs = 1338,
                },
                allowNonBlockingAim = true,
            },
        },
        weapons = {
            [1] = {
                badtargetcategory = 'MOBILE',
                def = 'apocalypse_plasma_cannon',
                onlytargetcategory = 'SURFACE',
            },
        },
    })

    unitDefs[EPIC_CALAMITY] = tableMerge(unitDefs['corbuzz'], {
        name = 'T4 Calamity',
        description = 'Advanced Cortex siege technology. Fires large plasma shells that devastate formations with each impact.',
        buildtime = 920000,
        health = 145000,
        metalcost = 165000,
        energycost = 2700000,
        icontype = 'corbuzz',
        customparams = {
            i18n_en_humanname = 'T4 Calamity',
            i18n_en_tooltip = 'Large single-shot plasma artillery. Each shell causes major destruction.',
            techlevel = 4,
        },
        weapondefs = {
            cataclysm_plasma_howitzer = {
                collidefriendly = 0,
                collidefeature = 0,
                avoidfeature = 0,
                avoidfriendly = 0,
                impactonly = 1,
                name = 'Cataclysm Plasma Howitzer',
                weapontype = 'Cannon',
                rgbcolor = '0.15 0.6 0.5',
                camerashake = 0,
                reloadtime = 0.3,
                accuracy = 300,
                areaofeffect = 220,
                range = 3150,
                energypershot = 4600,
                turret = true,
                soundstart = 'lrpcshot3',
                soundhit = 'rflrpcexplo',
                soundhitvolume = 50,
                size = 12,
                impulsefactor = 2.0,
                weaponvelocity = 2500,
                footprintx = 14,
                footprintz = 14,
                turnrate = 20000,
                thickness = 18,
                laserflaresize = 8,
                texture3 = 'largebeam',
                tilelength = 200,
                tolerance = 10000,
                explosiongenerator = 'custom:tachyonshot',
                craterboost = 0.25,
                cratermult = 0.25,
                edgeeffectiveness = 0.35,
                damage = {
                    default = 3720,
                    shields = 2268,
                    subs = 972,
                },
                allowNonBlockingAim = true,
            },
        },
        weapons = {
            [1] = {
                badtargetcategory = 'MOBILE',
                def = 'cataclysm_plasma_howitzer',
                onlytargetcategory = 'SURFACE',
            },
        },
    })

    unitDefs[EPIC_STARFALL] = tableMerge(unitDefs['legstarfall'], {
        name = 'T4 Starfall',
        description = 'Advanced Legion siege technology. Unleashes devastating rocket barrages that obliterate everything in range.',
        buildtime = 180000,
        health = 145000,
        metalcost = 180000,
        energycost = 3400000,
        collisionvolumescales = '61 128 61',
        footprintx = 6,
        footprintz = 6,
        collisionvolumetype = 'CylY',
        yardmap = 'oooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooo',
        icontype = 'legstarfall',
        customparams = {
            i18n_en_humanname = 'T4 Starfall',
            i18n_en_tooltip = 'Massive rocket artillery. Fires devastating direct-fire rocket barrages.',
            techlevel = 4,
            modelradius = 150,
        },
        weapondefs = {
            epic_rocket_barrage = {
                areaofeffect = 180,
                avoidfeature = false,
                avoidfriendly = false,
                collidefriendly = false,
                castshadow = true,
                cegtag = 'missiletrailviper',
                craterareaofeffect = 0,
                craterboost = 0,
                cratermult = 0,
                camerashake = 0,
                edgeeffectiveness = 0.25,
                explosiongenerator = 'custom:genericshellexplosion-large-bomb',
                firestarter = 90,
                impulsefactor = 0.5,
                model = 'cormissile3fast.s3o',
                name = 'Epic Rocket Barrage',
                noselfdamage = true,
                range = 3300,
                reloadtime = 20,
                energypershot = 400000,
                smokecolor = 0.8,
                smokeperiod = 8,
                smokesize = 14,
                smoketime = 40,
                smoketrail = true,
                smoketrailcastshadow = false,
                soundhit = 'xplomed4',
                soundhitwet = 'splslrg',
                soundstart = 'missilelauncher',
                startvelocity = 400,
                targetmoveerror = 0.15,
                texture1 = 'null',
                texture2 = 'railguntrail',
                tolerance = 8000,
                tracks = true,
                turnrate = 18000,
                turret = true,
                weaponacceleration = 200,
                weapontype = 'MissileLauncher',
                weaponvelocity = 800,
                damage = {
                    default = 25000,
                    commanders = 18750,
                    subs = 500,
                    vtol = 2500,
                },
            },
        },
        weapons = {
            [1] = {
                badtargetcategory = 'MOBILE',
                def = 'epic_rocket_barrage',
                onlytargetcategory = 'SURFACE',
            },
        },
    })

    -- Builders that can construct epic units
    local builders = {
        'armaca',
        'armack',
        'armacsub',
        'armacv',
        'armt3airaide',
        'armt3aide',
        'coraca',
        'corack',
        'coracsub',
        'coracv',
        'cort3airaide',
        'cort3aide',
        'legaca',
        'legack',
        'legacv',
        'legcomt2com',
        'legt3airaide',
        'legt3aide',
    }

    -- Add commander levels 3-10 for each faction
    for _, faction in pairs({ 'arm', 'cor', 'leg' }) do
        for level = 3, 10 do
            table.insert(builders, faction .. 'comlvl' .. level)
        end
    end

    -- Add epic units to builder build options based on faction
    for _, builderName in pairs(builders) do
        local faction = builderName:sub(1, 3)

        if faction == 'arm' then
            ensureBuildOption(builderName, EPIC_RAGNAROK)
        elseif faction == 'cor' then
            ensureBuildOption(builderName, EPIC_CALAMITY)
        elseif faction == 'leg' then
            ensureBuildOption(builderName, EPIC_STARFALL)
        end
    end
end
