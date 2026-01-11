import { Badge, Group, Stack, Text, Tooltip } from '@mantine/core';
import { IconPackage } from '@tabler/icons-react';

import { ICON_SIZE_MD } from '@/components/common/icon-style';
import { TWEAK_COLOR_MAP } from '@/components/common/type-badge';
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
        <Stack
            gap={2}
            p='xs'
            bdrs='sm'
            bd={`1px solid ${isSelected ? 'var(--mantine-primary-color-filled)' : 'transparent'}`}
            bg={isSelected ? 'var(--mantine-primary-color-light)' : undefined}
            style={{
                cursor: 'pointer',
            }}
            onClick={onClick}
        >
            <Group gap='xs' wrap='nowrap'>
                <IconPackage
                    {...ICON_SIZE_MD}
                    color={isModified ? 'orange' : undefined}
                />
                <Text
                    size='sm'
                    fw={500}
                    truncate
                    c={isModified ? 'orange' : undefined}
                    style={{ flex: 1 }}
                >
                    {slotName}
                </Text>
                <Tooltip
                    label={`${sources.length} tweak(s) mapped to this slot`}
                >
                    <Badge size='xs' color={TWEAK_COLOR_MAP[slotType]}>
                        {sources.length}
                    </Badge>
                </Tooltip>
            </Group>
            <Group gap='xs' justify='space-between'>
                <Text size='xs' c='dimmed' truncate style={{ flex: 1 }}>
                    {displaySources}
                </Text>
                <Text size='xs' c={slotSize > MAX_SLOT_SIZE ? 'red' : 'dimmed'}>
                    {slotSize.toLocaleString()}/{MAX_SLOT_SIZE.toLocaleString()}
                </Text>
            </Group>
        </Stack>
    );
};
