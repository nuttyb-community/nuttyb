-- T1 Unit Buffs: 1.5x HP, 2x Damage
-- https://github.com/nuttyb-community/nuttyb

for unitName, unitDef in pairs(UnitDefs) do
    if unitDef.customparams and unitDef.customparams.techlevel == 1 then
        unitDef.health = math.ceil(unitDef.health * 1.5)
        if unitDef.weapondefs then
            for _, weaponDef in pairs(unitDef.weapondefs) do
                if weaponDef.damage then
                    for dmgType, dmgVal in pairs(weaponDef.damage) do
                        if type(dmgVal) == 'number' then
                            weaponDef.damage[dmgType] = math.floor(dmgVal * 2)
                        end
                    end
                end
            end
        end
    end
end
