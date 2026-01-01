--Evo Commander XP Inheritance
for name, ud in pairs(UnitDefs) do
	if string.match(name, 'comlvl%d') or string.match(name, 'armcom') or string.match(name, 'corcom') or string.match(name, 'legcom') then
		ud.customparams = ud.customparams or {}
		ud.customparams.inheritxpratemultiplier = 0.5
		ud.customparams.childreninheritxp = 'TURRET MOBILEBUILT'
		ud.customparams.parentsinheritxp = 'TURRET MOBILEBUILT'
	end
end
