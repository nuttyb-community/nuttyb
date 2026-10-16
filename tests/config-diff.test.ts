import { expect, test } from 'bun:test';

import { DEFAULT_CONFIGURATION } from '@/lib/command-generator/data/configuration';
import { computeConfigDiff } from '@/lib/presets/config-diff';

test('computeConfigDiff lists only changed settings, labelled', () => {
    expect(computeConfigDiff(DEFAULT_CONFIGURATION)).toEqual([]);
    expect(
        computeConfigDiff({
            ...DEFAULT_CONFIGURATION,
            queenCount: 6,
            isMegaNuke: !DEFAULT_CONFIGURATION.isMegaNuke,
        })
    ).toEqual([
        { label: 'Mega Nuke', value: 'Enabled' },
        { label: 'Raptor queen count', value: '6' },
    ]);
});
