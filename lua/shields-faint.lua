-- FaintShields
-- Fainter shield bubbles and no deflection flashes, so stacked shields don't hide the battle.
-- https://github.com/nuttyb-community/nuttyb

do
    local unitDefs = UnitDefs or {}

    -- BAR draws each bubble with a base opacity times
    -- customparams.shield_color_mult (T2 gates 0.8, Elysium 25), so higher
    -- tiers are scaled down harder. The weapondef's shield.alpha does nothing:
    -- the engine only uses it when shield.visible is set, and BAR doesn't.
    local colorScaleByTier = { 0.5, 0.5, 0.1, 0.1 }

    for _, unitDef in pairs(unitDefs) do
        local customparams = unitDef.customparams
        if customparams and customparams.shield_radius then
            local tier = math.floor(tonumber(customparams.techlevel) or 1)
            tier = math.min(math.max(tier, 1), #colorScaleByTier)
            customparams.shield_color_mult = (
                tonumber(customparams.shield_color_mult) or 1
            ) * colorScaleByTier[tier]
        end

        for _, weaponDef in pairs(unitDef.weapondefs or {}) do
            if weaponDef.shield then
                weaponDef.shield.visiblerepulse = false
            end
        end
    end
end
