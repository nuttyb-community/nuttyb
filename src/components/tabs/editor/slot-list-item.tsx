import { Badge, Box, Group, Stack, Text } from '@mantine/core';
import { IconPackage } from '@tabler/icons-react';

import { MAX_SLOT_SIZE } from '@/lib/command-generator/constants';
import type { LuaTweakType } from '@/types/types';

interface SlotListItemProps {
    slotName: string;
    slotType: LuaTweakType;
    sources: string[];
    isSelected: boolean;
    isModified: boolean;
    slotSize: number;
    onClick: () => void;
}

export const SlotListItem: React.FC<SlotListItemProps> = ({
    slotName,
    slotType,
    sources,
    isSelected,
    isModified,
    slotSize,
    onClick,
}) => {
    const displaySources = sources
        .map((s) => s.replace(/^~?lua\//, '').split('{')[0])
        .join(', ');

    return (
        <Box
            p='xs'
            style={{
                cursor: 'pointer',
                borderRadius: 4,
                backgroundColor: isSelected
                    ? 'var(--mantine-color-blue-9)'
                    : 'transparent',
            }}
            onClick={onClick}
        >
            <Stack gap={2}>
                <Group gap='xs' wrap='nowrap'>
                    <IconPackage size={14} />
                    <Text size='sm' fw={500} truncate style={{ flex: 1 }}>
                        {slotName}
                    </Text>
                    {isModified && (
                        <Badge size='xs' color='yellow' variant='dot' />
                    )}
                    <Badge
                        size='xs'
                        color={slotType === 'tweakdefs' ? 'cyan' : 'grape'}
                    >
                        {sources.length}
                    </Badge>
                </Group>
                <Group gap='xs' justify='space-between'>
                    <Text size='xs' c='dimmed' truncate style={{ flex: 1 }}>
                        {displaySources}
                    </Text>
                    <Text
                        size='xs'
                        c={slotSize > MAX_SLOT_SIZE ? 'red' : 'dimmed'}
                    >
                        {slotSize.toLocaleString()}/
                        {MAX_SLOT_SIZE.toLocaleString()}
                    </Text>
                </Group>
            </Stack>
        </Box>
    );
};
