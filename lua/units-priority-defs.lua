-- Units Priority - Mobile Buffs & Anti-Turret Raptor Squads
-- https://github.com/nuttyb-community/nuttyb

do
    local unitDefs, tableMerge, pairs, spring =
        UnitDefs or {}, table.merge, pairs, Spring

    local isRaptors = spring.Utilities.Gametype.IsRaptors()
    local mode_prefix = isRaptors and 'raptor' or 'scav'

    -- A. Damage nerfs for specific turrets (0.87x)
    local damageNerfTargets = {
        armhlt = true,
        corhlt = true,
        legrwall = true,
        cormwall = true,
        cortron = true,
    }

    for unitName, _ in pairs(damageNerfTargets) do
        local def = unitDefs[unitName]
        if def and def.weapondefs then
            for _, weaponDef in pairs(def.weapondefs) do
                if weaponDef.damage then
                    for dmgType, dmgVal in pairs(weaponDef.damage) do
                        if type(dmgVal) == 'number' then
                            weaponDef.damage[dmgType] =
                                math.floor(dmgVal * 0.87)
                        end
                    end
                end
            end
        end
    end

    -- B. Mobile unit buffs: 15% cost reduction, 10% speed buff
    for unitName, def in pairs(unitDefs) do
        if
            def.speed
            and def.speed > 0
            and def.weapondefs
            and not def.builder
            and not unitName:match('^raptor_')
            and not unitName:match('_scav$')
        then
            -- 15% cost reduction
            if def.metalcost then
                def.metalcost = math.floor(def.metalcost * 0.85)
            end
            if def.energycost then
                def.energycost = math.floor(def.energycost * 0.85)
            end

            -- 10% speed buff (not on commanders)
            if not unitName:match('com') then
                def.speed = def.speed * 1.10
            end
        end
    end

    -- C. Helper: deep copy
    local function deepCopy(orig)
        local copy = {}
        for k, v in pairs(orig) do
            copy[k] = type(v) == 'table' and deepCopy(v) or v
        end
        return copy
    end

    -- C. Helper: clone unit
    local function cloneUnit(baseName, newName, overrides)
        if unitDefs[baseName] and not unitDefs[newName] then
            local copy = deepCopy(unitDefs[baseName])
            unitDefs[newName] = tableMerge(copy, overrides or {})
        end
    end

    -- C. Helper: pve squad customparams
    local function pveSquad(minAnger, maxAnger, behavior, amount, weight)
        return {
            [mode_prefix .. 'customsquad'] = true,
            [mode_prefix .. 'squadunitsamount'] = amount or 1,
            [mode_prefix .. 'squadminanger'] = minAnger,
            [mode_prefix .. 'squadmaxanger'] = maxAnger,
            [mode_prefix .. 'squadweight'] = weight or 5,
            [mode_prefix .. 'squadrarity'] = 'basic',
            [mode_prefix .. 'squadbehavior'] = behavior,
            [mode_prefix .. 'squadbehaviordistance'] = 500,
            [mode_prefix .. 'squadbehaviorchance'] = 0.75,
        }
    end

    -- D. Anti-turret raptor squads

    -- raptor_acid_siege: artillery lobber that outranges most turrets
    cloneUnit('raptorartillery', 'raptor_acid_siege', {
        name = 'Acid Siege Raptor',
        health = 10000,
        speed = 38,
        customparams = {
            i18n_en_humanname = 'Acid Siege Raptor',
            i18n_en_tooltip = 'Long-range acid artillery raptor bred to destroy static defenses.',
            subfolder = 'other/raptors',
        },
    })

    -- raptor_siege_lobber: heavy T4 artillery
    cloneUnit('raptor_allterrain_arty_basic_t4_v1', 'raptor_siege_lobber', {
        name = 'Siege Lobber',
        health = 18000,
        speed = 30,
        customparams = {
            i18n_en_humanname = 'Siege Lobber',
            i18n_en_tooltip = 'Massive siege beast that lobs devastating projectiles at fortifications.',
            subfolder = 'other/raptors',
        },
    })

    -- raptor_wallbreaker: melee T4 assault that targets buildings
    cloneUnit('raptor_land_assault_basic_t4_v1', 'raptor_wallbreaker', {
        name = 'Wallbreaker',
        health = 28000,
        speed = 45,
        customparams = {
            i18n_en_humanname = 'Wallbreaker',
            i18n_en_tooltip = 'Berserker raptor that charges and smashes through defensive lines.',
            subfolder = 'other/raptors',
        },
    })

    -- E. UnitDef_Post: apply squad params and wallbreaker nochasecategory override
    local oldUnitDef_Post = UnitDef_Post
    function UnitDef_Post(unitID, unitDef)
        if oldUnitDef_Post and oldUnitDef_Post ~= UnitDef_Post then
            oldUnitDef_Post(unitID, unitDef)
        end

        local squadOverrides = {
            raptor_acid_siege = {
                maxthisunit = 15,
                customparams = pveSquad(35, 70, 'artillery', 15),
            },
            raptor_siege_lobber = {
                maxthisunit = 8,
                customparams = pveSquad(40, 80, 'artillery', 8),
            },
            raptor_wallbreaker = {
                maxthisunit = 12,
                nochasecategory = '',
                customparams = pveSquad(50, 80, 'berserk', 12),
            },
        }

        -- Increase weapon range for siege units
        local rangeOverrides = {
            raptor_acid_siege = 1800,
            raptor_siege_lobber = 2500,
        }

        for name, overrides in pairs(squadOverrides) do
            local def = UnitDefs[name]
            if def then
                for k, v in pairs(overrides) do
                    if k == 'customparams' then
                        def.customparams = def.customparams or {}
                        for ck, cv in pairs(v) do
                            def.customparams[ck] = cv
                        end
                    else
                        def[k] = v
                    end
                end
            end
        end

        for name, range in pairs(rangeOverrides) do
            local def = UnitDefs[name]
            if def and def.weapondefs then
                for _, weaponDef in pairs(def.weapondefs) do
                    weaponDef.range = range
                end
            end
        end

        -- Wallbreaker: explicitly clear nochasecategory so it targets buildings
        if UnitDefs['raptor_wallbreaker'] then
            UnitDefs['raptor_wallbreaker'].nochasecategory = ''
        end
    end
end
