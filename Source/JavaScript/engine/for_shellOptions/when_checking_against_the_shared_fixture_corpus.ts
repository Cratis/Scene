// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describeMenuBehavior, menuModeAfterShellSwitch, menuThemes, navigationModes, normalizeNavigationMode, NavigationMode, shellOptionDescriptors } from '../index';

const corpus = JSON.parse(readFileSync(join(import.meta.dirname, '../../../../shell-options-fixtures.json'), 'utf-8')) as {
    modes: Record<string, unknown>[];
    menuThemes: Record<string, unknown>[];
    normalize: { input: string; expected: string | null }[];
    behavior: { mode: NavigationMode; touch: boolean; expected: Record<string, unknown> }[];
    switch: { name: string; current?: string; shellDefault?: string; shellName: string; expected: Record<string, unknown> }[];
};

const plain = (value: unknown) => JSON.parse(JSON.stringify(value));

describe('when checking the typed shell options against the shared fixture corpus', () => {
    it('should list the eight modes the corpus lists', () => plain(navigationModes.map(({ legacy: _, ...mode }) => mode)).should.deep.equal(corpus.modes));

    it('should list the menu themes the corpus lists', () => plain(menuThemes).should.deep.equal(corpus.menuThemes));

    it('should offer both options as enumerated choices with a default', () => {
        const options = shellOptionDescriptors();
        [options.map(option => option.path), options.map(option => option.valueType), options[0].choices!.length, options[1].choices!.length, options.map(option => option.default)]
            .should.deep.equal([['navigationMode', 'menuTheme'], ['enum', 'enum'], 8, 3, ['static', 'light']]);
    });

    for (const fixture of corpus.normalize) {
        it(`should read '${fixture.input}' as ${fixture.expected}`, () => [normalizeNavigationMode(fixture.input) ?? null].should.deep.equal([fixture.expected]));
    }

    for (const fixture of corpus.behavior) {
        it(`should describe ${fixture.mode} ${fixture.touch ? 'on a touch screen' : 'with a pointer'}`, () => plain(describeMenuBehavior(fixture.mode, fixture.touch)).should.deep.equal(fixture.expected));
    }

    for (const fixture of corpus.switch) {
        it(`should answer the mode after a switch: ${fixture.name}`, () => plain(menuModeAfterShellSwitch(fixture.current, fixture.shellDefault, fixture.shellName)).should.deep.equal(fixture.expected));
    }
});
