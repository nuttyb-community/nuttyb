import { Badge, Box, Group, Stack, Text, Tooltip } from '@mantine/core';
import { IconFile } from '@tabler/icons-react';

import type { LuaTweakType } from '@/types/types';

interface FileListItemProps {
    fileName: string;
    isSelected: boolean;
    isModified: boolean;
    isUsedInConfigurator: boolean;
    loadedInSlots: Array<{ slotName: string; slotType: LuaTweakType }>;
    fileSize: number;
    onClick: () => void;
}

export const FileListItem: React.FC<FileListItemProps> = ({
    fileName,
    isSelected,
    isModified,
    isUsedInConfigurator,
    loadedInSlots,
    fileSize,
    onClick,
}) => {
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
                    <IconFile size={14} />
                    <Text size='sm' truncate style={{ flex: 1 }}>
                        {fileName}
                    </Text>
                    {(isUsedInConfigurator || isModified) && (
                        <Tooltip
                            label={
                                isUsedInConfigurator && isModified
                                    ? `Modified • Loaded in: ${loadedInSlots.map((s) => s.slotName).join(', ')}`
                                    : isUsedInConfigurator
                                      ? `Loaded in: ${loadedInSlots.map((s) => s.slotName).join(', ')}`
                                      : 'Modified'
                            }
                        >
                            <Badge
                                size='xs'
                                color={isModified ? 'yellow' : 'green'}
                                variant='dot'
                            />
                        </Tooltip>
                    )}
                </Group>
                <Group gap='xs' justify='space-between'>
                    {loadedInSlots.length > 0 ? (
                        <Group gap={4} style={{ flex: 1, minWidth: 0 }}>
                            <Text size='xs' c='dimmed'>
                                →
                            </Text>
                            {loadedInSlots.map((slot, idx) => (
                                <Badge
                                    key={idx}
                                    size='xs'
                                    color={
                                        slot.slotType === 'tweakdefs'
                                            ? 'cyan'
                                            : 'grape'
                                    }
                                >
                                    {slot.slotName}
                                </Badge>
                            ))}
                        </Group>
                    ) : (
                        <Text size='xs' c='dimmed' style={{ flex: 1 }}>
                            Not loaded
                        </Text>
                    )}
                    <Text size='xs' c='dimmed'>
                        {fileSize.toLocaleString()}
                    </Text>
                </Group>
            </Stack>
        </Box>
    );
};
