--Slow playable raptors/scav
-- bar-nuttyb-collective.github.io/configurator
local unitDefs = UnitDefs or {}
for key, value in pairs(unitDefs) do
	if key.name:find('raptor') or key.name:find('_scav') then
		value.speed = value.speed * 0.5
	end
end
