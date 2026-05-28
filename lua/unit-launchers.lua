-- UnitLaunchers
-- Meatballlunch Reloaded
-- This code adds new build options to the “Epic Commando” unit from the Cortex Faction (T3 Gantry with required experimental units + experimental SCAV units).
-- The build options currently include 18 new unit launchers.
-- Many T3 units and 9 launchers for T1-3 random units for each faction.
-- https://github.com/nuttyb-community/nuttyb

do
    local UnitDefs, armbotrail = UnitDefs or {}, 'armbotrail'
    local NewUnits = {
        armmeatball = {
            customparams = { i18n_en_humanname = 'Meatball Launcher' },
            weapondefs = {
                arm_botrail = {
                    range = 7550,
                    metalpershot = 5300,
                    energypershot = 96000,
                    reloadtime = 0.5,
                    customparams = {
                        stockpilelimit = 50,
                        spawns_name = 'armmeatball',
                    },
                },
            },
        },
        armassimilator = {
            customparams = { i18n_en_humanname = 'Assimilator Launcher' },
            weapondefs = {
                arm_botrail = {
                    range = 7550,
                    metalpershot = 4500,
                    energypershot = 80000,
                    reloadtime = 0.5,
                    customparams = {
                        stockpilelimit = 50,
                        spawns_name = 'armassimilator',
                    },
                },
            },
        },
        armpwt4 = {
            customparams = { i18n_en_humanname = 'Epic Pawn Launcher' },
            weapondefs = {
                arm_botrail = {
                    range = 7550,
                    metalpershot = 14200,
                    energypershot = 480000,
                    reloadtime = 0.5,
                    customparams = {
                        stockpilelimit = 50,
                        spawns_name = 'armpwt4',
                    },
                },
            },
        },
        legeshotgunmech = {
            customparams = { i18n_en_humanname = 'Pretorian Launcher' },
            weapondefs = {
                arm_botrail = {
                    range = 7550,
                    metalpershot = 15000,
                    energypershot = 384000,
                    reloadtime = 0.5,
                    customparams = {
                        stockpilelimit = 50,
                        spawns_name = 'legeshotgunmech',
                    },
                },
            },
        },
        legjav = {
            customparams = { i18n_en_humanname = 'Javelin Launcher' },
            weapondefs = {
                arm_botrail = {
                    range = 7550,
                    metalpershot = 3000,
                    energypershot = 102400,
                    reloadtime = 0.5,
                    customparams = {
                        stockpilelimit = 50,
                        spawns_name = 'legjav',
                    },
                },
            },
        },
        armraz = {
            customparams = { i18n_en_humanname = 'Razorback Launcher' },
            weapondefs = {
                arm_botrail = {
                    range = 7550,
                    metalpershot = 8000,
                    energypershot = 283520,
                    reloadtime = 0.5,
                    customparams = {
                        stockpilelimit = 50,
                        spawns_name = 'armraz',
                    },
                },
            },
        },
        corakt4 = {
            customparams = { i18n_en_humanname = 'Epic Grund Launcher' },
            weapondefs = {
                arm_botrail = {
                    range = 7550,
                    metalpershot = 15000,
                    energypershot = 384000,
                    reloadtime = 0.5,
                    customparams = {
                        stockpilelimit = 50,
                        spawns_name = 'corakt4',
                    },
                },
            },
        },
        cordemon = {
            customparams = { i18n_en_humanname = 'Demon Launcher' },
            weapondefs = {
                arm_botrail = {
                    range = 7550,
                    metalpershot = 15000,
                    energypershot = 384000,
                    reloadtime = 0.5,
                    customparams = {
                        stockpilelimit = 50,
                        spawns_name = 'cordemon',
                    },
                },
            },
        },
        armvader = {
            customparams = { i18n_en_humanname = 'Tumbleweed Launcher' },
            weapondefs = {
                arm_botrail = {
                    range = 7550,
                    metalpershot = 115,
                    energypershot = 12500,
                    reloadtime = 0.5,
                    customparams = {
                        stockpilelimit = 50,
                        spawns_name = 'armvader',
                    },
                },
            },
        },
        armvadert4 = {
            customparams = { i18n_en_humanname = 'Epic Tumbleweed Launcher' },
            weapondefs = {
                arm_botrail = {
                    range = 7550,
                    metalpershot = 26600,
                    energypershot = 480000,
                    reloadtime = 0.5,
                    customparams = {
                        stockpilelimit = 50,
                        spawns_name = 'armvadert4',
                    },
                },
            },
        },
        armt1 = {
            customparams = { i18n_en_humanname = 'Armada T1 Launcher' },
            weapondefs = {
                arm_botrail = {
                    stockpiletime = 0.5,
                    range = 7550,
                    metalpershot = 300,
                    energypershot = 12500,
                    reloadtime = 0.5,
                    customparams = {
                        stockpilelimit = 50,
                        spawns_name = 'armham armjeth armpw armrock armwar armah armanac armmh armsh armart armfav armflash armjanus armpincer armsam armstump armzapper',
                        spawns_mode = 'random',
                    },
                },
            },
        },
        armt2 = {
            customparams = { i18n_en_humanname = 'Armada T2 Launcher' },
            weapondefs = {
                arm_botrail = {
                    stockpiletime = 1,
                    range = 7550,
                    metalpershot = 1000,
                    energypershot = 45000,
                    reloadtime = 0.5,
                    customparams = {
                        stockpilelimit = 50,
                        spawns_name = 'armaak armamph armfast armfboy armfido armmav armsnipe armsptk armzeus armbull armcroc armgremlin armlatnk armmanni armmart armmerl armyork',
                        spawns_mode = 'random',
                    },
                },
            },
        },
        armt3 = {
            customparams = { i18n_en_humanname = 'Armada T3 Launcher' },
            weapondefs = {
                arm_botrail = {
                    stockpiletime = 2,
                    range = 7550,
                    metalpershot = 15000,
                    energypershot = 180000,
                    reloadtime = 0.5,
                    customparams = {
                        stockpilelimit = 50,
                        spawns_name = 'armbanth armlun armmar armprowl armraz armthor armvang armassimilator armlunchbox armsptkt4 armdronecarryland armrattet4',
                        spawns_mode = 'random',
                    },
                },
            },
        },
        cort1 = {
            customparams = { i18n_en_humanname = 'Cortex T1 Launcher' },
            weapondefs = {
                arm_botrail = {
                    stockpiletime = 0.5,
                    range = 7550,
                    metalpershot = 300,
                    energypershot = 12500,
                    reloadtime = 0.5,
                    customparams = {
                        stockpilelimit = 50,
                        spawns_name = 'corak corcrash corstorm corthud corah corhal cormh corsh corsnap corthovr corfav corgarp corgator corlevlr cormist corraid corwolv cortorch',
                        spawns_mode = 'random',
                    },
                },
            },
        },
        cort2 = {
            customparams = { i18n_en_humanname = 'Cortex T2 Launcher' },
            weapondefs = {
                arm_botrail = {
                    stockpiletime = 1,
                    range = 7550,
                    metalpershot = 1000,
                    energypershot = 45000,
                    reloadtime = 0.5,
                    customparams = {
                        stockpilelimit = 50,
                        spawns_name = 'coraak coramph corcan corfast corhrk cormort corpyro corroach corsktl corsumo cortermite corban corgol cormabm cormart corparrow correap corsala corseal corsent corsiegebreaker cortrem corvrad corvroc corftiger corgatreap',
                        spawns_mode = 'random',
                    },
                },
            },
        },
        cort3 = {
            customparams = { i18n_en_humanname = 'Cortex T3 Launcher' },
            weapondefs = {
                arm_botrail = {
                    stockpiletime = 2,
                    range = 7550,
                    metalpershot = 15000,
                    energypershot = 180000,
                    reloadtime = 0.5,
                    customparams = {
                        stockpilelimit = 50,
                        spawns_name = 'corcat cordemon corjugg corkarg corkorg corshiva corakt4 cordeadeye corkarganetht4 corkark corthermite corgolt4',
                        spawns_mode = 'random',
                    },
                },
            },
        },
        legt1 = {
            customparams = { i18n_en_humanname = 'Legion T1 Launcher' },
            weapondefs = {
                arm_botrail = {
                    stockpiletime = 0.5,
                    range = 7550,
                    metalpershot = 300,
                    energypershot = 12500,
                    reloadtime = 0.5,
                    customparams = {
                        stockpilelimit = 50,
                        spawns_name = 'legbal legcen leggob legkark leglob legah legcar legmh legner legsh legamphtank legbar leggat leghades leghelios legrail',
                        spawns_mode = 'random',
                    },
                },
            },
        },
        legt2 = {
            customparams = { i18n_en_humanname = 'Legion T2 Launcher' },
            weapondefs = {
                arm_botrail = {
                    stockpiletime = 1,
                    range = 7550,
                    metalpershot = 1000,
                    energypershot = 45000,
                    reloadtime = 0.5,
                    customparams = {
                        stockpilelimit = 50,
                        spawns_name = 'legamph legbart legdecom leginc legshot legsnapper legsrail legstr legaheattank legamcluster legaskirmtank legavroc legfloat leginf legmed legmrv legvcarry legvflak',
                        spawns_mode = 'random',
                    },
                },
            },
        },
        legt3 = {
            customparams = { i18n_en_humanname = 'Legion T3 Launcher' },
            weapondefs = {
                arm_botrail = {
                    stockpiletime = 2,
                    range = 7550,
                    metalpershot = 15000,
                    energypershot = 180000,
                    reloadtime = 0.5,
                    customparams = {
                        stockpilelimit = 50,
                        spawns_name = 'leegmech legbunk legeheatraymech legelrpcmech legerailtank legeshotgunmech legjav legkeres leggobt3 legpede legsrailt4',
                        spawns_mode = 'random',
                    },
                },
            },
        },
    }

    local function ensureBuildOption(builderName, optionName)
        local builder = UnitDefs[builderName]
        local optionDef = optionName and UnitDefs[optionName]
        if not builder or not optionDef then
            return
        end

        builder.buildoptions = builder.buildoptions or {}
        for i = 1, #builder.buildoptions do
            if builder.buildoptions[i] == optionName then
                return
            end
        end

        builder.buildoptions[#builder.buildoptions + 1] = optionName
    end

    if UnitDefs.cormandot4 then
        for k, s in pairs(NewUnits) do
            local nU = armbotrail .. '_' .. k
            if UnitDefs[armbotrail] and not UnitDefs[nU] then
                UnitDefs[nU] = table.merge(UnitDefs[armbotrail], s)
                ensureBuildOption('cormandot4', nU)
            end
        end
    end
end
