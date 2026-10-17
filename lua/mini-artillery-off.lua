-- NoMiniArtillery
-- Removes the Mini Ragnarok, Mini Calamity and Mini Starfall from the game.
-- https://github.com/nuttyb-community/nuttyb

do
    local unitDefs = UnitDefs or {}
    local disabled = {
        armminivulc = true,
        corminibuzz = true,
        legministarfall = true,
    }

    for unitName in pairs(disabled) do
        if unitDefs[unitName] then
            unitDefs[unitName].maxthisunit = 0
        end
    end

    for _, unitDef in pairs(unitDefs) do
        local buildoptions = unitDef.buildoptions
        if buildoptions then
            for i = #buildoptions, 1, -1 do
                if disabled[buildoptions[i]] then
                    table.remove(buildoptions, i)
                end
            end
        end
    end
end
