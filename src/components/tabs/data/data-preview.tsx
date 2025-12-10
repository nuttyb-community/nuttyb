import React from 'react';

import { Code, ScrollArea, Text } from '@mantine/core';

interface Props {
    data: string[];
}

const DataPreview: React.FC<Props> = ({ data }) => {
    if (data.length === 0) {
        return (
            <Text size='sm' c='dimmed' fs='italic'>
                —
            </Text>
        );
    }

    const content = data.join('\n');

    return (
        <ScrollArea.Autosize mah={120}>
            <Code
                block
                style={{
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-all',
                    fontSize: '10px',
                }}
            >
                {content}
            </Code>
        </ScrollArea.Autosize>
    );
};

export default DataPreview;
