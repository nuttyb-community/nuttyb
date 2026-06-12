-- MegaNuke
-- NuttyB v1.52 Mega Nuke
-- https://github.com/nuttyb-community/nuttyb

do
    local unitDefs = UnitDefs or {}
    local merge = table.mergeInPlace or table.merge

    local siloTweaks = {
        energycost = 1500000,
        metalcost = 98720,
        buildtime = 228500,
        footprintx = 12,
        footprintz = 12,
        maxthisunit = 1,
        explodeas = 'advancedFusionExplosion',
        weapondefs = {
            nuclear_missile = {
                areaofeffect = 5000,
                cameraShake = 15000,
                craterboost = 55,
                cratermult = 40,
                energypershot = 390000,
                metalpershot = 3000,
                smokesize = 28,
                smokecolor = 0.85,
                soundhitwetvolume = 80,
                soundstartvolume = 50,
                stockpiletime = 160,
                weaponvelocity = 500,
                damage = {
                    commanders = 500,
                    default = 19500,
                    raptor = 100000,
                },
            },
        },
    }

    for _, siloName in pairs({ 'armsilo', 'corsilo', 'legsilo' }) do
        if unitDefs[siloName] then
            merge(unitDefs[siloName], siloTweaks)
        end
    end

    -- Raptors lose their antinukes in exchange
    for _, antinukeName in pairs({
        'raptor_antinuke',
        'raptor_turret_antinuke_t2_v1',
        'raptor_turret_antinuke_t3_v1',
        'raptor_turret_antinuke_t4_v1',
    }) do
        if unitDefs[antinukeName] then
            unitDefs[antinukeName].maxthisunit = 0
        end
    end
end
