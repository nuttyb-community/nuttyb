-- T4Eco
-- T4 Eco (Legendary Fusion & Metal Converters)
-- Authors: jackie188, Insider
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

    local factions = { 'arm', 'cor', 'leg' }
    local factionNames = {
        arm = 'Armada ',
        cor = 'Cortex ',
        leg = 'Legion ',
    }

    local function scaled(value, multiplier)
        if value then
            return math.ceil(value * multiplier)
        end
        return nil
    end

    local function cloneUnit(sourceUnit, targetUnit, overrides)
        if unitDefs[sourceUnit] and not unitDefs[targetUnit] then
            unitDefs[targetUnit] = tableMerge(unitDefs[sourceUnit], overrides)
        end
    end

    local newUnitNames = {}

    -- Create Legendary metal converters and fusion reactors for each faction
    for _, faction in ipairs(factions) do
        local isLegion = (faction == 'leg')

        -- Metal Maker base unit name differs for Legion
        local baseConverterName = isLegion and 'legadveconv'
            or (faction .. 'mmkr')
        local templateConverterName = baseConverterName .. 't3'
        local newConverterName = baseConverterName .. 't4'
        local metalMakerDef = unitDefs[templateConverterName]

        -- T4 Legendary Energy Converter
        if metalMakerDef then
            local t4Multiplier = 2.0
            cloneUnit(templateConverterName, newConverterName, {
                description = 'Legendary Energy Converter',
                metalcost = scaled(metalMakerDef.metalcost, t4Multiplier),
                energycost = scaled(metalMakerDef.energycost, t4Multiplier),
                buildtime = scaled(metalMakerDef.buildtime, t4Multiplier),
                health = scaled(metalMakerDef.health, t4Multiplier * 6),
                customparams = {
                    energyconv_capacity = scaled(metalMakerDef.customparams.energyconv_capacity, 2),
                    energyconv_efficiency = 0.022,
                    buildinggrounddecaldecayspeed = metalMakerDef.customparams.buildinggrounddecaldecayspeed,
                    buildinggrounddecalsizex = metalMakerDef.customparams.buildinggrounddecalsizex,
                    buildinggrounddecalsizey = metalMakerDef.customparams.buildinggrounddecalsizey,
                    buildinggrounddecaltype = metalMakerDef.customparams.buildinggrounddecaltype,
                    model_author = metalMakerDef.customparams.model_author,
                    normaltex = metalMakerDef.customparams.normaltex,
                    removestop = metalMakerDef.customparams.removestop,
                    removewait = metalMakerDef.customparams.removewait,
                    subfolder = metalMakerDef.customparams.subfolder,
                    techlevel = metalMakerDef.customparams.techlevel,
                    unitgroup = metalMakerDef.customparams.unitgroup,
                    usebuildinggrounddecal = metalMakerDef.customparams.usebuildinggrounddecal,
                    i18n_en_humanname = 'Legendary Energy Converter',
                    i18n_en_tooltip = 'Converts 12000 energy into 264 metal per sec (non-explosive)',
                },
                name = 'Legendary Energy Converter',
                buildpic = metalMakerDef.buildpic,
                objectname = metalMakerDef.objectname,
                footprintx = 6,
                footprintz = 6,
                yardmap = metalMakerDef.yardmap,
                script = metalMakerDef.script,
                activatewhenbuilt = metalMakerDef.activatewhenbuilt,
                explodeas = 'largeBuildingexplosiongeneric',
                selfdestructas = 'largeBuildingExplosionGenericSelfd',
                sightdistance = metalMakerDef.sightdistance,
                seismicsignature = metalMakerDef.seismicsignature,
                idleautoheal = metalMakerDef.idleautoheal,
                idletime = metalMakerDef.idletime,
                maxslope = metalMakerDef.maxslope,
                maxwaterdepth = metalMakerDef.maxwaterdepth,
                maxacc = metalMakerDef.maxacc,
                maxdec = metalMakerDef.maxdec,
                corpse = metalMakerDef.corpse,
                canrepeat = metalMakerDef.canrepeat,
            })

            table.insert(newUnitNames, newConverterName)
        end

        -- Fusion Reactor base unit
        local baseFusionName = faction .. 'afus'
        local templateFusionName = baseFusionName .. 't3'
        local newFusionName = baseFusionName .. 't4'
        local fusionDef = unitDefs[templateFusionName]

        -- Legendary Fusion Reactor (200% version)
        if fusionDef then
            cloneUnit(templateFusionName, newFusionName, {
                buildtime = scaled(fusionDef.buildtime, 1.8),
                name = 'Legendary Fusion Reactor',
                description = 'Legendary Fusion Reactor',
                metalcost = scaled(fusionDef.metalcost, 2.0),
                energycost = scaled(fusionDef.energycost, 2.0),
                energymake = scaled(fusionDef.energymake, 2.4),
                energystorage = scaled(fusionDef.energystorage, 6.0),
                health = scaled(fusionDef.health, 2.0 * 3),
                buildpic = fusionDef.buildpic,
                collisionvolumeoffsets = fusionDef.collisionvolumeoffsets,
                collisionvolumescales = fusionDef.collisionvolumescales,
                collisionvolumetype = fusionDef.collisionvolumetype,
                damagemodifier = 0.95,
                buildangle = fusionDef.buildangle,
                objectname = fusionDef.objectname,
                footprintx = 12,
                footprintz = 12,
                yardmap = fusionDef.yardmap,
                script = fusionDef.script,
                activatewhenbuilt = fusionDef.activatewhenbuilt,
                explodeas = 'largeBuildingexplosiongeneric',
                selfdestructas = 'largeBuildingExplosionGenericSelfd',
                sightdistance = fusionDef.sightdistance,
                seismicsignature = fusionDef.seismicsignature,
                idleautoheal = scaled(fusionDef.idleautoheal, 6),
                idletime = fusionDef.idletime,
                maxslope = fusionDef.maxslope,
                maxwaterdepth = fusionDef.maxwaterdepth,
                maxacc = fusionDef.maxacc,
                maxdec = fusionDef.maxdec,
                corpse = fusionDef.corpse,
                canrepeat = fusionDef.canrepeat,
                customparams = {
                    buildinggrounddecaldecayspeed = 30,
                    buildinggrounddecalsizex = 18,
                    buildinggrounddecalsizey = 18,
                    buildinggrounddecaltype = fusionDef.customparams.buildinggrounddecaltype,
                    model_author = fusionDef.customparams.model_author,
                    normaltex = fusionDef.customparams.normaltex,
                    subfolder = fusionDef.customparams.subfolder,
                    removestop = true,
                    removewait = true,
                    techlevel = 3,
                    unitgroup = 'energy',
                    usebuildinggrounddecal = true,
                    i18n_en_humanname = 'Legendary Fusion Reactor',
                    i18n_en_tooltip = 'Produces 72000 Energy (non-explosive)',
                },
                sfxtypes = {
                    pieceexplosiongenerators = {
                        [1] = 'deathceg2',
                        [2] = 'deathceg3',
                        [3] = 'deathceg4',
                    },
                },
                sounds = {
                    canceldestruct = 'cancel2',
                    underattack = 'warning1',
                    count = {
                        'count6',
                        'count5',
                        'count4',
                        'count3',
                        'count2',
                        'count1',
                    },
                    select = {
                        'fusion2',
                    },
                },
            })

            table.insert(newUnitNames, newFusionName)
        end
    end

    -- Add new units to T3 constructor build options
    local builders = {
        'armack',
        'armaca',
        'armacv',
        'armt3airaide',
        'armt3aide',
        'corack',
        'coraca',
        'coracv',
        'cort3airaide',
        'cort3aide',
        'legack',
        'legaca',
        'legacv',
        'legt3airaide',
        'legt3aide',
    }

    for _, builderName in pairs(builders) do
        local faction = builderName:sub(1, 3)

        for _, newUnitName in ipairs(newUnitNames) do
            if (newUnitName:sub(1, 3)) == faction then
                ensureBuildOption(builderName, newUnitName)
            end
        end
    end
end
