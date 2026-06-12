--Auto Unit Evolution
local evolutionChains = {
    arm = {
        {
            from = 'armwin',
            fromDesc = 'Wind Turbine',
            to = 'armsolar',
            toDesc = 'Solar Collector',
            timer = 60,
        },
        {
            from = 'armsolar',
            fromDesc = 'Solar Collector',
            to = 'armadvsol',
            toDesc = 'Advanced Solar Collector',
            timer = 120,
        },
        {
            from = 'armadvsol',
            fromDesc = 'Advanced Solar Collector',
            to = 'armwint2',
            toDesc = 'Advanced Wind Turbine',
            timer = 240,
        },
        {
            from = 'armwint2',
            fromDesc = 'Fusion Reactor',
            to = 'armfus',
            toDesc = 'Advanced Fusion Reactor',
            timer = 360,
        },
        {
            from = 'armfus',
            fromDesc = 'Fusion Reactor',
            to = 'armafus',
            toDesc = 'Advanced Fusion Reactor',
            timer = 360,
        },
        {
            from = 'armgeo',
            fromDesc = 'Geothermal Powerplant',
            to = 'armfakegeo',
            toDesc = '-Workaround Fake Geo-',
            timer = 360,
        },
        {
            from = 'armfakegeo',
            fromDesc = '-Workaround Fake Geo-',
            to = 'armageo',
            toDesc = 'Advanced Geothermal Powerplant',
            timer = 2,
        },
        {
            from = 'armtide',
            fromDesc = 'Tidal Generator',
            to = 'armuwfus',
            toDesc = 'Naval Fusion Reactor',
            timer = 300,
        },
        {
            from = 'armmex',
            fromDesc = 'Metal Extractor',
            to = 'armfakemex',
            toDesc = '-Workaround Fake Mex-',
            timer = 360,
        },
        {
            from = 'armfakemex',
            fromDesc = '-Workaround Fake Mex-',
            to = 'armmoho',
            toDesc = 'Advanced Metal Extractor',
            timer = 2,
        },
        {
            from = 'armdrag',
            fromDesc = "Dragon's Teeth",
            to = 'armfort',
            toDesc = 'Fortification Wall',
            timer = 360,
        },
        {
            from = 'armnanotc',
            fromDesc = 'Construction Turret',
            to = 'armnanotct2',
            toDesc = 'Advanced Construction Turret',
            timer = 120,
        },
        {
            from = 'armnanotcplat',
            fromDesc = 'Naval Construction Turret',
            to = 'armnanotc2plat',
            toDesc = 'Advanced Naval Construction Turret',
            timer = 120,
        },
        {
            from = 'armfasp',
            fromDesc = 'Water Air Repair Pad',
            to = 'mission_command_tower',
            toDesc = 'Mission Command Tower',
            timer = 60,
            announce = true,
            anSize = 25,
        },
    },
    cor = {
        {
            from = 'corwin',
            fromDesc = 'Wind Turbine',
            to = 'corsolar',
            toDesc = 'Solar Collector',
            timer = 60,
        },
        {
            from = 'corsolar',
            fromDesc = 'Solar Collector',
            to = 'coradvsol',
            toDesc = 'Advanced Solar Collector',
            timer = 120,
        },
        {
            from = 'coradvsol',
            fromDesc = 'Advanced Solar Collector',
            to = 'corwint2',
            toDesc = 'Advanced Wind Turbine',
            timer = 240,
        },
        {
            from = 'corwint2',
            fromDesc = 'Advanced Wind Turbine',
            to = 'corfus',
            toDesc = 'Fusion Reactor',
            timer = 300,
        },
        {
            from = 'corfus',
            fromDesc = 'Fusion Reactor',
            to = 'corafus',
            toDesc = 'Advanced Fusion Reactor',
            timer = 360,
        },
        {
            from = 'corgeo',
            fromDesc = 'Geothermal Powerplant',
            to = 'corfakegeo',
            toDesc = '-Workaround Fake Geo-',
            timer = 360,
        },
        {
            from = 'corfakegeo',
            fromDesc = '-Workaround Fake Geo-',
            to = 'corageo',
            toDesc = 'Advanced Geothermal Powerplant',
            timer = 2,
        },
        {
            from = 'cortide',
            fromDesc = 'Tidal Generator',
            to = 'coruwfus',
            toDesc = 'Naval Fusion Reactor',
            timer = 300,
        },
        {
            from = 'cormex',
            fromDesc = 'Metal Extractor',
            to = 'corfakemex',
            toDesc = '-Workaround Fake Mex-',
            timer = 360,
        },
        {
            from = 'corfakemex',
            fromDesc = '-Workaround Fake Mex-',
            to = 'cormoho',
            toDesc = 'Advanced Metal Extractor',
            timer = 2,
        },
        {
            from = 'cordrag',
            fromDesc = "Dragon's Teeth",
            to = 'corfort',
            toDesc = 'Fortification Wall',
            timer = 360,
        },
        {
            from = 'cornanotc',
            fromDesc = 'Construction Turret',
            to = 'cornanotct2',
            toDesc = 'Advanced Construction Turret',
            timer = 120,
        },
        {
            from = 'cornanotcplat',
            fromDesc = 'Naval Construction Turret',
            to = 'cornanotc2plat',
            toDesc = 'Advanced Naval Construction Turret',
            timer = 120,
        },
        {
            from = 'corfasp',
            fromDesc = 'Water Air Repair Pad',
            to = 'mission_command_tower',
            toDesc = 'Mission Command Tower',
            timer = 60,
            announce = true,
            anSize = 25,
        },
    },
    leg = {
        {
            from = 'legwin',
            fromDesc = 'Wind Turbine',
            to = 'legsolar',
            toDesc = 'Solar Collector',
            timer = 60,
        },
        {
            from = 'legsolar',
            fromDesc = 'Solar Collector',
            to = 'legadvsol',
            toDesc = 'Advanced Solar Collector',
            timer = 120,
        },
        {
            from = 'legadvsol',
            fromDesc = 'Advanced Solar Collector',
            to = 'corwint2',
            toDesc = 'Advanced Wind Turbine',
            timer = 240,
        },
        {
            from = 'legtide',
            fromDesc = 'Tidal Generator',
            to = 'coruwfus',
            toDesc = 'Naval Fusion Reactor',
            timer = 300,
        },
        {
            from = 'legmex',
            fromDesc = 'Metal Extractor',
            to = 'legfakemex',
            toDesc = '-Workaround Fake Mex-',
            timer = 360,
        },
        {
            from = 'legfakemex',
            fromDesc = '-Workaround Fake Mex-',
            to = 'legmoho',
            toDesc = 'Advanced Metal Extractor',
            timer = 2,
        },
        {
            from = 'legdrag',
            fromDesc = "Dragon's Teeth",
            to = 'corfort',
            toDesc = 'Fortification Wall',
            timer = 360,
        },
    },
}
UnitDefs['armfakemex'] = table.copy(UnitDefs['armmex'])
UnitDefs['armfakemex'].extractsmetal = 0
UnitDefs['armfakegeo'] = table.copy(UnitDefs['armgeo'])
UnitDefs['armfakegeo'].customparams.geothermal = nil
UnitDefs['corfakemex'] = table.copy(UnitDefs['cormex'])
UnitDefs['corfakemex'].extractsmetal = 0
UnitDefs['corfakegeo'] = table.copy(UnitDefs['corgeo'])
UnitDefs['corfakegeo'].customparams.geothermal = nil
if UnitDefs['legmex'] then
    UnitDefs['legfakemex'] = table.copy(UnitDefs['legmex'])
    UnitDefs['legfakemex'].extractsmetal = 0
end
for unitName, unitDef in pairs(UnitDefs) do
    local faction = string.sub(unitName, 1, 3)
    for _, evolution in ipairs(evolutionChains[faction] or {}) do
        if unitName == evolution.from then
            unitDef.customparams = unitDef.customparams or {}
            unitDef.customparams.evolution_target = evolution.to
            if evolution.announce then
                unitDef.customparams.evolution_announcement = string.format(
                    '%s evolved to %s!',
                    evolution.fromDesc,
                    evolution.toDesc
                )
                unitDef.customparams.evolution_announcement_size = evolution.anSize
                    or 12.5
            end
            unitDef.customparams.evolution_condition = 'timer'
            unitDef.customparams.evolution_timer = evolution.timer or 120
            unitDef.customparams.evolution_health_transfer = 'flat'
        end
    end
    if unitName == 'mission_command_tower' then
        unitDef.weapondefs = unitDef.weapondefs or {}
        unitDef.weapondefs['repulsor'] = {
            avoidfeature = false,
            texture1 = 'Flame',
            craterareaofeffect = 0,
            craterboost = 0,
            cratermult = 0,
            edgeeffectiveness = unitDef.health / 12000 + 0.04,
            name = 'PlasmaRepulsor',
            range = 777,
            soundhitwet = 'sizzle',
            weapontype = 'Shield',
            damage = { default = 420 },
            shield = {
                alpha = 0.2,
                armortype = 'shields',
                force = unitDef.health / 4200 + 0.42,
                intercepttype = 128,
                power = unitDef.health * 0.35 + 420,
                powerregen = 117526.5,
                powerregenenergy = 500,
                radius = 777,
                repulser = true,
                smart = true,
                startingpower = unitDef.health * 0.21,
                visible = true,
                visiblerepulse = true,
                badcolor = { [1] = 0.7, [2] = 0.1, [3] = 0.1, [4] = 0.2 },
                goodcolor = { [1] = 1.1, [2] = 1.1, [3] = 1.1, [4] = 1 },
            },
        }
        unitDef.weapons = unitDef.weapons or {}
        unitDef.weapons[#unitDef.weapons + 1] =
            { def = 'REPULSOR', onlytargetcategory = 'NOTSUB' }
    end
end
