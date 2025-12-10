import React from 'react';

import { Badge } from '@mantine/core';

import { TweakType } from '@/types/types';

interface Props {
    type: TweakType;
}

const TypeBadge: React.FC<Props> = ({ type }) => {
    const colorMap: Record<TweakType, string> = {
        tweakdefs: 'blue',
        tweakunits: 'green',
        command: 'orange',
    };

    return (
        <Badge color={colorMap[type]} variant='light'>
            {type}
        </Badge>
    );
};

export default TypeBadge;
