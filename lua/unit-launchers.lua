-- UnitLaunchers
-- This code adds new build options to t3 air and ground aides.
-- https://github.com/nuttyb-community/nuttyb

do
    local UnitDefs, armbotrail = UnitDefs or {}, 'armbotrail'
    local NewUnits = {
        armvadert4 = {
            customparams = { i18n_en_humanname = 'Epic Tumbleweed Launcher' },
            weapondefs = {
                arm_botrail = {
                    range = 7550,
                    metalpershot = 26600,
                    energypershot = 480000,
                    reloadtime = 0.5,
                    customparams = {
                        stockpilelimit = 50,
                        spawns_name = 'armvadert4',
                    },
                },
            },
        },
        armt3 = {
            customparams = { i18n_en_humanname = 'Armada T3 Launcher' },
            weapondefs = {
                arm_botrail = {
                    stockpiletime = 2,
                    range = 7550,
                    metalpershot = 15000,
                    energypershot = 180000,
                    reloadtime = 0.5,
                    customparams = {
                        stockpilelimit = 50,
                        spawns_name = 'armbanth armlun armmar armprowl armraz armthor armvang armassimilator armlunchbox armsptkt4 armdronecarryland armrattet4',
                        spawns_mode = 'random',
                    },
                },
            },
        },
        cort3 = {
            customparams = { i18n_en_humanname = 'Cortex T3 Launcher' },
            weapondefs = {
                arm_botrail = {
                    stockpiletime = 2,
                    range = 7550,
                    metalpershot = 15000,
                    energypershot = 180000,
                    reloadtime = 0.5,
                    customparams = {
                        stockpilelimit = 50,
                        spawns_name = 'corcat cordemon corjugg corkarg corkorg corshiva corakt4 cordeadeye corkarganetht4 corkark corthermite corgolt4',
                        spawns_mode = 'random',
                    },
                },
            },
        },
        legt3 = {
            customparams = { i18n_en_humanname = 'Legion T3 Launcher' },
            weapondefs = {
                arm_botrail = {
                    stockpiletime = 2,
                    range = 7550,
                    metalpershot = 15000,
                    energypershot = 180000,
                    reloadtime = 0.5,
                    customparams = {
                        stockpilelimit = 50,
                        spawns_name = 'leegmech legbunk legeheatraymech legelrpcmech legerailtank legeshotgunmech legjav legkeres leggobt3 legpede legsrailt4',
                        spawns_mode = 'random',
                    },
                },
            },
        },
    }

    local function ensureBuildOption(builderName, optionName)
        local builder = UnitDefs[builderName]
        local optionDef = optionName and UnitDefs[optionName]
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

    local createdUnits = {}
    for k, s in pairs(NewUnits) do
        local nU = armbotrail .. '_' .. k
        if UnitDefs[armbotrail] and not UnitDefs[nU] then
            UnitDefs[nU] = table.merge(UnitDefs[armbotrail], s)
            createdUnits[#createdUnits + 1] = nU
        end
    end

    local builders = {
        'armt3aide',
        'armt3airaide',
        'cort3aide',
        'cort3airaide',
        'legt3aide',
        'legt3airaide',
    }
    for _, builderName in ipairs(builders) do
        for _, nU in ipairs(createdUnits) do
            ensureBuildOption(builderName, nU)
        end
    end
end
