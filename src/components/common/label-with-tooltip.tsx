import React from 'react';

import { ActionIcon, Group, Tooltip } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';

/** Info icon with an explanation in a default Mantine tooltip. */
const InfoTooltip: React.FC<{ label: string }> = ({ label }) => (
    // multiline + w: long explanations wrap instead of running off screen.
    // Focus and touch open it too; Mantine only listens to hover by default.
    <Tooltip
        label={label}
        multiline
        w={240}
        events={{ hover: true, focus: true, touch: true }}
    >
        {/* A button, so keyboard users can focus it to read the tooltip */}
        <ActionIcon
            variant='subtle'
            color='gray'
            size='xs'
            radius='xl'
            aria-label={label}
        >
            <IconInfoCircle size={14} />
        </ActionIcon>
    </Tooltip>
);

interface LabelWithTooltipProps {
    label: string;
    tooltip: string;
}

/** Input label followed by an info tooltip. */
export const LabelWithTooltip: React.FC<LabelWithTooltipProps> = ({
    label,
    tooltip,
}) => (
    <Group gap={4} align='center' wrap='nowrap' display='inline-flex'>
        <span>{label}</span>
        <InfoTooltip label={tooltip} />
    </Group>
);
