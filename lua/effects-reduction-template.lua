-- EffectsReduction
-- Lighter weapon effects for better performance; combat stats, models and colours stay the same.
-- https://github.com/nuttyb-community/nuttyb

do
    local unitDefs = UnitDefs or {}
    -- 1 = Light: custom T4 units only, plus harmless raptor death blasts
    -- shrunk to a point (every level)
    -- 2 = Medium: also raptors, with smaller impact effects
    -- 3 = Heavy: every unit, no tracks or building decals
    local level = TPL_LEVEL

    local customUnits = {
        epic_ragnarok = true,
        epic_calamity = true,
        epic_starfall = true,
        armannit4 = true,
        cordoomt4 = true,
        legbastiont4 = true,
        leggatet4 = true,
    }

    -- Raptor death blasts that deal no damage still run every damage callin
    -- (UnitPreDamaged and friends) for each unit inside their radius. Their
    -- defs are shared ones in weapons/Raptors/, collected here by name
    local harmlessBlasts = {}
    if VFS and VFS.DirList and VFS.Include then
        for _, path in ipairs(VFS.DirList('weapons/Raptors/', '*.lua')) do
            local ok, weapons = pcall(VFS.Include, path)
            if ok and type(weapons) == 'table' then
                for name, weaponDef in pairs(weapons) do
                    local maxDamage = 0
                    for _, damage in pairs(weaponDef.damage or {}) do
                        maxDamage = math.max(maxDamage, damage)
                    end
                    if maxDamage <= 0.001 then
                        harmlessBlasts[string.lower(name)] = weaponDef
                    end
                end
            end
        end
    end

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

        -- BAR resolves explodeas to the unit's own weapondef first, so an own
        -- point-sized copy replaces the shared blast. Unarmed raptors are
        -- skipped: a weapondef would make BAR treat them as armed
        if isRaptor and unitDef.weapondefs then
            for _, key in ipairs({ 'explodeas', 'selfdestructas' }) do
                local name = string.lower(unitDef[key] or '')
                local blast = harmlessBlasts[name]
                if blast and not unitDef.weapondefs[name] then
                    local point = table.copy(blast)
                    point.areaofeffect = 1
                    unitDef.weapondefs[name] = point
                end
            end
        end
    end
end
