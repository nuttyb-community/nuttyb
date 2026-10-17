-- MilitaryUnitTiers
-- Keeps only military units of the enabled tech levels in factory and commander build menus.
-- https://github.com/nuttyb-community/nuttyb

do
    local unitDefs = UnitDefs or {}
    -- Lowest enabled tech level: 2 = T2-T3, 3 = T3 only, 4 = none
    local minTier = $MIN_TIER$

    local factions = { arm = true, cor = true, leg = true }
    -- Not military, even though they aren't builders
    local exempt = { armsat = true, corsat = true }

    -- Hover, amphibious and seaplane factories and units are tech level 1.5
    -- and count as T1; tech level 4 units count as T3
    local function tierOf(unitDef)
        return math.floor(
            tonumber((unitDef.customparams or {}).techlevel) or 1
        )
    end

    local function isMilitary(unitName)
        local unitDef = unitDefs[unitName]
        if not unitDef or exempt[unitName] then
            return false
        end

        local mobile = (tonumber(unitDef.speed or unitDef.maxvelocity) or 0)
                > 0
            or unitDef.canfly == true
        local support = unitDef.builder == true
            or (tonumber(unitDef.workertime) or 0) > 0
            or unitDef.canresurrect == true
            or (tonumber(unitDef.transportcapacity) or 0) > 0
        return mobile and not support
    end

    -- Rebuilds the list without the restricted options. table.maxn also
    -- reaches entries a tweakunits placed after a gap.
    local function removeOptions(unitDef, isRestricted)
        local kept = {}
        for i = 1, table.maxn(unitDef.buildoptions) do
            local option = unitDef.buildoptions[i]
            if option and not isRestricted(option) then
                kept[#kept + 1] = option
            end
        end
        unitDef.buildoptions = kept
    end

    for unitName, unitDef in pairs(unitDefs) do
        if unitDef.buildoptions and factions[unitName:sub(1, 3)] then
            local subfolder = (unitDef.customparams or {}).subfolder or ''
            if
                subfolder:find('Factories', 1, true)
                or subfolder:find('Labs', 1, true)
            then
                -- A factory's own tier decides for everything it builds
                if tierOf(unitDef) < minTier then
                    removeOptions(unitDef, isMilitary)
                end
            elseif unitName:sub(4, 6) == 'com' then
                -- Commanders: each unit's own tier decides
                removeOptions(unitDef, function(option)
                    return isMilitary(option)
                        and tierOf(unitDefs[option]) < minTier
                end)
            end
        end
    end
end
