--Disarm queen
for _, name in pairs({
    'raptor_queen_veryeasy',
    'raptor_queen_easy',
    'raptor_queen_normal',
    'raptor_queen_hard',
    'raptor_queen_veryhard',
    'raptor_queen_epic',
}) do
    UnitDefs[name].weapons = {}
end
