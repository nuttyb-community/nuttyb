--T4 Defences NuttyB version
-- Authors: Hedgehogzs
-- bar-nuttyb-collective.github.io/configurator

local unitDefs, tableMerge, legendary_pulsar, legendary_bulwark, legendary_bastion =
	UnitDefs or {},
	table.merge,
	'legendary_pulsar',
	'legendary_bulwark',
	'legendary_bastion'

unitDefs.legendary_pulsar = tableMerge(
	unitDefs['armannit3'],
	{
		name = 'Legendary Pulsar',
		description = 'A pinnacle of Armada engineering that fires devastating, rapid-fire tachyon bolts.',
		buildtime = 300000,
		health = 30000,
		metalcost = 43840,
		energycost = 1096000,
        icontype = "armannit3",
		customparams = {
			i18n_en_humanname = 'Legendary Pulsar',
			i18n_en_tooltip = 'Fires devastating, rapid-fire tachyon bolts.',
			techlevel = 4
		},
		weapondefs = {
			tachyon_burst_cannon = {
				collidefriendly = 0,
				collidefeature = 0,
				avoidfeature = 0,
				avoidfriendly = 0,
				name = 'Tachyon Burst Cannon',
				weapontype = 'LaserCannon',
				rgbcolor = '1 0 1',
				burst = 3,
				burstrate = 0.40,
				reloadtime = 5,
				accuracy = 400,
				areaofeffect = 12,
				range = 1800,
				energypershot = 12000,
				turret = true,
				soundstart = 'annigun1',
				soundhit = 'xplolrg3',
				size = 6,
				impulsefactor = 0,
				weaponvelocity = 3100,
				thickness = 10,
				laserflaresize = 8,
				texture3 = "largebeam",
				tilelength = 150,
				tolerance = 10000,
				beamtime = 3,
				explosiongenerator = 'custom:tachyonshot',
				damage = {
					default = 8000
				},
				allowNonBlockingAim = true
			}
		},
		weapons = {
			[1] = {
				badtargetcategory = "VTOL GROUNDSCOUT",
				def = 'tachyon_burst_cannon',
				onlytargetcategory = 'SURFACE'
			}
		}
	}
)
unitDefs.legendary_bastion = tableMerge(
	unitDefs['legbastion'],
	{
		name = 'Legendary Bastion',
		description = 'The ultimate defensive emplacement. Projects a devastating, pulsating heatray.',
		health = 22000,
		metalcost = 65760,
		energycost = 1986500,
		buildtime = 180000,
		footprintx = 6,
		footprintz = 6,
        icontype = "legbastion",
		objectname = 'scavs/scavbeacon_t4.s3o',
		script = 'scavs/scavbeacon.cob',
		buildpic = 'scavengers/SCAVBEACON.DDS',
		damagemodifier = 0.20,
		customparams = {
			i18n_en_humanname = 'Legendary Bastion',
			i18n_en_tooltip = 'Projects a devastating, pulsating purple heatray.',
			maxrange = 1450,
			techlevel = 4
		},
		weapondefs = {
			legendary_bastion_ray = {
				areaofeffect = 24,
				collidefriendly = 0,
				collidefeature = 0,
				avoidfeature = 0,
				avoidfriendly = 0,
				beamtime = 0.3,
				camerashake = 0,
				corethickness = 0.3,
				craterareaofeffect = 120,
				craterboost = 0,
				cratermult = 0,
				edgeeffectiveness = 0.45,
				energypershot = 3000,
				explosiongenerator = "custom:laserhit-medium-purple",
				firestarter = 90,
				firetolerance = 300,
				impulsefactor = 0,
				laserflaresize = 2,
				name = "Legendary Heat Ray",
				noselfdamage = true,
				predictboost = 0.3,
				proximitypriority = 1,
				range = 1450,
				reloadtime = 0.3,
				rgbcolor = "1.0 0.2 1.0",
				rgbcolor2 = "0.9 1.0 0.5",
				soundhitdry = "",
				soundhitwet = "sizzle",
				soundstart = "banthie2",
				soundstartvolume = 25,
				soundtrigger = 1,
				thickness = 5.5,
				turret = true,
				weapontype = "BeamLaser",
				weaponvelocity = 1500,
				allowNonBlockingAim = true,
				damage = {
					default = 2500,
					vtol = 15,
				},
			},
		},
		weapons = {
			[1] = {
				badtargetcategory = 'VTOL GROUNDSCOUT',
				def = 'legendary_bastion_ray',
				onlytargetcategory = 'SURFACE'
			}
		}
	}
)
unitDefs[legendary_bulwark] =
	tableMerge(
	unitDefs['cordoomt3'],
	{
		name = 'Legendary Bulwark',
		description = 'A pinnacle of defensive technology, the Legendary Bulwark annihilates all who approach.',
		buildtime = 250000,
		health = 42000,
		metalcost = 61650,
		energycost = 1712500,
		damagemodifier = 0.15,
		energystorage = 5000,
		radardistance = 1400,
		sightdistance = 1100,
        icontype = "cordoomt3",
		customparams = {
			i18n_en_humanname = 'Legendary Bulwark',
			i18n_en_tooltip = 'The ultimate defensive structure.',
			paralyzemultiplier = 0.2,
			techlevel = 4
		},
		weapondefs = {
			legendary_overload_scatter = {
				collidefriendly = 0,
				collidefeature = 0,
				avoidfeature = 0,
				avoidfriendly = 0,
				name = 'Overload Scatter Beamer',
				weapontype = 'BeamLaser',
				range = 1000,
				reloadtime = 0.1,
				sprayangle = 2000,
				projectiles = 12,
				rgbcolor = '0.8 0.1 1.0',
				accuracy = 50,
				areaofeffect = 8,
				beamdecay = 0.05,
				beamtime = 0.1,
				beamttl = 1,
				corethickness = 0.05,
				burnblow = true,
				cylindertargeting = 1,
				edgeeffectiveness = 0.15,
				explosiongenerator = 'custom:laserhit-medium-purple',
				firestarter = 100,
				impulsefactor = 0.123,
				intensity = 0.3,
				laserflaresize = 11.35,
				noselfdamage = true,
				soundhitwet = 'sizzle',
				soundstart = 'beamershot2',
				tolerance = 5000,
				thickness = 2,
				turret = true,
				weaponvelocity = 1000,
				damage = {
					default = 600
				},
			},
			legendary_heat_ray = {
				collidefriendly = 0,
				collidefeature = 0,
				avoidfeature = 0,
				avoidfriendly = 0,
				name = 'Armageddon Heat Ray',
				weapontype = 'BeamLaser',
				range = 1300,
				reloadtime = 4.0,
				areaofeffect = 72,
				beamtime = 0.6,
				cameraShake = 350,
				corethickness = 0.40,
				craterareaofeffect = 72,
				energypershot = 1200,
				explosiongenerator = 'custom:genericshellexplosion-medium-beam',
				impulsefactor = 0,
				largebeamlaser = true,
				laserflaresize = 8.8,
				noselfdamage = true,
				rgbcolor = '0.9 1.0 0.5',
				rgbcolor2 = '0.8 0 0',
				scrollspeed = 5,
				soundhitdry = '',
				soundhitwet = 'sizzle',
				soundstart = 'heatray2xl',
				soundtrigger = 1,
				thickness = 7,
				tolerance = 10000,
				turret = true,
				weaponvelocity = 1800,
				damage = {
					default = 9000,
					commanders = 1350
				},
			},
			legendary_point_defense = {
				collidefriendly = 0,
				collidefeature = 0,
				avoidfeature = 0,
				avoidfriendly = 0,
				name = 'Point Defense Laser',
				weapontype = 'BeamLaser',
				range = 750,
				reloadtime = 0.5,
				areaofeffect = 12,
				beamtime = 0.3,
				corethickness = 0.32,
				energypershot = 500,
				explosiongenerator = 'custom:laserhit-large-blue',
				firestarter = 90,
				impactonly = 1,
				impulsefactor = 0,
				largebeamlaser = true,
				laserflaresize = 8.8,
				noselfdamage = true,
				proximitypriority = 0,
				rgbcolor = '0 0 1',
				soundhitdry = '',
				soundhitwet = 'sizzle',
				soundstart = 'annigun1',
				soundtrigger = 1,
				texture3 = 'largebeam',
				thickness = 5.5,
				tilelength = 150,
				tolerance = 10000,
				turret = true,
				weaponvelocity = 1500,
				damage = {
					default = 450,
					commanders = 999
				},
			}
		},
		weapons = {
			[1] = {
				def = 'legendary_overload_scatter',
				onlytargetcategory = 'SURFACE'
			},
			[2] = {
				def = 'legendary_heat_ray',
				onlytargetcategory = 'SURFACE'
			},
			[3] = {
				def = 'legendary_point_defense',
				onlytargetcategory = 'SURFACE'
			}
		}
	}
)

local builders = {
	'armaca',
	'armack',
	'armacsub',
	'armacv',
	'coraca',
	'corack',
	'coracsub',
	'coracv',
	'legaca',
	'legack',
	'legacv',
	'legcomt2com',
}
for _, faction in pairs {'arm', 'cor', 'leg'} do
	for i = 3, 10 do
		table.insert(builders, faction .. 'comlvl' .. i)
	end
	table.insert(builders, faction .. 't3airaide')
end

for _, builder in pairs(builders) do
	if unitDefs[builder] then
		local faction = string.sub(builder, 1, 3)
		table.insert(
			unitDefs[builder].buildoptions,
			(faction == 'arm' and legendary_pulsar) or (faction == 'cor' and legendary_bulwark) or legendary_bastion
		)
	end
end
