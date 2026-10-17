import React from 'react';

import { Box, Center, Stepper, StepperStep } from '@mantine/core';

import { PageWrapper } from '@/components/page-wrapper';

const STEPS = [
    {
        title: 'Pick your settings',
        description: 'Start from a preset and adjust it',
    },
    {
        title: 'Copy the commands',
        description: 'One click copies them all',
    },
    {
        title: 'Paste into lobby chat',
        description: 'Host a lobby and paste them in',
    },
];

/** The three steps from settings to lobby: their own band, no heading, generous vertical room. */
export const HowItWorks: React.FC = () => {
    const steps = STEPS.map((step) => (
        <StepperStep
            key={step.title}
            label={step.title}
            description={step.description}
        />
    ));

    return (
        <Box component='section' py={120}>
            <PageWrapper>
                {/* Static steppers: no onStepClick, so the steps aren't clickable; active={-1} keeps them neutral.
                    A row from md up, a vertical stepper below, where three steps don't fit side by side. */}
                <Center visibleFrom='md'>
                    <Stepper
                        active={-1}
                        size='lg'
                        wrap={false}
                        // Keeps the connectors visible when the row gets tight
                        styles={{ separator: { minWidth: 48 } }}
                    >
                        {steps}
                    </Stepper>
                </Center>
                <Stepper
                    hiddenFrom='md'
                    active={-1}
                    size='lg'
                    orientation='vertical'
                >
                    {steps}
                </Stepper>
            </PageWrapper>
        </Box>
    );
};
