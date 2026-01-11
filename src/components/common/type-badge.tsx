import React from 'react';

import { Badge } from '@mantine/core';

import { TweakType } from '@/types/types';

interface TweakTypeProps {
    type: TweakType;
}

interface SlotTypeProps {
    type: TweakType;
    index: number;
}

export const TWEAK_COLOR_MAP: Record<TweakType, string> = {
    tweakdefs: 'blue',
    tweakunits: 'green',
    command: 'orange',
};

export const TweakTypeBadge: React.FC<TweakTypeProps> = ({ type }) => {
    return (
        <Badge size='xs' color={TWEAK_COLOR_MAP[type]} variant='light'>
            {type}
        </Badge>
    );
};

export const SlotTypeBadge: React.FC<SlotTypeProps> = ({ type, index }) => {
    return (
        <Badge size='xs' color={TWEAK_COLOR_MAP[type]} variant='light'>
            {`${type}${index === 0 ? '' : index}`}
        </Badge>
    );
};
