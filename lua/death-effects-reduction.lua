-- DeathEffectsReduction
-- Hides death and crash particles; explosion damage and wrecks stay the same.
-- https://github.com/nuttyb-community/nuttyb

do
    local unitDefs = UnitDefs or {}

    local function copy(source)
        local result = {}
        for key, value in pairs(source) do
            result[key] = type(value) == 'table' and copy(value) or value
        end
        return result
    end

    -- Shared death explosions (explodeas = 'fusionExplosion' and the like)
    -- live in weapons/*.lua, not in the unit's own weapondefs
    local explosions = {}
    if VFS and VFS.DirList and VFS.Include then
        local ok, system = pcall(VFS.Include, 'gamedata/system.lua')
        if ok and type(system) == 'table' then
            local shared = {}
            for _, path in ipairs(VFS.DirList('weapons/', '*.lua', nil, true)) do
                local env = {
                    Shared = shared,
                    BAR = BAR,
                    GetFilename = function()
                        return path
                    end,
                }
                env._G = env
                setmetatable(env, { __index = system })
                local loaded, weapons = pcall(VFS.Include, path, env)
                if loaded and type(weapons) == 'table' then
                    for name, weaponDef in pairs(weapons) do
                        if type(name) == 'string' and type(weaponDef) == 'table' then
                            explosions[string.lower(name)] = weaponDef
                        end
                    end
                end
            end
        end
    end

    for _, unitDef in pairs(unitDefs) do
        -- Debris and crash particles
        unitDef.sfxtypes = unitDef.sfxtypes or {}
        for _, key in ipairs({
            'pieceexplosiongenerators',
            'crashexplosiongenerators',
        }) do
            local generators = unitDef.sfxtypes[key] or {}
            for i in pairs(generators) do
                generators[i] = 'blank'
            end
            if not next(generators) then
                generators[1] = 'blank'
            end
            unitDef.sfxtypes[key] = generators
        end

        -- Death explosions: a silent copy keeps the damage and area
        unitDef.weapondefs = unitDef.weapondefs or {}
        for _, key in ipairs({ 'explodeas', 'selfdestructas' }) do
            local name = unitDef[key]
            if type(name) == 'string' and name ~= '' then
                local base = unitDef.weapondefs[string.lower(name)]
                    or explosions[string.lower(name)]
                if base then
                    local silent = copy(base)
                    silent.explosiongenerator = 'custom:blank'
                    silent.cegtag = ''
                    silent.camerashake = 0
                    local alias = 'nuttyb_quiet_' .. key
                    unitDef.weapondefs[alias] = silent
                    unitDef[key] = alias
                end
            end
        end
    end
end
