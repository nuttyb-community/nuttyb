-- Raptor Build 1.1 Skrip
-- Constructors can be built from the t1 factories
-- Toggle to allow commanders to build raptor buildings.
local includeCommanders = false

local unitDefs = UnitDefs or {}
-- Maps faction prefix to their builder units
local factionBuilders = {
    arm = { 'armaca', 'armack', 'armacv', 'armcom' },
    cor = { 'coraca', 'corack', 'coracv', 'corcom' },
    leg = { 'legaca', 'legack', 'legacv', 'legcom' },
}

-- Adds a building to the buildoptions of each builder in the faction
local function addBuildingToFaction(buildingID, factionKey, category)
    local targetFactions = {}

    if factionKey and factionBuilders[factionKey] then
        targetFactions[factionKey] = factionBuilders[factionKey]
    else
        targetFactions = factionBuilders -- all factions
    end

    for _, builders in pairs(targetFactions) do
        for _, builder in ipairs(builders) do
            local isCommander = builder:match('com$')

            -- Add to base builder
            if (includeCommanders or not isCommander) and unitDefs[builder] then
                unitDefs[builder].buildoptions = unitDefs[builder].buildoptions
                    or {}
                table.insert(unitDefs[builder].buildoptions, buildingID)
                Spring.Echo('Added ' .. buildingID .. ' to ' .. builder)
            end

            -- Add to all commander levels
            if includeCommanders and isCommander then
                for lvl = 2, 10 do
                    local levelBuilder = builder .. 'lvl' .. lvl
                    if unitDefs[levelBuilder] then
                        unitDefs[levelBuilder].buildoptions = unitDefs[levelBuilder].buildoptions
                            or {}
                        table.insert(
                            unitDefs[levelBuilder].buildoptions,
                            buildingID
                        )
                        Spring.Echo(
                            'Added ' .. buildingID .. ' to ' .. levelBuilder
                        )
                    end
                end
            end
        end
    end

    if category and unitDefs[buildingID] then
        unitDefs[buildingID].customparams = unitDefs[buildingID].customparams
            or {}
        unitDefs[buildingID].customparams.unitgroup = category
        Spring.Echo('Set unitgroup for ' .. buildingID .. ' to ' .. category)
    end
end

-- Clones an existing building and creates a new one
local function cloneUnit(sourceUnitID, newUnitID, humanName, tooltip)
    if unitDefs[sourceUnitID] and not unitDefs[newUnitID] then
        local base = table.copy(unitDefs[sourceUnitID])
        unitDefs[newUnitID] = base

        local def = unitDefs[newUnitID]
        def.unitname = newUnitID
        def.buildoptions = {}

        def.customparams = def.customparams or {}
        def.customparams.i18n_en_humanname = humanName
        def.customparams.i18n_en_tooltip = tooltip
        def.customparams.unitgroup = 'builder'

        def.buildpic = def.buildpic or 'factory.dds'

        Spring.Echo('Cloned: ' .. newUnitID .. ' from ' .. sourceUnitID)
    end
end

-- Picks highest version units given prefixes
local function selectBestUnits(prefixes, threshold, direction)
    local bestUnits = {}

    for unitName, _ in pairs(unitDefs) do
        for _, prefix in ipairs(prefixes) do
            if unitName:match('^' .. prefix) then
                local metalCost = unitDefs[unitName].metalcost
                local passesFilter = true

                if threshold and direction then
                    if direction == '>' then
                        passesFilter = metalCost > threshold
                    elseif direction == '<' then
                        passesFilter = metalCost < threshold
                    end
                end

                if passesFilter then
                    local baseName, version = unitName:match('^(.-)_v(%d+)$')

                    if baseName and version then
                        version = tonumber(version)
                        if
                            not bestUnits[baseName]
                            or version > bestUnits[baseName].version
                        then
                            bestUnits[baseName] =
                                { name = unitName, version = version }
                        end
                    else
                        if not bestUnits[unitName] then
                            bestUnits[unitName] =
                                { name = unitName, version = 0 }
                        end
                    end
                end
            end
        end
    end

    return bestUnits
end

local function selectUnits(prefixes)
    local unitList = {}

    for unitName, _ in pairs(unitDefs) do
        for _, prefix in ipairs(prefixes) do
            if unitName:match('^' .. prefix) then
                if not unitList[unitName] then
                    unitList[unitName] = { name = unitName }
                end
            end
        end
    end

    return unitList
end

-- Adds selected units to a buildings buildoptions
local function addUnitsToBuilding(buildingName, unitInput, category)
    if not unitDefs[buildingName] then
        return
    end
    unitDefs[buildingName].buildoptions = unitDefs[buildingName].buildoptions
        or {}

    if type(unitInput) == 'table' then
        for _, unitInfo in pairs(unitInput) do
            -- Check if table is {name=...} (from selectUnits), or simple list
            local unitName = unitInfo.name or unitInfo
            table.insert(unitDefs[buildingName].buildoptions, unitName)
            Spring.Echo('Added ' .. unitName .. ' to ' .. buildingName)

            -- Category assignment (optional)
            if category and unitDefs[unitName] then
                unitDefs[unitName].customparams = unitDefs[unitName].customparams
                    or {}
                unitDefs[unitName].customparams.unitgroup = category
                Spring.Echo(
                    'Set unitgroup for ' .. unitName .. ' to ' .. category
                )
            end
        end
    elseif type(unitInput) == 'string' then
        -- Single unit string
        table.insert(unitDefs[buildingName].buildoptions, unitInput)
        Spring.Echo('Added ' .. unitInput .. ' to ' .. buildingName)
    end
end

---------------------------------------------------------------
-- Correct unitdefs
---------------------------------------------------------------
if
    unitDefs['raptor_turret_basic_t4_v1']
    and unitDefs['raptor_turret_burrow_t2_v1']
then
    local def = unitDefs['raptor_turret_burrow_t2_v1']

    def.buildpic = 'raptors/raptor_turrets.DDS'
    def.metalcost = (
        unitDefs['raptor_turret_basic_t4_v1'].metalcost * 2 or 1600
    )
    def.energycost = (
        unitDefs['raptor_turret_basic_t4_v1'].energycost * 2 or 1600
    )
end

---------------------------------------------------------------
-- Raptor Gantries Setup
---------------------------------------------------------------
--, "raptor_allterrain_", "raptor_matriarch_", "raptor_queen_"
-- Create Raptor Land Gantry t1
cloneUnit(
    'legvp',
    'sk_raptorhatchery_t1',
    'Raptor Hatchery',
    'Specialized factory for land-based Raptor units'
)
local bestLandUnitsT1 = selectBestUnits({ 'raptor_land_' }, 999, '<')
addUnitsToBuilding('sk_raptorhatchery_t1', bestLandUnitsT1)
-- addBuildingToFaction("sk_raptorhatchery", nil, "builder")

-- Create Raptor Land Gantry t2
cloneUnit(
    'leggant',
    'sk_raptorhatchery_t2',
    'Giant Raptor Hatchery',
    'Specialized factory for land-based Raptor units'
)
local bestLandUnitsT2 = selectBestUnits(
    {
        'raptor_land_',
        'raptor_allterrain_',
        'raptor_matriarch_',
        'raptor_queen_',
    },
    1000,
    '>'
)
addUnitsToBuilding('sk_raptorhatchery_t2', bestLandUnitsT2)

-- Create Raptor Air Gantry
cloneUnit(
    'legaap',
    'sk_raptorairhatchery',
    'Raptor Air Hatchery',
    'Specialized factory for air-based Raptor units'
)
local bestAirUnits = selectBestUnits({ 'raptor_air_' })
addUnitsToBuilding('sk_raptorairhatchery', bestAirUnits)
-- addBuildingToFaction("sk_raptorairhatchery", nil, "builder")

-- -- Add buildings
-- addBuildingToFaction("raptor_turret_acid_t3_v1", nil, "weapon")
-- addBuildingToFaction("raptor_turret_acid_t4_v1", nil, "weapon")
-- addBuildingToFaction("raptor_turret_antiair_t3_v1", nil, "weapon")
-- addBuildingToFaction("raptor_turret_antiair_t4_v1", nil, "weapon")
-- addBuildingToFaction("raptor_turret_antinuke_t3_v1", nil, "weapon")
-- addBuildingToFaction("raptor_turret_antinuke_t4_v1", nil, "weapon")
-- addBuildingToFaction("raptor_turret_basic_t3_v1", nil, "weapon")
-- addBuildingToFaction("raptor_turret_basic_t4_v1", nil, "weapon")
-- addBuildingToFaction("raptor_turret_emp_t3_v1", nil, "weapon")
-- addBuildingToFaction("raptor_turret_emp_t4_v1", nil, "weapon")
-- addBuildingToFaction("raptor_turret_meteor_t3_v1", nil, "weapon")
-- addBuildingToFaction("raptor_turret_meteor_t4_v1", nil, "weapon")

-- Create raptor builder
cloneUnit(
    'armacv',
    'sk_raptorbuilder',
    'Raptor Construction Vehicle',
    'Builds Raptor Hatcheries'
)

if unitDefs['sk_raptorbuilder'] then
    local def = unitDefs['sk_raptorbuilder']

    -- Change model and visuals

    --def.objectname = "Raptors/raptor1d.s3o"
    -- def.script = "Raptors/raptor1d.cob"
    def.buildpic = 'raptors/raptor1d.DDS'

    -- -- Cost adjustments
    -- def.energycost = 500
    -- def.metalcost = 250
    -- def.buildtime = 8000

    -- -- Resource generation (optional)
    -- def.energymake = 10
    -- def.metalmake = 1

    -- Clean up factory stuff
    def.customparams.techlevel = 2
    def.customparams.unitgroup = 'builder'

    -- Wipe any old build options, set to only Hatcheries
    def.buildoptions = {}
    def.buildoptions = {
        'sk_raptorhatchery_t1',
        'sk_raptorhatchery_t2',
        --, "sk_raptorairhatchery"
    }
end

addUnitsToBuilding(
    'sk_raptorbuilder',
    selectBestUnits({ 'raptor_turret_' }),
    'weapon'
)

addUnitsToBuilding('armvp', 'sk_raptorbuilder')
addUnitsToBuilding('armlab', 'sk_raptorbuilder')

-- Create raptor builder
cloneUnit(
    'armaca',
    'sk_raptorairbuilder',
    'Raptor Air Construction Vehicle',
    'Builds Raptor Air Hatcheries'
)

if unitDefs['sk_raptorairbuilder'] then
    local def = unitDefs['sk_raptorairbuilder']

    -- Change model and visuals
    --def.objectname = "Raptors/raptorairscout1.s3o"
    -- def.script = "Raptors/raptorairscout.cob"
    def.buildpic = 'raptors/raptorairscout.DDS'

    -- -- Cost adjustments
    -- def.energycost = 500
    -- def.metalcost = 250
    -- def.buildtime = 8000

    -- -- Resource generation (optional)
    -- def.energymake = 10
    -- def.metalmake = 1

    -- Clean up factory stuff
    def.customparams.techlevel = 2
    def.customparams.unitgroup = 'builder'

    -- Wipe any old build options, set to only Hatcheries
    def.buildoptions = {}
    def.buildoptions = {
        --"sk_raptorhatchery"
        'sk_raptorairhatchery',
    }
end

addUnitsToBuilding(
    'sk_raptorairbuilder',
    selectBestUnits({ 'raptor_turret_' }),
    'weapon'
)

-- Add the Raptor Builder to Vehicle Factory
addUnitsToBuilding('armap', 'sk_raptorairbuilder')
addUnitsToBuilding('corvp', 'sk_raptorbuilder')
addUnitsToBuilding('corlab', 'sk_raptorbuilder')
addUnitsToBuilding('legvp', 'sk_raptorbuilder')
addUnitsToBuilding('leglab', 'sk_raptorbuilder')
addUnitsToBuilding('corap', 'sk_raptorairbuilder')
addUnitsToBuilding('legap', 'sk_raptorairbuilder')
