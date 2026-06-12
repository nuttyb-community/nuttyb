--Player Raptors [SS1]
-- Authors: SkilledSniper1, Skrip
-- docs.google.com/spreadsheets/d/1QSVsuAAMhBrhiZdTihVfSCwPzbbZWDLCtXWP23CU0ko
-- Credits to Skrip for starting the mod with Raptor Buildings v1! Check them out here: https://discord.com/channels/549281623154229250/1365417045147258971
local pairs_, ipairs_, string_, tableInsert, unitDefs =
    pairs, ipairs, string, table.insert, UnitDefs

local function setupMeta(unitName, unitDef)
    local customparams = unitDef.customparams or {}
    local aName = unitName
    local _, _, v = string_.find(unitName, '_v(%d+)')
    if v then
        v = tonumber(v) or 0
    end
    aName = aName:gsub('_v(%d+)', '') --actual_name
    local _, _, tierData = string_.find(unitName, '_t(%d+)')
    if tierData then
        tierData = tonumber(tierData)
    end
    local gName = aName:gsub('_t(%d+)', '') --general_name
    local isR = string_.find(unitName, '_queen')
        or string_.find(unitName, '_matriarch')
        or unitName == 'raptorh5'
    if isR then
        tierData = 5
    end
    if tierData then
        customparams.techlevel = tierData
    end
    local isT
    if unitDef.yardmap or unitDef.speed == 0.0 then
        isT = unitDef.yardmap or ''
    end
    if isT then
        customparams.unitgroup = 'weapon'
    end
    local isH = string_.find(unitName, '_heal') or unitName == 'raptorh5'
    if isH then
        customparams.unitgroup = 'builder'
    end
    customparams.raptorbuildmeta = {
        aName = aName,
        gName = gName,
        v = v,
        isRoyal = isR,
        isT = isT,
        isH = isH,
    }
    unitDef.customparams = customparams
    return true
end

local function clone(unitName, newName, newDef)
    unitDefs[newName] = newDef
    newDef.unitname = newName
    newDef.icontype = unitName
    newDef.maxthisunit = nil
    newDef.buildoptions = {}
    local custom = newDef.customparams or {}
    custom.i18nfromunit = unitName
    custom.subfolder = 'other/raptors'
    newDef.customparams = custom
    return custom
end

local ref = {}
for unitName, unitDef in pairs_(unitDefs) do
    if
        (unitDef.category == 'RAPTOR')
        and not string_.find(unitName, 'custraptorunit')
    then
        setupMeta(unitName, unitDef)
        ref[unitName] = unitDef
    end
end

local pref = { 'Juvenile', 'Common', 'Mature', 'Apex', 'Royal' }
local function fyn(t, n)
    return 'custchickenunit_t' .. t .. n
end

local function cpLab(name, list)
    local o
    for t, unitName in ipairs_(list) do
        local pre = pref[t]
        local n = fyn(t, '_' .. string_.lower(name))
        local u = table.copy(unitDefs[unitName])
        local c = clone(unitName, n, u)
        u.icontype = 'raptor_hive'
        c.i18nfromunit = nil
        c.i18n_en_humanname = pre .. ' Raptor ' .. name
        c.i18n_en_tooltip = 'Produces ' .. pre .. ' Raptors (T' .. t .. ')'
        c.normalmaps = true
        c.normaltex = 'unittextures/chicken_l_normals.png'
        c.areadamageresistance = '_RAPTORACID_'
        local b = {
            aName = n,
            gName = n:gsub('_t(%d+)', ''),
            v = 1,
            isRoyal = t == 5,
            isT = true,
            isH = true,
        }
        c.raptorbuildmeta = b
        o = u
    end
    return o
end
local fmt =
    cpLab('Hatchery', { 'leglab', 'leghp', 'legalab', 'leggant', 'leggant' })
fmt.energycost = fmt.energycost * 5
fmt.metalcost = fmt.metalcost * 5
fmt.buildtime = fmt.buildtime * 5
fmt.health = fmt.health * 2.5
cpLab('Nest', { 'legap', 'legaap', 'legaap', 'legapt3' })

local everything, flying, healer = {}, {}, {}
for uName0, uDef0 in pairs_(ref) do
    local uName, uDef =
        uName0:gsub('raptor', 'custraptorunit'), table.copy(uDef0)
    local c = clone(uName0, uName, uDef)
    local t, m = c.techlevel or 0, c.raptorbuildmeta
    m.uName = uName
    local itr, bo = m.isT, m.isH
    if bo and pref[t] then
        uDef.canreclaim = 1
        uDef.reclaimspeed = uDef.workertime
        if t == 5 and string_.find(uName, '_matriarch') then
            bo, m.isH = nil, nil
        else
            c.i18nfromunit, c.i18n_en_humanname, c.i18n_en_tooltip =
                nil,
                pref[t] .. ' Constructor Raptor',
                'Tech ' .. t .. ' Constructor'
        end
    end
    local q
    if uDef.canfly then
        flying[t] = flying[t] or {}
        q = flying[t]
    else
        everything[t] = everything[t] or {}
        q = everything[t]
    end
    local i = q[m.gName]
    if (not i or (i.v or 0) < (m.v or 0)) and not (bo and itr) then
        q[m.gName] = m
        if bo and not itr then
            healer[m.aName] = uDef
        end
    end
    if itr then
        uDef.maxSlope = uDef.maxSlope or 255
    end
    local qind = string_.find(uName, '_queen')
    if qind then
        local d = string_.sub(uName, qind + 7):gsub('very', 'very ')
        c.i18nfromunit = nil
        c.i18n_en_humanname = '[' .. d .. '] Raptor Queen'
        c.i18n_en_tooltip = 'The Mother of ALL '
            .. string_.upper(d)
            .. ' RAPTORS!'
    end
    if type(uDef.weapondefs) == 'table' then
        for wn, wd in pairs_(uDef.weapondefs) do
            if string_.find(uName, '_air_bomber_basic') then
                wd.reloadtime = 6
            end
            if wn == 'spawnmeteor' then
                wd.damage = { default = 1 }
            end
            if
                type(wd.explosiongenerator) == 'string'
                and string_.find(
                    wd.explosiongenerator,
                    'acid-explosion',
                    1,
                    true
                )
            then
                local s, wdc = 1.5, wd.customparams
                if not wdc then
                    wdc = {}
                    wd.customparams = wdc
                end
                if string_.find(wd.explosiongenerator, 'small') then
                    s = 1
                end
                if string_.find(wd.explosiongenerator, 'xl') then
                    s = 2
                end
                if wdc.area_onhit_damageCeg then
                    wdc.area_onhit_damageceg = wdc.area_onhit_damageCeg
                end
                if not wdc.area_onhit_damageceg then
                    wdc.area_onhit_damageceg = 'acid-damage-gen'
                end
                if not wdc.area_onhit_ceg then
                    wdc.area_onhit_ceg = 'acid-area-' .. (s * 75) .. '-repeat'
                end
                if not wdc.area_onhit_time then
                    wdc.area_onhit_time = 10
                end
                if not wdc.area_onhit_damage then
                    wdc.area_onhit_damage = 20 * (t + 1)
                end
                if not wdc.area_onhit_range then
                    wdc.area_onhit_range = s * 75
                end
                if not wdc.area_onhit_resistance then
                    wdc.area_onhit_resistance = '_RAPTORACID_'
                end
            end
        end
    end
end

-- all turrets
local af, atr = {}, {}
for t, _ in ipairs_(pref) do
    local tierHealer, tierFlyers, tierEverything = {}, {}, {}
    for gName, m in pairs_(everything[t]) do
        if not m.isT then
            tierHealer[m.uName] = healer[m.aName]
            tableInsert(tierEverything, m.uName)
        else
            atr[gName] = m.uName
        end
    end
    if t == 5 then
        for gName, m in pairs_(everything[0] or {}) do
            if not m.isT then
                tierHealer[m.uName] = healer[m.aName]
                tableInsert(tierEverything, m.uName)
            else
                atr[gName] = m.uName
            end
        end
    end
    for gName, m in pairs_(flying[t] or {}) do
        tierHealer[m.uName] = healer[m.aName]
        af[gName] = m.uName
    end
    if t == 4 then
        for gName, m in pairs_(flying[0] or {}) do
            tierHealer[m.uName] = healer[m.aName]
            af[gName] = m.uName
        end
    end
    for _, uName in pairs_(af) do
        tableInsert(tierFlyers, uName)
    end
    local lfy, afy = fyn(t, '_hatchery'), fyn(t, '_nest')
    local lfyDef, afyDef = unitDefs[lfy], unitDefs[afy] or {}
    lfyDef.buildoptions, afyDef.buildoptions = tierEverything, tierFlyers
    local thb, nPre = { lfy, afy }, pref[t + 1]
    if t == 1 then
        for _, fy in ipairs_(thb) do
            for _, cm in ipairs_({ 'armcom', 'corcom', 'legcom' }) do
                tableInsert(((unitDefs[cm] or {}).buildoptions or {}), fy)
                for lvl = 2, 10 do
                    tableInsert(
                        (
                            (unitDefs[cm .. 'lvl' .. lvl] or {}).buildoptions
                            or {}
                        ),
                        fy
                    )
                end
            end
        end
    elseif t == 5 then
        tableInsert(thb, fyn(t - 1, '_hatchery'))
        tableInsert(thb, fyn(t - 1, '_nest'))
    end
    if nPre then
        tableInsert(thb, fyn(t + 1, '_hatchery'))
    end
    for _, uName in pairs_(atr) do
        tableInsert(thb, uName)
    end
    for _, uDef in pairs_(tierHealer) do
        uDef.buildoptions = thb
    end
end
