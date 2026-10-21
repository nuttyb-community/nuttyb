-- EvoEco
-- Evolving Eco (Fusion Reactors & Energy Converters upgradeable up to TTPL_MAX_TIER)
-- Authors: timuela, Insider
-- https://github.com/timuela/BAR-widgets/blob/main/tweaks/evo_eco-yardmaps.lua

do
    local unitDefs, tableMerge, mergeInPlace, maxTier =
        UnitDefs or {}, table.merge, table.mergeInPlace, TPL_MAX_TIER

    local function round(value)
        return math.floor(value + 0.5)
    end

    local function ensureBuildOption(builderName, optionName)
        local builder = unitDefs[builderName]
        if not builder or not unitDefs[optionName] then
            return
        end

        builder.buildoptions = builder.buildoptions or {}
        for i = 1, #builder.buildoptions do
            if builder.buildoptions[i] == optionName then
                return
            end
        end

        builder.buildoptions[#builder.buildoptions + 1] = optionName
    end

    -- Stackable yardmap: lower tiers' cells are 's' (built over the building
    -- underneath), this tier's are 'o' and higher tiers' are 'c' (yard, left
    -- for the upgrade). BAR's Geo Upgrade Reclaimer gadget then removes the
    -- building underneath, without an explosion, and refunds its metal.
    -- The gadget opens a geothermal building's yard when it finishes, so its
    -- 'c' squares are held only while it is a frame: an upgrade fits on a
    -- finished building, but nothing fits on a frame. The engine only tests
    -- the oldest building in each square, so 'b' or 'y' squares would let a
    -- second builder start another frame over an upgrade in progress.
    -- Each cell's tier is read from the top-left quadrant, rotated into place,
    -- so the map looks the same whichever way the building faces. High-res
    -- (one cell per square) so every tier gets an 'o' cell: without one, a
    -- building could be built over its own tier.
    local function yardmap(footprint, tier, tiers)
        local size = footprint * 2
        local cells, half = {}, size / 2
        for i = 0, size * size - 1 do
            local r, c = math.floor(i / size), i % size
            while r >= half or c >= half do
                r, c = c, size - 1 - r
            end
            local cellTier = tiers[r * half + c]
            cells[i + 1] = cellTier < tier and 's'
                or cellTier == tier and 'o'
                or 'c'
        end
        return 'h' .. table.concat(cells)
    end

    -- Buildings sit on a 2-square grid, so they cover whole 2x2 blocks of
    -- squares. Every block has a lowest-tier cell, which every finished tier
    -- holds, and a highest-tier cell, which no tier stacks: no other building
    -- fits on a finished one or under a new one. Quadrant blocks put the
    -- highest tier in their top row (fusions) or right column (converters),
    -- rotated in the other quadrants, so an off-center or cross-family
    -- building always lines up a highest-tier cell on a lowest-tier one.
    -- The blocks next to the center swap their other two cells for the
    -- tiers in between.
    local function quadrantTiers(half, firstTier, byColumn)
        local tiers, between, blocks = {}, firstTier + 1, half / 2
        for block = blocks * blocks - 1, 0, -1 do
            local blockR, blockC = math.floor(block / blocks), block % blocks
            for cell = 0, 3 do
                local r, c = math.floor(cell / 2), cell % 2
                local highest, spare = r == 0, c == 1
                if byColumn then
                    highest, spare = c == 1, r == 1
                end
                local tier = highest and maxTier or firstTier
                if spare and between < maxTier then
                    tier, between = between, between + 1
                end
                tiers[(blockR * 2 + r) * half + blockC * 2 + c] = tier
            end
        end
        return tiers
    end
    local fusionTiers, converterTiers =
        quadrantTiers(12, 1, false), quadrantTiers(6, 2, true)

    -- unit name = techlevel: 3 for fusions, 4 for converters
    local evolved = {}

    -- chain[tier] = unit name; T1-T3 exist, T4+ are cloned from T3
    local function evolve(chain, firstTier, size, tiers, techlevel, title, describe)
        local t3 = unitDefs[chain[3]]
        if not t3 then
            return
        end

        local capacity = t3.customparams
            and tonumber(t3.customparams.energyconv_capacity)
        for tier = 4, maxTier do
            local output, cost = 1.5 ^ (tier - 3), 1.8 ^ (tier - 3)
            chain[tier] = (chain[3]:gsub('t3$', 't' .. tier))
            unitDefs[chain[tier]] = tableMerge(t3, {
                metalcost = math.ceil(t3.metalcost * cost),
                energycost = math.ceil(t3.energycost * cost),
                energymake = t3.energymake
                    and math.ceil(t3.energymake * output),
                energystorage = t3.energystorage
                    and math.ceil(t3.energystorage * output),
                -- Non-explosive: die like a generic building
                explodeas = 'largeBuildingexplosiongeneric',
                selfdestructas = 'largeBuildingExplosionGenericSelfd',
                customparams = {
                    energyconv_capacity = capacity
                        and math.ceil(capacity * output),
                },
            })
        end

        for tier = firstTier, maxTier do
            local def = unitDefs[chain[tier]]
            if def then
                local humanName = ('T%d %s'):format(tier, title)
                def.name = humanName
                evolved[chain[tier]] = techlevel
                mergeInPlace(def, {
                    footprintx = size,
                    footprintz = size,
                    yardmap = yardmap(size, tier, tiers),
                    customparams = {
                        geothermal = 1,
                        -- BAR's Quick Build (mex/geo) widget treats every
                        -- geothermal unit as a geo plant. It never offers a
                        -- lower techlevel building over a higher one, nor
                        -- a weaker standard one: fusions (3) only get
                        -- offered stronger fusions, converters (4) nothing.
                        techlevel = techlevel,
                        standardextractor = true,
                        i18n_en_humanname = humanName,
                        i18n_en_tooltip = describe(def)
                            .. (tier < 4 and ' (explosive)' or ' (non-explosive)')
                            .. (tier < maxTier and '. Build a higher tier on top to upgrade' or ''),
                    },
                })
            end
        end
    end

    local builders = {
        arm = { 'armack', 'armaca', 'armacv', 'armacsub', 'armt3airaide', 'armt3aide' },
        cor = { 'corack', 'coraca', 'coracv', 'coracsub', 'cort3airaide', 'cort3aide' },
        leg = { 'legack', 'legaca', 'legacv', 'legcomt2com', 'legt3airaide', 'legt3aide' },
    }

    for faction, factionBuilders in pairs(builders) do
        local fusionChain =
            { faction .. 'fus', faction .. 'afus', faction .. 'afust3' }
        local t3Fusion = unitDefs[fusionChain[3]]

        -- T1/T2 fusions take the T3 model and icon. Wrecks take T3's models
        -- but keep their own metal and health.
        if t3Fusion then
            for tier = 1, 2 do
                local def = unitDefs[fusionChain[tier]]
                if def then
                    local ownWrecks = {}
                    for name, wreck in pairs(def.featuredefs or {}) do
                        ownWrecks[name] =
                            { metal = wreck.metal, damage = wreck.damage }
                    end
                    mergeInPlace(def, {
                        objectname = t3Fusion.objectname,
                        script = t3Fusion.script,
                        buildpic = t3Fusion.buildpic,
                        collisionvolumeoffsets = t3Fusion.collisionvolumeoffsets,
                        collisionvolumescales = t3Fusion.collisionvolumescales,
                        collisionvolumetype = t3Fusion.collisionvolumetype,
                        featuredefs = tableMerge(
                            t3Fusion.featuredefs or {},
                            ownWrecks
                        ),
                    })
                end
            end
        end

        local converterBase = faction == 'leg' and 'legadveconv'
            or faction .. 'mmkr'

        local converterChain = { nil, converterBase, converterBase .. 't3' }

        evolve(fusionChain, 1, 12, fusionTiers, 3, 'Fusion Reactor', function(def)
            return ('Produces %d Energy'):format(def.energymake or 0)
        end)
        evolve(
            converterChain,
            2,
            6,
            converterTiers,
            4,
            'Energy Converter',
            function(def)
                local capacity = tonumber(def.customparams.energyconv_capacity)
                    or 0
                local efficiency = tonumber(
                    def.customparams.energyconv_efficiency
                ) or 0
                return ('Converts %d energy into %d metal per sec'):format(
                    capacity,
                    round(capacity * efficiency)
                )
            end
        )

        for _, builderName in ipairs(factionBuilders) do
            for tier = 3, maxTier do
                ensureBuildOption(builderName, fusionChain[tier])
                ensureBuildOption(builderName, converterChain[tier])
            end
        end
    end

    -- The widget offers each builder's first geothermal build option. Put a
    -- real geo plant there, or else a fusion, never a converter: geo vents
    -- then still get geo plants, and no builder offers a converter (4) over
    -- a fusion (3).
    for _, def in pairs(unitDefs) do
        local options, firstGeo, preferred, fusion = def.buildoptions, nil, nil, nil
        for i = 1, options and #options or 0 do
            local option = unitDefs[options[i]]
            local kind = evolved[options[i]]
            if kind or option and option.customparams and option.customparams.geothermal then
                firstGeo = firstGeo or i
                if not kind then
                    preferred = preferred or i
                elseif kind == 3 then
                    fusion = fusion or i
                end
            end
        end
        preferred = preferred or fusion
        if preferred and preferred > firstGeo then
            options[firstGeo], options[preferred] =
                options[preferred], options[firstGeo]
        end
    end
end
