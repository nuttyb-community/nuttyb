--Cross Faction Tax 70%
-- Authors: TetrisCo
-- bar-nuttyb-collective.github.io/configurator
local unitDefs, tax, t2Factories, taxedT2Factories, unitI18N, _taxed, taxedTitlePostfix =
	UnitDefs or {}, 1.7, {}, {}, Json.decode(VFS.LoadFile('language/en/units.json')), '_taxed', ' (Taxed)'

for name, def in pairs(unitDefs) do
	if
		def.customparams
		and def.customparams.subfolder
		and (def.customparams.subfolder:match 'Fact' or def.customparams.subfolder:match 'Lab')
		and def.customparams.techlevel == 2
	then
		local unitTitle = unitI18N and unitI18N.units.names[name] or name
		t2Factories[name] = 1
		taxedT2Factories[name .. _taxed] = table.merge(def, {
			energycost = def.energycost * tax,
			icontype = name,
			metalcost = def.metalcost * tax,
			name = unitTitle .. taxedTitlePostfix,
			customparams = {
				i18n_en_humanname = unitTitle .. taxedTitlePostfix,
				i18n_en_tooltip = unitI18N and unitI18N.units.descriptions[name] or name,
			},
		})
	end
end

for builderName, T1T2BuilderDef in pairs(unitDefs) do
	if T1T2BuilderDef.buildoptions then
		for _, buildoption in pairs(T1T2BuilderDef.buildoptions) do
			if t2Factories[buildoption] then -- has non-cross-faction T2 factory
				for _, faction in pairs { 'arm', 'cor', 'leg' } do
					local crossfactionTaxedOption = faction .. buildoption:sub(4) .. _taxed
					if buildoption:sub(1, 3) ~= faction and taxedT2Factories[crossfactionTaxedOption] then
						unitDefs[builderName].buildoptions[#unitDefs[builderName].buildoptions + 1] = crossfactionTaxedOption
					end
				end
			end
		end
	end
end

table.mergeInPlace(unitDefs, taxedT2Factories)
