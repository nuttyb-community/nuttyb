'use client';

import React, { useRef, useState } from 'react';

import { Box, Group, ScrollArea } from '@mantine/core';
import { useElementSize } from '@mantine/hooks';

import { usePresetsContext } from '@/components/contexts/presets-context';
import type { Preset } from '@/lib/presets/registry';

import { PresetCard } from './preset-card';

export const PresetCardList: React.FC<{
    onEdit: (preset: Preset) => void;
}> = ({ onEdit }) => {
    const { builtInPresets, localPresets } = usePresetsContext();
    const { ref: frameRef, width: frameWidth } = useElementSize();
    const { ref: rowRef, width: rowWidth } = useElementSize();
    const viewportRef = useRef<HTMLDivElement>(null);
    const [isAtStart, setAtStart] = useState(true);
    const [isAtEnd, setAtEnd] = useState(false);
    // Fade each edge while more cards are hidden that way
    const overflows = rowWidth > frameWidth + 1;
    const hasMoreLeft = overflows && !isAtStart;
    const hasMoreRight = overflows && !isAtEnd;
    const presets = [...builtInPresets, ...localPresets];

    return (
        <Box ref={frameRef} pos='relative'>
            {/* Scrolls sideways once the cards outgrow the column */}
            <ScrollArea
                scrollbars='x'
                type='auto'
                viewportRef={viewportRef}
                onScrollPositionChange={({ x }) => {
                    const viewport = viewportRef.current;
                    if (!viewport) return;
                    setAtStart(x <= 1);
                    setAtEnd(
                        x + viewport.clientWidth >= viewport.scrollWidth - 1
                    );
                }}
            >
                <Group
                    ref={rowRef}
                    role='radiogroup'
                    aria-label='Preset'
                    gap='md'
                    wrap='nowrap'
                    align='stretch'
                    w='max-content'
                    // Clears the overlaid 12px scrollbar with a 16px gap
                    pb={28}
                >
                    {presets.map((preset) => (
                        <PresetCard
                            key={preset.id}
                            preset={preset}
                            onEdit={onEdit}
                        />
                    ))}
                </Group>
            </ScrollArea>
            <Box
                pos='absolute'
                top={0}
                left={0}
                bottom={0}
                w={64}
                opacity={hasMoreLeft ? 1 : 0}
                style={{
                    background:
                        'linear-gradient(to left, transparent, var(--mantine-color-body))',
                    pointerEvents: 'none',
                    transition: 'opacity 150ms ease',
                }}
            />
            <Box
                pos='absolute'
                top={0}
                right={0}
                bottom={0}
                w={64}
                opacity={hasMoreRight ? 1 : 0}
                style={{
                    background:
                        'linear-gradient(to right, transparent, var(--mantine-color-body))',
                    pointerEvents: 'none',
                    transition: 'opacity 150ms ease',
                }}
            />
        </Box>
    );
};
