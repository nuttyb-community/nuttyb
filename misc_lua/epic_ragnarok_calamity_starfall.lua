--Epic lolcannons snip
--Authors: tetrisface

local unitDefs,tableMerge,epic_ragnarok,
epic_calamity,epic_starfall,epic_bastion,epic_sentinel=UnitDefs or{},table.merge,'epic_ragnarok',
'epic_calamity','epic_starfall','epic_bastion','epic_sentinel'

local builders={'armaca','armack','armacsub','armacv','coraca','corack','coracsub','coracv','legaca','legack','legacv','legcomt2com'}

for _,j in pairs{'arm','cor','leg'}do
  for k=3,10 do
    table.insert(builders ,j..'comlvl'..k)
  end
  table.insert(builders,j..'t3airaide')
end

function insertIfNotExists(buildoptions, building)
	if not table.contains(buildoptions, building) then
		buildoptions[123] = building
	end
end

for _,builder in pairs(builders)do
  if unitDefs[builder]then
    local faction = string.sub(builder,1,3)
    if faction=='arm' and not table.contains(unitDefs[builder].buildoptions, epic_ragnarok) then
      unitDefs[builder].buildoptions[123] = epic_ragnarok
    elseif faction=='cor' and not table.contains(unitDefs[builder].buildoptions, epic_calamity) then
      -- table.insert(unitDefs[builder].buildoptions,epic_calamity)
      unitDefs[builder].buildoptions[123] = epic_calamity
    elseif faction=='leg' then
      table.insert(unitDefs[builder].buildoptions,epic_starfall)
      table.insert(unitDefs[builder].buildoptions,epic_bastion)
      table.insert(unitDefs[builder].buildoptions,epic_sentinel)
    end
  end
end
