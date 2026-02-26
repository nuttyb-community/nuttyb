-- T1 Unit Buffs: 3x HP, 4x Damage (Air: 5x Damage, 5x Speed)
-- https://github.com/nuttyb-community/nuttyb

for unitName, unitDef in pairs(UnitDefs) do
    local cp = unitDef.customparams
    local isT1 = cp and (cp.techlevel == nil or cp.techlevel == 1)
    local isPlayer = not unitName:match('^raptor_') and not unitName:match('_scav$')
    if isT1 and isPlayer and unitDef.health then
        local isAir = unitDef.canfly
        local dmgMult = isAir and 5 or 4
        unitDef.health = math.ceil(unitDef.health * 3)
        if isAir and unitDef.speed then
            unitDef.speed = unitDef.speed * 5
        end
        if unitDef.weapondefs then
            for _, weaponDef in pairs(unitDef.weapondefs) do
                if weaponDef.damage then
                    for dmgType, dmgVal in pairs(weaponDef.damage) do
                        if type(dmgVal) == 'number' then
                            weaponDef.damage[dmgType] = math.floor(dmgVal * dmgMult)
                        end
                    end
                end
            end
        end
    end
end
