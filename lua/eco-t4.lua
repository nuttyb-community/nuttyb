-- T4Eco
-- T4 Eco (Fusion Reactors & Energy Converters)
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

    local function scaled(value, multiplier)
        return value and math.ceil(value * multiplier) or nil
    end

    local function round(value)
        return math.floor(value + 0.5)
    end

    -- cloneUnit deep-merges, so any field not overridden is inherited from
    -- the source unit.
    local function cloneUnit(sourceUnit, targetUnit, overrides)
        if unitDefs[sourceUnit] and not unitDefs[targetUnit] then
            unitDefs[targetUnit] = tableMerge(unitDefs[sourceUnit], overrides)
        end
    end

    local newUnitNames = {}

    -- Create T4 energy converters and fusion reactors for each faction
    for _, faction in ipairs(factions) do
        local isLegion = (faction == 'leg')

        -- Metal Maker base unit name differs for Legion
        local baseConverterName = isLegion and 'legadveconv'
            or (faction .. 'mmkr')
        local templateConverterName = baseConverterName .. 't3'
        local newConverterName = baseConverterName .. 't4'
        local metalMakerDef = unitDefs[templateConverterName]

        -- T4 Energy Converter
        if metalMakerDef then
            local t4Multiplier = 2.0
            local capacity = scaled(
                tonumber(metalMakerDef.customparams.energyconv_capacity) or 0,
                2
            )
            local efficiency = 0.022
            cloneUnit(templateConverterName, newConverterName, {
                name = 'T4 Energy Converter',
                description = 'T4 Energy Converter',
                metalcost = scaled(metalMakerDef.metalcost, t4Multiplier),
                energycost = scaled(metalMakerDef.energycost, t4Multiplier),
                buildtime = scaled(metalMakerDef.buildtime, t4Multiplier),
                health = scaled(metalMakerDef.health, t4Multiplier * 6),
                footprintx = 6,
                footprintz = 6,
                -- Non-explosive: die like a generic building instead of the
                -- converter's violent explosion
                explodeas = 'largeBuildingexplosiongeneric',
                selfdestructas = 'largeBuildingExplosionGenericSelfd',
                customparams = {
                    energyconv_capacity = capacity,
                    energyconv_efficiency = efficiency,
                    i18n_en_humanname = 'T4 Energy Converter',
                    i18n_en_tooltip = ('Converts %d energy into %d metal per sec (non-explosive)'):format(
                        capacity,
                        round(capacity * efficiency)
                    ),
                },
            })

            table.insert(newUnitNames, newConverterName)
        end

        -- Fusion Reactor base unit
        local baseFusionName = faction .. 'afus'
        local templateFusionName = baseFusionName .. 't3'
        local newFusionName = baseFusionName .. 't4'
        local fusionDef = unitDefs[templateFusionName]

        -- T4 Fusion Reactor
        if fusionDef then
            local energyMake = scaled(fusionDef.energymake, 2.4) or 0
            cloneUnit(templateFusionName, newFusionName, {
                name = 'T4 Fusion Reactor',
                description = 'T4 Fusion Reactor',
                buildtime = scaled(fusionDef.buildtime, 1.8),
                metalcost = scaled(fusionDef.metalcost, 2.0),
                energycost = scaled(fusionDef.energycost, 2.0),
                energymake = energyMake,
                energystorage = scaled(fusionDef.energystorage, 6.0),
                health = scaled(fusionDef.health, 2.0 * 3),
                idleautoheal = scaled(fusionDef.idleautoheal, 6),
                damagemodifier = 0.95,
                footprintx = 12,
                footprintz = 12,
                -- Non-explosive: die like a generic building instead of the
                -- fusion's catastrophic explosion
                explodeas = 'largeBuildingexplosiongeneric',
                selfdestructas = 'largeBuildingExplosionGenericSelfd',
                customparams = {
                    buildinggrounddecaldecayspeed = 30,
                    buildinggrounddecalsizex = 18,
                    buildinggrounddecalsizey = 18,
                    removestop = true,
                    removewait = true,
                    techlevel = 3,
                    unitgroup = 'energy',
                    usebuildinggrounddecal = true,
                    i18n_en_humanname = 'T4 Fusion Reactor',
                    i18n_en_tooltip = ('Produces %d Energy (non-explosive)'):format(
                        energyMake
                    ),
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
