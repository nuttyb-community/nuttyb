/**
 * Runs lua/eco-evo-template.lua from the bundle in a Lua VM against mock BAR
 * unit defs, for every max tier. The generated yardmaps are checked against a
 * model of Recoil's build placement, the build options against BAR's Quick
 * Build (mex/geo) widget.
 */

import { describe, expect, test } from 'bun:test';

import { LuaFactory } from 'wasmoon';

import { ECO_MAX_TIERS } from '@/lib/command-generator/data/configuration';
import { resolveLuaReference } from '@/lib/command-generator/interpolator';

import { getBundle } from './utils/bundle';

interface UnitDef {
    yardmap?: string;
    footprintx?: number;
    footprintz?: number;
    objectname?: string;
    explodeas?: string;
    metalcost?: number;
    energymake?: number;
    buildoptions?: string[];
    featuredefs?: Record<string, { metal?: number; object?: string }>;
    customparams?: Record<string, number | string | boolean>;
}
type UnitDefs = Record<string, UnitDef>;

interface Building {
    name: string;
    tier: number;
    family: 'fusion' | 'converter';
}

/** A building's yardmap, its top-left square relative to a fusion footprint's */
interface Placed {
    cells: string;
    size: number;
    row: number;
    col: number;
    finished: boolean;
}

/** Any ordinary building, e.g. a wind turbine: 2×2 squares, all solid */
const SOLID: UnitDef = { footprintx: 1, yardmap: 'hoooo' };

const FACTIONS = ['arm', 'cor', 'leg'] as const;
type Faction = (typeof FACTIONS)[number];

// BAR's table helpers (common/tablefunctions.lua) and the unit defs the
// template reads. Build option orders follow BAR's T2 constructors,
// builders-t3-template.lua's T3 aides and evocom-arm.lua's commanders.
const MOCK_DEFS = `
function table.copy(t)
    local copy = {}
    for k, v in pairs(t) do
        copy[k] = type(v) == 'table' and table.copy(v) or v
    end
    return copy
end

function table.merge(target, data)
    local new = table.copy(target)
    for k, v in pairs(data) do
        if not new[k] and type(v) == 'table' then
            new[k] = table.copy(v)
        elseif type(new[k]) == 'table' and type(v) == 'table' then
            new[k] = table.merge(new[k], v)
        else
            new[k] = v
        end
    end
    return new
end

function table.mergeInPlace(target, data)
    for k, v in pairs(data) do
        if type(v) == 'table' and type(target[k] or false) == 'table' then
            table.mergeInPlace(target[k], v)
        else
            target[k] = v
        end
    end
    return target
end

local function fusion(energy, metal, techlevel, model)
    return {
        energymake = energy,
        energystorage = energy * 3,
        metalcost = metal,
        energycost = metal * 10,
        objectname = model,
        script = model,
        buildpic = model,
        explodeas = 'fusionExplosion',
        customparams = { techlevel = techlevel },
        featuredefs = {
            dead = { object = model .. '_dead', metal = metal / 2 },
            heap = { object = 'heap', metal = metal / 4 },
        },
    }
end

local function converter(capacity, efficiency, metal, techlevel)
    return {
        metalcost = metal,
        energycost = metal * 50,
        explodeas = 'advmetalmaker',
        customparams = {
            energyconv_capacity = capacity,
            energyconv_efficiency = efficiency,
            techlevel = techlevel,
        },
    }
end

UnitDefs = {}
for _, f in ipairs({ 'arm', 'cor', 'leg' }) do
    local c = f == 'leg' and 'legadveconv' or f .. 'mmkr'
    UnitDefs[f .. 'fus'] = fusion(750, 3350, 2, f .. 'fus')
    UnitDefs[f .. 'afus'] = fusion(3000, 9700, 2, f .. 'afus')
    UnitDefs[f .. 'afust3'] = fusion(30000, 90000, 3, f .. 'afust3')
    UnitDefs[c] = converter(600, 0.01724, 380, 2)
    UnitDefs[c .. 't3'] = converter(6000, 0.02, 9000, 3)
    UnitDefs[f .. 'ageo'] = {
        energymake = 1250,
        customparams = { geothermal = 1, standardextractor = true, techlevel = 2 },
    }
    UnitDefs[f .. 'nanotct2'] = { customparams = {} }
    UnitDefs[f .. 'ack'] = { buildoptions = { f .. 'fus', f .. 'afus', f .. 'ageo', c } }
    UnitDefs[f .. 't3aide'] = { buildoptions = { f .. 'afust3', f .. 'nanotct2', c .. 't3' } }
    UnitDefs[f .. 'comlvl5'] = { buildoptions = { c, f .. 'afus', f .. 'fus' } }
end
`;

const bundle = getBundle();
if (!bundle) {
    throw new Error('Bundle should exist. Run bun run sync to generate it.');
}
const luaFileMap = new Map(bundle.files.map((file) => [file.path, file.data]));
const luaFactory = new LuaFactory();

async function runTemplate(maxTier: number): Promise<UnitDefs> {
    const template = resolveLuaReference(
        `lua/eco-evo-template.lua{MAX_TIER=${maxTier}}`,
        luaFileMap
    );
    const lua = await luaFactory.createEngine();
    try {
        return (await lua.doString(
            `${MOCK_DEFS}\n${template}\nreturn UnitDefs`
        )) as UnitDefs;
    } finally {
        lua.global.close();
    }
}

function getChain(
    faction: Faction,
    family: Building['family'],
    maxTier: number
): Building[] {
    const converter = faction === 'leg' ? 'legadveconv' : `${faction}mmkr`;
    const chain: Building[] = [];
    for (let tier = family === 'fusion' ? 1 : 2; tier <= maxTier; tier++) {
        const name =
            family === 'fusion'
                ? ([`${faction}fus`, `${faction}afus`][tier - 1] ??
                  `${faction}afust${tier}`)
                : tier === 2
                  ? converter
                  : `${converter}t${tier}`;
        chain.push({ name, tier, family });
    }
    return chain;
}

function rotate(cells: string, size: number): string {
    const rotated: string[] = [];
    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            rotated[c * size + size - 1 - r] = cells[r * size + c];
        }
    }
    return rotated.join('');
}

/**
 * Places a building centered on the fusion footprint, turned 0-3 times, or
 * with its top-left square at `at`
 */
function place(
    def: UnitDef,
    finished: boolean,
    turns = 0,
    at?: [number, number]
): Placed {
    const size = 2 * (def.footprintx ?? 0);
    let cells = (def.yardmap ?? '').slice(1);
    for (let i = 0; i < turns; i++) {
        cells = rotate(cells, size);
    }
    const [row, col] = at ?? [(24 - size) / 2, (24 - size) / 2];
    return { cells, size, row, col, finished };
}

/**
 * Whether a building holds a square in Recoil's ground blocking map: 'y'
 * squares never, 'c' (yard) squares only until its yard opens, which BAR's
 * Geo Upgrade Reclaimer gadget does when a geothermal building finishes.
 */
function holds(cell: string, finished: boolean): boolean {
    return cell !== 'y' && !(cell === 'c' && finished);
}

/**
 * Recoil's CGameHelper::TestBuildSquare for every square of the new
 * building. Only the oldest building holding a square is tested; new 's'/'y'
 * cells stack on anything, other cells only fit on a 'b' cell.
 */
function canPlace(world: Placed[], building: Placed): boolean {
    for (let r = 0; r < building.size; r++) {
        for (let c = 0; c < building.size; c++) {
            const cell = building.cells[r * building.size + c];
            if (cell === 's' || cell === 'y') continue;

            for (const other of world) {
                const otherR = r + building.row - other.row;
                const otherC = c + building.col - other.col;
                if (
                    otherR < 0 ||
                    otherC < 0 ||
                    otherR >= other.size ||
                    otherC >= other.size
                ) {
                    continue;
                }
                const otherCell = other.cells[otherR * other.size + otherC];
                if (holds(otherCell, other.finished)) {
                    if (otherCell !== 'b') return false;
                    break;
                }
            }
        }
    }
    return true;
}

/**
 * BAR's Quick Build (mex/geo) widget: offers the builder's first geothermal
 * build option over a hovered geothermal building it can "upgrade"
 * (api_resource_spot_builder.lua, extractorCanBeUpgraded)
 */
function quickBuildOffer(
    defs: UnitDefs,
    builder: string,
    hovered: string
): string | undefined {
    const offered = defs[builder].buildoptions?.find(
        (option) => defs[option]?.customparams?.geothermal
    );
    if (!offered || offered === hovered) return undefined;

    const offeredDef = defs[offered];
    const hoveredDef = defs[hovered];
    const offeredTech = Math.floor(
        Number(offeredDef.customparams?.techlevel ?? 1)
    );
    const hoveredTech = Math.floor(
        Number(hoveredDef.customparams?.techlevel ?? 1)
    );
    if (offeredTech !== hoveredTech) {
        return offeredTech > hoveredTech ? offered : undefined;
    }
    if ((offeredDef.energymake ?? 0) > (hoveredDef.energymake ?? 0)) {
        return offered;
    }
    return offeredDef.customparams?.standardextractor ? undefined : offered;
}

// T3 aides and commanders have no real geo plant to offer first
test.todo(
    "Quick Build offers T3 aides' and commanders' fusion over a real geo plant"
);

for (const maxTier of ECO_MAX_TIERS) {
    const defs = await runTemplate(maxTier);

    describe(`Evolving eco, max tier T${maxTier}`, () => {
        for (const faction of FACTIONS) {
            const fusions = getChain(faction, 'fusion', maxTier);
            const converters = getChain(faction, 'converter', maxTier);
            const families = [fusions, converters];
            const buildings = [...fusions, ...converters];

            test(`${faction}: every tier has a solid, rotation-symmetric yardmap`, () => {
                const failures: string[] = [];
                for (const building of buildings) {
                    const def = defs[building.name];
                    const footprint = building.family === 'fusion' ? 12 : 6;
                    const size = 2 * footprint;
                    const cells = def.yardmap?.slice(1) ?? '';
                    if (
                        def.footprintx !== footprint ||
                        def.footprintz !== footprint ||
                        !def.yardmap?.startsWith('h') ||
                        !/^[oscy]*$/.test(cells) ||
                        cells.length !== size * size
                    ) {
                        failures.push(`${building.name}: malformed yardmap`);
                        continue;
                    }
                    // Without an 'o' cell it could be built over its own tier
                    if (!cells.includes('o')) {
                        failures.push(`${building.name}: no solid cell`);
                    }
                    // Upgrades must fit whichever way either building faces
                    if (rotate(cells, size) !== cells) {
                        failures.push(
                            `${building.name}: not rotation-symmetric`
                        );
                    }
                }
                expect(failures).toEqual([]);
            });

            test(`${faction}: every tier is a geothermal building the widget can rank`, () => {
                for (const building of buildings) {
                    expect(defs[building.name].customparams).toMatchObject({
                        geothermal: 1,
                        techlevel: building.family === 'fusion' ? 3 : 4,
                        standardextractor: true,
                        i18n_en_humanname: `T${building.tier} ${building.family === 'fusion' ? 'Fusion Reactor' : 'Energy Converter'}`,
                    });
                }
            });

            test(`${faction}: a building only upgrades to higher tiers of its family, facing any way`, () => {
                const failures: string[] = [];
                for (const family of families) {
                    for (const existing of family) {
                        for (const upgrade of family) {
                            for (let turns = 0; turns < 4; turns++) {
                                const allowed = canPlace(
                                    [place(defs[existing.name], true)],
                                    place(defs[upgrade.name], false, turns)
                                );
                                if (allowed !== upgrade.tier > existing.tier) {
                                    failures.push(
                                        `${upgrade.name} over ${existing.name}, turned ${turns}: ${allowed ? 'allowed' : 'blocked'}`
                                    );
                                }
                            }
                        }
                    }
                }
                expect(failures).toEqual([]);
            });

            test(`${faction}: nothing starts over an upgrade still being built`, () => {
                // e.g. a second builder reaching the same queued upgrade
                // must assist the frame instead of starting another one
                const failures: string[] = [];
                for (const family of families) {
                    for (const existing of family) {
                        for (const frame of family) {
                            if (frame.tier <= existing.tier) continue;
                            for (const next of buildings) {
                                if (
                                    canPlace(
                                        [
                                            place(defs[existing.name], true),
                                            place(defs[frame.name], false),
                                        ],
                                        place(defs[next.name], false)
                                    )
                                ) {
                                    failures.push(
                                        `${next.name} over ${frame.name} frame on ${existing.name}`
                                    );
                                }
                            }
                        }
                    }
                }
                expect(failures).toEqual([]);
            });

            test(`${faction}: an unfinished building can't be upgraded`, () => {
                // The gadget would refund its full metal cost on completion
                const failures: string[] = [];
                for (const frame of buildings) {
                    for (const next of buildings) {
                        if (
                            canPlace(
                                [place(defs[frame.name], false)],
                                place(defs[next.name], false)
                            )
                        ) {
                            failures.push(
                                `${next.name} over ${frame.name} frame`
                            );
                        }
                    }
                }
                expect(failures).toEqual([]);
            });

            test(`${faction}: fusions and converters never stack on each other`, () => {
                const failures: string[] = [];
                for (const fusion of fusions) {
                    for (const converter of converters) {
                        for (const finished of [true, false]) {
                            if (
                                canPlace(
                                    [place(defs[converter.name], finished)],
                                    place(defs[fusion.name], false)
                                )
                            ) {
                                failures.push(
                                    `${fusion.name} over ${converter.name}`
                                );
                            }
                            if (
                                canPlace(
                                    [place(defs[fusion.name], finished)],
                                    place(defs[converter.name], false)
                                )
                            ) {
                                failures.push(
                                    `${converter.name} over ${fusion.name}`
                                );
                            }
                        }
                    }
                }
                expect(failures).toEqual([]);
            });

            test(`${faction}: nothing overlaps a building off-center`, () => {
                // Top-left squares sit on Recoil's 2-square build grid. The
                // gadget only removes a building centered under the new one,
                // so an off-center overlap would leave both standing.
                const failures: string[] = [];
                const defsByName: [string, UnitDef][] = [
                    ...buildings.map(({ name }): [string, UnitDef] => [
                        name,
                        defs[name],
                    ]),
                    ['solid building', SOLID],
                ];
                for (const [existingName, existingDef] of defsByName) {
                    for (const [nextName, nextDef] of defsByName) {
                        const centered = place(nextDef, false);
                        for (const finished of [true, false]) {
                            const existing = place(existingDef, finished);
                            for (
                                let row = existing.row - centered.size + 2;
                                row < existing.row + existing.size;
                                row += 2
                            ) {
                                for (
                                    let col = existing.col - centered.size + 2;
                                    col < existing.col + existing.size;
                                    col += 2
                                ) {
                                    if (
                                        row === centered.row &&
                                        col === centered.col
                                    ) {
                                        continue;
                                    }
                                    if (
                                        canPlace(
                                            [existing],
                                            place(nextDef, false, 0, [row, col])
                                        )
                                    ) {
                                        failures.push(
                                            `${nextName} at ${row},${col} over ${existingName}${finished ? '' : ' frame'}`
                                        );
                                    }
                                }
                            }
                        }
                    }
                }
                expect(failures).toEqual([]);
            });

            test(`${faction}: Quick Build only offers stronger fusions over fusions`, () => {
                const failures: string[] = [];
                const builders = [
                    `${faction}ack`,
                    `${faction}t3aide`,
                    `${faction}comlvl5`,
                ];
                for (const builder of builders) {
                    for (const hovered of buildings) {
                        const offered = quickBuildOffer(
                            defs,
                            builder,
                            hovered.name
                        );
                        if (!offered) continue;
                        const offeredFusion = fusions.find(
                            (fusion) => fusion.name === offered
                        );
                        if (
                            hovered.family === 'converter' ||
                            !offeredFusion ||
                            offeredFusion.tier <= hovered.tier
                        ) {
                            failures.push(
                                `${builder} offers ${offered} over ${hovered.name}`
                            );
                        }
                    }
                }
                expect(failures).toEqual([]);
            });

            test(`${faction}: Quick Build keeps offering T2 constructors' geo plant on geo vents`, () => {
                const offered = defs[`${faction}ack`].buildoptions?.find(
                    (option) => defs[option]?.customparams?.geothermal
                );
                expect(offered).toBe(`${faction}ageo`);
                expect(
                    quickBuildOffer(defs, `${faction}ack`, `${faction}ageo`)
                ).toBeUndefined();
            });

            test(`${faction}: T3+ tiers scale from T3 and are buildable`, () => {
                const t3 = defs[`${faction}afust3`];
                for (const fusion of fusions) {
                    if (fusion.tier <= 3) continue;
                    const def = defs[fusion.name];
                    // Lua and JS round 1.8^n differently, so compare ratios
                    expect(
                        (def.energymake ?? 0) / (t3.energymake ?? 1)
                    ).toBeCloseTo(1.5 ** (fusion.tier - 3), 4);
                    expect(
                        (def.metalcost ?? 0) / (t3.metalcost ?? 1)
                    ).toBeCloseTo(1.8 ** (fusion.tier - 3), 4);
                    expect(def.explodeas).toBe('largeBuildingexplosiongeneric');
                }
                for (const building of buildings) {
                    if (building.tier < 3) continue;
                    // T3 too: eco-t3.lua, which adds it, isn't loaded
                    expect(defs[`${faction}ack`].buildoptions).toContain(
                        building.name
                    );
                    expect(defs[`${faction}t3aide`].buildoptions).toContain(
                        building.name
                    );
                }
                expect(defs[`${faction}afust${maxTier + 1}`]).toBeUndefined();
                expect(t3.explodeas).toBe('fusionExplosion');
            });

            test(`${faction}: T1/T2 fusions take the T3 model but keep their wreck value`, () => {
                const t3 = defs[`${faction}afust3`];
                expect(defs[`${faction}fus`]).toMatchObject({
                    objectname: t3.objectname,
                    featuredefs: {
                        dead: {
                            object: t3.featuredefs?.dead.object,
                            metal: 3350 / 2,
                        },
                    },
                });
                expect(defs[`${faction}afus`].objectname).toBe(t3.objectname);
            });
        }
    });
}
