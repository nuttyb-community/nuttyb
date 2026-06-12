-- $HP_MULTIPLIER$X.QHP
-- NuttyB v1.52 $HP_MULTIPLIER$X QHP
-- https://github.com/nuttyb-community/nuttyb

for unitName, unitDef in pairs(UnitDefs) do
    if unitName:match('^raptor_queen_.*') then
        unitDef.repairable = 0
        unitDef.canbehealed = 0
        unitDef.buildtime = 9999999
        unitDef.autoheal = 2
        unitDef.canSelfRepair = 0
        unitDef.health = unitDef.health * $HP_MULTIPLIER$
    end
end
