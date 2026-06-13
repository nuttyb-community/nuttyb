-- T3Def
-- T3 Defences NuttyB version (relabel base experimental units to T3 tier)
-- https://github.com/nuttyb-community/nuttyb

do
    local unitDefs = UnitDefs or {}

    local t3DefenceNames = {
        armannit3 = 'T3 Pulsar',
        cordoomt3 = 'T3 Bulwark',
        legbastion = 'T3 Bastion',
    }

    for unitName, humanName in pairs(t3DefenceNames) do
        local def = unitDefs[unitName]
        if def then
            def.name = humanName
            def.customparams = def.customparams or {}
            def.customparams.i18n_en_humanname = humanName
        end
    end
end
