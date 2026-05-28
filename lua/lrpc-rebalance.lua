-- LRPC.Rebalance
-- NuttyB lrpc rebalance v2
-- https://github.com/nuttyb-community/nuttyb

do
    local unitDefs = UnitDefs or {}

    if unitDefs.armbrtha then
        table.mergeInPlace(unitDefs.armbrtha, {
            health = 13000,
            weapondefs = {
                ARMBRTHA_MAIN = {
                    damage = {
                        commanders = 480,
                        default = 33000,
                    },
                    areaofeffect = 60,
                    energypershot = 8000,
                    range = 2400,
                    reloadtime = 9,
                    turnrate = 20000,
                },
            },
        })
    end

    if unitDefs.corint then
        table.mergeInPlace(unitDefs.corint, {
            health = 13000,
            weapondefs = {
                CORINT_MAIN = {
                    damage = {
                        commanders = 480,
                        default = 85000,
                    },
                    areaofeffect = 230,
                    edgeeffectiveness = 0.6,
                    energypershot = 15000,
                    range = 2700,
                    reloadtime = 18,
                },
            },
        })
    end

    if unitDefs.leglrpc then
        table.mergeInPlace(unitDefs.leglrpc, {
            health = 13000,
            weapondefs = {
                LEGLRPC_MAIN = {
                    damage = {
                        commanders = 480,
                        default = 4500,
                    },
                    energypershot = 2000,
                    range = 2000,
                    reloadtime = 2,
                    turnrate = 30000,
                },
            },
        })
    end
end
