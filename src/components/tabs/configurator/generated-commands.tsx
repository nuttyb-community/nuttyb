'use client';

import React from 'react';

import { Button, Group, Stack, Text, Textarea, Title } from '@mantine/core';
import { useClipboard } from '@mantine/hooks';

import { useTweakDataContext } from '@/components/contexts/tweak-data-context';

interface CopySectionProps {
    content: string;
    label: string;
}

function CopySection({ content, label }: CopySectionProps) {
    const clipboard = useClipboard({ timeout: 2000 });

    return (
        <Group align='flex-start' gap='md'>
            <Button
                color={clipboard.copied ? 'teal' : 'blue'}
                onClick={() => clipboard.copy(content)}
                w={120}
                style={{ flexShrink: 0 }}
            >
                {clipboard.copied ? 'Copied!' : label}
            </Button>
            <Textarea
                value={content}
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
        </Group>
    );
}

const GeneratedCommands: React.FC = () => {
    const { sections } = useTweakDataContext();

    // Hide section entirely when no commands
    if (sections.length === 0) {
        return null;
    }

    const hasMultipleSections = sections.length > 1;

    return (
        <Stack gap='md'>
            <Title order={2}>Generated Commands</Title>

            {hasMultipleSections && (
                <Text size='sm' c='dimmed'>
                    Copy and paste all parts separately to the lobby
                </Text>
            )}

            {sections.map((section, index) => (
                <CopySection
                    key={index}
                    content={section}
                    label={
                        hasMultipleSections ? `Copy Part ${index + 1}` : 'Copy'
                    }
                />
            ))}
        </Stack>
    );
};

export default GeneratedCommands;
