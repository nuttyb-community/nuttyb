--Slow playable raptors/scav
-- nuttyb-community.github.io/nuttyb/configurator
local unitDefs = UnitDefs or {}
for unitName, unitDef in pairs(unitDefs) do
    if
        unitDef.speed and (unitName:find('raptor') or unitName:find('_scav'))
    then
        unitDef.speed = unitDef.speed * 0.5
    end
end
