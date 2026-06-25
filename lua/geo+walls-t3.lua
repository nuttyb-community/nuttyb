-- T3 Geo + Walls
-- Authors: RandomGuy
-- https://github.com/nuttyb-community/nuttyb

do
    local unitDefs = UnitDefs or {}

    local function cloneUnit(sourceUnitName, newUnitName, overrides)
        local sourceUnitDef = unitDefs[sourceUnitName]
        if not sourceUnitDef or unitDefs[newUnitName] then
            return nil
        end

        local newUnitDef = table.copy(sourceUnitDef)
        newUnitDef.customparams = table.copy(sourceUnitDef.customparams or {})

        overrides = overrides or {}
        for key, value in pairs(overrides) do
            if key ~= 'customparams' then
                newUnitDef[key] = value
            end
        end

        for key, value in pairs(overrides.customparams or {}) do
            newUnitDef.customparams[key] = value
        end

        unitDefs[newUnitName] = newUnitDef
        return newUnitDef
    end

    local function replaceWeapons(unitDef, weaponDefs, weapons)
        if not unitDef then
            return
        end

        unitDef.weapondefs = weaponDefs or {}
        unitDef.weapons = weapons or {}
    end

    local function copyWeaponDef(sourceUnitName, weaponName)
        local sourceUnitDef = unitDefs[sourceUnitName]
        local sourceWeaponDefs = sourceUnitDef and sourceUnitDef.weapondefs
        local sourceWeaponDef = sourceWeaponDefs and sourceWeaponDefs[weaponName]

        if not sourceWeaponDef then
            return {}
        end

        return table.copy(sourceWeaponDef)
    end

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

    local droneLaserWeapon = {
        areaofeffect = 12,
        avoidfeature = false,
        beamtime = 0.10,
        corethickness = 0.12,
        craterareaofeffect = 0,
        craterboost = 0,
        cratermult = 0,
        edgeeffectiveness = 0.15,
        explosiongenerator = 'custom:laserhit-small-green',
        firestarter = 100,
        impactonly = 1,
        impulsefactor = 0,
        laserflaresize = 5,
        name = 'Light laser',
        noselfdamage = true,
        range = 300,
        reloadtime = 0.5,
        rgbcolor = '0 1 0',
        soundhitdry = '',
        soundhitwet = 'sizzle',
        soundstart = 'lasrfir3',
        soundtrigger = 1,
        thickness = 2,
        tolerance = 10000,
        turret = true,
        weapontype = 'BeamLaser',
        weaponvelocity = 2250,
        damage = {
            default = 20,
        },
    }

    local droneLaserTargeting = {
        badtargetcategory = 'VTOL',
        def = 't3_drone_light_laser',
        maindir = '0 0 1',
        maxangledif = 90,
        onlytargetcategory = 'NOTSUB',
    }

    local paragonSpawnerWeapon = {
        areaofeffect = 4,
        avoidfeature = false,
        craterareaofeffect = 0,
        craterboost = 0,
        cratermult = 0,
        edgeeffectiveness = 0.15,
        explosiongenerator = '',
        gravityaffected = 'true',
        hightrajectory = 1,
        impulsefactor = 0.123,
        name = 'HeavyCannon',
        noselfdamage = true,
        metalpershot = 15,
        energypershot = 500,
        range = 1100,
        reloadtime = 2.5,
        size = 0,
        soundhit = '',
        soundhitwet = '',
        soundstart = '',
        stockpile = true,
        stockpiletime = 10,
        turret = true,
        weapontype = 'Cannon',
        weaponvelocity = 1000,
        damage = {
            default = 0,
        },
        customparams = {
            carried_unit = 'legparadrone',
            engagementrange = 1100,
            controlradius = 1200,
            spawns_surface = 'LAND',
            startingdronecount = 3,
            energycost = 500,
            metalcost = 15,
            spawnrate = 10,
            maxunits = 6,
            deathdecayrate = 20,
            carrierdeaththroe = 'release',
            dockingarmor = 0.2,
            docktohealthreshold = 66,
            dockinghealrate = 20,
            enabledocking = true,
            dockingHelperSpeed = 5,
            dockingpieces = '4 5 6 7 8 9',
            dockingradius = 80,
            stockpilelimit = 6,
            stockpilemetal = 15,
            stockpileenergy = 500,
            dronesusestockpile = true,
            cobdockparam = 1,
            cobundockparam = 1,
            dronedocktime = 3,
            droneairtime = 60,
            droneammo = 12,
        },
    }

    local railgunWeapon = {
        areaofeffect = 16,
        avoidfeature = false,
        burnblow = false,
        cegtag = 'railgun',
        craterareaofeffect = 0,
        craterboost = 0,
        cratermult = 0,
        duration = 0.12,
        edgeeffectiveness = 0.85,
        energypershot = 50,
        explosiongenerator = 'custom:plasmahit-sparkonly',
        fallOffRate = 0.2,
        firestarter = 0,
        hardstop = true,
        impactonly = true,
        impulseboost = 0.4,
        impulsefactor = 1,
        intensity = 0.8,
        name = 'Compact Railgun',
        noexplode = true,
        noselfdamage = true,
        range = 650,
        reloadtime = 4,
        rgbcolor = '0.34 0.64 0.94',
        soundhit = 'mavgun3',
        soundhitwet = 'splshbig',
        soundstart = 'lancefire',
        soundstartvolume = 26,
        thickness = 3,
        tolerance = 6000,
        turret = true,
        weapontype = 'LaserCannon',
        weaponvelocity = 3000,
        damage = {
            commanders = 250,
            default = 900,
        },
    }

    local legethemosDroneParams = {
        carried_unit = 'legbasicassistdrone legraildrone',
        engagementrange = 1600,
        spawns_surface = 'LAND',
        spawnrate = 8,
        dronetype = 'nano default',
        maxunits = '5 3',
        metalcost = '10 90',
        energycost = '600 1000',
        controlradius = 1600,
        deathdecayrate = 50,
        carrierdeaththroe = 'release',
        dockingarmor = 0.2,
        dockinghealrate = 256,
        docktohealthreshold = 33,
        enabledocking = false,
        dockingHelperSpeed = 5,
        dockingpieces = '10 10 10 10 10, 11 12 12',
        dockingradius = 80,
        droneairtime = '90 90',
        droneammo = '0 40',
    }

    local empLightningWeapon = {
        areaofeffect = 8,
        avoidfeature = false,
        beamttl = 1,
        burst = 4,
        burstrate = 0.02,
        craterareaofeffect = 0,
        craterboost = 0,
        cratermult = 0,
        duration = 1,
        edgeeffectiveness = 0.15,
        energypershot = 5,
        explosiongenerator = 'custom:genericshellexplosion-large-lightning2',
        firestarter = 50,
        impactonly = 1,
        impulsefactor = 0,
        intensity = 28,
        name = 'EMP Lightning Cannon',
        noselfdamage = true,
        range = 500,
        reloadtime = 0.1,
        rgbcolor = '0.5 0.5 1',
        soundhit = 'lashit',
        soundhitwet = 'sizzle',
        soundstart = 'lghthvy1',
        soundtrigger = true,
        thickness = 2.2,
        turret = true,
        weapontype = 'LightningCannon',
        weaponvelocity = 400,
        paralyzer = true,
        paralyzetime = 8,
        damage = {
            default = 30,
        },
    }

    local rocketArtilleryWeapon = {
        areaofeffect = 200,
        avoidfeature = true,
        avoidfriendly = false,
        burnblow = true,
        canattackground = true,
        castshadow = false,
        cegtag = 'missiletrailaa-large',
        collidefriendly = false,
        craterareaofeffect = 200,
        craterboost = 0,
        cratermult = 0,
        edgeeffectiveness = 0.6,
        energypershot = 0,
        explosiongenerator = 'custom:genericshellexplosion-huge-aa',
        firestarter = 90,
        flighttime = 10,
        impulsefactor = 0,
        metalpershot = 0,
        model = 'corscreamermissile.s3o',
        name = 'Long Range Seeker Rocket Platform',
        noselfdamage = true,
        range = 1950,
        reloadtime = 3.3,
        smokecolor = 0.9,
        smokeperiod = 2,
        smokesize = 4,
        smoketime = 24,
        smoketrail = true,
        smoketrailcastshadow = false,
        soundhit = 'impact',
        soundhitvolume = 8,
        soundhitwet = 'splslrg',
        soundstart = 'aarocket',
        soundstartvolume = 8,
        startvelocity = 1000,
        texture1 = 'null',
        texture2 = 'smoketrailaaflak',
        tolerance = 10000,
        tracks = true,
        trajectoryheight = 2,
        turnrate = 40000,
        turret = true,
        weapontimer = 1,
        weaponacceleration = 1000,
        weapontype = 'StarburstLauncher',
        weaponvelocity = 1400,
        damage = {
            commander = 412.5,
            default = 825,
        },
    }

    if unitDefs.legalab then
        local legParadrone = cloneUnit('legdrone', 'legparadrone', {
            health = 2000,
            customparams = {
                i18n_en_humanname = 'Reinforced Laser Drone',
            },
        })

        replaceWeapons(
            legParadrone,
            {
                lightlaser = droneLaserWeapon,
            },
            {
                [1] = {
                    badtargetcategory = 'VTOL',
                    def = 'lightlaser',
                    maindir = '0 0 1',
                    maxangledif = 90,
                    onlytargetcategory = 'NOTSUB',
                },
            }
        )

        local legParagon = cloneUnit('leghive', 'legparagon', {
            metalcost = 1100,
            energycost = 35000,
            buildtime = 40000,
            health = 20000,
            sightdistance = 500,
            idleautoheal = 50,
            idletime = 800,
            crushresistance = 2000,
            customparams = {
                i18n_en_humanname = 'Paragon',
                i18n_en_tooltip = 'Robust Laser Drone Fortification',
                techlevel = 3,
            },
        })

        replaceWeapons(
            legParagon,
            {
                plasma = paragonSpawnerWeapon,
            },
            {
                [1] = {
                    badtargetcategory = 'VTOL',
                    def = 'PLASMA',
                    onlytargetcategory = 'NOTSUB',
                },
            }
        )

        local legRailDrone = cloneUnit('legheavydrone', 'legraildrone', {
            customparams = {
                armordef = 'vtol',
            },
        })

        replaceWeapons(
            legRailDrone,
            {
                heat_ray = railgunWeapon,
            },
            {
                [1] = {
                    def = 'heat_ray',
                    maxangledif = 360,
                    onlytargetcategory = 'NOTSUB',
                },
            }
        )

        cloneUnit('legassistdrone', 'legbasicassistdrone', {
            buildtime = 2000,
            workertime = '160',
            buildoptions = {},
            customparams = {
                armordef = 'vtol',
            },
        })

        local legAgeoT3 = cloneUnit('legrampart', 'legageot3', {
            metalcost = 7000,
            energycost = 80000,
            buildtime = 110000,
            energymake = 2200,
            energystorage = 30000,
            health = 16000,
            workertime=800,
            explodeas = 'customfusionexplo',
            selfdestructas = 'korgExplosion',
            customparams = {
                i18n_en_humanname = 'Legethemos',
                i18n_en_tooltip = 'Radar/Jammer, Geo Railgun and Assist & Repair drone platform',
                techlevel = 3,
            },
        })

        local legethemosSpawnerWeapon = copyWeaponDef('legrampart', 'plasma')
        legethemosSpawnerWeapon.customparams = legethemosDroneParams

        replaceWeapons(
            legAgeoT3,
            {
                plasma = legethemosSpawnerWeapon,
                fmd_rocket = {},
            },
            {
                [1] = {
                    badtargetcategory = 'VTOL',
                    def = 'PLASMA',
                    onlytargetcategory = 'NOTSUB',
                },
                [2] = {
                    def = '',
                },
            }
        )
    end

    cloneUnit('corfort', 'cortyrant', {
        metalcost = 1300,
        energycost = 30000,
        buildtime = 60000,
        health = 40000,
        sightdistance = 300,
        idleautoheal = 0,
        idletime = 1000,
        autoheal = 400,
        crushresistance = 2000,
        customparams = {
            i18n_en_humanname = 'Tyrant',
            i18n_en_tooltip = 'Regenerating Memoryalloy Fortification',
            techlevel = 3,
        },
    })

    local armFirewall = cloneUnit('armlwall', 'armfirewall', {
        metalcost = 1400,
        energycost = 30000,
        buildtime = 40000,
        sightdistance = 600,
        health = 20000,
        crushresistance = 2000,
        customparams = {
            i18n_en_humanname = 'Equalizer',
            i18n_en_tooltip = 'Lightning EMP Fortification',
            techlevel = 3,
        },
    })

    replaceWeapons(
        armFirewall,
        {
            lightning = empLightningWeapon,
        },
        {
            [1] = {
                def = 'lightning',
                onlytargetcategory = 'NOTSUB',
                fastautoretargeting = true,
            },
        }
    )

    local corAgeoT3 = cloneUnit('corbhmth', 'corageot3', {
        buildpic = 'scavengers/CORBHMTH.DDS',
        metalcost = 7400,
        energycost = 50000,
        buildtime = 160000,
        energymake = 1900,
        energystorage = 45000,
        health = 18000,
        sightdistance = 650,
        explodeas = 'customfusionexplo',
        selfdestructas = 'korgExplosion',
        customparams = {
            i18n_en_humanname = 'Barrage',
            i18n_en_tooltip = 'Rocket Artillery Geothermal',
            techlevel = 3,
        },
    })

    replaceWeapons(
        corAgeoT3,
        {
            corbhmth_weapon = rocketArtilleryWeapon,
        },
        {
            [1] = {
                def = 'corbhmth_weapon',
                onlytargetcategory = 'NOTAIR',
                fastautoretargeting = true,
            },
            [2] = {
                def = 'corbhmth_weapon',
                onlytargetcategory = 'NOTAIR',
                fastautoretargeting = true,
            },
            [3] = {
                def = 'corbhmth_weapon',
                onlytargetcategory = 'NOTAIR',
                fastautoretargeting = true,
            },
        }
    )

    cloneUnit('armageo', 'armageot3', {
        buildpic = 'scavengers/ARMAGEO.DDS',
        metalcost = 5500,
        energycost = 40000,
        buildtime = 60000,
        energymake = 2000,
        energystorage = 100000,
        metalstorage = 100000,
        health = 10000,
        seismicdistance = 2000,
        radardistancejam = 800,
        sightdistance = 2000,
        cloakCost = 200,
        minCloakDistance = 100,
        canCloak = true,
        initCloaked = true,
        explodeas = 'customfusionexplo',
        selfdestructas = 'customfusionexplo',
        losEmitHeight = 100,
        customparams = {
            i18n_en_humanname = 'Outpost',
            i18n_en_tooltip = 'Cloaked, Stealthy Geo Intelligence Omnistorage',
            techlevel = 3,
        },
    })

    local armBuilders = {
        'armaca',
        'armack',
        'armacsub',
        'armacv',
        'armoc',
    }

    local corBuilders = {
        'coraca',
        'corack',
        'coracsub',
        'coracv',
        'coroc',
    }

    local legBuilders = {
        'legaca',
        'legack',
        'legacv',
        'legoc',
    }

    for _, builderName in pairs(armBuilders) do
        ensureBuildOption(builderName, 'armageot3')
        ensureBuildOption(builderName, 'armfirewall')
    end

    for _, builderName in pairs(corBuilders) do
        ensureBuildOption(builderName, 'corageot3')
        ensureBuildOption(builderName, 'cortyrant')
    end

    for _, builderName in pairs(legBuilders) do
        ensureBuildOption(builderName, 'legageot3')
        ensureBuildOption(builderName, 'legparagon')
    end
end
