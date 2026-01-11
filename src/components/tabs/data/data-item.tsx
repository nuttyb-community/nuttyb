import React from 'react';

import {
    ActionIcon,
    Card,
    Flex,
    Stack,
    Text,
    Textarea,
    Tooltip,
} from '@mantine/core';
import { useClipboard } from '@mantine/hooks';
import { IconCheck, IconCopy } from '@tabler/icons-react';

import { ICON_STYLE } from '@/components/common/icon-style';
import { TypeBadge } from '@/components/common/type-badge';
import type { TweakType } from '@/types/types';

export interface DataItemProps {
    type: TweakType;
    source?: string; // file path for Lua, undefined for commands
    data: string;
    isMissing?: boolean;
}

export const DataItem: React.FC<DataItemProps> = ({
    type,
    source,
    data,
    isMissing,
}) => {
    const clipboard = useClipboard({ timeout: 2000 });
    const fileName = source?.split('/').pop();

    return (
        <Card p='xs' radius='sm' bg='dark'>
            <Stack gap='xs'>
                <Flex align='center' justify='space-between'>
                    <Flex gap='xs' mb={4} align='baseline'>
                        <TypeBadge type={type} />
                        {fileName && (
                            <Text size='sm' c={isMissing ? 'red' : 'dimmed'}>
                                {fileName}
                                {isMissing && ' (missing)'}
                            </Text>
                        )}
                    </Flex>
                    <Tooltip label='Copy'>
                        <ActionIcon
                            variant='subtle'
                            size='sm'
                            color={clipboard.copied ? 'green' : 'blue'}
                            onClick={() => clipboard.copy(data)}
                        >
                            {clipboard.copied ? (
                                <IconCheck {...ICON_STYLE} />
                            ) : (
                                <IconCopy {...ICON_STYLE} />
                            )}
                        </ActionIcon>
                    </Tooltip>
                </Flex>
                <Textarea
                    value={data}
                    readOnly
                    autosize
                    minRows={2}
                    maxRows={3}
                    style={{ flex: 1 }}
                    styles={{
                        input: {
                            fontFamily: 'monospace',
                            fontSize: '12px',
                        },
                    }}
                />
            </Stack>
        </Card>
    );
};
