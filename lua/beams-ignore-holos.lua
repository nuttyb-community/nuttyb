-- BeamsIgnoreHolos
-- Beams pass through fresh nanoframes instead of destroying them
-- Authors: Insider
-- https://github.com/nuttyb-community/nuttyb

do
    -- BAR's nanoframe gadget marks holos under 5% build progress as neutral and
    -- leaves them ray-collidable, so collidefriendly doesn't protect them from beams.
    for _, def in pairs(UnitDefs or {}) do
        for _, weaponDef in pairs(def.weapondefs or {}) do
            local weaponType = weaponDef.weapontype
            if weaponType == 'BeamLaser' or weaponType == 'LightningCannon' then
                weaponDef.collideneutral = false
            end
        end
    end
end
