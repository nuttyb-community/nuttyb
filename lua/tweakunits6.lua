--NuttyB lrpc rebalance v2
-- bar-nuttyb-collective.github.io/configurator
return {
	armbrtha = {
		health = 13000,
		weapondefs = {
			ARMBRTHA_MAIN = {
				damage = {
					commanders = 480,
					default = 33000
				},
				areaofeffect = 60,
				energypershot = 8000,
				range = 2400,
				reloadtime = 9,
				turnrate = 20000
			}
		}
	},
	corint = {
		health = 13000,
		weapondefs = {
			CORINT_MAIN = {
				damage = {
					commanders = 480,
					default = 85000
				},
				areaofeffect = 230,
				edgeeffectiveness = 0.6,
				energypershot = 15000,
				range = 2700,
				reloadtime = 18
			}
		}
	},
	leglrpc = {
		health = 13000,
		weapondefs = {
			LEGLRPC_MAIN = {
				damage = {
					commanders = 480,
					default = 4500
				},
				energypershot = 2000,
				range = 2000,
				reloadtime = 2,
				turnrate = 30000
			}
		}
	}
}
