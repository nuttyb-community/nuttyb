-- TumbleweedLauncher
-- This code adds an Epic Tumbleweed launcher to t3 air and ground aides.
-- https://github.com/nuttyb-community/nuttyb

do
    local UnitDefs, armbotrail = UnitDefs or {}, 'armbotrail'
    local launcherName = armbotrail .. '_armvadert4'

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

    if UnitDefs[armbotrail] and not UnitDefs[launcherName] then
        UnitDefs[launcherName] = table.merge(UnitDefs[armbotrail], {
            customparams = {
                i18n_en_humanname = 'Epic Tumbleweed Launcher',
                i18n_en_tooltip = 'Launches Epic Tumbleweeds to your enemy. Huge damage with friendly fire.',
            },
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
        })
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
        ensureBuildOption(builderName, launcherName)
    end
end
