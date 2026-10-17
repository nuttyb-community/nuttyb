-- EffectsReduction
-- Lighter weapon effects for better performance; combat stats, models and colours stay the same.
-- https://github.com/nuttyb-community/nuttyb

do
    local unitDefs = UnitDefs or {}
    -- 1 = Light: custom T4 units only
    -- 2 = Medium: also raptors, with smaller impact effects
    -- 3 = Heavy: every unit, no tracks or building decals
    local level = $LEVEL$

    local customUnits = {
        epic_ragnarok = true,
        epic_calamity = true,
        epic_starfall = true,
        armannit4 = true,
        cordoomt4 = true,
        legbastiont4 = true,
        leggatet4 = true,
    }

    for unitName, unitDef in pairs(unitDefs) do
        local isCustom = customUnits[unitName]
        local isRaptor = unitName:find('raptor', 1, true) ~= nil
        if isCustom or (level >= 2 and isRaptor) or level >= 3 then
            for _, weaponDef in pairs(unitDef.weapondefs or {}) do
                weaponDef.cegtag = ''
                weaponDef.smoketrail = false
                weaponDef.smoketrailcastshadow = false
                weaponDef.camerashake = 0

                local isShield = string.lower(weaponDef.weapontype or '')
                    == 'shield'
                if level >= 2 and not isShield then
                    if not isCustom then
                        weaponDef.explosiongenerator = 'custom:laserhit-mini'
                    elseif level == 3 then
                        weaponDef.explosiongenerator =
                            'custom:laserhit-mini-purple'
                    else
                        weaponDef.explosiongenerator =
                            'custom:laserhit-small-purple'
                    end
                end
            end

            if level >= 3 then
                unitDef.leavetracks = false
                if unitDef.customparams then
                    unitDef.customparams.usebuildinggrounddecal = false
                end
            end
        end
    end
end
