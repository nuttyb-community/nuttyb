-- T3 Unit Evolution: 10min timer → +25% HP/Damage, 10m/100e
-- https://github.com/nuttyb-community/nuttyb

do
    local unitDefs = UnitDefs or {}

    local function deepCopy(orig)
        local copy = {}
        for k, v in pairs(orig) do
            copy[k] = type(v) == 'table' and deepCopy(v) or v
        end
        return copy
    end

    for unitName, unitDef in pairs(unitDefs) do
        local cp = unitDef.customparams
        local isT3 = cp and cp.techlevel == 3
        local isPlayer = not unitName:match('^raptor_') and not unitName:match('_scav$')

        if isT3 and isPlayer and unitDef.health then
            local evolvedName = unitName .. '_evolved'

            -- Clone the unit with boosted stats
            if not unitDefs[evolvedName] then
                local copy = deepCopy(unitDef)
                copy.health = math.ceil(copy.health * 1.25)
                copy.metalmake = (copy.metalmake or 0) + 10
                copy.energymake = (copy.energymake or 0) + 100

                -- Boost weapon damage
                if copy.weapondefs then
                    for _, weaponDef in pairs(copy.weapondefs) do
                        if weaponDef.damage then
                            for dmgType, dmgVal in pairs(weaponDef.damage) do
                                if type(dmgVal) == 'number' then
                                    weaponDef.damage[dmgType] = math.floor(dmgVal * 1.25)
                                end
                            end
                        end
                    end
                end

                -- Update name
                if copy.name then
                    copy.name = copy.name .. ' (Evolved)'
                end

                unitDefs[evolvedName] = copy
            end

            -- Set evolution on original T3 unit
            unitDef.customparams = unitDef.customparams or {}
            unitDef.customparams.evolution_target = evolvedName
            unitDef.customparams.evolution_condition = 'timer'
            unitDef.customparams.evolution_timer = 600
            unitDef.customparams.evolution_health_transfer = 'flat'
        end
    end
end
