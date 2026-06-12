--WIP T3 builder v2
-- Authors: TetrisCo
-- docs.google.com/spreadsheets/d/1QSVsuAAMhBrhiZdTihVfSCwPzbbZWDLCtXWP23CU0ko
local unitDefs, unitDefName, factions, apt3 =
    UnitDefs or {}, 't3con', { 'arm', 'cor', 'leg' }, 'apt3'
for _, faction in pairs(factions) do
    unitDefs[faction .. unitDefName] = table.merge(unitDefs['armaca'], {
        blocking = false,
        builddistance = 500,
        buildpic = 'ARMDRONECARRY.DDS',
        buildtime = 140000,
        cruisealtitude = 130,
        energycost = 320000,
        energyupkeep = 2000,
        health = 3000,
        hoverattack = true,
        idleautoheal = 5,
        idletime = 1800,
        maxthisunit = 2,
        metalcost = 20000,
        objectname = 'Units/ARMDRONECARRY.s3o',
        script = 'Units/ARMDRONECARRY.cob',
        speed = 50,
        terraformspeed = 3000,
        turninplaceanglelimit = 360,
        turnrate = 240,
        workertime = 15000,
        customparams = {
            subfolder = 'ArmAircraft/T3',
            techlevel = 3,
            unitgroup = 'buildert3',
        },
    })
    unitDefs[faction .. unitDefName].buildoptions = {
        faction == 'leg' and 'legadveconvt3' or faction .. 'mmkrt3',
        faction .. 'afust3',
        faction .. 'nanotct2',
    }
end

for _, faction in pairs(factions) do
    table.insert(unitDefs[faction .. apt3].buildoptions, faction .. unitDefName)
end
