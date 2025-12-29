/**
 * Tests for command template interpolation.
 */

import { describe, expect, test } from 'bun:test';

import {
    buildTemplateContext,
    interpolateCommands,
    interpolateCommandTemplate,
    isCommandTemplate,
} from '@/lib/command-generator/command-template';
import { DEFAULT_CONFIGURATION } from '@/lib/command-generator/data/configuration';

describe('isCommandTemplate', () => {
    test('detects template with $variable$ pattern', () => {
        expect(isCommandTemplate('Hello $name$!')).toBe(true);
        expect(isCommandTemplate('$a$ and $b$')).toBe(true);
        expect(isCommandTemplate('!rename [$difficulty$]')).toBe(true);
    });

    test('returns false for non-template strings', () => {
        expect(isCommandTemplate('Hello world!')).toBe(false);
        expect(isCommandTemplate('!preset coop')).toBe(false);
        expect(isCommandTemplate('$welcome-message text')).toBe(false); // $ but no closing $
        expect(isCommandTemplate('price is $100')).toBe(false); // $ but not a variable
    });

    test('handles edge cases', () => {
        expect(isCommandTemplate('')).toBe(false);
        expect(isCommandTemplate('$$')).toBe(false); // empty variable name
        expect(isCommandTemplate('$_$')).toBe(true); // underscore is valid
        expect(isCommandTemplate('$a1$')).toBe(true); // alphanumeric
    });
});

describe('interpolateCommandTemplate', () => {
    describe('required variables', () => {
        test('replaces single variable', () => {
            expect(
                interpolateCommandTemplate('Hello $name$!', { name: 'World' })
            ).toBe('Hello World!');
        });

        test('replaces multiple variables', () => {
            expect(
                interpolateCommandTemplate('$greeting$ $name$!', {
                    greeting: 'Hello',
                    name: 'World',
                })
            ).toBe('Hello World!');
        });

        test('replaces same variable multiple times', () => {
            expect(
                interpolateCommandTemplate('$x$ + $x$ = 2$x$', { x: '1' })
            ).toBe('1 + 1 = 21');
        });

        test('throws on missing required variable', () => {
            expect(() =>
                interpolateCommandTemplate('Hello $name$!', {})
            ).toThrow('Required template variable is empty or missing: name');
        });

        test('throws on empty required variable', () => {
            expect(() =>
                interpolateCommandTemplate('Hello $name$!', { name: '' })
            ).toThrow('Required template variable is empty or missing: name');
        });
    });

    describe('optional sections', () => {
        test('keeps optional section when variable has value', () => {
            expect(
                interpolateCommandTemplate('Hello $?$name$?$!', {
                    name: 'World',
                })
            ).toBe('Hello World!');
        });

        test('removes optional section when variable is empty', () => {
            expect(
                interpolateCommandTemplate('Hello$?$name$?$!', { name: '' })
            ).toBe('Hello!');
        });

        test('removes optional section when variable is missing', () => {
            expect(interpolateCommandTemplate('Hello$?$name$?$!', {})).toBe(
                'Hello!'
            );
        });

        test('handles multiple optional sections', () => {
            const template = 'A $?$b$?$ C $?$d$?$ E';
            expect(
                interpolateCommandTemplate(template, { b: 'B', d: 'D' })
            ).toBe('A B C D E');
            expect(
                interpolateCommandTemplate(template, { b: 'B', d: '' })
            ).toBe('A B C E');
            expect(
                interpolateCommandTemplate(template, { b: '', d: 'D' })
            ).toBe('A C D E');
            expect(interpolateCommandTemplate(template, { b: '', d: '' })).toBe(
                'A C E'
            );
        });

        test('removes section if ANY variable inside is empty', () => {
            expect(
                interpolateCommandTemplate('Start $?$a$ $b$?$ End', {
                    a: 'A',
                    b: '',
                })
            ).toBe('Start End');
        });

        test('keeps section if ALL variables have values', () => {
            expect(
                interpolateCommandTemplate('Start $?$a$ $b$?$ End', {
                    a: 'A',
                    b: 'B',
                })
            ).toBe('Start A B End');
        });
    });

    describe('whitespace normalization', () => {
        test('collapses multiple spaces', () => {
            expect(interpolateCommandTemplate('a  b   c', {})).toBe('a b c');
        });

        test('trims leading and trailing whitespace', () => {
            expect(interpolateCommandTemplate('  hello  ', {})).toBe('hello');
        });

        test('normalizes whitespace after removing optional section', () => {
            // Optional section with a variable that's empty gets removed
            expect(interpolateCommandTemplate('a $?$b$?$  c', { b: '' })).toBe(
                'a c'
            );
        });
    });

    describe('rename command template', () => {
        const renameTemplate =
            '!rename Community NuttyB [$presetDifficulty$] $?[$lobbyName$]?$';

        test('generates command with lobby name', () => {
            expect(
                interpolateCommandTemplate(renameTemplate, {
                    presetDifficulty: 'Medium',
                    lobbyName: 'My Game',
                })
            ).toBe('!rename Community NuttyB [Medium] [My Game]');
        });

        test('generates command without lobby name', () => {
            expect(
                interpolateCommandTemplate(renameTemplate, {
                    presetDifficulty: 'Medium',
                    lobbyName: '',
                })
            ).toBe('!rename Community NuttyB [Medium]');
        });

        test('works with all difficulty levels', () => {
            for (const difficulty of ['Easy', 'Medium', 'Hard']) {
                expect(
                    interpolateCommandTemplate(renameTemplate, {
                        presetDifficulty: difficulty,
                        lobbyName: '',
                    })
                ).toBe(`!rename Community NuttyB [${difficulty}]`);
            }
        });
    });
});

describe('buildTemplateContext', () => {
    test('builds context from configuration', () => {
        const context = buildTemplateContext(DEFAULT_CONFIGURATION);

        expect(context.presetDifficulty).toBe('Medium');
        expect(context.lobbyName).toBe('');
        expect(context.extras).toBe('Mini Bosses');
        expect(context.gameMap).toBe('Full Metal Plate (12P)');
        expect(context.start).toBe('No rush');
        expect(context.isMegaNuke).toBe('false');
    });

    test('trims lobby name', () => {
        const context = buildTemplateContext({
            ...DEFAULT_CONFIGURATION,
            lobbyName: '  My Game  ',
        });

        expect(context.lobbyName).toBe('My Game');
    });
});

describe('interpolateCommands', () => {
    test('interpolates template commands', () => {
        const commands = [
            '!preset coop',
            '!rename Community NuttyB [$presetDifficulty$] $?[$lobbyName$]?$',
            '!balance',
        ];

        const result = interpolateCommands(commands, DEFAULT_CONFIGURATION);

        expect(result).toEqual([
            '!preset coop',
            '!rename Community NuttyB [Medium]',
            '!balance',
        ]);
    });

    test('passes through non-template commands unchanged', () => {
        const commands = ['!preset coop', '!teamsize 12', '!balance'];

        const result = interpolateCommands(commands, DEFAULT_CONFIGURATION);

        expect(result).toEqual(commands);
    });

    test('handles mixed template and non-template commands', () => {
        const commands = [
            '!preset coop',
            '!rename Community NuttyB [$presetDifficulty$] $?[$lobbyName$]?$',
            '!teamsize 12',
        ];

        const config = {
            ...DEFAULT_CONFIGURATION,
            presetDifficulty: 'Hard' as const,
            lobbyName: 'Epic Battle',
        };

        const result = interpolateCommands(commands, config);

        expect(result).toEqual([
            '!preset coop',
            '!rename Community NuttyB [Hard] [Epic Battle]',
            '!teamsize 12',
        ]);
    });
});
