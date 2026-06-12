-- T3Eco
-- T3 Eco builtin v6
-- https://github.com/nuttyb-community/nuttyb

do
    local unitDefs, cons =
        UnitDefs or {}, {
            'armack',
            'armaca',
            'armacv',
            'corack',
            'coraca',
            'coracv',
            'legack',
            'legaca',
            'legacv',
        }

    local converters = { 'armmmkrt3', 'cormmkrt3', 'legadveconvt3' }
    local fusions = { 'armafust3', 'corafust3', 'legafust3' }

    for _, converterName in pairs(converters) do
        table.mergeInPlace(
            unitDefs[converterName],
            { footprintx = 6, footprintz = 6 }
        )
    end

    for _, builderName in pairs(cons) do
        local faction, nBuildOptions =
            builderName:sub(1, 3), #unitDefs[builderName].buildoptions
        unitDefs[builderName].buildoptions[nBuildOptions + 1] = faction
            .. 'afust3'
        unitDefs[builderName].buildoptions[nBuildOptions + 2] = faction == 'leg'
                and 'legadveconvt3'
            or faction .. 'mmkrt3'
    end

    do
        local builderName = 'legck'
        local nBuildOptions = #unitDefs[builderName].buildoptions
        unitDefs[builderName].buildoptions[nBuildOptions + 1] = 'legdtf'
    end

    for _, unitName in pairs({ 'coruwadves', 'legadvestore' }) do
        table.mergeInPlace(
            unitDefs[unitName],
            { footprintx = 4, footprintz = 4 }
        )
    end

    -- Recompute production tooltips from the actually assigned values so the
    -- text never goes stale when the numbers change.
    local function round(value)
        return math.floor(value + 0.5)
    end

    for _, fusionName in pairs(fusions) do
        local def = unitDefs[fusionName]
        if def and def.energymake then
            def.customparams = def.customparams or {}
            def.customparams.i18n_en_tooltip = ('Produces %d Energy (extremely explosive)'):format(
                round(def.energymake)
            )
        end
    end

    for _, converterName in pairs(converters) do
        local def = unitDefs[converterName]
        local params = def and def.customparams
        local capacity = params and tonumber(params.energyconv_capacity)
        local efficiency = params and tonumber(params.energyconv_efficiency)
        if capacity and efficiency then
            params.i18n_en_tooltip = ('Converts %d energy into %d metal per sec (extremely explosive)'):format(
                round(capacity),
                round(capacity * efficiency)
            )
        end
    end
end
