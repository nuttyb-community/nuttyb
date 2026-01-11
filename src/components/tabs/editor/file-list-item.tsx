import { Group, Stack, Text } from '@mantine/core';
import { IconFile } from '@tabler/icons-react';

import { ICON_SIZE_MD } from '@/components/common/icon-style';
import { SlotTypeBadge } from '@/components/common/type-badge';
import type { LuaTweakType } from '@/types/types';

interface FileListItemProps {
    fileName: string;
    isSelected: boolean;
    isModified: boolean;
    loadedInSlots: Array<{ slotName: string; slotType: LuaTweakType }>;
    fileSize: number;
    onClick: () => void;
}

export const FileListItem: React.FC<FileListItemProps> = ({
    fileName,
    isSelected,
    isModified,
    loadedInSlots,
    fileSize,
    onClick,
}) => {
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
                <IconFile
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
                    {fileName}
                </Text>
            </Group>
            <Group gap='xs' justify='space-between'>
                {loadedInSlots.length > 0 ? (
                    <Group gap={4} style={{ flex: 1, minWidth: 0 }}>
                        <Text size='xs' c='dimmed'>
                            →
                        </Text>
                        {loadedInSlots.map((slot, idx) => (
                            <SlotTypeBadge
                                key={idx}
                                type={slot.slotType}
                                index={Number.parseInt(
                                    slot.slotName.match(/\d+$/)?.[0] ?? '0'
                                )}
                            />
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
    );
};
