--Faction Drones
-- docs.google.com/spreadsheets/d/1QSVsuAAMhBrhiZdTihVfSCwPzbbZWDLCtXWP23CU0ko
local unitDefs = UnitDefs or {}
local armassistdrone = 'armassistdrone'
local corassistdrone = 'corassistdrone'
local legassistdrone = 'legassistdrone'
local corsat = 'corsat'

unitDefs[armassistdrone].energycost = 2000
unitDefs[armassistdrone].metalcost = 100
unitDefs[corassistdrone].energycost = 2000
unitDefs[corassistdrone].metalcost = 100
unitDefs[legassistdrone].energycost = 2000
unitDefs[legassistdrone].metalcost = 100

unitDefs[corsat].sightdistance = 3100
unitDefs[corsat].radardistance = 4080
unitDefs[corsat].cruisealtitude = 3300
unitDefs[corsat].energyupkeep = 1250

local builderNames = {
    'armapt3',
    'corapt3',
    'legapt3',
    'armshltx',
    'corgant',
    'leggant',
    'armshltxuw',
    'corgantuw',
    'leggantuw',
}

for i = 1, #builderNames do
    local builderName = builderNames[i]
    local nBuildOptions = #unitDefs[builderName].buildoptions
    unitDefs[builderName].buildoptions[nBuildOptions + 1] = armassistdrone
    unitDefs[builderName].buildoptions[nBuildOptions + 2] = corassistdrone
    unitDefs[builderName].buildoptions[nBuildOptions + 3] = legassistdrone
    unitDefs[builderName].buildoptions[nBuildOptions + 4] = corsat
end
