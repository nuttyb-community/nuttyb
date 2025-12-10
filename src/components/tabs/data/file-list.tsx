import React from 'react';

import { Stack, Text } from '@mantine/core';

interface Props {
    paths?: string[];
    missing?: string[];
}

const FileList: React.FC<Props> = ({ paths, missing }) => {
    if (!paths) {
        return (
            <Text size='sm' c='dimmed'>
                —
            </Text>
        );
    }

    return (
        <Stack gap={2}>
            {paths.map((p) => {
                const fileName = p.split('/').pop();
                return (
                    <Text key={p} size='xs' c='dimmed'>
                        {fileName}
                    </Text>
                );
            })}
            {missing && (
                <Text size='xs' c='red'>
                    Missing: {missing.length}
                </Text>
            )}
        </Stack>
    );
};

export default FileList;
