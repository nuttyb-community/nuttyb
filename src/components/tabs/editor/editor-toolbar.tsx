import { ActionIcon, Badge, Group, Text, Tooltip } from '@mantine/core';
import {
    IconCheck,
    IconCode,
    IconCopy,
    IconDownload,
    IconPackage,
    IconRefresh,
    IconTransform,
} from '@tabler/icons-react';

import { ICON_STYLE } from '@/components/common/icon-style';
import { MAX_SLOT_SIZE } from '@/lib/command-generator/constants';
import type { LuaTweakType } from '@/types/types';

import { ViewMode } from './types';

interface EditorToolbarProps {
    viewMode: ViewMode;
    currentTitle: string | null;
    isModified: boolean;
    slotInfo?: {
        type: LuaTweakType;
        slotSize: number;
    } | null;
    onReset: () => void;
    onCopy: () => void;
    onCopyBase64: () => void;
    onDownload?: () => void;
    isCopied: boolean;
    isBase64Copied: boolean;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({
    viewMode,
    currentTitle,
    isModified,
    slotInfo,
    onReset,
    onCopy,
    onCopyBase64,
    onDownload,
    isCopied,
    isBase64Copied,
}) => {
    return (
        <Group gap='xs' justify='space-between' style={{ width: '100%' }}>
            <Group gap='xs'>
                {viewMode === 'sources' ? (
                    <IconCode size={16} />
                ) : (
                    <IconPackage size={16} />
                )}
                <Text size='sm' fw={500}>
                    {currentTitle}
                </Text>
                {isModified && (
                    <Badge size='xs' color='yellow'>
                        Modified
                    </Badge>
                )}
                {slotInfo && (
                    <>
                        <Badge
                            size='xs'
                            color={
                                slotInfo.type === 'tweakdefs' ? 'cyan' : 'grape'
                            }
                        >
                            {slotInfo.type}
                        </Badge>
                        <Badge
                            size='xs'
                            color={
                                slotInfo.slotSize > MAX_SLOT_SIZE
                                    ? 'red'
                                    : 'gray'
                            }
                            variant='outline'
                        >
                            B64: {slotInfo.slotSize.toLocaleString()} /{' '}
                            {MAX_SLOT_SIZE.toLocaleString()}
                        </Badge>
                    </>
                )}
            </Group>

            <Group gap='xs'>
                {isModified && (
                    <Tooltip label='Reset to original'>
                        <ActionIcon
                            variant='subtle'
                            size='sm'
                            onClick={onReset}
                        >
                            <IconRefresh {...ICON_STYLE} />
                        </ActionIcon>
                    </Tooltip>
                )}
                <Tooltip label={isCopied ? 'Copied!' : 'Copy code'}>
                    <ActionIcon
                        variant='subtle'
                        size='sm'
                        color={isCopied ? 'green' : 'blue'}
                        onClick={onCopy}
                    >
                        {isCopied ? (
                            <IconCheck {...ICON_STYLE} />
                        ) : (
                            <IconCopy {...ICON_STYLE} />
                        )}
                    </ActionIcon>
                </Tooltip>
                <Tooltip label={isBase64Copied ? 'Copied!' : 'Copy as Base64'}>
                    <ActionIcon
                        variant='subtle'
                        size='sm'
                        color={isBase64Copied ? 'green' : 'blue'}
                        onClick={onCopyBase64}
                    >
                        {isBase64Copied ? (
                            <IconCheck {...ICON_STYLE} />
                        ) : (
                            <IconTransform {...ICON_STYLE} />
                        )}
                    </ActionIcon>
                </Tooltip>
                {viewMode === 'sources' && onDownload && (
                    <Tooltip label='Download file'>
                        <ActionIcon
                            variant='subtle'
                            size='sm'
                            onClick={onDownload}
                        >
                            <IconDownload {...ICON_STYLE} />
                        </ActionIcon>
                    </Tooltip>
                )}
            </Group>
        </Group>
    );
};
