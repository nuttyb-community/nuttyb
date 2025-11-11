--NuttyB v1.52 5X QHP
-- bar-nuttyb-collective.github.io/configurator
for b, c in pairs(UnitDefs) do
	if b:match('^raptor_queen_.*') then
		c.repairable = 0
		c.canbehealed = 0
		c.buildtime = 9999999
		c.autoheal = 2
		c.canSelfRepair = 0
		c.health = c.health * 5
	end
end
